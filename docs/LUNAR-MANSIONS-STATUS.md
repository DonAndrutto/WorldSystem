# Lunar mansions: implementation status

29 September 2026, revised the same day for the owner's corrections and the change of engine. What the sprite layer and calculator revision delivered in this
repository, how it was checked, and what remains. The requirements are in
[the plan](LUNAR-MANSIONS-PLAN.md) and [the revision review](LUNAR-MANSIONS-REVISION-REVIEW.md);
the content authority is [the White Beryl audit](WHITE-BERYL-LUNAR-MANSIONS.md).

## Provider

The first provider named, `@node-jhora/core`, was never integrated: no written
grant for it exists in this project, and its licence requires one. On 29
September 2026 the owner chose instead **`@fusionstrings/panchangam`**, and it
is now integrated (Phase 3, below).

**Licensing — for the owner's decision before this is merged and served.** The
package's own code is declared MIT, but no licence file is published with it or
kept in its repository. Its WebAssembly statically contains the Swiss
Ephemeris 2.10.03 through the Rust crate `swiss-eph` 0.2.1, which is licensed
**AGPL-3.0**, as the Swiss Ephemeris is under its free licence (the alternative
is Astrodienst's paid Swiss Ephemeris Professional Licence). So the binary the
page serves is AGPL-covered whatever the package's label says. Serving it from
a public site means meeting the AGPL: its licence text and notices are
vendored beside it (`vendor/panchangam@0.2.1/NOTICE.md`,
`LICENSE-AGPL-3.0.txt`), and the corresponding sources are public
(fusionstrings/panchangam, fusionstrings/swiss-eph, the Swiss Ephemeris). Whether
the rest of WorldSystem then has to be offered under the AGPL, or whether
Astrodienst's professional licence is wanted instead, is the owner's call and
is not settled here. This repository has no licence file of its own.

## Phase 1 — catalogue and sprite layer: implemented

- `lunar-mansions.js`: 28 frozen records with stable ids (`lm_tha_skar` …
  `lm_nam_gru`) in the audit's Tibetan order (gro bzhin before byi bzhin; mon dre,
  with mon gre as alias; lha mtshams an elephant, byi bzhin an ox head; nam gru a
  boat of 32). Separate fields for Tibetan (script and Wylie), Sanskrit
  concordance, order, readable star count and any secondary count, textual form
  and its Tibetan phrase, four-element, five-element, elemental direction, White
  Beryl's seven-ruler assignment, the deity named in the passage (with a reading
  status), line and page, and provenance (`primary` / `secondary`). The four lost
  openings (snar ma, skag, nag pa, khrums smad) are `secondary`.
- 28 glyphs (`assets/mansions/`, provenance in [ARTWORK.md](../ARTWORK.md)), a
  dashed ring marking the secondary four.
- `mansion-layer.js`: `THREE.Sprite` + `SpriteMaterial`, one texture each, on a
  ring at 1.14 × the iron wall's radius, just above the luminaries' plane.
  Equal places in catalogue order reproduce every source direction exactly (six
  per cardinal group, one per intermediate point, bra nye northeast), so the
  crowded-fallback was not needed. The index calls it illustrative.
- Selection from the glyph, the mansion index, the main index, the entry's
  stepper or a calculator result is one identity. It highlights, frames the glyph
  from outside the ring, opens the shared entry panel, and offers **Return to
  previous view**. Layer visibility and selected id are remembered
  (`ws-mansions`, `ws-mansion`) across panel close and both language switches.
- The mansion index (`mansion-ui.js`): an ordered list of 28, each a heading with a
  native button, `aria-current` on the selection, a polite live region, visible
  focus, associations in `<details>` (open on wide screens, folded on phones),
  “Secondary source” in words. Built by its own module ahead of the page script,
  so it works without WebGL.
- A deliberate 28-stop tour of the catalogue (`presentation-tours.js`); the
  Explorer tour is unchanged at 104 stops.

## Phase 2 — calculator shell: implemented

Labelled “Indian Jyotiṣa calculation · Lahiri ayanamsa” with one folded note on
the separation from White Beryl. Date, time (seconds optional), latitude and
longitude typed by hand (no city list), and an IANA zone or an explicit offset.
The device's zone is offered as a button, never assumed. One UTC instant or an
explicit refusal: a time in a DST gap is rejected with the change named; a time
in an overlap asks which of the two instants is meant. The resolved offset is
shown. Output fields: nakṣatra, Tibetan catalogue entry, pada, Vimshottari lord,
Moon's sidereal longitude, the nakṣatra's start and end and the pada's end,
then the udaya pañcāṅga (sunrise, tithi and its end, yoga, karaṇa) and the
vāra, plus “Show in world” by id. Inputs are neither stored nor sent.

