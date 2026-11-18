/* CPU regression tests. Real Three.js geometry; DOM is stubbed, not a visual test. */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'../../dist/nivel-1');
function context(city){
 const store=new Map([['pixel-drive-city',city]]),elements=[];
 function element(tag){const nodes=new Map();return{tag,open:false,dataset:{},style:{},classList:{toggle(){}},append(){},appendChild(){},addEventListener(k,fn){this["on"+k]=fn;},toDataURL(){return "data:image/png;base64,";},setAttribute(){},showModal(){this.open=true},close(){this.open=false},getContext(){return new Proxy({createRadialGradient:()=>({addColorStop(){}}),measureText:()=>({width:100})},{get:(o,k)=>o[k]||(()=>{})});},querySelector(k){if(!nodes.has(k))nodes.set(k,element(k));return nodes.get(k)},querySelectorAll(){return[]},nodes};}
 const doc=element('document');doc.body=element('body');doc.getElementById=()=>null;doc.createElement=tag=>{const e=element(tag);elements.push(e);return e};
 const ctx={console,document:doc,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},performance:{now:()=>10000},Math,Set,Map,Date,Uint8Array,Float32Array,Uint16Array,Uint32Array,setTimeout,clearTimeout,requestAnimationFrame(){},Image:class{}};ctx.window=ctx;vm.createContext(ctx);ctx.load=f=>vm.runInContext(fs.readFileSync(path.join(root,f+'.js'),'utf8'),ctx,{filename:f});ctx.elements=elements;ctx.store=store;return ctx;
}
module.exports={context};
