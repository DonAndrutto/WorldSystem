/* The wheel on its wall, and the hands that are allowed to move it.

   The relief is a thing on a wall, not a thing in space. It can be brought
   close and looked over, and the wall can be turned a little — enough for the
   wheel to be seen standing off it, Yama's head and hands standing off the
   wheel, the figures standing off their ground — but never so far that it
   could be walked around. There is nothing behind a wall.

   Each layer of the drawing is an SVG of its own, the size of the screen,
   showing the same region of the drawing through its viewBox. Zooming and
   panning change that region, which keeps every line sharp at any distance.
   While a gesture is running the change is carried by a CSS transform instead
   and written into the viewBox a moment after it stops, so a pinch moves
   pixels rather than asking for the drawing to be painted again sixty times a
   second. The turn is a 3D rotation of the stack, and each layer stands out
   from the wall by its own depth, scaled with the zoom so that a relief seen
   close stands out as far as it did from across the room.

   What a layer draws is held to a window: the region on the screen and a
   margin round it, wide enough for the turn and for a gesture to carry it a
   way before it is drawn again. A layer left to draw all of itself is, close
   in, tens of thousands of pixels across: a phone either drops it without a
   word or runs out of memory holding it. A gesture or a flight that carries
   the view near the window's edge has it drawn again round where it now is,
   and past the window, for the moment that takes, is the wall's own colour. */

const SVGNS = 'http://www.w3.org/2000/svg';
export const TILT = { x: 14, y: 22 };            // how far the wall turns, in degrees
const PERSPECTIVE = 1800;
const MARGIN = 0.3;                              // the window past the screen, in screens

