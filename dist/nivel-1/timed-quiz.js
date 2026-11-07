/* Pixel Drive quiz v38 — 60 seconds in all modes, automatic question popup.
   The regular Level 1 page always counts 01:00 -> 00:00; no test URL override. */
(()=>{
 'use strict';
 const sim=window.DriveSimulation, bank=window.DriveQuizBank;
 const INTERVAL=60; // Always 1 minute, including ?quizTest=1 saved browser URLs.
 if(!sim||!bank){console.error('[Pixel Drive Quiz] Missing DriveSimulation or DriveQuizBank');const el=document.getElementById('drive-quiz-timer');if(el)el.querySelector('.drive-quiz-clock-label').textContent='CHESTIONAR: EROARE';return;}
 let gameState=null,remaining=INTERVAL,due=false,current=null,lastId=null,answered=false,previousTime=null;
 let wasPaused=false,displayed='';
 const timer=document.getElementById('drive-quiz-timer') || document.createElement('div');timer.className='drive-quiz-timer';timer.setAttribute('role','timer');
 if(!timer.isConnected)(document.querySelector('.scene-wrap')||document.body).appendChild(timer);
 const dialog=document.createElement('dialog');dialog.className='drive-quiz-dialog';dialog.setAttribute('aria-label','Chestionar rutier');document.body.appendChild(dialog);
 const clock=(seconds)=>{const s=Math.max(0,Math.ceil(seconds));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;};
 function renderClock(){
  const value=clock(remaining);
  const stamp=value+'-'+(due?'D':'')+'-'+(gameState?.paused?'P':'');
  if(stamp!==displayed){
   displayed=stamp;
   timer.querySelector('.drive-quiz-clock-label').textContent='CHESTIONAR ÎN';
   timer.querySelector('strong').textContent=value;
   const force=timer.querySelector('#drive-quiz-force');
   if(force){force.hidden=true;force.onclick=null;}
  }
  timer.classList.toggle('urgent',remaining<=15);
 }
 function attachImageFallback(root,q){
  const img=root.querySelector('.quiz-question-image');
  if(!img)return;
  img.addEventListener('error',()=>{if(img.dataset.fallbackUsed)return;img.dataset.fallbackUsed='1';img.src=q.fallbackImage;});
 }
 function picture(q){
  return `<figure class="quiz-visual"><img class="quiz-question-image" src="${q.imageUrl}" alt="${q.imageAlt}" loading="eager" referrerpolicy="no-referrer"><figcaption>${q.imageCredit}${q.imagePage?` · <a href="${q.imagePage}" target="_blank" rel="noopener noreferrer">Sursa imaginii ↗</a>`:""}</figcaption></figure>`;
 }
 function resetCountdown(){remaining=INTERVAL;due=false;renderClock();}
 function finish(){
  if(dialog.open)dialog.close();
  if(gameState&&!gameState.failed)gameState.paused=wasPaused;
  current=null;answered=false;resetCountdown();
 }
 dialog.addEventListener('cancel',e=>{e.preventDefault();if(current)finish();});
 function tryOpen(){
  if(!due||current||!gameState||gameState.failed||gameState.paused||document.querySelector('dialog[open]')||document.querySelector('#lesson-modal')?.hidden===false)return;
  const q=bank.randomExcept(lastId);if(!q)return;
  try{
   current=q;answered=false;lastId=q.id;wasPaused=gameState.paused;
   dialog.innerHTML=`<div class="drive-quiz-top"><span class="drive-quiz-eyebrow">PIXEL DRIVE · TEST RUTIER</span><span class="drive-quiz-reward">+50 CR</span></div><div class="drive-quiz-topic">${q.category} · România</div>${picture(q)}<h2>${q.question}</h2><p class="drive-quiz-sub">Alege răspunsul corect. Greșit = 0 CR, fără penalizare.</p><div class="drive-quiz-answers">${q.answers.map((answer,i)=>`<button type="button" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${answer}</button>`).join('')}</div><button type="button" class="drive-quiz-skip">Sari peste · 0 CR</button>`;
   attachImageFallback(dialog,q);
   gameState.paused=true;
   dialog.showModal();
   dialog.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>{
    if(answered)return;answered=true;
    const chosen=Number(btn.dataset.answer),correct=chosen===q.correct;
    if(correct)window.DriveCareer?.awardCredits(50);
    dialog.innerHTML=`<div class="drive-quiz-result ${correct?'good':'bad'}"><span>${correct?'✓ CORECT · +50 CR':'✕ GREȘIT · +0 CR'}</span><h2>${correct?'Ai câștigat 50 de credite!':'Nicio penalizare. Continuă să înveți.'}</h2><p><b>Răspunsul corect:</b> ${q.answers[q.correct]}</p><p>${q.explanation}</p><a href="${q.url}" rel="noopener noreferrer" target="_blank">Sursă: ${q.source} ↗</a><button type="button" id="drive-quiz-continue">Continuă să conduci →</button></div>`;
    dialog.querySelector('#drive-quiz-continue').addEventListener('click',finish);
   }));
   dialog.querySelector('.drive-quiz-skip').addEventListener('click',finish);
   dialog.querySelector('[data-answer]')?.focus();
   console.info('[Pixel Drive Quiz] Popup opened:',q.id);
  }catch(e){console.error('[Pixel Drive Quiz] Could not open popup',e);current=null;if(gameState)gameState.paused=wasPaused;}
 }
 // Read the actual game state, but keep timer independent of speed and of physics dt caps.
 const originalUpdate=sim.update;
 sim.update=function(s,input,dt){
  if(gameState!==s){
   gameState=s;remaining=INTERVAL;due=false;current=null;answered=false;
   if(dialog.open)dialog.close();previousTime=null;
   renderClock();
  }
  return originalUpdate.call(this,s,input,dt);
 };
 function frame(now){
  if(previousTime!==null&&gameState&&!document.hidden){
   const elapsed=Math.max(0,(now-previousTime)/1000);
   const blocked=gameState.paused||gameState.failed||!!current||!!document.querySelector('dialog[open]')||document.querySelector('#lesson-modal')?.hidden===false;
   if(!blocked&&!due){remaining=Math.max(0,remaining-elapsed);if(remaining<=0.00001){remaining=0;due=true;console.info('[Pixel Drive Quiz] Timer reached zero');}}
  }
  previousTime=now;
  if(due)tryOpen();
  renderClock();
  requestAnimationFrame(frame);
 }
 renderClock();requestAnimationFrame(frame);
 window.DriveTimedQuiz={register:(s)=>{if(s&&gameState!==s){gameState=s;remaining=INTERVAL;due=false;current=null;previousTime=performance.now();renderClock();}},remaining:()=>remaining,interval:INTERVAL,testMode:false,isDue:()=>due,force:()=>{due=true;remaining=0;renderClock();tryOpen();}};
})();
