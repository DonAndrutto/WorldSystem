/* Shared construction for the summit, guardian halls and divine palaces.
   Static parts are merged by material. Openings have real depth, and timber,
   masonry and gilt details meet the structure that supports them. */
function batch(THREE) {
  const bins = new Map(), pen = new THREE.Object3D();
  const p = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3();
  const box = new THREE.BoxGeometry(1, 1, 1);
  function bake(geometry, material, matrix) {
    if (!bins.has(material)) bins.set(material, {p:[], n:[], uv:[], index:[]});
    const out = bins.get(material), offset = out.p.length / 3;
    const position = geometry.attributes.position, normal = geometry.attributes.normal;
    const uv = geometry.attributes.uv;
    nm.getNormalMatrix(matrix);
    for (let i = 0; i < position.count; i++) {
      p.fromBufferAttribute(position, i).applyMatrix4(matrix);
      n.fromBufferAttribute(normal, i).applyNormalMatrix(nm);
      out.p.push(p.x, p.y, p.z); out.n.push(n.x, n.y, n.z);
      out.uv.push(uv ? uv.getX(i) : position.getX(i), uv ? uv.getY(i) : position.getY(i));
    }
    for (let i = 0; i < (geometry.index?.count ?? position.count); i++) {
      out.index.push(offset + (geometry.index ? geometry.index.getX(i) : i));
    }
  }
  function put(geometry, material, x, y, z, sx, sy, sz, angle = 0) {
    pen.position.set(x, y, z); pen.scale.set(sx, sy, sz);
    pen.rotation.set(0, angle, 0); pen.updateMatrix();
    bake(geometry, material, pen.matrix);
  }
  function side(material, angle, x, y, z, sx, sy, sz, geometry = box) {
    put(geometry, material, x*Math.cos(angle)+z*Math.sin(angle), y,
      -x*Math.sin(angle)+z*Math.cos(angle), sx, sy, sz, angle);
  }
  function beam(material, a, b, width, depth = width) {
    const from = new THREE.Vector3(...a), to = new THREE.Vector3(...b);
    pen.position.copy(from).add(to).multiplyScalar(0.5);
    pen.scale.set(width, from.distanceTo(to), depth);
    pen.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), to.sub(from).normalize());
    pen.updateMatrix(); bake(box, material, pen.matrix);
  }
  function finish() {
    const root = new THREE.Group();
    for (const [material, out] of bins) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(out.p, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(out.n, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(out.uv, 2));
      g.setIndex(out.index); g.computeBoundingSphere();
      root.add(new THREE.Mesh(g, material));
    }
    box.dispose();
    return root;
  }
  return {put, side, beam, finish};
}

/* Small, deterministic surface maps. No image downloads or animated shaders. */
export function applyArchitecturalMaterials(THREE, M) {
  const size = 128;
  function surface(kind, seed) {
    const bump = new Uint8Array(size*size*4), rough = new Uint8Array(size*size*4);
    let state = seed;
    for (let j=0;j<size;j++) for (let i=0;i<size;i++) {
      state = (Math.imul(state,1664525)+1013904223) >>> 0;
      const grain = state / 4294967296;
      const wave = Math.sin(i/size*Math.PI*12 + Math.sin(j/size*Math.PI*4)*0.6);
      const height = kind === 'wood' ? 128 + wave*26 + grain*12
        : kind === 'metal' ? 128 + Math.sin(i/size*Math.PI*16)*Math.cos(j/size*Math.PI*14)*13 + grain*8
        : 112 + grain*32 + Math.sin(i/size*Math.PI*8)*5;
      const at = (j*size+i)*4;
      for (let c=0;c<3;c++) {bump[at+c]=height; rough[at+c]=214+grain*36;}
      bump[at+3]=rough[at+3]=255;
    }
    const texture = data => {
      const t = new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
      t.wrapS=t.wrapT=THREE.RepeatWrapping;
      t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearMipmapLinearFilter;
      t.generateMipmaps=true; t.needsUpdate=true;
      return t;
    };
    return {bumpMap:texture(bump),roughnessMap:texture(rough)};
  }
  const stone=surface('stone',714), metal=surface('metal',921), wood=surface('wood',183);
  for (const key of ['pearl','indigo','cinnabar','celadon']) {
    Object.assign(M[key],stone,{bumpScale:0.00016});
  }
  for (const key of ['gold','goldDeep','silver']) Object.assign(M[key],metal,{bumpScale:0.00006});
  Object.assign(M.wood,wood,{bumpScale:0.00012});
  M.pearl.roughness=0.76;
  M.gold.roughness=0.36;
  M.goldDeep.roughness=0.48;
}

