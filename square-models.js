/* The destinations of the game, built in three dimensions.
 *
 * On the printed board every square is a field: a ring, a cartouche, a flame
 * arch, a continent's outline, a palace. The board arrangement keeps those
 * paintings (rebirth-icons.js). In the world arrangement each square stands as
 * a small model instead, in the place its billboard used to hang: the field's
 * own outline becomes a frame, an aureole or the ground the thing stands on,
 * and what the board leaves for the eye to supply inside the frame — the
 * cauldron, the hungry ghost, the monk with his bowl, the vase of the first
 * empowerment, the Buddha under the tree — is built from the square's
 * description.
 *
 * Everything is procedural: a kit of parts (lotus seats, clouds, flames,
 * figures, stupa, vajra, bell, vase, wheel, pagoda, mountains, trees,
 * animals) and one recipe per square composing them. Nothing is downloaded.
 * Each model is merged into one mesh per material, so a destination costs a
 * handful of draw calls, and the models are only built the first time the
 * game is opened.
 *
 * A model is drawn in its own unit space: it stands on y = 0, is at most one
 * unit tall and one unit wide, faces +z, and is turned about its vertical axis
 * to face the camera. MODEL_UNIT scales one unit to the world.
 */

export const MODEL_UNIT = 0.14;      // × SUMMIT: one model unit in the world
export const MODEL_LIFT = 0.058;     // × SUMMIT: the model stands above the realm gem
export const VICTORY_SCALE = 2.6;    // Nirvana stands alone and is drawn larger

import { seatedSculpture, sculptureLotus } from './seated-sculpture.js';
import { humanFigure, POSES, sculptedHead, hairCap, clothFall, clothBand } from './human-figure.js';

const TAU = Math.PI * 2;
const PI = Math.PI;

/* ── palette ─────────────────────────────────────────────────────────────
   Pigments of the board's own paintings: cinnabar, lapis, gold, the white of
   the clouds. `e` is an emissive glow (flames, light); `glass` is seen
   through (the illusory body, the formless absorptions). */
const PALETTE = {
  gold:     { c: 0xe2b040, m: 0.45, r: 0.35 },
  brass:    { c: 0xc0913a, m: 0.40, r: 0.45 },
  red:      { c: 0xb52a2a, r: 0.55 },
  crimson:  { c: 0x8c1d24, r: 0.55 },
  maroon:   { c: 0x7a2a24, r: 0.85 },
  saffron:  { c: 0xd88a22, r: 0.75 },
  orange:   { c: 0xe2711d, r: 0.60 },
  blue:     { c: 0x2f57a8, r: 0.45, m: 0.10 },
  lapis:    { c: 0x22408a, r: 0.40, m: 0.15 },
  sky:      { c: 0x86a9d8, r: 0.60 },
  navy:     { c: 0x1b2448, r: 0.50 },
  white:    { c: 0xf3efe4, r: 0.60 },
  bone:     { c: 0xe7dcc0, r: 0.65 },
  cloud:    { c: 0xfbf8f2, r: 0.95 },
  shade:    { c: 0xb9c8df, r: 0.95 },
  slate:    { c: 0x6b7480, r: 0.70 },
  sage:     { c: 0x8a9a8e, r: 0.70 },
  iron:     { c: 0x3a3d44, r: 0.50, m: 0.40 },
  black:    { c: 0x18191d, r: 0.60 },
  green:    { c: 0x2f7d4f, r: 0.55 },
  leaf:     { c: 0x4c7c46, r: 0.85 },
  jade:     { c: 0x2f9a86, r: 0.40, m: 0.10 },
  pink:     { c: 0xf0c3cc, r: 0.65 },
  blush:    { c: 0xf8dfe3, r: 0.62 },
  rose:     { c: 0xd9707f, r: 0.60 },
  skin:     { c: 0xe1b48c, r: 0.70 },
  gilt:     { c: 0xe6b84a, r: 0.35, m: 0.45 },
  ash:      { c: 0xb9b4aa, r: 0.85 },
  ghost:    { c: 0x8c9fb0, r: 0.80 },
  /* the hungry ghosts' realm: the ash-grey skin of the starved, dry earth
     and its dust, the char of what has burned, water turned to pus */
  parched:  { c: 0x9a8b7e, r: 0.85 },
  dust:     { c: 0xa8916f, r: 0.95 },
  clay:     { c: 0x7b6248, r: 0.95 },
  char:     { c: 0x2e2621, r: 0.90 },
  pus:      { c: 0xb8a35c, r: 0.30 },
  umber:    { c: 0x4d3429, r: 0.90 },
  deep:     { c: 0x1f3d9c, r: 0.40, m: 0.10 },
  water:    { c: 0x3d86c2, r: 0.15, m: 0.10 },
  ice:      { c: 0xd6eef8, r: 0.15, m: 0.05 },
  earth:    { c: 0x8b6b47, r: 0.90 },
  fawn:     { c: 0xc58d4f, r: 0.80 },
  rock:     { c: 0x76695d, r: 0.90 },
  grass:    { c: 0x6f9a4a, r: 0.90 },
  wood:     { c: 0x6a4425, r: 0.85 },
  snow:     { c: 0xf7f8fa, r: 0.70 },
  silver:   { c: 0xe4e8ee, r: 0.30, m: 0.45 },
  fire:     { c: 0xd9361c, r: 0.60, e: 0xb3220e, ei: 0.9 },
  flame:    { c: 0xf07a1e, r: 0.60, e: 0xe0601a, ei: 0.9 },
  ember:    { c: 0xffc23a, r: 0.50, e: 0xffb020, ei: 1.0 },
  light:    { c: 0xfff4cf, r: 0.40, e: 0xffe9a8, ei: 0.9 },
  aura:     { c: 0xcfe6ff, r: 0.20, e: 0x9fc4ff, ei: 0.5, glass: 0.45 },
  glow:     { c: 0xfff0b8, r: 0.30, e: 0xffe28a, ei: 0.8, glass: 0.40 },
  mist:     { c: 0xe8f0ff, r: 0.40, e: 0xc8d8ff, ei: 0.3, glass: 0.22 },
  /* the small paints of a face */
  lip:      { c: 0xb3605a, r: 0.55 },
  brow:     { c: 0x2b1f1a, r: 0.80 },
  lash:     { c: 0x1a1412, r: 0.80 },
  eyewhite: { c: 0xf1ece2, r: 0.35 },
  coral:    { c: 0xd2563c, r: 0.45 },
  turquoise:{ c: 0x3fb3a8, r: 0.35 },
  hair:     { c: 0x1d2133, r: 0.55 }
};
export const PALETTE_KEYS = Object.keys(PALETTE);

/* Any paint followed by a tilde is the same pigment in shadow: the inside of
   a fold, the crease of a hem. Worked out once, from the paint itself. */
const SHADE = 0.68;
function paintOf(key) {
  if (PALETTE[key]) return PALETTE[key];
  if (key.endsWith('~') && PALETTE[key.slice(0, -1)]) {
    const base = PALETTE[key.slice(0, -1)];
    const c = base.c, k = SHADE;
    const shade = ((Math.round(((c >> 16) & 255) * k) << 16) | (Math.round(((c >> 8) & 255) * k) << 8) | Math.round((c & 255) * k));
    return (PALETTE[key] = { ...base, c: shade, r: Math.min(1, (base.r || 0.6) + 0.1) });
  }
  return null;
}

/* A paint's colour as the vertices carry it (linear), for parts painted
   vertex by vertex. */
const RGB = new Map();
function rgbOf(b, key) {
  if (!RGB.has(key)) { const c = new b.THREE.Color().setHex(paintOf(key).c); RGB.set(key, [c.r, c.g, c.b]); }
  return RGB.get(key);
}

/* Paints are baked into the vertices, so a model needs one draw call for each
   kind of surface it has rather than one for each colour: matte, metal (the
   gilt and the iron), glowing (fire and light, unlit) and seen-through. */
export const FINISHES = ['matte', 'metal', 'glow', 'glass'];
const finishOf = (p) => (p.glass ? 'glass' : p.e ? 'glow' : (p.m || 0) >= 0.4 ? 'metal' : 'matte');

/* A square nobody is on and nobody has asked about stands back, as its
   billboard used to: the same model, seen through. */
const FAINT = 0.38;
/* How much the square being visited glows in its own colours. */
const FOCUS_GLOW = 0.32;

/* Small deterministic randomness, so a mountain range is the same range every
   time the page is opened. */
