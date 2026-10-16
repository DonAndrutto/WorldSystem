/* What the end of a world sounds like.
 *
 * The three destructions are separate cycles and each has its own voice:
 *
 *   fire   — the drought's thin hiss; a swell as each of the seven suns
 *            appears; the crackle that thickens into a roar as Meru burns
 *   water  — rain gathering, then a flood that climbs, surges and finally
 *            dissolves into bubbles
 *   wind   — a gale that rises through the registers, whistling, with
 *            debris rattling past until the last fragments disperse
 *
 * Under every one of them a low drone sinks as the world is lost, and when
 * the world is gone, one soft bowl stroke and silence: the emptiness that
 * waits for a later period of formation.
 *
 * soundscape() is pure: for a kind and a progress it says how loud each layer
 * is, where its filter sits and how often its small events happen. The engine
 * below only turns those numbers into sound, from the same synth the rest of
 * the app plays through, so none of it needs an audio file.
 */
import { endingState } from './world-ending.js';

const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const smooth = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };
/* Band-limited noise is far quieter than its gain says; the beds are made up for it. */
const MAKEUP = 4;

/** The layers of one moment of one ending. Every gain is 0–1 of the layer's own ceiling. */
export function soundscape(kind, progress) {
  const s = endingState(kind, progress), p = s.progress;
  const out = {
    kind, suns: s.suns, empty: s.empty,
    low: { f: 120, q: 0.7, gain: 0 }, mid: { f: 800, q: 1, gain: 0, gust: 0 },
    high: { f: 4000, q: 1, gain: 0 },
    a: { f: 49, gain: 0 }, b: { f: 50, gain: 0 },
    rates: { crackle: 0, surge: 0, rattle: 0, bubble: 0, whistle: 0 }
  };
  if (s.kind === 'fire') {
    out.low = { f: 110 + 420 * s.heat, q: 0.7, gain: 0.05 * smooth((p - 0.25) / 0.3) + 0.09 * s.heat + 0.06 * s.loss };
    out.mid = { f: 1800 + 1500 * s.dry, q: 0.8, gust: 0,
                gain: 0.012 * smooth(p / 0.3) + 0.02 * smooth((p - 0.2) / 0.3) * (1 - s.heat) };
    out.high = { f: 4200, q: 1, gain: 0.012 * s.heat };
    out.a = { f: 49 * (1 + s.suns * 0.07) * (1 - 0.4 * s.loss), gain: 0.018 + 0.03 * s.suns / 7 };
    out.rates.crackle = 40 * s.heat * (1 - s.loss * 0.5);
  } else if (s.kind === 'water') {
    const level = smooth((p - 0.08) / 0.78);
    const rain = smooth(p / 0.18) * (1 - smooth((p - 0.45) / 0.3));
    out.low = { f: 90 + 160 * level, q: 0.6, gain: 0.02 + 0.09 * level };
    out.mid = { f: 350 + 650 * level, q: 0.7, gust: 0.35,
                gain: 0.02 * smooth(p / 0.2) + 0.09 * level * (1 - 0.5 * s.loss) };
    out.high = { f: 5200, q: 0.5, gain: 0.05 * rain };
    out.a = { f: 46 + 24 * level, gain: 0.02 + 0.035 * level };
    out.rates.surge = 0.3 + 0.9 * level;
    out.rates.bubble = 16 * s.loss;
  } else {
    const gale = smooth(p * 2.2);
    out.low = { f: 130 + 160 * gale, q: 0.7, gain: 0.1 * gale };
    out.mid = { f: 300 + 1500 * gale, q: 1.4 + 4 * gale, gust: 0.5,
                gain: 0.02 + 0.1 * gale * (1 - 0.6 * s.loss) };
    out.high = { f: 2400 + 1400 * gale, q: 6, gain: (0.02 + 0.045 * gale) * (1 - 0.7 * s.loss) };
    out.a = { f: 70 + 40 * gale, gain: 0.015 + 0.02 * gale };
    out.rates.rattle = 24 * smooth((p - 0.2) / 0.4) * (1 - s.loss);
    out.rates.whistle = 0.6 * gale * (1 - s.loss);
  }
  out.b = { f: out.a.f * (s.kind === 'water' ? 1.5 : 1.012), gain: out.a.gain * (s.kind === 'water' ? 0.4 : 0.8) };
  // the whole fades out as the last of the world is emptied
  const fade = 1 - smooth((p - 0.9) / 0.07);
  for (const layer of [out.low, out.mid, out.high, out.a, out.b]) layer.gain *= fade;
  for (const name of Object.keys(out.rates)) out.rates[name] *= fade;
  return out;
}

