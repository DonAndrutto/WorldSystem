// Run with Node and three@0.184.0 installed for development (as the other
// geometry suites are). Real three.js sprites, cameras and raycasting; the
// textures are stand-ins, since nothing here is drawn.
//
// The layer as the page builds it: 28 sprites on the ring, the ring's
// directions, picking from many angles — inside the medallion, not in the
// transparent corners, never while hidden — the
// selection, the lazy and retried loading, and disposal of what it owns only.
import path from 'node:path';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const { MANSIONS, ringAngle, directionOfAngle } = await import(pathToFileURL(path.join(repo, 'mansion-layer.js')).href.replace('mansion-layer.js', 'lunar-mansions.js'));
const { createMansionLayer, PICK_RADIUS } = await import(pathToFileURL(path.join(repo, 'mansion-layer.js')));
const checks = [];
const ok = (note) => checks.push(note);

const RADIUS = 1.4, HEIGHT = 0.4, SIZE = 0.16;
const requested = [];
let failOnce = new Set(['lm_mchu']);
const textures = [];
const loadTexture = async (url) => {
  requested.push(url);
  const id = url.match(/(lm_[a-z_]+)\.webp$/)[1];
  if (failOnce.has(id)) { failOnce.delete(id); throw new Error('offline'); }
  const t = new THREE.Texture(); textures.push(t); return t;
};
const make = () => createMansionLayer({ THREE, mansions: MANSIONS, ringAngle, radius: RADIUS, height: HEIGHT, size: SIZE,
  urlOf: (id) => 'assets/mansions/' + id + '.webp', loadTexture });
const layer = make();
const scene = new THREE.Scene();
scene.add(layer.group);

/* ── the ring ───────────────────────────────────────────────────────────── */
assert.equal(layer.sprites.length, 28);
assert.equal(new Set(layer.sprites.map((s) => s.name)).size, 28);
for (const s of layer.sprites) {
  const m = MANSIONS.find((x) => x.id === s.name);
  assert.ok(Math.abs(Math.hypot(s.position.x, s.position.z) - RADIUS) < 1e-9);
  assert.equal(s.position.y, HEIGHT);
  assert.equal(directionOfAngle(Math.atan2(s.position.x, s.position.z)), m.direction, s.name + ' stands in its direction');
  assert.ok(s.material.isSpriteMaterial && s.material.transparent && !s.material.depthWrite && s.material.depthTest);
}
// east is +x and south +z, as the luminaries and continents have it
const east = layer.sprites.filter((s) => MANSIONS.find((x) => x.id === s.name).direction === 'E');
assert.ok(east.every((s) => s.position.x > 0.9 * RADIUS * Math.cos(Math.PI / 4.9)));
ok('28 camera-facing sprites on the ring, each in its source direction (east +x, south +z), transparent and depth-tested');

/* ── hidden: nothing requested, nothing picked ──────────────────────────── */
const ray = new THREE.Raycaster();
const camera = new THREE.PerspectiveCamera(45, 1.5, 0.01, 100);
const aim = (from, at) => {
  camera.position.copy(from); camera.lookAt(at); camera.updateMatrixWorld(); camera.updateProjectionMatrix();
  // what the renderer would do in a frame: the view matrices of what it draws
  scene.updateMatrixWorld();
  const v = at.clone().project(camera);
  ray.setFromCamera(new THREE.Vector2(v.x, v.y), camera);
};
aim(new THREE.Vector3(0, 1, 4), layer.byId.get('lm_mchu').position);
assert.equal(layer.group.visible, false, 'off until asked for');
assert.equal(requested.length, 0, 'no glyph is fetched for a hidden layer');
assert.equal(layer.pick(ray), null, 'a hidden layer is never picked');
ok('the layer starts hidden, fetches nothing and answers no picks');

/* ── shown: loaded once, retried on failure ─────────────────────────────── */
layer.setVisible(true);
let result = await layer.ensureLoaded();
assert.equal(requested.length, 28);
assert.deepEqual(result.failed, ['lm_mchu']);
assert.equal(layer.byId.get('lm_mchu').material.map, null);
layer.setVisible(false); layer.setVisible(true);
result = await layer.ensureLoaded();
assert.equal(requested.length, 29, 'only the glyph that failed is asked for again');
assert.deepEqual(result.failed, []);
layer.setVisible(false); layer.setVisible(true);
await layer.ensureLoaded();
assert.equal(requested.length, 29, 'hidden and shown again, nothing is fetched twice');
assert.ok(layer.sprites.every((s) => s.material.map && s.material.opacity === 1));
ok('glyphs are fetched the first time the layer is shown, kept while hidden, and a failed one is retried alone');

