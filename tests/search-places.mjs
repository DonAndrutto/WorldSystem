import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {searchText} from '../search-text.js';
import {PLACES} from '../places-data.js';
for(const [a,b] of [['Łódź','lodz'],['Kraków','krakow'],['Śravaṇa','sravana'],['Mṛgaśīrṣa','mrgas irsa'.replaceAll(' ','')],['São Paulo','sao paulo'],['Āśleṣā','aslesa']]) assert.equal(searchText(a),searchText(b));
assert.equal(searchText('རྒྱུ་སྐར་'),'རྒྱུ་སྐར་');
assert.notEqual(searchText('ཀི'),searchText('ཀ'));
assert.equal(searchText('S\u0301ravan\u0323a'),searchText('Śravaṇa'));
const read=f=>fs.readFileSync(new URL('../'+f,import.meta.url),'utf8');
assert.equal(read('places-data.js'),createRequire(import.meta.url)('../scripts/build-places.cjs').build());
assert.equal(PLACES.length,367);
for(const p of PLACES) { assert.ok(Number.isFinite(p.latitude)&&Number.isFinite(p.longitude)); new Intl.DateTimeFormat('en',{timeZone:p.zone}); }
assert.equal(PLACES.find(p=>p.name.startsWith('El Paso,')).zone,'America/Denver');
assert.equal(PLACES.find(p=>p.name.startsWith('Phoenix,')).zone,'America/Phoenix');
assert.match(read('index.html'),/const q = searchText\(search.value\)/);
console.log('PASS: accent-insensitive Latin matching, Tibetan preserved, all 367 source cities and zones, deterministic generation.');

const belgium = PLACES.filter(p=>p.name.endsWith(', Belgium'));
assert.equal(belgium.length,32);
assert.ok(belgium.every(p=>p.zone === 'Europe/Brussels'));
for (const query of ['gent','brugge','liege','louvain','waterloo','hasselt']) assert.ok(belgium.some(p=>searchText(p.name).includes(query)));
