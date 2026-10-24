/* The end of the game, in the world.
 *
 * When a traveller reaches Nirvana the way there is lit, in the order it is
 * climbed: a light runs up each strand of the helix from the human ground, the
 * two meet in the crown of the acts of a Buddha, and a column of light rises
 * from the crown to the stupa. The stupa then blazes: a glow behind it, rays
 * turning slowly about it, the light in its niche round the Buddha brightened,
 * rings of rainbow light spreading from it over the world — the body of light
 * — and a rain of flowers falling about it, as the gods let fall at the
 * Buddha's awakening. After a while all of that settles into a quiet glow
 * that stays until the next game. The stupa throw that places the relics has
 * its own small moment: a mote of light comes down into the dome.
 *
 * Everything is made here: the textures are painted on canvases, the rest is
 * lines, sprites, rings and points. Nothing is built until the first finale.
 * `tick(now)` moves it and says whether it wants another frame; with reduced
 * motion the finale is shown already settled.
 */

const TAU = Math.PI * 2;
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const smooth = (x) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const window_ = (t, a, b, fade = 0.4) => smooth((t - a) / fade) * (1 - smooth((t - b) / fade));

// the timeline, in seconds from the arrival
export const FINALE = {
  climb: [0, 3.0],        // the light runs up both strands
  crown: [2.9, 3.8],      // and round the crown
  column: [3.6, 4.3],     // and up the axis to the stupa
  bloom: 4.1,             // the stupa blazes
  rings: [4.3, 5.1, 5.9], // the rainbow rings, each spreading for RING_LIFE
  flowers: [4.4, 13.0],   // the rain of flowers
  settle: [12.5, 15.0],   // all of it settles into the quiet glow
  end: 15.0
};
const RING_LIFE = 3.4;
const FLOWERS = 180;

/** How far through each part of the finale a moment is: pure, and tested. */
export function finaleState(t) {
  const span = ([a, b]) => clamp((t - a) / (b - a));
  const settled = smooth((t - FINALE.settle[0]) / (FINALE.settle[1] - FINALE.settle[0]));
  return {
    climb: smooth(span(FINALE.climb)),
    crown: smooth(span(FINALE.crown)),
    column: smooth(span(FINALE.column)),
    // the column gives way once the stupa has taken the light
    beam: 1 - smooth((t - FINALE.bloom - 0.6) / 1.6),
    bloom: smooth((t - FINALE.bloom) / 1.2),
    rings: FINALE.rings.map((a) => clamp((t - a) / RING_LIFE)),
    flowers: window_(t, FINALE.flowers[0], FINALE.flowers[1], 1.2),
    trails: 1 - settled,
    // what stays once it has settled: a soft glow, the rays faint and still
    glow: 0.35 + 0.65 * (1 - settled),
    done: t >= FINALE.end
  };
}

