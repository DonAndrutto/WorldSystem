// @generated file from wasmbuild -- do not edit
// deno-lint-ignore-file
// deno-fmt-ignore-file

export class AshtakavargaResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly bindus: Int32Array;
  /**
   * Planet ID (0=Sun .. 6=Saturn)
   */
  planet_id: number;
}

/**
 * Ayanamsha modes
 */
export enum AyanamshaMode {
  /**
   * Fagan-Bradley (0)
   */
  FaganBradley = 0,
  /**
   * Lahiri (1)
   */
  Lahiri = 1,
  /**
   * De Luce (2)
   */
  DeLuce = 2,
  /**
   * Raman (3)
   */
  Raman = 3,
  /**
   * Krishnamurti (5)
   */
  Krishnamurti = 5,
  /**
   * Yukteshwar (7)
   */
  Yukteshwar = 7,
  /**
   * J.N. Bhasin (8)
   */
  JNBhasin = 8,
  /**
   * True Chitrapaksha (27)
   */
  TrueCitra = 27,
}

export class CharaDashaPeriod {
  free(): void;
  [Symbol.dispose](): void;
  constructor(
    sign_id: number,
    duration_years: number,
    start_year: number,
    end_year: number,
  );
  sign_id: number;
  duration_years: number;
  start_year: number;
  end_year: number;
}

export class Constants {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * ICRS coordinates (131072)
   */
  static readonly SEFLG_ICRS: number;
  /**
   * Julian calendar (0)
   */
  static readonly SE_JUL_CAL: number;
  /**
   * Jupiter (5)
   */
  static readonly SE_JUPITER: number;
  /**
   * Mercury (2)
   */
  static readonly SE_MERCURY: number;
  /**
   * Neptune (8)
   */
  static readonly SE_NEPTUNE: number;
  /**
   * J2000 epoch (32)
   */
  static readonly SEFLG_J2000: number;
  /**
   * No nutation (no nutation in longitude and obliquity) (1024)
   */
  static readonly SEFLG_NONUT: number;
  /**
   * Include speed in output (256)
   */
  static readonly SEFLG_SPEED: number;
  /**
   * Gregorian calendar (1)
   */
  static readonly SE_GREG_CAL: number;
  /**
   * Heliocentric positions (8)
   */
  static readonly SEFLG_HELCTR: number;
  /**
   * Use Moshier Ephemeris (4)
   */
  static readonly SEFLG_MOSEPH: number;
  /**
   * Use Swiss Ephemeris (2)
   */
  static readonly SEFLG_SWIEPH: number;
  /**
   * Mean Lunar Node / Rahu (10)
   */
  static readonly SE_MEAN_NODE: number;
  /**
   * True Lunar Node / Rahu (11)
   */
  static readonly SE_TRUE_NODE: number;
  /**
   * Topocentric positions (32768)
   */
  static readonly SEFLG_TOPOCTR: number;
  /**
   * True positions - no aberration (16)
   */
  static readonly SEFLG_TRUEPOS: number;
  /**
   * Raman (3)
   */
  static readonly SE_SIDM_RAMAN: number;
  /**
   * Sidereal positions (65536)
   */
  static readonly SEFLG_SIDEREAL: number;
  /**
   * De Luce (2)
   */
  static readonly SE_SIDM_DELUCE: number;
  /**
   * Lahiri (1)
   */
  static readonly SE_SIDM_LAHIRI: number;
  /**
   * Equatorial positions (2048)
   */
  static readonly SEFLG_EQUATORIAL: number;
  /**
   * J.N. Bhasin (8)
   */
  static readonly SE_SIDM_JN_BHASIN: number;
  /**
   * Yukteshwar (7)
   */
  static readonly SE_SIDM_YUKTESHWAR: number;
  /**
   * Krishnamurti (5)
   */
  static readonly SE_SIDM_KRISHNAMURTI: number;
  /**
   * Fagan/Bradley (0)
   */
  static readonly SE_SIDM_FAGAN_BRADLEY: number;
  /**
   * Sun (0)
   */
  static readonly SE_SUN: number;
  /**
   * Mars (4)
   */
  static readonly SE_MARS: number;
  /**
   * Moon (1)
   */
  static readonly SE_MOON: number;
  /**
   * Pluto (9)
   */
  static readonly SE_PLUTO: number;
  /**
   * Venus (3)
   */
  static readonly SE_VENUS: number;
  /**
   * Chiron (12)
   */
  static readonly SE_CHIRON: number;
  /**
   * Pholus (13)
   */
  static readonly SE_PHOLUS: number;
  /**
   * Saturn (6)
   */
  static readonly SE_SATURN: number;
  /**
   * Uranus (7)
   */
  static readonly SE_URANUS: number;
}