function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Three-vectors as plain arrays, for the joints of a figure. */
const v3 = {
  add: (a, c) => [a[0] + c[0], a[1] + c[1], a[2] + c[2]],
  sub: (a, c) => [a[0] - c[0], a[1] - c[1], a[2] - c[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  cross: (a, c) => [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]]
};

/* ── the builder ─────────────────────────────────────────────────────────
   Parts are collected with their transforms and baked into one geometry per
   material when the model is finished. `at` nests a frame, so a figure or a
   lotus can be composed once and set down anywhere at any size. */
function makeBuilder(THREE, kit) {
  const parts = [];
  const stack = [new THREE.Matrix4()];
  const q = new THREE.Quaternion(), eu = new THREE.Euler();
  const pv = new THREE.Vector3(), sv = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  function local(p = [0, 0, 0], r = [0, 0, 0], s = 1) {
    eu.set(r[0] || 0, r[1] || 0, r[2] || 0, r[3] || 'XYZ');
    q.setFromEuler(eu);
    pv.set(p[0] || 0, p[1] || 0, p[2] || 0);
    if (typeof s === 'number') sv.set(s, s, s); else sv.set(s[0], s[1], s[2]);
    return new THREE.Matrix4().compose(pv, q, sv);
  }
  const b = {
    THREE, kit,
    put(geometry, key, p, r, s) {
      parts.push({ geometry, key, matrix: stack[stack.length - 1].clone().multiply(local(p, r, s)) });
      return b;
    },
    at(p, r, s, fn) {
      stack.push(stack[stack.length - 1].clone().multiply(local(p, r, s)));
      fn(b);
      stack.pop();
      return b;
    },
    /* A rod from a to c, tapering from radius ra to rc. */
    beam(key, a, c, ra, rc = ra) {
      const from = new THREE.Vector3(...a), to = new THREE.Vector3(...c);
      const length = from.distanceTo(to);
      if (length < 1e-6) return b;
      const dir = to.clone().sub(from).normalize();
      const m = new THREE.Matrix4().compose(
        from.clone().add(to).multiplyScalar(0.5),
        new THREE.Quaternion().setFromUnitVectors(up, dir),
        new THREE.Vector3(ra, length, ra));
      parts.push({ geometry: kit.taper(rc / ra), key, matrix: stack[stack.length - 1].clone().multiply(m) });
      return b;
    },
    /* An ellipsoid stretched from a to c, ra and rc thick across: a muscle,
       a muzzle, a neck. */
    blob(key, a, c, ra, rc = ra) {
      const from = new THREE.Vector3(...a), to = new THREE.Vector3(...c);
      const length = from.distanceTo(to);
      if (length < 1e-6) return b;
      const m = new THREE.Matrix4().compose(
        from.clone().add(to).multiplyScalar(0.5),
        new THREE.Quaternion().setFromUnitVectors(up, to.clone().sub(from).normalize()),
        new THREE.Vector3(ra, length / 2, rc));
      const small = Math.max(ra, rc, length / 2) * stack[stack.length - 1].getMaxScaleOnAxis() < 0.035;
      parts.push({ geometry: small ? kit.ball : kit.sphere, key, matrix: stack[stack.length - 1].clone().multiply(m) });
      return b;
    },
    /* An ellipsoid at p with radii r, turned by rot: the finer sphere where it
       will be seen at any size, the coarser where it is only a bead. */
    ell(key, p, r, rot = 0) {
      const radii = typeof r === 'number' ? [r, r, r] : r;
      const size = Math.max(...radii) * stack[stack.length - 1].getMaxScaleOnAxis();
      parts.push({ geometry: size < 0.012 ? kit.bead : size < 0.03 ? kit.ball : kit.sphere, key,
        matrix: stack[stack.length - 1].clone().multiply(local(p, rot || [0, 0, 0], radii)) });
      return b;
    },
    /* A part laid along a direction with its flat side to a normal: a hand,
       a foot, a petal. y runs along `along`, z towards `facing`. */
    orient(geometry, key, p, along, facing, scale) {
      const yv = new THREE.Vector3(...along).normalize();
      const xv = new THREE.Vector3().crossVectors(yv, new THREE.Vector3(...facing)).normalize();
      if (xv.lengthSq() < 1e-9) xv.set(1, 0, 0);
      const zv = new THREE.Vector3().crossVectors(xv, yv).normalize();
      const sc = typeof scale === 'number' ? [scale, scale, scale] : scale;
      const m = new THREE.Matrix4().makeBasis(xv.multiplyScalar(sc[0]), yv.multiplyScalar(sc[1]), zv.multiplyScalar(sc[2]));
      m.setPosition(p[0], p[1], p[2]);
      parts.push({ geometry: geometry || kit.ball, key, matrix: stack[stack.length - 1].clone().multiply(m) });
      return b;
    },
    /* How large one local unit is here, against the model's own unit. */
    scale() { return stack[stack.length - 1].getMaxScaleOnAxis(); },
    /* The paint of a key, for parts that are painted vertex by vertex. */
    paint: (key) => paintOf(key),
    /* A rod along a list of points. */
    path(key, points, r0, r1 = r0) {
      for (let i = 0; i < points.length - 1; i += 1) {
        const t0 = i / (points.length - 1), t1 = (i + 1) / (points.length - 1);
        b.beam(key, points[i], points[i + 1], r0 + (r1 - r0) * t0, r0 + (r1 - r0) * t1);
        if (i > 0) b.put(kit.ball, key, points[i], 0, r0 + (r1 - r0) * t0);
      }
      return b;
    },
    parts
  };
  return b;
}

/* Bake the collected parts: one indexed geometry per finish, each vertex
   carrying its paint's colour — or, for a part painted vertex by vertex (a
   face with its lips and brows, a robe with its folds), its own. The key
   still decides the finish. */
function bake(THREE, parts) {
  const bins = new Map();
  const p = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();
  const colour = new THREE.Color();
  for (const { geometry, key, matrix } of parts) {
    const paint = paintOf(key);
    if (!paint) throw new Error('No paint called ' + key);
    const finish = finishOf(paint);
    colour.setHex(paint.c);
    let bin = bins.get(finish);
    if (!bin) bins.set(finish, bin = { p: [], n: [], c: [], i: [] });
    const pos = geometry.attributes.position, nor = geometry.attributes.normal;
    const own = geometry.attributes.color || null;
    // a tinted part's own colours are light and shade on the paint, so one
    // petal serves for a lotus of any colour
    const tint = own && geometry.userData.tint;
    const base = bin.p.length / 3;
    nm.getNormalMatrix(matrix);
    const flip = matrix.determinant() < 0;
    for (let i = 0; i < pos.count; i += 1) {
      p.fromBufferAttribute(pos, i).applyMatrix4(matrix);
      n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
      bin.p.push(p.x, p.y, p.z);
      bin.n.push(n.x, n.y, n.z);
      if (tint) bin.c.push(Math.min(1, own.getX(i) * colour.r), Math.min(1, own.getY(i) * colour.g), Math.min(1, own.getZ(i) * colour.b));
      else if (own) bin.c.push(own.getX(i), own.getY(i), own.getZ(i));
      else bin.c.push(colour.r, colour.g, colour.b);
    }
    const index = geometry.index;
    const count = index ? index.count : pos.count;
    for (let t = 0; t + 2 < count; t += 3) {
      const a = index ? index.getX(t) : t;
      const c1 = index ? index.getX(t + 1) : t + 1;
      const c2 = index ? index.getX(t + 2) : t + 2;
      if (flip) bin.i.push(base + a, base + c2, base + c1);
      else bin.i.push(base + a, base + c1, base + c2);
    }
  }
  const out = new Map();
  for (const [key, bin] of bins) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(bin.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(bin.n, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(bin.c, 3));
    g.setIndex(bin.i);
    g.computeBoundingSphere();
    out.set(key, g);
  }
  return out;
}

/* ── shared geometry ─────────────────────────────────────────────────────
   Unit primitives, made once and transformed as they are baked. */
function makeKit(THREE) {
  const memo = new Map();
  const once = (key, make) => {
    if (!memo.has(key)) memo.set(key, make());
    return memo.get(key);
  };
  const v2 = (pts) => pts.map(([x, y]) => new THREE.Vector2(x, y));
  const lathe = (key, pts, segs = 20) => once('lathe:' + key, () => new THREE.LatheGeometry(v2(pts), segs));
  const kit = {
    once, lathe,
    sphere: new THREE.SphereGeometry(1, 14, 10),
    ball: new THREE.SphereGeometry(1, 8, 6),
    bead: new THREE.SphereGeometry(1, 6, 4),
    /* The smallest round thing worth drawing: a Buddha's curl, a pearl. */
    nub: new THREE.SphereGeometry(1, 5, 3),
    box: new THREE.BoxGeometry(1, 1, 1),
    cyl: new THREE.CylinderGeometry(1, 1, 1, 14),
    disc: new THREE.CylinderGeometry(1, 1, 1, 28),
    cone: new THREE.ConeGeometry(1, 1, 12),
    pyramid: new THREE.ConeGeometry(1, 1, 4).rotateY(PI / 4),
    octa: new THREE.OctahedronGeometry(1, 0),
    bowl: new THREE.SphereGeometry(1, 14, 6, 0, TAU, PI / 2, PI / 2),
    dome: new THREE.SphereGeometry(1, 14, 6, 0, TAU, 0, PI / 2),
    taper: (ratio) => {
      const k = Math.round(ratio * 20) / 20;
      return once('taper:' + k, () => new THREE.CylinderGeometry(k, 1, 1, 8));
    },
    /* A light ring for small ornaments: armlets, anklets, the rims of eyes. */
    ring: (tube) => once('ring:' + tube, () => new THREE.TorusGeometry(1, tube, 4, 14)),
    torus: (tube, arc = TAU) => once('torus:' + tube + ':' + arc,
      () => new THREE.TorusGeometry(1, tube, 6, Math.max(10, Math.round(32 * arc / TAU)), arc)),
    /* A tongue of flame, pointed at the top, one unit tall. */
    flame: lathe('flame', [[0, 0], [0.30, 0.06], [0.48, 0.20], [0.50, 0.36], [0.40, 0.55],
      [0.24, 0.74], [0.10, 0.90], [0, 1]], 10),
    /* The same tongue, coarser, for hair, brows and beards of flame. */
    flameLow: lathe('flame-low', [[0, 0], [0.42, 0.12], [0.46, 0.4], [0.22, 0.75], [0, 1]], 6),
    /* A lotus petal: a shallow, pointed spoon. */
    petal: lathe('petal', [[0, 0], [0.42, 0.10], [0.50, 0.35], [0.40, 0.65], [0.18, 0.90], [0, 1]], 8)
  };

  /* A lotus petal as the painters draw it: broad, cupped, bowing outward
     along its length to a point that flicks out at the tip, thicker at the
     root. Its base is at the origin, its length one unit along +y, its
     inner face towards +z. Tinted: lighter to the rim and the tip, a darker
     line down the middle, the back in shade. */
  kit.leaf = (fine) => once('leaf:' + (fine ? 1 : 0), () => {
    const rows = fine ? 7 : 4, half = fine ? 5 : 3;
    const cols = half * 2;
    const pos = [], col = [], idx = [];
    for (let i = 0; i <= rows; i += 1) {
      const t = i / rows;
      // full in the shoulders, closing to a short point
      const w = 0.44 * Math.pow(Math.sin(PI * Math.min(0.999, Math.pow(t, 0.8))), 0.55) * (1 - 0.1 * t) + 0.002;
      const bow = -0.14 * t * t - 0.07 * Math.max(0, (t - 0.8) / 0.2) ** 2;
      const th = 0.034 - 0.02 * t;
      for (let j = 0; j < cols; j += 1) {
        const front = j < half;
        const k = front ? j : cols - 1 - j;
        const u = -1 + 2 * k / (half - 1);
        const cup = 0.15 * u * u * Math.sin(PI * Math.min(1, t * 1.1));
        const z = cup + bow + (front ? th / 2 : -th / 2);
        pos.push(u * w, t, z);
        const rim = Math.pow(Math.abs(u), 1.6);
        // both faces are painted, deeper at the root and lighter to the rim
        const lit = (front ? 0.88 : 0.92) + 0.3 * rim + 0.14 * t - (front ? 0.14 : 0.08) * Math.exp(-u * u / 0.012) * Math.sin(PI * t);
        const c = lit * (t < 0.12 ? 0.85 + t * 1.25 : 1);
        col.push(c, c, c);
      }
    }
    const pole = (i, lift) => { pos.push(0, i / rows, lift); col.push(0.8, 0.8, 0.8); return pos.length / 3 - 1; };
    const p0 = pole(0, 0), p1 = pole(rows, -0.21);
    for (let i = 0; i < rows; i += 1) for (let j = 0; j < cols; j += 1) {
      const jn = (j + 1) % cols;
      const a = i * cols + j, bq = i * cols + jn, c = (i + 1) * cols + j, d = (i + 1) * cols + jn;
      idx.push(a, bq, c, bq, d, c);
    }
    for (let j = 0; j < cols; j += 1) {
      const jn = (j + 1) % cols;
      idx.push(p0, jn, j, p1, rows * cols + j, rows * cols + jn);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    g.userData.tint = true;
    return g;
  });

  /* A cushion: a unit cube with its edges and corners rounded soft, the top
     and bottom a little full. */
  kit.pillow = once('pillow', () => {
    const rows = 10, cols = 16, pos = [], idx = [];
    const sp = (w, m) => Math.sign(w) * Math.pow(Math.abs(w), m);
    for (let i = 0; i <= rows; i += 1) {
      const u = -PI / 2 + i / rows * PI;
      for (let j = 0; j < cols; j += 1) {
        const v = -PI + (j + 0.5) / cols * TAU;
        const x = sp(Math.cos(u), 0.32) * sp(Math.cos(v), 0.3), zz = sp(Math.cos(u), 0.32) * sp(Math.sin(v), 0.3);
        const yy = sp(Math.sin(u), 0.32) * (1 + 0.12 * (1 - x * x) * (1 - zz * zz));
        pos.push(x * 0.5, yy * 0.5, zz * 0.5);
      }
    }
    for (let i = 0; i < rows; i += 1) for (let j = 0; j < cols; j += 1) {
      const jn = (j + 1) % cols, a = i * cols + j, bq = i * cols + jn, c = (i + 1) * cols + j, d = (i + 1) * cols + jn;
      idx.push(a, c, bq, bq, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  });
  /* A boulder: a stone worn round, flat enough on top to sit on. */
  kit.boulder = (seed) => once('boulder:' + seed, () => {
    const g = new THREE.SphereGeometry(1, 12, 8);
    const pos = g.attributes.position, rnd = seeded(seed);
    const lumps = Array.from({ length: 5 }, () => [rnd() * TAU, rnd() * 2 - 1, 0.08 + rnd() * 0.1]);
    for (let i = 0; i < pos.count; i += 1) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      const a = Math.atan2(z, x);
      let r = 1;
      for (const [la, ly, h] of lumps) r += h * Math.exp(-((a - la) ** 2 + (y - ly) ** 2) * 3);
      x *= r; z *= r; y *= r;
      if (y > 0.5) y = 0.5 + (y - 0.5) * 0.25;
      if (y < -0.6) y = -0.6 + (y + 0.6) * 0.3;
      pos.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  });

  /* Frames: the field's outline extruded into a plaque, with a hole. The hole
     is the same outline drawn smaller about its own centre. */
  kit.frame = (key, outline, hole, depth = 0.05) => once('frame:' + key + ':' + hole + ':' + depth, () => {
    const pts = outline();
    const box = new THREE.Box2().setFromPoints(pts);
    const centre = box.getCenter(new THREE.Vector2());
    const shape = new THREE.Shape(pts);
    if (hole > 0) {
      const inner = pts.map((p) => p.clone().sub(centre).multiplyScalar(hole).add(centre));
      shape.holes.push(new THREE.Path(inner.reverse()));
    }
    const g = new THREE.ExtrudeGeometry(shape, {
      depth, bevelEnabled: true, bevelThickness: depth * 0.25, bevelSize: 0.008,
      bevelSegments: 1, curveSegments: 6
    });
    g.translate(0, 0, -depth / 2);
    return g;
  });
  /* A solid plaque of the same outline, for ground plates and slabs. */
  kit.slab = (key, outline, depth = 0.05) => kit.frame(key, outline, 0, depth);
  return kit;
}

/* ── outlines of the board's fields, in their own units ─────────────────── */
const OUTLINES = {
  ring: (THREE) => () => {
    const pts = [];
    for (let i = 0; i < 48; i += 1) pts.push(new THREE.Vector2(Math.cos(i / 48 * TAU) * 0.5, Math.sin(i / 48 * TAU) * 0.5));
    return pts;
  },
  /* The ogee cartouche of the disciples and the sutra stages: a flat foot,
     straight sides, two shoulders and a pointed crown. */
  arch: (THREE) => () => {
    const p = new THREE.Path();
    p.moveTo(-0.5, 0); p.lineTo(0.5, 0); p.lineTo(0.5, 0.36);
    p.bezierCurveTo(0.5, 0.60, 0.32, 0.70, 0.17, 0.66);
    p.bezierCurveTo(0.08, 0.72, 0.03, 0.82, 0, 0.92);
    p.bezierCurveTo(-0.03, 0.82, -0.08, 0.72, -0.17, 0.66);
    p.bezierCurveTo(-0.32, 0.70, -0.5, 0.60, -0.5, 0.36);
    p.lineTo(-0.5, 0);
    return p.getPoints(7).slice(0, -1);
  },
  /* The scalloped cloud of the Mahāyāna preparatory paths. */
  cloud: (THREE) => () => {
    const pts = [];
    for (let i = 0; i < 90; i += 1) {
      const a = i / 90 * TAU;
      const r = 1 + 0.09 * Math.pow(Math.abs(Math.sin(a * 5)), 0.6);
      pts.push(new THREE.Vector2(Math.cos(a) * 0.5 * r, Math.sin(a) * 0.29 * r));
    }
    return pts;
  },
  /* The lobed, four-pointed cartouche of the twelve acts. */
  quatrefoil: (THREE) => () => {
    const pts = [];
    for (let i = 0; i < 96; i += 1) {
      const a = i / 96 * TAU;
      const lobe = 0.80 + 0.12 * Math.abs(Math.sin(2 * a));
      const tip = 0.22 * Math.pow(Math.abs(Math.cos(2 * a)), 9);
      const r = lobe + tip;
      pts.push(new THREE.Vector2(Math.cos(a) * 0.5 * r, Math.sin(a) * 0.40 * r));
    }
    return pts;
  },
  /* The onion of the flame aureoles: round below, drawn up to a point. */
  onion: (THREE) => () => {
    const p = new THREE.Path();
    p.moveTo(-0.22, 0); p.lineTo(0.22, 0);
    p.bezierCurveTo(0.50, 0.04, 0.54, 0.40, 0.38, 0.60);
    p.bezierCurveTo(0.22, 0.78, 0.05, 0.84, 0, 1);
    p.bezierCurveTo(-0.05, 0.84, -0.22, 0.78, -0.38, 0.60);
    p.bezierCurveTo(-0.54, 0.40, -0.50, 0.04, -0.22, 0);
    return p.getPoints(7).slice(0, -1);
  },
  /* Jambudvīpa, narrow to the south. */
  trapezoid: (THREE) => () => [[-0.5, 0.5], [-0.24, -0.5], [0.24, -0.5], [0.5, 0.5]].map(([x, y]) => new THREE.Vector2(x, y)),
  halfmoon: (THREE) => () => {
    const pts = [new THREE.Vector2(-0.5, 0)];
    for (let i = 1; i < 32; i += 1) pts.push(new THREE.Vector2(Math.cos(PI - i / 32 * PI) * 0.5, -Math.sin(i / 32 * PI) * 0.5));
    pts.push(new THREE.Vector2(0.5, 0));
    return pts;
  },
  square: (THREE) => () => [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]].map(([x, y]) => new THREE.Vector2(x, y))
};

/* ── parts ───────────────────────────────────────────────────────────────── */

/* The field's outline standing behind the subject as an aureole, in the
   board's two colours: a broad band and a narrow inner rim. */
function aureole(b, kind, { y = 0.5, z = -0.17, w = 0.9, h = w, outer = 'red', inner = 'gold', band = 0.82, rim = 0.76 } = {}) {
  const { THREE } = b;
  const outline = OUTLINES[kind](THREE);
  b.put(b.kit.frame(kind, outline, band, 0.05), outer, [0, y, z], 0, [w, h, 1]);
  if (inner) b.put(b.kit.frame(kind + ':rim:' + band, () => outline().map((p) => p.multiplyScalar(band * 1.01)), rim / (band * 1.01), 0.05),
    inner, [0, y, z + 0.012], 0, [w, h, 1]);
}

/* The same outline lying flat, as the ground the subject stands on. */
function ground(b, kind, { y = 0, w = 0.9, d = w, floor = 'earth', rimKey = 'red', inner = 'gold' } = {}) {
  const { THREE } = b;
  const outline = OUTLINES[kind](THREE);
  b.put(b.kit.slab(kind, outline, 0.04), floor, [0, y + 0.02, 0], [-PI / 2, 0, 0], [w * 0.94, d * 0.94, 1]);
  b.put(b.kit.frame(kind, outline, 0.86, 0.05), rimKey, [0, y + 0.03, 0], [-PI / 2, 0, 0], [w, d, 1]);
  if (inner) b.put(b.kit.frame(kind + ':ground-rim', () => outline().map((p) => p.multiplyScalar(0.87)), 0.95, 0.05),
    inner, [0, y + 0.034, 0], [-PI / 2, 0, 0], [w, d, 1]);
}

/* A lotus seat, open upward, with an optional moon or sun disc on it. */
function lotus(b, { x = 0, z = 0, y = 0, r = 0.22, n = 10, key = 'pink', key2 = 'blush', disc = 'white', open = 0.55, tiers = 2, reflex = tiers >= 2 && open < 0.95 } = {}) {
  if (x || z) {
    let top = 0;
    b.at([x, 0, z], 0, 1, () => { top = lotus(b, { y, r, n, key, key2, disc, open, tiers, reflex }); });
    return top;
  }
  const shade = (k) => (paintOf(k).glass || paintOf(k).e ? k : k + '~');
  const fine = r * b.scale() > 0.15;
  const leaf = b.kit.leaf(fine);
  const glass = !!paintOf(key).glass;
  /* A lotus seat as it is cast and painted beneath a Buddha: a row of
     petals turned down over the base, a beaded rim, the upturned petals row
     within row, the seed head with its stamens, and the disc of the moon
     laid on it like a cushion. */
  const petal = (k, p, along, facing, len) => b.orient(leaf, k, p, along, facing, [len, len, len]);
  if (reflex) {
    if (!glass) b.put(b.kit.cyl, shade(key), [0, y + 0.022, 0], 0, [r * 0.52, 0.04, r * 0.52]);
    for (let i = 0; i < n; i += 1) {
      const a = (i + 0.25) / n * TAU, ca = Math.cos(a), sa = Math.sin(a);
      petal(key, [ca * r * 0.48, y + 0.05, sa * r * 0.48], v3.norm([ca, -0.2, sa]), v3.norm([ca * 0.2, 1, sa * 0.2]), r * 0.48);
    }
  }
  // the upturned petals, row within row, each row more upright than the
  // last: under a seat they spread low round it, their tips rising to frame
  // the one seated; an open flower cups them round its heart
  for (let t = 0; t < tiers; t += 1) {
    const count = n - t * 2, radius = r * (1 - t * 0.28), tilt = open + t * 0.35;
    const len = r * (reflex ? 0.6 - t * 0.12 : 0.64 * (1 - t * 0.12));
    const up = reflex ? 0.3 + t * 0.42 : Math.min(1.45, 0.15 + tilt * 0.9), cu = Math.cos(up), su = Math.sin(up);
    for (let i = 0; i < count; i += 1) {
      const a = (i + t * 0.5) / count * TAU, ca = Math.cos(a), sa = Math.sin(a);
      petal(t % 2 ? key2 : key, [ca * radius * 0.42, y + 0.03 + t * 0.028, sa * radius * 0.42],
        [ca * cu, su, sa * cu], [-ca * su, cu, -sa * su], len);
    }
  }
  // the rim between the rows, beaded in gold
  if (reflex && !glass) {
    b.put(b.kit.torus(0.16), 'gold', [0, y + 0.044, 0], [PI / 2, 0, 0], [r * 0.5, r * 0.5, 0.05]);
    if (fine) for (let i = 0; i < 26; i += 1) {
      const a = i / 26 * TAU;
      b.put(b.kit.nub, 'gold', [Math.cos(a) * r * 0.585, y + 0.044, Math.sin(a) * r * 0.585], 0, r * 0.022);
    }
  }
  // the seed head, ringed with stamens: gilt under a seat, the living
  // flower's own yellow in a blossom
  const pod = reflex ? 0.5 : 0.3;
  b.put(b.kit.cyl, reflex ? 'gold' : 'saffron', [0, y + 0.045, 0], 0, [r * pod, 0.05, r * pod]);
  for (let i = 0; i < (fine ? 18 : 12); i += 1) {
    const a = i / (fine ? 18 : 12) * TAU;
    b.put(b.kit.octa, 'saffron', [Math.cos(a) * r * (pod + 0.02), y + 0.068, Math.sin(a) * r * (pod + 0.02)], [0, a, 0.3], [0.007, 0.016, 0.007]);
  }
  if (disc) {
    // the moon, a cushion with a rounded edge
    const R = r * 0.6;
    b.put(b.kit.lathe('moon-disc', [[0, 0], [0.92, 0], [1, 0.3], [1, 0.7], [0.92, 1], [0, 1]], 28), disc, [0, y + 0.058, 0], 0, [R, 0.022, R]);
    b.put(b.kit.torus(0.08), shade(disc), [0, y + 0.069, 0], [PI / 2, 0, 0], [R * 1.005, R * 1.005, 0.1]);
  } else for (let i = 0; i < 7; i += 1) {
    const a = i / 7 * TAU, rr = i ? r * 0.28 : 0;
    b.ell('ember', [Math.cos(a) * rr, y + 0.071, Math.sin(a) * rr], [0.012, 0.006, 0.012]);
  }
  return y + 0.08;
}

/* A bank of cloud: white puffs over a blue-grey underside. */
function cloud(b, { x = 0, y = 0, z = 0, w = 0.6, h = 0.12, n = 6, key = 'cloud', under = 'shade', seed = 7, depth = 0.6 } = {}) {
  const rnd = seeded(seed);
  for (let i = 0; i < n; i += 1) {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const r = h * (0.65 + 0.45 * Math.sin(t * PI)) * (0.85 + rnd() * 0.3);
    const px = x - w / 2 + w * t, pz = z + (rnd() - 0.5) * h * depth;
    b.put(b.kit.ball, key, [px, y + r * 0.75, pz], 0, [r * 1.15, r, r]);
    b.put(b.kit.ball, under, [px, y + r * 0.35, pz + r * 0.1], 0, [r * 1.2, r * 0.55, r * 0.95]);
  }
}

/* One tongue of fire, layered red, orange and gold. */
function fire(b, { x = 0, y = 0, z = 0, h = 0.3, w = 0.16, lean = 0, keys = ['fire', 'flame', 'ember'] } = {}) {
  keys.forEach((key, i) => {
    const k = 1 - i * 0.28;
    b.put(b.kit.flame, key, [x, y, z + i * w * 0.18], [0, 0, lean], [w * k, h * k, w * k * 0.8]);
  });
}

/* Flames standing out from an arc: the fire aureole of the wrathful and of
   the bodies of a Buddha. */
function flameRing(b, { cx = 0, cy = 0.5, z = -0.18, R = 0.36, n = 11, from = -0.15, to = 1.15, h = 0.16, w = 0.11, keys = ['fire', 'flame'], ry = 1 } = {}) {
  for (let i = 0; i < n; i += 1) {
    const a = (from + (to - from) * i / (n - 1)) * PI;
    const key = keys[i % keys.length];
    b.put(b.kit.flame, key, [cx + Math.cos(a) * R, cy + Math.sin(a) * R * ry, z],
      [0, 0, a - PI / 2], [w, h * (0.8 + 0.3 * ((i * 7) % 3) / 2), w * 0.5]);
  }
}

/* ── figures ─────────────────────────────────────────────────────────────
   The people of the board — Buddhas, monks, yogis, bodhisattvas, a king's
   subject under the jambu tree — share one body, built the way the painted
   and cast figures are: a head with its face, a neck, chest and belly under
   the robe, shoulders, arms that bend at the elbow and end in hands that make
   the gesture, and, seated, the legs crossed with both soles turned up.

   They face +z. The figure's right is towards -x, so a Buddha touching the
   earth touches it on the viewer's left, as he does in every image of it.

   What a figure wears follows from what it is:
   - robe:  the monastic robe, over the left shoulder, the right shoulder and
            arm bare (Buddhas, monks, arhats, solitary buddhas, panditas);
   - bare:  the jewelled body of a bodhisattva or deity, or the bare body of
            an ascetic, with a lower garment and a scarf;
   - coat:  a lay coat closed over both shoulders, sleeves to the wrist. */

/* The head, drawn in its own units: one unit from chin to crown, centred on
   the middle of the face. `style` is the hair: buddha, shaved, crown, bun,
   hat, bonhat, dread, flame. */
function head(b, { skin = 'skin', style = 'shaved', hair = null, eyes = 'down', ears = null, mouth = 'calm' } = {}) {
  const long = ears === 'long' || (ears === null && (style === 'buddha' || style === 'crown'));
  const detail = b.scale() > 0.05 ? 1 : 0;
  sculptedHead(b, { skin, eyes, mouth, long, scalp: style === 'shaved' && !paintOf(skin).glass, detail });
  hairOf(b, style, hair, detail);
}

/* The hair, in the head's units: the Buddha's curls and uṣṇīṣa, the crown
   and topknot of the gods, a layman's bun, the pandita's and the Bönpo's
   hats, the yogi's locks, hair of flame, hair in disorder. Every head of it
   is a cap over the skull that begins on the one hairline (`hairCap`), so
   every forehead is of a height, a little under a third of the face. */
function hairOf(b, style, hair, detail = 1) {
  const k = b.kit;
  const fine = detail > 0.5, tiny = detail < -0.5;
  const hairKey = hair || (style === 'buddha' ? 'lapis' : style === 'crown' ? 'hair' : style === 'dread' ? 'earth' : 'black');
  const cap = (thick, shape = null) => hairCap(b, hairKey, { thick, shape, rows: tiny ? 5 : fine ? 9 : 7, cols: tiny ? 14 : fine ? 34 : 22 });
  if (style === 'crown') for (const x of [-1, 1]) b.ell('gold', [x * 0.335, -0.31, -0.04], 0.05);
  if (style === 'buddha') {
    b.ell('white', [0, 0.158, 0.345], 0.02);                    // the ūrṇā
    const at = cap(0.02);
    /* The curls: tight snail shells, each turning to the right, set close
       in rings from the hairline to the crown as the founders set them, and
       over the uṣṇīṣa. */
    const rings = tiny ? 2 : fine ? 7 : 5, spacing = tiny ? 0.16 : fine ? 0.07 : 0.1;
    const curl = (p, n, r) => b.orient(k.nub, hairKey, v3.add(p, v3.mul(n, r * 0.3)), n, [n[1], -n[0], 0.3], [r, r * 0.6, r]);
    for (let j = 0; j < rings; j += 1) {
      const s = 0.06 + j / rings * 0.78;
      let around = 0, last = at(s, 0).p;
      for (let i = 1; i <= 24; i += 1) { const p = at(s, i / 24 * TAU).p; around += Math.hypot(...v3.sub(p, last)); last = p; }
      const count = Math.max(6, Math.round(around / spacing));
      for (let i = 0; i < count; i += 1) {
        const { p, n } = at(s, (i + (j % 2) * 0.5) / count * TAU);
        curl(p, n, spacing * 0.53);
      }
    }
    // the uṣṇīṣa on the crown, curled like the rest, and the jewel on it
    const top = at(1, 0).p;
    // a broad low dome rising out of the crown
    const ush = k.lathe('usnisa', [[0, 0], [0.21, 0], [0.215, 0.035], [0.2, 0.085], [0.165, 0.135], [0.1, 0.175], [0, 0.19]], fine ? 18 : 12);
    b.put(ush, hairKey, [0, top[1] - 0.045, top[2] - 0.01]);
    if (!tiny) for (const [rr, yy, n] of fine ? [[0.2, 0.045, 20], [0.17, 0.1, 16], [0.12, 0.145, 11], [0.055, 0.175, 5]] : [[0.19, 0.06, 13], [0.12, 0.14, 8]]) {
      for (let i = 0; i < n; i += 1) {
        const a = (i + yy * 10) / n * TAU;
        const nrm = v3.norm([Math.sin(a), 0.6 + yy * 3.5, Math.cos(a)]);
        curl([Math.sin(a) * rr, top[1] - 0.045 + yy, top[2] - 0.01 + Math.cos(a) * rr], nrm, spacing * 0.5);
      }
    }
    b.ell('gold', [0, top[1] + 0.16, top[2] - 0.01], [0.03, 0.045, 0.03]);
    b.put(k.flame, 'ember', [0, top[1] + 0.19, top[2] - 0.01], 0, [0.02, 0.06, 0.02]);
  } else if (style === 'crown') {
    // the hair combed up from the forehead into the high topknot
    cap(0.032, (s) => 0.03 * Math.max(0, (s - 0.55) / 0.45) ** 2);
    b.ell(hairKey, [0, 0.6, -0.1], [0.15, 0.2, 0.15]);           // the topknot
    b.put(k.torus(0.2), 'gold', [0, 0.47, -0.1], [PI / 2, 0, 0], [0.13, 0.13, 0.16]);
    b.ell('gold', [0, 0.82, -0.1], 0.055);
    for (const x of [-1, 1]) b.path(hairKey, [[x * 0.29, 0.04, -0.18], [x * 0.36, -0.3, -0.16], [x * 0.43, -0.62, -0.08]], 0.06, 0.035);
    // the five-pointed crown on its band, a gem in every leaf
    b.put(k.torus(0.12), 'gold', [0, 0.3, -0.06], [PI / 2 - 0.12, 0, 0], [0.37, 0.43, 0.4]);
    for (let i = 0; i < 5; i += 1) {
      const a = (i - 2) * 0.5, big = i === 2 ? 1.15 : 1 - Math.abs(i - 2) * 0.08;
      const px = Math.sin(a) * 0.37, pz = -0.06 + Math.cos(a) * 0.42;
      b.put(k.petal, 'gold', [px, 0.33, pz], [-0.18, a, 0, 'YXZ'], [0.18 * big, 0.33 * big, 0.06]);
      b.ell(i % 2 ? 'blue' : 'red', [px * 1.04, 0.46, pz * 1.04 + 0.02], 0.045 * big);
    }
    for (const x of [-1, 1]) b.path('red', [[x * 0.37, 0.3, -0.12], [x * 0.5, 0.15, -0.2], [x * 0.55, -0.15, -0.22]], 0.032, 0.018);
  } else if (style === 'bun') {
    cap(0.03);
    b.ell(hairKey, [0, 0.5, -0.24], [0.17, 0.16, 0.17]);
    b.put(k.torus(0.2), 'gold', [0, 0.43, -0.2], [0.6, 0, 0], 0.13);
  } else if (style === 'hat') {
    // the pandita's hat: tall and pointed, with long lappets to the shoulders
    b.put(k.torus(0.3), 'red', [0, 0.32, -0.05], [PI / 2 - 0.1, 0, 0], [0.37, 0.43, 0.45]);
    b.put(k.cone, 'red', [0, 0.74, -0.08], [-0.12, 0, 0], [0.38, 0.85, 0.4]);
    b.path('gold', [[0, 0.38, 0.36], [0, 0.72, 0.16], [0, 1.1, -0.02]], 0.025);
    for (const x of [-1, 1]) b.orient(k.box, 'red', [x * 0.4, -0.16, -0.1], [x * 0.22, -1, 0], [x, 0, 0.3], [0.16, 0.75, 0.05]);
  } else if (style === 'bonhat') {
    b.put(k.torus(0.3), 'blue', [0, 0.32, -0.05], [PI / 2 - 0.1, 0, 0], [0.38, 0.44, 0.45]);
    b.put(k.cone, 'blue', [0, 0.68, -0.06], 0, [0.38, 0.7, 0.4]);
    b.put(k.torus(0.15), 'gold', [0, 0.46, -0.06], [PI / 2, 0, 0], [0.34, 0.36, 0.3]);
    b.ell('gold', [0, 1.04, -0.06], 0.05);
  } else if (style === 'dread') {
    cap(0.036);
    b.ell(hairKey, [0, 0.6, -0.1], [0.22, 0.24, 0.22]);
    for (let i = 0; i < 7; i += 1) {
      const a = PI * 0.15 + i / 6 * PI * 0.7;
      b.path(hairKey, [[Math.cos(a) * 0.33, 0.2, -0.1 - Math.sin(a) * 0.34], [Math.cos(a) * 0.42, -0.25, -0.15 - Math.sin(a) * 0.32], [Math.cos(a) * 0.45, -0.7, -0.12 - Math.sin(a) * 0.3]], 0.055, 0.035);
    }
    b.path('ash', [[-0.18, -0.35, 0.3], [0, -0.62, 0.3], [0.18, -0.35, 0.3]], 0.065, 0.065);   // the beard
  } else if (style === 'flame') {
    fire(b, { y: 0.25, z: -0.1, h: 1.4, w: 0.9 });
  } else if (style === 'messy') {
    // hair matted and standing on end
    const at = cap(0.03);
    for (let i = 0; i < (tiny ? 5 : 9); i += 1) {
      const { p, n } = at(0.35 + (i % 3) * 0.2, i / (tiny ? 5 : 9) * TAU + 0.3);
      b.orient(k.cone, hairKey, v3.add(p, v3.mul(n, 0.08)), v3.norm(v3.add(n, [0, 0.9, 0])), [1, 0, 0], [0.07, 0.24, 0.07]);
    }
  } else if (style === 'spikes') {
    // the hungry ghosts' hair, drawn up from the crown in one dry tuft
    // like a flame
    const at = cap(0.026);
    const top = at(1, 0).p;
    for (let i = 0; i < (tiny ? 5 : 9); i += 1) {
      const { p } = at(0.8 + (i % 2) * 0.12, i / (tiny ? 5 : 9) * TAU);
      // each lock leans in towards the others, so they rise as one
      const up = v3.norm(v3.add(v3.mul(v3.sub(top, p), 1.4), [Math.sin(i * 2.1) * 0.06, 1, Math.cos(i * 1.7) * 0.05]));
      b.orient(k.cone, hairKey, v3.add(p, v3.mul(up, 0.2)), up, [1, 0, 0], [0.075, 0.46 + (i % 3) * 0.08, 0.075]);
    }
  }
}

/* A hand at the wrist, fingers along `dir`, palm facing `palm`. `side` is -1
   for the right hand, +1 for the left: it tells the thumb which way to go. */
function hand(b, key, wrist, dir, palm, side, size = 1) {
  const d = new b.THREE.Vector3(...dir).normalize(), n = new b.THREE.Vector3(...palm).normalize();
  const across = new b.THREE.Vector3().crossVectors(d, n).multiplyScalar(-side);
  const at = (t, u = 0, v = 0) => [wrist[0] + d.x * t + across.x * u + n.x * v, wrist[1] + d.y * t + across.y * u + n.y * v, wrist[2] + d.z * t + across.z * u + n.z * v];
  b.orient(b.kit.ball, key, at(0.02 * size), [d.x, d.y, d.z], [n.x, n.y, n.z], [0.019 * size, 0.022 * size, 0.009 * size]);
  b.orient(b.kit.ball, key, at(0.05 * size, -0.002 * size, 0.002 * size), [d.x, d.y, d.z], [n.x, n.y, n.z], [0.016 * size, 0.022 * size, 0.0065 * size]);
  const t = [d.x * 0.5 + across.x, d.y * 0.5 + across.y, d.z * 0.5 + across.z];
  b.orient(b.kit.ball, key, at(0.022 * size, 0.018 * size, 0.004 * size), t, [n.x, n.y, n.z], [0.006 * size, 0.016 * size, 0.0065 * size]);
}

/* What a figure wears, from what it is. */
function dressOf(o) {
  if (o.dress) return o.dress;
  if (o.hair === 'crown' || o.hair === 'dread' || o.thin) return 'bare';
  if (o.hair === 'bonhat' || (o.hair === 'bun' && o.robe !== 'saffron')) return 'coat';
  return 'robe';
}

/* A seated figure, legs crossed in the vajra posture, about 0.6 units to the
   top of the head at s = 1; `mudra` is the gesture (human-figure.js). */
const SEATED_STATURE = 1.0;
const STANDING_STATURE = 0.74;
function figureDress(o) {
  const { robe = 'maroon', skin = 'skin', hair = 'shaved' } = o;
  const dress = dressOf(o);
  const glass = !!paintOf(skin).glass;
  return {
    dress, skin, thin: !!o.thin, eyes: o.eyes, sash: o.sash,
    robe: dress === 'bare' ? (o.legs || robe) : (o.body || robe),
    lower: o.legs || robe,
    jewels: dress === 'bare' && (hair === 'crown' || !!o.jewels) && !glass,
    border: hair === 'buddha' && !glass ? 'gold' : null,
    longEars: hair === 'buddha' || hair === 'crown',
    neckFolds: hair === 'buddha',
    scalp: hair === 'shaved',
    hair: (bb, detail) => hairOf(bb, hair, null, detail)
  };
}

function seated(b, o = {}) {
  const { x = 0, y = 0, z = 0, s = 1, halo = null, bowl = null, mudra = 'lap', ry = 0, aura = null } = o;
  b.at([x, y, z], [0, ry, 0], s, () => {
    const k = b.kit;
    if (o.hair === 'buddha' && !paintOf(o.skin || 'skin').glass) {
      seatedSculpture(b, { skin: o.skin || 'skin', robe: o.body || o.robe || 'maroon', mudra, hair: 'lapis' });
    } else {
      humanFigure(b, { ...figureDress(o), stature: SEATED_STATURE, pose: POSES.seated(mudra) });
    }
    if (bowl) {
      b.put(k.lathe('almsbowl', [[0, 0], [0.04, 0.003], [0.058, 0.02], [0.06, 0.036], [0.054, 0.05], [0.05, 0.052], [0.04, 0.046], [0, 0.044]], 18), bowl, [0, 0.152, 0.158], 0, 0.85);
    }
    if (halo) {
      b.put(k.disc, halo, [0, 0.49, -0.075], [PI / 2, 0, 0], [0.13, 0.008, 0.13]);
      b.put(k.torus(0.06), halo === 'gold' ? 'brass' : halo, [0, 0.49, -0.07], [0, 0, 0], [0.13, 0.13, 0.06]);
    }
    if (aura) b.put(k.disc, aura, [0, 0.28, -0.11], [PI / 2, 0, 0], [0.26, 0.01, 0.3]);
  });
}

/* A standing figure, about 0.74 units to the top of the head at s = 1.
   `rightHand` and `leftHand` are where the wrists are (the right is towards
   -x); a staff goes in the left hand, a bowl in the right. A hand above the
   waist is raised, palm out. */
function standing(b, o = {}) {
  const { x = 0, y = 0, z = 0, s = 1, staff = null, bowl = null, halo = null, ry = 0, wide = 1 } = o;
  const S = STANDING_STATURE;
  b.at([x, y, z], [0, ry, 0], s, () => {
    const k = b.kit;
    const pose = POSES.standing();
    const given = [o.rightHand, o.leftHand];
    pose.arms = pose.arms.map((arm, i) => {
      const side = i ? 1 : -1;
      const w = given[i];
      if (!w) return arm;
      const raised = w[1] > 0.4;
      const holds = (i === 1 && staff) || (i === 0 && bowl);
      return {
        wrist: w.map((v) => v / S),
        pole: raised ? [side, -1, -0.3] : [side * 0.4, -0.2, -1],
        dir: raised ? [0, 1, 0.12] : bowl && i === 0 ? [-side * 0.25, 0.1, 1] : 'fore',
        palm: raised ? [0, 0, 1] : bowl && i === 0 ? [0, 1, 0] : [-side, 0, 0.2],
        curl: raised ? 'open' : holds ? 'hold' : 'rest'
      };
    });
    const wrists = [null, null];
    humanFigure(b, { ...figureDress(o), stature: S, pose, wide,
      hemBorder: o.hair === 'buddha' ? 'gold' : null,
      onHand: (i, wrist) => { wrists[i] = wrist; } });
    if (staff) {
      const h = wrists[1];
      b.beam(staff, [h[0], 0, h[2] + 0.012], [h[0], 0.84, h[2] + 0.012], 0.008);
      b.put(k.torus(0.16), staff, [h[0], 0.865, h[2] + 0.012], 0, 0.035);
      for (const sx of [-1, 1]) b.put(k.torus(0.3), staff, [h[0] + sx * 0.032, 0.85, h[2] + 0.012], [PI / 2, 0, 0], 0.01);
      b.ell(staff, [h[0], 0.9, h[2] + 0.012], [0.008, 0.016, 0.008]);
    }
    if (bowl) {
      const h = wrists[0];
      b.put(k.lathe('almsbowl', [[0, 0], [0.04, 0.003], [0.058, 0.02], [0.06, 0.036], [0.054, 0.05], [0.05, 0.052], [0.04, 0.046], [0, 0.044]], 18),
        bowl, [h[0] + 0.012, h[1] + 0.008, h[2] + 0.045], 0, 0.75);
    }
    if (halo) {
      b.put(k.disc, halo, [0, 0.685, -0.07], [PI / 2, 0, 0], [0.115, 0.008, 0.115]);
      b.put(k.torus(0.08), halo === 'gold' ? 'brass' : halo, [0, 0.685, -0.065], 0, 0.115);
    }
  });
}

/* ── the wrathful ─────────────────────────────────────────────────────────
   Mahākāla, Rudra become a heruka, the guardians of the hells: a face of
   wrath, a body squat and heavy, as many heads, arms and legs as the form
   has, each hand with what it holds. */

/* A wrathful face, in the head's own units like `head`: bulging round eyes
   and the third eye, brows and beard of flame, a broad nose, the mouth open
   on its fangs, a crown of five skulls with a flaming jewel over each, hair
   rising behind like fire, and great rings in the ears. */
function wrathHead(b, { skin = 'navy', hair = 'earth', hairTip = 'saffron', crown = true, brows = 'flame', third = true, rings = 'gold', horns = null, hairFan = true } = {}) {
  const k = b.kit;
  b.ell(skin, [0, 0.04, -0.03], [0.43, 0.47, 0.42]);
  for (const x of [-1, 1]) b.ell(skin, [x * 0.21, -0.13, 0.19], [0.19, 0.18, 0.19]);
  b.ell(skin, [0, -0.33, 0.13], [0.28, 0.17, 0.2]);
  b.ell(skin, [0, 0.13, 0.31], [0.37, 0.1, 0.12]);                    // the frowning brow
  // the eyes, round and staring, rimmed with red, and the third upright
  for (const x of [-1, 1]) {
    b.ell('eyewhite', [x * 0.16, 0.035, 0.37], [0.1, 0.095, 0.08]);
    b.ell('lash', [x * 0.15, 0.04, 0.445], 0.045);
    b.orient(k.ring(0.22), 'red', [x * 0.16, 0.035, 0.4], [0, 1, 0], [0, 0, 1], [0.105, 0.1, 0.06]);
  }
  if (third) {
    b.ell('eyewhite', [0, 0.27, 0.39], [0.055, 0.09, 0.05]);
    b.ell('lash', [0, 0.27, 0.43], [0.03, 0.04, 0.02]);
    b.orient(k.ring(0.22), 'red', [0, 0.27, 0.41], [0, 1, 0], [0, 0, 1], [0.06, 0.095, 0.05]);
  }
  // brows of flame, curling up and out
  for (const x of [-1, 1]) for (let i = 0; i < 3; i += 1) {
    b.put(k.flameLow, i === 1 ? 'ember' : brows, [x * (0.08 + i * 0.1), 0.16 + i * 0.02, 0.38 - i * 0.04],
      [0.3, 0, -x * (0.5 + i * 0.35)], [0.07, 0.2 - i * 0.02, 0.04]);
  }
  // the broad nose
  b.ell(skin, [0, -0.07, 0.44], [0.12, 0.09, 0.08]);
  for (const x of [-1, 1]) b.ell('lash', [x * 0.05, -0.1, 0.48], 0.02);
  // the mouth open on its teeth, four fangs, the tongue curled
  b.ell('crimson~', [0, -0.25, 0.37], [0.22, 0.1, 0.07]);
  b.ell('red', [0, -0.29, 0.39], [0.11, 0.035, 0.05]);
  for (let i = 0; i < 6; i += 1) {
    const x = (i - 2.5) * 0.06;
    b.put(k.box, 'white', [x, -0.19, 0.415 - Math.abs(x) * 0.25], 0, [0.045, 0.05, 0.03]);
    b.put(k.box, 'white', [x, -0.31, 0.405 - Math.abs(x) * 0.25], 0, [0.045, 0.04, 0.03]);
  }
  for (const x of [-1, 1]) {
    b.put(k.cone, 'white', [x * 0.18, -0.25, 0.39], [PI, 0, 0], [0.03, 0.12, 0.03]);
    b.put(k.cone, 'white', [x * 0.13, -0.26, 0.4], 0, [0.025, 0.1, 0.025]);
    b.ell(skin, [x * 0.2, -0.24, 0.33], [0.06, 0.12, 0.07]);
  }
  // beard and moustache of flame
  for (const x of [-1, 1]) for (let i = 0; i < 4; i += 1) {
    const a = 0.3 + i * 0.35;
    b.put(k.flameLow, i % 2 ? 'ember' : brows, [x * (0.12 + Math.sin(a) * 0.2), -0.33 - Math.cos(a) * 0.12, 0.3 - i * 0.05],
      [0.4, 0, x * (PI - a * 0.9)], [0.07, 0.2, 0.04]);
  }
  // ears and the great rings
  for (const x of [-1, 1]) {
    b.ell(skin, [x * 0.43, -0.02, -0.03], [0.07, 0.18, 0.12], [0, x * 0.3, 0]);
    if (rings) b.orient(k.ring(0.22), rings, [x * 0.47, -0.33, 0.02], [0, 1, 0], [x, 0, 0.3], 0.13);
  }
  if (horns) for (const x of [-1, 1]) {
    b.path(horns, [[x * 0.3, 0.38, -0.05], [x * 0.55, 0.52, -0.05], [x * 0.62, 0.78, 0.02], [x * 0.52, 0.95, 0.06]], 0.08, 0.015);
  }
  // hair rising behind like fire
  if (hairFan) for (const [n, r, len, wide, z, key] of [[13, 0.3, 0.62, 0.3, -0.3, hair + '~'], [17, 0.36, 0.46, 0.22, -0.22, hair]]) {
    for (let i = 0; i < n; i += 1) {
      const a = -0.3 + i / (n - 1) * (PI + 0.6);
      const p = [Math.cos(a) * r, 0.3 + Math.sin(a) * r * 0.9, z];
      b.put(k.flameLow, i % 4 === 2 ? hairTip : key, p, [0, 0, a - PI / 2 + Math.sin(i * 1.7) * 0.12], [wide, len * (0.9 + (i % 3) * 0.08), 0.1]);
    }
  }
  // the crown of five skulls, a flaming jewel over each
  if (crown) {
    b.put(k.torus(0.12), 'gold', [0, 0.36, -0.03], [PI / 2 - 0.15, 0, 0], [0.45, 0.46, 0.4]);
    for (let i = 0; i < 5; i += 1) {
      const a = (i - 2) * 0.45;
      const px = Math.sin(a) * 0.43, pz = -0.03 + Math.cos(a) * 0.43;
      b.at([px, 0.42, pz], [0, a, 0], 1, () => {
        skull(b, { s: 1.45, y: -0.06 });
        b.put(k.flameLow, 'gold', [0, 0.12, -0.02], 0, [0.075, 0.2, 0.05]);
        b.ell('red', [0, 0.17, 0.02], 0.03);
      });
    }
  }
}

/* What a hand holds, along `dir` from the wrist. */
function implement(b, kind, at, dir, len = 0.22) {
  const k = b.kit, d = v3.norm(dir);
  let side = v3.cross(d, [0, 0, 1]);
  if (Math.hypot(...side) < 0.2) side = v3.cross(d, [1, 0, 0]);
  side = v3.norm(side);
  const p = (t, u = 0) => v3.add(v3.add(at, v3.mul(d, t)), v3.mul(side, u));
  if (kind === 'trident') {
    b.beam('silver', p(-0.1), p(len), 0.006);
    b.beam('silver', p(len, -0.035), p(len, 0.035), 0.005);
    for (const u of [-0.035, 0, 0.035]) b.beam('silver', p(len, u), p(len + (u ? 0.05 : 0.07), u * 1.1), 0.005, 0.0015);
    skull(b, { x: p(len - 0.03)[0], y: p(len - 0.03)[1] - 0.012, z: p(len - 0.03)[2], s: 0.22 });
    b.path('red', [p(len - 0.05, 0.01), p(len - 0.1, 0.04), p(len - 0.16, 0.03)], 0.006, 0.003);
  } else if (kind === 'club') {
    b.beam('wood', p(-0.03), p(len * 0.75), 0.008, 0.013);
    b.ell('iron', p(len * 0.82), [0.026, 0.035, 0.026]);
    for (let i = 0; i < 4; i += 1) b.ell('iron', p(len * 0.82, (i % 2 ? 1 : -1) * 0.026), 0.008);
  } else if (kind === 'sword') {
    b.beam('gold', p(-0.03), p(0.03), 0.006);
    b.beam('gold', p(0.03, -0.025), p(0.03, 0.025), 0.005);
    b.orient(k.pyramid, 'silver', p(0.03 + len * 0.45), d, v3.cross(d, side), [0.016, len * 0.9, 0.004]);
  } else if (kind === 'flaming-sword') {
    implement(b, 'sword', at, dir, len);
    for (let i = 0; i < 4; i += 1) b.orient(k.flame, i % 2 ? 'ember' : 'flame', p(0.08 + i * 0.045, (i % 2 ? 1 : -1) * 0.012), v3.add(d, v3.mul(side, i % 2 ? 0.6 : -0.6)), [0, 0, 1], [0.012, 0.04, 0.008]);
  } else if (kind === 'kapala') {
    b.put(k.bowl, 'bone', at, 0, [0.03, 0.022, 0.026]);
    b.put(k.disc, 'crimson', [at[0], at[1] - 0.002, at[2]], 0, [0.027, 0.004, 0.023]);
  } else if (kind === 'damaru') {
    b.orient(k.cone, 'crimson', p(0.015, 0.012), side, d, [0.018, 0.024, 0.018]);
    b.orient(k.cone, 'crimson', p(0.015, -0.012), v3.mul(side, -1), d, [0.018, 0.024, 0.018]);
  } else if (kind === 'noose') {
    b.orient(k.torus(0.12), 'bone', p(0.04), d, side, 0.035);
  } else if (kind === 'chopper') {
    b.beam('gold', p(-0.02), p(0.04), 0.006);
    b.orient(k.torus(0.3, PI), 'silver', p(0.06), side, v3.cross(d, side), [0.03, 0.03, 0.12]);
  } else if (kind === 'spear') {
    b.beam('wood', p(-len * 0.4), p(len), 0.006);
    b.orient(k.pyramid, 'silver', p(len + 0.025), d, side, [0.012, 0.06, 0.006]);
  } else if (kind === 'saw') {
    b.orient(k.box, 'iron', p(len * 0.5), d, side, [0.035, len, 0.004]);
    for (let i = 0; i < 6; i += 1) b.orient(k.pyramid, 'iron', p(len * (0.1 + i * 0.15), 0.018), side, d, [0.008, 0.012, 0.003]);
  } else if (kind === 'skull') {
    skull(b, { x: at[0], y: at[1] - 0.015, z: at[2], s: 0.45 });
  }
}

/* A wrathful body: heavy legs in the striding stance, the tiger skin at the
   hips, a pot belly, broad shoulders, a garland of heads; as many legs (two
   or four), arms and heads as the form has. About one unit tall at s = 1.
   `arms` is a list of { side, elbow, wrist, dir, holds } for the right (-1)
   and the left (+1); `heads` a list of { skin, at, turn, scale }. */
function wrathBody(b, o = {}) {
  const { x = 0, y = 0, z = 0, s = 1, ry = 0, skin = 'navy', legs = 2, arms = [], heads = [], skirt = 'saffron',
    garland = true, ornament = 'bone', scarf = null } = o;
  b.at([x, y, z], [0, ry, 0], s, () => {
    const k = b.kit;
    // the legs: the right bent forward, the left thrust out straight
    const set = [
      [[-0.06, 0.42, 0.0], [-0.2, 0.25, 0.07], [-0.22, 0.035, 0.05]],
      [[0.06, 0.42, 0.0], [0.19, 0.23, 0.02], [0.31, 0.035, 0.02]]];
    if (legs === 4) set.push(
      [[-0.05, 0.42, -0.04], [-0.17, 0.26, -0.05], [-0.18, 0.035, -0.1]],
      [[0.05, 0.42, -0.04], [0.16, 0.23, -0.08], [0.27, 0.035, -0.12]]);
    set.forEach(([hip, knee, ankle], i) => {
      b.blob(skin, hip, knee, 0.05, 0.05);
      b.ell(skin, knee, 0.038);
      b.blob(skin, knee, ankle, 0.038, 0.036);
      b.put(k.ring(0.3), ornament, v3.add(ankle, [0, 0.03, 0]), 0, 0.03);
      const toe = i % 2 ? [ankle[0] + 0.05, 0.012, ankle[2] + 0.04] : [ankle[0] - 0.01, 0.012, ankle[2] + 0.07];
      b.orient(k.ball, skin, v3.mul(v3.add(ankle, toe), 0.5), v3.sub(toe, [ankle[0], 0.012, ankle[2]]), [0, 1, 0], [0.028, 0.05, 0.016]);
    });
    // the tiger skin, striped, its paws hanging
    b.ell(skirt, [0, 0.4, 0.0], [0.14, 0.08, 0.11]);
    b.ell(skirt, [0, 0.34, 0.05], [0.1, 0.07, 0.07]);
    for (let i = 0; i < 6; i += 1) {
      const a = -0.9 + i * 0.36;
      b.path('black', [[Math.sin(a) * 0.13, 0.43, Math.cos(a) * 0.1], [Math.sin(a) * 0.145, 0.4, Math.cos(a) * 0.115], [Math.sin(a) * 0.13, 0.36, Math.cos(a) * 0.1]], 0.006);
    }
    for (const sx of [-1, 1]) b.path(skirt, [[sx * 0.09, 0.36, 0.08], [sx * 0.1, 0.3, 0.11], [sx * 0.09, 0.27, 0.12]], 0.014, 0.01);
    // belly, chest, shoulders
    b.ell(skin, [0, 0.5, 0.02], [0.12, 0.09, 0.1]);
    b.ell(skin, [0, 0.6, 0.0], [0.155, 0.09, 0.1]);
    for (const sx of [-1, 1]) {
      b.ell(skin, [sx * 0.065, 0.6, 0.07], [0.065, 0.05, 0.035]);
      b.ell(skin, [sx * 0.155, 0.635, 0.0], [0.055, 0.055, 0.055]);
    }
    b.beam(skin, [0, 0.64, 0], [0, 0.71, 0.01], 0.04, 0.036);
    // bone ornaments and the garland of heads
    b.put(k.torus(0.12), ornament, [0, 0.665, 0.01], [PI / 2 - 0.3, 0, 0], [0.08, 0.075, 0.08]);
    if (garland) {
      const n = 7;
      for (let i = 0; i < n; i += 1) {
        const t = i / (n - 1), a = (t - 0.5) * 2.4;
        const p = [Math.sin(a) * 0.14, 0.64 - Math.cos(a * 0.85) * 0.2 + Math.abs(t - 0.5) * 0.05, 0.08 + Math.cos(a) * 0.04];
        skull(b, { x: p[0], y: p[1] - 0.015, z: p[2], s: 0.36 });
      }
    }
    if (scarf) {
      b.path(scarf, [[-0.17, 0.64, -0.02], [-0.08, 0.7, -0.08], [0.08, 0.7, -0.08], [0.17, 0.64, -0.02]], 0.014);
      for (const sx of [-1, 1]) b.path(scarf, [[sx * 0.17, 0.64, -0.02], [sx * 0.3, 0.55, -0.06], [sx * 0.36, 0.42, -0.02], [sx * 0.42, 0.33, 0.03]], 0.012, 0.007);
    }
    // the arms, each with its hand and what it holds
    arms.forEach(({ side, elbow, wrist, dir, holds, palm = [0, 0, 1], len }) => {
      const shoulder = [side * 0.16, 0.63, 0];
      b.blob(skin, shoulder, elbow, 0.04, 0.038);
      b.ell(skin, elbow, 0.03);
      b.blob(skin, elbow, wrist, 0.031, 0.028);
      b.put(k.ring(0.3), ornament, v3.add(v3.mul(shoulder, 0.4), v3.mul(elbow, 0.6)), 0, 0.034);
      b.orient(k.ring(0.3), 'gold', wrist, v3.sub(wrist, elbow), [0, 0, 1], 0.026);
      hand(b, skin, wrist, dir, palm, side, 1.1);
      if (holds) implement(b, holds, v3.add(wrist, v3.mul(v3.norm(dir), 0.04)), dir, len);
    });
    // the heads
    heads.forEach(({ skin: face = skin, at = [0, 0.78, 0.02], turn = 0, scale = 0.16, ...rest }) => {
      b.at(at, [0, turn, 0], scale, () => wrathHead(b, { skin: face, ...rest }));
    });
  });
}

/* A being of the hells, naked, in one of the attitudes the paintings give
   them: writhing with arms flung up, kneeling, huddled against the cold,
   lying, fighting, or only half out of the thing it is caught in. About half
   a unit tall standing, at s = 1. */
/* A being of the hells or of the pretas, on the same body as everyone
   else: naked but for a loincloth, eyes open, mouth open in the scream.
   `pose` is one of the body's poses — writhe, kneel, huddle, fight, reach,
   agony (thrown down on the back), fallen (face down). Without `legs` the
   being is sunk to the waist in whatever it stands in. */
const SUFFER_STATURE = 0.58;
function sufferer(b, { x = 0, y = 0, z = 0, s = 1, ry = 0, rx = 0, rz = 0, skin = 'skin', pose = 'writhe', legs = true, hair = 'black', style = null, blisters = null, holds = null, thin = false, belly = false } = {}) {
  b.at([x, y, z], [rx, ry, rz], s, () => {
    const S = SUFFER_STATURE;
    const made = POSES[pose] ? POSES[pose]() : POSES.writhe();
    const out = humanFigure(b, {
      stature: S, pose: made, dress: 'loin', skin, robe: 'ash', lower: 'ash', thin, noLegs: !legs,
      eyes: 'open', mouth: 'scream', scalp: !hair, iris: 'black', build: belly ? 1.05 : 1,
      hair: (bb, detail) => hairOf(bb, hair ? (style || 'messy') : 'shaved', hair || null, detail),
      onHand: (i, wrist, dir) => { if (holds && i === 0) implement(b, holds, v3.add(wrist, v3.mul(v3.norm(dir), 0.02)), dir, 0.16); }
    });
    if (blisters) for (let i = 0; i < 7; i += 1) {
      const a = i * 2.3;
      const p = out.frames.apply(out.frames.MC, [Math.sin(a) * 0.05 * S, (0.12 + (i % 3) * 0.05) * S, 0.075 * S + Math.cos(a) * 0.006]);
      b.ell(blisters, p, 0.012 * S * (0.8 + (i % 2) * 0.4));
    }
  });
}

/* A guardian of the hells, a servant of Yama: horned, red or black, a
   weapon raised. */
function guardian(b, { x = 0, y = 0, z = 0, s = 0.5, ry = 0, skin = 'crimson', holds = 'club', horns = 'bone', pose = 'raise' } = {}) {
  const raise = pose === 'raise';
  wrathBody(b, { x, y, z, s, ry, skin, legs: 2, garland: false, skirt: 'saffron',
    arms: [
      raise ? { side: -1, elbow: [-0.25, 0.75, 0.04], wrist: [-0.2, 0.92, 0.07], dir: [0.3, 1, 0.1], holds, len: 0.3 }
        : { side: -1, elbow: [-0.24, 0.5, 0.1], wrist: [-0.12, 0.45, 0.22], dir: [0.6, -0.1, 1], holds, len: 0.3 },
      { side: 1, elbow: [0.25, 0.52, 0.06], wrist: [0.2, 0.42, 0.16], dir: [-0.3, -0.4, 1] }
    ],
    heads: [{ skin, at: [0, 0.79, 0.02], scale: 0.17, horns, crown: false, hairFan: true, third: false, hair: 'black', hairTip: 'crimson' }] });
}

/* A stupa: stepped base, vase-shaped dome, harmikā, thirteen rings, parasol,
   and the moon and sun at the top. About 1 unit tall at s = 1. */
/* A stupa of enlightenment: the lion throne, four stepped tiers each with
   its projecting middle and its bands of colour, the seat of the vase, the
   white dome hung with gold garlands and a Buddha in its niche, the harmikā,
   thirteen wheels, the parasol with its silks, and the moon, the sun and the
   flaming jewel at the top. About one unit tall at s = 1. */
function stupa(b, { x = 0, y = 0, z = 0, s = 1, body = 'white', gilt = 'gold' } = {}) {
  b.at([x, y, z], 0, s, () => {
    const k = b.kit;
    // the throne, a lion at each front corner and jewels on its face
    b.put(k.box, 'red', [0, 0.045, 0], 0, [0.46, 0.09, 0.46]);
    for (const yy of [0.004, 0.088]) b.put(k.box, gilt, [0, yy, 0], 0, [0.475, 0.01, 0.475]);
    for (let f = 0; f < 4; f += 1) b.at([0, 0, 0], [0, f * PI / 2, 0], 1, () => {
      b.put(k.box, 'blue', [0, 0.045, 0.231], 0, [0.2, 0.05, 0.004]);
      for (const jx of [-0.06, 0, 0.06]) b.put(k.octa, ['jade', 'gold', 'red'][(jx > 0) + (jx === 0) * 2], [jx, 0.045, 0.236], 0, [0.012, 0.018, 0.006]);
    });
    // the snow lions that bear the throne up, on the face that is seen
    for (const sx of [-1, 1]) snowLion(b, { x: sx * 0.19, y: 0.004, z: 0.238, s: 0.1, ry: sx * 0.2, small: true });
    // four steps, each a cross in plan, banded in gold and colour
    let h = 0.093;
    [[0.4, 0.055], [0.35, 0.05], [0.3, 0.045], [0.26, 0.04]].forEach(([w, t], i) => {
      b.put(k.box, body, [0, h + t / 2, 0], 0, [w, t, w * 0.82]);
      b.put(k.box, body, [0, h + t / 2, 0], 0, [w * 0.82, t, w]);
      b.put(k.box, i % 2 ? 'blue' : 'red', [0, h + t * 0.35, 0], 0, [w * 0.83, t * 0.18, w + 0.004]);
      b.put(k.box, i % 2 ? 'blue' : 'red', [0, h + t * 0.35, 0], 0, [w + 0.004, t * 0.18, w * 0.83]);
      b.put(k.box, gilt, [0, h + t - 0.003, 0], 0, [w + 0.008, 0.007, w * 0.82 + 0.008]);
      b.put(k.box, gilt, [0, h + t - 0.003, 0], 0, [w * 0.82 + 0.008, 0.007, w + 0.008]);
      h += t;
    });
    // the seat of the vase
    for (const [r, t] of [[0.12, 0.025], [0.105, 0.02]]) {
      b.put(k.cyl, body, [0, h + t / 2, 0], 0, [r, t, r]);
      b.put(k.torus(0.15), gilt, [0, h + t, 0], [PI / 2, 0, 0], [r, r, 0.1]);
      h += t;
    }
    // the dome, garlanded, and the Buddha in its niche
    const dome = k.lathe('stupa-bumpa', [[0, 0], [0.11, 0], [0.155, 0.03], [0.17, 0.09], [0.16, 0.15], [0.125, 0.2], [0.07, 0.228], [0, 0.235]], 28);
    b.put(dome, body, [0, h, 0]);
    for (let i = 0; i < 8; i += 1) {
      const a = (i + 0.5) / 8 * TAU;
      if (i === 3 || i === 4) continue;    // the niche's side is left open
      b.at([Math.sin(a) * 0.128, h + 0.19, Math.cos(a) * 0.128], [0, a, 0], 1, () => {
        b.put(k.torus(0.1, PI), gilt, [0, 0, 0.004], [-0.5, 0, PI], [0.045, 0.03, 0.04]);
        b.ell('red', [0, -0.03, 0.01], 0.007);
      });
    }
    b.at([0, h + 0.02, 0.163], 0, 1.25, () => {
      // an arched niche, framed in gold, the Buddha seated in it on a lotus
      b.put(k.box, 'navy', [0, 0.05, -0.012], 0, [0.08, 0.1, 0.03]);
      b.put(k.disc, 'navy', [0, 0.1, -0.012], [PI / 2, 0, 0], [0.04, 0.03, 0.04]);
      b.put(k.torus(0.12, PI), gilt, [0, 0.1, 0.004], 0, [0.044, 0.044, 0.03]);
      for (const sx of [-1, 1]) b.put(k.box, gilt, [sx * 0.044, 0.05, 0.004], 0, [0.007, 0.1, 0.008]);
      b.put(k.box, gilt, [0, 0.0, 0.004], 0, [0.1, 0.008, 0.012]);
      b.ell('ember', [0, 0.07, 0.0], [0.028, 0.034, 0.004]);
      b.ell('pink', [0, 0.012, 0.006], [0.03, 0.008, 0.014]);
      b.ell('red', [0, 0.024, 0.006], [0.025, 0.011, 0.014]);
      b.ell('red', [0, 0.046, 0.004], [0.015, 0.022, 0.01]);
      b.ell('gilt', [0, 0.074, 0.008], [0.01, 0.012, 0.01]);
      b.ell('lapis', [0, 0.086, 0.006], 0.006);
    });
    h += 0.235;
    // the harmikā
    b.put(k.box, body, [0, h + 0.02, 0], 0, [0.1, 0.04, 0.1]);
    b.put(k.box, 'red', [0, h + 0.02, 0], 0, [0.104, 0.012, 0.104]);
    b.put(k.box, gilt, [0, h + 0.043, 0], 0, [0.12, 0.008, 0.12]);
    h += 0.047;
    // thirteen wheels on the spire
    const spire = k.lathe('stupa-spire', [[0, 0], [0.05, 0], [0.024, 0.25], [0, 0.26]], 16);
    b.put(spire, gilt, [0, h, 0]);
    for (let i = 0; i < 13; i += 1) {
      const t = i / 13;
      b.put(k.torus(0.35), gilt, [0, h + 0.012 + t * 0.235, 0], [PI / 2, 0, 0], [0.056 - t * 0.03, 0.056 - t * 0.03, 0.035]);
    }
    h += 0.255;
    // the parasol with its hanging silks
    b.put(k.cone, gilt, [0, h + 0.012, 0], 0, [0.085, 0.03, 0.085]);
    b.put(k.torus(0.1), gilt, [0, h - 0.002, 0], [PI / 2, 0, 0], [0.085, 0.085, 0.1]);
    ['red', 'blue', 'jade', 'gold', 'white', 'red', 'blue', 'jade', 'gold', 'white', 'red', 'blue'].forEach((key, i) => {
      const a = i / 12 * TAU;
      b.put(k.box, key, [Math.sin(a) * 0.08, h - 0.022, Math.cos(a) * 0.08], [0, a, 0], [0.018, 0.04, 0.003]);
    });
    // the moon, the sun and the jewel
    b.put(k.torus(0.28, PI), 'silver', [0, h + 0.07, 0], [0, 0, PI], 0.03);
    b.ell(gilt, [0, h + 0.09, 0], 0.022);
    b.put(k.flame, 'ember', [0, h + 0.11, 0], 0, [0.022, 0.065, 0.018]);
  });
}

/* Behind a Buddha: the aureole of the body, deep blue rimmed in gold, red
   and green, fine rays of gold across it, and the green halo of the head,
   rimmed in gold, its edge tipped with flame. */
function buddhaAureole(b, { y = 0.42, z = -0.12, w = 0.3, h = 0.36, headY = 0.62, headR = 0.105, flames = true } = {}) {
  const k = b.kit;
  b.put(k.disc, 'deep', [0, y, z], [PI / 2, 0, 0], [w, 0.01, h]);
  [['gold', 1.0], ['red', 0.94], ['jade', 0.89]].forEach(([key, r], i) => b.put(k.torus(0.05), key, [0, y, z + 0.004 + i * 0.002], 0, [w * r, h * r, 0.04]));
  for (let i = 0; i < 18; i += 1) {
    const a = i / 18 * TAU;
    b.beam('gold~', [Math.cos(a) * w * 0.15, y + Math.sin(a) * h * 0.15, z + 0.008], [Math.cos(a) * w * 0.85, y + Math.sin(a) * h * 0.85, z + 0.008], 0.0025);
  }
  b.put(k.disc, 'jade', [0, headY, z + 0.02], [PI / 2, 0, 0], [headR, 0.01, headR]);
  b.put(k.torus(0.08), 'gold', [0, headY, z + 0.025], 0, [headR, headR, 0.08]);
  b.put(k.torus(0.06), 'red', [0, headY, z + 0.024], 0, [headR * 1.12, headR * 1.12, 0.06]);
  if (flames) for (let i = 0; i < 16; i += 1) {
    const a = (i + 0.5) / 16 * TAU;
    b.put(k.flameLow, i % 2 ? 'gold' : 'ember', [Math.cos(a) * w * 1.03, y + Math.sin(a) * h * 1.03, z], [0, 0, a - PI / 2], [0.022, 0.05, 0.012]);
  }
}

/* A snow lion, the guardian of a throne: sitting up on its haunches with
   the forelegs straight, white, the mane, the brows, the tufts at its
   elbows and the plume of its tail in curls of turquoise, the mouth open on
   its fangs. A unit tall at s = 1, looking out along +z. */
function snowLion(b, { x = 0, y = 0, z = 0, s = 1, ry = 0, body = 'white', mane = 'turquoise', mane2 = 'jade', small = false } = {}) {
  b.at([x, y, z], [0, ry, 0], s, () => {
    // a curl of the mane: a round lock, set in rows like a statue's
    const curl = (p, r, key = mane) => b.put(b.kit.nub, key, p, 0, [r, r, r * 0.8]);
    // the deep chest, the waist, the haunches it sits on
    b.blob(body, [0, 0.3, -0.16], [0, 0.64, 0.07], 0.21, 0.19);
    b.ell(body, [0, 0.42, -0.04], [0.16, 0.16, 0.19]);
    for (const sx of [-1, 1]) {
      b.ell(body, [sx * 0.16, 0.21, -0.12], [0.14, 0.18, 0.2]);          // the haunch
      b.ell(body, [sx * 0.19, 0.05, 0.08], [0.075, 0.05, 0.12]);         // the hind paw, drawn forward
      // the foreleg: the shoulder heavy with muscle, the elbow out, the
      // forearm down to a broad paw and its toes
      b.path(body, [[sx * 0.13, 0.6, 0.08], [sx * 0.165, 0.38, 0.14], [sx * 0.145, 0.13, 0.2], [sx * 0.14, 0.06, 0.23]], 0.072, 0.05);
      b.ell(body, [sx * 0.14, 0.05, 0.26], [0.078, 0.05, 0.09]);
      if (!small) for (const cx of [-0.04, 0, 0.04]) b.ell(body, [sx * 0.14 + cx, 0.035, 0.33], [0.025, 0.024, 0.026]);
      // curls at the elbow
      curl([sx * 0.2, 0.38, 0.1], 0.055, mane2);
      if (!small) curl([sx * 0.2, 0.31, 0.08], 0.045);
    }
    // the head: a broad flat face, the brows heavy over bulging eyes, the
    // nose broad, the jaws open on the fangs and the tongue
    b.ell(body, [0, 0.88, 0.08], [0.17, 0.15, 0.15]);
    for (const sx of [-1, 1]) b.ell(body, [sx * 0.085, 0.83, 0.18], [0.085, 0.078, 0.075]);
    b.ell(body, [0, 0.81, 0.25], [0.1, 0.062, 0.08]);
    b.ell(body, [0, 0.727, 0.21], [0.075, 0.033, 0.07]);                 // the lower jaw
    b.ell('crimson~', [0, 0.765, 0.265], [0.07, 0.03, 0.05]);
    b.ell('red', [0, 0.75, 0.285], [0.035, 0.012, 0.03]);                // the tongue
    b.ell('lash', [0, 0.852, 0.322], [0.045, 0.026, 0.024]);              // the nose
    for (const sx of [-1, 1]) {
      b.ell('eyewhite', [sx * 0.068, 0.905, 0.222], 0.042);
      b.ell('lash', [sx * 0.068, 0.905, 0.258], 0.019);
      curl([sx * 0.07, 0.962, 0.215], 0.04);                              // the brows, in curls
      curl([sx * 0.13, 0.95, 0.17], 0.036, mane2);
      b.put(b.kit.cone, 'white', [sx * 0.04, 0.75, 0.3], [PI, 0, 0], [0.013, 0.035, 0.013]);   // the fangs
      b.put(b.kit.cone, 'white', [sx * 0.035, 0.738, 0.275], 0, [0.011, 0.028, 0.011]);
    }
    // the mane: rows of curls round the face, the outer the larger, and a
    // fall of them over the breast
    for (const [n, R, r, zz, key] of small ? [[9, 0.2, 0.09, 0, mane]] : [[12, 0.215, 0.078, -0.03, mane2], [10, 0.17, 0.062, 0.03, mane]]) {
      for (let i = 0; i < n; i += 1) {
        const a = -PI * 0.2 + i / (n - 1) * PI * 1.4;
        curl([Math.cos(a) * R, 0.87 + Math.sin(a) * R * 0.95, zz], r, key);
      }
    }
    for (let i = 0; i < 4; i += 1) curl([(i - 1.5) * 0.08, 0.69 - Math.abs(i - 1.5) * 0.03, 0.15], 0.065, i % 2 ? mane2 : mane);
    if (!small) for (let i = 0; i < 3; i += 1) curl([(i - 1) * 0.08, 0.6 - Math.abs(i - 1) * 0.02, 0.15], 0.055, i % 2 ? mane : mane2);
    // the tail rising behind and breaking into a plume of curls
    b.path(body, [[0, 0.3, -0.33], [0.06, 0.5, -0.41], [0.04, 0.66, -0.38]], 0.03, 0.022);
    for (const [px, py, pz, r] of [[0.04, 0.7, -0.38, 0.06], [0.1, 0.76, -0.34, 0.055], [-0.02, 0.78, -0.35, 0.055], [0.05, 0.84, -0.3, 0.05]]) curl([px, py, pz], r, r > 0.055 ? mane : mane2);
  });
}

/* A lion throne, the seat of a Buddha: a plinth stepped and banded in
   gold, the body of the throne with its face sunk between gilt pilasters,
   jewels on the panel, a moulded cornice and the top slab, a brocade laid
   over it and hanging down the middle in its border and fringe, and a snow
   lion to either side of the face, its head at the cornice. Returns the
   top. */
function lionThrone(b, { y = 0, w = 0.44, d = 0.28, h = 0.14 } = {}) {
  const k = b.kit;
  // the plinth
  b.put(k.box, 'red', [0, y + 0.011, 0], 0, [w + 0.03, 0.022, d + 0.03]);
  b.put(k.box, 'gold', [0, y + 0.024, 0], 0, [w + 0.034, 0.005, d + 0.034]);
  b.put(k.box, 'crimson', [0, y + 0.033, 0], 0, [w + 0.012, 0.014, d + 0.012]);
  // the body, its face sunk between the pilasters
  const y0 = y + 0.04, y1 = y + h - 0.03, mid = (y0 + y1) / 2, tall = y1 - y0;
  b.put(k.box, 'red', [0, mid, -0.014], 0, [w, tall, d - 0.028]);
  for (const sx of [-1, 1]) {
    b.put(k.box, 'red', [sx * (w / 2 - 0.024), mid, d / 2 - 0.022], 0, [0.048, tall, 0.044]);
    b.put(k.box, 'gold', [sx * (w / 2 - 0.024), mid, d / 2 + 0.001], 0, [0.032, tall * 0.84, 0.004]);
    b.put(k.octa, 'jade', [sx * (w / 2 - 0.024), mid, d / 2 + 0.005], 0, [0.009, 0.015, 0.005]);
  }
  b.put(k.box, 'blue', [0, mid, d / 2 - 0.042], 0, [w - 0.096, tall * 0.84, 0.004]);
  for (let i = 0; i < 2; i += 1) b.put(k.box, 'gold', [0, y0 + 0.006 + i * (tall - 0.012), d / 2 - 0.04], 0, [w - 0.096, 0.004, 0.004]);
  // the cornice, a band of gold under the top slab
  b.put(k.box, 'gold', [0, y1 + 0.004, 0], 0, [w + 0.012, 0.008, d + 0.012]);
  b.put(k.box, 'red', [0, y1 + 0.018, 0], 0, [w + 0.026, 0.02, d + 0.026]);
  b.put(k.box, 'gold', [0, y1 + 0.029, 0], 0, [w + 0.03, 0.004, d + 0.03]);
  const top = y1 + 0.031;
  // the snow lions, one to either side of the face, looking out, their
  // manes against the cornice they bear up
  for (const sx of [-1, 1]) snowLion(b, { x: sx * w * 0.29, y: y0 - 0.006, z: d / 2 - 0.028, s: tall * 0.98, ry: sx * 0.16 });
  // the brocade over the top, hanging down the middle: gold, a blue panel
  // at its heart, the border red, a fringe at the hem
  const half = w * 0.15;
  const edge = [[-half, top - 0.002, d / 2 + 0.016], [0, top - 0.002, d / 2 + 0.02], [half, top - 0.002, d / 2 + 0.016]];
  b.put(clothFall(b.THREE, edge, { fall: () => tall + 0.01, pleats: 1.5, depth: 0.002, thick: 0.003, steps: 10, rows: 6,
    drift: (t, s) => [0, 0, 0.006 * s],
    colour: (t, s) => rgbOf(b, t < 0.13 || t > 0.87 || s > 0.82 ? 'red' : 'gold') }), 'gold');
  b.put(k.octa, 'blue', [0, top - tall * 0.42, d / 2 + 0.026], 0, [0.012, 0.018, 0.006]);
  for (let i = 0; i < 9; i += 1) b.ell('red', [-half * 0.88 + i * half * 0.22, top - tall - 0.012, d / 2 + 0.026], 0.0045);
  return top;
}

/* A cushion with its border of brocade piped along the top edges. */
function cushion(b, { x = 0, y = 0, z = 0, w = 0.3, d = 0.24, h = 0.04, key = 'maroon', border = 'gold' } = {}) {
  b.put(b.kit.pillow, key, [x, y + h / 2, z], 0, [w, h, d]);
  if (border) {
    const t = y + h * 0.82, hw = w * 0.46, hd = d * 0.46;
    const corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [-hw, -hd]];
    for (let i = 0; i < 4; i += 1) b.beam(border, [x + corners[i][0], t, z + corners[i][1]], [x + corners[i + 1][0], t, z + corners[i + 1][1]], Math.min(w, d) * 0.018);
  }
  return y + h * 0.9;
}

/* A teaching throne: a plinth banded in gold, the body of the throne with
   its jewels and the brocade hanging over its face, three cushions laid one
   on another, and a low back. Returns the top. */
function teachingThrone(b, { y = 0, w = 0.44, d = 0.3, h = 0.13, body = 'red' } = {}) {
  const k = b.kit;
  b.put(k.box, 'crimson', [0, y + 0.011, 0], 0, [w + 0.03, 0.022, d + 0.03]);
  b.put(k.box, 'gold', [0, y + 0.024, 0], 0, [w + 0.034, 0.005, d + 0.034]);
  const y0 = y + 0.026, y1 = y + h;
  b.put(k.box, body, [0, (y0 + y1) / 2, 0], 0, [w, y1 - y0, d]);
  b.put(k.box, 'gold', [0, y1 - 0.006, 0], 0, [w + 0.008, 0.012, d + 0.008]);
  for (const sx of [-1, 1]) for (let i = 0; i < 2; i += 1) {
    b.put(k.octa, i ? 'blue' : 'jade', [sx * w * (0.38 - i * 0.08), (y0 + y1) / 2, d / 2 + 0.004], 0, [0.01, 0.016, 0.005]);
  }
  // the brocade over the face: a gold field, a blue band, the edge red
  const half = w * 0.26;
  const edge = [[-half, y1 - 0.004, d / 2 + 0.008], [0, y1 - 0.004, d / 2 + 0.011], [half, y1 - 0.004, d / 2 + 0.008]];
  b.put(clothFall(b.THREE, edge, { fall: () => y1 - y0 - 0.012, pleats: 2.5, depth: 0.0025, thick: 0.003, steps: 12, rows: 5,
    drift: (t, s) => [0, 0, 0.004 * s],
    colour: (t, s) => rgbOf(b, t < 0.07 || t > 0.93 || s > 0.88 ? 'red' : s > 0.74 || t < 0.16 || t > 0.84 ? 'blue' : 'gold') }), 'gold');
  // the cushions, the lowest the broadest
  let top = y1;
  for (const [cw, ch, key, border] of [[0.94, 0.03, 'maroon', 'gold'], [0.88, 0.026, 'saffron', 'red'], [0.82, 0.026, 'red', 'gold']]) {
    top = cushion(b, { y: top - 0.003, w: w * cw, d: d * cw, h: ch, key, border });
  }
  b.put(k.pillow, 'maroon', [0, top + 0.05, -d * 0.4], [-0.08, 0, 0], [w * 0.78, 0.11, 0.035]);
  b.put(k.box, 'gold', [0, top + 0.104, -d * 0.4], [-0.08, 0, 0], [w * 0.8, 0.008, 0.04]);
  return top;
}

/* A seat for the practice of a monk: a low base of wood and on it the
   cushion with its border. */
function meditationSeat(b, { y = 0, z = 0, w = 0.4, d = 0.3, key = 'maroon', border = 'gold', base = 'wood' } = {}) {
  b.put(b.kit.box, base, [0, y + 0.02, z], 0, [w, 0.04, d]);
  b.put(b.kit.box, base + '~', [0, y + 0.004, z], 0, [w + 0.012, 0.008, d + 0.012]);
  return cushion(b, { y: y + 0.04, z, w: w * 0.9, d: d * 0.9, h: 0.045, key, border });
}

/* A mat of kuśa grass, the seat of those who sit in the forest. */
function grassMat(b, { x = 0, y = 0, z = 0, w = 0.36, d = 0.26, key = 'fawn' } = {}) {
  b.put(b.kit.pillow, key, [x, y + 0.008, z], 0, [w, 0.016, d]);
  for (let i = 0; i < 7; i += 1) b.put(b.kit.box, key + '~', [x - w * 0.42 + i * w * 0.14, y + 0.0165, z], 0, [0.004, 0.002, d * 0.86]);
  return y + 0.014;
}

/* A boulder to sit on, rough and worn. Returns its top. */
function boulder(b, { x = 0, y = 0, z = 0, w = 0.3, h = 0.12, d = 0.22, key = 'rock', seed = 5 } = {}) {
  b.put(b.kit.boulder(seed), key, [x, y + h * 0.6, z], [0, seed * 0.7, 0], [w / 2, h / 1.1, d / 2]);
  b.put(b.kit.boulder(seed + 1), key + '~', [x + w * 0.3, y + h * 0.25, z + d * 0.25], [0, seed, 0], [w * 0.2, h * 0.3, d * 0.18]);
  return y + h * 0.6 + h / 1.1 * 0.5;
}

/* A vajra along local y, one unit long at s = 1. */
function vajra(b, { x = 0, y = 0, z = 0, s = 0.4, r = [0, 0, 0], key = 'gold', half = false } = {}) {
  b.at([x, y, z], r, s, () => {
    const k = b.kit;
    b.put(k.ball, key, [0, 0, 0], 0, 0.07);
    for (const dir of half ? [1] : [1, -1]) {
      b.put(k.ball, key, [0, dir * 0.11, 0], 0, [0.08, 0.06, 0.08]);
      b.put(k.torus(0.3), key, [0, dir * 0.17, 0], [PI / 2, 0, 0], 0.06);
      b.beam(key, [0, dir * 0.15, 0], [0, dir * 0.5, 0], 0.025, 0.01);
      for (let i = 0; i < 4; i += 1) {
        const a = i / 4 * TAU + PI / 4;
        const cx = Math.cos(a), cz = Math.sin(a);
        b.path(key, [[cx * 0.05, dir * 0.18, cz * 0.05], [cx * 0.13, dir * 0.30, cz * 0.13], [cx * 0.03, dir * 0.47, cz * 0.03]], 0.02, 0.01);
      }
    }
  });
}

/* The crossed vajra: four vajra heads about one hub, in the plane facing us. */
function crossedVajra(b, { x = 0, y = 0.5, z = 0, s = 0.6, key = 'blue', hub = 'navy' } = {}) {
  b.at([x, y, z], 0, s, () => {
    vajra(b, { s: 1, key });
    vajra(b, { s: 1, key, r: [0, 0, PI / 2] });
    b.put(b.kit.sphere, hub, [0, 0, 0.02], 0, 0.11);
  });
}

function bell(b, { x = 0, y = 0, z = 0, s = 1, key = 'silver', handle = 'gold' } = {}) {
  b.at([x, y, z], 0, s, () => {
    const body = b.kit.lathe('bell', [[0, 0.24], [0.06, 0.23], [0.09, 0.17], [0.11, 0.06], [0.14, 0.01], [0.13, 0], [0.10, 0.04], [0, 0.04]], 24);
    b.put(body, key);
    b.put(b.kit.torus(0.12), handle, [0, 0.015, 0], [PI / 2, 0, 0], 0.135);
    b.put(b.kit.sphere, handle, [0, 0.27, 0], 0, [0.03, 0.04, 0.03]);
    b.put(b.kit.sphere, handle, [0, 0.33, 0], 0, 0.035);
    vajra(b, { y: 0.36, s: 0.24, key: handle, half: true });
  });
}

/* The vase of empowerment, a bumpa, with a crest of peacock feathers. */
function vase(b, { x = 0, y = 0, z = 0, s = 1, key = 'gold', crest = true, spout = false } = {}) {
  b.at([x, y, z], 0, s, () => {
    const body = b.kit.lathe('vase', [[0, 0], [0.08, 0], [0.09, 0.02], [0.06, 0.04], [0.13, 0.10], [0.16, 0.18],
      [0.13, 0.27], [0.05, 0.31], [0.045, 0.37], [0.08, 0.40], [0.07, 0.42], [0, 0.42]], 24);
    b.put(body, key);
    b.put(b.kit.torus(0.2), 'red', [0, 0.30, 0], [PI / 2, 0, 0], 0.06);
    if (spout) b.beam(key, [0.1, 0.22, 0], [0.22, 0.34, 0], 0.025, 0.014);
    if (crest) {
      for (let i = 0; i < 5; i += 1) {
        const a = (i - 2) * 0.32;
        b.beam('green', [0, 0.42, 0], [Math.sin(a) * 0.12, 0.62, -0.01], 0.006);
        b.put(b.kit.sphere, 'jade', [Math.sin(a) * 0.12, 0.63, -0.01], [0, 0, -a], [0.03, 0.05, 0.012]);
        b.put(b.kit.sphere, 'navy', [Math.sin(a) * 0.12, 0.632, 0.003], 0, 0.012);
      }
    }
  });
}

/* A wheel in the plane facing us, axle along z. */
function wheel(b, { x = 0, y = 0.5, z = 0, s = 0.35, rim = 'gold', hub = 'gold', spokes = 8, tips = null, bosses = null } = {}) {
  b.at([x, y, z], 0, s, () => {
    const k = b.kit;
    b.put(k.torus(0.08), rim, [0, 0, 0], 0, 1);
    b.put(k.torus(0.05), rim, [0, 0, 0], 0, 0.8);
    b.put(k.cyl, hub, [0, 0, 0], [PI / 2, 0, 0], [0.2, 0.12, 0.2]);
    b.put(k.sphere, hub, [0, 0, 0.06], 0, [0.1, 0.1, 0.06]);
    for (let i = 0; i < spokes; i += 1) {
      const a = i / spokes * TAU;
      b.beam(hub, [Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0], [Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0], 0.045, 0.03);
      if (tips) b.put(k.cone, tips, [Math.cos(a) * 1.16, Math.sin(a) * 1.16, 0], [0, 0, a - PI / 2], [0.07, 0.22, 0.05]);
      if (bosses) b.put(k.sphere, bosses, [Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0.04], 0, 0.1);
    }
  });
}

/* The wish-granting jewel: three gems standing together, flames round them. */
function jewels(b, { x = 0, y = 0, z = 0, s = 1, keys = ['blue', 'red', 'jade'], flames = true } = {}) {
  b.at([x, y, z], 0, s, () => {
    const k = b.kit;
    b.put(k.octa, keys[0], [0, 0.17, 0], [0, PI / 4, 0], [0.07, 0.12, 0.07]);
    b.put(k.octa, keys[1], [-0.08, 0.08, 0.02], [0, PI / 4, 0], [0.06, 0.09, 0.06]);
    b.put(k.octa, keys[2], [0.08, 0.08, 0.02], [0, PI / 4, 0], [0.06, 0.09, 0.06]);
    if (flames) flameRing(b, { cy: 0.12, z: -0.06, R: 0.15, n: 7, from: 0, to: 1, h: 0.09, w: 0.06, keys: ['flame', 'ember'] });
  });
}

/* A palace in tiers, each a hall with a flared, pyramidal roof. */
function pagoda(b, { x = 0, y = 0, z = 0, s = 1, tiers, finial = 'gold' } = {}) {
  b.at([x, y, z], 0, s, () => {
    const k = b.kit;
    let h = 0;
    for (const t of tiers) {
      const { w, hh = 0.1, body = 'white', roof = 'red', rh = w * 0.25, eave = 1.3, d = w, trim = 'gold' } = t;
      if (t.plinth) { b.put(k.box, t.plinth, [0, h + 0.02, 0], 0, [w * 1.2, 0.04, d * 1.2]); h += 0.04; }
      b.put(k.box, body, [0, h + hh / 2, 0], 0, [w, hh, d]);
      if (t.door) b.put(k.box, t.door, [0, h + hh * 0.4, d / 2 + 0.002], 0, [w * 0.24, hh * 0.7, 0.01]);
      if (trim) b.put(k.box, trim, [0, h + hh - 0.006, 0], 0, [w + 0.01, 0.012, d + 0.01]);
      h += hh;
      b.put(k.box, roof, [0, h + 0.008, 0], 0, [w * eave, 0.016, d * eave]);
      b.put(k.pyramid, roof, [0, h + rh / 2 + 0.012, 0], 0, [w * eave * 0.72, rh, d * eave * 0.72]);
      h += t.stack === false ? rh : rh * 0.45;
    }
    b.put(k.sphere, finial, [0, h + 0.04, 0], 0, 0.03);
    b.put(k.cone, finial, [0, h + 0.1, 0], 0, [0.018, 0.08, 0.018]);
  });
}

/* A mountain: a rough cone with a cap of snow. */
function mountain(b, { x = 0, y = 0, z = 0, h = 0.5, r = 0.2, key = 'rock', snow = 'snow', seed = 3, cap = 0.3 } = {}) {
  const rnd = seeded(seed);
  const turn = rnd() * TAU;
  const geo = b.kit.once('peak:' + seed, () => {
    const g = new b.THREE.ConeGeometry(1, 1, 7, 3);
    const pos = g.attributes.position;
    const r2 = seeded(seed * 31 + 1);
    for (let i = 0; i < pos.count; i += 1) {
      const py = pos.getY(i);
      if (py > 0.49) continue;
      const j = 1 + (r2() - 0.5) * 0.35;
      pos.setXYZ(i, pos.getX(i) * j, py + (py > -0.49 ? (r2() - 0.5) * 0.08 : 0), pos.getZ(i) * j);
    }
    g.computeVertexNormals();
    return g;
  });
  b.put(geo, key, [x, y + h / 2, z], [0, turn, 0], [r, h, r * 0.85]);
  if (snow) b.put(geo, snow, [x, y + h * (1 - cap / 2) + 0.004, z], [0, turn, 0], [r * cap * 1.04, h * cap, r * cap * 0.9]);
}

/* A tree: trunk and a crown of rounded masses. */
function tree(b, { x = 0, y = 0, z = 0, h = 0.6, r = 0.2, trunk = 'wood', leaf = 'leaf', fruit = null, seed = 5, n = 6 } = {}) {
  const rnd = seeded(seed);
  // a trunk that flares at the root, and boughs that fork as they climb
  b.beam(trunk, [x, y, z], [x, y + h * 0.6, z], r * 0.17, r * 0.1);
  for (const sx of [-1, 1]) b.beam(trunk, [x, y + r * 0.05, z], [x + sx * r * 0.22, y + r * 0.03, z + 0.02], r * 0.05, r * 0.03);
  const boughs = [];
  for (let i = 0; i < 4; i += 1) {
    const a = i / 4 * TAU + rnd() * 0.8;
    const from = [x, y + h * (0.42 + i * 0.06), z];
    const to = [x + Math.cos(a) * r * 0.7, y + h * (0.68 + rnd() * 0.12), z + Math.sin(a) * r * 0.45];
    b.beam(trunk, from, to, r * 0.075, r * 0.04);
    boughs.push(to);
  }
  // the crown: clusters of foliage over the boughs, in light and in shade
  const shade = leaf + '~';
  for (let i = 0; i < n * 2; i += 1) {
    const a = i / (n * 2) * TAU + rnd();
    const rr = r * (0.3 + rnd() * 0.2);
    const lift = rnd();
    const p = [x + Math.cos(a) * r * (0.45 + rnd() * 0.25), y + h * (0.68 + lift * 0.28), z + Math.sin(a) * r * (0.32 + rnd() * 0.15)];
    b.put(b.kit.ball, lift < 0.35 ? shade : leaf, p, [rnd(), rnd(), 0], [rr * 1.15, rr * 0.85, rr]);
    if (fruit && i % 3 === 0) b.put(b.kit.octa, fruit, [p[0], p[1] - rr * 0.55, p[2] + rr * 0.65], 0, [0.022, 0.036, 0.022]);
  }
  boughs.forEach((p, i) => b.put(b.kit.ball, i % 2 ? leaf : shade, [p[0], p[1] + r * 0.08, p[2]], 0, [r * 0.38, r * 0.3, r * 0.34]));
  b.put(b.kit.ball, leaf, [x, y + h * 0.95, z], 0, [r * 0.55, r * 0.42, r * 0.5]);
}

/* ── animals ─────────────────────────────────────────────────────────────
   Drawn in profile, facing +x, so the side is towards the viewer, standing
   on y = 0 at s = 1. Each is built from the same anatomy: chest, barrel and
   haunch; a neck and a head with its muzzle; four jointed legs, each a list of
   joints from shoulder or hip to the ground, ending in a hoof or a foot. The
   species differ in proportion and in what they carry: antlers, horns, hump
   and dewlap, mane, trunk and tusks. */
const flip = (z) => (p) => [p[0], p[1], p[2] * z];

/* A leg: joints from the body down, tapering, with a hoof or a pad. */
function leg(b, key, joints, r0, r1, foot = null, footR = r1 * 1.15) {
  b.path(key, joints, r0, r1);
  const end = joints[joints.length - 1];
  if (foot) b.put(b.kit.cyl, foot, [end[0], end[1] + footR * 0.5, end[2]], 0, [footR, footR * 1.1, footR]);
}

/* Legs for each pose, as [shoulder-or-hip, joints…, ground] in x and y. */
const LEGS = {
  horse: {
    stand: { front: [[0.13, 0.17], [0.14, 0.09], [0.14, 0.035], [0.15, 0.0]], frontFar: [[0.12, 0.17], [0.12, 0.09], [0.12, 0.035], [0.125, 0.0]],
      hind: [[-0.13, 0.18], [-0.17, 0.09], [-0.15, 0.035], [-0.145, 0.0]], hindFar: [[-0.12, 0.18], [-0.15, 0.09], [-0.13, 0.035], [-0.125, 0.0]] },
    leap: { front: [[0.13, 0.17], [0.21, 0.14], [0.17, 0.08], [0.19, 0.055]], frontFar: [[0.12, 0.17], [0.19, 0.17], [0.16, 0.11], [0.18, 0.085]],
      hind: [[-0.13, 0.18], [-0.19, 0.1], [-0.26, 0.05], [-0.29, 0.035]], hindFar: [[-0.12, 0.18], [-0.15, 0.09], [-0.18, 0.03], [-0.185, 0.0]] }
  },
  deer: {
    stand: { front: [[0.1, 0.17], [0.11, 0.09], [0.11, 0.03], [0.115, 0.0]], frontFar: [[0.09, 0.17], [0.085, 0.09], [0.08, 0.03], [0.085, 0.0]],
      hind: [[-0.1, 0.18], [-0.14, 0.1], [-0.12, 0.03], [-0.115, 0.0]], hindFar: [[-0.09, 0.18], [-0.12, 0.1], [-0.1, 0.03], [-0.095, 0.0]] },
    /* Folded under, as the deer of Sārnāth lie before the wheel. */
    kneel: { front: [[0.1, 0.06], [0.155, 0.018], [0.08, 0.012]], frontFar: [[0.09, 0.06], [0.14, 0.018], [0.06, 0.012]],
      hind: [[-0.1, 0.07], [-0.03, 0.02], [-0.13, 0.012]], hindFar: [[-0.09, 0.07], [-0.02, 0.02], [-0.12, 0.012]] }
  },
  cow: {
    stand: { front: [[0.12, 0.13], [0.125, 0.07], [0.125, 0.025], [0.13, 0.0]], frontFar: [[0.1, 0.13], [0.1, 0.07], [0.1, 0.025], [0.105, 0.0]],
      hind: [[-0.13, 0.14], [-0.165, 0.075], [-0.145, 0.025], [-0.14, 0.0]], hindFar: [[-0.11, 0.14], [-0.14, 0.075], [-0.12, 0.025], [-0.115, 0.0]] }
  },
  elephant: {
    stand: { front: [[0.12, 0.2], [0.125, 0.1], [0.125, 0.0]], frontFar: [[0.1, 0.2], [0.1, 0.1], [0.1, 0.0]],
      hind: [[-0.12, 0.2], [-0.13, 0.1], [-0.125, 0.0]], hindFar: [[-0.1, 0.2], [-0.11, 0.1], [-0.105, 0.0]] }
  }
};

function legsOf(b, kind, pose, key, wide, r0, r1, foot) {
  const set = LEGS[kind][pose] || LEGS[kind].stand;
  const at = (pts, z) => pts.map(([x, y]) => [x, y, z]);
  leg(b, key, at(set.front, wide), r0, r1, foot);
  leg(b, key, at(set.frontFar, -wide), r0, r1, foot);
  leg(b, key, at(set.hind, wide), r0 * 1.1, r1, foot);
  leg(b, key, at(set.hindFar, -wide), r0 * 1.1, r1, foot);
}

function horse(b, { key = 'white', mane = 'bone', pose = 'stand', trappings = true } = {}) {
  const k = b.kit;
  const lift = pose === 'leap' ? 0.02 : 0;
  b.at([0, lift, 0], 0, 1, () => {
    b.blob(key, [-0.15, 0.205, 0], [0.15, 0.2, 0], 0.07, 0.062);
    b.put(k.sphere, key, [0.12, 0.19, 0], 0, [0.07, 0.08, 0.066]);
    b.put(k.sphere, key, [-0.125, 0.205, 0], 0, [0.08, 0.077, 0.068]);
    for (const z of [-1, 1]) {
      b.blob(key, [0.13, 0.21, z * 0.04], [0.13, 0.12, z * 0.045], 0.035, 0.025);
      b.blob(key, [-0.12, 0.215, z * 0.04], [-0.155, 0.11, z * 0.045], 0.045, 0.03);
    }
    legsOf(b, 'horse', pose, key, 0.042, 0.022, 0.013, 'slate');
    // neck and head
    b.blob(key, [0.12, 0.22, 0], [0.21, 0.35, 0], 0.052, 0.04);
    b.put(k.sphere, key, [0.225, 0.355, 0], 0, [0.042, 0.04, 0.036]);
    b.blob(key, [0.225, 0.35, 0], [0.295, 0.285, 0], 0.03, 0.025);
    b.put(k.ball, 'slate', [0.296, 0.282, 0], 0, [0.018, 0.016, 0.022]);
    for (const z of [-1, 1]) {
      b.put(k.cone, key, [0.21, 0.4, z * 0.018], [z * 0.15, 0, -0.25], [0.01, 0.045, 0.012]);
      b.put(k.ball, 'black', [0.245, 0.36, z * 0.031], 0, 0.006);
    }
    // the mane along the crest, the forelock and the tail
    for (let i = 0; i <= 6; i += 1) {
      const t = i / 6;
      b.put(k.sphere, mane, [0.205 - t * 0.1, 0.39 - t * 0.12, -0.004], [0, 0, 0.9], [0.012, 0.03, 0.03]);
    }
    b.put(k.sphere, mane, [0.235, 0.39, 0], [0, 0, -0.6], [0.012, 0.025, 0.02]);
    const tail = pose === 'leap'
      ? [[-0.19, 0.24, 0], [-0.24, 0.26, 0.005], [-0.29, 0.245, -0.005], [-0.33, 0.215, 0.008], [-0.37, 0.205, 0]]
      : [[-0.19, 0.24, 0], [-0.25, 0.21, 0], [-0.27, 0.14, 0.005], [-0.26, 0.08, -0.005], [-0.25, 0.04, 0]];
    b.path(mane, tail, 0.026, 0.014);
    b.put(k.sphere, mane, tail[tail.length - 1], 0, [0.022, 0.016, 0.018]);
    if (trappings) {
      // saddle cloth with a gilt edge, bridle and plume
      b.put(k.box, 'red', [-0.01, 0.27, 0], 0, [0.13, 0.012, 0.15]);
      for (const z of [-1, 1]) {
        b.put(k.box, 'red', [-0.01, 0.22, z * 0.073], 0, [0.12, 0.09, 0.006]);
        b.put(k.box, 'gold', [-0.01, 0.175, z * 0.074], 0, [0.125, 0.012, 0.006]);
        b.path('gold', [[0.215, 0.37, z * 0.035], [0.255, 0.33, z * 0.03], [0.28, 0.295, z * 0.028]], 0.004);
      }
      b.put(k.cyl, 'saffron', [-0.01, 0.282, 0], 0, [0.04, 0.02, 0.05]);
      b.blob('gold', [0.13, 0.225, 0], [0.16, 0.255, 0], 0.075, 0.072);
      b.put(k.cone, 'red', [0.22, 0.425, 0], [0, 0, -0.3], [0.014, 0.05, 0.014]);
    }
  });
}

function deer(b, { key = 'fawn', pose = 'stand', antlers = true, spots = true, antlerSize = 1 } = {}) {
  const k = b.kit;
  const low = pose === 'kneel' ? -0.12 : 0;
  b.at([0, low, 0], 0, 1, () => {
    b.blob(key, [-0.115, 0.205, 0], [0.11, 0.2, 0], 0.055, 0.048);
    b.put(k.sphere, key, [0.095, 0.2, 0], 0, [0.055, 0.064, 0.05]);
    b.put(k.sphere, key, [-0.095, 0.21, 0], 0, [0.06, 0.06, 0.05]);
    b.put(k.sphere, 'white', [-0.15, 0.215, 0], 0, [0.018, 0.035, 0.035]);
    b.put(k.sphere, 'white', [0.0, 0.165, 0], 0, [0.09, 0.025, 0.04]);
    if (spots) {
      const rnd = seeded(31);
      for (let i = 0; i < 7; i += 1) {
        const x = -0.09 + rnd() * 0.17, y = 0.205 + rnd() * 0.04;
        for (const z of [-1, 1]) b.put(k.octa, 'white', [x, y, z * 0.046], 0, [0.008, 0.007, 0.004]);
      }
    }
  });
  if (pose === 'kneel') {
    const set = LEGS.deer.kneel;
    for (const [pts, z] of [[set.front, 0.035], [set.frontFar, -0.035], [set.hind, 0.04], [set.hindFar, -0.04]]) {
      leg(b, key, pts.map(([x, y]) => [x, y, z]), 0.016, 0.01, 'black', 0.009);
    }
  } else {
    for (const z of [-1, 1]) {
      b.blob(key, [0.1, 0.21, z * 0.03], [0.105, 0.13, z * 0.033], 0.025, 0.016);
      b.blob(key, [-0.095, 0.215, z * 0.032], [-0.125, 0.12, z * 0.034], 0.035, 0.02);
    }
    legsOf(b, 'deer', 'stand', key, 0.033, 0.014, 0.008, 'black');
  }
  b.at([0, low, 0], 0, 1, () => {
    b.blob(key, [0.1, 0.22, 0], [0.155, 0.335, 0], 0.032, 0.024);
    b.put(k.sphere, key, [0.165, 0.345, 0], 0, [0.032, 0.03, 0.026]);
    b.blob(key, [0.165, 0.34, 0], [0.22, 0.312, 0], 0.02, 0.014);
    b.put(k.ball, 'black', [0.222, 0.31, 0], 0, 0.009);
    for (const z of [-1, 1]) {
      b.put(k.sphere, key, [0.148, 0.37, z * 0.03], [z * 0.7, 0, -0.3], [0.01, 0.03, 0.016]);
      b.put(k.ball, 'black', [0.18, 0.352, z * 0.022], 0, 0.005);
      if (antlers) b.at([0.155, 0.37, 0], 0, antlerSize, () => b.at([-0.155, -0.37, 0], 0, 1, () => {
        const s = z;
        const beam = [[0.155, 0.37, s * 0.014], [0.14, 0.42, s * 0.035], [0.12, 0.47, s * 0.05], [0.115, 0.52, s * 0.055], [0.13, 0.56, s * 0.05]];
        b.path('bone', beam, 0.007, 0.003);
        b.path('bone', [beam[1], [0.175, 0.44, s * 0.04], [0.185, 0.47, s * 0.04]], 0.005, 0.0025);
        b.path('bone', [beam[2], [0.16, 0.5, s * 0.055], [0.165, 0.53, s * 0.055]], 0.0045, 0.0025);
        b.path('bone', [beam[3], [0.09, 0.55, s * 0.06]], 0.004, 0.002);
      }));
    }
    b.put(k.cone, key, [-0.16, 0.235, 0], [0, 0, 0.9], [0.012, 0.03, 0.01]);
  });
}

function cow(b, { key = 'white', patch = 'wood' } = {}) {
  const k = b.kit;
  b.blob(key, [-0.14, 0.185, 0], [0.13, 0.18, 0], 0.08, 0.07);
  b.put(k.sphere, key, [0.12, 0.175, 0], 0, [0.07, 0.08, 0.07]);
  b.put(k.sphere, key, [-0.13, 0.19, 0], 0, [0.075, 0.078, 0.07]);
  b.put(k.sphere, key, [0.095, 0.265, 0], 0, [0.05, 0.045, 0.038]);       // hump
  b.put(k.sphere, key, [0.18, 0.13, 0], [0, 0, 0.4], [0.045, 0.065, 0.016]); // dewlap
  for (const z of [-1, 1]) {
    b.put(k.sphere, patch, [-0.02, 0.2, z * 0.066], [0, 0, 0.3], [0.06, 0.045, 0.012]);
    b.put(k.sphere, patch, [-0.13, 0.205, z * 0.064], 0, [0.035, 0.04, 0.012]);
    b.blob(key, [0.12, 0.2, z * 0.04], [0.125, 0.1, z * 0.045], 0.035, 0.025);
    b.blob(key, [-0.12, 0.21, z * 0.04], [-0.16, 0.1, z * 0.045], 0.045, 0.03);
  }
  legsOf(b, 'cow', 'stand', key, 0.045, 0.03, 0.019, 'slate');
  b.blob(key, [0.13, 0.2, 0], [0.2, 0.245, 0], 0.052, 0.04);
  b.put(k.sphere, key, [0.215, 0.25, 0], 0, [0.042, 0.042, 0.037]);
  b.blob(key, [0.215, 0.245, 0], [0.262, 0.172, 0], 0.036, 0.03);
  b.put(k.ball, 'rose', [0.266, 0.168, 0], 0, [0.022, 0.018, 0.026]);
  for (const z of [-1, 1]) {
    b.path('bone', [[0.207, 0.285, z * 0.025], [0.2, 0.315, z * 0.065], [0.215, 0.355, z * 0.07], [0.235, 0.37, z * 0.055]], 0.009, 0.003);
    b.put(k.sphere, key, [0.198, 0.268, z * 0.058], [z * 0.3, 0, 0], [0.014, 0.011, 0.03]);
    b.put(k.ball, 'black', [0.235, 0.262, z * 0.034], 0, 0.006);
  }
  b.path(key, [[-0.2, 0.22, 0], [-0.215, 0.15, 0], [-0.205, 0.07, 0]], 0.007, 0.005);
  b.put(k.sphere, 'black', [-0.204, 0.055, 0], 0, [0.012, 0.025, 0.012]);
}

function elephant(b, { key = 'white', tusks = 1, trappings = true } = {}) {
  const k = b.kit;
  b.put(k.sphere, key, [0.0, 0.265, 0], 0, [0.2, 0.125, 0.12]);
  b.put(k.sphere, key, [-0.12, 0.265, 0], 0, [0.1, 0.12, 0.11]);
  b.put(k.sphere, key, [0.1, 0.29, 0], 0, [0.1, 0.11, 0.11]);
  legsOf(b, 'elephant', 'stand', key, 0.065, 0.048, 0.042, null);
  for (const [x, z] of [[0.125, 0.065], [0.1, -0.065], [-0.125, 0.065], [-0.105, -0.065]]) {
    b.put(k.cyl, key, [x, 0.02, z], 0, [0.05, 0.04, 0.05]);
    for (let i = -1; i <= 1; i += 1) b.put(k.ball, 'bone', [x + 0.045, 0.012, z + i * 0.022], 0, [0.008, 0.01, 0.01]);
  }
  // the great head, the domed brow, the ears
  b.put(k.sphere, key, [0.23, 0.31, 0], 0, [0.085, 0.1, 0.08]);
  b.blob(key, [0.2, 0.36, 0], [0.27, 0.25, 0], 0.07, 0.065);
  for (const z of [-1, 1]) {
    b.put(k.sphere, key, [0.235, 0.395, z * 0.03], 0, 0.042);
    b.put(k.sphere, key, [0.17, 0.32, z * 0.085], [0, z * -0.25, 0.15], [0.05, 0.075, 0.012]);
    b.put(k.sphere, 'rose', [0.172, 0.32, z * 0.08], [0, z * -0.25, 0.15], [0.038, 0.058, 0.008]);
    b.put(k.ball, 'black', [0.272, 0.33, z * 0.052], 0, 0.007);
    // tusks: one to a side, or three, fanned, for the elephant of the dream
    for (let i = 0; i < tusks; i += 1) {
      const t = tusks === 1 ? 0 : (i - 1);
      const y = 0.235 + t * 0.03, spread = 0.035 + Math.abs(t) * 0.012;
      b.path('bone', [[0.275, y, z * spread], [0.33, y - 0.035 + t * 0.012, z * (spread + 0.012)], [0.38, y - 0.02 + t * 0.03, z * (spread + 0.018)]], 0.012, 0.004);
    }
  }
  // the trunk, hanging and curling forward at its tip
  b.path(key, [[0.285, 0.27, 0], [0.315, 0.2, 0], [0.325, 0.12, 0], [0.32, 0.06, 0], [0.335, 0.03, 0], [0.36, 0.045, 0], [0.365, 0.075, 0]], 0.045, 0.013);
  b.path(key, [[-0.2, 0.3, 0], [-0.23, 0.22, 0], [-0.225, 0.14, 0]], 0.008, 0.006);
  b.put(k.sphere, 'black', [-0.225, 0.125, 0], 0, [0.012, 0.024, 0.012]);
  if (trappings) {
    // a short cloth over the back, hanging to mid-flank, gilt at its hem
    b.put(k.dome, 'red', [-0.01, 0.31, 0], 0, [0.13, 0.085, 0.127]);
    for (const z of [-1, 1]) {
      b.put(k.box, 'red', [-0.01, 0.305, z * 0.118], [z * 0.25, 0, 0], [0.15, 0.08, 0.006]);
      b.put(k.box, 'gold', [-0.01, 0.262, z * 0.127], [z * 0.25, 0, 0], [0.155, 0.014, 0.006]);
      for (let i = 0; i < 4; i += 1) b.put(k.ball, 'gold', [-0.07 + i * 0.04, 0.245, z * 0.13], 0, 0.008);
    }
    b.put(k.disc, 'gold', [0.3, 0.36, 0], [0, 0, PI / 2 - 0.6], [0.03, 0.01, 0.03]);
    b.put(k.ball, 'red', [0.305, 0.362, 0], 0, 0.012);
    for (const [x, z] of [[0.125, 0.065], [0.1, -0.065], [-0.125, 0.065], [-0.105, -0.065]]) {
      b.put(k.torus(0.2), 'gold', [x, 0.06, z], [PI / 2, 0, 0], 0.05);
    }
  }
}

/* The animals as the recipes call for them, set down at x, y, z, turned by
   ry and scaled by s. */
function animal(b, kind, { x = 0, y = 0, z = 0, s = 1, ry = 0, ...o } = {}) {
  b.at([x, y, z], [0, ry, 0], s, () => ({ horse, deer, cow, elephant })[kind](b, o));
}

/* Sea: banded, rounded waves like the board's own, white over blue. */
function waves(b, { y = 0, w = 0.9, d = 0.5, bands = ['blue', 'sky', 'white', 'blue'] } = {}) {
  bands.forEach((key, i) => {
    const t = i / bands.length;
    b.put(b.kit.sphere, key, [0, y + 0.03 + i * 0.03, -t * 0.04], 0, [w / 2 * (1 - t * 0.1), 0.035, d / 2 * (1 - t * 0.15)]);
  });
}

/* A flat band along a list of points, lying in the horizontal as far as it
   can: the roads of the start. */
function ribbon(b, key, points, width, thick = 0.014) {
  const { THREE } = b;
  const P = points.map((p) => new THREE.Vector3(...p));
  const up = new THREE.Vector3(0, 1, 0);
  const pos = [], index = [];
  P.forEach((p, i) => {
    const t = P[Math.min(i + 1, P.length - 1)].clone().sub(P[Math.max(i - 1, 0)]).normalize();
    const side = new THREE.Vector3().crossVectors(t, up).normalize().multiplyScalar(width / 2);
    const lift = new THREE.Vector3().crossVectors(side, t).normalize().multiplyScalar(thick / 2);
    for (const [a, c] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
      pos.push(p.x + side.x * a + lift.x * c, p.y + side.y * a + lift.y * c, p.z + side.z * a + lift.z * c);
    }
  });
  for (let i = 0; i < P.length - 1; i += 1) for (let k = 0; k < 4; k += 1) {
    const a = i * 4 + k, c = i * 4 + (k + 1) % 4, d = a + 4, e = c + 4;
    index.push(a, d, c, c, d, e);
  }
  const ends = [[0, 1, 2], [0, 2, 3]].map((f) => f.map((v) => v));
  const last = (P.length - 1) * 4;
  ends.forEach(([a, c, d]) => { index.push(a, d, c); index.push(last + a, last + c, last + d); });
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  /* The top face has to look up: if the winding came out the other way
     round, turn every triangle over. */
  const n = new THREE.Vector3(g.attributes.normal.getX(0), g.attributes.normal.getY(0), g.attributes.normal.getZ(0));
  const outward = new THREE.Vector3(pos[0] - P[0].x, pos[1] - P[0].y, pos[2] - P[0].z);
  if (n.dot(outward) < 0) {
    for (let i = 0; i < index.length; i += 3) [index[i + 1], index[i + 2]] = [index[i + 2], index[i + 1]];
    g.setIndex(index);
    g.computeVertexNormals();
  }
  b.put(g, key);
}

function sword(b, { x = 0, y = 0, z = 0, s = 1, r = [0, 0, 0], blade = 'silver', hilt = 'gold', flames = false } = {}) {
  b.at([x, y, z], r, s, () => {
    const k = b.kit;
    b.put(k.pyramid, blade, [0, 0.42, 0], 0, [0.05, 0.6, 0.012]);
    b.put(k.box, hilt, [0, 0.11, 0], 0, [0.14, 0.025, 0.03]);
    b.put(k.cyl, hilt, [0, 0.05, 0], 0, [0.016, 0.1, 0.016]);
    b.put(k.sphere, hilt, [0, -0.01, 0], 0, 0.028);
    if (flames) for (let i = 0; i < 5; i += 1) {
      const t = 0.18 + i * 0.13;
      fire(b, { x: (i % 2 ? 1 : -1) * 0.03, y: t, z: -0.01, h: 0.13 - i * 0.008, w: 0.06, lean: (i % 2 ? -0.5 : 0.5) });
    }
    if (flames) fire(b, { y: 0.66, h: 0.16, w: 0.07 });
  });
}

function skull(b, { x = 0, y = 0, z = 0, s = 1, key = 'bone' } = {}) {
  b.at([x, y, z], 0, s, () => {
    b.ell(key, [0, 0.066, -0.006], [0.058, 0.056, 0.06]);
    b.ell(key, [0, 0.03, 0.026], [0.045, 0.034, 0.036]);
    for (const side of [-1, 1]) b.ell('lash', [side * 0.021, 0.05, 0.048], [0.016, 0.017, 0.012]);
    if (b.scale() > 0.4) {
      for (const side of [-1, 1]) b.ell(key, [side * 0.042, 0.036, 0.02], [0.016, 0.014, 0.02]);
      b.ell('lash', [0, 0.03, 0.06], [0.007, 0.01, 0.006]);
      b.put(b.kit.box, key, [0, 0.006, 0.045], 0, [0.042, 0.014, 0.014]);
      b.put(b.kit.box, 'lash', [0, 0.011, 0.052], 0, [0.036, 0.002, 0.004]);
    }
  });
}

function lamp(b, { x = 0, y = 0, z = 0, s = 1, key = 'gold', flameH = 0.16 } = {}) {
  b.at([x, y, z], 0, s, () => {
    const cup = b.kit.lathe('lamp', [[0, 0], [0.06, 0], [0.025, 0.03], [0.02, 0.1], [0.07, 0.14], [0.08, 0.17], [0.06, 0.17], [0, 0.15]], 20);
    b.put(cup, key);
    fire(b, { y: 0.16, h: flameH, w: 0.05, keys: ['flame', 'ember'] });
  });
}

function kapala(b, { x = 0, y = 0, z = 0, s = 1 } = {}) {
  b.at([x, y, z], 0, s, () => {
    b.put(b.kit.bowl, 'bone', [0, 0.1, 0], 0, [0.15, 0.09, 0.12]);
    b.put(b.kit.disc, 'crimson', [0, 0.095, 0], 0, [0.135, 0.01, 0.105]);
    b.put(b.kit.sphere, 'white', [0.03, 0.105, 0.02], 0, [0.04, 0.012, 0.03]);
  });
}

function crown(b, { x = 0, y = 0, z = 0, s = 1, key = 'gold', gems = 'red' } = {}) {
  b.at([x, y, z], 0, s, () => {
    b.put(b.kit.torus(0.14), key, [0, 0.03, 0], [PI / 2, 0, 0], 0.13);
    for (let i = 0; i < 5; i += 1) {
      const a = (i - 2) * 0.55;
      const p = [Math.sin(a) * 0.12, 0.1, Math.cos(a) * 0.12];
      b.put(b.kit.petal, key, [p[0], 0.03, p[2]], [-0.2, a, 0, 'YXZ'], [0.06, 0.15, 0.02]);
      b.put(b.kit.sphere, gems, [p[0] * 1.08, 0.09, p[2] * 1.08], 0, 0.018);
    }
  });
}

function book(b, { x = 0, y = 0, z = 0, s = 1, key = 'red' } = {}) {
  b.at([x, y, z], 0, s, () => {
    b.put(b.kit.box, 'white', [0, 0.03, 0], 0, [0.26, 0.05, 0.09]);
    b.put(b.kit.box, key, [0, 0.062, 0], 0, [0.27, 0.014, 0.1]);
    b.put(b.kit.box, key, [0, 0.0, 0], 0, [0.27, 0.014, 0.1]);
  });
}

/* ── the destinations ───────────────────────────────────────────────────
   One recipe for each square that the world does not already build. The
   string says what is built, for the entry and for the record; the function
   builds it. */
const SQUARE_MODELS = {
  8: ['A boulder, a pillar and a tree in an ordinary landscape, and in each a being caught fast: the hells that last a day.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'grass', rimKey: 'red', inner: 'gold' });
    b.put(b.kit.ball, 'rock', [-0.19, 0.12, 0.02], [0.3, 0.5, 0], [0.13, 0.1, 0.11]);
    sufferer(b, { x: -0.19, y: 0.06, z: 0.08, s: 0.3, skin: 'skin', pose: 'reach', legs: false });
    b.put(b.kit.cyl, 'slate', [0.17, 0.25, 0.04], 0, [0.04, 0.42, 0.04]);
    b.put(b.kit.box, 'slate', [0.17, 0.47, 0.04], 0, [0.11, 0.025, 0.11]);
    sufferer(b, { x: 0.17, y: 0.1, z: 0.075, s: 0.36, skin: 'skin', pose: 'writhe' });
    for (const y2 of [0.17, 0.3]) b.put(b.kit.torus(0.2), 'iron', [0.17, y2, 0.04], [PI / 2, 0, 0], [0.065, 0.065, 0.06]);
    tree(b, { x: 0.0, z: -0.2, h: 0.55, r: 0.15, leaf: 'leaf', seed: 8 });
    sufferer(b, { x: 0.0, y: 0.1, z: -0.17, s: 0.3, skin: 'wood', pose: 'writhe', legs: false });
    b.put(b.kit.box, 'wood', [-0.02, 0.06, 0.2], [0, 0.4, 0], [0.12, 0.04, 0.05]);
  }],
  9: ['Yama’s mirror of karma, horned with the buffalo, in the red smoke of his court.', (b) => {
    cloud(b, { y: 0, w: 0.7, h: 0.11, key: 'red', under: 'crimson', seed: 9 });
    flameRing(b, { cy: 0.48, z: -0.14, R: 0.29, n: 11, h: 0.15, keys: ['red', 'crimson'] });
    b.beam('gold', [0, 0.1, -0.02], [0, 0.24, -0.02], 0.025);
    b.put(b.kit.disc, 'silver', [0, 0.48, 0], [PI / 2, 0, 0], [0.22, 0.03, 0.22]);
    b.put(b.kit.torus(0.12), 'gold', [0, 0.48, 0.005], 0, 0.23);
    for (const side of [-1, 1]) b.path('bone', [[side * 0.14, 0.66, 0], [side * 0.26, 0.74, 0], [side * 0.3, 0.86, 0.02]], 0.035, 0.008);
    b.put(b.kit.sphere, 'black', [0, 0.69, 0], 0, [0.09, 0.06, 0.06]);
  }],
  11: ['A spotted stag on a grassy rise, head up, listening for danger.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'grass', rimKey: 'red', inner: 'gold' });
    b.put(b.kit.dome, 'grass', [0, 0.04, 0], 0, [0.3, 0.06, 0.2]);
    animal(b, 'deer', { x: -0.02, y: 0.08, s: 1.3, key: 'fawn' });
    tree(b, { x: -0.26, z: -0.18, h: 0.42, r: 0.11, seed: 12 });
    mountain(b, { x: 0.25, z: -0.2, h: 0.22, r: 0.1, key: 'rock', snow: null, seed: 4 });
  }],
  12: ['A white elephant of the gods, caparisoned in red and gold, the wish-granting jewel on its back, on cloud.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'sky', rimKey: 'red', inner: 'gold' });
    cloud(b, { y: 0.03, w: 0.6, h: 0.07, seed: 12 });
    animal(b, 'elephant', { x: -0.06, y: 0.09, s: 1.15, key: 'white' });
    jewels(b, { x: -0.07, y: 0.53, s: 0.55, flames: true });
  }],
  13: ['A nāga rising in coils from banded waves beside a flaming jewel.', (b) => {
    waves(b, { w: 0.86, d: 0.5 });
    cloud(b, { y: 0.1, z: -0.2, w: 0.6, h: 0.1, seed: 13 });
    const coil = [];
    for (let i = 0; i <= 18; i += 1) {
      const t = i / 18;
      coil.push([Math.sin(t * TAU * 1.25) * 0.13 * (1 - t * 0.4), 0.12 + t * 0.5, Math.cos(t * TAU * 1.25) * 0.08]);
    }
    b.path('jade', coil, 0.045, 0.028);
    const head = coil[coil.length - 1];
    b.put(b.kit.sphere, 'jade', [head[0], head[1] + 0.03, head[2] + 0.02], 0, [0.05, 0.04, 0.06]);
    for (let i = 0; i < 5; i += 1) {
      const a = (i - 2) * 0.4;
      b.put(b.kit.sphere, 'green', [head[0] + Math.sin(a) * 0.08, head[1] + 0.06 + Math.cos(a) * 0.03, head[2] - 0.02], [0, 0, -a], [0.045, 0.06, 0.015]);
    }
    jewels(b, { x: 0.18, y: 0.5, s: 0.55, keys: ['red', 'blue', 'gold'] });
  }],
  14: ['A dark island of the rākṣasas with a red fortress, a skull above its gate.', (b) => {
    waves(b, { w: 0.86, d: 0.55, bands: ['navy', 'blue', 'sky'] });
    b.put(b.kit.dome, 'rock', [0, 0.1, 0], 0, [0.34, 0.16, 0.26]);
    mountain(b, { x: -0.2, y: 0.1, z: -0.08, h: 0.32, r: 0.12, key: 'black', snow: null, seed: 14 });
    mountain(b, { x: 0.22, y: 0.1, z: -0.1, h: 0.26, r: 0.1, key: 'black', snow: null, seed: 15 });
    b.put(b.kit.box, 'crimson', [0, 0.36, 0.02], 0, [0.22, 0.3, 0.18]);
    for (let i = 0; i < 4; i += 1) b.put(b.kit.box, 'crimson', [-0.09 + i * 0.06, 0.53, 0.02], 0, [0.035, 0.05, 0.18]);
    b.put(b.kit.box, 'black', [0, 0.3, 0.115], 0, [0.07, 0.12, 0.01]);
    skull(b, { y: 0.56, z: 0.08, s: 1.3 });
  }],
  15: ['The asuras’ flaming sword, planted before the wish-granting tree whose fruit they fight for.', (b) => {
    ground(b, 'ring', { w: 0.8, floor: 'earth', rimKey: 'red', inner: 'gold' });
    tree(b, { x: -0.1, z: -0.16, h: 0.75, r: 0.22, leaf: 'green', fruit: 'gold', seed: 15, n: 7 });
    sword(b, { x: 0.12, y: 0.04, z: 0.08, s: 1.05, blade: 'blue', hilt: 'gold', flames: true });
  }],
  16: ['On the black block capped with gold, Rudra become a heruka: three faces, six arms, four legs in the striding stance, a garland of heads, in a blaze of fire — freedom turned to a prison.', (b) => {
    b.put(b.kit.box, 'white', [0, 0.015, 0], 0, [0.56, 0.03, 0.42]);
    b.put(b.kit.box, 'black', [0, 0.13, 0], 0, [0.48, 0.2, 0.36]);
    b.put(b.kit.box, 'gold', [0, 0.235, 0], 0, [0.5, 0.02, 0.38]);
    b.put(b.kit.disc, 'ember', [0, 0.25, 0], 0, [0.19, 0.012, 0.15]);
    flameRing(b, { cy: 0.58, z: -0.16, R: 0.31, n: 16, from: -0.08, to: 1.08, h: 0.15, w: 0.1, keys: ['fire', 'flame', 'ember', 'crimson'], ry: 1.06 });
    wrathBody(b, { y: 0.255, s: 0.63, skin: 'navy', legs: 4, scarf: 'jade',
      arms: [
        { side: -1, elbow: [-0.27, 0.75, 0.03], wrist: [-0.31, 0.92, 0.05], dir: [-0.1, 1, 0], holds: 'trident', len: 0.2 },
        { side: -1, elbow: [-0.3, 0.62, 0.02], wrist: [-0.44, 0.68, 0.05], dir: [-0.6, 1, 0.1], holds: 'flaming-sword', len: 0.18 },
        { side: -1, elbow: [-0.24, 0.5, 0.08], wrist: [-0.14, 0.5, 0.17], dir: [0.4, 0.6, 0.5], holds: 'damaru' },
        { side: 1, elbow: [0.27, 0.75, 0.03], wrist: [0.31, 0.92, 0.05], dir: [0.1, 1, 0], holds: 'chopper' },
        { side: 1, elbow: [0.3, 0.62, 0.02], wrist: [0.44, 0.66, 0.05], dir: [0.6, 1, 0.1], holds: 'noose' },
        { side: 1, elbow: [0.22, 0.5, 0.1], wrist: [0.12, 0.55, 0.17], dir: [-0.3, 0.1, 1], palm: [0, 1, 0], holds: 'kapala' }
      ],
      heads: [
        { skin: 'navy', at: [0, 0.8, 0.03], scale: 0.17 },
        { skin: 'white', at: [-0.11, 0.775, -0.02], turn: -0.8, scale: 0.135, hairFan: false },
        { skin: 'red', at: [0.11, 0.775, -0.02], turn: 0.8, scale: 0.135, hairFan: false }
      ] });
  }],
  21: ['Jagged red mountains bristling with spears, and a watchtower.', (b) => {
    const rnd = seeded(21);
    for (let i = 0; i < 7; i += 1) mountain(b, { x: -0.36 + i * 0.12, z: -0.06 + rnd() * 0.12, h: 0.3 + rnd() * 0.32, r: 0.11, key: i % 2 ? 'crimson' : 'red', snow: 'white', cap: 0.2, seed: 210 + i });
    for (let i = 0; i < 5; i += 1) b.beam('iron', [-0.2 + i * 0.1, 0, 0.18], [-0.24 + i * 0.1, 0.42, 0.2], 0.008);
    for (let i = 0; i < 5; i += 1) b.put(b.kit.cone, 'silver', [-0.24 + i * 0.1, 0.44, 0.2], [0, 0, 0.1], [0.015, 0.05, 0.015]);
    b.put(b.kit.cyl, 'black', [0.28, 0.15, 0.14], 0, [0.06, 0.3, 0.06]);
    b.put(b.kit.cone, 'black', [0.28, 0.34, 0.14], 0, [0.08, 0.08, 0.08]);
  }],
  22: ['Leafy blue hills of learning with a temple tower and a trident.', (b) => {
    mountain(b, { x: -0.22, z: -0.08, h: 0.38, r: 0.16, key: 'blue', snow: 'sky', seed: 22 });
    mountain(b, { x: 0.24, z: -0.1, h: 0.32, r: 0.14, key: 'lapis', snow: 'sky', seed: 23 });
    for (let i = 0; i < 6; i += 1) b.put(b.kit.sphere, 'leaf', [-0.35 + i * 0.14, 0.05, 0.15 - (i % 2) * 0.05], 0, [0.07, 0.04, 0.05]);
    const shikhara = b.kit.lathe('shikhara', [[0, 0], [0.11, 0], [0.11, 0.12], [0.1, 0.2], [0.075, 0.34], [0.04, 0.42], [0, 0.44]], 8);
    b.put(b.kit.box, 'bone', [0, 0.06, 0.02], 0, [0.26, 0.12, 0.22]);
    b.put(shikhara, 'saffron', [0, 0.12, 0.02]);
    b.put(b.kit.sphere, 'gold', [0, 0.58, 0.02], 0, 0.03);
    b.beam('silver', [0.22, 0, 0.18], [0.22, 0.56, 0.18], 0.01);
    for (const dx of [-0.04, 0, 0.04]) b.beam('silver', [0.22 + dx, 0.5, 0.18], [0.22 + dx * 1.2, 0.62, 0.18], 0.008, 0.002);
    b.beam('silver', [0.17, 0.5, 0.18], [0.27, 0.5, 0.18], 0.008);
  }],
  23: ['Yungdrung Gutsek, the nine-tiered mountain of Bön, in its gold ring, with the yungdrung and the sun and moon at the summit; a Bönpo beats the drum, juniper smoke rises from the burner, and a divination arrow and prayer flags stand by.', (b) => {
    aureole(b, 'ring', { y: 0.54, z: -0.22, w: 0.9, outer: 'gold', inner: 'red', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'earth', [0, 0.015, 0], 0, [0.44, 0.03, 0.3]);
    b.put(b.kit.disc, 'grass', [0, 0.032, 0], 0, [0.42, 0.006, 0.28]);
    /* The mountain in nine rough terraces, each with a lip of snow. */
    const tier = (seed) => b.kit.once('bon-tier:' + seed, () => {
      const g = new b.THREE.CylinderGeometry(0.88, 1, 1, 9, 1);
      const pos = g.attributes.position, rnd = seeded(seed);
      const jitter = Array.from({ length: 10 }, () => 0.86 + rnd() * 0.24);
      for (let i = 0; i < pos.count; i += 1) {
        const a = Math.atan2(pos.getZ(i), pos.getX(i));
        const j = jitter[Math.round(((a + PI) / TAU) * 9) % 9];
        pos.setXYZ(i, pos.getX(i) * j, pos.getY(i), pos.getZ(i) * j);
      }
      g.computeVertexNormals();
      return g;
    });
    let y = 0.035;
    for (let i = 0; i < 9; i += 1) {
      const r = 0.25 - i * 0.022, h = 0.052 - i * 0.002;
      b.put(tier(230 + i), i % 2 ? 'rock' : 'slate', [0, y + h / 2, -0.04], [0, i * 0.7, 0], [r, h, r * 0.72]);
      b.put(tier(260 + i), 'snow', [0, y + h + 0.004, -0.04], [0, i * 0.7 + 0.3, 0], [r * 0.93, 0.012, r * 0.67]);
      y += h;
    }
    /* The yungdrung at the summit, as the board draws it: a grey block with
       four red slots let into its face, each a quarter-turn from the last.
       Above it, the sun resting in the moon. */
    b.at([0, y + 0.075, -0.02], 0, 0.15, () => {
      b.put(b.kit.box, 'slate', [0, 0, 0], 0, [1, 1, 0.3]);
      b.put(b.kit.box, 'gold', [0, 0, -0.02], 0, [1.1, 1.1, 0.24]);
      let [x, yy, w, h] = [-0.215, 0.19, 0.53, 0.12];
      for (let i = 0; i < 4; i += 1) {
        b.put(b.kit.box, 'red', [x, yy, 0.02], 0, [w, h, 0.3]);
        [x, yy, w, h] = [yy, -x, h, w];
      }
    });
    b.put(b.kit.torus(0.3, PI), 'white', [0, y + 0.2, -0.02], [0, 0, PI], 0.04);
    b.put(b.kit.sphere, 'ember', [0, y + 0.205, -0.02], 0, 0.026);
    /* The Bönpo: blue robe, tall hat, the double-faced drum raised on its
       handle and the hooked stick swung against it. */
    seated(b, { x: -0.25, y: 0.03, z: 0.13, s: 0.58, robe: 'blue', sash: 'red', hair: 'bonhat', ry: 0.45, mudra: 'drum' });
    b.at([-0.12, 0.33, 0.135], [0, 0.45, 0], 1, () => {
      b.put(b.kit.cyl, 'red', [0, 0, 0], [PI / 2, 0, 0], [0.06, 0.03, 0.06]);
      for (const z of [-1, 1]) b.put(b.kit.disc, 'bone', [0, 0, z * 0.016], [PI / 2, 0, 0], [0.056, 0.004, 0.056]);
      b.beam('wood', [0, -0.055, 0], [0, -0.115, 0], 0.007);
    });
    b.path('wood', [[-0.252, 0.19, 0.218], [-0.2, 0.29, 0.24], [-0.125, 0.335, 0.17]], 0.004);
    // divination dice on a cloth before him
    b.put(b.kit.box, 'red', [-0.1, 0.04, 0.24], 0, [0.09, 0.006, 0.06]);
    for (const [x, a] of [[-0.12, 0.3], [-0.085, -0.5]]) b.put(b.kit.box, 'white', [x, 0.053, 0.24], [0, a, 0], 0.018);
    /* A juniper burner, smoke going up. */
    b.put(b.kit.lathe('sang', [[0, 0], [0.05, 0], [0.055, 0.06], [0.04, 0.09], [0.06, 0.12], [0, 0.12]], 12), 'white', [0.22, 0.035, 0.15]);
    fire(b, { x: 0.22, y: 0.15, z: 0.15, h: 0.05, w: 0.04, keys: ['flame', 'ember'] });
    const smoke = [];
    for (let i = 0; i <= 10; i += 1) smoke.push([0.22 + Math.sin(i * 0.9) * 0.03 + i * 0.006, 0.18 + i * 0.045, 0.15 - i * 0.01]);
    b.path('mist', smoke, 0.012, 0.03);
    b.path('mist', smoke.map(([x, y, z], i) => [x - 0.02 + Math.sin(i * 1.2 + 1) * 0.02, y + 0.02, z + 0.01]), 0.008, 0.022);
    /* The divination arrow, its five silks hanging. */
    b.beam('wood', [0.33, 0.035, 0.05], [0.33, 0.5, 0.05], 0.006);
    b.put(b.kit.cone, 'silver', [0.33, 0.52, 0.05], 0, [0.012, 0.04, 0.012]);
    ['blue', 'white', 'red', 'green', 'gold'].forEach((key, i) => {
      b.put(b.kit.box, key, [0.33 + (i - 2) * 0.012, 0.36, 0.055], [0, 0, (i - 2) * 0.08], [0.01, 0.16, 0.003]);
    });
    /* Prayer flags strung from the arrow up to the mountain's shoulder. */
    const from = [0.33, 0.47, 0.05], to = [0.07, 0.42, -0.02];
    b.beam('bone', from, to, 0.002);
    ['blue', 'white', 'red', 'green', 'gold', 'blue', 'white'].forEach((key, i) => {
      const t = (i + 0.7) / 7.4;
      const p = from.map((v, j) => v + (to[j] - v) * t);
      b.put(b.kit.box, key, [p[0], p[1] - 0.025 - Math.sin(t * PI) * 0.012, p[2]], [0, -0.27, 0], [0.026, 0.04, 0.003]);
    });
  }],
  24: ['Six coloured roads opening from one point towards the six realms: the start.', (b) => {
    b.put(b.kit.disc, 'gold', [0, 0.02, 0.18], 0, [0.08, 0.04, 0.08]);
    ['white', 'jade', 'gold', 'red', 'black', 'blue'].forEach((key, i) => {
      const spread = (i - 2.5) * 0.36;
      const pts = [];
      for (let j = 0; j <= 14; j += 1) {
        const t = j / 14;
        pts.push([Math.sin(spread) * t * 0.46, 0.04 + Math.sin(t * PI * 0.9) * 0.18 + t * t * 0.55 * (0.5 + 0.5 * Math.cos(spread)),
          0.18 - Math.cos(spread) * t * 0.36]);
      }
      ribbon(b, key, pts, 0.07);
    });
  }],
  25: ['A teacher in a pandita’s hat on a lotus throne, the vajra and bell before him: entering the mantra path.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const seat = teachingThrone(b, { y: 0, w: 0.44, d: 0.3, h: 0.12 });
    const top = lotus(b, { y: seat - 0.012, r: 0.19, disc: 'white' });
    seated(b, { y: top - 0.02, s: 0.72, robe: 'maroon', hair: 'hat', mudra: 'teach', sash: 'saffron' });
    // the vajra and the bell laid before the throne
    vajra(b, { x: -0.08, y: 0.04, z: 0.2, s: 0.13, r: [0, 0.3, PI / 2] });
    bell(b, { x: 0.09, y: 0.027, z: 0.2, s: 0.33 });
  }],
  26: ['The golden wheel of the universal monarch, studded with jewels, standing on cloud.', (b) => {
    cloud(b, { y: 0, w: 0.6, h: 0.1, seed: 26 });
    wheel(b, { y: 0.52, s: 0.33, rim: 'gold', hub: 'blue', spokes: 8, bosses: 'gold', tips: 'gold' });
    b.put(b.kit.torus(0.14), 'blue', [0, 0.52, 0], 0, 0.3);
    jewels(b, { y: 0.48, z: 0.05, s: 0.32, flames: false });
  }],
  33: ['Seven offering bowls before a maṇḍala plate, incense rising: the action tantra’s purity and offering.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    b.put(b.kit.box, 'crimson', [0, 0.05, 0], 0, [0.6, 0.1, 0.3]);
    for (let i = 0; i < 7; i += 1) {
      b.put(b.kit.bowl, 'silver', [-0.24 + i * 0.08, 0.13, 0.08], [PI, 0, 0], [0.03, 0.025, 0.03]);
      b.put(b.kit.disc, 'water', [-0.24 + i * 0.08, 0.125, 0.08], 0, [0.026, 0.004, 0.026]);
    }
    [0.17, 0.14, 0.11, 0.08, 0.05].forEach((r, i) => {
      b.put(b.kit.cyl, 'gold', [0, 0.13 + i * 0.075, -0.04], 0, [r, 0.07, r]);
      b.put(b.kit.torus(0.25), i % 2 ? 'red' : 'blue', [0, 0.135 + i * 0.075 + 0.03, -0.04], [PI / 2, 0, 0], r * 0.96);
    });
    b.put(b.kit.sphere, 'gold', [0, 0.5, -0.04], 0, 0.04);
    b.put(b.kit.octa, 'blue', [0, 0.57, -0.04], 0, [0.025, 0.05, 0.025]);
    b.beam('wood', [0.24, 0.1, -0.06], [0.25, 0.4, -0.06], 0.006);
    for (let i = 0; i < 3; i += 1) b.put(b.kit.ball, 'mist', [0.25 + Math.sin(i * 2) * 0.03, 0.46 + i * 0.07, -0.06], 0, 0.035 + i * 0.01);
  }],
  34: ['The face of Mahākāla, as the board paints it: dark blue, three round staring eyes, brows and beard of flame, the mouth bared on its fangs, a crown of five skulls with a flaming jewel over each, hair rising like fire, and great rings of gold in the ears.', (b) => {
    // a bank of dark smoke for it to stand out of
    cloud(b, { y: 0, w: 0.5, h: 0.09, key: 'slate', under: 'black', seed: 34 });
    b.at([0, 0.43, 0], 0, 0.52, () => wrathHead(b, { skin: 'navy', hair: 'earth', hairTip: 'fawn' }));
  }],
  38: ['A monk standing with alms bowl and ringing staff, in the blue cartouche of the disciples.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'sage', [0, 0.02, 0], 0, [0.22, 0.04, 0.18]);
    standing(b, { y: 0.04, s: 1.05, robe: 'saffron', hair: 'shaved', staff: 'gold', bowl: 'navy', rightHand: [-0.1, 0.3, 0.1], leftHand: [0.13, 0.36, 0.07] });
  }],
  39: ['A monk seated in calm abiding, applying stillness to the four truths.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    const top = meditationSeat(b, { w: 0.46, d: 0.3, key: 'maroon', border: 'gold' });
    seated(b, { y: top - 0.012, s: 1.05, robe: 'saffron', sash: 'maroon', hair: 'shaved' });
  }],
  40: ['A monk seated before the wheel of the four truths, now seen directly.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    const top = meditationSeat(b, { z: -0.04, w: 0.44, d: 0.28, key: 'maroon', border: 'gold' });
    seated(b, { y: top - 0.012, z: -0.06, s: 0.95, robe: 'saffron', sash: 'maroon', hair: 'shaved', halo: 'sky' });
    wheel(b, { y: 0.15, z: 0.18, s: 0.1, spokes: 4, rim: 'gold', hub: 'gold' });
  }],
  41: ['A practitioner and the deity seated face to face as companions: the conduct tantra.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88, outer: 'slate', inner: 'gold' });
    lotus(b, { y: 0.02, r: 0.3, n: 10, disc: 'white' });
    seated(b, { x: -0.13, y: 0.08, s: 0.65, robe: 'maroon', hair: 'shaved', ry: 0.6 });
    seated(b, { x: 0.13, y: 0.08, s: 0.68, robe: 'jade', body: 'white', skin: 'white', hair: 'crown', ry: -0.6, halo: 'gold', mudra: 'teach' });
  }],
  42: ['A crowned deity holding the vajra, the wisdom being entering the commitment being: the yoga tantra.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88, outer: 'slate', inner: 'gold' });
    const top = lotus(b, { y: 0.02, r: 0.24, disc: 'white' });
    seated(b, { y: top - 0.02, s: 0.82, robe: 'blue', body: 'white', skin: 'white', hair: 'crown', mudra: 'teach', aura: 'glow', halo: 'gold' });
    vajra(b, { y: 0.48, z: 0.13, s: 0.13 });
  }],
  43: ['A hermit’s hut beneath a tree, where no Buddha is teaching.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'grass', [0, 0.02, 0], 0, [0.36, 0.04, 0.24]);
    b.put(b.kit.box, 'earth', [0.1, 0.12, 0.02], 0, [0.2, 0.17, 0.18]);
    b.put(b.kit.pyramid, 'wood', [0.1, 0.25, 0.02], 0, [0.26, 0.1, 0.24]);
    b.put(b.kit.box, 'black', [0.1, 0.09, 0.113], 0, [0.05, 0.1, 0.01]);
    tree(b, { x: -0.17, z: -0.02, h: 0.62, r: 0.15, seed: 43 });
  }],
  44: ['A solitary figure meditating under a tree, mindful of body, feeling, mind and things.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'grass', [0, 0.02, 0], 0, [0.36, 0.04, 0.24]);
    tree(b, { x: 0, z: -0.12, h: 0.78, r: 0.25, seed: 44, n: 7 });
    const top = grassMat(b, { y: 0.04, z: 0.06, w: 0.32, d: 0.24 });
    seated(b, { y: top - 0.006, z: 0.06, s: 0.8, robe: 'saffron', hair: 'bun' });
  }],
  45: ['A solitary figure at a charnel ground, ringed by the twelve links of dependent origination.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'earth', [0, 0.02, 0], 0, [0.36, 0.04, 0.24]);
    seated(b, { y: grassMat(b, { y: 0.04, w: 0.32, d: 0.24, key: 'ash' }) - 0.006, s: 0.85, robe: 'saffron', hair: 'bun' });
    for (let i = 0; i < 12; i += 1) {
      const a = i / 12 * TAU;
      b.put(b.kit.sphere, i % 2 ? 'gold' : 'crimson', [Math.cos(a) * 0.3, 0.3 + Math.sin(a) * 0.27, 0.02], 0, 0.028);
    }
    skull(b, { x: -0.25, y: 0.03, z: 0.12, s: 0.8 });
    skull(b, { x: 0.27, y: 0.03, z: 0.1, s: 0.7 });
  }],
  46: ['The solitary meditator lifted on cloud, flame above and water below: abilities that are not the goal.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'water', [0, 0.02, 0], 0, [0.3, 0.03, 0.22]);
    for (let i = 0; i < 4; i += 1) b.beam('water', [-0.06 + i * 0.04, 0.2, 0.03], [-0.07 + i * 0.045, 0.04, 0.05], 0.012, 0.02);
    cloud(b, { y: 0.17, w: 0.36, h: 0.06, seed: 46 });
    seated(b, { y: 0.24, s: 0.72, robe: 'saffron', hair: 'bun' });
    fire(b, { x: -0.13, y: 0.5, z: -0.03, h: 0.13, w: 0.07 });
    fire(b, { x: 0.13, y: 0.5, z: -0.03, h: 0.13, w: 0.07 });
  }],
  47: ['A pratyekabuddha seated beside his own small stupa: liberation reached alone.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'sage', [0, 0.02, 0], 0, [0.38, 0.04, 0.24]);
    seated(b, { x: -0.1, y: grassMat(b, { x: -0.1, y: 0.04, w: 0.3, d: 0.22 }) - 0.006, s: 0.85, robe: 'saffron', hair: 'bun', halo: 'gold' });
    stupa(b, { x: 0.22, y: 0.04, z: 0.02, s: 0.42 });
  }],
  48: ['An arhat absorbed in a sphere of peace, and Amitābha’s red light falling on him to rouse him.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'sage', [0, 0.02, 0], 0, [0.3, 0.04, 0.22]);
    seated(b, { y: grassMat(b, { y: 0.04, w: 0.28, d: 0.2 }) - 0.006, s: 0.7, robe: 'saffron', hair: 'shaved' });
    b.put(b.kit.sphere, 'mist', [0, 0.23, 0], 0, 0.24);
    b.put(b.kit.disc, 'red', [0, 0.72, -0.05], [PI / 2, 0, 0], [0.08, 0.02, 0.08]);
    b.put(b.kit.disc, 'ember', [0, 0.72, -0.04], [PI / 2, 0, 0], [0.05, 0.02, 0.05]);
    for (let i = 0; i < 5; i += 1) {
      const a = -PI / 2 + (i - 2) * 0.22;
      b.beam('fire', [Math.cos(a) * 0.08, 0.72 + Math.sin(a) * 0.08, -0.03], [Math.cos(a) * 0.3, 0.72 + Math.sin(a) * 0.3, -0.03], 0.008, 0.003);
    }
  }],
  49: ['The vase of the first empowerment on a lotus, crested with peacock feathers.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88, outer: 'slate', inner: 'gold' });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    vase(b, { y: top - 0.01, s: 1.32 });
  }],
  50: ['A skull-cup brimming with red and white nectar: the secret empowerment.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88, outer: 'red', inner: 'slate' });
    const top = lotus(b, { y: 0.02, r: 0.24, disc: 'white' });
    b.put(b.kit.lathe('tripod', [[0, 0], [0.12, 0], [0.08, 0.06], [0.1, 0.09], [0, 0.09]], 3), 'gold', [0, top, 0], 0, [1.6, 2, 1.6]);
    kapala(b, { y: top + 0.1, s: 1.9 });
  }],
  51: ['An arhat seated on a rock with halo, bowl and staff: the disciple’s liberation.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    const top = boulder(b, { w: 0.38, h: 0.11, d: 0.26, seed: 51 });
    seated(b, { y: top - 0.012, s: 0.92, robe: 'saffron', sash: 'maroon', hair: 'shaved', halo: 'gold', bowl: 'navy' });
    b.beam('gold', [0.27, 0.04, 0.02], [0.24, 0.72, -0.02], 0.01);
    b.put(b.kit.torus(0.18), 'gold', [0.24, 0.75, -0.02], 0, 0.035);
  }],
  52: ['A lotus bud on its stem in the Mahāyāna cloud, holding the first spark of bodhicitta.', (b) => {
    aureole(b, 'cloud', { y: 0.48, w: 0.95, h: 1.1, outer: 'red', inner: 'slate', band: 0.8, rim: 0.74 });
    b.put(b.kit.disc, 'water', [0, 0.02, 0], 0, [0.24, 0.03, 0.18]);
    b.path('green', [[0, 0.03, 0], [0.04, 0.24, 0.02], [0, 0.42, 0.03]], 0.018);
    for (const side of [-1, 1]) b.put(b.kit.sphere, 'leaf', [side * 0.11, 0.07, 0.03], [0, 0, side * 0.3], [0.12, 0.012, 0.08]);
    for (let i = 0; i < 5; i += 1) b.put(b.kit.petal, 'pink', [0, 0.42, 0.03], [0.22, i / 5 * TAU, 0, 'YXZ'], [0.08, 0.22, 0.045]);
    b.put(b.kit.sphere, 'light', [0, 0.56, 0.03], 0, 0.035);
  }],
  53: ['Five jewels on an opening lotus: faith, diligence, mindfulness, concentration and discernment.', (b) => {
    aureole(b, 'cloud', { y: 0.48, w: 0.95, h: 1.1, outer: 'red', inner: 'slate', band: 0.8, rim: 0.74 });
    const top = lotus(b, { y: 0.02, r: 0.26, disc: null, open: 0.9 });
    ['white', 'gold', 'red', 'jade', 'blue'].forEach((key, i) => {
      const a = (i - 2) * 0.5;
      b.put(b.kit.octa, key, [Math.sin(a) * 0.17, top + 0.14 + Math.cos(a) * 0.12, 0.02], [0, PI / 4, 0], [0.055, 0.1, 0.055]);
    });
  }],
  54: ['A bodhisattva borne on cloud, the abilities of the greater accumulation put to use for others.', (b) => {
    aureole(b, 'cloud', { y: 0.48, w: 0.95, h: 1.1, outer: 'red', inner: 'slate', band: 0.8, rim: 0.74 });
    cloud(b, { y: 0.02, w: 0.46, h: 0.09, seed: 54 });
    seated(b, { y: 0.14, s: 0.78, robe: 'red', body: 'skin', hair: 'crown', sash: 'jade', mudra: 'teach' });
  }],
  55: ['A butter lamp catching: the first warmth of realization.', (b) => {
    aureole(b, 'cloud', { y: 0.48, w: 0.95, h: 1.1, outer: 'red', inner: 'slate', band: 0.8, rim: 0.74 });
    b.put(b.kit.disc, 'red', [0, 0.03, 0], 0, [0.16, 0.06, 0.14]);
    lamp(b, { y: 0.06, s: 2.3, flameH: 0.13 });
  }],
  56: ['The lamp’s flame on a summit: the peak of the path of application.', (b) => {
    aureole(b, 'cloud', { y: 0.48, w: 0.95, h: 1.1, outer: 'red', inner: 'slate', band: 0.8, rim: 0.74 });
    mountain(b, { h: 0.44, r: 0.24, key: 'sage', snow: 'snow', seed: 56 });
    mountain(b, { x: -0.22, z: -0.04, h: 0.24, r: 0.12, key: 'slate', snow: 'snow', seed: 57 });
    mountain(b, { x: 0.22, z: -0.04, h: 0.2, r: 0.12, key: 'slate', snow: 'snow', seed: 58 });
    lamp(b, { y: 0.43, s: 0.9, flameH: 0.2 });
  }],
  57: ['Sun and moon discs joined on a lotus, a drop of light between them: the wisdom empowerment of co-emergent bliss.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88, outer: 'slate', inner: 'gold' });
    const top = lotus(b, { y: 0.02, r: 0.24, disc: null });
    b.put(b.kit.disc, 'white', [-0.08, top + 0.34, -0.02], [PI / 2, 0, 0], [0.22, 0.03, 0.22]);
    b.put(b.kit.disc, 'ember', [0.08, top + 0.34, 0.01], [PI / 2, 0, 0], [0.22, 0.03, 0.22]);
    b.put(b.kit.sphere, 'red', [0, top + 0.35, 0.06], 0, 0.06);
    b.put(b.kit.sphere, 'glow', [0, top + 0.35, 0.06], 0, 0.11);
  }],
  58: ['A crystal on a lotus breaking into five-coloured light: the word empowerment pointing out luminosity.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    b.put(b.kit.octa, 'ice', [0, top + 0.27, 0], [0, PI / 4, 0], [0.11, 0.28, 0.11]);
    ['white', 'gold', 'red', 'green', 'blue'].forEach((key, i) => {
      const a = PI * (0.15 + i * 0.175);
      b.beam(key, [0, top + 0.45, 0], [Math.cos(a) * 0.32, top + 0.45 + Math.sin(a) * 0.26, 0.02], 0.016, 0.006);
    });
  }],
  59: ['Shambhala: a ring of snow peaks like the petals of a lotus round the palace of Kalāpa.', (b) => {
    b.put(b.kit.disc, 'jade', [0, 0.02, 0], 0, [0.44, 0.04, 0.4]);
    for (let i = 0; i < 8; i += 1) {
      const a = i / 8 * TAU + PI / 8;
      mountain(b, { x: Math.cos(a) * 0.36, z: Math.sin(a) * 0.3, h: 0.2 + (i % 2) * 0.06, r: 0.09, key: 'slate', seed: 590 + i });
    }
    pagoda(b, { y: 0.04, s: 1, tiers: [
      { w: 0.3, hh: 0.08, body: 'navy', roof: 'navy', plinth: 'white', rh: 0.05 },
      { w: 0.22, hh: 0.12, body: 'gold', roof: 'red', door: 'red', rh: 0.06 },
      { w: 0.14, hh: 0.08, body: 'red', roof: 'navy', rh: 0.08, stack: false }
    ] });
  }],
  60: ['Potala: a mountain rising from the sea with Avalokiteśvara’s white palace on its summit.', (b) => {
    aureole(b, 'ring', { y: 0.55, w: 0.84, outer: 'crimson', inner: 'black', band: 0.84, rim: 0.78 });
    waves(b, { w: 0.9, d: 0.5 });
    mountain(b, { y: 0.06, h: 0.48, r: 0.24, key: 'jade', snow: null, seed: 60 });
    pagoda(b, { y: 0.47, s: 0.55, tiers: [
      { w: 0.26, hh: 0.1, body: 'white', roof: 'red', rh: 0.04 },
      { w: 0.18, hh: 0.08, body: 'white', roof: 'gold', rh: 0.06, stack: false }
    ] });
    cloud(b, { y: 0.22, z: 0.16, w: 0.5, h: 0.06, seed: 61 });
  }],
  61: ['Uḍḍiyāna: a lotus on the lake of Dhanakośa, the child Padmasambhava born upon it, under a golden arch.', (b) => {
    [[0.7, 'blue'], [0.6, 'red'], [0.5, 'gold']].forEach(([w, key], i) => b.put(b.kit.box, key, [0, 0.025 + i * 0.05, -0.04], 0, [w, 0.05, 0.32]));
    b.put(b.kit.torus(0.08, PI), 'gold', [0, 0.2, -0.12], 0, [0.27, 0.32, 0.3]);
    b.put(b.kit.disc, 'water', [0, 0.165, 0.02], 0, [0.2, 0.01, 0.12]);
    const top = lotus(b, { y: 0.16, r: 0.16, disc: 'white' });
    seated(b, { y: top - 0.01, s: 0.55, robe: 'red', body: 'skin', hair: 'hat', mudra: 'teach' });
  }],
  62: ['A brahmin yogi in an arch of golden flame, with his trident, on cloud.', (b) => {
    cloud(b, { y: 0, w: 0.6, h: 0.08, key: 'pink', under: 'rose', seed: 62 });
    aureole(b, 'onion', { y: 0.08, z: -0.18, w: 0.66, h: 0.88, outer: 'saffron', inner: 'gold', band: 0.85, rim: 0.78 });
    flameRing(b, { cy: 0.48, z: -0.2, R: 0.33, n: 12, from: -0.1, to: 1.1, h: 0.1, w: 0.07, keys: ['flame', 'ember'], ry: 1.2 });
    seated(b, { y: 0.1, s: 0.82, robe: 'saffron', body: 'ash', skin: 'ash', arms: 'ash', hair: 'dread', sash: 'white' });
    b.beam('silver', [0.26, 0.04, 0.05], [0.26, 0.74, 0.05], 0.008);
    for (const dx of [-0.035, 0, 0.035]) b.beam('silver', [0.26 + dx, 0.68, 0.05], [0.26 + dx * 1.2, 0.8, 0.05], 0.007, 0.002);
    b.beam('silver', [0.22, 0.68, 0.05], [0.3, 0.68, 0.05], 0.007);
  }],
  63: ['An open lotus holding only a moon disc: receptivity to emptiness.', (b) => {
    aureole(b, 'cloud', { y: 0.48, w: 0.95, h: 1.1, outer: 'red', inner: 'slate', band: 0.8, rim: 0.74 });
    b.path('green', [[0, 0, 0], [0, 0.18, 0]], 0.016);
    lotus(b, { y: 0.16, r: 0.3, n: 12, disc: 'white', open: 1.0 });
    b.put(b.kit.sphere, 'glow', [0, 0.3, 0], 0, [0.1, 0.1, 0.1]);
  }],
  64: ['The sun clearing a bank of cloud: the highest worldly stage, just before seeing.', (b) => {
    aureole(b, 'cloud', { y: 0.48, w: 0.95, h: 1.1, outer: 'red', inner: 'slate', band: 0.8, rim: 0.74 });
    b.put(b.kit.sphere, 'ember', [0, 0.38, -0.04], 0, 0.17);
    for (let i = 0; i < 9; i += 1) {
      const a = i / 8 * PI;
      b.beam('gold', [Math.cos(a) * 0.2, 0.38 + Math.sin(a) * 0.2, -0.05], [Math.cos(a) * 0.3, 0.38 + Math.sin(a) * 0.3, -0.05], 0.012, 0.004);
    }
    cloud(b, { y: 0, z: 0.08, w: 0.7, h: 0.15, seed: 64 });
  }],
  65: ['A Bön sage in a blue hat, seated on a lotus within a ring of dark petals.', (b) => {
    const pts = 12;
    for (let i = 0; i < pts; i += 1) {
      const a = i / pts * TAU;
      b.put(b.kit.ball, 'navy', [Math.cos(a) * 0.36, 0.48 + Math.sin(a) * 0.36, -0.18], 0, [0.09, 0.09, 0.03]);
      b.put(b.kit.ball, 'crimson', [Math.cos(a) * 0.32, 0.48 + Math.sin(a) * 0.32, -0.16], 0, [0.05, 0.05, 0.02]);
    }
    b.put(b.kit.torus(0.1), 'red', [0, 0.48, -0.15], 0, 0.27);
    const top = lotus(b, { y: 0.02, r: 0.22, key: 'navy', key2: 'crimson' });
    seated(b, { y: top - 0.02, s: 0.85, robe: 'blue', sash: 'white', hair: 'bonhat' });
  }],
  66: ['A vase pouring water into a bowl: the water empowerment that opens the tantric bhūmis.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    b.put(b.kit.bowl, 'silver', [0.1, top + 0.06, 0.08], [PI, 0, 0], [0.09, 0.05, 0.09]);
    b.put(b.kit.disc, 'water', [0.1, top + 0.055, 0.08], 0, [0.08, 0.005, 0.08]);
    b.at([-0.14, top + 0.26, 0], [0, 0, -0.8], 1.1, () => vase(b, { crest: true, spout: true }));
    b.path('water', [[0.1, top + 0.5, 0.02], [0.13, top + 0.34, 0.06], [0.1, top + 0.08, 0.08]], 0.016, 0.01);
  }],
  67: ['A youthful wisdom-holder flying in a golden wreath of leaves, scarves streaming.', (b) => {
    for (let i = 0; i < 16; i += 1) {
      const a = i / 16 * TAU;
      b.put(b.kit.sphere, i % 2 ? 'gold' : 'saffron', [Math.cos(a) * 0.34, 0.48 + Math.sin(a) * 0.34, -0.15], [0, 0, a], [0.08, 0.04, 0.02]);
    }
    cloud(b, { y: 0, w: 0.4, h: 0.06, seed: 67 });
    b.at([0, 0.44, 0], [0, 0, 1.0], 1, () => standing(b, { y: -0.3, s: 0.7, robe: 'jade', hair: 'crown' }));
    b.path('rose', [[-0.1, 0.48, -0.02], [-0.22, 0.42, 0.02], [-0.32, 0.5, 0]], 0.012, 0.004);
    b.path('gold', [[-0.08, 0.4, 0], [-0.2, 0.32, 0.04], [-0.3, 0.36, 0.02]], 0.012, 0.004);
  }],
  68: ['A radiant skyfarer seated on cloud in a wreath of silver-blue leaves.', (b) => {
    for (let i = 0; i < 16; i += 1) {
      const a = i / 16 * TAU;
      b.put(b.kit.sphere, i % 2 ? 'slate' : 'sky', [Math.cos(a) * 0.34, 0.48 + Math.sin(a) * 0.34, -0.15], [0, 0, a + 0.5], [0.09, 0.035, 0.02]);
    }
    cloud(b, { y: 0.1, w: 0.42, h: 0.07, seed: 68 });
    seated(b, { y: 0.2, s: 0.78, robe: 'sky', body: 'white', skin: 'white', hair: 'crown', aura: 'aura', sash: 'blue' });
  }],
  69: ['The mantra wheel of the tantric sovereign: a blue double rim on vajra spokes.', (b) => {
    cloud(b, { y: 0, w: 0.5, h: 0.08, seed: 69 });
    b.at([0, 0.52, 0], 0, 0.36, () => {
      b.put(b.kit.torus(0.08), 'blue', [0, 0, 0], 0, 1);
      b.put(b.kit.torus(0.08), 'blue', [0, 0, 0], 0, 0.72);
      b.put(b.kit.sphere, 'red', [0, 0, 0], 0, 0.14);
      for (let i = 0; i < 8; i += 1) {
        const a = i / 8 * TAU;
        vajra(b, { x: Math.cos(a) * 0.72, y: Math.sin(a) * 0.72, s: 0.5, r: [0, 0, a + PI / 2], key: 'red', half: true });
        b.beam('blue', [Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0], [Math.cos(a) * 0.72, Math.sin(a) * 0.72, 0], 0.04);
        b.put(b.kit.sphere, 'red', [Math.cos(a) * 1.2, Math.sin(a) * 1.2, 0], 0, 0.12);
      }
    });
  }],
  70: ['A green crossed vajra in many-coloured flames: Amoghasiddhi’s field of accomplished action.', (b) => {
    cloud(b, { y: 0, w: 0.5, h: 0.09, seed: 70 });
    flameRing(b, { cy: 0.45, z: -0.12, R: 0.26, n: 13, from: -0.2, to: 1.2, h: 0.2, keys: ['fire', 'flame', 'ember', 'crimson'] });
    crossedVajra(b, { y: 0.45, s: 0.48, key: 'green', hub: 'gold' });
    for (const [x, key] of [[-0.1, 'blue'], [0, 'white'], [0.1, 'red']]) fire(b, { x, y: 0.12, z: 0.1, h: 0.14, w: 0.06, keys: [key] });
  }],
  71: ['The wish-granting jewel offered on a lotus: generosity, and the joy of the first bhūmi.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    const top = lotus(b, { y: 0.02, r: 0.24, disc: 'white' });
    jewels(b, { y: top - 0.01, s: 2.2 });
  }],
  72: ['The sword of the siddhis upright on a lotus, ringed by eight gems for the eight accomplishments.', (b) => {
    for (let i = 0; i < 12; i += 1) {
      const a = i / 12 * TAU;
      b.put(b.kit.ball, 'navy', [Math.cos(a) * 0.36, 0.48 + Math.sin(a) * 0.36, -0.18], 0, [0.09, 0.09, 0.03]);
      b.put(b.kit.ball, 'crimson', [Math.cos(a) * 0.32, 0.48 + Math.sin(a) * 0.32, -0.16], 0, [0.05, 0.05, 0.02]);
    }
    b.put(b.kit.torus(0.1), 'red', [0, 0.48, -0.15], 0, 0.27);
    const top = lotus(b, { y: 0.02, r: 0.22 });
    sword(b, { y: top, s: 1.05, flames: true });
    ['red', 'blue', 'jade', 'gold', 'white', 'red', 'blue', 'jade'].forEach((key, i) => {
      const a = i / 8 * TAU;
      b.put(b.kit.octa, key, [Math.cos(a) * 0.2, 0.48 + Math.sin(a) * 0.2, 0.06], 0, [0.025, 0.04, 0.025]);
    });
  }],
  73: ['The five-pointed crown on a lotus: the crown empowerment.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    crown(b, { y: top + 0.04, s: 2.5 });
  }],
  74: ['The vajra standing on a lotus: the vajra empowerment of awakened mind.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    vajra(b, { y: top + 0.36, s: 0.72 });
  }],
  75: ['The bell standing on a lotus: the bell empowerment of awakened speech.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    bell(b, { y: top, s: 1.7 });
  }],
  76: ['Ratnasambhava’s field: a golden palace in tiers crowned with the jewel.', (b) => {
    pagoda(b, { y: 0, s: 1.05, tiers: [
      { w: 0.56, hh: 0.05, body: 'slate', roof: 'red', plinth: 'blue', rh: 0.03, eave: 1.05 },
      { w: 0.46, hh: 0.14, body: 'sage', roof: 'navy', door: 'gold', rh: 0.08 },
      { w: 0.32, hh: 0.1, body: 'gold', roof: 'navy', rh: 0.08 },
      { w: 0.2, hh: 0.07, body: 'red', roof: 'gold', rh: 0.08, stack: false }
    ], finial: 'gold' });
    jewels(b, { y: 0.66, s: 0.6, keys: ['gold', 'gold', 'gold'] });
  }],
  77: ['Sukhāvatī: Amitābha in a blue aureole on a lotus, a pond of lotuses before him.', (b) => {
    cloud(b, { y: 0, w: 0.5, h: 0.06, key: 'pink', under: 'rose', seed: 77 });
    buddhaAureole(b, { y: 0.34, z: -0.1, w: 0.25, h: 0.31, headY: 0.475, headR: 0.095 });
    const top = lotus(b, { y: 0.06, r: 0.2 });
    seated(b, { y: top - 0.02, s: 0.75, robe: 'red', skin: 'red', body: 'crimson', hair: 'buddha', bowl: 'gold' });
    b.put(b.kit.disc, 'water', [0, 0.02, 0.24], 0, [0.32, 0.02, 0.12]);
    for (const x of [-0.2, 0.18]) {
      lotus(b, { x, y: 0.03, z: 0.24, r: 0.06, n: 6, disc: null, open: 0.7 });
      b.put(b.kit.sphere, 'pink', [x, 0.09, 0.24], 0, [0.03, 0.04, 0.03]);
    }
  }],
  78: ['A fire burning on the hearth of diligence, consuming the obscurations: the Radiant.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    b.put(b.kit.cyl, 'iron', [0, 0.05, 0], 0, [0.2, 0.1, 0.16]);
    for (let i = 0; i < 6; i += 1) b.beam('wood', [-0.14 + i * 0.056, 0.1, 0.06], [0.14 - i * 0.056, 0.13, -0.06], 0.014);
    fire(b, { y: 0.1, h: 0.5, w: 0.28 });
    fire(b, { x: -0.1, y: 0.1, z: 0.04, h: 0.3, w: 0.14, lean: 0.3 });
    fire(b, { x: 0.1, y: 0.1, z: 0.04, h: 0.3, w: 0.14, lean: -0.3 });
  }],
  79: ['A tall lamp shedding its light round: the Luminous, the perfection of patience.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    b.put(b.kit.disc, 'red', [0, 0.02, 0], 0, [0.14, 0.04, 0.14]);
    b.beam('gold', [0, 0.04, 0], [0, 0.34, 0], 0.025, 0.018);
    lamp(b, { y: 0.32, s: 1.4, flameH: 0.14 });
    b.put(b.kit.sphere, 'glow', [0, 0.6, 0], 0, 0.14);
  }],
  80: ['A pure white lotus standing clean out of the water: the Stainless, the perfection of conduct.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    b.put(b.kit.disc, 'water', [0, 0.02, 0], 0, [0.3, 0.03, 0.2]);
    for (const side of [-1, 1]) b.put(b.kit.disc, 'leaf', [side * 0.14, 0.04, 0.04], 0, [0.09, 0.008, 0.07]);
    b.path('green', [[0, 0.03, 0], [0.02, 0.18, 0.01], [0, 0.3, 0.02]], 0.014);
    lotus(b, { y: 0.28, r: 0.17, n: 10, key: 'white', key2: 'white', disc: null, open: 0.4 });
  }],
  81: ['Vajra and bell crossed on a lotus: permission to teach, the path of ripening complete.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    vajra(b, { x: -0.08, y: top + 0.34, s: 0.6, r: [0, 0, 0.45] });
    bell(b, { x: 0.1, y: top, s: 1.4 });
  }],
  82: ['The central channel with its wheels at crown, throat, heart and navel, the winds dissolving in it.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    lotus(b, { y: 0.02, r: 0.2, disc: null });
    b.beam('blue', [0, 0.06, 0], [0, 0.86, 0], 0.018);
    [['white', 0.8], ['red', 0.64], ['blue', 0.46], ['red', 0.28]].forEach(([key, y], i) => {
      b.put(b.kit.torus(0.18), key, [0, y, 0], [PI / 2, 0, 0], 0.08 + (i === 2 ? 0.02 : 0));
      for (let j = 0; j < 8; j += 1) {
        const a = j / 8 * TAU;
        b.put(b.kit.ball, key, [Math.cos(a) * 0.1, y, Math.sin(a) * 0.1], 0, [0.025, 0.008, 0.025]);
      }
    });
    b.put(b.kit.sphere, 'light', [0, 0.46, 0], 0, 0.03);
  }],
  83: ['A moon disc glowing on a lotus: the semblance of luminosity.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    b.put(b.kit.disc, 'white', [0, top + 0.34, -0.03], [PI / 2, 0, 0], [0.27, 0.04, 0.27]);
    b.put(b.kit.disc, 'ice', [0.07, top + 0.36, 0.0], [PI / 2, 0, 0], [0.22, 0.04, 0.22]);
    b.put(b.kit.sphere, 'glow', [0, top + 0.34, 0.04], 0, 0.2);
  }],
  84: ['Akaniṣṭha: the Vajradhātu palace, four gates and five colours, in a blue aureole on a lotus.', (b) => {
    b.put(b.kit.torus(0.14), 'blue', [0, 0.5, -0.12], 0, [0.32, 0.36, 0.3]);
    const top = lotus(b, { y: 0.02, r: 0.3, n: 12 });
    b.at([0, top, 0], [0, PI / 4, 0], 1, () => {
      b.put(b.kit.box, 'white', [0, 0.02, 0], 0, [0.38, 0.04, 0.38]);
      [['white', 0.32], ['gold', 0.26], ['red', 0.2]].forEach(([key, w], i) => b.put(b.kit.box, key, [0, 0.07 + i * 0.07, 0], 0, [w, 0.07, w]));
      for (let i = 0; i < 4; i += 1) {
        const a = i / 4 * TAU;
        b.put(b.kit.box, ['white', 'gold', 'red', 'green'][i], [Math.sin(a) * 0.17, 0.08, Math.cos(a) * 0.17], [0, a, 0], [0.08, 0.1, 0.03]);
        b.put(b.kit.pyramid, 'gold', [Math.sin(a) * 0.17, 0.16, Math.cos(a) * 0.17], [0, a, 0], [0.08, 0.05, 0.04]);
      }
      b.put(b.kit.pyramid, 'blue', [0, 0.3, 0], 0, [0.2, 0.1, 0.2]);
    });
    b.put(b.kit.sphere, 'gold', [0, top + 0.37, 0], 0, 0.03);
    b.put(b.kit.cone, 'gold', [0, top + 0.43, 0], 0, [0.02, 0.08, 0.02]);
  }],
  85: ['Abhirati: Akṣobhya’s vajra over a still lake, jewel trees and a golden aureole on a lotus.', (b) => {
    b.put(b.kit.torus(0.08), 'gold', [0, 0.52, -0.12], 0, [0.32, 0.36, 0.3]);
    lotus(b, { y: 0, r: 0.32, n: 12, disc: null, open: 0.9 });
    b.put(b.kit.disc, 'water', [0, 0.06, 0], 0, [0.24, 0.02, 0.18]);
    vajra(b, { y: 0.4, s: 0.46, key: 'blue' });
    tree(b, { x: -0.24, z: -0.05, h: 0.4, r: 0.09, leaf: 'jade', fruit: 'gold', seed: 85 });
    tree(b, { x: 0.24, z: -0.05, h: 0.4, r: 0.09, leaf: 'jade', fruit: 'gold', seed: 86 });
  }],
  86: ['A bodhisattva striding out on cloud with a victory banner: the Far-Going, the perfection of skilful means.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    cloud(b, { y: 0.02, w: 0.5, h: 0.08, seed: 86 });
    standing(b, { y: 0.1, s: 0.95, robe: 'jade', hair: 'crown', sash: 'rose', ry: 0.3, leftHand: [0.14, 0.46, 0.08] });
    b.beam('gold', [0.14, 0.1, 0.06], [0.14, 0.84, 0.06], 0.01);
    b.put(b.kit.cyl, 'red', [0.14, 0.73, 0.06], 0, [0.05, 0.14, 0.05]);
    b.put(b.kit.dome, 'gold', [0.14, 0.8, 0.06], 0, [0.055, 0.03, 0.055]);
  }],
  87: ['The flaming sword of wisdom and the book, on a lotus: the Manifest, the perfection of wisdom.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    book(b, { y: top, s: 1 });
    sword(b, { y: top + 0.08, s: 0.9, flames: true });
  }],
  88: ['A meditator before a stack of books: the Hard to Conquer, meditation joined with learning.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    const top = meditationSeat(b, { z: -0.04, w: 0.42, d: 0.28, key: 'red', border: 'gold' });
    seated(b, { y: top - 0.012, z: -0.05, s: 0.85, robe: 'maroon', sash: 'saffron', hair: 'shaved', halo: 'gold' });
    for (let i = 0; i < 3; i += 1) book(b, { x: 0.2, y: 0.08 + i * 0.065, z: 0.08, s: 0.55, key: ['red', 'gold', 'blue'][i] });
  }],
  89: ['A body of rainbow light standing on a lotus: the illusory body, not yet pure.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.22 });
    standing(b, { y: top - 0.02, s: 1.0, robe: 'aura', skin: 'aura', hair: 'crown' });
  }],
  90: ['A sphere of clear light on a lotus, rays streaming: luminosity.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    b.put(b.kit.sphere, 'light', [0, top + 0.34, 0], 0, 0.13);
    b.put(b.kit.sphere, 'glow', [0, top + 0.34, 0], 0, 0.21);
    for (let i = 0; i < 12; i += 1) {
      const a = i / 12 * TAU;
      b.beam('ember', [Math.cos(a) * 0.15, top + 0.34 + Math.sin(a) * 0.15, 0], [Math.cos(a) * 0.33, top + 0.34 + Math.sin(a) * 0.33, 0], 0.012, 0.002);
    }
  }],
  91: ['The illusory body within the clear light: union at the stage of learning.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    seated(b, { y: top - 0.02, s: 0.82, robe: 'aura', body: 'aura', skin: 'aura', hair: 'crown' });
    b.put(b.kit.sphere, 'glow', [0, top + 0.25, 0], 0, 0.28);
  }],
  92: ['The enjoyment body: a crowned and jewelled Buddha in an arch of golden flame on a lotus.', (b) => {
    aureole(b, 'onion', { y: 0.1, z: -0.18, w: 0.76, h: 0.9, outer: 'black', inner: 'gold', band: 0.86, rim: 0.8 });
    flameRing(b, { cy: 0.5, z: -0.2, R: 0.36, n: 13, from: -0.15, to: 1.15, h: 0.11, w: 0.08, keys: ['gold', 'ember', 'flame'], ry: 1.15 });
    const top = lotus(b, { y: 0.02, r: 0.24, n: 10, key: 'pink', key2: 'white', disc: 'sage' });
    seated(b, { y: top - 0.02, s: 0.82, robe: 'blue', body: 'white', skin: 'white', hair: 'crown', sash: 'red', halo: 'gold' });
  }],
  93: ['The dharma body: a deep-blue Buddha, unadorned, in an arch of green and red flame.', (b) => {
    aureole(b, 'onion', { y: 0.1, z: -0.18, w: 0.76, h: 0.9, outer: 'sage', inner: 'red', band: 0.86, rim: 0.8 });
    flameRing(b, { cy: 0.5, z: -0.2, R: 0.36, n: 13, from: -0.15, to: 1.15, h: 0.12, w: 0.08, keys: ['fire', 'flame', 'ember'], ry: 1.15 });
    const top = lotus(b, { y: 0.02, r: 0.26, n: 12, key: 'pink', key2: 'white', disc: null });
    seated(b, { y: top - 0.02, s: 0.85, robe: 'deep', body: 'deep', skin: 'deep', hair: 'buddha' });
  }],
  94: ['A cloud raining the Dharma onto a lotus: the Cloud of Dharma, the tenth bhūmi.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    lotus(b, { y: 0.02, r: 0.2, disc: null });
    cloud(b, { y: 0.52, w: 0.5, h: 0.11, seed: 94, depth: 0.3 });
    for (let i = 0; i < 9; i += 1) b.beam('sky', [-0.2 + i * 0.05, 0.5, 0.03 * (i % 2)], [-0.21 + i * 0.05, 0.38 - (i % 3) * 0.06, 0.03 * (i % 2)], 0.005);
    b.put(b.kit.sphere, 'light', [0, 0.14, 0], 0, 0.04);
  }],
  95: ['A white conch on a lotus: Good Intelligence, the eloquence of the ninth bhūmi.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    b.at([0, top + 0.3, 0], [0, 0, -0.3], 1.45, () => {
      b.put(b.kit.lathe('conch', [[0, -0.22], [0.05, -0.18], [0.1, -0.06], [0.11, 0.04], [0.07, 0.12], [0.03, 0.18], [0, 0.2]], 16), 'white');
      for (let i = 0; i < 3; i += 1) b.put(b.kit.torus(0.1), 'bone', [0, 0.06 + i * 0.045, 0], [PI / 2, 0, 0], 0.09 - i * 0.022);
      b.put(b.kit.sphere, 'bone', [0.05, -0.04, 0.06], 0, [0.06, 0.12, 0.03]);
    });
  }],
  96: ['A mountain no wind can move, a vajra on its summit: the Immovable, the eighth bhūmi.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98 });
    mountain(b, { h: 0.5, r: 0.28, key: 'slate', snow: 'snow', seed: 96, cap: 0.35 });
    vajra(b, { y: 0.66, s: 0.3, r: [0, 0, PI / 2] });
  }],
  97: ['The white elephant with six tusks of Māyā’s dream, caparisoned and bearing a jewel, descending on cloud: the Buddha taking birth.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    cloud(b, { y: 0.1, w: 0.56, h: 0.08, seed: 97 });
    animal(b, 'elephant', { x: -0.05, y: 0.17, s: 1.08, key: 'white', tusks: 3 });
    b.put(b.kit.sphere, 'gold', [-0.05, 0.615, 0], 0, 0.03);
    b.put(b.kit.octa, 'blue', [-0.05, 0.66, 0], 0, [0.022, 0.04, 0.022]);
  }],
  98: ['The white horse Kanthaka, saddled and bridled, leaping out over the clouds under a parasol: the bodhisattva leaves the palace.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    cloud(b, { y: 0.1, w: 0.56, h: 0.08, seed: 98 });
    b.at([0.02, 0.15, 0], [0, 0, 0.16], 1.25, () => animal(b, 'horse', { pose: 'leap', key: 'white' }));
    b.beam('gold', [-0.24, 0.12, 0.12], [-0.24, 0.8, 0.12], 0.008);
    b.put(b.kit.dome, 'gold', [-0.24, 0.78, 0.12], 0, [0.11, 0.045, 0.11]);
    for (let i = 0; i < 8; i += 1) {
      const a = i / 8 * TAU;
      b.put(b.kit.cyl, i % 2 ? 'red' : 'saffron', [-0.24 + Math.cos(a) * 0.1, 0.75, 0.12 + Math.sin(a) * 0.1], 0, [0.012, 0.05, 0.012]);
    }
  }],
  99: ['The emaciated ascetic, seated in his practice, a bowl of rice beside him.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    const top = boulder(b, { w: 0.36, h: 0.1, d: 0.26, seed: 99 });
    seated(b, { y: top - 0.012, s: 0.95, robe: 'ash', body: 'ash', skin: 'ash', arms: 'ash', hair: 'bun', thin: true, legs: 'saffron', halo: 'gold' });
    b.put(b.kit.bowl, 'gold', [0.22, 0.12, 0.12], [PI, 0, 0], [0.05, 0.035, 0.05]);
    b.put(b.kit.sphere, 'white', [0.22, 0.125, 0.12], 0, [0.04, 0.015, 0.04]);
  }],
  100: ['The Buddha touching the earth, Māra’s arrows falling as flowers.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    buddhaAureole(b, { y: 0.46, z: -0.13, w: 0.25, h: 0.3, headY: 0.608, headR: 0.1 });
    const seat = lionThrone(b, { y: 0, w: 0.4, d: 0.26, h: 0.16 });
    const top = sculptureLotus(b, { y: seat, r: 0.23 });
    seated(b, { y: top, s: 0.8, robe: 'red', body: 'crimson', skin: 'gilt', arms: 'gilt', hair: 'buddha', mudra: 'earth' });
    const rnd = seeded(100);
    for (let i = 0; i < 10; i += 1) b.ell(i % 2 ? 'pink' : 'rose', [(rnd() - 0.5) * 0.7, 0.5 + rnd() * 0.35, 0.1 + rnd() * 0.06], [0.025, 0.012, 0.025]);
  }],
  101: ['The Buddha under the bodhi tree on the vajra seat: awakening.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    tree(b, { y: 0, z: -0.09, h: 0.95, r: 0.24, leaf: 'green', seed: 101, n: 8 });
    // the vajra seat: the lion throne, the lotus and the moon on it
    let top = 0;
    b.at([0, 0, 0.05], 0, 1, () => { top = sculptureLotus(b, { y: lionThrone(b, { y: 0, w: 0.38, d: 0.24, h: 0.15 }), r: 0.22 }); });
    seated(b, { y: top, z: 0.06, s: 0.78, robe: 'red', body: 'crimson', skin: 'gilt', arms: 'gilt', hair: 'buddha', mudra: 'earth', halo: 'gold' });
  }],
  102: ['The golden wheel of Dharma between two deer kneeling to it, as in the deer park at Sārnāth.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    lotus(b, { y: 0.02, z: -0.04, r: 0.12, n: 8, disc: null });
    b.beam('gold', [0, 0.08, -0.04], [0, 0.3, -0.04], 0.022, 0.016);
    b.put(b.kit.cyl, 'gold', [0, 0.31, -0.04], 0, [0.05, 0.02, 0.05]);
    b.put(b.kit.torus(0.25), 'gold', [0, 0.32, -0.04], [PI / 2, 0, 0], 0.05);
    wheel(b, { y: 0.54, z: -0.04, s: 0.19, rim: 'gold', hub: 'gold', spokes: 8, tips: 'gold' });
    animal(b, 'deer', { x: -0.3, y: 0.02, z: 0.06, s: 0.95, key: 'fawn', pose: 'kneel', antlerSize: 0.7, ry: -0.3 });
    animal(b, 'deer', { x: 0.3, y: 0.02, z: 0.06, s: 0.95, key: 'fawn', pose: 'kneel', antlers: false, ry: PI + 0.3 });
  }],
  103: ['The Buddha standing in the twin miracle: flame from the shoulders, water from the feet.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    b.put(b.kit.disc, 'water', [0, 0.02, 0], 0, [0.28, 0.03, 0.2]);
    for (let i = 0; i < 6; i += 1) {
      const a = i / 6 * TAU;
      b.path('water', [[Math.cos(a) * 0.04, 0.12, Math.sin(a) * 0.04], [Math.cos(a) * 0.16, 0.08, Math.sin(a) * 0.12], [Math.cos(a) * 0.22, 0.03, Math.sin(a) * 0.16]], 0.016, 0.008);
    }
    buddhaAureole(b, { y: 0.42, z: -0.12, w: 0.2, h: 0.34, headY: 0.74, headR: 0.09, flames: false });
    standing(b, { y: 0.06, s: 1.0, robe: 'red', skin: 'gilt', hair: 'buddha', rightHand: [-0.16, 0.5, 0.11] });
    fire(b, { x: -0.13, y: 0.56, z: -0.02, h: 0.24, w: 0.1, lean: 0.3 });
    fire(b, { x: 0.13, y: 0.56, z: -0.02, h: 0.24, w: 0.1, lean: -0.3 });
  }],
  104: ['The stupa that receives the relics, gold and white, in the gold-rimmed cartouche of the last act.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'gold', band: 0.84, rim: 0.76 });
    lotus(b, { y: 0, r: 0.3, n: 12, disc: null, open: 1.0 });
    stupa(b, { y: 0.05, s: 0.92 });
  }]
};

