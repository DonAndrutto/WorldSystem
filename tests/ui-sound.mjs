import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {cueFor,createUiSound,installUiSound} from '../ui-sound.js';
import {createSynth} from '../synth.js';
import {createFakeAudio} from './audio-fakes.mjs';

const dom=new JSDOM(`<body>
<details class="menu"><summary id="menu" class="btn">Options</summary><div>
  <button id="plain" class="btn">Night</button>
  <button id="pressed" aria-pressed="false">Names</button>
  <button id="off" disabled>Off</button>
  <button id="aria-off" aria-disabled="true">Off</button>
  <button data-mode="wheel" id="mode"><span id="mode-inner">Wheel</span></button>
  <label class="btn sw" id="lbl" for="box"><span id="lbl-text">Music</span><input type="checkbox" id="box"></label>
  <label id="loose">Nothing for</label>
  <input type="radio" id="radio"><input type="text" id="text"><input type="range" id="range" min="0" max="100" value="50">
  <select id="pick"><option>a</option><option>b</option></select>
  <a href="#x" id="link">Link</a>
</div></details>
<div id="intro"><button data-intro-mode="astrology" id="card">Astrology</button></div>
<section data-silent><button id="throw">Throw</button></section>
<button id="x1">×</button><button id="x2" aria-label="Close help">?</button><button id="x3" data-close>done</button>
<div role="tablist"><button role="tab" id="tab">Natal</button></div>
<div id="empty">just text</div>
</body>`,{pretendToBeVisual:true});
const doc=dom.window.document,$=id=>doc.getElementById(id);
const cue=id=>cueFor($(id));

assert.deepEqual(cue('plain'),{cue:'tap'});
assert.deepEqual(cue('pressed'),{cue:'select'},'a held button is a selection');
assert.deepEqual(cue('tab'),{cue:'select'});
assert.deepEqual(cue('link'),{cue:'tap'});
assert.equal(cue('off'),null,'disabled controls are silent');
assert.equal(cue('aria-off'),null);
assert.equal(cue('throw'),null,'data-silent opts out, as the die has its own sounds');
assert.equal(cue('empty'),null,'plain text makes no sound');
assert.deepEqual(cue('mode'),{cue:'mode',mode:'wheel'});
assert.deepEqual(cueFor($('mode-inner')),{cue:'mode',mode:'wheel'},'a press on the inside of a mode button is the button');
assert.deepEqual(cue('card'),{cue:'mode',mode:'astrology'},'so is a mode card on the introduction');
for(const id of ['x1','x2','x3']) assert.deepEqual(cue(id),{cue:'close'},id);
assert.deepEqual(cue('menu'),{cue:'open'},'a closed menu opens');
$('menu').parentElement.open=true;assert.deepEqual(cue('menu'),{cue:'close'},'and an open one closes');
assert.equal(cue('lbl'),null,'a label hands its press to the box it holds, which sounds once');
assert.equal(cueFor($('lbl-text')),null);
assert.deepEqual(cue('loose'),{cue:'tap'},'a label with no control is a press');
$('box').checked=true;assert.deepEqual(cue('box'),{cue:'on'});
$('box').checked=false;assert.deepEqual(cue('box'),{cue:'off'});
assert.deepEqual(cue('radio'),{cue:'select'});
assert.equal(cue('text'),null,'typing is silent');
assert.equal(cue('range'),null,'a slider ticks as it moves, not when pressed');
assert.equal(cue('pick'),null,'a select is heard when it changes');
assert.equal(cueFor(null),null);

// the synth: each cue makes sound, repeats within a moment are one press, the modes differ
const {FakeContext,log}=createFakeAudio();
const synth=createSynth(FakeContext);
const ui=createUiSound(synth);
assert.equal(FakeContext.opened,0,'no audio context before the first press');
assert.equal(ui.play('nonsense'),false);
assert.equal(ui.play('tap'),true);
assert.equal(FakeContext.opened,1);assert.ok(log.oscillators.length>=1&&log.sources.length>=1);
assert.equal(ui.play('tap'),false,'the same press seen twice sounds once');
for(const name of ui.cues.filter(c=>c!=='tap'&&c!=='mode')) {
  const before=log.oscillators.length;
  assert.equal(ui.play(name,.5,0),true,name);
  assert.ok(log.oscillators.length>before||log.sources.length>0,name+' makes sound');
}
const heard={};
for(const m of ui.modes){
  const start=log.oscillators.length,skinStart=log.sources.length;
  assert.equal(ui.play('mode',m,0),true,m);
  heard[m]=[log.oscillators.slice(start).map(o=>Math.round(o.frequency.calls[0][1])).join(','),log.sources.length-skinStart].join('|');
}
assert.deepEqual(ui.modes,['explore','mandala','game','wheel','worlds','astrology']);
assert.equal(new Set(Object.values(heard)).size,6,'each mode has a chime of its own: '+JSON.stringify(heard));
assert.equal(ui.play('mode','unknown',0),true,'an unknown mode falls back to Explorer rather than failing');
const dead=createUiSound(createSynth(null));assert.equal(dead.play('tap'),false,'no audio support, no error');

// listening to the page
const played=[];
const sound={play:(c,a)=>played.push(a===undefined?c:c+':'+a)};
let on=true;
const stop=installUiSound({root:doc,sound,isOn:()=>on,trusted:()=>true});
$('plain').click();$('mode').click();$('card').click();$('x2').click();$('throw').click();$('off').click();
assert.deepEqual(played.splice(0),['tap','mode:wheel','mode:astrology','close']);
$('box').click();assert.deepEqual(played.splice(0),['on'],'a switch sounds once, not once for the label and once for the box');
$('lbl').click();assert.deepEqual(played.splice(0),['off'],'a label press reaches the box and sounds as the box');
$('menu').click();assert.deepEqual(played.splice(0),['close']);
$('pick').dispatchEvent(new dom.window.Event('change',{bubbles:true}));assert.deepEqual(played.splice(0),['select']);
$('range').value='75';$('range').dispatchEvent(new dom.window.Event('input',{bubbles:true}));assert.deepEqual(played.splice(0),['tick:0.75']);
$('text').dispatchEvent(new dom.window.Event('input',{bubbles:true}));assert.deepEqual(played,[],'typing is silent');
on=false;$('plain').click();assert.deepEqual(played,[],'the Sound switch silences it at once');
on=true;stop();$('plain').click();assert.deepEqual(played,[],'and removing the listener ends it');

// presses the page makes for itself are not heard
const stopTrusted=installUiSound({root:doc,sound});
$('plain').click();assert.deepEqual(played,[],'a scripted click (a tour, the introduction) is silent');
stopTrusted();
console.log('PASS: control-to-cue mapping, single sound per switch, per-mode chimes, silent scripted clicks, Sound switch and cleanup.');
