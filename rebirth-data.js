/**
 * Compact public game data for Rebirth.
 *
 * Names and moves follow the 1977 English reference profile. Summaries are new,
 * concise descriptions written for this application; no book commentary or
 * scanned artwork is reproduced here. PDF page numbers refer to the local
 * research source, Tatz & Kent, Rebirth: The Tibetan Game of Liberation (1977).
 */

const freeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

const SQUARE_ROWS = [
  ['Vajra Hell', 'A counter-based hell trap associated with broken tantric commitments.', [75]],
  ['Interminable Hell', 'The deepest hell presents suffering without a break or interval.', [76]],
  ['The Hot and Very Hot Hells', 'Intense heat symbolizes the results of violent and deliberately harmful conduct.', [77]],
  ['The Howling and Great Howling Hells', 'Torment arising from intoxication, deception, and harmful speech.', [78]],
  ['The Black Rope and Crushing Hells', 'Punitive realms linked with theft, abuse, and acts compounded by malice.', [79]],
  ['Reviving Hell', 'A repeated cycle of destruction and revival associated with killing.', [80]],
  ['The Cold Hells', 'Freezing states associated with hostility toward spiritual teaching and practice.', [81]],
  ['The Temporary Hells, or “Hell for a Day”', 'Individualized, temporary suffering encountered within ordinary places.', [82]],
  ['Lord of the Dead (Yama)', 'Yama judges deeds and directs beings toward their next rebirth.', [83, 84]],
  ['Hungry Ghosts (Preta)', 'Insatiable craving appears as hunger and thirst that cannot be satisfied.', [85]],
  ['Animals', 'A rebirth marked by confusion, vulnerability, and dependence on others.', [86]],
  ['Divine Animals', 'Mythic animals possess unusual powers while remaining within conditioned existence.', [87]],
  ['World of the Nāgas', 'Serpent beings inhabit waters and subterranean places near the human world.', [88]],
  ['Demon Island', 'A dangerous realm of predatory spirits and fierce supernatural beings.', [89]],
  ['Asuras', 'Powerful antigods are driven by jealousy, rivalry, and conflict with the gods.', [90]],
  ['Rudra Black Freedom', 'Spiritual power pursued for ego and domination becomes a demonic freedom.', [91, 92]],
  ['Jambu Island—The Southern Continent', 'Human life here mixes hardship with the rare opportunity to practice Dharma.', [93]],
  ['The Western Continent—Enjoyment of Cattle (Apara-Godānīya)', 'A prosperous human continent whose ease does not guarantee liberation.', [94]],
  ['The Eastern Continent—Noble Figure (Pūrva-Videha)', 'A calm and fortunate human world east of Mount Meru.', [95]],
  ['The Northern Continent—Kuru', 'A long-lived, abundant human realm with little incentive for spiritual effort.', [96]],
  ['Barbarism', 'Human birth occurs where violence and material concerns dominate social life.', [97]],
  ['Hinduism', 'A cultivated Indian religious world offers learning, discipline, and metaphysical paths.', [98]],
  ['Bön', 'Tibet’s Bön tradition is presented as an alternative ritual and contemplative path.', [99]],
  ['The Heavenly Highway', 'The shared starting place opens six possible karmic directions.', [100]],
  ['Beginning the Tantra', 'The tantric vehicle begins with vows, a qualified teacher, and disciplined preparation.', [101, 102]],
  ['Wheel-Turning King (Cakravartin)', 'An ideal sovereign unites the human world through meritorious and righteous rule.', [103, 104]],
  ['Heaven of the Four Great Kings', 'Four directional kings and their retinues guard the lower divine world.', [105, 106]],
  ['Heaven of the Thirty-three (Trāyatriṁśa)', 'Indra’s summit heaven combines great pleasure, power, and continuing conflict.', [107, 108]],
  ['Heaven Without Fighting (Yāma)', 'A peaceful desire-realm heaven stands beyond the struggles around Mount Meru.', [109]],
  ['The Joyful (Tuṣita) Heaven', 'The joyful heaven is the traditional abode preceding a bodhisattva’s final human birth.', [110]],
  ['Delighting in Emanations (Nirmāṇa-rati)', 'Its gods enjoy sense objects that they create for themselves.', [111]],
  ['Ruling the Emanations of Others (Paranirmita-Vaśavartin)', 'Its gods command pleasures produced through the emanations of others.', [112]],
  ['Tantra, Lesser Path of Accumulation', 'Activity tantra emphasizes purification, ritual action, and an external visualized deity.', [113, 114]],
  ['Mahākāla', 'Wrathful energy is redirected toward protection of the Dharma.', [115]],
  ['The Realm of Form (Rūpa-Dhātu)', 'Refined material heavens correspond to increasingly subtle meditative absorptions.', [116, 117]],
  ['The Formless Realm (Arūpa-Dhātu)', 'Four immaterial attainments extend from infinite space to the peak of existence.', [118, 119]],
  ['Pure Abodes (Śuddhāvāsa)', 'The highest form realms are reserved for advanced practitioners nearing liberation.', [120]],
  ['Disciples (Śrāvaka), Path of Accumulation (Sambhāra-Mārga)', 'A disciple begins by gathering ethical, contemplative, and intellectual foundations.', [121]],
  ['Disciples, Path of Application (Prayoga-Mārga)', 'Practice prepares direct insight through progressively stronger contemplation.', [122]],
  ['Disciples, Paths of Vision and Cultivation (Darśana-Mārga, Bhāvanā-Mārga)', 'Direct vision of the truths is stabilized through continued cultivation.', [123]],
  ['Tantra, Middle Path of Accumulation', 'Conduct tantra balances outward ritual with inward meditative identification.', [124, 125]],
  ['Tantra, Greater Path of Accumulation', 'Yoga tantra internalizes the mandala and identifies the practitioner with awakened form.', [126, 127]],
  ['Independent Buddha (Pratyeka-Buddha), Path of Accumulation', 'A solitary practitioner gathers causes for awakening outside a Buddha’s teaching era.', [128]],
  ['Independent Buddha, Path of Application', 'Contemplation matures toward direct realization without reliance on a teaching community.', [129]],
  ['Independent Buddha, Path of Vision', 'The solitary path reaches direct insight into conditioned arising.', [130]],
  ['Independent Buddha, Path of Cultivation', 'Meditation deepens the vision and removes remaining attachment.', [131]],
  ['Independent Buddha, Arhatship', 'The independent Buddha completes a personal awakening and liberation.', [132]],
  ['Cessation (Nirodha)', 'A second counter-based trap represents entry into cessation rather than the bodhisattva goal.', [133, 134]],
  ['Tantra, Path of Application: “Heat”', 'The first supreme-tantra empowerment plants the basis for awakened embodiment.', [135, 136]],
  ['Tantra, Path of Application: “Climax”', 'The secret empowerment develops a union of bliss and emptiness.', [137, 138]],
  ['Disciples, Arhatship', 'The disciple completes the path by ending the forces that sustain rebirth.', [139]],
  ['Mahāyāna, Lesser Path of Accumulation', 'The bodhisattva path begins with the resolve to awaken for every being.', [140, 141]],
  ['Mahāyāna, Middle Path of Accumulation', 'Compassion, attention, and disciplined practice strengthen the awakening resolve.', [142, 143]],
  ['Mahāyāna, Greater Path of Accumulation', 'Stable concentration makes the bodhisattva’s progress irreversible.', [144]],
  ['Mahāyāna, Path of Application: “Heat” (Ūṣman)', 'Insight into emptiness first produces the warmth that precedes direct vision.', [145, 146]],
  ['Mahāyāna, Path of Application: “Climax” (Mūrdhan)', 'The preparatory insight reaches its peak before deeper acceptance.', [147, 148]],
  ['Tantra, Path of Application: “Receptivity”', 'A wisdom empowerment uses tantric union to reveal bliss and emptiness.', [149, 150]],
  ['Tantra, Path of Application: “Highest Teachings”', 'The final initiation explains the meaning of union and its meditative completion.', [151, 152]],
  ['Shambhala', 'A hidden Dharma kingdom serves as a distant source of tantric inspiration.', [153, 154]],
  ['Potāla', 'Avalokiteśvara and Tārā are encountered in an island mountain pure land.', [155, 156]],
  ['Urgyan (Uḍḍiyāna)', 'The legendary land of ḍākinīs is remembered as a birthplace of tantric Buddhism.', [157]],
  ['Hindu Wisdom-Holder (Vidyādhara)', 'Mastery of non-Buddhist learning and powers reaches a worldly spiritual summit.', [158]],
  ['Mahāyāna, Path of Application: “Receptivity” (Kṣānti)', 'The bodhisattva accepts a direct approach to reality without conceptual fear.', [159]],
  ['Mahāyāna, Path of Application: “Highest Teachings” (Laukikāgra-Dharma)', 'The highest worldly preparation stands immediately before the path of vision.', [160]],
  ['Wisdom-Holder of the Bön Tradition (*Bön Vidyādhara)', 'A Bön adept attains ritual knowledge and supernatural accomplishment.', [161]],
  ['First Tantra Stage', 'A vajra master receives the first stage of tantric authority and responsibility.', [162]],
  ['Wisdom-Holder Among the Gods of Sense Desire (*Kāmadeva-Vidyādhara)', 'Tantric accomplishment equals the powers available within the desire-realm heavens.', [163]],
  ['Wisdom-Holder of the Realm of Form (*Rūpa-Dhātu-Vidyādhara)', 'Tantric mastery rises to the subtle level of the form-realm gods.', [164]],
  ['Tantric Wheel-Turning King (*Mantra-Cakravartin)', 'Worldly tantric attainments culminate in universal authority among wisdom-holders.', [165]],
  ['Realm of Action-Completion (*Karma-Paripūraṇa)', 'Effective enlightened activity is perfected as tantric practice matures.', [166]],
  ['First Sutra Stage (Bhūmi)', 'The bodhisattva enters the first ground and perfects generosity with wisdom.', [167, 168]],
  ['Wisdom-Holder of the Eight Siddhis', 'Eight traditional magical attainments are cultivated as worldly accomplishments.', [169]],
  ['Second Tantra Stage', 'A crown initiation marks a further stage in becoming a vajra master.', [170]],
  ['Third Tantra Stage', 'Vajra initiation develops the awakened quality of mind.', [171]],
  ['Fourth Tantra Stage', 'Bell initiation develops the wisdom and capacity to teach Dharma.', [172]],
  ['Realm of Jeweled Peaks (Ratna-Kūṭa)', 'Ratnasambhava’s southern pure land embodies equality, abundance, and generosity.', [173]],
  ['Land of Bliss (Sukhāvatī)', 'Amitābha’s western pure land supports practice amid beauty and ease.', [174]],
  ['Fourth Sutra Stage', 'The flaming ground burns away obscurations through energetic practice.', [175]],
  ['Third Sutra Stage', 'The illuminating ground joins patience with penetrating wisdom.', [176]],
  ['Second Sutra Stage', 'The immaculate ground perfects ethical conduct free from stain.', [177]],
  ['Fifth Tantra Stage', 'An initiation of permission confirms a future awakened name and teaching role.', [178]],
  ['Sixth Tantra Stage', 'Supreme-tantra practice consolidates earlier empowerments through sustained visualization.', [179]],
  ['Seventh Tantra Stage', 'Subtle mind experiences bliss and emptiness together through advanced yoga.', [180]],
  ['Supreme Heaven (Akaniṣṭha)', 'The highest pure realm prepares tenth-stage bodhisattvas for complete Buddhahood.', [181]],
  ['Realm of Superjoy (Abhirati)', 'Akṣobhya’s eastern pure land expresses unshakable mirror-like wisdom.', [182, 183]],
  ['Seventh Sutra Stage', 'The far-reaching ground expands skillful activity across vast fields of beings.', [184]],
  ['Sixth Sutra Stage', 'Face to face with reality, the bodhisattva rests in neither samsara nor nirvana.', [185, 186]],
  ['Fifth Sutra Stage', 'The hard-to-conquer ground guides difficult beings without losing balance.', [187]],
  ['Eighth Tantra Stage', 'An impure illusory body is formed from subtle energies and mind-only insight.', [188]],
  ['Ninth Tantra Stage', 'Clear-light realization purifies the illusory body of remaining obscuration.', [189, 190]],
  ['Tenth Tantra Stage', 'Body and clear-light mind unite at the threshold of full awakening.', [191]],
  ['Great Enjoyment Body (Sambhoga-Kāya)', 'Awakening appears as a refined form that teaches advanced bodhisattvas.', [192]],
  ['Great Dharma Body (Dharma-Kāya)', 'The unconditioned dimension of Buddhahood is empty, knowing, and all-pervading.', [193, 194]],
  ['Tenth Sutra Stage', 'The cloud-of-Dharma ground showers teaching throughout innumerable worlds.', [195]],
  ['Ninth Sutra Stage', 'The good-intellect ground perfects the ability to teach every aspect of Dharma.', [196]],
  ['Eighth Sutra Stage', 'The unshakable ground proceeds effortlessly while renewed vows sustain compassionate activity.', [197, 198]],
  ['Adopting a Physical Form', 'An emanation body descends from Tuṣita and takes a final human birth.', [199, 200]],
  ['The Setting Forth (Pravrajita)', 'The bodhisattva leaves palace life to seek freedom from suffering.', [201]],
  ['Ascetic Practices (Tapas)', 'Extreme austerities are tested and abandoned in favor of a balanced path.', [202]],
  ['Conquest of Māra', 'Distraction, fear, violence, and temptation are overcome beneath the awakening tree.', [203, 204]],
  ['Buddhahood', 'Insight into past lives, karma, and dependent arising completes awakening.', [205, 206]],
  ['Turning the Wheel of Dharma', 'The Buddha begins teaching the path and establishes a community of practitioners.', [207, 208]],
  ['Demonstration of Miracles', 'Miraculous displays help convert audiences unreached by verbal teaching alone.', [209]],
  ['Nirvana', 'The Buddha’s final passing is the winning square; the stupa rite follows victory.', [210, 211]],
];

