# WorldSystem: Tibetan mansion sprites and Lahiri calculator

Revised 29 September 2026 from the owner's supplied handoff. This supersedes the earlier volumetric-model scope. Sources: [White Beryl audit](WHITE-BERYL-LUNAR-MANSIONS.md), [raw extracts](WHITE-BERYL-SOURCE-EXTRACTS.txt), [technical revision review](LUNAR-MANSIONS-REVISION-REVIEW.md). Ready-to-use handoff: [Claude prompt](CLAUDE-LUNAR-MANSIONS-PROMPT.md).

## Intended experience

An optional “28 Lunar Mansions” layer adds 28 custom, transparent, camera-facing glyphs to the existing 3D world. It starts off and remembers the user's preference. Clicking a sprite or choosing it from the required accessible HTML index opens its entry and supports a reliable return to the world view.

The catalogue follows White Beryl, using Mipham's separately attributed clarifications where relevant. A separate calculator is labeled “Indian Jyotiṣa calculation · Lahiri ayanamsa.” It calculates an Indian nakṣatra and links to the corresponding Tibetan catalogue identity. The main experience needs only brief source and method labels, not a count debate or repeated warnings.

## Existing integration points

The previous repo inspection covered GitHub main `20e4b599523c747b3435da02f05315c58a056c2c` and a different local revision. The current documentation pass confirmed browser imports of vendored Three.js 0.184.0 and no root package.json. Claude must recheck its current checkout before choosing file boundaries.

| Area | Integration |
| --- | --- |
| `index.html`, `three-d-stage.js`, existing luminary sprites | Isolated mansion sprite group, scene placement, rendering/picking lifecycle. |
| `def()`, `TREE`, shared entry panel | Stable mansion IDs, multilingual entries and sources. |
| Existing controls and persistence | Remembered layer toggle, selection and return camera state. |
| `presentation-tours.js` | Deliberate catalogue overview; no accidental expansion of unrelated tours. |
| Locale files and fonts | English/Polish UI, Tibetan names and Sanskrit diacritics. |
| `ARTWORK.md` and assets | Source-based glyphs, exported texture manifest and provenance. |
| `scripts/build-sw.cjs` | Register glyphs and any supported browser calculation assets for offline use. |

## Catalogue and iconography

Deliver all 28 distinct glyphs, following the audit's Tibetan sequence. gro bzhin precedes byi bzhin; use mon dre; distinguish the elephant of lha mtshams from byi bzhin's ox head. Revatī is boat-shaped with 32 stars. Star counts remain meaningful text even where a small glyph cannot display every point.

Keep separate fields for the source shape, star count, four-element assignment, five-element assignment, elemental direction, Tibetan planetary ruler and associated deity. Retain passage references and evidence status. The four damaged motif openings use the audit's secondary-supported cart, serpent hood, lotus fruit and ear. Show a small textual provenance indicator in their entries/index. Keep sa ga/rgyal reading notes discreetly accessible.

Produce consistent silhouettes with restrained line work and transparent backgrounds. Begin with separate 128–256 px textures; compare WebP and PNG exports. Optional halos must not overwhelm the forms. Textual shape and star count are source data; color, line style and halo are artistic treatment. No complete anthropomorphic deity set is required.

## Placement, selection and accessibility

Place the sprites in a horizontal ring near the celestial plane. Prefer an illustrative elemental arrangement: six entries per cardinal group, one at each intercardinal point, with bra nye northeast. Subdivide group space to prevent overlap. An evenly spaced gallery is an acceptable readability fallback with directions retained in the entries. Keep traditional display positions distinct from measured longitude.

Raycast against an array of eligible sprite objects only when the layer is active. Handle transparent padding, overlap and occlusion. Highlight selection and frame it without losing the previous camera state. Test visibility across existing world scales and modes.

The complete HTML index is required and remains usable without WebGL. Use native buttons in a semantic list or table, proper headers, visible focus, announced selection and responsive detail disclosure. Keyboard and screen-reader selection must reach the same entries as the 3D scene. Provenance indicators cannot rely on color or hover alone.

