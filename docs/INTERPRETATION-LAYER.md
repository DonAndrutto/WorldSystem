# White Beryl interpretation layer

The editable source is `data/nakshatra_interpretation.json`, keyed by the 28
catalogue IDs. All entries now include selected English electional and natal
readings, the source Tibetan passage, chapter/body-block citations, and
historical illness-onset ritual descriptions from `White Beryl Chapter 33.docx`.
These are selective summaries, not a complete translation or a medical forecast.
Uncertain deity readings are identified; unsupported fields remain empty.
Catalogue identities and artwork remain unchanged.

Four-element weekday/mansion combinations and named day lists are implemented
in `white-beryl-rules.js`. Alternative traditions remain separate, including
conflicting readings. There is no aggregate auspiciousness score. The calculator
passes its explicit catalogue mapping and sunrise-based weekday to the reader;
it remains an Indian astronomical cross-reference, not a Tibetan calendar.
Abhijit has its own catalogue entry and no invented Indian calculator sector.

The five-element nag rtsis relationship tables appear separately as reference
material. Their merged columns describe element groups. They do not establish
individual natal enemy/death pairs; those personal relationship arrays stay
empty. See `WHITE-BERYL-CH33-AUDIT.md` for source decisions.

Readings start collapsed in the catalogue and calculator. Tibetan source text
is expandable. English readings are excluded from automatic Polish translation;
Polish interface text retains the existing locale mechanism. Historical ritual
material is separately disclosed and is not prescribed for an adverse day.

## Rebuilding

- `python3 scripts/extract-white-beryl.py`: reproducible OOXML extraction,
  retaining merged-cell information and all 22 tables.
- `node scripts/build-interpretation.cjs`: JSON to browser module.
- `node scripts/build-places.cjs`: all 337 supplied cities to browser module.
  Coordinates come from the supplied list; IANA zones are supplemental data in
  `data/city-zones.json`, validated by the generator.
- `node scripts/build-sw.cjs`: refresh offline shell and content digest.

City selection uses a keyboard-accessible dropdown, fills coordinates and zone,
and offers manual coordinates only when no city matches. Latin search accents
are folded (including Ł/ł); Tibetan vowel signs are preserved.

## Verification

`tests/jyotisha-interpret.mjs` checks all source passages, table preservation,
196 weekday/mansion pairs, named-list identities, ambiguity handling, safe
rendering and integration. `tests/search-places.mjs` checks city source parity,
zone validity and accent folding. Panel tests cover city selection, manual
fallback, DST and stale asynchronous results. Chrome tests cover tour placement.
The astronomy and offline suites check existing calculations and cached assets.
