// Run with Node and jsdom@26 installed for development.
// The language pack rewrites the page in place while the page is being built,
// so it is answerable for two things a translation table is not usually asked
// about: that it settles, and that it says of each square what that square is.
//
// It settles. The pack writes into the document the MutationObserver it is
// listening with is watching, and an entry that translates to itself — Mandala,
// Bön, Mahākāla — used to be written back anyway. `innerHTML =` replaces the
// child nodes whatever string it is handed, so that write was a mutation, the
// mutation was translated, and the page never reached its load event.
//
// It costs what the change costs. A pass that reads innerHTML off every element
// serializes the whole document once per element, and <body> here carries some
// 280 KB of module source. This checks the pack leaves scripts alone and that a
// change to one node does not re-walk the page.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const pack = fs.readFileSync(repo + 'locales/pl.js', 'utf8');
const board = JSON.parse(fs.readFileSync(repo + 'rebirth-board.js', 'utf8')
  .match(/export const BOARD = (\{[\s\S]*?\});/)[1]);

// A page with the shapes that matter: a phrase that translates to itself, one
// carrying markup, an attribute, and a script the pack must not read.
const SCRIPT_TEXT = 'const notAPhrase = "Mandala"; // ' + 'x'.repeat(4000);
const open = (lang = 'pl', body = `
    <button class="btn" data-mode="mandala" title="Night"><span class="g">◎</span><span class="t">Mandala</span></button>
    <p class="prose">The model is the work of <b>Andrzej R. Rybszleger</b>, built from the sources named below.</p>
    <p class="plain">Full verse</p>
    <ul class="idx"><li>Mount Meru</li><li>Kalpas</li></ul>
    <span data-no-localize>Day</span>
    <script>${SCRIPT_TEXT}<\/script>
  `) => {
  const dom = new JSDOM(`<!doctype html><html lang="en"><body>${body}</body></html>`,
    { runScripts: 'outside-only', url: 'https://worldsystem.test/' });
  dom.window.localStorage.setItem('ws-language', lang);
  // A pack that feeds itself never yields to a timer, so the count is capped
  // here rather than asserted on afterwards: past the cap the records are
  // dropped on the floor and the test gets its turn back to say what happened.
  let passes = 0;
  const CAP = 40;
  const Real = dom.window.MutationObserver;
  dom.window.MutationObserver = function (fn) {
    return new Real(records => { if (++passes > CAP) return; fn(records); });
  };
  dom.window.eval(pack);
  return { dom, doc: dom.window.document, win: dom.window, passes: () => passes, CAP };
};
const settle = async win => { for (let i = 0; i < 30; i++) await new Promise(r => win.setTimeout(r, 0)); };

// ── it settles ───────────────────────────────────────────────────────────────
{
  const { doc, win, passes } = open('pl');
  const label = doc.querySelector('.t');
  assert.equal(label.textContent, 'Mandala', 'Polish for Mandala is Mandala');
  await settle(win);
  const after = passes();
  assert.ok(after < 8, 'the pack stops translating once nothing changes, not after ' + after + ' passes');
  await settle(win);
  assert.equal(passes(), after, 'and stays stopped with the page untouched');
}

// ── an entry that translates to itself is never written back ─────────────────
{
  const { doc, win, passes } = open('pl');
  await settle(win);
  const label = doc.querySelector('.t');
  const before = label.firstChild;
  const at = passes();
  doc.querySelector('.idx').append(doc.createElement('li'));   // one unrelated change
  await settle(win);
  assert.equal(label.firstChild, before, 'the identical phrase keeps its own text node');
  assert.ok(passes() - at <= 2, 'one change costs one pass, not a cascade');
}

