/* The human figure of the destinations.
 *
 * One body for everyone the board names — the Buddha, an arhat, a monk with
 * his bowl, a bodhisattva, a yogi, a being in the hells — built the way a
 * sculptor would rather than assembled from beads: a head modelled as one
 * surface, with the brow, the sockets of the eyes, the cheekbones, the nose,
 * the lips and the chin raised from it and the face painted on it; a torso
 * turned from anatomical sections, chest, ribs, waist and hips, with the
 * breast, the shoulder blades and the spine in it; arms and legs swept along
 * their bones, the joints placed by the lengths of the bones themselves, so a
 * hand can only be where an arm can reach; hands of a palm and five fingers,
 * each finger bending at its three joints; feet with their toes.
 *
 * The garments are part of the same surfaces. The monastic robe lies over
 * the left shoulder and leaves the right bare, its rolled edge running across
 * the breast and its folds following it; the lower robe falls in folds to the
 * ankles, or covers the crossed legs and the lap; a sleeve opens at the wrist.
 *
 * Proportions are those of a person of stature S, all given as fractions of
 * it: the head an eighth, the shoulders a quarter across, the arm from
 * shoulder to wrist a third. A pose is a set of joints — where the pelvis is
 * and how it is turned, how the chest and the head are turned upon it, where
 * each wrist and ankle is, which way the elbows and knees point, how the hand
 * is held and how far each finger is curled — and the same body takes any of
 * them: seated in the vajra posture with any of the gestures, standing,
 * kneeling, huddled, writhing, fallen. `POSES` holds the presets; a recipe
 * can also pass a pose of its own.
 *
 * Everything is procedural geometry handed to the destination's builder
 * (square-models.js), which merges it with the rest of the model. Figures are
 * built at three levels of detail: fine for the figure a destination is
 * about, coarser for a smaller one, and plain for the crowds of the hells.
 */

const TAU = Math.PI * 2;
const PI = Math.PI;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const g = (d, s) => Math.exp(-(d * d) / (2 * s * s));
const lerp = (a, b, t) => a + (b - a) * t;

/* ── proportions, as fractions of the stature ──────────────────────────── */
const BODY = {
  hip: 0.52,          // the hip joints above the soles
  pivot: 0.12,        // the small of the back, where the chest turns on the pelvis
  shoulder: [0.1, 0.268, -0.008],
  shoulderIn: [0.056, 0.262, -0.008],
  neckBase: [0, 0.292, -0.014],
  neckTop: [0, 0.352, -0.004],
  hipJoint: [0.052, 0, 0.004],
  upperArm: 0.172, foreArm: 0.150,
  thigh: 0.245, shin: 0.243,
  head: 0.135         // one head unit: the face and skull are drawn in these
};

/* The torso's sections from the fork to the neck, in the pelvis's frame:
   height above the hip joints, half width, half depth, and how far forward
   the section's middle is. */
const TORSO = [
  [-0.070, 0.050, 0.044, -0.004],
  [-0.052, 0.085, 0.066, -0.010],
  [-0.020, 0.103, 0.077, -0.014],
  [0.020, 0.102, 0.072, -0.010],
  [0.060, 0.092, 0.066, -0.002],
  [0.090, 0.087, 0.064, 0.002],
  [0.125, 0.090, 0.066, 0.004],
  [0.165, 0.097, 0.071, 0.004],
  [0.205, 0.104, 0.076, 0.002],
  [0.235, 0.107, 0.072, -0.002],
  [0.255, 0.103, 0.064, -0.006],
  [0.272, 0.091, 0.056, -0.010],
  [0.286, 0.074, 0.048, -0.013],
  [0.296, 0.055, 0.042, -0.014],
  [0.304, 0.036, 0.034, -0.014]
];

/* Catmull-Rom through a table's rows, so the sections run on smoothly. */
function tableAt(rows, y) {
  if (y <= rows[0][0]) return rows[0].slice(1);
  const last = rows[rows.length - 1];
  if (y >= last[0]) return last.slice(1);
  let i = 0;
  while (rows[i + 1][0] < y) i += 1;
  const p0 = rows[Math.max(0, i - 1)], p1 = rows[i], p2 = rows[i + 1], p3 = rows[Math.min(rows.length - 1, i + 2)];
  const t = (y - p1[0]) / (p2[0] - p1[0]);
  const out = [];
  for (let k = 1; k < p1.length; k += 1) {
    const a = p0[k], b = p1[k], c = p2[k], d = p3[k];
    out.push(0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t));
  }
  return out;
}

/* ── surfaces ─────────────────────────────────────────────────────────────
   A grid of rows and columns closed around its columns, the two ends closed
   at poles, each vertex with its own colour. Winding is set from the
   surface itself, so whatever way a recipe runs its rows, it faces out. */
function surface(THREE, rows, cols, at) {
  const pos = [], col = [], idx = [], keys = [];
  for (let i = 0; i <= rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const v = at(i / rows, j / cols, i, j);
      pos.push(v.p[0], v.p[1], v.p[2]);
      col.push(v.c[0], v.c[1], v.c[2]);
      keys.push(v.k || null);
    }
  }
  const ring = (i) => {
    let x = 0, y = 0, z = 0, r = 0, gg = 0, bb = 0;
    for (let j = 0; j < cols; j += 1) {
      const k = (i * cols + j) * 3;
      x += pos[k]; y += pos[k + 1]; z += pos[k + 2];
      r += col[k]; gg += col[k + 1]; bb += col[k + 2];
    }
    return [x / cols, y / cols, z / cols, r / cols, gg / cols, bb / cols];
  };
  const c0 = ring(0), c1 = ring(rows);
  const p0 = pos.length / 3; pos.push(c0[0], c0[1], c0[2]); col.push(c0[3], c0[4], c0[5]); keys.push(keys[0]);
  const p1 = pos.length / 3; pos.push(c1[0], c1[1], c1[2]); col.push(c1[3], c1[4], c1[5]); keys.push(keys[rows * cols]);
  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      const k = (j + 1) % cols;
      const a = i * cols + j, b = i * cols + k, c = (i + 1) * cols + j, d = (i + 1) * cols + k;
      idx.push(a, c, b, b, c, d);
    }
  }
  for (let j = 0; j < cols; j += 1) {
    const k = (j + 1) % cols;
    idx.push(p0, j, k, p1, rows * cols + k, rows * cols + j);
  }
  // face outwards: test the middle row against its own centre
  const mid = Math.floor(rows / 2), cm = ring(mid);
  const A = mid * cols, B = mid * cols + 1, C = (mid + 1) * cols;
  const P = (n) => [pos[n * 3], pos[n * 3 + 1], pos[n * 3 + 2]];
  const a = P(A), b = P(B), c = P(C);
  const e1 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]], e2 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const nrm = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
  const out = [a[0] - cm[0], a[1] - cm[1], a[2] - cm[2]];
  if (nrm[0] * out[0] + nrm[1] * out[1] + nrm[2] * out[2] < 0) {
    for (let t = 0; t < idx.length; t += 3) { const s = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = s; }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  geom.setIndex(idx);
  geom.computeVertexNormals();
  if (keys.some((k) => k)) geom.userData.keys = keys;
  return geom;
}

/* Hand a surface to the builder. One painted with more than one kind of
   paint — the gilt skin of a Buddha and the cloth of his robe — goes in as
   one part for each, so each is merged with its own finish. */
function put(b, geom, key) {
  const keys = geom.userData.keys;
  if (!keys) { b.put(geom, key); return; }
  const groups = new Map();
  const index = geom.index.array;
  for (let t = 0; t < index.length; t += 3) {
    const a = keys[index[t]] || key, c = keys[index[t + 1]] || key, d = keys[index[t + 2]] || key;
    const k = a === c || a === d ? a : c === d ? c : a;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(index[t], index[t + 1], index[t + 2]);
  }
  for (const [k, list] of groups) {
    const part = new b.THREE.BufferGeometry();
    for (const name of ['position', 'normal', 'color']) part.setAttribute(name, geom.attributes[name]);
    part.setIndex(list);
    b.put(part, k);
  }
}

/* A tube swept along a curve through `points`. `radius(t, a, d)` gives the
   distance out from the curve at a fraction t of the way along (d of the
   length) and an angle a about it, measured from `ref(t)` — the direction a
   limb's front faces, or its palm — so an arm can be flatter at the wrist
   than at the elbow and a calf can swell behind. */
