/* Real settlement adapter. Road/building geometry is derived from OSM ways. */
(()=>{
 const D=window.DriveViscriData;if(!D)throw new Error('Viscri map data failed to load');
 const V=[{x:0,z:-1},{x:1,z:0},{x:0,z:1},{x:-1,z:0}],size=D.bounds.maxX;
 const angleDir=a=>((Math.round(a/(Math.PI/2)+1)%4)+4)%4;
 // Keep each rendered OSM way segment small enough for the existing 8-unit
 // scenery streamer. Overlap the final vertex so the road remains continuous.
 const lineParts=(points,maxLength=8)=>{const parts=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/maxLength));for(let k=0;k<n;k++)parts.push([[a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n],[a[0]+(b[0]-a[0])*(k+1)/n,a[1]+(b[1]-a[1])*(k+1)/n]]);}return parts;};
 const roads=D.roads.map(r=>({...r,parts:lineParts(r.points),segments:[],bounds:[]}));
 const footways=D.footways.map(f=>({...f,parts:lineParts(f.points)}));
 const cells=new Map(),cellSize=10,segmentList=[];
 for(const r of roads)for(const part of r.parts)for(let i=1;i<part.length;i++){
  const a={x:part[i-1][0],z:part[i-1][1]},b={x:part[i][0],z:part[i][1]},dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz);if(len<.015)continue;
  const seg={a,b,dx:dx/len,dz:dz/len,len,width:r.width,road:r};segmentList.push(seg);
  const minX=Math.floor((Math.min(a.x,b.x)-r.width)/cellSize),maxX=Math.floor((Math.max(a.x,b.x)+r.width)/cellSize),minZ=Math.floor((Math.min(a.z,b.z)-r.width)/cellSize),maxZ=Math.floor((Math.max(a.z,b.z)+r.width)/cellSize);
  for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){const k=x+','+z;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(seg);}
 }
 function nearest(point){let best=null,bd=Infinity;const cx=Math.floor(point.x/cellSize),cz=Math.floor(point.z/cellSize);for(let ring=0;ring<3;ring++)for(let x=cx-ring;x<=cx+ring;x++)for(let z=cz-ring;z<=cz+ring;z++)for(const s of cells.get(x+','+z)||[]){const t=Math.max(0,Math.min(1,((point.x-s.a.x)*s.dx+(point.z-s.a.z)*s.dz)/s.len)),x0=s.a.x+s.dx*t*s.len,z0=s.a.z+s.dz*t*s.len,d=Math.hypot(point.x-x0,point.z-z0);if(d<bd){bd=d;best={segment:s,x:x0,z:z0,d,tangent:{x:s.dx,z:s.dz}};}}return best;}
 const junctions=D.intersections.map((q,i)=>({id:'osm-'+q.id,col:i%8,row:Math.floor(i/8),x:q.position[0],z:q.position[1],type:q.roads.length>=3?'right':'merge',roadIds:q.roads,links:{}}));
 const byRoad=new Map();for(const j of junctions)for(const id of j.roadIds){if(!byRoad.has(id))byRoad.set(id,[]);byRoad.get(id).push(j);}
 for(const list of byRoad.values())for(const a of list)for(const b of list){if(a===b)continue;const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<.15)continue;const dir=angleDir(Math.atan2(dz,dx));if(!a.links[dir]||d<a.links[dir].distance)a.links[dir]={node:b,distance:d};}
 const neighbors=(j,d)=>j?.links?.[d]?.node||null;
 function vector(d,point){const ideal=V[d]||V[0];if(point?.links){const n=point.links[d]?.node;if(n){const l=Math.hypot(n.x-point.x,n.z-point.z)||1;return{x:(n.x-point.x)/l,z:(n.z-point.z)/l};}}
  const q=point&&Number.isFinite(point.x)?point:{x:size/2,z:size/2},n=nearest(q);if(n){let x=n.tangent.x,z=n.tangent.z;if(x*ideal.x+z*ideal.z<0){x=-x;z=-z;}return{x,z};}return ideal;}
 const heading=a=>angleDir(a),right=(d,p)=>{const v=vector(d,p);return{x:-v.z,z:v.x};};
 function roadAt(x,z,margin=0){// A junction is the union of its roads: a nearer narrow way must not
 // hide the wider road that actually contains this point.
 const candidates=cells.get(Math.floor(x/cellSize)+','+Math.floor(z/cellSize))||[];
 for(const seg of candidates){const t=Math.max(0,Math.min(seg.len,(x-seg.a.x)*seg.dx+(z-seg.a.z)*seg.dz));if(Math.hypot(x-seg.a.x-seg.dx*t,z-seg.a.z-seg.dz*t)<=seg.width/2-margin)return true;}return Math.abs(x-W.trainingCenter.x)<=13-margin&&Math.abs(z-W.trainingCenter.z)<=6-margin;}
 const rounds=roads.filter(r=>r.type==='roundabout');
 const poi=(name)=>D.pois.find(p=>p.name===name)?.position;
 const pickup=poi('Punct gastronomic local')||[213.165,157.603];
 const parking=D.pois.find(p=>p.type==='parking')?.position||[232.115,86.281];
 const startSnap=nearest({x:parking[0],z:parking[1]}),start=startSnap?[startSnap.x,startSnap.z]:parking;
 const onRoad=(p)=>{const n=nearest({x:p[0],z:p[1]});return n?[n.x,n.z]:p;};
 const trainingCenter=[132,263];
 const services=[
  {name:'Școala auto · punct de instruire',x:onRoad([191.2,177.6])[0],z:onRoad([191.2,177.6])[1],type:'school',source:'Punct virtual de instruire'},
  {name:'Punct de alimentare · joc',x:onRoad([204.2,168.4])[0],z:onRoad([204.2,168.4])[1],type:'fuel',source:'Magazin mixt'},
  {name:'Parcare și garaj · joc',x:start[0],z:start[1],type:'cars',source:'Parcare OSM · acces rutier apropiat'},
  {name:'Atelier · joc',x:onRoad([299.3,71.6])[0],z:onRoad([299.3,71.6])[1],type:'custom',source:'Viscri Blacksmith'},
  {name:'Poligon auto',x:trainingCenter[0],z:trainingCenter[1],type:'training'}
 ];
 const landmarks=[
  {id:'pickup',kind:'pickup',name:'Punct de preluare · Viscri',x:onRoad(pickup)[0],z:onRoad(pickup)[1]},
  {id:'dropoff',kind:'dropoff',name:'Biserica fortificată din Viscri',x:onRoad([154.8,157.9])[0],z:onRoad([154.8,157.9])[1]},
  {id:'parking',kind:'parking',name:'Parcare la intrarea în sat',x:start[0],z:start[1]},
  ...D.pois.filter(p=>p.name&&['cafe','restaurant','museum','attraction','guest_house','bakery','convenience','kindergarten'].includes(p.type)).map((p,i)=>({id:'poi-'+p.id,kind:p.type,name:p.name,x:p.position[0],z:p.position[1]}))
 ];
 // Unverified road signs must not be scattered randomly across the settlement.
 const signs=[];
 // Keep only explicit numeric limits and OSM's urban value. RO:rural can span
 // mapped ways that enter the built-up village, so it is not treated as 90
 // km/h throughout the clipped game map; the simulation defaults to 50 there.
 const postedLimit=r=>{const n=Number.parseInt(r.maxspeed,10);if(Number.isFinite(n))return n;if(r.maxspeed==='RO:urban')return 50;return null;};
 // These limit boards illustrate way tags, not surveyed sign-node positions.
 const unit=D.projection.gameUnitsPerMeter;
 const inside=(ps,x,z)=>{let yes=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++)if((ps[i][1]>z)!==(ps[j][1]>z)&&x<(ps[j][0]-ps[i][0])*(z-ps[i][1])/(ps[j][1]-ps[i][1])+ps[i][0])yes=!yes;return yes;};
 const clearSign=(x,z)=>!segmentList.some(s=>{const t=Math.max(0,Math.min(s.len,(x-s.a.x)*s.dx+(z-s.a.z)*s.dz));return Math.hypot(x-s.a.x-s.dx*t,z-s.a.z-s.dz*t)<s.width/2+.2*unit;})&&!D.buildings.some(b=>inside(b.points,x,z));
 for(const r of roads){const limit=postedLimit(r);if(![30,50,90].includes(limit))continue;
  const dirs=r.oneway==='-1'?[-1]:['yes','1','true'].includes(r.oneway)?[1]:[1,-1];
  for(const direction of dirs){const pts=direction===1?r.points:[...r.points].reverse();let placed=false;
   for(let i=1;i<pts.length&&!placed;i++){const a=pts[i-1],b=pts[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.01)continue;const vx=(b[0]-a[0])/len,vz=(b[1]-a[1])/len;
    for(const f of [.25,.5,.75]){const offset=r.width/2+.65*unit,x=a[0]+vx*len*f-vz*offset,z=a[1]+vz*len*f+vx*offset;if(!clearSign(x,z))continue;
     signs.push({id:'way-limit-'+r.id+'-'+direction,kind:'limit'+limit,x,z,d:angleDir(Math.atan2(vz,vx)),angle:Math.atan2(vz,vx),source:'way-maxspeed',surveyed:false,osm:true});placed=true;break;}
   }
  }
 }
 // Use road-aligned, safe starts for speed practice instead of intersection-centre spawns.
 // Reserve the whole largest selectable car, plus a clear launch corridor.
 // Narrow roads need a centred start; a fixed quarter-width offset clips curbs.
 const spawnLength=.55*.67*1.36,spawnWidth=.29*.67*1.24;
 const launchFits=p=>{const vx=Math.cos(p.angle),vz=Math.sin(p.angle);
  for(let d=0;d<=1.6;d+=.1)for(const a of [-spawnLength,0,spawnLength])for(const b of [-spawnWidth,0,spawnWidth])
   if(!roadAt(p.x+vx*(a+d)-vz*b,p.z+vz*(a+d)+vx*b,.04))return false;
  return true;
 };
 const scenarios=[];
 // Evaluated after W exists because roadAt also exposes the training area.
 function safeStarts(){for(const r of roads.filter(r=>postedLimit(r))){
  const direction=r.oneway==='-1'?-1:1;
  const candidates=segmentList.filter(s=>s.road===r&&s.len>3).sort((a,b)=>b.len-a.len);
  for(const seg of candidates){const vx=seg.dx*direction,vz=seg.dz*direction;
   const offset=Math.max(0,Math.min(r.width/4,r.width/2-spawnWidth-.06));
   const p={kind:'speed',x:(seg.a.x+seg.b.x)/2-vz*offset,z:(seg.a.z+seg.b.z)/2+vx*offset,angle:Math.atan2(vz,vx),title:'Viteză adaptată · Viscri',hint:'Respectă limita sectorului. Indicatoarele de viteză sunt reprezentări ale datelor drumului, nu poziții verificate în teren.'};
   if(launchFits(p)){scenarios.push(p);break;}
  }
  if(scenarios.length===8)break;
 }
 if(!scenarios.length)throw new Error('No safe Viscri driving starts');
 if(!launchFits(W.playerStart)){const p=scenarios.reduce((a,b)=>Math.hypot(a.x-start[0],a.z-start[1])<Math.hypot(b.x-start[0],b.z-start[1])?a:b);W.playerStart={x:p.x,z:p.z,angle:p.angle};}
 }
 const startTangent=nearest({x:start[0],z:start[1]})?.tangent||vector(1,{x:start[0],z:start[1]});
 if(startTangent.x<0){startTangent.x=-startTangent.x;startTangent.z=-startTangent.z;}
 const W={realMap:true,vehicleScale:0.67,serviceScale:0.5,mapData:D,SIZE:size,HALF:.65,LANE:.2,AXES:[],V,right,vector,heading,neighbor:neighbors,junctions,roundabouts:rounds,signs,services,landmarks,parkingBays:[],scenarios,roads,footways,buildings:D.buildings,areas:D.areas,pois:D.pois,playerStart:{x:start[0],z:start[1],angle:Math.atan2(startTangent.z,startTangent.x)},trainingCenter:{x:trainingCenter[0],z:trainingCenter[1]},roadAt,nearestRoad:nearest,
  light:(j,d,time)=>'green',pedGreen:()=>true,
  speedLimitAt:(x,z)=>{const n=nearest({x,z});return n?postedLimit(n.segment.road):null;},
  mapAttribution:'© OpenStreetMap contributors · ODbL 1.0',mapAttributionUrl:'https://www.openstreetmap.org/copyright'};
 // Provide graph edges only between genuinely shared OSM road nodes.
 W.neighbor=neighbors;W.realTrafficRoutes=roads.filter(r=>r.points.length>3&&!['service','track'].includes(r.type));
 W.scenarios=scenarios;
 safeStarts();
 DriveServiceLayout.apply(W);
 window.DriveWorld= W;
})();
