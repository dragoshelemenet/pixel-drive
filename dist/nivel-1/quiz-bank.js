/* Pixel Drive: extensible Romanian road-rule question bank.
   Add new objects to the questions array. Single correct answer for this demo.
   These are original practice questions based on current legislation; not official DRPCIV test items. */
(()=>{
  const questions=[
    {
      id:'ro-stop-001', category:'Indicatoare',
      question:'Ce trebuie să faci când întâlnești indicatorul STOP (Oprire)?',
      answers:['Oprești complet și acorzi prioritate înainte de a porni','Doar reduci viteza dacă intersecția pare liberă','Treci fără oprire dacă ai semnalizat'],
      correct:0,
      explanation:'La indicatorul Oprire trebuie să oprești înainte de linia de oprire, apoi să acorzi prioritate celor care au drept de trecere.',
      source:'HG 1391/2006, art. 81 alin. (1)',
      url:'https://legislatie.just.ro/Public/DetaliiDocument/264861'
    },
    {
      id:'ro-red-002', category:'Semafoare',
      question:'Ce semnificație are lumina roșie a semaforului pentru autovehicule?',
      answers:['Poți trece dacă nu vezi alte vehicule','Trecerea este interzisă; trebuie să oprești','Poți trece doar dacă claxonezi'],
      correct:1,
      explanation:'Lumina roșie interzice trecerea. Oprești înainte de marcajul sau locul de oprire.',
      source:'OUG 195/2002, art. 30 alin. (3)',
      url:'https://legislatie.just.ro/Public/DetaliiDocument/74028'
    },
    {
      id:'ro-crosswalk-003', category:'Pietoni',
      question:'Un pieton traversează regulamentar pe trecerea pentru pietoni. Ce faci?',
      answers:['Continui dacă circuli sub limita de viteză','Claxonezi și ocolești pietonul','Acorzi prioritate pietonului și oprești dacă este necesar'],
      correct:2,
      explanation:'Pietonii angajați în traversare regulamentară pe trecerea semnalizată au prioritate de trecere.',
      source:'OUG 195/2002, art. 72 alin. (2)',
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
