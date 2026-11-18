/* Browser integration checks. Run with Playwright installed and dist served.
   BASE_URL=http://127.0.0.1:8766 OUTPUT_DIR=/tmp/pixel-frames node tools/tests/viscri-browser.cjs
   Test-only state instrumentation; no production debug hooks are installed. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
(async()=>{
 const out=process.env.OUTPUT_DIR||'/tmp/pixel-drive-frames';fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM||(process.platform==='darwin'?'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome':undefined),headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{if(!localStorage.getItem('pixel-drive-city'))localStorage.setItem('pixel-drive-city','viscri');let sim;Object.defineProperty(window,'DriveSimulation',{configurable:true,get:()=>sim,set(v){sim=v;const create=v.create;v.create=(...args)=>{const s=create(...args);window.__state=s;return s;};}});});
 const base=process.env.BASE_URL||'http://127.0.0.1:8766';
 await page.goto(base+'/nivel-1/',{waitUntil:'load',timeout:120000});
 for(const city of ['viscri','original']){
  await page.waitForFunction(()=>window.__state&&DriveRender.stats,{timeout:120000});
  assert.equal(await page.evaluate(()=>!!DriveWorld.realMap),city==='viscri');
  assert.equal(await page.evaluate(()=>DriveQuizBank.questions.length),1208);
  assert(await page.evaluate(()=>!!document.querySelector('#scene').getContext('webgl2')),'real WebGL context');
  await page.waitForTimeout(1500);
  if(city==='viscri'){
   const start=await page.evaluate(()=>({...__state.player}));
   await page.locator('#scene').focus();await page.keyboard.down('w');
   await page.waitForFunction(start=>Math.hypot(__state.player.x-start.x,__state.player.z-start.z)>.05,start,{timeout:20000});await page.keyboard.up('w');
   assert(await page.evaluate(start=>Math.hypot(__state.player.x-start.x,__state.player.z-start.z)>.05,start),'keyboard driving moves the player');
   const load=await page.evaluate(()=>({navigationMs:Math.round(performance.now()),...DriveRender.stats}));assert(load.environment.resident<load.environment.total/3);assert(load.buildings.resident<49);console.log(JSON.stringify({initialStreaming:load}));
   await page.evaluate(()=>{const s=__state,b=DriveWorld.buildings[100],ps=b.points;s.traffic=[];s.pedestrians=[];Object.assign(s.player,{x:ps.reduce((n,p)=>n+p[0],0)/ps.length,z:ps.reduce((n,p)=>n+p[1],0)/ps.length,speed:0});s.collisions=4;s.failed=true;s.violationEvent={id:900,key:'collision',kind:'collision',direction:1,junctionId:DriveWorld.junctions[5].id,limit:50,player:{...s.player}};DriveReplay.onFrame(s,document.querySelector('#scene'),performance.now());});
   await page.locator('#driving-replay[open]').waitFor();await page.locator('#dr-retry').click();
   assert(await page.evaluate(()=>DriveWorld.poseFits(__state.player,__state.traffic,1.6)));
   const launch=await page.evaluate(()=>{const s=__state,start={...s.player},collisions=s.collisions;for(let i=0;i<180;i++)DriveSimulation.update(s,{w:true},1/60);s.paused=true;return{distance:Math.hypot(s.player.x-start.x,s.player.z-start.z),collisions:s.collisions-collisions,failed:s.failed};});assert(launch.distance>.9&&launch.collisions===0&&!launch.failed);console.log(JSON.stringify({retryFromBuilding:launch}));
   for(const id of ['pickup','dropoff']){await page.evaluate(id=>{const stop=DriveWorld.landmarks.find(l=>l.id===id);Object.assign(__state.player,stop,{speed:0});__state.scenario=null;__state.mission.phase=id;__state.paused=true;},id);await page.waitForTimeout(1800);await page.screenshot({path:path.join(out,city+'-'+id+'.png')});}
  }
  // Capture actual running renderer at a repeatable location; freeze simulation, not rendering.
  await page.evaluate(()=>{__state.paused=true;});
  await page.screenshot({path:path.join(out,city+'-road.png')});
  if(city==='viscri')for(const type of ['school','fuel']){
   await page.evaluate(type=>{const p=DriveWorld.services.find(p=>p.type===type),n=DriveWorld.nearestRoad(p);Object.assign(__state.player,{x:n.x,z:n.z,angle:Math.atan2(n.tangent.z,n.tangent.x),speed:0});__state.time=0;},type);
   await page.waitForTimeout(1500);await page.screenshot({path:path.join(out,city+'-'+type+'.png')});
  }
  // Full replay capture, violation dialog, retry and resumed update on both maps.
  await page.evaluate(()=>{const s=__state;s.paused=false;DriveReplay.onFrame(s,document.querySelector('#scene'),performance.now());s.violationEvent={id:991,key:'browser-test',kind:'speed',direction:null,junctionId:null,limit:50,speedKmh:70,player:{...s.player}};DriveReplay.onFrame(s,document.querySelector('#scene'),performance.now()+300);});
  await page.locator('#driving-replay[open]').waitFor();await page.locator('#dr-retry').click();
  assert(await page.evaluate(()=>!DriveReplay.open()&&!__state.paused));
  await page.evaluate(()=>{DriveSimulation.update(__state,{},1/60);__state.paused=true;});
  // Actual school service UI -> full hub, preserving the existing callback.
  await page.evaluate(()=>{const p=DriveWorld.services.find(p=>p.type==='school');Object.assign(__state.player,{x:p.x,z:p.z,speed:0});__state.paused=false;DriveSimulation.update(__state,{},.001);DriveSimulation.interact(__state);});
  await page.locator('#start-quiz').click();await page.locator('.ps-hub[open]').waitFor();
  await page.screenshot({path:path.join(out,city+'-hub.png')});await page.locator('.ps-hub [data-act="close"]').click();if(await page.locator('.career-dialog[open]').count())await page.locator('#career-close').click();
  console.log(JSON.stringify({city,webgl:true,questions:1208,replay:'capture/retry passed',school:'service/hub passed',stats:await page.evaluate(()=>DriveRender.stats)}));
  if(city==='viscri'){
   await page.locator('.city-switch').click();await page.locator('.city-option').filter({hasText:'Oraș original'}).click();await page.waitForLoadState('load');
  }
 }
 await page.locator('.city-switch').click();await page.locator('.city-option').filter({hasText:'Oraș real'}).click();await page.waitForLoadState('load');await page.waitForFunction(()=>window.__state&&DriveWorld.realMap&&DriveRender.stats,{timeout:120000});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>{__state.paused=true;});
 await page.locator('[data-indicator="1"]').click();assert.equal(await page.evaluate(()=>__state.player.indicator),1);
 await page.screenshot({path:path.join(out,'viscri-mobile.png')});
 await page.goto(base+'/nivel-1/?collision-debug=1');await page.waitForFunction(()=>DriveCollisionDebug&&DriveRender.stats);await page.waitForTimeout(1000);await page.screenshot({path:path.join(out,'collision-debug.png')});
 assert.deepEqual(errors,[]);console.log(JSON.stringify({switchRoundTrip:'passed',mobileIndicator:'passed',pageErrors:errors}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
