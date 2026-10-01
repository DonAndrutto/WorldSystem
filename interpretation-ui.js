/* Shared client-only progressive disclosure. Readings use textContent and
 * opt out of localization; chrome is authored in English for the observer.
 */
import { getInterpretation, isCompleteMoment, getMomentInterpretation, getAfflictionStatus, getRemedies } from './jyotisha-interpret.js';
let serial = 0;
const present = value => typeof value === 'string' && value.trim().length > 0;
export function createInterpretation({ doc = document, id, moment = null, natalId = null, entry = getInterpretation(id) } = {}) {
  if (!entry) return null;
  const node = (tag, text, parent, payload = false) => {
    const el = doc.createElement(tag);
    if (text !== undefined && text !== null) el.textContent = text;
    if (payload) { el.dataset.noLocalize = ''; el.lang = 'en'; }
    parent?.append(el);
    return el;
  };
  const root = node('section'); root.className = 'interpretation';
  const notice = node('p', 'Interpretation text is English; Polish translation pending.', root); notice.className = 'interpretation-language';
  const details = node('details', null, root);
  const summary = node('summary', null, details);
  node('span', 'Interpretation', summary);
  node('span', ': ' + (entry.sanskrit || entry.wylie || id) + ' — ' + (entry.source_block ? 'White Beryl · chapter 33' : 'Source text pending'), summary, true);
  const expand = node('span', 'Expand', summary); expand.className = 'interpretation-expand';
  details.addEventListener('toggle', () => { expand.textContent = details.open ? 'Collapse' : 'Expand'; });
  node('p', 'Traditional astrological descriptions from White Beryl, presented for study rather than as personal predictions.', details);
  const tabs = node('div', null, details); tabs.className = 'interpretation-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Interpretation');
  const base = 'interpretation-' + (++serial);
  const buttons = [], panels = [];
  for (const [i, name] of ['Electional', 'Natal', 'Combinations', 'Remedies'].entries()) {
    const button = node('button', name, tabs); button.type = 'button'; button.id = base + '-tab-' + i;
    button.setAttribute('role', 'tab'); button.setAttribute('aria-controls', base + '-panel-' + i);
    const panel = node('div', null, details); panel.id = base + '-panel-' + i; panel.tabIndex = 0;
    panel.setAttribute('role', 'tabpanel'); panel.setAttribute('aria-labelledby', button.id);
    buttons.push(button); panels.push(panel);
    button.addEventListener('click', () => select(i));
    button.addEventListener('keydown', event => {
      const target = event.key === 'ArrowRight' ? (i + 1) % 4 : event.key === 'ArrowLeft' ? (i + 3) % 4 : event.key === 'Home' ? 0 : event.key === 'End' ? 3 : null;
      if (target !== null) { event.preventDefault(); select(target); buttons[target].focus(); }
    });
  }
  function select(index) {
    buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; panels[i].hidden = i !== index; });
  }
  const source = (text, parent) => { if (present(text)) { const p = node('p', text, parent, true); p.className = 'interpretation-source'; } };
  if (entry.element) node('p', `Four-element classification (rgya gar): ${entry.element}. Five-element classification (nag rtsis): ${entry.nag_rtsis_element}.`, panels[0], true);
  if (entry.deity) node('p', 'Deity: ' + entry.deity, panels[0], true);
  const lists = [entry.electional.favorable, entry.electional.unfavorable].map(xs => xs.filter(present).slice(0, 7));
  if (lists.every(xs => xs.length === 0)) node('p', 'Electional readings not loaded yet.', panels[0]);
  else {
    buttons[0].title = 'Traditional readings for choosing a time for an activity';
    const columns = node('div', null, panels[0]); columns.className = 'interpretation-columns';
    lists.forEach((xs, i) => {
      if (!xs.length) return;
      const column = node('div', null, columns); node('h4', i ? '❌ Unfavorable' : '✅ Favorable', column);
      const ul = node('ul', null, column); xs.forEach(text => node('li', text, ul, true));
    });
  }
  if (present(entry.electional.notes)) node('p', entry.electional.notes, panels[0], true);
  source(entry.electional.source, panels[0]);
  const natal = entry.natal;
  const fields = [['lifespan','Lifespan'],['health','Health'],['wealth','Wealth'],['relationships','Relationships'],['mode_of_death','Mode of death'],['spiritual','Spiritual']].filter(([key]) => present(natal[key]));
  if (present(natal.character)) node('p', natal.character, panels[1], true);
  if (!present(natal.character) && !fields.length) node('p', 'Natal readings not loaded yet.', panels[1]);
  else buttons[1].title = 'Traditional readings associated with the birth mansion';
  const bullets = (xs, parent) => {
    if (!xs.length) return;
    const ul = node('ul', null, parent);
    xs.forEach(([key,label]) => node('li', label + ': ' + natal[key], ul, true));
  };
  bullets(fields.slice(0, 3), panels[1]);
  if (fields.length > 3) { const more = node('details', null, panels[1]); node('summary', 'More…', more); bullets(fields.slice(3), more); }
  source(natal.source, panels[1]);
  const reading = getMomentInterpretation(id, moment);
  if (!isCompleteMoment(moment)) node('p', 'Calculate a moment to see weekday–mansion combinations.', panels[2]);
  else if (!reading) node('p', 'A resolved sunrise-based weekday is needed for these combinations.', panels[2]);
  else {
    node('h4', reading.elemental.name, panels[2], true);
    node('p', `${reading.dayElement} weekday + ${reading.starElement} mansion · rgya gar four-element system`, panels[2], true);
    node('p', reading.elemental.text, panels[2], true);
    source('White Beryl, chapter 33, body blocks 254–256; numeric element table at block 310 checked against the verses.', panels[2]);
    node('p', 'This applies the text’s rules to the Indian calculator’s catalogue cross-reference and sunrise-based weekday. It is not a Tibetan calendar calculation.', panels[2]);
    for (const rule of reading.named) {
      node('h4', rule.name, panels[2], true); node('p', rule.text, panels[2], true);
      source(`White Beryl, chapter 33, body block ${rule.block}; tables at blocks ${rule.block >= 292 ? '323–326' : '317–320'}.`, panels[2]);
    }
    if (!reading.named.length) node('p', 'No match in the named weekday–mansion lists implemented here.', panels[2]);
    node('p', 'Different traditions can give different readings. Specific prohibitions take precedence; these are not combined into a single auspiciousness score.', panels[2]);
  }
  if (entry.element_relationships) {
    const rel = entry.element_relationships;
    const table = node('details', null, panels[2]);
    node('summary', 'Five-element relationship table (nag rtsis)', table);
    node('p', `For ${entry.nag_rtsis_element}: mother ${rel.mother}; friend ${rel.friend}; child ${rel.child}; enemy ${rel.enemy}.`, table, true);
    node('p', 'Enemy-element mansions: ' + rel.enemy_mansion_ids.map(id => getInterpretation(id).sanskrit).join(', '), table, true);
    node('p', `Cemetery-star numbers in this table: greater ${rel.cemetery_greater_number}; lesser ${rel.cemetery_lesser_number}.`, table, true);
    node('p', rel.note, table, true);
    source(`White Beryl, chapter 33, body block 260 and table at block ${rel.source_block}.`, table);
  }
  const label = node('label', null, panels[3]); label.className = 'interpretation-remedy-toggle';
  const checkbox = node('input', null, label); checkbox.type = 'checkbox'; node('span', 'Show remedies', label);
  const remedies = node('div', null, panels[3]);
  const status = getAfflictionStatus(id, { natalId, moment });
  const renderRemedies = () => {
    remedies.replaceChildren();
    const kinds = checkbox.checked ? ['afflicted','enemy_star','death_star'] : status.kinds;
    if (!status.afflicted && !checkbox.checked) { const empty = node('p', null, remedies); empty.className = 'interpretation-empty'; return; }
    if (checkbox.checked && present(entry.remedies.illness_onset)) {
      node('h4', 'Illness-onset ritual in the source', remedies);
      node('p', entry.remedies.illness_onset, remedies, true);
      source(entry.remedies.source, remedies);
    }
    if (status.afflicted) node('p', 'The weekday–mansion combination is adverse in the four-element system. The illness-onset ritual below is a separate context.', remedies);
    kinds.forEach(kind => { const text = getRemedies(id, kind); if (present(text)) node('p', text, remedies, true); });
  };
  checkbox.addEventListener('change', renderRemedies); renderRemedies();
  if (present(entry.source_tibetan)) {
    const original = node('details', null, details);
    node('summary', 'Tibetan source passage', original);
    const text = node('p', entry.source_tibetan, original); text.lang = 'bo'; text.dataset.noLocalize = ''; text.className = 'interpretation-source-text';
  }
  for (const note of entry.review_notes || []) source(note, details);
  select(0);
  return root;
}