function sweep(THREE, points, { steps = 16, radial = 12, ref, radius, colour }) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal');
  const length = curve.getLength();
  const P = new THREE.Vector3(), T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3(), R = new THREE.Vector3();
  const frames = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    curve.getPointAt(t, P); curve.getTangentAt(t, T);
    R.set(...ref(t));
    N.copy(R).addScaledVector(T, -R.dot(T));
    if (N.lengthSq() < 1e-8) N.set(T.y, -T.x, 0.3).addScaledVector(T, -T.y * 0);
    N.normalize();
    B.crossVectors(T, N).normalize();
    frames.push([P.clone(), N.clone(), B.clone()]);
  }
  return surface(THREE, steps, radial, (t, u, i) => {
    const [p, n, bb] = frames[i];
    const a = u * TAU;
    const r = radius(t, a, t * length);
    const ca = Math.cos(a), sa = Math.sin(a);
    return {
      p: [p.x + (n.x * ca + bb.x * sa) * r, p.y + (n.y * ca + bb.y * sa) * r, p.z + (n.z * ca + bb.z * sa) * r],
      c: colour(t, a, t * length)
    };
  });
}

/* Two bones from a root to a target, bending towards a pole: where the
   elbow or the knee goes. A target out of reach is brought within it. */
function solve(a, target, l1, l2, pole) {
  let d = [target[0] - a[0], target[1] - a[1], target[2] - a[2]];
  let len = Math.hypot(...d);
  const most = (l1 + l2) * 0.995, least = Math.abs(l1 - l2) + 1e-4;
  const reach = Math.min(most, Math.max(least, len));
  d = d.map((x) => x / (len || 1));
  const end = [a[0] + d[0] * reach, a[1] + d[1] * reach, a[2] + d[2] * reach];
  const x = (l1 * l1 - l2 * l2 + reach * reach) / (2 * reach);
  const h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const dp = pole[0] * d[0] + pole[1] * d[1] + pole[2] * d[2];
  let perp = [pole[0] - d[0] * dp, pole[1] - d[1] * dp, pole[2] - d[2] * dp];
  const pl = Math.hypot(...perp) || 1;
  perp = perp.map((v) => v / pl);
  const mid = [a[0] + d[0] * x + perp[0] * h, a[1] + d[1] * x + perp[1] * h, a[2] + d[2] * x + perp[2] * h];
  return { mid, end };
}

const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/* turn v about the unit axis k by angle t */
function rot(v, k, t) {
  const c = Math.cos(t), s = Math.sin(t), kv = cross(k, v), kd = dot(k, v);
  return [v[0] * c + kv[0] * s + k[0] * kd * (1 - c), v[1] * c + kv[1] * s + k[1] * kd * (1 - c), v[2] * c + kv[2] * s + k[2] * kd * (1 - c)];
}

/* ── colour ─────────────────────────────────────────────────────────────── */
function painter(b) {
  const C = new b.THREE.Color();
  const memo = new Map();
  const of = (key) => {
    if (!memo.has(key)) {
      const p = b.paint(key);
      if (!p) throw new Error('No paint called ' + key);
      C.setHex(p.c);
      memo.set(key, [C.r, C.g, C.b]);
    }
    return memo.get(key);
  };
  of.mix = (a, c, t) => [lerp(a[0], c[0], t), lerp(a[1], c[1], t), lerp(a[2], c[2], t)];
  of.k = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  return of;
}

/* ── the head ─────────────────────────────────────────────────────────────
   In head units: about one unit from the chin to the crown, the origin in
   the middle of the face, the face towards +z. One surface, its columns
   gathered towards the face and its rows towards the features, so that the
   nose and the lips have vertices to be raised from. */
function headShape(x0, y0, z0, o) {
  let x = x0, y = y0, z = z0;
  // the jaw holds its width to its angle and then narrows to the chin; the
  // skull falls in behind towards the neck
  x *= 1 - 0.06 * smooth(0.02, -0.26, y) - 0.2 * smooth(-0.26, -0.46, y) * smooth(-0.15, 0.2, z);
  // the cranium shorter behind than a sphere, falling in towards the neck
  if (z < 0) z *= 0.84 * (1 - 0.36 * smooth(-0.08, -0.46, y));
  // the face is flatter than the skull, and the lower face comes forward
  if (z > 0.17) z = 0.17 + (z - 0.17) * 0.78;
  z += 0.085 * smooth(0.06, -0.3, y) * smooth(0.0, 0.22, z0);
  z += 0.04 * g(y + 0.25, 0.08) * g(x, 0.13) * smooth(0.0, 0.22, z0);         // the mouth's muzzle
  // the temples in
  x -= Math.sign(x) * 0.022 * g(y - 0.17, 0.08) * g(z - 0.17, 0.12);
  const ax = Math.abs(x);
  const fw = smooth(0.14, 0.3, z);
  let dz = 0;
  dz += 0.026 * g(y - 0.118, 0.035) * g(x, 0.22) * fw;                         // brow ridge
  dz -= 0.03 * g(y - 0.038, 0.04) * g(ax - 0.148, 0.055) * fw;                 // sockets
  const lid = o.eyes === 'open' ? 0.012 : 0.026;
  dz += lid * g(y - 0.03, 0.022) * g(ax - 0.148, 0.05) * fw;                   // the lids
  dz += 0.022 * g(y + 0.06, 0.06) * g(ax - 0.19, 0.055) * fw;                  // cheekbones
  x += Math.sign(x) * 0.016 * g(y + 0.05, 0.06) * g(z - 0.18, 0.1);
  // the nose: the bridge rising from between the eyes to the tip
  const ridge = y > -0.125 ? 0.1 * Math.pow(smooth(0.075, -0.125, y), 1.2) : 0.1 * smooth(-0.19, -0.125, y);
  dz += ridge * g(x, 0.024 + 0.026 * smooth(0.02, -0.14, y)) * fw;
  dz += 0.012 * g(y + 0.12, 0.022) * g(x, 0.032) * fw;                         // the tip
  dz += 0.022 * g(y + 0.148, 0.02) * g(ax - 0.05, 0.022) * fw;                 // the wings
  // the mouth: the upper lip, the lower, the groove beneath, the chin
  dz -= 0.006 * g(y + 0.185, 0.014) * g(x, 0.016) * fw;                        // philtrum
  dz += 0.016 * g(y + 0.218, 0.02) * g(x, 0.08) * fw;
  dz += 0.016 * g(y + 0.264, 0.02) * g(x, 0.066) * fw;
  if (o.mouth === 'scream') dz -= 0.05 * g(y + 0.245, 0.03) * g(x, 0.06) * fw;
  dz -= 0.008 * g(y + 0.305, 0.014) * g(x, 0.07) * fw;
  dz += 0.038 * g(y + 0.37, 0.05) * g(x, 0.1) * fw;
  // the cheeks fall in a little below the bone, and fill again at the jaw
  dz -= 0.008 * g(y + 0.17, 0.05) * g(ax - 0.2, 0.05) * fw;
  z += dz;
  return [x, y, z];
}

function headColour(x, y, z, o, P) {
  const skin = P(o.skin);
  let c = skin;
  if (o.glass) return c;
  const ax = Math.abs(x);
  const face = smooth(0.16, 0.3, z);
  // warmth in the cheeks, the lips and the ears' side of the face
  c = P.mix(c, P('rose'), 0.09 * g(y + 0.07, 0.07) * g(ax - 0.19, 0.06) * face);
  c = P.mix(c, P('lip'), 0.35 * g(y + 0.24, 0.035) * g(x, 0.07) * face);
  // the scalp of a shaved head, blue-grey with the hair beneath it
  if (o.scalp) {
    const hairline = 0.2 + 0.07 * smooth(0.12, 0.3, ax) - 0.12 * smooth(0.12, -0.2, z);
    const above = smooth(hairline - 0.015, hairline + 0.035, y) * (1 - smooth(-0.3, -0.42, y));
    c = P.mix(c, P.mix(skin, P('slate'), 0.5), above * 0.5);
  }
  return c;
}

/* The head's surface, drawn once for each kind: rows gathered about the
   face, columns about the front. */
function headParams(v, u) {
  const tv = 2 * v - 1;
  const theta = PI / 2 * (1 + 0.6 * tv + 0.4 * tv * tv * tv) + 0.12 * Math.sin(PI * v);
  const tu = 2 * u - 1;
  const phi = PI * (0.5 * tu + 0.5 * tu * tu * tu);
  return [Math.sin(theta) * Math.sin(phi), Math.cos(theta), Math.sin(theta) * Math.cos(phi)];
}
const headPoint = (n, o) => headShape(n[0] * 0.35, 0.03 + n[1] * 0.465, -0.04 + n[2] * 0.42, o);

/* Where the face is, front to back, at any point of it: a fine height map
   of the front of the head, so that what is laid on the face — the brows,
   the lines of the lashes, the lips — lies on it. */
