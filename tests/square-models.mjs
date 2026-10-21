// Run with Node and three@0.184.0 installed for development. Real Three.js
// geometry; nothing is rendered.
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as THREE from 'three';
const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const board = await import(pathToFileURL(repo + '/rebirth-board.js'));
const models = await import(pathToFileURL(repo + '/square-models.js'));
const { SQUARES, VICTORY } = board;

let checks = 0;
const check = (name, fn) => { fn(); checks += 1; console.log('  ok  ' + name); };

// The squares the world itself builds; the page passes the same set.
const WORLD_BUILT = new Set([1, 2, 3, 4, 5, 6, 7, 10, 17, 18, 19, 20, 27, 28, 29, 30, 31, 32, 35, 36, 37]);
const worldContext = { RIM: 1.212415, FLOOR: -0.2, SUMMIT: 0.68, SAMSARA_TOP: 3.1298 };
const materials = models.createModelMaterials(THREE);
const built = new Map(models.MODEL_SQUARES.map((n) => [n, models.buildSquareModel(THREE, n, materials)]));

check('every square the world does not build has a model, and no other', () => {
  const wanted = SQUARES.map((s) => s.n).filter((n) => !WORLD_BUILT.has(n));
  assert.deepEqual([...models.MODEL_SQUARES].sort((a, b) => a - b), wanted);
  for (const n of wanted) assert.ok(models.modelNote(n).length > 20, 'square ' + n + ' says what it shows');
});

check('each model is built, finite, and merged into one mesh per finish', () => {
  for (const [n, group] of built) {
    assert.ok(group.children.length > 0, 'square ' + n + ' has parts');
    const keys = new Set();
    for (const mesh of group.children) {
      assert.ok(models.FINISHES.includes(mesh.userData.finish), 'square ' + n + ' finish ' + mesh.userData.finish);
      assert.ok(!keys.has(mesh.userData.finish), 'square ' + n + ' is merged into one mesh per finish');
      keys.add(mesh.userData.finish);
      assert.equal(mesh.geometry.attributes.color.count, mesh.geometry.attributes.position.count, 'every vertex is painted');
      assert.equal(mesh.userData.square, n);
      const pos = mesh.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 1) assert.ok(Number.isFinite(pos[i]), 'square ' + n + ' has a finite vertex');
      assert.ok(mesh.geometry.index.count % 3 === 0);
    }
  }
});

check('each model stands on its ground and keeps within its unit', () => {
  for (const [n, group] of built) {
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    assert.ok(box.min.y > -0.15, 'square ' + n + ' does not sink into its marker');
    assert.ok(box.max.y <= 1.08, 'square ' + n + ' is at most a unit tall (' + box.max.y.toFixed(2) + ')');
    assert.ok(size.x <= 1.06 && size.z <= 1.0, 'square ' + n + ' is at most a unit across');
  }
});

check('the whole set stays within a modest triangle budget', () => {
  let total = 0;
  for (const group of built.values()) {
    let t = 0;
    group.children.forEach((m) => { t += m.geometry.index.count / 3; });
    total += t;
  }
  // Four featured Buddhas now carry the reference-derived sculpture.
  // Keep every other destination at its original budget.
  for (const [n, group] of built) {
    const triangles = group.children.reduce((sum, m) => sum + m.geometry.index.count / 3, 0);
    assert.ok(triangles < ([77, 93, 100, 101].includes(n) ? 100000 : 40000), 'square ' + n + ': ' + triangles);
  }
  assert.ok(total < 1400000, 'the set as a whole: ' + total);
  const calls = [...built.values()].reduce((sum, group) => sum + group.children.length, 0);
  assert.ok(calls <= built.size * models.FINISHES.length, 'at most one draw call per finish: ' + calls);
});

