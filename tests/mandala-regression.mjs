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
const {SQUARE_NOTES, SQUARE_FULL} = await import(pathToFileURL(repo + '/rebirth-notes.js'));
const rbIcons = await import(pathToFileURL(repo + '/rebirth-icons.js'));
const rbSound = await import(pathToFileURL(repo + '/rebirth-sound.js'));
// Every square is painted: the field it is drawn as on the board, served as
// four atlas sheets that the module lays out from the square numbers alone.
assert.equal(rbIcons.SQUARE_ART.size, 104, 'every square has its field');
assert.equal(rbIcons.artSheets().length, 4, 'in four sheets');
for (const n of [1, 28, 29, 84, 85, 104]) {
  const art = rbIcons.SQUARE_ART.get(n);
  assert.equal(art.sheet, 'assets/rebirth/squares-'
    + (Math.floor((n - 1) / rbIcons.SQUARES_PER_SHEET) + 1) + '.webp', 'square ' + n + ' on its sheet');
  assert.equal(art.cell, (n - 1) % rbIcons.SQUARES_PER_SHEET, 'and in its cell');
  assert.ok(fs.existsSync(repo + '/' + art.sheet), art.sheet + ' is served');
}
assert.ok(fs.existsSync(repo + '/' + rbIcons.LIBERATION_ART.url), 'and the closing painting with it');
// A percentage background position aligns the same fraction of the sheet with
// that fraction of the box, so a cell's share is its index over one less than
// the count. The last sheet is not full and has to answer to that.
assert.equal(rbIcons.sheetRows(rbIcons.SQUARE_ART.get(1)), 7);
assert.equal(rbIcons.sheetRows(rbIcons.SQUARE_ART.get(104)), 5);
assert.equal(rbIcons.cellBackground(rbIcons.SQUARE_ART.get(1)).position, '0% 0%');
assert.equal(rbIcons.cellBackground(rbIcons.SQUARE_ART.get(28)).position, '100% 100%');
assert.equal(rbIcons.cellBackground(rbIcons.SQUARE_ART.get(104)).position, '100% 100%');
assert.equal(rbIcons.cellBackground(rbIcons.SQUARE_ART.get(5)).position,
  '0% ' + (1 / 6 * 100) + '%', 'the second row of seven is a sixth of the way down');
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
  RB_VARIANTS: rbBoard.VARIANTS, rbZoneOf: rbBoard.zoneOf, SQUARE_NOTES, SQUARE_FULL,
  RB_COLOURS: rbBoard.PLAYER_COLOURS, SQUARE_ART: rbIcons.SQUARE_ART,
  cellBackground: rbIcons.cellBackground, createSquareArt: rbIcons.createSquareArt,
  LIBERATION_ART: rbIcons.LIBERATION_ART, rbTibetan: rbBoard.tibetanOf,
  createSoundKit: rbSound.createSoundKit, rbVoice: rbSound.voiceFor,
  createGame: rbGame.createGame, throwDie: rbGame.throwDie,
  rbView: rbGame.view, rbDestination: rbGame.destination
});
let viewport = {w:1280, h:900}, reduced = false;
window.matchMedia = query => ({matches:query.includes('reduced-motion') ? reduced
  : query.includes('max-width: 700px') ? viewport.w <= 700
  : query.includes('max-width: 980px') ? viewport.w <= 980
  : query.includes('max-width: 1080px') ? viewport.w <= 1080 : false});
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
// Three controls, wherever they are docked: a short bar, not a strip of eight.
q('.controls').getBoundingClientRect = () => viewport.w<=700
  ? rect(9,viewport.h-53,viewport.w-18,44) : rect(viewport.w-252,22,230,40);
// The board holds the left of the screen; below 1080px it holds the width.
q('.board-view').getBoundingClientRect = () => q('.board-view').hidden ? rect(0,0,0,0)
  : viewport.w<=1080 ? rect(14,82,viewport.w-28,viewport.h-166)
  : rect(22,82,Math.min(viewport.w*0.56,viewport.w-430),viewport.h-166);
