# Offering artwork

The twenty-four illustrations were generated for this project with OpenAI's
built-in image-generation tool on 6 September 2026 and integrated on 7 September.
They are contemporary paintings informed by Tibetan visual traditions. They are
not photographs of historical objects, reproductions of the sources below, or
lineage-certified deity images. The source artworks were not copied into the app.

The earlier procedural figurines have been replaced by transparent painted illustrations. Meru and
the twelve continents retain their existing geometry. The four treasures use
illustrations in the offering views and retain their original meshes in the world view.
Illustrations face the camera in both recitation and the study tour, becoming
horizontal when seen directly from above. They float above their supports so
their lower edges do not intersect the plate or continent surfaces. Turning
the camera does not reveal sculpted backs or sides of the painted subjects.

The three WebP sheets total about 2.0 MB, loaded on first entering an offering
view. Each sheet is 1536 × 1024 pixels, with four columns and two rows. Each card
therefore has 384 × 512 pixels of source detail. The same textures are shared by
the scene illustrations; no separate cropped image files are required. Colours are kept
independent of scene lighting so the painted attributes remain readable at night.
Their alpha channels preserve the standalone silhouettes, without rectangular
backings or borders. Transparent pixels do not write to the scene depth buffer.
The painted cutouts render after the terrain without testing terrain depth,
so mountains and oceans cannot obscure them at low camera angles. This is a
diagram overlay for legibility, not physically correct occlusion of 3D objects.
The study tour isolates the current heap. Painted images fill 84% of the
limiting dimension of the available image area, with a separate strip below
for the heap number. Volumetric heaps keep their wider framing. Returning to
recitation or world view restores the surrounding geometry.

## Sources and their scope

