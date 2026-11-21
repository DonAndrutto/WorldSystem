/* Real-time Web Audio synthesis for all six mode scores.
 *
 * Replaces 6.47 MB of pre-rendered procedural MP3 loops with ~8 KB of live
 * synthesis using the exact harmonies, melodies, rhythms and instruments
 * originally composed in scripts/build-soundtrack.py and build-mode-music.py:
 *
 *   explore    Far Horizons            96 s  F lydian pads, harp plucks & sky breaths
 *   mandala    Thirty-Seven Offerings  96 s  C2 drone, 37 singing bowls & long horn
 *   game       Still Waters           128 s  warm pads, flute melody & bowls
 *   wheel      The Turning            108 s  6-beat cycle, frame drum, tanpura & reed
 *   worlds     Thousandfold           112 s  lydian pads & density-modulated sparkles
 *   astrology  Twenty-Eight Mansions  112 s  28 A-dorian glass notes & quarter bells
 *
 * Events are scheduled in a short lookahead window onto native Web Audio nodes
 * with zero PCM sample buffers and seamless infinite looping.
 */

const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeScore(duration) {
  const events = [], drones = [];
  const wrap = (at) => ((at % duration) + duration) % duration;
  return {
    duration, events, drones,
    add(at, spec) { events.push({ at: wrap(at), ...spec }); },
    drone(midi, gain, partials = [[1, 1]], pan = 0, tremolo = null) {
      drones.push({ f: hz(midi), gain, partials, pan, tremolo });
    },
    finish() { events.sort((a, b) => a.at - b.at); return { duration, events, drones }; }
  };
}

/* ── the six compositions ─────────────────────────────────────────────────── */

function composeFarHorizons() {
  const s = makeScore(96), rng = mulberry32(11);
  const chords = [
    [41, 48, 57, 64, 67], [38, 50, 57, 65, 69], [46, 53, 57, 64, 69],
    [36, 48, 55, 62, 67], [45, 52, 60, 64, 67], [46, 53, 60, 64, 69]
  ];
  const pans = [-0.25, 0.2, -0.4, 0.38, -0.1];
  chords.forEach((chord, bar) => chord.forEach((note, v) => {
    s.add(bar * 16 - 3, { kind: 'pad', f: hz(note), dur: 22, attack: 4, release: 6,
      shimmer: 0.0007, gain: v === 0 ? 0.055 : 0.036, pan: pans[v] });
  }));
  const shape = [0, 2, 3, 4, 3, 2, 4, 3, 2, 1, 3, 4, 2, 3, 1, 0];
  chords.forEach((chord, bar) => {
    const notes = chord.slice(1).map((n) => n + 12).concat(chord[2] + 24);
    for (let step = 0; step < 32; step++) {
      if (rng() < 0.22) continue;
      const idx = shape[step % 16] % notes.length;
      const note = notes[idx] + (step % 16 === 7 ? 12 : 0);
      s.add(bar * 16 + step * 0.5 + 0.75, { kind: 'pluck', f: hz(note), dur: 4.5, bright: 1,
        gain: 0.052 * (0.55 + 0.45 * rng()), pan: Math.sin(step * 0.7 + bar) * 0.5 });
    }
  });
  for (let i = 0; i < 6; i++) {
    s.add(i * 16 + 3, { kind: 'breath', dur: 11, centre: 900 + 220 * (i % 3), width: 420,
      gain: 0.04, pan: i % 2 ? 0.5 : -0.5 });
  }
  s.drone(29, 0.022, [[1, 1], [2, 0.18]]);
  s.drone(41, 0.018, [[1, 1], [2, 0.18]]);
  return s.finish();
}