// ── the page is translated, scripts and opted-out subtrees are not ───────────
{
  const { doc, win } = open('pl');
  await settle(win);
  assert.equal(doc.documentElement.lang, 'pl');
  assert.equal(doc.querySelector('.plain').textContent, 'Pełna strofa', 'plain text');
  assert.equal(doc.querySelector('[data-mode="mandala"]').getAttribute('title'), 'Noc', 'attributes');
  assert.match(doc.querySelector('.prose').innerHTML, /^Autorem modelu.*<b>Andrzej R\. Rybszleger<\/b>/,
    'a phrase carrying markup keeps its markup');
  assert.equal(doc.querySelector('.idx li').textContent, 'Góra Meru', 'entries added to the page');
  assert.equal(doc.querySelector('[data-no-localize]').textContent, 'Day', 'an opted-out subtree is left alone');
  assert.equal(doc.querySelector('script').textContent, SCRIPT_TEXT, 'and so is script source');
}

// ── English is left as it is ─────────────────────────────────────────────────
{
  const { doc, win, passes } = open('en');
  await settle(win);
  assert.equal(doc.querySelector('.plain').textContent, 'Full verse', 'nothing is translated');
  assert.equal(doc.documentElement.lang, 'en');
  assert.ok(passes() < 4, 'and the observer does no work');
}

// ── chrome authors English; only the locale observer turns it into Polish ────
for (const lang of ['en', 'pl']) {
  const { doc, win } = open(lang,
    '<div class="overlay"><details data-menu="mode"><div class="menu-body"></div></details></div>');
  try {
    // jsdom has no layout or native modal methods; no scene/WebGL is needed.
    win.ResizeObserver = class { observe() {} };
    win.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    win.HTMLDialogElement.prototype.close = function () {
      this.open = false;
      this.dispatchEvent(new win.Event('close'));
    };
    const setTimeout = win.setTimeout.bind(win);
    let slowLoading;
    win.setTimeout = (callback, delay, ...args) => {
      if (delay === 15000) { slowLoading = callback; return 0; }
      return setTimeout(callback, delay, ...args);
    };
    win.eval(fs.readFileSync(repo + 'app-chrome.js', 'utf8'));
    await settle(win);
    const expected = (en, pl) => lang === 'pl' ? pl : en;
    const status = () => doc.querySelector('.intro-status').textContent;
    assert.equal(status(), expected('Preparing the world…', 'Przygotowywanie świata…'));
    assert.equal(doc.querySelector('.app-header').getAttribute('aria-label'),
      expected('Help, language and support', 'Pomoc, język i wsparcie'));
    assert.equal(doc.querySelector('.app-donate span').textContent, expected('Donate', 'Wesprzyj'));
    assert.equal(doc.querySelector('.app-help-label').textContent, expected('Help', 'Pomoc'));
    assert.equal(doc.querySelector('[data-language-label]').textContent, lang.toUpperCase());

    slowLoading();
    await settle(win);
    assert.equal(status(), expected('Loading is taking longer than usual. You can wait or reload.',
      'Ładowanie trwa dłużej niż zwykle. Możesz poczekać lub odświeżyć stronę.'));
    win.dispatchEvent(new win.CustomEvent('ws-app-error'));
    await settle(win);
    assert.equal(status(), expected('The world could not open. Please reload to try again.',
      'Nie udało się otworzyć świata. Odśwież stronę, aby spróbować ponownie.'));
    win.dispatchEvent(new win.CustomEvent('ws-app-ready'));
    await settle(win);
    assert.equal(status(), expected('Choose a mode, or begin in Explorer.',
      'Wybierz tryb lub rozpocznij od Eksploratora.'));

    doc.querySelector('.intro-skip').click();
    doc.querySelector('[data-help-open]').click();
    await settle(win);
    assert.ok(doc.querySelector('#app-help').open, 'Help opens after dismissing the intro');
    const titles = [...doc.querySelectorAll('.help-controls dt')].map(el => el.textContent);
    const copies = [...doc.querySelectorAll('.help-controls dd')].map(el => el.textContent);
    assert.equal(titles[0], expected('Look around', 'Rozejrzyj się'));
    assert.equal(titles[1], expected('Index', 'Indeks'));
    assert.equal(copies[0], expected(
      'Drag with a mouse to orbit; scroll to zoom. On a phone, one finger pans and two fingers turn and zoom. Tap a place to read about it.',
      'Przeciągnij myszą, aby obrócić widok; przewijaj, aby przybliżać. Na telefonie jeden palec przesuwa widok, a dwa obracają i przybliżają. Dotknij miejsca, aby o nim przeczytać.'));
    assert.equal(copies[1], expected('Find a place or an idea, then open its explanation and sources.',
      'Znajdź miejsce lub pojęcie i otwórz jego objaśnienie oraz źródła.'));
  } finally {
    win.close();
  }
}

