/* Continent sculptures use the same pigments and baked material batches as
   the summit architecture. Ornament and botanical forms are illustrative;
   their enlarged dimensions serve the drawing, not textual measurement. */
export function createContinentModels(THREE, { materials: M }) {
/* ── Modelling the four treasures ──────────────────────────────────────
   The treasures are the one place in the drawing where a shape has to be
   recognised rather than measured: a horn that curves, a stalk that bends
   under a ripe head, a limb that forks. Four helpers do that work — a
   round tube swept along a curve, a run of elliptical sections along an
   axis, a flat leaf blade, and a bin that folds the eighty-odd pieces of
   a treasure back down to one mesh for each material it is made of. */
const geo = (pos, idx) => {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};
/* the same geometry with hard edges — every triangle its own normal */
const facet = (g) => {
  const f = g.toNonIndexed();
  f.computeVertexNormals();
  g.dispose();
  return f;
};
const curve3 = (pts) => new THREE.CatmullRomCurve3(
  pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, 'catmullrom', 0.5);

/* A round tube swept along a curve, the radius given as a function of the
   way along it. A round section is free of the arbitrary roll a swept
   frame carries, so branches, roots, horns, legs, stalks and awns are all
   made this way. */
function sweep(path, radiusAt, steps, radial) {
  const fr = path.computeFrenetFrames(steps, false);
  const pos = [], idx = [], P = new THREE.Vector3();
  for (let i = 0; i <= steps; i++) {
    path.getPointAt(i / steps, P);
    const N = fr.normals[i], B = fr.binormals[i], r = radiusAt(i / steps);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a) * r, s = Math.sin(a) * r;
      pos.push(P.x + N.x * c + B.x * s, P.y + N.y * c + B.y * s, P.z + N.z * c + B.z * s);
    }
  }
  for (let i = 0; i < steps; i++) {
    for (let j = 0; j < radial; j++) {
      const k = (j + 1) % radial;
      idx.push(i * radial + j, i * radial + k, (i + 1) * radial + j,
               i * radial + k, (i + 1) * radial + k, (i + 1) * radial + j);
    }
  }
  /* close both ends — an open tube shows as a hole wherever a leg or a
     branch is not quite buried in what it grows out of */
  const c0 = (steps + 1) * radial, c1 = c0 + 1, last = steps * radial;
  path.getPointAt(0, P); pos.push(P.x, P.y, P.z);
  path.getPointAt(1, P); pos.push(P.x, P.y, P.z);
  for (let j = 0; j < radial; j++) {
    const k = (j + 1) % radial;
    idx.push(c0, k, j, c1, last + j, last + k);
  }
  return geo(pos, idx);
}

/* A closed body built from elliptical sections along +x, each given as
   [x, centre height, half height, half width]. The cow's barrel, her neck
   and head, and every leaf blade are runs of these. */
function hull(sections, radial) {
  const pos = [], idx = [], n = sections.length;
  sections.forEach(([x, cy, hh, hw]) => {
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      pos.push(x, cy + Math.sin(a) * hh, Math.cos(a) * hw);
    }
  });
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const k = (j + 1) % radial;
      idx.push(i * radial + j, (i + 1) * radial + j, i * radial + k,
               i * radial + k, (i + 1) * radial + j, (i + 1) * radial + k);
    }
  }
  const c0 = n * radial, c1 = c0 + 1;
  pos.push(sections[0][0], sections[0][1], 0,
           sections[n - 1][0], sections[n - 1][1], 0);
  for (let j = 0; j < radial; j++) {
    const k = (j + 1) % radial;
    idx.push(c0, j, k, c1, (n - 1) * radial + k, (n - 1) * radial + j);
  }
  return geo(pos, idx);
}

/* A leaf blade: a long flat section running out along +x, widening and
   then tapering, drooping as it goes. */
const blade = (len, wide, thick, droop) => hull(
  Array.from({ length: 7 }, (v, i) => {
    const t = i / 6;
    return [t * len, -droop * t * t, thick * (1 - t * 0.55) + 0.00006,
            wide * Math.sin(Math.pow(t, 0.62) * Math.PI) + 0.00006];
  }), 8);

