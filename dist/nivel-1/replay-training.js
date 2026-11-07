/* Pixel Drive v40 - real gameplay frames + mandatory remedial driving.
   Screenshots are captured from the actual game WebGL/2D canvas after each render.
   Demo is a separately labelled educational schematic, not a fictional recording.
   Educational simulation: simplifications are not official exam scoring. */
(()=>{
 'use strict';
 const W=window.DriveWorld;
 const explanations={
  right:{title:'NU AI ACORDAT PRIORITATE DE DREAPTA',why:'Ai intrat într-o intersecție nedirijată când se apropia un vehicul din dreapta.',how:'Redu viteza înaintea intersecției. Asigură-te în dreapta, lasă vehiculul să treacă, apoi traversează numai când este sigur.',law:'OUG 195/2002, art. 57 alin. (1)'},
  stop:{title:'NU AI OPRIT COMPLET LA STOP',why:'Ai trecut de linia STOP fără o oprire completă.',how:'Oprește complet înainte de linia de oprire, asigură-te și acordă prioritate. Abia după aceea pornește.',law:'HG 1391/2006, art. 129'},
  red:{title:'AI TRECUT PE ROȘU',why:'Ai pătruns în intersecție când semaforul arăta roșu.',how:'Oprește înaintea liniei și așteaptă verdele. Chiar și pe verde, verifică dacă intersecția este liberă.',law:'HG 1391/2006, art. 52'},
  yield:{title:'NU AI CEDAT TRECEREA',why:'Ai intrat în fața vehiculelor de pe drumul prioritar.',how:'Încetinește, urmărește traficul transversal și oprește dacă este nevoie. Intră doar după ce ai acordat prioritate.',law:'OUG 195/2002, art. 57'},
  round:{title:'NU AI ACORDAT PRIORITATE ÎN GIRATORIU',why:'Ai intrat în sensul giratoriu în fața unui vehicul care circula deja în interior.',how:'Apropie-te încet, lasă să treacă vehiculele din giratoriu, apoi intră într-un spațiu sigur.',law:'OUG 195/2002, art. 57 alin. (4)'},
  speed:{title:'AI DEPĂȘIT LIMITA DE VITEZĂ',why:'Ai circulat peste limita indicată în zona respectivă.',how:'Eliberează accelerația, frânează progresiv și păstrează o viteză sub limita afișată.',law:'OUG 195/2002, art. 48–49'},
  collision:{title:'AI PROVOCAT O COLIZIUNE',why:'Ai atins un vehicul sau un obstacol din traseu.',how:'Redu viteza, păstrează distanța de siguranță și verifică spațiul liber înainte de manevră.',law:'OUG 195/2002, art. 48 și 51'}
 };
 const dialog=document.createElement('dialog'); dialog.id='driving-replay';dialog.className='driving-replay';
 dialog.setAttribute('aria-label','Replay abatere rutieră și exemplu corect');
 dialog.innerHTML=`
  <div class="dr-replay-head"><div><span class="dr-replay-eyebrow">PIXEL DRIVE / ȘCOALA DE CONDUS</span><h2 id="dr-title">Situație de corectat</h2></div><span class="dr-alert">REPLAY ABATERE</span></div>
  <div class="dr-replay-layout">
    <div class="dr-media"><div class="dr-video-label" id="dr-video-label">VIDEO · ULTIMELE SECUNDE DIN JOC</div>
      <canvas id="dr-canvas" width="720" height="405" aria-label="Replay cu cadre din joc"></canvas>
      <div class="dr-media-controls"><button id="dr-watch" type="button">↺ Vezi replay-ul</button><button id="dr-example" type="button">▶ Exemplul corect</button><span id="dr-progress">REPLAY</span></div>
      <div id="dr-speed-summary" class="dr-speed-summary">VITEZA LA ABATERE · -- KM/H</div>
      <p class="dr-media-caption" id="dr-media-caption">Cadre capturate din sesiunea ta de condus, nu o animație inventată.</p>
    </div>
    <div class="dr-explainer"><p class="dr-wrong">CE AI GREȘIT</p><p id="dr-why"></p><p class="dr-correct">CUM TREBUIE SĂ PROCEDEZI</p><p id="dr-how"></p>
      <a id="dr-law" href="https://legislatie.just.ro/Public/DetaliiDocument/74028" target="_blank" rel="noopener noreferrer">Vezi baza legală ↗</a>
      <div class="dr-reminder"><strong>EXERCIȚIU OBLIGATORIU</strong><span>Te întorci înainte de greșeală și trebuie să execuți corect manevra ca să continui traseul.</span></div>
      <button id="dr-retry" type="button">AM ÎNȚELES · REPETĂ REGULAMENTAR →</button>
    </div>
  </div>`;
 document.body.appendChild(dialog);
 dialog.addEventListener('cancel',e=>e.preventDefault());
 const display=dialog.querySelector('#dr-canvas'),g=display.getContext('2d');
 const $=id=>dialog.querySelector('#'+id);
 let state=null,frames=[],lastCapture=-1000,event=null,checkpoint=null,clip=[],clipStart=0,mode='replay',runId=0;
 const CAPTURE_EVERY=205,KEEP_MS=9000,CLIP_MS=6500;
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const clone=x=>JSON.parse(JSON.stringify(x));
 function capture(s,canvas,now,force=false,overrideKmh=null){
  if(!force&&now-lastCapture<CAPTURE_EVERY)return;
  lastCapture=now;
  const kmh=overrideKmh??Math.round(Math.abs(s.player.speed)*21.6);
  const limit=s.limit||50,over=kmh>limit+2;
  let image=null;
  try{
   const small=document.createElement('canvas'); small.width=720;small.height=405;
   const cg=small.getContext('2d',{alpha:false});
   cg.drawImage(canvas,0,0,720,405);
   // This overlay is burned into EVERY captured frame for later inspection.
   cg.fillStyle='rgba(10,22,19,.91)';cg.fillRect(13,12,320,58);
   cg.strokeStyle=over?'#ef695e':'#a6c59b';cg.lineWidth=2;cg.strokeRect(13,12,320,58);
   cg.textAlign='left';cg.font='bold 28px monospace';cg.fillStyle=over?'#ffad9c':'#f6f9eb';
   cg.fillText(`${kmh} KM/H`,25,51);
   cg.font='bold 15px monospace';cg.fillStyle='#d5e1d0';cg.fillText(`LIMITĂ ${limit}`,194,49);
   cg.font='bold 13px monospace';cg.fillStyle='#e2e9ce';
   cg.fillText(s.player.indicator<0?'◀ SEMNAL STÂNGA':s.player.indicator>0?'SEMNAL DREAPTA ▶':'FĂRĂ SEMNAL',25,90);
   image=small.toDataURL('image/webp',.66);
  }catch(e){if(!frames.length)console.warn('[Replay] Captură indisponibilă:',e);}
  frames.push({at:now,simTime:s.time,image,kmh,limit,player:{...s.player},traffic:clone(s.traffic),
    pedestrians:clone(s.pedestrians)});
  while(frames.length&&now-frames[0].at>KEEP_MS)frames.shift();
 }
 function selectCheckpoint(s,report){
  const j=W.junctions.find(q=>q.id===report.junctionId);
  if(j&&report.direction!==null){
   const d=report.direction,v=W.V[d],line=report.kind==='round'?4.35:2.55;
   const candidates=frames.filter(f=>{
    const p=f.player,along=(j.x-p.x)*v.x+(j.z-p.z)*v.z;
    const lateral=Math.abs((j.x-p.x)*v.z-(j.z-p.z)*v.x);
    return along>line+1.6&&along<line+8&&lateral<1.5;
   });
   // Take a sample 2-4s before crossing, far enough to allow braking.
   if(candidates.length){
    const target=(frames.at(-1)?.at||0)-2700;
    return candidates.reduce((a,b)=>Math.abs(b.at-target)<Math.abs(a.at-target)?b:a);
   }
  }
  return frames.find(f=>f.at>=(frames.at(-1)?.at||0)-3000)||frames[0]||null;
 }
 function drawUnavailable(){
  g.fillStyle='#101e18';g.fillRect(0,0,720,405);g.fillStyle='#f4eed7';g.textAlign='center';
  g.font='bold 25px sans-serif';g.fillText('Momentul abaterii',360,182);
  g.font='17px sans-serif';g.fillText('Nu există suficiente cadre înregistrate pentru replay.',360,216);
 }
 function drawRecording(frame){
  if(frame?.picture?.complete&&frame.picture.naturalWidth){g.drawImage(frame.picture,0,0,720,405);return;}
  drawUnavailable();
 }
 function drawExample(t,kind){
  g.textAlign='left';
  // A genuine instructional animation drawn from traffic geometry (not a recording).
  g.fillStyle='#4f724d';g.fillRect(0,0,720,405);
  g.fillStyle='#303b42';g.fillRect(285,0,150,405);g.fillRect(0,133,720,136);
  g.strokeStyle='#f7e9ca';g.lineWidth=3;g.setLineDash([12,13]);
  g.beginPath();g.moveTo(360,0);g.lineTo(360,112);g.moveTo(360,290);g.lineTo(360,405);g.stroke();
  g.beginPath();g.moveTo(0,201);g.lineTo(274,201);g.moveTo(445,201);g.lineTo(720,201);g.stroke();g.setLineDash([]);
  g.strokeStyle='#e2e5d4';g.lineWidth=5;g.beginPath();g.moveTo(287,286);g.lineTo(352,286);g.stroke();
  const go=t>0.63?clamp((t-.63)/.35):0;
  const playerY=t<.20?337-51*(t/.20):t<.63?286:286-245*go;
  const otherX=kind==='collision'?360:600-540*clamp(t/.70);
  if(['right','yield','round','collision'].includes(kind)){
   g.fillStyle='#6ecbe8';g.fillRect(otherX-24,170,48,32);
   g.fillStyle='#edfff6';g.font='bold 12px sans-serif';g.fillText('PRIORITATE',otherX-30,161);
  }
  if(kind==='stop'){
   g.fillStyle='#b93232';g.fillRect(448,280,61,33);g.fillStyle='white';g.font='bold 16px sans-serif';g.fillText('STOP',453,302);
  }
  if(kind==='red'){
   g.fillStyle='#17221b';g.fillRect(470,277,45,94);
   g.fillStyle=t<.61?'#e23c3a':'#3f5946';g.beginPath();g.arc(492,292,9,0,Math.PI*2);g.fill();
   g.fillStyle=t>=.61?'#44d269':'#3f5946';g.beginPath();g.arc(492,350,9,0,Math.PI*2);g.fill();
  }
  g.fillStyle='#f4c64d';g.fillRect(355,playerY-28,32,56);
  if(kind==='speed'){g.fillStyle='#fff3da';g.font='bold 15px sans-serif';g.fillText(t<.45?'VITEZĂ: 65 KM/H':'VITEZĂ: 40 KM/H',460,95);g.beginPath();g.arc(570,136,33,0,Math.PI*2);g.fillStyle='#fff9e9';g.fill();g.lineWidth=7;g.strokeStyle='#e84b40';g.stroke();g.fillStyle='#1e2c25';g.fillText('50',560,142);}
  g.fillStyle='#fdf5d9';g.font='bold 17px sans-serif';
  const title=kind==='red'?'AȘTEAPTĂ VERDELE':kind==='stop'?'OPREȘTE COMPLET':kind==='speed'?'REDU VITEZA':kind==='collision'?'PĂSTREAZĂ DISTANȚA': 'CEDEAZĂ · AȘTEAPTĂ · TRECI';
  g.fillText(title,18,34);
  g.font='15px sans-serif';g.fillText(t<.63?'Pasul 1: redu viteza și acordă prioritate':'Pasul 2: înaintează când este sigur',18,63);
  g.fillStyle='#111e18';g.fillRect(0,382,720,23);g.fillStyle='#e9f6d9';
  g.font='13px sans-serif';g.fillText('DEMONSTRAȚIE ANIMATĂ · manevra corectă (nu filmare din joc)',15,399);
 }
 function play(kind){
  mode=kind;clipStart=performance.now();runId++;
  $('dr-video-label').textContent=kind==='demo'?'EXEMPLU CORECT · ANIMAȚIE DIDACTICĂ':'VIDEO REPLAY · CAPTURĂ DIN JOC';
  $('dr-media-caption').textContent=kind==='demo'?'Manevră demonstrativă: vehiculul galben așteaptă și trece numai după ce e sigur.':'Cadre reale ale jocului capturate înaintea abaterii.';
  const id=runId;
  function loop(now){
   if(!dialog.open||runId!==id)return;
   const elapsed=now-clipStart;
   if(kind==='demo'){
    const duration=8200;
    drawExample(clamp(elapsed/duration),event?.kind||'right');
    $('dr-progress').textContent=`EXEMPLU · ${Math.min(100,Math.round(elapsed/duration*100))}%`;
    if(elapsed<duration)requestAnimationFrame(loop);else $('dr-progress').textContent='EXEMPLU ÎNCHEIAT';
   }else{
    if(!clip.length){drawUnavailable();$('dr-progress').textContent='FĂRĂ CAPTURĂ';return;}
    const index=Math.min(clip.length-1,Math.floor(elapsed/(1000/5)));
    drawRecording(clip[index]);
    $('dr-progress').textContent=`REPLAY · ${Math.min(clip.length,1+index)}/${clip.length}`;
    if(index<clip.length-1)requestAnimationFrame(loop);else {
     $('dr-progress').textContent='REPLAY ÎNCHEIAT · EXEMPLU CORECT';
     setTimeout(()=>{if(dialog.open&&runId===id)play('demo');},650);
    }
   }
  }
  requestAnimationFrame(loop);
 }
 function interrupt(s,report){
  if(dialog.open||!explanations[report.kind])return;
  event=report;state=s;checkpoint=selectCheckpoint(s,report);
  const now=frames.at(-1)?.at||performance.now();
  clip=frames.filter(f=>f.at>=now-CLIP_MS).map(f=>{
   const picture=new Image(); if(f.image)picture.src=f.image;
   return {picture,kmh:f.kmh,limit:f.limit};
  });
  s.paused=true;s.player.speed=0;
  const info=explanations[report.kind];
  $('dr-title').textContent=info.title;
  const recorded=Math.round(report.speedKmh??Math.abs(report.player?.speed||0)*21.6);
  const max=report.limit||s.limit||50;
  $('dr-speed-summary').textContent=`VITEZA LA ABATERE · ${recorded} KM/H · LIMITĂ ${max} KM/H`;
  $('dr-speed-summary').classList.toggle('overspeed',recorded>max+2);
  $('dr-why').textContent=info.why+(report.kind==='speed'?` Viteza înregistrată: ${recorded} km/h. Limita: ${max} km/h.`:'');
  $('dr-how').textContent=info.how;
  $('dr-law').textContent=info.law+' ↗';$('dr-law').href='https://legislatie.just.ro/Public/DetaliiDocument/74028';
  dialog.showModal();
  play('replay');
 }
 function restartCorrectly(){
  if(!state||!event)return;
  const s=state,e=event,j=W.junctions.find(q=>q.id===e.junctionId);
  const snap=checkpoint;
  if(snap){
   s.time=snap.simTime;
   s.player={...snap.player,speed:0,indicator:0};
   s.traffic=clone(snap.traffic);s.pedestrians=clone(snap.pedestrians);
  }else{s.player={...e.player,speed:0,indicator:0};}
  if(j&&e.direction!==null){
   const v=W.V[e.direction],right=W.right(e.direction),line=e.kind==='round'?4.35:2.55;
   const along=(j.x-s.player.x)*v.x+(j.z-s.player.z)*v.z;
   if(along<line+2||along>line+8){
    s.player.x=j.x-v.x*(line+3.9)+right.x*W.LANE;
    s.player.z=j.z-v.z*(line+3.9)+right.z*W.LANE;
   }
   s.player.angle=Math.atan2(v.z,v.x);
   // Preserve a right-side vehicle for a teachable repeat if no one is there.
   if(e.kind==='right'&&!s.traffic.some(t=>t.d===(e.direction+3)%4&&
      Math.hypot(t.x-j.x,t.z-j.z)<8)){
    const incoming=(e.direction+3)%4,iv=W.V[incoming],ir=W.right(incoming);
    s.traffic.push({id:9000+e.id,x:j.x-iv.x*6+ir.x*W.LANE,
      z:j.z-iv.z*6+ir.z*W.LANE,angle:Math.atan2(iv.z,iv.x),d:incoming,j,
      speed:0,cruise:1.4,phase:'approach',stopTime:0,color:'#56a5df',tutorial:true});
   }
  }else if(e.kind==='speed')s.limit=e.limit;
  s.retraining={kind:e.kind,junctionId:e.junctionId,direction:e.direction,
    startDistance:s.distance,collisions:s.collisions};
  delete s.ruleCooldown[e.key];
  s.violationEvent=null;s.paused=false;s.failed=false;
  const failOverlay=document.getElementById('fail');if(failOverlay)failOverlay.hidden=true;
  // A lesson cannot become impossible only because the last penalty reached zero.
  if(s.score===0)s.score=1;
  s.lastPenalty=s.time-4;
  s.message=`↻ EXERCIȚIU: ${explanations[e.kind].how}`;
  s.messageUntil=s.time+120;
  frames=[];lastCapture=-1000;runId++;dialog.close();state=null;event=null;
 }
 $('dr-watch').addEventListener('click',()=>play('replay'));
 $('dr-example').addEventListener('click',()=>play('demo'));
 $('dr-retry').addEventListener('click',restartCorrectly);
 window.DriveReplay={onFrame(s,canvas,now){
   // Preserve the last instant even if a collision has already set speed=0.
   if(s.violationEvent){const report=s.violationEvent;
     if(!dialog.open)capture(s,canvas,now,true,report.speedKmh);
     s.violationEvent=null;interrupt(s,report);return;}
   if(!dialog.open&&!s.paused&&!s.failed)capture(s,canvas,now);
  },open:()=>dialog.open,showExample:()=>play('demo')};
})();
