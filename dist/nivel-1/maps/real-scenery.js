/* Viscri-only OSM geometry builder. Uses Pixel Drive surfaces and scene chunk batching. */
(()=>{
function build({W,scene,windows}){
 const T=THREE,D=W.mapData;
 const color=(c,r=.95,type=null)=>new T.MeshStandardMaterial({color:c,map:type?DriveSurfaces.textures[type]:null,bumpMap:type?DriveSurfaces.textures[type]:null,bumpScale:type==='tile'?.035:type==='brick'?.018:.012,roughness:r,side:T.DoubleSide});
 const asphalt=color('#a0a19b',.92,'asphalt'),setts=color('#e0e0d6',.95),gravel=color('#8b877b',1),pathMat=color('#a79d87',.95),wallColors=['#c8b99a','#d5c8a7','#bdae91','#d7d1bb','#bda98d'].map(c=>color(c,.9,'brick')),roofColors=['#a94e38','#b75e43','#843d32','#ab6446','#746256'].map(c=>color(c,.9,'tile'));
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
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(idx);geo.computeVertexNormals();const mesh=new T.Mesh(geo,mat);mesh.position.set(ox,0,oz);mesh.receiveShadow=true;mesh.castShadow=false;scene.add(mesh);return mesh;
 }
 function horizontalPolygon(points,y,mat){if(points.length<3)return;const ox=points.reduce((n,p)=>n+p[0],0)/points.length,oz=points.reduce((n,p)=>n+p[1],0)/points.length,shape=new T.Shape();shape.moveTo(points[0][0]-ox,-(points[0][1]-oz));for(let i=1;i<points.length;i++)shape.lineTo(points[i][0]-ox,-(points[i][1]-oz));shape.closePath();const mesh=new T.Mesh(new T.ShapeGeometry(shape),mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(ox,y,oz);mesh.receiveShadow=true;mesh.castShadow=false;scene.add(mesh);return mesh;}
 function clipPolygon(points,axis,value,greater){const output=[];if(!points.length)return output;const coord=p=>p[axis],inside=p=>greater?coord(p)>=value:coord(p)<=value;let prev=points[points.length-1],prevInside=inside(prev);for(const cur of points){const curInside=inside(cur);if(curInside!==prevInside){const t=(value-coord(prev))/(coord(cur)-coord(prev));output.push([prev[0]+(cur[0]-prev[0])*t,prev[1]+(cur[1]-prev[1])*t]);}if(curInside)output.push(cur);prev=cur;prevInside=curInside;}return output;}
 function tiledPolygon(points,y,mat,tile=12){if(points.length<3)return;const xs=points.map(p=>p[0]),zs=points.map(p=>p[1]),minX=Math.floor(Math.min(...xs)/tile),maxX=Math.floor(Math.max(...xs)/tile),minZ=Math.floor(Math.min(...zs)/tile),maxZ=Math.floor(Math.max(...zs)/tile);for(let x=minX;x<=maxX;x++)for(let z=minZ;z<=maxZ;z++){let clipped=clipPolygon(points,0,x*tile,true);clipped=clipPolygon(clipped,0,(x+1)*tile,false);clipped=clipPolygon(clipped,1,z*tile,true);clipped=clipPolygon(clipped,1,(z+1)*tile,false);if(clipped.length>=3)horizontalPolygon(clipped,y,mat);}}
 // Land parcels preserve the mapped edge between built-up village and fields.
 for(const a of D.areas){const material=a.type==='forest'||a.type==='wood'?color('#576941'):a.type==='water'?color('#597b78'):a.type==='farmland'?color('#8c8c5b'):color('#72864c');tiledPolygon(a.points,.008,material);}
 // Continuous mitered cross-sections preserve road width around bends.
 // Subdivide after joining, so chunk boundaries share both position and UV phase.
 function normalAt(pts,i){const a=pts[Math.max(0,i-1)],p=pts[i],b=pts[Math.min(pts.length-1,i+1)];let ax=p[0]-a[0],az=p[1]-a[1],bx=b[0]-p[0],bz=b[1]-p[1];let al=Math.hypot(ax,az),bl=Math.hypot(bx,bz);if(!al){ax=bx;az=bz;al=bl;}if(!bl){bx=ax;bz=az;bl=al;}if(!al||!bl)return[0,1];ax/=al;az/=al;bx/=bl;bz/=bl;const nx=-az-bz,nz=ax+bx,nl=Math.hypot(nx,nz);if(nl<.001)return[-az,ax];const gain=Math.min(2,1/Math.max(.01,(-az*nx+ax*nz)/nl));return[nx/nl*gain,nz/nl*gain];}
 for(const r of W.roads){const unpaved=['unpaved','gravel','fine_gravel','dirt','ground','earth','sand'].includes(r.surface)||(!r.surface&&r.type==='track');const material=unpaved?gravel:['sett','cobblestone','paving_stones'].includes(r.surface)?setts:asphalt;
  const normals=r.points.map((_,i)=>normalAt(r.points,i));let traveled=0;
  for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]),count=Math.max(1,Math.ceil(len/8));
   for(let k=0;k<count;k++){const ts=[k/count,(k+1)/count],part=ts.map(t=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]),ns=ts.map(t=>[normals[i-1][0]*(1-t)+normals[i][0]*t,normals[i-1][1]*(1-t)+normals[i][1]*t]);roadMesh(part,r.width+.14,gravel,.018,ns,traveled+len*k/count);roadMesh(part,r.width,material,.028,ns,traveled+len*k/count);}
   traveled+=len;
  }
 }
 for(const f of W.footways)for(const part of f.parts)roadMesh(part,f.type==='steps'?.16:.12,pathMat,.036);
 // Footprints are copied from mapped building ways; façades and red-tile roofs
 // are generated in the established low-poly Pixel Drive art style.
 let seed=817;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 DriveBuildingKit.build({T,scene,buildings:D.buildings,nearestRoad:W.nearestRoad,windows,canPlaceDetail:(x,z,id)=>{
  const road=W.nearestRoad({x,z});if(road&&road.d<road.segment.width/2+.15)return false;
  if(D.buildings.some(b=>b.id!==id&&horizontalContains(b.points,x,z)))return false;
  return !W.serviceSites.some(site=>{const p=W.serviceSiteLocal([x,z],site);return p.x>-.5&&p.x<10.5&&Math.abs(p.z)<5.5;})&&!W.roadAt(x,z);
 }});
 // Tree clusters and garden vegetation follow open mapped residential and field parcels.
 const leafColors=['#516b3a','#667b42','#718447','#7b8e50'].map(c=>color(c));const trunk=color('#69533b');let treeCount=0;
 for(const area of D.areas){if(!['residential','forest','meadow','farmland'].includes(area.type))continue;const pts=area.points,bx=[Math.min(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[0]))],bz=[Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[1]))];const count=area.type==='forest'?38:area.type==='residential'?26:12;
  for(let i=0;i<count;i++){const x=bx[0]+rnd()*(bx[1]-bx[0]),z=bz[0]+rnd()*(bz[1]-bz[0]);if(!horizontalContains(pts,x,z)||W.roadAt(x,z)||(()=>{const n=W.nearestRoad({x,z});return n&&n.d<n.segment.width/2+.7;})()||D.buildings.some(b=>horizontalContains(b.points,x,z)||b.points.some(p=>Math.hypot(p[0]-x,p[1]-z)<1.2))||W.serviceSites.some(s=>{const p=W.serviceSiteLocal([x,z],s);return p.x>-.5&&p.x<10.5&&Math.abs(p.z)<5.5;}))continue;const size=.45+rnd()*.45;const stem=new T.Mesh(new T.CylinderGeometry(.045,.075,.72*size,7),trunk);stem.position.set(x,.36*size,z);stem.castShadow=true;scene.add(stem);for(let k=0;k<24;k++){const crown=new T.Mesh(new T.PlaneGeometry(.4*size,.3*size),DriveSurfaces.leafMaterials[k%3]);const angle=rnd()*Math.PI*2,r=Math.sqrt(rnd())*.4*size;crown.position.set(x+Math.cos(angle)*r,.8*size+rnd()*.38*size,z+Math.sin(angle)*r);crown.rotation.set((rnd()-.5)*1.1,angle,0);crown.castShadow=true;scene.add(crown);}treeCount++;}
 }
 return {treeCount};
}
function horizontalContains(points,x,z){let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
window.DriveRealScenery={build};
})();
