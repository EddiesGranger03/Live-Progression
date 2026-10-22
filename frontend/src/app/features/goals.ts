import {Component,inject,signal} from '@angular/core';
import {ActivatedRoute,Router,RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormsModule} from '@angular/forms';
import {AppStore} from '../core/store';
import {Icon} from '../shared/icon';
import {Goal} from '../core/models';

@Component({standalone:true,imports:[RouterLink,Icon],template:`
<a class="back-link" routerLink="/today"><sl-icon name="arrow"/>Về Hôm nay</a>
<div class="page-heading horizontal"><div><div class="eyebrow">ĐÍCH ĐẾN CỦA BẠN</div><h1>Mục tiêu</h1><p>Chia điều bạn mong muốn thành những bước có thể bắt đầu.</p></div><a class="btn primary" routerLink="/goals/new"><sl-icon name="plus"/>Tạo mục tiêu</a></div>
<div class="segmented goal-tabs" role="group" aria-label="Lọc mục tiêu"><button [class.selected]="tab()==='active'" (click)="tab.set('active')">Đang thực hiện · {{count('active')}}</button><button [class.selected]="tab()==='archived'" (click)="tab.set('archived')">Đã lưu trữ · {{count('archived')}}</button></div>
<section class="goal-grid" aria-label="Danh sách mục tiêu">
 @for(g of goals();track g.id){<a class="panel goal-card" [routerLink]="['/goals',g.id]"><div class="goal-card-top"><span class="goal-orbit"><sl-icon name="target"/></span><span class="tag" [class.goal-priority-high]="g.priority==='high'">{{g.priority==='high'?'Ưu tiên':'Bình thường'}}</span></div><h2>{{g.title}}</h2><p>{{g.description||'Bổ sung mô tả để nhắc mình vì sao mục tiêu này quan trọng.'}}</p><div class="goal-progress"><div><span>{{completed(g)}} / {{taskCount(g)}} bước hoàn thành</span><strong>{{percent(g)}}%</strong></div><i><b [style.width.%]="percent(g)"></b></i></div><span class="goal-open">Mở mục tiêu <sl-icon name="right"/></span></a>}
 @if(!goals().length){<div class="panel empty-state goal-empty"><span class="goal-orbit"><sl-icon name="target"/></span><h2>{{tab()==='active'?'Chọn điều bạn muốn tiến tới':'Chưa có mục tiêu lưu trữ'}}</h2><p>{{tab()==='active'?'Tạo mục tiêu đầu tiên, rồi thêm các nhiệm vụ nhỏ làm bước hành động.':'Mục tiêu bạn lưu trữ sẽ xuất hiện ở đây.'}}</p>@if(tab()==='active'){<a class="btn primary" routerLink="/goals/new"><sl-icon name="plus"/>Tạo mục tiêu đầu tiên</a>}</div>}
</section>`})
export class GoalsPage {
 s=inject(AppStore);tab=signal<'active'|'archived'>('active');
 goals(){return this.s.state().goals.filter(g=>g.status===this.tab()).sort((a,b)=>Number(b.priority==='high')-Number(a.priority==='high')||b.createdAt.localeCompare(a.createdAt));}
 count(status:'active'|'archived'){return this.s.state().goals.filter(g=>g.status===status).length;}
 taskCount(g:Goal){return this.s.state().quests.filter(q=>q.goalId===g.id&&q.status!=='archived').length;}
 completed(g:Goal){return this.s.state().quests.filter(q=>q.goalId===g.id&&q.status==='completed').length;}
 percent(g:Goal){const total=this.taskCount(g);return total?Math.round(this.completed(g)/total*100):0;}
}

