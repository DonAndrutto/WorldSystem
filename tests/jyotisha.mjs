// Run with Node alone — no development dependencies.
// The calculator's own logic (jyotisha.js), without a page: the twenty-seven
// sectors and their catalogue links, time from a local reading to one UTC
// instant, the checks on every field, and a provider that is honest about
// being unavailable. Time zones come from Node's ICU data; the version is
// printed with the result, since historical offsets depend on it.
//
// The sector tests use synthetic longitudes chosen to sit on and beside the
// boundaries. They are arithmetic checks of the derivation, not calculated
// positions of the Moon: no ephemeris is involved anywhere in this file.
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const J = await import(pathToFileURL(path.join(repo, 'jyotisha.js')));
const { MANSIONS, MANSION_BY_ID } = await import(pathToFileURL(path.join(repo, 'lunar-mansions.js')));
const checks = [];
const ok = (note) => checks.push(note);

/* ── the sectors ─────────────────────────────────────────────────────────── */
assert.equal(J.NAKSHATRAS.length, 27);
assert.deepEqual(J.NAKSHATRAS.slice(0, 9).map((n) => n.lord), J.VIMSHOTTARI_ORDER);
assert.ok(J.NAKSHATRAS.every((n, i) => n.lord === J.VIMSHOTTARI_ORDER[i % 9]), 'the nine lords run three times round');
assert.equal(J.NAKSHATRAS[26].lord, 'Mercury');
const linked = Object.values(J.CATALOGUE_LINK);
assert.equal(new Set(linked).size, 27, 'each sector links to its own catalogue entry');
assert.ok(linked.every((id) => MANSION_BY_ID.has(id)), 'every link is a catalogue id');
assert.ok(!linked.includes('lm_byi_bzhin'), 'Abhijit has a catalogue entry and no sector');
assert.deepEqual(Object.keys(J.CATALOGUE_LINK), J.NAKSHATRAS.map((n) => n.sanskrit));
// the link agrees with the catalogue's own Sanskrit concordance, entry by entry
for (const [sanskrit, id] of Object.entries(J.CATALOGUE_LINK)) assert.equal(MANSION_BY_ID.get(id).sanskrit, sanskrit, sanskrit);
// and the Indian lord is never the Tibetan ruler's field
assert.ok(MANSIONS.every((m) => !('vimshottariLord' in m)));
ok('27 sectors with their Vimshottari lords, each linked by id to its White Beryl entry; Abhijit left without a sector');

const at = (deg) => J.sectorOf(deg);
const S = 40 / 3, P = 10 / 3;                         // a sector and a pada, in degrees
const eps = 1 / 3600 / 10;                            // a tenth of an arcsecond
assert.deepEqual([at(0).nakshatra, at(0).pada], ['Aśvinī', 1]);
assert.deepEqual([at(360).nakshatra, at(360).pada, at(360).longitude], ['Aśvinī', 1, 0]);
assert.deepEqual([at(720 + 1).nakshatra], ['Aśvinī']);
assert.deepEqual([at(-eps).nakshatra, at(-eps).pada], ['Revatī', 4], 'just under 0° is the end of Revatī');
assert.deepEqual([at(360 - eps).nakshatra, at(360 - eps).pada], ['Revatī', 4]);
for (let k = 1; k < 27; k++) {
  assert.equal(at(k * S).index, k, 'the start of sector ' + k);
  assert.equal(at(k * S).pada, 1);
  assert.equal(at(k * S - eps).index, k - 1, 'just before sector ' + k);
  assert.equal(at(k * S - eps).pada, 4);
}
for (let q = 1; q < 4; q++) {
  assert.equal(at(5 * S + q * P).pada, q + 1, 'pada ' + (q + 1) + ' begins at its boundary');
  assert.equal(at(5 * S + q * P - eps).pada, q);
}
// 13°20' written out in degrees, minutes and seconds lands on the boundary too
assert.equal(at(13 + 20 / 60).nakshatra, 'Bharaṇī');
assert.equal(at(3 + 20 / 60).pada, 2);
assert.throws(() => at(NaN), TypeError); assert.throws(() => at('12'), TypeError); assert.throws(() => at(Infinity), TypeError);
assert.equal(J.formatLongitude(13 + 20 / 60), '13° 20′ 00″');
assert.equal(J.formatLongitude(359.9999), '359° 59′ 59″', 'never shown as 360°');
assert.equal(J.formatLongitude(0), '0° 00′ 00″');
assert.equal(J.formatLongitude(123.5 + 1 / 3600), '123° 30′ 01″');
ok('0°/360° wrap, all 26 inner sector boundaries and the pada boundaries, exact to a tenth of an arcsecond; no ayanamsa applied twice (none is applied here at all)');

