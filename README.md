# WorldSystem

An interactive 3D model of the Buddhist world-system — འཇིག་རྟེན་གྱི་ཁམས། (*'jig rten gyi khams*) —
built for translators. Mount Meru on its golden ground, the seven golden mountain
walls and the seven seas between them, the great salt ocean with the four continents
and their eight satellites, the iron rim that closes the world, the sun and moon on
their circuit, and the abodes stacked above.

Every feature carries its Tibetan (Unicode and Wylie), Sanskrit, English and Polish
names, its measurements in དཔག་ཚད། (*dpag tshad*, yojana), and a note on where the
tradition sets it and why the term is rendered the way it is.

## Files

| file | what it is |
| --- | --- |
| `world-system.html` | The page: the cosmology, the terminology, and all of the interface. Open it in a browser — nothing to build or install. |
| `three-d-stage.js` | A small, dependency-light 3D stage on top of three.js: renderer, damped orbit controls, lighting, starfield, an HTML label layer that tracks 3D anchors and declutters itself, pointer picking, and a resize-aware render loop. Reusable on its own. |

`world-system.html` loads three.js r128 from a CDN (cdnjs, falling back to jsDelivr),
so the first load needs a network connection. Everything else is local.

## What you can do with it

- **Click anything** in the model, or search a term in the panel, to open its entry:
  Tibetan, Sanskrit, Wylie, English, Polish, the canonical measurements, and the source.
- **Switch the label language** between English, Tibetan, Sanskrit, Wylie and Polish.
- **Switch the scale.** *Legible* compresses the radii so the seven walls stay readable,
  the way a painted maṇḍala does. *To scale* divides every canonical figure by a single
  constant — 5,000 yojanas to the unit — and the continents come out as specks. Both are
  true to the sources; they answer different questions.
- **Switch Meru's profile** between the Abhidharmakośa's straight square column and the
  Kālacakra's tapered mountain, when a text has to be pinned to one tradition.
- **Cut the model open** (`C`) to see the section: the water column, the mountains sunk
  to the golden ground, and Meru's submerged half.
- **Switch the orientation** between cartographic (north up) and the maṇḍala convention
  (east toward the practitioner).
- **Toggle layers** — including the abodes above and the elemental maṇḍalas below, which
  are off by default.
- **Read the thirty-seven heaps** of the maṇḍala offering alongside the model; the
  thirteen that have a place on the ground plan highlight it when you hover them.

Keyboard: `1`–`4` views · `L` labels · `C` cutaway · `R` turn · `/` search · `Esc` clear.

## Sources

Measurements and arrangement follow the Abhidharmakośa and its Bhāṣya, chapter III
(loka-nirdeśa), verses 45–74 — the account the Tibetan commentarial tradition inherits
as མཛོད། (*mdzod*). Where the Kālacakra system differs, the entries say so rather than
silently picking one. The four formless attainments are deliberately given no storey:
they are states, not places, and a diagram that stacks them above the form realm has
already mistranslated them.
