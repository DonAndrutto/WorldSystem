# The World System — Abhidharma Cosmology

An interactive 3D model of the Buddhist world system, after Vasubandhu's
*Abhidharmakośa* III and Jamgön Kongtrul's *Myriad Worlds*: Mount Meru, the seven
golden ranges, the four continents and the twenty-eight realms above and below them.

Click any part to open its entry; drag to orbit, scroll to zoom.

## Files

| file | what it is |
| --- | --- |
| `world-system.html` | The page — the model, the index of 154 entries, the maṇḍala mode, and all of the interface. |
| `three-d-stage.js` | The `<three-d-stage>` custom element it imports: WebGL renderer, studio lighting with a soft ground shadow, orbit controls, an auto-framed camera, and OBJ + MTL / GLB export. |

Open `world-system.html` over HTTP (not `file://` — it uses ES modules). three.js
0.184.0 loads from unpkg through the pinned import map in the head, with integrity
hashes; the fonts are EB Garamond and IBM Plex Mono from Google Fonts. Nothing else
is fetched: the sun and moon glows and the cloud backdrop are drawn onto canvases at
runtime.

## The drawing

Radial distances and heights hold the textual figures at **1 m : 400,000 yojanas**,
with seven stated distortions — all of them listed in the index under *Notes on the
drawing* rather than applied silently. The largest are the outer salt ocean at half
its width, the twelve landmasses at forty times their size, and a 3.4× vertical
exaggeration above the water so that Meru reads as a mountain.

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

## Maṇḍala mode

The second control lays the world out heap by heap in the order the thirty-seven-point
offering names it, with the Tibetan, a phonetic reading and the English, and a player
that steps or runs through the verse.

Order and direction follow the diagram compiled by Lama Sonam Rinpoche (Ngöndro
retreat, Pema Ösel Ling, 2017). Heaps 18 to 37 have no place in the geography and are
drawn as rings outside the iron wall, in the eight directions the plate gives them.
The English translation is by Rigpa Translations, [Lotsawa House](https://www.lotsawahouse.org/tibetan-masters/chogyal-pakpa-lodro-gyaltsen/thirty-seven-point-mandala-offering),
[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).

## Sources

Vasubandhu, *Abhidharmakośa* & *bhāṣya* III.45–102 (La Vallée Poussin / Pruden);
Chim Jampaiyang, *Ornament of Abhidharma*; Jamgön Kongtrul, *Myriad Worlds*
(*Treasury of Knowledge* I); Mipham, *Gateway to Knowledge* II.
