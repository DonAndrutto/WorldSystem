import fs from 'node:fs';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const ranged=new Function(source.slice(source.indexOf('async function ranged('),source.indexOf('async function asset('))+';return ranged;')();
const bytes=Uint8Array.from({length:1000},(_,i)=>i%256);
const response=()=>new Response(bytes,{headers:{'Content-Type':'audio/mpeg'}});
async function check(range,start,end){
  const result=await ranged(response(),new Request('https://example.org/track.mp3',{headers:{Range:range}}));
  assert.equal(result.status,206);assert.equal(result.headers.get('content-type'),'audio/mpeg');
  assert.equal(result.headers.get('content-range'),`bytes ${start}-${end}/1000`);
  assert.deepEqual(new Uint8Array(await result.arrayBuffer()),bytes.slice(start,end+1));
}
await check('bytes=100-199',100,199);await check('bytes=900-',900,999);
await check('bytes=-100',900,999);await check('bytes=900-2000',900,999);
for(const range of ['bytes=1000-','bytes=900-100','bytes=-0']) {
  const result=await ranged(response(),new Request('https://example.org/track.mp3',{headers:{Range:range}}));
  assert.equal(result.status,416);assert.equal(result.headers.get('content-range'),'bytes */1000');
}
const held=response();assert.equal(await ranged(held,new Request('https://example.org/track.mp3')),held);
console.log('PASS: cached audio byte ranges, suffixes, open ends, limits and unsatisfiable requests.');
