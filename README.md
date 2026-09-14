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
| `rebirth-board.js` | The 104 squares of the game of rebirth, their Tibetan names, the die-to-destination graph, and the armature that places the squares the world system has no room for. |
| `rebirth-game.js` | The rules on their own: dead faces, the two counter traps, victory at 104, and each player's trail. No DOM, no WebGL. |
| `rebirth-notes.js` | Two entries per square, written for this drawing: the short note and the full one it expands to. The 1977 commentary is not reproduced. |
| `rebirth-icons.js` | Where each square's field sits on the atlas sheets, and the billboards that carry it in the world — for every square the world does not already build in three dimensions. |
| `rebirth-sound.js` | The voice every square answers in, and the small synthesiser that plays it. |
| `tests/rebirth-regression.mjs` | Board and rules checks, including the routes the Rules of Play claim. |
| `three-d-stage.js` | The `<three-d-stage>` custom element it imports: WebGL renderer, studio lighting with a soft ground shadow, orbit controls, an auto-framed camera, and OBJ + MTL / GLB export. |
| `assets/app-icon/world-system-master.webp` | Gold-and-lapis Meru app-icon artwork; a symbolic emblem. See its source brief in `assets/app-icon/README.md`. |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Opaque home-screen icons, including an inset Android maskable version. |
| `favicon.ico`, `favicon-32.png` | Matching browser-tab icons. |
| `scripts/build-icons.cjs` | Rebuilds all icon sizes from the single master artwork, using Sharp. |
| `scripts/build-square-art.cjs` | Rebuilds the board's four field sheets from the 105 source paintings, using Sharp. |
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

The phone layouts are drawn for one orientation. Thirteen rows of eight, a card
and a head make a board upright and a letterbox on its side, so the manifest
asks the installed app for portrait, the page asks the browser for a portrait
lock when it goes full screen, and a phone turned on its side anyway is asked
for the phone back rather than served a layout nothing was measured for.

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

The world casts no shadow on the space around it. It hangs on its own wind with
nothing under it, so the shadow-catching floor the 3D stage supplies is kept
down: Meru shadows the continents and the ranges shadow the seas, and nothing
falls outside the disc. The seas write depth, so the hells and the board's own
markers hanging beneath the golden ground stay beneath it rather than showing
through the water.

Each heaven above Meru's summit is drawn the way the painted cosmologies draw
it: a palace with a gilt roof, standing on a bank of cloud up to Anabhraka —
*sprin med*, "the cloudless" — and on an open ledge from there to Akaniṣṭha.
Four of them are not: Tuṣita, Nirmāṇa-rati, Paranirmita-Vaśavartin and the
first heaven of form carry the field the board of liberation paints for them
instead, since the board draws each of those as a thing of its own rather than
as one more palace. Vaijayanta on the summit follows the same board's field for
the Heaven of the Thirty-three.
Each level is wider than the one below, as the texts have it, though the
widening is illustrative rather than measured. Their spacing is schematic,
inspired by the doubling of textual heights, with gaps between the groups. The
sun and moon are enlarged
spheres, each with a mottled painted face inside a gold rim and a corona of
fine rays, after the offering cards this project already serves; the lighting
follows their direction around Meru from a higher angle for visibility. Offering marks use separate rings around
the world. *The scale of this drawing* describes these and other principal
adaptations. The dimensions in the entries describe the sources; they cannot
all be measured from the displayed model.

Each continent takes its colour and shape from the face of Meru it stands opposite —
crystal white east, lapis blue south, ruby red west, emerald green north — and is
flanked by two subcontinents of the same shape and half the size. Jambudvīpa's
outline follows the field the board of liberation paints for it — a bowed
northern edge and two long concave flanks — rather than a ruled quadrilateral.

A camera that drops below the water line is under it: the scene takes a sea fog
and the view a blue cast, and both come off again the moment it surfaces.

Nothing in the scene moves on its own, so nothing is drawn unless something has
changed, and a phone left holding the page renders no frames at all. Three
things that do not look like changes are treated as ones: the canvas being
resized without the window being resized — a phone's toolbar sliding away, a
layout switching under it — which clears the drawing buffer and would otherwise
leave the model gone until something else happened to ask for a frame; the board
being given the whole screen, where the model is behind an opaque page and is
not drawn at all until it is wanted again; and the browser taking the WebGL
context away under memory pressure, which is met by stopping, saying so, and
rebuilding the moment it is handed back rather than issuing frames into
nothing.

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