check('neighbouring models on the spiral never run into each other', () => {
  const unit = worldContext.SUMMIT * models.MODEL_UNIT;
  const spheres = SQUARES.filter((s) => !s.anchor && built.has(s.n)).map((s) => {
    const sphere = new THREE.Box3().setFromObject(built.get(s.n)).getBoundingSphere(new THREE.Sphere());
    const scale = unit * (s.n === VICTORY ? models.VICTORY_SCALE : 1);
    const lift = worldContext.SUMMIT * (s.n === VICTORY ? 0.1 : models.MODEL_LIFT);
    const p = board.seamPosition(s, worldContext);
    // The model turns about its vertical, so its centre's horizontal offset
    // can point anywhere: count it into the radius.
    const swing = Math.hypot(sphere.center.x, sphere.center.z) * scale;
    return { n: s.n, centre: new THREE.Vector3(p.x, p.y + lift + sphere.center.y * scale, p.z), r: sphere.radius * scale + swing };
  });
  for (let i = 0; i < spheres.length; i += 1) for (const b of spheres.slice(i + 1)) {
    const a = spheres[i];
    assert.ok(a.centre.distanceTo(b.centre) > a.r + b.r,
      a.n + ' and ' + b.n + ' have room for their models');
  }
});

check('the set turns to the camera, and stands back unless in play', () => {
  const ctx = { SUMMIT: worldContext.SUMMIT, VICTORY, modelled: WORLD_BUILT };
  const set = models.createSquareModels(THREE, ctx);
  const root = new THREE.Group();
  const holders = new Map();
  for (const s of SQUARES) {
    const h = new THREE.Group();
    const p = board.seamPosition(s, worldContext);
    h.position.set(p.x, p.y, p.z);
    root.add(h);
    holders.set(s.n, h);
    assert.equal(set.attach(h, s.n), !WORLD_BUILT.has(s.n));
  }
  assert.equal(set.models.size, 0, 'nothing is built until asked');
  set.showActive([24]);
  set.load();
  assert.equal(set.models.size, 83);
  assert.ok(set.built());
  const faint = (n) => set.models.get(n).children.every((m) => m.material.name.endsWith('_faint'));
  assert.ok(!faint(24), 'a square asked for before the build is lit once built');
  assert.ok(faint(59));
  assert.ok(!faint(VICTORY), 'Nirvana is never faint');
  set.showActive([59]);
  assert.ok(faint(24) && !faint(59));
  const camera = new THREE.PerspectiveCamera();
  camera.position.set(5, 3, -4);
  root.updateMatrixWorld(true);
  set.face(camera);
  for (const n of [8, 59, 101]) {
    const model = set.models.get(n);
    model.updateMatrixWorld(true);
    const forward = new THREE.Vector3(0, 0, 1).transformDirection(model.matrixWorld).setY(0).normalize();
    const toEye = camera.position.clone().sub(holders.get(n).position).setY(0).normalize();
    assert.ok(forward.dot(toEye) > 0.999, 'square ' + n + ' faces the camera');
  }
  const victory = set.models.get(VICTORY);
  assert.ok(Math.abs(victory.scale.x - worldContext.SUMMIT * models.MODEL_UNIT * models.VICTORY_SCALE) < 1e-9);
});

// The realms beneath Jambudvīpa are the world's: each hell, the Vajra Hell
// and the pretas' ground has a model of its own, set on its floor.
const realms = new Map(models.REALM_MODEL_IDS.map((id) => [id, models.buildRealmModel(THREE, id, materials)]));
check('every realm beneath Jambudvīpa has its model, fitting its floor', () => {
  const want = ['preta_realm', 'hell_vajra',
    ...['sanjiva', 'kalasutra', 'samghata', 'raurava', 'maharaurava', 'tapana', 'pratapana', 'avichi'].map((n) => 'hell_' + n),
    ...['arbuda', 'nirarbuda', 'atata', 'hahava', 'huhuva', 'utpala', 'padma', 'mahapadma'].map((n) => 'cold_' + n)];
  assert.deepEqual([...realms.keys()].sort(), want.sort());
  for (const [id, group] of realms) {
    assert.ok(models.realmNote(id).length > 30, id + ' says what it shows');
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3());
    assert.ok(box.min.y > -0.06, id + ' stands on its floor (' + box.min.y.toFixed(2) + ')');
    // the hot hells are a model's height apart: 0.12 world units at most
    // 0.13 to the unit, and the floor above is 0.011 thick
    assert.ok(box.max.y <= 0.82, id + ' clears the floor above (' + box.max.y.toFixed(2) + ')');
    assert.ok(size.x <= 0.95 && size.z <= 0.9, id + ' stays inside its walls');
    const keys = new Set();
    for (const mesh of group.children) {
      assert.ok(!keys.has(mesh.userData.finish), id + ' is merged into one mesh per finish');
      keys.add(mesh.userData.finish);
      assert.equal(mesh.userData.realm, id);
      const pos = mesh.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 1) assert.ok(Number.isFinite(pos[i]), id + ' has a finite vertex');
    }
  }
});

