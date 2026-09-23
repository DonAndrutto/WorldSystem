/* The wheel of life, as the relief itself.

   The picture is the painted relief of the author's photographs, not a drawing
   after it: scripts/build-wheel-relief.py corrects the photograph's
   perspective, lays the close-ups over it where they have more to give, and
   cuts the relief into the layers it is built in. This module sets those
   layers back up, one SVG each, back to front:

     wall     the blue ground: the wall beside the relief, filled in under it
              and carried on past the photograph's edges in the fall of its light
     beyond   what is painted on the wall outside Yama's reach
     body     Yama behind the wheel: arms, knees, scarves, bone ornaments,
              tiger skin, and the offering bowl beneath him
     wheel    the wheel itself, with the close-ups over the parts they show
     frame    its gold: the rims, the spokes, the dividers of the rim
     front    what Yama holds it with: his head and fangs, his hands, his feet
     shade    not the relief: the veil that dims everything but a picked part

   Over each layer's pictures lie the outlines of the parts it holds
   (wheel-parts.js): transparent until the pointer is on one or it is picked,
   each carrying `data-wl` with its entry's id. The drawing's units are the
   whole photograph's pixels, 1320 by 1740. */

import { RELIEF } from './wheel-relief.js';
import { PARTS, R, C, REALMS, NIDANAS, nidanaSpan, HOT_HELLS, COLD_HELLS } from './wheel-parts.js';

export { R, C, REALMS, NIDANAS, nidanaSpan, HOT_HELLS, COLD_HELLS };
export const ART_W = 1320, ART_H = 1740;
const D = Math.PI / 180;
const n1 = (v) => Math.round(v * 10) / 10;
const pol = (r, a) => [C.x + r * Math.cos(a * D), C.y + r * Math.sin(a * D)];

/* ── shapes ──────────────────────────────────────────────────────────── */
function sector(r0, r1, a0, a1) {
  const big = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = pol(r1, a0), [x1, y1] = pol(r1, a1), [x2, y2] = pol(r0, a1), [x3, y3] = pol(r0, a0);
  return `M${n1(x0)} ${n1(y0)}A${n1(r1)} ${n1(r1)} 0 ${big} 1 ${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}A${n1(r0)} ${n1(r0)} 0 ${big} 0 ${n1(x3)} ${n1(y3)}Z`;
}
const circle = (x, y, r) => `M${n1(x - r)} ${n1(y)}a${n1(r)} ${n1(r)} 0 1 0 ${n1(2 * r)} 0a${n1(r)} ${n1(r)} 0 1 0 ${n1(-2 * r)} 0Z`;
const ellipse = (x, y, rx, ry) => `M${n1(x - rx)} ${n1(y)}a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(2 * rx)} 0a${n1(rx)} ${n1(ry)} 0 1 0 ${n1(-2 * rx)} 0Z`;
const poly = (pts) => 'M' + pts.map(([x, y]) => n1(x) + ' ' + n1(y)).join('L') + 'Z';

/* One row of a region: the region cut by two lines parallel to `angle`,
   counted from the side the spoke through the wheel's centre is on. */
export function strip(region, n, k, angle) {
  const pts = RELIEF[region];
  const nx = -Math.sin(angle * D), ny = Math.cos(angle * D);
  const t = (p) => p[0] * nx + p[1] * ny;
  const ts = pts.map(t), lo = Math.min(...ts), hi = Math.max(...ts), axis = C.x * nx + C.y * ny;
  const fromLo = Math.abs(lo - axis) < Math.abs(hi - axis);
  const step = (hi - lo) / n;
  const a = fromLo ? lo + step * k : hi - step * (k + 1), b = a + step;
  return clip(clip(pts, (p) => t(p) - a), (p) => b - t(p));
}
/* Sutherland–Hodgman against one half-plane: keeps where f ≥ 0 */
function clip(pts, f) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length], fp = f(p), fq = f(q);
    if (fp >= 0) out.push(p);
    if ((fp >= 0) !== (fq >= 0)) {
      const s = fp / (fp - fq);
      out.push([p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s]);
    }
  }
  return out;
}
/* A shape as a path, and the points that bound it. */
function shapePath(s) {
  const [kind] = s;
  if (kind === 'sector') {
    const [, r0, r1, a0, a1] = s;
    const pts = [];
    for (let a = a0; a <= a1 + 1e-6; a += (a1 - a0) / 16) pts.push(pol(r0, a), pol(r1, a));
    return { d: sector(r0, r1, a0, a1), pts };
  }
  if (kind === 'ring') {
    const [, r0, r1] = s;
    return { d: circle(C.x, C.y, r1) + circle(C.x, C.y, r0), pts: [[C.x - r1, C.y - r1], [C.x + r1, C.y + r1]] };
  }
  if (kind === 'disc') return { d: circle(C.x, C.y, s[1]), pts: [[C.x - s[1], C.y - s[1]], [C.x + s[1], C.y + s[1]]] };
  if (kind === 'ellipse') {
    const [, x, y, rx, ry] = s;
    return { d: ellipse(x, y, rx, ry), pts: [[x - rx, y - ry], [x + rx, y + ry]] };
  }
  if (kind === 'poly') return { d: poly(s[1]), pts: s[1] };
  if (kind === 'relief') {
    const all = RELIEF.yama[s[1]];
    const list = s.length > 2 ? [all[s[2]]] : all;
    return { d: list.map(poly).join(''), pts: list.flat() };
  }
  if (kind === 'strip') {
    const pts = strip(s[1], s[2], s[3], s[4]);
    return { d: poly(pts), pts };
  }
  throw new Error('unknown shape ' + kind);
}
function boxOf(pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return [n1(x), n1(y), n1(Math.max(...xs) - x), n1(Math.max(...ys) - y)];
}

