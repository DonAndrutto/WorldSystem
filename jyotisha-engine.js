/* The calculator's engine: astronomy-engine 2.1.19 (MIT, Don Cross), vendored
 * and pinned in vendor/astronomy-engine@2.1.19/ and fetched the first time a
 * calculation is asked for. This file is the provider adapter: the only module
 * that imports the engine, and the one place its version, the ayanamsa, the
 * conventions and the shape of a result are fixed. The page depends on this
 * file alone, so the engine can be exchanged without touching the form.
 *
 * Conventions, all explicit:
 *   - The Moon: geocentric, on the true ecliptic of date (EclipticGeoMoon;
 *     astronomy-engine's lunar theory after the Improved Lunar Ephemeris, via
 *     Montenbruck & Pfleger). The Sun, for the pañcāṅga: SunPosition, the same
 *     frame, apparent.
 *   - Time: the UTC instant, which astronomy-engine carries to TT with its own
 *     ΔT model (Espenak & Meeus; about 75 s for 2025 against a true ~69 s, which
 *     moves the Moon by about 3″).
 *   - Ayanamsa: Lahiri only, from its published definition — 23°15′00.658″
 *     on 1956 March 21, the value adopted by the Calendar Reform Committee
 *     (Government of India, 1955) and used by the Indian Astronomical
 *     Ephemeris — carried by the general precession in longitude of Lieske et
 *     al. (1977, A&A 58, 1–16, IAU 1976). The 1956 figure is a true value, so
 *     the mean ayanamsa is that figure less the nutation of 1956 March 21, and
 *     the true ayanamsa of any date is the mean plus that date's nutation
 *     (Δψ from astronomy-engine's e_tilt).
 *   - Nirayana longitude = true-ecliptic longitude − true Lahiri ayanamsa,
 *     subtracted once, here.
 * No True Chitrapaksha, Raman or KP ayanamsa is offered. A Spica-anchored
 * ayanamsa (Spica at 180°) — which is what True Chitrapaksha means — is
 * computed only as a check (spicaAyanamsa), and differs from Lahiri by 33–40″
 * over 1900–2050; docs/NAKSHATRA-ENGINE.md records the comparison.
 */
import { sectorOf, resultFromMoon, tithiOf, karanaOf, yogaOf, VARA_NAMES, weekdayOf } from './jyotisha.js';

export const ENGINE = Object.freeze({
  package: 'astronomy-engine',
  version: '2.1.19',
  licence: 'MIT',
  url: './vendor/astronomy-engine@2.1.19/astronomy.js',
  config: Object.freeze({ ayanamsa: 'Lahiri (Calendar Reform Committee definition)', position: 'geocentric, true ecliptic of date', time: 'UTC → TT by the engine’s ΔT', sidereal: 'true-ecliptic longitude − true Lahiri ayanamsa, once' })
});

const DAY = 86400000;
const S = 360 / 27;
const wrap360 = (x) => ((x % 360) + 360) % 360;
const wrap180 = (x) => wrap360(x + 180) - 180;

/* the Lahiri definition, and the precession that carries it */
const LAHIRI_1956 = 23 + 15 / 60 + 0.658 / 3600;          // degrees, true, 1956 March 21
const LAHIRI_EPOCH_MS = Date.UTC(1956, 2, 21);
const J2000_MS = Date.UTC(2000, 0, 1, 12);
const centuries = (ms) => (ms - J2000_MS) / (36525 * DAY);
const precession = (T) => (5029.0966 * T + 1.11113 * T * T - 0.000006 * T ** 3) / 3600;   // p_A, degrees

/* Spica, for the check only: ICRS J2000 position and Hipparcos proper motion */
const SPICA = { ra: (13 + 25 / 60 + 11.5794 / 3600) * 15, dec: -(11 + 9 / 60 + 40.759 / 3600), pmRa: -42.35, pmDec: -30.67, ly: 250 };

