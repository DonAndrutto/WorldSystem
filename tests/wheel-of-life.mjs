// Run with Node and jsdom@26 installed for development.
// The wheel of life on its own: the relief's layers, its parts and entries, and
// the view that moves it, without the rest of the page. What the relief looks
// like on a screen is not something this can say; what it can say is that every
// part is where the measured wheel puts it, answers to an entry, and is reachable,
// and that every picture the layers name is here to be served.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const art = await import(pathToFileURL(repo + '/wheel-art.js'));
const notes = await import(pathToFileURL(repo + '/wheel-notes.js'));
const viewMod = await import(pathToFileURL(repo + '/wheel-view.js'));
const { drawWheel, REALMS, NIDANAS, nidanaSpan, HOT_HELLS, COLD_HELLS, R, C, ART_W, ART_H } = art;
const { RELIEF } = await import(pathToFileURL(repo + '/wheel-relief.js'));
const { WHEEL_ENTRIES, WHEEL_TREE, WHEEL_ALSO } = notes;
const ok = (msg) => console.log('  ok  ' + msg);

// ── the drawing ─────────────────────────────────────────────────────────────
const w = drawWheel();
assert.deepEqual(w.layers.map((l) => l.name), ['wall', 'beyond', 'body', 'wheel', 'frame', 'front', 'shade'],
  'wall to fangs, back to front, and the veil over them');
assert.ok(w.layers.every((l, i) => i === 0 || l.depth > w.layers[i - 1].depth), 'each layer stands further off the wall');
const again = drawWheel();
assert.deepEqual(again.layers.map((l) => l.svg), w.layers.map((l) => l.svg), 'the same drawing every time');
ok('seven layers, each further from the wall, drawn the same way twice');

// the pictures: every one the layers name is in the tree, and the whole is not heavy
let bytes = 0;
for (const l of RELIEF.layers) for (const im of l.images) {
  const file = repo + '/' + im.href;
  assert.ok(fs.existsSync(file), im.href + ' is served');
  bytes += fs.statSync(file).size;
  const far = im.href.endsWith('wall-far.webp');     // the wall carried on past the photograph
  assert.ok(im.w > 0 && im.h > 0 && (far ? im.x < -1000 && im.y < -1000 && im.x + im.w > ART_W + 1000 && im.y + im.h > ART_H + 1000
    : im.x >= 0 && im.y >= 0 && im.x + im.w <= ART_W && im.y + im.h <= ART_H), im.href + ' lies on the wall');
  assert.ok(w.layers.find((x) => x.name === l.name).svg.includes('href="' + im.href + '"'), im.href + ' is drawn in ' + l.name);
}
assert.ok(bytes < 4 * 1024 * 1024, 'the relief in all its layers is under 4 MB, not ' + (bytes >> 10) + ' KB');
assert.equal(RELIEF.rings.length, 4, 'four rims measured');
assert.ok(RELIEF.rings.every((r, i) => i === 0 || r > RELIEF.rings[i - 1]), 'from the hub outward');
ok('every picture is served, lies on the wall and is drawn in its layer; ' + (bytes >> 10) + ' KB in all');

// every layer is well-formed SVG
const { window } = new JSDOM('');
for (const l of w.layers) {
  const doc = new window.DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg"><defs>${w.defs}</defs>${l.svg}</svg>`, 'image/svg+xml');
  assert.equal(doc.querySelector('parsererror'), null, l.name + ' parses');
  // nothing is drawn with a number that is not a number
  assert.ok(!/NaN|undefined|Infinity/.test(l.svg), l.name + ' has no NaN, undefined or Infinity in it');
}
ok('every layer parses as SVG, with no NaN or undefined in it');

// ── the realms and the rim ──────────────────────────────────────────────────
assert.equal(REALMS.length, 6);
REALMS.forEach((r, i) => {
  const next = REALMS[(i + 1) % 6];
  const gap = ((next.a0 - r.a1) % 360 + 360) % 360;
  assert.ok(Math.min(gap, 360 - gap) < 1e-9, r.id + ' meets ' + next.id + ' at a spoke');
});
assert.ok(Math.abs(REALMS.reduce((sum, r) => sum + r.a1 - r.a0, 0) - 360) < 1e-9, 'the six fill the wheel');
const span = Object.fromEntries(REALMS.map((r) => [r.id, [r.a0, r.a1]]));
const mid = (id) => (span[id][0] + span[id][1]) / 2;
assert.ok(Math.abs(mid('wl_realm_gods') + 90) < 5, 'the gods at the top');
assert.ok(Math.abs(mid('wl_realm_hells') - 90) < 5, 'the hells at the bottom');
assert.ok(mid('wl_realm_asuras') > 180 && mid('wl_realm_asuras') < 270, 'the asuras upper left, as the relief has them');
assert.ok(mid('wl_realm_humans') > -90 && mid('wl_realm_humans') < 0, 'the humans upper right');
assert.ok(mid('wl_realm_animals') > 90 && mid('wl_realm_animals') < 180, 'the animals lower left');
assert.ok(mid('wl_realm_pretas') > 0 && mid('wl_realm_pretas') < 90, 'the pretas lower right');
const widths = REALMS.map((r) => r.a1 - r.a0);
assert.equal(Math.max(...widths), span.wl_realm_hells[1] - span.wl_realm_hells[0], 'the hells widest, holding hot and cold');
ok('six realms fill the wheel where the relief puts them, the hells the widest');

