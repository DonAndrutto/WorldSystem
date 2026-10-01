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
