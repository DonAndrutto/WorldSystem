// Deterministic glTF 2.0 binary export; no textures, plug-ins or network.
import * as THREE from 'three';
import {mkdirSync,writeFileSync} from 'node:fs';
import {buildRecipe,createModelMaterials,createModelKit} from '../square-models.js';
import {seatedSculpture,sculptureLotus} from '../seated-sculpture.js';
const output=new URL('../docs/sculpture-review/',import.meta.url);mkdirSync(output,{recursive:true});
const kit=createModelKit(THREE),materials=createModelMaterials(THREE);
for(const pose of ['teach','lap','earth']){
  const group=buildRecipe(THREE,b=>{const y=sculptureLotus(b,{detailed:true,key:'white',rim:'white',disc:'white'});b.at([0,y,0],[0,0,0],1,()=>seatedSculpture(b,{detailed:true,mudra:pose,skin:'white',robe:'white',hair:'white'}));},materials,kit);
  const gltf={asset:{version:'2.0',generator:'WorldSystem reference sculpture'},scene:0,scenes:[{nodes:[0]}],nodes:[{name:'Buddha — '+pose,mesh:0}],meshes:[{primitives:[]}],materials:[{name:'Neutral stone',pbrMetallicRoughness:{baseColorFactor:[.78,.79,.77,1],metallicFactor:0,roughnessFactor:.8}}],buffers:[],bufferViews:[],accessors:[]};
  let length=0;const chunks=[];
  function accessor(array,type,target,bounds){
    const pad=(4-length%4)%4;if(pad){chunks.push(Buffer.alloc(pad));length+=pad;}
    const bytes=Buffer.from(array.buffer,array.byteOffset,array.byteLength),view=gltf.bufferViews.length;
    gltf.bufferViews.push({buffer:0,byteOffset:length,byteLength:bytes.length,target});chunks.push(bytes);length+=bytes.length;
    const n=gltf.accessors.length;gltf.accessors.push({bufferView:view,componentType:array instanceof Float32Array?5126:array instanceof Uint16Array?5123:5125,count:array.length/(type==='VEC3'?3:1),type,...bounds});return n;
  }
  for(const mesh of group.children){
    const g=mesh.geometry;g.computeBoundingBox();
    const position=accessor(g.attributes.position.array,'VEC3',34962,{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()});
    const normal=accessor(g.attributes.normal.array,'VEC3',34962);
    const index=accessor(g.index.array,'SCALAR',34963);
    gltf.meshes[0].primitives.push({attributes:{POSITION:position,NORMAL:normal},indices:index,material:0});
  }
  gltf.buffers=[{byteLength:length}];const bin=Buffer.concat(chunks),json=Buffer.from(JSON.stringify(gltf));
  const jsonPadded=Buffer.alloc(Math.ceil(json.length/4)*4,0x20);json.copy(jsonPadded);
  const binPadded=Buffer.alloc(Math.ceil(bin.length/4)*4);bin.copy(binPadded);
  const header=Buffer.alloc(12);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(12+8+jsonPadded.length+8+binPadded.length,8);
  const j=Buffer.alloc(8);j.writeUInt32LE(jsonPadded.length);j.writeUInt32LE(0x4e4f534a,4);
  const b=Buffer.alloc(8);b.writeUInt32LE(binPadded.length);b.writeUInt32LE(0x004e4942,4);
  const file=new URL('buddha-'+pose+'.glb',output);writeFileSync(file,Buffer.concat([header,j,jsonPadded,b,binPadded]));
  console.log(file.pathname,header.readUInt32LE(8)+' bytes');
}
