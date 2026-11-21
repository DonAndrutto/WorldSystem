// Optional Chrome verification. Serve the repo, then run with the same
// WORLDSYSTEM_URL and WORLDSYSTEM_PLAYWRIGHT options as browser-ui.mjs.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const url=process.env.WORLDSYSTEM_URL||'http://127.0.0.1:4174/';
const instrumentWebAudio=()=>{
  const NativeAC=window.AudioContext||window.webkitAudioContext;
  window.__audio={contexts:[],oscillators:0,suspends:0,resumes:0};
  const wrap=function(...args){
    const ctx=new NativeAC(...args);
    window.__audio.contexts.push(ctx);
    const origOsc=ctx.createOscillator.bind(ctx);
    ctx.createOscillator=()=>{window.__audio.oscillators++;return origOsc();};
    const origSuspend=ctx.suspend.bind(ctx);
    ctx.suspend=()=>{window.__audio.suspends++;return origSuspend();};
    const origResume=ctx.resume.bind(ctx);
    ctx.resume=()=>{window.__audio.resumes++;return origResume();};
    return ctx;
  };
  wrap.prototype=NativeAC.prototype;
  window.AudioContext=wrap;
  if(window.webkitAudioContext)window.webkitAudioContext=wrap;
};
try {
  for(const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    const context=await browser.newContext({viewport,serviceWorkers:'block'});
    await context.addInitScript(()=>{
      localStorage.setItem('ws-game-onboarded','1'); localStorage.setItem('ws-game-walkthrough-v1','dismissed');localStorage.setItem('ws-game-view','world');
      localStorage.setItem('ws-index','0');localStorage.setItem('ws-hint','1');localStorage.setItem('ws-motion','0');
      localStorage.setItem('ws-intro-seen','1');
    });
    await context.addInitScript(instrumentWebAudio);
    const page=await context.newPage(),errors=[],failed=[],mp3Requests=[];
    page.on('pageerror',e=>{errors.push(e.message);console.error('PAGE',e.message);});
    page.on('console',m=>{if(m.type()==='error'){errors.push(m.text());console.error('CONSOLE',m.text().slice(0,1500));}});
    page.on('requestfailed',r=>failed.push(r.url()));
    page.on('request',r=>{if(/\.mp3($|\?)/i.test(r.url()))mp3Requests.push(r.url());});
    const ready=async()=>{
      try {await page.waitForFunction(()=>window.WorldSystemReady);}
      catch(error) {console.error(JSON.stringify({errors,failed,status:await page.locator('.intro-status').innerText()}));throw error;}
      await page.locator('.app-intro').waitFor({state:'hidden'});
    };
    const mode=async(name)=>{await page.locator('[data-menu=mode]>summary').click();await page.locator('[data-mode='+name+']').click();};
    const options=async()=>{if(!await page.locator('[data-menu=options]').evaluate(e=>e.open))await page.locator('[data-menu=options]>summary').click();};
    const synthRunning=async()=>page.waitForFunction(()=>window.__audio.contexts.some(c=>c.state==='running') && window.__audio.oscillators>0);
    await page.goto(url);await ready();
    assert.equal(await page.locator('#g-music').isChecked(),true);
    await page.keyboard.press('Shift');   // first gesture unlocks Web Audio synthesis
    await synthRunning();
    const oscAfterExplore=await page.evaluate(()=>window.__audio.oscillators);
    await mode('wheel');
    await page.waitForFunction(n=>window.__audio.oscillators>n,oscAfterExplore);
    const oscAfterWheel=await page.evaluate(()=>window.__audio.oscillators);
    await mode('game');
    await page.waitForFunction(n=>window.__audio.oscillators>n,oscAfterWheel);
    await options();await page.locator('#g-music').uncheck();
    assert.equal(await page.evaluate(()=>localStorage.getItem('ws-music')),'0');
    assert.equal(await page.locator('#g-sound').isChecked(),true,'Music mute leaves square effects enabled');
    const oscWhenMuted=await page.evaluate(()=>window.__audio.oscillators);
    await page.waitForTimeout(450);
    assert.equal(await page.evaluate(()=>window.__audio.oscillators),oscWhenMuted,'Muted music stops scheduling new oscillators');
    await page.reload();await ready();
    assert.equal(await page.locator('#g-music').isChecked(),false,'Explicit mute survives reload');
    await mode('game');
    await page.waitForTimeout(300);
    assert.equal(await page.evaluate(()=>window.__audio.oscillators),0,'Muted Game does not start synthesis');
    await options();await page.locator('#g-music').check();await synthRunning();
    // Exercise visibility lifecycle deterministically in headless Chrome.
    const oscBeforeHide=await page.evaluate(()=>window.__audio.oscillators);
    await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(350);
    const oscWhileHidden=await page.evaluate(()=>window.__audio.oscillators);
    await page.waitForTimeout(350);
    assert.equal(await page.evaluate(()=>window.__audio.oscillators),oscWhileHidden,'Hidden tab halts synthesis scheduling');
    await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForFunction(n=>window.__audio.oscillators>n,Math.max(oscBeforeHide,oscWhileHidden));
    await mode('astrology');
    assert.equal(await page.locator('[data-mode=astrology]').getAttribute('aria-pressed'),'true');
    await page.locator('.jy-panel').waitFor({state:'visible'});
    await mode('explore');
    const geometry=await page.evaluate(async()=>{
      const THREE=await import('three'),stage=document.querySelector('three-d-stage');
      const world=stage._object;world.updateMatrixWorld(true);
      const bins=new Map();let missingUV=0;
      world.traverse(o=>{
        if(o.isMesh && o.name.startsWith('heaven_')) {
          if(!bins.has(o.name))bins.set(o.name,new THREE.Box3());bins.get(o.name).expandByObject(o);
          if(o.material.bumpMap && !o.geometry.attributes.uv)missingUV++;
        }
      });
      return {missingUV,levels:[...bins].sort((a,b)=>a[1].min.y-b[1].min.y)
        .map(([id,b])=>({id,width:b.max.x-b.min.x,bottom:b.min.y,top:b.max.y}))};
    });
    assert.equal(geometry.levels.length,21);assert.equal(geometry.missingUV,0);
    for(let i=1;i<21;i++){
      assert.ok(geometry.levels[i].width>geometry.levels[i-1].width,'Progressively wider rendered realms');
      assert.ok(geometry.levels[i].bottom-geometry.levels[i-1].top>.008,'Clear gaps between rendered realms');
    }
    if(process.env.WORLDSYSTEM_SCREENSHOTS){
      await page.waitForTimeout(1200); // finish the Explorer camera flight
      await page.evaluate(async()=>{
        const THREE=await import('three'),stage=document.querySelector('three-d-stage');
        const box=new THREE.Box3();stage._object.traverse(o=>{if(o.isMesh && /^(vaijayanta_|sudarshana_city|nandana)/.test(o.name))box.expandByObject(o);});
        const center=box.getCenter(new THREE.Vector3());
        stage._controls.target.copy(center);stage._camera.position.copy(center).add(new THREE.Vector3(.29,.15,.34));
        stage._controls.update();
      });
      await page.waitForTimeout(400);
      await page.screenshot({path:process.env.WORLDSYSTEM_SCREENSHOTS+'/palace-'+viewport.width+'.png'});
      await mode('game');await synthRunning();
      await page.waitForTimeout(1200);
      await page.screenshot({path:process.env.WORLDSYSTEM_SCREENSHOTS+'/game-'+viewport.width+'.png'});
    }
    assert.deepEqual(mp3Requests,[],'No pre-rendered MP3 audio files are fetched');
    assert.deepEqual(errors,[],'No runtime or shader errors');assert.deepEqual(failed,[],'All local scene and soundtrack resources load');
    console.log('PASS rendered realm progression and Web Audio soundtrack synthesis, mute, reload and lifecycle',JSON.stringify(viewport));
    await context.close();
  }
  // A fresh installed copy must synthesize the soundtrack after network access ends.
  const context=await browser.newContext({viewport:{width:390,height:844}});
  await context.addInitScript(()=>{
    localStorage.setItem('ws-game-onboarded','1'); localStorage.setItem('ws-game-walkthrough-v1','dismissed');localStorage.setItem('ws-motion','0');
    localStorage.setItem('ws-intro-seen','1');
  });
  await context.addInitScript(instrumentWebAudio);
  const page=await context.newPage();
  await page.goto(url);await page.waitForFunction(()=>window.WorldSystemReady);
  await page.evaluate(async()=>{
    await navigator.serviceWorker.ready;
    if(!navigator.serviceWorker.controller)await new Promise(resolve=>navigator.serviceWorker.addEventListener('controllerchange',resolve,{once:true}));
  });
  await context.setOffline(true);await page.reload();
  await page.waitForFunction(()=>window.WorldSystemReady);await page.locator('.app-intro').waitFor({state:'hidden'});
  await page.locator('[data-menu=mode]>summary').click();await page.locator('[data-mode=game]').click();
  await page.waitForFunction(()=>window.__audio.contexts.some(c=>c.state==='running') && window.__audio.oscillators>0);
  console.log('PASS installed offline scene and live Web Audio soundtrack synthesis');
  await context.close();
} finally {await browser.close();}
