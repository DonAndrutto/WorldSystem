/* How a traveller looks, from where they stand.
 *
 * The travellers are painted (assets/rebirth/travelers.png, monastics.png),
 * every one of them with the same mild smile. Here that one face is given four
 * moods, by repainting the face itself from its own pixels — the brows, the
 * lids, the corners of the mouth, the cheeks pushed a little this way or that,
 * as a painter would retouch them — and by a light wash over the face and the
 * figure:
 *
 *   weary    the hells, the pretas, the animals and the troubled spirits:
 *            brows drawn up in the middle, heavy lids, the mouth turned down,
 *            shadow under the eyes, the colour gone grey and cold
 *   neutral  the human world and the worldly places: the smile let go
 *   joyful   the heavens: a broad smile, the cheeks raised, the eyes creased,
 *            a flush, the brows lifted, the colour warm
 *   serene   the stages of the path, the bhūmis, the sacred lands, the Buddha
 *            fields and Buddhahood: the eyes lowered in meditation, a quiet
 *            smile, a gold light on the face — and an aura about the figure,
 *            which the board and the world draw round it (game-players.js)
 *
 * Where each face's eyes and mouth are is measured once, by hand, from the
 * artwork (FACES). The warp and the moods are pure and tested; only the last
 * step, from a loaded image to a canvas, needs a page.
 */
import { realmOf } from './rebirth-board.js';

export const MOODS = ['weary', 'neutral', 'joyful', 'serene'];

const SUFFERING = new Set(['Hell states', 'Hungry ghosts', 'Animals', 'Underworld beings and spirits']);
const DIVINE = new Set(['Heavens of sense desire', 'Realm of Form', 'Formless Realm']);
const PATH = new Set(['path', 'bhumi', 'sacred', 'field', 'awakening']);

/** The mood of a traveller standing on a square (the square's record). */
export function moodOf(square) {
  if (!square) return 'neutral';
  if (PATH.has(realmOf(square).key)) return 'serene';
  if (DIVINE.has(square.cat)) return 'joyful';
  if (SUFFERING.has(square.cat)) return 'weary';
  return 'neutral';
}

/* The eyes (el, er: the traveller's right and left, as seen), the middle of
   the mouth (m) and its half-width (mw), in the pixels of a 256 × 512 cell —
   the travellers' own cell; the monastics' larger cells are scaled to it.
   In the order of PLAYER_SKINS (game-players.js). */
export const FACES = [
  { el: [150.2, 57.1], er: [170.7, 58.2], m: [159.5, 79.0], mw: 7.2 },   // Bhutanese man
  { el: [165.1, 52.1], er: [182.2, 52.4], m: [173.2, 74.1], mw: 8.8 },   // Tibetan man
  { el: [147.1, 51.6], er: [168.6, 51.6], m: [155.2, 70.8], mw: 7.7 },   // Indian man
  { el: [137.6, 59.2], er: [158.1, 59.5], m: [145.3, 79.9], mw: 6.2 },   // Chinese man
  { el: [134.4, 58.9], er: [150.6, 58.6], m: [138.8, 79.9], mw: 6.9 },   // Thai man
  { el: [118.6, 48.6], er: [137.6, 48.8], m: [122.2, 69.7], mw: 7.7 },   // Western man
  { el: [142.7, 56.9], er: [163.8, 56.0], m: [150.7, 75.1], mw: 6.9 },   // Bhutanese woman
  { el: [148.0, 49.9], er: [167.2, 49.9], m: [154.9, 69.2], mw: 7.7 },   // Tibetan woman
  { el: [144.1, 51.9], er: [162.5, 51.9], m: [148.7, 70.4], mw: 8.0 },   // Indian woman
  { el: [136.6, 54.8], er: [156.0, 54.8], m: [144.5, 73.0], mw: 6.2 },   // Chinese woman
  { el: [131.6, 56.8], er: [147.8, 56.8], m: [139.3, 75.2], mw: 8.5 },   // Thai woman
  { el: [113.2, 51.2], er: [131.1, 51.8], m: [120.2, 67.4], mw: 8.5 },   // Western woman
  { el: [153.8, 47.8], er: [168.5, 47.8], m: [156.9, 66.7], mw: 6.2 },   // monk
  { el: [109.8, 65.8], er: [127.5, 65.8], m: [117.5, 85.3], mw: 5.8 }    // nun
];

