import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';
import { MANSIONS } from '../lunar-mansions.js';
import { getInterpretation, getActiveSbyorBa, getMomentInterpretation, getAfflictionStatus, getRemedies } from '../jyotisha-interpret.js';
import { createInterpretation } from '../interpretation-ui.js';
import { createJyotishaPanel } from '../jyotisha-panel.js';
import { createMansionUI } from '../mansion-ui.js';
import { ELEMENT_COMBINATIONS, NAMED_COMBINATIONS } from '../white-beryl-rules.js';
const read = f => fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
const data = JSON.parse(read('data/nakshatra_interpretation.json'));
const source = JSON.parse(read('docs/WHITE-BERYL-CH33-EXTRACT.json'));
assert.equal(Object.keys(data).length,28);
assert.deepEqual(Object.keys(data).sort(),MANSIONS.map(m=>m.id).sort());
assert.equal(source.filter(b=>b.table).length,22);
for(const m of MANSIONS) {
 const e=getInterpretation(m.id);
 assert.deepEqual(e,data[m.id]);
 assert.equal(e.source_tibetan,source.find(b=>b.block===e.source_block).text);
 assert.equal(e.element,m.fourElement); assert.equal(e.nag_rtsis_element,m.fiveElement);
 assert.ok(e.electional.favorable.length && e.electional.unfavorable.length && e.natal.character);
 assert.match(e.electional.source,/chapter 33/);
 assert.ok(e.remedies.illness_onset);
 assert.deepEqual(e.enemy_star_ids,[],'do not invent a natal relationship from the bla-skar table');
}
assert.equal(getInterpretation('__proto__'),null);
assert.equal(getRemedies('lm_tha_skar','__proto__'),null);
assert.equal(read('interpretation-data.js'),createRequire(import.meta.url)('../scripts/build-interpretation.cjs').build());
const moment={date:'2025-07-01',time:'12:00',utcMs:Date.UTC(2025,6,1,10),zoneResolved:true,vara:'Maṅgalavāra',varaIndex:2};
const cases=[['lm_snar_ma',5,'earth-earth'],['lm_lag',1,'water-water'],['lm_snar_ma',1,'earth-water'],['lm_bra_nye',0,'fire-fire'],['lm_tha_skar',4,'wind-wind'],['lm_tha_skar',0,'fire-wind'],['lm_snar_ma',4,'earth-wind'],['lm_lag',4,'water-wind'],['lm_snar_ma',0,'earth-fire'],['lm_lag',0,'fire-water']];
for(const [id,varaIndex,key] of cases) assert.equal(getActiveSbyorBa({...moment,varaIndex},id),key);
for(const m of MANSIONS) for(let day=0;day<7;day++) assert.ok(ELEMENT_COMBINATIONS[getActiveSbyorBa({...moment,varaIndex:day},m.id)]);
assert.equal(getActiveSbyorBa({...moment,zoneResolved:false},'lm_tha_skar'),'unknown');
assert.equal(getActiveSbyorBa({...moment,vara:null},'lm_tha_skar'),'unknown');
assert.equal(getActiveSbyorBa({...moment,varaIndex:undefined},'lm_tha_skar'),'fire-wind');
assert.equal(getActiveSbyorBa(moment,'missing'),'unknown');
assert.equal(getAfflictionStatus('lm_lag',{moment}).afflicted,true);
assert.equal(getAfflictionStatus('lm_tha_skar',{moment}).afflicted,false);
for(const rule of NAMED_COMBINATIONS) { assert.equal(rule.starSets.length,7); for(const id of rule.starSets.flat()) assert.ok(data[id]); }
// Table 317's shared numeric 21 is resolved by the explicit verse, not guessed.
assert.equal(NAMED_COMBINATIONS.find(r=>r.block===268).starSets[1][0],'lm_byi_bzhin');
assert.equal(NAMED_COMBINATIONS.find(r=>r.block===264).starSets[1][0],'lm_gro_bzhin');
// Sunday Magha has both paired and always-avoided readings. Preserve both.
const conflict=getMomentInterpretation('lm_mchu',{...moment,varaIndex:0});
assert.ok(conflict.named.some(r=>r.block===266)); assert.ok(conflict.named.some(r=>r.block===290));
const dom=new JSDOM('<div id="root"></div><div id="calc"></div><div id="mansions"></div>');
const doc=dom.window.document; const originalFetch=globalThis.fetch; let requests=0;
globalThis.fetch=()=>{requests++;throw Error('No network');};
try {
 const ui=createInterpretation({doc,id:'lm_tha_skar',moment});doc.querySelector('#root').append(ui);
 assert.equal(ui.querySelector('details').open,false);
 assert.match(ui.querySelector('summary').textContent,/White Beryl/);
 assert.equal(ui.querySelectorAll('[role=tab]').length,4);
 assert.match(ui.querySelector('[role=tabpanel]').textContent,/Teaching Dharma/);
 const tabs=ui.querySelectorAll('[role=tab]');tabs[1].click();
 assert.match(ui.querySelector('[role=tabpanel]:not([hidden])').textContent,/music and dance/);
 tabs[2].click(); assert.match(ui.querySelector('[role=tabpanel]:not([hidden])').textContent,/Strength/);
 tabs[3].click();assert.doesNotMatch(ui.querySelectorAll('[role=tabpanel]')[3].textContent,/flour effigy/);
 ui.querySelector('[type=checkbox]').click();assert.match(ui.querySelectorAll('[role=tabpanel]')[3].textContent,/flour effigy/);
 assert.equal(ui.querySelector('[lang=bo]').textContent,data.lm_tha_skar.source_tibetan);
 tabs[3].dispatchEvent(new dom.window.KeyboardEvent('keydown',{key:'Home',bubbles:true}));
 assert.equal(tabs[0].getAttribute('aria-selected'),'true');
 const fixture=structuredClone(data.lm_tha_skar);fixture.natal.character='<img src=x onerror=alert(1)>';
 assert.equal(createInterpretation({doc,id:'lm_tha_skar',entry:fixture}).querySelector('img'),null);
 const catalogue=createMansionUI({doc,panel:doc.querySelector('#mansions')});
 assert.equal(catalogue.panel.querySelectorAll('.interpretation').length,28);
 assert.equal(catalogue.panel.querySelectorAll('.interpretation > details[open]').length,0);
 const calc=createJyotishaPanel({doc,panel:doc.querySelector('#calc'),provider:{ready:true,calculate:async()=>({catalogueId:'lm_tha_skar',nakshatra:'Aśvinī',pada:1,vimshottariLord:'Ketu',moonSiderealLongitude:1,nakshatraStart:moment.utcMs,nakshatraEnd:moment.utcMs+1000,padaEnd:moment.utcMs+1000,vara:{name:moment.vara,index:2},udaya:null})}});
 const form=calc.panel.querySelector('form');
 for(const [k,v] of Object.entries({date:'2025-07-01',time:'12:00',latitude:'52.2297',longitude:'21.0122',zone:'Europe/Warsaw'})) form.elements[k].value=v;
 await calc.submit();assert.equal(calc.resultId,'lm_tha_skar');
 assert.match(calc.panel.querySelector('.interpretation').textContent,/Strength/);assert.equal(requests,0);
} finally {globalThis.fetch=originalFetch;dom.window.close();}
console.log('PASS: 28 sourced readings, 22 extracted tables, 196 element combinations, source variants, collapsed tabs, rituals, Tibetan text, calculator linkage, no network.');
