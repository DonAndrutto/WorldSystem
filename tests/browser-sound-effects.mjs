// Optional Chrome verification of the interface and world-ending sound effects.
// Serve the repo, then run with WORLDSYSTEM_URL as for the other browser tests.
// A spy on the Web Audio API counts what the page builds, since headless Chrome
// has no one to listen: nothing here judges how the sounds sound.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT||'playwright');
const url=process.env.WORLDSYSTEM_URL||'http://127.0.0.1:4174/';
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
try {
  const context=await browser.newContext({viewport:{width:1440,height:1000},serviceWorkers:'block'});
  await context.addInitScript(()=>{
    for(const [k,v] of Object.entries({'ws-game-onboarded':'1','ws-game-walkthrough-v1':'dismissed','ws-index':'0','ws-hint':'1','ws-motion':'0','ws-music':'1'}))localStorage.setItem(k,v);
    localStorage.removeItem('ws-sound');
    const fx=window.__fx={contexts:0,oscillators:0,sources:0,gains:[]};
    const Native=window.AudioContext||window.webkitAudioContext;
    window.AudioContext=class extends Native{
      constructor(...a){super(...a);fx.contexts++;}
      createOscillator(){fx.oscillators++;return super.createOscillator();}
      createBufferSource(){fx.sources++;return super.createBufferSource();}
    };
    const NativeAudio=window.Audio;window.__scores=[];
    window.Audio=function(src){const a=new NativeAudio(src);window.__scores.push(a);return a;};
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE',e.message);});
  await page.goto(url);
  await page.waitForFunction(()=>window.WorldSystemReady);await page.locator('.app-intro').waitFor({state:'hidden'});
  const fx=()=>page.evaluate(()=>({...__fx}));
  const built=async(action)=>{const a=await fx();await action();await page.waitForTimeout(80);const b=await fx();return b.oscillators-a.oscillators+b.sources-a.sources;};

  assert.equal((await fx()).contexts,0,'no audio context before the first press');
  assert.equal(await page.locator('#g-sound').evaluate(e=>e.checked),true,'Sound starts on');
  assert.ok(await built(()=>page.locator('[data-menu=options]>summary').click())>=2,'opening a menu sounds');
  assert.equal((await fx()).contexts,1,'one shared audio context');
  assert.ok(await built(()=>page.locator('[data-menu=options]>summary').click())>=2,'and closing it');
  assert.ok(await built(()=>page.locator('[data-menu=mode]>summary').click())>=2);
  const chimes=[];
  for(const m of ['mandala','wheel','game','worlds','astrology','explore']) {
    chimes.push(await built(async()=>{
      if(!await page.locator('[data-menu=mode]').evaluate(e=>e.open))await page.locator('[data-menu=mode]>summary').click();
      await page.locator('[data-mode='+m+']').click();
    }));
  }
  assert.ok(chimes.every(n=>n>=3),'every mode change is heard: '+chimes);
  // the Sound switch silences presses at once and its own press confirms it
  const options=async()=>{if(!await page.locator('[data-menu=options]').evaluate(e=>e.open))await page.locator('[data-menu=options]>summary').click();};
  await options();
  assert.ok(await built(()=>page.locator('label[for=g-sound]').click())===0,'turning Sound off is quiet');
  assert.equal(await page.evaluate(()=>localStorage.getItem('ws-sound')),'0');
  assert.equal(await built(()=>page.locator('[data-act=night]').click()),0,'and presses stay quiet');
  await options();
  assert.ok(await built(()=>page.locator('label[for=g-sound]').click())>=2,'turning it back on is heard');
  await options();
  assert.ok(await built(()=>page.locator('[data-act=night]').click())>=2,'and presses again');
  await options();

  // each of the three endings makes its own sound while it plays, and the score gives way
  const endings={};
  await page.getByRole('button',{name:'World endings',exact:true}).click();
  await page.locator('.world-ending').waitFor({state:'visible'});
  for(const kind of ['fire','water','wind']) {
    // frames are slow under software rendering, so the beds are awaited, not timed
    const base=await fx();
    await page.locator('.world-ending [data-ending='+kind+']').click();   // it starts playing
    await page.locator('.world-ending-controls input').evaluate(e=>{e.value='550';e.dispatchEvent(new Event('input',{bubbles:true}));});
    await page.locator('[data-ending=play]').click();                      // scrubbed to mid-way, then played on
    await page.waitForFunction(b=>__fx.oscillators+__fx.sources-b>=9,base.oscillators+base.sources,{timeout:40000});
    const now=await fx();endings[kind]=now.oscillators+now.sources-base.oscillators-base.sources;
    // software rendering can starve the fade's timer, so the duck is awaited
    await page.waitForFunction(()=>Math.max(0,...__scores.filter(a=>!a.paused).map(a=>a.volume))<.2,{},{timeout:20000});
    await page.locator('[data-ending=play]').click();   // pause
  }
  assert.ok(Object.values(endings).every(n=>n>=9),'every ending sounds: '+JSON.stringify(endings));
  await page.locator('[data-ending=close]').click();
  await page.waitForFunction(()=>Math.max(0,...__scores.filter(a=>!a.paused).map(a=>a.volume))>.3,{},{timeout:20000});
  assert.deepEqual(errors,[]);
  console.log('PASS interface sounds, shared audio context, per-mode chimes, Sound switch, and fire/water/wind endings with the score ducked',JSON.stringify({chimes,endings}));
  await context.close();
} finally {await browser.close();}
