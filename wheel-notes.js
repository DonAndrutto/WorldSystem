/* The entries for the wheel of life: one for every part of the relief that
   answers a click, and a few that stand in the index only.

   The shape is the one the page's other entries have: `t` the name, `tib` the
   Tibetan (in Tibetan script here), `en` the Wylie and the Sanskrit, `meta` the
   line over the name, `k` the short tag at the end of an index row, `f` the
   table, `b` the paragraphs, `rel` the entries worth reading next, and `src`.
   Where the model or the board already has an entry on the same thing — a hot
   hell, the pretas, a square of the game — it is named in `rel` rather than
   said twice; those entries are about where a thing stands in the world system,
   and these are about how the wheel paints it. */

const DIV = 'The instruction to paint the wheel: <i>Divyāvadāna</i>, Sahasodgata- and Rudrāyaṇa-avadāna; the Mūlasarvāstivāda Vinaya';
const KOSA = 'Vasubandhu, <i>Abhidharmakośa</i> III.20–28, with the bhāṣya';
const PATRUL = 'Patrul Rinpoche, <i>Words of My Perfect Teacher</i> (<i>kun bzang bla ma\'i zhal lung</i>) I.3';
const GAMPOPA = 'Gampopa, <i>Jewel Ornament of Liberation</i>';
const BARDO = '<i>The Great Liberation by Hearing in the Bardo</i> (<i>bar do thos grol</i>)';
const RELIEF = 'The relief itself, from the author\'s photographs';
const MUNIS = 'The six sages (<i>thub pa drug</i>), after the bardo teachings and the six-realm purification liturgies';