export function createEndingSound(synth, { random = Math.random } = {}) {
  let current = null, lastAt = 0, lastSuns = 0, bowlSounded = false;

  function build(kind) {
    const bus = synth.bus(0);
    return {
      kind, bus,
      low: synth.bed({ kind: 'lowpass', f: 120, q: 0.7, out: bus }),
      mid: synth.bed({ kind: 'bandpass', f: 800, q: 1, out: bus }),
      high: synth.bed({ kind: 'bandpass', f: 4000, q: 1, out: bus }),
      a: synth.hum({ f: 49, type: 'sine', out: bus }),
      b: synth.hum({ f: 50, type: 'sine', out: bus })
    };
  }

  function release(layer, tail = 1.2) {
    const at = synth.now();
    layer.bus.gain.setTargetAtTime(0, at, 0.15);
    for (const name of ['low', 'mid', 'high', 'a', 'b']) layer[name].stop(tail);
  }

  /* The small events: each is drawn from the layer's rate, so a quiet moment
     is a few and a violent one is a crowd. */
  function events(scape, bus, dt) {
    const at = synth.now() + 0.01;
    const count = (rate) => (rate > 0 ? Math.min(14, Math.floor(rate * dt + random())) : 0);
    for (let i = count(scape.rates.crackle); i > 0; i -= 1) {
      synth.rush(at + random() * dt, { dur: 0.012 + random() * 0.03, gain: 0.03 * (0.3 + random()),
        f: 1500 + random() * 3500, q: 0.8, out: bus });
    }
    for (let i = count(scape.rates.surge); i > 0; i -= 1) {
      synth.rush(at + random() * dt, { dur: 1.8, gain: 0.05, f: 400, sweep: 1400, q: 0.7, attack: 0.7, out: bus });
    }
    for (let i = count(scape.rates.bubble); i > 0; i -= 1) {
      const f = 300 + random() * 600;
      synth.tone(at + random() * dt, { f, to: f * 1.6, dur: 0.05, gain: 0.03, attack: 0.004, out: bus });
    }
    for (let i = count(scape.rates.rattle); i > 0; i -= 1) {
      synth.rush(at + random() * dt, { dur: 0.02 + random() * 0.03, gain: 0.02 + random() * 0.03,
        f: 2000 + random() * 3000, q: 3, out: bus });
    }
    for (let i = count(scape.rates.whistle); i > 0; i -= 1) {
      const f = 600 + random() * 800;
      synth.tone(at + random() * dt, { f, to: f * (random() < 0.5 ? 0.7 : 1.4), dur: 0.8, gain: 0.02, attack: 0.25, out: bus });
    }
  }

  function stop() {
    if (current) release(current);
    current = null;
    bowlSounded = false;
  }

  /* Called on every frame of the presentation, and when it is played, paused
     or scrubbed. Scrubbing and pausing are silent: the beds fade, nothing
     plays. */
  function update(kind, progress, playing) {
    if (!synth.open()) return;
    const scape = soundscape(kind, progress);
    const now = synth.now();
    if (current && current.kind !== kind) { release(current); current = null; bowlSounded = false; }
    if (!playing || scape.empty) {
      if (current) current.bus.gain.setTargetAtTime(0, now, playing ? 0.8 : 0.12);
      if (playing && scape.empty && !bowlSounded) {
        bowlSounded = true;
        synth.struck(now + 0.2, 196, 6, 0.07, [1, 2.71, 5.15]);
      }
      if (progress < 0.9) bowlSounded = false;
      lastAt = now;
      return;
    }
    if (!current) { current = build(kind); lastSuns = scape.suns; lastAt = now; }
    const dt = clamp(now - lastAt, 0, 0.25);
    lastAt = now;
    if (progress < 0.9) bowlSounded = false;
    const gust = 1 + scape.mid.gust * (0.6 * Math.sin(now * 0.7) + 0.4 * Math.sin(now * 1.9 + 1));
    current.low.set({ f: scape.low.f, q: scape.low.q, gain: scape.low.gain * MAKEUP });
    current.mid.set({ f: scape.mid.f * gust, q: scape.mid.q, gain: scape.mid.gain * MAKEUP });
    current.high.set({ f: scape.high.f, q: scape.high.q, gain: scape.high.gain * MAKEUP });
    current.a.set({ f: scape.a.f, gain: scape.a.gain });
    current.b.set({ f: scape.b.f, gain: scape.b.gain });
    current.bus.gain.setTargetAtTime(1, now, 0.4);
    if (scape.kind === 'fire' && scape.suns > lastSuns) {
      // each new sun: a swell that rises toward it
      const f = 196 * (1 + scape.suns * 0.1);
      synth.tone(now + 0.02, { f, to: f * 1.5, dur: 2.4, type: 'sine', gain: 0.05, attack: 0.9, out: current.bus });
      synth.rush(now + 0.02, { dur: 2.2, gain: 0.03, f: 1200, sweep: 3500, q: 0.8, attack: 0.9, out: current.bus });
    }
    lastSuns = scape.suns;
    events(scape, current.bus, dt);
  }

  return {
    update, stop,
    state: () => ({ kind: current?.kind ?? null, sounding: !!current, bowl: bowlSounded })
  };
}