function composeThirtySevenOfferings() {
  const s = makeScore(96);
  const root = 36, scale = [0, 3, 5, 7, 10];
  s.drone(root, 0.042, [[1, 1], [2, 0.45], [3, 0.2], [4, 0.09]]);
  s.drone(root + 7, 0.028, [[1, 1], [2, 0.3], [3, 0.1]], 0.1);
  s.drone(root + 19, 0.014, [[1, 1], [2, 0.2]], -0.1);
  for (let i = 0; i < 37; i++) {
    const degree = (i * 3) % 5;
    const octave = 48 + 12 * (Math.floor(i / 5) % 3);
    const note = octave + scale[degree];
    const door = i % 4;
    const pan = door === 0 ? -0.6 : door === 2 ? 0.6 : door === 1 ? 0.28 : -0.28;
    const stroke = 6 + i * 84 / 37;
    s.add(stroke, { kind: 'bowl', f: hz(note), dur: 14, decay: i % 5 ? 5.2 : 8,
      gain: i % 5 ? 0.068 : 0.092, pan });
    if (i % 5 === 4) {
      s.add(stroke + 0.35, { kind: 'bowl', f: hz(root + 12 + scale[degree]), dur: 16, decay: 9,
        gain: 0.062, pan: 0 });
    }
  }
  for (const at of [14, 62]) {
    s.add(at, { kind: 'reed', f: hz(root + 12), dur: 20, gain: 0.032, pan: -0.15 });
    s.add(at + 1, { kind: 'reed', f: hz(root + 19), dur: 18, gain: 0.02, pan: 0.15 });
  }
  for (let i = 0; i < 4; i++) {
    s.add(i * 24 + 6, { kind: 'breath', dur: 14, centre: 480, width: 190,
      gain: 0.036, pan: i % 2 ? 0.6 : -0.6 });
  }
  return s.finish();
}

function composeStillWaters() {
  const s = makeScore(128);
  const chords = [
    [50, 57, 64, 66], [43, 55, 57, 59], [47, 54, 57, 62], [45, 52, 59, 62],
    [50, 54, 57, 64], [43, 55, 59, 62], [40, 55, 59, 62], [45, 52, 57, 59]
  ];
  const pans = [-0.3, 0.23, -0.46, 0.4];
  chords.forEach((chord, bar) => chord.forEach((note, v) => {
    s.add(bar * 16 - 4, { kind: 'pad', f: hz(note), dur: 24, attack: 4, release: 5,
      shimmer: 0.0007, gain: v === 0 ? 0.068 : 0.044, pan: pans[v] });
  }));
  const melody = [74, 76, 69, 78, 76, 71, 69, 74, 78, 76, 74, 71, 67, 71, 69, 74];
  melody.forEach((note, i) => {
    s.add(i * 8 + 4.5, { kind: 'flute', f: hz(note), dur: 6, gain: 0.062, pan: Math.sin(i * 0.9) * 0.3 });
  });
  [62, 69, 66, 64, 62, 71, 67, 69].forEach((note, i) => {
    s.add(i * 16 + 1.2, { kind: 'bowl', f: hz(note), dur: 12, decay: 4.8,
      gain: 0.088, pan: (i % 2 ? 1 : -1) * 0.35 });
  });
  s.drone(38, 0.022, [[1, 1]]);
  s.drone(57, 0.018, [[1, 1]]);
  return s.finish();
}

function composeTheTurning() {
  const beat = 0.75, cycle = 6 * beat;
  const s = makeScore(24 * cycle);
  const roots = [50, 48, 46, 45, 43, 45];
  const modes = [
    [0, 2, 3, 7, 9], [0, 2, 3, 7, 8], [0, 2, 4, 7, 9],
    [0, 3, 5, 7, 8], [0, 2, 3, 5, 7], [0, 3, 5, 7, 10]
  ];
  roots.forEach((root, section) => {
    const start = section * 4 * cycle;
    s.add(start - 1.6, { kind: 'pad', f: hz(root), dur: 4 * cycle + 4, attack: 3, release: 3.5, shimmer: 0.0007, gain: 0.056, pan: -0.2 });
    s.add(start - 1.6, { kind: 'pad', f: hz(root + 7), dur: 4 * cycle + 4, attack: 3, release: 3.5, shimmer: 0.0007, gain: 0.036, pan: 0.24 });
    s.add(start - 1.6, { kind: 'pad', f: hz(root + 12 + modes[section][2]), dur: 4 * cycle + 4, attack: 3.5, release: 4, shimmer: 0.0007, gain: 0.024, pan: -0.4 });
    for (let c = 0; c < 4; c++) {
      const origin = start + c * cycle;
      s.add(origin + 0.03, { kind: 'skin', f: hz(root - 12), dur: 1.2, gain: 0.12, pan: 0 });
      s.add(origin + 3 * beat + 0.03, { kind: 'skin', f: hz(root + 3), dur: 0.9, gain: 0.065, pan: 0.2 });
      for (const tick of [1.5, 2, 4.5, 5]) {
        s.add(origin + tick * beat + 0.03, { kind: 'skin', f: hz(root + 19), dur: 0.35, gain: 0.022, pan: tick < 3 ? -0.4 : 0.4 });
      }
      [[0, 7], [1, 12], [2, 12], [3.5, 0]].forEach(([at, iv], k) => {
        s.add(origin + at * beat + 0.02, { kind: 'pluck', f: hz(root + iv), dur: 5.5, bright: 0.6,
          gain: 0.048 - 0.005 * k, pan: k % 2 ? 0.15 : -0.15 });
      });
      if (c % 2 === 1) {
        const steps = modes[section];
        for (let i = 0; i < 3; i++) {
          const step = steps[(c + i * 2 + section) % 5];
          s.add(origin + (0.5 + i * 2.0) * beat, { kind: 'reed', f: hz(root + 12 + step),
            dur: 1.9 * beat * 1.6, gain: 0.044, pan: 0.1 * (i - 1) });
        }
      }
    }
  });
  return s.finish();
}