const DESTINATIONS = [
  [9,9,9,9,9,9],[17,10,3,2,2,2],[11,10,8,7,5,2],[13,10,8,6,5,3],
  [13,11,10,7,4,3],[17,12,10,8,5,4],[15,18,11,10,6,5],[27,19,14,11,7,6],
  [42,34,9,9,9,9],[19,13,14,11,8,4],[27,17,12,13,10,5],[28,27,15,21,11,10],
  [28,27,15,21,11,10],[25,42,17,15,5,3],[28,14,21,11,10,4],[16,34,16,16,16,16],
  [52,25,26,38,22,6],[38,27,13,21,11,10],[43,38,13,15,13,11],[28,27,17,19,15,20],
  [15,62,13,11,10,2],[52,62,13,15,11,3],[52,65,29,27,14,4],[27,17,15,11,10,6],
  [72,33,25,25,25,38],[29,28,17,20,13,13],[28,17,23,18,10,6],[29,17,20,22,11,7],
  [30,31,17,23,12,10],[64,63,55,54,53,52],[52,30,43,32,22,12],[30,35,28,18,10,32],
  [41,42,33,33,16,1],[61,81,70,34,34,34],[37,52,36,30,17,27],[38,17,11,36,36,4],
  [64,54,32,52,12,37],[37,40,39,52,11,5],[52,43,40,52,28,19],[30,35,28,32,31,29],
  [60,42,59,41,67,33],[49,50,42,42,42,59],[52,44,28,38,13,6],[30,46,45,20,39,27],
  [52,47,46,40,17,28],[30,47,37,35,51,29],[52,48,30,37,47,47],[52,52,52,52,52,52],
  [50,57,49,49,49,49],[57,66,50,50,50,50],[52,48,37,51,51,51],[54,53,30,38,11,7],
  [55,54,37,40,15,8],[63,55,60,59,54,54],[63,56,55,55,55,55],[64,63,56,56,56,56],
  [66,73,58,77,57,57],[73,74,66,85,58,58],[63,50,60,49,42,55],[64,63,42,60,60,60],
  [89,84,83,61,61,61],[52,38,62,62,62,62],[85,42,64,77,63,63],[71,49,64,64,77,64],
  [52,43,65,65,15,8],[74,75,73,66,66,66],[41,42,68,69,67,67],[42,49,68,59,68,41],
  [75,81,69,69,69,69],[86,73,70,34,74,71],[79,80,74,71,71,71],[67,41,33,72,72,72],
  [75,81,73,73,73,69],[75,81,74,74,74,74],[82,83,81,75,75,75],[78,74,73,76,76,76],
  [71,74,77,77,77,77],[87,88,78,78,78,78],[88,78,79,79,79,79],[78,79,80,80,80,80],
  [83,89,81,81,81,81],[89,90,82,82,82,82],[84,91,83,83,83,83],[93,84,84,84,84,84],
  [71,73,76,85,85,85],[95,96,86,86,86,86],[96,86,87,87,87,87],[95,87,88,88,88,88],
  [84,90,89,89,89,89],[84,91,90,90,90,90],[84,93,91,91,91,91],[97,92,92,92,92,92],
  [92,93,93,93,93,93],[93,84,94,94,94,94],[94,84,95,95,95,95],[94,95,96,96,96,96],
  [98,98,97,97,97,97],[99,99,98,98,98,98],[100,100,99,99,99,99],[101,101,100,100,100,100],
  [102,102,101,101,101,101],[103,103,102,102,102,102],[104,104,103,103,103,103],[104,104,104,104,104,104],
];

