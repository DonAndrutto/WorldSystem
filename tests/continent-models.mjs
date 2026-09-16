// CPU geometry checks complement the browser's day/night and close-up review.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createContinentModels } from '../continent-models.js';

const palette = ['gold', 'silver', 'lapis', 'crystal', 'jewel', 'ruby', 'emerald',
  'bark', 'wood', 'leaf', 'foliage', 'foliageLit', 'milk', 'hoof', 'pearl', 'cinnabar', 'stem', 'grain'];
const materials = Object.fromEntries(palette.map(name => [name,
  Object.assign(new THREE.MeshStandardMaterial(), { name })]));
const { treasures, createJambuTree } = createContinentModels(THREE, { materials });
const cases = [
  ['treasure_mountain', treasures.purvavideha, 0.052, 4000],
  ['treasure_tree', treasures.jambudvipa, 0.061, 18000],
  ['treasure_cow', treasures.aparagodaniya, 0.051, 18000],
  ['treasure_harvest', treasures.uttarakuru, 0.061, 19000],
  ['jambu', createJambuTree, 0.046, 18000]
];
let triangles = 0, meshes = 0;
for (const [name, build, ceiling, budget] of cases) {
  const model = build(), second = build();
  model.updateMatrixWorld(true);
  const names = name === 'jambu' ? ['jambu_trunk', 'jambu_canopy'] : [name];
  const bins = new Set();
  let cost = 0;
  for (const [i, mesh] of model.children.entries()) {
    assert.ok(mesh.isMesh && names.includes(mesh.name), 'All ornament shares existing selectable entry names');
    assert.ok(Object.values(materials).includes(mesh.material), 'Use the existing world palette');
    const key = mesh.name + '/' + mesh.material.name;
    assert.ok(!bins.has(key), 'One mesh per selectable material'); bins.add(key);
    const g = mesh.geometry, p = g.attributes.position, n = g.attributes.normal;
    assert.ok(g.boundingBox && g.boundingSphere, 'Merged buffers include bounds for culling and picking');
    for (const attr of Object.values(g.attributes)) {
      assert.ok(attr.array.every(Number.isFinite), 'No invalid geometry');
    }
    for (let j = 0; j < p.count; j++) {
      assert.ok(p.getY(j) > -0.001 && p.getY(j) < ceiling, name + ': stand at the plate, within the landmark envelope');
      assert.ok(Math.abs(p.getX(j)) < 0.043 && Math.abs(p.getZ(j)) < 0.037, name + ': bounded footprint');
      assert.ok(Math.abs(Math.hypot(n.getX(j), n.getY(j), n.getZ(j)) - 1) < 1e-5, name + ': normalized baked normals');
    }
    assert.deepEqual(p.array, second.children[i].geometry.attributes.position.array,
      'Geometry stays deterministic across rebuilds and cached reloads');
    cost += p.count / 3;
  }
  assert.ok(cost < budget, name + ': bounded triangle count');
  const box = new THREE.Box3().setFromObject(model), center = box.getCenter(new THREE.Vector3());
  for (const direction of [new THREE.Vector3(1, .3, 1), new THREE.Vector3(-1, .3, -1), new THREE.Vector3(0, 1, 0)]) {
    const origin = center.clone().addScaledVector(direction.clone().normalize(), .2);
    const hits = new THREE.Raycaster(origin, center.clone().sub(origin).normalize()).intersectObject(model, true);
    assert.ok(hits.length && names.includes(hits[0].object.name), name + ': pickable from front, reverse and above');
  }
  if (name === 'treasure_cow') {
    // The cloth's front face must face outwards on both flanks, so it stays
    // visible with the ordinary FrontSide material and casts no inside-out skin.
    for (const sign of [-1, 1]) {
      const ray = new THREE.Raycaster(new THREE.Vector3(-.009, .030, sign * .03), new THREE.Vector3(0, 0, -sign));
      assert.equal(ray.intersectObject(model, true)[0]?.object.material, materials.cinnabar);
    }
  }
  triangles += cost; meshes += model.children.length;
  for (const root of [model, second]) root.traverse(o => o.geometry?.dispose());
}
assert.ok(meshes <= 32 && triangles < 75000, 'Bound the combined cost of the five sculptures');
Object.values(materials).forEach(m => m.dispose());
console.log(`PASS: five continent models; finite deterministic geometry, normals, bounds, ray picking and cloth winding; ${meshes} merged meshes / ${triangles} triangles.`);
