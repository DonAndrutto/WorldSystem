/* The twenty-eight lunar mansions in the world: one camera-facing sprite each,
 * on a horizontal ring outside the luminaries' circuit, at the height the sun
 * and moon travel. The ring is illustrative (lunar-mansions.js, ringAngle):
 * equal places, grouped by the White Beryl's elemental directions. It is not
 * a sky chart and the calculator never reads positions from it.
 *
 * What the layer owns it disposes: one SpriteMaterial and one texture per
 * glyph, the selection ring's material and its canvas texture. It owns no
 * geometry (THREE.Sprite shares one quad across every sprite in the page) and
 * touches nothing else in the scene. Textures are requested the first time
 * the layer is shown and kept while it is hidden, so turning it off and on
 * again costs nothing; nothing is uploaded per frame.
 *
 * Picking is the layer's own. It answers only while the layer is shown, it
 * tests only its own sprites, and it takes a hit only inside the glyph's
 * round medallion — the corners of each square texture are transparent and
 * are not the glyph, so a tap there passes through to whatever is behind.
 */

export const PICK_RADIUS = 0.49;        // of the quad: the medallion, not its corners

export function createMansionLayer({ THREE, mansions, ringAngle, radius, height, size, urlOf, loadTexture }) {
  const group = new THREE.Group();
  group.name = 'lunar_mansions';
  group.visible = false;
  const sprites = [];
  const byId = new Map();
  const load = loadTexture || ((url) => new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, resolve, undefined, reject);
  }));

  for (const m of mansions) {
    const material = new THREE.SpriteMaterial({
      transparent: true, depthWrite: false, depthTest: true,
      toneMapped: false, fog: false, opacity: 0
    });
    material.name = 'mansion_' + m.id;
    const sprite = new THREE.Sprite(material);
    const a = ringAngle(m.order);
    sprite.position.set(Math.sin(a) * radius, height, Math.cos(a) * radius);
    sprite.scale.setScalar(size);
    sprite.name = m.id;
    sprite.renderOrder = 31;
    sprite.castShadow = false; sprite.receiveShadow = false;
    sprite.userData.mansion = m.id;
    group.add(sprite);
    sprites.push(sprite);
    byId.set(m.id, sprite);
  }

  /* the selection: a gold ring behind the chosen glyph, and the glyph drawn
     a little larger. Nothing else changes, so the others stay as legible. */
  let ringTexture = null;
  const ringMaterial = new THREE.SpriteMaterial({
    transparent: true, depthWrite: false, depthTest: true, toneMapped: false, fog: false
  });
  ringMaterial.name = 'mansion_selection';
  const ring = new THREE.Sprite(ringMaterial);
  ring.name = 'lunar_mansion_selection';
  ring.visible = false;
  ring.renderOrder = 30;
  ring.raycast = () => {};
  group.add(ring);
  function paintRing() {
    if (ringTexture || typeof document === 'undefined') return;
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const x = c.getContext('2d');
    if (!x) return;
    x.strokeStyle = 'rgba(214,160,52,0.95)';
    x.lineWidth = 12;
    x.beginPath(); x.arc(128, 128, 116, 0, Math.PI * 2); x.stroke();
    x.strokeStyle = 'rgba(255,246,214,0.9)';
    x.lineWidth = 4;
    x.beginPath(); x.arc(128, 128, 104, 0, Math.PI * 2); x.stroke();
    ringTexture = new THREE.CanvasTexture(c);
    ringTexture.colorSpace = THREE.SRGBColorSpace;
    ringMaterial.map = ringTexture;
    ringMaterial.needsUpdate = true;
  }

  let loading = null, loaded = 0, failed = [];
  function ensureLoaded() {
    if (loading) return loading;
    // only what is not already here: a retry asks again for the failures alone
    loading = Promise.all(sprites.filter((sprite) => !sprite.material.map).map((sprite) => load(urlOf(sprite.name)).then((texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = 4;
      sprite.material.map = texture;
      sprite.material.opacity = 1;
      sprite.material.needsUpdate = true;
      loaded++;
    }, () => { failed.push(sprite.name); }))).then(() => {
      // a glyph that did not arrive can be asked for again
      if (failed.length) loading = null;
      const out = { loaded, failed: failed.slice() };
      failed = [];
      return out;
    });
    return loading;
  }

  let selected = null;
  function select(id) {
    const prev = selected && byId.get(selected);
    if (prev) prev.scale.setScalar(size);
    selected = id && byId.has(id) ? id : null;
    const s = selected && byId.get(selected);
    ring.visible = !!s;
    if (s) {
      paintRing();
      s.scale.setScalar(size * 1.28);
      ring.position.copy(s.position);
      ring.scale.setScalar(size * 1.5);
    }
  }

  /* only the shown layer, only its own sprites, only inside the medallion.
     The caller compares the distance with the world's own nearest hit, so a
     glyph behind Meru is not picked through the mountain. */
  const _hits = [];
  function pick(raycaster) {
    if (!group.visible) return null;
    _hits.length = 0;
    raycaster.intersectObjects(sprites, false, _hits);
    for (const hit of _hits) {
      if (!hit.object.material.map) continue;                     // not drawn yet
      const u = hit.uv.x - 0.5, v = hit.uv.y - 0.5;
      if (u * u + v * v > PICK_RADIUS * PICK_RADIUS) continue;     // a transparent corner
      return { id: hit.object.name, distance: hit.distance, point: hit.point.clone() };
    }
    return null;
  }

  function setVisible(on) {
    group.visible = !!on;
    if (on) ensureLoaded();
  }

  /* night: the medallions come down a little, so they do not outshine the moon */
  function setNight(on) {
    const k = on ? 0.82 : 1;
    sprites.forEach((s) => s.material.color.setScalar(k));
  }

  function centreOf(id) { return byId.get(id)?.position.clone() || null; }

  function dispose() {
    sprites.forEach((s) => { s.material.map?.dispose(); s.material.dispose(); });
    ringTexture?.dispose();
    ringMaterial.dispose();
    group.removeFromParent();
    group.clear();
    sprites.length = 0;
    byId.clear();
    loading = null;
  }

  return {
    group, sprites, byId, size, radius, height,
    get selected() { return selected; },
    get loadedCount() { return loaded; },
    ensureLoaded, setVisible, select, pick, setNight, centreOf, dispose
  };
}
