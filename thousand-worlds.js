/* ── A thousand worlds, three times over ─────────────────────────────────
   The drawing is one world system of a thousand million. The Kośa counts
   them in three powers of a thousand: a thousand four-continent worlds make
   a small chiliocosm, a thousand of those a middling one, and a thousand of
   those the great trichiliocosm that is the field of one buddha. The texts
   give the count and say nothing of the arrangement, so the arrangement here
   is the drawing's own: a cube of ten to a side, which is a thousand a reader
   can see for what it is, and then a cube of a thousand of those, and once
   more.

   Three orders, and at each one the thing that was whole a moment ago is one
   cell of the next. The world the page draws stays where it is, at the origin,
   and is one of the thousand — not the middle one, since ten to a side has no
   middle, and no world system is the centre. The 999 beside it are proxies:
   a disc, a rim, a Meru, a spire for the heavens that are its own, a sun and
   a moon. At the second order each of the 999 small chiliocosms is a cloud of
   a thousand sprites, one per world; at the third each middling chiliocosm is
   a cloud of a thousand sprites, one per small chiliocosm. Nothing is drawn
   at a size the eye could not see from where the eye then stands.

   The heavens of form that stand over more than one world are drawn as
   canopies: one second dhyāna over each thousand, one third over each
   million, one fourth — with the pure abodes — over the whole.

   The layout is plain arithmetic, so it is exported on its own and checked
   by tests/thousand-worlds.mjs without a browser; the builder takes three.js
   as an argument and touches no document beyond the canvas it is handed. */

export const SIDE = 10;                  // worlds to a side of every cube
export const HOME_CELL = 5;              // the cell, along each axis, that holds what was whole before
export const CUBE_GAP = 1.35;            // a cube's pitch, in edges of what it holds
export const WORLD_GAP = 1.3;            // a world's pitch, in spans of a world

/* The four stops of the presentation, in the order they zoom out. The entries
   themselves are written with the rest of the index in index.html. */
export const ORDERS = [
  { id: 'worlds_one', count: 1 },
  { id: 'worlds_small', count: 1e3 },
  { id: 'worlds_middling', count: 1e6 },
  { id: 'worlds_great', count: 1e9 }
];

/* Where the three cubes stand. `span` is the size of one world system — the
   larger of its width and its height — and `centre` the middle of it. Each
   order's cells sit at origin + (i − HOME_CELL) · pitch along every axis, so
   the home cell is at the origin and the cube's centre is half a pitch below
   and behind it; the next order takes that centre for its origin. */
export function planLayout({ span, centre = [0, 0, 0], side = SIDE, home = HOME_CELL,
                             cubeGap = CUBE_GAP, worldGap = WORLD_GAP } = {}) {
  if (!(span > 0)) throw new Error('planLayout needs the span of one world');
  const levels = [];
  let pitch = span * worldGap, origin = centre.slice();
  for (let order = 1; order <= 3; order++) {
    const edge = pitch * side;
    const shift = (side - 1) / 2 - home;                 // −0.5 for ten cells with the sixth at home
    const c = origin.map(v => v + shift * pitch);
    levels.push({ order, pitch, edge, origin, centre: c, radius: edge * Math.sqrt(3) / 2 });
    origin = c;
    pitch = edge * cubeGap;
  }
  return levels;
}

/* The 999 cells of a cube other than the home one, in pitches from the origin. */
export function cellOffsets(side = SIDE, home = HOME_CELL) {
  const out = [];
  for (let i = 0; i < side; i++) for (let j = 0; j < side; j++) for (let k = 0; k < side; k++) {
    if (i === home && j === home && k === home) continue;
    out.push([i - home, j - home, k - home]);
  }
  return out;
}

/* The thousand members of a cube, in pitches from the cube's centre. */
export function memberOffsets(side = SIDE) {
  const out = [], mid = (side - 1) / 2;
  for (let i = 0; i < side; i++) for (let j = 0; j < side; j++) for (let k = 0; k < side; k++) {
    out.push([i - mid, j - mid, k - mid]);
  }
  return out;
}

/* How far the eye stands to take in a cube: its bounding sphere in the smaller
   side of the free rectangle, with a little air round it. */
export function framingDistance(radius, { fov = 45, padding = 1.04, height = 1, rect = { w: 1, h: 1 } } = {}) {
  const half = Math.tan(fov * Math.PI / 360);
  return radius * padding / half * height / Math.max(1, Math.min(rect.w, rect.h));
}

