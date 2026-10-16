/* A score for each mode.
 *
 * Six original loops, one per mode, all rendered by scripts/build-soundtrack.py
 * (Game) and scripts/build-mode-music.py (the rest). Each mode has a player of
 * its own, made only when the mode is first entered, so a visitor who never
 * opens the Wheel never downloads its score. Changing mode lets the old score
 * fade out while the new one fades in; muting, hiding the page and ducking
 * (a world ending turns the music down) apply to all of them together.
 */
import { createGameSoundtrack } from './game-soundtrack.js';

const track = (file) => new URL('./assets/audio/' + file, import.meta.url).href;

export const MODE_TRACKS = {
  explore: { title: 'Far Horizons', src: track('far-horizons.mp3') },
  mandala: { title: 'Thirty-Seven Offerings', src: track('thirty-seven-offerings.mp3') },
  game: { title: 'Still Waters', src: track('still-waters.mp3') },
  wheel: { title: 'The Turning', src: track('the-turning.mp3') },
  worlds: { title: 'Thousandfold', src: track('thousandfold.mp3') },
  astrology: { title: 'Twenty-Eight Mansions', src: track('twenty-eight-mansions.mp3') }
};

export function createModeSoundtrack({
  AudioClass, tracks = MODE_TRACKS,
  setTimer = globalThis.setInterval, clearTimer = globalThis.clearInterval
} = {}) {
  const players = new Map();
  let mode = null, enabled = true, visible = true, level = 1, disposed = false;

  function playerFor(name) {
    if (!players.has(name)) {
      const player = createGameSoundtrack({ AudioClass, src: tracks[name].src, setTimer, clearTimer });
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
    dispose() { disposed = true; players.forEach((p) => p.dispose()); },
    state: () => ({
      mode, enabled, visible, level,
      title: mode ? tracks[mode].title : null,
      playing: mode ? !!players.get(mode)?.state().playing : false,
      players: [...players.keys()]
    })
  };
}
