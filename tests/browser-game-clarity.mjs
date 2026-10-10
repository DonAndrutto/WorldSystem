// Run against a local server with WORLDSYSTEM_PLAYWRIGHT pointing to Playwright.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const engines = createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const engine = process.env.WORLDSYSTEM_BROWSER || 'chromium';
const browser = await engines[engine].launch({headless:true, ...(engine === 'chromium' ? {channel:'chrome'} : {}), ...(process.env.WORLDSYSTEM_BROWSER_PATH ? {executablePath:process.env.WORLDSYSTEM_BROWSER_PATH} : {})});
const base = process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4175/';
const output = process.env.WORLDSYSTEM_SCREENSHOTS;
if (output) fs.mkdirSync(output, {recursive:true});
const configs = [
  {width:320,height:568,touch:true}, {width:390,height:844,touch:true},
  {width:820,height:1180,touch:true}, {width:1180,height:820,touch:true},
  {width:1440,height:1000}, {width:390,height:844,touch:true,language:'pl'},
  {width:820,height:1180,touch:true,language:'pl'}, {width:390,height:844,touch:true,night:true},
  {width:844,height:390,touch:true}
];
try {
  for (const config of configs.filter(c => !process.env.WORLDSYSTEM_TOUCH_ONLY || (c.touch && !c.language && !c.night && c.width !== 320 && c.height > 480))) {
    const context = await browser.newContext({viewport:config, hasTouch:!!config.touch, isMobile:!!config.touch, deviceScaleFactor:1, serviceWorkers:'block',reducedMotion:'reduce'});
    await context.addInitScript(config=>{
      Object.entries({'ws-game-onboarded':'1','ws-game-view':'board','ws-game-pace':'instant','ws-index':'0','ws-motion':'0','ws-sound':'0','ws-music':'0','ws-game-follow':'0'}).forEach(([k,v])=>localStorage.setItem(k,v));
      if(config.language)localStorage.setItem('ws-language',config.language);
    },config);
    const page = await context.newPage(), errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);
    await page.waitForFunction(()=>window.WorldSystemReady, {}, {timeout:30000});
    await page.locator('.app-intro').waitFor({state:'hidden'});
    await page.locator('[data-menu=mode]>summary').click();
    await page.locator('[data-mode=game]').click();
    // The board intentionally requests portrait on landscape phones. Test its
    // offered World alternative, rather than bypassing the orientation notice.
    if(config.height<480){
      await page.locator('.upright').waitFor({state:'visible'});
      await page.locator('.upright [data-upright=world]').click();
      await page.locator('.bv-guide>summary').click();
      const b=await page.locator('.bv-guide-body').boundingBox();
      assert.ok(b.y>=0&&b.y+b.height<=config.height,'landscape world guide fits');
      assert.deepEqual(errors,[]);console.log('PASS landscape World alternative');await context.close();continue;
    }
    if(config.night) await page.locator('[data-act=night]').evaluate(el=>el.click());
    const tag=config.width+'-'+config.height+'-'+(config.language||'en')+(config.night?'-night':'');
    const snap=async suffix=>{if(output)await page.screenshot({path:output+'/'+tag+'-'+suffix+'.png'});};
    const fits=async selector=>{
      const box=await page.locator(selector).boundingBox();
      assert.ok(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=config.width+1&&box.y+box.height<=config.height+1,tag+' fits '+selector+' '+JSON.stringify(box));
    };
    await fits('.bv-grid');await fits('.bv-mapbar');
    if (await page.locator('[data-game=board-size]').getAttribute('aria-pressed') === 'true') {
      await page.waitForFunction(() => {
        const grid=document.querySelector('.bv-grid').getBoundingClientRect();
        const cell=document.querySelector('.bv-sq[aria-selected=true]').getBoundingClientRect();
        return cell.top>=grid.top&&cell.bottom<=grid.bottom&&cell.left>=grid.left&&cell.right<=grid.right;
      }, {}, {timeout:5000});
    }
    assert.equal(await page.locator('.bv-sq[data-bhumi]').count(),20);
    assert.equal(await page.locator('.bv-sq[data-square="36"]').getAttribute('data-realm'),'higher');
    assert.equal(await page.locator('.bv-sq[data-square="84"]').getAttribute('data-realm'),'field');
    assert.equal(await page.locator('.bv-sq[data-square="80"]').getAttribute('data-bhumi'),'2');
    assert.ok(await page.locator('.bv-guide-key').evaluate(el=>el.scrollWidth<=el.clientWidth+1),'key labels fit');
    await snap('board');
    await page.locator('.bv-guide>summary').click();await fits('.bv-guide-body');
    assert.equal(await page.locator('.bv-guide-groups>div').count(),8);
    if(config.language) {
      assert.match(await page.locator('.bv-guide-heading h2').innerText(),/Jak czytać/);
      assert.equal(await page.locator('#square-realm-71').textContent(), 'Sutra · Bhūmi 1 z 10');
    }
    await snap('guide');
    await page.locator('[data-realm-square="71"]').click();
    await page.locator('.sheet').waitFor({state:'visible'});
    assert.match(await page.locator('.sheet').innerText(),/Bhūmi 1 (of|z) 10/);
    await snap('first-bhumi');
    await page.keyboard.press('Escape');
    // On a touch board, the readable view is available without opening Options.
    if(config.width<=1100){
      if (await page.locator('[data-game=board-size]').getAttribute('aria-pressed') === 'false') await page.locator('[data-game=board-size]').click();
      assert.equal(await page.locator('[data-game=board-size]').getAttribute('aria-pressed'),'true');
      assert.ok(await page.locator('.bv-grid').evaluate(e=>e.scrollHeight>e.clientHeight));
      await fits('.bv-grid');await snap('large-squares');
      await page.locator('[data-game=board-size]').click();
    }
    await page.locator('[data-layout=world]').first().click();
    await fits('.bv-mapbar');
    assert.match(await page.locator('.rb-realm').innerText(),/Bhūmi 1 (of|z) 10/);
    await snap('world');
    await page.locator('[data-game=throw]').click();await page.locator('.bv-card').waitFor({state:'visible'});
    await fits('.bv-card-in');
    assert.ok(await page.locator('.bv-card-realm p').innerText());
    await snap('throw');
    await page.locator('[data-game=card-close]').click();
    assert.deepEqual(errors,[],tag+' runtime errors');
    console.log('PASS',tag);await context.close();
  }
} finally {await browser.close();}
