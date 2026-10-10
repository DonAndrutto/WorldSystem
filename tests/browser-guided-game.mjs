// Local browser verification. Uses real rules, persistent storage and touch coordinates.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {WALKTHROUGH_STEPS, WALKTHROUGH_KEY} from '../game-walkthrough.js';
import {createGame, throwDie} from '../rebirth-game.js';
import {MOVES, FACES} from '../rebirth-board.js';
import {makeSession, SESSION_KEY} from '../game-session.js';
const engines = createRequire(import.meta.url)(process.env.WORLDSYSTEM_PLAYWRIGHT || 'playwright');
const engine = process.env.WORLDSYSTEM_BROWSER || 'chromium';
const browser = await engines[engine].launch({headless:true, ...(engine === 'chromium' ? {channel:'chrome'} : {})});
const base = process.env.WORLDSYSTEM_URL || 'http://127.0.0.1:4175/';
const output = process.env.WORLDSYSTEM_SCREENSHOTS;
if(output)fs.mkdirSync(output,{recursive:true});
const configs=[{width:320,height:568,touch:true},{width:390,height:844,touch:true},{width:820,height:1180,touch:true},{width:1180,height:820,touch:true},{width:1440,height:1000},{width:390,height:844,touch:true,language:'pl'}];
try { for(const config of configs.filter(c=>(!process.env.WORLDSYSTEM_TOUCH_ONLY || (c.touch && !c.language && c.width!==320)) && (!process.env.WORLDSYSTEM_WIDTH || c.width===Number(process.env.WORLDSYSTEM_WIDTH)))) {
  const context=await browser.newContext({viewport:config,hasTouch:!!config.touch,isMobile:!!config.touch,deviceScaleFactor:1,serviceWorkers:'block'});
  await context.addInitScript(({language})=>{
    for(const [k,v] of Object.entries({'ws-index':'0','ws-hint':'1','ws-sound':'0','ws-music':'0','ws-game-follow':'0'}))localStorage.setItem(k,v);
    if(language)localStorage.setItem('ws-language',language);
  },config);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const enter=async()=>{
    await page.waitForFunction(()=>window.WorldSystemReady,{}, {timeout:30000});
    await page.locator('.app-intro').waitFor({state:'hidden'});
    await page.locator('[data-menu=mode]>summary').click();await page.locator('[data-mode=game]').click();
  };
  const readSaved=()=>page.evaluate(key=>localStorage.getItem(key),SESSION_KEY);
  const snap=async name=>{if(output)await page.screenshot({animations:'disabled',path:output+'/'+config.width+'-'+(config.language||'en')+'-'+name+'.png'});};
  const action=page.locator('[data-game=throw]');
  const bounds=()=>action.boundingBox();
  const tap=async b=>config.touch? page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2):page.mouse.click(b.x+b.width/2,b.y+b.height/2);
  const fixed=async b=>{
    const now=await bounds();for(const key of ['x','y','width','height'])assert.ok(Math.abs(now[key]-b[key])<1,'fixed '+key);
    assert.ok(now.y>=0&&now.y+now.height<=config.height,'action fits viewport');
    if(!await action.isDisabled())assert.ok(await action.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}),'action is not covered');
  };
  await page.goto(base);await enter();
  await page.locator('.bv-walkthrough').waitFor({state:'visible'});
  if(config.language)assert.match(await page.locator('.bv-walkthrough h2').innerText(),/Nauka/);
  const original=await readSaved();const anchor=await bounds();
  const game=createGame({players:1});
  for(let i=0;i<WALKTHROUGH_STEPS.length;i++) {
    assert.equal(game.players[0].pos,WALKTHROUGH_STEPS[i].square);
    assert.equal(await page.locator('.bv-walkthrough-count').textContent(),(i+1)+' / '+WALKTHROUGH_STEPS.length);
    assert.equal(await page.locator('.bv-sq[aria-selected=true]').getAttribute('data-square'),String(game.players[0].pos));
    await fixed(anchor);assert.equal(await readSaved(),original,'practice leaves saved game intact');
    if(i===0||i===8)await snap('guide-'+i);
    if(WALKTHROUGH_STEPS[i].face)throwDie(game,WALKTHROUGH_STEPS[i].face);
    await tap(anchor);
  }
  await page.locator('.bv-walkthrough').waitFor({state:'hidden'});
  assert.equal(await page.evaluate(key=>localStorage.getItem(key),WALKTHROUGH_KEY),'complete');
  await page.locator('.bv-ask').waitFor({state:'visible'});
  await page.locator('[data-game=start-new]').click();
  // Each tap at one fixed coordinate commits one throw, including a dead face.
  await page.locator('.bv-tools>summary').click();await page.locator('#g-pace').selectOption('instant');
  await page.locator('.bv-tools>summary').click();
  await page.evaluate(()=>{let n=0;const faces=[6,1,2,2,3,2,2,2];Math.random=()=>((faces[n++%faces.length]-.5)/6);});
  const fast=await bounds();
  for(let i=1;i<=8;i++) {
    await fixed(fast);await tap(fast);
    assert.equal(JSON.parse(await readSaved()).rolls.length,i,'one throw per repeated tap');
    await page.locator('.bv-card').waitFor({state:'visible'});await fixed(fast);
    const card=await page.locator('.bv-card-in').boundingBox();assert.ok(card.y+card.height<=fast.y,'card clears action');
  }
  await snap('fast');
  // Replay/dismiss and reload preserve the actual saved game and pace.
  await page.locator('[data-game=card-close]').click();
  await page.locator('.bv-tools>summary').click();await page.locator('[data-game=replay-guide]').click();
  const saved=await readSaved();await tap(await bounds());assert.equal(await readSaved(),saved);
  await page.locator('[data-game=dismiss-guide]').click();assert.equal(await readSaved(),saved);
  assert.equal(await page.locator('#g-pace').inputValue(),'instant');
  await page.reload();await enter();assert.equal(await page.locator('.bv-walkthrough').isVisible(),false);
  assert.equal(await readSaved(),saved);
  // Quick mode ignores extra taps while a single throw is in flight.
  await page.locator('.bv-tools>summary').click();await page.locator('#g-pace').selectOption('quick');await page.locator('.bv-tools>summary').click();
  const quick=await bounds();await tap(quick);await tap(quick);
  await page.waitForFunction(()=>!document.querySelector('[data-game=throw]').disabled);
  assert.equal(JSON.parse(await readSaved()).rolls.length,9,'quick does not queue extra throws');await fixed(quick);
  await tap(quick);await page.waitForFunction(()=>!document.querySelector('[data-game=throw]').disabled);
  assert.equal(JSON.parse(await readSaved()).rolls.length,10,'same target advances after animation');await fixed(quick);
  if(config.width===1440) {
    await page.locator('[data-game=card-close]').click();
    await page.locator('.bv-tools>summary').click();await page.locator('[data-game=replay-guide]').click();
    await tap(await bounds());const beforeReload=await readSaved();
    await page.reload();await enter();assert.equal(await readSaved(),beforeReload,'reloading practice preserves real game');
    await page.locator('.bv-tools>summary').click();await page.locator('[data-game=replay-guide]').click();
    await page.keyboard.press('Escape');assert.equal(await readSaved(),beforeReload,'Escape restores the game');
    // Existing players also see the default guide on the first visit after update.
    await page.evaluate(key=>localStorage.removeItem(key),WALKTHROUGH_KEY);
    await page.reload();await enter();await page.locator('.bv-walkthrough').waitFor({state:'visible'});
    await tap(await bounds());assert.equal(await readSaved(),beforeReload);
    await page.locator('[data-menu=mode]>summary').click();await page.locator('[data-mode=explore]').click();
    assert.equal(await readSaved(),beforeReload,'leaving practice preserves game');
    assert.equal(await page.locator('.bv-advance').isVisible(),false,'no game action in Explorer');
    await page.locator('[data-menu=mode]>summary').click();await page.locator('[data-mode=game]').click();
    assert.equal(await page.locator('.bv-walkthrough').isVisible(),false);
    // Follow real shortest routes to exercise counters and the final ceremonial throw.
    const routeTo=target=>{
      const queue=[[24,[]]],seen=new Set([24]);
      for(const [at,route] of queue){if(at===target)return route;
        if(at===1||at===48)continue;
        FACES.forEach((face,i)=>{const next=MOVES[at]?.[face];if(next&&!seen.has(next)){seen.add(next);queue.push([next,[...route,i+1]]);}});
      }
      throw Error('No route');
    };
    for(const target of [1,104]) {
      const session=makeSession(createGame({players:1,names:['A traveler with a long name']}));
      const route=routeTo(target);session.rolls=route.slice(0,-1);
      await page.evaluate(({key,session})=>{localStorage.setItem(key,JSON.stringify(session));localStorage.setItem('ws-game-pace','instant');}, {key:SESSION_KEY,session});
      await page.reload();await enter();
      const last=route.at(-1);await page.evaluate(face=>{Math.random=()=>(face-.5)/6;},last);
      const at=await bounds();await tap(at);await fixed(at);
      assert.equal(JSON.parse(await readSaved()).rolls.length,route.length);
      await page.evaluate(()=>{Math.random=()=>0;});await tap(at);await fixed(at);
      assert.equal(JSON.parse(await readSaved()).rolls.length,route.length+1);
      if(target===104)assert.equal(await action.isDisabled(),true,'ceremony ends the game');
    }
  }
  // The same action also works in World view, clear of world and app controls.
  if(config.width===390&&!config.language) {
    await page.locator('[data-game=card-close]').click();await page.locator('[data-layout=world]').click();
    await page.locator('.bv-tools>summary').click();await page.locator('#g-pace').selectOption('instant');await page.locator('.bv-tools>summary').click();
    const world=await bounds(),count=JSON.parse(await readSaved()).rolls.length;
    await tap(world);await fixed(world);await tap(world);await fixed(world);
    assert.equal(JSON.parse(await readSaved()).rolls.length,count+2);await snap('world-fast');
  }
  assert.deepEqual(errors,[]);console.log('PASS',engine,config.width,config.height,config.language||'en');await context.close();
} } finally {await browser.close();}
