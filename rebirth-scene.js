import { REBIRTH_WORLD_MAP, FAMILY_COLOURS } from './rebirth-world-map.js';
import { REBIRTH_ICONOGRAPHY, PLAYER_COLOURS } from './rebirth-iconography.js';

export function createRebirthScene(THREE, {world, meshesFor, radius, invalidate=()=>{}, iconography=REBIRTH_ICONOGRAPHY}) {
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
  const tokenGroup=new THREE.Group(); layer.add(tokenGroup);
  const tokenGeometry=new THREE.OctahedronGeometry(.023);
  const tokenColours=PLAYER_COLOURS;
  const tokenMaterials=tokenColours.map(color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.15,roughness:.4,depthTest:false}));
  const tokens=[];
  const haloMaterial=gold.clone();haloMaterial.depthTest=false;
  const halo=new THREE.Mesh(new THREE.TorusGeometry(.049,.003,5,40),haloMaterial);halo.rotation.x=Math.PI/2;halo.renderOrder=20;layer.add(halo);
  const routeMaterial=new THREE.LineBasicMaterial({color:0xb49a64,transparent:true,opacity:.45});
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
    halo.position.copy(points.get(selected));
    for(const line of [...routes.children]) {line.geometry.dispose();routes.remove(line);}
    for(const to of new Set(outcomes.filter(n=>n!==selected))) {
      const a=points.get(selected),b=points.get(to),mid=a.clone().lerp(b,.5);mid.y+=.10;
      const curve=new THREE.QuadraticBezierCurve3(a,mid,b);
      routes.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(28)),routeMaterial));
    }
  }
  const artLayer=new THREE.Group();artLayer.name='rebirth_iconography';layer.add(artLayer);
  const illustrations=new Map();let artRequested=false;
  function loadArt() {
    if(artRequested)return;artRequested=true;
    for(const art of Object.values(iconography)) {
      if(!art.src||!points.has(art.square))continue;
      new THREE.TextureLoader().load(art.src,texture=>{
        texture.colorSpace=THREE.SRGBColorSpace;
        const material=new THREE.SpriteMaterial({map:texture,transparent:true,depthWrite:false});
        const sprite=new THREE.Sprite(material);sprite.center.set(.5,0);sprite.position.copy(points.get(art.square));
        sprite.scale.set(art.width,art.height,1);sprite.userData.rebirthSquare=art.square;sprite.name=`rebirth_art_${art.square}`;
        artLayer.add(sprite);illustrations.set(art.square,sprite);invalidate();
      },undefined,()=>{/* The lotus and text remain available when an image fails. */});
    }
  }
  return {layer,points,additions,illustrations,update,tokenPoint(i){return tokens[i].position;},setActive(on){layer.visible=on;if(on)loadArt();},
    squareFor(object){
      if(object.userData.rebirthSquare)return object.userData.rebirthSquare;
      return REBIRTH_WORLD_MAP.find(m=>m.worldIds.some(id=>meshesFor(id).includes(object)))?.number;
    }};
}
