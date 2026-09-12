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
const {installViewportGestures} = await import(pathToFileURL(repo + '/viewport-gestures.js'));
const surfaces = await import(pathToFileURL(repo + '/world-surfaces.js'));
const skyClouds = await import(pathToFileURL(repo + '/sky-clouds.js'));
const rbBoard = await import(pathToFileURL(repo + '/rebirth-board.js'));
const rbGame = await import(pathToFileURL(repo + '/rebirth-game.js'));
const html = fs.readFileSync(repo + '/index.html', 'utf8');
const source = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;\n/gm, '');
const dom = new JSDOM(html, {url:'https://example.org/WorldSystem/', runScripts:'outside-only', pretendToBeVisual:true});
const {window} = dom, document = window.document;
const textureRequests = [];
const THREE = {...RealThree, TextureLoader: class {
  load(url, success, progress, failure) { textureRequests.push({url, success, failure}); }
}};
Object.assign(window, {createOfferingModels, OFFERING_ART, TOUR_NOTES, installViewportGestures}, surfaces, skyClouds, {
  RB_SQUARES: rbBoard.SQUARES, RB_SPECIAL: rbBoard.SPECIAL, RB_START: rbBoard.START,
  RB_VICTORY: rbBoard.VICTORY, TRAP_QUOTA: rbBoard.TRAP_QUOTA, TRAP_QUOTA_NOTE64: rbBoard.TRAP_QUOTA_NOTE64,
  DIE_FACES: rbBoard.FACES, RB_BY_N: rbBoard.BY_N, createBoardLayer: rbBoard.createBoardLayer,
  createGame: rbGame.createGame, throwDie: rbGame.throwDie, outstanding: rbGame.outstanding,
  rbDestination: rbGame.destination
});
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
 STEPS, LUMINARIES, RIM, OFFERING_SIZE, freeRect, tourImageRect, meshesFor, visibleInScene,
 setMandala, setMode, show, close, setOpen, startTour, visitHeap, endTour, orientOfferingCards,
 applyStep, playToggle, stepBy, pausePlay, resetPlay, applyTheme, setMotion,
 rbBoard, rbGame:()=>rbGame,
 state:()=>({mandala,mode,touring,tourIndex,pStep,playing,current,motion,showHeapNumbers,lumSpin})
};})()`);
advance(1200);
const panels = ['.sheet','.mandala-note','.tour-panel','.index','.game'];
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
assert.equal(app.state().showHeapNumbers,true,'Numbers start on');
q('[data-numbers]').click();
assert.equal(app.state().showHeapNumbers,false);
assert.ok(document.body.classList.contains('hide-heap-numbers'));
document.querySelectorAll('[data-numbers]').forEach(b=>assert.equal(b.getAttribute('aria-pressed'),'false'));
q('.tour-panel [data-numbers]').click();
assert.equal(app.state().showHeapNumbers,true);
assert.ok(!document.body.classList.contains('hide-heap-numbers'));
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
  assert.equal(front.material.depthTest,false,'Oceans and mountains cannot depth-occlude artwork');
  app.world.traverse(o=>{
    if(o.isMesh && !o.userData.artwork && o.material.transparent)
      assert.ok(front.renderOrder>o.renderOrder,'Artwork is drawn after transparent terrain');
  });
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
// Recitation illustrations must remain face-on while orbiting and must never
// intersect their supporting surface, even with the camera near the horizon.
for (const elevation of [0.08, 0.6, 4, 100000]) {
 for (const azimuth of [0, Math.PI/2, Math.PI, Math.PI*1.5]) {
  app.ctr.target.set(0,0,0);
  app.cam.position.set(Math.sin(azimuth), elevation, Math.cos(azimuth)).normalize().multiplyScalar(8);
  advance(20);
  for (const [id,model] of app.OFFERING_MODELS) {
   assert.ok(model.children[0].quaternion.angleTo(app.cam.quaternion)<1e-6,'Face the camera throughout recitation');
   const box=new THREE.Box3().setFromObject(model);
   assert.ok(box.min.y>=model.userData.baseY+model.scale.x*.08,'Entire cutout clears its support');
   if(elevation===100000) {
    const normal=new THREE.Vector3(0,0,1).applyQuaternion(model.children[0].quaternion);
    assert.ok(normal.y>.99999,'Cutout lies flat when viewed from above');
   }
   const lower=model.children[0].localToWorld(new THREE.Vector3(0,-.49,0)).project(app.cam);
   const marker=app.MARKS.find(m=>m.id===id).el;
   const expected=(1-lower.y)*viewport.h/2+18;
   assert.ok(Math.abs(parseFloat(marker.style.top)-expected)<=1,'Number follows the lifted lower edge');
  }
 }
}
app.setMandala(true); advance(1200);
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
  const painted=OFFERING_ART.has(app.HEAPS[i][1]);
  const point=b.getCenter(new THREE.Vector3()).project(app.cam), fr=painted?app.tourImageRect():app.freeRect();
  const screen={x:(point.x+.999999)*size.w/2,y:(1-point.y)*size.h/2};
  assert.ok(Math.abs(screen.x-fr.x)<2 && Math.abs(screen.y-fr.y)<2,`Close-up framing ${i+1} at ${size.w}`);
  // Project every selected vertex, including the full billboard after it turns
  // toward the final camera. Require breathing room on all four sides.
  const projected=new THREE.Box2();
  for (const m of app.meshesFor(app.HEAPS[i][1])) {
    const vertices=m.geometry?.attributes.position;
    if(!vertices)continue;
    for(let j=0;j<vertices.count;j++) {
      const v=new THREE.Vector3().fromBufferAttribute(vertices,j).applyMatrix4(m.matrixWorld).project(app.cam);
      const x=(v.x+1)*size.w/2, y=(1-v.y)*size.h/2;
      projected.expandByPoint(new THREE.Vector2(x,y));
      const edge=painted ? .425 : .38;
      assert.ok(Math.abs(x-fr.x)<=fr.w*edge && Math.abs(y-fr.y)<=fr.h*edge,
        `Heap ${i+1} needs a margin at ${size.w}×${size.h}`);
      assert.ok(v.z>-1 && v.z<1,'Selected geometry stays within camera clipping planes');
    }
  }
  if(painted) {
    const extent=projected.getSize(new THREE.Vector2());
    const fill=Math.max(extent.x/fr.w,extent.y/fr.h);
    assert.ok(Math.abs(fill-.84)<.005,'Image fills 84% of its limiting dimension');
    const marker=app.MARKS[i].el;
    const markerY=parseFloat(marker.style.top), whole=app.freeRect();
    assert.ok(markerY>projected.max.y+16 && markerY+13<whole.y+whole.h/2,
      'Heap number stays below the image and above the panel');
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
app.OFFERING_MODELS.forEach(m=>assert.ok(m.children[0].quaternion.angleTo(app.cam.quaternion)<1e-6));
app.show('emblem_elephant'); panel('.sheet'); app.setOpen(true); panel('.index');
app.setOpen(false); panel('.mandala-note');
app.startTour(14); app.setMotion(true); advance(1600); panel('.tour-panel');
assert.equal(app.state().mandala,true); assert.equal(app.state().touring,true);
assert.equal(app.state().motion,true); assert.equal(app.ctr.autoRotate,true);
app.setMandala(false); advance(1000); panel(null);
assert.equal(app.state().mandala,false); assert.equal(app.state().motion,true);
app.setMandala(true); advance(1000); panel('.mandala-note');
assert.equal(app.state().mandala,true); assert.equal(app.state().motion,true);
assert.equal(heaps().length,37); assert.equal(app.ctr.autoRotate,true,'Whole mandala turns with offerings');
const spin=app.state().lumSpin; advance(100); assert.ok(app.state().lumSpin>spin);
app.setMotion(false);
assert.equal(app.state().mandala,true); assert.equal(app.ctr.autoRotate,false);
assert.equal(q('[data-act="motion"] .g').textContent,'▶');
app.setMotion(true); advance(100);
assert.equal(q('[data-act="motion"] .g').textContent,'❙❙');
app.ctr.dispatchEvent({type:'start'}); assert.equal(app.ctr.autoRotate,false);
app.ctr.dispatchEvent({type:'end'}); assert.equal(app.ctr.autoRotate,true,'Motion resumes after a gesture');
app.setMotion(false); app.setMandala(false); advance(1000);
app.setMotion(false); app.applyTheme(true); app.applyTheme(false);
app.ORIGINAL_VISIBILITY.forEach((visible,obj)=>assert.equal(obj.visible,visible,'Original world restored'));
app.OFFERING_MODELS.forEach(m=>assert.equal(app.visibleInScene(m),false));
worldVisibility.forEach((visible,obj)=>assert.equal(obj.visible,visible,'All world context restored'));
reduced=true; app.startTour(20); advance(20); panel('.tour-panel');
assert.equal(app.state().tourIndex,20);

/* ── the game of rebirth ────────────────────────────────────────────────
   A mode of its own. It has to lay the board over the geometry already
   drawn, and put it away again however the mode is left. */
reduced=false; app.endTour(); app.setMandala(false); advance(1200); panel(null);
const key = k => window.dispatchEvent(new window.KeyboardEvent('keydown',{key:k}));
const boardMeshes = []; app.rbBoard.group.traverse(o=>{if(o.isMesh)boardMeshes.push(o);});
assert.equal(app.rbBoard.nodes.size,104);
assert.ok(boardMeshes.length>=208,'A marker and a target for every square');
assert.ok(boardMeshes.every(m=>!app.visibleInScene(m)),'The board is away outside game mode');

key('g'); advance(1200); panel('.game');
assert.equal(app.state().mode,'game');
// The dock sits on an overlay that swallows pointer events, and every panel in
// it has to turn them back on. jsdom does not do CSS, so this is read from the
// stylesheet: a panel left out of that rule looks right and cannot be used.
const pointerRules = [...html.matchAll(/([^{}]+)\{[^{}]*pointer-events:\s*auto[^{}]*\}/g)].map(m=>m[1]);
for (const child of q('.panel-dock').children) {
  const cls = '.' + child.className.trim().split(/\s+/)[0];
  assert.ok(pointerRules.some(sel=>sel.includes(cls)),
    cls + ' is a panel in the dock but never gets pointer events back');
}
assert.ok(document.body.classList.contains('game-view'));
assert.equal(q('[data-mode="game"]').getAttribute('aria-pressed'),'true');
assert.equal(q('[data-mode="explore"]').getAttribute('aria-pressed'),'false');
assert.ok(boardMeshes.every(m=>app.visibleInScene(m)),'The board is laid out in game mode');
assert.equal(q('[data-act="home"]').disabled,false,'Game mode is something to come home from');
const withGame = app.freeRect();
assert.ok(withGame.w < viewport.w,'The game panel is charged to the free rectangle');

// Every anchored square stands on the geometry the model already draws for it.
// A mistyped anchor binds to nothing and drops onto the armature in silence.
const anchoredSquares = rbBoard.SQUARES.filter(sq=>sq.anchor);
assert.equal(anchoredSquares.length,21);
for (const sq of anchoredSquares) {
  const holder = app.rbBoard.nodes.get(sq.n);
  assert.equal(holder.userData.anchored,true,'square '+sq.n+' binds to '+sq.anchor);
  const drawn = app.meshesFor(sq.anchor);
  assert.ok(drawn.length,'the model draws '+sq.anchor);
  const box = new THREE.Box3(); drawn.forEach(m=>box.expandByObject(m));
  const centre = box.getCenter(new THREE.Vector3());
  assert.ok(Math.hypot(holder.position.x-centre.x,holder.position.z-centre.z)<1e-6,
    'square '+sq.n+' stands over '+sq.anchor);
  assert.ok(holder.position.y>centre.y,'square '+sq.n+' floats above '+sq.anchor);
}
for (const sq of rbBoard.SQUARES.filter(x=>!x.anchor)) {
  const holder = app.rbBoard.nodes.get(sq.n);
  assert.ok(!holder.userData.anchored,'square '+sq.n+' has nothing to anchor to');
  assert.ok([holder.position.x,holder.position.y,holder.position.z].every(Number.isFinite));
}

// A loaded die, so the printed moves can be checked through the panel.
let face = 1;
window.Math.random = () => (face-1)/6 + 1e-6;
const throwFace = f => { face=f; q('[data-game="throw"]').click(); advance(200); };
q('#g-players').value='1'; q('#g-players').dispatchEvent(new window.Event('change'));
assert.equal(app.rbGame().players.length,1);
assert.equal(app.rbGame().players[0].pos,rbBoard.START);
throwFace(1);
assert.equal(app.rbGame().players[0].pos,27,'A one off the Heavenly Highway reaches the Four Great Kings');
assert.match(q('.game .g-at').textContent,/^· 27 /);
assert.equal(q('.game .feed').children.length,1);
const tokenAt27 = app.rbBoard.token.position.clone();
assert.ok(tokenAt27.distanceTo(app.rbBoard.nodes.get(27).position)>0,'The token floats over its square');

// The counter trap, through the panel: twenty-one useful throws and out to 9.
app.rbGame().players[0].pos = 33;
throwFace(6);
assert.equal(app.rbGame().players[0].pos,1,'A six out of the lesser path falls to Vajra Hell');
assert.equal(q('.game .tally').hidden,false,'The checklist appears');
assert.match(q('.game .say').textContent,/trap/i);
for (let f=1; f<=6; f+=1) for (let i=0; i<f; i+=1) throwFace(f);
assert.equal(app.rbGame().players[0].pos,9,'The completed checklist leaves for the Lord of the Dead');
assert.equal(q('.game .tally').hidden,true);
assert.match(q('.game .say').textContent,/complete/i);

// Victory is declared on arrival; the throw that follows is a rite.
app.rbGame().players[0].pos = 103;
throwFace(1);
assert.equal(app.rbGame().winner,0);
assert.equal(q('[data-game="throw"]').textContent,'Stupa throw');
assert.equal(q('[data-game="throw"]').disabled,false);
throwFace(5);
assert.equal(app.rbGame().winner,0,'The rite cannot change the winner');
assert.equal(q('[data-game="throw"]').textContent,'Game over');
assert.equal(q('[data-game="throw"]').disabled,true);
q('[data-game="reset"]').click(); advance(200);
assert.equal(app.rbGame().players[0].pos,rbBoard.START);
assert.equal(q('.game .feed').children.length,0);

// The panel takes its turn in the dock and its rung in the Escape cascade.
app.setOpen(true); panel('.index');
app.setOpen(false); advance(1000); panel('.game');
app.show('rebirth_sq_104',true); panel('.sheet');
assert.ok(app.meshesFor('rebirth_sq_104').length,'Nirvana is a square you can point at');
key('Escape'); advance(1000); panel('.game');
key('Escape'); advance(1200); panel(null);
assert.equal(app.state().mode,'explore');
assert.ok(boardMeshes.every(m=>!app.visibleInScene(m)),'Escape puts the board away');

// A square opened from the index lays the board out first, the way the
// offering figures open mandala mode.
app.show('rebirth_sq_27',true); advance(1200);
assert.equal(app.state().mode,'game');
assert.ok(app.meshesFor('rebirth_sq_27').length,'The square is there to be tinted');
app.close(); advance(200); panel('.game');

// And an offering figure opened from game mode takes the board away with it.
app.show('mandala_parasol',true); advance(1200); panel('.sheet');
assert.equal(app.state().mode,'mandala');
assert.equal(app.state().mandala,true);
assert.ok(boardMeshes.every(m=>!app.visibleInScene(m)),'Mandala mode is not played over the board');

app.close(); app.setMandala(false); advance(1200); panel(null);
assert.equal(app.state().mode,'explore');
key('m'); advance(1200); panel('.mandala-note'); assert.equal(app.state().mode,'mandala');
key('g'); advance(1200); panel('.game'); assert.equal(app.state().mode,'game');
assert.equal(app.state().mandala,false,'Game mode is not mandala mode');
app.OFFERING_MODELS.forEach(m=>assert.equal(app.visibleInScene(m),false,'The offering is put away'));
key('e'); advance(1200); panel(null); assert.equal(app.state().mode,'explore');
app.ORIGINAL_VISIBILITY.forEach((visible,obj)=>assert.equal(obj.visible,visible,'Original world restored after the game'));
worldVisibility.forEach((visible,obj)=>assert.equal(obj.visible,visible,'All world context restored after the game'));

console.log(JSON.stringify({result:'PASS',heaps:37,illustrations:24,triangles,atlasRequests:3,
 squares:app.rbBoard.nodes.size,anchoredSquares:anchoredSquares.length,
 checks:'Terrain overlay priority, independent motion/mandala switches and gesture resume, numbers toggle, billboards from 16 angles, 84% tour image fit at three viewport sizes, all 37 stops, playback, isolation, exclusive panels, image failure/retry, keyboard controls, reduced motion and visibility restoration. Game mode: three-way mode switch, the board laid out and put away, all 21 anchored squares standing on the geometry drawn for them, the printed first move, the counter trap end to end, victory and its rite, every dock panel given pointer events back, dock and Escape order.',
 limits:'DOM and GPU substitutes; actual CSS layout, WebGL rendering and devices were not tested.'},null,2));
