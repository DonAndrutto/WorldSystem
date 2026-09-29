// @generated file from wasmbuild -- do not edit
// @ts-nocheck: generated
// deno-lint-ignore-file
// deno-fmt-ignore-file

let wasm;
export function __wbg_set_wasm(val) {
  wasm = val;
}

function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}

function _assertChar(c) {
  if (typeof c === "number" && (c >= 0x110000 || (c >= 0xD800 && c < 0xE000))) {
    throw new Error(`expected a valid Unicode scalar value, found ${c}`);
  }
}

function _assertClass(instance, klass) {
  if (!(instance instanceof klass)) {
    throw new Error(`expected instance of ${klass.name}`);
  }
}

function debugString(val) {
  // primitive types
  const type = typeof val;
  if (type == "number" || type == "boolean" || val == null) {
    return `${val}`;
  }
  if (type == "string") {
    return `"${val}"`;
  }
  if (type == "symbol") {
    const description = val.description;
    if (description == null) {
      return "Symbol";
    } else {
      return `Symbol(${description})`;
    }
  }
  if (type == "function") {
    const name = val.name;
    if (typeof name == "string" && name.length > 0) {
      return `Function(${name})`;
    } else {
      return "Function";
    }
  }
  // objects
  if (Array.isArray(val)) {
    const length = val.length;
    let debug = "[";
    if (length > 0) {
      debug += debugString(val[0]);
    }
    for (let i = 1; i < length; i++) {
      debug += ", " + debugString(val[i]);
    }
    debug += "]";
    return debug;
  }
  // Test for built-in
  const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
  let className;
  if (builtInMatches && builtInMatches.length > 1) {
    className = builtInMatches[1];
  } else {
    // Failed to match the standard '[object ClassName]'
    return toString.call(val);
  }
  if (className == "Object") {
    // we're a user defined class or Object
    // JSON.stringify avoids problems with cycles, and is generally much
    // easier than looping through ownProperties of `val`.
    try {
      return "Object(" + JSON.stringify(val) + ")";
    } catch (_) {
      return "Object";
    }
  }
  // errors
  if (val instanceof Error) {
    return `${val.name}: ${val.message}\n${val.stack}`;
  }
  // TODO we could test for more things here, like `Set`s and `Map`s.
  return className;
}

function getArrayF64FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getFloat64ArrayMemory0().subarray(ptr / 8, ptr / 8 + len);
}

function getArrayI32FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getInt32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayJsValueFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  const mem = getDataViewMemory0();
  const result = [];
  for (let i = ptr; i < ptr + 4 * len; i += 4) {
    result.push(wasm.__wbindgen_externrefs.get(mem.getUint32(i, true)));
  }
  wasm.__externref_drop_slice(ptr, len);
  return result;
}

function getArrayU8FromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
}

let cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (
    cachedDataViewMemory0 === null ||
    cachedDataViewMemory0.buffer.detached === true ||
    (cachedDataViewMemory0.buffer.detached === undefined &&
      cachedDataViewMemory0.buffer !== wasm.memory.buffer)
  ) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}

let cachedFloat64ArrayMemory0 = null;
function getFloat64ArrayMemory0() {
  if (
    cachedFloat64ArrayMemory0 === null ||
    cachedFloat64ArrayMemory0.byteLength === 0
  ) {
    cachedFloat64ArrayMemory0 = new Float64Array(wasm.memory.buffer);
  }
  return cachedFloat64ArrayMemory0;
}

let cachedInt32ArrayMemory0 = null;
function getInt32ArrayMemory0() {
  if (
    cachedInt32ArrayMemory0 === null || cachedInt32ArrayMemory0.byteLength === 0
  ) {
    cachedInt32ArrayMemory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachedInt32ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(ptr, len);
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (
    cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0
  ) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}

function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

function passArrayF64ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 8, 8) >>> 0;
  getFloat64ArrayMemory0().set(arg, ptr / 8);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function passArrayJsValueToWasm0(array, malloc) {
  const ptr = malloc(array.length * 4, 4) >>> 0;
  for (let i = 0; i < array.length; i++) {
    const add = addToExternrefTable0(array[i]);
    getDataViewMemory0().setUint32(ptr + 4 * i, add, true);
  }
  WASM_VECTOR_LEN = array.length;
  return ptr;
}

function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === undefined) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr, ptr + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr;
  }

  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;

  const mem = getUint8ArrayMemory0();

  let offset = 0;

  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 0x7F) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);

    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }

  WASM_VECTOR_LEN = offset;
  return ptr;
}

function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}

let cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true,
});
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
  numBytesDecoded += len;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", {
      ignoreBOM: true,
      fatal: true,
    });
    cachedTextDecoder.decode();
    numBytesDecoded = len;
  }
  return cachedTextDecoder.decode(
    getUint8ArrayMemory0().subarray(ptr, ptr + len),
  );
}

const cachedTextEncoder = new TextEncoder();

if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length,
    };
  };
}

let WASM_VECTOR_LEN = 0;

const AshtakavargaResultFinalization =
  (typeof FinalizationRegistry === "undefined")
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) =>
      wasm.__wbg_ashtakavargaresult_free(ptr >>> 0, 1)
    );

const CharaDashaPeriodFinalization =
  (typeof FinalizationRegistry === "undefined")
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) =>
      wasm.__wbg_charadashaperiod_free(ptr >>> 0, 1)
    );

const ConstantsFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_constants_free(ptr >>> 0, 1));

const DailyPanchangFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_dailypanchang_free(ptr >>> 0, 1)
  );

const DashaInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_dashainfo_free(ptr >>> 0, 1));

const DayMuhuratsFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_daymuhurats_free(ptr >>> 0, 1)
  );

const HouseInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_houseinfo_free(ptr >>> 0, 1));

const JaiminiProfileFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_jaiminiprofile_free(ptr >>> 0, 1)
  );

const KarakaObjectFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_karakaobject_free(ptr >>> 0, 1)
  );

const KaranaInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_karanainfo_free(ptr >>> 0, 1));

const LocationFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_location_free(ptr >>> 0, 1));

const MuhuratFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_muhurat_free(ptr >>> 0, 1));

const NakshatraInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_nakshatrainfo_free(ptr >>> 0, 1)
  );

const PlanetDataFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_planetdata_free(ptr >>> 0, 1));

const PositionFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_position_free(ptr >>> 0, 1));

const PrastaraResultFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_prastararesult_free(ptr >>> 0, 1)
  );

const ReducedAshtakavargaFinalization =
  (typeof FinalizationRegistry === "undefined")
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) =>
      wasm.__wbg_reducedashtakavarga_free(ptr >>> 0, 1)
    );

const SarvashtakavargaFinalization =
  (typeof FinalizationRegistry === "undefined")
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) =>
      wasm.__wbg_sarvashtakavarga_free(ptr >>> 0, 1)
    );

const ShadbalaProfileFinalization =
  (typeof FinalizationRegistry === "undefined")
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry((ptr) =>
      wasm.__wbg_shadbalaprofile_free(ptr >>> 0, 1)
    );

const ShadbalaResultFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_shadbalaresult_free(ptr >>> 0, 1)
  );

const SpecialLagnasFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_speciallagnas_free(ptr >>> 0, 1)
  );

const SwissEphErrorFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_swissepherror_free(ptr >>> 0, 1)
  );

const TimeIntervalFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_timeinterval_free(ptr >>> 0, 1)
  );

const TithiInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_tithiinfo_free(ptr >>> 0, 1));

const VaraInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_varainfo_free(ptr >>> 0, 1));

const VargaPositionFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) =>
    wasm.__wbg_vargaposition_free(ptr >>> 0, 1)
  );

const WarDetailsFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_wardetails_free(ptr >>> 0, 1));

const YogaInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_yogainfo_free(ptr >>> 0, 1));

const YogaResultFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_yogaresult_free(ptr >>> 0, 1));

const YoginiInfoFinalization = (typeof FinalizationRegistry === "undefined")
  ? { register: () => {}, unregister: () => {} }
  : new FinalizationRegistry((ptr) => wasm.__wbg_yoginiinfo_free(ptr >>> 0, 1));

