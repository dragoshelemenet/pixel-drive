/* Footprint-faithful architectural kit. Facades are stylized, not surveyed. */
(()=>{
let referenceTextures;
function referenceTexture(T,type){
 if(!referenceTextures)referenceTextures={};if(referenceTextures[type])return referenceTextures[type];
 const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 g.fillStyle=type==='roof'?'#847e6d':'#edf1ee';g.fillRect(0,0,256,256);
 let seed=712;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 if(type==='roof')for(let row=0;row<16;row++)for(let col=-1;col<13;col++){
  const v=125+Math.floor(rnd()*45);g.fillStyle=`rgb(${v+9},${v+3},${v-12})`;g.fillRect(col*22+(row%2)*11+1,row*16+1,20,14);
 }else for(let i=0;i<7000;i++){const v=225+Math.floor(rnd()*28);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(rnd()*256,rnd()*256,1,1);}
 const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;referenceTextures[type]=t;return t;
}
function build({T,scene,buildings,nearestRoad,windows=[],canPlaceDetail=()=>true}){
 const palette=new Map(),mat=(c,type)=>{const k=c+type;if(!palette.has(k))palette.set(k,type?DriveSurfaces.surface(type,c):new T.MeshStandardMaterial({color:c,roughness:.83}));return palette.get(k);};
 const trim=mat('#e7dcc4'),wood=mat('#71543b'),iron=mat('#555e59'),glass=new T.MeshStandardMaterial({color:'#7397a0',roughness:.28,metalness:.15,emissive:'#ffd68c',emissiveIntensity:0});glass.userData.animated=true;windows.push(glass);
 const boxGeo=new T.BoxGeometry(1,1,1);
 function box(x,y,z,w,h,d,m,angle=0){const o=new T.Mesh(boxGeo,m);o.position.set(x,y*.5,z);o.scale.set(w,h*.5,d);o.rotation.y=-angle;o.userData.detail=true;o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
 function mesh(vertices,uv,m,cx,cz){if(!vertices.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices.map((v,i)=>i%3===1?v*.5:v),3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const o=new T.Mesh(g,m);o.position.set(cx,0,cz);o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
 function clip(poly,sign){const out=[];let a=poly[poly.length-1];for(const b of poly){const ai=a[1]*sign>=-1e-9,bi=b[1]*sign>=-1e-9;if(ai!==bi){const t=a[1]/(a[1]-b[1]);out.push([a[0]+t*(b[0]-a[0]),0]);}if(bi)out.push(b);a=b;}return out;}
 let count=0;
 for(const b of buildings){let pts=b.points.filter((p,i,a)=>!i||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>.001);if(pts.length>2&&Math.hypot(pts[0][0]-pts.at(-1)[0],pts[0][1]-pts.at(-1)[1])<.001)pts.pop();if(pts.length<3)continue;
 const seed=Number(b.id)||count++,cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cz=pts.reduce((s,p)=>s+p[1],0)/pts.length;
 const fortified=/zid fortificat/i.test(b.name||''),shed=['shed','barn'].includes(b.type),church=b.type==='church';
 const reference=b.id==='398664586'?{wall:'#bdd9ee',roof:'#e1ded2',height:1.55,windows:1,hipped:true}:null;
 const wall=mat(reference?.wall||['#8fc4b0','#75acc9','#dfc684','#d6a38f','#e4dac1','#9eaf80','#c6b199','#9aaac6'][seed%8],shed||fortified?'brick':null),roof=mat(reference?.roof||['#9b8f83','#b7896c','#816d5e','#bb936e','#938979'][seed%5],'tile');roof.side=T.DoubleSide;if(reference){wall.map=referenceTexture(T,'plaster');wall.roughness=.95;roof.map=roof.bumpMap=referenceTexture(T,'roof');roof.bumpScale=.003;}
 const height=reference?.height??(fortified?1.35:shed?.85:church?2.4:Math.min(3.2,.8+(Number(b.levels)||1)*.6)),edges=pts.map((a,i)=>{const p=pts[(i+1)%pts.length];return{a,b:p,dx:p[0]-a[0],dz:p[1]-a[1],len:Math.hypot(p[0]-a[0],p[1]-a[1])};});
 const longest=edges.reduce((a,b)=>a.len>b.len?a:b),ux=longest.dx/longest.len,uz=longest.dz/longest.len,vx=-uz,vz=ux;
 const local=pts.map(p=>[(p[0]-cx)*ux+(p[1]-cz)*uz,(p[0]-cx)*vx+(p[1]-cz)*vz]),lo=Math.min(...local.map(p=>p[1])),hi=Math.max(...local.map(p=>p[1])),mid=(lo+hi)/2,half=(hi-lo)/2,rise=Math.min(1.35,half*(shed?.65:1.15)),rh=v=>height+rise*Math.max(0,1-Math.abs(v)/Math.max(.01,half));
 const area=pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1];},0),winding=area>0?1:-1;
 const near=nearestRoad({x:cx,z:cz});let front=0,best=Infinity;edges.forEach((e,i)=>{const d=near?Math.hypot((e.a[0]+e.b[0])/2-near.x,(e.a[1]+e.b[1])/2-near.z):i;if(e.len>.65&&d<best){best=d;front=i;}});
 for(let ei=0;ei<edges.length;ei++){const e=edges[ei];if(e.len<.04)continue;const angle=Math.atan2(e.dz,e.dx),nx=winding*e.dz/e.len,nz=-winding*e.dx/e.len;
 const piece=(t,y,w,h,d,m,out=.0)=>box(e.a[0]+e.dx*t+nx*out,y,e.a[1]+e.dz*t+nz*out,w,h,d,m,angle);
 piece(.5,height/2,e.len,height,.085,wall).userData.detail=false;piece(.5,.1,e.len,.2,.13,mat(reference?'#a8a28e':'#96917e')).userData.detail=false;piece(.5,height-.045,e.len,.09,.14,trim);
 if(fortified){piece(.5,height+.055,e.len,.11,.2,roof);continue;}
 // Masonry closes the gable ends up to the pitched roof, including ridge crossings.
 const va=(e.a[0]-cx)*vx+(e.a[1]-cz)*vz-mid,vb=(e.b[0]-cx)*vx+(e.b[1]-cz)*vz-mid,ts=[0,1];if(va*vb<0)ts.splice(1,0,va/(va-vb));
 for(let k=1;!reference&&k<ts.length;k++){const a=ts[k-1],c=ts[k],x0=e.a[0]+e.dx*a-cx,z0=e.a[1]+e.dz*a-cz,x1=e.a[0]+e.dx*c-cx,z1=e.a[1]+e.dz*c-cz,h0=rh(va+(vb-va)*a),h1=rh(va+(vb-va)*c);mesh([x0,height,z0,x1,height,z1,x1,h1,z1,x0,height,z0,x1,h1,z1,x0,h0,z0],[0,0,e.len,0,e.len,h1-height,0,0,e.len,h1-height,0,h0-height],wall,cx,cz);}
 piece(.5,height+.01,e.len+.07,.065,.13,wood);if(ei===front){piece(.5,height-.17,e.len,.035,.11,trim);for(const t of (reference?[]:[.025,.975]))piece(t,height*.48,.045,height*.82,.10,trim,.045);if(!reference&&rh((va+vb)/2)>height+.25){piece(.42,height+.20,.045,.12,.025,wood,.055);piece(.58,height+.20,.045,.12,.025,wood,.055);}}if(!reference)piece(.03,height/2,.035,height,.04,iron,.09);
 // Street-front rooms usually have paired windows; the courtyard door is on another elevation.
 const door=reference?false:ei===(shed?front:(front+1)%edges.length);
 const n=reference?(ei===front?reference.windows:0):ei===front?Math.min(3,Math.max(2,Math.floor(e.len/.55))):Math.min(6,Math.max(1,Math.floor(e.len/.95)));
 for(let j=0;j<n;j++){const t=(j+.5)/n;if(e.len<.6)continue;
 if(door&&j===Math.floor(n/2)){const dw=Math.min(shed?.42:.20,e.len*.55);piece(t,.39,dw+.06,.80,.06,trim,.06);piece(t,.36,dw,.72,.045,wood,.1);piece(t,.65,dw-.04,.10,.025,shed?wood:glass,.13);piece(t,.06,dw+.13,.12,.27,mat('#aaa393'),.16);piece(t,.38,.025,.05,.04,iron,.15);if(shed)piece(t,.36,.025,.72,.03,iron,.13);continue;}
 if(shed)continue;
 const ww=Math.min(reference?.18:.21,e.len/n*.5),hh=reference?.66:church?.65:(.43+(seed%3)*.045),wy=height*.59;
 piece(t,wy,ww+.09,hh+.1,.07,trim,.065);if(reference)piece(t,wy,ww+.025,hh+.025,.03,mat('#5b4534'),.09);piece(t,wy,ww,hh,.025,glass,.11);piece(t,wy,.025,hh,.03,reference?mat('#5b4534'):trim,.135);piece(t,wy,ww,.025,.03,reference?mat('#5b4534'):trim,.135);piece(t,wy-hh/2-.045,ww+.14,.055,.16,trim,.1);
 if(!reference&&seed%3!==0){for(const side of [-1,1]){const tt=t+side*(ww/2+.06)/e.len;piece(tt,wy,.075,hh+.04,.04,wood,.1);for(let k=0;k<3;k++)piece(tt,wy-hh*.3+k*hh*.3,.065,.017,.05,trim,.125);}}
 }
 }
 if(!reference&&!shed&&!church&&!fortified&&seed%3!==0){const e=edges[front],angle=Math.atan2(e.dz,e.dx),ux=e.dx/e.len,uz=e.dz/e.len,width=.5+(seed%3)*.09;
  for(const side of [-1,1]){const end=side===1?e.b:e.a,x=end[0]+ux*side*(width/2+.06),z=end[1]+uz*side*(width/2+.06);
   if(![0,.25,.5,.75,1].every(t=>canPlaceDetail(x+ux*(t-.5)*(width+.12),z+uz*(t-.5)*(width+.12),b.id)))continue;
   const gate=mat(['#66503c','#6b5141','#4b625c','#714b38'][seed%4]);
   box(x,.37,z,width,.74,.035,gate,angle);
   for(const t of [-1,1])box(x+ux*t*(width/2+.04),.43,z+uz*t*(width/2+.04),.08,.86,.11,wall,angle);
   box(x,.84,z,width+.16,.10,.12,wall,angle);box(x,.37,z,.015,.74,.055,iron,angle);
   for(let k=-2;k<=2;k++)box(x+ux*k*width/6,.37,z+uz*k*width/6,.012,.70,.05,wood,angle);
   break;
  }
 }
 if(fortified)continue;
 // Split every footprint triangle at the ridge. Boundary-only triangulation
 // cannot produce a pitched roof on a rectangle; these new vertices can.
 if(reference?.hipped){
  // The reference roof presents a sloping end, not the generic vertical gable.
  // Retain the mapped rectangle, with a short ridge and four roof planes.
  const minU=Math.min(...local.map(p=>p[0]))-.045,maxU=Math.max(...local.map(p=>p[0]))+.045;
  const minV=lo-mid-.045,maxV=hi-mid+.045,h=Math.min((maxU-minU)*.35,(maxV-minV)*.5);
  const p0=[minU,minV],p1=[maxU,minV],p2=[maxU,maxV],p3=[minU,maxV],r0=[minU+h,0],r1=[maxU-h,0];
  const verts=[],uv=[];
  for(const tri of [[p0,p1,r1],[p0,r1,r0],[p1,p2,r1],[p2,p3,r0],[p2,r0,r1],[p3,p0,r0]])for(const q of tri){
   const y=(q===r0||q===r1)?height+rise:height+.025;
   verts.push(q[0]*ux+(q[1]+mid)*vx,y,q[0]*uz+(q[1]+mid)*vz);uv.push(q[0]*2,q[1]*2);
  }
  mesh(verts,uv,roof,cx,cz);
  continue;
 }
 const triangles=T.ShapeUtils.triangulateShape(local.map(p=>new T.Vector2(p[0],p[1]-mid)),[]),verts=[],uv=[];
 for(const tri of triangles)for(const sign of [-1,1]){const p=clip(tri.map(i=>[local[i][0],local[i][1]-mid]),sign);for(let k=1;k<p.length-1;k++)for(const q of [p[0],p[k],p[k+1]]){verts.push(q[0]*ux+(q[1]+mid)*vx,rh(q[1]),q[0]*uz+(q[1]+mid)*vz);uv.push(q[0],q[1]*1.3);}}
 mesh(verts,uv,roof,cx,cz);
 // Chimney uses an interior triangle centroid, so irregular footprints remain valid.
 if(!shed&&triangles.length){const t=triangles[Math.floor(triangles.length/2)],q=t.reduce((s,i)=>[s[0]+local[i][0]/3,s[1]+local[i][1]/3],[0,0]),x=cx+q[0]*ux+q[1]*vx,z=cz+q[0]*uz+q[1]*vz,y=rh(q[1]-mid);box(x,y+.18,z,.17,.48,.2,wall);box(x,y+.44,z,.23,.07,.26,trim);}
 if(b.type==='retail'){const e=edges[front],a=Math.atan2(e.dz,e.dx),nx=winding*e.dz/e.len,nz=-winding*e.dx/e.len;box((e.a[0]+e.b[0])/2+nx*.24,height*.78,(e.a[1]+e.b[1])/2+nz*.24,Math.min(1.6,e.len),.08,.5,mat('#50776b'),a);}
 }
 return{buildings:buildings.length};
}
window.DriveBuildingKit={build};
})();
