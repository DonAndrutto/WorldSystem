/* Shared client-only progressive disclosure. Readings use textContent and
 * opt out of localization; chrome is authored in English for the observer.
 */
import { getInterpretation, getMomentInterpretation, getRemedies } from './jyotisha-interpret.js';
let serial = 0;
const present = value => typeof value === 'string' && value.trim().length > 0;
export function createInterpretation({ doc = document, id, moment = null, entry = getInterpretation(id) } = {}) {
  if (!entry) return null;
  const node = (tag, text, parent, payload = false) => {
    const el = doc.createElement(tag);
    if (text !== undefined && text !== null) el.textContent = text;
    if (payload) { el.dataset.noLocalize = ''; el.lang = 'en'; }
    parent?.append(el);
    return el;
  };
  const root = node('section'); root.className = 'interpretation';
  const details = node('details', null, root);
  const summary = node('summary', null, details);
  node('span', 'Interpretation', summary);
  const name = entry.sanskrit || entry.wylie || id;
  node('span', ': ' + name, summary, true);
  const expand = node('span', 'Expand', summary); expand.className = 'interpretation-expand';
  details.addEventListener('toggle', () => { expand.textContent = details.open ? 'Collapse' : 'Expand'; });
  const dated = !!(moment?.date && moment?.time && moment?.zoneResolved && Number.isFinite(moment?.utcMs)
    && (!moment.catalogueId || moment.catalogueId === id));
  const context = node('div', null, details); context.className = 'interpretation-context';
  node('strong', dated ? `For ${moment.date} at ${moment.time}` : 'When the Moon occupies ' + name, context, true);
  if (dated) {
    node('p', [moment.place, moment.zoneLabel].filter(present).join(' · '), context, true);
    node('p', 'The activity lists describe the mansion at the selected moment. They apply whenever this mansion recurs, rather than to every hour of the calendar day.', context, true);
    if (moment.mansionFrom && moment.mansionUntil) node('p', `Calculated mansion interval: ${moment.mansionFrom} → ${moment.mansionUntil}.`, context, true);
    node('p', 'Timing uses the Indian Lahiri calculation, cross-referenced to the Tibetan catalogue.', context, true);
  } else {
    node('p', 'This is a general mansion reading, not a reading for today. Calculate a date, local time and place to see which mansion is active.', context, true);
  }
  const tabs = node('div', null, details); tabs.className = 'interpretation-tabs'; tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', 'Interpretation');
  const base = 'interpretation-' + (++serial);
  const buttons = [], panels = [];
  for (const [i, name] of ['Activities', 'Birth', 'Combinations', 'Rituals'].entries()) {
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
  const citations = new Set();
  const source = text => { if (present(text)) citations.add(text); };
  node('p', 'Electional astrology means choosing a time to begin an activity. Favorable and unfavorable refer to the activities listed below. Check Combinations for the weekday’s additional influence.', panels[0], true);
  if (entry.element) node('p', `Mansion element: ${entry.element} (four-element system).`, panels[0], true);
  if (entry.deity) node('p', 'Deity: ' + entry.deity, panels[0], true);
  const lists = [entry.electional.favorable, entry.electional.unfavorable].map(xs => xs.filter(present));
  if (lists.every(xs => xs.length === 0)) node('p', 'No activity reading is available for this mansion.', panels[0]);
  else {
    buttons[0].title = 'Traditional readings for choosing a time for an activity';
    const columns = node('div', null, panels[0]); columns.className = 'interpretation-columns';
    lists.forEach((xs, i) => {
      if (!xs.length) return;
      const column = node('div', null, columns); node('h4', i ? '❌ Unfavorable' : '✅ Favorable', column);
      const ul = node('ul', null, column); xs.forEach(text => node('li', text, ul, true));
    });
  }
  source(entry.electional.notes);
  source(entry.electional.source);
  node('p', `Birth traditions for a person born while the Moon occupies ${name}. Use a birth date and time to identify the birth mansion; these descriptions do not describe the day’s activities.`, panels[1], true);
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
  if (fields.length) {
    const more = node('details', null, panels[1]); node('summary', 'Traditional life-course details', more);
    node('p', 'These inherited portraits include lifespan and health motifs. Tibetan astrology treats a life’s course as conditional on actions and circumstances, not as a fixed destiny.', more, true);
    bullets(fields, more);
  }
  source(natal.source);
  const reading = dated ? getMomentInterpretation(id, moment) : null;
  if (!dated) node('p', 'Choose a date, local time and place in the calculator. Combinations depend on both the weekday and the mansion at that moment.', panels[2], true);
  else if (!reading) node('p', 'The mansion reading is available, but no sunrise-based weekday could be resolved for this place and date.', panels[2]);
  else {
    node('p', `${moment.vara} · ${moment.date} at ${moment.time}. The weekday runs from local sunrise to the next sunrise; before dawn, the previous weekday still applies. Recalculate for another time, since either the mansion or weekday can change.`, panels[2], true);
    node('h4', reading.elemental.name, panels[2], true);
    node('p', `${reading.dayElement} weekday + ${reading.starElement} mansion · rgya gar four-element system`, panels[2], true);
    node('p', reading.elemental.text, panels[2], true);
    source('White Beryl, chapter 33, body blocks 254–256; numeric element table at block 310 checked against the verses.');
    source('These combinations apply White Beryl rules to an Indian Lahiri mansion and a sunrise-based weekday. They do not reproduce a Tibetan almanac calculation.');
    for (const rule of reading.named) {
      node('h4', rule.name, panels[2], true); node('p', rule.text, panels[2], true);
      source(rule.note);
      source(`White Beryl, chapter 33, body block ${rule.block}; tables at blocks ${rule.block >= 292 ? '323–326' : '317–320'}.`);
    }
    if (!reading.named.length) node('p', 'No match in the named weekday–mansion lists implemented here.', panels[2]);
    node('p', 'Read each combination for its named activities. A specific prohibition takes precedence over a general favorable indication.', panels[2], true);
  }
  if (entry.element_relationships) {
    const rel = entry.element_relationships;
    const table = node('details', null, panels[2]);
    node('summary', 'Five-element relationship table (nag rtsis)', table);
    node('p', `For ${entry.nag_rtsis_element}: mother ${rel.mother}; friend ${rel.friend}; child ${rel.child}; enemy ${rel.enemy}.`, table, true);
    node('p', 'Enemy-element mansions: ' + rel.enemy_mansion_ids.map(id => getInterpretation(id).sanskrit).join(', '), table, true);
    node('p', `Cemetery-star numbers in this table: greater ${rel.cemetery_greater_number}; lesser ${rel.cemetery_lesser_number}.`, table, true);
    node('p', 'Mother, child, friend and enemy name relationships between elements. This table groups mansions by element; it does not compare an individual birth chart.', table, true);
    source(rel.note);
    source(`White Beryl, chapter 33, body block 260 and table at block ${rel.source_block}.`);
  }
  const label = node('label', null, panels[3]); label.className = 'interpretation-remedy-toggle';
  const checkbox = node('input', null, label); checkbox.type = 'checkbox'; node('span', 'Show historical illness-onset ritual', label);
  const remedies = node('div', null, panels[3]);
  const renderRemedies = () => {
    remedies.replaceChildren();
    if (!checkbox.checked) { node('p', 'These rituals concern illness beginning under a mansion. They are separate from choosing a date for an activity.', remedies, true); return; }
    if (present(entry.remedies.illness_onset)) {
      node('h4', 'Illness beginning under ' + name, remedies);
      node('p', entry.remedies.illness_onset, remedies, true);
      node('p', 'Historical ritual context, not a treatment recommendation.', remedies, true);
    }

    ['afflicted','enemy_star','death_star'].forEach(kind => { const text = getRemedies(id, kind); if (present(text)) node('p', text, remedies, true); });
  };
  checkbox.addEventListener('change', renderRemedies); renderRemedies();
  const guide = node('details', null, details);
  node('summary', 'How to read this', guide);
  node('p', 'A lunar mansion is a station of the Moon in its journey around the zodiac. Activity timing, birth interpretation and illness-onset rituals answer different questions and are read separately.', guide, true);
  node('p', 'The four elements used for weekday–mansion combinations are earth, water, fire and wind. The five-element system uses wood, fire, earth, iron and water, with relationships called mother, child, friend and enemy.', guide, true);
  node('p', 'Tibetan astrology brings together Indian, Chinese and Tibetan traditions. A full almanac considers more than the mansion alone, including lunar dates and other calendar factors.', guide, true);
  node('p', 'In the activity lists, peaceful rites concern pacification, increasing rites concern prosperity and growth, magnetizing rites concern gathering favorable conditions, and forceful rites concern overcoming obstacles.', guide, true);
  const references = node('details', null, details); references.className = 'interpretation-references';
  node('summary', 'Sources and translation notes', references);
  node('p', 'White Beryl, chapter 33: selected English readings from the supplied Tibetan text. The original passage is included below. English readings are not yet translated into Polish.', references, true);
  source(entry.remedies.source);
  for (const citation of citations) node('p', citation, references, true).className = 'interpretation-source';
  for (const [title, href, description] of [
    ['Men-Tsee-Khang: Introduction to Tibetan Astro-Science', 'https://mentseekhang.org/introduction-to-tibetan-astrology/', 'Institutional background for the traditions and five-element relationships.'],
    ['Alexander Berzin: Tibetan Astro Sciences', 'https://studybuddhism.com/en/advanced-studies/history-culture/tibetan-astrology/tibetan-astro-sciences', 'Calendar-making, activity timing, lunar mansions and the conditional nature of birth readings.'],
    ['Men-Tsee-Khang: Tibetan calendars', 'https://mentseekhang.org/calendar/', 'Almanacs and calendars for consulting the Tibetan calendar directly.']
  ]) {
    const p = node('p', null, references, true);
    const link = node('a', title, p); link.href = href; link.target = '_blank'; link.rel = 'noopener noreferrer';
    node('span', ' — ' + description, p);
  }
  if (present(entry.source_tibetan)) {
    const original = node('details', null, references);
    node('summary', 'Tibetan source passage', original);
    const text = node('p', entry.source_tibetan, original); text.lang = 'bo'; text.dataset.noLocalize = ''; text.className = 'interpretation-source-text';
  }
  for (const note of entry.review_notes || []) node('p', note, references, true).className = 'interpretation-source';
  select(0);
  return root;
}
