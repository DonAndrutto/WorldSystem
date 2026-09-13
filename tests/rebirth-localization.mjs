import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {Vector3} from 'three';
import {REBIRTH_TIBETAN,TIBETAN_SOURCE_SHA256} from '../rebirth-tibetan.js';
import {REBIRTH_ICONOGRAPHY,REBIRTH_END_ART} from '../rebirth-iconography.js';
import {createRebirthUI} from '../rebirth-ui.js';
import {createGame,rollGame,nextPlayer} from '../rebirth-engine.js';
import {getRebirthOutcome} from '../rebirth-data.js';
const supplied=readFileSync(new URL('../data/rebirth-tibetan-align.json',import.meta.url));
assert.equal(TIBETAN_SOURCE_SHA256,createHash('sha256').update(supplied).digest('hex'));
for(const row of JSON.parse(supplied))assert.equal(REBIRTH_TIBETAN[row.n],row.tib,'No silent correction of supplied Tibetan');
const manifest=JSON.parse(readFileSync(new URL('../assets/rebirth/manifest.json',import.meta.url)));
assert.equal(manifest.assets.length,104);
for(const entry of manifest.assets){
 const art=REBIRTH_ICONOGRAPHY[entry.number];
 for(const [key,asset] of [['src',entry.full],['thumbSrc',entry.thumbnail]]){
  const bytes=readFileSync(new URL('../'+art[key],import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
 }
}
assert.ok(existsSync(new URL('../'+REBIRTH_END_ART.src,import.meta.url)));
const dom=new JSDOM('<main><button class="marker"></button><aside></aside></main>',{url:'https://example.org',pretendToBeVisual:true});
const {document:doc}=dom.window;dom.window.matchMedia=()=>({matches:true});
const scene={points:new Map(Array.from({length:104},(_,i)=>[i+1,new Vector3()])),update(){},setActive(){},tokenPoint(){return new Vector3();}};
function uiWith(storage){return createRebirthUI({panel:doc.querySelector('aside'),marker:doc.querySelector('.marker'),scene,storage,die:()=>1,onFocus(){},onOverview(){},onChange(){}});}
const ui=uiWith(dom.window.localStorage);ui.setActive(true);ui.start(['Reader']);const saved=JSON.stringify(ui.state);
ui.setDiagram(true);assert.equal(ui.board.element.querySelectorAll('.rb-board-art').length,104);
for(const mode of ['tibetan','both','english']){
 ui.setNameMode(mode);
 assert.equal(JSON.stringify(ui.state),saved,'Changing labels cannot move a traveller');
 for(let n=1;n<=104;n++){
  const slot=ui.board.slots.get(n);assert.equal(slot.button.querySelector('.rb-board-art').getAttribute('src'),REBIRTH_ICONOGRAPHY[n].thumbSrc);
  assert.equal(slot.name.querySelector('[lang="bo"]')?.textContent,mode==='english'?undefined:REBIRTH_TIBETAN[n]);
 }
}
ui.setNameMode('tibetan');ui.board.slots.get(76).button.click();
assert.equal(ui.presentation.dialog.querySelector('h2 [lang="bo"]').textContent,REBIRTH_TIBETAN[76]);
assert.equal(ui.presentation.dialog.querySelector('.rb-reveal-art img').getAttribute('src'),REBIRTH_ICONOGRAPHY[76].src);
const passage=ui.presentation.dialog.querySelector('details');passage.open=true;
const control=ui.presentation.dialog.querySelector('select');control.value='both';control.dispatchEvent(new dom.window.Event('change'));
assert.equal(ui.nameMode,'both');assert.equal(passage.open,true,'Language toggle preserves expanded reading');
assert.equal(doc.querySelector('.rb-tools select').value,'both');
assert.equal(ui.presentation.dialog.querySelectorAll('h2 [lang]').length,2);
assert.equal(dom.window.localStorage.getItem('ws-rebirth-name-mode'),'both');
ui.presentation.cancel();ui.advance();
assert.equal(ui.presentation.dialog.querySelector('.rb-reveal-art img').getAttribute('src'),REBIRTH_ICONOGRAPHY[27].src);
assert.equal(ui.presentation.dialog.querySelector('h2 [lang="bo"]').textContent,REBIRTH_TIBETAN[27]);
ui.presentation.cancel();
const queue=[[24,[]]],seen=new Set([24]);let path;
while(queue.length){const [n,moves]=queue.shift();if(n===104){path=moves;break;}for(let die=1;die<=6;die++){const to=getRebirthOutcome(n,die).to;if(!seen.has(to)&&![1,48].includes(to)){seen.add(to);queue.push([to,[...moves,die]]);}}}
let state=createGame(['Winner']);for(const die of path)state=nextPlayer(rollGame(state,die));
const storage={getItem:key=>key==='ws-rebirth-v1'?JSON.stringify(state):key==='ws-rebirth-name-mode'?'tibetan':null,setItem(){}};
ui.setActive(false);const winner=uiWith(storage);winner.setActive(true);winner.setDiagram(true);
assert.equal(winner.nameMode,'tibetan','Language choice restores independently of game');
assert.equal(doc.querySelector('.rb-ending img').getAttribute('src'),REBIRTH_END_ART.src);
assert.equal(winner.board.element.querySelector('.rb-board-ending').hidden,false);
winner.advance();assert.equal(winner.presentation.dialog.querySelector('.rb-reveal-art img').getAttribute('src'),REBIRTH_END_ART.src);
winner.presentation.cancel();winner.requestReset();winner.resetDialog.querySelector('[data-reset="confirm"]').click();
assert.equal(doc.querySelector('.rb-ending'),null);assert.equal(winner.board.element.querySelector('.rb-board-ending').hidden,true);
console.log('PASS: 104 artwork mappings and hashes, exact Tibetan import, all label modes, synchronized popup controls, preserved reading/game state, restored preference, winning artwork and reset.');