function faceMap(o) {
  const N = 0.006, cells = new Map();
  for (let i = 0; i <= 220; i += 1) {
    for (let j = 0; j <= 160; j += 1) {
      const theta = 0.9 + i / 220 * 1.9, phi = -1.25 + j / 160 * 2.5;
      const p = headPoint([Math.sin(theta) * Math.sin(phi), Math.cos(theta), Math.sin(theta) * Math.cos(phi)], o);
      const key = Math.round(p[0] / N) + ':' + Math.round(p[1] / N);
      if (!cells.has(key) || cells.get(key) < p[2]) cells.set(key, p[2]);
    }
  }
  const z = (x, y) => {
    const cx = Math.round(x / N), cy = Math.round(y / N);
    let best = -1, n = 0, sum = 0;
    for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) {
      const v = cells.get((cx + dx) + ':' + (cy + dy));
      if (v !== undefined) { sum += v; n += 1; best = Math.max(best, v); }
    }
    return n ? sum / n : best;
  };
  const normal = (x, y) => {
    const e = 0.012;
    return norm([-(z(x + e, y) - z(x - e, y)) / (2 * e), -(z(x, y + e) - z(x, y - e)) / (2 * e), 1]);
  };
  return { z, normal };
}

/* A feature laid along the face: a flattened tube through (x, y) points,
   `wide` across the face and `thick` out of it, sunk half its thickness. */
function onFace(b, map, key, pts, wide, thick, colour) {
  const th = (t) => (typeof thick === 'function' ? thick(t) : thick);
  const at = pts.map(([x, y], i) => {
    const n = map.normal(x, y);
    return add([x, y, map.z(x, y)], n, th(i / (pts.length - 1)) * 0.25);
  });
  b.put(sweep(b.THREE, at, { steps: map.coarse ? pts.length - 1 : Math.max(6, Math.round(pts.length * 1.5)), radial: map.coarse ? 4 : 5,
    ref: (t) => { const i = Math.min(pts.length - 1, Math.round(t * (pts.length - 1))); return map.normal(pts[i][0], pts[i][1]); },
    radius: (t, a) => {
      const w = typeof wide === 'function' ? wide(t) : wide;
      const ca = Math.cos(a) / th(t), sa = Math.sin(a) / w;
      return 1 / Math.sqrt(ca * ca + sa * sa);
    },
    colour: () => colour }), key);
}

function sculptedHead(b, o) {
  const { THREE } = b;
  const P = painter(b);
  const fine = o.detail > 0.5, tiny = o.detail < -0.5;
  const rows = fine ? 46 : tiny ? 16 : 22, cols = fine ? 48 : tiny ? 18 : 24;
  const key = ['head', o.skin, o.eyes, o.mouth, o.scalp ? 1 : 0, rows].join(':');
  const glass = !!b.paint(o.skin).glass;
  const geom = b.kit.once(key, () => surface(THREE, rows, cols, (v, u) => {
    const p = headPoint(headParams(v, u), o);
    return { p, c: headColour(p[0], p[1], p[2], { ...o, glass }, P) };
  }));
  b.put(geom, o.skin);
  const k = b.kit;
  // ears: the shell turned a little forward, the rim of the helix round it;
  // long lobes for the Buddhas and the gods
  for (const sx of [-1, 1]) {
    b.at([sx * 0.335, -0.03, -0.06], [0, sx * 0.35, 0], 1, () => {
      b.ell(o.skin, [sx * 0.02, 0.01, -0.004], [0.03, 0.125, 0.074]);
      b.ell(o.skin, [sx * 0.03, -0.075, 0.05], [0.016, 0.03, 0.02]);       // the tragus
      if (o.long) b.ell(o.skin, [sx * 0.03, -0.19, 0.012], [0.024, 0.11, 0.045]);
      else b.ell(o.skin, [sx * 0.026, -0.11, 0.004], [0.022, 0.04, 0.035]);
    });
  }
  if (glass) return;
  const map = b.kit.once('facemap:' + o.eyes + ':' + o.mouth, () => faceMap(o));
  map.coarse = tiny;
  const brow = P(o.browKey || 'brow'), lash = P('lash'), lip = P('lip');
  const arc = (x0, x1, f, n = 7) => Array.from({ length: n }, (_, i) => { const x = lerp(x0, x1, i / (n - 1)); return [x, f(x, i / (n - 1))]; });
  for (const sx of [-1, 1]) {
    // the brows: a long arch, full at the inner end, fine at the outer
    onFace(b, map, o.skin, arc(sx * 0.052, sx * 0.255, (x, t) => 0.104 + 0.018 * Math.sin(PI * Math.min(1, t * 1.2)) - 0.024 * t * t),
      (t) => (fine ? 0.0085 : 0.014) * (1 - 0.45 * t), 0.004, P.mix(brow, P(o.skin), 0.25));
    if (o.eyes === 'open') {
      b.ell('eyewhite', add([sx * 0.148, 0.032, map.z(sx * 0.148, 0.032)], [0, 0, -0.026]), [0.056, 0.03, 0.035]);
      b.ell(o.iris || 'earth', [sx * 0.146, 0.03, map.z(sx * 0.146, 0.03) + 0.004], [0.022, 0.022, 0.008]);
      b.ell('lash', [sx * 0.146, 0.03, map.z(sx * 0.146, 0.03) + 0.008], [0.011, 0.011, 0.005]);
      onFace(b, map, o.skin, arc(sx * 0.09, sx * 0.21, (x, t) => 0.052 + 0.014 * Math.sin(PI * t)), 0.006, 0.006, lash);
    } else {
      // lowered eyes: the line of the lashes under a full lid, curving down
      onFace(b, map, o.skin, arc(sx * 0.088, sx * 0.218, (x, t) => 0.026 - 0.014 * Math.sin(PI * t) + 0.012 * t), (t) => 0.0045 * (0.6 + 0.4 * Math.sin(PI * t)), 0.0035, lash);
    }
    // the nostrils
    b.ell('lash', [sx * 0.036, -0.155, map.z(sx * 0.036, -0.155) - 0.006], [0.013, 0.007, 0.01], [0.3, 0, sx * 0.3]);
  }
  // the lips: the upper with its bow, the fuller lower lip
  if (o.mouth === 'scream') {
    b.ell('lash', [0, -0.245, map.z(0, -0.245) - 0.004], [0.065, 0.06, 0.03]);
    onFace(b, map, o.skin, arc(-0.08, 0.08, (x) => -0.19 - 0.02 * Math.cos(PI * x / 0.16), 9), 0.012, 0.01, lip);
    onFace(b, map, o.skin, arc(-0.07, 0.07, (x) => -0.3 + 0.03 * Math.cos(PI * x / 0.14), 9), 0.013, 0.01, lip);
  } else {
    const tone = P.mix(lip, P(o.skin), 0.3);
    // upper and lower lip meet on the line of the mouth, with no gap between
    onFace(b, map, o.skin, arc(-0.08, 0.08, (x) => -0.226 + 0.005 * Math.abs(Math.sin(PI * x / 0.08 * 1.5)) * (1 - Math.abs(x) / 0.08) + 0.006 * (Math.abs(x) / 0.08) ** 2, 9),
      (t) => 0.003 + 0.0095 * Math.sin(PI * t), (t) => 0.004 + 0.009 * Math.sin(PI * t), tone);
    onFace(b, map, o.skin, arc(-0.068, 0.068, (x) => -0.25 - 0.006 * Math.cos(PI * x / 0.136) + 0.006, 9),
      (t) => 0.003 + 0.0125 * Math.sin(PI * t), (t) => 0.004 + 0.011 * Math.sin(PI * t), P.k(tone, 1.03));
    onFace(b, map, o.skin, arc(-0.083, 0.083, (x) => -0.236 + 0.007 * (Math.abs(x) / 0.083) ** 2, 9), (t) => 0.0015 + 0.0012 * Math.sin(PI * t), 0.003, P.k(lip, 0.4));
  }
}

/* ── the hand ─────────────────────────────────────────────────────────────
   From the wrist: `dir` the way the fingers point, `palm` the way the palm
   faces, `side` -1 for the right hand and +1 for the left, which puts the
   thumb on its side. `curl` is how far each digit bends, thumb first. */
const GRIP = {
  open: [0.15, 0.12, 0.12, 0.14, 0.18],
  rest: [0.3, 0.35, 0.45, 0.55, 0.65],
  lap: [0.25, 0.18, 0.2, 0.24, 0.3],
  circle: [0.55, 1.45, 0.3, 0.32, 0.4],     // thumb and forefinger joined
  point: [0.9, 0.05, 1.7, 1.8, 1.8],
  fist: [1.1, 2.3, 2.4, 2.4, 2.3],
  hold: [0.9, 1.6, 1.7, 1.75, 1.8],
  claw: [0.6, 1.0, 1.05, 1.1, 1.15],
  touch: [0.25, 0.1, 0.06, 0.1, 0.16]
};

