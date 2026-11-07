(()=>{
const modes=['all','off','essential'],names={all:'Toate',off:'Ascuns',essential:'Esențial'};let mode='all';
const b=document.createElement('button');b.id='hud-toggle';b.type='button';b.title='H · ascunde interfața / esențial / toate';document.body.appendChild(b);
function apply(){document.body.dataset.hud=mode;b.textContent='H · '+names[mode];b.setAttribute('aria-label','Interfață: '+names[mode]+'. Apasă pentru modul următor.');window.dispatchEvent(new Event('drivehudchange'));}
function cycle(){mode=modes[(modes.indexOf(mode)+1)%modes.length];apply();}
b.onclick=cycle;window.addEventListener('keydown',e=>{if(e.code==='KeyH'&&!e.repeat&&!e.target.closest?.('input,textarea,select,[contenteditable=true]')){e.preventDefault();cycle();}});window.DriveHUD={mode:()=>mode,cycle};apply();
})();