function composeThousandfold() {
  const s = makeScore(112), rng = mulberry32(1000);
  const chords = [
    [40, 47, 54, 58, 64, 71], [37, 44, 51, 56, 63, 68],
    [45, 52, 56, 61, 68, 71], [35, 47, 54, 59, 63, 66]
  ];
  const pans = [-0.5, 0.5, -0.2, 0.25, -0.65, 0.6];
  chords.forEach((chord, bar) => chord.forEach((note, v) => {
    s.add(bar * 28 - 6, { kind: 'pad', f: hz(note), dur: 40, attack: 8, release: 10,
      shimmer: 0.0011 * (v + 1), gain: v < 2 ? 0.048 : 0.028, pan: pans[v] });
  }));
  const scale = [64, 66, 68, 70, 71, 73, 75, 76, 78, 80, 82, 83, 85, 87, 88, 90];
  let t = 0;
  while (t < 112) {
    const density = 0.35 + 3.6 * Math.sin(Math.PI * t / 112) ** 2;
    const note = scale[Math.floor(rng() * scale.length)] + (rng() < 0.35 ? 12 : 0);
    s.add(t, { kind: 'sparkle', f: hz(note), dur: 3.4, decay: 0.8 + 1.2 * rng(),
      gain: 0.032 * (0.4 + 0.6 * rng()), pan: rng() * 1.8 - 0.9 });
    t += -Math.log(Math.max(1e-6, 1 - rng())) / density;
  }
  for (let i = 0; i < 4; i++) {
    s.add(i * 28 + 4, { kind: 'breath', dur: 24, centre: 190 + 60 * i, width: 90,
      gain: 0.055, pan: i % 2 ? 0.5 : -0.5 });
  }
  s.drone(28, 0.044, [[1, 1], [2, 0.4], [3, 0.12]]);
  s.drone(35, 0.024, [[1, 1], [2, 0.25]], 0.15);
  s.drone(47, 0.012, [[1, 1]], -0.15);
  return s.finish();
}

function composeTwentyEightMansions() {
  const s = makeScore(112);
  const scale = [57, 59, 60, 62, 64, 66, 67, 69, 71, 72, 74, 76, 78, 79];
  for (let i = 0; i < 28; i++) {
    const arc = Math.sin(2 * Math.PI * (i + 0.5) / 28 - Math.PI / 2) * 0.5 + 0.5;
    const idx = Math.round(arc * 8) + 1 + (i % 3 === 2 ? 2 : 0);
    const note = scale[Math.min(idx, scale.length - 1)];
    const at = i * 4 + 0.5, pan = Math.sin(i * 1.3) * 0.55;
    s.add(at, { kind: 'glass', f: hz(note), dur: 9, decay: 3.4, gain: 0.088, pan });
    s.add(at + 1.5, { kind: 'glass', f: hz(note + 7), dur: 7, decay: 2.1, gain: 0.036, pan: -pan });
    if (i % 7 === 6) s.add(at - 0.2, { kind: 'bowl', f: hz(45), dur: 18, decay: 8, gain: 0.075, pan: 0 });
  }
  [[45, 52, 59], [43, 50, 57], [41, 48, 55], [43, 50, 57]].forEach((chord, bar) => {
    chord.forEach((note, v) => {
      s.add(bar * 28 - 5, { kind: 'pad', f: hz(note), dur: 38, attack: 8, release: 10,
        shimmer: 0.0007, gain: v === 0 ? 0.048 : 0.032, pan: [-0.3, 0.3, 0][v] });
    });
  });
  for (let i = 0; i < 7; i++) {
    s.add(i * 16 + 2, { kind: 'breath', dur: 10, centre: 3600, width: 800,
      gain: 0.018, pan: i % 2 ? 0.7 : -0.7 });
  }
  s.drone(33, 0.032, [[1, 1], [2, 0.35], [3, 0.1]]);
  s.drone(57, 0.015, [[1, 1]], 0, { rate: 7 / 112, depth: 0.25 });
  return s.finish();
}

