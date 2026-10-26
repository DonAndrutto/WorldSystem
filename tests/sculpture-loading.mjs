// Run with Node and three@0.184.0 installed for development. No browser.
// The seated Buddhas' sculpted meshes arrive after the page, and a request for
// them can fail or stall. This is what the page does about it:
//   - the loader has a state the page can watch, and a retry that works;
//   - nothing is requested twice at once, and nothing is retried on its own;
//   - the four squares are never bare: a plainer figure stands in, and the
//     sculpture replaces it, once, however it comes.
// Whether a real browser lets a failed module be asked for again is not
// something Node can say; tests/browser-sculpture-recovery.mjs asks one.
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as THREE from 'three';
const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const sculpture = await import(pathToFileURL(repo + '/seated-sculpture.js'));
const models = await import(pathToFileURL(repo + '/square-models.js'));
const { VICTORY } = await import(pathToFileURL(repo + '/rebirth-board.js'));
const { createSculptureLoader, SCULPTURE_TIMEOUT } = sculpture;

let checks = 0;
const check = async (name, fn) => { await fn(); checks += 1; console.log('  ok  ' + name); };
const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

// A stand-in for import(): every request is recorded, and each is answered when
// the test says so, by the file it asked for.
function fakeNetwork() {
  const requests = [];
  const importModule = (url) => new Promise((resolve, reject) => {
    requests.push({ url, resolve: (module) => resolve(module), reject: (error) => reject(error ?? new Error('Failed to fetch dynamically imported module: ' + url)) });
  });
  const answer = (index, ok = true) => {
    const request = requests[index];
    if (!ok) return request.reject();
    request.resolve(/robe/.test(request.url) ? { ROBES: { 'lap-game': {} } } : { ANATOMY: { 'hand-game': {} } });
  };
  return { requests, importModule, answer, urls: () => requests.map((r) => r.url) };
}
// Timers the test moves by hand.
function fakeTimers() {
  const pending = new Map();
  let next = 1;
  return {
    setTimer: (fn, ms) => { pending.set(next, { fn, ms }); return next++; },
    clearTimer: (id) => pending.delete(id),
    fire: () => { for (const [id, t] of [...pending]) { pending.delete(id); t.fn(); } },
    count: () => pending.size
  };
}
const watch = (loader) => { const seen = []; loader.subscribe((s) => seen.push(s.state)); return seen; };

await check('the first request is the plain address, and a second ask joins it', async () => {
  const net = fakeNetwork();
  const loader = createSculptureLoader({ importModule: net.importModule });
  const seen = watch(loader);
  assert.equal(loader.status().state, 'idle');
  const first = loader.load(), again = loader.load(), third = loader.retry();
  assert.deepEqual(net.urls(), ['./sculpture-robe-data.js', './sculpture-anatomy-data.js'], 'one request per file, no cache-busting yet');
  assert.equal(loader.status().state, 'loading');
  net.answer(0); net.answer(1);
  await Promise.all([first, again, third]);
  assert.ok(loader.ready());
  assert.deepEqual(seen, ['loading', 'ready']);
  assert.equal(net.requests.length, 2, 'nothing was asked for twice');
  await loader.load();
  assert.equal(net.requests.length, 2, 'and nothing once it is here');
});

await check('a failed request is seen, and the retry asks under a new address', async () => {
  const net = fakeNetwork();
  const loader = createSculptureLoader({ importModule: net.importModule, isOffline: () => false });
  const seen = watch(loader);
  const first = loader.load();
  net.answer(0, false); net.answer(1);
  await assert.rejects(first, /Failed to fetch/);
  assert.equal(loader.status().state, 'failed');
  assert.match(loader.status().error, /Failed to fetch/);
  assert.ok(!loader.ready());
  // a browser keeps a failed module as it keeps a good one: the same address
  // would fail again, so the retry's is different — and only for what is missing
  const retry = loader.retry();
  assert.deepEqual(net.urls().slice(2), ['./sculpture-robe-data.js?retry=2'], 'only the file that failed, under a new address');
  assert.equal(loader.status().state, 'loading');
  net.answer(2);
  await retry;
  assert.ok(loader.ready());
  assert.deepEqual(seen, ['loading', 'failed', 'loading', 'ready']);
});

await check('a retry that fails again fails visibly, and each one has its own address', async () => {
  const net = fakeNetwork();
  const loader = createSculptureLoader({ importModule: net.importModule });
  const first = loader.load();
  net.answer(0, false); net.answer(1, false);
  await assert.rejects(first);
  for (const attempt of [2, 3, 4]) {
    const retry = loader.retry();
    net.answer(net.requests.length - 2, false); net.answer(net.requests.length - 1, false);
    await assert.rejects(retry);
    assert.equal(loader.status().state, 'failed');
    assert.equal(loader.status().attempt, attempt);
  }
  assert.deepEqual(net.urls().slice(2), [
    './sculpture-robe-data.js?retry=2', './sculpture-anatomy-data.js?retry=2',
    './sculpture-robe-data.js?retry=3', './sculpture-anatomy-data.js?retry=3',
    './sculpture-robe-data.js?retry=4', './sculpture-anatomy-data.js?retry=4']);
  const last = loader.retry();
  net.answer(net.requests.length - 2); net.answer(net.requests.length - 1);
  await last;
  assert.ok(loader.ready());
});

