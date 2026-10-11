import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const pw=createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const url=process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4192/';
const out=process.env.WORLDSYSTEM_SCREENSHOTS;
if(out)fs.mkdirSync(out,{recursive:true});
const browser=await pw.chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const width of [1440,820,390,320].filter(w=>!process.env.WORLDSYSTEM_WIDTH||w===Number(process.env.WORLDSYSTEM_WIDTH))){
 const height=width===320?568:width===390?844:1000;
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<=820,reducedMotion:'reduce',serviceWorkers:'block'});
 await context.addInitScript(()=>{for(const [k,v]of Object.entries({'ws-motion':'0','ws-index':'0','ws-sound':'0','ws-music':'0','ws-game-walkthrough-v1':'dismissed','ws-game-onboarded':'1'}))localStorage.setItem(k,v);});
 const page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.stack));
 page.on('console',m=>{if(m.type()==='error'&&/THREE|shader|WebGL/.test(m.text()))errors.push(m.text());});
 page.on('response',r=>{if(r.status()>=400)errors.push('HTTP '+r.status()+' '+r.url());});
 await page.goto(url);await page.waitForFunction(()=>window.WorldSystemReady,{}, {timeout:60000});await page.locator('.app-intro').waitFor({state:'hidden'});
 const snap=async name=>{if(out)await page.screenshot({path:`${out}/${width}-${name}.png`});};
 const change=async id=>{await page.locator('[data-menu=mode]>summary').click();await page.locator(`[data-mode=${id}]`).click();};
 const controls=await page.locator('.controls>button,.controls>details>summary').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
 assert.ok(controls.every(r=>Math.abs(r.y-controls[0].y)<1 && Math.abs(r.height-controls[0].height)<1),'control baselines');
 assert.ok(controls.every(r=>Math.abs(r.width-controls[0].width)<1),'equal menu widths');
 if(width===1440){const h=await page.locator('.app-header').boundingBox(),c=await page.locator('.controls').boundingBox();assert.equal(h.y,c.y);assert.equal(h.height,c.height);assert.ok(Math.abs(h.width-c.width)<1);}
 await page.locator('[data-menu=mode]>summary').click();
 assert.equal(await page.locator('[data-mode] img').evaluateAll(es=>es.filter(e=>e.complete&&e.naturalWidth>0).length),6);
 await snap('mode-art');await page.locator('[data-menu=mode]>summary').click();
 // Open Meru's explanation. Its camera projection must clear the desktop dock.
 await page.locator('[data-act=index]').click();await page.locator('#world-search').fill('Mount Meru');await page.locator('.index .row[data-id=meru_core]').first().click();await page.waitForTimeout(250);
 if(width===1440){const clear=await page.evaluate(async()=>{const {Vector3}=await import('./vendor/three@0.184.0/build/three.module.js');const s=document.querySelector('three-d-stage'),p=new Vector3(0,.4,0).project(s._camera);return (p.x+1)/2*innerWidth < document.querySelector('.panel-dock').getBoundingClientRect().left-24;});assert.ok(clear,'Meru clears the side panel');}
 const panel=page.locator('.sheet'),handle=panel.locator('.panel-resize-handle');
 await handle.dblclick();assert.ok(await panel.evaluate(e=>e.classList.contains('panel-minimized')));assert.ok(await panel.locator('h2').isVisible());
 await handle.dblclick();assert.ok(!(await panel.evaluate(e=>e.classList.contains('panel-minimized'))));
 const before=await panel.boundingBox(),grip=await handle.boundingBox();
 await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2);await page.mouse.down();await page.mouse.move(grip.x+grip.width/2,grip.y+grip.height/2+(width<700?50:-50),{steps:5});await page.mouse.up();
 const after=await panel.boundingBox();assert.ok(Math.abs(after.height-before.height)>20,'panel changes height by dragging');await snap('side-reading');await page.keyboard.press('Escape');
 await change('game');if(await page.locator('.bv-ask').isVisible())await page.locator('[data-game=start-new]').click();
 assert.equal(await page.locator('.bv-rail>.bv-guide').count(),1);assert.equal(await page.locator('.bv-mapbar').count(),0);
 const gameMenus=await page.locator('.bv-rail>.bv-guide>summary,.bv-rail>.bv-options>summary,.bv-rail>.bv-tools>summary').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().toJSON()));
 assert.ok(gameMenus.every(r=>Math.abs(r.y-gameMenus[0].y)<1&&Math.abs(r.width-gameMenus[0].width)<1&&Math.abs(r.height-gameMenus[0].height)<1),'three game menus are symmetric');
 for(const selector of ['.bv-guide','.bv-options','.bv-tools']){
  const menu=page.locator(selector);await menu.locator(':scope>summary').click();await page.waitForTimeout(50);
  const anchor=await menu.locator(':scope>summary').boundingBox();const body=await menu.locator(':scope>div').boundingBox();
  assert.ok(body.y>=anchor.y+anchor.height,'game menu opens downwards');assert.ok(body.y+body.height<=height-(width<700?68:0)+1,'dropdown fits viewport');
  await snap(selector.slice(1));await menu.locator(':scope>summary').click();
 }
 // A real throw still changes the saved game once.
 await page.locator('.bv-tools>summary').click();await page.locator('#g-pace').selectOption('instant');await page.locator('.bv-tools>summary').click();
 const readSaved=()=>page.evaluate(()=>localStorage.getItem('ws-game-session-v1'));
 const savedBefore=await readSaved();await page.locator('[data-game=throw]:visible').click();await page.waitForTimeout(200);assert.notEqual(await readSaved(),savedBefore);
 await change('explore');
 await page.locator('[data-menu=options]>summary').click();await page.getByRole('button',{name:'World endings',exact:true}).click();
 const ending=page.locator('.world-ending');assert.ok(await ending.isVisible());
 assert.equal(await ending.locator('[data-ending=play]').textContent(),'Play','reduced motion does not autoplay');
 const baselineSaved=await readSaved();
 for(const kind of ['fire','water','wind']){
  if(kind!=='fire')await ending.locator(`[data-ending=${kind}]`).click();
  await ending.locator('input').fill('740');await ending.locator('input').dispatchEvent('input');
  if(kind==='fire')assert.equal(await ending.getAttribute('data-suns'),'7');
  assert.equal(await page.evaluate(()=>document.querySelector('three-d-stage')._scene.children.filter(o=>o.name==='world_ending_presentation').length),1);
  await snap('ending-'+kind);
  await ending.locator('input').fill('1000');await ending.locator('input').dispatchEvent('input');
  assert.equal(await ending.getAttribute('data-empty'),'true');
  assert.ok((await ending.locator('.world-ending-copy').textContent()).includes('remain'));
 }
 assert.equal(await readSaved(),baselineSaved,'cinematics preserve the game');
 await ending.locator('[data-ending=close]').click();
 assert.equal(await page.evaluate(()=>document.querySelector('three-d-stage')._scene.children.filter(o=>o.name==='world_ending_presentation').length),0);
 assert.ok(await page.evaluate(()=>document.querySelector('three-d-stage')._object.visible),'original world restored');
 if(width===1440){
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('[data-menu=options]>summary').click();await page.getByRole('button',{name:'World endings',exact:true}).click();
  await page.waitForTimeout(1200);assert.ok(Number(await ending.locator('input').inputValue())>0,'normal-motion playback advances');
  await ending.locator('[data-ending=play]').click();const paused=await ending.locator('input').inputValue();
  await page.waitForTimeout(300);assert.equal(await ending.locator('input').inputValue(),paused,'pause stops playback');
  await ending.locator('[data-ending=water]').click();await ending.locator('[data-ending=play]').click();
  await ending.locator('input').fill('1000');await ending.locator('input').dispatchEvent('input');
  assert.ok(await page.evaluate(()=>{
   const g=document.querySelector('three-d-stage')._scene.getObjectByName('world_ending_presentation');
   const spared=g.getObjectByName('heaven_parittashubha'),ground=g.getObjectByName('golden_ground');
   const opacity=[];spared.traverse(o=>{if(o.isMesh&&o.visible&&o.material)opacity.push(o.material.opacity);});
   return spared.visible&&opacity.some(a=>a===1)&&!ground.visible;
  }),'water leaves its dhyana boundary intact');
  await ending.locator('[data-ending=close]').click();
 }
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow');assert.deepEqual(errors,[]);
 console.log('PASS',width,'alignment, artwork, drag resizing, side reading, downward game menus, throw, all endings and restoration');
 await context.close();
}}finally{await browser.close();}
