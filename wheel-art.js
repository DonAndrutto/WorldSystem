/* The wheel of life, drawn.

   A painted relief of the bhavacakra, set down in SVG after the photographs the
   author supplied: the wheel on a blue wall, gripped by Yama, with the six
   destinies, the paths of karma, the three animals at the hub and the twelve
   links on the rim. The drawing is in the photograph's own frame — 1320 by 1740
   units — so that a place read off the photograph is a place in the drawing.
   The photograph was taken from below, which draws the upper half of the wheel
   in and lets the lower half swell; the wheel here is round, and `P` takes a
   point off the photograph and puts it where it stands on the round wheel.

   The relief is built as layers, back to front, so that the view can set each
   at its own depth and a small turn of the wall shows the wheel standing off it:

     wall     the blue ground, and nothing else
     beyond   what stands on the wall outside Yama's reach: the figures in the
              upper corners, the clouds, the moon and sun
     body     Yama behind the wheel: arms, knees, scarves, tiger skin, ornaments,
              and the offering bowl beneath him
     face     the wheel's own ground: every realm's sky, earth and water, the two
              halves of the karma ring, the hub, the panels of the rim
     relief   everything standing on that ground: figures, animals, buildings,
              trees, flames
     frame    the gold — rims, spokes, the dividers of the twelve panels
     front    what Yama holds the wheel with: his head and fangs, hands and feet

   Every thing that has an entry is a group carrying `data-wl` with that entry's
   id. A part may be drawn in more than one layer — a realm has its ground in
   `face` and its people in `relief` — and the view treats every group with the
   same id as the one part. Each part's bounding box is recorded as it is drawn,
   so a part can be framed without asking the browser to measure anything. */

export const ART_W = 1320, ART_H = 1740;
export const C = { x: 660, y: 866 };
/* hub, its rim, the karma ring and its rim, the realms, the band of the
   twelve links, and the outer rim */
export const R = { hub: 56, hubRim: 63, karma: 116, karmaRim: 124, realm: 428, band0: 437, band1: 497, rim: 513 };
/* the six spokes, measured from the hub on the photograph, degrees clockwise
   from the right-hand horizontal. The hells are given the widest share, as the
   relief gives them: the hot and the cold both, with the judge between. */
export const REALMS = [
  { id: 'wl_realm_gods', a0: -118, a1: -60 },
  { id: 'wl_realm_humans', a0: -60, a1: -6 },
  { id: 'wl_realm_pretas', a0: -6, a1: 45 },
  { id: 'wl_realm_hells', a0: 45, a1: 141 },
  { id: 'wl_realm_animals', a0: 141, a1: 187 },
  { id: 'wl_realm_asuras', a0: 187, a1: 242 }
];
/* The twelve links, clockwise from the blind man just right of the fangs. */
export const NIDANAS = [
  'wl_nidana_ignorance', 'wl_nidana_formations', 'wl_nidana_consciousness',
  'wl_nidana_namerupa', 'wl_nidana_senses', 'wl_nidana_contact',
  'wl_nidana_feeling', 'wl_nidana_craving', 'wl_nidana_grasping',
  'wl_nidana_becoming', 'wl_nidana_birth', 'wl_nidana_death'
];
export const nidanaSpan = (i) => [-90 + 30 * i, -60 + 30 * i];

/* ── numbers ─────────────────────────────────────────────────────────── */
const D = Math.PI / 180;
const n1 = (v) => Math.round(v * 10) / 10;
const pol = (r, a) => [C.x + r * Math.cos(a * D), C.y + r * Math.sin(a * D)];
/* a point read off the photograph, put where it stands on the round wheel */
export function P(px, py) {
  const dy = py - 822;
  return [n1(660 + (px - 658)), n1(C.y + dy * (dy < 0 ? 1.1 : 0.925))];
}
/* an annular sector, clockwise from a0 to a1 */
function sector(r0, r1, a0, a1) {
  const [x0, y0] = pol(r1, a0), [x1, y1] = pol(r1, a1);
  const [x2, y2] = pol(r0, a1), [x3, y3] = pol(r0, a0);
  const big = a1 - a0 > 180 ? 1 : 0;
  if (r0 <= 0) return `M${n1(C.x)} ${n1(C.y)}L${n1(x0)} ${n1(y0)}A${r1} ${r1} 0 ${big} 1 ${n1(x1)} ${n1(y1)}Z`;
  return `M${n1(x0)} ${n1(y0)}A${r1} ${r1} 0 ${big} 1 ${n1(x1)} ${n1(y1)}L${n1(x2)} ${n1(y2)}A${r0} ${r0} 0 ${big} 0 ${n1(x3)} ${n1(y3)}Z`;
}
const ring = (r0, r1) => `M${C.x - r1} ${C.y}a${r1} ${r1} 0 1 0 ${2 * r1} 0a${r1} ${r1} 0 1 0 ${-2 * r1} 0Z`
  + `M${C.x - r0} ${C.y}a${r0} ${r0} 0 1 1 ${2 * r0} 0a${r0} ${r0} 0 1 1 ${-2 * r0} 0Z`;
function sectorBox(r0, r1, a0, a1) {
  const pts = [];
  for (let a = a0; a <= a1 + 0.01; a += (a1 - a0) / 12) pts.push(pol(r0, a), pol(r1, a));
  return boxOf(pts);
}
function boxOf(pts) {
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return [n1(x), n1(y), n1(Math.max(...xs) - x), n1(Math.max(...ys) - y)];
}
/* a small deterministic scatter, so the drawing is the same every time */
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/* ── the palette, taken off the photograph ───────────────────────────── */
const K = {
  wall: '#3b74b6', wallLo: '#2c5f9e', wallHi: '#4a85c4',
  gold: '#e8b62c', goldHi: '#f9de78', goldLo: '#b27d16', goldInk: '#7a5510',
  ink: '#2a1a12',
  yama: '#7e2c35', yamaHi: '#a8474f', yamaLo: '#531722',
  hand: '#9d4658', handHi: '#c36f80', handLo: '#6f2a3a',
  foot: '#e59bb0', footHi: '#f6c3d1', footLo: '#bd6e89',
  jade: '#72c9ab', jadeHi: '#a4e0cb', jadeLo: '#3f9d80',
  green: '#2f7b55', greenHi: '#56a579', greenLo: '#1d553a',
  tiger: '#e48a40', tigerLo: '#b95a22', stripe: '#1c1410',
  bone: '#f6f3ea', boneLo: '#c7bfad',
  skin: '#f1c9a6', skin2: '#e3aa86', skinDk: '#b77550', skinPale: '#f6d9c6',
  sky: '#e1eef3', skyLo: '#bcd9e9', cloud: '#f7f3ec', cloudLo: '#a8b5ca', cloudPink: '#e7c3cb', cloudBlue: '#9dbbe0',
  hill: '#80ceb1', hillLo: '#55af8e', hillHi: '#abe2cb', grass: '#3c8d6a',
  water: '#4b8fd8', waterLo: '#2f6fbf', waterHi: '#a1cdf2', foam: '#f3f8fc',
  red: '#b9352b', maroon: '#7b2723', orange: '#e58b30', saffron: '#e9a53c', ochre: '#c98a2c',
  blue: '#3a5fae', navy: '#27366b', olive: '#8c8a3c', pink: '#eaa2ab', rose: '#d9747f',
  white: '#f6f4ef', black: '#1f1a1a', grey: '#8f959c', greyLo: '#666b72', brown: '#7d5236', brownLo: '#5a3a24',
  hellGround: '#6d3025', hellLo: '#4e1f18', hellHot: '#c83b28', hellHi: '#ef6c3b',
  flame: '#e5482a', flameHi: '#f8b63d',
  ice: '#f1f6f9', iceLo: '#b7cde1', iceBlue: '#8fb2d8',
  karmaW: '#f4f1ea', karmaB: '#1c1719', hub: '#26487f', hubLo: '#1a3464',
  band: '#4a2a22', bandLo: '#2f170f', panelSky: '#cfe4ee'
};
const OUT = 'stroke="#2a1a12" stroke-opacity=".42" stroke-linejoin="round"';

/* ── parts ─────────────────────────────────────────────────────────────
   Every part is wrapped once per layer it is drawn in, and its box grows to
   hold everything drawn under its name. */
let BOXES = new Map();
function note(id, box) {
  if (!box) return;
  const was = BOXES.get(id);
  if (!was) { BOXES.set(id, box.slice()); return; }
  const x = Math.min(was[0], box[0]), y = Math.min(was[1], box[1]);
  const r = Math.max(was[0] + was[2], box[0] + box[2]), b = Math.max(was[1] + was[3], box[1] + box[3]);
  BOXES.set(id, [n1(x), n1(y), n1(r - x), n1(b - y)]);
}
function part(id, inner, box, extra = '') {
  note(id, box);
  return `<g data-wl="${id}"${extra}>${inner}</g>`;
}
const around = (x, y, w, h) => [n1(x - w / 2), n1(y - h / 2), w, h];

/* ── primitives ──────────────────────────────────────────────────────── */
const circ = (x, y, r, fill, more = '') => `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(r)}" fill="${fill}" ${more}/>`;
const ell = (x, y, rx, ry, fill, more = '') => `<ellipse cx="${n1(x)}" cy="${n1(y)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${fill}" ${more}/>`;
const path = (d, fill, more = '') => `<path d="${d}" fill="${fill}" ${more}/>`;
const line = (pts, stroke, w, more = '') =>
  `<polyline points="${pts.map((p) => n1(p[0]) + ',' + n1(p[1])).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${more}/>`;
/* a limb: a dark stroke under a coloured one, so that it reads in relief */
const limb = (pts, color, w) => line(pts, K.ink, w + 2.2, 'stroke-opacity=".38"') + line(pts, color, w);
const tr = (x, y, s = 1, rot = 0, flip = 1) =>
  `translate(${n1(x)} ${n1(y)})${rot ? ` rotate(${n1(rot)})` : ''} scale(${n1(flip * s * 1000) / 1000} ${n1(s * 1000) / 1000})`;
const smooth = (pts) => {
  /* Catmull-Rom through the points, closed */
  const n = pts.length;
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${n1(p1[0] + (p2[0] - p0[0]) / 6)} ${n1(p1[1] + (p2[1] - p0[1]) / 6)} ${n1(p2[0] - (p3[0] - p1[0]) / 6)} ${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d + 'Z';
};
const open = (pts) => {
  let d = `M${n1(pts[0][0])} ${n1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${n1(p1[0] + (p2[0] - p0[0]) / 6)} ${n1(p1[1] + (p2[1] - p0[1]) / 6)} ${n1(p2[0] - (p3[0] - p1[0]) / 6)} ${n1(p2[1] - (p3[1] - p1[1]) / 6)} ${n1(p2[0])} ${n1(p2[1])}`;
  }
  return d;
};

/* ── people ──────────────────────────────────────────────────────────────
   One figure, a hundred units tall with its feet at the origin and facing
   right, bent into a pose and scaled into place. They are the figures of a
   clay relief: a round head, a robe or a bare body, limbs of an even thickness. */
const POSE = {
  stand: { head: [0, -88], neck: [0, -77], hip: [0, -44], hem: -15,
    legs: [[[-3, -22], [-4, 0]], [[3, -22], [4, 0]]], arms: [[[-10, -58], [-11, -41]], [[10, -58], [11, -41]]] },
  walk: { head: [2, -88], neck: [1, -77], hip: [0, -44], hem: -16,
    legs: [[[-6, -22], [-13, 0]], [[7, -23], [12, 0]]], arms: [[[-8, -59], [-13, -45]], [[9, -59], [15, -47]]] },
  point: { head: [2, -88], neck: [1, -77], hip: [0, -44], hem: -15,
    legs: [[[-4, -22], [-9, 0]], [[5, -22], [8, 0]]], arms: [[[-8, -59], [-11, -43]], [[13, -70], [27, -76]]] },
  pray: { head: [0, -88], neck: [0, -77], hip: [0, -44], hem: -15,
    legs: [[[-3, -22], [-4, 0]], [[3, -22], [4, 0]]], arms: [[[-9, -60], [1, -67]], [[9, -60], [3, -67]]] },
  offer: { head: [1, -88], neck: [0, -77], hip: [0, -44], hem: -15,
    legs: [[[-3, -22], [-4, 0]], [[4, -22], [5, 0]]], arms: [[[6, -60], [16, -62]], [[10, -58], [18, -58]]] },
  up: { head: [0, -88], neck: [0, -77], hip: [0, -44], hem: -15,
    legs: [[[-5, -22], [-8, 0]], [[5, -22], [8, 0]]], arms: [[[-13, -86], [-15, -104]], [[13, -86], [15, -104]]] },
  strike: { head: [2, -88], neck: [1, -77], hip: [0, -44], hem: -15,
    legs: [[[-6, -22], [-12, 0]], [[7, -22], [11, 0]]], arms: [[[-4, -90], [6, -104]], [[13, -64], [22, -58]]] },
  sit: { head: [0, -64], neck: [0, -53], hip: [0, -16], hem: -6, seated: true,
    legs: [], arms: [[[-12, -33], [-3, -22]], [[12, -33], [3, -22]]] },
  teach: { head: [0, -64], neck: [0, -53], hip: [0, -16], hem: -6, seated: true,
    legs: [], arms: [[[-12, -33], [-3, -22]], [[13, -36], [11, -48]]] },
  kneel: { head: [4, -68], neck: [3, -57], hip: [-4, -26], hem: -4, kneel: true,
    legs: [[[10, -6], [-12, -2]]], arms: [[[-4, -40], [10, -50]], [[5, -41], [12, -50]]] },
  crouch: { head: [8, -40], neck: [4, -34], hip: [-7, -12], hem: -2, bare: true,
    legs: [[[10, -24], [6, 0]]], arms: [[[12, -18], [10, -26]]] },
  squat: { head: [0, -62], neck: [0, -51], hip: [0, -20], hem: -8,
    legs: [[[-15, -24], [-11, 0]], [[15, -24], [11, 0]]], arms: [[[-14, -38], [-15, -26]], [[14, -38], [15, -26]]] },
  carry: { head: [14, -76], neck: [9, -67], hip: [-2, -42], hem: -14,
    legs: [[[-7, -21], [-13, 0]], [[8, -22], [11, 0]]], arms: [[[4, -50], [-6, -60]], [[12, -52], [4, -62]]] },
  bent: { head: [13, -74], neck: [8, -65], hip: [-2, -42], hem: -14,
    legs: [[[-5, -21], [-8, 0]], [[6, -22], [8, 0]]], arms: [[[10, -50], [22, -36]], [[4, -52], [6, -40]]] },
  reach: { head: [2, -88], neck: [1, -77], hip: [0, -44], hem: -15,
    legs: [[[-4, -22], [-6, 0]], [[4, -22], [5, 0]]], arms: [[[-9, -86], [-6, -106]], [[10, -88], [14, -108]]] },
  bound: { head: [0, -86], neck: [0, -75], hip: [0, -44], hem: -40, bare: true,
    legs: [[[-2, -22], [-3, 0]], [[2, -22], [3, 0]]], arms: [[[-8, -60], [-5, -48]], [[8, -60], [5, -48]]] }
};
function person(o) {
  const {
    x, y, h = 28, dir = 1, rot = 0, pose = 'stand', skin = K.skin, robe = K.maroon, sleeve,
    sash, hair = '#2b2321', hairStyle = 'short', hat, naked = false, preta = false,
    loin, legs: legColor, halo, prop, belly = 0
  } = o;
  const p = POSE[pose] || POSE.stand;
  const bare = naked || preta || p.bare;
  const lw = preta ? 3.4 : 6.4;
  const legC = legColor || (bare ? skin : '#3a2a22');
  const sl = sleeve || (bare ? skin : robe);
  const [hx, hy] = p.head, [nx, ny] = p.neck, [px, py] = p.hip;
  let s = '';
  if (halo) s += circ(hx, hy, 17, halo, 'opacity=".95"');
  // legs, behind the body
  if (p.seated) {
    s += path(`M${px - 22} ${py + 6}Q${px - 24} ${py - 8} ${px - 8} ${py - 8}L${px + 8} ${py - 8}Q${px + 24} ${py - 8} ${px + 22} ${py + 6}Q${px} ${py + 14} ${px - 22} ${py + 6}Z`,
      bare ? skin : robe, OUT + ' stroke-width="1.6"');
  } else {
    p.legs.forEach(([k, f]) => {
      const pts = p.kneel ? [[px, py], k, f] : [[px + (k[0] > px ? 3 : -3), py], k, f];
      s += limb(pts, legC, lw);
      if (!p.kneel && pose !== 'crouch') s += ell(f[0] + 2.5, f[1] - 1.2, 4.6, 2.4, bare ? skin : '#2a201c');
    });
  }
  // the body
  if (bare) {
    const w = preta ? 7 : 9;
    s += path(`M${nx - w} ${ny + 3}Q${nx} ${ny - 1} ${nx + w} ${ny + 3}L${px + w - 1} ${py}Q${px} ${py + 5} ${px - w + 1} ${py}Z`, skin, OUT + ' stroke-width="1.6"');
    if (preta || belly) s += circ(px + 5, py - 9, preta ? 15 : belly, skin, OUT + ' stroke-width="1.6"');
    if (loin) s += path(`M${px - 9} ${py - 3}L${px + 9} ${py - 3}L${px + 7} ${py + 9}L${px - 7} ${py + 9}Z`, loin, OUT + ' stroke-width="1.4"');
  } else if (!p.seated) {
    const flare = pose === 'walk' || pose === 'strike' || pose === 'carry' ? 16 : 13;
    s += path(`M${nx - 9} ${ny + 2}Q${nx} ${ny - 2} ${nx + 9} ${ny + 2}L${px + flare} ${p.hem}Q${px} ${p.hem + 4} ${px - flare} ${p.hem}Z`, robe, OUT + ' stroke-width="1.6"');
  } else {
    s += path(`M${nx - 10} ${ny + 2}Q${nx} ${ny - 2} ${nx + 10} ${ny + 2}L${px + 15} ${py - 2}Q${px} ${py + 4} ${px - 15} ${py - 2}Z`, robe, OUT + ' stroke-width="1.6"');
  }
  if (sash && !bare) s += path(`M${nx - 8} ${ny + 3}L${nx - 3} ${ny + 1}L${px + 11} ${py - 6}L${px + 6} ${py - 1}Z`, sash, 'opacity=".95"');
  // arms, and a hand at the end of each
  p.arms.forEach(([e, hd]) => {
    const sh = [nx + (e[0] >= nx ? 7 : -7), ny + 4];
    s += limb([sh, e, hd], sl, preta ? 3.2 : 5.6);
    s += circ(hd[0], hd[1], preta ? 2.4 : 3.3, skin, OUT + ' stroke-width="1.2"');
  });
  if (prop) s += prop;
  // the head
  s += circ(hx, hy, preta ? 8.5 : 9.6, skin, OUT + ' stroke-width="1.6"');
  // two dark points for eyes, looking the way the figure faces
  s += circ(hx + 3.6, hy - 0.5, 1.2, '#2a1a12') + circ(hx - 1.4, hy - 0.5, 1.2, '#2a1a12', 'opacity=".8"');
  if (hairStyle === 'long') s += path(`M${hx - 9.8} ${hy + 1}Q${hx - 9} ${hy - 11} ${hx + 1} ${hy - 10.5}Q${hx + 9} ${hy - 9} ${hx + 9.4} ${hy - 3}L${hx - 2} ${hy - 4}L${hx - 7} ${hy + 22}L${hx - 12} ${hy + 20}Z`, hair);
  else if (hairStyle === 'short') s += path(`M${hx - 9.8} ${hy + 1}Q${hx - 9} ${hy - 11} ${hx + 1} ${hy - 10.5}Q${hx + 9} ${hy - 9} ${hx + 9.4} ${hy - 3}Q${hx + 1} ${hy - 6} ${hx - 5} ${hy + 3}Z`, hair);
  else if (hairStyle === 'spiky') s += path(`M${hx - 9} ${hy - 2}L${hx - 12} ${hy - 12}L${hx - 6} ${hy - 9}L${hx - 6} ${hy - 20}L${hx - 1} ${hy - 11}L${hx + 2} ${hy - 23}L${hx + 4} ${hy - 11}L${hx + 10} ${hy - 18}L${hx + 8} ${hy - 6}L${hx + 13} ${hy - 8}L${hx + 9} ${hy - 1}Q${hx} ${hy - 7} ${hx - 9} ${hy - 2}Z`, hair, OUT + ' stroke-width="1"');
  else if (hairStyle === 'wild') s += path(`M${hx - 10} ${hy + 2}Q${hx - 18} ${hy - 6} ${hx - 10} ${hy - 12}Q${hx - 6} ${hy - 20} ${hx + 3} ${hy - 14}Q${hx + 14} ${hy - 16} ${hx + 11} ${hy - 3}Q${hx + 2} ${hy - 8} ${hx - 10} ${hy + 2}Z`, hair);
  else if (hairStyle === 'bun') s += path(`M${hx - 9.8} ${hy + 1}Q${hx - 9} ${hy - 11} ${hx + 1} ${hy - 10.5}Q${hx + 9} ${hy - 9} ${hx + 9.4} ${hy - 3}Q${hx + 1} ${hy - 6} ${hx - 5} ${hy + 3}Z`, hair) + circ(hx - 4, hy - 12, 4.5, hair);
  if (hat === 'lama') s += path(`M${hx - 11} ${hy - 4}Q${hx - 2} ${hy - 30} ${hx + 3} ${hy - 30}Q${hx + 8} ${hy - 18} ${hx + 11} ${hy - 4}Z`, K.red, OUT + ' stroke-width="1.2"');
  else if (hat === 'helmet') s += path(`M${hx - 11} ${hy - 1}Q${hx - 10} ${hy - 14} ${hx} ${hy - 26}Q${hx + 10} ${hy - 14} ${hx + 11} ${hy - 1}Z`, K.gold, OUT + ' stroke-width="1.2"') + circ(hx, hy - 27, 2.2, K.goldHi);
  else if (hat === 'crown') s += path(`M${hx - 10} ${hy - 5}L${hx - 9} ${hy - 17}L${hx - 4} ${hy - 11}L${hx} ${hy - 20}L${hx + 4} ${hy - 11}L${hx + 9} ${hy - 17}L${hx + 10} ${hy - 5}Z`, K.gold, OUT + ' stroke-width="1"');
  else if (hat === 'black') s += path(`M${hx - 15} ${hy - 5}L${hx + 15} ${hy - 5}L${hx + 9} ${hy - 9}L${hx + 6} ${hy - 22}L${hx - 6} ${hy - 22}L${hx - 9} ${hy - 9}Z`, '#2a2622', OUT + ' stroke-width="1"');
  else if (hat === 'brim') s += path(`M${hx - 16} ${hy - 4}Q${hx} ${hy - 9} ${hx + 16} ${hy - 4}Q${hx + 8} ${hy - 20} ${hx} ${hy - 19}Q${hx - 8} ${hy - 20} ${hx - 16} ${hy - 4}Z`, '#b58a4a', OUT + ' stroke-width="1"');
  else if (hat === 'fur') s += path(`M${hx - 12} ${hy - 2}Q${hx - 12} ${hy - 20} ${hx} ${hy - 20}Q${hx + 12} ${hy - 20} ${hx + 12} ${hy - 2}Z`, '#6b4a2a', OUT + ' stroke-width="1"');
  const k = h / 100;
  return `<g transform="${tr(x, y, k, rot, dir)}">${s}</g>`;
}
/* the head and shoulders of a figure that stands inside something */
const bust = (o) => person({ ...o, pose: 'sit' });

