// Run with Node, three@0.184.0 and jsdom@26 installed for development.
// Real Three.js geometry and camera math; DOM, GPU and texture loading are mocked.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import * as RealThree from 'three';
const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const {createOfferingModels, OFFERING_ART} = await import(pathToFileURL(repo + '/mandala-offerings.js'));
const {TOUR_NOTES} = await import(pathToFileURL(repo + '/mandala-tour.js'));
const html = fs.readFileSync(repo + '/index.html', 'utf8');
const source = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;\n/gm, '');
const dom = new JSDOM(html, {url:'https://example.org/WorldSystem/', runScripts:'outside-only', pretendToBeVisual:true});
const {window} = dom, document = window.document;
const textureRequests = [];
const THREE = {...RealThree, TextureLoader: class {
  load(url, success, progress, failure) { textureRequests.push({url, success, failure}); }
}};
Object.assign(window, {createOfferingModels, OFFERING_ART, TOUR_NOTES});
let viewport = {w:1280, h:900}, reduced = false;
window.matchMedia = query => ({matches:query.includes('reduced-motion') ? reduced
  : query.includes('max-width: 700px') ? viewport.w <= 700
  : query.includes('max-width: 980px') ? viewport.w <= 980 : false});
window.ResizeObserver = class {observe(){} disconnect(){}};
window.localStorage.setItem('ws-hint','1'); window.localStorage.setItem('ws-index','0');
let now = 0, serial = 0, renderLoop = () => {};
const timers = new Map();
window.setTimeout = (fn, delay=0) => {const id=++serial; timers.set(id,{fn,due:now+delay}); return id;};
window.clearTimeout = id => timers.delete(id);
window.requestAnimationFrame = fn => window.setTimeout(()=>fn(now),16);
window.cancelAnimationFrame = window.clearTimeout;
Object.defineProperty(window.performance,'now',{value:()=>now});
function advance(ms) {
  const end=now+ms; let iterations=0;
  while(timers.size) {
    const [id,t] = [...timers].sort((a,b)=>a[1].due-b[1].due)[0];
    if(t.due>end) break;
    assert.ok(iterations++<12000,'Timer loop');
    now=t.due; timers.delete(id); t.fn(); renderLoop();
  }
  now=end; renderLoop();
}
const context2d = new Proxy({}, {get:(t,k)=>t[k] || (k.startsWith('create')?()=>({addColorStop(){}}):()=>{}), set:(t,k,v)=>(t[k]=v,true)});
window.HTMLCanvasElement.prototype.getContext = () => context2d;
const stage = document.querySelector('three-d-stage');
const shadow = stage.attachShadow({mode:'open'}); shadow.appendChild(document.createElement('canvas'));
stage._scene = new THREE.Scene(); stage._camera = new THREE.PerspectiveCamera(42,viewport.w/viewport.h,.01,100);
stage._controls = new THREE.EventDispatcher();
Object.assign(stage._controls,{target:new THREE.Vector3(), touches:{}, update(){
  stage._camera.lookAt(this.target); stage._camera.updateMatrixWorld(true); this.dispatchEvent({type:'change'});
}});
stage._ground = new THREE.Group(); stage._key = new THREE.DirectionalLight(0xffffff,2);
stage._scene.add(stage._ground,stage._key,new THREE.HemisphereLight());
stage._renderer = {shadowMap:{}, setPixelRatio(){}, setAnimationLoop(fn){renderLoop=fn;}, render(scene){scene.updateMatrixWorld(true);}};
stage.setObject = o => stage._scene.add(o); stage.ready = Promise.resolve({THREE});
Object.defineProperties(stage,{clientWidth:{get:()=>viewport.w},clientHeight:{get:()=>viewport.h}});
Object.defineProperties(window,{innerWidth:{get:()=>viewport.w},innerHeight:{get:()=>viewport.h}});
const rect=(x,y,w,h)=>({x,y,left:x,top:y,right:x+w,bottom:y+h,width:w,height:h});
// Representative dock rectangles exercise camera framing, not CSS layout.
const q = s => document.querySelector(s);
q('.panel-dock').getBoundingClientRect = () => viewport.w<=700
  ? rect(9,viewport.h*.46-66,viewport.w-18,viewport.h*.54)
  : rect(viewport.w-428,82,406,viewport.h-166);
q('.controls').getBoundingClientRect = () => viewport.w<=700
  ? rect(9,viewport.h-53,viewport.w-18,44) : rect(viewport.w-430,22,408,40);
q('.masthead').getBoundingClientRect = () => document.body.classList.contains('mandala-view')
  ? rect(0,0,0,0) : rect(22,22,270,50);