export enum D10Variation {
  Parashara = 0,
  Behari = 1,
}

export enum D2Variation {
  Parashara = 0,
  LabhaMandooka = 1,
  Kura = 2,
  Kashinatha = 3,
}

export enum D3Variation {
  Parashara = 0,
  Jagannatha = 1,
  Somanatha = 2,
  Parivritti = 3,
}

export enum D9Variation {
  Parashara = 0,
  KrishnaMishra = 1,
  Somanatha = 2,
  Nadamsa = 3,
}

export class DailyPanchang {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly planets: any;
  /**
   * Sunrise time in Unix milliseconds
   */
  sunrise: number;
  /**
   * Sunset time in Unix milliseconds
   */
  sunset: number;
  /**
   * Tithi index (1-30). 15 = Purnima, 30 = Amavasya.
   */
  tithi_index: number;
  /**
   * Name of the Tithi (e.g., "Shukla-Chaturdashi")
   */
  tithi_name: string;
  /**
   * Timestamp (Unix ms) when this Tithi started.
   */
  get tithi_start_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Tithi started.
   */
  set tithi_start_time(value: number | null | undefined);
  /**
   * Timestamp (Unix ms) when this Tithi ends. None if it doesn't end today.
   */
  get tithi_end_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Tithi ends. None if it doesn't end today.
   */
  set tithi_end_time(value: number | null | undefined);
  /**
   * Nakshatra index (1-27). 1 = Ashwini.
   */
  nakshatra_index: number;
  /**
   * Name of the Nakshatra (e.g., "Krittika")
   */
  nakshatra_name: string;
  /**
   * Timestamp (Unix ms) when this Nakshatra started.
   */
  get nakshatra_start_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Nakshatra started.
   */
  set nakshatra_start_time(value: number | null | undefined);
  /**
   * Timestamp (Unix ms) when this Nakshatra ends.
   */
  get nakshatra_end_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Nakshatra ends.
   */
  set nakshatra_end_time(value: number | null | undefined);
  /**
   * Yoga index (1-27).
   */
  yoga_index: number;
  /**
   * Name of the Yoga (e.g., "Vishkumbha")
   */
  yoga_name: string;
  /**
   * Timestamp (Unix ms) when this Yoga started.
   */
  get yoga_start_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Yoga started.
   */
  set yoga_start_time(value: number | null | undefined);
  /**
   * Timestamp (Unix ms) when this Yoga ends.
   */
  get yoga_end_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Yoga ends.
   */
  set yoga_end_time(value: number | null | undefined);
  /**
   * Karana index (1-60).
   */
  karana_index: number;
  /**
   * Name of the Karana (e.g., "Bava")
   */
  karana_name: string;
  /**
   * Timestamp (Unix ms) when this Karana started.
   */
  get karana_start_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Karana started.
   */
  set karana_start_time(value: number | null | undefined);
  /**
   * Timestamp (Unix ms) when this Karana ends.
   */
  get karana_end_time(): number | undefined;
  /**
   * Timestamp (Unix ms) when this Karana ends.
   */
  set karana_end_time(value: number | null | undefined);
  /**
   * Solar Weekday name (e.g., "Adityawara")
   */
  vara_name: string;
  /**
   * Sidereal Ascendant (Lagna) at sunrise (degrees)
   */
  ascendant: number;
  /**
   * Sidereal Midheaven (MC) at sunrise (degrees)
   */
  mc: number;
  /**
   * The Ayanamsha value (in degrees) used for calculations
   */
  ayanamsha_value: number;
  /**
   * Auspicious and Inauspicious time periods for the day
   */
  muhurats: DayMuhurats;
}