export function createColonnade(THREE, {half:w,height:H,bays,post,wall,timber,shadow}) {
  const b=batch(THREE), t=w*0.085, floor=H*0.12, top=H*0.86;
  // Slight entasis and individually supported capitals replace square sticks.
  const column = new THREE.LatheGeometry([
    [0.55,0], [0.55,0.04], [0.44,0.08], [0.38,0.15], [0.40,0.40],
    [0.34,0.87], [0.43,0.93], [0.53,0.97], [0.53,1]
  ].map(([x,y])=>new THREE.Vector2(x,y)), 10);
  b.side(wall,0,0,floor/2,0,w*2.10,floor,w*2.10);
  // Recessed sanctum walls surround four genuine doorways.
  const inner=w*0.67, door=w*0.33, thick=w*0.12, roomH=top-floor;
  for (let s=0;s<4;s++) {
    const a=s*Math.PI/2;
    for (const sign of [-1,1]) {
      b.side(wall,a,sign*(inner+door)/2,floor+roomH/2,inner,inner-door,roomH,thick);
      b.side(post,a,sign*door,floor+roomH*0.35,inner+thick*0.60,t*0.58,roomH*0.70,thick*0.46);
    }
    b.side(wall,a,0,floor+roomH*0.86,inner,door*2,roomH*0.28,thick);
    b.side(timber,a,0,floor+roomH*0.72,inner+thick*0.5,door*2.2,H*0.055,thick*0.8);
    // Sill, deeply inset door leaf, and its vertical panel divisions.
    b.side(shadow,a,0,floor+roomH*0.33,inner-thick*0.6,door*1.80,roomH*0.66,t*0.28);
    for (const x of [-0.52,0,0.52]) b.side(timber,a,x*door,floor+roomH*0.33,
      inner-thick*0.42,t*0.18,roomH*0.60,t*0.2);
    b.side(post,a,0,floor+H*0.018,inner+thick*0.8,door*2.15,H*0.036,thick*1.3);
    for (let i=0;i<bays;i++) {
      const x=(i/bays*2-1)*w;
      b.side(wall,a,x,floor+H*0.025,w,t*1.80,H*0.05,t*1.80);
      b.side(post,a,x,floor+H*0.05,w,t,top-floor-H*0.05,t,column);
      b.side(post,a,x,top-H*0.02,w,t*1.9,H*0.055,t*1.9);
      // Corbel blocks and a bracket support the beam above each capital.
      b.side(timber,a,x,top+H*0.012,w,t*2.8,H*0.04,t*1.7);
      b.side(post,a,x,top+H*0.036,w,t*3.5,H*0.035,t*2.0);
    }
    b.side(timber,a,0,H*0.925,w,w*2.14,H*0.12,t*1.55);
    b.side(post,a,0,H*0.995,w,w*2.18,H*0.03,t*1.75);
    // Outer railings leave the central approach to the doors clear.
    for (const sign of [-1,1]) {
      b.side(post,a,sign*w*0.71,floor+H*0.27,w,w*0.50,H*0.035,t*0.48);
      for (let i=0;i<4;i++) b.side(wall,a,sign*w*(0.48+i*0.145),floor+H*0.14,w,
        t*0.30,H*0.26,t*0.30);
    }
  }
  column.dispose();
  return b.finish();
}