/* ── time ───────────────────────────────────────────────────────────────── */
const date = (s) => J.parseDate(s), time = (s) => J.parseTime(s);
const iso = (ms) => new Date(ms).toISOString().replace('.000', '');
const r = (d, t, basis) => J.resolveLocal(date(d), time(t), basis);

// Poland, spring forward: 2025-03-30, 02:00 CET becomes 03:00 CEST
const gap = r('2025-03-30', '02:30', { zone: 'Europe/Warsaw' });
assert.equal(gap.status, 'nonexistent');
assert.deepEqual([gap.before, gap.after], [3600, 7200]);
assert.equal(r('2025-03-30', '01:59:59', { zone: 'Europe/Warsaw' }).status, 'ok');
assert.equal(iso(r('2025-03-30', '03:00', { zone: 'Europe/Warsaw' }).utcMs), '2025-03-30T01:00:00Z');
// Poland, fall back: 2025-10-26, 03:00 CEST becomes 02:00 CET — 02:30 happens twice
const twice = r('2025-10-26', '02:30', { zone: 'Europe/Warsaw' });
assert.equal(twice.status, 'ambiguous');
assert.deepEqual(twice.options.map((o) => [iso(o.utcMs), o.offset]),
  [['2025-10-26T00:30:00Z', 7200], ['2025-10-26T01:30:00Z', 3600]]);
ok('Poland 2025: 02:30 on 30 March does not exist (UTC+01:00 → +02:00); 02:30 on 26 October occurs twice and both instants are offered');

// the form refuses both without guessing
const base = { date: '2025-10-26', time: '02:30', latitude: '52.2297', longitude: '21.0122', zoneMode: 'zone', zone: 'Europe/Warsaw' };
const asked = J.readInput(base);
assert.equal(asked.ok, false); assert.equal(asked.needsChoice, true);
assert.equal(J.readInput({ ...base, choice: 0 }).value.utcMs, Date.UTC(2025, 9, 26, 0, 30));
assert.equal(J.readInput({ ...base, choice: 1 }).value.utcMs, Date.UTC(2025, 9, 26, 1, 30));
const refused = J.readInput({ ...base, date: '2025-03-30' });
assert.equal(refused.ok, false); assert.match(refused.errors.time, /does not occur/);
ok('an ambiguous reading needs an explicit choice; a nonexistent one is refused with the change named');

// documented historical changes: Nepal moved from +05:30 to +05:45 on 1 January 1986;
// Warsaw kept local mean time (+01:24) until 1915, then Central European Time
const ktm = (d) => r(d, '12:00', { zone: 'Asia/Kathmandu' }).offset;
assert.equal(ktm('1985-12-31'), 5 * 3600 + 30 * 60);
assert.equal(ktm('1986-01-02'), 5 * 3600 + 45 * 60);
const waw = (d) => r(d, '12:00', { zone: 'Europe/Warsaw' }).offset;
assert.equal(waw('1915-08-01'), 3600 + 24 * 60);
assert.equal(waw('1915-08-10'), 3600);
assert.equal(J.formatOffset(3600 + 24 * 60), 'UTC+01:24');
assert.equal(J.formatOffset(-(3 * 3600 + 30 * 60)), 'UTC−03:30');
ok('historical offsets from the zone data: Kathmandu +05:30 → +05:45 on 1 January 1986; Warsaw mean time +01:24 → CET in 1915');

// the same instant, however it is written
const one = [
  J.readInput({ ...base, date: '2025-07-01', time: '12:00', zone: 'Europe/Warsaw' }),
  J.readInput({ ...base, date: '2025-07-01', time: '12:00', zoneMode: 'offset', offset: '+02:00' }),
  J.readInput({ ...base, date: '2025-07-01', time: '10:00', zoneMode: 'offset', offset: 'UTC' }),
  J.readInput({ ...base, date: '2025-07-01', time: '15:30', zone: 'Asia/Kolkata' }),
  J.readInput({ ...base, date: '2025-07-01', time: '06:00', zoneMode: 'offset', offset: '−04:00' })
].map((x) => x.value.utcMs);
assert.ok(one.every((ms) => ms === Date.UTC(2025, 6, 1, 10, 0)), 'five ways of writing 10:00 UTC');
ok('UTC-equivalent readings (Warsaw summer time, +02:00, UTC, Kolkata, −04:00) resolve to one instant');

