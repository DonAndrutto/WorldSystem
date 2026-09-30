# White Beryl interpretation skeleton

This release contains **no electional, natal, combination or remedy readings**.
`data/nakshatra_interpretation.json` is the editable source, keyed by all and
only the 28 IDs in `lunar-mansions.js`. The Tibetan, Wylie and Sanskrit names
and `form.en` → `symbol` were copied directly from that catalogue, including
its provisional forms. Names and glyphs were not re-audited. Abhijit occurs
once as `lm_byi_bzhin`; the Indian calculator has no Abhijit sector.

All other interpretation fields remain null/empty, combinations remain
`partial`, and every entry has `needs_source_review: true`. In particular,
`element`, `nag_rtsis_element` and `deity` have not been populated.

## Source review before population

A human will review the supplied chapter 33 OCR against page images and
`docs/WHITE-BERYL-SOURCE-EXTRACTS.txt`. Every shipped reading must have its
exact cited **L:** line pasted in the population PR. Do not fill from memory,
older brief examples, DeepSeek, kalacakra.org or Tibet-Encyclopaedia.
Keep rgya_gar and rgya_nag distinct. No hybrid element/combination table is
licensed by this skeleton.

`getActiveSbyorBa` deliberately returns `unknown` for every input until its
rules are attested. A complete moment requires date, time, a resolved zone or
UTC offset, finite UTC milliseconds, and vāra. Complete data alone cannot
make a combination known. Relationship arrays belong to the natal entry and
name current catalogue IDs; the logic compares them only when an explicit,
valid `natalId` is provided. There is no inferred natal star and no natal
input in this release. No source readings are implied by this API convention;
review it along with the eventual relationship data.

## Runtime and editing

Run `node scripts/build-interpretation.cjs` after editing JSON, followed by
`node scripts/build-sw.cjs`. The first script produces the checked-in
`interpretation-data.js` module from the JSON verbatim. It does not regenerate
or overwrite the JSON. The second pins both files and the UI in the offline
shell. Interpretation modules are eagerly imported with the application;
opening or expanding a reading performs no request, computation service,
storage access or external navigation.

The same component appears after a successful calculator result (linked by
`catalogueId`), in the mansion index, and in the world’s mansion detail.
It starts collapsed, hides null fields, caps each electional list at seven,
and shows at most three natal bullets before More. Remedy text is visible
only with a known affliction or explicit Show remedies. Empty remedy fields
stay empty. Technical tooltips appear only with the corresponding readings.

Payloads use English `textContent`, `lang="en"` and `data-no-localize`;
Polish chrome uses the existing locale observer. A visible notice and
About → Astrology explain that Polish interpretation localization is pending.

## Verification

- `node tests/jyotisha-interpret.mjs` (jsdom): exact catalogue keys and copied
  metadata, null policy, generated file parity, disclosure, empty states,
  optional natal input, safe text, list limits, both panels, no network.
- `node tests/jyotisha-panel.mjs`: birth UX, DST refusal/choice, stale results.
- `node tests/jyotisha.mjs` and `node tests/jyotisha-engine.mjs`: unchanged
  arithmetic, Lahiri, frozen reference fixtures and date resolution.
- `node tests/offline.mjs`: cache digest and library integrity pins.
