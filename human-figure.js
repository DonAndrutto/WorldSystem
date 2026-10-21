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
 * it, from the measured body and from the painters' canon, which agree: the
 * head from chin to crown a little over a seventh (0.136), the face from the
 * hairline to the chin a third of that again in three equal parts, the eyes
 * half way down the head; the shoulders a quarter across, sloping to the
 * neck; the arm from shoulder to wrist a third; the limbs as thick as a
 * living person's, the thigh a tenth of the stature across, the wrist a
 * thirtieth, the foot as long as the forearm.
 *
 * A pose is a set of joints — where the pelvis is
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
  shoulder: [0.091, 0.272, -0.012],    // the shoulder joints, inside the deltoids
  shoulderIn: [0.062, 0.268, -0.012],  // where the arm's tube begins, hidden in the shoulder
  neckBase: [0, 0.3, -0.012],
  neckTop: [0, 0.364, -0.004],
  hipJoint: [0.052, 0, 0.004],
  upperArm: 0.174, foreArm: 0.148,
  thigh: 0.245, shin: 0.243,
  head: 0.146         // one head unit: the head from chin to crown is 0.93 of it
};

/* The torso's sections from the fork to the root of the neck, in the
   pelvis's frame: height above the hip joints, half width, half depth, and
   how far forward the section's middle is. The shoulders belong to it, as a
   sculptor models them: the deltoids round over the joints and the trapezius
   slopes up from them to the neck, and the arms come out of that mass. */
