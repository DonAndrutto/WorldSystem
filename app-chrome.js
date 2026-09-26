/* The header and orientation screen work independently of WebGL initialization. */
(() => {
  const locale = window.WorldSystemLocale;
  const translations = {
    'Donate': 'Wesprzyj', 'Donate to Dharma translation projects (opens a new tab)': 'Wesprzyj tłumaczenia Dharmy (otwiera nową kartę)',
    'Help': 'Pomoc', 'Help with the controls': 'Objaśnienia przycisków', 'Close help': 'Zamknij pomoc',
    'Help, language and support': 'Pomoc, język i wsparcie',
    'Four ways to explore': 'Cztery sposoby poznawania', 'One world, four ways in.': 'Jeden świat, cztery ścieżki.',
    'Explore the world system, offer a mandala, follow the game of rebirth, or study the wheel of life.': 'Poznaj system świata, ofiaruj mandalę, zagraj w grę odrodzeń lub zgłębiaj koło życia.',
    'Worlds & realms': 'Światy i sfery', 'The 37 offerings': '37 ofiar', 'Paths of rebirth': 'Drogi odrodzeń', 'The cycle of life': 'Cykl życia',
    'Preparing the world…': 'Przygotowywanie świata…', 'Choose a mode, or begin in Explorer.': 'Wybierz tryb lub rozpocznij od Eksploratora.',
    'Continue': 'Kontynuuj', 'Loading is taking longer than usual. You can wait or reload.': 'Ładowanie trwa dłużej niż zwykle. Możesz poczekać lub odświeżyć stronę.',
    'The world could not open. Please reload to try again.': 'Nie udało się otworzyć świata. Odśwież stronę, aby spróbować ponownie.',
    'Start a guided tour': 'Rozpocznij zwiedzanie', 'Meet the four modes': 'Poznaj cztery tryby',
    'Your controls': 'Twoje przyciski', 'Explore at your own pace.': 'Poznawaj we własnym tempie.',
    'Choose Explorer, Mandala, Game or Wheel from the mode menu.': 'W menu trybu wybierz Eksplorator, Mandalę, Grę lub Koło.',
    'Find a place or an idea, then open its explanation and sources.': 'Znajdź miejsce lub pojęcie i otwórz jego objaśnienie oraz źródła.',
    'Set motion, night colours, sound or full screen. Reset view returns to an overview.': 'Włącz ruch, nocne kolory, dźwięk lub pełny ekran. Reset widoku przywraca widok ogólny.',
    'Switch the interface between English and Polish. Tibetan names have their own switch in Options.': 'Przełącz interfejs między angielskim i polskim. Nazwy tybetańskie mają osobny przełącznik w Opcjach.',
    'Support Dharma translation projects through PayPal. Opens a separate tab.': 'Wesprzyj tłumaczenia Dharmy przez PayPal. Otwiera osobną kartę.',
    'Look around': 'Rozejrzyj się', 'Drag with a mouse to orbit; scroll to zoom. On a phone, one finger pans and two fingers turn and zoom. Tap a place to read about it.': 'Przeciągnij myszą, aby obrócić widok; przewijaj, aby przybliżać. Na telefonie jeden palec przesuwa widok, a dwa obracają i przybliżają. Dotknij miejsca, aby o nim przeczytać.',
    'Play & numbers': 'Odtwarzanie i numery', 'Play follows the recitation one offering at a time. Numbers hides or shows the heap labels, even while playing. The study tour has separate presentation playback.': 'Odtwarzanie prowadzi przez recytację, ofiara po ofierze. Numery włącza lub ukrywa oznaczenia kopców także podczas odtwarzania. Zwiedzanie ma osobny tryb prezentacji.',
    'Throw & explore': 'Rzucaj i poznawaj', 'Throw advances the current player. Select a square to read it; Show in world visits its location. The tour explains the board without taking a turn.': 'Rzut przesuwa bieżącego gracza. Wybierz pole, aby je poznać; Pokaż w świecie przenosi do jego miejsca. Zwiedzanie objaśnia planszę bez wykonywania ruchu.',
    'Zoom & discover': 'Przybliżaj i odkrywaj', 'Drag to tilt the wall; scroll to zoom, and once close, drag to move across it. On a phone, one finger tilts the wall and two fingers move and zoom it. Tap a part to read its meaning. The tour guides you through the wheel.': 'Przeciągnij, aby przechylić ścianę; przewijaj, aby ją przybliżyć, a z bliska przeciągaj, aby się po niej poruszać. Na telefonie jeden palec przechyla ścianę, a dwa przesuwają ją i przybliżają. Dotknij dowolnej części, aby poznać jej znaczenie. Zwiedzanie prowadzi przez koło.',
    'Keyboard: E Explorer · M Mandala · G Game · L Wheel · I Index · ? Help. + and − zoom, the arrows turn the view. Escape closes the current panel.': 'Klawiatura: E Eksplorator · M Mandala · G Gra · L Koło · I Indeks · ? Pomoc. + i − przybliżają i oddalają, strzałki obracają widok. Escape zamyka bieżący panel.',
    'Pinch over a reading panel to enlarge text. Scene gestures control the drawing.': 'Uszczypnij nad panelem tekstowym, aby powiększyć tekst. Gesty nad sceną sterują rysunkiem.',
    'Text size': 'Rozmiar tekstu', 'Smaller text': 'Mniejszy tekst', 'Larger text': 'Większy tekst',
    'Make the writing in every panel and window smaller or larger with the two magnifiers in the header. The choice is kept on this device.': 'Pomniejsz lub powiększ tekst we wszystkich panelach i oknach dwiema lupami w nagłówku. Wybór zostaje zapamiętany na tym urządzeniu.'
  };
  locale?.add(translations);
  // A magnifying glass with a minus or a plus in its lens.
  const magnifier = plus => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.4 15.4 5.1 5.1M7.8 10.5h5.4${plus ? 'M10.5 7.8v5.4' : ''}"/></svg>`;
  const header = document.createElement('nav');
  header.className = 'app-header card';
  header.setAttribute('aria-label', 'Help, language and support');
  header.innerHTML = `<div class="app-brand" aria-label="The World System"><span>World</span><span>System</span></div>
    <a class="btn app-donate" href="https://www.paypal.com/donate/?business=JZS5LVZKPPY5J&amp;no_recurring=0&amp;item_name=Help+fund+Dharma+translation+projects.&amp;currency_code=USD" target="_blank" rel="noopener noreferrer" aria-label="Donate to Dharma translation projects (opens a new tab)">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg><span>Donate</span>
    </a>
    <div class="app-text-size" role="group" aria-label="Text size">
      <button class="btn" type="button" data-text-size="-1" aria-label="Smaller text" title="Smaller text">${magnifier(false)}</button>
      <button class="btn" type="button" data-text-size="1" aria-label="Larger text" title="Larger text">${magnifier(true)}</button>
    </div>
    <details class="app-language"><summary class="btn" aria-label="Interface language"><span aria-hidden="true">文</span><span data-language-label data-no-localize>EN</span><span aria-hidden="true">▾</span></summary>
      <div class="app-language-menu card" role="group" aria-label="Interface language">
        <button class="btn" type="button" data-ui-lang="en" lang="en" data-no-localize aria-pressed="true">English</button>
        <button class="btn" type="button" data-ui-lang="pl" lang="pl" data-no-localize aria-pressed="false">Polski</button>
      </div>
    </details>
    <button class="btn" type="button" data-help-open aria-label="Help with the controls" aria-haspopup="dialog" aria-controls="app-help"><span class="app-help-symbol" aria-hidden="true">?</span><span class="app-help-label">Help</span></button>`;
  document.querySelector('.overlay').append(header);
  const measureHeader = () => {
    const clearance = Math.ceil(header.getBoundingClientRect().bottom + 10) + 'px';
    if (document.documentElement.style.getPropertyValue('--header-clearance') === clearance) return;
    document.documentElement.style.setProperty('--header-clearance', clearance);
    window.dispatchEvent(new CustomEvent('ws-layout-change'));
  };
  new ResizeObserver(measureHeader).observe(header);
  window.addEventListener('resize', measureHeader);
  measureHeader();

  const help = document.createElement('dialog');
  help.id = 'app-help'; help.className = 'app-help';
  help.setAttribute('aria-labelledby', 'help-title');
  help.innerHTML = `<div class="app-help-head"><div><div class="help-eyebrow">Your controls</div><h2 id="help-title">Explore at your own pace.</h2></div><button class="btn help-close" type="button" aria-label="Close help" autofocus>×</button></div>
    <dl class="help-controls"></dl>
    <div class="help-actions"><button class="btn" type="button" data-help-tour>Start a guided tour</button><button class="btn" type="button" data-help-intro>Meet the four modes</button></div>
    <p class="help-shortcuts">Keyboard: E Explorer · M Mandala · G Game · L Wheel · I Index · ? Help. + and − zoom, the arrows turn the view. Escape closes the current panel.</p>
    <p class="help-shortcuts">Pinch over a reading panel to enlarge text. Scene gestures control the drawing.</p>`;
  document.body.append(help);
  const intro = document.createElement('dialog');
  intro.className = 'app-intro'; intro.setAttribute('aria-labelledby', 'intro-title');
  intro.innerHTML = `<div class="intro-emblem" aria-hidden="true">✦</div><div class="help-eyebrow">Four ways to explore</div><h1 id="intro-title">One world, four ways in.</h1>
    <p class="intro-description">Explore the world system, offer a mandala, follow the game of rebirth, or study the wheel of life.</p>
    <div class="intro-modes">
      ${[['explore','✦','Explorer','Worlds & realms'],['mandala','◎','Mandala','The 37 offerings'],['game','☸','Game','Paths of rebirth'],['wheel','❂','Wheel','The cycle of life']].map(([id, icon, name, copy]) => `<button class="intro-mode" type="button" data-intro-mode="${id}" disabled><span aria-hidden="true">${icon}</span><strong>${name}</strong><small>${copy}</small></button>`).join('')}
    </div><span class="intro-loading" aria-hidden="true"></span><p class="intro-status" role="status" aria-live="polite">Preparing the world…</p>
    <button class="btn intro-skip" type="button" disabled>Continue</button><button class="btn intro-skip" data-intro-reload type="button" hidden>Reload</button>`;
  document.body.append(intro);
  // A tour is also one tap away in the mode menu, with a label rather than an icon.
  const tour = document.createElement('button');
  tour.className = 'btn'; tour.type = 'button'; tour.dataset.startTour = '';
  tour.textContent = 'Start a guided tour';
  document.querySelector('[data-menu="mode"] .menu-body').append(tour);
  const language = header.querySelector('.app-language');
  const syncLanguage = () => { header.querySelector('[data-language-label]').textContent = locale?.language === 'pl' ? 'PL' : 'EN'; };
  header.addEventListener('click', event => {
    const choice = event.target.closest('[data-ui-lang]');
    if (choice) { locale?.setLanguage(choice.dataset.uiLang); language.open = false; language.querySelector('summary').focus(); syncLanguage(); }
  });
  document.addEventListener('pointerdown', event => { if (!language.contains(event.target)) language.open = false; });
  // One menu open at a time, however it was opened: a pointer outside already
  // closes the others, but the keyboard opened one over another.
  document.addEventListener('toggle', event => {
    const menu = event.target;
    if (!menu.open || !(menu instanceof HTMLDetailsElement)) return;
    if (menu === language) document.querySelectorAll('.controls details[open], .bv-tools[open], .bv-options[open]').forEach(other => { other.open = false; });
    else if (menu.matches('.controls details, .bv-tools, .bv-options')) language.open = false;
  }, true);
  window.addEventListener('ws-language-change', syncLanguage);
  syncLanguage();

  /* ── text size ────────────────────────────────────────────────────────
     One setting for the writing in every panel and window: the entries, the
     index, the tours, the game's cards and dialogs, help and the welcome.
     It is applied as a zoom on each window's contents rather than on the
     window, so a larger size rewraps inside the same frame instead of
     pushing the frame off the screen. The drawing is left as it is. */
  const TEXT_SIZES = [0.85, 1, 1.15, 1.3, 1.5, 1.75];
  const sizeButtons = [...header.querySelectorAll('[data-text-size]')];
  let textSize = 1;
  try { textSize = Number(localStorage.getItem('ws-text-size')) || 1; } catch {}
  if (!TEXT_SIZES.includes(textSize)) textSize = 1;
  const applyTextSize = (remember = false) => {
    document.documentElement.style.setProperty('--text-zoom', String(textSize));
    document.documentElement.dataset.textSize = String(Math.round(textSize * 100));
    const at = TEXT_SIZES.indexOf(textSize);
    sizeButtons[0].disabled = at <= 0;
    sizeButtons[1].disabled = at >= TEXT_SIZES.length - 1;
    const percent = Math.round(textSize * 100) + '%';
    sizeButtons.forEach(button => { button.dataset.size = percent; });
    if (remember) { try { localStorage.setItem('ws-text-size', String(textSize)); } catch {} }
    window.dispatchEvent(new CustomEvent('ws-text-size-change', { detail: { size: textSize } }));
  };
  header.querySelector('.app-text-size').addEventListener('click', event => {
    const button = event.target.closest('[data-text-size]');
    if (!button) return;
    const at = TEXT_SIZES.indexOf(textSize) + Number(button.dataset.textSize);
    if (at < 0 || at >= TEXT_SIZES.length) return;
    textSize = TEXT_SIZES[at];
    applyTextSize(true);
  });
  applyTextSize();

  const currentMode = () => document.querySelector('[data-mode][aria-pressed="true"]')?.dataset.mode || 'explore';
  const modeHelp = {
    explore: ['✦', 'Look around', 'Drag with a mouse to orbit; scroll to zoom. On a phone, one finger pans and two fingers turn and zoom. Tap a place to read about it.'],
    mandala: ['◎', 'Play & numbers', 'Play follows the recitation one offering at a time. Numbers hides or shows the heap labels, even while playing. The study tour has separate presentation playback.'],
    game: ['☸', 'Throw & explore', 'Throw advances the current player. Select a square to read it; Show in world visits its location. The tour explains the board without taking a turn.'],
    wheel: ['❂', 'Zoom & discover', 'Drag to tilt the wall; scroll to zoom, and once close, drag to move across it. On a phone, one finger tilts the wall and two fingers move and zoom it. Tap a part to read its meaning. The tour guides you through the wheel.']
  };
  let previousFocus = null;
  const openHelp = () => {
    if (help.open || intro.open) return;
    previousFocus = document.activeElement;
    document.querySelectorAll('.controls details, .app-language').forEach(menu => { menu.open = false; });
    const rows = [modeHelp[currentMode()],
      ['☰', 'Index', 'Find a place or an idea, then open its explanation and sources.'],
      ['✦', 'View', 'Choose Explorer, Mandala, Game or Wheel from the mode menu.'],
      ['⚙', 'Options', 'Set motion, night colours, sound or full screen. Reset view returns to an overview.'],
      ['⊕', 'Text size', 'Make the writing in every panel and window smaller or larger with the two magnifiers in the header. The choice is kept on this device.'],
      ['文', 'Language', 'Switch the interface between English and Polish. Tibetan names have their own switch in Options.'],
      ['♡', 'Donate', 'Support Dharma translation projects through PayPal. Opens a separate tab.']];
    const list = help.querySelector('.help-controls'); list.replaceChildren();
    for (const [symbol, title, copy] of rows) {
      const row = document.createElement('div'); row.className = 'help-control';
      const icon = document.createElement('span'); icon.textContent = symbol; icon.setAttribute('aria-hidden', 'true');
      const content = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = title;
      const dd = document.createElement('dd'); dd.textContent = copy;
      content.append(dt, dd); row.append(icon, content); list.append(row);
    }
    // Do not let a presentation advance behind its guide.
    window.WorldSystemTours?.pause();
    window.dispatchEvent(new CustomEvent('ws-help-open'));
    help.showModal(); help.scrollTop = 0;
  };
  header.querySelector('[data-help-open]').addEventListener('click', openHelp);
  help.querySelector('.help-close').addEventListener('click', () => help.close());
  help.addEventListener('close', () => previousFocus?.focus());
  help.addEventListener('click', event => { if (event.target === help) {
    const r = help.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) help.close();
  }});
  const startTour = () => {
    help.close(); document.querySelector('[data-menu="mode"]').open = false;
    document.dispatchEvent(new CustomEvent('ws-start-tour'));
  };
  tour.addEventListener('click', startTour);
  help.querySelector('[data-help-tour]').addEventListener('click', startTour);

  let ready = Boolean(window.WorldSystemReady), replay = false, dismissTimer;
  const began = performance.now();
  const dismissIntro = () => { clearTimeout(dismissTimer); intro.close(); };
  const finishLoading = () => {
    ready = true; clearTimeout(slowTimer);
    intro.querySelectorAll('[disabled]').forEach(el => { el.disabled = false; });
    intro.querySelector('.intro-loading').hidden = true;
    intro.querySelector('[data-intro-reload]').hidden = true;
    intro.querySelector('.intro-status').textContent = 'Choose a mode, or begin in Explorer.';
    if (!replay) dismissTimer = setTimeout(dismissIntro, Math.max(0, 2200 - (performance.now() - began)));
  };
  const failure = () => {
    if (ready) return;
    clearTimeout(slowTimer);
    intro.querySelector('.intro-loading').hidden = true;
    intro.querySelector('.intro-status').textContent = 'The world could not open. Please reload to try again.';
    const reload = intro.querySelector('[data-intro-reload]');
    reload.hidden = false; reload.disabled = false;
  };
  const slowTimer = setTimeout(() => {
    if (ready) return;
    intro.querySelector('.intro-status').textContent = 'Loading is taking longer than usual. You can wait or reload.';
    const reload = intro.querySelector('[data-intro-reload]');
    reload.hidden = false; reload.disabled = false;
  }, 15000);
  intro.querySelector('.intro-skip').addEventListener('click', dismissIntro);
  intro.querySelector('[data-intro-reload]').addEventListener('click', () => location.reload());
  intro.addEventListener('click', event => {
    const choice = event.target.closest('[data-intro-mode]');
    if (!choice || !ready) return;
    dismissIntro(); document.querySelector(`[data-mode="${choice.dataset.introMode}"]`).click();
  });
  // Give readers control if they start exploring the introduction themselves.
  intro.addEventListener('pointerdown', () => { replay = true; clearTimeout(dismissTimer); });
  intro.addEventListener('keydown', () => { replay = true; clearTimeout(dismissTimer); });
  intro.addEventListener('cancel', event => { if (!ready) event.preventDefault(); });
  help.querySelector('[data-help-intro]').addEventListener('click', () => {
    help.close(); replay = true; intro.showModal();
  });
  window.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (help.open || intro.open) {
      // Native dialog keeps Tab and Escape; global scene shortcuts stay asleep.
      event.stopImmediatePropagation(); return;
    }
    if (event.key === 'Escape' && language.open) { language.open = false; language.querySelector('summary').focus(); event.preventDefault(); return; }
    if (event.key === '?' && !event.target.closest('input, textarea, select, [contenteditable="true"]')) { event.preventDefault(); openHelp(); }
  }, true);
  window.addEventListener('ws-app-ready', finishLoading, {once: true});
  window.addEventListener('ws-app-error', failure, {once: true});
  window.addEventListener('error', failure);
  window.addEventListener('unhandledrejection', failure);
  locale?.apply();
  intro.showModal();
  if (ready) finishLoading();
})();
