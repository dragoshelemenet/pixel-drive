(()=>{
const fallback=DriveRender;let unavailable=false;const T=THREE,W=DriveWorld,scene=new T.Scene();scene.background=new T.Color('#8193a1');scene.fog=new T.Fog('#8193a1',35,95);
let renderer,camera,heading=null,mirrorClock=-1;const mirrorTargets=[new T.WebGLRenderTarget(512,256),new T.WebGLRenderTarget(512,256)],mirrorCamera=new T.PerspectiveCamera(48,2,.1,60);const dynamic=new T.Group();scene.add(dynamic);const windows=[],lamps=[];
const mat=(c,r=.85)=>new T.MeshStandardMaterial({color:c,roughness:r});const materials={grass:mat('#71844b'),road:mat('#3e4145'),walk:mat('#aaa593'),white:mat('#e6e2d1'),wood:mat('#635341'),glass:mat('#547480',.2)};
materials.grass=DriveSurfaces.surface('grass','#d5d5c0');materials.road=DriveSurfaces.surface('asphalt','#969d9e');
const boxes=new Map();function box(x,y,z,w,h,d,m,parent=scene){const key=[w,h,d].join(',');if(!boxes.has(key))boxes.set(key,new T.BoxGeometry(w,h,d));const o=new T.Mesh(boxes.get(key),typeof m==='string'?mat(m):m);o.position.set(x,y,z);o.castShadow=h>.18&&w*d>.04;o.receiveShadow=true;if(m===materials.grass||m===materials.road){o.geometry=o.geometry.clone();const pos=o.geometry.attributes.position,uv=o.geometry.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+x)/3,(pos.getZ(i)+z)/3);uv.needsUpdate=true;}parent.add(o);return o;}
function label(text,color='#e8e5d6'){const c=document.createElement('canvas');c.width=256;c.height=128;const g=c.getContext('2d');g.fillStyle='#18241e';g.fillRect(0,0,256,128);g.fillStyle=color;g.font='bold 25px sans-serif';g.textAlign='center';g.fillText(text,128,72);return new T.CanvasTexture(c);}
box(48,-.22,56,134,.4,118,materials.grass);
for(const a of W.AXES){box(48,-.01,a,116,.12,4.25,materials.walk);if(a===8){for(const [z,len] of [[16,20],[72,68]])box(a,-.01,z,4.25,.12,len,materials.walk);}else box(a,-.01,56,4.25,.12,100,materials.walk);box(48,.06,a,115,.06,3.2,materials.road);if(a===8){for(const [z,len] of [[16,20],[72,68]])box(a,.06,z,3.2,.06,len,materials.road);}else box(a,.06,56,3.2,.06,99,materials.road);for(let n=-7;n<104;n+=1.8){if(W.AXES.every(v=>Math.abs(v-n)>2.8)){box(n,.101,a,.7,.015,.045,materials.white);if(!(a===8&&n>25.5&&n<38.5))box(a,.101,n,.045,.015,.7,materials.white);}}}
for(const j of W.junctions){if(j.type==='roundabout'){const disk=(radius,y,height,m)=>{const geo=new T.CylinderGeometry(radius,radius,height,64);const pos=geo.attributes.position,uv=geo.attributes.uv;for(let i=0;i<pos.count;i++)uv.setXY(i,(pos.getX(i)+j.x)/3,(pos.getZ(i)+j.z)/3);const o=new T.Mesh(geo,m);o.position.set(j.x,y,j.z);o.receiveShadow=true;scene.add(o);return o;};
disk(4.1,.09,.07,materials.road);disk(1.87,.15,.18,materials.walk);disk(1.72,.21,.12,materials.grass);
// Raised island edging and broken outer edging, leaving all four entries open.
for(let i=0;i<64;i++){const a=i*Math.PI*2/64;const curb=box(j.x+Math.cos(a)*1.82,.23,j.z+Math.sin(a)*1.82,.18,.13,.09,i%4<2?materials.walk:materials.white);curb.rotation.y=-a+Math.PI/2;if(Math.abs(Math.sin(a))>.43&&Math.abs(Math.cos(a))>.43){const edge=box(j.x+Math.cos(a)*4.13,.15,j.z+Math.sin(a)*4.13,.42,.12,.1,materials.walk);edge.rotation.y=-a+Math.PI/2;}}
for(let d=0;d<4;d++){const v=W.V[d],r=W.right(d);for(let k=0;k<3;k++)box(j.x-v.x*4.3+r.x*(.35+k*.36),.13,j.z-v.z*4.3+r.z*(.35+k*.36),d%2?.08:.22,.015,d%2?.22:.08,materials.white);const a=d*Math.PI/2+.5;const arrow=new T.Mesh(new T.ShapeGeometry((()=>{const sh=new T.Shape();sh.moveTo(-.11,-.35);sh.lineTo(.11,-.35);sh.lineTo(.11,.1);sh.lineTo(.25,.1);sh.lineTo(0,.4);sh.lineTo(-.25,.1);sh.lineTo(-.11,.1);sh.closePath();return sh;})()),materials.white);arrow.rotation.set(-Math.PI/2,0,-a);arrow.position.set(j.x+Math.cos(a)*2.9,.14,j.z+Math.sin(a)*2.9);scene.add(arrow);}
}else for(let d=0;d<4;d++){const v=W.V[d],r=W.right(d);if(!W.neighbor(j,(d+2)%4))continue;for(let n=-4;n<=4;n++)box(j.x-v.x*2+r.x*n*.35,.12,j.z-v.z*2+r.z*n*.35,d%2?.64:.18,.015,d%2?.18:.64,materials.white);}}
// Reusable neighborhood art, with detailed geometry batched by spatial cell below.
const art=DriveScenery.build({T,W,scene,box,mat,materials,windows});
const signFaces=[];for(const q of W.signs){box(q.x,.65,q.z,.045,1.3,.045,'#9a9b94');const face=new T.Sprite(new T.SpriteMaterial({map:DriveVisuals.sign(q.kind),transparent:true,depthTest:true}));face.scale.set(.8,.8,1);face.position.set(q.x,1.35,q.z);scene.add(face);signFaces.push(face);}
for(const b of W.parkingBays){box(b.x,.08,b.z,b.w,.06,b.h,materials.road);for(let z=-b.h/2;z<=b.h/2;z+=1.15)box(b.x,.12,b.z+z,b.w-.12,.014,.035,materials.white);box(b.x+b.w/2-.05,.12,b.z,.035,.014,b.h,materials.white);}
DriveServices.build({T,W,scene,box,mat,materials});
// Dedicated practice campus doubles the world's width, connected at the east road.
box(8,.08,32,26,.1,12,materials.road);
// Close only the former through-road at the practice boundaries.
for(const z of [26,38]){box(8,.38,z,4.2,.6,.18,'#ded7ba');for(let x=6.2;x<10;x+=.6)box(x,.4,z,.22,.3,.2,'#bb4e37');}
for(const q of DriveTraining.cones){const c=new T.Mesh(new T.ConeGeometry(.13,.4,10),mat('#e78637'));c.position.set(q.x,.3,q.z);c.castShadow=true;scene.add(c);box(q.x,.13,q.z,.33,.06,.33,'#292f2c');}
for(const t of DriveTraining.tasks){for(const side of [-1,1]){const b=box(t.x+(t.a===0?0:side*.8),.12,t.z+(t.a===0?side*.8:0),t.a===0?3:.04,.02,t.a===0?.04:3,materials.white);}const marker=new T.Mesh(new T.TorusGeometry(.65,.035,8,32),new T.MeshBasicMaterial({color:'#97dbaa'}));marker.rotation.x=-Math.PI/2;marker.position.set(t.x,.16,t.z);scene.add(marker);}
// A continuous drive-over ramp: short ascent, level crest, descent, no vertical ends.
const rampGeo=new T.BufferGeometry(),rampVertices=[];
for(const [za,zb,ya,yb] of [[29.5,31.5,0,.55],[31.5,32.5,.55,.55],[32.5,34.5,.55,0]])rampVertices.push(17,ya+.14,za,19,ya+.14,za,19,yb+.14,zb,17,ya+.14,za,19,yb+.14,zb,17,yb+.14,zb);
rampGeo.setAttribute('position',new T.Float32BufferAttribute(rampVertices,3));rampGeo.computeVertexNormals();const ramp=new T.Mesh(rampGeo,new T.MeshStandardMaterial({color:'#92988e',roughness:.9,side:T.DoubleSide}));ramp.receiveShadow=true;scene.add(ramp);
for(const x of [17,19])for(let z=29.5;z<34.5;z+=.25)box(x,.18+DriveTraining.elevation(18,z),z,.06,.08,.25,materials.white);

