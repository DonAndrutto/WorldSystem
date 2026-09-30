/* Puts the two lunar pages on the page: the index of the 28 Lunar Mansions
 * (mansion-ui.js, the Tibetan catalogue) and the Indian Jyotiṣa calculator
 * (jyotisha-panel.js). They share the panel dock with the rest of the page
 * and, like every panel there, only one is open at a time.
 *
 * Loaded as its own module ahead of the page's main script, and needing no
 * WebGL: if the drawing never starts, both pages still open, read and
 * validate, and this module keeps the dock itself. Once the world is built
 * the main script takes the dock over (adopt) and binds its scene.
 */
import { createMansionUI } from './mansion-ui.js';
import { createJyotishaPanel } from './jyotisha-panel.js';
import { MANSION_BY_ID } from './lunar-mansions.js';

const dock = document.querySelector('.panel-dock');
export const mansionUI = createMansionUI({
  panel: document.querySelector('.lm-panel'),
  menu: document.querySelector('[data-menu="options"] .menu-body')
});
export const calculator = createJyotishaPanel({
  panel: document.querySelector('.jy-panel'),
  catalogueName: (id) => {
    const m = MANSION_BY_ID.get(id);
    return m ? m.wylie + ' (' + m.tibetan + '), no. ' + m.order + ' in the White Beryl catalogue' : '—';
  }
});

let adopted = null;          // the main script's { sync, beforeOpen }, once it has them
const syncDock = () => {
  if (adopted) { adopted.sync(); return; }
  const other = [...dock.children].some((el) => !el.hidden && !el.classList.contains('art-status'));
  dock.hidden = !other;
};
export function openCalculator(on = true) {
  if (on) { adopted?.beforeOpen(); mansionUI.setOpen(false); }
  calculator.panel.hidden = !on;
  syncDock();
  if (on) calculator.panel.querySelector('h2').scrollIntoView?.({ block: 'nearest' });
}
mansionUI.on('panel', (open) => {
  if (open) { calculator.panel.hidden = true; adopted?.beforeOpen(); }
  syncDock();
});
const requestCalculator = () => {
  if (adopted) document.dispatchEvent(new CustomEvent('ws-astrology-open'));
  else openCalculator(true);
};
mansionUI.on('calculator', requestCalculator);
calculator.on('close', () => openCalculator(false));
document.querySelector('[data-act="jyotisha"]')?.addEventListener('click', requestCalculator);
calculator.on('show', (id) => {
  // the calculator's link into the catalogue: by id, never by ring position
  mansionUI.select(id, { source: 'show' });
});

/* the main script, once the world stands: it owns the dock from then on */
export function adopt(api) { adopted = api; }
export const lunarPanelsOpen = () => !mansionUI.panel.hidden || !calculator.panel.hidden;
export function closeLunarPanels() {
  mansionUI.setOpen(false);
  calculator.panel.hidden = true;
  syncDock();
}