assert.equal(NIDANAS.length, 12);
assert.ok(Math.abs(nidanaSpan(0)[0] + 90) < 1.5, 'ignorance just right of the fangs');
assert.ok(Math.abs(nidanaSpan(11)[1] - 270) < 1.5, 'aging and death just left of them');
assert.ok(Math.abs(nidanaSpan(11)[1] - 360 - nidanaSpan(0)[0]) < 1e-9, 'and the rim closes');
NIDANAS.forEach((id, i) => {
  const width = nidanaSpan(i)[1] - nidanaSpan(i)[0];
  assert.ok(width > 25 && width < 35, id + ' is about a twelfth of the rim, as the relief divides it: ' + width.toFixed(1) + '°');
  if (i) assert.equal(nidanaSpan(i)[0], nidanaSpan(i - 1)[1], id + ' begins where the last ends');
  assert.ok(WHEEL_ENTRIES[id].t.startsWith((i + 1) + ' · '), id + ' is numbered ' + (i + 1));
});
// the user's reading of the rim, panel by panel, clockwise
const pictured = ['blind', 'potter', 'monkey', 'boat', 'house', 'embrace', 'arrow', 'drink', 'fruit', 'pregnant', 'birth', 'corpse'];
NIDANAS.forEach((id, i) => assert.match(JSON.stringify(WHEEL_ENTRIES[id].f), new RegExp(pictured[i]), id + ' pictures a ' + pictured[i]));
// contact and feeling either side of the foot of the wheel
assert.ok(Math.abs(nidanaSpan(5)[1] - 90) < 1.5 && nidanaSpan(6)[0] === nidanaSpan(5)[1], 'contact right of the foot, feeling left of it');
ok('twelve links, clockwise from the blind man, each with its picture');

assert.equal(HOT_HELLS.length, 8); assert.equal(COLD_HELLS.length, 8);
const angleOf = (x, y) => Math.atan2(y - C.y, x - C.x) * 180 / Math.PI;
const rows = (ids, spoke) => ids.map((id) => {
  const [x, y, bw, bh] = w.boxes.get(id), cx = x + bw / 2, cy = y + bh / 2;
  const t = spoke * Math.PI / 180;
  return { id, cx, cy, off: Math.abs((cx - C.x) * -Math.sin(t) + (cy - C.y) * Math.cos(t)) };
});
for (const [ids, spoke, side] of [[HOT_HELLS, span.wl_realm_hells[1], -1], [COLD_HELLS, span.wl_realm_hells[0], 1]]) {
  const r = rows(ids, spoke);
  r.forEach((row) => {
    const a = angleOf(row.cx, row.cy);
    assert.ok(a > span.wl_realm_hells[0] && a < span.wl_realm_hells[1], row.id + ' is in the hells');
    assert.ok(Math.sign(row.cx - C.x) === side, row.id + (side < 0 ? ' is on the left' : ' is on the right'));
  });
  r.forEach((row, k) => { if (k) assert.ok(row.off > r[k - 1].off, row.id + ' lies further from its spoke than the row before'); });
}
ok('eight hot hells in rows on the left of the realm, eight cold on the right, each further from its spoke');

