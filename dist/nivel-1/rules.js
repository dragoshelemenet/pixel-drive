(() => {
 const W=window.DriveWorld;
 const ROAD='https://legislatie.just.ro/Public/DetaliiDocumentAfis/74028';
 const REG='https://legislatie.just.ro/Public/DetaliiDocument/268632';
 const topics={
  children:{title:'Copii',text:'Avertizează asupra unui sector frecventat de copii. Redu viteza, urmărește trotuarele și fii pregătit să oprești. Nu presupune că un copil te-a observat.',source:'HG 1391/2006 · art. 123(g)',url:REG},
  roadworks:{title:'Lucrări',text:'Urmează o zonă de lucrări. Încetinește și respectă semnalizarea temporară, balizele și eventualele indicații ale personalului autorizat.',source:'HG 1391/2006 · semnalizarea lucrărilor',url:REG},
  slippery:{title:'Drum lunecos',text:'Aderența poate fi redusă. Mărește distanța, redu viteza înainte de sector și evită accelerările, frânările sau virajele bruște.',source:'OUG 195/2002 · art. 48',url:ROAD},
  bump:{title:'Drum cu denivelări',text:'Urmează un sector cu denivelări. Redu viteza înainte de el și păstrează controlul direcției. Nu confunda acest semn cu cel pentru o singură denivelare artificială.',source:'HG 1391/2006 · art. 123(f)',url:REG},
  drive:{title:'Condu pe partea dreaptă',text:'Păstrează banda, distanța față de mașina din față și o viteză care îți permite să oprești. A/D virează în mers; Q/E semnalizează.',source:'OUG 195/2002 · art. 41, 48, 54',url:ROAD},
  right:{title:'Intersecție nedirijată · prioritate de dreapta',text:'În această intersecție, drumurile au aceeași categorie. Redu viteza la cel mult 30 km/h și acordă prioritate vehiculelor din dreapta. Nu intra dacă blochezi intersecția.',source:'OUG 195/2002 · art. 56–59; HG 1391/2006 · art. 123(a)',url:REG},
  stop:{title:'STOP · oprire completă',text:'Oprește complet înainte de linia STOP. Asigură-te și acordă prioritate traficului de pe drumul transversal. Încetinirea singură nu este suficientă.',source:'HG 1391/2006 · art. 129',url:REG},
  yield:{title:'Cedează trecerea',text:'Redu viteza și lasă să treacă vehiculele de pe drumul prioritar. Oprește când este necesar; dacă drumul este liber, poți continua în siguranță.',source:'HG 1391/2006 · art. 129',url:REG},
  priorityIntersection:{title:'Intersecție cu drum fără prioritate',text:'Indicatorul triunghiular avertizează că urmează un drum secundar. Vehiculele de pe drumul secundar au STOP sau Cedează trecerea. Rămâi atent și asigură-te chiar când ai prioritate.',source:'Regulamentul semnalizării rutiere · indicatoare de prioritate',url:REG},
  priority:{title:'Drum cu prioritate',text:'Ai prioritate față de drumurile semnalizate cu STOP sau Cedează. Asigură-te totuși. La viraj la stânga, acordă prioritate traficului din sens opus cu care te intersectezi.',source:'OUG 195/2002 · art. 54, 59',url:ROAD},
  roundabout:{title:'Sens giratoriu · cedează la intrare',text:'Acordă prioritate vehiculelor aflate deja în giratoriu. Urmează sensul săgeților. La ieșire, semnalizează dreapta și asigură-te. Aici este o singură bandă.',source:'OUG 195/2002 · art. 57(4); HG 1391/2006 · art. 107(1¹)',url:REG},
  crossing:{title:'Trecere pentru pietoni',text:'Acordă prioritate pietonilor care traversează regulamentar pe sensul tău de mers. Încetinește și fii pregătit să oprești când cineva intenționează să traverseze.',source:'HG 1391/2006 · art. 123(h), 135(h)',url:REG},
  red:{title:'Roșu · oprește înainte de linie',text:'Semnalul roșu interzice trecerea. Așteaptă înainte de marcaj. Nu intra în intersecție și nu opri pe trecerea de pietoni.',source:'HG 1391/2006 · art. 52',url:REG},
  yellow:{title:'Galben · pregătește oprirea',text:'Oprește înainte de marcaj. Excepția este situația în care ești atât de aproape la apariția galbenului încât nu mai poți opri în siguranță.',source:'HG 1391/2006 · art. 53',url:REG},
  green:{title:'Verde · poți continua dacă este liber',text:'Verdele permite trecerea, dar nu intrarea într-o intersecție blocată. La viraj, asigură-te și acordă prioritate participanților care au acest drept.',source:'HG 1391/2006 · art. 51; OUG 195/2002 · art. 57',url:REG},
  limit30:{title:'Limită de viteză · 30 km/h',text:'Nu depăși 30 km/h pe sectorul semnalizat. Limita este un maxim; traficul, vizibilitatea sau pietonii pot cere o viteză mai mică.',source:'OUG 195/2002 · art. 48–49',url:ROAD},
  limit50:{title:'Limită de viteză · 50 km/h',text:'Nu depăși 50 km/h pe sectorul semnalizat. Redu viteza suplimentar înaintea intersecțiilor, trecerilor și virajelor.',source:'OUG 195/2002 · art. 48–49',url:ROAD},
  parking:{title:'Oprire, staționare și parcare',text:'Oprire înseamnă să stai cel mult 5 minute. Peste 5 minute se numește staționare. Parcarea se face într-un spațiu amenajat sau semnalizat pentru asta.',source:'OUG 195/2002 · art. 63',url:ROAD},
  noStopping:{title:'Oprirea interzisă',text:'Nu opri voluntar aici nici pentru câteva secunde. Caută o zonă în care oprirea este permisă.',source:'HG 1391/2006 · art. 142',url:REG},
  noParking:{title:'Staționarea interzisă',text:'Nu lăsa mașina aici mai mult de 5 minute. O oprire scurtă poate fi permisă doar dacă nu există și altă interdicție și nu încurci traficul.',source:'OUG 195/2002 · art. 63; HG 1391/2006 · art. 143',url:REG},
  busStop:{title:'Stație de autobuz',text:'Stația este pentru transportul public. Cu mașina personală nu opri în stație și nici la mai puțin de 25 m înainte sau după ea.',source:'HG 1391/2006 · art. 142(g)',url:REG},
  pickup:{title:'Preluare pasager',text:'Oprește complet în refugiul marcat, fără să blochezi banda. Apasă I pentru a prelua pasagerul.',source:'OUG 195/2002 · art. 63',url:ROAD},
  dropoff:{title:'Lasă pasagerul',text:'Oprește complet în zona marcată și asigură-te că pasagerul poate coborî fără să fie în pericol. Apasă I pentru a-l lăsa.',source:'OUG 195/2002 · art. 63',url:ROAD}
 };
 function aheadJunction(p){const d=W.heading(p.angle),v=W.V[d];return W.junctions.map(j=>({j,d,a:(j.x-p.x)*v.x+(j.z-p.z)*v.z,l:Math.abs((j.x-p.x)*v.z-(j.z-p.z)*v.x)})).filter(t=>t.a>-.9&&t.a<12&&t.l<2.5).sort((a,b)=>a.a-b.a)[0];}
 function context(s){
  const p=s.player,d=W.heading(p.angle),v=W.V[d];
  const landmark=W.landmarks?.map(l=>({l,distance:Math.hypot(l.x-p.x,l.z-p.z)})).filter(x=>x.distance<4.5).sort((a,b)=>a.distance-b.distance)[0];
  if(landmark){const key=landmark.l.kind==='busStop'?'busStop':landmark.l.kind;return {...topics[key],key,distance:landmark.distance,landmark:landmark.l};}
  const round=W.roundabouts.find(j=>Math.hypot(j.x-p.x,j.z-p.z)<5.8);
  if(round){const dist=Math.hypot(round.x-p.x,round.z-p.z);return {...topics.roundabout,title:dist<4?'În giratoriu · semnalizează ieșirea':topics.roundabout.title,key:'roundabout',distance:Math.max(0,dist-4),j:round};}
  const ped=s.pedestrians.find(t=>t.crossing&&(t.x-p.x)*v.x+(t.z-p.z)*v.z>0&&Math.hypot(t.x-p.x,t.z-p.z)<5);
  if(ped)return {...topics.crossing,key:'crossing',distance:Math.hypot(ped.x-p.x,ped.z-p.z)};
  const near=aheadJunction(p);
  if(near){let key=near.j.type;if(key==='signal')key=W.light(near.j,near.d,s.time);else if((key==='stop'||key==='yield')&&d%2)key=W.signs.some(q=>q.kind==='priorityIntersection'&&q.j===near.j.id&&q.d===d)?'priorityIntersection':'priority';return {...topics[key],key,j:near.j,d,distance:Math.max(0,near.a-2.5)};}
  const sign=W.signs.filter(t=>t.d===d&&(t.x-p.x)*v.x+(t.z-p.z)*v.z>0&&Math.hypot(t.x-p.x,t.z-p.z)<8).sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z))[0];
  if(sign)return {...topics[sign.kind],key:sign.kind,distance:Math.hypot(sign.x-p.x,sign.z-p.z)};
  return {...topics.drive,key:'drive',distance:null};
 }
 window.DriveRules={topics,aheadJunction,context};
})();
