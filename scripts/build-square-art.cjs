// Run with `node scripts/build-square-art.cjs` (development dependency: sharp).
//
// The board of rebirth ships one painting per square. Served one file at a
// time that is a hundred and five requests and twenty-eight megabytes; served
// as atlases it is four sheets fetched once, when game mode is first opened.
// This turns `assets/Game of Liberation English titles/` into those sheets.
//
// Each painting is cropped to what it actually draws — the sources carry a
// wide transparent margin, and different margins at that — and then set in the
// middle of a square cell with a small even border, so that every square's art
// reads at the same size on the board, on its marker in the world, and in the
// entry. Sheets are ART_COLUMNS wide and no more than SHEET_ROWS deep, filled
// in square order, which is the arrangement rebirth-icons.js reads back.
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'assets/Game of Liberation English titles');
const out = path.join(root, 'assets/rebirth');

const SQUARES = 104;
const COLUMNS = 4;              // must equal ART_COLUMNS in rebirth-icons.js
const SHEET_ROWS = 7;           // 28 squares a sheet, so four sheets hold 104
const CELL = 320;               // one square's painting, at its largest use
const MARGIN = 0.035;           // breathing room inside the cell, as a fraction
const QUALITY = 78;

/* Where a painting actually draws, rather than where its canvas ends. The
   transparent border is not the same on any two of them. */
async function contentBox(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let left = width, right = -1, top = height, bottom = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * channels + 3] < 8) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return { left: 0, top: 0, width, height };
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

/* One painting, cropped to its content and centred in a transparent cell. */
async function cell(file, size) {
  const box = await contentBox(file);
  const inner = Math.round(size * (1 - MARGIN * 2));
  const art = await sharp(file).extract(box)
    .resize(inner, inner, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const { width, height } = await sharp(art).metadata();
  return sharp({
    create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite([{
    input: art,
    left: Math.round((size - width) / 2), top: Math.round((size - height) / 2)
  }]).png().toBuffer();
}

function sourceFor(files, n) {
  const match = files.find((f) => Number(f.split(' - ')[0]) === n);
  if (!match) throw new Error('no painting for square ' + n);
  return path.join(source, match);
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const files = fs.readdirSync(source).filter((f) => f.endsWith('.png'));
  const perSheet = COLUMNS * SHEET_ROWS;
  const sheets = Math.ceil(SQUARES / perSheet);

  for (let sheet = 0; sheet < sheets; sheet += 1) {
    const first = sheet * perSheet + 1;
    const count = Math.min(perSheet, SQUARES - sheet * perSheet);
    const rows = Math.ceil(count / COLUMNS);
    const tiles = [];
    for (let i = 0; i < count; i += 1) {
      const n = first + i;
      tiles.push({
        input: await cell(sourceFor(files, n), CELL),
        left: (i % COLUMNS) * CELL, top: Math.floor(i / COLUMNS) * CELL
      });
      process.stdout.write('\rsquare ' + n + '/' + SQUARES + '  ');
    }
    const file = path.join(out, 'squares-' + (sheet + 1) + '.webp');
    await sharp({
      create: {
        width: COLUMNS * CELL, height: rows * CELL, channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    }).composite(tiles).webp({ quality: QUALITY, alphaQuality: 90, effort: 6 }).toFile(file);
    console.log('\n' + path.relative(root, file), COLUMNS + '×' + rows, 'cells',
      (fs.statSync(file).size / 1024).toFixed(0) + 'KB');
  }

  // The end of the game has one painting of its own and no square to sit on:
  // Amitābha, the stupa the relics pass into, and the Guru. It is wide, and it
  // is shown whole, so it keeps its own file and its own proportions.
  const closing = path.join(source, 'Amitabha Stupa Guru.png');
  const file = path.join(out, 'liberation.webp');
  await sharp(closing).resize(1440, null, { fit: 'inside' })
    .webp({ quality: 82, effort: 6 }).toFile(file);
  console.log(path.relative(root, file), (fs.statSync(file).size / 1024).toFixed(0) + 'KB');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