// Visible hazards stay beside the lane; they do not obstruct NPC routes.
for(const q of W.signs){if(q.kind==='roadworks'){for(let i=0;i<5;i++){const cone=new T.Mesh(new T.ConeGeometry(.10,.30,8),mat('#eb8b37'));cone.position.set(q.x-.45,.25,q.z-1-i*.45);scene.add(cone);}box(q.x,.32,q.z-2,.12,.45,1.6,'#dcac57');}if(q.kind==='bump'){for(let i=0;i<3;i++)box(q.x-1.55,.105,q.z-1.2-i*.6,.65,.012,.25,'#5f6462');}}


for(const j of W.junctions){const offset=j.type==='roundabout'?4.8:2,x=j.x+offset,z=j.z+offset;box(x,1.4,z,.06,2.8,.06,'#7b817c');box(x-.3,2.8,z,.65,.06,.08,'#7b817c');const light=new T.PointLight('#ffd394',0,7,2);light.position.set(x-.6,2.65,z);scene.add(light);lamps.push(light);}
const ambient=new T.HemisphereLight('#dce9ff','#4f5934',1.25);scene.add(ambient);const sun=new T.DirectionalLight('#ffe5ba',3);sun.position.set(10,35,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-22;sun.shadow.camera.right=22;sun.shadow.camera.top=22;sun.shadow.camera.bottom=-22;sun.shadow.camera.near=.5;sun.shadow.camera.far=100;sun.shadow.bias=-.0002;sun.shadow.normalBias=.012;sun.shadow.radius=4;scene.add(sun);scene.add(sun.target);
const vehicle=DriveScenery.vehicle;
const player=vehicle('#e1e1d8');scene.add(player);const traffic=new Map(),people=[];
// Turn lights: local -Z is the car's front, +Z its rear.
// Emissive-looking amber lamps remain visible at dusk and in mirror renders.
const blinkOn=new T.MeshBasicMaterial({color:'#ffbe37',toneMapped:false});
const blinkOff=new T.MeshBasicMaterial({color:'#543d25'});
const turnLampGeo=new T.BoxGeometry(.105,.066,.034);
const turnLampMeshes={left:[],right:[]};
for(const [side,x] of [['left',-.205],['right',.205]]){
 for(const z of [-.538,.545]){
  const lens=new T.Mesh(turnLampGeo,blinkOff);
  lens.position.set(x,.278,z);lens.castShadow=false;player.add(lens);
  turnLampMeshes[side].push(lens);
 }
}
function updateTurnLamps(p,time){
 // 1.5 complete flashes per second, including at night.
 const lit=Math.floor(time*3)%2===0;
 for(const [side,dir] of [['left',-1],['right',1]]){
  const active=p.indicator===dir&&lit;
  for(const lens of turnLampMeshes[side])lens.material=active?blinkOn:blinkOff;
 }
}const headlights=new T.SpotLight('#fff2c4',0,18,.42,.6,1);headlights.position.set(0,.45,-.4);headlights.target.position.set(0,0,-10);player.add(headlights,headlights.target);
const signals=[];
const signalColors={red:'#ff3026',yellow:'#ffba20',green:'#35eb70'};
const signalOn={},signalOff={};for(const color of Object.keys(signalColors)){signalOn[color]=new T.MeshBasicMaterial({color:signalColors[color],toneMapped:false});signalOff[color]=mat({red:'#351716',yellow:'#352c13',green:'#132b1c'}[color]);}
const signalCase=mat('#202622'),signalTrim=mat('#0e1412'),signalPole=mat('#6b7470',.5);
const signalLens=new T.SphereGeometry(.073,16,10),signalRim=new T.TorusGeometry(.078,.012,6,20);
for(const j of W.junctions)if(j.type==='signal')for(let d=0;d<4;d++){
 if(!W.neighbor(j,(d+2)%4))continue;
 const v=W.V[d],r=W.right(d),x=j.x-v.x*2.1+r.x*1.91,z=j.z-v.z*2.1+r.z*1.91;
 const group=new T.Group();group.position.set(x,0,z);group.rotation.y=Math.atan2(-v.x,-v.z);group.userData.signal={junction:j.id,d};scene.add(group);
 box(0,.06,0,.15,.12,.15,signalPole,group);box(0,1.07,0,.055,2.1,.055,signalPole,group);
 const head=new T.Group();head.position.set(0,2.15,0);head.rotation.x=-.22;group.add(head);
 box(0,0,0,.29,.72,.15,signalCase,head);box(0,0,.082,.25,.67,.025,signalTrim,head);
 const lenses=[];['red','yellow','green'].forEach((color,i)=>{
  const y=.22-i*.22;const rim=new T.Mesh(signalRim,signalCase);rim.position.set(0,y,.105);head.add(rim);
  const lens=new T.Mesh(signalLens,signalOff[color]);lens.userData.signalColor=color;lens.scale.z=.28;lens.position.set(0,y,.111);head.add(lens);lenses.push({color,lens});
  // Short sun hood above each lens; it does not conceal the light from the driving camera.
  box(0,y+.092,.13,.19,.025,.10,signalCase,head);
 });signals.push({j,d,group,lenses});
}
const course=[];for(const [x,z] of [[12,28],[17,31],[12,35],[18,36]]){const m=new T.Mesh(new T.TorusGeometry(.7,.05,8,32),new T.MeshBasicMaterial({color:'#e4bd65'}));m.rotation.x=Math.PI/2;m.position.set(x,.18,z);scene.add(m);course.push(m);}
const markers=[];for(const l of W.landmarks){const ring=new T.Mesh(new T.TorusGeometry(.55,.045,8,32),new T.MeshBasicMaterial({color:'#83e1e8'}));ring.rotation.x=Math.PI/2;ring.position.set(l.x,.16,l.z);scene.add(ring);markers.push([l,ring]);if(l.kind==='pickup'||l.kind==='dropoff'){const tube=new T.Mesh(new T.CylinderGeometry(.55,.55,.45,40,1,true),new T.MeshBasicMaterial({color:'#6edeea',transparent:true,opacity:.2,side:T.DoubleSide,depthWrite:false,toneMapped:false}));tube.position.set(l.x,.38,l.z);scene.add(tube);const upper=ring.clone();upper.position.y=.6;scene.add(upper);}if(l.kind==='busStop'){box(l.x,1,l.z,1.3,.1,1.8,'#758a8b');for(const z of [-.8,.8])box(l.x,.5,l.z+z,1.2,1,.04,materials.glass);}}
const rainGeo=new T.BufferGeometry(),drops=new Float32Array(1500);for(let i=0;i<drops.length;i+=3){drops[i]=(Math.random()-.5)*36;drops[i+1]=Math.random()*20;drops[i+2]=(Math.random()-.5)*36;}rainGeo.setAttribute('position',new T.BufferAttribute(drops,3));const rainCloud=new T.Points(rainGeo,new T.PointsMaterial({color:'#c3dbe7',size:.035,transparent:true,opacity:.65}));scene.add(rainCloud);let rainy=Math.random()<.35,lastTime=0,wetness=0;
// Partition static scenery into small spatial cells. Inactive cells are detached
// from the scene, avoiding transform traversal and shadow rendering as well.
const chunks=new Map(),bounds=new T.Box3();scene.updateMatrixWorld(true);
for(const o of [...scene.children]){if((!o.isMesh&&!o.isSprite)||course.includes(o))continue;bounds.setFromObject(o);const size=new T.Vector3();bounds.getSize(size);if(size.x>16||size.z>16)continue;const key=Math.floor(o.position.x/8)+','+Math.floor(o.position.z/8);let cell=chunks.get(key);if(!cell){cell={group:new T.Group(),bounds:new T.Box3(),active:false};chunks.set(key,cell);}cell.bounds.union(bounds);cell.group.add(o);}
for(const cell of chunks.values()){
 cell.batched=false;cell.bounds.expandByScalar(6);
}
// Static meshes are constructed by the existing scenery builder, but merged and
// attached to the GPU scene only when a chunk enters the player's visible range.
// This is local render streaming (not network asset downloads).
const frustum=new T.Frustum(),projection=new T.Matrix4();
const lampPositions=lamps.map(l=>l.position.clone());lamps.forEach(l=>scene.remove(l));
const localLights=Array.from({length:4},()=>{const l=new T.PointLight('#ffd394',0,7,2);scene.add(l);return l;});
let minimap,wholeMap=true,lastWidth=0,lastHeight=0;function draw(canvas,s,dt){if(unavailable)return fallback.draw(canvas,s,dt);if(!renderer){try{renderer=new T.WebGLRenderer({canvas,antialias:true});}catch(e){unavailable=true;return fallback.draw(canvas,s,dt);}renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;camera=new T.PerspectiveCamera(36,16/9,.1,180);minimap=document.createElement('canvas');minimap.width=320;minimap.height=320;minimap.onclick=()=>wholeMap=!wholeMap;minimap.setAttribute('aria-label','Hartă: școală, benzinărie, salon auto, atelier, poligon și obiectiv. Click pentru zoom.');minimap.style='position:absolute;right:18px;bottom:18px;width:220px;height:220px;cursor:pointer;z-index:3;background:#14251cdd;border:1px solid #9aa491;border-radius:8px';canvas.parentNode.append(minimap);}
const w=canvas.clientWidth||1280,h=canvas.clientHeight||720;if(w!==lastWidth||h!==lastHeight){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();lastWidth=w;lastHeight=h;}const p=s.player;if(s.time<lastTime)rainy=Math.random()<.35;lastTime=s.time;const rainTarget=rainy&&s.time>50&&s.time<170?1:0;wetness+=(rainTarget-wetness)*(1-Math.exp(-dt*.35));rainCloud.visible=wetness>.02;rainCloud.material.opacity=.65*wetness;rainCloud.position.set(p.x,0,p.z);if(rainCloud.visible){for(let i=1;i<drops.length;i+=3){drops[i]-=dt*9;if(drops[i]<0)drops[i]=20;}rainGeo.attributes.position.needsUpdate=true;}materials.road.roughness=.85-.58*wetness;const model=window.DriveCareer?.model()||0;player.scale.set(1+model*.08,1+(model===2?.2:0),1+model*.12);const elevation=window.DriveTraining?.elevation(p.x,p.z)||0;player.position.set(p.x,elevation,p.z);player.rotation.y=-p.angle-Math.PI/2;updateTurnLamps(p,s.time);if(window.DriveCareer)player.children[0].material.color.set(DriveCareer.color());
// Lazy car mesh creation. Traffic far away keeps its simulation state but does
// not create GPU geometry until the player approaches that street.
for(const t of s.traffic){
 const dx=t.x-p.x,dz=t.z-p.z,near=dx*dx+dz*dz<(DriveTraining.active()?68:62)**2;
 let mesh=traffic.get(t.id);
 if(!near){if(mesh)mesh.visible=false;continue;}
 if(!mesh){mesh=vehicle(t.color);traffic.set(t.id,mesh);scene.add(mesh);}
 mesh.visible=true;mesh.position.set(t.x,0,t.z);mesh.rotation.y=-t.angle-Math.PI/2;
}
for(const [id,mesh] of traffic)if(!s.traffic.some(t=>t.id===id)){
 mesh.visible=false;scene.remove(mesh);traffic.delete(id);
}while(people.length<s.pedestrians.length){const g=new T.Group();box(0,.3,0,.13,.42,.12,'#527798',g);const head=new T.Mesh(new T.SphereGeometry(.09,8,6),mat('#d2af8c'));head.position.y=.62;g.add(head);scene.add(g);people.push(g);}s.pedestrians.forEach((v,i)=>people[i].position.set(v.x,0,v.z));
if(heading===null||s.time<.1)heading=p.angle;const delta=Math.atan2(Math.sin(p.angle-heading),Math.cos(p.angle-heading));heading+=delta*(1-Math.exp(-5*dt));const fx=Math.cos(heading),fz=Math.sin(heading);camera.position.set(p.x-fx*8.5,16.5,p.z-fz*8.5);camera.lookAt(p.x+fx*3,0,p.z+fz*3);
if(window.DriveTraining?.active()){const look=DriveCabin.look();camera.fov=64;camera.updateProjectionMatrix();const ex=p.x-Math.sin(p.angle)*(look.offsetX||0)-Math.cos(p.angle)*(look.offsetZ||0),ez=p.z+Math.cos(p.angle)*(look.offsetX||0)-Math.sin(p.angle)*(look.offsetZ||0),ey=1.12+elevation+(look.offsetY||0);camera.position.set(ex,ey,ez);camera.lookAt(ex+Math.cos(p.angle+look.yaw)*12*Math.cos(look.pitch),ey+Math.sin(look.pitch)*12,ez+Math.sin(p.angle+look.yaw)*12*Math.cos(look.pitch));player.visible=false;}else {player.visible=true;camera.fov=36;camera.updateProjectionMatrix();}
// A sustained late-afternoon sun fades smoothly into dusk, rather than losing its shadows immediately.
const dusk=T.MathUtils.smoothstep(s.time,150,660),night=T.MathUtils.smoothstep(s.time,330,780);
ambient.color.set('#bed1ed').lerp(new T.Color('#7f9fc8'),night);ambient.groundColor.set('#5b6346');ambient.intensity=.86-night*.56;
sun.intensity=(3.15*(1-dusk)+.06)*(1-.42*wetness);sun.color.set('#fff0cd').lerp(new T.Color('#ffb56c'),dusk);
sun.position.set(p.x-23,Math.max(9,15-dusk*6),p.z-16);sun.target.position.set(p.x,0,p.z);
headlights.intensity=1+night*15;const nearest=lampPositions.map(position=>({position,d:position.distanceToSquared(player.position)})).sort((a,b)=>a.d-b.d);
localLights.forEach((l,i)=>{l.position.copy(nearest[i].position);l.intensity=nearest[i].d<900?night*6:0;});windows.forEach(m=>{m.emissive.set('#ffd28a');m.emissiveIntensity=night*1.6;});
scene.background.set('#c6c4ae').lerp(new T.Color('#17243b'),night);scene.fog.color.copy(scene.background);scene.fog.near=22;scene.fog.far=78-20*wetness;
signals.forEach(({j,d,group,lenses})=>{group.visible=group.position.distanceToSquared(player.position)<1600;const active=W.light(j,d,s.time);lenses.forEach(({color,lens})=>{lens.material=color===active?signalOn[color]:signalOff[color];});});course.forEach((m,i)=>m.visible=DriveCareer.training()===i+1);camera.updateMatrixWorld(true);projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);frustum.setFromProjectionMatrix(projection);let activeChunks=0,chunkBatchBudget=5;
// Near + camera-frustum visibility. Activate only a handful of fresh cells per
// frame to avoid a single expensive mesh-merge spike while entering new streets.
const visibleCells=[];
for(const cell of chunks.values()){
 const near=cell.bounds.distanceToPoint(player.position)<70;
 const visible=near&&frustum.intersectsBox(cell.bounds);
 if(!visible&&cell.active){scene.remove(cell.group);cell.active=false;}
 if(visible)visibleCells.push(cell);
}
visibleCells.sort((a,b)=>a.bounds.distanceToPoint(player.position)-b.bounds.distanceToPoint(player.position));
for(const cell of visibleCells){
 if(!cell.batched&&chunkBatchBudget>0){DriveScenery.batch(cell.group);cell.batched=true;chunkBatchBudget--;}
 if(cell.batched&&!cell.active){scene.add(cell.group);cell.active=true;}
 if(cell.active)activeChunks++;
}
people.forEach(o=>o.visible=o.position.distanceToSquared(player.position)<2500);if(DriveTraining.active()&&performance.now()-mirrorClock>66){mirrorClock=performance.now();const added=[];for(const cell of chunks.values())if(!cell.active&&cell.bounds.distanceToPoint(player.position)<30){scene.add(cell.group);added.push(cell.group);}mirrorTargets.forEach((target,i)=>{const side=i===0?-1:1;mirrorCamera.position.set(p.x-Math.sin(p.angle)*side*.6,1.05+elevation,p.z+Math.cos(p.angle)*side*.6);const rearAngle=p.angle+Math.PI+side*.15;mirrorCamera.lookAt(mirrorCamera.position.x+Math.cos(rearAngle)*18,.85+elevation,mirrorCamera.position.z+Math.sin(rearAngle)*18);renderer.setRenderTarget(target);renderer.render(scene,mirrorCamera);});renderer.setRenderTarget(null);for(const g of added)scene.remove(g);DriveCabin.setMirrorTextures(mirrorTargets.map(t=>t.texture));}renderer.render(scene,camera);if(window.DriveCabin)DriveCabin.render(renderer,canvas,s);window.DriveRender.stats={activeChunks,totalChunks:chunks.size,readyChunks:[...chunks.values()].filter(c=>c.batched).length,activeTraffic:[...traffic.values()].filter(m=>m.visible).length,totalTraffic:s.traffic.length,streetLights:localLights.length,drawCalls:renderer.info?.render.calls};DriveVisuals.map(minimap,s,wholeMap);}

window.DriveRender={draw};
})();
