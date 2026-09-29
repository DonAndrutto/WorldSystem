# Prompt for Claude: Replace the Nakshatra calculator engine with astronomy-engine

## Context and decision

WorldSystem currently depends on `@fusionstrings/panchangam` (0.2.1) for the
Indian Jyotisha calculator. That package is labelled MIT but statically contains
the Swiss Ephemeris via the `swiss-eph` crate, which is AGPL-3.0 or Astrodienst's
paid professional licence. Serving the calculator publicly would therefore
trigger the AGPL's network clause and force WorldSystem itself under the AGPL.

The owner has decided to remove that dependency entirely and implement the
calculator on `astronomy-engine` (MIT). This keeps WorldSystem's licence
unchanged and removes the copyleft obligation.

This task replaces the calculator engine only. Do not touch the White Beryl
sprite layer, the 28-entry catalogue, the accessible index, the layer toggle,
or any Phase 1 artefact. The calculator remains a separate, clearly labelled
feature: "Indian Jyotisha calculation · Lahiri ayanamsa". It is not White
Beryl–authoritative and must not be presented as such.

## First actions (before writing any code)

1. Read, in full:
   - `docs/LUNAR-MANSIONS-PLAN.md`
   - `docs/WHITE-BERYL-LUNAR-MANSIONS.md` (for the separation-of-systems rule)
   - `docs/CLAUDE-LUNAR-MANSIONS-PROMPT.md` (for the calculator UI shell contract)
   If any file is missing, stop and report which one.

2. Inspect the current checkout. Identify:
   - every import of `@fusionstrings/panchangam` and `swiss-eph`;
   - the calculator UI shell built in Phase 2 (form, inputs, output structure);
   - the provider adapter, if one exists;
   - the service-worker asset manifest (`scripts/build-sw.cjs`) and any vendor
     directory holding `@fusionstrings/panchangam` artefacts;
   - any test fixtures or reference values already recorded for the calculator.

3. Confirm the licensing status of `astronomy-engine` at the version you intend
   to pin. Report the exact version and its licence. Do not proceed if the
   licence is not MIT or a permissive equivalent.

4. Do not modify anything until steps 1–3 are reported.

## Phase 1 — Removal of the AGPL dependency

Remove `@fusionstrings/panchangam` and `swiss-eph` from `package.json` and from
the lockfile. Remove the vendored copy under `vendor/panchangam@0.2.1/`. Remove
any service-worker entries that reference those assets. Regenerate the offline
manifest with `scripts/build-sw.cjs`. Confirm the application still builds and
that no import of the removed packages remains.

If the calculator UI shell currently imports types or helpers from the removed
package, replace those imports with local type definitions. Do not leave a
transitive dependency on the removed package through a type-only import.

### Phase 1 verification

- `grep` for `@fusionstrings/panchangam`, `swiss-eph`, and `panchangam@` returns
  no references in source, package files, lockfile, vendor directory, or
  service-worker manifest.
- Build succeeds.
- No AGPL-licensed artefact remains in the served bundle. Verify by inspecting
  the build output for the Swiss Ephemeris WASM payload or its identifiers.

## Phase 2 — The new calculator engine

Add `astronomy-engine` as a dependency and pin the exact version. Implement a
single module (suggested: `src/astro/nakshatra.ts`) that exposes one function:

    calculateNakshatra(date: Date, latitude: number, longitude: number): NakshatraResult

The function must return at least:
- Sanskrit nakshatra name (IAST and, if the project already carries it, the
  Devanagari form);
- Pada, 1–4;
- Vimshottari nakshatra lord;
- Moon sidereal longitude in degrees;
- The ayanamsa value actually used, in degrees;
- The UTC instant that was resolved from the input.

Latitude and longitude are accepted for API symmetry and future ascendant work,
but the Nakshatra result depends only on the Moon's geocentric sidereal
longitude and the UTC instant. Do not introduce location-dependent behaviour
that the source does not support.

### Ayanamsa

Implement Lahiri (Chitrapaksha) ayanamsa. The principled definition is:
Lahiri ayanamsa is the offset that places Spica (Chitra) at exactly 180°
sidereal longitude. Two acceptable implementations, in order of preference:

1. **Spica-anchored.** Use `astronomy-engine`'s star support to obtain Spica's
   apparent geocentric tropical ecliptic longitude for the instant. Ayanamsa =
   Spica tropical longitude − 180°. This is the definitional method and the
   most faithful to the name "Chitrapaksha".

2. **Polynomial fallback.** Use a published Lahiri ayanamsa polynomial (e.g.
   from the Indian Calendar Reform Committee or a peer-reviewed source). Record
   the source of the polynomial in a comment and in the module header. Verify
   the polynomial against the Spica-anchored method at several epochs and report
   the residual.

Whichever method you implement, verify the API names against the installed
`astronomy-engine` version. Do not assume function names from memory. If the
star functions are not available in the pinned version, use the polynomial and
say so explicitly in the reporting.

Do not silently switch ayanamsa conventions. Do not expose True Chitrapaksha,
Raman, or KP ayanamsa in this release. The calculator is Lahiri-only and the UI
label must say so.

### Nakshatra arithmetic

Given the Moon's sidereal longitude `λ` in degrees, normalised to [0, 360):

- Nakshatra span = 360 / 27 = 13°20′ = 13.333…°
- Pada span = 360 / 108 = 3°20′ = 3.333…°
- Nakshatra index (0-based) = floor(λ / 13.333…)
- Pada (1-based) = floor((λ mod 13.333…) / 3.333…) + 1

Clamp the index to 0–26. Handle the 360° wrap explicitly: a longitude of
exactly 360° must resolve to index 0, not 27.