/* the matrix that puts a part at a place, turned and scaled */
const _pen = new THREE.Object3D();
function at(p, r, s) {
  _pen.position.set(p[0], p[1], p[2]);
  _pen.rotation.set(r ? r[0] : 0, r ? r[1] : 0, r ? r[2] : 0);
  if (s === undefined || s === null) _pen.scale.set(1, 1, 1);
  else if (typeof s === 'number') _pen.scale.set(s, s, s);
  else _pen.scale.set(s[0], s[1], s[2]);
  _pen.updateMatrix();
  return _pen.matrix.clone();
}
/* the matrix that stands a part built along +y at a point, tipped over to
   follow a direction — how a head of grain is set on its stalk */
const _up = new THREE.Vector3(0, 1, 0);
const _one = new THREE.Vector3(1, 1, 1);
const aim = (p, dir) => new THREE.Matrix4().compose(p,
  new THREE.Quaternion().setFromUnitVectors(_up, dir.clone().normalize()), _one);

/* the geometries of one bin, welded into a single buffer */
function weld(parts) {
  const pos = [], nor = [];
  parts.forEach(([g0, m]) => {
    const g = g0.index ? g0.toNonIndexed() : g0.clone();
    if (m) g.applyMatrix4(m);
    const p = g.attributes.position.array, n = g.attributes.normal.array;
    for (let i = 0; i < p.length; i++) pos.push(p[i]);
    for (let i = 0; i < n.length; i++) nor.push(n[i]);
    g.dispose();
  });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  return out;
}
/* Collects geometry by material and lays the lot down as one mesh each, so
   a treasure of eighty pieces costs four draw calls and four MTL entries —
   and every piece still answers to the treasure's own name when clicked. */
function bin() {
  const bins = new Map();
  return {
    put(g, material, matrix) {
      if (!bins.has(material)) bins.set(material, []);
      bins.get(material).push([g, matrix || null]);
      return this;
    },
    lay(name, parent) {
      const sources = new Set();
      bins.forEach((list, material) => {
        const geometry = weld(list);
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        parent.add(mesh);
        list.forEach(([source]) => sources.add(source));
      });
      sources.forEach(source => source.dispose());
      bins.clear();
    }
  };
}

// A folded, pointed leaf with a raised midrib. Shared by both trees, with
// separate palettes and fruit so the rose-apple and wish tree remain distinct.
function leafBlade() {
  return geo([0, 0, 0, 0.42, 0.12, 0, 0.42, 0, -0.22,
    0.42, 0, 0.22, 1, -0.08, 0, 0.42, -0.04, 0],
    [0, 1, 2, 0, 3, 1, 1, 4, 2, 1, 3, 4,
     0, 2, 5, 0, 5, 3, 5, 2, 4, 5, 4, 3]);
}
function cord(b, points, radius, material, steps = 12) {
  b.put(sweep(curve3(points), () => radius, steps, 6), material);
}
function crown(b, center, width, height, seed, dark, light) {
  const orb = new THREE.SphereGeometry(1, 10, 7), leaf = leafBlade();
  const [x, yy, z] = center;
  b.put(orb, dark, at(center, null, [width * 0.82, height * 0.87, width * 0.80]));
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7 + seed, offset = width * 0.56;
    const rise = Math.sin(i * 2.4 + seed) * height * 0.15;
    b.put(orb, i % 3 ? light : dark,
      at([x + Math.cos(a) * offset, yy + rise, z + Math.sin(a) * offset],
        [0.15, -a, 0.18], [width * 0.51, height * 0.64, width * 0.49]));
    // Overlapping leaf sprays break up the rounded masses at their perimeter.
    for (let j = 0; j < 3; j++) {
      const angle = a + (j - 1) * 0.29, length = width * (0.48 + j * 0.07);
      b.put(leaf, (i + j) % 3 ? light : dark,
        at([x + Math.cos(angle) * width * 0.76, yy + rise + height * 0.15,
          z + Math.sin(angle) * width * 0.76],
          [0.12 * (j - 1), -angle, 0.18 - j * 0.17], [length, length, length]));
    }
  }
}

/* ── The emblem each continent carries in the mandala offering ────────
   Drawn as emblems, not to scale: at true size none would be visible. */
