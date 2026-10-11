import {Component,inject,signal} from '@angular/core';
import {Router,RouterLink,RouterLinkActive,RouterOutlet,NavigationEnd} from '@angular/router';
import {AppStore} from './core/store';
import {Icon} from './shared/icon';
import {DialogPanel} from './shared/dialog';
import {dateLabel} from './core/models';
@Component({selector:'sl-root',standalone:true,imports:[RouterOutlet,RouterLink,RouterLinkActive,Icon,DialogPanel],template:`
@if(!immersive()){
  <aside class="sidebar">
    <a class="brand" routerLink="/today" aria-label="Solo Leveling, về Hôm nay"><img src="assets/mark.svg" alt=""><span>SOLO<br>LEVELING</span></a>
    <p class="nav-caption">KHÔNG GIAN CỦA BẠN</p>
    <nav aria-label="Điều hướng chính">@for(item of nav;track item.path){<a [routerLink]="item.path" routerLinkActive="active" [class.active]="item.path==='/today'&&url().startsWith('/quests')"><sl-icon [name]="item.icon"/><span>{{item.label}}</span><i></i></a>}</nav>
    <div class="sidebar-bottom"><p>Mỗi ngày, một bước tiến.</p><a routerLink="/profile" class="sidebar-user"><span class="user-avatar"><sl-icon name="user"/></span><span><strong>{{s.profile().name}}</strong><small>{{s.demo()?'Không gian trải nghiệm':'Tài khoản cá nhân'}}</small></span><sl-icon name="chevron"/></a></div>
  </aside>
  <div class="workspace">
    <header class="topbar"><div class="breadcrumbs">Không gian cá nhân <span>/</span> <strong>{{title()}}</strong></div><div class="topbar-actions">@if(s.demo()){<span class="demo-label"><i></i> Bản trải nghiệm</span>}<a routerLink="/calendar" class="header-date"><sl-icon name="calendar"/><span>{{date(s.today())}}</span></a><a routerLink="/profile" class="user-avatar small" aria-label="Mở hồ sơ cá nhân"><sl-icon name="user"/></a></div></header>
    @if(!s.online()){<div class="offline-banner"><sl-icon name="wifi"/>Đang ngoại tuyến · {{s.demo()?'Dữ liệu được lưu trên thiết bị này.':'Thao tác mới được lưu trên thiết bị và chờ đồng bộ.'}}</div>}
    @if(s.pending().length){<button class="pending-banner" (click)="s.open('pending')"><sl-icon name="clock"/>{{s.pending().length}} thao tác chờ đồng bộ <span>Xem chi tiết →</span></button>}
    @if(s.active()){<a [routerLink]="['/focus',s.active()!.id]" class="active-banner"><span class="pulse"></span>Focus đang chạy · {{s.active()!.title}}<span>Tiếp tục <sl-icon name="right"/></span></a>}
    <main class="main-content" id="main-content">@if(s.loading()){<div class="skeleton"></div><div class="skeleton tall"></div>}@else if(s.authenticated()){<router-outlet/>}@else{<div class="empty-state"><sl-icon name="shield"/><h2>Không gian của riêng bạn</h2><a routerLink="/login" class="btn primary">Đăng nhập</a></div>}</main>
    <footer class="page-footer">SOLO LEVELING <span>Giữ sự tập trung. Tiến bộ ngoài đời.</span>@if(s.demo()){<small>Dữ liệu mẫu · Lưu trên thiết bị</small>}</footer>
  </div>
} @else {<router-outlet/>}
@if(s.dialog()){<sl-dialog/>}
@if(s.toast()){<div class="toast" role="status"><span class="toast-symbol"><sl-icon name="check"/></span><span>{{s.toast()}}</span>@if(s.toastUndo()){<button (click)="s.toastUndo()!()">Hoàn tác</button>}<button class="icon-btn" (click)="s.toast.set('')" aria-label="Đóng thông báo"><sl-icon name="close"/></button></div>}
`})
export class Root {
 s=inject(AppStore);router=inject(Router);url=signal(this.router.url);date=dateLabel;
 nav=[{path:'/today',label:'Hôm nay',icon:'home'},{path:'/calendar',label:'Lịch',icon:'calendar'},{path:'/progress',label:'Tiến bộ',icon:'chart'},{path:'/profile',label:'Cá nhân',icon:'user'}];
 constructor(){this.router.events.subscribe(e=>{if(e instanceof NavigationEnd){this.url.set(e.urlAfterRedirects);window.scrollTo({top:0,behavior:'instant'});}});}
 immersive(){return /^\/(focus|login|signup|forgot-password|reset-password|onboarding)/.test(this.url());}
 title(){const u=this.url();return u.startsWith('/quests/')?'Nhiệm vụ / Chi tiết':u.startsWith('/quests')?'Hôm nay / Nhiệm vụ':this.nav.find(n=>u.startsWith(n.path))?.label||'Hôm nay';}
}
