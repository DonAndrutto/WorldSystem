/* The 28 Lunar Mansions as a page of the interface: the layer switch, the
 * remembered selection, and the index — a list of all twenty-eight with their
 * names, forms and associations, each selectable by a native button.
 *
 * This module does not import three.js and does not wait for the drawing. The
 * index opens, reads and selects whether or not WebGL ever starts; the world
 * binds to it once it is built (bindWorld), and from then on selecting an
 * entry here also highlights and frames its glyph there. Both ways in reach
 * the same identity: an id from lunar-mansions.js, never a position.
 *
 * Remembered on this device: whether the layer is shown (off until asked
 * for) and which mansion is selected. English is restored by reloading the
 * page, so both are read back at start; Polish is applied in place and
 * leaves them untouched. Closing a panel does not clear the selection.
 */
import { MANSIONS, MANSION_BY_ID, RULERS, DIRECTIONS, CATALOGUE_SOURCE } from './lunar-mansions.js';

import { createInterpretation } from './interpretation-ui.js';

export const LAYER_KEY = 'ws-mansions';
export const SELECTED_KEY = 'ws-mansion';

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch {}
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

/* the associations, each under its own label, as the index and the entry
   both set them out — [label, html] */
export function associations(m) {
  const r = RULERS[m.ruler];
  const rows = [
    ['Form in the text', '<span>' + esc(m.form.en) + '</span>' + (m.form.source ? ' <span class="bo" lang="bo">' + m.form.source + '</span>' : '')],
    ['Stars', m.stars.readable !== null ? String(m.stars.readable) : 'Not legible in the OCR']
  ];
  if (m.stars.secondary !== null) rows.push(['Stars, secondary table', String(m.stars.secondary)]);
  rows.push(
    ['Element, four-element list', cap(m.fourElement)],
    ['Element, five-element list', cap(m.fiveElement)],
    ['Elemental direction', DIRECTIONS[m.direction].en],
    ['Planetary ruler (White Beryl)', '<span>' + r.en + '</span> <span class="wy" data-no-localize>(' + r.wylie + ')</span>'],
    ['Deity named in the passage', m.deity
      ? (m.deity.gloss ? '<span>' + esc(m.deity.gloss) + '</span> ' : '') + '<span class="wy" data-no-localize>(' + esc(m.deity.wylie) + ')</span>'
        + (m.deity.status !== 'clear' ? ' <span>' + (m.deity.status === 'damaged' ? 'damaged reading' : 'uncertain reading') + '</span>' : '')
      : 'Not preserved: the opening is lost in the OCR'],
    ['Evidence', '<span>White Beryl, lower volume</span>, <span>p. ' + m.source.page + ', line ' + m.source.line + '</span>'],
    ['Source status', m.provenance === 'secondary'
      ? 'Secondary source: the form follows the secondary Tibetan table'
      : 'Read in the White Beryl OCR']
  );
  return rows;
}
/* the notes that qualify a reading, in the order a reader needs them */
export function readingNotes(m) {
  return [m.form.note, m.deity && m.deity.note, m.readingNote].filter(Boolean);
}

function emitter() {
  const on = new Map();
  return {
    on(name, fn) { if (!on.has(name)) on.set(name, []); on.get(name).push(fn); },
    emit(name, ...args) { (on.get(name) || []).forEach((fn) => fn(...args)); }
  };
}