/* ── the realms beneath Jambudvīpa ─────────────────────────────────────────
   The hells and the pretas' ground are places of the world, not squares of
   the board: the explorer shows them, and the game's squares that name them
   stand on them (index.html). Each is drawn in the model's unit space like a
   destination — standing on y = 0, facing +z, at most a unit across — and is
   set on its own floor, inside its walls of flame or ice. The hot hells
   follow the Kośa and the Tibetan commentaries: what is done there, to whom,
   with what. The beings are the same body as everyone else, drawn plainly;
   the servants of Yama are that body too, horned and armed. */

/* A servant of Yama: a heavy body in the tiger skin, horned, fanged, the
   weapon in the right hand. */
function yamaGuard(b, { x = 0, y = 0, z = 0, s = 0.5, ry = 0, skin = 'crimson', holds = 'club', horns = 'bone', pose = 'fight' } = {}) {
  b.at([x, y, z], [0, ry, 0], s, () => {
    humanFigure(b, {
      stature: 0.66, pose: POSES[pose] ? POSES[pose]() : POSES.fight(), dress: 'loin', skin, lower: 'saffron', robe: 'saffron',
      build: 1.18, eyes: 'open', mouth: 'scream', iris: 'ember', browKey: 'black',
      hair: (bb, detail) => {
        hairOf(bb, 'messy', 'black', detail);
        for (const sx of [-1, 1]) bb.path(horns, [[sx * 0.2, 0.4, -0.02], [sx * 0.36, 0.56, -0.04], [sx * 0.4, 0.78, 0.02], [sx * 0.32, 0.9, 0.08]], 0.075, 0.012);
        for (const sx of [-1, 1]) bb.put(bb.kit.cone, 'bone', [sx * 0.05, -0.27, 0.31], [PI, 0, 0], [0.018, 0.07, 0.018]);
      },
      onHand: (i, wrist, dir) => { if (holds && i === 0) implement(b, holds, v3.add(wrist, v3.mul(v3.norm(dir), 0.02)), dir, 0.3); }
    });
  });
}

