(() => {
 const Sim=window.DriveSimulation,Rules=window.DriveRules,Render=window.DriveRender,W=window.DriveWorld;
 let state=Sim.create({vary:true}),keys={},last=0,lastUI=0,modalOpen=false,pauseBeforeModal=false,autoPaused=false;const canvas=document.querySelector('#scene');
 const $=id=>document.getElementById(id);
 window.DriveTimedQuiz?.register(state);
 const symbols={drive:'↑',stop:'STOP',yield:'▽',priority:'◆',roundabout:'↺',crossing:'🚶',red:'●',yellow:'●',green:'●',right:'→',limit30:'30',limit50:'50',parking:'P',noStopping:'×',noParking:'P̸',busStop:'BUS',pickup:'↗',dropoff:'●'};
 const examples={
  stop:'Exemplu: oprește înainte de marcaj, asigură-te, apoi pornește când drumul e liber.',
  yield:'Exemplu: încetinește. Oprește doar dacă vine cineva care are prioritate.',
  parking:'Ține minte: până la 5 minute = oprire; peste 5 minute = staționare. Parcarea se face în locuri amenajate sau semnalizate.',
  noStopping:'Oprirea este interzisă și pentru scurt timp. Nu folosi zona pentru preluare sau lăsare de pasageri.',
  noParking:'Indicatorul interzice staționarea. Oprirea de cel mult 5 minute poate fi permisă numai dacă nu există altă interdicție.',
  busStop:'Caută un loc de preluare în afara stației și la cel puțin 25 m de ea.',
  pickup:'Obiectiv: oprește complet în refugiul albastru și apasă I.',
  dropoff:'Obiectiv: oprește în zona albastră, verifică împrejurimile și apasă I.'
 };
 function reset(){autoPaused=false;state=Sim.create({vary:true});window.DriveTimedQuiz?.register(state);keys={};last=0;modalOpen=false;$('lesson-modal').hidden=true;$('fail').hidden=true;document.body.classList.remove('paused');$('pause').textContent='Pauză';ui();}
 function pause(){autoPaused=false;if(state.failed||modalOpen)return;state.paused=!state.paused;keys={};document.body.classList.toggle('paused',state.paused);$('pause').textContent=state.paused?'Continuă':'Pauză';ui();}
 function signal(dir){state.player.indicator=state.player.indicator===dir?0:dir;ui();}
 function nearestSign(){return W.signs.map(sign=>({sign,distance:Math.hypot(sign.x-state.player.x,sign.z-state.player.z)})).filter(item=>item.distance<4.5).sort((a,b)=>a.distance-b.distance)[0]||null;}
 function nearestLandmark(){return W.landmarks.map(landmark=>({landmark,distance:Math.hypot(landmark.x-state.player.x,landmark.z-state.player.z)})).filter(item=>item.distance<4.5).sort((a,b)=>a.distance-b.distance)[0]||null;}
 function signGraphic(kind){
  if(window.DriveSignImages?.[kind])return `<img src="${DriveSignImages[kind]}" alt="${Rules.topics[kind]?.title||'Indicator'}" style="width:90%;height:90%;object-fit:contain">`; 
  const pole='<path d="M80 105v40" stroke="#343b36" stroke-width="8" stroke-linecap="square"/>';
  const shapes={
   stop:'<polygon points="58,22 102,22 125,45 125,83 102,106 58,106 35,83 35,45" fill="#fff9e8" stroke="#252c27" stroke-width="5"/><polygon points="61,29 99,29 118,48 118,80 99,99 61,99 42,80 42,48" fill="#c83e36"/><text x="80" y="72" text-anchor="middle" fill="white" font-size="19" font-family="monospace" font-weight="bold">STOP</text>',
   yield:'<polygon points="35,34 125,34 80,106" fill="#fff9e8" stroke="#c83e36" stroke-width="8" stroke-linejoin="round"/>',
   priority:'<polygon points="80,20 132,72 80,124 28,72" fill="#fff9e8" stroke="#252c27" stroke-width="5"/><polygon points="80,34 118,72 80,110 42,72" fill="#e4bd47"/>',
   roundabout:'<circle cx="80" cy="65" r="48" fill="#2873a5"/><path d="M62 44a27 27 0 0 1 44 6l8-8v25H89l9-8a18 18 0 0 0-29-4m29 38a27 27 0 0 1-44-6l-8 8V78h25l-9 8a18 18 0 0 0 29 4" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"/>',
   crossing:'<rect x="32" y="20" width="96" height="96" rx="3" fill="#2873a5"/><circle cx="80" cy="43" r="8" fill="#fff"/><path d="M80 53v28m0-18-17 14m17-14 17 7M80 81 67 101m13-20 15 20" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="square"/><path d="M42 106h76" stroke="#fff" stroke-width="5" stroke-dasharray="9 7"/>',
   parking:'<rect x="32" y="20" width="96" height="96" rx="4" fill="#2873a5"/><path d="M65 100V36h22c18 0 28 10 28 26s-10 26-28 26H65m0-26h21c7 0 11-4 11-10s-4-10-11-10H65" fill="none" stroke="#fff" stroke-width="8"/>',
   noParking:'<circle cx="80" cy="64" r="43" fill="#2873a5" stroke="#d9433b" stroke-width="9"/><path d="M49 91 111 37" stroke="#d9433b" stroke-width="10"/>',
   noStopping:'<circle cx="80" cy="64" r="43" fill="#2873a5" stroke="#d9433b" stroke-width="9"/><path d="m51 35 58 58M109 35 51 93" stroke="#d9433b" stroke-width="10"/>',
   busStop:'<rect x="32" y="20" width="96" height="96" rx="4" fill="#2873a5"/><rect x="50" y="39" width="60" height="41" rx="8" fill="none" stroke="#fff" stroke-width="7"/><path d="M56 55h48m-38 26-8 12m38-12 8 12" stroke="#fff" stroke-width="7"/><circle cx="62" cy="71" r="5" fill="#fff"/><circle cx="98" cy="71" r="5" fill="#fff"/>',
   limit30:'<circle cx="80" cy="64" r="46" fill="#fff9e8" stroke="#c83e36" stroke-width="10"/><text x="80" y="76" text-anchor="middle" fill="#27332c" font-size="34" font-family="monospace" font-weight="bold">30</text>',
   limit50:'<circle cx="80" cy="64" r="46" fill="#fff9e8" stroke="#c83e36" stroke-width="10"/><text x="80" y="76" text-anchor="middle" fill="#27332c" font-size="34" font-family="monospace" font-weight="bold">50</text>'
  };
  return `<svg viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">${shapes[kind]||shapes.priority}${pole}</svg>`;
 }
 function openLesson(kind){
  const topic=Rules.topics[kind]||Rules.topics.drive;
  $('lesson-art').innerHTML=signGraphic(kind);$('lesson-title').textContent=topic.title;$('lesson-text').textContent=topic.text;$('lesson-example').textContent=examples[kind]||'Uită-te la semn înainte să continui și urmează indicația lui.';$('lesson-source').textContent=topic.source+' ↗';$('lesson-source').href=topic.url;if(!$('sign-credits')){const a=document.createElement('a');a.id='sign-credits';a.href='sign-assets/credits.html';a.target='_blank';a.rel='noopener';a.textContent='Surse imagini indicatoare';a.style='display:block;font-size:12px;margin-top:8px';$('lesson-source').after(a);}
  state.learned.add(kind);state.studied?.add(kind);pauseBeforeModal=state.paused;state.paused=true;keys={};modalOpen=true;$('lesson-modal').hidden=false;$('pause').textContent='Continuă';document.body.classList.add('paused');ui();$('lesson-done').focus();
 }
 function closeLesson(){if(!modalOpen)return;modalOpen=false;$('lesson-modal').hidden=true;state.paused=pauseBeforeModal;document.body.classList.toggle('paused',state.paused);$('pause').textContent=state.paused?'Continuă':'Pauză';ui();}
 function interact(){
  const result=Sim.interact(state);if(result){if(result.type==='need-stop')ui();else ui();return;}
  const sign=nearestSign();if(sign){openLesson(sign.sign.kind);return;}
  const landmark=nearestLandmark();if(landmark){openLesson(landmark.landmark.kind==='busStop'?'busStop':landmark.landmark.kind);return;}
  state.message='Apropie-te de un indicator sau de obiectivul marcat, apoi apasă I.';state.messageUntil=state.time+3;ui();
 }
 function ui(){const c=Rules.context(state),p=state.player,o=Sim.objective(state),sign=nearestSign(),landmark=nearestLandmark();
  $('score').textContent=state.score+' PUNCTE';$('damage').textContent=state.collisions+' / 4 COLIZIUNI';$('speed').textContent=Math.round(Math.abs(p.speed)*21.6)+' KM/H';$('limit').textContent='LIMITĂ '+state.limit;
  $('rule-title').textContent=c.title;$('rule-text').textContent=c.text;$('rule-source').textContent=c.source+' ↗';$('rule-source').href=c.url;
  $('rule-distance').textContent=sign?'SEMN APROAPE · APASĂ I':c.distance===null?'ÎN FAȚĂ':c.distance<.5?'ACUM · ÎN ZONĂ':'ÎN FAȚĂ · '+Math.round(c.distance*6)+' M';
  $('indicator').textContent=p.indicator<0?'◀ SEMNAL STÂNGA':p.indicator>0?'SEMNAL DREAPTA ▶':'SEMNAL OPRIT';$('rule-symbol').textContent=symbols[c.key]||'↑';$('rule-symbol').dataset.kind=c.key;
  $('objective-title').textContent=o.title;$('objective-text').textContent=o.text;$('objective-distance').textContent=o.distance===null?'GATA':Math.round(o.distance*6)+' M';
  const atGoal=o.target&&o.distance<=2.25,stopped=Math.abs(p.speed)<=.04;
  $('learn').textContent=o.service?'I · ȘCOALA AUTO':atGoal?(stopped?'I · INTERACȚIONEAZĂ':'OPREȘTE · I'):sign?'I · ÎNVAȚĂ SEMNUL':landmark?'I · VEZI LOCUL':'I · ÎNVAȚĂ';
  $('learn').setAttribute('aria-label',atGoal?'Oprește și apasă I pentru obiectiv':sign?'Apasă I pentru a învăța indicatorul':landmark?'Apasă I pentru explicația locului':'Apropie-te de un indicator sau de obiectiv');
  $('journey').textContent=Math.round(state.distance*6)+' m · '+state.learned.size+' situații descoperite · '+state.passed.size+' intrări în intersecții';
  const message=state.paused?'PAUZĂ · Apasă Continuă sau P pentru a conduce.':state.time<state.messageUntil?state.message:(o.service||o.lesson)?o.text:sign?'Aproape de un indicator. Apasă I pentru explicație.':landmark?landmark.landmark.name+' · Apasă I pentru explicație.':o.target?o.text:'Apropie-te de un indicator și apasă I.';
  $('toast').textContent=window.DriveCareer?.fuel()<=0?'REZERVOR GOL · Apasă butonul de ajutor pentru combustibil.':autoPaused?'Joc întrerupt · Apasă W sau click pe joc pentru a continua.':message;$('toast').classList.toggle('penalty',message.startsWith('−'));
  if(state.failed){$('fail').hidden=false;$('fail-reason').textContent=state.message;keys={};}
 }
 function resumeFocusPause(){if(autoPaused&&!modalOpen&&!document.querySelector('dialog[open]')){autoPaused=false;state.paused=false;document.body.classList.remove('paused');$('pause').textContent='Pauză';last=0;ui();}}
 canvas.tabIndex=0;canvas.addEventListener('pointerdown',()=>{canvas.focus();resumeFocusPause();});
 const key=e=>({KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',KeyQ:'q',KeyE:'e',KeyP:'p',KeyI:'i',Space:'space',ArrowUp:'w',ArrowDown:'s',ArrowLeft:'a',ArrowRight:'d'})[e.code]||(e.key||'').toLowerCase();
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalOpen){e.preventDefault();closeLesson();return;}if(modalOpen||document.querySelector('dialog[open]'))return;if(e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;if(e.target.closest?.('button,a,summary')&&(e.code==='Space'||e.code==='Enter'))return;const k=key(e);if(['w','a','s','d'].includes(k))resumeFocusPause();if(['w','a','s','d','q','e','p','space','i'].includes(k))e.preventDefault();if(k==='i'){if(!e.repeat)interact();return;}if(!e.repeat){if(k==='q')signal(-1);if(k==='e')signal(1);if(k==='p')pause();}keys[k]=true;});
 window.addEventListener('keyup',e=>keys[key(e)]=false);
 window.addEventListener('blur',()=>{keys={};if(!modalOpen&&!state.paused&&!state.failed){pause();autoPaused=true;}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){keys={};if(!state.paused&&!state.failed){pause();autoPaused=true;}}});
 document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;b.addEventListener('pointerdown',e=>{e.preventDefault();resumeFocusPause();keys[k]=true;b.setPointerCapture(e.pointerId);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>keys[k]=false);});
 document.querySelectorAll('[data-indicator]').forEach(b=>b.addEventListener('click',()=>signal(Number(b.dataset.indicator))));
 $('learn').addEventListener('click',interact);$('lesson-close').addEventListener('click',closeLesson);$('lesson-done').addEventListener('click',closeLesson);$('lesson-modal').addEventListener('click',e=>{if(e.target===$('lesson-modal'))closeLesson();});
 $('pause').addEventListener('click',pause);$('restart').addEventListener('click',reset);$('restart-fail').addEventListener('click',reset);
 function frame(now){const dt=last?Math.min((now-last)/1000,.05):0;last=now;Sim.update(state,keys,dt);Render.draw(canvas,state,dt);if(now-lastUI>100||state.failed){ui();lastUI=now;}requestAnimationFrame(frame);}
 ui();requestAnimationFrame(frame);
})();