## Calculator contract

| Field | Requirement |
| --- | --- |
| Inputs | Date/time, coordinates, IANA timezone or explicit historical UTC offset; manual fallback. |
| Time normalization | Resolve one UTC instant, validating DST gaps and overlaps; display the resolved offset. |
| Calculation | Selected @node-jhora/core release, explicitly configured Lahiri, geocentric lunar position. |
| Main outputs | Sanskrit name, mapped Tibetan name, pada, Vimshottari lord, Moon sidereal longitude. |
| Optional outputs | Tithi, yoga, karaṇa and vara after verifying definitions and day-boundary semantics. |
| Failure states | Invalid input, unresolved local time, missing provider permission, initialization/asset/network failures. |
| Scene connection | Optional identity-based “Show in world”; no position-to-index shortcut. |

Maintain a separate 27-entry calculator sequence and an explicit correspondence map to the Tibetan catalogue. Abhijit is a catalogue entry, not an invented additional equal sector. Store Indian Vimshottari lord separately from the Tibetan seven-ruler field. Use stable IDs; never infer identity from the shared array position.

Inspect the actual selected package version and result schema. A nested pada field was not confirmed by the reviewed guide. If necessary, derive the quarter from verified sidereal lunar longitude and test exact boundaries. Never subtract ayanamsa twice. Keep engine version, configuration and output normalization in a small provider adapter.

The package's browser execution, WASM loading and ephemeris delivery must be verified with this app. Prefer client-side processing if supported. If it needs a server, prepare the smallest adapter and explain that deployment requirement; do not quietly add paid services. Do not transmit or persist birth inputs beyond what the chosen architecture requires.

## Provider status and dependencies

The [revision review](LUNAR-MANSIONS-REVISION-REVIEW.md) records that npm showed 3.1.0, defaults differ between public documentation pages, and the current proprietary license requires a written grant for use, including personal use. No grant has been established in this task. Check existing project permission before provider execution/integration. Complete independent catalogue/UI work while any grant is pending; unavailable calculations must remain clearly unavailable, with no fabricated result.

A direct Swiss Ephemeris fallback has its own license requirements. A future Tibetan calendar calculator requires a full tradition-specific calculation model, epochs, date rules and validation; changing an ayanamsa or inserting Abhijit does not establish White Beryl equivalence.

## Performance and lifecycle

Hide and skip work on routine toggles; cache the small glyph set. Dispose owned assets on teardown or explicit eviction. Avoid per-frame texture changes. Shared atlases do not automatically batch independent sprites; defer batching until measured. Choose mipmaps/filters based on actual minification quality. Compressed transfer size and decoded GPU memory are separate budgets.

Respect existing pause and reduced-motion settings. Measure the feature's added draw calls, frame time, memory and payload before introducing a 30 FPS mobile option. Test on a physical mid-range phone when available, and report device identity and results. Browser emulation is a separate check.

## Delivery and acceptance

1. Inspect current scene/UI architecture and the audited source data; confirm provider release, permission and viable deployment environment.
2. Build the 28-entry catalogue, custom sprite set, remembered toggle, selections, detail views and required accessible index.
3. Build the calculator form and provider interface; integrate the authorized provider with explicit Lahiri configuration and catalogue-ID mapping.
4. Verify the complete flows, mobile presentation, Tibetan text, hidden-layer cost and offline catalogue. State separately whether calculation works offline.
5. Run appropriate existing regression checks and focused calculator tests: independent Lahiri reference fixtures, 0°/360° wrap, mansion/pada boundaries, UTC-equivalent inputs, Poland DST ambiguity/gap, documented historical offset change, manual locations and failure recovery.

Data verification includes 28 unique catalogue IDs, correct Tibetan order, all glyph assets, valid provenance and separate associations. Preserve existing saved games, mandala numbering and unrelated tours. Physical-device and provider checks must be reported as performed, unavailable or pending—not assumed.

This revision updates documentation only. Runtime implementation, image assets and the provider smoke test belong to the Claude implementation task.
