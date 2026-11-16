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
 function roadAt(x,z,margin=0){const n=nearest({x,z});if(n&&n.d<=n.segment.width/2-margin)return true;if(Math.abs(x-start[0])<2+margin&&Math.abs(z-start[1])<2.3+margin)return true;return Math.abs(x-W.trainingCenter.x)<=13-margin&&Math.abs(z-W.trainingCenter.z)<=6-margin;}
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
 const signs=[];const kinds=['stop','yield','priorityIntersection','children','roadworks','slippery','bump','limit30','limit50','roundabout'];
 const mainRoads=roads.filter(r=>['secondary','residential','unclassified','living_street'].includes(r.type));
 for(let i=0;i<Math.min(18,junctions.length);i++){const j=junctions[(i*2+3)%junctions.length],dirs=Object.keys(j.links).map(Number);if(!dirs.length)continue;const d=dirs[i%dirs.length],v=vector(d,j),r=right(d,j),kind=kinds[i%kinds.length];signs.push({id:'learn-'+i,kind,x:j.x-v.x*1.8+r.x*1.55,z:j.z-v.z*1.8+r.z*1.55,d,j:j.id,training:true});}
 // Keep only explicit numeric limits and OSM's urban value. RO:rural can span
 // mapped ways that enter the built-up village, so it is not treated as 90
 // km/h throughout the clipped game map; the simulation defaults to 50 there.
 const postedLimit=r=>{const n=Number.parseInt(r.maxspeed,10);if(Number.isFinite(n))return n;if(r.maxspeed==='RO:urban')return 50;return null;};
 for(const r of roads){const limit=postedLimit(r);if(!limit||r.points.length<3)continue;const i=Math.floor(r.points.length/2),a=r.points[i-1],b=r.points[i+1]||r.points[i],p=r.points[i],d=angleDir(Math.atan2(b[1]-a[1],b[0]-a[0]));signs.push({id:'osm-limit-'+r.id,kind:'limit'+limit,x:p[0],z:p[1],d,osm:true});}
 const scenarios=signs.slice(0,8).map((q,i)=>{const j=junctions.find(j=>j.id===q.j);return{kind:q.kind,x:j?.x||q.x,z:j?.z||q.z,junctionId:j?.id,title:['Oprire la STOP','Cedează trecerea','Prioritate în intersecție','Zonă cu copii','Lucrări pe drum','Carosabil alunecos','Drum cu denivelări','Limită de viteză'][i],hint:'Urmează drumul real din Viscri și studiază indicatorul cu I înainte de manevră.'};});
 const startTangent=nearest({x:start[0],z:start[1]})?.tangent||vector(1,{x:start[0],z:start[1]});
 if(startTangent.x<0){startTangent.x=-startTangent.x;startTangent.z=-startTangent.z;}
 const W={realMap:true,mapData:D,SIZE:size,HALF:.65,LANE:.2,AXES:[],V,right,vector,heading,neighbor:neighbors,junctions,roundabouts:rounds,signs,services,landmarks,parkingBays:[{id:'public-parking',x:start[0],z:start[1],w:4,h:4.6,kind:'parking'}],scenarios,roads,footways,buildings:D.buildings,areas:D.areas,pois:D.pois,playerStart:{x:start[0],z:start[1],angle:Math.atan2(startTangent.z,startTangent.x)},trainingCenter:{x:trainingCenter[0],z:trainingCenter[1]},roadAt,nearestRoad:nearest,
  light:(j,d,time)=>'green',pedGreen:()=>true,
  speedLimitAt:(x,z)=>{const n=nearest({x,z});return n?postedLimit(n.segment.road):null;},
  mapAttribution:'© OpenStreetMap contributors · ODbL 1.0',mapAttributionUrl:'https://www.openstreetmap.org/copyright'};
 // Provide graph edges only between genuinely shared OSM road nodes.
 W.neighbor=neighbors;W.realTrafficRoutes=roads.filter(r=>r.points.length>3&&!['service','track'].includes(r.type));
 W.scenarios=scenarios;
 DriveServiceLayout.apply(W);
 window.DriveWorld= W;
})();