// ── translating twice changes nothing ────────────────────────────────────────
{
  const { doc, win } = open('pl');
  await settle(win);
  const once = doc.body.innerHTML;
  win.WorldSystemLocale.apply();
  await settle(win);
  assert.equal(doc.body.innerHTML, once, 'a second pass is a no-op');
}

// ── a second pack, folded in after the page is already up ────────────────────
{
  const { doc, win } = open('pl');
  await settle(win);
  const line = doc.createElement('p');
  line.textContent = 'A phrase no pack has yet';
  doc.body.appendChild(line);
  await settle(win);
  assert.equal(line.textContent, 'A phrase no pack has yet', 'nothing to say about it yet');
  win.WorldSystemLocale.add({ 'A phrase no pack has yet': 'Zdanie, kt\u00f3rego pakiet jeszcze nie zna' });
  await settle(win);
  assert.equal(line.textContent, 'Zdanie, kt\u00f3rego pakiet jeszcze nie zna',
    'add() reaches what is already on the page');
  assert.equal(win.WorldSystemLocale.add({ 'A phrase no pack has yet': 'inne' }), 0,
    'and never overwrites a phrase the pack already holds');
}

// ── a verse arrives as one block and is matched on the <p> inside it ─────────
{
  const { doc, win } = open('pl');
  await settle(win);
  win.WorldSystemLocale.add({
    '<blockquote class="verse"><p>One line.<br>Two lines.</p></blockquote>':
      '<blockquote class="verse"><p>Pierwszy wers.<br>Drugi wers.</p></blockquote>'
  });
  const host = doc.createElement('div');
  host.innerHTML = '<blockquote class="verse"><p>One line.<br>Two lines.</p></blockquote>';
  doc.body.appendChild(host);
  await settle(win);
  assert.equal(host.querySelector('p').innerHTML, 'Pierwszy wers.<br>Drugi wers.',
    'the page only ever offers the <p>, so the <p> has to be a key too');
}

// ── a phrase broken across lines of source still matches ─────────────────────
{
  const { doc, win } = open('pl');
  await settle(win);
  const p = doc.createElement('p');
  p.innerHTML = '\n      The model is the work of <b>Andrzej R. Rybszleger</b>, built from\n'
    + '      the sources named below.\n    ';
  doc.body.appendChild(p);
  const plain = doc.createElement('p');
  plain.textContent = '\n   Full verse\n  ';
  doc.body.appendChild(plain);
  await settle(win);
  assert.match(p.innerHTML, /^\s*Autorem modelu.*<b>Andrzej R\. Rybszleger<\/b>/,
    'markup, collapsed');
  assert.equal(plain.textContent, '\n   Pe\u0142na strofa\n  ', 'text, collapsed, margins kept');
}

