(() => {
 const W=window.DriveWorld,TILE=24,VW=640,VH=360;
 let ctx,cameraAngle=null,weather=null;
 const project=(x,z)=>({x:x*TILE,y:z*TILE});
 function polygon(points,color,stroke){ctx.beginPath();ctx.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x,points[i].y);ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1;ctx.stroke();}}
 function worldRect(x,z,x2,z2,c){rect(x*TILE,z*TILE,(x2-x)*TILE,(z2-z)*TILE,c);}
 function disk(x,z,r,color){ctx.fillStyle=color;ctx.beginPath();ctx.arc(x*TILE,z*TILE,r*TILE,0,Math.PI*2);ctx.fill();}
  function noise(a,b){const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n)}
  function house(x,z,w,h,variant){
    const p=project(x,z),bw=w*TILE,bh=h*TILE,roof=['#65545b','#45546a','#665b4d','#4c6256','#736758'][variant%5];
    rect(p.x+5,p.y+7,bw,bh+4,'#17251f60');
    rect(p.x,p.y+5,bw,bh+4,'#28272b');rect(p.x+2,p.y+bh,bw-4,7,['#9a7766','#b4a181','#8b8477'][variant%3]);
    for(let j=3;j<bw-5;j+=11){rect(p.x+j,p.y+bh+2,7,3,'#27383e');rect(p.x+j+1,p.y+bh+2,5,1,'#8ab3b9');}
    rect(p.x+bw/2-3,p.y+bh+2,6,8,'#302d30');rect(p.x+bw/2-2,p.y+bh+3,4,6,'#826259');
    rect(p.x,p.y,bw,bh,'#28272b');rect(p.x+1,p.y+1,bw-2,bh-2,'#b7ad91');rect(p.x+3,p.y+3,bw-6,bh-6,'#303237');rect(p.x+4,p.y+4,bw-8,bh-8,roof);
    if(variant%3===0){
      rect(p.x+bw/2,p.y+4,bw/2-4,bh-8,'#252a3338');
      for(let j=7;j<bh-4;j+=3){rect(p.x+4,p.y+j,bw-8,.5,'#cec1ab55');rect(p.x+4,p.y+j+1,bw-8,.5,'#201f2b55');}
      rect(p.x+bw/2-1,p.y+3,2,bh-6,'#c3b391');
    }else{
      for(let j=6;j<bh-3;j+=6)rect(p.x+4,p.y+j,bw-8,.4,'#22283155');
      for(let j=9;j<bw-4;j+=9)rect(p.x+j,p.y+4,.4,bh-8,'#262a3333');
    }
    // Skylight and ventilation unit.
    rect(p.x+7,p.y+7,10,8,'#242931');rect(p.x+8,p.y+8,8,6,'#d3d0b8');rect(p.x+9,p.y+9,6,4,'#77a5b0');rect(p.x+10,p.y+9,1,4,'#c7e0d9');
    rect(p.x+bw-14,p.y+bh-12,9,7,'#282b30');rect(p.x+bw-13,p.y+bh-11,7,5,'#b0ada2');
    for(let j=0;j<3;j++)rect(p.x+bw-12,p.y+bh-10+j,5,.5,'#42474c');
    if(variant%3===2){for(let j=1;j<bw-2;j+=5)rect(p.x+j,p.y+bh-2,4,5,(j%2)?'#dfd7b8':'#587450');rect(p.x+1,p.y+bh+3,bw-2,1,'#333c30');}
    for(let i=0;i<18;i++){const dx=noise(i,variant)*Math.max(1,bw-10),dy=noise(variant,i+4)*Math.max(1,bh-10);rect(p.x+5+dx,p.y+5+dy,.6,1.2,'#22263244');}
  }
  function tree(x,z,variant=0){
    const p=project(x,z),r=variant?10:8;
    rect(p.x+3,p.y+4,r+3,6,'#29331e45');rect(p.x-1,p.y,3,8,'#544130');rect(p.x-2,p.y+5,5,2,'#6c5338');
    const blobs=[[-3,-5,7],[3,-4,7],[0,-10,6],[-6,-8,4],[6,-9,4]];
    blobs.forEach(([dx,dy,rr],i)=>{rr*=r/9;polygon(Array.from({length:12},(_,k)=>({x:p.x+dx+Math.round(Math.cos(k*Math.PI/6)*rr),y:p.y+dy+Math.round(Math.sin(k*Math.PI/6)*rr)})),['#3f622e','#4d7134','#6d8c3e','#5c7c36','#718c3e'][i],'#384a2b');});
    for(let i=0;i<65;i++){let dx=(noise(i,x*11)-.5)*r*1.8,dy=(noise(z*13,i)-.5)*r*1.6;if(dx*dx+dy*dy<r*r*.8)rect(p.x+dx,p.y-7+dy,.7,.7,['#81974a','#6b893d','#4c6d32','#95a351'][i%4]);}
  }
  function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.max(.5,Math.round(w)),Math.max(.5,Math.round(h)))}
 const cache=document.createElement('canvas');cache.width=cache.height=W.SIZE*TILE;ctx=cache.getContext('2d');
 function terrain(){
  rect(0,0,cache.width,cache.height,'#718b47');
  // Continuous streets. Outer rows form T junctions and corners.
  for(const z of W.AXES){worldRect(5.9,z-2.1,106.1,z+2.1,'#443f40');worldRect(6,z-2,106,z+2,'#b5a58e');}
  for(const x of W.AXES){worldRect(x-2.1,5.9,x+2.1,106.1,'#443f40');worldRect(x-2,6,x+2,106,'#b5a58e');}
  for(const z of W.AXES)worldRect(6.4,z-1.6,105.6,z+1.6,'#45464e');
  for(const x of W.AXES)worldRect(x-1.6,6.4,x+1.6,105.6,'#45464e');
  for(let i=0;i<19000;i++){const x=noise(i,1)*W.SIZE,z=noise(i,2)*W.SIZE;if(W.roadAt(x,z)){const p=project(x,z);rect(p.x,p.y,.7,.5,i%2?'#a9a79c18':'#1d25302c');}}
  for(const z of W.AXES)for(let x=7;x<105;x+=1.7)if(!W.AXES.some(v=>Math.abs(x+.3-v)<3))worldRect(x,z-.035,x+.65,z+.035,'#ddd3be');
  for(const x of W.AXES)for(let z=7;z<105;z+=1.7)if(!W.AXES.some(v=>Math.abs(z+.3-v)<3))worldRect(x-.035,z,x+.035,z+.65,'#ddd3be');
  for(const j of W.junctions){
   if(j.type==='roundabout'){
    disk(j.x,j.z,4.35,'#c0b299');disk(j.x,j.z,4.1,'#45464e');disk(j.x,j.z,1.95,'#e7d5b1');disk(j.x,j.z,1.78,'#6b9144');tree(j.x,j.z+.2,1);
    for(let a=0;a<Math.PI*2;a+=Math.PI/2){const x=j.x+Math.cos(a)*2.9,z=j.z+Math.sin(a)*2.9;ctx.save();ctx.translate(x*TILE,z*TILE);ctx.rotate(a-Math.PI/2);polygon([{x:5,y:0},{x:-3,y:-3},{x:-1,y:0},{x:-3,y:3}],'#e6ddc4');ctx.restore();}
   }else for(let d=0;d<4;d++)if(W.neighbor(j,(d+2)%4)){
    const v=W.V[d],r=W.right(d),center={x:j.x-v.x*2,z:j.z-v.z*2};
    for(let n=0;n<9;n++){const offset=-1.5+n*.35,cx=center.x+r.x*offset,cz=center.z+r.z*offset;ctx.save();ctx.translate(cx*TILE,cz*TILE);ctx.rotate(Math.atan2(v.z,v.x));rect(-.32*TILE,-.09*TILE,.64*TILE,.18*TILE,'#eee2c8');ctx.restore();}
    if(j.type==='signal'||(j.type==='stop'&&d%2===0)){
      const x=j.x-v.x*2.55+r.x*.82,z=j.z-v.z*2.55+r.z*.82;ctx.save();ctx.translate(x*TILE,z*TILE);ctx.rotate(Math.atan2(v.z,v.x));rect(-1,-17,2,33,'#eee2c8');ctx.restore();
    }
   }
  }
  for(const z of W.AXES)for(let x=6;x<106;x+=.6)if(!W.AXES.some(v=>Math.abs(x-v)<1.7)){worldRect(x,z-2,x+.025,z-1.64,'#766b62');worldRect(x,z+1.64,x+.025,z+2,'#766b62');}
  for(const x of W.AXES)for(let z=6;z<106;z+=.6)if(!W.AXES.some(v=>Math.abs(z-v)<1.7)){worldRect(x-2,z,x-1.64,z+.025,'#766b62');worldRect(x+1.64,z,x+2,z+.025,'#766b62');}
  for(const b of W.parkingBays){
   const x0=b.x-b.w/2,z0=b.z-b.h/2,x1=b.x+b.w/2,z1=b.z+b.h/2;
   worldRect(x0,z0,x1,z1,'#55575c');worldRect(x0,z0,x0+.09,z1,'#e6deca');worldRect(x1-.09,z0,x1,z1,'#e6deca');
   worldRect(x0,z0,x1,z0+.09,'#e6deca');worldRect(x0,z1-.09,x1,z1,'#e6deca');
  }
  const busStop=W.landmarks.find(l=>l.kind==='busStop');
  if(busStop)worldRect(busStop.x-.68,busStop.z-25/6,busStop.x-.52,busStop.z+25/6,'#c44e42');
  for(let col=0;col<6;col++)for(let row=0;row<6;row++){
   const x=W.AXES[col]+2.3,z=W.AXES[row]+2.3,w=11.4,h=11.4,seed=col*7+row*3;
   worldRect(x,z,x+w,z+h,'#7f9c4e');
   for(let i=0;i<180;i++){const q=project(x+noise(i,seed)*w,z+noise(seed,i+15)*h);rect(q.x,q.y,.7,.7,i%2?'#b2bc6260':'#49682d60');}
   if((col+row)%5===2){worldRect(x+w/2-.3,z,x+w/2+.3,z+h,'#c5baa0');worldRect(x,z+h/2-.3,x+w,z+h/2+.3,'#c5baa0');for(const dx of [2,5,9])for(const dz of [2,9])tree(x+dx,z+dz,1);disk(x+w/2,z+h/2,.75,'#c8c0a3');disk(x+w/2,z+h/2,.55,'#68989a');}
   else for(let a=0;a<3;a++)for(let b=0;b<2;b++){
    const bx=x+.5+a*3.6,bz=z+.5+b*5.5;
    const buildingH=3.1+(seed+a)%2*.5;
    // Leave room at the corners for the wider roundabouts.
    if(W.roundabouts.some(j=>Math.hypot(bx+1.2-j.x,bz+1.6-j.z)<5.7))continue;
    if(W.parkingBays.some(q=>bx<q.x+q.w/2&&bx+2.7>q.x-q.w/2&&bz<q.z+q.h/2&&bz+buildingH>q.z-q.h/2))continue;
    house(bx,bz,2.7,buildingH,seed+a+b*2);
    worldRect(bx+1,bz+3.9,bx+1.5,bz+4.8,'#c4b79b');tree(bx+2.7,bz+4.3,seed%2);
    const p=project(bx,bz+4.5);rect(p.x,p.y,16,6,'#4b5338');for(let k=0;k<7;k++)rect(p.x+2+k*2,p.y+2+(k%2),1,1,['#d3a293','#e5c88b','#97b778'][k%3]);
   }
  }
 }
 terrain();
 function sign(kind,x,z,scale=1){
  ctx.save();ctx.translate(x*TILE,z*TILE);ctx.scale(scale,scale);rect(-1,3,2,10,'#252a28');rect(-.5,4,.5,8,'#c8cbbb');
  const real=window.DriveSignBitmaps?.[kind];if(real?.complete&&real.naturalWidth){ctx.drawImage(real,-9,-9,18,18);ctx.restore();return;}
  if(kind==='stop'){
   polygon([[-4,-8],[4,-8],[8,-4],[8,4],[4,8],[-4,8],[-8,4],[-8,-4]].map(([x,y])=>({x,y})),'#ede9d9','#262d2b');polygon([[-3,-6],[3,-6],[6,-3],[6,3],[3,6],[-3,6],[-6,3],[-6,-3]].map(([x,y])=>({x,y})),'#c43b35');ctx.font='bold 4px monospace';ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText('STOP',0,1.5);
  }else if(kind==='yield'){
   polygon([{x:-8,y:-7},{x:8,y:-7},{x:0,y:8}],'#df493d','#202c29');polygon([{x:-5,y:-5},{x:5,y:-5},{x:0,y:4}],'#fff8df');
  }else if(kind==='priority'){
   polygon([{x:0,y:-9},{x:9,y:0},{x:0,y:9},{x:-9,y:0}],'#f7efdc','#343c2d');polygon([{x:0,y:-6},{x:6,y:0},{x:0,y:6},{x:-6,y:0}],'#e7bd4c');
  }else if(kind.startsWith('limit')){
   ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fillStyle='#d64239';ctx.fill();ctx.beginPath();ctx.arc(0,0,5.8,0,Math.PI*2);ctx.fillStyle='#fff8e7';ctx.fill();ctx.fillStyle='#242d28';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText(kind.slice(5),0,2.5);
  }else if(kind==='noStopping'||kind==='noParking'){
   ctx.beginPath();ctx.arc(0,-1,8,0,Math.PI*2);ctx.fillStyle='#2e6fa0';ctx.fill();ctx.lineWidth=1.8;ctx.strokeStyle='#d7443c';ctx.stroke();
   ctx.beginPath();ctx.moveTo(-5,-6);ctx.lineTo(5,4);if(kind==='noStopping'){ctx.moveTo(5,-6);ctx.lineTo(-5,4);}ctx.strokeStyle='#d7443c';ctx.lineWidth=2.5;ctx.stroke();
  }else if(kind==='busStop'){
   rect(-8,-9,16,16,'#286fa4');rect(-6,-7,12,12,'#f6f0d9');rect(-4,-4,8,4,'#286fa4');rect(-3,-3,2,2,'#f6f0d9');rect(1,-3,2,2,'#f6f0d9');rect(-5,1,10,2,'#286fa4');
  }else{
   rect(-8,-8,16,16,'#e4e8d7');rect(-6,-6,12,12,'#347ba1');ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 12px monospace';ctx.fillText(kind==='parking'?'P':kind==='roundabout'?'↺':'△',0,4);if(kind==='crossing'){rect(-4,3,8,1,'#fff');rect(-1,-2,2,4,'#fff');}
  }
  ctx.restore();
 }
 function landmark(l,s){
  const p=project(l.x,l.z);
  if(l.kind==='pickup'){
   disk(l.x,l.z,.65,'#245f9b');disk(l.x,l.z,.45,'#e7f1da');disk(l.x,l.z-.15,.12,'#e2aa76');rect(p.x-1.3,p.y-.1,2.6,4,'#347ba1');rect(p.x-2,p.y+2,1.5,2,'#243843');rect(p.x+.5,p.y+2,1.5,2,'#243843');
  }else if(l.kind==='dropoff'){
   disk(l.x,l.z,.8,'#255f92');disk(l.x,l.z,.53,'#e8f0da');rect(p.x-3,p.y-1,6,1.5,'#2773a4');rect(p.x+1,p.y-3,1.5,6,'#2773a4');
  }else if(l.kind==='parking'){
   rect(p.x-5,p.y-5,10,10,'#246da0');rect(p.x-3,p.y-3,6,6,'#f3f0dd');ctx.fillStyle='#286fa4';ctx.font='bold 7px monospace';ctx.textAlign='center';ctx.fillText('P',p.x,p.y+2.5);
  }else if(l.kind==='busStop'){
   rect(p.x-12,p.y-7,24,12,'#29343a');rect(p.x-11,p.y-8,22,3,'#396f8c');rect(p.x-9,p.y-4,7,8,'#7db3b3');rect(p.x+2,p.y-4,7,8,'#7db3b3');rect(p.x-12,p.y+5,24,2,'#40484a');rect(p.x-10,p.y+7,2,3,'#30383b');rect(p.x+8,p.y+7,2,3,'#30383b');rect(p.x+12,p.y-10,5,8,'#286fa4');rect(p.x+13,p.y-8,3,4,'#f5f0dc');
  }
 }
 function car(t,player=false,time=0){
  ctx.save();ctx.translate(t.x*TILE,t.z*TILE);ctx.rotate(t.angle+Math.PI/2);ctx.scale(.6,.6);
  if(player){const g=ctx.createLinearGradient(0,-20,0,-95);g.addColorStop(0,'#ffe6a060');g.addColorStop(1,'#ffe6a000');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-7,-20);ctx.lineTo(-32,-95);ctx.lineTo(32,-95);ctx.lineTo(7,-20);ctx.fill();}
  rect(-11,-18,25,40,'#18231d55');for(const y of [-12,9]){rect(-12,y,4,7,'#171b1c');rect(8,y,4,7,'#171b1c');}
  ctx.fillStyle='#222829';ctx.beginPath();ctx.roundRect(-10,-20,20,40,4);ctx.fill();ctx.fillStyle=t.color||'#d8dedb';ctx.beginPath();ctx.roundRect(-9,-19,18,37,3);ctx.fill();
  rect(-7,-16,14,6,'#ffffff22');rect(-7,-8,14,9,'#304850');rect(-6,-7,12,2,'#9cb0b1');rect(-6,2,12,8,t.color||'#bbc7c1');rect(-7,12,14,4,'#465557');rect(-8,-19,5,2,'#fff6cd');rect(3,-19,5,2,'#fff6cd');rect(-8,17,4,2,'#d14a3b');rect(4,17,4,2,'#d14a3b');
  if(player&&t.indicator&&Math.floor(time*3)%2===0){const side=t.indicator<0?-10:7;rect(side,-16,3,4,'#ffbb39');rect(side,13,3,4,'#ffbb39');}
  ctx.restore();
 }
 function smoothstep(a,b,x){const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);}
 function atmosphere(s,camera,carX,carY){
  if(!weather||s.time<weather.lastTime){weather={lastTime:0,rainEnabled:Math.random()<.34,rainStart:35+Math.random()*45,rainLength:55+Math.random()*55,seed:Math.random()*10000};}
  weather.lastTime=s.time;
  const dusk=smoothstep(0,230,s.time),night=smoothstep(.25,.92,dusk),rain=weather.rainEnabled&&s.time>=weather.rainStart&&s.time<weather.rainStart+weather.rainLength;
  // The neighborhood moves from late afternoon into night over a few minutes.
  if(dusk>.12){ctx.fillStyle=`rgba(26,24,42,${(.08+dusk*.37).toFixed(3)})`;ctx.fillRect(0,0,VW,VH);}
  if(night>.12){
   // Warm pools from street lamps around the intersections.
   ctx.save();ctx.globalCompositeOperation='screen';
   for(const j of W.junctions){
    const dx=(j.x-s.player.x)*TILE,dy=(j.z-s.player.z)*TILE,x=carX+dx*Math.cos(camera)-dy*Math.sin(camera),y=carY+dx*Math.sin(camera)+dy*Math.cos(camera);
    if(x<-50||x>VW+50||y<-50||y>VH+50)continue;
    const glow=ctx.createRadialGradient(x,y,1,x,y,40);glow.addColorStop(0,`rgba(255,194,105,${(.2*night).toFixed(3)})`);glow.addColorStop(1,'rgba(255,169,82,0)');ctx.fillStyle=glow;ctx.fillRect(x-40,y-40,80,80);
   }
   // Headlights stay visible as the scene darkens.
   const beam=ctx.createRadialGradient(carX,carY-22,2,carX,carY-86,92);beam.addColorStop(0,`rgba(255,244,197,${(.42*night).toFixed(3)})`);beam.addColorStop(.45,`rgba(255,224,157,${(.22*night).toFixed(3)})`);beam.addColorStop(1,'rgba(255,207,133,0)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(carX-5,carY-16);ctx.lineTo(carX-57,carY-118);ctx.lineTo(carX+57,carY-118);ctx.lineTo(carX+5,carY-16);ctx.closePath();ctx.fill();
   ctx.restore();
  }
  if(rain){
   // A few runs are rainy; each run gets its own brief shower.
   ctx.save();ctx.lineWidth=.8;ctx.strokeStyle='rgba(190,215,231,.52)';
   const count=90,offset=s.time*145+weather.seed;
   for(let i=0;i<count;i++){const x=(i*83+weather.seed*13)%VW,y=(i*47+offset)%VH,len=4+(i%4)*1.4;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-2,y+len);ctx.stroke();}
   ctx.fillStyle='rgba(30,48,67,.10)';ctx.fillRect(0,0,VW,VH);ctx.restore();
  }
 }
 function draw(canvas,s,dt=0){
  const c=canvas.getContext('2d');ctx=c;const ratio=2;if(canvas.width!==VW*ratio){canvas.width=VW*ratio;canvas.height=VH*ratio;}ctx.setTransform(ratio,0,0,ratio,0,0);ctx.imageSmoothingEnabled=false;
  rect(0,0,VW,VH,'#718b47');
  // Keep the car near the bottom of the view and rotate the world around it,
  // so the road ahead always points toward the top of the screen.
  const targetAngle=-Math.PI/2-s.player.angle;
  if(cameraAngle===null)cameraAngle=targetAngle;
  const turn=((targetAngle-cameraAngle+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;
  cameraAngle+=turn*(1-Math.exp(-9*Math.max(0,dt)));
  const carX=VW/2,carY=VH*.71;
  ctx.save();ctx.translate(carX,carY);ctx.rotate(cameraAngle);ctx.translate(-s.player.x*TILE,-s.player.z*TILE);ctx.drawImage(cache,0,0);
  const visible=t=>Math.hypot(t.x-s.player.x,t.z-s.player.z)<Math.hypot(VW,VH)/(2*TILE)+2;
  for(const q of W.signs)if(visible(q))sign(q.kind,q.x,q.z);
  for(const l of W.landmarks)if(visible(l))landmark(l,s);
  const targetId={pickup:'pickup',dropoff:'dropoff',park:'parking'}[s.mission?.phase],target= W.landmarks.find(l=>l.id===targetId);
  if(target&&visible(target)){ctx.beginPath();ctx.arc(target.x*TILE,target.z*TILE,1.12*TILE,0,Math.PI*2);ctx.strokeStyle='#f2d45d';ctx.lineWidth=2;ctx.stroke();}
  for(const j of W.junctions)if(j.type==='signal'&&visible(j))for(let d=0;d<4;d++)if(W.neighbor(j,(d+2)%4)){
   const v=W.V[d],r=W.right(d),p=project(j.x-v.x*2.6+r.x*1.95,j.z-v.z*2.6+r.z*1.95),light=W.light(j,d,s.time);
   rect(p.x-3,p.y-12,6,16,'#18241e');for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(p.x,p.y-9+k*4.5,1.6,0,Math.PI*2);ctx.fillStyle=['red','yellow','green'][k]===light?['#ff4b38','#ffd15a','#8acc57'][k]:'#414c3e';ctx.fill();}rect(p.x-1,p.y+4,2,7,'#222d25');
  }
  for(const p of s.pedestrians)if(visible(p)){const q=project(p.x,p.z);rect(q.x+1,q.y+1,5,6,'#17271e44');rect(q.x-2,q.y-2,4,5,p.color);rect(q.x-1.5,q.y-5,3,3,'#dbb28b');rect(q.x-2,q.y+3,1,3,'#25313b');rect(q.x+1,q.y+3,1,3,'#25313b');}
  for(const t of s.traffic)if(visible(t))car(t);
  car(s.player,true,s.time);
  ctx.restore();
  atmosphere(s,cameraAngle,carX,carY);
  // Compact map: every road, roundabout, traffic light, and current heading.
  const mx=VW-104,my=VH-103,size=94,scale=size/W.SIZE;rect(mx-5,my-5,size+10,size+10,'#17251ddd');ctx.strokeStyle='#7d8b77';ctx.lineWidth=1;
  for(const a of W.AXES){ctx.beginPath();ctx.moveTo(mx+8*scale,my+a*scale);ctx.lineTo(mx+104*scale,my+a*scale);ctx.moveTo(mx+a*scale,my+8*scale);ctx.lineTo(mx+a*scale,my+104*scale);ctx.stroke();}
  for(const j of W.roundabouts){ctx.beginPath();ctx.arc(mx+j.x*scale,my+j.z*scale,3,0,Math.PI*2);ctx.strokeStyle='#c5db89';ctx.stroke();}
  for(const j of W.junctions)if(j.type==='signal')rect(mx+j.x*scale-1,my+j.z*scale-1,2,2,'#d7ad63');
  for(const l of W.landmarks){
   const x=mx+l.x*scale,y=my+l.z*scale;
   if(l.kind==='pickup'){rect(x-2,y-2,4,4,'#70c7ee');rect(x-.7,y-2.8,1.4,1.4,'#f1e6c9');}
   else if(l.kind==='dropoff'){rect(x-2,y-2,4,4,'#7ad4dd');rect(x-1,y-1,2,2,'#eff2d8');}
   else if(l.kind==='parking'){rect(x-2,y-2,4,4,'#90c46d');ctx.fillStyle='#233425';ctx.font='bold 4px monospace';ctx.textAlign='center';ctx.fillText('P',x,y+1.5);}
   else{rect(x-2,y-2,4,4,'#438dc2');ctx.fillStyle='#fff';ctx.font='bold 3.5px monospace';ctx.textAlign='center';ctx.fillText('B',x,y+1.3);}
  }
  if(target){ctx.beginPath();ctx.arc(mx+target.x*scale,my+target.z*scale,4,0,Math.PI*2);ctx.strokeStyle='#f2d45d';ctx.lineWidth=1.5;ctx.stroke();}
  ctx.save();ctx.translate(mx+s.player.x*scale,my+s.player.z*scale);ctx.rotate(s.player.angle);polygon([{x:4,y:0},{x:-3,y:-3},{x:-1,y:0},{x:-3,y:3}],'#f1f7ce');ctx.restore();
 }
 window.DriveRender={draw,sign};
})();
