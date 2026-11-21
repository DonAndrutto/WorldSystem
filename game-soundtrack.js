/* One quiet looping score, synthesized live in Web Audio from mode-scores.js.
   This is the player for a single mode; mode-soundtrack.js keeps one per mode
   sharing a single AudioContext. The caller supplies activity, mute and
   visibility; playback waits for a user interaction if the browser keeps the
   AudioContext suspended. GainNode fading works on iOS Safari too, and
   `setLevel` turns the track down (a world ending ducks it) without stopping. */
import { getScore, playScoreEvent, startDrones, createRoomBus } from './mode-scores.js';

const LOOKAHEAD = 1.6;    // seconds scheduled ahead on the AudioContext clock
const STEP_MS = 250;      // scheduler interval while playing
const FADE_MS = 800;      // gentle fade-out before stopping oscillators

export function createGameSoundtrack({
  AudioContextClass = null,
  getContext = null,
  scoreName = 'game',
  setTimer = globalThis.setInterval,
  clearTimer = globalThis.clearInterval,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout
} = {}) {
  const base = 0.42;
  let ownCtx = null, ctx = null, bus = null, room = null, noiseBuf = null;
  let active = false, enabled = true, visible = true, disposed = false, level = 1;
  let playing = false, pending = false, stopTimer = null, schedTimer = null;
  let stopDronesFn = null, scorePos = 0, nextAt = 0, score = null;

  const volume = () => base * level;
  const wanted = () => active && enabled && visible && !disposed;

  function ensureContext() {
    if (ctx) return ctx;
    if (getContext) {
      const shared = getContext();
      if (!shared) return null;
      ctx = shared.ctx;
      noiseBuf = shared.noiseBuf;
    } else if (AudioContextClass) {
      try { ownCtx = new AudioContextClass(); } catch { return null; }
      ctx = ownCtx;
      const buf = ctx.createBuffer(1, Math.round((ctx.sampleRate || 24000) * 2), ctx.sampleRate || 24000);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      noiseBuf = buf;
    } else {
      return null;
    }
    bus = ctx.createGain();
    bus.gain.value = 0;
    bus.connect(ctx.destination);
    room = createRoomBus(ctx, bus);
    return ctx;
  }

  function schedule() {
    if (!playing || !ctx || !score) return;
    const horizon = ctx.currentTime + LOOKAHEAD;
    if (nextAt < ctx.currentTime) nextAt = ctx.currentTime;
    const dur = score.duration;
    while (nextAt < horizon) {
      const span = Math.min(0.6, horizon - nextAt);
      const from = scorePos, to = from + span;
      for (const ev of score.events) {
        if (ev.at >= from && ev.at < to) {
          playScoreEvent(ctx, room, noiseBuf, ev, nextAt + (ev.at - from));
        } else if (to >= dur && ev.at < to - dur) {
          playScoreEvent(ctx, room, noiseBuf, ev, nextAt + (dur - from) + ev.at);
        }
      }
      scorePos = to % dur;
      nextAt += span;
    }
  }

  function halt() {
    clearTimeoutFn(stopTimer); stopTimer = null;
    clearTimer(schedTimer); schedTimer = null;
    if (stopDronesFn) { stopDronesFn(); stopDronesFn = null; }
    playing = false;
  }

  function setGain(to, immediate = false) {
    if (!bus || !ctx) return;
    const now = ctx.currentTime;
    if (immediate) bus.gain.setValueAtTime(to, now);
    else bus.gain.setTargetAtTime(to, now, 0.22);
  }

  function begin() {
    if (!wanted() || !ctx) return;
    clearTimeoutFn(stopTimer); stopTimer = null;
    score ||= getScore(scoreName);
    if (!score) return;
    if (!playing) {
      playing = true;
      nextAt = ctx.currentTime + 0.04;
      stopDronesFn = startDrones(ctx, room, score.drones);
      schedule();
      schedTimer = setTimer(schedule, STEP_MS);
    }
    setGain(volume(), false);
  }

  function stop({ immediate = false } = {}) {
    clearTimeoutFn(stopTimer); stopTimer = null;
    if (!playing && !bus) return;
    setGain(0, immediate);
    if (immediate || !playing) {
      halt();
      return;
    }
    stopTimer = setTimeoutFn(() => {
      stopTimer = null;
      if (!wanted()) halt();
    }, FADE_MS);
  }

  function sync({ immediate = false } = {}) {
    if (!wanted()) { stop({ immediate }); return; }
    // Clear any pending fade-out stop immediately when playback becomes wanted again.
    clearTimeoutFn(stopTimer); stopTimer = null;
    if (!ensureContext()) return;
    if (ctx.state === 'suspended') {
      if (pending) return;
      pending = true;
      try {
        Promise.resolve(ctx.resume()).then(() => {
          pending = false;
          if (wanted() && ctx.state !== 'suspended') begin();
          else stop({ immediate: true });
        }, () => { pending = false; });
      } catch { pending = false; }
      return;
    }
    begin();
  }

  return {
    setActive(on) { active = !!on; sync(); },
    setEnabled(on) { enabled = !!on; sync(); },
    setVisible(on) { visible = !!on; sync({ immediate: !visible }); },
    setLevel(x) { level = Math.max(0, Math.min(1, x)); if (playing && wanted()) setGain(volume(), false); },
    unlock: () => sync(),
    dispose() {
      disposed = true;
      stop({ immediate: true });
      if (ownCtx && typeof ownCtx.close === 'function') ownCtx.close().catch(() => {});
    },
    state: () => ({ active, enabled, visible, playing, pending, gain: bus ? bus.gain.value : 0 })
  };
}