const ease = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* A world seen from far off: a lapis disc inside a gold rim, painted small. */
function paintWorldSprite(canvas, ink) {
  const size = 64;
  canvas.width = size; canvas.height = size;
  const x = canvas.getContext && canvas.getContext('2d');
  if (!x) return;
  const c = size / 2;
  x.clearRect(0, 0, size, size);
  const sea = x.createRadialGradient(c, c, 0, c, c, c * 0.8);
  sea.addColorStop(0, ink.core);
  sea.addColorStop(0.55, ink.sea);
  sea.addColorStop(1, ink.shore);
  x.fillStyle = sea;
  x.beginPath(); x.arc(c, c, c * 0.8, 0, Math.PI * 2); x.fill();
  x.lineWidth = size * 0.06;
  x.strokeStyle = ink.rim;
  x.beginPath(); x.arc(c, c, c * 0.8, 0, Math.PI * 2); x.stroke();
  // a soft edge, so a cloud of these is a cloud and not a heap of coins
  const soft = x.createRadialGradient(c, c, c * 0.72, c, c, c);
  soft.addColorStop(0, 'rgba(0,0,0,0)');
  soft.addColorStop(1, 'rgba(0,0,0,1)');
  x.globalCompositeOperation = 'destination-out';
  x.fillStyle = soft;
  x.fillRect(0, 0, size, size);
  x.globalCompositeOperation = 'source-over';
}