/* The moves of one mood on one face, in cell pixels: pins (a point, a reach
   and how far what is there is carried), and washes (an ellipse of colour laid
   over the face, soft at its edge). `tone` is laid over the whole figure. */
export function moodPlan(face, mood) {
  const { el, er, m, mw } = face;
  const d = Math.hypot(er[0] - el[0], er[1] - el[1]), u = d / 18;
  const across = [(er[0] - el[0]) / d, (er[1] - el[1]) / d];
  const at = (p, a, b) => [p[0] + across[0] * a - across[1] * b, p[1] + across[1] * a + across[0] * b];
  const pin = (c, r, dx, dy) => ({ c, r: r * u, d: [dx * u, dy * u] });
  const corners = [at(m, -mw, 0), at(m, mw, 0)];
  // the inner and outer ends of each brow, over the inner and outer corners of the eye
  const brow = (eye, inward) => ({ inner: at(eye, inward * 0.24 * d, -0.42 * d), outer: at(eye, -inward * 0.28 * d, -0.36 * d) });
  const bl = brow(el, 1), br = brow(er, -1);
  const lids = [el, er].map((e) => at(e, 0, -0.1 * d));
  const under = [el, er].map((e) => at(e, 0, 0.2 * d));
  const cheeks = [at(el, -0.05 * d, 0.55 * d), at(er, 0.05 * d, 0.55 * d)];
  const middle = at([(el[0] + er[0]) / 2, (el[1] + er[1]) / 2], 0, 0.55 * d);
  const plan = { pins: [], washes: [], tone: null };
  if (mood === 'weary') {
    plan.pins.push(
      ...corners.map((c, i) => pin(at(c, (i ? 0.6 : -0.6) * u, 0.3 * u), 5.2, (i ? -0.2 : 0.2), 1.9)),   // the corners of the mouth fall
      pin(bl.inner, 3.2, 0.15, -1.2), pin(br.inner, 3.2, -0.15, -1.2),  // the brows drawn up in the middle
      pin(bl.outer, 3.2, 0, 0.9), pin(br.outer, 3.2, 0, 0.9),
      ...lids.map((c) => pin(c, 3, 0, 1.15))                             // heavy lids
    );
    plan.washes.push(
      ...under.map((c) => ({ c, rx: 0.32 * d, ry: 0.13 * d, colour: [70, 52, 82], alpha: 0.24 })),
      { c: middle, rx: 1.15 * d, ry: 1.45 * d, colour: [150, 160, 172], alpha: 0.22 }
    );
    plan.tone = { saturate: 0.62, light: 0.9, tint: [120, 135, 160], tintAlpha: 0.1 };
  } else if (mood === 'neutral') {
    plan.pins.push(...corners.map((c, i) => pin(c, 3.6, (i ? -0.2 : 0.2), 0.9)));
  } else if (mood === 'joyful') {
    plan.pins.push(
      ...corners.map((c, i) => pin(c, 4.6, (i ? 0.8 : -0.8), -1.9)),    // a broad smile
      pin(m, 2.4, 0, 0.5),
      ...cheeks.map((c) => pin(c, 4.4, 0, -0.8)),                        // the cheeks lifted
      ...[el, er].map((e) => pin(at(e, 0, 0.16 * d), 2.4, 0, -0.6)),    // eyes creased from below
      pin(bl.inner, 3.4, 0, -0.8), pin(br.inner, 3.4, 0, -0.8),          // brows raised
      pin(bl.outer, 3.4, 0, -0.9), pin(br.outer, 3.4, 0, -0.9)
    );
    plan.washes.push(...cheeks.map((c) => ({ c, rx: 0.34 * d, ry: 0.24 * d, colour: [236, 120, 120], alpha: 0.3 })));
    plan.tone = { saturate: 1.18, light: 1.06, tint: [255, 214, 150], tintAlpha: 0.06 };
  } else if (mood === 'serene') {
    plan.pins.push(
      ...lids.map((c) => pin(c, 3.2, 0, 1.7)),                           // the eyes lowered
      ...[el, er].map((e) => pin(at(e, 0, 0.17 * d), 2.4, 0, -0.5)),
      ...corners.map((c, i) => pin(c, 3.6, (i ? 0.2 : -0.2), -0.4)),    // a quiet smile
      pin(bl.inner, 3.4, 0, -0.4), pin(br.inner, 3.4, 0, -0.4)          // the brow untroubled
    );
    plan.washes.push({ c: middle, rx: 1.2 * d, ry: 1.5 * d, colour: [255, 222, 140], alpha: 0.2 });
    plan.tone = { saturate: 1.05, light: 1.05, tint: [255, 226, 160], tintAlpha: 0.08 };
  }
  return plan;
}

