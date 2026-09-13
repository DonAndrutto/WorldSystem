/* What the board sounds like.
 *
 * A throw ends somewhere, and where it ends has a character: the hells are not
 * the heavens, the sūtra route is not the mantra route, and Nirvāṇa is neither.
 * Every square is given a voice by the company it keeps — its category on the
 * board, with a few squares named outright — and the voice is played when a
 * token arrives, over a rise or a fall that says which way the throw went.
 *
 * Nothing is sampled. Everything here is built from oscillators and filtered
 * noise at the moment it sounds, so the page still loads no audio and works
 * offline. Sound is off until asked for, like motion.
 *
 * The mapping is pure and is tested; the synthesis needs a real AudioContext
 * and is not.
 */

/* One voice per family. Squares that are not named here take their category's
   voice, and a category with no voice of its own falls back to 'human'. */
export const VOICE_BY_SQUARE = {
  16: 'roar',            // Rudra Black Freedom, with Mahākāla
  34: 'roar',            // Mahākāla
  104: 'nirvana'
};

export const VOICE_BY_CATEGORY = {
  'Hell states': 'hell',
  'Hungry ghosts': 'preta',
  'Animals': 'animal',
  'Underworld beings and spirits': 'preta',
  'Human continents': 'human',
  'Starting position': 'human',
  'Universal sovereignty': 'human',
  'Non-Buddhist traditions as represented in the book': 'other',
  'Heavens of sense desire': 'desire',
  'Realm of Form': 'form',
  'Formless Realm': 'formless',
  'Vehicle of Disciples': 'sutra',
  'Independent Buddha path': 'sutra',
  'Mahāyāna sutra path': 'sutra',
  'Tantric path': 'mantra',
  'Wisdom-holder attainments': 'mantra',
  'Dharma protector': 'roar',
  'Mythic and sacred lands': 'pure',
  'Buddha fields': 'pure',
  'Buddha bodies': 'deeds',
  'Acts of the Emanation body': 'deeds'
};

export const VOICES = ['hell', 'preta', 'animal', 'human', 'other', 'desire', 'form',
                       'formless', 'sutra', 'mantra', 'roar', 'pure', 'deeds', 'nirvana'];

/** The voice a square answers in. Takes the square record, not its number. */
export function voiceFor(square) {
  if (!square) return 'human';
  return VOICE_BY_SQUARE[square.n] || VOICE_BY_CATEGORY[square.cat] || 'human';
}

/* ── the instrument ─────────────────────────────────────────────────────
   A handful of primitives, and one recipe per voice written in terms of
   them. Everything is scheduled ahead of the clock so nothing depends on
   the main thread keeping time. */
