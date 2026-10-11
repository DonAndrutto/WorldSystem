import assert from 'node:assert/strict';
import {ENDINGS,endingState} from '../world-ending.js';
assert.deepEqual(Object.keys(ENDINGS),['fire','water','wind']);
const sunCounts=Array.from({length:7},(_,i)=>endingState('fire',i/9).suns);
assert.deepEqual(sunCounts,[1,2,3,4,5,6,7]);
for(const kind of Object.keys(ENDINGS)){
 const start=endingState(kind,0),end=endingState(kind,1);
 assert.equal(start.loss,0);assert.equal(end.loss,1);assert.equal(end.empty,true);
 assert.equal(endingState(kind,2).progress,1);assert.equal(endingState(kind,-1).progress,0);
 assert.ok(end.copy.includes(ENDINGS[kind].spared));
}
assert.equal(endingState('fire',.5).loss,0,'water dries before Meru burns');
assert.equal(endingState('water',.5).suns,0);assert.equal(endingState('wind',.5).suns,0);
assert.match(endingState('wind',.5).copy,/56 fire.*seven water/);
console.log('PASS seven distinct sun stages, separate calamities, cycle counts, boundary explanations and bounded progress');
