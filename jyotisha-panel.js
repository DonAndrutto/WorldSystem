/* The calculator's page: the form, its checks, the resolved instant and the
 * shape of the result. It uses jyotisha.js for everything it decides and
 * holds nothing it is given beyond the page it is open on: the inputs are not
 * stored and not sent anywhere.
 *
 * The form checks what it is given and resolves the local time to one UTC
 * instant; the engine, through its adapter (jyotisha-engine.js: astronomy-engine,
 * in this browser, fetched the first time a calculation is asked for), does the rest.
 * A result is shown only when the engine has produced it.
 */
import { readInput, formatOffset, YEAR_MIN, YEAR_MAX, formatLongitude, parseDate, parseOffset, localDayBounds, localClock } from './jyotisha.js';
import { createEngine, EngineError, ENGINE } from './jyotisha-engine.js';

import { PLACES } from './places-data.js';
import { searchText } from './search-text.js';
export { PLACES };

import { createInterpretation } from './interpretation-ui.js';

const pad = (n) => String(n).padStart(2, '0');
const utcText = (ms) => {
  const d = new Date(ms);
  return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + ' '
    + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + ' UTC';
};
const localText = (ms, offset) => utcText(ms + offset * 1000).replace(' UTC', '');

export function createJyotishaPanel({ doc = document, panel, provider = createEngine(), catalogueName = () => '', now = () => Date.now() }) {
  const listeners = [];
  panel.innerHTML = `
    <div class="grip"><p class="eyebrow">Indian Jyotiṣa · a separate system</p>
      <button class="x" type="button" data-jy="close" title="Close — Esc" aria-label="Close the calculator">×</button></div>
    <div class="jy-scroll scroll">
      <h2 id="jy-title">Indian Jyotiṣa calculation · Lahiri ayanamsa</h2>
      <details class="jy-info"><summary>About this calculation</summary>
        <p>The Moon’s nakṣatra in the Indian system: twenty-seven equal sectors of the sidereal zodiac, measured with the Lahiri ayanamsa from a geocentric lunar position, with its pada and Vimshottari lord.</p>
        <p>The 28 Lunar Mansions catalogue follows Tibetan sources, chiefly White Beryl, and is a separate system. A result names the corresponding catalogue entry as a cross-reference only. The Vimshottari lord is not White Beryl’s planetary ruler, and the ring in the world is not used for the calculation.</p>
        <p>The Lahiri ayanamsa is taken from its definition: 23°15′00.658″ on 21 March 1956, as adopted by the Calendar Reform Committee, carried forward by the precession of the equinoxes. Nirayana longitudes are the longitude on the true ecliptic of date less the true Lahiri ayanamsa. The tithi, yoga and karaṇa are those at local sunrise (udaya) on the date entered; the vāra runs from sunrise to sunrise. Times are the place’s local clock, to the minute.</p>
        <p>Calculated in this browser with ${ENGINE.package} ${ENGINE.version} (MIT licence); nothing entered is sent anywhere or kept.</p>
      </details>
      <form class="jy-form" novalidate>
        <fieldset><legend>When</legend>
          <button class="btn" type="button" data-jy="now">Use now</button>
          <p class="jy-hint">Uses the chosen zone or offset; if the zone is blank, uses this device’s zone.</p>
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
        <fieldset><legend>Where</legend>
          <div class="jy-place-picker">
          <label for="jy-place">City <span class="jy-hint">start typing to choose</span></label>
          <input id="jy-place" name="place" type="text" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="jy-places" aria-describedby="jy-place-hint">
          <ul id="jy-places" class="jy-places" role="listbox" aria-label="Cities" hidden></ul>
          </div>
          <button class="btn" type="button" data-jy="manual" hidden>City not listed? Enter coordinates manually</button>
          <p class="jy-hint" id="jy-place-hint">Start typing a city name, then choose a match. City centres are approximate.</p>
          <div class="jy-coordinates" hidden><p class="jy-hint jy-hint-block">Decimal degrees. North and east are positive, south and west negative.</p>
          <label for="jy-lat">Latitude</label>
          <input id="jy-lat" name="latitude" type="text" inputmode="decimal" autocomplete="off" aria-describedby="jy-latitude-err">
          <p class="jy-err" id="jy-latitude-err" hidden></p>
          <label for="jy-lon">Longitude</label>
          <input id="jy-lon" name="longitude" type="text" inputmode="decimal" autocomplete="off" aria-describedby="jy-longitude-err">
          <p class="jy-err" id="jy-longitude-err" hidden></p></div>
        </fieldset>
        <fieldset><legend>Zone</legend>
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
          <dt>Nakṣatra from</dt><dd data-out="from">—</dd>
          <dt>Nakṣatra until</dt><dd data-out="until">—</dd>
          <dt>Pada until</dt><dd data-out="padaEnd">—</dd>
        </dl>
        <h4 class="jy-sub">At sunrise on the date entered</h4>
        <dl class="jy-out jy-udaya">
          <dt>Sunrise</dt><dd data-out="sunrise">—</dd>
          <dt>Tithi</dt><dd data-out="tithi">—</dd>
          <dt>Tithi until</dt><dd data-out="tithiEnd">—</dd>
          <dt>Yoga</dt><dd data-out="yoga">—</dd>
          <dt>Karaṇa</dt><dd data-out="karana">—</dd>
          <dt>Vāra at the moment entered</dt><dd data-out="vara">—</dd>
        </dl>
        <div class="jy-interpretation"></div>
        <button class="btn" type="button" data-jy="show" disabled>Show in world</button>
      </div>
    </div>`;

  const form = panel.querySelector('.jy-form');
  const resolved = panel.querySelector('.jy-resolved');
  const choiceSet = panel.querySelector('.jy-choice');
  const showBtn = panel.querySelector('[data-jy="show"]');
  const out = (k) => panel.querySelector('[data-out="' + k + '"]');
  let resultId = null;
  let revision = 0;
  const placeList = panel.querySelector('#jy-places');
  const placeInput = form.elements.place;
  const placePicker = panel.querySelector('.jy-place-picker');
  const manualButton = panel.querySelector('[data-jy="manual"]');
  const coordinates = panel.querySelector('.jy-coordinates');
  const placeHint = panel.querySelector('#jy-place-hint');
  let suggestions = [], activePlace = -1, selectedPlace = null;
  const closePlaces = () => {
    placeList.hidden = true; placeInput.setAttribute('aria-expanded', 'false');
    placeInput.removeAttribute('aria-activedescendant'); activePlace = -1;
  };
  const choosePlace = place => {
    selectedPlace = place;
    placeInput.value = place.name;
    form.elements.latitude.value = String(place.latitude);
    form.elements.longitude.value = String(place.longitude);
    form.elements.zone.value = place.zone;
    form.elements.zoneMode.value = 'zone';
    coordinates.hidden = true; manualButton.hidden = true;
    placeHint.textContent = `${place.name} · ${place.latitude}, ${place.longitude} · ${place.zone}`;
    closePlaces(); syncMode();
    form.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
  };
  const renderPlaces = () => {
    const query = searchText(placeInput.value);
    suggestions = query ? PLACES.filter(p => searchText(p.name).includes(query)).slice(0, 12) : [];
    placeList.replaceChildren(); activePlace = -1;
    suggestions.forEach((place, i) => {
      const option = doc.createElement('li'); option.id = 'jy-city-' + i;
      option.setAttribute('role', 'option'); option.setAttribute('aria-selected', 'false');
      option.textContent = place.name; option.dataset.noLocalize = '';
      // Keep mouse focus on the combobox. Touch uses native focus/click so
      // scrolling the list is never mistaken for a selection.
      option.tabIndex = -1;
      option.addEventListener('mousedown', event => event.preventDefault());
      option.addEventListener('click', () => choosePlace(place)); placeList.append(option);
    });
    placeList.hidden = !suggestions.length;
    placeInput.setAttribute('aria-expanded', String(!!suggestions.length));
    placeInput.removeAttribute('aria-activedescendant');
    manualButton.hidden = !query || suggestions.length > 0;
    placeHint.textContent = !query ? 'Start typing a city name, then choose a match. City centres are approximate.'
      : suggestions.length ? 'Choose a city from the matches.' : 'No matching city. You can enter coordinates manually.';
  };
  placeInput.addEventListener('input', () => {
    // Editing a selected name must never reuse its old coordinates or zone.
    if (selectedPlace || !coordinates.hidden) {
      form.elements.latitude.value = ''; form.elements.longitude.value = '';
      form.elements.zone.value = ''; selectedPlace = null;
    }
    coordinates.hidden = true;
    const exact = PLACES.find(p => searchText(p.name) === searchText(placeInput.value));
    if (exact) choosePlace(exact); else renderPlaces();
  });
  placeInput.addEventListener('focus', () => { if (!selectedPlace) renderPlaces(); });
  // A tap may blur the input before the option's click. Keep the list
  // alive while focus is moving within the picker, and through touch release.
  let placePointer = null;
  placeList.addEventListener('pointerdown', event => { placePointer = event.pointerId; });
  const endPlacePointer = event => {
    if (event.pointerId !== placePointer) return;
    placePointer = null;
    // Native click follows pointerup. Delay only focus cleanup, not selection.
    doc.defaultView.setTimeout(() => {
      if (!placePicker.contains(doc.activeElement)) closePlaces();
    }, 0);
  };
  doc.addEventListener('pointerup', endPlacePointer);
  doc.addEventListener('pointercancel', endPlacePointer);
  placePicker.addEventListener('focusout', event => {
    if (placePointer === null && !placePicker.contains(event.relatedTarget)) closePlaces();
  });
  doc.addEventListener('pointerdown', event => {
    if (!placePicker.contains(event.target)) { placePointer = null; closePlaces(); }
  });
  placeInput.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closePlaces(); return; }
    if (event.key === 'Enter' && !placeList.hidden && activePlace >= 0) {
      event.preventDefault(); choosePlace(suggestions[activePlace]); return;
    }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault(); if (placeList.hidden) renderPlaces();
    if (!suggestions.length) return;
    activePlace = (activePlace + (event.key === 'ArrowDown' ? 1 : -1) + suggestions.length) % suggestions.length;
    [...placeList.children].forEach((el, i) => el.setAttribute('aria-selected', String(i === activePlace)));
    const option = placeList.children[activePlace];
    placeInput.setAttribute('aria-activedescendant', option.id); option.scrollIntoView?.({block: 'nearest'});
  });
  manualButton.addEventListener('click', () => {
    coordinates.hidden = false; closePlaces(); form.elements.latitude.focus();
  });
  // An edited form invalidates a previous (or in-flight) result immediately.
  form.addEventListener('input', (ev) => {
    if (ev.target.name === 'choice') return;
    revision++;
    clearResult();
    resolved.textContent = '';
    choiceSet.hidden = true;
    choiceSet.querySelectorAll('input').forEach((r) => { r.checked = false; });
  });

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
    if (ev.target.name !== 'choice') { revision++; clearResult(); resolved.textContent = ''; }
    // a changed reading asks the question afresh
    if (ev.target.name !== 'choice') { choiceSet.hidden = true; choiceSet.querySelectorAll('input').forEach((r) => { r.checked = false; }); }
  });

  function clearResult() {
    ['nakshatra', 'catalogue', 'pada', 'lord', 'longitude', 'from', 'until', 'padaEnd', 'sunrise', 'tithi', 'tithiEnd', 'yoga', 'karana', 'vara']
      .forEach((k) => { out(k).textContent = '—'; });
    showBtn.disabled = true;
    resultId = null;
    panel.querySelector('.jy-interpretation').replaceChildren();
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
    const requestRevision = ++revision;
    clearResult();
    if (coordinates.hidden && (!form.elements.latitude.value || !form.elements.longitude.value)) {
      placeHint.textContent = 'Choose a listed city, or search for your city to use manual coordinates if it is not listed.';
      resolved.textContent = placeHint.textContent; placeInput.focus(); return;
    }
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
    const basis = v.zone ? { zone: v.zone } : { offsetSeconds: v.offset };
    const date = parseDate(form.elements.date.value);
    const [start, end] = localDayBounds(date, basis);
    // a clock reading, with the date only when it is not the date entered
    const clock = (ms) => { const c = localClock(ms, basis); return (c.date === form.elements.date.value ? '' : c.date + ' ') + c.time; };
    const momentClock = ms => {
      if (!Number.isFinite(ms)) return null;
      const c = localClock(ms, basis);
      return `${c.date} ${c.time} (${formatOffset(c.offset)})`;
    };
    const button = form.querySelector('[type=submit]');
    button.disabled = true;
    panel.querySelector('.jy-result').setAttribute('aria-busy', 'true');
    if (!provider.ready) resolved.textContent = instant + ' Loading the calculation engine…';
    try {
      const r = await provider.calculate({ utcMs: v.utcMs, latitude: v.latitude, longitude: v.longitude, day: { date, start, end } });
      if (requestRevision !== revision) return;
      out('nakshatra').textContent = r.nakshatra;
      out('catalogue').textContent = r.catalogueId ? catalogueName(r.catalogueId) : '—';
      out('pada').textContent = String(r.pada);
      out('lord').textContent = r.vimshottariLord;
      out('longitude').textContent = formatLongitude(r.moonSiderealLongitude);
      out('from').textContent = clock(r.nakshatraStart);
      out('until').textContent = clock(r.nakshatraEnd);
      out('padaEnd').textContent = clock(r.padaEnd);
      if (r.udaya) {
        out('sunrise').textContent = clock(r.udaya.sunrise);
        out('tithi').textContent = r.udaya.tithi.paksha + ' ' + r.udaya.tithi.name;
        out('tithiEnd').textContent = clock(r.udaya.tithi.end);
        out('yoga').textContent = r.udaya.yoga.name;
        out('karana').textContent = r.udaya.karana.name;
        out('vara').textContent = r.vara.name;
      } else {
        out('sunrise').textContent = 'No sunrise at this place on this date';
      }
      resultId = r.catalogueId || null;
      showBtn.disabled = !resultId;
      const reading = createInterpretation({ doc, id: resultId, moment: {
        date: form.elements.date.value, time: form.elements.time.value,
        utcMs: v.utcMs, zoneResolved: true, vara: r.vara?.name || null, varaIndex: r.vara?.index, catalogueId: resultId,
        place: selectedPlace?.name || `${v.latitude}, ${v.longitude}`,
        zoneLabel: (v.zone ? v.zone + ' · ' : '') + formatOffset(v.offset),
        mansionFrom: momentClock(r.nakshatraStart), mansionUntil: momentClock(r.nakshatraEnd)
      } });
      if (reading) panel.querySelector('.jy-interpretation').append(reading);
      resolved.textContent = instant;
    } catch (err) {
      if (requestRevision !== revision) return;
      const why = err instanceof EngineError && err.kind === 'load'
        ? 'The calculation engine could not be loaded. Check the connection and calculate again.'
        : err instanceof EngineError
          ? 'The calculation engine did not start as expected, so nothing was calculated.'
          : 'The calculation failed. Calculate again, or check the inputs.';
      resolved.textContent = instant + ' Not calculated: ' + why;
    } finally {
      button.disabled = false;
      panel.querySelector('.jy-result').removeAttribute('aria-busy');
    }
  }
  form.addEventListener('submit', (ev) => { ev.preventDefault(); submit(); });

  panel.addEventListener('click', (ev) => {
    const t = ev.target.closest('[data-jy]');
    if (!t) return;
    if (t.dataset.jy === 'now') {
      try {
        let basis;
        if (form.elements.zoneMode.value === 'offset') {
          const parsed = parseOffset(form.elements.offset.value);
          if (parsed.error) { showErrors({ offset: parsed.error }); return; }
          basis = { offsetSeconds: parsed.seconds };
        } else {
          const zone = form.elements.zone.value.trim() || Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (!zone) throw new Error('zone unavailable');
          basis = { zone };
        }
        const clock = localClock(now(), basis);
        if (basis.zone) form.elements.zone.value = basis.zone;
        form.elements.date.value = clock.date;
        form.elements.time.value = clock.time;
        form.elements.date.dispatchEvent(new doc.defaultView.Event('input', { bubbles: true }));
        showErrors({});
      } catch { showErrors({ zone: 'Enter a valid IANA time zone before using now.' }); }
    }
    if (t.dataset.jy === 'close') listeners.forEach(([n, fn]) => n === 'close' && fn());
    if (t.dataset.jy === 'device') { form.elements.zone.value = t.dataset.zone; form.elements.zone.dispatchEvent(new doc.defaultView.Event('change', { bubbles: true })); }
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