- [The thirty-seven-point offering, Lotsawa House](https://www.lotsawahouse.org/tibetan-masters/chogyal-pakpa-lodro-gyaltsen/thirty-seven-point-mandala-offering): the offering names and sequence. The existing Rigpa Translations credit and CC BY-NC 4.0 link remain in the app. This text does not specify every painted pose, costume or colour.
- [Lama Sonam Rinpoche's 2017 diagram, Pema Ösel Ling](https://dudjomtersarngondro.com/wp-content/uploads/2017/12/37-pt-mandala-lsr.png): the app's numbered positions. The artwork sheets are asset grids, not alternative diagrams of ritual placement.
- [Seven Jewels of Royal Power, Himalayan Art Resources](https://www.himalayanart.org/search/set.cfm?setID=1176): the identity of the seven royal emblems.
- [Temple Banner with Seven Symbols of Royal Power and Offerings, Rubin Museum, C2012.4.4](https://rubinmuseum.org/collection/c2012-4-4/): a nineteenth-century Tibetan example of the royal emblems in painting. This supports the broad visual context, not an exact reconstruction of its costumes.
- [Mandala Offering, Lama Yeshe Wisdom Archive](https://www.lamayeshe.com/article/chapter/11-mandala-offering): descriptions of the golden many-spoked wheel, luminous blue jewel, adorned white elephant and horse, graceful bearing, and ceremonial parasol. Its directional arrangement differs from the diagram used by this app; those directions have not been imported.
- [Offering Goddess, Robert Beer Archive](https://tibetanart.com/artworks/84-offering-goddess): explains the eight offerings and the additional instrumental goddesses in larger groups. Its pictured figure is the flute-playing Vamsha, not one of the app's eight copied or relabelled.
- [Conch-holding figures, Himalayan Art Resources](https://www.himalayanart.org/search/set.cfm?setID=6476): documents offering vessels and distinguishes several goddess groupings. It includes conch shells and scented-water offerings; it is not a prescription for this entire set.

## Images and interpretive choices

| Heaps | Representation | Limits and adaptations |
| --- | --- | --- |
| 14–17 | Jewel mountain, wish-fulfilling tree, white cow, ripe grain | Enlarged for legibility. The treasure tree bears jewels and is kept distinct from the rose-apple tree. |
| 18 | Gold royal wheel | The visible spokes abbreviate the thousand-spoked textual description. They are not an exact count or an eight-spoked Dharma-wheel prescription. |
| 19 | Blue jewel with radiance | Painted facets interpret the precious gem; the image is not a geometric demonstration of eight facets. |
| 20–21 | Queen with lotus; minister with treasure casket | Dress, ornaments and these hand-held attributes are illustrative choices requiring further review before being described as obligatory. |
| 22–23 | White elephant and white horse | Natural animal forms with ceremonial harnesses. The elephant has one trunk and two tusks; it is not a six-tusked Samantabhadra mount. |
| 24–25 | Armoured general; golden treasure vase | Armour, weapons, silk and vase finial are pictorial interpretations. The text no longer says the displayed vase is closed by a tree. |
| 26 | Lāsyā, graceful bearing | Empty hands and a graceful pose replace the earlier mirror. |
| 27 | Mālā, garlands | A hanging flower garland distinguishes her from the bowl of blossoms at point 30. |
| 28 | Gītā, song | A singing figure replaces the earlier lute, keeping separate instrumental goddesses from being conflated with this group. |
| 29 | Nṛtyā, dance | Two arms, with a lifted leg and expressive gestures. The exact posture is interpretive. |
| 30–33 | Blossoms, incense, butter lamp, scented water | Each figure has its own offering. Scented water is shown in a conch shell. The palette and exact hand positions are not presented as lineage prescriptions. |
| 34–35 | Solar and lunar discs | The artwork uses warm and cool discs. The cosmological spheres are restored in world view. |
| 36–37 | White parasol and cylindrical victory banner | Fine hanging ornaments and silks improve recognition. Their exact construction and ornament are illustrative. |

All eight goddesses are painted as adult figures with one head and two arms.
The figures use ivory, gold, rose and pale green skin tones as a pictorial
palette. A practitioner should follow their own tradition's instructions for
specific colours and forms. These images have not been checked against a single
lineage's complete iconographic manual.

## Production record

The [generation briefs](assets/offerings/PROMPTS.md) record the intended subjects,
attributes, atlas order and visual direction. The generated images were visually
inspected for subject order, principal attributes and obvious limb errors. They
were then encoded to WebP. The royal and goddess sheets already contained alpha
channels, which the original opaque materials ignored. On 7 September 2026 the
renderer was corrected to use that transparency and the rectangular backings
were removed. The treasure sheet had an opaque blue background, so it received
a background-extraction edit with the built-in image tool, retaining the eight
subjects and their grid order. Its alpha was preserved in the WebP conversion.

Before presenting any fine detail as an authoritative practice instruction,
check it against the intended lineage's source and a qualified traditional
artist. In particular, colours, gestures, royal dress and precise ornament
remain open to refinement. Browser rendering and device usability are separate
checks from this iconographic review.
# App icon

The gold-and-lapis Meru emblem was generated with OpenAI's built-in image tool
on 2026-09-11, using the previous app icon as an identity reference. Its source
brief, simplified ring count, and export details are recorded in
[the app-icon notes](assets/app-icon/README.md). The interactive model retains
all seven golden ranges. The emblem is used for home-screen and browser icons.

## The fields of the board of liberation

Each of the 104 squares of the board of rebirth carries the field it is drawn
as on the printed board — a coloured ring, a cartouche, a continent's own
outline, a mountain, a temple, a ribbon — together with one closing painting,
*Amitābha, the stupa and the Guru*, for the end of the game. They were supplied
for this project as 105 source PNGs with transparent grounds, and they live in
the repository at `assets/Game of Liberation English titles/`.

Squares 18 and 19, the western and eastern continents, were supplied again
later as the plain shapes the sources give them — a ruby-red disc and a
crystal-white half-disc — in place of the cartouches first sent for them. The
paintings they replace are in the repository's history.

`node scripts/build-square-art.cjs` turns them into what the page serves. Each
painting is cropped to the pixels it actually draws — the sources carry wide and
uneven transparent margins — then set in the middle of a 320-pixel square cell
with an even border, so every square's field reads at the same size wherever it
is shown. The cells are laid out four across and at most seven down in square
order, which gives four WebP sheets of about 1.4 MB in total: three of 4 × 7 and
one of 4 × 5. The closing painting keeps its own file and its own proportions.
Nothing is fetched until game mode is first opened, and a sheet that fails can
be retried on its own.

A field is shown four ways: as the cell's own ground on the 2D board, with the
square's name set inside it; on a billboard at the square's marker in the world,
turning to face the camera; in the entry in the drawer; and on the card that
announces a throw. The closing painting appears only on the card that declares
victory and on the stupa throw that follows it.

The Tibetan name of every square was supplied with the artwork and is recorded
in `rebirth-board.js` beside the English titles, keyed by square number. The two
sets of names are independent: the app shows one or the other in passing, and
both in the entry.

## The 28 lunar mansion glyphs

`assets/mansions/` holds one glyph for each of the twenty-eight lunar mansions
of White Beryl. They were drawn for this project on 29 September 2026 as small
SVG line drawings, written in `scripts/build-mansion-glyphs.cjs`; the drawings'
SVG sources are kept in `assets/mansions/src/` and are not served. No image
generator, photograph, manuscript, thangka or printed illustration was copied or
traced. Each glyph draws the form given in the mansion's own passage (L pp.
313–328), as translated in [the audit](docs/WHITE-BERYL-LUNAR-MANSIONS.md): a
contemporary interpretation of a textual description, not a reconstruction of
any historical witness's picture.

One hand for the set: a single ink line of one weight (#2b2a40), one gold fill
(#e3bf66) and a paler gold, on a soft ivory halo that keeps the glyph legible over
the day sky and the night sky. The ring round each glyph is solid where the form
is read in the supplied OCR and **dashed where it follows the secondary table**,
so provenance shows without colour. Gold nodes along the foot of the ring give
the star count **only where the OCR makes it legible**; they are a count, not the
stars' arrangement, which the text does not give. Nam gru's thirty-two go round
the ring.

| Glyph | Follows | Interpretive choices |
| --- | --- | --- |
| tha skar | “horse head and neck” | Profile, mane as short strokes. |
| bra nye | “vulva / female genital form” | Kept to a plain almond with a single line: symbolic and restrained. |
| smin drug | “razor” | An open razor, blade and handle. |
| snar ma | cart — **secondary** | An ox-cart with solid wheels, pole and yoke. The opening line is lost in the OCR. |
| mgo | “deer head” | Frontal, with antlers. |
| lag | “point, round spot (thig le)” | A disc inside a thin ring. |
| nabs so | “throne leg” | A turned, footed leg. |
| rgyal | *rgyal ni skar gsum ril ba'i dbyibs*, “three stars, a rounded form” (owner's correction of the OCR) | A plain round form with a shadow and three star nodes; no drop shape is claimed. |
| skag | expanded serpent hood — **secondary** | A hooded serpent with forked tongue and coils. |
| mchu | “like a river” | A winding band with a current line. |
| gre | “like a human leg” | A leg in profile. |
| dbo | “throne” | A throne with back, seat and legs. |
| me bzhi | “hand” | An open hand. |
| nag pa | lotus seed-head — **secondary** | A lotus pod with seeds on its face. |
| sa ri | “jewel” | A faceted gem. |
| sa ga | *ra mgo'i dbyibs*, goat head (owner's correction of the OCR's *ri mgo*) | A goat head: long face, curved horns, beard. |
| lha mtshams | *glang po*, elephant | A whole elephant in profile, kept distinct from byi bzhin's ox head. |
| snon | “steps, ladder” | A ladder. |
| snubs | “scorpion” | From above, with claws and a curled tail. |
| chu stod | “stūpa” | A Tibetan stūpa with steps, dome, spire, parasol, moon and sun. |
| chu smad | “grain measure (bre)” | Filled with grain, after its passage's “life-star of grain” (*'bru yi bla*, L:10488) — the textual detail that tells it from gro bzhin. |
| gro bzhin | “grain measure (bre)” | The same measure, empty, its inside showing. |
| byi bzhin | *glang mgo*, ox head | Frontal, broad muzzle, wide horns. |
| mon dre | “like a bird” | A perched bird. |
| mon gru | “heap of flowers” | Six blossoms piled on a line; the damaged person-like alternative is not drawn. |
| khrums stod | “cart” | A chariot on one spoked wheel, to stand apart from snar ma's secondary cart. |
| khrums smad | ear — **secondary** | A human ear. |
| nam gru | “boat”, 32 stars | A boat with a sail over water. |

No deity is portrayed: the passages name deities but prescribe no bodies,
faces, attributes or colours, and none is invented. Colour, line, halo and
ornament are artistic treatment; the textual form and the star count are the
source data.

`node scripts/build-mansion-glyphs.cjs` renders each drawing to 256 × 256 pixels,
quantises it to a 256-colour palette and stores it as lossless WebP: 148 KB for
all 28. The same set was compared as lossy WebP (quality 82, about 400 KB) and
as 32-bit PNG (909 KB); at twice the served size the palette version could not
be told from the full-colour render on day or night skies. `--compare` writes
the PNGs again for that comparison. Decoded on the graphics card the set is
about 9.8 MB with mipmaps (28 × 256 × 256 × 4 bytes × 4⁄3); it is fetched only
when the layer is first shown.

## Cloud and sky treatment

The cloud renderer was revised using the two reference images supplied by the
user, `IMG_4746.webp` and `IMG_4747.jpeg`: Tibetan painted clouds with scalloped
silhouettes, internal spiral ribbons, mineral-colour bands and fine ivory edges.
The artwork is drawn procedurally on canvas. No generated cloud image, copied
reference image or external image service is loaded by the app. The day/night
WebP images in `assets/sky/` are review previews of those canvas textures.

## Selectable travelers

`assets/rebirth/travelers.png` is a generated transparent 6 × 2 atlas for twelve
selectable player characters: male and female Bhutanese, Tibetan, Indian,
Chinese, Thai and Western travelers. The CSS and Three.js billboards use the same
figures. These contemporary game illustrations are separate from the historical
board fields. See [GAME-UI.md](GAME-UI.md#character-artwork) for provenance and
the full generation prompt.

## The wheel of life

The wheel of life is the painted clay relief of five photographs the author
supplied, kept in `assets/wheel-reference/`: the whole wall, and close views of
the upper wheel under Yama's head, the human realm, the pretas' realm with the
cold hells, and the hub with the ring of karma. The page shows the relief
itself, from those photographs; the figures, colours and composition are the
relief's, not this project's.

`scripts/build-wheel-relief.py` makes what is served from them, in
`assets/wheel/`, and changes them in these ways only:

- **The camera's angle is corrected.** The photograph was taken from below, and
  the wheel's rims came out as ellipses on different centres. A radial warp puts
  them back on one centre as circles. Outside the rim the photograph is left as
  it is.
- **The close-ups replace the whole photograph where they cover it**, registered
  onto it and warped through the same correction, so that those parts can be
  seen closer.
- **The relief is cut into layers** that the view stands at different depths.
  The wall itself is made from the strip of it just beside the relief — the
  blue the eye compares everything else with — less the shadow the relief
  throws on it: under the relief it is filled in from that strip, and past the
  photograph's edges it is carried out and eases into the colour of its light
  at each height, the strip's own median there, so that the wall seen round
  the relief at any zoom or turn is the blue beside it. The photograph's own
  wall further out, which darkens toward its frame, and the pale ledge along
  its bottom edge are not used. Behind the wheel, which no photograph shows, is
  Yama's body, in his maroon as measured just outside the rim. The fills under
  the relief are only ever seen at the edges of a layer when the wall is
  turned.
- **The photograph's own edges are faded**, where it cuts through a cloud or a
  figure at the edge of the frame.

Nothing is drawn, painted or generated in the relief's place. What is drawn is
the outline of each part over it, in `wheel-parts.js`, and those are traced on
the corrected photograph: the rims, spokes and dividers where they were measured,
the outlines of Yama, his scarves, his bone ornaments and the offering bowl where
the script found them by colour, and the rest by hand. The eight hot hells and
the eight cold are outlined as the rows the relief sets them in, counted from the
spoke; the relief does not label its rows, and the entries say so.

The figures at the edges of the wall — a flying figure in red at the upper
right, the edge of a white face at the upper left — belong to the painting that
continues beyond the photograph. They are shown as they are seen and are not
identified.
