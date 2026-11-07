/* Pixel Drive: extensible Romanian road-rule question bank.
   Add new objects to the questions array. Single correct answer for this demo.
   These are original practice questions based on current legislation; not official DRPCIV test items. */
(()=>{
  const questions=[
    {
      id:'ro-stop-001', category:'Indicatoare',
      imageUrl:'https://upload.wikimedia.org/wikipedia/commons/3/3c/RO_road_sign_B02.svg',
      imagePage:'https://commons.wikimedia.org/wiki/File:RO_road_sign_B02.svg',
      imageAlt:'Indicator rutier STOP, octogon roșu cu inscripția STOP',
      imageCredit:'Alex:D · CC BY-SA 3.0',
      fallbackImage:'/nivel-1/sign-assets/stop.svg',
      question:'Ce trebuie să faci când întâlnești indicatorul STOP (Oprire)?',
      answers:['Oprești complet și acorzi prioritate înainte de a porni','Doar reduci viteza dacă intersecția pare liberă','Treci fără oprire dacă ai semnalizat'],
      correct:0,
      explanation:'La indicatorul Oprire trebuie să oprești înainte de linia de oprire, apoi să acorzi prioritate celor care au drept de trecere.',
      source:'HG 1391/2006, reguli de prioritate și oprire',
      url:'https://legislatie.just.ro/Public/DetaliiDocument/79058'
    },
    {
      id:'ro-red-002', category:'Semafoare',
      imageUrl:'https://upload.wikimedia.org/wikipedia/commons/3/3b/Redtrafficlight.svg',
      imagePage:'https://commons.wikimedia.org/wiki/File:Redtrafficlight.svg',
      imageAlt:'Semafor cu lumina roșie aprinsă și luminile galbenă și verde stinse',
      imageCredit:'Open Clip Art · Public domain',
      fallbackImage:'/nivel-1/quiz-images/red-light-fallback.svg',
      question:'Ce semnificație are lumina roșie a semaforului pentru autovehicule?',
      answers:['Poți trece dacă nu vezi alte vehicule','Trecerea este interzisă; trebuie să oprești','Poți trece doar dacă claxonezi'],
      correct:1,
      explanation:'Lumina roșie interzice trecerea. Oprești înainte de marcajul sau locul de oprire.',
      source:'HG 1391/2006, art. 52',
      url:'https://legislatie.just.ro/Public/DetaliiDocument/79058'
    },
    {
      id:'ro-crosswalk-003', category:'Pietoni',
      imageUrl:'https://upload.wikimedia.org/wikipedia/commons/3/34/RO_road_sign_G01.svg',
      imagePage:'https://commons.wikimedia.org/wiki/File:RO_road_sign_G01.svg',
      imageAlt:'Indicator pentru trecere de pietoni, persoană pe marcajul zebra',
      imageCredit:'Gigillo83 · CC BY-SA 4.0',
      fallbackImage:'/nivel-1/sign-assets/crossing.svg',
      question:'Un pieton traversează regulamentar pe trecerea pentru pietoni. Ce faci?',
      answers:['Continui dacă circuli sub limita de viteză','Claxonezi și ocolești pietonul','Acorzi prioritate pietonului și oprești dacă este necesar'],
      correct:2,
      explanation:'Pietonii angajați în traversare regulamentară pe trecerea semnalizată au prioritate de trecere.',
      source:'OUG 195/2002, art. 72',
      url:'https://legislatie.just.ro/Public/DetaliiDocument/74028'
    }
  ];
  function shuffled(){
    const result=[...questions];
    for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
    return result;
  }
  function randomExcept(lastId){
    const choices=questions.filter(q=>q.id!==lastId);
    return (choices.length?choices:questions)[Math.floor(Math.random()*(choices.length||questions.length))];
  }
  window.DriveQuizBank={questions,shuffled,randomExcept};
})();