await check('retrying while a request is under way does not make a second one', async () => {
  const net = fakeNetwork();
  const loader = createSculptureLoader({ importModule: net.importModule });
  const first = loader.load();
  net.answer(0, false); net.answer(1);
  await assert.rejects(first);
  const retry = loader.retry();
  for (let i = 0; i < 5; i += 1) loader.retry();     // a finger on the button
  loader.load();
  assert.equal(net.requests.length, 3, 'one request in all for the one file still missing');
  net.answer(2);
  await retry;
  assert.equal(net.requests.length, 3);
});

await check('a request that stalls is given up on, and an answer that comes late is still taken', async () => {
  const net = fakeNetwork(), timers = fakeTimers();
  const loader = createSculptureLoader({ importModule: net.importModule, timeout: 25000, ...timers });
  const seen = watch(loader);
  const first = loader.load();
  net.answer(1);                                      // the anatomy came; the robes never answer
  assert.equal(timers.count(), 1);
  timers.fire();
  await assert.rejects(first, /did not arrive within 25 s/);
  assert.equal(loader.status().state, 'failed');
  assert.equal(timers.count(), 0, 'the clock stops with the attempt');
  net.answer(0);                                      // ... and then they do
  await tick();
  assert.ok(loader.ready(), 'taken when it arrives');
  assert.deepEqual(seen, ['loading', 'failed', 'ready']);
  assert.equal(net.requests.length, 2, 'without anyone having asked again');
  assert.equal(SCULPTURE_TIMEOUT, 25000);
});

await check('a retry after a stall asks only for the file that stalled, and does not wait for the old one', async () => {
  const net = fakeNetwork(), timers = fakeTimers();
  const loader = createSculptureLoader({ importModule: net.importModule, ...timers });
  const first = loader.load();
  net.answer(1);
  timers.fire();
  await assert.rejects(first);
  const retry = loader.retry();
  assert.deepEqual(net.urls().slice(2), ['./sculpture-robe-data.js?retry=2']);
  net.answer(2);
  await retry;
  assert.ok(loader.ready());
  net.answer(0);                                      // the stalled one, far too late, changes nothing
  await tick();
  assert.ok(loader.ready());
});

await check('a module without its data is a failure, not an endless wait', async () => {
  const loader = createSculptureLoader({ importModule: async () => ({}) });
  await assert.rejects(loader.load(), /without their data/);
  assert.equal(loader.status().state, 'failed');
});

await check('a failure says whether the network was away', async () => {
  let away = true;
  const net = fakeNetwork();
  const loader = createSculptureLoader({ importModule: net.importModule, isOffline: () => away });
  const first = loader.load();
  net.answer(0, false); net.answer(1, false);
  await assert.rejects(first);
  assert.equal(loader.status().offline, true);
  away = false;
  const retry = loader.retry();
  net.answer(2, false); net.answer(3, false);
  await assert.rejects(retry);
  assert.equal(loader.status().offline, false);
});

// ── the squares ──────────────────────────────────────────────────────────────
const WORLD_BUILT = new Set([1, 2, 3, 4, 5, 6, 7, 10, 17, 18, 19, 20, 27, 28, 29, 30, 31, 32, 35, 36, 37]);
const BUDDHAS = [77, 93, 100, 101];
const ctxOf = (extra) => ({ SUMMIT: 0.68, VICTORY, modelled: WORLD_BUILT, ...extra });
// the squares' own source of state, stood in for: the real meshes still come from the real module
function fakeSource(initial = 'loading') {
  const listeners = new Set();
  let state = initial;
  return {
    status: () => ({ state }), subscribe: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
    load: async () => {}, retried: 0, retry() { this.retried += 1; return Promise.resolve(); },
    set(next) { state = next; listeners.forEach((fn) => fn({ state })); }
  };
}
const standIns = (set) => BUDDHAS.filter((n) => set.models.get(n)?.userData.standIn);

const holdersFor = (set) => new Map(BUDDHAS.concat(24).map((n) => { const holder = new THREE.Group(); set.attach(holder, n); return [n, holder]; }));

assert.ok(!sculpture.sculptureReady(), 'nothing has fetched the real meshes yet');
const slow = fakeSource('loading'), slowRedraws = [];
const waiting = models.createSquareModels(THREE, ctxOf({ sculpture: slow, standInDelay: 60, onLoad: () => slowRedraws.push(standIns(waiting).length) }));
const waitingHolders = holdersFor(waiting);
const failing = fakeSource('failed'), failedRedraws = [];
const failed = models.createSquareModels(THREE, ctxOf({ sculpture: failing, onLoad: () => failedRedraws.push(standIns(failed).length) }));
const failedHolders = holdersFor(failed);

