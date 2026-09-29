/* The calculator's engine: @fusionstrings/panchangam 0.2.1, the browser build
 * published on JSR, vendored and pinned in vendor/panchangam@0.2.1/ (see its
 * NOTICE.md for what it contains and under which licences). This file is the
 * whole of the contact between the page and the engine: the pinned version,
 * the configuration, and the one shape a result is handed back in.
 *
 * Configuration, all of it explicit:
 *   - ayanamsa: Lahiri, the engine's mode 1 (SE_SIDM_LAHIRI). True
 *     Chitrapaksha is its mode 27 and is never passed; init() checks that the
 *     two give different values, so a confusion of modes cannot pass unseen.
 *   - position: geocentric (no SEFLG_TOPOCTR), from swe_calc_ut through
 *     p_calc_ut, for the Moon and the Sun, referred to the mean equinox of
 *     date (SEFLG_NONUT; aberration and light-time kept).
 *   - time: Universal Time. The Julian day is taken straight from the UTC
 *     instant (UTC and UT1 differ by under a second).
 *   - sidereal: that longitude minus the engine's mean Lahiri ayanamsa, once,
 *     here — the same as the apparent longitude minus the true ayanamsa, which
 *     is the Indian Astronomical Ephemeris's reckoning of nirayana longitude.
 *     (Subtracting the mean ayanamsa from the apparent longitude would leave
 *     up to 17″ of nutation in the result. The engine's own SEFLG_SIDEREAL
 *     path differs from either by a few arcseconds.)
 *
 * What is deliberately not used. The engine's own calculate_nakshatra,
 * calculate_planets, calculate_tithi, calculate_yoga and their start/end
 * finders hand the Julian day they are given to swe_calc, which reads it as
 * Terrestrial Time; given UT, they place the Moon ΔT (about 69 s in 2025)
 * too early, which moves a boundary by about a minute. The same holds for
 * calculate_daily_panchang, which in addition looks for sunrise from 0h UTC of
 * the date given (the next local day's sunrise east of about UTC+6) and
 * substitutes 06:00 UT where the Sun does not rise. So the sectors, their
 * start and end, the tithi, yoga and karaṇa are all derived here from the
 * UT positions, and sunrise is looked for within the local day and refused
 * where there is none. tests/jyotisha-engine.mjs holds the engine's own
 * functions to this and measures the ΔT offset.
 */
import { sectorOf, resultFromMoon, tithiOf, karanaOf, yogaOf, VARA_NAMES, weekdayOf } from './jyotisha.js';

export const ENGINE = Object.freeze({
  package: '@fusionstrings/panchangam',
  version: '0.2.1',
  source: 'jsr:@fusionstrings/panchangam@0.2.1/browser',
  url: './vendor/panchangam@0.2.1/panchangam.js',
  ayanamsaMode: 1,            // Lahiri — never 27, True Chitrapaksha
  trueChitraMode: 27,
  config: Object.freeze({ ayanamsa: 'Lahiri (mode 1)', position: 'geocentric, mean equinox of date', time: 'UT', sidereal: 'mean-equinox longitude − mean ayanamsa, once' })
});

// Swiss Ephemeris flag values, from swephexp.h (and the swiss-eph crate). The
// package documents SEFLG_NONUT as 1024, which is SEFLG_NOABERR; nutation is 64.
const SE_SUN = 0, SE_MOON = 1, SEFLG_SWIEPH = 2, SEFLG_NONUT = 64, SEFLG_SPEED = 256;
const FLAGS = SEFLG_SWIEPH | SEFLG_SPEED | SEFLG_NONUT;
const DAY = 86400000;
const S = 360 / 27;
export const jdOf = (utcMs) => utcMs / DAY + 2440587.5;
const msOf = (jd) => (jd - 2440587.5) * DAY;
const wrap360 = (x) => ((x % 360) + 360) % 360;
const wrap180 = (x) => wrap360(x + 180) - 180;

export class EngineError extends Error {
  constructor(kind, message, cause) { super(message); this.name = 'EngineError'; this.kind = kind; this.cause = cause; }
}