// ── the table ────────────────────────────────────────────────────────────────
{
  const { win } = open('pl');
  const T = win.WorldSystemLocale.translations;
  const has = k => Object.prototype.hasOwnProperty.call(T, k);

  // No square may wear another square's name. This is what went wrong: the
  // values ran on past their keys, and every square from 57 up was labelled
  // with the name of a square seven places along.
  const names = new Map(board.squares.map(s => [s.name, s.n]));
  const polish = new Map();
  for (const square of board.squares) {
    if (!has(square.name)) continue;                    // not translated yet: shown in English
    const other = polish.get(T[square.name]);
    assert.equal(other, undefined,
      'squares ' + other + ' and ' + square.n + ' both answer to "' + T[square.name] + '"');
    polish.set(T[square.name], square.n);
  }
  assert.ok(polish.size >= 56, 'the squares that are translated stay translated');

  // Nothing translates into an English phrase the table would translate again,
  // and nothing translates into another square's English name either.
  for (const [english, pl] of Object.entries(T)) {
    assert.ok(!(has(pl) && T[pl] !== pl), 'chain: "' + english + '" → "' + pl + '" → "' + T[pl] + '"');
    if (names.has(pl) && !names.has(english)) assert.fail('"' + english + '" is given the name of square ' + names.get(pl));
  }

  // The translate function itself, including the patterns behind it.
  const tr = win.WorldSystemLocale.translate;
  assert.equal(tr('Player 2'), 'Gracz 2');
  assert.equal(tr('Heap 9 of 37'), 'Kopczyk 9 z 37');
  assert.equal(tr('24 of 104'), '24 ze 104');

  // Composed captions, in the shape the page composes them. A pattern written
  // against a shape the page never emits is a pattern that never fires: the
  // board caption joins with an em dash, and the default player names carry a
  // digit that [A-Za-z ]* would not.
  assert.equal(tr('The Heavenly Highway \u2014 square 24'), 'Niebia\u0144ska Droga \u2014 pole 24',
    'the caption, and the square named in it');
  assert.equal(tr('Shambhala \u2014 square 59'), 'Shambhala \u2014 pole 59',
    'a square with no Polish name keeps the English one');
  assert.equal(tr('Player 1 wins'), 'Gracz 1 wygrywa', 'the name inside is translated too');
  assert.equal(tr('Anna wins'), 'Anna wygrywa', 'and a name the table does not know is left alone');

  // Nothing says what the player did in a tense that would have to pick a
  // gender. The die's result is a noun; a person is the subject only of a
  // present-tense verb, which does not inflect.
  assert.equal(tr('Throw for Anna'), 'Anna rzuca');
  assert.equal(tr('Continue \u2014 throw for Player 2'), 'Dalej \u2014 Gracz 2 rzuca');
  assert.equal(tr('Anna\u2019s turn'), 'Kolej: Anna');
  assert.equal(tr('Player 1 threw a 5'), 'Gracz 1 \u2014 wynik 5');
  assert.equal(tr(' threw a 5: 24 \u2192 10, Hungry Ghosts (Preta).'),
    ' \u2014 wynik 5: 24 \u2192 10, G\u0142odne duchy (prety).');
  assert.equal(tr('Anna reaches Nirvana.'), 'Anna osi\u0105ga Nirwan\u0119.');
  assert.equal(tr('Game resumed. Player 2 has the die.'), 'Gra wznowiona. Gracz 2 ma kostk\u0119.');
  assert.equal(tr('Game resumed. Anna reached Nirvana. The interrupted throw has been completed.'),
    'Gra wznowiona. Anna osi\u0105ga Nirwan\u0119. Przerwany rzut zosta\u0142 doko\u0144czony.');
  for (const s of ['Anna wins', 'Anna reaches Nirvana.', 'Kolej: Anna', 'Anna rzuca'])
    assert.doesNotMatch(tr(s), /wyrzuci[\u0142a]|osi\u0105gn[\u0105e]/, 'no past tense about a player: ' + s);

  // Polish counts in three, and 12\u201314 go with the many.
  assert.equal(tr('Anna: 1 throws, 1 journeys'), 'Anna: 1 rzut, 1 podr\u00f3\u017c');
  assert.equal(tr('Anna: 3 throws, 4 journeys'), 'Anna: 3 rzuty, 4 podr\u00f3\u017ce');
  assert.equal(tr('Anna: 7 throws, 22 journeys'), 'Anna: 7 rzut\u00f3w, 22 podr\u00f3\u017ce');
  assert.equal(tr('Anna: 13 throws, 14 journeys'), 'Anna: 13 rzut\u00f3w, 14 podr\u00f3\u017cy');
  assert.equal(tr('Player 1: 5 throws, 2 journeys \u00b7 Player 2: 1 throws, 1 journeys'),
    'Gracz 1: 5 rzut\u00f3w, 2 podr\u00f3\u017ce \u00b7 Gracz 2: 1 rzut, 1 podr\u00f3\u017c',
    'every player in the joined tally, not just the first');
  // a /g/ pattern must not carry its lastIndex into the next call
  assert.equal(tr('Anna: 3 throws, 4 journeys'), 'Anna: 3 rzuty, 4 podr\u00f3\u017ce', 'twice running');

  // The composed shapes, each matched against a whole node or attribute. A
  // menu's tooltip keeps the key that reaches it; a square keeps its number
  // and its Tibetan; the log never puts a player in the past tense.
  assert.equal(tr('Index \u2014 i'), 'Indeks \u2014 i');
  assert.equal(tr('Reset view \u2014 Esc'), 'Resetuj widok \u2014 Esc');
  assert.equal(tr('1. Mount Meru'), '1. G\u00f3ra Meru');
  assert.equal(tr('28 \u00b7 Sudar\u015bana \u00b7 lta na sdug \u00b7 The field this square is drawn as on the board of liberation'),
    '28 \u00b7 Sudar\u015bana \u00b7 lta na sdug \u00b7 Pole przedstawiaj\u0105ce to miejsce na planszy gry wyzwolenia');
  assert.equal(tr('Player 1 counts it \u2014 3 left'), 'Gracz 1 \u2014 zaliczone, zosta\u0142o 3');
  assert.equal(tr('Player 1 passes'), 'Gracz 1 \u2014 pasuje');
  assert.equal(tr('Player 1 dead at 24'), 'Gracz 1 \u2014 martwy wynik na 24');
  assert.equal(tr('Player 1 leaves 24'), 'Gracz 1 \u2014 opuszcza 24');
  assert.equal(tr('No move on a 6. The token stays.'), 'Brak ruchu przy wyniku 6. Pionek zostaje.');
  assert.equal(tr('Die 1 \u2192 27 Heaven of the Four Great Kings'),
    'Kostka 1 \u2192 27 Niebo Czterech Wielkich Kr\u00f3l\u00f3w', 'the square inside the offer, too');
  // the caption pattern is the more specific one and has to be reached first
  assert.match(tr('Mount Meru \u2014 square 12'), /^G\u00f3ra Meru \u2014 pole 12$/);

  assert.equal(tr('Player 1 on 24 The Heavenly Highway'),
    'Gracz 1 \u00b7 pole 24 \u00b7 Niebia\u0144ska Droga');
  assert.equal(tr('Player 1 \u00b7 24'), 'Gracz 1 \u00b7 24');
  assert.equal(tr('constructor'), 'constructor', 'the table is asked for its own keys only');
  assert.equal(tr('toString'), 'toString');
  for (const [english, pl] of Object.entries(T)) assert.equal(tr(pl), pl, 'already Polish: ' + english);
}