Every square is drawn as the field it carries on the printed board — a coloured
ring, a cartouche, a continent's own outline, a mountain, a temple, a ribbon —
and every square is named in Tibetan as well as English. The field is the cell's
own ground on the board, a billboard at the square's marker in the world, the
picture in its entry, and the face of the card that announces a throw. Every
cell carries its name over that field, in whichever language the board is being
read in — where the row is too short for the whole name, the beginning of it.
**Names**, among the settings under Options (`t`), is a selector of two with the
language in force held down; the entry in the drawer always gives both. See
[ARTWORK.md](ARTWORK.md) for how the paintings are served.

Three arrangements of the same game, switched from the rail or cycled with `b`:

- **Both** — the board beside the world it is a section through.
- **World** — the model alone, with only the throw kept, framed to hold the
  whole round from the hells below the ground to the last act above the summit.
- **Board** — the game as a plain diagram of positions, with no model behind it:
  the same board read in two dimensions instead of three.

They share one selection: the lit square, the open entry and the tinted marker
in the model are the same square. Where the board cannot be set beside the world
— a narrow window, a phone — **Both** divides the screen the other way instead:
the world above, the board below, and the throw on the bar between them. `w`
hands the whole screen from one to the other, and the throw stays reachable from
either.

Wherever somebody is standing, the square takes their colour: on a board of a
hundred and four fields the size of a thumbnail, a counter in the corner of a
cell is not something a player can find their token by.

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
world system. **These are the destinations that exist only in game mode.**

They stand on one rising spiral, read in the board's own order: square 1 below
the golden ground at the widest turn, square 104 on the axis above the summit,
and the hundred and two between them winding up and inward over three and a
quarter turns. Nothing in the Meru system has that shape — it is the board's
shape, not the world's, which is why it is drawn as a path through the world
rather than as part of it. How far each square stands off the spiral still says
which route it belongs to, so the two ascents remain separable by eye. Every
square stands on a plinth, and every square has an index entry giving its place
on the board and all six of its die results.

Select a square and the squares its faces reach are lit on the board and drawn
as thin lines in the world, with the square named where it stands.

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
the card clears itself. Sound is off until asked for, under Options, and stays
where it was left rather than where the browser happens to restore it.
`prefers-reduced-motion` gets the same game without the wait.

### Beginning again

The **New game** control sits beside the throw and is reachable at any moment,
but it never acts on its own: it opens a dialog that says what will be lost,
and that is also where the players are named. The names carry through the
players bar, the log, the status line and the card that announces each throw.
Cancelling changes nothing.

### The card that announces a throw

When the die stops, a card says where the token has arrived: the field the
square is drawn as, its number in large figures, its name in English and in
Tibetan, and what has happened to the turn. **Read the full entry** opens that
square's entry in the drawer with the whole passage already unfolded, so the
card is one click from everything the project has to say about the square. The
card clears itself, but not while it is being read — hovering or tabbing into it
holds it open. Victory and the stupa throw that follows carry a painting of
their own: Amitābha, the stupa and the Guru.

### What the board sounds like

Off until asked for, under the board's options, and built from oscillators and
filtered noise at the moment it sounds — the page still loads no audio and works
offline. The die clatters as it runs down and settles with the table under it.
Where a throw ends has a voice, taken from the company the square keeps on the
board: a drone under the hells, a thin reed for the pretas, a hollow knock for
the animals, an open fifth for the human world, small bells for the heavens of
sense desire and a wider, slower one for the realm of form, a held partial that
only swells for the formless, a gong for the sūtra route and a ḍamaru for the
mantra route, one horn-call shared by Bön, barbarism and Hinduism, a distant
roar shared by Mahākāla and the one square that reaches him, an open chord for
the sacred lands and buddha fields, a measured triple stroke for the acts of a
buddha's body, and for Nirvāṇa alone everything falling away. Under each of them
a short rise or fall, read off the row the token left and the row it reached.
The mapping lives in `rebirth-sound.js` and is covered by the test suite; the
synthesis needs a real audio clock and is not.

### Where the players are

Every player stands in the world as well as on the board: a marker in their own
colour, on a stem that lifts it clear of whatever it is standing on, in a ring
on the square beneath and a column of the same colour standing over it. Whoever
holds the die carries a second, wider ring. Two players on one square are fanned
apart rather than hidden inside one another. Over the model each one is also
named where they stand — their colour, their name and the square they are on —
because four cones of four colours somewhere on a model this busy are not an
answer to *where am I*.

### Nirvana

