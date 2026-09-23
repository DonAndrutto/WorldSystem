// Run with `node scripts/build-sw.cjs` (no development dependencies).
// Writes the list of files the service worker puts by, and the version it
// files them under, into the marked block at the top of sw.js.
//
// The version is a digest of the worker's own logic together with the contents
// of every file listed, so it changes exactly when something an installed copy
// holds has changed — and does not change when nothing has. Running this twice
// over an untouched tree leaves no diff.
//
// Run it after anything the page serves itself is edited: the page, a module,
// a painted sheet, the fonts, the vendored library. Then commit sw.js with the
// rest; the GitHub Pages deploy is still nothing but the files in the tree.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');

// Everything the running page asks for. The source artwork under
// assets/Game of Liberation English titles/, assets/app-icon/ and
// assets/wheel-reference/, and the flat sky previews, are the material the
// build scripts eat — no visitor fetches
// them, and an installed app has no use for the 28 MB.
const SHELL = [
  'index.html', 'game-ui.css',
  'manifest.webmanifest',
  ['.', /\.js$/, { skip: ['sw.js'] }],        // the page's modules and the stage
  ['locales', /\.js$/],                       // language packs loaded by the page
  ['vendor', /\.js$/, { deep: true }],        // three.js, vendored beside them
  ['assets/fonts', /\.(css|woff2)$/],
  ['assets/offerings', /\.webp$/],            // the three offering sheets
  ['assets/rebirth', /\.(webp|png)$/],              // the board's four field sheets
  ['assets/wheel', /\.webp$/],                // the wheel of life, in its layers
  'apple-touch-icon.png', 'favicon.ico', 'favicon-32.png',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'
];

const MARK_OPEN = '/* ── written by scripts/build-sw.cjs — do not edit below ─────────────── */';
const MARK_CLOSE = '/* ── end of the written part ─────────────────────────────────────────── */';

// Flat unless the rule asks to go deeper: the root holds the page's own
// modules, and walking it whole would sweep in the build scripts and the tests.
async function list(dir, test, { skip = [], deep = false } = {}) {
  const found = [];
  for (const entry of await fs.readdir(path.join(root, dir), { withFileTypes: true })) {
    const rel = dir === '.' ? entry.name : dir + '/' + entry.name;
    if (skip.includes(rel)) continue;
    if (entry.isDirectory()) { if (deep) found.push(...await list(rel, test, { skip, deep })); }
    else if (test.test(entry.name)) found.push(rel);
  }
  return found;
}

// The whole of the decision, with nothing written: what would go into sw.js,
// and what it would weigh. tests/offline.mjs calls this to check that what is
// committed is what this script would write.
async function plan() {
  const files = [];
  for (const rule of SHELL) {
    if (typeof rule === 'string') files.push(rule);
    else files.push(...await list(rule[0], rule[1], rule[2]));
  }
  files.sort();
  if (new Set(files).size !== files.length) throw new Error('a file is listed twice');

  const digest = crypto.createHash('sha256');
  let bytes = 0;
  for (const file of files) {
    const data = await fs.readFile(path.join(root, file));
    bytes += data.length;
    digest.update(file).update(crypto.createHash('sha256').update(data).digest());
  }

  const worker = path.join(root, 'sw.js');
  const source = await fs.readFile(worker, 'utf8');
  const open = source.indexOf(MARK_OPEN), close = source.indexOf(MARK_CLOSE);
  if (open < 0 || close < open) throw new Error('the markers in sw.js are gone');

  // The worker's own logic counts toward the version as much as the files do:
  // a change to how the shelf is read is a change to what is installed.
  const head = source.slice(0, open), tail = source.slice(close);
  const version = digest.update(head).update(tail).digest('hex').slice(0, 16);

  const written = [
    MARK_OPEN,
    'const VERSION = \'' + version + '\';',
    'const SHELL = [',
    files.map(file => '  ' + JSON.stringify(file)).join(',\n'),
    '];'
  ].join('\n') + '\n';
  return { files, bytes, version, worker, source: head + written + tail };
}

async function main() {
  const { files, bytes, version, worker, source } = await plan();
  await fs.writeFile(worker, source);
  console.log('sw.js holds ' + files.length + ' files, '
    + (bytes / 1048576).toFixed(1) + ' MB, as version ' + version + '.');
}

module.exports = { plan };
if (require.main === module) {
  main().catch(error => { console.error(error.message || error); process.exitCode = 1; });
}