/* ── the checks on every field ──────────────────────────────────────────── */
const bad = (over) => J.readInput({ ...base, date: '2025-07-01', time: '12:00', ...over }).errors || {};
assert.ok(bad({ date: '' }).date); assert.ok(bad({ date: '2025-02-29' }).date); assert.ok(bad({ date: '1500-01-01' }).date);
assert.ok(bad({ date: '2024-02-29' }).date === undefined, 'a leap day is a day');
assert.ok(bad({ time: '' }).time); assert.ok(bad({ time: '24:00' }).time); assert.ok(bad({ time: '12:60' }).time);
assert.ok(bad({ latitude: '' }).latitude); assert.ok(bad({ latitude: '91' }).latitude); assert.ok(bad({ latitude: 'north' }).latitude);
assert.ok(bad({ longitude: '-180.5' }).longitude); assert.ok(bad({ longitude: '' }).longitude);
assert.ok(bad({ zone: 'Europe/Nowhere' }).zone); assert.ok(bad({ zone: '' }).zone);
assert.ok(bad({ zoneMode: 'offset', offset: '+15:00' }).offset); assert.ok(bad({ zoneMode: 'offset', offset: '5' }).offset);
assert.ok(bad({ zoneMode: 'offset', offset: '+05:75' }).offset);
assert.ok(bad({ zoneMode: '' }).zoneMode);
// no field falls back to anything: an empty zone is an error, not the machine's own zone
assert.equal(J.readInput({ ...base, zone: '' }).ok, false);
ok('invalid dates, times, coordinates, zones and offsets are each refused with their own message; nothing falls back to noon or the device zone');

// manual places, written as a reader would, with no city list involved
const place = J.readInput({ ...base, date: '2025-07-01', time: '12:00', latitude: '-33,8688', longitude: '151.2093', zone: 'Australia/Sydney' });
assert.equal(place.ok, true);
assert.deepEqual([place.value.latitude, place.value.longitude], [-33.8688, 151.2093]);
const pole = J.readInput({ ...base, date: '2025-07-01', time: '12:00', latitude: '−90', longitude: '0', zoneMode: 'offset', offset: '+00:00' });
assert.deepEqual([pole.ok, pole.value.latitude], [true, -90]);
ok('manual coordinates, including a decimal comma, a typographic minus and the pole, without any city table');

/* ── a result's shape, and the pañcāṅga from longitudes ──────────────────── */
const shaped = J.resultFromMoon(5 * S + 2 * P, { name: 'fixture' });
assert.deepEqual([shaped.nakshatra, shaped.pada, shaped.vimshottariLord, shaped.catalogueId], ['Ārdrā', 3, 'Rāhu', 'lm_lag']);
assert.equal(shaped.moonSiderealLongitude, 5 * S + 2 * P, 'the longitude passes through unchanged');
assert.deepEqual([J.tithiOf(0, 0.1).index, J.tithiOf(0, 0.1).paksha, J.tithiOf(0, 0.1).name], [1, 'Śukla', 'Pratipad']);
assert.deepEqual([J.tithiOf(10, 10 + 179.9).name, J.tithiOf(10, 10 + 180).index, J.tithiOf(10, 10 + 180).paksha], ['Pūrṇimā', 16, 'Kṛṣṇa']);
assert.equal(J.tithiOf(100, 99.99).name, 'Amāvāsyā');
assert.deepEqual([0.5, 6.5, 12.5, 342.5, 348.5, 354.5].map((e) => J.karanaOf(0, e).name), ['Kiṃstughna', 'Bava', 'Bālava', 'Śakuni', 'Catuṣpada', 'Nāga']);
assert.equal(J.karanaOf(0, 336.5).name, 'Viṣṭi', 'karaṇa 57, the last of the eighth round');
assert.deepEqual([J.yogaOf(0, 0).name, J.yogaOf(200, 159.99).name, J.yogaOf(1, S).name], ['Viṣkambha', 'Vaidhṛti', 'Prīti']);
assert.equal(J.weekdayOf({ y: 2025, mo: 7, d: 1 }), 2, '1 July 2025 was a Tuesday');
// a local day's bounds, with a spring-forward midnight in it
const [ws, we] = J.localDayBounds({ y: 2025, mo: 3, d: 30 }, { zone: 'Europe/Warsaw' });
assert.equal((we - ws) / 3600000, 23, 'the day the clocks go forward in Warsaw is 23 hours long');
assert.deepEqual(J.localClock(Date.UTC(2025, 9, 26, 1, 30), { zone: 'Europe/Warsaw' }), { date: '2025-10-26', time: '02:30', offset: 3600 });
ok('a result keeps its longitude; tithi, karaṇa and yoga by their definitions, with paksha and the fixed karaṇas; local days and clocks across a DST change');

for (const c of checks) console.log('  ok  ' + c);
console.log('\n' + checks.length + ' checks passed. ICU ' + process.versions.icu + ', time-zone data ' + process.versions.tz + '.');
