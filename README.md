# The World System — Abhidharma Cosmology

An interactive 3D model of the Buddhist world system, after Vasubandhu's
*Abhidharmakośa* III and Jamgön Kongtrul's *Myriad Worlds*: Mount Meru, the seven
golden ranges, the four continents, the heavens, formless absorptions, and other
realms of existence.

A visual study aid for practitioners learning and visualizing mandala offerings,
and for anyone studying Buddhist cosmology.

Click any part to open its entry; drag to orbit, scroll to zoom.

## Files

| file | what it is |
| --- | --- |
| `index.html` | The page: the model, the searchable index, the maṇḍala mode, and all of the interface. |
| `mandala-offerings.js` | Shared image textures and offering cards for heaps 14–37. |
| `mandala-tour.js` | Looking prompts for the 37 stops of the separate study tour. |
| `sky-clouds.js` | Tibetan cloud silhouettes, layered colour bands and day/night cloud palettes. |
| `world-surfaces.js` | Closed mountain ridges, depth-coloured seas and one shared procedural ripple normal map. |
| `viewport-gestures.js` | Routes scene gestures to the camera and prevents gestures from magnifying the menu interface. |
| `assets/offerings/` | Three locally served artwork sheets, with the generation prompts. |
| `ARTWORK.md` | Image provenance, source references and iconographic adaptations. |
| `tests/mandala-regression.mjs` | DOM and geometry regression checks. |
| `rebirth-board.js` | The 104 squares of the game of rebirth, the die-to-destination graph, and the armature that places the squares the world system has no room for. |
| `rebirth-game.js` | The rules on their own: dead faces, the two counter traps, victory at 104, and each player's trail. No DOM, no WebGL. |
| `rebirth-notes.js` | Two entries per square, written for this drawing: the short note and the full one it expands to. The 1977 commentary is not reproduced. |
| `rebirth-icons.js` | The slot for square iconography — empty until the artwork exists, and wired so that adding it is one line per square. |
| `tests/rebirth-regression.mjs` | Board and rules checks, including the routes the Rules of Play claim. |
| `three-d-stage.js` | The `<three-d-stage>` custom element it imports: WebGL renderer, studio lighting with a soft ground shadow, orbit controls, an auto-framed camera, and OBJ + MTL / GLB export. |
| `assets/app-icon/world-system-master.webp` | Gold-and-lapis Meru app-icon artwork; a symbolic emblem. See its source brief in `assets/app-icon/README.md`. |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Opaque home-screen icons, including an inset Android maskable version. |
| `favicon.ico`, `favicon-32.png` | Matching browser-tab icons. |
| `scripts/build-icons.cjs` | Rebuilds all icon sizes from the single master artwork, using Sharp. |
| `manifest.webmanifest` | Name, colours and icons for installing the page. |

Serve the directory over HTTP and open it (not `file://` — the page uses ES
modules). It is published with GitHub Pages at
<https://donandrutto.github.io/WorldSystem/>. three.js
0.184.0 loads from unpkg through the pinned import map in the head, with integrity
hashes; the fonts are EB Garamond and IBM Plex Mono from Google Fonts. The offering views load three local WebP artwork sheets on first use. The sun and moon glows, the cloud backdrop — clouds after the convention
of the thangka painters, with scalloped silhouettes, broad internal spirals and
tapered wind tails — and the night's stars are all drawn onto canvases at runtime.

The daytime sky grades from clear blue overhead to pale cyan at the horizon.
Clouds use mainly ivory and periwinkle, with occasional jade, ochre and rose;
night uses the same placement with muted blue-grey pigments and stars.
Clouds continue below the horizon for elevated mandala views. Both sky textures
are painted once and cached, with no additional image downloads or animated work.

Day and night texture previews are in `assets/sky/`. To rebuild and check them,
run `node scripts/preview-sky.cjs` with `@napi-rs/canvas` and `sharp` installed as
development dependencies. These are flat texture previews, not WebGL screenshots.

## Adding it to the home screen

In Safari on iPhone or iPad: **Share → Add to Home Screen**. The shortcut takes
the icon and the name *World System*, and opens without Safari's chrome — the page
already carries a phone layout, with the controls docked along the bottom edge.
Chrome and Edge read the same details from `manifest.webmanifest` and offer to
install it the same way.

> **It is not offline yet.** A home-screen shortcut is still a web page: three.js
> loads from unpkg through the import map, and the fonts from Google Fonts, so
> with no network the page will not start. Making it genuinely offline needs the
> library vendored into the repository and a service worker to cache the shell —
> a separate change.

