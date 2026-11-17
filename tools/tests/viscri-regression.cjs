/* CPU regression tests. Real Three.js geometry; DOM is stubbed, not a visual test. */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../../dist/nivel-1');
function context(city){
 const store=new Map([['pixel-drive-city',city]]),elements=[];
 function element(tag){const nodes=new Map();return{tag,open:false,dataset:{},style:{},classList:{toggle(){}},append(){},appendChild(){},addEventListener(k,fn){this["on"+k]=fn;},toDataURL(){return "data:image/png;base64,";},setAttribute(){},showModal(){this.open=true},close(){this.open=false},getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}}),measureText:()=>({width:100})},{get:(o,k)=>o[k]||(()=>{})});},querySelector(k){if(!nodes.has(k))nodes.set(k,element(k));return nodes.get(k)},querySelectorAll(){return[]},nodes};}
 const doc=element('document');doc.body=element('body');doc.getElementById=()=>null;doc.createElement=tag=>{const e=element(tag);elements.push(e);return e};
 const ctx={console,document:doc,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},performance:{now:()=>10000},Math,Set,Map,Date,Uint8Array,Float32Array,Uint16Array,Uint32Array,setTimeout,clearTimeout,requestAnimationFrame(){},Image:class{}};ctx.window=ctx;vm.createContext(ctx);ctx.load=f=>vm.runInContext(fs.readFileSync(path.join(root,f+'.js'),'utf8'),ctx,{filename:f});ctx.elements=elements;ctx.store=store;return ctx;
}
for(const city of ['viscri','original']){
 const c=context(city);for(const f of ['maps/viscri-data','maps/service-layout','maps/viscri-world','world','rules','simulation'])c.load(f);
 const W=c.DriveWorld,S=c.DriveSimulation;
 assert.equal(!!W.realMap,city==='viscri');
 if(W.realMap){assert.equal(W.buildings.length,449);assert(W.realTrafficRoutes.length>5);
 for(const r of W.roads){const length=ps=>ps.slice(1).reduce((sum,p,i)=>sum+Math.hypot(p[0]-ps[i][0],p[1]-ps[i][1]),0);assert(Math.abs(length(r.points)-r.parts.reduce((sum,p)=>sum+length(p),0))<1e-6,'road continuity '+r.id);}
 for(const p of W.services){assert(W.roadAt(p.x,p.z,.1),'service accessible '+p.type);if(p.site){const s=p.site;for(let x=-s.access+.1;x<=3.8;x+=.15)assert(W.roadAt(s.x+s.ux*x*(s.scale||1),s.z+s.uz*x*(s.scale||1),.05),'driveway gap '+p.type);assert(!W.roadAt(s.x+s.ux*7*(s.scale||1),s.z+s.uz*7*(s.scale||1)),'shop interior must not be drivable');}}
 const a=W.trainingAccess.a,b=W.trainingAccess.b;for(let t=0;t<=1;t+=.025)assert(W.roadAt(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,.05),'training access gap');
 }
 if(W.realMap){
  // Sample the actual rendered bend triangles, rather than just centrelines.
  let roadSamples=0;
  for(const r of W.roads)for(let i=1;i<r.points.length;i++){
   const a=r.points[i-1],b=r.points[i],na=r.normals[i-1],nb=r.normals[i],h=(r.width+.14)/2;
   const ps=[[a[0]+na[0]*h,a[1]+na[1]*h],[a[0]-na[0]*h,a[1]-na[1]*h],[b[0]+nb[0]*h,b[1]+nb[1]*h],[b[0]-nb[0]*h,b[1]-nb[1]*h]];
   for(const ids of [[0,2,1],[1,2,3]])for(const weights of [[.8,.1,.1],[.1,.8,.1],[.1,.1,.8],[1/3,1/3,1/3]]){
    const x=ids.reduce((n,id,k)=>n+ps[id][0]*weights[k],0),z=ids.reduce((n,id,k)=>n+ps[id][1]*weights[k],0);
    assert(W.roadAt(x,z,.02),'rendered road rejected at '+r.id);roadSamples++;
   }
  }
  assert(!W.roadAt(-100,-100),'off-map terrain must stay blocked');console.log(JSON.stringify({roadSamples,checks:'render/collision agreement passed'}));
  assert.equal(W.vehicleScale,.67);assert.equal(W.serviceScale,.5);
  assert(W.signs.length>0);assert(W.signs.every(q=>q.source==='way-maxspeed'&&q.surveyed===false));
  for(const q of W.signs)for(const r of W.roads)for(const part of r.parts){const a=part[0],b=part[1],dx=b[0]-a[0],dz=b[1]-a[1],len2=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((q.x-a[0])*dx+(q.z-a[1])*dz)/len2));assert(Math.hypot(q.x-a[0]-dx*t,q.z-a[1]-dz*t)>r.width/2,'sign intersects road '+q.id);}
  const a=S.vehicleBody({x:0,z:0,angle:0}),b=S.vehicleBody({x:0,z:.52,angle:Math.PI});assert(!S.bodiesOverlap(a,b),'opposite lanes must not collide');b.z=.1;assert(S.bodiesOverlap(a,b),'actual vehicle contact must collide');
  const saved=W.landmarks;W.landmarks=[{kind:'museum',x:10,z:10},{kind:'parking',x:11,z:10}];assert.equal(c.DriveRules.context({player:{x:10,z:10,angle:0},pedestrians:[],time:0}).key,'parking');W.landmarks=saved;
 }
 // Drive from every launch position, for every purchasable body size.
 if(W.realMap){
  for(let model=0;model<4;model++)for(let attempt=0;attempt<=W.scenarios.length;attempt++){
   c.DriveCareer={model:()=>model};c.store.set('pixel-route-attempt-viscri',String(attempt-1));
   const s=S.create({vary:attempt>0}),start={...s.player};
   for(let frame=0;frame<180;frame++)S.update(s,{w:true},1/60);
   assert.equal(s.collisions,0,'launch collision model '+model+' start '+attempt);
   assert(Math.hypot(s.player.x-start.x,s.player.z-start.z)>.9,'launch must move model '+model+' start '+attempt);
  }
  delete c.DriveCareer;
 }
 // Exercise the real public capture -> interrupt -> retry path, including cyclic topology.
 c.load('replay-training');const replayState=S.create(),actor=replayState.traffic[0],route=actor.route,j=actor.j;
 c.DriveReplay.onFrame(replayState,{},10000);
 const originalX=actor.x;actor.x+=1;
 replayState.violationEvent={id:1,key:'test',kind:'speed',direction:null,junctionId:null,limit:50,speedKmh:70,player:{...replayState.player}};
 c.DriveReplay.onFrame(replayState,{},10300);assert(c.DriveReplay.open());
 c.elements.find(e=>e.id==='driving-replay').querySelector('#dr-retry').onclick();
 assert(!c.DriveReplay.open());assert(!replayState.paused);assert.equal(replayState.traffic[0].x,originalX);assert.equal(replayState.traffic[0].j,j);if(route)assert.equal(replayState.traffic[0].route,route);
 S.update(replayState,{},.016);
 let s=S.create();s.pedestrians=[];
 if(W.realMap){s.player.x=10;s.player.z=10;s.traffic=s.traffic.slice(0,1);const t=s.traffic[0],x=t.x,z=t.z;let traveled=0;for(let i=0;i<240;i++){const px=t.x,pz=t.z;S.update(s,{},1/60);traveled+=Math.hypot(t.x-px,t.z-pz);}assert(traveled>2,'traffic must advance beyond first frame');assert(Number.isFinite(t.routeProgress));}
 s=S.create();s.traffic=[];s.pedestrians=[];s.player.speed=.6;for(let i=0;i<100;i++){s.paused=false;S.update(s,{s:true},1/60);}assert.equal(s.player.speed,0,'held brake must not reverse');S.update(s,{},1/60);S.update(s,{s:true},1/60);assert(s.player.speed<0,'fresh S press reverses');
 c.load('career');let hubCalls=0,trainingCalls=0;c.PixelSchoolHub={open:({onResult})=>{hubCalls++;onResult({pass:true})}};c.DriveTraining={start:()=>trainingCalls++,active:()=>false};
 s=S.create();s.traffic=[];s.pedestrians=[];S.update(s,{},.01);
 for(const p of W.services){s.player.x=p.x;s.player.z=p.z;s.player.speed=0;assert.equal(S.interact(s).type,'service');if(p.type==='school'){const dialog=c.elements.find(e=>e.className==='career-dialog');const before=c.DriveCareer.credits();dialog.querySelector('#start-quiz').onclick();assert.equal(c.DriveCareer.credits(),before+150);dialog.querySelector('#start-driving').onclick();}}
 assert.equal(hubCalls,1);assert.equal(trainingCalls,2);
 c.load('training');c.DriveTraining.start(s);assert(c.DriveTraining.active());const rampTask=c.DriveTraining.tasks[3];assert.equal(c.DriveTraining.elevation(rampTask.x,rampTask.z),.55);assert(W.roadAt(s.player.x,s.player.z,.1));for(const id of ['seat','mirrors','belt','brake','neutral','clutch','ignition','lights','gear','look','handbrake','go'])c.DriveTraining.clickControl(id);assert(!s.paused);assert.equal(c.DriveTraining.gear(),'1');
 for(const f of ['three.min','surfaces','scenery','maps/building-kit','maps/real-scenery','services'])c.load(f);
 const T=c.THREE,scene=new T.Scene(),windows=[],material=new T.MeshStandardMaterial({color:'#888888'}),materials={road:material,white:material,grass:material};
 const box=(x,y,z,w,h,d,m)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),typeof m==='string'?new T.MeshStandardMaterial({color:m}):m);o.position.set(x,y,z);scene.add(o);return o};
 if(W.realMap){
  const joined=new T.Scene(),data={areas:[],buildings:[]},testW={mapData:data,roads:[{type:'residential',surface:'asphalt',width:1,points:[[0,0],[5,0],[5,5]]}],footways:[],nearestRoad:()=>null,serviceSites:[],roadAt:()=>false};
  c.DriveRealScenery.build({W:testW,scene:joined,windows:[]});assert.equal(joined.children.length,4);
  const before=joined.children[1],after=joined.children[3];
  for(const [a,b] of [[2,0],[3,1]]){const pa=new T.Vector3().fromBufferAttribute(before.geometry.attributes.position,a).add(before.position),pb=new T.Vector3().fromBufferAttribute(after.geometry.attributes.position,b).add(after.position);assert(pa.distanceTo(pb)<1e-6,'road bend must share joined edge');assert(Math.abs(before.geometry.attributes.uv.getY(a)-after.geometry.attributes.uv.getY(b))<1e-6,'road texture must remain continuous at bend');}
 }
 c.DriveScenery.build({W,scene,box,materials,windows});const before=scene.children.length;c.DriveServices.build({T,W,scene,box,mat:col=>new T.MeshStandardMaterial({color:col}),materials});assert(scene.children.length-before>200,'detailed services, not plaques');
 let vertices=0;scene.updateMatrixWorld(true);scene.traverse(o=>{if(!o.isMesh)return;const a=o.geometry.attributes.position;vertices+=a.count;for(let i=0;i<a.array.length;i++)assert(Number.isFinite(a.array[i]),'finite geometry');});
 if(W.realMap){const kitScene=new T.Scene();c.DriveBuildingKit.build({T,scene:kitScene,buildings:[{id:6,type:'house',points:[[0,0],[4,0],[4,2],[0,2],[0,0]]}],nearestRoad:()=>({x:2,z:-2}),windows:[]});const roofs=kitScene.children.filter(o=>o.material.map===c.DriveSurfaces.textures.tile&&o.geometry.attributes.position.count>6);assert(roofs.some(o=>{const a=o.geometry.attributes.position;let min=Infinity,max=-Infinity;for(let i=0;i<a.count;i++){min=Math.min(min,a.getY(i));max=Math.max(max,a.getY(i));}return max-min>.2;}),'rectangular footprint roof has raised ridge');}
 if(W.realMap){
  c.load('maps/building-stream');const streamed=new T.Scene(),liveWindows=[],stream=c.DriveBuildingStream.create({T,W,scene:streamed,windows:liveWindows});
  assert.equal(stream.stats().resident,0,'no building geometry at startup');
  const visible={intersectsBox:()=>true};let maxResident=0;
  for(const b of W.buildings.filter((_,i)=>i%15===0)){const p=new T.Vector3(b.points[0][0],0,b.points[0][1]);for(let i=0;i<4;i++)stream.update(p,visible);maxResident=Math.max(maxResident,stream.stats().resident);assert(stream.stats().resident<=48);}
  assert(stream.stats().built>10);assert(stream.stats().evicted>0,'distant architecture must be released');
  stream.update(new T.Vector3(-1000,0,-1000),visible);assert.equal(stream.stats().resident,0);assert.equal(liveWindows.length,0);assert.equal(streamed.children.length,0);
  console.log(JSON.stringify({streaming:stream.stats(),maxResident}));stream.dispose();
  for(const r of W.roads)assert(r.width>=r.sourceWidth&&r.width>=(['track','service'].includes(r.type)?3.5:6.5)*W.mapData.projection.gameUnitsPerMeter);
 }
 const meshCount=scene.children.length,serviceMeshCount=meshCount-before;
 const chunks=new Map();let oversized=0;scene.updateMatrixWorld(true);for(const o of [...scene.children]){if(!o.isMesh)continue;const bounds=new T.Box3().setFromObject(o),size=bounds.getSize(new T.Vector3());if(size.x>16||size.z>16){oversized++;continue;}const key=Math.floor(o.position.x/8)+','+Math.floor(o.position.z/8)+(W.realMap&&o.userData.detail?':detail':'');if(!chunks.has(key))chunks.set(key,new T.Group());chunks.get(key).add(o);}
 let batched=0;for(const group of chunks.values()){c.DriveScenery.batch(group);batched+=group.children.length;}if(W.realMap)assert.equal(oversized,0,'all map scenery must fit streamer bounds');
 c.load('quiz-bank');for(let i=1;i<=25;i++)c.load('quiz-batches/batch-'+String(i).padStart(2,'0'));assert.equal(c.DriveQuizBank.questions.length,1208);
 console.log(JSON.stringify({city,questions:c.DriveQuizBank.questions.length,chunks:chunks.size,batchedMeshes:batched,oversized,services:W.services.length,meshes:meshCount,serviceMeshes:serviceMeshCount,vertices,checks:'passed'}));
}
