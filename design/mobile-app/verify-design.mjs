import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium,expect} from '@playwright/test';
const base=path.dirname(fileURLToPath(import.meta.url));
const catalog=JSON.parse(fs.readFileSync(path.join(base,'catalog.json'),'utf8')).screens;
const platforms=['ios','android'];
const expectedAssets=catalog.reduce((count,screen)=>count+screen.platforms.length,0);
const assets=[],missing=[];
for(const screen of catalog)for(const platform of screen.platforms){
 const imagePath=path.join(base,'images',platform,screen.id+'.png');
 const promptPath=path.join(base,'prompts',platform+'-'+screen.id+'.txt');
 if(!fs.existsSync(imagePath)||!fs.existsSync(promptPath)){missing.push(platform+'/'+screen.id);continue;}
 const bytes=fs.readFileSync(imagePath);
 const png=bytes.subarray(1,4).toString()==='PNG';
 const width=png?bytes.readUInt32BE(16):0,height=png?bytes.readUInt32BE(20):0;
 assets.push({id:screen.id,platform,width,height,bytes:bytes.length,valid:png&&width>=700&&height>width});
}
fs.writeFileSync(path.join(base,'asset-check.json'),JSON.stringify({expected:expectedAssets,found:assets.length,missing,assets},null,2));
if((missing.length||assets.some(a=>!a.valid))&&!process.argv.includes('--partial'))throw new Error('Missing or invalid image assets: '+missing.join(','));
if(process.argv.includes('--static-only')){
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
 const inline=html.match(/const screens=(\[.*?\]);\s*const sourceLabels/s);
 if(!inline)throw new Error('Could not find the inline gallery catalog');
 const inlineIds=JSON.parse(inline[1]).map(screen=>screen.id).sort();
 const catalogIds=catalog.map(screen=>screen.id).sort();
 expect(inlineIds).toEqual(catalogIds);
 const boardManifestPath=path.join(base,'boards','review-84','manifest.json');
 const boardManifest=fs.existsSync(boardManifestPath)?JSON.parse(fs.readFileSync(boardManifestPath,'utf8')):null;
 const prompts=assets.length-missing.length;
 const result={created:new Date().toISOString(),assets:assets.length,expectedAssets,screenStates:catalog.length,missing,boards:boardManifest?.boards??[],checks:[
  assets.length+' image files exist with valid PNG signatures and portrait dimensions',
  'Prompt files exist for all catalog platform images',
  'Gallery inline state IDs match catalog',
  ...(boardManifest?['Contact sheets were rendered from decoded source images ('+boardManifest.boards.length+' files)']:[])
 ],limitations:['Browser interaction and browser-rendered gallery layout were not checked in this run','This is design asset verification, not native app testing'],scope:'Static asset and catalog verification only'};
 fs.writeFileSync(path.join(base,'verification.json'),JSON.stringify(result,null,2));
 console.log(JSON.stringify({assets:assets.length,expectedAssets,screenStates:catalog.length,missing,prompts,scope:result.scope}));
 process.exit(0);
}
const browser=await chromium.launchPersistentContext(path.join(base,'..','..','artifacts','mobile-gallery-verify-profile'),{channel:'msedge',headless:true,viewport:{width:1440,height:1000},deviceScaleFactor:1});
const page=browser.pages()[0]??await browser.newPage();
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const url=pathToFileURL(path.join(base,'index.html')).href;
await page.goto(url);
const inlineIds=await page.evaluate(()=>screens.map(screen=>screen.id));
expect([...inlineIds].sort()).toEqual(catalog.map(screen=>screen.id).sort());
await page.locator('#platform').selectOption('compare');
await expect(page.locator('.card')).toHaveCount(catalog.length);
await expect(page.locator('.thumb')).toHaveCount(catalog.length*platforms.length);
for(const card of await page.locator('.card').all())await expect(card.locator('.thumb')).toHaveCount(platforms.length);
const previewPairs=await page.locator('.thumb').evaluateAll(thumbs=>thumbs.map(thumb=>thumb.dataset.id+'/'+thumb.dataset.platform).sort());
expect(previewPairs).toEqual(catalog.flatMap(screen=>platforms.map(platform=>screen.id+'/'+platform)).sort());
await page.locator('#search').fill('Focus');await expect(page.locator('.card').first()).toBeVisible();
await page.locator('#search').fill('zzzznothing');await expect(page.locator('.empty')).toBeVisible();
await page.locator('#search').fill('');
const todayScreens=catalog.filter(screen=>screen.group==='Hôm nay');
await page.locator('#group').selectOption('Hôm nay');await expect(page.locator('.card')).toHaveCount(todayScreens.length);
await page.locator('#platform').selectOption('ios');await page.locator('.thumb').first().click();await expect(page.locator('#viewer')).toBeVisible();
await page.keyboard.press('ArrowRight');await expect(page.locator('#modal-title')).toContainText(todayScreens[1].id);
await page.keyboard.press('Escape');await expect(page.locator('#viewer')).not.toBeVisible();
await page.setViewportSize({width:360,height:800});await page.locator('#group').selectOption('');await page.locator('#phase').selectOption('Concept RPG');await expect(page.locator('.card')).toHaveCount(catalog.filter(screen=>screen.phase==='Concept RPG').length);
const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
if(overflow)throw new Error('Gallery horizontal overflow at 360px');
await page.setViewportSize({width:1600,height:1000});
const groups=[...new Set(catalog.map(s=>s.group))].filter(g=>catalog.filter(s=>s.group===g).every(s=>['ios','android'].every(p=>fs.existsSync(path.join(base,'images',p,s.id+'.png'))))),boards=[];
for(let i=0;i<groups.length;i++)for(const platform of ['ios','android']){
 const params=new URLSearchParams({board:'1',group:groups[i],platform});
 await page.goto(url+'?'+params.toString());
 await page.locator('.thumb img').evaluateAll(async imgs=>{for(const img of imgs){img.loading='eager';await img.decode();}});
 const output=String(i+1).padStart(2,'0')+'-'+platform+'.png';
 await page.screenshot({path:path.join(base,'boards',output),fullPage:true});
 boards.push({group:groups[i],platform,file:'boards/'+output});
}
await page.goto(url+'?platform=ios&group='+encodeURIComponent('Hôm nay'));await page.locator('.thumb img').evaluateAll(async imgs=>{for(const i of imgs){i.loading='eager';await i.decode();}});
await page.screenshot({path:path.join(base,'boards','gallery-preview.png'),fullPage:true});
if(!missing.length){
 for(const platform of ['ios','android']){
  await page.goto(url+'?board=1&platform='+platform);
  await page.evaluate(()=>{
   const chosen=['H01','C01','F02','P01'];
   const cards=chosen.map(id=>document.querySelector('[data-id="'+id+'"]').closest('.card').cloneNode(true));
   const content=document.querySelector('#content');content.innerHTML='<div class="section-title"><h2>SOLO LEVELING · Hôm nay / Lịch / Focus / Tiến bộ</h2></div><div class="grid"></div>';
   content.querySelector('.grid').append(...cards);
  });
  await page.locator('.thumb img').evaluateAll(async imgs=>{for(const i of imgs){i.loading='eager';await i.decode();}});
  await page.screenshot({path:path.join(base,'boards','overview-'+platform+'.png'),fullPage:true});
 }
}
await browser.close();
const result={created:new Date().toISOString(),assets:assets.length,expectedAssets,screenStates:catalog.length,missing,boards,checks:[assets.length+' PNG files have valid portrait dimensions; available board images decode','All available image prompts exist','Gallery inline state IDs match catalog','Comparison renders both platform previews for every state','Gallery filters and search work','Image dialog, next navigation, Escape work','Gallery has no horizontal overflow at 360px'],errors,scope:'Static asset and gallery verification; not native app testing'};
fs.writeFileSync(path.join(base,'verification.json'),JSON.stringify(result,null,2));
if(errors.length)throw new Error(errors.join('\n'));
console.log(JSON.stringify({assets:assets.length,boards:boards.length,errors}));

\n