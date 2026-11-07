/* Recognizable service lots. Everything static joins the existing spatial batching. */
(()=>{function build({T,W,scene,box,mat,materials}){
const palette=new Map(),M=c=>{if(!palette.has(c))palette.set(c,mat(c));return palette.get(c);};
const B=(x,y,z,w,h,d,c)=>box(x,y,z,w,h,d,typeof c==='string'?M(c):c);
const glass=new T.MeshStandardMaterial({color:'#527d8b',metalness:.25,roughness:.22});
function sign(text,x,y,z,w=3,color='#e5eee1',bg='#193d58',front=true){const c=document.createElement('canvas');c.width=1024;c.height=192;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,1024,192);g.fillStyle=color;g.font='bold 90px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(text,512,98,970);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,w*192/1024),new T.MeshBasicMaterial({map:tex,side:T.DoubleSide}));o.position.set(x,y,z);if(front)o.rotation.y=-Math.PI/2;scene.add(o);}
function car(x,z,color,school=false){const o=DriveScenery.vehicle(color);o.position.set(x,.12,z);o.rotation.y=Math.PI/2;scene.add(o);o.updateMatrixWorld(true);for(const child of [...o.children])scene.attach(child);scene.remove(o);if(school){B(x,.78,z,.22,.12,.26,'#f5eed7');sign('ȘCOALA',x-.12,.78,z,.3,'#ffffff','#176091');}}
function window(x,y,z,w=.9,h=.65){B(x,y,z,.05,h+.08,w+.08,'#d8ddd4');B(x-.035,y,z,.02,h,w,glass);B(x-.05,y,z,.03,h,.025,'#d8ddd4');}
function parking(x,z,count=3){for(let i=0;i<=count;i++)B(x,.17,z+i*1.15,1.6,.018,.045,materials.white);B(x+.8,.17,z+count*.575,.045,.018,count*1.15,materials.white);}
for(const p of W.services){const x=p.x+(p.type==='training'?0:.8),z=p.z;if(p.type==='training'){B(20, .65,27.5,1.4,1.2,1.8,'#a9ada0');B(20,1.3,27.5,1.6,.15,2,'#356956');window(19.27,.8,27.5,.65,.45);sign('POLIGON',19.2,1.35,27.5,1.5);continue;}
B(x+5.1,.06,z,8,.12,9.3,'#b3b3a2');B(x+3,.13,z,3.8,.08,8.8,materials.road);
// Driveway and a clearly marked interaction point beside the existing road.
B(x+1,.12,z,2,.08,2.2,materials.road);const ring=new T.Mesh(new T.TorusGeometry(.48,.035,6,32),new T.MeshBasicMaterial({color:p.type==='fuel'?'#eed283':'#76d4e8',toneMapped:false}));ring.rotation.x=Math.PI/2;ring.position.set(x+1.15,.18,z);scene.add(ring);
if(p.type==='fuel'){
B(x+7,.94,z+.5,3.5,1.75,5.4,'#d6d7c7');B(x+7,1.87,z+.5,3.7,.16,5.6,'#c44d3e');window(x+5.22,.95,z-.7,1.6,.95);window(x+5.22,.95,z+1.2,1.6,.95);sign('MAGAZIN',x+5.15,1.62,z+.5,3,'#fff1dd','#ae382c');
// Fuel canopy, four columns, dispenser islands, screens and curved hoses.
B(x+2.9,2.4,z,3.3,.18,5.8,'#dddcd0');B(x+2.9,2.5,z,3.4,.12,5.9,'#bd3d30');sign('BENZINĂRIE',x+1.17,2.48,z,4,'#fff8dc','#ad362a');
for(const dx of [1.65,4.15])for(const dz of [-2.45,2.45])B(x+dx,1.25,z+dz,.09,2.4,.09,'#bfc6c0');
for(const dz of [-1.45,1.45]){B(x+3,.25,z+dz,.7,.2,1.2,'#d1d2bd');B(x+3,.68,z+dz,.38,.75,.65,'#cb4536');B(x+3,1.08,z+dz,.43,.32,.68,'#e2e4d8');B(x+2.77,1.1,z+dz,.02,.15,.35,'#162c2d');sign('95  DIESEL',x+2.75,1.1,z+dz,.4,'#b8e9af','#16352a');for(const side of [-1,1]){const points=[new T.Vector3(x+3,1.15,z+dz+side*.4),new T.Vector3(x+2.85,.4,z+dz+side*.52),new T.Vector3(x+2.7,.75,z+dz+side*.4)];const hose=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),8,.018,5,false),M('#222b28'));scene.add(hose);}}
B(x+1.8,1.25,z-3.9,.15,2.5,.65,'#b83c30');sign('FUEL',x+1.7,2.15,z-3.9,.85);sign('95 / DIESEL',x+1.7,1.7,z-3.9,1.1);
}else if(p.type==='school'){
B(x+6.6,1.4,z,4.4,2.6,6.5,'#d0c6ad');B(x+6.6,2.78,z,4.6,.16,6.7,'#37637b');B(x+4.35,1.95,z,.1,.42,6.5,'#205d7e');sign('ȘCOALA AUTO',x+4.28,1.95,z,5.6);
for(const dz of [-2.35,-1.15,1.15,2.35]){window(x+4.35,.95,z+dz,.8,.85);window(x+4.35,2.4,z+dz,.8,.45);}
B(x+4.32,.75,z,.1,1.4,.9,glass);B(x+3.9,.2,z,.9,.2,1.4,'#babdaf');B(x+3.7,1.55,z,1.4,.12,1.7,'#527b91');
parking(x+2.6,z-3.5,2);parking(x+2.6,z+1.25,2);car(x+2.5,z-2.9,'#dedbc9',true);car(x+2.5,z+2,'#d4c46e',true);
sign('CHESTIONARE · +150 CR',x+4.25,1.52,z,3.2,'#eaf2d8','#1f526d');
}else if(p.type==='cars'){
B(x+6.6,.18,z,4.6,.25,7.3,'#a9aba2');B(x+8.65,1.3,z,.22,2.3,7,'#cccfc5');B(x+6.5,2.5,z,4.8,.22,7.5,'#3a4b56');B(x+4.2,2.28,z,.12,.35,7.3,'#263d4a');sign('AUTO SALON',x+4.12,2.27,z,5.8);
for(const dz of [-3.4,0,3.4])B(x+4.3,1.25,z+dz,.1,2.2,.1,'#d1d7d3');for(const dz of [-2.55,-.85,.85,2.55])window(x+4.3,1.25,z+dz,1.6,1.65);
car(x+5.7,z-2,'#ad4235');car(x+5.7,z+1.7,'#4b6d96');parking(x+2.6,z-3.5,5);car(x+2.5,z-2.9,'#c6c7be');car(x+2.5,z+.5,'#344c62');sign('ÎNVAȚĂ · DEBLOCHEAZĂ',x+4.1,.45,z,4.5);
}else if(p.type==='custom'){
B(x+6.5,1.2,z,4.5,2.2,6.6,'#9b9f96');B(x+6.5,2.35,z,4.7,.2,6.8,'#4d6259');sign('ATELIER AUTO',x+4.18,2.15,z,5.7,'#fff0cb','#526b51');
for(const dz of [-1.7,1.7]){B(x+4.22,.98,z+dz,.06,1.7,2.4,'#30423e');for(let i=0;i<7;i++)B(x+4.17,.25+i*.23,z+dz,.04,.035,2.35,'#84968e');B(x+3.7,.15,z+dz,1,.08,2.4,'#c2b986');}
car(x+2.7,z-1.6,'#a54f42');B(x+3.2,.45,z+3,.5,.65,.7,'#ba493b');sign('VOPSEA · 100 CR',x+4.1,1.85,z,3.8,'#fff0cb','#526b51');
for(let i=0;i<3;i++){const tire=new T.Mesh(new T.TorusGeometry(.18,.075,6,14),M('#252d29'));tire.rotation.x=Math.PI/2;tire.position.set(x+3.2,.25+i*.14,z+2.3);scene.add(tire);}
}
// Low boundary wall keeps each commercial plot distinct from the nearby houses.
B(x+9.05,.22,z,.12,.4,9.3,'#7d8975');for(const dz of [-4.6,4.6])B(x+5.1,.22,z+dz,8,.4,.12,'#7d8975');
}
}window.DriveServices={build};})();