export function createThousandWorlds(THREE, {
  span, centre = [0, 0, 0], rim, floor, summit, spireTop, fov = 45,
  meru = { halfTop: rim * 0.12, halfBase: rim * 0.18, seat: floor },
  luminaries = [],
  createCanvas = () => (typeof document === 'undefined' ? { width: 0, height: 0 } : document.createElement('canvas'))
} = {}) {
  const levels = planLayout({ span, centre });
  const group = new THREE.Group();
  group.name = 'thousand_worlds';
  group.visible = false;

  /* one pigment set for the proxies, taken from the world's own */
  const lit = (color, extra) => new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.05, ...(extra || {}) });
  const plain = (color, opacity, extra) => new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide, ...(extra || {}) });
  const sprite = ink => {
    const canvas = createCanvas();
    paintWorldSprite(canvas, ink);
    const t = new THREE.CanvasTexture(canvas);
    if ('colorSpace' in t) t.colorSpace = THREE.SRGBColorSpace;
    return t;
  };

  /* A layer is one order's worth of drawing, made the first time it is asked
     for, faded in over the flight that reveals it and out over the one that
     puts it away. Every material in it is listed with the opacity it stands
     at when fully shown. */
  const layers = [null, null, null, null];
  const state = { level: 0 };
  const fading = [];

  const quiet = o => { o.raycast = () => {}; o.castShadow = false; o.receiveShadow = false; o.frustumCulled = false; };

  /* the cube's outline and the canopy over it, at any order */
  function frame(L, canopyOpacity) {
    const g = new THREE.Group(), mats = [];
    const box = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(L.edge, L.edge, L.edge)),
      new THREE.LineBasicMaterial({ color: 0x9db1cc, transparent: true, opacity: 0.2 }));
    box.position.set(...L.centre);
    mats.push([box.material, 0.2]);
    const canopy = new THREE.Mesh(new THREE.PlaneGeometry(L.edge * 0.92, L.edge * 0.92), plain(0xd6e3f5, canopyOpacity));
    canopy.rotation.x = -Math.PI / 2;
    canopy.position.set(L.centre[0], L.centre[1] + L.edge / 2 + L.pitch * 0.28, L.centre[2]);
    mats.push([canopy.material, canopyOpacity]);
    g.add(box, canopy);
    return { g, mats };
  }

  /* first order: 999 worlds, each a disc, a rim, a Meru, a spire, a sun and a moon */
  function worldLayer() {
    const L = levels[0], g = new THREE.Group(), mats = [];
    const cells = cellOffsets();
    const parts = [
      [new THREE.CylinderGeometry(rim, rim, Math.max(0.001, -floor), 48, 1), lit(0x2d5a86), [0, floor / 2, 0]],
      [new THREE.TorusGeometry(rim, rim * 0.014, 6, 96).rotateX(Math.PI / 2), lit(0x8f7a4a, { metalness: 0.2 }), [0, 0, 0]],
      [new THREE.CylinderGeometry(meru.halfTop * Math.SQRT2, meru.halfBase * Math.SQRT2, summit - meru.seat, 4).rotateY(Math.PI / 4),
        lit(0xd2a64a, { metalness: 0.15 }), [0, (summit + meru.seat) / 2, 0]],
      [new THREE.CylinderGeometry(rim * 0.012, rim * 0.05, Math.max(0.001, spireTop - summit), 6),
        lit(0xe4d9c2), [0, (spireTop + summit) / 2, 0]]
    ];
    luminaries.forEach((l, i) => parts.push([
      new THREE.SphereGeometry(l.r, 12, 8),
      new THREE.MeshBasicMaterial({ color: i === 0 ? 0xf3b23a : 0xeef2f8 }),
      [l.x, l.y, l.z]
    ]));
    const m = new THREE.Matrix4();
    for (const [geometry, material, at] of parts) {
      const mesh = new THREE.InstancedMesh(geometry, material, cells.length);
      cells.forEach((cell, i) => {
        m.makeTranslation(cell[0] * L.pitch + at[0], cell[1] * L.pitch + at[1], cell[2] * L.pitch + at[2]);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mats.push([material, 1]);
      g.add(mesh);
    }
    const f = frame(L, 0.16);
    g.add(f.g); mats.push(...f.mats);
    return { g, mats };
  }

  /* second and third orders: a thousand clouds of a thousand sprites each —
     the home cell among them, since from here what it holds is a speck like
     the rest — a canopy over each of the other 999, and the outline and
     canopy of the whole */
  function cloudLayer(order, ink, memberSpan, opacity) {
    const L = levels[order - 1], inner = levels[order - 2];
    const g = new THREE.Group(), mats = [];
    const cells = cellOffsets(), members = memberOffsets();
    // Share one thousand-member lattice across one thousand instances. Storing
    // all million sums costs 12 MB per cloud on both CPU and GPU; these two
    // attributes need only 24 KB while preserving every member and its position.
    const positions = new Float32Array(members.length * 3);
    members.forEach((w, i) => w.forEach((v, axis) => { positions[i * 3 + axis] = v * inner.pitch; }));
    const offsets = new Float32Array((cells.length + 1) * 3);
    [[0, 0, 0], ...cells].forEach((cell, i) => cell.forEach((v, axis) => {
      offsets[i * 3 + axis] = L.origin[axis] + v * L.pitch;
    }));
    const geometry = new THREE.InstancedBufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('cloudOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    geometry.instanceCount = cells.length + 1;
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(...L.centre), L.radius * 1.05);
    const material = new THREE.PointsMaterial({
      map: sprite(ink), size: memberSpan / Math.tan(fov * Math.PI / 360), sizeAttenuation: true,
      transparent: true, depthWrite: false, alphaTest: 0.08, color: 0xffffff
    });
    material.onBeforeCompile = shader => {
      shader.uniforms.cloudEdge = { value: L.edge };
      shader.uniforms.cloudCentre = { value: new THREE.Vector3(...L.centre) };
      shader.vertexShader = 'attribute vec3 cloudOffset; uniform float cloudEdge; uniform vec3 cloudCentre; varying float cloudDepth; varying float cloudTint; varying float cloudCoverage;\n' + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
        '#include <begin_vertex>\ntransformed += cloudOffset;');
      shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
        #include <project_vertex>
        float centreDepth = (modelViewMatrix * vec4(cloudCentre, 1.0)).z;
        cloudDepth = clamp(.5 + (mvPosition.z - centreDepth) / cloudEdge, 0., 1.);
        cloudTint = fract(sin(dot(cloudOffset / cloudEdge, vec3(12.9898,78.233,39.425))) * 43758.5453);
      `);
      // WebGL clamps subpixel points to a full pixel. Compensate their opacity
      // by projected area so small phone views retain depth instead of filling in.
      shader.vertexShader = shader.vertexShader.replace('#include <logdepthbuf_vertex>',
        'cloudCoverage = min(1., gl_PointSize * gl_PointSize);\n#include <logdepthbuf_vertex>');
      shader.fragmentShader = 'varying float cloudDepth; varying float cloudTint; varying float cloudCoverage;\n' + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_fragment>',
        '#include <alphatest_fragment>\ndiffuseColor.a *= cloudCoverage;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', `
        #include <color_fragment>
        vec3 distant = vec3(.22, .40, .73);
        vec3 near = mix(vec3(.64,.83,1.), vec3(1.,.78,.42), cloudTint * .7);
        diffuseColor.rgb *= mix(distant, near, cloudDepth);
        diffuseColor.a *= .3 + .7 * cloudDepth;
      `);
    };
    material.customProgramCacheKey = () => 'world-cloud-instances-depth-v3';
    const points = new THREE.Points(geometry, material);
    mats.push([material, opacity]);   // thinner the further out, so the cubes within can be seen
    g.add(points);
    /* the heaven each cloud shares: a canopy the size of the cube it stands over */
    const canopyMat = plain(0x94bce8, 0.025);
    const canopies = new THREE.InstancedMesh(
      new THREE.PlaneGeometry(inner.edge * 0.92, inner.edge * 0.92).rotateX(-Math.PI / 2), canopyMat, cells.length);
    const m = new THREE.Matrix4();
    cells.forEach((cell, i) => {
      m.makeTranslation(L.origin[0] + cell[0] * L.pitch,
        L.origin[1] + cell[1] * L.pitch + inner.edge / 2 + inner.pitch * 0.28,
        L.origin[2] + cell[2] * L.pitch);
      canopies.setMatrixAt(i, m);
    });
    canopies.instanceMatrix.needsUpdate = true;
    mats.push([canopyMat, 0.025]);
    g.add(canopies);
    const f = frame(L, 0.045);
    g.add(f.g); mats.push(...f.mats);
    // The previously explored systems stay visible as nested golden outlines.
    // This is their true location and scale, using only 24 vertices per outline.
    for (let n = 0; n < order - 1; n++) {
      const home = levels[n];
      const outline = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(home.edge, home.edge, home.edge)),
        new THREE.LineBasicMaterial({color: 0xffd585, transparent:true, opacity:.85, depthWrite:false}));
      outline.position.set(...home.centre);
      g.add(outline); mats.push([outline.material,.85]);
    }
    return { g, mats };
  }

  const WORLD_INK = { core: '#5a8ec4', sea: '#2d5a86', shore: '#1f4468', rim: '#c9a862' };
  const CUBE_INK = { core: '#e9eef7', sea: '#b9c9e2', shore: '#8fa6c6', rim: '#d5dcea' };
  function layer(order) {
    if (layers[order]) return layers[order];
    const made = order === 1 ? worldLayer()
      : order === 2 ? cloudLayer(2, WORLD_INK, rim * 2, 0.9)
      : cloudLayer(3, CUBE_INK, levels[0].edge * 0.34, 0.88);
    made.order = order;
    made.g.traverse(quiet);
    made.g.visible = false;
    made.k = 0;
    made.mats.forEach(([material]) => { material.opacity = 0; material.transparent = true; });
    group.add(made.g);
    layers[order] = made;
    return made;
  }

  function place(made, k) {
    made.k = k;
    made.mats.forEach(([material, full]) => { material.opacity = full * k; });
    made.g.visible = k > 0;
  }

  // Release hidden layers, including instance buffers and sprite textures.
  // Re-entering an order rebuilds its small shared geometry on demand.
  function release(made) {
    group.remove(made.g);
    const materials = new Set();
    made.g.traverse(o => {
      o.geometry?.dispose();
      if (o.isInstancedMesh) o.dispose();
      if (o.material) materials.add(o.material);
    });
    materials.forEach(m => { m.map?.dispose(); m.dispose(); });
    layers[made.order] = null;
  }

  /* Only the current order is needed: its home cloud already represents the
     smaller orders. Keep the outgoing layer only for the crossfade. */
  function setLevel(level, { instant = false, dur = 900 } = {}) {
    const next = Math.max(0, Math.min(3, Math.floor(level)));
    state.level = next;
    group.visible = true;
    for (let order = 1; order <= 3; order++) {
      const want = order === next ? 1 : 0;
      const made = want ? layer(order) : layers[order];
      if (!made) continue;
      for (let i = fading.length - 1; i >= 0; i--) if (fading[i].made === made) fading.splice(i, 1);
      if (instant || dur <= 0 || made.k === want) {
        place(made, want);
        if (!want) release(made);
        continue;
      }
      fading.push({ made, from: made.k, to: want, t0: null, dur });
    }
    if (!fading.length && next === 0) group.visible = false;
    return fading.length > 0;
  }

  /* Advance the fades. Returns true while any is still running. */
  function tick(now) {
    if (!fading.length) return false;
    for (let i = fading.length - 1; i >= 0; i--) {
      const f = fading[i];
      if (f.t0 === null) f.t0 = now;
      const k = Math.min(1, (now - f.t0) / f.dur);
      place(f.made, f.from + (f.to - f.from) * ease(k));
      if (k >= 1) {
        fading.splice(i, 1);
        if (f.to === 0) release(f.made);
      }
    }
    if (!fading.length && state.level === 0) group.visible = false;
    return fading.length > 0;
  }

  return {
    group, levels, ORDERS, setLevel, tick,
    get level() { return state.level; },
    get fading() { return fading.length > 0; },
    built: order => !!layers[order]
  };
}