/* ── the layers ──────────────────────────────────────────────────────── */
const LAYERS = [
  ...RELIEF.layers.map((l) => ({ name: l.name, depth: l.depth, images: l.images })),
  { name: 'shade', depth: RELIEF.layers.at(-1).depth + 2 }
];
const image = (im) => `<image href="${im.href}" x="${im.x}" y="${im.y}" width="${im.w}" height="${im.h}" preserveAspectRatio="none"/>`;

/* The wall runs on past the photograph in every direction. Its picture is the
   blue beside the relief, filled in under it and carried out past the
   photograph's edges until it settles to the fall of the light: one colour for
   each height, dark at the head of the wall where the light does not reach.
   Past the picture that fall runs on as a gradient, as far as the view can
   ever show, so that no edge of the wall is seen at any zoom or turn. The
   rectangle is only as large as the view's window lets it be drawn. */
const FALL = RELIEF.fall;
function wall() {
  const y0 = FALL[0][0], y1 = FALL.at(-1)[0];
  const stops = FALL.map(([y, c]) => `<stop offset="${((y - y0) / (y1 - y0)).toFixed(4)}" stop-color="${c}"/>`).join('');
  return `<defs><linearGradient id="wl-fall" gradientUnits="userSpaceOnUse" x1="0" y1="${y0}" x2="0" y2="${y1}">${stops}</linearGradient></defs>`
    + `<rect class="wl-ground" x="-9000" y="-9000" width="${ART_W + 18000}" height="${ART_H + 18000}" fill="url(#wl-fall)"/>`;
}
/* The colour of the wall at a height, past its picture: what the view shows
   behind the layers, where a gesture has carried them past what is drawn. */
export function wallAt(y) {
  let i = 1;
  while (i < FALL.length - 1 && FALL[i][0] < y) i++;
  const [ya, ca] = FALL[i - 1], [yb, cb] = FALL[i];
  const t = Math.min(1, Math.max(0, (y - ya) / ((yb - ya) || 1)));
  const rgb = (c) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const a = rgb(ca), b = rgb(cb);
  return 'rgb(' + a.map((v, k) => Math.round(v + (b[k] - v) * t)).join(', ') + ')';
}
const defs = () => '';

/* The whole relief, as the layers the view stacks. Each layer's `depth` is in
   drawing units, and says how far that layer stands off the wall; `shapes`
   holds each part's outline, for the veil the view draws round a picked part,
   `where` the layer each part stands in, and `ground` the wall's colour at a
   height, for what is behind the layers. */
export function drawWheel() {
  const boxes = new Map(), shapes = new Map(), where = new Map();
  const partsIn = new Map(LAYERS.map((l) => [l.name, '']));
  for (const p of PARTS) {
    const made = p.shapes.map(shapePath);
    const d = made.map((m) => m.d).join('');
    boxes.set(p.id, boxOf(made.flatMap((m) => m.pts)));
    shapes.set(p.id, d);
    where.set(p.id, p.layer);
    partsIn.set(p.layer, partsIn.get(p.layer) + `<path class="wl-part" data-wl="${p.id}" d="${d}" fill-rule="evenodd"/>`);
  }
  const layers = LAYERS.map((l) => {
    // the wall's photograph lies on the wall's own colour, which runs on past it
    let svg = l.name === 'wall' ? wall() : l.name === 'shade' ? '<path class="wl-veil" d="" fill-rule="evenodd"/>' : '';
    if (l.images) svg += l.images.map(image).join('');
    const parts = partsIn.get(l.name);
    if (parts) svg += `<g class="wl-parts">${parts}</g>`;
    return { name: l.name, depth: l.depth, svg };
  });
  return { width: ART_W, height: ART_H, defs: defs(), layers, boxes, shapes, where, ground: wallAt };
}