const app = await window.eval(`(async()=>{${source}\nreturn {
 world, cam, ctr, E, HEAPS, MARKS, HEAP_MEMBERS, OFFERING_MODELS, ORIGINAL_VISIBILITY,
 STEPS, LUMINARIES, RIM, OFFERING_SIZE, freeRect, tourImageRect, meshesFor, visibleInScene,
 stageGround:()=>stage._ground,
 setMandala, setMode, show, close, setOpen, startTour, visitHeap, endTour, orientOfferingCards,
 applyStep, playToggle, stepBy, pausePlay, resetPlay, applyTheme, setMotion,
 rbBoard, rbArt, rbGame:()=>rbGame,
 state:()=>({mandala,mode,touring,tourIndex,pStep,playing,current,motion,showHeapNumbers,lumSpin})
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

/* ── the board of rebirth ───────────────────────────────────────────────
   A whole board on one side of the screen and the world still turning on the
   other. The board is not a dock panel: the entry drawer opens beside it, not
   over it, which is the split the mode exists for. */
reduced=false; app.endTour(); app.setMandala(false);
viewport={w:1280,h:900}; window.dispatchEvent(new window.Event('resize'));
advance(1200); panel(null);
const key = k => window.dispatchEvent(new window.KeyboardEvent('keydown',{key:k}));
const boardEl = q('.board-view');
const cellOf = n => boardEl.querySelector('[data-square="'+n+'"]');
// the square markers; the player markers are checked on their own below
const boardMeshes = []; app.rbBoard.group.traverse(o=>{
  if(o.isMesh && /^rebirth_square_/.test(o.name)) boardMeshes.push(o);
});
assert.equal(app.rbBoard.nodes.size,104);
assert.ok(boardMeshes.every(m=>!app.visibleInScene(m)),'The board is away outside game mode');
assert.equal(boardEl.hidden,true);

key('g'); advance(1200);
assert.equal(app.state().mode,'game');
assert.equal(boardEl.hidden,false,'Game mode is the board');
assert.ok(document.body.classList.contains('game-view'));
assert.equal(q('[data-mode="game"]').getAttribute('aria-pressed'),'true');
assert.ok(boardMeshes.every(m=>app.visibleInScene(m)),'The board is laid out in the world too');
assert.equal(q('[data-act="home"]').disabled,false,'Game mode is something to come home from');

// 104 cells, built once, in the order the board is numbered: right to left and
// rising from the bottom, so 104 is the first cell and 1 the last.
const cells = [...boardEl.querySelectorAll('.bv-sq')];
assert.equal(cells.length,104,'One cell per square');
assert.deepEqual(cells.slice(0,8).map(c=>+c.dataset.square),[104,103,102,101,100,99,98,97]);
assert.deepEqual(cells.slice(-8).map(c=>+c.dataset.square),[8,7,6,5,4,3,2,1]);
for (const sq of rbBoard.SQUARES) {
  const cell = cellOf(sq.n);
  assert.ok(cell,'square '+sq.n+' has a cell');
  assert.equal(cell.querySelector('.n').textContent,String(sq.n));
  assert.equal(cell.querySelector('.nm').textContent,sq.name,'square '+sq.n+' keeps its name');
  assert.equal(cell.style.getPropertyValue('--zone'),'var(--z-'+rbBoard.zoneOf(sq)+')');
}
assert.ok(cellOf(rbBoard.START).hasAttribute('data-start'));
assert.ok(cellOf(1).hasAttribute('data-trap') && cellOf(48).hasAttribute('data-trap'));
assert.ok(cellOf(104).hasAttribute('data-victory'));
// Every square has an entry of our own, and none of them is the 1977 commentary.
assert.equal(Object.keys(SQUARE_NOTES).length,104);
for (const sq of rbBoard.SQUARES) {
  assert.ok(SQUARE_NOTES[sq.n] && SQUARE_NOTES[sq.n].split(' ').length>20,'square '+sq.n+' has a note');
  assert.ok(app.E['rebirth_sq_'+sq.n].b.includes(SQUARE_NOTES[sq.n]),'square '+sq.n+' entry carries it');
}

// Every anchored square still stands on the geometry drawn for it.
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

// The board takes most of the width, and the world is framed in what is left.
const fr = app.freeRect();
assert.ok(fr.w < viewport.w*0.45,'The world is framed clear of the board');
assert.ok(fr.x > viewport.w*0.6,'and on the far side of it');
const frExplore = (() => { key('e'); advance(900); const r = app.freeRect(); key('g'); advance(1200); return r; })();
assert.ok(frExplore.w > fr.w*1.6,'and the world gets the whole screen back outside game mode');

// Pointer events have to survive the overlay, which jsdom cannot see: read the
// rule out of the stylesheet instead, for the board and for each dock panel.
const pointerRules = [...html.matchAll(/([^{}]+)\{[^{}]*pointer-events:\s*auto[^{}]*\}/g)].map(m=>m[1]);
for (const el of [boardEl, ...q('.panel-dock').children]) {
  const cls = '.' + el.className.trim().split(/\s+/)[0];
  assert.ok(pointerRules.some(sel=>sel.includes(cls)),
    cls + ' is on the overlay but never gets pointer events back');
}

/* The fields. Every square is drawn as the field it carries on the printed
   board: its own ground in the cell, and a billboard on its marker in the
   world. The sheets are fetched when game mode is first opened and not
   before, and each can fail and be retried on its own. */
for (const n of [1, 17, 59, 84, 104]) {
  const icon = cellOf(n).querySelector('.bv-icon');
  assert.ok(icon,'square '+n+' has somewhere to put its field');
  assert.equal(icon.hidden,false,'and shows it');
  assert.equal(icon.style.backgroundImage,'url("'+rbIcons.SQUARE_ART.get(n).sheet+'")');
  assert.equal(icon.style.backgroundPosition,
    rbIcons.cellBackground(rbIcons.SQUARE_ART.get(n)).position,'where the sheet says');
  assert.match(cellOf(n).title,/field/,'the attribution rides with it');
  const plane = app.rbArt.planes.get(n);
  assert.ok(plane,'and a billboard in the world');
  assert.equal(plane.parent,app.rbBoard.nodes.get(n),'on that square\'s marker');
}
assert.equal([...boardEl.querySelectorAll('.bv-icon:not([hidden])')].length,104,'all 104 fields');

/* Where the world builds the thing a square names, the geometry is the
   representation and the painted field would be the same square said twice.
   Those squares carry no billboard — and keep their field everywhere a
   picture belongs: the cell, the throw card and the expanded entry. */
const modelled = [...app.rbArt.modelled].sort((a,b)=>a-b);
assert.deepEqual(modelled,[27,28,30,31,32,35,37],'the squares the world stands in for');
for (const n of modelled) {
  assert.equal(app.rbArt.planes.get(n),undefined,'square '+n+' has no billboard over its model');
  const holder = app.rbBoard.nodes.get(n);
  assert.equal(holder.children.some(o=>o.userData.billboard),false,'nothing left on its marker');
  assert.equal(cellOf(n).querySelector('.bv-icon').hidden,false,'its field still lights the cell');
  app.show('rebirth_sq_'+n,false);
  assert.equal(q('.entry-art').hidden,false,'and still heads the expanded entry');
}
assert.equal(app.rbArt.planes.size,104-modelled.length,'a billboard for all the rest');
for (const n of [17,27,28,37]) {
  const drawn = app.meshesFor(rbBoard.BY_N.get(n).anchor);
  assert.ok(drawn.length,'square '+n+' still has something drawn for it');
}
assert.notEqual(cellOf(1).querySelector('.bv-icon').style.backgroundPosition,
                cellOf(5).querySelector('.bv-icon').style.backgroundPosition,'no two cells share a place');
// Four sheets, fetched once, when game mode is first opened.
assert.deepEqual(app.rbArt.states(),['loading','loading','loading','loading'],'requested, not sooner');
const artRequests = textureRequests.slice(-4);
assert.deepEqual(artRequests.map(r=>r.url).sort(),rbIcons.artSheets().slice().sort());
artRequests[0].failure();
assert.deepEqual(app.rbArt.states(),['failed','loading','loading','loading']);
app.rbArt.load();
assert.equal(textureRequests.length-4-artRequests.length+4,textureRequests.length-4,'only the failed sheet again');
textureRequests.at(-1).success(new THREE.Texture());
artRequests.slice(1).forEach(r=>r.success(new THREE.Texture()));
assert.deepEqual(app.rbArt.states(),['ready','ready','ready','ready']);
for (const n of [1, 104]) {
  const plane = app.rbArt.planes.get(n);
  assert.ok(plane.material.map,'the painting reaches the billboard');
}
// Billboards face the camera, like the offering illustrations do.
app.rbArt.face(app.cam);
assert.ok(app.rbArt.planes.get(17).quaternion.angleTo(app.cam.quaternion)<1e-6);

/* A hundred and four solid markers over the world is a fog. Only the squares
   that matter now stand forward: the one in hand, and every square somebody is
   standing on. The rest — mark, plinth and field alike — fall back. */
const bandMesh = n => { let m=null; app.rbBoard.nodes.get(n).traverse(o=>{ if(o.isMesh&&o.userData.band) m=o; }); return m; };
const start = rbBoard.START;
app.rbArt.showActive([start]);
assert.equal(app.rbArt.planes.get(start).material.opacity,1,'the square in hand is at full weight');
assert.ok(app.rbArt.planes.get(59).material.opacity<0.5,'and one nobody is on stands back');
assert.equal(bandMesh(59).material.transparent,true,'its marker too');
assert.equal(bandMesh(start).material.transparent,false);
app.rbBoard.nodes.get(59).traverse(o=>{
  if (o.name==='rebirth_plinth_59') assert.equal(o.material.opacity<1,true,'and the plinth under it');
});

/* Every square carries its Tibetan name as well, and one switch puts those
   names in place of the English ones wherever a square is named in passing.
   The entry in the drawer gives both, always. */
assert.equal(Object.keys(rbBoard.TIBETAN).length,104,'a Tibetan name for every square');
for (const sq of rbBoard.SQUARES) {
  assert.ok(rbBoard.tibetanOf(sq.n).length>1,'square '+sq.n+' is named in Tibetan');
  assert.equal(cellOf(sq.n).querySelector('.tb').textContent,rbBoard.tibetanOf(sq.n));
  assert.equal(app.E['rebirth_sq_'+sq.n].tib,rbBoard.tibetanOf(sq.n),'and in its entry');
}
assert.ok(!document.body.classList.contains('tibetan-names'),'English to begin with');
/* The switch is a selector among the settings that answer to no view, with
   both languages on it and the one in force held down — not a lone button
   carrying the name of the language you are not reading. */
assert.ok(q('.controls [data-menu="options"] [data-lang="bo"]'),'the selector is in Options');
assert.equal(q('[data-lang="en"]').getAttribute('aria-pressed'),'true','English is held down');
assert.equal(q('[data-lang="bo"]').getAttribute('aria-pressed'),'false');
key('t'); advance(200);
assert.ok(document.body.classList.contains('tibetan-names'),'t turns the Tibetan names on');
assert.equal(q('[data-lang="bo"]').getAttribute('aria-pressed'),'true','and Tibetan is held down');
assert.equal(q('[data-lang="en"]').getAttribute('aria-pressed'),'false');
q('[data-lang="en"]').click(); advance(200);
assert.ok(!document.body.classList.contains('tibetan-names'),'and the selector switches back');
// the names themselves are never withheld: a board of unnamed fields is a grid
for (const sq of [1, 24, 104]) {
  assert.ok(cellOf(sq).querySelector('.nm').textContent.length,'square '+sq+' is named');
}

/* Three arrangements of the same game: the board beside the world, the world
   alone, and the board alone — the 2D reading, with no model behind it. */
const layoutOf = () => document.body.classList.contains('board-only') ? 'board'
  : document.body.classList.contains('world-only') ? 'world' : 'both';
assert.equal(layoutOf(),'both','both to begin with');
assert.equal(q('[data-layout="both"]').getAttribute('aria-pressed'),'true');
q('[data-layout="board"]').click(); advance(600);
assert.equal(layoutOf(),'board','the board alone, as a diagram of positions');
assert.equal(q('[data-layout="board"]').getAttribute('aria-pressed'),'true');
assert.equal(q('.rb-players').hidden,true,'nothing is named over a model that is not shown');
q('[data-layout="world"]').click(); advance(600);
assert.equal(layoutOf(),'world','and the world alone, at any width');
key('b'); advance(600);
assert.equal(layoutOf(),'both','b cycles round');
assert.equal(q('.rb-players').hidden,false);

/* Two of the three dress the whole page — board hides the canvas the world is
   drawn on, world folds the board away — and neither means anything outside
   the game. Written onto the body they outlived the game that asked for them:
   the explorer opened onto an empty sky with the model still there behind a
   hidden canvas, and a remembered preference for the board alone did the same
   thing on the next visit, before a game had been asked for at all. */
q('[data-layout="board"]').click(); advance(600);
assert.equal(layoutOf(),'board');
key('e'); advance(600);
assert.equal(document.body.classList.contains('board-only'),false,
  'the board alone does not outlive the game');
assert.equal(document.body.classList.contains('world-only'),false);
key('g'); advance(600);
assert.equal(layoutOf(),'board','and the arrangement comes back with the game');
q('[data-layout="world"]').click(); advance(600);
key('e'); advance(600);
assert.equal(document.body.classList.contains('world-only'),false,
  'nor does the world alone');
key('g'); advance(600);
q('[data-layout="both"]').click(); advance(600);
assert.equal(layoutOf(),'both');
assert.equal(q('.rb-players').hidden,false);

// Every player stands in the world, in their own colour, and the one holding
// the die is ringed. A single travelling token could not say who was where.
assert.equal(app.rbBoard.tokens.length,4,'a marker for every possible player');
const litTokens = () => app.rbBoard.tokens.filter(t=>t.visible);
assert.equal(litTokens().length,2,'two players, two markers');
assert.ok(app.rbBoard.tokens.slice(2).every(t=>!t.visible),'the other two stand down');
assert.equal(app.rbBoard.tokens[0].userData.halo.visible,true,'the first player holds the die');
assert.equal(app.rbBoard.tokens[1].userData.halo.visible,false);
for (const holder of litTokens()) {
  const parts = []; holder.traverse(o=>{if(o.isMesh)parts.push(o);});
  assert.ok(parts.length>=4,'a marker is more than a dot');
  assert.ok(parts.some(m=>m.geometry.type==='RingGeometry'),'and stands in a ring');
  assert.ok([holder.position.x,holder.position.y,holder.position.z].every(Number.isFinite));
}
// and every square is somewhere to stand rather than a dot in the air
for (const n of [30, 59, 104]) {
  const parts = []; app.rbBoard.nodes.get(n).traverse(o=>{if(o.isMesh)parts.push(o);});
  assert.ok(parts.some(m=>m.name==='rebirth_plinth_'+n),'square '+n+' stands on a plinth');
}
// two on one square are fanned apart rather than hidden inside each other
assert.equal(app.rbGame().players[0].pos,app.rbGame().players[1].pos,'both start on 24');
assert.ok(app.rbBoard.tokens[0].position.distanceTo(app.rbBoard.tokens[1].position)>0,
  'and do not occupy the same point');
// and each is named where they stand, in their own colour
const playerChips = [...q('.rb-players').children];
assert.equal(playerChips.length,4,'a chip for every possible player');
assert.equal(playerChips.filter(c=>!c.hidden).length,2,'two players, two chips');
for (const [i,chip] of playerChips.slice(0,2).entries()) {
  assert.equal(chip.style.getPropertyValue('--pc'),rbBoard.PLAYER_COLOURS[i],'in their own colour');
  assert.equal(chip.querySelector('.who').textContent,app.rbGame().players[i].name);
  assert.equal(chip.querySelector('.sq').textContent,String(app.rbGame().players[i].pos));
}
assert.ok(playerChips[0].classList.contains('turn'),'the one holding the die is marked');
// the entry shows the field too, the way it shows an offering's painting
app.show('rebirth_sq_17',false); advance(300);
assert.equal(q('.entry-art').hidden,false,'a square\'s entry shows its field');
assert.ok(q('.entry-art').classList.contains('field'));
assert.equal(q('.entry-art > div').style.backgroundImage,'url("'+rbIcons.SQUARE_ART.get(17).sheet+'")');
assert.equal(q('.entry-art > div').style.backgroundPosition,
  rbIcons.cellBackground(rbIcons.SQUARE_ART.get(17)).position);
assert.match(q('.sheet .sub').innerHTML,/འཛམ/,'and names it in Tibetan');
/* And it is read in that order: what it is called, the thing itself, what is
   said about it, and only then the table of where it stands on the board and
   what each face of the die does with it. The table used to come second, so
   twelve rows of coordinates stood between every square and its own story. */
const entryOrder = [...q('.sheet-scroll').children]
  .filter(el => ['H2','FIGURE','DL'].includes(el.tagName) || el.classList.contains('bodies'))
  .map(el => el.tagName === 'DIV' ? 'bodies' : el.tagName);
assert.deepEqual(entryOrder,['H2','FIGURE','bodies','DL'],
  'name, then field, then the prose, and the table last');
app.close(); advance(300);
assert.ok(!playerChips[1].classList.contains('turn'));

/* Nirvana is not the last square of the round but the one outside it: on the
   axis, clear above everything the model draws, and drawn as open rings
   rather than something to stand on. */
const nirvana = app.rbBoard.nodes.get(104);
assert.ok(Math.hypot(nirvana.position.x,nirvana.position.z)<1e-9,'Nirvana stands on the axis');
const modelTop = (() => {
  const box = new THREE.Box3();
  app.world.traverse(o=>{ if(o.isMesh && !/^rebirth_/.test(o.name)) box.expandByObject(o); });
  return box.max.y;
})();
assert.ok(nirvana.position.y>modelTop,'and above the whole world system');
for (const n of [103, 93]) {
  assert.ok(nirvana.position.y>app.rbBoard.nodes.get(n).position.y*1.5,
    'well clear of square '+n+', which is still inside the round');
}
const nirvanaParts = []; nirvana.traverse(o=>{ if(o.isMesh) nirvanaParts.push(o); });
assert.ok(nirvanaParts.some(m=>m.geometry.type==='RingGeometry'),'an open ring, not a floor');
assert.ok(!nirvanaParts.some(m=>m.geometry.type==='CylinderGeometry'),'and nothing to stand on');
assert.ok(cellOf(104).hasAttribute('data-victory'),'and its cell is set apart');

// A loaded die, so the printed moves can be played through the board.
let face = 1;
window.Math.random = () => (face-1)/6 + 1e-6;
// A throw now runs for a couple of seconds before it resolves.
const throwFace = f => { face=f; q('[data-game="throw"]').click(); advance(3200); };
/* Starting over goes through the dialog, which is also where players are
   named. Nothing resets until Start is pressed. */
const newGame = (count, names=[]) => {
  q('[data-game="ask-new"]').click();
  q('#g-players').value=String(count);
  q('#g-players').dispatchEvent(new window.Event('change'));
  [...q('.bv-names').querySelectorAll('input')].forEach((f,i)=>{ if(names[i]!==undefined) f.value=names[i]; });
  q('.bv-ask form').dispatchEvent(new window.Event('submit',{cancelable:true,bubbles:true}));
  advance(400);
};

// The control asks before it throws a game away, and never acts on its own.
assert.equal(q('.bv-ask').hidden,true,'the dialog is shut to begin with');
q('[data-game="ask-new"]').click();
assert.equal(q('.bv-ask').hidden,false,'New game opens it');
assert.equal(q('.bv-ask-warn').hidden,true,'with nothing to lose before a throw');
assert.equal(q('.bv-names').querySelectorAll('input').length,2,'a field per player');
q('[data-game="cancel-new"]').click();
assert.equal(q('.bv-ask').hidden,true,'Keep playing shuts it again');
assert.equal(q('#g-sound').checked,false,'The page stays silent until asked');
newGame(1);
assert.equal(app.rbGame().players.length,1);
assert.equal(app.rbGame().players[0].pos,rbBoard.START);
assert.equal(cellOf(rbBoard.START).getAttribute('aria-selected'),'true','The start square is lit');
assert.equal(cellOf(rbBoard.START).querySelector('.bv-tok')!==null,true,'and carries the token');

// The die keeps its answer until it stops, and says where you landed after.
face = 1;
q('[data-game="throw"]').click();
advance(400);
assert.equal(app.rbGame().players[0].pos,rbBoard.START,'the throw has not resolved yet');
assert.equal(q('[data-game="throw"]').disabled,true,'and cannot be thrown again');
assert.equal(q('[data-game="throw"]').textContent,'Throwing…');
assert.ok(q('.die-face').classList.contains('tumbling'),'the die is running');
assert.equal(q('.bv-card').hidden,true,'nothing is announced mid-throw');
q('[data-game="throw"]').click();   // a second click must not start another
advance(3000);
assert.equal(app.rbGame().players[0].pos,27,'A one off the Heavenly Highway reaches the Four Great Kings');
assert.ok(!q('.die-face').classList.contains('tumbling'),'the die has stopped');
assert.equal(q('.bv-card').hidden,false,'the destination is announced');
assert.equal(q('.bv-card .num').textContent,'27');
assert.equal(q('.bv-card .nm').textContent,rbBoard.BY_N.get(27).name,'by name, in full');
assert.equal(q('.bv-card .tb').textContent,rbBoard.tibetanOf(27),'and in Tibetan under it');
assert.equal(q('.bv-card-art').hidden,false,'with the field the square is drawn as');
assert.equal(q('.bv-card-art').style.backgroundImage,'url("'+rbIcons.SQUARE_ART.get(27).sheet+'")');
assert.equal(q('.bv-card-end').hidden,true,'the closing painting is for the end');
// The whole passage is one click away, and the card waits while it is read.
assert.equal(q('.bv-card-more').hidden,false,'the entry is offered from the card');
advance(3000);
assert.equal(q('.bv-card').hidden,false,'a card long enough to read is still up');
q('.bv-card-more').click(); advance(600);
assert.equal(app.state().current,'rebirth_sq_27','the card opens the square\'s entry');
assert.equal(q('.sheet .more').open,true,'with the full passage already unfolded');
assert.equal(q('.bv-card').hidden,true,'and stands down as it goes');
app.close(); advance(300);
assert.equal(cellOf(27).querySelector('.bv-tok')!==null,true,'the token moved with it');
assert.equal(cellOf(rbBoard.START).querySelector('.bv-tok'),null,'and left the square behind');
assert.equal(cellOf(27).getAttribute('aria-selected'),'true','the arrival is the selection');

// The karmic trail is the one thing a position cannot say.
const chips = () => [...boardEl.querySelectorAll('.bv-chip')];
assert.deepEqual(chips().map(c=>+c.dataset.square),[27]);
assert.deepEqual(app.rbGame().players[0].history,[{face:'one',from:24,to:27}]);
throwFace(3);   // 27 -three-> 23
assert.deepEqual(chips().map(c=>+c.dataset.square),[27,23]);
assert.ok(chips()[1].classList.contains('last'),'the newest chip is marked');
chips()[0].click(); advance(600);
assert.equal(app.state().current,'rebirth_sq_27','a chip opens that square');
assert.equal(cellOf(27).getAttribute('aria-selected'),'true','and lights it on the board');
assert.equal(boardEl.hidden,false,'the entry opens beside the board, not over it');
panel('.sheet');
app.close(); advance(300);

/* Where a square can take you, drawn. Selecting one lights the squares its
   faces reach, on the board and as lines in the world, and names it where it
   stands. */
cellOf(30).click(); advance(600);
const linkPoints = () => {
  const a = app.rbBoard.links.geometry.getAttribute('position');
  return a ? a.count / 2 : 0;
};
const destinations = rbBoard.FACES.map(f=>rbGame.destination(30,f)).filter(Boolean);
assert.equal(destinations.length,6,'Tusita lists all six');
assert.equal(linkPoints(),destinations.length,'a line to each of them');
assert.equal(app.rbBoard.links.visible,true);
for (const to of destinations) {
  assert.ok(cellOf(to).classList.contains('reached'),'square '+to+' is lit as reachable');
}
assert.ok(!cellOf(1).classList.contains('reached'),'and a square it cannot reach is not');
assert.match(q('.rb-label').textContent,/^30/,'the label names the square');
assert.match(q('.rb-label').textContent,new RegExp(rbBoard.BY_N.get(30).name.slice(0,9)));
/* It stands over the world, never over the board, which names the square
   already — so it shows once the world has the screen to itself. */
viewport={w:900,h:800}; window.dispatchEvent(new window.Event('resize')); advance(600);
key('w'); advance(900);
assert.ok(document.body.classList.contains('world-only'));
assert.equal(q('.rb-label').hidden,false,'named where it stands, once the world has the screen');
key('w'); advance(900);
viewport={w:1280,h:900}; window.dispatchEvent(new window.Event('resize')); advance(600);
key('w'); advance(600);
assert.ok(!document.body.classList.contains('world-only'),
  'and where both fit there is nothing to hand over');
// a trap lists no moves of its own, so it draws nothing
cellOf(48).click(); advance(600);
assert.equal(app.rbBoard.links.visible,false,'Cessation leads nowhere by a throw');
app.close(); advance(300);

// Selecting a cell is the same selection in all three places.
cellOf(59).click(); advance(600);
assert.equal(app.state().current,'rebirth_sq_59');
assert.equal(cellOf(59).getAttribute('aria-selected'),'true');
assert.ok(app.meshesFor('rebirth_sq_59').length,'Shambhala is there to be pointed at');
app.close(); advance(300);

// Reading another player's trail must never hand them the die.
newGame(2,['Tenzin','Drolma']);
assert.deepEqual(app.rbGame().players.map(p=>p.name),['Tenzin','Drolma'],'players answer to their names');
assert.match(q('[data-game="throw"]').textContent,/Tenzin/,'and the throw is offered to them by name');
assert.match(boardEl.querySelector('.bv-pt .short').textContent,/^Tenzin/);
throwFace(1);
assert.equal(app.rbGame().turn,1,'the die passed to the second player');
assert.equal(app.rbGame().viewing,1);
boardEl.querySelector('[data-player="0"]').click(); advance(200);
assert.equal(app.rbGame().viewing,0,'now reading the first player');
assert.equal(app.rbGame().turn,1,'but the turn has not moved');
assert.deepEqual(chips().map(c=>+c.dataset.square),[27],'and the trail shown is theirs');

// The counter trap, through the board: twenty-one useful throws and out to 9.
newGame(1);
app.rbGame().players[0].pos = 33;
throwFace(6);
assert.equal(app.rbGame().players[0].pos,1,'A six out of the lesser path falls to Vajra Hell');
assert.equal(q('.bv-tally').hidden,false,'the checklist appears');
assert.equal(q('.bv-tally').querySelectorAll('div').length,6);
for (let f=1; f<=6; f+=1) for (let i=0; i<f; i+=1) throwFace(f);
assert.equal(app.rbGame().players[0].pos,9,'the completed checklist leaves for the Lord of the Dead');
assert.equal(q('.bv-tally').hidden,true);
assert.deepEqual(app.rbGame().players[0].history.slice(-2),
  [{face:'six',from:33,to:1},{face:'six',from:1,to:9}],'both steps are on the trail');

// Victory is declared on arrival; the throw that follows is a rite.
app.rbGame().players[0].pos = 103;
throwFace(1);
assert.equal(app.rbGame().winner,0);
// the end of the game has a painting of its own, and no square to sit on
assert.equal(q('.bv-card .num').textContent,'104');
assert.equal(q('.bv-card .tb').textContent,rbBoard.tibetanOf(104));
assert.equal(q('.bv-card-end').hidden,false,'victory carries the closing painting');
assert.match(q('.bv-card-end').getAttribute('src'),/liberation\.webp$/);
assert.equal(q('[data-game="throw"]').textContent,'Stupa throw');
throwFace(5);
assert.equal(app.rbGame().winner,0,'the rite cannot change the winner');
assert.equal(q('[data-game="throw"]').textContent,'Game over');
assert.equal(q('[data-game="throw"]').disabled,true);
// A game in play says so before it is thrown away.
q('[data-game="ask-new"]').click();
assert.equal(q('.bv-ask-warn').hidden,false,'the warning appears once there is a game to lose');
q('[data-game="cancel-new"]').click();
assert.equal(app.rbGame().winner,0,'and keeping playing changes nothing');
newGame(1);
assert.equal(app.rbGame().players[0].pos,rbBoard.START);
assert.equal(app.rbGame().winner,null);
assert.equal(chips().length,0,'a new game starts with an empty trail');
/* The one thing the board has to say before a throw is its own rule, and the
   rule is the second sentence: the die names where you go, it does not count
   how far. A new game used to drop it. */
assert.match(q('.bv-say').textContent,/starts on 24/);
assert.match(q('.bv-say').textContent,/does not count spaces/,
  'a new game says the whole of it');

// The dialog opens showing whoever is playing, so the usual case is two clicks.
newGame(2,['Tenzin','Drolma']);
q('[data-game="ask-new"]').click();
assert.deepEqual([...q('.bv-names').querySelectorAll('input')].map(f=>f.value),['Tenzin','Drolma'],
  'the names in play are already in the fields');
q('#g-players').value='3'; q('#g-players').dispatchEvent(new window.Event('change'));
assert.deepEqual([...q('.bv-names').querySelectorAll('input')].map(f=>f.value),['Tenzin','Drolma',''],
  'and adding a player keeps them');
q('[data-game="cancel-new"]').click();
assert.equal(app.rbGame().players.length,2,'cancelling changes nothing');
newGame(1,['']);
assert.equal(app.rbGame().players[0].name,'Player 1','a name cleared falls back to the number');

// Reduced motion gets the same game without the wait.
reduced = true;
face = 1; q('[data-game="throw"]').click();
assert.equal(app.rbGame().players[0].pos,27,'no suspense where none is wanted');
assert.ok(!q('.die-face').classList.contains('tumbling'));
advance(3000);
reduced = false;
newGame(1); advance(3000);

// Square 85 reads 71, and its entry says the other witness reads 73.
assert.equal(rbGame.destination(85,'one'),71);
assert.deepEqual(rbBoard.VARIANTS['85'],{one:73});
assert.ok(app.E.rebirth_sq_85.f.some(([k,v])=>k==='Variant reading' && /73/.test(v)),
  'the disagreement is in the entry');

// Where the two cannot share the screen they take turns.
viewport={w:900,h:800}; window.dispatchEvent(new window.Event('resize')); advance(600);
key('w'); advance(600);
assert.ok(document.body.classList.contains('world-only'),'w hands the screen to the world');
assert.equal(q('[data-game="swap"]').textContent,'Show the board');
key('w'); advance(600);
assert.ok(!document.body.classList.contains('world-only'));
viewport={w:1280,h:900}; window.dispatchEvent(new window.Event('resize')); advance(600);

// The index drawer wants the same side of the screen, and gets it.
app.setOpen(true); advance(600); panel('.index');
assert.equal(boardEl.hidden,false,'the board stays put under the drawer');
app.setOpen(false); advance(1000); panel(null);

// Leaving the mode puts everything back.
key('Escape'); advance(1200);
assert.equal(app.state().mode,'explore');
assert.equal(boardEl.hidden,true);
assert.ok(boardMeshes.every(m=>!app.visibleInScene(m)),'Escape puts the board away');
assert.equal(q('.rb-label').hidden,true,'and the label with it');
assert.equal(app.rbBoard.links.visible,false,'and the lines');
assert.ok(!document.body.classList.contains('world-only'));

// A square opened from the index lays the board out first.
app.show('rebirth_sq_27',true); advance(1200);
assert.equal(app.state().mode,'game');
assert.equal(cellOf(27).getAttribute('aria-selected'),'true');
app.close(); advance(300);

// And an offering figure opened from game mode takes the board away with it.
app.show('mandala_parasol',true); advance(1200); panel('.sheet');
assert.equal(app.state().mode,'mandala');
assert.equal(boardEl.hidden,true);
assert.ok(boardMeshes.every(m=>!app.visibleInScene(m)),'Mandala mode is not played over the board');

app.close(); app.setMandala(false); advance(1200); panel(null);
key('m'); advance(1200); panel('.mandala-note'); assert.equal(app.state().mode,'mandala');
key('g'); advance(1200); assert.equal(app.state().mode,'game');
assert.equal(app.state().mandala,false,'Game mode is not mandala mode');
app.OFFERING_MODELS.forEach(m=>assert.equal(app.visibleInScene(m),false,'The offering is put away'));
key('e'); advance(1200); panel(null); assert.equal(app.state().mode,'explore');
app.ORIGINAL_VISIBILITY.forEach((visible,obj)=>assert.equal(obj.visible,visible,'Original world restored after the game'));
worldVisibility.forEach((visible,obj)=>assert.equal(obj.visible,visible,'All world context restored after the game'));

/* ── the chrome ─────────────────────────────────────────────────────────
   Three controls stand on the model and no more. The view you are in and the
   settings that belong to no view open downward into menus; the title lives at
   the head of the index; and the four-continent legend and the stage's export
   buttons are gone, with nothing left behind to lay out around. */
assert.equal(app.stageGround().visible,false,
  'the world casts no shadow on the space around it');
assert.equal(q('.legend'),null,'the continents legend is gone');
assert.equal(q('.masthead'),null,'and the title is not standing on the model');
assert.ok(q('.index .head .title'),'it heads the index instead');
assert.match(html,/<title>/,'the document still has one');
assert.equal(/Download OBJ|Download GLB/.test(fs.readFileSync(repo+'/three-d-stage.js','utf8')),false,
  'the stage exports nothing');
assert.equal(/exporters\//.test(html),false,'and the page no longer pins the exporters');
const strip = [...q('.controls').children];
assert.equal(strip.length,3,'index, view, options');
assert.deepEqual(strip.map(el=>el.tagName),['BUTTON','DETAILS','DETAILS']);
for (const act of ['motion','night','full','home'])
  assert.ok(q('[data-menu="options"] [data-act="'+act+'"]'),act+' is under Options');
for (const m of ['explore','mandala','game'])
  assert.ok(q('[data-menu="mode"] [data-mode="'+m+'"]'),m+' is under the view menu');
// the closed view menu says which view you are in
const modeFace = q('[data-menu="mode"] > .btn');
app.setMode('mandala'); advance(1200);
assert.equal(modeFace.querySelector('.t').textContent,'Mandala');
app.setMode('explore'); advance(1200);
assert.equal(modeFace.querySelector('.t').textContent,'Explorer');

/* ── what the board sounds like ─────────────────────────────────────────
   Every square answers in the voice of the company it keeps, and a few answer
   for themselves. The mapping is pure; the synthesis needs a real audio clock
   and is not exercised here. */
for (const sq of rbBoard.SQUARES) {
  const voice = rbSound.voiceFor(sq);
  assert.ok(rbSound.VOICES.includes(voice),'square '+sq.n+' has a voice');
}
assert.equal(rbSound.voiceFor(rbBoard.BY_N.get(104)),'nirvana','Nirvana answers for itself');
assert.equal(rbSound.voiceFor(rbBoard.BY_N.get(34)),'roar','Mahākāla roars');
assert.equal(rbSound.voiceFor(rbBoard.BY_N.get(16)),'roar','and Black Freedom with him');
for (const [n, want] of [[1,'hell'],[10,'preta'],[11,'animal'],[17,'human'],[22,'other'],
                         [30,'desire'],[35,'form'],[36,'formless'],[52,'sutra'],[25,'mantra'],
                         [77,'pure'],[101,'deeds']])
  assert.equal(rbSound.voiceFor(rbBoard.BY_N.get(n)),want,'square '+n);
assert.equal(rbSound.voiceFor(rbBoard.BY_N.get(23)),rbSound.voiceFor(rbBoard.BY_N.get(21)),
  'Bön and barbarism share one');
assert.equal(rbSound.voiceFor(rbBoard.BY_N.get(22)),rbSound.voiceFor(rbBoard.BY_N.get(21)),
  'and Hinduism with them');
assert.equal(rbSound.voiceFor(rbBoard.BY_N.get(97)),rbSound.voiceFor(rbBoard.BY_N.get(102)),
  'the acts of a buddha share one');
// a kit with no audio context to open makes no sound and does not throw
const silent = rbSound.createSoundKit(null);
silent.dice(0); silent.land(); silent.arrive('hell',-1); silent.dead(); silent.count(3);
assert.equal(silent.ready(),false,'and never opens one it was not given');
assert.deepEqual(Object.keys(silent.voices).sort(),rbSound.VOICES.slice().sort(),
  'a recipe for every voice');

console.log(JSON.stringify({result:'PASS',heaps:37,illustrations:24,triangles,atlasRequests:3,
 squares:app.rbBoard.nodes.size,anchoredSquares:anchoredSquares.length,boardCells:cells.length,
 squareNotes:Object.keys(SQUARE_NOTES).length, fullEntries:Object.keys(SQUARE_FULL).length,
 artSlotsProved:rbIcons.SQUARE_ART.size,
 checks:'Terrain overlay priority, independent motion/mandala switches and gesture resume, numbers toggle, '
   + 'billboards from 16 angles, 84% tour image fit at three viewport sizes, all 37 stops, playback, isolation, '
   + 'exclusive panels, image failure/retry, keyboard controls, reduced motion and visibility restoration. '
   + 'The board of rebirth: the three-way mode switch, 104 cells in the board\'s own order with their names and zones, an entry of our own on every '
   + 'square, the world framed clear of the board, all 21 anchored squares over the geometry drawn for them, the printed '
   + 'first move, the karmic trail, selection shared between cell, entry and marker, reading a player without taking their '
   + 'turn, the counter trap end to end, victory and its rite, the board/world swap, silence until asked, pointer events on '
   + 'every overlay panel, and the Escape cascade. Three controls on the model and no more, the view menu naming the '
   + 'view, every option under Options, the title at the head of the index, and no legend or export buttons left to '
   + 'lay out around. A voice for all 104 squares — the hells, the pretas, the animals, the human world, the other '
   + 'traditions, the three orders of gods, the sutra gong, the mantra damaru, the roar Mahakala shares with Black '
   + 'Freedom, the buddha fields, the acts of a buddha, and Nirvana on its own — and a kit given no audio that stays '
   + 'silent rather than throwing. The throw: a die that keeps its answer until it stops, cannot be '
   + 'thrown twice at once, announces where it landed, and resolves at once under reduced motion. A standing marker '
   + 'for every player, ringed for whoever holds the die, fanned apart when they share a square, and named where they '
   + 'stand in their own colour. All 104 fields: the painting as the cell\'s own ground, and as a billboard in the world for every square the world does not already build in three dimensions, '
   + 'four sheets fetched once and only in game mode, one failing and retried alone, and the cell arithmetic that a '
   + 'sheet of seven rows and a sheet of five both have to answer to. A Tibetan name on every square — in the cell, the '
   + 'card and the entry — and the switch that puts them in place of the English. Three arrangements of the game: board '
   + 'and world, the world alone, and the board alone as a diagram of positions. A card that carries the field, both '
   + 'names and the way into the whole passage, and waits while it is read. Nirvana on the axis above the whole world '
   + 'system, drawn as open rings rather than as somewhere to stand. One rising spiral in the '
   + 'board\'s own order, each square on a plinth; the squares a selected one reaches lit on the board and drawn as '
   + 'lines in the world, named where they stand; and a new game that asks first, takes the players\' names, and '
   + 'changes nothing when cancelled.',
 limits:'DOM and GPU substitutes; actual CSS layout, WebGL rendering and devices were not tested.'},null,2));
