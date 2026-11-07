/* Pixel Drive v49 - self-contained driving school learning centre.
   Uses the installed DriveQuizBank, including 1208 RoDrive records when imported.
   Original UI. Categories are local keyword classifications, not official DGPCI tags.
*/
(()=>{
  'use strict';
  const bank=window.DriveQuizBank;
  if(!bank){console.error('[Pixel School] DriveQuizBank unavailable');return;}
  const STORAGE='pixel-drive-school-progress-v49';
  const CATS=[
    ['indicatoare','Indicatoare și marcaje','◈',/indicator|marcaj|semn de circulație|panou adițional|semnalizare rutieră|drum cu prioritate|accesul interzis|drum îngustat/i],
    ['politist','Semnalele polițiștilor','◉',/polițișt|agentul de circulație|agentului de circulație|agentului de cale ferată|brațul.+ridicat|baston reflectorizant/i],
    ['semafoare','Semnalele luminoase','◐',/semafor|lumin[ae] (roșie|galbenă|verde)|semnale luminoase|culoarea verde/i],
    ['pozitie','Poziția și semnalizarea','↗',/semnaliz|schimbarea direcției|schimbarea benzii|încadrarea|banda de circulație|benzi de circulație|poziți[aei] în timpul/i],
    ['depasire','Depășirea','⇄',/depășir|depăși|depășește/i],
    ['viteza','Viteza și distanța','50',/vitez|distanț[aei] dintre vehicule|distanța de siguranță|km\/h|limită de viteza|limit[ea] maxim/i],
    ['manevre','Manevre','↺',/întoarc|mersul înapoi|viraj|virați|vira|manevr|schimbarea sensului/i],
    ['prioritate','Prioritatea de trecere','◆',/prioritat|cedeaz|cedați|acord[aă] trecerea|ordinea de trecere|intersecți[ea]/i],
    ['ferata','Trecerea la calea ferată','🚆',/ferat|feroviar|tramvai|calea ferată|barier[ae]/i],
    ['oprire','Oprirea și parcarea','P',/oprire|oprir|staționar|parcare|parcați|imobiliz|vehiculul oprit/i],
    ['autostrada','Circulația pe autostrăzi','⇢',/autostrad|drum expres|band[ae] de urgență/i],
    ['obligatii','Obligațiile șoferului','✓',/obligați|obligat|acte|documente|centura|lumini de întâlnire|vehicul avariat/i],
    ['sanctiuni','Sancțiuni și infracțiuni','!',/sancțiun|infracțiun|amend|suspend|permisul de conducere|dreptului de a conduce|contravenț/i],
    ['generale','Reguli generale','§',/^(?!)$/i],
    ['preventiva','Conducerea preventivă','◇',/preventiv|accident|oboseal|oboseală|alcool|drog|pericol|vizibilitat|condiții meteo|ceață|polei/i],
    ['primajutor','Măsuri de prim ajutor','+',/prim ajutor|fractur|garou|rănit|hemoragi|resuscit|victim|leziuni|coloanei vertebrale/i],
    ['eco','Conducerea ecologică','♻',/ecologic|consum de combustibil|polu[aă]|emisi|economie de carburant/i],
    ['mecanica','Noțiuni de mecanică','⚙',/motor|bateri|acumulator|pneur|anvelop|frânare hidraulic|ulei|antigel|diesel|ambreiaj|transmisie/i],
  ];
  const byId=new Map();
  const items=bank.questions.filter(q=>q&&typeof q.question==='string'&&Array.isArray(q.answers)&&q.answers.length>=2);
  for(const q of items)byId.set(String(q.id),q);
  function classify(q){
    // Prefer question text. If it is image-dependent and vague, fall back to the visual description.
    const texts=[q.question||'',q.imageDescription||''];
    for(const t of texts){for(const c of CATS){if(c[0]!=='generale'&&c[3].test(t))return c[0];}}
    return 'generale';
  }
  const categoryMap=new Map(items.map(q=>[String(q.id),classify(q)]));
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const link=x=>{try{const u=new URL(String(x),location.href);return u.protocol==='https:'||u.protocol==='http:'?esc(u.href):'#';}catch{return '#';}};
  const pad=n=>String(n).padStart(2,'0');
  const count=x=>Object.keys(x||{}).length;
  const reduceText=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  function load(){try{return JSON.parse(localStorage.getItem(STORAGE))||{};}catch{return {};}}
  let memory=Object.assign({seen:{},correct:{},wrong:{},bookmarks:{},history:[],lastId:null},load());
  const save=()=>{try{localStorage.setItem(STORAGE,JSON.stringify(memory));}catch(e){console.warn('[Pixel School] Save not available',e);}};
  const d=document.createElement('dialog');d.className='ps-hub';d.setAttribute('aria-label','Școala auto Pixel Drive');
  d.innerHTML=`<div class="ps-shell">
    <header class="ps-top"><div class="ps-logo"><span class="ps-logo-mark">P<span>⁸</span></span><span>PIXEL DRIVE <small>ȘCOALA AUTO</small></span></div>
      <div class="ps-top-search"><span aria-hidden="true">⌕</span><input id="ps-search" type="search" placeholder="Caută întrebare sau subiect..." autocomplete="off" aria-label="Caută întrebări"></div>
      <div class="ps-top-right"><span class="ps-tag">CAT. B</span><button type="button" data-act="close" class="ps-exit" aria-label="Înapoi la joc">× <span>Înapoi la joc</span></button></div>
    </header>
    <div class="ps-content"><nav class="ps-sidebar" aria-label="Meniu școala auto"></nav><main class="ps-main" tabindex="-1"></main></div>
    <div class="ps-mobile-nav"><button data-act="home">Acasă</button><button data-act="general">Învățare</button><button data-act="examhome">Chestionare</button><button data-act="wrong">Greșeli</button></div>
  </div>`;
  document.body.appendChild(d);
  const main=d.querySelector('.ps-main'), sidebar=d.querySelector('.ps-sidebar'),search=d.querySelector('#ps-search');
  let view='home',category='all',session=null,chosen=new Set(),shownResult=false,result=null,searchTerm='',onResult=null,ticker=null,lastPage='home';
  const answers=q=>(q.correctIndices?.length?q.correctIndices:[q.correct]).map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<q.answers.length);
  const isRight=(a,b)=>a.length===b.length&&a.every(n=>b.includes(n));
  const qset=cat=>cat==='all'?items:items.filter(q=>categoryMap.get(String(q.id))===cat);
  const getSeen=qs=>qs.filter(q=>memory.seen[String(q.id)]).length;
  const getAcc=qs=>qs.filter(q=>memory.correct[String(q.id)]).length;
  const heroNum=n=>Intl.NumberFormat('ro-RO').format(n);
  function side(){
    sidebar.innerHTML=`<div class="ps-nav-block"><div class="ps-nav-label">PRINCIPAL</div>
     <button class="ps-side-link ${view==='home'?'active':''}" data-act="home"><span>⌂</span> Prezentare generală</button>
     <button class="ps-side-link ${view==='study'&&category==='all'?'active':''}" data-act="general"><span>▤</span> Mediu de învățare <b>${items.length}</b></button>
     <button class="ps-side-link ${view==='examhome'||view==='exam'?'active':''}" data-act="examhome"><span>▦</span> Chestionare</button>
     <button class="ps-side-link" data-act="wrong"><span>↶</span> Repetă greșelile <b>${items.filter(q=>memory.wrong[String(q.id)]).length}</b></button>
     <button class="ps-side-link" data-act="bookmarks"><span>☆</span> Salvate <b>${items.filter(q=>memory.bookmarks[String(q.id)]).length}</b></button></div>
     <div class="ps-nav-block"><div class="ps-nav-label">ÎNVĂȚARE PE CAPITOLE <small>${CATS.length}</small></div>
     ${CATS.map(c=>{const n=qset(c[0]).length;return `<button class="ps-side-link ${view==='study'&&category===c[0]?'active':''}" data-act="category" data-cat="${c[0]}"><span>${esc(c[2])}</span><em>${esc(c[1])}</em><b>${n}</b></button>`;}).join('')}
     </div><div class="ps-nav-notice">Întrebări de pregătire, nu portalul oficial DGPCI. Categorii încadrate automat din text.</div>`;
  }
  function stateHeader(title,kicker,desc){return `<div class="ps-page-heading"><div><p class="ps-kicker">${esc(kicker)}</p><h1>${esc(title)}</h1><p class="ps-desc">${esc(desc)}</p></div><button class="ps-subtle-button" data-act="home">⌂ Acasă</button></div>`;}
  function categoryCard(c){const qs=qset(c[0]),seen=getSeen(qs),pct=qs.length?Math.round(seen*100/qs.length):0;return `<button class="ps-category" data-act="category" data-cat="${c[0]}"><div class="ps-cat-top"><span class="ps-cat-icon">${esc(c[2])}</span><span class="ps-muted">${qs.length} întrebări</span></div><strong>${esc(c[1])}</strong><div class="ps-progress"><i style="width:${pct}%"></i></div><small>${pct}% parcurs</small></button>`;}
  function home(){
    const seen=getSeen(items),pct=items.length?Math.round(seen*100/items.length):0;
    const last=items.find(q=>String(q.id)===memory.lastId);
    main.innerHTML=`<div class="ps-hero"><div class="ps-hero-content"><span class="ps-hero-eyebrow">CENTRU DE ÎNVĂȚARE • CATEGORIA B</span><h1>Învață regulile.<br><span>Condu cu încredere.</span></h1><p>Toate întrebările din banca ta, organizate pe capitole, cu explicații, imagini și teste ca la examen.</p><div class="ps-hero-actions"><button class="ps-primary" data-act="${last?'resume':'general'}">▶ ${last?'Continuă de unde ai rămas':'Începe învățarea'}</button><button class="ps-light" data-act="examhome">Simulare examen ↗</button></div></div><div class="ps-hero-emblem"><span>P⁸</span><small>DRIVE SMART</small></div></div>
    <div class="ps-metrics"><div><span>ÎNTREBĂRI DISPONIBILE</span><strong>${heroNum(items.length)}</strong><small>Din banca instalată</small></div><div><span>PARCURSE</span><strong>${heroNum(seen)}</strong><small>${pct}% din total</small></div><div><span>RĂSPUNSURI CORECTE</span><strong>${heroNum(getAcc(items))}</strong><small>Învățare / recapitulare</small></div><div><span>DE REVĂZUT</span><strong>${heroNum(items.filter(q=>memory.wrong[String(q.id)]).length)}</strong><small>Întrebări greșite</small></div></div>
    <div class="ps-section-title"><div><h2>Învață pe capitole</h2><p>18 domenii de legislație rutieră</p></div><button class="ps-textbutton" data-act="general">Toate întrebările ↗</button></div>
    <div class="ps-categories">${CATS.map(categoryCard).join('')}</div>
    <div class="ps-two"><div class="ps-shortcut"><span>📋 TESTE</span><h3>Pregătit pentru examen?</h3><p>26 de întrebări • 30 minute • minimum 22 corecte</p><button class="ps-primary" data-act="newexam">Începe simularea →</button></div><div class="ps-shortcut ps-shortcut-soft"><span>↶ RECUPERARE</span><h3>Învață din greșeli</h3><p>Reia numai întrebările la care nu ai răspuns corect.</p><button class="ps-outline" data-act="wrong">Repetă greșelile →</button></div></div>
    ${items.length<1208?`<p class="ps-info">Banca actuală conține ${items.length} întrebări. Pentru toate cele 1.208, trebuie finalizat importul v48.</p>`:''}`;
  }
  function examHome(){
    const fixed=Math.ceil(items.length/26), hist=memory.history.slice(-4).reverse();
    main.innerHTML=`${stateHeader('Chestionare auto','SIMULĂRI • CATEGORIA B','Exersează ca la proba teoretică, apoi verifică răspunsurile și explicațiile.')}
      <div class="ps-exam-feature"><div><span class="ps-kicker">SIMULARE EXAMEN</span><h2>Categoria B • 26 întrebări</h2><p>Ai 30 de minute și trebuie să răspunzi corect la minimum 22 din 26 de întrebări. Unele au mai multe variante corecte.</p><div class="ps-exam-pills"><span>◷ 30 minute</span><span>✓ Minimum 22 corecte</span><span>+150 CR la promovare</span></div><button data-act="newexam" class="ps-primary">Începe chestionar nou →</button></div><div class="ps-score-symbol">26<span>/26</span></div></div>
      <div class="ps-section-title"><div><h2>Chestionare predefinite</h2><p>Seturi stabile, în ordinea întrebărilor din banca Pixel Drive. Ultimul poate reutiliza câteva întrebări.</p></div><span class="ps-muted">${fixed} seturi</span></div>
      <div class="ps-exam-grid">${Array.from({length:fixed},(_,i)=>`<button data-act="fixedexam" data-n="${i}" class="ps-fixed-test"><b>TEST ${pad(i+1)}</b><small>26 întrebări</small><span>↗</span></button>`).join('')}</div>
      <div class="ps-section-title"><div><h2>Rezultate recente</h2><p>Salvate pe acest dispozitiv</p></div></div>
      ${hist.length?`<div class="ps-history">${hist.map(h=>`<div><b>${esc(h.label||'Chestionar')}</b><span>${esc(h.when||'')}</span><strong class="${h.pass?'ps-ok':'ps-bad'}">${h.right}/${h.total} ${h.pass?'• Promovat':'• Neîndeplinit'}</strong></div>`).join('')}</div>`:'<p class="ps-empty">Nu ai completat încă niciun chestionar.</p>'}`;
  }
  function startStudy(cat='all',mode='study',resume=false){
    let qs=mode==='wrong'?items.filter(q=>memory.wrong[String(q.id)]):mode==='bookmarks'?items.filter(q=>memory.bookmarks[String(q.id)]):qset(cat);
    if(!qs.length){view='empty';main.innerHTML=`${stateHeader('Nu există întrebări','ÎNVĂȚARE','Această selecție nu conține încă întrebări.')}<button class="ps-primary" data-act="home">Înapoi la meniu</button>`;side();return;}
    category=cat;view='study';chosen=new Set();shownResult=false;result=null;
    session={kind:mode,items:qs.map(q=>String(q.id)),index:0,selected:{},draft:{},passed:0};
    if(resume&&memory.lastId){const idx=session.items.indexOf(String(memory.lastId));if(idx>=0)session.index=idx;}
    renderStudy();
  }
  function questionHead(q){
    const idx=session.index+1,len=session.items.length;
    const label= CATS.find(c=>c[0]===categoryMap.get(String(q.id)))?.[1]||'Reguli generale';
    const pct=Math.round(idx/len*100);
    return `<div class="ps-study-head"><div><p class="ps-kicker">${session.kind==='exam'?'CHESTIONAR CATEGORIA B':'MEDIU DE ÎNVĂȚARE'} • ${esc(label)}</p><h2>Întrebarea ${idx} <span>/ ${len}</span></h2></div><div class="ps-study-meta">${session.kind==='exam'?`<strong class="ps-exam-clock">◷ <span id="ps-clock">30:00</span></strong>`:`<span>${pct}% din această selecție</span>`}<button data-act="bookmark" class="ps-save ${memory.bookmarks[String(q.id)]?'on':''}" aria-label="Salvează întrebarea">${memory.bookmarks[String(q.id)]?'★':'☆'}</button></div></div><div class="ps-progress ps-thin"><i style="width:${pct}%"></i></div>`;
  }
  function visual(q){const url=link(q.imageUrl||q.fallbackImage||'');return `<div class="ps-visual"><img src="${url}" alt="${esc(q.imageAlt||'Ilustrație pentru întrebarea rutieră')}" loading="eager" referrerpolicy="no-referrer"><small>${esc(q.imageCredit||'Ilustrație pentru exercițiu')}${q.needsImageReview?' • Imagine schematică de revizuit; consultă și referința originală.':''}</small></div>`;}
  function external(q){
    const source=q.sourceUrl||q.url||'';
    return `<div class="ps-reference">↗ <a href="${link(source)}" target="_blank" rel="noopener noreferrer">${esc(q.sourceLabel||'Deschide sursa întrebării')}</a>${q.referenceImageUrl?` <a target="_blank" rel="noopener noreferrer" href="${link(q.referenceImageUrl)}">Vezi referința vizuală</a>`:''}<span>Întrebare ${esc(q.id)}</span></div>`;
  }
  function renderStudy(){
    if(!session){home();return;}
    if(session.index>=session.items.length){finishedStudy();return;}
    const q=byId.get(session.items[session.index]);if(!q){session.index++;renderStudy();return;}
    const id=String(q.id);memory.lastId=id;save();
    const previous=session.selected[id],oldAns=previous?new Set(previous.values):new Set();
    chosen=shownResult?oldAns:new Set(session.draft?.[id]||[]);
    const gold=answers(q);
    const resultHtml=shownResult&&previous?`<div class="ps-feedback ${previous.right?'right':'wrong'}"><strong>${previous.right?'✓ Răspuns corect':'✕ Răspuns greșit'}</strong><p><b>Corect:</b> ${gold.map(i=>`${String.fromCharCode(65+i)}. ${esc(q.answers[i])}`).join('; ')}</p><p>${esc(q.explanation||'Verifică sursa pentru o explicație suplimentară.')}</p></div>`:'';
    main.innerHTML=`<div class="ps-toolbar"><button data-act="${session.kind==='wrong'?'wrong':session.kind==='bookmarks'?'bookmarks':'home'}" class="ps-textbutton">← Înapoi la meniu</button><span class="ps-muted">Selectează una sau mai multe variante</span></div>
    <div class="ps-question-card">${questionHead(q)}<div class="ps-question-grid"><div class="ps-question-center">${visual(q)}<h3>${esc(q.question)}</h3><p class="ps-answer-note">Unele întrebări au mai multe răspunsuri corecte.</p><div class="ps-answers">${q.answers.map((a,i)=>`<button class="ps-answer ${chosen.has(i)?'selected':''} ${shownResult?(gold.includes(i)?'correct':chosen.has(i)?'incorrect':''):''}" data-act="select" data-n="${i}" ${shownResult?'disabled':''} aria-pressed="${chosen.has(i)}"><span>${String.fromCharCode(65+i)}</span><em>${esc(a)}</em><i>${chosen.has(i)?'✓':''}</i></button>`).join('')}</div>${resultHtml}${external(q)}</div></div>
    <div class="ps-question-footer"><div class="ps-inline-actions"><button data-act="previous" class="ps-outline" ${session.index===0?'disabled':''}>← Înapoi</button><button data-act="bookmark" class="ps-outline">${memory.bookmarks[id]?'★ Salvată':'☆ Salvează'}</button></div><div class="ps-inline-actions"><button data-act="${shownResult?'next':'check'}" ${!shownResult?'disabled':''} id="ps-submit" class="ps-primary">${shownResult?'Următoarea →':'Verifică răspunsul →'}</button></div></div></div>`;
    d.querySelector('.ps-visual img')?.addEventListener('error',e=>{const el=e.currentTarget;if(el.dataset.fallback)return;el.dataset.fallback='1';el.src=q.fallbackImage||'/nivel-1/sign-assets/stop.svg';});
    side(); main.scrollTop=0;
  }
  function finishedStudy(){const n=session.items.length;main.innerHTML=`${stateHeader('Sesiune terminată','FELICITĂRI','Poți continua învățarea sau repeta întrebările greșite.')}<div class="ps-complete"><span class="ps-complete-symbol">✓</span><h2>Ai parcurs ${n} întrebări!</h2><p>Progresul a fost salvat automat. Întrebările greșite rămân disponibile pentru recapitulare.</p><button class="ps-primary" data-act="home">Înapoi la meniu</button><button class="ps-outline" data-act="wrong">Repetă greșelile</button></div>`;side();}
  function setChosen(i){const q=byId.get(session?.items[session.index]);if(!q||shownResult)return;if(chosen.has(i))chosen.delete(i);else chosen.add(i);main.querySelectorAll('.ps-answer').forEach(b=>{const n=+b.dataset.n;b.classList.toggle('selected',chosen.has(n));b.setAttribute('aria-pressed',String(chosen.has(n)));b.querySelector('i').textContent=chosen.has(n)?'✓':'';});if(session.kind!=='exam'&&session.draft)session.draft[String(q.id)]=[...chosen];const btn=main.querySelector('#ps-submit');if(btn)btn.disabled=chosen.size===0;}
  function check(){const q=byId.get(session?.items[session.index]);if(!q||!chosen.size||shownResult)return;const id=String(q.id),right=isRight([...chosen].sort(),answers(q).sort());session.selected[id]={values:[...chosen],right};if(session.draft)delete session.draft[id];memory.seen[id]=1;if(right){memory.correct[id]=1;delete memory.wrong[id];}else{delete memory.correct[id];memory.wrong[id]=1;}save();shownResult=true;renderStudy();}
  function gotoQuestion(dir){session.index=Math.max(0,session.index+dir);shownResult=Boolean(session.selected[session.items[session.index]]);if(session.index>=session.items.length){finishedStudy();return;}renderStudy();}
  function newExam(fixedIndex=null,quick=false){
    if(!items.length)return;
    const countQ=Math.min(quick?10:26,items.length);
    let qs;
    if(fixedIndex!==null){const start=fixedIndex*26;qs=items.slice(start,start+countQ);if(qs.length<countQ)qs=[...qs,...items.slice(0,countQ-qs.length)];}
    else {qs=bank.shuffled().slice(0,countQ);}
    session={kind:'exam',items:qs.map(q=>String(q.id)),index:0,selected:{},endAt:Date.now()+(quick?10:30)*60*1000,finished:false,quick,fixedIndex};
    view='exam';category='all';result=null;shownResult=false;chosen=new Set();renderExam();
    clearInterval(ticker);ticker=setInterval(()=>{if(!d.open||view!=='exam'){clearInterval(ticker);return;}const s=Math.max(0,Math.ceil((session.endAt-Date.now())/1000));const clock=main.querySelector('#ps-clock');if(clock)clock.textContent=`${pad(Math.floor(s/60))}:${pad(s%60)}`;if(s===0)finalizeExam();},1000);
  }
  function renderExam(){if(!session)return;
    const q=byId.get(session.items[session.index]);if(!q){finalizeExam();return;}
    const id=String(q.id), selected=session.selected[id]||[], countAnswered=Object.values(session.selected).filter(a=>a?.length).length;
    chosen=new Set(selected);
    main.innerHTML=`<div class="ps-toolbar"><button class="ps-textbutton" data-act="exitexam">← Ieși din test</button><div class="ps-exam-status">Răspunse: <b>${countAnswered}/${session.items.length}</b></div></div><div class="ps-question-card">${questionHead(q)}
    <div class="ps-exam-layout"><div class="ps-question-center">${visual(q)}<h3>${esc(q.question)}</h3><p class="ps-answer-note">Selectează toate variantele pe care le consideri corecte.</p><div class="ps-answers">${q.answers.map((a,i)=>`<button class="ps-answer ${chosen.has(i)?'selected':''}" data-act="examselect" data-n="${i}" aria-pressed="${chosen.has(i)}"><span>${String.fromCharCode(65+i)}</span><em>${esc(a)}</em><i>${chosen.has(i)?'✓':''}</i></button>`).join('')}</div>${external(q)}</div>
    <div class="ps-exam-aside"><strong>Navigare întrebări</strong><p>Poți reveni la o întrebare sau o poți lăsa pentru mai târziu.</p><div class="ps-exam-numbers">${session.items.map((id,i)=>`<button data-act="examjump" data-n="${i}" class="${i===session.index?'current':''} ${session.selected[id]?.length?'answered':''}">${i+1}</button>`).join('')}</div><div class="ps-exam-legend"><i></i> Răspuns salvat</div></div></div>
    <div class="ps-question-footer"><button class="ps-outline" data-act="examprev" ${session.index===0?'disabled':''}>← Înapoi</button><div class="ps-inline-actions"><button class="ps-outline" data-act="examnext">${session.index===session.items.length-1?'Mai târziu':'Următoarea →'}</button><button class="ps-primary" data-act="finalize">Finalizează testul</button></div></div></div>`;
    main.querySelector('.ps-visual img')?.addEventListener('error',e=>{const el=e.currentTarget;if(el.dataset.fallback)return;el.dataset.fallback='1';el.src=q.fallbackImage||'/nivel-1/sign-assets/stop.svg';});
    side();main.scrollTop=0;
    const secs=Math.max(0,Math.ceil((session.endAt-Date.now())/1000));const clock=main.querySelector('#ps-clock');if(clock)clock.textContent=`${pad(Math.floor(secs/60))}:${pad(secs%60)}`;
  }
  function saveExamChoice(){if(!session)return;const id=session.items[session.index];session.selected[id]=[...chosen].sort();}
  function moveExam(to){saveExamChoice();session.index=(to+session.items.length)%session.items.length;renderExam();}
  function finalizeExam(){
    if(!session||session.finished)return;
    if(view==='exam')saveExamChoice();session.finished=true;clearInterval(ticker);
    const questions=session.items.map(id=>byId.get(id));
    let n=0;const wrongs=[];
    for(let i=0;i<questions.length;i++){const q=questions[i];if(!q)continue;const picked=session.selected[String(q.id)]||[];const right=picked.length>0&&isRight(picked,answers(q));if(right)n++;else wrongs.push({id:String(q.id),idx:i,picked});memory.seen[String(q.id)]=1;if(right){memory.correct[String(q.id)]=1;delete memory.wrong[String(q.id)];}else{memory.wrong[String(q.id)]=1;delete memory.correct[String(q.id)];}}
    const total=questions.length,threshold=total===26?22:total===10?8:Math.ceil(total*.85),pass=n>=threshold;
    result={right:n,total,threshold,pass,wrongs,kind:session.quick?'Test rapid':session.fixedIndex===null?'Chestionar generat':`Test ${pad(session.fixedIndex+1)}`};
    memory.history.push({right:n,total,pass,label:result.kind,when:new Date().toLocaleDateString('ro-RO')});memory.history=memory.history.slice(-60);save();
    if(typeof onResult==='function'){try{onResult({pass,right:n,total});}catch(e){console.error('[Pixel School] Reward callback',e);}}
    view='results';renderResults();
  }
  function renderResults(){const r=result;if(!r){home();return;}
    main.innerHTML=`${stateHeader('Rezultatul chestionarului','TEST FINALIZAT','Răspunsurile și rezultatul au fost salvate.')}
    <div class="ps-result ${r.pass?'passed':'failed'}"><span>${r.pass?'✓ PROMOVAT':'✕ NEPROMOVAT'}</span><strong>${r.right}<small> / ${r.total}</small></strong><h2>${r.pass?'Foarte bine!':'Mai ai de exersat.'}</h2><p>${r.pass?'Ai trecut pragul de promovare. +150 credite în joc.':`Ai nevoie de minimum ${r.threshold} răspunsuri corecte pentru a promova.`}</p><div class="ps-hero-actions"><button class="ps-primary" data-act="newexam">Alt chestionar</button><button class="ps-outline" data-act="examhome">Înapoi la chestionare</button></div></div>
    <div class="ps-section-title"><div><h2>Întrebări de revăzut</h2><p>${r.wrongs.length} întrebări greșite sau fără răspuns</p></div></div>
    ${r.wrongs.length?`<div class="ps-review-list">${r.wrongs.map(w=>{const q=byId.get(w.id);return `<button data-act="review" data-id="${esc(w.id)}"><b>Întrebarea ${w.idx+1}</b><span>${esc(q?.question||'Întrebare')}</span><i>Vezi explicația ↗</i></button>`;}).join('')}</div>`:'<p class="ps-empty">Ai răspuns corect la toate întrebările. Felicitări!</p>'}`;
    side();main.scrollTop=0;
  }
  function review(id){const q=byId.get(id);if(!q)return;view='review';const correct=answers(q);
    main.innerHTML=`<div class="ps-toolbar"><button class="ps-textbutton" data-act="results">← Înapoi la rezultate</button></div><div class="ps-question-card"><div class="ps-study-head"><h2>Explicația întrebării</h2><button class="ps-save" data-act="bookmark" data-id="${esc(id)}">${memory.bookmarks[id]?'★':'☆'}</button></div><div class="ps-question-center">${visual(q)}<h3>${esc(q.question)}</h3><div class="ps-answers">${q.answers.map((a,i)=>`<div class="ps-answer ${correct.includes(i)?'correct':''}"><span>${String.fromCharCode(65+i)}</span><em>${esc(a)}</em></div>`).join('')}</div><div class="ps-feedback right"><strong>Răspunsuri corecte</strong><p>${esc(q.explanation||'Verifică sursa întrebării.')}</p></div>${external(q)}</div></div>`;main.scrollTop=0;
  }
  function searchView(term){view='search';const t=reduceText(term.trim());const found=t?items.filter(q=>reduceText(q.question+' '+q.answers.join(' ')).includes(t)).slice(0,75):[];
    main.innerHTML=`${stateHeader('Caută întrebări','BANCĂ DE ÎNTREBĂRI',term?`Rezultate pentru „${term}”`:'Scrie un cuvânt sau o expresie în câmpul de căutare.')}
    <div class="ps-review-list">${found.map(q=>`<button data-act="openquestion" data-id="${esc(q.id)}"><b>${esc(CATS.find(c=>c[0]===categoryMap.get(String(q.id)))?.[1]||'Reguli generale')}</b><span>${esc(q.question)}</span><i>Exersează ↗</i></button>`).join('')}</div>${!found.length?'<p class="ps-empty">Nu am găsit întrebări care să corespundă căutării.</p>':''}`;side();
  }
  function openQuestion(id){const q=byId.get(id);if(!q)return;category=categoryMap.get(id);view='study';session={kind:'search',items:[id],index:0,selected:{},draft:{}};shownResult=false;renderStudy();}
  function close(){clearInterval(ticker);ticker=null;session=null;search.value='';searchTerm='';if(d.open)d.close();}
  d.addEventListener('cancel',e=>{e.preventDefault();close();});
  d.addEventListener('click',e=>{
    const b=e.target.closest('[data-act]');if(!b)return;
    const act=b.dataset.act,id=b.dataset.id,cat=b.dataset.cat,n=Number(b.dataset.n);
    if(act==='close'){close();return;}
    if(act==='home'){view='home';category='all';home();side();return;}
    if(act==='examhome'){view='examhome';examHome();side();return;}
    if(act==='general'){startStudy('all');return;}
    if(act==='category'){startStudy(cat);return;}
    if(act==='resume'){startStudy('all','study',true);return;}
    if(act==='wrong'){startStudy('all','wrong');return;}
    if(act==='bookmarks'){startStudy('all','bookmarks');return;}
    if(act==='select'){setChosen(n);return;}
    if(act==='check'){check();return;}
    if(act==='next'){gotoQuestion(1);return;}
    if(act==='previous'){gotoQuestion(-1);return;}
    if(act==='bookmark'){const k=id||session?.items?.[session.index];if(!k)return; if(memory.bookmarks[k])delete memory.bookmarks[k];else memory.bookmarks[k]=1;save();if(view==='review')review(k);else if(view==='study')renderStudy();else side();return;}
    if(act==='newexam'){newExam();return;}
    if(act==='fixedexam'){newExam(n);return;}
    if(act==='examselect'){setChosen(n);return;}
    if(act==='examprev'){moveExam(session.index-1);return;}
    if(act==='examnext'){moveExam(session.index+1);return;}
    if(act==='examjump'){moveExam(n);return;}
    if(act==='finalize'){finalizeExam();return;}
    if(act==='exitexam'){clearInterval(ticker);session=null;view='examhome';examHome();side();return;}
    if(act==='results'){view='results';renderResults();return;}
    if(act==='review'){review(id);return;}
    if(act==='openquestion'){openQuestion(id);return;}
  });
  search.addEventListener('input',()=>{searchTerm=search.value;searchView(searchTerm);});
  window.PixelSchoolHub={open(options={}){onResult=options.onResult||null;search.value='';view='home';category='all';session=null;result=null;home();side();if(!d.open)d.showModal();main.scrollTop=0;},close,stats:()=>({total:items.length,done:getSeen(items),wrong:items.filter(q=>memory.wrong[String(q.id)]).length,categories:CATS.length})};
})();
