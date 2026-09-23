/* Where each part of the relief is: the shape that answers a click, is lit
   when it is picked, and is framed when it is flown to.

   The shapes are read off the corrected photograph (wheel-relief.js carries
   the measured rims, spokes and dividers, and the outlines the build script
   could find by colour); everything else is traced by hand in the drawing's
   own units, which are the whole photograph's pixels. A shape is one of:

     ['sector', r0, r1, a0, a1]   an annular sector, degrees clockwise from the right
     ['ring', r0, r1]             an annulus
     ['disc', r]                  a disc about the wheel's centre
     ['ellipse', cx, cy, rx, ry]
     ['poly', [[x, y], …]]
     ['relief', key, index?]      an outline the build script found (all of them, or one)
     ['strip', region, n, k, angle]
                                  the k-th of n rows, parallel to the given angle,
                                  across one of the regions the script found

   `layer` is the layer of the relief the part stands in, so that it turns with
   what it outlines. Within a layer, a later part is above an earlier one: the
   realm comes before the figures in it. */

import { RELIEF } from './wheel-relief.js';

const [HUB, KARMA, REALM, OUTER] = RELIEF.rings;
const SP = RELIEF.spokes;                     // gods | humans | pretas | hells | animals | asuras
const DV = RELIEF.dividers;
const up = (a, from) => (a < from ? a + 360 : a);

/* the rims, as the relief has them: the gold is about seven units wide */
export const R = {
  hub: HUB - 3.2, hubRim: HUB + 3.2,
  karma: KARMA - 3.6, karmaRim: KARMA + 3.6,
  realm: REALM - 4.5, band0: REALM + 4.5,
  band1: OUTER - 5, rim: OUTER + 6
};
export const C = { x: 660, y: 866 };

export const REALMS = [
  { id: 'wl_realm_gods', a0: SP[0], a1: SP[1] },
  { id: 'wl_realm_humans', a0: SP[1], a1: SP[2] },
  { id: 'wl_realm_pretas', a0: SP[2], a1: SP[3] },
  { id: 'wl_realm_hells', a0: SP[3], a1: SP[4] },
  { id: 'wl_realm_animals', a0: SP[4], a1: up(SP[5], SP[4]) },
  { id: 'wl_realm_asuras', a0: up(SP[5], SP[4]), a1: SP[0] + 360 }
];
/* The twelve links, clockwise from the blind man just right of the fangs. */
export const NIDANAS = [
  'wl_nidana_ignorance', 'wl_nidana_formations', 'wl_nidana_consciousness',
  'wl_nidana_namerupa', 'wl_nidana_senses', 'wl_nidana_contact',
  'wl_nidana_feeling', 'wl_nidana_craving', 'wl_nidana_grasping',
  'wl_nidana_becoming', 'wl_nidana_birth', 'wl_nidana_death'
];
const DIV = DV.map((a, i) => (i && a < DV[0] ? a + 360 : a));
export const nidanaSpan = (i) => [DIV[i], i < 11 ? DIV[i + 1] : DIV[0] + 360];

/* The eight hot hells are the red rows on the left of the hells, parallel to
   the spoke that bounds them, and the eight cold the rows of ice on the right,
   parallel to theirs. The relief does not label its rows; they are read here
   from the spoke outward, the first hell nearest it. */
export const HOT_HELLS = ['wl_hell_sanjiva', 'wl_hell_kalasutra', 'wl_hell_samghata', 'wl_hell_raurava',
  'wl_hell_maharaurava', 'wl_hell_tapana', 'wl_hell_pratapana', 'wl_hell_avichi'];
export const COLD_HELLS = ['wl_cold_arbuda', 'wl_cold_nirarbuda', 'wl_cold_atata', 'wl_cold_hahava',
  'wl_cold_huhuva', 'wl_cold_utpala', 'wl_cold_padma', 'wl_cold_mahapadma'];