## The drawing

The drawing starts from **1 m : 400,000 yojanas** and makes several deliberate
adaptations for legibility. The outer salt ocean is drawn at about half its width,
the twelve landmasses at forty times their size, and core heights above the water
at 3.4× radial scale. Smaller ranges and seas are widened, Meru is tapered, and
the foundation and hells are compressed or moved so they can be seen.

The seven ranges have irregular crests, branching folds and warm gold facets.
Their detail stays within each range's existing radial band, leaving the seas
separate. Water grades from pale turquoise near the ranges to deeper teal or
lapis, with crossing swells and a shared 128-pixel ripple normal map. This
surface detail is static; it catches the existing moving light without adding
a continuous water animation.

The heavens use schematic spacing inspired by the doubling of textual heights,
with gaps between groups and a narrowing tower. The sun and moon are enlarged
spheres with painted glows; the lighting follows their direction around Meru
from a higher angle for visibility. Offering marks use separate rings around
the world. *The scale of this drawing* describes these and other principal
adaptations. The dimensions in the entries describe the sources; they cannot
all be measured from the displayed model.

Each continent takes its colour and shape from the face of Meru it stands opposite —
crystal white east, lapis blue south, ruby red west, emerald green north — and is
flanked by two subcontinents of the same shape and half the size.

## What is in it

The index runs from the ground up:

- **Notes on the drawing** — the scale, the yojana, kalpas, how a world ends, a thousand worlds
- **Mount Meru** — the four faces, the four terraces and their kings, the summit, Sudarśana, the Vaijayanta palace, the four parks, the asuras
- **The seven golden ranges** — Yugandhara down to Nimindhara
- **The waters** — the seven inner seas, the outer ocean, the Cakravāḍa wall
- **The foundation** — the golden ground, the water maṇḍala, the wind maṇḍala
- **The four continents** and **the eight subcontinents** — with the rose-apple tree, Lake Anavatapta and the Vajrāsana
- **Sun and moon**
- **The six desire heavens**, **the seventeen heavens of form** in their four dhyānas and five pure abodes, and **the four formless absorptions**
- **The eight hot hells**, **the eight cold hells**, and **the other destinies**
- **The maṇḍala of thirty-seven**

## The game of rebirth

The third mode is a whole board of 104 squares beside the world it is a section
through. It is the game attributed to Sakya Paṇḍita, from the 1977 English
edition: the die names the square you go to rather than a number of steps, a
face with no listed move is dead and costs the turn, and squares 1 and 48 are
counter traps that hold a player until one 1, two 2s and so on through six 6s
have been thrown. Victory is declared on arrival at 104. The throw that
follows, which passes the relics into the stūpa, is a rite and settles nothing.

The board holds one side of the screen and the world keeps turning on the
other, framed in whatever the board leaves. They share one selection: the lit
square, the open entry and the tinted marker in the model are the same square,
and the camera goes to each square a token arrives on. Where there is no room
for both — a narrow window, a phone — one control hands the screen from the
board to the world and back, and the throw stays reachable from either.

Each player keeps a karmic trail: the whole arc travelled, a chip for every
throw, which is the one thing a position cannot record. A fall to a hell and
the climb out of it are the same square twice, and only the trail tells them
apart. Reading another player's trail never hands them the die.

Read as a section, the board is already a cosmology, and that is what makes it
sit on this model at all. Its row is height above or below the golden ground;
its two columns of paths separate the tantric route from the route of the
sūtras. Twenty-one squares name something this drawing already builds — the
hot and cold hells, the four continents, the six heavens of sense desire, the
Formless Realm, Akaniṣṭha — and their markers float above the existing
geometry rather than duplicating it.

The other eighty-three have no coordinate here, and could not have one. They are
paths, stages of training, wisdom-holder attainments, sacred lands and Buddha
fields, and the sources are explicit that Buddha fields lie outside the Meru
world system. **These are the destinations that exist only in game mode.** They
stand on an armature that keeps the board's own logic: the sūtra route rising
on one side, tantra on the other, the three sacred lands out beyond the rim,
the Buddha fields clear of it and higher, and the bodies and acts of a Buddha
on the axis above the summit. Every square has an index entry giving its place
on the board and all six of its die results.

The move graph was reconstructed from three independent witnesses in the 1977
edition — the printed chart, the individual square entries and the reverse
index — and cross-checked cell by cell; all 624 square/face combinations
resolve. Where the witnesses disagree the entry says so rather than settling it
silently: square 85 reads a one to 71, as the other Buddha fields each give one
sūtra exit and one tantric, and the reading that sends it to 73 is recorded
beside it.

