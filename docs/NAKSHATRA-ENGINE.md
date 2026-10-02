# The nakṣatra engine

29 September 2026. The Indian Jyotiṣa calculator ("Indian Jyotiṣa calculation ·
Lahiri ayanamsa") runs on **astronomy-engine 2.1.19** (MIT), in place of
`@fusionstrings/panchangam` 0.2.1, whose WebAssembly contained the AGPL-licensed
Swiss Ephemeris. This page records the method, the references it was checked
against, and the residuals. The calculator is a separate system from the White
Beryl catalogue and is not White Beryl–authoritative.

## Out of scope

- This calculator provides Indian/jyotiṣa-style nakṣatra timing via
  astronomy-engine; it is not a Tibetan White Beryl calendar engine.
- White Beryl chapter 33 interpretation (electional, natal, remedies and sbyor)
  is a separate data/UI layer. Calculator output is not White Beryl text.
- Latitude and longitude do not enter the core geocentric nakṣatra sector
  calculation. They are used for local sunrise and sunrise-based weekday
  calculations in the form's wider result.
- Catalogue, sprites, index, 3D mansion artwork and White Beryl extracts are
  outside the scope of this engine document.

## Dependencies

| Package | Version | Licence | Status |
| --- | --- | --- | --- |
| `astronomy-engine` | **2.1.19** (npm, `esm/astronomy.js`) | **MIT**, © 2019–2023 Don Cross; the licence text is at the head of the file | added: `vendor/astronomy-engine@2.1.19/`, pinned by sha384 in the import map, fetched on the first calculation, cached offline; no dependencies of its own |
| `@fusionstrings/panchangam` | 0.2.1 (JSR browser build) | declared MIT; contained Swiss Ephemeris 2.10.03 via `swiss-eph` 0.2.1, **AGPL-3.0** | **removed**: vendor directory, vendoring script, import-map pins, offline-shelf entries, tests |

The project has no `package.json` or lockfile; its libraries are vendored and
pinned in the import map. `node scripts/vendor-astronomy-engine.cjs` re-fetches
the pinned file from npm, checks that the package still declares MIT, and
checks the file against the pinned hash.

## The adapter

`jyotisha-engine.js` is the only module that imports the engine. It exports
`calculateNakshatra(date, latitude, longitude)`, which resolves to
`{ nakshatra (IAST), index, pada, vimshottariLord, catalogueId,
moonSiderealLongitude, ayanamsa, utc }`. The function is asynchronous because
the engine is fetched on first use. Latitude and longitude are accepted for
symmetry with a future ascendant and do not enter the result. The form also
uses `createEngine().calculate()`, which adds the nakṣatra's start and end, the
pada's end, and the pañcāṅga at the local sunrise of the date entered (tithi and
its end, yoga, karaṇa, and the vāra of the moment, from sunrise to sunrise).
The Devanagari forms are not given: the project did not already carry them.

The brief suggested `src/astro/nakshatra.ts` and `src/astro/provider.ts`. This
project has no build step and no TypeScript, so the provider is the one module
`jyotisha-engine.js` and the arithmetic stays in `jyotisha.js`.

## Method

- **The Moon**: `EclipticGeoMoon` — geocentric, on the true ecliptic and equinox
  of date. The engine's lunar theory follows the Improved Lunar Ephemeris
  (1954), via Montenbruck & Pfleger. **The Sun**, for the pañcāṅga:
  `SunPosition`, the same frame, apparent. **Sunrise**: `SearchRiseSet`, the
  upper limb with standard refraction, looked for within the local civil day
  and refused where there is none.
- **Time**: the UTC instant from the form. astronomy-engine converts it to TT
  with its own ΔT (Espenak & Meeus). For 2025 that is about 75 s against a true
  ~69 s, which moves the Moon by about 3″.
- **Ayanamsa: Lahiri, polynomial from its published definition.** The value is
  **23°15′00.658″ on 1956 March 21**, as adopted by the Calendar Reform Committee
  (Government of India, 1955) and used by the Indian Astronomical Ephemeris. It
  is carried to any date by the IAU 1976 general precession in longitude:
  p_A = 5029.0966″T + 1.11113″T² − 0.000006″T³ (Lieske et al. 1977, *A&A* 58,
  1–16). The 1956 figure is a true value. So the mean ayanamsa is that figure
  less the nutation of 1956 March 21 (16.81″), and the true ayanamsa of a date
  is the mean plus that date's nutation Δψ (from astronomy-engine's `e_tilt`).
- **Nirayana longitude** = true-ecliptic longitude − true Lahiri ayanamsa,
  subtracted once.
- **Sectors**: 13°20′ nakṣatras and 3°20′ padas, counted in whole
  milli-arcseconds so that a boundary is exact. 360° is Aśvinī 1. The
  Vimshottari lords run Ketu, Venus, Sun, Moon, Mars, Rāhu, Jupiter, Saturn,
  Mercury, three times, as the owner's published table gives them.

### Why not the Spica-anchored ayanamsa

