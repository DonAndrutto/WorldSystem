// CPU geometry checks; these do not simulate WebGL appearance.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createGoldenRangeGeometry, createWaterNormalMap, createWaterMaterial, createWaterGeometry } from '../world-surfaces.js';

const scale = 1 / 400000, shores = [];
let radius = 120000 * scale, terrainTriangles = 0;
for (let range = 0; range < 7; range++) {
  const measure = 40000 / 2 ** range;
  const width = Math.max(9000, measure) * scale;
  const top = Math.max(3400, measure) * scale * 3.4;
  const peaks = 13 + range * 2, columns = peaks * 14 + 1;
  const geometry = createGoldenRangeGeometry(THREE, {
    inner: radius, outer: radius + width, top, seat: -0.202, peaks
  });
  const p = geometry.attributes.position, n = geometry.attributes.normal;
  for (const attribute of Object.values(geometry.attributes)) {
    assert.ok([...attribute.array].every(Number.isFinite), 'No invalid terrain vertices');
  }
  for (let i = 0; i < p.count; i++) {
    const r = Math.hypot(p.getX(i), p.getZ(i));
    assert.ok(r >= radius - 1e-6 && r <= radius + width + 1e-6, 'Range stays within its allocated band');
    assert.ok(p.getY(i) >= -0.202001 && p.getY(i) <= top, 'Preserve the sea floor and nominal height');
  }
  for (let row = 0; row < p.count / columns; row++) {
    const first = row * columns, last = first + columns - 1;
    for (const attr of [p, n, geometry.attributes.color]) {
      for (let component = 0; component < 3; component++) {
        assert.equal(attr.array[first * 3 + component], attr.array[last * 3 + component], 'Closed terrain seam');
      }
    }
  }
  const crests = Array.from({ length: columns }, (_, i) => p.getY(6 * columns + i));
  assert.ok(Math.max(...crests) - Math.min(...crests) > top * 0.12, 'Distinct peaks and saddles');
  assert.ok(n.getY(6 * columns) > 0, 'The crest faces up');
  terrainTriangles += geometry.index.count / 3;
  shores.push([radius, radius + width]);
  radius += width + (range < 6 ? width : 0);
  geometry.dispose();
}
assert.ok(terrainTriangles < 50000, 'Keep a bounded mobile terrain budget');

const normalMap = createWaterNormalMap(THREE);
assert.equal(normalMap.image.width, 128);
assert.equal(normalMap.image.height, 128);
assert.equal(normalMap.colorSpace, THREE.NoColorSpace, 'Normals are data, not colour');
assert.equal(normalMap.wrapS, THREE.RepeatWrapping);
assert.equal(normalMap.wrapT, THREE.RepeatWrapping);
assert.ok(normalMap.generateMipmaps, 'Filter distant ripples');
for (const salt of [false, true]) {
  const inner = salt ? radius * 0.997 : 38000 * scale;
  const outer = salt ? radius + 322000 * scale * 0.503 : radius;
  const amplitude = salt ? 0.0024 : 0.0016, rings = salt ? 46 : 60;
  const geometry = createWaterGeometry(THREE, { inner, outer, amplitude, rings, shores, salt });
  const p = geometry.attributes.position, n = geometry.attributes.normal;
  const colours = geometry.attributes.color;
  for (const attribute of Object.values(geometry.attributes)) {
    assert.ok([...attribute.array].every(Number.isFinite), 'No invalid water vertices');
  }
  for (let i = 0; i < p.count; i++) {
    assert.ok(Math.abs(p.getY(i)) <= amplitude + 1e-7, 'Water swell stays below raised offerings');
    assert.ok(n.getY(i) > 0, 'Water faces up');
  }
  for (let row = 0; row <= rings; row++) {
    const first = row * 321, last = first + 320;
    for (const attribute of [p, n, colours]) {
      for (let component = 0; component < 3; component++) {
        assert.equal(attribute.array[first * 3 + component], attribute.array[last * 3 + component], 'Closed water seam');
      }
    }
  }
  assert.ok(Math.max(...colours.array) - Math.min(...colours.array) > 0.1, 'Shore and deep-water colour separation');
  const material = createWaterMaterial(THREE, { name: 'test_water', normalMap, salt });
  assert.equal(material.depthWrite, false, 'Water does not hide transparent offerings in the depth buffer');
  assert.equal(material.normalMap, normalMap, 'Share the small ripple texture');
  assert.equal(material.forceSinglePass, true, 'No extra back-face pass');
  assert.equal(material.clone().normalMap, normalMap, 'Selection highlights retain surface detail');
  geometry.dispose(); material.dispose();
}
normalMap.dispose();
console.log(`PASS: seven separate ranges, closed seams, bounded heights and waves, shared water detail; ${terrainTriangles} terrain triangles.`);
