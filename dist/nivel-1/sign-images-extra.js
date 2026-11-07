/* Pixel Drive priority road signs — locally drawn educational SVGs. */
(()=>{const map={priorityIntersection:'/nivel-1/sign-assets/priorityIntersection.svg'};
 Object.assign(window.DriveSignImages||(window.DriveSignImages={}),map);
 const bitmaps=window.DriveSignBitmaps||(window.DriveSignBitmaps={});
 if(typeof Image!=='undefined')for(const [kind,src] of Object.entries(map)){
  const img=new Image();img.src=src;bitmaps[kind]=img;
 }
})();