The brief preferred defining the ayanamsa by putting Spica (Citrā) at exactly
180°. That is the definition of **True Chitrapaksha**, which the brief also
asks not to expose. It is not the Lahiri ayanamsa of the Indian Astronomical
Ephemeris, and so not of Drik Panchang or AstroSage. The two differ by a steady
**33–40″**:

| Epoch (21 Mar) | Spica-anchored − Lahiri |
| --- | --- |
| 1900 | −33.2″ |
| 1956 | −35.8″ |
| 2000 | −37.8″ |
| 2025 | −39.0″ |
| 2050 | −40.2″ |

Spica's position is ICRS J2000 (RA 13h25m11.579s, Dec −11°09′40.76″), with
Hipparcos proper motion, through astronomy-engine's `DefineStar`, apparent, on
the true ecliptic of date. The calculator uses Lahiri alone; the
Spica-anchored value (`spicaAyanamsa`) exists only for this comparison. Stated
tolerance: −45″ to −30″.

## Verification — `tests/jyotisha-engine.mjs`

**Reference charts.** Drik Panchang, AstroSage and every online ephemeris are
unreachable from this build environment, so none of their charts could be
fetched, and none is quoted from memory. The reference charts were instead
computed with the **Swiss Ephemeris 2.10.03** (through the removed package) in
this repository, immediately before its removal. Only the output numbers are
kept, in `tests/fixtures/swiss-ephemeris-reference.json`. The Swiss Ephemeris is
an independent ephemeris with an independent implementation of Lahiri
(SE_SIDM_LAHIRI):

| Chart | Swiss Ephemeris | astronomy-engine | Δ Moon |
| --- | --- | --- | --- |
| Delhi, 1 Jul 2025, 15:30 IST | Uttaraphalgunī 2, Sun — 150.051667° | Uttaraphalgunī 2, Sun | 2.1″ |
| Warsaw, 26 Oct 2025, 02:30 CET (later) | Jyeṣṭhā 4, Mercury — 238.122267° | Jyeṣṭhā 4, Mercury | 2.2″ |
| Kathmandu, 1 Jan 1986, 12:00 NPT | Pūrvaphalgunī 1, Venus — 134.850045° | Pūrvaphalgunī 1, Venus | −0.9″ |
| Kraków, 3 Mar 1961, 06:00 CET | Pūrvaphalgunī 4, Venus — 146.255805° | Pūrvaphalgunī 4, Venus | 1.6″ |

Across these charts:
- the Lahiri ayanamsa agrees within 0.16″;
- nakṣatra starts and ends agree within 5 s;
- sunrise agrees within 4 s;
- tithi, yoga and karaṇa at sunrise are identical.

The Revatī → Aśvinī crossing of 7 January 2025 falls at 12:20:01 UTC here and
at 12:20:05 in the Swiss Ephemeris.

**Independent theory.** Meeus, *Astronomical Algorithms*, ch. 47 (Moon) and 25
(Sun), in `tests/fixtures/meeus.mjs`. Over 240 instants 1961–2050 the Moon's
nirayana longitude agrees within 9.3″ (median 1.7″), and every nakṣatra and
pada is identical away from a boundary.

**Published table.** The owner's `docs/List_of_Nakshatras.docx` (from
Wikipedia's *List of Nakshatras*) is read by the test itself. All 27 Vimshottari
lords and all 27 sector starts agree.

**Boundaries.**
- The arithmetic is exact at 0°, 13°20′ and 360°; 360° resolves to index 0.
- Nakṣatra and pada changes fall within a second of the computed boundary.
- The wrap from Revatī 4 to Aśvinī 1 across 0°/360° is covered.

**Time zones.** These come from the browser's own IANA data (`Intl`); no library
is added. ICU 78.2 with tz 2025c was used in the test run.
- The same instant written four ways gives one result.
- Warsaw, 26 Oct 2025, 02:30 is **ambiguous**. The form asks for the earlier
  (00:30 UTC, UTC+02:00) or the later (01:30 UTC, UTC+01:00) instant.
- Warsaw, 30 Mar 2025, 02:30 **does not exist**. The form refuses it and names
  the change from UTC+01:00 to UTC+02:00.
- **Kathmandu** moved from +05:30 to +05:45 on 1 Jan 1986, and 1 Jan 1986 12:00
  resolves to UTC+05:45.
- **Warsaw** kept local mean time, UTC+01:24, until 1915.

**Failure.**
- A failed load is reported ("could not be loaded … calculate again") and can be
  retried.
- A browser remembers a failed import for the life of the page, so a retry
  fetches the same file with the pinned hash taken from the import map, and
  imports it from a blob. A tampered file served on retry is refused: this was
  checked in Chromium.
- A module that is not the engine is refused.
- No result is shown unless the engine produced it.

Checked in Chromium at 1280, 390 and 320 px:
- keyboard-only entry;
- the result announced through a polite status region;
- no sideways scroll;
- the engine not requested before the first calculation;
- "Show in world" selecting the catalogue entry by id, with the sprite layer's
  toggle and index unaffected.