/* A hungry ghost, on the body everyone has, starved: the limbs and ribs
   wasted, the belly swollen like a mountain, the neck drawn out thin as a
   hair, the cheeks and temples hollow and the eyes sunk, a mouth no bigger
   than the eye of a needle, the hair standing up dry like flame. Some burn
   within, and fire comes from their mouths; some carry a begging bowl. */
function preta(b, { x = 0, y = 0, z = 0, s = 1, ry = 0, pose = 'search', skin = 'parched', bowl = false, burning = false, hair = 'ash' } = {}) {
  b.at([x, y, z], [0, ry, 0], s, () => {
    const S = SUFFER_STATURE;
    const out = humanFigure(b, {
      stature: S, pose: POSES[pose] ? POSES[pose]() : POSES.search(), dress: 'loin', skin, robe: 'clay', lower: 'clay',
      thin: 1.6, belly: 1, neckLen: 0.035, neckThin: 1, gaunt: true, eyes: 'open', mouth: 'pinhole', iris: 'black',
      hair: (bb, detail) => hairOf(bb, 'spikes', hair, detail),
      onHand: (i, wrist, dir) => {
        if (bowl && i === 1) b.put(b.kit.lathe('almsbowl', [[0, 0], [0.04, 0.003], [0.058, 0.02], [0.06, 0.036], [0.054, 0.05], [0.05, 0.052], [0.04, 0.046], [0, 0.044]], 18),
          'iron', v3.add(wrist, v3.mul(v3.norm(dir), 0.02)), 0, 0.45);
      }
    });
    if (burning) {
      // the fire that comes from the mouth of one who burns within
      const H = 0.146 * S;
      const mouth = out.frames.apply(out.frames.MH, [0, 0.3 * H - 0.24 * H, 0.1 * H + 0.34 * H]);
      b.at(mouth, [PI / 2 - 0.35, 0, 0], 1, () => fire(b, { h: 0.03, w: 0.011, keys: ['fire', 'flame', 'ember'] }));
    }
  });
}

