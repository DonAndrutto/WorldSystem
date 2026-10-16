/* The shared instrument.
 *
 * Every effect in the app is built at the moment it sounds, out of oscillators
 * and filtered noise, so there are no sample files and all of it works offline.
 * The context is opened on first use (a click or key), never at load, and a
 * missing or refusing AudioContext leaves every call a quiet no-op.
 *
 * Callers open() before they schedule anything and then hand the primitives a
 * start time on the context's clock. `out` lets a caller send a sound to its
 * own bus (a world ending fades its whole soundscape as one) instead of
 * straight to the master.
 */
export function createSynth(AudioContextClass) {
  let ctx = null, master = null;
  const noises = new Map();

  function open() {
    if (!ctx) {
      if (!AudioContextClass) return null;
      try { ctx = new AudioContextClass(); } catch (err) { return null; }
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  /* White noise, made once per length and replayed as often as wanted. */
  function noiseBuffer(seconds = 1) {
    if (!noises.has(seconds)) {
      const buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * seconds), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
      noises.set(seconds, buffer);
    }
    return noises.get(seconds);
  }

  /* A plain voiced tone: one oscillator through its own envelope. */
  function tone(at, { f = 220, to = null, dur = 0.3, type = 'sine', gain = 0.1,
                      attack = 0.008, detune = 0, out = master }) {
    const osc = ctx.createOscillator(), amp = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(f, at);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + dur);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(amp).connect(out);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  /* Filtered noise: skins, rattles, wind, the roar. */
  function rush(at, { dur = 0.3, gain = 0.1, f = 800, q = 1, kind = 'bandpass',
                      sweep = null, attack = 0.006, out = master }) {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), amp = ctx.createGain();
    src.buffer = noiseBuffer();
    src.loop = true;
    filter.type = kind;
    filter.frequency.setValueAtTime(f, at);
    if (sweep) filter.frequency.exponentialRampToValueAtTime(Math.max(30, sweep), at + dur);
    filter.Q.value = q;
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(filter).connect(amp).connect(out);
    src.start(at);
    src.stop(at + dur + 0.05);
  }

  /* A struck metal body: inharmonic partials over one long decay. */
  function struck(at, f, dur, gain, partials, out = master) {
    partials.forEach((ratio, i) => {
      tone(at, { f: f * ratio, dur: dur * (1 - i * 0.12), type: 'sine',
                 gain: gain / (1.6 + i), attack: 0.004, out });
    });
  }

  /* A drum skin: a short pitch drop with a little noise on the strike. */
  function skin(at, f, gain = 0.09, out = master) {
    tone(at, { f, to: f * 0.55, dur: 0.16, type: 'triangle', gain, attack: 0.003, out });
    rush(at, { dur: 0.05, gain: gain * 0.5, f: f * 6, q: 0.8, out });
  }

  /* A sound that keeps going until it is told to stop, and can be steered
     while it runs. `set` glides each named value to its target. */
  function bed({ kind = 'bandpass', f = 800, q = 1, gain = 0, out = master, seconds = 4 }) {
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), amp = ctx.createGain();
    src.buffer = noiseBuffer(seconds);
    src.loop = true;
    filter.type = kind;
    filter.frequency.value = f;
    filter.Q.value = q;
    amp.gain.value = gain;
    src.connect(filter).connect(amp).connect(out);
    src.start(0, Math.random() * seconds * 0.9);
    return {
      set({ f: nf, q: nq, gain: ng }, glide = 0.25) {
        const at = ctx.currentTime;
        if (nf !== undefined) filter.frequency.setTargetAtTime(Math.max(20, nf), at, glide);
        if (nq !== undefined) filter.Q.setTargetAtTime(nq, at, glide);
        if (ng !== undefined) amp.gain.setTargetAtTime(Math.max(0, ng), at, glide);
      },
      stop(after = 0.1) { try { src.stop(ctx.currentTime + after); } catch (err) {} }
    };
  }

  /* The same for a pitched voice. */
  function hum({ f = 110, type = 'sine', gain = 0, out = master, detune = 0 }) {
    const osc = ctx.createOscillator(), amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = f;
    osc.detune.value = detune;
    amp.gain.value = gain;
    osc.connect(amp).connect(out);
    osc.start();
    return {
      set({ f: nf, gain: ng }, glide = 0.25) {
        const at = ctx.currentTime;
        if (nf !== undefined) osc.frequency.setTargetAtTime(Math.max(20, nf), at, glide);
        if (ng !== undefined) amp.gain.setTargetAtTime(Math.max(0, ng), at, glide);
      },
      stop(after = 0.1) { try { osc.stop(ctx.currentTime + after); } catch (err) {} }
    };
  }

  /* A bus of its own: gain-ruled, and joined to the master. */
  function bus(gain = 1) {
    const node = ctx.createGain();
    node.gain.value = gain;
    node.connect(master);
    return node;
  }

  return {
    open, tone, rush, struck, skin, bed, hum, bus,
    now: () => ctx.currentTime,
    ready: () => !!ctx,
    get master() { return master; }
  };
}
