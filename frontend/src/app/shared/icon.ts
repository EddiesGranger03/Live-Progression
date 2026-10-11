import {Component,input} from '@angular/core';
const paths:Record<string,string>={
 home:'m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z',
 calendar:'M4 5h16v16H4zM8 3v4m8-4v4M4 10h16M8 14h1m3 0h1m3 0h1M8 17h1m3 0h1',
 chart:'M3 13h4v8H3zM10 8h4v13h-4zM17 3h4v18h-4z',
 user:'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M3 21a9 9 0 0 1 18 0z',
 plus:'M12 5v14M5 12h14',chevron:'m9 5 7 7-7 7',left:'m15 5-7 7 7 7',arrow:'M20 12H4m6-6-6 6 6 6',right:'M4 12h16m-6-6 6 6-6 6',
 clock:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 7v5l3 2',
 target:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0M12 12l8-8m-3 0h3v3',
 book:'M12 5C8 2 4 3 2 4v15c4-2 7-1 10 1 3-2 6-3 10-1V4c-2-1-6-2-10 1v15',
 heart:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
 leaf:'M21 3C12 3 3 6 3 14a7 7 0 0 0 7 7c8 0 11-9 11-18M3 21 17 7',
 sun:'M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1',
 check:'m5 12 4 4L19 6',star:'m12 2 3 7 8 2-6 5 1 7-6-4-6 4 1-7-6-5 8-2z',
 play:'m8 4 13 8-13 8z',stop:'M6 6h12v12H6z',search:'M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0m-2 6 6 6',
 bell:'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4',
 logout:'M9 3H3v18h6m6-16 7 7-7 7M8 12h14',trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
 info:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6m0-10v1',edit:'m14 5 5 5M3 21l5-1L21 7l-4-4L4 16z',
 archive:'M3 3h18v5H3zM5 8v13h14V8M9 12h6',close:'m6 6 12 12M6 18 18 6',users:'M10 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0M1 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m0 5a6 6 0 0 1 6 6',
 file:'M4 2h11l5 5v15H4zM14 2v6h6M8 12h8M8 16h8',more:'M4 12h.01M12 12h.01M20 12h.01',eye:'M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',wifi:'M3 8a16 16 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a4 4 0 0 1 6 0m-3 4h.01',
 bulb:'M9 18h6m-6 3h6M8 14a6 6 0 1 1 8 0l-1 4H9zM12 1v1M2 7l2 1m16 0 2-1',shield:'m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6z'
};
@Component({selector:'sl-icon',standalone:true,template:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="path()"/></svg>`,styles:[`:host{display:inline-flex;flex:0 0 auto;width:22px;height:22px;align-items:center;justify-content:center}svg{width:100%;height:100%}`]})
export class Icon {name=input('star');path=()=>paths[this.name()]||paths['star'];}