export const MODE_SCORES = {
  explore:   { title: 'Far Horizons',           compose: composeFarHorizons },
  mandala:   { title: 'Thirty-Seven Offerings', compose: composeThirtySevenOfferings },
  game:      { title: 'Still Waters',           compose: composeStillWaters },
  wheel:     { title: 'The Turning',            compose: composeTheTurning },
  worlds:    { title: 'Thousandfold',           compose: composeThousandfold },
  astrology: { title: 'Twenty-Eight Mansions',  compose: composeTwentyEightMansions }
};

const cache = new Map();
export function getScore(name) {
  if (!Object.hasOwn(MODE_SCORES, name)) return null;
  if (!cache.has(name)) cache.set(name, MODE_SCORES[name].compose());
  return cache.get(name);
}

/* ── Web Audio voice primitives ───────────────────────────────────────────── */

function routed(ctx, dest, pan) {
  if (!pan || typeof ctx.createStereoPanner !== 'function') return dest;
  const p = ctx.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  p.connect(dest);
  return p;
}

function oscTone(ctx, out, at, { f, to = null, dur, gain, attack = 0.01, release = null, type = 'sine', detune = 0 }) {
  const osc = ctx.createOscillator(), amp = ctx.createGain();
  osc.type = type;
  if (detune) osc.detune.value = detune;
  osc.frequency.setValueAtTime(Math.max(20, f), at);
  if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + dur);
  const peak = Math.max(0.0002, gain);
  amp.gain.setValueAtTime(0.0001, at);
  amp.gain.exponentialRampToValueAtTime(peak, at + Math.max(0.003, attack));
  if (release && dur > attack + release) {
    amp.gain.setValueAtTime(peak, at + dur - release);
  }
  amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(amp).connect(out);
  osc.start(at);
  osc.stop(at + dur + 0.05);
}

