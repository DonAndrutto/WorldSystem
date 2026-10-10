// Isolated real-WebGL check: shader instancing, rendered count and GPU disposal.
import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const pw=require(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const kind=process.env.WORLDSYSTEM_BROWSER || 'chromium';
const browser=await pw[kind].launch({headless:true,...(kind==='chromium'?{channel:'chrome'}:{})});
const width=Number(process.env.WORLDSYSTEM_WIDTH)||900, height=width<600?340:700;
const url=process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4174/';
try {
 const page=await browser.newPage({viewport:{width,height},serviceWorkers:'block'}), errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('console',m=>{if(m.type()==='error' && /THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
 // A small resource establishes the origin without starting the full app.
 await page.goto(new URL('/data/city-zones.json',url).href);
 await page.setContent('<body style="margin:0;background:#071325"></body>');
 const result=await page.evaluate(async({width,height})=>{
  const THREE=await import('/vendor/three@0.184.0/build/three.module.js');
  const {createThousandWorlds,framingDistance}=await import('/thousand-worlds.js');
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
  renderer.setSize(width,height);document.body.append(renderer.domElement);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(45,width/height,0.1,1e6);
  scene.background=new THREE.Color('#071325');scene.add(new THREE.HemisphereLight(0xffffff,0x445566,2));
  const cosmos=createThousandWorlds(THREE,{span:3.7,centre:[0,0,0],rim:1.15,floor:-0.2,summit:0.68,spireTop:1.5});scene.add(cosmos.group);
  const samples=[];
  for(const level of [1,0,3,2,1,0,3,2,1,0,3]) {
   cosmos.setLevel(level,{instant:true});
   const L=cosmos.levels[Math.max(0,level-1)],c=new THREE.Vector3(...L.centre);
   camera.position.copy(c).add(new THREE.Vector3(1,0.78,1.25).normalize().multiplyScalar(framingDistance(L.radius,{height,rect:{w:width,h:height}})));
   camera.lookAt(c);camera.updateProjectionMatrix();renderer.render(scene,camera);
   samples.push({level,points:renderer.info.render.points,...renderer.info.memory});
  }
  return samples;
 },{width,height});
 // MeshStandardMaterial initializes Three's renderer-owned DFG lookup texture.
 // Compare with the empty scene after that one-time warmup.
 const baselineTextures=result[1].textures;
 for(const sample of result) {
  if(sample.level>=2)assert.equal(sample.points,1e6,'GPU draws the whole instanced million');
  if(sample.level===0){assert.equal(sample.geometries,0,'all world geometries released');assert.equal(sample.textures,baselineTextures,'all sprite textures released');}
 }
 assert.deepEqual(result[2],result.at(-1),'repeated navigation does not grow GPU resource counts');
 assert.deepEqual(errors,[]);
 await page.screenshot({path:join(tmpdir(),'main-billion-worlds-'+kind+'-'+width+'.png')});
 console.log('PASS',kind,JSON.stringify(result));
} finally {await browser.close();}
