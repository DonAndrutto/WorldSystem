/* Indian Jyotiṣa calculation · Lahiri ayanamsa — the logic, without a page.
 *
 * This is a separate system from the White Beryl catalogue (lunar-mansions.js)
 * and is kept separate in every field: its own twenty-seven equal sectors of
 * 13°20′ in the Indian order, its own Vimshottari lords, and nothing borrowed
 * from the Tibetan sequence, the Tibetan seven-ruler list or the illustrative
 * ring in the world. It reaches the catalogue only through CATALOGUE_LINK,
 * an explicit table of ids. Abhijit (byi bzhin) has a catalogue entry and no
 * sector here: no twenty-eighth sector, pada or lord is invented for it.
 *
 * Four parts:
 *   1. the sectors — a sidereal lunar longitude to nakṣatra and pada;
 *   2. time — one local date and time, with an IANA zone or an explicit UTC
 *      offset, to exactly one UTC instant, or to an explicit ambiguity or gap;
 *   3. the pañcāṅga's tithi, yoga and karaṇa from the Sun's and Moon's
 *      longitudes, and the local civil day a reading falls in;
 *   4. the shape of a result.
 * The longitudes themselves come from the engine, through jyotisha-engine.js;
 * nothing here computes a position.
 */

/* ── 1. the twenty-seven sectors ─────────────────────────────────────────── */
export const VIMSHOTTARI_ORDER = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rāhu', 'Jupiter', 'Saturn', 'Mercury'];

export const NAKSHATRAS = Object.freeze([
  'Aśvinī', 'Bharaṇī', 'Kṛttikā', 'Rohiṇī', 'Mṛgaśīrṣa', 'Ārdrā', 'Punarvasu', 'Puṣya', 'Āśleṣā',
  'Maghā', 'Pūrvaphalgunī', 'Uttaraphalgunī', 'Hasta', 'Citrā', 'Svātī', 'Viśākhā', 'Anurādhā', 'Jyeṣṭhā',
  'Mūla', 'Pūrvāṣāḍhā', 'Uttarāṣāḍhā', 'Śravaṇa', 'Dhaniṣṭhā', 'Śatabhiṣaj', 'Pūrvabhādrapadā', 'Uttarabhādrapadā', 'Revatī'
].map((sanskrit, index) => Object.freeze({ index, sanskrit, lord: VIMSHOTTARI_ORDER[index % 9] })));

/* the Indian sector → the Tibetan catalogue entry that corresponds to it */
export const CATALOGUE_LINK = Object.freeze({
  'Aśvinī': 'lm_tha_skar', 'Bharaṇī': 'lm_bra_nye', 'Kṛttikā': 'lm_smin_drug', 'Rohiṇī': 'lm_snar_ma',
  'Mṛgaśīrṣa': 'lm_mgo', 'Ārdrā': 'lm_lag', 'Punarvasu': 'lm_nabs_so', 'Puṣya': 'lm_rgyal',
  'Āśleṣā': 'lm_skag', 'Maghā': 'lm_mchu', 'Pūrvaphalgunī': 'lm_gre', 'Uttaraphalgunī': 'lm_dbo',
  'Hasta': 'lm_me_bzhi', 'Citrā': 'lm_nag_pa', 'Svātī': 'lm_sa_ri', 'Viśākhā': 'lm_sa_ga',
  'Anurādhā': 'lm_lha_mtshams', 'Jyeṣṭhā': 'lm_snon', 'Mūla': 'lm_snubs', 'Pūrvāṣāḍhā': 'lm_chu_stod',
  'Uttarāṣāḍhā': 'lm_chu_smad', 'Śravaṇa': 'lm_gro_bzhin', 'Dhaniṣṭhā': 'lm_mon_dre',
  'Śatabhiṣaj': 'lm_mon_gru', 'Pūrvabhādrapadā': 'lm_khrums_stod', 'Uttarabhādrapadā': 'lm_khrums_smad',
  'Revatī': 'lm_nam_gru'
});

/* Counted in whole arcseconds (a sector is 48 000″, a pada 12 000″) so that a
   boundary is a boundary and not a floating-point accident. The longitude
   must already be sidereal (Lahiri): no ayanamsa is subtracted here, and the
   adapter must not subtract one from an engine's sidereal output either. */
