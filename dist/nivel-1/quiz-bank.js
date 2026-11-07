/* Pixel Drive questions — RoDrive CC BY-SA 4.0, batch is loaded next. */
(()=>{
 const questions=[];
 function shuffled(){const a=questions.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
 function randomExcept(lastId){if(!questions.length)return null;const a=questions.filter(q=>q.id!==lastId);return (a.length?a:questions)[Math.floor(Math.random()*(a.length||questions.length))];}
 window.DriveQuizBank={questions,shuffled,randomExcept};
})();