The calculator keeps its own 27-sector order and Vimshottari lords, linked to
the catalogue by an explicit id table; Abhijit has no sector. `sectorOf()`
derives sector and pada from a sidereal longitude in whole milli-arcseconds and
applies no ayanamsa. `resultFromMoon()` passes the engine's longitude through
unchanged.

## Phase 3 — provider: performed

`@fusionstrings/panchangam` **0.2.1**, the browser build published on JSR
(`jsr:@fusionstrings/panchangam@0.2.1/browser`), vendored in
`vendor/panchangam@0.2.1/` and pinned by sha384 in the page's import map
(`node scripts/vendor-panchangam.cjs` re-fetches and verifies it). The npm
release, 0.2.0, is CommonJS that reads its WebAssembly with Node's `fs` and does
not run in a browser; the JSR browser build carries the WebAssembly inline and
does. It is fetched only when a calculation is first asked for (about 850 KB),
is compiled on the main thread (Chromium allows it), is held by the offline
shelf, and calculates with no network.

`jyotisha-engine.js` is the whole adapter. Configuration, explicit:

- **Lahiri**, the engine's mode 1; mode 27, True Chitrapaksha, is never passed.
  `init()` refuses an engine whose Lahiri value is not distinct from True
  Chitrapaksha's or is not the expected size.