export function createWheelView({ host, art, freeRect, reducedMotion = () => false, titleOf = (id) => id }) {
  const doc = host.ownerDocument, win = doc.defaultView;
  const listeners = { pick: [], hover: [], change: [] };
  const emit = (type, ...a) => listeners[type].forEach((fn) => fn(...a));

  /* ── the stack ─────────────────────────────────────────────────────── */
  // the wall's colour behind it all, where a gesture outruns what is drawn
  const ground = doc.createElement('div');
  ground.className = 'wl-back';
  ground.setAttribute('aria-hidden', 'true');
  host.appendChild(ground);
  const tilt = doc.createElement('div');
  tilt.className = 'wl-tilt';
  const defs = doc.createElementNS(SVGNS, 'svg');
  defs.setAttribute('class', 'wl-defs');
  defs.setAttribute('aria-hidden', 'true');
  defs.setAttribute('width', '0');
  defs.setAttribute('height', '0');
  host.appendChild(defs);
  host.appendChild(tilt);
  const layers = [];
  let built = false, drawnCache = null;
  // the drawing as strings and boxes: cheap, and enough to answer what is on it
  const drawn = () => drawnCache || (drawnCache = art());
  /* The drawing is set down the first time it is asked for, not at load: the
     world is what most visits open on, and seven layers of relief are not
     something to build behind it for nothing. */
  function build() {
    if (built) return;
    built = true;
    const w = drawn();
    defs.innerHTML = '<defs>' + w.defs + '</defs>';
    w.layers.forEach((l) => {
      const svg = doc.createElementNS(SVGNS, 'svg');
      svg.setAttribute('class', 'wl-layer wl-' + l.name);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.innerHTML = '<svg class="wl-window" preserveAspectRatio="none">' + l.svg + '</svg>';
      if (l.name !== 'wall') svg.setAttribute('aria-hidden', 'true');
      tilt.appendChild(svg);
      layers.push({ svg, pane: svg.firstChild, depth: l.depth, name: l.name });
    });
    ART.w = w.width; ART.h = w.height;
    // every part is a control: named, focusable, and answering to Enter
    const seen = new Set();
    host.querySelectorAll('[data-wl]').forEach((el) => {
      const id = el.getAttribute('data-wl');
      if (seen.has(id)) return;          // one stop per part, however many layers draw it
      seen.add(id);
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', titleOf(id));
      el.closest('svg').removeAttribute('aria-hidden');
    });
    if (selected) { mark('wl-sel', selected); veil(); }
    fit();
    commit();
  }
  const ART = { w: 1320, h: 1740 };
  const boxes = { get: (id) => drawn().boxes.get(id), has: (id) => drawn().boxes.has(id), keys: () => drawn().boxes.keys() };

  /* ── where it is looking ───────────────────────────────────────────── */
  // `view` is the drawing point at the centre of the free rectangle, and how
  // many screen pixels a drawing unit is. `shown` is what the viewBoxes hold.
  const view = { x: 660, y: 870, s: 0.5 };
  let shown = { ...view };
  const turn = { x: 0, y: 0 };
  let driftTime = 0;
  let homeView = { ...view };
  const size = () => ({ w: Math.max(host.clientWidth, 1), h: Math.max(host.clientHeight, 1) });
  const centre = () => {
    const f = freeRect ? freeRect() : null;
    const { w, h } = size();
    return f ? { x: f.x, y: f.y, w: f.w, h: f.h } : { x: w / 2, y: h / 2, w, h };
  };
  function fit() {
    const f = centre();
    const s = Math.min(f.w / ART.w, f.h / ART.h) * 0.97;
    homeView = { x: ART.w / 2, y: ART.h / 2, s };
    return homeView;
  }
  // the photographs hold about three pixels to a unit where the close-ups
  // are, one and a half elsewhere: closer than this there is nothing more to see
  const minScale = () => homeView.s * 0.8;
  const maxScale = () => Math.max(homeView.s * 7, 3.2);
  function clamp(v) {
    v.s = Math.min(maxScale(), Math.max(minScale(), v.s));
    v.x = Math.min(ART.w, Math.max(0, v.x));
    v.y = Math.min(ART.h, Math.max(0, v.y));
    return v;
  }

  /* ── drawing it ────────────────────────────────────────────────────── */
  let idle = null;
  function commit() {
    if (!built) return;
    const { w, h } = size();
    const f = centre();
    shown = { ...view };
    const s = shown.s;
    const box = [shown.x - f.x / s, shown.y - f.y / s, w / s, h / s].map((n) => Math.round(n * 100) / 100);
    const vb = box.join(' ');
    seen = box;
    const m = Math.max(w, h) * MARGIN / s;
    pane = [box[0] - m, box[1] - m, box[2] + 2 * m, box[3] + 2 * m].map((n) => Math.round(n * 100) / 100);
    const [px, py, pw, ph] = pane.map(String);
    layers.forEach((l, i) => {
      l.svg.setAttribute('viewBox', vb);
      l.svg.setAttribute('width', String(w));
      l.svg.setAttribute('height', String(h));
      l.pane.setAttribute('x', px); l.pane.setAttribute('y', py);
      l.pane.setAttribute('width', pw); l.pane.setAttribute('height', ph);
      l.pane.setAttribute('viewBox', pane.join(' '));
      // the shadow a layer throws on the one behind it, as far as it stands off it
      const off = i > 1 && l.name !== 'shade' ? Math.min(16, (l.depth - layers[i - 1].depth) * s * 0.34) : 0;
      l.svg.style.filter = off > 0.4
        ? `drop-shadow(${(off * 0.55).toFixed(1)}px ${off.toFixed(1)}px ${(off * 0.7).toFixed(1)}px rgba(24, 12, 6, .42))` : '';
    });
    const g = drawn().ground;
    ground.style.backgroundColor = g ? g(shown.y) : '';
    if (selected) veil();
    place();
    host.classList.remove('wl-moving');
  }
  /* whether the view has been carried near the edge of the window drawn round
     it, so that it has to be drawn again before the edge is seen */
  function outrun() {
    if (!built) return false;
    const { w, h } = size(), f = centre();
    const x0 = view.x - f.x / view.s, y0 = view.y - f.y / view.s;
    const x1 = x0 + w / view.s, y1 = y0 + h / view.s;
    const [px, py, pw, ph] = pane;
    const keep = Math.max(w, h) * MARGIN / shown.s * 0.35;
    return x0 < px + keep || y0 < py + keep || x1 > px + pw - keep || y1 > py + ph - keep;
  }
  /* the transform that carries what is shown to where the view now is */
  function place() {
    const f = centre();
    const k = view.s / shown.s;
    const tx = (shown.x - view.x) * view.s, ty = (shown.y - view.y) * view.s;
    host.style.perspectiveOrigin = f.x + 'px ' + f.y + 'px';
    tilt.style.transformOrigin = f.x + 'px ' + f.y + 'px';
    tilt.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${k.toFixed(4)}) rotateX(${turn.x.toFixed(2)}deg) rotateY(${turn.y.toFixed(2)}deg)`;
    // each layer stands off the wall by its depth, and is shrunk by just what
    // the perspective would enlarge it by, so that face on it lies flat
    layers.forEach((l) => {
      const z = Math.min(l.depth * shown.s, PERSPECTIVE * 0.3);
      const c = (PERSPECTIVE - z) / PERSPECTIVE;
      l.svg.style.transformOrigin = f.x + 'px ' + f.y + 'px';
      l.svg.style.transform = z ? `translateZ(${z.toFixed(1)}px) scale(${c.toFixed(4)})` : '';
    });
    const turned = Math.abs(turn.x) + Math.abs(turn.y) > 0.05;
    host.classList.toggle('wl-turned', turned);
    emit('change');
  }
  /* A change the eye is following: carried by the transform now, painted
     properly a moment after it stops. */
  function moved(settle = 140) {
    host.classList.add('wl-moving');
    if (outrun()) commit(); else place();
    win.clearTimeout(idle);
    idle = win.setTimeout(commit, settle);
  }

  /* ── flying ────────────────────────────────────────────────────────── */
  let flight = null;
  function flyTo(target, dur = 700, tiltTo = null) {
    cancelFlight();
    const to = clamp({ ...target });
    const from = { ...view }, t0 = { ...turn };
    const tt = tiltTo || turn;
    if (reducedMotion() || dur <= 0) {
      Object.assign(view, to);
      Object.assign(turn, tt);
      commit();
      return;
    }
    const start = win.performance.now();
    // zoom travels in log space, so a long way in is not all over at the start
    const ls0 = Math.log(from.s), ls1 = Math.log(to.s);
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      view.s = Math.exp(ls0 + (ls1 - ls0) * e);
      view.x = from.x + (to.x - from.x) * e;
      view.y = from.y + (to.y - from.y) * e;
      turn.x = t0.x + (tt.x - t0.x) * e;
      turn.y = t0.y + (tt.y - t0.y) * e;
      host.classList.add('wl-moving');
      if (outrun()) commit(); else place();
      if (t < 1) flight = win.requestAnimationFrame(step);
      else { flight = null; commit(); }
    };
    flight = win.requestAnimationFrame(step);
  }
  function cancelFlight() {
    if (flight) { win.cancelAnimationFrame(flight); flight = null; }
  }
  function home(dur = 600) {
    build();
    fit();
    flyTo(homeView, dur, { x: 0, y: 0 });
  }
  /* Frame one part: its box, fitted to the free rectangle with some of its
     surroundings, and no closer than a figure needs to be read. */
  function focus(id, dur = 700) {
    build();
    const b = boxes.get(id);
    if (!b) return false;
    const f = centre();
    const pad = 2.1;
    const s = Math.min(f.w / (b[2] * pad), f.h / (b[3] * pad), homeView.s * 7);
    flyTo({ x: b[0] + b[2] / 2, y: b[1] + b[3] / 2, s: Math.max(homeView.s, s) }, dur, { x: 0, y: 0 });
    return true;
  }

  /* ── gestures ──────────────────────────────────────────────────────── */
  const pointers = new Map();
  let drag = null, pinch = null, lastTap = 0;
  const zoomAt = (px, py, k) => {
    const f = centre();
    const before = { x: view.x + (px - f.x) / view.s, y: view.y + (py - f.y) / view.s };
    view.s = Math.min(maxScale(), Math.max(minScale(), view.s * k));
    view.x = before.x - (px - f.x) / view.s;
    view.y = before.y - (py - f.y) / view.s;
    clamp(view);
  };
  const local = (ev) => {
    const r = host.getBoundingClientRect();
    return { x: ev.clientX - r.left, y: ev.clientY - r.top };
  };
  /* Close in, the wall slides under the hand or the finger; seen whole, it
     turns. A right button or a held Shift always turns it. */
  const zoomedIn = () => view.s > homeView.s * 1.08;
  host.addEventListener('pointerdown', (ev) => {
    if (ev.button > 2) return;
    cancelFlight();
    const p = local(ev);
    pointers.set(ev.pointerId, p);
    try { host.setPointerCapture(ev.pointerId); } catch (err) {}
    if (pointers.size === 1) {
      const turnIt = ev.button === 2 || ev.shiftKey || !zoomedIn();
      /* a fingertip wanders further in a tap than a mouse does: past this it
         is a drag, and short of it a tap that opens what it landed on */
      const slop = ev.pointerType === 'touch' ? 11 : ev.pointerType === 'pen' ? 8 : 5;
      drag = { id: ev.pointerId, x0: p.x, y0: p.y, x: p.x, y: p.y, moved: false, slop, turnIt, turn0: { ...turn }, view0: { ...view }, target: ev.target };
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
      if (drag) drag.moved = true;
    }
  });
  host.addEventListener('pointermove', (ev) => {
    const p = local(ev);
    if (!pointers.has(ev.pointerId)) {
      // hovering: name the part under the pointer
      const el = ev.target.closest && ev.target.closest('[data-wl]');
      hover(el ? el.getAttribute('data-wl') : null, p);
      return;
    }
    pointers.set(ev.pointerId, p);
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1, mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      zoomAt(mx, my, d / pinch.d);
      view.x -= (mx - pinch.mx) / view.s;
      view.y -= (my - pinch.my) / view.s;
      clamp(view);
      pinch = { d, mx, my };
      moved();
      return;
    }
    if (!drag || drag.id !== ev.pointerId) return;
    const dx = p.x - drag.x0, dy = p.y - drag.y0;
    if (!drag.moved && Math.hypot(dx, dy) < drag.slop) return;
    if (!drag.moved) hover(null);
    drag.moved = true;
    if (drag.turnIt) {
      turn.y = Math.max(-TILT.y, Math.min(TILT.y, drag.turn0.y + dx * 0.12));
      turn.x = Math.max(-TILT.x, Math.min(TILT.x, drag.turn0.x - dy * 0.12));
      place();
    } else {
      view.x = drag.view0.x - dx / view.s;
      view.y = drag.view0.y - dy / view.s;
      clamp(view);
      moved();
    }
  });
  const end = (ev) => {
    if (!pointers.has(ev.pointerId)) return;
    pointers.delete(ev.pointerId);
    if (pointers.size < 2) pinch = null;
    else {
      // a finger lifted from three: the pinch goes on between the two left
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
    }
    if (pointers.size === 1 && drag) {
      /* Out of a pinch, the finger that stays goes on from where it is and
         from the view as the pinch left it, not from where it first came
         down: that was before the pinch moved everything under it. */
      const [[id, p]] = [...pointers];
      drag = { id, x0: p.x, y0: p.y, x: p.x, y: p.y, moved: true, turnIt: !zoomedIn(), turn0: { ...turn }, view0: { ...view }, target: null };
      return;
    }
    if (drag && drag.id === ev.pointerId) {
      const tap = !drag.moved && ev.type === 'pointerup';
      const target = drag.target;
      drag = null;
      if (tap) {
        const el = target && target.closest && target.closest('[data-wl]');
        emit('pick', el ? el.getAttribute('data-wl') : null, ev);
        lastTap = win.performance.now();
      }
    }
    if (!pointers.size) { win.clearTimeout(idle); idle = win.setTimeout(commit, 60); }
  };
  host.addEventListener('pointerup', end);
  host.addEventListener('pointercancel', end);
  host.addEventListener('pointerleave', (ev) => { if (!pointers.size) hover(null); });
  host.addEventListener('contextmenu', (ev) => ev.preventDefault());
  host.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    cancelFlight();
    const p = local(ev);
    // a trackpad pinch arrives as a wheel with ctrl held, in much finer steps
    const unit = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? 400 : 1;
    const k = Math.exp(-ev.deltaY * unit * (ev.ctrlKey ? 0.01 : 0.0016));
    zoomAt(p.x, p.y, k);
    moved(160);
  }, { passive: false });
  /* Safari's own trackpad pinch. On an iPhone or an iPad the same events come
     with a pinch of the fingers as well, which the pointers above already
     answer: taken twice, the wall would come twice as fast and fight itself. */
  let gScale = 1;
  host.addEventListener('gesturestart', (ev) => { ev.preventDefault(); gScale = 1; });
  host.addEventListener('gesturechange', (ev) => {
    ev.preventDefault();
    if (pointers.size) return;
    if (!Number.isFinite(ev.scale) || ev.scale <= 0) return;
    const p = local(ev);
    zoomAt(p.x, p.y, ev.scale / gScale);
    gScale = ev.scale;
    moved(160);
  });
  /* The stage hides what overflows it, but a browser will still scroll it to
     show an element that takes the focus, and nothing would scroll it back:
     the wall would sit off to one side of where the pointer finds it. */
  host.addEventListener('scroll', () => { host.scrollTop = 0; host.scrollLeft = 0; });
  /* A part reached with the keyboard is brought onto the screen if it is off
     it, at the distance the wall is seen from. Only with the keyboard: a tap
     focuses what it lands on too, a moment after the finger lifts, and a tap
     on a large part close in would otherwise carry the wall off to its middle. */
  let keyed = false;
  doc.addEventListener('keydown', () => { keyed = true; }, true);
  doc.addEventListener('pointerdown', () => { keyed = false; }, true);
  host.addEventListener('focusin', (ev) => {
    const el = ev.target.closest && ev.target.closest('[data-wl]');
    const b = el && boxes.get(el.getAttribute('data-wl'));
    if (!b || !keyed || drag || pointers.size) return;
    const { w, h } = size(), f = centre();
    const x0 = view.x - f.x / view.s, y0 = view.y - f.y / view.s;
    const cx = b[0] + b[2] / 2, cy = b[1] + b[3] / 2;
    if (cx < x0 || cy < y0 || cx > x0 + w / view.s || cy > y0 + h / view.s) flyTo({ x: cx, y: cy, s: view.s }, 450);
  });
  // a part reached with the keyboard is a part picked
  host.addEventListener('keydown', (ev) => {
    const el = ev.target.closest && ev.target.closest('[data-wl]');
    if (el && (ev.key === 'Enter' || ev.key === ' ')) {
      ev.preventDefault();
      emit('pick', el.getAttribute('data-wl'), ev);
    }
  });

  /* ── naming and marking ────────────────────────────────────────────── */
  let hovered = null;
  function hover(id, p) {
    if (id !== hovered) {
      host.querySelectorAll('.wl-hover').forEach((el) => el.classList.remove('wl-hover'));
      if (id) host.querySelectorAll(`[data-wl="${id}"]`).forEach((el) => el.classList.add('wl-hover'));
      hovered = id;
    }
    emit('hover', id, p);
  }
  let selected = null;
  const mark = (cls, id) => host.querySelectorAll(`[data-wl="${id}"]`).forEach((el) => el.classList.add(cls));
  /* A picked part is outlined, and everything else on the wall is dimmed
     round it, so that one figure in a crowded relief can be found. */
  /* The veil covers what is on the screen and a margin round it, not the
     whole of the wall's run: a transformed layer as large as that is more
     than the browser will composite, and it drops it without a word. */
  let seen = [0, 0, 1320, 1740], pane = [-400, -400, 2120, 2540];
  function veil() {
    const shade = host.querySelector('.wl-veil');
    if (!shade) return;
    const d = selected && drawn().shapes ? drawn().shapes.get(selected) : '';
    const [x, y, w, h] = pane;
    const box = `M${Math.floor(x)} ${Math.floor(y)}H${Math.ceil(x + w)}V${Math.ceil(y + h)}H${Math.floor(x)}Z`;
    shade.setAttribute('d', d ? box + d : '');
    host.classList.toggle('wl-veiled', !!d);
  }
  function select(id) {
    const next = id && boxes.has(id) ? id : null;
    if (next === selected) return;
    host.querySelectorAll('.wl-sel').forEach((el) => el.classList.remove('wl-sel'));
    selected = next;
    if (selected && built) mark('wl-sel', selected);
    if (built) veil();
  }

  /* ── keeping up with the screen ────────────────────────────────────── */
  function resize() {
    if (!built) return;
    const atHome = Math.abs(view.s - homeView.s) < homeView.s * 0.02 && Math.abs(view.x - homeView.x) < 2 && Math.abs(view.y - homeView.y) < 2;
    fit();
    if (atHome) Object.assign(view, homeView);
    commit();
  }

  return {
    build, home, focus, select, resize, commit,
    // A slow, bounded sway reveals relief depth without orbiting behind the
    // painting. The app owns playback, reduced-motion and visibility policy.
    advanceMotion(dt) {
      if (!built || host.hidden || flight || pointers.size || !(dt > 0)) return;
      driftTime += Math.max(0, Math.min(Number(dt) || 0, 0.1));
      turn.x = Math.sin(driftTime * 0.16) * 2;
      turn.y = Math.sin(driftTime * 0.12) * 4;
      place();
    },
    has: (id) => boxes.has(id),
    boxOf: (id) => boxes.get(id) || null,
    parts: () => [...boxes.keys()],
    isHome: () => Math.abs(view.s - homeView.s) < homeView.s * 0.02 && Math.abs(turn.x) + Math.abs(turn.y) < 0.1
      && Math.abs(view.x - homeView.x) < 2 && Math.abs(view.y - homeView.y) < 2,
    state: () => ({ view: { ...view }, shown: { ...shown }, turn: { ...turn }, home: { ...homeView }, selected }),
    turnBy: (dx, dy) => {
      cancelFlight();
      turn.y = Math.max(-TILT.y, Math.min(TILT.y, turn.y + dx));
      turn.x = Math.max(-TILT.x, Math.min(TILT.x, turn.x + dy));
      place();
    },
    // a key pressed while the wall is flying stops it where it is, and moves from there
    zoomBy: (k) => { cancelFlight(); const f = centre(); zoomAt(f.x, f.y, k); moved(160); },
    panBy: (dx, dy) => { cancelFlight(); view.x += dx / view.s; view.y += dy / view.s; clamp(view); moved(160); },
    on: (type, fn) => { listeners[type].push(fn); },
    lastTap: () => lastTap
  };
}
