// Run with Node, three@0.184.0 and jsdom@26. Uses real OrbitControls.
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {PerspectiveCamera, Vector3} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {fileURLToPath, pathToFileURL} from 'node:url';
const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const {installViewportGestures} = await import(pathToFileURL(repo + '/viewport-gestures.js'));
const {window} = new JSDOM('<div id="stage"></div><div id="marks"><button class="mk">17</button></div><aside id="menu">Menu</aside>', {pretendToBeVisual:true});
const doc=window.document, canvas=doc.createElement('canvas');
doc.querySelector('#stage').attachShadow({mode:'open'}).append(canvas);
canvas.setPointerCapture=()=>{}; canvas.releasePointerCapture=()=>{};
Object.defineProperties(canvas,{clientWidth:{value:800},clientHeight:{value:600}});
canvas.getBoundingClientRect=()=>({left:0,top:0,width:800,height:600});
window.PointerEvent=class extends window.MouseEvent {
  constructor(type, init={}) {
    super(type,init);
    Object.defineProperties(this,{
      pointerId:{value:init.pointerId||1},pointerType:{value:init.pointerType||'touch'},isPrimary:{value:init.isPrimary??true}
    });
  }
};
const camera=new PerspectiveCamera(42,4/3,.01,100); camera.position.set(0,3,8);
const controls=new OrbitControls(camera,canvas);
const marks=doc.querySelector('#marks'), marker=marks.querySelector('button'), menu=doc.querySelector('#menu');
const gestures=installViewportGestures({canvas,marks,camera,controls,invalidate(){}});
const distance=()=>camera.position.distanceTo(controls.target);
const wheel=(target,ctrlKey=false)=>{
  const event=new window.WheelEvent('wheel',{deltaY:-80,ctrlKey,bubbles:true,composed:true,cancelable:true});
  target.dispatchEvent(event);return event;
};
let before=distance();
assert.ok(wheel(canvas,true).defaultPrevented); assert.ok(distance()<before,'Canvas trackpad pinch zooms the camera');
before=distance();
assert.ok(wheel(menu,true).defaultPrevented); assert.equal(distance(),before,'Menu pinch cannot zoom the page or camera');
assert.equal(wheel(menu).defaultPrevented,false,'Ordinary menu scrolling is preserved');
assert.ok(wheel(marker,true).defaultPrevented); assert.ok(distance()<before,'Wheel over a number reaches OrbitControls');

const pointer=(target,type,id,x)=>{
  const event=new window.PointerEvent(type,{pointerId:id,pointerType:'touch',clientX:x,clientY:200,buttons:1,bubbles:true,composed:true,cancelable:true});
  target.dispatchEvent(event);return event;
};
let taps=0; marker.addEventListener('click',()=>taps++);
pointer(marker,'pointerdown',1,100); pointer(canvas,'pointerdown',2,200);
before=distance(); pointer(doc,'pointermove',1,70); pointer(doc,'pointermove',2,230);
assert.ok(distance()<before,'Pinch beginning on a number zooms the camera');
assert.equal(gestures.allowScenePick(pointer(canvas,'pointerup',1,70)),false);
assert.equal(gestures.allowScenePick(pointer(canvas,'pointerup',2,230)),false);
await Promise.resolve(); assert.equal(taps,0,'A pinch never selects an offering');
pointer(marker,'pointerdown',3,100);
assert.equal(gestures.allowScenePick(pointer(canvas,'pointerup',3,100)),false);
await Promise.resolve(); assert.equal(taps,1,'A marker tap still selects the offering once');

const gesture=(target,type,scale)=>{
  const event=new window.Event(type,{bubbles:true,composed:true,cancelable:true});
  Object.defineProperty(event,'scale',{value:scale});target.dispatchEvent(event);return event;
};
before=distance();
gesture(canvas,'gesturestart',1);wheel(canvas,true);
assert.equal(distance(),before,'Safari wheel events do not double-apply native gesture zoom');
assert.ok(gesture(canvas,'gesturechange',1.5).defaultPrevented);
assert.ok(Math.abs(distance()-before/1.5)<1e-8,'Safari gesture fallback zooms the camera');
gesture(canvas,'gestureend',1.5);
before=distance();gesture(menu,'gesturestart',1);gesture(menu,'gesturechange',2);gesture(menu,'gestureend',2);
assert.equal(distance(),before,'Safari menu pinch changes neither the camera nor page scale');
pointer(canvas,'pointerdown',4,100);pointer(canvas,'pointerdown',5,200);
gesture(canvas,'gesturestart',1);gesture(canvas,'gesturechange',2);
assert.equal(distance(),before,'Native gestures do not double-apply pointer pinch');
pointer(canvas,'pointerup',4,100);gesture(canvas,'gesturechange',2.1);
assert.equal(distance(),before,'Lifting a finger does not switch to a second zoom stream');
pointer(canvas,'pointerup',5,200);gesture(canvas,'gestureend',2);
const touch=(count)=>{
  const event=new window.Event('touchmove',{bubbles:true,cancelable:true});
  Object.defineProperty(event,'touches',{value:Array(count).fill({})});menu.dispatchEvent(event);return event;
};
assert.ok(touch(2).defaultPrevented,'Multi-touch cannot magnify the UI');
assert.equal(touch(1).defaultPrevented,false,'Single-finger menu scrolling remains native');
const key=new window.KeyboardEvent('keydown',{key:'+',ctrlKey:true,bubbles:true,cancelable:true});
menu.dispatchEvent(key);assert.equal(key.defaultPrevented,false,'Browser keyboard zoom remains available');
controls.autoRotate=true;before=camera.position.clone();controls.update(1);
assert.ok(camera.position.distanceTo(before)>0,'Real controls turn the viewing angle');
controls.autoRotate=false; controls.target.set(0,0,0); camera.position.set(0,8,.0015); controls.update(); camera.updateMatrixWorld();
const heap=new Vector3(1,0,1), initial=heap.clone().project(camera);
controls.autoRotate=true; controls.update(1); camera.updateMatrixWorld();
assert.ok(heap.clone().project(camera).distanceTo(initial)>.001,'An overhead mandala still turns its heap positions on screen');
controls.dispose();
console.log('PASS: real OrbitControls wheel/pinch, marker gesture routing and tap, Safari gesture fallback, no double pinch, menu scrolling, keyboard zoom and rotation. Native browser gesture recognition and physical devices are not simulated.');
