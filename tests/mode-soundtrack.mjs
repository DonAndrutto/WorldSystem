import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createModeSoundtrack,MODE_TRACKS} from '../mode-soundtrack.js';

const MODES=['explore','mandala','game','wheel','worlds','astrology'];
assert.deepEqual(Object.keys(MODE_TRACKS),MODES,'a score for each of the six modes');
const files=MODES.map(m=>MODE_TRACKS[m].src.split('/assets/audio/')[1]);
assert.equal(new Set(files).size,6,'every mode has a distinct score');
assert.equal(new Set(MODES.map(m=>MODE_TRACKS[m].title)).size,6,'and a distinct title');
for(const f of files) assert.ok(fs.statSync(new URL('../assets/audio/'+f,import.meta.url)).size>500000,f+' is shipped');
assert.match(MODE_TRACKS.game.src,/still-waters\.mp3$/,'Game keeps Still Waters');

const timers=new Map();let serial=0;const created=[];
class Audio {
  static blocked=false;
  constructor(src){this.src=src;this.paused=true;this.volume=1;this.loop=false;this.plays=0;created.push(this);}
  play(){this.plays++;if(Audio.blocked)return Promise.reject(new Error('blocked'));this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
}
const make=()=>createModeSoundtrack({AudioClass:Audio,setTimer:fn=>{const id=++serial;timers.set(id,fn);return id;},clearTimer:id=>timers.delete(id)});
const tick=()=>{for(let i=0;i<20;i++)for(const fn of [...timers.values()])fn();};
const settle=async()=>{for(let i=0;i<4;i++)await Promise.resolve();};

const score=make();
assert.equal(created.length,0,'nothing is created or fetched before a mode is entered');
score.setMode('explore');await settle();tick();
assert.equal(created.length,1);assert.equal(created[0].src,MODE_TRACKS.explore.src);
assert.equal(score.state().playing,true,'Explorer has a score of its own');
assert.equal(created[0].loop,true);assert.equal(created[0].preload,'none');

// changing mode fades the old score out and the new one in, and fetches only the new
score.setMode('wheel');await settle();tick();
assert.equal(created.length,2,'only the entered mode gets a player');
assert.equal(created[0].paused,true,'the old score stops');
assert.equal(created[1].src,MODE_TRACKS.wheel.src);assert.equal(created[1].paused,false);
assert.ok(created[1].volume>.3&&created[1].volume<.5);
score.setMode('explore');await settle();tick();
assert.equal(created.length,2,'returning reuses the first player');
assert.equal(created[0].paused,false);assert.equal(created[1].paused,true);
assert.deepEqual(score.state().players,['explore','wheel']);

// a visit to every mode makes one player per mode, each with its own file
for(const m of MODES){score.setMode(m);await settle();tick();}
assert.equal(created.length,6);assert.equal(new Set(created.map(a=>a.src)).size,6);
assert.equal(created.filter(a=>!a.paused).length,1,'one score at a time');
assert.equal(score.state().title,'Twenty-Eight Mansions');

// mute, visibility and ducking apply to the whole set
score.setEnabled(false);tick();assert.ok(created.every(a=>a.paused),'muting stops the score');
score.setEnabled(true);await settle();tick();assert.equal(score.state().playing,true);
score.setVisible(false);assert.ok(created.every(a=>a.paused),'a hidden page pauses at once');
score.setVisible(true);await settle();tick();assert.equal(score.state().playing,true);
const full=created.at(-1).volume;score.setLevel(.3);tick();
assert.ok(Math.abs(created.at(-1).volume-full*.3)<1e-9,'ducking turns the score down');assert.equal(created.at(-1).paused,false,'without stopping it');
score.setLevel(1);tick();assert.ok(Math.abs(created.at(-1).volume-full)<1e-9);

// a player made while muted, hidden or ducked starts in that state
const quiet=make();quiet.setEnabled(false);quiet.setMode('astrology');await settle();tick();
assert.equal(quiet.state().playing,false,'a muted visit starts nothing');
assert.equal(created.length,6,'and nothing is fetched while muted');quiet.setEnabled(true);await settle();tick();assert.equal(created.length,7);assert.equal(quiet.state().playing,true);quiet.dispose();

// unknown modes silence everything; blocked autoplay retries on the next gesture
score.setMode('nowhere');tick();assert.ok(created.every(a=>a.paused));assert.equal(score.state().mode,null);
Audio.blocked=true;const blocked=make();blocked.setMode('mandala');await settle();assert.equal(blocked.state().playing,false);
Audio.blocked=false;blocked.unlock();await settle();tick();assert.equal(blocked.state().playing,true,'the next gesture starts it');

score.dispose();quiet.dispose();blocked.dispose();score.setMode('game');await settle();tick();
assert.ok(created.every(a=>a.paused),'a disposed score stays stopped');
assert.equal(timers.size,0,'no fade timer outlives it');
const none=createModeSoundtrack({AudioClass:null});none.setMode('wheel');none.unlock();none.dispose();
assert.equal(none.state().playing,false,'no audio support leaves the app usable');
console.log('PASS: six distinct mode scores, lazy per-mode players, crossfade on change, mute/visibility/ducking, autoplay retry and cleanup.');
