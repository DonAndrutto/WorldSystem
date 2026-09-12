import { REBIRTH_SQUARES } from './rebirth-data.js';

// Exact counterparts or explicitly grouped realms already drawn in WorldSystem.
// A grouped square retains one game identity while pointing to several meshes.
const EXISTING = {
  2:['hell_avichi'], 3:['hell_tapana','hell_pratapana'],
  4:['hell_raurava','hell_maharaurava'], 5:['hell_kalasutra','hell_samghata'],
  6:['hell_sanjiva'], 7:['cold_arbuda','cold_nirarbuda','cold_atata','cold_hahava','cold_huhuva','cold_utpala','cold_padma','cold_mahapadma'],
  10:['preta_realm'],
  17:['continent_jambudvipa'], 18:['continent_aparagodaniya'],
  19:['continent_purvavideha'], 20:['continent_uttarakuru'],
  27:['meru_terrace_4'], 28:['meru_summit_platform'],
  29:['heaven_yama'], 30:['heaven_tushita'], 31:['heaven_nirmanarati'], 32:['heaven_paranirmitavashavartin'],
  35:['heaven_brahmaparishadya','heaven_brahmapurohita','heaven_mahabrahma','heaven_parittabha','heaven_apramanabha','heaven_abhasvara','heaven_parittashubha','heaven_apramanashubha','heaven_shubhakritsna','heaven_anabhraka','heaven_punyaprasava','heaven_brihatphala'],
  36:['formless_akashanantyayatana','formless_vijnananantyayatana','formless_akimchanyayatana','formless_bhavagra'],
  37:['heaven_avriha','heaven_atapa','heaven_sudrisha','heaven_sudarshana','heaven_akanishtha'],
};

function family(n) {
  if(n<=9) return 'Hells and judgement';
  if(n<=24 || n===26) return 'Worldly rebirths';
  if((n>=27&&n<=32)||(n>=35&&n<=37)) return 'Divine realms';
  if([59,60,61,70,76,77,84,85].includes(n)) return 'Sacred lands';
  if(n>=97) return 'The deeds of a Buddha';
  if([92,93].includes(n)) return 'Awakened bodies';
  if(/Tantra|Tantric|Wisdom-Holder|Mahākāla/.test(REBIRTH_SQUARES[n-1].name)) return 'Tantric paths';
  return 'Paths of liberation';
}

export const REBIRTH_WORLD_MAP = Object.freeze(REBIRTH_SQUARES.map(s => Object.freeze({
  number:s.number, family:family(s.number), worldIds:Object.freeze(EXISTING[s.number] || []),
  kind:EXISTING[s.number] ? (EXISTING[s.number].length>1?'grouped':'existing') : 'game-only'
})));

// Placement is a navigation aid, not a claim about cosmological distance.
// Akaniṣṭha (84), Cessation (48), and Nirvana (104) remain distinct identities.
export const FAMILY_COLOURS = Object.freeze({
  'Hells and judgement':0x9e3f43, 'Worldly rebirths':0x35558c,
  'Divine realms':0xd7bc70, 'Sacred lands':0x3d7a5c,
  'The deeds of a Buddha':0xe5d5a7, 'Awakened bodies':0xe7d6b0,
  'Tantric paths':0x9e3f43, 'Paths of liberation':0x3d7a5c
});
