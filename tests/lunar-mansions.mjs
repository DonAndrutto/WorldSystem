// Run with Node alone — no development dependencies.
// The catalogue against its authority: every figure the audit tabulates in
// docs/WHITE-BERYL-LUNAR-MANSIONS.md is read out of that document here and
// compared with lunar-mansions.js, so the two cannot drift apart unnoticed.
// Then the things the brief singles out, and the illustrative ring.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const L = await import(pathToFileURL(path.join(repo, 'lunar-mansions.js')));
const { MANSIONS, MANSION_BY_ID, RULERS, DIRECTIONS, ringAngle, directionOfAngle, glyphUrl } = L;
const audit = fs.readFileSync(path.join(repo, 'docs/WHITE-BERYL-LUNAR-MANSIONS.md'), 'utf8');
const checks = [];
const ok = (note) => checks.push(note);

/* ── the audit's own tables ──────────────────────────────────────────────── */
const rows = (heading) => {
  const at = audit.indexOf(heading);
  assert.ok(at >= 0, 'the audit has lost its section: ' + heading);
  const lines = audit.slice(at).split('\n');
  const start = lines.findIndex((l) => l.startsWith('|'));
  const out = [];
  for (const l of lines.slice(start + 2)) { if (!l.startsWith('|')) break; out.push(l.split('|').slice(1, -1).map((c) => c.trim())); }
  return out;
};
const plain = (s) => s.replace(/\s+/g, ' ').trim();

