import { REBIRTH_WORLD_MAP, FAMILY_COLOURS } from './rebirth-world-map.js';
import { REBIRTH_ICONOGRAPHY, REBIRTH_END_ART, PLAYER_COLOURS } from './rebirth-iconography.js?v=art-20260913';

export function createRebirthScene(THREE, {world, meshesFor, radius, invalidate=()=>{}, iconography=REBIRTH_ICONOGRAPHY, endArt=iconography===REBIRTH_ICONOGRAPHY?REBIRTH_END_ART:null, createCanvas=()=>globalThis.document?.createElement('canvas')}) {
  const layer = new THREE.Group(); layer.name = 'rebirth_destinations'; layer.visible = false;
  world.add(layer);
  const points = new Map(), additions = new Map();
  const gold = new THREE.MeshStandardMaterial({color:0xb89a58, metalness:.48, roughness:.5});
  const plinth = new THREE.CylinderGeometry(.027,.037,.011,8);
  const jewel = new THREE.OctahedronGeometry(.020);
  const petal = new THREE.SphereGeometry(.012,6,4);
  const materials = new Map(Object.entries(FAMILY_COLOURS).map(([k,color])=>[k,new THREE.MeshStandardMaterial({color,metalness:.22,roughness:.62})]));
  const families = [...new Set(REBIRTH_WORLD_MAP.map(m=>m.family))];
  world.updateMatrixWorld(true);
  REBIRTH_WORLD_MAP.forEach(m=>{
    const box = new THREE.Box3();
    m.worldIds.forEach(id=>meshesFor(id).forEach(mesh=>box.expandByObject(mesh)));
    let p;
    if(m.kind!=='game-only') {
      if(box.isEmpty()) throw new Error(`Missing world counterpart for Rebirth ${m.number}`);
      p=box.getCenter(new THREE.Vector3()); p.y=box.max.y+.035;
    } else {
      const group=REBIRTH_WORLD_MAP.filter(x=>x.kind==='game-only'&&x.family===m.family);
      const i=group.indexOf(m), fi=families.indexOf(m.family);
      const angle=i*Math.PI*2/group.length + fi*.61;
      const height=m.number<=16 ? -.12 : m.number<=26 ? .12 : .25+(m.number-26)*.021;
      const r=radius*(m.number<26?.78:m.number>=97?.35:.67) + (i%2)*.06;
      p=new THREE.Vector3(Math.cos(angle)*r,height,Math.sin(angle)*r);
      const g=new THREE.Group(); g.position.copy(p); g.name=`rebirth_${m.number}`;
      const base=new THREE.Mesh(plinth,gold); g.add(base);
      const gem=new THREE.Mesh(jewel,materials.get(m.family)); gem.position.y=.030;g.add(gem);
      const petals=new THREE.InstancedMesh(petal,gold,8), placement=new THREE.Object3D();
      for(let j=0;j<8;j++) {
        const a=j*Math.PI/4;
        placement.position.set(Math.cos(a)*.026,.004,Math.sin(a)*.026); placement.scale.set(1,.35,1);placement.updateMatrix();
        petals.setMatrixAt(j,placement.matrix);
      }
      g.add(petals);
      if(m.number>=97) {
        const roof=new THREE.Mesh(new THREE.ConeGeometry(.031,.025,4),gold);
        roof.position.y=.071; roof.rotation.y=Math.PI/4;g.add(roof);
      }
      g.traverse(o=>{o.userData.rebirthSquare=m.number;});
      layer.add(g); additions.set(m.number,g);p=p.clone().add(new THREE.Vector3(0,.07,0));
    }
    points.set(m.number,p);
  });
  // Nirvana is not another palace in the cosmological stack. Its open, luminous
  // circle stands beyond the highest mapped realm and outside the ordinary path.
  const beyondHeight=Math.max(...[...points].filter(([n])=>n!==104).map(([,p])=>p.y))+.42;
  layer.remove(additions.get(104));
  const nirvana=new THREE.Group();nirvana.name='rebirth_nirvana_beyond';nirvana.position.set(0,beyondHeight,0);
  const light=new THREE.MeshBasicMaterial({color:0xfff4cf,transparent:true,opacity:.85,depthWrite:false});
  const veil=new THREE.MeshBasicMaterial({color:0xffedb9,transparent:true,opacity:.12,depthWrite:false});
  nirvana.add(new THREE.Mesh(new THREE.SphereGeometry(.105,24,16),veil));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.15,.004,8,64),light);nirvana.add(ring);
  const horizon=new THREE.Mesh(new THREE.TorusGeometry(.20,.002,6,64),light);horizon.rotation.x=Math.PI/2;nirvana.add(horizon);
  nirvana.add(new THREE.Mesh(new THREE.SphereGeometry(.016,12,8),light));
  nirvana.traverse(o=>{o.userData.rebirthSquare=104;});layer.add(nirvana);additions.set(104,nirvana);points.set(104,nirvana.position.clone());
  const tokenGroup=new THREE.Group(); layer.add(tokenGroup);
  const tokenGeometry=new THREE.OctahedronGeometry(.023);
  const tokenColours=PLAYER_COLOURS;
  const tokenMaterials=tokenColours.map(color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.15,roughness:.4,depthTest:false}));
  const tokens=[];
  const haloMaterial=gold.clone();haloMaterial.depthTest=false;
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.049,.003,5,40),haloMaterial);halo.rotation.x=Math.PI/2;halo.renderOrder=20;layer.add(halo);
  const routeMaterial=new THREE.LineBasicMaterial({color:0xb49a64,transparent:true,opacity:.7,depthTest:false,depthWrite:false});
  const routes=new THREE.Group();layer.add(routes);
  function update(state,selected,outcomes=[]) {
    while(tokens.length<(state?.players.length||0)) {
      const token=new THREE.Mesh(tokenGeometry,tokenMaterials[tokens.length%tokenMaterials.length]);
      token.renderOrder=21;
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.029,.003,5,24),haloMaterial);ring.rotation.x=Math.PI/2;ring.position.y=-.025;ring.renderOrder=20;token.add(ring);
      tokens.push(token);tokenGroup.add(token);
    }
    tokens.forEach((t,i)=>{
      t.visible=!!state?.players[i];if(!t.visible)return;
      const player=state.players[i],others=state.players.filter(p=>p.square===player.square),index=others.indexOf(player);
      t.position.copy(points.get(player.square));
      t.position.x+=(index-(others.length-1)/2)*.048;t.position.y+=.044;
      t.scale.setScalar(i===state.active?1.75:1.3);t.traverse(o=>{o.userData.rebirthSquare=player.square;});
    });
    selectedSquare=selected;won=state?.phase==='won';
    illustrations.forEach((sprite,number)=>styleIllustration(sprite,number));
    endLayer.visible=won;if(won&&layer.visible)loadEndArt();
    halo.position.copy(points.get(selected));
    for(const line of [...routes.children]) {line.geometry.dispose();routes.remove(line);}
    for(const to of new Set(outcomes.filter(n=>n!==selected))) {
      const a=points.get(selected),b=points.get(to),mid=a.clone().lerp(b,.5);mid.y+=.10;
      const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)),routeMaterial);
      line.renderOrder=19;routes.add(line);
    }
  }
  const artLayer=new THREE.Group();artLayer.name='rebirth_iconography';layer.add(artLayer);
  const endLayer=new THREE.Group();endLayer.name='rebirth_end_art';endLayer.visible=false;layer.add(endLayer);
  // End-art metadata may describe source pixels; convert to a bounded scene size.
  const endWidth=endArt?.width>0?endArt.width:.42,endHeight=endArt?.height>0?endArt.height:.30;
  const endFit=Math.min(1,.42/endWidth,.30/endHeight);
  const endSceneArt=endArt?{...endArt,width:endWidth*endFit,height:endHeight*endFit}:null;
  const illustrations=new Map(),textureRequests=new Map(),alphaMaps=new WeakMap();
  const textureSource=art=>art?.textureSrc||art?.thumbSrc||art?.src;
  const loader=new THREE.TextureLoader();
  let artRequested=false,endRequested=false,endIllustration=null,selectedSquare=null,won=false;
  // One request per source, including when several cards share an image.
  // Failed loads keep their ordinary geometry and do not retry on mode switches.
  function textureFor(src,ready) {
    const cached=textureRequests.get(src);
    if(cached) {if(cached.texture)ready(cached.texture);else if(!cached.failed)cached.listeners.push(ready);return;}
    const request={listeners:[ready],texture:null,failed:false};textureRequests.set(src,request);
    loader.load(src,texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;request.texture=texture;
      request.listeners.splice(0).forEach(callback=>callback(texture));
    },undefined,()=>{request.failed=true;request.listeners.length=0;});
  }
  function dimensions(art,texture) {
    const width=Number.isFinite(art.width)&&art.width>0?art.width:.15;
    const height=Number.isFinite(art.height)&&art.height>0?art.height:.20;
    const image=texture?.image,iw=image?.naturalWidth||image?.width,ih=image?.naturalHeight||image?.height;
    if(iw>0&&ih>0) {const fit=Math.min(width/iw,height/ih);return [iw*fit,ih*fit];}
    return [width,height];
  }
  function makeIllustration(art,texture) {
    // Diagram overlays stay readable through terrain; tokens and routes render above them.
    const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthTest:false,depthWrite:false,toneMapped:false});
    const sprite=new THREE.Sprite(material);sprite.center.set(.5,0);
    const [width,height]=dimensions(art,texture);sprite.userData.artSize=[width,height];
    sprite.userData.artAlt=art.alt||'';sprite.userData.artCredit=art.credit||'';
    sprite.scale.set(width,height,1);return sprite;
  }
  function artAnchor(number) {
    const anchor=points.get(number).clone();anchor.y+=number===104?.21:.085;return anchor;
  }
  function styleIllustration(sprite,number) {
    const focused=number===selectedSquare,[width,height]=sprite.userData.artSize;
    const scale=focused?1.6:1;sprite.scale.set(width*scale,height*scale,1);
    sprite.renderOrder=focused?5:3;
  }
  function loadArt() {
    if(artRequested)return;artRequested=true;
    for(const art of Object.values(iconography)) {
      const src=textureSource(art);if(!src||!points.has(art.square))continue;
      textureFor(src,texture=>{
        const sprite=makeIllustration(art,texture);sprite.position.copy(artAnchor(art.square));
        sprite.userData.rebirthSquare=art.square;sprite.name=`rebirth_art_${art.square}`;
        styleIllustration(sprite,art.square);artLayer.add(sprite);illustrations.set(art.square,sprite);invalidate();
      });
    }
  }
  function loadEndArt() {
    const src=textureSource(endArt);if(endRequested||!src)return;endRequested=true;
    textureFor(src,texture=>{
      const sprite=makeIllustration(endSceneArt,texture);sprite.name='rebirth_amitabha_stupa_guru';
      // An end-of-game tableau above Nirvana, never a numbered place or a move target.
      sprite.position.copy(points.get(104));sprite.position.y+=.62;
      sprite.renderOrder=6;endLayer.add(sprite);endIllustration=sprite;invalidate();
    });
  }
  function includeArtBounds(box,position,width,height) {
    // Sprites face the camera. A sphere around their centre safely bounds their
    // corners in the elevated focus view while allowing room to orbit.
    const center=position.clone().add(new THREE.Vector3(0,height/2,0));
    const extent=new THREE.Vector3().setScalar(Math.hypot(width,height)/2);
    box.expandByPoint(center.clone().sub(extent));box.expandByPoint(center.clone().add(extent));
  }
  function focusBounds(number) {
    const point=points.get(number),box=new THREE.Box3().setFromCenterAndSize(point,new THREE.Vector3(.12,.16,.12));
    if(number===104)box.setFromCenterAndSize(point,new THREE.Vector3(.4,.3,.4));
    const art=iconography[number],sprite=illustrations.get(number);
    if(textureSource(art)) {
      const [width,height]=sprite?[sprite.scale.x,sprite.scale.y]:dimensions(art).map(n=>n*(number===selectedSquare?1.6:1));
      includeArtBounds(box,artAnchor(number),width,height);
    }
    if(number===104&&won&&textureSource(endArt)) {
      const position=point.clone();position.y+=.62;
      const [width,height]=endIllustration?[endIllustration.scale.x,endIllustration.scale.y]:dimensions(endSceneArt);
      includeArtBounds(box,position,width,height);
    }
    return box;
  }
  function getBounds() {
    const box=new THREE.Box3();points.forEach((point,number)=>box.union(focusBounds(number)));return box;
  }
  function squareFor(object) {
    if(object.userData.rebirthSquare)return object.userData.rebirthSquare;
    return REBIRTH_WORLD_MAP.find(m=>m.worldIds.some(id=>meshesFor(id).includes(object)))?.number;
  }
  function opaqueArtHit(hit) {
    const texture=hit.object.material?.map,image=texture?.image;
    if(!hit.object.isSprite||!hit.object.userData.artSize||!image||!hit.uv)return true;
    if(!alphaMaps.has(image)) {
      let map=null;
      try {
        const width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
        const canvas=createCanvas();
        if(canvas&&width>0&&height>0) {
          canvas.width=width;canvas.height=height;
          const context=canvas.getContext('2d',{willReadFrequently:true});
          context.drawImage(image,0,0,width,height);
          const rgba=context.getImageData(0,0,width,height).data,alpha=new Uint8Array(width*height);
          for(let i=0;i<alpha.length;i++)alpha[i]=rgba[i*4+3];
          map={width,height,alpha};
        }
      } catch {/* Unreadable image pixels retain rectangular picking as a fallback. */}
      alphaMaps.set(image,map);
    }
    const map=alphaMaps.get(image);if(!map)return true;
    const uv=texture.transformUv(hit.uv.clone());
    const x=Math.max(0,Math.min(map.width-1,Math.floor(uv.x*map.width)));
    const y=Math.max(0,Math.min(map.height-1,Math.floor(uv.y*map.height)));
    return map.alpha[y*map.width+x]>0;
  }
  function pickSquare(hits) {
    if(!layer.visible)return undefined;
    const candidates=[];
    for(const hit of hits) {
      let visible=true;for(let object=hit.object;object;object=object.parent)if(!object.visible){visible=false;break;}
      if(!visible||hit.object.material?.visible===false||hit.object.material?.opacity===0)continue;
      const number=squareFor(hit.object);if(!points.has(number)||!opaqueArtHit(hit))continue;
      const overlay=hit.object.material?.depthTest===false;
      candidates.push({number,overlay,order:hit.object.renderOrder||0,distance:hit.distance??Infinity});
    }
    // Match the visible overlay stack before considering ordinary depth-sorted meshes.
    candidates.sort((a,b)=>Number(b.overlay)-Number(a.overlay)||(a.overlay?b.order-a.order:0)||a.distance-b.distance);
    return candidates[0]?.number;
  }
  return {layer,points,additions,illustrations,update,focusBounds,getBounds,pickSquare,squareFor,
    get endIllustration(){return endIllustration;},
    tokenPoint(i){return tokens[i].position;},
    setActive(on){layer.visible=on;if(on){loadArt();if(won)loadEndArt();}}};
}
