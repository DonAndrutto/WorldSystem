/* One note per square of the board of rebirth, keyed by square number.
 *
 * These are written for this project. The 1977 edition carries a commentary of
 * its own on every square, which is still in copyright and is not reproduced
 * here; what follows is the doctrine the square names, told in the same voice
 * as the rest of the index, with the board's own reading noted where it departs
 * from the Abhidharma. Sources are given on each entry in the drawer.
 *
 * Names, categories, the move graph and the 3D placement live in
 * rebirth-board.js. Nothing here affects play.
 */
export const SQUARE_NOTES = {
  1: 'A hell the Abhidharma does not build, added by the tantric traditions for those who take the vows of mantra and break them. Crossed vajras seal it: the protectors who were invoked as allies turn on the one who invoked them. The board makes it one of its two traps, and the only exit is the long count of throws.',
  2: 'Avīci, the interminable, the deepest and hottest of the eight. Its name says what distinguishes it — not a greater torment than the others but one without the gaps the others allow. A being falls here head downward for two thousand years before arriving. The Kośa gives it the longest term of any hell.',
  3: 'Tapana and Pratāpana, the seventh and eighth hot hells, taken as one square. Heat is their whole character: iron spikes, molten bronze. The Kośa assigns them to those whose wrongs were done with fire, and to the holders of wrong views who taught them to others.',
  4: 'Raurava and Mahāraurava, where the howling is the point: the two hells of the misused mouth. The Kośa reads them as the fruit of intoxicants and of lying, and the punishment answers the crime — the mouth filled with what it dealt in.',
  5: 'Kālasūtra, the black rope, and Saṃghāta, the crushing. The first is for theft: the body is marked out with a line, as a carpenter marks timber, and cut along it. The second is for wrong conduct in desire, and the mountains themselves do the crushing.',
  6: 'Sañjīva, the reviving, first and least of the eight hot hells, the destination of those who have killed. Its name is its mechanism: the beings there destroy one another and are made whole again to continue. The Kośa reckons its day as five hundred years of the Heaven of the Four Great Kings.',
  7: 'The eight cold hells, which the Kośa places beside the hot ones in the golden ground. They run arbuda, nirarbuda, aṭaṭa, hahava, huhuva, utpala, padma, mahāpadma — the first three named for the sounds a body makes in cold, the last three for the way split flesh opens like a flower.',
  8: 'The occasional hells, which the Kośa keeps apart from the other sixteen: not made by the collective karma of beings but by an individual\'s own, and therefore innumerable and unplaced. They stand on the earth rather than under it — a river, a defile, a stretch of desert — which is why the board can reach them from the human squares.',
  9: 'Yama, who judges the dead, and the officers of his court. The Kośa puts his city in the preta realm below Jambudvīpa, at the gate of the hells. To arrive here is to hold office rather than to suffer, but the office is bound to the hells it serves. No throw from any square reaches this one: the board gives it only as the exit from Vajra Hell.',
  10: 'The pretas, whom the Kośa places just beneath the surface of Jambudvīpa and roving upon it. Their hunger is the point of the realm: enormous bellies, throats like needles, and what they do swallow turning to fire. Those who live scattered among human beings, unseen, are said to suffer least.',
  11: 'The animals, whom the Kośa puts first of all in the great ocean and only then on land and in the air. Their span is not fixed as the gods\' and hell-beings\' are, running from a day to an intermediate kalpa. The board reaches them from more squares than any other destiny.',
  12: 'The divine animals, born miraculously rather than from a womb or an egg: the swans, peacocks and stags that draw the chariots of the gods and carry them. The Kośa has no such class. The board keeps them because the iconography does, and places them above the ordinary animals.',
  13: 'The nāgas, serpent beings of the waters, human above the waist in the iconography and serpentine below. They hold the treasures of the underworld and the rain, and the sources put them where their realm touches ours — springs, lakes, the courses of rivers. Powerful, wealthy, and short-tempered.',
  14: 'The island of the rākṣasas, man-eating demons of the night who haunt burning grounds and carry off children. The sources place their island south beyond Jambudvīpa, which is why the board reaches it from the southern continent and from the hells beneath it.',
  15: 'The asuras, the not-gods, cast out of the Heaven of the Thirty-three and at war with it ever since. The Kośa does not count them as a sixth destiny; the Tibetan tradition gives them a realm at Meru\'s submerged base. Their character is wealth and power without ease: they have the gods\' riches and none of the gods\' peace.',
  16: 'Rudra, the howler: the yogi who reaches the worldly attainments — pacifying, enriching, subjugating, destroying — and turns them to his own power. The board makes him a demigod rather than a demon, and reachable only from the lesser path of tantric accumulation. Only one throw leads out, and it leads to Mahākāla.',
  17: 'Jambudvīpa, the southern continent, and the one human birth the sources call fortunate. Its people are short-lived and their world is hard, and that is the argument for it: here alone are the wish to leave the round of birth, the leisure to act on it, and a buddha\'s teaching to follow. The board starts the sūtra route from this square.',
  18: 'Aparagodānīya, the western continent, round, and named for the cattle that are its wealth. The dharma is present but does not flourish, for the life is easy and the people live by their herds. Five hundred years, and no buddha appears.',
  19: 'Pūrvavideha, the eastern continent, semicircular, lit by the crystal face of Meru. Its people have the finest human bodies and the mildest tempers. The Kośa gives them two hundred and fifty years.',
  20: 'Uttarakuru, the northern continent, square and green, where the harvest grows unsown and life runs a thousand years. The Kośa counts that ease against it: no one there turns to the dharma, and no buddha appears. Its Tibetan name — unpleasant sound — comes from the voice that announces the day of death seven days in advance.',
  21: 'A human birth in a society that has made war its ordinary business. The board reads it as a condition rather than a place, and the 1977 edition pictures it as mountains reddened with blood. It is the lowest of the human squares and the only one from which a single throw reaches the hells.',
  22: 'A birth into the brahmanical culture of India, which the board draws as rich and fruitful: the arts and sciences flourish, and the analysis of mind is far advanced. What the Buddhist sources withhold is the final step, holding that the doctrine of a self persists here however refined the reasoning. Two throws from this square reach the Mahāyāna.',
  23: 'Bön, which the 1977 edition treats as Buddhism\'s alternative in Tibet rather than as a variety of it. The board gives it its own wisdom-holder at square 65, as it gives one to the Hindu traditions at 62 — attainments real in their own terms and, on this board, not leading to the Buddha\'s.',
  24: 'Where every token starts. The board sets the player in the present human life, at the fork of six roads, and the first throw sends them down one of the six destinies: the gods, human beings, the animals, the pretas, the asuras, the hells. Nothing is chosen here. The die names the road.',
  25: 'Entry into the vehicle of mantra, which the board keeps as a route of its own beside the sūtra path and runs up the other side of the row. The key is a qualified teacher and the vows taken from them — which is also why the board puts Vajra Hell at the foot of this column, one throw from the first stage of practice.',
  26: 'A cakravartin, the monarch who unites the world under a single righteous rule. The Kośa grades them by the wheel that appears to them — gold, silver, copper, iron — and by how far each reaches. The board treats the office as a human condition rather than a divine one, and no throw from it leads higher than the heavens of sense desire.',
  27: 'Cāturmahārājika, the lowest of the six heavens of sense desire, on Meru\'s fourth terrace. Its four kings each hold one direction and look outward from the mountain\'s sides: Dhṛtarāṣṭra east, Virūḍhaka south, Virūpākṣa west, Vaiśravaṇa north. Their gods rule the lower slopes, the seven golden ranges and the skies.',
  28: 'Trāyastriṃśa, the Heaven of the Thirty-three, on Meru\'s summit, with Śakra at its centre in the city of Sudarśana. These gods are large, long-lived and equipped with powers of sense the lower heavens lack. It is from here that the asuras were cast out, and here that they return to make war.',
  29: 'Yāma, the first heaven that does not stand on the mountain: it hangs in space above the summit, and the strife that reaches as high as Trāyastriṃśa does not reach it. The name is read as without fighting. Twice the height of the heaven below it, and twice the life.',
  30: 'Tuṣita, the joyful, fourth of the six. The sources make it the bodhisattva\'s last abode before a human birth, which is why it matters out of proportion to its height: Śākyamuni waited here, and Maitreya waits here now. The board gives it six routes onward, every one of them into the Mahāyāna.',
  31: 'Nirmāṇarati, where the gods need no object present to enjoy it — the wish is the enjoyment. The fifth of the six heavens of sense desire, and the second-highest.',
  32: 'Paranirmitavaśavartin, the summit of the realm of sense desire, whose gods are served by the emanations of the gods below them: what they might want is anticipated and made before they want it. Above this there is no more desire, and the next heaven up is already the Realm of Form.',
  33: 'Kriyātantra, the tantra of activity, and the first substantial tantric practice on the board. Its concern is purification, outer and inner, and the deity is generated before the practitioner as a lord is approached by a servant. Two of its throws go on up the tantric column; one falls to Rudra, and one to Vajra Hell.',
  34: 'Mahākāla, the great black one, taken as an attainment rather than a deity met: the wrathful energies turned to the protection of the dharma. The board counts him a protector who transcends the world rather than one bound to it, and gives him three throws, all of them high — Uḍḍiyāna, the fifth tantric stage, and a Buddha field.',
  35: 'The Realm of Form, seventeen levels in four absorptions, entered by meditation rather than by merit. The karma that produces it is called immovable, neither good nor bad: attachment to sense objects is gone, and what remains is the settled mind and a body of light. The board takes the whole realm as one square.',
  36: 'The Formless Realm, beyond matter as well as beyond desire: infinite space, infinite consciousness, nothing whatever, and the summit of existence where perception neither is nor is not. The board gives it only four throws, and three of them fall — to the human continents, to the animals, to a hell. Height in the world system is not progress on the path.',
  37: 'The Śuddhāvāsa, the five pure abodes at the top of the Realm of Form, reached by the strongest practice of the fourth absorption and inhabited by those who will not be born lower again. Avṛha is the first of the five and Akaniṣṭha the last, which the board keeps as a separate square at 84.',
  38: 'The first of the five paths, in the vehicle of the disciples: the accumulation of the roots of the wholesome, driven by a settled disgust at the round of birth. The practices are the ones the Kośa lists — the repulsiveness of the body, dependent origination, the four boundless states. The board starts this route from the southern continent.',
  39: 'The path of application, where what was accumulated is turned on the doctrine itself and the four truths are approached in sequence. The heats and summits the Mahāyāna column names at 55 and 56 belong to this path in both vehicles; the board spells them out only on the greater route.',
  40: 'Vision and cultivation as one square: the four truths seen directly, and then the long work of making the seeing habitual. The board compresses two of the five paths here, and every throw from it returns to the heavens — the fruit of the practice before its completion.',
  41: 'Caryātantra, the tantra of both, where outer ritual and inner yoga are practised together and the deity is generated before the practitioner as a friend or a brother rather than a lord. The middle of the three accumulation stages on the tantric route.',
  42: 'Yogatantra, wholly internalized: the maṇḍala and its buddhas are built in the practitioner\'s own body, and the knowledge being is drawn down into what has been built. The last of the three accumulation stages, and the square the board returns to most often from the wisdom-holder attainments.',
  43: 'The vehicle of the pratyekabuddha, who reaches awakening in an age when no buddha is teaching, and does not teach. The sources say such a one attended buddhas in former lives and did not complete the path then; what remains is completed alone. The board runs this route in parallel with the disciples\', five paths for five.',
  44: 'The path of application on the solitary route, passed in the forest over long ages. Its particular practice is the four applications of mindfulness — body, feeling, mind, and the dharmas — the last of which takes up impermanence itself.',
  45: 'The path of vision, alone and far from any town: birth and death examined until the chain is seen whole. What the disciple sees with a teacher\'s help, the pratyekabuddha sees unaided, and the sources treat the unaided seeing as the harder and the narrower.',
  46: 'The path of cultivation on the solitary route, where the vision is made continuous and the attachments that come of grasping and of rejecting are destroyed. Because nothing was received from a teacher, the sources say, nothing can be passed on.',
  47: 'Arhatship on the solitary route: the fifth path, no more learning, and nirvāṇa with a substrate still remaining until death. The Tibetan traditions add a caution the board keeps — that this is not the end, and that one may yet fall back from it.',
  48: 'Nirvāṇa without residue, entered at the death of an arhat, and the board\'s second trap. The Mahāyāna reading is the reason: a peace so complete that nothing goes out from it, held for an age until the buddhas rouse the one resting there and set them on the greater vehicle. The long count of throws is that age, and the exit is the Mahāyāna path of accumulation.',
  49: 'The first of the four initiations of anuttarayogatantra, the supreme tantra, taken by a yogi already settled on the path. The board names it heat, borrowing the term the path of application uses in both sūtra vehicles.',
  50: 'The secret initiation, second of the four, which the tradition holds will bear fruit as the enjoyment body of a buddha. The board names it climax, again borrowing the sūtra path\'s vocabulary for the stages of application.',
  51: 'Arhatship in the vehicle of the disciples, and the end of that route: the defilements gone, the round of birth cut. Three throws lead out — two of them into the Mahāyāna and one into the Cessation that traps.',
  52: 'The lesser path of accumulation in the great vehicle, entered by the arising of the mind of awakening. What distinguishes this route from the two below it is not the technique but the aim: awakening sought for every being rather than for oneself. More squares lead here than to any other square on the board.',
  53: 'The middle path of accumulation. The board grades accumulation in three on the Mahāyāna route as it does on the tantric one, and the two columns run up the row in step.',
  54: 'The greater path of accumulation, the last stage before application. Its four throws are the board at its most generous: two on up the sūtra column, and two out to the sacred lands.',
  55: 'The first of the four stages of the Mahāyāna path of application, named heat for the first warmth of a fire not yet alight — the doctrine beginning to be understood rather than held.',
  56: 'The climax, second of the four stages of application: the warmth at its height, the doctrine held steadily enough that it can be examined without being lost. Two throws only, and both of them onward — this is the narrowest square on the Mahayana column and the last before receptivity.',
  57: 'Receptivity on the tantric route — the third stage of application, where what has been understood is borne rather than merely grasped. One of its four throws reaches Sukhāvatī directly.',
  58: 'The highest teachings of the world, last stage of application on the tantric route and the last that belongs to an ordinary being. The next step is the first tantric stage proper. One throw from here reaches Abhirati.',
  59: 'Shambhala, the kingdom the Kālacakra literature places north beyond the Himālaya, ruled by a line of dharma kings and holding the tantra itself in trust. The sources put it on the earth without fixing where, so the world system has no coordinate for it and this board supplies one. Six throws, more than any other of the sacred lands.',
  60: 'Potala, the mountain of Avalokiteśvara, which the sources place in the south and the Tibetan tradition also read into the palace at Lhasa named for it. A land of the earth rather than a Buddha field, though the board sets it high.',
  61: 'Uḍḍiyāna, the land the Nyingma tradition makes Padmasambhava\'s birthplace and the source of much of the tantra, usually identified with the Swat valley. Its three throws are the highest on the board from any square below the stages: the eighth tantric stage, Akaniṣṭha, the seventh.',
  62: 'A wisdom-holder of the Hindu traditions: the occult attainments won by practices the 1977 edition treats as real and as not the Buddha\'s. Two throws out, both into a Buddhist path — which is the board\'s judgement on the condition rather than on the attainment.',
  63: 'Receptivity on the Mahāyāna route, third of the four stages of application. Its four throws include two Buddha fields, which is unusual this low on the board.',
  64: 'The highest teachings of the world on the Mahāyāna route: the last station before the first bodhisattva stage, and the end of what an ordinary being can reach. The board also gives this square the alternative trap quotas recorded in the 1977 edition\'s sixty-fourth note.',
  65: 'A wisdom-holder of the Bön tradition, set opposite the Hindu one at 62. The board grants the attainment and not the destination: of its four throws, two lead to Buddhist paths and two fall to the asuras and the temporary hells.',
  66: 'The first of the ten tantric stages, entered after the four applications are complete. From here the tantric column runs unbroken to the tenth, and the sources hold that the whole ascent can be made in one life — which is the claim the board tests against the sūtra column beside it.',
  67: 'A wisdom-holder among the gods of sense desire: the attainment held within the lowest of the three realms. The board counts the vidyādhara stations as tantric rather than divine, and every throw from this one returns to the tantric accumulation stages.',
  68: 'A wisdom-holder of the Realm of Form, one level above the last. Four throws, all of them back down to the tantric path or out to Shambhala — the attainment is a station, not a stage.',
  69: 'A cakravartin of mantra, the monarch of the tantric route as square 26 is of the ordinary one. The board keeps it a human condition and gives it two throws, both into the middle tantric stages.',
  70: 'Karmaparipūraṇa, the northern Buddha field, of Amoghasiddhi, whose name is unfailing accomplishment and whose function is the completion of action. The field of the karma family; its colour green, its element air. Five throws, the most of any Buddha field.',
  71: 'The first bodhisattva stage, called the joyous, where the mind of awakening becomes direct seeing and the first of the ten perfections — giving — is completed. The bodhisattva stages begin here and run to the tenth at 94; the board threads them up and down the row rather than in order.',
  72: 'A wisdom-holder of the eight attainments, the highest of the vidyādhara stations on the board. Its three throws all return to the tantric path — to the first wisdom-holder, to middle accumulation, and to the lesser stage where the route began.',
  73: 'The second of the ten tantric stages. Reached from more squares than any other stage on this column, and one of its three throws falls back to the tantric cakravartin.',
  74: 'The third tantric stage. Two throws, both onward, and no way back: from here the tantric column runs one-way to the tenth. The narrowness is the board\'s argument for the route — fewer squares, fewer falls, and a faster ascent than the sutra column beside it.',
  75: 'The fourth tantric stage, and the square the stages below converge on — five of them reach it, more than any other stage on this column. From here the ascent forks, to the sixth and seventh, or straight to the fifth.',
  76: 'Ratnakūṭa, the southern Buddha field, of Ratnasambhava, the jewel-born, whose function is to give what is needed. The field of the jewel family; its colour yellow, its element earth, and the understanding proper to it that of equality, all things standing level on the broad earth.',
  77: 'Sukhāvatī, the western Buddha field, of Amitābha, and the most sought in practice of all the pure lands: the sources hold that recollection at death is enough to be born there, and that from there one does not fall back. Two throws lead out, to the first bodhisattva stage and the third tantric one.',
  78: 'The fourth bodhisattva stage, the radiant, whose perfection is vigour. The sources name it for what burns: the last residues of the view of a self, consumed in the wisdom that attends the thirty-seven wings of awakening. Both its throws go on up the column.',
  79: 'The third bodhisattva stage, the luminous, whose perfection is patience. The board sets it above the fourth in the row and reaches the fourth from it, one of several places where the numbering of the stages and the geometry of the board disagree.',
  80: 'The second bodhisattva stage, the stainless, whose perfection is discipline. Its two throws reach the fourth stage and the third — the board will not let this column be climbed in order.',
  81: 'The fifth tantric stage, and the point at which the tantric route has drawn level with the middle of the bodhisattva stages beside it. Two throws: the seventh, and the eighth. From here on the column climbs in single steps, every one of them irreversible.',
  82: 'The sixth tantric stage. The eighth and the ninth are both in reach from here, which makes it the one square on this column that can skip two at once — the board\'s reason for putting the sixth above the seventh in the reading order rather than below it.',
  83: 'The seventh tantric stage, and the first square on this column from which Akaniṣṭha can be reached in a single throw. Every stage above it keeps that reach, which is how the board says that the summit of the Realm of Form is where a tantric ascent arrives.',
  84: 'Akaniṣṭha, the highest of the five pure abodes, whose name means none higher: the summit of the Realm of Form, and in the tantric reading the field of Vairocana and the place where a buddha\'s enjoyment body is manifested. The only square the model draws for a Buddha field, and the only one with a single throw out — to the Dharma Body.',
  85: 'Abhirati, the eastern Buddha field, of Akṣobhya, the unshakeable, whose gesture is the touching of the earth to witness. The field of the vajra family; its colour blue, its mount the elephant. The witnesses disagree on its first face: this board reads the First Sūtra Stage, as the other Buddha fields each give one sūtra exit and one tantric, and a second reading doubles the tantric one.',
  86: 'The seventh bodhisattva stage, far-reaching, whose perfection is skill in means. The sources make it the stage at which the bodhisattva enters and leaves nirvāṇa in the same moment — a cessation that keeps working in the world, which is the Mahāyāna\'s answer to the trap at square 48.',
  87: 'The sixth bodhisattva stage, facing-toward, whose perfection is wisdom and whose object is dependent origination seen whole rather than followed link by link. The sources put the bodhisattva here on the edge of the cessation the disciples take for the end, and passing it by.',
  88: 'The fifth bodhisattva stage, hard to conquer, whose perfection is meditative absorption. The name is read two ways in the commentaries — hard for others to overcome, and hard for the bodhisattva to attain — and the sources let both stand.',
  89: 'The eighth tantric stage. From here, and from the ninth and tenth above it, one throw reaches Akaniṣṭha and the other steps up the column — so the last three stages each offer the same choice: the summit of form now, or one more stage first.',
  90: 'The ninth tantric stage. The tradition does not individuate the ten stages of the tantric ascent as it individuates the ten bodhisattva stages, each with its name and its perfection; the count is borrowed to measure one route against the other, and the board borrows it in turn.',
  91: 'The tenth and last tantric stage. Its second throw is the Dharma Body itself — a reach no square on the sutra column has, where only the tenth bodhisattva stage arrives there and only on a one. The board states its preference here as plainly as it states anything.',
  92: 'The enjoyment body, in which a buddha appears to the assemblies of the pure lands, adorned and teaching, visible to bodhisattvas and not to ordinary sight. The board puts it beside the Dharma Body on the axis and makes the two mutually reachable — one throw each way — before the deeds begin.',
  93: 'The dharma body: a buddha as the nature of things rather than as any appearance, without marks and without location. The board makes it the convergence of both routes, the tenth tantric stage and the tenth bodhisattva stage each reaching it, and then turns back to the enjoyment body — because what follows is not higher but visible.',
  94: 'The tenth bodhisattva stage, the cloud of dharma, whose perfection is knowledge and which the sources set immediately before buddhahood. One throw reaches the Dharma Body; the other reaches Akaniṣṭha, where the enjoyment body is shown.',
  95: 'The ninth bodhisattva stage, of good discrimination, whose perfection is power. Its mark is the command of teaching itself: what any being needs to hear, in the form they can receive it. One throw reaches the tenth stage, the other Akaniṣṭha.',
  96: 'The eighth bodhisattva stage, the immovable, from which there is no falling back. The sources treat this stage as the point of no return, and the board agrees: from here the only throws are upward.',
  97: 'The emanation body begins: a buddha takes a physical birth. The last eight squares run the acts of that body in order, and they are the only stretch of the board where one and two do the same thing and nothing else does anything at all. From here the outcome is not in doubt — only its pace.',
  98: 'The going forth, second of the acts: the prince leaves the palace by night and takes up the life of a renunciant. The sources make the four sights the cause — an old man, a sick man, a corpse, and a mendicant — the last of them the only one that was not simply the world as it is.',
  99: 'The years of austerity by the Nairañjanā, third of the acts, which the sources treat as necessary and insufficient both — undertaken in full and then set aside for the middle way.',
  100: 'The conquest of Mara beneath the tree: the armies, the daughters, and last the challenge to the right to sit there at all — answered not by argument but by touching the ground, and letting the earth be the witness. The gesture is the one Akṣobhya holds at square 85.',
  101: 'Awakening, fifth of the acts on this board, at dawn under the tree at Bodh Gayā. Not the end of the sequence — what a buddha is for follows it.',
  102: 'The turning of the wheel of dharma at Sārnāth, and in the Mahāyāna reckoning the first of three such turnings. The teaching is an act of the emanation body, which is the board\'s reason for placing it above awakening rather than after it as an afterthought.',
  103: 'The display of miracles, which the sources report and mostly deprecate: shown to those whom nothing else would reach. The last square before the end, and the only one from which 104 can be thrown.',
  104: 'Nirvāṇa, and the end of the game: not the extinction the trap at 48 describes but the passing of a buddha whose work is done. Victory is declared on arrival. The throw that follows, in which a one or a two passes the relics into the stūpa, is a rite performed after the fact and settles nothing.'
};

