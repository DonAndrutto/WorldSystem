import assert from 'node:assert/strict';
import { createPresentationPlayer, PRESENTATION_PACES } from '../presentation-tours.js';

for (const seconds of PRESENTATION_PACES) {
  let now = 0, serial = 0;
  const timers = new Map(), visits = [];
  const clock = {
    setTimeout(fn, delay) { const id = ++serial; timers.set(id, {fn, due: now + delay}); return id; },
    clearTimeout(id) { timers.delete(id); }
  };
  const advance = ms => {
    const end = now + ms;
    while (timers.size) {
      const [id, timer] = [...timers].sort((a,b) => a[1].due - b[1].due)[0];
      if (timer.due > end) break;
      now = timer.due; timers.delete(id); timer.fn();
    }
    now = end;
  };
  const player = createPresentationPlayer({clock, onVisit: state => visits.push(state.index)});
  player.setSeconds(seconds); player.start('wheel', 3); player.play();
  advance(seconds * 1000 - 1); assert.equal(player.state().index, 0);
  advance(1); assert.equal(player.state().index, 1);
  advance(seconds * 1000); assert.equal(player.state().index, 2);
  assert.equal(player.state().playing, true, 'last slide receives its full dwell');
  advance(seconds * 1000); assert.equal(player.state().playing, false);
  assert.equal(timers.size, 0, 'finished playback leaves no timer');
  player.play(); assert.equal(player.state().index, 0, 'play at the end restarts');
  player.pause(); advance(9000); assert.equal(player.state().index, 0);
  player.go(2); player.restart(); assert.equal(player.state().index, 0);
  player.play(); player.setSeconds(8); advance(7999); assert.equal(player.state().index, 0);
  advance(1); assert.equal(player.state().index, 1);
  player.setSeconds(20); assert.equal(player.state().seconds, 8, 'unsupported pace rejected');
  player.stop(); advance(9000); assert.equal(timers.size, 0);
  assert.equal(player.state().active, false);
}
assert.deepEqual([Math.min(...PRESENTATION_PACES), Math.max(...PRESENTATION_PACES)], [1.5, 8]);
console.log('PASS: all four paces, final-slide dwell, pause/restart, pace changes, and timer cleanup.');
