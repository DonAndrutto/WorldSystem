/* Sculpted study miniatures for the outer twenty offerings.
 * The caller supplies its pinned Three.js instance and existing materials.
 * Forms and attributes are illustrative, not a prescribed deity visualization.
 * Local +z faces the reader; the finished reliefs lie face-up on the diagram.
 */
export function createOfferingModels(THREE, palette) {
  const { gold, goldDeep, lapis, ruby, emerald, milk: ivory, iron, silver,
    wood, sun, moonDisc: moon } = palette;
  const v = p => new THREE.Vector3(...p);
  const geometries = new Set();
  const keep = geometry => { geometries.add(geometry); return geometry; };
  const sphere = keep(new THREE.SphereGeometry(1, 14, 10));
  const cube = keep(new THREE.BoxGeometry(1, 1, 1));
  const jewel = keep(new THREE.OctahedronGeometry(1));
  const models = new Map();

  function put(group, geometry, material, position = [0, 0, 0], scale = [1, 1, 1], rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.fromArray(position);
    mesh.scale.fromArray(scale);
    mesh.rotation.set(...rotation);
    group.add(mesh);
    return mesh;
  }
  const oval = (g, m, p, s, r) => put(g, sphere, m, p, s, r);
  const box = (g, m, p, s, r) => put(g, cube, m, p, s, r);
  function tube(g, m, points, radius = 0.018) {
    const path = new THREE.CatmullRomCurve3(points.map(v));
    return put(g, keep(new THREE.TubeGeometry(path, 16, radius, 7, false)), m);
  }
  function rod(g, m, a, b, radius = 0.018) {
    const start = v(a), end = v(b), delta = end.clone().sub(start);
    const mesh = put(g, keep(new THREE.CylinderGeometry(radius, radius, delta.length(), 10)), m);
    mesh.position.copy(start.add(end).multiplyScalar(0.5));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize());
    return mesh;
  }
  function ring(g, m, radius, thickness, position, scale = [1, 1, 1]) {
    return put(g, keep(new THREE.TorusGeometry(radius, thickness, 7, 32)), m, position, scale);
  }
  function vessel(g, m, profile, position, scale = [1, 1, 1]) {
    return put(g, keep(new THREE.LatheGeometry(profile.map(p => new THREE.Vector2(...p)), 20)), m, position, scale);
  }
  function gem(g, m, p, s = [0.07, 0.09, 0.05]) { return put(g, jewel, m, p, s); }
  function lotus(g, width = 0.44) {
    oval(g, goldDeep, [0, 0.055, 0], [width, 0.075, 0.14]);
    for (let i = -3; i <= 3; i++) {
      oval(g, i % 2 ? gold : ivory,
        [i * width / 4, 0.105 - Math.abs(i) * 0.014, 0.055],
        [width * 0.17, 0.14, 0.065], [0, 0, -i * 0.27]);
    }
    box(g, gold, [0, 0.02, 0.03], [width * 1.75, 0.035, 0.18]);
  }
  function blossom(g, x, y, z, radius = 0.13) {
    for (let i = 0; i < 7; i++) {
      const a = i * Math.PI * 2 / 7;
      oval(g, i % 2 ? ivory : ruby,
        [x + Math.sin(a) * radius * 0.55, y + Math.cos(a) * radius * 0.55, z],
        [radius * 0.36, radius * 0.64, radius * 0.22], [0, 0, -a]);
    }
    oval(g, gold, [x, y, z + radius * 0.17], [radius * 0.27, radius * 0.27, radius * 0.24]);
  }
  function flame(g, x, y, z, height = 0.19) {
    oval(g, sun, [x, y, z], [height * 0.27, height * 0.65, height * 0.22], [0, 0, -0.16]);
    gem(g, gold, [x + height * 0.12, y + height * 0.51, z], [height * 0.2, height * 0.37, height * 0.17]);
  }
  function crown(g, y, ornate = true) {
    oval(g, gold, [0, y, 0.02], [0.155, 0.045, 0.115]);
    const n = ornate ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) / 2) * 0.052;
      gem(g, gold, [x, y + 0.065, 0.077], [0.037, 0.08 - Math.abs(x) * 0.18, 0.026]);
      gem(g, i % 2 ? emerald : ruby, [x, y + 0.062, 0.107], [0.016, 0.023, 0.013]);
    }
  }
  function face(g, y) {
    oval(g, gold, [0, y, 0.055], [0.115, 0.14, 0.105]);
    oval(g, goldDeep, [0, y + 0.09, -0.008], [0.125, 0.075, 0.10]);
    for (const x of [-0.041, 0.041]) oval(g, iron, [x, y + 0.018, 0.149], [0.018, 0.008, 0.008]);
    oval(g, gold, [0, y - 0.018, 0.16], [0.016, 0.03, 0.014]);
    tube(g, ruby, [[-0.026, y - 0.064, 0.148], [0, y - 0.07, 0.157], [0.026, y - 0.064, 0.148]], 0.006);
    for (const x of [-0.133, 0.133]) ring(g, gold, 0.038, 0.009, [x, y - 0.055, 0.04], [0.8, 1.2, 1]);
  }
  function arm(g, side, hand, elbow) {
    const shoulder = [side * 0.16, 1.04, 0.045];
    tube(g, gold, [shoulder, elbow || [side * 0.27, 0.86, 0.11], hand], 0.032);
    oval(g, gold, hand, [0.04, 0.045, 0.03]);
    oval(g, goldDeep, shoulder, [0.043, 0.047, 0.043]);
  }
  function figure(g, robe, pose = 'seated') {
    lotus(g);
    if (pose === 'dance') {
      tube(g, gold, [[-0.08, 0.63, 0], [-0.27, 0.36, 0.035], [-0.15, 0.19, 0.04]], 0.047);
      tube(g, gold, [[0.09, 0.62, 0.01], [0.26, 0.52, 0.06], [0.40, 0.65, 0.08]], 0.043);
      oval(g, robe, [0, 0.60, 0], [0.26, 0.18, 0.10], [0, 0, -0.24]);
    } else {
      oval(g, robe, [0, 0.30, 0], [0.32, 0.18, 0.13]);
      oval(g, robe, [-0.13, 0.26, 0.10], [0.21, 0.09, 0.09], [0, 0, 0.18]);
      oval(g, robe, [0.13, 0.26, 0.12], [0.21, 0.09, 0.09], [0, 0, -0.18]);
      vessel(g, robe, [[0.24, 0], [0.20, 0.14], [0.11, 0.31], [0.10, 0.40]], [0, 0.31, 0]);
    }
    oval(g, gold, [0, 0.91, 0.015], [0.17, 0.23, 0.10]);
    box(g, goldDeep, [0, 0.72, 0.10], [0.24, 0.035, 0.04]);
    oval(g, robe, [-0.055, 0.94, 0.10], [0.066, 0.20, 0.027], [0, 0, -0.36]);
    tube(g, ivory, [[-0.11, 1.055, 0.09], [0, 0.96, 0.126], [0.11, 1.055, 0.09]], 0.014);
    gem(g, ruby, [0, 0.962, 0.145], [0.032, 0.04, 0.02]);
    rod(g, gold, [0, 1.09, 0.015], [0, 1.17, 0.02], 0.046);
    face(g, 1.28);
    crown(g, 1.40);
    // Two silk scarves frame the figure without obscuring its offering.
    for (const s of [-1, 1]) tube(g, robe, [[s * 0.14, 1.08, -0.07], [s * 0.36, 1.20, -0.08],
      [s * 0.42, 0.91, -0.06], [s * 0.33, 0.55, -0.025], [s * 0.44, 0.32, 0]], 0.02);
  }
  function bowl(g, x, y, z) {
    vessel(g, gold, [[0.035, 0], [0.075, 0.02], [0.13, 0.075], [0.145, 0.115]], [x, y, z]);
    oval(g, goldDeep, [x, y + 0.11, z], [0.145, 0.018, 0.145]);
  }
  function lamp(g, x, y, z) {
    vessel(g, gold, [[0.11, 0], [0.12, 0.025], [0.032, 0.065], [0.032, 0.17], [0.14, 0.22], [0.15, 0.28]], [x, y, z]);
    flame(g, x, y + 0.35, z);
  }
  function vase(g, x, y, z, scale = 1) {
    const sub = new THREE.Group(); g.add(sub);
    sub.position.set(x, y, z); sub.scale.setScalar(scale);
    vessel(sub, gold, [[0.11, 0], [0.14, 0.03], [0.11, 0.08], [0.22, 0.20], [0.23, 0.34],
      [0.16, 0.46], [0.07, 0.52], [0.075, 0.62], [0.12, 0.65]], [0, 0, 0]);
    ring(sub, goldDeep, 0.145, 0.018, [0, 0.32, 0.185], [1, 0.64, 1]);
    gem(sub, lapis, [0, 0.32, 0.225], [0.07, 0.09, 0.025]);
    tube(sub, ruby, [[-0.10, 0.61, 0.05], [-0.23, 0.50, 0.10], [-0.26, 0.28, 0.04]], 0.024);
    tube(sub, ruby, [[0.10, 0.61, 0.05], [0.23, 0.49, 0.10], [0.30, 0.39, 0.04]], 0.024);
    return sub;
  }

  // Combine each material into one mesh. Repeated petals, jewellery and limbs
  // retain their shapes without turning every detail into a separate draw call.
  function finish(id, label, build) {
    const source = new THREE.Group();
    build(source);
    source.updateMatrixWorld(true);
    const bins = new Map();
    source.traverse(mesh => {
      if (!mesh.isMesh) return;
      const geometry = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal');
      if (!bins.has(mesh.material)) bins.set(mesh.material, {position: [], normal: []});
      const bin = bins.get(mesh.material);
      for (let i = 0; i < p.array.length; i++) { bin.position.push(p.array[i]); bin.normal.push(n.array[i]); }
      geometry.dispose();
    });
    const relief = new THREE.Group();
    bins.forEach((bin, material) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(bin.position, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(bin.normal, 3));
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = id; mesh.userData.offering = true;
      mesh.castShadow = false; mesh.receiveShadow = false;
      relief.add(mesh);
    });
    const bounds = new THREE.Box3().setFromObject(relief);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 1 / Math.max(size.x, size.y);
    relief.children.forEach(mesh => {
      mesh.geometry.translate(-center.x, -center.y, -bounds.min.z);
      mesh.geometry.scale(scale, scale, scale);
      mesh.geometry.computeBoundingBox(); mesh.geometry.computeBoundingSphere();
    });
    relief.rotation.x = -Math.PI / 2;
    const group = new THREE.Group();
    group.name = 'offering_' + id;
    group.userData.attribute = label;
    group.add(relief);
    models.set(id, group);
  }

  finish('emblem_wheel', 'A golden wheel on a lotus seat', g => {
    lotus(g); rod(g, gold, [0, 0.16, 0], [0, 0.55, 0], 0.045);
    ring(g, gold, 0.40, 0.052, [0, 0.91, 0]);
    ring(g, goldDeep, 0.32, 0.019, [0, 0.91, 0.015]);
    for (let i = 0; i < 16; i++) {
      const a = i * Math.PI / 8;
      rod(g, gold, [0, 0.91, 0], [Math.sin(a) * 0.39, 0.91 + Math.cos(a) * 0.39, 0], i % 2 ? 0.013 : 0.025);
    }
    gem(g, lapis, [0, 0.91, 0.055], [0.12, 0.12, 0.08]);
  });
  finish('emblem_jewel', 'A faceted jewel surrounded by golden flames', g => {
    lotus(g); bowl(g, 0, 0.19, 0);
    for (let i = -2; i <= 2; i++) {
      const x = i * 0.14;
      tube(g, gold, [[x, 0.36, -0.04], [x * 1.75, 0.69, -0.045], [x * 1.25, 0.99, -0.025], [x * 0.6, 1.21 - Math.abs(x), 0]], 0.032);
    }
    gem(g, emerald, [0, 0.72, 0.06], [0.22, 0.35, 0.18]);
    gem(g, ruby, [-0.21, 0.46, 0.09], [0.12, 0.17, 0.10]);
    gem(g, lapis, [0.21, 0.46, 0.09], [0.12, 0.17, 0.10]);
  });
  finish('emblem_queen', 'A crowned queen with a lotus', g => {
    figure(g, ruby); arm(g, -1, [-0.28, 0.90, 0.17]); arm(g, 1, [0.14, 0.62, 0.19]);
    tube(g, emerald, [[-0.28, 0.83, 0.15], [-0.33, 1.08, 0.12], [-0.28, 1.25, 0.11]], 0.014);
    blossom(g, -0.28, 1.25, 0.13, 0.11);
  });
  finish('emblem_minister', 'A minister holding a scroll', g => {
    figure(g, lapis); arm(g, -1, [-0.22, 0.79, 0.22]); arm(g, 1, [0.22, 0.79, 0.22]);
    box(g, ivory, [0, 0.80, 0.23], [0.43, 0.20, 0.025]);
    for (const x of [-0.23, 0.23]) rod(g, gold, [x, 0.68, 0.25], [x, 0.92, 0.25], 0.025);
    for (let i = 0; i < 3; i++) box(g, goldDeep, [0, 0.75 + i * 0.045, 0.248], [0.23, 0.007, 0.007]);
  });
  finish('emblem_elephant', 'A white elephant with trunk, tusks and a jewelled saddle', g => {
    lotus(g, 0.70);
    oval(g, ivory, [-0.06, 0.66, 0], [0.47, 0.31, 0.23]);
    for (const x of [-0.34, 0.22]) for (const z of [-0.11, 0.14]) {
      rod(g, ivory, [x, 0.62, z], [x + 0.025, 0.21, z], 0.08);
      oval(g, silver, [x + 0.025, 0.20, z + 0.035], [0.09, 0.035, 0.07]);
    }
    oval(g, ivory, [0.40, 0.83, 0], [0.24, 0.25, 0.20]);
    oval(g, silver, [0.25, 0.78, 0.17], [0.18, 0.22, 0.04], [0, 0, -0.24]);
    oval(g, ivory, [0.25, 0.78, 0.20], [0.15, 0.19, 0.04], [0, 0, -0.24]);
    tube(g, ivory, [[0.55, 0.82, 0.08], [0.63, 0.59, 0.09], [0.61, 0.34, 0.10], [0.78, 0.37, 0.11], [0.80, 0.48, 0.11]], 0.068);
    for (const z of [0.04, 0.22]) tube(g, ivory, [[0.50, 0.66, z], [0.70, 0.65, z], [0.77, 0.75, z]], 0.023);
    oval(g, iron, [0.48, 0.88, 0.185], [0.017, 0.018, 0.012]);
    box(g, ruby, [-0.06, 0.85, 0.04], [0.47, 0.14, 0.42]);
    tube(g, gold, [[-0.25, 0.86, 0.26], [-0.22, 0.70, 0.26], [0.15, 0.70, 0.26], [0.19, 0.86, 0.26]], 0.02);
    gem(g, emerald, [-0.06, 1.05, 0.03], [0.15, 0.19, 0.11]);
    tube(g, ivory, [[-0.48, 0.78, -0.06], [-0.59, 0.63, 0], [-0.61, 0.41, 0.02]], 0.023);
  });
  finish('emblem_horse', 'A saddled horse with flowing mane and tail', g => {
    lotus(g, 0.64);
    oval(g, ivory, [-0.06, 0.69, 0], [0.37, 0.19, 0.14]);
    for (const [x, z, bend] of [[-0.29, -0.07, -0.08], [-0.24, 0.10, 0.09], [0.19, -0.07, 0.07], [0.21, 0.11, -0.04]]) {
      tube(g, ivory, [[x, 0.65, z], [x + bend, 0.38, z], [x + bend * 0.6, 0.20, z]], 0.033);
      oval(g, iron, [x + bend * 0.6 + 0.02, 0.18, z], [0.055, 0.031, 0.035]);
    }
    oval(g, ivory, [0.27, 0.90, 0], [0.105, 0.29, 0.10], [0, 0, -0.35]);
    oval(g, ivory, [0.39, 1.14, 0], [0.16, 0.09, 0.08], [0, 0, -0.28]);
    for (const x of [0.28, 0.37]) oval(g, ivory, [x, 1.26, 0], [0.028, 0.09, 0.026], [0, 0, x < 0.3 ? 0.2 : -0.2]);
    oval(g, iron, [0.43, 1.16, 0.074], [0.013, 0.013, 0.01]);
    for (let i = 0; i < 5; i++) tube(g, wood, [[0.27 - i * 0.025, 1.19 - i * 0.068, -0.055],
      [0.14 - i * 0.025, 1.10 - i * 0.068, -0.07], [0.12 - i * 0.025, 1.00 - i * 0.068, -0.04]], 0.025);
    tube(g, wood, [[-0.39, 0.76, 0], [-0.57, 0.74, 0], [-0.60, 0.43, 0.03], [-0.71, 0.38, 0.02]], 0.042);
    box(g, lapis, [-0.055, 0.78, 0.015], [0.31, 0.13, 0.29]);
    tube(g, gold, [[0.48, 1.14, 0.09], [0.28, 0.92, 0.14], [0.06, 0.93, 0.15]], 0.012);
    gem(g, ruby, [-0.06, 0.92, 0.015], [0.07, 0.09, 0.055]);
  });
  finish('emblem_general', 'An armoured general with shield and upright staff', g => {
    figure(g, emerald);
    oval(g, iron, [0, 0.94, 0.10], [0.16, 0.17, 0.04]);
    for (let i = 0; i < 4; i++) box(g, gold, [0, 0.83 + i * 0.062, 0.14], [0.27 - i * 0.025, 0.013, 0.02]);
    arm(g, -1, [-0.27, 0.81, 0.17]); arm(g, 1, [0.28, 0.87, 0.14]);
    oval(g, iron, [-0.28, 0.72, 0.20], [0.18, 0.24, 0.04]);
    ring(g, gold, 0.16, 0.016, [-0.28, 0.72, 0.235], [1, 1.36, 1]);
    gem(g, ruby, [-0.28, 0.72, 0.265], [0.055, 0.065, 0.022]);
    rod(g, gold, [0.32, 0.20, 0.05], [0.32, 1.44, 0.05], 0.025);
    gem(g, gold, [0.32, 1.48, 0.05], [0.052, 0.08, 0.035]);
  });
  finish('emblem_vase', 'A treasure vase crowned with leaves and a jewel', g => {
    lotus(g); const pot = vase(g, 0, 0.17, 0, 1.3);
    for (const s of [-1, 1]) {
      tube(pot, gold, [[0, 0.63, 0], [s * 0.12, 0.79, 0], [s * 0.23, 0.90, 0]], 0.017);
      oval(pot, emerald, [s * 0.14, 0.79, 0.03], [0.11, 0.04, 0.025], [0, 0, s * 0.6]);
    }
    gem(pot, ruby, [0, 0.87, 0], [0.10, 0.17, 0.08]);
  });

  const goddessBuilders = [
    ['lasya', 'Beauty: a mirror', ruby, g => {
      arm(g, -1, [-0.27, 1.00, 0.17]); arm(g, 1, [0.15, 0.65, 0.16]);
      rod(g, gold, [-0.28, 0.94, 0.19], [-0.28, 1.18, 0.19], 0.015);
      oval(g, silver, [-0.28, 1.28, 0.18], [0.105, 0.14, 0.018]);
      ring(g, gold, 0.10, 0.015, [-0.28, 1.28, 0.20], [1, 1.35, 1]);
    }],
    ['mala', 'Garlands: a flower garland held in both hands', emerald, g => {
      arm(g, -1, [-0.28, 1.01, 0.18]); arm(g, 1, [0.28, 1.01, 0.18]);
      tube(g, gold, [[-0.28, 1.01, 0.19], [-0.21, 0.78, 0.21], [0, 0.70, 0.23], [0.21, 0.78, 0.21], [0.28, 1.01, 0.19]], 0.018);
      for (let i = 0; i < 7; i++) {
        const a = Math.PI * i / 6;
        blossom(g, -Math.cos(a) * 0.27, 1.00 - Math.sin(a) * 0.29, 0.24, 0.054);
      }
    }],
    ['gita', 'Song: a long-necked lute', lapis, g => {
      arm(g, -1, [-0.19, 0.75, 0.21]); arm(g, 1, [0.26, 1.02, 0.21]);
      oval(g, wood, [-0.11, 0.74, 0.20], [0.17, 0.22, 0.055], [0, 0, -0.55]);
      oval(g, gold, [-0.11, 0.74, 0.253], [0.13, 0.18, 0.013], [0, 0, -0.55]);
      rod(g, wood, [-0.05, 0.86, 0.22], [0.32, 1.20, 0.22], 0.036);
      for (let i = -1; i <= 1; i++) rod(g, silver, [-0.21 + i * 0.014, 0.64, 0.27], [0.32 + i * 0.014, 1.20, 0.27], 0.0035);
      oval(g, iron, [-0.11, 0.77, 0.272], [0.036, 0.042, 0.005]);
    }],
    ['nritya', 'Dance: raised arms, a bent leg and flowing scarves', ruby, g => {
      arm(g, -1, [-0.34, 1.37, 0.10], [-0.45, 1.13, 0.08]);
      arm(g, 1, [0.46, 0.96, 0.14], [0.32, 0.83, 0.09]);
    }],
    ['pushpa', 'Flowers: a bowl of blossoms', emerald, g => {
      arm(g, -1, [-0.15, 0.80, 0.18]); arm(g, 1, [0.15, 0.80, 0.18]);
      bowl(g, 0, 0.71, 0.20);
      for (const [x, y] of [[-0.13, 0.94], [0, 1.00], [0.13, 0.94]]) blossom(g, x, y, 0.26, 0.105);
    }],
    ['dhupa', 'Incense: a censer with rising smoke', lapis, g => {
      arm(g, -1, [-0.16, 0.76, 0.20]); arm(g, 1, [0.16, 0.76, 0.20]);
      bowl(g, 0, 0.66, 0.23);
      oval(g, silver, [0, 0.84, 0.23], [0.14, 0.055, 0.13]);
      gem(g, gold, [0, 0.91, 0.24], [0.04, 0.06, 0.035]);
      for (const s of [-1, 1]) tube(g, silver, [[s * 0.07, 0.90, 0.26], [s * 0.14, 1.04, 0.25],
        [s * 0.06, 1.16, 0.23], [s * 0.15, 1.27, 0.21]], 0.012);
    }],
    ['aloka', 'Light: a burning butter lamp', ruby, g => {
      arm(g, -1, [-0.16, 0.70, 0.18]); arm(g, 1, [0.16, 0.70, 0.18]);
      lamp(g, 0, 0.63, 0.23);
    }],
    ['gandha', 'Perfume: a vessel for scented water', emerald, g => {
      arm(g, -1, [-0.16, 0.73, 0.20]); arm(g, 1, [0.16, 0.87, 0.20]);
      const pot = vase(g, 0, 0.64, 0.22, 0.58);
      tube(pot, gold, [[-0.14, 0.37, 0], [-0.36, 0.56, 0], [-0.39, 0.71, 0]], 0.045);
      tube(pot, gold, [[0.13, 0.49, 0], [0.33, 0.50, 0], [0.33, 0.25, 0], [0.18, 0.22, 0]], 0.024);
      gem(pot, silver, [0, 0.72, 0], [0.09, 0.09, 0.07]);
    }]
  ];
  goddessBuilders.forEach(([id, attribute, robe, build]) => finish('goddess_' + id, attribute, g => {
    figure(g, robe, id === 'nritya' ? 'dance' : 'seated'); build(g);
  }));
  finish('sun', 'The sun with golden rays', g => {
    oval(g, sun, [0, 0, 0], [0.35, 0.35, 0.18]);
    ring(g, gold, 0.39, 0.025, [0, 0, 0]);
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6;
      gem(g, gold, [Math.sin(a) * 0.49, Math.cos(a) * 0.49, 0], [0.035, 0.10, 0.025]).rotation.z = -a;
    }
  });
  finish('moon', 'The moon as a silver-white disc', g => {
    oval(g, moon, [0, 0, 0], [0.39, 0.39, 0.12]);
    ring(g, silver, 0.42, 0.022, [0, 0, 0]);
    for (const [x, y, r] of [[-0.15, 0.14, 0.07], [0.09, -0.12, 0.10], [0.16, 0.16, 0.045]]) {
      oval(g, silver, [x, y, 0.10], [r, r * 0.8, 0.016]);
    }
  });
  finish('mandala_parasol', 'A white parasol with gold ribs and silk pendants', g => {
    lotus(g, 0.38); rod(g, gold, [0, 0.13, 0], [0, 1.35, 0], 0.028);
    const canopy = vessel(g, ivory, [[0.49, 0], [0.47, 0.07], [0.36, 0.20], [0.16, 0.31], [0.02, 0.34]], [0, 0.92, 0]);
    canopy.scale.z = 0.66;
    for (let i = -2; i <= 2; i++) {
      const x = i * 0.20;
      tube(g, gold, [[0, 1.26, 0.02], [x * 0.6, 1.12, 0.23], [x, 0.95, 0.28 - Math.abs(x) * 0.2]], 0.012);
      rod(g, i % 2 ? ruby : gold, [x, 0.93, 0.14], [x, 0.76 - (i % 2 ? 0.04 : 0), 0.14], 0.013);
      oval(g, gold, [x, 0.74 - (i % 2 ? 0.04 : 0), 0.14], [0.025, 0.038, 0.02]);
    }
    gem(g, gold, [0, 1.37, 0], [0.06, 0.10, 0.05]);
  });
  finish('mandala_banner', 'A tiered victory banner with long silk streamers', g => {
    lotus(g, 0.34); rod(g, gold, [0, 0.13, 0], [0, 1.42, 0], 0.025);
    for (let i = 0; i < 3; i++) {
      const y = 0.59 + i * 0.23, r = 0.26 - i * 0.025;
      vessel(g, i % 2 ? ruby : ivory, [[r, 0], [r, 0.19]], [0, y, 0], [1, 1, 0.6]);
      box(g, gold, [0, y + 0.19, 0.01], [r * 2.15, 0.032, r * 1.3]);
      for (const s of [-1, 1]) tube(g, i % 2 ? lapis : ruby, [[s * r, y + 0.14, 0],
        [s * (r + 0.10), y - 0.03, 0.03], [s * (r + 0.08), y - 0.26, 0.03]], 0.024);
    }
    gem(g, gold, [0, 1.38, 0], [0.08, 0.13, 0.06]);
  });
  geometries.forEach(geometry => geometry.dispose());
  return models;
}
