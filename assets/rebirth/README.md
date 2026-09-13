# Rebirth artwork import notes

This directory contains browser-ready derivatives of the project-owner-supplied PNG artwork in `Game of Liberation English titles`. The source originals remain untouched.

- `thumb/001.webp` through `thumb/104.webp`: 256×256 board textures, WebP quality 80 with alpha quality 100.
- `full/001.webp` through `full/104.webp`: 768×768 detail textures, WebP quality 84 with alpha quality 100.
- `rebirth-end.webp`: 1400×700 game-end artwork, WebP quality 86.
- `manifest.json`: the original filename, SHA-256 hash, byte size, and dimensions alongside the same facts for every generated derivative.

The import performs only proportional resizing and WebP compression. It does not crop, recolor, retouch, composite, or otherwise alter the composition. Run `node scripts/import-rebirth-artwork.mjs` from the project root to reproduce the derivatives from the sibling source folder. The importer rejects missing, duplicate, and out-of-range numeric prefixes, so board identities 1–104 must appear exactly once.

Regeneration uses macOS `/usr/bin/sips` for image dimensions and Homebrew `cwebp` at `/opt/homebrew/bin/cwebp`. Set `REBIRTH_CWEBP` to use another encoder location. The supplied numbered sources are square; replacement images are fitted proportionally inside the same size limits.
