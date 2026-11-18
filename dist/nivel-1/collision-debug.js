/* Opt-in development overlay: ?collision-debug=1. No logging in normal play. */
(()=>{
 if(!new URLSearchParams(location.search).has('collision-debug'))return;
 let group,last=0,materials;
 const corners=p=>{const c=Math.cos(p.angle),s=Math.sin(p.angle);return[[-1,-1],[1,-1],[1,1],[-1,1]].map(([a,b])=>[p.x+c*a*p.halfLength-s*b*p.halfWidth,p.z+s*a*p.halfLength+c*b*p.halfWidth]);};
 window.DriveCollisionDebug={events:[],update({T,scene,s,W}){
  s.collisionDebug=this.events;
  if(!W.realMap)return;
  if(!group){group=new T.Group();scene.add(group);materials=[0x22ff66,0xff3344,0xffdd33,0x3399ff,0xff8822].map(color=>new T.LineBasicMaterial({color,depthTest:false}));}
  if(performance.now()-last<100)return;last=performance.now();
  for(const o of [...group.children]){o.geometry.dispose();group.remove(o);}
  const line=(points,color,closed=true)=>{const ps=closed?[...points,points[0]]:points;const geometry=new T.BufferGeometry().setFromPoints(ps.map(p=>new T.Vector3(p[0],.22,p[1])));const o=new T.Line(geometry,materials[color]);o.renderOrder=999;group.add(o);};
  line(corners(DriveSimulation.vehicleBody(s.player,true)),0);
  for(const q of W.collisionShapes)if(q.points.some(p=>Math.hypot(p[0]-s.player.x,p[1]-s.player.z)<8))line(q.points,1);
  for(const t of s.traffic)if(Math.hypot(t.x-s.player.x,t.z-s.player.z)<8)line(corners(DriveSimulation.vehicleBody(t)),3);
  for(const r of W.roads)if(r.points.some(p=>Math.hypot(p[0]-s.player.x,p[1]-s.player.z)<8))for(const side of [-1,1])line(r.points.map((p,i)=>[p[0]+r.normals[i][0]*r.width/2*side,p[1]+r.normals[i][1]*r.width/2*side]),2,false);
  const event=this.events.at(-1);if(event&&s.time-event.time<3)line(corners(event.vehicle),4);
 }};
})();
