import assert from 'node:assert/strict';
import { createGameSoundtrack } from '../game-soundtrack.js';
import { createFakeAudio } from './audio-fakes.mjs';

let serial = 0;
const intervals = new Map(), timeouts = new Map();
const makeTimers = () => ({
  setTimer: (fn) => { const id = ++serial; intervals.set(id, fn); return id; },
  clearTimer: (id) => { intervals.delete(id); },
  setTimeoutFn: (fn) => { const id = ++serial; timeouts.set(id, fn); return id; },
  clearTimeoutFn: (id) => { timeouts.delete(id); }
});
const flushTimeouts = () => { for (const [id, fn] of [...timeouts]) { timeouts.delete(id); fn(); } };
const settle = async () => { for (let i = 0; i < 4; i++) await Promise.resolve(); };

const { FakeContext, log } = createFakeAudio();
class BlockedContext extends FakeContext {
  static blocked = false;
  resume() {
    if (BlockedContext.blocked) return Promise.reject(new Error('Autoplay blocked'));
    return super.resume();
  }
}

const create = () => createGameSoundtrack({ AudioContextClass: BlockedContext, scoreName: 'game', ...makeTimers() });

const score = create();
assert.equal(score.state().enabled, true, 'Music starts enabled');
score.unlock();
assert.equal(FakeContext.opened, 0, 'Inactive player does not open AudioContext');

score.setActive(true); await settle();
assert.equal(FakeContext.opened, 1);
assert.equal(score.state().playing, true, 'Entering game starts live synthesized score');
assert.ok(score.state().gain > 0 && score.state().gain < 0.5);
assert.ok(log.oscillators.length > 0, 'Oscillators scheduled for Still Waters');

const oscCount = log.oscillators.length;
score.unlock(); score.unlock(); await settle();
assert.equal(log.oscillators.length, oscCount, 'Repeated clicks do not restart the score');

// Rapid toggle during fade-out must not silence an active track (regression test for fade-out timer race)
score.setActive(false);
assert.equal(timeouts.size, 1, 'Fade-out schedules delayed stop');
score.setActive(true); await settle();
assert.equal(timeouts.size, 0, 'Returning clears the pending fade-out stop');
flushTimeouts();
assert.equal(score.state().playing, true, 'Track stays playing after rapid toggle');

score.setEnabled(false); flushTimeouts();
assert.equal(score.state().playing, false, 'Muting fades and stops');
score.setEnabled(true); await settle();
assert.equal(score.state().playing, true);

score.setVisible(false);
assert.equal(score.state().playing, false, 'Hidden pages stop immediately');
assert.equal(timeouts.size, 0, 'Background pages retain no fade timer');
score.setVisible(true); await settle();
assert.equal(score.state().playing, true);

score.setLevel(0.3);
assert.ok(Math.abs(score.state().gain - 0.42 * 0.3) < 1e-9, 'Ducking reduces GainNode level');
score.setLevel(1);

score.setActive(false); flushTimeouts();
assert.equal(score.state().playing, false, 'Leaving game stops music');

score.setActive(true); score.setEnabled(false); await settle(); flushTimeouts();
assert.equal(score.state().playing, false, 'Muting after start fades and stops');

score.setEnabled(true); await settle();
score.dispose();
assert.equal(score.state().playing, false);
score.unlock(); await settle();
assert.equal(score.state().playing, false, 'A disposed player remains stopped');

// Late resume on a suspended context cannot undo mute
let resolveResume;
class DeferredContext extends FakeContext {
  resume() { return new Promise((r) => { resolveResume = () => { this.state = 'running'; r(); }; }); }
}
const late = createGameSoundtrack({ AudioContextClass: DeferredContext, scoreName: 'game', ...makeTimers() });
late.setActive(true); late.setEnabled(false);
resolveResume(); await settle();
assert.equal(late.state().playing, false, 'Late resume cannot undo mute');
late.dispose();

BlockedContext.blocked = true;
const blocked = create();
blocked.setActive(true); await settle();
assert.equal(blocked.state().pending, false, 'Blocked autoplay promise is handled');
assert.equal(blocked.state().playing, false);
BlockedContext.blocked = false;
blocked.unlock(); await settle();
assert.equal(blocked.state().playing, true, 'The next interaction retries blocked playback');
blocked.dispose();

const unsupported = createGameSoundtrack({ AudioContextClass: null });
unsupported.setActive(true); unsupported.unlock(); unsupported.dispose();
assert.equal(unsupported.state().playing, false, 'Unsupported Web Audio leaves the game usable');
assert.equal(intervals.size, 0, 'All scheduler intervals cleaned up');
assert.equal(timeouts.size, 0, 'All fade timeouts cleaned up');
console.log('PASS: Web Audio synthesis soundtrack, fade-race protection, ducking, mute, visibility, autoplay retry and cleanup.');
