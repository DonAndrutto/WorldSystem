/* Seated sculpture study from the user's five orthographic-ish references.
 * Coordinates describe the sculpture, not a standing skeleton folded by IK.
 * +z is the face, -x is the figure's right. Geometry is closed and smooth;
 * cloth folds displace the garment itself. No images or external assets load.
 */

// The sculpted meshes are data, and heavy: 1.2 MB for the game's, which only
// the four seated Buddhas of the game use. So they are not part of this
// module. loadSculpture() fetches them, once the page is up; a figure asked
// for before then throws SCULPTURE_PENDING, and its builder tries again when
// they have come. The full-resolution study (`detailed`), three times the
// game's weight, serves the preview page and the GLB export alone: it lives
// in sculpture-*-detail.js and is handed over by whoever imports it.
export const SCULPTURE_PENDING='seated-sculpture: the sculpted meshes have not loaded yet';
let game=null,loading=null;
const study={robes:{},anatomy:{}};
export function loadSculpture() {
  return loading||=Promise.all([import('./sculpture-robe-data.js'),import('./sculpture-anatomy-data.js')])
    .then(([r,a])=>{game={robes:r.ROBES,anatomy:a.ANATOMY};},err=>{loading=null;throw err;});
}
export const sculptureReady=()=>!!game;
export function addSculptureDetail(robes,anatomy) { Object.assign(study.robes,robes);Object.assign(study.anatomy,anatomy); }
const meshData=(kind,key)=>{
  const forGame=key.endsWith('-game'),table=forGame?game?.[kind]:study[kind];
  if(table?.[key])return table[key];
  if(forGame&&!game)throw new Error(SCULPTURE_PENDING);
  throw new Error(`seated-sculpture: no '${key}' mesh`+(forGame?'':'; the detailed study needs addSculptureDetail()'));
};

const TAU = Math.PI * 2;
const clamp = x => Math.max(0, Math.min(1, x));
const mix = (a,b,t) => a+(b-a)*t;
const bell = (x,w) => Math.exp(-0.5*(x/w)**2);
const ease = (a,b,x) => { const t=clamp((x-a)/(b-a)); return t*t*(3-2*t); };

function section(table,y) {
  let i=0; while(i<table.length-2 && y>table[i+1][0]) i++;
  const a=table[Math.max(0,i-1)], b=table[i], c=table[i+1], d=table[Math.min(table.length-1,i+2)];
  const t=clamp((y-b[0])/(c[0]-b[0]));
  return b.slice(1).map((v,k)=>{k++;return .5*(2*v+(-a[k]+c[k])*t+(2*a[k]-5*v+4*c[k]-d[k])*t*t+(-a[k]+3*v-3*c[k]+d[k])*t*t*t);});
}

// Periodic rings, averaged caps and consistent outward winding.
function shell(T,rows,cols,at) {
  const p=[], ix=[];
  for(let i=0;i<=rows;i++)for(let j=0;j<cols;j++)p.push(...at(i/rows,j/cols));
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
    const a=i*cols+j,b=i*cols+(j+1)%cols,c=a+cols,d=b+cols;ix.push(a,b,c,b,d,c);
  }
  for(const row of [0,rows]){
    const center=[0,0,0];for(let j=0;j<cols;j++)for(let k=0;k<3;k++)center[k]+=p[(row*cols+j)*3+k]/cols;
    const n=p.length/3;p.push(...center);
    for(let j=0;j<cols;j++){const a=row*cols+j,b=row*cols+(j+1)%cols;if(row===0)ix.push(n,b,a);else ix.push(n,a,b);}
  }
  // Signed volume also handles mirrored surfaces and descending ring order.
  let volume=0;for(let i=0;i<ix.length;i+=3){const a=ix[i]*3,b=ix[i+1]*3,c=ix[i+2]*3;volume+=p[a]*(p[b+1]*p[c+2]-p[b+2]*p[c+1])+p[a+1]*(p[b+2]*p[c]-p[b]*p[c+2])+p[a+2]*(p[b]*p[c+1]-p[b+1]*p[c]);}
  if(volume<0)for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return g;
}

