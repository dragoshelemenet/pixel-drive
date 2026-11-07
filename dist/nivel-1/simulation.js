(() => {
 const W=window.DriveWorld,R=window.DriveRules;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 let attempt=0;
 const scenarios=[
 {kind:'stop',x:24.78,z:15,title:'Oprire la STOP',hint:'Studiază indicatorul cu I, apoi oprește complet înainte de intersecție.'},
 {kind:'roundabout',x:40.78,z:47,title:'Sens giratoriu',hint:'Studiază indicatorul cu I. Cedează la intrare și semnalizează ieșirea.'},
 {kind:'children',x:56.78,z:37,title:'Zonă cu copii',hint:'Caută indicatorul Copii și apasă I. Redu viteza și urmărește marginile drumului.'},
 {kind:'yield',x:40.78,z:15,title:'Cedează trecerea',hint:'Apasă I lângă indicator, apoi verifică drumul transversal.'},
 {kind:'roadworks',x:72.78,z:69,title:'Lucrări pe drum',hint:'Studiază semnul cu I și treci prudent pe lângă zona de lucrări.'},
 {kind:'slippery',x:88.78,z:85,title:'Carosabil alunecos',hint:'Apasă I lângă semn. Redu viteza și evită frânarea bruscă.'},
 {kind:'bump',x:40.78,z:101,title:'Drum cu denivelări',hint:'Studiază indicatorul cu I și încetinește înainte de denivelări.'},
 {kind:'noParking',x:85,z:39.22,angle:Math.PI,title:'Staționarea interzisă',hint:'Găsește indicatorul și apasă I pentru diferența dintre oprire și staționare.'}
 ];
 // Extra repeated exercises at genuine unsignalled intersections.
 const rightJunctions=W.junctions.filter(j=>j.type==='right'&&j.col>0&&j.col<6&&j.row>0&&j.row<6);
 for(const j of rightJunctions.filter((_,i)=>i%3===0).slice(0,7))scenarios.push({
  kind:'right',junctionId:j.id,x:j.x+W.LANE,z:j.z+6.3,angle:-Math.PI/2,
  title:'Prioritate de dreapta',hint:'Intersecție nedirijată! Privește în dreapta și acordă prioritate înainte de a intra.'
 });
 function create(options={}){
  const s={player:{x:24.78,z:19,angle:-Math.PI/2,speed:0,indicator:0},time:0,score:1000,collisions:0,failed:false,paused:false,limit:50,message:'Obiectiv: mergi la punctul marcat și preia pasagerul.',messageUntil:7,lastPenalty:-10,ruleCooldown:{},stopMemory:{},passed:new Set(),learned:new Set(),distance:0,traffic:[],pedestrians:[],mission:{phase:'pickup'},violationEvent:null,violationSerial:0,retraining:null};
  for(let i=0;i<46;i++){
   const j=W.junctions[(i*13+3)%W.junctions.length];let d=i%4;while(!W.neighbor(j,(d+2)%4))d=(d+1)%4;
   const v=W.V[d],r=W.right(d);s.traffic.push({id:i,x:j.x-v.x*7+r.x*W.LANE,z:j.z-v.z*7+r.z*W.LANE,angle:Math.atan2(v.z,v.x),d,j,speed:0,cruise:1.5+(i%5)*.16,phase:'approach',stopTime:0,color:['#be6851','#a7b5bf','#d7bb76','#729a91','#797da2'][i%5]});
  }
  for(const j of W.roundabouts)s.traffic.push({id:s.traffic.length,orbit:j,theta:0,x:j.x+2.9,z:j.z,angle:-Math.PI/2,speed:1.5,color:'#c19769'});
  for(let i=0;i<W.junctions.length;i++)if(i%3===1&&W.junctions[i].type!=='roundabout'){const j=W.junctions[i];s.pedestrians.push({id:i,j,x:j.x-2.1,z:j.z+1.62,crossing:false,t:0,wait:0,direction:1,color:['#c86d61','#6d99b4','#d3ae61'][i%3]});}
  s.studied=new Set();
  if(options.vary){let index=attempt;try{index=Number(localStorage.getItem('pixel-route-attempt')||0);if(!Number.isFinite(index))index=0;localStorage.setItem('pixel-route-attempt',String(index+1));}catch{}attempt=index+1;const lesson=scenarios[index%scenarios.length];Object.assign(s.player,{x:lesson.x,z:lesson.z,angle:lesson.angle??-Math.PI/2});s.scenario={...lesson,startDistance:0,complete:false};s.message=lesson.title+' · '+lesson.hint;s.messageUntil=10;s.traffic=s.traffic.filter(t=>Math.hypot(t.x-s.player.x,t.z-s.player.z)>3);
   if(lesson.kind==='right'){
    const j=W.junctions.find(q=>q.id===lesson.junctionId);
    // Create a clearly visible car approaching from the player's RIGHT.
    // Its heading 3 is west, so the car comes from the east side.
    s.traffic=s.traffic.filter(t=>Math.hypot(t.x-j.x,t.z-j.z)>7.6);
    s.traffic.push({id:999,x:j.x+6.5,z:j.z-W.LANE,angle:Math.PI,d:3,j,speed:0,
      cruise:1.3,phase:'approach',stopTime:0,color:'#48a2d5',tutorial:true});
   }
  }
  return s;
 }
 function penalize(s,points,text,key,delay=3,meta=null){
  if(s.failed||s.time-(s.ruleCooldown[key]??-100)<delay)return false;
  s.ruleCooldown[key]=s.time;
  s.score=Math.max(0,s.score-points);s.message=`−${points} · ${text}`;s.messageUntil=s.time+4;
  // One report per physics frame; consumed after the actual screen is drawn.
  if(!s.violationEvent)s.violationEvent={id:++s.violationSerial,kind:meta?.kind||key.split('-')[0],
    key,points,text,junctionId:meta?.junctionId||null,direction:meta?.direction??null,
    limit:s.limit,time:s.time,player:{...s.player}};
  if(s.score===0){s.failed=true;s.player.speed=0;}
  return true;
 }
 function collision(s,kind){if(s.time-s.lastPenalty<2||s.failed)return;s.lastPenalty=s.time;s.collisions++;penalize(s,120,kind,'collision',0,{kind:'collision'});s.player.speed=0;if(s.collisions>=4){s.failed=true;s.message='Patru coliziuni. Reîncearcă traseul cu viteză mai mică.';}}
 function trafficConflict(s,j,d,onlyRight=false,ignore=null){const r=W.right(d);return s.traffic.some(t=>t!==ignore&&Math.hypot(t.x-j.x,t.z-j.z)<4.8&&(t.speed>.05||t.phase==='cross')&&(onlyRight?(t.d===(d+3)%4&&((t.x-j.x)*r.x+(t.z-j.z)*r.z>.6)):(t.d%2!==d%2||t.orbit)));}
 function crossPath(j,d,out){
  const v=W.V[d],r=W.right(d),u=W.V[out],rr=W.right(out),distance=j.type==='roundabout'?4.3:3.0;
  const a={x:j.x-v.x*distance+r.x*W.LANE,z:j.z-v.z*distance+r.z*W.LANE},b={x:j.x+u.x*distance+rr.x*W.LANE,z:j.z+u.z*distance+rr.z*W.LANE};
  if(j.type==='roundabout'){
   let start=Math.atan2(a.z-j.z,a.x-j.x),end=Math.atan2(b.z-j.z,b.x-j.x);while(end>=start-.2)end-=Math.PI*2;
   const points=[a];for(let t=0;t<=1;t+=.04){const ang=start+(end-start)*t;points.push({x:j.x+Math.cos(ang)*2.9,z:j.z+Math.sin(ang)*2.9});}points.push(b);return points;
  }
  if(d===out)return[a,b];
  let c=d%2===0?{x:a.x,z:b.z}:{x:b.x,z:a.z};const points=[];
  for(let t=0;t<=1.001;t+=.05)points.push({x:(1-t)**2*a.x+2*(1-t)*t*c.x+t*t*b.x,z:(1-t)**2*a.z+2*(1-t)*t*c.z+t*t*b.z});return points;
 }
 function pedestrians(s,dt){for(const p of s.pedestrians){
  if(p.crossing){p.t+=dt/8;if(p.t>=1){p.t=0;p.crossing=false;p.direction*=-1;p.wait=5;}p.x=p.j.x+(p.direction===1?-2.1+4.2*p.t:2.1-4.2*p.t);}
  else{p.wait=Math.max(0,p.wait-dt);p.x=p.j.x-p.direction*2.1;
   const green=p.j.type==='signal'?W.pedGreen(p.j,s.time)&&(s.time+p.j.offset)%32<24.5:((s.time+p.id)%24)>9&&((s.time+p.id)%24)<10;
   const clear=!s.traffic.some(t=>Math.hypot(t.x-p.j.x,t.z-p.z)<3&&t.speed>.2)&&!(Math.hypot(s.player.x-p.j.x,s.player.z-p.z)<2.5&&Math.abs(s.player.speed)>.2);
   if(!p.wait&&green&&clear){p.crossing=true;p.t=0;}
  }
 }}
 function traffic(s,dt){for(const t of s.traffic){
  if(t.orbit){t.theta-=dt*.5;t.x=t.orbit.x+Math.cos(t.theta)*2.9;t.z=t.orbit.z+Math.sin(t.theta)*2.9;t.angle=t.theta-Math.PI/2;continue;}
  const v=W.V[t.d];
  if(t.phase==='approach'){
   const dist=(t.j.x-t.x)*v.x+(t.j.z-t.z)*v.z,entry=t.j.type==='roundabout'?4.3:3;
   let wait=false;
   if(dist<entry+.45){
    if(t.j.type==='signal')wait=W.light(t.j,t.d,s.time)!=='green';
    else if(t.j.type==='stop'&&t.d%2===0){t.stopTime+=dt;wait=t.stopTime<1||trafficConflict(s,t.j,t.d,false,t);}
    else if(t.j.type==='yield'&&t.d%2===0)wait=trafficConflict(s,t.j,t.d,false,t);
    else if(t.j.type==='right')wait=trafficConflict(s,t.j,t.d,true,t);
    else if(t.j.type==='roundabout')wait=s.traffic.some(o=>o!==t&&Math.hypot(o.x-t.x,o.z-t.z)<2.8);
   }
   if(s.pedestrians.some(p=>p.crossing&&(p.x-t.x)*v.x+(p.z-t.z)*v.z>0&&Math.hypot(p.x-t.x,p.z-t.z)<3))wait=true;
   const obstacles=[...s.traffic.filter(o=>o!==t),s.player];
   if(obstacles.some(o=>{const dx=o.x-t.x,dz=o.z-t.z,a=dx*v.x+dz*v.z,l=Math.abs(dx*v.z-dz*v.x);return a>0&&a<1.5&&l<.55;}))wait=true;
   t.speed=wait?Math.max(0,t.speed-7*dt):Math.min(t.cruise,t.speed+2*dt);
   if(dist<=entry+.02&&!wait){
    let choices=[t.d,(t.d+1)%4,(t.d+3)%4].filter(d=>W.neighbor(t.j,d));if(!choices.length)choices=[(t.d+2)%4];
    t.out=choices[(t.id+Math.floor(s.time/12))%choices.length];t.path=crossPath(t.j,t.d,t.out);t.pathIndex=1;t.phase='cross';
   }else{const step=Math.min(t.speed*dt,Math.max(0,dist-entry));t.x+=v.x*step;t.z+=v.z*step;}
  }else{
   const dest=t.path[t.pathIndex],dx=dest.x-t.x,dz=dest.z-t.z,len=Math.hypot(dx,dz);let blocked=false;if(len>.001){const vx=dx/len,vz=dz/len;blocked=[s.player,...s.traffic.filter(o=>o!==t)].some(o=>{const ox=o.x-t.x,oz=o.z-t.z;return ox*vx+oz*vz>0&&ox*vx+oz*vz<1.15&&Math.abs(ox*vz-oz*vx)<.55;})||s.pedestrians.some(p=>p.crossing&&Math.hypot(p.x-t.x,p.z-t.z)<1.2);}t.speed=blocked?0:t.cruise*.8;const step=Math.min(len,t.speed*dt);if(len>.0001){t.x+=dx/len*step;t.z+=dz/len*step;t.angle=Math.atan2(dz,dx);}
   if(len<.06){t.pathIndex++;if(t.pathIndex>=t.path.length){t.d=t.out;t.j=W.neighbor(t.j,t.d);t.phase='approach';t.stopTime=0;t.angle=Math.atan2(W.V[t.d].z,W.V[t.d].x);}}
  }
 }}
 function checkRules(s,old){
  const p=s.player,d=W.heading(p.angle),v=W.V[d];
  for(const j of W.junctions){
   const along=(j.x-p.x)*v.x+(j.z-p.z)*v.z,lateral=Math.abs((j.x-p.x)*v.z-(j.z-p.z)*v.x),before=(j.x-old.x)*v.x+(j.z-old.z)*v.z;
   if(lateral<1.6&&before>0&&along<=0&&p.speed>0)s.limit=50;
   const line=j.type==='roundabout'?4.35:2.55,key=j.id+'-'+d;
   if(lateral<1.6&&along>line&&along<line+1.8&&Math.abs(p.speed)<.015)s.stopMemory[key]=s.time;
   if(lateral<1.6&&before>line&&along<=line&&p.speed>0){
    if(j.type==='signal'&&W.light(j,d,s.time)==='red')penalize(s,100,'Ai trecut pe roșu.','red-'+key,8,{kind:'red',junctionId:j.id,direction:d});
    if(j.type==='stop'&&d%2===0&&s.time-(s.stopMemory[key]??-100)>8)penalize(s,80,'STOP cere oprire completă.','stop-'+key,8,{kind:'stop',junctionId:j.id,direction:d});
    if(j.type==='right'&&trafficConflict(s,j,d,true))penalize(s,80,'Nu ai acordat prioritate de dreapta.','right-'+key,8,{kind:'right',junctionId:j.id,direction:d});
    if((j.type==='yield'||j.type==='stop')&&d%2===0&&trafficConflict(s,j,d,false))penalize(s,80,'Acordă prioritate drumului transversal.','yield-'+key,8,{kind:'yield',junctionId:j.id,direction:d});
    if(j.type==='roundabout'&&s.traffic.some(t=>Math.hypot(t.x-j.x,t.z-j.z)<3.7&&Math.hypot(t.x-p.x,t.z-p.z)<3.8))penalize(s,80,'Acordă prioritate celor din giratoriu.','round-'+key,8,{kind:'round',junctionId:j.id,direction:d});
    s.passed.add(key);
   }
  }
  for(const sign of W.signs)if(sign.d===d&&sign.kind.startsWith('limit')){
   const a=(sign.x-p.x)*v.x+(sign.z-p.z)*v.z,b=(sign.x-old.x)*v.x+(sign.z-old.z)*v.z;if(b>0&&a<=0&&Math.hypot(sign.x-p.x,sign.z-p.z)<3)s.limit=Number(sign.kind.slice(5));
  }
  const speed=Math.abs(p.speed)*21.6;if(speed>s.limit+2)penalize(s,20,`Ai depășit limita de ${s.limit} km/h.`,'speed',5,{kind:'speed'});
 }
 function update(s,input,dt){
  if(s.failed||s.paused)return;dt=Math.min(dt,.05);s.time+=dt;
  pedestrians(s,dt);traffic(s,dt);
  const p=s.player,old={x:p.x,z:p.z};
  // Softer throttle: ~3x more time to accelerate, while preserving top speed and braking.
  const ACCEL_FORWARD=0.50, ACCEL_REVERSE=0.60;
  if(input.w){
   p.speed=Math.min(2.8,Math.max(0,p.speed)+ACCEL_FORWARD*dt);
  }else if(input.s){
   // S brakes firmly while moving forward; only slowly accelerates in reverse after stopping.
   p.speed=p.speed>0?Math.max(0,p.speed-3.5*dt):Math.max(-1.1,p.speed-ACCEL_REVERSE*dt);
  }else{
   p.speed=p.speed>0?Math.max(0,p.speed-.7*dt):Math.min(0,p.speed+1.2*dt);
  }
  if(input.space)p.speed=p.speed>0?Math.max(0,p.speed-6*dt):Math.min(0,p.speed+6*dt);
  const steering=(input.d?1:0)-(input.a?1:0);if(Math.abs(p.speed)>.01)p.angle+=steering*1.35*clamp(p.speed/1.1,-1,1)*dt;
  const nx=p.x+Math.cos(p.angle)*p.speed*dt,nz=p.z+Math.sin(p.angle)*p.speed*dt;
  // Four corners prevent the body from crossing curbs and central islands.
  const forward={x:Math.cos(p.angle),z:Math.sin(p.angle)},right={x:-forward.z,z:forward.x};
  let valid=true;for(const a of [-.45,.45])for(const b of [-.22,.22])if(!W.roadAt(nx+forward.x*a+right.x*b,nz+forward.z*a+right.z*b,.02))valid=false;
  if(valid){p.x=nx;p.z=nz;s.distance+=Math.hypot(nx-old.x,nz-old.z);}else if(Math.abs(p.speed)>.08)collision(s,'Coliziune cu bordura sau un obstacol.');
  for(const t of s.traffic)if(Math.hypot(t.x-p.x,t.z-p.z)<.75){p.x=old.x;p.z=old.z;collision(s,'Coliziune cu un vehicul.');}
  for(const ped of s.pedestrians)if(ped.crossing&&Math.hypot(ped.x-p.x,ped.z-p.z)<.43){s.failed=true;s.score=0;p.speed=0;s.message='Ai lovit un pieton. Oprește înainte de trecere și acordă prioritate.';}
  checkRules(s,old);
  // A failed lesson stays active until the driver repeats it correctly.
  const retry=s.retraining;
  if(retry&&!s.violationEvent){
   let success=false;
   if(retry.junctionId){
    const j=W.junctions.find(q=>q.id===retry.junctionId);
    if(j){
     const v=W.V[retry.direction],line=retry.kind==='round'?4.35:2.55;
     const before=(j.x-old.x)*v.x+(j.z-old.z)*v.z;
     const after=(j.x-p.x)*v.x+(j.z-p.z)*v.z;
     const lateral=Math.abs((j.x-p.x)*v.z-(j.z-p.z)*v.x);
     success=lateral<1.6&&before>line&&after<=line&&p.speed>0;
    }
   }else success=s.distance>=retry.startDistance+4&&
    Math.abs(p.speed)*21.6<=s.limit+1&&s.collisions===retry.collisions;
   if(success){s.retraining=null;s.message='✓ Corect! Ai repetat manevra regulamentar. Continuă traseul.';s.messageUntil=s.time+7;}
  }
  if(s.scenario&&!s.scenario.complete&&(s.scenario.kind==='right'?s.learned.has('right'):s.studied.has(s.scenario.kind))&&s.distance>8){s.scenario.complete=true;s.score+=100;s.message='Situație studiată · +100 puncte. Continuă explorarea orașului.';s.messageUntil=s.time+6;}
  const c=R.context(s);if(c.key!=='drive')s.learned.add(c.key);
 }
 function objective(s){
  if(s.scenario&&!s.scenario.complete){
   const l=s.scenario;
   if(l.kind==='right'){
    const j=W.junctions.find(q=>q.id===l.junctionId),dist=j?Math.hypot(j.x-s.player.x,j.z-s.player.z):null;
    return {title:l.title,text:l.hint+' Privește după vehiculul albastru care vine din dreapta.',target:j||null,distance:dist,lesson:true};
   }
   const sign=W.signs.filter(q=>q.kind===l.kind).sort((a,b)=>Math.hypot(a.x-l.x,a.z-l.z)-Math.hypot(b.x-l.x,b.z-l.z))[0];return {title:l.title,text:s.studied.has(l.kind)?'Semn studiat. Continuă prudent traseul pentru a încheia exercițiul.':l.hint,target:sign,distance:sign?Math.hypot(sign.x-s.player.x,sign.z-s.player.z):null,lesson:true};}
  const id={pickup:'pickup',dropoff:'dropoff',park:'parking'}[s.mission.phase];
  const target=W.landmarks.find(l=>l.id===id);
  if(!target)return{phase:'complete',title:'Cursă completă',text:'Ai dus pasagerul la destinație și ai parcat în locul marcat.',target:null,distance:null};
  const copy={
   pickup:['Preia pasagerul','Mergi la zona albastră de preluare. Oprește complet și apasă I.'],
   dropoff:['Du pasagerul la destinație','Urmează marcajul albastru. Oprește în zona de coborâre și apasă I.'],
   park:['Parchează regulamentar','Mergi la locul marcat cu P. Oprește în interior și apasă I.']
  }[s.mission.phase];
  return{phase:s.mission.phase,title:copy[0],text:copy[1],target,distance:Math.hypot(target.x-s.player.x,target.z-s.player.z)};
 }
 function interact(s){
  if(s.scenario&&!s.scenario.complete)return null;
  const o=objective(s);if(!o.target||o.distance>2.25)return null;
  if(Math.abs(s.player.speed)>.04){s.message='Oprește complet în zona marcată, apoi apasă I.';s.messageUntil=s.time+3;return{type:'need-stop'};}
  if(s.mission.phase==='pickup'){s.mission.phase='dropoff';s.score+=100;s.message='Pasager preluat. Urmează marcajul pentru destinație.';}
  else if(s.mission.phase==='dropoff'){s.mission.phase='park';s.score+=100;s.message='Pasagerul a coborât în siguranță. Acum parchează la P.';}
  else{s.mission.phase='complete';s.score+=200;s.message='Cursă completă! Ai învățat preluarea, coborârea și parcarea.';}
  s.messageUntil=s.time+5;return{type:'mission',phase:s.mission.phase};
 }
 window.DriveSimulation={create,update,penalize,collision,crossPath,trafficConflict,checkRules,objective,interact};
})();
