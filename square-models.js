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
  rose:     { c: 0xd9707f, r: 0.60 },
  skin:     { c: 0xe1b48c, r: 0.70 },
  gilt:     { c: 0xe6b84a, r: 0.35, m: 0.45 },
  ash:      { c: 0xb9b4aa, r: 0.85 },
  ghost:    { c: 0x8c9fb0, r: 0.80 },
  deep:     { c: 0x1f3d9c, r: 0.40, m: 0.10 },
  water:    { c: 0x3d86c2, r: 0.15, m: 0.10 },
  ice:      { c: 0xd6eef8, r: 0.15, m: 0.05 },
  earth:    { c: 0x8b6b47, r: 0.90 },
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
  mist:     { c: 0xe8f0ff, r: 0.40, e: 0xc8d8ff, ei: 0.3, glass: 0.22 }
};
export const PALETTE_KEYS = Object.keys(PALETTE);

/* Paints are baked into the vertices, so a model needs one draw call for each
   kind of surface it has rather than one for each colour: matte, metal (the
   gilt and the iron), glowing (fire and light, unlit) and seen-through. */
export const FINISHES = ['matte', 'metal', 'glow', 'glass'];
const finishOf = (p) => (p.glass ? 'glass' : p.e ? 'glow' : (p.m || 0) >= 0.4 ? 'metal' : 'matte');

/* A square nobody is on and nobody has asked about stands back, as its
   billboard used to: the same model, seen through. */
const FAINT = 0.38;

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
   carrying its paint's colour. */