export function createSoundKit(AudioContextClass) {
  let ctx = null, master = null, noise = null;

  function open() {
    if (!ctx) {
      if (!AudioContextClass) return null;
      try { ctx = new AudioContextClass(); } catch (err) { return null; }
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* One second of white noise, made once and replayed as often as wanted. */
  function noiseBuffer() {
    if (!noise) {
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = noise.getChannelData(0);
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    }
    return noise;
  }

  /* A plain voiced tone: one oscillator through its own envelope. */
  function tone(at, { f = 220, to = null, dur = 0.3, type = 'sine', gain = 0.1,
                      attack = 0.008, detune = 0 }) {
    const osc = ctx.createOscillator(), amp = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(f, at);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), at + dur);
    amp.gain.setValueAtTime(0.0001, at);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + attack);
    amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(amp).connect(master);
    osc.start(at);
    osc.stop(at + dur + 0.05);
  }

  /* Filtered noise: skins, rattles, wind, the roar. */
  function rush(at, { dur = 0.3, gain = 0.1, f = 800, q = 1, kind = 'bandpass',
                      sweep = null, attack = 0.006 }) {
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
    src.connect(filter).connect(amp).connect(master);
    src.start(at);
    src.stop(at + dur + 0.05);
  }

  /* A struck metal body: inharmonic partials over one long decay. */
  function struck(at, f, dur, gain, partials) {
    partials.forEach((ratio, i) => {
      tone(at, { f: f * ratio, dur: dur * (1 - i * 0.12), type: 'sine',
                 gain: gain / (1.6 + i), attack: 0.004 });
    });
  }

  /* A drum skin: a short pitch drop with a little noise on the strike. */
  function skin(at, f, gain = 0.09) {
    tone(at, { f, to: f * 0.55, dur: 0.16, type: 'triangle', gain, attack: 0.003 });
    rush(at, { dur: 0.05, gain: gain * 0.5, f: f * 6, q: 0.8 });
  }

  /* ── the voices ──────────────────────────────────────────────────── */
  const RECIPES = {
    // below the ground: a low drone with a beating second voice under it
    hell: (at) => {
      tone(at, { f: 58, dur: 2.4, type: 'sawtooth', gain: 0.07, attack: 0.25 });
      tone(at, { f: 61.5, dur: 2.4, type: 'sawtooth', gain: 0.05, attack: 0.3 });
      rush(at, { dur: 2.2, gain: 0.045, f: 240, sweep: 90, q: 0.7, attack: 0.4 });
    },
    // hunger: a thin reed that never arrives anywhere
    preta: (at) => {
      tone(at, { f: 146, to: 132, dur: 1.5, type: 'sawtooth', gain: 0.05, attack: 0.12 });
      tone(at, { f: 219, to: 198, dur: 1.3, type: 'triangle', gain: 0.03, attack: 0.2 });
    },
    // a bare hollow knock, twice
    animal: (at) => {
      skin(at, 170, 0.08);
      skin(at + 0.17, 128, 0.06);
    },
    // the human world: a plain open fifth, neither high nor low
    human: (at) => {
      tone(at, { f: 196, dur: 0.9, type: 'triangle', gain: 0.075, attack: 0.01 });
      tone(at + 0.06, { f: 294, dur: 0.8, type: 'triangle', gain: 0.05 });
    },
    // the other traditions of the board, sharing one voice: a horn-like call
    other: (at) => {
      tone(at, { f: 138, dur: 1.1, type: 'sawtooth', gain: 0.06, attack: 0.08 });
      tone(at + 0.02, { f: 207, dur: 1.0, type: 'sawtooth', gain: 0.035, attack: 0.09 });
    },
    // the heavens of sense desire: small bells, bright and quick
    desire: (at) => {
      struck(at, 523, 1.5, 0.085, [1, 2.01, 2.99]);
      tone(at + 0.09, { f: 784, dur: 1.0, type: 'sine', gain: 0.035 });
    },
    // the realm of form: the same bell, wider and slower
    form: (at) => {
      struck(at, 392, 2.6, 0.08, [1, 1.5, 2.24, 3.01]);
    },
    // the formless: no strike at all, only a held partial that swells
    formless: (at) => {
      tone(at, { f: 294, dur: 3.2, type: 'sine', gain: 0.055, attack: 1.1 });
      tone(at, { f: 440.5, dur: 3.0, type: 'sine', gain: 0.03, attack: 1.4 });
    },
    // the sūtra route: a gong
    sutra: (at) => {
      struck(at, 110, 3.4, 0.10, [1, 1.48, 2.11, 2.63, 3.37]);
      rush(at, { dur: 0.5, gain: 0.05, f: 1400, sweep: 400, q: 0.6, attack: 0.01 });
    },
    // the mantra route: a ḍamaru, two skins turning
    mantra: (at) => {
      [0, 0.13, 0.24, 0.36, 0.46].forEach((t, i) => skin(at + t, i % 2 ? 265 : 205, 0.075));
    },
    // Mahākāla, and the one square that reaches him: a roar a long way off
    roar: (at) => {
      rush(at, { dur: 2.6, gain: 0.09, f: 160, sweep: 70, q: 1.4, attack: 0.35 });
      tone(at, { f: 46, to: 38, dur: 2.6, type: 'sawtooth', gain: 0.06, attack: 0.4 });
    },
    // the sacred lands and buddha fields: an open chord, no attack to speak of
    pure: (at) => {
      [261.6, 392, 523.3].forEach((f, i) =>
        tone(at + i * 0.05, { f, dur: 2.2, type: 'sine', gain: 0.05, attack: 0.25 }));
    },
    // the acts of a buddha's body, sharing one voice: a measured triple stroke
    deeds: (at) => {
      [0, 0.2, 0.4].forEach((t) => struck(at + t, 330, 1.2, 0.06, [1, 2, 2.99]));
    },
    // and the end of it: everything, falling away
    nirvana: (at) => {
      struck(at, 174.6, 5.0, 0.10, [1, 1.5, 2, 3, 4.5, 6]);
      tone(at + 0.3, { f: 349.2, dur: 4.2, type: 'sine', gain: 0.045, attack: 0.9 });
      tone(at + 0.6, { f: 523.3, dur: 3.6, type: 'sine', gain: 0.03, attack: 1.2 });
    }
  };

  /* The die in the hand: wooden knocks, thinning as it runs down. */
  function dice(progress = 0) {
    if (!open()) return;
    const at = ctx.currentTime;
    rush(at, { dur: 0.05, gain: 0.09 * (1 - progress * 0.45), f: 2100 - 900 * progress, q: 2.2 });
    tone(at, { f: 320 - 120 * progress, to: 190 - 60 * progress, dur: 0.06, type: 'square',
               gain: 0.035 * (1 - progress * 0.5), attack: 0.002 });
  }

  /* The die settling: the last clatter, and the table under it. */
  function land() {
    if (!open()) return;
    const at = ctx.currentTime;
    [0, 0.055, 0.085].forEach((t, i) =>
      rush(at + t, { dur: 0.06, gain: 0.10 - i * 0.025, f: 1500 - i * 400, q: 2.6 }));
    tone(at + 0.08, { f: 140, to: 90, dur: 0.28, type: 'sine', gain: 0.06, attack: 0.004 });
  }

  /* Where the throw landed, and which way it went. The voice first; the rise
     or fall a beat later, so the two are heard as one gesture. */
  function arrive(voice, direction) {
    if (!open()) return;
    const at = ctx.currentTime + 0.02;
    (RECIPES[voice] || RECIPES.human)(at);
    if (direction > 0) {
      [0, 1].forEach((i) => tone(at + 0.34 + i * 0.11,
        { f: 392 * Math.pow(2, i * 4 / 12), dur: 0.5, type: 'sine', gain: 0.04 }));
    } else if (direction < 0) {
      [0, 1].forEach((i) => tone(at + 0.34 + i * 0.11,
        { f: 196 * Math.pow(2, -i * 3 / 12), dur: 0.7, type: 'triangle', gain: 0.045 }));
    }
  }

  /* A throw that goes nowhere, and the counting inside a trap. */
  function dead() {
    if (!open()) return;
    tone(ctx.currentTime, { f: 138, to: 128, dur: 0.32, type: 'sine', gain: 0.05 });
  }
  function count(done) {
    if (!open()) return;
    const at = ctx.currentTime;
    tone(at, { f: 330 + done * 26, dur: 0.16, type: 'triangle', gain: 0.05 });
  }

  return { dice, land, arrive, dead, count, ready: () => !!ctx, voices: RECIPES };
}
