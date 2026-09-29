// Run with Node alone — the engine is vendored (vendor/astronomy-engine@2.1.19).
// The calculator's engine through its adapter (jyotisha-engine.js), checked
// against three kinds of reference:
//   1. reference charts computed with the Swiss Ephemeris before it was
//      removed from this project (tests/fixtures/swiss-ephemeris-reference.json:
//      numbers only — an independent ephemeris and an independent
//      implementation of the Lahiri ayanamsa);
//   2. an independent lunar and solar theory (tests/fixtures/meeus.mjs);
//   3. the published table the owner supplied (docs/List_of_Nakshatras.docx,
//      from Wikipedia's List of Nakshatras): the Vimshottari lords and the
//      sector boundaries.
// Tolerances: the Moon's nirayana longitude 10″ against the Swiss Ephemeris
// charts and 20″ against the Meeus theory (whose own accuracy is ~10″); the
// Lahiri ayanamsa 1″ against the Swiss Ephemeris's SE_SIDM_LAHIRI.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const J = await import(pathToFileURL(path.join(repo, 'jyotisha.js')));
const { createEngine, calculateNakshatra, EngineError, ENGINE } = await import(pathToFileURL(path.join(repo, 'jyotisha-engine.js')));
const { meeus, nirayana } = await import(pathToFileURL(path.join(repo, 'tests/fixtures/meeus.mjs')));
const swiss = JSON.parse(fs.readFileSync(path.join(repo, 'tests/fixtures/swiss-ephemeris-reference.json'), 'utf8'));
const libUrl = pathToFileURL(path.join(repo, 'vendor/astronomy-engine@2.1.19/astronomy.js')).href;
const checks = [];
const ok = (note) => checks.push(note);
const arcsec = (a, b) => ((((a - b) % 360) + 540) % 360 - 180) * 3600;
const S = 360 / 27;

const engine = createEngine({ load: () => import(libUrl) });
await engine.init();

/* ── what is served, and who imports it ─────────────────────────────────── */
const head = fs.readFileSync(path.join(repo, 'vendor/astronomy-engine@2.1.19/astronomy.js'), 'utf8').slice(0, 2000);
assert.match(head, /MIT License/); assert.match(head, /Copyright \(c\) 2019-2023 Don Cross/);
assert.deepEqual([ENGINE.package, ENGINE.version, ENGINE.licence], ['astronomy-engine', '2.1.19', 'MIT']);
const importers = fs.readdirSync(repo).filter((f) => f.endsWith('.js') && f !== 'sw.js')
  .filter((f) => fs.readFileSync(path.join(repo, f), 'utf8').includes('astronomy-engine@'));
assert.deepEqual(importers, ['jyotisha-engine.js'], 'only the adapter reaches the engine');
for (const gone of ['vendor/panchangam@0.2.1', 'scripts/vendor-panchangam.cjs']) assert.ok(!fs.existsSync(path.join(repo, gone)), gone + ' is gone');
const served = fs.readFileSync(path.join(repo, 'sw.js'), 'utf8') + fs.readFileSync(path.join(repo, 'index.html'), 'utf8');
assert.ok(!/panchangam|swiss-?eph|swisseph|\.wasm/i.test(served), 'nothing of the removed engine is served or cached');
ok('astronomy-engine 2.1.19 (MIT, licence text in the file), imported only by the adapter; nothing of the removed engine served, cached or pinned');

/* ── 1. the reference charts ────────────────────────────────────────────── */
const dayOf = (ymd, basis) => { const d = J.parseDate(ymd); const [start, end] = J.localDayBounds(d, basis); return { date: d, start, end }; };
const lines = [];
for (const c of swiss.charts) {
  const ms = Date.parse(c.utc);
  const r = await engine.calculate({ utcMs: ms, latitude: c.lat, longitude: c.lon, day: dayOf(c.date, { zone: c.zone }) });
  assert.deepEqual([r.nakshatra, r.pada, r.vimshottariLord], [c.nakshatra, c.pada, c.lord], c.name);
  const dl = arcsec(r.moonSiderealLongitude, c.moonNirayana);
  assert.ok(Math.abs(dl) < 10, c.name + ': Moon within 10″ (' + dl.toFixed(1) + '″)');
  assert.ok(Math.abs((engine.lahiri(ms).mean - c.meanLahiri) * 3600) < 1, c.name + ': Lahiri ayanamsa within 1″');
  assert.ok(Math.abs(r.nakshatraStart - Date.parse(c.nakshatraStart)) < 30000 && Math.abs(r.nakshatraEnd - Date.parse(c.nakshatraEnd)) < 30000, c.name + ': span within 30 s');
  assert.ok(Math.abs(r.udaya.sunrise - Date.parse(c.sunrise)) < 60000, c.name + ': sunrise within a minute');
  assert.deepEqual([r.udaya.tithi.index, r.udaya.yoga.index, r.udaya.karana.index], [c.tithi, c.yoga, c.karana], c.name + ': udaya pañcāṅga');
  lines.push(c.name + ': ' + r.nakshatra + ' ' + r.pada + ', ' + r.vimshottariLord + ' (Δλ ' + dl.toFixed(1) + '″)');
}
ok('four reference charts computed with the Swiss Ephemeris, all matched — nakṣatra, pada, lord, tithi, yoga, karaṇa; Moon within 10″, Lahiri within 1″, span within 30 s:\n        ' + lines.join('\n        '));