/* ── animals ─────────────────────────────────────────────────────────────
   A hundred units long, facing right, standing on the origin. */
function beast(o) {
  const { x, y, l = 30, dir = 1, kind = 'cow', c = K.brown, c2, rot = 0 } = o;
  const lo = c2 || K.ink;
  let s = '';
  const legs = (pts, w, col = c) => pts.forEach(([a, b]) => { s += limb([a, b], col, w); });
  if (kind === 'elephant') {
    legs([[[-24, -38], [-26, 0]], [[-12, -38], [-12, 0]], [[14, -38], [16, 0]], [[26, -38], [26, 0]]], 11);
    s += ell(0, -46, 38, 24, c, OUT + ' stroke-width="1.6"');
    s += path('M-37 -48Q-44 -40 -42 -30', 'none', `stroke="${c}" stroke-width="4" stroke-linecap="round"`);
    s += circ(36, -56, 17, c, OUT + ' stroke-width="1.6"');
    s += path('M46 -52Q58 -38 54 -16Q52 -6 58 -4', 'none', `stroke="${c}" stroke-width="9" stroke-linecap="round"`);
    s += path('M42 -44Q52 -38 56 -40', 'none', 'stroke="#f7f1e2" stroke-width="3" stroke-linecap="round"');
    s += path('M22 -70Q12 -64 14 -46Q18 -34 30 -40Z', K.pink, OUT + ' stroke-width="1.4"');
    s += circ(42, -60, 1.8, K.ink);
  } else if (kind === 'fish') {
    s += path('M-40 0Q-10 -18 26 -6Q40 0 26 6Q-10 18 -40 0Z', c, OUT + ' stroke-width="1.6"');
    s += path('M-36 0L-54 -14L-50 0L-54 14Z', c, OUT + ' stroke-width="1.4"');
    s += circ(24, -2, 2.2, K.ink);
    s += path('M-4 -9Q4 0 -4 9', 'none', `stroke="${lo}" stroke-opacity=".35" stroke-width="1.6"`);
  } else if (kind === 'pig') {
    legs([[[-20, -20], [-22, 0]], [[-10, -20], [-10, 0]], [[14, -20], [15, 0]], [[22, -20], [24, 0]]], 6.5);
    s += ell(0, -30, 32, 18, c, OUT + ' stroke-width="1.6"');
    s += path('M26 -40Q40 -36 42 -28L42 -22Q34 -18 26 -22Z', c, OUT + ' stroke-width="1.4"');
    s += path('M24 -44L30 -54L32 -42Z', c, OUT + ' stroke-width="1.2"');
    s += circ(32, -34, 1.6, K.ink);
    s += path('M-32 -34Q-40 -40 -36 -46', 'none', `stroke="${c}" stroke-width="2" stroke-linecap="round"`);
  } else {
    // the quadrupeds: deer, cattle, yak, horse, dog, sheep, camel, fox
    const slim = kind === 'deer' || kind === 'fox' || kind === 'dog';
    const bodyY = kind === 'deer' ? -48 : kind === 'horse' ? -50 : kind === 'dog' || kind === 'fox' ? -26 : kind === 'sheep' ? -30 : -42;
    const ry = kind === 'yak' ? 19 : kind === 'cow' ? 17 : kind === 'horse' ? 15 : slim ? 11 : 15;
    const rx = kind === 'dog' || kind === 'fox' ? 26 : kind === 'sheep' ? 26 : 33;
    const lw = kind === 'yak' || kind === 'cow' ? 7.4 : kind === 'horse' ? 6.4 : slim ? 4.6 : 6;
    const top = bodyY + 4;
    legs([[[-rx + 6, top], [-rx + 3, 0]], [[-rx + 16, top], [-rx + 16, 0]], [[rx - 14, top], [rx - 12, 0]], [[rx - 6, top], [rx - 3, 0]]], lw);
    if (kind === 'yak') s += path(`M${-rx} ${bodyY + 4}Q${-rx + 2} ${bodyY + 24} ${-rx + 8} ${bodyY + 22}L${-10} ${bodyY + 28}L${10} ${bodyY + 24}L${rx - 6} ${bodyY + 26}L${rx} ${bodyY + 4}Z`, c);
    s += ell(0, bodyY, rx, ry, c, OUT + ' stroke-width="1.6"');
    if (kind === 'sheep') for (let i = -2; i <= 2; i++) s += circ(i * 9, bodyY - 8 + (i % 2) * 5, 8, c, OUT + ' stroke-width="1"');
    if (kind === 'camel') s += ell(-6, bodyY - 14, 12, 9, c, OUT + ' stroke-width="1.4"');
    // the neck and head
    const hx = kind === 'horse' ? rx + 14 : kind === 'dog' || kind === 'fox' ? rx + 6 : rx + 10;
    const hy = kind === 'horse' ? bodyY - 26 : kind === 'dog' || kind === 'fox' ? bodyY - 10 : kind === 'yak' || kind === 'cow' ? bodyY - 6 : bodyY - 22;
    s += limb([[rx - 8, bodyY - 4], [hx - 4, hy + 2]], c, kind === 'horse' ? 12 : slim ? 7 : 11);
    const hl = kind === 'horse' ? 14 : kind === 'dog' || kind === 'fox' ? 9 : 10;
    s += `<ellipse cx="${hx}" cy="${hy}" rx="${hl}" ry="${kind === 'yak' || kind === 'cow' ? 7.5 : 5.8}" fill="${c}" transform="rotate(${kind === 'horse' ? 38 : kind === 'yak' || kind === 'cow' ? 25 : 18} ${hx} ${hy})" ${OUT} stroke-width="1.4"/>`;
    s += circ(hx + 2, hy - 2, 1.5, K.ink);
    if (kind === 'deer') {
      s += line([[hx - 4, hy - 5], [hx - 8, hy - 20], [hx - 14, hy - 26]], K.brownLo, 1.8) + line([[hx - 7, hy - 15], [hx - 1, hy - 24]], K.brownLo, 1.6)
        + line([[hx - 1, hy - 5], [hx + 2, hy - 18], [hx + 7, hy - 24]], K.brownLo, 1.8);
      for (let i = 0; i < 5; i++) s += circ(-18 + i * 8, bodyY - 3 + (i % 2) * 4, 1.6, '#f7ead8');
    }
    if (kind === 'cow' || kind === 'yak') s += path(`M${hx - 6} ${hy - 5}Q${hx - 14} ${hy - 14} ${hx - 6} ${hy - 16}M${hx + 1} ${hy - 6}Q${hx + 4} ${hy - 16} ${hx + 10} ${hy - 13}`, 'none', 'stroke="#efe6d2" stroke-width="2.6" stroke-linecap="round"');
    if (kind === 'horse') s += path(`M${rx - 10} ${bodyY - 12}Q${hx - 16} ${hy - 12} ${hx - 6} ${hy - 8}L${hx - 9} ${hy - 2}Q${hx - 20} ${hy + 2} ${rx - 6} ${bodyY - 2}Z`, c2 || K.brownLo);
    if (kind === 'dog' || kind === 'fox' || kind === 'deer' || kind === 'horse') s += path(`M${hx - 4} ${hy - 4}L${hx - 3} ${hy - 12}L${hx + 1} ${hy - 5}Z`, c, OUT + ' stroke-width="1"');
    // the tail
    if (kind === 'horse') s += path(`M${-rx + 2} ${bodyY - 4}Q${-rx - 14} ${bodyY + 6} ${-rx - 8} ${bodyY + 30}`, 'none', `stroke="${c2 || K.brownLo}" stroke-width="5" stroke-linecap="round"`);
    else if (kind === 'fox' || kind === 'dog') s += path(`M${-rx + 2} ${bodyY - 2}Q${-rx - 16} ${bodyY - 12} ${-rx - 18} ${bodyY + 2}`, 'none', `stroke="${c}" stroke-width="${kind === 'fox' ? 7 : 3.5}" stroke-linecap="round"`);
    else s += path(`M${-rx + 1} ${bodyY - 2}Q${-rx - 6} ${bodyY + 6} ${-rx - 4} ${bodyY + 18}`, 'none', `stroke="${c}" stroke-width="2.4" stroke-linecap="round"`);
  }
  return `<g transform="${tr(x, y, l / 100, rot, dir)}">${s}</g>`;
}
function bird(o) {
  const { x, y, l = 20, dir = 1, c = K.white, c2 = '#c9c2b8', kind = 'bird', rot = 0 } = o;
  let s = '';
  if (kind === 'swan') {
    s += path('M-34 -10Q-30 6 0 6Q26 6 28 -8Q18 -14 -4 -14Q-24 -14 -34 -10Z', c, OUT + ' stroke-width="1.6"');
    s += path('M18 -10Q30 -18 26 -34Q24 -46 34 -46L42 -42L34 -40Q30 -32 32 -22Q34 -12 24 -6Z', c, OUT + ' stroke-width="1.4"');
    s += path('M-26 -12Q-6 -30 16 -12', c2, 'opacity=".75"');
  } else {
    s += path('M-30 -14Q-10 -30 16 -22Q30 -18 30 -10Q20 0 -4 -2Q-26 -4 -30 -14Z', c, OUT + ' stroke-width="1.6"');
    s += path('M-28 -14L-46 -24L-42 -12L-46 -4Z', c2, OUT + ' stroke-width="1.2"');
    s += circ(22, -22, 8, c, OUT + ' stroke-width="1.4"');
    s += path('M29 -24L37 -21L29 -18Z', K.saffron);
    s += circ(24, -24, 1.4, K.ink);
    s += path('M-18 -18Q0 -36 14 -18Q-2 -12 -18 -18Z', c2, OUT + ' stroke-width="1.2"');
  }
  return `<g transform="${tr(x, y, l / 100, rot, dir)}">${s}</g>`;
}

/* ── landscape ───────────────────────────────────────────────────────── */
/* a Tibetan cloud: lobes that curl in on themselves, and a tail of wind */
function cloud(x, y, s, o = {}) {
  const { fill = K.cloud, edge = K.cloudLo, tail = true, dir = 1, lobes } = o;
  const L = lobes || [[-26, 2, 13], [-12, -8, 16], [6, -10, 15], [21, -2, 12], [-2, 4, 13], [14, 6, 10]];
  let g = '';
  if (tail) g += path(`M-38 8Q-18 16 10 12Q34 10 52 14Q30 20 0 20Q-26 20 -38 8Z`, fill, `stroke="${edge}" stroke-width="1.6" stroke-opacity=".7"`);
  L.forEach(([cx, cy, r]) => {
    g += circ(cx, cy, r, fill, `stroke="${edge}" stroke-width="1.8" stroke-opacity=".75"`);
  });
  L.forEach(([cx, cy, r]) => {
    g += path(`M${cx - r * 0.55} ${cy + r * 0.1}a${r * 0.5} ${r * 0.5} 0 1 1 ${r * 0.62} ${r * 0.42}a${r * 0.26} ${r * 0.26} 0 1 1 -${r * 0.2} -${r * 0.34}`, 'none', `stroke="${edge}" stroke-width="1.5" stroke-opacity=".8" stroke-linecap="round"`);
  });
  return `<g transform="${tr(x, y, s / 60, 0, dir)}">${g}</g>`;
}
function tree(x, y, h, o = {}) {
  const { leaf = '#3f9a67', leafHi = '#6cc08c', fruit, trunk = '#6c4a33', kind = 'round', lean = 0 } = o;
  const k = h / 100;
  let g = '';
  g += path(`M-5 0Q-3 -30 ${-2 + lean} -60L${4 + lean} -60Q4 -30 6 0Z`, trunk, OUT + ' stroke-width="1.4"');
  if (kind === 'dead') {
    g += line([[1 + lean, -58], [-14, -82], [-22, -86]], trunk, 4) + line([[2 + lean, -60], [16, -88]], trunk, 4) + line([[-6, -74], [-2, -92]], trunk, 3);
  } else if (kind === 'cypress') {
    g += path('M0 -104Q-18 -70 -16 -40Q0 -30 16 -40Q18 -70 0 -104Z', leaf, OUT + ' stroke-width="1.6"');
    g += path('M0 -96Q-8 -70 -6 -46', 'none', `stroke="${leafHi}" stroke-width="2" opacity=".7"`);
  } else {
    const clumps = kind === 'wide'
      ? [[-26, -66, 20], [0, -80, 24], [26, -66, 20], [-12, -56, 16], [14, -56, 16]]
      : [[-16, -70, 18], [0, -86, 20], [17, -70, 18], [0, -62, 16]];
    clumps.forEach(([cx, cy, r]) => {
      g += circ(cx + lean, cy, r, leaf, OUT + ' stroke-width="1.6"');
      // the leaves drawn as scallops, as the relief carves them
      for (let i = 0; i < 4; i++) g += path(`M${cx + lean - r * 0.7 + i * r * 0.36} ${cy + r * 0.1}q${r * 0.18} ${-r * 0.28} ${r * 0.36} 0`, 'none', `stroke="${leafHi}" stroke-width="1.6" stroke-linecap="round"`);
      if (fruit) for (let i = 0; i < 3; i++) g += circ(cx + lean + (i - 1) * r * 0.5, cy - r * 0.35 + (i % 2) * r * 0.6, 2.8, fruit, OUT + ' stroke-width=".8"');
    });
  }
  return `<g transform="${tr(x, y, k)}">${g}</g>`;
}
function flame(x, y, s = 10, o = {}) {
  const { c = K.flame, hi = K.flameHi, dir = 1 } = o;
  const g = path('M0 0C-8 -4 -10 -14 -4 -24C-3 -16 2 -14 1 -30C9 -22 12 -8 4 0Z', c, OUT + ' stroke-width="1"')
    + path('M0 -2C-4 -5 -4 -11 -1 -15C0 -10 3 -9 2 -18C6 -12 6 -5 2 -2Z', hi);
  return `<g transform="${tr(x, y, s / 30, 0, dir)}">${g}</g>`;
}
function flames(x0, x1, y, s, seed) {
  const r = rng(seed);
  let g = '';
  for (let x = x0; x < x1; x += s * 0.55 + r() * s * 0.3) g += flame(x, y + r() * 3, s * (0.75 + r() * 0.5), { dir: r() > 0.5 ? 1 : -1 });
  return g;
}
/* rows of carved waves: a band of blue, crests in white */
function waves(x0, y0, x1, y1, o = {}) {
  const { c = K.water, lo = K.waterLo, hi = K.waterHi, gap = 11, seed = 3 } = o;
  const r = rng(seed);
  let g = `<rect x="${n1(x0)}" y="${n1(y0)}" width="${n1(x1 - x0)}" height="${n1(y1 - y0)}" fill="${c}"/>`;
  for (let y = y0 + gap * 0.6, row = 0; y < y1; y += gap, row++) {
    let d = `M${n1(x0 - 10)} ${n1(y)}`;
    const w = 26 + r() * 10;
    for (let x = x0 - 10 + (row % 2) * w / 2; x < x1 + 10; x += w) d += `q${n1(w / 4)} ${n1(-gap * 0.45)} ${n1(w / 2)} 0t${n1(w / 2)} 0`;
    g += path(d, 'none', `stroke="${row % 2 ? hi : lo}" stroke-width="${row % 2 ? 2.4 : 3}" stroke-opacity=".9" stroke-linecap="round"`);
  }
  return g;
}
/* a single curling crest, the kind the relief puts at the edge of a river */
const crest = (x, y, s, fill = K.foam) => `<g transform="${tr(x, y, s / 20)}">${path('M-12 4Q-12 -10 2 -12Q14 -12 12 0Q8 -6 2 -4Q-4 -2 0 4Z', fill, OUT + ' stroke-width="1"')}</g>`;
/* green hills with a lighter crest and a few tufts of grass */
function hills(pts, fill = K.hill, hi = K.hillHi, lo = K.hillLo) {
  let g = path(smoothOpen(pts), fill, `stroke="${lo}" stroke-width="2"`);
  g += path(openTop(pts), 'none', `stroke="${hi}" stroke-width="3" stroke-linecap="round" opacity=".85"`);
  return g;
}
function smoothOpen(pts) {
  // pts: the crest from left to right; closed along the bottom
  const [a] = pts, b = pts[pts.length - 1];
  return open(pts) + `L${n1(b[0])} ${n1(b[1] + 400)}L${n1(a[0])} ${n1(a[1] + 400)}Z`;
}
const openTop = (pts) => open(pts);
function tufts(x0, y0, x1, y1, n, seed, c = K.grass) {
  const r = rng(seed);
  let g = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0);
    g += path(`M${n1(x - 3)} ${n1(y)}l1.5 -5l1.5 3.5l1.5 -6l1.5 5l1.5 -3.5l1 6z`, c, 'opacity=".8"');
  }
  return g;
}