const TORSO = [
  [-0.074, 0.036, 0.030, -0.014],
  [-0.062, 0.066, 0.052, -0.017],     // the fold of the buttocks
  [-0.038, 0.088, 0.063, -0.017],
  [-0.008, 0.096, 0.064, -0.013],     // the hips, at the great trochanters
  [0.030, 0.093, 0.060, -0.008],
  [0.066, 0.086, 0.056, -0.002],      // the crests of the hip bones
  [0.098, 0.079, 0.055, 0.001],       // the waist and the navel
  [0.128, 0.081, 0.057, 0.003],
  [0.158, 0.086, 0.062, 0.004],       // the lower ribs
  [0.188, 0.091, 0.066, 0.004],
  [0.213, 0.094, 0.068, 0.003],       // the breast
  [0.236, 0.098, 0.066, 0.000],       // the armpits
  [0.254, 0.106, 0.060, -0.004],      // the deltoids
  [0.268, 0.110, 0.056, -0.007],
  [0.282, 0.108, 0.052, -0.010],
  [0.292, 0.100, 0.049, -0.012],      // over the shoulder joint, rounding
  [0.300, 0.088, 0.046, -0.013],      // the trapezius, up to the neck
  [0.307, 0.073, 0.042, -0.014],
  [0.313, 0.057, 0.039, -0.014],
  [0.318, 0.045, 0.036, -0.014],
  [0.322, 0.036, 0.034, -0.013]       // the root of the neck
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

/* ── cloth ─────────────────────────────────────────────────────────────────
   Cloth hanging from an edge: its top follows the points `top`, and from
   each the cloth falls by `fall(t)` along `down`, gathered across its width
   into `pleats` folds that deepen towards the hem, `thick` through; `drift`
   carries the lower part where it is laid — over a knee, out across a seat.
   Closed, so it can be seen from either side. */
function hanging(THREE, top, { down = [0, -1, 0], fall, pleats = 5, depth = 0.01, thick = 0.003, steps = 16, rows = 5, colour, drift = null }) {
  const curve = new THREE.CatmullRomCurve3(top.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal');
  const P = new THREE.Vector3(), T = new THREE.Vector3();
  const dn = norm(down);
  return surface(THREE, steps, 2 * (rows + 1), (v, u, i, j) => {
    curve.getPointAt(v, P); curve.getTangentAt(v, T);
    const face = norm(cross([T.x, T.y, T.z], dn));
    const back = j > rows;
    const s = back ? (2 * rows + 1 - j) / rows : j / rows;    // 0 at the top edge, 1 at the hem
    const wave = Math.sin(v * pleats * TAU);
    let p = add([P.x, P.y, P.z], dn, fall(v) * s);
    if (drift) p = add(p, drift(v, s));
    p = add(p, face, depth * wave * (0.25 + 0.75 * s) + (back ? -thick : thick) / 2);
    return { p, c: colour(v, s, wave) };
  });
}

/* A flat band along points — a scarf, a sash — `wide` across and `thick`
   through, its face turned to `facing(t)`. */
function band(THREE, pts, { wide, thick, facing, steps = 14, colour }) {
  return sweep(THREE, pts, { steps, radial: 6, ref: facing,
    radius: (t, a) => {
      const w = typeof wide === 'function' ? wide(t) : wide;
      const ca = Math.cos(a) / thick, sa = Math.sin(a) / w;
      return 1 / Math.sqrt(ca * ca + sa * sa);
    },
    colour });
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
   In head units: 0.93 of a unit from the chin to the crown, the origin in
   the middle of the face at the level of the eyes, the face towards +z. The
   face is laid out as faces measure: the eyes half way down the head, and
   from the hairline to the brows, the brows to the base of the nose and the
   nose to the chin nearly equal parts, the forehead the least of them as it
   is in life (the painters' grid makes the three equal). One
   surface, its columns gathered towards the face and its rows towards the
   features, so that the nose and the lips have vertices to be raised from. */
const HEAD_W = 0.315;   // half the head's breadth, two thirds of its height
const EYE_X = 0.128;    // the eyes' centres from the middle of the face
function headShape(x0, y0, z0, o) {
  let x = x0, y = y0, z = z0;
  // the jaw holds its width to its angle and then narrows to the chin; the
  // skull falls in behind towards the neck
  x *= 1 - 0.06 * smooth(0.02, -0.26, y) - 0.13 * smooth(-0.26, -0.46, y) * smooth(-0.15, 0.2, z);
  // the cranium shorter behind than a sphere, falling in towards the neck
  if (z < 0) z *= 0.88 * (1 - 0.4 * smooth(-0.06, -0.42, y));
  // the face is flatter than the skull, and the lower face comes forward
  if (z > 0.17) z = 0.17 + (z - 0.17) * 0.78;
  z += 0.085 * smooth(0.06, -0.3, y) * smooth(0.0, 0.22, z0);
  z += 0.04 * g(y + 0.25, 0.08) * g(x, 0.12) * smooth(0.0, 0.22, z0);         // the mouth's muzzle
  // the temples in
  x -= Math.sign(x) * 0.02 * g(y - 0.19, 0.08) * g(z - 0.17, 0.12);
  const ax = Math.abs(x);
  const fw = smooth(0.14, 0.3, z);
  let dz = 0;
  dz += 0.026 * g(y - 0.112, 0.034) * g(x, 0.2) * fw;                          // brow ridge
  dz -= 0.03 * g(y - 0.036, 0.038) * g(ax - EYE_X, 0.05) * fw;                 // sockets
  const lid = o.eyes === 'open' ? 0.012 : 0.026;
  dz += lid * g(y - 0.028, 0.021) * g(ax - EYE_X, 0.046) * fw;                 // the lids
  dz += 0.022 * g(y + 0.06, 0.06) * g(ax - 0.172, 0.05) * fw;                  // cheekbones
  x += Math.sign(x) * 0.016 * g(y + 0.05, 0.06) * g(z - 0.18, 0.1);
  // the nose: the bridge rising from between the eyes to the tip
  const ridge = y > -0.125 ? 0.1 * Math.pow(smooth(0.075, -0.125, y), 1.2) : 0.1 * smooth(-0.19, -0.125, y);
  dz += ridge * g(x, 0.026 + 0.026 * smooth(0.02, -0.14, y)) * fw;
  dz += 0.012 * g(y + 0.12, 0.024) * g(x, 0.036) * fw;                         // the tip, rounded
  dz += 0.02 * g(y + 0.148, 0.02) * g(ax - 0.046, 0.02) * fw;                  // the wings
  // the mouth: the upper lip, the lower, the groove beneath, the chin
  dz -= 0.006 * g(y + 0.185, 0.014) * g(x, 0.016) * fw;                        // philtrum
  dz += 0.016 * g(y + 0.218, 0.02) * g(x, 0.078) * fw;
  dz += 0.016 * g(y + 0.264, 0.02) * g(x, 0.064) * fw;
  if (o.mouth === 'scream') dz -= 0.05 * g(y + 0.245, 0.03) * g(x, 0.06) * fw;
  dz -= 0.008 * g(y + 0.305, 0.014) * g(x, 0.07) * fw;
  dz += 0.038 * g(y + 0.37, 0.05) * g(x, 0.1) * fw;
  // the cheeks fall in a little below the bone, and fill again at the jaw
  dz -= 0.008 * g(y + 0.17, 0.05) * g(ax - 0.18, 0.05) * fw;
  if (o.gaunt) {
    // starved: the cheeks and the temples hollow, the eyes sunk deep
    dz -= 0.03 * g(y + 0.15, 0.06) * g(ax - 0.17, 0.06) * fw + 0.02 * g(y - 0.036, 0.04) * g(ax - EYE_X, 0.05) * fw;
    x -= Math.sign(x) * (0.03 * g(y + 0.14, 0.07) + 0.02 * g(y - 0.18, 0.08)) * smooth(0.05, 0.2, z);
  }
  z += dz;
  return [x, y, z];
}

/* Where the hair begins, in head units, at each angle round the head from
   the front: straight across the forehead a little less than a third of
   the face above the brows, round the corners of the temples, down in front of the ears and
   over them, and low at the nape. Every head of hair, and the shadow of the
   hair on a shaved scalp, keeps to it. */
const HAIRLINE = [[0, 0.312], [0.45, 0.302], [0.8, 0.262], [1.08, 0.18], [1.3, 0.1], [1.52, 0.11],
  [1.85, 0.12], [2.1, 0.0], [2.45, -0.16], [2.85, -0.28], [PI, -0.32]];
export const hairlineAt = (phi) => tableAt(HAIRLINE, Math.abs(Math.atan2(Math.sin(phi), Math.cos(phi))))[0];

function headColour(x, y, z, o, P) {
  const skin = P(o.skin);
  let c = skin;
  if (o.glass) return c;
  const ax = Math.abs(x);
  const face = smooth(0.16, 0.3, z);
  // warmth in the cheeks and the lips
  c = P.mix(c, P('rose'), 0.09 * g(y + 0.07, 0.07) * g(ax - 0.175, 0.06) * face);
  c = P.mix(c, P('lip'), 0.35 * g(y + 0.24, 0.035) * g(x, 0.07) * face);
  // shade where the light does not reach: the sockets under the brows, the
  // creases beside the nose, the groove under the lower lip
  const dark = 0.15 * g(y - 0.055, 0.03) * g(ax - 0.095, 0.045) + 0.12 * g(y + 0.155, 0.02) * g(ax - 0.06, 0.022)
    + 0.1 * g(y + 0.3, 0.017) * g(x, 0.06);
  c = P.k(c, 1 - dark * face);
  // the scalp of a shaved head, blue-grey with the hair beneath it
  if (o.scalp) {
    const line = hairlineAt(Math.atan2(x, z + 0.04));
    c = P.mix(c, P.mix(skin, P('slate'), 0.5), smooth(line - 0.02, line + 0.07, y) * 0.38);
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
/* The skull is no egg: above the eyes it keeps its breadth and its length
   up to the dome of the crown, widest over the ears. */
const DOME = 2.6;
function headPoint(n, o) {
  const up = Math.max(0, n[1]);
  const round = Math.sqrt(Math.max(1e-6, 1 - up * up));
  const f = Math.min(2, Math.pow(Math.max(0, 1 - Math.pow(up, DOME)), 1 / DOME) / round);
  const fz = 1 + (f - 1) * 0.7;
  return headShape(n[0] * HEAD_W * f, 0.03 + n[1] * 0.465, -0.04 + n[2] * 0.42 * fz, o);
}

/* A cap of hair over the head: the head's own surface lifted off it by
   `thick` above the hairline, its edge sunk into the skin on the line itself,
   so the hair begins cleanly where a hairline does. `shape(s, phi)` lifts it
   further — a crown of curls, a swell towards the topknot. Returns where the
   cap's surface is at (s, phi), s running from the hairline at 0 to the
   crown at 1, and which way it faces there: where curls are set, or a crown
   is tied. */
const CALM = { eyes: 'down', mouth: 'calm' };
const sphereDir = (theta, phi) => [Math.sin(theta) * Math.sin(phi), Math.cos(theta), Math.sin(theta) * Math.cos(phi)];
const scalpNormal = (p) => norm([p[0] / (HEAD_W * HEAD_W), (p[1] - 0.03) / (0.465 * 0.465), (p[2] + 0.04) / (0.42 * 0.42)]);
function hairTheta(phi) {
  const want = hairlineAt(phi);
  let lo = 0.02, hi = PI - 0.1;
  for (let i = 0; i < 22; i += 1) {
    const m = (lo + hi) / 2;
    if (headPoint(sphereDir(m, phi), CALM)[1] > want) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}
export function hairCap(b, key, { thick = 0.03, rows = 9, cols = 34, colour = null, shape = null } = {}) {
  const P = painter(b);
  const at = (s, phi, theta0 = hairTheta(phi)) => {
    const p = headPoint(sphereDir(lerp(theta0, 0.04, s), phi), CALM);
    const n = scalpNormal(p);
    let out = s <= 0 ? -0.006 : thick * (0.62 + 0.38 * smooth(0, 0.4, s));
    if (shape && s > 0) out += shape(s, phi);
    return { p: add(p, n, out), n };
  };
  const thetas = b.kit.once('hair-theta:' + cols, () => Array.from({ length: cols }, (_, j) => hairTheta(j / cols * TAU)));
  const base = P(key);
  b.put(surface(b.THREE, rows, cols, (v, u, i, j) => {
    const { p } = at(v, u * TAU, thetas[j]);
    return { p, c: colour ? colour(v, u * TAU) : P.k(base, 0.9 + 0.1 * smooth(0, 0.5, v)) };
  }), key);
  return at;
}

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
  const rows = fine ? 40 : tiny ? 16 : 22, cols = fine ? 44 : tiny ? 18 : 24;
  const key = ['head', o.skin, o.eyes, o.mouth, o.scalp ? 1 : 0, o.gaunt ? 1 : 0, rows].join(':');
  const glass = !!b.paint(o.skin).glass;
  const geom = b.kit.once(key, () => surface(THREE, rows, cols, (v, u) => {
    const p = headPoint(headParams(v, u), o);
    return { p, c: headColour(p[0], p[1], p[2], { ...o, glass }, P) };
  }));
  b.put(geom, o.skin);
  // ears: the shell turned a little forward, the rim of the helix round it,
  // from the line of the brows to the base of the nose; long lobes for the
  // Buddhas and the gods
  for (const sx of [-1, 1]) {
    // leaning back a little, as ears do
    b.at([sx * 0.3, -0.03, -0.06], [-0.2, sx * 0.35, 0], 1, () => {
      b.ell(o.skin, [sx * 0.02, 0.012, -0.004], [0.028, 0.124, 0.07]);
      b.ell(o.skin, [sx * 0.014, -0.062, 0.044], [0.01, 0.022, 0.014]);   // the tragus
      // the lobe, soft and flat; a Buddha's drawn long by the weight of the
      // earrings he put off, and pierced
      if (o.long) {
        b.ell(o.skin, [sx * 0.022, -0.14, 0.002], [0.022, 0.13, 0.046]);
        if (!glass) b.ell(o.skin + '~', [sx * 0.04, -0.15, 0.008], [0.005, 0.048, 0.011]);
      } else b.ell(o.skin, [sx * 0.018, -0.088, 0.0], [0.017, 0.044, 0.034]);
    });
  }
  if (glass) return;
  const map = b.kit.once('facemap:' + o.eyes + ':' + o.mouth + ':' + (o.gaunt ? 1 : 0), () => faceMap(o));
  map.coarse = tiny;
  const brow = P(o.browKey || 'brow'), lash = P('lash'), lip = P('lip');
  const arc = (x0, x1, f, n = 7) => Array.from({ length: n }, (_, i) => { const x = lerp(x0, x1, i / (n - 1)); return [x, f(x, i / (n - 1))]; });
  for (const sx of [-1, 1]) {
    // the brows: a long arch, full at the inner end, fine at the outer
    onFace(b, map, o.skin, arc(sx * 0.046, sx * 0.232, (x, t) => 0.106 + 0.017 * Math.sin(PI * Math.min(1, t * 1.2)) - 0.022 * t * t),
      (t) => (fine ? 0.008 : 0.013) * (1 - 0.45 * t), 0.004, P.mix(brow, P(o.skin), 0.25));
    if (o.eyes === 'open') {
      b.ell('eyewhite', add([sx * EYE_X, 0.032, map.z(sx * EYE_X, 0.032)], [0, 0, -0.024]), [0.05, 0.028, 0.033]);
      b.ell(o.iris || 'earth', [sx * (EYE_X - 0.002), 0.03, map.z(sx * EYE_X, 0.03) + 0.004], [0.02, 0.02, 0.008]);
      b.ell('lash', [sx * (EYE_X - 0.002), 0.03, map.z(sx * EYE_X, 0.03) + 0.008], [0.01, 0.01, 0.005]);
      onFace(b, map, o.skin, arc(sx * 0.078, sx * 0.182, (x, t) => 0.05 + 0.013 * Math.sin(PI * t)), 0.0055, 0.006, lash);
    } else {
      // lowered eyes: the line of the lashes under a full lid, long and
      // curving down like a petal, its outer end a little raised
      onFace(b, map, o.skin, arc(sx * 0.072, sx * 0.192, (x, t) => 0.026 - 0.013 * Math.sin(PI * t) + 0.011 * t), (t) => 0.0042 * (0.6 + 0.4 * Math.sin(PI * t)), 0.0035, lash);
    }
    // the nostrils
    b.ell('lash', [sx * 0.033, -0.155, map.z(sx * 0.033, -0.155) - 0.006], [0.012, 0.007, 0.01], [0.3, 0, sx * 0.3]);
  }
  // the lips: the upper with its bow, the fuller lower lip
  if (o.mouth === 'pinhole') {
    // a mouth no bigger than the eye of a needle, the lips drawn in round it
    b.ell('lash', [0, -0.24, map.z(0, -0.24) - 0.002], [0.012, 0.01, 0.01]);
    onFace(b, map, o.skin, Array.from({ length: 9 }, (_, i) => { const a = i / 8 * TAU; return [Math.cos(a) * 0.022, -0.24 + Math.sin(a) * 0.018]; }), 0.006, 0.006, P.mix(lip, P(o.skin), 0.5));
  } else if (o.mouth === 'scream') {
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
  // heel, arch, the ball of the foot, the root of the toes: from the back of
  // the heel to the tip of the great toe the foot is 0.152 of the stature
  const SEC = [[-0.036, 0.031, 0.005, 0.011], [-0.029, 0.029, 0.016, 0.018], [-0.006, 0.022, 0.022, 0.02], [0.026, 0.028, 0.019, 0.023],
    [0.06, 0.034, 0.012, 0.027], [0.084, 0.037, 0.008, 0.0275], [0.094, 0.038, 0.005, 0.024]];
  b.put(surface(THREE, fine ? 8 : tiny ? 4 : 5, fine ? 10 : tiny ? 5 : 6, (t, u) => {
    const [s, drop, h, w] = tableAt(SEC.map((r, i) => [i / (SEC.length - 1), ...r]), t);
    const a = u * TAU, ca = Math.cos(a), sa = Math.sin(a);
    // the sole flat, the instep arched; inner side higher than the outer
    const flat = sa > 0 ? 0.55 : 1;
    return { p: at(s * S, ca * w * S * (1 - 0.15 * Math.max(0, sa)), (drop + sa * h * flat) * S), c: skin };
  }), o.skin);
  // the toes, the great toe largest, in a curve
  if (!tiny) for (let i = 0; i < 5; i += 1) {
    const u = (0.02 - i * 0.01) * S * o.inner;
    const len = [0.02, 0.016, 0.015, 0.013, 0.011][i] * S;
    const base = at((0.097 - i * i * 0.0012 - i * 0.002) * S, u, 0.036 * S);
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
  // the vajra posture: the left foot drawn up on the right thigh, the right
  // laid over it on the left thigh, both close in by the groin with the
  // soles turned up, the knees spread on the seat
  vajra: [
    { ankle: [0.035, 0.062, 0.125], pole: [-0.9, -0.35, 0.75], foot: [1, 0.12, -0.1], sole: [0.05, 1, 0.3] },
    { ankle: [-0.05, 0.028, 0.105], pole: [0.45, -0.15, 0.8], foot: [-1, 0.14, -0.12], sole: [-0.05, 1, 0.3] }],
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
  // walking stooped, the head craned forward and the hands out before it,
  // looking for food and drink
  search: () => ({ kind: 'search', pelvis: { p: [0, BODY.hip - 0.025, 0], r: [0.1, 0, 0] }, chest: [0.32, 0, 0], head: [-0.42, 0.1, 0],
    arms: [
      { wrist: [-0.1, 0.72, 0.3], pole: [-1, -0.4, -0.3], dir: [0.1, 0.2, 1], palm: [0.2, -1, 0.1], curl: 'claw' },
      { wrist: [0.12, 0.66, 0.26], pole: [1, -0.4, -0.3], dir: [-0.1, 0.1, 1], palm: [-0.2, -1, 0.1], curl: 'claw' }],
    legs: [
      { ankle: [-0.07, 0.045, 0.12], pole: [0, 0, 1], foot: [-0.08, 0, 1], sole: [0, -1, 0] },
      { ankle: [0.07, 0.07, -0.16], pole: [0, -0.2, 1], foot: [0.1, -0.4, 1], sole: [0, -1, -0.4] }] }),
  // kneeling, bent forward, both arms stretched out to what it cannot have
  crave: () => ({ kind: 'crave', pelvis: { p: [0, 0.27, -0.05], r: [0.35, 0, 0] }, chest: [0.4, 0, 0], head: [-0.5, 0, 0],
    arms: [
      { wrist: [-0.08, 0.22, 0.38], pole: [-1, 0.2, 0], dir: [0, -0.4, 1], palm: [0, -1, 0], curl: 'claw' },
      { wrist: [0.09, 0.24, 0.36], pole: [1, 0.2, 0], dir: [0, -0.4, 1], palm: [0, -1, 0], curl: 'claw' }],
    legs: LEGS.kneel }),
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
function frames(THREE, pose, S, neckLen = 0) {
  const E = (r) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(r[0], r[1], r[2], 'YXZ'));
  const MP = new THREE.Matrix4().makeTranslation(pose.pelvis.p[0] * S, pose.pelvis.p[1] * S, pose.pelvis.p[2] * S).multiply(E(pose.pelvis.r));
  const pivot = BODY.pivot * S;
  const MC = MP.clone().multiply(new THREE.Matrix4().makeTranslation(0, pivot, 0)).multiply(E(pose.chest)).multiply(new THREE.Matrix4().makeTranslation(0, -pivot, 0));
  const nt = BODY.neckTop.map((v, i) => (v + (i === 1 ? neckLen : 0)) * S);
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
  const thin = o.thin === true ? 1 : o.thin || 0;
  const detail = o.detail ?? b.detail ?? (b.scale() * S > 0.38 ? 1 : 0);
  const fine = detail > 0.5, tiny = detail < -0.5;
  const F = frames(THREE, pose, S, o.neckLen || 0);
  const belly = o.belly || 0;
  const fold = (key) => (b.paint(key).glass || b.paint(key).e ? key : key + '~');
  const skin = P(skinKey), robe = P(robeKey), lower = P(lowerKey);
  const W = (o.build || 1) * (1 - 0.1 * thin);
  const seated = pose.kind === 'seated';

  /* The torso: its sections, the anatomy on them, and the garment painted on
     it and standing a little proud of the skin. */
  // the robe's upper edge, from the left of the neck down across the breast,
  // over the left breast and under the right, to the right flank below the
  // armpit
  const lineY = (x) => (0.33 + (x / S - 0.02) * 1.6) * S;
  const robeOn = (x, y) => {
    if (dress === 'coat') return true;
    if (dress === 'robe') return y < lineY(x);
    if (dress === 'loin') return y < -0.035 * S;
    return y < 0.02 * S;                                       // bare: the lower garment's band
  };
  const torsoAt = (y, a) => {
    const [hw0, hd0, zc] = tableAt(TORSO, y / S);
    const swell = belly * g(y / S - 0.08, 0.062);                  // the belly of a hungry ghost, like a mountain
    const hw = hw0 * S * W * (y > 0.14 * S ? 1 : 1 + 0.04 * (o.wide ? o.wide - 1 : 0)) * (1 + 0.62 * swell), hd = hd0 * S * (1 - 0.06 * thin);
    const ca = Math.cos(a), sa = Math.sin(a);
    // boxed at the chest and the hips, rounding towards the shoulders
    const e = 2 / lerp(2.5, 2.05, smooth(0.2 * S, 0.28 * S, y));
    let x = hw * Math.sign(ca) * Math.pow(Math.abs(ca), e);
    let z = zc * S + hd * Math.sign(sa) * Math.pow(Math.abs(sa), e);
    const fr = Math.pow(Math.max(0, sa), 1.4), bk = Math.pow(Math.max(0, -sa), 1.4);
    const yy = y / S, xx = x / S, ax = Math.abs(xx);
    let dz = 0;
    // the breast, its lower edge the firmer; the line of the breastbone; the
    // belly and the navel; the ribs of an ascetic
    dz += (0.011 - 0.006 * thin) * (g(xx - 0.05, 0.034) + g(xx + 0.05, 0.034)) * g(yy - 0.207, yy < 0.207 ? 0.018 : 0.03) * fr;
    dz -= 0.003 * g(xx, 0.008) * g(yy - 0.2, 0.05) * fr;
    dz += (thin && !belly ? -0.014 : 0.004) * g(xx, 0.055) * g(yy - 0.1, 0.045) * fr;
    dz += 0.115 * swell * Math.pow(Math.max(0, Math.cos(xx / (hw / S) * 1.2)), 0.6) * fr;
    dz -= 0.004 * g(xx, 0.006) * g(yy - 0.078, 0.006) * fr;
    if (thin) dz += 0.003 * Math.cos(yy * TAU / 0.024) * smooth(0.12, 0.15, yy) * (1 - smooth(0.24, 0.27, yy)) * (fr + 0.4 * (1 - fr));
    // the collarbones from the notch at the foot of the throat out to the
    // shoulders, rising a little at either end
    const clav = 0.298 - 0.005 * Math.sin(PI * clamp01((ax - 0.016) / 0.084));
    dz += 0.0035 * g(yy - clav, 0.005) * smooth(0.012, 0.026, ax) * (1 - smooth(0.085, 0.102, ax)) * fr;
    dz -= 0.004 * g(xx, 0.011) * g(yy - 0.31, 0.008) * fr;
    // the buttocks, the shoulder blades, the groove of the spine
    dz += 0.02 * (g(xx - 0.048, 0.04) + g(xx + 0.048, 0.04)) * g(yy + 0.022, 0.034) * bk;
    dz += 0.009 * (g(xx - 0.06, 0.03) + g(xx + 0.06, 0.03)) * g(yy - 0.235, 0.04) * bk;
    dz -= 0.004 * g(xx, 0.008) * smooth(0.04, 0.1, yy) * bk;
    z += dz * S * Math.sign(sa || 1);
    // the root of the neck lies lower at the throat than at the nape, where
    // the trapezius climbs the back of the neck
    const dy = -(sa > 0 ? 0.009 : 0.016) * S * sa * smooth(0.27, 0.322, yy);
    // where the light reaches least: under the breast, in the navel, the
    // armpits, the hollows above the collarbones
    const shade = 0.1 * (g(xx - 0.05, 0.03) + g(xx + 0.05, 0.03)) * g(yy - 0.183, 0.01) * fr
      + 0.25 * g(xx, 0.006) * g(yy - 0.078, 0.006) * fr + 0.1 * g(ax - 0.094, 0.012) * g(yy - 0.236, 0.018)
      + 0.07 * g(yy - 0.305, 0.006) * g(ax - 0.05, 0.022) * fr;
    return [x, y + dy, z, sa, xx, yy, shade];
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
  const rows = fine ? 27 : tiny ? 10 : 14, cols = fine ? 32 : tiny ? 14 : 18;
  const yLo = TORSO[0][0] * S, yHi = TORSO[TORSO.length - 1][0] * S;
  /* Where the garment ends at each angle round the torso: the robe's edge,
     the band of the lower garment, the top of the loincloth. The rows run up
     to it and on from it, and the row on the line is drawn twice, once in
     the cloth and once in the skin, so the garment ends in a clean edge its
     own thickness proud of the body rather than in steps across the grid. */
  const split = glass || dress === 'coat' ? null : dress === 'robe' ? Math.round(rows * 0.62) : dress === 'loin' ? 2 : Math.max(2, Math.round(rows * 0.3));
  const edgeAt = (a) => {
    if (dress === 'loin') return -0.035 * S;
    if (dress !== 'robe') return 0.02 * S;
    // the height where the section's own point meets the line
    const over = (y) => lineY(torsoAt(y, a)[0]) - y;
    if (over(yHi) > 0) return yHi;
    if (over(yLo) < 0) return yLo;
    let lo = yLo, hi = yHi;
    for (let it = 0; it < 22; it += 1) { const m = (lo + hi) / 2; if (over(m) > 0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const edges = split === null ? null : Array.from({ length: cols }, (_, j) => edgeAt(j / cols * TAU));
  put(b, surface(THREE, rows, cols, (v, u, i, j) => {
    const a = u * TAU;
    let y = lerp(yLo, yHi, v), on = dress === 'coat' && !glass;
    if (edges) {
      on = i <= split;
      y = on ? lerp(yLo, edges[j], i / split) : lerp(edges[j], yHi, (i - split - 1) / (rows - split - 1));
    }
    const [x, yy0, z, , , , shade] = torsoAt(y, a);
    let out = on ? 0.0045 * S : 0;
    const lowerHere = y < 0.02 * S && dress !== 'coat';
    let c = on ? P.k(lowerHere ? lower : robe, 1 - shade * 0.5) : glass ? skin : P.k(skin, 1 - shade);
    const k = on ? (lowerHere ? lowerKey : robeKey) : skinKey;
    if (on && dress === 'robe' && y > 0.02 * S) {
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
        const x = lerp(0.022, -0.08, i / 8) * S;
        pts.push(onTorso(x, Math.min(lineY(x), 0.32 * S), back, 0.0025 * S));
      }
      b.put(sweep(THREE, pts, { steps: fine ? 14 : 8, radial: 6, ref: () => [0, 1, 0],
        radius: () => 0.0062 * S, colour: () => P.k(robe, 0.92) }), robeKey);
      if (o.border) b.put(sweep(THREE, pts.map((p, i) => add(p, F.dirOf(F.MC, [0, 0, back ? -1 : 1]), 0.003 * S * (back ? 1 : 1))),
        { steps: fine ? 14 : 8, radial: 5, ref: () => [0, 1, 0], radius: () => 0.003 * S, colour: () => P(o.border) }), o.border);
    }
  }
  // the neck, from the collar into the head, rising out of the slope of the
  // shoulders; a Buddha's has the three folds of a conch
  const neckBase = F.apply(F.MC, BODY.neckBase.map((v) => v * S));
  const neckTop = F.apply(F.MH, [0, 0.01 * S, 0.004 * S]);
  const throat = F.apply(F.MH, [0, -0.012 * S, 0.005 * S]);
  const conch = o.neckFolds && !glass && !tiny ? (t) => g(t - 0.52, 0.018) + g(t - 0.63, 0.018) + g(t - 0.74, 0.018) : () => 0;
  b.put(sweep(THREE, [F.apply(F.MC, [0, 0.27 * S, -0.012 * S]), neckBase, throat, neckTop], {
    steps: fine ? (o.neckFolds ? 18 : 10) : tiny ? 4 : 6, radial: fine ? 14 : tiny ? 6 : 8, ref: () => F.dirOf(F.MC, [0, 0, 1]),
    radius: (t, a) => (0.0352 - 0.005 * thin - 0.0012 * conch(t)) * S * (1 + 0.04 * Math.pow(Math.cos(a), 2)) * (1 - 0.55 * (o.neckThin || 0) * smooth(0.25, 0.5, t)),
    colour: (t, a) => (glass ? skin : P.k(skin, 1 - 0.14 * conch(t) - 0.1 * smooth(0.6, 1, t) * Math.max(0, Math.cos(a)))) }), skinKey);

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
      // a living arm's girths: the deltoid 0.068 of the stature across, the
      // upper arm 0.053, the elbow 0.047, the forearm full below the elbow,
      // the wrist 0.034 across and two thirds of that from palm to back
      radius: (t, a, dd) => {
        const d = dd - into;
        const ca = Math.cos(a);
        let r;
        if (d < 0) r = lerp(0.022, 0.03, smooth(-into, 0, d));
        else if (d < ua) {
          const u = d / ua;
          r = lerp(0.027, 0.0235, smooth(0.3, 1, u)) + 0.0055 * g(u - 0.12, 0.13);  // the deltoid's belly
          r += 0.003 * g(u - 0.55, 0.17) * Math.max(0, ca);               // biceps
          r += 0.0025 * g(u - 0.4, 0.2) * Math.max(0, -ca);              // triceps
        } else {
          const u = (d - ua) / (len - ua);
          r = lerp(0.023, 0.0168, smooth(0.15, 1, u)) + 0.0028 * g(u - 0.2, 0.15);
          r *= 1 - 0.3 * smooth(0.6, 1, u) * Math.abs(ca);               // flat at the wrist, from palm to back
        }
        r *= S * k;
        // a sleeve, or the robe over the arm, lies loose on it in folds
        if (sleeve && !glass) r = (Math.max(r + 0.0035 * S, (0.026 + 0.004 * smooth(ua, len, d)) * S) + 0.0012 * S * Math.sin(dd / S * 70 + a * 2)) * (d > len - 0.003 * S ? 0.8 : 1);
        return r;
      },
      colour: (t, a, dd) => (sleeve ? P.k(robe, 0.93 + 0.07 * Math.sin(dd / S * 90 + a * 2))
        : glass ? skin : P.k(skin, 1 - 0.1 * g((dd - into - ua) / S, 0.012) * Math.max(0, Math.cos(a)))) }), sleeve && !glass ? robeKey : skinKey);
    const fore = add(wrist, elbow, -1);
    if (sleeve && !glass && Math.abs(norm(fore)[1]) < 0.75) {
      // the robe falls from the forearm in a curtain of folds, to the lap
      // where the hand rests in it, towards the knee where it is held out
      const top = [0.12, 0.4, 0.68, 0.94].map((t) => add(add(elbow, fore, t), [0, -(0.024 + 0.006 * t) * S, -0.004 * S]));
      const room = Math.min(...top.map((p) => p[1])) - 0.012 * S;
      b.put(hanging(THREE, top, { fall: (t) => Math.min(room, (seated ? lerp(0.04, 0.075, t) : lerp(0.08, 0.16, t)) * S),
        pleats: 3.5, depth: 0.004 * S, thick: 0.003 * S, steps: fine ? 12 : 6, rows: fine ? 4 : 2,
        drift: (t, s) => [0, 0, 0.012 * S * s * s],
        colour: (t, s, w) => P.k(robe, 0.84 + 0.13 * w - 0.06 * s) }), robeKey);
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
      ring(add(wrist, norm(fore), -0.014 * S), fore, 0.019 * S, 0.22);
      ring(add(sh, add(elbow, sh, -1), 0.38), add(elbow, sh, -1), 0.026 * S, 0.2);
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
        // a living leg's girths: the thigh a tenth of the stature across at
        // the top, the knee 0.068, the calf full behind the flat of the
        // shin, the ankle 0.04
        radius: (t, a, dd) => {
          const d = dd - into, ca = Math.cos(a);
          let r;
          if (d < 0) r = 0.05;
          else if (d < th) {
            const u = d / th;
            r = lerp(0.052, 0.034, smooth(0.0, 0.95, u)) + 0.0035 * g(u - 0.5, 0.22) * Math.max(0, ca);
          } else {
            const u = (d - th) / (len - th);
            r = lerp(0.031, 0.0195, smooth(0.0, 0.9, u)) + 0.0075 * g(u - 0.3, 0.17) * Math.max(0, -ca) - 0.0015 * g(u - 0.04, 0.05);
          }
          r *= S * (1 - 0.28 * thin);
          if (covered) r += (0.008 + 0.0025 * Math.sin(d / S * 70 + a * 3)) * S * (d > len - 0.01 * S ? 0.4 : 1);
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
    // it begins inside the waist, under the upper robe, and opens below it
    const top = 0.06 * S, hem = (0.05 - BODY.hip) * S;
    const w0 = 0.088 * S * W * (o.wide || 1), d0 = 0.056 * S;
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

  /* Seated, the robe fills the lap, and its hem falls from the crossed shins
     in a fan of pleats spread on the seat before them, as the founders cast
     it. */
  if (seated && legsCovered) {
    b.ell(lowerKey, F.apply(F.MP, [0, -0.012 * S, 0.1 * S]), [0.11 * S, 0.032 * S, 0.075 * S]);
    if (!tiny) {
      const top = [[-0.078, 0.06, 0.183], [-0.03, 0.07, 0.176], [0.03, 0.07, 0.176], [0.078, 0.06, 0.183]].map((p) => p.map((v) => v * S));
      b.put(hanging(THREE, top, { fall: (t) => (0.058 - 0.008 * Math.abs(t - 0.5)) * S, pleats: 4.5, depth: 0.005 * S, thick: 0.003 * S,
        steps: fine ? 16 : 8, rows: fine ? 4 : 2, drift: (t, s) => [(t - 0.5) * 0.04 * S * s, 0, 0.04 * S * s * s],
        colour: (t, s, w) => P.k(lower, 0.86 + 0.12 * w - 0.05 * s) }), lowerKey);
    }
  }
  // the lower garment's band at the waist
  if (dress === 'bare' && !glass) {
    const across = F.dirOf(F.MP, [1, 0, 0]), up = F.dirOf(F.MP, [0, 1, 0]);
    b.orient(b.kit.torus(0.09), o.sash || fold(lowerKey), F.apply(F.MP, [0, 0.022 * S, -0.01 * S]), across, up, [0.098 * S * W, 0.066 * S, 0.066 * S]);
  }

  /* The head, in its own units. */
  const H = BODY.head * S;
  const origin = F.apply(F.MH, [0, 0.3 * H, 0.1 * H]);
  b.at(origin, F.euler(F.MH), H, () => {
    sculptedHead(b, { skin: skinKey, eyes: o.eyes || 'down', mouth: o.mouth || 'calm', long: !!o.longEars, gaunt: !!o.gaunt,
      scalp: o.scalp && !glass, detail, browKey: o.browKey, iris: o.iris });
    o.hair?.(b, detail);
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
    // a band of silk, its face turned out from the body
    const at = (p) => F.apply(F.MC, p.map((v) => v * S));
    const centre = F.apply(F.MC, [0, 0.2 * S, -0.012 * S]);
    const outward = (pts) => (t) => {
      const p = pts[Math.min(pts.length - 1, Math.round(t * (pts.length - 1)))];
      return norm([p[0] - centre[0], 0.15 * (p[1] - centre[1]), p[2] - centre[2]]);
    };
    const silk = (t) => P.k(P(o.sash), 0.92 + 0.08 * Math.sin(t * 19));
    const over = [onTorso(-0.1 * S, 0.274 * S, false, 0.006 * S), onTorso(-0.092 * S, 0.292 * S, true, 0.008 * S), onTorso(-0.04 * S, 0.31 * S, true, 0.01 * S),
      onTorso(0.04 * S, 0.31 * S, true, 0.01 * S), onTorso(0.092 * S, 0.292 * S, true, 0.008 * S), onTorso(0.1 * S, 0.274 * S, false, 0.006 * S)];
    b.put(band(THREE, over, { wide: 0.02 * S, thick: 0.0016 * S, facing: outward(over), steps: fine ? 16 : 8, colour: silk }), o.sash);
    // the ends fall past the arms and are caught out to either side
    for (const sx of [-1, 1]) {
      const fall = [onTorso(sx * 0.1 * S, 0.274 * S, false, 0.006 * S), at([sx * 0.15, 0.19, 0.03]), at([sx * 0.17, 0.1, 0.06]),
        ...(seated ? [at([sx * 0.2, -0.02, 0.1]), at([sx * 0.27, -0.06, 0.11])] : [at([sx * 0.19, -0.12, 0.08]), at([sx * 0.25, -0.3, 0.07])])];
      b.put(band(THREE, fall, { wide: (t) => (0.018 + 0.006 * t) * S, thick: 0.0016 * S, facing: outward(fall), steps: fine ? 14 : 7, colour: silk }), o.sash);
    }
  }
  return { head: origin, frames: F };
}

/* The rotation of a frame, as Euler angles for the builder. */
function eulerOf(THREE, M) {
  const e = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().extractRotation(M), 'XYZ');
  return [e.x, e.y, e.z, 'XYZ'];
}

export { sculptedHead, hand as figureHand, GRIP, hanging as clothFall, band as clothBand };