export class AshtakavargaResult {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    AshtakavargaResultFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_ashtakavargaresult_free(ptr, 0);
  }
  /**
   * @returns {Int32Array}
   */
  get bindus() {
    const ret = wasm.ashtakavargaresult_bindus(this.__wbg_ptr);
    var v1 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
  /**
   * Planet ID (0=Sun .. 6=Saturn)
   * @returns {number}
   */
  get planet_id() {
    const ret = wasm.__wbg_get_ashtakavargaresult_planet_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * Planet ID (0=Sun .. 6=Saturn)
   * @param {number} arg0
   */
  set planet_id(arg0) {
    wasm.__wbg_set_ashtakavargaresult_planet_id(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  AshtakavargaResult.prototype[Symbol.dispose] =
    AshtakavargaResult.prototype.free;
}

/**
 * Ayanamsha modes
 * @enum {0 | 1 | 2 | 3 | 5 | 7 | 8 | 27}
 */
export const AyanamshaMode = Object.freeze({
  /**
   * Fagan-Bradley (0)
   */
  FaganBradley: 0,
  "0": "FaganBradley",
  /**
   * Lahiri (1)
   */
  Lahiri: 1,
  "1": "Lahiri",
  /**
   * De Luce (2)
   */
  DeLuce: 2,
  "2": "DeLuce",
  /**
   * Raman (3)
   */
  Raman: 3,
  "3": "Raman",
  /**
   * Krishnamurti (5)
   */
  Krishnamurti: 5,
  "5": "Krishnamurti",
  /**
   * Yukteshwar (7)
   */
  Yukteshwar: 7,
  "7": "Yukteshwar",
  /**
   * J.N. Bhasin (8)
   */
  JNBhasin: 8,
  "8": "JNBhasin",
  /**
   * True Chitrapaksha (27)
   */
  TrueCitra: 27,
  "27": "TrueCitra",
});

export class CharaDashaPeriod {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(CharaDashaPeriod.prototype);
    obj.__wbg_ptr = ptr;
    CharaDashaPeriodFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    CharaDashaPeriodFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_charadashaperiod_free(ptr, 0);
  }
  /**
   * @param {number} sign_id
   * @param {number} duration_years
   * @param {number} start_year
   * @param {number} end_year
   */
  constructor(sign_id, duration_years, start_year, end_year) {
    const ret = wasm.charadashaperiod_new(
      sign_id,
      duration_years,
      start_year,
      end_year,
    );
    this.__wbg_ptr = ret >>> 0;
    CharaDashaPeriodFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {number}
   */
  get sign_id() {
    const ret = wasm.__wbg_get_charadashaperiod_sign_id(this.__wbg_ptr);
    return ret >>> 0;
  }
  /**
   * @param {number} arg0
   */
  set sign_id(arg0) {
    wasm.__wbg_set_charadashaperiod_sign_id(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get duration_years() {
    const ret = wasm.__wbg_get_charadashaperiod_duration_years(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set duration_years(arg0) {
    wasm.__wbg_set_charadashaperiod_duration_years(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get start_year() {
    const ret = wasm.__wbg_get_charadashaperiod_start_year(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set start_year(arg0) {
    wasm.__wbg_set_charadashaperiod_start_year(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get end_year() {
    const ret = wasm.__wbg_get_charadashaperiod_end_year(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set end_year(arg0) {
    wasm.__wbg_set_charadashaperiod_end_year(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  CharaDashaPeriod.prototype[Symbol.dispose] = CharaDashaPeriod.prototype.free;
}

/**
 * Container for Swiss Ephemeris constants.
 * Access via static getters, e.g., `Constants.SE_SUN`
 */
export class Constants {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ConstantsFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_constants_free(ptr, 0);
  }
  /**
   * ICRS coordinates (131072)
   * @returns {number}
   */
  static get SEFLG_ICRS() {
    const ret = wasm.constants_SEFLG_ICRS();
    return ret;
  }
  /**
   * Julian calendar (0)
   * @returns {number}
   */
  static get SE_JUL_CAL() {
    const ret = wasm.constants_SE_JUL_CAL();
    return ret;
  }
  /**
   * Jupiter (5)
   * @returns {number}
   */
  static get SE_JUPITER() {
    const ret = wasm.constants_SE_JUPITER();
    return ret;
  }
  /**
   * Mercury (2)
   * @returns {number}
   */
  static get SE_MERCURY() {
    const ret = wasm.constants_SEFLG_SWIEPH();
    return ret;
  }
  /**
   * Neptune (8)
   * @returns {number}
   */
  static get SE_NEPTUNE() {
    const ret = wasm.constants_SEFLG_HELCTR();
    return ret;
  }
  /**
   * J2000 epoch (32)
   * @returns {number}
   */
  static get SEFLG_J2000() {
    const ret = wasm.constants_SEFLG_J2000();
    return ret;
  }
  /**
   * No nutation (no nutation in longitude and obliquity) (1024)
   * @returns {number}
   */
  static get SEFLG_NONUT() {
    const ret = wasm.constants_SEFLG_NONUT();
    return ret;
  }
  /**
   * Include speed in output (256)
   * @returns {number}
   */
  static get SEFLG_SPEED() {
    const ret = wasm.constants_SEFLG_SPEED();
    return ret;
  }
  /**
   * Gregorian calendar (1)
   * @returns {number}
   */
  static get SE_GREG_CAL() {
    const ret = wasm.constants_SE_GREG_CAL();
    return ret;
  }
  /**
   * Heliocentric positions (8)
   * @returns {number}
   */
  static get SEFLG_HELCTR() {
    const ret = wasm.constants_SEFLG_HELCTR();
    return ret;
  }
  /**
   * Use Moshier Ephemeris (4)
   * @returns {number}
   */
  static get SEFLG_MOSEPH() {
    const ret = wasm.constants_SEFLG_MOSEPH();
    return ret;
  }
  /**
   * Use Swiss Ephemeris (2)
   * @returns {number}
   */
  static get SEFLG_SWIEPH() {
    const ret = wasm.constants_SEFLG_SWIEPH();
    return ret;
  }
  /**
   * Mean Lunar Node / Rahu (10)
   * @returns {number}
   */
  static get SE_MEAN_NODE() {
    const ret = wasm.constants_SE_MEAN_NODE();
    return ret;
  }
  /**
   * True Lunar Node / Rahu (11)
   * @returns {number}
   */
  static get SE_TRUE_NODE() {
    const ret = wasm.constants_SE_TRUE_NODE();
    return ret;
  }
  /**
   * Topocentric positions (32768)
   * @returns {number}
   */
  static get SEFLG_TOPOCTR() {
    const ret = wasm.constants_SEFLG_TOPOCTR();
    return ret;
  }
  /**
   * True positions - no aberration (16)
   * @returns {number}
   */
  static get SEFLG_TRUEPOS() {
    const ret = wasm.constants_SEFLG_TRUEPOS();
    return ret;
  }
  /**
   * Raman (3)
   * @returns {number}
   */
  static get SE_SIDM_RAMAN() {
    const ret = wasm.constants_SE_SIDM_RAMAN();
    return ret;
  }
  /**
   * Sidereal positions (65536)
   * @returns {number}
   */
  static get SEFLG_SIDEREAL() {
    const ret = wasm.constants_SEFLG_SIDEREAL();
    return ret;
  }
  /**
   * De Luce (2)
   * @returns {number}
   */
  static get SE_SIDM_DELUCE() {
    const ret = wasm.constants_SEFLG_SWIEPH();
    return ret;
  }
  /**
   * Lahiri (1)
   * @returns {number}
   */
  static get SE_SIDM_LAHIRI() {
    const ret = wasm.constants_SE_GREG_CAL();
    return ret;
  }
  /**
   * Equatorial positions (2048)
   * @returns {number}
   */
  static get SEFLG_EQUATORIAL() {
    const ret = wasm.constants_SEFLG_EQUATORIAL();
    return ret;
  }
  /**
   * J.N. Bhasin (8)
   * @returns {number}
   */
  static get SE_SIDM_JN_BHASIN() {
    const ret = wasm.constants_SEFLG_HELCTR();
    return ret;
  }
  /**
   * Yukteshwar (7)
   * @returns {number}
   */
  static get SE_SIDM_YUKTESHWAR() {
    const ret = wasm.constants_SE_SIDM_YUKTESHWAR();
    return ret;
  }
  /**
   * Krishnamurti (5)
   * @returns {number}
   */
  static get SE_SIDM_KRISHNAMURTI() {
    const ret = wasm.constants_SE_JUPITER();
    return ret;
  }
  /**
   * Fagan/Bradley (0)
   * @returns {number}
   */
  static get SE_SIDM_FAGAN_BRADLEY() {
    const ret = wasm.constants_SE_JUL_CAL();
    return ret;
  }
  /**
   * Sun (0)
   * @returns {number}
   */
  static get SE_SUN() {
    const ret = wasm.constants_SE_JUL_CAL();
    return ret;
  }
  /**
   * Mars (4)
   * @returns {number}
   */
  static get SE_MARS() {
    const ret = wasm.constants_SEFLG_MOSEPH();
    return ret;
  }
  /**
   * Moon (1)
   * @returns {number}
   */
  static get SE_MOON() {
    const ret = wasm.constants_SE_GREG_CAL();
    return ret;
  }
  /**
   * Pluto (9)
   * @returns {number}
   */
  static get SE_PLUTO() {
    const ret = wasm.constants_SE_PLUTO();
    return ret;
  }
  /**
   * Venus (3)
   * @returns {number}
   */
  static get SE_VENUS() {
    const ret = wasm.constants_SE_SIDM_RAMAN();
    return ret;
  }
  /**
   * Chiron (12)
   * @returns {number}
   */
  static get SE_CHIRON() {
    const ret = wasm.constants_SE_CHIRON();
    return ret;
  }
  /**
   * Pholus (13)
   * @returns {number}
   */
  static get SE_PHOLUS() {
    const ret = wasm.constants_SE_PHOLUS();
    return ret;
  }
  /**
   * Saturn (6)
   * @returns {number}
   */
  static get SE_SATURN() {
    const ret = wasm.constants_SE_SATURN();
    return ret;
  }
  /**
   * Uranus (7)
   * @returns {number}
   */
  static get SE_URANUS() {
    const ret = wasm.constants_SE_SIDM_YUKTESHWAR();
    return ret;
  }
}
if (Symbol.dispose) {
  Constants.prototype[Symbol.dispose] = Constants.prototype.free;
}

/**
 * @enum {0 | 1}
 */
export const D10Variation = Object.freeze({
  Parashara: 0,
  "0": "Parashara",
  Behari: 1,
  "1": "Behari",
});

/**
 * @enum {0 | 1 | 2 | 3}
 */
export const D2Variation = Object.freeze({
  Parashara: 0,
  "0": "Parashara",
  LabhaMandooka: 1,
  "1": "LabhaMandooka",
  Kura: 2,
  "2": "Kura",
  Kashinatha: 3,
  "3": "Kashinatha",
});

/**
 * @enum {0 | 1 | 2 | 3}
 */
export const D3Variation = Object.freeze({
  Parashara: 0,
  "0": "Parashara",
  Jagannatha: 1,
  "1": "Jagannatha",
  Somanatha: 2,
  "2": "Somanatha",
  Parivritti: 3,
  "3": "Parivritti",
});

/**
 * @enum {0 | 1 | 2 | 3}
 */
export const D9Variation = Object.freeze({
  Parashara: 0,
  "0": "Parashara",
  KrishnaMishra: 1,
  "1": "KrishnaMishra",
  Somanatha: 2,
  "2": "Somanatha",
  Nadamsa: 3,
  "3": "Nadamsa",
});

export class DailyPanchang {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(DailyPanchang.prototype);
    obj.__wbg_ptr = ptr;
    DailyPanchangFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    DailyPanchangFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_dailypanchang_free(ptr, 0);
  }
  /**
   * @returns {any}
   */
  get planets() {
    const ret = wasm.dailypanchang_planets(this.__wbg_ptr);
    return ret;
  }
  /**
   * Sunrise time in Unix milliseconds
   * @returns {number}
   */
  get sunrise() {
    const ret = wasm.__wbg_get_dailypanchang_sunrise(this.__wbg_ptr);
    return ret;
  }
  /**
   * Sunrise time in Unix milliseconds
   * @param {number} arg0
   */
  set sunrise(arg0) {
    wasm.__wbg_set_dailypanchang_sunrise(this.__wbg_ptr, arg0);
  }
  /**
   * Sunset time in Unix milliseconds
   * @returns {number}
   */
  get sunset() {
    const ret = wasm.__wbg_get_dailypanchang_sunset(this.__wbg_ptr);
    return ret;
  }
  /**
   * Sunset time in Unix milliseconds
   * @param {number} arg0
   */
  set sunset(arg0) {
    wasm.__wbg_set_dailypanchang_sunset(this.__wbg_ptr, arg0);
  }
  /**
   * Tithi index (1-30). 15 = Purnima, 30 = Amavasya.
   * @returns {number}
   */
  get tithi_index() {
    const ret = wasm.__wbg_get_dailypanchang_tithi_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Tithi index (1-30). 15 = Purnima, 30 = Amavasya.
   * @param {number} arg0
   */
  set tithi_index(arg0) {
    wasm.__wbg_set_dailypanchang_tithi_index(this.__wbg_ptr, arg0);
  }
  /**
   * Name of the Tithi (e.g., "Shukla-Chaturdashi")
   * @returns {string}
   */
  get tithi_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dailypanchang_tithi_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Name of the Tithi (e.g., "Shukla-Chaturdashi")
   * @param {string} arg0
   */
  set tithi_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dailypanchang_tithi_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Timestamp (Unix ms) when this Tithi started.
   * @returns {number | undefined}
   */
  get tithi_start_time() {
    const ret = wasm.__wbg_get_dailypanchang_tithi_start_time(this.__wbg_ptr);
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Tithi started.
   * @param {number | null} [arg0]
   */
  set tithi_start_time(arg0) {
    wasm.__wbg_set_dailypanchang_tithi_start_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Timestamp (Unix ms) when this Tithi ends. None if it doesn't end today.
   * @returns {number | undefined}
   */
  get tithi_end_time() {
    const ret = wasm.__wbg_get_dailypanchang_tithi_end_time(this.__wbg_ptr);
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Tithi ends. None if it doesn't end today.
   * @param {number | null} [arg0]
   */
  set tithi_end_time(arg0) {
    wasm.__wbg_set_dailypanchang_tithi_end_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Nakshatra index (1-27). 1 = Ashwini.
   * @returns {number}
   */
  get nakshatra_index() {
    const ret = wasm.__wbg_get_dailypanchang_nakshatra_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Nakshatra index (1-27). 1 = Ashwini.
   * @param {number} arg0
   */
  set nakshatra_index(arg0) {
    wasm.__wbg_set_dailypanchang_nakshatra_index(this.__wbg_ptr, arg0);
  }
  /**
   * Name of the Nakshatra (e.g., "Krittika")
   * @returns {string}
   */
  get nakshatra_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dailypanchang_nakshatra_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Name of the Nakshatra (e.g., "Krittika")
   * @param {string} arg0
   */
  set nakshatra_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dailypanchang_nakshatra_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Timestamp (Unix ms) when this Nakshatra started.
   * @returns {number | undefined}
   */
  get nakshatra_start_time() {
    const ret = wasm.__wbg_get_dailypanchang_nakshatra_start_time(
      this.__wbg_ptr,
    );
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Nakshatra started.
   * @param {number | null} [arg0]
   */
  set nakshatra_start_time(arg0) {
    wasm.__wbg_set_dailypanchang_nakshatra_start_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Timestamp (Unix ms) when this Nakshatra ends.
   * @returns {number | undefined}
   */
  get nakshatra_end_time() {
    const ret = wasm.__wbg_get_dailypanchang_nakshatra_end_time(this.__wbg_ptr);
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Nakshatra ends.
   * @param {number | null} [arg0]
   */
  set nakshatra_end_time(arg0) {
    wasm.__wbg_set_dailypanchang_nakshatra_end_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Yoga index (1-27).
   * @returns {number}
   */
  get yoga_index() {
    const ret = wasm.__wbg_get_dailypanchang_yoga_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Yoga index (1-27).
   * @param {number} arg0
   */
  set yoga_index(arg0) {
    wasm.__wbg_set_dailypanchang_yoga_index(this.__wbg_ptr, arg0);
  }
  /**
   * Name of the Yoga (e.g., "Vishkumbha")
   * @returns {string}
   */
  get yoga_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dailypanchang_yoga_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Name of the Yoga (e.g., "Vishkumbha")
   * @param {string} arg0
   */
  set yoga_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dailypanchang_yoga_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Timestamp (Unix ms) when this Yoga started.
   * @returns {number | undefined}
   */
  get yoga_start_time() {
    const ret = wasm.__wbg_get_dailypanchang_yoga_start_time(this.__wbg_ptr);
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Yoga started.
   * @param {number | null} [arg0]
   */
  set yoga_start_time(arg0) {
    wasm.__wbg_set_dailypanchang_yoga_start_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Timestamp (Unix ms) when this Yoga ends.
   * @returns {number | undefined}
   */
  get yoga_end_time() {
    const ret = wasm.__wbg_get_dailypanchang_yoga_end_time(this.__wbg_ptr);
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Yoga ends.
   * @param {number | null} [arg0]
   */
  set yoga_end_time(arg0) {
    wasm.__wbg_set_dailypanchang_yoga_end_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Karana index (1-60).
   * @returns {number}
   */
  get karana_index() {
    const ret = wasm.__wbg_get_dailypanchang_karana_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Karana index (1-60).
   * @param {number} arg0
   */
  set karana_index(arg0) {
    wasm.__wbg_set_dailypanchang_karana_index(this.__wbg_ptr, arg0);
  }
  /**
   * Name of the Karana (e.g., "Bava")
   * @returns {string}
   */
  get karana_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dailypanchang_karana_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Name of the Karana (e.g., "Bava")
   * @param {string} arg0
   */
  set karana_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dailypanchang_karana_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Timestamp (Unix ms) when this Karana started.
   * @returns {number | undefined}
   */
  get karana_start_time() {
    const ret = wasm.__wbg_get_dailypanchang_karana_start_time(this.__wbg_ptr);
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Karana started.
   * @param {number | null} [arg0]
   */
  set karana_start_time(arg0) {
    wasm.__wbg_set_dailypanchang_karana_start_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Timestamp (Unix ms) when this Karana ends.
   * @returns {number | undefined}
   */
  get karana_end_time() {
    const ret = wasm.__wbg_get_dailypanchang_karana_end_time(this.__wbg_ptr);
    return ret[0] === 0 ? undefined : ret[1];
  }
  /**
   * Timestamp (Unix ms) when this Karana ends.
   * @param {number | null} [arg0]
   */
  set karana_end_time(arg0) {
    wasm.__wbg_set_dailypanchang_karana_end_time(
      this.__wbg_ptr,
      !isLikeNone(arg0),
      isLikeNone(arg0) ? 0 : arg0,
    );
  }
  /**
   * Solar Weekday name (e.g., "Adityawara")
   * @returns {string}
   */
  get vara_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dailypanchang_vara_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Solar Weekday name (e.g., "Adityawara")
   * @param {string} arg0
   */
  set vara_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dailypanchang_vara_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Sidereal Ascendant (Lagna) at sunrise (degrees)
   * @returns {number}
   */
  get ascendant() {
    const ret = wasm.__wbg_get_dailypanchang_ascendant(this.__wbg_ptr);
    return ret;
  }
  /**
   * Sidereal Ascendant (Lagna) at sunrise (degrees)
   * @param {number} arg0
   */
  set ascendant(arg0) {
    wasm.__wbg_set_dailypanchang_ascendant(this.__wbg_ptr, arg0);
  }
  /**
   * Sidereal Midheaven (MC) at sunrise (degrees)
   * @returns {number}
   */
  get mc() {
    const ret = wasm.__wbg_get_dailypanchang_mc(this.__wbg_ptr);
    return ret;
  }
  /**
   * Sidereal Midheaven (MC) at sunrise (degrees)
   * @param {number} arg0
   */
  set mc(arg0) {
    wasm.__wbg_set_dailypanchang_mc(this.__wbg_ptr, arg0);
  }
  /**
   * The Ayanamsha value (in degrees) used for calculations
   * @returns {number}
   */
  get ayanamsha_value() {
    const ret = wasm.__wbg_get_dailypanchang_ayanamsha_value(this.__wbg_ptr);
    return ret;
  }
  /**
   * The Ayanamsha value (in degrees) used for calculations
   * @param {number} arg0
   */
  set ayanamsha_value(arg0) {
    wasm.__wbg_set_dailypanchang_ayanamsha_value(this.__wbg_ptr, arg0);
  }
  /**
   * Auspicious and Inauspicious time periods for the day
   * @returns {DayMuhurats}
   */
  get muhurats() {
    const ret = wasm.__wbg_get_dailypanchang_muhurats(this.__wbg_ptr);
    return DayMuhurats.__wrap(ret);
  }
  /**
   * Auspicious and Inauspicious time periods for the day
   * @param {DayMuhurats} arg0
   */
  set muhurats(arg0) {
    _assertClass(arg0, DayMuhurats);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_dailypanchang_muhurats(this.__wbg_ptr, ptr0);
  }
}
if (Symbol.dispose) {
  DailyPanchang.prototype[Symbol.dispose] = DailyPanchang.prototype.free;
}

/**
 * Dasha period information
 */
export class DashaInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(DashaInfo.prototype);
    obj.__wbg_ptr = ptr;
    DashaInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    DashaInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_dashainfo_free(ptr, 0);
  }
  /**
   * Current Mahadasha lord
   * @returns {string}
   */
  get mahadasha() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dashainfo_mahadasha(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Current Mahadasha lord
   * @param {string} arg0
   */
  set mahadasha(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dashainfo_mahadasha(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Current Antardasha lord
   * @returns {string}
   */
  get antardasha() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dashainfo_antardasha(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Current Antardasha lord
   * @param {string} arg0
   */
  set antardasha(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dashainfo_antardasha(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Current Pratyantardasha lord
   * @returns {string}
   */
  get pratyantardasha() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dashainfo_pratyantardasha(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Current Pratyantardasha lord
   * @param {string} arg0
   */
  set pratyantardasha(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dashainfo_pratyantardasha(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Date when the current Mahadasha ends (Unix ms)
   * @returns {number}
   */
  get mahadasha_end_date() {
    const ret = wasm.__wbg_get_dashainfo_mahadasha_end_date(this.__wbg_ptr);
    return ret;
  }
  /**
   * Date when the current Mahadasha ends (Unix ms)
   * @param {number} arg0
   */
  set mahadasha_end_date(arg0) {
    wasm.__wbg_set_dashainfo_mahadasha_end_date(this.__wbg_ptr, arg0);
  }
  /**
   * Date when the current Antardasha ends (Unix ms)
   * @returns {number}
   */
  get antardasha_end_date() {
    const ret = wasm.__wbg_get_dashainfo_antardasha_end_date(this.__wbg_ptr);
    return ret;
  }
  /**
   * Date when the current Antardasha ends (Unix ms)
   * @param {number} arg0
   */
  set antardasha_end_date(arg0) {
    wasm.__wbg_set_dashainfo_antardasha_end_date(this.__wbg_ptr, arg0);
  }
  /**
   * Date when the current Pratyantardasha ends (Unix ms)
   * @returns {number}
   */
  get pratyantardasha_end_date() {
    const ret = wasm.__wbg_get_dashainfo_pratyantardasha_end_date(
      this.__wbg_ptr,
    );
    return ret;
  }
  /**
   * Date when the current Pratyantardasha ends (Unix ms)
   * @param {number} arg0
   */
  set pratyantardasha_end_date(arg0) {
    wasm.__wbg_set_dashainfo_pratyantardasha_end_date(this.__wbg_ptr, arg0);
  }
  /**
   * Birth Nakshatra name
   * @returns {string}
   */
  get nakshatra_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_dashainfo_nakshatra_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Birth Nakshatra name
   * @param {string} arg0
   */
  set nakshatra_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_dashainfo_nakshatra_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Birth Nakshatra pada (1-4)
   * @returns {number}
   */
  get nakshatra_pada() {
    const ret = wasm.__wbg_get_dashainfo_nakshatra_pada(this.__wbg_ptr);
    return ret;
  }
  /**
   * Birth Nakshatra pada (1-4)
   * @param {number} arg0
   */
  set nakshatra_pada(arg0) {
    wasm.__wbg_set_dashainfo_nakshatra_pada(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  DashaInfo.prototype[Symbol.dispose] = DashaInfo.prototype.free;
}

/**
 * Collection of daily Muhurats
 */
export class DayMuhurats {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(DayMuhurats.prototype);
    obj.__wbg_ptr = ptr;
    DayMuhuratsFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    DayMuhuratsFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_daymuhurats_free(ptr, 0);
  }
  /**
   * Period of Raahu (Inauspicious for starting new ventures)
   * @returns {Muhurat}
   */
  get rahu_kalam() {
    const ret = wasm.__wbg_get_daymuhurats_rahu_kalam(this.__wbg_ptr);
    return Muhurat.__wrap(ret);
  }
  /**
   * Period of Raahu (Inauspicious for starting new ventures)
   * @param {Muhurat} arg0
   */
  set rahu_kalam(arg0) {
    _assertClass(arg0, Muhurat);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_daymuhurats_rahu_kalam(this.__wbg_ptr, ptr0);
  }
  /**
   * Period of Yama (Inauspicious)
   * @returns {Muhurat}
   */
  get yamaganda() {
    const ret = wasm.__wbg_get_daymuhurats_yamaganda(this.__wbg_ptr);
    return Muhurat.__wrap(ret);
  }
  /**
   * Period of Yama (Inauspicious)
   * @param {Muhurat} arg0
   */
  set yamaganda(arg0) {
    _assertClass(arg0, Muhurat);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_daymuhurats_yamaganda(this.__wbg_ptr, ptr0);
  }
  /**
   * Period of Gulika (Neutral/Inauspicious)
   * @returns {Muhurat}
   */
  get gulika() {
    const ret = wasm.__wbg_get_daymuhurats_gulika(this.__wbg_ptr);
    return Muhurat.__wrap(ret);
  }
  /**
   * Period of Gulika (Neutral/Inauspicious)
   * @param {Muhurat} arg0
   */
  set gulika(arg0) {
    _assertClass(arg0, Muhurat);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_daymuhurats_gulika(this.__wbg_ptr, ptr0);
  }
  /**
   * Brahma Muhurta (Pre-dawn)
   * @returns {Muhurat}
   */
  get brahma_muhurta() {
    const ret = wasm.__wbg_get_daymuhurats_brahma_muhurta(this.__wbg_ptr);
    return Muhurat.__wrap(ret);
  }
  /**
   * Brahma Muhurta (Pre-dawn)
   * @param {Muhurat} arg0
   */
  set brahma_muhurta(arg0) {
    _assertClass(arg0, Muhurat);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_daymuhurats_brahma_muhurta(this.__wbg_ptr, ptr0);
  }
  /**
   * Abhijit Muhurta (Mid-day victory period)
   * @returns {Muhurat}
   */
  get abhijit_muhurta() {
    const ret = wasm.__wbg_get_daymuhurats_abhijit_muhurta(this.__wbg_ptr);
    return Muhurat.__wrap(ret);
  }
  /**
   * Abhijit Muhurta (Mid-day victory period)
   * @param {Muhurat} arg0
   */
  set abhijit_muhurta(arg0) {
    _assertClass(arg0, Muhurat);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_daymuhurats_abhijit_muhurta(this.__wbg_ptr, ptr0);
  }
}
if (Symbol.dispose) {
  DayMuhurats.prototype[Symbol.dispose] = DayMuhurats.prototype.free;
}

/**
 * Planetary Dignity status
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}
 */
export const Dignity = Object.freeze({
  Exalted: 0,
  "0": "Exalted",
  Moolatrikona: 1,
  "1": "Moolatrikona",
  OwnSign: 2,
  "2": "OwnSign",
  GreatFriend: 3,
  "3": "GreatFriend",
  Friend: 4,
  "4": "Friend",
  Neutral: 5,
  "5": "Neutral",
  Enemy: 6,
  "6": "Enemy",
  GreatEnemy: 7,
  "7": "GreatEnemy",
  Debilitated: 8,
  "8": "Debilitated",
});

/**
 * House system information
 */
export class HouseInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(HouseInfo.prototype);
    obj.__wbg_ptr = ptr;
    HouseInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    HouseInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_houseinfo_free(ptr, 0);
  }
  /**
   * Ascendant (Lagna) in degrees (0-360)
   * @returns {number}
   */
  get ascendant() {
    const ret = wasm.__wbg_get_houseinfo_ascendant(this.__wbg_ptr);
    return ret;
  }
  /**
   * Ascendant (Lagna) in degrees (0-360)
   * @param {number} arg0
   */
  set ascendant(arg0) {
    wasm.__wbg_set_houseinfo_ascendant(this.__wbg_ptr, arg0);
  }
  /**
   * Midheaven (MC) in degrees
   * @returns {number}
   */
  get mc() {
    const ret = wasm.__wbg_get_houseinfo_mc(this.__wbg_ptr);
    return ret;
  }
  /**
   * Midheaven (MC) in degrees
   * @param {number} arg0
   */
  set mc(arg0) {
    wasm.__wbg_set_houseinfo_mc(this.__wbg_ptr, arg0);
  }
  /**
   * ARMC (Sidereal Time)
   * @returns {number}
   */
  get armc() {
    const ret = wasm.__wbg_get_houseinfo_armc(this.__wbg_ptr);
    return ret;
  }
  /**
   * ARMC (Sidereal Time)
   * @param {number} arg0
   */
  set armc(arg0) {
    wasm.__wbg_set_houseinfo_armc(this.__wbg_ptr, arg0);
  }
  /**
   * Vertex
   * @returns {number}
   */
  get vertex() {
    const ret = wasm.__wbg_get_houseinfo_vertex(this.__wbg_ptr);
    return ret;
  }
  /**
   * Vertex
   * @param {number} arg0
   */
  set vertex(arg0) {
    wasm.__wbg_set_houseinfo_vertex(this.__wbg_ptr, arg0);
  }
  /**
   * Equatorial Ascendant
   * @returns {number}
   */
  get equatorial_ascendant() {
    const ret = wasm.__wbg_get_houseinfo_equatorial_ascendant(this.__wbg_ptr);
    return ret;
  }
  /**
   * Equatorial Ascendant
   * @param {number} arg0
   */
  set equatorial_ascendant(arg0) {
    wasm.__wbg_set_houseinfo_equatorial_ascendant(this.__wbg_ptr, arg0);
  }
  /**
   * Co-Ascendant 1 (Koch)
   * @returns {number}
   */
  get co_ascendant1() {
    const ret = wasm.__wbg_get_houseinfo_co_ascendant1(this.__wbg_ptr);
    return ret;
  }
  /**
   * Co-Ascendant 1 (Koch)
   * @param {number} arg0
   */
  set co_ascendant1(arg0) {
    wasm.__wbg_set_houseinfo_co_ascendant1(this.__wbg_ptr, arg0);
  }
  /**
   * Co-Ascendant 2 (Munkasey)
   * @returns {number}
   */
  get co_ascendant2() {
    const ret = wasm.__wbg_get_houseinfo_co_ascendant2(this.__wbg_ptr);
    return ret;
  }
  /**
   * Co-Ascendant 2 (Munkasey)
   * @param {number} arg0
   */
  set co_ascendant2(arg0) {
    wasm.__wbg_set_houseinfo_co_ascendant2(this.__wbg_ptr, arg0);
  }
  /**
   * Polar Ascendant
   * @returns {number}
   */
  get polar_ascendant() {
    const ret = wasm.__wbg_get_houseinfo_polar_ascendant(this.__wbg_ptr);
    return ret;
  }
  /**
   * Polar Ascendant
   * @param {number} arg0
   */
  set polar_ascendant(arg0) {
    wasm.__wbg_set_houseinfo_polar_ascendant(this.__wbg_ptr, arg0);
  }
  /**
   * House cusps (1-12)
   * Note: Swiss Eph returns 13 values (0 is ignored), we return vector of 12
   * @returns {Float64Array}
   */
  get cusps() {
    const ret = wasm.__wbg_get_houseinfo_cusps(this.__wbg_ptr);
    var v1 = getArrayF64FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 8, 8);
    return v1;
  }
  /**
   * House cusps (1-12)
   * Note: Swiss Eph returns 13 values (0 is ignored), we return vector of 12
   * @param {Float64Array} arg0
   */
  set cusps(arg0) {
    const ptr0 = passArrayF64ToWasm0(arg0, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_houseinfo_cusps(this.__wbg_ptr, ptr0, len0);
  }
}
if (Symbol.dispose) {
  HouseInfo.prototype[Symbol.dispose] = HouseInfo.prototype.free;
}

export class JaiminiProfile {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    JaiminiProfileFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_jaiminiprofile_free(ptr, 0);
  }
  /**
   * @param {KarakaObject[]} karakas
   */
  set karakas(karakas) {
    const ptr0 = passArrayJsValueToWasm0(karakas, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    wasm.jaiminiprofile_set_karakas(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @returns {KarakaObject[]}
   */
  get karakas() {
    const ret = wasm.jaiminiprofile_karakas(this.__wbg_ptr);
    var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
}
if (Symbol.dispose) {
  JaiminiProfile.prototype[Symbol.dispose] = JaiminiProfile.prototype.free;
}

/**
 * @enum {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7}
 */
export const KarakaName = Object.freeze({
  AtmaKaraka: 0,
  "0": "AtmaKaraka",
  AmatyaKaraka: 1,
  "1": "AmatyaKaraka",
  BhatriKaraka: 2,
  "2": "BhatriKaraka",
  MatriKaraka: 3,
  "3": "MatriKaraka",
  PitraKaraka: 4,
  "4": "PitraKaraka",
  PutraKaraka: 5,
  "5": "PutraKaraka",
  GnatiKaraka: 6,
  "6": "GnatiKaraka",
  DaraKaraka: 7,
  "7": "DaraKaraka",
});

export class KarakaObject {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(KarakaObject.prototype);
    obj.__wbg_ptr = ptr;
    KarakaObjectFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  static __unwrap(jsValue) {
    if (!(jsValue instanceof KarakaObject)) {
      return 0;
    }
    return jsValue.__destroy_into_raw();
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    KarakaObjectFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_karakaobject_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get planet_id() {
    const ret = wasm.__wbg_get_karakaobject_planet_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set planet_id(arg0) {
    wasm.__wbg_set_karakaobject_planet_id(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {KarakaName}
   */
  get karaka_name() {
    const ret = wasm.__wbg_get_karakaobject_karaka_name(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {KarakaName} arg0
   */
  set karaka_name(arg0) {
    wasm.__wbg_set_karakaobject_karaka_name(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get longitude() {
    const ret = wasm.__wbg_get_charadashaperiod_start_year(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set longitude(arg0) {
    wasm.__wbg_set_charadashaperiod_start_year(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  KarakaObject.prototype[Symbol.dispose] = KarakaObject.prototype.free;
}

/**
 * Karana information
 */
export class KaranaInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(KaranaInfo.prototype);
    obj.__wbg_ptr = ptr;
    KaranaInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    KaranaInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_karanainfo_free(ptr, 0);
  }
  /**
   * Karana index (1-60 per lunar month)
   * @returns {number}
   */
  get index() {
    const ret = wasm.__wbg_get_karanainfo_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Karana index (1-60 per lunar month)
   * @param {number} arg0
   */
  set index(arg0) {
    wasm.__wbg_set_karanainfo_index(this.__wbg_ptr, arg0);
  }
  /**
   * Karana name
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_karanainfo_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Karana name
   * @param {string} arg0
   */
  set name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_karanainfo_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Whether first or second half of Tithi
   * @returns {number}
   */
  get half() {
    const ret = wasm.__wbg_get_karanainfo_half(this.__wbg_ptr);
    return ret;
  }
  /**
   * Whether first or second half of Tithi
   * @param {number} arg0
   */
  set half(arg0) {
    wasm.__wbg_set_karanainfo_half(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  KaranaInfo.prototype[Symbol.dispose] = KaranaInfo.prototype.free;
}

/**
 * Location struct for geo-spatial calculations
 */
export class Location {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    LocationFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_location_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get latitude() {
    const ret = wasm.__wbg_get_location_latitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set latitude(arg0) {
    wasm.__wbg_set_location_latitude(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get longitude() {
    const ret = wasm.__wbg_get_location_longitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set longitude(arg0) {
    wasm.__wbg_set_location_longitude(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get altitude() {
    const ret = wasm.__wbg_get_location_altitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set altitude(arg0) {
    wasm.__wbg_set_location_altitude(this.__wbg_ptr, arg0);
  }
  /**
   * @param {number} latitude
   * @param {number} longitude
   * @param {number} altitude
   */
  constructor(latitude, longitude, altitude) {
    const ret = wasm.location_new(latitude, longitude, altitude);
    this.__wbg_ptr = ret >>> 0;
    LocationFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
}
if (Symbol.dispose) {
  Location.prototype[Symbol.dispose] = Location.prototype.free;
}

/**
 * Represents a specific time interval (Muhurat)
 */
export class Muhurat {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Muhurat.prototype);
    obj.__wbg_ptr = ptr;
    MuhuratFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    MuhuratFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_muhurat_free(ptr, 0);
  }
  /**
   * Name of the Muhurat (e.g., "Rahu Kalam")
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_muhurat_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Name of the Muhurat (e.g., "Rahu Kalam")
   * @param {string} arg0
   */
  set name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_muhurat_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Start time in Unix milliseconds
   * @returns {number}
   */
  get start() {
    const ret = wasm.__wbg_get_muhurat_start(this.__wbg_ptr);
    return ret;
  }
  /**
   * Start time in Unix milliseconds
   * @param {number} arg0
   */
  set start(arg0) {
    wasm.__wbg_set_muhurat_start(this.__wbg_ptr, arg0);
  }
  /**
   * End time in Unix milliseconds
   * @returns {number}
   */
  get end() {
    const ret = wasm.__wbg_get_muhurat_end(this.__wbg_ptr);
    return ret;
  }
  /**
   * End time in Unix milliseconds
   * @param {number} arg0
   */
  set end(arg0) {
    wasm.__wbg_set_muhurat_end(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) Muhurat.prototype[Symbol.dispose] = Muhurat.prototype.free;

/**
 * Nakshatra information
 */
export class NakshatraInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(NakshatraInfo.prototype);
    obj.__wbg_ptr = ptr;
    NakshatraInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    NakshatraInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_nakshatrainfo_free(ptr, 0);
  }
  /**
   * Nakshatra index (1-27)
   * @returns {number}
   */
  get index() {
    const ret = wasm.__wbg_get_nakshatrainfo_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Nakshatra index (1-27)
   * @param {number} arg0
   */
  set index(arg0) {
    wasm.__wbg_set_nakshatrainfo_index(this.__wbg_ptr, arg0);
  }
  /**
   * Nakshatra name
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_nakshatrainfo_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Nakshatra name
   * @param {string} arg0
   */
  set name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_nakshatrainfo_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Planetary ruler
   * @returns {string}
   */
  get ruler() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_nakshatrainfo_ruler(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Planetary ruler
   * @param {string} arg0
   */
  set ruler(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_nakshatrainfo_ruler(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Quality/nature
   * @returns {string}
   */
  get quality() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_nakshatrainfo_quality(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Quality/nature
   * @param {string} arg0
   */
  set quality(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_nakshatrainfo_quality(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Pada (quarter, 1-4)
   * @returns {number}
   */
  get pada() {
    const ret = wasm.__wbg_get_nakshatrainfo_pada(this.__wbg_ptr);
    return ret;
  }
  /**
   * Pada (quarter, 1-4)
   * @param {number} arg0
   */
  set pada(arg0) {
    wasm.__wbg_set_nakshatrainfo_pada(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  NakshatraInfo.prototype[Symbol.dispose] = NakshatraInfo.prototype.free;
}

/**
 * Paksha (lunar fortnight)
 * @enum {0 | 1}
 */
export const Paksha = Object.freeze({
  Shukla: 0,
  "0": "Shukla",
  Krishna: 1,
  "1": "Krishna",
});

/**
 * Planet position data
 */
export class PlanetData {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PlanetDataFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_planetdata_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get id() {
    const ret = wasm.__wbg_get_planetdata_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set id(arg0) {
    wasm.__wbg_set_planetdata_id(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_planetdata_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} arg0
   */
  set name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_planetdata_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @returns {number}
   */
  get longitude() {
    const ret = wasm.__wbg_get_planetdata_longitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set longitude(arg0) {
    wasm.__wbg_set_planetdata_longitude(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get latitude() {
    const ret = wasm.__wbg_get_planetdata_latitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set latitude(arg0) {
    wasm.__wbg_set_planetdata_latitude(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get distance() {
    const ret = wasm.__wbg_get_planetdata_distance(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set distance(arg0) {
    wasm.__wbg_set_planetdata_distance(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get speed() {
    const ret = wasm.__wbg_get_planetdata_speed(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set speed(arg0) {
    wasm.__wbg_set_planetdata_speed(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {boolean}
   */
  get is_retrograde() {
    const ret = wasm.__wbg_get_planetdata_is_retrograde(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * @param {boolean} arg0
   */
  set is_retrograde(arg0) {
    wasm.__wbg_set_planetdata_is_retrograde(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {boolean}
   */
  get is_combust() {
    const ret = wasm.__wbg_get_planetdata_is_combust(this.__wbg_ptr);
    return ret !== 0;
  }
  /**
   * @param {boolean} arg0
   */
  set is_combust(arg0) {
    wasm.__wbg_set_planetdata_is_combust(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {Dignity}
   */
  get dignity() {
    const ret = wasm.__wbg_get_planetdata_dignity(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {Dignity} arg0
   */
  set dignity(arg0) {
    wasm.__wbg_set_planetdata_dignity(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  PlanetData.prototype[Symbol.dispose] = PlanetData.prototype.free;
}

/**
 * Planetary position result
 */
export class Position {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Position.prototype);
    obj.__wbg_ptr = ptr;
    PositionFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PositionFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_position_free(ptr, 0);
  }
  /**
   * Ecliptic longitude in degrees
   * @returns {number}
   */
  get longitude() {
    const ret = wasm.__wbg_get_position_longitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * Ecliptic longitude in degrees
   * @param {number} arg0
   */
  set longitude(arg0) {
    wasm.__wbg_set_position_longitude(this.__wbg_ptr, arg0);
  }
  /**
   * Ecliptic latitude in degrees
   * @returns {number}
   */
  get latitude() {
    const ret = wasm.__wbg_get_position_latitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * Ecliptic latitude in degrees
   * @param {number} arg0
   */
  set latitude(arg0) {
    wasm.__wbg_set_position_latitude(this.__wbg_ptr, arg0);
  }
  /**
   * Distance (AU for planets, Earth radii for Moon)
   * @returns {number}
   */
  get distance() {
    const ret = wasm.__wbg_get_position_distance(this.__wbg_ptr);
    return ret;
  }
  /**
   * Distance (AU for planets, Earth radii for Moon)
   * @param {number} arg0
   */
  set distance(arg0) {
    wasm.__wbg_set_position_distance(this.__wbg_ptr, arg0);
  }
  /**
   * Longitude speed (degrees/day)
   * @returns {number}
   */
  get longitude_speed() {
    const ret = wasm.__wbg_get_position_longitude_speed(this.__wbg_ptr);
    return ret;
  }
  /**
   * Longitude speed (degrees/day)
   * @param {number} arg0
   */
  set longitude_speed(arg0) {
    wasm.__wbg_set_position_longitude_speed(this.__wbg_ptr, arg0);
  }
  /**
   * Latitude speed (degrees/day)
   * @returns {number}
   */
  get latitude_speed() {
    const ret = wasm.__wbg_get_position_latitude_speed(this.__wbg_ptr);
    return ret;
  }
  /**
   * Latitude speed (degrees/day)
   * @param {number} arg0
   */
  set latitude_speed(arg0) {
    wasm.__wbg_set_position_latitude_speed(this.__wbg_ptr, arg0);
  }
  /**
   * Distance speed (AU/day)
   * @returns {number}
   */
  get distance_speed() {
    const ret = wasm.__wbg_get_position_distance_speed(this.__wbg_ptr);
    return ret;
  }
  /**
   * Distance speed (AU/day)
   * @param {number} arg0
   */
  set distance_speed(arg0) {
    wasm.__wbg_set_position_distance_speed(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  Position.prototype[Symbol.dispose] = Position.prototype.free;
}

export class PrastaraResult {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(PrastaraResult.prototype);
    obj.__wbg_ptr = ptr;
    PrastaraResultFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    PrastaraResultFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_prastararesult_free(ptr, 0);
  }
  /**
   * @returns {Uint8Array}
   */
  get grid() {
    const ret = wasm.prastararesult_grid(this.__wbg_ptr);
    var v1 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
    return v1;
  }
  /**
   * Target Planet ID (0-6)
   * @returns {number}
   */
  get planet_id() {
    const ret = wasm.__wbg_get_ashtakavargaresult_planet_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * Target Planet ID (0-6)
   * @param {number} arg0
   */
  set planet_id(arg0) {
    wasm.__wbg_set_ashtakavargaresult_planet_id(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  PrastaraResult.prototype[Symbol.dispose] = PrastaraResult.prototype.free;
}

export class ReducedAshtakavarga {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ReducedAshtakavarga.prototype);
    obj.__wbg_ptr = ptr;
    ReducedAshtakavargaFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ReducedAshtakavargaFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_reducedashtakavarga_free(ptr, 0);
  }
  /**
   * @returns {Int32Array}
   */
  get reduced_bindus() {
    const ret = wasm.reducedashtakavarga_reduced_bindus(this.__wbg_ptr);
    var v1 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
  /**
   * @returns {number}
   */
  get shodaya_pinda() {
    const ret = wasm.__wbg_get_ashtakavargaresult_planet_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set shodaya_pinda(arg0) {
    wasm.__wbg_set_ashtakavargaresult_planet_id(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  ReducedAshtakavarga.prototype[Symbol.dispose] =
    ReducedAshtakavarga.prototype.free;
}

export class Sarvashtakavarga {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(Sarvashtakavarga.prototype);
    obj.__wbg_ptr = ptr;
    SarvashtakavargaFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SarvashtakavargaFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_sarvashtakavarga_free(ptr, 0);
  }
  /**
   * @returns {Int32Array}
   */
  get totals() {
    const ret = wasm.sarvashtakavarga_totals(this.__wbg_ptr);
    var v1 = getArrayI32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
  }
}
if (Symbol.dispose) {
  Sarvashtakavarga.prototype[Symbol.dispose] = Sarvashtakavarga.prototype.free;
}

export class ShadbalaProfile {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ShadbalaProfile.prototype);
    obj.__wbg_ptr = ptr;
    ShadbalaProfileFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ShadbalaProfileFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_shadbalaprofile_free(ptr, 0);
  }
  /**
   * @returns {ShadbalaResult}
   */
  get sun() {
    const ret = wasm.__wbg_get_shadbalaprofile_sun(this.__wbg_ptr);
    return ShadbalaResult.__wrap(ret);
  }
  /**
   * @param {ShadbalaResult} arg0
   */
  set sun(arg0) {
    _assertClass(arg0, ShadbalaResult);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_shadbalaprofile_sun(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {ShadbalaResult}
   */
  get moon() {
    const ret = wasm.__wbg_get_shadbalaprofile_moon(this.__wbg_ptr);
    return ShadbalaResult.__wrap(ret);
  }
  /**
   * @param {ShadbalaResult} arg0
   */
  set moon(arg0) {
    _assertClass(arg0, ShadbalaResult);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_shadbalaprofile_moon(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {ShadbalaResult}
   */
  get mars() {
    const ret = wasm.__wbg_get_shadbalaprofile_mars(this.__wbg_ptr);
    return ShadbalaResult.__wrap(ret);
  }
  /**
   * @param {ShadbalaResult} arg0
   */
  set mars(arg0) {
    _assertClass(arg0, ShadbalaResult);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_shadbalaprofile_mars(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {ShadbalaResult}
   */
  get mercury() {
    const ret = wasm.__wbg_get_shadbalaprofile_mercury(this.__wbg_ptr);
    return ShadbalaResult.__wrap(ret);
  }
  /**
   * @param {ShadbalaResult} arg0
   */
  set mercury(arg0) {
    _assertClass(arg0, ShadbalaResult);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_shadbalaprofile_mercury(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {ShadbalaResult}
   */
  get jupiter() {
    const ret = wasm.__wbg_get_shadbalaprofile_jupiter(this.__wbg_ptr);
    return ShadbalaResult.__wrap(ret);
  }
  /**
   * @param {ShadbalaResult} arg0
   */
  set jupiter(arg0) {
    _assertClass(arg0, ShadbalaResult);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_shadbalaprofile_jupiter(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {ShadbalaResult}
   */
  get venus() {
    const ret = wasm.__wbg_get_shadbalaprofile_venus(this.__wbg_ptr);
    return ShadbalaResult.__wrap(ret);
  }
  /**
   * @param {ShadbalaResult} arg0
   */
  set venus(arg0) {
    _assertClass(arg0, ShadbalaResult);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_shadbalaprofile_venus(this.__wbg_ptr, ptr0);
  }
  /**
   * @returns {ShadbalaResult}
   */
  get saturn() {
    const ret = wasm.__wbg_get_shadbalaprofile_saturn(this.__wbg_ptr);
    return ShadbalaResult.__wrap(ret);
  }
  /**
   * @param {ShadbalaResult} arg0
   */
  set saturn(arg0) {
    _assertClass(arg0, ShadbalaResult);
    var ptr0 = arg0.__destroy_into_raw();
    wasm.__wbg_set_shadbalaprofile_saturn(this.__wbg_ptr, ptr0);
  }
}
if (Symbol.dispose) {
  ShadbalaProfile.prototype[Symbol.dispose] = ShadbalaProfile.prototype.free;
}

/**
 * Detailed breakdown of Shadbala
 */
export class ShadbalaResult {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(ShadbalaResult.prototype);
    obj.__wbg_ptr = ptr;
    ShadbalaResultFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    ShadbalaResultFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_shadbalaresult_free(ptr, 0);
  }
  /**
   * Total Shadbala in Rupas
   * @returns {number}
   */
  get total_rupas() {
    const ret = wasm.__wbg_get_shadbalaresult_total_rupas(this.__wbg_ptr);
    return ret;
  }
  /**
   * Total Shadbala in Rupas
   * @param {number} arg0
   */
  set total_rupas(arg0) {
    wasm.__wbg_set_shadbalaresult_total_rupas(this.__wbg_ptr, arg0);
  }
  /**
   * Ishta Phala (0-60)
   * @returns {number}
   */
  get ishta_phala() {
    const ret = wasm.__wbg_get_shadbalaresult_ishta_phala(this.__wbg_ptr);
    return ret;
  }
  /**
   * Ishta Phala (0-60)
   * @param {number} arg0
   */
  set ishta_phala(arg0) {
    wasm.__wbg_set_shadbalaresult_ishta_phala(this.__wbg_ptr, arg0);
  }
  /**
   * Kashta Phala (0-60)
   * @returns {number}
   */
  get kashta_phala() {
    const ret = wasm.__wbg_get_shadbalaresult_kashta_phala(this.__wbg_ptr);
    return ret;
  }
  /**
   * Kashta Phala (0-60)
   * @param {number} arg0
   */
  set kashta_phala(arg0) {
    wasm.__wbg_set_shadbalaresult_kashta_phala(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get sthana_bala() {
    const ret = wasm.__wbg_get_shadbalaresult_sthana_bala(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set sthana_bala(arg0) {
    wasm.__wbg_set_shadbalaresult_sthana_bala(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get dig_bala() {
    const ret = wasm.__wbg_get_shadbalaresult_dig_bala(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set dig_bala(arg0) {
    wasm.__wbg_set_shadbalaresult_dig_bala(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get kala_bala() {
    const ret = wasm.__wbg_get_shadbalaresult_kala_bala(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set kala_bala(arg0) {
    wasm.__wbg_set_shadbalaresult_kala_bala(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get chesta_bala() {
    const ret = wasm.__wbg_get_shadbalaresult_chesta_bala(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set chesta_bala(arg0) {
    wasm.__wbg_set_shadbalaresult_chesta_bala(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get naisargika_bala() {
    const ret = wasm.__wbg_get_shadbalaresult_naisargika_bala(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set naisargika_bala(arg0) {
    wasm.__wbg_set_shadbalaresult_naisargika_bala(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get drik_bala() {
    const ret = wasm.__wbg_get_shadbalaresult_drik_bala(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set drik_bala(arg0) {
    wasm.__wbg_set_shadbalaresult_drik_bala(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  ShadbalaResult.prototype[Symbol.dispose] = ShadbalaResult.prototype.free;
}

export class SpecialLagnas {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(SpecialLagnas.prototype);
    obj.__wbg_ptr = ptr;
    SpecialLagnasFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SpecialLagnasFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_speciallagnas_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get hora_lagna() {
    const ret = wasm.__wbg_get_speciallagnas_hora_lagna(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set hora_lagna(arg0) {
    wasm.__wbg_set_speciallagnas_hora_lagna(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get ghati_lagna() {
    const ret = wasm.__wbg_get_speciallagnas_ghati_lagna(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set ghati_lagna(arg0) {
    wasm.__wbg_set_speciallagnas_ghati_lagna(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get sree_lagna() {
    const ret = wasm.__wbg_get_speciallagnas_sree_lagna(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set sree_lagna(arg0) {
    wasm.__wbg_set_speciallagnas_sree_lagna(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  SpecialLagnas.prototype[Symbol.dispose] = SpecialLagnas.prototype.free;
}

/**
 * Error returned by Swiss Ephemeris calculations
 */
export class SwissEphError {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(SwissEphError.prototype);
    obj.__wbg_ptr = ptr;
    SwissEphErrorFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    SwissEphErrorFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_swissepherror_free(ptr, 0);
  }
  /**
   * Error message from the library
   * @returns {string}
   */
  get message() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_swissepherror_message(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Error message from the library
   * @param {string} arg0
   */
  set message(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_swissepherror_message(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Return code
   * @returns {number}
   */
  get code() {
    const ret = wasm.__wbg_get_swissepherror_code(this.__wbg_ptr);
    return ret;
  }
  /**
   * Return code
   * @param {number} arg0
   */
  set code(arg0) {
    wasm.__wbg_set_swissepherror_code(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  SwissEphError.prototype[Symbol.dispose] = SwissEphError.prototype.free;
}

/**
 * Time interval
 */
export class TimeInterval {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TimeInterval.prototype);
    obj.__wbg_ptr = ptr;
    TimeIntervalFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TimeIntervalFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_timeinterval_free(ptr, 0);
  }
  /**
   * Start time as Unix timestamp in ms
   * @returns {number}
   */
  get start_ms() {
    const ret = wasm.__wbg_get_planetdata_longitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * Start time as Unix timestamp in ms
   * @param {number} arg0
   */
  set start_ms(arg0) {
    wasm.__wbg_set_planetdata_longitude(this.__wbg_ptr, arg0);
  }
  /**
   * End time as Unix timestamp in ms
   * @returns {number}
   */
  get end_ms() {
    const ret = wasm.__wbg_get_planetdata_latitude(this.__wbg_ptr);
    return ret;
  }
  /**
   * End time as Unix timestamp in ms
   * @param {number} arg0
   */
  set end_ms(arg0) {
    wasm.__wbg_set_planetdata_latitude(this.__wbg_ptr, arg0);
  }
  /**
   * Duration in minutes
   * @returns {number}
   */
  get duration_minutes() {
    const ret = wasm.__wbg_get_planetdata_distance(this.__wbg_ptr);
    return ret;
  }
  /**
   * Duration in minutes
   * @param {number} arg0
   */
  set duration_minutes(arg0) {
    wasm.__wbg_set_planetdata_distance(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  TimeInterval.prototype[Symbol.dispose] = TimeInterval.prototype.free;
}

/**
 * Tithi information
 */
export class TithiInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(TithiInfo.prototype);
    obj.__wbg_ptr = ptr;
    TithiInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    TithiInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_tithiinfo_free(ptr, 0);
  }
  /**
   * Tithi index (1-30)
   * @returns {number}
   */
  get index() {
    const ret = wasm.__wbg_get_tithiinfo_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Tithi index (1-30)
   * @param {number} arg0
   */
  set index(arg0) {
    wasm.__wbg_set_tithiinfo_index(this.__wbg_ptr, arg0);
  }
  /**
   * Tithi name
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_tithiinfo_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Tithi name
   * @param {string} arg0
   */
  set name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_tithiinfo_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Lunar fortnight
   * @returns {Paksha}
   */
  get paksha() {
    const ret = wasm.__wbg_get_tithiinfo_paksha(this.__wbg_ptr);
    return ret;
  }
  /**
   * Lunar fortnight
   * @param {Paksha} arg0
   */
  set paksha(arg0) {
    wasm.__wbg_set_tithiinfo_paksha(this.__wbg_ptr, arg0);
  }
  /**
   * Completion percentage (0.0 to 1.0)
   * @returns {number}
   */
  get completion() {
    const ret = wasm.__wbg_get_speciallagnas_hora_lagna(this.__wbg_ptr);
    return ret;
  }
  /**
   * Completion percentage (0.0 to 1.0)
   * @param {number} arg0
   */
  set completion(arg0) {
    wasm.__wbg_set_speciallagnas_hora_lagna(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {string}
   */
  get paksha_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.tithiinfo_paksha_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}
if (Symbol.dispose) {
  TithiInfo.prototype[Symbol.dispose] = TithiInfo.prototype.free;
}

/**
 * Vara (weekday) information
 */
export class VaraInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(VaraInfo.prototype);
    obj.__wbg_ptr = ptr;
    VaraInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    VaraInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_varainfo_free(ptr, 0);
  }
  /**
   * Day index (0=Sunday, 6=Saturday)
   * @returns {number}
   */
  get index() {
    const ret = wasm.__wbg_get_varainfo_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Day index (0=Sunday, 6=Saturday)
   * @param {number} arg0
   */
  set index(arg0) {
    wasm.__wbg_set_varainfo_index(this.__wbg_ptr, arg0);
  }
  /**
   * Sanskrit weekday name
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_varainfo_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Sanskrit weekday name
   * @param {string} arg0
   */
  set name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_varainfo_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Planetary lord
   * @returns {string}
   */
  get lord() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_varainfo_lord(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Planetary lord
   * @param {string} arg0
   */
  set lord(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_varainfo_lord(this.__wbg_ptr, ptr0, len0);
  }
}
if (Symbol.dispose) {
  VaraInfo.prototype[Symbol.dispose] = VaraInfo.prototype.free;
}

/**
 * Result of a Varga calculation for a single point
 */
export class VargaPosition {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(VargaPosition.prototype);
    obj.__wbg_ptr = ptr;
    VargaPositionFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    VargaPositionFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_vargaposition_free(ptr, 0);
  }
  /**
   * The sign in the divisional chart (1-12)
   * @returns {number}
   */
  get sign() {
    const ret = wasm.__wbg_get_vargaposition_sign(this.__wbg_ptr);
    return ret;
  }
  /**
   * The sign in the divisional chart (1-12)
   * @param {number} arg0
   */
  set sign(arg0) {
    wasm.__wbg_set_vargaposition_sign(this.__wbg_ptr, arg0);
  }
  /**
   * Exact longitude within that sign (0-30 degrees)
   * @returns {number}
   */
  get longitude() {
    const ret = wasm.__wbg_get_speciallagnas_hora_lagna(this.__wbg_ptr);
    return ret;
  }
  /**
   * Exact longitude within that sign (0-30 degrees)
   * @param {number} arg0
   */
  set longitude(arg0) {
    wasm.__wbg_set_speciallagnas_hora_lagna(this.__wbg_ptr, arg0);
  }
  /**
   * Absolute longitude in the Varga chart (0-360)
   * @returns {number}
   */
  get full_longitude() {
    const ret = wasm.__wbg_get_speciallagnas_ghati_lagna(this.__wbg_ptr);
    return ret;
  }
  /**
   * Absolute longitude in the Varga chart (0-360)
   * @param {number} arg0
   */
  set full_longitude(arg0) {
    wasm.__wbg_set_speciallagnas_ghati_lagna(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  VargaPosition.prototype[Symbol.dispose] = VargaPosition.prototype.free;
}

/**
 * @enum {1 | 2 | 3 | 4 | 7 | 9 | 10 | 12 | 16 | 20 | 24 | 27 | 30 | 40 | 45 | 60}
 */
export const VargaType = Object.freeze({
  D1: 1,
  "1": "D1",
  D2: 2,
  "2": "D2",
  D3: 3,
  "3": "D3",
  D4: 4,
  "4": "D4",
  D7: 7,
  "7": "D7",
  D9: 9,
  "9": "D9",
  D10: 10,
  "10": "D10",
  D12: 12,
  "12": "D12",
  D16: 16,
  "16": "D16",
  D20: 20,
  "20": "D20",
  D24: 24,
  "24": "D24",
  D27: 27,
  "27": "D27",
  D30: 30,
  "30": "D30",
  D40: 40,
  "40": "D40",
  D45: 45,
  "45": "D45",
  D60: 60,
  "60": "D60",
});

export class WarDetails {
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    WarDetailsFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_wardetails_free(ptr, 0);
  }
  /**
   * @returns {number}
   */
  get planet1_id() {
    const ret = wasm.__wbg_get_wardetails_planet1_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set planet1_id(arg0) {
    wasm.__wbg_set_wardetails_planet1_id(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {string}
   */
  get planet1_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_wardetails_planet1_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} arg0
   */
  set planet1_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_wardetails_planet1_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @returns {number}
   */
  get planet1_long() {
    const ret = wasm.__wbg_get_dashainfo_mahadasha_end_date(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set planet1_long(arg0) {
    wasm.__wbg_set_dashainfo_mahadasha_end_date(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get planet1_mag() {
    const ret = wasm.__wbg_get_dashainfo_antardasha_end_date(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set planet1_mag(arg0) {
    wasm.__wbg_set_dashainfo_antardasha_end_date(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get planet2_id() {
    const ret = wasm.__wbg_get_wardetails_planet2_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set planet2_id(arg0) {
    wasm.__wbg_set_wardetails_planet2_id(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {string}
   */
  get planet2_name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_wardetails_planet2_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} arg0
   */
  set planet2_name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_wardetails_planet2_name(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * @returns {number}
   */
  get planet2_long() {
    const ret = wasm.__wbg_get_dashainfo_pratyantardasha_end_date(
      this.__wbg_ptr,
    );
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set planet2_long(arg0) {
    wasm.__wbg_set_dashainfo_pratyantardasha_end_date(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get planet2_mag() {
    const ret = wasm.__wbg_get_wardetails_planet2_mag(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set planet2_mag(arg0) {
    wasm.__wbg_set_wardetails_planet2_mag(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get longitude_diff() {
    const ret = wasm.__wbg_get_wardetails_longitude_diff(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set longitude_diff(arg0) {
    wasm.__wbg_set_wardetails_longitude_diff(this.__wbg_ptr, arg0);
  }
  /**
   * @returns {number}
   */
  get winner_id() {
    const ret = wasm.__wbg_get_wardetails_winner_id(this.__wbg_ptr);
    return ret;
  }
  /**
   * @param {number} arg0
   */
  set winner_id(arg0) {
    wasm.__wbg_set_wardetails_winner_id(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  WarDetails.prototype[Symbol.dispose] = WarDetails.prototype.free;
}

/**
 * Yoga information
 */
export class YogaInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(YogaInfo.prototype);
    obj.__wbg_ptr = ptr;
    YogaInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    YogaInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_yogainfo_free(ptr, 0);
  }
  /**
   * Yoga index (1-27)
   * @returns {number}
   */
  get index() {
    const ret = wasm.__wbg_get_yogainfo_index(this.__wbg_ptr);
    return ret;
  }
  /**
   * Yoga index (1-27)
   * @param {number} arg0
   */
  set index(arg0) {
    wasm.__wbg_set_yogainfo_index(this.__wbg_ptr, arg0);
  }
  /**
   * Yoga name
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_yogainfo_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Yoga name
   * @param {string} arg0
   */
  set name(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_yogainfo_name(this.__wbg_ptr, ptr0, len0);
  }
}
if (Symbol.dispose) {
  YogaInfo.prototype[Symbol.dispose] = YogaInfo.prototype.free;
}

export class YogaResult {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(YogaResult.prototype);
    obj.__wbg_ptr = ptr;
    YogaResultFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    YogaResultFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_yogaresult_free(ptr, 0);
  }
  /**
   * @returns {string}
   */
  get description() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.yogaresult_description(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * @param {string} name
   * @param {string} description
   */
  constructor(name, description) {
    const ptr0 = passStringToWasm0(
      name,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    const ptr1 = passStringToWasm0(
      description,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len1 = WASM_VECTOR_LEN;
    const ret = wasm.yogaresult_new(ptr0, len0, ptr1, len1);
    this.__wbg_ptr = ret >>> 0;
    YogaResultFinalization.register(this, this.__wbg_ptr, this);
    return this;
  }
  /**
   * @returns {string}
   */
  get name() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.yogaresult_name(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
}
if (Symbol.dispose) {
  YogaResult.prototype[Symbol.dispose] = YogaResult.prototype.free;
}

/**
 * Yogini Dasha Information
 */
export class YoginiInfo {
  static __wrap(ptr) {
    ptr = ptr >>> 0;
    const obj = Object.create(YoginiInfo.prototype);
    obj.__wbg_ptr = ptr;
    YoginiInfoFinalization.register(obj, obj.__wbg_ptr, obj);
    return obj;
  }
  __destroy_into_raw() {
    const ptr = this.__wbg_ptr;
    this.__wbg_ptr = 0;
    YoginiInfoFinalization.unregister(this);
    return ptr;
  }
  free() {
    const ptr = this.__destroy_into_raw();
    wasm.__wbg_yoginiinfo_free(ptr, 0);
  }
  /**
   * Current Mahadasha lord (Yogini)
   * @returns {string}
   */
  get mahadasha() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_yoginiinfo_mahadasha(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Current Mahadasha lord (Yogini)
   * @param {string} arg0
   */
  set mahadasha(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_yoginiinfo_mahadasha(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Current Antardasha lord (Yogini)
   * @returns {string}
   */
  get antardasha() {
    let deferred1_0;
    let deferred1_1;
    try {
      const ret = wasm.__wbg_get_yoginiinfo_antardasha(this.__wbg_ptr);
      deferred1_0 = ret[0];
      deferred1_1 = ret[1];
      return getStringFromWasm0(ret[0], ret[1]);
    } finally {
      wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
  }
  /**
   * Current Antardasha lord (Yogini)
   * @param {string} arg0
   */
  set antardasha(arg0) {
    const ptr0 = passStringToWasm0(
      arg0,
      wasm.__wbindgen_malloc,
      wasm.__wbindgen_realloc,
    );
    const len0 = WASM_VECTOR_LEN;
    wasm.__wbg_set_yoginiinfo_antardasha(this.__wbg_ptr, ptr0, len0);
  }
  /**
   * Date when the current Mahadasha ends (Unix ms)
   * @returns {number}
   */
  get mahadasha_end_date() {
    const ret = wasm.__wbg_get_dashainfo_mahadasha_end_date(this.__wbg_ptr);
    return ret;
  }
  /**
   * Date when the current Mahadasha ends (Unix ms)
   * @param {number} arg0
   */
  set mahadasha_end_date(arg0) {
    wasm.__wbg_set_dashainfo_mahadasha_end_date(this.__wbg_ptr, arg0);
  }
  /**
   * Date when the current Antardasha ends (Unix ms)
   * @returns {number}
   */
  get antardasha_end_date() {
    const ret = wasm.__wbg_get_dashainfo_antardasha_end_date(this.__wbg_ptr);
    return ret;
  }
  /**
   * Date when the current Antardasha ends (Unix ms)
   * @param {number} arg0
   */
  set antardasha_end_date(arg0) {
    wasm.__wbg_set_dashainfo_antardasha_end_date(this.__wbg_ptr, arg0);
  }
}
if (Symbol.dispose) {
  YoginiInfo.prototype[Symbol.dispose] = YoginiInfo.prototype.free;
}

/**
 * Calculate planetary position using UT (Universal Time)
 * @param {number} jd_ut
 * @param {number} planet
 * @param {number} flags
 * @returns {Position}
 */
export function calc_ut(jd_ut, planet, flags) {
  const ret = wasm.calc_ut(jd_ut, planet, flags);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return Position.__wrap(ret[0]);
}

/**
 * Calculate Sarvashtakavarga (Ashtakavarga Totals)
 * Calculate Sarvashtakavarga (Ashtakavarga Totals)
 * @param {any} planet_longs
 * @param {number} ascendant
 * @returns {Sarvashtakavarga}
 */
export function calculate_ashtakavarga(planet_longs, ascendant) {
  const ret = wasm.calculate_ashtakavarga(planet_longs, ascendant);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return Sarvashtakavarga.__wrap(ret[0]);
}

/**
 * Calculate Jaimini Chara Dasha Periods
 * @param {any} planet_longs
 * @param {number} ascendant_sign
 * @param {number} start_year
 * @returns {CharaDashaPeriod[]}
 */
export function calculate_chara_dasha_periods(
  planet_longs,
  ascendant_sign,
  start_year,
) {
  const ret = wasm.calculate_chara_dasha_periods(
    planet_longs,
    ascendant_sign,
    start_year,
  );
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v1;
}

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
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {Location} location
 * @param {number} ayan_mode
 * @returns {DailyPanchang}
 */
export function calculate_daily_panchang(
  year,
  month,
  day,
  location,
  ayan_mode,
) {
  _assertClass(location, Location);
  const ret = wasm.calculate_daily_panchang(
    year,
    month,
    day,
    location.__wbg_ptr,
    ayan_mode,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return DailyPanchang.__wrap(ret[0]);
}

/**
 * Calculate Full Shadbala Profile (All 7 planets)
 * @param {any} planet_longs
 * @param {number} jd
 * @param {number} ascendant
 * @returns {ShadbalaProfile}
 */
export function calculate_full_shadbala(planet_longs, jd, ascendant) {
  const ret = wasm.calculate_full_shadbala(planet_longs, jd, ascendant);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return ShadbalaProfile.__wrap(ret[0]);
}

/**
 * Calculate Gulika Kaal for a given day
 * @param {number} sunrise_ms
 * @param {number} sunset_ms
 * @param {number} weekday
 * @returns {TimeInterval}
 */
export function calculate_gulika(sunrise_ms, sunset_ms, weekday) {
  const ret = wasm.calculate_gulika(sunrise_ms, sunset_ms, weekday);
  return TimeInterval.__wrap(ret);
}

/**
 * Calculate house system (Ascendant, MC, House Cusps)
 *
 * # Arguments
 * * `jd` - Julian Day
 * * `lat` - Latitude
 * * `lon` - Longitude
 * * `hsys` - House System (e.g. 'P' for Placidus, 'W' for Whole Sign)
 * * `ayan_mode` - Ayanamsha mode (-1 for tropical, others for sidereal)
 * @param {number} jd
 * @param {number} lat
 * @param {number} lon
 * @param {string} hsys
 * @param {number} ayan_mode
 * @returns {HouseInfo}
 */
export function calculate_houses(jd, lat, lon, hsys, ayan_mode) {
  const char0 = hsys.codePointAt(0);
  _assertChar(char0);
  const ret = wasm.calculate_houses(jd, lat, lon, char0, ayan_mode);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return HouseInfo.__wrap(ret[0]);
}

/**
 * Calculate Jaimini Karakas
 * @param {any} planet_longs
 * @param {boolean} use_8_karakas
 * @returns {KarakaObject[]}
 */
export function calculate_jaimini_karakas(planet_longs, use_8_karakas) {
  const ret = wasm.calculate_jaimini_karakas(planet_longs, use_8_karakas);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v1;
}

/**
 * Calculate Karana for a given Julian Day
 * There are 60 Karanas per lunar month (2 per Tithi)
 * @param {number} jd
 * @returns {KaranaInfo}
 */
export function calculate_karana(jd) {
  const ret = wasm.calculate_karana(jd);
  return KaranaInfo.__wrap(ret);
}

/**
 * Calculate Raahu, Yamaganda, and Gulika for a given day
 *
 * # Arguments
 * * `sunrise_ms` - Unix timestamp of sunrise in ms
 * * `sunset_ms` - Unix timestamp of sunset in ms
 * * `weekday` - 0=Sunday, 1=Monday, ..., 6=Saturday
 * @param {number} sunrise_ms
 * @param {number} sunset_ms
 * @param {number} weekday
 * @returns {DayMuhurats}
 */
export function calculate_muhurats(sunrise_ms, sunset_ms, weekday) {
  const ret = wasm.calculate_muhurats(sunrise_ms, sunset_ms, weekday);
  return DayMuhurats.__wrap(ret);
}

/**
 * Calculate Nakshatra for a given Julian Day
 * Each Nakshatra spans 13°20' (13.333... degrees)
 * @param {number} jd
 * @param {AyanamshaMode} ayanamsha_mode
 * @returns {NakshatraInfo}
 */
export function calculate_nakshatra(jd, ayanamsha_mode) {
  const ret = wasm.calculate_nakshatra(jd, ayanamsha_mode);
  return NakshatraInfo.__wrap(ret);
}

/**
 * Calculate Shadbala for a single planet (Stub)
 * @param {number} long
 * @param {number} planet_id
 * @param {number} jd
 * @param {number} ascendant
 * @returns {ShadbalaResult}
 */
export function calculate_planet_strength(long, planet_id, jd, ascendant) {
  const ret = wasm.calculate_planet_strength(long, planet_id, jd, ascendant);
  return ShadbalaResult.__wrap(ret);
}

/**
 * Calculate Sidereal Planet Positions for all 9 core planets
 *
 * # Arguments
 * * `jd` - Julian Day
 * * `ayan_mode` - Ayanamsha mode (e.g., 1 for Lahiri)
 * @param {number} jd
 * @param {number} ayan_mode
 * @returns {any}
 */
export function calculate_planets(jd, ayan_mode) {
  const ret = wasm.calculate_planets(jd, ayan_mode);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

/**
 * Calculate Prastara Ashtakavarga (Detailed Grid)
 * @param {number} planet_id
 * @param {any} planet_longs
 * @param {number} ascendant
 * @returns {PrastaraResult}
 */
export function calculate_prastara_ashtakavarga(
  planet_id,
  planet_longs,
  ascendant,
) {
  const ret = wasm.calculate_prastara_ashtakavarga(
    planet_id,
    planet_longs,
    ascendant,
  );
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return PrastaraResult.__wrap(ret[0]);
}

/**
 * Calculate Rahu Kaal for a given day
 * sunrise_ms and sunset_ms are Unix timestamps in milliseconds
 * weekday is 0=Sunday, 6=Saturday
 * @param {number} sunrise_ms
 * @param {number} sunset_ms
 * @param {number} weekday
 * @returns {TimeInterval}
 */
export function calculate_rahu_kaal(sunrise_ms, sunset_ms, weekday) {
  const ret = wasm.calculate_rahu_kaal(sunrise_ms, sunset_ms, weekday);
  return TimeInterval.__wrap(ret);
}

/**
 * Calculate Ashtakavarga Reductions (Trikona & Ekadhipatya)
 * @param {any} bindus
 * @param {any} planet_longs
 * @returns {ReducedAshtakavarga}
 */
export function calculate_reduced_ashtakavarga(bindus, planet_longs) {
  const ret = wasm.calculate_reduced_ashtakavarga(bindus, planet_longs);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return ReducedAshtakavarga.__wrap(ret[0]);
}

/**
 * Calculate Special Lagnas (Hora, Ghati, Sree Lagna)
 * @param {number} birth_jd
 * @param {number} sunrise_jd
 * @param {number} sunrise_sun_long
 * @param {number} lagna_long
 * @param {number} moon_long
 * @returns {SpecialLagnas}
 */
export function calculate_special_lagnas(
  birth_jd,
  sunrise_jd,
  sunrise_sun_long,
  lagna_long,
  moon_long,
) {
  const ret = wasm.calculate_special_lagnas(
    birth_jd,
    sunrise_jd,
    sunrise_sun_long,
    lagna_long,
    moon_long,
  );
  return SpecialLagnas.__wrap(ret);
}

/**
 * Calculate sunrise time for a given date and location
 * Returns Unix timestamp in milliseconds
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {Location} location
 * @returns {number}
 */
export function calculate_sunrise(year, month, day, location) {
  _assertClass(location, Location);
  const ret = wasm.calculate_sunrise(year, month, day, location.__wbg_ptr);
  return ret;
}

/**
 * Calculate sunset time for a given date and location
 * Returns Unix timestamp in milliseconds
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {Location} location
 * @returns {number}
 */
export function calculate_sunset(year, month, day, location) {
  _assertClass(location, Location);
  const ret = wasm.calculate_sunset(year, month, day, location.__wbg_ptr);
  return ret;
}

/**
 * Calculate Tithi for a given Julian Day
 * Returns TithiInfo with index, name, paksha, and completion percentage
 * @param {number} jd
 * @returns {TithiInfo}
 */
export function calculate_tithi(jd) {
  const ret = wasm.calculate_tithi(jd);
  return TithiInfo.__wrap(ret);
}

/**
 * Calculate Vara (weekday) for a given Julian Day
 * Note: This returns the astronomical weekday.
 * For Vedic Vara, compare with sunrise time.
 * @param {number} jd
 * @returns {VaraInfo}
 */
export function calculate_vara(jd) {
  const ret = wasm.calculate_vara(jd);
  return VaraInfo.__wrap(ret);
}

/**
 * Calculate specific Varga position
 * Calculate specific Varga position
 * Calculate specific Varga position
 * @param {number} long
 * @param {number} varga_val
 * @param {any} config
 * @returns {VargaPosition}
 */
export function calculate_varga(long, varga_val, config) {
  const ret = wasm.calculate_varga(long, varga_val, config);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return VargaPosition.__wrap(ret[0]);
}

/**
 * Calculate Vimshottari Dasha details
 *
 * # Arguments
 * * `moon_long` - Moon's sidereal longitude (degrees)
 * * `birth_time_ms` - Birth time (Unix ms)
 * * `current_time_ms` - Current time (Unix ms)
 * @param {number} moon_long
 * @param {number} birth_time_ms
 * @param {number} current_time_ms
 * @returns {DashaInfo}
 */
export function calculate_vimshottari(
  moon_long,
  birth_time_ms,
  current_time_ms,
) {
  const ret = wasm.calculate_vimshottari(
    moon_long,
    birth_time_ms,
    current_time_ms,
  );
  return DashaInfo.__wrap(ret);
}

/**
 * Calculate Yamaganda for a given day
 * @param {number} sunrise_ms
 * @param {number} sunset_ms
 * @param {number} weekday
 * @returns {TimeInterval}
 */
export function calculate_yamaganda(sunrise_ms, sunset_ms, weekday) {
  const ret = wasm.calculate_yamaganda(sunrise_ms, sunset_ms, weekday);
  return TimeInterval.__wrap(ret);
}

/**
 * Calculate Yoga for a given Julian Day
 * Formula: Yoga = floor((Moon_long + Sun_long) / 13.333) + 1
 * @param {number} jd
 * @param {AyanamshaMode} ayanamsha_mode
 * @returns {YogaInfo}
 */
export function calculate_yoga(jd, ayanamsha_mode) {
  const ret = wasm.calculate_yoga(jd, ayanamsha_mode);
  return YogaInfo.__wrap(ret);
}

/**
 * Calculate Yogini Dasha details
 * @param {number} moon_long
 * @param {number} birth_time_ms
 * @param {number} current_time_ms
 * @returns {YoginiInfo}
 */
export function calculate_yogini(moon_long, birth_time_ms, current_time_ms) {
  const ret = wasm.calculate_yogini(moon_long, birth_time_ms, current_time_ms);
  return YoginiInfo.__wrap(ret);
}

/**
 * Check for Planetary War (Graha Yuddha)
 * Occurs when two Tara Grahas (Mars, Mercury, Jupiter, Venus, Saturn)
 * are within 1 degree of each other.
 * @param {number} jd
 * @param {number} ayan_mode
 * @returns {any}
 */
export function check_graha_yuddha(jd, ayan_mode) {
  const ret = wasm.check_graha_yuddha(jd, ayan_mode);
  return ret;
}

/**
 * Find active Yogas (Planetary Combinations)
 * @param {any} planet_longs
 * @param {number} ascendant
 * @returns {YogaResult[]}
 */
export function find_active_yogas(planet_longs, ascendant) {
  const ret = wasm.find_active_yogas(planet_longs, ascendant);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getArrayJsValueFromWasm0(ret[0], ret[1]).slice();
  wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
  return v1;
}

/**
 * Get Ayanamsha value for a given mode and Julian Day
 * Get Ayanamsha value for a given mode and Julian Day
 * @param {AyanamshaMode} mode
 * @param {number} jd
 * @returns {number}
 */
export function get_ayanamsha(mode, jd) {
  const ret = wasm.get_ayanamsha(mode, jd);
  return ret;
}

/**
 * Get the underlying Swiss Ephemeris engine version
 * @returns {string}
 */
export function get_swisseph_version() {
  let deferred1_0;
  let deferred1_1;
  try {
    const ret = wasm.get_swisseph_version();
    deferred1_0 = ret[0];
    deferred1_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
  }
}

/**
 * Get the library version (panchangam)
 * @returns {string}
 */
export function get_version() {
  let deferred1_0;
  let deferred1_1;
  try {
    const ret = wasm.get_version();
    deferred1_0 = ret[0];
    deferred1_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
  }
}

/**
 * Calculate Julian Day when current Karana ends
 * @param {number} jd
 * @returns {number}
 */
export function karana_end_time(jd) {
  const ret = wasm.karana_end_time(jd);
  return ret;
}

/**
 * Calculate Julian Day when current Karana started
 * @param {number} jd
 * @returns {number}
 */
export function karana_start_time(jd) {
  const ret = wasm.karana_start_time(jd);
  return ret;
}

/**
 * Calculate Julian Day when Moon transitions to next Nakshatra
 * @param {number} jd
 * @param {AyanamshaMode} ayanamsha_mode
 * @returns {number}
 */
export function nakshatra_end_time(jd, ayanamsha_mode) {
  const ret = wasm.nakshatra_end_time(jd, ayanamsha_mode);
  return ret;
}

/**
 * Calculate Julian Day when current Nakshatra started
 * @param {number} jd
 * @param {AyanamshaMode} ayanamsha_mode
 * @returns {number}
 */
export function nakshatra_start_time(jd, ayanamsha_mode) {
  const ret = wasm.nakshatra_start_time(jd, ayanamsha_mode);
  return ret;
}

/**
 * Calculate planetary position (UT)
 *
 * Returns simple struct with longitude, latitude, distance, speed values.
 * @param {number} tjd_ut
 * @param {number} ipl
 * @param {number} iflag
 * @returns {any}
 */
export function p_calc_ut(tjd_ut, ipl, iflag) {
  const ret = wasm.p_calc_ut(tjd_ut, ipl, iflag);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}

/**
 * Calculate Julian Day number
 *
 * # Arguments
 * * `year` - Year
 * * `month` - Month
 * * `day` - Day
 * * `hour` - Hour
 * * `gregflag` - Calendar flag (1 = Gregorian, 0 = Julian)
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @param {number} hour
 * @param {number} gregflag
 * @returns {number}
 */
export function p_julday(year, month, day, hour, gregflag) {
  const ret = wasm.p_julday(year, month, day, hour, gregflag);
  return ret;
}

/**
 * Set the ephemeris path
 * @param {string} path
 */
export function set_ephe_path(path) {
  const ptr0 = passStringToWasm0(
    path,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len0 = WASM_VECTOR_LEN;
  wasm.set_ephe_path(ptr0, len0);
}

/**
 * Julian Day when the current Tithi ends
 * @param {number} jd
 * @returns {number}
 */
export function tithi_end_time(jd) {
  const ret = wasm.tithi_end_time(jd);
  return ret;
}

/**
 * Julian Day when the current Tithi started
 * @param {number} jd
 * @returns {number}
 */
export function tithi_start_time(jd) {
  const ret = wasm.tithi_start_time(jd);
  return ret;
}

/**
 * Get Swiss Ephemeris version
 * @returns {string}
 */
export function version() {
  let deferred1_0;
  let deferred1_1;
  try {
    const ret = wasm.version();
    deferred1_0 = ret[0];
    deferred1_1 = ret[1];
    return getStringFromWasm0(ret[0], ret[1]);
  } finally {
    wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
  }
}

/**
 * Calculate Julian Day when current Yoga ends
 * @param {number} jd
 * @param {AyanamshaMode} ayanamsha_mode
 * @returns {number}
 */
export function yoga_end_time(jd, ayanamsha_mode) {
  const ret = wasm.yoga_end_time(jd, ayanamsha_mode);
  return ret;
}

/**
 * Calculate Julian Day when current Yoga started
 * @param {number} jd
 * @param {AyanamshaMode} ayanamsha_mode
 * @returns {number}
 */
export function yoga_start_time(jd, ayanamsha_mode) {
  const ret = wasm.yoga_start_time(jd, ayanamsha_mode);
  return ret;
}

export function __wbg_Error_52673b7de5a0ca89(arg0, arg1) {
  const ret = Error(getStringFromWasm0(arg0, arg1));
  return ret;
}

export function __wbg_Number_2d1dcfcf4ec51736(arg0) {
  const ret = Number(arg0);
  return ret;
}

export function __wbg_String_8f0eb39a4a4c2f66(arg0, arg1) {
  const ret = String(arg1);
  const ptr1 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbg___wbindgen_boolean_get_dea25b33882b895b(arg0) {
  const v = arg0;
  const ret = typeof v === "boolean" ? v : undefined;
  return isLikeNone(ret) ? 0xFFFFFF : ret ? 1 : 0;
}

export function __wbg___wbindgen_debug_string_adfb662ae34724b6(arg0, arg1) {
  const ret = debugString(arg1);
  const ptr1 = passStringToWasm0(
    ret,
    wasm.__wbindgen_malloc,
    wasm.__wbindgen_realloc,
  );
  const len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbg___wbindgen_in_0d3e1e8f0c669317(arg0, arg1) {
  const ret = arg0 in arg1;
  return ret;
}

export function __wbg___wbindgen_is_function_8d400b8b1af978cd(arg0) {
  const ret = typeof arg0 === "function";
  return ret;
}

export function __wbg___wbindgen_is_null_dfda7d66506c95b5(arg0) {
  const ret = arg0 === null;
  return ret;
}

export function __wbg___wbindgen_is_object_ce774f3490692386(arg0) {
  const val = arg0;
  const ret = typeof val === "object" && val !== null;
  return ret;
}

export function __wbg___wbindgen_is_undefined_f6b95eab589e0269(arg0) {
  const ret = arg0 === undefined;
  return ret;
}

export function __wbg___wbindgen_jsval_loose_eq_766057600fdd1b0d(arg0, arg1) {
  const ret = arg0 == arg1;
  return ret;
}

export function __wbg___wbindgen_number_get_9619185a74197f95(arg0, arg1) {
  const obj = arg1;
  const ret = typeof obj === "number" ? obj : undefined;
  getDataViewMemory0().setFloat64(
    arg0 + 8 * 1,
    isLikeNone(ret) ? 0 : ret,
    true,
  );
  getDataViewMemory0().setInt32(arg0 + 4 * 0, !isLikeNone(ret), true);
}

export function __wbg___wbindgen_string_get_a2a31e16edf96e42(arg0, arg1) {
  const obj = arg1;
  const ret = typeof obj === "string" ? obj : undefined;
  var ptr1 = isLikeNone(ret)
    ? 0
    : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  var len1 = WASM_VECTOR_LEN;
  getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
  getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
}

export function __wbg___wbindgen_throw_dd24417ed36fc46e(arg0, arg1) {
  throw new Error(getStringFromWasm0(arg0, arg1));
}

export function __wbg_call_abb4ff46ce38be40() {
  return handleError(function (arg0, arg1) {
    const ret = arg0.call(arg1);
    return ret;
  }, arguments);
}

export function __wbg_charadashaperiod_new(arg0) {
  const ret = CharaDashaPeriod.__wrap(arg0);
  return ret;
}

export function __wbg_done_62ea16af4ce34b24(arg0) {
  const ret = arg0.done;
  return ret;
}

export function __wbg_get_6b7bd52aca3f9671(arg0, arg1) {
  const ret = arg0[arg1 >>> 0];
  return ret;
}

export function __wbg_get_af9dab7e9603ea93() {
  return handleError(function (arg0, arg1) {
    const ret = Reflect.get(arg0, arg1);
    return ret;
  }, arguments);
}

export function __wbg_get_with_ref_key_1dc361bd10053bfe(arg0, arg1) {
  const ret = arg0[arg1];
  return ret;
}

export function __wbg_instanceof_ArrayBuffer_f3320d2419cd0355(arg0) {
  let result;
  try {
    result = arg0 instanceof ArrayBuffer;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_instanceof_Uint8Array_da54ccc9d3e09434(arg0) {
  let result;
  try {
    result = arg0 instanceof Uint8Array;
  } catch (_) {
    result = false;
  }
  const ret = result;
  return ret;
}

export function __wbg_isArray_51fd9e6422c0a395(arg0) {
  const ret = Array.isArray(arg0);
  return ret;
}

export function __wbg_isSafeInteger_ae7d3f054d55fa16(arg0) {
  const ret = Number.isSafeInteger(arg0);
  return ret;
}

export function __wbg_iterator_27b7c8b35ab3e86b() {
  const ret = Symbol.iterator;
  return ret;
}

export function __wbg_karakaobject_new(arg0) {
  const ret = KarakaObject.__wrap(arg0);
  return ret;
}

export function __wbg_karakaobject_unwrap(arg0) {
  const ret = KarakaObject.__unwrap(arg0);
  return ret;
}

export function __wbg_length_22ac23eaec9d8053(arg0) {
  const ret = arg0.length;
  return ret;
}

export function __wbg_length_d45040a40c570362(arg0) {
  const ret = arg0.length;
  return ret;
}

export function __wbg_new_1ba21ce319a06297() {
  const ret = new Object();
  return ret;
}

export function __wbg_new_25f239778d6112b9() {
  const ret = new Array();
  return ret;
}

export function __wbg_new_6421f6084cc5bc5a(arg0) {
  const ret = new Uint8Array(arg0);
  return ret;
}

export function __wbg_next_138a17bbf04e926c(arg0) {
  const ret = arg0.next;
  return ret;
}

export function __wbg_next_3cfe5c0fe2a4cc53() {
  return handleError(function (arg0) {
    const ret = arg0.next();
    return ret;
  }, arguments);
}

export function __wbg_prototypesetcall_dfe9b766cdc1f1fd(arg0, arg1, arg2) {
  Uint8Array.prototype.set.call(getArrayU8FromWasm0(arg0, arg1), arg2);
}

export function __wbg_set_3f1d0b984ed272ed(arg0, arg1, arg2) {
  arg0[arg1] = arg2;
}

export function __wbg_set_7df433eea03a5c14(arg0, arg1, arg2) {
  arg0[arg1 >>> 0] = arg2;
}

export function __wbg_swissepherror_new(arg0) {
  const ret = SwissEphError.__wrap(arg0);
  return ret;
}

export function __wbg_value_57b7b035e117f7ee(arg0) {
  const ret = arg0.value;
  return ret;
}

export function __wbg_yogaresult_new(arg0) {
  const ret = YogaResult.__wrap(arg0);
  return ret;
}

export function __wbindgen_cast_2241b6af4c4b2941(arg0, arg1) {
  // Cast intrinsic for `Ref(String) -> Externref`.
  const ret = getStringFromWasm0(arg0, arg1);
  return ret;
}

export function __wbindgen_cast_d6cd19b81560fd6e(arg0) {
  // Cast intrinsic for `F64 -> Externref`.
  const ret = arg0;
  return ret;
}

export function __wbindgen_init_externref_table() {
  const table = wasm.__wbindgen_externrefs;
  const offset = table.grow(4);
  table.set(0, undefined);
  table.set(offset + 0, undefined);
  table.set(offset + 1, null);
  table.set(offset + 2, true);
  table.set(offset + 3, false);
}
