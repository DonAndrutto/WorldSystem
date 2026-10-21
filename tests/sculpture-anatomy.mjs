// Mesh-level regressions for the rebuilt hands and feet, independent of rendering.
import assert from 'node:assert/strict';
import { ANATOMY } from '../sculpture-anatomy-data.js';
const unpack=(s,Type)=>new Type(Uint8Array.from(Buffer.from(s,'base64')).buffer);
for(const [name,data] of Object.entries(ANATOMY)){
 const p=unpack(data.p,Int16Array),n=unpack(data.n,Int16Array),ix=unpack(data.i,Uint16Array);
 assert.equal(p.length,n.length,name+' normal count');assert.equal(ix.length%3,0);
 const edges=new Map(),adjacency=new Map();let volume=0;
 for(let i=0;i<ix.length;i+=3){
  const tri=Array.from(ix.slice(i,i+3));assert.equal(new Set(tri).size,3,name+' collapsed triangle');
  for(const v of tri)assert.ok(v<p.length/3,name+' index bounds');
  const [a,b,c]=tri.map(v=>Array.from(p.slice(v*3,v*3+3),x=>x/32767));
  volume+=a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]);
  for(let j=0;j<3;j++){
   const a=tri[j],b=tri[(j+1)%3],key=a<b?a+','+b:b+','+a;
   edges.set(key,(edges.get(key)||0)+1);
   if(!adjacency.has(a))adjacency.set(a,new Set());adjacency.get(a).add(b);
   if(!adjacency.has(b))adjacency.set(b,new Set());adjacency.get(b).add(a);
  }
 }
 for(const count of edges.values())assert.equal(count,2,name+' must be a closed manifold');
 const seen=new Set(),pending=[ix[0]];
 while(pending.length){const v=pending.pop();if(seen.has(v))continue;seen.add(v);for(const next of adjacency.get(v))if(!seen.has(next))pending.push(next);}
 assert.equal(seen.size,adjacency.size,name+' fingers/toes must stay connected to the palm/foot');
 assert.ok(volume>0,name+' outward winding');
 for(let i=0;i<n.length;i+=3)assert.ok(Math.abs(Math.hypot(n[i],n[i+1],n[i+2])/32767-1)<.001,name+' unit normals');
 assert.equal(data.nails.length,5,name+' has five nail placements');
 for(const nail of data.nails){assert.ok([...nail.center,...nail.normal,...nail.tangent,nail.width,nail.length].every(Number.isFinite));assert.ok(nail.width>0&&nail.length>0);}
 assert.ok(ix.length/3<(name.endsWith('-game')?6500:20000),name+' anatomy mesh budget');
 console.log('  ok ',name,'closed, connected, outward, five nail placements;',ix.length/3,'triangles');
}
console.log(Object.keys(ANATOMY).length+' anatomy meshes passed.');
