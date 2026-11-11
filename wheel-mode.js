import { createWheelView } from './wheel-view.js';

/* ── the wheel of life ──────────────────────────────────────────────────
   The fourth view is not a view of the model at all but a thing on a wall:
   the bhavacakra as a painted relief, every part of it an entry. It shares
   the dock, the index and the entries with the rest of the page, and it has
   a camera of its own that can bring the wall close and turn it a little,
   but not around. */
export function createWheelMode({ host, art, freeRect, also, entry, isTibetan, isSheetOpen,
  show, close, syncChrome, syncHome, getMode, reducedMotion }) {
  const win = host.ownerDocument.defaultView;
  const wheelTip = host.querySelector('.wl-tip');
  const view = createWheelView({
    host, art, freeRect, reducedMotion,
    titleOf: (id) => (entry(id) ? entry(id).t : id)
  });
  // A tap on a part opens its entry, where it is: the wheel does not fly to
  // what it was tapped on. A tap on the bare wall puts the entry away.
  view.on('pick', (id) => {
    if (id && entry(id)) show(id, true);
    else if (isSheetOpen()) close();
  });
  view.on('hover', (id, p) => {
    const e = id && entry(id);
    if (!e || !p) { wheelTip.hidden = true; return; }
    const bo = isTibetan() && /[\u0F00-\u0FFF]/.test(e.tib || '');
    const html = bo ? '<span lang="bo">' + e.tib + '</span><i>' + e.t + '</i>' : e.t + (e.k ? '<i>' + e.k + '</i>' : '');
    if (wheelTip.dataset.id !== id + bo) { wheelTip.innerHTML = html; wheelTip.dataset.id = id + bo; }
    wheelTip.hidden = false;
    /* over the pointer, and on the screen: a part at the top of it has its name
       shown under the pointer instead, and one at a side is not cut off by it */
    const tw = wheelTip.offsetWidth, th = wheelTip.offsetHeight;
    const x = Math.min(host.clientWidth - tw / 2 - 8, Math.max(tw / 2 + 8, p.x));
    const below = p.y - th - 16 < 8;
    wheelTip.style.left = x + 'px';
    wheelTip.style.top = p.y + 'px';
    wheelTip.classList.toggle('below', below);
  });
  view.on('change', () => win.setTimeout(syncHome, 0));
  function enter() {
    syncChrome();
    view.build();
    /* Framed now, without a flight: it is arriving, and the stage has had its
       size since syncChrome showed it. Not a frame later, which would undo an
       entry opened with the wheel, flown to as the wheel comes up. */
    view.home(0);
  }
  function leave() {
    wheelTip.hidden = true;
    close();
    view.select(null);
  }
  function part(id) {
    if (!id) return null;
    if (view.has(id)) return id;
    return also[id] && view.has(also[id]) ? also[id] : null;
  }
  function resize() { if (getMode() === 'wheel') view.resize(); }
  win.addEventListener('resize', resize);
  return { enter, leave, part, view, resize };
}