const treasures = {
  purvavideha() {                                   // the precious mountain
    const g = new THREE.Group(), b = bin();
    /* Its four sides are gold, silver, lapis and crystal, and it is cut in
       ledges so that the light breaks on it as it breaks on a jewel. */
    const SIDES = [M.gold, M.silver, M.lapis, M.crystal];
    const CUT = [[0, 1], [0.10, 0.95], [0.115, 0.87], [0.28, 0.75],
                 [0.295, 0.66], [0.50, 0.52], [0.52, 0.43], [0.72, 0.30],
                 [0.74, 0.22], [0.90, 0.12], [1, 0.05]];
    const peak = (cx, cz, h, w, spin, turn) => {
      for (let s = 0; s < 4; s++) {
        const a0 = spin + (s - 0.5) * Math.PI / 2, a1 = spin + (s + 0.5) * Math.PI / 2;
        const pos = [], idx = [];
        CUT.forEach(([t, u]) => {
          pos.push(Math.cos(a0) * u * w, t * h, Math.sin(a0) * u * w,
                   Math.cos(a1) * u * w, t * h, Math.sin(a1) * u * w);
        });
        for (let i = 0; i < CUT.length - 1; i++) {
          const A = i * 2;
          idx.push(A, A + 2, A + 1, A + 1, A + 2, A + 3);
        }
        b.put(facet(geo(pos, idx)), SIDES[(s + turn) % 4], at([cx, 0.0062, cz]));
        // Each broken ledge receives a fine gilt seam; the alternating face
        // materials remain broad enough to read from the whole-world view.
        for (const row of [2, 4, 6, 8]) {
          const [t, u] = CUT[row];
          cord(b, [[cx + Math.cos(a0) * u * w, 0.00635 + t * h, cz + Math.sin(a0) * u * w],
            [cx + (Math.cos(a0) + Math.cos(a1)) * u * w / 2, 0.00635 + t * h,
              cz + (Math.sin(a0) + Math.sin(a1)) * u * w / 2],
            [cx + Math.cos(a1) * u * w, 0.00635 + t * h, cz + Math.sin(a1) * u * w]],
            0.00022, M.gold, 2);
        }
      }
    };
    peak(0, 0, 0.0448, 0.0202, Math.PI / 4, 0);
    peak(-0.0180, 0.0082, 0.0292, 0.0120, 0.55, 1);
    peak(0.0160, -0.0092, 0.0218, 0.0100, -0.35, 3);
    /* the rock it stands on, so that the peaks lift clear of the plate */
    b.put(facet(new THREE.CylinderGeometry(0.0225, 0.0265, 0.0072, 9, 1)),
      M.jewel, at([0, 0.0036, 0], [0, 0.42, 0], [1, 1, 0.82]));
    /* what is taken from it does not diminish it: jewels lie loose at its
       foot, in the four substances and in ruby and emerald besides */
    const GEMS = [M.gold, M.ruby, M.emerald, M.lapis, M.crystal, M.silver];
    const gem = new THREE.OctahedronGeometry(1, 0);
    [[0.0255, 0.0165, 0.0030, 0], [-0.0230, -0.0200, 0.0026, 3],
     [0.0060, 0.0270, 0.0024, 2], [-0.0135, 0.0250, 0.0021, 4],
     [0.0275, -0.0135, 0.0027, 1], [-0.0290, 0.0065, 0.0022, 5],
     [0.0030, -0.0275, 0.0025, 2], [-0.0075, -0.0245, 0.0019, 0]]
      .forEach(([x, z, r, k], i) => b.put(gem, GEMS[k],
        at([x, r * 1.22, z], [0.18, 0.9 * i, 0], [r, r * 1.5, r])));
    // Upright hexagonal crystals grow in clusters from the rocky foot.
    const prism = new THREE.CylinderGeometry(1, 1.12, 1, 6);
    const tip = new THREE.ConeGeometry(1, 1, 6);
    for (let i = 0; i < 9; i++) {
      const a = i * Math.PI * 2 / 9 + 0.2, x = Math.cos(a) * 0.022, z = Math.sin(a) * 0.019;
      for (let j = 0; j < 3; j++) {
        const r = 0.0015 + (j % 2) * 0.0004, h = 0.006 + ((i + j) % 3) * 0.003;
        const px = x + Math.cos(a + j * 2.1) * 0.003, pz = z + Math.sin(a + j * 2.1) * 0.003;
        const m = GEMS[(i + j + 2) % GEMS.length];
        b.put(prism, m, at([px, 0.004 + h / 2, pz], [0, a, 0], [r, h, r]));
        b.put(tip, m, at([px, 0.004 + h + r, pz], [0, a, 0], [r, r * 2, r]));
      }
    }
    b.lay('treasure_mountain', g);
    return g;
  },
  jambudvipa() {                                    // the wish-fulfilling tree
    const g = new THREE.Group(), b = bin();
    // An offering emblem with exposed roots and jewel-bearing branches.
    const H = 0.0275;                                // trunk to the first fork
    b.put(sweep(curve3([[0, 0, 0], [0.0009, H * 0.35, 0.0006],
      [-0.0007, H * 0.72, -0.0004], [0.0004, H, 0.0002]]),
      (t) => 0.0052 - 0.0026 * Math.pow(t, 0.65), 12, 12), M.bark);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.2566 + 0.4;
      b.put(sweep(curve3([[0, 0.0078, 0],
        [Math.cos(a) * 0.0040, 0.0028, Math.sin(a) * 0.0040],
        [Math.cos(a) * 0.0084, 0.0005, Math.sin(a) * 0.0084]]),
        (t) => 0.0026 * (1 - t) + 0.0005, 9, 8), M.bark);
    }
    /* five limbs, each forking once, and a leader that carries the crown */
    const TIPS = [];
    [[0.40, 0.60, 0.0135, 0.0125], [1.72, 0.72, 0.0115, 0.0105],
     [2.95, 0.55, 0.0140, 0.0140], [4.20, 0.76, 0.0105, 0.0095],
     [5.35, 0.64, 0.0125, 0.0120]].forEach(([a, t0, reach, lift], i) => {
      const y0 = H * t0, c = Math.cos(a), s = Math.sin(a);
      const tip = [c * reach, y0 + lift, s * reach];
      b.put(sweep(curve3([[c * 0.0016, y0, s * 0.0016],
        [c * reach * 0.55, y0 + lift * 0.62, s * reach * 0.55], tip]),
        (t) => 0.0024 * (1 - t) + 0.0007, 10, 9), M.bark);
      TIPS.push(tip);
      [-0.75, 0.8].forEach((turn, k) => {
        const a2 = a + turn, f = 0.0052 + k * 0.0014;
        b.put(sweep(curve3([tip,
          [tip[0] + Math.cos(a2) * f * 0.5, tip[1] + f * 0.5, tip[2] + Math.sin(a2) * f * 0.5],
          [tip[0] + Math.cos(a2) * f, tip[1] + f * 0.92, tip[2] + Math.sin(a2) * f]]),
          (t) => 0.0011 * (1 - t) + 0.0004, 7, 7), M.bark);
      });
    });
    b.put(sweep(curve3([[0.0004, H, 0.0002], [0.0012, H + 0.0060, -0.0007],
      [0, H + 0.0130, 0.0005]]), (t) => 0.0022 * (1 - t) + 0.0006, 7, 8), M.bark);
    const CANOPY = [[0, 0.0472, 0, 0.0152, 0.0128, M.foliageLit]];
    TIPS.forEach(([x, yy, z], i) => CANOPY.push([x * 1.06, yy + 0.0034, z * 1.06,
      0.0102 + (i % 3) * 0.0009, 0.0086, i % 2 ? M.foliage : M.foliageLit]));
    [[0.0072, 0.0330, 0.0060], [-0.0090, 0.0345, 0.0035], [0.0010, 0.0338, -0.0092]]
      .forEach(([x, yy, z]) => CANOPY.push([x, yy, z, 0.0082, 0.0066, M.foliage]));
    CANOPY.forEach(([x, yy, z, rw, rh], i) =>
      crown(b, [x, yy, z], rw, rh, i * 0.7, M.foliage, M.foliageLit));
    for (let i = 0; i < 7; i++) {
      const a = i * Math.PI * 2 / 7;
      cord(b, [[Math.cos(a) * 0.0047, 0.003, Math.sin(a) * 0.0047],
        [0.0009 + Math.cos(a) * 0.0038, H * 0.35, 0.0006 + Math.sin(a) * 0.0038],
        [-0.0007 + Math.cos(a) * 0.0030, H * 0.72, -0.0004 + Math.sin(a) * 0.0030]],
        0.00022, M.wood, 8);
    }
    /* it gives whatever is asked of it: its fruit are the four substances
       of Meru's faces, and they hang under the leaves that carry them */
    const JEWELS = [M.gold, M.ruby, M.crystal, M.emerald, M.lapis];
    const fruit = new THREE.OctahedronGeometry(1, 0);
    for (let i = 0; i < 14; i++) {
      const [x, yy, z, rw, rh] = CANOPY[1 + i % (CANOPY.length - 1)];
      const a = i * 2.4, off = rw * 0.5;
      const px = x + Math.cos(a) * off, pz = z + Math.sin(a) * off;
      const fy = yy - rh * 0.88 - 0.0022;
      cord(b, [[px, fy + 0.007, pz], [px + 0.0004, fy + 0.0045, pz],
        [px, fy + 0.0025, pz]], 0.00023, M.gold, 4);
      b.put(fruit, JEWELS[i % 5],
        at([px, fy, pz],
           [0.3 * i, 0.7 * i, 0], [0.0021, 0.0030, 0.0021]));
      const setting = new THREE.TorusGeometry(0.0020, 0.00025, 4, 10);
      b.put(setting, M.gold, at([px, fy, pz], [Math.PI / 2, 0, 0]));
    }
    b.lay('treasure_tree', g);
    return g;
  },
  aparagodaniya() {                                 // the wish-fulfilling cow
    const g = new THREE.Group(), b = bin();
    /* Drawn as the cow of the Indian sources — the hump over the withers,
       the fold of the dewlap, horns that curve rather than stand — and set
       facing Meru. */
    b.put(hull([
      [-0.0208, 0.0288, 0.0030, 0.0028], [-0.0190, 0.0282, 0.0074, 0.0068],
      [-0.0140, 0.0276, 0.0094, 0.0088], [-0.0060, 0.0272, 0.0100, 0.0097],
      [ 0.0020, 0.0275, 0.0099, 0.0093], [ 0.0090, 0.0282, 0.0091, 0.0081],
      [ 0.0148, 0.0293, 0.0077, 0.0067], [ 0.0178, 0.0301, 0.0062, 0.0054],
      [ 0.0196, 0.0308, 0.0048, 0.0042]], 18), M.milk);
    const lobe = new THREE.SphereGeometry(1, 12, 8);
    b.put(lobe, M.milk, at([0.0150, 0.0350, 0], [0, 0, -0.28], [0.0074, 0.0050, 0.0066]));
    /* neck and head in one run, the head tipped a little down */
    b.put(hull([
      [0.0172, 0.0296, 0.0056, 0.0048], [0.0232, 0.0336, 0.0052, 0.0046],
      [0.0268, 0.0360, 0.0050, 0.0045], [0.0296, 0.0375, 0.0052, 0.0047],
      [0.0324, 0.0370, 0.0043, 0.0038], [0.0354, 0.0360, 0.0034, 0.0030],
      [0.0382, 0.0352, 0.0029, 0.0027], [0.0400, 0.0349, 0.0024, 0.0023]], 16), M.milk);
    b.put(hull([[0.0386, 0.0351, 0.0030, 0.0029], [0.0403, 0.0348, 0.0025, 0.0024],
                [0.0416, 0.0347, 0.0015, 0.0015]], 14), M.hoof);
    /* the dewlap, hanging in folds from the throat to the chest */
    b.put(hull([
      [0.0204, 0.0294, 0.0020, 0.0032], [0.0230, 0.0286, 0.0030, 0.0036],
      [0.0252, 0.0290, 0.0029, 0.0035], [0.0274, 0.0288, 0.0031, 0.0034],
      [0.0296, 0.0304, 0.0027, 0.0029], [0.0316, 0.0324, 0.0020, 0.0021],
      [0.0332, 0.0340, 0.0011, 0.0012]], 16), M.milk);
    [-1, 1].forEach((s) => {
      b.put(lobe, M.milk,
        at([0.0294, 0.0398, s * 0.0022], [0, -s * 2.09, 0.35], [0.0050, 0.0014, 0.0030]));
      b.put(lobe, M.hoof, at([0.0316, 0.0381, s * 0.0040], null, 0.0012));
      b.put(lobe, M.pearl, at([0.0319, 0.03855, s * 0.00485], null, 0.00034));
      b.put(lobe, M.cinnabar,
        at([0.0297, 0.0402, s * 0.0044], [0, -s * 2.09, 0.35], [0.0027, 0.00055, 0.0015]));
      cord(b, [[0.0300, 0.0389, s * 0.0041], [0.0316, 0.0395, s * 0.0043],
        [0.0329, 0.0388, s * 0.0035]], 0.00035, M.milk, 5);
      b.put(sweep(curve3([
        [0.0286, 0.0403, s * 0.0022], [0.0282, 0.0440, s * 0.0056],
        [0.0294, 0.0474, s * 0.0072], [0.0322, 0.0490, s * 0.0056]]),
        (t) => 0.0019 * (1 - t) * (1 - t * 0.35) + 0.00016, 12, 10), M.gold);
    });
    /* four legs, each set down on a dark hoof */
    const hoof = new THREE.SphereGeometry(1, 10, 7);
    [[0.0132, 0.0056, 1], [0.0132, -0.0056, 1],
     [-0.0148, 0.0058, 0], [-0.0148, -0.0058, 0]].forEach(([x, z, front]) => {
      const pts = front
        ? [[x, 0.0286, z * 0.7], [x - 0.0006, 0.0170, z],
           [x + 0.0012, 0.0090, z * 1.06], [x + 0.0010, 0.0032, z * 1.08]]
        : [[x, 0.0280, z * 0.7], [x - 0.0020, 0.0172, z],
           [x + 0.0014, 0.0088, z * 1.04], [x + 0.0011, 0.0032, z * 1.06]];
      b.put(sweep(curve3(pts), (t) => 0.0042 - 0.0022 * Math.pow(t, 0.55), 14, 10), M.milk);
      for (const side of [-1, 1]) b.put(hoof, M.hoof,
        at([pts[3][0] + 0.0004, 0.0016, pts[3][2] + side * 0.00105],
          null, [0.0023, 0.0016, 0.0009]));
    });
    /* the udder she is named for */
    b.put(lobe, M.milk, at([-0.0034, 0.0192, 0], null, [0.0062, 0.0044, 0.0056]));
    for (let i = 0; i < 4; i++)
      b.put(new THREE.CylinderGeometry(0.00055, 0.0007, 0.0026, 8), M.milk,
        at([-0.0034 + (i < 2 ? 0.0026 : -0.0026), 0.0158, (i % 2 ? 1 : -1) * 0.0024]));
    /* the tail, with its tuft */
    b.put(sweep(curve3([[-0.0176, 0.0316, 0], [-0.0228, 0.0264, 0.0004],
      [-0.0248, 0.0170, 0.0010], [-0.0234, 0.0096, 0.0014]]),
      (t) => 0.0019 - 0.0011 * t, 12, 8), M.milk);
    b.put(lobe, M.hoof, at([-0.0232, 0.0078, 0.0014], [0, 0, 0.2], [0.0021, 0.0038, 0.0021]));
    // A draped cinnabar cloth follows the barrel instead of floating above
    // it. Its open ends leave the hump, neck and four legs clearly visible.
    const clothSections = [
      [-0.0140, 0.0276, 0.0100, 0.0095], [-0.0060, 0.0272, 0.0106, 0.0104],
      [0.0020, 0.0275, 0.0105, 0.0100], [0.0070, 0.0280, 0.0100, 0.0091]
    ];
    const clothPoint = ([x, cy, hh, hw], a) => [x, cy + Math.cos(a) * hh, Math.sin(a) * hw];
    const clothPos = [], clothIdx = [], steps = 18, edge = 1.92;
    clothSections.forEach(section => {
      for (let i = 0; i <= steps; i++) clothPos.push(...clothPoint(section, -edge + i * edge * 2 / steps));
    });
    for (let row = 0; row < clothSections.length - 1; row++) for (let i = 0; i < steps; i++) {
      const a = row * (steps + 1) + i, c = a + steps + 1;
      clothIdx.push(a, a + 1, c, a + 1, c + 1, c);
    }
    b.put(geo(clothPos, clothIdx), M.cinnabar);
    for (const section of [clothSections[0], clothSections[clothSections.length - 1]]) {
      cord(b, Array.from({length: 13}, (_, i) => clothPoint(section, -edge + i * edge / 6)),
        0.00045, M.gold, 24);
    }
    for (const side of [-1, 1]) {
      cord(b, clothSections.map(section => clothPoint(section, side * edge)), 0.00045, M.gold, 12);
      for (let i = 0; i < 8; i++) {
        const x = -0.013 + i * 0.0027, z = side * (0.0091 + Math.sin(i / 7 * Math.PI) * 0.0007);
        cord(b, [[x, 0.0243, z], [x - 0.0003, 0.0227, z * 1.03],
          [x, 0.0216, z * 1.04]], 0.00028, M.gold, 4);
        b.put(lobe, M.pearl, at([x, 0.0215, z * 1.04], null, 0.0006));
      }
      // Gilt sun medallions and small emerald inlays on each flank.
      const ring = new THREE.TorusGeometry(0.0031, 0.00038, 5, 16);
      b.put(ring, M.gold, at([-0.004, 0.030, side * 0.0102]));
      b.put(new THREE.OctahedronGeometry(1), M.emerald,
        at([-0.004, 0.030, side * 0.0106], null, [0.0017, 0.0021, 0.0007]));
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        b.put(lobe, M.gold, at([-0.004 + Math.cos(a) * 0.0039,
          0.030 + Math.sin(a) * 0.0039, side * 0.0102], null, 0.00045));
      }
    }
    // Beaded collar, forehead jewel and a small bell below the throat.
    const collar = Array.from({length: 17}, (_, i) => {
      const a = i * Math.PI / 8;
      return [0.0244, 0.0343 + Math.cos(a) * 0.0057, Math.sin(a) * 0.0053];
    });
    cord(b, collar, 0.0005, M.gold, 32);
    collar.slice(0, -1).forEach(p => b.put(lobe, M.pearl, at(p, null, 0.00066)));
    b.put(new THREE.OctahedronGeometry(1), M.ruby,
      at([0.0320, 0.0414, 0], [0, 0, -0.25], [0.0015, 0.00065, 0.0019]));
    cord(b, [[0.0244, 0.0300, 0.0044], [0.0258, 0.0274, 0.0054],
      [0.0260, 0.026, 0.0053]], 0.0003, M.gold, 5);
    b.put(new THREE.CylinderGeometry(0.0006, 0.0015, 0.0020, 10), M.gold,
      at([0.026, 0.0252, 0.0053]));
    b.put(lobe, M.gold, at([0.026, 0.0240, 0.0053], null, 0.0005));
    b.lay('treasure_cow', g);
    return g;
  },
  uttarakuru() {                                    // the harvest that is never sown
    const g = new THREE.Group(), b = bin();
    /* Grain that ripens without ploughing, sowing or tending: the heads are
       heavy enough to nod the stalks over, and the crop stands in its own
       leaf. One head is built and then set on each stalk in turn. */
    const kernel = new THREE.SphereGeometry(1, 7, 5);
    const head = [[new THREE.CylinderGeometry(0.00042, 0.00068, 0.0142, 7),
                   at([0, 0.0071, 0])]];
    for (let i = 0; i < 16; i++) {
      const t = i / 15, a = i * 2.3999, r = 0.0016 * (1 - 0.5 * t * t);
      head.push([kernel, at([Math.cos(a) * r, 0.0014 + t * 0.0126, Math.sin(a) * r],
        [0, -a, -0.55], [0.00105, 0.0023, 0.00105])]);
    }
    for (let i = 0; i < 7; i++) {                    // the awns, standing off the head
      const a = i * 2.3999 + 0.6;
      head.push([sweep(curve3([
        [Math.cos(a) * 0.0008, 0.0122, Math.sin(a) * 0.0008],
        [Math.cos(a) * 0.0022, 0.0190, Math.sin(a) * 0.0022],
        [Math.cos(a) * 0.0042, 0.0252, Math.sin(a) * 0.0042]]),
        (t) => 0.00024 * (1 - t) + 0.00004, 5, 4), null]);
    }
    const ear = weld(head);
    new Set(head.map(([geometry]) => geometry)).forEach(geometry => geometry.dispose());
    const STALKS = 9;
    for (let i = 0; i < STALKS; i++) {
      const a = (i / STALKS) * Math.PI * 2 + 0.35;
      const lean = 0.85 + (i % 3) * 0.20, c = Math.cos(a), s = Math.sin(a);
      const r0 = 0.0030 + (i % 2) * 0.0012, top = 0.0300 + (i % 3) * 0.0035;
      const out = (t) => r0 + t * lean;
      const path = curve3([
        [c * r0, 0, s * r0],
        [c * out(0.0022), top * 0.46, s * out(0.0022)],
        [c * out(0.0058), top * 0.86, s * out(0.0058)],
        [c * out(0.0098), top, s * out(0.0098)]
      ]);
      b.put(sweep(path, (t) => 0.0016 - 0.0007 * t, 14, 8), M.stem);
      b.put(ear, M.grain, aim(path.getPointAt(1), path.getTangentAt(1)));
      // Nodes and alternating flag leaves articulate each stalk; no sheaf
      // binding or cultivated furrows, since this harvest grows unsown.
      for (let node = 1; node <= 2; node++) {
        const p = path.getPointAt(node * 0.27), direction = path.getTangentAt(node * 0.27);
        const ring = new THREE.TorusGeometry(0.0012, 0.00022, 4, 8);
        ring.rotateX(Math.PI / 2);
        b.put(ring, M.grain, aim(p, direction));
        b.put(blade(0.011 + node * 0.002, 0.0014, 0.00015, 0.0038),
          i % 2 ? M.stem : M.foliageLit,
          at(p.toArray(), [0, -a + (node % 2 ? 0.45 : -0.7), 0.6]));
      }
    }
    /* five blades springing from the crop, and a tuft at the foot */
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 1.1;
      b.put(blade(0.0165, 0.0022, 0.00035, 0.0058), M.stem,
        at([Math.cos(a) * 0.0032, 0.0075 + (i % 2) * 0.0035, Math.sin(a) * 0.0032],
           [0, -a, 0.55]));
    }
    for (let i = 0; i < 6; i++) {
      const a = i * 1.05 + 0.2;
      b.put(blade(0.0088, 0.0014, 0.0003, 0.0036), M.stem,
        at([Math.cos(a) * 0.0018, 0.0008, Math.sin(a) * 0.0018], [0, -a, 0.85]));
    }
    b.lay('treasure_harvest', g);
    return g;
  }
};

