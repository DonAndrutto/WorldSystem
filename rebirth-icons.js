/* Artwork for the squares of the board.
 *
 * Every one of the hundred and four squares is drawn: the field it is on the
 * printed board — a ring, a cartouche, a continent's own outline, a mountain,
 * a temple — painted for this project and served as four atlas sheets. A
 * square's field shows in its cell on the 2D board, in the entry in the
 * drawer, and on the card that announces a throw. In the world the squares
 * stand as models instead, built from these fields (square-models.js).
 *
 * The convention follows the offering artwork this project already serves
 * (see mandala-offerings.js): one sheet holds several pictures in a grid of
 * ART_COLUMNS across, and a square names its sheet and its cell, counting
 * left to right and then down from zero. The sheets are built from the source paintings by
 * `node scripts/build-square-art.cjs`; SQUARES_PER_SHEET must agree with it.
 *
 * ARTWORK.md records provenance for everything this project serves, the
 * fields included.
 */

export const ART_COLUMNS = 4;
export const SQUARES_PER_SHEET = 28;          // ART_COLUMNS × 7 rows
export const SQUARE_COUNT = 104;
export const ART_ATTRIBUTION =
  'The field this square is drawn as on the board of liberation';

/* The painting shown when the game is over: Amitābha, the stupa the relics
   pass into, and the Guru. It belongs to no square and is shown whole. */
export const LIBERATION_ART = {
  url: 'assets/rebirth/liberation.webp',
  attribute: 'Amitābha, the stupa and the Guru — the end of the game'
};

/* Where a square's field lives, given only its number. The sheets are filled
   in square order, so nothing else has to be written down. */
export function boardArtwork(count = SQUARE_COUNT) {
  const records = [];
  for (let n = 1; n <= count; n += 1) {
    const i = n - 1;
    records.push([n, 'assets/rebirth/squares-' + (Math.floor(i / SQUARES_PER_SHEET) + 1) + '.webp',
                  i % SQUARES_PER_SHEET, ART_ATTRIBUTION]);
  }
  return records;
}

/* square number -> { sheet, cell, attribute } */
export const SQUARE_ART = new Map();

export function registerSquareArt(records) {
  for (const [square, sheet, cell, attribute] of records) {
    SQUARE_ART.set(Number(square), { sheet, cell: Number(cell), attribute: attribute || '' });
  }
  return SQUARE_ART;
}

export const artSheets = () => [...new Set([...SQUARE_ART.values()].map((a) => a.sheet))];

registerSquareArt(boardArtwork());

/* How many rows of cells a sheet turned out to hold. The last sheet is rarely
   full, and the CSS arithmetic has to answer to that. */
export function sheetRows(art) {
  return Math.max(1, Math.ceil(([...SQUARE_ART.values()]
    .filter((a) => a.sheet === art.sheet)
    .reduce((m, a) => Math.max(m, a.cell), 0) + 1) / ART_COLUMNS));
}

/* Where a cell sits on its sheet, as a CSS background-position pair. Percentage
   positions align the same fraction of the image with that fraction of the box,
   so a cell's share is its index over one less than the count — not its index
   times a hundred, which only happens to agree when there are two of them. The
   box has to be square, since the size keeps the sheet's own proportions. */
export function cellBackground(art, rows) {
  const columns = ART_COLUMNS;
  const down = rows || sheetRows(art);
  const x = (art.cell % columns) / Math.max(1, columns - 1) * 100;
  const y = Math.floor(art.cell / columns) / Math.max(1, down - 1) * 100;
  return { position: x + '% ' + y + '%', size: (columns * 100) + '% auto' };
}
