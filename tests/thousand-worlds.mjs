// Run with Node and three@0.184.0 installed for development.
// The three orders of a thousand, without the page: the arithmetic of where
// the cubes stand, and the drawing built from it — how many of each thing,
// where the one world is in it, and what a level shows and puts away.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { SIDE, HOME_CELL, ORDERS, planLayout, cellOffsets, memberOffsets, framingDistance,
  createThousandWorlds } from '../thousand-worlds.js';

/* ── the count ─────────────────────────────────────────────────────────── */
assert.equal(SIDE ** 3, 1000, 'ten to a side is a thousand');
assert.deepEqual(ORDERS.map(o => o.count), [1, 1e3, 1e6, 1e9], 'one, a thousand, a million, a thousand million');
assert.equal(cellOffsets().length, 999, 'the home cell is left for what was there');
assert.ok(!cellOffsets().some(([i, j, k]) => i === 0 && j === 0 && k === 0), 'and it is the origin');
assert.equal(memberOffsets().length, 1000, 'a cube holds its whole thousand');
const mean = memberOffsets().reduce((s, w) => s + w[0] + w[1] + w[2], 0);
assert.ok(Math.abs(mean) < 1e-9, 'centred on the cube');

/* ── the layout ────────────────────────────────────────────────────────── */
const span = 3.7, centre = [0.1, 1.2, -0.05];
const levels = planLayout({ span, centre });
assert.equal(levels.length, 3, 'three orders');
assert.deepEqual(levels[0].origin, centre, 'the first order is laid out from the one world');
for (const [n, L] of levels.entries()) {
  assert.equal(L.order, n + 1);
  assert.ok(L.pitch > (n ? levels[n - 1].edge : span), 'order ' + L.order + ' leaves a gap between what it holds');
  assert.equal(L.edge, L.pitch * SIDE, 'ten cells to an edge');
  assert.ok(Math.abs(L.radius - L.edge * Math.sqrt(3) / 2) < 1e-9, 'framed by its half-diagonal');
  // the home cell sits at the origin, so the cube's centre is half a pitch off it
  for (const axis of [0, 1, 2]) assert.ok(Math.abs(L.centre[axis] - (L.origin[axis] - L.pitch / 2)) < 1e-9);
  if (n) assert.deepEqual(L.origin, levels[n - 1].centre, 'each order is laid out from the centre of the last');
  // the cells of this order, and the members of a cube of the next, agree on where things stand
  const cells = cellOffsets().map(c => c.map((v, a) => L.origin[a] + v * L.pitch));
  assert.ok(cells.every(([x]) => Math.abs(x - L.centre[0]) <= L.edge / 2 - L.pitch / 2 + 1e-9), 'every cell inside the cube');
}
const members = memberOffsets().map(w => w.map((v, a) => levels[0].centre[a] + v * levels[0].pitch));
assert.ok(members.some(m => m.every((v, a) => Math.abs(v - centre[a]) < 1e-9)), 'the one world is one of the thousand');
assert.ok(!members.some(m => m.every((v, a) => Math.abs(v - levels[0].centre[a]) < 1e-9)), 'and none is the middle one');
assert.throws(() => planLayout({ span: 0 }), 'no world, no layout');

/* ── the framing ───────────────────────────────────────────────────────── */
const near = framingDistance(10, { fov: 45, height: 900, rect: { w: 1280, h: 900 } });
assert.ok(near > 10 / Math.tan(Math.PI / 8), 'the eye stands back far enough to take the sphere in');
assert.ok(framingDistance(10, { fov: 45, height: 900, rect: { w: 400, h: 900 } }) > near, 'and further when a panel takes the width');

/* ── the drawing ───────────────────────────────────────────────────────── */
const context = new Proxy({}, { get: (t, k) => t[k] || (k.startsWith('create') ? () => ({ addColorStop() {} }) : () => {}), set: (t, k, v) => (t[k] = v, true) });
const createCanvas = () => ({ width: 0, height: 0, getContext: () => context });
const cosmos = createThousandWorlds(THREE, {
  span, centre, rim: 1.15, floor: -0.2, summit: 0.68, spireTop: 1.5, fov: 45,
  meru: { halfTop: 0.15, halfBase: 0.26, seat: -0.2 },
  luminaries: [{ x: 1, y: 0.34, z: 0, r: 0.08 }, { x: -0.9, y: 0.34, z: 0.3, r: 0.075 }],
  createCanvas
});
assert.equal(cosmos.level, 0); assert.equal(cosmos.group.visible, false, 'nothing shown until asked');
assert.ok(!cosmos.built(1), 'and nothing built until then');