// ── parts and entries ───────────────────────────────────────────────────────
const parts = [...w.boxes.keys()];
assert.equal(parts.length, 88);
for (const id of parts) {
  assert.ok(WHEEL_ENTRIES[id], id + ' has an entry');
  const [x, y, bw, bh] = w.boxes.get(id);
  assert.ok([x, y, bw, bh].every(Number.isFinite) && bw > 0 && bh > 0, id + ' has a box');
  assert.ok(x > -60 && y > -60 && x + bw < ART_W + 60 && y + bh < ART_H + 60, id + ' is on the wall');
}
for (const r of REALMS) {
  const [x, y, bw, bh] = w.boxes.get(r.id);
  assert.ok(Math.hypot(x + bw / 2 - C.x, y + bh / 2 - C.y) < R.realm, r.id + ' is framed inside the wheel');
}
const treeIds = WHEEL_TREE[1].filter(([id]) => id !== '—').map(([id]) => id);
assert.equal(new Set(treeIds).size, treeIds.length, 'no entry twice in the index');
assert.deepEqual(new Set(treeIds), new Set(Object.keys(WHEEL_ENTRIES)), 'the index and the entries are the same set');
for (const [id, e] of Object.entries(WHEEL_ENTRIES)) {
  assert.ok(e.t && e.meta && e.b && e.src, id + ' has a name, a line over it, a body and a source');
  assert.ok(/^wl_/.test(id), id + ' is the wheel\'s');
  if (e.tib) assert.match(e.tib, /[ༀ-࿿]/, id + ' gives its Tibetan in Tibetan script');
  for (const r of e.rel || []) if (/^wl_/.test(r)) assert.ok(WHEEL_ENTRIES[r], id + ' points to ' + r);
}
for (const [from, to] of Object.entries(WHEEL_ALSO)) assert.ok(w.boxes.has(to), from + ' is framed on ' + to);
const index = Object.keys(WHEEL_ENTRIES).filter((id) => !w.boxes.has(id));
assert.deepEqual(index.sort(), ['wl_hell_ephemeral', 'wl_munis', 'wl_nidanas', 'wl_verse'], 'only four entries stand in the index alone');
for (const [id] of w.shapes) assert.ok(w.where.has(id) && w.layers.find((l) => l.name === w.where.get(id)).svg.includes('data-wl="' + id + '"'), id + ' is outlined in its layer');
ok('88 parts on the wall, every one an entry and an outline; the index holds them all and four more');

// ── the view ────────────────────────────────────────────────────────────────
const dom = new JSDOM('<!doctype html><section class="wheel-stage"></section>', { pretendToBeVisual: true });
const doc = dom.window.document, host = doc.querySelector('.wheel-stage');
Object.defineProperties(host, { clientWidth: { get: () => 1200 }, clientHeight: { get: () => 800 } });
host.getBoundingClientRect = () => ({ left: 0, top: 0, right: 1200, bottom: 800, width: 1200, height: 800 });
let drawnTimes = 0;
const view = viewMod.createWheelView({ host, art: () => { drawnTimes++; return drawWheel(); },
  freeRect: () => ({ x: 600, y: 400, w: 1200, h: 800 }), reducedMotion: () => true, titleOf: (id) => WHEEL_ENTRIES[id].t });
