import assert from 'node:assert/strict';
import {REBIRTH_SQUARES,REBIRTH_OUTCOMES,getRebirthOutcome} from '../rebirth-data.js';
import {createGame,rollGame,nextPlayer,rollCeremony,restoreGame,chooseStarter,rollDie} from '../rebirth-engine.js';
import {REBIRTH_WORLD_MAP} from '../rebirth-world-map.js';

assert.equal(REBIRTH_SQUARES.length,104); assert.equal(REBIRTH_OUTCOMES.length,624);
assert.equal(REBIRTH_WORLD_MAP.length,104);
assert.ok(Object.isFrozen(REBIRTH_OUTCOMES[0]));
assert.equal(getRebirthOutcome(23,6).to,4);assert.equal(getRebirthOutcome(76,3).to,73);assert.equal(getRebirthOutcome(76,5).to,76);
assert.equal(getRebirthOutcome(44,3).to,45);assert.equal(getRebirthOutcome(45,3).to,46);assert.equal(getRebirthOutcome(33,5).to,16);
const at=n=>{const s=createGame(['One','Two']);s.players[0].square=n;s.players[0].counters=[1,48].includes(n)?[0,0,0,0,0,0]:null;return s;};
for(const o of REBIRTH_OUTCOMES) {
  if([1,48,104].includes(o.from))continue;
  const before=at(o.from),serialized=JSON.stringify(before),after=rollGame(before,o.die);
  assert.equal(JSON.stringify(before),serialized,'Resolution must not mutate its input');
  assert.equal(after.players[0].square,o.to);
  assert.equal(after.phase,o.to===104?'won':'turn_complete');
  assert.ok(restoreGame(after),'Every resolved ordinary outcome can be saved');
  assert.equal(rollGame(after,1),after,'A completed turn cannot be rolled again');
}
for(const [square,exit] of [[1,9],[48,52]]) {
  let s=at(square);s=rollGame(s,1);assert.equal(s.phase,'awaiting_roll');
  s=rollGame(s,1);assert.equal(s.phase,'turn_complete');assert.equal(s.last.kind,'unneeded');
  s=nextPlayer(s);assert.equal(s.active,1);s=nextPlayer(rollGame(s,3));assert.equal(s.active,0);
  assert.deepEqual(s.players[0].counters,[1,0,0,0,0,0],'Progress persists between turns');
  for(let die=2;die<=6;die++)for(let i=0;i<die;i++)s=rollGame(s,die);
  assert.equal(s.players[0].square,exit);assert.equal(s.players[0].counters,null);assert.equal(s.phase,'turn_complete');
  assert.equal(s.last.kind,'escaped');assert.ok(restoreGame(s));
  const entry=REBIRTH_OUTCOMES.find(o=>o.to===square&&![1,48,104].includes(o.from));
  const reentry=rollGame(at(entry.from),entry.die);
  assert.deepEqual(reentry.players[0].counters,[0,0,0,0,0,0]);assert.equal(reentry.phase,'turn_complete');
}
let seq=[2,2,4,5,1];let opening=chooseStarter(3,()=>seq.shift());assert.equal(opening.starter,1);assert.equal(opening.rounds.length,2);
assert.equal(chooseStarter(1,()=>{throw Error('Solo needs no preliminary die');}).starter,0);
assert.throws(()=>chooseStarter(2,()=>1),/tying/);
let twice=createGame();for(let i=0;i<10;i++)twice=nextPlayer(rollGame(twice,2));assert.equal(twice.players[0].square,93);
let ones=createGame();for(let i=0;i<10;i++)ones=nextPlayer(rollGame(ones,1));assert.equal(ones.players[0].square,94);
ones=nextPlayer(rollGame(ones,1));assert.equal(ones.players[0].square,93);
// Find a real route to victory and play it from setup, using only legal turns.
const queue=[[24,[]]],seen=new Set([24]);let winningPath;
while(queue.length){const [square,path]=queue.shift();if(square===104){winningPath=path;break;}for(let die=1;die<=6;die++){const to=getRebirthOutcome(square,die).to;if(!seen.has(to)&&![1,48].includes(to)){seen.add(to);queue.push([to,[...path,die]]);}}}
assert.ok(winningPath);let win=createGame();for(const die of winningPath)win=nextPlayer(rollGame(win,die));
assert.equal(win.phase,'won');assert.equal(win.winner,0);assert.equal(rollGame(win,6),win);
const ceremony=rollCeremony(rollCeremony(win,6),2);assert.equal(ceremony.ceremony.inStupa,true);assert.equal(ceremony.winner,0);assert.ok(restoreGame(ceremony));
assert.equal(rollCeremony(ceremony,5),ceremony);
for(const mutation of [s=>s.profile='unknown',s=>s.players[0].square=0,s=>s.players[0].name='',s=>s.active=12,s=>s.phase='won',s=>s.players[0].counters=[1],s=>s.history=[{}]]) {const s=createGame();mutation(s);assert.equal(restoreGame(s),null);}
assert.equal(restoreGame('{broken'),null);assert.deepEqual(restoreGame(JSON.stringify(createGame())),createGame());
let numbers=[4294967295,5];assert.equal(rollDie({getRandomValues(a){a[0]=numbers.shift();}}),6,'Dice reject the biased tail');
for(const bad of [0,7,1.2,NaN])assert.throws(()=>rollGame(createGame(),bad));
console.log(`PASS: 104 squares, 624 outcomes, all ordinary moves, both traps, save validation, preliminary ties, historical corrections and a ${winningPath.length}-roll legal winning journey.`);