The commentary prose of that edition is not reproduced: it is copyright © 1977
by Jody Kent, all rights reserved, and this page is public. Every square
instead carries two entries written for this drawing, in the same voice as the
rest of the index — a short note, and a fuller one that unfolds from it in the
drawer. Both live in `rebirth-notes.js`, keyed by square number, so anyone
holding permission to publish the 1977 text can substitute it there without
touching anything else.

### Throwing

The die runs for a couple of seconds before it resolves, ticking and slowing,
and shows nothing of the result until it stops; then the square arrived at is
named in the middle of the board, large enough to read from across a room, and
the card clears itself. Sound is off until asked for, under the `⋯` control
beside the throw. `prefers-reduced-motion` gets the same game without the wait.

### Where the players are

Every player stands in the world as well as on the board: a marker in their own
colour, on a stem that lifts it clear of whatever it is standing on, in a ring
on the square beneath. Whoever holds the die carries a second, wider ring. Two
players on one square are fanned apart rather than hidden inside one another.

### Iconography, when there is some

No square is painted yet. `rebirth-icons.js` holds the slot: register a square
with its sheet and its cell and the picture appears in the corner of the board
cell and on a billboard at its marker in the world, with the sheet fetched only
when game mode is first opened. The convention — one sheet, four pictures
across, counting from zero — is the one the offering artwork already uses. The
path is covered by the test suite with two stubs, so it is known to work before
any artwork exists. Record provenance in [ARTWORK.md](ARTWORK.md) as for
everything else this project serves.

## Controls

Every one of them does something:

| | |
| --- | --- |
| **Index** `i` | The drawer of explanatory entries, with a filter. |
| **Mode** `e` `m` `g` | Explorer, Maṇḍala, Game. Explorer is the model and its index; Maṇḍala is the thirty-seven heaps, in the order the offering names them; Game sets the board of rebirth beside the world. |
| **Board or world** `w` | In game mode on a narrow window, hands the screen from the board to the world and back. Where both fit, they are both already there. |
| **Motion** `r` | Sets the sun and moon on their circuit around Meru — forty seconds to the day — and lets the view turn slowly with them. The sun is what lights the world, so Meru's shadow walks round the continents with it. Off until asked for, so the model holds still while it is being read. |
| **Night** `n` | Paper or dark. At night the moon takes over the lighting, and the clouds stand against a faint field of stars. |
| **Full screen** `f` | Hidden where the platform has none to give: iOS Safari, and any window already running as an installed app. |
| **Reset view** `Esc` | Disabled when there is nothing to undo. |

The title opens **About this drawing** (`a`) — what this is, how to read it, and
what the colours mean. That, and every other word of prose, lives in the sheet
with the entries rather than standing on the model.

The one thing that does stand on it is a small compass rose, bottom right, which
turns with the view so that north can be found without turning the world to look
for it. In the maṇḍala view, seen from straight above with north at the top, the
four directions are lettered at the edge of the plate instead, with the Tibetan the
offering names them by.

## Maṇḍala mode

The second control opens a complete view of all thirty-seven offerings, with
Tibetan, a phonetic reading and English. Play or step through the verse to reveal
each offering in order. Reset returns to the complete reference view.

Meru, the four continents and eight subcontinents retain the existing 3D
geometry. The remaining twenty-four offerings use detailed painted cutouts:
the four treasures, seven royal emblems, treasure vase, eight goddesses,
sun, moon, parasol and victory banner. They face the camera as you orbit,
becoming flat when viewed directly from above. The illustrations float clear
of the plate and continents, with transparent backgrounds and no frames.
Returning to the world view restores the original treasure and luminary meshes.
The painted cutouts are drawn over the terrain so oceans and mountains cannot
hide them when the camera is low. Their relative positions still belong to the
mandala diagram; this overlay is a legibility adaptation.

Motion and Mandala are independent switches. Enable both to turn the complete
offering arrangement, including its images and labels. Motion uses a play
triangle when stopped and pause bars while running. Dragging pauses the turn
temporarily; releasing resumes it while Motion remains enabled.

The **Numbers** switch in either offering menu hides or shows the heap labels.
Numbers start visible and keep their setting while switching between offering
views. The offering selector and tour progress remain available with numbers off.

**Tour the 37 heaps** opens a separate, untimed study route. Each stop shows the
current heap and hides surrounding geometry so it
cannot obscure the subject. It has a short looking prompt, its name and access to the full source
entry. Use Previous/Next, the left/right arrow keys or the 37-item selector.
The final stop offers Finish tour; Return to whole mandala is always available.
An entry also has Tour from here. The full scene returns when leaving the tour.
Painted images use a larger view fitted to their rectangular bounds, with
space reserved below for the heap number. Meru and the continents retain
their wider framing. The cutouts remain paintings as the camera turns.