@Component({standalone:true,imports:[RouterLink,Icon],template:`
<a class="back-link" routerLink="/goals"><sl-icon name="arrow"/>Về mục tiêu</a>
@if(goal();as g){<div class="goal-detail-layout"><section class="panel goal-detail-main"><div class="goal-detail-top"><span class="goal-orbit"><sl-icon name="target"/></span><span class="tag" [class.goal-priority-high]="g.priority==='high'">{{g.priority==='high'?'Ưu tiên':'Bình thường'}}</span><span class="tag" [class.complete-tag]="g.status==='archived'">{{g.status==='archived'?'Đã lưu trữ':'Đang thực hiện'}}</span></div><h1>{{g.title}}</h1><p class="goal-description">{{g.description||'Mục tiêu này chưa có mô tả.'}}</p><div class="goal-progress large"><div><span>{{completed()}} / {{activeTasks().length}} nhiệm vụ hoàn thành</span><strong>{{percent()}}%</strong></div><i><b [style.width.%]="percent()"></b></i></div><div class="button-row goal-actions"><button class="btn secondary" (click)="s.open('goal-priority',g)"><sl-icon name="star"/>Chọn ưu tiên</button><a class="btn secondary" [routerLink]="['/goals',g.id,'edit']"><sl-icon name="edit"/>Sửa mục tiêu</a>@if(g.status==='active'){<button class="btn ghost" (click)="s.open('goal-archive',g)"><sl-icon name="archive"/>Lưu trữ</button>}@else{<button class="btn secondary" (click)="s.open('goal-archive',{...g,archived:false})"><sl-icon name="rotate"/>Khôi phục</button>}</div>@if(g.status==='active'){<button class="btn primary" (click)="s.open('quest',{goalId:g.id})"><sl-icon name="plus"/>Thêm nhiệm vụ cho mục tiêu</button>}@else{<p class="goal-archived-note">Mục tiêu đã lưu trữ. Nhiệm vụ và lịch sử liên quan vẫn được giữ nguyên.</p>}</section>
<section class="panel goal-task-panel"><div class="section-heading"><div><h2>Các bước hành động</h2><p class="subtle">Nhiệm vụ liên kết với mục tiêu này.</p></div><span class="subtle">{{tasks().length}} bước</span></div>
 @for(q of tasks();track q.id){<a class="goal-task-row" [routerLink]="['/quests',q.id]"><span class="goal-task-state" [class.done]="q.status==='completed'"><sl-icon [name]="q.status==='completed'?'check':'circle'"/></span><span><strong>{{q.title}}</strong><small>{{q.duration}} phút · {{q.status==='completed'?'Đã hoàn thành':q.status==='archived'?'Đã lưu trữ':'Chưa làm'}}</small></span><sl-icon name="chevron"/></a>}
 @if(!tasks().length){<div class="empty-state small-empty"><sl-icon name="book"/><h3>Chưa có bước hành động</h3><p>Thêm một nhiệm vụ nhỏ để bắt đầu tiến tới mục tiêu.</p>@if(g.status==='active'){<button class="btn secondary" (click)="s.open('quest',{goalId:g.id})">Thêm nhiệm vụ</button>}</div>}
</section></div>}@else{<div class="empty-state"><h2>Không tìm thấy mục tiêu</h2><a class="btn secondary" routerLink="/goals">Về danh sách</a></div>}`})
export class GoalDetailPage {
 s=inject(AppStore);params=toSignal(inject(ActivatedRoute).paramMap);goal=()=>this.s.state().goals.find(g=>g.id===this.params()?.get('id'));
 tasks(){const id=this.goal()?.id;return this.s.state().quests.filter(q=>q.goalId===id).sort((a,b)=>Number(a.status==='completed')-Number(b.status==='completed')||a.date.localeCompare(b.date));}
 activeTasks(){return this.tasks().filter(q=>q.status!=='archived');}
 completed(){return this.activeTasks().filter(q=>q.status==='completed').length;}
 percent(){return this.activeTasks().length?Math.round(this.completed()/this.activeTasks().length*100):0;}
}

@Component({standalone:true,imports:[FormsModule,RouterLink,Icon],template:`
<a class="back-link" routerLink="/goals"><sl-icon name="arrow"/>Hủy và quay lại</a>
<div class="goal-form-wrap"><div class="page-heading"><div class="eyebrow">MỤC TIÊU CỦA BẠN</div><h1>{{editing()?'Sửa mục tiêu':'Tạo mục tiêu'}}</h1><p>Viết một đích đến rõ ràng. Bạn có thể thêm nhiệm vụ nhỏ sau khi lưu.</p></div><form class="panel goal-form form-stack" (ngSubmit)="save()"><label>Tên mục tiêu<input name="title" [(ngModel)]="title" required maxlength="100" placeholder="Ví dụ: Hoàn thành khóa học tiếng Anh"></label><label>Vì sao mục tiêu này quan trọng? <small class="subtle">Không bắt buộc</small><textarea name="description" [(ngModel)]="description" maxlength="500" rows="4" placeholder="Mô tả ngắn điều bạn muốn đạt được…"></textarea></label>@if(error()){<p class="form-error" role="alert">{{error()}}</p>}<div class="button-row"><a class="btn ghost" [routerLink]="editing()?['/goals',id()]:['/goals']">Hủy</a><button class="btn primary" type="submit" [disabled]="busy()||!title.trim()"><sl-icon name="check"/>{{busy()?'Đang lưu…':editing()?'Lưu thay đổi':'Tạo mục tiêu'}}</button></div></form></div>`})
export class GoalFormPage {
 s=inject(AppStore);router=inject(Router);route=inject(ActivatedRoute);title='';description='';busy=signal(false);error=signal('');private existingId='new';
 constructor(){this.route.paramMap.subscribe(params=>{this.existingId=params.get('id')||'new';const found=this.s.state().goals.find(g=>g.id===this.existingId);this.title=found?.title||'';this.description=found?.description||'';});}
 id(){return this.existingId;}
 editing(){return this.existingId!=='new';}
 async save(){this.error.set('');if(!this.title.trim()){this.error.set('Vui lòng nhập tên mục tiêu.');return;}this.busy.set(true);try{const existing=this.id(),before=new Set(this.s.state().goals.map(g=>g.id));const ok=await this.s.action('goal.save',{id:existing==='new'?undefined:existing,title:this.title,description:this.description});if(!ok){this.error.set('Đã lưu yêu cầu trên thiết bị và chờ đồng bộ.');return;}const savedId=existing==='new'?this.s.state().goals.find(g=>!before.has(g.id))?.id:existing;if(savedId)await this.router.navigate(['/goals',savedId]);}catch(e:any){this.error.set(e.message||'Chưa lưu được mục tiêu.');}finally{this.busy.set(false);}}
}
