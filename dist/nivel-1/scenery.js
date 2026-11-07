/* Neighborhood geometry: shared materials, deterministic variation, per-cell batching. */
(()=>{
const T=THREE,palette=new Map();
const material=(color,roughness=.85)=>{const key=color+roughness;if(!palette.has(key))palette.set(key,new T.MeshStandardMaterial({color,roughness}));return palette.get(key);};
function build({W,scene,box,materials,windows}){
let seed=719;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const add=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
const B=(x,y,z,w,h,d,c)=>box(x,y,z,w,h,d,typeof c==='string'?material(c):c);
// Soft contact occlusion anchors buildings and trees even outside the moving sun shadow map.
const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const shadowCtx=shadowCanvas.getContext('2d');const gradient=shadowCtx.createRadialGradient(32,32,8,32,32,32);gradient.addColorStop(0,'rgba(12,20,15,.48)');gradient.addColorStop(.65,'rgba(12,20,15,.20)');gradient.addColorStop(1,'rgba(12,20,15,0)');shadowCtx.fillStyle=gradient;shadowCtx.fillRect(0,0,64,64);const contactMaterial=new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false,opacity:.65,polygonOffset:true,polygonOffsetFactor:-1});
const contactGeometry=new T.PlaneGeometry(1,1);function contact(x,z,w,d){const o=new T.Mesh(contactGeometry,contactMaterial);o.rotation.x=-Math.PI/2;o.position.set(x,.012,z);o.scale.set(w,d,1);scene.add(o);}
const stone=material('#96988a'),trim=material('#ddd9c8'),metal=material('#505d5b'),wood=material('#71614c');
const foliage=['#365333','#456337','#56753b','#678244','#75904b'].map(c=>material(c));
const leafGeo=new T.IcosahedronGeometry(1,1),leafCard=new T.PlaneGeometry(1,1),trunkGeo=new T.CylinderGeometry(.045,.075,1.1,7);
function tree(x,z,size=1){contact(x,z,2.2*size,2.2*size);size*=1.25;add(trunkGeo,wood,x,.6*size,z).scale.set(size,size*1.5,size);
for(let i=0;i<58;i++){const a=i*2.39996,r=.8*Math.sqrt((i+.5)/58);const xx=Math.cos(a)*r,zz=Math.sin(a)*r,yy=1.1+Math.sqrt(Math.max(0,.8*.8-r*r))*1.25;const o=add(leafCard,DriveSurfaces.leafMaterials[i%3],x+xx*size,yy*size,z+zz*size);const f=(.45+random()*.3)*size;o.scale.set(f,f,1);o.rotation.set(-Math.PI/2+random()*.9,a,random()*2);}
// Angled branch clusters create an irregular silhouette from a moving camera.
for(let i=0;i<12;i++){const a=i*2.4;const o=add(leafCard,DriveSurfaces.leafMaterials[i%3],x+Math.cos(a)*.55*size,1.15*size,z+Math.sin(a)*.55*size);o.scale.setScalar(.7*size);o.rotation.set(.1,a,.3);}}
function bush(x,z,r=.3){for(let i=0;i<5;i++){const o=add(leafGeo,foliage[(i+1)%5],x+Math.sin(i*2.4)*r*.6,r*.6,z+Math.cos(i*2.4)*r*.6);o.scale.set(r*.6,r*.65,r*.6);}}
function fence(x,z,len,alongX){const safe=(xx,zz)=>!W.roadAt(xx,zz,-.3)&&!W.roundabouts.some(j=>Math.hypot(xx-j.x,zz-j.z)<4.55)&&!W.parkingBays.some(b=>Math.abs(xx-b.x)<b.w/2+.4&&Math.abs(zz-b.z)<b.h/2+.4);for(let n=-len/2;n<len/2;n+=.18){const px=x+(alongX?n:0),pz=z+(alongX?0:n),ex=px+(alongX?.18:0),ez=pz+(alongX?0:.18);if(!safe(px,pz)||!safe(ex,ez))continue;for(const [y,h] of [[.18,.12],[.43,.06]]){const rail=B((px+ex)/2,y,(pz+ez)/2,alongX?.18:.06,h,alongX?.06:.18,wood);rail.userData.fence=true;}const post=B(px,.3,pz,.06,.58,.06,wood);post.userData.fence=true;}}
const roofs=[DriveSurfaces.surface('tile','#e4bba0'),DriveSurfaces.surface('slate','#89969c'),DriveSurfaces.surface('slate','#cdb99b'),DriveSurfaces.surface('slate','#aa9a90')];
const walls=[DriveSurfaces.surface('brick','#ded0bc'),DriveSurfaces.surface('brick','#ddd9c8'),DriveSurfaces.surface('brick','#bb9881'),DriveSurfaces.surface('brick','#c5c9c1')];
function roof(cx,cz,w,d,k){const y=1.35,h=.87;const slope=Math.hypot(w/2,h),tilt=Math.atan2(h,w/2);
for(const side of [-1,1]){const plane=add(new T.PlaneGeometry(slope,d),roofs[k%4],cx+side*w/4,y+h/2,cz);plane.rotation.set(-Math.PI/2,side*tilt,0);}
// Closed gable ends with textured masonry, fascia boards and ridge tiles.
for(const side of [-1,1]){const geo=new T.BufferGeometry();const v=[-w/2,y,0,w/2,y,0,0,y+h,0];if(side<0){[v[0],v[3]]=[v[3],v[0]];}geo.setAttribute('position',new T.Float32BufferAttribute(v,3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,.5,1],2));geo.computeVertexNormals();add(geo,walls[k%4],cx,0,cz+side*d/2);}
B(cx,y+h+.015,cz,.10,.08,d+.04,roofs[k%4]);for(const side of [-1,1])B(cx+side*w/2,y,cz,.08,.08,d+.05,metal);
// Solar panel grid lies on the left roof pitch.
if(k%3!==1){const panel=new T.Group();panel.position.set(cx-w*.25,y+h*.5+.035,cz);panel.rotation.z=tilt;scene.add(panel);box(0,0,0,.95,.045,1.6,metal,panel);box(0,.028,0,.89,.014,1.54,material('#243b54',.3),panel);for(let i=-3;i<=3;i++)box(0,.039,i*.22,.89,.008,.008,trim,panel);for(let i=-2;i<=2;i++)box(i*.18,.039,0,.008,.008,1.54,trim,panel);
// Flatten static solar groups into world-space meshes so they share scenery culling.
panel.updateMatrixWorld(true);for(const child of [...panel.children])scene.attach(child);scene.remove(panel);}
B(cx+.7,1.9,cz-.8,.25,.58,.28,walls[k%4]);B(cx+.7,2.21,cz-.8,.33,.06,.36,metal);
}
function house(x,z,k){const cx=x+1.3,cz=z+1.5;contact(cx,cz,3.6,4.1);B(cx,.14,cz,2.65,.24,3.05,'#777d70');B(cx,.75,cz,2.6,1.15,3,walls[k%4]);
for(const zz of [z-.02,z+3.02]){B(cx,1.26,zz,2.72,.12,.1,trim);for(const xx of [x+.45,x+2.15]){B(xx,.77,zz,.58,.57,.065,trim);const wm=material('#415560',.3);wm.userData.animated=true;if(!windows.includes(wm))windows.push(wm);B(xx,.77,zz+(zz>cz?.04:-.04),.46,.44,.035,wm);B(xx,.77,zz+(zz>cz?.065:-.065),.027,.44,.025,trim);B(xx,.76,zz+(zz>cz?.065:-.065),.46,.027,.025,trim);B(xx,.46,zz,.65,.065,.17,trim);}}
for(const xx of [x-.02,x+2.62])for(const zz of [z+.7,z+2.1]){B(xx,.78,zz,.065,.5,.6,trim);B(xx+(xx>cx?.04:-.04),.78,zz,.025,.39,.48,material('#425762',.3));}
B(cx,.5,z+3.07,.45,.85,.07,'#594c3d');B(cx+.13,.55,z+3.12,.035,.04,.025,'#c5b382');
B(cx,.17,z+3.28,1.1,.16,.5,stone);B(cx,.09,z+3.52,1.2,.09,.28,stone);
B(cx,1.07,z+3.3,1.35,.12,.66,trim);for(const dx of [-.55,.55])B(cx+dx,.55,z+3.55,.08,1,.08,trim);
roof(cx,cz,2.9,3.3,k);
B(cx,.03,z+4.2,.65,.045,1.3,materials.walk);for(let i=0;i<4;i++)B(cx,.057,z+3.65+i*.32,.65,.008,.015,stone);
fence(x+.05,z+4.95,.9,true);fence(x+2.45,z+4.95,.85,true);fence(x+3.15,z+2.6,4.6,false);
for(let i=0;i<4;i++)bush(x+.25+i*.25,z+4.4,.16);bush(x+2.65,z+3.6,.28);
// Lawn color variation, flower borders, mailbox, downpipes.
B(x+.55,.025,z+3.95,.85,.02,.8,material(k%2?'#687f46':'#748951'));for(let i=0;i<5;i++)B(x+.2+i*.15,.17,z+4.38,.06,.05,.06,['#d6ba75','#aa839b','#d9d3b5'][k%3]);
B(x+2.9,.37,z+4.85,.04,.65,.04,metal);B(x+2.9,.7,z+4.85,.2,.16,.16,metal);
B(x+2.57,.68,z+3.04,.035,1.25,.035,metal);
tree(x+2.55,z+4.25,.8+random()*.3);if(k%3===0){B(x+.35,.04,z+3.9,.85,.04,1.5,stone);const parked=vehicle(['#87634b','#c0c3b7','#687c82'][k%3]);parked.position.set(x+.35,0,z+4);parked.rotation.y=Math.PI/2;scene.add(parked);parked.updateMatrixWorld(true);for(const child of [...parked.children])scene.attach(child);scene.remove(parked);}
}
for(let col=0;col<6;col++)for(let row=0;row<6;row++){const x=W.AXES[col]+2.3,z=W.AXES[row]+2.3;for(let a=0;a<3;a++)for(let b=0;b<2;b++){const bx=x+.5+a*3.6,bz=z+.5+b*5.5;if(col===0&&row===1)continue;if(W.services.some(p=>p.type!=='training'&&bx+2.9>p.x+1.6&&bx<p.x+10.5&&bz+5>p.z-5&&bz<p.z+5))continue;if(W.parkingBays.some(p=>Math.hypot(p.x-(bx+1.3),p.z-(bz+1.6))<3.5))continue;if(W.roundabouts.some(p=>Math.hypot(p.x-(bx+1.3),p.z-(bz+1.6))<5.5))continue;house(bx,bz,col+row+a+b);}}
// Jointed sidewalks, raised curbs and roadside drains give the street scale.
for(const a of W.AXES)for(let n=8;n<104;n+=.65){if(W.AXES.some(v=>Math.abs(v-n)<2.5))continue;if(W.roundabouts.some(j=>Math.hypot(j.x-n,j.z-a)<4.65||Math.hypot(j.x-a,j.z-n)<4.65))continue;for(const side of [-1,1]){B(n,.079,a+side*1.9,.018,.008,.48,stone);B(a+side*1.9,.079,n,.48,.008,.018,stone);B(n,.12,a+side*1.63,.61,.1,.08,trim);B(a+side*1.63,.12,n,.08,.1,.61,trim);}}
const coverGeo=new T.CylinderGeometry(.19,.19,.012,20);for(const a of W.AXES)for(let n=15;n<102;n+=16){add(coverGeo,metal,a+.5,.105,n);for(let i=-2;i<=2;i++)B(a+.5+i*.055,.114,n,.014,.006,.27,'#343d3b');}
for(const l of W.landmarks)if(l.kind==='busStop'){B(l.x,.08,l.z,1.7,.13,2.3,stone);for(const dz of [-.85,.85])for(const dx of [-.58,.58])B(l.x+dx,.65,l.z+dz,.045,1.2,.045,metal);B(l.x,.38,l.z+.55,1,.09,.3,wood);B(l.x,.6,l.z+.7,1,.3,.06,wood);const bin=add(new T.CylinderGeometry(.14,.12,.4,12),metal,l.x+.95,.24,l.z+.8);}
for(const x of W.AXES)for(let z=13;z<99;z+=16){B(x-2.2,1.35,z,.095,2.7,.095,wood);B(x-2.2,2.5,z,.7,.075,.07,wood);for(const dx of [-.27,.27]){B(x-2.2+dx,2.57,z,.06,.12,.06,trim);const curve=new T.QuadraticBezierCurve3(new T.Vector3(x-2.2+dx,2.62,z),new T.Vector3(x-2.2+dx,2.1,z+8),new T.Vector3(x-2.2+dx,2.62,z+16));add(new T.TubeGeometry(curve,10,.009,3,false),metal,0,0,0);}}
return {tree};
}
function vehicle(color){const g=new T.Group();const b=(x,y,z,w,h,d,c)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),typeof c==='string'?material(c):c);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;g.add(o);return o;};
// First material is independent because the garage changes the player's paint.
b(0,.24,0,.49,.25,.98,new T.MeshStandardMaterial({color,roughness:.32,metalness:.25}));b(0,.44,.05,.41,.22,.48,color);b(0,.47,-.202,.355,.15,.025,'#425a65').rotation.x=-.25;b(0,.47,.303,.355,.14,.025,'#3d515b').rotation.x=.25;
for(const x of [-.211,.211]){b(x,.46,.05,.015,.14,.38,'#3d5662');b(x,.46,.035,.024,.16,.025,color);b(x,.33,.12,.025,.02,.07,'#a2a9a5');b(x*1.2,.39,-.13,.075,.055,.09,color);}
b(0,.58,.05,.42,.045,.45,color);b(0,.35,-.36,.45,.045,.25,color);b(0,.35,.405,.45,.035,.16,color);b(0,.17,-.5,.48,.065,.055,'#656c6a');b(0,.17,.5,.48,.065,.055,'#656c6a');b(0,.25,-.507,.2,.07,.02,'#2a3031');b(0,.22,.536,.15,.055,.012,'#e1dfcf');
const tire=new T.CylinderGeometry(.115,.115,.075,16);tire.rotateZ(Math.PI/2);for(const x of [-.25,.25])for(const z of [-.3,.3]){const o=new T.Mesh(tire,material('#222727'));o.position.set(x,.15,z);o.castShadow=true;g.add(o);const hub=new T.Mesh(new T.CylinderGeometry(.065,.065,.08,10),material('#939b99',.35));hub.rotation.z=Math.PI/2;hub.position.copy(o.position);g.add(hub);}
for(const x of [-.17,.17]){b(x,.28,-.503,.13,.08,.023,'#fff0be');b(x,.28,.503,.12,.065,.023,'#a92725');}return g;}
function batch(group){const bins=new Map();group.updateMatrixWorld(true);for(const o of [...group.children]){if(!o.isMesh||Array.isArray(o.material)||!o.geometry.attributes.normal)continue;const m=o.material;const key=(m.userData.animated?m.uuid:[m.type,m.map?.uuid||'',m.roughness,m.metalness,m.transparent,m.opacity,m.alphaTest,m.side,m.bumpMap?.uuid||'',m.bumpScale].join(':'))+':'+o.castShadow;let bin=bins.get(key);if(!bin){bin={material:o.material,cast:o.castShadow,objects:[]};bins.set(key,bin);}bin.objects.push(o);}
for(const bin of bins.values()){if(bin.objects.length<2)continue;let count=0;const geometries=bin.objects.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);count+=g.attributes.position.count;return g;});const pos=new Float32Array(count*3),norm=new Float32Array(count*3),uv=new Float32Array(count*2),colors=new Float32Array(count*3);let offset=0;for(let gi=0;gi<geometries.length;gi++){const g=geometries[gi],c=bin.objects[gi].material.color;for(let i=0;i<g.attributes.position.count;i++){colors[(offset+i)*3]=c.r;colors[(offset+i)*3+1]=c.g;colors[(offset+i)*3+2]=c.b;}pos.set(g.attributes.position.array,offset*3);norm.set(g.attributes.normal.array,offset*3);if(g.attributes.uv)uv.set(g.attributes.uv.array,offset*2);offset+=g.attributes.position.count;g.dispose();}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('normal',new T.BufferAttribute(norm,3));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.computeBoundingSphere();let m=bin.material;if(!m.userData.animated){m=m.clone();m.color.set('#ffffff');m.vertexColors=true;geo.setAttribute('color',new T.BufferAttribute(colors,3));}const mesh=new T.Mesh(geo,m);mesh.castShadow=bin.cast;mesh.receiveShadow=true;for(const o of bin.objects)group.remove(o);group.add(mesh);}}
window.DriveScenery={build,vehicle,batch};
})();