/* Relief follows the roof's actual sampled surface, including corner lift. */
export function createRoofDetail(THREE, half, rise, o, trim, timber) {
  const b=batch(THREE), across=o.across??9, up=o.up??5;
  const crest=o.crest??0.30, lift=o.lift??0.34, reach=o.reach??0.14, hollow=o.hollow??1.6;
  function point(s,c,u,offset=0) {
    const horn=Math.abs(c)**4*(1-u), w=(half+(half*crest-half)*u)*(1+reach*horn);
    const x=c*w,z=w,a=s*Math.PI/2;
    return [x*Math.cos(a)+z*Math.sin(a),rise*u**hollow+rise*lift*horn+offset,
      -x*Math.sin(a)+z*Math.cos(a)];
  }
  for (let s=0;s<4;s++) for (let c=0;c<=across;c++) {
    const at=c/across*2-1;
    for (let u=0;u<up;u++) b.beam(trim,point(s,at,u/up,rise*0.018),
      point(s,at,(u+1)/up,rise*0.018),half*0.010,half*0.008);
    if (c<across) {
      b.beam(trim,point(s,at,0,rise*0.012),point(s,(c+1)/across*2-1,0,rise*0.012),half*0.026);
      b.beam(timber,point(s,at,0,-rise*0.11),point(s,(c+1)/across*2-1,0,-rise*0.11),half*0.032);
    }
  }
  return b.finish();
}

export function createPalaceTerrace(THREE,{half:w,height:H,materials:M}) {
  const b=batch(THREE);
  // Broad foot, smaller ashlar course, and a projecting stone coping.
  for (const [size,bottom,high,material] of [
    [1.65,0,0.32,M.indigo],[1.53,0.32,0.43,M.pearl],[1.58,0.75,0.25,M.pearl]
  ]) b.side(material,0,0,H*(bottom+high/2),0,w*size*2,H*high,w*size*2);
  for (let s=0;s<4;s++) {
    const a=s*Math.PI/2;
    for (let i=0;i<4;i++) {
      const stepH=H*(i+1)/4;
      b.side(M.pearl,a,0,stepH/2,w*(1.95-i*0.105),w*0.76,stepH,w*0.115);
      b.side(M.goldDeep,a,0,stepH+H*0.012,w*(2.00-i*0.105),w*0.76,H*0.024,w*0.026);
    }
    // Mortar courses, recessed panels and a narrow gilt band articulate the plinth.
    b.side(M.goldDeep,a,0,H*0.77,w*1.539,w*3.04,H*0.055,w*0.018);
    for (const sign of [-1,1]) for (let i=0;i<3;i++) {
      b.side(M.indigo,a,sign*w*(0.61+i*0.35),H*0.54,w*1.538,w*0.28,H*0.20,w*0.020);
    }
  }
  return b.finish();
}

export function createFacadeDetail(THREE,{half:w,height:H,materials:M}) {
  const b=batch(THREE);
  for (let s=0;s<4;s++) {
    const a=s*Math.PI/2;
    b.side(M.pearl,a,0,H*0.08,w*1.025,w*2.10,H*0.12,w*0.10);
    b.side(M.gold,a,0,H*0.94,w*1.025,w*2.10,H*0.06,w*0.10);
    for (const x of [-0.57,0,0.57]) {
      // Dark aperture behind an extruded frame and stone reveal.
      b.side(M.indigo,a,x*w,H*0.52,w*1.006,w*0.35,H*0.54,w*0.025);
      for (const sign of [-1,1]) {
        b.side(M.pearl,a,x*w+sign*w*0.18,H*0.52,w*1.045,w*0.05,H*0.60,w*0.09);
        b.side(M.gold,a,x*w,H*(0.52+sign*0.285),w*1.06,w*0.43,H*0.035,w*0.12);
      }
      b.side(M.wood,a,x*w,H*0.52,w*1.065,w*0.023,H*0.53,w*0.04);
      b.side(M.wood,a,x*w,H*0.52,w*1.065,w*0.34,H*0.026,w*0.04);
    }
  }
  return b.finish();
}

/* Width is an explicit property of a level; increasing spacing does not
   inadvertently stretch the buildings' vertical proportions. */
export function divineRealmLayout(level,total) {
  return {half:0.108+level/(total-1)*0.148,step:0.084,gap:0.046,plate:0.005};
}
