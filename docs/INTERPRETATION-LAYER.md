# White Beryl interpretation layer

The editable source is `data/nakshatra_interpretation.json`, keyed by the 28
catalogue IDs. All entries now include selected English electional and natal
readings, the source Tibetan passage, chapter/body-block citations, and
historical illness-onset ritual descriptions from `White Beryl Chapter 33.docx`.
These are selective summaries, not a complete translation or a medical forecast.
Uncertain deity readings are identified; unsupported fields remain empty.
Catalogue identities and artwork remain unchanged.

The chapter 33 life-course review fills 19 additional fields across 14 mansions:
5 health, 5 wealth, 2 relationships, 2 mode-of-death and 5 spiritual summaries.
The other 121 fields intentionally remain null where unsupported, ambiguous or
already covered by character/lifespan. Null means “unsupported in selective
extract,” not “awaiting invention.” The supporting natal clauses are recorded
in [the chapter audit](WHITE-BERYL-CH33-AUDIT.md#natal-life-course-review);
illness-onset passages and death-day omens are not natal predictions.

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

## Reading context and references (October 2026)

Catalogue readings explicitly describe recurring Moon occupancy, with no claim
that the mansion is active today. Calculator readings carry the entered date,
local clock, selected place (or manual coordinates), IANA zone/UTC offset and
calculated mansion interval. Both endpoints include their full local date and
actual offset, including when an interval crosses midnight or a DST change.
The interval belongs to the Indian Lahiri engine; it is not presented as a
Tibetan calendar interval. Weekday combinations apply to the selected moment
and may change at sunrise even within the same mansion interval. A polar result
retains date/mansion context while explaining the unavailable sunrise weekday.

Activities, Birth, Combinations and Rituals distinguish the questions being
answered. Activity lists no longer truncate after seven items. Natal portraits
use direct language; lifespan motifs are under “Traditional life-course details.”
Citations, table ambiguities, translation decisions and Tibetan passages remain
in a single collapsed source section. No uncertain deity has been silently
replaced with a Jyotisha counterpart. Historical illness-onset rituals require
explicit disclosure and are not prescribed for adverse combinations.

Additional references reviewed and linked in the app:

- [Men-Tsee-Khang, Introduction to Tibetan Astro-Science](https://mentseekhang.org/introduction-to-tibetan-astrology/): institutional account of the Tibetan/Indian/Chinese traditions and the five elements and their relationships. Implemented in “How to read this” and the five-element table explanation.
- [Alexander Berzin, Tibetan Astro Sciences](https://studybuddhism.com/en/advanced-studies/history-culture/tibetan-astrology/tibetan-astro-sciences): authored account of calendar-making, activity timing, lunar mansions and conditional birth readings. Implemented in the activity/birth distinction and life-course context.
- [Men-Tsee-Khang, Calendar](https://mentseekhang.org/calendar/): official description of its almanac and calendar publications. Linked for readers seeking a Tibetan calendar rather than this app’s Indian astronomical cross-reference.

Chapter 33 of the supplied White Beryl remains the authority for individual
mansion lists and combination rules. These additional resources supply context,
not substitute per-mansion predictions or new calendar algorithms. Edward
Henning’s “Horary and electional astrology of the five components” was also
located in an attributed reproduction, but the original kalacakra.org page was
unavailable; its differing activity lists were not merged into chapter 33.

City options retain native click activation. Focus leaving the input for an
option no longer closes the list before selection. Pointer tracking protects
the blur-before-click touch sequence, permits native list scrolling, and resets
on release/cancellation. Keyboard navigation, outside dismissal and manual
coordinates remain available. Regression coverage includes real mouse and
touch input, keyboard selection, focus transfer, cancelled touches, coordinate
and zone updates, narrow layouts and clearing readings after editing the date.
