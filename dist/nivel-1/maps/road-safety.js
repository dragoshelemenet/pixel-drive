/* Shared footprint, launch and mission placement checks for the real map. */
(()=>{
const contains=(ps,x,z)=>{let yes=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++)if((ps[i][1]>z)!==(ps[j][1]>z)&&x<(ps[j][0]-ps[i][0])*(z-ps[i][1])/(ps[j][1]-ps[i][1])+ps[i][0])yes=!yes;return yes;};
function apply(W){
 const obstacles=new Map(),colliders=[],size=8;
 const add=(points,type='building',id=type+'-'+colliders.length)=>{const collider={id,type,points};colliders.push(collider);const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]);for(let x=Math.floor((Math.min(...xs)-1)/size);x<=Math.floor((Math.max(...xs)+1)/size);x++)for(let z=Math.floor((Math.min(...zs)-1)/size);z<=Math.floor((Math.max(...zs)+1)/size);z++){const key=x+','+z;if(!obstacles.has(key))obstacles.set(key,[]);obstacles.get(key).push(collider);}};
 W.buildings.forEach(b=>add(b.points,'building','building-'+b.id));
 // Solid service buildings and parked cars. The entrance/interaction lane stays clear.
 for(const site of W.serviceSites){const rect=(x0,x1,z0,z1,type='service')=>add([[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>[site.x+(x*site.ux-z*site.uz)*site.scale,site.z+(x*site.uz+z*site.ux)*site.scale]),type);
  // Ground-level walls, not the canopy/roof or the entire paved plot.
  if(site.type==='fuel')rect(5.25,8.75,-2.2,3.2);
  if(site.type==='school'){rect(4.3,8.8,-3.25,3.25);rect(3.45,4.35,-.7,.7,'step');}
  if(site.type==='custom'){rect(4.19,8.75,-3.3,3.3);for(const z of [-1.7,1.7])rect(3.2,4.2,z-1.2,z+1.2,'step');rect(2.95,3.45,2.65,3.35,'cabinet');}
  if(site.type==='cars'){rect(4.25,4.35,-3.5,3.5);rect(8.54,8.76,-3.5,3.5);}
  rect(8.99,9.11,-4.65,4.65,'wall');
  for(const z of [-4.6,4.6])rect(1.1,9.1,z-.06,z+.06,'wall');
  const parked=site.type==='school'?[[2.5,-2.9],[2.5,2]]:site.type==='cars'?[[2.5,-2.9],[2.5,.5],[5.7,-2],[5.7,1.7]]:site.type==='custom'?[[2.7,-1.6]]:[];
  const l=.55*(W.vehicleScale||1)/site.scale,w=.29*(W.vehicleScale||1)/site.scale;
  for(const [x,z] of parked)rect(x-l,x+l,z-w,z+w,'parked-car');
  if(site.type==='fuel'){for(const z of [-1.45,1.45])rect(2.65,3.35,z-.6,z+.6,'pump');for(const x of [1.65,4.15])for(const z of [-2.45,2.45])rect(x-.045,x+.045,z-.045,z+.045,'column');rect(1.725,1.875,-4.225,-3.575,'fuel-sign');}
 }
 function hit(p,pad=.07,onlyId=null){const halfL=p.halfLength??.55*.67*1.36,halfW=p.halfWidth??.29*.67*1.24,c=Math.cos(p.angle),s=Math.sin(p.angle);
  const local=point=>[(point[0]-p.x)*c+(point[1]-p.z)*s,-(point[0]-p.x)*s+(point[1]-p.z)*c];
  for(const collider of obstacles.get(Math.floor(p.x/size)+','+Math.floor(p.z/size))||[]){if(onlyId&&collider.id!==onlyId)continue;const {points}=collider;
   if(contains(points,p.x,p.z))return collider;
   for(const a of [-halfL-pad,halfL+pad])for(const b of [-halfW-pad,halfW+pad])if(contains(points,p.x+c*a-s*b,p.z+s*a+c*b))return collider;
   const ps=points.map(local),l=halfL+pad,w=halfW+pad;
   for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length];let lo=0,hi=1;
    for(const [v,d,mn,mx] of [[a[0],b[0]-a[0],-l,l],[a[1],b[1]-a[1],-w,w]]){if(Math.abs(d)<1e-9){if(v<mn||v>mx){hi=-1;break;}}else{const t0=(mn-v)/d,t1=(mx-v)/d;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));}}
    if(lo<=hi)return collider;
   }
  }return null;
 }
 const blocked=(p,pad=.07)=>!!hit(p,pad);
 function fits(p,traffic=[],corridor=0){if(!Number.isFinite(p.x+p.z+p.angle))return false;
  const c=Math.cos(p.angle),s=Math.sin(p.angle),l=p.halfLength??.55*.67*1.36,w=p.halfWidth??.29*.67*1.24;
  for(let d=0;d<=corridor+.001;d+=.2){const q={...p,x:p.x+c*d,z:p.z+s*d};if(blocked(q))return false;
   for(const a of [-l,0,l])for(const b of [-w,0,w])if(!W.roadAt(q.x+c*a-s*b,q.z+s*a+c*b,.025))return false;
   if(traffic.some(t=>Math.hypot(t.x-q.x,t.z-q.z)<1.5))return false;
  }return true;
 }
 // Build connectivity from shared mapped vertices; use the main village component.
 const nodes=new Map(),key=p=>p[0].toFixed(3)+','+p[1].toFixed(3);
 for(const road of W.roads)for(const p of road.points){const k=key(p);if(!nodes.has(k))nodes.set(k,{x:p[0],z:p[1],edges:[],links:new Set(),roads:new Set()});nodes.get(k).roads.add(road);}
 for(const road of W.roads)for(let i=1;i<road.points.length;i++){const a=nodes.get(key(road.points[i-1])),b=nodes.get(key(road.points[i]));a.links.add(b);b.links.add(a);}
 const seen=new Set(),components=[];
 for(const node of nodes.values()){if(seen.has(node))continue;const q=[node],roads=new Set();seen.add(node);for(let i=0;i<q.length;i++){for(const r of q[i].roads)roads.add(r);for(const n of q[i].links)if(!seen.has(n)){seen.add(n);q.push(n);}}components.push({roads,nodes:q.length});}
 components.sort((a,b)=>b.nodes-a.nodes);const connected=components[0].roads;
 const segments=[];
 for(const road of connected)for(let i=1;i<road.points.length;i++){
  const a=nodes.get(key(road.points[i-1])),b=nodes.get(key(road.points[i])),length=Math.hypot(b.x-a.x,b.z-a.z),forward=road.oneway!=='-1',reverse=!['yes','1','true'].includes(road.oneway);
  if(length<.001)continue;const angle=Math.atan2(b.z-a.z,b.x-a.x);let clear=true;for(let d=0;d<=length;d+=.2)if(blocked({x:a.x+(b.x-a.x)*d/length,z:a.z+(b.z-a.z)*d/length,angle})){clear=false;break;}if(!clear)continue;if(forward)a.edges.push({to:b,length});if(reverse)b.edges.push({to:a,length});segments.push({a,b,length,forward,reverse});
 }
 function snap(point){let best=null;for(const seg of segments){const {a,b,length}=seg,t=Math.max(0,Math.min(1,((point.x-a.x)*(b.x-a.x)+(point.z-a.z)*(b.z-a.z))/(length*length))),x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,d=Math.hypot(point.x-x,point.z-z);if(!best||d<best.d)best={seg,t,x,z,d};}return best;}
 // Navigation follows every OSM polyline vertex instead of drawing straight
 // chords between coarse intersections (which could cross houses or gardens).
 W.routeRoad=(from,to)=>{const start=snap(from),end=snap(to);if(!start||!end)return[];
  if(start.seg===end.seg&&((start.t<=end.t&&start.seg.forward)||(start.t>=end.t&&start.seg.reverse)))return[{x:start.x,z:start.z},{x:end.x,z:end.z},{x:to.x,z:to.z}];
  const distances=new Map(),previous=new Map(),queue=new Set();
  for(const [node,cost,allowed] of [[start.seg.a,start.t*start.seg.length,start.seg.reverse],[start.seg.b,(1-start.t)*start.seg.length,start.seg.forward]])if(allowed){distances.set(node,cost);previous.set(node,null);queue.add(node);}
  while(queue.size){let node=null;for(const q of queue)if(!node||distances.get(q)<distances.get(node))node=q;queue.delete(node);
   for(const edge of node.edges){const d=distances.get(node)+edge.length;if(d<(distances.get(edge.to)??Infinity)){distances.set(edge.to,d);previous.set(edge.to,node);queue.add(edge.to);}}
  }
  let finish=null,best=Infinity;
  for(const [node,cost,allowed] of [[end.seg.a,end.t*end.seg.length,end.seg.forward],[end.seg.b,(1-end.t)*end.seg.length,end.seg.reverse]])if(allowed&&(distances.get(node)??Infinity)+cost<best){finish=node;best=distances.get(node)+cost;}
  if(!finish)return[];const path=[];for(let q=finish;q;q=previous.get(q))path.unshift({x:q.x,z:q.z});return[{x:start.x,z:start.z},...path,{x:end.x,z:end.z},{x:to.x,z:to.z}];
 };
 const candidates=[];
 for(const road of connected){if(['track','service'].includes(road.type))continue;for(let i=1;i<road.points.length;i++){
  const a=road.points[i-1],b=road.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<2.8)continue;
  const directions=road.oneway==='-1'?[-1]:['yes','1','true'].includes(road.oneway)?[1]:[1,-1];
  for(const dir of directions)for(let d=.8;d<len-.8;d+=1.2){const vx=(b[0]-a[0])/len*dir,vz=(b[1]-a[1])/len*dir,offset=Math.min(road.width*.25,road.width/2-.29*.67*1.24-.08);
   const p={x:a[0]+(b[0]-a[0])*d/len-vz*offset,z:a[1]+(b[1]-a[1])*d/len+vx*offset,angle:Math.atan2(vz,vx),roadId:road.id};
   if(fits(p,[],1.6))candidates.push(p);
  }
 }}
 if(!candidates.length)throw new Error('No clear road positions for Viscri');
 function safePose(preferred,traffic=[],{corridor=1.6,keep=true}={}){
  if(keep&&fits(preferred,traffic,corridor))return{x:preferred.x,z:preferred.z,angle:preferred.angle};
  const cost=p=>Math.hypot(p.x-preferred.x,p.z-preferred.z)+(Number.isFinite(preferred.angle)?(1-Math.cos(p.angle-preferred.angle))*2:0);
  const sorted=candidates.slice().sort((a,b)=>cost(a)-cost(b));const p=sorted.find(p=>fits(p,traffic,corridor));
  if(!p)throw new Error('No traffic-clear retry position');return{...p};
 }
 W.obstacleHit=hit;W.collisionShapes=colliders;W.poseFits=fits;W.obstacleAt=blocked;W.safePose=safePose;W.safeRoadPoses=candidates;W.connectedRoads=connected;
 W.playerStart=safePose(W.playerStart,[],{keep:false});
 for(const lesson of W.scenarios)Object.assign(lesson,safePose(lesson,[],{keep:false}));
 // Stop near the requested landmark, outside junctions and commercial entrances.
 const used=[];
 for(const id of ['pickup','dropoff','parking']){const landmark=W.landmarks.find(l=>l.id===id),choices=candidates.filter(p=>W.junctions.every(j=>Math.hypot(p.x-j.x,p.z-j.z)>4.2)&&W.services.every(s=>Math.hypot(p.x-s.x,p.z-s.z)>3.8)&&used.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>5));
  choices.sort((a,b)=>Math.hypot(a.x-landmark.x,a.z-landmark.z)-Math.hypot(b.x-landmark.x,b.z-landmark.z));
  let selected;
  for(const p of choices){const route=W.routeRoad(W.playerStart,p);if(!route.length||Math.hypot(route.at(-2).x-p.x,route.at(-2).z-p.z)>.65)continue;
   let routeClear=true;for(let i=1;i<route.length&&routeClear;i++){const a=route[i-1],b=route[i],length=Math.hypot(b.x-a.x,b.z-a.z);for(let d=0;d<length;d+=.2)if(blocked({x:a.x+(b.x-a.x)*d/length,z:a.z+(b.z-a.z)*d/length,angle:Math.atan2(b.z-a.z,b.x-a.x)})){routeClear=false;break;}}if(!routeClear)continue;
   const n=W.nearestRoad(p),r={x:-Math.sin(p.angle),z:Math.cos(p.angle)},passenger={x:n.x+r.x*(n.segment.width/2+.22),z:n.z+r.z*(n.segment.width/2+.22),angle:p.angle,halfLength:.12,halfWidth:.12};
   if(blocked(passenger)||W.roadAt(passenger.x,passenger.z))continue;
   if(!fits({...p,x:p.x-Math.cos(p.angle)*1.2,z:p.z-Math.sin(p.angle)*1.2},[],2.8))continue;
   selected={...p,passenger};break;
  }
  if(!selected)throw new Error('No accessible passenger/parking position: '+id);
  Object.assign(landmark,{requested:{x:landmark.x,z:landmark.z},...selected,stopRadius:.65});used.push(selected);
 }
 // Show speed boards at actual changes between mapped ways, not once per way.
 // OSM way tags do not establish surveyed physical sign locations.
 const limit=r=>{const n=parseInt(r.maxspeed,10);return Number.isFinite(n)?n:50;},u=W.mapData.projection.gameUnitsPerMeter;
 const clearSign=p=>!W.roadAt(p.x,p.z,-.05)&&!blocked({...p,halfLength:.08,halfWidth:.08})&&!W.serviceSites.some(site=>{const q=W.serviceSiteLocal([p.x,p.z],site);return q.x>-.5&&q.x<10&&Math.abs(q.z)<5;});
 for(const road of connected){const value=limit(road);if(![20,30,50,90].includes(value)||(!/^\d/.test(road.maxspeed)&&road.maxspeed!=='RO:urban'))continue;
  const directions=road.oneway==='-1'?[-1]:['yes','1','true'].includes(road.oneway)?[1]:[1,-1];
  for(const dir of directions){const pts=dir===1?road.points:[...road.points].reverse(),entry=pts[0],incoming=[...nodes.get(key(entry)).roads].filter(r=>r!==road);
   const boundary=entry[0]<.01||entry[1]<.01||entry[0]>W.SIZE-.01||entry[1]>W.SIZE-.01;
   if(!incoming.some(r=>limit(r)!==value)&&!boundary)continue;
   let traveled=0,placed=false;
   for(let i=1;i<pts.length&&!placed;i++){const a=pts[i-1],b=pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.001)continue;
    const vx=(b[0]-a[0])/len,vz=(b[1]-a[1])/len;
    for(const f of [.35,.65]){const d=traveled+len*f;if(d<.5||d>4)continue;const offset=road.width/2+.14+.5*u,p={x:a[0]+vx*len*f-vz*offset,z:a[1]+vz*len*f+vx*offset,angle:Math.atan2(vz,vx)};
     if(!clearSign(p)||W.signs.some(q=>q.kind==='limit'+value&&Math.hypot(q.x-p.x,q.z-p.z)<8))continue;
     W.signs.push({...p,id:'transition-'+road.id+'-'+dir,kind:'limit'+value,d:W.heading(p.angle),source:'way-maxspeed',surveyed:false,roadId:road.id,reason:boundary?'map-entry':'mapped-limit-change',entry:{x:entry[0],z:entry[1]},previousLimits:incoming.map(limit)});placed=true;break;
    }traveled+=len;if(traveled>4)break;
   }
  }
 }
 W.yieldApproaches=[];
 for(const site of W.serviceSites){const angle=Math.atan2(-site.uz,-site.ux),right={x:site.uz,z:-site.ux},exit={x:site.x-site.ux*.12,z:site.z-site.uz*.12};
  const p={x:site.x+site.ux*.35+right.x*.7,z:site.z+site.uz*.35+right.z*.7,angle};
  if(W.roadAt(p.x,p.z,-.02)||blocked({...p,halfLength:.05,halfWidth:.05}))continue;
  const sign={...p,id:'exit-yield-'+site.type,kind:'yield',d:W.heading(angle),source:'virtual-service-exit',surveyed:false,reason:'yield-to-public-road',site,exit};
  W.signs.push(sign);W.yieldApproaches.push(sign);
 }
}
window.DriveRoadSafety={apply,contains};
})();
