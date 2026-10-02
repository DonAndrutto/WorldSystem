# Chapter 33 source audit

Primary source: `docs/White Beryl Chapter 33.docx`. The checked-in extraction
uses zero-based OOXML body-child block numbers, not page numbers. It preserves
Tibetan text, table rows, grid spans and vertical-merge markers. The document has
601 paragraphs and 22 tables. English readings are selected summaries with
original passages available alongside them; they are not an expert-certified
translation. Older line citations are retained as secondary cross-references.

## Coverage and table inventory

- Blocks 118–172: the 28 individual mansion passages, in catalogue order.
- Blocks 254–256: ten four-element combinations and their weekday/star classes.
- Blocks 264–300: named weekday/star combinations, including alternate traditions.
- Tables 308, 310, 312, 315: tithi/weekday/vowel groupings, four elements,
  initial-letter elements, and year-animal correspondences.
- Tables 317, 320: principal named-day lists and variants.
- Tables 323, 326: rdo rje gtsug lag day lists.
- Tables 332, 334, 336, 338, 340, 342, 344, 346: karana halves.
- Tables 349, 352, 355, 360, 363: wood/fire/earth/iron/water relationships.
- Table 367: weekday five-element relationships.

All tables are preserved for inspection. Runtime rules implement mansion
readings, four-element day combinations, named day lists, and five-element
reference groups. Vowel, initial-letter, year-animal and karana tables are not
silently turned into additional calculations.

## Reconciliation decisions

Four-element rgya gar and five-element nag rtsis classifications are distinct.
The explicit mansion names in verses 256 and 260 determine group identities;
numeric table transcription defects do not override them. Raw extracted cells
remain unchanged. In particular, table 355 has out-of-range numbers 33–36,
table 360 includes 33, and table 363 repeats 22. Group membership in the prose
resolves the corresponding five-element lists.

Number 21 can denote gro bzhin or the inserted byi bzhin. Use an explicit named
verse when it resolves the identity: for example, block 268 names byi bzhin
for Monday despite the numeric table's 21. Do not apply a universal numeric
conversion. Cemetery-star reference numbers remain visibly unresolved where
the supplied context does not resolve the identity.

Merged cells in the five-element tables group lists under an element heading;
rows are not individual natal-to-current-star mappings. The reader exposes
mother/friend/child/enemy element groups separately, without inventing natal
relationships. No birth mansion is inferred from these lists.

Alternative named-day traditions are retained, including simultaneous favorable
and adverse lists. The specific electional exceptions remain relevant; no
net score discards them. Ambiguous deity names remain qualified or empty.
Catalogue owner-corrected symbols and identities are preserved.

The illness-onset effigy material belongs to its own historical context. It is
not a remedy selected by weekday combination. Block 174's minor-star interval
ritual is not generalized to all mansions or all adverse days.

## Natal life-course review

All 28 individual passages were read against `source_tibetan` and their cited
DOCX/extract blocks; the three text representations agree exactly. The following
19 additions come from the birth clauses in those blocks. Existing `natal.source`
citations already identify the contributing block and the passage's L opening
page, so they are retained. No additional block contributes to these summaries.
These are selective English summaries of the supplied text, not fixed personal
forecasts or new diagnoses. Character and lifespan are unchanged.

| Mansion | DOCX body block; L opening page | Field | Supporting natal clause |
| --- | --- | --- | --- |
| bra nye | 120; 314 | health | ནད་མེད་བདེན་སྨྲ — freedom from illness. |
| bra nye | 120; 314 | spiritual | སྙིང་རྗེ་ཤིན་ཏུ་ཆུང་བས་ན། །ཕྱི་མ་དམྱལ་བའི་གནས་སུ་སྐྱེ — little compassion linked with hell rebirth. |
| snar ma | 124; 315 | wealth | བུ་སྐྱེས … ཕྱུག་ཅིང — the son is described as wealthy. |
| nabs so | 130; 316 | health | བློ་བརྟན་ནད་མེད — freedom from illness. |
| rgyal | 132; 317 | wealth | ཁྱེའུ … ནོར་ལྡན་སྐལ་བ་བཟང — wealth and good fortune, scoped to a son. |
| skag | 134; 317 | relationships | མ་དང་འགྲོགས་ཡུན་ཐུང — a short time together with the mother; no cause of separation is inferred. |
| gre | 138; 319 | health | བུ་མོ་ཡིན། །ནད་མང — frequent illness, scoped to a daughter. |
| dbo | 140; 319 | mode_of_death | དུག་གིས་འཆི — poison as a cause of death. |
| dbo | 140; 319 | spiritual | བསྙེན་གནས་ལ་དགའ — fondness for fasting-vow observance; more specific than the existing character's discipline. |
| sa ri | 146; 321 | wealth | འབྱོར་རྙེད … ལོངས་སྤྱོད་ལྡན — acquisition of wealth and possession of material resources, distinct from character's “resourceful.” |
| snon | 152; 323 | spiritual | ཆོས་བྱས་མྱུར་དུ་ཁྲིམས་འཆལ་འགྱུར — a lapse in discipline after religious practice. |
| chu stod | 156; 324 | spiritual | མཐོ་རིས་ཐོབ — a higher rebirth. |
| mon dre | 164; 326 | wealth | བུ་ནོར་འཕེལ — increasing wealth. |
| mon dre | 164; 326 | relationships | བུ་ནོར་འཕེལ — increasing children. |
| mon dre | 164; 326 | mode_of_death | ཆུ་ཡིས་འཆི་བར་འགྱུར — water as a cause of death; no more specific mechanism is inferred. |
| mon gru | 166; 326 | health | བབ་ཅོལ་ནད་མེད — freedom from illness. Early death remains in lifespan, not a fabricated cause-of-death field. |
| khrums smad | 170; 327 | wealth | བུ་བཙས … ཕྱུག་ཅིང — wealth, scoped to a son. |
| khrums smad | 170; 327 | spiritual | བུ་བཙས … ཆོས་སྦྱིན་བྱེད — giving Dharma teachings, scoped to a son. |
| nam gru | 172; 328 | health | དབང་པོ་ཚང — intact faculties; no disease claim is added. |

The remaining 121 slots stay null. In particular, already summarized wealth,
family, health and religious traits are not copied out of character; ambiguous
phrases are left unexpanded. The illness-onset clauses beginning `ནད་བཏབ` and
the death-day/omen clauses are separate contexts, not evidence for natal health
or mode of death. Personal `enemy_star_ids` and `death_star_ids` remain empty;
afflicted/enemy-star/death-star remedies, source-review flags and all other
reading fields are unchanged.
