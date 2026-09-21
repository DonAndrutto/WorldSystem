// Run with `node scripts/build-locale.cjs <dir>` (no development dependencies).
//
// Folds a translator's worksheets into the Polish pack. The short strings —
// board names and interface — go into locales/pl.js between its marked lines;
// the long prose — the write-ups on the 104 squares and the cosmology entries
// — goes into locales/pl-texts.js, which the pack fetches only once Polish is
// the language in hand, so a reader in English is not served 300 KB of it.
//
// It reads, in <dir>:
//   names-57-104.tsv      number <TAB> English <TAB> Polish
//   squares-NN.pl.json    [{square, name?, note, full: [...]}]
//   terms-ui.pl.tsv       kind <TAB> English <TAB> Polish
//   game-states.pl.tsv    the same
//   entries-todo.pl.tsv   the same
// and the squares-NN.json beside them, to check each translation against its
// source. Anything missing is skipped and reported, so a half-finished set of
// worksheets still builds.
//
// Run `node scripts/build-sw.cjs` afterwards: the pack is part of the shelf.
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const MARK_OPEN = '/* ── written by scripts/build-locale.cjs — do not edit below ───────── */';
const MARK_CLOSE = '/* ── end of the generated table ─────────────────────────────────────── */';

const tags = html => (String(html).match(/<\/?[a-z][a-z0-9]*/gi) || [])
  .map(t => t.toLowerCase()).sort().join(',');

function readTsv(file, warn) {
  if (!fs.existsSync(file)) { warn.push('missing: ' + path.basename(file)); return []; }
  const rows = [];
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (!line || line.startsWith('#') || line.startsWith('##')) return;
    const cell = line.split('\t');
    if (cell.length < 3) return;
    const english = cell[1], polish = cell[2].trim();
    if (!english || !polish) return;
    if (tags(english) !== tags(polish)) {
      warn.push(path.basename(file) + ' line ' + (i + 1) + ': the markup differs from its source');
      return;
    }
    rows.push([english, polish]);
  });
  return rows;
}