/* Burning ground: embers and small fires scattered over the floor. */
function embers(b, seed, n = 10, r = 0.4) {
  const rnd = seeded(seed);
  for (let i = 0; i < n; i += 1) {
    const a = rnd() * TAU, d = r * Math.sqrt(rnd());
    const px = Math.cos(a) * d, pz = Math.sin(a) * d * 0.8;
    if (i % 3) b.ell(i % 2 ? 'ember' : 'fire', [px, 0.004, pz], [0.03 + rnd() * 0.03, 0.004, 0.02 + rnd() * 0.02]);
    else fire(b, { x: px, y: 0, z: pz, h: 0.07 + rnd() * 0.07, w: 0.045, lean: (rnd() - 0.5) * 0.4 });
  }
}

/* The cold: a crust of snow and ice, spires of ice behind, drifts. */
function iceField(b, seed, { spires = 'ice', dark = 'sky', n = 9, crust = 'snow' } = {}) {
  const rnd = seeded(seed);
  b.put(b.kit.disc, crust, [0, 0.003, 0], 0, [0.44, 0.006, 0.4]);
  for (let i = 0; i < n; i += 1) {
    const a = PI * (1.06 + i / (n - 1) * 0.88), r = 0.3 + rnd() * 0.1;
    const tall = 0.18 + rnd() * 0.24;
    b.put(b.kit.octa, i % 2 ? spires : dark, [Math.cos(a) * r, tall * 0.42, Math.sin(a) * r * 0.8 - 0.02], [0, rnd(), (rnd() - 0.5) * 0.25], [0.035 + rnd() * 0.025, tall * 0.5, 0.035]);
  }
  for (let i = 0; i < 8; i += 1) b.ell(crust, [(rnd() - 0.5) * 0.7, 0.01, (rnd() - 0.2) * 0.5], [0.05, 0.016, 0.035]);
}