function hand(b, o) {
  const { THREE } = b;
  const S = o.S, P = painter(b);
  const skin = P(o.skin), key = o.skin;
  const d = norm(o.dir);
  let n = o.palm.slice();
  n = norm(add(n, d, -dot(n, d)));
  // the thumb's side: for the right hand (side -1) with the palm forward and
  // the fingers up, the thumb is towards +x — the figure's middle
  const across = norm(cross(n, d).map((v) => v * -o.side));
  const curl = Array.isArray(o.curl) ? o.curl : GRIP[o.curl] || GRIP.rest;
  const at = (t, u = 0, v = 0) => [o.wrist[0] + d[0] * t + across[0] * u + n[0] * v, o.wrist[1] + d[1] * t + across[1] * u + n[1] * v, o.wrist[2] + d[2] * t + across[2] * u + n[2] * v];
  const fine = o.detail > 0.5, tiny = o.detail < -0.5;
  // the palm: from the heel of the hand to the knuckles, a little cupped
  const palmLen = 0.058 * S;
  b.put(surface(THREE, fine ? 4 : 3, fine ? 10 : 6, (t, u) => {
    const a = u * TAU;
    const w = (0.0165 + 0.006 * smooth(0, 0.7, t)) * S, h = (0.0105 - 0.0025 * t) * S;
    const ca = Math.cos(a), sa = Math.sin(a);
    const cup = -0.003 * S * (1 - ca * ca) * (sa > 0 ? 1 : 0);
    const thenar = 0.004 * S * g(ca - 0.6, 0.35) * (sa > 0 ? 1 : 0) * g(t - 0.3, 0.3);
    const tt = -0.004 * S + t * palmLen;
    return { p: at(tt, ca * w + 0.0012 * S, sa * (h + thenar) + cup), c: skin };
  }), key);
  // four fingers; a hand seen from far off has them as one
  if (tiny) {
    let v = d;
    const axis = norm(cross(v, n));
    const start = at(palmLen - 0.01 * S), pts = [start];
    let p = start;
    for (let s2 = 0; s2 < 2; s2 += 1) { v = rot(v, axis, (curl[2] + curl[3]) * 0.3); p = add(p, v, 0.022 * S); pts.push(p); }
    b.put(sweep(THREE, pts, { steps: 2, radial: 6, ref: () => n,
      radius: (t, a) => { const ca = Math.cos(a) / 0.006, sa = Math.sin(a) / 0.019; return S / Math.sqrt(ca * ca + sa * sa) * (1 - 0.3 * t); },
      colour: () => skin }), key);
    b.blob(key, at(0.01 * S, 0.014 * S, 0.004 * S), add(at(0.01 * S, 0.014 * S, 0.004 * S), norm(add(d, across, 0.9)), 0.035 * S), 0.0065 * S, 0.0065 * S);
    return;
  }
  const BASE = [0.0165, 0.0055, -0.0055, -0.0158], LEN = [0.044, 0.049, 0.046, 0.036], RAD = [0.0051, 0.0053, 0.005, 0.0044], SPLAY = [0.07, 0.0, -0.06, -0.14];
  for (let f = 0; f < 4; f += 1) {
    const start = at(palmLen - 0.008 * S - Math.abs(BASE[f]) * 0.35 * S, BASE[f] * S, -0.001 * S);
    let v = norm(add(d, across, SPLAY[f]));
    const axis = norm(cross(v, n));
    const pts = [start];
    const segs = [0.47, 0.31, 0.22], bend = [0.42, 0.36, 0.22];
    let p = start;
    for (let s = 0; s < 3; s += 1) {
      v = rot(v, axis, curl[f + 1] * bend[s]);
      p = add(p, v, LEN[f] * S * segs[s]);
      pts.push(p);
    }
    const r0 = RAD[f] * S;
    b.put(sweep(THREE, pts, { steps: fine ? 5 : 3, radial: fine ? 6 : 4, ref: () => n,
      radius: (t) => r0 * (1 - 0.3 * t) * (t > 0.92 ? Math.sqrt(Math.max(0.05, (1 - t) / 0.08)) * 0.8 + 0.2 : 1),
      colour: () => skin }), key);
  }
  // the thumb, from the heel of the hand out to the side and forward
  {
    const start = at(0.008 * S, 0.012 * S, 0.004 * S);
    let v = norm(add(add(d, across, 0.95), n, 0.45));
    const axis = norm(cross(v, n));
    const pts = [start];
    let p = start;
    const segs = [0.023, 0.017, 0.015];
    for (let s = 0; s < 3; s += 1) {
      v = rot(v, axis, curl[0] * (s ? 0.42 : 0.16));
      if (s === 0) v = norm(add(v, d, 0.6));
      p = add(p, v, segs[s] * S);
      pts.push(p);
    }
    const r0 = 0.0062 * S;
    b.put(sweep(THREE, pts, { steps: fine ? 5 : 3, radial: fine ? 6 : 4, ref: () => n,
      radius: (t) => r0 * (1 - 0.28 * t) * (t > 0.9 ? Math.sqrt(Math.max(0.05, (1 - t) / 0.1)) * 0.8 + 0.2 : 1),
      colour: () => skin }), key);
  }
}

/* ── the foot ─────────────────────────────────────────────────────────────
   From the ankle: `dir` the way the toes point, `sole` the way the sole
   faces (down for a standing foot, up for one resting on the other thigh). */
function foot(b, o) {
  const { THREE } = b;
  const S = o.S, P = painter(b);
  const skin = P(o.skin);
  const d = norm(o.dir);
  let sn = norm(add(o.sole, d, -dot(o.sole, d)));
  const side = norm(cross(sn, d));
  const at = (s, u, v) => [o.ankle[0] + d[0] * s + side[0] * u + sn[0] * v, o.ankle[1] + d[1] * s + side[1] * u + sn[1] * v, o.ankle[2] + d[2] * s + side[2] * u + sn[2] * v];
  const fine = o.detail > 0.5, tiny = o.detail < -0.5;
  // heel, arch, the ball of the foot, the root of the toes
  const SEC = [[-0.045, 0.032, 0.006, 0.012], [-0.036, 0.03, 0.017, 0.02], [-0.01, 0.022, 0.023, 0.021], [0.03, 0.03, 0.02, 0.026],
    [0.07, 0.036, 0.013, 0.03], [0.1, 0.039, 0.009, 0.031], [0.112, 0.04, 0.006, 0.026]];
  b.put(surface(THREE, fine ? 8 : tiny ? 4 : 5, fine ? 10 : tiny ? 5 : 6, (t, u) => {
    const [s, drop, h, w] = tableAt(SEC.map((r, i) => [i / (SEC.length - 1), ...r]), t);
    const a = u * TAU, ca = Math.cos(a), sa = Math.sin(a);
    // the sole flat, the instep arched; inner side higher than the outer
    const flat = sa > 0 ? 0.55 : 1;
    return { p: at(s * S, ca * w * S * (1 - 0.15 * Math.max(0, sa)), (drop + sa * h * flat) * S), c: skin };
  }), o.skin);
  // the toes, the great toe largest, in a curve
  if (!tiny) for (let i = 0; i < 5; i += 1) {
    const u = (0.021 - i * 0.0105) * S * o.inner;
    const len = [0.019, 0.016, 0.015, 0.013, 0.011][i] * S;
    const base = at((0.113 - i * i * 0.0012 - i * 0.002) * S, u, 0.037 * S);
    const tip = add(base, d, len);
    const r = [0.0068, 0.0047, 0.0044, 0.0041, 0.0037][i] * S;
    b.ell(o.skin, add(add(base, tip).map((v) => v / 2), sn, 0.001 * S), [r, r, r]);
  }
}

/* ── poses ─────────────────────────────────────────────────────────────────
   In units of the stature, the figure facing +z with its right towards -x,
   the floor or the seat at y = 0.

   pelvis: where the hip joints' middle is, and how the pelvis is turned
   chest, head: how each is turned upon the one below it
   arms, legs: [right, left] — the wrist or ankle, the way the elbow or knee
   points, and how the hand or foot is held. */
/* Seated, the hip joints stand this far above the seat. The arms and legs
   below are given from the hips. */
