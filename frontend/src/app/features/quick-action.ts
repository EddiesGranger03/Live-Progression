import {Component,computed,inject,signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {AppStore} from '../core/store';
import {QuickSession} from '../core/models';
import {Icon} from '../shared/icon';

@Component({standalone:true,imports:[FormsModule,RouterLink,Icon],template:`
<a class="back-link" routerLink="/today"><sl-icon name="left"/>Hôm nay</a>
<div class="page-heading"><div class="eyebrow">MỘT BƯỚC NHỎ CŨNG LÀ TIẾN BỘ</div><h1>Tôi có vài phút</h1><p>Chọn một việc ngắn phù hợp với thời gian bạn có.</p></div>
@if(s.active();as focus){<section class="panel quick-blocked"><sl-icon name="target"/><div><h2>Focus đang chạy</h2><p>Hãy tiếp tục hoặc kết thúc phiên Focus trước khi bắt đầu một việc ngắn.</p><a class="btn secondary" [routerLink]="['/focus',focus.id]">Tiếp tục Focus <sl-icon name="right"/></a></div></section>}
@else if(s.activeQuick();as active){
  <section class="panel quick-running"><div class="eyebrow">{{active.status==='elapsed'?'THỜI GIAN ĐÃ HẾT':'MỘT KHOẢNG NGẮN CHO BẠN'}}</div><h2>{{active.title}}</h2><p>{{active.goal}}@if(active.questId){<span> · Nhiệm vụ vẫn đang chờ xác nhận</span>}</p><div class="quick-clock"><sl-icon name="clock"/><strong>{{remaining(active)}}</strong></div>
    @if(active.status==='elapsed'){<p class="quick-result-note">Timer đã kết thúc. Chọn kết quả bên dưới; nhiệm vụ và XP không tự thay đổi.</p>}@else{<p class="quick-result-note">Bạn có thể kết thúc sớm bất cứ lúc nào. Timer không tự hoàn thành nhiệm vụ.</p>}
    <div class="quick-outcomes"><button class="btn primary" (click)="finish(active,'done')"><sl-icon name="check"/>Đã làm việc này</button><button class="btn secondary" (click)="finish(active,'unfinished')">Chưa xong</button><button class="btn secondary" (click)="finish(active,'rest')"><sl-icon name="leaf"/>Nghỉ</button><button class="text-link" (click)="finish(active,'skipped')">Bỏ qua</button></div>
  </section>
} @else {
  <section class="panel quick-setup">
    <div class="section-heading"><h2>Bạn có bao nhiêu phút?</h2><span class="subtle">Không cần tối thiểu 5 phút</span></div>
    <div class="quick-durations" role="group" aria-label="Chọn thời lượng">@for(value of durations;track value){<button type="button" [class.selected]="duration()===value" [attr.aria-pressed]="duration()===value" (click)="duration.set(value)"><strong>{{value}}</strong><span>phút</span></button>}</div>
    <h2>Chọn việc muốn bắt đầu</h2><p class="subtle">Tối đa ba gợi ý từ nhiệm vụ đang chờ. Bạn cũng có thể tự nhập một việc nhỏ.</p>
    @if(recommendations().length){<div class="quick-picks">@for(q of recommendations();track q.id){<button type="button" class="quick-pick" [class.selected]="questId()===q.id" (click)="selectQuest(q.id)"><span class="quick-radio"></span><span><strong>{{q.title}}</strong><small>{{q.duration}} phút · {{q.goal}} · nhiệm vụ vẫn chờ sau timer</small></span><sl-icon name="chevron"/></button>}</div>}@else{<div class="empty-state quick-empty"><p>Chưa có nhiệm vụ trong khoảng này. Bạn có thể nhập một bước nhỏ bên dưới.</p></div>}
    <label class="quick-label">Việc nhỏ của bạn<input [ngModel]="title()" (ngModelChange)="title.set($event)" maxlength="100" placeholder="Ví dụ: Đọc một đoạn, mở tài liệu, dọn bàn…"></label>
    <label class="quick-label">Mục tiêu<select [ngModel]="goal()" (ngModelChange)="goal.set($event)"><option value="Cá nhân">Cá nhân</option>@for(value of s.profile().goals;track value){<option [value]="value">{{value}}</option>}</select></label>
    @if(error()){<p class="form-error" role="alert">{{error()}}</p>}
    <div class="quick-disclaimer"><sl-icon name="info"/><p>Hành động 2/5/10 phút có timer riêng. Chọn “Đã làm việc này” chỉ lưu kết quả của khoảng ngắn; để nhận +20 XP, hãy hoàn thành nhiệm vụ và xác nhận riêng.</p></div>
    <div class="button-row"><a class="btn ghost" routerLink="/today">Hủy</a><button class="btn primary" [disabled]="s.busy()||!title().trim()" (click)="start()"><sl-icon name="play"/>Bắt đầu {{duration()}} phút</button></div>
  </section>
}
`})
export class QuickActionPage {
  s=inject(AppStore);durations=[2,5,10] as const;duration=signal<2|5|10>(5);questId=signal('');title=signal('');goal=signal('Cá nhân');error=signal('');
  recommendations=computed(()=>this.s.state().quests.filter(q=>q.status==='pending'&&q.date>=this.s.today()&&q.duration<=this.duration()).slice().sort((a,b)=>a.duration-b.duration).slice(0,3));
  selectQuest(id:string){this.questId.set(id);const q=this.s.quest(id);if(q){this.title.set(q.title);this.goal.set(q.goal);}}
  remaining(session:QuickSession){if(session.status==='elapsed')return '00:00';const seconds=Math.max(0,Math.ceil((Date.parse(session.targetEnd)-this.s.now())/1000));return `${Math.floor(seconds/60).toString().padStart(2,'0')}:${(seconds%60).toString().padStart(2,'0')}`;}
  async start(){this.error.set('');try{const q=this.questId()?this.s.quest(this.questId()):undefined;const saved=await this.s.action('quick.start',{title:this.title().trim(),goal:q?.goal||this.goal(),questId:q?.id||null,duration:this.duration()});if(!saved)this.error.set('Phiên chưa bắt đầu. Hãy kết nối mạng rồi thử lại.');}catch(e:any){this.error.set(e.message||'Chưa thể bắt đầu việc ngắn.');}}
  async finish(session:QuickSession,outcome:NonNullable<QuickSession['outcome']>){this.error.set('');try{await this.s.action('quick.finish',{id:session.id,outcome});const text={done:'Đã ghi nhận khoảng ngắn; nhiệm vụ vẫn cần xác nhận riêng.',unfinished:'Đã lưu. Bạn có thể tiếp tục nhiệm vụ sau.',rest:'Đã dành thời gian nghỉ. Không bị trừ điểm.',skipped:'Đã bỏ qua. Không bị trừ điểm.'}[outcome];this.s.notify(text);}catch(e:any){this.error.set(e.message||'Chưa lưu được kết quả.');}}
}
