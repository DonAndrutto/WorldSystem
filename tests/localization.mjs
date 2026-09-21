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
  assert.match(tr('Player 1 wins'), /wygrywa/);
  assert.match(tr('Anna wins'), /^Anna wygrywa$/);
  assert.equal(tr('Throw for Anna'), 'Rzut dla Anna');
  assert.equal(tr('constructor'), 'constructor', 'the table is asked for its own keys only');
  assert.equal(tr('toString'), 'toString');
  for (const [english, pl] of Object.entries(T)) assert.equal(tr(pl), pl, 'already Polish: ' + english);
}

console.log('localization: the pack settles, translates what it should, and names each square once.');
