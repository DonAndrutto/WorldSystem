import { REBIRTH_SQUARES } from './rebirth-data.js';

/** Add approved local image files here. Numbers are permanent board identities.
 * Example (inactive):
 * 76: {src:'assets/rebirth/076.webp', alt:'Ratnasambhava in the Realm of Jeweled Peaks',
 *      credit:'Artist / collection and permission', width:.15, height:.20}
 * Both the 3D scene and the expanded destination card read this one manifest.
 */
const ART = {};
export const REBIRTH_ICONOGRAPHY = Object.freeze(Object.fromEntries(REBIRTH_SQUARES.map(s=>[s.number,Object.freeze({
  square:s.number,src:null,alt:s.name,credit:'',width:.15,height:.20,...ART[s.number]
})])));

export const PLAYER_COLOURS = Object.freeze([
  '#35558c','#9e3f43','#3d7a5c','#ba9144','#7e578d','#b76c36',
  '#447b88','#9d5e79','#667f3a','#6e4d39','#4c56a2','#9a7539'
]);
