/* Repeatable headless rendering probe, not a physical-device FPS guarantee.
   GAME_ROOT may point to a baseline's dist directory. Same browser/viewport for comparison. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),path=require('path');
(async()=>{
 const root=path.resolve(process.env.GAME_ROOT||path.join(__dirname,'../../dist'));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined),headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1280,height:800}});
 await page.route('http://pixel.test/**',async route=>{
  const url=new URL(route.request().url());let name=decodeURIComponent(url.pathname);if(name.endsWith('/'))name+='index.html';
  const file=path.join(root,name);if(!file.startsWith(root+path.sep))return route.fulfill({status:403,body:''});
  try{const type={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary'}[path.extname(file)]||'application/octet-stream';await route.fulfill({body:fs.readFileSync(file),contentType:type});}catch{await route.fulfill({status:404,body:''});}
 });
 await page.addInitScript(()=>{localStorage.setItem('pixel-drive-city','viscri');let sim;Object.defineProperty(window,'DriveSimulation',{get:()=>sim,set(v){sim=v;const create=v.create;v.create=(...args)=>window.__state=create(...args);}});});
 await page.goto('http://pixel.test/nivel-1/');await page.waitForFunction(()=>DriveRender?.stats);
 const first=await page.evaluate(()=>({readyMs:Math.round(performance.now()),stats:DriveRender.stats}));
 const sample=await page.evaluate(async()=>{
  __state.paused=true;const frames=[],stats=[];let last=performance.now(),start=last,next=0;
  while(performance.now()-start<10000){const now=await new Promise(requestAnimationFrame);frames.push(now-last);last=now;
   if(now-start>next){const p=DriveWorld.safeRoadPoses[(stats.length*37)%DriveWorld.safeRoadPoses.length];Object.assign(__state.player,p,{speed:0});stats.push(DriveRender.stats);next+=1000;}
  }
  frames.sort((a,b)=>a-b);return{meanFps:+(frames.length*1000/(performance.now()-start)).toFixed(1),p95FrameMs:+frames[Math.floor(frames.length*.95)].toFixed(1),maxBuildings:Math.max(...stats.map(s=>s.buildings.resident)),maxRegions:Math.max(...stats.map(s=>s.environment.resident)),heapBytes:performance.memory?.usedJSHeapSize};
 });
 console.log(JSON.stringify({label:process.env.LABEL||'current',...first,...sample}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
