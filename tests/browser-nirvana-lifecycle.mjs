// Run against a local server (WORLDSYSTEM_URL, default http://127.0.0.1:4175/)
// with WORLDSYSTEM_PLAYWRIGHT pointing at Playwright. WORLDSYSTEM_CHANNEL
// defaults to 'chrome'; WORLDSYSTEM_CHANNEL=chromium runs Playwright's own
// Chromium where Chrome is not installed.
//
// Reaching Nirvana (square 104) in the world: the eye stands back, a light climbs
// the strands, the eye comes to the stupa as it blazes (nirvana-finale.js,
// index.html rbCelebrate). The finale is a thing in time, and a phone's page is
// not always there for all of it. This plays it, and does to it what a reader
// does: leaves for another mode, turns the board over it, begins again, reloads,
// puts the page in the background and brings it back — and says what must be so
// afterwards: the eye where it should be, the light on or off, nothing thrown,
// nothing left to fire in another mode.
// A fixed game one throw short of Nirvana stands in for sixteen throws: the
// rolls are those of a one-player game, found by search, that end at 104.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const engines = createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const engine = process.env.WORLDSYSTEM_BROWSER || 'chromium';
const base = process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4175/';
const output = process.env.WORLDSYSTEM_SCREENSHOTS;
if (output) fs.mkdirSync(output, {recursive:true});
const browser = await engines[engine].launch({headless:true, ...(engine === 'chromium' ? {channel:process.env.WORLDSYSTEM_CHANNEL || 'chrome', args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']} : {})});
const WIN = [2, 2, 2, 5, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const SESSION = 'ws-game-session-v1';
const session = rolls => JSON.stringify({version:1, names:['Traveller'], skins:[null], colours:[null], note64:false, rolls, pending:null});
let passed = 0;
const done = name => { passed += 1; console.log('PASS', name); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function open({width = 390, height = 844, pace = 'calm', reducedMotion = 'no-preference', rolls = WIN.slice(0, 16), view = 'world', context} = {}) {
  context ||= await browser.newContext({viewport:{width, height}, hasTouch:true, isMobile:engine !== 'firefox', serviceWorkers:'block', reducedMotion});
  await context.addInitScript(({rolls, pace, view, key}) => {
    if (!sessionStorage.getItem('seeded')) {
      sessionStorage.setItem('seeded', '1');
      const prefs = {'ws-game-walkthrough-v1':'dismissed','ws-game-onboarded':'1','ws-game-view':view,'ws-game-pace':pace,'ws-index':'0','ws-sound':'0','ws-music':'0','ws-game-follow':'1','ws-motion':'0'};
      for (const [k, v] of Object.entries(prefs)) localStorage.setItem(k, v);
      if (rolls) localStorage.setItem(key, rolls);
    }
    Math.random = () => 0;          // every die is a 1: from square 98 that is the last step
  }, {rolls:rolls && session(rolls), pace, view, key:SESSION});
  const page = await context.newPage(), errors = [];
  page.setDefaultTimeout(120000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
  await page.locator('.app-intro').waitFor({state:'hidden', timeout:30000}).catch(() => {});
  return {context, page, errors};
}
const mode = async (page, id) => { await page.locator('[data-menu=mode]>summary').click(); await page.locator('[data-mode=' + id + ']').click(); };
async function enterGame(page) {
  await mode(page, 'game');
  await page.locator('body.game-view').waitFor();
  if (await page.locator('.upright').isVisible().catch(() => false)) await page.locator('.upright [data-upright=world]').click();
}
// where the eye is and where it looks, the finale's light, and whether the stupa's
const eye = page => page.evaluate(() => {
  const stage = document.querySelector('three-d-stage'), scene = stage._scene;
  let finale = null, stupa = null, over = null;
  scene.traverse(o => {
    if (o.name === 'nirvana_finale') finale = o;
    if (o.name === 'rebirth_model_104' && o.isGroup) stupa = o;
  });
  const at = stupa ? stupa.getWorldPosition(new stage._THREE.Vector3()) : null;
  const camera = stage._camera.position, target = stage._controls.target;
  return {
    camera:camera.toArray(), target:target.toArray(), stupa:at && at.toArray(),
    finale:finale ? {visible:finale.visible, boardVisible:finale.parent.visible} : null,
    attained:document.querySelector('.bv-sq[data-victory]').classList.contains('attained'),
    mode:[...document.body.classList].filter(c => /^(game-view|world-only|board-only)$/.test(c)).join(' '),
    frames:stage._renderer.info.render.frame
  };
});
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const until = async (page, fn, what, arg, timeout = 120000) => {
  try { await page.waitForFunction(fn, arg, {timeout}); } catch (error) { throw new Error('timed out waiting for ' + what + '; ' + JSON.stringify(await eye(page))); }
};
const attained = page => until(page, () => document.querySelector('.bv-sq[data-victory]').classList.contains('attained'), 'Nirvana to be reached');
// the card that announces a throw stands over everything, and the first tap anywhere only clears it
const clearCard = async page => { const close = page.locator('.bv-card:not([hidden]) [data-game=card-close]'); if (await close.isVisible().catch(() => false)) { await close.click(); await sleep(600); } };
// the eye is still when two looks, a little apart, find it in the same place
const stillEye = async (page, gap = 2500, rounds = 12) => {
  let last = await eye(page);
  for (let i = 0; i < rounds; i += 1) {
    await sleep(gap);
    const now = await eye(page);
    if (distance(now.target, last.target) < 1e-3 && distance(now.camera, last.camera) < 1e-3) return now;
    last = now;
  }
  throw new Error('the eye never came to rest: ' + JSON.stringify(last));
};
const shot = async (page, name) => { if (output) await page.screenshot({path:output + '/nirvana-' + engine + '-' + name + '.png', timeout:120000}); };
// leave for `id` in the very turn Nirvana is reached, before anything timed has run
const leaveOnArrival = (page, id) => page.evaluate(id => {
  const cell = document.querySelector('.bv-sq[data-victory]');
  new MutationObserver((records, observer) => {
    if (!cell.classList.contains('attained')) return;
    observer.disconnect();
    document.querySelector('[data-mode=' + id + ']').click();
  }).observe(cell, {attributes:true, attributeFilter:['class']});
}, id);

try {
  // ── the celebration, in full ────────────────────────────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    const before = await eye(page);
    assert.equal(before.finale, null, 'nothing of the finale is built before Nirvana');
    await page.locator('[data-game=throw]').click();
    await attained(page);
    // the eye stands back to see the whole ascent, then comes to the stupa
    await sleep(2800);
    const standing = await eye(page);
    assert.equal(standing.finale.visible, true, 'the light is on');
    const standDistance = distance(standing.camera, standing.stupa);
    assert.ok(standDistance > distance(before.camera, before.stupa) * 1.5, 'the eye has stood back to take in the ascent: ' + standDistance.toFixed(1) + ' from the stupa, against ' + distance(before.camera, before.stupa).toFixed(1) + ' before');
    await clearCard(page);                        // the arrival card stands over the world until it is touched
    await sleep(1200);
    await shot(page, 'celebration-ascent');
    await until(page, d => { const s = document.querySelector('three-d-stage'); let m = null; s._scene.traverse(o => { if (o.name === 'rebirth_model_104' && o.isGroup) m = o; }); return s._camera.position.distanceTo(m.getWorldPosition(new s._THREE.Vector3())) < d * 0.6; }, 'the eye to come to the stupa', standDistance, 90000);
    await stillEye(page);
    const close = await eye(page);
    assert.ok(close.attained && close.finale.visible);
    await shot(page, 'celebration-stupa');
    assert.deepEqual(errors, []);
    await context.close(); done('the celebration: the light comes on and the eye comes to the stupa');
  }

  // ── leaving for another mode before the celebration ─────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await leaveOnArrival(page, 'explore');
    await page.locator('[data-game=throw]').click();
    await until(page, () => document.body.classList.contains('game-view') === false && document.querySelector('.bv-sq[data-victory]').classList.contains('attained'), 'the mode to change on arrival');
    await sleep(2500);                                 // the explorer's own flight home is over
    const there = await eye(page);
    await sleep(6000);                                 // longer than the celebration's delay and its first flight
    const later = await eye(page);
    assert.deepEqual(later.target.map(v => +v.toFixed(3)), there.target.map(v => +v.toFixed(3)), 'the eye does not leave the explorer for a stupa it cannot see');
    assert.deepEqual(later.camera.map(v => +v.toFixed(3)), there.camera.map(v => +v.toFixed(3)));
    // the won game is lit, settled, in the board's own group, which the explorer does not draw
    assert.ok(later.finale === null || later.finale.boardVisible === false, 'and nothing of the finale is in the explorer\'s view: ' + JSON.stringify(later.finale));
    // back in the game, the game is as it was left: won, and quietly lit
    await mode(page, 'game');
    await page.locator('body.game-view').waitFor();
    if (await page.locator('.upright').isVisible().catch(() => false)) await page.locator('.upright [data-upright=world]').click();
    await until(page, () => { let f = null; document.querySelector('three-d-stage')._scene.traverse(o => { if (o.name === 'nirvana_finale') f = o; }); return !!f && f.visible; }, 'the stupa to be lit on coming back');
    assert.equal((await eye(page)).attained, true);
    assert.deepEqual(errors, []);
    await context.close(); done('leaving at the moment of arrival: no flight in the explorer, the light on at the return');
  }

  // ── the board turned over it, and the world again ───────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await page.locator('[data-game=throw]').click();
    await attained(page);
    await sleep(4000);
    await clearCard(page);
    await page.locator('[data-layout=board]').first().click();
    await page.locator('body.board-only').waitFor();
    await sleep(2500);                                 // time passes with nobody to see it
    await page.locator('[data-layout=world]').first().click();
    await page.locator('body.world-only').waitFor();
    await sleep(2500);
    const back = await eye(page);
    assert.equal(back.finale.visible, true, 'the light is still on');
    assert.ok(back.attained);
    assert.equal((await page.locator('.bv-sq[data-victory]').getAttribute('aria-selected')), 'true');
    assert.deepEqual(errors, []);
    await shot(page, 'board-and-back');
    await context.close(); done('the board over the finale and the world again: the light stays, the win stays');
  }

  // ── put in the background, and brought back ─────────────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await page.locator('[data-game=throw]').click();
    await attained(page);
    await sleep(2500);
    const framesBefore = (await eye(page)).frames;
    const hide = hidden => page.evaluate(hidden => {
      Object.defineProperty(document, 'hidden', {configurable:true, get: () => hidden});
      Object.defineProperty(document, 'visibilityState', {configurable:true, get: () => hidden ? 'hidden' : 'visible'});
      document.dispatchEvent(new Event('visibilitychange'));
      if (hidden) window.dispatchEvent(new PageTransitionEvent('pagehide', {persisted:true})); else window.dispatchEvent(new PageTransitionEvent('pageshow', {persisted:true}));
    }, hidden);
    await hide(true);
    await sleep(1500);
    const asleep = (await eye(page)).frames;
    await sleep(1500);
    assert.equal((await eye(page)).frames, asleep, 'nothing is drawn while the page is away');
    await sleep(14000);                                // longer than the whole finale
    await hide(false);
    await sleep(3000);
    const back = await eye(page);
    assert.ok(back.frames > asleep, 'drawing resumes: ' + asleep + ' → ' + back.frames);
    assert.equal(back.finale.visible, true, 'the stupa is lit on return');
    assert.ok(back.attained);
    assert.ok(framesBefore <= asleep);
    // the same page is still a game: a new one starts and the light goes out
    await page.locator('.bv-tools>summary').click();
    await page.locator('.bv-new').click();
    await page.locator('[data-game=start-new]').click();
    await until(page, () => { let f = null; document.querySelector('three-d-stage')._scene.traverse(o => { if (o.name === 'nirvana_finale') f = o; }); return !!f && !f.visible; }, 'the light to go out for a new game');
    assert.equal((await eye(page)).attained, false);
    assert.deepEqual(errors, []);
    await context.close(); done('backgrounded through the finale: drawing stops, resumes, the light is on, a new game puts it out');
  }

  // ── a completed game, restored; and again ───────────────────────────────────
  {
    const {context, page, errors} = await open({rolls:WIN});
    await enterGame(page);
    await attained(page);
    await until(page, () => { let f = null; document.querySelector('three-d-stage')._scene.traverse(o => { if (o.name === 'nirvana_finale') f = o; }); return !!f && f.visible; }, 'the restored win to be lit');
    const first = await stillEye(page);       // the entry's own flight to the traveller is over
    assert.ok(first.attained);
    await sleep(4000);
    assert.deepEqual((await eye(page)).target.map(v => +v.toFixed(3)), first.target.map(v => +v.toFixed(3)), 'a restored win is shown settled, and once the eye is at rest it is not thrown about');
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
    await enterGame(page);
    await attained(page);
    assert.deepEqual(errors, []);
    await shot(page, 'restored');
    await context.close(); done('a completed game restores settled, again and again');
  }

  // ── reduced motion and Instant ──────────────────────────────────────────────
  for (const [name, options] of [['reduced motion', {reducedMotion:'reduce'}], ['the Instant pace', {pace:'instant'}]]) {
    const {context, page, errors} = await open(options);
    await enterGame(page);
    await sleep(1500);
    const start = await eye(page);
    await page.locator('[data-game=throw]').click();
    await attained(page);
    const end = await stillEye(page);
    assert.equal(end.finale.visible, true, name + ': the finale is shown');
    // already settled: nothing is carried round the eye for seconds
    await sleep(4000);
    const later = await eye(page);
    assert.deepEqual(later.camera.map(v => +v.toFixed(3)), end.camera.map(v => +v.toFixed(3)), name + ': the eye is not carried anywhere');
    assert.notEqual(start.finale?.visible, true);
    assert.deepEqual(errors, []);
    await context.close(); done(name + ': shown already settled, no flight');
  }

  // ── a small screen on its side ──────────────────────────────────────────────
  {
    const {context, page, errors} = await open({width:844, height:390});
    await enterGame(page);
    await page.locator('body.world-only').waitFor();
    await page.locator('[data-game=throw]').click();
    await attained(page);
    await sleep(4500);
    const eyeNow = await eye(page);
    assert.equal(eyeNow.finale.visible, true);
    const card = await page.locator('.bv-card').boundingBox().catch(() => null);
    const throwBtn = await page.locator('[data-game=throw]').boundingBox();
    assert.ok(throwBtn.y + throwBtn.height <= 390 + 1 && throwBtn.x + throwBtn.width <= 844 + 1, 'the throw stays on the screen on its side');
    if (card) assert.ok(card.y + card.height <= 391 && card.x >= -1 && card.x + card.width <= 845, 'the arrival card fits: ' + JSON.stringify(card));
    await shot(page, 'landscape');
    assert.deepEqual(errors, []);
    await context.close(); done('landscape 844×390: the finale plays and the card and the throw fit');
  }
  console.log('nirvana lifecycle:', passed, 'scenarios passed in', engine);
} finally { await browser.close(); }
