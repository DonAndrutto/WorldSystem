/* What the interface sounds like.
 *
 * A press, a switch, a menu opening, a tab chosen: each gets a short sound of
 * its own, and each of the six modes has a chime that is only its own — the
 * pluck of Explorer, the bowl of the Mandala, the knock of the Game, the drum
 * of the Wheel, the shimmer of the Billion worlds, the glass of Astrology.
 *
 * Which sound a control gets is read off the control (cueFor, pure and
 * tested); the sounds themselves are built from oscillators and noise
 * (synth.js) when they play. Only real presses sound: a click that the page
 * makes on someone's behalf, as a tour or the introduction does, is silent,
 * and so is anything inside an element marked data-silent — the die has its
 * own sounds in the game.
 */

const ACTIONABLE = 'button, [role="button"], [role="tab"], [role="menuitem"], a[href], summary, input, select, label, [data-act], [data-mode], [data-intro-mode]';
const CLOSERS = /^\s*(close|zamknij)\b/i;

/** The cue a press on `target` should make, or null for none. */
export function cueFor(target) {
  const el = target?.closest?.(ACTIONABLE);
  if (!el || el.closest('[data-silent]')) return null;
  if (el.disabled || el.getAttribute('aria-disabled') === 'true') return null;
  const tag = el.tagName;
  if (tag === 'LABEL') return el.control && el.control !== target ? null : { cue: 'tap' };
  if (tag === 'INPUT') {
    if (el.type === 'checkbox') return { cue: el.checked ? 'on' : 'off' };
    if (el.type === 'radio') return { cue: 'select' };
    return null;                       // ranges tick as they move; text fields stay quiet
  }
  if (tag === 'SELECT') return null;   // its change is heard when it comes
  if (tag === 'SUMMARY') return { cue: el.parentElement?.open ? 'close' : 'open' };
  const mode = el.dataset?.mode || el.dataset?.introMode;
  if (mode) return { cue: 'mode', mode };
  const label = el.getAttribute('aria-label') || el.getAttribute('title') || '';
  if (CLOSERS.test(label) || el.hasAttribute('data-close') || /^[×✕✖]$/.test(el.textContent.trim())) return { cue: 'close' };
  if (el.getAttribute('role') === 'tab' || el.hasAttribute('aria-pressed') || el.hasAttribute('aria-selected')) return { cue: 'select' };
  return { cue: 'tap' };
}

