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
const open = (lang = 'pl') => {
  const dom = new JSDOM(`<!doctype html><html lang="en"><body>
    <button class="btn" data-mode="mandala" title="Night"><span class="g">◎</span><span class="t">Mandala</span></button>
    <p class="prose">The model is the work of <b>Andrzej R. Rybszleger</b>, built from the sources named below.</p>
    <p class="plain">Full verse</p>
    <ul class="idx"><li>Mount Meru</li><li>Kalpas</li></ul>
    <span data-no-localize>Day</span>
    <script>${SCRIPT_TEXT}<\/script>
  </body></html>`, { runScripts: 'outside-only', url: 'https://worldsystem.test/' });
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

console.log('localization: the pack settles, translates what it should, names each square once,\n'
  + '              and answers for the ma\u1e47\u1e0dala, its tour and the verse.');