// ── the maṇḍala and the liturgy ─────────────────────────────────────
// The offering has surfaces of its own — the tour of the thirty-seven heaps,
// the gloss under each heading, the verse itself — and they were the last of
// the page still answering in English. The tour's prose is in pl-texts.js, so
// it is folded in here the way the page folds it in.
{
  const { doc, win } = open('pl');
  win.eval(fs.readFileSync(repo + 'locales/pl-texts.js', 'utf8'));
  await settle(win);
  const T = win.WorldSystemLocale.translations;
  const tr = win.WorldSystemLocale.translate;
  const has = k => Object.prototype.hasOwnProperty.call(T, k);

  // every looking prompt of the tour, one per heap
  const notes = [...fs.readFileSync(repo + 'mandala-tour.js', 'utf8')
    .matchAll(/^  '((?:[^'\\]|\\.)*)',?$/gm)].map(m => m[1].replace(/\\'/g, "'"));
  assert.equal(notes.length, 37, 'a prompt for each of the thirty-seven heaps');
  for (const note of notes) assert.ok(has(note), 'the tour says it in Polish: ' + note.slice(0, 48));

  // every line of the verse that says something. The two mantras are said as
  // they are written, and so is the phonetic Tibetan under every line.
  const page = fs.readFileSync(repo + 'index.html', 'utf8').split('\n');
  const at = needle => page.findIndex(line => line.startsWith(needle));
  const box = {};
  vm.runInContext(page.slice(at('const VERSE = ['), at('const CREDIT =')).join('\n')
    + '\nbox.VERSE = VERSE;', vm.createContext({ box }));
  assert.equal(box.VERSE.length, 27, 'the whole offering, line by line');
  for (const [, , english] of box.VERSE) {
    if (/^o\u1e43 /.test(english)) continue;              // a mantra is not translated
    assert.ok(has(english), 'the verse says it in Polish: ' + english.slice(0, 48));
  }

  // the composed shapes the offering writes: a gloss after a name that is not
  // ours to touch, the same pair whole, and a heap in the corner of an entry
  assert.equal(tr(' \u00b7 the goddess of beauty'), ' \u00b7 bogini pi\u0119kna',
    'the gloss under a heading, with the space the page puts in front of it');
  assert.equal(tr('sgeg mo ma \u00b7 the goddess of beauty'), 'sgeg mo ma \u00b7 bogini pi\u0119kna',
    'the Wylie comes back as it went in');
  assert.equal(tr('26. the goddess of beauty'), '26. bogini pi\u0119kna', 'and in the list of heaps');
  assert.equal(tr('heap 14'), 'kopczyk 14');
  assert.equal(tr('Out to 52 M\u0101h\u0101y\u0101na'), 'Out to 52 M\u0101h\u0101y\u0101na',
    'a square the table does not hold is left in English');

  /* What the board says it has done is written as one element: a bold head,
     and after it a sentence that arrives with the space between them still in
     front of it. Neither half is written with that space in the table. */
  const say = doc.createElement('p');
  say.innerHTML = '<b>A dead face.</b> Square 24 lists no move on a 3, '
    + 'so the token stays and the die passes.';
  doc.body.appendChild(say);
  await settle(win);
  assert.match(say.innerHTML, /^<b>Martwy wynik\.<\/b> Pole 24 nie ma ruchu dla wyniku 3/,
    'the head and the sentence after it, both in Polish');

  const sub = doc.createElement('p');
  sub.innerHTML = '<i>sgeg mo ma</i> \u00b7 the goddess of beauty';
  doc.body.appendChild(sub);
  await settle(win);
  assert.equal(sub.innerHTML, '<i>sgeg mo ma</i> \u00b7 bogini pi\u0119kna');
}

