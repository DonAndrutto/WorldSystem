# The destinations in three dimensions

What each square's model in the world arrangement shows. The recipes are in [`square-models.js`](../square-models.js); this list is copied from the description that heads each one. The board arrangement keeps the painted fields.

Squares 1–7, 10, 17–20, 27–32 and 35–37 have no model: the world itself builds what they name. The hells, the Vajra Hell and the pretas' ground are the world's own models (`REALM_MODELS`), listed at the end.

The people in them share one body (`human-figure.js`), proportioned from life: a standing figure is about seven and a half heads tall, the eyes halfway down the head, the face from hairline to chin in three nearly equal parts — forehead, nose, mouth and chin — the forehead a little the least, as in life, where the painters' grid of twelve finger-widths makes them equal; the shoulders a little over two and a half heads across the deltoids, and the limbs, hands and feet of a grown man's girth and length. The head is sculpted as one surface: a rounded cranium, brow ridge, eye sockets, cheekbones, nose, lips, jaw and chin raised from it, with the brows, the lines of the lashes and the lips laid on it; ears with their tragus and lobe, the lobes long and pierced for Buddhas and gods. Every head of hair is a cap over the skull that begins on one hairline. The torso is turned from anatomical sections — collarbones and the notch between them, the breast, the trapezius rising to the neck, shoulder blades and spine — and the arms come out of the shoulders' mass; arms and legs are swept along their bones, the joints placed by the bones' lengths; the hands have a palm and five jointed fingers making the gesture — meditation, touching the earth, teaching, protection, giving, the heart; and, seated, the legs are crossed in the vajra posture with both soles turned up. A Buddha has the snail-shell curls set in rings from the hairline to the crown and over the uṣṇīṣa, a jewel on the uṣṇīṣa, the ūrṇā, three folds at the neck like a conch, and wears the monastic robe over the left shoulder, its rolled edge cut clean across the breast, the right shoulder bare, as monks and arhats do: the robe falls in folds from the forearm, lies over the lap and fans over the seat, and a standing figure's falls to the ankles. A bodhisattva or deity has the five-pointed crown, a topknot, necklaces lying on the breast, bracelets and armlets turned to the limb, and a silk scarf over a bare body, its ends falling past the arms; a layman wears a coat. The figure's right hand is towards -x, the viewer's left.

The wrathful have a kit of their own (`wrathHead`, `wrathBody`, `implement`): round staring eyes and the third eye, brows and beard of flame, the mouth open on its fangs, a crown of five skulls with a flaming jewel over each, hair rising like fire, rings in the ears; a squat body in the striding stance with the tiger skin, a garland of heads, and as many heads, arms and legs as the form has, each hand with what it holds. Mahākāla is the board's own mask in the round; Rudra stands on his black block as a heruka with three faces, six arms and four legs. The beings of the hells (`sufferer`) and the servants of Yama (`yamaGuard`) are the common human body, naked, open-eyed and screaming, or horned, fanged and armed.

Buddhas have blue curls, a robe bordered in gold, and where the square allows, the full aureole (`buddhaAureole`: deep blue rimmed in gold, red and green with fine gold rays, a green head halo, flame tips) and a lion throne (`lionThrone`): a red throne banded in gold on its plinth, a snow lion to either side of its face bearing up the cornice, white, its mane in rows of turquoise curls, a brocade hanging down its middle, and on it a lotus seat. The lotus (`lotus`) has rounded, cupped petals, pink within and turned back below, a beaded gold rim, the seed head, and a moon disc to sit on. Teachers sit on a teaching throne of cushions, the broadest lowest, with brocade over its face and a bolster behind; monks on a cushion on a low base of wood; yogis on a mat of grass or a boulder. The stupa is a stupa of enlightenment: lion throne with its lions, four stepped tiers with projecting middles and bands of colour, the seat of the vase, a garlanded dome with a Buddha in its niche, the harmikā, thirteen wheels, the parasol hung with silks, and the moon, sun and flaming jewel.

The pretas (`preta`) are the same body starved: limbs like sticks, the belly like a mountain, the neck like a hair, the mouth like the eye of a needle, the cheeks hollow and the hair standing in tufts; some search, some beg with a bowl, some reach for what they cannot have, and fire comes from the mouths of some.

