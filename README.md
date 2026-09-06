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
| `three-d-stage.js` | The `<three-d-stage>` custom element it imports: WebGL renderer, studio lighting with a soft ground shadow, orbit controls, an auto-framed camera, and OBJ + MTL / GLB export. |
| `icon.svg` | The home-screen and tab icon: Meru on the golden ground, in the model's own colours. Source for the PNGs. |
| `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Rasterised from `icon.svg`. |
| `manifest.webmanifest` | Name, colours and icons for installing the page. |

Serve the directory over HTTP and open it (not `file://` — the page uses ES
modules). It is published with GitHub Pages at
<https://donandrutto.github.io/WorldSystem/>. three.js
0.184.0 loads from unpkg through the pinned import map in the head, with integrity
hashes; the fonts are EB Garamond and IBM Plex Mono from Google Fonts. Nothing else
is fetched: the sun and moon glows, the cloud backdrop — clouds after the convention
of the thangka painters, a head of stacked lobes with a streamer that closes in a
spiral — and the night's stars are all drawn onto canvases at runtime.

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

## Controls

Six, and every one of them does something:

| | |
| --- | --- |
| **Index** `i` | The drawer of explanatory entries, with a filter. |
| **Mandala view** `m` | The thirty-seven heaps, in the order the offering names them. |
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

The second control lays the world out heap by heap in the order the thirty-seven-point
offering names it, with the Tibetan, a phonetic reading and the English, and a player
that steps or runs through the verse.

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

Heaps 18–37 are marked on rings outside the iron wall for readability. These
rings show offering positions. The sun and moon also have their own places in
the cosmological model, which the numbered marks do not track.

The thirty-seven-point offering text is attributed to Chögyal Pakpa Lodrö Gyaltsen.
The English translation is by Rigpa Translations, published by [Lotsawa House](https://www.lotsawahouse.org/tibetan-masters/chogyal-pakpa-lodro-gyaltsen/thirty-seven-point-mandala-offering),
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
The form used and the method of counting follow the instructions of the
practitioner's tradition.

## Sources

Vasubandhu, *Abhidharmakośa* & *bhāṣya* III.45–102 (La Vallée Poussin / Pruden);
Chim Jampaiyang, *Ornament of Abhidharma*; Jamgön Kongtrul, *Myriad Worlds*
(*Treasury of Knowledge* I); Mipham, *Gateway to Knowledge* II.
