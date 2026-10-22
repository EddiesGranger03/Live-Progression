import {Injectable,signal} from '@angular/core';
import {Capacitor,registerPlugin} from '@capacitor/core';

export interface SocialApp {id:string;label:string;}
export interface ProtectionStatus {
  platform:'android'|'ios'|'web';
  supported:boolean;
  permissionGranted:boolean;
  monitoring:boolean;
  selectedCount:number;
  accessibilityPermissionGranted?:boolean;
  restrictionEnabled?:boolean;
  blockingMonitoring?:boolean;
  message:string;
}

interface NativeProtectionPlugin {
  getStatus():Promise<ProtectionStatus>;
  requestAccess():Promise<void>;
  listApps():Promise<{apps:SocialApp[]}>;
  saveSelection(options:{appIds:string[]}):Promise<void>;
  requestRestrictionAccess():Promise<void>;
  setRestrictionEnabled(options:{enabled:boolean;disclosed:boolean}):Promise<void>;
  pickApps():Promise<{selectedCount:number}>;
  startFocusProtection(options:{appIds:string[];breakInterval:number;targetEnd:string;focusTitle:string;sendReminders:boolean;blockSelectedApps:boolean}):Promise<ProtectionStatus>;
  stopFocusProtection():Promise<void>;
}

const NativeProtection=registerPlugin<NativeProtectionPlugin>('SocialProtection');
const APP_SELECTION_KEY='solo-leveling-protected-social-apps-v1';
const BLOCKING_KEY='solo-leveling-voluntary-app-blocking-v1';
const DEFAULT_APPS:SocialApp[]=[
  {id:'com.zhiliaoapp.musically',label:'TikTok'},
  {id:'com.instagram.android',label:'Instagram'},
  {id:'com.facebook.katana',label:'Facebook'}
];

@Injectable({providedIn:'root'})
export class VoluntaryProtectionService {
  readonly status=signal<ProtectionStatus>({platform:'web',supported:false,permissionGranted:false,monitoring:false,selectedCount:0,message:'Chỉ có lời nhắc trong bản web.'});
  readonly apps=signal<SocialApp[]>(DEFAULT_APPS);
  readonly selected=signal<string[]>(this.readSelection());
  readonly blockingEnabled=signal(this.readBlockingEnabled());
  private activeSession='';
  private activeFocusTitle='';
  private startedSession='';
  private activeTargetEnd='';
  private activeReminders=false;
  private activeBreakInterval=50;
  private startedReminders=false;
  private startedBlocking=false;

  constructor(){
    if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')void this.refresh().then(()=>this.resumePendingFocus());});
    void this.refresh();
  }

  platform(){return Capacitor.getPlatform() as 'android'|'ios'|'web';}
  private readSelection():string[]{
    try{return JSON.parse(localStorage.getItem(APP_SELECTION_KEY)||'[]');}catch{return [];}
  }
  private readBlockingEnabled():boolean{
    try{return localStorage.getItem(BLOCKING_KEY)==='true';}catch{return false;}
  }
  private writeSelection(ids:string[]){
    const unique=[...new Set(ids)].filter(id=>DEFAULT_APPS.some(app=>app.id===id));
    this.selected.set(unique);
    try{localStorage.setItem(APP_SELECTION_KEY,JSON.stringify(unique));}catch{}
    if(this.platform()==='android')void NativeProtection.saveSelection({appIds:unique}).catch(()=>{});
  }
  setSelected(id:string,enabled:boolean){
    const next=this.selected().filter(value=>value!==id);
    if(enabled)next.push(id);
    this.writeSelection(next);
    void this.resumePendingFocus();
  }

  async refresh(){
    const platform=this.platform();
    if(platform==='web'){
      this.status.set({platform,supported:false,permissionGranted:false,monitoring:false,selectedCount:this.selected().length,message:'Bản web không thể theo dõi ứng dụng khác.'});
      return;
    }
    try{
      const status=await NativeProtection.getStatus();
      this.status.set({...status,platform});
      if(platform==='android'){
        const {apps}=await NativeProtection.listApps();
        this.apps.set(apps);
        this.writeSelection(this.selected());
      }
    }catch{
      this.status.set({platform,supported:false,permissionGranted:false,monitoring:false,selectedCount:this.selected().length,message:'Native protection chưa sẵn sàng trên bản cài này.'});
    }
  }

