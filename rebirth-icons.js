/* Artwork for the squares of the board.
 *
 * Every one of the hundred and four squares is drawn: the field it is on the
 * printed board — a ring, a cartouche, a continent's own outline, a mountain,
 * a temple — painted for this project and served as four atlas sheets. A
 * square's field shows in its cell on the 2D board, on a billboard at its
 * marker in the world, in the entry in the drawer, and on the card that
 * announces a throw.
 *
 * The convention follows the offering artwork this project already serves
 * (see mandala-offerings.js): one sheet holds several pictures in a grid of
 * ART_COLUMNS across, and a square names its sheet and its cell, counting
 * left to right and then down from zero. Sheets are fetched only when game
 * mode is first opened, and a sheet that fails can be retried on its own.
 * The sheets are built from the source paintings by
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
   full, and both the CSS and the UV arithmetic have to answer to that. */
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

/* The same cell as UVs, for a plane in the world. */
export function cellUV(art, rows) {
  const columns = ART_COLUMNS;
  const down = rows || sheetRows(art);
  const u = (art.cell % columns) / columns;
  const v = 1 - (Math.floor(art.cell / columns) + 1) / down;
  return { u, v, w: 1 / columns, h: 1 / down };
}

/* Billboards on the square markers, loaded on demand and retried on failure:
   a square's field standing where the square stands, turning to face the
   camera so it is legible from anywhere in the orbit. With nothing registered
   this builds nothing and reports no sheets. */
export function createSquareArt(THREE, ctx, onStatus = () => {}) {
  const planes = new Map();
  const sheets = new Map();
  for (const url of artSheets()) sheets.set(url, { state: 'idle', materials: [] });
  const report = () => onStatus([...sheets.values()].map((s) => s.state));

  const geometry = SQUARE_ART.size
    ? new THREE.PlaneGeometry(ctx.SUMMIT * 0.145, ctx.SUMMIT * 0.145)
    : null;

  function attach(holder, square) {
    const art = SQUARE_ART.get(square);
    if (!art) return null;
    const sheet = sheets.get(art.sheet);
    const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const plane = new THREE.Mesh(geometry.clone(), material);
    plane.name = 'rebirth_art_' + square;
    plane.userData.square = square;
    plane.userData.billboard = true;
    plane.position.y = ctx.SUMMIT * 0.13;
    const uv = cellUV(art);
    const attribute = plane.geometry.attributes.uv;
    for (let i = 0; i < attribute.count; i += 1) {
      attribute.setXY(i, uv.u + attribute.getX(i) * uv.w, uv.v + attribute.getY(i) * uv.h);
    }
    attribute.needsUpdate = true;
    sheet.materials.push(material);
    holder.add(plane);
    planes.set(square, plane);
    return plane;
  }

  function load() {
    sheets.forEach((sheet, url) => {
      if (sheet.state === 'loading' || sheet.state === 'ready') return;
      sheet.state = 'loading';
      report();
      new THREE.TextureLoader().load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        sheet.materials.forEach((material) => {
          material.map = texture;
          material.opacity = 1;
          material.needsUpdate = true;
        });
        sheet.state = 'ready';
        report();
      }, undefined, () => { sheet.state = 'failed'; report(); });
    });
  }

  // Billboards only turn if something turns them; the page does this each frame.
  function face(camera) {
    planes.forEach((plane) => plane.quaternion.copy(camera.quaternion));
  }

  return { attach, load, face, planes, sheets, states: () => [...sheets.values()].map((s) => s.state) };
}