const SEAT = 0.075;
const SEATED_ARMS = {
  lap: [
    { wrist: [-0.072, 0.068, 0.158], pole: [-1, -0.2, -0.4], dir: [1, 0.05, 0.1], palm: [0, 1, 0], curl: 'lap' },
    { wrist: [0.072, 0.056, 0.15], pole: [1, -0.2, -0.4], dir: [-1, 0.05, 0.15], palm: [0, 1, 0], curl: 'lap' }],
  earth: [
    { wrist: [-0.2, 0.03, 0.2], pole: [-1, 0.2, -0.3], dir: [-0.08, -0.8, 0.6], palm: [0.25, 0.5, -0.8], curl: 'touch' },
    null],
  teach: [
    { wrist: [-0.035, 0.19, 0.152], pole: [-1, -0.6, -0.2], dir: [0.18, 1, 0.08], palm: [0.1, 0, 1], curl: 'circle' },
    { wrist: [0.04, 0.162, 0.142], pole: [1, -0.6, -0.2], dir: [-0.6, 0.55, 0.15], palm: [0, 0.05, -1], curl: 'circle' }],
  raise: [
    { wrist: [-0.155, 0.215, 0.14], pole: [-1, -0.8, -0.2], dir: [0.05, 1, 0.08], palm: [0, 0, 1], curl: 'open' },
    null],
  give: [
    { wrist: [-0.19, 0.02, 0.2], pole: [-1, 0.1, -0.4], dir: [0, -1, 0.35], palm: [0, 0.3, 1], curl: 'open' },
    null],
  knees: [
    { wrist: [-0.21, 0.035, 0.17], pole: [-1, 0.1, -0.6], dir: [-0.1, -0.4, 1], palm: [0, -1, 0], curl: 'rest' },
    { wrist: [0.21, 0.035, 0.17], pole: [1, 0.1, -0.6], dir: [0.1, -0.4, 1], palm: [0, -1, 0], curl: 'rest' }],
  drum: [
    { wrist: [-0.07, 0.22, 0.16], pole: [-1, -0.5, -0.2], dir: [0.6, 0.5, 0.4], palm: [0, 0, 1], curl: 'hold' },
    { wrist: [0.2, 0.33, 0.1], pole: [1, -0.4, -0.3], dir: [0, 1, 0.1], palm: [-1, 0, 0], curl: 'hold' }],
  heart: [
    { wrist: [-0.017, 0.17, 0.15], pole: [-1, -0.7, -0.1], dir: [0.12, 1, 0.12], palm: [1, 0, 0.1], curl: 'open' },
    { wrist: [0.017, 0.17, 0.15], pole: [1, -0.7, -0.1], dir: [-0.12, 1, 0.12], palm: [-1, 0, 0.1], curl: 'open' }],
  hold: [
    { wrist: [-0.06, 0.12, 0.16], pole: [-1, -0.3, -0.4], dir: [0.5, 0.6, 0.6], palm: [0.7, 0, 0.2], curl: 'hold' },
    { wrist: [0.072, 0.056, 0.15], pole: [1, -0.2, -0.4], dir: [-1, 0.05, 0.15], palm: [0, 1, 0], curl: 'lap' }]
};

const LEGS = {
  // the vajra posture: each foot on the other thigh, soles turned up
  vajra: [
    { ankle: [0.05, 0.0, 0.135], pole: [-1, 0.05, 0.6], foot: [1, 0.12, -0.15], sole: [0.05, 1, 0.2] },
    { ankle: [-0.035, 0.03, 0.155], pole: [1, 0.05, 0.6], foot: [-1, 0.14, -0.12], sole: [-0.05, 1, 0.25] }],
  stand: [
    { ankle: [-0.058, 0.045, 0.0], pole: [0, 0, 1], foot: [-0.12, 0, 1], sole: [0, -1, 0] },
    { ankle: [0.058, 0.045, 0.0], pole: [0, 0, 1], foot: [0.12, 0, 1], sole: [0, -1, 0] }],
  kneel: [
    { ankle: [-0.065, 0.045, -0.25], pole: [0, -0.4, 1], foot: [0, -0.3, -1], sole: [0, 0.45, -1] },
    { ankle: [0.065, 0.045, -0.25], pole: [0, -0.4, 1], foot: [0, -0.3, -1], sole: [0, 0.45, -1] }],
  huddle: [
    { ankle: [-0.06, 0.045, 0.2], pole: [-0.2, 1, 0.6], foot: [0, 0, 1], sole: [0, -1, 0] },
    { ankle: [0.06, 0.045, 0.2], pole: [0.2, 1, 0.6], foot: [0, 0, 1], sole: [0, -1, 0] }]
};

export const POSES = {
  seated: (mudra = 'lap') => ({ kind: 'seated', pelvis: { p: [0, SEAT, 0], r: [0, 0, 0] }, chest: [0.02, 0, 0], head: [0.1, 0, 0],
    arms: (SEATED_ARMS[mudra] || SEATED_ARMS.lap).map((a) => a && { ...a, wrist: add(a.wrist, [0, SEAT, 0]) }),
    legs: LEGS.vajra.map((l) => ({ ...l, ankle: add(l.ankle, [0, SEAT, 0]) })), mudra }),
  standing: () => ({ kind: 'standing', pelvis: { p: [0, BODY.hip, 0.0], r: [0, 0, 0] }, chest: [-0.02, 0, 0], head: [0.06, 0, 0],
    arms: [
      { wrist: [-0.16, 0.42, 0.035], pole: [-0.3, 0, -1], dir: [0.05, -1, 0.1], palm: [1, 0, 0.1], curl: 'rest' },
      { wrist: [0.16, 0.42, 0.035], pole: [0.3, 0, -1], dir: [-0.05, -1, 0.1], palm: [-1, 0, 0.1], curl: 'rest' }],
    legs: LEGS.stand }),
  kneel: () => ({ kind: 'kneel', pelvis: { p: [0, 0.29, -0.06], r: [0.12, 0, 0] }, chest: [0.25, 0, 0], head: [-0.25, 0, 0],
    arms: [
      { wrist: [-0.03, 0.47, 0.14], pole: [-1, -0.8, 0], dir: [0.15, 1, 0.1], palm: [1, 0, 0.1], curl: 'open' },
      { wrist: [0.03, 0.47, 0.14], pole: [1, -0.8, 0], dir: [-0.15, 1, 0.1], palm: [-1, 0, 0.1], curl: 'open' }],
    legs: LEGS.kneel }),
  huddle: () => ({ kind: 'huddle', pelvis: { p: [0, 0.075, -0.05], r: [-0.3, 0, 0] }, chest: [0.55, 0, 0], head: [0.25, 0, 0],
    arms: [
      { wrist: [0.06, 0.26, 0.19], pole: [-1, 0, 0.2], dir: [1, 0, -0.2], palm: [0, 0, -1], curl: 'rest' },
      { wrist: [-0.06, 0.24, 0.18], pole: [1, 0, 0.2], dir: [-1, 0, -0.2], palm: [0, 0, -1], curl: 'rest' }],
    legs: LEGS.huddle }),
  writhe: () => ({ kind: 'writhe', pelvis: { p: [0, BODY.hip - 0.01, 0], r: [0.05, 0.3, 0.08] }, chest: [-0.28, 0.3, -0.14], head: [-0.45, 0.25, 0.1],
    arms: [
      { wrist: [-0.13, 0.99, 0.02], pole: [-1, -0.2, -0.2], dir: [0.1, 1, 0], palm: [0.3, 0, 1], curl: 'claw' },
      { wrist: [0.06, 0.93, 0.08], pole: [1, -0.4, 0.1], dir: [-0.6, 0.6, 0], palm: [-0.2, -0.3, -1], curl: 'claw' }],
    legs: [
      { ankle: [-0.09, 0.045, -0.03], pole: [0, 0, 1], foot: [-0.15, 0, 1], sole: [0, -1, 0] },
      { ankle: [0.1, 0.13, -0.1], pole: [0.2, 0.2, 1], foot: [0.2, -0.5, 1], sole: [0, -1, -0.4] }] }),
  agony: () => ({ kind: 'agony', pelvis: { p: [0, 0.08, 0], r: [-1.35, 0.3, 0.25] }, chest: [-0.35, 0.25, 0.2], head: [-0.5, 0.3, 0],
    arms: [
      { wrist: [-0.32, 0.23, 0.2], pole: [-0.3, -1, 0], dir: [-0.6, 0.7, 0], palm: [0, 0, 1], curl: 'claw' },
      { wrist: [0.14, 0.32, 0.42], pole: [1, -0.5, 0], dir: [0.3, 1, 0.3], palm: [0, 0, 1], curl: 'claw' }],
    legs: [
      { ankle: [-0.12, 0.05, -0.42], pole: [0, 1, 0], foot: [0, -0.3, -1], sole: [0, -0.3, -1] },
      { ankle: [0.18, 0.2, -0.3], pole: [0.3, 1, 0], foot: [0.3, 0.6, -1], sole: [0, -1, -0.5] }] }),
  reach: () => ({ kind: 'reach', pelvis: { p: [0, BODY.hip - 0.02, 0], r: [0.08, 0, 0] }, chest: [0.25, 0, 0], head: [-0.4, 0, 0],
    arms: [
      { wrist: [-0.1, 0.98, 0.18], pole: [-1, -0.3, 0], dir: [0, 1, 0.2], palm: [0, 0, 1], curl: 'claw' },
      { wrist: [0.11, 0.96, 0.15], pole: [1, -0.3, 0], dir: [0, 1, 0.2], palm: [0, 0, 1], curl: 'claw' }],
    legs: [
      { ankle: [-0.07, 0.045, 0.02], pole: [0, 0, 1], foot: [-0.1, 0, 1], sole: [0, -1, 0] },
      { ankle: [0.08, 0.1, -0.12], pole: [0, -0.2, 1], foot: [0, -0.6, 1], sole: [0, -1, -0.5] }] }),
  fight: () => ({ kind: 'fight', pelvis: { p: [0, BODY.hip - 0.06, 0], r: [0.1, 0.3, 0] }, chest: [0.15, 0.3, 0.05], head: [-0.15, -0.2, 0],
    arms: [
      { wrist: [-0.12, 0.98, 0.1], pole: [-1, -0.2, -0.3], dir: [0.2, 1, 0.3], palm: [1, 0, 0], curl: 'fist' },
      { wrist: [0.14, 0.62, 0.22], pole: [1, -0.6, -0.2], dir: [-0.3, 0.1, 1], palm: [-1, 0, 0], curl: 'fist' }],
    legs: [
      { ankle: [-0.12, 0.045, 0.16], pole: [0, 0, 1], foot: [-0.1, 0, 1], sole: [0, -1, 0] },
      { ankle: [0.1, 0.06, -0.2], pole: [0, 0, 1], foot: [0.2, -0.3, 1], sole: [0, -1, -0.3] }] }),
  fallen: () => ({ kind: 'fallen', pelvis: { p: [0, 0.07, 0], r: [-PI / 2, 0, 0.12] }, chest: [0.12, -0.15, -0.1], head: [-0.25, 0.4, 0],
    arms: [
      { wrist: [-0.2, 0.03, 0.42], pole: [-1, 0.5, 0], dir: [-0.4, 0, 1], palm: [0, -1, 0], curl: 'rest' },
      { wrist: [0.24, 0.03, 0.2], pole: [1, 0.5, 0], dir: [0.6, 0, 0.6], palm: [0, -1, 0], curl: 'claw' }],
    legs: [
      { ankle: [-0.08, 0.035, -0.47], pole: [0, 1, 0], foot: [0, 0.1, -1], sole: [0, -1, -0.2] },
      { ankle: [0.14, 0.035, -0.4], pole: [0.4, 1, 0], foot: [0.3, 0.1, -1], sole: [0, -1, -0.2] }] })
};

