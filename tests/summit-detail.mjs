// Real CPU geometry/raycast checks; browser appearance is verified separately.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createSummitDetail } from '../summit-detail.js';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
// Use the page's actual roof builder, so its silhouette and the relief cannot
// silently diverge while a separate test-only roof continues to pass.
const helperSource = html.slice(html.indexOf('const sq = '), html.indexOf('function colonnade('));
const flaredRoof = new Function('THREE', helperSource + '\nreturn flaredRoof;')(THREE);
const y = value => value / 400000, yv = value => y(value) * 3.4;
const M = Object.fromEntries([
  'gold', 'goldDeep', 'pearl', 'indigo', 'celadon', 'cinnabar', 'wood', 'foliage', 'foliageLit'
].map(name => [name, Object.assign(new THREE.MeshStandardMaterial(), { name })]));
const summit = yv(80000), cityTop = summit + yv(5000);
const detail = createSummitDetail(THREE, {
  materials: M, y, yv, summit, cityTop, cityHalf: y(24000),
  hallHalf: y(18000), parkRadius: y(11000), flaredRoof
});
detail.updateMatrixWorld(true);
const names = new Set(['sudarshana_city', 'nandana', 'vaijayanta_tier_1', 'vaijayanta_tier_2', 'vaijayanta_tier_3']);
const found = new Set(), bins = new Set();
let triangles = 0;
for (const mesh of detail.children) {
  assert.ok(mesh.isMesh, 'Detail is static geometry');
  assert.ok(names.has(mesh.name), 'Preserve existing selection and mandala membership names');
  assert.ok(Object.values(M).includes(mesh.material), 'Reuse the drawing’s existing pigments');
  const bin = mesh.name + '/' + mesh.material.name;
  assert.ok(!bins.has(bin), 'Merge all repetition in each selectable material into one draw call');
  bins.add(bin); found.add(mesh.name);
  const geometry = mesh.geometry, p = geometry.attributes.position, n = geometry.attributes.normal;
  for (const attribute of Object.values(geometry.attributes)) {
    assert.ok([...attribute.array].every(Number.isFinite), 'No invalid vertices or normals');
  }
  for (let i = 0; i < p.count; i++) {
    assert.ok(p.getY(i) >= summit, 'Summit detail does not descend into Meru');
    assert.ok(p.getY(i) <= cityTop + yv(20600), 'Preserve the palace’s existing roof/finial silhouette');
    assert.ok(Math.abs(p.getX(i)) < 0.121 && Math.abs(p.getZ(i)) < 0.121, 'Stay inside the summit’s existing garden envelope');
    assert.ok(Math.abs(Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) - 1) < 1e-5, 'Normals remain normalized after baking scaled ornaments');
  }
  for (const index of geometry.index.array) assert.ok(index < p.count, 'Every triangle addresses a real vertex');
  triangles += geometry.index.count / 3;
}
assert.deepEqual(found, names, 'All three storeys, city and parks receive detail');
assert.ok(detail.children.length <= 24, 'Bound the additional main-pass draw calls');
assert.ok(triangles < 32000, `Bound the mobile triangle budget (got ${triangles})`);

// All four gate arches must remain open beneath the lintel. Architectural
// additions should also provide a pickable wall panel beside each opening.
for (let i = 0; i < 4; i++) {
  const angle = i * Math.PI / 2;
  const direction = new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
  const position = new THREE.Vector3(0, cityTop + yv(2800), 0).addScaledVector(direction, 0.056);
  const ray = new THREE.Raycaster(position, direction, 0, 0.02);
  assert.equal(ray.intersectObject(detail, true).length, 0, 'Gate arch remains open');
  position.set(0.035 * Math.cos(angle) + 0.056 * Math.sin(angle), cityTop + yv(1120),
    -0.035 * Math.sin(angle) + 0.056 * Math.cos(angle));
  ray.set(position, direction);
  assert.ok(ray.intersectObject(detail, true).some(hit => hit.object.name === 'sudarshana_city'), 'Wall relief preserves city picking');
}
const total = detail.children.length;
detail.traverse(mesh => mesh.geometry?.dispose());
Object.values(M).forEach(material => material.dispose());
console.log(`PASS: summit geometry, selection names, open gates, finite normals and bounded detail; ${total} merged meshes, ${triangles} triangles.`);