cosmos.setLevel(1, { instant: true });
assert.equal(cosmos.level, 1); assert.ok(cosmos.group.visible);
assert.ok(cosmos.built(1) && !cosmos.built(2), 'the first order alone is built');
const instanced = [];
cosmos.group.traverse(o => { if (o.isInstancedMesh) instanced.push(o); });
assert.equal(instanced.length, 6, 'a disc, a rim, a Meru, a spire, a sun and a moon');
assert.ok(instanced.every(m => m.count === 999), 'nine hundred and ninety-nine of each');
const m = new THREE.Matrix4(), p = new THREE.Vector3();
const discs = [];
for (let i = 0; i < 999; i++) { instanced[0].getMatrixAt(i, m); discs.push(p.setFromMatrixPosition(m).clone()); }
assert.ok(!discs.some(d => Math.abs(d.x) < 1e-6 && Math.abs(d.z) < 1e-6 && Math.abs(d.y - -0.1) < 1e-6), 'no proxy stands where the one world is');
const pitch = levels[0].pitch;
assert.ok(discs.every(d => Number.isInteger(Math.round(d.x / pitch)) && Math.abs(d.x / pitch - Math.round(d.x / pitch)) < 1e-6), 'the proxies stand on the lattice');
cosmos.group.traverse(o => { if (o.isMesh || o.isPoints || o.isLine) assert.equal(o.castShadow, false, 'a proxy casts no shadow'); });
let picked = false;
cosmos.group.traverse(o => { if (o.raycast && o.raycast.toString() !== '() => {}' && (o.isMesh || o.isPoints)) picked = true; });
assert.equal(picked, false, 'and is no click target');

// Memory stays bounded: only the current order survives a completed transition.
let disposed = 0;
instanced[0].geometry.addEventListener('dispose', () => disposed++);
cosmos.setLevel(3, { instant: true });
assert.equal(disposed, 1);
assert.ok(!cosmos.built(1) && !cosmos.built(2) && cosmos.built(3));
const points = [];
cosmos.group.traverse(o => { if (o.isPoints) points.push(o); });
assert.equal(points.length, 1);
const geometry = points[0].geometry;
assert.equal(geometry.attributes.position.count * geometry.instanceCount, 1e6, 'the full million members is retained');
assert.equal(geometry.attributes.position.array.byteLength + geometry.attributes.cloudOffset.array.byteLength, 24000,
  'shared positions use 24 KB instead of 12 MB');
const cloud = geometry.attributes.position, offsets = geometry.attributes.cloudOffset;
for (const i of [0, 499, 999]) {
  const w = memberOffsets()[i];
  for (const axis of [0, 1, 2]) assert.ok(Math.abs(cloud.array[i*3+axis] + offsets.array[axis]
    - (levels[2].origin[axis] + w[axis]*levels[1].pitch)) < 0.001, 'instanced positions match the original lattice');
}
let textureDisposed = 0;
points[0].material.map.addEventListener('dispose', () => textureDisposed++);
assert.equal(cosmos.setLevel(1, { dur: 100 }), true);
assert.ok(cosmos.built(1) && cosmos.built(3), 'outgoing layer lives through the crossfade');
cosmos.tick(1000); cosmos.tick(1050);
assert.ok(points[0].material.opacity > 0 && points[0].material.opacity < 0.6);
assert.equal(cosmos.tick(1100), false);
assert.equal(textureDisposed, 1);
assert.equal(cosmos.group.children.length, 1);
assert.ok(!cosmos.built(3));
// Rapid changes and an instant interruption cannot leave a stale fade alive.
cosmos.setLevel(2, {dur:100}); cosmos.tick(2000); cosmos.tick(2050);
cosmos.setLevel(3, {dur:100}); cosmos.tick(2100);
cosmos.setLevel(1, {instant:true});
assert.equal(cosmos.fading, false);
assert.equal(cosmos.group.children.length, 1);
cosmos.tick(10000);
assert.equal(cosmos.level, 1);
for (let cycle = 0; cycle < 3; cycle++) {
  for (const level of [3, 2, 1, 0]) {
    cosmos.setLevel(level, {instant:true});
    assert.equal(cosmos.group.children.length, level ? 1 : 0, 'no layer accumulation');
  }
}
assert.equal(cosmos.group.visible, false);
assert.equal(cosmos.setLevel(0), false);
console.log('PASS: full million-member instanced clouds, 24 KB positions, disposal and interrupted transitions.');
