// The game of rebirth, as a layer over the world system.
//
// The 1977 board is 104 squares in 13 rows of 8, numbered right to left and
// rising from the bottom. Read as a vertical section it is already a cosmology:
// the row is height above or below the golden ground, and the column separates
// the two great routes — tantra on the right of the board, the sutra path on
// the left. Twenty-three of its squares name something the Abhidharma model
// already builds, and those bind to the existing geometry by entry id. The
// remaining eighty-one are paths, attainments, sacred lands and Buddha fields,
// which the sources place outside the Meru world system; they have no
// coordinate in it, so this layer gives them one.

export const BOARD = {"squares":[{"n":1,"name":"Vajra Hell","row":0,"col":0,"cat":"Hell states","anchor":null,"band":"below"},{"n":2,"name":"Interminable Hell","row":0,"col":1,"cat":"Hell states","anchor":"avichi","band":"anchored"},{"n":3,"name":"The Hot and Very Hot Hells","row":0,"col":2,"cat":"Hell states","anchor":"tapana","band":"anchored"},{"n":4,"name":"The Howling and Great Howling Hells","row":0,"col":3,"cat":"Hell states","anchor":"raurava","band":"anchored"},{"n":5,"name":"The Black Rope and Crushing Hells","row":0,"col":4,"cat":"Hell states","anchor":"kalasutra","band":"anchored"},{"n":6,"name":"Reviving Hell","row":0,"col":5,"cat":"Hell states","anchor":"sanjiva","band":"anchored"},{"n":7,"name":"The Cold Hells","row":0,"col":6,"cat":"Hell states","anchor":"arbuda","band":"anchored"},{"n":8,"name":"The Temporary Hells, or “Hell for a Day”","row":0,"col":7,"cat":"Hell states","anchor":null,"band":"below"},{"n":9,"name":"Lord of the Dead (Yama)","row":1,"col":0,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":10,"name":"Hungry Ghosts (Preta)","row":1,"col":1,"cat":"Hungry ghosts","anchor":"preta_realm","band":"anchored"},{"n":11,"name":"Animals","row":1,"col":2,"cat":"Animals","anchor":"animals","band":"anchored"},{"n":12,"name":"Divine Animals","row":1,"col":3,"cat":"Animals","anchor":null,"band":"below"},{"n":13,"name":"World of the Nāgas","row":1,"col":4,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":14,"name":"Demon Island","row":1,"col":5,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":15,"name":"Asuras","row":1,"col":6,"cat":"Underworld beings and spirits","anchor":"asuras","band":"anchored"},{"n":16,"name":"Rudra Black Freedom","row":1,"col":7,"cat":"Underworld beings and spirits","anchor":null,"band":"below"},{"n":17,"name":"Jambu Island—The Southern Continent","row":2,"col":0,"cat":"Human continents","anchor":"continent_jambudvipa","band":"anchored"},{"n":18,"name":"The Western Continent—Enjoyment of Cattle (Apara-Godānīya)","row":2,"col":1,"cat":"Human continents","anchor":"continent_aparagodaniya","band":"anchored"},{"n":19,"name":"The Eastern Continent—Noble Figure (Pūrva-Videha)","row":2,"col":2,"cat":"Human continents","anchor":"continent_purvavideha","band":"anchored"},{"n":20,"name":"The Northern Continent—Kuru","row":2,"col":3,"cat":"Human continents","anchor":"continent_uttarakuru","band":"anchored"},{"n":21,"name":"Barbarism","row":2,"col":4,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":22,"name":"Hinduism","row":2,"col":5,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":23,"name":"Bön","row":2,"col":6,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":24,"name":"The Heavenly Highway","row":2,"col":7,"cat":"Starting position","anchor":null,"band":"ground"},{"n":25,"name":"Beginning the Tantra","row":3,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":26,"name":"Wheel-Turning King (Cakravartin)","row":3,"col":1,"cat":"Universal sovereignty","anchor":null,"band":"ground"},{"n":27,"name":"Heaven of the Four Great Kings","row":3,"col":2,"cat":"Heavens of sense desire","anchor":"meru_terrace_4","band":"anchored"},{"n":28,"name":"Heaven of the Thirty-three (Trāyatriṁśa)","row":3,"col":3,"cat":"Heavens of sense desire","anchor":"sudarshana_city","band":"anchored"},{"n":29,"name":"Heaven Without Fighting (Yāma)","row":3,"col":4,"cat":"Heavens of sense desire","anchor":"heaven_yama","band":"anchored"},{"n":30,"name":"The Joyful (Tuṣita) Heaven","row":3,"col":5,"cat":"Heavens of sense desire","anchor":"heaven_tushita","band":"anchored"},{"n":31,"name":"Delighting in Emanations (Nirmāṇa-rati)","row":3,"col":6,"cat":"Heavens of sense desire","anchor":"heaven_nirmanarati","band":"anchored"},{"n":32,"name":"Ruling the Emanations of Others (Paranirmita-Vaśavartin)","row":3,"col":7,"cat":"Heavens of sense desire","anchor":"heaven_paranirmitavashavartin","band":"anchored"},{"n":33,"name":"Tantra, Lesser Path of Accumulation","row":4,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":34,"name":"Mahākāla","row":4,"col":1,"cat":"Dharma protector","anchor":null,"band":"tantra"},{"n":35,"name":"The Realm of Form (Rūpa-Dhātu)","row":4,"col":2,"cat":"Realm of Form","anchor":"heaven_brahmaparishadya","band":"anchored"},{"n":36,"name":"The Formless Realm (Arūpa-Dhātu)","row":4,"col":3,"cat":"Formless Realm","anchor":"akashanantyayatana","band":"anchored"},{"n":37,"name":"Pure Abodes (Śuddhāvāsa)","row":4,"col":4,"cat":"Realm of Form","anchor":"heaven_avriha","band":"anchored"},{"n":38,"name":"Disciples (Śrāvaka), Path of Accumulation (Sambhāra-Mārga)","row":4,"col":5,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":39,"name":"Disciples, Path of Application (Prayoga-Mārga)","row":4,"col":6,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":40,"name":"Disciples, Paths of Vision and Cultivation (Darśana-Mārga, Bhāvanā-Mārga)","row":4,"col":7,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":41,"name":"Tantra, Middle Path of Accumulation","row":5,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":42,"name":"Tantra, Greater Path of Accumulation","row":5,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":43,"name":"Independent Buddha (Pratyeka-Buddha), Path of Accumulation","row":5,"col":2,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":44,"name":"Independent Buddha, Path of Application","row":5,"col":3,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":45,"name":"Independent Buddha, Path of Vision","row":5,"col":4,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":46,"name":"Independent Buddha, Path of Cultivation","row":5,"col":5,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":47,"name":"Independent Buddha, Arhatship","row":5,"col":6,"cat":"Independent Buddha path","anchor":null,"band":"sutra"},{"n":48,"name":"Cessation (Nirodha)","row":5,"col":7,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":49,"name":"Tantra, Path of Application: “Heat”","row":6,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":50,"name":"Tantra, Path of Application: “Climax”","row":6,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":51,"name":"Disciples, Arhatship","row":6,"col":2,"cat":"Vehicle of Disciples","anchor":null,"band":"sutra"},{"n":52,"name":"Mahāyāna, Lesser Path of Accumulation","row":6,"col":3,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":53,"name":"Mahāyāna, Middle Path of Accumulation","row":6,"col":4,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":54,"name":"Mahāyāna, Greater Path of Accumulation","row":6,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":55,"name":"Mahāyāna, Path of Application: “Heat” (Ūṣman)","row":6,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":56,"name":"Mahāyāna, Path of Application: “Climax” (Mūrdhan)","row":6,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":57,"name":"Tantra, Path of Application: “Receptivity”","row":7,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":58,"name":"Tantra, Path of Application: “Highest Teachings”","row":7,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":59,"name":"Shambhala","row":7,"col":2,"cat":"Mythic and sacred lands","anchor":null,"band":"island"},{"n":60,"name":"Potāla","row":7,"col":3,"cat":"Mythic and sacred lands","anchor":null,"band":"island"},{"n":61,"name":"Urgyan (Uḍḍiyāna)","row":7,"col":4,"cat":"Mythic and sacred lands","anchor":null,"band":"island"},{"n":62,"name":"Hindu Wisdom-Holder (Vidyādhara)","row":7,"col":5,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":63,"name":"Mahāyāna, Path of Application: “Receptivity” (Kṣānti)","row":7,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":64,"name":"Mahāyāna, Path of Application: “Highest Teachings” (Laukikāgra-Dharma)","row":7,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":65,"name":"Wisdom-Holder of the Bön Tradition (*Bön Vidyādhara)","row":8,"col":0,"cat":"Non-Buddhist traditions as represented in the book","anchor":null,"band":"ground"},{"n":66,"name":"First Tantra Stage","row":8,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":67,"name":"Wisdom-Holder Among the Gods of Sense Desire (*Kāmadeva-Vidyādhara)","row":8,"col":2,"cat":"Wisdom-holder attainments","anchor":null,"band":"tantra"},{"n":68,"name":"Wisdom-Holder of the Realm of Form (*Rūpa-Dhātu-Vidyādhara)","row":8,"col":3,"cat":"Wisdom-holder attainments","anchor":null,"band":"tantra"},{"n":69,"name":"Tantric Wheel-Turning King (*Mantra-Cakravartin)","row":8,"col":4,"cat":"Universal sovereignty","anchor":null,"band":"ground"},{"n":70,"name":"Realm of Action-Completion (*Karma-Paripūraṇa)","row":8,"col":5,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":71,"name":"First Sutra Stage (Bhūmi)","row":8,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":72,"name":"Wisdom-Holder of the Eight Siddhis","row":8,"col":7,"cat":"Wisdom-holder attainments","anchor":null,"band":"tantra"},{"n":73,"name":"Second Tantra Stage","row":9,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":74,"name":"Third Tantra Stage","row":9,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":75,"name":"Fourth Tantra Stage","row":9,"col":2,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":76,"name":"Realm of Jeweled Peaks (Ratna-Kūṭa)","row":9,"col":3,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":77,"name":"Land of Bliss (Sukhāvatī)","row":9,"col":4,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":78,"name":"Fourth Sutra Stage","row":9,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":79,"name":"Third Sutra Stage","row":9,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":80,"name":"Second Sutra Stage","row":9,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":81,"name":"Fifth Tantra Stage","row":10,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":82,"name":"Sixth Tantra Stage","row":10,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":83,"name":"Seventh Tantra Stage","row":10,"col":2,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":84,"name":"Supreme Heaven (Akaniṣṭha)","row":10,"col":3,"cat":"Buddha fields","anchor":"heaven_akanishtha","band":"anchored"},{"n":85,"name":"Realm of Superjoy (Abhirati)","row":10,"col":4,"cat":"Buddha fields","anchor":null,"band":"field"},{"n":86,"name":"Seventh Sutra Stage","row":10,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":87,"name":"Sixth Sutra Stage","row":10,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":88,"name":"Fifth Sutra Stage","row":10,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":89,"name":"Eighth Tantra Stage","row":11,"col":0,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":90,"name":"Ninth Tantra Stage","row":11,"col":1,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":91,"name":"Tenth Tantra Stage","row":11,"col":2,"cat":"Tantric path","anchor":null,"band":"tantra"},{"n":92,"name":"Great Enjoyment Body (Sambhoga-Kāya)","row":11,"col":3,"cat":"Buddha bodies","anchor":null,"band":"axis"},{"n":93,"name":"Great Dharma Body (Dharma-Kāya)","row":11,"col":4,"cat":"Buddha bodies","anchor":null,"band":"axis"},{"n":94,"name":"Tenth Sutra Stage","row":11,"col":5,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":95,"name":"Ninth Sutra Stage","row":11,"col":6,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":96,"name":"Eighth Sutra Stage","row":11,"col":7,"cat":"Mahāyāna sutra path","anchor":null,"band":"sutra"},{"n":97,"name":"Adopting a Physical Form","row":12,"col":0,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":98,"name":"The Setting Forth (Pravrajita)","row":12,"col":1,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":99,"name":"Ascetic Practices (Tapas)","row":12,"col":2,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":100,"name":"Conquest of Māra","row":12,"col":3,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":101,"name":"Buddhahood","row":12,"col":4,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":102,"name":"Turning the Wheel of Dharma","row":12,"col":5,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":103,"name":"Demonstration of Miracles","row":12,"col":6,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"},{"n":104,"name":"Nirvana","row":12,"col":7,"cat":"Acts of the Emanation body","anchor":null,"band":"axis"}],"moves":{"2":{"one":17,"two":10,"three":3},"3":{"one":11,"two":10,"three":8,"four":7,"five":5,"six":2},"4":{"one":13,"two":10,"three":8,"four":6,"five":5,"six":3},"5":{"one":13,"two":11,"three":10,"four":7,"five":4,"six":3},"6":{"one":17,"two":12,"three":10,"four":8,"five":5,"six":4},"7":{"one":15,"two":18,"three":11,"four":10,"five":6,"six":5},"8":{"one":27,"two":19,"three":14,"four":11,"five":7,"six":6},"9":{"one":42,"two":34},"10":{"one":19,"two":13,"three":14,"four":11,"five":8,"six":4},"11":{"one":27,"two":17,"three":12,"four":13,"five":10,"six":5},"12":{"one":28,"two":27,"three":15,"four":21,"five":11,"six":10},"13":{"one":28,"two":27,"three":15,"four":21,"five":11,"six":10},"14":{"one":25,"two":42,"three":17,"four":15,"five":5,"six":3},"15":{"one":28,"two":14,"three":21,"four":11,"five":10,"six":4},"16":{"two":34},"17":{"one":52,"two":25,"three":26,"four":38,"five":22,"six":6},"18":{"one":38,"two":27,"three":13,"four":21,"five":11,"six":10},"19":{"one":43,"two":38,"three":13,"four":15,"five":13,"six":11},"20":{"one":28,"two":27,"three":17,"four":19,"five":15},"21":{"one":15,"two":62,"three":13,"four":11,"five":10,"six":2},"22":{"one":52,"two":62,"three":13,"four":15,"five":11,"six":3},"23":{"one":52,"two":65,"three":29,"four":27,"five":14,"six":4},"24":{"one":27,"two":17,"three":15,"four":11,"five":10,"six":6},"25":{"one":72,"two":33,"six":38},"26":{"one":29,"two":28,"three":17,"four":20,"five":13,"six":13},"27":{"one":28,"two":17,"three":23,"four":18,"five":10,"six":6},"28":{"one":29,"two":17,"three":20,"four":22,"five":11,"six":7},"29":{"one":30,"two":31,"three":17,"four":23,"five":12,"six":10},"30":{"one":64,"two":63,"three":55,"four":54,"five":53,"six":52},"31":{"one":52,"two":30,"three":43,"four":32,"five":22,"six":12},"32":{"one":30,"two":35,"three":28,"four":18,"five":10},"33":{"one":41,"two":42,"five":16,"six":1},"34":{"one":61,"two":81,"three":70},"35":{"one":37,"two":52,"three":36,"four":30,"five":17,"six":27},"36":{"one":38,"two":17,"three":11,"six":4},"37":{"one":64,"two":54,"three":32,"four":52,"five":12},"38":{"one":37,"two":40,"three":39,"four":52,"five":11,"six":5},"39":{"one":52,"two":43,"three":40,"four":52,"five":28,"six":19},"40":{"one":30,"two":35,"three":28,"four":32,"five":31,"six":29},"41":{"one":60,"two":42,"three":59,"five":67,"six":33},"42":{"one":49,"two":50,"six":59},"43":{"one":52,"two":44,"three":28,"four":38,"five":13,"six":6},"44":{"one":30,"two":46,"three":45,"four":20,"five":39,"six":27},"45":{"one":52,"two":47,"three":46,"four":40,"five":17,"six":28},"46":{"one":30,"two":47,"three":37,"four":35,"five":51,"six":29},"47":{"one":52,"two":48,"three":30,"four":37},"49":{"one":50,"two":57},"50":{"one":57,"two":66},"51":{"one":52,"two":48,"three":37},"52":{"one":54,"two":53,"three":30,"four":38,"five":11,"six":7},"53":{"one":55,"two":54,"three":37,"four":40,"five":15,"six":8},"54":{"one":63,"two":55,"three":60,"four":59},"55":{"one":63,"two":56},"56":{"one":64,"two":63},"57":{"one":66,"two":73,"three":58,"four":77},"58":{"one":73,"two":74,"three":66,"four":85},"59":{"one":63,"two":50,"three":60,"four":49,"five":42,"six":55},"60":{"one":64,"two":63,"three":42},"61":{"one":89,"two":84,"three":83},"62":{"one":52,"two":38},"63":{"one":85,"two":42,"three":64,"four":77},"64":{"one":71,"two":49,"five":77},"65":{"one":52,"two":43,"five":15,"six":8},"66":{"one":74,"two":75,"three":73},"67":{"one":41,"two":42,"three":68,"four":69},"68":{"one":42,"two":49,"four":59,"six":41},"69":{"one":75,"two":81},"70":{"one":86,"two":73,"four":34,"five":74,"six":71},"71":{"one":79,"two":80,"three":74},"72":{"one":67,"two":41,"three":33},"73":{"one":75,"two":81,"six":69},"74":{"one":75,"two":81},"75":{"one":82,"two":83,"three":81},"76":{"one":78,"two":74,"three":73},"77":{"one":71,"two":74},"78":{"one":87,"two":88},"79":{"one":88,"two":78},"80":{"one":78,"two":79},"81":{"one":83,"two":89},"82":{"one":89,"two":90},"83":{"one":84,"two":91},"84":{"one":93},"85":{"one":73,"two":73,"three":76},"86":{"one":95,"two":96},"87":{"one":96,"two":86},"88":{"one":95,"two":87},"89":{"one":84,"two":90},"90":{"one":84,"two":91},"91":{"one":84,"two":93},"92":{"one":97},"93":{"one":92},"94":{"one":93,"two":84},"95":{"one":94,"two":84},"96":{"one":94,"two":95},"97":{"one":98,"two":98},"98":{"one":99,"two":99},"99":{"one":100,"two":100},"100":{"one":101,"two":101},"101":{"one":102,"two":102},"102":{"one":103,"two":103},"103":{"one":104,"two":104}},"special":{"104":{"kind":"terminal","note":"one or two passes the relics into the stupa"},"48":{"kind":"tally","exit_to":52},"1":{"kind":"tally","exit_to":9}},"start":24,"victory":104,"quota":{"one":1,"two":2,"three":3,"four":4,"five":5,"six":6},"quotaNote64":{"one":1,"two":2,"three":6,"four":3,"five":5,"six":4}};


