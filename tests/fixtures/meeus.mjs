// An independent reference for the calculator's tests: the Moon and Sun after
// Jean Meeus, Astronomical Algorithms (2nd ed., 1998), ch. 47 (the Moon, from
// ELP-2000/82, the 59 largest longitude terms; about 10″) and ch. 25 (the Sun,
// low accuracy; about 0.01°), with the principal nutation terms of ch. 22, ΔT
// after Espenak and Meeus's polynomials (NASA, 2006), and the Lahiri ayanamsa
// from its definition — 23°15′00.658″ on 1956 March 21.0 — carried by the IAU
// 1976 general precession in longitude. Nothing here shares code or data with
// astronomy-engine, the calculator's engine.
const rad = Math.PI / 180;
const wrap = (x) => ((x % 360) + 360) % 360;

// D, M, M′, F, coefficient of Σl (1e-6 degrees)
const TERMS = [
  [0, 0, 1, 0, 6288774], [2, 0, -1, 0, 1274027], [2, 0, 0, 0, 658314], [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116], [0, 0, 0, 2, -114332], [2, 0, -2, 0, 58793], [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322], [2, -1, 0, 0, 45758], [0, 1, -1, 0, -40923], [1, 0, 0, 0, -34720],
  [0, 1, 1, 0, -30383], [2, 0, 0, -2, 15327], [0, 0, 1, 2, -12528], [0, 0, 1, -2, 10980],
  [4, 0, -1, 0, 10675], [0, 0, 3, 0, 10034], [4, 0, -2, 0, 8548], [2, 1, -1, 0, -7888],
  [2, 1, 0, 0, -6766], [1, 0, -1, 0, -5163], [1, 1, 0, 0, 4987], [2, -1, 1, 0, 4036],
  [2, 0, 2, 0, 3994], [4, 0, 0, 0, 3861], [2, 0, -3, 0, 3665], [0, 1, -2, 0, -2689],
  [2, 0, -1, 2, -2602], [2, -1, -2, 0, 2390], [1, 0, 1, 0, -2348], [2, -2, 0, 0, 2236],
  [0, 1, 2, 0, -2120], [0, 2, 0, 0, -2069], [2, -2, -1, 0, 2048], [2, 0, 1, -2, -1773],
  [2, 0, 0, 2, -1595], [4, -1, -1, 0, 1215], [0, 0, 2, 2, -1110], [3, 0, -1, 0, -892],
  [2, 1, 1, 0, -810], [4, -1, -2, 0, 759], [0, 2, -1, 0, -713], [2, 2, -1, 0, -700],
  [2, 1, -2, 0, 691], [2, -1, 0, -2, 596], [4, 0, 1, 0, 549], [0, 0, 4, 0, 537],
  [4, -1, 0, 0, 520], [1, 0, -2, 0, -487], [2, 1, 0, -2, -399], [0, 0, 2, -2, -381],
  [1, 1, 1, 0, 351], [3, 0, -2, 0, -340], [4, 0, -3, 0, 330], [2, -1, 2, 0, 327],
  [0, 2, 1, 0, -323], [1, 1, -1, 0, 299], [2, 0, 3, 0, 294]
];

/* ΔT in seconds for a decimal year, 1961–2150 (Espenak & Meeus) */
export function deltaT(year) {
  if (year < 1986) { const t = year - 1975; return 45.45 + 1.067 * t - t * t / 260 - t ** 3 / 718; }
  if (year < 2005) { const t = year - 2000; return 63.86 + 0.3345 * t - 0.060374 * t * t + 0.0017275 * t ** 3 + 0.000651814 * t ** 4 + 0.00002373599 * t ** 5; }
  if (year < 2050) { const t = year - 2000; return 62.92 + 0.32217 * t + 0.005589 * t * t; }
  const u = (year - 1820) / 100; return -20 + 32 * u * u - 0.5628 * (2150 - year);
}

function nutationLongitude(T) {
  const om = 125.04452 - 1934.136261 * T, L = 280.4665 + 36000.7698 * T, Lm = 218.3165 + 481267.8813 * T;
  return (-17.20 * Math.sin(om * rad) - 1.32 * Math.sin(2 * L * rad) - 0.23 * Math.sin(2 * Lm * rad) + 0.21 * Math.sin(2 * om * rad)) / 3600;
}

/* apparent geocentric longitudes of date, degrees, for a UTC instant */
export function meeus(utcMs) {
  const jd = utcMs / 86400000 + 2440587.5;
  const year = 2000 + (jd - 2451545) / 365.25;
  const jde = jd + deltaT(year) / 86400;
  const T = (jde - 2451545) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T ** 3 / 538841 - T ** 4 / 65194000;
  const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T ** 3 / 545868 - T ** 4 / 113065000;
  const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T ** 3 / 24490000;
  const Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T ** 3 / 69699 - T ** 4 / 14712000;
  const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T ** 3 / 3526000 + T ** 4 / 863310000;
  const A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.290 * T;
  const E = 1 - 0.002516 * T - 0.0000074 * T * T;
  let sl = 0;
  for (const [d, m, mp, f, c] of TERMS) sl += c * E ** Math.abs(m) * Math.sin((d * D + m * M + mp * Mp + f * F) * rad);
  sl += 3958 * Math.sin(A1 * rad) + 1962 * Math.sin((Lp - F) * rad) + 318 * Math.sin(A2 * rad);
  const dpsi = nutationLongitude(T);
  const moon = wrap(Lp + sl / 1e6 + dpsi);
  // the Sun, ch. 25
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const Ms = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Ms * rad) + (0.019993 - 0.000101 * T) * Math.sin(2 * Ms * rad) + 0.000289 * Math.sin(3 * Ms * rad);
  const om = 125.04 - 1934.136 * T;
  const sun = wrap(L0 + C - 0.00569 - 0.00478 * Math.sin(om * rad));
  return { moon, sun, deltaT: deltaT(year), T };
}

/* the Lahiri ayanamsa (mean), degrees, for a UTC instant */
export function lahiri(utcMs) {
  const pA = (T) => (5029.0966 * T + 1.11113 * T * T - 0.000006 * T ** 3) / 3600;   // IAU 1976, from J2000
  const T0 = (2435553.5 - 2451545) / 36525;
  const jd = utcMs / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525;
  return (23 + 15 / 60 + 0.658 / 3600) + pA(T) - pA(T0);
}

/* Nirayana (sidereal) longitude by the Indian Astronomical Ephemeris's
   reckoning: apparent longitude minus the true ayanamsa, where the published
   23°15′00.658″ of 1956 March 21 is itself a true value (nutation included). */
export function nirayana(apparentLongitude, utcMs) {
  const jd = utcMs / 86400000 + 2440587.5;
  const T = (jd - 2451545) / 36525, T0 = (2435553.5 - 2451545) / 36525;
  const trueAyanamsa = lahiri(utcMs) - nutationLongitude(T0) + nutationLongitude(T);
  return wrap(apparentLongitude - trueAyanamsa);
}
