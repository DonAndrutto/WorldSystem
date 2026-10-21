/* Bounded, static realm details: no particle simulation, lights or render targets.
   Each hell uses a few instanced meshes; selection keeps the realm's own ID.
   The Vajra Hell beneath Avīci burns with black fire on a floor of night. */
export function createHellRealm(THREE, {side, hot, depth = 0, vajra = false}) {
  const root = new THREE.Group();
  const floor = new THREE.MeshStandardMaterial({
    color: vajra ? 0x07081a : hot ? 0x210606 : 0x18354f, roughness: hot ? .9 : .32,
    metalness: hot ? .12 : .18, emissive: vajra ? 0x1b2a8a : hot ? 0x9b1800 : 0x14466b,
    emissiveIntensity: vajra ? .18 : hot ? .09 + depth * .012 : .35
  });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(side, hot ? .011 : .008, side), floor);
  root.add(slab);
  const surface = new THREE.ShaderMaterial({
    uniforms: { hot: {value: hot && !vajra ? 1 : 0}, intensity: {value: vajra ? .55 : .65 + depth * .045} },
    vertexShader: 'varying vec2 uvRealm; void main(){ uvRealm=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `varying vec2 uvRealm; uniform float hot; uniform float intensity;
      void main(){
        vec2 p=uvRealm*9.0;
        float seam=abs(sin(p.x*1.8+sin(p.y*2.1)) * sin(p.y*1.7+cos(p.x*1.3)));
        float crack=1.0-smoothstep(.025,.13,seam);
        vec3 dark=mix(vec3(.025,.10,.18),vec3(.065,.003,.001),hot);
        vec3 glow=mix(vec3(.35,.78,1.),vec3(1.,.24,.008),hot);
        vec3 colour=mix(dark,glow,crack);
        colour=mix(colour,vec3(1.,.84,.28),hot*(1.-smoothstep(.0,.028,seam))*.85);
        gl_FragColor=vec4(colour*intensity,1.);
      }`, side: THREE.DoubleSide, toneMapped: false
  });
  const crust = new THREE.Mesh(new THREE.PlaneGeometry(side*.98,side*.98),surface);
  crust.rotation.x=-Math.PI/2; crust.position.y=hot?.0056:.0041; root.add(crust);
  // Four rim walls of flame, or splintered ice teeth, in one draw per material.
  const count=hot?40:32;
  const geometry=new THREE.ConeGeometry(1,1,hot?7:4,hot?8:2);
  if (hot) {
    const vertices=geometry.attributes.position;
    for (let i=0;i<vertices.count;i++) {
      const t=vertices.getY(i)+.5;
      // Curved, tapering tongues with an uneven silhouette, rather than spikes.
      vertices.setX(i,vertices.getX(i)*(1.+Math.sin(t*7.)*.2)+Math.sin(t*5.)*t*.48);
      vertices.setZ(i,vertices.getZ(i)*(.8+.2*Math.cos(t*8.)));
    }
    geometry.computeVertexNormals();geometry.computeBoundingSphere();
  }
  const outer=new THREE.MeshBasicMaterial({color:vajra?0x14081e:hot?0xff3908:0x9ae4ff,
    transparent:true,opacity:vajra?.8:hot?.48:.72,depthWrite:false,toneMapped:false});
  const teeth=new THREE.InstancedMesh(geometry,outer,count);
  const cores=hot?new THREE.InstancedMesh(geometry,new THREE.MeshBasicMaterial({
    color:vajra?0x8a1430:0xffed96,transparent:true,opacity:.9,depthWrite:false,toneMapped:false}),count):null;
  const transform=new THREE.Object3D();
  for(let n=0;n<count;n++) {
    const edge=n%4, along=(Math.floor(n/4)/(count/4-1)-.5)*side*.93;
    const random=(Math.sin(n*127.1+depth*311.7)*43758.5453)%1;
    const height=(hot?.011:.012)+Math.abs(random)*(hot?.012:.011);
    const width=side*(hot?.038:.047);
    transform.position.set(edge<2?along:(edge===2?-1:1)*side*.46,
      (hot?.005:.004)+height/2,edge<2?(edge===0?-1:1)*side*.46:along);
    transform.rotation.set(random*.3,n*1.7,random*.24);
    transform.scale.set(width,height,width*(hot?.7:1)); transform.updateMatrix();
    teeth.setMatrixAt(n,transform.matrix);
    if(cores){transform.scale.multiplyScalar(.55);transform.position.y-=height*.19;transform.updateMatrix();cores.setMatrixAt(n,transform.matrix);}
  }
  root.add(teeth); if(cores)root.add(cores);
  // Small fixed ember / snow field; at most 56 vertices per realm.
  const points=new Float32Array(56*3);
  for(let n=0;n<56;n++) {
    const rand=k=>{const v=Math.sin((n+1)*k+depth*19.1)*43758.5453;return v-Math.floor(v);};
    points[n*3]=(rand(12.989)-.5)*side;
    points[n*3+1]=.009+rand(78.233)*.02;
    points[n*3+2]=(rand(39.425)-.5)*side;
  }
  const dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(points,3)),
    new THREE.PointsMaterial({color:hot?0xff9b25:0xe2f7ff,size:hot?.0014:.001,transparent:true,opacity:.75,depthWrite:false}));
  dust.raycast=()=>{};root.add(dust);
  root.traverse(o=>{o.userData.realmAtmosphere=true;o.castShadow=false;});
  // Preserve the hot/cold colours during selection; the entry provides feedback.
  return root;
}

/* The pretas' ground, 500 yojanas beneath Jambudvīpa: earth cracked into
   plates by a drought that does not end, a few plates scorched with the
   ground burning in their cracks, broken rock and drifts of dust round the
   edge, dust in the air. Bounded and static like the hells: one shader, one
   instanced mesh, a few points; the realm's own model stands on it. */
export function createPretaRealm(THREE, {side}) {
  const root = new THREE.Group();
  const slab = new THREE.Mesh(new THREE.BoxGeometry(side, .009, side),
    new THREE.MeshStandardMaterial({color: 0x5a4634, roughness: .95, metalness: 0}));
  root.add(slab);
  const surface = new THREE.ShaderMaterial({
    uniforms: {intensity: {value: .92}},
    vertexShader: 'varying vec2 uvRealm; void main(){ uvRealm=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `varying vec2 uvRealm; uniform float intensity;
      vec2 hash2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return fract(sin(p)*43758.5453); }
      void main(){
        vec2 p=uvRealm*13.0, i=floor(p), f=fract(p), cell=i;
        float d1=8.0, d2=8.0;
        for(int y=-1;y<=1;y++) for(int x=-1;x<=1;x++){
          vec2 g=vec2(float(x),float(y)); vec2 r=g+hash2(i+g)-f; float d=dot(r,r);
          if(d<d1){ d2=d1; d1=d; cell=i+g; } else if(d<d2) d2=d;
        }
        float crack=1.0-smoothstep(.015,.06,sqrt(d2)-sqrt(d1));
        float shade=hash2(cell).x, hot=step(.93,hash2(cell+7.0).y);
        vec3 colour=mix(vec3(.45,.35,.25),vec3(.6,.51,.38),.25+.55*shade);
        colour=mix(colour,vec3(.16,.12,.09),hot*.65);
        colour=mix(colour,mix(vec3(.09,.065,.05),vec3(.95,.34,.06),hot),crack);
        vec2 c=uvRealm-.5;
        colour*=1.0-.3*smoothstep(.32,.5,max(abs(c.x),abs(c.y)));
        gl_FragColor=vec4(colour*intensity,1.);
      }`, side: THREE.DoubleSide, toneMapped: false
  });
  const crust = new THREE.Mesh(new THREE.PlaneGeometry(side * .98, side * .98), surface);
  crust.rotation.x = -Math.PI / 2; crust.position.y = .0046; root.add(crust);
  // broken rock and drifts of dust round the edge, in one draw
  const count = 36;
  const rock = new THREE.DodecahedronGeometry(1, 0);
  const rocks = new THREE.InstancedMesh(rock, new THREE.MeshStandardMaterial({color: 0x5b4b3d, roughness: .95, flatShading: true}), count);
  const transform = new THREE.Object3D();
  for (let n = 0; n < count; n++) {
    const edge = n % 4, along = (Math.floor(n / 4) / (count / 4 - 1) - .5) * side * .94;
    const random = Math.abs((Math.sin(n * 91.7 + 3.3) * 43758.5453) % 1);
    const size = side * (.012 + random * .018);
    transform.position.set(edge < 2 ? along : (edge === 2 ? -1 : 1) * side * .465, .0045 + size * .3,
      edge < 2 ? (edge === 0 ? -1 : 1) * side * .465 : along);
    transform.rotation.set(random * 2.1, n * 1.3, random * 1.7);
    transform.scale.set(size * (1.2 + random * .6), size * (.45 + random * .4), size);
    transform.updateMatrix();
    rocks.setMatrixAt(n, transform.matrix);
  }
  root.add(rocks);
  // dust hanging in the air over it
  const points = new Float32Array(40 * 3);
  for (let n = 0; n < 40; n++) {
    const rand = k => { const v = Math.sin((n + 1) * k) * 43758.5453; return v - Math.floor(v); };
    points[n * 3] = (rand(12.989) - .5) * side;
    points[n * 3 + 1] = .008 + rand(78.233) * .03;
    points[n * 3 + 2] = (rand(39.425) - .5) * side;
  }
  const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(points, 3)),
    new THREE.PointsMaterial({color: 0xc9b38a, size: .0012, transparent: true, opacity: .6, depthWrite: false}));
  dust.raycast = () => {}; root.add(dust);
  root.traverse(o => { o.userData.realmAtmosphere = true; o.castShadow = false; });
  return root;
}

export function createFormlessVeil(THREE, radius) {
  const veil=new THREE.Mesh(new THREE.SphereGeometry(radius*1.04,32,20),new THREE.ShaderMaterial({
    transparent:true,depthWrite:false,side:THREE.FrontSide,
    uniforms:{tint:{value:new THREE.Color(0xabbada)}},
    vertexShader:`varying vec3 n; varying vec3 eye;
      void main(){vec4 p=modelViewMatrix*vec4(position,1.);n=normalize(normalMatrix*normal);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}`,
    fragmentShader:`varying vec3 n; varying vec3 eye; uniform vec3 tint;
      void main(){float rim=pow(1.-abs(dot(normalize(n),normalize(eye))),2.5);
      gl_FragColor=vec4(tint,.012+rim*.14);}`
  }));
  veil.userData.realmAtmosphere=true;veil.raycast=()=>{};
  return veil;
}