/* An iron house with no door, fire at its barred windows, smoke from its
   cracks. */
function ironHouse(b, { x = 0, z = 0, w = 0.3, h = 0.28, walls = 'iron', glow = 'ember' } = {}) {
  b.put(b.kit.box, walls, [x, h / 2, z], 0, [w, h, w * 0.9]);
  b.put(b.kit.pyramid, walls, [x, h + 0.05, z], 0, [w * 0.92, 0.1, w * 0.82]);
  for (const dx of [-0.28, 0.28]) {
    b.put(b.kit.box, glow, [x + dx * w, h * 0.6, z + w * 0.452], 0, [w * 0.24, h * 0.22, 0.01]);
    for (const bx of [-0.06, 0, 0.06]) b.put(b.kit.box, 'iron', [x + dx * w + bx * w, h * 0.6, z + w * 0.46], 0, [0.006, h * 0.24, 0.006]);
    fire(b, { x: x + dx * w, y: h * 0.66, z: z + w * 0.47, h: 0.08, w: 0.05, lean: dx > 0 ? -0.3 : 0.3 });
  }
  b.put(b.kit.box, 'fire', [x, h * 0.3, z + w * 0.455], 0, [w * 0.7, 0.008, 0.01]);
  for (let i = 0; i < 3; i += 1) b.put(b.kit.ball, 'slate', [x + Math.sin(i * 1.7) * 0.03, h + 0.12 + i * 0.06, z], 0, 0.04 + i * 0.012);
}


