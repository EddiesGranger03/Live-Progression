import {Component,inject,input} from '@angular/core';
import {AppStore} from '../core/store';
import {Block,localDate,timeText,fromLocal,minutes,hm} from '../core/models';
import {Icon} from './icon';
@Component({selector:'sl-timeline',standalone:true,imports:[Icon],template:`
<div class="timeline" [class.large]="large()">
@for(item of items();track item.id){
 <div class="timeline-row" [class.current]="isCurrent(item)" [class.rest]="item.type==='rest'" [class.gap]="item.type==='gap'">
  <div class="timeline-time"><span>{{time(item.start)}}</span><span>{{time(item.end)}}</span></div><div class="timeline-line"><i></i></div>
  <button class="timeline-block" [class.focus-block]="item.focus" [class.rest-block]="item.type==='rest'" [class.gap-block]="item.type==='gap'" (click)="open(item)">
   <sl-icon [name]="item.type==='rest'?'leaf':item.type==='gap'?'plus':item.focus?'sun':item.title.includes('nhóm')?'users':'file'"/>
   <span class="timeline-title"><strong>{{item.title}}</strong>@if(item.type==='gap'){<small>Chọn nhiệm vụ hoặc nghỉ</small>}@else if(item.focus){<small class="tag focus-tag">Focus</small>}</span>
   @if(isCurrent(item)){<small class="now-tag">Bây giờ</small>}
  </button>
 </div>
}
@if(!items().length){<div class="empty-state small-empty"><sl-icon name="calendar"/><h3>Ngày mới, kế hoạch mới</h3><p>Thêm lịch học, công việc hoặc thời gian nghỉ của bạn.</p><button class="btn secondary" (click)="s.open('block',{date:date()})"><sl-icon name="plus"/>Tạo khung giờ</button></div>}
</div>`})
export class Timeline {
 s=inject(AppStore);date=input.required<string>();large=input(false);
 time=(v:string)=>timeText(v,this.s.profile().timezone);
 items():any[]{
   if(!this.s.profile().calendarEnabled)return [];
   const blocks=this.s.blocksOn(this.date()),result:any[]=[];
   blocks.forEach((b,i)=>{result.push(b);const next=blocks[i+1];
     if(next&&Date.parse(next.start)-Date.parse(b.end)>=900000){result.push({id:'gap-'+b.id,title:'Chưa lên lịch',start:b.end,end:next.start,type:'gap',focus:false});}
   });return result;
 }
 isCurrent(b:any){return Date.parse(b.start)<=this.s.now()&&this.s.now()<Date.parse(b.end);}
 open(item:any){if(item.type==='gap'){
   const dayStart=Date.parse(fromLocal(this.date(),'00:00',this.s.profile().timezone));
   const slot=this.s.windows(this.date()).find(w=>w.start>=(Date.parse(item.start)-dayStart)/60000&&w.end<=(Date.parse(item.end)-dayStart)/60000);
   this.s.open('gap',slot||{start:minutes(timeText(item.start,this.s.profile().timezone))+5,end:minutes(timeText(item.end,this.s.profile().timezone))-5,date:this.date(),unavailable:true});
 }else this.s.open('block-detail',item);}
}