const SECTOR = 48000, PADA = 12000, CIRCLE = 1296000;
export function sectorOf(siderealLongitude) {
  if (typeof siderealLongitude !== 'number' || !Number.isFinite(siderealLongitude)) {
    throw new TypeError('a sidereal longitude in degrees is required');
  }
  // to the nearest thousandth of an arcsecond, then wrapped into [0, 360)
  const milli = Math.round(siderealLongitude * 3600 * 1000);
  const wrapped = ((milli % (CIRCLE * 1000)) + CIRCLE * 1000) % (CIRCLE * 1000);
  const sec = wrapped / 1000;
  const index = Math.floor(sec / SECTOR);
  const pada = Math.floor((sec - index * SECTOR) / PADA) + 1;
  const n = NAKSHATRAS[index];
  return { index, nakshatra: n.sanskrit, pada, lord: n.lord, catalogueId: CATALOGUE_LINK[n.sanskrit], longitude: sec / 3600 };
}

/* shown to the whole arcsecond, truncated: rounding would carry 359°59′59.6″
   round to a 360° that is not on the circle */
export function formatLongitude(deg) {
  const total = Math.floor(deg * 3600 + 1e-6) % 1296000;
  const d = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return d + '° ' + String(m).padStart(2, '0') + '′ ' + String(s).padStart(2, '0') + '″';
}

/* ── 2. time ──────────────────────────────────────────────────────────────
   The date is proleptic Gregorian, as a date input gives it. The zone is an
   IANA name resolved by the browser's own time-zone data, historical offsets
   included; the offset it resolves to is shown with the result, so it can be
   checked. Nothing falls back to noon, to the browser's own zone, or to an
   offset guessed for a date the data does not cover. */
export const YEAR_MIN = 1583, YEAR_MAX = 2999;

export function parseDate(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(text || '').trim());
  if (!m) return { error: 'Enter a date as year-month-day.' };
  const [y, mo, d] = m.slice(1).map(Number);
  if (y < YEAR_MIN || y > YEAR_MAX) return { error: 'Enter a year from ' + YEAR_MIN + ' to ' + YEAR_MAX + '.' };
  if (mo < 1 || mo > 12) return { error: 'There is no month ' + mo + '.' };
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  if (d < 1 || d > days) return { error: 'That month has ' + days + ' days.' };
  return { y, mo, d };
}
export function parseTime(text) {
  const m = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(String(text || '').trim());
  if (!m) return { error: 'Enter a time as hours and minutes, 00:00 to 23:59.' };
  const [h, mi, s] = [Number(m[1]), Number(m[2]), Number(m[3] || 0)];
  if (h > 23 || mi > 59 || s > 59) return { error: 'Enter a time from 00:00 to 23:59:59.' };
  return { h, mi, s };
}
/* ±HH:MM or ±HH:MM:SS; "UTC" or "Z" alone mean zero */
export function parseOffset(text) {
  const t = String(text || '').trim().replace(/^(UTC|GMT)\s*/i, '').replace(/−/g, '-');
  if (t === '' && /^(UTC|GMT)$/i.test(String(text || '').trim())) return { seconds: 0 };
  if (/^z$/i.test(t)) return { seconds: 0 };
  const m = /^([+-])(\d{1,2}):?(\d{2})(?::?(\d{2}))?$/.exec(t);
  if (!m) return { error: 'Enter an offset such as +05:30 or −03:00.' };
  const [h, mi, s] = [Number(m[2]), Number(m[3]), Number(m[4] || 0)];
  if (mi > 59 || s > 59) return { error: 'Enter an offset such as +05:30 or −03:00.' };
  const seconds = (m[1] === '-' ? -1 : 1) * (h * 3600 + mi * 60 + s);
  if (Math.abs(seconds) > 14 * 3600) return { error: 'Offsets run from −14:00 to +14:00.' };
  return { seconds };
}
export function formatOffset(seconds) {
  const sign = seconds < 0 ? '−' : '+';
  const a = Math.abs(seconds);
  const h = Math.floor(a / 3600), m = Math.floor((a % 3600) / 60), s = a % 60;
  return 'UTC' + sign + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + (s ? ':' + String(s).padStart(2, '0') : '');
}

const formatters = new Map();
function formatter(zone) {
  if (!formatters.has(zone)) {
    formatters.set(zone, new Intl.DateTimeFormat('en-US', {
      timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    }));
  }
  return formatters.get(zone);
}
export function isZone(zone) {
  if (typeof zone !== 'string' || !zone.trim()) return false;
  try { formatter(zone.trim()); return true; } catch { return false; }
}
/* the wall-clock reading of an instant in a zone, as milliseconds "as if UTC" */
function wallOf(zone, utcMs) {
  const p = {};
  for (const part of formatter(zone).formatToParts(new Date(utcMs))) p[part.type] = part.value;
  const d = new Date(0);
  d.setUTCFullYear(Number(p.year), Number(p.month) - 1, Number(p.day));
  d.setUTCHours(Number(p.hour) % 24, Number(p.minute), Number(p.second), 0);
  return d.getTime();
}
/* seconds east of UTC, to the second (local mean times have seconds in them) */
export function offsetAt(zone, utcMs) {
  const whole = Math.floor(utcMs / 1000) * 1000;
  return Math.round((wallOf(zone, whole) - whole) / 1000);
}