/* The long form of each entry, folded behind a disclosure in the drawer and
 * opened only when asked for. The short note above is the blurb; this is what
 * it expands to.
 *
 * These are written for this project. The 1977 Anchor edition carries a
 * commentary of its own on every square — copyright © 1977 by Jody Kent, all
 * rights reserved — and it is not reproduced here in any part. Anyone holding
 * permission to publish that text can substitute it for the arrays below
 * without touching anything else: the keys are square numbers and the values
 * are arrays of paragraphs, which is the whole contract.
 */
export const SQUARE_FULL = {
  1: [
    'The Abhidharma builds eight hot hells, eight cold, and the occasional hells scattered on the earth; it does not build this one. Vajra Hell belongs to the tantric traditions, and it exists because the tantric path raises the stakes. Where the sūtra vehicles ask restraint, mantra asks a bond — samaya — with a teacher, a deity and a lineage, and gives real power on the strength of it. A bond of that kind can be broken, and the sources are unanimous that breaking it is the gravest thing a practitioner can do.',
    'The iconography seals the square with crossed vajras, the same emblem that seals the base of a maṇḍala against intrusion, here turned inward to keep someone in. What makes the hell distinctive is not its heat but its company: the wrathful protectors invoked as allies, who did what was asked while the bond held, now turn on the one who invoked them. The offence is not disbelief but betrayal, and the punishment is dealt by the betrayed.',
    'The board makes it one of its two traps. No die throw leads out; only the long count — one 1, two 2s, and so on to six 6s — and then the exit is to Yama\'s court, which is not a release so much as a change of office.'
  ],
  2: [
    'Avīci is the eighth and lowest of the hot hells, and the one the texts reach for when they want a limit. Its name is usually given as "without interval", and the commentators read the interval two ways: no gap in the suffering, and no gap between one moment of it and the next, so that nothing in the experience marks time passing. The other seven hells allow a pause; this one is defined by not allowing one.',
    'The Kośa places it at the bottom of the stack beneath Jambudvīpa and gives the falling itself as part of the sentence — two thousand years head downward before arrival. Its term is the longest the system records, an intermediate kalpa, and the acts that lead there are the five of immediate retribution: killing a parent, killing an arhat, drawing blood from a buddha, splitting the saṅgha.',
    'On the board it sits second from the right in the bottom row, and three faces lead out of it, one of them to the southern continent — the fortunate human birth. The board is not sentimental about the hells, but it does not make them permanent either.'
  ],
  3: [
    'Tapana and Pratāpana, the Hot and the Very Hot, are the sixth and seventh of the eight, and the board takes them as one square because their difference is one of degree rather than kind. Both are furnaces. The Kośa describes iron floors, spikes, molten bronze poured into the mouth, and in Pratāpana a trident that pins the being through and holds it there.',
    'The karma the sources assign them turns on fire and on doctrine: wrongs committed by burning, and — for the deeper of the two — the holding and teaching of wrong views, which the tradition treats as a kind of arson conducted on other people\'s understanding. That pairing is worth noticing. The Abhidharma does not grade offences by the visible harm alone; it grades them by how far the consequences travel, and a false teaching travels further than a fire.',
    'Six faces lead out, the widest exit of any hell on this row, and they run the whole spread — to the animals, the pretas, the cold hells, the temporary hells, and back down to Avīci.'
  ],
  4: [
    'Raurava and Mahāraurava, the Howling and the Great Howling, take their names from the noise made in them, which the sources treat as the diagnostic feature rather than incidental. These are the hells of the misused mouth. The Kośa assigns Raurava to intoxicants and Mahāraurava to lying, and both punishments are administered orally: molten copper poured in, the insides destroyed from within.',
    'The logic is the one the whole hell system runs on — not retribution chosen by a judge but a condition ripened by an act, with the shape of the act still legible in it. A mouth that dealt in falsehood is filled with what it dealt in. Nothing in the Abhidharma requires anyone to decide this; it is presented as a consequence, the way a burn follows a fire.',
    'The board gives the square six faces, one of them to the world of the nāgas, and it can be reached from Reviving Hell above it and from the two hells to either side.'
  ],
  5: [
    'Kālasūtra and Saṃghāta, the Black Rope and the Crushing, are the second and third of the hot hells, and the board pairs them. The first is named for its instrument: the being is marked out with a blackened line, exactly as a carpenter snaps a chalked cord along timber to show where to cut, and is then cut along the mark. The image is domestic and that is what makes it land — the tools of a trade turned on a body.',
    'Saṃghāta crushes. The commentators describe mountains shaped like the heads of animals closing on the being between them, or iron hills driven together. The Kośa gives theft as the act behind the first and wrong conduct in desire as the act behind the second — the second and third of the five guides to lay conduct, in order, which is a clue to how the hells were arranged: they run in step with the precepts.',
    'Six faces out, including one to the animals and one to the nāgas.'
  ],
  6: [
    'Sañjīva, the Reviving, is the first and least of the eight hot hells, and the one reserved for killing. Its mechanism is in its name. The beings there are driven to destroy one another — the sources say by weapons that appear to hand, or by hatred alone — and when the body is destroyed a voice or a cold wind restores it, and it begins again. The sentence is not a single death but an endless supply of them.',
    'The Kośa measures its day against the Heaven of the Four Great Kings: five hundred of their years to one day here, and five hundred such years to a lifetime. The arithmetic is not decoration. The Abhidharma builds its hells out of durations because duration is the thing that makes them unbearable, and every figure in the chain is given so the reader can work it out and feel the size of it.',
    'From this square the board reaches Jambudvīpa on a one — the shortest route from the lowest hell to the most fortunate human birth anywhere on the lower rows.'
  ],
  7: [
    'The eight cold hells lie beside the hot ones in the golden ground, and the Kośa names them by what cold does. The first three — arbuda, nirarbuda, aṭaṭa — are named for the body: blistering, the blisters bursting, and then the sound the throat makes when it can no longer form words. Hahava and huhuva continue the sounds. The last three — utpala, padma, mahāpadma — are named for flowers, because the split flesh opens in the shape of a blue lotus, a lotus, a great lotus.',
    'It is worth sitting with that naming. The tradition could have described the cold hells with the same vocabulary of iron and fire it used for the hot ones and did not; it reached instead for botany, and the effect is to make the worst of them the most beautiful to say. The sources give crimes against the dharma from within — schism, the corruption of a teaching by one who holds it — as what leads here.',
    'The board takes all eight as one square, and gives it six faces, two of which reach the human continents.'
  ],
  8: [
    'The occasional or temporary hells are the Kośa\'s exception to its own system. The sixteen great hells are built by the collective karma of beings and stand in fixed places beneath Jambudvīpa; these are made by an individual\'s karma alone, and so there is no counting them and no map of them. They are found on the earth: in a river, at a mountain, in a desert, sometimes in a single place that torments a single being.',
    'This is the square that makes the hells reachable from ordinary life, and the board uses it that way — it can be thrown to from the human rows above and it leads back up to them. The 1977 board calls it hell for a day, which catches the thing exactly: not a realm entered after death but a condition that can open in the middle of a life and close again.',
    'Six faces out, reaching as high as the Heaven of the Four Great Kings on a one.'
  ],
  9: [
    'Yama is the lord of the dead and the judge at the gate, and the Kośa puts his city in the preta realm below Jambudvīpa rather than in the hells themselves. He is not a devil and not a god: he holds an office. The iconography gives him a mirror in which the acts of the deceased are seen, and a scale — the arithmetic is done in the open, and nothing depends on his opinion of you.',
    'To arrive on this square is to become him, or his sister Yamī, or one of the officers of his court. That is the board\'s characteristic move: it converts a figure you would expect to meet into a place you can end up. The office carries great power and it is bound to what it serves, which is why the board treats it as a destination rather than a promotion.',
    'No throw from any square on the board reaches this one. It exists solely as the exit from Vajra Hell, which gives it a strange position — the only square you cannot be sent to, only released into. Two faces lead out, to the greater path of tantric accumulation and to Mahākāla.'
  ],
  10: [
    'The pretas are the hungry ghosts, and the Kośa gives their realm a location — five hundred yojanas beneath Jambudvīpa, with Yama\'s city at its centre — and then immediately complicates it by adding that many of them live scattered among human beings, unseen. Both readings are kept. It is a realm with an address and also a condition that can be standing next to you.',
    'The suffering is specific and it is all about scale. The texts give enormous bellies and throats no wider than a needle, so that what can be swallowed cannot satisfy, and what is swallowed turns to fire or filth on the way down. Some pretas see a river and find it dry; some see food that burns. The cause given is greed, and the punishment is built to make the greed permanent by making satisfaction structurally impossible.',
    'The Kośa reckons their life at five hundred years counted in months — fifteen thousand of ours. Those who live among people are said to suffer least, which is the one mercy the description allows.'
  ],
  11: [
    'The animals are the widest of the destinies and, the Kośa says, the most numerous. Its first placement of them is not the forest or the field but the great ocean, and only then the land and the air — a reminder that this cosmology was assembled by people who had reckoned with how much of the world is water.',
    'The cause given is intentional ignorance: not the absence of understanding but the refusal of it, the choice not to look. The consequence is a mind that runs on instinct and cannot turn on itself, and the sources treat that inability as the whole of the suffering. There is no torment in the animal realm comparable to a hell; there is only the impossibility of practice, and for a tradition that measures a birth by what it lets you do, that is enough.',
    'Their span is not fixed as the gods\' and hell-beings\' are. The great nāgas are said to reach an intermediate kalpa and the smallest creatures a day. On the board more squares lead here than to any other destiny, which is the one statistical judgement the game makes on our chances.'
  ],
  12: [
    'The divine animals are not an Abhidharma category. They come from the iconography — the swans, peacocks, stags, elephants and lions that carry the gods, draw their chariots and appear in the pure lands as ornament and as mount. What sets them apart from ordinary animals is the manner of their birth: miraculous, like a god\'s, and not from a womb or an egg.',
    'The board keeps them because the painted tradition keeps them, and places them one square above the animals, which is a judgement of sorts: better than the ocean and the field, still not a human birth, and still without the leisure to practise. The Kośa would file them under animals without comment; the board gives them a square of their own and lets the difference show.',
    'Five faces lead out, three of them to the heavens, which is the highest reach of any square in the underworld row.'
  ],
  13: [
    'The nāgas hold the waters, the rain and the treasures beneath the ground. The iconography shows them human from the waist up and serpentine below, often hooded, and the sources locate them where their world meets ours — a spring, a lake, the bend of a river, the foot of a particular tree. Disturbing such a place is understood to disturb them, and much of Tibetan practical religion is concerned with not doing so.',
    'They are wealthy and powerful and quick to anger, and they are also, in the Mahāyāna account, custodians: the Prajñāpāramitā sūtras are said to have been kept in the nāga realm until Nāgārjuna brought them back, which gives a serpent kingdom a place in the transmission of the teaching itself.',
    'The board files them among the underworld beings, below the golden ground, and gives them the same six destinations as Divine Animals beside them — the two squares are interchangeable in play, which suggests the compiler regarded them as roughly equivalent fortunes.'
  ],
  14: [
    'The rākṣasas are man-eaters who work at night: the sources put them in burning grounds and on roads, give them blood-red bodies, and credit them with carrying off children. They can take any shape they like, which is the detail that makes them frightening in the literature — the danger is not that you will see one but that you already have.',
    'Their island is placed south beyond Jambudvīpa, which is why the board reaches it from the southern continent and from the hells beneath it, and the geography matters: this is the island Padmasambhava is said to have gone to and subdued, and the one to which the last of the dharma is sometimes said to withdraw. A demon island in the far south is not only a hazard in this literature; it is also a frontier.',
    'Six faces out. One of them, on a two, reaches the greater path of tantric accumulation, which is the longest single jump the board allows from below the ground.'
  ],
  15: [
    'The asuras are the not-gods, and their whole character is a grievance. They were of the Heaven of the Thirty-three and were expelled from it — the story has them made drunk and thrown out — and they have made war upward ever since, climbing Meru and being beaten back. They have the gods\' wealth and none of the gods\' ease, which the tradition treats as the worse arrangement of the two.',
    'The Kośa does not count them as a sixth destiny. It puts them variously among the gods, the animals or the pretas depending on the passage, and the inconsistency is not hidden. The Tibetan tradition, following Tsongkhapa among others, gives them a realm of their own at Meru\'s submerged base, and the six-destiny scheme familiar from the wheel of life follows that reading rather than the Kośa\'s.',
    'They are not drawn in this model, because the sources that place them give them no dimensions. On the board they stand below the ground with the other underworld beings, and six faces lead out.'
  ],
  16: [
    'Rudra is the criminal yogi: the practitioner who completes the work and takes the fruit for himself. The four worldly attainments — pacifying, enriching, subjugating, destroying — are real and are taught, and they are meant as instruments. Pursued for their own sake, they produce exactly what they promise, which is the trap. Rudra is not a failure of technique. He is what success looks like without the aim.',
    'The name means the howler, and the Śaiva figure behind it is not incidental; the Buddhist tantras tell the subjugation of Rudra as a founding episode, and what is subdued is afterwards employed. The board declines the horror-story version and calls the square Black Freedom: a real freedom, of a kind, and black.',
    'It can be reached from one square only — the lesser path of tantric accumulation, on a five — and one throw leads out of it, on a two, to Mahākāla. The board is making an argument in that arrangement: the wrathful energy that ruins a practitioner and the wrathful energy that protects the teaching are the same energy, and the distance between them is a single throw.'
  ],
  17: [
    'Jambudvīpa is the southern continent and the one we are on, and the sources call it the fortunate birth in terms that are worth reading closely, because the grounds they give are not comfort. The life is short. The world is hard. Disease and hunger are ordinary here in a way they are not on the other three continents.',
    'That is the argument. A being on Uttarakuru lives a thousand years in ease and never turns to the dharma; a god in Tuṣita is too content to feel the need. Here there is the stimulus to seek a way out, the leisure and faculties to act on it, and a buddha\'s teaching within reach — and the sources hold that all three coincide almost nowhere else. The continent is drawn tapering to the south, and its rose-apple tree gives it its name.',
    'The board starts the sūtra route here: a one from this square reaches the Mahāyāna path of accumulation, and a four reaches the disciples\'. Six faces out, more than any other continent, and one of them falls to Reviving Hell.'
  ],
  18: [
    'Aparagodānīya lies west of Meru, round in outline, and takes its name from cattle: the wealth there is reckoned in herds and the herds serve as currency. The Kośa gives its people five hundred years and a body larger than ours.',
    'The dharma is present on this continent but does not flourish, and the sources are direct about why — the living is easy and the diet is meat, and neither disposes anyone to renunciation. No buddha appears here. It is a good birth by any measure a human being would use and a poor one by the measure this cosmology uses, and the board keeps that tension by placing it in the human row and giving it no route higher than the heavens.',
    'Six faces out, one of them to the disciples\' path of accumulation.'
  ],
  19: [
    'Pūrvavideha is the eastern continent, semicircular, and lit differently from the others because the eastern face of Meru is crystal and throws a clear white light across it. Its people are tall, well-formed and mild, and the Kośa gives them two hundred and fifty years.',
    'The name is usually read as "noble body" or "surpassing body", and the commentators are careful to note that videha here is not the vi-deha of "bodiless" — the continent is famous for its bodies, not for the lack of them. It is the sort of philological caution the Abhidharma literature is full of, and the kind of thing a translator learns to check before rendering.',
    'The board gives it six faces, two of which reach the vehicles of training — the independent buddha\'s path on a one and the disciples\' on a two — and the rest of which fall back to the underworld.'
  ],
  20: [
    'Uttarakuru is the northern continent: square, shaded green by the emerald north face of Meru, and the happiest of the four. The harvest grows unsown. There is no private property and no marriage. The people are undisturbed by want and live a thousand years, and — this is the part the sources insist on — the span is fixed and cannot be shortened, so nobody there dies early and nobody is killed.',
    'The Kośa counts every one of these against it. Where there is no want there is no question, and where there is no question there is no path; no buddha appears on Uttarakuru and no one there takes up the teaching. It is the clearest statement the system makes of its own values: this cosmology rates a birth by what it permits you to understand, not by how it feels to live.',
    'Its Tibetan name, sgra mi snyan, means unpleasant sound, and comes from the one grief allowed there — a voice heard seven days before death, announcing the day. Five faces lead out, and all of them go down.'
  ],
  21: [
    'A human birth in a society organised around war. The board reads this as a condition rather than a place — a way of living available anywhere, not a region on the map — and the 1977 edition pictures it as rocky country, the mountains reddened.',
    'It is the lowest of the human squares, and its position tells you what the compiler thought: it sits with Hinduism and Bön in the row of conditions rather than continents, and it is the only square in that row from which a single throw reaches a hell. The cause given is cruelty and the habit of settling things by force, and the consequence is a birth in which that habit is normal and therefore invisible.',
    'The board is not neutral here and it is not subtle. But it is worth noting what it does not do: it does not make the condition permanent. Six faces lead out, and two of them reach the human continents.'
  ],
  22: [
    'A birth into the brahmanical culture of India, which the board draws as a fortunate one and a green and fruitful country. The arts and sciences flourish there, and the analysis of mind and of language is as advanced as anywhere the tradition knows — the Buddhist scholastics learned their logic in the same schools and argued in the same vocabulary.',
    'What the Buddhist sources withhold is the last step. The objection is not to the rigour or to the practices, both of which are granted; it is to a self that survives the analysis — an ātman, however refined, left standing at the end. On that reading the whole apparatus can work beautifully and still not reach a conclusion, and a birth here is a good birth in which the final question stays closed.',
    'The board is more generous than the polemic: two throws from this square reach the Mahāyāna path of accumulation and the Hindu wisdom-holder, and the square itself is one of only two from which the vidyādhara attainments of another tradition can be reached at all.'
  ],
  23: [
    'Bön, as the 1977 edition presents it: not a variety of Buddhism but its alternative in Tibet, older on the plateau, with its own transmissions and its own attainments. The characterisation belongs to that edition and to the polemical literature it drew on — Bön\'s own account of itself is different, and the scholarship since has complicated both.',
    'What the board does with it is more interesting than what it says about it. Bön gets its own wisdom-holder at square 65, exactly as the Hindu traditions get one at 62: a real attainment, reached by real practice, sitting on the board as a destination you can occupy. What neither leads to is the buddha\'s path directly — the routes out of square 65 run to the Mahāyāna and to the pratyekabuddha\'s path, but only after the attainment has been left behind.',
    'Six faces out, one of which reaches the Heaven Without Fighting and one of which falls to the Howling Hells.'
  ],
  24: [
    'Every token starts here, and nothing on this square is chosen. The board sets the player in the present human life at a junction of six roads, each a different colour, and the first throw of the die sends them down one of the six destinies: the gods, human beings, the animals, the pretas, the asuras, the hells. That is the whole proposition of the game stated in one square.',
    'It is worth noticing what the game does not do. There is no starting move that rewards intention, no square where a player declares what they are aiming at. The die names the road, and it does so before anyone has had a chance to earn anything. Whatever moral arithmetic the board contains is expressed in the shape of the graph — in which squares are reachable from which — and not in the throws.',
    'Six faces, and they are the six destinies exactly: the Heaven of the Four Great Kings, Jambudvīpa, the asuras, the animals, the pretas, and Reviving Hell. The compiler arranged this square deliberately and it is the only one on the board that is a diagram of its own doctrine.'
  ],
  25: [
    'Setting out on the vehicle of mantra. The board runs the tantric route up one side of the grid and the sūtra route up the other, and this is where the first begins — from Jambudvīpa, on a two, or from Demon Island, on a one, which is a pairing the compiler presumably enjoyed.',
    'What distinguishes the vehicle, in its own account, is not a different goal but a different speed and a different risk. The sūtra path is reckoned in three countless aeons; mantra proposes the same result in a lifetime, by taking the fruit as the path — practising as the buddha one intends to become rather than towards becoming one. The price of the shortcut is the bond: a qualified teacher, and vows taken from them that cannot be set down.',
    'The board states the risk in its geometry. Vajra Hell sits at the foot of this column, one throw from the first stage of substantial practice, and there is no comparable hazard anywhere on the sūtra side.'
  ],
  26: [
    'A cakravartin is the monarch who unites the world under a single righteous rule, and the Kośa treats the office as a technical matter rather than a legend. There are four grades, distinguished by the wheel that appears to the king — gold, silver, copper, iron — and the grade determines the reach: all four continents, three, two, or one. The wheel appears of itself, rolls ahead, and the kingdoms it reaches submit without a battle.',
    'The seven emblems of such a king — wheel, jewel, queen, minister, elephant, horse, general — are the same seven offered in the maṇḍala of thirty-seven that this drawing also builds, which is one of the places where the two halves of this project touch.',
    'The board keeps the office human. It sits in the row of human conditions, not among the gods, and no throw from it reaches higher than the Heaven Without Fighting. Universal sovereignty is the most a human life can achieve on its own terms, and on this board that is not very much.'
  ]
  ,
  27: [
    'The lowest of the six heavens of sense desire, and the only one that stands on the mountain rather than floating above it: its gods live on Meru\'s fourth terrace, on the lower slopes, along the seven golden ranges and in the skies between. It is the most populous and the least exalted of the divine births.',
    'The four kings each hold a direction and look outward from the mountain\'s sides — Dhṛtarāṣṭra east, Virūḍhaka south, Virūpākṣa west, Vaiśravaṇa north — and they are guardians rather than rulers: their office is to watch the quarters and report upward to Trāyastriṃśa. Vaiśravaṇa, the northern king, doubles as the god of wealth, which is why he appears so often on his own in Tibetan painting.',
    'The Kośa gives their life as five hundred of their years, one of their days being fifty of ours. The board reaches this square from more places than any other heaven, including the temporary hells and the animals, and six faces lead out of it.'
  ],
  28: [
    'Trāyastriṃśa, the Heaven of the Thirty-three, stands on Meru\'s summit, with the city of Sudarśana at its centre and Śakra — Indra, the old Vedic warrior god, retired into a dharma protector — in the palace at the middle of it. The thirty-three are a group, not a level: Śakra and thirty-two others, and the number is inherited from the Veda rather than derived from anything in the Abhidharma.',
    'This is the heaven the human world touches most often. The Buddha is said to have gone there to teach his mother and to have descended again by a ladder at Sāṃkāśya, one of the eight great deeds; it is where the asuras attack and are repelled; and the Kośa gives its gods the powers of sense and body that the lower heaven lacks.',
    'This drawing builds its summit, its city and Śakra\'s palace, so the board\'s marker for this square floats above geometry that is already there. Six faces out, one of them to the Heaven Without Fighting above it.'
  ],
  29: [
    'Yāma is the first heaven that leaves the mountain. It hangs in space above the summit, and the Kośa marks the change carefully: the strife that reaches as high as Trāyastriṃśa, where the asuras come climbing, cannot reach here. The name is read as "without fighting", and the security is the whole point of the level.',
    'Each heaven above this one doubles the one below it — twice the height above the sea, twice the lifespan, and a correspondingly finer body. The arithmetic runs all the way up the desire realm and it is meant to be felt as a sequence rather than a list.',
    'The board gives it six faces and puts the two heavens above it within one throw. It is also one of the few heavens reachable directly from the row of human conditions — a three from Bön arrives here.'
  ],
  30: [
    'Tuṣita, the Joyful, is only the fourth of six, and it matters out of all proportion to its height. The sources make it the last abode of a bodhisattva before the final human birth: Śākyamuni waited here and taught here before descending, and Maitreya waits here now. A rebirth in Tuṣita is therefore not merely pleasant; it is a position in a sequence that ends in buddhahood.',
    'The Tibetan tradition extends the association. Tsongkhapa is held to have gone to Tuṣita, and Gelug practice includes the aspiration to be born there — one of the very few heavens the tradition actually recommends aiming at, for the reason that you can leave it in the right direction.',
    'The board agrees emphatically. All six faces of this square lead into the Mahāyāna — the paths of accumulation and application, and the Path of Application squares above them. There is no other square anywhere on the board, in any row, whose every face leads to a single vehicle.'
  ],
  31: [
    'Nirmāṇarati, the fifth heaven of sense desire, whose gods enjoy what they themselves emanate. They need no object to be present: the wish and the enjoyment are the same act, and the texts extend this to the whole range of pleasure, including the sexual, which at this level is said to be consummated by laughter or a glance.',
    'The sequence up the desire realm is a sequence of increasing distance from the object. On the mountain the gods eat and fight; higher up, the objects grow finer; here they are produced by the mind that enjoys them; and in the heaven above, other beings produce them. Desire has not gone — that is what makes this still the realm of desire — but the world has stopped resisting it.',
    'Six faces, and only one of them, on a two, goes up: to Tuṣita, which is below it. The board has its own opinion about which of the two is the better place to be.'
  ],
  32: [
    'Paranirmitavaśavartin is the summit of the realm of sense desire, and its gods are served by the emanations of others: whatever they might want is anticipated and produced for them by the classes below. The name says it plainly — they exercise power over what others emanate.',
    'This is also Māra\'s heaven. The tradition places the lord of desire at the top of desire\'s realm, which is the right structural instinct: the adversary of the path is not a force from outside the system but its own highest achievement. Above this there is nothing further that desire can reach, and the next level up is already the Realm of Form.',
    'Five faces lead out, and the board makes one of them, on a two, the Realm of Form — the only square in the desire heavens with a direct route into it.'
  ],
  33: [
    'Kriyātantra, the tantra of activity, is the first of the four classes and the first substantial tantric practice on the board. Its concern is purity: of the place, the implements, the body, the food, the hour. The deity is generated in front of the practitioner and approached as a servant approaches a lord, and the relationship is deliberately asymmetrical — nothing here proposes identity with the deity.',
    'To a reader arriving from the higher tantras this looks preliminary, and the tradition is not entirely innocent of that judgement. But it is a complete vehicle in its own terms, with its own attainments, and much of what is practised daily in Tibetan religion — the ritual of purification, the offering of water bowls, the recitation directed to a deity standing in front of one — belongs here.',
    'Four faces lead out. Two go up the tantric column. One, on a five, reaches Rudra. One, on a six, falls to Vajra Hell. No other square on the board puts the two worst outcomes it knows within a single throw of the first real step.'
  ],
  34: [
    'Mahākāla, taken not as a deity met but as a state occupied: the wrathful energies turned wholly to the protection of the teaching. The board counts him among the protectors who transcend the world rather than those bound to it by force — a distinction the tradition takes seriously, since a worldly protector is a spirit under oath and a transcendent one is an enlightened mind appearing in a wrathful form.',
    'The iconography gives him a third eye, a crown of skulls, and a body black as the sky before anything appeared in it, and the reading offered for the blackness is that it is not an absence of light but the colour of what cannot be altered. He is the protector of the Sakya lineage in particular, which matters here: the game is attributed to Sakya Paṇḍita.',
    'Three faces lead out and every one is high — Uḍḍiyāna, the fifth tantric stage, and the northern Buddha field. Reaching Mahākāla from Rudra, one square away, is the sharpest turn the board offers.'
  ],
  35: [
    'The Realm of Form: seventeen levels in four absorptions, entered by meditation and not by merit. The karma that produces it is called immovable — neither good nor bad in the ordinary sense — because it is not the fruit of an act done to someone but the settled residue of a mind that has stopped grasping at sense objects.',
    'The bodies there are made of light and need no food. The Kośa goes into considerable detail on what falls away at each of the four absorptions: at the first, the coarser applications of thought; at the second, thought itself; at the third, joy; at the fourth, the breath. Each subtraction is presented as an increase.',
    'The board takes the whole realm as one square, and gives it six faces — three of them downward, to Jambudvīpa, the Four Great Kings and the Joyful Heaven, and one up to the Pure Abodes. Altitude in this cosmology is not the same as progress, and the board never lets the player forget it.'
  ],
  36: [
    'The Formless Realm: four absorptions beyond matter as well as beyond desire. Infinite space, then infinite consciousness, then nothing whatever, and finally the summit of existence where perception neither is nor is not. Each is entered by taking the previous one as too coarse and letting it go.',
    'These are the attainments the Buddha is said to have learned from Āḷāra Kālāma and Uddaka Rāmaputta before his awakening, and then set aside — not because they are false but because they end. A being at the summit of existence remains there for eighty-four thousand great kalpas and then falls, with nothing understood, and the fall can go anywhere.',
    'The board states this more bluntly than any text would. Four faces lead out of the highest realm in the cosmos, and three of them are the human continents, the animals, and the Howling Hells. It is the sharpest thing the game has to say, and it says it in the move table.'
  ],
  37: [
    'The Śuddhāvāsa, the five pure abodes at the top of the Realm of Form, reached by the strongest practice of the fourth absorption. Their inhabitants are non-returners — beings who will not be born again at any lower level, and who complete the path from here. Avṛha is the first of the five and Akaniṣṭha the last, which the board keeps as a separate square at 84.',
    'These are the only heavens in the whole system that are, in effect, safe. Everywhere else a being falls when the merit runs out; here the trajectory is fixed and runs one way. The Kośa also notes that the pure abodes survive the destruction of the world at the end of a great kalpa, along with the formless absorptions — the fire that reaches as high as the first absorption does not reach them.',
    'Five faces out, and the board sends four of them back into the Mahāyāna rather than higher. Even a heaven you cannot fall from is not the path.'
  ],
  38: [
    'The first of the five paths, in the vehicle of the disciples. It begins when a settled disgust at the round of birth turns into method, and its work is accumulation: the roots of the wholesome planted deliberately, in quantity, over a long time.',
    'The Kośa gives the practices — the repulsiveness of the body, to loosen desire; the breath, to settle a scattered mind; dependent origination, to dismantle the sense of a self doing the arising; the four boundless states. None of these is yet insight. They are the conditions under which insight becomes possible, and the tradition is unembarrassed that this stage is long.',
    'The board starts this route from Jambudvīpa on a four and from the Western Continent on a one, and six faces lead out of it — including one, on a five, that falls to the animals. The early paths are not secure.'
  ],
  39: [
    'The path of application, where accumulated merit is turned on the doctrine itself. The four truths are approached in sequence and in their aspects — sixteen in the standard analysis — and the mind is trained to hold them steadily enough to look at them rather than merely assent.',
    'The four stages of this path are named heat, summit, receptivity and the highest teachings of the world; the board spells them out only on the Mahāyāna column, at squares 55, 56, 63 and 64, and leaves them implicit here. Heat is the first warmth of a fire not yet alight. The last of the four is the final moment of an ordinary being: the one after it is the path of vision.',
    'Six faces out, and two of them lead to the same square — 52, the Mahāyāna path of accumulation — which is the board quietly offering a change of vehicle.'
  ],
  40: [
    'Vision and cultivation taken as one square. On the path of vision the four truths are seen directly rather than inferred, and the sources treat that moment as a discontinuity: what falls away at it are the afflictions that come from wrong view, and they do not come back. The path of cultivation is the long work after — making the seeing habitual, wearing down the afflictions that come from habit rather than from belief, which are the more stubborn of the two.',
    'Compressing two of the five paths into one square is a real compression, and the board is doing it for space. What it gains is a row of eight that holds the whole disciples\' vehicle; what it loses is the distinction between the insight and the labour of living up to it.',
    'Six faces lead out and every one of them returns to the heavens. The board is not saying the practitioner falls; it is saying that the fruit of the practice, before it is completed, is a good rebirth.'
  ],
  41: [
    'Caryātantra, the tantra of both, named for combining outer ritual with inner yoga. The deity is still generated in front of the practitioner, but as a friend or a brother rather than a lord — the asymmetry of the first class has begun to close, and the practice now includes the yoga of taking on the deity\'s form as well as the ritual of approaching it.',
    'The middle of the three accumulation stages on the tantric route. The board pairs its progress against the Mahāyāna column square for square, so that the reader can see the two ascents running in parallel and compare what each reaches by the same row.',
    'Five faces out. Two go up the tantric column, two reach the sacred lands of Potala and Shambhala, and one, on a five, reaches the first of the wisdom-holder attainments.'
  ],
  42: [
    'Yogatantra, the third class, wholly internalized. The maṇḍala and its five buddha families are built by visualization in the practitioner\'s own body, and the deity is not approached but invited into what has been built: the knowledge being, jñānasattva, descends into the samaya being the practitioner has constructed and the two become indistinguishable.',
    'This is the point at which the tantric vehicle\'s distinctive claim becomes operative. In the sūtra vehicles the result is produced by causes over aeons; here the result is taken as the path, and the practice consists in being, provisionally and by imagination, what one intends actually to become.',
    'Three faces out. Two are the first two stages of the path of application; the third, on a six, reaches Shambhala. More squares on the tantric column lead back to this one than to any other, which makes it the hinge of that route.'
  ],
  43: [
    'The pratyekabuddha — the independent or solitary buddha — reaches awakening in an age when no buddha is teaching, and does not teach afterwards. The sources explain the position rather than simply asserting it: such a being attended buddhas in former lives and heard the doctrine then, but did not complete the path, and what was left undone is completed alone in an age without instruction.',
    'What they are said to realize directly is dependent origination — the twelve links, seen whole, without the four truths being set out for them. The tradition treats this as the harder route and the narrower one, and it does not treat the refusal to teach as a moral failure: a solitary buddha arises precisely when there is no one able to receive the teaching.',
    'The board runs this vehicle in parallel with the disciples\', five paths for five, at squares 43 to 47. Six faces out, two of them to the Mahāyāna and two of them downward.'
  ],
  44: [
    'The path of application on the solitary route, and the sources set it in the forest and let it run for a very long time. Its particular practice is the four applications of mindfulness — of the body, of feelings, of states of mind, and of the dharmas — taken in that order and each used to undercut a different assumption.',
    'The last of the four is the one that does the work here. Mindfulness of dharmas takes up impermanence itself: not the observation that things end, which anyone will grant, but the finer claim that what appears continuous is a succession, and that the continuity was supplied by the observer.',
    'Six faces out, and the spread is wide — Tuṣita on a one, the northern continent on a four, the disciples\' path of application on a five.'
  ],
  45: [
    'The path of vision on the solitary route: birth and death examined until the chain is seen entire and at once. The sources describe the pratyekabuddha arriving at this by attention to a single thing followed far enough — a leaf falling, the decay of a corpse, a field gone to seed — rather than by instruction.',
    'What distinguishes the seeing from the disciple\'s is not its content but its self-sufficiency, and the tradition is divided on how much that is worth. It is unquestionably an achievement. It is also, from the Mahāyāna side, a dead end, since nothing goes out from it to anyone else.',
    'Six faces out, four of them onward within the vehicle and two of them back to the human continents and the heavens.'
  ],
  46: [
    'The path of cultivation on the solitary route: the vision made continuous, and the attachments that arise from grasping, from rejecting, and from bewilderment destroyed one after another. The Abhidharma\'s list of what is abandoned at which stage is exhaustive and is meant to be — the claim is that the process is orderly and can be checked.',
    'Because nothing was received, nothing can be handed on, and the sources repeat this at every stage of the route rather than only at its end. The solitary buddha\'s powers are real: the Kośa grants supernormal knowledge and the ability to work wonders. What is absent is speech.',
    'Six faces out, including one to the disciples\' arhatship and one to the Pure Abodes.'
  ],
  47: [
    'Arhatship on the solitary route. The fifth path is called no more learning, and what is attained is nirvāṇa with a substrate remaining — the defilements gone, the afflictions cut, but the body and mind produced by former karma still running until they stop.',
    'The Tibetan traditions add a caution that the board keeps and that the earlier literature does not share: that this is not the end, and that one may yet fall back from it — or, more precisely, that the peace attained here will eventually be interrupted by the buddhas, who rouse the arhat and set them on the greater vehicle. What looks like a terminus turns out to be a long pause.',
    'Four faces lead out. One, on a two, is Cessation — the board\'s second trap, and the literal enactment of that long pause.'
  ],
  48: [
    'Nirvāṇa without residue, entered when an arhat dies: the substrate exhausted, nothing further produced, and — on the earlier reading — nothing further to say. The Mahāyāna reading is what makes this square a trap rather than a victory.',
    'On that reading the peace is real and it is not final. The arhat rests in it for an immense span, and is then roused by the buddhas, who tell them that the work is not done and that there are beings still to help, and set them on the bodhisattva path with a great deal of time lost. The board renders this as twenty-one throws — one 1, two 2s, through six 6s — and then an exit to square 52, the Mahāyāna path of accumulation, which is exactly where the rousing leaves you.',
    'It is the cleverest thing on the board. A doctrinal disagreement between two vehicles has been turned into a game mechanic, and a player sitting in Cessation counting throws is, without being told anything, experiencing the Mahāyāna\'s objection to the arhat\'s goal.'
  ],
  49: [
    'The first of the four initiations of anuttarayogatantra, the supreme class, conferred on a yogi already settled on the path. The vase initiation purifies the body and authorizes the practice of the generation stage; the tradition holds that it sows the seed of the emanation body.',
    'The board names it heat, borrowing the vocabulary of the sūtra path of application, and does the same for the three that follow. The borrowing is not careless: the tantric literature maps its own stages onto the five paths precisely so that the two can be compared, and the board is reproducing a comparison the tradition itself makes.',
    'Two faces out, both onward. From here the tantric column narrows and stops falling.'
  ],
  50: [
    'The secret initiation, second of the four, which the tradition holds will bear fruit as the enjoyment body of a buddha. It works with speech and with the subtle body — the channels, the winds and the drops — and it is the point at which the practice moves inside the anatomy that the completion stage will work on.',
    'The board names it climax. Its sources for these four stages are the standard Tibetan presentations of the supreme tantra, and what the board contributes is the ordering: four initiations occupying four squares in a row of eight, so that the ascent is legible as a sequence rather than a doctrine.',
    'Two faces out, one to receptivity and one to the first tantric stage proper.'
  ],
  51: [
    'Arhatship in the vehicle of the disciples, and the end of that route. The afflictions are gone; the round of birth is cut; what was to be done is done. In its own terms this is complete, and the earlier literature treats it as the goal the teaching exists to produce.',
    'The board places it in the middle of the grid rather than near the top, which is a judgement rendered as geography. Three faces lead out: two into the Mahāyāna — the path of accumulation and the Pure Abodes — and one, on a two, into Cessation, which is the trap.',
    'So the board offers the arhat a choice it does not describe as a choice. Two thirds of the exits lead onward into the greater vehicle, and one third leads into a peace that will hold them for twenty-one throws and then put them on the same road anyway.'
  ],
  52: [
    'The lesser path of accumulation in the great vehicle, entered by the arising of bodhicitta — the mind that intends awakening for the sake of every being. What distinguishes this route from the two below it is not the technique and not the analysis, both of which it shares; it is the scope of the intention.',
    'The sources describe the arising as a genuine event rather than a resolution repeated. Before it, practice is directed at one\'s own liberation; after it, the same practices are performed with a different object, and the tradition holds that this changes what they produce. The path is reckoned in three countless aeons from here, and the length is presented as a feature: anyone unwilling to accept it has not understood the scope.',
    'More squares lead to this one than to any other square on the board — seventeen of them, from every part of the grid including the hells\' upper reaches. Whatever else the compiler believed, they arranged the graph so that the Mahāyāna is the easiest thing on the board to fall into.'
  ]
  ,
  53: [
    'The middle path of accumulation. The board grades accumulation in three on the Mahāyāna route exactly as it does on the tantric one, and the two columns climb the grid in step, which lets a reader see at a glance how far each has got by any given row.',
    'What accumulates is merit and knowledge — the two collections, gathered in parallel — and the division of the path of accumulation into lesser, middle and greater follows the standard Tibetan presentations. The marker of the transition is not a quantity but a capacity: at the greater stage the practitioner can meet buddhas in meditative absorption and receive teaching there.',
    'Six faces out. Two climb the column, two reach the Pure Abodes and the disciples\' vision, and two fall — to the asuras, and to the temporary hells.'
  ],
  54: [
    'The greater path of accumulation, the last stage before application. By this point the two collections are substantial, the practitioner is stable in absorption, and the four bases of miraculous power are available.',
    'The board is generous with this square: four faces, none of them downward. Two continue up the sūtra column and two go out to the sacred lands — Potala on a three, Shambhala on a four. It is one of only three squares on the board from which Shambhala can be reached at all.',
    'The pairing is worth a moment. A route that has almost completed its accumulation can turn aside to a kingdom that holds a tantra in trust, or to the mountain of the bodhisattva of compassion. Neither is a detour on this board — both lead onward.'
  ],
  55: [
    'Heat, the first of the four stages of the Mahāyāna path of application. The name is the tradition\'s and the image is exact: the first warmth of a fire not yet alight. What is beginning to catch is the direct understanding of emptiness, approached until now by inference.',
    'The four stages — heat, summit, receptivity, the highest teachings of the world — belong to all three vehicles, and the board sets them out fully only here, on the Mahāyāna column, at 55, 56, 63 and 64. The disciples\' and the solitary buddha\'s routes have the same stages compressed into single squares.',
    'Two faces out, and both of them climb. From here to the first bodhisattva stage the route does not fall at all, which is the only stretch of the sūtra column of which that is true.'
  ],
  56: [
    'The summit, second of the four stages of application: the warmth at its height, and the point past which the roots of the wholesome cannot be destroyed by wrong view. The Abhidharma is precise about that guarantee, and it is the first guarantee the path offers.',
    'Before the summit, everything accumulated can in principle be lost. After it, the tradition holds that a practitioner may still fall into a lower birth but cannot lose the path itself. It is a modest security by the standards of what comes later and an enormous one by the standards of what came before.',
    'Two faces, both onward — to the highest teachings of the world, and to receptivity.'
  ],
  57: [
    'Receptivity on the tantric route: the third stage of application, where what has been understood is borne rather than merely grasped. The Sanskrit kṣānti is the same word as the perfection of patience, and the double sense is deliberate — the mind can now tolerate the implication of emptiness without recoiling from it.',
    'The recoil is the thing being described. The sources are candid that a correct understanding of emptiness, arrived at before the mind is ready to hold it, produces fear, and that the fear can turn a practitioner away from the path for a long time. Receptivity is the name for no longer needing to look away.',
    'Four faces out. One, on a four, reaches Sukhāvatī directly — the only square below the stages that touches a Buddha field.'
  ],
  58: [
    'The highest teachings of the world on the tantric route: the last stage of application, and the last moment of an ordinary being. The moment after it is the path of vision, and the tradition marks the boundary sharply — everything up to here is worldly, however refined, and what follows is not.',
    'The name says so literally. These are the highest dharmas that remain within the world, and their function is to be the immediate condition for what supersedes them.',
    'Four faces out, and one of them, on a four, reaches Abhirati — the eastern Buddha field of Akṣobhya. The board gives the two last stages of tantric application a Buddha field each, which no other pair of squares receives.'
  ],
  59: [
    'Shambhala, the kingdom the Kālacakra literature places north beyond the Himālaya: ringed by snow mountains, laid out as a maṇḍala, ruled by a line of dharma kings, and holding the Kālacakra tantra in trust since it was taught to the first of them. The literature includes a guidebook to getting there and is clear that the journey is not only geographical.',
    'A prophecy attaches to it — a final king, a final battle, and the teaching restored afterwards — and the tradition has read that material literally, allegorically, and as a description of the subtle body, sometimes all three at once.',
    'The sources put it on the earth without fixing where, which is precisely why this board has to invent a place for it: the Meru world system has no coordinate for a kingdom that is here and cannot be found. Six faces lead out, more than any other of the sacred lands, and they reach both columns — the sūtra route on a one, the tantric on a two and a four.'
  ],
  60: [
    'Potala, the mountain of Avalokiteśvara, which the sources place in the south — usually off the coast of India — and describe as a paradise of the bodhisattva of compassion rather than a Buddha field proper. The palace at Lhasa takes its name from it, on the reading that the Dalai Lamas are that bodhisattva\'s emanation, and the transfer of the name is itself an argument.',
    'What distinguishes it from the Buddha fields at 70, 76, 77 and 85 is that it is held to be on the earth. That is a real difference in this cosmology: a Buddha field lies outside the Meru system altogether, and Potala does not.',
    'Three faces out, all of them upward — the two last stages of Mahāyāna application, and the greater path of tantric accumulation.'
  ],
  61: [
    'Uḍḍiyāna, which the Nyingma tradition makes Padmasambhava\'s birthplace and the source of a great deal of the tantra, generally identified with the Swat valley in the north-west. In the literature it is a country of ḍākinīs, of practitioners who fly, and of teachings that were current there before they were current anywhere else.',
    'Like Shambhala and Potala it is on the earth and not on any map that this cosmology can draw, which is why the board has to place it itself. Unlike them, its reputation is specifically for transmission: what comes out of Uḍḍiyāna is texts.',
    'The board gives it the three highest exits available anywhere below the stages — the eighth tantric stage on a one, Akaniṣṭha on a two, the seventh tantric stage on a three. No other square below the top four rows reaches so high.'
  ],
  62: [
    'A wisdom-holder of the Hindu traditions. The vidyādhara — holder of knowledge, or of a spell — is a recognized attainment in Indian religion generally, and the board grants the Hindu version without qualification: the practices work and the powers are real.',
    'What it withholds is the destination. Two faces lead out of this square and both are Buddhist paths — the Mahāyāna path of accumulation on a one, the disciples\' on a two — so the attainment is not a step on the way to buddhahood but a condition one leaves in order to begin. The board says the same thing about the Bön wisdom-holder at 65.',
    'Whether that is a fair account of either tradition is a separate question, and the 1977 edition\'s framing reflects the polemical literature of its sources. It is recorded here as what the board holds.'
  ],
  63: [
    'Receptivity on the Mahāyāna route, third of the four stages of application, and the point at which emptiness can be borne. The four stages on this column run 55, 56, 63, 64 — the board breaks them across two rows, which is a consequence of the grid rather than of the doctrine.',
    'Four faces out, and two of them are Buddha fields: Abhirati on a one and Sukhāvatī on a four. That is unusual this far down the column, and it pairs with square 57, the same stage on the tantric route, which also reaches a Buddha field. The compiler evidently regarded receptivity as the stage at which the pure lands come within reach.',
    'The other two faces are the greater path of tantric accumulation and the last stage of application above this one.'
  ],
  64: [
    'The highest teachings of the world on the Mahāyāna route: the last station before the first bodhisattva stage, and the end of what an ordinary being can reach. Everything above this square on the sūtra column belongs to a noble one, an ārya, who has seen directly.',
    'The board also attaches its alternative trap quotas to the sixty-fourth note of the 1977 edition — a second reading of the order in which the counted throws must be made, which this drawing keeps as an option because the printed source supports it. It changes the sequence, not the total: twenty-one useful throws either way.',
    'Three faces out. One, on a one, is the first bodhisattva stage. One, on a two, crosses to the tantric column. One, on a five, reaches Sukhāvatī.'
  ],
  65: [
    'A wisdom-holder of the Bön tradition, set opposite the Hindu one at 62 and treated the same way: the attainment is granted and the destination is not. The asterisk this project puts on the Sanskrit reflects that the form is a reconstruction — the 1977 edition\'s categories do not all have attested Sanskrit originals, and it is better to mark that than to imply an authority the name does not have.',
    'Four faces lead out and the board splits them evenly. Two are Buddhist paths — the Mahāyāna on a one, the pratyekabuddha\'s on a two. Two fall: to the asuras on a five, and to the temporary hells on a six.',
    'That is a harsher arrangement than square 62 receives, and it belongs to the polemics of the edition\'s sources rather than to anything in the Abhidharma. It is worth knowing it is there.'
  ],
  66: [
    'The first of the ten tantric stages, entered when the four stages of application are complete. From here the column runs unbroken to the tenth, and the sources hold that the whole ascent can be made in one life — which is the claim the board is testing by running the tantric column and the sūtra column side by side up the same grid.',
    'The ten are borrowed from the bodhisattva stages, not derived independently. The tantric literature maps its completion-stage attainments onto the same tenfold count so that the two vehicles can be measured against one another, and this board reproduces the mapping rather than the doctrine behind it.',
    'Three faces out, all of them onward: the third stage, the fourth, and the second.'
  ],
  67: [
    'A wisdom-holder among the gods of sense desire: the vidyādhara attainment held within the lowest of the three realms. The board counts the wisdom-holder stations as tantric rather than divine — they are attainments of a practitioner, not births among gods — and places them accordingly.',
    'The four classical vidyādhara levels in the Nyingma presentation run from the matured to the spontaneously accomplished, and the board\'s set is not quite any standard list. It is an arrangement of its own, and this project marks the reconstructed Sanskrit with an asterisk for that reason.',
    'Four faces out, and all of them return to the tantric route below — middle and greater accumulation, the wisdom-holder of the Realm of Form, and the tantric cakravartin. The station is a place to have reached, not a rung.'
  ],
  68: [
    'A wisdom-holder of the Realm of Form, one level above the last. The progression from 67 to 68 follows the three realms upward, and there is no fourth for the formless — an absence that is probably deliberate, since a formless absorption has no body for a vidyādhara to hold anything with.',
    'Four faces out, and again none of them climbs the stage column: the greater path of accumulation, the first initiation, Shambhala, the middle path of accumulation. The wisdom-holder squares are a loop off the main ascent rather than part of it.',
    'That structure is itself a comment. These are real attainments that do not, on this board, advance you.'
  ],
  69: [
    'A cakravartin of mantra: the monarch of the tantric route as square 26 is of the ordinary one. The tradition does hold that a tantric adept can exercise a comparable sovereignty, and the board gives the office a square rather than treating it as a metaphor.',
    'It keeps it human, though — the square sits in the zone of human conditions, not among the attainments — and it gives it only two faces, both into the middle tantric stages. Sovereignty is not the path here either, on either side of the board.',
    'It can be reached from the wisdom-holder among the desire gods and from the second tantric stage, which is a slightly surprising pair: an attainment below and a stage above both open onto it.'
  ],
  70: [
    'Karmaparipūraṇa, the northern Buddha field, of Amoghasiddhi, whose name means unfailing accomplishment and whose function is the completion of action. Its family is karma, its colour green, its element air, its mount the garuḍa, and the wisdom associated with it is all-accomplishing — the understanding that acts without obstruction because nothing in it is held back for itself.',
    'The five Buddha fields of the five families are the standard set: Akṣobhya east, Ratnasambhava south, Amitābha west, Amoghasiddhi north, and Vairocana at the centre, whose field the board identifies with Akaniṣṭha at square 84.',
    'Five faces lead out, the most of any Buddha field on this board — to the seventh bodhisattva stage, the second and third tantric stages, the first bodhisattva stage, and back to Mahākāla.'
  ],
  71: [
    'The first bodhisattva stage, the joyous, entered on the path of vision when emptiness is seen directly for the first time. The joy is specific: the sources say it comes from knowing that buddhahood is now certain and that one is of use to others, and the two reasons are given together.',
    'Its perfection is giving, and the stages that follow each complete one of the remaining perfections in order. The bodhisattva on this stage is said to be able to shake a hundred world systems, visit a hundred Buddha fields and live a hundred aeons — figures that multiply at each subsequent stage, and are given as a way of indicating scale rather than as a curriculum.',
    'On the board the ten bodhisattva stages run from here at 71 to the tenth at 94, threaded up and down the rows rather than in order. Three faces out, and none of them goes to the second stage.'
  ],
  72: [
    'A wisdom-holder of the eight attainments — the eight ordinary siddhis of Indian tradition: the sword, the eye ointment, swift-footedness, invisibility, the elixir, flight, the pill, and the underworld. They are powers, not realizations, and every Buddhist source that lists them also warns about them.',
    'This is the highest of the wisdom-holder squares on the board and the pattern holds: three faces out, and all three go back down to the tantric route — to the wisdom-holder among the desire gods, to middle accumulation, and to the lesser stage where the route began.',
    'It can be reached on a one from Beginning the Tantra, at square 25, which is the board\'s sharpest warning. The very first square of the tantric route can send you straight to the top of the attainments, and from there the only way is back to the beginning.'
  ],
  73: [
    'The second of the ten tantric stages. More squares lead here than to any other stage on this column — six of them, from the initiations, the first stage, the Buddha fields and Abhirati — which makes it the point at which the tantric ascent gathers.',
    'The tenfold count is borrowed from the bodhisattva stages, and the tradition does not individuate the tantric ten with distinct names and perfections the way it individuates the bhūmis. What can be said about any one of them is mostly where it sits and what it reaches.',
    'Three faces out. Two climb; the third, on a six, falls back to the tantric cakravartin at 69 — one of the few downward throws remaining on this column.'
  ],
  74: [
    'The third tantric stage, and from here the column does not fall again: every face on every square above this one leads up or across. The narrowness of the route is the board\'s argument for it — fewer squares, fewer exits, and no way back.',
    'Two faces out, to the fourth stage and the fifth. Compare the sūtra column at the same height, which is still offering six-way throws with several of them downward, and the contrast the compiler intended becomes visible.',
    'Whether the contrast is fair is another matter. The tantric route is also the only one with a hell at its foot.'
  ],
  75: [
    'The fourth tantric stage, and the square that the stages below converge on: five of them reach it, more than any other stage on this column. If the tantric route has a waist, this is it.',
    'From here the ascent forks — to the sixth and seventh on a one and a two, or to the fifth on a three — and the board has arranged the last six stages so that most throws skip at least one. The ascent is fast by construction, not only by doctrine.',
    'Three faces, all upward.'
  ],
  76: [
    'Ratnakūṭa, the southern Buddha field, of Ratnasambhava, the jewel-born, whose function is to give what is needed and whose emblem is the wish-fulfilling gem. The family is the jewel, the colour yellow, the element earth, the mount the horse.',
    'The wisdom associated with it is the wisdom of equality: all things stand level on the broad earth, and what it counteracts is pride — the sense of standing above what one is looking at. The five wisdoms are each paired with an affliction in this way, and the pairings are the practical content of the five-family scheme.',
    'Three faces out — the fourth bodhisattva stage, and the third and second tantric stages — which is the pattern the other fields follow: one exit to the sūtra column, the rest to the tantric.'
  ],
  77: [
    'Sukhāvatī, the western Buddha field, of Amitābha, and by a wide margin the most sought in actual practice of all the pure lands. The reason is the promise attached to it: the sūtras hold that recollection of Amitābha at the moment of death is sufficient for birth there, and that from there one does not fall back.',
    'That is an extraordinary claim by the standards of the rest of this cosmology, where everything is earned by a reckonable quantity of merit over reckonable spans of time, and it is why Pure Land practice became the most widespread form of Mahāyāna devotion across East Asia. The Tibetan traditions keep it as an aspiration rather than a school.',
    'Two faces out: the first bodhisattva stage on a one, the third tantric stage on a two. One sūtra exit and one tantric — the pattern that argues for reading square 85\'s first face as 71.'
  ],
  78: [
    'The fourth bodhisattva stage, the radiant, whose perfection is vigour. The name is for what burns: the sources describe the last residues of the view of a self being consumed here, in a wisdom associated with the thirty-seven wings of awakening, which are cultivated to completion on this stage.',
    'The bodhisattva stages are not evenly weighted in the literature. The first, the seventh, the eighth and the tenth each mark a structural change; the others, this one among them, are described mainly by their perfection and their powers. The board treats all ten alike.',
    'Two faces out, both climbing the column.'
  ]
  ,
  79: [
    'The third bodhisattva stage, the luminous, whose perfection is patience. The sources associate it with the acquisition of the absorptions and the higher knowledges, and with a willingness to undergo anything for the sake of a teaching — the standard image is of a bodhisattva accepting to have their body used as a lamp in exchange for a single verse.',
    'The board sets it above the fourth stage in the grid and reaches the fourth from it, which is one of several places where the numbering of the stages and the geometry of the board pull against each other. Squares 78, 79 and 80 run fourth, third, second from left to right, and their throws cross over one another.',
    'Two faces out — the fifth stage on a one, the fourth on a two — so the column can only be climbed by going sideways first.'
  ],
  80: [
    'The second bodhisattva stage, the stainless, whose perfection is discipline. The name refers to the complete purification of conduct: the sources say the bodhisattva on this stage does not break the precepts even in dreams, which is a way of saying the discipline is no longer being maintained by effort.',
    'Its two throws reach the fourth stage and the third, and never the first — the board will not let this column be climbed in order, and the effect in play is that a player on the bodhisattva stages jumps about among them rather than ascending rung by rung.',
    'Whether that is a considered statement about non-linear progress or simply how the numbers fell on an eight-wide grid is not recoverable from the board itself.'
  ],
  81: [
    'The fifth tantric stage, and the point at which this route has drawn level with the middle of the bodhisattva stages on the other side of the grid. The two columns are meant to be read across, and the compiler has arranged the rows so that the comparison is available at every height.',
    'From here the column climbs in single steps, every one of them irreversible. Two faces out: the seventh stage on a one, the eighth on a two — so even a single step skips one.',
    'It can be reached from Mahākāla, from the tantric cakravartin, and from the second, third and fourth stages. Five squares converge on it.'
  ],
  82: [
    'The sixth tantric stage. It is the one square on this column that can skip two at once — the eighth on a one, the ninth on a two — which makes it the fastest square on the board by the measure of stages gained per throw.',
    'That is also, presumably, why the board puts the sixth above the seventh in its reading order rather than below it: the grid runs right to left, and placing 82 where it sits gives it the reach that 83 does not have.',
    'It can be reached from the fourth stage only, on a one, which balances the speed with scarcity.'
  ],
  83: [
    'The seventh tantric stage, and the first square on this column from which Akaniṣṭha can be reached in a single throw. Every stage above it keeps that reach, so from here on the summit of the Realm of Form is always one face away.',
    'What the board is saying by that arrangement is worth stating plainly: a tantric ascent arrives at Akaniṣṭha. In the tantric reading Akaniṣṭha is not merely the highest of the pure abodes but the place where a buddha\'s enjoyment body is manifested, and the board has wired its geometry to that identification.',
    'Two faces: Akaniṣṭha on a one, the tenth tantric stage on a two.'
  ],
  84: [
    'Akaniṣṭha, whose name means none higher: the last of the five pure abodes and the summit of the Realm of Form. In the Abhidharma it is the top of the material world and the abode of non-returners who complete the path from there without falling.',
    'The tantric and Mahāyāna traditions add a second Akaniṣṭha above the first — Ogmin in Tibetan, the densely arrayed — and make it the field of Vairocana and the place where a buddha\'s enjoyment body teaches the assemblies of bodhisattvas. The two are distinguished in careful presentations and run together in loose ones, and the board is using the second sense.',
    'It is the only Buddha field this drawing actually builds, because as the highest of the pure abodes it has a place in the Meru system; the other four do not. One face leads out, to the Dharma Body, and that is the only exit any square on the board has of a single throw to a buddha\'s body.'
  ],
  85: [
    'Abhirati, the eastern Buddha field, of Akṣobhya, the unshakeable. The sūtra that describes it is one of the oldest pure-land texts and its emphasis is unusual: Abhirati is a place where the conditions for practice are simply good — the ground level, the people well disposed, the obstacles absent — rather than a paradise of ornament.',
    'Akṣobhya\'s gesture is the touching of the earth, the same gesture with which the conquest of Māra is answered at square 100, and his vow was never to feel anger at any being. The family is the vajra, the colour blue, the mount the elephant, and the wisdom mirror-like: reflecting what is there without adding to it or being altered by it.',
    'The witnesses disagree on this square\'s first face. This board reads 71, the first bodhisattva stage, on the grounds that the other Buddha fields each give one sūtra exit and one tantric — Sukhāvatī reaches 71 and 74, Ratnakūṭa reaches 78 and the tantric stages. A second reading sends it to 73, doubling the second face. The alternative is recorded in the entry above rather than settled in silence.'
  ],
  86: [
    'The seventh bodhisattva stage, far-reaching, whose perfection is skill in means. The sources describe it as the stage at which the bodhisattva enters and leaves cessation in every moment: the peace that the arhat takes for the goal is available continuously and is continuously declined.',
    'That is the Mahāyāna\'s answer to the trap at square 48, and the board has placed the two squares to be read against each other. Cessation holds a player for twenty-one throws; this stage passes through it without stopping. The same attainment is a terminus in one vehicle and a technique in the other.',
    'It is also the last stage requiring effort. From the eighth onward the sources say the work proceeds without exertion, which is why the seventh is described as far-reaching: it reaches the end of what has to be done deliberately.'
  ],
  87: [
    'The sixth bodhisattva stage, facing-toward, whose perfection is wisdom and whose object is dependent origination seen whole rather than followed link by link. The name is read as facing toward nirvāṇa, or toward saṃsāra, and the commentators keep both: what the stage faces is the equality of the two.',
    'The sources put the bodhisattva here at the edge of the cessation the disciples take for the end, able to enter it and choosing not to. The seventh stage above makes that choice continuous; this one makes it for the first time.',
    'Two faces out, and they cross: the eighth stage on a one, the seventh on a two.'
  ],
  88: [
    'The fifth bodhisattva stage, hard to conquer, whose perfection is meditative absorption. The commentaries read the name two ways — hard for others to overcome, and hard for the bodhisattva to attain — and let both stand, which is the usual practice with these names.',
    'Its particular work is the reconciliation of the two truths: the conventional, in which beings suffer and are helped, and the ultimate, in which there is no one to help. Holding both without collapsing either is what the stage is for, and the sources say it is here that the bodhisattva masters the worldly arts and sciences in order to be of use.',
    'Two faces out, to the ninth stage and the sixth.'
  ],
  89: [
    'The eighth tantric stage. From here, and from the ninth and tenth above it, one throw reaches Akaniṣṭha and the other steps up the column — so each of the last three stages offers the same choice: the summit of form now, or one more stage first.',
    'Offering the same choice three times running is unusual on this board, which mostly varies its exits. The effect in play is that the end of the tantric route feels like a decision repeated rather than a ladder, and a player can arrive at Akaniṣṭha from any of the three.',
    'It can be reached from Uḍḍiyāna on a one, which is the longest jump into the stage column from anywhere below it.'
  ],
  90: [
    'The ninth tantric stage. The tradition does not individuate the ten stages of the tantric ascent as it individuates the ten bodhisattva stages, each with its name, its perfection and its powers; the count is borrowed so that the two routes can be measured against each other, and this board borrows it in turn.',
    'What can be said of this square specifically is its position: two faces, Akaniṣṭha on a one and the tenth stage on a two, and a single square below that reaches it.',
    'The absence of detail is not an oversight in the sources. The completion-stage attainments are described in terms of the subtle body and of what the practitioner can do, not in terms of a tenfold sequence, and the sequence is a later mapping laid over them.'
  ],
  91: [
    'The tenth and last tantric stage. Its second throw is the Dharma Body itself — a reach no square on the sūtra column has, where only the tenth bodhisattva stage arrives there and only on a one.',
    'This is where the board states its preference most plainly. Both routes reach the same place; the tantric one reaches it from a stage that can also be entered from the seventh and from Uḍḍiyāna, and it does so without passing through Akaniṣṭha first if the die allows.',
    'Two faces: Akaniṣṭha on a one, the Dharma Body on a two.'
  ],
  92: [
    'The enjoyment body, saṃbhogakāya, in which a buddha appears adorned and teaching to the assemblies of the pure lands — visible to bodhisattvas on the high stages, not to ordinary sight, and not subject to the conditions that end an ordinary body. The five certainties are the classical description: a certain place, a certain body, a certain retinue, a certain teaching and a certain time, all of them unending.',
    'The board puts it beside the Dharma Body on the axis above the summit, and makes the two mutually reachable — a one from each to the other — before the deeds begin. The loop is doctrinally exact: the enjoyment body arises from the dharma body and is not other than it, and nothing is gained by moving between them.',
    'One face out, to the first of the eight acts. The loop breaks in one direction only, and it breaks downward, into a physical birth.'
  ],
  93: [
    'The dharma body, dharmakāya: a buddha as the nature of things rather than as any appearance — without marks, without location, and not an object of anyone\'s perception. The three-body scheme presents it as what the other two are bodies of, and the tradition resists every attempt to make it a thing among things.',
    'The board makes it the convergence of both routes. The tenth tantric stage and the tenth bodhisattva stage each reach it, and so does Akaniṣṭha, and nothing else on the board does. Then its single face turns back to the enjoyment body — because what follows is not higher but visible, and because a dharma body that appeared to no one would be of no use to anyone.',
    'That turn is the board\'s argument about the purpose of awakening, made entirely in the move table.'
  ],
  94: [
    'The tenth bodhisattva stage, the cloud of dharma, whose perfection is knowledge and which the sources set immediately before buddhahood. The name is for what the bodhisattva does at this height: the teaching falls from them as rain falls from a cloud, over everything, without selection.',
    'This is the last stage. What separates it from buddhahood is the finest of the obscurations to knowledge, removed in the vajra-like absorption that ends the path.',
    'Two faces out: the Dharma Body on a one, and Akaniṣṭha on a two — the place where the enjoyment body is shown. The board gives the completed bodhisattva a choice between what a buddha is and where a buddha appears.'
  ],
  95: [
    'The ninth bodhisattva stage, of good discrimination, whose perfection is power. Its mark is the command of teaching itself: the four analytical knowledges — of dharmas, of meaning, of language and of eloquence — so that whatever any being needs to hear can be given in the form they can receive it.',
    'It is the most practical-sounding of the ten and, in a tradition that holds teaching to be the point, among the most consequential. The bodhisattva here is not more awakened than the one at the eighth stage; they are better at saying it.',
    'Two faces: the tenth stage on a one, Akaniṣṭha on a two.'
  ],
  96: [
    'The eighth bodhisattva stage, the immovable, from which there is no falling back. The sources treat this as the point of no return in the strong sense: the effort ceases, the work proceeds spontaneously, and the possibility of regression closes.',
    'It is also where the bodhisattva could enter final nirvāṇa and is prevented — the buddhas intervene and remind them of the vow, which is the same intervention described at square 48 for the arhat, arriving here at a much greater height and for a being who has not asked for the rest.',
    'The board agrees about the point of no return: from here the only throws are upward, to the tenth stage on a one and the ninth on a two.'
  ],
  97: [
    'The emanation body begins. A buddha takes a physical birth, and the last eight squares of the board run the acts of that body in order — the only stretch of the board where one and two do the same thing and no other face does anything at all.',
    'The classical list is of twelve deeds, and the board keeps eight of them: it starts at the birth rather than at the descent from Tuṣita, and it ends at the parinirvāṇa. What it produces by that compression is a straight run of eight squares in the top row, which is the shape it needed.',
    'From here the outcome is not in doubt. Only the pace is, and a player in this row is throwing to see how many turns the last eight squares will take rather than where they will lead.'
  ],
  98: [
    'The going forth: the prince leaves the palace by night and takes up the life of a renunciant. The sources make the four sights the cause — an old man, a sick man, a corpse, and a mendicant — and the fourth is the only one of them that was not simply the world as it is.',
    'The first three establish the problem and the fourth suggests that someone has already responded to it. That the response was available before the Buddha found it is a detail the tradition keeps rather than smooths over: the renunciant at the gate belonged to an older Indian practice, and what followed was a correction of it.',
    'One and two both lead on to the austerities. Nothing else does anything.'
  ],
  99: [
    'The years of austerity by the Nairañjanā, which the sources treat as necessary and insufficient both. They are undertaken completely — the tradition is emphatic that nothing was held back, and the descriptions of the emaciated body are unsparing — and then set aside.',
    'The setting aside is the content of the episode. The middle way is not arrived at by moderation from the start but by exhausting the alternative, and the milk-rice accepted from Sujātā marks the point at which the practice changes rather than the point at which it weakens. The five companions who left in disgust are the tradition\'s own record that it looked like failure.',
    'One and two, and on to the conquest of Māra.'
  ],
  100: [
    'The conquest of Māra beneath the tree: the armies, then the daughters, and last the challenge to the right to sit there at all. The first two are resisted; the third is answered — not by argument but by touching the ground and letting the earth be the witness that the merit had been accumulated.',
    'It is the most-depicted moment in Buddhist art and the gesture is the same one Akṣobhya holds at square 85, which is not a coincidence: the vajra family is the family of the unshakeable, and this is the episode that defines what that means.',
    'Māra is the lord of the highest heaven of sense desire, at square 32, and he appears here because the challenge to awakening comes from the top of desire\'s realm and not from below it.'
  ],
  101: [
    'Awakening, at dawn under the tree at Bodh Gayā, and fifth of the acts on this board rather than last. That placement is the point. A tradition that stopped here would have a story about one person; the three squares that follow are what makes it a teaching.',
    'What is described as happening in the three watches of the night — former lives recollected, the arising and passing of beings seen, the defilements exhausted — is given as knowledge rather than as vision, and the fourth noble truth is the part that concerns anyone else.',
    'One and two, and on to the turning of the wheel.'
  ],
  102: [
    'The turning of the wheel of dharma at Sārnāth, to the five who had left during the austerities. In the Mahāyāna reckoning this is the first of three turnings — the four truths here, then the perfection of wisdom, then the teachings on buddha-nature and mind — and the scheme is how the tradition accounts for its own later literature.',
    'The board places the teaching above the awakening, which is not the order of a biography but is the order of an argument: the act of a buddha\'s emanation body that matters is the one directed outward. Everything before this square happened to one person.',
    'One and two, and on to the miracles.'
  ],
  103: [
    'The display of miracles, which the sources report at length and mostly deprecate. The Buddha is recorded as forbidding his followers to perform wonders for laypeople and as performing them himself at Śrāvastī, and the tradition holds both without much discomfort: a demonstration is legitimate when nothing else will reach the person in front of you, and illegitimate as a way of gathering a following.',
    'The great miracle at Śrāvastī — the pairs of fire and water, the multiplication of forms — is the one usually meant, and it is answered in the same breath by the doctrine that the only miracle worth the name is the miracle of instruction.',
    'The last square before the end, and the only one from which 104 can be thrown.'
  ],
  104: [
    'Nirvāṇa, and the end of the game: not the extinction that the trap at square 48 describes but the passing of a buddha whose work is finished. The parinirvāṇa at Kuśinagara is the last of the acts, and the sources give it as an act rather than as something that merely happened — a teaching delivered by a body ceasing on schedule, in public, having said what there was to say.',
    'Victory is declared on arrival. The throw that follows, in which a one or a two passes the relics into the stūpa, is a rite performed after the fact and cannot change the winner; the board keeps it because the disposal of the relics is part of the account and because a game about consequences ought to have one act with none.',
    'It is the top left square of the board, which on a grid numbered right to left and rising from the bottom is the last cell of the last row: the furthest point from square 1, which is the hell the tantric path can fall into. The two are diagonally opposite, and the compiler will have arranged that.'
  ]
};