const app = await window.eval(`(async()=>{${source}\nreturn {
 world, cam, ctr, E, HEAPS, MARKS, HEAP_MEMBERS, OFFERING_MODELS, ORIGINAL_VISIBILITY,
 STEPS, LUMINARIES, RIM, OFFERING_SIZE, freeRect, meshesFor, visibleInScene,
 setMandala, show, close, setOpen, startTour, visitHeap, endTour, orientOfferingCards,
 applyStep, playToggle, stepBy, pausePlay, resetPlay, applyTheme, setMotion,
 state:()=>({mandala,touring,tourIndex,pStep,playing,current})
};})()`);
advance(1200);
const panels = ['.sheet','.mandala-note','.tour-panel','.index'];
function panel(expected) {
  const visible=panels.filter(s=>!q(s).hidden);
  assert.deepEqual(visible,expected?[expected]:[],'Exactly one panel may be open');
  assert.equal(q('.panel-dock').hidden,!expected);
}
const heaps = () => [...app.HEAP_MEMBERS].filter(([,members])=>members.some(app.visibleInScene)).map(([n])=>n);
assert.equal(app.HEAPS.length,37); assert.equal(TOUR_NOTES.length,37);
assert.equal(app.OFFERING_MODELS.size,24); assert.equal(textureRequests.length,0,'Images are lazy');
panel(null);
const worldVisibility = new Map();
app.world.traverse(o => worldVisibility.set(o, o.visible));
app.setMandala(true); advance(1200); panel('.mandala-note');
const mandalaVisibility = new Map();
app.world.traverse(o => mandalaVisibility.set(o, o.visible));
assert.equal(textureRequests.length,3);
assert.equal(heaps().length,37);
assert.ok(app.LUMINARIES.every(l=>l.objs.every(o=>!o.visible)));
app.OFFERING_MODELS.forEach(model => model.traverse(m => {
  if (m.isMesh) assert.equal(m.material.opacity,0,'No solid placeholder before loading');
}));
// Failed image requests have a visible retry and do not break the tour.
textureRequests[0].failure();
textureRequests[1].success(new THREE.Texture()); textureRequests[2].success(new THREE.Texture());
assert.equal(q('[data-art-retry]').hidden,false);
q('[data-art-retry]').click(); assert.equal(textureRequests.length,4,'Only failed sheet retried');
textureRequests[3].success(new THREE.Texture());
assert.equal(q('.art-status').hidden,true);
let triangles=0;
for(const [id,model] of app.OFFERING_MODELS) {
  let front;
  model.traverse(m=>{
    if(!m.isMesh)return;
    assert.equal(m.name,id);
    const p=m.geometry.attributes.position;
    assert.ok([...p.array].every(Number.isFinite));
    triangles+=(m.geometry.index?.count||p.count)/3;
    if(m.userData.artwork) front=m;
  });
  assert.ok(front?.material.map,'Texture assigned');
  assert.equal(front.material.transparent,true,'Respect image alpha');
  assert.equal(front.material.depthWrite,false,'Transparent canvas cannot occlude neighbours');
  assert.ok(front.material.alphaTest>0,'Discard nearly transparent background pixels');
  assert.equal(front.material.opacity,1,'Loaded artwork is visible');
  assert.equal(front.material.map.colorSpace,THREE.SRGBColorSpace);
  const art=OFFERING_ART.get(id), u=art.cell%4, v=Math.floor(art.cell/4);
  const uv=front.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++) {
    assert.ok(uv.getX(i)>u/4 && uv.getX(i)<(u+1)/4,'Atlas column');
    assert.ok(uv.getY(i)>1-(v+1)/2 && uv.getY(i)<1-v/2,'Atlas row');
  }
  assert.ok(fs.existsSync(fileURLToPath(art.url)),'Local artwork missing');
}
assert.equal(triangles,48,'Only the 24 illustration planes, with no rectangular backings');
// Directions independently transcribed from the existing verified diagram.
const dirs=[[1,0],[0,1],[-1,0],[0,-1],[1,1],[-1,1],[-1,-1],[1,-1],
 [1,1],[-1,1],[-1,-1],[1,-1],[1,0],[0,1],[-1,0],[0,-1],[1,0],[-1,0],[0,1],[0,-1]];
