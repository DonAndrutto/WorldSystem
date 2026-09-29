/* The twenty-eight lunar mansions (rgyu skar), after Sangye Gyatso's
 * White Beryl (Phug tradition), as audited in docs/WHITE-BERYL-LUNAR-MANSIONS.md
 * from the supplied OCR (raw lines in docs/WHITE-BERYL-SOURCE-EXTRACTS.txt).
 *
 * This is the Tibetan catalogue and nothing else. The Indian Jyotiṣa
 * calculator (jyotisha.js) keeps its own 27-sector sequence and its own
 * Vimshottari lords, and reaches this catalogue only through explicit ids.
 * Nothing here is astronomical geometry: the ring the world draws is an
 * illustrative arrangement by the source's elemental directions.
 *
 * Every association is its own field, because the source treats them as
 * different facts. The four-element list (Indian style) and the five-element
 * list (Chinese style) are separate classifications (L p. 334); the planetary
 * ruler (L p. 376, four mansions to each of seven) is not the deity each
 * mansion's own passage names; and the elemental direction (U pp. 257–258)
 * is a traditional arrangement, not a longitude.
 *
 * Provenance. 'primary' means the textual form is read in the supplied White
 * Beryl OCR. 'secondary' marks the four entries whose opening line is lost
 * there (snar ma, skag, nag pa, khrums smad): their forms follow the
 * secondary Tibetan table the audit cites, pending the page images. A star
 * count that is not legible in the OCR is null in `stars.readable`, and any
 * secondary figure is kept apart in `stars.secondary`.
 *
 * Line numbers are those of the lower volume L (UTIE0OPI51524892_I1KG12907),
 * pages its printed footers. Forms are working translations from the audit.
 */

export const CATALOGUE_SOURCE = {
  title: 'White Beryl (Vaiḍūrya dkar po), Phug tradition',
  author: 'Desi Sangye Gyatso',
  mipham: 'nag rtsis brjed byang snying po gsal ba, by Mipham, appended to the lower volume (L p. 474 ff.)',
  count: 'U p. 18, lines 607–608: twenty-eight; gro bzhin and byi bzhin share one allotment, giving twenty-seven when combined.',
  elements: 'L p. 334, lines 10799–10812 (four- and five-element lists)',
  directions: 'U pp. 257–258, lines 9430–9443 (elemental directions)',
  rulers: 'L p. 376, lines 12168–12173 (seven planetary rulers, four mansions each)'
};

/* the seven rulers of L:12168–12173, and the texts' names for them */
export const RULERS = {
  mars:    { en: 'Mars',    wylie: 'mig dmar', tibetan: 'མིག་དམར་' },
  mercury: { en: 'Mercury', wylie: 'lhag pa',  tibetan: 'ལྷག་པ་' },
  jupiter: { en: 'Jupiter', wylie: 'phur bu',  tibetan: 'ཕུར་བུ་' },
  venus:   { en: 'Venus',   wylie: 'pa sangs', tibetan: 'པ་སངས་' },
  saturn:  { en: 'Saturn',  wylie: 'spen pa',  tibetan: 'སྤེན་པ་' },
  sun:     { en: 'Sun',     wylie: 'nyi ma',   tibetan: 'ཉི་མ་' },
  moon:    { en: 'Moon',    wylie: 'zla ba',   tibetan: 'ཟླ་བ་' }
};

/* the eight directions of U:9430–9443, and where they are in the world:
   south is +z and east +x, as the continents and the luminaries have it */
export const DIRECTIONS = {
  E:  { en: 'East' },       SE: { en: 'Southeast' },
  S:  { en: 'South' },      SW: { en: 'Southwest' },
  W:  { en: 'West' },       NW: { en: 'Northwest' },
  N:  { en: 'North' },      NE: { en: 'Northeast' }
};

export const ELEMENTS_FOUR = ['wind', 'fire', 'water', 'earth'];
export const ELEMENTS_FIVE = ['wood', 'fire', 'earth', 'iron', 'water'];

/* A deity is what the mansion's own passage names as its god (lha). Its
   status says how far the OCR carries the reading: 'clear', 'uncertain' (a
   gap or an unclear division inside the clause) or 'damaged' (the words are
   cut off), and null where the opening that would name it is lost. */
const deity = (wylie, tibetan, gloss, status = 'clear', note = '') => ({ wylie, tibetan, gloss, status, note });