function tube(b,key,points,radius,steps=20,radial=10,flatten=1) {
  const T=b.THREE,curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');
  const frames=curve.computeFrenetFrames(steps,false);
  b.put(shell(T,steps,radial,(v,u)=>{
    const i=Math.round(v*steps),p=curve.getPointAt(v),n=frames.normals[i],bn=frames.binormals[i];
    const r=typeof radius==='function'?radius(v):radius,a=u*TAU;
    return p.addScaledVector(n,Math.cos(a)*r).addScaledVector(bn,Math.sin(a)*r*flatten).toArray();
  }),key);
}

const HEAD=[
  [.730,.006,.013,.041],[.741,.039,.033,.041],[.763,.065,.047,.039],
  [.790,.075,.055,.037],[.820,.082,.061,.031],[.850,.086,.066,.027],
  [.880,.085,.070,.022],[.915,.083,.071,.018],[.944,.071,.064,.014],
  [.967,.046,.046,.012],[.980,.002,.003,.012]
];

function facePoint(y,a) {
  const [w,d,cz]=section(HEAD,y),x=Math.sin(a)*w,front=Math.max(0,Math.cos(a));
  let z=Math.cos(a)*d+cz;
  const fw=front**6,ax=Math.abs(x);
  // Cheek, eye socket, nose bridge, alae, philtrum, mouth and chin are in
  // one surface. Tiny inset curves below accent the carved eyelid edges.
  const noseProfile=.022*bell(y-.837,.025)+.015*bell(y-.816,.009);
  const lipLine=.782+.0015*bell(Math.abs(x)-.009,.006)-.0015*bell(x,.004);
  z+=fw*(.007*bell(ax-.047,.019)*bell(y-.811,.023)
    -.005*bell(ax-.038,.019)*bell(y-.850,.012)
    +.008*bell(ax-.035,.023)*bell(y-.873,.008)
    +noseProfile*bell(x,.012)
    +.008*bell(ax-.014,.006)*bell(y-.808,.006)
    -.003*bell(ax-.011,.003)*bell(y-.805,.0025)
    -.002*bell(x,.004)*bell(y-.796,.005)
    +.002*bell(x,.027)*bell(y-.782,.012)
    -.0018*bell(x,.024)*bell(y-lipLine,.0014)
    +.009*bell(x,.029)*bell(y-.753,.012));
  return [x,y,z];
}

function faceAt(x,y) { const [w]=section(HEAD,y);return facePoint(y,Math.asin(Math.max(-.999,Math.min(.999,x/w)))); }