await check('a slow request leaves the squares alone for a moment, then stands a plainer figure in each', async () => {
  waiting.load();
  assert.deepEqual([...waiting.models.keys()], [24], 'the rest are built at once, and the four wait');
  await tick(20);
  assert.deepEqual(standIns(waiting), [], 'not yet: a quick connection should never see them');
  await tick(100);
  assert.deepEqual(standIns(waiting), BUDDHAS);
  assert.deepEqual(slowRedraws, [4], 'and the world is drawn again once');
  for (const n of BUDDHAS) assert.equal(waitingHolders.get(n).children.length, 1);
  assert.ok(waiting.built() && !waiting.sculpted());
});

await check('a failed request puts them in at once, as the same square', async () => {
  failed.load();
  assert.deepEqual(standIns(failed), BUDDHAS);
  for (const n of BUDDHAS) {
    const model = failed.models.get(n);
    assert.equal(failedHolders.get(n).children.length, 1, 'one model in the holder');
    assert.equal(model.name, 'rebirth_model_' + n);
    assert.ok(model.children.length > 0 && model.children.every((mesh) => mesh.userData.square === n && mesh.userData.model), 'picked as the same square');
  }
  assert.ok(!failed.models.get(24).userData.standIn, 'every other square is as it was');
  failed.load();
  assert.equal(failedHolders.get(93).children.length, 1, 'building again adds nothing');
  // lighting follows the square, not the figure
  failed.showActive([93]); failed.highlight(100);
  const name = (n) => failed.models.get(n).children[0].material.name;
  assert.ok(name(100).endsWith('_focus') && !name(93).endsWith('_faint') && name(77).endsWith('_faint'));
  // the explicit retry reaches the loader, and does nothing else
  failed.retry();
  assert.equal(failing.retried, 1);
  assert.deepEqual(standIns(failed), BUDDHAS);
});

await check('when the meshes come, however they come, each stand-in is replaced once and the lighting is kept', async () => {
  const before = BUDDHAS.map((n) => failed.models.get(n));
  const released = before.map((m) => { let n = 0; m.children.forEach((mesh) => { const d = mesh.geometry.dispose.bind(mesh.geometry); mesh.geometry.dispose = () => { n += 1; d(); }; }); return () => n; });
  await sculpture.loadSculpture();
  assert.ok(sculpture.sculptureReady());
  failing.set('ready');
  assert.deepEqual(standIns(failed), []);
  assert.ok(failed.sculpted() && failed.built());
  assert.deepEqual(failedRedraws, [0], 'drawn again once for the swap');
  BUDDHAS.forEach((n, i) => {
    assert.equal(failedHolders.get(n).children.length, 1, 'square ' + n + ' still has exactly one model');
    assert.notEqual(failed.models.get(n), before[i]);
    assert.equal(before[i].parent, null, 'the stand-in is out of the scene');
    assert.ok(released[i]() > 0, 'and its geometry is released');
  });
  assert.ok(failed.models.get(100).children[0].material.name.endsWith('_focus'), 'the focused square is still lit');
  assert.ok(failed.models.get(77).children[0].material.name.endsWith('_faint'));
  failing.set('ready');
  assert.equal(failedRedraws.length, 1, 'a second word that they are here changes nothing');
  // the set that was only waiting is told by the same news
  slow.set('ready');
  assert.deepEqual(standIns(waiting), []);
  assert.deepEqual(slowRedraws, [4, 0]);
  for (const n of BUDDHAS) assert.equal(waitingHolders.get(n).children.length, 1);
});

await check('with the sculpture here, nothing is ever stood in for', async () => {
  const set = models.createSquareModels(THREE, ctxOf({ sculpture: fakeSource('ready') }));
  BUDDHAS.forEach((n) => set.attach(new THREE.Group(), n));
  set.load();
  assert.deepEqual(standIns(set), []);
  assert.ok(set.sculpted());
});

await check('the stand-in is a figure of the square, within its unit', async () => {
  const materials = models.createModelMaterials(THREE);
  const kit = models.createModelKit(THREE);
  const box = new THREE.Box3();
  for (const n of BUDDHAS) {
    const standIn = models.buildSquareModel(THREE, n, materials, kit, { standIn: true });
    const real = models.buildSquareModel(THREE, n, materials, kit);
    assert.equal(standIn.userData.standIn, true);
    assert.ok(!real.userData.standIn);
    box.setFromObject(standIn);
    const a = box.getSize(new THREE.Vector3());
    box.setFromObject(real);
    const b = box.getSize(new THREE.Vector3());
    assert.ok(Math.abs(a.y - b.y) / b.y < 0.1, 'about the height of the sculpture in square ' + n + ': ' + a.y.toFixed(3) + ' against ' + b.y.toFixed(3));
    assert.ok(a.x <= 1.0001 && a.z <= 1.0001, 'and within its unit');
  }
});

console.log(checks + ' checks passed.');
