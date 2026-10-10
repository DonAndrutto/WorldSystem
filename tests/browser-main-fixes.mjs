import assert from 'node:assert/strict';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const pw=require(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const kind=process.env.WORLDSYSTEM_BROWSER || 'chromium';
const browser=await pw[kind].launch({headless:true,...(kind==='chromium'?{channel:'chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
const url=process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4174/';
try {
 for(const viewport of [{width:1440,height:1000},{width:390,height:844},{width:820,height:1180}].filter(v=>!process.env.WORLDSYSTEM_WIDTH || v.width===Number(process.env.WORLDSYSTEM_WIDTH))) {
  const context=await browser.newContext({viewport,hasTouch:viewport.width<1000,serviceWorkers:'block',reducedMotion:'reduce'});
  await context.addInitScript(()=>{if(!localStorage.getItem('ws-language'))localStorage.setItem('ws-language','en');localStorage.setItem('ws-motion','0');});
  const page=await context.newPage(), errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error' && /THREE|shader|WebGL/i.test(m.text()))errors.push(m.text());});
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.WorldSystemReady,{},{timeout:90000});
  await page.locator('.app-intro').waitFor({state:'hidden'});
  const mode=async id=>{await page.locator('[data-menu=mode] > summary').click();await page.locator('[data-mode='+id+']').click();};
  assert.equal(await page.locator('[data-language-flag]').textContent(),'🇬🇧');
  await page.locator('.app-language > summary').click();await page.locator('.app-language [data-ui-lang=pl]').click();
  assert.equal(await page.locator('[data-language-flag]').textContent(),'🇵🇱');
  await page.reload({waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.WorldSystemReady,{},{timeout:90000});await page.locator('.app-intro').waitFor({state:'hidden'});
  assert.equal(await page.locator('[data-language-flag]').textContent(),'🇵🇱');
  await page.locator('.app-language > summary').click();await page.locator('.app-language [data-ui-lang=en]').click();
  console.log(viewport.width, 'language flags passed');
  await mode('astrology');
  const time=page.locator('#jy-time');assert.equal(await time.inputValue(),'00:00:00');
  await page.locator('#jy-hour').selectOption('13');
  assert.equal(await time.inputValue(),'13:00:00', 'choosing only the hour keeps minutes and seconds zero');
  await page.locator('#jy-date').fill('2000-07-01');await page.locator('#jy-place').fill('gent');
  await page.getByRole('option',{name:'Ghent (Gent / Gand), Belgium',exact:true}).click();
  assert.equal(await page.locator('#jy-zone').inputValue(),'Europe/Brussels');
  await page.locator('.jy-form [type=submit]').click();
  await page.waitForFunction(()=>document.querySelector('.jy-resolved').textContent.includes('UTC'));
  assert.match(await page.locator('.jy-resolved').textContent(),/11:00:00 UTC/);
  assert.ok(await page.locator('.jy-time-picker').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  await page.screenshot({path:join(tmpdir(),'main-astrology-'+viewport.width+'.png')});
  console.log(viewport.width, 'astrology passed');
  await mode('worlds');
  for(const level of ['3','2','3','1','3','0']) {
   await page.locator('#tour-jump').selectOption(level);
   if(+level>=2)await page.waitForFunction(()=>document.querySelector('three-d-stage')._renderer.info.render.points>=1e6,{},{timeout:15000});
   else await page.waitForTimeout(100);
   const memory=await page.evaluate(()=>{
    const scene=document.querySelector('three-d-stage')._scene;
    const group=scene.getObjectByName('thousand_worlds');
    let bytes=0,points=0;group?.traverse(o=>{if(o.isPoints){points+=o.geometry.attributes.position.count*o.geometry.instanceCount;for(const attr of Object.values(o.geometry.attributes))bytes+=attr.array.byteLength;}});
    return {layers:group?.children.length,bytes,points,renderedPoints:document.querySelector('three-d-stage')._renderer.info.render.points};
   });
   assert.equal(memory.layers,level==='0'?0:1);
   if(+level>=2){assert.equal(memory.points,1e6);assert.equal(memory.bytes,24000);assert.ok(memory.renderedPoints>=1e6, 'instanced points reached the GPU');}
   if(level==='3' && viewport.width===1440)await page.screenshot({path:join(tmpdir(),'main-billion-worlds.png')});
  }
  console.log(viewport.width, 'worlds passed');
  await mode('wheel');
  // Test painted locations, independent of the target polygons' bounding boxes.
  const samples={wl_hell_sanjiva:[481,1053],wl_hell_kalasutra:[543,1101],wl_hell_samghata:[449,1093],wl_hell_raurava:[502,1138],wl_hell_maharaurava:[478,1171],wl_hell_tapana:[414,1128],wl_hell_pratapana:[376,1152],wl_hell_avichi:[460,1212],wl_cold_arbuda:[870,1050],wl_cold_nirarbuda:[826,1091],wl_cold_atata:[905,1075],wl_cold_hahava:[851,1128],wl_cold_huhuva:[944,1103],wl_cold_utpala:[872,1172],wl_cold_padma:[977,1120],wl_cold_mahapadma:[878,1212],wl_muni_hells:[558,1015]};
  for(const [id,[x,y]] of Object.entries(samples)) {
   // Keyboard focus frames each target, then use an actual coordinate tap.
   await page.locator('[data-wl='+id+']').focus();
   await page.waitForTimeout(450);
   const at=await page.locator('[data-wl='+id+']').evaluate((el,[x,y])=>{
    const p=new DOMPoint(x,y).matrixTransform(el.getScreenCTM());
    return {x:p.x,y:p.y,hit:document.elementFromPoint(p.x,p.y)?.closest('[data-wl]')?.dataset.wl};
   },[x,y]);
   assert.equal(at.hit,id,`${id} owns the painted point`);
   if(viewport.width<1000)await page.touchscreen.tap(at.x,at.y);else await page.mouse.click(at.x,at.y);
   await page.locator('.sheet').waitFor({state:'visible'});
   assert.ok(await page.locator('[data-wl='+id+']').evaluate(el=>el.classList.contains('wl-sel')));
   await page.keyboard.press('Escape');
  }
  assert.deepEqual(errors,[]);
  console.log('PASS',kind,viewport.width,'flags, 24-hour selection, Belgian calculation, bounded world layers, all 17 painted targets');
  if(viewport.width===1440) {
   await page.evaluate(async()=>{
    const {drawWheel}=await import('./wheel-art.js');const {PARTS}=await import('./wheel-parts.js');const w=drawWheel();
    document.body.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" viewBox="315 960 720 330" style="width:1400px;height:642px;background:#16334b">'+w.layers.find(l=>l.name==='wheel').svg+'</svg>';
    for(const el of document.querySelectorAll('.wl-part')) {
     if(!/wl_hell_(sanjiva|kalasutra|samghata|raurava|maharaurava|tapana|pratapana|avichi)|wl_cold_|wl_muni_hells/.test(el.dataset.wl)) {el.remove();continue;}
     el.style.fill='none';el.style.stroke='#faff00';el.style.strokeWidth='1';
     const b=el.getBBox(), text=document.createElementNS('http://www.w3.org/2000/svg','text');
     text.setAttribute('x',b.x+b.width/2);text.setAttribute('y',b.y+b.height/2);text.setAttribute('text-anchor','middle');text.setAttribute('font-size','8');text.setAttribute('fill','yellow');text.setAttribute('stroke','#000');text.setAttribute('stroke-width','0.4');text.textContent=el.dataset.wl.replace('wl_hell_','').replace('wl_cold_','').replace('wl_muni_','');el.after(text);
    }
   });
   await page.screenshot({path:join(tmpdir(),'main-hell-targets.png')});
  }
  await context.close();
 }
} finally {await browser.close();}