function head(b,skin,hair,detailed) {
  const T=b.THREE;
  b.put(shell(T,detailed?88:48,detailed?96:64,(v,u)=>facePoint(mix(.730,.980,v),u*TAU)),skin);
  for(const sign of [-1,1]){
    const path=(fn,n=18)=>Array.from({length:n},(_,i)=>fn(i/(n-1)));
    // Full, lowered eyelid, with a second shallow crease above it.
    // A lowered eyelid with an offset upper crease, not a closed outline.
    tube(b,skin,path(t=>{
      const x=sign*mix(.016,.064,t), y=.846-.006*Math.sin(Math.PI*t)+.004*t;
      const p=faceAt(x,y);p[2]+=.0015;return p;
    }),t=>.0017*Math.sin(Math.PI*t)+.00020,24,7);
    const lidPositions=[],lidIndices=[],lidRows=detailed?10:6,lidCols=detailed?24:16;
    for(let row=0;row<=lidRows;row++)for(let col=0;col<=lidCols;col++){
      const u=col/lidCols,v=row/lidRows,x=sign*mix(.016,.064,u);
      const lower=.846-.006*Math.sin(Math.PI*u)+.004*u,upper=.853+.006*Math.sin(Math.PI*u)+.001*u;
      const p=faceAt(x,mix(lower,upper,v));p[2]+=.0035*Math.sin(Math.PI*v)*Math.sin(Math.PI*u);lidPositions.push(...p);
    }
    for(let row=0;row<lidRows;row++)for(let col=0;col<lidCols;col++){
      const a=row*(lidCols+1)+col,b=a+1,c=a+lidCols+1,d=c+1;
      lidIndices.push(...(sign>0?[a,b,c,b,d,c]:[a,c,b,b,c,d]));
    }
    const lid=new T.BufferGeometry();lid.setAttribute('position',new T.Float32BufferAttribute(lidPositions,3));lid.setIndex(lidIndices);lid.computeVertexNormals();b.put(lid,skin);
    tube(b,skin,path(t=>{const x=sign*mix(.012,.067,t),y=.868+.009*Math.sin(Math.PI*t*.93)-.002*t;const p=faceAt(x,y);p[2]+=.0005;return p;}),t=>.0004+.0013*Math.sin(Math.PI*t),20,6);
    // Ears have an outer helix, concha and a continuous elongated lobe.
    b.put(shell(T,22,16,(v,u)=>{
      const y=mix(.751,.880,v),a=u*TAU,s=Math.sin(Math.PI*v),w=.011*s**.4*(1+.4*bell(v-.75,.2));
      return [sign*(.083+w*Math.cos(a)+.008*s),y,.009+.016*Math.sin(a)*s**.5-.012*Math.max(0,Math.sin(a))**4*bell(v-.70,.18)];
    }),skin);
    tube(b,skin,path(t=>{const a=mix(-Math.PI*.65,Math.PI*.85,t);return [sign*(.092+.008*Math.sin(a)),.842+.027*Math.cos(a),.018+.004*Math.sin(a)];}),.0028,20,7);
    tube(b,skin,[[sign*.087,.862,.017],[sign*.090,.847,.021],[sign*.088,.829,.018]],.002,10,6);
  }
  for(const upper of [true,false])b.put(shell(T,28,12,(v,u)=>{
    const x=mix(-.027,.027,v),a=u*TAU,weight=Math.sin(Math.PI*v)**.7;
    const centerY=upper?.785+.002*bell(Math.abs(x)-.009,.006):.778+.005*(x/.027)**2;
    const p=faceAt(x,centerY);return [x,centerY+Math.sin(a)*(upper?.0023:.0031)*weight,p[2]+Math.cos(a)*.0033*weight];
  }),skin);
  // The cap follows the skull down to the nape. The crown is rounded, not
  // a stack of concentric discs. Curls are small spirals laid on the cap.
  const cap=(v,a)=>{
    const edge=.902-.095*((1-Math.cos(a))/2)**.8,y=mix(edge,.979,v),[w,d,z]=section(HEAD,y);
    return [Math.sin(a)*(w+.002),y,Math.cos(a)*(d+.002)+z];
  };
  b.put(shell(T,14,40,(v,u)=>cap(v,u*TAU)),hair);
  const curl=(p,n,r)=>{
    const N=new T.Vector3(...n).normalize(),X=new T.Vector3(0,1,0).cross(N).normalize();if(X.lengthSq()<.01)X.set(1,0,0);
    const Y=new T.Vector3().crossVectors(N,X);
    // Rounded curl bed makes a continuous carved surface under the spiral.
    b.put(shell(T,detailed?5:2,detailed?8:5,(v,u)=>{
      const a=u*TAU,h=v*Math.PI/2,rr=r*Math.cos(h);
      return new T.Vector3(...p).addScaledVector(X,Math.cos(a)*rr).addScaledVector(Y,Math.sin(a)*rr).addScaledVector(N,.0032*Math.sin(h)).toArray();
    }),hair);
    const pts=Array.from({length:12},(_,i)=>{const t=i/11,a=t*TAU*1.25,rr=r*(1-.82*t);return new T.Vector3(...p).addScaledVector(X,Math.cos(a)*rr).addScaledVector(Y,Math.sin(a)*rr).addScaledVector(N,.0025+Math.sin(Math.PI*t)*.002).toArray();});
    tube(b,hair,pts,.0013,detailed?10:4,detailed?5:3);
  };
  const rows=detailed?11:9;
  for(let row=0;row<rows;row++){
    const y=mix(.814,.971,(row+.2)/rows),[w,d,cz]=section(HEAD,y),n=Math.max(12,Math.round(TAU*w/(detailed?.0148:.016)));
    const lo=section(HEAD,y-.001),hi=section(HEAD,y+.001),dw=(hi[0]-lo[0])/.002,dd=(hi[1]-lo[1])/.002;
    for(let j=0;j<n;j++){
      const a=(j+(row%2)*.5)/n*TAU,edge=.902-.095*((1-Math.cos(a))/2)**.8;
      if(y<edge+.003)continue;
      curl([Math.sin(a)*(w+.002),y,Math.cos(a)*(d+.002)+cz],[Math.sin(a),-(dw*Math.sin(a)**2+dd*Math.cos(a)**2),Math.cos(a)],.0068);
    }
  }
  b.put(shell(T,10,24,(v,u)=>{const a=u*TAU,y=.961+v*.054,r=.037*Math.sin(Math.PI*(.18+.82*v))**.48;return [r*Math.sin(a),y,.013+r*Math.cos(a)];}),hair);
  for(let row=0;row<4;row++)for(let j=0;j<16-row*3;j++){
    const v=.24+row*.19,a=(j+row*.5)/(16-row*3)*TAU,r=.037*Math.sin(Math.PI*(.18+.82*v))**.48;
    curl([r*Math.sin(a),.961+v*.054,.013+r*Math.cos(a)],[Math.sin(a),.4+row*.5,Math.cos(a)],.0058);
  }
}