The index, entry, recitation and tour occupy one shared dock. Only one is shown
at a time, with return controls restoring the appropriate view. On phones the
dock sits above the main controls. Close-ups account for the space occupied by
the dock. Reduced-motion preferences disable animated camera flights.
Wheel and pinch gestures over the scene, including its number markers, control
the camera. Pinch gestures do not magnify the menus. Single-finger and wheel
scrolling inside the menus remain available, as does browser keyboard zoom.

The artwork is contemporary and AI-assisted, informed by traditional descriptions
and Himalayan painting. Its costume, palette and individual poses remain
interpretive. It is not a lineage-certified iconographic set. See
[artwork notes and sources](ARTWORK.md), including the abbreviated wheel spokes
and the distinction between the eight goddesses and larger offering groups.

Numbering and placement follow the [thirty-seven-point diagram](https://dudjomtersarngondro.com/wp-content/uploads/2017/12/37-pt-mandala-lsr.png)
compiled by Lama Sonam Rinpoche for the 2017 Ngöndro retreat at Pema Ösel Ling,
with its [published key](https://dudjomtersarngondro.com/download/texts/free-text-downloads/37-point-diagram-and-key).
The diagram is seen from above: north at the top, east at the right, south at the
bottom and west at the left. It does not specify the practitioner's position.
For a physical offering, orient the plate according to your practice instructions.

| Heaps | Placement in this diagram |
| --- | --- |
| 18–25, emblems and treasure vase | East, south, west, north, south-east, south-west, north-west, north-east |
| 26–33, offering goddesses | South-east, south-west, north-west, north-east, east, south, west, north |
| 34–37, sun, moon, parasol and banner | East, west, south, north |

Heaps 18–37 occupy rings outside the iron wall, spaced to keep the cards
and numbers clear. These rings show offering positions. In this mode the sun
and moon use dedicated painted discs; returning to the world view restores their
cosmological forms and positions.

The thirty-seven-point offering text is attributed to Chögyal Pakpa Lodrö Gyaltsen.
The English translation is by Rigpa Translations, published by [Lotsawa House](https://www.lotsawahouse.org/tibetan-masters/chogyal-pakpa-lodro-gyaltsen/thirty-seven-point-mandala-offering),
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
The form used and the method of counting follow the instructions of the
practitioner's tradition.

## Sources

Vasubandhu, *Abhidharmakośa* & *bhāṣya* III.45–102 (La Vallée Poussin / Pruden);
Chim Jampaiyang, *Ornament of Abhidharma*; Jamgön Kongtrul, *Myriad Worlds*
(*Treasury of Knowledge* I); Mipham, *Gateway to Knowledge* II.

Visual references and image provenance are recorded in [ARTWORK.md](ARTWORK.md).

## Development checks

The browser continues to use the existing pinned Three.js import map. The test
harness needs Node and two development dependencies:

```sh
npm install --no-save --package-lock=false three@0.184.0 jsdom@26
node tests/mandala-regression.mjs
node tests/rebirth-regression.mjs
node tests/viewport-gestures.mjs
node tests/world-surfaces.mjs
```

It runs the complete app script with real Three.js geometry and camera math,
checking the 37 reveals, tour sequence, exclusive panel states, texture UVs,
loading/retry behavior, keyboard controls and restoration of the world view.
Canvas/GPU rendering, texture delivery and browser layout have test substitutes.
A passing result does not establish actual WebGL appearance or device usability.

The surface checks cover closed geometry seams, range separation, height and
wave limits, and the shared ripple texture. They do not render the GPU scene.

The board checks run on the data and the rules alone, with no DOM: the 104
squares, all 624 square/face combinations, the two counter traps, victory, the
routes the Rules of Play claim, each player's trail, and that reading a player
never hands them the die. Game mode itself — the mode switch, the 104 cells in
the board's own order, an entry on every square, the world framed clear of the
board, the twenty-one anchored squares standing on what the model draws for
them, the shared selection, and a game played through the board — is checked in
the maṇḍala suite, which builds the real scene.

To rebuild the icon assets, install Sharp as an additional development dependency
(`npm install --no-save --package-lock=false three@0.184.0 jsdom@26 sharp`) and run
`node scripts/build-icons.cjs`. The artwork itself loads only as app metadata,
not as a scene texture.