const MOVE_PAGES = [
  75,76,77,78,79,80,81,82,84,85,86,87,88,89,90,92,93,94,95,96,97,98,99,100,
  102,104,106,108,109,110,111,112,114,115,117,119,120,121,122,123,125,127,128,
  129,130,131,132,134,136,138,139,141,143,144,146,148,150,152,154,156,157,158,
  159,160,161,162,163,164,165,166,168,169,170,171,172,173,174,175,176,177,178,
  179,180,181,183,184,186,187,188,190,191,192,194,195,196,198,200,201,202,204,
  206,208,209,211,
];

const DECISION_BY_OUTCOME = new Map([
  ['23:6', 'R01'], ['33:5', 'R09'], ['44:3', 'R08'], ['45:3', 'R08'],
  ['76:3', 'R02'], ['76:5', 'R02'],
]);

export const REBIRTH_RULES = freeze({
  profile: 'english-reference-v1',
  source: 'Tatz & Kent, Rebirth: The Tibetan Game of Liberation (1977)',
  startSquare: 24,
  winningSquare: 104,
  dieSides: 6,
  firstPlayer: 'lowest preliminary roll; tied lowest players reroll',
  ordinaryUnlistedFace: 'stay and end turn',
  trapSquares: {1: {exit: 9}, 48: {exit: 52}},
  trapQuotasByFace: [1, 2, 3, 4, 5, 6],
  trapLifecycle: 'new counters on entry; useful roll continues; redundant roll ends turn; completion exits and ends turn; re-entry resets',
  victory: 'first arrival at square 104 wins; the stupa instruction is post-victory ceremony',
  decisions: {
    R01: 'square 23, die 6 goes to 4',
    R02: 'square 76, die 3 goes to 73; die 5 stays',
    R03: 'arrival at 104 wins immediately',
    R04: 'retain the chart sequence; correct only the printed explanation of ten ones',
    R05: 'trap quotas use face-indexed counts 1 through 6',
    R06: 'tied lowest preliminary rolls reroll',
    R07: 'trap progress belongs to one visit and resets on re-entry',
    R08: 'square 44/die 3 goes to 45 and square 45/die 3 goes to 46',
    R09: 'square 33/die 5 goes to 16',
  },
});