export const SQUARES = BOARD.squares;
export const MOVES = BOARD.moves;
export const SPECIAL = BOARD.special;
export const START = BOARD.start;
export const VICTORY = BOARD.victory;
export const TRAP_QUOTA = BOARD.quota;
export const TRAP_QUOTA_NOTE64 = BOARD.quotaNote64;
export const FACES = ['one', 'two', 'three', 'four', 'five', 'six'];

export const BY_N = new Map(SQUARES.map(s => [s.n, s]));

// Band colours follow the world's own palette: gold for what rises, lapis for
// the sutra route, cinnabar for tantra, white for the fields beyond the rim.
export const BAND_COLOUR = {
  anchored: 0xc9a227, below: 0x7d4a3a, ground: 0xb08d3f, sutra: 0x3f63a8,
  tantra: 0xa33f3a, island: 0x4f7f6a, field: 0xd9d2c0, axis: 0xe0bb54
};

const TAU = Math.PI * 2;

// Where a square stands, when the model has nowhere to put it.
export function seamPosition(square, ctx) {
  const { RIM, FLOOR, SUMMIT } = ctx;
  const { row, col, band, n } = square;
  const lift = row / 12;
  const y = FLOOR * 0.55 + lift * (SUMMIT * 2.15 - FLOOR * 0.55);
  const spread = (col + 0.5) / 8;
  switch (band) {
    case 'below':
      return polar(RIM * (0.26 + row * 0.05) + spread * RIM * 0.20,
                   (spread + row * 0.11) * TAU,
                   FLOOR * (1.30 - row * 0.10 + spread * 0.35));
    case 'ground':
      return polar(RIM * (1.02 + row * 0.03),
                   (0.62 + spread * 0.50 + row * 0.07) * TAU,
                   SUMMIT * (0.05 + row * 0.02) + spread * SUMMIT * 0.05);
    case 'sutra':
      return polar(RIM * (0.80 + lift * 0.30), (0.52 + spread * 0.20 + lift * 0.06) * TAU, y);
    case 'tantra':
      return polar(RIM * (0.80 + lift * 0.30), (0.02 + spread * 0.20 + lift * 0.06) * TAU, y);
    case 'island':
      return polar(RIM * 1.34, (0.30 + (n - 59) * 0.14) * TAU, SUMMIT * 0.10);
    case 'field':
      return polar(RIM * 1.18, (0.16 + spread * 0.68) * TAU, SUMMIT * (1.25 + lift * 0.5));
    case 'axis':
      return polar(SUMMIT * 0.10 * (n % 2 ? 1 : -1), (n * 0.37) * TAU, SUMMIT * (1.35 + (n - 92) * 0.135));
    default:
      return polar(RIM * 0.9, spread * TAU, y);
  }
  function polar(r, a, h) { return { x: Math.cos(a) * r, y: h, z: Math.sin(a) * r }; }
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
  const markGeo = new THREE.OctahedronGeometry(ctx.SUMMIT * 0.020, 0);
  const pickGeo = new THREE.SphereGeometry(ctx.SUMMIT * 0.055, 8, 6);

  const nodes = new Map();
  for (const s of SQUARES) {
    const holder = new THREE.Group();
    holder.name = 'rebirth_node_' + s.n;
    const mark = new THREE.Mesh(markGeo, mats[s.band]);
    mark.name = 'rebirth_square_' + s.n;
    mark.userData.square = s.n;
    mark.castShadow = false;
    mark.receiveShadow = false;
    holder.add(mark);
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

  // A token that travels the board.
  const token = new THREE.Mesh(
    new THREE.ConeGeometry(ctx.SUMMIT * 0.022, ctx.SUMMIT * 0.062, 6),
    new THREE.MeshStandardMaterial({
      color: 0xf0d27a, roughness: 0.22, metalness: 0.8,
      emissive: new THREE.Color(0xf0d27a).multiplyScalar(0.25)
    })
  );
  token.name = 'rebirth_token';
  group.add(token);

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

  return { group, nodes, token, placeAnchored, positionOf, materials: mats };
}

function vec(THREE, p) { return new THREE.Vector3(p.x, p.y, p.z); }