function garment(b,key,mudra,detailed) {
  const pose=(['teach','earth'].includes(mudra)?mudra:'lap')+(detailed?'':'-game');
  const geometry=b.kit.once('sculpture-robe:'+pose,()=>{
    const data=meshData('robes',pose),unpack=(s,Type)=>{const bytes=Uint8Array.from(atob(s),c=>c.charCodeAt(0));return new Type(bytes.buffer);};
    const raw=unpack(data.p,Int16Array),positions=new Float32Array(raw.length);
    for(let i=0;i<raw.length;i++)positions[i]=raw[i]/32767;
    const g=new b.THREE.BufferGeometry();g.setAttribute('position',new b.THREE.BufferAttribute(positions,3));
    g.setIndex(new b.THREE.BufferAttribute(unpack(data.i,Uint16Array),1));
    const rawNormals=unpack(data.n,Int16Array),normals=new Float32Array(rawNormals.length);for(let i=0;i<normals.length;i++)normals[i]=rawNormals[i]/32767;
    g.setAttribute('normal',new b.THREE.BufferAttribute(normals,3));return g;
  });
  b.put(geometry,key);

}

// Continuous anatomy meshes include the wrist, palm, thumb pad and fingers.
// Reflection happens in the builder, which also reverses triangle winding.
function anatomyGeometry(b,name,detailed) {
  const key=name+(detailed?'':'-game');
  return b.kit.once('sculpture-anatomy:'+key,()=>{
    const unpack=(s,Type)=>new Type(Uint8Array.from(atob(s),c=>c.charCodeAt(0)).buffer);
    const data=meshData('anatomy',key),g=new b.THREE.BufferGeometry();
    for(const [field,attribute] of [['p','position'],['n','normal']]){
      const raw=unpack(data[field],Int16Array),values=Float32Array.from(raw,v=>v/32767);
      g.setAttribute(attribute,new b.THREE.BufferAttribute(values,3));
    }
    g.setIndex(new b.THREE.BufferAttribute(unpack(data.i,Uint16Array),1));return g;
  });
}
function nailGeometry(b) {
 return b.kit.once('sculpture-nail',()=>shell(b.THREE,10,12,(v,u)=>{
   const s=Math.sqrt(Math.max(0,1-(2*v-1)**2)),a=u*TAU;
   return [s*Math.cos(a),v-.5,s*(.5*Math.sin(a)-1.4*Math.cos(a)**2)-.4*(2*v-1)**2];
 }));
}
function hand(b,skin,wrist,up,palm,side,gesture,detailed) {
  b.orient(anatomyGeometry(b,gesture,detailed),skin,wrist,up,palm,[-side,1,1]);
  if(!detailed)return;
  const T=b.THREE,d=new T.Vector3(...up).normalize(),x=new T.Vector3().crossVectors(d,new T.Vector3(...palm)).normalize(),n=new T.Vector3().crossVectors(x,d);x.multiplyScalar(-side);
  const transform=p=>x.clone().multiplyScalar(p[0]).addScaledVector(d,p[1]).addScaledVector(n,p[2]);
  for(const nail of meshData('anatomy',gesture).nails)b.orient(nailGeometry(b),skin,transform(nail.center).add(new T.Vector3(...wrist)).toArray(),transform(nail.tangent).toArray(),transform(nail.normal).toArray(),[nail.width,nail.length,.0008]);
}

