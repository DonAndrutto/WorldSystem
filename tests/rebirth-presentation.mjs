import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {Vector3} from 'three';
import {createRebirthUI} from '../rebirth-ui.js';
import {REBIRTH_PROSE} from '../rebirth-prose.js';
import {REBIRTH_ICONOGRAPHY} from '../rebirth-iconography.js';
import {ROLL_DURATION} from '../rebirth-presentation.js';
const dom=new JSDOM('<div><button class="marker"></button><aside></aside></div>',{url:'https://example.org',pretendToBeVisual:true});
const {window:w}=dom,doc=w.document;let reduced=false,now=0,id=0;
w.matchMedia=()=>({matches:reduced});
const timers=new Map();w.setTimeout=(fn,delay=0)=>{timers.set(++id,{fn,due:now+delay});return id;};w.clearTimeout=n=>timers.delete(n);
w.setInterval=(fn,delay)=>{const n=++id;timers.set(n,{fn,due:now+delay,repeat:delay});return n;};w.clearInterval=w.clearTimeout;
function tick(ms){const end=now+ms;while(timers.size){const [n,t]=[...timers].sort((a,b)=>a[1].due-b[1].due)[0];if(t.due>end)break;now=t.due;if(t.repeat)t.due+=t.repeat;else timers.delete(n);t.fn();}now=end;}
let audioContexts=0,notes=0;const parameter={setValueAtTime(){},exponentialRampToValueAtTime(){}};
w.AudioContext=class {constructor(){audioContexts++;this.currentTime=0;this.destination={};}resume(){return Promise.resolve();}createOscillator(){return {type:'',frequency:parameter,connect(){},disconnect(){},start(){notes++;},stop(){}};}createGain(){return {gain:parameter,connect(){},disconnect(){}};}};
let rollCount=0,focusCount=0,overviewCount=0;
const scene={points:new Map(Array.from({length:104},(_,i)=>[i+1,new Vector3(i/200,0,0)])),update(){},setActive(){},tokenPoint(){return new Vector3();}};
const ui=createRebirthUI({panel:doc.querySelector('aside'),marker:doc.querySelector('.marker'),scene,
  storage:w.localStorage,die:()=>{rollCount++;return 1;},onFocus:()=>focusCount++,onOverview:()=>overviewCount++,onChange(){}});
ui.setActive(true);ui.start(['Test traveller']);assert.equal(audioContexts,0,'Audio is created only by a roll gesture');
ui.advance();assert.equal(rollCount,1);assert.equal(ui.state.players[0].square,27);
assert.equal(JSON.parse(w.localStorage.getItem('ws-rebirth-v1')).players[0].square,27,'Resolved move is saved before animation');
assert.equal(ui.presentation.dialog.open,true);assert.match(ui.presentation.dialog.textContent,/The die is cast/);
ui.advance();assert.equal(rollCount,1,'Rapid repeat cannot roll again');
await Promise.resolve();assert.equal(audioContexts,1);assert.equal(notes,8,'Gentle rolling notes and arrival tones are scheduled');
tick(1600);assert.match(ui.presentation.dialog.querySelector('h2').textContent,/The die is cast/);
tick(100);assert.match(ui.presentation.dialog.querySelector('h2').textContent,/27.*Four Great Kings/);
assert.equal(ui.presentation.dialog.querySelector('button').disabled,true);
tick(ROLL_DURATION-1700);assert.equal(ui.presentation.dialog.querySelector('button').disabled,false);
ui.presentation.dialog.querySelector('button').click();assert.equal(ui.presentation.dialog.open,false);
doc.querySelector('[data-rb-board]').click();assert.equal(ui.fullBoard,true);assert.equal(overviewCount,1);
const focused=focusCount;ui.inspect(76);assert.equal(focusCount,focused,'Inspection retains full-board camera when enabled');
doc.querySelector('[data-rb-board]').click();assert.equal(ui.fullBoard,false);assert.ok(focusCount>focused);
assert.equal(doc.querySelectorAll('.rb-player-pin').length,1);assert.match(doc.querySelector('.rb-player-pin').textContent,/P1Test traveller27/);
for(let n=1;n<=104;n++) {
  ui.inspect(n,false);
  const text=[...doc.querySelectorAll('.rb-prose p')].map(p=>p.textContent).join('\n\n');
  assert.equal(text.replace(/\s+/g,' '),REBIRTH_PROSE[n].text.replace(/\s+/g,' '));
  assert.equal(doc.querySelector('.rb-full-passage').open,false);
  assert.equal(REBIRTH_ICONOGRAPHY[n].square,n);
}
ui.advance(); // next turn, no die
ui.advance(); // second roll
assert.equal(rollCount,2);const committed=JSON.stringify(ui.state);
ui.setActive(false);assert.equal(ui.presentation.dialog.open,false);assert.equal(JSON.stringify(ui.state),committed);
tick(4000);assert.equal(JSON.stringify(ui.state),committed,'Canceling presentation cannot reroll or undo the saved move');
ui.setActive(true);assert.equal(doc.querySelector('.rb-player-markers').hidden,false);
ui.advance();doc.querySelector('.rb-sound').click();const notesBefore=notes;ui.advance();await Promise.resolve();assert.equal(notes,notesBefore,'Muted roll schedules no audio');
ui.presentation.cancel();ui.advance();reduced=true;ui.advance();
assert.equal(ui.presentation.dialog.querySelector('button').disabled,false,'Reduced-motion mode reveals immediately');
assert.equal(timers.size,0);ui.presentation.cancel();
console.log('PASS: 2.5-second reveal, one committed result per roll, interruption safety, opt-out sound, reduced motion, all 104 expandable passages, player labels, full-board toggle and 104 iconography slots.');