/* ── the pretas' ground ────────────────────────────────────────────────────
   Five hundred yojanas beneath Jambudvīpa, where Yama's city stands: earth
   so long without rain that it has cracked into plates, dust drifted
   against low rises, the ground burning in places, bones; a spring that
   turns to pus as they come to it and is guarded besides; a tree whose
   fruit becomes fire in their hands. */

/* The lie of the dry ground: its edge, irregular, and its height, low
   rises drifted with dust and a long bank behind. */
function dryLand(seed, R) {
  const rnd = seeded(seed);
  const rises = Array.from({ length: 9 }, () => [(rnd() - 0.5) * 0.8, (rnd() - 0.5) * 0.7, 0.006 + rnd() * 0.016, 0.07 + rnd() * 0.08]);
  const edge = (a) => R * (1 + 0.05 * Math.sin(3 * a + 1.3) + 0.035 * Math.sin(7 * a + 0.4) + 0.02 * Math.sin(13 * a));
  const height = (x, z) => {
    let h = 0.012 + 0.03 * Math.max(0, Math.min(1, (-z - 0.12) / 0.22));
    for (const [bx, bz, bh, br] of rises) h += bh * Math.exp(-((x - bx) ** 2 + (z - bz) ** 2) / (br * br));
    return h;
  };
  return { edge, height };
}