export class EngineError extends Error {
  constructor(kind, message, cause) { super(message); this.name = 'EngineError'; this.kind = kind; this.cause = cause; }
}

/* How the engine is fetched in a browser. The first attempt is an ordinary
   import, checked against the hash the import map pins. A browser remembers a
   failed import of a URL for the life of the page, so a retry after a failed
   start fetches the same file with that same hash (read from the import map,
   the one place it is written) and imports it from a blob. */
let attempts = 0;
async function loadInBrowser() {
  if (attempts++ === 0) return import(ENGINE.url);
  const map = JSON.parse(document.querySelector('script[type="importmap"]')?.textContent || '{}');
  const integrity = map.integrity?.[ENGINE.url];
  if (!integrity) throw new Error('no pinned hash for ' + ENGINE.url);
  const response = await fetch(new URL(ENGINE.url, import.meta.url), { integrity, cache: 'no-store' });
  if (!response.ok) throw new Error(ENGINE.url + ' — ' + response.status);
  const blob = URL.createObjectURL(new Blob([await response.text()], { type: 'text/javascript' }));
  try { return await import(blob); } finally { URL.revokeObjectURL(blob); }
}

export function createEngine({ load = loadInBrowser } = {}) {
  let A = null, loading = null, meanAt1956 = null;

  async function init() {
    if (A) return A;
    if (!loading) {
      loading = (async () => {
        let mod;
        try { mod = await load(); }
        catch (err) { throw new EngineError('load', 'The calculation engine could not be loaded.', err); }
        if (typeof mod?.EclipticGeoMoon !== 'function' || typeof mod?.e_tilt !== 'function' || typeof mod?.MakeTime !== 'function') {
          throw new EngineError('version', 'The calculation engine is not astronomy-engine ' + ENGINE.version + '.');
        }
        const t0 = mod.MakeTime(new Date(LAHIRI_EPOCH_MS));
        const m1956 = LAHIRI_1956 - mod.e_tilt(t0).dpsi / 3600;
        // a sanity check of the configuration against the definition's own size
        const probe = m1956 + precession(centuries(J2000_MS)) - precession(centuries(LAHIRI_EPOCH_MS));
        if (!(probe > 23.84 && probe < 23.87)) throw new EngineError('config', 'The Lahiri ayanamsa did not come out as defined.');
        meanAt1956 = m1956;
        A = mod;
        return mod;
      })();
      loading.catch(() => { loading = null; });       // a failed start can be tried again
    }
    return loading;
  }

  /* the Lahiri ayanamsa at an instant: mean, and true (with that date's nutation) */
  function lahiri(ms) {
    const mean = meanAt1956 + precession(centuries(ms)) - precession(centuries(LAHIRI_EPOCH_MS));
    return { mean, true: mean + A.e_tilt(A.MakeTime(new Date(ms))).dpsi / 3600 };
  }
  /* longitudes at an instant, degrees */
  function at(ms) {
    const t = A.MakeTime(new Date(ms));
    const ay = lahiri(ms);
    const moon = A.EclipticGeoMoon(t).lon;
    const sun = A.SunPosition(t).elon;
    return { moon, sun, ayanamsa: ay.true, meanAyanamsa: ay.mean,
      moonSidereal: wrap360(moon - ay.true), sunSidereal: wrap360(sun - ay.true) };
  }
  /* when a quantity crosses `target`, near ms: secant-free Newton on a numeric rate */
  function crossing(ms, value, target) {
    const rate = (t) => wrap180(value(t + 1800000) - value(t - 1800000)) / 3600000;   // degrees per ms
    let t = ms + wrap180(target - value(ms)) / rate(ms);
    for (let i = 0; i < 12; i++) {
      const step = wrap180(target - value(t)) / rate(t);
      t += step;
      if (Math.abs(step) < 1) break;                     // under a millisecond
    }
    return t;
  }
  const moonSid = (ms) => at(ms).moonSidereal;
  const elong = (ms) => { const p = at(ms); return wrap360(p.moon - p.sun); };

  /* The Sun's rise (upper limb, standard refraction) within [dayStart, dayEnd), or null. */
  function sunriseWithin(latitude, longitude, dayStart, dayEnd) {
    const found = A.SearchRiseSet(A.Body.Sun, new A.Observer(latitude, longitude, 0), +1,
      A.MakeTime(new Date(dayStart)), (dayEnd - dayStart) / DAY);
    if (!found) return null;
    const ms = found.date.getTime();
    return ms >= dayStart && ms < dayEnd ? ms : null;
  }

  /* The adapter's own contract: one instant to one nakṣatra. Latitude and
     longitude are accepted for symmetry with a future ascendant, and do not
     enter the result: the nakṣatra is the geocentric Moon's alone. */
  function nakshatraAt(date, latitude, longitude) {
    const ms = date.getTime();
    const p = at(ms);
    const r = resultFromMoon(p.moonSidereal, { package: ENGINE.package, version: ENGINE.version, config: ENGINE.config });
    r.ayanamsa = p.ayanamsa;
    r.utc = new Date(ms).toISOString();
    return r;
  }

  /* One calculation for the form: the nakṣatra and its span, and the
     pañcāṅga at the local sunrise of the date entered. */
  async function calculate({ utcMs, latitude, longitude, day }) {
    await init();
    const result = nakshatraAt(new Date(utcMs), latitude, longitude);
    const n = sectorOf(result.moonSiderealLongitude);
    result.nakshatraStart = crossing(utcMs, moonSid, n.index * S);
    result.nakshatraEnd = crossing(utcMs, moonSid, (n.index + 1) * S);
    result.padaEnd = crossing(utcMs, moonSid, n.index * S + n.pada * S / 4);
    const rise = sunriseWithin(latitude, longitude, day.start, day.end);
    if (rise === null) {
      result.udaya = null;
      result.vara = null;
    } else {
      const r = at(rise);
      const tithi = tithiOf(r.sun, r.moon);
      result.udaya = {
        sunrise: rise,
        tithi: { ...tithi, end: crossing(rise, elong, (tithi.index % 30) * 12) },
        yoga: yogaOf(r.sunSidereal, r.moonSidereal),
        karana: karanaOf(r.sun, r.moon)
      };
      const w = (weekdayOf(day.date) + (utcMs < rise ? 6 : 0)) % 7;
      result.vara = { index: w, name: VARA_NAMES[w], beforeSunrise: utcMs < rise };
    }
    return result;
  }

  /* The Spica-anchored ayanamsa, for comparison: Spica's apparent true-ecliptic
     longitude less 180°. Not used for any result. */
  function spicaAyanamsa(ms) {
    const years = (ms - J2000_MS) / (365.25 * DAY);
    const dec = SPICA.dec + SPICA.pmDec * years / 3.6e6;
    const ra = SPICA.ra + SPICA.pmRa * years / 3.6e6 / Math.cos(SPICA.dec * Math.PI / 180);
    A.DefineStar(A.Body.Star1, ra / 15, dec, SPICA.ly);
    return A.Ecliptic(A.GeoVector(A.Body.Star1, A.MakeTime(new Date(ms)), true)).elon - 180;
  }

  return {
    ...ENGINE, init, calculate,
    calculateNakshatra: async (date, latitude, longitude) => { await init(); return nakshatraAt(date, latitude, longitude); },
    get ready() { return !!A; },
    lahiri: (ms) => (A ? lahiri(ms) : null), spicaAyanamsa: (ms) => (A ? spicaAyanamsa(ms) : null),
    _at: (ms) => (A ? at(ms) : null)
  };
}

/* The provider's single entry point for the rest of the app: one UTC instant
   to one nakṣatra, from a shared engine loaded on first use. */
let shared = null;
export function calculateNakshatra(date, latitude, longitude) {
  shared = shared || createEngine();
  return shared.calculateNakshatra(date, latitude, longitude);
}