// \u2500\u2500 the wheel of life \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Every part of the relief the wheel entries answer for: the name, the
// eyebrow, the index tag, the Wylie/Sanskrit gloss, every row of the table,
// every paragraph and the sources. wheel-notes.js is not a module Node can
// import directly (it has no package.json marking the repo as one), so it is
// read as text and run the way build-locale.cjs already runs rebirth-board.js.
{
  const { doc, win } = open('pl');
  win.eval(fs.readFileSync(repo + 'locales/pl-texts.js', 'utf8'));
  await settle(win);
  const T = win.WorldSystemLocale.translations;
  const tr = win.WorldSystemLocale.translate;
  const has = k => Object.prototype.hasOwnProperty.call(T, k);

  const wnSource = fs.readFileSync(repo + 'wheel-notes.js', 'utf8').replace(/export const/g, 'const');
  const wnBox = {};
  vm.runInContext(wnSource + '\nbox.WHEEL_ENTRIES = WHEEL_ENTRIES; box.WHEEL_TREE = WHEEL_TREE;',
    vm.createContext({ box: wnBox }));
  const WHEEL_ENTRIES = wnBox.WHEEL_ENTRIES, WHEEL_TREE = wnBox.WHEEL_TREE;
  assert.equal(Object.keys(WHEEL_ENTRIES).length, 92, 'the ninety-two entries the wheel is written with');

  /* A stopword says a string carries real English prose rather than a bare
     Wylie transliteration, a Sanskrit or Tibetan proper name, or a citation
     that keeps a book's own title (the house style throughout the pack, e.g.
     "Kongtrul, Myriad Worlds" left as it is). Those need no entry of their
     own: the name is the same word in both languages. */
  const STOP = new Set(['the', 'and', 'of', 'in', 'with', 'by', 'at', 'on', 'a', 'an', 'to', 'for',
    'from', 'is', 'are', 'as', 'it', 'its', 'that', 'this', 'not', 'or', 'but', 'into', 'over',
    'under', 'without', 'his', 'their', 'each', 'one', 'who', 'be', 'has', 'have']);
  /* Checking a page already rendered in Polish cannot use that same list: "a"
     is also the Polish word for "and", "to" is Polish for "this", "on" is
     Polish for "he", and "by" is the Polish conditional particle. Every one
     of them turns up in ordinary Polish prose, so they would flag translated
     paragraphs as if they were still English. The rest of the list is not a
     Polish word under any spelling and keeps its meaning as a sign of it. */
  const STOP_IN_POLISH_TOO = new Set(['a', 'to', 'on', 'by']);
  const STOP_STRAY = new Set([...STOP].filter((w) => !STOP_IN_POLISH_TOO.has(w)));
  /* An italicised span is either a Wylie transliteration or a citation's own
     title, and neither is ours to translate — dropping its content, not just
     its tag, keeps a Wylie syllable that happens to spell an English article
     ("a chu zer ba") from reading as one. Diacritics are letters too:
     splitting only on [A-Za-z] would cut "triviṣa" into "tri" and "a", and
     that stray "a" would read as the article as well; \p{L} keeps such a
     word whole, so it is dropped by the ASCII filter instead. */
  const looksEnglish = (s) => (String(s).replace(/<i[^>]*>.*?<\/i>/gs, ' ').match(/\p{L}+/gu) || [])
    .filter((w) => /^[A-Za-z]+$/.test(w))
    .some((w) => STOP.has(w.toLowerCase()));
  const tagsOf = (html) => (String(html).match(/<\/?[a-z][a-z0-9]*/gi) || [])
    .map((t) => t.toLowerCase()).sort().join(',');

  const need = (s, where) => {
    if (!looksEnglish(s)) return;                    // a bare gloss: nothing here to say in Polish
    // `tr()` is what the page actually calls: a whole-string match against T,
    // or one of the composed patterns (the "· gloss" gloss-after-a-dot shape
    // among them) built from a phrase T does hold. Either counts as covered.
    const out = tr(s);
    assert.ok(out !== s, where + ' is translated: ' + JSON.stringify(String(s).slice(0, 70)));
    if (has(s)) assert.equal(tagsOf(s), tagsOf(T[s]), where + ': the markup matches its source');
  };

  /* The entry sheet never offers `en` whole: it is joined onto `tib` first
     (`bits.join(' &middot; ')` in index.html), so a leading <i>Wylie</i> only
     ever reaches the pack as the text node standing after it, not as part of
     one string with the italic. Parsing `en` the same way the page parses it
     — into a small DOM and back out through its child nodes — asks the table
     for exactly the pieces the page will ask it for, whether or not `tib` is
     there to be joined in front. */
  const needEn = (en, id) => {
    const div = doc.createElement('div');
    div.innerHTML = en;
    if (!div.querySelector('i')) { need(en, id + '.en'); return; }
    for (const node of div.childNodes) if (node.nodeType === 3) need(node.nodeValue, id + '.en (text after the Wylie)');
  };

  for (const [id, o] of Object.entries(WHEEL_ENTRIES)) {
    need(o.t, id + '.t');
    if (o.meta) need(o.meta, id + '.meta');
    if (o.k) need(o.k, id + '.k');
    if (o.en) needEn(o.en, id);
    (o.f || []).forEach(([label, value], i) => {
      need(label, id + '.f[' + i + '] (label)');
      need(value, id + '.f[' + i + '] (value)');
    });
    (o.b || []).forEach((para, i) => need(para, id + '.b[' + i + ']'));
    [].concat(o.more || []).forEach((para, i) => need(para, id + '.more[' + i + ']'));
    if (o.moreLabel) need(o.moreLabel, id + '.moreLabel');
    // A source is a citation, and a citation keeps a title in the language it
    // was published in; only that its OWN composed string is in the table is
    // asked here, not that every word inside it is Polish.
    if (o.src) assert.ok(has(o.src), id + '.src is translated');
  }

  // the index groups the wheel adds to the tree, and the tree's own name
  assert.ok(has(WHEEL_TREE[0]), 'the wheel\u2019s place in the index is named: ' + JSON.stringify(WHEEL_TREE[0]));
  for (const row of WHEEL_TREE[1]) if (row[0] === '\u2014') need(row[1], 'WHEEL_TREE ' + row[1]);

  // An entry's HTML, assembled the way show() in index.html assembles it, and
  // dropped into the page the pack is already watching: once settled, nothing
  // of it reads as English prose. Four entries stand in for the shapes the
  // sheet takes \u2014 a plain gloss, a verse quoted whole, a Wylie+Sanskrit pair
  // with a translated tail, and a table row carrying an inline <span>.
  const bodyBlock = (p) => (/^<(?:ul|ol|blockquote)\b/.test(p) ? p : '<p class="body">' + p + '</p>');
  for (const id of ['wl_wheel', 'wl_verse', 'wl_hell_avichi', 'wl_yama']) {
    const o = WHEEL_ENTRIES[id];
    const sheet = doc.createElement('div');
    const bits = [];
    if (o.tib) bits.push(/[\u0f00-\u0fff]/.test(o.tib)
      ? '<i class="bo" lang="bo">' + o.tib + '</i>' : '<i>' + o.tib + '</i>');
    if (o.en) bits.push(o.en);
    sheet.innerHTML = '<p class="eyebrow">' + (o.meta || '') + '</p><h2></h2>'
      + '<p class="sub">' + bits.join(' &middot; ') + '</p>'
      + '<dl>' + (o.f || []).map((r) => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('') + '</dl>'
      + '<div class="bodies">' + [].concat(o.b || []).map(bodyBlock).join('') + '</div>';
    sheet.querySelector('h2').textContent = o.t;      // set as text, as show() sets it
    doc.body.appendChild(sheet);
    await settle(win);
    // Wylie stays in English letters by rule, and a short syllable of it can
    // spell an English word on its own ("khor" is harmless, but Tibetan "pa"
    // and "la" are two-letter words a stopword list has no way to tell from
    // English "pa" or "la" \u2014 reason enough to read the sheet the way
    // looksEnglish does, with every italic's own text left out of the count.
    const stray = (sheet.innerHTML.replace(/<i[^>]*>.*?<\/i>/gs, ' ').match(/\p{L}+/gu) || [])
      .filter((w) => /^[A-Za-z]+$/.test(w) && STOP_STRAY.has(w.toLowerCase()));
    assert.equal(stray.length, 0, id + ': no English left once the entry is shown \u2014 ' + stray.slice(0, 6).join(', '));
    sheet.remove();
  }
}

console.log('localization: the pack settles, translates what it should, names each square once,\n'
  + '              and answers for the ma\u1e47\u1e0dala, its tour and the verse\u2014and for the\n'
  + '              wheel of life, its ninety-two entries rendered as the page renders them.');