export class DashaInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Current Mahadasha lord
   */
  mahadasha: string;
  /**
   * Current Antardasha lord
   */
  antardasha: string;
  /**
   * Current Pratyantardasha lord
   */
  pratyantardasha: string;
  /**
   * Date when the current Mahadasha ends (Unix ms)
   */
  mahadasha_end_date: number;
  /**
   * Date when the current Antardasha ends (Unix ms)
   */
  antardasha_end_date: number;
  /**
   * Date when the current Pratyantardasha ends (Unix ms)
   */
  pratyantardasha_end_date: number;
  /**
   * Birth Nakshatra name
   */
  nakshatra_name: string;
  /**
   * Birth Nakshatra pada (1-4)
   */
  nakshatra_pada: number;
}

export class DayMuhurats {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Period of Raahu (Inauspicious for starting new ventures)
   */
  rahu_kalam: Muhurat;
  /**
   * Period of Yama (Inauspicious)
   */
  yamaganda: Muhurat;
  /**
   * Period of Gulika (Neutral/Inauspicious)
   */
  gulika: Muhurat;
  /**
   * Brahma Muhurta (Pre-dawn)
   */
  brahma_muhurta: Muhurat;
  /**
   * Abhijit Muhurta (Mid-day victory period)
   */
  abhijit_muhurta: Muhurat;
}

/**
 * Planetary Dignity status
 */
export enum Dignity {
  Exalted = 0,
  Moolatrikona = 1,
  OwnSign = 2,
  GreatFriend = 3,
  Friend = 4,
  Neutral = 5,
  Enemy = 6,
  GreatEnemy = 7,
  Debilitated = 8,
}

export class HouseInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Ascendant (Lagna) in degrees (0-360)
   */
  ascendant: number;
  /**
   * Midheaven (MC) in degrees
   */
  mc: number;
  /**
   * ARMC (Sidereal Time)
   */
  armc: number;
  /**
   * Vertex
   */
  vertex: number;
  /**
   * Equatorial Ascendant
   */
  equatorial_ascendant: number;
  /**
   * Co-Ascendant 1 (Koch)
   */
  co_ascendant1: number;
  /**
   * Co-Ascendant 2 (Munkasey)
   */
  co_ascendant2: number;
  /**
   * Polar Ascendant
   */
  polar_ascendant: number;
  /**
   * House cusps (1-12)
   * Note: Swiss Eph returns 13 values (0 is ignored), we return vector of 12
   */
  cusps: Float64Array;
}

export class JaiminiProfile {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  karakas: KarakaObject[];
}

export enum KarakaName {
  AtmaKaraka = 0,
  AmatyaKaraka = 1,
  BhatriKaraka = 2,
  MatriKaraka = 3,
  PitraKaraka = 4,
  PutraKaraka = 5,
  GnatiKaraka = 6,
  DaraKaraka = 7,
}

export class KarakaObject {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  planet_id: number;
  karaka_name: KarakaName;
  longitude: number;
}

export class KaranaInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Karana index (1-60 per lunar month)
   */
  index: number;
  /**
   * Karana name
   */
  name: string;
  /**
   * Whether first or second half of Tithi
   */
  half: number;
}

export class Location {
  free(): void;
  [Symbol.dispose](): void;
  constructor(latitude: number, longitude: number, altitude: number);
  latitude: number;
  longitude: number;
  altitude: number;
}

