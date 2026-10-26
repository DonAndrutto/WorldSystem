// Run against a local server (WORLDSYSTEM_URL, default http://127.0.0.1:4175/)
// with WORLDSYSTEM_PLAYWRIGHT pointing at Playwright. WORLDSYSTEM_CHANNEL
// defaults to 'chrome'; WORLDSYSTEM_CHANNEL=chromium runs Playwright's own
// Chromium where Chrome is not installed. WORLDSYSTEM_BROWSER=webkit|firefox
// runs another engine (what each makes of a failed module is the point).
//
// The seated Buddhas' sculpted meshes (squares 77, 93, 100, 101) are two data
// modules fetched after the page. This breaks that request in every way the
// network can and checks what the reader sees and what the page asks for:
//   delayed           the note, the stand-ins, the swap, one request per file
//   failed, retried   the note and its Retry, a retry that fails, one that works
//   no overlap        a finger on Retry makes one request, not a hundred
//   modes and reload  switching away and back, reloading, mid-request
//   offline mid-load  the request dies with the network and is asked again on its return
//   complete cache    an installed copy, offline, with the meshes on its shelf
//   no complete cache an installed copy, offline, with them missing: a stand-in and a note
// None of it needs the game to be played.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const engines = createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const engine = process.env.WORLDSYSTEM_BROWSER || 'chromium';
const base = process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4175/';
const output = process.env.WORLDSYSTEM_SCREENSHOTS;
if (output) fs.mkdirSync(output, {recursive:true});
const browser = await engines[engine].launch({headless:true, ...(engine === 'chromium' ? {channel:process.env.WORLDSYSTEM_CHANNEL || 'chrome', args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']} : {})});
const BUDDHAS = [77, 93, 100, 101];
const PREFS = {'ws-game-walkthrough-v1':'dismissed','ws-game-onboarded':'1','ws-game-view':'world','ws-game-pace':'instant','ws-index':'0','ws-sound':'0','ws-music':'0','ws-game-follow':'0','ws-motion':'0'};
const DATA = /\/sculpture-(robe|anatomy)-data\.js/;
let passed = 0;

async function open({language, route, serviceWorkers = 'block', width = 390, height = 844, context} = {}) {
  context ||= await browser.newContext({viewport:{width, height}, hasTouch:true, isMobile:engine !== 'firefox', serviceWorkers});
  const seen = [];
  context.on('request', request => { if (DATA.test(request.url())) seen.push(request.url().replace(/^.*\//, '')); });
  if (route) await context.route(DATA, route);
  await context.addInitScript(({prefs, language}) => {
    if (sessionStorage.getItem('seeded')) return;
    sessionStorage.setItem('seeded', '1');
    for (const [key, value] of Object.entries(prefs)) localStorage.setItem(key, value);
    if (language) localStorage.setItem('ws-language', language);
  }, {prefs:PREFS, language});
  const page = await context.newPage(), errors = [];
  // a request the test broke on purpose is the page's console's business, not an error of the page's
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:120000});
  await page.locator('.app-intro').waitFor({state:'hidden', timeout:30000}).catch(() => {});
  return {context, page, errors, seen};
}
async function enterGame(page) {
  await page.locator('[data-menu=mode]>summary').click();
  await page.locator('[data-mode=game]').click();
  await page.locator('body.world-only').waitFor({timeout:30000});
}
async function leaveGame(page, mode = 'explore') {
  await page.locator('[data-menu=mode]>summary').click();
  await page.locator('[data-mode=' + mode + ']').click();
  await page.locator('body.world-only').waitFor({state:'detached', timeout:30000});
}
// what stands in the scene for each of the four squares
const figures = page => page.evaluate(squares => {
  const found = Object.fromEntries(squares.map(n => [n, []]));
  document.querySelector('three-d-stage')._scene.traverse(object => {
    const match = /^rebirth_model_(\d+)$/.exec(object.name);
    if (match && object.isGroup && found[match[1]]) found[match[1]].push(object.userData.standIn ? 'standIn' : 'sculpted');
  });
  return found;
}, BUDDHAS);
const states = async page => Object.values(await figures(page)).flat().sort().join();
const until = async (page, fn, what, timeout = 60000) => {
  try { await page.waitForFunction(fn, {}, {timeout}); } catch (error) { throw new Error('timed out waiting for ' + what + '; figures ' + JSON.stringify(await figures(page))); }
};
const standIns = page => until(page, squares => {
  let count = 0;
  document.querySelector('three-d-stage')._scene.traverse(o => { if (/^rebirth_model_(77|93|100|101)$/.test(o.name) && o.isGroup && o.userData.standIn) count++; });
  return count === 4;
}, 'four stand-ins');
const sculpted = page => until(page, () => {
  const found = {};
  document.querySelector('three-d-stage')._scene.traverse(o => { const m = /^rebirth_model_(77|93|100|101)$/.exec(o.name); if (m && o.isGroup) (found[m[1]] ||= []).push(!o.userData.standIn); });
  return Object.keys(found).length === 4 && Object.values(found).every(list => list.length === 1 && list[0]);
}, 'four sculpted figures, one each');
const note = page => page.locator('.sculpt-note');
// the note says its words once the request has settled, not when it first appears
const says = async (page, pattern) => {
  try { await page.waitForFunction(source => { const n = document.querySelector('.sculpt-note'); return !n.hidden && new RegExp(source).test(n.innerText); }, pattern.source, {timeout:60000}); }
  catch (error) { throw new Error('the note never said ' + pattern + '; it says ' + JSON.stringify(await note(page).innerText())); }
};
const shot = async (page, name) => { if (output) await page.screenshot({path:output + '/sculpture-' + engine + '-' + name + '.png'}); };
const done = name => { passed += 1; console.log('PASS', name); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const count = (seen, file) => seen.filter(url => url.startsWith(file)).length;

try {
  // ── as usual ────────────────────────────────────────────────────────────────
  {
    const {context, page, errors, seen} = await open();
    await enterGame(page);
    await sculpted(page);
    assert.equal(await note(page).isHidden(), true, 'a request that comes at once is never announced');
    assert.equal(count(seen, 'sculpture-robe-data.js') + count(seen, 'sculpture-anatomy-data.js'), 2, 'two files, once each');
    assert.deepEqual(errors, []);
    await context.close(); done('as usual: sculpted figures, no note, two requests');
  }

  // ── delayed ─────────────────────────────────────────────────────────────────
  {
    let release; const gate = new Promise(resolve => { release = resolve; });
    const {context, page, errors, seen} = await open({route: async route => { await gate; await route.continue(); }});
    await enterGame(page);
    await note(page).waitFor({state:'visible', timeout:15000});
    assert.match(await note(page).innerText(), /Loading the sculpted buddhas/);
    assert.equal(await note(page).locator('[data-sculpture-retry]').isHidden(), true, 'nothing to retry while it is on its way');
    await standIns(page);
    assert.deepEqual(await figures(page), {77:['standIn'], 93:['standIn'], 100:['standIn'], 101:['standIn']});
    await shot(page, 'delayed');
    // the game is playable meanwhile: a field can be selected and says the same thing
    await page.locator('[data-layout=board]').first().click();
    await page.locator('.bv-sq[data-square="93"]').click();
    assert.match(await page.locator('.bv-where').innerText(), /93/);
    await page.keyboard.press('Escape');       // the entry the cell opened
    await page.locator('[data-layout=world]').first().click();
    assert.equal(await page.locator('.bv-where').innerText().then(t => /93/.test(t)), true, 'the selection is the same square');
    release();
    await sculpted(page);
    await note(page).waitFor({state:'hidden', timeout:10000});
    assert.match(await page.locator('.bv-where').innerText(), /93/, 'still square 93 once the sculpture replaces its stand-in');
    assert.equal(count(seen, 'sculpture-robe-data.js'), 1); assert.equal(count(seen, 'sculpture-anatomy-data.js'), 1);
    assert.deepEqual(errors, []);
    await context.close(); done('delayed: note after a moment, stand-ins, one swap, one request per file');
  }

  // ── failed, then retried ────────────────────────────────────────────────────
  {
    let mode = 'fail';
    const {context, page, errors, seen} = await open({route: route => mode === 'fail' ? route.abort('failed') : route.continue()});
    await enterGame(page);
    await says(page, /could not be loaded/);
    const retry = note(page).locator('[data-sculpture-retry]');
    await retry.waitFor({state:'visible'});
    await standIns(page);
    await shot(page, 'failed');
    assert.equal(await page.locator('.bv-throw, [data-game=throw]').first().isEnabled(), true, 'the game is usable with the stand-ins');
    // a retry while it is still broken: the same note, a new address, still the same four stand-ins
    await retry.click();
    await until(page, () => !document.querySelector('[data-sculpture-retry]').hidden && !document.querySelector('.sculpt-note').hidden, 'the failure to be reported again');
    assert.ok(seen.includes('sculpture-robe-data.js?retry=2'), 'asked again under a new address: ' + seen);
    await standIns(page);
    // and one that works, with a finger that lands twice
    mode = 'ok';
    await retry.dblclick({delay:10}).catch(async () => { await retry.click(); });
    await sculpted(page);
    await note(page).waitFor({state:'hidden', timeout:10000});
    assert.equal(count(seen, 'sculpture-robe-data.js?retry=3'), 1, 'one request for the third try, not two: ' + seen);
    assert.equal(seen.filter(url => /retry=(?!2|3)/.test(url)).length, 0, 'no runaway: ' + seen);
    assert.deepEqual(errors, []);
    await shot(page, 'recovered');
    await context.close(); done('failed, retried while broken, then recovered; one request per try');
  }

  // ── the browser itself does not ask again for a failed module ───────────────
  {
    let fail = true;
    const {context, page} = await open({route: route => fail ? route.abort('failed') : route.continue()});
    const results = await page.evaluate(async () => {
      const ask = async url => { try { await import(url); return 'ok'; } catch (error) { return 'failed'; } };
      return {first: await ask('/sculpture-anatomy-data.js?probe'), }
    });
    fail = false;
    const again = await page.evaluate(async () => {
      const ask = async url => { try { await import(url); return 'ok'; } catch (error) { return 'failed'; } };
      return {same: await ask('/sculpture-anatomy-data.js?probe'), changed: await ask('/sculpture-anatomy-data.js?probe=2')};
    });
    assert.equal(results.first, 'failed');
    assert.equal(again.changed, 'ok', 'a new address is a new module');
    // recorded rather than asserted: this is what the retry's new address is for, and engines differ
    console.log('     ' + engine + ': the same address after a failure answers "' + again.same + '", a new one "' + again.changed + '"');
    await context.close(); done('a new address succeeds where the engine may remember the failure');
  }

  // ── switching modes and reloading ───────────────────────────────────────────
  {
    let release; const gate = new Promise(resolve => { release = resolve; });
    const {context, page, seen} = await open({route: async route => { await gate; await route.continue(); }});
    await enterGame(page);
    await standIns(page);
    await leaveGame(page);
    await enterGame(page);
    await leaveGame(page, 'mandala');
    await enterGame(page);
    assert.deepEqual(await figures(page), {77:['standIn'], 93:['standIn'], 100:['standIn'], 101:['standIn']}, 'one stand-in each after going away and back');
    release();
    await sculpted(page);
    assert.equal(count(seen, 'sculpture-robe-data.js'), 1, 'one request however often the mode changed');
    // reloading: a fresh page, nothing carried over, nothing doubled
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:120000});
    await enterGame(page);
    await sculpted(page);
    assert.equal(count(seen, 'sculpture-robe-data.js'), 2, 'a reload asks once more, once');
    await context.close(); done('mode changes join one request; a reload starts clean');
  }

  // ── going offline while it is loading ───────────────────────────────────────
  {
    // the request is in flight when the network goes, and dies with it
    let drop; const gate = new Promise(resolve => { drop = resolve; });
    const {context, page, seen} = await open({route: async route => { await gate; await route.abort('internetdisconnected').catch(() => {}); }});
    await enterGame(page);
    await context.setOffline(true);
    drop();
    await says(page, /You are offline/);
    await standIns(page);
    await shot(page, 'offline');
    await context.unroute(DATA);
    await context.setOffline(false);                // the browser says online: one more try, by itself
    await sculpted(page);
    await note(page).waitFor({state:'hidden', timeout:10000});
    assert.ok(seen.some(url => /\?retry=2$/.test(url)), 'asked again when the connection came back: ' + seen);
    await context.close(); done('offline mid-load: the note says so, and the return of the network retries once');
  }

  // ── an installed copy ───────────────────────────────────────────────────────
  {
    // in Polish: the language pack and the sculpted figures are both on the shelf
    const {context, page, seen, errors} = await open({serviceWorkers:'allow', language:'pl'});
    await page.evaluate(() => navigator.serviceWorker.ready);
    await until(page, async () => {
      const keys = await caches.keys();
      const shelf = keys.find(k => /^world-system-[0-9a-f]+$/.test(k));
      if (!shelf) return false;
      const cache = await caches.open(shelf);
      return !!(await cache.match('sculpture-robe-data.js')) && !!(await cache.match('sculpture-anatomy-data.js')) && !!(await cache.match('index.html'));
    }, 'the shelf to be complete', 120000);
    assert.equal(await page.evaluate(async () => !!(await caches.match('sculpture-robe-detail.js'))), false, 'the study meshes are not on the shelf');
    await page.evaluate(() => navigator.serviceWorker.controller || new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, {once:true})));
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:120000});
    await context.setOffline(true);
    // a retry's address is answered from the shelf, with the query ignored
    const viaShelf = await page.evaluate(async () => { try { const m = await import('/sculpture-robe-data.js?retry=9'); return Object.keys(m).join(); } catch (error) { return 'failed: ' + error.message; } });
    assert.equal(viaShelf, 'ROBES', 'the shelf answers a retry address');
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:120000});
    await enterGame(page);
    await sculpted(page);
    assert.equal(await note(page).isHidden(), true, 'nothing to say with the meshes on the shelf');
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'pl', 'the Polish pack came from the shelf');
    assert.equal(await page.locator('[data-menu=mode] > summary .t').textContent(), 'Gra');
    await shot(page, 'installed-offline');
    assert.deepEqual(errors, []);

    // the same copy with the meshes missing from its shelf: the stand-ins, the note, a retry that can only fail
    await context.setOffline(false);
    await page.evaluate(async () => {
      for (const key of await caches.keys()) { const cache = await caches.open(key); await cache.delete('sculpture-robe-data.js'); await cache.delete('sculpture-anatomy-data.js'); }
    });
    // what the browser's own HTTP cache still holds would answer in the shelf's place
    if (engine === 'chromium') await (await context.newCDPSession(page)).send('Network.clearBrowserCache');
    await context.setOffline(true);
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:120000});
    await enterGame(page);
    await says(page, /Nie udało się wczytać|Brak połączenia/);
    await standIns(page);
    await shot(page, 'installed-offline-no-meshes');
    const retry = note(page).locator('[data-sculpture-retry]');
    await retry.click();
    await until(page, () => !document.querySelector('[data-sculpture-retry]').hidden, 'the retry to fail');
    await standIns(page);
    assert.equal(await page.locator('[data-game=throw]').first().isEnabled(), true, 'the game is still playable');
    // and the connection returns. (A page reloaded under Playwright's offline mode
    // still believes navigator.onLine, so no `online` event comes; the explicit retry is
    // what a reader has, and it works.)
    await context.setOffline(false);
    await retry.click();
    await sculpted(page);
    await note(page).waitFor({state:'hidden', timeout:10000});
    await context.close(); done('installed copy: complete shelf offline is whole; incomplete shelf shows a stand-in and recovers online');
  }

  // ── Polish ──────────────────────────────────────────────────────────────────
  {
    const {context, page} = await open({language:'pl', route: route => route.abort('failed')});
    await enterGame(page);
    await says(page, /Nie udało się wczytać rzeźbionych buddów/);
    assert.equal(await note(page).locator('[data-sculpture-retry]').textContent(), 'Spróbuj ponownie');
    const box = await note(page).boundingBox(), rail = await page.locator('.bv-rail').boundingBox();
    assert.ok(box.x >= 0 && box.x + box.width <= 390 && box.y >= rail.y + rail.height - 1, 'the note stands below the rail, within the screen: ' + JSON.stringify({box, rail}));
    await shot(page, 'failed-pl');
    await context.close(); done('Polish: the note and its button, clear of the rail');
  }
  console.log('sculpture recovery:', passed, 'scenarios passed in', engine);
} finally { await browser.close(); }
