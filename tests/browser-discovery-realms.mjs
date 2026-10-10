import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const pw=createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const browser=await pw.chromium.launch({headless:true,channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 for(const width of [1440,390]) {
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},hasTouch:width<600,reducedMotion:'reduce',serviceWorkers:'block'});
  await context.addInitScript(()=>{for(const [k,v] of Object.entries({'ws-language':'en','ws-motion':'0','ws-index':'0','ws-game-walkthrough-v1':'dismissed','ws-game-onboarded':'1','ws-sound':'0','ws-music':'0'}))localStorage.setItem(k,v);});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/.test(m.text()))errors.push(m.text());});
  await page.goto(process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4177/',{waitUntil:'domcontentloaded',timeout:90000});
  await page.waitForFunction(()=>window.WorldSystemReady,{},{timeout:90000});
  await page.locator('.app-intro').waitFor({state:'hidden'});console.log('ready',width);
  const mode=async id=>{await page.locator('[data-menu=mode]>summary').click();await page.locator(`[data-mode=${id}]`).click();};
  const index=page.locator('[data-act=index]'),input=page.locator('#world-search');
  await index.click();assert.equal(await input.evaluate(e=>e===document.activeElement),true);
  const mansions=await page.evaluate(async()=> (await import('/lunar-mansions.js')).MANSIONS.map(m=>({id:m.id,sanskrit:m.sanskrit,tibetan:m.tibetan})));
  for(const m of mansions){
   await input.fill(m.sanskrit.normalize('NFD').replace(/\p{M}/gu,''));
   const row=page.locator(`.index .row[data-id="${m.id}"]`);
   assert.ok(await row.isVisible(),m.sanskrit+' searchable without accents');
   assert.ok((await row.textContent()).includes(m.tibetan));
  }
  for(const name of ['nakshatra','nakṣatra']) {await input.fill(name);assert.equal(await page.locator('.mansion-result:visible').count(),28);}
  await input.fill('ashwini');await page.locator('.mansion-result:visible').click();
  assert.ok((await page.locator('.sheet').textContent()).includes('Aśvinī'));
  await index.click();await input.fill('Shravana');
  await page.screenshot({path:join(tmpdir(),`main-search-${width}.png`)});
  for(const id of ['hell_avichi','cold_mahapadma','formless_bhavagra']) {
   if(!(await page.locator('body').getAttribute('class')).includes('index-open'))await index.click();
   await input.fill('');await page.locator(`.index .row[data-id="${id}"]`).click();
   if(await page.locator('[data-act=close-index]').isVisible())await page.locator('[data-act=close-index]').click();
   await page.waitForTimeout(700);
   await page.screenshot({path:join(tmpdir(),`main-${id}-${width}.png`)});
  }
  await page.locator('.app-brand').click();
  assert.equal(await page.locator('.sheet a[href="mailto:translation@arybszleger.com"]').count(),1);
  assert.equal(await page.locator('.sheet a[href="https://arybszleger.com"]').count(),1);
  await page.locator('.app-language>summary').click();await page.locator('.app-language [data-ui-lang=pl]').click();
  await page.waitForTimeout(100);
  assert.ok((await page.locator('.sheet').textContent()).includes('więcej interaktywnych aplikacji'));
  await page.locator('.app-language>summary').click();await page.locator('.app-language [data-ui-lang=en]').click();
  await mode('game');
  await page.locator('.bv-tools>summary').click();await page.locator('.bv-tools [data-game=ask-new]').click();
  const people=page.locator('.bv-person');
  await people.nth(0).locator('.player-culture').selectOption('Monastic');
  await people.nth(0).getByRole('button',{name:'Monk · Tibetan Vajrayana',exact:true}).click();
  await people.nth(1).locator('.player-culture').selectOption('Monastic');
  await people.nth(1).getByRole('button',{name:'Nun · Tibetan Vajrayana',exact:true}).click();
  await page.screenshot({path:join(tmpdir(),`main-monastics-${width}.png`)});
  await page.locator('[data-game=start-new]').click();
  await page.waitForTimeout(300);
  const pieces=await page.locator('.bv-tok.player-art').evaluateAll(es=>es.map(e=>e.style.getPropertyValue('--skin-image')));
  assert.ok(pieces.some(s=>s.includes('monastics.png')));
  await mode('worlds');await page.locator('#tour-jump').selectOption('3');await page.waitForTimeout(300);
  await page.screenshot({path:join(tmpdir(),`main-scale-${width}.png`)});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow');
  assert.deepEqual(errors,[]);console.log('PASS discovery, realms, links, monastics, scale at',width);
  await context.close();
 }
} finally {await browser.close();}
