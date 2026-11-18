/* Viscri-only OSM geometry builder. Uses Pixel Drive surfaces and scene chunk batching. */
(()=>{
function build({W,scene,windows,deferBuildings=false,stream=false}){
 const T=THREE,D=W.mapData,recipes=[];let target=scene;
 function emit(points,height,fn,kind='surface'){if(!stream){fn();return;}const bounds=new T.Box3();for(const p of points)bounds.expandByPoint(new T.Vector3(p[0],0,p[1]));bounds.max.y=height;bounds.expandByScalar(.03);recipes.push({bounds,kind,build:group=>{target=group;try{fn();}finally{target=scene;}}});}
 const color=(c,r=.95,type=null)=>new T.MeshStandardMaterial({color:c,map:type?DriveSurfaces.textures[type]:null,bumpMap:type?DriveSurfaces.textures[type]:null,bumpScale:type==='tile'?.035:type==='brick'?.018:.012,roughness:r,side:T.DoubleSide});
 const asphalt=color('#a0a19b',.92,'asphalt'),setts=color('#e0e0d6',.95),gravel=color('#8b877b',1),pathMat=color('#a79d87',.95),wallColors=['#c8b99a','#d5c8a7','#bdae91','#d7d1bb','#bda98d'].map(c=>color(c,.9,'brick')),roofColors=['#a94e38','#b75e43','#843d32','#ab6446','#746256'].map(c=>color(c,.9,'tile'));
 const localGravel=color('#b3ada0',1);
 const grit=document.createElement('canvas');grit.width=grit.height=256;const gg=grit.getContext('2d');gg.fillStyle='#a8a293';gg.fillRect(0,0,256,256);let gritSeed=751;for(let i=0;i<14000;i++){gritSeed=(Math.imul(gritSeed,1664525)+1013904223)>>>0;const x=gritSeed%256;gritSeed=(Math.imul(gritSeed,1664525)+1013904223)>>>0;const z=gritSeed%256,v=110+gritSeed%90;gg.fillStyle=`rgb(${v},${v-3},${v-12})`;gg.fillRect(x,z,1+(gritSeed%2),1);}
 const gritTexture=new T.CanvasTexture(grit);gritTexture.wrapS=gritTexture.wrapT=T.RepeatWrapping;gritTexture.colorSpace=T.SRGBColorSpace;localGravel.map=localGravel.bumpMap=gritTexture;localGravel.bumpScale=.006;
 const paint=color('#f4efe1',.95);paint.polygonOffset=true;paint.polygonOffsetFactor=-1;paint.polygonOffsetUnits=-1;
 // Small reusable procedural stone surface, in the same low-poly material style.
 // OSM surface=sett determines where it is used; the stone pattern is illustrative.
 const stoneCanvas=document.createElement('canvas');stoneCanvas.width=stoneCanvas.height=512;const stone=stoneCanvas.getContext('2d');stone.fillStyle='#777972';stone.fillRect(0,0,512,512);
 for(let row=0;row<32;row++)for(let col=-1;col<17;col++){const shade=143+((row*17+col*23+613)%31);stone.fillStyle=`rgb(${shade},${shade},${shade-7})`;stone.fillRect(col*32+(row%2)*16+1,row*16+1,30,14);}
 const stoneTexture=new T.CanvasTexture(stoneCanvas);stoneTexture.wrapS=stoneTexture.wrapT=T.RepeatWrapping;stoneTexture.colorSpace=T.SRGBColorSpace;stoneTexture.anisotropy=4;setts.map=setts.bumpMap=stoneTexture;setts.bumpScale=.006;
 function roadMesh(points,width,mat,y=.025,normals=null,startLength=0){
  if(!points||points.length<2)return;const pos=[],uv=[],idx=[];let length=startLength;const ox=(points[0][0]+points[points.length-1][0])/2,oz=(points[0][1]+points[points.length-1][1])/2;
  for(let i=0;i<points.length;i++){const p=points[i],prev=points[Math.max(0,i-1)],next=points[Math.min(points.length-1,i+1)],dx=next[0]-prev[0],dz=next[1]-prev[1],l=Math.hypot(dx,dz)||1,nx=normals?normals[i][0]:-dz/l,nz=normals?normals[i][1]:dx/l;
   pos.push(p[0]+nx*width/2-ox,y,p[1]+nz*width/2-oz,p[0]-nx*width/2-ox,y,p[1]-nz*width/2-oz);if(i)length+=Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1]);uv.push(0,length*.9,1,length*.9);
   if(i<points.length-1){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new T.Mesh(geo,mat);mesh.position.set(ox,0,oz);mesh.receiveShadow=true;mesh.castShadow=false;mesh.userData.surface=mat===paint?'marking':mat===asphalt||mat===setts?'pavement':'other';target.add(mesh);return mesh;
 }
 function horizontalPolygon(points,y,mat){if(points.length<3)return;const ox=points.reduce((n,p)=>n+p[0],0)/points.length,oz=points.reduce((n,p)=>n+p[1],0)/points.length,shape=new T.Shape();shape.moveTo(points[0][0]-ox,-(points[0][1]-oz));for(let i=1;i<points.length;i++)shape.lineTo(points[i][0]-ox,-(points[i][1]-oz));shape.closePath();const mesh=new T.Mesh(new T.ShapeGeometry(shape),mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(ox,y,oz);const pos=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+ox)/3,(-pos.getY(i)+oz)/3);uv.needsUpdate=true;mesh.receiveShadow=true;mesh.castShadow=false;target.add(mesh);return mesh;}
 function clipPolygon(points,axis,value,greater){const output=[];if(!points.length)return output;const coord=p=>p[axis],inside=p=>greater?coord(p)>=value:coord(p)<=value;let prev=points[points.length-1],prevInside=inside(prev);for(const cur of points){const curInside=inside(cur);if(curInside!==prevInside){const t=(value-coord(prev))/(coord(cur)-coord(prev));output.push([prev[0]+(cur[0]-prev[0])*t,prev[1]+(cur[1]-prev[1])*t]);}if(curInside)output.push(cur);prev=cur;prevInside=curInside;}return output;}
 function tiledPolygon(points,y,mat,tile=12){if(points.length<3)return;const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),minX=Math.floor(Math.min(...xs)/tile),maxX=Math.floor(Math.max(...xs)/tile),minZ=Math.floor(Math.min(...zs)/tile),maxZ=Math.floor(Math.max(...zs)/tile);for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){let clipped=clipPolygon(points,0,x*tile,true);clipped=clipPolygon(clipped,0,(x+1)*tile,false);clipped=clipPolygon(clipped,1,z*tile,true);clipped=clipPolygon(clipped,1,(z+1)*tile,false);if(clipped.length>=3)emit(clipped,.05,()=>horizontalPolygon(clipped,y,mat));}}
 // Land parcels preserve the mapped edge between built-up village and fields.
 const landMaterials=new Map();
 for(const a of D.areas){const type=a.type==='forest'||a.type==='wood'?'forest':a.type==='water'?'water':a.type==='farmland'?'farmland':'grass';
  if(!landMaterials.has(type))landMaterials.set(type,type==='water'?color('#597b78'):color({forest:'#acb89c',farmland:'#d6c99f',grass:'#d5d5c0'}[type],1,'grass'));
  tiledPolygon(a.points,.008,landMaterials.get(type));
 }
 // Continuous mitered cross-sections preserve road width around bends.
 // Subdivide after joining, so chunk boundaries share both position and UV phase.
 function normalAt(pts,i){const a=pts[Math.max(0,i-1)],p=pts[i],b=pts[Math.min(pts.length-1,i+1)];let ax=p[0]-a[0],az=p[1]-a[1],bx=b[0]-p[0],bz=b[1]-p[1];let al=Math.hypot(ax,az),bl=Math.hypot(bx,bz);if(!al){ax=bx;az=bz;al=bl;}if(!bl){bx=ax;bz=az;bl=al;}if(!al||!bl)return[0,1];ax/=al;az/=al;bx/=bl;bz/=bl;const nx=-az-bz,nz=ax+bx,nl=Math.hypot(nx,nz);if(nl<.001)return[-az,ax];const gain=Math.min(2,1/Math.max(.01,(-az*nx+ax*nz)/nl));return[nx/nl*gain,nz/nl*gain];}
 // Illustrative gameplay markings, not surveyed paint locations. Their dash
 // phase uses the whole road length, so streaming/segment boundaries do not reset it.
 function markings(r,a,b,ns,phase,length){
  if(length<1e-6)return;
  const point=t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
  const normal=t=>[ns[0][0]+(ns[1][0]-ns[0][0])*t,ns[0][1]+(ns[1][1]-ns[0][1])*t];
  const strip=(lo,hi,offset)=>{if(hi-lo<.001)return;const ts=[lo/length,hi/length],norms=ts.map(normal),ps=ts.map((t,i)=>{const p=point(t);return[p[0]+norms[i][0]*offset,p[1]+norms[i][1]*offset];});roadMesh(ps,.025,paint,.041,norms,phase+lo);};
  // Leave crossing areas open. Ignore ordinary bend/merge vertices.
  const gaps=[];for(const j of W.junctions||[]){if(j.type!=='right'&&!((j.roadIds||[]).length>=3))continue;const dx=b[0]-a[0],dz=b[1]-a[1],t=((j.x-a[0])*dx+(j.z-a[1])*dz)/(length*length),d=Math.hypot(j.x-a[0]-t*dx,j.z-a[1]-t*dz),radius=Math.max(.65,r.width*.8);if(d<radius){const along=t*length,h=Math.sqrt(radius*radius-d*d);gaps.push([along-h,along+h]);}}
  let intervals=[[0,length]];for(const [g0,g1] of gaps)intervals=intervals.flatMap(([lo,hi])=>g1<=lo||g0>=hi?[[lo,hi]]:[[lo,Math.min(hi,g0)],[Math.max(lo,g1),hi]].filter(([a,b])=>b>a));
  for(const [lo,hi] of intervals){
   for(const side of [-1,1])strip(lo,hi,side*(r.width/2-.065));
   if(!['yes','1','true','-1'].includes(r.oneway))for(let n=Math.floor((phase+lo)/1.2);n*1.2<phase+hi;n++)strip(Math.max(lo,n*1.2-phase),Math.min(hi,n*1.2+.55-phase),0);
  }
 }
 for(const r of W.roads){const unpaved=['unpaved','gravel','fine_gravel','dirt','ground','earth','sand'].includes(r.surface)||(!r.surface&&r.type==='track');const material=unpaved?gravel:['sett','cobblestone','paving_stones'].includes(r.surface)?setts:asphalt;
  const normals=r.normals||r.points.map((_,i)=>normalAt(r.points,i));let traveled=0;
  for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),lotCenter=W.referenceLot?.center,t=lotCenter?Math.max(0,Math.min(1,((lotCenter.x-a[0])*(b[0]-a[0])+(lotCenter.z-a[1])*(b[1]-a[1]))/(len*len))):0,nearLot=lotCenter&&Math.hypot(a[0]+(b[0]-a[0])*t-lotCenter.x,a[1]+(b[1]-a[1])*t-lotCenter.z)<W.referenceLot.radius+1,count=Math.max(1,Math.ceil(len/(nearLot?1:8)));
   for(let k=0;k<count;k++){const ts=[k/count,(k+1)/count],part=ts.map(t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]),ns=ts.map(t=>[normals[i-1][0]*(1-t)+normals[i][0]*t,normals[i-1][1]*(1-t)+normals[i][1]*t]);const phase=traveled+len*k/count,h=(r.width+.14)/2,edges=part.flatMap((p,i)=>[[p[0]+ns[i][0]*h,p[1]+ns[i][1]*h],[p[0]-ns[i][0]*h,p[1]-ns[i][1]*h]]);const lot=W.referenceLot,local=lot&&Math.hypot((part[0][0]+part[1][0])/2-lot.center.x,(part[0][1]+part[1][1])/2-lot.center.z)<lot.radius;emit(edges,.05,()=>{roadMesh(part,r.width+.14,local?localGravel:gravel,.018,ns,phase);roadMesh(part,r.width,local?localGravel:material,.028,ns,phase);if(!local&&!unpaved&&!['track','service','path','footway'].includes(r.type)&&r.width>=.95)markings(r,part[0],part[1],ns,phase,len/count);},'road');}
   traveled+=len;
  }
 }
 for(const f of W.footways)for(const part of f.parts)emit(part.map(p=>[p[0]-.12,p[1]-.12]).concat(part.map(p=>[p[0]+.12,p[1]+.12])),.06,()=>roadMesh(part,f.type==='steps'?.16:.12,pathMat,.036));
 // Footprints are copied from mapped building ways; façades and red-tile roofs
 // are generated in the established low-poly Pixel Drive art style.
 let seed=817;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 if(!deferBuildings&&!stream)DriveBuildingKit.build({T,scene,buildings:D.buildings,nearestRoad:W.nearestRoad,windows,canPlaceDetail:(x,z,id)=>{
  const road=W.nearestRoad({x,z});if(road&&road.d<road.segment.width/2+.15)return false;
  if(D.buildings.some(b=>b.id!==id&&horizontalContains(b.points,x,z)))return false;
  return !W.serviceSites.some(site=>{const p=W.serviceSiteLocal([x,z],site);return p.x>-.5&&p.x<10.5&&Math.abs(p.z)<5.5;})&&!W.roadAt(x,z);
 }});
 // Tree clusters and garden vegetation follow open mapped residential and field parcels.
 const leafColors=['#516b3a','#667b42','#718447','#7b8e50'].map(c=>color(c));const trunk=color('#69533b');let treeCount=0;
 for(const area of D.areas){if(!['residential','forest','meadow','farmland'].includes(area.type))continue;const pts=area.points,bx=[Math.min(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[0]))],bz=[Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[1]))];const count=area.type==='forest'?38:area.type==='residential'?26:12;
  for(let i=0;i<count;i++){const x=bx[0]+rnd()*(bx[1]-bx[0]),z=bz[0]+rnd()*(bz[1]-bz[0]);if(!horizontalContains(pts,x,z)||W.roadAt(x,z)||(()=>{const n=W.nearestRoad({x,z});return n&&n.d<n.segment.width/2+.7;})()||D.buildings.some(b=>horizontalContains(b.points,x,z)||b.points.some(p=>Math.hypot(p[0]-x,p[1]-z)<1.2))||W.serviceSites.some(s=>{const p=W.serviceSiteLocal([x,z],s);return p.x>-.5&&p.x<10.5&&Math.abs(p.z)<5.5;}))continue;const size=.45+rnd()*.45,crowns=Array.from({length:24},(_,k)=>{const angle=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.4*size;return {k,angle,x:x+Math.cos(angle)*r,y:.8*size+rnd()*.38*size,z:z+Math.sin(angle)*r,tilt:(rnd()-.5)*1.1};});
   emit([[x-.7,z-.7],[x+.7,z+.7]],1.3,()=>{const stem=new T.Mesh(new T.CylinderGeometry(.045,.075,.72*size,7),trunk);stem.position.set(x,.36*size,z);stem.castShadow=true;target.add(stem);
    for(const p of crowns){const crown=new T.Mesh(new T.PlaneGeometry(.4*size,.3*size),DriveSurfaces.leafMaterials[p.k%3]);crown.position.set(p.x,p.y,p.z);crown.rotation.set(p.tilt,p.angle,0);crown.castShadow=true;target.add(crown);}
   },'vegetation');treeCount++;}
 }
 return {treeCount,recipes};
}
function horizontalContains(points,x,z){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
window.DriveRealScenery={build};
})();