The Vimshottari lord sequence repeats every 9 nakshatras:

    Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury

Verify the sequence against a published table before committing. Do not
substitute the Tibetan catalogue's planetary ruler for the Vimshottari lord.
They are different fields and must remain separate in the output type and in
the UI.

### Timezone handling

Accept a UTC `Date` and, in the UI layer, resolve local date/time plus IANA
timezone or explicit UTC offset to a single UTC instant. Handle DST gaps and
overlaps explicitly: do not silently substitute noon, the browser timezone, or
a guessed historical offset. If the resolution is ambiguous or invalid, surface
the problem to the user rather than guessing.

If you need historical timezone data, use `Intl.DateTimeFormat` with the IANA
zone where it is sufficient, or a small, permissively licensed timezone library
that does not pull in AGPL code. Do not add a dependency without reporting its
licence.

### Provider adapter

Keep the engine behind a small adapter (suggested: `src/astro/provider.ts`) that
exports the `calculateNakshatra` signature above. The rest of the application
must depend only on the adapter, never on `astronomy-engine` directly. This
preserves the ability to swap engines later without touching the UI.

### Phase 2 verification

- `calculateNakshatra` returns correct values for at least three reference
  charts whose Nakshatra, Pada, and lord are independently known. Record the
  source of each reference value. Suggested references: one chart published by
  Drik Panchang, one by AstroSage, and one computed by hand from a known
  ephemeris. Report any disagreement and its magnitude.
- Boundary tests: a longitude just below and just above each Nakshatra and Pada
  boundary. Include exactly 0°, exactly 13.333…°, exactly 360°, and the wrap
  case.
- Ayanamsa test: the Spica-anchored and polynomial methods agree within a stated
  tolerance across at least three epochs (e.g. 1900, 2000, 2025).
- UTC-equivalence test: the same instant expressed with different local
  timezones resolves to the same Nakshatra.
- Poland DST test: a birth in Poland during a DST transition year. Include one
  ambiguous local time and one nonexistent local time. Report how each is
  handled.
- Historical offset test: a location whose UTC offset changed during the 20th
  century. Report the resolved offset and its source.
- Initialisation failure: simulate `astronomy-engine` failing to load and
  confirm the UI surfaces a clear error rather than a fabricated result.

## Phase 3 — UI integration

Wire the adapter into the existing calculator UI shell. The shell already
exists from Phase 2 of the earlier prompt; do not rebuild it. Update only what
is necessary:

- Replace any provider-specific type imports with the adapter's types.
- Keep the label "Indian Jyotiṣa calculation · Lahiri ayanamsa" intact.
- Keep the short information note explaining that the White Beryl catalogue is
  a separate, Tibetan-sourced system.
- Keep the "Show in world" action that selects the corresponding sprite, but do
  not use the ring's illustrative spacing as calculator geometry.
- Keep the output fields separate: Sanskrit nakshatra name, corresponding
  Tibetan catalogue name, pada, Vimshottari lord, Moon sidereal longitude. Do
  not merge the Vimshottari lord with the Tibetan catalogue's planetary ruler.

If the shell currently displays any field that the new engine cannot populate,
leave the field empty with an explicit "not available" state rather than
fabricating a value.

### Phase 3 verification

- Form validation for invalid dates, missing coordinates, malformed offsets.
- Keyboard-only navigation of the calculator form and output.
- Screen-reader announcement of the result.
- Layout at 320–390 px width.
- The White Beryl sprite layer, its accessible index, and its toggle are
  unaffected. Run the Phase 1 verification from
  `docs/CLAUDE-LUNAR-MANSIONS-PROMPT.md` and confirm no regression.
- Reduced-motion and pause controls continue to apply.

## Cross-cutting requirements

- Do not add any dependency whose licence is AGPL, GPL, or otherwise copyleft
  without reporting it first. `astronomy-engine` (MIT) is approved. Any other
  addition requires explicit approval.
- Do not vendor or copy Swiss Ephemeris code, data, or constants. If a
  polynomial is used, cite the published source, not a Swiss Ephemeris
  implementation.
- Register new served assets in `scripts/build-sw.cjs` and regenerate the
  offline manifest. Confirm the manifest no longer contains the removed
  panchangam artefacts.
- Dispose of any engine resources at teardown. Do not destroy shared resources.
- No per-frame work is added by the calculator. It runs on demand, not on the
  render loop.
- Document the ayanamsa method, the reference values used, and the residual
  between methods in the module header or a short `docs/NAKSHATRA-ENGINE.md`.

## Reporting

Finish with a concise account of:

1. What was removed, with the exact package names and versions.
2. What was added, with the exact package name and pinned version, and a
   confirmation of its licence.
3. Which ayanamsa method was implemented (Spica-anchored or polynomial), and
   the residual between them if both were tested.
4. The three reference charts used for verification, with their sources, the
   expected values, and the computed values.
5. Boundary, DST, historical-offset, and UTC-equivalence test results.
6. Any remaining reference-image or source checks, if any.
7. Confirmation that the White Beryl sprite layer was not modified and that its
   Phase 1 verification still passes.

Report the licensing status of every dependency touched. Do not assume. Do not
fabricate.

## Explicitly out of scope

- The 28-entry White Beryl catalogue.
- The 2D sprite layer and its placement.
- The accessible index.
- The layer toggle and persistence.
- Any 3D modelling work.
- Any change to the White Beryl source extracts or the audit.
- Any calculator feature beyond Nakshatra, Pada, Vimshottari lord, Moon
  sidereal longitude, and the optional Panchanga context already scoped in the
  earlier prompt.

If you believe an out-of-scope change is necessary, stop and report before
making it.