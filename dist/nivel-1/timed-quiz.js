/* Timed driving quiz: counts active driving seconds, not time spent paused or answering. */
(()=>{
 const S=DriveSimulation, bank=DriveQuizBank;
 const testMode=new URLSearchParams(location.search).get('quizTest')==='1';
 const INTERVAL=testMode?10:120;
 let remaining=INTERVAL,gameState=null,current=null,lastQuestionId=null,wasPaused=false,answered=false;
 const timer=document.createElement('div');
 timer.className='drive-quiz-timer';timer.setAttribute('role','timer');
 document.querySelector('.scene-wrap').append(timer);
 const dialog=document.createElement('dialog');dialog.className='drive-quiz-dialog';
 dialog.setAttribute('aria-label','Chestionar rutier de condus');document.body.append(dialog);
 function format(t){const n=Math.max(0,Math.ceil(t));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
 function paintTimer(){
  timer.innerHTML=`<span class="drive-quiz-clock-icon">◷</span><span class="drive-quiz-clock-label">${testMode?'TEST · ':''}URMĂTORUL CHESTIONAR</span><strong>${format(remaining)}</strong>`;
  timer.classList.toggle('urgent',remaining<=15);
 }
 function finish(){
  if(dialog.open)dialog.close();
  if(gameState&&!gameState.failed)gameState.paused=wasPaused;
  current=null;answered=false;remaining=INTERVAL;paintTimer();
 }
 function skip(){if(!current)return;finish();}
 dialog.addEventListener('cancel',e=>{e.preventDefault();skip();});
 function showQuestion(){
  if(!gameState||dialog.open||gameState.paused||gameState.failed||window.DriveTraining?.active()||document.querySelector('dialog[open]'))return;
  current=bank.randomExcept(lastQuestionId);lastQuestionId=current.id;answered=false;
  wasPaused=gameState.paused;gameState.paused=true;
  const q=current;
  dialog.innerHTML=`<div class="drive-quiz-top"><span class="drive-quiz-eyebrow">PIXEL DRIVE · CHESTIONAR RUTIER</span><span class="drive-quiz-reward">+50 CR</span></div><div class="drive-quiz-topic">${q.category} · România</div><h2>${q.question}</h2><p class="drive-quiz-sub">Alege un singur răspuns. Răspuns greșit = 0 credite, fără penalizare.</p><div class="drive-quiz-answers">${q.answers.map((a,i)=>`<button data-answer="${i}"><span>${String.fromCharCode(65+i)}</span>${a}</button>`).join('')}</div><button class="drive-quiz-skip" id="drive-quiz-skip">Sari peste · 0 CR</button>`;
  dialog.showModal();
  dialog.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{
   if(answered)return;answered=true;
   const chosen=Number(b.dataset.answer),right=chosen===q.correct;
   if(right)DriveCareer.awardCredits(50);
   dialog.innerHTML=`<div class="drive-quiz-result ${right?'good':'bad'}"><span>${right?'✓ CORECT · +50 CR':'✕ GREȘIT · +0 CR'}</span><h2>${right?'Ai câștigat 50 de credite!':'Nicio penalizare. Continuă să înveți.'}</h2><p><b>Răspunsul corect:</b> ${q.answers[q.correct]}</p><p>${q.explanation}</p><a href="${q.url}" rel="noopener" target="_blank">${q.source} ↗</a><button id="drive-quiz-continue">Continuă să conduci →</button></div>`;
   dialog.querySelector('#drive-quiz-continue').onclick=finish;
  });
  dialog.querySelector('#drive-quiz-skip').onclick=skip;
  dialog.querySelector('[data-answer]')?.focus();
 }
 const update=S.update;
 S.update=(s,input,dt)=>{
  if(s!==gameState){if(dialog.open)dialog.close();gameState=s;remaining=INTERVAL;current=null;answered=false;paintTimer();}
  const counting=!s.failed&&!s.paused&&!window.DriveTraining?.active()&&!dialog.open&&Math.abs(s.player.speed)>.035;
  update(s,input,dt);
  if(counting&&!s.failed&&!s.paused){remaining=Math.max(0,remaining-Math.max(0,Math.min(.05,Number(dt)||0)));if(remaining===0)showQuestion();}
  paintTimer();
 };
 paintTimer();
 window.DriveTimedQuiz={remaining:()=>remaining,testMode,interval:INTERVAL};
})();
