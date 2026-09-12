/* Artwork for the squares of the board — the slot, not the art.
 *
 * There is no iconography here yet. When it is painted, a square gets a
 * picture by one line in SQUARE_ART and nothing else changes: the 2D cell
 * shows it in the corner, the marker in the world carries it on a billboard
 * that turns to face the camera, and the entry in the drawer shows it whole.
 *
 * The convention follows the offering artwork this project already serves
 * (see mandala-offerings.js): one sheet holds several pictures in a grid of
 * ART_COLUMNS across, and a square names its sheet and its cell, counting
 * left to right and then down from zero. Sheets are fetched only when game
 * mode is first opened, and a sheet that fails can be retried on its own.
 *
 *   registerSquareArt([
 *     [17, 'assets/rebirth/continents.webp', 0, 'Jambudvīpa, after a 19th-c. Central Tibetan block print'],
 *     [20, 'assets/rebirth/continents.webp', 1, 'Uttarakuru, from the same sheet'],
 *   ]);
 *
 * Put the attribution in: ARTWORK.md records provenance for everything this
 * project serves, and a square's picture is no exception.
 */

export const ART_COLUMNS = 4;

/* square number -> { sheet, cell, attribute } */
export const SQUARE_ART = new Map();

export function registerSquareArt(records) {
  for (const [square, sheet, cell, attribute] of records) {
    SQUARE_ART.set(Number(square), { sheet, cell: Number(cell), attribute: attribute || '' });
  }
  return SQUARE_ART;
}

export const artSheets = () => [...new Set([...SQUARE_ART.values()].map((a) => a.sheet))];

/* Where a cell sits on its sheet, as a CSS background-position pair. */
export function cellBackground(art) {
  const columns = ART_COLUMNS;
  const x = (art.cell % columns) / (columns - 1) * 100;
  const y = Math.floor(art.cell / columns) * 100;
  return { position: x + '% ' + y + '%', size: (columns * 100) + '% auto' };
}

/* The same cell as UVs, for a plane in the world. */
export function cellUV(art, rows) {
  const columns = ART_COLUMNS;
  const down = rows || Math.max(1, Math.ceil(([...SQUARE_ART.values()]
    .filter((a) => a.sheet === art.sheet)
    .reduce((m, a) => Math.max(m, a.cell), 0) + 1) / columns));
  const u = (art.cell % columns) / columns;
  const v = 1 - (Math.floor(art.cell / columns) + 1) / down;
  return { u, v, w: 1 / columns, h: 1 / down };
}

/* Billboards on the square markers, loaded on demand and retried on failure.
   With no art registered this builds nothing and reports no sheets, which is
   the state the project ships in. */
export function createSquareArt(THREE, ctx, onStatus = () => {}) {
  const planes = new Map();
  const sheets = new Map();
  for (const url of artSheets()) sheets.set(url, { state: 'idle', materials: [] });
  const report = () => onStatus([...sheets.values()].map((s) => s.state));

  const geometry = SQUARE_ART.size
    ? new THREE.PlaneGeometry(ctx.SUMMIT * 0.11, ctx.SUMMIT * 0.11)
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
    plane.position.y = ctx.SUMMIT * 0.10;
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
