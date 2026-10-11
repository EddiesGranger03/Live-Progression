import {Component,inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AppStore} from '../core/store';
@Component({selector:'sl-xp',standalone:true,imports:[RouterLink],template:`<a routerLink="/progress" class="xp-card panel" aria-label="Xem Level và tiến bộ"><img class="hunter-avatar" src="assets/avatar.svg" alt="Avatar người lữ hành"><div class="xp-body"><div class="xp-top"><strong>Level {{s.level()}}</strong><span>{{s.xpPart()}} / 200 XP</span></div><div class="xp-track"><div [style.width.%]="s.xpPart()/2"></div></div><div class="xp-caption">Còn {{200-s.xpPart()}} XP lên cấp {{s.level()+1}}</div>@if(s.pendingXp()){<div class="pending-xp">{{s.pendingXp()>0?'+':''}}{{s.pendingXp()}} XP dự kiến · Chờ đồng bộ</div>}</div></a>`})
export class XP {s=inject(AppStore);}