const m = (o) => Object.freeze({ ...o, stars: Object.freeze(o.stars), form: Object.freeze(o.form),
  deity: o.deity ? Object.freeze(o.deity) : null, source: Object.freeze(o.source),
  aliases: Object.freeze((o.aliases || []).map(Object.freeze)) });

export const MANSIONS = Object.freeze([
  m({ id: 'lm_tha_skar', order: 1, wylie: 'tha skar', tibetan: 'ཐ་སྐར་', sanskrit: 'Aśvinī',
      aliases: [{ wylie: 'dbyu gu', tibetan: 'དབྱུ་གུ་', note: 'the name the L entry and the direction list use; given as an alias in U pp. 18–19' }],
      stars: { readable: 3, secondary: null },
      form: { en: 'Horse head and neck', source: 'རྟ་མགོའི་མགུལ', provenance: 'primary' },
      fourElement: 'wind', fiveElement: 'water', direction: 'N', ruler: 'sun',
      deity: deity('rta lha / dri za', '', '', 'uncertain',
        'OCR reads “dus ni rta ‹gap› lha dri za”: either rta lha (horse deities) or dri za (gandharva) may be the god named; the page image decides.'),
      source: { line: 10130, page: 313 }, provenance: 'primary' }),
  m({ id: 'lm_bra_nye', order: 2, wylie: 'bra nye', tibetan: 'བྲ་ཉེ་', sanskrit: 'Bharaṇī',
      stars: { readable: 3, secondary: null },
      form: { en: 'Vulva (female genital form)', source: 'མོ་མཚན་དབྱིབས', provenance: 'primary' },
      fourElement: 'fire', fiveElement: 'earth', direction: 'NE', ruler: 'moon',
      deity: deity('gshin rje', 'གཤིན་རྗེ་', 'Yama'),
      source: { line: 10148, page: 314 }, provenance: 'primary',
      readingNote: 'U:9443 places bra nye in the northeast, correcting the secondary table’s northwest.' }),
  m({ id: 'lm_smin_drug', order: 3, wylie: 'smin drug', tibetan: 'སྨིན་དྲུག་', sanskrit: 'Kṛttikā',
      stars: { readable: 6, secondary: null },
      form: { en: 'Razor', source: 'སྤུ་གྲིའི་དབྱིབས', provenance: 'primary' },
      fourElement: 'fire', fiveElement: 'wood', direction: 'E', ruler: 'mars',
      deity: deity('me lha', 'མེ་ལྷ་', 'Agni, the fire god'),
      source: { line: 10168, page: 314 }, provenance: 'primary' }),
  m({ id: 'lm_snar_ma', order: 4, wylie: 'snar ma', tibetan: 'སྣར་མ་', sanskrit: 'Rohiṇī',
      stars: { readable: null, secondary: 5 },
      form: { en: 'Cart', source: '', provenance: 'secondary',
        note: 'The opening line is lost in the OCR; the cart follows the secondary Tibetan table.' },
      fourElement: 'earth', fiveElement: 'wood', direction: 'E', ruler: 'mercury',
      deity: null,
      source: { line: 10185, page: 315 }, provenance: 'secondary' }),
  m({ id: 'lm_mgo', order: 5, wylie: 'mgo', tibetan: 'མགོ་', sanskrit: 'Mṛgaśīrṣa',
      stars: { readable: 3, secondary: null },
      form: { en: 'Deer head', source: 'རི་དྭགས་མགོ', provenance: 'primary' },
      fourElement: 'wind', fiveElement: 'wood', direction: 'E', ruler: 'jupiter',
      deity: deity('zla ba', 'ཟླ་བ་', 'the Moon'),
      source: { line: 10203, page: 315 }, provenance: 'primary' }),
  m({ id: 'lm_lag', order: 6, wylie: 'lag', tibetan: 'ལག་', sanskrit: 'Ārdrā',
      stars: { readable: 1, secondary: null },
      form: { en: 'Point, a circular spot (thig le)', source: 'ཐིག་ལེའི་དབྱིབས', provenance: 'primary' },
      fourElement: 'water', fiveElement: 'wood', direction: 'E', ruler: 'venus',
      deity: deity('gtum drag', 'གཏུམ་དྲག་', 'the Fierce One'),
      source: { line: 10221, page: 316 }, provenance: 'primary' }),
  m({ id: 'lm_nabs_so', order: 7, wylie: 'nabs so', tibetan: 'ནབས་སོ་', sanskrit: 'Punarvasu',
      stars: { readable: 2, secondary: null },
      form: { en: 'Throne leg', source: 'ཁྲི་རྐང་དབྱིབས', provenance: 'primary' },
      fourElement: 'wind', fiveElement: 'wood', direction: 'E', ruler: 'saturn',
      deity: deity('nyi ma’i lha', 'ཉི་མའི་ལྷ་', 'the deity of the sun'),
      source: { line: 10236, page: 316 }, provenance: 'primary' }),
  m({ id: 'lm_rgyal', order: 8, wylie: 'rgyal', tibetan: 'རྒྱལ་', sanskrit: 'Puṣya',
      stars: { readable: null, secondary: 3 },
      form: { en: 'A rounded form', source: 'རིལ་བའི་དབྱིབས', provenance: 'primary',
        note: 'Only the fragment ril ba’i dbyibs survives; a rounded form is a cautious working reading. The earlier “drop” is not a source translation.' },
      fourElement: 'fire', fiveElement: 'wood', direction: 'E', ruler: 'sun',
      deity: deity('phur bu', 'ཕུར་བུ་', 'Jupiter (Bṛhaspati)'),
      source: { line: 10256, page: 317 }, provenance: 'primary',
      readingNote: 'The opening is incomplete: the count is not legible, and the form rests on a fragment.' }),
  m({ id: 'lm_skag', order: 9, wylie: 'skag', tibetan: 'སྐག་', sanskrit: 'Āśleṣā',
      stars: { readable: null, secondary: 6 },
      form: { en: 'Expanded serpent hood', source: '', provenance: 'secondary',
        note: 'The opening line is lost in the OCR; the serpent hood follows the secondary Tibetan table.' },
      fourElement: 'water', fiveElement: 'earth', direction: 'SE', ruler: 'moon',
      deity: deity('lto ’gro', 'ལྟོ་འགྲོ་', 'serpents (“belly-goers”)'),
      source: { line: 10273, page: 317 }, provenance: 'secondary' }),
  m({ id: 'lm_mchu', order: 10, wylie: 'mchu', tibetan: 'མཆུ་', sanskrit: 'Maghā',
      stars: { readable: 6, secondary: null },
      form: { en: 'River', source: 'ཆུ་བོ་འདྲ', provenance: 'primary' },
      fourElement: 'fire', fiveElement: 'fire', direction: 'S', ruler: 'mars',
      deity: deity('spen pa', 'སྤེན་པ་', 'Saturn', 'clear',
        'Saturn is named as deity here while the rulership list assigns Mars: two different roles, both kept.'),
      source: { line: 10291, page: 318 }, provenance: 'primary' }),
  m({ id: 'lm_gre', order: 11, wylie: 'gre', tibetan: 'གྲེ་', sanskrit: 'Pūrvaphalgunī',
      stars: { readable: null, secondary: 2 },
      form: { en: 'Human leg', source: 'མི་རྐང་ལྟ་བུ', provenance: 'primary' },
      fourElement: 'fire', fiveElement: 'fire', direction: 'S', ruler: 'mercury',
      deity: deity('khyab ’jug', 'ཁྱབ་འཇུག་', 'Viṣṇu', 'damaged', 'Read at the head of a damaged line.'),
      source: { line: 10309, page: 319 }, provenance: 'primary',
      readingNote: 'The opening is damaged and the star count is not legible.' }),
  m({ id: 'lm_dbo', order: 12, wylie: 'dbo', tibetan: 'དབོ་', sanskrit: 'Uttaraphalgunī',
      stars: { readable: 2, secondary: null },
      form: { en: 'Throne', source: 'ཁྲི་ཡི་དབྱིབས', provenance: 'primary' },
      fourElement: 'wind', fiveElement: 'fire', direction: 'S', ruler: 'jupiter',
      deity: deity('gshin rje', 'གཤིན་རྗེ་', 'Yama'),
      source: { line: 10327, page: 319 }, provenance: 'primary' }),
  m({ id: 'lm_me_bzhi', order: 13, wylie: 'me bzhi', tibetan: 'མེ་བཞི་', sanskrit: 'Hasta',
      stars: { readable: 5, secondary: null },
      form: { en: 'Hand', source: 'ལག་པའི་དབྱིབས', provenance: 'primary' },
      fourElement: 'wind', fiveElement: 'fire', direction: 'S', ruler: 'venus',
      deity: deity('me …', '', '', 'damaged', 'The deity clause breaks off after “lha me” at the end of L:10345.'),
      source: { line: 10345, page: 320 }, provenance: 'primary',
      readingNote: 'Wind in the four-element list and fire in the five-element list: the source’s two classifications, not a contradiction.' }),
  m({ id: 'lm_nag_pa', order: 14, wylie: 'nag pa', tibetan: 'ནག་པ་', sanskrit: 'Citrā',
      stars: { readable: null, secondary: 1 },
      form: { en: 'Lotus seed-head (fruit)', source: '', provenance: 'secondary',
        note: 'The opening line is lost in the OCR; the lotus fruit follows the secondary Tibetan table.' },
      fourElement: 'wind', fiveElement: 'fire', direction: 'S', ruler: 'saturn',
      deity: deity('nyi ma zla …', '', '', 'damaged', 'The clause “lha ni nyi ma zla” is cut off in L:10363.'),
      source: { line: 10362, page: 320 }, provenance: 'secondary' }),
  m({ id: 'lm_sa_ri', order: 15, wylie: 'sa ri', tibetan: 'ས་རི་', sanskrit: 'Svātī',
      stars: { readable: 1, secondary: null },
      form: { en: 'Jewel', source: 'ནོར་བུའི་དབྱིབས', provenance: 'primary' },
      fourElement: 'wind', fiveElement: 'fire', direction: 'S', ruler: 'sun',
      deity: deity('rlung', 'རླུང་', 'the Wind (Vāyu)'),
      source: { line: 10382, page: 321 }, provenance: 'primary' }),
  m({ id: 'lm_sa_ga', order: 16, wylie: 'sa ga', tibetan: 'ས་ག་', sanskrit: 'Viśākhā',
      stars: { readable: 4, secondary: null },
      form: { en: 'Head: goat head (ra mgo) as a proposed reading', source: 'རི་མགོའི་དབྱིབས', provenance: 'primary',
        note: 'The OCR reads ri mgo; the secondary table’s ra mgo, goat head, is a plausible correction awaiting a check of p. 322.' },
      fourElement: 'fire', fiveElement: 'earth', direction: 'SW', ruler: 'moon',
      deity: deity('dbang po, me lha', 'དབང་པོ་ མེ་ལྷ་', 'Indra and Agni', 'uncertain',
        'The clause “rus mtshan dbang po me lha” does not clearly divide the clan from the deity.'),
      source: { line: 10402, page: 322 }, provenance: 'primary',
      readingNote: 'The glyph draws a goat head, following the proposed correction; the OCR itself reads ri mgo.' }),
  m({ id: 'lm_lha_mtshams', order: 17, wylie: 'lha mtshams', tibetan: 'ལྷ་མཚམས་', sanskrit: 'Anurādhā',
      stars: { readable: 4, secondary: null },
      form: { en: 'Elephant (glang po)', source: 'གླང་པོའི་དབྱིབས', provenance: 'primary',
        note: 'glang po is an elephant, distinct from glang (bull) and from byi bzhin’s glang mgo, ox head.' },
      fourElement: 'earth', fiveElement: 'iron', direction: 'W', ruler: 'mars',
      deity: deity('nyi …', '', '', 'damaged', 'The clause “lha nyi” is cut off at the end of L:10420.'),
      source: { line: 10420, page: 322 }, provenance: 'primary' }),
  m({ id: 'lm_snon', order: 18, wylie: 'snon', tibetan: 'སྣོན་', sanskrit: 'Jyeṣṭhā',
      aliases: [{ wylie: 'snron', tibetan: 'སྣྲོན་', note: 'concordance alias' }],
      stars: { readable: 3, secondary: null },
      form: { en: 'Steps, a ladder', source: 'ཐེམ་སྐས་དབྱིབས', provenance: 'primary' },
      fourElement: 'earth', fiveElement: 'iron', direction: 'W', ruler: 'mercury',
      deity: deity('dbang po', 'དབང་པོ་', 'Indra'),
      source: { line: 10437, page: 323 }, provenance: 'primary' }),
  m({ id: 'lm_snubs', order: 19, wylie: 'snubs', tibetan: 'སྣུབས་', sanskrit: 'Mūla',
      aliases: [{ wylie: 'snrubs', tibetan: 'སྣྲུབས་', note: 'concordance alias' }],
      stars: { readable: 9, secondary: null },
      form: { en: 'Scorpion', source: 'སྡིག་པའི་དབྱིབས', provenance: 'primary' },
      fourElement: 'water', fiveElement: 'iron', direction: 'W', ruler: 'jupiter',
      deity: deity('rngon pa can', 'རྔོན་པ་ཅན་', 'the one with hunters'),
      source: { line: 10453, page: 323 }, provenance: 'primary' }),
  m({ id: 'lm_chu_stod', order: 20, wylie: 'chu stod', tibetan: 'ཆུ་སྟོད་', sanskrit: 'Pūrvāṣāḍhā',
      stars: { readable: 4, secondary: null },
      form: { en: 'Stūpa', source: 'མཆོད་རྟེན་དབྱིབས', provenance: 'primary' },
      fourElement: 'water', fiveElement: 'iron', direction: 'W', ruler: 'venus',
      deity: deity('chu lha', 'ཆུ་ལྷ་', 'the water deity'),
      source: { line: 10472, page: 324 }, provenance: 'primary' }),
  m({ id: 'lm_chu_smad', order: 21, wylie: 'chu smad', tibetan: 'ཆུ་སྨད་', sanskrit: 'Uttarāṣāḍhā',
      stars: { readable: 4, secondary: null },
      form: { en: 'Grain measure (bre)', source: 'བྲེ་ལྟ་བུ', provenance: 'primary' },
      fourElement: 'earth', fiveElement: 'iron', direction: 'W', ruler: 'saturn',
      deity: deity('lha thams cad', 'ལྷ་ཐམས་ཅད་', 'all the gods'),
      source: { line: 10487, page: 324 }, provenance: 'primary',
      readingNote: 'The same form as gro bzhin. The glyph fills this measure with grain, after the passage’s “life-star of grain” (’bru yi bla, L:10488).' }),
  m({ id: 'lm_gro_bzhin', order: 22, wylie: 'gro bzhin', tibetan: 'གྲོ་བཞིན་', sanskrit: 'Śravaṇa',
      stars: { readable: 3, secondary: null },
      form: { en: 'Grain measure (bre)', source: 'བྲེ་ལྟ་བུ', provenance: 'primary' },
      fourElement: 'earth', fiveElement: 'iron', direction: 'W', ruler: 'sun',
      deity: deity('khyab ’jug', 'ཁྱབ་འཇུག་', 'Viṣṇu'),
      source: { line: 10503, page: 325 }, provenance: 'primary',
      readingNote: 'Precedes byi bzhin in this catalogue (L:10503, then L:10518). With byi bzhin it shares one allotment in the count of twenty-seven.' }),
  m({ id: 'lm_byi_bzhin', order: 23, wylie: 'byi bzhin', tibetan: 'བྱི་བཞིན་', sanskrit: 'Abhijit',
      stars: { readable: 3, secondary: null },
      form: { en: 'Ox head (glang mgo)', source: 'དབྱིབས་གླང་མགོ', provenance: 'primary' },
      fourElement: 'earth', fiveElement: 'earth', direction: 'NW', ruler: 'moon',
      deity: deity('tshangs pa', 'ཚངས་པ་', 'Brahmā'),
      source: { line: 10518, page: 325 }, provenance: 'primary',
      readingNote: '“rlung za” in this entry is its food (“eats wind”), not its element.' }),
  m({ id: 'lm_mon_dre', order: 24, wylie: 'mon dre', tibetan: 'མོན་དྲེ་', sanskrit: 'Dhaniṣṭhā',
      aliases: [{ wylie: 'mon gre', tibetan: 'མོན་གྲེ་', note: 'search alias; mon dre is the spelling of both supplied volumes' }],
      stars: { readable: 4, secondary: null },
      form: { en: 'Bird', source: 'བྱ་ལྟ་བུ', provenance: 'primary' },
      fourElement: 'water', fiveElement: 'water', direction: 'N', ruler: 'mars',
      deity: deity('nor lha', 'ནོར་ལྷ་', 'the wealth deities'),
      source: { line: 10531, page: 326 }, provenance: 'primary' }),
  m({ id: 'lm_mon_gru', order: 25, wylie: 'mon gru', tibetan: 'མོན་གྲུ་', sanskrit: 'Śatabhiṣaj',
      stars: { readable: null, secondary: 2 },
      form: { en: 'Heap, or bunch, of flowers', source: 'མེ་ཏོག་ཕུང་དབྱིབས', provenance: 'primary',
        note: 'The same opening also compares it with a person-like form; the syntax around that alternative is damaged.' },
      fourElement: 'earth', fiveElement: 'water', direction: 'N', ruler: 'mercury',
      deity: deity('chu lha', 'ཆུ་ལྷ་', 'the water deity'),
      source: { line: 10544, page: 326 }, provenance: 'primary',
      readingNote: 'Earth in the four-element list and water in the five-element list.' }),
  m({ id: 'lm_khrums_stod', order: 26, wylie: 'khrums stod', tibetan: 'ཁྲུམས་སྟོད་', sanskrit: 'Pūrvabhādrapadā',
      stars: { readable: 2, secondary: null },
      form: { en: 'Cart', source: 'ཤིང་རྟའི་དབྱིབས', provenance: 'primary' },
      fourElement: 'fire', fiveElement: 'water', direction: 'N', ruler: 'jupiter',
      deity: deity('’ba’ zhig ’tsho ba', 'འབའ་ཞིག་འཚོ་བ་', ''),
      source: { line: 10561, page: 327 }, provenance: 'primary' }),
  m({ id: 'lm_khrums_smad', order: 27, wylie: 'khrums smad', tibetan: 'ཁྲུམས་སྨད་', sanskrit: 'Uttarabhādrapadā',
      stars: { readable: null, secondary: 2 },
      form: { en: 'Ear', source: '', provenance: 'secondary',
        note: 'The opening line is lost in the OCR; the ear follows the secondary Tibetan table.' },
      fourElement: 'water', fiveElement: 'water', direction: 'N', ruler: 'venus',
      deity: null,
      source: { line: 10577, page: 327 }, provenance: 'secondary' }),
  m({ id: 'lm_nam_gru', order: 28, wylie: 'nam gru', tibetan: 'ནམ་གྲུ་', sanskrit: 'Revatī',
      stars: { readable: 32, secondary: null },
      form: { en: 'Boat', source: 'གྲུ་དབྱིབས', provenance: 'primary' },
      fourElement: 'water', fiveElement: 'water', direction: 'N', ruler: 'saturn',
      deity: deity('nyi ma', 'ཉི་མ་', 'the Sun'),
      source: { line: 10594, page: 328 }, provenance: 'primary' })
]);

