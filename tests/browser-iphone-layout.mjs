// Run against a local server (WORLDSYSTEM_URL, default http://127.0.0.1:4175/)
// with WORLDSYSTEM_PLAYWRIGHT pointing at Playwright. WORLDSYSTEM_CHANNEL
// defaults to 'chrome'; WORLDSYSTEM_CHANNEL=chromium runs Playwright's own
// Chromium where Chrome is not installed.
//
// What an audit of the page at iPhone sizes found out of reach, kept from
// coming back. Each is a reproducible defect with a size, a language and a
// control that could not be touched or read:
//   320 × 568, English and Polish   the header's Donate/Wesprzyj ran under the magnifier beside it
//   320 × 568, Polish               the tour's third button, Zakończ zwiedzanie, stood past the screen's edge
//   667 × 375, 812 × 375, 844 × 340 the game's visit panel (Focus here, Return to world, Full story)
//                                   stood under the rail and the controls, out of reach of a finger
//   844 × 390 with a notch          the brand, Options and the throw stood under the notch and the corners
// This is Chromium at those viewports, with touch. It is not Safari, and not a phone.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const engines = createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const engine = process.env.WORLDSYSTEM_BROWSER || 'chromium';
const base = process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4175/';
const output = process.env.WORLDSYSTEM_SCREENSHOTS;
if (output) fs.mkdirSync(output, {recursive:true});
const browser = await engines[engine].launch({headless:true, ...(engine === 'chromium' ? {channel:process.env.WORLDSYSTEM_CHANNEL || 'chrome', args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']} : {})});
const PREFS = {'ws-game-walkthrough-v1':'dismissed','ws-game-onboarded':'1','ws-game-view':'world','ws-game-pace':'instant','ws-index':'0','ws-sound':'0','ws-music':'0','ws-game-follow':'0','ws-motion':'0'};
let passed = 0;
const done = name => { passed += 1; console.log('PASS', name); };

async function open(width, height, language) {
  const context = await browser.newContext({viewport:{width, height}, hasTouch:true, isMobile:engine !== 'firefox', serviceWorkers:'block', reducedMotion:'reduce'});
  await context.addInitScript(({prefs, language}) => {
    for (const [key, value] of Object.entries(prefs)) localStorage.setItem(key, value);
    if (language) localStorage.setItem('ws-language', language);
  }, {prefs:PREFS, language});
  const page = await context.newPage(), errors = [];
  page.setDefaultTimeout(120000);
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await page.waitForFunction(() => window.WorldSystemReady, {}, {timeout:180000});
  await page.locator('.app-intro').waitFor({state:'hidden', timeout:30000}).catch(() => {});
  return {context, page, errors};
}
const mode = async (page, id) => { await page.locator('[data-menu=mode]>summary').click(); await page.locator('[data-mode=' + id + ']').click(); };
const shot = async (page, name) => { if (output) await page.screenshot({path:output + '/iphone-' + engine + '-' + name + '.png', timeout:120000}); };
// a control can be touched when its centre is on the screen and is what a finger would land on
const reachable = (page, selector) => page.locator(selector).evaluate(el => {
  const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  const top = document.elementFromPoint(x, y);
  return {onScreen:r.left >= -1 && r.right <= innerWidth + 1 && r.top >= -1 && r.bottom <= innerHeight + 1, hit:!!top && (el === top || el.contains(top) || top.contains(el)), by:top && (top.className || top.tagName).toString().slice(0, 40), rect:[r.left, r.top, r.right, r.bottom].map(Math.round)};
});

try {
  // ── the header, at the width of the smallest iPhone ─────────────────────────
  for (const language of [undefined, 'pl']) {
    const {context, page, errors} = await open(320, 568, language);
    const header = await page.evaluate(() => {
      const parts = [...document.querySelectorAll('.app-header > *')].filter(el => el.getBoundingClientRect().width > 2);
      const rects = parts.map(el => ({name:el.className.toString().slice(0, 24) || el.tagName, left:el.getBoundingClientRect().left, right:el.getBoundingClientRect().right, over:el.scrollWidth - el.clientWidth}));
      const donate = document.querySelector('.app-donate');
      return {rects, donateOver:donate.scrollWidth - donate.clientWidth, donateLabel:donate.getAttribute('aria-label'), labelBox:donate.querySelector('span').getBoundingClientRect().width};
    });
    assert.ok(header.donateOver <= 1, (language || 'en') + ': the Donate link holds its own content (over by ' + header.donateOver + 'px)');
    assert.ok(header.labelBox <= 2 && header.donateLabel, 'the word is set aside at 320 and the link keeps its accessible name');
    for (let i = 1; i < header.rects.length; i += 1) assert.ok(header.rects[i].left >= header.rects[i - 1].right - 1, 'header parts do not overlap: ' + JSON.stringify(header.rects[i - 1]) + ' / ' + JSON.stringify(header.rects[i]));
    assert.ok(header.rects.at(-1).right <= 320 + 1, 'the header ends inside the screen');
    await shot(page, 'header-320-' + (language || 'en'));
    assert.deepEqual(errors, []);
    await context.close();
  }
  done('320 × 568: the header\'s parts sit side by side in English and Polish');

  // ── the tour's foot, in Polish, at 320 ──────────────────────────────────────
  {
    const {context, page, errors} = await open(320, 568, 'pl');
    await mode(page, 'mandala');
    await page.locator('.mandala-note [data-view=tour]').click();
    await page.locator('.tour-panel').waitFor({state:'visible'});
    for (const control of ['[data-tour=prev]', '[data-tour=next]', '[data-tour=overview]']) {
      const r = await reachable(page, '.tour-panel ' + control);
      assert.ok(r.onScreen, control + ' is on the screen at 320 in Polish: ' + JSON.stringify(r.rect));
      assert.ok(r.hit, control + ' is what a finger lands on, not ' + r.by);
    }
    const foot = await page.locator('.tour-foot').evaluate(el => ({over:el.scrollWidth - el.clientWidth, right:el.getBoundingClientRect().right}));
    assert.ok(foot.over <= 1 && foot.right <= 320, 'the foot of the tour holds its three buttons: ' + JSON.stringify(foot));
    await shot(page, 'tour-320-pl');
    assert.deepEqual(errors, []);
    await context.close(); done('320 × 568 Polish: the three buttons of the tour are all on the screen');
  }

  // ── the game's visit panel on a phone held sideways ─────────────────────────
  for (const [width, height] of [[667, 375], [812, 375], [844, 340], [844, 390]]) {
    const {context, page, errors} = await open(width, height);
    await mode(page, 'game');
    await page.locator('body.game-view').waitFor();
    if (await page.locator('.upright').isVisible().catch(() => false)) await page.locator('.upright [data-upright=world]').click();
    await page.locator('body.world-only').waitFor();
    await page.locator('[data-game=throw]').click();
    await page.locator('.bv-card').waitFor({state:'visible'});
    await page.locator('.bv-card-world').click();
    await page.locator('.game-focus').waitFor({state:'visible'});
    await page.waitForTimeout(1500);
    for (const control of ['focus', 'return', 'story']) {
      const r = await reachable(page, '.game-focus [data-world=' + control + ']');
      assert.ok(r.onScreen, width + '×' + height + ': ' + control + ' is on the screen: ' + JSON.stringify(r.rect));
      assert.ok(r.hit, width + '×' + height + ': ' + control + ' is what a finger lands on, not ' + r.by);
    }
    const title = await page.locator('.game-focus strong').evaluate(el => {
      const r = el.getBoundingClientRect(), top = document.elementFromPoint(r.left + 6, r.top + r.height / 2);
      return {shown:r.height > 8, hit:!!top && (el === top || el.contains(top) || top.contains(el))};
    });
    assert.deepEqual(title, {shown:true, hit:true}, width + '×' + height + ': the name of the place is readable, not under the rail');
    // and the way back out works with a tap
    await page.locator('.game-focus [data-world=return]').click();
    await page.locator('.game-focus').waitFor({state:'hidden'});
    await shot(page, 'focus-' + width + 'x' + height);
    assert.deepEqual(errors, []);
    await context.close();
  }
  done('667×375, 812×375, 844×340, 844×390: the visit panel is readable and its three buttons can be touched');
  // ── a notched phone on its side ─────────────────────────────────────────────
  // viewport-fit=cover lets the page run under the notch and the rounded corners; on an iPhone held
  // sideways they take 47px from each end (21px at the foot). Only the top and the foot of the
  // screen were kept clear, so the brand, the Options control and the throw stood under them.
  // Chromium can stand in for those insets (Emulation.setSafeAreaInsetsOverride); other engines skip.
  if (engine === 'chromium') {
    for (const [name, width, height, insets] of [['landscape', 844, 390, {top:0, left:47, bottom:21, right:47}], ['portrait', 390, 844, {top:47, left:0, bottom:34, right:0}]]) {
      const {context, page, errors} = await open(width, height);
      const cdp = await context.newCDPSession(page);
      await cdp.send('Emulation.setSafeAreaInsetsOverride', {insets});
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await mode(page, 'game');
      await page.locator('body.game-view').waitFor();
      if (await page.locator('.upright').isVisible().catch(() => false)) await page.locator('.upright [data-upright=world]').click();
      await page.locator('body.world-only').waitFor();
      await page.waitForTimeout(800);
      const stray = await page.evaluate(({insets}) => {
        const found = [];
        for (const el of document.querySelectorAll('button, a[href], summary, select, input:not([type=hidden])')) {
          const r = el.getBoundingClientRect(), s = getComputedStyle(el);
          if (r.width < 3 || r.height < 3 || s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0 || el.closest('[hidden], details:not([open]) > :not(summary), .mk')) continue;
          if (el.closest('details:not([open])') && el.tagName !== 'SUMMARY') continue;
          const sides = [];
          if (r.left < insets.left - 1 && r.right > 0) sides.push('left');
          if (r.right > innerWidth - insets.right + 1 && r.left < innerWidth) sides.push('right');
          if (r.top < insets.top - 1 && r.bottom > 0) sides.push('top');
          if (r.bottom > innerHeight - insets.bottom + 1 && r.top < innerHeight) sides.push('bottom');
          if (sides.length) found.push((el.className && el.className.toString().split(' ')[0] || el.tagName) + '«' + (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 16) + '» ' + sides.join('+'));
        }
        return found;
      }, {insets});
      assert.deepEqual(stray, [], name + ': nothing to touch stands under the notch, the corners or the home indicator');
      await shot(page, 'safe-area-' + name);
      assert.deepEqual(errors, []);
      await context.close();
    }
    done('a notched phone: with 47px at each end on its side and 47/34 upright, every control stands clear');
  }
  console.log('iphone layout:', passed, 'scenarios passed in', engine);
} finally { await browser.close(); }