export function createMansionUI({ doc = document, panel, menu } = {}) {
  const events = emitter();
  let layer = read(LAYER_KEY) === '1';
  let selected = MANSION_BY_ID.has(read(SELECTED_KEY)) ? read(SELECTED_KEY) : null;
  let world = null;              // what the drawing offers, once it is built
  let open = false;

  /* ── the panel ─────────────────────────────────────────────────────────── */
  panel.innerHTML = `
    <div class="grip"><p class="eyebrow">White Beryl · Tibetan catalogue</p>
      <button class="x" type="button" data-lm="close" title="Close — Esc" aria-label="Close the mansion index">×</button></div>
    <div class="lm-scroll scroll">
      <h2 id="lm-title">28 Lunar Mansions</h2>
      <p class="lm-lede">After Desi Sangye Gyatso’s <i>White Beryl</i> (Phug tradition), read with Mipham’s separately attributed notes.</p>
      <div class="lm-acts">
        <button class="btn" type="button" data-lm="layer" aria-pressed="false">Show in the world</button>
        <button class="btn" type="button" data-lm="tour">Tour the 28</button>
        <button class="btn" type="button" data-lm="return" hidden>Return to previous view</button>
        <button class="btn" type="button" data-lm="clear" hidden>Clear selection</button>
      </div>
      <p class="lm-note">In the world the 28 stand in equal places on a ring, grouped by White Beryl’s elemental directions: six to each cardinal direction, one to each intermediate one. The arrangement is illustrative and does not show astronomical positions.</p>
      <p class="lm-note">Four forms follow a secondary source because their opening lines are lost in the supplied text. They are marked “Secondary source” here and drawn inside a dashed ring in the world.</p>
      <details class="lm-about"><summary>About the count and the sources</summary>
        <p>White Beryl gives the lunar mansions as twenty-eight. Because gro bzhin and byi bzhin share one allotment, the count is twenty-seven when the two are combined (${esc(CATALOGUE_SOURCE.count.split(':')[0])}).</p>
        <p>Forms, star counts and deities are read from each mansion’s passage in chapter 33 of the lower volume (printed pp. 313–328). The two element lists are ${esc(CATALOGUE_SOURCE.elements)}; the directions ${esc(CATALOGUE_SOURCE.directions)}; the rulers ${esc(CATALOGUE_SOURCE.rulers)}. English renderings are working translations.</p>
        <p>Mipham’s <i>Notes on Elemental Astrology, Clarifying the Essence</i> (nag rtsis brjed byang snying po gsal ba), appended to the lower volume, clarifies difficult points in the Phug-tradition White Beryl and also enumerates twenty-eight. It supplies no alternative set of forms, and is cited as his own work.</p>
        <p>Readings still awaiting the page images: the lost openings of snar ma, skag, nag pa and khrums smad. The readings of sa ga (ra mgo, goat head) and rgyal (three stars, a rounded form) are the project owner’s corrections of the OCR. The drawings are modern interpretations of the textual forms; the star nodes give counts, not positions, and no deity is portrayed.</p>
      </details>
      <p class="lm-warn" role="alert" hidden></p>
      <p class="lm-status vh" role="status" aria-live="polite"></p>
      <h3 class="lm-list-head" id="lm-list-head">The twenty-eight, in the Tibetan order</h3>
      <ol class="lm-list" aria-labelledby="lm-list-head"></ol>
      <p class="lm-calc">A separate system: <button class="btn link" type="button" data-lm="calculator">Indian Jyotiṣa calculation · Lahiri ayanamsa</button></p>
    </div>`;
  const list = panel.querySelector('.lm-list');
  const status = panel.querySelector('.lm-status');
  const wide = typeof matchMedia === 'function' && matchMedia('(min-width: 1100px)').matches;

  for (const m of MANSIONS) {
    const li = doc.createElement('li');
    li.className = 'lm-item';
    li.dataset.id = m.id;
    const secondary = m.provenance === 'secondary';
    const alias = m.aliases.length ? ' <span class="lm-alias">also ' + m.aliases.map((a) => esc(a.wylie)).join(', ') + '</span>' : '';
    li.innerHTML = `
      <h4 class="lm-h"><button type="button" class="lm-open" data-lm-open="${m.id}">
        <span class="lm-n">${m.order}</span>
        <span class="lm-names" data-no-localize><span class="bo" lang="bo">${m.tibetan}</span>
        <span class="wy">${esc(m.wylie)}</span>
        <span class="sa">${esc(m.sanskrit)}</span></span>
      </button></h4>
      <p class="lm-form">${esc(m.form.en)}${secondary ? ' <span class="lm-prov">Secondary source</span>' : ''}${alias}</p>
      <details class="lm-more"${wide ? ' open' : ''}><summary>Associations and source</summary>
        <dl>${associations(m).map(([k, v]) => '<dt>' + k + '</dt><dd>' + v + '</dd>').join('')}</dl>
        ${readingNotes(m).map((n) => '<p class="lm-reading">' + esc(n) + '</p>').join('')}
        <button class="btn" type="button" data-lm-show="${m.id}" hidden>Show in world</button>
      </details>`;
    li.append(createInterpretation({ doc, id: m.id }));
    list.appendChild(li);
  }

  const layerButtons = () => [...panel.querySelectorAll('[data-lm="layer"]'), ...(menu ? menu.querySelectorAll('[data-lm="layer"]') : [])];
  function syncButtons() {
    layerButtons().forEach((b) => b.setAttribute('aria-pressed', String(layer)));
    panel.querySelector('[data-lm="return"]').hidden = !(world && world.canReturn());
    panel.querySelector('[data-lm="clear"]').hidden = !selected;
    panel.querySelector('[data-lm="tour"]').hidden = !world;
    panel.querySelectorAll('[data-lm-show]').forEach((b) => { b.hidden = !world; });
    list.querySelectorAll('.lm-item').forEach((li) => {
      const on = li.dataset.id === selected;
      li.classList.toggle('on', on);
      const b = li.querySelector('.lm-open');
      if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
    });
  }

  /* ── state ─────────────────────────────────────────────────────────────── */
  function setLayer(on, { remember = true } = {}) {
    layer = !!on;
    if (remember) write(LAYER_KEY, layer ? '1' : '0');
    syncButtons();
    events.emit('layer', layer);
  }
  function select(id, { source = 'index', announce = true } = {}) {
    selected = id && MANSION_BY_ID.has(id) ? id : null;
    write(SELECTED_KEY, selected);
    syncButtons();
    if (announce) {
      const m = selected && MANSION_BY_ID.get(selected);
      status.textContent = m ? 'Selected: ' + m.order + ', ' + m.wylie + ', ' + m.sanskrit : 'Selection cleared';
    }
    events.emit('select', selected, source);
  }
  function setOpen(next) {
    open = !!next;
    panel.hidden = !open;
    events.emit('panel', open);
    if (open) {
      const row = selected && list.querySelector('[data-id="' + selected + '"]');
      if (row) row.scrollIntoView?.({ block: 'center' });
    }
  }

  /* ── the controls ─────────────────────────────────────────────────────── */
  const act = (ev) => {
    const t = ev.target.closest('[data-lm], [data-lm-open], [data-lm-show]');
    if (!t) return;
    if (t.dataset.lmOpen) {
      const id = t.dataset.lmOpen;
      // without the drawing an entry is read where it stands, in its row
      if (!world) {
        const more = t.closest('.lm-item').querySelector('.lm-more');
        more.open = selected !== id || !more.open;
      }
      select(id, { source: 'index' });
      return;
    }
    if (t.dataset.lmShow) { select(t.dataset.lmShow, { source: 'show' }); return; }
    const what = t.dataset.lm;
    if (what === 'layer') setLayer(!layer);
    if (what === 'index') setOpen(!open);
    if (what === 'close') setOpen(false);
    if (what === 'clear') select(null);
    if (what === 'return' && world) world.returnView();
    if (what === 'tour') events.emit('tour');
    if (what === 'calculator') events.emit('calculator');
  };
  panel.addEventListener('click', act);
  menu?.addEventListener('click', act);
  syncButtons();

  return {
    get layer() { return layer; },
    get selected() { return selected; },
    get open() { return open; },
    panel,
    on: events.on,
    setLayer, select, setOpen, sync: syncButtons,
    warn(text) { const p = panel.querySelector('.lm-warn'); p.hidden = !text; p.textContent = text || ''; },
    /* the world: { canReturn(), returnView() } */
    bindWorld(api) { world = api; syncButtons(); }
  };
}
