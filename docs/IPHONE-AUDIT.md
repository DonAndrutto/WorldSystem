# iPhone audit — what was tested, what was found, what was changed

**Read this first.** Nothing here was run on an iPhone, or in Safari, or in WebKit. The browser was
Playwright's Chromium 153.0.8010.12 (Playwright 1.63.0, Node 22.22.0, Linux), in a cloud container with no GPU:
WebGL ran on SwiftShader, so a frame of the game's world takes from a fraction of a second to a few
seconds, and a screenshot of it 10–40 s. Viewports, touch, device pixel ratio, the notch's safe-area
insets (`Emulation.setSafeAreaInsetsOverride`), reduced motion, offline and a service worker were
emulated; Safari's behaviour was not. WebKit could not be installed: Playwright's download hosts are
not reachable from this environment. What is therefore **not** established is listed at the end.

Audited tree: `8a80614` (main, PRs #67–69) plus this branch. The findings were made on the branch as it
stood when each audit ran (the *before* pictures are of that tree); the fixes are commit
`673c4c2`; the final run of the suites is of that commit plus the test-harness line noted under
*Tests actually run*. Screenshots are in [`docs/iphone-audit/`](iphone-audit/), numbered as below.

## How it was done

An audit script walked the page and, at every state, measured it from the DOM: horizontal page scroll;
every visible control against the screen and against what covers its centre (`elementFromPoint`); labels
whose text is wider than their box; how much of the middle of the screen the interface itself covers, and the
largest free rectangle left for the subject. Open menus, sheets and panels are *meant* to cover what is
beneath them and were not counted. Screenshots were then read by eye at the states that mattered.

| | |
| --- | --- |
| Viewports | 320×568, 390×664 (an iPhone's Safari with its toolbars), 390×844, 568×320, 844×390 — plus 667×375, 812×375 and 844×340 for the game's visit panel |
| Interface | English (all), Polish (320×568, 390×844, 844×390) |
| Theme | day (all); night (390×844, English and Polish) |
| Motion | reduced (all); normal, quick pace, for the Nirvana finale (390×844, 844×390) |
| Explorer | home, search, an entry, Options menu (scrolled to its end), view menu, Motion on and off |
| Mandala | all 37 heaps in recitation and all 37 in the tour, at each viewport; Numbers off and on, in both; Motion on with the mandala; Play; the heap being read checked for being on the screen and not under a panel (74 views × 4 viewports) |
| Game | board; Destinations, Game menu, move log, *Realms & path*, a throw and its card, the entry from the card, larger squares; world; Options over the world; the visit panel; the game's tour; the New game dialog with 1 and 4 players; the landscape notice and its way into the world |
| Nirvana | a saved game one throw short of 104 restored; the throw that wins; the finale at +0, +3, +7 and +18 s; the board; back to the world; to Explorer and back; a reload (a completed game restored); a new game |
| Totals | 9 × 92 + 12 × ~30 audited states over 21 combinations of size, language, theme and motion, and the focused runs below; re-run after the fixes where a finding was made |

Defects were fixed only where they were reproducible, had a size, a language and a control that could not be
touched or read, and could be fixed without changing the accepted look. Each fix has a test
([`tests/browser-iphone-layout.mjs`](../tests/browser-iphone-layout.mjs),
[`tests/browser-nirvana-lifecycle.mjs`](../tests/browser-nirvana-lifecycle.mjs)) that fails on the tree it was
found on.

## Verified defects, fixed

| # | where | what | evidence | fix |
| --- | --- | --- | --- | --- |
| 1 | 320×568, English and Polish | The header's *Donate* / *Wesprzyj* is wider than its 44px and ran under the magnifier beside it (3px over in English, 11px in Polish). | `01-before-…`, `01-after-320-pl-header` | below 340px the word is set aside (still the link's accessible name); the heart stays |
| 2 | 320×568, Polish | The tour's third button, *Zakończ zwiedzanie*, stood past the screen's edge (`[247,390,335,440]` on a 320px screen): `grid-template-columns: 1fr 1fr 1fr` does not let a track shrink below its content. | `01-before-…`, `01-after-320-pl-tour`; fails on main | `repeat(3, minmax(0, 1fr))`, words wrap |
| 3 | 320×568, English | Same cause in the offering panel: *Whole mandala* ran into the panel's edge. | measured: button right edge 311 on a panel ending at 311 | `repeat(2, minmax(0, 1fr))` |
| 4 | 320×568 | With the panel at 62% of the screen the model keeps a band of 80px; in 7 of the 33 recitation steps that name a single heap (15, 19, 22, 23, 26, 27, 31) the mark of the heap being read stood under the panel's edge. A mark is 26px whatever the room. | `03-before-…`, `03-after-…` heap 22; `audit4`: 7 → 0 of 74 views | portrait screens shorter than 640px take 54% (the value before the phone pass); every other size is unchanged |
| 5 | 812×375, 844×340, 568×320 (and the heading at 667×375) | The game's visit panel (*Focus here · Return to world · Full story*, after *Show in world*) is anchored in the right column between the rail above and the throw below, where there is less than its height. It stood under the rail and the controls: a finger landed on *Destinations* or *Game*, not on *Return to world*. At 667×375 the rail covered its heading. | `02-before-…`, `02-after-…`; hit-test of each button; fails on main | on a short screen the panel is one compact piece — at the foot beside the throw (wider than 700px, shorter than 500px) or in one row under the rail (up to 700px wide, up to 430px tall); the note kept for a screen reader |
| 6 | all sizes | Leaving the game in the second between winning and the celebration (`rbCelebrate`'s timer) was not cancelled: it fired in the explorer and flew the eye to a stupa that was not being drawn. | `tests/browser-nirvana-lifecycle.mjs` scenario 2 fails on main (*the eye does not leave the explorer…*) | `leaveGame()` cancels it; the timer also checks the mode; the game is lit, settled, on the next entry |
| 7 | any notched iPhone held sideways | `viewport-fit=cover` lets the page run under the notch and the rounded corners (47px each end, 21px at the foot). Only the top and the foot were kept clear: the brand, *Options*, *Game* and the throw stood under them. | `04-before-…` (4 controls in the margins), `04-after-…` (0); `Emulation.setSafeAreaInsetsOverride` | `--sa-l`, `--sa-r` applied to the header, strip, rail, panels, cards, visit panel and menus; no change where the insets are 0 (pixel-identical screenshots at 390×844 and 844×390) |

No defect was found in the Explorer, the search, the Options menu or the Mandala at 390×664, 390×844, 568×320 or
844×390 in either language, by day or night, beyond the above. 320×568 in Polish shows the above only.

## Behaviour checked and found right

- **Pinch-zoom.** The conflict is in the files, not in the specification. `index.html` once said
  `touch-action: pan-x pan-y` on `html, body` (no pinch-zoom anywhere); `app-chrome.css`, loaded after it, says
  `pan-x pan-y pinch-zoom`, and the README, `viewport-gestures.js` and its tests, and the earlier application review
  all say the same: *wheel and pinch over the scene, including its number markers, control the camera; pinch
  over reading panels keeps native browser zoom*. The accepted behaviour is therefore **not** a page-wide
  prohibition; the viewport meta forbids nothing. The older declaration in `index.html` was brought into line (it was
  overridden already) and `tests/viewport-gestures.mjs` now fails if either place bans pinch-zoom or the viewport
  forbids zooming. Native iOS pinch itself was not tested.
- Mandala: 37 recitation steps and 37 tour steps at each viewport leave the heap being read on the screen; Numbers
  off/on, Motion on with the mandala, Play and the tour all lay out cleanly.
- Game, board and world, saved-game restoration, reaching 104, the card, *Show in world*, *Return to world*, the
  tour, the New game dialog.
- The finale (`tests/browser-nirvana-lifecycle.mjs`, 8 scenarios): the light comes on; the eye stands back
  (≥ 1.5× its distance before) and then comes to the stupa; the board turned over it and the world again; the page
  put in the background for longer than the whole finale, drawing stops and resumes, the stupa is lit on return;
  a new game puts the light out; a completed game restores settled and the eye is not thrown about; reduced motion and
  the Instant pace show it settled with no flight; 844×390 fits.
- Installed and offline, in Polish (`tests/browser-sculpture-recovery.mjs`): with a complete shelf, offline, the
  Polish pack and the sculpted Buddhas come from it; a retry address (`?retry=9`) is answered from it; without the
  meshes, the stand-ins, the note, a retry that fails offline and one that works online.

## Observations and suspected risks — not fixed

These are real but are design decisions or outside what Chromium can show; none was changed.

1. **The game's world on a phone held sideways is a band, not a stage.** The header, the strip and the rail take
   about half the height; the free rectangle for the model is 98px high at 844×390, 85px at 844×340 and 80px at
   568×320 (179px with the card closed and the traveller followed). The ascent is a tall figure, so it is drawn small. At
   667×375 and 568×320 the throw and the controls strip stand across the middle as well and the model is all but gone.
   The clean answers (a one-row header when Donate and Help give up their words; a one-row rail on a short
   landscape phone) change the look, and were left to a decision.
2. **At 320×568 the entry sheet leaves about 110px to read in** (it scrolls), and while a sheet is open over the
   board the rail's *Board/World* switch is under the header; closing the sheet restores it.
3. **A card, once up, takes the first tap anywhere** (outside the header, strip and the rail's menus) and only
   clears itself, *including a tap on Board/World*. Documented in the code; it is why a test must close the card first.
4. **`panel-layout.js` positions a dropdown after it has opened.** For a frame the menu is at its CSS default
   (absolute, as tall as its content: 688px in Polish at 844×390) before it is placed. Only the frame is wrong, but a
   slow device will show it.
5. **The selected square's name in the world's label is cut with an ellipsis** at 22 characters on a phone.
   The whole name is in the rail and the entry.
6. **The mandala is small on 320×568** even after fix 4 (about 100px); the marks of the inner heaps overlap each
   other there, as they do at every size for the innermost ring.
7. **Safe-area insets were checked by emulation only.** The probe covers controls under the notch; it does not
   cover text that is merely close.
8. **`navigator.onLine`** stayed `true` after a reload under Playwright's offline mode, so the `online` event never
   came; the retry the reader presses is what was tested there. On a device the event may come, or may not (iOS
   Safari's reporting of it is known to be unreliable).
9. The README's *Sixty-seven files, about 12 MB* was long out of date (the shelf holds 151 files, 23 MB, and
   `tests/offline.mjs` says exactly how many); corrected.

## Environmental failures, separated from defects

On the unmodified main (`8a80614`), serially, with the machine otherwise idle:

| suite | main | this branch | what the failure is |
| --- | --- | --- | --- |
| `browser-world-experience` | fails: *normal-motion playback advances* | same | a 1.2 s wait for a progress slider; with software WebGL a frame of that scene takes longer |
| `browser-discovery-realms` | fails: `pieces.some(s=>s.includes('monastics.png'))` | same | reads the player tokens' art 300 ms after *Start*; the art is applied when the image has loaded |
| `browser-ui` | fails at `[data-tour=play]`: *element is not stable* | same | Playwright's actionability waits for two identical frames; there are none while the tour runs on a 1 fps renderer. 390×844, 320×568 and 844×390 pass first |
| all others | pass | pass | |

Run while other work held the CPU (load average ≈ 10 on 4 cores) nine of the eleven existing browser suites failed
on main on 30 s timeouts. They are timing failures in this environment, not functional ones: the assertions
were not touched.

## Tests actually run

Run on the committed tree; `WORLDSYSTEM_CHANNEL=chrome` pointed at Playwright's Chromium (a symlink at
`/opt/google/chrome/chrome`), against `python3 -m http.server`.

**Without a browser** (`node tests/<name>.mjs`, all 35 suites in `tests/` that need none): all pass — among them
`localization`, `mandala-regression` (1 m 49 s; its harness now hands the page the two new modules, the only change to it),
`rebirth-regression` (24 checks), `game-session`, `square-models` (11), `sculpture-anatomy` (10), `player-moods` (6),
`offline` (now also: the Polish pack and the game's sculptures are on the shelf, the study meshes are on nothing, a retry
address is served from the shelf), `chrome-modes`, `viewport-gestures` (now also: nothing forbids page-wide pinch-zoom),
and the two new ones, `game-display` (10 checks) and `sculpture-loading` (13 checks).

**In Chromium** (seconds are wall-clock on the software renderer):

| suite | result | time |
| --- | --- | --- |
| `browser-iphone-layout` (new: 320 header and tour foot, the visit panel at four sizes, a notched phone) | pass, 4 scenarios | 242 s |
| `browser-nirvana-lifecycle` (new: 8 scenarios) | pass | 350 s |
| `browser-sculpture-recovery` (new: 8 scenarios) | pass | 328 s |
| `browser-game-display` (new: 11 scenarios) | pass | 570 s |
| `browser-game-clarity` (320, 390, 820, 1180, 1440, Polish, night, landscape) | pass | 446 s |
| `browser-guided-game` | pass | 919 s |
| `browser-world-layout` | pass | 396 s |
| `browser-architecture-audio`, `browser-sound-effects` | pass | 324 s, 150 s |
| `browser-main-fixes`, `browser-worlds-memory`, `astrology-browser` | pass | 321 s, 10 s, 124 s |
| `browser-world-experience` | **fails, as on main** (*normal-motion playback advances*) | 86 s |
| `browser-discovery-realms` | **fails, as on main** (`monastics.png` token art) | 89 s |
| `browser-ui` | **fails, as on main**: five of its configurations pass (390×844, 320×568, 844×390, 1440×1000, 390×844 Polish) before a wait for `#tour-pace` times out; on main it stopped one configuration earlier, at `[data-tour=play]` | killed at 1800 s |

The three failures are the ones in the previous section, identical in kind on the unmodified main.

**Do the new tests catch what they are for?** `browser-iphone-layout` and `browser-nirvana-lifecycle` were run against the unmodified main and fail there; for the visit panel and the notch the same checks were made with the audit's probes (the test file stops at its first failure on main):
`browser-iphone-layout` on main (*the Donate link holds its own content (over by 3px)*; with that block removed, *[data-tour=overview] is on the screen at 320 in
Polish: [247,390,335,440]*); `browser-nirvana-lifecycle` on main (*the eye does not leave the explorer for a stupa it cannot see*); the visit-panel
hit-tests on main (`audit3` at 812×375: *Focus here* → `div.bv-rail`); the notch probe before the fix (4 controls in the margins). Two mutations of the other new tests were made and caught: names hidden with `display:none` instead of the visually-hidden clip fails `browser-game-display` at *the cell is still named by its number…*; a retry that asks at the same address fails `sculpture-loading` at *only the file that failed, under a new address*.

## Not tested — needs a device, or Safari

- Safari / WebKit of any version; iOS-only behaviour (the dynamic toolbar and `dvh`, the rubber-band, `overscroll`,
  the keyboard resizing the viewport, text autosizing, `100vh`).
- Real safe-area insets, the Dynamic Island, rotation animations, `orientationchange` and the browser's portrait lock
  (`screen.orientation.lock`).
- Real multi-touch: pinch on the scene and on a panel, two-finger rotate, the 300 ms and double-tap-zoom heuristics.
- Add to Home Screen, the standalone window, the seven-day storage rule, the service worker's update flow on iOS, and
  an actual aeroplane-mode reopen.
- Audio (`AudioContext` unlock on a gesture), VoiceOver, Dynamic Type / the larger-text setting, *Reduce Motion*
  as iOS reports it (emulated here as `prefers-reduced-motion`).
- Memory and thermal limits: the page holds a 23 MB shelf, a WebGL context and the models; a real iPhone may lose the
  context sooner than this environment. The page handles `webglcontextlost`, but it was not provoked.
- How a failed `import()` behaves in Safari. Chromium keeps the failure for the same address and takes a new one
  (`browser-sculpture-recovery`, scenario 4, prints what it saw); Firefox and WebKit may differ, which is why the retry
  never relies on the same address answering again.
