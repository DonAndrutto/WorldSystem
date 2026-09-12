import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRebirthScene} from '../rebirth-scene.js';
const world=new THREE.Group(),counterpart=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial());world.add(counterpart);
const requests=[];const Three={...THREE,TextureLoader:class {load(src,loaded,progress,failed){requests.push({src,loaded,failed});}}};
let renders=0;
const scene=createRebirthScene(Three,{world,meshesFor:()=>[counterpart],radius:1,invalidate:()=>renders++,iconography:{
  76:{square:76,src:'assets/rebirth/076.webp',alt:'Test artwork',width:.15,height:.20},
  17:{square:17,src:'assets/rebirth/017.webp',alt:'Existing-world artwork',width:.12,height:.16}
}});
assert.equal(requests.length,0,'No iconography downloads in Explorer');
scene.setActive(true);assert.equal(requests.length,2);
requests.find(r=>r.src.endsWith('076.webp')).loaded(new THREE.Texture());assert.equal(scene.illustrations.size,1);assert.equal(renders,1);
const sprite=scene.illustrations.get(76);assert.equal(sprite.userData.rebirthSquare,76);assert.equal(sprite.parent.parent,scene.layer);
assert.deepEqual(sprite.scale.toArray(),[.15,.20,1]);
requests.find(r=>r.src.endsWith('017.webp')).failed();assert.equal(scene.points.has(17),true);assert.equal(scene.additions.get(76).visible,true,'Art does not remove the fallback geometry');
scene.setActive(false);assert.equal(sprite.parent.parent.visible,false,'Artwork disappears outside Rebirth');
scene.setActive(true);assert.equal(requests.length,2,'Art is loaded only once');
console.log('PASS: future iconography loads lazily, inherits game-only visibility, uses configured proportions, retains fallback geometry, and never changes destinations.');
