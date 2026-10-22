import {Component,computed,inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AppStore} from '../core/store';
import {Icon} from '../shared/icon';
import {XP} from '../shared/xp';
import {Timeline} from '../shared/timeline';
import {timeText,dateLabel,hm,minutes} from '../core/models';
@Component({standalone:true,imports:[RouterLink,Icon,XP,Timeline],template:`
<div class="today-layout">
 <section class="today-main">
  <div class="page-heading greeting"><div class="eyebrow">MỖI NGÀY, MỘT BƯỚC TIẾN</div><h1>Chào {{s.profile().name}}<span class="heading-dot">.</span></h1><p>Giữ sự tập trung. Tiến bộ ngoài đời.</p></div>
  <sl-xp/>
  <section class="panel now-card"><div class="now-copy"><div class="eyebrow now-eyebrow"><span class="round-icon"><sl-icon name="target"/></span>{{s.active()?'ĐANG TẬP TRUNG':current()?'BÂY GIỜ':suggested()?'MỘT HÀNH ĐỘNG NHỎ':'KHÔNG GIAN CỦA BẠN'}} @if(current()){<span>· {{time(current()!.start)}}–{{time(current()!.end)}}</span>}</div>
   <h2>{{s.active()?.title||current()?.title||suggested()?.title||'Bắt đầu từ kế hoạch của bạn'}}</h2>
   <p>{{s.active()?'Một việc thôi. Tiếp tục công việc trước mắt.':current()?.type==='rest'?'Dành một khoảng để hồi phục năng lượng.':current()?.focus?'Khung tập trung trong lịch của bạn':current()?'Đây là khoảng dành cho công việc trong lịch.':suggested()?'Đặt điện thoại xuống. Làm một điều có ích.':'Thêm lịch học, công việc và thời gian nghỉ để có gợi ý phù hợp.'}}</p>
   @if(s.active()||current()?.focus||suggested()){<span class="duration-chip"><sl-icon name="clock"/>{{duration()}} phút</span>}
   <p class="now-hint">{{current()?.type==='rest'?'Nghỉ ngơi cũng là một phần của tiến bộ.':'Một việc thôi. Bạn không cần làm tất cả cùng lúc.'}}</p>
   <div class="button-row">@if(s.active()){<a class="btn primary" [routerLink]="['/focus',s.active()!.id]"><sl-icon name="play"/>Tiếp tục Focus</a>}@else if(current()?.focus){<button class="btn primary" (click)="s.start(undefined,current()!.id)"><sl-icon name="play"/>Bắt đầu Focus</button>}@else if(current()){<a class="btn primary" routerLink="/calendar"><sl-icon name="calendar"/>Xem lịch</a>}@else if(suggested()){<a class="btn primary" [routerLink]="['/quests',suggested()!.id]"><sl-icon name="play"/>Bắt đầu nhiệm vụ</a>}@else{<button class="btn primary" (click)="s.open('block',{date:s.today()})"><sl-icon name="plus"/>Tạo khung giờ</button>}<a class="text-link" routerLink="/calendar">Xem lịch <sl-icon name="right"/></a><a class="text-link quick-entry" routerLink="/quick-action"><sl-icon name="clock"/>Tôi có vài phút</a></div>
  </div><div class="orbit-art" aria-hidden="true"><div class="orbit one"></div><div class="orbit two"></div><div class="orbit three"></div><img src="assets/mark.svg" alt=""><i class="spark s1">✦</i><i class="spark s2">✧</i><i class="spark s3">✦</i><i class="spark s4">·</i></div></section>
  <section class="panel today-quests"><div class="section-heading"><h2>Nhiệm vụ hôm nay <small>{{done()}}/{{s.todayQuests().length}} hoàn thành</small></h2><div class="button-row"><a class="text-link" routerLink="/goals"><sl-icon name="target"/>Mục tiêu</a><button class="text-link" (click)="s.open('quest')"><sl-icon name="plus"/>Thêm nhiệm vụ</button></div></div>
   @for(q of s.todayQuests().slice(0,3);track q.id){<div class="quest-row" [class.done]="q.status==='completed'"><button class="complete-circle" [class.checked]="q.status==='completed'" (click)="s.open(q.status==='completed'?'result':'complete',q)" [attr.aria-label]="q.status==='completed'?'Xem kết quả '+q.title:'Xác nhận hoàn thành '+q.title">@if(q.status==='completed'){<sl-icon name="check"/>}</button><a [routerLink]="['/quests',q.id]" class="quest-copy"><strong>{{q.title}}</strong><span>{{q.duration}} phút <i>·</i> {{q.goal}}</span></a><span class="xp-text">+20 XP</span><a class="icon-btn" [routerLink]="['/quests',q.id]" [attr.aria-label]="'Xem '+q.title"><sl-icon name="chevron"/></a></div>}
   @if(!s.todayQuests().length){<div class="empty-state small-empty"><sl-icon name="book"/><p>Hôm nay bạn muốn làm điều gì cho mình?</p><button class="btn secondary" (click)="s.open('quest')">Thêm nhiệm vụ đầu tiên</button></div>}
   <a class="text-link see-all" routerLink="/quests">Xem tất cả <sl-icon name="right"/></a>
  </section>
  <section class="panel week-summary"><div class="section-heading"><h2>7 ngày qua</h2><a class="text-link" routerLink="/progress">Xem tiến bộ <sl-icon name="right"/></a></div><div class="summary-grid"><div><strong>{{s.stats().count}}</strong><span>Nhiệm vụ hoàn thành</span></div><div><strong>{{s.stats().minutes}}</strong><span>Phút trên timer</span></div><div><strong class="xp-light">+{{s.stats().xp}}</strong><span>XP</span></div></div></section>
 </section>
 <aside class="panel today-calendar"><div class="section-heading"><a routerLink="/calendar"><h2>Lịch hôm nay</h2></a><div class="button-row"><a class="icon-btn" routerLink="/calendar" aria-label="Mở lịch"><sl-icon name="calendar"/></a><button class="icon-btn bordered" (click)="s.open('block',{date:s.today()})" aria-label="Thêm khung giờ"><sl-icon name="plus"/></button></div></div><div class="calendar-date-row"><strong>{{date(s.today(),true)}}</strong><button class="calendar-source" (click)="s.open('calendar-settings')">Lịch cá nhân <span>⌄</span></button></div>
  <sl-timeline [date]="s.today()"/>
  @if(slot()&&s.suggestions(slot()!).length){@let q=s.suggestions(slot()!)[0];<div class="suggestion-card"><div class="eyebrow"><sl-icon name="bulb"/><span>GỢI Ý CHO KHOẢNG TRỐNG</span><small>{{hour(slot()!.start)}}–{{hour(slot()!.end)}}</small></div><a [routerLink]="['/quests',q.id]"><h3>{{q.title}}</h3></a><p>{{q.duration}} phút <i>·</i> <span class="xp-text">+20 XP</span></p><div class="button-row"><button class="btn secondary" (click)="s.open('schedule',{quest:q,slot:slot()})"><sl-icon name="calendar"/>Đặt vào lịch</button><button class="text-link" (click)="s.open('gap',slot())">Dành để nghỉ</button></div></div>}@else{<div class="calendar-note"><sl-icon name="leaf"/><p>Có kế hoạch cho công việc.<br>Cũng có khoảng cho chính mình.</p></div>}
 </aside>
</div>`})
export class Today {
 s=inject(AppStore);time=(v:string)=>timeText(v,this.s.profile().timezone);date=dateLabel;hour=hm;
 current=computed(()=>this.s.profile().calendarEnabled?this.s.blocksOn(this.s.today()).find(b=>Date.parse(b.start)<=this.s.now()&&this.s.now()<Date.parse(b.end)):undefined);
 slot=computed(()=>{const w=this.s.windows(this.s.today());return w.find(x=>x.start>=15*60&&x.end<=16*60)||w.find(x=>this.s.suggestions(x).length);});
 suggested=computed(()=>{const t=minutes(timeText(this.s.now(),this.s.profile().timezone));const window=this.s.windows(this.s.today()).find(w=>w.start<=t&&w.end>t+15);return window?this.s.suggestions({...window,start:t})[0]:undefined;});
 done=()=>this.s.todayQuests().filter(q=>q.status==='completed').length;
 duration(){const a=this.s.active(),b=this.current();return a?Math.ceil((Date.parse(a.targetEnd)-this.s.now())/60000):b?Math.round((Date.parse(b.end)-Date.parse(b.start))/60000):this.suggested()?.duration;}
}
