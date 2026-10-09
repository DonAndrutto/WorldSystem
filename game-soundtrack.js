/* Still Waters: a quiet looping score, streamed from the offline app shell.
   The caller supplies mode, mute and visibility; playback waits for a user
   interaction if the browser blocks autoplay. Rapid toggles share one player. */
export function createGameSoundtrack({
  AudioClass, src = new URL('./assets/audio/still-waters.mp3', import.meta.url).href,
  setTimer = globalThis.setInterval, clearTimer = globalThis.clearInterval
} = {}) {
  const volume = 0.42;
  let audio = null, active = false, enabled = true, visible = true;
  let timer = null, pending = false, target = 0, disposed = false;
  const wanted = () => active && enabled && visible && !disposed;

  function fade(to, immediate = false) {
    target = to;
    clearTimer(timer); timer = null;
    if (!audio) return;
    if (immediate) {
      audio.volume = to;
      if (!to) audio.pause();
      return;
    }
    const from = audio.volume;
    let step = 0;
    timer = setTimer(() => {
      step++;
      audio.volume = from + (to - from) * Math.min(1, step / 16);
      if (step >= 16) {
        clearTimer(timer); timer = null;
        if (!to) audio.pause();
      }
    }, 50);
  }

  function sync({immediate = false} = {}) {
    if (!wanted()) { fade(0, immediate); return; }
    if (!audio && AudioClass) {
      audio = new AudioClass(src);
      audio.loop = true;
      audio.preload = 'none';
      audio.volume = 0;
    }
    if (!audio || pending) return;
    if (!audio.paused) {
      if (target !== volume) fade(volume);
      return;
    }
    pending = true;
    try {
      Promise.resolve(audio.play()).then(() => {
        pending = false;
        if (wanted()) fade(volume);
        else fade(0, true);
      }, () => { pending = false; });  // next gesture retries blocked autoplay
    } catch { pending = false; }
  }

  return {
    setActive(on) { active = !!on; sync(); },
    setEnabled(on) { enabled = !!on; sync(); },
    setVisible(on) { visible = !!on; sync({immediate: !visible}); },
    unlock: () => sync(),
    dispose() { disposed = true; fade(0, true); },
    state: () => ({active,enabled,visible,playing:!!audio && !audio.paused,pending})
  };
}
