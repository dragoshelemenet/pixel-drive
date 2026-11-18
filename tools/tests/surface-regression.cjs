/* Geometry checks for terrain texture continuity and streamed road paint. */
const {context}=require('./game-context.cjs'),assert=require('assert');
const c=context('viscri');for(const f of ['three.min','surfaces','scenery','maps/building-kit','maps/real-scenery'])c.load(f);
const T=c.THREE;
const make=(surface='sett',oneway='',junctions=[])=>({mapData:{areas:[],buildings:[]},roads:[{type:'residential',surface,oneway,width:1.1,points:[[0,0],[20,0]]}],footways:[],junctions,nearestRoad:()=>null,serviceSites:[],roadAt:()=>false});
const build=(W,stream=false)=>{const scene=new T.Scene(),art=c.DriveRealScenery.build({W,scene,windows:[],deferBuildings:true,stream});return{scene,art};};
const spans=scene=>scene.children.filter(o=>o.userData.surface==='marking').map(o=>{const b=new T.Box3().setFromObject(o);return{lo:b.min.x,hi:b.max.x,z:(b.min.z+b.max.z)/2};});
const {scene}=build(make()),paint=spans(scene),center=paint.filter(p=>Math.abs(p.z)<.001);
assert(center.length>15);assert(paint.some(p=>p.z>.4)&&paint.some(p=>p.z<-.4));
for(let x=.031;x<20;x+=.071){const phase=x%1.2;if(Math.min(phase,1.2-phase,Math.abs(phase-.55))<1e-5)continue;assert.equal(center.some(p=>p.lo<=x&&p.hi>=x),phase<.55,'continuous dash phase at '+x);}
const streamed=build(make(),true);assert.equal(streamed.scene.children.length,0);
for(const recipe of streamed.art.recipes)recipe.build(streamed.scene);
assert.deepEqual(spans(streamed.scene),paint,'streamed/direct paint matches');
assert.equal(spans(build(make('gravel')).scene).length,0,'no paint on dirt roads');
assert(!spans(build(make('sett','yes')).scene).some(p=>Math.abs(p.z)<.001),'no opposing-lane line on one-way roads');
assert(!spans(build(make('sett','',[{x:10,z:0,type:'right'}])).scene).some(p=>p.lo<10&&p.hi>10),'intersection left open');
const W=make();W.roads=[];W.mapData.areas=[{type:'grass',points:[[1,1],[26,1],[26,26],[1,26]]}];
const land=build(W).scene;assert(land.children.length>1);
for(const mesh of land.children){assert.equal(mesh.material.map,c.DriveSurfaces.textures.grass);mesh.updateMatrixWorld(true);const ps=mesh.geometry.attributes.position,uv=mesh.geometry.attributes.uv;
 for(let i=0;i<ps.count;i++){const p=new T.Vector3().fromBufferAttribute(ps,i).applyMatrix4(mesh.matrixWorld);assert(Math.abs(uv.getX(i)-p.x/3)<1e-5);assert(Math.abs(uv.getY(i)-p.z/3)<1e-5);}
}
console.log(JSON.stringify({paintPieces:paint.length,terrainTiles:land.children.length,checks:'continuous textures, dash phase, streaming, one-way, dirt and junctions passed'}));