const table = rows('## 3. Source-form catalogue');
assert.equal(table.length, 28, 'the audit tabulates 28 mansions');
for (const [order, names, sanskrit, stars, , four, five, cite] of table) {
  const x = MANSIONS[Number(order) - 1];
  assert.equal(x.order, Number(order));
  const wylie = names.split('/').map((s) => s.trim()).filter((s) => /^[a-z’' ]+/.test(s) && !/[ༀ-࿿]/.test(s));
  assert.ok(wylie.some((w) => w.startsWith(x.wylie)), order + ': the audit names ' + names + ', the catalogue ' + x.wylie);
  assert.ok(names.includes(x.tibetan.replace(/་$/, '')), order + ': Tibetan script ' + x.tibetan);
  assert.equal(x.sanskrit, sanskrit, order + ' Sanskrit');
  assert.equal(x.stars.readable, stars === '—' ? null : Number(stars), order + ' readable star count');
  assert.equal(x.fourElement, four, order + ' four-element');
  assert.equal(x.fiveElement, five, order + ' five-element');
  const [line, page] = cite.match(/(\d+); p\. (\d+)/).slice(1).map(Number);
  assert.deepEqual([x.source.line, x.source.page], [line, page], order + ' line and page');
}
ok('28 records agree with the audit table: order, names, Sanskrit, readable stars, both element lists, line and page');

const rulerRows = rows('## 5. Seven planetary rulers');
assert.equal(rulerRows.length, 7);
for (const [ruler, list] of rulerRows) {
  const key = Object.keys(RULERS).find((k) => RULERS[k].en === ruler);
  assert.ok(key, 'a ruler the catalogue does not name: ' + ruler);
  const expected = list.split(',').map(plain).map((w) => w === 'dbyu gu' ? 'tha skar' : w).sort();
  const actual = MANSIONS.filter((x) => x.ruler === key).map((x) => x.wylie).sort();
  assert.deepEqual(actual, expected, ruler + ' rules four mansions');
}
ok('seven rulers, four mansions each, as L:12168–12173 assigns them');

const dirRows = rows('U pp. 257–258, lines 9430–9443');
const DIR = { East: 'E', Southeast: 'SE', South: 'S', Southwest: 'SW', West: 'W', Northwest: 'NW', North: 'N', Northeast: 'NE' };
assert.equal(dirRows.length, 8);
for (const [dir, list] of dirRows) {
  const expected = list.split(',').map(plain).map((w) => w === 'dbyu gu' ? 'tha skar' : w).sort();
  assert.deepEqual(MANSIONS.filter((x) => x.direction === DIR[dir]).map((x) => x.wylie).sort(), expected, dir);
}
ok('eight elemental directions, bra nye in the northeast, as U:9430–9443 groups them');

/* ── what the brief singles out ─────────────────────────────────────────── */
assert.equal(new Set(MANSIONS.map((x) => x.id)).size, 28, 'ids are unique');
assert.ok(MANSIONS.every((x) => /^lm_[a-z_]+$/.test(x.id)), 'ids are stable slugs, not positions');
assert.ok(MANSIONS.every((x, i) => x.order === i + 1), 'the array is in catalogue order');
assert.ok(Object.isFrozen(MANSIONS) && MANSIONS.every(Object.isFrozen), 'records are frozen');
const at = (w) => MANSIONS.findIndex((x) => x.wylie === w);
assert.ok(at('gro bzhin') + 1 === at('byi bzhin'), 'gro bzhin immediately precedes byi bzhin');
assert.deepEqual(MANSIONS.slice(-9).map((x) => x.wylie),
  ['chu stod', 'chu smad', 'gro bzhin', 'byi bzhin', 'mon dre', 'mon gru', 'khrums stod', 'khrums smad', 'nam gru']);
assert.ok(MANSION_BY_ID.get('lm_mon_dre').aliases.some((a) => a.wylie === 'mon gre'), 'mon gre kept as an alias only');
assert.ok(!MANSIONS.some((x) => x.wylie === 'mon gre'));
assert.match(MANSION_BY_ID.get('lm_lha_mtshams').form.en, /^Elephant/);
assert.match(MANSION_BY_ID.get('lm_byi_bzhin').form.en, /^Ox head/);
const nam = MANSION_BY_ID.get('lm_nam_gru');
assert.equal(nam.form.en, 'Boat'); assert.equal(nam.stars.readable, 32);
assert.equal(MANSION_BY_ID.get('lm_tha_skar').aliases[0].wylie, 'dbyu gu');
ok('gro bzhin before byi bzhin, mon dre spelled as the source spells it, elephant and ox head kept apart, a boat of 32 stars');

const secondary = MANSIONS.filter((x) => x.provenance === 'secondary').map((x) => x.wylie);
assert.deepEqual(secondary, ['snar ma', 'skag', 'nag pa', 'khrums smad']);
for (const x of MANSIONS) {
  assert.ok(['primary', 'secondary'].includes(x.provenance));
  assert.equal(x.form.provenance, x.provenance, x.id + ': the form carries the entry’s provenance');
  if (x.provenance === 'secondary') {
    assert.equal(x.form.source, '', x.id + ': no source phrase is claimed for a lost opening');
    assert.equal(x.stars.readable, null, x.id + ': no readable count is claimed for a lost opening');
    assert.ok(x.form.note, x.id + ' says why it is secondary');
  }
  if (x.stars.readable !== null) assert.equal(x.stars.secondary, null, x.id + ': a legible count needs no secondary one');
}
// the secondary counts the audit supplies, and only those
const sec = Object.fromEntries(MANSIONS.filter((x) => x.stars.secondary !== null).map((x) => [x.wylie, x.stars.secondary]));
assert.deepEqual(sec, { 'snar ma': 5, rgyal: 3, skag: 6, gre: 2, 'nag pa': 1, 'mon gru': 2, 'khrums smad': 2 });
ok('four secondary-supported forms, with provenance on the entry and the form; secondary counts held apart from readable ones');

for (const x of MANSIONS) {
  assert.ok(L.ELEMENTS_FOUR.includes(x.fourElement) && L.ELEMENTS_FIVE.includes(x.fiveElement), x.id + ' elements');
  assert.ok(RULERS[x.ruler], x.id + ' ruler'); assert.ok(DIRECTIONS[x.direction], x.id + ' direction');
  // the deity is a field of its own and never a ruler's key
  assert.ok(x.deity === null || typeof x.deity.wylie === 'string');
  assert.ok(x.deity === null || ['clear', 'uncertain', 'damaged'].includes(x.deity.status));
}
assert.equal(MANSION_BY_ID.get('lm_mchu').ruler, 'mars');
assert.equal(MANSION_BY_ID.get('lm_mchu').deity.wylie, 'spen pa');
const byi = MANSION_BY_ID.get('lm_byi_bzhin');
assert.deepEqual([byi.fourElement, byi.fiveElement, byi.ruler, byi.deity.wylie], ['earth', 'earth', 'moon', 'tshangs pa']);
assert.deepEqual([MANSION_BY_ID.get('lm_me_bzhi').fourElement, MANSION_BY_ID.get('lm_me_bzhi').fiveElement], ['wind', 'fire']);
assert.deepEqual([MANSION_BY_ID.get('lm_mon_gru').fourElement, MANSION_BY_ID.get('lm_mon_gru').fiveElement], ['earth', 'water']);
assert.equal(MANSIONS.filter((x) => x.deity === null).map((x) => x.wylie).join(), 'snar ma,khrums smad');
ok('four and five elements, ruler and deity separate: mchu ruled by Mars with Saturn as deity; byi bzhin ox head, Brahmā, earth twice, the Moon');

for (const x of MANSIONS) assert.ok(/[ༀ-࿿]/.test(x.tibetan) && x.tibetan.endsWith('་'), x.id + ' Tibetan script');
ok('Tibetan script on every name');

/* ── the ring ───────────────────────────────────────────────────────────── */
for (const x of MANSIONS) assert.equal(directionOfAngle(ringAngle(x.order)), x.direction, x.id + ' stands in its direction');
const angles = MANSIONS.map((x) => ringAngle(x.order));
const gaps = angles.map((a, i) => ((a - angles[(i + 1) % 28]) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI));
assert.ok(gaps.every((g) => Math.abs(g - 2 * Math.PI / 28) < 1e-9), 'equal places, running clockwise from above');
ok('equal ring places reproduce every source direction; the sequence runs east, south, west, north');

/* ── the glyphs are all there ───────────────────────────────────────────── */
for (const x of MANSIONS) {
  const file = path.join(repo, glyphUrl(x.id));
  assert.ok(fs.existsSync(file), 'no glyph for ' + x.id + ' at ' + glyphUrl(x.id));
  const head = fs.readFileSync(file).subarray(0, 12);
  assert.equal(head.toString('ascii', 8, 12), 'WEBP', glyphUrl(x.id) + ' is WebP');
}
ok('28 glyph files, one per id, WebP');

for (const c of checks) console.log('  ok  ' + c);
console.log('\n' + checks.length + ' checks passed.');
