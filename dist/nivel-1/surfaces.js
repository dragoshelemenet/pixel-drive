/* Shared image-based materials and foliage, loaded once and reused by every city cell. */
(()=>{const T=THREE;
const defs={asphalt:[0,0,3],grass:[1,0,2],tile:[0,1,1],slate:[0,1,1],brick:[1,1,1]};const textures={};const pending=[];
for(const type of Object.keys(defs)){const c=document.createElement('canvas');c.width=c.height=512;const g=c.getContext('2d');g.fillStyle={asphalt:'#797976',grass:'#77834a',tile:'#a77b5a',slate:'#797c7d',brick:'#b7a58a'}[type];g.fillRect(0,0,512,512);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;textures[type]=t;pending.push({c,g,t,type});}
function loadAtlas(){const img=new Image();img.onload=()=>{for(const {g,t,type} of pending){const [x,y]=defs[type],w=img.width/2,h=img.height/2;g.filter=type==='slate'?'grayscale(1)':'none';g.drawImage(img,x*w,y*h,w,h,0,0,512,512);t.needsUpdate=true;}};img.src=window.DriveMaterialAtlas;}
if(window.DriveMaterialAtlas&&typeof Image!=='undefined')loadAtlas();
function surface(type,color='#ffffff',roughness=.9){return new T.MeshStandardMaterial({color,map:textures[type],bumpMap:textures[type],bumpScale:(type==='tile'||type==='slate')?.035:type==='brick'?.018:.012,roughness});}
// Leaf-cluster cutout: multiple small leaf silhouettes, instead of spherical treetops.
const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');let seed=981;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<90;i++){const a=rand()*6.283,r=Math.sqrt(rand())*105,x=128+Math.cos(a)*r,y=128+Math.sin(a)*r;g.save();g.translate(x,y);g.rotate(a+rand());g.fillStyle=['#c0cb8b','#899c5b','#607b43','#9fb56f','#d5d9a2'][i%5];g.beginPath();g.ellipse(0,0,5+rand()*5,2+rand()*3,0,0,6.283);g.fill();g.strokeStyle='#49663680';g.lineWidth=.7;g.beginPath();g.moveTo(-5,0);g.lineTo(6,0);g.stroke();g.restore();}
const leaf=new T.CanvasTexture(c);leaf.colorSpace=T.SRGBColorSpace;
const leafMaterials=['#a0b17b','#c3cd9c','#819764'].map(color=>new T.MeshStandardMaterial({map:leaf,color,alphaTest:.48,side:T.DoubleSide,roughness:1}));
window.DriveSurfaces={surface,textures,leafMaterials};})();