/* The part of the cell a face's moves can reach: the moves touch nothing
   outside it. */
export function faceBox(face) {
  const { el, er, m } = face;
  const d = Math.hypot(er[0] - el[0], er[1] - el[1]);
  return { x0: Math.min(el[0], m[0]) - 1.0 * d, x1: Math.max(er[0], m[0]) + 1.0 * d, y0: el[1] - 1.0 * d, y1: m[1] + 1.0 * d };
}

/**
 * Repaint one face, in place, in RGBA pixels (an ImageData's `data`, `width`,
 * `height`). `ox`, `oy` is where the cell starts and `k` its scale against a
 * 256 × 512 cell.
 */
export function paintMood(img, { face, mood, ox = 0, oy = 0, k = 1, cell = [256, 512] }) {
  const plan = moodPlan(face, mood);
  const { data, width, height } = img;
  const box = faceBox(face);
  const X0 = Math.max(0, Math.floor(ox + box.x0 * k)), X1 = Math.min(width - 1, Math.ceil(ox + box.x1 * k));
  const Y0 = Math.max(0, Math.floor(oy + box.y0 * k)), Y1 = Math.min(height - 1, Math.ceil(oy + box.y1 * k));
  if (plan.pins.length) {
    const src = new Uint8ClampedArray(data);
    const sample = (x, y, out) => {
      x = Math.max(0, Math.min(width - 1.001, x)); y = Math.max(0, Math.min(height - 1.001, y));
      const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
      for (let c = 0; c < 4; c += 1) {
        const i = (yi * width + xi) * 4 + c;
        const top = src[i] * (1 - fx) + src[i + 4] * fx;
        const bottom = src[i + width * 4] * (1 - fx) + src[i + width * 4 + 4] * fx;
        out[c] = top * (1 - fy) + bottom * fy;
      }
    };
    const pins = plan.pins.map((p) => ({ x: ox + p.c[0] * k, y: oy + p.c[1] * k, r: p.r * k, dx: p.d[0] * k, dy: p.d[1] * k }));
    const out = [0, 0, 0, 0];
    for (let y = Y0; y <= Y1; y += 1) for (let x = X0; x <= X1; x += 1) {
      // each pin carries what is near it along; what is here came from behind
      let sx = 0, sy = 0;
      for (const p of pins) {
        const q = ((x - p.x) ** 2 + (y - p.y) ** 2) / (p.r * p.r);
        if (q >= 1) continue;
        const w = (1 - q) * (1 - q);
        sx += w * p.dx; sy += w * p.dy;
      }
      if (!sx && !sy) continue;
      sample(x - sx, y - sy, out);
      const i = (y * width + x) * 4;
      data[i] = out[0]; data[i + 1] = out[1]; data[i + 2] = out[2]; data[i + 3] = out[3];
    }
  }
  for (const wash of plan.washes) {
    const cx = ox + wash.c[0] * k, cy = oy + wash.c[1] * k, rx = wash.rx * k, ry = wash.ry * k;
    for (let y = Math.max(0, Math.floor(cy - ry)); y <= Math.min(height - 1, Math.ceil(cy + ry)); y += 1) {
      for (let x = Math.max(0, Math.floor(cx - rx)); x <= Math.min(width - 1, Math.ceil(cx + rx)); x += 1) {
        const q = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        if (q >= 1) continue;
        const i = (y * width + x) * 4;
        const a = wash.alpha * (1 - q) * (1 - q) * (data[i + 3] / 255);
        for (let c = 0; c < 3; c += 1) data[i + c] += (wash.colour[c] - data[i + c]) * a;
      }
    }
  }
  if (plan.tone) {
    const t = plan.tone;
    const x0 = Math.max(0, Math.floor(ox)), x1 = Math.min(width, Math.ceil(ox + cell[0] * k));
    const y0 = Math.max(0, Math.floor(oy)), y1 = Math.min(height, Math.ceil(oy + cell[1] * k));
    for (let y = y0; y < y1; y += 1) for (let x = x0; x < x1; x += 1) {
      const i = (y * width + x) * 4;
      if (!data[i + 3]) continue;
      const grey = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      for (let c = 0; c < 3; c += 1) {
        const v = (grey + (data[i + c] - grey) * t.saturate) * t.light;
        data[i + c] = v + (t.tint[c] - v) * t.tintAlpha;
      }
    }
  }
  return img;
}

