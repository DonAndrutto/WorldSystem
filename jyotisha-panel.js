/* The calculator's page: the form, its checks, the resolved instant and the
 * shape of the result. It uses jyotisha.js for everything it decides and
 * holds nothing it is given beyond the page it is open on: the inputs are not
 * stored and not sent anywhere.
 *
 * The calculation engine is not integrated (see jyotisha.js, PROVIDER). The
 * form still checks what it is given and resolves the local time to one UTC
 * instant — that part is this page's own and works — and then says plainly
 * that no calculation was made. The result fields stay empty.
 */
import { readInput, formatOffset, createProvider, ProviderUnavailableError, PROVIDER, YEAR_MIN, YEAR_MAX, formatLongitude } from './jyotisha.js';

const pad = (n) => String(n).padStart(2, '0');
const utcText = (ms) => {
  const d = new Date(ms);
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' '
    + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC';
};
const localText = (ms, offset) => utcText(ms + offset * 1000).replace(' UTC', '');

export function createJyotishaPanel({ doc = document, panel, provider = createProvider(), catalogueName = () => '' }) {
  const listeners = [];
  panel.innerHTML = `
    <div class="grip"><p class="eyebrow">Indian Jyotiṣa · a separate system</p>
      <button class="x" type="button" data-jy="close" title="Close — Esc" aria-label="Close the calculator">×</button></div>
    <div class="jy-scroll scroll">
      <h2 id="jy-title">Indian Jyotiṣa calculation · Lahiri ayanamsa</h2>
      <details class="jy-info"><summary>About this calculation</summary>
        <p>The Moon’s nakṣatra in the Indian system: twenty-seven equal sectors of the sidereal zodiac, measured with the Lahiri ayanamsa from a geocentric lunar position, with its pada and Vimshottari lord.</p>
        <p>The 28 Lunar Mansions catalogue follows Tibetan sources, chiefly White Beryl, and is a separate system. A result names the corresponding catalogue entry as a cross-reference only. The Vimshottari lord is not White Beryl’s planetary ruler, and the ring in the world is not used for the calculation.</p>
      </details>
      <p class="jy-provider" role="note"><b>Calculation unavailable.</b> <span>${PROVIDER.reason}</span></p>
      <form class="jy-form" novalidate>
        <fieldset><legend>Date and time</legend>
          <label for="jy-date">Date <span class="jy-hint">Gregorian calendar, ${YEAR_MIN}–${YEAR_MAX}</span></label>
          <input id="jy-date" name="date" type="date" min="${YEAR_MIN}-01-01" max="${YEAR_MAX}-12-31" required aria-describedby="jy-date-err">
          <p class="jy-err" id="jy-date-err" hidden></p>
          <label for="jy-time">Local time <span class="jy-hint">clock time at the place, to the second if known</span></label>
          <input id="jy-time" name="time" type="time" step="1" required aria-describedby="jy-time-err">
          <p class="jy-err" id="jy-time-err" hidden></p>
          <fieldset class="jy-choice" hidden><legend>This time occurs twice. Which one is meant?</legend>
            <label><input type="radio" name="choice" value="0"> <span></span></label>
            <label><input type="radio" name="choice" value="1"> <span></span></label>
          </fieldset>
        </fieldset>
        <fieldset><legend>Time zone</legend>
          <label class="jy-radio"><input type="radio" name="zoneMode" value="zone" checked> IANA time zone</label>
          <label class="jy-radio"><input type="radio" name="zoneMode" value="offset"> Explicit UTC offset</label>
          <div class="jy-zone">
            <label for="jy-zone">Zone <span class="jy-hint">for example Europe/Warsaw, Asia/Kolkata</span></label>
            <input id="jy-zone" name="zone" type="text" list="jy-zones" autocomplete="off" spellcheck="false" aria-describedby="jy-zone-err">
            <datalist id="jy-zones"></datalist>
            <button class="btn link jy-device" type="button" data-jy="device" hidden></button>
            <p class="jy-err" id="jy-zone-err" hidden></p>
          </div>
          <div class="jy-offset" hidden>
            <label for="jy-offset">Offset from UTC <span class="jy-hint">for example +05:30 or −03:00</span></label>
            <input id="jy-offset" name="offset" type="text" inputmode="text" autocomplete="off" spellcheck="false" aria-describedby="jy-offset-err">
            <p class="jy-err" id="jy-offset-err" hidden></p>
          </div>
        </fieldset>
        <fieldset><legend>Place</legend>
          <p class="jy-hint jy-hint-block">Decimal degrees. North and east are positive, south and west negative.</p>
          <label for="jy-lat">Latitude</label>
          <input id="jy-lat" name="latitude" type="text" inputmode="decimal" autocomplete="off" aria-describedby="jy-latitude-err">
          <p class="jy-err" id="jy-latitude-err" hidden></p>
          <label for="jy-lon">Longitude</label>
          <input id="jy-lon" name="longitude" type="text" inputmode="decimal" autocomplete="off" aria-describedby="jy-longitude-err">
          <p class="jy-err" id="jy-longitude-err" hidden></p>
        </fieldset>
        <button class="btn go" type="submit">Calculate</button>
      </form>
      <div class="jy-result" aria-labelledby="jy-result-head">
        <h3 id="jy-result-head">Result</h3>
        <p class="jy-resolved" role="status" aria-live="polite"></p>
        <dl class="jy-out">
          <dt>Nakṣatra</dt><dd data-out="nakshatra">—</dd>
          <dt>Tibetan catalogue entry</dt><dd data-out="catalogue">—</dd>
          <dt>Pada</dt><dd data-out="pada">—</dd>
          <dt>Vimshottari lord</dt><dd data-out="lord">—</dd>
          <dt>Moon, sidereal longitude</dt><dd data-out="longitude">—</dd>
        </dl>
        <button class="btn" type="button" data-jy="show" disabled>Show in world</button>
      </div>
    </div>`;

  const form = panel.querySelector('.jy-form');
  const resolved = panel.querySelector('.jy-resolved');
  const choiceSet = panel.querySelector('.jy-choice');
  const showBtn = panel.querySelector('[data-jy="show"]');
  const out = (k) => panel.querySelector('[data-out="' + k + '"]');
  let resultId = null;

  // the zone list, when the browser can say what it knows
  try {
    const zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];
    const list = panel.querySelector('#jy-zones');
    zones.forEach((z) => { const o = doc.createElement('option'); o.value = z; list.appendChild(o); });
  } catch {}
  // offered, never assumed: the device's own zone is one button away
  try {
    const own = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (own) {
      const b = panel.querySelector('[data-jy="device"]');
      b.hidden = false;
      b.textContent = 'Use this device’s zone: ' + own;
      b.dataset.zone = own;
    }
  } catch {}

  const syncMode = () => {
    const mode = form.elements.zoneMode.value;
    panel.querySelector('.jy-zone').hidden = mode !== 'zone';
    panel.querySelector('.jy-offset').hidden = mode !== 'offset';
  };
  form.addEventListener('change', (ev) => {
    if (ev.target.name === 'zoneMode') syncMode();
    // a changed reading asks the question afresh
    if (ev.target.name !== 'choice') { choiceSet.hidden = true; choiceSet.querySelectorAll('input').forEach((r) => { r.checked = false; }); }
  });

  function clearResult() {
    ['nakshatra', 'catalogue', 'pada', 'lord', 'longitude'].forEach((k) => { out(k).textContent = '—'; });
    showBtn.disabled = true;
    resultId = null;
  }
  function showErrors(errors) {
    for (const key of ['date', 'time', 'zone', 'offset', 'latitude', 'longitude']) {
      const p = panel.querySelector('#jy-' + key + '-err');
      const input = form.elements[key];
      p.hidden = !errors[key];
      p.textContent = errors[key] || '';
      if (input) { if (errors[key]) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    }
  }

  async function submit() {
    clearResult();
    const choice = choiceSet.hidden ? null : (form.elements.choice.value === '' ? null : Number(form.elements.choice.value));
    const read = readInput({
      date: form.elements.date.value, time: form.elements.time.value,
      latitude: form.elements.latitude.value, longitude: form.elements.longitude.value,
      zoneMode: form.elements.zoneMode.value, zone: form.elements.zone.value, offset: form.elements.offset.value,
      choice
    });
    showErrors(read.errors || {});
    if (read.needsChoice) {
      const labels = choiceSet.querySelectorAll('span');
      read.resolution.options.forEach((o, i) => {
        labels[i].textContent = (i ? 'Later: ' : 'Earlier: ') + localText(o.utcMs, o.offset) + ' at ' + formatOffset(o.offset) + ' = ' + utcText(o.utcMs);
      });
      choiceSet.hidden = false;
      resolved.textContent = 'This local time occurs twice. Choose one, then calculate again.';
      choiceSet.querySelector('input').focus();
      return;
    }
    if (!read.ok) {
      resolved.textContent = 'Please correct the fields marked.';
      const first = form.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    const v = read.value;
    const instant = 'Resolved to ' + utcText(v.utcMs) + ' (local offset ' + formatOffset(v.offset)
      + (v.zone ? ', ' + v.zone : '') + ').';
    try {
      const r = await provider.calculate({ utcMs: v.utcMs, latitude: v.latitude, longitude: v.longitude });
      out('nakshatra').textContent = r.nakshatra;
      out('catalogue').textContent = r.catalogueId ? catalogueName(r.catalogueId) : '—';
      out('pada').textContent = String(r.pada);
      out('lord').textContent = r.vimshottariLord;
      out('longitude').textContent = formatLongitude(r.moonSiderealLongitude);
      resultId = r.catalogueId || null;
      showBtn.disabled = !resultId;
      resolved.textContent = instant;
    } catch (err) {
      resolved.textContent = instant + ' ' + (err instanceof ProviderUnavailableError
        ? 'Not calculated: the calculation engine is unavailable.'
        : 'Not calculated: the calculation engine failed to start. Try again.');
    }
  }
  form.addEventListener('submit', (ev) => { ev.preventDefault(); submit(); });

  panel.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-jy]');
    if (!t) return;
    if (t.dataset.jy === 'close') listeners.forEach(([n, fn]) => n === 'close' && fn());
    if (t.dataset.jy === 'device') { form.elements.zone.value = t.dataset.zone; form.elements.zone.dispatchEvent(new Event('change', { bubbles: true })); }
    if (t.dataset.jy === 'show' && resultId) listeners.forEach(([n, fn]) => n === 'show' && fn(resultId));
  });
  syncMode();

  return {
    panel,
    on(name, fn) { listeners.push([name, fn]); },
    submit,
    get resultId() { return resultId; }
  };
}