/* ── buildings ───────────────────────────────────────────────────────── */
/* A Tibetan building: tapering walls, a frieze of dark red under the eaves,
   black windows in white frames, a gilt roof when it is a temple or palace. */
function building(o) {
  const {
    x, y, w = 60, h = 40, wall = K.white, band = K.maroon, roof = 'gold', roofH = 16,
    windows = [2, 1], door = true, curtain = K.pink, open: pavilion, taper = 0.06, pillars = K.red
  } = o;
  const t = w * taper;
  let g = '';
  g += path(`M${-w / 2} 0L${-w / 2 + t} ${-h}L${w / 2 - t} ${-h}L${w / 2} 0Z`, wall, OUT + ' stroke-width="1.4"');
  g += `<rect x="${n1(-w / 2 + t)}" y="${n1(-h)}" width="${n1(w - 2 * t)}" height="${n1(h * 0.14)}" fill="${band}" ${OUT} stroke-width="1"/>`;
  for (let i = 0; i < Math.floor(w / 9); i++) g += circ(-w / 2 + t + 5 + i * 9, -h + h * 0.07, 1.4, K.goldHi);
  if (pavilion) {
    g += `<rect x="${n1(-w * 0.3)}" y="${n1(-h * 0.84)}" width="${n1(w * 0.6)}" height="${n1(h * 0.84)}" fill="${curtain}" ${OUT} stroke-width="1"/>`;
    g += path(`M${n1(-w * 0.3)} ${n1(-h * 0.84)}Q0 ${n1(-h * 0.6)} ${n1(w * 0.3)} ${n1(-h * 0.84)}Z`, K.blue, 'opacity=".85"');
    g += `<rect x="${n1(-w * 0.34)}" y="${n1(-h * 0.86)}" width="3" height="${n1(h * 0.86)}" fill="${pillars}"/><rect x="${n1(w * 0.34 - 3)}" y="${n1(-h * 0.86)}" width="3" height="${n1(h * 0.86)}" fill="${pillars}"/>`;
  } else {
    const [cols, rows] = windows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = -w / 2 + t + (w - 2 * t) * (c + 0.5) / cols, wy = -h * 0.72 + r * h * 0.32;
      g += `<rect x="${n1(wx - 4.5)}" y="${n1(wy - 4)}" width="9" height="8" fill="${K.white}" ${OUT} stroke-width=".8"/><rect x="${n1(wx - 3)}" y="${n1(wy - 2.5)}" width="6" height="6" fill="#211b19"/><rect x="${n1(wx - 5.5)}" y="${n1(wy - 6)}" width="11" height="2" fill="${K.red}"/>`;
    }
    if (door) g += `<rect x="-5.5" y="-15" width="11" height="15" fill="#4a2c20" ${OUT} stroke-width=".8"/><rect x="-6.5" y="-17" width="13" height="3" fill="${curtain}"/>`;
  }
  if (roof === 'gold') {
    const rw = w / 2 + 6;
    g += path(`M${-rw} ${-h + 1}Q${-rw + 4} ${-h - 3} ${-w / 2 + t} ${-h - 4}L${-w * 0.22} ${-h - roofH}L${w * 0.22} ${-h - roofH}L${w / 2 - t} ${-h - 4}Q${rw - 4} ${-h - 3} ${rw} ${-h + 1}L${rw - 4} ${-h - 7}Z`, K.gold, OUT + ' stroke-width="1.2"');
    g += path(`M${-w * 0.22} ${-h - roofH}L${w * 0.22} ${-h - roofH}`, 'none', `stroke="${K.goldLo}" stroke-width="2"`);
    g += path(`M-3 ${-h - roofH}L-2 ${-h - roofH - 9}Q0 ${-h - roofH - 14} 2 ${-h - roofH - 9}L3 ${-h - roofH}Z`, K.goldHi, OUT + ' stroke-width="1"');
    for (let i = -2; i <= 2; i++) g += path(`M${n1(i * w * 0.1)} ${-h - roofH + 1}L${n1(i * w * 0.2)} ${-h - 3}`, 'none', `stroke="${K.goldLo}" stroke-width="1.2" opacity=".8"`);
  } else if (roof === 'flat') {
    g += `<rect x="${n1(-w / 2 + t - 2)}" y="${n1(-h - 3)}" width="${n1(w - 2 * t + 4)}" height="4" fill="${K.brownLo}"/>`;
  }
  return `<g transform="translate(${n1(x)} ${n1(y)})">${g}</g>`;
}
function stupa(x, y, s = 30, fill = K.white) {
  const g = `<rect x="-15" y="-12" width="30" height="12" fill="${fill}" ${OUT} stroke-width="1.2"/><rect x="-12" y="-20" width="24" height="8" fill="${fill}" ${OUT} stroke-width="1.2"/>`
    + path('M-12 -20Q-13 -40 0 -42Q13 -40 12 -20Z', fill, OUT + ' stroke-width="1.2"')
    + `<rect x="-5" y="-48" width="10" height="6" fill="${fill}" ${OUT} stroke-width="1"/>`
    + path('M-4 -48L-1.5 -76L1.5 -76L4 -48Z', K.gold, OUT + ' stroke-width="1"')
    + circ(0, -79, 3, K.goldHi, OUT + ' stroke-width=".8"');
  return `<g transform="${tr(x, y, s / 80)}">${g}</g>`;
}
function flags(x0, y0, x1, y1) {
  const cols = ['#3a6fc0', '#f6f4ef', '#c7372b', '#3d9a5e', '#e7b93a'];
  let g = line([[x0, y0], [(x0 + x1) / 2, (y0 + y1) / 2 + 3], [x1, y1]], '#6b4a33', 0.9);
  const n = Math.max(3, Math.round(Math.hypot(x1 - x0, y1 - y0) / 6));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, x = x0 + (x1 - x0) * t, yy = y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 3;
    g += `<rect x="${n1(x - 2)}" y="${n1(yy)}" width="4" height="5" fill="${cols[i % 5]}" ${OUT} stroke-width=".5"/>`;
  }
  return g;
}
function pole(x, y, h) {
  return `<rect x="${n1(x - 1.2)}" y="${n1(y - h)}" width="2.4" height="${n1(h)}" fill="#5b3b27"/>` + circ(x, y - h, 2, K.gold);
}

/* ═══════════════════════════════════════════════════════════════════════
   THE WALL, AND WHAT STANDS ON IT BEYOND THE WHEEL
   ═══════════════════════════════════════════════════════════════════════ */
/* The wall runs on well past the frame in every direction, a little darker
   away from the wheel, so that no edge of it is ever seen. */
function drawWall() {
  return `<rect x="-6000" y="-6000" width="${ART_W + 12000}" height="${ART_H + 12000}" fill="${K.wallLo}"/>`
    + `<rect x="-6000" y="-6000" width="${ART_W + 12000}" height="${ART_H + 12000}" fill="url(#wl-wall)"/>`;
}
function drawBeyond() {
  let g = '';
  // the pure land in the upper left, on its bank of cloud
  let land = '';
  land += cloud(60, 118, 70, { fill: '#e9e4de', edge: '#8e97a8' });
  land += cloud(250, 104, 76, { fill: '#e6e0da', edge: '#8e97a8', dir: -1 });
  land += cloud(115, 150, 90, { fill: '#cfe0f2', edge: '#6f8fbf' });
  land += cloud(250, 162, 70, { fill: '#d9ebdf', edge: '#6f9a8a', dir: -1 });
  land += cloud(40, 196, 70, { fill: '#cfe0f2', edge: '#6f8fbf', tail: true });
  land += building({ x: 180, y: 128, w: 124, h: 70, wall: '#c9503e', band: '#8a2f22', roof: 'gold', roofH: 22, open: true, curtain: '#e88a38', pillars: '#e7b93a' });
  land += `<rect x="112" y="80" width="18" height="46" fill="#e7b93a" opacity=".9"/><rect x="230" y="80" width="18" height="46" fill="#e7b93a" opacity=".9"/>`;
  land += person({ x: 180, y: 124, h: 44, pose: 'sit', robe: '#c9422e', skin: '#e79a4a', hairStyle: 'bun', hair: '#27366b', halo: '#4b9f7a' });
  land += person({ x: 122, y: 124, h: 26, pose: 'sit', robe: '#f3efe7', skin: '#f5e8dc', hat: 'crown' });
  land += person({ x: 238, y: 124, h: 26, pose: 'sit', robe: '#27366b', skin: '#b36d52', hat: 'crown' });
  g += part('wl_beyond_pureland', land, [0, 30, 330, 200]);
  // the rainbow road, and the people climbing it out of the wheel
  let road = '';
  const lane = [[300, 332], [262, 300], [236, 262], [212, 222], [196, 186]];
  ['#c7372b', '#e7a23a', '#e9d54a', '#4aa36b', '#3a6fc0'].forEach((c, i) => {
    road += path(open(lane.map(([x, y]) => [x + i * 3.2 - 6, y + i * 1.2])), 'none', `stroke="${c}" stroke-width="3.4" stroke-linecap="round"`);
  });
  [[282, 318, '#8a8a3a'], [268, 305, '#3a5fae'], [254, 292, '#b9352b'], [242, 279, '#e9a53c'], [229, 262, '#8c8a3c'], [219, 246, '#d9747f'], [208, 227, '#7b2723']]
    .forEach(([x, y, c], i) => { road += person({ x, y, h: 17, pose: i === 6 ? 'walk' : 'walk', dir: -1, robe: c, hairStyle: i % 2 ? 'long' : 'short' }); });
  g += part('wl_beyond_path', road, [180, 180, 130, 160]);
  // the moon, and the sun at the head of the wall
  g += part('wl_beyond_moon', path('M438 26a22 22 0 1 0 14 40a26 26 0 1 1 -14 -40Z', '#f2efe6', OUT + ' stroke-width="1.6"'), [410, 22, 46, 50]);
  g += part('wl_beyond_sun', circ(832, 12, 17, '#f3b43d', OUT + ' stroke-width="1.4"') + circ(832, 12, 11, '#f7d067'), [812, -8, 40, 40]);
  // the Buddha in the upper right, standing on cloud and pointing the way out
  let bud = '';
  bud += cloud(1010, 50, 90, { fill: '#e9e4de', edge: '#8e97a8' });
  bud += cloud(1180, 60, 80, { fill: '#cfe0f2', edge: '#6f8fbf', dir: -1 });
  bud += cloud(1060, 176, 80, { fill: '#f0dde2', edge: '#b08a98' });
  bud += cloud(1160, 186, 84, { fill: '#e2eee0', edge: '#7ea08a', dir: -1 });
  bud += ell(1112, 118, 32, 62, '#e8a0a4', OUT + ' stroke-width="1.4"');
  bud += person({ x: 1112, y: 180, h: 112, pose: 'point', dir: -1, robe: '#c9642e', skin: '#e89a52', hairStyle: 'bun', hair: '#27366b', halo: '#4b9f7a', sash: '#9a3a22' });
  g += part('wl_beyond_buddha', bud, [950, 0, 290, 230]);
  // the two figures that fly at the edges of the wall
  let fly = '';
  fly += path('M1240 70Q1260 60 1290 72L1310 110L1300 170Q1280 190 1262 168Q1240 150 1250 118Z', '#9b2c2a', OUT + ' stroke-width="1.4"');
  fly += circ(1285, 78, 14, '#f4ede2', OUT + ' stroke-width="1.4"') + path('M1272 74Q1285 66 1298 74L1296 86Q1285 80 1274 86Z', '#3d7a64');
  fly += path('M1270 92Q1240 120 1250 180Q1256 200 1240 214M1300 96Q1320 140 1300 200', 'none', 'stroke="#f4f1e8" stroke-width="4" stroke-linecap="round"');
  fly += cloud(1290, 290, 64, { fill: '#f2ecd3', edge: '#b9ad84', dir: -1 });
  fly += path('M0 132Q18 128 30 140Q20 156 0 150Z', '#f4ede2', OUT + ' stroke-width="1.2"');
  g += part('wl_beyond_fliers', fly, [1230, 60, 90, 270]);
  return g;
}

/* ═══════════════════════════════════════════════════════════════════════
   YAMA, BEHIND THE WHEEL
   ═══════════════════════════════════════════════════════════════════════ */
/* a festoon of the white rosettes that hang from his shoulders and knees */
function festoon(pts, r = 7) {
  let g = open(pts);
  let s = path(g, 'none', `stroke="${K.boneLo}" stroke-width="2"`);
  // rosettes along the string
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
    const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / (r * 2.1)));
    for (let j = 0; j < n; j++) {
      const t = j / n, x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
      s += rosette(x, y, r);
    }
  }
  const [lx, ly] = pts[pts.length - 1];
  s += path(`M${lx - r * 0.7} ${ly}L${lx} ${ly + r * 2.6}L${lx + r * 0.7} ${ly}Z`, K.bone, OUT + ' stroke-width="1.2"');
  return s;
}
const rosette = (x, y, r) => {
  let s = '';
  for (let i = 0; i < 6; i++) s += circ(x + Math.cos(i * 60 * D) * r * 0.55, y + Math.sin(i * 60 * D) * r * 0.55, r * 0.5, K.bone, `stroke="${K.boneLo}" stroke-width="1"`);
  return s + circ(x, y, r * 0.35, '#e9e2d0');
};
/* Tiger stripes: tapered, curving bands laid across the pelt, some of them
   forked, starting alternately from either edge. */
