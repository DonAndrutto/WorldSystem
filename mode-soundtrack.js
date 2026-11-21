/* A score for each mode, synthesized live in Web Audio.
 *
 * Six original seamless scores, one per mode (mode-scores.js), replacing
 * 6.47 MB of pre-rendered MP3s with live Web Audio synthesis. Each mode has
 * a player of its own, made only when the mode is first entered, sharing one
 * AudioContext. Changing mode fades the old score out while the new one fades
 * in; muting, hiding the page and ducking (a world ending turns the music down)
 * apply to all of them together — including on iOS Safari via GainNode.
 */
import { createGameSoundtrack } from './game-soundtrack.js';
import { MODE_SCORES } from './mode-scores.js';

export const MODE_TRACKS = Object.fromEntries(
  Object.entries(MODE_SCORES).map(([k, v]) => [k, { title: v.title, score: k }])
);

export function createModeSoundtrack({
  AudioContextClass = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) || null,
  tracks = MODE_TRACKS,
  setTimer = globalThis.setInterval,
  clearTimer = globalThis.clearInterval,
  setTimeoutFn = globalThis.setTimeout,
  clearTimeoutFn = globalThis.clearTimeout
} = {}) {
  const players = new Map();
  let mode = null, enabled = true, visible = true, level = 1, disposed = false;
  let shared = null;

  function getContext() {
    if (shared) return shared;
    if (!AudioContextClass) return null;
    let ctx;
    try { ctx = new AudioContextClass(); } catch { return null; }
    const buf = ctx.createBuffer(1, Math.round((ctx.sampleRate || 24000) * 2), ctx.sampleRate || 24000);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    shared = { ctx, noiseBuf: buf };
    return shared;
  }

  function playerFor(name) {
    if (!players.has(name)) {
      const player = createGameSoundtrack({
        getContext, scoreName: tracks[name].score || name,
        setTimer, clearTimer, setTimeoutFn, clearTimeoutFn
      });
      player.setEnabled(enabled);
      player.setVisible(visible);
      player.setLevel(level);
      players.set(name, player);
    }
    return players.get(name);
  }

  return {
    setMode(next) {
      if (disposed) return;
      mode = Object.hasOwn(tracks, next) ? next : null;
      for (const [name, player] of players) if (name !== mode) player.setActive(false);
      if (mode) playerFor(mode).setActive(true);
    },
    setEnabled(on) { enabled = !!on; players.forEach((p) => p.setEnabled(enabled)); },
    setVisible(on) { visible = !!on; players.forEach((p) => p.setVisible(visible)); },
    setLevel(x) { level = Math.max(0, Math.min(1, x)); players.forEach((p) => p.setLevel(level)); },
    unlock() { if (mode) players.get(mode)?.unlock(); },
    dispose() {
      disposed = true;
      players.forEach((p) => p.dispose());
      if (shared?.ctx && typeof shared.ctx.close === 'function') shared.ctx.close().catch(() => {});
      shared = null;
    },
    state: () => ({
      mode, enabled, visible, level,
      title: mode ? tracks[mode].title : null,
      playing: mode ? !!players.get(mode)?.state().playing : false,
      players: [...players.keys()]
    })
  };
}
