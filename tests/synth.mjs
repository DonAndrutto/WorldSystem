import assert from 'node:assert/strict';
import {createSynth} from '../synth.js';
import {createSoundKit,VOICES} from '../rebirth-sound.js';
import {createUiSound} from '../ui-sound.js';
import {createEndingSound} from '../ending-sound.js';
import {createFakeAudio} from './audio-fakes.mjs';

const {FakeContext,log}=createFakeAudio();
const synth=createSynth(FakeContext);
assert.equal(synth.ready(),false,'no context until something sounds');
const kit=createSoundKit(FakeContext,synth),ui=createUiSound(synth),ending=createEndingSound(synth);
assert.equal(FakeContext.opened,0);
kit.dice(.2);kit.land();kit.dead();kit.count(2);
for(const v of VOICES) kit.arrive(v,v.length%3-1);
ui.play('open');ending.update('wind',.5,true);
assert.equal(FakeContext.opened,1,'the game, the interface and the endings share one audio context');
assert.equal(synth.ready(),true);assert.equal(kit.ready(),true);
assert.ok(log.resumes>=1,'a suspended context is resumed by the first gesture');
assert.ok(log.oscillators.every(o=>o.stopped===undefined||o.stopped>=o.started),'no oscillator stops before it starts');

// the kit still works on its own, and stays silent without audio
const alone=createSoundKit(FakeContext);alone.arrive('nirvana',1);assert.equal(FakeContext.opened,2);
const none=createSoundKit(null);none.arrive('hell',-1);none.dice(0);assert.equal(none.ready(),false);
const refusing=createSynth(class{constructor(){throw new Error('refused');}});
assert.equal(refusing.open(),null,'a refusing browser leaves a quiet no-op');
console.log('PASS: one shared audio context for game, interface and endings; the square kit unchanged; refusal and absence are silent.');