export class Muhurat {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Name of the Muhurat (e.g., "Rahu Kalam")
   */
  name: string;
  /**
   * Start time in Unix milliseconds
   */
  start: number;
  /**
   * End time in Unix milliseconds
   */
  end: number;
}

export class NakshatraInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Nakshatra index (1-27)
   */
  index: number;
  /**
   * Nakshatra name
   */
  name: string;
  /**
   * Planetary ruler
   */
  ruler: string;
  /**
   * Quality/nature
   */
  quality: string;
  /**
   * Pada (quarter, 1-4)
   */
  pada: number;
}

/**
 * Paksha (lunar fortnight)
 */
export enum Paksha {
  Shukla = 0,
  Krishna = 1,
}

export class PlanetData {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  id: number;
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
  is_retrograde: boolean;
  is_combust: boolean;
  dignity: Dignity;
}

export class Position {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Ecliptic longitude in degrees
   */
  longitude: number;
  /**
   * Ecliptic latitude in degrees
   */
  latitude: number;
  /**
   * Distance (AU for planets, Earth radii for Moon)
   */
  distance: number;
  /**
   * Longitude speed (degrees/day)
   */
  longitude_speed: number;
  /**
   * Latitude speed (degrees/day)
   */
  latitude_speed: number;
  /**
   * Distance speed (AU/day)
   */
  distance_speed: number;
}

export class PrastaraResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly grid: Uint8Array;
  /**
   * Target Planet ID (0-6)
   */
  planet_id: number;
}

export class ReducedAshtakavarga {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly reduced_bindus: Int32Array;
  shodaya_pinda: number;
}

export class Sarvashtakavarga {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly totals: Int32Array;
}

export class ShadbalaProfile {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  sun: ShadbalaResult;
  moon: ShadbalaResult;
  mars: ShadbalaResult;
  mercury: ShadbalaResult;
  jupiter: ShadbalaResult;
  venus: ShadbalaResult;
  saturn: ShadbalaResult;
}

export class ShadbalaResult {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Total Shadbala in Rupas
   */
  total_rupas: number;
  /**
   * Ishta Phala (0-60)
   */
  ishta_phala: number;
  /**
   * Kashta Phala (0-60)
   */
  kashta_phala: number;
  sthana_bala: number;
  dig_bala: number;
  kala_bala: number;
  chesta_bala: number;
  naisargika_bala: number;
  drik_bala: number;
}

export class SpecialLagnas {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  hora_lagna: number;
  ghati_lagna: number;
  sree_lagna: number;
}

export class SwissEphError {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Error message from the library
   */
  message: string;
  /**
   * Return code
   */
  code: number;
}

export class TimeInterval {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Start time as Unix timestamp in ms
   */
  start_ms: number;
  /**
   * End time as Unix timestamp in ms
   */
  end_ms: number;
  /**
   * Duration in minutes
   */
  duration_minutes: number;
}

export class TithiInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Tithi index (1-30)
   */
  index: number;
  /**
   * Tithi name
   */
  name: string;
  /**
   * Lunar fortnight
   */
  paksha: Paksha;
  /**
   * Completion percentage (0.0 to 1.0)
   */
  completion: number;
  readonly paksha_name: string;
}

export class VaraInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Day index (0=Sunday, 6=Saturday)
   */
  index: number;
  /**
   * Sanskrit weekday name
   */
  name: string;
  /**
   * Planetary lord
   */
  lord: string;
}

export class VargaPosition {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * The sign in the divisional chart (1-12)
   */
  sign: number;
  /**
   * Exact longitude within that sign (0-30 degrees)
   */
  longitude: number;
  /**
   * Absolute longitude in the Varga chart (0-360)
   */
  full_longitude: number;
}

