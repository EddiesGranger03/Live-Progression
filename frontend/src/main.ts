import {bootstrapApplication} from '@angular/platform-browser';
import {provideRouter,Routes} from '@angular/router';
import {Root} from './app/root';
const routes:Routes=[
 {path:'today',loadComponent:()=>import('./app/features/today').then(m=>m.Today)},
 {path:'calendar',loadComponent:()=>import('./app/features/calendar').then(m=>m.Calendar)},
 {path:'progress',loadComponent:()=>import('./app/features/progress').then(m=>m.Progress)},
 {path:'profile',loadComponent:()=>import('./app/features/profile').then(m=>m.ProfilePage)},
 {path:'quests',loadComponent:()=>import('./app/features/quests').then(m=>m.Quests)},
 {path:'quests/:id',loadComponent:()=>import('./app/features/quest-detail').then(m=>m.QuestDetail)},
 {path:'focus/:id',loadComponent:()=>import('./app/features/focus').then(m=>m.Focus)},
 {path:'login',loadComponent:()=>import('./app/features/auth').then(m=>m.Auth)},
 {path:'signup',loadComponent:()=>import('./app/features/auth').then(m=>m.Auth)},
 {path:'forgot-password',loadComponent:()=>import('./app/features/auth').then(m=>m.Auth)},
 {path:'reset-password',loadComponent:()=>import('./app/features/auth').then(m=>m.Auth)},
 {path:'onboarding/:step',loadComponent:()=>import('./app/features/onboarding').then(m=>m.Onboarding)},
 {path:'',pathMatch:'full',redirectTo:'today'}, {path:'**',redirectTo:'today'}
];
bootstrapApplication(Root,{providers:[provideRouter(routes)]}).catch(console.error);