function tigerStripes(d, box, seed, n = 12, across = 90) {
  const r = rng(seed);
  let s = '';
  const [x, y, w, h] = box;
  const band = (cx, cy, len, wid, ang, bend) => {
    const ux = Math.cos(ang * D), uy = Math.sin(ang * D), nx = -uy, ny = ux;
    const ax = cx - ux * len / 2, ay = cy - uy * len / 2, bx = cx + ux * len / 2, by = cy + uy * len / 2;
    const mx = cx + nx * bend, my = cy + ny * bend;
    return path(`M${n1(ax)} ${n1(ay)}Q${n1(mx + nx * wid)} ${n1(my + ny * wid)} ${n1(bx)} ${n1(by)}Q${n1(mx - nx * wid * 0.2)} ${n1(my - ny * wid * 0.2)} ${n1(ax)} ${n1(ay)}Z`, K.stripe);
  };
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const fromTop = i % 2 === 0;
    const len = h * (0.35 + r() * 0.3), wid = 4 + r() * 4;
    const cx = x + t * w + (r() - 0.5) * w / n * 0.6;
    const cy = fromTop ? y + len * 0.42 : y + h - len * 0.42;
    const ang = across + (r() - 0.5) * 24, bend = (r() - 0.5) * 10;
    s += band(cx, cy, len, wid, ang, bend);
    if (r() > 0.55) s += band(cx + (fromTop ? 6 : -6), cy + (fromTop ? len * 0.32 : -len * 0.32), len * 0.45, wid * 0.7, ang + (fromTop ? 28 : -28), bend * 0.5);
  }
  return `<g clip-path="${d}">${s}</g>`;
}
function drawBody() {
  let g = '';
  // his body stands behind the wheel: shoulders, arms, the legs bent at the knee
  let body = '';
  body += path('M300 300Q170 330 120 430Q86 520 104 640Q90 760 100 880Q70 980 90 1110Q120 1210 240 1230L1080 1230Q1200 1210 1230 1110Q1250 980 1220 880Q1230 760 1216 640Q1234 520 1200 430Q1150 330 1020 300Z',
    'url(#wl-yama-body)', OUT + ' stroke-width="2"');
  // upper arms, bent up to the hands at the rim
  body += path('M104 470Q90 560 118 650Q150 700 196 690Q230 640 240 560Q244 510 226 470Q180 430 104 470Z', 'url(#wl-yama-arm)', OUT + ' stroke-width="2"');
  body += path('M1216 470Q1230 560 1202 650Q1170 700 1124 690Q1090 640 1080 560Q1076 510 1094 470Q1140 430 1216 470Z', 'url(#wl-yama-arm)', OUT + ' stroke-width="2"');
  // gold armlets
  body += path('M100 572Q150 552 196 572L200 604Q150 586 104 606Z', K.gold, OUT + ' stroke-width="1.6"') + rosette(150, 588, 7);
  body += path('M1220 572Q1170 552 1124 572L1120 604Q1170 586 1216 606Z', K.gold, OUT + ' stroke-width="1.6"') + rosette(1170, 588, 7);
  g += part('wl_yama', body, [86, 300, 1150, 930]);
  // the bone ornaments: at the shoulders, and down over the knees
  let bones = '';
  bones += festoon([[250, 330], [180, 344], [110, 352], [50, 352]], 7) + festoon([[260, 352], [190, 372], [120, 386], [60, 392]], 7) + festoon([[270, 376], [210, 404], [150, 424], [96, 430]], 7);
  bones += festoon([[1070, 330], [1140, 344], [1210, 352], [1270, 352]], 7) + festoon([[1060, 352], [1130, 372], [1200, 386], [1260, 392]], 7) + festoon([[1050, 376], [1110, 404], [1170, 424], [1224, 430]], 7);
  bones += festoon([[200, 440], [206, 480], [214, 520]], 7) + festoon([[1120, 440], [1114, 480], [1106, 520]], 7);
  [[150, 930], [120, 944], [90, 956], [60, 966]].forEach(([x, y], i) => { bones += festoon([[x, y], [x - 6, y + 70 + i * 14], [x - 4, y + 150 + i * 18]], 7.4); });
  [[1170, 930], [1200, 944], [1230, 956], [1260, 966]].forEach(([x, y], i) => { bones += festoon([[x, y], [x + 6, y + 70 + i * 14], [x + 4, y + 150 + i * 18]], 7.4); });
  g += part('wl_yama_bones', bones, [40, 320, 1240, 900]);
  // the jade scarves swirling out from behind his head, and the dark green
  // ones that lie in coils under his feet
  let scarves = '';
  const jade = (d) => path(d, 'url(#wl-jade)', `stroke="${K.jadeLo}" stroke-width="2"`);
  scarves += jade('M470 190Q380 120 290 150Q200 180 190 250Q186 300 230 330Q260 350 300 330Q250 300 262 260Q280 214 340 218Q400 222 440 260Z');
  scarves += jade('M300 330Q240 380 250 450Q260 500 300 520Q270 460 300 420Q330 380 380 380Z');
  scarves += jade('M850 190Q940 120 1030 150Q1120 180 1130 250Q1134 300 1090 330Q1060 350 1020 330Q1070 300 1058 260Q1040 214 980 218Q920 222 880 260Z');
  scarves += jade('M1020 330Q1080 380 1070 450Q1060 500 1020 520Q1050 460 1020 420Q990 380 940 380Z');
  for (const side of [1, -1]) {
    const X = (x) => side > 0 ? x : ART_W - x;
    scarves += path(`M${X(180)} 250Q${X(200)} 200 ${X(260)} 190M${X(214)} 290Q${X(230)} 240 ${X(300)} 226M${X(250)} 318Q${X(262)} 270 ${X(330)} 260`, 'none', `stroke="${K.jadeLo}" stroke-width="2.2" opacity=".6"`);
  }
  // the long jade falls down each side of the wheel
  scarves += jade('M112 640Q70 740 96 860Q110 930 150 960Q124 880 138 800Q150 720 134 650Z');
  scarves += jade('M1208 640Q1250 740 1224 860Q1210 930 1170 960Q1196 880 1182 800Q1170 720 1186 650Z');
  const dark = (d) => path(d, 'url(#wl-green)', `stroke="${K.greenLo}" stroke-width="2"`);
  scarves += dark('M560 1520Q430 1540 300 1510Q160 1476 90 1520Q40 1556 70 1600Q110 1640 200 1610Q140 1600 136 1570Q140 1540 220 1548Q330 1560 440 1580Q520 1590 570 1560Z');
  scarves += dark('M150 1470Q60 1440 44 1380Q40 1340 70 1330Q60 1380 110 1410Q170 1440 250 1440Z');
  scarves += dark('M760 1520Q890 1540 1020 1510Q1160 1476 1230 1520Q1280 1556 1250 1600Q1210 1640 1120 1610Q1180 1600 1184 1570Q1180 1540 1100 1548Q990 1560 880 1580Q800 1590 750 1560Z');
  scarves += dark('M1170 1470Q1260 1440 1276 1380Q1280 1340 1250 1330Q1260 1380 1210 1410Q1150 1440 1070 1440Z');
  for (let i = 0; i < 4; i++) {
    scarves += path(`M${140 + i * 90} ${1532 + i * 8}Q${200 + i * 90} ${1552 + i * 6} ${260 + i * 90} ${1548 + i * 8}`, 'none', `stroke="${K.greenHi}" stroke-width="2.4" opacity=".55"`);
    scarves += path(`M${1180 - i * 90} ${1532 + i * 8}Q${1120 - i * 90} ${1552 + i * 6} ${1060 - i * 90} ${1548 + i * 8}`, 'none', `stroke="${K.greenHi}" stroke-width="2.4" opacity=".55"`);
  }
  g += part('wl_yama_scarves', scarves, [40, 120, 1240, 1520]);
  // the tiger skin: over the knees, and hanging beneath the wheel with its
  // head and paws
  let tiger = '';
  const kneeL = 'M40 960Q60 900 140 900Q210 910 224 980Q230 1040 200 1070Q140 1080 80 1060Q40 1030 40 960Z';
  const kneeR = 'M1280 960Q1260 900 1180 900Q1110 910 1096 980Q1090 1040 1120 1070Q1180 1080 1240 1060Q1280 1030 1280 960Z';
  tiger += `<clipPath id="wl-tk-l"><path d="${kneeL}"/></clipPath><clipPath id="wl-tk-r"><path d="${kneeR}"/></clipPath><clipPath id="wl-tk-b"><path d="M380 1360Q460 1350 560 1370Q640 1380 700 1370L700 1420Q640 1440 600 1470Q560 1500 500 1498Q430 1496 380 1480Q360 1440 380 1360Z"/></clipPath>`;
  tiger += path(kneeL, 'url(#wl-tiger)', OUT + ' stroke-width="1.8"') + tigerStripes('url(#wl-tk-l)', [40, 900, 190, 180], 11, 9, 100);
  tiger += path(kneeR, 'url(#wl-tiger)', OUT + ' stroke-width="1.8"') + tigerStripes('url(#wl-tk-r)', [1090, 900, 190, 180], 12, 9, 80);
  tiger += path('M380 1360Q460 1350 560 1370Q640 1380 700 1370L700 1420Q640 1440 600 1470Q560 1500 500 1498Q430 1496 380 1480Q360 1440 380 1360Z', 'url(#wl-tiger)', OUT + ' stroke-width="1.8"')
    + tigerStripes('url(#wl-tk-b)', [370, 1350, 330, 150], 13, 14, 95);
  // paws with claws, hanging below
  for (const [px, py] of [[440, 1470], [560, 1478], [660, 1420]]) {
    tiger += path(`M${px - 18} ${py}Q${px - 20} ${py + 26} ${px} ${py + 30}Q${px + 20} ${py + 26} ${px + 18} ${py}Z`, K.tiger, OUT + ' stroke-width="1.4"');
    for (let i = -1; i <= 1; i++) tiger += path(`M${px + i * 8} ${py + 28}l${i * 2} 8`, 'none', `stroke="${K.bone}" stroke-width="2.4" stroke-linecap="round"`);
  }
  // a turquoise cloth hanging between them
  tiger += path('M620 1380Q700 1370 780 1386Q770 1460 740 1540Q700 1520 680 1470Q650 1430 620 1380Z', '#4bb3b5', OUT + ' stroke-width="1.6"');
  tiger += path('M660 1400Q700 1440 720 1510M700 1396Q730 1440 744 1500', 'none', 'stroke="#2e8a8f" stroke-width="2" opacity=".7"');
  g += part('wl_yama_tiger', tiger, [40, 900, 1240, 640]);
  // the offering bowl beneath his feet
  let bowl = '';
  bowl += path('M400 1640Q420 1600 470 1610Q500 1640 470 1670Q430 1690 400 1640Z', '#d24f6a', OUT + ' stroke-width="1.4"') + path('M920 1640Q900 1600 850 1610Q820 1640 850 1670Q890 1690 920 1640Z', '#d24f6a', OUT + ' stroke-width="1.4"');
  bowl += path('M470 1650Q520 1640 540 1690Q500 1700 470 1650Z', '#7a2a3a', OUT + ' stroke-width="1.2"') + path('M850 1650Q800 1640 780 1690Q820 1700 850 1650Z', '#7a2a3a', OUT + ' stroke-width="1.2"');
  bowl += path('M540 1620Q660 1600 780 1620Q776 1680 700 1698L620 1698Q544 1680 540 1620Z', 'url(#wl-gold-v)', OUT + ' stroke-width="1.8"');
  bowl += path('M616 1698L704 1698L716 1730L604 1730Z', 'url(#wl-gold-v)', OUT + ' stroke-width="1.6"');
  bowl += path('M560 1620Q600 1566 640 1600Q660 1540 700 1580Q740 1560 760 1620Z', '#d94048', OUT + ' stroke-width="1.4"');
  bowl += goldFlame(626, 1590, 44, -1, -20) + goldFlame(694, 1590, 44, 1, 20) + goldFlame(660, 1548, 40, 1, 0);
  bowl += path('M622 1592Q628 1540 660 1532Q692 1540 698 1592Q660 1606 622 1592Z', K.gold, OUT + ' stroke-width="1.6"');
  bowl += circ(660, 1570, 17, '#fdfbf6', OUT + ' stroke-width="1.4"') + circ(660, 1570, 11, '#eef4fb') + circ(654, 1564, 5, '#ffffff');
  bowl += path('M512 1590Q520 1556 548 1560Q574 1570 566 1600Q540 1612 512 1590Z', '#f4efe6', OUT + ' stroke-width="1.4"') + path('M526 1576Q540 1570 552 1586', 'none', `stroke="${K.boneLo}" stroke-width="1.6"`);
  bowl += circ(772, 1580, 14, '#f08a3a', OUT + ' stroke-width="1.4"') + circ(790, 1596, 10, '#d9402f', OUT + ' stroke-width="1.2"') + path('M776 1566Q786 1556 796 1564Q786 1570 776 1566Z', '#4b9a5a');
  g += part('wl_offering_bowl', bowl, [396, 1486, 528, 250]);
  return g;
}

/* ═══════════════════════════════════════════════════════════════════════
   THE WHEEL'S OWN GROUND
   ═══════════════════════════════════════════════════════════════════════ */
function clipDefs() {
  let d = '';
  REALMS.forEach((r) => { d += `<clipPath id="${r.id}-clip"><path d="${sector(R.karmaRim - 2, R.realm + 2, r.a0, r.a1)}"/></clipPath>`; });
  NIDANAS.forEach((id, i) => {
    const [a0, a1] = nidanaSpan(i);
    d += `<clipPath id="${id}-clip"><path d="${sector(R.band0 + 5, R.band1 - 5, a0 + 1.6, a1 - 1.6)}"/></clipPath>`;
  });
  d += `<clipPath id="wl-karma-w-clip"><path d="${sector(R.hubRim, R.karma, 90, 270)}"/></clipPath>`;
  d += `<clipPath id="wl-karma-b-clip"><path d="${sector(R.hubRim, R.karma, -90, 90)}"/></clipPath>`;
  d += `<clipPath id="wl-hub-clip"><circle cx="${C.x}" cy="${C.y}" r="${R.hub}"/></clipPath>`;
  d += `<clipPath id="wl-realms-clip"><path clip-rule="evenodd" d="${ring(R.karmaRim - 1, R.realm + 1)}"/></clipPath>`;
  HOT_CELLS.concat(COLD_CELLS).forEach(([id, a0, a1, r0, r1]) => { d += `<clipPath id="${id}-clip"><path d="${sector(r0, r1, a0, a1)}"/></clipPath>`; });
  return d;
}
const clipped = (id, inner) => `<g clip-path="url(#${id}-clip)">${inner}</g>`;

/* the six realms' skies, earths and waters */
function faceGods() {
  let g = `<rect x="440" y="420" width="450" height="340" fill="url(#wl-sky)"/>`;
  g += cloud(560, 528, 110, { fill: '#e8eef6', edge: '#9fb3cf' }) + cloud(700, 530, 100, { fill: '#eef0f6', edge: '#9fb3cf', dir: -1 });
  g += cloud(470, 560, 90, { fill: '#cfe0f2', edge: '#7c9ccc' }) + cloud(840, 556, 90, { fill: '#dfe8f4', edge: '#8ea6cc', dir: -1 });
  g += cloud(800, 468, 70, { fill: '#f2eef0', edge: '#a8a0b8' });
  g += waves(440, 640, 890, 760, { seed: 7, gap: 10 });
  // the golden ranges, standing in the sea around Meru's foot
  for (const [x, y, w] of [[480, 650, 36], [528, 664, 30], [610, 676, 44], [704, 676, 44], [786, 664, 30], [836, 650, 36], [560, 700, 30], [760, 700, 30]]) {
    g += path(`M${x - w / 2} ${y + 8}Q${x - w / 4} ${y - 8} ${x} ${y - 4}Q${x + w / 4} ${y - 10} ${x + w / 2} ${y + 8}Z`, K.gold, OUT + ' stroke-width="1.2"');
  }
  return g;
}
function faceAsuras() {
  let g = `<rect x="220" y="470" width="400" height="400" fill="url(#wl-sky)"/>`;
  g += waves(430, 560, 620, 700, { seed: 5, gap: 10 });
  g += hills([[240, 640], [300, 600], [360, 616], [430, 596], [520, 640], [600, 660]]);
  g += hills([[230, 730], [300, 716], [380, 736], [460, 720], [540, 744], [610, 760]], '#7cc9a8');
  g += cloud(318, 574, 70, { fill: '#e8eef6', edge: '#9fb3cf' }) + cloud(480, 610, 60, { fill: '#e9dfe6', edge: '#a898b0' });
  g += cloud(420, 536, 84, { fill: '#d6ecdf', edge: '#76a88e' });
  g += tufts(240, 740, 600, 850, 18, 21);
  return g;
}
function faceHumans() {
  let g = `<rect x="700" y="440" width="420" height="440" fill="url(#wl-sky)"/>`;
  g += cloud(850, 530, 90, { fill: '#eef0f2', edge: '#9aa8bd' }) + cloud(940, 520, 70, { fill: '#e7eef6', edge: '#9aa8bd', dir: -1 });
  g += hills([[720, 610], [800, 580], [880, 600], [960, 560], [1040, 590], [1100, 580]]);
  g += hills([[720, 680], [790, 660], [860, 690], [940, 670], [1020, 690], [1100, 670]], '#86d2b4');
  g += hills([[720, 760], [800, 740], [880, 770], [960, 752], [1040, 770], [1110, 760]], '#78c9aa');
  g += tufts(730, 600, 1090, 860, 40, 33);
  return g;
}
function facePretas() {
  let g = `<rect x="740" y="780" width="380" height="420" fill="url(#wl-sky)"/>`;
  g += cloud(880, 848, 90, { fill: '#f0e2e6', edge: '#b3909c' }) + cloud(980, 836, 90, { fill: '#f4eef0', edge: '#a8a0b8', dir: -1 }) + cloud(1060, 870, 70, { fill: '#f0e2e6', edge: '#b3909c' });
  g += hills([[760, 920], [820, 890], [900, 900], [980, 880], [1060, 900], [1110, 890]], '#9ccfae', '#c5e6cf', '#74ad8a');
  g += hills([[760, 990], [840, 970], [920, 990], [1000, 976], [1100, 990]], '#a6d3b0', '#cfe8d3', '#7cb190');
  g += waves(880, 1060, 1110, 1190, { seed: 9, gap: 10 });
  g += waves(760, 1050, 880, 1110, { seed: 4, gap: 10 });
  return g;
}
function faceHells() {
  let g = `<rect x="300" y="930" width="700" height="380" fill="${K.hellGround}"/>`;
  // the hot hells: floors of burning iron, ruled into cells
  g += `<path d="${sector(215, R.realm + 2, 100, 142)}" fill="${K.hellHot}"/>`;
  // the cold: ice on ice, in slabs
  g += `<path d="${sector(250, R.realm + 2, 44, 82)}" fill="${K.ice}"/>`;
  const r = rng(17);
  for (let a = 46; a < 82; a += 4.5) for (let rr = 262; rr < R.realm; rr += 26) {
    const [x, y] = pol(rr + r() * 10, a + r() * 2);
    g += path(`M${n1(x - 16)} ${n1(y + 6)}L${n1(x - 4)} ${n1(y - 10)}L${n1(x + 18)} ${n1(y - 4)}L${n1(x + 6)} ${n1(y + 10)}Z`, r() > 0.5 ? K.iceLo : '#dce8f2', 'opacity=".85"');
  }
  // the neighbouring river running down from the pretas' land
  g += `<path d="${sector(128, 250, 44, 53)}" fill="${K.water}"/>`;
  return g;
}
function faceAnimals() {
  let g = `<rect x="220" y="790" width="360" height="360" fill="url(#wl-sky)"/>`;
  g += hills([[230, 860], [300, 840], [380, 852], [460, 830], [560, 870]], '#86cfa9');
  g += hills([[230, 910], [320, 896], [400, 916], [480, 900], [570, 916]], '#6fc29a', '#9edbb8', '#4f9f78');
  g += waves(220, 978, 580, 1150, { seed: 12, gap: 11 });
  g += tufts(240, 870, 560, 970, 30, 44);
  return g;
}
/* the two halves of the karma ring, and the hub */
function faceKarma() {
  let g = `<path d="${sector(R.hubRim, R.karma, 90, 270)}" fill="${K.karmaW}"/>`;
  g += `<path d="${sector(R.hubRim, R.karma, -90, 90)}" fill="${K.karmaB}"/>`;
  let clouds = '';
  [[570, 812, 34], [566, 872, 36], [580, 930, 30], [600, 780, 26], [556, 846, 26], [596, 956, 28], [620, 772, 24]].forEach(([x, y, s], i) => {
    clouds += cloud(x, y, s * 1.2, { fill: i % 2 ? '#f1eef2' : '#e2eaf4', edge: i % 3 ? '#9aa8c4' : '#c49aa8', tail: false });
  });
  g += clipped('wl-karma-w', clouds);
  g += `<circle cx="${C.x}" cy="${C.y}" r="${R.hub}" fill="url(#wl-hub)"/>`;
  return g;
}
/* the twelve panels: a dark ground, and inside each a sky over green earth */
function faceBand() {
  let g = `<path d="${ring(R.band0, R.band1)}" fill="${K.band}" fill-rule="evenodd"/>`;
  NIDANAS.forEach((id, i) => {
    const [a0, a1] = nidanaSpan(i);
    const [cx, cy] = pol((R.band0 + R.band1) / 2, (a0 + a1) / 2);
    let s = `<rect x="${n1(cx - 140)}" y="${n1(cy - 140)}" width="280" height="280" fill="${K.panelSky}"/>`;
    s += cloud(cx - 30, cy - 18, 40, { fill: '#f1f1f1', edge: '#a4b0c4', tail: false }) + cloud(cx + 40, cy - 22, 34, { fill: '#f1f1f1', edge: '#a4b0c4', tail: false });
    s += hills([[cx - 150, cy + 2], [cx - 80, cy - 8], [cx - 10, cy + 4], [cx + 60, cy - 6], [cx + 150, cy + 4]], '#84cfb0');
    s += hills([[cx - 150, cy + 16], [cx - 60, cy + 10], [cx + 30, cy + 20], [cx + 150, cy + 12]], '#6fc29f');
    g += part(id, clipped(id, s), sectorBox(R.band0, R.band1, a0, a1));
  });
  return g;
}
function drawFace() {
  let g = `<circle cx="${C.x}" cy="${C.y}" r="${R.rim + 2}" fill="${K.band}"/>`;
  const faces = { wl_realm_gods: faceGods, wl_realm_asuras: faceAsuras, wl_realm_humans: faceHumans, wl_realm_pretas: facePretas, wl_realm_hells: faceHells, wl_realm_animals: faceAnimals };
  REALMS.forEach((r) => { g += part(r.id, clipped(r.id, faces[r.id]()), sectorBox(R.karmaRim, R.realm, r.a0, r.a1)); });
  g += faceKarma();
  g += faceBand();
  return g;
}

