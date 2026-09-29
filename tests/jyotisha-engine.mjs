// Run with Node alone — the engine is vendored (vendor/panchangam@0.2.1).
// The calculator's engine as the page uses it (jyotisha-engine.js), checked
// against a reference that shares nothing with it (tests/fixtures/meeus.mjs:
// Meeus's lunar and solar theories and the published definition of the Lahiri
// ayanamsa), and against its own library where that library is right.
//
// Conventions compared: geocentric; nirayana = apparent longitude − true
// Lahiri ayanamsa (= mean-equinox longitude − mean ayanamsa); time in UT.
// Tolerance for the Moon's sidereal longitude: 20″ — the reference's own
// accuracy is about 10″ (Meeus, ch. 47), and 20″ is still under the smallest
// separation between the Lahiri and True Chitrapaksha ayanamsas found over the
// range tested, so the wrong ayanamsa could not pass.
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const J = await import(pathToFileURL(path.join(repo, 'jyotisha.js')));
const { createEngine, EngineError, ENGINE, jdOf } = await import(pathToFileURL(path.join(repo, 'jyotisha-engine.js')));
const { meeus, nirayana, deltaT } = await import(pathToFileURL(path.join(repo, 'tests/fixtures/meeus.mjs')));
const libUrl = pathToFileURL(path.join(repo, 'vendor/panchangam@0.2.1/panchangam.js')).href;
const checks = [];
const ok = (note) => checks.push(note);
const arcsec = (a, b) => ((((a - b) % 360) + 540) % 360 - 180) * 3600;
const S = 360 / 27;

const engine = createEngine({ load: () => import(libUrl) });
await engine.init();
const lib = engine._lib();

/* ── the configuration is what it says ──────────────────────────────────── */
assert.equal(lib.get_version(), '0.2.1');
assert.equal(lib.get_swisseph_version(), '2.10.03');
assert.equal(ENGINE.ayanamsaMode, 1);
let closestTrueCitra = Infinity;
for (let y = 1961; y <= 2050; y += 1) {
  const jd = jdOf(Date.UTC(y, 5, 1));
  closestTrueCitra = Math.min(closestTrueCitra, Math.abs(lib.get_ayanamsha(1, jd) - lib.get_ayanamsha(27, jd)) * 3600);
}
assert.ok(closestTrueCitra > 30, 'Lahiri and True Chitrapaksha are told apart');
// no ephemeris files: the Swiss Ephemeris answers from its Moshier theory
const jd0 = jdOf(Date.UTC(2025, 6, 1, 10));
assert.equal(lib.p_calc_ut(jd0, 1, 2 | 256).longitude, lib.p_calc_ut(jd0, 1, 4 | 256).longitude, 'SWIEPH falls back to MOSEPH');
// the package documents SEFLG_NONUT as 1024; that is SEFLG_NOABERR — nutation is 64
assert.equal(lib.Constants.SEFLG_NONUT, 1024, 'the package still carries its wrong constant');
ok('engine 0.2.1 on Swiss Ephemeris 2.10.03 (Moshier, no data files), Lahiri mode 1, at least ' + closestTrueCitra.toFixed(0) + '″ from True Chitrapaksha 1961–2050');

/* ── against the independent reference ──────────────────────────────────── */
const diffs = [];
let sectorsChecked = 0;
for (let k = 0; k < 240; k++) {
  const ms = Date.UTC(1961, 0, 1) + k * (89.9 * 365.25 * 86400000 / 240) + (k * 7919 % 86400) * 1000;
  const p = engine._at(jdOf(ms));
  const ref = nirayana(meeus(ms).moon, ms);
  const d = arcsec(p.moonSidereal, ref);
  diffs.push(Math.abs(d));
  // away from a boundary, the reference names the same nakṣatra and pada
  const into = ((ref % (S / 4)) + S / 4) % (S / 4) * 3600;
  if (into > 25 && into < S / 4 * 3600 - 25) {
    const a = J.sectorOf(p.moonSidereal), b = J.sectorOf(ref);
    assert.deepEqual([a.index, a.pada], [b.index, b.pada], new Date(ms).toISOString());
    sectorsChecked++;
  }
  // the Sun, for the pañcāṅga: Meeus's low-accuracy Sun is good to about 36″
  // and is apparent, so the engine's mean-equinox Sun is compared with nutation added back
  const sunApparent = lib.p_calc_ut(jdOf(ms), 0, 2 | 256).longitude;
  assert.ok(Math.abs(arcsec(sunApparent, meeus(ms).sun)) < 45, 'the Sun within 45″ of the reference');
}
diffs.sort((a, b) => a - b);
const [median, p95, max] = [diffs[120], diffs[228], diffs[239]];
assert.ok(max < 20, 'the Moon’s nirayana longitude within 20″ of the reference (worst ' + max.toFixed(1) + '″)');
ok('240 instants 1961–2050: Moon nirayana within ' + max.toFixed(1) + '″ of the independent reference (median ' + median.toFixed(1) + '″, 95% ' + p95.toFixed(1) + '″); ' + sectorsChecked + ' nakṣatra and pada assignments identical');