/* ── frames ────────────────────────────────────────────────────────────────
   The pelvis, the chest turned on it at the small of the back, the head
   turned on the chest at the top of the neck. A point of the torso is
   carried by the pelvis below the waist and by the chest above it, and
   between the two by both, so the back bends rather than breaks. */
function frames(THREE, pose, S) {
  const E = (r) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r[0], r[1], r[2], 'YXZ'));
  const MP = new THREE.Matrix4().makeTranslation(pose.pelvis.p[0] * S, pose.pelvis.p[1] * S, pose.pelvis.p[2] * S).multiply(E(pose.pelvis.r));
  const pivot = BODY.pivot * S;
  const MC = MP.clone().multiply(new THREE.Matrix4().makeTranslation(0, pivot, 0)).multiply(E(pose.chest)).multiply(new THREE.Matrix4().makeTranslation(0, -pivot, 0));
  const nt = BODY.neckTop.map((v) => v * S);
  const MH = MC.clone().multiply(new THREE.Matrix4().makeTranslation(nt[0], nt[1], nt[2])).multiply(E(pose.head));
  const V = new THREE.Vector3();
  const apply = (M, p) => { V.set(p[0], p[1], p[2]).applyMatrix4(M); return [V.x, V.y, V.z]; };
  const dirOf = (M, p) => { V.set(p[0], p[1], p[2]).transformDirection(M); return [V.x, V.y, V.z]; };
  return { MP, MC, MH, apply, dirOf, euler: (M) => eulerOf(THREE, M),
    blend: (p) => {
      const w = smooth(0.04 * S, 0.19 * S, p[1]);
      const a = apply(MP, p), c = apply(MC, p);
      return [lerp(a[0], c[0], w), lerp(a[1], c[1], w), lerp(a[2], c[2], w)];
    } };
}

/* ── the figure ─────────────────────────────────────────────────────────── */

/* Who wears what:
   robe  the monastic robe over the left shoulder, the right bare
   bare  the bare body of a bodhisattva, a god or an ascetic over a lower
         garment, with jewels if the figure is crowned
   coat  a lay coat closed over both shoulders, sleeves to the wrist
   loin  a loincloth only: the beings of the hells and the pretas */