/* ═══════════════════════════════════════════════════════════════════════
   WHAT STANDS ON THE WHEEL
   ═══════════════════════════════════════════════════════════════════════ */
/* one of the six sages, a buddha appearing in each realm, on a cloud */
function muni(x, y, h, o) {
  const { skin, robe = '#b9352b', halo = '#e6934a', pose = 'sit', prop = '', dir = 1, standing } = o;
  let g = cloud(x, y + (standing ? 2 : 4), h * 1.3, { fill: '#f3eef0', edge: '#a39aae', tail: false });
  g += ell(x, y - h * (standing ? 0.52 : 0.4), h * (standing ? 0.36 : 0.44), h * (standing ? 0.62 : 0.5), halo, OUT + ' stroke-width="1.2"');
  g += person({ x, y, h, pose, skin, robe, hairStyle: 'bun', hair: K.navy, halo: '#5aaa86', dir, prop });
  return g;
}
function reliefGods() {
  let g = '';
  // the fruit of the wish-granting tree, whose trunk stands among the asuras
  let fruit = '';
  fruit += tree(500, 536, 120, { kind: 'wide', leaf: '#3c8f68', leafHi: '#77c596', fruit: '#e0553a', trunk: '#4f3a2a', lean: 14 });
  fruit += tree(440, 520, 90, { kind: 'round', leaf: '#3c8f68', leafHi: '#77c596', fruit: '#f0b53a', trunk: '#4f3a2a' });
  g += part('wl_wish_tree', fruit, [400, 420, 150, 130]);
  // Meru, in white terraces, rising from the sea: its east face shows white,
  // its south and north faces the ochre and green of the relief
  let meru = '';
  [[176, 690], [156, 668], [136, 646], [116, 624], [100, 602]].forEach(([w, yb], i) => {
    const top = yb - 22;
    meru += `<rect x="${660 - w / 2}" y="${top}" width="${w}" height="22" fill="#f5f4ef" ${OUT} stroke-width="1.2"/>`;
    meru += path(`M${660 - w / 2} ${yb}L${660 - w / 2} ${top}L${660 - w / 2 + 16} ${top + 6}L${660 - w / 2 + 16} ${yb}Z`, '#ef9a3a', OUT + ' stroke-width="1"');
    meru += path(`M${660 + w / 2} ${yb}L${660 + w / 2} ${top}L${660 + w / 2 - 16} ${top + 6}L${660 + w / 2 - 16} ${yb}Z`, '#3a9a62', OUT + ' stroke-width="1"');
    meru += line([[660 - w / 2 + 18, top + 3], [660 + w / 2 - 18, top + 3]], '#d8d6cc', 1.4);
  });
  g += part('wl_gods_meru', meru, [572, 558, 176, 134]);
  // the palace of the gods on its bank of cloud
  let palace = '';
  palace += cloud(620, 548, 70, { fill: '#e8eef6', edge: '#9fb3cf' }) + cloud(700, 546, 70, { fill: '#eef0f6', edge: '#9fb3cf', dir: -1 });
  palace += building({ x: 660, y: 540, w: 96, h: 50, wall: '#c85a44', band: '#8a2f22', roofH: 18, open: true, curtain: '#e38a9a', pillars: '#e7b93a' });
  palace += building({ x: 660, y: 472, w: 50, h: 16, wall: '#e7b93a', band: '#8a2f22', roofH: 16, windows: [2, 0], door: false });
  palace += person({ x: 660, y: 536, h: 34, pose: 'sit', robe: '#f3efe7', skin: '#f6e1d0', hat: 'crown' });
  palace += person({ x: 626, y: 538, h: 22, pose: 'sit', robe: '#e38a9a', hat: 'crown' }) + person({ x: 694, y: 538, h: 22, pose: 'sit', robe: '#6aa9d8', hat: 'crown' });
  g += part('wl_gods_palace', palace, [606, 440, 108, 118]);
  // the gods' army on the elephant, riding out to the tree
  let army = '';
  army += beast({ x: 520, y: 598, l: 56, kind: 'elephant', c: '#d9dbe0', dir: -1 });
  army += person({ x: 520, y: 560, h: 26, pose: 'strike', robe: K.gold, hat: 'helmet', dir: -1, prop: line([[6, -104], [14, -126]], '#6b4a33', 2) });
  [[478, 588], [556, 590], [494, 612], [572, 612]].forEach(([x, y], i) => {
    army += person({ x, y, h: 24, pose: i % 2 ? 'strike' : 'point', robe: K.gold, sleeve: '#d9a42a', hat: 'helmet', dir: -1 });
  });
  army += pole(540, 572, 40) + path('M541 532L560 538L541 546Z', K.red) + pole(468, 590, 36) + path('M469 554L452 560L469 568Z', K.red);
  g += part('wl_gods_army', army, [440, 520, 140, 110]);
  g += part('wl_muni_gods', muni(800, 520, 38, { skin: '#f6f2ec', robe: '#c9422e', halo: '#ef9a4a',
    prop: path('M4 -28Q16 -40 26 -34L30 -50L33 -49L29 -32Q24 -20 8 -22Z', '#e2b25a', OUT + ' stroke-width="1"') }), [760, 450, 84, 90]);
  return g;
}
function reliefAsuras() {
  let g = '';
  // the trunk of the wish-granting tree
  g += part('wl_wish_tree', path('M516 860Q520 760 528 700Q534 640 540 590L556 590Q552 650 548 710Q544 780 546 860Z', '#4f3a2a', OUT + ' stroke-width="1.6"')
    + path('M524 840Q528 760 534 680M538 820Q540 740 546 660', 'none', 'stroke="#2f2218" stroke-width="2" opacity=".6"'), [510, 580, 50, 280]);
  // the asura king's palace
  let palace = '';
  palace += building({ x: 350, y: 764, w: 180, h: 70, wall: '#e0874a', band: '#9a2f2a', roof: 'flat', open: true, curtain: '#4a7fc0', pillars: '#c9422e' });
  palace += path('M250 764L450 764L470 792L270 792Z', '#e46a78', OUT + ' stroke-width="1.4"');
  palace += person({ x: 320, y: 758, h: 44, pose: 'sit', robe: '#8c8a3c', hat: 'black', skin: '#e6b38e' });
  palace += person({ x: 356, y: 760, h: 26, pose: 'offer', dir: -1, robe: '#3a5fae' });
  palace += person({ x: 392, y: 762, h: 22, pose: 'kneel', robe: K.gold, hat: 'helmet', dir: -1 }) + person({ x: 410, y: 762, h: 22, pose: 'kneel', robe: K.gold, hat: 'helmet', dir: -1 });
  palace += path('M444 792L444 760Q456 744 468 760L468 792Z', '#f0d05a', OUT + ' stroke-width="1.2"') + person({ x: 456, y: 790, h: 22, robe: '#c9422e' });
  palace += path('M436 800L480 800L490 830L426 830Z', '#4a4a52', OUT + ' stroke-width="1"');
  palace += tree(430, 700, 50, { kind: 'cypress', leaf: '#2f7a53', leafHi: '#56a579' }) + tree(456, 704, 44, { kind: 'cypress', leaf: '#2f7a53', leafHi: '#56a579' }) + tree(482, 708, 40, { kind: 'cypress', leaf: '#3a8a60', leafHi: '#56a579' });
  g += part('wl_asura_palace', palace, [250, 690, 240, 140]);
  // the asuras at war, in gold helmets and armour, with bows and flags
  let war = '';
  [[330, 640, 'strike'], [372, 624, 'point'], [410, 660, 'strike'], [446, 640, 'point'], [480, 668, 'strike'], [300, 606, 'point']].forEach(([x, y, pose], i) => {
    war += person({ x, y, h: 28, pose, robe: K.gold, sleeve: '#d9a42a', hat: 'helmet', skin: '#e5a887', dir: 1,
      prop: pose === 'point' ? path('M26 -60Q34 -76 26 -92', 'none', 'stroke="#6b4a33" stroke-width="2"') : line([[6, -104], [2, -124]], '#b8c2cc', 2.4) });
  });
  war += pole(402, 624, 44) + path('M403 580L424 586L403 594Z', '#3a6fc0') + pole(462, 634, 40) + path('M463 594L484 600L463 608Z', K.red);
  war += person({ x: 500, y: 760, h: 26, pose: 'up', robe: '#c9422e', dir: 1 });
  war += person({ x: 488, y: 842, h: 22, pose: 'bent', robe: '#3a5fae', dir: 1 }) + path('M504 834Q512 820 520 834L518 842L506 842Z', '#d9a42a', OUT + ' stroke-width="1"');
  g += part('wl_asura_war', war, [290, 570, 240, 280]);
  g += part('wl_muni_asuras', muni(412, 566, 36, { skin: '#4f9a6a', robe: '#c9422e', halo: '#e6934a',
    prop: line([[12, -36], [22, -58]], '#c9ccd4', 2.6) }), [376, 500, 76, 84]);
  return g;
}
function reliefHumans() {
  let g = '';
  g += part('wl_muni_humans', muni(870, 534, 50, { skin: '#e8a252', robe: '#d96a2a', halo: '#e89aa2', pose: 'offer', standing: true,
    prop: line([[-10, -40], [-12, 4]], '#6b4a33', 2) + path('M14 -62Q20 -54 26 -62Z', '#3a2a22') }), [830, 450, 84, 100]);
  g += part('wl_human_stupa', stupa(900, 594, 30), [884, 560, 32, 36]);
  // the teaching: lamas in two temples, and people come to hear them
  let teach = '';
  teach += building({ x: 966, y: 624, w: 76, h: 40, wall: '#f0b77a', band: '#8a2f22', open: true, curtain: '#e6a0a8' });
  teach += person({ x: 966, y: 620, h: 28, pose: 'teach', robe: '#8a2f2a', sash: '#e7a23a' });
  teach += person({ x: 940, y: 640, h: 18, pose: 'kneel', robe: '#3a5fae' }) + person({ x: 990, y: 642, h: 18, pose: 'kneel', dir: -1, robe: '#8a5a3a' }) + person({ x: 962, y: 646, h: 18, pose: 'kneel', robe: '#c9642e' });
  teach += building({ x: 824, y: 690, w: 90, h: 44, wall: '#f0b77a', band: '#8a2f22', open: true, curtain: '#e6a0a8' });
  teach += person({ x: 810, y: 686, h: 30, pose: 'teach', robe: '#e0a53a', sash: '#8a2f2a' });
  teach += person({ x: 790, y: 706, h: 18, pose: 'kneel', robe: '#4b3a33' }) + person({ x: 836, y: 708, h: 18, pose: 'kneel', robe: '#c96a3a', dir: -1 }) + person({ x: 862, y: 700, h: 22, robe: '#3d8a6a', hairStyle: 'long', dir: -1 });
  g += part('wl_human_teaching', teach, [770, 580, 250, 140]);
  // the village and its monastery, behind a fence
  let village = '';
  village += building({ x: 1000, y: 716, w: 110, h: 50, wall: '#b8403a', band: '#6a1f1a', windows: [5, 1], curtain: '#f0d05a' });
  village += line([[900, 736], [1080, 736]], '#6b3a24', 3) + line([[900, 726], [1080, 726]], '#6b3a24', 2);
  for (let x = 904; x < 1080; x += 12) village += line([[x, 722], [x, 740]], '#6b3a24', 2.2);
  village += person({ x: 948, y: 744, h: 24, pose: 'carry', robe: '#8a3a2a', dir: -1, hairStyle: 'long' }) + person({ x: 970, y: 746, h: 16, pose: 'walk', robe: '#3a5fae' });
  village += pole(904, 742, 50) + flags(904, 692, 1000, 670);
  village += tree(1068, 690, 60, { leaf: '#3f9a67' });
  g += part('wl_human_village', village, [890, 620, 210, 130]);
  // the nomads' tent, prayer flags over it, and the herd
  let tent = '';
  tent += pole(772, 800, 50) + pole(846, 790, 46) + flags(772, 750, 846, 744);
  tent += path('M760 800L784 772L836 770L858 796Z', '#4d4d52', OUT + ' stroke-width="1.4"') + line([[784, 772], [790, 800]], '#2e2e33', 1.4) + line([[810, 771], [812, 798]], '#2e2e33', 1.4);
  tent += flame(806, 802, 10) + person({ x: 818, y: 802, h: 16, pose: 'kneel', robe: '#8a2f2a', dir: -1 });
  tent += person({ x: 872, y: 808, h: 20, pose: 'bent', robe: '#e6c7a0', hairStyle: 'long', dir: -1 }) + `<rect x="880" y="792" width="7" height="16" fill="#8a6a44" ${OUT} stroke-width="1"/>`;
  tent += beast({ x: 912, y: 822, l: 30, kind: 'pig', c: '#5a5d63' }) + beast({ x: 946, y: 830, l: 34, kind: 'yak', c: '#6a4a3a' }) + beast({ x: 980, y: 838, l: 30, kind: 'cow', c: '#b0a79c' });
  g += part('wl_human_nomads', tent, [750, 740, 260, 100]);
  // the ploughman with his pair
  let plough = '';
  plough += beast({ x: 1030, y: 800, l: 30, kind: 'cow', c: '#5a4032', dir: -1 }) + beast({ x: 1040, y: 808, l: 30, kind: 'cow', c: '#7a5a42', dir: -1 });
  plough += line([[1052, 790], [1076, 800]], '#6b4a33', 2) + person({ x: 1082, y: 812, h: 22, pose: 'bent', robe: '#8a5a3a', hat: 'brim', dir: -1 });
  g += part('wl_human_plough', plough, [1000, 770, 96, 50]);
  return g;
}
function reliefPretas() {
  let g = '';
  g += part('wl_muni_pretas', muni(1046, 868, 36, { skin: '#d9523e', robe: '#b9352b', halo: '#f0c0a0',
    prop: path('M12 -30L22 -30L20 -18L14 -18Z', '#e7b93a', OUT + ' stroke-width="1"') }), [1010, 800, 76, 80]);
  // the preta in its palace, and the heap it cannot eat
  let palace = '';
  palace += building({ x: 826, y: 930, w: 84, h: 56, wall: '#b8403a', band: '#6a1f1a', open: true, curtain: '#e6b44a', pillars: '#9a2a22' });
  palace += person({ x: 812, y: 926, h: 38, pose: 'sit', preta: true, skin: '#7a4a3a', hair: '#555', hairStyle: 'spiky' });
  palace += flame(832, 890, 10, { dir: 1 });
  palace += path('M852 930Q852 900 870 894Q888 900 888 930Z', '#efe3c8', OUT + ' stroke-width="1.2"');
  for (let i = 0; i < 12; i++) palace += circ(858 + (i % 4) * 8, 924 - Math.floor(i / 4) * 9, 3, '#f7f0dc', OUT + ' stroke-width=".6"');
  palace += person({ x: 894, y: 950, h: 20, pose: 'kneel', dir: -1, naked: true, skin: '#d9a88a', hairStyle: 'wild', hair: '#bdb8b0' }) + person({ x: 910, y: 952, h: 20, pose: 'kneel', dir: -1, naked: true, skin: '#e6b89a', hairStyle: 'long' });
  g += part('wl_preta_palace', palace, [780, 870, 140, 90]);
  // those whose mouths burn: fire from every mouth, bellies swollen
  let fire = '';
  const mouthFire = (x, y, dir) => `<g transform="translate(${x} ${y}) rotate(${dir > 0 ? 70 : -70})">${flame(0, 0, 9)}</g>`;
  [[904, 908, 1], [950, 912, -1], [1000, 902, 1], [1040, 930, -1]].forEach(([x, y, d]) => {
    fire += person({ x, y, h: 30, pose: 'stand', preta: true, dir: d, skin: '#e0a896', hair: '#6a6660', hairStyle: 'spiky' }) + mouthFire(x + d * 10, y - 26, d);
  });
  fire += person({ x: 966, y: 940, h: 30, pose: 'stand', preta: true, rot: -80, skin: '#f0c8a8', hair: '#6a6660', hairStyle: 'spiky' });
  fire += person({ x: 930, y: 950, h: 30, pose: 'stand', preta: true, rot: -84, skin: '#eab8a0', hair: '#6a6660', hairStyle: 'spiky' });
  fire += person({ x: 1010, y: 946, h: 26, pose: 'sit', preta: true, skin: '#e0a896', hair: '#6a6660', hairStyle: 'spiky' });
  fire += person({ x: 948, y: 930, h: 26, pose: 'up', preta: true, skin: '#f0c8a8', hair: '#6a6660', hairStyle: 'spiky' });
  g += part('wl_preta_fire', fire, [880, 860, 190, 100]);
  // the ones who are driven off: guards with clubs among the flames
  let beaten = '';
  beaten += tree(846, 1030, 60, { kind: 'dead', trunk: '#7a4a33' }) + flame(836, 1010, 14) + flame(856, 1000, 12);
  beaten += person({ x: 894, y: 1036, h: 30, pose: 'walk', preta: true, dir: 1, skin: '#eab8a0', hair: '#6a6660', hairStyle: 'spiky' });
  beaten += flames(880, 1100, 1060, 14, 91);
  beaten += person({ x: 1000, y: 1050, h: 30, pose: 'walk', preta: true, dir: 1, skin: '#b5806a', hair: '#6a6660', hairStyle: 'spiky' }) + person({ x: 1020, y: 1052, h: 30, pose: 'walk', preta: true, dir: 1, skin: '#d9a88a', hairStyle: 'long' });
  beaten += person({ x: 1058, y: 1056, h: 34, pose: 'up', naked: true, belly: 11, skin: '#f0c8b0', loin: '#e0b85a', dir: -1, hair: '#6a6660', hairStyle: 'spiky',
    prop: line([[-15, -104], [-26, -116]], '#6b4a33', 3) + line([[15, -104], [26, -116]], '#6b4a33', 3) });
  beaten += tree(1086, 1040, 50, { leaf: '#8cbf7a', leafHi: '#b5dca0' });
  g += part('wl_preta_beaten', beaten, [820, 960, 280, 110]);
  // the river they cannot drink from, and the bridge over it
  let river = '';
  river += crest(920, 1080, 14) + crest(980, 1100, 16) + crest(1050, 1120, 14) + crest(800, 1066, 12);
  river += path('M770 1062L852 1040L856 1052L774 1074Z', '#7b4a33', OUT + ' stroke-width="1.2"');
  for (let i = 0; i < 6; i++) river += line([[776 + i * 14, 1068 - i * 4], [776 + i * 14, 1052 - i * 4]], '#4d3a2a', 1.6);
  river += line([[776, 1052], [846, 1032]], '#4d3a2a', 1.8);
  g += part('wl_preta_river', river, [760, 1030, 340, 110]);
  return g;
}
/* the hot and cold hells: eight cells each, a torment in each cell */
export const HOT_CELLS = [
  ['wl_hell_sanjiva', 101, 111, 215, 320], ['wl_hell_kalasutra', 111, 121, 215, 320],
  ['wl_hell_samghata', 121, 131, 215, 320], ['wl_hell_raurava', 131, 141, 215, 320],
  ['wl_hell_maharaurava', 131, 141, 320, 428], ['wl_hell_tapana', 121, 131, 320, 428],
  ['wl_hell_pratapana', 111, 121, 320, 428], ['wl_hell_avichi', 101, 111, 320, 428]
];
export const COLD_CELLS = [
  ['wl_cold_arbuda', 73, 82, 250, 340], ['wl_cold_nirarbuda', 64, 73, 250, 340],
  ['wl_cold_atata', 55, 64, 250, 340], ['wl_cold_hahava', 46, 55, 250, 340],
  ['wl_cold_huhuva', 46, 55, 340, 428], ['wl_cold_utpala', 55, 64, 340, 428],
  ['wl_cold_padma', 64, 73, 340, 428], ['wl_cold_mahapadma', 73, 82, 340, 428]
];
function hotCell(id, a0, a1, r0, r1, i) {
  const [cx, cy] = pol((r0 + r1) / 2, (a0 + a1) / 2);
  let s = `<path d="${sector(r0, r1, a0, a1)}" fill="${i % 2 ? '#c63627' : '#d0452d'}"/>`;
  // the lattice of burning iron
  for (let k = 1; k < 4; k++) {
    const [x0, y0] = pol(r0 + (r1 - r0) * k / 4, a0), [x1, y1] = pol(r0 + (r1 - r0) * k / 4, a1);
    s += line([[x0, y0], [x1, y1]], '#3a1510', 1.6, 'opacity=".55"');
  }
  s += flames(cx - 34, cx + 34, cy + 30, 13, 100 + i) + flames(cx - 30, cx + 30, cy - 14, 10, 200 + i);
  const body = { naked: true, skin: '#f0b89a', hairStyle: 'short' };
  const demon = { naked: true, skin: '#2e3a6a', loin: K.tiger, hairStyle: 'wild', hair: '#e5482a' };
  switch (id) {
    case 'wl_hell_sanjiva':
      s += person({ ...body, x: cx - 10, y: cy + 10, h: 28, pose: 'strike', prop: line([[6, -104], [2, -124]], '#c9ccd4', 2.4) })
        + person({ ...body, x: cx + 12, y: cy + 10, h: 28, pose: 'strike', dir: -1, prop: line([[6, -104], [2, -124]], '#c9ccd4', 2.4) })
        + person({ ...body, x: cx, y: cy + 26, h: 26, rot: 90, skin: '#e8a88a' });
      break;
    case 'wl_hell_kalasutra':
      s += person({ ...body, x: cx - 16, y: cy + 16, h: 32, rot: -90 }) + line([[cx - 16, cy + 4], [cx + 16, cy + 4]], K.ink, 1.2) + line([[cx - 14, cy + 10], [cx + 14, cy + 10]], K.ink, 1.2);
      s += person({ ...demon, x: cx + 6, y: cy - 2, h: 26, pose: 'bent', dir: -1, prop: path('M22 -36L40 -30L38 -26L20 -32Z', '#c9ccd4') });
      break;
    case 'wl_hell_samghata':
      s += path(`M${cx - 36} ${cy + 24}L${cx - 20} ${cy - 20}Q${cx - 12} ${cy - 30} ${cx - 4} ${cy - 18}L${cx - 4} ${cy + 24}Z`, '#4a3a3a', OUT + ' stroke-width="1.2"')
        + path(`M${cx + 36} ${cy + 24}L${cx + 20} ${cy - 20}Q${cx + 12} ${cy - 30} ${cx + 4} ${cy - 18}L${cx + 4} ${cy + 24}Z`, '#4a3a3a', OUT + ' stroke-width="1.2"')
        + circ(cx - 16, cy - 16, 2, '#f5d060') + circ(cx + 16, cy - 16, 2, '#f5d060')
        + path(`M${cx - 20} ${cy - 22}q-10 -8 -4 -16q6 4 2 10`, 'none', 'stroke="#c9b89a" stroke-width="2.6" stroke-linecap="round"')
        + path(`M${cx + 20} ${cy - 22}q10 -8 4 -16q-6 4 -2 10`, 'none', 'stroke="#c9b89a" stroke-width="2.6" stroke-linecap="round"');
      s += person({ ...body, x: cx, y: cy + 22, h: 26, pose: 'up' });
      break;
    case 'wl_hell_raurava':
      s += building({ x: cx, y: cy + 22, w: 46, h: 34, wall: '#5a3a36', band: '#3a1a14', roof: 'flat', windows: [2, 1], curtain: '#e5482a' });
      s += flame(cx - 20, cy - 12, 14) + flame(cx + 18, cy - 14, 14);
      s += person({ ...body, x: cx + 26, y: cy + 26, h: 22, pose: 'up' });
      break;
    case 'wl_hell_maharaurava':
      s += building({ x: cx, y: cy + 24, w: 58, h: 40, wall: '#3a2a2a', band: '#2a1410', roof: 'flat', windows: [3, 1], curtain: '#e5482a' });
      s += `<rect x="${n1(cx - 22)}" y="${n1(cy - 8)}" width="44" height="28" fill="none" stroke="#6a4a44" stroke-width="3"/>`;
      s += flame(cx - 26, cy - 18, 16) + flame(cx, cy - 22, 18) + flame(cx + 26, cy - 18, 16);
      break;
    case 'wl_hell_tapana':
      s += line([[cx - 4, cy + 34], [cx + 2, cy - 30]], '#c9ccd4', 3) + person({ ...body, x: cx + 4, y: cy + 10, h: 30, pose: 'up', rot: 6 });
      s += person({ ...demon, x: cx - 20, y: cy + 30, h: 26, pose: 'strike', dir: 1 });
      break;
    case 'wl_hell_pratapana':
      s += path(`M${cx - 10} ${cy + 36}L${cx - 6} ${cy - 30}M${cx - 6} ${cy - 24}L${cx - 16} ${cy - 36}M${cx - 6} ${cy - 24}L${cx + 4} ${cy - 36}`, 'none', 'stroke="#c9ccd4" stroke-width="3" stroke-linecap="round"');
      s += person({ ...body, x: cx - 6, y: cy + 14, h: 30, pose: 'up' });
      s += person({ ...demon, x: cx + 18, y: cy + 32, h: 26, pose: 'strike', dir: -1 });
      break;
    case 'wl_hell_avichi':
      s += flames(cx - 40, cx + 40, cy + 20, 22, 300) + flames(cx - 36, cx + 36, cy - 6, 20, 301);
      for (let k = 0; k < 4; k++) s += person({ ...body, x: cx - 24 + k * 16, y: cy + 16 - (k % 2) * 16, h: 22, pose: 'up', skin: '#f6c8a0' });
      s += flames(cx - 36, cx + 36, cy + 34, 18, 302);
      break;
  }
  s += `<path d="${sector(r0, r1, a0, a1)}" fill="none" stroke="#2a0e0a" stroke-width="3.2" stroke-opacity=".7"/>`;
  return part(id, `<g clip-path="url(#${id}-clip)">${s}</g>`, sectorBox(r0, r1, a0, a1));
}
function coldCell(id, a0, a1, r0, r1, i) {
  const [cx, cy] = pol((r0 + r1) / 2, (a0 + a1) / 2);
  let s = '';
  const skin = ['#f1c9b2', '#e7b8b8', '#d9a8c0', '#c9a0c4', '#b89ac8', '#9ab4dc', '#e28a9a', '#c85a6a'][i];
  const n = 3 + (i % 2);
  for (let k = 0; k < n; k++) {
    const t = (k + 0.5) / n;
    const [x, y] = pol(r0 + 14 + (r1 - r0 - 28) * t, a0 + (a1 - a0) * (0.3 + 0.4 * ((k * 7) % 3) / 2));
    s += person({ x, y: y + 8, h: 22, pose: 'crouch', naked: true, skin, dir: k % 2 ? -1 : 1, hairStyle: 'short' });
    if (i >= 5) {
      // the flesh splits into petals: blue lotus, lotus, great lotus
      const petal = i === 5 ? '#6f8fd0' : i === 6 ? '#e06a7a' : '#b8323a';
      for (let q = 0; q < 5; q++) s += `<ellipse cx="${n1(x + Math.cos(q * 72 * D) * 6)}" cy="${n1(y - 8 + Math.sin(q * 72 * D) * 6)}" rx="3.2" ry="1.6" fill="${petal}" transform="rotate(${q * 72} ${n1(x + Math.cos(q * 72 * D) * 6)} ${n1(y - 8 + Math.sin(q * 72 * D) * 6)})" opacity=".9"/>`;
    } else if (i <= 1) {
      for (let q = 0; q < 4; q++) s += circ(x - 5 + q * 3.4, y - 10 + (q % 2) * 5, 1.8, i === 0 ? '#f6e0e0' : '#e3a0a8', OUT + ' stroke-width=".5"');
    }
  }
  s += `<path d="${sector(r0, r1, a0, a1)}" fill="none" stroke="#7f9fc4" stroke-width="2.4" stroke-opacity=".8"/>`;
  return part(id, `<g clip-path="url(#${id}-clip)">${s}</g>`, sectorBox(r0, r1, a0, a1));
}
function reliefHells() {
  let g = '';
  g += HOT_CELLS.map(([id, a0, a1, r0, r1], i) => hotCell(id, a0, a1, r0, r1, i)).join('');
  g += COLD_CELLS.map(([id, a0, a1, r0, r1], i) => coldCell(id, a0, a1, r0, r1, i)).join('');
  // the sage of the hells on his cloud, near the hub
  g += part('wl_muni_hells', muni(590, 1012, 38, { skin: '#34406a', robe: '#b9352b', halo: '#e8a0a4',
    prop: flame(-14, -22, 10) + path('M12 -30Q20 -22 12 -16', 'none', 'stroke="#6aaae0" stroke-width="3" stroke-linecap="round"') }), [550, 944, 80, 84]);
  // Yama the judge in his palace, with the mirror
  let judge = '';
  judge += building({ x: 660, y: 1090, w: 104, h: 76, wall: '#e7b93a', band: '#8a2f22', roofH: 20, open: true, curtain: '#b9352b', pillars: '#e7b93a' });
  judge += path('M630 1090L690 1090L694 1100L626 1100Z', '#e87a88', OUT + ' stroke-width="1"');
  judge += person({ x: 660, y: 1082, h: 58, pose: 'sit', robe: '#3a5fae', sash: '#c9422e', skin: '#2d3560', hairStyle: 'wild', hair: '#e5482a' });
  judge += line([[680, 1070], [684, 1082]], '#e7b93a', 2.4) + circ(680, 1064, 8, '#e7b93a', OUT + ' stroke-width="1.2"') + circ(680, 1064, 6, '#f4f6f8') + circ(678, 1062, 1.8, '#ffffff');
  judge += flame(652, 1016, 12) + flame(668, 1014, 12, { dir: -1 });
  g += part('wl_hell_judge', judge, [604, 994, 112, 108]);
  // the white god and the black demon, born with each being, counting
  let pebbles = '';
  pebbles += person({ x: 624, y: 1128, h: 22, pose: 'sit', robe: '#f6f4ef', skin: '#f6f0e8' }) + person({ x: 700, y: 1128, h: 22, pose: 'sit', robe: '#2a2a2e', skin: '#2a2a2e', hairStyle: 'wild', hair: '#1a1a1a' });
  for (let k = 0; k < 5; k++) pebbles += circ(636 + k * 3.6, 1130, 1.8, '#ffffff', OUT + ' stroke-width=".5"') + circ(684 + k * 3.6, 1130, 1.8, '#111111');
  g += part('wl_hell_pebbles', pebbles, [610, 1100, 104, 34]);
  // his attendants, and the dead brought before him
  let court = '';
  court += person({ x: 600, y: 1098, h: 30, pose: 'strike', naked: true, skin: '#6a8a5a', loin: K.tiger, dir: 1, hairStyle: 'wild', hair: '#e5482a' });
  court += person({ x: 720, y: 1098, h: 30, pose: 'offer', naked: true, skin: '#9a6a4a', loin: K.tiger, dir: -1, hairStyle: 'wild', hair: '#444',
    prop: `<rect x="14" y="-66" width="10" height="14" fill="#f6f0e0" ${OUT} stroke-width=".8"/>` });
  [[744, 1104], [756, 1106], [768, 1108], [780, 1110]].forEach(([x, y], i) => { court += person({ x, y, h: 24, naked: true, skin: ['#f0c8b0', '#e6b89a', '#d9a88a', '#f6d0b8'][i], dir: -1, pose: i ? 'stand' : 'pray', hairStyle: i % 2 ? 'long' : 'short' }); });
  g += part('wl_hell_court', court, [586, 1060, 204, 56]);
  // the executions below the court: the rack, the iron pillar, the saw, the cauldron
  let torment = '';
  torment += line([[594, 1150], [594, 1196]], '#3a2a22', 2.6) + line([[636, 1150], [636, 1196]], '#3a2a22', 2.6);
  torment += person({ x: 604, y: 1198, h: 40, pose: 'up', naked: true, skin: '#f0c0a6' }) + person({ x: 628, y: 1198, h: 40, pose: 'up', naked: true, skin: '#e8b294' });
  torment += `<rect x="652" y="1146" width="12" height="66" fill="#3a5fae" ${OUT} stroke-width="1.2"/>` + flame(658, 1150, 14) + flame(652, 1180, 10) + flame(666, 1196, 10);
  torment += person({ x: 700, y: 1196, h: 28, rot: -90, naked: true, skin: '#f0c8a8' }) + person({ x: 700, y: 1182, h: 30, pose: 'bent', naked: true, skin: '#2e3a6a', loin: K.tiger, dir: -1, hairStyle: 'wild', hair: '#e5482a',
    prop: path('M20 -38L42 -30L40 -26L18 -34Z', '#c9ccd4') });
  torment += person({ x: 738, y: 1222, h: 34, pose: 'up', naked: true, skin: '#2e3a6a', loin: K.tiger, hairStyle: 'wild', hair: '#e5482a' }) + person({ x: 738, y: 1180, h: 26, rot: -90, naked: true, skin: '#f0c8a8' });
  g += part('wl_hell_torments', torment, [580, 1140, 180, 90]);
  let cauldron = '';
  cauldron += flames(596, 726, 1296, 16, 700);
  cauldron += path('M600 1252Q600 1296 662 1298Q724 1296 724 1252Z', '#27304a', OUT + ' stroke-width="1.8"');
  cauldron += ell(662, 1252, 64, 12, '#3a4460', OUT + ' stroke-width="1.6"') + ell(662, 1252, 56, 8, '#c86a3a');
  for (let k = 0; k < 7; k++) cauldron += circ(616 + k * 15, 1249 + (k % 2) * 3, 5, k % 3 ? '#f4c8a8' : '#f6f2ea', OUT + ' stroke-width=".8"');
  cauldron += person({ x: 624, y: 1256, h: 26, rot: -30, naked: true, skin: '#f0c0a6' });
  cauldron += beast({ x: 740, y: 1290, l: 26, kind: 'dog', c: '#f4f1ea', dir: -1 });
  g += part('wl_hell_cauldron', cauldron, [590, 1220, 170, 84]);
  // the neighbouring hells: embers, the swamp of corpses, the tree of blades
  let near = '';
  near += path('M540 1240Q560 1224 586 1232Q598 1260 584 1284Q556 1296 538 1276Z', '#6a5a2a', OUT + ' stroke-width="1.2"');
  for (let k = 0; k < 5; k++) near += path(`M${544 + k * 8} ${1244 + k * 8}q8 -4 16 0`, 'none', 'stroke="#8a7a3a" stroke-width="1.6"') + circ(550 + (k * 13) % 34, 1250 + k * 7, 3.6, '#e6b89a', OUT + ' stroke-width=".6"');
  near += tree(770, 1236, 70, { leaf: '#3a8a5a', leafHi: '#6ab888' }) + person({ x: 772, y: 1200, h: 20, pose: 'reach', naked: true, skin: '#f0c8a8' });
  for (let k = 0; k < 8; k++) near += path(`M${748 + k * 6} ${1180 + (k % 3) * 8}l3 -6l2 6z`, '#c9ccd4');
  near += stupa(760, 1140, 22) + path('M772 1146Q796 1134 808 1150Q796 1160 776 1154Z', '#e6a0a8') + person({ x: 784, y: 1150, h: 18, rot: -90, naked: true, skin: '#f0c8a8' });
  g += part('wl_hell_neighbouring', near, [534, 1170, 290, 130]);
  // the ephemeral hells: beings caught in a rock, a pillar, a tree
  let brief = '';
  brief += path('M714 1000Q728 984 748 992Q758 1010 746 1024Q726 1030 714 1016Z', '#8a8078', OUT + ' stroke-width="1.2"') + circ(733, 1004, 5, '#f0c8a8', OUT + ' stroke-width=".8"');
  brief += `<rect x="752" y="1018" width="9" height="30" fill="#9a6a44" ${OUT} stroke-width="1"/>` + circ(756.5, 1026, 3.8, '#f0c8a8', OUT + ' stroke-width=".8"');
  brief += path('M726 1040Q738 1030 750 1040L748 1052L728 1052Z', '#b0a898', OUT + ' stroke-width="1"') + circ(738, 1044, 3.4, '#f0c8a8');
  g += part('wl_hell_ephemeral', brief, [710, 982, 56, 72]);
  return g;
}
function reliefAnimals() {
  let g = '';
  g += part('wl_muni_animals', muni(282, 868, 36, { skin: '#3a5fae', robe: '#c9422e', halo: '#e89aa2',
    prop: `<rect x="-8" y="-30" width="16" height="7" fill="#f0e6c8" ${OUT} stroke-width=".8"/>` }), [246, 800, 76, 80]);
  g += cloud(330, 870, 60, { fill: '#f2e6ec', edge: '#b894a4', tail: false });
  let land = '';
  land += tree(488, 860, 46, { kind: 'cypress', leaf: '#4a9a6a' }) + tree(512, 864, 50, { kind: 'cypress', leaf: '#3a8a5a' }) + tree(536, 870, 44, { kind: 'cypress', leaf: '#4a9a6a' });
  land += beast({ x: 380, y: 896, l: 30, kind: 'deer', c: '#e0b08a' }) + beast({ x: 410, y: 892, l: 26, kind: 'deer', c: '#e8c09a' }) + beast({ x: 350, y: 904, l: 22, kind: 'deer', c: '#d9a07a', dir: -1 });
  land += beast({ x: 470, y: 922, l: 36, kind: 'deer', c: '#c8573a' }) + beast({ x: 506, y: 924, l: 34, kind: 'deer', c: '#d8683a', dir: -1 }) + beast({ x: 432, y: 928, l: 28, kind: 'fox', c: '#c9c2b8' });
  land += beast({ x: 276, y: 956, l: 50, kind: 'elephant', c: '#9097a0' }) + beast({ x: 330, y: 960, l: 40, kind: 'camel', c: '#c8a070' });
  land += beast({ x: 372, y: 968, l: 36, kind: 'horse', c: '#f4efe6', c2: '#c9c2b0' }) + beast({ x: 404, y: 972, l: 34, kind: 'horse', c: '#c8453a', c2: '#7a2a22', dir: -1 });
  land += beast({ x: 460, y: 972, l: 38, kind: 'yak', c: '#8a8f96' }) + beast({ x: 510, y: 968, l: 38, kind: 'cow', c: '#9aa0a6', dir: -1 });
  g += part('wl_animals_land', land, [240, 840, 320, 140]);
  let sea = '';
  sea += beast({ x: 278, y: 1022, l: 40, kind: 'cow', c: '#c9955a' }) + crest(300, 1030, 14);
  sea += `<g transform="translate(372 1040)">${path('M-24 0Q-30 -24 -6 -30Q14 -34 22 -18L34 -26L30 -10Q24 6 0 6Q-16 6 -24 0Z', '#c8453a', OUT + ' stroke-width="1.4"')}${path('M-18 -24Q-24 -40 -10 -44M-4 -30Q-2 -46 10 -44', 'none', 'stroke="#e7a23a" stroke-width="3" stroke-linecap="round"')}${circ(8, -20, 2.4, '#f6f0e0')}</g>`;
  sea += beast({ x: 440, y: 1020, l: 34, kind: 'dog', c: '#c9955a', dir: -1 }) + crest(420, 1030, 12);
  sea += beast({ x: 330, y: 1086, l: 44, kind: 'horse', c: '#5fb0b8', c2: '#3a8a90' }) + crest(356, 1090, 14);
  sea += beast({ x: 440, y: 1070, l: 24, kind: 'fish', c: '#e7a23a' }) + beast({ x: 470, y: 1100, l: 22, kind: 'fish', c: '#c9422e', dir: -1 }) + beast({ x: 400, y: 1116, l: 18, kind: 'fish', c: '#f0d05a' });
  sea += bird({ x: 312, y: 1128, l: 26, kind: 'swan' }) + bird({ x: 336, y: 1130, l: 24, kind: 'swan' });
  g += part('wl_animals_sea', sea, [250, 990, 280, 150]);
  return g;
}
/* the paths of karma: the white half rising, the black half falling */
function reliefKarma() {
  let g = '';
  let up = '';
  up += person({ x: 628, y: 776, h: 30, pose: 'reach', robe: '#b9352b', hat: 'lama', dir: 1 }) + person({ x: 610, y: 786, h: 24, pose: 'up', robe: '#d96a2a', dir: 1, hairStyle: 'none' });
  [[584, 814, '#7b2723', 'brim'], [572, 846, '#b9352b', null, 'long'], [570, 878, '#8c8a3c', null, 'none'], [582, 910, '#3a5fae', null, 'short'], [604, 944, '#d96a2a', null, 'none']].forEach(([x, y, robe, hat, hs], i) => {
    up += person({ x, y, h: 24, pose: i === 4 ? 'pray' : 'walk', robe, hat: hat || undefined, dir: 1, hairStyle: hs || 'short' });
  });
  g += part('wl_karma_white', clipped('wl-karma-w', up), sectorBox(R.hubRim, R.karma, 90, 270));
  let down = '';
  down += person({ x: 716, y: 782, h: 26, pose: 'up', naked: true, skin: '#f0b8a8', rot: 110, hairStyle: 'long' });
  [[728, 824], [746, 836], [764, 850]].forEach(([x, y], i) => {
    down += person({ x, y, h: 52, pose: 'bound', naked: true, skin: ['#f0c0b0', '#e8b0a0', '#f4c8b8'][i], rot: 180, hairStyle: 'short' });
    down += path(`M${x - 5} ${y + 52}l5 12l5 -12z`, '#6a6e78', OUT + ' stroke-width="1"');
    down += line([[x - 5, y + 8], [x + 5, y + 14]], '#8a6a4a', 1.2) + line([[x - 5, y + 24], [x + 5, y + 30]], '#8a6a4a', 1.2) + line([[x - 5, y + 40], [x + 5, y + 46]], '#8a6a4a', 1.2);
  });
  down += path(open([[708, 792], [726, 820], [744, 834], [760, 848], [752, 930], [732, 950]]), 'none', 'stroke="#8a6a4a" stroke-width="1.4"');
  g += part('wl_karma_black', clipped('wl-karma-b', down), sectorBox(R.hubRim, R.karma, -90, 90));
  g += part('wl_karma_demon', clipped('wl-karma-b', person({ x: 716, y: 962, h: 30, pose: 'strike', naked: true, skin: '#2e3a6a', loin: K.tiger, dir: -1, hairStyle: 'wild', hair: '#e5482a' })), [690, 920, 50, 50]);
  return g;
}
/* the three animals at the hub, each with the next one's tail in its mouth */
function reliefHub() {
  let bird_ = '', snake = '', pig = '';
  // the bird: a rose-grey body, pale wings folded high, its tail fanned to the left
  bird_ += path('M614 846Q622 834 634 838L640 842Q636 852 626 856Q616 858 614 846Z', '#f6ece8', OUT + ' stroke-width="1.2"');
  bird_ += path('M632 850Q630 830 654 826Q676 822 690 828Q700 832 698 842Q690 856 666 858Q644 860 632 850Z', '#c98c90', OUT + ' stroke-width="1.6"');
  bird_ += path('M640 842Q642 818 668 814Q688 812 696 818Q680 820 674 830Q664 842 640 842Z', '#f6ece8', OUT + ' stroke-width="1.4"');
  bird_ += path('M648 836Q660 824 676 822M654 840Q666 830 680 828', 'none', 'stroke="#c9b0ac" stroke-width="1.2"');
  bird_ += circ(698, 830, 7.5, '#a8646a', OUT + ' stroke-width="1.4"') + circ(700, 828, 1.4, K.ink);
  bird_ += path('M704 830L714 834L704 836Z', '#e7a23a', OUT + ' stroke-width=".8"');
  bird_ += line([[662, 858], [660, 864]], '#b06a4a', 1.6) + line([[672, 857], [672, 863]], '#b06a4a', 1.6);
  // the snake: green, banded, from the bird's beak to the pig's tail
  const coil = [[714, 836], [706, 848], [684, 852], [660, 862], [636, 866], [622, 874], [638, 880], [668, 874], [700, 878], [716, 890]];
  snake += path(open(coil), 'none', 'stroke="#243018" stroke-width="7.4" stroke-linecap="round"');
  snake += path(open(coil), 'none', 'stroke="#5f8a40" stroke-width="5" stroke-linecap="round"');
  snake += path(open(coil), 'none', 'stroke="#2e4a20" stroke-width="5" stroke-dasharray="2 5"');
  snake += ell(718, 893, 5, 3.4, '#4f7a36', OUT + ' stroke-width="1"') + circ(720, 892, 0.9, '#f6e060');
  // the pig: grey, heavy, facing left, its snout at the bird's tail
  pig += path('M624 886Q620 872 640 870Q670 866 694 874Q712 880 712 896Q708 910 684 912Q650 914 630 906Q618 898 624 886Z', '#8f949b', OUT + ' stroke-width="1.6"');
  pig += path('M628 880Q614 870 612 860L606 856Q604 850 610 850L618 852Q626 866 640 872Z', '#8f949b', OUT + ' stroke-width="1.3"');
  pig += ell(607, 853, 3.4, 4, '#b0a0a4', OUT + ' stroke-width=".8"') + circ(620, 862, 1.3, K.ink);
  pig += path('M626 868Q630 856 640 860Q638 870 630 872Z', '#e8a0a8', OUT + ' stroke-width="1"');
  pig += path('M644 886Q670 880 696 888', 'none', 'stroke="#aab0b6" stroke-width="2" opacity=".7"');
  pig += line([[640, 908], [638, 916]], '#7a7f86', 4) + line([[654, 910], [654, 918]], '#7a7f86', 4) + line([[690, 910], [692, 917]], '#7a7f86', 4) + line([[702, 906], [706, 913]], '#7a7f86', 4);
  pig += path('M712 890Q720 884 716 880', 'none', 'stroke="#8f949b" stroke-width="2" stroke-linecap="round"');
  return part('wl_hub', `<g clip-path="url(#wl-hub-clip)">${part('wl_hub_bird', bird_, [608, 810, 110, 56]) + part('wl_hub_snake', snake, [616, 830, 108, 68]) + part('wl_hub_pig', pig, [600, 846, 120, 74])}</g>`, [604, 810, 112, 112]);
}
/* the twelve scenes on the rim, upright whatever the angle of their panel */
function reliefBand() {
  const at = (i) => pol((R.band0 + R.band1) / 2, -75 + 30 * i);
  const sc = [];
  const skin = K.skin;
  sc[0] = (x, y) => building({ x: x - 50, y: y + 16, w: 26, h: 20, wall: '#f0b77a', band: '#8a2f22', roof: 'flat', windows: [1, 1], door: false })
    + person({ x: x - 16, y: y + 18, h: 24, pose: 'point', robe: '#6a4a33' })
    + person({ x: x + 22, y: y + 20, h: 24, pose: 'bent', robe: '#e0c8a0', hairStyle: 'none', skin: '#e6b89a',
      prop: line([[22, -36], [26, 0]], '#6b4a33', 2) + line([[-2, -86], [14, -86]], '#2a2020', 3) });
  sc[1] = (x, y) => tree(x - 14, y + 20, 44, { kind: 'dead', trunk: '#6a5a4a' }) + person({ x: x + 4, y: y + 16, h: 22, pose: 'sit', robe: '#e0a53a' })
    + ell(x + 16, y + 12, 7, 6, '#9a7a5a', OUT + ' stroke-width="1"') + `<rect x="${n1(x + 12)}" y="${n1(y + 16)}" width="10" height="3" fill="#6a4a33"/>`
    + ell(x - 22, y + 14, 6, 7, '#a0805a', OUT + ' stroke-width="1"') + ell(x - 30, y + 16, 5, 6, '#8a6a4a', OUT + ' stroke-width="1"');
  sc[2] = (x, y) => tree(x, y + 26, 58, { leaf: '#3a8a5a', leafHi: '#6ab888' })
    + `<g transform="${tr(x + 6, y - 2, 0.2)}">${circ(0, -30, 12, '#a07a52', OUT + ' stroke-width="4"')}${ell(0, -2, 12, 18, '#a07a52', OUT + ' stroke-width="4"')}${line([[10, -8], [28, -30]], '#a07a52', 7)}${line([[-8, 10], [-14, 30]], '#a07a52', 7)}${path('M-10 14Q-30 30 -20 44', 'none', 'stroke="#a07a52" stroke-width="4"')}${circ(4, -32, 7, '#e8c8a8')}</g>`;
  sc[3] = (x, y) => waves(x - 60, y + 4, x + 60, y + 40, { seed: 40, gap: 9 })
    + path(`M${x - 26} ${y + 6}L${x + 26} ${y + 6}L${x + 18} ${y + 16}L${x - 18} ${y + 16}Z`, '#8a5a3a', OUT + ' stroke-width="1.2"')
    + person({ x: x - 8, y: y + 8, h: 18, pose: 'sit', robe: '#b9352b' }) + person({ x: x + 8, y: y + 8, h: 18, pose: 'sit', robe: '#3a5fae' })
    + line([[x + 20, y - 6], [x + 30, y + 22]], '#6b4a33', 1.8);
  sc[4] = (x, y) => building({ x, y: y + 22, w: 34, h: 30, wall: '#e0876a', band: '#6a1f1a', roof: 'gold', roofH: 10, windows: [2, 2], door: true })
    + `<rect x="${n1(x + 18)}" y="${n1(y - 26)}" width="7" height="48" fill="#c9504a" ${OUT} stroke-width="1"/>`;
  sc[5] = (x, y) => person({ x: x - 4, y: y + 16, h: 24, pose: 'offer', robe: '#b9352b', hairStyle: 'long' }) + person({ x: x + 6, y: y + 16, h: 24, pose: 'offer', dir: -1, robe: '#3a5fae' })
    + tree(x - 30, y + 20, 40, { kind: 'dead', trunk: '#6a5a4a' });
  sc[6] = (x, y) => tree(x - 26, y + 22, 50, { kind: 'dead', trunk: '#6a5a4a' }) + person({ x: x + 6, y: y + 16, h: 22, pose: 'sit', robe: '#6a2a2a', skin: '#8a5a44' })
    + line([[x + 30, y - 2], [x + 10, y - 2]], '#6b4a33', 1.6) + path(`M${x + 12} ${y - 5}L${x + 6} ${y - 2}L${x + 12} ${y + 1}Z`, '#c9ccd4');
  sc[7] = (x, y) => building({ x: x - 30, y: y + 18, w: 30, h: 28, wall: '#d9503e', band: '#6a1f1a', roof: 'flat', windows: [1, 1] })
    + person({ x: x - 2, y: y + 18, h: 24, pose: 'offer', robe: '#3a5fae' }) + path(`M${x + 8} ${y - 4}L${x + 14} ${y - 4}L${x + 13} ${y + 3}L${x + 9} ${y + 3}Z`, '#b58a4a', OUT + ' stroke-width=".8"')
    + person({ x: x + 22, y: y + 18, h: 20, pose: 'sit', robe: '#8a5a3a', dir: -1 });
  sc[8] = (x, y) => tree(x + 4, y + 24, 54, { leaf: '#3a8a5a', leafHi: '#6ab888', fruit: '#e0553a' })
    + person({ x: x - 10, y: y + 22, h: 24, pose: 'reach', robe: '#8a2f2a' })
    + `<rect x="${n1(x - 30)}" y="${n1(y + 12)}" width="12" height="10" fill="#c98a4a" ${OUT} stroke-width="1"/>` + circ(x - 27, y + 11, 3, '#e0553a') + circ(x - 21, y + 11, 3, '#e0553a');
  sc[9] = (x, y) => person({ x, y: y + 18, h: 26, pose: 'walk', robe: '#c96a8a', belly: 1, hairStyle: 'long', dir: 1 })
    + ell(x + 6, y - 2, 7, 7, '#c96a8a', OUT + ' stroke-width="1"');
  sc[10] = (x, y) => path(`M${x - 30} ${y + 16}L${x + 30} ${y + 16}L${x + 26} ${y + 22}L${x - 26} ${y + 22}Z`, '#e6a0a8')
    + person({ x: x + 6, y: y + 16, h: 22, pose: 'squat', robe: '#e6c7a0', hairStyle: 'long' }) + person({ x: x - 10, y: y + 16, h: 22, pose: 'kneel', robe: '#8a2f2a', dir: 1 })
    + circ(x + 6, y + 18, 3.4, '#f4c8b0');
  sc[11] = (x, y) => stupa(x - 38, y + 18, 34) + person({ x: x + 4, y: y + 18, h: 24, pose: 'carry', robe: '#7a4a33', dir: -1 })
    + ell(x + 10, y - 2, 10, 6, '#f4f1ea', OUT + ' stroke-width="1"') + beast({ x: x + 34, y: y + 18, l: 20, kind: 'dog', c: '#8a6a4a', dir: -1 });
  let g = '';
  NIDANAS.forEach((id, i) => {
    const [x, y] = at(i);
    const [a0, a1] = nidanaSpan(i);
    g += part(id, clipped(id, sc[i](x, y)), sectorBox(R.band0, R.band1, a0, a1));
  });
  return g;
}
function drawRelief() {
  return `<g clip-path="url(#wl-realms-clip)">${reliefGods() + reliefAsuras() + reliefHumans() + reliefPretas() + reliefHells() + reliefAnimals()}</g>`
    + reliefKarma() + reliefHub() + reliefBand();
}