/* ── picking from sixteen angles ────────────────────────────────────────── */
let hits = 0, angles = 0;
for (let k = 0; k < 16; k++) {
  const a = k / 16 * Math.PI * 2;
  const eye = new THREE.Vector3(Math.sin(a) * 4, 1.2 + (k % 3) * 0.6, Math.cos(a) * 4);
  for (const s of layer.sprites) {
    // only glyphs on the near half, facing the eye, as a reader could click them
    if (s.position.clone().sub(eye).length() > eye.length()) continue;
    aim(eye, s.position);
    const got = layer.pick(ray);
    assert.ok(got, 'a glyph under the pointer is picked (' + s.name + ', angle ' + k + ')');
    // a nearer glyph in front of it may take the click, but never a farther one
    const want = s.position.distanceTo(eye);
    if (got.id !== s.name) assert.ok(got.distance < want, s.name + ' lost to a glyph behind it');
    hits += got.id === s.name;
    angles++;
  }
}
// the rest were covered, on screen, by a nearer glyph (asserted above for each)
assert.ok(hits / angles > 0.85, 'the glyph aimed at is the one picked (' + hits + '/' + angles + ')');
ok('from 16 angles, ' + hits + ' of ' + angles + ' glyphs picked where aimed; the rest by a nearer glyph drawn over them');

/* ── the transparent corners are not the glyph ──────────────────────────── */
const s = layer.byId.get('lm_nam_gru');
const eye = s.position.clone().multiplyScalar(2).setY(HEIGHT);
const aimAt = (du, dv) => {
  camera.position.copy(eye); camera.lookAt(s.position); camera.updateMatrixWorld(); scene.updateMatrixWorld();
  const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
  const up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const p = s.position.clone().addScaledVector(right, du * SIZE).addScaledVector(up, dv * SIZE).project(camera);
  ray.setFromCamera(new THREE.Vector2(p.x, p.y), camera);
  return layer.pick(ray);
};
assert.equal(aimAt(0, 0)?.id, 'lm_nam_gru');
assert.equal(aimAt(0.45, 0)?.id, 'lm_nam_gru', 'near the rim of the medallion');
assert.equal(aimAt(0, -0.45)?.id, 'lm_nam_gru');
assert.equal(aimAt(0.46, 0.46), null, 'a corner of the square is transparent and passes through');
assert.equal(aimAt(-0.4, 0.4), null);
assert.ok(PICK_RADIUS < 0.5);
ok('hits are taken inside the round medallion; the transparent corners pass through to what is behind');

/* ── selection ──────────────────────────────────────────────────────────── */
layer.select('lm_byi_bzhin');
assert.equal(layer.selected, 'lm_byi_bzhin');
assert.ok(layer.byId.get('lm_byi_bzhin').scale.x > SIZE);
layer.select('lm_gro_bzhin');
assert.equal(layer.byId.get('lm_byi_bzhin').scale.x, SIZE, 'the previous glyph goes back to its size');
layer.select('not_a_mansion');
assert.equal(layer.selected, null);
assert.ok(layer.sprites.every((sp) => sp.scale.x === SIZE));
ok('one glyph highlighted at a time; an unknown id clears the highlight');

/* ── disposal: what it owns, and only that ──────────────────────────────── */
const shared = new THREE.Texture(); let sharedDisposed = false;
shared.addEventListener('dispose', () => { sharedDisposed = true; });
const other = new THREE.Sprite(new THREE.SpriteMaterial({ map: shared })); scene.add(other);
const ownedMaterials = layer.sprites.map((sp) => sp.material);
let disposedMaterials = 0, disposedTextures = 0;
ownedMaterials.forEach((m) => m.addEventListener('dispose', () => disposedMaterials++));
ownedMaterials.forEach((m) => m.map.addEventListener('dispose', () => disposedTextures++));
layer.dispose();
assert.equal(disposedMaterials, 28); assert.equal(disposedTextures, 28);
assert.equal(sharedDisposed, false, 'nothing outside the layer is disposed');
assert.ok(!scene.children.includes(layer.group) && scene.children.includes(other));
assert.equal(layer.sprites.length, 0);
ok('dispose frees the 28 materials and textures it owns and removes its group, leaving shared resources alone');

for (const c of checks) console.log('  ok  ' + c);
console.log('\n' + checks.length + ' checks passed.');
