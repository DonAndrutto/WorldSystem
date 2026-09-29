# Review of the sprite and Lahiri calculator revision

29 September 2026. The owner's supplied revision supersedes the earlier volumetric-model requirement and brings a separate Indian Jyotiṣa calculator into scope. This review checks the handoff's technical claims; it does not change the White Beryl textual findings. No package has been installed or executed, and no runtime implementation has been made in this documentation pass.

## Accepted direction

All 28 White Beryl mansions become distinct transparent 2D glyphs displayed as camera-facing sprites in the existing 3D world. The layer is optional, initially off, with remembered preference. A complete accessible HTML index is required. The calculator uses the selected @node-jhora/core provider with explicit Lahiri configuration, and is identified as Indian Jyotiṣa. Tibetan catalogue associations remain source-specific.

## Package verification

The [npm listing](https://www.npmjs.com/package/%40node-jhora/core) displayed **3.1.0**, not the revision's 2.1.0, when checked. It documents an ESM package, the static calculate facade and panchanga.nakshatra. Pin and inspect the actual chosen release during implementation. Do not treat a latest listing as a tested dependency.

The listing reports a default ayanamsa mode of **27, True Chitrapaksha**. The repository's older-looking [core guide](https://github.com/HariEshwar-J-A/node-jhora/blob/main/docs/CORE.md) instead describes ayanamsaOrder and Lahiri code 1. This documentation mismatch makes an explicit release-specific configuration and fixture check necessary. Retain Lahiri as the user's choice; do not rely on a default or conflate Lahiri with True Chitrapaksha.

The public quick-start supports NodeJHora.calculate(date, location, 'Lahiri'), but the inspected guide does not specify a nested pada field. Inspect the selected release's types and runtime result before referencing one. Moon sidereal longitude is documented among planet results; a tested adapter can derive the 27-sector identity and quarter if necessary. Never subtract ayanamsa a second time from a sidereal longitude.

The [current repository license](https://github.com/HariEshwar-J-A/node-jhora/blob/main/LICENSE) permits inspection but requires a commercial license for execution/use, including personal use. A free/community grant was not established. Record any existing written permission before integrating or executing the provider; otherwise complete the independent sprite, catalogue, form and adapter-interface work and identify the provider as pending. This review does not contact the author or purchase a license.

[Swiss Ephemeris itself](https://github.com/aloistr/swisseph/blob/master/LICENSE) has AGPL/professional licensing alternatives. Direct use is not an automatic licensing escape. A fallback needs its own compatibility and permission assessment.

## Integration details to correct

The project is currently a browser application with vendored Three.js imports; the inspected checkout has no root package.json. Node-Jhora markets itself for Node.js and its engine uses WASM. Browser compatibility, WASM/ephemeris loading, any Node-only imports and offline deployment remain untested. A worker cannot make Node-only modules browser compatible by itself. Verify an authorized release with the app's real environment; if necessary, describe the smallest server adapter and its hosting implications before adding external infrastructure.

The calculator uses its own 27-member Indian computational order and an explicit ID mapping into the Tibetan 28-entry catalogue. Abhijit remains available in the catalogue; do not invent a twenty-eighth equal sector, pada or Vimshottari lord for it. An optional result-to-sprite link selects the matching identity without rearranging the traditional gallery or presenting its ring position as measured longitude.

Use an explicit geocentric lunar-position convention for this feature. Keep the calculator's Vimshottari lord in a separate field from White Beryl's seven-ruler assignment. Optional panchanga details need verified semantics, particularly civil weekday versus sunrise-based vara.

Convert local date/time plus an IANA timezone or explicit historical offset into one UTC instant. Do not silently use the browser's timezone, accept a nonexistent DST time or arbitrarily choose between repeated times. Manual Julian-day computation is unnecessary merely to construct a UTC Date.

## Rendering corrections

Individual transparent textures are a reasonable simple first implementation. The installed Three.js 0.184.0 sprite shader applies mapTransform through its UV chunks, and the [texture documentation](https://threejs.org/manual/pages/textures.html) documents offset/repeat. Atlas slicing therefore does not inherently require a custom shader. Independent atlas regions need independent texture transforms; changing one shared Texture changes every sprite using it.

A shared atlas alone does not batch independent sprites into one draw call. Batching/instancing is a separate optimization. A raycaster needs an array of objects, not the revision's mansionSprites dictionary directly. Restrict picking to the enabled layer and handle transparent margins deliberately.

Treat 128–256 px assets as starting budgets, not universal hardware limits. There is no established blanket 512 px crash threshold here. WebP can reduce transfer size but ordinary decoded texture memory depends chiefly on dimensions and format. Compare exported files and legibility; do not promise a fixed compression percentage. Choose mipmap/filter settings after checking minification at actual scene scales.

Hide the group and skip its work on routine toggles, retaining its modest cached assets for fast reactivation. Dispose owned resources on teardown or deliberate memory eviction. Do not dispose shared geometry or textures still used elsewhere. Measure frame time, draw calls and memory; apply a 30 FPS mobile option only if testing justifies it, rather than forcing the whole app to that rate.

Use native buttons within a semantic HTML list/table, with focus and selection state, rather than merely adding tabindex to rows. Show secondary provenance through a small text label that also works with keyboard and screen readers, not color alone. Physical-device performance testing should be reported honestly; emulation is not physical-device validation.