const sign=x=>Math.abs(x)<1e-8?0:Math.sign(x);
app.MARKS.slice(17).forEach((m,i)=>assert.deepEqual([sign(m.p.x),sign(m.p.z)],dirs[i]));
for(let i=0;i<app.STEPS.length;i++) {
 app.applyStep(i);
 assert.deepEqual(heaps(),Array.from({length:app.STEPS[i].laid},(_,j)=>j+1),'Stepwise geometry');
}
app.resetPlay(); assert.equal(heaps().length,37);
app.playToggle(); advance(150000); assert.equal(app.state().playing,false); assert.equal(app.state().pStep,app.STEPS.length-1);
app.startTour(); advance(1200); panel('.tour-panel');
assert.equal(app.state().playing,false); assert.equal(app.state().pStep,-1);
assert.equal(q('#tour-jump').options.length,37);
assert.equal(q('[data-tour="prev"]').disabled,true);
for(const size of [{w:1280,h:900},{w:390,h:844},{w:844,h:390}]) {
 viewport=size; app.cam.aspect=size.w/size.h; app.cam.updateProjectionMatrix();
 for(let i=0;i<37;i++) {
  app.visitHeap(i); advance(1000); panel('.tour-panel');
  assert.equal(app.state().tourIndex,i); assert.equal(q('#tour-jump').value,String(i));
  assert.equal(q('.tour-copy').textContent,TOUR_NOTES[i]);
  assert.equal(app.state().current,app.HEAPS[i][1]);
  assert.equal(app.state().playing,false); assert.deepEqual(heaps(),[i+1],'Only the current heap is shown');
  const selected = new Set(app.HEAP_MEMBERS.get(i+1));
  for (const member of [...selected]) {
    for (let p=member.parent;p;p=p.parent) selected.add(p);
  }
  app.world.traverse(o=>{
    if ((o.isMesh||o.isSprite||o.isLine||o.isPoints)&&app.visibleInScene(o))
      assert.ok(selected.has(o),'No unrelated geometry can obscure the selected heap');
  });
  assert.ok(app.cam.position.toArray().every(Number.isFinite));
  const b=new THREE.Box3(); app.meshesFor(app.HEAPS[i][1]).forEach(m=>b.expandByObject(m));
  const point=b.getCenter(new THREE.Vector3()).project(app.cam), fr=app.freeRect();
  const screen={x:(point.x+.999999)*size.w/2,y:(1-point.y)*size.h/2};
  assert.ok(Math.abs(screen.x-fr.x)<2 && Math.abs(screen.y-fr.y)<2,`Close-up framing ${i+1} at ${size.w}`);
  // Project every selected vertex, including the full billboard after it turns
  // toward the final camera. Require breathing room on all four sides.
  for (const m of app.meshesFor(app.HEAPS[i][1])) {
    const vertices=m.geometry?.attributes.position;
    if(!vertices)continue;
    for(let j=0;j<vertices.count;j++) {
      const v=new THREE.Vector3().fromBufferAttribute(vertices,j).applyMatrix4(m.matrixWorld).project(app.cam);
      const x=(v.x+1)*size.w/2, y=(1-v.y)*size.h/2;
      assert.ok(Math.abs(x-fr.x)<=fr.w*.38 && Math.abs(y-fr.y)<=fr.h*.38,
        `Heap ${i+1} needs a margin at ${size.w}×${size.h}`);
      assert.ok(v.z>-1 && v.z<1,'Selected geometry stays within camera clipping planes');
    }
  }
 }
}
q('[data-tour="entry"]').click(); panel('.sheet');
assert.equal(q('[data-sheet="back"]').textContent,'Back to tour');
q('[data-sheet="back"]').click(); panel('.tour-panel');
app.setOpen(true); panel('.index');
app.setOpen(false); advance(1000); panel('.tour-panel');
app.visitHeap(25); advance(1000);
q('[data-tour="entry"]').click();
assert.equal(q('.entry-art').hidden,false);
assert.match(q('.entry-art > div').getAttribute('aria-label'),/Graceful/);
app.close(); panel('.tour-panel');
window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowRight'}));
assert.equal(app.state().tourIndex,26);
window.dispatchEvent(new window.KeyboardEvent('keydown',{key:'ArrowLeft'}));
assert.equal(app.state().tourIndex,25);
q('#tour-jump').value='36'; q('#tour-jump').dispatchEvent(new window.Event('change'));
assert.equal(q('[data-tour="next"]').textContent,'Finish tour');
q('[data-tour="next"]').click(); advance(1000); panel('.mandala-note');
assert.equal(app.state().touring,false);
assert.equal(heaps().length,37);
mandalaVisibility.forEach((visible,obj)=>assert.equal(obj.visible,visible,'Whole mandala restored'));
app.OFFERING_MODELS.forEach(m=>assert.ok(Math.abs(m.children[0].rotation.x+Math.PI/2)<1e-6));
app.show('emblem_elephant'); panel('.sheet'); app.setOpen(true); panel('.index');
app.setOpen(false); panel('.mandala-note');
app.startTour(14); app.setMotion(true); advance(1000); panel(null);
assert.equal(app.state().mandala,false); assert.equal(app.state().touring,false);
app.setMotion(false); app.applyTheme(true); app.applyTheme(false);
app.ORIGINAL_VISIBILITY.forEach((visible,obj)=>assert.equal(obj.visible,visible,'Original world restored'));
app.OFFERING_MODELS.forEach(m=>assert.equal(app.visibleInScene(m),false));
worldVisibility.forEach((visible,obj)=>assert.equal(obj.visible,visible,'All world context restored'));
reduced=true; app.startTour(20); advance(20); panel('.tour-panel');
assert.equal(app.state().tourIndex,20);
console.log(JSON.stringify({result:'PASS',heaps:37,illustrations:24,triangles,atlasRequests:3,
 checks:'All reveals, full playback, all tour stops at three viewport sizes, projected silhouette margins, heap isolation, exclusive panels, alpha materials, image failure/retry, UV mapping, keyboard controls, reduced motion and full visibility restoration.',
 limits:'DOM and GPU substitutes; actual CSS layout, WebGL rendering and devices were not tested.'},null,2));