function canvasTexture(THREE, size, paint) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const g = canvas.getContext('2d');
  if (g) paint(g, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// a soft round light, warm at the heart
function glowTexture(THREE) {
  return canvasTexture(THREE, 128, (g, s) => {
    const r = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    r.addColorStop(0, 'rgba(255,250,230,1)');
    r.addColorStop(0.18, 'rgba(255,233,168,0.85)');
    r.addColorStop(0.5, 'rgba(255,205,110,0.28)');
    r.addColorStop(1, 'rgba(255,190,90,0)');
    g.fillStyle = r; g.fillRect(0, 0, s, s);
  });
}

// rays of two lengths, alternating, fading outward
function raysTexture(THREE) {
  return canvasTexture(THREE, 512, (g, s) => {
    const c = s / 2;
    g.translate(c, c);
    for (let i = 0; i < 36; i += 1) {
      const a = i / 36 * TAU, long = i % 2 === 0, len = c * (long ? 0.98 : 0.7), w = long ? 0.034 : 0.022;
      const grad = g.createLinearGradient(0, 0, Math.cos(a) * len, Math.sin(a) * len);
      grad.addColorStop(0, 'rgba(255,240,190,0)');
      grad.addColorStop(0.18, 'rgba(255,236,170,0.9)');
      grad.addColorStop(1, 'rgba(255,214,120,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(Math.cos(a - w) * len, Math.sin(a - w) * len);
      g.lineTo(Math.cos(a + w) * len, Math.sin(a + w) * len);
      g.closePath(); g.fill();
    }
  });
}

// a flower of five petals with a golden heart, white so the points tint it
function flowerTexture(THREE) {
  return canvasTexture(THREE, 64, (g, s) => {
    g.translate(s / 2, s / 2);
    for (let i = 0; i < 5; i += 1) {
      g.save();
      g.rotate(i / 5 * TAU);
      const grad = g.createLinearGradient(0, 0, 0, -s * 0.44);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(1, 'rgba(255,255,255,0.75)');
      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(0, -s * 0.22, s * 0.13, s * 0.22, 0, 0, TAU);
      g.fill();
      g.restore();
    }
    g.fillStyle = 'rgba(255,214,90,1)';
    g.beginPath(); g.arc(0, 0, s * 0.08, 0, TAU); g.fill();
  });
}

/* A flat ring coloured across its width in the order of the rainbow, as the
   painters draw the body of light. */
function rainbowRing(THREE, inner, outer) {
  const bands = ['#d8473a', '#e9893a', '#f1cf4a', '#5fae5a', '#4a86c9', '#7a5bb0'];
  const geometry = new THREE.RingGeometry(inner, outer, 96, bands.length);
  const colours = [], c = new THREE.Color(), p = geometry.attributes.position;
  for (let i = 0; i < p.count; i += 1) {
    const r = Math.hypot(p.getX(i), p.getY(i));
    const k = Math.round((r - inner) / (outer - inner) * (bands.length - 1));
    c.set(bands[Math.max(0, Math.min(bands.length - 1, k))]).convertSRGBToLinear();
    colours.push(c.r, c.g, c.b);
  }
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

/**
 * `board` is the board layer (rebirth-board.js), `models` the square models
 * (square-models.js); `paths` are the threads' points, world-relative to the
 * board group: { tantra, sutra, crown }.
 */
export function createNirvanaFinale(THREE, { board, models, SUMMIT, VICTORY, paths, invalidate = () => {} }) {
  let built = null, start = null, relicStart = null, reduced = false;

  function build() {
    const group = new THREE.Group();
    group.name = 'nirvana_finale';
    group.visible = false;
    const additive = (o) => ({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, ...o });
    const glowMap = glowTexture(THREE);

    // the light running up each strand, and round the crown
    const trail = (points, color) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(p.x, p.y, p.z)));
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial(additive({ color, opacity: 0.95 })));
      line.renderOrder = 12; line.frustumCulled = false; line.raycast = () => {};
      const head = new THREE.Sprite(new THREE.SpriteMaterial(additive({ map: glowMap, color, depthTest: false })));
      head.scale.setScalar(SUMMIT * 0.32);
      head.renderOrder = 13;
      group.add(line, head);
      return { line, head, points, count: points.length };
    };
    const trails = [trail(paths.tantra, 0xffd7a0), trail(paths.sutra, 0xd4e4ff)];
    const crown = trail(paths.crown, 0xfff0b8);

    // the column from the crown to the stupa
    const top = board.positionOf(VICTORY).clone();
    const crownAt = new THREE.Vector3(0, paths.crown[0].y, 0);
    const columnGeometry = new THREE.CylinderGeometry(SUMMIT * 0.012, SUMMIT * 0.03, 1, 16, 1, true);
    columnGeometry.translate(0, 0.5, 0);
    const column = new THREE.Mesh(columnGeometry, new THREE.MeshBasicMaterial(additive({ color: 0xffe9b0, opacity: 0.55, side: THREE.DoubleSide })));
    column.position.copy(crownAt);
    column.renderOrder = 12; column.raycast = () => {};
    group.add(column);

    // about the stupa: its glow, its rays, the light in its niche
    const unit = SUMMIT * 0.14 * 2.6;          // the stupa's model unit (square-models.js)
    const heart = top.clone().add(new THREE.Vector3(0, SUMMIT * 0.1 + unit * 0.42, 0));
    // behind the stupa, not over it: the stupa's own surfaces hide its middle
    const glow = new THREE.Sprite(new THREE.SpriteMaterial(additive({ map: glowMap, color: 0xffe2a0 })));
    glow.position.copy(heart); glow.renderOrder = 4;
    const rays = new THREE.Sprite(new THREE.SpriteMaterial(additive({ map: raysTexture(THREE), color: 0xffe7a8 })));
    rays.position.copy(heart); rays.renderOrder = 4;
    const niche = new THREE.Sprite(new THREE.SpriteMaterial(additive({ map: glowMap, color: 0xffd27a, depthTest: false })));
    niche.renderOrder = 14;
    group.add(glow, rays, niche);

    // the rainbow rings, spreading level from the stupa's foot
    const ringGeometry = rainbowRing(THREE, 0.86, 1);
    const rings = FINALE.rings.map(() => {
      // drawn over the sky as it is: added light would turn a bright sky white
      const ring = new THREE.Mesh(ringGeometry, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true,
        opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      ring.position.copy(top).add(new THREE.Vector3(0, SUMMIT * 0.12, 0));
      ring.renderOrder = 11; ring.raycast = () => {};
      group.add(ring);
      return ring;
    });

    // the rain of flowers
    const seeds = Array.from({ length: FLOWERS }, (_, i) => {
      const r = Math.sqrt((i * 0.618034) % 1), a = i * 2.39996;
      return { r, a, phase: (i * 0.3819) % 1, speed: 0.75 + ((i * 0.7548) % 1) * 0.5, spin: ((i * 0.5698) % 1) - 0.5 };
    });
    const flowerGeometry = new THREE.BufferGeometry();
    const flowerPositions = new Float32Array(FLOWERS * 3), flowerColours = new Float32Array(FLOWERS * 3);
    const tint = new THREE.Color();
    const tints = ['#f6c6d0', '#fff6e0', '#f7d36b', '#e88aa0', '#ffffff', '#f2a65a'];
    seeds.forEach((_, i) => { tint.set(tints[i % tints.length]).convertSRGBToLinear(); flowerColours.set([tint.r, tint.g, tint.b], i * 3); });
    flowerGeometry.setAttribute('position', new THREE.BufferAttribute(flowerPositions, 3));
    flowerGeometry.setAttribute('color', new THREE.BufferAttribute(flowerColours, 3));
    const flowers = new THREE.Points(flowerGeometry, new THREE.PointsMaterial({
      map: flowerTexture(THREE), size: SUMMIT * 0.06, vertexColors: true, transparent: true,
      opacity: 0, depthWrite: false, alphaTest: 0.05
    }));
    flowers.frustumCulled = false; flowers.renderOrder = 12; flowers.raycast = () => {};
    group.add(flowers);

    // the relics, coming down into the dome
    const relic = new THREE.Sprite(new THREE.SpriteMaterial(additive({ map: glowMap, color: 0xfff2c8, depthTest: false })));
    relic.renderOrder = 14; relic.visible = false;
    group.add(relic);

    board.group.add(group);
    return { group, trails, crown, column, top, crownAt, heart, unit, glow, rays, niche, rings, seeds, flowers, flowerPositions, relic };
  }

  const at = new THREE.Vector3();
  function placeAlong(trail, k) {
    const n = Math.max(2, Math.round(k * (trail.count - 1)) + 1);
    trail.line.geometry.setDrawRange(0, k > 0 ? n : 0);
    const p = trail.points[Math.min(trail.count - 1, n - 1)];
    trail.head.position.set(p.x, p.y, p.z);
    trail.head.visible = k > 0 && k < 1;
  }

  // the niche's light stays in front of the niche as the stupa turns to the eye
  function placeNiche(b) {
    const model = models.models.get(VICTORY);
    b.niche.position.copy(b.heart);
    if (model) {
      const a = model.rotation.y;
      b.niche.position.x += Math.sin(a) * b.unit * 0.19;
      b.niche.position.z += Math.cos(a) * b.unit * 0.19;
      b.niche.position.y = b.heart.y - b.unit * 0.02;
    }
  }

  function render(t, now) {
    const b = built, s = finaleState(t);
    b.trails.forEach((trail) => { placeAlong(trail, s.climb); trail.line.material.opacity = 0.95 * s.trails; });
    placeAlong(b.crown, s.crown);
    b.crown.line.material.opacity = 0.95 * s.trails;
    const span = b.top.y + SUMMIT * 0.1 - b.crownAt.y;
    b.column.visible = s.column > 0 && s.beam > 0;
    b.column.scale.set(1, Math.max(1e-3, span * s.column), 1);
    b.column.material.opacity = 0.32 * s.beam;
    // the stupa's own light, breathing a little while the finale lasts
    const breathe = 1 + 0.05 * Math.sin(now / 600) * s.trails;
    b.glow.scale.setScalar(b.unit * 2.4 * s.bloom * breathe);
    b.glow.material.opacity = 0.7 * s.glow * s.bloom;
    b.rays.scale.setScalar(b.unit * 3.4 * (0.6 + 0.4 * s.bloom));
    b.rays.material.opacity = 0.6 * s.glow * s.bloom;
    b.rays.material.rotation = t / 9;
    placeNiche(b);
    b.niche.scale.setScalar(b.unit * 0.32 * s.bloom * breathe);
    b.niche.material.opacity = 0.85 * s.bloom * (0.5 + 0.5 * s.glow);
    b.rings.forEach((ring, i) => {
      const k = s.rings[i];
      ring.visible = k > 0 && k < 1;
      ring.scale.setScalar(SUMMIT * (0.4 + 5.2 * (1 - (1 - k) ** 2)));
      ring.material.opacity = 0.55 * Math.sin(Math.PI * k) ** 0.8;
    });
    // each flower falls round and round from above the stupa to below it
    b.flowers.visible = s.flowers > 0;
    b.flowers.material.opacity = s.flowers;
    if (b.flowers.visible) {
      const fall = SUMMIT * 2.6, radius = SUMMIT * 1.4;
      b.seeds.forEach((seed, i) => {
        const k = (seed.phase + t * 0.09 * seed.speed) % 1;
        const a = seed.a + k * TAU * 0.6 * Math.sign(seed.spin || 1) + Math.sin(t * 1.3 + i) * 0.08;
        const r = radius * (0.2 + 0.8 * seed.r) * (1 + 0.15 * k);
        b.flowerPositions[i * 3] = b.top.x + Math.cos(a) * r;
        b.flowerPositions[i * 3 + 1] = b.top.y + SUMMIT * 1.6 - k * fall;
        b.flowerPositions[i * 3 + 2] = b.top.z + Math.sin(a) * r;
      });
      b.flowers.geometry.attributes.position.needsUpdate = true;
    }
  }

  function renderRelic(now) {
    const b = built, k = clamp((now - relicStart) / 2200);
    const fall = smooth(clamp(k / 0.7)), flash = clamp((k - 0.7) / 0.3);
    b.relic.visible = k < 1;
    b.relic.position.copy(b.heart).add(at.set(0, b.unit * (1.6 * (1 - fall) + 0.05), 0));
    b.relic.scale.setScalar(b.unit * (0.22 + 0.9 * Math.sin(Math.PI * flash)));
    b.relic.material.opacity = flash ? 1 - flash * flash : 0.95;
    return k < 1;
  }

  return {
    /** The finale, from the beginning. `quiet` shows it already settled. */
    play({ quiet = false } = {}) {
      built ||= build();
      reduced = quiet;
      built.group.visible = true;
      start = performance.now() - (quiet ? FINALE.end * 1000 : 0);
      render(quiet ? FINALE.end : 0, performance.now());
      invalidate(3);
    },
    /** The relics placed in the stupa, after the victory. */
    relics({ quiet = false } = {}) {
      if (!built || quiet) return;
      relicStart = performance.now();
      invalidate(3);
    },
    /** Put it all away, for a new game. */
    reset() {
      start = relicStart = null;
      if (built) built.group.visible = false;
      invalidate(2);
    },
    /** Move it on. True while it wants to be drawn again. */
    tick(now = performance.now()) {
      if (!built || start === null) return false;
      const t = (now - start) / 1000;
      render(Math.min(t, FINALE.end), now);
      let more = t < FINALE.end && !reduced;
      if (relicStart !== null) {
        if (renderRelic(now)) more = true; else relicStart = null;
      }
      return more;
    },
    active: () => start !== null,
    playing: () => start !== null && !reduced && (performance.now() - start) / 1000 < FINALE.end,
    get object() { return built?.group || null; }
  };
}
