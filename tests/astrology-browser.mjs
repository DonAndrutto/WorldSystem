// Serve the repository; run with WORLDSYSTEM_PLAYWRIGHT=/path/to/playwright node tests/astrology-browser.mjs.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const pw=require(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const kind=process.env.WORLDSYSTEM_BROWSER || 'chromium';
const browser=await pw[kind].launch({headless:true,args:kind==='chromium'?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:[],
  ...(kind==='chromium'?{channel:process.env.WORLDSYSTEM_CHANNEL || 'chrome'}:{}),
  ...(process.env.WORLDSYSTEM_EXECUTABLE?{executablePath:process.env.WORLDSYSTEM_EXECUTABLE}:{})});
const url=process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4174/';
try {
 for(const config of [{width:1280,height:900,touch:false},{width:390,height:844,touch:true},{width:320,height:568,touch:true}]) {
  const context=await browser.newContext({viewport:{width:config.width,height:config.height},hasTouch:config.touch,isMobile:config.touch,serviceWorkers:'block'});
  const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('ws-language','en'); localStorage.setItem('ws-motion','0');});
  await page.goto(url); await page.waitForFunction(()=>window.WorldSystemReady);
  await page.locator('.app-intro').waitFor({state:'hidden'});
  await page.keyboard.press('j');
  const city=page.locator('#jy-place'), list=page.locator('#jy-places');
  const choose=async(query,name)=>{
   await city.fill(query);
   const option=list.getByRole('option',{name,exact:true});
   if(config.touch) await option.tap(); else await option.click();
   assert.equal(await city.inputValue(),name);
   assert.equal(await list.isVisible(),false);
  };
  await choose('Warsaw','Warsaw, Poland');
  assert.equal(await page.locator('#jy-lat').inputValue(),'52.2297');
  assert.equal(await page.locator('#jy-lon').inputValue(),'21.0122');
  assert.equal(await page.locator('#jy-zone').inputValue(),'Europe/Warsaw');
  await choose('Krakow','Kraków, Poland');
  assert.equal(await page.locator('#jy-lat').inputValue(),'50.0647');
  await city.fill('lodz'); await city.press('ArrowDown'); await city.press('Enter');
  assert.equal(await city.inputValue(),'Łódź, Poland');
  await city.fill('War'); await city.press('Tab'); assert.equal(await list.isVisible(),false);
  if(config.touch && kind==='chromium') {
   await city.fill('a'); await list.scrollIntoViewIfNeeded();
   const box=await list.boundingBox(); const x=box.x+box.width/2, y=box.y+box.height-20;
   const cdp=await context.newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
   for(let i=1;i<=6;i++) await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:y-i*20}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await city.inputValue(),'a','scrolling suggestions must not select a city');
   assert.equal(await page.locator('#jy-lat').inputValue(),'');
   await cdp.detach();
  }
  await choose('Warsaw','Warsaw, Poland');
  await page.locator('#jy-date').fill('2025-07-01'); await page.locator('#jy-time').fill('12:00:00');
  await page.locator('.jy-form [type=submit]').click();
  const reading=page.locator('.jy-interpretation .interpretation'); await reading.waitFor();
  await reading.locator(':scope > details > summary').click();
  const scope=await reading.locator('.interpretation-context').innerText();
  assert.match(scope,/2025-07-01 at 12:00/); assert.match(scope,/Warsaw, Poland/);
  assert.match(scope,/Europe\/Warsaw · UTC\+02:00/); assert.doesNotMatch(scope,/UTCUTC/); assert.match(scope,/Calculated mansion interval:/);
  assert.equal(await reading.locator('.interpretation-references').getAttribute('open'),null);
  const activities=reading.getByRole('tabpanel',{name:'Activities'});
  assert.match(await activities.innerText(),/choosing a time to begin/);
  assert.doesNotMatch(await activities.innerText(),/DOCX|source review|body block/);
  await reading.getByRole('tab',{name:'Combinations',exact:true}).click();
  assert.match(await reading.getByRole('tabpanel',{name:'Combinations'}).innerText(),/sunrise/);
  await reading.getByRole('tab',{name:'Birth',exact:true}).click();
  assert.match(await reading.getByRole('tabpanel',{name:'Birth'}).innerText(),/person born/);
  await reading.getByRole('tab',{name:'Activities',exact:true}).click();
  await reading.scrollIntoViewIfNeeded();
  assert.ok(await reading.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'reading fits narrow screens');
  await page.screenshot({path:`/tmp/ws-astrology-${kind}-${config.width}.png`});
  await page.locator('#jy-date').fill('2025-07-02');
  assert.equal(await reading.count(),0,'editing date clears its reading');
  assert.deepEqual(errors,[]);
  await context.close();
  console.log(`PASS: ${kind} ${config.width}px ${config.touch?'touch':'mouse'}, city/coordinates/zone, keyboard, dated interpretation and stale-result clearing.`);
 }
} finally { await browser.close(); }