function bake(THREE, parts) {
  const bins = new Map();
  const p = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();
  const colour = new THREE.Color();
  for (const { geometry, key, matrix } of parts) {
    const paint = PALETTE[key];
    if (!paint) throw new Error('No paint called ' + key);
    const finish = finishOf(paint);
    colour.setHex(paint.c);
    let bin = bins.get(finish);
    if (!bin) bins.set(finish, bin = { p: [], n: [], c: [], i: [] });
    const pos = geometry.attributes.position, nor = geometry.attributes.normal;
    const base = bin.p.length / 3;
    nm.getNormalMatrix(matrix);
    const flip = matrix.determinant() < 0;
    for (let i = 0; i < pos.count; i += 1) {
      p.fromBufferAttribute(pos, i).applyMatrix4(matrix);
      n.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize();
      bin.p.push(p.x, p.y, p.z);
      bin.n.push(n.x, n.y, n.z);
      bin.c.push(colour.r, colour.g, colour.b);
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
    torus: (tube, arc = TAU) => once('torus:' + tube + ':' + arc,
      () => new THREE.TorusGeometry(1, tube, 6, Math.max(10, Math.round(32 * arc / TAU)), arc)),
    /* A tongue of flame, pointed at the top, one unit tall. */
    flame: lathe('flame', [[0, 0], [0.30, 0.06], [0.48, 0.20], [0.50, 0.36], [0.40, 0.55],
      [0.24, 0.74], [0.10, 0.90], [0, 1]], 10),
    /* A lotus petal: a shallow, pointed spoon. */
    petal: lathe('petal', [[0, 0], [0.42, 0.10], [0.50, 0.35], [0.40, 0.65], [0.18, 0.90], [0, 1]], 8)
  };

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
function lotus(b, { x = 0, z = 0, y = 0, r = 0.22, n = 10, key = 'pink', key2 = 'white', disc = 'white', open = 0.55, tiers = 2 } = {}) {
  if (x || z) {
    let top = 0;
    b.at([x, 0, z], 0, 1, () => { top = lotus(b, { y, r, n, key, key2, disc, open, tiers }); });
    return top;
  }
  for (let t = 0; t < tiers; t += 1) {
    const count = n - t * 2, radius = r * (1 - t * 0.28), tilt = open + t * 0.35;
    const len = r * 0.62 * (1 - t * 0.12);
    for (let i = 0; i < count; i += 1) {
      const a = (i + t * 0.5) / count * TAU;
      b.put(b.kit.petal, t % 2 ? key2 : key,
        [Math.cos(a) * radius * 0.55, y + 0.02 + t * 0.03, Math.sin(a) * radius * 0.55],
        [PI / 2 - tilt, PI / 2 - a, 0, 'YXZ'], [len * 0.55, len, len * 0.22]);
    }
  }
  b.put(b.kit.cyl, 'gold', [0, y + 0.04, 0], 0, [r * 0.55, 0.05, r * 0.55]);
  if (disc) b.put(b.kit.disc, disc, [0, y + 0.07, 0], 0, [r * 0.62, 0.018, r * 0.62]);
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

/* A seated figure, legs crossed, about 0.56 units tall at s = 1. */
function seated(b, o = {}) {
  const { x = 0, y = 0, z = 0, s = 1, robe = 'maroon', skin = 'skin', hair = 'shaved', halo = null,
    bowl = null, mudra = 'lap', thin = false, legs = robe, ry = 0, sash = null, aura = null } = o;
  b.at([x, y, z], [0, ry, 0], s, () => {
    const k = b.kit;
    b.put(k.sphere, legs, [0, 0.075, 0.02], 0, [0.25, 0.085, 0.17]);
    const torso = k.lathe('torso', [[0, 0], [0.17, 0], [0.18, 0.06], [0.15, 0.2], [0.12, 0.27], [0.06, 0.30], [0, 0.31]]);
    b.put(torso, o.body || robe, [0, 0.09, 0], 0, [thin ? 0.72 : 1, 1, thin ? 0.7 : 0.85]);
    if (sash) b.put(k.box, sash, [0, 0.27, 0.035], [0, 0, 0.6], [0.05, 0.3, 0.12]);
    b.put(k.cyl, skin, [0, 0.40, 0], 0, [0.035, 0.05, 0.035]);
    b.put(k.sphere, skin, [0, 0.46, 0], 0, [0.068, 0.074, 0.068]);
    if (hair === 'buddha') {
      b.put(k.sphere, 'navy', [0, 0.475, -0.004], 0, [0.071, 0.064, 0.071]);
      b.put(k.sphere, 'navy', [0, 0.535, 0], 0, 0.036);
      b.put(k.sphere, 'gold', [0, 0.572, 0], 0, 0.012);
    } else if (hair === 'crown') {
      b.put(k.sphere, 'navy', [0, 0.475, -0.004], 0, [0.071, 0.064, 0.071]);
      b.put(k.cone, 'navy', [0, 0.56, -0.005], 0, [0.03, 0.08, 0.03]);
      for (let i = 0; i < 5; i += 1) {
        const a = (i - 2) * 0.42;
        b.put(k.petal, 'gold', [Math.sin(a) * 0.06, 0.505, Math.cos(a) * 0.06], [-0.25, a, 0, 'YXZ'], [0.03, 0.06, 0.012]);
      }
    } else if (hair === 'bun') {
      b.put(k.sphere, 'black', [0, 0.475, -0.004], 0, [0.071, 0.064, 0.071]);
      b.put(k.sphere, 'black', [0, 0.545, -0.01], 0, 0.034);
    } else if (hair === 'hat') {
      b.put(k.cone, 'red', [0, 0.57, -0.01], [-0.1, 0, 0], [0.062, 0.17, 0.062]);
    } else if (hair === 'bonhat') {
      b.put(k.cone, 'blue', [0, 0.55, -0.005], 0, [0.075, 0.13, 0.075]);
      b.put(k.torus(0.25), 'gold', [0, 0.50, -0.004], [PI / 2, 0, 0], 0.064);
    } else if (hair === 'flame') {
      fire(b, { y: 0.47, z: -0.03, h: 0.2, w: 0.12 });
    } else if (hair === 'dread') {
      b.put(k.sphere, 'earth', [0, 0.475, -0.006], 0, [0.072, 0.066, 0.072]);
      b.put(k.cyl, 'earth', [0, 0.56, -0.01], 0, [0.034, 0.1, 0.034]);
    }
    // arms, from the shoulders to wherever the hands are
    const hands = mudra === 'earth' ? [[-0.06, 0.17, 0.12], [0.16, 0.06, 0.15]]
      : mudra === 'teach' ? [[-0.05, 0.31, 0.12], [0.05, 0.31, 0.12]]
      : mudra === 'raise' ? [[-0.06, 0.17, 0.12], [0.17, 0.38, 0.08]]
      : [[-0.055, 0.17, 0.12], [0.055, 0.17, 0.12]];
    const arm = o.arms || robe;
    [[-0.14, 0.36, 0], [0.14, 0.36, 0]].forEach((shoulder, i) => {
      const hand = hands[i];
      const elbow = [shoulder[0] * 1.35, (shoulder[1] + hand[1]) / 2 - 0.03, 0.05];
      b.path(arm, [shoulder, elbow, hand], 0.036, 0.03);
      b.put(k.ball, skin, hand, 0, 0.028);
    });
    if (bowl) b.put(k.bowl, bowl, [0, 0.19, 0.12], [PI, 0, 0], [0.06, 0.04, 0.06]);
    if (halo) b.put(k.disc, halo, [0, 0.47, -0.07], [PI / 2, 0, 0], [0.12, 0.01, 0.12]);
    if (aura) b.put(k.disc, aura, [0, 0.28, -0.1], [PI / 2, 0, 0], [0.26, 0.01, 0.3]);
  });
}

/* A standing figure, about 0.72 units tall at s = 1. */
function standing(b, o = {}) {
  const { x = 0, y = 0, z = 0, s = 1, robe = 'maroon', skin = 'skin', hair = 'shaved', staff = null, bowl = null, halo = null, ry = 0, wide = 1 } = o;
  b.at([x, y, z], [0, ry, 0], s, () => {
    const k = b.kit;
    const gown = k.lathe('gown', [[0, 0], [0.11, 0], [0.095, 0.25], [0.105, 0.45], [0.10, 0.52], [0.07, 0.56], [0, 0.57]]);
    b.put(gown, robe, [0, 0, 0], 0, [wide, 1, wide * 0.8]);
    b.put(k.cyl, skin, [0, 0.59, 0], 0, [0.03, 0.04, 0.03]);
    b.put(k.sphere, skin, [0, 0.645, 0], 0, [0.06, 0.066, 0.06]);
    if (hair === 'buddha') {
      b.put(k.sphere, 'navy', [0, 0.66, -0.004], 0, [0.063, 0.056, 0.063]);
      b.put(k.sphere, 'navy', [0, 0.715, 0], 0, 0.03);
    } else if (hair === 'crown') {
      b.put(k.sphere, 'black', [0, 0.66, -0.004], 0, [0.063, 0.056, 0.063]);
      for (let i = 0; i < 5; i += 1) {
        const a = (i - 2) * 0.42;
        b.put(k.petal, 'gold', [Math.sin(a) * 0.052, 0.68, Math.cos(a) * 0.052], [-0.25, a, 0, 'YXZ'], [0.026, 0.05, 0.01]);
      }
    } else if (hair === 'bun') {
      b.put(k.sphere, 'black', [0, 0.66, -0.004], 0, [0.063, 0.056, 0.063]);
      b.put(k.sphere, 'black', [0, 0.72, -0.01], 0, 0.028);
    }
    const left = o.leftHand || [-0.12, 0.30, 0.05], right = o.rightHand || [0.12, 0.30, 0.05];
    b.path(robe, [[-0.11, 0.52, 0], [-0.14, 0.42, 0.02], left], 0.032, 0.027);
    b.path(robe, [[0.11, 0.52, 0], [0.14, 0.42, 0.02], right], 0.032, 0.027);
    b.put(k.ball, skin, left, 0, 0.026);
    b.put(k.ball, skin, right, 0, 0.026);
    if (staff) {
      b.beam(staff, [right[0], 0, right[2]], [right[0], 0.82, right[2]], 0.012);
      b.put(k.torus(0.18), staff, [right[0], 0.84, right[2]], 0, 0.035);
    }
    if (bowl) b.put(k.bowl, bowl, [left[0], left[1] + 0.02, left[2] + 0.02], [PI, 0, 0], [0.05, 0.035, 0.05]);
    if (halo) b.put(k.disc, halo, [0, 0.65, -0.07], [PI / 2, 0, 0], [0.11, 0.01, 0.11]);
  });
}

/* A stupa: stepped base, vase-shaped dome, harmikā, thirteen rings, parasol,
   and the moon and sun at the top. About 1 unit tall at s = 1. */
function stupa(b, { x = 0, y = 0, z = 0, s = 1, body = 'white', gilt = 'gold' } = {}) {
  b.at([x, y, z], 0, s, () => {
    const k = b.kit;
    [[0.42, 0.06], [0.36, 0.06], [0.30, 0.06], [0.25, 0.05]].reduce((h, [w, t]) => {
      b.put(k.box, body, [0, h + t / 2, 0], 0, [w, t, w]);
      b.put(k.box, gilt, [0, h + t - 0.004, 0], 0, [w + 0.01, 0.008, w + 0.01]);
      return h + t;
    }, 0);
    const dome = k.lathe('stupa-dome', [[0, 0], [0.13, 0], [0.17, 0.04], [0.18, 0.12], [0.15, 0.20], [0.09, 0.24], [0, 0.25]], 24);
    b.put(dome, body, [0, 0.23, 0]);
    b.put(k.box, gilt, [0, 0.50, 0], 0, [0.11, 0.06, 0.11]);
    const spire = k.lathe('stupa-spire', [[0, 0], [0.06, 0], [0.025, 0.28], [0, 0.29]], 16);
    b.put(spire, gilt, [0, 0.53, 0]);
    for (let i = 0; i < 13; i += 1) {
      const t = i / 13;
      b.put(k.torus(0.3), gilt, [0, 0.545 + t * 0.26, 0], [PI / 2, 0, 0], 0.055 - t * 0.032);
    }
    b.put(k.cone, gilt, [0, 0.83, 0], 0, [0.075, 0.03, 0.075]);
    b.put(k.torus(0.28, PI), gilt, [0, 0.88, 0], [0, 0, PI], 0.03);
    b.put(k.sphere, gilt, [0, 0.905, 0], 0, 0.02);
    b.put(k.cone, gilt, [0, 0.95, 0], 0, [0.01, 0.06, 0.01]);
  });
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
  b.beam(trunk, [x, y, z], [x, y + h * 0.6, z], r * 0.16, r * 0.1);
  b.beam(trunk, [x, y + h * 0.45, z], [x - r * 0.5, y + h * 0.72, z], r * 0.08, r * 0.05);
  b.beam(trunk, [x, y + h * 0.5, z], [x + r * 0.55, y + h * 0.75, z], r * 0.08, r * 0.05);
  for (let i = 0; i < n; i += 1) {
    const a = i / n * TAU + rnd();
    const rr = r * (0.45 + rnd() * 0.25);
    const p = [x + Math.cos(a) * r * 0.55, y + h * (0.72 + rnd() * 0.2), z + Math.sin(a) * r * 0.4];
    b.put(b.kit.ball, leaf, p, 0, rr);
    if (fruit && i % 2 === 0) b.put(b.kit.octa, fruit, [p[0], p[1] - rr * 0.6, p[2] + rr * 0.6], 0, [0.025, 0.04, 0.025]);
  }
  b.put(b.kit.ball, leaf, [x, y + h * 0.95, z], 0, r * 0.6);
}

/* Animals in profile, walking along x so the side is towards us. */
function animal(b, kind, { x = 0, y = 0, z = 0, s = 1, key = 'earth', ry = 0 } = {}) {
  const spec = {
    deer:     { L: 0.30, H: 0.20, fwd: 0.10, body: [0.15, 0.075, 0.07], neck: 0.13, head: [0.05, 0.035, 0.035], leg: 0.018 },
    elephant: { L: 0.34, H: 0.15, fwd: 0.07, body: [0.19, 0.12, 0.12], neck: 0.03, head: [0.09, 0.09, 0.08], leg: 0.045 },
    horse:    { L: 0.34, H: 0.22, fwd: 0.16, body: [0.17, 0.08, 0.075], neck: 0.09, head: [0.06, 0.035, 0.035], leg: 0.02 },
    cow:      { L: 0.32, H: 0.16, fwd: 0.10, body: [0.17, 0.085, 0.08], neck: 0.04, head: [0.055, 0.04, 0.04], leg: 0.024 }
  }[kind];
  b.at([x, y, z], [0, ry, 0], s, () => {
    const k = b.kit;
    const top = spec.H + spec.body[1];
    b.put(k.sphere, key, [0, spec.H + spec.body[1] * 0.6, 0], 0, spec.body);
    for (const lx of [-1, 1]) for (const lz of [-1, 1]) {
      const px = lx * spec.L * 0.36, pz = lz * spec.body[2] * 0.5;
      b.beam(key, [px, spec.H + 0.02, pz], [px + (kind === 'horse' ? lx * 0.02 : 0), 0, pz], spec.leg, spec.leg * 0.8);
    }
    const shoulder = [spec.L * 0.45, top * 0.92, 0];
    const head = [spec.L * 0.5 + spec.fwd, top + spec.neck, 0];
    if (kind !== 'elephant') b.beam(key, shoulder, head, spec.body[2] * 0.42, spec.head[1] * 0.75);
    b.put(k.sphere, key, head, [0, 0, kind === 'elephant' ? 0 : -0.5], spec.head);
    b.beam(key, [-spec.L * 0.48, top * 0.95, 0], [-spec.L * 0.62, top * 0.55, 0], 0.01, 0.006);
    if (kind === 'deer') {
      for (const side of [-1, 1]) {
        const base = [head[0] - 0.02, head[1] + 0.03, side * 0.02];
        b.path('brass', [base, [base[0] - 0.02, base[1] + 0.07, side * 0.04], [base[0] + 0.01, base[1] + 0.12, side * 0.05]], 0.006, 0.004);
        b.beam('brass', [base[0] - 0.015, base[1] + 0.05, side * 0.035], [base[0] + 0.03, base[1] + 0.08, side * 0.04], 0.004);
      }
    } else if (kind === 'elephant') {
      b.path(key, [[head[0] + 0.07, head[1] - 0.02, 0], [head[0] + 0.1, head[1] - 0.1, 0], [head[0] + 0.09, head[1] - 0.18, 0], [head[0] + 0.12, head[1] - 0.22, 0]], 0.03, 0.014);
      for (const side of [-1, 1]) {
        b.put(k.sphere, key, [head[0] - 0.03, head[1], side * 0.075], 0, [0.05, 0.075, 0.012]);
        b.beam('bone', [head[0] + 0.06, head[1] - 0.06, side * 0.035], [head[0] + 0.13, head[1] - 0.05, side * 0.04], 0.012, 0.004);
      }
    } else if (kind === 'horse') {
      b.path('white', [[shoulder[0] - 0.02, shoulder[1] + 0.03, 0], [head[0] - 0.05, head[1] + 0.02, 0]], 0.02, 0.012);
      b.put(k.cone, key, [head[0] - 0.02, head[1] + 0.05, 0.015], 0, [0.012, 0.04, 0.012]);
    } else if (kind === 'cow') {
      for (const side of [-1, 1]) b.path('bone', [[head[0] - 0.01, head[1] + 0.03, side * 0.025], [head[0], head[1] + 0.07, side * 0.06], [head[0] + 0.03, head[1] + 0.09, side * 0.05]], 0.008, 0.003);
      b.put(k.sphere, key, [spec.L * 0.25, top + 0.01, 0], 0, [0.05, 0.03, 0.04]);
    }
  });
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
    b.put(b.kit.sphere, key, [0, 0.06, 0], 0, [0.06, 0.055, 0.06]);
    b.put(b.kit.box, key, [0, 0.02, 0.02], 0, [0.06, 0.03, 0.05]);
    for (const side of [-1, 1]) b.put(b.kit.sphere, 'black', [side * 0.022, 0.055, 0.05], 0, 0.014);
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
  1: ['A blue crossed vajra over a floor of black fire: the vajra itself become the prison.', (b) => {
    ground(b, 'ring', { w: 0.84, floor: 'black', rimKey: 'blue', inner: 'navy' });
    flameRing(b, { cy: 0.48, z: -0.12, R: 0.3, n: 12, from: -0.1, to: 1.1, h: 0.17, keys: ['crimson', 'black', 'fire'] });
    crossedVajra(b, { y: 0.48, s: 0.62, key: 'blue', hub: 'white' });
  }],
  2: ['A sealed iron house wrapped in flame, on the blue ring of Avīci.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'black', rimKey: 'blue', inner: 'navy' });
    b.put(b.kit.box, 'iron', [0, 0.2, -0.02], 0, [0.36, 0.34, 0.3]);
    b.put(b.kit.pyramid, 'iron', [0, 0.43, -0.02], 0, [0.32, 0.14, 0.27]);
    b.put(b.kit.box, 'ember', [0, 0.15, 0.135], 0, [0.1, 0.17, 0.01]);
    for (let i = 0; i < 9; i += 1) {
      const a = i / 9 * PI;
      fire(b, { x: Math.cos(a) * 0.26, y: 0.03, z: Math.sin(a) * 0.1 + 0.06, h: 0.24 + (i % 3) * 0.06, w: 0.12, lean: -Math.cos(a) * 0.3 });
    }
  }],
  3: ['An iron cauldron of molten metal over a blaze.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'black', rimKey: 'red', inner: 'gold' });
    for (let i = 0; i < 7; i += 1) fire(b, { x: (i - 3) * 0.075, y: 0.03, z: 0.02 + (i % 2) * 0.05, h: 0.2 + (i % 3) * 0.04, w: 0.11 });
    b.put(b.kit.bowl, 'iron', [0, 0.36, 0], 0, [0.3, 0.22, 0.24]);
    b.put(b.kit.torus(0.08), 'iron', [0, 0.36, 0], [PI / 2, 0, 0], [0.3, 0.24, 1]);
    b.put(b.kit.disc, 'ember', [0, 0.355, 0], 0, [0.28, 0.01, 0.22]);
    for (const side of [-1, 1]) b.beam('iron', [side * 0.22, 0.03, 0], [side * 0.25, 0.2, 0], 0.02);
  }],
  4: ['Iron houses with no door, smoke pouring from the cracks: the howling hells.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'black', rimKey: 'blue', inner: 'navy' });
    for (const [x, z, w, h] of [[-0.14, -0.06, 0.24, 0.28], [0.17, 0.06, 0.18, 0.2]]) {
      b.put(b.kit.box, 'iron', [x, 0.04 + h / 2, z], 0, [w, h, w * 0.9]);
      b.put(b.kit.pyramid, 'iron', [x, 0.04 + h + 0.05, z], 0, [w * 0.9, 0.1, w * 0.8]);
      b.put(b.kit.box, 'fire', [x, 0.04 + h * 0.55, z + w * 0.46], 0, [w * 0.7, 0.012, 0.01]);
      for (let i = 0; i < 4; i += 1) b.put(b.kit.ball, 'slate', [x + Math.sin(i * 1.7) * 0.03, 0.04 + h + 0.12 + i * 0.07, z], 0, 0.05 + i * 0.012);
    }
  }],
  5: ['Two mountains leaning in to crush, over ground ruled with black lines, and a tree of blades.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'earth', rimKey: 'blue', inner: 'navy' });
    for (let i = -2; i <= 2; i += 1) {
      b.put(b.kit.box, 'black', [i * 0.12, 0.045, 0.05], 0, [0.012, 0.006, 0.5]);
      b.put(b.kit.box, 'black', [0, 0.045, 0.05 + i * 0.1], 0, [0.6, 0.006, 0.012]);
    }
    for (const side of [-1, 1]) b.at([side * 0.2, 0.04, 0], [0, 0, side * 0.35], 1, () => mountain(b, { h: 0.45, r: 0.15, key: 'rock', snow: null, seed: 11 + side }));
    b.beam('iron', [0, 0.04, -0.2], [0, 0.6, -0.2], 0.02, 0.012);
    for (let i = 0; i < 8; i += 1) {
      const y = 0.25 + (i >> 1) * 0.09, side = i % 2 ? 1 : -1;
      b.put(b.kit.pyramid, 'silver', [side * 0.06, y, -0.2], [0, 0, side * -1.1], [0.025, 0.14, 0.008]);
    }
  }],
  6: ['A field of swords stood in burning ground, where the slain revive and fight again.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'crimson', rimKey: 'red', inner: 'gold' });
    for (let i = 0; i < 7; i += 1) {
      const a = i / 7 * TAU, r = i === 0 ? 0 : 0.2;
      sword(b, { x: Math.cos(a) * r, y: 0.04, z: Math.sin(a) * r * 0.7, s: 0.62, r: [0, a, (i % 2 ? 0.25 : -0.25)] });
    }
    for (let i = 0; i < 6; i += 1) fire(b, { x: Math.cos(i) * 0.28, y: 0.04, z: Math.sin(i) * 0.2, h: 0.12, w: 0.08 });
  }],
  7: ['Spires of ice and a frozen lotus splitting open, in the blue ring of the cold hells.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'ice', rimKey: 'blue', inner: 'navy' });
    const rnd = seeded(77);
    for (let i = 0; i < 9; i += 1) {
      const a = i / 9 * TAU, r = 0.24 + rnd() * 0.08;
      b.put(b.kit.octa, i % 2 ? 'ice' : 'sky', [Math.cos(a) * r, 0.12, Math.sin(a) * r * 0.8], [0, rnd(), (rnd() - 0.5) * 0.4], [0.04, 0.16 + rnd() * 0.12, 0.04]);
    }
    lotus(b, { y: 0.04, r: 0.2, n: 8, key: 'ice', key2: 'sky', disc: null, open: 1.0 });
    b.put(b.kit.octa, 'ice', [0, 0.28, 0], 0, [0.06, 0.18, 0.06]);
  }],
  8: ['A boulder, a pillar and a tree in an ordinary landscape: the hells that last a day.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'grass', rimKey: 'red', inner: 'gold' });
    b.put(b.kit.ball, 'rock', [-0.17, 0.12, 0.02], [0.3, 0.5, 0], [0.13, 0.1, 0.11]);
    b.put(b.kit.cyl, 'slate', [0.15, 0.25, 0.06], 0, [0.04, 0.42, 0.04]);
    b.put(b.kit.box, 'slate', [0.15, 0.47, 0.06], 0, [0.11, 0.025, 0.11]);
    tree(b, { x: 0.02, z: -0.18, h: 0.5, r: 0.14, leaf: 'leaf', seed: 8 });
    b.put(b.kit.box, 'wood', [-0.02, 0.06, 0.18], [0, 0.4, 0], [0.12, 0.04, 0.05]);
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
  10: ['A hungry ghost: belly like a mountain, neck like a hair, and a bowl that comes to it as fire.', (b) => {
    ground(b, 'ring', { w: 0.82, floor: 'earth', rimKey: 'red', inner: 'gold' });
    b.at([0, 0.04, 0], 0, 1, () => {
      b.put(b.kit.sphere, 'ghost', [0, 0.3, 0], 0, [0.17, 0.19, 0.16]);
      for (const side of [-1, 1]) {
        b.path('ghost', [[side * 0.06, 0.15, 0], [side * 0.09, 0.07, 0.03], [side * 0.08, 0, 0]], 0.018, 0.012);
        b.path('ghost', [[side * 0.13, 0.4, 0], [side * 0.2, 0.3, 0.05], [side * 0.14, 0.24, 0.14]], 0.012, 0.009);
      }
      b.beam('ghost', [0, 0.47, 0], [0, 0.6, 0], 0.012);
      b.put(b.kit.sphere, 'ghost', [0, 0.65, 0], 0, [0.06, 0.065, 0.06]);
      b.put(b.kit.sphere, 'black', [0, 0.635, 0.055], 0, 0.006);
      b.put(b.kit.bowl, 'iron', [0, 0.24, 0.2], [PI, 0, 0], [0.05, 0.03, 0.05]);
      fire(b, { y: 0.26, z: 0.2, h: 0.1, w: 0.05 });
    });
  }],
  11: ['A deer on a grassy rise, listening for danger.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'grass', rimKey: 'red', inner: 'gold' });
    b.put(b.kit.dome, 'grass', [0, 0.04, 0], 0, [0.3, 0.06, 0.2]);
    animal(b, 'deer', { y: 0.08, s: 1.25, key: 'earth' });
    tree(b, { x: -0.26, z: -0.18, h: 0.42, r: 0.11, seed: 12 });
    mountain(b, { x: 0.25, z: -0.2, h: 0.22, r: 0.1, key: 'rock', snow: null, seed: 4 });
  }],
  12: ['A white elephant with a jewelled saddle, standing on cloud among the gods.', (b) => {
    ground(b, 'ring', { w: 0.86, floor: 'sky', rimKey: 'red', inner: 'gold' });
    cloud(b, { y: 0.03, w: 0.56, h: 0.07, seed: 12 });
    animal(b, 'elephant', { y: 0.1, s: 1.2, key: 'white' });
    b.put(b.kit.box, 'red', [0, 0.44, 0], 0, [0.14, 0.03, 0.2]);
    jewels(b, { y: 0.45, s: 0.5, flames: false });
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
  16: ['A black block capped with gold, and on it Rudra with his trident: freedom turned to a prison.', (b) => {
    b.put(b.kit.box, 'white', [0, 0.02, 0], 0, [0.62, 0.04, 0.5]);
    b.put(b.kit.box, 'black', [0, 0.22, 0], 0, [0.52, 0.36, 0.42]);
    b.put(b.kit.box, 'gold', [0, 0.415, 0], 0, [0.54, 0.03, 0.44]);
    standing(b, { y: 0.43, s: 0.68, robe: 'black', skin: 'navy', hair: 'bun', staff: 'iron' });
    for (let i = 0; i < 3; i += 1) b.put(b.kit.cone, 'iron', [0.082 + (i - 1) * 0.025, 0.43 + 0.6, 0], 0, [0.008, 0.06, 0.008]);
  }],
  17: ['Jambudvīpa, narrow to the south, with the jambu tree and a person seated beneath it.', (b) => {
    b.put(b.kit.slab('trapezoid', OUTLINES.trapezoid(b.THREE), 0.06), 'red', [0, 0.04, 0], [-PI / 2, 0, PI], [0.9, 0.7, 1]);
    b.put(b.kit.slab('trapezoid', OUTLINES.trapezoid(b.THREE), 0.06), 'sky', [0, 0.06, 0], [-PI / 2, 0, PI], [0.7, 0.54, 1]);
    tree(b, { x: 0, z: -0.12, h: 0.75, r: 0.24, leaf: 'green', fruit: 'crimson', seed: 17, n: 7 });
    seated(b, { x: 0.16, y: 0.09, z: 0.12, s: 0.5, robe: 'saffron', hair: 'bun' });
  }],
  18: ['The round western land of cattle, with a cow beside a lake under Meru’s red light.', (b) => {
    b.put(b.kit.disc, 'crimson', [0, 0.03, 0], 0, [0.44, 0.06, 0.4]);
    b.put(b.kit.disc, 'grass', [0, 0.065, 0], 0, [0.4, 0.02, 0.36]);
    b.put(b.kit.disc, 'water', [-0.16, 0.078, -0.1], 0, [0.13, 0.01, 0.09]);
    animal(b, 'cow', { x: 0.06, y: 0.07, z: 0.08, s: 1.25, key: 'white' });
    tree(b, { x: 0.25, z: -0.18, h: 0.4, r: 0.1, seed: 18 });
  }],
  19: ['The half-moon eastern land, bright as crystal, with a tall, noble figure.', (b) => {
    b.put(b.kit.slab('halfmoon', OUTLINES.halfmoon(b.THREE), 0.06), 'white', [0, 0.04, 0.06], [-PI / 2, 0, 0], [0.9, 0.9, 1]);
    for (let i = 0; i < 5; i += 1) b.put(b.kit.octa, 'ice', [-0.28 + i * 0.14, 0.15, -0.18 + Math.abs(i - 2) * 0.04], [0, i, 0], [0.04, 0.12 + (2 - Math.abs(i - 2)) * 0.05, 0.04]);
    standing(b, { x: 0, y: 0.07, z: 0.12, s: 0.9, robe: 'white', hair: 'bun', halo: null });
  }],
  20: ['The square northern land of Kuru, with the tree that gives whatever is wished for.', (b) => {
    b.put(b.kit.box, 'red', [0, 0.03, 0], 0, [0.8, 0.06, 0.62]);
    b.put(b.kit.box, 'gold', [0, 0.065, 0], 0, [0.66, 0.01, 0.48]);
    b.put(b.kit.box, 'navy', [0, 0.07, 0], 0, [0.62, 0.012, 0.44]);
    tree(b, { x: 0, z: -0.08, h: 0.8, r: 0.24, leaf: 'jade', fruit: 'gold', seed: 20, n: 8 });
    b.put(b.kit.box, 'white', [0.25, 0.12, 0.12], 0, [0.12, 0.1, 0.1]);
    b.put(b.kit.pyramid, 'red', [0.25, 0.2, 0.12], 0, [0.12, 0.06, 0.11]);
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
  23: ['A gold ring behind the nine-tiered mountain of Bön, crowned with the yungdrung.', (b) => {
    aureole(b, 'ring', { y: 0.53, w: 0.86, outer: 'gold', inner: 'brass', band: 0.84, rim: 0.8 });
    for (let i = 0; i < 9; i += 1) b.put(b.kit.cyl, i % 2 ? 'sage' : 'white', [0, 0.02 + i * 0.035, 0], 0, [0.3 - i * 0.026, 0.035, 0.22 - i * 0.018]);
    /* As the board draws it: a grey block with four red slots let into its
       face, each a quarter-turn from the last. */
    b.at([0, 0.53, 0.02], 0, 0.3, () => {
      b.put(b.kit.box, 'slate', [0, 0, 0], 0, [1, 1, 0.2]);
      let [x, y, w, h] = [-0.215, 0.19, 0.53, 0.12];
      for (let i = 0; i < 4; i += 1) {
        b.put(b.kit.box, 'red', [x, y, 0.012], 0, [w, h, 0.2]);
        [x, y, w, h] = [y, -x, h, w];
      }
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
    b.put(b.kit.box, 'red', [0, 0.08, 0], 0, [0.46, 0.16, 0.32]);
    b.put(b.kit.box, 'gold', [0, 0.165, 0], 0, [0.48, 0.015, 0.34]);
    const top = lotus(b, { y: 0.16, r: 0.2, disc: 'white' });
    seated(b, { y: top - 0.02, s: 0.72, robe: 'maroon', hair: 'hat', mudra: 'teach', sash: 'saffron' });
    vajra(b, { x: -0.09, y: 0.07, z: 0.19, s: 0.14, r: [0, 0, PI / 2] });
    bell(b, { x: 0.1, y: 0.02, z: 0.19, s: 0.38 });
  }],
  26: ['The golden wheel of the universal monarch, studded with jewels, standing on cloud.', (b) => {
    cloud(b, { y: 0, w: 0.6, h: 0.1, seed: 26 });
    wheel(b, { y: 0.52, s: 0.33, rim: 'gold', hub: 'blue', spokes: 8, bosses: 'gold', tips: 'gold' });
    b.put(b.kit.torus(0.14), 'blue', [0, 0.52, 0], 0, 0.3);
    jewels(b, { y: 0.48, z: 0.05, s: 0.32, flames: false });
  }],
  29: ['A dark jewel in a ring of flame, set on cloud: the heaven without fighting.', (b) => {
    cloud(b, { y: 0, w: 0.66, h: 0.12, seed: 29 });
    b.put(b.kit.torus(0.2), 'sage', [0, 0.17, 0], [PI / 2, 0, 0], [0.16, 0.12, 1]);
    flameRing(b, { cy: 0.45, z: -0.08, R: 0.24, n: 11, h: 0.17, from: -0.1, to: 1.1, keys: ['fire', 'flame', 'ember'] });
    b.put(b.kit.lathe('drop', [[0, 0], [0.12, 0.03], [0.18, 0.14], [0.16, 0.28], [0.08, 0.4], [0, 0.44]], 24), 'navy', [0, 0.17, 0]);
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
  34: ['The face of Mahākāla: three eyes, bared fangs, a crown of skulls and hair of fire.', (b) => {
    flameRing(b, { cy: 0.48, z: -0.14, R: 0.3, n: 13, from: -0.2, to: 1.2, h: 0.18, keys: ['fire', 'flame', 'ember'] });
    b.put(b.kit.sphere, 'earth', [0, 0.5, -0.07], 0, [0.32, 0.34, 0.12]);
    b.put(b.kit.sphere, 'navy', [0, 0.45, 0], 0, [0.2, 0.23, 0.17]);
    for (const x of [-0.08, 0, 0.08]) {
      const y = x === 0 ? 0.56 : 0.49;
      b.put(b.kit.sphere, 'white', [x, y, 0.15], 0, [0.032, 0.028, 0.02]);
      b.put(b.kit.sphere, 'red', [x, y, 0.165], 0, 0.013);
    }
    b.put(b.kit.box, 'crimson', [0, 0.36, 0.14], 0, [0.16, 0.06, 0.04]);
    for (let i = 0; i < 5; i += 1) b.put(b.kit.cone, 'white', [-0.06 + i * 0.03, 0.37, 0.165], [PI, 0, 0], [0.01, 0.035, 0.01]);
    for (const side of [-1, 1]) b.put(b.kit.cone, 'white', [side * 0.07, 0.36, 0.16], 0, [0.014, 0.06, 0.014]);
    for (let i = 0; i < 5; i += 1) {
      const a = (i - 2) * 0.38;
      skull(b, { x: Math.sin(a) * 0.17, y: 0.62 - Math.abs(i - 2) * 0.02, z: Math.cos(a) * 0.1, s: 0.75 });
    }
    b.put(b.kit.torus(0.12), 'gold', [0, 0.64, 0], [PI / 2 - 0.2, 0, 0], [0.19, 0.14, 0.2]);
  }],
  36: ['Four nested spheres of light over a swirl of mist: space, consciousness, nothingness, and neither.', (b) => {
    cloud(b, { y: 0, w: 0.7, h: 0.09, key: 'cloud', under: 'sage', seed: 36 });
    for (let i = 0; i < 3; i += 1) b.put(b.kit.torus(0.05), 'shade', [0, 0.12 + i * 0.04, 0], [PI / 2, 0, i * 0.4], 0.32 - i * 0.07);
    [0.32, 0.24, 0.16, 0.08].forEach((r, i) => b.put(b.kit.sphere, i === 3 ? 'light' : 'mist', [0, 0.5, 0], 0, r));
  }],
  38: ['A monk standing with alms bowl and ringing staff, in the blue cartouche of the disciples.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'sage', [0, 0.02, 0], 0, [0.22, 0.04, 0.18]);
    standing(b, { y: 0.04, s: 1.05, robe: 'saffron', hair: 'shaved', staff: 'gold', bowl: 'navy', leftHand: [-0.1, 0.3, 0.1] });
  }],
  39: ['A monk seated in calm abiding, applying stillness to the four truths.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.box, 'sage', [0, 0.04, 0], 0, [0.5, 0.08, 0.32]);
    seated(b, { y: 0.08, s: 1.05, robe: 'saffron', sash: 'maroon', hair: 'shaved' });
  }],
  40: ['A monk seated before the wheel of the four truths, now seen directly.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.box, 'sage', [0, 0.04, -0.04], 0, [0.5, 0.08, 0.3]);
    seated(b, { y: 0.08, z: -0.06, s: 0.95, robe: 'saffron', sash: 'maroon', hair: 'shaved', halo: 'sky' });
    wheel(b, { y: 0.15, z: 0.18, s: 0.1, spokes: 4, rim: 'gold', hub: 'gold' });
  }],
  41: ['A practitioner and the deity seated face to face as companions: the conduct tantra.', (b) => {
    aureole(b, 'ring', { y: 0.52, w: 0.88, outer: 'slate', inner: 'gold' });
    lotus(b, { y: 0.02, r: 0.3, n: 12, disc: 'white' });
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
    seated(b, { y: 0.04, z: 0.06, s: 0.8, robe: 'saffron', hair: 'bun' });
  }],
  45: ['A solitary figure at a charnel ground, ringed by the twelve links of dependent origination.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'earth', [0, 0.02, 0], 0, [0.36, 0.04, 0.24]);
    seated(b, { y: 0.04, s: 0.85, robe: 'saffron', hair: 'bun' });
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
    seated(b, { x: -0.1, y: 0.04, s: 0.85, robe: 'saffron', hair: 'bun', halo: 'gold' });
    stupa(b, { x: 0.22, y: 0.04, z: 0.02, s: 0.42 });
  }],
  48: ['An arhat absorbed in a sphere of peace, and Amitābha’s red light falling on him to rouse him.', (b) => {
    aureole(b, 'arch', { y: 0.05, w: 0.9, h: 0.98, outer: 'blue', inner: 'navy', band: 0.86, rim: 0.82 });
    b.put(b.kit.disc, 'sage', [0, 0.02, 0], 0, [0.3, 0.04, 0.22]);
    seated(b, { y: 0.04, s: 0.7, robe: 'saffron', hair: 'shaved' });
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
    b.put(b.kit.ball, 'rock', [0, 0.06, 0], 0, [0.3, 0.1, 0.2]);
    seated(b, { y: 0.1, s: 0.92, robe: 'saffron', sash: 'maroon', hair: 'shaved', halo: 'gold', bowl: 'navy' });
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
    b.put(b.kit.torus(0.14), 'sky', [0, 0.5, -0.1], 0, [0.3, 0.34, 0.3]);
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
    standing(b, { y: 0.1, s: 0.95, robe: 'jade', hair: 'crown', ry: 0.3, rightHand: [0.14, 0.46, 0.08] });
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
    b.put(b.kit.box, 'red', [0, 0.04, 0], 0, [0.5, 0.08, 0.32]);
    seated(b, { y: 0.08, z: -0.05, s: 0.85, robe: 'maroon', sash: 'saffron', hair: 'shaved', halo: 'gold' });
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
  97: ['A white elephant with a jewel on its saddle, descending on cloud: the Buddha taking birth.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    cloud(b, { y: 0.12, w: 0.5, h: 0.08, seed: 97 });
    animal(b, 'elephant', { y: 0.2, s: 1.15, key: 'white' });
    b.put(b.kit.box, 'red', [0, 0.53, 0], 0, [0.13, 0.025, 0.2]);
    b.put(b.kit.sphere, 'gold', [0, 0.57, 0], 0, 0.035);
  }],
  98: ['The horse Kanthaka leaping on cloud: the bodhisattva leaves the palace.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    cloud(b, { y: 0.1, w: 0.52, h: 0.08, seed: 98 });
    b.at([0, 0.18, 0], [0, 0, 0.18], 1, () => animal(b, 'horse', { s: 1.15, key: 'white' }));
    b.put(b.kit.box, 'red', [-0.02, 0.5, 0], [0, 0, 0.18], [0.12, 0.02, 0.18]);
    b.beam('gold', [-0.2, 0.18, 0.12], [-0.2, 0.78, 0.12], 0.008);
    b.put(b.kit.dome, 'gold', [-0.2, 0.76, 0.12], 0, [0.1, 0.04, 0.1]);
  }],
  99: ['The emaciated ascetic, seated in his practice, a bowl of rice beside him.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    b.put(b.kit.ball, 'rock', [0, 0.07, 0], 0, [0.28, 0.08, 0.2]);
    seated(b, { y: 0.11, s: 0.95, robe: 'ash', body: 'ash', skin: 'ash', arms: 'ash', hair: 'bun', thin: true, legs: 'saffron', halo: 'gold' });
    b.put(b.kit.bowl, 'gold', [0.22, 0.12, 0.12], [PI, 0, 0], [0.05, 0.035, 0.05]);
    b.put(b.kit.sphere, 'white', [0.22, 0.125, 0.12], 0, [0.04, 0.015, 0.04]);
  }],
  100: ['The Buddha touching the earth, Māra’s arrows falling as flowers.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    const top = lotus(b, { y: 0.02, r: 0.24 });
    seated(b, { y: top - 0.02, s: 0.9, robe: 'red', body: 'crimson', skin: 'gilt', arms: 'gilt', hair: 'buddha', mudra: 'earth', halo: 'gold' });
    const rnd = seeded(100);
    for (let i = 0; i < 10; i += 1) b.put(b.kit.sphere, i % 2 ? 'pink' : 'rose', [(rnd() - 0.5) * 0.7, 0.5 + rnd() * 0.35, 0.1 + rnd() * 0.06], 0, [0.025, 0.012, 0.025]);
  }],
  101: ['The Buddha under the bodhi tree on the vajra seat: awakening.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    tree(b, { y: 0, z: -0.1, h: 0.8, r: 0.26, leaf: 'green', seed: 101, n: 8 });
    b.put(b.kit.box, 'gold', [0, 0.05, 0.02], 0, [0.36, 0.1, 0.26]);
    seated(b, { y: 0.1, z: 0.04, s: 0.82, robe: 'red', body: 'crimson', skin: 'gilt', arms: 'gilt', hair: 'buddha', mudra: 'earth', halo: 'gold' });
  }],
  102: ['The golden wheel of Dharma between two deer, as in the deer park at Sārnāth.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    lotus(b, { y: 0.02, r: 0.14, n: 8, disc: null });
    wheel(b, { y: 0.4, s: 0.24, rim: 'gold', hub: 'gold', spokes: 8, tips: 'gold' });
    animal(b, 'deer', { x: -0.22, y: 0.02, s: 0.68, key: 'saffron', ry: 0 });
    animal(b, 'deer', { x: 0.22, y: 0.02, s: 0.68, key: 'saffron', ry: PI });
  }],
  103: ['The Buddha standing in the twin miracle: flame from the shoulders, water from the feet.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'crimson', band: 0.84, rim: 0.78 });
    b.put(b.kit.disc, 'water', [0, 0.02, 0], 0, [0.28, 0.03, 0.2]);
    for (let i = 0; i < 6; i += 1) {
      const a = i / 6 * TAU;
      b.path('water', [[Math.cos(a) * 0.04, 0.12, Math.sin(a) * 0.04], [Math.cos(a) * 0.16, 0.08, Math.sin(a) * 0.12], [Math.cos(a) * 0.22, 0.03, Math.sin(a) * 0.16]], 0.016, 0.008);
    }
    standing(b, { y: 0.06, s: 1.0, robe: 'red', skin: 'gilt', hair: 'buddha', halo: 'gold', rightHand: [0.13, 0.48, 0.08] });
    fire(b, { x: -0.13, y: 0.56, z: -0.02, h: 0.24, w: 0.1, lean: 0.3 });
    fire(b, { x: 0.13, y: 0.56, z: -0.02, h: 0.24, w: 0.1, lean: -0.3 });
  }],
  104: ['The stupa that receives the relics, gold and white, in the gold-rimmed cartouche of the last act.', (b) => {
    aureole(b, 'quatrefoil', { y: 0.48, w: 0.86, h: 1.0, outer: 'red', inner: 'gold', band: 0.84, rim: 0.76 });
    lotus(b, { y: 0, r: 0.3, n: 12, disc: null, open: 1.0 });
    stupa(b, { y: 0.05, s: 0.92 });
  }]
};

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

