// Optional real-browser suite: install playwright, serve the repo, then run
// WORLDSYSTEM_URL=http://127.0.0.1:4174 node tests/browser-ui.mjs
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({channel: 'chrome', headless: true});
const url = process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4174/';
const counts = {explore:104, mandala:37, game:105, wheel:92};
try {
  for (const config of [
    {width:390,height:844}, {width:320,height:568},
    {width:844,height:390}, {width:1440,height:1000},
    {width:390,height:844,language:'pl'}, {width:320,height:568,language:'pl'}, {width:390,height:844,reduced:true}
  ]) {
    const context = await browser.newContext({viewport:config, serviceWorkers:'block', reducedMotion:config.reduced?'reduce':'no-preference'});
    await context.addInitScript(({language}) => {
      localStorage.setItem('ws-game-onboarded','1'); localStorage.setItem('ws-game-view','world');
      localStorage.setItem('ws-game-pace','instant'); localStorage.setItem('ws-index','0');
      localStorage.setItem('ws-motion','0'); localStorage.setItem('ws-motion-pace','fast');
      if(language) localStorage.setItem('ws-language',language);
    }, config);
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => window.WorldSystemReady);
    assert.equal(await page.locator('.intro-mode').count(), 4);
    await page.locator('.app-intro').waitFor({state:'hidden'});
    assert.ok(await page.locator('.app-header').evaluate(e=>e.scrollWidth<=e.clientWidth), 'header contents fit');
    assert.ok(await page.locator('.controls').evaluate(c=>[...c.querySelectorAll(':scope > .btn, .menu > .btn')].every(b=>b.scrollWidth<=b.clientWidth+1)), 'control bar labels fit');
    const mode = async id => {
      await page.locator('[data-menu=mode] > summary').click();
      await page.locator('[data-mode='+id+']').click();
    };
    await mode('game');
    const accessibleThrow = await page.locator('[data-game=throw]').evaluate(button => {
      const b = button.getBoundingClientRect(), h = document.querySelector('.app-header').getBoundingClientRect();
      return b.top > h.bottom && button.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));
    });
    assert.ok(accessibleThrow, 'Throw is clear of the header and receives taps');
    await page.locator('[data-game=throw]').click();
    await page.locator('.bv-card').waitFor({state:'visible'});
    await page.locator('[data-game=card-close]').click();
    const savedGame = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.includes('session'))));
    for (const name of Object.keys(counts)) {
      await mode(name);
      await page.locator('[data-menu=mode] > summary').click();
      await page.locator('[data-start-tour]').click();
      await page.locator('.tour-panel').waitFor({state:'visible'});
      assert.equal(await page.locator('#tour-jump option').count(), counts[name]);
      assert.equal(await page.locator('[data-act=motion]').getAttribute('aria-pressed'), String(!config.reduced));
      assert.equal(await page.locator('[data-speed=slow]').getAttribute('aria-pressed'), 'true');
      const layout = await page.locator('.tour-panel').evaluate(panel => {
        const b=panel.getBoundingClientRect(), scroll=panel.querySelector('.tour-scroll').getBoundingClientRect();
        return {bottom:b.bottom, right:b.right, textHeight:scroll.height, width:innerWidth,height:innerHeight};
      });
      assert.ok(layout.bottom<=layout.height && layout.right<=layout.width, name+': dock fits screen');
      assert.ok(layout.textHeight>=75, name+': reading area remains usable');
      assert.deepEqual(await page.locator('#tour-pace option').evaluateAll(es=>es.map(e=>+e.value)), [1.5,3,5,8]);
      await page.locator('#tour-pace').selectOption('1.5');
      await page.locator('[data-tour=play]').click();
      await page.waitForFunction(()=>WorldSystemTours.state().index>=1);
      await page.locator('[data-tour=play]').click();
      assert.equal(await page.evaluate(()=>WorldSystemTours.state().playing), false);
      await page.locator('[data-help-open]').click();
      await page.locator('.app-help').waitFor({state:'visible'});
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('[data-help-open]').evaluate(e=>e===document.activeElement), true);
      await page.locator('#tour-jump').selectOption(String(counts[name]-1));
      await page.waitForTimeout(850);
      assert.ok(await page.locator('.tour-copy').innerText());
      if (process.env.WORLDSYSTEM_SCREENSHOTS && name==='wheel') await page.screenshot({path:process.env.WORLDSYSTEM_SCREENSHOTS+'/'+config.width+'-'+config.height+'-'+(config.language||'en')+'-'+!!config.reduced+'.png'});
      await page.locator('[data-tour=next]').click();
      assert.equal(await page.evaluate(()=>WorldSystemTours.state().active), false);
      assert.equal(await page.locator('[data-act=motion]').getAttribute('aria-pressed'), 'false');
      assert.equal(await page.locator('[data-speed=fast]').getAttribute('aria-pressed'), 'true');
    }
    assert.deepEqual(await page.evaluate(() => Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.includes('session')))), savedGame, 'presentations preserve a played game');
    await mode('mandala');
    await page.locator('[data-p=play]').click();
    const numbers=page.locator('.off-player [data-numbers]');
    await numbers.click(); assert.equal(await numbers.getAttribute('aria-pressed'), 'false');
    await numbers.click(); assert.equal(await numbers.getAttribute('aria-pressed'), 'true');
    await page.locator('[data-help-open]').click();
    await page.locator('[data-help-intro]').click();
    await page.locator('[data-intro-mode=wheel]').click();
    assert.equal(await page.locator('[data-mode=wheel]').getAttribute('aria-pressed'), 'true');
    assert.ok((await page.locator('.app-donate').getAttribute('href')).includes('business=JZS5LVZKPPY5J'));
    assert.deepEqual(errors, [], 'no browser runtime errors');
    console.log('PASS browser', JSON.stringify(config));
    await context.close();
  }
} finally { await browser.close(); }
