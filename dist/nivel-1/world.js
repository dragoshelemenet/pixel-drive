(() => {
  const SIZE=112, HALF=1.6, LANE=.78, AXES=[8,24,40,56,72,88,104,-8];
  const V=[{x:0,z:-1},{x:1,z:0},{x:0,z:1},{x:-1,z:0}];
  const roundKeys=new Set(['2,2','4,4','1,5']);
  const junctions=[];
  for(let row=0;row<7;row++)for(let col=0;col<7;col++){
    let type=roundKeys.has(`${col},${row}`)?'roundabout':(col+row)%5===0?'signal':(col+row)%5===1?'stop':(col+row)%5===2?'yield':'right';
    if(col===1&&row===0)type='stop';if(col===1&&row===1)type='signal';
    junctions.push({id:`j${col}-${row}`,col,row,x:AXES[col],z:AXES[row],type,offset:(col*3+row*5)%16});
  }
  for(let row=0;row<7;row++)junctions.push({id:'west-'+row,col:-1,row,x:-8,z:8+row*16,type:'right',offset:0});
  const right=d=>({x:-V[d].z,z:V[d].x});
  const neighbor=(j,d)=>{const n=junctions.find(n=>n.col===j.col+V[d].x&&n.row===j.row+V[d].z);return n&&j.x===8&&n.x===8&&Math.min(j.z,n.z)===24?undefined:n;};
  const roundabouts=junctions.filter(j=>j.type==='roundabout');
  const signs=[];
  const services=[{name:'Școala auto',x:24.8,z:32,type:'school'},{name:'Benzinărie',x:40.8,z:64,type:'fuel'},{name:'Salon auto',x:72.8,z:48,type:'cars'},{name:'Atelier personalizare',x:88.8,z:64,type:'custom'},{name:'Poligon',x:14,z:30,type:'training'}];
  const parkingBays=[
    {id:'pickup-bay',x:26.8,z:14.5,w:3.2,h:4.2,kind:'pickup'},
    {id:'dropoff-bay',x:42.8,z:32.5,w:3.2,h:3.8,kind:'dropoff'},
    {id:'public-parking',x:42.8,z:49,w:3.2,h:4.8,kind:'parking'}
  ];
  const landmarks=[
    {id:'pickup',kind:'pickup',name:'Punct de preluare',x:26.8,z:14.5},
    {id:'dropoff',kind:'dropoff',name:'Destinația pasagerului',x:42.8,z:32.5},
    {id:'parking',kind:'parking',name:'Parcare marcată',x:42.8,z:49},
    {id:'bus-stop',kind:'busStop',name:'Stație de autobuz',x:58.2,z:80}
  ];
  function add(kind,x,z,d,j=null){signs.push({id:`s${signs.length}`,kind,x,z,d,j});}
  for(const j of junctions)for(let d=0;d<4;d++)if(neighbor(j,(d+2)%4)){
    const v=V[d],r=right(d),dist=j.type==='roundabout'?4.7:j.type==='signal'?4.6:3.1;
    const kind=j.type==='right'?'crossing':j.type==='signal'?'crossing':d%2===0?j.type:j.type==='roundabout'?'roundabout':'priority';
    add(kind,j.x-v.x*dist+r.x*2.05,j.z-v.z*dist+r.z*2.05,d,j.id);
  }
  for(let i=0;i<6;i++){
    add(i%2?'limit50':'limit30',AXES[i]+2.05,AXES[i]+(i===1?11.5:8),0);
    add('parking',AXES[i]+8,AXES[(i+2)%7]+2.05,1);
  }
  for(const [kind,x,z] of [['children',56,32],['roadworks',72,64],['slippery',88,80],['bump',40,96],['children',24,64],['roadworks',56,96],['slippery',104,48],['bump',8,80]]){add(kind,x+2.35,z+2,0);add('limit30',x+2.35,z-1,0);}
  add('noStopping',42.05,51,0);
  add('noParking',80,37.95,3);
  function roadAt(x,z,margin=0){
    if(x<-9.6+margin||x>105.6-margin||z<6.4+margin||z>105.6-margin)return false;
    if(parkingBays.some(b=>x>=b.x-b.w/2+margin&&x<=b.x+b.w/2-margin&&z>=b.z-b.h/2+margin&&z<=b.z+b.h/2-margin))return true;
    for(const j of roundabouts){const d=Math.hypot(x-j.x,z-j.z);if(d<1.85+margin)return false;if(d<4.1-margin)return true;}
    return (z>=8&&z<=104&&AXES.some(a=>Math.abs(x-a)<HALF-margin))||(x>=-8&&x<=104&&AXES.some(a=>Math.abs(z-a)<HALF-margin))||junctions.some(j=>Math.abs(x-j.x)<HALF-margin&&Math.abs(z-j.z)<HALF-margin);
  }
  function light(j,d,time){const p=(time+j.offset)%32;if(p>=24)return'red';const start=d%2===0?0:12;return p>=start&&p<start+9?'green':p>=start+9&&p<start+11?'yellow':'red';}
  function pedGreen(j,time){return (time+j.offset)%32>=24;}
  const heading=a=>((Math.round((a+Math.PI/2)/(Math.PI/2))%4)+4)%4;
  window.DriveWorld={SIZE,HALF,LANE,AXES,V,right,neighbor,junctions,roundabouts,signs,services,landmarks,parkingBays,roadAt,light,pedGreen,heading};
})();