/* ── the library's own nakṣatra, and the ΔT it leaves in ────────────────── */
{
  const ms = Date.UTC(2025, 6, 1, 10);
  const jd = jdOf(ms);
  const ours = engine._at(jd);
  const theirs = lib.calculate_planets(jd, 1).find((x) => x.name === 'Moon').longitude;
  const withoutNut = lib.p_calc_ut(jd, 1, 2 | 256 | 64).longitude - lib.get_ayanamsha(1, jd);
  const implied = arcsec(theirs, lib.p_calc_ut(jd, 1, 2 | 256).longitude - lib.get_ayanamsha(1, jd)) / 3600 / ours.moonSpeed * 86400;
  // ΔT in mid-2025 was about 69 s (the Espenak–Meeus polynomial in the reference
  // overshoots it, at ~75 s; that costs the reference about 3″ of lunar motion)
  assert.ok(implied < -66 && implied < 0 && implied > -72, 'the library reads a UT Julian day as TT: the Moon comes out ΔT early (' + implied.toFixed(1) + ' s)');
  assert.ok(Math.abs(arcsec(ours.moonSidereal, withoutNut)) < 1e-6, 'the adapter subtracts the ayanamsa once, from the mean-equinox longitude');
  // given TT, the library's own nakṣatra agrees with the adapter's
  let agree = 0;
  for (let k = 0; k < 120; k++) {
    const t = Date.UTC(1990, 0, 1) + k * 2.7e9 + k * 37e6;
    const a = J.sectorOf(engine._at(jdOf(t)).moonSidereal);
    const n = lib.calculate_nakshatra(jdOf(t) + deltaT(1990 + k * 2.7e9 / 3.156e10) / 86400, 1);
    if (n.index === a.index + 1 && n.pada === a.pada) agree++;
  }
  assert.ok(agree >= 118, 'the library’s nakṣatra and pada, handed TT, match the adapter’s (' + agree + '/120)');
  ok('the library places the Moon ' + (-implied).toFixed(1) + ' s early when handed UT (its own ΔT); handed TT, its nakṣatra and pada match the adapter’s in ' + agree + ' of 120 cases');
}

/* ── boundaries, and the 0°/360° wrap ───────────────────────────────────── */
const at = (ms) => J.sectorOf(engine._at(jdOf(ms)).moonSidereal);
const day = (ymd, basis) => { const d = J.parseDate(ymd); const [start, end] = J.localDayBounds(d, basis); return { date: d, start, end }; };
{
  const utc = { offsetSeconds: 0 };
  const r = await engine.calculate({ utcMs: Date.UTC(2025, 6, 1, 10), latitude: 28.6139, longitude: 77.2090, day: day('2025-07-01', { zone: 'Asia/Kolkata' }) });
  for (const [t, before, after] of [[r.nakshatraStart, r.index - 1, r.index], [r.nakshatraEnd, r.index, r.index + 1]]) {
    assert.equal(at(t - 1000).index, (before + 27) % 27, 'one second before the boundary');
    assert.equal(at(t + 1000).index, after % 27, 'one second after');
  }
  assert.equal(at(r.padaEnd - 1000).pada, r.pada); assert.equal(at(r.padaEnd + 1000).pada % 4, r.pada % 4 + 1 === 5 ? 1 : (r.pada % 4) + 1);
  // the end of Revatī: find a crossing of 0° and look either side of it
  let t = Date.UTC(2025, 0, 1);
  while (at(t).index !== 26) t += 6 * 3600000;
  const x = await engine.calculate({ utcMs: t, latitude: 0, longitude: 0, day: day('2025-01-01', utc) });
  assert.deepEqual([at(x.nakshatraEnd - 1000).nakshatra, at(x.nakshatraEnd - 1000).pada], ['Revatī', 4]);
  assert.deepEqual([at(x.nakshatraEnd + 1000).nakshatra, at(x.nakshatraEnd + 1000).pada], ['Aśvinī', 1]);
  const lon = (ms) => engine._at(jdOf(ms)).moonSidereal;
  assert.ok(lon(x.nakshatraEnd - 1000) > 359.99 && lon(x.nakshatraEnd + 1000) < 0.01, 'the longitude wraps from just under 360° to just over 0°');
  ok('nakṣatra and pada boundaries found to the second; Revatī 4 → Aśvinī 1 across 0°/360° at ' + new Date(x.nakshatraEnd).toISOString());
}

