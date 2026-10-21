// Offline sculpting pass: smooth unions join robe, shoulders, sleeves and
// folded legs. The browser only decodes the resulting indexed mesh.
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import {MeshBasicMaterial} from 'three';
import {writeFileSync} from 'node:fs';
const clamp=x=>Math.max(0,Math.min(1,x));
const gauss=(x,w)=>Math.exp(-.5*(x/w)**2);
const smoothMin=(a,b,k=.028)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
function ellipsoid(x,y,z,c,r){const a=(x-c[0])/r[0],b=(y-c[1])/r[1],d=(z-c[2])/r[2];return (Math.hypot(a,b,d)-1)*Math.min(...r);}
function capsule(x,y,z,a,b,r0,r1){const vx=b[0]-a[0],vy=b[1]-a[1],vz=b[2]-a[2],t=clamp(((x-a[0])*vx+(y-a[1])*vy+(z-a[2])*vz)/(vx*vx+vy*vy+vz*vz));return Math.hypot(x-a[0]-vx*t,y-a[1]-vy*t,z-a[2]-vz*t)-(r0+(r1-r0)*t);}
const robes={};
for(const mudra of ['teach','lap','earth'])for(const detailed of [true,false]){
  const parts=[
    [[0,.39,-.018],[.175,.245,.135]],[[0,.60,-.008],[.193,.105,.115]],
    [[0,.655,-.014],[.191,.065,.094]],[[0,.701,.004],[.090,.037,.068]],

  ];
  const sleeves=[];
  for(const side of [-1,1]){
    const low=mudra==='lap'||(mudra==='earth'&&side===1),touch=mudra==='earth'&&side===-1;
    // Match the approved hand anchors exactly, including stacked lap heights.
    const wrist=low?[side*.085,side<0?.256:.241,.242]:touch?[-.30,.15,.306]:[side*.075,side<0?.467:.425,.245];
    const direction=low?[-side,0,.05]:touch?[0,-1,-.18]:side<0?[.12,1,-.1]:[-.45,.88,.05];
    const length=Math.hypot(...direction),axis=direction.map(v=>v/length),cuff=wrist.map((v,i)=>v-.042*axis[i]);
    const elbow=[side*.249,.389,.072],shoulder=[side*.174,.630,-.004];
    const upper=[side*.226,.518,.019];
    const forearm=elbow.map((v,i)=>v*.45+cuff[i]*.55+(i===2?.012:0));
    const delta=cuff.map((v,i)=>v-elbow[i]),span=Math.hypot(...delta),along=delta.map(v=>v/span);
    const across=[-along[1],along[0],0],acrossLength=Math.hypot(...across);
    across.forEach((v,i)=>across[i]=v/acrossLength);
    const normal=[along[1]*across[2]-along[2]*across[1],along[2]*across[0]-along[0]*across[2],along[0]*across[1]-along[1]*across[0]];
    sleeves.push({side,low,touch,wrist,axis,cuff,elbow,shoulder,upper,forearm,span,along,across,normal});
  }
  const res=detailed?116:72,mc=new MarchingCubes(res,new MeshBasicMaterial(),false,false,160000);mc.isolation=0;
  for(let iz=0;iz<res;iz++)for(let iy=0;iy<res;iy++)for(let ix=0;ix<res;ix++){
    const x=(ix/res-.5)*1.0,y=(iy/res-.5)*1.0+.38,z=(iz/res-.5)*1.0+.06;
    const skirtT=clamp((y-.006)/.34),skirtW=.238-.052*skirtT,skirtD=.152-.022*skirtT;
    let d=Math.max((Math.hypot(x/skirtW,(z+.025)/skirtD)-1)*skirtD,.006-y,y-.35);
    for(const [c,r] of parts)d=smoothMin(d,ellipsoid(x,y,z,c,r));
    for(const arm of sleeves){
      const {side,low,touch,cuff,elbow,shoulder,upper,forearm,span,along,across,normal,axis,wrist}=arm;
      if(side*x<.015||y>.72||y<.08)continue;
      let sleeve=capsule(x,y,z,shoulder,upper,.066,.055);
      sleeve=smoothMin(sleeve,capsule(x,y,z,upper,elbow,.055,.052),.026);
      sleeve=smoothMin(sleeve,capsule(x,y,z,elbow,forearm,.052,.045),.025);
      sleeve=smoothMin(sleeve,capsule(x,y,z,forearm,cuff,.045,.026),.022);
      sleeve=smoothMin(sleeve,ellipsoid(x,y,z,[side*.158,.493,.012],[.070,.135,.089]),.023);
      // Hanging cloth is narrower than the elbow. A long front/rear drape
      // hangs under the raised forearm instead of a spherical sleeve mass.
      if(!touch){
        const drop=low?.274:.292;
        let hanging=ellipsoid(x,y,z-.40*(y-drop),[side*.201,drop,.115],[.076,low?.092:.129,.045]);
        const lengthMask=clamp((y-.17)/.045)*clamp((.43-y)/.06);
        const frontBack=clamp((Math.abs(z-.40*(y-drop)-.115)-.009)/.020);
        for(let j=0;j<4;j++){
          const crease=.143+j*.036+.048*(y-.25)+.014*Math.sin((y-.17)*11+j*.6);
          hanging-=(.008*gauss(side*x-crease,.011)-.003*gauss(side*x-crease-.016,.007))*lengthMask*frontBack;
        }
        sleeve=smoothMin(sleeve,hanging,.020);
      }
      const rel=[x-elbow[0],y-elbow[1],z-elbow[2]];
      const axial=rel.reduce((s,v,i)=>s+v*along[i],0),t=clamp(axial/span);
      const lateral=rel.reduce((s,v,i)=>s+v*across[i],0),depth=rel.reduce((s,v,i)=>s+v*normal[i],0);
      const angle=Math.atan2(depth,lateral);
      const forearmMask=clamp(axial/.028)*clamp((span-axial+.012)/.025);
      // Unequal compression folds sweep round the bent elbow and flatten
      // toward the inner arm, rather than repeating horizontal rings.
      let relief=0;
      for(let j=0;j<4;j++){
        const crease=span*(.15+j*.205)+.015*Math.cos(angle+.6+j*.28);
        relief+=(.004*gauss(axial-crease,.012+j*.001)-.002*gauss(axial-crease-.017,.007))*forearmMask;
      }
      relief+=.003*Math.cos(3*angle+.8*t)*Math.sin(Math.PI*t)*forearmMask;
      const upperMask=clamp((y-.38)/.05)*clamp((.64-y)/.045);
      const outer=clamp((side*x-.16)/.065),frontSleeve=clamp((z+.015)/.085);
      // Long tension folds over the deltoid, gathered diagonal creases at
      // the elbow, and a shallow inner-elbow hollow describe the bend.
      for(let j=0;j<3;j++){
        const line=.202+j*.031+.23*(.58-y)+.016*Math.sin((y-.38)*13+j*.4);
        relief+=(.0075*gauss(side*x-line,.011)-.0025*gauss(side*x-line-.017,.007))*upperMask*frontSleeve;
      }
      for(let j=0;j<4;j++){
        const line=.420+j*.035+.48*(side*x-.24)+.35*(z-.045);
        relief+=(.006*gauss(y-line,.011)-.0025*gauss(y-line-.016,.007))*outer*clamp((.59-y)/.07);
      }
      relief+=.005*gauss(y-(.407+.32*(side*x-.24)),.012)*outer;
      sleeve-=relief;
      // Open the sleeve end around the wrist. The rolled cloth lip is
      // built separately at full resolution; the hand mesh is untouched.
      const w=[x-wrist[0],y-wrist[1],z-wrist[2]],h=w.reduce((s,v,i)=>s+v*axis[i],0);
      const radial=Math.hypot(...w.map((v,i)=>v-h*axis[i]));
      const hollow=Math.max(radial-.019,-.047-h);
      sleeve=Math.max(sleeve,-hollow);
      d=smoothMin(d,sleeve,.016);
    }
    let folds=0;
    const middle=clamp((y-.22)/.12)*clamp((.72-y)/.06)*clamp((.235-Math.abs(x))/.065),front=clamp((z-.025)/.08),back=clamp((-.025-z)/.065);
    folds+=.0045*gauss(y-(.712-.35*Math.abs(x)),.008)*gauss(x,.12);
    // Unequal, curved folds fall from the left shoulder and soften at the waist.
    for(let i=0;i<9;i++){
      const frontLine=.686-i*.068+.48*x+1.65*x*x,backLine=.682-i*.074+.19*x+1.5*x*x;
      if(i<6)folds+=(.007*gauss(y-frontLine,.015)-.002*gauss(y-frontLine+.021,.009))*front*middle;
      folds+=(.008*gauss(y-backLine,.017)-.002*gauss(y-backLine+.026,.010))*back*clamp((y-.02)/.06)*clamp((.72-y)/.06);
    }
    // Ground contact must stay flat after displacement.
    d=Math.max(d-folds,.006-y);
    mc.field[iz*res*res+iy*res+ix]=-d;
  }
  mc.update();
  const vertices=[],indices=[],normals=[],seen=new Map(),raw=mc.geometry.attributes.position,norm=mc.geometry.attributes.normal;
  for(let i=0;i<mc.count;i++){
    const p=[raw.getX(i)*.5,raw.getY(i)*.5+.38,raw.getZ(i)*.5+.06].map(v=>Math.round(v*32767));
    const key=p.join(',');let n=seen.get(key);if(n===undefined){n=vertices.length/3;seen.set(key,n);vertices.push(...p);normals.push(norm.getX(i),norm.getY(i),norm.getZ(i));}indices.push(n);
  }
  // Quantization can merge a very short marching-cubes edge. Remove the
  // resulting zero-area faces without changing the surrounding surface.
  let write=0;
  for(let read=0;read<indices.length;read+=3){
    const a=indices[read],b=indices[read+1],c=indices[read+2];
    if(a!==b&&b!==c&&c!==a){indices[write++]=a;indices[write++]=b;indices[write++]=c;}
  }
  indices.length=write;
  if(vertices.length/3>65535)throw Error('Robe exceeds 16-bit index budget');
  const quantizedNormals=new Int16Array(normals.length);for(let i=0;i<normals.length;i+=3){const length=Math.hypot(normals[i],normals[i+1],normals[i+2])||1;for(let j=0;j<3;j++)quantizedNormals[i+j]=Math.round(normals[i+j]/length*32767);}
  robes[mudra+(detailed?'':'-game')]={n:Buffer.from(quantizedNormals.buffer).toString('base64'),p:Buffer.from(new Int16Array(vertices).buffer).toString('base64'),i:Buffer.from(new Uint16Array(indices).buffer).toString('base64')};
  console.log(mudra,detailed?'study':'game',vertices.length/3,'vertices',indices.length/3,'triangles');
  mc.geometry.dispose();mc.material.dispose();
}
writeFileSync(new URL('../sculpture-robe-data.js',import.meta.url),'// Generated by scripts/build-sculpture-robe.mjs. Quantized positions: 1 / 32767.\nexport const ROBES = '+JSON.stringify(robes)+';\n');
