# Menus, gold terrain, and world endings

The accepted application in this checkout is the starting point. The rejected
`codex/ui-refinement` experiment has not been reused.

“Realms & path” belongs to the existing game rail. Its menu, Destinations, and
Game use three equal controls, including on phones. The Search, mode, and
Options controls also share equal widths and aligned baselines. Dropdowns are
positioned against the viewport, below the game header; long menus scroll
inside the available height.

The six mode previews are WebP images captured from the actual application,
including the painted rebirth board and Wheel of Life. They appear in the mode
menu and introduction. The golden ranges use warmer vertex colours and a
small local reflection map, shared with the golden ground. The map is generated
in the browser and needs no external image or network request.

Reading panels, the search index, tours, astronomy panels, and expandable menus
have a draggable edge. Double-click the edge, or press Enter while it is focused,
to minimize and restore a reading panel; arrow keys adjust height. Minimized
readings retain their title and relevant actions. Desktop explanations use the
right-hand dock, with the world reframed in the remaining space.

## World endings

Open **Options → World endings**, or **Watch the world end** in the destruction
entry. Play/pause, restart, three cycle choices, and a timeline are available.
Reduced-motion preferences start the scene paused. Backgrounding stops time
advancing; closing the presentation restores the world and its prior motion
preference, while preserving any motion preference deliberately changed during
playback.

Fire shows seven suns, drought and drying water, smoldering, flame and smoke,
and emptiness. Water shows a rising surface with waves and progressive dissolution.
Wind separates the architecture and terrain into a vortex with dispersed fragments.
These are separate world cycles; fire stops below the second dhyāna, water below
the third, and wind below the fourth. Higher levels remain.

The presentation uses a temporary copy of the world. Its materials, effect
geometry, instanced buffers, and texture are released when switching cycles or
closing; the original geometry and materials are preserved. Timing and effects
are illustrative. The textual sequence follows the [Seven Suns discourse,
AN 7.66](https://suttacentral.net/an7.66/en/sujato), the [Three Catastrophes
chapter of Dīrgha Āgama 30](https://canon.dharmapearls.net/01_agama/dirgha/DA_30-9.html),
and the application's existing Abhidharmakośa III.100–102 account.

## Verification

Chrome checks passed at 1440, 820, 390, and 320 pixels: equal control dimensions,
loaded artwork, resizing and restoration, a clear desktop Meru projection,
downward game dropdowns within the viewport, a durable game throw, all three
endings, and restoration without changing the saved game. Guided practice and
repeated fast throws passed at 390 pixels in English and Polish.

The existing board rules (104 squares and all 624 throws), session replay,
Mandala/scene regression, world surfaces, mode/localization chrome, and offline
resource checks passed. Browser checks emulate viewport and input sizes.

Reproduce with `node tests/browser-world-experience.mjs` against a local server;
set `WORLDSYSTEM_URL` and `WORLDSYSTEM_PLAYWRIGHT` when needed. Optional screenshot
output uses `WORLDSYSTEM_SCREENSHOTS`. The standalone sequence check is
`node tests/world-ending.mjs`. Rebuild the offline manifest after any served
change with `node scripts/build-sw.cjs`.

## Follow-up: World mode and Calm pace

The shared menu bar now measures its actual width before deciding whether to
stack. The full height of both utility cards is reserved above the game rail,
including the 944-pixel window that previously put one menu over another.

Every animation pace uses the same fixed Throw button. In the desktop World
view it shares the description's right-hand column and stays below it at a
constant position. The result card and full-entry reading are both placed
beside Meru; their footprint is included in camera framing. On phones the
button keeps its bottom position, with descriptions above it.

`tests/browser-world-layout.mjs` covers normal-motion World mode at 1440, 944,
820, and 390 pixels, all three animation paces, unique fixed actions, side
placement and full-entry clearance. The existing Mandala harness now uses the
canonical fixed action rather than the hidden duplicate inside the result card.

The final World-view check also opened the realm guide in the same side column.
Its dropdown height ends above the fixed action, which remained hit-testable
while the guide was open. Actual browser checks covered 944 × 744, 820 × 744,
and 390 × 844; Calm, Quick and Instant kept identical action coordinates at
the same viewport size. A screenshot of the updated saved-game view is in
`docs/world-experience/world-view-followup.jpg`.
