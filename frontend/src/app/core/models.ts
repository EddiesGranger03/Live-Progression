export interface Profile { name:string; email:string; timezone:string; goals:string[]; activeStart:string; activeEnd:string; rests:{start:string;end:string}[]; calendarEnabled:boolean; reminders:boolean; reminderLimit:number; onboarding:boolean; }
export interface Quest { id:string; title:string; description:string; duration:number; goal:string; date:string; timezone:string; status:'pending'|'completed'|'archived'; completedAt:string|null; }
export interface Block { id:string; title:string; start:string; end:string; type:'busy'|'rest'; focus:boolean|number; questId:string|null; }
export interface Session { id:string; title:string; start:string; targetEnd:string; actualEnd:string|null; status:'active'|'completed'|'ended_early'; questId:string|null; blockId:string|null; timezone?:string; }
export interface Ledger { id:string; questId:string; amount:number; reason:string; createdAt:string; localDate:string; timezone:string; }
export interface State { profile:Profile; quests:Quest[]; blocks:Block[]; sessions:Session[]; ledger:Ledger[]; xp:number; revision:number; }
export type Dialog = {kind:string; data?:any};
export interface WindowSlot {start:number;end:number;date:string;}

export function localDate(value:Date|string|number=new Date(),timezone='Asia/Ho_Chi_Minh'):string {
  return new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
}
export function timeText(value:string|number|Date,timezone='Asia/Ho_Chi_Minh'):string {
  return new Intl.DateTimeFormat('en-GB',{timeZone:timezone,hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
}
export function minutes(value:string):number {const [h,m]=value.split(':').map(Number);return h*60+m;}
export function hm(value:number):string {return `${Math.floor(value/60).toString().padStart(2,'0')}:${(value%60).toString().padStart(2,'0')}`;}
export function shiftDate(value:string,by:number):string {const d=new Date(value+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+by);return d.toISOString().slice(0,10);}
export function fromLocal(date:string,time:string,timezone:string):string {
  const target=Date.parse(date+'T'+time+':00Z');let guess=target;
  for(let i=0;i<3;i++){
    const parts=new Intl.DateTimeFormat('en-CA',{timeZone:timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(guess));
    const p=Object.fromEntries(parts.map(p=>[p.type,p.value]));
    const represented=Date.parse(`${p['year']}-${p['month']}-${p['day']}T${p['hour']}:${p['minute']}:${p['second']}Z`);
    guess+=target-represented;
  }
  return new Date(guess).toISOString();
}
export function dateLabel(date:string,long=false):string {return new Intl.DateTimeFormat('vi-VN',{weekday:long?'long':undefined,day:'2-digit',month:long?'long':'2-digit',year:long?undefined:'numeric',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'));}
