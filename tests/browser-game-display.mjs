// Run against a local server (WORLDSYSTEM_URL, default http://127.0.0.1:4175/)
// with WORLDSYSTEM_PLAYWRIGHT pointing at Playwright. WORLDSYSTEM_CHANNEL
// defaults to 'chrome'; WORLDSYSTEM_CHANNEL=chromium runs Playwright's own
// Chromium where Chrome is not installed.
//
// Options → Game display: field names, field numbers, highlights, route
// guides, move links. Each is its own switch; each acts on the board, the
// world, or both (game-display.js says which). This turns every one of them off
// and on, alone and together, in both arrangements of the game, and checks what
// changes and what must not:
//   what changes     exactly the layer's own marks, in exactly the arrangements it is drawn in
//   what stays       the player's frame, whose turn it is, the selection, the accessible names,
//                    keyboard focus, the Tibetan/English choice, the interface language, the saved game
//   what is kept     the choice across a reload, a change of mode and a change of view
//   what it cannot   change a throw, a move, a victory, or the save
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const engines = createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const engine = process.env.WORLDSYSTEM_BROWSER || 'chromium';
const base = process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4175/';
const output = process.env.WORLDSYSTEM_SCREENSHOTS;
if (output) fs.mkdirSync(output, {recursive:true});
const browser = await engines[engine].launch({headless:true, ...(engine === 'chromium' ? {channel:process.env.WORLDSYSTEM_CHANNEL || 'chrome', args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']} : {})});
const LAYERS = ['names', 'numbers', 'highlights', 'guides', 'links'];
const PREFS = {'ws-game-walkthrough-v1':'dismissed','ws-game-onboarded':'1','ws-game-view':'board','ws-game-pace':'instant','ws-index':'0','ws-sound':'0','ws-music':'0','ws-game-follow':'0','ws-motion':'0'};
const SESSION = 'ws-game-session-v1';
let passed = 0;
const done = name => { passed += 1; console.log('PASS', name); };

async function open({width = 390, height = 844, language, prefs = {}, reducedMotion = 'no-preference', random, keep, context} = {}) {
  context ||= await browser.newContext({viewport:{width, height}, hasTouch:true, isMobile:engine !== 'firefox', serviceWorkers:'block', reducedMotion});
  await context.addInitScript(({prefs, language, random, once}) => {
    if (!sessionStorage.getItem(once)) {
      sessionStorage.setItem(once, '1');
      for (const [key, value] of Object.entries(prefs)) if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
      if (language) localStorage.setItem('ws-language', language);
    }
    // the same die every time, so two games can be thrown the same
    if (random) { let i = 0; Math.random = () => (random[i++ % random.length] - 0.5) / 6; }
  }, {prefs:{...PREFS, ...prefs}, language, random, once:'seeded' + (keep || '')});
  const page = await context.newPage(), errors = [];
  page.setDefaultTimeout(120000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
  await page.locator('.app-intro').waitFor({state:'hidden', timeout:30000}).catch(() => {});
  return {context, page, errors};
}
async function enterGame(page) {
  await page.locator('[data-menu=mode]>summary').click();
  await page.locator('[data-mode=game]').click();
  await page.locator('body.game-view').waitFor();
}
async function view(page, name) {
  if (await page.locator('body.' + name + '-only').count()) return;
  await page.locator('[data-layout=' + name + ']').first().click();
  await page.locator('body.' + name + '-only').waitFor();
}
async function select(page, square) {
  await view(page, 'board');
  await page.locator('.bv-sq[data-square="' + square + '"]').click();
  await page.locator('.sheet').waitFor({state:'visible'});
  await page.keyboard.press('Escape');
  await page.locator('.sheet').waitFor({state:'hidden'});
}
async function toggle(page, layer, on) {
  const menu = page.locator('[data-menu=options]');
  if (!await menu.evaluate(m => m.open)) await menu.locator('summary').click();
  const button = menu.locator('[data-display=' + layer + ']');
  await button.scrollIntoViewIfNeeded();
  await button.click();
  assert.equal(await button.getAttribute('aria-pressed'), String(on), layer + ' reads ' + on + ' once pressed');
  await menu.locator('summary').click();
}
async function setAll(page, state) {
  for (const layer of LAYERS) if ((await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed') === 'true') !== state[layer]) await toggle(page, layer, state[layer]);
}
const ALL = Object.fromEntries(LAYERS.map(layer => [layer, true]));
const only = (...on) => Object.fromEntries(LAYERS.map(layer => [layer, on.includes(layer)]));
const without = (...off) => Object.fromEntries(LAYERS.map(layer => [layer, !off.includes(layer)]));

// ── what can be seen ──────────────────────────────────────────────────────────
// A mark is shown when it has a size and is not hidden: the visually-hidden clip
// is a size of one pixel, which is what a layer that is off looks like to the eye
// and not to a screen reader.
const seen = `(el) => { if (!el) return null; const r = el.getBoundingClientRect(), s = getComputedStyle(el);
  return r.width > 3 && r.height > 3 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0'; }`;
// 93 is the square the tests select: nobody stands on it, it has a model, and it is
// reached from squares of its own. 24 is where everybody starts.
const board = (page, square = 93) => page.evaluate(({square, seen}) => {
  const visible = eval(seen);
  const cell = document.querySelector('.bv-sq[data-square="' + square + '"]');
  const held = document.querySelector('.bv-sq[data-square="24"]');
  const reached = document.querySelector('.bv-sq.reached:not(.held)');
  const frame = el => { const s = getComputedStyle(el); return s.outlineStyle !== 'none' || (s.boxShadow !== 'none' && s.boxShadow !== '') ; };
  const plain = [...document.querySelectorAll('.bv-sq:not(.held):not(.reached):not([aria-selected="true"])')].find(c => c.dataset.square !== '104' && !c.dataset.trap);
  return {
    names: visible(plain.querySelector('.nm')), numbers: visible(plain.querySelector('.n')),
    selectedFrame: frame(cell), reachedFrame: reached ? frame(reached) : null, heldFrame: frame(held),
    selected: cell.getAttribute('aria-selected'), reachedCount: document.querySelectorAll('.bv-sq.reached').length
  };
}, {square, seen});
const world = (page) => page.evaluate(({seen}) => {
  const visible = eval(seen);
  const out = {};
  const scene = document.querySelector('three-d-stage')._scene;
  scene.traverse(o => {
    if (o.name === 'rebirth_threads') out.guides = o.visible;
    if (o.name === 'rebirth_links') out.links = o.visible;
    if (o.name === 'rebirth_model_93' && o.isGroup) out.lit = o.userData.lit;
  });
  const label = document.querySelector('.rb-label');
  out.labelShown = !label.hidden;
  out.names = visible(label.querySelector('.t'));
  out.numbers = visible(label.querySelector('.n'));
  out.chips = [...document.querySelectorAll('.rb-pl')].filter(el => !el.hidden).length;
  return out;
}, {seen});
const until = async (page, fn, what, arg) => {
  try { await page.waitForFunction(fn, arg, {timeout:120000}); } catch (error) { throw new Error('timed out waiting for ' + what); }
};
const shot = async (page, name) => { if (output) await page.screenshot({path:output + '/display-' + engine + '-' + name + '.png', timeout:120000}); };
const sculpted = page => until(page, () => { let n = 0; document.querySelector('three-d-stage')._scene.traverse(o => { if (/^rebirth_model_(77|93|100|101)$/.test(o.name) && o.isGroup && !o.userData.standIn) n++; }); return n === 4; }, 'the sculpted figures');

try {
  // ── the board: each layer alone ─────────────────────────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await select(page, 93);
    const base = await board(page);
    assert.deepEqual({names:base.names, numbers:base.numbers, selectedFrame:base.selectedFrame, heldFrame:base.heldFrame, selected:base.selected},
      {names:true, numbers:true, selectedFrame:true, heldFrame:true, selected:'true'}, 'as it always was');
    // a reached square: select 24, whose faces lead somewhere
    await select(page, 24);
    const reachedOn = await board(page, 24);
    assert.equal(reachedOn.reachedFrame, true, 'a destination is framed');
    assert.ok(reachedOn.reachedCount > 0);
    await select(page, 93);
    await shot(page, 'board-all-on');
    for (const layer of LAYERS) {
      await toggle(page, layer, false);
      const probe = await board(page);
      const expected = {...base, ...(layer === 'names' ? {names:false} : {}), ...(layer === 'numbers' ? {numbers:false} : {}), ...(layer === 'highlights' ? {selectedFrame:false, reachedFrame:base.reachedFrame === null ? null : false} : {})};
      assert.deepEqual(probe, expected, 'only ' + layer + ' changes on the board');
      await toggle(page, layer, true);
      assert.deepEqual(await board(page), base, layer + ' comes back as it was');
    }
    // the destinations' frames are the highlights', and the held square's frame is nobody's
    await select(page, 24);
    await toggle(page, 'highlights', false);
    const off = await board(page, 24);
    assert.equal(off.reachedFrame, false, 'no destination is framed with highlights off');
    assert.ok(off.reachedCount > 0, 'though the board still knows which they are');
    assert.equal(off.heldFrame, true, 'and where a player stands is still shown');
    assert.equal(off.selected, 'true');
    await toggle(page, 'highlights', true);
    // paths are the world's: the board does not change by them, and they do change in the scene
    await toggle(page, 'guides', false); await toggle(page, 'links', false);
    assert.deepEqual(await board(page, 24), {...reachedOn, ...{}}, 'the board is as it was with both overlays off');
    const scene = await world(page);
    assert.equal(scene.guides, false); assert.equal(scene.links, false);
    assert.deepEqual(errors, []);
    await context.close(); done('board: each layer alone, only its own marks change, and they come back');
  }

  // ── the world: each layer alone ─────────────────────────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await sculpted(page);
    await select(page, 93);
    await view(page, 'world');
    await until(page, () => !document.querySelector('.rb-label').hidden, 'the label of the selected square');
    const base = await world(page);
    assert.deepEqual({guides:base.guides, links:base.links, lit:base.lit, labelShown:base.labelShown, names:base.names, numbers:base.numbers, chips:base.chips},
      {guides:true, links:true, lit:true, labelShown:true, names:true, numbers:true, chips:2}, 'as it always was');
    await shot(page, 'world-all-on');
    for (const layer of LAYERS) {
      await toggle(page, layer, false);
      const probe = await world(page);
      const expected = {...base, ...(layer === 'names' ? {names:false} : {}), ...(layer === 'numbers' ? {numbers:false} : {}),
        ...(layer === 'highlights' ? {lit:false} : {}), ...(layer === 'guides' ? {guides:false} : {}), ...(layer === 'links' ? {links:false} : {})};
      assert.deepEqual(probe, expected, 'only ' + layer + ' changes in the world');
      if (layer === 'names') await shot(page, 'world-names-off');
      await toggle(page, layer, true);
      assert.deepEqual(await world(page), base, layer + ' comes back as it was');
    }
    // the two overlays are two things: guides are the figure, links follow the selection
    await toggle(page, 'links', false);
    assert.deepEqual(await world(page), {...base, links:false});
    await toggle(page, 'guides', false);
    assert.deepEqual(await world(page), {...base, links:false, guides:false});
    await toggle(page, 'links', true);
    assert.deepEqual(await world(page), {...base, guides:false}, 'links alone, without the guides');
    await toggle(page, 'guides', true);
    // with a name and a number neither, the label has nothing to say and is not drawn; players stay
    await setAll(page, only());
    const bare = await world(page);
    assert.deepEqual({names:bare.names, numbers:bare.numbers, chips:bare.chips, guides:bare.guides, links:bare.links, lit:bare.lit},
      {names:false, numbers:false, chips:2, guides:false, links:false, lit:false}, 'everything off: only the players are left');
    assert.equal(await page.locator('.rb-label').evaluate(el => getComputedStyle(el).opacity), '0');
    await shot(page, 'world-all-off');
    assert.deepEqual(errors, []);
    await context.close(); done('world: each layer alone, in combination, and with everything off the players stand');
  }

  // ── combinations ────────────────────────────────────────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await select(page, 93);
    const everything = await board(page);
    for (let mask = 0; mask < 32; mask += 4) {   // 8 of the 32, spread over all five
      const state = Object.fromEntries(LAYERS.map((layer, i) => [layer, !((mask + (mask >> 3)) & (1 << i))]));
      await setAll(page, state);
      const probe = await board(page);
      assert.equal(probe.names, state.names, JSON.stringify(state));
      assert.equal(probe.numbers, state.numbers, JSON.stringify(state));
      assert.equal(probe.selectedFrame, state.highlights, JSON.stringify(state));
      assert.equal(probe.heldFrame, true); assert.equal(probe.selected, 'true');
      for (const layer of LAYERS) assert.equal(await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed'), String(state[layer]));
      for (const layer of LAYERS) assert.equal(await page.evaluate(l => document.body.classList.contains('gd-no-' + l), layer), !state[layer]);
    }
    await setAll(page, ALL);
    assert.deepEqual(await board(page), everything);
    assert.deepEqual(errors, []);
    await context.close(); done('combinations: the buttons, the body and the board agree');
  }

  // ── persistence and migration ───────────────────────────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    assert.equal(await page.evaluate(() => localStorage.getItem('ws-game-display')), null, 'nothing is written for the defaults');
    await toggle(page, 'names', false);
    await toggle(page, 'links', false);
    assert.equal(await page.evaluate(() => localStorage.getItem('ws-game-display')), '{"v":1,"off":["names","links"]}');
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
    await enterGame(page);
    for (const layer of LAYERS) assert.equal(await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed'), String(!['names', 'links'].includes(layer)), layer + ' after a reload');
    assert.equal((await board(page)).names, false);
    assert.equal((await world(page)).links, false);
    assert.equal((await world(page)).guides, true);
    // a value from nowhere is the old behaviour: everything shown
    await page.evaluate(() => localStorage.setItem('ws-game-display', '{broken'));
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
    for (const layer of LAYERS) assert.equal(await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed'), 'true', layer + ' with a damaged value');
    // and so is a later one that names a layer this page does not have
    await page.evaluate(() => localStorage.setItem('ws-game-display', '{"v":2,"off":["numbers","something-new"]}'));
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
    for (const layer of LAYERS) assert.equal(await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed'), String(layer !== 'numbers'));
    assert.deepEqual(errors, []);
    await context.close(); done('kept across a reload; damaged and newer values fall back safely');
  }

  // ── modes and views ─────────────────────────────────────────────────────────
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await sculpted(page);
    await select(page, 93);
    const off = without('names', 'highlights', 'links');
    await setAll(page, off);
    await view(page, 'world');
    assert.equal((await world(page)).names, false); assert.equal((await world(page)).links, false);
    await view(page, 'board');
    assert.equal((await board(page)).names, false);
    await page.locator('[data-menu=mode]>summary').click();
    await page.locator('[data-mode=explore]').click();
    await page.locator('body.game-view').waitFor({state:'detached'});
    // the explorer is not the game: its index and its marks are as they were
    await page.keyboard.press('i');
    await page.locator('.index').waitFor({state:'visible'});
    assert.equal(await page.locator('.index li, .index button').first().evaluate(el => el.getBoundingClientRect().width > 20), true, 'the explorer index is as it was');
    await page.keyboard.press('i');
    await page.locator('[data-menu=mode]>summary').click();
    await page.locator('[data-mode=mandala]').click();
    await page.locator('[data-menu=mode]>summary').click();
    await page.locator('[data-mode=game]').click();
    await page.locator('body.game-view').waitFor();
    for (const layer of LAYERS) assert.equal(await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed'), String(off[layer]), layer + ' after going away and back');
    assert.equal((await board(page)).names, false);
    assert.equal((await board(page)).numbers, true);
    assert.deepEqual(errors, []);
    await context.close(); done('kept across a change of view and of mode; the explorer is not the game');
  }

  // ── what stays: names for assistive technology, keyboard focus, the players ─
  {
    const {context, page, errors} = await open();
    await enterGame(page);
    await setAll(page, only());
    const cell = page.locator('.bv-sq[data-square="93"]');
    const snapshot = await cell.ariaSnapshot();
    assert.match(snapshot, /gridcell "93 /, 'the cell is still named by its number…');
    assert.match(snapshot, /Dharma|Body|Buddha|Great/i, '…and its name, with both hidden');
    assert.equal(await cell.evaluate(el => el.getAttribute('title')), (await cell.evaluate(el => el.title)), 'its tooltip too');
    const before = await page.locator('.bv-sq').evaluateAll(cells => cells.map(c => c.textContent.replace(/\s+/g, ' ').trim()));
    await setAll(page, ALL);
    const after = await page.locator('.bv-sq').evaluateAll(cells => cells.map(c => c.textContent.replace(/\s+/g, ' ').trim()));
    assert.deepEqual(before, after, 'every cell carries the same text with the layers off as with them on');
    // keyboard: Tab arrives on a cell, and it is visibly focused with every layer off
    await setAll(page, only());
    await page.locator('.bv-sq[data-square="94"]').focus();
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => { const el = document.activeElement, s = getComputedStyle(el); return {square:el.dataset?.square, outline:s.outlineStyle, width:s.outlineWidth, matches:el.matches(':focus-visible')}; });
    assert.equal(focus.square, '93', 'Tab moves along the board as before');
    assert.deepEqual({outline:focus.outline, width:focus.width, visible:focus.matches}, {outline:'solid', width:'2px', visible:true}, 'with a focus ring');
    await page.keyboard.press('Enter');
    await page.locator('.sheet').waitFor({state:'visible'});
    assert.match(await page.locator('.sheet h2').innerText(), /93/, 'and Enter opens the same entry');
    await page.keyboard.press('Escape');
    // the players and whose turn it is
    assert.match(await page.locator('[data-game=throw]').innerText(), /Player 1/i);
    assert.equal(await page.locator('.bv-who [data-player]').count(), 2);
    assert.equal((await board(page)).heldFrame, true, 'where players stand is framed');
    await shot(page, 'board-all-off');
    assert.deepEqual(errors, []);
    await context.close(); done('hidden names stay names, focus stays visible, players and turns are always shown');
  }

  // ── the other settings are other settings ───────────────────────────────────
  {
    const {context, page, errors} = await open({language:'pl'});
    await enterGame(page);
    await toggle(page, 'names', false);
    assert.equal(await page.evaluate(() => localStorage.getItem('ws-language')), 'pl', 'the interface stays Polish');
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'pl');
    assert.equal(await page.locator('[data-lang="en"]').textContent(), 'PL', 'the names are still given in the interface language');
    const polishName = await page.locator('.bv-sq[data-square="93"] .nm').textContent();
    assert.ok(polishName && !/Great Dharma Body/.test(polishName), 'Polish names under the hidden label: ' + polishName);
    // Tibetan names: chosen with the layer off, nothing shows, and they are there when it is on
    await page.keyboard.press('t');
    assert.equal(await page.evaluate(() => localStorage.getItem('ws-tibetan')), '1');
    assert.equal(await page.evaluate(() => document.body.classList.contains('tibetan-names')), true);
    assert.equal(await page.locator('.bv-sq[data-square="93"] .tb').evaluate(el => el.getBoundingClientRect().width < 3), true, 'hidden with the names off');
    await toggle(page, 'names', true);
    assert.equal(await page.locator('.bv-sq[data-square="24"] .tb').evaluate(el => el.getBoundingClientRect().width > 8), true, 'and shown with them on');
    assert.equal(await page.locator('.bv-sq[data-square="24"] .nm').evaluate(el => getComputedStyle(el).display), 'none', 'in place of the other language, as before');
    await page.keyboard.press('t');
    assert.equal(await page.evaluate(() => document.documentElement.lang), 'pl');
    assert.equal(await page.evaluate(() => localStorage.getItem('ws-game-display')), null, 'back to nothing written');
    assert.deepEqual(errors, []);
    await context.close(); done('Polish interface and Tibetan names are independent of whether names are shown');
  }

  // ── Polish, narrow: the group fits and every switch is reachable ────────────
  for (const [width, height] of [[320, 568], [390, 844], [844, 390]]) {
    const {context, page, errors} = await open({width, height, language:'pl'});
    await enterGame(page);
    if (height < 480) {      // a phone on its side is offered the world's arrangement of the game, and takes it
      await page.locator('.upright').waitFor({state:'visible'});
      await page.locator('.upright [data-upright=world]').click();
      await page.locator('body.world-only').waitFor();
    }
    await page.locator('[data-menu=options]>summary').click();
    // panel-layout.js places a dropdown once the menu has opened: measure it after, not in the frame before
    await page.locator('[data-menu=options] .menu-body.dropdown-positioned').waitFor();
    await page.waitForTimeout(150);
    const menu = await page.locator('[data-menu=options] .menu-body').boundingBox();
    const row = page.locator('.display-row');
    await row.scrollIntoViewIfNeeded();
    for (const layer of LAYERS) {
      const b = await page.locator('[data-display=' + layer + ']').boundingBox();
      assert.ok(b.x >= menu.x - 1 && b.x + b.width <= menu.x + menu.width + 1, layer + ' is inside the menu at ' + width + ': ' + JSON.stringify({b, menu}));
      assert.ok(b.height >= 30 && b.width >= 60, layer + ' is a thumb-sized switch: ' + JSON.stringify(b));
      assert.ok(await page.locator('[data-display=' + layer + ']').evaluate(el => el.scrollWidth <= el.clientWidth + 1), layer + ' does not spill its own label at ' + width);
    }
    const rowBox = await row.boundingBox();
    assert.ok(rowBox.x + rowBox.width <= width + 1 && rowBox.x >= -1, 'the group is within the screen at ' + width);
    assert.ok(menu.y >= 0 && menu.y + menu.height <= height && menu.x >= 0 && menu.x + menu.width <= width, 'the menu stands within the screen at ' + width + ': ' + JSON.stringify(menu));
    const strip = await page.locator('.controls').boundingBox(), b0 = await page.locator('[data-display=names]').boundingBox();
    assert.ok(b0.y + b0.height <= height && b0.y >= 0, 'and the switches are on screen, not behind the strip: ' + JSON.stringify({b0, strip}));
    await shot(page, 'options-pl-' + width + 'x' + height);
    assert.deepEqual(errors, []);
    await context.close();
  }
  done('Polish: the group fits the menu at 320×568, 390×844 and 844×390');

  // ── reduced motion ──────────────────────────────────────────────────────────
  {
    const {context, page, errors} = await open({reducedMotion:'reduce'});
    await enterGame(page);
    await select(page, 93);
    await view(page, 'world');
    await until(page, () => !document.querySelector('.rb-label').hidden, 'the label');
    await setAll(page, only('names'));
    const probe = await world(page);
    assert.deepEqual({names:probe.names, numbers:probe.numbers, guides:probe.guides, links:probe.links, lit:probe.lit}, {names:true, numbers:false, guides:false, links:false, lit:false});
    await view(page, 'board');
    assert.deepEqual({names:(await board(page)).names, numbers:(await board(page)).numbers}, {names:true, numbers:false});
    assert.deepEqual(errors, []);
    await context.close(); done('reduced motion: the same layers, the same results');
  }

  // ── a game goes the same whatever is drawn ──────────────────────────────────
  const play = async (state) => {
    const {context, page, errors} = await open({random:[3, 1, 6, 2, 5, 4, 4, 2], keep:'-' + Object.values(state).join('')});
    await enterGame(page);
    await setAll(page, state);
    const log = [];
    for (let i = 0; i < 6; i += 1) {
      await page.locator('[data-game=throw]').click();
      await until(page, () => !document.querySelector('[data-game=throw]').disabled && !document.querySelector('.bv-skip') || document.querySelector('.bv-skip').hidden, 'the throw to land');
      log.push(await page.evaluate(() => [...document.querySelectorAll('.rb-pl .sq')].map(el => el.textContent).join('/')));
      // reading a square mid-game, as a player does
      await page.locator('.bv-card:not([hidden]) [data-game=card-close]').click().catch(() => {});
    }
    const session = await page.evaluate(key => localStorage.getItem(key), SESSION);
    const selected = await page.locator('.bv-sq[aria-selected=true]').getAttribute('data-square');
    assert.deepEqual(errors, []);
    await context.close();
    return {session, log, selected};
  };
  {
    const shown = await play(ALL), hidden = await play(only());
    assert.ok(shown.session && JSON.parse(shown.session).rolls.length >= 6, 'a game was played: ' + shown.session);
    assert.equal(hidden.session, shown.session, 'the same dice leave the same save');
    assert.deepEqual(hidden.log, shown.log, 'and put every player on the same squares');
    assert.equal(hidden.selected, shown.selected, 'with the same square selected');
    assert.ok(!/gd-no|display/.test(hidden.session), 'the save knows nothing of the layers');
    done('a game is the same with every layer on and every layer off');
  }

  // ── a saved game, restored; and the end of it ───────────────────────────────
  {
    const winning = [2, 2, 2, 5, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
    const session = JSON.stringify({version:1, names:['Traveller'], skins:[null], colours:[null], note64:false, rolls:winning.slice(0, 16), pending:null});
    const {context, page, errors} = await open({prefs:{[SESSION]:session, 'ws-game-display':'{"v":1,"off":["names","numbers","highlights","guides","links"]}'}, random:[1]});
    await enterGame(page);
    assert.equal(await page.locator('.bv-sq[aria-selected=true]').count() >= 1, true, 'the saved game came back selected on a square');
    for (const layer of LAYERS) assert.equal(await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed'), 'false');
    const square = await page.locator('.rb-pl .sq').first().textContent();
    assert.notEqual(square, '104', 'one throw short of Nirvana');
    await page.locator('[data-game=throw]').click();
    await until(page, () => document.querySelector('.bv-sq[data-victory]').classList.contains('attained'), 'Nirvana to be reached with every layer off');
    assert.equal(await page.locator('.rb-pl .sq').first().textContent(), '104');
    assert.equal(JSON.parse(await page.evaluate(key => localStorage.getItem(key), SESSION)).rolls.length, 17);
    await page.reload();
    await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
    await enterGame(page);
    await until(page, () => document.querySelector('.bv-sq[data-victory]').classList.contains('attained'), 'the completed game to be restored');
    for (const layer of LAYERS) assert.equal(await page.locator('[data-display=' + layer + ']').getAttribute('aria-pressed'), 'false', layer + ' still off after the restore');
    assert.deepEqual(errors, []);
    await context.close(); done('a saved game restores, and reaches and restores Nirvana, with every layer off');
  }
  console.log('game display:', passed, 'scenarios passed in', engine);
} finally { await browser.close(); }