const asUtc = ({ y, mo, d }, { h, mi, s }) => {
  const t = new Date(0);
  t.setUTCFullYear(y, mo - 1, d);
  t.setUTCHours(h, mi, s, 0);
  return t.getTime();
};

/* One local reading to UTC. Returns
     { status: 'ok', utcMs, offset }                     one instant
     { status: 'ambiguous', options: [{utcMs, offset}×2] } a clock set back: the reading happens twice
     { status: 'nonexistent', before, after }            a clock set forward: the reading never happens
   `offset` is seconds east of UTC. */
export function resolveLocal(date, time, { zone = null, offsetSeconds = null } = {}) {
  const local = asUtc(date, time);
  if (offsetSeconds !== null) {
    return { status: 'ok', utcMs: local - offsetSeconds * 1000, offset: offsetSeconds, basis: 'offset' };
  }
  const day = 86400000;
  const candidates = [...new Set([-day, 0, day].map((k) => offsetAt(zone, local + k)))];
  const valid = candidates
    .map((o) => ({ utcMs: local - o * 1000, offset: o }))
    .filter((c) => wallOf(zone, c.utcMs) === local)
    .sort((a, b) => a.utcMs - b.utcMs);
  if (valid.length === 1) return { status: 'ok', ...valid[0], basis: 'zone' };
  if (valid.length > 1) return { status: 'ambiguous', options: valid.slice(0, 2), basis: 'zone' };
  return { status: 'nonexistent', before: offsetAt(zone, local - day), after: offsetAt(zone, local + day), basis: 'zone' };
}

/* The whole form, checked. `choice` picks one of an ambiguous pair (0 is the
   earlier instant, 1 the later) and is required when the reading is
   ambiguous; it is never chosen on the reader's behalf. */
export function readInput({ date, time, latitude, longitude, zoneMode, zone, offset, choice = null }) {
  const errors = {};
  const d = parseDate(date); if (d.error) errors.date = d.error;
  const t = parseTime(time); if (t.error) errors.time = t.error;
  const num = (v) => (typeof v === 'number' ? v : Number(String(v ?? '').trim().replace(',', '.').replace(/−/g, '-')));
  const lat = num(latitude), lon = num(longitude);
  if (String(latitude ?? '').trim() === '' || !Number.isFinite(lat) || lat < -90 || lat > 90) errors.latitude = 'Enter a latitude from −90 (south) to 90 (north).';
  if (String(longitude ?? '').trim() === '' || !Number.isFinite(lon) || lon < -180 || lon > 180) errors.longitude = 'Enter a longitude from −180 (west) to 180 (east).';
  let basis = null;
  if (zoneMode === 'zone') {
    if (!isZone(zone)) errors.zone = 'Enter an IANA time zone such as Europe/Warsaw or Asia/Kolkata.';
    else basis = { zone: zone.trim() };
  } else if (zoneMode === 'offset') {
    const o = parseOffset(offset);
    if (o.error) errors.offset = o.error; else basis = { offsetSeconds: o.seconds };
  } else errors.zoneMode = 'Choose a time zone or a UTC offset.';
  if (Object.keys(errors).length) return { ok: false, errors };

  const r = resolveLocal(d, t, basis);
  if (r.status === 'nonexistent') {
    return { ok: false, errors: { time: 'This time does not occur in ' + basis.zone + ' on that date: the clocks moved from '
      + formatOffset(r.before) + ' to ' + formatOffset(r.after) + '. Enter a time outside the change.' }, resolution: r };
  }
  if (r.status === 'ambiguous' && (choice !== 0 && choice !== 1)) {
    return { ok: false, needsChoice: true, resolution: r,
      errors: { time: 'This time occurs twice in ' + basis.zone + ' on that date. Choose which one is meant.' } };
  }
  const pick = r.status === 'ambiguous' ? r.options[choice] : r;
  return { ok: true, value: { utcMs: pick.utcMs, offset: pick.offset, latitude: lat, longitude: lon,
    zone: basis.zone || null, basis: r.basis, ambiguous: r.status === 'ambiguous' } };
}

/* ── 3. the pañcāṅga, from longitudes ────────────────────────────────────
   Tithi, yoga and karaṇa follow from the Sun's and Moon's longitudes alone,
   by their standard definitions: a tithi is each 12° of the Moon's elongation
   from the Sun (so no ayanamsa enters it), a karaṇa each 6°, and a yoga each
   13°20′ of the sum of their sidereal longitudes. The names are in IAST. */