export enum VargaType {
  D1 = 1,
  D2 = 2,
  D3 = 3,
  D4 = 4,
  D7 = 7,
  D9 = 9,
  D10 = 10,
  D12 = 12,
  D16 = 16,
  D20 = 20,
  D24 = 24,
  D27 = 27,
  D30 = 30,
  D40 = 40,
  D45 = 45,
  D60 = 60,
}

export class WarDetails {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  planet1_id: number;
  planet1_name: string;
  planet1_long: number;
  planet1_mag: number;
  planet2_id: number;
  planet2_name: string;
  planet2_long: number;
  planet2_mag: number;
  longitude_diff: number;
  winner_id: number;
}

export class YogaInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Yoga index (1-27)
   */
  index: number;
  /**
   * Yoga name
   */
  name: string;
}

export class YogaResult {
  free(): void;
  [Symbol.dispose](): void;
  constructor(name: string, description: string);
  readonly description: string;
  readonly name: string;
}

export class YoginiInfo {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  /**
   * Current Mahadasha lord (Yogini)
   */
  mahadasha: string;
  /**
   * Current Antardasha lord (Yogini)
   */
  antardasha: string;
  /**
   * Date when the current Mahadasha ends (Unix ms)
   */
  mahadasha_end_date: number;
  /**
   * Date when the current Antardasha ends (Unix ms)
   */
  antardasha_end_date: number;
}

/**
 * Calculate planetary position using UT (Universal Time)
 */
export function calc_ut(jd_ut: number, planet: number, flags: number): Position;

/**
 * Calculate Sarvashtakavarga (Ashtakavarga Totals)
 * Calculate Sarvashtakavarga (Ashtakavarga Totals)
 */
export function calculate_ashtakavarga(
  planet_longs: any,
  ascendant: number,
): Sarvashtakavarga;

/**
 * Calculate Jaimini Chara Dasha Periods
 */
export function calculate_chara_dasha_periods(
  planet_longs: any,
  ascendant_sign: number,
  start_year: number,
): CharaDashaPeriod[];

/**
 * Calculate the complete Panchangam for a given date and location.
 *
 * This function performs the following steps:
 * 1. Calculates exact local Sunrise and Sunset times.
 * 2. Determines the Ayanamsha (precession) based on the selected mode.
 * 3. Computes the 5 Angas (Tithi, Nakshatra, Yoga, Karana, Vara) at the moment of Sunrise.
 * 4. Iteratively finds the end times for Tithi, Nakshatra, and Yoga using binary search.
 * 5. Calculates daily Muhurats (Rahu Kalam, Yamaganda, etc.) based on day division.
 *
 * # Arguments
 * * `year` - Year (e.g., 2026)
 * * `month` - Month (1-12)
 * * `day` - Day of month (1-31)
 * * `location` - The geographical location of the observer
 * * `ayan_mode` - Ayanamsha mode:
 *     * 1 = Lahiri (Chitrapaksha) [Default/Standard]
 *     * 3 = Raman
 *     * 5 = Krishnamurti
 *     * 27 = True Chitrapaksha
 */
export function calculate_daily_panchang(
  year: number,
  month: number,
  day: number,
  location: Location,
  ayan_mode: number,
): DailyPanchang;

/**
 * Calculate Full Shadbala Profile (All 7 planets)
 */
export function calculate_full_shadbala(
  planet_longs: any,
  jd: number,
  ascendant: number,
): ShadbalaProfile;

/**
 * Calculate Gulika Kaal for a given day
 */
export function calculate_gulika(
  sunrise_ms: number,
  sunset_ms: number,
  weekday: number,
): TimeInterval;

/**
 * Calculate house system (Ascendant, MC, House Cusps)
 *
 * # Arguments
 * * `jd` - Julian Day
 * * `lat` - Latitude
 * * `lon` - Longitude
 * * `hsys` - House System (e.g. 'P' for Placidus, 'W' for Whole Sign)
 * * `ayan_mode` - Ayanamsha mode (-1 for tropical, others for sidereal)
 */
