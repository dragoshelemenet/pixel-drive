/* Only recipes/bounds exist for distant roads, land, vegetation and service lots. */
(()=>{
function create({T,scene,recipes,retainMaterials=[]}){
 const cells=new Map(),size=8,clock=()=>performance.now();let built=0,evicted=0,lastBuildMs=0;
 for(const recipe of recipes){const center=recipe.bounds.getCenter(new T.Vector3()),key=Math.floor(center.x/size)+','+Math.floor(center.z/size);let cell=cells.get(key);if(!cell){cell={bounds:new T.Box3(),recipes:[],group:null,lastSeen:0};cells.set(key,cell);}cell.bounds.union(recipe.bounds);cell.recipes.push(recipe);}
 const resident=new Set();
 function release(cell){scene.remove(cell.group);const geometry=new Set();cell.group.traverse(o=>{if(o.isMesh)geometry.add(o.geometry);});for(const g of geometry)g.dispose();for(const m of cell.ownedMaterials)m.dispose();for(const t of cell.ownedTextures)t.dispose();cell.group.clear();cell.group=null;cell.ownedMaterials=cell.ownedTextures=null;resident.delete(cell);evicted++;}
 function build(cell){const start=clock(),group=new T.Group(),privateMaterials=new Set(),privateTextures=new Set();for(const recipe of cell.recipes){const part=new T.Group();recipe.build(part);if(recipe.ownMaterials)part.traverse(o=>{if(o.isMesh&&!retainMaterials.includes(o.material)){privateMaterials.add(o.material);if(o.material.map)privateTextures.add(o.material.map);}});for(const o of [...part.children])group.add(o);}
  const originalGeometry=new Set(),sharedMaterials=new Set();group.traverse(o=>{if(o.isMesh){originalGeometry.add(o.geometry);sharedMaterials.add(o.material);}});
  DriveScenery.batch(group);const live=new Set(),owned=new Set();group.traverse(o=>{if(o.isMesh){live.add(o.geometry);if(!sharedMaterials.has(o.material))owned.add(o.material);}});
  for(const g of originalGeometry)if(!live.has(g))g.dispose();
  for(const m of privateMaterials)owned.add(m);
  cell.group=group;cell.ownedMaterials=owned;cell.ownedTextures=privateTextures;scene.add(group);resident.add(cell);built++;lastBuildMs=clock()-start;
 }
 function update(position,frustums){const now=clock(),wanted=[];
  for(const cell of cells.values()){const distance=cell.bounds.distanceToPoint(position),visible=distance<3||(distance<30&&frustums.some(f=>f.intersectsBox(cell.bounds)));
   if(cell.group){cell.group.visible=visible;if(visible)cell.lastSeen=now;else if(distance>38||now-cell.lastSeen>4000)release(cell);}
   if(visible)wanted.push({cell,distance});
  }
  wanted.sort((a,b)=>a.distance-b.distance);
  const start=clock();let count=0;
  for(const {cell,distance} of wanted){if(cell.group)continue;build(cell);cell.lastSeen=now;count++;if(distance>=3&&(count>=2||clock()-start>3))break;}
  if(resident.size>96){const far=[...resident].sort((a,b)=>b.bounds.distanceToPoint(position)-a.bounds.distanceToPoint(position));for(const cell of far.slice(0,resident.size-96))release(cell);}
 }
 return{update,dispose:()=>[...resident].forEach(release),stats:()=>({total:cells.size,resident:resident.size,visible:[...resident].filter(c=>c.group.visible).length,built,evicted,lastBuildMs})};
}
window.DriveRegionStream={create};
})();
