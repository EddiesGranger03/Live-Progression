import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';

const base=path.dirname(fileURLToPath(import.meta.url));
const additions=JSON.parse(fs.readFileSync(path.join(base,'coverage-additions.json'),'utf8'));
const url=pathToFileURL(path.join(base,'index.html')).href;
const platforms=['ios','android'];
const batches=[];
for(let i=0;i<additions.length;i+=4)batches.push(additions.slice(i,i+4).map(screen=>screen.id));
const outputDirectory=path.join(base,'boards');
fs.mkdirSync(outputDirectory,{recursive:true});
const browser=await chromium.launchPersistentContext(path.join(base,'..','..','artifacts','mobile-gallery-review-profile'),{channel:'msedge',headless:true,viewport:{width:1600,height:1000},deviceScaleFactor:1});
const outputs=[];

try{
 const page=browser.pages()[0]??await browser.newPage();
 async function capture(ids,platform,title,file){
  await page.goto(url+'?'+new URLSearchParams({board:'1',platform}));
  await expect(page.locator('.card').first()).toBeVisible();
  await page.evaluate(({ids,platform,title})=>{
   const cards=ids.map(id=>{
    const preview=[...document.querySelectorAll('.thumb')].find(element=>element.dataset.id===id&&element.dataset.platform===platform);
    if(!preview)throw new Error('Gallery is missing '+id+'/'+platform+'; integrate the additions before running review-additions.mjs.');
    return preview.closest('.card').cloneNode(true);
   });
   const heading=document.createElement('div');
   heading.className='section-title';
   const label=document.createElement('h2');
   label.textContent=title;
   heading.append(label);
   const grid=document.createElement('div');
   grid.className='grid';
   grid.append(...cards);
   document.querySelector('#content').replaceChildren(heading,grid);
  },{ids,platform,title});
  await expect(page.locator('.card')).toHaveCount(ids.length);
  await page.locator('.thumb img').evaluateAll(async images=>{
   for(const image of images){image.loading='eager';await image.decode();}
  });
  await page.screenshot({path:path.join(outputDirectory,file),fullPage:true});
  outputs.push({platform,ids,file:'boards/'+file});
 }

 for(let i=0;i<batches.length;i++)for(const platform of platforms){
  const number=String(i+1).padStart(2,'0');
  const label=platform==='ios'?'iOS':'Android';
  await capture(batches[i],platform,'Bổ sung 16/10 · '+number+'/'+String(batches.length).padStart(2,'0')+' · '+label,'additions-'+number+'-'+platform+'.png');
 }
 for(const platform of platforms){
  const label=platform==='ios'?'iOS':'Android';
  await capture(['G05','F05','Q10','S08'],platform,'Bổ sung 16/10 · Tạo mục tiêu / Focus / Hoàn tác / Vài phút · '+label,'additions-overview-'+platform+'.png');
 }
}finally{
 await browser.close();
}

console.log(JSON.stringify({addedStates:additions.length,contactSheets:batches.length*platforms.length,previews:platforms.length,outputs}));