/* ── 2. the independent lunar theory ────────────────────────────────────── */
const diffs = [];
for (let k = 0; k < 240; k++) {
  const ms = Date.UTC(1961, 0, 1) + k * (89.9 * 365.25 * 86400000 / 240) + (k * 7919 % 86400) * 1000;
  const p = engine._at(ms);
  const ref = nirayana(meeus(ms).moon, ms);
  diffs.push(Math.abs(arcsec(p.moonSidereal, ref)));
  const into = ((ref % (S / 4)) + S / 4) % (S / 4) * 3600;
  if (into > 25 && into < S / 4 * 3600 - 25) {
    const a = J.sectorOf(p.moonSidereal), b = J.sectorOf(ref);
    assert.deepEqual([a.index, a.pada], [b.index, b.pada], new Date(ms).toISOString());
  }
}
diffs.sort((a, b) => a - b);
assert.ok(diffs[239] < 20, 'within 20″ of the Meeus theory');
ok('240 instants 1961–2050 against Meeus’s lunar theory: within ' + diffs[239].toFixed(1) + '″ (median ' + diffs[120].toFixed(1) + '″), every nakṣatra and pada identical away from a boundary');

/* ── 3. the published table ─────────────────────────────────────────────── */
function docxText(file) {
  const buf = fs.readFileSync(file);
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < buf.readUInt16LE(eocd + 10); i++) {
    const [method, size, nameLen, extraLen, commentLen, local] = [buf.readUInt16LE(p + 10), buf.readUInt32LE(p + 20),
      buf.readUInt16LE(p + 28), buf.readUInt16LE(p + 30), buf.readUInt16LE(p + 32), buf.readUInt32LE(p + 42)];
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (name === 'word/document.xml') {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
      const raw = buf.subarray(start, start + size);
      return (method === 8 ? zlib.inflateRawSync(raw) : raw).toString('utf8');
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error('no document in ' + file);
}
const xml = docxText(path.join(repo, 'docs/List_of_Nakshatras.docx'));
const rows = [...xml.matchAll(/<w:tr[ >][\s\S]*?<\/w:tr>/g)].map(([row]) =>
  [...row.matchAll(/<w:tc>[\s\S]*?<\/w:tc>/g)].map(([cell]) => [...cell.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('').trim()));
const main = rows.filter((r) => r.length === 9 && /^\d+$/.test(r[0]) && Number(r[0]) <= 27);
assert.equal(main.length, 27, 'the table lists 27 nakṣatras (and Abhijit apart)');
const LORD = { Ketu: 'Ketu', Shukra: 'Venus', Surya: 'Sun', Chandra: 'Moon', Mangala: 'Mars', Rahu: 'Rāhu', Guru: 'Jupiter', Shani: 'Saturn', Budh: 'Mercury' };
const SIGNS = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanus', 'Makara', 'Kumbha', 'Meena'];
for (const [n, name, , , lord, , , range] of main) {
  const i = Number(n) - 1;
  assert.equal(J.NAKSHATRAS[i].lord, LORD[lord.split(' ')[0]], name + ': the Vimshottari lord of the published table');
  // the start of the published range: "26°40' Mesha – 10° Vrishabha" names its
  // own sign; "0° – 13°20' Mesha" and "10° – 23°20' Vrishabha" take the sign
  // named at the end
  const [from, to] = range.split('–').map((x) => x.trim());
  const deg = from.match(/^(\d+)°(?:\s?(\d+)')?/);
  const sign = SIGNS.indexOf(from.match(/[A-Z][a-z]+$/)?.[0] ?? to.match(/[A-Z][a-z]+$/)[0]);
  const startDeg = sign * 30 + Number(deg[1]) + Number(deg[2] || 0) / 60;
  assert.ok(Math.abs(startDeg - i * S) < 1e-9, name + ' begins at ' + (i * S).toFixed(3) + '° (' + range + ')');
  assert.equal(J.sectorOf(i * S).index, i);
}
ok('the owner’s published table (List of Nakshatras): all 27 Vimshottari lords and all 27 sector starts agree with the calculator');

/* ── the ayanamsa: Lahiri by definition, and Spica-anchored for comparison ─ */
const resid = [1900, 1956.22, 2000, 2025, 2050].map((y) => {
  const ms = Date.UTC(Math.floor(y), 2, 21);
  return [y, (engine.spicaAyanamsa(ms) - engine.lahiri(ms).true) * 3600];
});
for (const [y, r] of resid) assert.ok(r > -45 && r < -30, y + ': Spica-anchored − Lahiri = ' + r.toFixed(1) + '″, within the stated band −45″…−30″');
assert.ok(Math.abs(resid[4][1] - resid[0][1]) < 10, 'the gap drifts by under 10″ in 150 years');
ok('Spica-anchored (True Chitrapaksha by definition) − Lahiri: ' + resid.map(([y, r]) => Math.floor(y) + ' ' + r.toFixed(1) + '″').join(', ') + ' — a steady offset; Lahiri alone is used');

/* ── boundaries, exact values and the wrap ──────────────────────────────── */
// (sectorOf works to a thousandth of an arcsecond; 1e-6° is 3.6 of those below)
assert.deepEqual([J.sectorOf(0).index, J.sectorOf(360).index, J.sectorOf(40 / 3).index, J.sectorOf(40 / 3 - 1e-6).index, J.sectorOf(10 / 3).pada], [0, 0, 1, 0, 2]);
{
  const r = await engine.calculate({ utcMs: Date.UTC(2025, 6, 1, 10), latitude: 28.6139, longitude: 77.2090, day: dayOf('2025-07-01', { zone: 'Asia/Kolkata' }) });
  const at = (ms) => J.sectorOf(engine._at(ms).moonSidereal);
  assert.equal(at(r.nakshatraStart - 1000).index, r.index - 1); assert.equal(at(r.nakshatraStart + 1000).index, r.index);
  assert.equal(at(r.nakshatraEnd - 1000).index, r.index); assert.equal(at(r.nakshatraEnd + 1000).index, r.index + 1);
  assert.equal(at(r.padaEnd - 1000).pada, r.pada); assert.equal(at(r.padaEnd + 1000).pada, r.pada + 1);
  let t = Date.UTC(2025, 0, 6);
  while (at(t).index !== 26) t += 3 * 3600000;
  const x = await engine.calculate({ utcMs: t, latitude: 0, longitude: 0, day: dayOf('2025-01-07', { offsetSeconds: 0 }) });
  assert.deepEqual([at(x.nakshatraEnd - 1000).nakshatra, at(x.nakshatraEnd - 1000).pada, at(x.nakshatraEnd + 1000).nakshatra, at(x.nakshatraEnd + 1000).pada], ['Revatī', 4, 'Aśvinī', 1]);
  // the same crossing as the Swiss Ephemeris put it: 2025-01-07T12:20:05Z
  assert.ok(Math.abs(x.nakshatraEnd - Date.parse('2025-01-07T12:20:05Z')) < 15000, 'Revatī ends within 15 s of the Swiss Ephemeris time');
  ok('exact 0°, 13°20′ and 360°; boundaries to the second; Revatī 4 → Aśvinī 1 across 0°/360° at ' + new Date(x.nakshatraEnd).toISOString() + ' (Swiss Ephemeris: 12:20:05)');
}

/* ── time: UTC equivalence, Poland, a historical offset ─────────────────── */
{
  const forms = [
    { date: '2025-07-01', time: '12:00', zoneMode: 'zone', zone: 'Europe/Warsaw' },
    { date: '2025-07-01', time: '10:00', zoneMode: 'offset', offset: 'UTC' },
    { date: '2025-07-01', time: '15:30', zoneMode: 'zone', zone: 'Asia/Kolkata' },
    { date: '2025-07-01', time: '06:00', zoneMode: 'offset', offset: '−04:00' }
  ].map((f) => J.readInput({ ...f, latitude: '52.2297', longitude: '21.0122' }).value);
  const out = [];
  for (const v of forms) out.push(await calculateNakshatra(new Date(v.utcMs), v.latitude, v.longitude));
  assert.ok(out.every((r) => r.moonSiderealLongitude === out[0].moonSiderealLongitude && r.nakshatra === out[0].nakshatra && r.utc === '2025-07-01T10:00:00.000Z'));
  // and the place does not enter the nakṣatra
  const elsewhere = await calculateNakshatra(new Date(forms[0].utcMs), -33.87, 151.21);
  assert.equal(elsewhere.moonSiderealLongitude, out[0].moonSiderealLongitude);
  const base = { date: '2025-10-26', time: '02:30', latitude: '52.2297', longitude: '21.0122', zoneMode: 'zone', zone: 'Europe/Warsaw' };
  const asked = J.readInput(base);
  assert.equal(asked.needsChoice, true, 'Warsaw 26 Oct 2025 02:30 is ambiguous and is asked about');
  const a = await calculateNakshatra(new Date(J.readInput({ ...base, choice: 0 }).value.utcMs), 52.2, 21.0);
  const b = await calculateNakshatra(new Date(J.readInput({ ...base, choice: 1 }).value.utcMs), 52.2, 21.0);
  assert.deepEqual([a.utc, b.utc], ['2025-10-26T00:30:00.000Z', '2025-10-26T01:30:00.000Z']);
  const gap = J.readInput({ ...base, date: '2025-03-30' });
  assert.equal(gap.ok, false); assert.match(gap.errors.time, /does not occur in Europe\/Warsaw.*UTC\+01:00 to UTC\+02:00/);
  const k = J.readInput({ date: '1986-01-01', time: '12:00', latitude: '27.7172', longitude: '85.3240', zoneMode: 'zone', zone: 'Asia/Kathmandu' }).value;
  assert.equal(J.formatOffset(k.offset), 'UTC+05:45');
  assert.equal((await calculateNakshatra(new Date(k.utcMs), 27.7, 85.3)).utc, '1986-01-01T06:15:00.000Z');
  const w = J.readInput({ date: '1915-08-01', time: '12:00', latitude: '52.2297', longitude: '21.0122', zoneMode: 'zone', zone: 'Europe/Warsaw' }).value;
  assert.equal(J.formatOffset(w.offset), 'UTC+01:24');
  ok('one instant in four spellings, one result, whatever the place; Warsaw 02:30 on 26 Oct 2025 asked about (00:30 or 01:30 UTC), 02:30 on 30 Mar refused; Kathmandu 1 Jan 1986 at UTC+05:45; Warsaw mean time UTC+01:24 before 1915 (ICU ' + process.versions.icu + ', tz ' + process.versions.tz + ')');
}

/* ── sunrise within the local day ───────────────────────────────────────── */
{
  const syd = await engine.calculate({ utcMs: Date.UTC(2025, 5, 21, 2), latitude: -33.8688, longitude: 151.2093, day: dayOf('2025-06-21', { zone: 'Australia/Sydney' }) });
  assert.equal(J.localClock(syd.udaya.sunrise, { zone: 'Australia/Sydney' }).date, '2025-06-21');
  const early = await engine.calculate({ utcMs: Date.UTC(2025, 5, 30, 23), latitude: 28.6139, longitude: 77.2090, day: dayOf('2025-07-01', { zone: 'Asia/Kolkata' }) });
  assert.deepEqual([early.vara.beforeSunrise, early.vara.name], [true, 'Somavāra']);
  for (const [ymd, ms] of [['2025-12-21', Date.UTC(2025, 11, 21, 11)], ['2025-06-21', Date.UTC(2025, 5, 21, 11)]]) {
    const r = await engine.calculate({ utcMs: ms, latitude: 69.6492, longitude: 18.9553, day: dayOf(ymd, { zone: 'Europe/Oslo' }) });
    assert.equal(r.udaya, null, 'Tromsø ' + ymd); assert.ok(r.nakshatra);
  }
  ok('sunrise on the local date at Sydney; the vāra before sunrise is the previous day’s; none invented at Tromsø in December or June');
}

/* ── failure and recovery ───────────────────────────────────────────────── */
{
  let attempts = 0;
  const flaky = createEngine({ load: () => (++attempts === 1 ? Promise.reject(new Error('offline')) : import(libUrl)) });
  await assert.rejects(flaky.init(), (e) => e instanceof EngineError && e.kind === 'load');
  assert.equal(flaky.ready, false);
  await flaky.init(); assert.equal(flaky.ready, true, 'a second attempt succeeds');
  await assert.rejects(createEngine({ load: async () => ({}) }).init(), (e) => e instanceof EngineError && e.kind === 'version');
  ok('a failed load is reported as such and can be retried; a module that is not the engine is refused');
}

for (const c of checks) console.log('  ok  ' + c);
console.log('\n' + checks.length + ' checks passed.');