/* ── in the page ───────────────────────────────────────────────────────── */

const SIZE = [256, 512];

/**
 * The faces, by skin and mood, each one cell on a canvas of its own, made the
 * first time it is asked for. `atlas(n)` says where skin n's cell is
 * (game-players.js, skinAtlas); `adopt` hands over an atlas image once it has
 * loaded. Until then, or where a canvas cannot be had, a face is null and the
 * plain atlas stands in.
 */
export function createMoodFaces(atlas) {
  const canvases = new Map(), urls = new Map(), loaded = new Map();
  const key = (n, mood) => n + ':' + mood;
  /** Skin n in this mood, as a canvas. */
  function canvas(n, mood) {
    const k = key(n, mood);
    if (canvases.has(k)) return canvases.get(k);
    const { url, columns, rows, cell } = atlas(n);
    const img = loaded.get(url);
    if (!img) return null;
    const c = document.createElement('canvas');
    c.width = SIZE[0]; c.height = SIZE[1];
    let g = null;
    try { g = c.getContext('2d', { willReadFrequently: true }); } catch {}
    if (!g) return null;
    const w = img.naturalWidth / columns, h = img.naturalHeight / rows;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, (cell % columns) * w, Math.floor(cell / columns) * h, w, h, 0, 0, SIZE[0], SIZE[1]);
    if (mood !== 'original') {
      const pixels = g.getImageData(0, 0, SIZE[0], SIZE[1]);
      paintMood(pixels, { face: FACES[n], mood });
      g.putImageData(pixels, 0, 0);
    }
    canvases.set(k, c);
    return c;
  }
  /** The same, as a URL for a style. */
  function url(n, mood) {
    const k = key(n, mood);
    if (urls.has(k)) return urls.get(k);
    const c = canvas(n, mood);
    if (!c) return null;
    urls.set(k, c.toDataURL('image/png'));
    return urls.get(k);
  }
  function adopt(url, image) {
    if (image && image.naturalWidth) loaded.set(url, image);
  }
  return { canvas, url, adopt, ready: (url) => loaded.has(url) };
}
