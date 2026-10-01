// Chapter 33, body blocks 254–256: rgya gar four-element weekday/star combinations.
// Never use the five-element nag rtsis classification in these rules.
export const WEEKDAY_ELEMENTS = Object.freeze(['fire', 'water', 'fire', 'water', 'wind', 'earth', 'earth']);
export const ELEMENT_COMBINATIONS = Object.freeze({
  'earth-earth': { name: 'Accomplishment (dngos grub)', text: 'Associated with accomplishing aims, building sacred supports and houses, purchasing fields, increasing activities and stable plans.', inauspicious: false },
  'water-water': { name: 'Nectar (bdud rtsi)', text: 'Associated with vitality, marriage, trade, farming, bathing and longevity rites.', inauspicious: false },
  'earth-water': { name: 'Youth (lang tsho)', text: 'Associated with enjoyment, clothing and ornaments, play, celebrations and promotion.', inauspicious: false },
  'fire-fire': { name: 'Increase (\'phel \'gyur)', text: 'Associated with food and clothing, trade, sowing, generosity and wealth-deity offerings.', inauspicious: false },
  'wind-wind': { name: 'Excellence (phun tshogs)', text: 'Associated with quick accomplishment, travel, pursuing aims, reconciliation and movable activities.', inauspicious: false },
  'fire-wind': { name: 'Strength (stobs ldan)', text: 'Associated with auspiciousness, ritual support, deity offerings and peaceful, increasing and magnetizing activities.', inauspicious: false },
  'earth-wind': { name: 'Incompatibility (mi \'phrod)', text: 'Associated with depletion of food and wealth, sorrow and unsuccessful aims.', inauspicious: true },
  'water-wind': { name: 'Discord (mi mthun)', text: 'Associated with separation among relatives and friends and with divisive activities.', inauspicious: true },
  'earth-fire': { name: 'Burning (sreg pa)', text: 'Associated with suffering, conflict and forceful activities.', inauspicious: true },
  'fire-water': { name: 'Death (\'chi ba)', text: 'The most adverse of these combinations in the text, associated with destructive activities. This traditional class name is not a prediction of a person’s death.', inauspicious: true }
});
// Seven entries per row: Sunday through Saturday. Values are catalogue ids,
// reconciled against table 317, not 28-sector arithmetic. Variants stay separate.
const sets = days => days.split('|').map(names => ids(names));
const ids = names => names.split(' ').map(n => 'lm_' + n);
export const NAMED_COMBINATIONS = Object.freeze([
  { name:'Accomplishing / nectar combination', block:264, stars:ids('me_bzhi gro_bzhin tha_skar lha_mtshams rgyal nam_gru snar_ma'), text:'The text describes undertakings as favorable. Specific exceptions still apply.' },
  { name:'Paired combination (zung sbyor)', block:266, stars:ids('mchu sa_ga lag snubs dbo snar_ma chu_stod'), text:'Peaceful, increasing and magnetizing activities are favorable, except the individual prohibitions; destructive activities are excluded.' },
  { name:'Victory over demons (bdud rgyal)', block:268, stars:ids('snubs gro_bzhin khrums_smad smin_drug nabs_so gre sa_ri'), text:'Associated with warrior-deity offerings and forceful activities.', note:'Monday: table 317 gives 21. The verse explicitly names byi bzhin (Abhijit), so the verse is used below.' },
  { name:'Accomplishing day — first tradition', block:270, stars:ids('snubs mon_dre khrums_smad smin_drug rgyal gre sa_ga'), text:'Important and virtuous undertakings are favorable; harmful activities are excluded.' },
  { name:'Accomplishing day — alternative tradition', block:270, stars:ids('chu_stod nag_pa khrums_smad smin_drug nabs_so gre sa_ri'), text:'An alternative list for accomplishing important and virtuous undertakings.' },
  { name:'Auspicious day — first tradition', block:272, stars:ids('khrums_smad skag sa_ri snon dbo smin_drug snar_ma'), text:'Empowerment, consecration, deity offerings and virtuous activities are favorable.' },
  { name:'Auspicious day — alternative tradition', block:272, stars:ids('khrums_smad skag gre snon dbo smin_drug sa_ri'), text:'An alternative list for empowerment, consecration and virtuous activities.' },
  { name:'Increasing day — first tradition', block:274, stars:ids('snar_ma sa_ri rgyal lha_mtshams khrums_smad mgo khrums_stod'), text:'Learning writing and calculation, developing skills, irrigation, digging wells, farming and sowing are favorable.' },
  { name:'Increasing day — alternative tradition', block:274, stars:ids('snar_ma chu_stod nabs_so lha_mtshams khrums_smad mgo mon_dre'), text:'An alternative list for learning, cultivation and increasing activities.' },
  { name:'Harmonious day (mthun nyi)', block:276, stars:ids('snon khrums_smad khrums_stod bra_nye tha_skar mchu nam_gru'), text:'Reconciliation, forming family ties, crafts and beneficial activities are favorable.' },
  { name:'Joining day — first tradition', block:278, stars:ids('mgo snon smin_drug chu_stod mon_gru tha_skar me_bzhi'), text:'Deity offerings, family alliances, celebrations and increasing virtue are favorable.' },
  { name:'Joining day — alternative tradition', block:278, stars:ids('mgo snon smin_drug bra_nye mon_dre gro_bzhin snon'), text:'An alternative list for joining and increasing activities.' },
  { name:'Incompatible day — first tradition', block:284, stars:ids('mon_dre sa_ga lha_mtshams snon gro_bzhin snar_ma gre'), text:'Beneficial and harmonizing undertakings are discouraged.', inauspicious:true },
  { name:'Incompatible day — alternative tradition', block:284, stars:ids('gro_bzhin lha_mtshams lha_mtshams snubs mon_gru snar_ma gre'), text:'An alternative list discouraging beneficial and harmonizing undertakings.', inauspicious:true },
  { name:'Discordant day — first tradition', block:286, stars:ids('snon khrums_smad khrums_stod bra_nye lha_mtshams mchu nam_gru'), text:'Most beneficial undertakings, marriage and funerary ceremonies are discouraged.', inauspicious:true },
  { name:'Destructive day — first tradition', block:288, stars:ids('sa_ga snon nam_gru me_bzhi snar_ma nabs_so bra_nye'), text:'Marriage and setting out on journeys are discouraged.', inauspicious:true },
  { name:'Accomplished day (chub nyi)', block:274, stars:ids('mchu sa_ga lag snubs khrums_stod snar_ma chu_stod'), text:'Most beneficial activities are favorable; this follows the paired list with a different Thursday mansion.' },
  { name:'Demon day (bdud nyi)', block:280, stars:ids('smin_drug dbo skag chu_stod mgo rgyal mon_gru'), text:'Travel, marriage and the specific undertakings named in the verse are discouraged. The numeric table supplies the identities hidden in the verse’s metaphors.', inauspicious:true },
  { name:'Death combination (’chi sbyor)', block:282, stars:ids('lha_mtshams smin_drug mon_gru tha_skar mgo snar_ma me_bzhi'), text:'Most undertakings are discouraged, including construction, consecration, longevity rites, marriage and travel. This is a traditional class name, not a personal prediction.', inauspicious:true },
  { name:'Discordant day — alternative readings', block:286, starSets:sets('mon_gru|khrums_smad|tha_skar|bra_nye|sa_ga lha_mtshams|mchu|nag_pa'), text:'An alternative list discouraging most beneficial undertakings.', inauspicious:true },
  { name:'Destructive day — alternative readings', block:288, starSets:sets('khrums_stod|snar_ma|khrums_stod mon_gru|nag_pa|snar_ma|gre|skag'), text:'Alternative readings discouraging marriage and travel.', inauspicious:true },
  { name:'Accomplishing day — rdo rje gtsug lag', block:292, starSets:sets('khrums_stod khrums_smad nam_gru chu_smad|gro_bzhin snar_ma|khrums_smad nam_gru smin_drug|smin_drug mon_gru|nabs_so rgyal|gro_bzhin tha_skar|gro_bzhin'), text:'This tradition associates these days with approach and accomplishment practice.' },
  { name:'Demon day — rdo rje gtsug lag', block:294, starSets:sets('lha_mtshams bra_nye|rgyal chu_stod chu_smad lag|chu_smad mon_dre sa_ga|tha_skar mgo|mgo sa_ga|skag nam_gru|dbo me_bzhi'), text:'An adverse day list in the rdo rje gtsug lag tradition.', inauspicious:true },
  { name:'Discordant day — rdo rje gtsug lag', block:296, starSets:sets('mchu snon snubs mon_gru|sa_ga byi_bzhin khrums_smad|bra_nye tha_skar khrums_stod lag|bra_nye|sa_ga lag lha_mtshams|mchu|nag_pa nam_gru'), text:'A discordant day list in the rdo rje gtsug lag tradition.', inauspicious:true },
  { name:'Destructive day — rdo rje gtsug lag', block:298, starSets:sets('sa_ga chu_stod khrums_stod|snar_ma chu_smad mon_gru|mon_gru khrums_stod|snar_ma nag_pa snubs nam_gru|snar_ma snubs|snar_ma nabs_so gre|skag chu_stod chu_smad'), text:'A destructive day list in the rdo rje gtsug lag tradition.', inauspicious:true },
  { name:'Incompatible day — rdo rje gtsug lag', block:300, starSets:sets('mchu gro_bzhin mon_dre|lag sa_ga lha_mtshams|lag lha_mtshams snubs|snubs|gro_bzhin mon_gru nam_gru|snar_ma|gre chu_stod chu_smad'), text:'An incompatible day list in the rdo rje gtsug lag tradition.', inauspicious:true },
  { name:'Burning / always avoided (gtan spang)', block:290, stars:ids('mchu sa_ga lag snubs mon_dre snar_ma chu_stod'), text:'Important undertakings are to be avoided. This can coincide with a favorable paired combination; the specific prohibition takes precedence.', inauspicious:true }
].map(rule => Object.freeze({...rule, starSets: Object.freeze((rule.starSets || rule.stars.map((id,i) => [rule.block === 268 && i === 1 ? 'lm_byi_bzhin' : id])).map(Object.freeze))})));
