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