export function createModelMaterials(THREE) {
  const lit = {
    matte: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.72, metalness: 0 }),
    metal: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.36, metalness: 0.45 }),
    glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
    glass: new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.42, depthWrite: false })
  };
  const faint = {};
  for (const [key, material] of Object.entries(lit)) {
    material.name = 'model_' + key;
    faint[key] = material.clone();
    Object.assign(faint[key], { transparent: true, opacity: key === 'glass' ? 0.17 : FAINT, depthWrite: key !== 'glass' });
    faint[key].name = 'model_' + key + '_faint';
  }
  return { lit, faint };
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
  let materials = null, kit = null;
  const unit = ctx.SUMMIT * MODEL_UNIT;

  function attach(holder, square) {
    if (modelled.has(square) || !SQUARE_MODELS[square]) return false;
    holders.set(square, holder);
    return true;
  }

  function paint(square) {
    const model = models.get(square);
    if (!model) return;
    const on = lit.has(square);
    if (model.userData.lit === on) return;
    model.userData.lit = on;
    model.children.forEach((mesh) => {
      mesh.material = (on ? materials.lit : materials.faint)[mesh.userData.finish];
    });
  }

  function load() {
    if (!materials) { materials = createModelMaterials(THREE); kit = makeKit(THREE); }
    holders.forEach((holder, square) => {
      if (models.has(square)) return;
      const model = buildSquareModel(THREE, square, materials, kit);
      const victory = square === ctx.VICTORY;
      model.scale.setScalar(unit * (victory ? VICTORY_SCALE : 1));
      model.position.y = ctx.SUMMIT * (victory ? 0.1 : MODEL_LIFT);
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

  return { attach, load, face, showActive, models, holders, modelled,
           built: () => models.size === holders.size && holders.size > 0 };
}