const TITHI_NAMES = ['Pratipad', 'Dvitīyā', 'Tṛtīyā', 'Caturthī', 'Pañcamī', 'Ṣaṣṭhī', 'Saptamī',
  'Aṣṭamī', 'Navamī', 'Daśamī', 'Ekādaśī', 'Dvādaśī', 'Trayodaśī', 'Caturdaśī'];
export const YOGA_NAMES = Object.freeze(['Viṣkambha', 'Prīti', 'Āyuṣmān', 'Saubhāgya', 'Śobhana', 'Atigaṇḍa',
  'Sukarman', 'Dhṛti', 'Śūla', 'Gaṇḍa', 'Vṛddhi', 'Dhruva', 'Vyāghāta', 'Harṣaṇa', 'Vajra', 'Siddhi',
  'Vyatīpāta', 'Varīyān', 'Parigha', 'Śiva', 'Siddha', 'Sādhya', 'Śubha', 'Śukla', 'Brahman', 'Indra', 'Vaidhṛti']);
const MOVABLE_KARANAS = ['Bava', 'Bālava', 'Kaulava', 'Taitila', 'Gara', 'Vaṇij', 'Viṣṭi'];
export const VARA_NAMES = Object.freeze(['Ravivāra', 'Somavāra', 'Maṅgalavāra', 'Budhavāra', 'Guruvāra', 'Śukravāra', 'Śanivāra']);

const wrap360 = (x) => ((x % 360) + 360) % 360;
export function tithiOf(sunTropical, moonTropical) {
  const index = Math.floor(wrap360(moonTropical - sunTropical) / 12) + 1;        // 1–30
  const paksha = index <= 15 ? 'Śukla' : 'Kṛṣṇa';
  const name = index === 15 ? 'Pūrṇimā' : index === 30 ? 'Amāvāsyā' : TITHI_NAMES[(index - 1) % 15];
  return { index, paksha, name };
}
export function karanaOf(sunTropical, moonTropical) {
  const index = Math.floor(wrap360(moonTropical - sunTropical) / 6) + 1;         // 1–60
  const name = index === 1 ? 'Kiṃstughna' : index === 58 ? 'Śakuni' : index === 59 ? 'Catuṣpada'
    : index === 60 ? 'Nāga' : MOVABLE_KARANAS[(index - 2) % 7];
  return { index, name };
}
export function yogaOf(sunSidereal, moonSidereal) {
  const index = Math.floor(wrap360(sunSidereal + moonSidereal) / (360 / 27)) + 1; // 1–27
  return { index, name: YOGA_NAMES[index - 1] };
}

/* The local civil day a reading falls in, as two UTC instants: its first
   moment and the first moment of the next. A midnight that a clock change
   skips begins the day at the first moment that exists. */
export function localDayBounds(date, basis) {
  const start = (d) => {
    const r = resolveLocal(d, { h: 0, mi: 0, s: 0 }, basis);
    if (r.status === 'ok') return r.utcMs;
    if (r.status === 'ambiguous') return r.options[0].utcMs;
    return asUtc(d, { h: 0, mi: 0, s: 0 }) - r.before * 1000;   // the gap's far side
  };
  const next = new Date(Date.UTC(date.y, date.mo - 1, date.d + 1));
  return [start(date), start({ y: next.getUTCFullYear(), mo: next.getUTCMonth() + 1, d: next.getUTCDate() })];
}
/* the weekday of a civil date, 0 = Sunday */
export const weekdayOf = ({ y, mo, d }) => new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
/* the local clock reading of an instant, for showing a result's times */
export function localClock(utcMs, basis) {
  const off = basis.zone ? offsetAt(basis.zone, utcMs) : basis.offsetSeconds;
  const t = new Date(utcMs + off * 1000);
  const two = (n) => String(n).padStart(2, '0');
  return { date: t.getUTCFullYear() + '-' + two(t.getUTCMonth() + 1) + '-' + two(t.getUTCDate()),
    time: two(t.getUTCHours()) + ':' + two(t.getUTCMinutes()), offset: off };
}

/* ── 4. a result ───────────────────────────────────────────────────────────
   Built only from a sidereal lunar longitude the engine has produced under
   the adapter's configuration (jyotisha-engine.js): the sector and pada are
   derived here, from that longitude, with no further ayanamsa applied. */
export function resultFromMoon(siderealLongitude, engine) {
  const s = sectorOf(siderealLongitude);
  return {
    nakshatra: s.nakshatra, index: s.index, pada: s.pada,
    vimshottariLord: s.lord,
    catalogueId: s.catalogueId,
    // the engine's own figure, only brought into [0, 360) if it lies outside
    moonSiderealLongitude: siderealLongitude >= 0 && siderealLongitude < 360 ? siderealLongitude : wrap360(siderealLongitude),
    engine
  };
}