export const MANSION_BY_ID = new Map(MANSIONS.map((x) => [x.id, x]));

/* the glyph a mansion is drawn as; built by scripts/build-mansion-glyphs.cjs */
export const GLYPH_DIR = 'assets/mansions/';
export const glyphUrl = (id) => GLYPH_DIR + id + '.webp';

/* ── the illustrative ring ────────────────────────────────────────────────
   Twenty-eight equal places. Read in the catalogue's order the mansions
   already fall into the source's directional groups — six east (smin drug to
   rgyal), skag southeast, six south, sa ga southwest, six west, byi bzhin
   northwest, six north (mon dre to dbyu gu), bra nye northeast — so equal
   spacing centres each group of six on its cardinal point and sets each
   single mansion exactly on its intermediate one. The sequence runs east,
   south, west, north: clockwise seen from above, as the sun goes in this
   world. This is a display arrangement; it measures no longitude.

   The angle is the one the luminaries use: x = sin a, z = cos a, with south
   at a = 0 and east at a = π/2. */
export const RING_STEP = Math.PI * 2 / 28;
export function ringAngle(order) {
  const k = (order - 3 + 28) % 28;          // smin drug opens the eastern six
  return Math.PI / 2 + (2.5 - k) * RING_STEP;
}
/* The group a ring angle falls in, to check the ring against the source: an
   intermediate point owns only the half-step either side of it, and each
   cardinal point everything else out to there — the groups are six places
   wide, not an eighth of the circle. */
export function directionOfAngle(a) {
  const x = Math.sin(a), z = Math.cos(a);
  const deg = (Math.atan2(x, -z) * 180 / Math.PI + 360) % 360;   // 0 = north, 90 = east
  const half = RING_STEP * 90 / Math.PI;                          // half a place, in degrees
  const inter = Math.round((deg - 45) / 90) * 90 + 45;
  if (Math.abs(deg - inter) < half) return { 45: 'NE', 135: 'SE', 225: 'SW', 315: 'NW', [-45]: 'NW' }[inter];
  return ['N', 'E', 'S', 'W'][Math.round(deg / 90) % 4];
}

/* one line of evidence, as the index and the entry both put it */
export function evidenceLine(x) {
  return 'White Beryl, lower volume, printed p. ' + x.source.page + ', line ' + x.source.line;
}
