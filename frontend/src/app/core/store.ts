import {Injectable,computed,signal} from '@angular/core';
import {Router} from '@angular/router';
import {State,Profile,Quest,Block,Session,Dialog,WindowSlot,localDate,timeText,minutes,fromLocal,shiftDate} from './models';
import {seedState} from './seed';

declare global {interface Window {SOLO_CONFIG?:{mode:string;api:string};}}
const CACHE='solo-leveling-demo-v2';

@Injectable({providedIn:'root'})
export class AppStore {
  readonly state=signal<State>(seedState());
  readonly demo=signal(window.SOLO_CONFIG?.mode!=='server');
  readonly authenticated=signal(false);
  readonly loading=signal(true);
  readonly busy=signal(false);
  readonly now=signal(Date.now());
  readonly online=signal(navigator.onLine);
  readonly pending=signal<{kind:string;data:any;mutationId:string;revision:number;error?:string}[]>([]);
  readonly pendingXp=computed(()=>this.pending().reduce((n,p)=>n+(p.kind==='quest.complete'?20:p.kind==='quest.undo'?-20:0),0));
  readonly dialog=signal<Dialog|null>(null);
  readonly toast=signal('');
  readonly toastUndo=signal<(()=>void)|null>(null);
  readonly profile=computed(()=>this.state().profile);
  readonly today=computed(()=>localDate(this.now(),this.profile().timezone));
  readonly level=computed(()=>1+Math.floor(this.state().xp/200));
  readonly xpPart=computed(()=>this.state().xp%200);
  readonly active=computed(()=>this.state().sessions.find(s=>s.status==='active')??null);
  readonly todayQuests=computed(()=>this.state().quests.filter(q=>q.date===this.today()&&q.status!=='archived'));
  private toastTimer:any;
  private api=window.SOLO_CONFIG?.api||'/api/v1';
  constructor(private router:Router){
    this.load();
    setInterval(()=>{this.now.set(Date.now());this.settle();},1000);
    window.addEventListener('online',()=>{this.online.set(true);if(!this.demo())this.syncPending();});
    window.addEventListener('offline',()=>this.online.set(false));
    window.addEventListener('storage',e=>{if(e.key===CACHE&&this.demo()&&e.newValue){try{this.state.set(JSON.parse(e.newValue));}catch{}}});
    window.addEventListener('focus',()=>{if(!this.demo()&&this.authenticated())this.refresh();});
  }
  async load(){
    if(this.demo()){
      try{const cached=localStorage.getItem(CACHE);if(cached)this.state.set(JSON.parse(cached));}catch{}
      this.authenticated.set(true);
    }else{
      try{this.state.set(await this.request('/state'));this.cacheServer();this.authenticated.set(true);}catch{const cached=sessionStorage.getItem('solo-server-cache');if(!this.online()&&cached){this.state.set(JSON.parse(cached));this.authenticated.set(true);}else this.router.navigateByUrl('/login');}
    }
    if(!this.demo()){try{const saved=JSON.parse(sessionStorage.getItem('solo-pending')||'{}');if(saved.email===this.profile().email)this.pending.set(saved.actions||[]);}catch{}}
    this.loading.set(false);this.settle();if(this.online()&&this.pending().length)this.syncPending();
  }
  async request(path:string,body?:any):Promise<any>{
    const response=await fetch(this.api+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
    const result=await response.json();
    if(!response.ok){if(response.status===401&&path==='/state'){this.authenticated.set(false);this.router.navigateByUrl('/login');}const error=Object.assign(new Error(typeof result.detail==='string'?result.detail:'Kiểm tra lại thông tin bạn nhập.'),{status:response.status});throw error;}
    return result;
  }
  cacheServer(){sessionStorage.setItem('solo-server-cache',JSON.stringify(this.state()));}
  saveQueue(){sessionStorage.setItem('solo-pending',JSON.stringify({email:this.profile().email,actions:this.pending()}));}
  queue(kind:string,data:any,mutationId:string){if(!this.pending().some(p=>p.mutationId===mutationId)){this.pending.update(p=>[...p,{kind,data:structuredClone(data),mutationId,revision:this.state().revision}]);this.saveQueue();}this.notify('Đã lưu thao tác trên thiết bị · Chờ đồng bộ');return false;}
  clearQueue(){this.pending.set([]);sessionStorage.removeItem('solo-pending');}
  dropPending(id:string){this.pending.update(q=>q.filter(p=>p.mutationId!==id));this.saveQueue();}
  async retryPending(id:string){await this.refresh();this.pending.update(q=>q.map(p=>p.mutationId===id?{...p,revision:this.state().revision,error:undefined}:p));this.saveQueue();await this.syncPending();}
  private syncing=false;
  async syncPending(){
    if(this.syncing||!this.online()||this.demo())return;this.syncing=true;let applied=0;
    try{await this.refresh();for(const item of this.pending()){
      if(item.error)continue;
      try{
        const result=await this.request('/actions',{...item,revision:item.revision+applied});
        this.state.set(result);this.cacheServer();this.dropPending(item.mutationId);applied++;
        if(item.kind==='quest.complete'&&this.dialog()?.kind==='complete'&&this.dialog()?.data?.id===item.data.id)this.open('result',this.quest(item.data.id));
        else if(['quest.save','block.save','profile.save'].includes(item.kind)&&this.dialog())this.close();
      }catch(e:any){if(e.status){this.pending.update(q=>q.map(p=>p.mutationId===item.mutationId?{...p,error:e.message}:p));this.saveQueue();}else break;}
    }if(applied)this.notify('Đã đồng bộ '+applied+' thao tác');}finally{this.syncing=false;}
  }
  async refresh(){try{this.state.set(await this.request('/state'));this.cacheServer();}catch{}}
  persist(){try{localStorage.setItem(CACHE,JSON.stringify(this.state()));}catch{this.notify('Bộ nhớ thiết bị đã đầy. Thay đổi chưa được lưu.');}}
  enterDemo(){this.demo.set(true);this.authenticated.set(true);this.state.set(seedState());this.persist();this.router.navigateByUrl('/today');}
  async auth(kind:string,data:any){if(this.demo())throw new Error('Bản trải nghiệm không tạo tài khoản. Mở bản FastAPI để đăng ký hoặc đăng nhập.');this.state.set(await this.request('/auth/'+kind,data));this.cacheServer();this.authenticated.set(true);this.router.navigateByUrl(this.profile().onboarding?'/today':'/onboarding/goals');}
  async logout(){if(!this.demo())await this.request('/auth/logout',{});sessionStorage.removeItem('solo-server-cache');this.clearQueue();this.authenticated.set(false);this.demo.set(window.SOLO_CONFIG?.mode!=='server');this.state.set(seedState());this.dialog.set(null);this.router.navigateByUrl('/login');}
  async removeAccount(){if(this.demo()){localStorage.removeItem(CACHE);}else await this.request('/auth/delete',{confirmation:'XÓA'});sessionStorage.removeItem('solo-server-cache');this.clearQueue();this.authenticated.set(false);this.dialog.set(null);this.state.set(seedState());this.router.navigateByUrl('/login');}
  open(kind:string,data?:any){this.dialog.set({kind,data});}
  close(){this.dialog.set(null);}
  notify(message:string,undo:(()=>void)|null=null){clearTimeout(this.toastTimer);this.toast.set(message);this.toastUndo.set(undo);this.toastTimer=setTimeout(()=>{this.toast.set('');this.toastUndo.set(null);},6500);}
  async action(kind:string,data:any,mutationId=crypto.randomUUID()):Promise<boolean>{
    if(this.busy())return false;
    this.busy.set(true);
    try{
      if(this.demo()){
        // Re-read shared state before mutation to keep tabs consistent.
        try{const cached=localStorage.getItem(CACHE);if(cached)this.state.set(JSON.parse(cached));}catch{}
        const next=structuredClone(this.state());this.applyDemo(next,kind,data,mutationId);next.revision++;this.state.set(next);this.persist();
      }else{
        if(!this.online())return this.queue(kind,data,mutationId);
        try{this.state.set(await this.request('/actions',{kind,data,mutationId,revision:this.state().revision}));}catch(e){if(e instanceof TypeError)return this.queue(kind,data,mutationId);throw e;}
        this.cacheServer();
      }
      return true;
    }catch(error:any){if(error.status===409)await this.refresh();throw error;}finally{this.busy.set(false);}
  }
  private applyDemo(s:State,kind:string,d:any,mutation:string){
    const timestamp=new Date().toISOString(), id=()=>crypto.randomUUID();
    const quest=s.quests.find(q=>q.id===d.id);
    if(kind==='quest.save'){
      if(!d.title?.trim()||d.title.trim().length>100||d.description?.length>500||d.duration<5||d.duration>120)throw new Error('Tên 1–100 ký tự, mô tả tối đa 500 ký tự, thời lượng 5–120 phút.');
      if(quest?.status==='completed'&&(quest.duration!==d.duration||quest.date!==d.date||quest.goal!==d.goal))throw new Error('Nhiệm vụ đã hoàn thành chỉ sửa tên và ghi chú.');
      if(quest)Object.assign(quest,d,{title:d.title.trim()});
      else s.quests.push({...d,title:d.title.trim(),id:id(),timezone:s.profile.timezone,status:'pending',completedAt:null});
    }else if(kind==='quest.complete'&&quest){
      if(quest.status==='archived')throw new Error('Nhiệm vụ đã lưu trữ.');
      if(quest.status!=='completed'){quest.status='completed';quest.completedAt=timestamp;s.ledger.push({id:mutation,questId:quest.id,amount:20,reason:'completion',createdAt:timestamp,localDate:localDate(timestamp,s.profile.timezone),timezone:s.profile.timezone});s.xp+=20;}
    }else if(kind==='quest.undo'&&quest&&quest.status==='completed'){
      if(Date.now()-Date.parse(quest.completedAt!)>600000)throw new Error('Đã hết thời gian hoàn tác 10 phút.');
      const previous=s.ledger.filter(l=>l.questId===quest.id&&l.amount>0).at(-1)!;
      quest.status='pending';quest.completedAt=null;s.ledger.push({id:mutation,questId:quest.id,amount:-20,reason:'undo',createdAt:timestamp,localDate:previous.localDate,timezone:previous.timezone});s.xp=Math.max(0,s.xp-20);
    }else if(kind==='quest.archive'&&quest)quest.status='archived';
    else if(kind==='profile.save'){
      if(!d.name.trim()||d.goals.length>2||d.activeStart>=d.activeEnd||d.rests.some((r:any)=>r.start>=r.end))throw new Error('Kiểm tra tên, mục tiêu và thứ tự các giờ.');
      s.profile={...s.profile,...d};
    }else if(kind==='block.save'){
      if(!d.title.trim()||Date.parse(d.end)<=Date.parse(d.start))throw new Error('Tên và thời gian khung giờ chưa hợp lệ.');
      const conflicts=s.blocks.filter(b=>b.id!==d.id&&Date.parse(d.start)<Date.parse(b.end)&&Date.parse(b.start)<Date.parse(d.end));
      if(conflicts.length&&(d.questId||!d.acceptConflict))throw new Error('Khung giờ bị trùng với lịch đã có.');
      if(d.questId){
        const q=s.quests.find(q=>q.id===d.questId);
        if(!q||q.status!=='pending')throw new Error('Nhiệm vụ không còn chờ thực hiện.');
        if(s.blocks.some(b=>b.questId===q.id&&b.id!==d.id))throw new Error('Nhiệm vụ đã có lịch thực hiện.');
        const a=timeText(d.start,s.profile.timezone),b=timeText(d.end,s.profile.timezone);
        if(a<s.profile.activeStart||b>s.profile.activeEnd||localDate(d.start,s.profile.timezone)!==localDate(d.end,s.profile.timezone))throw new Error('Chọn thời gian trong giờ hoạt động.');
        if(s.profile.rests.some(r=>a<r.end&&r.start<b))throw new Error('Khung này thuộc giờ nghỉ.');
        if(s.blocks.some(b=>b.id!==d.id&&Date.parse(d.start)<Date.parse(b.end)+300000&&Date.parse(b.start)-300000<Date.parse(d.end)))throw new Error('Cần giữ đệm 5 phút giữa nhiệm vụ và lịch đã có.');
      }
      const old=s.blocks.find(b=>b.id===d.id);const values={...d,id:old?.id||id(),focus:d.type==='rest'?false:d.focus};delete values.acceptConflict;
      if(old)Object.assign(old,values);else s.blocks.push(values);
    }else if(kind==='block.delete')s.blocks=s.blocks.filter(b=>b.id!==d.id);
    else if(kind==='focus.start'){
      if(s.sessions.some(x=>x.status==='active'))throw new Error('Bạn đã có một phiên Focus đang chạy.');
      const q=s.quests.find(q=>q.id===d.questId), b=s.blocks.find(b=>b.id===d.blockId);
      if(q&&q.status!=='pending')throw new Error('Nhiệm vụ không còn chờ thực hiện.');
      if(b&&(!b.focus||b.type==='rest'||Date.now()<Date.parse(b.start)||Date.now()>=Date.parse(b.end)))throw new Error('Khung Focus chưa bắt đầu hoặc đã kết thúc.');
      const duration=q?q.duration:b?Math.min(120,(Date.parse(b.end)-Date.now())/60000):0;
      if(duration<5)throw new Error('Còn dưới 5 phút. Chọn một nhiệm vụ để bắt đầu phiên tay.');
      s.sessions.push({id:id(),title:q?.title||b!.title,questId:q?.id||b?.questId||null,blockId:b?.id||null,start:timestamp,targetEnd:new Date(Date.now()+duration*60000).toISOString(),actualEnd:null,status:'active',timezone:s.profile.timezone});
    }else if(kind==='focus.end'){
      const session=s.sessions.find(s=>s.id===d.id);if(session&&session.status==='active'){session.status='ended_early';session.actualEnd=timestamp;}
    }
  }
  private settle(){
    const expired=this.state().sessions.filter(s=>s.status==='active'&&Date.parse(s.targetEnd)<=this.now());
    if(!expired.length)return;
    if(this.demo()){this.state.update(s=>({...s,sessions:s.sessions.map(x=>expired.includes(x)?{...x,status:'completed',actualEnd:x.targetEnd}:x)}));this.persist();}
    else if(!this.online()){this.state.update(s=>({...s,sessions:s.sessions.map(x=>expired.includes(x)?{...x,status:'completed',actualEnd:x.targetEnd}:x)}));this.cacheServer();}
    else if(!this.busy())this.refresh();
    this.remindEnded(expired[0]);
  }
  private remindEnded(session:Session){
    if(!this.profile().reminders)return;
    const today=this.today(),clock=timeText(this.now(),this.profile().timezone);
    if(clock<this.profile().activeStart||clock>=this.profile().activeEnd)return;
    const saved=JSON.parse(sessionStorage.getItem('solo-reminders')||'{}');
    if(saved.last&&this.now()-saved.last<3600000)return;
    const count=saved.date===today?saved.count:0;
    if(count>=this.profile().reminderLimit)return;
    sessionStorage.setItem('solo-reminders',JSON.stringify({date:today,last:this.now(),count:count+1}));
    this.notify('Timer đã kết thúc. Bạn đã làm được gì?');
    if('Notification'in window&&Notification.permission==='granted')new Notification('Solo Leveling — Timer đã kết thúc',{body:session.title+' · Xác nhận kết quả khi bạn sẵn sàng.',icon:'/assets/mark.svg'});
  }
  async start(questId?:string,blockId?:string){
    if(this.active()){this.router.navigate(['/focus',this.active()!.id]);return;}
    try{if(await this.action('focus.start',{questId,blockId})){this.close();this.router.navigate(['/focus',this.active()!.id]);}}catch(e:any){this.notify(e.message);}
  }
  canUndo(q:Quest){return q.completedAt&&this.now()-Date.parse(q.completedAt)<600000;}
  quest(id:string){return this.state().quests.find(q=>q.id===id);}
  block(id:string){return this.state().blocks.find(q=>q.id===id);}
  scheduled(id:string){return this.state().blocks.find(b=>b.questId===id);}
  blocksOn(date:string){
    const start=Date.parse(fromLocal(date,'00:00',this.profile().timezone)),end=Date.parse(fromLocal(shiftDate(date,1),'00:00',this.profile().timezone));
    return this.state().blocks.filter(b=>Date.parse(b.start)<end&&Date.parse(b.end)>start).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start));
  }
  windows(date:string):WindowSlot[]{
    if(!this.profile().calendarEnabled||!this.blocksOn(date).length)return [];
    const p=this.profile(),a=minutes(p.activeStart),z=minutes(p.activeEnd);
    const occupied=this.blocksOn(date).map(b=>[Math.max(a,localDate(b.start,p.timezone)<date?-5:minutes(timeText(b.start,p.timezone))-5),Math.min(z,localDate(b.end,p.timezone)>date?1445:minutes(timeText(b.end,p.timezone))+5)]);
    occupied.push(...p.rests.map(r=>[minutes(r.start),minutes(r.end)]));occupied.sort((a,b)=>a[0]-b[0]);
    let cursor=a;const slots:WindowSlot[]=[];
    for(const [start,end] of occupied){if(end<=cursor||start>=z)continue;if(start-cursor>=15)slots.push({start:cursor,end:start,date});cursor=Math.max(cursor,end);}
    if(z-cursor>=15)slots.push({start:cursor,end:z,date});return slots;
  }
  suggestions(slot:WindowSlot):Quest[]{return this.state().quests.filter(q=>q.status==='pending'&&this.profile().goals.includes(q.goal)&&q.duration<=slot.end-slot.start-5&&!this.scheduled(q.id)).slice(0,2);}
  dayStats(date:string){
    const ledger=this.state().ledger.filter(l=>l.localDate===date&&l.reason!=='sample'), xp=ledger.reduce((n,l)=>n+l.amount,0);
    const seconds=this.state().sessions.reduce((n,s)=>{const zone=s.timezone||'Asia/Ho_Chi_Minh';const end=Date.parse(fromLocal(shiftDate(date,1),'00:00',zone)),start=Date.parse(fromLocal(date,'00:00',zone));const b=s.actualEnd?Date.parse(s.actualEnd):Math.min(this.now(),Date.parse(s.targetEnd));return n+Math.max(0,Math.min(end,b)-Math.max(start,Date.parse(s.start)))/1000;},0);
    return {date,count:Math.max(0,xp/20),xp,minutes:Math.floor(seconds/60)};
  }
  stats(end=this.today()){const days=Array.from({length:7},(_,i)=>this.dayStats(shiftDate(end,i-6)));return {days,count:days.reduce((n,d)=>n+d.count,0),minutes:days.reduce((n,d)=>n+d.minutes,0),xp:days.reduce((n,d)=>n+d.xp,0)};}
}
