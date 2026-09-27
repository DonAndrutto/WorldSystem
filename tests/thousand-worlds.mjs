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

cosmos.setLevel(3, { instant: true });
const points = [];
cosmos.group.traverse(o => { if (o.isPoints) points.push(o); });
assert.equal(points.length, 2, 'a cloud for the second order and one for the third');
assert.ok(points.every(pt => pt.geometry.attributes.position.count === 1000 * 1000), 'a thousand sprites for each of the thousand, the home cell among them');
const cloud = points[0].geometry.attributes.position, home = levels[1].origin;
let atHome = 0;
for (let i = 0; i < 1000; i++) {
  const d = Math.hypot(cloud.getX(i) - home[0], cloud.getY(i) - home[1], cloud.getZ(i) - home[2]);
  if (d < levels[0].edge) atHome++;
}
assert.equal(atHome, 1000, 'from the second order the home cell is a cloud like its neighbours');
assert.ok(points[1].material.size > points[0].material.size * 8, 'a small chiliocosm is drawn larger than a world');
const shown = [];
cosmos.group.traverse(o => { if (o.isPoints || o.isInstancedMesh) shown.push(o); });
assert.ok(shown.every(o => o.material.opacity > 0), 'at once means shown');
assert.ok(instanced.every(o => o.material.opacity === 1), 'the proxies of the first order are solid');
assert.ok(points[1].material.opacity < points[0].material.opacity, 'the further order is the thinner');

// fading: the second and third orders go out over a flight, and are hidden once gone
assert.equal(cosmos.setLevel(1, { dur: 100 }), true, 'a fade is running');
assert.equal(cosmos.tick(1000), true); assert.equal(cosmos.tick(1050), true);
assert.ok(points[0].material.opacity > 0 && points[0].material.opacity < 1, 'half way out');
assert.equal(cosmos.tick(1100), false, 'done');
assert.equal(points[0].parent.visible, false, 'the second order is put away');
assert.equal(points[1].parent.visible, false, 'and the third');
assert.equal(instanced[0].material.opacity, 1, 'the first stays');
assert.equal(points[0].material.opacity, 0, 'and the others are at nothing');
assert.equal(cosmos.setLevel(0, { dur: 100 }), true);
cosmos.tick(2000); assert.equal(cosmos.tick(2100), false);
assert.equal(cosmos.group.visible, false, 'back to the one world, nothing else is drawn');
assert.equal(cosmos.setLevel(0, { dur: 100 }), false, 'nothing to fade when nothing changes');

console.log('PASS: a thousand a side, three orders laid out from the one world, 999 proxies and two clouds of a million, shown and put away.');
