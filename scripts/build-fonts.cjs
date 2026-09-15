// Run with `node scripts/build-fonts.cjs` (no development dependencies).
// Pulls the two typefaces out of Google Fonts and leaves them in the
// repository, so an installed copy of the page has its letters already.
//
// Only the cuts the page sets are taken, and only the latin and latin-ext
// subsets: between them they carry the Sanskrit diacritics (U+1E00–1E9F), and
// everything past them — the Tibetan, the drawing's arrows and wheels — has
// always fallen through to the stack's Georgia and monospace, which is where
// the unicode-range on each rule keeps it.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const out = path.join(root, 'assets/fonts');

// The same query the page asked Google for, before the letters moved in here.
const QUERY = 'family=EB+Garamond:ital,wght@0,400;0,500;1,400'
  + '&family=IBM+Plex+Mono:wght@400;500&display=swap';
const SUBSETS = ['latin', 'latin-ext'];

// Both faces are under the SIL Open Font License, which asks that the licence
// travel with the files; these are the notices Google publishes with them.
const LICENCES = [
  ['OFL-EB-Garamond.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/ebgaramond/OFL.txt'],
  ['OFL-IBM-Plex-Mono.txt', 'https://raw.githubusercontent.com/google/fonts/main/ofl/ibmplexmono/OFL.txt']
];

// Google serves woff2 only to a browser that says it can read it; asked by
// anything else it answers with ttf, three times the weight.
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  + ' (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const slug = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function get(url, as) {
  const response = await fetch(url, { headers: { 'user-agent': UA } });
  if (!response.ok) throw new Error(response.status + ' ' + response.statusText + ' — ' + url);
  return as === 'buffer' ? Buffer.from(await response.arrayBuffer()) : response.text();
}

// Each @font-face in the sheet is preceded by a comment naming its subset.
function faces(css) {
  const found = [];
  const pattern = /\/\*\s*([\w-]+)\s*\*\/\s*@font-face\s*\{([^}]*)\}/g;
  for (const [, subset, body] of css.matchAll(pattern)) {
    const field = name => (body.match(new RegExp(name + ':\\s*([^;]+);')) || [, ''])[1].trim();
    found.push({
      subset,
      family: field('font-family').replace(/^['"]|['"]$/g, ''),
      style: field('font-style'),
      weight: field('font-weight'),
      range: field('unicode-range'),
      url: (body.match(/url\(([^)]+)\)/) || [, ''])[1]
    });
  }
  return found;
}

async function main() {
  const css = await get('https://fonts.googleapis.com/css2?' + QUERY);
  const wanted = faces(css).filter(face => SUBSETS.includes(face.subset));
  if (!wanted.length) throw new Error('no @font-face rules matched — the sheet\'s shape has changed');

  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });

  // EB Garamond is drawn as one variable font, so its 400 and its 500 come
  // back as the same bytes. Written once, pointed at twice.
  const written = new Map();
  const rules = [];
  let bytes = 0;
  for (const face of wanted) {
    const data = await get(face.url, 'buffer');
    const digest = crypto.createHash('sha256').update(data).digest('hex');
    let file = written.get(digest);
    if (!file) {
      file = [slug(face.family), face.weight, face.style, face.subset].join('-') + '.woff2';
      await fs.writeFile(path.join(out, file), data);
      written.set(digest, file);
      bytes += data.length;
    }
    rules.push([
      '/* ' + face.family + ' ' + face.weight + ' ' + face.style + ' — ' + face.subset + ' */',
      '@font-face {',
      '  font-family: \'' + face.family + '\';',
      '  font-style: ' + face.style + ';',
      '  font-weight: ' + face.weight + ';',
      '  font-display: swap;',
      '  src: url(' + file + ') format(\'woff2\');',
      '  unicode-range: ' + face.range + ';',
      '}'
    ].join('\n'));
  }

  for (const [file, url] of LICENCES) await fs.writeFile(path.join(out, file), await get(url));

  const sheet = [
    '/* Built by `node scripts/build-fonts.cjs` — do not edit by hand.',
    '   EB Garamond and IBM Plex Mono, both under the SIL Open Font License 1.1,',
    '   in the latin and latin-ext cuts this page sets. The two notices are kept',
    '   beside the files, in OFL-EB-Garamond.txt and OFL-IBM-Plex-Mono.txt. */',
    '',
    ...rules,
    ''
  ].join('\n');
  await fs.writeFile(path.join(out, 'fonts.css'), sheet);

  console.log('Wrote ' + written.size + ' woff2 files (' + Math.round(bytes / 1024) + ' KB)'
    + ' for ' + rules.length + ' rules, two licences and fonts.css to assets/fonts/.');
  console.log('Re-run `node scripts/build-sw.cjs` so the service worker caches them.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
