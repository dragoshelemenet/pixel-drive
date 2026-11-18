/* Detailed Viscri architecture: create nearby buildings, release distant GPU/CPU resources. */
(()=>{
function create({T,W,scene,windows}){
 const entries=W.buildings.map(building=>{const bounds=new T.Box3();for(const p of building.points)bounds.expandByPoint(new T.Vector3(p[0],0,p[1]));bounds.max.y=5;bounds.expandByScalar(.7);return{building,bounds,group:null};});
 let built=0,evicted=0;
 const contains=(points,x,z)=>{let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++)if((points[i][1]>z)!==(points[j][1]>z)&&x<(points[j][0]-points[i][0])*(z-points[i][1])/(points[j][1]-points[i][1])+points[i][0])inside=!inside;return inside;};
 function release(e){if(!e.group)return;scene.remove(e.group);for(const g of e.geometries)g.dispose();for(const m of e.materials)m.dispose();for(const m of e.windows){const i=windows.indexOf(m);if(i>=0)windows.splice(i,1);}e.group.clear();e.group=null;e.geometries=e.materials=e.windows=null;evicted++;}
 function construct(e){const group=new T.Group(),localWindows=[],geometries=new Set(),materials=new Set();
  DriveBuildingKit.build({T,scene:group,buildings:[e.building],nearestRoad:W.nearestRoad,windows:localWindows,canPlaceDetail:(x,z)=>!W.roadAt(x,z,-.15)&&!W.buildings.some(b=>b.id!==e.building.id&&contains(b.points,x,z))&&!W.serviceSites.some(site=>{const p=W.serviceSiteLocal([x,z],site);return p.x>-.5&&p.x<10.5&&Math.abs(p.z)<5.5;})});
  group.traverse(o=>{if(o.isMesh){geometries.add(o.geometry);materials.add(o.material);}});
  DriveScenery.batch(group);
  const liveGeometry=new Set();group.traverse(o=>{if(o.isMesh){liveGeometry.add(o.geometry);materials.add(o.material);}});
  for(const g of geometries)if(!liveGeometry.has(g))g.dispose();
  e.group=group;e.geometries=liveGeometry;e.materials=materials;e.windows=localWindows;windows.push(...localWindows);scene.add(group);built++;
 }
 function update(position,frustum,night=0){
  const wanted=[];
  for(const e of entries){const distance=e.bounds.distanceToPoint(position);e.distance=distance;
   if(e.group&&distance>28)release(e);
   const views=Array.isArray(frustum)?frustum:[frustum];const visible=distance<24&&views.some(f=>f.intersectsBox(e.bounds));
   if(e.group)e.group.visible=visible;
   if(visible)wanted.push(e);
  }
  wanted.sort((a,b)=>a.distance-b.distance);
  // One building per frame; no full-village geometry construction or merging.
  const next=wanted.slice(0,48).find(e=>!e.group);if(next)construct(next);
  // Bound retained geometry even in dense parts of the village.
  const loaded=entries.filter(e=>e.group).sort((a,b)=>a.distance-b.distance);
  for(const e of loaded.slice(48))release(e);
  for(const e of entries)if(e.group)for(const m of e.windows)m.emissiveIntensity=night*1.6;
 }
 return{update,dispose:()=>entries.forEach(release),stats:()=>({total:entries.length,resident:entries.filter(e=>e.group).length,visible:entries.filter(e=>e.group?.visible).length,built,evicted})};
}
window.DriveBuildingStream={create};
})();
