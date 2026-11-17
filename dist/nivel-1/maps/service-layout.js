/* Fictional gameplay facilities, placed outside surveyed building footprints. */
(()=>{function apply(W){
 const occupied=[],sites=[],scale=W.serviceScale||1;
 const local=(p,s)=>({x:((p[0]-s.x)*s.ux+(p[1]-s.z)*s.uz)/(s.scale||1),z:(-(p[0]-s.x)*s.uz+(p[1]-s.z)*s.ux)/(s.scale||1)});
 function intersects(points,s,minX=0,maxX=10,minZ=-5,maxZ=5){const ps=points.map(p=>local(p,s));
 const inside=p=>p.x>=minX&&p.x<=maxX&&p.z>=minZ&&p.z<=maxZ;
 if(ps.some(inside))return true;
 for(let i=0;i<ps.length-1;i++){const a=ps[i],b=ps[i+1];let lo=0,hi=1;for(const [v,d,mn,mx] of [[a.x,b.x-a.x,minX,maxX],[a.z,b.z-a.z,minZ,maxZ]]){if(Math.abs(d)<1e-9){if(v<mn||v>mx){hi=-1;break;}}else{const t0=(mn-v)/d,t1=(mx-v)/d;lo=Math.max(lo,Math.min(t0,t1));hi=Math.min(hi,Math.max(t0,t1));}}if(lo<=hi)return true;}
 // A large enclosing footprint can have all its edges outside the site.
 let insidePoly=false;for(let i=0,j=ps.length-1;i<ps.length;j=i++)if((ps[i].z>0)!==(ps[j].z>0)&&5<(ps[j].x-ps[i].x)*(-ps[i].z)/(ps[j].z-ps[i].z)+ps[i].x)insidePoly=!insidePoly;return insidePoly;
 }
 for(const p of W.services.filter(p=>p.type!=='training')){const candidates=[];
 for(const r of W.roads.filter(r=>!['track','service'].includes(r.type)))for(let i=1;i<r.points.length;i++){const a=r.points[i-1],b=r.points[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<1)continue;for(const side of [-1,1])for(const f of [.25,.5,.75]){const ux=-(b[1]-a[1])/len*side,uz=(b[0]-a[0])/len*side,offset=r.width/2+.15,s={x:a[0]+(b[0]-a[0])*f+ux*offset,z:a[1]+(b[1]-a[1])*f+uz*offset,ux,uz,scale,access:(offset+.35)/scale,type:p.type};s.score=Math.hypot(s.x-p.x,s.z-p.z);candidates.push(s);}}
 candidates.sort((a,b)=>a.score-b.score);const s=candidates.find(s=>!W.buildings.some(b=>intersects(b.points,s))&&!W.roads.some(r=>intersects(r.points,s,.1,10,-5-r.width/(2*scale),5+r.width/(2*scale)))&&!occupied.some(poly=>intersects(poly,s)));
 if(!s)throw new Error('No clear service site for '+p.type);
 const world=(x,z)=>[s.x+(x*s.ux-z*s.uz)*scale,s.z+(x*s.uz+z*s.ux)*scale];occupied.push([[0,-5],[10,-5],[10,5],[0,5],[0,-5]].map(q=>world(...q)));p.site=s;p.x=world(1.15,0)[0];p.z=world(1.15,0)[1];p.source='Facilitate virtuală Pixel Drive, nu clădire OSM';sites.push(s);
 }
 // Keep the training course axis-aligned because its tasks and ramp share axes.
 const school=W.services.find(p=>p.type==='school'),courseCandidates=[];
 for(let x=school.x-45;x<school.x+45;x+=3)for(let z=school.z-45;z<school.z+45;z+=3){const q={x,z,ux:1,uz:0},n=W.nearestRoad(q);if(!n||n.d>18)continue;
 if(W.buildings.some(b=>intersects(b.points,q,-14,14,-7,7))||W.roads.some(r=>intersects(r.points,q,-14,14,-7,7))||occupied.some(p=>intersects(p,q,-14,14,-7,7)))continue;
 const end={x:Math.max(x-12.5,Math.min(x+12.5,n.x)),z:Math.max(z-5.5,Math.min(z+5.5,n.z))},len=Math.hypot(end.x-n.x,end.z-n.z),link={x:n.x,z:n.z,ux:(end.x-n.x)/len,uz:(end.z-n.z)/len};
 if(W.buildings.some(b=>intersects(b.points,link,0,len,-1.3,1.3)))continue;courseCandidates.push({q,n,end,len,score:Math.hypot(x-school.x,z-school.z)+len*2});}
 courseCandidates.sort((a,b)=>a.score-b.score);if(!courseCandidates.length)throw new Error('No clear training campus');
 const course=courseCandidates[0];W.trainingCenter={x:course.q.x,z:course.q.z};const training=W.services.find(p=>p.type==='training');training.x=course.q.x-10;training.z=course.q.z+3;W.trainingAccess={a:{x:course.n.x,z:course.n.z},b:course.end};
 const base=W.roadAt;W.roadAt=(x,z,margin=0)=>base(x,z,margin)||(()=>{const a=W.trainingAccess.a,b=W.trainingAccess.b,dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz),t=((x-a.x)*dx+(z-a.z)*dz)/(l*l);return t>=0&&t<=1&&Math.abs((x-a.x)*dz-(z-a.z)*dx)/l<=1.2-margin;})()||sites.some(s=>{const p=local([x,z],s),m=margin/(s.scale||1);return(p.x>=-s.access+m&&p.x<=4.1-m&&Math.abs(p.z)<=1.05-m)||(p.x>=1.1+m&&p.x<=4.1-m&&Math.abs(p.z)<=4.35-m);});
 W.serviceSites=sites;W.serviceSiteLocal=local;
}window.DriveServiceLayout={apply};})();