export const WHEEL_ENTRIES = {
  /* ── the whole ────────────────────────────────────────────────────── */
  wl_wheel: {
    t: 'The wheel of existence', tib: 'སྲིད་པའི་འཁོར་ལོ།', en: '<i>srid pa\'i \'khor lo</i> · bhavacakra', k: 'start here',
    meta: 'The wheel of life, in painted relief',
    f: [['From the centre', 'three poisons · the paths of karma · six realms · twelve links'],
        ['Held by', 'Yama, Lord of Death — impermanence'],
        ['Outside it', 'a buddha pointing the way out, and the realm beyond'],
        ['First painted', 'at the gateway of a monastery, on the Buddha\'s instruction, in the Vinaya\'s account'],
        ['This one', 'a painted clay relief on a blue wall, shown from the author\'s photographs, the camera\'s angle corrected']],
    b: ['The whole of saṃsāra on one wall: what drives it at the hub, where it goes in the ring of karma, the six kinds of birth it goes to in the body of the wheel, and on the rim the twelve links by which one life hands itself on to the next. The whole wheel is gripped in the jaws, hands and feet of the Lord of Death, and outside his reach, in the upper corners, a buddha points the way out of it.',
        'The Vinaya of the Mūlasarvāstivādins, retold in the <i>Divyāvadāna</i>, has the Buddha himself give the design: a wheel of five spokes at the gateway of the vihāra, with the hells, animals and pretas below and gods and humans above; a dove, a snake and a pig at the centre; the twelve links on the rim; the whole held by impermanence; and a verse written beneath it. Tibetan painters added the realm of the asuras, making six, and the ring of beings rising and falling between the hub and the realms.',
        'Tibetan tradition also tells of the wheel as a gift: King Bimbisāra, owing King Rudrāyaṇa a return for a jewelled armour, sent him this picture on the Buddha\'s advice, and Rudrāyaṇa, studying it, saw the truth it shows.',
        'Everything on the relief is a click away from its entry. Drag to turn the wall a little — no further than a wall can be turned — scroll or pinch to come closer, and once close, drag to move across it.'],
    rel: ['wl_hub', 'wl_realm_gods', 'wl_nidanas', 'wl_yama', 'wl_verse'],
    src: DIV + '. ' + RELIEF + '.'
  },
  wl_verse: {
    t: 'The verse beneath the wheel', tib: 'རྩོམ་པར་བྱ་ཞིང་འབྱུང་བར་བྱ། །', en: 'ārabhadhvaṃ niṣkramata', k: 'two stanzas',
    meta: 'The words the Buddha gave to be written with it',
    f: [['Where', 'written beneath the wheel, in the Vinaya\'s instruction'],
        ['Also found', '<i>Udānavarga</i> 4.37–38; <i>Saṃyutta Nikāya</i> 6.14'],
        ['On this relief', 'not carved: the wall has no inscription']],
    b: ['<blockquote class="verse"><p>Begin, and go forth; apply yourselves to the teaching of the Buddha.<br>As an elephant a house of reeds, shake down the army of death.<br>Whoever, with care, lives by this Dharma and Vinaya<br>will give up the round of births and make an end of suffering.</p></blockquote>',
        'In Sanskrit: <i>ārabhadhvaṃ niṣkramata yujyadhvaṃ buddhaśāsane / dhunīta mṛtyunaḥ sainyaṃ naḍāgāram iva kuñjaraḥ // yo hy asmin dharmavinaye apramattaś cariṣyati / prahāya jātisaṃsāraṃ duḥkhasyāntaṃ kariṣyati.</i>',
        'The Tibetan painters\' form begins <span lang="bo">རྩོམ་པར་བྱ་ཞིང་འབྱུང་བར་བྱ། །སངས་རྒྱས་བསྟན་ལ་འཇུག་པར་བྱ། །</span> The picture shows what binds; the verse says what to do about it. Many painted wheels carry it along the foot of the scroll.'],
    rel: ['wl_wheel', 'wl_beyond_buddha'],
    src: DIV + '; <i>Udānavarga</i> 4.37–38.'
  },

  /* ── the hub ──────────────────────────────────────────────────────── */
  wl_hub: {
    t: 'The three poisons', tib: 'དུག་གསུམ།', en: '<i>dug gsum</i> · triviṣa', k: 'the hub',
    meta: 'At the centre, three animals chasing one another\'s tails',
    f: [['The bird', 'attachment, desire — <span lang="bo">འདོད་ཆགས།</span>'],
        ['The snake', 'aversion, anger — <span lang="bo">ཞེ་སྡང་།</span>'],
        ['The pig', 'ignorance, delusion — <span lang="bo">གཏི་མུག</span>'],
        ['Ground', 'dark blue'],
        ['In the Vinaya', 'a dove, a snake and a pig']],
    b: ['The hub the whole wheel turns on. Three animals chase round a dark blue disc, each at the tail of the next: the bird of attachment, the snake of aversion and the pig of ignorance. They are drawn in a round because they feed one another — not seeing clearly, a mind reaches for what pleases and pushes away what does not, and each reaching and pushing clouds the seeing again.',
        'Everything further out on the wheel is what these three do. The ring of karma is their acts; the six realms are where those acts ripen; the twelve links on the rim are the same process followed from one life into the next.'],
    rel: ['wl_hub_bird', 'wl_hub_snake', 'wl_hub_pig', 'wl_karma_white'],
    src: DIV + '. ' + PATRUL + '.'
  },
  wl_hub_bird: {
    t: 'The bird — attachment', tib: 'འདོད་ཆགས།', en: '<i>\'dod chags</i> · rāga', k: 'desire',
    meta: 'The first of the three poisons',
    f: [['Animal', 'a bird: in the Vinaya a dove, in many Tibetan paintings a cock'],
        ['Poison', 'attachment, desire, craving'],
        ['Ripens chiefly as', 'birth among the pretas, in most Tibetan accounts'],
        ['In this relief', 'rose and white, wings raised, facing right, the pig\'s snout at its tail']],
    b: ['Attachment is the pull toward whatever seems able to satisfy — a pleasure, a person, a position, one\'s own body. The bird is its animal because it is never still, flitting after whatever catches the eye. In the relief the pig\'s snout is at its tail and the snake coils beneath it: desire grows out of not seeing, and turns into anger the moment it is thwarted.',
        'The Vinaya\'s bird is the dove, proverbial in India for its lust; Tibetan painters often make it a cock. The meaning stays the same.'],
    rel: ['wl_hub', 'wl_hub_snake', 'wl_hub_pig', 'wl_nidana_craving'],
    src: DIV + '. ' + PATRUL + '.'
  },
  wl_hub_snake: {
    t: 'The snake — aversion', tib: 'ཞེ་སྡང་།', en: '<i>zhe sdang</i> · dveṣa', k: 'anger',
    meta: 'The second of the three poisons',
    f: [['Animal', 'a snake'],
        ['Poison', 'aversion, anger, hatred'],
        ['Ripens chiefly as', 'birth in the hells'],
        ['In this relief', 'dark green and banded, coiled in an S between the bird and the pig']],
    b: ['Aversion is the push away from whatever threatens what one holds to. The snake strikes without warning and its bite poisons; anger, the commentaries say, destroys in an instant the merit of kalpas. Of the three, it is the one most directly tied to the hells: the burning and freezing of the lower third of the wheel are its ripening.'],
    rel: ['wl_hub', 'wl_realm_hells', 'wl_hub_bird', 'wl_hub_pig'],
    src: DIV + '. ' + PATRUL + '.'
  },
  wl_hub_pig: {
    t: 'The pig — ignorance', tib: 'གཏི་མུག', en: '<i>gti mug</i> · moha', k: 'delusion',
    meta: 'The root of the three poisons',
    f: [['Animal', 'a pig'],
        ['Poison', 'ignorance, delusion, bewilderment'],
        ['Ripens chiefly as', 'birth among the animals'],
        ['In this relief', 'grey, with a pink ear, stretched out with its snout at the bird\'s tail']],
    b: ['Ignorance is not a lack of information but a misreading of what is there — above all, taking a self where there is none. The pig roots with its eyes on the ground and never looks up. It is the root the other two grow from, which is why it is the first of the twelve links as well: the blind man at the top of the rim is this pig again, walking.'],
    rel: ['wl_hub', 'wl_nidana_ignorance', 'wl_realm_animals'],
    src: DIV + '. ' + KOSA + '.'
  },

  /* ── the ring of karma ────────────────────────────────────────────── */
  wl_karma_white: {
    t: 'The white path — rising', tib: 'མཐོ་རིས་སུ་འགྲོ་བ།', en: '<i>dkar po\'i las</i> · the karma of virtue', k: 'ascent',
    meta: 'The light half of the ring around the hub',
    f: [['Ground', 'white, with clouds'],
        ['Figures', 'a monk and lay people climbing, led by a lama who lifts a young monk by the hand'],
        ['Leads to', 'the higher rebirths: gods, asuras, humans'],
        ['Cause', 'the ten virtues — abstaining from the ten non-virtues']],
    b: ['The ring between the hub and the realms shows the poisons at work as action. On its light half people rise on clouds: a lama in a red hat at the top reaches down to lift a young monk, and below them a man in a brimmed hat, a woman with a long braid, others in olive and blue, and a monk at the bottom with his hands joined. Virtuous action carries beings upward, and it goes better with a guide.',
        'The Vinaya asks only that beings be shown dying and being reborn, going up and down like the buckets of a water-wheel. The white and black halves are the Tibetan painters\' way of doing it.'],
    rel: ['wl_karma_black', 'wl_realm_humans', 'wl_hub'],
    src: DIV + '. ' + PATRUL + '. ' + RELIEF + '.'
  },
  wl_karma_black: {
    t: 'The black path — falling', tib: 'ངན་སོང་དུ་ལྷུང་བ།', en: '<i>nag po\'i las</i> · the karma of non-virtue', k: 'descent',
    meta: 'The dark half of the ring around the hub',
    f: [['Ground', 'black'],
        ['Figures', 'naked beings falling, bound with rope and hanging head down, hauled by a dark figure'],
        ['Leads to', 'the lower rebirths: animals, pretas, hells'],
        ['Cause', 'the ten non-virtues']],
    b: ['On the dark half of the ring the same beings go the other way: naked, upside down, tied with ropes, hauled by a dark figure at the bottom. Nobody on this side is climbing. Non-virtuous action is its own gravity; the rope in the demon\'s hand is the karma that has already been done.'],
    rel: ['wl_karma_demon', 'wl_karma_white', 'wl_realm_hells'],
    src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_karma_demon: {
    t: 'The one who drags them down', tib: 'གཤིན་རྗེའི་ལས་མཁན།', en: '<i>gshin rje\'i las mkhan</i>', k: 'Yama\'s servant',
    meta: 'At the foot of the black half of the ring',
    f: [['Colour', 'dark blue, with a tiger-skin loincloth and flaming hair'],
        ['Holds', 'the ropes the falling are bound with']],
    b: ['A servant of Yama, one of the dark figures the bardo teachings say come for the dead with ropes. The texts are clear that they are not outside the dead person: the ropes, the fall and the one hauling on them are karma appearing as a figure. That is why nothing on this side struggles free.'],
    rel: ['wl_karma_black', 'wl_hell_court', 'wl_yama'],
    src: BARDO + '. ' + RELIEF + '.'
  },

  /* ── the six realms ───────────────────────────────────────────────── */
  wl_realm_gods: {
    t: 'The realm of the gods', tib: 'ལྷ།', en: '<i>lha</i> · deva', k: 'top',
    meta: 'The six realms · the highest of the higher rebirths',
    f: [['Place on the wheel', 'the top, between the upper spokes'],
        ['Poison', 'pride, and a long forgetting'],
        ['Suffering', 'the fall: the five signs of a god\'s death, and the sight of where one goes next'],
        ['Sage', 'white, playing a lute'],
        ['In this relief', 'Meru in stepped white terraces rising from the sea, the gods\' palace on cloud, the fruit of the wish-granting tree, and the gods riding out to war']],
    b: ['At the top of the wheel, the gods: long lives of pleasure in palaces on Meru and above it. The wheel gives them the best place and no exemption. Their pleasures use up the merit that made them, and at the end, the texts say, a god sees his garlands wither, his clothes take on dust and his body lose its light, and sees too where he is going. That knowledge is called worse than the pains of the hells.',
        'In the relief Meru rises out of the ocean in stepped white terraces, its sides coloured ochre and green, with the golden ranges standing in the sea around its foot. The palace sits on a bank of cloud at its top. To the left, the branches of the wish-granting tree bear fruit for the gods, and gods in gold helmets ride out on an elephant to defend it from the asuras, whose realm it grows from. On the right a white buddha plays a lute.'],
    rel: ['gods_ways', 'wl_gods_meru', 'wl_gods_palace', 'wl_wish_tree', 'wl_muni_gods', 'rebirth_sq_28'],
    src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_realm_asuras: {
    t: 'The realm of the asuras', tib: 'ལྷ་མ་ཡིན།', en: '<i>lha ma yin</i> · asura', k: 'upper left',
    meta: 'The six realms · the demigods',
    f: [['Place on the wheel', 'upper left, beside the gods'],
        ['Poison', 'jealousy'],
        ['Suffering', 'war without end against the gods, which they always lose'],
        ['Sage', 'green, holding armour and a weapon'],
        ['In this relief', 'the asura king in his palace, his army in gold armour with bows and flags, and the trunk of the wish-granting tree']],
    b: ['The asuras have much of what the gods have, and cannot bear that the gods have more. The root of the wish-granting tree grows in their realm, and its fruit ripens in the gods\': the sight of it is enough for war. They arm and attack, and they lose, because the gods\' merit is greater — and the fighting and the losing are their life.',
        'The relief gives them a king in a black hat seated in a pink-walled palace, with soldiers kneeling before him, and his army out on the hills in pointed gold helmets with bows, swords and blue and red banners. The dark trunk of the tree rises beside the spoke and crosses into the gods\' realm.',
        'The Vinaya\'s wheel had five spokes and no asuras; the Kośa counts them among the gods or the pretas. The Tibetan wheel gives them a realm of their own.'],
    rel: ['asuras', 'wl_asura_palace', 'wl_asura_war', 'wl_wish_tree', 'wl_muni_asuras', 'rebirth_sq_15'],
    src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_realm_humans: {
    t: 'The realm of humans', tib: 'མི།', en: '<i>mi</i> · manuṣya', k: 'upper right',
    meta: 'The six realms · the human birth',
    f: [['Place on the wheel', 'upper right, beside the gods'],
        ['Poison', 'desire, doubt, busyness'],
        ['Suffering', 'birth, aging, sickness and death; meeting what is hated, losing what is loved, not getting what is wanted'],
        ['Sage', 'Śākyamuni, with begging bowl and staff'],
        ['In this relief', 'a buddha on cloud, a stūpa, lamas teaching in two temples, a red monastery behind its fence, a nomad tent under prayer flags, herds and a ploughman']],
    b: ['The human realm is the one the wheel was painted for. It suffers enough to want a way out, and not so much that it cannot look for one; it is where the teaching is heard and can be practised. The Tibetan teachers call such a birth, with the freedoms and the good circumstances to use it, precious and rare.',
        'The relief is a Himalayan valley: a white stūpa on a hill, lamas teaching in two gold-roofed temples with people kneeling before them, a red monastery behind its fence where a woman carries a load and a child runs, a black yak-hair tent with a fire, a woman churning, yaks, sheep and goats, and a man in a straw hat ploughing behind two oxen. Work, devotion and the herd, side by side.'],
    rel: ['humans', 'wl_muni_humans', 'wl_human_teaching', 'wl_human_plough', 'rebirth_sq_17'],
    src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_realm_animals: {
    t: 'The realm of animals', tib: 'དུད་འགྲོ།', en: '<i>dud \'gro</i> · tiryak', k: 'lower left',
    meta: 'The six realms · the first of the lower rebirths',
    f: [['Place on the wheel', 'lower left'],
        ['Poison', 'ignorance, dullness'],
        ['Suffering', 'being eaten by one another; being used — for burdens, milk, wool and meat; the darkness of the deep'],
        ['Sage', 'blue, holding a book'],
        ['In this relief', 'an elephant, deer, goats, foxes, buffalo and cattle on green hills among cypresses; a river below with a red sea monster, swimming beasts, small fish and two swans']],
    b: ['The animals\' suffering is that they cannot understand it. Wild ones live in fear of being eaten and eat others; tame ones are loaded, milked, shorn and slaughtered; those in the depths of the ocean, the Tibetan teachers say, live in darkness packed together, and many of them never see light at all.',
        'The relief crowds its hills with herds — an elephant, deer brown, white and red, goats, foxes, grey buffalo and cattle — and fills the river below with a red sea monster, swimming beasts, small yellow fish and two swans. Nothing in it is doing anything but living.'],
    rel: ['animals', 'wl_muni_animals', 'wl_animals_land', 'wl_animals_sea', 'rebirth_sq_11'],
    src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_realm_pretas: {
    t: 'The realm of the pretas', tib: 'ཡི་དྭགས།', en: '<i>yi dwags</i> · preta', k: 'lower right',
    meta: 'The six realms · the hungry ghosts',
    f: [['Place on the wheel', 'lower right'],
        ['Poison', 'avarice, craving'],
        ['Suffering', 'hunger and thirst that nothing reaches'],
        ['Their three kinds', 'outer obstacles, inner obstacles, and food and drink that turn to fire'],
        ['Sage', 'red, holding a vessel of food and drink'],
        ['In this relief', 'big-bellied pretas with fire at their mouths, one in a palace beside a heap it cannot eat, others driven off with clubs, a burning tree, and a river they cannot drink from']],
    b: ['Avarice ripens as a body built for hunger: a belly the size of a country, a mouth like the eye of a needle and a throat as thin as a hair. Some pretas are kept from food by what is outside them — guards, or water that turns to pus as they reach it; some by their own bodies, so that what they find cannot get in; and for some, what does get in bursts into flame.',
        'The relief shows all three: pretas on the hills with fire at their mouths, lying where they fell or sitting with swollen bellies; a preta in a red palace beside a white heap it cannot touch; a group driven off by a figure with two clubs, through flames and past a burning tree; and at the edge of it all a river, and a bridge.'],
    rel: ['preta_realm', 'wl_muni_pretas', 'wl_preta_fire', 'wl_preta_river', 'rebirth_sq_10'],
    src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_realm_hells: {
    t: 'The realm of the hells', tib: 'དམྱལ་བ།', en: '<i>dmyal ba</i> · naraka', k: 'bottom',
    meta: 'The six realms · the lowest of the lower rebirths',
    f: [['Place on the wheel', 'the bottom — the widest of the six in this relief'],
        ['Poison', 'anger, hatred'],
        ['Eighteen hells', 'eight hot, eight cold, the neighbouring and the ephemeral'],
        ['At the centre', 'Yama the judge, with the mirror'],
        ['Sage', 'dark, holding fire and water'],
        ['In this relief', 'the hot hells in rows of red iron lattice on the left, the cold in rows of ice on the right, the court in the middle, and the torments and the cauldron below it']],
    b: ['Anger ripens as a world that is all weapon. The Tibetan teachers count eighteen hells: eight hot, eight cold, the neighbouring hells at the gates of the hot ones, and the ephemeral hells scattered in the world above. Life in them is long past reckoning, and it ends only when the karma that made it is spent.',
        'The relief gives the hells more of the wheel than any other realm — nearly a third of it. On the left the hot hells are rows of burning iron lattice, crowded with the tormented; on the right the cold hells are rows of ice, each with its huddled, naked beings. Between them, in a gold pavilion, the Lord of Death sits in judgement with his mirror, and below his court are the rack, the iron pillar, the swamp of corpses, the trees of blades, a demon lifting a body over his head, and the cauldron.'],
    rel: ['wl_hell_judge', 'wl_hell_sanjiva', 'wl_cold_arbuda', 'wl_hell_neighbouring', 'wl_hell_ephemeral', 'wl_muni_hells'],
    src: PATRUL + '; ' + GAMPOPA + '. ' + RELIEF + '.'
  },

  /* ── the six sages ────────────────────────────────────────────────── */
  wl_munis: {
    t: 'The six sages', tib: 'ཐུབ་པ་དྲུག', en: '<i>thub pa drug</i> · the six munis', k: 'one in each realm',
    meta: 'A buddha in every realm of the wheel',
    f: [['Gods', 'white, with a lute'], ['Asuras', 'green, with armour and a weapon'], ['Humans', 'yellow, with begging bowl and staff'],
        ['Animals', 'blue, with a book'], ['Pretas', 'red, with a vessel of food and drink'], ['Hells', 'dark, with fire and water']],
    b: ['In each of the six realms a buddha stands on a cloud, in the colour and with the thing that realm can use: music for the gods, who can hear nothing else; armour for the asuras; the bowl and staff of renunciation for humans; a book for the animals; food and drink for the pretas; and for the hells, water for the burning and fire for the frozen. The wheel is not left without a way out anywhere in it.',
        'Their names and emblems follow the Tibetan liturgies of the six realms and the bardo teachings; painters vary the details.'],
    rel: ['wl_muni_gods', 'wl_muni_asuras', 'wl_muni_humans', 'wl_muni_animals', 'wl_muni_pretas', 'wl_muni_hells'],
    src: MUNIS + '.'
  },
  wl_muni_gods: {
    t: 'The sage of the gods', tib: 'དབང་པོ་བརྒྱ་བྱིན།', en: '<i>dbang po brgya byin</i> · Śakra', k: 'white · lute',
    meta: 'The six sages · in the realm of the gods',
    f: [['Colour', 'white'], ['Holds', 'a lute'], ['Teaches', 'impermanence, in the only way the gods will listen: as music']],
    b: ['The buddha of the gods takes the form of their own king and plays to them. The gods hear nothing that is not pleasant; the sound of the lute reaches them, and in it the teaching that the pleasure is passing. In the relief he sits on a cloud at the right of the realm, white-bodied with a red robe and an orange aureole.'],
    rel: ['wl_munis', 'wl_realm_gods'], src: MUNIS + '. ' + RELIEF + '.'
  },
  wl_muni_asuras: {
    t: 'The sage of the asuras', tib: 'ཐགས་བཟང་རིས།', en: '<i>thags bzang ris</i> · Vemacitra', k: 'green · armour',
    meta: 'The six sages · in the realm of the asuras',
    f: [['Colour', 'green'], ['Holds', 'armour and a weapon'], ['Teaches', 'the armour of patience, and the weapon of wisdom']],
    b: ['The asuras understand armour and weapons, and their buddha comes carrying both — to teach a different war. In the relief he is set on a cloud of green and white above the fighting, green-bodied, in a red robe.'],
    rel: ['wl_munis', 'wl_realm_asuras'], src: MUNIS + '. ' + RELIEF + '.'
  },
  wl_muni_humans: {
    t: 'The sage of humans', tib: 'ཤཱཀྱ་སེང་གེ།', en: '<i>shAkya seng ge</i> · Śākyamuni', k: 'yellow · bowl',
    meta: 'The six sages · in the realm of humans',
    f: [['Colour', 'yellow'], ['Holds', 'begging bowl and mendicant\'s staff'], ['Teaches', 'renunciation, and the path']],
    b: ['In the human realm the buddha is the one history knows: Śākyamuni, the mendicant, with his bowl and his staff. In this relief he stands on cloud in orange robes against a pink aureole, above the stūpa at the top of the realm.'],
    rel: ['wl_munis', 'wl_realm_humans', 'wl_beyond_buddha'], src: MUNIS + '. ' + RELIEF + '.'
  },
  wl_muni_animals: {
    t: 'The sage of animals', tib: 'སེང་གེ་རབ་བརྟན།', en: '<i>seng ge rab brtan</i> · Sthirasiṃha', k: 'blue · book',
    meta: 'The six sages · in the realm of animals',
    f: [['Colour', 'blue'], ['Holds', 'a book'], ['Teaches', 'understanding, against dullness']],
    b: ['The animals\' poison is ignorance, and their buddha carries the one thing that answers it: a book. In the relief he is set on a cloud of pink and white at the top of the realm, blue-bodied in a red robe, against a pink aureole.'],
    rel: ['wl_munis', 'wl_realm_animals'], src: MUNIS + '. ' + RELIEF + '.'
  },
  wl_muni_pretas: {
    t: 'The sage of the pretas', tib: 'ཁ་འབར་མ།', en: '<i>kha \'bar ma</i> · Jvālamukha', k: 'red · vessel',
    meta: 'The six sages · in the realm of the pretas',
    f: [['Colour', 'red'], ['Holds', 'a vessel of food and drink'], ['Teaches', 'generosity, the remedy for avarice']],
    b: ['To the hungry the buddha brings what they are dying for: a vessel of food and drink that does not turn to fire. In the relief he stands on cloud at the top of the realm, red-bodied in a red robe, a vessel raised in his hand, above the pretas and their flames.'],
    rel: ['wl_munis', 'wl_realm_pretas'], src: MUNIS + '. ' + RELIEF + '.'
  },
  wl_muni_hells: {
    t: 'The sage of the hells', tib: 'ཆོས་ཀྱི་རྒྱལ་པོ།', en: '<i>chos kyi rgyal po</i> · Dharmarāja', k: 'dark · fire and water',
    meta: 'The six sages · in the realm of the hells',
    f: [['Colour', 'dark, smoke-coloured'], ['Holds', 'fire and water'], ['Teaches', 'patience, against anger']],
    b: ['The buddha of the hells carries water for the burning and fire for the frozen. He shares his name, King of Dharma, with the judge below him — the one shows what karma has made, the other what can undo it. In the relief he stands on cloud at the top of the realm near the hub, dark blue in a red robe, before a pale aureole.'],
    rel: ['wl_munis', 'wl_realm_hells', 'wl_hell_judge'], src: MUNIS + '. ' + RELIEF + '.'
  },

  /* ── the gods ─────────────────────────────────────────────────────── */
  wl_gods_meru: {
    t: 'Meru, in the realm of the gods', tib: 'རི་རབ།', en: '<i>ri rab</i> · Sumeru', k: 'four terraces',
    meta: 'The realm of the gods',
    f: [['Drawn as', 'white terraces rising from the sea, their sides ochre and green'],
        ['Around its foot', 'the golden ranges, as gold mounds in the water'],
        ['On its summit', 'the palace of the Thirty-three']],
    b: ['The wheel draws the world mountain in a few strokes: a stepped white pyramid standing out of the ocean with golden hills around it. Its terraces recall the four the Kośa gives Meru, where the lower gods live; the palace on the cloud above is the Heaven of the Thirty-three on its summit. The whole of the model this wheel sits beside is compressed into this one tower.'],
    rel: ['meru_core', 'meru_terrace_1', 'wl_gods_palace', 'wl_realm_gods'],
    src: RELIEF + '.'
  },
  wl_gods_palace: {
    t: 'The palace of the gods', tib: 'རྣམ་པར་རྒྱལ་བའི་ཁང་བཟང་།', en: '<i>rnam par rgyal ba\'i khang bzang</i> · Vaijayanta', k: 'on the summit',
    meta: 'The realm of the gods',
    f: [['Drawn as', 'a gilt-roofed pavilion on a bank of cloud, its lord seated at the centre with attendants on either side'],
        ['Stands for', 'the heavens of the gods: Śakra\'s palace, and every heaven above it']],
    b: ['The gods\' palace: gold roofs over red walls and pink curtains, a crowned god on his seat and two attendants. On Meru\'s summit this is Vaijayanta, Śakra\'s own palace; the one sector of the wheel stands in for all the heavens, up to the formless absorptions, since all of them are equally inside the wheel.'],
    rel: ['vaijayanta', 'gods_ways', 'wl_gods_meru'],
    src: RELIEF + '.'
  },
  wl_wish_tree: {
    t: 'The wish-granting tree', tib: 'དཔག་བསམ་ཤིང་།', en: '<i>dpag bsam shing</i> · kalpavṛkṣa', k: 'root and fruit',
    meta: 'Across the spoke between the asuras and the gods',
    f: [['Roots and trunk', 'in the realm of the asuras'],
        ['Branches and fruit', 'in the realm of the gods'],
        ['The result', 'the war between them']],
    b: ['The tree whose fruit is whatever one wishes for grows up out of the asuras\' realm and bears in the gods\'. Every wheel draws it across the spoke that divides them, and the war the two realms fight is about it. In the relief its dark trunk climbs beside the spoke among the asura soldiers, and its branches, heavy with red and yellow fruit, open out in the corner of the gods\' realm.'],
    rel: ['wl_realm_asuras', 'wl_realm_gods', 'wl_gods_army', 'wl_asura_war'],
    src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_gods_army: {
    t: 'The gods ride out', en: 'Śakra\'s elephant, Airāvata', k: 'to war',
    meta: 'The realm of the gods',
    f: [['Drawn as', 'gods in gold helmets on a white elephant, with bows and red flags'],
        ['Against', 'the asuras, beyond the spoke']],
    b: ['The gods defend their fruit. They ride a white elephant — in the stories, Airāvata, Śakra\'s mount, many-headed and vast — with red flags and bows, and they win, as they always do. Victory is not peace: in Patrul\'s account a god wounded in this war is healed, but a god whose head is cut off dies, and falls.'],
    rel: ['wl_wish_tree', 'wl_asura_war', 'wl_realm_gods'],
    src: PATRUL + '. ' + RELIEF + '.'
  },

  /* ── the asuras ───────────────────────────────────────────────────── */
  wl_asura_palace: {
    t: 'The asura king\'s palace', en: 'the court of the not-gods', k: 'a black hat',
    meta: 'The realm of the asuras',
    f: [['Drawn as', 'a pink-walled palace, the king in a black hat and olive robe under a blue canopy'],
        ['Before him', 'an attendant with an offering, soldiers kneeling, a gate with a guard']],
    b: ['The asuras have palaces, wealth and kings, the equal of much that the gods have. The relief\'s king sits at ease in his hall with soldiers kneeling before him, and the war is outside the wall. What spoils it is not lack but comparison: the gods have more, and the asuras can see it.'],
    rel: ['wl_realm_asuras', 'wl_asura_war'], src: RELIEF + '.'
  },
  wl_asura_war: {
    t: 'The asuras at war', en: 'the endless battle', k: 'always lost',
    meta: 'The realm of the asuras',
    f: [['Drawn as', 'soldiers in pointed gold helmets and armour with bows, swords and blue and red banners'],
        ['Against', 'the gods, across the spoke']],
    b: ['Jealousy made visible: an army that never stops attacking and never wins. The asuras are said to be braver than the gods, and the gods are said to win anyway, having more merit. The relief puts one soldier climbing toward the tree and another at work by a pot at the foot of the trunk; everything else in the realm faces the war.'],
    rel: ['wl_realm_asuras', 'wl_wish_tree', 'wl_gods_army'], src: PATRUL + '. ' + RELIEF + '.'
  },

  /* ── humans ───────────────────────────────────────────────────────── */
  wl_human_stupa: {
    t: 'The stūpa', tib: 'མཆོད་རྟེན།', en: '<i>mchod rten</i> · stūpa', k: 'on the hill',
    meta: 'The realm of humans',
    f: [['Drawn as', 'a white stūpa on a hilltop, below the buddha of the realm']],
    b: ['The stūpa is the Buddha\'s mind in a form that can be walked around. It stands on the highest hill of the human realm, directly under the buddha on his cloud, and marks this as the realm where the teaching is found.'],
    rel: ['wl_realm_humans', 'wl_muni_humans'], src: RELIEF + '.'
  },
  wl_human_teaching: {
    t: 'The teaching', tib: 'ཆོས།', en: '<i>chos</i> · Dharma', k: 'two temples',
    meta: 'The realm of humans',
    f: [['Drawn as', 'lamas seated in two gold-roofed temples, lay people kneeling to listen']],
    b: ['Two lamas teach from their seats while people kneel below them. The human realm is where the teaching can be both heard and practised, and the relief puts it at the heart of the realm, ahead of the farm and the herd.'],
    rel: ['wl_realm_humans', 'wl_karma_white'], src: RELIEF + '.'
  },
  wl_human_village: {
    t: 'The monastery and village', en: 'the walled settlement', k: 'daily life',
    meta: 'The realm of humans',
    f: [['Drawn as', 'a red monastery with windows in a row, behind a fence, a woman carrying a load, a child, a tree, prayer flags']],
    b: ['The settled life of the valley: a monastery or great house painted red, a fence, a woman bent under her load and a child running beside her. The human sufferings the texts list — work that is never done, losing what one has, not getting what one wants — are all ordinary here.'],
    rel: ['wl_realm_humans'], src: RELIEF + '.'
  },
  wl_human_nomads: {
    t: 'The nomads\' tent', en: 'the herders\' life', k: 'yak-hair tent',
    meta: 'The realm of humans',
    f: [['Drawn as', 'a black yak-hair tent under prayer flags, a figure at the fire, a woman churning, and yaks, sheep and goats lying beside them']],
    b: ['The other half of Himalayan life: the herders, with their black tent, their hearth, their churn and their animals. The animals grazing beside the tent belong to the human realm here, and to the animal realm too — what is a herd to one is a life of labour to the other.'],
    rel: ['wl_realm_humans', 'wl_realm_animals'], src: RELIEF + '.'
  },
  wl_human_plough: {
    t: 'The ploughman', en: 'the toil of the fields', k: 'two oxen',
    meta: 'The realm of humans',
    f: [['Drawn as', 'a man in a straw hat behind a pair of oxen, at the foot of the realm']],
    b: ['A man ploughs with two oxen at the edge of the realm. Labour for food is one of the sufferings of humans in the Tibetan accounts, and the oxen\'s part in it is the suffering of animals: the pair of them sit exactly on the line between the two realms\' sorrows.'],
    rel: ['wl_realm_humans', 'wl_realm_animals'], src: RELIEF + '.'
  },

  /* ── animals ──────────────────────────────────────────────────────── */
  wl_animals_land: {
    t: 'The animals of the land', en: 'wild and tame', k: 'hills',
    meta: 'The realm of animals',
    f: [['Drawn as', 'an elephant, deer, goats, foxes, buffalo and cattle among green hills and cypresses']],
    b: ['On the hills the wild and the tame together: the deer that are hunted, the fox that hunts, and the elephant, buffalo and cattle that carry, pull and are eaten. Patrul lists both lives — the wild ones\' fear, and the tame ones\' labour and slaughter — as the animals\' suffering, along with the dullness that keeps them from understanding either.'],
    rel: ['wl_realm_animals', 'wl_animals_sea', 'animals'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_animals_sea: {
    t: 'The animals of the waters', en: 'the ocean\'s dwellers', k: 'river and sea',
    meta: 'The realm of animals',
    f: [['Drawn as', 'a river of carved waves, with a red sea monster, swimming beasts, small yellow fish and a pair of swans']],
    b: ['The Kośa places most animals in the ocean, and the Tibetan teachers describe the deep as dark and crowded, with beings eating and being eaten, never still. The relief\'s river keeps it lighter: a red dragon-headed monster, a swimming deer and other beasts, small yellow fish and a pair of white swans.'],
    rel: ['wl_realm_animals', 'wl_animals_land', 'animals'], src: PATRUL + '. ' + RELIEF + '.'
  },

  /* ── pretas ───────────────────────────────────────────────────────── */
  wl_preta_palace: {
    t: 'The preta in its palace', en: 'wealth that cannot be used', k: 'a heap',
    meta: 'The realm of the pretas',
    f: [['Drawn as', 'a big-bellied preta seated in a red palace, fire at its mouth, beside a white heap of food; two kneeling before it']],
    b: ['Some pretas are rich. This one sits in its own palace beside a heap of food and cannot eat it — the stinginess that made it has made it unable to use what it has. Two kneel before it, perhaps asking for what it will not give.'],
    rel: ['wl_realm_pretas', 'preta_realm'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_preta_fire: {
    t: 'The mouths of fire', en: 'the inner obstacles', k: 'swollen bellies',
    meta: 'The realm of the pretas',
    f: [['Drawn as', 'pretas with swollen bellies and thin limbs, flames at their mouths, some fallen on the hills']],
    b: ['The pretas whose obstacle is their own body: a mouth too small, a throat too thin, a belly too great. When anything does pass, it burns. The relief shows them standing with fire coming out of their mouths, and lying where they fell.'],
    rel: ['wl_realm_pretas', 'wl_preta_beaten'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_preta_beaten: {
    t: 'The ones driven off', en: 'the outer obstacles', k: 'guards and fire',
    meta: 'The realm of the pretas',
    f: [['Drawn as', 'pretas walking through flames past a burning tree, and a figure with two clubs beating them back']],
    b: ['The pretas whose obstacle is the world: they see food and water in the distance, and when they come near, it is guarded by figures with weapons, or dries up, or turns to pus and blood. The relief\'s guard raises two clubs over them, and the ground they walk on burns.'],
    rel: ['wl_realm_pretas', 'wl_preta_river'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_preta_river: {
    t: 'The river and the bridge', en: 'water that cannot be drunk', k: 'the border',
    meta: 'On the edge of the pretas\' realm and the hells',
    f: [['Drawn as', 'a river of carved waves along the lower edge, and a wooden bridge crossing the spoke into the hells']],
    b: ['For a preta a river is the cruellest thing in the world: water in plain sight, which dries to stones or turns to pus as it reaches it. The relief runs its river down the edge of the realm and over the spoke into the hells, where it becomes the boiling Vaitaraṇī at the gates of the hot hells; the bridge carries the path from one realm straight into the other.'],
    rel: ['wl_realm_pretas', 'wl_hell_neighbouring'], src: PATRUL + '. ' + RELIEF + '.'
  },

  /* ── the hells ────────────────────────────────────────────────────── */
  wl_hell_judge: {
    t: 'Yama the judge', tib: 'གཤིན་རྗེ་ཆོས་ཀྱི་རྒྱལ་པོ།', en: '<i>gshin rje chos kyi rgyal po</i> · Yama Dharmarāja', k: 'the mirror',
    meta: 'At the centre of the hells',
    f: [['Drawn as', 'a dark-blue figure with flaming hair, seated in a gold pavilion'],
        ['Holds', 'the mirror of karma — <span lang="bo">ལས་ཀྱི་མེ་ལོང་།</span>'],
        ['Beside him', 'the white god and the black demon; his attendants; the dead waiting']],
    b: ['In the bardo of becoming, the teachings say, the dead come before Yama, the King of Dharma. The white god born with each being counts out white pebbles for its good deeds, the black demon black ones for its bad, and the dead one, frightened, lies. Yama looks into the mirror of karma, in which everything done appears, and the lie is useless.',
        'The teaching adds at once that Yama, the mirror and the executioners are not outside the mind: they are its own karma, appearing. Recognising that is the way out even here.'],
    rel: ['wl_hell_pebbles', 'wl_hell_court', 'wl_yama', 'rebirth_sq_9'],
    src: BARDO + '. ' + RELIEF + '.'
  },
  wl_hell_pebbles: {
    t: 'The white god and the black demon', tib: 'ལྷན་ཅིག་སྐྱེས་པའི་ལྷ་དང་འདྲེ།', en: '<i>lhan cig skyes pa\'i lha dang \'dre</i>', k: 'the pebbles',
    meta: 'Before the judge',
    f: [['The white god', 'born with every being; counts its virtues in white pebbles'],
        ['The black demon', 'born with it too; counts its misdeeds in black pebbles']],
    b: ['They are born with each being, and have been with it all its life: the record is kept from inside. At the foot of the throne the relief sets a white figure kneeling at the left with a white bowl, a dark one at the right, and between them a small pink figure with a gold cup before it — to all appearances the white god and the black demon, with the dead one between them.'],
    rel: ['wl_hell_judge'], src: BARDO + '. ' + RELIEF + '.'
  },
  wl_hell_court: {
    t: 'The court of the dead', tib: 'གཤིན་རྗེའི་ལས་མཁན།', en: 'Yama\'s attendants, and those who wait', k: 'the queue',
    meta: 'Before the judge',
    f: [['Attendants', 'fierce figures either side of the throne, one reading from an open book'],
        ['The dead', 'naked, in line, hands joined']],
    b: ['Either side of the pavilion stand Yama\'s servants, and to the right the dead wait their turn, naked, in a huddle. In many paintings the attendants have animal heads, and one keeps the record or holds the scales; here one, beside the throne, reads from an open book.'],
    rel: ['wl_hell_judge', 'wl_karma_demon'], src: BARDO + '. ' + RELIEF + '.'
  },
  wl_hell_torments: {
    t: 'The torments below the court', en: 'the rack, the pillar, the saw', k: 'below Yama',
    meta: 'The realm of the hells',
    f: [['The rack', 'two bodies stretched spread-eagled'],
        ['The pillar', 'a blue iron pillar wrapped in flame'],
        ['On the ground', 'bodies lying, struck and trampled; a flayed skin and scattered bones'],
        ['Carried', 'a demon with a body lifted over his head']],
    b: ['Below the court the sentence is carried out. Bodies are stretched spread-eagled, as in the Black Line hell, where lines are marked on them to be cut along; an iron pillar burns; bodies lie struck on the ground among bones; a demon lifts another bodily over his head. The relief sets these out under the judge as one scene rather than placing each in its own hell.'],
    rel: ['wl_hell_kalasutra', 'wl_hell_cauldron', 'wl_hell_judge'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_cauldron: {
    t: 'The cauldron', en: 'molten metal', k: 'the bottom of the wheel',
    meta: 'The realm of the hells',
    f: [['Drawn as', 'a great iron cauldron on the fire at the bottom of the wheel, full of heads and bodies'],
        ['In the texts', 'the Hot and Intensely Hot hells: beings boiled in molten bronze']],
    b: ['The lowest thing on the wheel: an iron cauldron over flames, full of the boiled. In Patrul\'s account beings in the Hot hell are thrown into cauldrons of molten bronze and cooked until they die, and revive, and are cooked again; in the Intensely Hot hell the same, and worse. A white dog sits beside it.'],
    rel: ['wl_hell_tapana', 'wl_hell_pratapana', 'rebirth_sq_3'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_neighbouring: {
    t: 'The neighbouring hells', tib: 'ཉེ་འཁོར་བ།', en: '<i>nye \'khor ba</i> · utsada', k: 'four gates',
    meta: 'The realm of the hells',
    f: [['The pit of embers', 'waist-deep, just outside the gate'],
        ['The swamp of corpses', 'rotting, with worms that bore to the bone'],
        ['The road of razors, the forest of blades', 'and the śālmali tree with iron thorns'],
        ['The river Vaitaraṇī', 'boiling, with guards on both banks'],
        ['In this relief', 'the swamp with heads showing through it, left of the cauldron; the trees of blades with a figure among them, at the edge of the ice; the river along the edge']],
    b: ['Beings who come out of a hot hell, thinking themselves free, walk straight into the neighbouring ones. At the gate is a pit of embers; past it a swamp of rotting corpses; past that a road of blades, a forest whose leaves are swords, and the śālmali tree, which a being climbs because it hears the voices of those it loves at the top, and is cut to pieces going up and again coming down. Then the river.',
        'The relief shows the swamp left of the cauldron with heads showing through it, the trees of blades at the edge of the ice with a figure among them, and the river running in from the pretas\' land.'],
    rel: ['naraka_shaft', 'wl_preta_river', 'rebirth_sq_5'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_ephemeral: {
    t: 'The ephemeral hells', tib: 'ཉི་ཚེ་བ།', en: '<i>nyi tshe ba</i> · the hells for a day', k: 'rock, pillar',
    meta: 'The realm of the hells',
    f: [['Where', 'anywhere: in rocks, trees, pillars, doors, pots, rivers, even among humans'],
        ['How long', 'for a day, or a moment, or a lifetime; pain and pleasure may alternate'],
        ['In this relief', 'no scene of their own that can be picked out']],
    b: ['The last of the eighteen are not in any one place. Beings are born trapped in rocks, tree trunks, pillars, door-posts, brooms and pots, suffering in them while the world goes on around them. Patrul tells how the monk Saṅgharakṣita, travelling, saw beings in the form of pillars, walls and ladles, and learned from the Buddha what they had done.'],
    rel: ['wl_realm_hells', 'rebirth_sq_8'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_stupa: {
    t: 'The stūpa among the hells', tib: 'མཆོད་རྟེན།', en: '<i>mchod rten</i>', k: 'by the court',
    meta: 'The realm of the hells',
    f: [['Drawn as', 'a small white stūpa, and beside it a long pink figure lying on the ground'],
        ['Where', 'right of the court, above the trees of blades']],
    b: ['Among the torments, just right of Yama\'s court, stands a small white stūpa, and beside it a long pink figure lies stretched on the ground. The relief does not say what it is. A stūpa is the one thing in the hells that is not a torment, and painted wheels do sometimes set a sign of the teaching even here; but that reading is not the relief\'s own, and the scene is left as it is seen.'],
    rel: ['wl_realm_hells', 'wl_hell_ephemeral', 'wl_human_stupa'], src: RELIEF + '.'
  },
  wl_hell_sanjiva: {
    t: 'Reviving', tib: 'ཡང་སོས།', en: '<i>yang sos</i> · Sañjīva', k: 'hot · 1',
    meta: 'The eight hot hells · the first',
    f: [['The torment', 'on ground of burning iron, beings kill one another with weapons that appear in their hands'],
        ['Revived by', 'a cool wind, or a voice that says “revive”'],
        ['In this relief', 'the first of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['Here each being sees every other as an enemy, and weapons form in their hands. They fight until they fall, and then a cold wind blows, or a voice from the sky says “Revive!”, and they stand and begin again — until the karma that made the place runs out.'],
    rel: ['hell_sanjiva', 'wl_hell_kalasutra', 'rebirth_sq_6'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_kalasutra: {
    t: 'Black Line', tib: 'ཐིག་ནག', en: '<i>thig nag</i> · Kālasūtra', k: 'hot · 2',
    meta: 'The eight hot hells · the second',
    f: [['The torment', 'black lines are drawn on the body — four, eight, sixteen, more — and it is cut along them'],
        ['In this relief', 'the second of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['Yama\'s servants lay a body down on burning iron and mark it with black lines, in fours and eights and sixteens, and then cut along them with saws and axes. The pieces join again, and the lines are drawn again.'],
    rel: ['hell_kalasutra', 'wl_hell_samghata', 'rebirth_sq_5'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_samghata: {
    t: 'Crushing', tib: 'བསྡུས་འཇོམས།', en: '<i>bsdus \'joms</i> · Saṃghāta', k: 'hot · 3',
    meta: 'The eight hot hells · the third',
    f: [['The torment', 'crushed between iron mountains shaped like the heads of animals; pressed in iron mortars'],
        ['In this relief', 'the third of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['Two iron mountains with the faces of beasts close on one another and crush everything between them, until the blood runs out in rivers; then they part, and close again. Beings are also pounded in iron mortars, and pressed like sesame for oil.'],
    rel: ['hell_samghata', 'wl_hell_raurava', 'rebirth_sq_5'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_raurava: {
    t: 'Howling', tib: 'ངུ་འབོད།', en: '<i>ngu \'bod</i> · Raurava', k: 'hot · 4',
    meta: 'The eight hot hells · the fourth',
    f: [['The torment', 'shut in a burning iron house with no door, looking for shelter'],
        ['In this relief', 'the fourth of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['Beings look for somewhere to hide, and find an iron house; the door shuts behind them and the house begins to burn. The hell is named for the sound they make.'],
    rel: ['hell_raurava', 'wl_hell_maharaurava', 'rebirth_sq_4'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_maharaurava: {
    t: 'Great Howling', tib: 'ངུ་འབོད་ཆེན་པོ།', en: '<i>ngu \'bod chen po</i> · Mahāraurava', k: 'hot · 5',
    meta: 'The eight hot hells · the fifth',
    f: [['The torment', 'the same iron house, with a second wall around the first'],
        ['In this relief', 'the fifth of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['As in Howling, but the house has two walls, and even if the first were passed there would be the second. The cry is louder, and the hope is less.'],
    rel: ['hell_maharaurava', 'wl_hell_raurava', 'rebirth_sq_4'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_tapana: {
    t: 'Hot', tib: 'ཚ་བ།', en: '<i>tsha ba</i> · Tapana', k: 'hot · 6',
    meta: 'The eight hot hells · the sixth',
    f: [['The torment', 'boiled in cauldrons of molten metal; skewered on a burning iron stake'],
        ['In this relief', 'the sixth of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['Beings are thrown into iron cauldrons of molten bronze and boiled, and skewered on burning stakes that come out at the crown of the head, so that flames pour from the eyes and mouth. The cauldron at the bottom of the wheel belongs here.'],
    rel: ['hell_tapana', 'wl_hell_cauldron', 'wl_hell_pratapana', 'rebirth_sq_3'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_pratapana: {
    t: 'Intense Heat', tib: 'རབ་ཏུ་ཚ་བ།', en: '<i>rab tu tsha ba</i> · Pratāpana', k: 'hot · 7',
    meta: 'The eight hot hells · the seventh',
    f: [['The torment', 'pierced by a burning trident through the body; wrapped in sheets of burning iron'],
        ['In this relief', 'the seventh of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['Hotter again: a trident is driven up through the body until its prongs come out at the head and both shoulders, and the body is wrapped in sheets of red-hot iron. Half an intermediate kalpa, the texts say, before it ends.'],
    rel: ['hell_pratapana', 'wl_hell_avichi', 'rebirth_sq_3'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_hell_avichi: {
    t: 'Without Respite', tib: 'མནར་མེད།', en: '<i>mnar med</i> · Avīci', k: 'hot · 8',
    meta: 'The eight hot hells · the eighth and deepest',
    f: [['The torment', 'fire and body indistinguishable; nothing to tell a being is there but its cry'],
        ['Why the name', 'no gap in the suffering, in time or in the body'],
        ['In this relief', 'the eighth of the eight red rows of iron lattice, counted from the spoke above them']],
    b: ['The deepest hell. The iron ground and walls burn so fiercely that the beings in them cannot be told from the fire; only their cries show where they are. Its name means that there is no interval — no pause in the pain, and nowhere in the body it does not reach. It is the ripening of the gravest acts.'],
    rel: ['hell_avichi', 'rebirth_sq_2', 'rebirth_sq_1'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_arbuda: {
    t: 'Blisters', tib: 'ཆུ་བུར་ཅན།', en: '<i>chu bur can</i> · Arbuda', k: 'cold · 1',
    meta: 'The eight cold hells · the first',
    f: [['The torment', 'naked in an icy dark among snow mountains and blizzards; the body breaks out in blisters'],
        ['In this relief', 'the first of the eight rows of ice, counted from the spoke above them']],
    b: ['The cold hells lie in a darkness without sun or moon, among glaciers, under snow and wind. In the first the cold raises blisters all over the body. The seven after it are each colder, and each lasts twenty times as long.'],
    rel: ['cold_arbuda', 'wl_cold_nirarbuda', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_nirarbuda: {
    t: 'Bursting Blisters', tib: 'ཆུ་བུར་རྡོལ་བ།', en: '<i>chu bur rdol ba</i> · Nirarbuda', k: 'cold · 2',
    meta: 'The eight cold hells · the second',
    f: [['The torment', 'the blisters burst, and the sores freeze'],
        ['In this relief', 'the second of the eight rows of ice, counted from the spoke above them']],
    b: ['Colder: the blisters burst and run, and the wounds freeze over.'],
    rel: ['cold_nirarbuda', 'wl_cold_atata', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_atata: {
    t: 'Chattering Teeth', tib: 'སོ་ཐམ་ཐམ་པ།', en: '<i>so tham tham pa</i> · Aṭaṭa', k: 'cold · 3',
    meta: 'The eight cold hells · the third',
    f: [['The torment', 'the jaw clenches and the teeth chatter; nothing else can move'],
        ['In this relief', 'the third of the eight rows of ice, counted from the spoke above them']],
    b: ['Named for the sound: the cold is such that the teeth clench and chatter and the being can do nothing else.'],
    rel: ['cold_atata', 'wl_cold_hahava', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_hahava: {
    t: 'Lamentation', tib: 'ཨ་ཆུ་ཟེར་བ།', en: '<i>a chu zer ba</i> · Hahava', k: 'cold · 4',
    meta: 'The eight cold hells · the fourth',
    f: [['The torment', 'a cry of “achu!” is all the voice that is left'],
        ['In this relief', 'the fourth of the eight rows of ice, counted from the spoke above them']],
    b: ['Named, like the one before, for a sound: the long cry of pain and cold, <i>a chu</i>, is all that can be made.'],
    rel: ['cold_hahava', 'wl_cold_huhuva', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_huhuva: {
    t: 'Groaning', tib: 'ཀྱི་ཧུད་ཟེར་བ།', en: '<i>kyi hud zer ba</i> · Huhuva', k: 'cold · 5',
    meta: 'The eight cold hells · the fifth',
    f: [['The torment', 'the voice fails to a groan, “kyi hu”'],
        ['In this relief', 'the fifth of the eight rows of ice, counted from the spoke above them']],
    b: ['Colder still: even the cry gives out, and there is only a groan, <i>kyi hu</i>.'],
    rel: ['cold_huhuva', 'wl_cold_utpala', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_utpala: {
    t: 'Split like a Blue Lotus', tib: 'ཨུཏྤལ་ལྟར་གས་པ།', en: '<i>utpal ltar gas pa</i> · Utpala', k: 'cold · 6',
    meta: 'The eight cold hells · the sixth',
    f: [['The torment', 'the skin turns blue and splits into four, like the petals of a blue lotus'],
        ['In this relief', 'the sixth of the eight rows of ice, counted from the spoke above them']],
    b: ['The skin goes blue with cold and splits open in four, like an utpala flower opening.'],
    rel: ['cold_utpala', 'wl_cold_padma', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_padma: {
    t: 'Split like a Lotus', tib: 'པདྨ་ལྟར་གས་པ།', en: '<i>padma ltar gas pa</i> · Padma', k: 'cold · 7',
    meta: 'The eight cold hells · the seventh',
    f: [['The torment', 'the flesh turns red and splits in eight, like a lotus'],
        ['In this relief', 'the seventh of the eight rows of ice, counted from the spoke above them']],
    b: ['From blue to red: the flesh is exposed and splits in eight, and more, like a lotus opening.'],
    rel: ['cold_padma', 'wl_cold_mahapadma', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },
  wl_cold_mahapadma: {
    t: 'Split like a Great Lotus', tib: 'པདྨ་ཆེན་པོ་ལྟར་གས་པ།', en: '<i>padma chen po ltar gas pa</i> · Mahāpadma', k: 'cold · 8',
    meta: 'The eight cold hells · the eighth and deepest',
    f: [['The torment', 'the flesh splits in a hundred, a thousand places, and creatures burrow into it'],
        ['In this relief', 'the eighth of the eight rows of ice, counted from the spoke above them']],
    b: ['The deepest of the cold hells. The body turns dark red and splits into countless pieces, and small creatures with iron mouths get into the wounds and eat.'],
    rel: ['cold_mahapadma', 'rebirth_sq_7'], src: PATRUL + '. ' + RELIEF + '.'
  },

  /* ── the twelve links ─────────────────────────────────────────────── */
  wl_nidanas: {
    t: 'The twelve links', tib: 'རྟེན་འབྲེལ་ཡན་ལག་བཅུ་གཉིས།', en: '<i>rten \'brel yan lag bcu gnyis</i> · pratītyasamutpāda', k: 'the rim',
    meta: 'Dependent arising, in twelve panels',
    f: [['Where', 'the outer rim, clockwise from just right of Yama\'s fangs'],
        ['Past causes', '1 ignorance · 2 formations'],
        ['Present results', '3 consciousness · 4 name and form · 5 six senses · 6 contact · 7 feeling'],
        ['Present causes', '8 craving · 9 grasping · 10 becoming'],
        ['Future results', '11 birth · 12 aging and death']],
    b: ['The rim of the wheel is its explanation. Twelve panels, each a small scene, follow the chain by which one life brings the next into being, from not seeing to dying — and in dying, not seeing again, so that the chain closes into a wheel.',
        'The Abhidharmakośa reads the twelve across three lives: two links for the causes laid down in the past, eight for this life, and two for the future its causes make. Other readings find all twelve in a single moment. Either way, the chain can be cut, and ignorance is where: the reversal of the twelve is the path.',
        'The pictures are the Tibetan painters\' own. The Vinaya asks only that the links be on the rim.'],
    rel: ['wl_nidana_ignorance', 'wl_hub_pig', 'wl_wheel'],
    src: KOSA + '. ' + DIV + '.'
  },
  wl_nidana_ignorance: {
    t: '1 · Ignorance', tib: 'མ་རིག་པ།', en: '<i>ma rig pa</i> · avidyā', k: 'a blind man',
    meta: 'The twelve links · the first',
    f: [['Picture', 'an old blind man feeling his way forward with a stick, toward water, while a man behind him points'], ['Where', 'just right of Yama\'s fangs'], ['In the three lives', 'a cause laid down in the past']],
    b: ['A blind man goes forward with a stick, not knowing what is ahead — in this panel, toward water, while someone behind him points. Ignorance is not seeing how things are: above all, taking a self where there is none. Many wheels paint an old blind woman; the meaning is the same. It is the first link and the root of the others, and the one whose ending ends them.'],
    rel: ['wl_nidana_formations', 'wl_hub_pig', 'wl_nidanas'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_formations: {
    t: '2 · Formations', tib: 'འདུ་བྱེད།', en: '<i>\'du byed</i> · saṃskāra', k: 'a potter',
    meta: 'The twelve links · the second',
    f: [['Picture', 'a potter at his wheel, pots around him'], ['In the three lives', 'a cause laid down in the past']],
    b: ['A potter shapes clay on his wheel. Out of ignorance come acts — of body, speech and mind — and acts shape what comes after them as surely as a potter shapes a pot. The potter\'s wheel is also a wheel: it keeps turning after the hand is lifted.'],
    rel: ['wl_nidana_ignorance', 'wl_nidana_consciousness'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_consciousness: {
    t: '3 · Consciousness', tib: 'རྣམ་པར་ཤེས་པ།', en: '<i>rnam par shes pa</i> · vijñāna', k: 'a monkey',
    meta: 'The twelve links · the third',
    f: [['Picture', 'a monkey climbing in a tree'], ['In the three lives', 'the first result in this life: consciousness entering the womb']],
    b: ['A monkey swings through the branches of a tree, reaching for the next one before it has let go of the last. Consciousness, carried by the formations, leaps into a new life; and once there it goes on leaping from object to object, as restless as a monkey.'],
    rel: ['wl_nidana_formations', 'wl_nidana_namerupa'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_namerupa: {
    t: '4 · Name and Form', tib: 'མིང་དང་གཟུགས།', en: '<i>ming dang gzugs</i> · nāmarūpa', k: 'a boat',
    meta: 'The twelve links · the fourth',
    f: [['Picture', 'a boat full of people crossing the water, a figure watching from the bank'], ['The boat', 'form — the body'], ['The passengers', 'name — the four mental aggregates']],
    b: ['A boatload of people crosses the water. Consciousness takes on a body and a mind together — form, and the feeling, perception, formation and consciousness that are called name — and neither crosses without the other. The boat and its passengers are one crossing.'],
    rel: ['wl_nidana_consciousness', 'wl_nidana_senses'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_senses: {
    t: '5 · The Six Senses', tib: 'སྐྱེ་མཆེད་དྲུག', en: '<i>skye mched drug</i> · ṣaḍāyatana', k: 'a house',
    meta: 'The twelve links · the fifth',
    f: [['Picture', 'a pink-walled house of many windows, with a tall chimney'], ['The windows', 'eye, ear, nose, tongue, body and mind']],
    b: ['A house with windows, empty. The body in the womb develops its six doors — the five senses and the mind — through which the world will come in. The house stands ready; nothing has entered yet.'],
    rel: ['wl_nidana_namerupa', 'wl_nidana_contact'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_contact: {
    t: '6 · Contact', tib: 'རེག་པ།', en: '<i>reg pa</i> · sparśa', k: 'an embrace',
    meta: 'The twelve links · the sixth',
    f: [['Picture', 'a man and a woman in an embrace on a pink mat, under trees'], ['Where', 'just right of the foot of the wheel']],
    b: ['A couple embrace. Contact is the meeting of three — a sense, its object and the consciousness of it — and the embrace is the image of things coming together. From here on the world is not only present but met.'],
    rel: ['wl_nidana_senses', 'wl_nidana_feeling'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_feeling: {
    t: '7 · Feeling', tib: 'ཚོར་བ།', en: '<i>tshor ba</i> · vedanā', k: 'an arrow',
    meta: 'The twelve links · the seventh',
    f: [['Picture', 'a man seated on a pink mat, clutching his face: struck in the eye by an arrow'], ['Where', 'just left of the foot of the wheel'], ['Its kinds', 'pleasant, painful, neither']],
    b: ['A man sits clutching his face, an arrow in his eye. Out of contact comes feeling — pleasant, painful or neither — and it is as immediate and as impossible to ignore as an arrow in the eye. It is the last result of the past; what is done with it is the first cause of the future.'],
    rel: ['wl_nidana_contact', 'wl_nidana_craving'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_craving: {
    t: '8 · Craving', tib: 'སྲེད་པ།', en: '<i>sred pa</i> · tṛṣṇā', k: 'a drink',
    meta: 'The twelve links · the eighth',
    f: [['Picture', 'a woman serving a drink to a man seated before a red house'], ['In the three lives', 'the first cause laid down in this life']],
    b: ['A woman serves a drink to a man seated before a house, and he takes it. The Sanskrit word is thirst: wanting the pleasant feeling to go on and the painful one to stop, and the more it is drunk the more there is of it. Here the wheel, which has only been turning, begins to be driven again.'],
    rel: ['wl_nidana_feeling', 'wl_nidana_grasping', 'wl_hub_bird'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_grasping: {
    t: '9 · Grasping', tib: 'ལེན་པ།', en: '<i>len pa</i> · upādāna', k: 'picking fruit',
    meta: 'The twelve links · the ninth',
    f: [['Picture', 'a figure reaching into a tree to pick its fruit, baskets of fruit at its foot'], ['Its four kinds', 'to pleasures, to views, to rules and rites, to a doctrine of self']],
    b: ['Someone reaches up and picks fruit, with baskets already full beside them. Craving tightens into grasping: not wanting now but taking hold — of pleasures, of opinions, of observances, and above all of the idea of a self that owns them.'],
    rel: ['wl_nidana_craving', 'wl_nidana_becoming'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_becoming: {
    t: '10 · Becoming', tib: 'སྲིད་པ།', en: '<i>srid pa</i> · bhava', k: 'a pregnant woman',
    meta: 'The twelve links · the tenth',
    f: [['Picture', 'a figure lying on its side under a grey canopy, a golden vase holding a lotus beneath — where most wheels paint a pregnant woman'], ['In the three lives', 'the last cause: the karma of the next life complete']],
    b: ['Under a grey canopy a figure lies on its side, and beneath it stands a golden vase holding a lotus. Wheels commonly paint becoming as a pregnant woman, sometimes as a couple in union: grasping has done its work, and the karma for the next existence is complete and waiting to be born, as a child is complete in the womb before anyone has seen it. <i>Srid pa</i>, becoming, is also the word in the wheel\'s own name.'],
    rel: ['wl_nidana_grasping', 'wl_nidana_birth', 'wl_wheel'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_birth: {
    t: '11 · Birth', tib: 'སྐྱེ་བ།', en: '<i>skye ba</i> · jāti', k: 'childbirth',
    meta: 'The twelve links · the eleventh',
    f: [['Picture', 'a woman lying in childbirth on a bed under a pink canopy, a helper beside her'], ['Where', 'below Yama\'s hand on the left']],
    b: ['A woman lies in childbirth on a bed under a pink canopy, a helper beside her. The next life begins — and with it, already, everything the last link names. The Buddha\'s first noble truth begins here too: birth is suffering.'],
    rel: ['wl_nidana_becoming', 'wl_nidana_death'], src: KOSA + '. ' + RELIEF + '.'
  },
  wl_nidana_death: {
    t: '12 · Aging and Death', tib: 'རྒ་ཤི།', en: '<i>rga shi</i> · jarāmaraṇa', k: 'a corpse',
    meta: 'The twelve links · the twelfth',
    f: [['Picture', 'a man carrying a wrapped corpse on his back toward a white stūpa, animals beside it'], ['Where', 'just left of Yama\'s fangs']],
    b: ['A man carries a body wrapped in white on his back, toward a white stūpa where animals wait. Whatever is born ages and dies. The panel sits right against the first, under the fangs: death hands the blind man his stick, and the wheel turns again.'],
    rel: ['wl_nidana_birth', 'wl_nidana_ignorance', 'wl_yama'], src: KOSA + '. ' + RELIEF + '.'
  },

  /* ── Yama ─────────────────────────────────────────────────────────── */
  wl_yama: {
    t: 'Yama, Lord of Death', tib: 'གཤིན་རྗེ།', en: '<i>gshin rje</i> · Yama; <i>\'chi bdag</i>, the Lord of Death; <i>mi rtag pa</i>, Impermanence', k: 'holds the wheel',
    meta: 'The one who holds the wheel',
    f: [['Holds it with', 'his fangs at the top, his hands at the upper sides, his feet at the lower corners'],
        ['Colour', 'dark red'],
        ['Wears', 'a crown of five skulls, bone ornaments, a tiger skin, silk scarves'],
        ['Also read as', 'impermanence itself — the Vinaya asks that the wheel be shown held by impermanence']],
    b: ['The whole of existence, from the gods to the hells, is in the grip of death. The figure holding the wheel is usually named Yama, the Lord of Death; Tibetan commentators also call him simply Impermanence, which is what the Vinaya asks the painter to show. Nothing on the wheel is outside his hands.',
        'In this relief he is dark red, with a third eye and bulging, bloodshot eyes, his fangs clamped over the top of the rim, his hands gripping it from either side and his feet planted at the lower corners. He is behind the wheel, and there is nothing of the wheel behind him.'],
    rel: ['wl_yama_head', 'wl_yama_hands', 'wl_yama_feet', 'wl_hell_judge', 'rebirth_sq_9'],
    src: DIV + '. ' + RELIEF + '.'
  },
  wl_yama_head: {
    t: 'Yama\'s maw', en: 'the fangs over the rim', k: 'the head',
    meta: 'Yama',
    f: [['Drawn as', 'a dark red face, flaming brows, bulging bloodshot eyes, a snarling nose, a beard of flame'],
        ['The fangs', 'clamped over the top of the wheel'],
        ['The ears', 'hung with great gold rings']],
    b: ['Death has the whole wheel in his mouth. His fangs close over the rim at the very top, just between the first link and the last — the point where one life becomes the next. The face is the wrathful face of Tibetan iconography: brows and beard of flame, eyes starting from the head, a mouth drawn back from the teeth.'],
    rel: ['wl_yama', 'wl_yama_crown', 'wl_yama_eye', 'wl_nidana_death'], src: RELIEF + '.'
  },
  wl_yama_crown: {
    t: 'The crown of five skulls', tib: 'ཐོད་སྐམ་ལྔ་པའི་དབུ་རྒྱན།', en: '<i>thod skam lnga pa\'i dbu rgyan</i>', k: 'five skulls',
    meta: 'Yama',
    f: [['Drawn as', 'five dry skulls on gold settings with blue jewels between them, over a brow hung with festoons of beads'],
        ['Commonly read as', 'the five poisons, or the five aggregates, that death rules over']],
    b: ['Five white skulls crown the Lord of Death, each on its gold setting between gold flames, with festoons of bone beads hanging across his brow. Wrathful figures wear the five-skull crown throughout Tibetan art; on Yama it is read as the five poisons, or the five aggregates of which a person is made — all that death has dominion over.'],
    rel: ['wl_yama', 'wl_yama_head', 'wl_yama_bones'], src: RELIEF + '.'
  },
  wl_yama_eye: {
    t: 'The third eye', tib: 'དཔྲལ་བའི་སྤྱན།', en: '<i>dpral ba\'i spyan</i>', k: 'on the brow',
    meta: 'Yama',
    f: [['Drawn as', 'an upright eye in the middle of the forehead, under the crown']],
    b: ['A third eye, set upright in the brow. Wrathful figures have it; on the Lord of Death it says what the mirror in the hells says: nothing that is done is unseen.'],
    rel: ['wl_yama', 'wl_hell_judge'], src: RELIEF + '.'
  },
  wl_yama_hands: {
    t: 'The hands of death', en: 'the grip on the wheel', k: 'claws',
    meta: 'Yama',
    f: [['Drawn as', 'dark red hands at the upper sides of the wheel, the forefinger and little finger raised, the middle fingers hooked over the rim with long white claws'],
        ['At the wrists', 'gold cuffs']],
    b: ['The hands grip the wheel from both sides, the middle fingers curled over the gold with their claws, the forefinger and little finger raised — the threatening gesture the wrathful figures make. They do not turn the wheel; they hold it. However it turns, it turns in these hands.'],
    rel: ['wl_yama', 'wl_yama_feet'], src: RELIEF + '.'
  },
  wl_yama_feet: {
    t: 'The feet of death', en: 'planted at the lower corners', k: 'claws',
    meta: 'Yama',
    f: [['Drawn as', 'broad pink feet turned outward, clawed toes, gold anklets'],
        ['Below', 'the green scarves, and the offering bowl between them']],
    b: ['The feet brace the wheel from beneath at the two lower corners, toes turned out, clawed. Held at the top by the teeth and at the sides by the hands, the wheel is held at the bottom by these; there is no quarter of it that is not in his grip.'],
    rel: ['wl_yama', 'wl_yama_hands', 'wl_offering_bowl'], src: RELIEF + '.'
  },
  wl_yama_tiger: {
    t: 'The tiger skin', tib: 'སྟག་ཤམ།', en: '<i>stag sham</i>', k: 'over the knees',
    meta: 'Yama',
    f: [['Drawn as', 'a striped tiger pelt over each knee, and one hanging beneath the wheel with its paws and claws']],
    b: ['The tiger-skin skirt of the wrathful figures: the pelt of the fiercest animal worn as a garment, fearlessness made visible. On the relief it lies over his knees on either side and hangs below the rim, its paws dangling, beside a turquoise cloth.'],
    rel: ['wl_yama', 'wl_yama_bones'], src: RELIEF + '.'
  },
  wl_yama_bones: {
    t: 'The bone ornaments', tib: 'རུས་རྒྱན།', en: '<i>rus rgyan</i>', k: 'white festoons',
    meta: 'Yama',
    f: [['Drawn as', 'strings of white rosettes hanging from his shoulders, down his arms and over his knees']],
    b: ['Festoons of carved bone hang from his shoulders and knees — the ornaments of the charnel ground that wrathful figures wear. On the relief they fall in long white strings, each ending in a point.'],
    rel: ['wl_yama', 'wl_yama_crown'], src: RELIEF + '.'
  },
  wl_yama_scarves: {
    t: 'The scarves', tib: 'དར་དཔྱངས།', en: '<i>dar dpyangs</i>', k: 'jade and green',
    meta: 'Yama',
    f: [['Drawn as', 'jade scarves swirling out from behind his head and down his sides; dark green ones coiled beneath his feet']],
    b: ['Silk streamers fly out from behind the Lord of Death — jade at his head and down both sides of the wheel, dark green in great coils under his feet. They are the ornament every deity in Tibetan art wears, and on a relief they give the whole figure its movement: the wheel is held still, and everything around it billows.'],
    rel: ['wl_yama'], src: RELIEF + '.'
  },
  wl_offering_bowl: {
    t: 'The offering beneath the wheel', tib: 'མཆོད་པ།', en: '<i>mchod pa</i>', k: 'a jewel',
    meta: 'Below Yama\'s feet',
    f: [['Drawn as', 'a gold footed bowl holding a white jewel in a setting of gold flame on a heap of red, a white offering on the left and fruit on the right, between pink and maroon scrolls']],
    b: ['Below the wheel, between the coils of the scarves, a gold bowl on a foot holds an offering: a white jewel in a setting of gold flame on a heap of red, something white beside it and fruit on the other side, with pink and maroon scrolls either side of the bowl. It is the offering the relief itself makes, set where a painted scroll would carry its inscription.'],
    rel: ['wl_yama_feet', 'wl_verse'], src: RELIEF + '.'
  },

  /* ── beyond the wheel ─────────────────────────────────────────────── */
  wl_beyond_buddha: {
    t: 'The Buddha pointing the way', tib: 'སངས་རྒྱས།', en: '<i>sangs rgyas</i> · the Buddha', k: 'upper right',
    meta: 'Outside the wheel',
    f: [['Drawn as', 'a standing buddha in orange robes on cloud, with a pink aureole and green halo'],
        ['Pointing', 'across the top of the wall, to the realm and the moon on the left']],
    b: ['Outside Yama\'s reach, on a cloud in the upper corner, the Buddha stands and points. He is not on the wheel: he has left it. What he points to is across the top of the wall — the moon, and the realm on its cloud at the other corner. Many wheels show him pointing at the moon, which is read as liberation; the finger, the teachers add, is not the moon.'],
    rel: ['wl_beyond_pureland', 'wl_beyond_moon', 'wl_verse', 'wl_muni_humans'],
    src: RELIEF + '.'
  },
  wl_beyond_pureland: {
    t: 'The realm beyond the wheel', tib: 'ཐར་པ།', en: '<i>thar pa</i> · liberation', k: 'upper left',
    meta: 'Outside the wheel',
    f: [['Drawn as', 'a gilt-roofed palace on banks of cloud; a red buddha with a green halo seated in the doorway, a white figure in the side door at the viewer\'s left and a dark one at the right'],
        ['Reached by', 'the rainbow road climbing from beside the rim']],
    b: ['In the upper left corner, on clouds of every colour, stands a palace with a red buddha seated in its doorway, a white figure in the side door at his right hand and a dark one at his left. It is the arrangement in which Tibetan painters show Amitābha in his realm of Sukhāvatī, with Avalokiteśvara and Vajrapāṇi beside him; the relief does not name them. It is what is outside the wheel, painted as a place, since a picture has to paint it as something. It is what the Buddha in the other corner is pointing at, and what the people on the rainbow road below it are climbing toward.'],
    rel: ['wl_beyond_path', 'wl_beyond_buddha'], src: RELIEF + '.'
  },
  wl_beyond_path: {
    t: 'The rainbow road', tib: 'འཇའ་ལམ།', en: '<i>\'ja\' lam</i>', k: 'out of the wheel',
    meta: 'Outside the wheel',
    f: [['Drawn as', 'a ribbon of rainbow rising from beside Yama\'s hand to the realm in the corner, a line of people climbing it, a monk at their head']],
    b: ['A rainbow rises from the wheel\'s upper rim, out past the Lord of Death\'s shoulder, and a line of small figures climbs it to the realm on the clouds — a monk leading, the others behind him in their ordinary clothes. It is the only thing on the wall that leaves the wheel, and it leaves it at the top.'],
    rel: ['wl_beyond_pureland', 'wl_karma_white'], src: RELIEF + '.'
  },
  wl_beyond_moon: {
    t: 'The moon', tib: 'ཟླ་བ།', en: '<i>zla ba</i>', k: 'a crescent',
    meta: 'Outside the wheel',
    f: [['Drawn as', 'a white crescent at the head of the wall, left of the crown']],
    b: ['A crescent moon at the top of the wall. On many wheels this is what the Buddha points to: the moon as liberation, cool and clear, and out of death\'s reach above his head.'],
    rel: ['wl_beyond_buddha', 'wl_beyond_sun', 'moon'], src: RELIEF + '.'
  },
  wl_beyond_sun: {
    t: 'The sun', tib: 'ཉི་མ།', en: '<i>nyi ma</i>', k: 'a gold disc',
    meta: 'Outside the wheel',
    f: [['Drawn as', 'a small gold disc at the head of the wall, right of the crown']],
    b: ['The sun, a small gold disc at the top of the wall, answering the moon on the other side of the crown. Sun and moon stand at the head of most Tibetan paintings, framing whatever is below them.'],
    rel: ['wl_beyond_moon', 'sun'], src: RELIEF + '.'
  },
  wl_beyond_fliers: {
    t: 'Figures at the edge of the wall', en: 'the painting beyond the frame', k: 'the edges',
    meta: 'Outside the wheel',
    f: [['Drawn as', 'a figure in red with white hair and trailing white scarves at the upper right, a cloud below it, and a white figure just showing at the upper left']]
    , b: ['At both edges of the photograph other figures begin: a flying figure in red with streaming white scarves at the right, a pale cream cloud beneath it, and at the far left the edge of a white face. They belong to the painting that continues along the wall beyond this frame, and the relief does not say who they are; they are drawn here as they are seen.'],
    rel: ['wl_beyond_buddha'], src: RELIEF + '.'
  }
};

/* The index, in the order the wheel is read: from the hub outward, then the
   one who holds it, then what is outside his reach. */
export const WHEEL_TREE = ['The wheel of life', [
  ['wl_wheel'], ['wl_verse'],
  ['—', 'The hub'], ['wl_hub'], ['wl_hub_bird'], ['wl_hub_snake'], ['wl_hub_pig'],
  ['—', 'The paths of karma'], ['wl_karma_white'], ['wl_karma_black'], ['wl_karma_demon'],
  ['—', 'The six realms'], ['wl_realm_gods'], ['wl_realm_asuras'], ['wl_realm_humans'],
  ['wl_realm_animals'], ['wl_realm_pretas'], ['wl_realm_hells'],
  ['—', 'The six sages'], ['wl_munis'], ['wl_muni_gods'], ['wl_muni_asuras'], ['wl_muni_humans'],
  ['wl_muni_animals'], ['wl_muni_pretas'], ['wl_muni_hells'],
  ['—', 'Among the gods and asuras'], ['wl_gods_meru'], ['wl_gods_palace'], ['wl_wish_tree'], ['wl_gods_army'],
  ['wl_asura_palace'], ['wl_asura_war'],
  ['—', 'Among humans and animals'], ['wl_human_stupa'], ['wl_human_teaching'], ['wl_human_village'],
  ['wl_human_nomads'], ['wl_human_plough'], ['wl_animals_land'], ['wl_animals_sea'],
  ['—', 'Among the pretas'], ['wl_preta_palace'], ['wl_preta_fire'], ['wl_preta_beaten'], ['wl_preta_river'],
  ['—', 'The court of Yama'], ['wl_hell_judge'], ['wl_hell_pebbles'], ['wl_hell_court'], ['wl_hell_torments'], ['wl_hell_cauldron'], ['wl_hell_stupa'],
  ['—', 'The eight hot hells'], ['wl_hell_sanjiva'], ['wl_hell_kalasutra'], ['wl_hell_samghata'], ['wl_hell_raurava'],
  ['wl_hell_maharaurava'], ['wl_hell_tapana'], ['wl_hell_pratapana'], ['wl_hell_avichi'],
  ['—', 'The eight cold hells'], ['wl_cold_arbuda'], ['wl_cold_nirarbuda'], ['wl_cold_atata'], ['wl_cold_hahava'],
  ['wl_cold_huhuva'], ['wl_cold_utpala'], ['wl_cold_padma'], ['wl_cold_mahapadma'],
  ['—', 'The other hells'], ['wl_hell_neighbouring'], ['wl_hell_ephemeral'],
  ['—', 'The twelve links'], ['wl_nidanas'], ['wl_nidana_ignorance'], ['wl_nidana_formations'], ['wl_nidana_consciousness'],
  ['wl_nidana_namerupa'], ['wl_nidana_senses'], ['wl_nidana_contact'], ['wl_nidana_feeling'], ['wl_nidana_craving'],
  ['wl_nidana_grasping'], ['wl_nidana_becoming'], ['wl_nidana_birth'], ['wl_nidana_death'],
  ['—', 'Yama'], ['wl_yama'], ['wl_yama_head'], ['wl_yama_crown'], ['wl_yama_eye'], ['wl_yama_hands'], ['wl_yama_feet'],
  ['wl_yama_tiger'], ['wl_yama_bones'], ['wl_yama_scarves'], ['wl_offering_bowl'],
  ['—', 'Beyond the wheel'], ['wl_beyond_buddha'], ['wl_beyond_pureland'], ['wl_beyond_path'], ['wl_beyond_moon'],
  ['wl_beyond_sun'], ['wl_beyond_fliers']
]];

/* An entry that is not about the wheel, but names something the wheel paints:
   opened while the wheel is on the screen, it frames that part of the wheel. */
export const WHEEL_ALSO = {
  gods_ways: 'wl_realm_gods', asuras: 'wl_realm_asuras', humans: 'wl_realm_humans',
  animals: 'wl_realm_animals', preta_realm: 'wl_realm_pretas', naraka_shaft: 'wl_hell_neighbouring',
  meru_core: 'wl_gods_meru', vaijayanta: 'wl_gods_palace', moon: 'wl_beyond_moon', sun: 'wl_beyond_sun',
  hell_sanjiva: 'wl_hell_sanjiva', hell_kalasutra: 'wl_hell_kalasutra', hell_samghata: 'wl_hell_samghata',
  hell_raurava: 'wl_hell_raurava', hell_maharaurava: 'wl_hell_maharaurava', hell_tapana: 'wl_hell_tapana',
  hell_pratapana: 'wl_hell_pratapana', hell_avichi: 'wl_hell_avichi',
  cold_arbuda: 'wl_cold_arbuda', cold_nirarbuda: 'wl_cold_nirarbuda', cold_atata: 'wl_cold_atata',
  cold_hahava: 'wl_cold_hahava', cold_huhuva: 'wl_cold_huhuva', cold_utpala: 'wl_cold_utpala',
  cold_padma: 'wl_cold_padma', cold_mahapadma: 'wl_cold_mahapadma'
};