const P = (id, layer, ...shapes) => ({ id, layer, shapes });
export const PARTS = [
  /* ── beyond the wheel, on the wall ─────────────────────────────────── */
  P('wl_beyond_pureland', 'beyond', ['poly', [[14, 150], [40, 104], [90, 70], [130, 40], [176, 16], [230, 8], [280, 24],
    [318, 60], [334, 110], [318, 150], [290, 180], [250, 190], [200, 196], [150, 222], [70, 226], [16, 214]]]),
  P('wl_beyond_moon', 'beyond', ['ellipse', 424, 54, 18, 24]),
  P('wl_beyond_sun', 'beyond', ['ellipse', 837, 42, 16, 16]),
  P('wl_beyond_buddha', 'beyond', ['poly', [[1004, 40], [1044, 14], [1110, 10], [1170, 26], [1200, 70], [1196, 150],
    [1248, 180], [1250, 212], [1150, 214], [1060, 204], [1006, 180], [996, 120]]]),
  P('wl_beyond_fliers', 'beyond', ['poly', [[1222, 60], [1270, 50], [1320, 60], [1320, 224], [1260, 230], [1226, 200], [1234, 130]]],
    ['poly', [[1236, 252], [1290, 240], [1320, 246], [1320, 342], [1262, 336], [1234, 300]]], ['poly', [[0, 124], [24, 124], [26, 162], [0, 166]]]),

  /* ── Yama, behind the wheel ────────────────────────────────────────── */
  P('wl_yama', 'body', ['relief', 'yama', 0]),
  P('wl_yama_scarves', 'body', ['relief', 'scarves']),
  P('wl_yama_tiger', 'body', ['poly', [[40, 952], [70, 914], [128, 906], [168, 926], [178, 980], [150, 1040], [100, 1060], [52, 1040]]],
    ['poly', [[1280, 952], [1250, 914], [1192, 906], [1152, 926], [1142, 980], [1170, 1040], [1220, 1060], [1268, 1040]]],
    ['poly', [[0, 1236], [40, 1214], [80, 1226], [78, 1260], [30, 1276], [0, 1270]]], ['poly', [[1320, 1236], [1280, 1214], [1240, 1226], [1242, 1260], [1290, 1276], [1320, 1270]]],
    ['poly', [[410, 1372], [470, 1366], [560, 1376], [640, 1380], [740, 1376], [820, 1392], [840, 1420], [780, 1434], [700, 1444],
      [640, 1478], [560, 1484], [440, 1478], [362, 1476], [380, 1446], [430, 1430], [400, 1400]]]),
  P('wl_yama_bones', 'body', ['relief', 'bones']),
  P('wl_offering_bowl', 'body', ['relief', 'bowl', 0]),
  P('wl_beyond_path', 'body', ['poly', [[196, 200], [214, 190], [236, 236], [266, 282], [296, 318], [304, 362], [288, 370],
    [260, 330], [222, 292], [196, 250]]]),

  /* ── the wheel ─────────────────────────────────────────────────────── */
  ...REALMS.map((r) => P(r.id, 'wheel', ['sector', R.karmaRim, R.realm, r.a0, r.a1])),
  ...NIDANAS.map((id, i) => P(id, 'wheel', ['sector', R.band0, R.band1, ...nidanaSpan(i)])),
  P('wl_karma_white', 'wheel', ['sector', R.hubRim, R.karma, 90, 270]),
  P('wl_karma_black', 'wheel', ['sector', R.hubRim, R.karma, -90, 90]),
  P('wl_karma_demon', 'wheel', ['poly', [[664, 922], [700, 914], [728, 930], [722, 962], [690, 972], [664, 962]]]),
  P('wl_hub', 'wheel', ['disc', R.hub]),
  // the three animals, each at the tail of the next: read off the hub's close-up
  // the three animals, each at the tail of the next: read off the hub's close-up
  P('wl_hub_bird', 'wheel', ['poly', [[619, 848], [622, 833], [636, 822], [650, 816], [662, 820], [674, 823], [684, 824], [691, 830], [693, 835], [684, 836], [678, 842], [666, 854], [656, 858], [640, 857], [626, 853]]]),
  P('wl_hub_snake', 'wheel', ['poly', [[632, 857], [638, 864], [646, 870], [654, 869], [660, 862], [666, 854], [672, 851], [678, 856], [684, 864], [692, 864], [702, 860], [708, 859], [709, 863], [702, 866], [690, 869], [682, 868], [676, 862], [672, 858], [666, 862], [660, 870], [650, 874], [640, 872], [633, 866], [629, 860]]]),
  P('wl_hub_pig', 'wheel', ['poly', [[612, 864], [620, 863], [630, 870], [640, 875], [654, 876], [674, 876], [694, 878], [699, 874], [706, 876], [705, 886], [694, 900], [674, 908], [650, 910], [630, 905], [622, 894], [615, 878]]]),

  // the gods
  P('wl_gods_meru', 'wheel', ['poly', [[582, 722], [586, 696], [600, 662], [610, 622], [612, 590], [624, 566], [708, 566],
    [722, 594], [730, 630], [742, 668], [746, 722]]]),
  P('wl_gods_palace', 'wheel', ['poly', [[596, 560], [596, 520], [618, 494], [640, 478], [652, 450], [668, 450], [682, 478],
    [706, 494], [730, 520], [730, 560]]]),
  P('wl_wish_tree', 'wheel', ['poly', [[470, 520], [476, 480], [506, 452], [548, 440], [598, 444], [640, 462], [604, 496],
    [562, 508], [520, 520], [498, 534]]], ['poly', [[516, 600], [546, 600], [556, 700], [560, 784], [520, 786], [520, 700]]]),
  P('wl_gods_army', 'wheel', ['poly', [[478, 530], [500, 510], [540, 506], [576, 516], [590, 548], [584, 590], [548, 604],
    [506, 600], [482, 574]]]),
  P('wl_muni_gods', 'wheel', ['poly', [[752, 470], [770, 456], [806, 456], [826, 476], [840, 520], [830, 546], [780, 552],
    [752, 530]]]),
  // the asuras
  P('wl_muni_asuras', 'wheel', ['poly', [[392, 530], [412, 520], [436, 528], [446, 562], [430, 586], [404, 586], [390, 562]]]),
  P('wl_asura_war', 'wheel', ['poly', [[340, 590], [376, 576], [430, 590], [480, 600], [512, 618], [512, 696], [490, 704],
    [440, 690], [400, 668], [360, 640]]], ['poly', [[486, 716], [514, 716], [520, 800], [490, 800]]],
    ['poly', [[466, 800], [528, 800], [528, 828], [466, 828]]]),
  P('wl_asura_palace', 'wheel', ['poly', [[250, 750], [262, 700], [300, 640], [360, 626], [400, 640], [420, 690], [470, 700],
    [496, 730], [480, 780], [440, 810], [380, 808], [300, 792], [256, 780]]]),
  // the humans
  P('wl_muni_humans', 'wheel', ['poly', [[846, 506], [864, 494], [886, 500], [898, 530], [900, 566], [878, 578], [852, 570], [842, 540]]]),
  P('wl_human_stupa', 'wheel', ['poly', [[854, 634], [858, 604], [866, 596], [874, 604], [878, 634]]]),
  P('wl_human_teaching', 'wheel', ['poly', [[918, 648], [920, 600], [944, 572], [980, 566], [1006, 584], [1010, 650]]],
    ['poly', [[760, 718], [764, 668], [790, 640], [840, 636], [878, 650], [878, 718]]]),
  P('wl_human_village', 'wheel', ['poly', [[930, 700], [936, 670], [964, 656], [1010, 656], [1046, 672], [1062, 720],
    [1062, 752], [884, 752], [882, 722]]]),
  P('wl_human_nomads', 'wheel', ['poly', [[762, 814], [764, 752], [790, 736], [842, 740], [860, 790], [852, 820]]],
    ['poly', [[852, 766], [940, 764], [950, 806], [856, 810]]]),
  P('wl_human_plough', 'wheel', ['poly', [[982, 738], [1046, 736], [1050, 768], [986, 770]]]),
  // the animals
  P('wl_muni_animals', 'wheel', ['poly', [[240, 800], [262, 790], [290, 796], [296, 830], [286, 852], [252, 854], [240, 830]]]),
  P('wl_animals_land', 'wheel', ['poly', [[240, 900], [250, 870], [300, 850], [380, 840], [470, 848], [540, 860], [568, 900],
    [566, 956], [470, 962], [360, 962], [250, 960]]]),
  P('wl_animals_sea', 'wheel', ['poly', [[244, 966], [360, 966], [470, 966], [548, 972], [512, 1010], [470, 1050], [420, 1090],
    [360, 1110], [300, 1106], [260, 1060], [246, 1010]]]),
  // the pretas
  P('wl_muni_pretas', 'wheel', ['poly', [[1024, 800], [1044, 788], [1068, 794], [1076, 824], [1068, 850], [1036, 852], [1024, 826]]]),
  P('wl_preta_palace', 'wheel', ['poly', [[776, 900], [780, 850], [804, 838], [860, 840], [884, 870], [910, 912], [906, 950],
    [860, 952], [790, 946]]]),
  P('wl_preta_fire', 'wheel', ['poly', [[916, 880], [960, 866], [1020, 870], [1068, 880], [1070, 940], [1030, 952], [960, 950],
    [916, 938]]]),
  P('wl_preta_beaten', 'wheel', ['poly', [[842, 944], [900, 944], [960, 956], [1040, 948], [1080, 960], [1076, 1010],
    [1030, 1028], [950, 1026], [880, 1000], [844, 988]]]),
  P('wl_preta_river', 'wheel', ['poly', [[884, 1030], [960, 1026], [1040, 1032], [1080, 1030], [1066, 1070], [1030, 1100],
    [980, 1092], [930, 1066]]], ['poly', [[762, 1024], [808, 1010], [842, 1016], [842, 1048], [800, 1062], [764, 1060]]]),
  // the hells
  ...HOT_HELLS.map((id, k) => P(id, 'wheel', ['strip', 'hot', 8, k, SP[4]])),
  ...COLD_HELLS.map((id, k) => P(id, 'wheel', ['strip', 'cold', 8, k, SP[3]])),
  P('wl_muni_hells', 'wheel', ['poly', [[556, 952], [576, 940], [602, 948], [608, 986], [596, 1004], [566, 1004], [554, 980]]]),
  // the court: Yama in his pavilion, the scribe and the attendants, the dead
  // brought before him, and at the foot of the throne the white god and the
  // black demon with the dead between them
  P('wl_hell_judge', 'wheel', ['poly', [[588, 1118], [588, 1030], [604, 1000], [640, 984], [682, 984], [714, 1000], [726, 1030], [726, 1118]]]),
  P('wl_hell_court', 'wheel', ['poly', [[590, 1076], [622, 1074], [624, 1132], [592, 1134]]],
    ['poly', [[692, 1070], [748, 1070], [788, 1094], [788, 1142], [700, 1142], [692, 1110]]]),
  P('wl_hell_pebbles', 'wheel', ['poly', [[608, 1122], [690, 1116], [710, 1122], [710, 1152], [608, 1154]]]),
  P('wl_hell_torments', 'wheel', ['poly', [[552, 1150], [610, 1152], [690, 1158], [724, 1168], [720, 1194], [770, 1206], [770, 1250],
    [724, 1250], [712, 1222], [640, 1218], [596, 1216], [556, 1196]]]),
  P('wl_hell_stupa', 'wheel', ['poly', [[726, 1150], [746, 1142], [766, 1146], [804, 1154], [806, 1182], [760, 1186], [728, 1178]]]),
  P('wl_hell_neighbouring', 'wheel', ['poly', [[500, 1214], [556, 1212], [560, 1244], [504, 1248]]],
    ['poly', [[746, 1188], [770, 1170], [806, 1172], [808, 1212], [772, 1214]]]),
  P('wl_hell_cauldron', 'wheel', ['poly', [[604, 1224], [650, 1216], [712, 1222], [716, 1254], [606, 1256]]]),

  /* ── the gold ──────────────────────────────────────────────────────── */
  P('wl_wheel', 'frame', ['ring', R.band1 - 1, R.rim]),

  /* ── Yama, in front ────────────────────────────────────────────────── */
  P('wl_yama_head', 'front', ['poly', RELIEF.front.head]),
  P('wl_yama_crown', 'front', ['poly', [[446, 196], [452, 140], [494, 104], [516, 44], [556, 22], [620, 0], [700, 0], [764, 22],
    [804, 44], [826, 104], [868, 140], [874, 196], [822, 160], [770, 124], [700, 110], [620, 110], [550, 124], [498, 160]]]),
  P('wl_yama_eye', 'front', ['ellipse', 663, 166, 22, 26]),
  P('wl_yama_hands', 'front', ['poly', RELIEF.front.hand_l], ['poly', RELIEF.front.hand_r]),
  P('wl_yama_feet', 'front', ['poly', RELIEF.front.foot_l], ['poly', RELIEF.front.foot_r])
];