Nirvana is not the last square of the round but the one outside it. It is drawn
outside the model to match: on the axis, clear above the formless absorptions
and above everything else the world system builds, as open rings rather than
anything to stand on. Its cell on the board is set apart in gold. The camera
opens far enough to hold it only when it is the square in hand.

### How the fields are served

`rebirth-icons.js` lays the hundred and four paintings out from the square
numbers alone: four across, twenty-eight to a sheet, four WebP sheets of about
1.4 MB in total, fetched only when game mode is first opened and each retried on
its own if it fails. The convention is the one the offering artwork already
uses. `node scripts/build-square-art.cjs` rebuilds the sheets from the source
paintings in `assets/Game of Liberation English titles/`; `SQUARES_PER_SHEET`
has to agree with it. Record provenance in [ARTWORK.md](ARTWORK.md) as for
everything else this project serves.

## Controls

Three of them stand on the model, and no more: the index, the view you are in,
and the settings that belong to no view. The last two open downward into menus,
so at rest the whole of the page's chrome is one short bar in the corner. The
title has gone into the head of the index, which was always the way into the
prose; the four-continent legend has gone with it, since every word of it is in
the entries the legend sat beside.

| | |
| --- | --- |
| **Index** `i` | The drawer of explanatory entries, with a filter, headed by the title and the way into *About this model*. |
| **View** `e` `m` `g` | Explorer, Maṇḍala, Game. Explorer is the model and its index; Maṇḍala is the thirty-seven heaps, in the order the offering names them; Game sets the board of rebirth beside the world. |
| **Board, both or world** `b` | In game mode, what is on the screen: the board alone, the board beside the world (or, where they cannot sit side by side, above it), or the world alone. Kept between visits, and only while the game is on the screen — the arrangement is the game's dress and comes off with it. Asked for on its own the board takes the whole page as a printed board rather than a panel: a painted sky of the model's own clouds, the wordmark over it, the throw, the players, the square in hand and the karmic trail on one card, the hundred and four named fields under that, and the three controls docked along the foot. It has a night palette of its own, gold on ink. |
| **Names** `t` | Which language the squares are named in, in passing, wherever they are named — English or Tibetan. Under Options, as a selector of two with the one in force held down. The entry always gives both. |
| **Board or world** `w` | In game mode on a narrow window, hands the screen from the board to the world and back. Where both fit, they are both already there. |
| **Options** | Motion, night, sound, the language of the names, full screen and reset view, under one control. |
| **Motion** `r` | Sets the sun and moon on their circuit around Meru — forty seconds to the day — and lets the view turn slowly with them. The sun is what lights the world, so Meru's shadow walks round the continents with it. The moon does not stand opposite it — directly behind Meru it would sit in the mountain's own shadow and never be lit at all — so it runs a little under a half-turn away. Off until asked for, so the model holds still while it is being read. |
| **Night** `n` | Paper or dark. At night the moon takes over the lighting, and the clouds stand against a faint field of stars. |
| **Sound** | The voice each square answers in, under Options with the rest of the settings that belong to no view. Off until asked for, like motion. |
| **Full screen** `f` | Hidden where the platform has none to give: iOS Safari, and any window already running as an installed app. |
| **Reset view** `Esc` | Disabled when there is nothing to undo. |

An entry is read in the order a reader wants it: what it is called, then the
thing itself — the painting, or the field the square is drawn as — then what is
said about it, and last the table of measurements, or of where the square stands
and what each face of the die does with it. **Zoom in**, in the foot of an entry,
puts the camera on the thing named; where the board has been given the whole
screen there is no camera on screen to put anywhere, and the control is not
shown.

The title at the head of the index opens **About this model** (`a`) — what this
is, how to read it, what the colours mean, and who made it. That, and every other word of
prose, lives in the sheet with the entries rather than standing on the model.

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
views. A heap that stands clear of its neighbours on screen also carries its
name; in a cluster the number holds the place alone, and hovering or selecting
a heap always names it. Which heaps have that room is measured from where the
marks actually land, so zooming in opens the names out ring by ring. The
offering selector and tour progress remain available with numbers off.

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

The board, its names and its move graph come from Michael Tatz and Judy Kent,
*Rebirth: The Tibetan Game of Liberation* (1977), reconstructed from the printed
chart, the square entries and the reverse index and cross-checked cell by cell.
The commentary of that edition is not reproduced; the entries here are written
for this model. That note is given once in the app, at the end of *About this
model*, rather than under each of the hundred and four squares.

Visual references and image provenance are recorded in [ARTWORK.md](ARTWORK.md).

The model is by **Andrzej R. Rybszleger**, built from the sources above.

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
