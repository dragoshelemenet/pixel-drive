/* v50: show the road-sign artwork inline for questions that actually ask about a sign.
   Source page URLs remain unchanged. Never replace composite traffic diagrams. */
(()=>{
 'use strict';
 const bank=window.DriveQuizBank;if(!bank)return;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const imgs={
  priorityIntersection:'priorityIntersection.svg',rightEqual:'equalIntersection.svg',
  stop:'stop.svg',yield:'yield.svg',priority:'priority.svg',
  noStopping:'noStopping.svg',noParking:'noParking.svg',
  crossing:'crossing.svg',children:'children.svg',roadworks:'roadworks.svg',
  slippery:'slippery.svg',bump:'bump.svg',roundabout:'roundabout.svg',
  limit30:'limit30.svg',limit50:'limit50.svg',noMopeds:'noMopeds.svg',
  railNoBarrier:'railNoBarrier.svg'
 };
 const rules=[
  ['priorityIntersection',/intersectie cu (un )?drum fara prioritate|drum secundar.*fara prioritate/],
  ['rightEqual',/intersectie nedirijata de doua drumuri de aceeasi categorie|intersectie a drumurilor de aceeasi categorie|indicator.*(x negru|cruce neagra)/],
  ['noMopeds',/indicator.*(moped|interzicerea accesului.*moped)|accesul mopedelor/],
  ['railNoBarrier',/trecere la nivel cu (o )?calea ferata fara bariere|indicator.*(tren|cale ferata fara bariere)/],
  ['stop',/indicator.*\bstop\b|indicator.*\boprire\b/],
  ['yield',/cedeaza trecerea/],
  ['noStopping',/oprirea interzisa/],['noParking',/stationarea interzisa/],
  ['priority',/drum cu prioritate/],
  ['children',/indicator.*copii|zona frecventata de copii/],
  ['crossing',/indicator.*trecere (pentru )?pietoni/],
  ['roundabout',/indicator.*sens giratoriu/],
  ['roadworks',/indicator.*lucrari/],['slippery',/indicator.*(carosabil alunecos|drum lunecos)/],
  ['bump',/indicator.*denivelari/],
  ['limit30',/indicator.*(limitare|limita).*30\b/],
  ['limit50',/indicator.*(limitare|limita).*50\b/]
 ];
 let improved=0;
 for(const q of bank.questions){
  const question=norm(q.question),description=norm(q.imageDescription);
  // Only simplify a picture if the question is specifically about recognising a road sign.
  if(!/(indicator|semn|regula de trecere la intalnirea)/.test(question))continue;
  if(/panou aditional|in ce ordine|traseu|autovehiculul rosu|semafoare/.test(question))continue;
  // Multiple signs or extra panels can alter the correct answer: retain the full traffic image.
  if(/panou(ri)? aditional(e)?|mai multe indicatoare/.test(description))continue;
  let matched=null;
  for(const [type,rx] of rules){if(rx.test(description)){matched=type;break;}}
  if(!matched){
   const correct=(q.correctIndices?.length?q.correctIndices:[q.correct]);
   const option=norm((correct||[]).map(i=>q.answers?.[i]).join(' '));
   for(const [type,rx] of rules){if(rx.test(option)){matched=type;break;}}
  }
  if(!matched)continue;
  const target='/nivel-1/sign-assets/'+imgs[matched];
  if(!target||target===q.imageUrl)continue;
  // Preserve the external question link and the old reference image for review.
  q.originalIllustration=q.imageUrl;
  q.imageUrl=target;q.fallbackImage=target;
  q.imageAlt='Indicator rutier ilustrat în Pixel Drive';
  q.imageCredit='Ilustrație indicator · Pixel Drive';
  q.imagePage='';
  q.inlineSign=matched;
  improved++;
 }
 console.info('[Pixel Drive] Actual road-sign illustrations in quizzes:',improved);
 window.DriveSignQuestionCount=improved;
})();
