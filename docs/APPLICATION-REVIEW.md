# World System application review

Review date: 24 September 2026. Baseline: `main` at `e489c57`. The findings below describe that baseline unless a delivery status explicitly says otherwise. Source references use that revision so later edits do not move the evidence.

## Scope and result

The review covered all four modes, the shared navigation and camera controllers, game rules and persistence, English/Polish localization, artwork loading and presentation, keyboard/touch interaction, service-worker installation and updates, and the existing regression suites. It also compared the requested header patterns in Yontendzo, Ngondro, and KGK-Ngondro.

The underlying content and game engine are extensively checked. All ten existing suites passed against an isolated copy of the baseline. The most consequential gaps are in discovery, mobile reading, cross-mode presentation, and browser interaction. Several of those gaps survive the current tests because the tests deliberately substitute DOM layout, texture delivery, and GPU rendering.

This is a source and regression review, not a certification of every device, accessibility criterion, translation, or religious interpretation. Actual browser verification of the delivered changes is recorded separately by the implementation task.

## Reference applications

| Reference | Verified behavior | Application to World System |
| --- | --- | --- |
| [Yontendzo](https://github.com/DonAndrutto/Yontendzo/blob/main/index.html) | Header has a flag/code language menu and a heart with Donate. A toolbar `?` opens labels for controls actually visible on screen. Labels use connectors and collision-aware rows; content recedes while controls remain clear. Help is user initiated, dismissible, and restores focus. | Keep donation, interface language, and help discoverable. Explain the controls currently relevant to the active mode. |
| [Ngondro](https://github.com/DonAndrutto/Ngondro/blob/main/index.html) | Header has Donate, a circled `?`, and a globe/code language menu. EN and PL are separate interface languages; Tibetan, phonetics, and translation visibility have independent toggles. The help overlay pauses active scrolling, labels visible controls, then restores the previous state and focus. | Keep interface language separate from the language of names. Help must not accidentally start or reset a recitation, game, or presentation. |
| [KGK-Ngondro header](https://github.com/DonAndrutto/KGK-Ngondro/blob/main/components/Header.tsx) | Small screens use two header rows, keeping the introduction and controls above the title. Donation is a heart link with an accessible name. | Let the header adapt at narrow widths; avoid reducing text and targets merely to force one row. |

All three repositories use the same donation destination:

```text
https://www.paypal.com/donate/?business=JZS5LVZKPPY5J&no_recurring=0&item_name=Help+fund+Dharma+translation+projects.&currency_code=USD
```

This was read from the repositories, not inferred. A World System donation link should retain that destination, identify its purpose, and use `target="_blank"` with `rel="noopener noreferrer"`. No payment was made or donation flow submitted during review.

For World System's dense 3D interface, a legible help dialog with symbols, explanations, and the active mode's controls is an appropriate adaptation of the references. Reproducing every hairline connector is less important than preserving their core behavior: clear explanations on demand, useful on touchscreens, with working keyboard dismissal and focus restoration.

## Work selected for this update

These items were selected for implementation by the task. This table is a scope record, not a claim that an unverified feature has been completed; the final implementation summary and verification record establish delivery.

| Area | Required outcome |
| --- | --- |
| Shared header | Visible Donate, interface-language selector, and `?` help; useful labels and touch targets on mobile. |
| Loading introduction | Preview Explorer, Mandala, Game, and Wheel while loading; give a clear way into the app and avoid leaving the user behind a stuck loading screen. |
| Mandala numbers | Smaller visible number discs, with their visibility control reachable during recitation as well as while stopped. |
| Tours | A presentation route in each mode, with previous/next, play/pause, progress, and restart or finish behavior. Preserve the underlying game and recitation state. |
| Camera composition | Fit the active subject inside the space left by actual panels on desktop, portrait phones, and landscape screens. Stop competing automatic motion while presenting. |
| Offering artwork | Correct the adjacent-image fragments on heaps 23 and 24 and verify both scene and entry-card presentation. |
| Browser interaction | Preserve browser modifier shortcuts and allow text/UI pinch zoom outside the scene. |
| Orientation | Permit landscape for exploration and presentations while retaining the game's contextual portrait guidance. |
| Offline delivery | Regenerate the service-worker asset digest after code and image changes. |

## Prioritized baseline findings

### P1 — restore reading and browser controls

**1. Pinch zoom is disabled across reading panels.** `installViewportGestures()` cancels every Ctrl+wheel event, every two-touch event, and Safari gesture events at document level, even outside the canvas. The baseline gesture test explicitly expects a menu pinch to magnify neither the page nor the camera. That makes already small text harder to read on a phone. Scope gesture cancellation to the scene and preserve native UI magnification. Validate real iOS/Safari gestures as well as synthetic events. [Evidence](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/viewport-gestures.js)

**2. Application shortcuts intercept browser shortcuts.** The global keydown listener recognizes `f`, `p`, `r`, and other letters without checking Ctrl, Command, or Alt. Ctrl/Command+F can trigger fullscreen and suppress Find; Ctrl/Command+P can trigger recitation and suppress Print. Ignore modified keystrokes before applying the app's single-letter commands, and check that typing in inputs still works. [Evidence: keydown listener](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L7325)

**3. The number control disappears while reciting.** The Numbers control is inside `.off-foot`, and `body.min-menus .off-foot` collapses to zero height during playback. The number state logic already works; the control's placement makes it unavailable when needed. Keep it with persistent playback controls. Reduce the painted number disc without making the offering selector or alternative navigation harder to use. [Evidence: collapsing footer](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L588)

**4. Several secondary labels are small and low contrast.** Baseline controls commonly use 10–11 px uppercase monospace, while narrow board labels reach 8.5 px. Day `--ink-3` (`#8a8170`) against `--paper` (`#efe8da`) is approximately **3.16:1**, calculated from those CSS colors; that is weak for small text. Darken small secondary copy, increase essential control type, and reduce letter spacing. The board should retain its whole-board view but offer a readable selected-square explanation and a list/search path. This calculation does not measure the final composited color over translucent 3D backgrounds. [Palette and buttons](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L57), [small-screen board styles](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L1690)

### P2 — improve consistency and resilience

**5. Presentation behavior exists only as a manual mandala study route.** Baseline `startTour()` enters Mandala, visits one heap at a time, and has no presentation timer. Explorer, Game, and Wheel need their own curated sequence and camera policy. A presentation should support jumping, pausing, ending, and returning without changing a die result or discarding a saved game. Camera framing must use the free viewport rectangle, not only raw screen dimensions. [Mandala tour implementation](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L5670)

**6. Switching Polish back to English reloads the application.** `setLanguage()` calls `location.reload()` because the translation layer cannot reverse its DOM replacements. Game dice are durable, but the current mode, entry, camera, and tour position are not restored by that code. Immediate mitigation is to explain or preserve navigation state; the longer-term fix is keyed text rendering so both directions update in place. A header selector will make this limitation more visible. [Evidence](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/locales/pl.js#L2518)

**7. The installed app requests portrait for every mode.** `manifest.webmanifest` sets `orientation: "portrait"`, although wide composition is useful in Explorer, Wheel, and presentations. Permit general orientation changes and retain the existing board-specific fullscreen lock and contextual rotation guidance. [Manifest](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/manifest.webmanifest), [contextual lock](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L7198)

**8. The board's keyboard structure is incomplete.** The board is a `role="grid"` with 104 focusable buttons directly assigned `role="gridcell"`, without row containers or roving focus. Keyboard users have a long tab sequence rather than an efficient spatial grid. Either implement rows, row/column metadata, and arrow-key navigation with one active tab stop, or keep native buttons and provide an accessible list view. This is a recommendation for a subsequent focused change. [Grid markup](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L1842), [cell creation](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L5980)

**9. A WebGL failure prevents access to the text interface.** Most app construction and event registration happens after `await stage.ready`. Its failure path displays a reload message, but it cannot provide the index and entries without 3D. A low-power or unsupported device should still be able to read the content. Extract a lightweight text index before the 3D boot and offer it as the recovery path. Handle module-load failures separately from WebGL initialization failure so the message describes the actual problem. [Boot dependency](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L2041), [stage initialization](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/three-d-stage.js#L128)

**10. First-visit offline preparation fetches the whole application.** The baseline shell is **67 files / 12,778,823 bytes (12.2 MiB)** before HTTP compression, including all game/wheel artwork and both language packs. `sw.js` fetches six files concurrently and installs only when all succeed. The atomic design is sound, but it competes with initial use on a slow mobile connection. Consider a small required shell followed by an explicit or deferred offline download, with a visible readiness state. Preserve the current guarantee that a partial download never replaces a working version. [Worker](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/sw.js), [asset plan](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/scripts/build-sw.cjs)

### P3 — maintainability and measured enhancements

**11. Separate mode orchestration from the large document.** Baseline `index.html` is 7,439 lines / about 407 KB and combines layout, content, geometry, input handling, state, and rendering. The rules engine and camera modules already show a useful extraction pattern. Continue with shared chrome, presentations, mode lifecycle, and localization. Avoid rewriting the tested game rules as part of UI work. [Application](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html), [game engine](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/rebirth-game.js)

**12. Add repeatable browser checks to the existing mathematical tests.** Preserve the current suites, but add narrow-screen navigation, recitation Numbers access, language switching, help focus, tour progression, and service-worker upgrade smoke checks in a real browser. Include image inspection or targeted screenshot comparisons for atlas boundaries. The reported fragments on heaps 23 and 24 illustrate why correct UV coordinates alone do not prove the underlying image content is clean.

**13. Make development checks reproducible.** The README lists manual installation of `three@0.184.0` and `jsdom@26`; the baseline has no package manifest, lockfile, or CI workflow. A small development-only manifest and one check command would reduce setup drift, and CI should reject a stale service-worker digest. The deployed app can remain static and dependency-free at runtime. [Development instructions](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/README.md#L652)

**14. Profile GPU cost before adding visual detail.** The renderer requests `preserveDrawingBuffer: true`, uses shadows, and the default experience rotates continuously. Pixel ratio and shadow resolution are already reduced on coarse-pointer devices, and hidden world views skip drawing. Measure frame time, memory, and battery cost on a representative phone before raising detail; evaluate whether preserved buffers are necessary outside capture workflows. This is a profiling recommendation, not an observed performance failure. [Renderer](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/three-d-stage.js#L149), [render loop](https://github.com/DonAndrutto/WorldSystem/blob/e489c57/index.html#L4873)

**15. Add shareable study locations and optional reading size.** Mode/entry/tour URLs would let teachers link directly to a topic and support sensible reload restoration. A persistent reading-size setting, similar to the reference apps, would complement native browser zoom. Keep Tibetan names, interface language, and reading size as independent choices.

## Existing strengths to preserve

- All 104 squares and 624 square/die combinations are checked; trap quotas, victory, and the ceremonial stupa throw have explicit tests.
- Session restoration replays validated dice, including a pending die sampled before animation. Reloading does not create a reroll.
- The new-game dialog uses a focus trap and makes the main controls inert. Cancellation preserves the game.
- Painted offerings load lazily, keep failed textures invisible, and support retry without refetching successful sheets.
- The wheel has named, keyboard-reachable regions and brings keyboard-focused regions into view.
- Camera and surface tests use real Three.js geometry, including deterministic composition and bounds checks.
- Reduced-motion handling exists for camera movement and game transitions; the initial rotation respects the system preference when no choice has been saved.
- WebGL context loss is handled, and rendering is invalidated when the context returns or the viewport changes.
- Runtime libraries, fonts, and artwork are local; the Three.js files have pinned integrity hashes. The service worker installs atomically and offers an update instead of replacing a live session without notice.
- Authored content, source notes, artwork provenance, and interpretive limitations are documented. UI changes should preserve those distinctions.

## Verification performed for this review

All ten baseline suites passed against an isolated archive of `e489c57`, using the repository's installed development dependencies:

| Suite | Main coverage |
| --- | --- |
| `mandala-regression.mjs` | 37 heaps, 24 offering illustrations, camera bounds, visibility restoration, playback, texture failures/retry, shared mode UI, game integration. |
| `rebirth-regression.mjs` | 104 squares, all 624 transitions, reachability, traps, victory, names, placement and route rules. |
| `viewport-gestures.mjs` | Real OrbitControls, marker taps/pinches, Safari event fallback and prevention of duplicate gesture streams. Baseline expectations include the UI-zoom limitation described above. |
| `world-surfaces.mjs` | Separate ranges, closed seams, bounded waves and terrain geometry. |
| `summit-detail.mjs` | Finite geometry, named selection, gates, and bounded detail cost. |
| `continent-models.mjs` | Deterministic geometry, normals, bounds and picking from multiple directions. |
| `game-session.mjs` | Durable pending rolls, replay, both quota variants, previews, malformed-save rejection and appearance migration. |
| `localization.mjs` | Translation observer stability, targeted updates, markup and attribute translation, and coverage of authored entries. |
| `offline.mjs` | Local assets, library hashes, manifest references, and exact generated service-worker consistency. |
| `wheel-of-life.mjs` | Layer assets, 88 interactive regions, 12 links, 6 realms, 16 hells, keyboard access, touch behavior and bounded camera movement. |

The baseline tests do **not** establish actual CSS layout, artwork appearance, GPU rendering, physical touch recognition, installed-app behavior, or screen-reader usability. Final acceptance should include a 320–390 px phone viewport, a wide desktop, landscape, both interface languages, day/night themes, reduced motion, a slow or failed asset request, and returning from background while a recitation or presentation is active.

## Delivered changes and verification

The implementation adds a shared Donate/language/Help header using the verified reference donation destination, contextual explanations of controls, and a four-mode loading introduction that can be replayed. Essential controls have larger type and touch targets, secondary text has stronger contrast, and reading panels retain browser pinch zoom. The Game world toolbar measures the header clearance, so Throw remains accessible; the header is hidden and inert during player setup.

Presentations now cover 104 Explorer entries, 37 Mandala heaps, a Game introduction plus all 104 squares, and all 92 Wheel entries. Their routes follow the existing catalogues and their explanations reuse the authored entries. Playback offers 1.5, 3, 5 and 8 seconds, gives the last slide a full interval, and supports pause, restart, jumping and keyboard controls. Slow movement starts by default unless reduced motion is requested. Help, manual scene interaction and backgrounding pause playback. Exit restores motion settings; Game tours also restore selection and layout without changing the saved game.

Phone landscape reserves a side panel with a usable reading area, and camera framing accounts for both utility bars and the dock. The Mandala Numbers control remains available during recitation. Corrected atlas regions and aspect ratios remove neighboring artwork from heaps 23 and 24 without cutting off the general's plume. The service-worker generator now includes all root stylesheets, closing a gap that would otherwise break the new UI offline.

Validation performed on the delivered code:

- All eleven Node suites passed, including a new presentation timing suite. The full application harness visits all 338 stops at desktop, portrait and landscape sizes, checks finite camera positions and content, and verifies game and preference restoration.
- Real Chrome checks passed at 320 × 568, 390 × 844, 844 × 390 and 1440 × 1000, covering a real Throw, all four tour launch paths, playback, jump-to-end, modal focus, recitation Numbers, English/Polish and reduced motion. The repeatable optional suite is `tests/browser-ui.mjs`.
- Rendered screenshots confirmed the mobile header/Throw separation, landscape text/artwork arrangement, and clean complete silhouettes for heaps 23 and 24.
- A real service-worker installation cached the new CSS and modules; the application then reloaded offline and opened the complete Wheel tour without runtime errors.

The structural recommendations above remain useful follow-up work: reversible language rendering, board grid keyboard semantics, a text-only recovery path, measured GPU optimization, and a smaller optional offline download. Physical device, Safari and screen-reader acceptance were not performed; Chrome viewport emulation is not evidence for those environments.