The game's highlight of a visited model makes each surface glow in its own colour, so a dark figure stays dark, only brighter.

| Square | Name | Model |
| --- | --- | --- |
| 1 | Vajra Hell | *The world's own geometry.* |
| 2 | Interminable Hell | *The world's own geometry.* |
| 3 | The Hot and Very Hot Hells | *The world's own geometry.* |
| 4 | The Howling and Great Howling Hells | *The world's own geometry.* |
| 5 | The Black Rope and Crushing Hells | *The world's own geometry.* |
| 6 | Reviving Hell | *The world's own geometry.* |
| 7 | The Cold Hells | *The world's own geometry.* |
| 8 | The Temporary Hells, or “Hell for a Day” | A boulder, a pillar and a tree in an ordinary landscape, and in each a being caught fast: the hells that last a day. |
| 9 | Lord of the Dead (Yama) | Yama’s mirror of karma, horned with the buffalo, in the red smoke of his court. |
| 10 | Hungry Ghosts (Preta) | *The world's own geometry.* |
| 11 | Animals | A spotted stag on a grassy rise, head up, listening for danger. |
| 12 | Divine Animals | A white elephant of the gods, caparisoned in red and gold, the wish-granting jewel on its back, on cloud. |
| 13 | World of the Nāgas | A nāga rising in coils from banded waves beside a flaming jewel. |
| 14 | Demon Island | A dark island of the rākṣasas with a red fortress, a skull above its gate. |
| 15 | Asuras | The asuras’ flaming sword, planted before the wish-granting tree whose fruit they fight for. |
| 16 | Rudra Black Freedom | On the black block capped with gold, Rudra become a heruka: three faces, six arms, four legs in the striding stance, a garland of heads, in a blaze of fire — freedom turned to a prison. |
| 17 | Jambu Island—The Southern Continent | *The world's own geometry.* |
| 18 | The Western Continent—Enjoyment of Cattle (Apara-Godānīya) | *The world's own geometry.* |
| 19 | The Eastern Continent—Noble Figure (Pūrva-Videha) | *The world's own geometry.* |
| 20 | The Northern Continent—Kuru | *The world's own geometry.* |
| 21 | Barbarism | Jagged red mountains bristling with spears, and a watchtower. |
| 22 | Hinduism | Leafy blue hills of learning with a temple tower and a trident. |
| 23 | Bön | Yungdrung Gutsek, the nine-tiered mountain of Bön, in its gold ring, with the yungdrung and the sun and moon at the summit; a Bönpo beats the drum, juniper smoke rises from the burner, and a divination arrow and prayer flags stand by. |
| 24 | The Heavenly Highway | Six coloured roads opening from one point towards the six realms: the start. |
| 25 | Beginning the Tantra | A teacher in a pandita’s hat on a lotus throne, the vajra and bell before him: entering the mantra path. |
| 26 | Wheel-Turning King (Cakravartin) | The golden wheel of the universal monarch, studded with jewels, standing on cloud. |
| 27 | Heaven of the Four Great Kings | *The world's own geometry.* |
| 28 | Heaven of the Thirty-three (Trāyatriṁśa) | *The world's own geometry.* |
| 29 | Heaven Without Fighting (Yāma) | *The world's own geometry.* |
| 30 | The Joyful (Tuṣita) Heaven | *The world's own geometry.* |
| 31 | Delighting in Emanations (Nirmāṇa-rati) | *The world's own geometry.* |
| 32 | Ruling the Emanations of Others (Paranirmita-Vaśavartin) | *The world's own geometry.* |
| 33 | Tantra, Lesser Path of Accumulation | Seven offering bowls before a maṇḍala plate, incense rising: the action tantra’s purity and offering. |
| 34 | Mahākāla | The face of Mahākāla, as the board paints it: dark blue, three round staring eyes, brows and beard of flame, the mouth bared on its fangs, a crown of five skulls with a flaming jewel over each, hair rising like fire, and great rings of gold in the ears. |
| 35 | The Realm of Form (Rūpa-Dhātu) | *The world's own geometry.* |
| 36 | The Formless Realm (Arūpa-Dhātu) | *The world's own geometry.* |
| 37 | Pure Abodes (Śuddhāvāsa) | *The world's own geometry.* |
| 38 | Disciples (Śrāvaka), Path of Accumulation (Sambhāra-Mārga) | A monk standing with alms bowl and ringing staff, in the blue cartouche of the disciples. |
| 39 | Disciples, Path of Application (Prayoga-Mārga) | A monk seated in calm abiding, applying stillness to the four truths. |
| 40 | Disciples, Paths of Vision and Cultivation (Darśana-Mārga, Bhāvanā-Mārga) | A monk seated before the wheel of the four truths, now seen directly. |
| 41 | Tantra, Middle Path of Accumulation | A practitioner and the deity seated face to face as companions: the conduct tantra. |
| 42 | Tantra, Greater Path of Accumulation | A crowned deity holding the vajra, the wisdom being entering the commitment being: the yoga tantra. |
| 43 | Independent Buddha (Pratyeka-Buddha), Path of Accumulation | A hermit’s hut beneath a tree, where no Buddha is teaching. |
| 44 | Independent Buddha, Path of Application | A solitary figure meditating under a tree, mindful of body, feeling, mind and things. |
| 45 | Independent Buddha, Path of Vision | A solitary figure at a charnel ground, ringed by the twelve links of dependent origination. |
| 46 | Independent Buddha, Path of Cultivation | The solitary meditator lifted on cloud, flame above and water below: abilities that are not the goal. |
| 47 | Independent Buddha, Arhatship | A pratyekabuddha seated beside his own small stupa: liberation reached alone. |
| 48 | Cessation (Nirodha) | An arhat absorbed in a sphere of peace, and Amitābha’s red light falling on him to rouse him. |
| 49 | Tantra, Path of Application: “Heat” | The vase of the first empowerment on a lotus, crested with peacock feathers. |
| 50 | Tantra, Path of Application: “Climax” | A skull-cup brimming with red and white nectar: the secret empowerment. |
| 51 | Disciples, Arhatship | An arhat seated on a rock with halo, bowl and staff: the disciple’s liberation. |
| 52 | Mahāyāna, Lesser Path of Accumulation | A lotus bud on its stem in the Mahāyāna cloud, holding the first spark of bodhicitta. |
| 53 | Mahāyāna, Middle Path of Accumulation | Five jewels on an opening lotus: faith, diligence, mindfulness, concentration and discernment. |
| 54 | Mahāyāna, Greater Path of Accumulation | A bodhisattva borne on cloud, the abilities of the greater accumulation put to use for others. |
| 55 | Mahāyāna, Path of Application: “Heat” (Ūṣman) | A butter lamp catching: the first warmth of realization. |
| 56 | Mahāyāna, Path of Application: “Climax” (Mūrdhan) | The lamp’s flame on a summit: the peak of the path of application. |
| 57 | Tantra, Path of Application: “Receptivity” | Sun and moon discs joined on a lotus, a drop of light between them: the wisdom empowerment of co-emergent bliss. |
| 58 | Tantra, Path of Application: “Highest Teachings” | A crystal on a lotus breaking into five-coloured light: the word empowerment pointing out luminosity. |
| 59 | Shambhala | Shambhala: a ring of snow peaks like the petals of a lotus round the palace of Kalāpa. |
| 60 | Potāla | Potala: a mountain rising from the sea with Avalokiteśvara’s white palace on its summit. |
| 61 | Urgyan (Uḍḍiyāna) | Uḍḍiyāna: a lotus on the lake of Dhanakośa, the child Padmasambhava born upon it, under a golden arch. |
| 62 | Hindu Wisdom-Holder (Vidyādhara) | A brahmin yogi in an arch of golden flame, with his trident, on cloud. |
| 63 | Mahāyāna, Path of Application: “Receptivity” (Kṣānti) | An open lotus holding only a moon disc: receptivity to emptiness. |
| 64 | Mahāyāna, Path of Application: “Highest Teachings” (Laukikāgra-Dharma) | The sun clearing a bank of cloud: the highest worldly stage, just before seeing. |
| 65 | Wisdom-Holder of the Bön Tradition (*Bön Vidyādhara) | A Bön sage in a blue hat, seated on a lotus within a ring of dark petals. |
| 66 | First Tantra Stage | A vase pouring water into a bowl: the water empowerment that opens the tantric bhūmis. |
| 67 | Wisdom-Holder Among the Gods of Sense Desire (*Kāmadeva-Vidyādhara) | A youthful wisdom-holder flying in a golden wreath of leaves, scarves streaming. |
| 68 | Wisdom-Holder of the Realm of Form (*Rūpa-Dhātu-Vidyādhara) | A radiant skyfarer seated on cloud in a wreath of silver-blue leaves. |
| 69 | Tantric Wheel-Turning King (*Mantra-Cakravartin) | The mantra wheel of the tantric sovereign: a blue double rim on vajra spokes. |
| 70 | Realm of Action-Completion (*Karma-Paripūraṇa) | A green crossed vajra in many-coloured flames: Amoghasiddhi’s field of accomplished action. |
| 71 | First Sutra Stage (Bhūmi) | The wish-granting jewel offered on a lotus: generosity, and the joy of the first bhūmi. |
| 72 | Wisdom-Holder of the Eight Siddhis | The sword of the siddhis upright on a lotus, ringed by eight gems for the eight accomplishments. |
| 73 | Second Tantra Stage | The five-pointed crown on a lotus: the crown empowerment. |
| 74 | Third Tantra Stage | The vajra standing on a lotus: the vajra empowerment of awakened mind. |
| 75 | Fourth Tantra Stage | The bell standing on a lotus: the bell empowerment of awakened speech. |
| 76 | Realm of Jeweled Peaks (Ratna-Kūṭa) | Ratnasambhava’s field: a golden palace in tiers crowned with the jewel. |
| 77 | Land of Bliss (Sukhāvatī) | Sukhāvatī: Amitābha in a blue aureole on a lotus, a pond of lotuses before him. |
| 78 | Fourth Sutra Stage | A fire burning on the hearth of diligence, consuming the obscurations: the Radiant. |
| 79 | Third Sutra Stage | A tall lamp shedding its light round: the Luminous, the perfection of patience. |
| 80 | Second Sutra Stage | A pure white lotus standing clean out of the water: the Stainless, the perfection of conduct. |
| 81 | Fifth Tantra Stage | Vajra and bell crossed on a lotus: permission to teach, the path of ripening complete. |
| 82 | Sixth Tantra Stage | The central channel with its wheels at crown, throat, heart and navel, the winds dissolving in it. |
| 83 | Seventh Tantra Stage | A moon disc glowing on a lotus: the semblance of luminosity. |
| 84 | Supreme Heaven (Akaniṣṭha) | Akaniṣṭha: the Vajradhātu palace, four gates and five colours, in a blue aureole on a lotus. |
| 85 | Realm of Superjoy (Abhirati) | Abhirati: Akṣobhya’s vajra over a still lake, jewel trees and a golden aureole on a lotus. |
| 86 | Seventh Sutra Stage | A bodhisattva striding out on cloud with a victory banner: the Far-Going, the perfection of skilful means. |
| 87 | Sixth Sutra Stage | The flaming sword of wisdom and the book, on a lotus: the Manifest, the perfection of wisdom. |
| 88 | Fifth Sutra Stage | A meditator before a stack of books: the Hard to Conquer, meditation joined with learning. |
| 89 | Eighth Tantra Stage | A body of rainbow light standing on a lotus: the illusory body, not yet pure. |
| 90 | Ninth Tantra Stage | A sphere of clear light on a lotus, rays streaming: luminosity. |
| 91 | Tenth Tantra Stage | The illusory body within the clear light: union at the stage of learning. |
| 92 | Great Enjoyment Body (Sambhoga-Kāya) | The enjoyment body: a crowned and jewelled Buddha in an arch of golden flame on a lotus. |
| 93 | Great Dharma Body (Dharma-Kāya) | The dharma body: a deep-blue Buddha, unadorned, in an arch of green and red flame. |
| 94 | Tenth Sutra Stage | A cloud raining the Dharma onto a lotus: the Cloud of Dharma, the tenth bhūmi. |
| 95 | Ninth Sutra Stage | A white conch on a lotus: Good Intelligence, the eloquence of the ninth bhūmi. |
| 96 | Eighth Sutra Stage | A mountain no wind can move, a vajra on its summit: the Immovable, the eighth bhūmi. |
| 97 | Adopting a Physical Form | The white elephant with six tusks of Māyā’s dream, caparisoned and bearing a jewel, descending on cloud: the Buddha taking birth. |
| 98 | The Setting Forth (Pravrajita) | The white horse Kanthaka, saddled and bridled, leaping out over the clouds under a parasol: the bodhisattva leaves the palace. |
| 99 | Ascetic Practices (Tapas) | The emaciated ascetic, seated in his practice, a bowl of rice beside him. |
| 100 | Conquest of Māra | The Buddha touching the earth, Māra’s arrows falling as flowers. |
| 101 | Buddhahood | The Buddha under the bodhi tree on the vajra seat: awakening. |
| 102 | Turning the Wheel of Dharma | The golden wheel of Dharma between two deer kneeling to it, as in the deer park at Sārnāth. |
| 103 | Demonstration of Miracles | The Buddha standing in the twin miracle: flame from the shoulders, water from the feet. |
| 104 | Nirvana | The stupa that receives the relics, gold and white, in the gold-rimmed cartouche of the last act. |

