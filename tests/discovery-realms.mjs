import assert from 'node:assert/strict';
import * as THREE from 'three';
import {JSDOM} from 'jsdom';
import {MANSIONS} from '../lunar-mansions.js';
import {mansionSearchText} from '../mansion-search.js';
import {searchText} from '../search-text.js';
import {createMansionUI} from '../mansion-ui.js';
import {PLAYER_SKINS,skinAtlas,paintPlayer} from '../game-players.js';
import {createHellRealm,createFormlessVeil} from '../realm-atmospheres.js';
const dom=new JSDOM('<section></section>'),doc=dom.window.document;
const ui=createMansionUI({doc,panel:doc.querySelector('section')});
const input=doc.querySelector('#mansion-search');
for(const m of MANSIONS){
 for(const term of [m.sanskrit,m.tibetan,m.wylie]){
  assert.ok(mansionSearchText(m).includes(searchText(term)));
  input.value=searchText(term);input.dispatchEvent(new dom.window.Event('input'));
  assert.equal(doc.querySelector(`[data-id="${m.id}"]`).hidden,false);
 }
}
input.value='ashwini';input.dispatchEvent(new dom.window.Event('input'));
assert.equal(doc.querySelectorAll('.lm-item:not([hidden])').length,1);
input.value='nothing-matches';input.dispatchEvent(new dom.window.Event('input'));
assert.equal(doc.querySelector('.lm-search-empty').hidden,false);
ui.select(MANSIONS[27].id);ui.setOpen(true);
assert.equal(input.value,'','opening selection clears a filter hiding it');
for(let n=0;n<PLAYER_SKINS.length;n++) {
 const a=skinAtlas(n);assert.ok(a.cell<a.columns*a.rows);
 const el=doc.createElement('span');paintPlayer(el,{skin:PLAYER_SKINS[n].id,i:0});
 assert.ok(el.style.getPropertyValue('--skin-image').includes(a.url));
}
for(const hot of [true,false]) {
 const realm=createHellRealm(THREE,{side:.1,hot,depth:7});let instances=0,points=0;
 realm.traverse(o=>{if(o.isInstancedMesh)instances+=o.count;if(o.isPoints)points+=o.geometry.attributes.position.count;});
 assert.ok(instances<=80);assert.equal(points,56);
 const bounds=new THREE.Box3().setFromObject(realm);assert.ok(bounds.max.y<.04,'flames/ice fit between realm floors');
}
const veil=createFormlessVeil(THREE,.08);assert.ok(veil.material.transparent);assert.equal(veil.material.depthWrite,false);
console.log('PASS all 28 Sanskrit/Tibetan searches, common spelling, filter reset, 14 atlas cells, bounded realm details.');
