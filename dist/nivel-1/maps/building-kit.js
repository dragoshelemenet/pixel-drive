/* Footprint-faithful architectural kit. Facades are stylized, not surveyed. */
(()=>{
function build({T,scene,buildings,nearestRoad,windows=[]}){
 const palette=new Map(),mat=(c,type)=>{const k=c+type;if(!palette.has(k))palette.set(k,type?DriveSurfaces.surface(type,c):new T.MeshStandardMaterial({color:c,roughness:.83}));return palette.get(k);};
 const trim=mat('#e7dcc4'),wood=mat('#71543b'),iron=mat('#555e59'),glass=new T.MeshStandardMaterial({color:'#7397a0',roughness:.28,metalness:.15,emissive:'#ffd68c',emissiveIntensity:0});glass.userData.animated=true;windows.push(glass);
 const boxGeo=new T.BoxGeometry(1,1,1);
 function box(x,y,z,w,h,d,m,angle=0){const o=new T.Mesh(boxGeo,m);o.position.set(x,y,z);o.scale.set(w,h,d);o.rotation.y=-angle;o.userData.detail=true;o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
 function mesh(vertices,uv,m,cx,cz){if(!vertices.length)return;const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();const o=new T.Mesh(g,m);o.position.set(cx,0,cz);o.castShadow=o.receiveShadow=true;scene.add(o);return o;}
 function clip(poly,sign){const out=[];let a=poly[poly.length-1];for(const b of poly){const ai=a[1]*sign>=-1e-9,bi=b[1]*sign>=-1e-9;if(ai!==bi){const t=a[1]/(a[1]-b[1]);out.push([a[0]+t*(b[0]-a[0]),0]);}if(bi)out.push(b);a=b;}return out;}
 let count=0;
 for(const b of buildings){let pts=b.points.filter((p,i,a)=>!i||Math.hypot(p[0]-a[i-1][0],p[1]-a[i-1][1])>.001);if(pts.length>2&&Math.hypot(pts[0][0]-pts.at(-1)[0],pts[0][1]-pts.at(-1)[1])<.001)pts.pop();if(pts.length<3)continue;
 const seed=Number(b.id)||count++,cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cz=pts.reduce((s,p)=>s+p[1],0)/pts.length;
 const fortified=/zid fortificat/i.test(b.name||''),shed=['shed','barn'].includes(b.type),church=b.type==='church';
 const wall=mat(['#ddd2b8','#d8c3a1','#b9c4b4','#d1b4a2','#e1d6bf','#a9bfca'][seed%6],'brick'),roof=mat(['#d39a75','#c68362','#b57d65','#c99a7a'][seed%4],'tile');roof.side=T.DoubleSide;
 const height=fortified?1.35:shed?.85:church?2.4:Math.min(3.2,.8+(Number(b.levels)||1)*.6),edges=pts.map((a,i)=>{const p=pts[(i+1)%pts.length];return{a,b:p,dx:p[0]-a[0],dz:p[1]-a[1],len:Math.hypot(p[0]-a[0],p[1]-a[1])};});
 const longest=edges.reduce((a,b)=>a.len>b.len?a:b),ux=longest.dx/longest.len,uz=longest.dz/longest.len,vx=-uz,vz=ux;
 const local=pts.map(p=>[(p[0]-cx)*ux+(p[1]-cz)*uz,(p[0]-cx)*vx+(p[1]-cz)*vz]),lo=Math.min(...local.map(p=>p[1])),hi=Math.max(...local.map(p=>p[1])),mid=(lo+hi)/2,half=(hi-lo)/2,rise=Math.min(.9,half*.65),rh=v=>height+rise*Math.max(0,1-Math.abs(v)/Math.max(.01,half));
 const area=pts.reduce((s,p,i)=>{const q=pts[(i+1)%pts.length];return s+p[0]*q[1]-q[0]*p[1];},0),winding=area>0?1:-1;
 const near=nearestRoad({x:cx,z:cz});let front=0,best=Infinity;edges.forEach((e,i)=>{const d=near?Math.hypot((e.a[0]+e.b[0])/2-near.x,(e.a[1]+e.b[1])/2-near.z):i;if(e.len>.65&&d<best){best=d;front=i;}});
 for(let ei=0;ei<edges.length;ei++){const e=edges[ei];if(e.len<.04)continue;const angle=Math.atan2(e.dz,e.dx),nx=winding*e.dz/e.len,nz=-winding*e.dx/e.len;
 const piece=(t,y,w,h,d,m,out=.0)=>box(e.a[0]+e.dx*t+nx*out,y,e.a[1]+e.dz*t+nz*out,w,h,d,m,angle);
 piece(.5,height/2,e.len,height,.085,wall).userData.detail=false;piece(.5,.1,e.len,.2,.13,mat('#96917e')).userData.detail=false;piece(.5,height-.045,e.len,.09,.14,trim);
 if(fortified){piece(.5,height+.055,e.len,.11,.2,roof);continue;}
 // Masonry closes the gable ends up to the pitched roof, including ridge crossings.
 const va=(e.a[0]-cx)*vx+(e.a[1]-cz)*vz-mid,vb=(e.b[0]-cx)*vx+(e.b[1]-cz)*vz-mid,ts=[0,1];if(va*vb<0)ts.splice(1,0,va/(va-vb));
 for(let k=1;k<ts.length;k++){const a=ts[k-1],c=ts[k],x0=e.a[0]+e.dx*a-cx,z0=e.a[1]+e.dz*a-cz,x1=e.a[0]+e.dx*c-cx,z1=e.a[1]+e.dz*c-cz,h0=rh(va+(vb-va)*a),h1=rh(va+(vb-va)*c);mesh([x0,height,z0,x1,height,z1,x1,h1,z1,x0,height,z0,x1,h1,z1,x0,h0,z0],[0,0,e.len,0,e.len,h1-height,0,0,e.len,h1-height,0,h0-height],wall,cx,cz);}
 piece(.5,height+.01,e.len+.07,.065,.13,wood);piece(.03,height/2,.035,height,.04,iron,.09);
 const door=ei===front;const n=Math.max(1,Math.floor(e.len/.85));
 for(let j=0;j<n;j++){const t=(j+.5)/n;if(e.len<.6)continue;
 if(door&&j===Math.floor(n/2)){const dw=Math.min(shed?.65:.38,e.len*.55);piece(t,.47,dw+.08,.96,.06,trim,.06);piece(t,.44,dw,.88,.045,wood,.1);piece(t,.8,dw-.05,.12,.025,shed?wood:glass,.13);piece(t,.06,dw+.13,.12,.27,mat('#aaa393'),.16);piece(t,.47,.045,.05,.04,iron,.15);if(shed)piece(t,.44,.035,.88,.03,iron,.13);continue;}
 if(shed)continue;
 const ww=Math.min(.38,e.len/n*.56),hh=church?.65:.44,wy=height*.59;
 piece(t,wy,ww+.09,hh+.1,.07,trim,.065);piece(t,wy,ww,hh,.025,glass,.11);piece(t,wy,.025,hh,.03,trim,.135);piece(t,wy,ww,.025,.03,trim,.135);piece(t,wy-hh/2-.045,ww+.14,.055,.16,trim,.1);
 if(seed%3!==0){for(const side of [-1,1]){const tt=t+side*(ww/2+.085)/e.len;piece(tt,wy,.11,hh+.04,.04,wood,.1);for(let k=0;k<3;k++)piece(tt,wy-hh*.3+k*hh*.3,.1,.017,.05,trim,.125);}}
 }
 }
 if(fortified)continue;
 // Split every footprint triangle at the ridge. Boundary-only triangulation
 // cannot produce a pitched roof on a rectangle; these new vertices can.
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