## The realms beneath Jambudvīpa

Each stands on its own floor in the world, in Explorer as in Game; the squares that name them stand on them. Their crowds are drawn at the figure's plainest level of detail.

| Realm | Model |
| --- | --- |
| Sañjīva (`hell_sanjiva`) | Sañjīva, the Reviving: weapons rise in the beings’ hands and they cut one another down; a cool wind passes over the fallen and they stand to fight again. |
| Kālasūtra (`hell_kalasutra`) | Kālasūtra, the Black Line: the servants of Yama rule black lines over the beings’ bodies and cut along them with saws and axes. |
| Saṃghāta (`hell_samghata`) | Saṃghāta, the Crushing: mountains shaped like the heads of rams and buffaloes close on the beings and grind them, and they are pounded in iron mortars until the blood runs as a river. |
| Raurava (`hell_raurava`) | Raurava, the Howling: fleeing the fire, the beings find a house of iron with no door, and inside it the fire is all there is; their cries name the hell. |
| Mahāraurava (`hell_maharaurava`) | Mahāraurava, the Great Howling: the house of iron has a second house within it, both ablaze, and the beings caught between the walls howl louder than in the first. |
| Tapana (`hell_tapana`) | Tapana, the Heat: on ground of burning iron the beings are run through with stakes of iron, from beneath to the crown, and beaten with hammers. |
| Pratāpana (`hell_pratapana`) | Pratāpana, the Intense Heat: the beings are lifted on iron tridents through the soles and out at the shoulders, wrapped in sheets of burning iron, and boiled in molten bronze. |
| Avīci (`hell_avichi`) | Avīci, without interval: a house of iron white with fire from all four sides, and the beings in it so one with the blaze that only their cries tell them from it. |
| The Vajra Hell (`hell_vajra`) | The Vajra Hell, beneath Avīci: the vajra of indestructible mind stands as the prison of those who broke its commitments, over a floor of black fire. |
| Arbuda (`cold_arbuda`) | Arbuda: the cold raises blisters over the whole body of the naked beings, alone on the ice. |
| Nirarbuda (`cold_nirarbuda`) | Nirarbuda: the blisters burst, and the sores run with blood and pus that freeze. |
| Aṭaṭa (`cold_atata`) | Aṭaṭa: so cold that nothing passes the lips but the chattering of the teeth. |
| Hahava (`cold_hahava`) | Hahava: the beings can only cry out against the cold, a long wordless lament. |
| Huhuva (`cold_huhuva`) | Huhuva: the cry gives way to a groan through clenched teeth, the body bent double. |
| Utpala (`cold_utpala`) | Utpala: the skin, gone blue, splits like the petals of a blue lotus. |
| Padma (`cold_padma`) | Padma: the flesh opens red beneath the blue, splitting like a lotus. |
| Mahāpadma (`cold_mahapadma`) | Mahāpadma, deepest of the cold hells: the body splits like a great lotus, to the bone, into many pieces. |
| The pretas (`preta_realm`) | The pretas’ ground, 500 yojanas beneath Jambudvīpa, where Yama’s city stands: earth cracked by a drought that does not end, burning in places, strewn with bones; a spring that turns to pus as they come to it, guarded by a servant of Yama with his club; a dead tree whose branches burst into flame as they reach for its fruit; and the hungry ghosts, bellies like mountains, necks like hairs, mouths like the eye of a needle, searching, begging, fighting over nothing, fire coming from the mouths of some. |