function createJambuTree() {
  const g = new THREE.Group(), wood = bin(), leaves = bin();
  g.name = 'jambu_tree';
  // A spreading fruit tree with a visible bifurcating trunk. It is enlarged
  // independently of the treasure tree so it can be selected on the continent.
  wood.put(sweep(curve3([[0, 0.001, 0], [-0.001, 0.010, 0],
    [0.0010, 0.018, -0.0004], [0.0003, 0.029, 0]]),
    t => 0.0032 * (1 - t * 0.69), 12, 10), M.wood);
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + 0.3, c = Math.cos(a), s = Math.sin(a);
    wood.put(sweep(curve3([[c * 0.0006, 0.008, s * 0.0006],
      [c * 0.004, 0.002, s * 0.004], [c * 0.0072, 0.0005, s * 0.0072]]),
      t => 0.0015 * (1 - t) + 0.0003, 7, 7), M.wood);
    const start = [0, 0.013 + (i % 3) * 0.003, 0];
    const tip = [c * 0.0115, 0.027 + (i % 3) * 0.0025, s * 0.010];
    wood.put(sweep(curve3([start, [c * 0.006, tip[1] - 0.005, s * 0.004], tip]),
      t => 0.0017 * (1 - t) + 0.00045, 9, 8), M.wood);
    for (const side of [-1, 1]) {
      const a2 = a + side * 0.55;
      const end = [tip[0] + Math.cos(a2) * 0.004, tip[1] + 0.005, tip[2] + Math.sin(a2) * 0.004];
      wood.put(sweep(curve3([tip, [(tip[0] + end[0]) / 2, tip[1] + 0.003, (tip[2] + end[2]) / 2], end]),
        t => 0.00065 * (1 - t) + 0.0002, 5, 6), M.wood);
    }
    crown(leaves, [tip[0], tip[1] + 0.003, tip[2]], 0.009, 0.007, a, M.leaf, M.foliageLit);
    // Rose-apple clusters have round, fleshy fruit, unlike the hanging jewels.
    const fruit = new THREE.SphereGeometry(1, 8, 6);
    for (let j = 0; j < 4; j++) {
      const angle = a + j * 1.7, px = tip[0] + Math.cos(angle) * 0.005, pz = tip[2] + Math.sin(angle) * 0.005;
      cord(leaves, [[px, tip[1] + 0.001, pz], [px, tip[1] - 0.002, pz],
        [px + 0.0003, tip[1] - 0.003, pz]], 0.00018, M.wood, 3);
      leaves.put(fruit, M.ruby, at([px, tip[1] - 0.0037, pz], null, [0.0011, 0.0015, 0.0011]));
      leaves.put(fruit, M.ruby, at([px + 0.0015, tip[1] - 0.003, pz + 0.0004], null, [0.0009, 0.0012, 0.0009]));
    }
  }
  crown(leaves, [0.0003, 0.037, 0], 0.010, 0.008, 0.4, M.leaf, M.foliageLit);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    cord(wood, [[Math.cos(a) * 0.0028, 0.002, Math.sin(a) * 0.0028],
      [-0.001 + Math.cos(a) * 0.0021, 0.010, Math.sin(a) * 0.0021],
      [0.001 + Math.cos(a) * 0.0016, 0.018, -0.0004 + Math.sin(a) * 0.0016]],
      0.00018, M.bark, 8);
  }
  wood.lay('jambu_trunk', g);
  leaves.lay('jambu_canopy', g);
  return g;
}

return { treasures, createJambuTree };
}