/* ═══════════════════════════════════════════════════════════════════════
   THE GOLD
   ═══════════════════════════════════════════════════════════════════════ */
function goldRing(r0, r1) {
  return path(ring(r0, r1), 'url(#wl-gold-r)', `fill-rule="evenodd" stroke="${K.goldInk}" stroke-width="1.4" stroke-opacity=".7"`)
    + `<circle cx="${C.x}" cy="${C.y}" r="${n1((r0 + r1) / 2 + (r1 - r0) * 0.18)}" fill="none" stroke="${K.goldHi}" stroke-width="${n1((r1 - r0) * 0.22)}" opacity=".55"/>`;
}
function spoke(a, r0, r1, w) {
  const [x0, y0] = pol(r0, a), [x1, y1] = pol(r1, a);
  const nx = -Math.sin(a * D) * w / 2, ny = Math.cos(a * D) * w / 2;
  return path(`M${n1(x0 + nx)} ${n1(y0 + ny)}L${n1(x1 + nx)} ${n1(y1 + ny)}L${n1(x1 - nx)} ${n1(y1 - ny)}L${n1(x0 - nx)} ${n1(y0 - ny)}Z`, 'url(#wl-gold-v)', `stroke="${K.goldInk}" stroke-width="1.2" stroke-opacity=".7"`)
    + line([[x0 + nx * 0.3, y0 + ny * 0.3], [x1 + nx * 0.3, y1 + ny * 0.3]], K.goldHi, n1(w * 0.25), 'opacity=".7"');
}
/* the gilt scroll at each end of a panel of the rim */
function scroll(a, r, side) {
  const [x, y] = pol(r, a);
  const rot = a + 90;
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${side} 1)">`
    + path('M0 -10Q9 -10 9 -2Q9 5 3 5Q-1 5 -1 1Q-1 -2 2 -2', 'none', `stroke="${K.gold}" stroke-width="3.6" stroke-linecap="round"`)
    + path('M0 10Q9 10 9 2', 'none', `stroke="${K.gold}" stroke-width="3.6" stroke-linecap="round"`) + '</g>';
}
function drawFrame() {
  let g = '';
  g += goldRing(R.band1, R.rim);
  g += goldRing(R.realm, R.band0);
  g += goldRing(R.karma, R.karmaRim);
  g += goldRing(R.hub, R.hubRim);
  // the line between the white and black halves
  g += line([[C.x, C.y - R.karma], [C.x, C.y - R.hubRim]], K.goldLo, 2) + line([[C.x, C.y + R.hubRim], [C.x, C.y + R.karma]], K.goldLo, 2);
  REALMS.forEach((r) => { g += spoke(r.a0, R.karmaRim - 2, R.realm + 2, 10); });
  NIDANAS.forEach((id, i) => {
    const [a0] = nidanaSpan(i);
    g += spoke(a0, R.band0 - 2, R.band1 + 2, 9);
    g += scroll(a0 + 2.4, R.band0 + 11, 1) + scroll(a0 + 2.4, R.band1 - 11, 1) + scroll(a0 - 2.4, R.band0 + 11, -1) + scroll(a0 - 2.4, R.band1 - 11, -1);
  });
  return part('wl_wheel', g, [C.x - R.rim, C.y - R.rim, 2 * R.rim, 2 * R.rim]);
}

