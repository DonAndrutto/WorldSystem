/* White Beryl interpretation, keyed ONLY by lunar-mansions.js identities.
 * No fetch, storage, ephemeris, or inferred relationship between the 27
 * Indian sectors and the 28 Tibetan entries. The calculator passes an id.
 */
import { VARA_NAMES } from './jyotisha.js';
import { WEEKDAY_ELEMENTS, ELEMENT_COMBINATIONS, NAMED_COMBINATIONS } from './white-beryl-rules.js';
import { INTERPRETATIONS } from './interpretation-data.js';
function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
freeze(INTERPRETATIONS);
export function getInterpretation(id) {
  return Object.hasOwn(INTERPRETATIONS, id) ? INTERPRETATIONS[id] : null;
}
export function isCompleteMoment(moment) {
  return !!(moment?.date && moment?.time && moment?.zoneResolved === true
    && Number.isFinite(moment?.utcMs) && moment?.vara);
}
// The engine's varaIndex already accounts for the sunrise day boundary.
function weekdayIndex(moment) {
  if (Number.isInteger(moment?.varaIndex) && moment.varaIndex >= 0 && moment.varaIndex < 7) return moment.varaIndex;
  const canonical = VARA_NAMES.indexOf(moment?.vara);
  if (canonical >= 0) return canonical;
  return ['Ravi', 'Soma', 'Maṅgala', 'Budha', 'Guru', 'Śukra', 'Śani'].indexOf(moment?.vara);
}
export function getActiveSbyorBa(moment, id = moment?.catalogueId) {
  if (!isCompleteMoment(moment)) return 'unknown';
  const star = getInterpretation(id)?.element;
  const day = WEEKDAY_ELEMENTS[weekdayIndex(moment)];
  if (!star || !day) return 'unknown';
  const key = [star, day].sort().join('-');
  return Object.hasOwn(ELEMENT_COMBINATIONS, key) ? key : 'unknown';
}
export function getMomentInterpretation(id, moment) {
  const key = getActiveSbyorBa(moment, id);
  if (key === 'unknown') return null;
  const weekday = weekdayIndex(moment);
  return { elemental: { key, ...ELEMENT_COMBINATIONS[key] },
    dayElement: WEEKDAY_ELEMENTS[weekday], starElement: getInterpretation(id).element,
    named: NAMED_COMBINATIONS.filter(rule => rule.starSets[weekday].includes(id)) };
}
export function getAfflictionStatus(id, { natalId = null, moment = null } = {}) {
  const current = getInterpretation(id);
  const natal = natalId ? getInterpretation(natalId) : null;
  const kinds = [];
  if (current && natal) {
    // Relationships belong to the natal entry and name current catalogue ids.
    if (natal.enemy_star_ids.includes(id)) kinds.push('enemy_star');
    if (natal.death_star_ids.includes(id)) kinds.push('death_star');
  }
  const active = isCompleteMoment(moment) ? getActiveSbyorBa(moment, id) : 'unknown';
  if (active !== 'unknown' && ELEMENT_COMBINATIONS[active]?.inauspicious === true) kinds.push('afflicted');
  return { afflicted: kinds.length > 0, kinds, natalCompared: !!(current && natal) };
}
export function getRemedies(id, kind) {
  if (!['afflicted', 'enemy_star', 'death_star'].includes(kind)) return null;
  return getInterpretation(id)?.remedies[kind] ?? null;
}