/* ── the same instant, however it is written ────────────────────────────── */
{
  const forms = [
    { date: '2025-07-01', time: '12:00', zoneMode: 'zone', zone: 'Europe/Warsaw' },
    { date: '2025-07-01', time: '10:00', zoneMode: 'offset', offset: 'UTC' },
    { date: '2025-07-01', time: '15:30', zoneMode: 'zone', zone: 'Asia/Kolkata' }
  ].map((f) => J.readInput({ ...f, latitude: '52.2297', longitude: '21.0122' }).value);
  const results = [];
  for (const v of forms) results.push(await engine.calculate({ utcMs: v.utcMs, latitude: v.latitude, longitude: v.longitude, day: day('2025-07-01', v.zone ? { zone: v.zone } : { offsetSeconds: v.offset }) }));
  assert.ok(results.every((r) => r.moonSiderealLongitude === results[0].moonSiderealLongitude && r.nakshatra === results[0].nakshatra && r.pada === results[0].pada));
  ok('one instant written in Warsaw summer time, UTC and Kolkata time gives one longitude, nakṣatra and pada');
}

/* ── Poland's clock changes, and a documented historical offset ─────────── */
{
  const base = { date: '2025-10-26', time: '02:30', latitude: '52.2297', longitude: '21.0122', zoneMode: 'zone', zone: 'Europe/Warsaw' };
  const a = J.readInput({ ...base, choice: 0 }).value, b = J.readInput({ ...base, choice: 1 }).value;
  const d = day('2025-10-26', { zone: 'Europe/Warsaw' });
  const ra = await engine.calculate({ ...a, day: d }), rb = await engine.calculate({ ...b, day: d });
  const move = arcsec(rb.moonSiderealLongitude, ra.moonSiderealLongitude) / 3600;
  assert.ok(move > 0.4 && move < 0.7, 'the two 02:30s are an hour of lunar motion apart (' + move.toFixed(3) + '°)');
  assert.equal(J.readInput({ ...base, date: '2025-03-30' }).ok, false, 'the missing 02:30 is refused before the engine is asked');
  const k85 = J.readInput({ date: '1985-12-31', time: '12:00', latitude: '27.7172', longitude: '85.3240', zoneMode: 'zone', zone: 'Asia/Kathmandu' }).value;
  const k86 = J.readInput({ date: '1986-01-01', time: '12:00', latitude: '27.7172', longitude: '85.3240', zoneMode: 'zone', zone: 'Asia/Kathmandu' }).value;
  assert.equal(k86.utcMs - k85.utcMs, 86400000 - 15 * 60000, 'Nepal’s move from +05:30 to +05:45 shortens the interval by 15 minutes');
  const r86 = await engine.calculate({ ...k86, day: day('1986-01-01', { zone: 'Asia/Kathmandu' }) });
  assert.ok(Math.abs(arcsec(r86.moonSiderealLongitude, engine._at(jdOf(Date.UTC(1986, 0, 1, 6, 15))).moonSidereal)) < 1e-6, 'computed at 06:15 UTC');
  ok('Warsaw 26 Oct 2025 02:30: the earlier and later instants give Moons ' + move.toFixed(2) + '° apart; the missing 30 Mar 02:30 is refused; Kathmandu noon on 1 Jan 1986 is computed at 06:15 UTC');
}