/* ═══════════════════════════════════════════════════════════════════════
   YAMA, IN FRONT: HEAD, HANDS AND FEET
   ═══════════════════════════════════════════════════════════════════════ */
function skull(x, y, s) {
  const g = path('M-12 -2Q-13 -18 0 -19Q13 -18 12 -2Q12 6 7 8L6 13L-6 13L-7 8Q-12 6 -12 -2Z', K.bone, OUT + ' stroke-width="1.4"')
    + ell(-5, -4, 3.6, 4.2, '#3a2a2a') + ell(5, -4, 3.6, 4.2, '#3a2a2a') + path('M-1.5 3L0 0L1.5 3Z', '#3a2a2a')
    + circ(-5, -4, 1.4, '#c9442e') + circ(5, -4, 1.4, '#c9442e')
    + path('M-5 9L-5 13M-2 9L-2 13M1 9L1 13M4 9L4 13', 'none', 'stroke="#8a8070" stroke-width=".8"');
  return `<g transform="${tr(x, y, s / 26)}">${g}</g>`;
}
function goldFlame(x, y, s, dir = 1, rot = 0) {
  const g = path('M0 0C-6 -8 -4 -18 4 -24C2 -16 8 -14 6 -30C16 -20 16 -6 8 2Z', K.gold, OUT + ' stroke-width="1.2"')
    + path('M2 -2C0 -8 2 -14 6 -18C6 -12 10 -10 9 -20C13 -12 12 -4 6 0Z', '#f07a3a');
  return `<g transform="${tr(x, y, s / 30, rot, dir)}">${g}</g>`;
}
function drawFront() {
  let g = '';
  // his head, clamped over the top of the wheel
  let head = '';
  head += path('M470 250Q450 140 520 90Q590 50 660 52Q730 50 800 90Q870 140 850 250Q880 300 830 346L490 346Q440 300 470 250Z', 'url(#wl-yama-face)', OUT + ' stroke-width="2"');
  // ears and their great gold rings
  head += path('M468 220Q430 210 426 256Q430 300 474 300Z', K.yama, OUT + ' stroke-width="1.6"') + path('M852 220Q890 210 894 256Q890 300 846 300Z', K.yama, OUT + ' stroke-width="1.6"');
  head += `<circle cx="412" cy="366" r="30" fill="none" stroke="url(#wl-gold-v)" stroke-width="13"/><circle cx="412" cy="366" r="30" fill="none" stroke="${K.goldInk}" stroke-width="1.2" opacity=".6"/>`;
  head += `<circle cx="908" cy="366" r="30" fill="none" stroke="url(#wl-gold-v)" stroke-width="13"/><circle cx="908" cy="366" r="30" fill="none" stroke="${K.goldInk}" stroke-width="1.2" opacity=".6"/>`;
  head += line([[436, 300], [420, 336]], K.gold, 5) + line([[884, 300], [900, 336]], K.gold, 5);
  // the jewelled gold scrolls at his temples
  head += path('M330 250Q300 280 322 320Q352 340 380 310Q360 300 362 282Q370 260 400 262Z', K.gold, OUT + ' stroke-width="1.4"') + path('M990 250Q1020 280 998 320Q968 340 940 310Q960 300 958 282Q950 260 920 262Z', K.gold, OUT + ' stroke-width="1.4"');
  head += path('M350 290Q330 330 380 350Q420 360 440 330Q400 340 390 316Z', '#3a6fb0', OUT + ' stroke-width="1.2"') + path('M970 290Q990 330 940 350Q900 360 880 330Q920 340 930 316Z', '#3a6fb0', OUT + ' stroke-width="1.2"');
  head += goldFlame(338, 250, 36, -1, -30) + goldFlame(982, 250, 36, 1, 30);
  // brows of flame
  head += goldFlame(552, 196, 34, -1, -60) + goldFlame(592, 184, 30, -1, -40) + goldFlame(768, 196, 34, 1, 60) + goldFlame(728, 184, 30, 1, 40);
  // the eyes, bulging and bloodshot
  for (const [ex, dir] of [[575, -1], [745, 1]]) {
    head += ell(ex, 234, 36, 28, K.yamaLo) + ell(ex, 232, 30, 25, '#fbf6ee', OUT + ' stroke-width="1.8"');
    head += circ(ex + dir * -2, 234, 15, '#d7472f', OUT + ' stroke-width="1.2"') + circ(ex + dir * -2, 234, 7.5, '#1c1414') + circ(ex + dir * -2 - 3, 230, 2.4, '#ffffff');
    head += path(`M${ex - 32} 244Q${ex} 270 ${ex + 32} 244Q${ex} 262 ${ex - 32} 244Z`, '#e39aa6');
  }
  // the nose, broad and snarling
  head += path('M620 250Q628 226 660 226Q692 226 700 250Q716 262 708 284Q690 300 660 294Q630 300 612 284Q604 262 620 250Z', K.yamaHi, OUT + ' stroke-width="1.6"');
  head += ell(636, 284, 8, 5, K.yamaLo) + ell(684, 284, 8, 5, K.yamaLo);
  // cheeks
  head += circ(522, 290, 28, K.yamaHi, 'opacity=".5"') + circ(798, 290, 28, K.yamaHi, 'opacity=".5"');
  // the mouth: lips drawn back, a row of teeth and two fangs that bite into the rim
  head += path('M548 318Q600 300 660 306Q720 300 772 318Q760 346 660 348Q560 346 548 318Z', '#e38a98', OUT + ' stroke-width="1.6"');
  head += path('M572 322Q660 312 748 322L744 338Q660 344 576 338Z', '#fbf6ee', OUT + ' stroke-width="1"');
  for (let x = 588; x <= 732; x += 18) head += line([[x, 322], [x, 338]], '#c9c0b0', 0.8);
  head += path('M598 322L618 322L612 388Q607 396 603 388Z', '#fbf6ee', OUT + ' stroke-width="1.4"') + path('M702 322L722 322L717 388Q713 396 708 388Z', '#fbf6ee', OUT + ' stroke-width="1.4"');
  // the moustache and beard of flame, sweeping out from the mouth
  head += goldFlame(546, 318, 44, -1, -110) + goldFlame(774, 318, 44, 1, 110);
  head += goldFlame(506, 334, 40, -1, -130) + goldFlame(814, 334, 40, 1, 130);
  head += goldFlame(488, 300, 34, -1, -80) + goldFlame(832, 300, 34, 1, 80);
  g += part('wl_yama_head', head, [320, 50, 680, 330]);
  // the third eye
  g += part('wl_yama_eye', ell(660, 158, 12, 20, '#fbf6ee', OUT + ' stroke-width="1.6"') + circ(660, 160, 9, '#d7472f') + circ(660, 160, 4.5, '#1c1414') + path('M644 140Q660 132 676 140', 'none', `stroke="${K.gold}" stroke-width="3"`), [644, 134, 32, 46]);
  // the crown of five skulls, on its band of gold and pearl
  let crown = '';
  crown += path('M486 176Q560 96 660 92Q760 96 834 176L820 190Q750 124 660 122Q570 124 500 190Z', '#8a2f2a', OUT + ' stroke-width="1.4"');
  for (let k = 0; k < 7; k++) {
    const t = k / 6, x = 520 + t * 280, y = 200 - Math.sin(t * Math.PI) * 30;
    crown += path(`M${n1(x - 38)} ${n1(y - 26)}Q${n1(x)} ${n1(y + 8)} ${n1(x + 38)} ${n1(y - 26)}`, 'none', `stroke="${K.bone}" stroke-width="4" stroke-dasharray="1 5" stroke-linecap="round"`);
  }
  for (const [x, y, s] of [[546, 64, 46], [660, 42, 50], [774, 64, 46], [476, 152, 42], [844, 152, 42]]) {
    crown += path(`M${x - s * 0.55} ${y + s * 0.45}Q${x} ${y + s * 0.2} ${x + s * 0.55} ${y + s * 0.45}L${x + s * 0.4} ${y + s * 0.7}L${x - s * 0.4} ${y + s * 0.7}Z`, K.gold, OUT + ' stroke-width="1.2"');
    crown += goldFlame(x - s * 0.55, y + s * 0.5, s * 0.6, -1, -30) + goldFlame(x + s * 0.55, y + s * 0.5, s * 0.6, 1, 30);
    crown += skull(x, y, s);
  }
  crown += circ(660, 90, 9, '#6a9ad8', OUT + ' stroke-width="1"') + circ(646, 94, 6, '#6a9ad8', OUT + ' stroke-width="1"') + circ(674, 94, 6, '#6a9ad8', OUT + ' stroke-width="1"');
  g += part('wl_yama_crown', crown, [440, 10, 440, 190]);
  // the hands, gripping the rim: the forefinger raised, the other fingers
  // hooked over the gold with their long white claws
  const hand = (flip) => {
    let h = '';
    h += path('M-40 40Q-52 0 -36 -30Q-18 -52 8 -46Q30 -40 36 -12Q40 18 28 44Q6 64 -20 60Z', 'url(#wl-hand)', OUT + ' stroke-width="1.8"');
    // the forefinger and thumb, raised
    h += limb([[-14, -40], [-16, -76], [-12, -104]], K.hand, 15) + path('M-18 -104Q-14 -126 -4 -118Q-6 -110 -6 -102Z', K.bone, OUT + ' stroke-width="1.2"');
    h += limb([[-34, -14], [-54, -36], [-58, -58]], K.hand, 15) + path('M-64 -56Q-66 -78 -54 -72Q-54 -64 -52 -56Z', K.bone, OUT + ' stroke-width="1.2"');
    // three fingers over the rim, bent down at the last joint
    [[6, -40, 16], [22, -24, 15], [30, -2, 14]].forEach(([x0, y0, w], i) => {
      const kx = x0 + 34, ky = y0 - 10 + i * 2, tx = kx + 14, ty = ky + 26;
      h += limb([[x0, y0], [kx, ky], [tx, ty]], i === 1 ? K.handHi : K.hand, w);
      h += path(`M${tx - 6} ${ty + 2}Q${tx - 2} ${ty + 30} ${tx - 14} ${ty + 36}Q${tx - 6} ${ty + 22} ${tx - 8} ${ty + 4}Z`, K.bone, OUT + ' stroke-width="1.2"');
    });
    // the wrist and its gold cuff
    h += path('M-38 44Q-46 74 -40 110L6 114Q18 80 24 50Z', 'url(#wl-hand)', OUT + ' stroke-width="1.6"');
    h += path('M-44 86Q-14 76 18 86L16 104Q-12 94 -42 104Z', K.gold, OUT + ' stroke-width="1.2"') + rosette(-12, 92, 6);
    return `<g transform="${flip > 0 ? 'translate(214 500) rotate(-18)' : 'translate(1106 500) scale(-1 1) rotate(-18)'}">${h}</g>`;
  };
  g += part('wl_yama_hands', hand(1) + hand(-1), [140, 370, 1040, 260]);
  // the feet at the lower corners, toes turned out, claws on the toes
  const foot = (flip) => {
    let f = '';
    // the ankle rising to the gold cuff, and the foot turned out, toes to the edge
    f += path('M196 1196Q260 1188 326 1214Q352 1260 350 1330Q348 1410 326 1440Q296 1460 268 1432Q250 1400 214 1384Q160 1372 118 1356Q76 1338 74 1300Q76 1262 112 1246Q150 1234 176 1228Z', 'url(#wl-foot)', OUT + ' stroke-width="2"');
    f += path('M300 1300Q320 1360 300 1420', 'none', `stroke="${K.footLo}" stroke-width="3" opacity=".5"`);
    [[96, 1250, 17, -24], [80, 1280, 16, -10], [78, 1310, 15, 4], [86, 1338, 13, 18], [102, 1360, 11, 30]].forEach(([x, y, r, a]) => {
      f += `<ellipse cx="${x}" cy="${y}" rx="${r * 1.25}" ry="${r * 0.85}" transform="rotate(${a} ${x} ${y})" fill="${K.foot}" ${OUT} stroke-width="1.4"/>`;
      const cx = x - Math.cos(a * D) * r * 1.1, cy = y - Math.sin(a * D) * r * 1.1;
      f += `<path d="M${n1(cx)} ${n1(cy - r * 0.45)}Q${n1(cx - r * 1.3)} ${n1(cy - r * 0.2)} ${n1(cx - r * 1.2)} ${n1(cy + r * 0.9)}Q${n1(cx - r * 0.5)} ${n1(cy + r * 0.2)} ${n1(cx + r * 0.1)} ${n1(cy + r * 0.45)}Z" fill="${K.bone}" ${OUT} stroke-width="1"/>`;
    });
    f += path('M180 1188Q260 1172 338 1200L348 1240Q264 1212 186 1226Z', K.gold, OUT + ' stroke-width="1.6"') + rosette(262, 1206, 8);
    return flip > 0 ? f : `<g transform="translate(${ART_W} 0) scale(-1 1)">${f}</g>`;
  };
  g += part('wl_yama_feet', foot(1) + foot(-1), [60, 1180, 1200, 280]);
  return g;
}

