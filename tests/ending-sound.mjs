import assert from 'node:assert/strict';
import {soundscape,createEndingSound} from '../ending-sound.js';
import {ENDINGS} from '../world-ending.js';
import {createSynth} from '../synth.js';
import {createFakeAudio} from './audio-fakes.mjs';

const kinds=Object.keys(ENDINGS);
const layers=['low','mid','high','a','b'];

// the pure part: every moment of every ending is bounded, and silent when the world is gone
for(const kind of kinds) for(let i=0;i<=100;i++){
  const s=soundscape(kind,i/100);
  for(const l of layers){
    assert.ok(Number.isFinite(s[l].gain)&&s[l].gain>=0&&s[l].gain<.25,`${kind} ${l} gain at ${i}%: ${s[l].gain}`);
    assert.ok(s[l].f>=20&&s[l].f<8000,`${kind} ${l} frequency`);
  }
  for(const [name,rate] of Object.entries(s.rates)) assert.ok(rate>=0&&rate<60,`${kind} ${name} rate`);
}
for(const kind of kinds){
  const end=soundscape(kind,1);
  assert.ok(layers.every(l=>end[l].gain===0)&&Object.values(end.rates).every(r=>r===0),kind+' ends in silence');
  assert.equal(end.empty,true);
  const mid=soundscape(kind,.55);
  assert.ok(layers.some(l=>mid[l].gain>.02),kind+' is audible mid-way');
}

// each ending is heard as itself
const fire=soundscape('fire',.6),water=soundscape('water',.6),wind=soundscape('wind',.6);
assert.ok(fire.rates.crackle>10&&water.rates.crackle===0&&wind.rates.crackle===0,'only fire crackles');
assert.ok(water.rates.surge>.5&&fire.rates.surge===0&&wind.rates.surge===0,'only water surges');
assert.ok(water.rates.bubble===0&&soundscape('water',.9).rates.bubble>5,'the flood dissolves into bubbles');
assert.ok(wind.rates.rattle>5&&wind.rates.whistle>.2&&fire.rates.rattle===0,'only wind rattles and whistles');
assert.ok(wind.mid.q>water.mid.q&&wind.mid.f>water.mid.f,'wind is higher and narrower than a flood');
assert.ok(soundscape('fire',.3).rates.crackle<soundscape('fire',.5).rates.crackle,'fire thickens as the suns rise');
assert.ok(soundscape('fire',.9).a.f<soundscape('fire',.7).a.f,'and the drone sinks as the world is lost');
assert.equal(soundscape('fire',.1).suns,1);assert.equal(soundscape('fire',.8).suns,7);
assert.ok(soundscape('wind',.5).mid.f>soundscape('wind',.1).mid.f,'the gale climbs through the registers');
assert.ok(soundscape('water',.6).low.gain>soundscape('water',.1).low.gain,'the flood grows');

// the engine
let seed=1;const random=()=>(seed=(seed*16807)%2147483647)/2147483647;
function rig(){
  const {FakeContext,log}=createFakeAudio();
  const ctxs=[];const Ctx=class extends FakeContext{constructor(){super();ctxs.push(this);}};
  const synth=createSynth(Ctx);
  return {synth,log,ctx:()=>ctxs[0],sound:createEndingSound(synth,{random}),FakeContext};
}
{
  const r=rig();
  r.sound.update('fire',.2,false);
  assert.equal(r.FakeContext.opened,1,'scrubbing opens the context but builds nothing');
  assert.equal(r.log.sources.length,0);assert.equal(r.sound.state().sounding,false,'a paused ending is silent');
  r.sound.update('fire',.5,true);
  assert.equal(r.sound.state().kind,'fire');
  assert.equal(r.log.sources.length>=3,true,'three noise beds');
  const beds=r.log.sources.length,hums=r.log.oscillators.length;
  assert.ok(hums>=2,'and two drones');
  r.ctx().currentTime=.1;r.sound.update('fire',.55,true);
  assert.equal(r.log.sources.length>beds,true,'a burning moment adds crackles to the beds');
  assert.equal(r.log.oscillators.length,hums+0,'the sustained layers are not rebuilt');
  // a new sun is announced once
  const tonesBefore=r.log.oscillators.length;
  r.ctx().currentTime=.3;r.sound.update('fire',.67,true); // the sixth sun
  assert.equal(r.log.oscillators.length-tonesBefore>=1,true,'a new sun swells');
  const afterSun=r.log.oscillators.length;
  r.ctx().currentTime=.4;r.sound.update('fire',.68,true);
  assert.equal(r.log.oscillators.length,afterSun,'but only once');
  // pausing fades the bed rather than cutting
  const bus=r.log.gains.find(g=>g.gain.calls.some(c=>c[0]==='target'&&c[1]===1));
  r.sound.update('fire',.68,false);
  assert.equal(bus.gain.calls.at(-1)[1],0,'pause fades the bus');
  assert.equal(bus.gain.calls.at(-1)[3]<.5,true);
  // switching ending replaces the soundscape
  r.ctx().currentTime=1;r.sound.update('water',0.3,true);
  assert.equal(r.sound.state().kind,'water');
  assert.ok(r.log.sources.some(s=>s.stopped!==undefined),'the fire beds are told to stop');
  // the world is gone: one bowl, once, then quiet
  r.ctx().currentTime=2;const before=r.log.oscillators.length;
  r.sound.update('water',.97,true);
  const bowl=r.log.oscillators.length-before;assert.ok(bowl>=3,'a struck bowl for emptiness');
  r.ctx().currentTime=2.1;r.sound.update('water',.99,true);
  assert.equal(r.log.oscillators.length-before,bowl,'sounded once');
  r.sound.stop();assert.equal(r.sound.state().sounding,false);
  r.sound.stop();
}
{
  // wind and water both build and run without error through a whole presentation
  for(const kind of kinds){
    const r=rig();
    for(let i=0;i<=200;i++){const c=r.ctx();if(c)c.currentTime=i*.16;r.sound.update(kind,i/200,true);}
    r.sound.update(kind,1,false);r.sound.stop();
  }
}
{
  const dead=createEndingSound(createSynth(null));
  dead.update('fire',.5,true);dead.stop();
  assert.equal(dead.state().sounding,false,'no audio support, no error');
}
console.log('PASS: bounded soundscapes for fire, water and wind, each in its own voice, silent at the end; engine fades, announces suns once, strikes one bowl and cleans up.');