export function humanFigure(b, o) {
  const { THREE } = b;
  const S = o.stature;
  const pose = typeof o.pose === 'function' ? o.pose() : o.pose;
  const P = painter(b);
  const dress = o.dress || 'robe';
  const skinKey = o.skin || 'skin', robeKey = o.robe || 'maroon', lowerKey = o.lower || robeKey;
  const glass = !!(b.paint(skinKey).glass);
  const thin = o.thin ? 1 : 0;
  const detail = o.detail ?? b.detail ?? (b.scale() * S > 0.38 ? 1 : 0);
  const fine = detail > 0.5, tiny = detail < -0.5;
  const F = frames(THREE, pose, S);
  const fold = (key) => (b.paint(key).glass || b.paint(key).e ? key : key + '~');
  const skin = P(skinKey), robe = P(robeKey), lower = P(lowerKey);
  const W = (o.build || 1) * (1 - 0.1 * thin);
  const seated = pose.kind === 'seated';

  /* The torso: its sections, the anatomy on them, and the garment painted on
     it and standing a little proud of the skin. */
  const lineY = (x) => (0.198 + (x + 0.118) * 0.69) * S;     // the robe's upper edge, left neck to right armpit
  const robeOn = (x, y) => {
    if (dress === 'coat') return true;
    if (dress === 'robe') return y < lineY(x);
    if (dress === 'loin') return y < -0.035 * S;
    return y < 0.02 * S;                                       // bare: the lower garment's band
  };
  const torsoAt = (y, a) => {
    const [hw0, hd0, zc] = tableAt(TORSO, y / S);
    const hw = hw0 * S * W * (y > 0.14 * S ? 1 : 1 + 0.04 * (o.wide ? o.wide - 1 : 0)), hd = hd0 * S * (1 - 0.06 * thin);
    const ca = Math.cos(a), sa = Math.sin(a);
    // boxed at the chest and the hips, rounding towards the shoulders
    const e = 2 / lerp(2.5, 2.05, smooth(0.2 * S, 0.28 * S, y));
    let x = hw * Math.sign(ca) * Math.pow(Math.abs(ca), e);
    let z = zc * S + hd * Math.sign(sa) * Math.pow(Math.abs(sa), e);
    const fr = Math.pow(Math.max(0, sa), 1.4), bk = Math.pow(Math.max(0, -sa), 1.4);
    const yy = y / S, xx = x / S;
    let dz = 0;
    // the breast, the belly and the navel; the ribs of an ascetic
    dz += (0.017 - 0.008 * thin) * (g(xx - 0.05, 0.036) + g(xx + 0.05, 0.036)) * g(yy - 0.212, 0.03) * fr;
    dz -= 0.004 * g(xx, 0.008) * g(yy - 0.2, 0.05) * fr;
    dz += (thin ? -0.014 : 0.006) * g(xx, 0.055) * g(yy - 0.1, 0.045) * fr;
    dz -= 0.004 * g(xx, 0.006) * g(yy - 0.078, 0.006) * fr;
    if (thin) dz += 0.003 * Math.cos(yy * TAU / 0.024) * smooth(0.12, 0.15, yy) * (1 - smooth(0.24, 0.27, yy)) * (fr + 0.4 * (1 - fr));
    // the buttocks, the shoulder blades, the groove of the spine
    dz += 0.02 * (g(xx - 0.048, 0.04) + g(xx + 0.048, 0.04)) * g(yy + 0.022, 0.034) * bk;
    dz += 0.009 * (g(xx - 0.06, 0.03) + g(xx + 0.06, 0.03)) * g(yy - 0.235, 0.04) * bk;
    dz -= 0.004 * g(xx, 0.008) * smooth(0.04, 0.1, yy) * bk;
    z += dz * S * Math.sign(sa || 1);
    // the trapezius sloping from neck to shoulder
    let dy = 0;
    return [x, y + dy, z, sa, xx, yy];
  };
  const cloth = (x, y) => {
    if (!robeOn(x, y) || glass) return 0;
    return 0.0045 * S;
  };
  /* A point on the torso's surface at (x, y) of its own frame, in front or
     behind, stood off it by `lift`: where a necklace, a scarf or the edge of
     the robe lies. */
  const onTorso = (x, y, back = false, lift = 0) => {
    let lo = back ? -PI : 0, hi = back ? 0 : PI;
    for (let it = 0; it < 24; it += 1) {
      const m = (lo + hi) / 2;
      if ((torsoAt(y, m)[0] > x) === !back) lo = m; else hi = m;
    }
    const [px, py, pz] = torsoAt(y, (lo + hi) / 2);
    const out = lift + cloth(px, py);
    const nl = Math.hypot(px, pz) || 1;
    return F.blend([px + px / nl * out, py, pz + pz / nl * out]);
  };
  const rows = fine ? 30 : tiny ? 10 : 14, cols = fine ? 34 : tiny ? 14 : 18;
  const yLo = TORSO[0][0] * S, yHi = TORSO[TORSO.length - 1][0] * S;
  put(b, surface(THREE, rows, cols, (v, u) => {
    const y = lerp(yLo, yHi, v);
    const a = u * TAU;
    const [x, yy0, z, sa] = torsoAt(y, a);
    const on = robeOn(x, y);
    let out = on ? cloth(x, y) : 0;
    const lowerHere = y < 0.02 * S && dress !== 'coat';
    let c = on ? (lowerHere ? lower : robe) : skin;
    const k = on ? (lowerHere ? lowerKey : robeKey) : skinKey;
    if (on && !glass && dress === 'robe' && y > 0.02 * S) {
      // folds running with the edge, deeper away from it
      const dist = lineY(x) - y;
      const f = Math.sin(dist / S * TAU / 0.04 + x / S * 9) * smooth(0.0, 0.03 * S, dist);
      out += 0.0018 * S * f;
      c = P.k(c, 0.9 + 0.1 * f);
    }
    // outward along the section's own normal
    const nx = x, nz = z - 0.0;
    const nl = Math.hypot(nx, nz) || 1;
    return { p: F.blend([x + nx / nl * out, yy0, z + nz / nl * out]), c, k };
  }), skinKey);
  // the robe's rolled edge across the breast and the back
  if (dress === 'robe' && !glass) {
    for (const back of [false, true]) {
      const pts = [];
      for (let i = 0; i <= 8; i += 1) {
        const x = lerp(0.045, -0.122, i / 8) * S;
        pts.push(onTorso(x, lineY(x), back, 0.0025 * S));
      }
      b.put(sweep(THREE, pts, { steps: fine ? 14 : 8, radial: 6, ref: () => [0, 1, 0],
        radius: () => 0.0062 * S, colour: () => P.k(robe, 0.92) }), robeKey);
      if (o.border) b.put(sweep(THREE, pts.map((p, i) => add(p, F.dirOf(F.MC, [0, 0, back ? -1 : 1]), 0.003 * S * (back ? 1 : 1))),
        { steps: fine ? 14 : 8, radial: 5, ref: () => [0, 1, 0], radius: () => 0.003 * S, colour: () => P(o.border) }), o.border);
    }
  }
  // the neck, from the collar into the head
  const neckBase = F.apply(F.MC, BODY.neckBase.map((v) => v * S));
  const neckTop = F.apply(F.MH, [0, 0.01 * S, 0.004 * S]);
  const throat = F.apply(F.MH, [0, -0.012 * S, 0.012 * S]);
  b.put(sweep(THREE, [F.apply(F.MC, [0, 0.27 * S, -0.012 * S]), neckBase, throat, neckTop], {
    steps: fine ? 10 : tiny ? 4 : 6, radial: fine ? 14 : tiny ? 6 : 8, ref: () => F.dirOf(F.MC, [0, 0, 1]),
    radius: (t, a) => (0.034 + 0.008 * (1 - smooth(0.2, 0.55, t)) - 0.004 * thin) * S * (1 + 0.08 * Math.pow(Math.cos(a), 2)),
    colour: () => skin }), skinKey);

  /* Arms: shoulder to elbow to wrist, the bones' own lengths, a hand at the
     end. A sleeve is the arm drawn wider in the garment's colour, open at
     the wrist. */
  const fwd = F.dirOf(F.MC, [0, 0, 1]);
  pose.arms.forEach((spec, i) => {
    const side = i ? 1 : -1;
    const A = spec || POSES.seated('lap').arms[i];
    const sh = F.apply(F.MC, [side * BODY.shoulder[0] * S * W, BODY.shoulder[1] * S, BODY.shoulder[2] * S]);
    const shIn = F.apply(F.MC, [side * BODY.shoulderIn[0] * S * W, BODY.shoulderIn[1] * S, BODY.shoulderIn[2] * S]);
    const target = A.wrist.map((v) => v * S);
    const { mid: elbow, end: wrist } = solve(sh, target, BODY.upperArm * S, BODY.foreArm * S, norm(A.pole));
    const sleeve = dress === 'coat' || (dress === 'robe' && side > 0);
    // a hand hanging at the side follows its forearm
    const handDir = A.dir === 'fore' ? norm(add(add(wrist, elbow, -1), [0, 0, 0.03 * S])) : A.dir;
    const palm = A.palm;
    const ua = BODY.upperArm * S, len = ua + BODY.foreArm * S;
    const k = (1 - 0.25 * thin);
    const pts = [shIn, sh, elbow, add(elbow, add(wrist, elbow, -1), 0.5), wrist];
    // where the front of the limb faces: forward on the upper arm, the palm on the forearm
    const nPalm = norm(palm);
    const into = Math.hypot(...add(sh, shIn, -1));
    b.put(sweep(THREE, pts, { steps: fine ? 18 : tiny ? 7 : 10, radial: fine ? 12 : tiny ? 6 : 7,
      ref: (t) => norm(add(fwd, nPalm, smooth(0.5, 0.9, t) * 2)),
      radius: (t, a, dd) => {
        const d = dd - into;
        const ca = Math.cos(a), sa = Math.sin(a);
        let r;
        if (d < 0) r = lerp(0.036, 0.045, smooth(-into, 0, d)) * S;
        else if (d < ua) {
          const u = d / ua;
          r = lerp(0.045, 0.031, smooth(0, 0.5, u)) - 0.004 * smooth(0.7, 1, u);
          r += 0.004 * g(u - 0.55, 0.18) * Math.max(0, ca);              // biceps
          r += 0.003 * g(u - 0.4, 0.22) * Math.max(0, -ca);             // triceps
          r *= S;
        } else {
          const u = (d - ua) / (len - ua);
          r = lerp(0.028, 0.0205, smooth(0.1, 1, u)) + 0.0045 * g(u - 0.22, 0.16);
          r *= S * (1 - 0.32 * smooth(0.6, 1, u) * Math.abs(sa));      // flat at the wrist
        }
        r *= k;
        if (sleeve && !glass) r = Math.max(r + 0.004 * S, (0.026 + 0.007 * smooth(ua, len, d)) * S) * (d > len - 0.003 * S ? 0.8 : 1);
        return r;
      },
      colour: (t, a, dd) => (sleeve ? P.k(robe, 0.93 + 0.07 * Math.sin(dd / S * 90 + a * 2)) : skin) }), sleeve && !glass ? robeKey : skinKey);
    if (sleeve && !glass) {
      // the cloth hanging from the forearm
      const fa = add(elbow, wrist).map((v) => v / 2);
      b.blob(robeKey, add(fa, [0, -0.018 * S, -0.004 * S]), add(fa, [0, -0.085 * S, -0.008 * S]), 0.02 * S, 0.03 * S);
    }
    // the wrist into the hand
    const wristBack = add(wrist, norm(handDir), -0.004 * S);
    hand(b, { S, skin: skinKey, wrist: wristBack, dir: handDir, palm, side, curl: A.curl || 'rest', detail });
    if (o.jewels && !glass) {
      // a bracelet round the wrist and an armlet round the upper arm, each
      // ring turned to its bone
      const ring = (p, along, r, tube) => {
        const ax = norm(along), side2 = norm(cross(ax, Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0]));
        b.orient(b.kit.torus(tube), 'gold', p, side2, ax, [r, r, r]);
      };
      const fore = add(wrist, elbow, -1);
      ring(add(wrist, norm(fore), -0.014 * S), fore, 0.023 * S, 0.22);
      ring(add(sh, add(elbow, sh, -1), 0.36), add(elbow, sh, -1), 0.03 * S, 0.22);
    }
    o.onHand?.(i, wrist, handDir, palm);
  });

  /* Legs: hip to knee to ankle. Under a robe they are the robe, in folds;
     bare they are modelled, the calf full behind the shin. */
  const legsCovered = (dress === 'robe' || dress === 'coat' || dress === 'bare') && !glass;
  if (o.noLegs) pose.legs = [];
  const standingGown = !seated && pose.kind === 'standing';
  pose.legs.forEach((L, i) => {
    const side = i ? 1 : -1;
    const hip = F.apply(F.MP, [side * BODY.hipJoint[0] * S, BODY.hipJoint[1] * S, BODY.hipJoint[2] * S]);
    const hipIn = F.apply(F.MP, [side * 0.02 * S, 0.035 * S, -0.01 * S]);
    const { mid: knee, end: ankle } = solve(hip, L.ankle.map((v) => v * S), BODY.thigh * S, BODY.shin * S, norm(L.pole));
    if (!standingGown) {
      const th = BODY.thigh * S, len = th + BODY.shin * S;
      const into = Math.hypot(...add(hip, hipIn, -1));
      const pole = norm(L.pole);
      const covered = legsCovered;
      b.put(sweep(THREE, [hipIn, hip, knee, add(knee, add(ankle, knee, -1), 0.5), ankle], { steps: fine ? 18 : tiny ? 7 : 10, radial: fine ? 12 : tiny ? 6 : 7,
        ref: () => pole,
        radius: (t, a, dd) => {
          const d = dd - into, ca = Math.cos(a);
          let r;
          if (d < 0) r = 0.066;
          else if (d < th) {
            const u = d / th;
            r = lerp(0.068, 0.045, smooth(0.05, 0.95, u)) + 0.004 * g(u - 0.6, 0.2) * Math.max(0, ca);
          } else {
            const u = (d - th) / (len - th);
            r = lerp(0.041, 0.024, smooth(0.0, 1, u)) + 0.009 * g(u - 0.28, 0.16) * Math.max(0, -ca) - 0.002 * g(u - 0.05, 0.06);
          }
          r *= S * (1 - 0.3 * thin);
          if (covered) r += (0.012 + 0.003 * Math.sin(d / S * 70 + a * 3)) * S * (d > len - 0.01 * S ? 0.4 : 1);
          return r;
        },
        colour: (t, a, dd) => (covered ? P.k(lower, 0.9 + 0.1 * Math.sin(dd / S * 70 + a * 3)) : skin) }), covered ? lowerKey : skinKey);
      if (covered) {
        // the hem round the ankle, turned to the shin
        const shin = norm(add(ankle, knee, -1)), side2 = norm(cross(shin, [0, 1, 0.01]));
        b.orient(b.kit.torus(0.25), fold(lowerKey), add(ankle, shin, -0.012 * S), side2, shin, [0.03 * S, 0.03 * S, 0.03 * S]);
      }
    }
    foot(b, { S, skin: skinKey, ankle, dir: L.foot, sole: L.sole, detail, inner: -side * (seated ? -1 : 1) });
  });

  /* The garment below the waist, standing: a gown falling in folds from the
     hips to the ankles, its hem lifting where the feet step out. */
  if (standingGown) {
    const top = 0.06 * S, hem = (0.05 - BODY.hip) * S;
    const w0 = 0.1 * S * W * (o.wide || 1), d0 = 0.076 * S;
    b.put(surface(THREE, fine ? 20 : 10, fine ? 48 : 26, (v, u) => {
      const y = lerp(top, hem, v);
      const a = u * TAU, ca = Math.cos(a), sa = Math.sin(a);
      const down = smooth(0, 1, (top - y) / (top - hem));
      const hw = w0 * (1 + 0.32 * down), hd = d0 * (1 + 0.38 * down);
      const folds = Math.sin(a * (dress === 'coat' ? 9 : 13) + Math.sin(a * 3) * 0.8);
      const amp = 0.0055 * S * smooth(0.15, 1, down);
      const r = 1 + 0;
      const x = (hw + amp * folds) * Math.sign(ca) * Math.pow(Math.abs(ca), 0.85) * r;
      const z = (hd + amp * folds) * Math.sign(sa) * Math.pow(Math.abs(sa), 0.85) - 0.006 * S;
      const lift = v > 0.999 ? 0.006 * S * Math.max(0, sa) * (g(x / S - 0.06, 0.03) + g(x / S + 0.06, 0.03)) : 0;
      const c = P.k(dress === 'coat' ? robe : lower, 0.88 + 0.12 * folds * smooth(0.1, 1, down));
      return { p: F.apply(F.MP, [x, y + lift, z]), c };
    }), dress === 'coat' ? robeKey : lowerKey);
    if (o.hemBorder) b.put(b.kit.torus(0.06), o.hemBorder, F.apply(F.MP, [0, hem + 0.004 * S, -0.006 * S]), [PI / 2, 0, 0], [0.132 * S * W * (o.wide || 1), 0.105 * S, 0.04 * S]);
  }

  /* Seated, the robe covers the lap and falls in front of the seat. */
  if (seated && legsCovered) {
    b.ell(lowerKey, F.apply(F.MP, [0, -0.02 * S, 0.1 * S]), [0.15 * S, 0.045 * S, 0.1 * S]);
  }
  // the lower garment's band at the waist
  if (dress === 'bare' && !glass) {
    const across = F.dirOf(F.MP, [1, 0, 0]), up = F.dirOf(F.MP, [0, 1, 0]);
    b.orient(b.kit.torus(0.14), o.sash || fold(lowerKey), F.apply(F.MP, [0, 0.022 * S, -0.006 * S]), across, up, [0.1 * S * W, 0.079 * S, 0.08 * S]);
  }

  /* The head, in its own units. */
  const H = BODY.head * S;
  const origin = F.apply(F.MH, [0, 0.3 * H, 0.1 * H]);
  b.at(origin, F.euler(F.MH), H, () => {
    sculptedHead(b, { skin: skinKey, eyes: o.eyes || 'down', mouth: o.mouth || 'calm', long: !!o.longEars,
      scalp: o.scalp && !glass, detail, browKey: o.browKey, iris: o.iris });
    o.hair?.(b);
  });

  /* Jewels of a god: necklaces to the throat and the breast. */
  if (o.jewels && !glass) {
    const lace = (drop, wide) => Array.from({ length: 9 }, (_, i) => {
      const t = i / 8, x = (t * 2 - 1) * wide;
      return onTorso(x * S, (0.296 - drop * Math.sin(PI * t)) * S, false, 0.004 * S);
    });
    b.path('gold', lace(0.04, 0.05), 0.0042 * S);
    const long = lace(0.1, 0.064);
    b.path('gold', long, 0.0034 * S);
    b.ell('red', long[4], 0.008 * S);
    b.ell('blue', lace(0.04, 0.05)[4], 0.006 * S);
  }
  /* A scarf over the shoulders and behind the neck, its ends falling past
     the elbows; on a robe, a fold of cloth over the left shoulder. */
  if (o.sash && dress !== 'robe') {
    const at = (p) => F.apply(F.MC, p.map((v) => v * S));
    b.path(o.sash, [onTorso(-0.1 * S, 0.27 * S, false, 0.008 * S), onTorso(-0.06 * S, 0.29 * S, true, 0.01 * S),
      onTorso(0.06 * S, 0.29 * S, true, 0.01 * S), onTorso(0.1 * S, 0.27 * S, false, 0.008 * S)], 0.01 * S);
    for (const sx of [-1, 1]) b.path(o.sash, [onTorso(sx * 0.1 * S, 0.27 * S, false, 0.008 * S), at([sx * 0.15, 0.17, 0.05]), at([sx * 0.165, 0.08, 0.075]),
      at([sx * 0.18, 0.0, 0.1])], 0.008 * S, 0.005 * S);
  }
  return { head: origin, frames: F };
}

/* The rotation of a frame, as Euler angles for the builder. */
function eulerOf(THREE, M) {
  const e = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().extractRotation(M), 'XYZ');
  return [e.x, e.y, e.z, 'XYZ'];
}

export { sculptedHead, hand as figureHand, GRIP };