export function calculate_houses(
  jd: number,
  lat: number,
  lon: number,
  hsys: string,
  ayan_mode: number,
): HouseInfo;

/**
 * Calculate Jaimini Karakas
 */
export function calculate_jaimini_karakas(
  planet_longs: any,
  use_8_karakas: boolean,
): KarakaObject[];

/**
 * Calculate Karana for a given Julian Day
 * There are 60 Karanas per lunar month (2 per Tithi)
 */
export function calculate_karana(jd: number): KaranaInfo;

/**
 * Calculate Raahu, Yamaganda, and Gulika for a given day
 *
 * # Arguments
 * * `sunrise_ms` - Unix timestamp of sunrise in ms
 * * `sunset_ms` - Unix timestamp of sunset in ms
 * * `weekday` - 0=Sunday, 1=Monday, ..., 6=Saturday
 */
export function calculate_muhurats(
  sunrise_ms: number,
  sunset_ms: number,
  weekday: number,
): DayMuhurats;

/**
 * Calculate Nakshatra for a given Julian Day
 * Each Nakshatra spans 13°20' (13.333... degrees)
 */
export function calculate_nakshatra(
  jd: number,
  ayanamsha_mode: AyanamshaMode,
): NakshatraInfo;

/**
 * Calculate Shadbala for a single planet (Stub)
 */
export function calculate_planet_strength(
  long: number,
  planet_id: number,
  jd: number,
  ascendant: number,
): ShadbalaResult;

/**
 * Calculate Sidereal Planet Positions for all 9 core planets
 *
 * # Arguments
 * * `jd` - Julian Day
 * * `ayan_mode` - Ayanamsha mode (e.g., 1 for Lahiri)
 */
export function calculate_planets(jd: number, ayan_mode: number): any;

/**
 * Calculate Prastara Ashtakavarga (Detailed Grid)
 */
export function calculate_prastara_ashtakavarga(
  planet_id: number,
  planet_longs: any,
  ascendant: number,
): PrastaraResult;

/**
 * Calculate Rahu Kaal for a given day
 * sunrise_ms and sunset_ms are Unix timestamps in milliseconds
 * weekday is 0=Sunday, 6=Saturday
 */
export function calculate_rahu_kaal(
  sunrise_ms: number,
  sunset_ms: number,
  weekday: number,
): TimeInterval;

/**
 * Calculate Ashtakavarga Reductions (Trikona & Ekadhipatya)
 */
export function calculate_reduced_ashtakavarga(
  bindus: any,
  planet_longs: any,
): ReducedAshtakavarga;

/**
 * Calculate Special Lagnas (Hora, Ghati, Sree Lagna)
 */
export function calculate_special_lagnas(
  birth_jd: number,
  sunrise_jd: number,
  sunrise_sun_long: number,
  lagna_long: number,
  moon_long: number,
): SpecialLagnas;

/**
 * Calculate sunrise time for a given date and location
 * Returns Unix timestamp in milliseconds
 */
export function calculate_sunrise(
  year: number,
  month: number,
  day: number,
  location: Location,
): number;

/**
 * Calculate sunset time for a given date and location
 * Returns Unix timestamp in milliseconds
 */
export function calculate_sunset(
  year: number,
  month: number,
  day: number,
  location: Location,
): number;

/**
 * Calculate Tithi for a given Julian Day
 * Returns TithiInfo with index, name, paksha, and completion percentage
 */
export function calculate_tithi(jd: number): TithiInfo;

/**
 * Calculate Vara (weekday) for a given Julian Day
 * Note: This returns the astronomical weekday.
 * For Vedic Vara, compare with sunrise time.
 */
export function calculate_vara(jd: number): VaraInfo;

/**
 * Calculate specific Varga position
 * Calculate specific Varga position
 * Calculate specific Varga position
 */
