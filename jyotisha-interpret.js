/* White Beryl interpretation, keyed ONLY by lunar-mansions.js identities.
 * No fetch, storage, ephemeris, or inferred relationship between the 27
 * Indian sectors and the 28 Tibetan entries. The calculator passes an id.
 */
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
export function getActiveSbyorBa(moment) {
  // Deliberate stub: no sbyor ba rules have been attested for this release.
  // Before replacing: cite and paste the exact L: lines from
  // docs/WHITE-BERYL-SOURCE-EXTRACTS.txt in the PR; identify rgya_gar vs
  // rgya_nag explicitly. Never combine their element lists into a hybrid.
  // A complete moment alone does not license an invented combination.
  return 'unknown';
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
  const active = isCompleteMoment(moment) ? getActiveSbyorBa(moment) : 'unknown';
  if (active !== 'unknown' && current?.combinations.classes[active]?.inauspicious === true) kinds.push('afflicted');
  return { afflicted: kinds.length > 0, kinds, natalCompared: !!(current && natal) };
}
export function getRemedies(id, kind) {
  if (!['afflicted', 'enemy_star', 'death_star'].includes(kind)) return null;
  return getInterpretation(id)?.remedies[kind] ?? null;
}