export function playScoreEvent(ctx, dest, noiseBuf, ev, at) {
  const out = routed(ctx, dest, ev.pan || 0);
  if (ev.kind === 'pad') {
    oscTone(ctx, out, at, { f: ev.f, dur: ev.dur, gain: ev.gain, attack: ev.attack, release: ev.release });
    oscTone(ctx, out, at, { f: ev.f * 2, dur: ev.dur, gain: ev.gain * 0.19, attack: ev.attack, release: ev.release });
    oscTone(ctx, out, at, { f: ev.f * (1 + (ev.shimmer || 0.0007)), dur: ev.dur, gain: ev.gain * 0.15, attack: ev.attack, release: ev.release });
  } else if (ev.kind === 'pluck') {
    for (let k = 1; k <= 4; k++) {
      const dec = Math.min(ev.dur, 2.4 / (1 + (k - 1) * 0.85 * (ev.bright || 1)) * 2.2);
      oscTone(ctx, out, at, { f: ev.f * k * Math.pow(1.0002, k * k), dur: dec,
        gain: ev.gain / Math.pow(k, 1.35), attack: 0.004 });
    }
  } else if (ev.kind === 'bowl') {
    const partials = [[1, 1, 1], [2.71, 0.34, 0.62], [5.15, 0.12, 0.38]];
    for (const [r, g, m] of partials) {
      const d = Math.min(ev.dur, ev.decay * m * 2.4);
      oscTone(ctx, out, at, { f: ev.f * r, dur: d, gain: ev.gain * g, attack: 0.015 });
      oscTone(ctx, out, at, { f: ev.f * r + 0.8, dur: d, gain: ev.gain * g * 0.45, attack: 0.015 });
    }
  } else if (ev.kind === 'glass') {
    oscTone(ctx, out, at, { f: ev.f, dur: ev.dur, gain: ev.gain, attack: 0.003 });
    oscTone(ctx, out, at, { f: ev.f * 4.0, dur: Math.min(ev.dur, ev.decay * 0.9), gain: ev.gain * 0.35, attack: 0.003 });
    oscTone(ctx, out, at, { f: ev.f * 6.3, dur: Math.min(ev.dur, ev.decay * 0.45), gain: ev.gain * 0.16, attack: 0.003 });
  } else if (ev.kind === 'flute') {
    oscTone(ctx, out, at, { f: ev.f, dur: ev.dur, gain: ev.gain, attack: ev.dur * 0.42, release: ev.dur * 0.45 });
    oscTone(ctx, out, at, { f: ev.f * 2, dur: ev.dur, gain: ev.gain * 0.1, attack: ev.dur * 0.42, release: ev.dur * 0.45 });
  } else if (ev.kind === 'reed') {
    const atk = Math.min(1.2, ev.dur * 0.35), rel = Math.min(1.8, ev.dur * 0.4);
    oscTone(ctx, out, at, { f: ev.f, dur: ev.dur, gain: ev.gain, attack: atk, release: rel, type: 'triangle' });
    oscTone(ctx, out, at, { f: ev.f * 3, dur: ev.dur, gain: ev.gain * 0.22, attack: atk, release: rel });
  } else if (ev.kind === 'sparkle') {
    oscTone(ctx, out, at, { f: ev.f, dur: ev.dur, gain: ev.gain, attack: 0.004 });
    oscTone(ctx, out, at, { f: ev.f * 2.005, dur: Math.min(ev.dur, ev.decay * 1.4), gain: ev.gain * 0.25, attack: 0.004 });
  } else if (ev.kind === 'skin') {
    oscTone(ctx, out, at, { f: ev.f * 2.1, to: ev.f, dur: Math.min(ev.dur, 0.35), gain: ev.gain, attack: 0.004 });
    oscTone(ctx, out, at, { f: ev.f * 2.31, to: ev.f * 1.8, dur: Math.min(ev.dur, 0.16), gain: ev.gain * 0.18, attack: 0.004 });
  } else if (ev.kind === 'breath' && noiseBuf) {
    const src = ctx.createBufferSource(), flt = ctx.createBiquadFilter(), amp = ctx.createGain();
    src.buffer = noiseBuf; src.loop = true;
    flt.type = 'bandpass';
    flt.frequency.setValueAtTime(Math.max(40, ev.centre), at);
    flt.Q.value = Math.max(0.4, ev.centre / Math.max(40, ev.width));
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, ev.gain), at + ev.dur * 0.48);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + ev.dur);
    src.connect(flt).connect(amp).connect(out);
    src.start(at);
    src.stop(at + ev.dur + 0.05);
  }
}

export function startDrones(ctx, dest, drones) {
  const handles = [];
  for (const d of drones) {
    const out = routed(ctx, dest, d.pan || 0);
    for (const [k, g] of d.partials) {
      const osc = ctx.createOscillator(), amp = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = d.f * k;
      amp.gain.value = d.gain * g;
      osc.connect(amp).connect(out);
      osc.start();
      handles.push(osc);
    }
  }
  return () => { for (const osc of handles) { try { osc.stop(); } catch {} } };
}

export function createRoomBus(ctx, dest) {
  const input = ctx.createGain();
  input.gain.value = 1;
  input.connect(dest);
  if (typeof ctx.createDelay !== 'function') return input;
  // Two gentle cross-channel stereo echo taps give the open room feel without sample IRs.
  const taps = [[0.23, 0.14, -0.55], [0.47, 0.11, 0.55], [0.89, 0.075, -0.35]];
  for (const [time, gain, pan] of taps) {
    const delay = ctx.createDelay(1.5), amp = ctx.createGain();
    delay.delayTime.value = time;
    amp.gain.value = gain;
    input.connect(delay).connect(amp).connect(routed(ctx, dest, pan));
  }
  return input;
}