export function calculate_varga(
  long: number,
  varga_val: number,
  config: any,
): VargaPosition;

/**
 * Calculate Vimshottari Dasha details
 *
 * # Arguments
 * * `moon_long` - Moon's sidereal longitude (degrees)
 * * `birth_time_ms` - Birth time (Unix ms)
 * * `current_time_ms` - Current time (Unix ms)
 */
export function calculate_vimshottari(
  moon_long: number,
  birth_time_ms: number,
  current_time_ms: number,
): DashaInfo;

/**
 * Calculate Yamaganda for a given day
 */
export function calculate_yamaganda(
  sunrise_ms: number,
  sunset_ms: number,
  weekday: number,
): TimeInterval;

/**
 * Calculate Yoga for a given Julian Day
 * Formula: Yoga = floor((Moon_long + Sun_long) / 13.333) + 1
 */
export function calculate_yoga(
  jd: number,
  ayanamsha_mode: AyanamshaMode,
): YogaInfo;

/**
 * Calculate Yogini Dasha details
 */
export function calculate_yogini(
  moon_long: number,
  birth_time_ms: number,
  current_time_ms: number,
): YoginiInfo;

/**
 * Check for Planetary War (Graha Yuddha)
 * Occurs when two Tara Grahas (Mars, Mercury, Jupiter, Venus, Saturn)
 * are within 1 degree of each other.
 */
export function check_graha_yuddha(jd: number, ayan_mode: number): any;

/**
 * Find active Yogas (Planetary Combinations)
 */
export function find_active_yogas(
  planet_longs: any,
  ascendant: number,
): YogaResult[];

/**
 * Get Ayanamsha value for a given mode and Julian Day
 * Get Ayanamsha value for a given mode and Julian Day
 */
export function get_ayanamsha(mode: AyanamshaMode, jd: number): number;

/**
 * Get the underlying Swiss Ephemeris engine version
 */
export function get_swisseph_version(): string;

/**
 * Get the library version (panchangam)
 */
export function get_version(): string;

/**
 * Calculate Julian Day when current Karana ends
 */
export function karana_end_time(jd: number): number;

/**
 * Calculate Julian Day when current Karana started
 */
export function karana_start_time(jd: number): number;

/**
 * Calculate Julian Day when Moon transitions to next Nakshatra
 */
export function nakshatra_end_time(
  jd: number,
  ayanamsha_mode: AyanamshaMode,
): number;

/**
 * Calculate Julian Day when current Nakshatra started
 */
export function nakshatra_start_time(
  jd: number,
  ayanamsha_mode: AyanamshaMode,
): number;

/**
 * Calculate planetary position (UT)
 *
 * Returns simple struct with longitude, latitude, distance, speed values.
 */
export function p_calc_ut(tjd_ut: number, ipl: number, iflag: number): any;

/**
 * Calculate Julian Day number
 *
 * # Arguments
 * * `year` - Year
 * * `month` - Month
 * * `day` - Day
 * * `hour` - Hour
 * * `gregflag` - Calendar flag (1 = Gregorian, 0 = Julian)
 */
export function p_julday(
  year: number,
  month: number,
  day: number,
  hour: number,
  gregflag: number,
): number;

/**
 * Set the ephemeris path
 */
export function set_ephe_path(path: string): void;

/**
 * Julian Day when the current Tithi ends
 */
export function tithi_end_time(jd: number): number;

/**
 * Julian Day when the current Tithi started
 */
export function tithi_start_time(jd: number): number;

/**
 * Get Swiss Ephemeris version
 */
export function version(): string;

/**
 * Calculate Julian Day when current Yoga ends
 */
export function yoga_end_time(
  jd: number,
  ayanamsha_mode: AyanamshaMode,
): number;

/**
 * Calculate Julian Day when current Yoga started
 */
export function yoga_start_time(
  jd: number,
  ayanamsha_mode: AyanamshaMode,
): number;