export function createUiSound(synth) {
  const last = new Map();

  /* One recipe per cue, each a few tens of milliseconds long and quiet, so a
     run of presses never becomes a pile of noise. */
  const CUES = {
    tap: (s, at) => {
      s.tone(at, { f: 640, to: 520, dur: 0.07, type: 'triangle', gain: 0.05, attack: 0.002 });
      s.rush(at, { dur: 0.03, gain: 0.016, f: 3000, q: 1.2 });
    },
    select: (s, at) => {
      s.tone(at, { f: 760, dur: 0.09, type: 'sine', gain: 0.045, attack: 0.003 });
      s.tone(at + 0.035, { f: 1140, dur: 0.08, type: 'sine', gain: 0.02, attack: 0.003 });
    },
    open: (s, at) => {
      s.tone(at, { f: 440, dur: 0.14, type: 'sine', gain: 0.04, attack: 0.004 });
      s.tone(at + 0.06, { f: 660, dur: 0.18, type: 'sine', gain: 0.035, attack: 0.004 });
    },
    close: (s, at) => {
      s.tone(at, { f: 660, dur: 0.12, type: 'sine', gain: 0.035, attack: 0.004 });
      s.tone(at + 0.06, { f: 440, dur: 0.16, type: 'sine', gain: 0.035, attack: 0.004 });
    },
    on: (s, at) => {
      s.tone(at, { f: 600, dur: 0.1, type: 'triangle', gain: 0.045, attack: 0.003 });
      s.tone(at + 0.07, { f: 900, dur: 0.14, type: 'triangle', gain: 0.04, attack: 0.003 });
    },
    off: (s, at) => {
      s.tone(at, { f: 600, dur: 0.1, type: 'triangle', gain: 0.04, attack: 0.003 });
      s.tone(at + 0.07, { f: 400, dur: 0.14, type: 'triangle', gain: 0.035, attack: 0.003 });
    },
    tick: (s, at, fraction = 0.5) =>
      s.tone(at, { f: 500 + fraction * 700, dur: 0.035, type: 'sine', gain: 0.028, attack: 0.002 }),
    mode: (s, at, mode) => (MODES[mode] || MODES.explore)(s, at)
  };

  const MODES = {
    explore: (s, at) => [392, 588, 784].forEach((f, i) =>
      s.tone(at + i * 0.09, { f, dur: 0.5 + i * 0.1, type: i < 2 ? 'triangle' : 'sine', gain: 0.06 - i * 0.012 })),
    mandala: (s, at) => s.struck(at, 262, 2.2, 0.08, [1, 2.71, 5.15]),
    game: (s, at) => {
      s.skin(at, 190, 0.07);
      s.skin(at + 0.11, 150, 0.05);
      s.tone(at + 0.2, { f: 294, dur: 0.5, type: 'triangle', gain: 0.04 });
    },
    wheel: (s, at) => [140, 175, 210].forEach((f, i) => s.skin(at + i * 0.12, f, 0.06)),
    worlds: (s, at) => [523, 784, 1047, 1568].forEach((f, i) =>
      s.tone(at + i * 0.07, { f, dur: 1.1, type: 'sine', gain: 0.03, attack: 0.05 })),
    astrology: (s, at) => {
      s.tone(at, { f: 880, dur: 1.4, type: 'sine', gain: 0.05, attack: 0.003 });
      s.tone(at, { f: 3520, dur: 0.25, type: 'sine', gain: 0.015, attack: 0.003 });
      s.tone(at + 0.16, { f: 1320, dur: 1.2, type: 'sine', gain: 0.03, attack: 0.003 });
    }
  };

  /* The same cue twice within a few milliseconds is one press seen twice (a
     label and the box inside it, say); a slider is let through faster. */
  function play(cue, arg, gap = 0.035) {
    if (!Object.hasOwn(CUES, cue) || !synth.open()) return false;
    const now = synth.now();
    if (now - (last.get(cue) ?? -1) < gap) return false;
    last.set(cue, now);
    CUES[cue](synth, now + 0.005, arg);
    return true;
  }

  return { play, cues: Object.keys(CUES), modes: Object.keys(MODES) };
}

/* Listen for presses on the whole page. `isOn` is asked each time, so the
   Sound switch takes effect at once. Returns a function that stops listening. */
export function installUiSound({ root = document, sound, isOn = () => true, trusted = (ev) => ev.isTrusted }) {
  const audible = () => isOn() && !(root.ownerDocument || root).hidden;
  const onClick = (ev) => {
    if (!audible() || !trusted(ev)) return;
    const hit = cueFor(ev.target);
    if (hit) sound.play(hit.cue, hit.mode);
  };
  const onChange = (ev) => {
    if (audible() && trusted(ev) && ev.target?.tagName === 'SELECT') sound.play('select');
  };
  const onInput = (ev) => {
    const el = ev.target;
    if (!audible() || !trusted(ev) || el?.type !== 'range') return;
    const min = Number(el.min || 0), max = Number(el.max || 100);
    sound.play('tick', max > min ? (Number(el.value) - min) / (max - min) : 0.5, 0.07);
  };
  root.addEventListener('click', onClick, true);
  root.addEventListener('change', onChange, true);
  root.addEventListener('input', onInput, true);
  return () => {
    root.removeEventListener('click', onClick, true);
    root.removeEventListener('change', onChange, true);
    root.removeEventListener('input', onInput, true);
  };
}