// A folded cloth lip surrounds an actual recessed sleeve opening. Its small
// unevenness follows gathered fabric, while the approved wrist stays exposed.
function cuffGeometry(b,detailed) {
  return b.kit.once('sculpture-cuff:'+detailed,()=>{
    const g=new b.THREE.TorusGeometry(.0245,.0034,detailed?10:6,detailed?64:28);
    g.rotateX(Math.PI/2);
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),a=Math.atan2(z,x),ripple=1+.045*Math.cos(3*a+.4);
      p.setXYZ(i,x*ripple,p.getY(i)*1.2+.0015*Math.cos(2*a),z*ripple);
    }
    g.computeVertexNormals();return g;
  });
}

function arms(b,skin,robe,mudra,detailed) {
  const lap=mudra==='lap',earth=mudra==='earth';
  for(const side of [-1,1]){
    const low=lap||(earth&&side===1),touch=earth&&side===-1;
    const wrist=low?[side*.085,side<0?.256:.241,.242]:touch?[-.30,.15,.306]:[side*.075,side<0?.467:.425,.245];
    const dir=low?[-side,0,.05]:touch?[0,-1,-.18]:side<0?[.12,1,-.1]:[-.45,.88,.05];
    const palm=low?[0,1,0]:touch?[0,0,-1]:side<0?[0,0,1]:[.05,0,-1];
    hand(b,skin,wrist,dir,palm,side,low?(side<0?'lap-top':'lap'):touch?'earth':'teach',detailed);
    const length=Math.hypot(...dir),hem=wrist.map((v,i)=>v-.022*dir[i]/length);
    b.orient(cuffGeometry(b,detailed),robe,hem,dir,palm,[1,1,1]);
  }
}

function foldedLegs(b,robe,detailed) {
  for(const side of [1,-1]) {
    const front=side===-1;
    // The knee is broad; the shin rises and narrows towards the opposite ankle.
    const profile=[
      [0,.006,.008,.090,.085],[.10,.067,.102,.104,.099],
      [.27,.103,.149,.116,.117],[.46,.099,.142,.125,.140],
      [.65,.079,.115,.145,.170],[.84,.054,.073,.174,.194],
      [1,.039,.049,.188,.206]
    ];
    b.put(shell(b.THREE,detailed?72:32,detailed?96:40,(v,u)=>{
      const [ry,rz,cy,cz]=section(profile,v),a=u*TAU;
      const x=side*mix(.405,-.072,v);
      // Folds curve round the knee then gather tightly at the ankle. They
      // deform the actual cloth surface, with broad crests and narrow valleys.
      const theta=a+.40*v, envelope=Math.sin(Math.PI*v)**1.4;
      let fold=0;
      for(let j=0;j<6;j++){
        const line=-1.38+j*.43+.95*v+.35*Math.sin(Math.PI*v);
        const delta=Math.atan2(Math.sin(theta-line),Math.cos(theta-line));
        fold+=.007*bell(delta,detailed?.14:.18)-.0025*bell(delta-.20,.085);
      }
      fold=fold*envelope+.004*bell(v-.94,.025);
      return [x, Math.max(.008,cy+(ry+fold)*Math.sin(a)+(front?.007:-.012+.07*ease(.65,1,v))),cz+(rz+fold)*Math.cos(a)+(front?.026:-.027)];
    }),robe);
  }
  // Small pooled hem between the knees, under the crossing.
  b.put(shell(b.THREE,24,32,(v,u)=>{
    const a=u*TAU,w=.085*Math.sin(Math.PI*v)**.55;
    return [w*Math.cos(a),.010+.012*Math.sin(a)+.010*Math.cos(v*TAU*3)*Math.sin(Math.PI*v),mix(.08,.265,v)];
  }),robe);
}