/* ── sunrise within the local day; the udaya pañcāṅga ───────────────────── */
{
  // Delhi, 1 July 2025: the library's own daily pañcāṅga returns the sunrise of 2 July
  const delhi = await engine.calculate({ utcMs: Date.UTC(2025, 6, 1, 10), latitude: 28.6139, longitude: 77.2090, day: day('2025-07-01', { zone: 'Asia/Kolkata' }) });
  assert.equal(J.localClock(delhi.udaya.sunrise, { zone: 'Asia/Kolkata' }).date, '2025-07-01');
  const theirs = lib.calculate_daily_panchang(2025, 7, 1, new lib.Location(28.6139, 77.2090, 0), 1);
  assert.equal(J.localClock(theirs.sunrise, { zone: 'Asia/Kolkata' }).date, '2025-07-02', 'the library looks from 0h UTC and finds the next local sunrise');
  assert.deepEqual([delhi.udaya.tithi.paksha, delhi.udaya.tithi.name, delhi.vara.name], ['Śukla', 'Ṣaṣṭhī', 'Maṅgalavāra']);
  // the udaya tithi, yoga and karaṇa agree with the reference's Sun and Moon at that sunrise
  const m = meeus(delhi.udaya.sunrise);
  assert.equal(J.tithiOf(m.sun, m.moon).index, delhi.udaya.tithi.index);
  assert.equal(J.karanaOf(m.sun, m.moon).index, delhi.udaya.karana.index);
  assert.equal(J.yogaOf(nirayana(m.sun, delhi.udaya.sunrise), nirayana(m.moon, delhi.udaya.sunrise)).index, delhi.udaya.yoga.index);
  // Sydney (UTC+10): the sunrise of the local date, not the next
  const syd = await engine.calculate({ utcMs: Date.UTC(2025, 5, 21, 2), latitude: -33.8688, longitude: 151.2093, day: day('2025-06-21', { zone: 'Australia/Sydney' }) });
  assert.deepEqual(J.localClock(syd.udaya.sunrise, { zone: 'Australia/Sydney' }).date, '2025-06-21');
  // before sunrise, the vāra is still the previous day's
  const early = await engine.calculate({ utcMs: Date.UTC(2025, 5, 30, 23, 0), latitude: 28.6139, longitude: 77.2090, day: day('2025-07-01', { zone: 'Asia/Kolkata' }) });
  assert.deepEqual([early.vara.beforeSunrise, early.vara.name], [true, 'Somavāra'], '04:30 IST on a Tuesday is still Monday’s vāra');
  // Tromsø in December and in June: no sunrise, and no invented one
  for (const [ymd, ms] of [['2025-12-21', Date.UTC(2025, 11, 21, 11)], ['2025-06-21', Date.UTC(2025, 5, 21, 11)]]) {
    const r = await engine.calculate({ utcMs: ms, latitude: 69.6492, longitude: 18.9553, day: day(ymd, { zone: 'Europe/Oslo' }) });
    assert.equal(r.udaya, null, 'Tromsø ' + ymd + ': no sunrise'); assert.equal(r.vara, null);
    assert.ok(r.nakshatra, 'the nakṣatra is still given');
  }
  ok('udaya pañcāṅga at the local date’s sunrise (Delhi 1 Jul 2025: Śukla Ṣaṣṭhī, Maṅgalavāra — where the library’s own gives 2 July), agreeing with the reference; Sydney’s own date; the vāra before sunrise; no sunrise invented at Tromsø');
}

/* ── failure and recovery ───────────────────────────────────────────────── */
{
  let attempts = 0;
  const flaky = createEngine({ load: () => (++attempts === 1 ? Promise.reject(new Error('offline')) : import(libUrl)) });
  await assert.rejects(flaky.init(), (e) => e instanceof EngineError && e.kind === 'load');
  assert.equal(flaky.ready, false);
  await flaky.init();
  assert.equal(flaky.ready, true, 'a second attempt succeeds after the first failed');
  const wrong = createEngine({ load: async () => ({ ...(await import(libUrl)), get_version: () => '9.9.9' }) });
  await assert.rejects(wrong.init(), (e) => e instanceof EngineError && e.kind === 'version');
  const trueCitra = createEngine({ load: async () => { const m = await import(libUrl); return { ...m, get_ayanamsha: (mode, jd) => m.get_ayanamsha(27, jd) }; } });
  await assert.rejects(trueCitra.init(), (e) => e instanceof EngineError && e.kind === 'config', 'an engine that answers True Chitrapaksha for Lahiri is refused');
  ok('a failed load is reported and retried; a wrong version, or True Chitrapaksha in place of Lahiri, is refused');
}

for (const c of checks) console.log('  ok  ' + c);
console.log('\n' + checks.length + ' checks passed.');
