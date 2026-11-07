/* Imported CC0 GLB interior. No procedural legacy cockpit is rendered. */
(()=>{
const T=THREE,scene=new T.Scene(),camera=new T.PerspectiveCamera(64,2,.015,15),targets=[],labels=[];
scene.add(new T.HemisphereLight('#f2f5ff','#454037',2));const sun=new T.DirectionalLight('#fff1da',2.1);sun.position.set(-3,4,-2);scene.add(sun);
const mirrorSurfaces=[];const fill=new T.DirectionalLight('#dce8ff',.8);fill.position.set(2,2,1);scene.add(fill);
let yaw=0,pitch=0,rear=false,drag=false,dragX=0,dragY=0;let state='loading',model,wheel,wheelBase,lastHeading=null,steer=0,bound=false;
const home=[-.37,1.12,.05,-.37,.96,-2.5];camera.position.fromArray(home);camera.lookAt(...home.slice(3));
const status=document.createElement('div');status.id='cabin-model-status';status.style.cssText='display:none;position:absolute;z-index:35;left:50%;top:45%;transform:translateX(-50%);padding:18px 24px;background:#14261ff2;color:#eef3e0;border:1px solid #a9bc99;border-radius:12px;font:18px sans-serif;max-width:80%;text-align:center';status.textContent='Se încarcă interiorul 3D…';document.body.appendChild(status);
const driveUI=document.createElement('div');driveUI.id='cabin-driving-controls';driveUI.style.cssText='position:fixed;z-index:31;bottom:110px;left:18px;display:none;gap:6px;flex-wrap:wrap;max-width:650px';
const buttons={};function button(id,text,hold){const b=document.createElement('button');b.textContent=text;b.style.cssText='background:#20362eee;color:#edf2dc;border:1px solid #aabd95;border-radius:7px;padding:10px 13px;font:600 14px sans-serif;touch-action:none';driveUI.appendChild(b);buttons[id]=b;if(hold){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(id==='rear')rear=true;else DriveTraining.pedal(id,true);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,()=>{if(id==='rear')rear=false;else DriveTraining.pedal(id,false);});}else b.onclick=()=>{if(id==='front'){yaw=0;pitch=0;rear=false;}else DriveTraining.clickControl(id);};return b;}
button('rear','B · Privește în spate',true);document.body.appendChild(driveUI);
function release(){drag=false;rear=false;DriveTraining.releasePedals();}
window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});window.addEventListener('keydown',e=>{if(DriveTraining.active()&&e.code==='KeyB'&&!e.target.closest?.('input,textarea')){rear=true;e.preventDefault();}if(DriveTraining.active()&&!e.target.closest?.('input,textarea')){if(e.code==='KeyC')DriveTraining.pedal('clutch',true);const gearKey={KeyN:'neutral',Digit1:'first',KeyR:'reverse'}[e.code];if(gearKey&&!e.repeat){e.preventDefault();DriveTraining.clickControl(gearKey);}}});window.addEventListener('keyup',e=>{if(e.code==='KeyB')rear=false;if(e.code==='KeyC')DriveTraining.pedal('clutch',false);});
function label(text,position){const c=document.createElement('canvas');c.width=512;c.height=80;const g=c.getContext('2d');g.fillStyle='#14261fed';g.fillRect(0,0,512,80);g.fillStyle='#f0f3e1';g.font='bold 27px sans-serif';g.textAlign='center';g.fillText(text,256,51);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const o=new T.Sprite(new T.SpriteMaterial({map:texture,depthTest:false}));o.position.fromArray(position);o.position.y+=.09;o.scale.set(.29,.046,1);scene.add(o);labels.push(o);return o;}
function solid(position,size,color){const o=new T.Mesh(new T.BoxGeometry(...size),new T.MeshStandardMaterial({color,roughness:.55,metalness:.18}));o.position.fromArray(position);scene.add(o);return o;}
// Physical controls supplement the imported automatic cabin for the manual lesson.
function roundButton(p,r,text){const o=new T.Mesh(new T.CylinderGeometry(r,r,.014,32),new T.MeshStandardMaterial({color:'#272c2e',metalness:.45,roughness:.35}));o.rotation.x=Math.PI/2;o.position.fromArray(p);scene.add(o);const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#151b1d';g.fillRect(0,0,128,128);g.fillStyle='#f2f1df';g.font='bold 20px sans-serif';g.textAlign='center';text.split('|').forEach((t,i)=>g.fillText(t,64,52+i*26));const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;const face=new T.Mesh(new T.CircleGeometry(r*.9,32),new T.MeshBasicMaterial({map:tx}));face.position.fromArray(p);face.position.z+=.008;scene.add(face);}
function control(id,text,p,size,view){const o=new T.Mesh(new T.BoxGeometry(...size),new T.MeshBasicMaterial({color:'#ffe3a1',transparent:true,opacity:0,depthWrite:false}));o.position.fromArray(p);o.userData.control=id;scene.add(o);targets.push({id,mesh:o,label:label(text,p),view});return o;}
new T.GLTFLoader().load('/nivel-1/models/modern-interior.glb',g=>{
model=g.scene;model.rotation.y=Math.PI;model.name='ImportedModernInterior';scene.add(model);
model.traverse(o=>{if(!o.isMesh)return;
if(o.name.includes('dash_screen_glow')){o.visible=false;return;}
if(o.name==='modern-car-interior_body'){
 const geo=o.geometry,pos=geo.attributes.position,idx=geo.index,kept=[];for(let i=0;i<(idx?idx.count:pos.count);i+=3){const ids=[0,1,2].map(k=>idx?idx.getX(i+k):i+k);const tablet=ids.every(k=>Math.abs(pos.getX(k))<.23&&pos.getY(k)>.80&&pos.getZ(k)>.48&&pos.getZ(k)<.86);if(!tablet)kept.push(...ids);}geo.setIndex(kept);geo.computeBoundingSphere();
}if(o.name.includes('windshield_glass')){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=.045;o.material.depthWrite=false;o.material.roughness=.08;o.material.side=T.DoubleSide;}
if(o.material.map)o.material.map.anisotropy=4;
if(o.name.includes('steering_wheel')){wheel=o;wheelBase=o.quaternion.clone();}
if(o.material.emissiveIntensity>0)o.material.emissiveIntensity=Math.min(.45,o.material.emissiveIntensity);
});
// Slim headliner closes the cutaway above eye level, never across the side windows.
solid([0,1.43,.35],[1.73,.035,2.6],'#26292a');
// Rear window aperture: open glass area above the bench with a thin frame.
solid([0,1.40,1.58],[1.65,.055,.07],'#292d30');
solid([0,.79,1.58],[1.65,.055,.09],'#292d30');
for(const side of [-1,1])solid([side*.79,1.095,1.58],[.055,.61,.07],'#292d30');
const gear=solid([.02,.43,-.1],[.025,.18,.025],'#929a9c');const knob=new T.Mesh(new T.SphereGeometry(.045,24,16),new T.MeshStandardMaterial({color:'#24292b',roughness:.5}));knob.position.set(.02,.53,-.1);scene.add(knob);
solid([.13,.36,.14],[.035,.045,.23],'#24292b');solid([-.62,.1,-.58],[.065,.025,.12],'#838a89');solid([-.19,.36,.19],[.045,.05,.065],'#c32d2d');
roundButton([-.15,.65,-.69],.027,'START|STOP');roundButton([-.68,.61,-.79],.028,'AUTO');
control('seat','REGLAJ SCAUN',[-.6,.25,.32],[.09,.08,.18],[-.42,.91,.72,-.6,.25,.32]);
control('mirrors','OGLINDĂ',[0,1.22,-.39],[.29,.12,.09]);
control('belt','CUPLEAZĂ CENTURA',[-.19,.36,.19],[.065,.07,.08],[-.38,.9,.65,-.19,.36,.19]);
control('brake','FRÂNĂ',[-.39,.11,-.57],[.09,.07,.16],[-.37,.85,.25,-.4,.1,-.57]);
control('clutch','AMBREIAJ',[-.62,.1,-.58],[.08,.07,.15],[-.37,.85,.25,-.62,.1,-.58]);
control('go','ACCELERAȚIE',[-.25,.11,-.57],[.08,.07,.16],[-.37,.85,.25,-.25,.1,-.57]);
control('gear','SCHIMBĂTOR · 1 / N / R',[.02,.53,-.1],[.1,.1,.1],[-.37,1,.35,.02,.45,-.1]);
control('ignition','PORNEȘTE MOTORUL',[-.15,.65,-.68],[.065,.065,.04]);
control('lights','LUMINI · AUTO',[-.68,.61,-.78],[.065,.065,.04]);
const stalk=solid([-.56,.68,-.65],[.15,.018,.02],'#24292b');
control('look','ASIGURARE ȘI SEMNAL',[-.56,.68,-.65],[.16,.06,.06]);
control('handbrake','FRÂNĂ DE MÂNĂ',[.13,.36,.14],[.065,.07,.25],[-.37,.95,.55,.13,.36,.14]);
for(const side of [-1,1]){solid([side*1.0,.78,-.67],[.2,.035,.04],'#252b2d');const shell=new T.Mesh(new T.SphereGeometry(1,32,16),new T.MeshStandardMaterial({color:'#20282b',roughness:.35}));shell.position.set(side*1.13,.84,-.69);shell.scale.set(.15,.087,.055);scene.add(shell);const glass=new T.Mesh(new T.CircleGeometry(1,64),new T.MeshBasicMaterial({color:'#ffffff'}));glass.name='SideMirrorGlass';glass.scale.set(.1275,.0675,1);glass.position.set(side*1.13,.84,-.63);const uv=glass.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,1-uv.getX(i));uv.needsUpdate=true;scene.add(glass);mirrorSurfaces.push(glass);}
state='ready';status.textContent='';
},undefined,()=>{state='error';status.textContent='Interiorul 3D nu s-a încărcat. Reîncarcă pagina pentru a reîncerca.';});
let lookState={yaw:0,pitch:-.06};const ray=new T.Raycaster(),eye=new T.Vector3(),focus=new T.Vector3();
function currentId(id,current){return id==='gear'&&current==='neutral'?'neutral':id;}
function render(renderer,canvas,s){
const active=DriveTraining.active();status.style.display=active&&state!=='ready'?'block':'none';driveUI.style.display=active&&state==='ready'?'flex':'none';if(!active){release();return;}
if(!bound){bound=true;canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw=T.MathUtils.clamp(yaw+(e.clientX-dragX)*.004,-2.7,2.7);pitch=T.MathUtils.clamp(pitch-(e.clientY-dragY)*.003,-.85,.55);dragX=e.clientX;dragY=e.clientY;});for(const ev of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(ev,()=>{drag=false;DriveTraining.releasePedals();});canvas.addEventListener('pointerdown',e=>{if(e.button===2){drag=true;dragX=e.clientX;dragY=e.clientY;canvas.setPointerCapture(e.pointerId);return;}if(!DriveTraining.active()||state!=='ready')return;const b=canvas.getBoundingClientRect();ray.setFromCamera(new T.Vector2((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2),camera);const current=DriveTraining.current();const enabled=targets.filter(t=>current?currentId(t.id,current)===current:['gear','go','brake','clutch'].includes(t.id));const hit=ray.intersectObjects(enabled.map(t=>t.mesh))[0];if(hit){const id=currentId(hit.object.userData.control,current);if(!current&&['go','brake','clutch'].includes(id)){DriveTraining.pedal(id,true);canvas.setPointerCapture(e.pointerId);}else DriveTraining.clickControl(id);}});}
if(state!=='ready')return;
const current=DriveTraining.current(),selected=targets.find(t=>currentId(t.id,current)===(current||'gear')),v=home;
// Look back from the gap between the front seats, clear of the driver's headrest.
const lookingBack=rear||Math.abs(yaw)>1.65;
eye.fromArray(home);if(lookingBack)eye.set(0,1.24,.18);camera.position.copy(eye);let basePitch=-.06,baseYaw=0;if(current&&selected){const d=selected.mesh.position.clone().sub(eye);baseYaw=Math.atan2(d.x,-d.z);basePitch=Math.atan2(d.y,Math.hypot(d.x,d.z));}const a=rear?Math.PI:baseYaw+yaw,b=rear?-.04:T.MathUtils.clamp(basePitch+pitch,-1.05,.65);focus.set(eye.x+Math.sin(a)*Math.cos(b),eye.y+Math.sin(b),eye.z-Math.cos(a)*Math.cos(b));camera.lookAt(focus);lookState={yaw:a,pitch:b,offsetX:eye.x-home[0],offsetY:eye.y-home[1],offsetZ:eye.z-home[2]};const w=canvas.clientWidth,h=canvas.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();
for(const t of targets){const show=t===selected;t.label.visible=show&&window.DriveHUD?.mode()!=="off";t.mesh.material.opacity=show&&window.DriveHUD?.mode()!=="off"?.12:0;}
if(lastHeading!==null){const turn=Math.atan2(Math.sin(s.player.angle-lastHeading),Math.cos(s.player.angle-lastHeading));steer+=(T.MathUtils.clamp(-turn*35,-.65,.65)-steer)*.16;}lastHeading=s.player.angle;
if(wheel){wheel.quaternion.copy(wheelBase);wheel.rotateZ(steer);}
renderer.autoClear=false;renderer.clearDepth();renderer.setViewport(0,0,w,h);renderer.render(scene,camera);renderer.autoClear=true;
}
window.DriveCabin={render,look:()=>lookState,setMirrorTextures:textures=>mirrorSurfaces.forEach((m,i)=>{if(m.material.map!==textures[i]){m.material.map=textures[i];m.material.needsUpdate=true;}}),status:()=>state,modelName:'Modern Car Interior · GLB'};
})();