assert.equal(view.has('wl_hub_pig'), true, 'it can say what is on the wall');
assert.equal(host.querySelectorAll('.wl-layer').length, 0, 'without building it');
view.build();
assert.equal(host.querySelectorAll('.wl-layer').length, 7);
assert.equal(host.querySelectorAll('.wl-layer image').length, RELIEF.layers.reduce((n, l) => n + l.images.length, 0), 'every picture is set up');
assert.equal(drawnTimes, 1, 'the drawing is made once');
view.home(0);
const home = view.state().view;
assert.ok(Math.abs(home.x - ART_W / 2) < 1 && Math.abs(home.y - ART_H / 2) < 1, 'home is the whole relief');
assert.ok(Math.abs(home.s - Math.min(1200 / ART_W, 800 / ART_H) * 0.97) < 1e-6, 'fitted to the free rectangle');
assert.ok(view.isHome());
const vb = host.querySelector('.wl-layer').getAttribute('viewBox').split(' ').map(Number);
assert.ok(Math.abs(vb[0] + vb[2] / 2 - ART_W / 2) < 1 && Math.abs(vb[1] + vb[3] / 2 - ART_H / 2) < 1, 'the viewBox is centred on the relief');
// focus: the part's box in the middle of the free rectangle, closer than home
view.focus('wl_nidana_ignorance', 0);
const b = view.boxOf('wl_nidana_ignorance'), f = view.state().view;
assert.ok(Math.abs(f.x - (b[0] + b[2] / 2)) < 1e-6 && Math.abs(f.y - (b[1] + b[3] / 2)) < 1e-6, 'focus centres the part');
assert.ok(f.s > home.s * 2 && f.s <= home.s * 7 + 1e-9, 'and comes close, but not too close');
assert.equal(view.focus('no_such_part', 0), false, 'a part that is not there is not flown to');
// the turn is bounded
view.turnBy(-500, 500);
assert.deepEqual([view.state().turn.x, view.state().turn.y], [viewMod.TILT.x, -viewMod.TILT.y]);
assert.match(host.querySelector('.wl-tilt').style.transform, /rotateX\(14\.00deg\) rotateY\(-22\.00deg\)/, 'the stack is turned');
const zs = [...host.querySelectorAll('.wl-layer')].map((svg) => Number((/translateZ\(([\d.]+)px\)/.exec(svg.style.transform) || [0, 0])[1]));
assert.ok(zs.every((z, i) => i === 0 || z > zs[i - 1]), 'and every layer stands further out than the one behind it');
view.home(0);
assert.ok(view.isHome(), 'home straightens it');
// selection marks every layer's share of a part, and only that part
view.select('wl_realm_hells');
const marked = [...host.querySelectorAll('.wl-sel')].map((el) => el.getAttribute('data-wl'));
assert.ok(marked.length >= 1 && marked.every((id) => id === 'wl_realm_hells'));
view.select('wl_hell_judge');
assert.deepEqual([...new Set([...host.querySelectorAll('.wl-sel')].map((el) => el.getAttribute('data-wl')))], ['wl_hell_judge']);
const veil = host.querySelector('.wl-veil').getAttribute('d');
assert.ok(veil.endsWith(w.shapes.get('wl_hell_judge')), 'everything else is veiled, with the judge cut out of the veil');
const veilBox = /^M(-?\d+) (-?\d+)H(-?\d+)V(-?\d+)/.exec(veil).slice(1).map(Number);
assert.ok(veilBox.every((v) => Math.abs(v) < 4000), 'and the veil is no larger than the screen and a margin, which the browser will composite');
view.select(null);
assert.equal(host.querySelectorAll('.wl-sel').length, 0);
assert.equal(host.querySelector('.wl-veil').getAttribute('d'), '', 'and nothing is veiled when nothing is picked');
// a tap names the innermost part; a drag is not a tap
const picked = [];
view.on('pick', (id) => picked.push(id));
const at = (el, type, x, y, extra = {}) => el.dispatchEvent(new dom.window.MouseEvent(type, { bubbles: true, clientX: x, clientY: y, button: 0, ...extra }));
const snake = host.querySelector('.wl-wheel [data-wl="wl_hub_snake"]');
at(snake, 'pointerdown', 100, 100); at(snake, 'pointerup', 100, 100);
assert.deepEqual(picked, ['wl_hub_snake'], 'the snake, not the hub it is in');
const wall = host.querySelector('.wl-wall rect');
at(wall, 'pointerdown', 100, 100); at(wall, 'pointerup', 101, 100);
assert.deepEqual(picked, ['wl_hub_snake', null], 'the bare wall is nothing');
at(snake, 'pointerdown', 100, 100); at(snake, 'pointermove', 160, 130, { buttons: 1 }); at(snake, 'pointerup', 160, 130);
assert.equal(picked.length, 2, 'a drag picks nothing');
assert.ok(Math.abs(view.state().turn.y) > 0, 'seen whole, a drag turns the wall');
// zooming about a point keeps that point under the pointer
view.home(0);
const px = 300, py = 200;
const under = (s0) => ({ x: s0.x + (px - 600) / s0.s, y: s0.y + (py - 400) / s0.s });
const before = under(view.state().view);
host.dispatchEvent(new dom.window.WheelEvent('wheel', { deltaY: -300, clientX: px, clientY: py, bubbles: true, cancelable: true }));
const after = under(view.state().view);
assert.ok(view.state().view.s > home.s, 'the wheel zooms in');
assert.ok(Math.abs(after.x - before.x) < 1e-6 && Math.abs(after.y - before.y) < 1e-6, 'about the pointer');
// close in, the same drag slides the wall rather than turning it
const t0 = { ...view.state().turn }, v0 = { ...view.state().view };
at(snake, 'pointerdown', 400, 400); at(snake, 'pointermove', 460, 400, { buttons: 1 }); at(snake, 'pointerup', 460, 400);
assert.deepEqual(view.state().turn, t0, 'close in, the wall does not turn');
assert.ok(Math.abs(view.state().view.x - (v0.x - 60 / v0.s)) < 1e-6, 'it slides under the hand');
// every part is a keyboard stop once, and Enter picks it
const stops = [...host.querySelectorAll('[data-wl][tabindex="0"]')].map((el) => el.getAttribute('data-wl'));
assert.equal(stops.length, 88); assert.equal(new Set(stops).size, 88);
host.querySelector('[data-wl="wl_nidana_birth"][tabindex="0"]').dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
assert.equal(picked.at(-1), 'wl_nidana_birth', 'Enter picks the part in focus');
ok('the view: fitted home, focus, a bounded turn, taps, drags, zoom about the pointer, and the keyboard');

console.log('\nwheel-of-life: the relief in six layers, 88 parts, 12 links, 6 realms, 16 hells in their rows, and a wall that turns but not round.');