export const REBIRTH_SQUARES = freeze(SQUARE_ROWS.map(([name, summary, pdfPages], index) => ({
  number: index + 1,
  id: `rebirth-${String(index + 1).padStart(3, '0')}`,
  name,
  summary,
  citation: {source: 'book-1977', pdfPages, printedPages: pdfPages.map(page => page - 9)},
})));

export const REBIRTH_OUTCOMES = freeze(DESTINATIONS.flatMap((destinations, squareIndex) => {
  const from = squareIndex + 1;
  return destinations.map((to, dieIndex) => {
    const die = dieIndex + 1;
    const trap = from === 1 || from === 48;
    const terminal = from === 104;
    const action = terminal ? 'terminal' : trap ? 'trap_count' : to === from ? 'stay' : 'move';
    return {
      id: `rebirth-${String(from).padStart(3, '0')}-${die}`,
      from,
      die,
      action,
      to,
      requiredCount: trap ? die : null,
      condition: terminal ? 'game_already_won' : trap ? 'all_quotas_complete_for_exit' : 'ordinary_turn',
      sourcePdfPage: MOVE_PAGES[squareIndex],
      decision: trap ? 'R05;R07' : terminal ? 'R03' : DECISION_BY_OUTCOME.get(`${from}:${die}`) ?? null,
    };
  });
}));

/** Return the immutable outcome for one square and one six-sided-die result. */
export function getRebirthOutcome(square, die) {
  if (!Number.isInteger(square) || square < 1 || square > 104) throw new RangeError('square must be an integer from 1 to 104');
  if (!Number.isInteger(die) || die < 1 || die > 6) throw new RangeError('die must be an integer from 1 to 6');
  return REBIRTH_OUTCOMES[(square - 1) * 6 + die - 1];
}

/** Return the immutable square record for a board number. */
export function getRebirthSquare(number) {
  if (!Number.isInteger(number) || number < 1 || number > 104) throw new RangeError('number must be an integer from 1 to 104');
  return REBIRTH_SQUARES[number - 1];
}