  async requestAccess(){
    if(this.platform()==='web')return;
    await NativeProtection.requestAccess();
    window.setTimeout(()=>void this.refresh().then(()=>this.resumePendingFocus()),800);
  }

  async requestRestrictionAccess(){
    if(this.platform()!=='android')return;
    await NativeProtection.requestRestrictionAccess();
    window.setTimeout(()=>void this.refresh().then(()=>this.resumePendingFocus()),800);
  }

  async setRestrictionEnabled(enabled:boolean,disclosed=false){
    if(enabled&&this.platform()==='android')await NativeProtection.setRestrictionEnabled({enabled,disclosed});
    else if(!enabled&&this.platform()==='android')await NativeProtection.setRestrictionEnabled({enabled,disclosed:false});
    this.blockingEnabled.set(enabled);
    try{localStorage.setItem(BLOCKING_KEY,String(enabled));}catch{}
    await this.refresh();
    await this.resumePendingFocus();
  }

  async pickApps(){
    if(this.platform()!=='ios')return;
    const result=await NativeProtection.pickApps();
    this.status.update(status=>({...status,selectedCount:result.selectedCount}));
  }

  async beginFocus(sessionId:string,targetEnd:string,focusTitle:string,remindersEnabled:boolean,breakInterval:number,blockSelectedApps=this.blockingEnabled()){
    if((!remindersEnabled&&!blockSelectedApps)||this.platform()==='web'){
      if(this.activeSession)await this.stopFocus();
      return;
    }
    this.activeSession=sessionId;this.activeTargetEnd=targetEnd;this.activeFocusTitle=focusTitle;this.activeReminders=remindersEnabled;this.activeBreakInterval=breakInterval;
    if(!this.selected().length)return;
    await this.refresh();
    const status=this.status();
    const sendReminders=remindersEnabled&&status.permissionGranted;
    const blockApps=blockSelectedApps&&!!status.accessibilityPermissionGranted;
    if(!sendReminders&&!blockApps){
      if(this.startedSession===sessionId){
        try{await NativeProtection.stopFocusProtection();}catch{}
        this.startedSession='';this.startedReminders=false;this.startedBlocking=false;
        await this.refresh();
      }
      return;
    }
    if(this.startedSession===sessionId&&this.startedReminders===sendReminders&&this.startedBlocking===blockApps)return;
    try{
      this.status.set(await NativeProtection.startFocusProtection({appIds:this.selected(),breakInterval,targetEnd,focusTitle,sendReminders,blockSelectedApps:blockApps}));
      this.startedSession=sessionId;
      this.startedReminders=sendReminders;this.startedBlocking=blockApps;
    }catch(error){console.warn('Không thể bật nhắc giới hạn trên thiết bị.',error);}
  }

  private async resumePendingFocus(){
    if(!this.activeSession||Date.parse(this.activeTargetEnd)<=Date.now())return;
    await this.beginFocus(this.activeSession,this.activeTargetEnd,this.activeFocusTitle,this.activeReminders,this.activeBreakInterval,this.blockingEnabled());
  }

  async stopFocus(){
    this.activeSession='';
    this.activeFocusTitle='';
    this.startedSession='';this.startedReminders=false;this.startedBlocking=false;this.activeTargetEnd='';
    if(this.platform()!=='web')try{await NativeProtection.stopFocusProtection();}catch{}
    await this.refresh();
  }

  hasActiveFocusProtection(){return !!this.activeSession;}

  async clearLocalData(){
    await this.stopFocus();
    this.writeSelection([]);
    this.blockingEnabled.set(false);
    try{localStorage.removeItem(BLOCKING_KEY);}catch{}
    if(this.platform()==='android')try{await NativeProtection.setRestrictionEnabled({enabled:false,disclosed:false});}catch{}
    if(this.platform()!=='web')try{await NativeProtection.saveSelection({appIds:[]});}catch{}
  }
}
