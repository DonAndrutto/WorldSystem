import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import {applyArchitecturalMaterials,createColonnade,createPalaceTerrace,createRoofDetail,
  createFacadeDetail,divineRealmLayout} from '../palace-architecture.js';

const M=Object.fromEntries(['pearl','gold','goldDeep','silver','wood','indigo','cinnabar','celadon']
  .map(name=>[name,Object.assign(new THREE.MeshStandardMaterial(),{name})]));
applyArchitecturalMaterials(THREE,M);
assert.equal(M.gold.bumpMap,M.silver.bumpMap,'Metal surfaces share a single cached map');
assert.equal(M.pearl.bumpMap,M.indigo.bumpMap,'Masonry shares a cached map');
assert.notEqual(M.wood.bumpMap,M.pearl.bumpMap,'Timber has its own directional grain');
const column=createColonnade(THREE,{half:.04,height:.025,bays:3,post:M.gold,
  wall:M.pearl,timber:M.wood,shadow:M.indigo});
const terrace=createPalaceTerrace(THREE,{half:.04,height:.005,materials:M});
const facade=createFacadeDetail(THREE,{half:.04,height:.025,materials:M});
const roof=createRoofDetail(THREE,.06,.014,{crest:.14,lift:.24,reach:.08},M.goldDeep,M.wood);
let triangles=0;
for (const object of [column,terrace,facade,roof]) {
  assert.ok(object.children.length<=4,'Repeated construction is batched by material');
  const bins=new Set();
  object.updateMatrixWorld(true);
  for (const mesh of object.children) {
    assert.ok(!bins.has(mesh.material),'One mesh per material'); bins.add(mesh.material);
    const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal;
    assert.equal(g.attributes.uv.count,p.count,'All architectural surfaces can receive textures');
    for (const attribute of Object.values(g.attributes)) assert.ok([...attribute.array].every(Number.isFinite));
    for (const i of g.index.array) assert.ok(i<p.count);
    for (let i=0;i<n.count;i++) assert.ok(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);
    triangles+=g.index.count/3;
  }
}
assert.ok(triangles<11000,'Keep the repeated architecture within a mobile geometry budget');
// The central approach passes between columns to a deeply recessed doorway.
// A ray beside it meets the actual column nearer the outside of the building.
const ray=new THREE.Raycaster(new THREE.Vector3(0,.0125,.065),new THREE.Vector3(0,0,-1));
const doorway=ray.intersectObject(column,true)[0];
ray.set(new THREE.Vector3(.04/3,.0125,.065),new THREE.Vector3(0,0,-1));
const post=ray.intersectObject(column,true)[0];
assert.ok(doorway && post && doorway.distance>post.distance+.008,'Doorways are recessed behind the colonnade');
// Stairs reach beyond the terrace and are continuous down to its floor.
const bounds=new THREE.Box3().setFromObject(terrace);
assert.ok(bounds.max.z>.075 && Math.abs(bounds.min.y)<1e-7,'Stairs meet the terrace floor');
for(let level=1;level<21;level++) assert.ok(divineRealmLayout(level,21).half>divineRealmLayout(level-1,21).half);
assert.ok(divineRealmLayout(0,21).step>.074,'Divine levels have more vertical breathing room');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(html,/BUILDING_UNIT = 0\.074/,'Spacing remains independent from building height');
console.log(`PASS: recessed palace entrances, connected stairs, surface UVs, normals and material batching; ${triangles} triangles.`);