function collect(dir) {
  const warn = [], short = new Map(), long = new Map();
  const put = (into, english, polish, where) => {
    if (!english || !polish) return;
    const had = into.get(english);
    if (had !== undefined && had !== polish) { warn.push(where + ': two Polish forms for ' + JSON.stringify(english.slice(0, 60))); return; }
    into.set(english, polish);
  };

  // The 48 board names the misaligned table lost. A worksheet is retyped and
  // pasted, and a curly quote comes back straight; the key has to be the board's
  // own string or it never matches anything, so the number decides and the
  // English column is only a check that the row is the row it says it is.
  const board = JSON.parse(fs.readFileSync(path.join(root, 'rebirth-board.js'), 'utf8')
    .match(/export const BOARD = (\{[\s\S]*?\});/)[1]);
  const square = new Map(board.squares.map(s => [s.n, s.name]));
  const bare = str => str.replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ').trim();
  if (!fs.existsSync(path.join(dir, 'names-57-104.tsv'))) warn.push('missing: names-57-104.tsv');
  else fs.readFileSync(path.join(dir, 'names-57-104.tsv'), 'utf8').split('\n').forEach((line, i) => {
    if (!line.trim() || line.startsWith('#')) return;
    const cell = line.split('\t');
    if (cell.length < 3 || !cell[2].trim()) return;
    const n = Number(cell[0]);
    const name = square.get(n);
    if (!name) { warn.push('names-57-104.tsv line ' + (i + 1) + ': no square ' + cell[0]); return; }
    if (bare(name) !== bare(cell[1])) {
      warn.push('names-57-104.tsv line ' + (i + 1) + ': square ' + n + ' is ' + JSON.stringify(name.slice(0, 50)) + ', not ' + JSON.stringify(cell[1].slice(0, 50)));
      return;
    }
    put(short, name, cell[2].trim(), 'names-57-104.tsv');
  });

  // the write-ups, checked paragraph by paragraph against their source
  for (let n = 1; n <= 8; n++) {
    const stem = 'squares-' + String(n).padStart(2, '0');
    const from = path.join(dir, stem + '.json'), to = path.join(dir, stem + '.pl.json');
    if (!fs.existsSync(to)) { warn.push('missing: ' + stem + '.pl.json'); continue; }
    const source = JSON.parse(fs.readFileSync(from, 'utf8'));
    const done = JSON.parse(fs.readFileSync(to, 'utf8'));
    if (source.length !== done.length) { warn.push(stem + ': ' + done.length + ' rows against ' + source.length); continue; }
    source.forEach((was, i) => {
      const now = done[i];
      if (now.square !== was.square) { warn.push(stem + ': row ' + i + ' is square ' + now.square + ', not ' + was.square); return; }
      if (was.square >= 57 && now.name) put(short, was.name, now.name, stem);
      put(long, was.note, now.note, stem + ' square ' + was.square);
      const full = now.full || [];
      if (full.length !== was.full.length) { warn.push(stem + ' square ' + was.square + ': ' + full.length + ' paragraphs against ' + was.full.length); return; }
      was.full.forEach((para, j) => {
        if (tags(para) !== tags(full[j])) { warn.push(stem + ' square ' + was.square + ' paragraph ' + j + ': the markup differs'); return; }
        put(long, para, full[j], stem + ' square ' + was.square);
      });
    });
  }

  for (const file of ['terms-ui.pl.tsv', 'game-states.pl.tsv']) {
    for (const [english, polish] of readTsv(path.join(dir, file), warn)) put(short, english, polish, file);
  }
  // the cosmology entries are prose and belong with the long file
  for (const [english, polish] of readTsv(path.join(dir, 'entries-todo.pl.tsv'), warn)) {
    put(english.length > 120 ? long : short, english, polish, 'entries-todo.pl.tsv');
  }

  // A phrase already settled in the pack keeps the form it has there — but the
  // block this script writes is not "already settled", or a second run would
  // read its own output back and find everything taken.
  let pack = fs.readFileSync(path.join(root, 'locales/pl.js'), 'utf8');
  const from = pack.indexOf(MARK_OPEN), until = pack.indexOf(MARK_CLOSE);
  if (from >= 0 && until > from) pack = pack.slice(0, from) + pack.slice(until);
  const held = new Set();
  for (const m of pack.matchAll(/^\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)')\s*:/gm)) held.add(m[1] !== undefined ? m[1] : m[2]);
  for (const map of [short, long]) for (const key of [...map.keys()]) {
    if (held.has(key.replace(/\\/g, '\\\\'))) { map.delete(key); }
  }
  return { short, long, warn };
}

const block = map => [...map.entries()]
  .map(([english, polish]) => '  ' + JSON.stringify(english) + ': ' + JSON.stringify(polish) + ',')
  .join('\n');

function main() {
  const dir = process.argv[2];
  if (!dir) { console.error('usage: node scripts/build-locale.cjs <worksheet dir>'); process.exitCode = 1; return; }
  const { short, long, warn } = collect(path.resolve(dir));

  const packFile = path.join(root, 'locales/pl.js');
  let pack = fs.readFileSync(packFile, 'utf8');
  const generated = MARK_OPEN + '\nObject.assign(T, {\n' + block(short) + '\n});\n' + MARK_CLOSE;
  const open = pack.indexOf(MARK_OPEN), close = pack.indexOf(MARK_CLOSE);
  if (open >= 0 && close > open) pack = pack.slice(0, open) + generated + pack.slice(close + MARK_CLOSE.length);
  else pack = pack.replace(/\nconst PATTERNS=\[/, '\n' + generated + '\nconst PATTERNS=[');
  fs.writeFileSync(packFile, pack);

  const textsFile = path.join(root, 'locales/pl-texts.js');
  const head = fs.readFileSync(textsFile, 'utf8').split('window.WorldSystemLocale')[0];
  fs.writeFileSync(textsFile, head + 'window.WorldSystemLocale && window.WorldSystemLocale.add({\n'
    + block(long) + '\n});\n');

  console.log('locales/pl.js holds ' + short.size + ' more phrases; locales/pl-texts.js holds ' + long.size + '.');
  if (warn.length) {
    console.log('\n' + warn.length + ' left out:');
    warn.slice(0, 40).forEach(w => console.log('  ' + w));
    if (warn.length > 40) console.log('  … and ' + (warn.length - 40) + ' more');
  }
}

module.exports = { collect };
if (require.main === module) main();