export function createEngine({ load = () => import(ENGINE.url) } = {}) {
  let lib = null, loading = null;

  async function init() {
    if (lib) return lib;
    if (!loading) {
      loading = (async () => {
        let mod;
        try { mod = await load(); }
        catch (err) { throw new EngineError('load', 'The calculation engine could not be loaded.', err); }
        const version = mod.get_version?.();
        if (version !== ENGINE.version) throw new EngineError('version', 'The calculation engine reports version ' + version + ', not ' + ENGINE.version + '.');
        // the configuration is real: Lahiri and True Chitrapaksha are told apart
        const jd = 2451545.0;
        const lahiri = mod.get_ayanamsha(ENGINE.ayanamsaMode, jd), trueCitra = mod.get_ayanamsha(ENGINE.trueChitraMode, jd);
        if (!(Number.isFinite(lahiri) && Math.abs(lahiri - trueCitra) > 1e-4 && lahiri > 23.8 && lahiri < 23.9)) {
          throw new EngineError('config', 'The calculation engine did not give the Lahiri ayanamsa as expected.');
        }
        lib = mod;
        return mod;
      })();
      // a failed start can be tried again
      loading.catch(() => { loading = null; });
    }
    return loading;
  }

  /* longitudes at one instant, in degrees: tropical, and sidereal (Lahiri) */
  function at(jd) {
    const moon = lib.p_calc_ut(jd, SE_MOON, FLAGS), sun = lib.p_calc_ut(jd, SE_SUN, FLAGS);
    const ayanamsa = lib.get_ayanamsha(ENGINE.ayanamsaMode, jd);
    return {
      moon: moon.longitude, sun: sun.longitude, moonSpeed: moon.speed_long, sunSpeed: sun.speed_long, ayanamsa,
      moonSidereal: wrap360(moon.longitude - ayanamsa), sunSidereal: wrap360(sun.longitude - ayanamsa)
    };
  }
  /* when a quantity growing at `rate` degrees a day crosses `target`, near jd */
  function crossing(jd, value, rate, target) {
    let t = jd + wrap180(target - value(jd)) / rate(jd);
    for (let i = 0; i < 12; i++) {
      const step = wrap180(target - value(t)) / rate(t);
      t += step;
      if (Math.abs(step) < 1e-8) break;                 // under a millisecond
    }
    return t;
  }
  const moonSid = (jd) => at(jd).moonSidereal;
  const moonRate = (jd) => at(jd).moonSpeed;
  const elong = (jd) => { const p = at(jd); return wrap360(p.moon - p.sun); };
  const elongRate = (jd) => { const p = at(jd); return p.moonSpeed - p.sunSpeed; };

  /* The sunrise that falls in the local civil day [dayStart, dayEnd), or null.
     The engine looks from 0h UTC of the date it is given, so the three UTC
     dates around the local day are asked and the one inside it is taken; its
     06:00 UT stand-in for a Sun that does not rise is recognised and refused. */
  function sunriseWithin(latitude, longitude, dayStart, dayEnd) {
    const place = new lib.Location(latitude, longitude, 0);
    try {
      for (const k of [-1, 0, 1]) {
        const d = new Date(dayStart + k * DAY);
        const [y, mo, dd] = [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()];
        const rise = lib.calculate_sunrise(y, mo, dd, place);
        if (!Number.isFinite(rise) || rise === Date.UTC(y, mo - 1, dd, 6)) continue;
        if (rise >= dayStart && rise < dayEnd) return rise;
      }
      return null;
    } finally { place.free?.(); }
  }

  /* One calculation. `day` is the local civil date entered, with its bounds
     as UTC instants, for the sunrise-based (udaya) details. */
  async function calculate({ utcMs, latitude, longitude, day }) {
    await init();
    const jd = jdOf(utcMs);
    const p = at(jd);
    const result = resultFromMoon(p.moonSidereal, { package: ENGINE.package, version: ENGINE.version, config: ENGINE.config });
    result.ayanamsa = p.ayanamsa;
    // the nakṣatra's own span, and the pada's, found from the Moon's motion
    const n = sectorOf(p.moonSidereal);
    result.nakshatraStart = msOf(crossing(jd, moonSid, moonRate, n.index * S));
    result.nakshatraEnd = msOf(crossing(jd, moonSid, moonRate, (n.index + 1) * S));
    result.padaEnd = msOf(crossing(jd, moonSid, moonRate, n.index * S + n.pada * S / 4));
    // the pañcāṅga at the local sunrise of the date entered (udaya), and the
    // vāra of the moment entered, which runs from sunrise to sunrise
    const rise = sunriseWithin(latitude, longitude, day.start, day.end);
    if (rise === null) {
      result.udaya = null;
      result.vara = null;
    } else {
      const r = at(jdOf(rise));
      const tithi = tithiOf(r.sun, r.moon);
      result.udaya = {
        sunrise: rise,
        tithi: { ...tithi, end: msOf(crossing(jdOf(rise), elong, elongRate, (tithi.index % 30) * 12)) },
        yoga: yogaOf(r.sunSidereal, r.moonSidereal),
        karana: karanaOf(r.sun, r.moon)
      };
      const w = (weekdayOf(day.date) + (utcMs < rise ? 6 : 0)) % 7;
      result.vara = { index: w, name: VARA_NAMES[w], beforeSunrise: utcMs < rise };
    }
    return result;
  }

  return { ...ENGINE, init, calculate, get ready() { return !!lib; }, _at: (jd) => (lib ? at(jd) : null), _lib: () => lib };
}
