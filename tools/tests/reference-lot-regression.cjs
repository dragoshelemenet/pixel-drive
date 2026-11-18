const {context}=require('./game-context.cjs'),assert=require('assert');
const c=context('viscri');for(const f of ['maps/viscri-data','maps/service-layout','maps/road-safety','maps/viscri-world','world','rules','simulation'])c.load(f);
const W=c.DriveWorld,S=c.DriveSimulation,lot=W.referenceLot;
assert(lot&&Math.hypot(W.playerStart.x-lot.center.x,W.playerStart.z-lot.center.z)<2);
for(let model=0;model<4;model++){c.DriveCareer={model:()=>model};const s=S.create();assert(W.poseFits(s.player,s.traffic,1.6));const start={...s.player};for(let i=0;i<180;i++)S.update(s,{w:true},1/60);assert.equal(s.collisions,0);assert(Math.hypot(s.player.x-start.x,s.player.z-start.z)>.9);}
console.log(JSON.stringify({lot:lot.id,spawn:W.playerStart,allFourCars:'safe launch passed'}));