- **Geocentric**, from `p_calc_ut` (`swe_calc_ut`), time in **UT**.
- **Nirayana = mean-equinox longitude − mean ayanamsa, once** (equal to the
  apparent longitude less the true ayanamsa, the Indian Astronomical
  Ephemeris's reckoning).
- Nakṣatra and pada are derived from that longitude; their start and end, and
  the pada's end, are found by root-finding on the Moon's motion. The
  Vimshottari lord is the calculator's own, never White Beryl's ruler.
- The pañcāṅga is taken at the **local sunrise of the date entered** (udaya):
  tithi and its end, yoga, karaṇa. The vāra is the one of the moment entered,
  running sunrise to sunrise. Where the Sun does not rise, none is given.

Defects found in the engine, and routed around rather than inherited:

1. **ΔT.** `calculate_nakshatra`, `calculate_planets`, `calculate_tithi`,
   `calculate_yoga`, their start/end finders and `calculate_daily_panchang` pass
   the Julian day to `swe_calc`, which reads it as Terrestrial Time. Handed UT,
   they place the Moon ΔT early — measured at **69.0 s** in 2025, about 35″ —
   which moves a boundary by about a minute. The adapter uses only
   `p_calc_ut`.
2. **The day of the daily pañcāṅga.** `calculate_daily_panchang` looks for
   sunrise from 0h UTC of the date it is given, so east of about UTC+6 it
   returns the next local day: for **Delhi on 1 July 2025 it gives the sunrise
   of 2 July** (Saptamī instead of that day's Ṣaṣṭhī). Where the Sun does not
   rise it substitutes 06:00 UT. The adapter looks for the sunrise inside the
   local civil day and refuses the stand-in.
3. **A wrong flag constant.** The package's `Constants.SEFLG_NONUT` is 1024,
   which is Swiss Ephemeris's `SEFLG_NOABERR`; nutation is 64. The adapter uses
   the Swiss Ephemeris values.
4. **No ephemeris files.** Despite the `embedded-ephe` feature, `SEFLG_SWIEPH`
   and `SEFLG_MOSEPH` give identical results: the engine runs on the Moshier
   theory, good to a few arcseconds — ample for nakṣatra work, but not the JPL
   precision the package's README suggests.

## Verification performed

| Check | Result |
| --- | --- |
| `tests/lunar-mansions.mjs` | Pass. The catalogue is read against the audit's own tables (order, names, Sanskrit, readable counts, both element lists, line/page, rulers, directions), plus the brief's specific points, frozen records, 28 WebP glyphs. |
| `tests/mansion-layer.mjs` (real three.js) | Pass. Ring directions; hidden layer fetches nothing and is never picked; retry fetches only the failure; 214 aims from 16 angles, each missed aim won by a nearer glyph, never a farther one; transparent corners pass through; dispose frees only owned resources. |
| `tests/jyotisha.mjs` | Pass. 0°/360° wrap, all 26 sector boundaries and pada boundaries to 0.1″; Poland 30 Mar 2025 02:30 nonexistent and 26 Oct 2025 02:30 ambiguous; Kathmandu +05:30 → +05:45 on 1 Jan 1986; Warsaw +01:24 → CET in 1915; five UTC-equivalent spellings; invalid inputs; manual coordinates; tithi, karaṇa and yoga definitions; local day bounds across DST. ICU 78.2, tz 2025c. |
| `tests/jyotisha-engine.mjs` (the vendored engine) | Pass. Against an independent reference (Meeus ch. 47 and 25, the Lahiri definition 23°15′00.658″ at 1956 Mar 21 with IAU 1976 precession): Moon nirayana within 13.4″ over 240 instants 1961–2050 (median 2.3″), tolerance 20″, every nakṣatra and pada identical; Lahiri at least 41″ from True Chitrapaksha over that span; boundaries to the second including Revatī → Aśvinī across 0°/360°; UTC-equivalent inputs; Poland's DST overlap and gap; Kathmandu 1986; sunrise within the local day for Delhi, Sydney and Tromsø (none); load failure, retry, wrong version and wrong ayanamsa refused; the engine's ΔT offset measured. |
| Existing suites | All pass, including `mandala-regression` with new assertions (Explorer tour unchanged, 28 native buttons, layer off and nothing fetched at start, tour restores the setting) and `offline` after regenerating `sw.js`. |
| Browser (Chromium, SwiftShader) | Layer toggle; framing and return; Tibetan with a Tibetan font installed; tapping each on-screen glyph at 4 angles (52 of 54 selected as aimed, 2 correctly behind Meru, 0 wrong); 320 and 390 px phone layouts; keyboard, focus and announcement; Polish in place and English reload with state kept; offline reload with all 28 glyphs from cache; a failed glyph download shown and recovered; index and calculator working with WebGL disabled. |

Measured at the opening view (Chromium, SwiftShader, so emulation only):

| | Layer off | Layer on |
| --- | --- | --- |
| Draw calls, 1280 × 800 | 331 | 359 (+28) |
| Draw calls, 390 × 844 | 604 | 626 (+22; the rest culled) |
| Triangles | — | +2 per glyph drawn |
| Textures | 11 | +28, kept while hidden |
| JS heap | — | +140–220 KB |
| GPU memory (estimate) | — | ≈ 9.8 MB for 28 × 256² RGBA with mipmaps |
| Download | — | 148 KB of glyphs on first show; 70 KB of new modules (24 KB gzipped) |

Frame-time medians were about 2.5–4 ms off and 2.7–7 ms on, but software
rasterisation gives p90 spikes up to 800 ms in either state. That figure is not
a performance measurement. The 30 FPS option was not introduced; nothing
measured here justifies it. Hidden, the layer adds no draw calls and no picking.

## Not verified
- **The Wikipedia *List of Nakshatras***, which the owner asked the catalogue's
  terminology and descriptions to follow, could not be read: `en.wikipedia.org`
  (and its mirrors) are denied by this environment's network policy. Only the
  two corrections the owner supplied directly (sa ga, rgyal) are applied. The
  rest waits for access to the page; nothing was filled in from memory.

- **No physical phone was available**; every mobile figure above is emulation.
- Real-GPU frame time on any device.
- Tibetan rendering depends on a system Tibetan font (the page ships none, as
  before); it was checked with Tibetan Machine Uni installed in the test browser.
- The Polish strings for this feature are drafts for the translator's review
  ([README.pl.md](../README.pl.md)).

## Source-image checks still needed

- **sa ga** and **rgyal**: resolved by the owner's corrections — ར་མགོའི་དབྱིབས,
  goat head; རྒྱལ་ནི་སྐར་གསུམ་རིལ་བའི་དབྱིབས, three stars, a rounded form.
- **The four lost openings**: snar ma (p. 315), skag (p. 317), nag pa (p. 320),
  khrums smad (p. 327): form and count from the secondary table. Also the damaged
  openings of gre (p. 319) and mon gru (p. 326).
- **Deity clauses** marked uncertain or damaged: tha skar, gre, me bzhi, nag pa,
  sa ga, lha mtshams.
- **Star-node geometry**: the nodes give counts only; illustrations would be
  needed before drawing any arrangement.
- **Deity iconography**: no deity is portrayed; the passages name deities without
  prescribing their forms.
