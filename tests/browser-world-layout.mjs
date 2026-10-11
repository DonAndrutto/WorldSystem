// Covers the normal-motion, medium-width World view missed by reduced-motion checks.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const pw=createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT||'playwright');
const browser=await pw.chromium.launch({channel:'chrome',headless:true});
const intersects=(a,b)=>Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top);
try{for(const width of [1440,944,820,390]){
 const height=width===390?844:744;
 const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference',serviceWorkers:'block'});
 await context.addInitScript(()=>{for(const[k,v]of Object.entries({'ws-motion':'0','ws-index':'0','ws-sound':'0','ws-music':'0','ws-game-walkthrough-v1':'dismissed','ws-game-onboarded':'1'}))localStorage.setItem(k,v);});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.WORLDSYSTEM_URL||'http://127.0.0.1:4192/');
 await page.waitForFunction(()=>window.WorldSystemReady);await page.locator('.app-intro').waitFor({state:'hidden'});
 await page.locator('[data-menu=mode]>summary').click();await page.locator('[data-mode=game]').click();
 if(await page.locator('.bv-ask').isVisible())await page.locator('[data-game=start-new]').click();
 await page.locator('[data-layout=world]').click();
 const bars=await page.locator('.app-header,.controls,.bv-rail').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
 for(let i=0;i<bars.length;i++)for(let j=i+1;j<bars.length;j++)assert.ok(!intersects(bars[i],bars[j]),'headers stay separate at '+width);
 const action=page.locator('[data-game=throw]');
 const anchor=await action.boundingBox();
 const fixed=async()=>{assert.ok(await action.isVisible());assert.ok(await action.evaluate(e=>{const r=e.getBoundingClientRect();return e.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'fixed action is not covered');const r=await action.boundingBox();for(const k of ['x','y','width','height'])assert.ok(Math.abs(r[k]-anchor[k])<1,'fixed '+k);};
 for(const pace of ['calm','quick','instant']){
  await page.locator('.bv-tools>summary').click();await page.locator('#g-pace').selectOption(pace);await page.locator('.bv-tools>summary').click();
  await fixed();await action.click();await page.waitForFunction(()=>!document.querySelector('[data-game=throw]').disabled);
  await fixed();assert.equal(await page.locator('[data-game=throw]:visible').count(),1);assert.equal(await page.locator('.bv-card-go').isVisible(),false);
  const card=await page.locator('.bv-card-in').boundingBox();
  assert.ok(card.y+card.height<=anchor.y,'description clears fixed action');
  if(width>700){assert.ok(card.x>width*.55,'description is to the side');assert.ok(Math.abs(card.x-anchor.x)<1&&Math.abs(card.width-anchor.width)<1,'description and action share a column');}
 }
 await page.locator('.bv-guide>summary').click();await fixed();
 const guide=await page.locator('.bv-guide-body').boundingBox();assert.ok(guide.y+guide.height<=anchor.y,'realm guide clears fixed action');
 if(width>700)assert.ok(guide.x>width*.55,'realm guide stays beside Meru');
 await page.locator('.bv-guide>summary').click();
 // Opening the guide closes the result card. One more turn supplies an entry.
 await action.click();await page.waitForFunction(()=>!document.querySelector('[data-game=throw]').disabled);
 await page.locator('[data-game=card-entry]').click();await fixed();
 const sheet=await page.locator('.sheet').boundingBox();assert.ok(sheet.y+sheet.height<=anchor.y,'full reading clears fixed action');
 if(width>700)assert.ok(sheet.x>width*.55,'full reading stays beside the world');
 assert.deepEqual(errors,[]);console.log('PASS',width,'separate headers, all three paces, one fixed action, side description and full reading');await context.close();
}}finally{await browser.close();}
