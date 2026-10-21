// Offline, continuous hand and foot surfaces. Coordinates are in statue units.
// The review and game use the same anatomy at different sampling resolutions.
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import {MeshBasicMaterial,CatmullRomCurve3,Vector3} from 'three';
import {writeFileSync} from 'node:fs';
const clamp=x=>Math.max(0,Math.min(1,x)),gauss=(x,w)=>Math.exp(-.5*(x/w)**2);
const union=(a,b,k=.003)=>{const h=Math.max(k-Math.abs(a-b),0)/k;return Math.min(a,b)-h*h*k*.25;};
const ell=(p,c,r)=>(Math.hypot(...p.map((v,i)=>(v-c[i])/r[i]))-1)*Math.min(...r);
function capsule(p,a,b,r0,r1){const v=b.map((x,i)=>x-a[i]),t=clamp(v.reduce((s,x,i)=>s+x*(p[i]-a[i]),0)/v.reduce((s,x)=>s+x*x,0));return Math.hypot(...p.map((x,i)=>x-a[i]-v[i]*t))-(r0+(r1-r0)*t);}
let activeNails=[];
function finger(points,radius,nailAxis=[0,0,-1]){
 const curve=new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal'),segments=[];
 for(let i=0;i<14;i++){
  const r=t=>radius*(1-.28*t)*(1+.075*gauss(t-.42,.07)+.05*gauss(t-.74,.06));
  segments.push([curve.getPoint(i/14).toArray(),curve.getPoint((i+1)/14).toArray(),r(i/14),r((i+1)/14)]);
 }
 const tangent=curve.getTangent(.86).normalize(),normal=new Vector3(...nailAxis);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();
 const center=curve.getPoint(.85).addScaledVector(normal,radius*(1-.28*.85)+.00025);
 activeNails.push({center:center.toArray(),tangent:tangent.toArray(),normal:normal.toArray(),width:radius*.72,length:Math.min(.014,curve.getLength()*.23)});
 return segments;
}
function hand(pose){
 const teach=pose==='teach',earth=pose==='earth',top=pose==='lap-top';
 const bodies=[[[0,.025,0],[.023,.031,.010]],[[0,.044,-.001],[.025,.012,.009]],[[.013,.021,.004],[.012,.022,.011]],[[ -.014,.027,.003],[.010,.023,.010]]];
 const digits=[];
 if(teach){
  digits.push(...finger([[.017,.049,0],[.022,.069,.002],[.031,.079,.010],[.034,.073,.020],[.028,.066,.024]],.0057));
  digits.push(...finger([[.006,.051,0],[.006,.081,.001],[.009,.105,.005],[.014,.114,.012]],.0056));
  digits.push(...finger([[-.007,.050,0],[-.010,.079,.002],[-.014,.100,.010],[-.013,.108,.020]],.0053));
  digits.push(...finger([[-.018,.047,0],[-.024,.070,.004],[-.029,.088,.013],[-.027,.095,.024]],.0047));
  digits.push(...finger([[.013,.012,.004],[.030,.028,.008],[.040,.046,.013],[.037,.059,.021],[.028,.066,.024]],.0072));
 }else{
  const base=[.020,.005,-.009,-.023],len=earth?[.047,.055,.052,.041]:[.043,.050,.047,.037];
  for(let i=0;i<4;i++){
   const c=base[i],l=len[i];digits.push(...finger([[c,.048,0],[c*1.05,.048+l*.43,earth?.002:.003],[c*1.10,.048+l*.8,earth?.005:.010],[c*1.08,.048+l,earth?.008:.017]],.0056-i*.0003));
  }
  const tip=earth?[.030,.061,.014]:[.023,.087,top?.020:.035];
  digits.push(...finger([[.013,.012,.004],[.030,.029,.007],[.037,.049,.017],tip],.007));
 }
 // Wrist and palm are joined in the field, so there is no flat cap seam.
 return p=>{
  const bound=Math.max(Math.abs(p[0])-.060,-.09-p[1],p[1]-.124,Math.abs(p[2])-.055);if(bound>.008)return bound;
  let d=capsule([p[0],p[1],p[2]/.68],[0,-.032,0],[0,.013,0],.0185,.0155);
  for(const [c,r] of bodies)d=union(d,ell(p,c,r),.006);
  for(const [a,b,r0,r1] of digits)d=union(d,capsule(p,a,b,r0,r1),.0017);
  const palm=clamp((p[2]-.003)/.008);
  d+=.0016*gauss(p[0]-.001,.009)*gauss(p[1]-.034,.016)*palm;
  return d;
 };
}
function foot(){
 const bodies=[[[.018,.001,0],[.035,.031,.031]],[[.085,.001,.003],[.067,.021,.028]],[[.151,.002,.005],[.042,.020,.044]],[[.066,.019,-.008],[.056,.018,.025]]];
 const toes=[],widths=[-.030,-.010,.009,.025,.038],ends=[.231,.226,.214,.201,.185];
 for(let i=0;i<5;i++){
  const z=widths[i],r=.0113-i*.00125;
  toes.push(...finger([[.160,.001,z],[ends[i]-.026,.002,z+.001],[ends[i]-.011,.004,z+.002],[ends[i],.003,z+.001]],r,[0,1,0]));
 }
 return p=>{
  const bound=Math.max(-.028-p[0],p[0]-.248,Math.abs(p[1])-.045,Math.abs(p[2])-.054);if(bound>.008)return bound;
  let d=10;for(const [c,r] of bodies)d=union(d,ell(p,c,r),.007);
  for(const [a,b,r0,r1] of toes)d=union(d,capsule(p,a,b,r0,r1),.0022);
  // Hollow on the medial underside leaves a heel, arch and ball.
  d+=.008*gauss(p[0]-.080,.032)*gauss(p[2]+.022,.020)*clamp((.002-p[1])/.018);
  return d;
 };
}
function bake(field,size,center,res){
 const mc=new MarchingCubes(res,new MeshBasicMaterial(),false,false,200000);mc.isolation=0;
 for(let z=0;z<res;z++)for(let y=0;y<res;y++)for(let x=0;x<res;x++)mc.field[z*res*res+y*res+x]=-field([x,y,z].map((v,i)=>(v/res-.5)*size+center[i]));
 mc.update();const p=[],n=[],indices=[],seen=new Map(),pos=mc.geometry.attributes.position,norm=mc.geometry.attributes.normal;
 for(let i=0;i<mc.count;i++){
  const point=[pos.getX(i),pos.getY(i),pos.getZ(i)].map((v,j)=>Math.round((v*size*.5+center[j])*32767));
  const key=point.join(',');let index=seen.get(key);
  if(index===undefined){index=p.length/3;seen.set(key,index);p.push(...point);const normal=[norm.getX(i),norm.getY(i),norm.getZ(i)],length=Math.hypot(...normal)||1;n.push(...normal.map(v=>Math.round(v/length*32767)));}indices.push(index);
 }
 if(p.length/3>65535)throw Error('Anatomy exceeds 16-bit index budget');
 const clean=[];for(let i=0;i<indices.length;i+=3)if(indices[i]!==indices[i+1]&&indices[i+1]!==indices[i+2]&&indices[i]!==indices[i+2])clean.push(...indices.slice(i,i+3));
 mc.geometry.dispose();mc.material.dispose();
 return {p:Buffer.from(new Int16Array(p).buffer).toString('base64'),n:Buffer.from(new Int16Array(n).buffer).toString('base64'),i:Buffer.from(new Uint16Array(clean).buffer).toString('base64'),triangles:clean.length/3};
}
const anatomy={};
for(const pose of ['teach','lap','lap-top','earth','foot'])for(const detailed of [true,false]){
 const isFoot=pose==='foot',key=pose+(detailed?'':'-game');
 activeNails=[];
 anatomy[key]=bake(isFoot?foot():hand(pose),isFoot?.32:.24,isFoot?[.10,0,0]:[0,.019,0],detailed?116:isFoot?46:68);
 anatomy[key].nails=activeNails;
 console.log(key,anatomy[key].triangles,'triangles');
}
writeFileSync(new URL('../sculpture-anatomy-data.js',import.meta.url),'// Generated by scripts/build-sculpture-anatomy.mjs; coordinates and normals / 32767.\nexport const ANATOMY = '+JSON.stringify(anatomy)+';\n');
