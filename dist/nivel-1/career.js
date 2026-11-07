(()=>{
const S=DriveSimulation,W=DriveWorld;let data;try{data=JSON.parse(localStorage.getItem('pixel-career-v1'));}catch{}data=Object.assign({money:300,passes:0,fuel:100,car:0,paint:'#e1e1d8',owned:[0]},data||{});const save=()=>{try{localStorage.setItem('pixel-career-v1',JSON.stringify(data));}catch{}};
const places=W.services;let schoolResult=null;
const cars=[['Clasic',0,0],['Compact',1200,2],['Touring',2800,5],['Sport',5200,9]];let state,training=0,quiz=null,lastAutoSave=0,lastHudText="";
const oldRoad=W.roadAt;W.roadAt=(x,z,m=0)=>(x>=9+m&&x<=21-m&&z>=26+m&&z<=38-m)||places.some(p=>p.type!=='training'&&x>=p.x-.4+m&&x<=p.x+4.9-m&&Math.abs(z-p.z)<=4.3-m)||oldRoad(x,z,m);
const panel=document.createElement('dialog');panel.className='career-dialog';document.body.append(panel);let wasPaused=false;
function close(){panel.close();if(state)state.paused=wasPaused;quiz=null;}panel.addEventListener('cancel',e=>{e.preventDefault();close();});
function show(title,html){if(!panel.open){wasPaused=state.paused;state.paused=true;panel.showModal();}panel.innerHTML=`<button id="career-close" style="float:right">Închide ×</button><h2>${title}</h2><p>${data.money} credite · ${data.passes} teste promovate</p>${html}`;panel.querySelector('#career-close').onclick=close;}
function notice(t){state.message=t;state.messageUntil=state.time+6;}
function open(p){if(p.type==='fuel'){show(p.name,`<p>Rezervor: ${Math.round(data.fuel)}%</p><button id="refill">Alimentează +25% · 40 credite</button><button id="rescue">Ajutor de urgență · +5% gratuit dacă rezervorul e gol</button>`);panel.querySelector('#refill').onclick=()=>{if(data.fuel>=100||data.money<40)return;data.money-=40;data.fuel=Math.min(100,data.fuel+25);save();open(p);};panel.querySelector('#rescue').onclick=()=>{if(data.fuel<1){data.fuel=5;save();open(p);}};}
if(p.type==='cars'){show(p.name,cars.map(([n,c,r],i)=>`<p><b>${n}</b> · ${c} credite · ${r} teste <button data-car="${i}" ${data.passes<r||(!data.owned.includes(i)&&data.money<c)?'disabled':''}>${data.car===i?'Selectat':data.owned.includes(i)?'Condu':'Cumpără'}</button></p>`).join(''));panel.querySelectorAll('[data-car]').forEach(b=>b.onclick=()=>{const i=+b.dataset.car;if(!data.owned.includes(i)){data.money-=cars[i][1];data.owned.push(i);}data.car=i;save();open(p);});}
if(p.type==='custom'){show(p.name,'<p>Vopsea nouă · 100 credite</p>'+['#e1e1d8','#b83f3b','#315c89','#d3ad52','#303a35','#7b536b'].map(c=>`<button data-paint="${c}" style="background:${c};width:48px;height:48px" aria-label="Vopsea ${c}"></button>`).join(''));panel.querySelectorAll('[data-paint]').forEach(b=>b.onclick=()=>{if(data.money<100)return;data.money-=100;data.paint=b.dataset.paint;save();open(p);});}
if(p.type==='school'){
 schoolResult=null;
 show(p.name,'<p><b>Chestionare pentru permis (exercițiu, nu examen oficial)</b></p><p>Test de probă: 10 întrebări aleatorii din banca de chestionare; minimum 8 din 10 corecte pentru promovare și +150 credite.</p><button id="start-driving">Învață pornirea și conducerea · POV în poligon</button><button id="start-quiz">Teste • Învățare și chestionare ↗</button>');
 panel.querySelector('#start-driving').onclick=()=>{close();DriveTraining.start(state);};
 panel.querySelector('#start-quiz').onclick=()=>{
  if(window.PixelSchoolHub?.open){window.PixelSchoolHub.open({onResult:result=>{
    schoolResult=result;
    if(result.pass){data.money+=150;data.passes++;save();lastHudText='';}
  }});}
  else {quiz={index:0,right:0,questions:DriveQuizBank.shuffled().slice(0,10)};question();}
 };
}
if(p.type==='training'){close();DriveTraining.start(state);}}
function question(){
 if(!quiz)return;
 const q=quiz.questions[quiz.index];
 if(!q){
  const pass=quiz.right>=8;
  schoolResult={pass,right:quiz.right};
  if(pass){data.money+=150;data.passes++;save();}
  show('Rezultatul chestionarului',`<p class="school-quiz-result"><b>${quiz.right}/${quiz.questions.length} răspunsuri corecte</b></p><p>${pass?'Promovat! Ai câștigat 150 de credite.':'Neîndeplinit. Nu pierzi credite; mai poți încerca.'}</p><button id="school-again">Încearcă alt chestionar</button><button id="school-finish">Înapoi la condus</button>`);
  panel.querySelector('#school-again').onclick=()=>{quiz={index:0,right:0,questions:DriveQuizBank.shuffled().slice(0,10)};question();};
  panel.querySelector('#school-finish').onclick=close;
  return;
 }
 const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const sourceLink=safe(q.sourceUrl||q.url);
 const refLink=`<a href="${sourceLink}" target="_blank" rel="noopener noreferrer">${safe(q.sourceLabel||'Sursa întrebării: '+q.source)} ↗</a>${q.referenceImageUrl?` · <a href="${safe(q.referenceImageUrl)}" target="_blank" rel="noopener noreferrer">Imaginea de referință ↗</a>`:""}`;
 show('Școala auto · '+(quiz.index+1)+'/'+quiz.questions.length,`<div class="school-quiz-question"><span>${safe(q.category)} · Cod rutier RO</span><div class="school-quiz-visual"><img class="quiz-question-image" src="${safe(q.imageUrl)}" alt="${safe(q.imageAlt)}" referrerpolicy="no-referrer"><small>${safe(q.imageCredit)}${q.imagePage?` · <a href="${safe(q.imagePage)}" target="_blank" rel="noopener noreferrer">Referință imagine ↗</a>`:''}</small></div><h3>${safe(q.question)}</h3><p>Pot exista mai multe răspunsuri corecte. Selectează-le pe toate.</p>${q.answers.map((answer,i)=>`<button class="school-quiz-answer" aria-pressed="false" data-answer="${i}"><b>${String.fromCharCode(65+i)}.</b> ${safe(answer)}</button>`).join('')}<button id="school-check" disabled>Verifică răspunsul</button><p style="font-size:12px">${refLink}</p></div>`);
 const img=panel.querySelector('.school-quiz-visual img');
 if(img)img.addEventListener('error',()=>{if(!img.dataset.fallbackUsed){img.dataset.fallbackUsed='1';img.src=q.fallbackImage;}});
 const chosen=new Set(),gold=new Set(q.correctIndices||[q.correct]);
 const check=panel.querySelector('#school-check');
 panel.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const i=+b.dataset.answer;
  if(chosen.has(i))chosen.delete(i);else chosen.add(i);
  b.classList.toggle('selected',chosen.has(i));b.setAttribute('aria-pressed',String(chosen.has(i)));
  check.disabled=chosen.size===0;
 });
 check.onclick=()=>{
  if(!quiz||!chosen.size)return;
  const right=chosen.size===gold.size&&[...chosen].every(x=>gold.has(x));
  if(right)quiz.right++;quiz.index++;
  show(right?'Răspuns corect':'Răspuns greșit',`<p>${right?'Bravo!':'Nu primești punct pentru această întrebare.'}</p><p><b>Răspunsuri corecte:</b> ${[...gold].map(i=>safe(q.answers[i])).join('; ')}</p><p>${safe(q.explanation)}</p><p>${refLink}</p><button id="school-next">${quiz.index===quiz.questions.length?'Vezi rezultatul':'Următoarea întrebare →'}</button>`);
  panel.querySelector('#school-next').onclick=question;
 };
}
const hud=document.createElement('div');hud.className='career-hud';document.querySelector('.scene-wrap').append(hud);
const rescue=document.createElement('button');rescue.className='fuel-rescue';rescue.textContent='REZERVOR GOL · Primește 5% combustibil';rescue.hidden=true;document.querySelector('.scene-wrap').append(rescue);rescue.onclick=()=>{if(data.fuel<=0){data.fuel=5;save();rescue.hidden=true;if(state)notice('Ai primit 5% combustibil. Mergi la benzinărie.');}};
const oldObjective=S.objective;S.objective=s=>{const school=places.find(p=>p.type==='school');const distance=Math.hypot(s.player.x-school.x,s.player.z-school.z);if(distance<5){return {title:schoolResult?.pass?'Școala auto · obiectiv îndeplinit':schoolResult?'Școala auto · încearcă din nou':'Obiectiv · Școala auto',text:schoolResult?.pass?'+150 credite · Test promovat. Continuă traseul sau apasă I pentru alt test.':schoolResult?'Ai nevoie de 8/10 răspunsuri corecte. Apasă I pentru a reîncerca.':distance>=2.5?'Apropie-te de intrarea albastră a școlii.':Math.abs(s.player.speed)>.05?'Oprește la intrarea școlii, apoi apasă I.':'Apasă I și promovează testul: minimum 8/10 răspunsuri corecte · +150 credite.',distance,target:school,service:true};}schoolResult=null;return oldObjective(s);};
const update=S.update;S.update=(s,input,dt)=>{state=s;rescue.hidden=data.fuel>0;const before=s.distance,phase=s.mission.phase;if(data.fuel<=0&&!window.DriveTraining?.active())input={...input,w:false,s:false};update(s,input,dt);data.fuel=Math.max(0,data.fuel-(s.distance-before)*.12);if(phase!==s.mission.phase)save();if(!s.paused){const points=[[12,28],[17,31],[12,35],[18,36]];if(training&&points[training-1]){const [x,z]=points[training-1];if(Math.hypot(s.player.x-x,s.player.z-z)<1&&(training<4||Math.abs(s.player.speed)<.05)){training++;if(training===5){data.money+=100;training=0;save();notice('Exercițiu terminat · +100 credite');}else notice('Reper atins. Continuă exercițiul.');}}}const p=places.find(p=>Math.hypot(p.x-s.player.x,p.z-s.player.z)<2.5);const hudText=`${data.money} CR · COMBUSTIBIL ${Math.round(data.fuel)}% · ${cars[data.car][0]}${p?' · I: '+p.name:''}${training?' · POLIGON '+training+'/4':''}`;if(hudText!==lastHudText){hud.textContent=hudText;lastHudText=hudText;}const now=performance.now();if(now-lastAutoSave>=5000){save();lastAutoSave=now;}};
const interact=S.interact;S.interact=s=>{state=s;const p=places.find(p=>Math.hypot(p.x-s.player.x,p.z-s.player.z)<2.5);if(p){if(Math.abs(s.player.speed)>.05){notice('Oprește pentru a intra.');return{type:'need-stop'};}open(p);return{type:'service'};}const result=interact(s);if(result?.type==='mission'){data.money+=100;if(s.mission.phase==='complete'){data.money+=100;s.mission.phase='pickup';}save();}return result;};
window.DriveCareer={fuel:()=>data.fuel,training:()=>training,color:()=>data.paint,model:()=>data.car,places,credits:()=>data.money,awardCredits:(amount)=>{const reward=Math.max(0,Math.floor(Number(amount)||0));data.money+=reward;save();lastHudText='';return data.money;}};
})();
