import {Component,inject,signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {AppStore} from '../core/store';
import {Icon} from '../shared/icon';
import {XP} from '../shared/xp';
import {dateLabel,shiftDate} from '../core/models';
@Component({standalone:true,imports:[FormsModule,RouterLink,Icon,XP],template:`
<div class="page-heading horizontal"><div><div class="eyebrow">NHỮNG BƯỚC TIẾN NHỎ CỦA BẠN</div><h1>Tiến bộ của bạn</h1><p>Nhìn lại những hành động bạn đã thực hiện.</p></div><div class="button-row"><span class="period-label">7 ngày qua</span><label class="date-picker"><sl-icon name="calendar"/><span>{{label(shift(end(),-6))}} – {{label(end())}}</span><input type="date" [max]="s.today()" [ngModel]="end()" (ngModelChange)="setEnd($event)" aria-label="Chọn ngày kết thúc kỳ 7 ngày"></label></div></div>
<sl-xp/>
<div class="progress-stats"><section class="panel metric"><span class="round-icon"><sl-icon name="check"/></span><div><strong>{{s.stats(end()).count}}</strong><span>Nhiệm vụ hoàn thành</span></div></section><section class="panel metric"><span class="round-icon"><sl-icon name="clock"/></span><div><strong>{{s.stats(end()).minutes}}</strong><span>Phút trên timer</span></div></section><section class="panel metric"><span class="round-icon"><sl-icon name="star"/></span><div><strong>+{{s.stats(end()).xp}}</strong><span>XP</span></div></section></div>
<p class="data-note">Nhiệm vụ do bạn tự xác nhận. Phút tính theo timer. @if(s.demo()){Đây là dữ liệu minh họa.}</p>
<section class="panel progress-journal"><div class="section-heading"><h2>Nhật ký 7 ngày</h2><span class="subtle">Mỗi hành động đều được ghi nhận</span></div><div class="week-bars" aria-label="Số nhiệm vụ hoàn thành mỗi ngày">@for(d of s.stats(end()).days;track d.date){<button (click)="s.open('day',d.date)" [attr.aria-label]="label(d.date)+': '+d.count+' nhiệm vụ'"><span>{{d.count}}</span><i [style.height.px]="Math.max(4,d.count*22)"></i><small>{{shortDate(d.date)}}</small></button>}</div>
<div class="journal-table">@for(d of s.stats(end()).days;track d.date){<button class="journal-row" [class.today-row]="d.date===s.today()" (click)="s.open('day',d.date)"><span>{{shortDate(d.date)}} <small>{{weekday(d.date)}}</small></span><span>{{d.count}} nhiệm vụ</span><span>{{d.minutes}} phút</span><strong class="xp-text">+{{d.xp}} XP</strong><sl-icon name="chevron"/></button>}</div></section>
<section class="panel encouragement"><span class="round-icon"><sl-icon name="right"/></span><div><strong>Tiếp tục với một hành động nhỏ</strong><p>Duy trì nhịp độ, theo cách phù hợp với bạn.</p></div><a routerLink="/today" class="btn primary"><sl-icon name="home"/>Về Hôm nay</a></section>`})
export class Progress {s=inject(AppStore);end=signal(this.s.today());label=dateLabel;shift=shiftDate;Math=Math;setEnd(d:string){if(d&&d<=this.s.today())this.end.set(d);}shortDate=(d:string)=>dateLabel(d).slice(0,5);weekday=(d:string)=>new Intl.DateTimeFormat('vi-VN',{weekday:'short',timeZone:'UTC'}).format(new Date(d+'T12:00:00Z'));}
