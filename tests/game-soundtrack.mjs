import assert from 'node:assert/strict';
import {createGameSoundtrack} from '../game-soundtrack.js';

let serial=0,players=0;
const timers=new Map();
class Audio {
  static blocked=false;
  static last=null;
  constructor(src) {this.src=src;this.paused=true;this.volume=1;this.plays=0;players++;Audio.last=this;}
  play() {this.plays++;if(Audio.blocked)return Promise.reject(new Error('Autoplay blocked'));this.paused=false;return Promise.resolve();}
  pause() {this.paused=true;}
}
const create=()=>createGameSoundtrack({AudioClass:Audio,setTimer:fn=>{const id=++serial;timers.set(id,fn);return id;},clearTimer:id=>timers.delete(id)});
const tick=()=>{for(let i=0;i<16;i++) for(const fn of [...timers.values()]) fn();};
const settle=async()=>{await Promise.resolve();await Promise.resolve();};
const score=create();
assert.equal(score.state().enabled,true,'Music starts enabled');
score.unlock();assert.equal(players,0,'Explorer does not fetch or play the score');
score.setActive(true);await settle();tick();
assert.equal(players,1);assert.equal(Audio.last.loop,true);
assert.equal(Audio.last.preload,'none');assert.ok(Audio.last.volume>0 && Audio.last.volume<.5);
assert.equal(score.state().playing,true,'Entering game starts music');
const plays=Audio.last.plays;
score.unlock();score.unlock();await settle();assert.equal(Audio.last.plays,plays,'Clicks do not restart the score');
score.setEnabled(false);tick();assert.equal(Audio.last.paused,true,'Muting fades and pauses');
score.setEnabled(true);await settle();tick();assert.equal(Audio.last.paused,false);
score.setVisible(false);assert.equal(Audio.last.paused,true,'Hidden pages pause immediately');
assert.equal(timers.size,0,'Background pages retain no fade timer');
score.setVisible(true);await settle();tick();assert.equal(Audio.last.paused,false);
score.setActive(false);tick();assert.equal(Audio.last.paused,true,'Leaving game pauses music');
score.setActive(true);score.setEnabled(false);await settle();assert.equal(Audio.last.paused,true,'Late play resolution cannot undo mute');
score.setEnabled(true);await settle();tick();score.dispose();assert.equal(Audio.last.paused,true);
score.unlock();await settle();assert.equal(Audio.last.paused,true,'A disposed player remains stopped');

Audio.blocked=true;
const blocked=create();blocked.setActive(true);await settle();
assert.equal(blocked.state().pending,false,'A blocked autoplay promise is handled');
assert.equal(blocked.state().playing,false);
Audio.blocked=false;blocked.unlock();await settle();tick();
assert.equal(blocked.state().playing,true,'The next interaction retries blocked playback');
blocked.dispose();
const unsupported=createGameSoundtrack({AudioClass:null});unsupported.setActive(true);unsupported.unlock();unsupported.dispose();
assert.equal(unsupported.state().playing,false,'Unsupported audio leaves the game usable');
assert.equal(timers.size,0,'All player fade timers are cleaned up');
console.log('PASS: music defaults, game-only playback, quiet looping, mute, visibility, autoplay retry and rapid-toggle cleanup.');
