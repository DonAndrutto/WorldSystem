# Prompt for Claude: Tibetan mansion sprites and a Lahiri calculator

Continue your existing WorldSystem work and implement the revised lunar-mansion feature. The current direction is **28 distinct 2D sprites/billboards inside the existing 3D world**, plus a separate **Indian Jyotiṣa calculator using @node-jhora/core with explicit Lahiri ayanamsa**. This replaces my earlier request for volumetric sculptures. Inspect your actual current checkout and follow its architecture and visual language.

## Read the source material

Read `docs/WHITE-BERYL-LUNAR-MANSIONS.md`, `docs/WHITE-BERYL-SOURCE-EXTRACTS.txt`, `docs/LUNAR-MANSIONS-PLAN.md` and `docs/LUNAR-MANSIONS-REVISION-REVIEW.md`. If these are not in your checkout, use the supplied copies. The audit governs historical content; the updated plan and review govern implementation.

Use Sangye Gyatso's White Beryl as the Tibetan catalogue source. Prefer Mipham's separately attributed clarifications where relevant, honoring my Nyingma preference. Do not invent an alternative Nyingma catalogue. Present all 28 naturally; keep the paired computational count in expandable source notes.

## Optional sprite layer

Add a layer control named “28 Lunar Mansions”, off by default with a remembered preference. Deliver the complete set of 28 selectable, camera-facing sprites. Use THREE.Sprite and SpriteMaterial with individual transparent textures initially; 128–256 px is a sensible starting size. Choose WebP or PNG based on actual visual quality and payload. Atlas work is optional and should follow profiling.

Create a coherent custom icon set based on the audited Tibetan forms: consistent line weight, monochrome or restrained two-tone treatment, clear silhouettes and transparent backgrounds. Use a subtle halo only where it improves readability. Preserve the symbolic vulva form for bra nye in a restrained treatment. Follow the app's existing art and provenance conventions.

Use the audit's full catalogue and Tibetan descriptive sequence. In particular:

- gro bzhin/Śravaṇa precedes byi bzhin/Abhijit.
- Use mon dre as the source spelling, with mon gre as an alias where useful.
- lha mtshams has an elephant form; byi bzhin an ox head.
- nam gru/Revatī is a boat with 32 stars. Counts may inform subtle details or the expanded view; tiny sprites need not display every star legibly.
- Keep four-element, five-element, elemental direction, White Beryl planetary ruler and associated deity as separate fields.
- For snar ma, skag, nag pa and khrums smad, retain the audit's secondary-supported forms and provenance. Add a small accessible “Secondary source” indication in their entries/index. Keep sa ga and rgyal's local reading notes equally precise and discreet.

Place the sprites in a horizontal ring near the existing celestial plane, with enough separation from the luminaries. Start from the source's directional groups: six at each cardinal grouping and one at each intercardinal point, including bra nye in the northeast. Distribute within groups for readability. If that is too crowded, use an evenly spaced ring and retain directions in the entries. Identify the arrangement briefly as illustrative. Use the world's established directions consistently.

Sprites face the camera, so verify selection, occlusion and transparent margins at several viewing angles. On selection, highlight the sprite, frame it appropriately and open the existing detail panel. Provide a clear return action that restores the prior camera state.

## Required accessible index

Deliver a parallel semantic HTML list or table containing all 28 entries. Use native buttons for selection, proper headings, visible focus and an announced selected state. Mouse, touch, keyboard and screen-reader navigation must open the same entries. Keep this usable independently of the WebGL scene and make it responsive on phones.

Include Tibetan and Sanskrit names, source form and the separately labeled associations. Use progressive disclosure for a dense table on narrow screens. Verify Tibetan rendering, diacritics and existing English/Polish localization. Provenance must be understandable without color or mouse hover.

## Separate Lahiri calculator

Label the feature **“Indian Jyotiṣa calculation · Lahiri ayanamsa.”** A short information note should explain that the White Beryl catalogue follows Tibetan sources. Keep the interface readable and avoid repeated caveats.

Inputs: date, time, latitude, longitude, and an IANA timezone or explicit UTC offset. Support manual location/offset entry without depending on the package's city CSV. Resolve to one UTC instant; handle ambiguous and nonexistent local times explicitly. Do not silently substitute noon, the browser's timezone or a guessed historical offset.

Outputs: Sanskrit nakṣatra name, corresponding Tibetan catalogue name, pada 1–4, **Vimshottari nakṣatra lord**, and Moon sidereal longitude. Keep this lord separate from the Tibetan catalogue's planetary ruler. Tithi, yoga, karaṇa and vara can appear as secondary details after their output and day-boundary semantics are verified.

Use the calculator's standard 27-sector Indian sequence and map results to catalogue IDs. Keep Abhijit present in the 28-entry catalogue without forcing it into the calculator's ordinary sector sequence or inventing a pada/lord. A “Show in world” action may select the corresponding sprite; the ring's illustrative spacing must not be used as calculator geometry.

Use an explicit geocentric lunar-position convention. Configure **Lahiri explicitly**, verify the selected release's option names and ensure no unintended default or override selects True Chitrapaksha. Avoid applying an ayanamsa correction twice. Inspect the actual result types before assuming the structure of panchanga.nakshatra or a nested pada. If needed, derive the sector and quarter from verified sidereal lunar longitude with boundary tests.

## Provider integration

The revision review found version 3.1.0 on npm, differing documentation about defaults, and a source-available license requiring permission even for personal use. Verify and pin the release you actually use. Check whether the project already has the required written grant before executing or integrating it. If permission is absent, finish the independent sprite layer, calculator UI and provider interface, make unavailable calculation clear, and report exactly what provider integration remains. Do not claim mocked results are real or assume a free/community license. Do not purchase a license or contact anyone on my behalf as part of this coding task.

Verify browser compatibility and WASM/ephemeris asset loading with the app's actual deployment. Do not assume a Node.js package can run in a browser worker unchanged. If a server adapter is required, prepare its concrete design and explain the hosting implication before provisioning anything. Direct Swiss Ephemeris is not automatically a license-free replacement; do not silently change providers.

## Performance and verification

Reuse existing controls, persistence, reading panels, scene lifecycle and offline asset handling. Hide the sprite group and skip its animation/picking work when disabled; retain small cached assets for quick toggling. Dispose owned resources at teardown or deliberate eviction, without destroying shared resources. Avoid per-frame texture uploads. Respect reduced motion and pause controls.

Measure the incremental frame time, draw calls, memory and download cost. Do not assume an atlas automatically batches sprites, a 512 px texture crashes phones, or a fixed WebP saving. Use a 30 FPS mobile option only if measurements justify it. Test a physical mid-range phone if available and distinguish that from emulation.

Verify all 28 unique sprites, sequence, selection paths, remembered visibility, return navigation, source associations, text rendering and offline catalogue access. Test calculator UTC equivalence, DST gaps/overlaps including Poland, a documented historical timezone change, manual coordinates, invalid inputs, initialization failure and the 0°/360°, nakṣatra and pada boundaries. Compare real calculations against independently obtained Lahiri reference fixtures, recording conventions and tolerances. Check existing modes, games, mandala numbering and tours for regressions.

Deliver the complete working revised feature to the extent allowed by the provider's actual availability and permission. Report implemented behavior, verification results and specific remaining dependencies honestly.