function feet(b,skin,detailed) {
  const foot=anatomyGeometry(b,'foot',detailed);
  for(const side of [-1,1]){
    const front=side===1;
    const origin=[side*.055,front?.224:.254,front?.240:.187],roll=Math.PI*(front?.88:.93);
    const transform=p=>[side*p[0],Math.cos(roll)*p[1]-Math.sin(roll)*p[2],Math.sin(roll)*p[1]+Math.cos(roll)*p[2]];
    b.put(foot,skin,origin,[roll,0,0],[side,1,1]);
    if(detailed)for(const nail of meshData('anatomy','foot').nails){
      b.orient(nailGeometry(b),skin,transform(nail.center).map((v,i)=>v+origin[i]),transform(nail.tangent),transform(nail.normal),[nail.width,nail.length,.0008]);
    }
  }
}

export function seatedSculpture(b,{skin='gold',robe='maroon',mudra='lap',hair='hair',detailed=false}={}) {
  // Match the existing recipes' seat origin and head height.
  b.at([0,0,0],[0,0,0],.565,()=>{
    garment(b,robe,mudra,detailed);
    foldedLegs(b,robe,detailed);
    tube(b,skin,[[0,.690,.015],[0,.721,.025],[0,.757,.033]],t=>.048-.005*t,14,24);
    b.at([0,-.012,0],0,1,()=>head(b,skin,hair,detailed));
    arms(b,skin,robe,mudra,detailed);
    feet(b,skin,detailed);
  });
}

/** Elliptical double lotus: rounded relief petals, a solid seat and bead rim. */
export function sculptureLotus(b,{y=0,r=.27,key='pink',rim='gold',disc='white',detailed=false}={}) {
  const T=b.THREE,scale=r/.27;
  b.at([0,y,0],[0,0,0],scale,()=>{
    const profile=[[0,0],[.98,0],[1,.004],[1,.010],[.96,.015],[.90,.018],[.90,.068],[.95,.073],[.95,.079],[.90,.083],[0,.083]];
    b.put(b.kit.lathe('sculpture-lotus-base',profile,64),key,[0,0,0],0,[.27,1,.19]);
    const petal=b.kit.once('sculpture-lotus-petal-v2:'+detailed,()=>shell(T,detailed?10:8,detailed?8:6,(v,u)=>{
      const a=u*TAU,s=Math.sin(Math.PI*v)**.55;
      const width=.017*s*(.75+.25*v), relief=.005*s;
      // Central ridge and two soft side lobes, carved into each petal.
      const ridge=.0025*bell(Math.cos(a),.28)*Math.max(0,Math.sin(a));
      return [width*Math.cos(a),v*.035,.007*s+(relief+ridge)*Math.sin(a)];
    }));
    for(let row=0;row<2;row++)for(let j=0;j<44;j++){
      const a=(j+row*.5)/44*TAU;
      b.at([.242*Math.sin(a),row?.042:.046,.170*Math.cos(a)],[0,a,0],1,()=>{
        b.put(petal,key,[0,0,0],0,row?[1,1,1]:[1,-1,1.5]);
      });
    }
    b.put(b.kit.lathe('sculpture-moon',[[0,0],[.96,0],[1,.003],[1,.009],[.97,.012],[0,.012]],64),disc,[0,.079,0],0,[.248,1,.174]);
    for(let j=0;j<80;j++){
      const a=j/80*TAU;b.ell(rim,[.247*Math.sin(a),.080,.174*Math.cos(a)],.0027);
    }
  });
  return y+.091*scale;
}
