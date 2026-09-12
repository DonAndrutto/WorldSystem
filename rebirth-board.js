// The game of rebirth, as a layer over the world system.
//
// The 1977 board is 104 squares in 13 rows of 8, numbered right to left and
// rising from the bottom. Read as a vertical section it is already a cosmology:
// the row is height above or below the golden ground, and the column separates
// the two great routes — tantra on the right of the board, the sutra path on
// the left. Twenty-one of its squares name something the Abhidharma model
// already builds, and those bind to the existing geometry by entry id. The
// remaining eighty-three are paths, attainments, sacred lands and Buddha fields,
// which the sources place outside the Meru world system; they have no
// coordinate in it, so this layer gives them one.

export const BOARD = {"squares":[{"n":1,"name":"Vajra Hell","row":0,"col":0,"cat":"Hell states","anchor":null,"band":"below"},{"n":2,"name":"Interminable Hell","row":0,"col":1,"cat":"Hell states","anchor":"hell_avichi","band":"anchored"},{"n":3,"name":"The Hot and Very Hot Hells","row":0,"col":2,"cat":"Hell states","anchor":"hell_tapana","band":"anchored"},{"n":4,"name":"The Howling and Great Howling Hells","row":0,"col":3,"cat":"Hell states","anchor":"hell_raurava","band":"anchored"},{"n":5,"name":"The Black Rope and Crushing Hells","row":0,"col":4,"cat":"Hell states","anchor":"hell_kalasutra","band":"anchored"},{"n":6,"name":"Reviving Hell","row":0,"col":5,"cat":"Hell states","anchor":"hell_sanjiva","band":"anchored"},{"n":7,"name":"The Cold Hells","row":0,"col":6,"cat":"Hell states","anchor":"cold_arbuda","band":"anchored"},{"n":8,"name":"The Temporary Hells, or “Hell for a Day”","row":0,"col":7,"cat":"Hell states","anchor":null,"band":"below"},{"n":9,"name":"Lord of the Dead (Yama)","row":1,"col":0,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":10,"name":"Hungry Ghosts (Preta)","row":1,"col":1,"cat":"Hungry ghosts","anchor":"preta_realm","band":"anchored"},{"n":11,"name":"Animals","row":1,"col":2,"cat":"Animals","anchor":null,"band":"below"},{"n":12,"name":"Divine Animals","row":1,"col":3,"cat":"Animals","anchor":null,"band":"below"},{"n":13,"name":"World of the Nāgas","row":1,"col":4,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":14,"name":"Demon Island","row":1,"col":5,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":15,"name":"Asuras","row":1,"col":6,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":16,"name":"Rudra Black Freedom","row":1,"col":7,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":17,"name":"Jambu Island—The Southern Continent","row":2,"col":0,"cat":"Human continents","anchor":"continent_jambudvipa","band":"anchored"},{"n":18,"name":"The Western Continent—Enjoyment of Cattle (Apara-Godānīya)","row":2,"col":1,"cat":"Human continents","anchor":"continent_aparagodaniya","band":"anchored"},{"n":19,"name":"The Eastern Continent—Noble Figure (Pūrva-Videha)","row":2,"col":2,"cat":"Human continents","anchor":"continent_purvavideha","band":"anchored"},{"n":20,"name":"The Northern Continent—Kuru","row":2,"col":3,"cat":"Human continents","anchor":"continent_uttarakuru","band":"anchored"},{"n":21,"name":"Barbarism","row":2,"col":4,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":22,"name":"Hinduism","row":2,"col":5,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":23,"name":"Bön","row":2,"col":6,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":24,"name":"The Heavenly Highway","row":2,"col":7,"cat":"Starting position","anchor":null,"band":"ground"},{"n":25,"name":"Beginning the Tantra","row":3,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":26,"name":"Wheel-Turning King (Cakravartin)","row":3,"col":1,"cat":"Universal sovereignty","anchor":null,"band":"ground"},{"n":27,"name":"Heaven of the Four Great Kings","row":3,"col":2,"cat":"Heavens of sense desire","anchor":"meru_terrace_4","band":"anchored"},{"n":28,"name":"Heaven of the Thirty-three (Trāyatriṁśa)","row":3,"col":3,"cat":"Heavens of sense desire","anchor":"sudarshana_city","band":"anchored"},{"n":29,"name":"Heaven Without Fighting (Yāma)","row":3,"col":4,"cat":"Heavens of sense desire","anchor":"heaven_yama","band":"anchored"},{"n":30,"name":"The Joyful (Tuṣita) Heaven","row":3,"col":5,"cat":"Heavens of sense desire","anchor":"heaven_tushita","band":"anchored"},{"n":31,"name":"Delighting in Emanations (Nirmāṇa-rati)","row":3,"col":6,"cat":"Heavens of sense desire","anchor":"heaven_nirmanarati","band":"anchored"},{"n":32,"name":"Ruling the Emanations of Others (Paranirmita-Vaśavartin)","row":3,"col":7,"cat":"Heavens of sense desire","anchor":"heaven_paranirmitavashavartin","band":"anchored"},{"n":33,"name":"Tantra, Lesser Path of Accumulation","row":4,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":34,"name":"Mahākāla","row":4,"col":1,"cat":"Dharma protector","anchor":null,"band":"tantra"},{"n":35,"name":"The Realm of Form (Rūpa-Dhātu)","row":4,"col":2,"cat":"Realm of Form","anchor":"heaven_brahmaparishadya","band":"anchored"},{"n":36,"name":"The Formless Realm (Arūpa-Dhātu)","row":4,"col":3,"cat":"Formless Realm","anchor":"formless_akashanantyayatana","band":"anchored"},{"n":37,"name":"Pure Abodes (Śuddhāvāsa)","row":4,"col":4,"cat":"Realm of Form","anchor":"heaven_avriha","band":"anchored"},{"n":38,"name":"Disciples (Śrāvaka), Path of Accumulation (Sambhāra-Mārga)","row":4,"col":5,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":39,"name":"Disciples, Path of Application (Prayoga-Mārga)","row":4,"col":6,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":40,"name":"Disciples, Paths of Vision and Cultivation (Darśana-Mārga, Bhāvanā-Mārga)","row":4,"col":7,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":41,"name":"Tantra, Middle Path of Accumulation","row":5,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":42,"name":"Tantra, Greater Path of Accumulation","row":5,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":43,"name":"Independent Buddha (Pratyeka-Buddha), Path of Accumulation","row":5,"col":2,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":44,"name":"Independent Buddha, Path of Application","row":5,"col":3,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":45,"name":"Independent Buddha, Path of Vision","row":5,"col":4,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":46,"name":"Independent Buddha, Path of Cultivation","row":5,"col":5,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":47,"name":"Independent Buddha, Arhatship","row":5,"col":6,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":48,"name":"Cessation (Nirodha)","row":5,"col":7,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":49,"name":"Tantra, Path of Application: “Heat”","row":6,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":50,"name":"Tantra, Path of Application: “Climax”","row":6,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":51,"name":"Disciples, Arhatship","row":6,"col":2,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":52,"name":"Mahāyāna, Lesser Path of Accumulation","row":6,"col":3,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":53,"name":"Mahāyāna, Middle Path of Accumulation","row":6,"col":4,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":54,"name":"Mahāyāna, Greater Path of Accumulation","row":6,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":55,"name":"Mahāyāna, Path of Application: “Heat” (Ūṣman)","row":6,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":56,"name":"Mahāyāna, Path of Application: “Climax” (Mūrdhan)","row":6,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":57,"name":"Tantra, Path of Application: “Receptivity”","row":7,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":58,"name":"Tantra, Path of Application: “Highest Teachings”","row":7,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":59,"name":"Shambhala","row":7,"col":2,"cat":"Mythic and sacred lands","anchor":null,"band":"island"},{"n":60,"name":"Potāla","row":7,"col":3,"cat":"Mythic and sacred lands","anchor":null,"band":"island"},{"n":61,"name":"Urgyan (Uḍḍiyāna)","row":7,"col":4,"cat":"Mythic and sacred lands","anchor":null,"band":"island"},{"n":62,"name":"Hindu Wisdom-Holder (Vidyādhara)","row":7,"col":5,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":63,"name":"Mahāyāna, Path of Application: “Receptivity” (Kṣānti)","row":7,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":64,"name":"Mahāyāna, Path of Application: “Highest Teachings” (Laukikāgra-Dharma)","row":7,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":65,"name":"Wisdom-Holder of the Bön Tradition (*Bön Vidyādhara)","row":8,"col":0,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":66,"name":"First Tantra Stage","row":8,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":67,"name":"Wisdom-Holder Among the Gods of Sense Desire (*Kāmadeva-Vidyādhara)","row":8,"col":2,"cat":"Wisdom-holder attainments","anchor":null,"band":"tantra"},{"n":68,"name":"Wisdom-Holder of the Realm of Form (*Rūpa-Dhātu-Vidyādhara)","row":8,"col":3,"cat":"Wisdom-holder attainments","anchor":null,"band":"tantra"},{"n":69,"name":"Tantric Wheel-Turning King (*Mantra-Cakravartin)","row":8,"col":4,"cat":"Universal sovereignty","anchor":null,"band":"ground"},{"n":70,"name":"Realm of Action-Completion (*Karma-Paripūraṇa)","row":8,"col":5,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":71,"name":"First Sutra Stage (Bhūmi)","row":8,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":72,"name":"Wisdom-Holder of the Eight Siddhis","row":8,"col":7,"cat":"Wisdom-holder attainments","anchor":null,"band":"tantra"},{"n":73,"name":"Second Tantra Stage","row":9,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":74,"name":"Third Tantra Stage","row":9,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":75,"name":"Fourth Tantra Stage","row":9,"col":2,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":76,"name":"Realm of Jeweled Peaks (Ratna-Kūṭa)","row":9,"col":3,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":77,"name":"Land of Bliss (Sukhāvatī)","row":9,"col":4,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":78,"name":"Fourth Sutra Stage","row":9,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":79,"name":"Third Sutra Stage","row":9,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":80,"name":"Second Sutra Stage","row":9,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":81,"name":"Fifth Tantra Stage","row":10,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":82,"name":"Sixth Tantra Stage","row":10,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":83,"name":"Seventh Tantra Stage","row":10,"col":2,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":84,"name":"Supreme Heaven (Akaniṣṭha)","row":10,"col":3,"cat":"Buddha fields","anchor":"heaven_akanishtha","band":"anchored"},{"n":85,"name":"Realm of Superjoy (Abhirati)","row":10,"col":4,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":86,"name":"Seventh Sutra Stage","row":10,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":87,"name":"Sixth Sutra Stage","row":10,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":88,"name":"Fifth Sutra Stage","row":10,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":89,"name":"Eighth Tantra Stage","row":11,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":90,"name":"Ninth Tantra Stage","row":11,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":91,"name":"Tenth Tantra Stage","row":11,"col":2,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":92,"name":"Great Enjoyment Body (Sambhoga-Kāya)","row":11,"col":3,"cat":"Buddha bodies","anchor":null,"band":"axis"},{"n":93,"name":"Great Dharma Body (Dharma-Kāya)","row":11,"col":4,"cat":"Buddha bodies","anchor":null,"band":"axis"},{"n":94,"name":"Tenth Sutra Stage","row":11,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":95,"name":"Ninth Sutra Stage","row":11,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":96,"name":"Eighth Sutra Stage","row":11,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":97,"name":"Adopting a Physical Form","row":12,"col":0,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":98,"name":"The Setting Forth (Pravrajita)","row":12,"col":1,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":99,"name":"Ascetic Practices (Tapas)","row":12,"col":2,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":100,"name":"Conquest of Māra","row":12,"col":3,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":101,"name":"Buddhahood","row":12,"col":4,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":102,"name":"Turning the Wheel of Dharma","row":12,"col":5,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":103,"name":"Demonstration of Miracles","row":12,"col":6,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":104,"name":"Nirvana","row":12,"col":7,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"}],"moves":{"2":{"one":17,"two":10,"three":3},"3":{"one":11,"two":10,"three":8,"four":7,"five":5,"six":2},"4":{"one":13,"two":10,"three":8,"four":6,"five":5,"six":3},"5":{"one":13,"two":11,"three":10,"four":7,"five":4,"six":3},"6":{"one":17,"two":12,"three":10,"four":8,"five":5,"six":4},"7":{"one":15,"two":18,"three":11,"four":10,"five":6,"six":5},"8":{"one":27,"two":19,"three":14,"four":11,"five":7,"six":6},"9":{"one":42,"two":34},"10":{"one":19,"two":13,"three":14,"four":11,"five":8,"six":4},"11":{"one":27,"two":17,"three":12,"four":13,"five":10,"six":5},"12":{"one":28,"two":27,"three":15,"four":21,"five":11,"six":10},"13":{"one":28,"two":27,"three":15,"four":21,"five":11,"six":10},"14":{"one":25,"two":42,"three":17,"four":15,"five":5,"six":3},"15":{"one":28,"two":14,"three":21,"four":11,"five":10,"six":4},"16":{"two":34},"17":{"one":52,"two":25,"three":26,"four":38,"five":22,"six":6},"18":{"one":38,"two":27,"three":13,"four":21,"five":11,"six":10},"19":{"one":43,"two":38,"three":13,"four":15,"five":13,"six":11},"20":{"one":28,"two":27,"three":17,"four":19,"five":15},"21":{"one":15,"two":62,"three":13,"four":11,"five":10,"six":2},"22":{"one":52,"two":62,"three":13,"four":15,"five":11,"six":3},"23":{"one":52,"two":65,"three":29,"four":27,"five":14,"six":4},"24":{"one":27,"two":17,"three":15,"four":11,"five":10,"six":6},"25":{"one":72,"two":33,"six":38},"26":{"one":29,"two":28,"three":17,"four":20,"five":13,"six":13},"27":{"one":28,"two":17,"three":23,"four":18,"five":10,"six":6},"28":{"one":29,"two":17,"three":20,"four":22,"five":11,"six":7},"29":{"one":30,"two":31,"three":17,"four":23,"five":12,"six":10},"30":{"one":64,"two":63,"three":55,"four":54,"five":53,"six":52},"31":{"one":52,"two":30,"three":43,"four":32,"five":22,"six":12},"32":{"one":30,"two":35,"three":28,"four":18,"five":10},"33":{"one":41,"two":42,"five":16,"six":1},"34":{"one":61,"two":81,"three":70},"35":{"one":37,"two":52,"three":36,"four":30,"five":17,"six":27},"36":{"one":38,"two":17,"three":11,"six":4},"37":{"one":64,"two":54,"three":32,"four":52,"five":12},"38":{"one":37,"two":40,"three":39,"four":52,"five":11,"six":5},"39":{"one":52,"two":43,"three":40,"four":52,"five":28,"six":19},"40":{"one":30,"two":35,"three":28,"four":32,"five":31,"six":29},"41":{"one":60,"two":42,"three":59,"five":67,"six":33},"42":{"one":49,"two":50,"six":59},"43":{"one":52,"two":44,"three":28,"four":38,"five":13,"six":6},"44":{"one":30,"two":46,"three":45,"four":20,"five":39,"six":27},"45":{"one":52,"two":47,"three":46,"four":40,"five":17,"six":28},"46":{"one":30,"two":47,"three":37,"four":35,"five":51,"six":29},"47":{"one":52,"two":48,"three":30,"four":37},"49":{"one":50,"two":57},"50":{"one":57,"two":66},"51":{"one":52,"two":48,"three":37},"52":{"one":54,"two":53,"three":30,"four":38,"five":11,"six":7},"53":{"one":55,"two":54,"three":37,"four":40,"five":15,"six":8},"54":{"one":63,"two":55,"three":60,"four":59},"55":{"one":63,"two":56},"56":{"one":64,"two":63},"57":{"one":66,"two":73,"three":58,"four":77},"58":{"one":73,"two":74,"three":66,"four":85},"59":{"one":63,"two":50,"three":60,"four":49,"five":42,"six":55},"60":{"one":64,"two":63,"three":42},"61":{"one":89,"two":84,"three":83},"62":{"one":52,"two":38},"63":{"one":85,"two":42,"three":64,"four":77},"64":{"one":71,"two":49,"five":77},"65":{"one":52,"two":43,"five":15,"six":8},"66":{"one":74,"two":75,"three":73},"67":{"one":41,"two":42,"three":68,"four":69},"68":{"one":42,"two":49,"four":59,"six":41},"69":{"one":75,"two":81},"70":{"one":86,"two":73,"four":34,"five":74,"six":71},"71":{"one":79,"two":80,"three":74},"72":{"one":67,"two":41,"three":33},"73":{"one":75,"two":81,"six":69},"74":{"one":75,"two":81},"75":{"one":82,"two":83,"three":81},"76":{"one":78,"two":74,"three":73},"77":{"one":71,"two":74},"78":{"one":87,"two":88},"79":{"one":88,"two":78},"80":{"one":78,"two":79},"81":{"one":83,"two":89},"82":{"one":89,"two":90},"83":{"one":84,"two":91},"84":{"one":93},"85":{"one":71,"two":73,"three":76},"86":{"one":95,"two":96},"87":{"one":96,"two":86},"88":{"one":95,"two":87},"89":{"one":84,"two":90},"90":{"one":84,"two":91},"91":{"one":84,"two":93},"92":{"one":97},"93":{"one":92},"94":{"one":93,"two":84},"95":{"one":94,"two":84},"96":{"one":94,"two":95},"97":{"one":98,"two":98},"98":{"one":99,"two":99},"99":{"one":100,"two":100},"100":{"one":101,"two":101},"101":{"one":102,"two":102},"102":{"one":103,"two":103},"103":{"one":104,"two":104}},"variants":{"85":{"one":73}},"special":{"104":{"kind":"terminal","note":"one or two passes the relics into the stupa"},"48":{"kind":"tally","exit_to":52},"1":{"kind":"tally","exit_to":9}},"start":24,"victory":104,"quota":{"one":1,"two":2,"three":3,"four":4,"five":5,"six":6},"quotaNote64":{"one":1,"two":2,"three":6,"four":3,"five":5,"six":4}};


export const SQUARES = BOARD.squares;
export const MOVES = BOARD.moves;
export const SPECIAL = BOARD.special;
export const START = BOARD.start;
export const VICTORY = BOARD.victory;
export const TRAP_QUOTA = BOARD.quota;
export const TRAP_QUOTA_NOTE64 = BOARD.quotaNote64;

// Where the witnesses disagree. Square 85's first face reads 71 here, the First
// Sutra Stage, which is how the other Buddha fields route — 76 and 77 each give
// one sutra exit and one tantric one. A second reading sends it to 73 instead,
// doubling the face-two destination; it is kept so the square's entry can say so.
export const VARIANTS = BOARD.variants;
export const FACES = ['one', 'two', 'three', 'four', 'five', 'six'];

export const BY_N = new Map(SQUARES.map(s => [s.n, s]));

export const ZONES = [
  ['lower', 'The lower realms'], ['human', 'The human world'], ['heaven', 'The heavens'],
  ['shravaka', 'Disciples and Independent Buddhas'], ['sutra', 'The Mahayana sutra path'],
  ['tantra', 'The tantric path'], ['pure', 'Pure lands and Buddhahood']
];

const ZONE_OF_CAT = {
  'Hell states': 'lower', 'Hungry ghosts': 'lower', 'Animals': 'lower',
  'Underworld beings and spirits': 'lower',
  'Human continents': 'human', 'Starting position': 'human',
  'Universal sovereignty': 'human',
  'Non-Buddhist traditions as represented in the book': 'human',
  'Heavens of sense desire': 'heaven', 'Realm of Form': 'heaven', 'Formless Realm': 'heaven',
  'Vehicle of Disciples': 'shravaka', 'Independent Buddha path': 'shravaka',
  'Mahāyāna sutra path': 'sutra',
  'Tantric path': 'tantra', 'Wisdom-holder attainments': 'tantra', 'Dharma protector': 'tantra',
  'Mythic and sacred lands': 'pure', 'Buddha fields': 'pure', 'Buddha bodies': 'pure',
  'Acts of the Emanation body': 'pure'
};

export const zoneOf = (square) => ZONE_OF_CAT[square.cat] || 'human';

// Band colours follow the world's own palette: gold for what rises, lapis for
// the sutra route, cinnabar for tantra, white for the fields beyond the rim.
// One colour per player, shared by the board, the trail and the world.
export const PLAYER_COLOURS = ['#c9a227', '#3f63a8', '#a33f3a', '#4f7f6a'];

export const BAND_COLOUR = {
  anchored: 0xc9a227, below: 0x7d4a3a, ground: 0xb08d3f, sutra: 0x3f63a8,
  tantra: 0xa33f3a, island: 0x4f7f6a, field: 0xd9d2c0, axis: 0xe0bb54
};

const TAU = Math.PI * 2;

// Where a square stands, when the model has nowhere to put it.
export const SPIRAL = { turns: 3.25, phase: 0.18 };

/* How far off the spiral each band stands. The spiral carries the board's
   order; the radius still says which route a square belongs to, so the two
   ascents remain separable by eye where they run side by side. */
const BAND_RADIUS = {
  below: 1.00, ground: 1.08, sutra: 0.90, tantra: 1.10,
  island: 1.26, field: 1.16, axis: 0.52, anchored: 1.00
};

/* One rising spiral, read in the board's own order: square 1 below the golden
   ground at the widest turn, square 104 on the axis above the summit, and the
   hundred and two between them winding up and inward. Nothing in the Meru
   system has this shape — it is the board's shape, not the world's, which is
   why it is drawn as a path through the world rather than as part of it. */
export function seamPosition(square, ctx) {
  const { RIM, FLOOR, SUMMIT } = ctx;
  const { band, n } = square;
  const t = (n - 1) / 103;
  const rise = FLOOR * 1.15 + t * (SUMMIT * 2.55 - FLOOR * 1.15);
  const radius = RIM * (1.30 - 1.02 * Math.pow(t, 0.85)) * (BAND_RADIUS[band] || 1);
  const angle = (SPIRAL.phase + t * SPIRAL.turns) * TAU;
  return { x: Math.cos(angle) * radius, y: rise, z: Math.sin(angle) * radius };
}

// One marker per square. Anchored squares float their marker above whatever
// the model already draws for them; the rest stand on the armature above.
export function createBoardLayer(THREE, ctx) {
  const group = new THREE.Group();
  group.name = 'rebirth_board';
  group.visible = false;

  const mats = {};
  for (const [band, color] of Object.entries(BAND_COLOUR)) {
    mats[band] = new THREE.MeshStandardMaterial({
      color, roughness: 0.36, metalness: 0.55,
      emissive: new THREE.Color(color).multiplyScalar(0.10)
    });
  }
  const pick = new THREE.MeshBasicMaterial({ visible: false });
  const markGeo = new THREE.OctahedronGeometry(ctx.SUMMIT * 0.022, 0);
  const pickGeo = new THREE.SphereGeometry(ctx.SUMMIT * 0.055, 8, 6);
  // a plinth under each mark, so a square reads as somewhere to stand
  const plinthGeo = new THREE.CylinderGeometry(ctx.SUMMIT * 0.036, ctx.SUMMIT * 0.040, ctx.SUMMIT * 0.008, 12);
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0xb08d3f, roughness: 0.5, metalness: 0.55 });

  const nodes = new Map();
  for (const s of SQUARES) {
    const holder = new THREE.Group();
    holder.name = 'rebirth_node_' + s.n;
    const mark = new THREE.Mesh(markGeo, mats[s.band]);
    mark.name = 'rebirth_square_' + s.n;
    mark.userData.square = s.n;
    mark.castShadow = false;
    mark.receiveShadow = false;
    mark.position.y = ctx.SUMMIT * 0.030;
    holder.add(mark);
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.name = 'rebirth_plinth_' + s.n;
    holder.add(plinth);
    const hit = new THREE.Mesh(pickGeo, pick);
    hit.name = 'rebirth_square_' + s.n;
    hit.userData.square = s.n;
    hit.userData.pickOnly = true;
    holder.add(hit);
    if (!s.anchor) {
      const p = seamPosition(s, ctx);
      holder.position.set(p.x, p.y, p.z);
    }
    group.add(holder);
    nodes.set(s.n, holder);
  }

  /* One standing marker per player, always present and always readable. A
     single travelling token could not say who was where, and against a model
     this busy a bare cone disappears — so each player gets a stem that lifts
     the head clear of whatever it is standing on, a ring on the ground beneath
     it to say which square that is, and a colour of their own. */
  const tokens = PLAYER_COLOURS.map((hex, i) => {
    const holder = new THREE.Group();
    holder.name = 'rebirth_player_' + (i + 1);
    holder.visible = false;
    const colour = new THREE.Color(hex);
    const skin = new THREE.MeshStandardMaterial({
      color: colour, roughness: 0.3, metalness: 0.45,
      emissive: colour.clone().multiplyScalar(0.45)
    });
    const stemH = ctx.SUMMIT * 0.16;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(ctx.SUMMIT * 0.006, ctx.SUMMIT * 0.008, stemH, 6), skin);
    stem.position.y = stemH / 2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(ctx.SUMMIT * 0.038, 16, 12), skin);
    head.position.y = stemH + ctx.SUMMIT * 0.030;
    // a flag off the head, so the marker reads as a marker from any angle
    const flag = new THREE.Mesh(new THREE.ConeGeometry(ctx.SUMMIT * 0.030, ctx.SUMMIT * 0.072, 4), skin);
    flag.position.set(ctx.SUMMIT * 0.030, stemH + ctx.SUMMIT * 0.030, 0);
    flag.rotation.z = -Math.PI / 2;
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(ctx.SUMMIT * 0.052, ctx.SUMMIT * 0.076, 24),
      new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.62, side: THREE.DoubleSide,
        depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = ctx.SUMMIT * 0.002;
    // the player whose turn it is carries a second, wider ring
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(ctx.SUMMIT * 0.090, ctx.SUMMIT * 0.108, 28),
      new THREE.MeshBasicMaterial({ color: colour, transparent: true, opacity: 0.5, side: THREE.DoubleSide,
        depthWrite: false })
    );
    halo.rotation.x = -Math.PI / 2;
    halo.position.y = ctx.SUMMIT * 0.002;
    halo.visible = false;
    holder.add(stem, head, flag, ring, halo);
    holder.userData = { player: i, halo, head, skin };
    group.add(holder);
    return holder;
  });

  /* Put every player on the board. Players sharing a square are fanned apart
     so that neither is hidden inside the other. */
  function placeTokens(players, turn) {
    const crowd = new Map();
    players.forEach((p) => crowd.set(p.pos, (crowd.get(p.pos) || 0) + 1));
    const seen = new Map();
    tokens.forEach((holder, i) => {
      const player = players[i];
      holder.visible = !!player;
      if (!player) return;
      const at = positionOf(player.pos);
      if (!at) return;
      const n = seen.get(player.pos) || 0;
      seen.set(player.pos, n + 1);
      const total = crowd.get(player.pos) || 1;
      const spread = total > 1 ? ctx.SUMMIT * 0.075 : 0;
      const angle = (n / Math.max(1, total)) * Math.PI * 2;
      holder.position.set(at.x + Math.cos(angle) * spread, at.y, at.z + Math.sin(angle) * spread);
      holder.userData.halo.visible = player.i === turn;
    });
  }

  /* Where a square can take you. Six faces at most, drawn as thin lines from
     the square to each destination — enough to see that a throw from here
     reaches there, faint enough not to compete with the world underneath. */
  const links = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x7a5a2e, transparent: true, opacity: 0.42, depthWrite: false })
  );
  links.name = 'rebirth_links';
  links.frustumCulled = false;
  links.visible = false;
  group.add(links);

  function showLinks(square) {
    const row = square === null ? null : MOVES[square];
    const from = square === null ? null : positionOf(square);
    if (!row || !from) { links.visible = false; return []; }
    const reached = [];
    const points = [];
    for (const face of FACES) {
      const to = row[face];
      if (!to) continue;
      const at = positionOf(to);
      if (!at) continue;
      reached.push(to);
      points.push(from.x, from.y, from.z, at.x, at.y, at.z);
    }
    links.geometry.dispose();
    links.geometry = new THREE.BufferGeometry();
    links.geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    links.visible = points.length > 0;
    return reached;
  }

  // Anchored squares need the live scene to tell them where their subject is.
  function placeAnchored(positionOfEntry) {
    for (const s of SQUARES) {
      if (!s.anchor) continue;
      const p = positionOfEntry(s.anchor);
      const holder = nodes.get(s.n);
      if (p) holder.position.set(p.x, p.y + ctx.SUMMIT * 0.055, p.z);
      else holder.position.copy(vec(THREE, seamPosition(s, ctx)));
      holder.userData.anchored = !!p;
    }
  }

  function positionOf(n) {
    const h = nodes.get(n);
    return h ? h.position : null;
  }

  return { group, nodes, tokens, links, showLinks, placeTokens, placeAnchored, positionOf, materials: mats };
}

function vec(THREE, p) { return new THREE.Vector3(p.x, p.y, p.z); }
