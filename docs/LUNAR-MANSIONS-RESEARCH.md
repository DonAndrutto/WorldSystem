# Lunar mansions: Indian and Tibetan research dossier

Prepared 29 September 2026 for WorldSystem. Updated after examination of the supplied White Beryl volumes. Companions: [primary-text audit](WHITE-BERYL-LUNAR-MANSIONS.md), [integration plan](LUNAR-MANSIONS-PLAN.md), [Claude implementation prompt](CLAUDE-LUNAR-MANSIONS-PROMPT.md).

**Current scope:** all 28 Tibetan mansions, optional and off by default, represented as 2D sprites/billboards inside the 3D world, with a required accessible index and a separate Indian Lahiri calculator. White Beryl supplies the catalogue; the supplied lower volume also contains Mipham’s separately attributed clarificatory appendix. Comparative history below is background research, not a requirement for a comparison-heavy interface.

The most productive direction is to present the mansions as a meeting point of celestial observation, calendrical calculation, ritual, and painting. Their different historical uses should remain visible. A single set of twenty-eight “karmic personalities” would obscure much of what makes this material interesting.

This dossier reviews [Abhidharma Lunar Mansions Cosmology](https://docs.google.com/document/d/1M9KZsXkj5vhlCYXHsn0c_gYEraINppjKklRiXobmlH0/edit), supplied by the project owner, against the sources below. It is a research and editorial plan, not a completed critical edition or an approved deity-painting specification. The original Drive document has not been changed.

## 1. Distinguish the historical layers

| Layer | Research focus | What WorldSystem can teach |
| --- | --- | --- |
| Vedic nakṣatra traditions | Named asterisms, associated deities, sacrificial timing, changing lists | The mansions precede Buddhist cosmology and do not have one timeless inventory of attributes. |
| Classical Indian jyotiṣa | Computational sectors, electional classifications, natal interpretations | A celestial sector, a star group, an electional quality, and a presiding deity are different kinds of information. |
| Indian Buddhist astral traditions | Protective texts, ritual arrangements, astral deities | Buddhist uses include protection and ritual incorporation, alongside the scholastic world model. |
| Tibetan skar rtsis and Kālacakra-derived calendars | Calculation, almanacs, moon position, calendar traditions | The mansion is one calendrical component; it does not by itself determine the interpretation of a day. |
| Tibetan elemental calculation | Five-element, directional, animal, trigram, and number associations | These associations form a particular Tibetan synthesis; they should have their own source-labelled fields. |
| Himalayan iconographic witnesses | White Beryl materials, Alchi and related mandalas | A named mansion can have an asterism diagram, an emblem, and a personified form, which need not look alike. |

These are research categories, not a claim that the traditions remained isolated. The Rubin describes White Beryl as a synthesis of several currents. Its illustrated Sakya manuscript is eighteenth-century, later than Sangye Gyatso's treatise; the two must not share a single date in the asset catalogue. [Rubin Museum](https://rubinmuseum.org/the-white-beryl-manuscript/)

## 2. Corrections and qualifications to the starting document

| Starting claim | Finding and editorial action |
| --- | --- |
| Early Vedic traditions universally had 28; 27 followed foreign zodiacal influence | Revise. A study of Vedic lists identifies 27 in Taittirīya Saṃhitā IV.4.10.1–3 and distinguishes references to individual stars from complete lists. The Ṛgveda is not a complete 28-name catalogue. Avoid a simple 28 → 27 evolutionary story. [Vedic-list study](https://epublications.vu.lt/object/elaba%3A184788178/184788178.pdf) |
| Kālacakra expands 360 degrees to 1,620 degrees | Correct the units. Berzin uses “degrees” for sixty subdivisions of each of 27 mansions. These describe the same full circle in different units: 27 × 60 = 1,620; one such unit equals 2/9 of an ordinary degree. The circle does not expand. [Berzin, section on lunar constellations](https://studybuddhism.com/en/advanced-studies/history-culture/tibetan-astrology/details-of-tibetan-astrology-2-heavenly-bodies-and-periods-of-time) |
| Indian and Tibetan 28-name sequences can use the same numbering | Resolved for this app: White Beryl’s descriptive sequence places gro bzhin before byi bzhin (lower volume p. 325, lines 10503–10518). Upper volume p. 18 explicitly explains their shared allotment. Use that Tibetan sequence for all 28 sprites. See the [primary-text audit](WHITE-BERYL-LUNAR-MANSIONS.md). |
| The supplied table's qualities are uniformly Indo-Tibetan/Abhidharma | Revise attribution. In Bṛhat Saṃhitā 98, Kṛttikā is mixed and Pūrvaphalgunī is severe; the supplied table calls them sharp and gentle. Record the text and verse for each classification. [Bṛhat Saṃhitā 98.6–11](https://www.wisdomlib.org/hinduism/book/brihat-samhita/d/doc229361.html) |
| Abhijit practically guarantees ritual success | Remove the guarantee. The Tibetan electional material varies its recommendations by activity and includes both favorable and unfavorable uses of Abhijit. [Henning exposition, mirror](https://tibetanbuddhistencyclopedia.com/en/index.php/Horary_and_electional_astrology_of_the_five_components) |
| Sipaho normally supplies the desired ring of 28 | Do not assume this. The documented Rubin example has central numbers, trigrams, and a twelve-animal outer circle. It is useful comparative material, but that object does not establish a standard 28-mansion outer ring. [HAR item 28, Rubin P1994.13.1](https://www.himalayanart.org/items/28) |
| Xiuyao jing was produced by Amoghavajra with his disciple Yixing | Correct. Yano identifies Shiyao with the 759 translation and Yang Jingfeng with the 764 revision. His recension study also distinguishes a preserved 27-mansion system from a 28-mansion adaptation. [Yano](https://icabs.repo.nii.ac.jp/record/367/files/%E7%9F%A2%E9%87%8E%E9%81%93%E9%9B%84%28%E8%A8%82%E6%AD%A3%E7%89%88%29.pdf) |
| The 28 mansions dictate psychological and karmic events as an Abhidharma doctrine | Treat this as the document's interpretive synthesis until precise passages are supplied. A cosmological account of winds carrying luminaries does not establish every later electional or natal claim. Niu separates cosmology, mansion systems, calendars, and other astronomical materials. [Niu 2024](https://www.mdpi.com/2077-1444/15/11/1321) |
| Liberation stops the external astral wheel | Do not turn this metaphor into app physics. A claim about an individual's liberation or subtle-body practice is not evidence that the shared visible cosmos literally stops. Require a specific textual passage and commentary before adding explanatory copy. |

Several remaining claims—specific Meru face materials, exact heights of all classes of stars, the dating of particular translations, and details of Mahāmāyūrī/Grahamātṛkā rituals—still need passage-level checking. They should not enter the app solely on the authority of the starting report.

## 3. What deeper Indian study adds

Use three distinct questions for each mansion: **what is named in the sky, what does an astrologer classify, and how is the entity represented?**

Bṛhat Saṃhitā 98 is particularly useful because it gives deity associations and groups appropriate activities by mansion quality. Those classifications are about the suitability of actions; they should not automatically become personality profiles. The accessible nineteenth-century translation also has readings that need comparison with Sanskrit: its Mūla deity and its moving-group list should not be silently normalized from a modern popular table. This makes a textual-variant field necessary. [Bṛhat Saṃhitā 98](https://www.wisdomlib.org/hinduism/book/brihat-samhita/d/doc229361.html)

For the Buddhist layer, there is direct canonical evidence for a group of twenty-eight in a protective context: Sitātapatrā, Toh 590, §1.9 explicitly includes pacification of the mansions. This supports a study entry about Buddhist astral protection. It does not supply twenty-eight complete image prescriptions. [84000 translation](https://84000.co/translation/toh590)

Next textual work should compare the Śārdūlakarṇāvadāna, Mahāmāyūrī, and the Sarvadurgatipariśodhana corpus by edition and passage. Record the order, names, ritual roles, and visual attributes separately. These are priority research leads, not texts fully collated in this pass.

## 4. What deeper Tibetan study adds

The key computational distinction is between **27 equal longitude units** and a **28-member named or ritual collection**. In Janson's formulation the daily mansion is obtained from the Moon's longitude, and the calendar includes other components such as lunar day, weekday, yoga, and karaṇa. Phugpa and Tsurphu are distinct computational traditions. [Janson, §10 and Appendix A](https://arxiv.org/html/1401.6285)

Design implication: a date-based feature must state its calendar tradition and day boundary. A gallery of twenty-eight glyphs needs no such computational claim. The app should let users encounter both without pretending they are the same diagram.

The supplied White Beryl now directly confirms this collection of 28 and explains the paired computational count. This belongs in a discreet source note; a separate 27-sector comparison is outside the requested initial release.

A second distinction concerns **elements**. Janson's elemental-yoga discussion uses earth, fire, water, and wind for the relevant weekday/mansion pairing. This should not be collapsed into the five-element cycle of wood, fire, earth, iron, and water. Store the systems independently. [Janson, Appendix E, “Elemental yoga”](https://arxiv.org/html/1401.6285)

A third concerns **context**. Tibetan electional lists can assess the same mansion differently for different activities; the reproduced Henning material draws on White Beryl and Pawo Tsuklag Threngwa's Treasury of Jewels. Build an account of how interpretation is assembled, rather than a single green/red “luck” score. The supplied primary text now supports activity-specific interpretation directly (lower volume pp. 313–328 and p. 376); use its passage references in production copy. [Henning exposition](https://tibetanbuddhistencyclopedia.com/en/index.php/Horary_and_electional_astrology_of_the_five_components)

For broader philosophical framing, consult Berzin's [philosophical context](https://studybuddhism.com/en/advanced-studies/history-culture/tibetan-astrology/details-of-tibetan-astrology-1-philosophical-context-and-horoscopes) and [almanac explanation](https://studybuddhism.com/en/advanced-studies/history-culture/tibetan-astrology/details-of-tibetan-astrology-9-the-tibetan-almanac). Use those as interpretive guides, with primary passages behind any concrete historical assertion.

## 5. Authoritative Tibetan catalogue

The complete table is now in the [White Beryl audit](WHITE-BERYL-LUNAR-MANSIONS.md), with Tibetan labels, Sanskrit concordances, star counts, textual forms, both element systems, and original line/page references. It replaces the earlier Indian-style table and its provisional Tibetan motifs.

Key corrections: gro bzhin precedes byi bzhin; use mon dre as the source spelling; translate lha mtshams’s glang po as elephant; distinguish it from byi bzhin’s ox head; bra nye is northeast in the source’s elemental arrangement. Four lost motif openings and two local readings remain explicitly identified in the audit rather than casting doubt over the catalogue.

## 6. Iconographic direction and source priorities

**White Beryl: primary basis for the glyphs.** The lower volume pp. 313–328 gives asterism shapes. The revised release turns these into 28 distinct transparent glyphs in the 3D scene. Source shape and star count are historical data; drawing style, colors and node placement are artistic interpretations. A shape description and a deity name are separate facts.

**Mipham: preferred interpretive source where applicable.** The lower volume appends *nag rtsis brjed byang snying po gsal ba*, beginning p. 474 and signed by Mipham at p. 539. Its opening explicitly addresses difficult points in White Beryl. It offers a concrete connection to the owner’s Nyingma preference, without requiring an invented Nyingma-specific set of 28 figures. See the audit for exact passages and the matching collected-works catalogue.

**Alchi: strongest new Himalayan lead.** Luczanits's published discussion identifies twenty-eight mansions distributed in groups around a mandala. It notes that the painted cycle begins with Kṛttikā although a related textual list begins with Aśvinī, and that the paintings give information beyond the textual colour list. That is exactly why WorldSystem needs source-specific sequence and iconography. The indexed passage was available; the full PDF did not render through the research browser, so individual figures, colours, and objects remain unverified here. [Luczanits, Alchi, discussion around pp. 158–159](https://www.luczanits.net/pdf/Alchi_Book_interactive.pdf)

**Indian/Newar comparison: second research track.** Van Kooij's study of Buddhist wood-carvings in a Kathmandu monastery discusses lunar-mansion imagery and lotus attributes. Inspect the complete plate sequence before deriving any shared pose or attribute. This is a regional comparison, not a Tibetan painting prescription. [Van Kooij study](https://pahar.in/pahar/Books%20and%20Articles/Nepal/1977%20Iconography%20of%20the%20Buddhist%20Wood-carvings%20in%20a%20Newar%20Monastery%20in%20Kathmandu%20by%20van%20Kooji%20s.pdf)

**Sipaho and East Asian astral art: supporting comparisons.** They can demonstrate different arrangements of astral knowledge, but should not set the primary visual vocabulary for this Tibetan/Indian extension. The verified Sipaho object is useful precisely because its circle organizes a different set of entities. [HAR catalogue](https://www.himalayanart.org/items/28)

Current visual form: **2D glyphs of the source’s motifs within the 3D world**, with attested star counts available in details. Full deity personifications remain a separately sourced asset type. For those, record face and arm count, body colour, posture, implements, dress, support/mount, direction and figure identification. The current text audit does not establish a complete 28-figure prescription.

## 7. Implementation readiness

Ready: the complete Tibetan collection and sequence; most textual shapes and star counts; both element systems; five-element directional groups; seven planetary rulers; and the separately attributed Mipham connection. The [audit](WHITE-BERYL-LUNAR-MANSIONS.md) records the remaining local OCR gaps and secondary-supported fallbacks.

Implement the complete optional 28-sprite layer and required accessible index. The owner’s revised scope supersedes the earlier six-entry prototype and prominent Indian/Tibetan or 27/28 comparison. The subsequent owner revision adds a separate Indian Jyotiṣa calculator with explicit Lahiri configuration. See the [revised plan](LUNAR-MANSIONS-PLAN.md) and [technical review](LUNAR-MANSIONS-REVISION-REVIEW.md). A full Tibetan calendar calculation remains separate work.
