// The three catastrophes are separate cycles; each stops below its dhyāna boundary.
const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
const smooth = x => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const ENDINGS = {
  fire: { title: 'Seven suns · fire', boundary: 'heaven_parittabha', spared: 'The second dhyāna and the realms above it remain.', duration: 48000 },
  water: { title: 'Destruction by water', boundary: 'heaven_parittashubha', spared: 'The third dhyāna and the realms above it remain.', duration: 32000 },
  wind: { title: 'Destruction by wind', boundary: 'heaven_anabhraka', spared: 'The fourth dhyāna and the realms above it remain.', duration: 32000 },
};
const FIRE_STAGES = [
  ['One sun · the long drought', 'Rain ceases; vegetation withers. Before the world ends, its beings have departed to other realms.'],
  ['Two suns · streams dry', 'A second sun appears. Small rivers and streams evaporate.'],
  ['Three suns · rivers vanish', 'A third sun appears. The great rivers dry away.'],
  ['Four suns · lakes empty', 'A fourth sun appears. The great lakes lose their water.'],
  ['Five suns · the ocean recedes', 'A fifth sun appears. Even the great ocean dwindles until no water remains.'],
  ['Six suns · Meru smolders', 'A sixth sun appears. The earth and Mount Meru smoke and smolder.'],
  ['Seven suns · the world burns', 'A seventh sun appears. Meru, the continents and the lower heavens burn away.'],
];
export function endingState(kind, progress) {
  if (!Object.hasOwn(ENDINGS, kind)) kind = 'fire';
  const p = clamp(progress);
  const suns = kind === 'fire' ? Math.min(7, 1 + Math.floor(p * 9)) : 0;
  const empty = p >= .96;
  let title, copy;
  if (empty) { title = 'Emptiness · the world is gone'; copy = ENDINGS[kind].spared + ' The emptied world system awaits a later period of formation.'; }
  else if (kind === 'fire') [title, copy] = FIRE_STAGES[suns - 1];
  else if (kind === 'water') {
    title = p < .18 ? 'Another cycle · clouds gather' : p < .7 ? 'The deluge rises' : 'The lower worlds dissolve';
    copy = 'After seven fire destructions, a separate world cycle ends in water. The flood dissolves everything below the third dhyāna.';
  } else {
    title = p < .18 ? 'The final cycle · winds gather' : p < .7 ? 'The cosmic winds tear the world apart' : 'The last fragments disperse';
    copy = 'In the sixty-four-cycle pattern, 56 fire destructions and seven water destructions precede one by wind. Everything below the fourth dhyāna disperses.';
  }
  return { kind, progress: p, suns, empty, title, copy, loss: smooth((p - .69) / .27), heat: kind === 'fire' ? smooth((p - .44) / .34) : 0, dry: kind === 'fire' ? smooth((p - .35) / .22) : 0 };
}
export function createWorldEnding(THREE, { scene, world, radius, floor, invalidate, begin, frame, finish, sound = null }) {
  const panel = document.createElement('aside');
  panel.className = 'world-ending card'; panel.hidden = true;
  panel.setAttribute('aria-label', 'World endings presentation');
  panel.innerHTML = `<div class="world-ending-head"><h2>How a world ends</h2><button class="btn" type="button" data-ending="close" aria-label="Close world endings">×</button></div>
    <div class="world-ending-types" role="group" aria-label="Choose a world ending"><button class="btn" type="button" data-ending="fire">Seven suns</button><button class="btn" type="button" data-ending="water">Water</button><button class="btn" type="button" data-ending="wind">Wind</button></div>
    <p class="world-ending-stage" role="status" aria-live="polite"></p><p class="world-ending-copy"></p>
    <div class="world-ending-controls"><button class="btn" type="button" data-ending="play">Play</button><input type="range" min="0" max="1000" value="0" aria-label="World ending timeline"><button class="btn" type="button" data-ending="restart">Restart</button></div>
    <p class="world-ending-source">Separate world cycles · <a href="https://suttacentral.net/an7.66/en/sujato" target="_blank" rel="noopener">Seven Suns, AN 7.66</a> · Abhidharmakośa III.100–102. Illustrative timing and effects.</p>`;
  document.querySelector('.overlay').append(panel);
  const slider = panel.querySelector('input'), play = panel.querySelector('[data-ending="play"]');
  const heading = panel.querySelector('.world-ending-stage'), copy = panel.querySelector('.world-ending-copy');
  let group = null, model = null, objects = [], allocatedMaterials = [], allocatedGeometry = [], textures = [], instances = [];
  let suns = [], flames = null, smoke = null, flood = null, waterSurface = null, waves = [], wind = [], debris = null, boundary = 3;
  let kind = 'fire', progress = 0, playing = false, raf = null, last = 0, visibleBefore = true, active = false;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const material = opts => { const m = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, ...opts }); allocatedMaterials.push(m); return m; };
  const geometry = g => { allocatedGeometry.push(g); return g; };
  const glow = () => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d'), g = x.createRadialGradient(64,64,2,64,64,64);
    g.addColorStop(0,'rgba(255,255,226,1)'); g.addColorStop(.17,'rgba(255,220,100,1)');
    g.addColorStop(.38,'rgba(255,130,28,.65)'); g.addColorStop(1,'rgba(255,90,10,0)');
    x.fillStyle = g; x.fillRect(0,0,128,128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; textures.push(t); return t;
  };
  const atmosphere = (smoky) => {
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, toneMapped: false,
      blending: smoky ? THREE.NormalBlending : THREE.AdditiveBlending,
      uniforms: { time: { value: 0 }, opacity: { value: 1 } },
      vertexShader: `varying vec2 vUv; varying float phase;
        void main() {
          vUv = uv; phase = instanceMatrix[3].x * 7.0 + instanceMatrix[3].z * 11.0;
          vec4 p = modelViewMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
          vec2 size = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
          p.xy += position.xy * size;
          gl_Position = projectionMatrix * p;
        }`,
      fragmentShader: smoky ? `varying vec2 vUv; varying float phase; uniform float time; uniform float opacity;
        void main() {
          vec2 p = (vUv - .5) * 2.0;
          float n = .84 + .12 * sin(p.x * 11.0 + time + phase) * sin(p.y * 9.0 - time * .7);
          float a = smoothstep(1.0, .25, length(p)) * n * opacity;
          gl_FragColor = vec4(vec3(.24, .22, .21), a);
        }` : `varying vec2 vUv; varying float phase; uniform float time; uniform float opacity;
        void main() {
          float y = vUv.y;
          float sway = sin(y * 9.0 - time * 2.0 + phase) * .11 * y;
          float x = abs(vUv.x - .5 + sway);
          float width = (.45 * pow(1.0 - y, .8)) * (.84 + .16 * sin(y * 18.0 - time * 3.0 + phase));
          float a = smoothstep(width, max(0.0, width - .13), x) * smoothstep(0.0, .12, y) * (1.0 - y) * opacity;
          vec3 c = mix(vec3(1.0, .16, .015), vec3(1.0, .88, .28), clamp((width - x) * 4.0, 0.0, 1.0));
          gl_FragColor = vec4(c, a);
        }`,
    });
    allocatedMaterials.push(m); return m;
  };
  const build = () => {
    group = new THREE.Group(); group.name = 'world_ending_presentation';
    model = world.clone(true); model.visible = true; group.add(model);
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(world.getObjectByName(ENDINGS[kind].boundary) || world);
    boundary = bounds.isEmpty() ? 3 : bounds.min.y;
    const box = new THREE.Box3(), c = new THREE.Vector3(), materialCache = new Map();
    model.traverse(o => {
      o.raycast = () => {};
      if (o.isInstancedMesh) instances.push(o);
      if (!o.isMesh && !o.isSprite) return;
      box.setFromObject(o); box.getCenter(c);
      const below = c.y < boundary, water = /sea|ocean/.test(o.name);
      const ms = (Array.isArray(o.material) ? o.material : [o.material]).map(m => {
        const key = m.uuid + ':' + below + ':' + water + (kind === 'water' ? ':' + c.y.toFixed(2) : '');
        if (!materialCache.has(key)) {
          const n = m.clone(); n.transparent = true;
          materialCache.set(key, n); allocatedMaterials.push(n);
        }
        return materialCache.get(key);
      });
      o.castShadow = false; o.receiveShadow = false;
      o.material = Array.isArray(o.material) ? ms : ms[0];
      objects.push({ o, materials: ms, opacities: ms.map(m => m.opacity), colours: ms.map(m => m.color?.clone()), p: o.position.clone(), s: o.scale.clone(), y: c.y, water, sun: /^sun|^moon/.test(o.name), below });
    });
    const map = glow();
    for (let i=0;i<7;i++) {
      const m = new THREE.SpriteMaterial({ map, transparent:true, blending:THREE.AdditiveBlending, depthWrite:false, toneMapped:false }); allocatedMaterials.push(m);
      const s = new THREE.Sprite(m); s.scale.setScalar(radius * .44); s.raycast = () => {}; group.add(s); suns.push(s);
    }
    const count = 96, g = geometry(new THREE.PlaneGeometry(.13,.5));
    flames = new THREE.InstancedMesh(g, atmosphere(false), count);
    flames.instanceMatrix.setUsage(THREE.DynamicDrawUsage); flames.frustumCulled = false; flames.raycast = () => {}; group.add(flames);
    const sg = geometry(new THREE.PlaneGeometry(.4,.4));
    smoke = new THREE.InstancedMesh(sg, atmosphere(true), 36);
    smoke.instanceMatrix.setUsage(THREE.DynamicDrawUsage); smoke.frustumCulled=false; smoke.raycast=()=>{}; group.add(smoke);
    flood = new THREE.Mesh(geometry(new THREE.CylinderGeometry(radius*1.03,radius*1.03,1,96,1,false)),material({color:0x369bd0,opacity:.07,side:THREE.DoubleSide}));
    flood.raycast=()=>{}; group.add(flood);
    const surfaceMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { time: { value: 0 }, opacity: { value: .7 } },
      vertexShader: `varying vec2 vP; uniform float time;
        void main() { vec3 p=position; vP=p.xy;
          p.z += .02*sin(p.x*19.0+time)*cos(p.y*14.0-time*.8);
          gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
      fragmentShader: `varying vec2 vP; uniform float time; uniform float opacity;
        void main() { float w=sin(length(vP)*29.0-time*1.8)*.5+.5;
          float foam=pow(w,12.0)*.35;
          gl_FragColor=vec4(mix(vec3(.08,.39,.56),vec3(.67,.88,.96),foam),opacity); }`,
    });
    allocatedMaterials.push(surfaceMaterial);
    waterSurface = new THREE.Mesh(geometry(new THREE.CircleGeometry(radius*1.08,96)), surfaceMaterial);
    waterSurface.rotation.x=-Math.PI/2; waterSurface.raycast=()=>{}; group.add(waterSurface);
    for(let i=0;i<8;i++) {
      const r = new THREE.Mesh(geometry(new THREE.TorusGeometry(radius*(.3+i*.09),.015,4,96)),material({color:0xb8edff,opacity:.55}));
      r.rotation.x=-Math.PI/2; r.raycast=()=>{}; group.add(r); waves.push(r);
    }
    for(let i=0;i<12;i++) {
      const points=[];
      for(let n=0;n<80;n++) {const a=n/79*Math.PI*3+i*.65, r=radius*(.65+.2*Math.sin(n/79*Math.PI));points.push(new THREE.Vector3(Math.cos(a)*r, floor + n/79*boundary, Math.sin(a)*r));}
      const ribbon = new THREE.Mesh(geometry(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),80,.009,4,false)),material({color:0xd8e8f8,opacity:.25}));
      ribbon.raycast=()=>{}; group.add(ribbon); wind.push(ribbon);
    }
    debris = new THREE.InstancedMesh(geometry(new THREE.OctahedronGeometry(.028)),material({color:0xe7bd5d}),96);
    instances.push(flames, smoke, debris);
    debris.instanceMatrix.setUsage(THREE.DynamicDrawUsage); debris.frustumCulled=false; debris.raycast=()=>{}; group.add(debris);
    world.visible=false; scene.add(group);
  };
  const transform = new THREE.Object3D(), fireTint = new THREE.Color(0xfb5417);
  const render = () => {
    const s = endingState(kind, progress); panel.dataset.ending = kind; panel.dataset.suns = String(s.suns); panel.dataset.empty = String(s.empty);
    if (heading.dataset.source !== s.title) { heading.textContent = s.title; heading.dataset.source = s.title; }
    if (copy.dataset.source !== s.copy) { copy.textContent = s.copy; copy.dataset.source = s.copy; }
    slider.value = String(Math.round(progress*1000));
    for (const x of objects) {
      const {o} = x;
      const waterTop = floor + smooth((progress-.08)/.78)*(boundary-floor);
      const immersion = kind === 'water' ? smooth((waterTop-x.y)/.3)*smooth((progress-.22)/.4) : 0;
      const loss = x.below ? Math.max(s.loss, immersion) : 0;
      o.position.copy(x.p); o.scale.copy(x.s);
      if (x.sun) { o.visible=false; continue; }
      const fade = 1 - (x.water && kind==='fire' ? Math.max(loss,s.dry) : loss);
      x.materials.forEach((m,i) => {
        m.opacity = x.opacities[i]*fade;
        if (m.color && x.colours[i]) { m.color.copy(x.colours[i]); if(kind==='fire' && x.below && !x.water) m.color.lerp(fireTint,s.heat*.6); }
      });
      if (x.below && kind==='wind') {
        const a=progress*14+x.y*5, displacement=smooth((progress-.2)/.75)*radius*.9;
        o.position.x+=Math.sin(a)*displacement; o.position.z+=Math.cos(a)*displacement; o.position.y+=loss*.45;
        o.scale.multiplyScalar(1-loss*.6);
      }
      o.visible = fade > .002 && x.o.userData.endingOriginalVisible !== false;
    }
    suns.forEach((sun,i)=> {
      sun.visible=kind==='fire' && i<s.suns && !s.empty;
      const a=i/7*Math.PI*2 + .2;
      sun.position.set(Math.cos(a)*radius*1.5, .7 + Math.sin(i/6*Math.PI)*.6, Math.sin(a)*radius*1.5);
      sun.material.opacity=1-s.loss;
    });
    const emptyFade = 1-smooth((progress-.9)/.07);
    flames.visible=kind==='fire' && s.heat>.02 && !s.empty;
    smoke.visible=kind==='fire' && s.suns>=6 && !s.empty;
    flames.material.uniforms.opacity.value=s.heat*emptyFade;
    flames.material.uniforms.time.value=progress*70;
    smoke.material.uniforms.opacity.value=.28*s.heat*emptyFade;
    smoke.material.uniforms.time.value=progress*40;
    for(let i=0;i<96;i++) {
      const a=i*2.399963, r=radius*Math.sqrt((i+.5)/96), pulse=.6+.4*Math.sin(i*7+progress*90);
      transform.position.set(Math.cos(a)*r,floor+.14 + s.heat*(.1+pulse*.3),Math.sin(a)*r);
      transform.scale.set(1+pulse*.8,.5+pulse*.5+s.heat*.3,1); transform.rotation.set(.1*Math.sin(a),a,.15*Math.cos(a));transform.updateMatrix();flames.setMatrixAt(i,transform.matrix);
      const d=smooth((progress-.18)/.6);
      transform.position.set(Math.cos(a+progress*18)*radius*(.3+d),floor+.15+(i%13)/13*boundary + d*.7,Math.sin(a+progress*18)*radius*(.3+d));
      transform.scale.setScalar(emptyFade*(.5+(i%7)*.13));transform.updateMatrix();debris.setMatrixAt(i,transform.matrix);
    }
    for(let i=0;i<36;i++) {
      const a=i*2.4, r=radius*Math.sqrt((i+.5)/36), rise=((i/36+progress*3)%1);
      transform.position.set(Math.cos(a)*r,.2+rise*1.2,Math.sin(a)*r);transform.scale.setScalar(.4+rise*1.1);transform.rotation.set(0,a,0);transform.updateMatrix();smoke.setMatrixAt(i,transform.matrix);
    }
    flames.instanceMatrix.needsUpdate=smoke.instanceMatrix.needsUpdate=debris.instanceMatrix.needsUpdate=true;
    flood.visible=kind==='water' && progress>.08 && !s.empty;
    const waterTop = floor + smooth((progress-.08)/.78)*(boundary-floor);
    flood.position.y=(floor+waterTop)/2;flood.scale.y=Math.max(.001,waterTop-floor);flood.material.opacity=.07*emptyFade;
    waterSurface.visible=flood.visible; waterSurface.position.y=waterTop;
    waterSurface.material.uniforms.opacity.value=.65*emptyFade;
    waterSurface.material.uniforms.time.value=progress*40;
    waves.forEach((w,i)=>{w.visible=flood.visible;w.position.y=waterTop+.02*Math.sin(i+progress*70);w.material.opacity=.5*emptyFade;w.scale.setScalar(1+.04*Math.sin(i+progress*40));});
    wind.forEach((w,i)=>{w.visible=kind==='wind' && progress>.05 && !s.empty;w.rotation.y=progress*(10+i*.08);w.material.opacity=(.12+.15*smooth(progress*4))*emptyFade;});
    debris.visible=kind==='wind' && progress>.2 && !s.empty;debris.material.opacity=emptyFade;
    invalidate();
    sound?.update(kind, progress, playing);
  };
  const dispose = () => {
    if(group) scene.remove(group);
    instances.forEach(o=>o.dispose());
    allocatedMaterials.forEach(m=>m.dispose()); allocatedGeometry.forEach(g=>g.dispose()); textures.forEach(t=>t.dispose());
    group=model=null;objects=[];allocatedMaterials=[];allocatedGeometry=[];textures=[];instances=[];suns=[];waves=[];wind=[];
  };
  const pause = () => {playing=false;if(raf!==null)cancelAnimationFrame(raf);raf=null;play.textContent='Play';play.setAttribute('aria-pressed','false');sound?.update(kind,progress,false);};
  const loop = now => {
    if(!playing)return;
    if(!document.hidden)progress=clamp(progress+Math.min(100,now-last)/ENDINGS[kind].duration);
    last=now;render();if(progress>=1)pause();else raf=requestAnimationFrame(loop);
  };
  const start = () => { if(progress>=1)progress=0;playing=true;last=performance.now();play.textContent='Pause';play.setAttribute('aria-pressed','true');raf=requestAnimationFrame(loop); };
  const choose = value => {
    pause();kind=value;progress=0;dispose();build();
    // A clone keeps the world's persistent materials and visibility untouched.
    model.traverse(o=>{if(o.isMesh||o.isSprite)o.userData.endingOriginalVisible=o.visible;});
    panel.querySelectorAll('.world-ending-types button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ending===kind)));
    render();frame({ boundary, kind });if(!reduced())start();
  };
  const close = () => {pause();sound?.stop();dispose();world.visible=visibleBefore;active=false;panel.hidden=true;document.body.classList.remove('world-ending-view');invalidate();finish();};
  panel.addEventListener('click',e=>{
    const action=e.target.closest('[data-ending]')?.dataset.ending;if(!action)return;
    if(action==='close')close();else if(Object.hasOwn(ENDINGS,action))choose(action);else if(action==='play')playing?pause():start();else if(action==='restart'){progress=0;pause();render();if(!reduced())start();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)sound?.update(kind,progress,false);});
  slider.addEventListener('input',()=>{pause();progress=Number(slider.value)/1000;render();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();close();}});
  return {get active(){return active;},reframe(){if(active)frame({boundary,kind});},open(value='fire'){if(active){choose(value);return;}begin();visibleBefore=world.visible;active=true;panel.hidden=false;document.body.classList.add('world-ending-view');choose(Object.hasOwn(ENDINGS,value)?value:'fire');play.focus({preventScroll:true});},close};
}