/* ═══════════════════════════════════════════════════════════════════════
   THE WHOLE
   ═══════════════════════════════════════════════════════════════════════ */
function defs() {
  return `<radialGradient id="wl-wall" cx="${C.x}" cy="${C.y}" r="1400" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${K.wallHi}"/><stop offset=".55" stop-color="${K.wall}"/><stop offset="1" stop-color="${K.wallLo}"/></radialGradient>`
    + `<linearGradient id="wl-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe2f0"/><stop offset=".6" stop-color="${K.sky}"/><stop offset="1" stop-color="#f1f6f4"/></linearGradient>`
    + `<linearGradient id="wl-gold-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.goldHi}"/><stop offset=".5" stop-color="${K.gold}"/><stop offset="1" stop-color="${K.goldLo}"/></linearGradient>`
    + `<radialGradient id="wl-gold-r" cx="${C.x}" cy="${C.y - 200}" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${K.goldHi}"/><stop offset=".55" stop-color="${K.gold}"/><stop offset="1" stop-color="${K.goldLo}"/></radialGradient>`
    + `<radialGradient id="wl-hub" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#34599a"/><stop offset="1" stop-color="${K.hubLo}"/></radialGradient>`
    + `<radialGradient id="wl-yama-face" cx="660" cy="200" r="260" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${K.yamaHi}"/><stop offset=".7" stop-color="${K.yama}"/><stop offset="1" stop-color="${K.yamaLo}"/></radialGradient>`
    + `<linearGradient id="wl-yama-body" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${K.yamaLo}"/><stop offset=".15" stop-color="${K.yama}"/><stop offset=".85" stop-color="${K.yama}"/><stop offset="1" stop-color="${K.yamaLo}"/></linearGradient>`
    + `<linearGradient id="wl-yama-arm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${K.yamaHi}"/><stop offset="1" stop-color="${K.yamaLo}"/></linearGradient>`
    + `<linearGradient id="wl-hand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${K.handHi}"/><stop offset="1" stop-color="${K.handLo}"/></linearGradient>`
    + `<linearGradient id="wl-foot" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${K.footHi}"/><stop offset=".6" stop-color="${K.foot}"/><stop offset="1" stop-color="${K.footLo}"/></linearGradient>`
    + `<linearGradient id="wl-jade" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${K.jadeHi}"/><stop offset=".6" stop-color="${K.jade}"/><stop offset="1" stop-color="${K.jadeLo}"/></linearGradient>`
    + `<linearGradient id="wl-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${K.greenHi}"/><stop offset=".5" stop-color="${K.green}"/><stop offset="1" stop-color="${K.greenLo}"/></linearGradient>`
    + `<linearGradient id="wl-tiger" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a860"/><stop offset=".6" stop-color="${K.tiger}"/><stop offset="1" stop-color="${K.tigerLo}"/></linearGradient>`
    // the outlines round a part under the pointer and a part picked; their
    // widths are set by the view to stay the same on the screen at any zoom
    + '<filter id="wl-glow" x="-20%" y="-20%" width="140%" height="140%"><feMorphology class="wl-thick" in="SourceAlpha" operator="dilate" radius="3" result="d"/>'
    + '<feFlood flood-color="#ffe070"/><feComposite in2="d" operator="in" result="g"/><feGaussianBlur class="wl-soft" in="g" stdDeviation="1.6" result="gb"/>'
    + '<feMerge><feMergeNode in="gb"/><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + '<filter id="wl-hover" x="-20%" y="-20%" width="140%" height="140%"><feMorphology class="wl-thin" in="SourceAlpha" operator="dilate" radius="1.5" result="d"/>'
    + '<feFlood flood-color="#fffaf0" flood-opacity=".9"/><feComposite in2="d" operator="in" result="g"/>'
    + '<feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
    + clipDefs();
}
/* The whole drawing, as the layers the view stacks. Each layer's `depth` is in
   drawing units, and says how far that layer stands off the wall. */
export function drawWheel() {
  BOXES = new Map();
  const layers = [
    { name: 'wall', depth: 0, svg: drawWall() },
    { name: 'beyond', depth: 5, svg: drawBeyond() },
    { name: 'body', depth: 14, svg: drawBody() },
    { name: 'face', depth: 26, svg: drawFace() },
    { name: 'relief', depth: 31, svg: drawRelief() },
    { name: 'frame', depth: 36, svg: drawFrame() },
    { name: 'front', depth: 48, svg: drawFront() }
  ];
  return { width: ART_W, height: ART_H, defs: defs(), layers, boxes: BOXES };
}
