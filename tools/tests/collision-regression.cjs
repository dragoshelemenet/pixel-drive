/* Deterministic integration cases against the actual simulation, no renderer. */
const {context}=require('./game-context.cjs'),assert=require('assert');
const c=context('viscri');for(const f of ['maps/viscri-data','maps/service-layout','maps/road-safety','maps/viscri-world','world','rules','simulation'])c.load(f);
const W=c.DriveWorld,S=c.DriveSimulation;
const fresh=()=>{const s=S.create();s.traffic=[];s.pedestrians=[];return s;};
let edgeCases=0,falseImpacts=0,moved=0;const roads=new Set();
for(let model=0;model<4;model++){
 c.DriveCareer={model:()=>model};
 for(const r of W.roads)for(let i=1;i<r.points.length;i++)for(const side of [-1,1])for(const reverse of [false,true]){
  const a=r.points[i-1],b=r.points[i],angle=Math.atan2(b[1]-a[1],b[0]-a[0]),ux=Math.cos(angle),uz=Math.sin(angle),offset=r.width/2-.05;
  const p={x:(a[0]+b[0])/2-uz*offset*side,z:(a[1]+b[1])/2+ux*offset*side,angle,speed:reverse?-.5:.5,indicator:0};
  // Exclude actual solid intersections throughout the tiny movement segment.
  if([0,.025,-.025].some(d=>W.obstacleAt({...S.vehicleBody(p,true),x:p.x+ux*d,z:p.z+uz*d})))continue;
  const s=fresh();Object.assign(s.player,p);S.update(s,{},1/60);edgeCases++;roads.add(r.id);falseImpacts+=s.collisions;moved+=Math.hypot(s.player.x-p.x,s.player.z-p.z)>0;
 }
}
console.log(JSON.stringify({roads:roads.size,edgeCases,falseImpacts,moved}));
if(!process.argv.includes('--baseline'))assert.equal(falseImpacts,0,'clear road edges are not physical impacts');
if(process.argv.includes('--baseline'))process.exit(0);
let buildingImpacts=0,nearMisses=0;
for(let model=0;model<4;model++){
 c.DriveCareer={model:()=>model};let checked=0;
 for(const shape of W.collisionShapes.filter(q=>q.type==='building')){
  let found=false;
  for(let i=1;i<shape.points.length&&!found;i++)for(const side of [-1,1]){
   const a=shape.points[i-1],b=shape.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<1.5)continue;
   const ux=-(b[1]-a[1])/len*side,uz=(b[0]-a[0])/len*side,angle=Math.atan2(-uz,-ux),body=S.vehicleBody({x:0,z:0,angle},true);
   const p={x:(a[0]+b[0])/2+ux*(body.halfLength+.01),z:(a[1]+b[1])/2+uz*(body.halfLength+.01),angle};
   if(W.obstacleHit({...body,...p},0))continue;
   const ahead={...body,...p,x:p.x-ux*.04,z:p.z-uz*.04};if(W.obstacleHit(ahead,0)?.id!==shape.id)continue;
   const s=fresh();Object.assign(s.player,p,{speed:0});S.update(s,{},1/60);assert.equal(s.collisions,0);nearMisses++;
   s.player.speed=.8;S.update(s,{},.05);assert.equal(s.collisions,1,'actual building contact '+shape.id);
   assert(!W.obstacleAt(S.vehicleBody(s.player,true),0),'rejected movement stays outside solid');
   for(let n=0;n<360;n++){s.violationEvent=null;S.update(s,{w:true},1/60);}assert.equal(s.collisions,1,'one penalty while pressing same wall');
   buildingImpacts++;checked++;found=true;break;
  }
  if(checked===43)break;
 }
 assert.equal(checked,43);
}
c.DriveCareer={model:()=>0};
const site=W.serviceSites.find(q=>q.type==='fuel'),angle=Math.atan2(site.uz,site.ux),body=S.vehicleBody({x:0,z:0,angle},true);
const world=(x,z)=>({x:site.x+(x*site.ux-z*site.uz)*site.scale,z:site.z+(x*site.uz+z*site.ux)*site.scale,angle});
let pumpCases=0;
for(const speed of [.12,.8,2.8])for(const side of [-1,1]){
 const start=world(2.65-(body.halfLength+.001)/site.scale,side*1.45),s=fresh();Object.assign(s.player,start,{speed});
 assert(!W.obstacleHit({...body,...start},0));S.update(s,{w:true},.05);assert.equal(s.collisions,1,'pump impact speed '+speed);
 for(let n=0;n<360;n++){s.violationEvent=null;S.update(s,{w:true},1/60);}assert.equal(s.collisions,1,'held pump contact');
 for(let n=0;n<100;n++){s.violationEvent=null;S.update(s,{s:true},1/60);}assert.equal(s.collisions,1,'reverse away');assert(Math.hypot(s.player.x-start.x,s.player.z-start.z)>.25,'can escape pump');assert(!s.staticContact,'contact clears after separation');
 // Re-approach from the cleared side, as a distinct incident.
 Object.assign(s.player,start,{speed});s.violationEvent=null;S.update(s,{w:true},.05);assert.equal(s.collisions,2,'new impact after separation');pumpCases++;
}
// Side/rear contact and rotation: same polygon query used by movement.
const pump=W.collisionShapes.find(q=>q.type==='pump'),center={x:pump.points.reduce((n,p)=>n+p[0],0)/4,z:pump.points.reduce((n,p)=>n+p[1],0)/4};
for(const turn of [0,Math.PI/2,Math.PI,Math.PI*1.5])assert.equal(W.obstacleHit({...body,...center,angle:angle+turn},0).id,pump.id);
let trafficPairs=0;
for(let model=0;model<4;model++)for(const angle of [0,.3,Math.PI/4,Math.PI/2,Math.PI]){
 c.DriveCareer={model:()=>model};const a=S.vehicleBody({x:0,z:0,angle},true),b=S.vehicleBody({x:0,z:0,angle:angle+Math.PI});const gap=a.halfWidth+b.halfWidth+.01;b.x=-Math.sin(angle)*gap;b.z=Math.cos(angle)*gap;assert(!S.bodiesOverlap(a,b));b.x*=.5;b.z*=.5;assert(S.bodiesOverlap(a,b));trafficPairs++;
}
assert.equal(new Set(W.collisionShapes.map(q=>q.id)).size,W.collisionShapes.length,'unique stable collider IDs');
console.log(JSON.stringify({buildingImpacts,nearMisses,pumpCases,trafficPairs,colliders:W.collisionShapes.length,checks:'passed'}));

c.DriveCareer={model:()=>0};
const quick=fresh(),quickStart=world(2.65-(body.halfLength+.001)/site.scale,1.45);
Object.assign(quick.player,quickStart,{speed:.8});S.update(quick,{},.05);assert.equal(quick.collisions,1);
quick.player.speed=-1;for(let i=0;i<7;i++){quick.violationEvent=null;S.update(quick,{s:true},.05);}
assert(!quick.staticContact);quick.player.speed=.8;
for(let i=0;i<20&&quick.collisions===1;i++){quick.violationEvent=null;S.update(quick,{w:true},.05);}
assert.equal(quick.collisions,2,'distinct physical impact must not be swallowed by global cooldown');assert(quick.time<2);
console.log(JSON.stringify({rapidRecontact:'passed',elapsed:quick.time}));