check('the realms are light enough to stand in every mode', () => {
  let total = 0;
  for (const [id, group] of realms) {
    let t = 0;
    group.children.forEach((m) => { t += m.geometry.index.count / 3; });
    assert.ok(t < 32000, id + ' is not heavy: ' + t);
    total += t;
  }
  assert.ok(total < 320000, 'all of them together: ' + total);
});

// One body for everyone: every pose builds, and the figure is as tall as it
// should be, standing and seated, at no more than the old figure's cost.
const { POSES, humanFigure } = await import(pathToFileURL(repo + '/human-figure.js'));
check('the human figure takes every pose, at its own height', () => {
  for (const name of Object.keys(POSES)) {
    const group = models.buildRecipe(THREE, (b, F) => F.sufferer(b, { pose: name, s: 1 }), materials);
    const box = new THREE.Box3().setFromObject(group);
    assert.ok(!box.isEmpty() && Number.isFinite(box.max.y), name + ' builds');
  }
  const standing = models.buildRecipe(THREE, (b, F) => F.standing(b, { hair: 'shaved' }), materials);
  const tall = new THREE.Box3().setFromObject(standing).max.y;
  assert.ok(tall > 0.7 && tall < 0.8, 'a standing figure is about 0.74 tall: ' + tall.toFixed(3));
  const seated = models.buildRecipe(THREE, (b, F) => F.seated(b, { hair: 'shaved' }), materials);
  const sat = new THREE.Box3().setFromObject(seated);
  assert.ok(sat.max.y > 0.5 && sat.max.y < 0.6, 'a seated figure is about 0.55 tall: ' + sat.max.y.toFixed(3));
  let t = 0;
  seated.children.forEach((m) => { t += m.geometry.index.count / 3; });
  assert.ok(t < 16000, 'a seated figure with its face, hands and robe: ' + t);
});

check('the head is in proportion to the body, as a grown man is', () => {
  // the head alone, in its own units, middle of the face at 0
  const alone = new THREE.Box3().setFromObject(models.buildRecipe(THREE, (b, F) => F.head(b, { style: 'shaved' }), materials));
  const S = 0.74;
  let out = null;
  const figure = models.buildRecipe(THREE, (b) => { out = humanFigure(b, { stature: S, pose: POSES.standing(), scalp: true }); }, materials);
  const box = new THREE.Box3().setFromObject(figure);
  // how large the head is drawn, from the crown above the middle of the face
  const unit = (box.max.y - out.head[1]) / alone.max.y;
  const heads = box.max.y / ((alone.max.y - alone.min.y) * unit);
  assert.ok(heads > 7 && heads < 7.8, 'a standing figure is about seven and a half heads tall: ' + heads.toFixed(2));
  // and broad enough across the deltoids for a head of that size, ears and all
  const shoulders = new THREE.Box3();
  const v = new THREE.Vector3();
  for (const mesh of figure.children) {
    const pos = mesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      v.fromBufferAttribute(pos, i);
      if (Math.abs(v.y - 0.75 * S) < 0.05 * S) shoulders.expandByPoint(v);
    }
  }
  const across = (shoulders.max.x - shoulders.min.x) / ((alone.max.x - alone.min.x) * unit);
  assert.ok(across > 2.3 && across < 3.1, 'the shoulders are between two and three heads across: ' + across.toFixed(2));
});

console.log('\n' + checks + ' checks passed.');
