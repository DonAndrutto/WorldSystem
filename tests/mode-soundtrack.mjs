import assert from 'node:assert/strict';
import { createModeSoundtrack, MODE_TRACKS } from '../mode-soundtrack.js';
import { getScore } from '../mode-scores.js';
import { createFakeAudio } from './audio-fakes.mjs';

const MODES = ['explore', 'mandala', 'game', 'wheel', 'worlds', 'astrology'];
assert.deepEqual(Object.keys(MODE_TRACKS), MODES, 'a score for each of the six modes');
assert.equal(new Set(MODES.map((m) => MODE_TRACKS[m].title)).size, 6, 'and a distinct title');
for (const m of MODES) {
  const s = getScore(m);
  assert.ok(s && s.duration >= 90 && s.events.length > 20, m + ' composes a full procedural score');
}
assert.equal(MODE_TRACKS.game.title, 'Still Waters', 'Game keeps Still Waters');

const { FakeContext } = createFakeAudio();
class TestContext extends FakeContext {
  static blocked = false;
  resume() {
    if (TestContext.blocked) return Promise.reject(new Error('blocked'));
    return super.resume();
  }
}

let serial = 0;
const intervals = new Map(), timeouts = new Map();
const make = () => createModeSoundtrack({
  AudioContextClass: TestContext,
  setTimer: (fn) => { const id = ++serial; intervals.set(id, fn); return id; },
  clearTimer: (id) => { intervals.delete(id); },
  setTimeoutFn: (fn) => { const id = ++serial; timeouts.set(id, fn); return id; },
  clearTimeoutFn: (id) => { timeouts.delete(id); }
});
const flushTimeouts = () => { for (const [id, fn] of [...timeouts]) { timeouts.delete(id); fn(); } };
const settle = async () => { for (let i = 0; i < 4; i++) await Promise.resolve(); };

const score = make();
assert.equal(FakeContext.opened, 0, 'nothing opens AudioContext before a mode is entered');
score.setMode('explore'); await settle();
assert.equal(FakeContext.opened, 1, 'shared AudioContext opened once');
assert.equal(score.state().playing, true, 'Explorer plays its synthesized score');
assert.equal(score.state().title, 'Far Horizons');

score.setMode('wheel'); await settle(); flushTimeouts();
assert.equal(FakeContext.opened, 1, 'all modes share one AudioContext');
assert.equal(score.state().playing, true);
assert.equal(score.state().title, 'The Turning');
assert.deepEqual(score.state().players, ['explore', 'wheel']);

score.setMode('explore'); await settle(); flushTimeouts();
assert.deepEqual(score.state().players, ['explore', 'wheel'], 'returning reuses existing player');

for (const m of MODES) { score.setMode(m); await settle(); flushTimeouts(); }
assert.equal(score.state().players.length, 6);
assert.equal(score.state().title, 'Twenty-Eight Mansions');

score.setEnabled(false); flushTimeouts();
assert.equal(score.state().playing, false, 'muting stops the score');
score.setEnabled(true); await settle();
assert.equal(score.state().playing, true);
score.setVisible(false);
assert.equal(score.state().playing, false, 'hidden page pauses at once');
score.setVisible(true); await settle();
assert.equal(score.state().playing, true);

score.setLevel(0.3);
assert.equal(score.state().level, 0.3, 'ducking turns the score down without stopping');
assert.equal(score.state().playing, true);
score.setLevel(1);

const openedBefore = FakeContext.opened;
const quiet = make(); quiet.setEnabled(false); quiet.setMode('astrology'); await settle(); flushTimeouts();
assert.equal(quiet.state().playing, false, 'a muted visit starts nothing');
assert.equal(FakeContext.opened, openedBefore, 'and does not open AudioContext while muted');
quiet.setEnabled(true); await settle();
assert.equal(quiet.state().playing, true);
quiet.dispose();

score.setMode('nowhere'); flushTimeouts();
assert.equal(score.state().mode, null);

TestContext.blocked = true;
const blocked = make(); blocked.setMode('mandala'); await settle();
assert.equal(blocked.state().playing, false);
TestContext.blocked = false;
blocked.unlock(); await settle();
assert.equal(blocked.state().playing, true, 'next gesture starts blocked score');

score.dispose(); blocked.dispose();
score.setMode('game'); await settle(); flushTimeouts();
assert.equal(score.state().playing, false, 'disposed score stays stopped');
assert.equal(intervals.size, 0, 'no scheduler interval outlives dispose');
assert.equal(timeouts.size, 0, 'no fade timer outlives dispose');

const none = createModeSoundtrack({ AudioContextClass: null });
none.setMode('wheel'); none.unlock(); none.dispose();
assert.equal(none.state().playing, false, 'no Web Audio support leaves app usable');
console.log('PASS: six distinct synthesized mode scores, shared AudioContext, crossfade, mute/visibility/ducking, autoplay retry and cleanup.');
