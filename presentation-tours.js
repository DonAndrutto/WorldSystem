/* Derive routes from the same catalogues as the index, without duplicates.
 * Copy stays with its source entry, so tours receive existing translations. */
export const PRESENTATION_PACES = [1.5, 3, 5, 8];
export function createPresentationTours({ entries, tree, heaps, squares, wheelTree, resolveEntry }) {
  const unique = ids => [...new Set(ids)].filter(id => entries[id]);
  const resolve = id => resolveEntry(id)?.id || id;
  const indexed = tree.flatMap(([, rows]) => rows.filter(([id]) => id !== '—').map(([id]) => resolve(id)));
  const mandalaOnly = new Set(['about_mandala', ...heaps.filter(([n]) => n >= 18 && n !== 34 && n !== 35).map(([, id]) => id)]);
  const explorerIds = unique([...indexed, ...Object.keys(entries)]).filter(id =>
    !id.startsWith('wl_') && !id.startsWith('rebirth_') && !mandalaOnly.has(id));
  const stop = id => ({ id });
  return {
    explore: explorerIds.map(stop),
    mandala: heaps.map(([, id]) => stop(id)),
    game: unique(['rebirth_game', ...squares.map(square => 'rebirth_sq_' + square.n)]).map(stop),
    wheel: unique([
      ...wheelTree[1].filter(([id]) => id !== '—').map(([id]) => id),
      ...Object.keys(entries).filter(id => id.startsWith('wl_'))
    ]).map(stop)
  };
}

/* Timed playback is separate from rendering and from the recitation timer.
 * A stopped or hidden presentation never catches up by skipping slides. */
export function createPresentationPlayer({ clock = globalThis, onVisit = () => {}, onState = () => {} } = {}) {
  let mode = null, length = 0, index = 0, playing = false, seconds = 5, timer = null;
  const state = () => ({ active: mode !== null, mode, length, index, playing, seconds });
  const clear = () => { if (timer !== null) clock.clearTimeout(timer); timer = null; };
  const emit = reason => onState(state(), reason);
  const schedule = () => {
    clear();
    if (!playing || mode === null) return;
    timer = clock.setTimeout(() => {
      timer = null;
      if (!playing || mode === null) return;
      if (index >= length - 1) { playing = false; emit('pause'); return; }
      index++;
      onVisit(state());
      emit(); schedule();
    }, seconds * 1000);
  };
  const pause = () => { clear(); playing = false; emit('pause'); };
  const go = (next, autoplay = false) => {
    if (mode === null) return;
    const wasPlaying = playing;
    clear(); playing = autoplay;
    index = Math.max(0, Math.min(length - 1, Number.isFinite(next) ? Math.floor(next) : 0));
    onVisit(state()); emit(autoplay ? 'play' : wasPlaying ? 'pause' : 'visit'); schedule();
  };
  return {
    state, pause, go,
    start(nextMode, count, at = 0) {
      clear(); mode = nextMode; length = Math.max(1, count); go(at);
    },
    stop() { clear(); mode = null; playing = false; emit(); },
    play() {
      if (mode === null) return;
      if (index === length - 1) index = 0;
      playing = true; onVisit(state()); emit('play'); schedule();
    },
    toggle() { if (playing) pause(); else this.play(); },
    restart() { go(0); },
    setSeconds(value) {
      if (!PRESENTATION_PACES.includes(Number(value))) return;
      seconds = Number(value); emit(); schedule();
    }
  };
}