function parchedGround(b, seed, { R = 0.42 } = {}) {
  const { THREE } = b;
  const land = dryLand(seed, R);
  b.put(b.kit.once('parched:' + seed + ':' + R, () => {
    const rings = 12, spokes = 44, pos = [0, land.height(0, 0), 0], col = [], idx = [];
    const clay = rgbOf(b, 'clay'), dust = rgbOf(b, 'dust'), ash = rgbOf(b, 'ash');
    const tone = (x, z, h) => {
      const n = 0.5 + 0.25 * Math.sin(x * 23 + z * 7) * Math.sin(z * 19 - x * 5) + 0.25 * Math.sin(x * 61 + z * 47);
      const drift = Math.min(1, (h - 0.012) * 40);
      const c = clay.map((v, i) => v + (dust[i] - v) * (0.25 + 0.5 * drift) * n);
      return c.map((v, i) => v + (ash[i] - v) * 0.18 * (1 - n));
    };
    col.push(...tone(0, 0, pos[1]));
    for (let i = 1; i <= rings; i += 1) for (let j = 0; j < spokes; j += 1) {
      const a = j / spokes * TAU, r = land.edge(a) * i / rings;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.9;
      const h = i === rings ? 0.0 : land.height(x, z) * (1 - Math.pow(i / rings, 6));
      pos.push(x, h, z);
      col.push(...tone(x, z, h).map((v) => v * (i === rings ? 0.75 : 1)));
    }
    for (let j = 0; j < spokes; j += 1) idx.push(0, 1 + (j + 1) % spokes, 1 + j);
    for (let i = 1; i < rings; i += 1) for (let j = 0; j < spokes; j += 1) {
      const jn = (j + 1) % spokes;
      const a = 1 + (i - 1) * spokes + j, bq = 1 + (i - 1) * spokes + jn, c = 1 + i * spokes + j, d = 1 + i * spokes + jn;
      idx.push(a, bq, c, bq, d, c);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }), 'clay');
  return land;
}

/* The cracks of the dry earth, wandering and forking into its plates:
   dark strips lying in the dust, two triangles to each step. */
function cracks(b, seed, land, n = 9) {
  const rnd = seeded(seed);
  const pos = [], idx = [];
  const strip = (x0, z0, x1, z1, r) => {
    const dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1, ox = -dz / l * r, oz = dx / l * r;
    const base = pos.length / 3;
    for (const [x, z] of [[x0 + ox, z0 + oz], [x0 - ox, z0 - oz], [x1 + ox, z1 + oz], [x1 - ox, z1 - oz]]) pos.push(x, land.height(x, z) + 0.0012, z);
    idx.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
  };
  const walk = (x, z, a, steps, r) => {
    let px = x, pz = z;
    for (let i = 0; i < steps; i += 1) {
      a += (rnd() - 0.5) * 0.7;
      const nx = px + Math.cos(a) * 0.03, nz = pz + Math.sin(a) * 0.03;
      if (Math.hypot(nx, nz / 0.9) > land.edge(Math.atan2(nz / 0.9, nx)) * 0.9) return;
      strip(px, pz, nx, nz, r);
      if (rnd() < 0.3 && steps > 2) walk(nx, nz, a + (rnd() < 0.5 ? 1 : -1) * (1.0 + rnd() * 0.5), Math.floor(steps * 0.6), r * 0.75);
      px = nx; pz = nz;
    }
  };
  for (let i = 0; i < n; i += 1) {
    const a = rnd() * TAU, r = 0.05 + rnd() * 0.3;
    walk(Math.cos(a) * r, Math.sin(a) * r * 0.9, rnd() * TAU, 5 + Math.floor(rnd() * 5), 0.0024);
  }
  const g = new b.THREE.BufferGeometry();
  g.setAttribute('position', new b.THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  b.put(g, 'char');
}

/* A small fire: two tongues, for ground that burns and branches alight. */
function smallFire(b, p, h = 0.05, lean = 0) {
  b.put(b.kit.flameLow, 'fire', p, [0, 0, lean], [h * 0.42, h, h * 0.36]);
  b.put(b.kit.flameLow, 'ember', [p[0], p[1], p[2] + h * 0.06], [0, 0, lean], [h * 0.26, h * 0.68, h * 0.22]);
}

/* A dead tree, its bark black and split, and its branches bursting into
   flame as the hungry ghosts reach them. */
function burningTree(b, { x = 0, z = 0, y = 0, h = 0.42, seed = 3 } = {}) {
  const rnd = seeded(seed);
  const k = h / 0.42;
  b.path('wood~', [[x, y, z], [x + 0.012 * k, y + h * 0.3, z - 0.006], [x - 0.008 * k, y + h * 0.55, z + 0.01]], 0.03 * k, 0.017 * k);
  for (let i = 0; i < 4; i += 1) {
    const a = i / 4 * TAU + rnd();
    b.beam('wood~', [x, y + 0.012, z], [x + Math.cos(a) * 0.06 * k, y, z + Math.sin(a) * 0.05 * k], 0.012 * k, 0.003 * k);
  }
  const branch = (p, dir, len, r, depth) => {
    const bend = v3.norm(v3.add(dir, [(rnd() - 0.5) * 0.5, 0.15, (rnd() - 0.5) * 0.4]));
    const mid = v3.add(p, v3.mul(dir, len * 0.5)), end = v3.add(mid, v3.mul(bend, len * 0.5));
    b.beam('wood~', p, mid, r, r * 0.8);
    b.beam('wood~', mid, end, r * 0.8, r * 0.55);
    if (depth > 0) for (const turn of [-1, 1]) branch(end, v3.norm(v3.add(bend, [turn * 0.55, 0.25, (rnd() - 0.5) * 0.5])), len * 0.68, r * 0.6, depth - 1);
    else if (rnd() < 0.6) smallFire(b, end, (0.04 + rnd() * 0.03) * k, (rnd() - 0.5) * 0.6);
  };
  const top = [x - 0.008 * k, y + h * 0.55, z + 0.01];
  [[-0.7, 1, 0.2], [0.75, 1, -0.1], [0.05, 1, -0.6]].forEach((d) => branch(top, v3.norm(d), h * 0.3, 0.013 * k, 2));
}

/* Yama's city: walls battered in like a fortress of the snows, dark and
   blind, a black frieze under the parapet, windows narrowing upward, the
   gate with its lintel, a tower at either end, and over the gate a pavilion
   under a gilt roof. */
function yamaCity(b, { z = -0.34, w = 0.62, h = 0.18 } = {}) {
  const k = b.kit;
  const batter = k.once('batter', () => {
    const g = new b.THREE.BoxGeometry(1, 1, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i += 1) if (pos.getY(i) > 0) pos.setXYZ(i, pos.getX(i) * 0.88, pos.getY(i), pos.getZ(i) * 0.78);
    g.computeVertexNormals();
    return g;
  });
  const windows = (cx, cy, n, gap) => {
    for (let i = 0; i < n; i += 1) {
      const wx = cx + (i - (n - 1) / 2) * gap;
      b.put(batter, 'char', [wx, cy, z + 0.03], 0, [0.016, 0.026, 0.012]);
      b.put(k.box, 'wood', [wx, cy + 0.016, z + 0.034], 0, [0.022, 0.004, 0.008]);
    }
  };
  b.put(batter, 'umber', [0, h / 2, z], 0, [w, h, 0.07]);
  b.put(k.box, 'char', [0, h - 0.016, z + 0.004], 0, [w * 0.88, 0.022, 0.06]);
  b.put(k.box, 'umber', [0, h + 0.005, z], 0, [w * 0.89, 0.012, 0.062]);
  windows(-w * 0.24, h * 0.62, 3, 0.05);
  windows(w * 0.24, h * 0.62, 3, 0.05);
  for (const sx of [-1, 1]) {
    const tx = sx * w * 0.5, th = h + 0.08;
    b.put(batter, 'umber', [tx, th / 2, z], 0, [0.11, th, 0.11]);
    b.put(k.box, 'char', [tx, th - 0.016, z + 0.003], 0, [0.096, 0.022, 0.092]);
    b.put(k.box, 'umber', [tx, th + 0.005, z], 0, [0.1, 0.012, 0.094]);
    b.put(batter, 'char', [tx, th * 0.55, z + 0.048], 0, [0.018, 0.032, 0.012]);
  }
  // the gate and over it the pavilion
  b.put(k.box, 'char', [0, 0.055, z + 0.034], 0, [0.064, 0.11, 0.012]);
  b.put(k.box, 'wood', [0, 0.115, z + 0.04], 0, [0.086, 0.012, 0.016]);
  b.put(k.box, 'umber', [0, h + 0.04, z], 0, [0.12, 0.058, 0.07]);
  b.put(k.box, 'char', [0, h + 0.04, z + 0.036], 0, [0.05, 0.03, 0.004]);
  b.put(k.box, 'gold', [0, h + 0.072, z], 0, [0.15, 0.008, 0.095]);
  b.put(k.pyramid, 'gold', [0, h + 0.1, z], 0, [0.12, 0.05, 0.08]);
}

/* Bones of those who died here before: skulls, and long bones bleached. */
function bones(b, seed, land, n = 6) {
  const rnd = seeded(seed);
  for (let i = 0; i < n; i += 1) {
    const a = rnd() * TAU, r = 0.12 + rnd() * 0.24;
    const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.9, y = land.height(x, z);
    if (i % 3 === 0) skull(b, { x, y: y - 0.004, z, s: 0.32 + rnd() * 0.1 });
    else {
      const t = rnd() * PI, l = 0.035 + rnd() * 0.03;
      const p0 = [x - Math.cos(t) * l, y + 0.004, z - Math.sin(t) * l], p1 = [x + Math.cos(t) * l, y + 0.004, z + Math.sin(t) * l];
      b.beam('bone', p0, p1, 0.004);
      b.ell('bone', p0, 0.007);
      b.ell('bone', p1, 0.007);
    }
  }
}

const REALM_MODELS = {
  hell_sanjiva: ['Sañjīva, the Reviving: weapons rise in the beings’ hands and they cut one another down; a cool wind passes over the fallen and they stand to fight again.', (b) => {
    embers(b, 11);
    for (let i = 0; i < 5; i += 1) {
      const a = PI * (1.1 + i * 0.2);
      sword(b, { x: Math.cos(a) * 0.36, y: 0, z: Math.sin(a) * 0.28, s: 0.34, r: [0, a, (i % 2 ? 0.3 : -0.3)] });
    }
    sufferer(b, { x: -0.13, z: 0.04, s: 0.46, ry: 1.0, skin: 'rose', pose: 'fight', holds: 'sword' });
    sufferer(b, { x: 0.12, z: 0.0, s: 0.46, ry: -1.0, skin: 'skin', pose: 'fight', holds: 'sword' });
    sufferer(b, { x: -0.26, z: -0.17, s: 0.4, ry: 0.5, skin: 'skin', pose: 'fight', holds: 'club', hair: null });
    sufferer(b, { x: -0.06, z: -0.22, s: 0.4, ry: -2.4, skin: 'rose', pose: 'fight', holds: 'spear' });
    sufferer(b, { x: 0.24, y: 0.01, z: 0.24, s: 0.42, ry: -0.5, skin: 'rose', pose: 'agony' });
    b.ell('crimson~', [0.22, 0.004, 0.24], [0.1, 0.003, 0.06]);
    cloud(b, { x: 0.24, y: 0.1, z: 0.22, w: 0.22, h: 0.04, n: 4, key: 'mist', under: 'mist', seed: 5 });
  }],
  hell_kalasutra: ['Kālasūtra, the Black Line: the servants of Yama rule black lines over the beings’ bodies and cut along them with saws and axes.', (b) => {
    embers(b, 12, 6);
    for (let i = -3; i <= 3; i += 1) {
      b.put(b.kit.box, 'black', [i * 0.12, 0.003, 0.0], 0, [0.01, 0.004, 0.8]);
      b.put(b.kit.box, 'black', [0, 0.003, i * 0.11], 0, [0.84, 0.004, 0.01]);
    }
    // a being stretched on the ground, marked out, the saw over him
    sufferer(b, { x: 0.0, y: 0.015, z: 0.17, s: 0.46, ry: PI / 2, skin: 'rose', pose: 'agony' });
    for (let i = 0; i < 4; i += 1) b.put(b.kit.box, 'black', [-0.08 + i * 0.05, 0.06, 0.17], [0, 0, 0.1], [0.006, 0.004, 0.1]);
    yamaGuard(b, { x: 0.25, z: 0.05, s: 0.46, ry: -1.3, skin: 'crimson', holds: 'saw' });
    // another standing marked with the lines, awaiting the axe
    sufferer(b, { x: -0.18, z: -0.15, s: 0.44, ry: 0.4, skin: 'skin', pose: 'writhe' });
    for (let i = 0; i < 4; i += 1) b.put(b.kit.box, 'black', [-0.18 + (i - 1.5) * 0.012, 0.1 + i * 0.045, -0.12], [0, 0.4, 0.25], [0.07, 0.005, 0.006]);
    sufferer(b, { x: 0.12, y: 0.015, z: -0.2, s: 0.4, ry: -0.6, skin: 'rose', pose: 'fallen' });
  }],
  hell_samghata: ['Saṃghāta, the Crushing: mountains shaped like the heads of rams and buffaloes close on the beings and grind them, and they are pounded in iron mortars until the blood runs as a river.', (b) => {
    embers(b, 13, 6);
    for (const side of [-1, 1]) {
      b.at([side * 0.26, 0, -0.08], [0, 0, side * 0.32], 1, () => {
        mountain(b, { h: 0.5, r: 0.16, key: 'iron', snow: null, seed: 21 + side });
        // the beast's head in the rock: horns and burning eyes
        for (const hx of [-1, 1]) b.path('bone', [[hx * 0.045, 0.3, 0.04], [hx * 0.12, 0.36, 0.07], [hx * 0.15, 0.3, 0.12]], 0.02, 0.005);
        for (const ex of [-0.032, 0.032]) b.ell('ember', [ex, 0.22, 0.085], 0.015);
      });
    }
    sufferer(b, { x: -0.02, z: -0.06, s: 0.44, skin: 'rose', pose: 'reach' });
    sufferer(b, { x: -0.1, z: 0.1, s: 0.4, ry: 0.4, skin: 'skin', pose: 'kneel' });
    // the mortar and the pestle
    b.put(b.kit.lathe('mortar', [[0, 0], [0.09, 0], [0.11, 0.04], [0.1, 0.12], [0.085, 0.13], [0.07, 0.04], [0, 0.03]], 16), 'iron', [0.24, 0, 0.2]);
    sufferer(b, { x: 0.24, y: 0.02, z: 0.2, s: 0.34, skin: 'rose', pose: 'reach', legs: false });
    b.beam('iron', [0.25, 0.34, 0.2], [0.25, 0.62, 0.2], 0.018);
    b.ell('iron', [0.25, 0.32, 0.2], [0.05, 0.04, 0.05]);
    // the river of blood
    for (let i = 0; i < 6; i += 1) b.ell('crimson', [-0.36 + i * 0.1, 0.004, 0.3 - Math.sin(i) * 0.04], [0.07, 0.004, 0.035]);
  }],
  hell_raurava: ['Raurava, the Howling: fleeing the fire, the beings find a house of iron with no door, and inside it the fire is all there is; their cries name the hell.', (b) => {
    embers(b, 14, 8);
    ironHouse(b, { x: -0.04, z: -0.12, w: 0.36, h: 0.32 });
    sufferer(b, { x: -0.13, z: 0.1, s: 0.44, ry: PI + 0.2, skin: 'rose', pose: 'reach' });
    sufferer(b, { x: 0.08, z: 0.2, s: 0.42, ry: 0.2, skin: 'skin', pose: 'writhe' });
    sufferer(b, { x: -0.28, z: 0.2, s: 0.4, ry: 0.6, skin: 'rose', pose: 'kneel' });
    yamaGuard(b, { x: 0.28, z: 0.12, s: 0.44, ry: -0.7, skin: 'navy', holds: 'club' });
  }],
  hell_maharaurava: ['Mahāraurava, the Great Howling: the house of iron has a second house within it, both ablaze, and the beings caught between the walls howl louder than in the first.', (b) => {
    embers(b, 15, 8);
    const W = 0.62, H = 0.36, D = 0.42;
    for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.put(b.kit.box, 'iron', [px * W / 2, H / 2, -0.06 + pz * D / 2], 0, [0.03, H, 0.03]);
    for (const yy of [0.1, 0.22, H]) {
      for (const pz of [-1, 1]) b.put(b.kit.box, 'iron', [0, yy, -0.06 + pz * D / 2], 0, [W, 0.018, 0.018]);
      for (const px of [-1, 1]) b.put(b.kit.box, 'iron', [px * W / 2, yy, -0.06], 0, [0.018, 0.018, D]);
    }
    for (let i = -4; i <= 4; i += 1) b.put(b.kit.box, 'iron', [i * W / 9, H / 2, -0.06 - D / 2], 0, [0.012, H, 0.012]);
    b.put(b.kit.pyramid, 'iron', [0, H + 0.06, -0.06], 0, [W * 0.75, 0.12, D * 0.75]);
    // the inner house, white with the fire
    b.put(b.kit.box, 'fire', [0, 0.13, -0.1], 0, [0.22, 0.26, 0.18]);
    b.put(b.kit.pyramid, 'ember', [0, 0.3, -0.1], 0, [0.22, 0.08, 0.18]);
    for (let i = 0; i < 6; i += 1) fire(b, { x: -0.25 + i * 0.1, y: 0, z: 0.13 + (i % 2) * 0.03, h: 0.14 + (i % 3) * 0.05, w: 0.07 });
    sufferer(b, { x: -0.2, z: 0.0, s: 0.4, ry: 0.5, skin: 'rose', pose: 'reach' });
    sufferer(b, { x: 0.2, z: -0.02, s: 0.4, ry: -0.5, skin: 'skin', pose: 'writhe' });
    sufferer(b, { x: 0.04, z: 0.06, s: 0.36, ry: 0.1, skin: 'rose', pose: 'kneel' });
  }],
  hell_tapana: ['Tapana, the Heat: on ground of burning iron the beings are run through with stakes of iron, from beneath to the crown, and beaten with hammers.', (b) => {
    b.put(b.kit.disc, 'crimson', [0, 0.004, 0], 0, [0.4, 0.006, 0.34]);
    embers(b, 16, 14);
    for (const [x, z, s2, ry] of [[-0.2, -0.12, 0.44, 0.4], [0.08, -0.2, 0.42, -0.3], [0.27, 0.0, 0.4, -0.8]]) {
      b.beam('iron', [x, 0, z], [x, 0.5, z + 0.01], 0.012, 0.002);
      sufferer(b, { x, y: 0.14, z, s: s2, ry, skin: 'rose', pose: 'writhe' });
    }
    sufferer(b, { x: -0.06, y: 0.015, z: 0.18, s: 0.44, ry: 0.3, skin: 'rose', pose: 'agony' });
    yamaGuard(b, { x: -0.3, z: 0.15, s: 0.46, ry: 0.9, skin: 'crimson', holds: 'club' });
  }],
  hell_pratapana: ['Pratāpana, the Intense Heat: the beings are lifted on iron tridents through the soles and out at the shoulders, wrapped in sheets of burning iron, and boiled in molten bronze.', (b) => {
    embers(b, 17, 10);
    // the cauldron of molten bronze
    for (let i = 0; i < 5; i += 1) fire(b, { x: -0.2 + (i - 2) * 0.06, y: 0, z: -0.06 + (i % 2) * 0.04, h: 0.16 + (i % 3) * 0.04, w: 0.09 });
    b.put(b.kit.bowl, 'iron', [-0.2, 0.3, -0.08], 0, [0.2, 0.17, 0.17]);
    b.put(b.kit.torus(0.08), 'iron', [-0.2, 0.3, -0.08], [PI / 2, 0, 0], [0.2, 0.17, 0.08]);
    b.put(b.kit.disc, 'ember', [-0.2, 0.295, -0.08], 0, [0.185, 0.01, 0.155]);
    for (const side of [-1, 1]) b.beam('iron', [-0.2 + side * 0.15, 0, -0.08], [-0.2 + side * 0.17, 0.16, -0.08], 0.016);
    sufferer(b, { x: -0.25, y: 0.21, z: -0.06, s: 0.36, ry: 0.4, skin: 'rose', pose: 'writhe', legs: false });
    sufferer(b, { x: -0.13, y: 0.2, z: -0.04, s: 0.34, ry: -0.4, skin: 'rose', pose: 'reach', legs: false });
    // the trident
    b.beam('iron', [0.2, 0, -0.12], [0.2, 0.52, -0.12], 0.012);
    b.beam('iron', [0.13, 0.52, -0.12], [0.27, 0.52, -0.12], 0.01);
    for (const dx of [-0.07, 0, 0.07]) b.beam('iron', [0.2 + dx, 0.52, -0.12], [0.2 + dx * 1.1, 0.66, -0.12], 0.008, 0.002);
    sufferer(b, { x: 0.2, y: 0.36, z: -0.1, s: 0.38, skin: 'rose', pose: 'writhe' });
    // a being wrapped in a sheet of burning iron
    sufferer(b, { x: 0.12, z: 0.22, s: 0.42, ry: -0.3, skin: 'rose', pose: 'writhe' });
    b.put(b.kit.cyl, 'ember', [0.12, 0.14, 0.22], [0, 0, 0.05], [0.07, 0.16, 0.06]);
  }],
  hell_avichi: ['Avīci, without interval: a house of iron white with fire from all four sides, and the beings in it so one with the blaze that only their cries tell them from it.', (b) => {
    b.put(b.kit.disc, 'ember', [0, 0.004, 0], 0, [0.4, 0.006, 0.36]);
    b.put(b.kit.box, 'fire', [0, 0.17, -0.1], 0, [0.4, 0.34, 0.28]);
    for (const x of [-0.2, -0.07, 0.07, 0.2]) b.put(b.kit.box, 'iron', [x, 0.17, 0.042], 0, [0.022, 0.36, 0.02]);
    for (const y2 of [0.04, 0.17, 0.32]) b.put(b.kit.box, 'iron', [0, y2, 0.042], 0, [0.42, 0.02, 0.02]);
    b.put(b.kit.pyramid, 'iron', [0, 0.4, -0.1], 0, [0.38, 0.13, 0.3]);
    for (let i = 0; i < 12; i += 1) {
      const a = i / 12 * PI;
      fire(b, { x: Math.cos(a) * 0.34, y: 0, z: Math.sin(a) * 0.14 + 0.08, h: 0.28 + (i % 3) * 0.08, w: 0.12, lean: -Math.cos(a) * 0.3 });
    }
    for (let i = 0; i < 5; i += 1) fire(b, { x: -0.14 + i * 0.07, y: 0.44, z: -0.1, h: 0.2 + (i % 2) * 0.1, w: 0.09 });
    sufferer(b, { x: -0.15, z: 0.2, s: 0.44, ry: 0.3, skin: 'flame', hair: 'fire', pose: 'writhe' });
    sufferer(b, { x: 0.16, z: 0.19, s: 0.42, ry: -0.3, skin: 'flame', hair: 'fire', pose: 'reach' });
    sufferer(b, { x: 0.0, z: 0.12, s: 0.36, skin: 'ember', hair: 'flame', pose: 'kneel' });
  }],
  hell_vajra: ['The Vajra Hell, beneath Avīci: the vajra of indestructible mind stands as the prison of those who broke its commitments, over a floor of black fire.', (b) => {
    for (let i = 0; i < 10; i += 1) {
      const a = i / 10 * TAU;
      fire(b, { x: Math.cos(a) * 0.32, y: 0, z: Math.sin(a) * 0.26, h: 0.13 + (i % 3) * 0.05, w: 0.08, keys: ['black', 'crimson', 'fire'] });
      if (i % 2 && i !== 5) vajra(b, { x: Math.cos(a) * 0.38, y: 0.18, z: Math.sin(a) * 0.32, s: 0.32, r: [0, 0, 0], key: 'blue' });
    }
    crossedVajra(b, { y: 0.52, z: -0.1, s: 0.56, key: 'blue', hub: 'white' });
    sufferer(b, { x: -0.16, z: 0.12, s: 0.44, ry: 0.4, skin: 'rose', pose: 'writhe' });
    sufferer(b, { x: 0.15, z: 0.12, s: 0.42, ry: -0.5, skin: 'rose', pose: 'kneel' });
    sufferer(b, { x: 0.0, y: 0.01, z: 0.25, s: 0.4, skin: 'rose', pose: 'fallen' });
  }],
  cold_arbuda: ['Arbuda: the cold raises blisters over the whole body of the naked beings, alone on the ice.', (b) => {
    iceField(b, 31);
    sufferer(b, { x: -0.15, z: 0.1, s: 0.46, ry: 0.4, skin: 'sky', pose: 'huddle', blisters: 'white' });
    sufferer(b, { x: 0.15, z: 0.06, s: 0.46, ry: -0.4, skin: 'ghost', pose: 'huddle', blisters: 'white' });
    sufferer(b, { x: 0.0, z: 0.24, s: 0.4, skin: 'sky', pose: 'kneel', blisters: 'white' });
  }],
  cold_nirarbuda: ['Nirarbuda: the blisters burst, and the sores run with blood and pus that freeze.', (b) => {
    iceField(b, 32);
    sufferer(b, { x: -0.14, z: 0.08, s: 0.46, ry: 0.5, skin: 'sky', pose: 'huddle', blisters: 'crimson' });
    sufferer(b, { x: 0.16, z: 0.12, s: 0.44, ry: -0.6, skin: 'ghost', pose: 'kneel', blisters: 'crimson' });
    sufferer(b, { x: 0.0, y: 0.01, z: 0.26, s: 0.4, ry: 0.3, skin: 'sky', pose: 'fallen', blisters: 'crimson' });
  }],
  cold_atata: ['Aṭaṭa: so cold that nothing passes the lips but the chattering of the teeth.', (b) => {
    iceField(b, 33, { n: 7 });
    // an arch of ice hung with icicles
    b.put(b.kit.torus(0.14, PI), 'ice', [0, 0.0, -0.2], 0, [0.3, 0.38, 0.18]);
    for (let i = 0; i < 9; i += 1) {
      const a = PI * (0.1 + i * 0.1);
      b.put(b.kit.cone, 'ice', [Math.cos(a) * 0.3, Math.sin(a) * 0.38 - 0.06 - (i % 3) * 0.012, -0.2], [PI, 0, 0], [0.01, 0.05 + (i % 3) * 0.02, 0.01]);
    }
    sufferer(b, { x: -0.1, z: 0.08, s: 0.46, ry: 0.3, skin: 'sky', pose: 'huddle' });
    sufferer(b, { x: 0.13, z: 0.14, s: 0.46, ry: -0.4, skin: 'sky', pose: 'huddle' });
  }],
  cold_hahava: ['Hahava: the beings can only cry out against the cold, a long wordless lament.', (b) => {
    iceField(b, 34);
    cloud(b, { y: 0.3, z: -0.14, w: 0.7, h: 0.06, n: 6, key: 'mist', under: 'mist', seed: 34 });
    sufferer(b, { x: -0.14, z: 0.08, s: 0.46, ry: 0.4, skin: 'ghost', pose: 'reach' });
    sufferer(b, { x: 0.14, z: 0.1, s: 0.44, ry: -0.4, skin: 'sky', pose: 'reach' });
    sufferer(b, { x: 0.0, z: 0.26, s: 0.38, skin: 'sky', pose: 'kneel' });
  }],
  cold_huhuva: ['Huhuva: the cry gives way to a groan through clenched teeth, the body bent double.', (b) => {
    iceField(b, 35, { spires: 'sky', dark: 'blue' });
    sufferer(b, { x: -0.15, z: 0.08, s: 0.46, ry: 0.4, skin: 'blue', pose: 'kneel' });
    sufferer(b, { x: 0.14, z: 0.06, s: 0.46, ry: -0.5, skin: 'sky', pose: 'huddle' });
    sufferer(b, { x: 0.0, y: 0.01, z: 0.25, s: 0.4, ry: 2.6, skin: 'blue', pose: 'fallen' });
  }],
  cold_utpala: ['Utpala: the skin, gone blue, splits like the petals of a blue lotus.', (b) => {
    iceField(b, 36, { spires: 'sky', dark: 'blue' });
    lotus(b, { x: 0.0, z: -0.18, y: 0, r: 0.2, n: 9, key: 'blue', key2: 'sky', disc: null, open: 1.05 });
    sufferer(b, { x: -0.16, z: 0.1, s: 0.46, ry: 0.4, skin: 'blue', pose: 'huddle', blisters: 'navy' });
    sufferer(b, { x: 0.16, z: 0.1, s: 0.46, ry: -0.4, skin: 'blue', pose: 'kneel', blisters: 'navy' });
  }],
  cold_padma: ['Padma: the flesh opens red beneath the blue, splitting like a lotus.', (b) => {
    iceField(b, 37, { spires: 'sky', dark: 'blue' });
    lotus(b, { x: 0.0, z: -0.18, y: 0, r: 0.22, n: 10, key: 'red', key2: 'rose', disc: null, open: 1.1 });
    sufferer(b, { x: -0.16, z: 0.1, s: 0.46, ry: 0.4, skin: 'rose', pose: 'huddle', blisters: 'crimson' });
    sufferer(b, { x: 0.16, z: 0.12, s: 0.44, ry: -0.5, skin: 'blue', pose: 'fallen', blisters: 'crimson' });
  }],
  cold_mahapadma: ['Mahāpadma, deepest of the cold hells: the body splits like a great lotus, to the bone, into many pieces.', (b) => {
    iceField(b, 38, { spires: 'blue', dark: 'navy', crust: 'ice' });
    lotus(b, { x: 0.0, z: -0.16, y: 0, r: 0.3, n: 12, key: 'crimson', key2: 'red', disc: null, open: 1.2 });
    for (let i = 0; i < 6; i += 1) b.put(b.kit.petal, 'crimson', [-0.3 + i * 0.12, 0.006, 0.3 - (i % 2) * 0.05], [-PI / 2, i, 0], [0.04, 0.07, 0.01]);
    sufferer(b, { x: -0.15, z: 0.1, s: 0.46, ry: 0.4, skin: 'crimson', pose: 'huddle', blisters: 'bone' });
    sufferer(b, { x: 0.16, y: 0.01, z: 0.14, s: 0.44, ry: -0.5, skin: 'crimson', pose: 'agony', blisters: 'bone' });
  }],
  preta_realm: ['The pretas’ ground, 500 yojanas beneath Jambudvīpa, where Yama’s city stands: earth cracked by a drought that does not end, burning in places, strewn with bones; a spring that turns to pus as they come to it, guarded by a servant of Yama with his club; a dead tree whose branches burst into flame as they reach for its fruit; and the hungry ghosts, bellies like mountains, necks like hairs, mouths like the eye of a needle, searching, begging, fighting over nothing, fire coming from the mouths of some.', (b) => {
    const land = parchedGround(b, 41);
    cracks(b, 42, land, 12);
    yamaCity(b, { z: -0.33 });
    bones(b, 44, land, 7);
    // the ground burning
    const rnd = seeded(45);
    for (let i = 0; i < 5; i += 1) {
      const a = rnd() * TAU, r = 0.15 + rnd() * 0.22, x = Math.cos(a) * r, z = Math.sin(a) * r * 0.85;
      b.ell('char', [x, land.height(x, z) + 0.001, z], [0.034, 0.002, 0.024]);
      smallFire(b, [x, land.height(x, z), z], 0.04 + rnd() * 0.03, (rnd() - 0.5) * 0.4);
    }
    // the tree whose fruit is fire
    burningTree(b, { x: -0.24, z: -0.16, y: land.height(-0.24, -0.16) - 0.005, h: 0.44, seed: 46 });
    preta(b, { x: -0.13, y: land.height(-0.13, -0.08), z: -0.08, s: 0.6, ry: -0.7, pose: 'reach' });
    preta(b, { x: -0.3, y: land.height(-0.3, 0.06), z: 0.06, s: 0.52, ry: 0.9, pose: 'huddle', bowl: true });
    // the spring gone to pus, and the servant of Yama who keeps them from it
    const sx = 0.2, sz = 0.13, sy = land.height(sx, sz);
    b.ell('pus', [sx, sy - 0.004, sz], [0.075, 0.008, 0.05]);
    b.ell('crimson~', [sx + 0.02, sy - 0.002, sz + 0.01], [0.03, 0.006, 0.018]);
    for (let i = 0; i < 7; i += 1) {
      const a = i / 7 * TAU;
      b.ell(i % 2 ? 'rock' : 'clay~', [sx + Math.cos(a) * 0.082, sy + 0.004, sz + Math.sin(a) * 0.056], [0.022, 0.013, 0.018], [0, a, 0.2]);
    }
    preta(b, { x: 0.06, y: sy, z: 0.18, s: 0.56, ry: 1.3, pose: 'crave' });
    yamaGuard(b, { x: 0.33, y: land.height(0.33, 0.04), z: 0.04, s: 0.48, ry: -1.6, skin: 'umber', holds: 'club', pose: 'fight' });
    // one searching with fire coming from its mouth, one fallen
    preta(b, { x: 0.08, y: land.height(0.08, -0.12), z: -0.12, s: 0.6, ry: 0.3, pose: 'search', burning: true });
    preta(b, { x: -0.1, y: land.height(-0.1, 0.27) + 0.005, z: 0.27, s: 0.54, ry: 2.4, pose: 'fallen' });
  }]
};

export const REALM_MODEL_IDS = Object.keys(REALM_MODELS);
export const realmNote = (id) => (REALM_MODELS[id] ? REALM_MODELS[id][0] : '');

/* Build one of the realms beneath Jambudvīpa. Its crowds are drawn plainly:
   the realm is seen as a whole, from outside it. */
export function buildRealmModel(THREE, id, materials, kit = makeKit(THREE)) {
  const recipe = REALM_MODELS[id];
  if (!recipe) return null;
  const group = buildRecipe(THREE, (b) => { b.detail = -1; recipe[1](b); }, materials, kit, id);
  group.children.forEach((mesh) => {
    mesh.userData.realm = id;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
  });
  return group;
}

/* The kit's figures, for studies and tests. */
export const FIGURE_PARTS = { head, seated, standing, sufferer, guardian, yamaGuard, preta, lotus, cloud, snowLion, lionThrone };

export const MODEL_SQUARES = Object.keys(SQUARE_MODELS).map(Number);
export const modelNote = (n) => (SQUARE_MODELS[n] ? SQUARE_MODELS[n][0] : '');

/* Build one destination into a group of merged meshes, one per material.
   Exported for previews and tests; the page goes through createSquareModels. */
export function buildSquareModel(THREE, n, materials, kit = makeKit(THREE)) {
  const recipe = SQUARE_MODELS[n];
  if (!recipe) return null;
  const b = makeBuilder(THREE, kit);
  recipe[1](b);
  const group = new THREE.Group();
  group.name = 'rebirth_model_' + n;
  for (const [key, geometry] of bake(THREE, b.parts)) {
    const mesh = new THREE.Mesh(geometry, materials.lit[key]);
    mesh.name = 'rebirth_model_' + n;
    mesh.userData.square = n;
    mesh.userData.model = true;
    mesh.userData.finish = key;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 6;
    group.add(mesh);
  }
  return group;
}

/* One kit of shared parts for a set of models built over time. */
export const createModelKit = (THREE) => makeKit(THREE);

/* Build any recipe the same way — a figure study, a realm of the world. */
export function buildRecipe(THREE, recipe, materials, kit = makeKit(THREE), name = 'model') {
  const b = makeBuilder(THREE, kit);
  recipe(b, FIGURE_PARTS);
  const group = new THREE.Group();
  group.name = name;
  for (const [key, geometry] of bake(THREE, b.parts)) {
    const mesh = new THREE.Mesh(geometry, materials.lit[key]);
    mesh.name = name;
    mesh.userData.finish = key;
    group.add(mesh);
  }
  return group;
}

export function createModelMaterials(THREE) {
  const lit = {
    matte: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.36, metalness: 0.45 }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
    glass: new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.42, depthWrite: false })
  };
  const faint = {}, hi = {};
  for (const [key, material] of Object.entries(lit)) {
    // the square being visited, lit from within: each surface glows in its
    // own colour, so a dark-blue Mahākāla stays dark blue, only brighter
    hi[key] = material.clone();
    if (hi[key].emissive) {
      hi[key].onBeforeCompile = (shader) => {
        shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance += vColor.rgb * ' + FOCUS_GLOW.toFixed(2) + ';');
      };
      hi[key].customProgramCacheKey = () => 'model-focus-glow';
    }
    hi[key].name = 'model_' + key + '_focus';
    material.name = 'model_' + key;
    faint[key] = material.clone();
    Object.assign(faint[key], { transparent: true, opacity: key === 'glass' ? 0.17 : FAINT, depthWrite: key !== 'glass' });
    faint[key].name = 'model_' + key + '_faint';
  }
  return { lit, faint, hi };
}

/* The world's set of destinations. `attach` remembers where each square
   stands; `load` builds them the first time the game is opened; `face`
   turns each model about its own vertical to the camera; `showActive` sets
   the squares in play at full weight and lets the rest stand back.

   Where the model itself builds the thing the square names — the terrace of
   the Four Kings, the city on the summit, the palaces above it — the world is
   the representation, and `ctx.modelled` names those squares: nothing is
   built for them here. */
export function createSquareModels(THREE, ctx) {
  const modelled = ctx.modelled instanceof Set ? ctx.modelled : new Set(ctx.modelled || []);
  const holders = new Map();
  const models = new Map();
  const lit = new Set();
  let materials = null, kit = null, focused = null;
  const unit = ctx.SUMMIT * MODEL_UNIT;

  function attach(holder, square) {
    if (modelled.has(square) || !SQUARE_MODELS[square]) return false;
    holders.set(square, holder);
    return true;
  }

  function paint(square) {
    const model = models.get(square);
    if (!model) return;
    const on = square === focused ? 'focus' : lit.has(square);
    if (model.userData.lit === on) return;
    model.userData.lit = on;
    const set = on === 'focus' ? materials.hi : on ? materials.lit : materials.faint;
    model.children.forEach((mesh) => { mesh.material = set[mesh.userData.finish]; });
  }

  function load() {
    if (!materials) { materials = createModelMaterials(THREE); kit = makeKit(THREE); }
    holders.forEach((holder, square) => {
      if (models.has(square)) return;
      const model = buildSquareModel(THREE, square, materials, kit);
      const victory = square === ctx.VICTORY;
      model.scale.setScalar(unit * (victory ? VICTORY_SCALE : 1));
      model.position.y = holder.userData.modelLift ?? ctx.SUMMIT * (victory ? 0.1 : MODEL_LIFT);
      model.userData.lit = null;
      holder.add(model);
      models.set(square, model);
      paint(square);
    });
  }

  function showActive(active) {
    lit.clear();
    for (const n of active) lit.add(n);
    if (ctx.VICTORY) lit.add(ctx.VICTORY);
    models.forEach((model, square) => paint(square));
  }

  /* The square being visited stands out from all the rest, lit or faint. */
  function highlight(square) {
    const before = focused;
    focused = square;
    if (before !== null) paint(before);
    if (square !== null) paint(square);
  }

  const eye = new THREE.Vector3();
  function face(camera) {
    models.forEach((model) => {
      const holder = model.parent;
      if (!holder || !holder.parent) return;
      eye.copy(camera.position);
      holder.parent.worldToLocal(eye);
      model.rotation.y = Math.atan2(eye.x - holder.position.x, eye.z - holder.position.z);
    });
  }

  return { attach, load, face, showActive, highlight, models, holders, modelled,
           built: () => models.size === holders.size && holders.size > 0 };
}
