import { REBIRTH_SQUARES } from './rebirth-data.js';

const ART_CREDIT = 'Game of Liberation artwork supplied by the project owner';
const assetNumber = number => String(number).padStart(3, '0');

export const REBIRTH_ICONOGRAPHY = Object.freeze(Object.fromEntries(REBIRTH_SQUARES.map(s=>[s.number,Object.freeze({
  square:s.number,
  src:`assets/rebirth/full/${assetNumber(s.number)}.webp`,
  thumbSrc:`assets/rebirth/thumb/${assetNumber(s.number)}.webp`,
  alt:`Illustration for ${s.name}`,
  credit:ART_CREDIT,
  width:.15,
  height:.15
})])));

export const REBIRTH_END_ART = Object.freeze({
  src:'assets/rebirth/rebirth-end.webp',
  alt:'Amitabha and Guru Rinpoche seated on either side of a stupa',
  credit:ART_CREDIT,
  width:1400,
  height:700
});

export const PLAYER_COLOURS = Object.freeze([
  '#35558c','#9e3f43','#3d7a5c','#ba9144','#7e578d','#b76c36',
  '#447b88','#9d5e79','#667f3a','#6e4d39','#4c56a2','#9a7539'
]);
