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
const reviewIds=Object.keys(data).filter(id=>data[id].review_notes.some(note=>typeof note==='string' && note.trim()));
for(const id of ['lm_snar_ma','lm_sa_ga','lm_khrums_stod']) assert.ok(reviewIds.includes(id));
for(const m of MANSIONS) {
 const e=getInterpretation(m.id);
 assert.deepEqual(e,data[m.id]);
 assert.equal(e.source_tibetan,source.find(b=>b.block===e.source_block).text);
 if(reviewIds.includes(m.id)) assert.equal(e.needs_source_review,true,`${m.id}: uncertainty notes require source review`);
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
 assert.match(ui.querySelector('summary').textContent,/Aśvinī/);
 assert.match(ui.querySelector('.interpretation-context').textContent,/2025-07-01 at 12:00/);
 assert.equal(ui.querySelector('.interpretation-references').open,false);
 assert.equal(ui.querySelector('.interpretation-review'),null);
 assert.match(ui.querySelector('.interpretation-references').textContent,/White Beryl/);
 assert.doesNotMatch(ui.querySelector('[role=tabpanel]').textContent,/body block|Selective English|source review/);
 assert.equal(ui.querySelectorAll('.interpretation-references a').length,3);
 const undated=createInterpretation({doc,id:'lm_tha_skar'});
 assert.match(undated.querySelector('.interpretation-context').textContent,/not a reading for today/);
 const polar=createInterpretation({doc,id:'lm_tha_skar',moment:{...moment,vara:null}});
 assert.match(polar.querySelector('.interpretation-context').textContent,/2025-07-01/);
 assert.match(polar.querySelectorAll('[role=tabpanel]')[2].textContent,/no sunrise-based weekday/);
 const mismatch=createInterpretation({doc,id:'lm_tha_skar',moment:{...moment,catalogueId:'lm_snar_ma'}});
 assert.match(mismatch.querySelector('.interpretation-context').textContent,/not a reading for today/);
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
 const assertReview=reading=>{
  assert.equal(reading.querySelector(':scope > details > .interpretation-review').textContent,'Source review needed. See Sources and translation notes.');
  assert.equal(reading.querySelector('.interpretation-references').open,false);
  assert.equal(reading.querySelectorAll('[role=tab]:disabled').length,0);
 };
 for(const m of MANSIONS) {
  const reading=catalogue.panel.querySelector(`[data-id="${m.id}"] .interpretation`);
  if(data[m.id].needs_source_review) assertReview(reading);
  else assert.equal(reading.querySelector('.interpretation-review'),null);
  for(const note of data[m.id].review_notes) assert.ok(reading.querySelector('.interpretation-references').textContent.includes(note));
 }
 let calculatedId='lm_tha_skar';
 const calc=createJyotishaPanel({doc,panel:doc.querySelector('#calc'),provider:{ready:true,calculate:async()=>({catalogueId:calculatedId,nakshatra:data[calculatedId].sanskrit,pada:1,vimshottariLord:'Ketu',moonSiderealLongitude:1,nakshatraStart:moment.utcMs,nakshatraEnd:moment.utcMs+1000,padaEnd:moment.utcMs+1000,vara:{name:moment.vara,index:2},udaya:null})}});
 const form=calc.panel.querySelector('form');
 for(const [k,v] of Object.entries({date:'2025-07-01',time:'12:00',latitude:'52.2297',longitude:'21.0122',zone:'Europe/Warsaw'})) form.elements[k].value=v;
 await calc.submit();assert.equal(calc.resultId,'lm_tha_skar');
 assert.match(calc.panel.querySelector('.interpretation').textContent,/Strength/);
 const context=calc.panel.querySelector('.interpretation-context').textContent;
 assert.match(context,/Europe\/Warsaw/); assert.match(context,/Europe\/Warsaw · UTC\+02:00/);
 assert.doesNotMatch(context,/UTCUTC/);
 assert.match(context,/Calculated mansion interval: 2025-07-01/);
 assert.equal(calc.panel.querySelector('.interpretation-review'),null);
 for(const id of reviewIds) {
  calculatedId=id; await calc.submit(); assert.equal(calc.resultId,id);
  const reading=calc.panel.querySelector('.interpretation'); assertReview(reading);
  for(const note of data[id].review_notes) assert.ok(reading.querySelector('.interpretation-references').textContent.includes(note));
  assert.equal(reading.querySelector('[lang=bo]').textContent,data[id].source_tibetan);
  reading.querySelectorAll('[role=tab]')[1].click();
  assert.ok(reading.querySelector('[role=tabpanel]:not([hidden])').textContent.includes(data[id].natal.character));
 }
 assert.equal(requests,0);
} finally {globalThis.fetch=originalFetch;dom.window.close();}
// Exercise the real locale observer, including readings created after Polish
// is active. Test-only natal values cover labels whose source fields are null.
for(const language of ['en','pl']) {
 const localized=new JSDOM('<body></body>',{runScripts:'outside-only',url:'https://worldsystem.test/'});
 const win=localized.window, doc=win.document;
 const settle=async()=>{for(let i=0;i<5;i++) await new Promise(r=>win.setTimeout(r,0));};
 try {
  win.localStorage.setItem('ws-language',language); win.eval(read('locales/pl.js'));
  const readings=[];
  for(const [i,m] of MANSIONS.entries()) {
   readings.push(createInterpretation({doc,id:m.id}));
   readings.push(createInterpretation({doc,id:m.id,moment:{...moment,varaIndex:i%7,place:'Warsaw, Poland',zoneLabel:'Europe/Warsaw · UTC+02:00',mansionFrom:'2025-07-01 10:00 UTC+02:00',mansionUntil:'2025-07-02 11:00 UTC+02:00'}}));
  }
  readings.push(createInterpretation({doc,id:'lm_tha_skar',moment:{...moment,vara:null}}));
  const fixture=structuredClone(data.lm_tha_skar);
  for(const key of ['lifespan','health','wealth','relationships','mode_of_death','spiritual']) fixture.natal[key]='Health';
  readings.push(createInterpretation({doc,id:'lm_tha_skar',entry:fixture}));
  const empty=structuredClone(data.lm_tha_skar); empty.electional.favorable=[];empty.electional.unfavorable=[];
  empty.natal.character=null;empty.natal.lifespan=null;
  readings.push(createInterpretation({doc,id:'lm_tha_skar',entry:empty}));
  const payloads=[], chrome=[], attributes=[];
  for(const reading of readings) {
   // Include disclosed rituals in the initial pass; change them again below.
   reading.querySelector('[type=checkbox]').click();
   for(const el of reading.querySelectorAll('[data-no-localize]')) payloads.push([el,el.textContent,el.lang]);
   const walker=doc.createTreeWalker(reading,win.NodeFilter.SHOW_TEXT);
   for(let n=walker.nextNode();n;n=walker.nextNode()) if(!n.parentElement.closest('[data-no-localize]') && /\p{L}/u.test(n.nodeValue)) chrome.push([n,n.nodeValue]);
   for(const el of reading.querySelectorAll('[title], [aria-label]')) for(const attr of ['title','aria-label']) if(el.hasAttribute(attr)) attributes.push([el,attr,el.getAttribute(attr)]);
   doc.body.append(reading);
  }
  await settle();
  for(const [node,english] of chrome) {
   if(language==='pl') assert.notEqual(node.nodeValue,english,'untranslated interpretation chrome: '+english);
   else assert.equal(node.nodeValue,english,'English chrome is unchanged');
  }
  for(const [el,attr,english] of attributes) assert.equal(el.getAttribute(attr),language==='pl'?win.WorldSystemLocale.translate(english):english);
  for(const [el,text,lang] of payloads) {
   assert.equal(el.textContent,text,'reading payload is unchanged'); assert.equal(el.lang,lang);
   assert.ok(lang==='en' || lang==='bo','payload language is explicit');
  }
  const first=readings[0], expected=(en,pl)=>language==='pl'?pl:en;
  assert.equal(first.querySelector('summary > span').textContent,expected('Interpretation','Interpretacja'));
  assert.deepEqual([...first.querySelectorAll('[role=tab]')].map(el=>el.textContent),language==='pl'?['Działania','Narodziny','Połączenia','Rytuały']:['Activities','Birth','Combinations','Rituals']);
  assert.equal(first.querySelector('.interpretation-expand').textContent,expected('Expand','Rozwiń'));
  first.querySelector('details').open=true; await settle();
  assert.equal(first.querySelector('.interpretation-expand').textContent,expected('Collapse','Zwiń'));
  first.querySelector('details').open=false; await settle();
  assert.equal(first.querySelector('.interpretation-expand').textContent,expected('Expand','Rozwiń'));
  const checkbox=first.querySelector('[type=checkbox]');checkbox.click();await settle();
  assert.match(first.querySelectorAll('[role=tabpanel]')[3].textContent,language==='pl'?/Te rytuały dotyczą/:/These rituals concern/);
  checkbox.click();await settle();
  assert.ok(first.querySelectorAll('[role=tabpanel]')[3].textContent.includes(data.lm_tha_skar.remedies.illness_onset));
  assert.match(first.querySelectorAll('[role=tabpanel]')[3].textContent,language==='pl'?/Historyczny kontekst rytualny/:/Historical ritual context/);
  const before=doc.body.innerHTML;win.WorldSystemLocale.apply();await settle();
  assert.equal(doc.body.innerHTML,before,'a repeated locale pass is stable');
 } finally {win.close();}
}
console.log('PASS: 28 sourced readings, 22 extracted tables, 196 element combinations, source review flags/disclosures, source variants, collapsed tabs, rituals, Tibetan text, calculator linkage, no network.');
