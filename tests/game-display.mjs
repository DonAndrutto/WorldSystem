// Run with Node. No browser, no WebGL.
// The five layers the game draws over its squares (game-display.js), how the
// choice is kept, and that keeping it touches nothing else: not the saved game,
// not the Names setting, not the interface language. What each layer does on
// the board and in the world is tests/browser-game-display.mjs's to say.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const display = await import(pathToFileURL(repo + '/game-display.js'));
const { SESSION_KEY, makeSession, restoreSession } = await import(pathToFileURL(repo + '/game-session.js'));
const { createGame, throwDie } = await import(pathToFileURL(repo + '/rebirth-game.js'));
const read = (file) => fs.readFileSync(repo + file, 'utf8');
let checks = 0;
const check = (name, fn) => { fn(); checks += 1; console.log('  ok  ' + name); };
const storage = (initial = {}) => {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => { data.set(k, String(v)); }, removeItem: (k) => { data.delete(k); } };
};
const { DISPLAY_LAYERS, DISPLAY_DEFAULTS, DISPLAY_SCOPE, DISPLAY_KEY } = display;

check('five layers, each on by default, none of them reaching the game', () => {
  assert.deepEqual(DISPLAY_LAYERS, ['names', 'numbers', 'highlights', 'guides', 'links']);
  assert.deepEqual(DISPLAY_DEFAULTS, { names: true, numbers: true, highlights: true, guides: true, links: true });
  assert.equal(DISPLAY_KEY, 'ws-game-display');
  assert.notEqual(DISPLAY_KEY, SESSION_KEY);
  assert.ok(Object.isFrozen(DISPLAY_DEFAULTS) && Object.isFrozen(DISPLAY_LAYERS));
});

check('each layer says where it is drawn, and the two path overlays are the world\'s alone', () => {
  assert.deepEqual(Object.keys(DISPLAY_SCOPE), DISPLAY_LAYERS);
  assert.deepEqual(DISPLAY_SCOPE.names, ['board', 'world']);
  assert.deepEqual(DISPLAY_SCOPE.numbers, ['board', 'world']);
  assert.deepEqual(DISPLAY_SCOPE.highlights, ['board', 'world']);
  assert.deepEqual(DISPLAY_SCOPE.guides, ['world']);
  assert.deepEqual(DISPLAY_SCOPE.links, ['world']);
});

check('with nothing written, everything is shown, as before the layers existed', () => {
  assert.deepEqual(display.readDisplay(storage()), DISPLAY_DEFAULTS);
  assert.equal(display.serializeDisplay(DISPLAY_DEFAULTS), null);
  assert.deepEqual(display.displayClasses(DISPLAY_DEFAULTS), []);
});

check('what is written is the list of layers that are off, and it comes back', () => {
  const state = { ...DISPLAY_DEFAULTS, names: false, links: false };
  const text = display.serializeDisplay(state);
  assert.deepEqual(JSON.parse(text), { v: 1, off: ['names', 'links'] });
  const store = storage();
  assert.ok(display.writeDisplay(store, state));
  assert.equal(store.getItem(DISPLAY_KEY), text);
  assert.deepEqual(display.readDisplay(store), state);
  assert.deepEqual(display.displayClasses(state), ['gd-no-names', 'gd-no-links']);
  // turning the last one back on leaves no key behind
  assert.ok(display.writeDisplay(store, DISPLAY_DEFAULTS));
  assert.equal(store.getItem(DISPLAY_KEY), null);
  assert.equal(store.data.size, 0);
});

check('every combination of the five survives a write and a read', () => {
  for (let mask = 0; mask < 32; mask += 1) {
    const state = Object.fromEntries(DISPLAY_LAYERS.map((layer, i) => [layer, !(mask & (1 << i))]));
    const store = storage();
    display.writeDisplay(store, state);
    assert.deepEqual(display.readDisplay(store), state, 'mask ' + mask);
  }
});

check('a damaged, foreign or older value is no choice, and never an error', () => {
  for (const raw of ['', 'null', '[]', '{}', '42', '"names"', '{"off":"names"}', '{"off":null}', '{"off":[1,null,{}]}', '{not json', 'true']) {
    assert.deepEqual(display.parseDisplay(raw), DISPLAY_DEFAULTS, JSON.stringify(raw));
  }
  // layers it does not know are ignored, the ones it does are kept, and a layer added later is on
  assert.deepEqual(display.parseDisplay('{"v":7,"off":["numbers","colours","__proto__","constructor"]}'),
    { ...DISPLAY_DEFAULTS, numbers: false });
  assert.deepEqual(display.parseDisplay({ off: ['highlights'] }), { ...DISPLAY_DEFAULTS, highlights: false });
  const parsed = display.parseDisplay('{"off":["__proto__"]}');
  assert.equal(Object.getPrototypeOf(parsed), Object.prototype);
  assert.deepEqual(Object.keys(parsed), DISPLAY_LAYERS);
});

check('unavailable storage is the defaults, and writing to it fails quietly', () => {
  const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
  assert.deepEqual(display.readDisplay(broken), DISPLAY_DEFAULTS);
  assert.equal(display.writeDisplay(broken, { ...DISPLAY_DEFAULTS, names: false }), false);
  assert.equal(display.writeDisplay(broken, DISPLAY_DEFAULTS), false);
});

check('the choice has a key of its own: the saved game, Names and the language are not read or written', () => {
  const session = JSON.stringify(makeSession(createGame({ players: 2 })));
  const store = storage({ [SESSION_KEY]: session, 'ws-tibetan': '1', 'ws-language': 'pl', 'ws-game-view': 'world' });
  const before = JSON.stringify([...store.data]);
  const state = display.readDisplay(store);
  assert.equal(JSON.stringify([...store.data]), before, 'reading changes nothing');
  display.writeDisplay(store, { ...state, names: false, numbers: false, highlights: false, guides: false, links: false });
  assert.equal(store.getItem(SESSION_KEY), session, 'the saved game is byte for byte what it was');
  assert.equal(store.getItem('ws-tibetan'), '1');
  assert.equal(store.getItem('ws-language'), 'pl');
  assert.deepEqual([...store.data.keys()].sort(), [DISPLAY_KEY, SESSION_KEY, 'ws-game-view', 'ws-language', 'ws-tibetan'].sort());
  // and the saved game restores to the same game with every layer off or on
  const restored = restoreSession(store.getItem(SESSION_KEY));
  assert.ok(restored && restored.game.players.length === 2);
});

check('the session schema has no place for a display choice', () => {
  const session = makeSession(createGame({ players: 3 }));
  assert.deepEqual(Object.keys(session).sort(), ['colours', 'names', 'note64', 'pending', 'rolls', 'skins', 'version']);
  assert.equal(session.version, 1);
  const source = read('game-session.js');
  assert.ok(!/game-display|gd-no|DISPLAY_KEY|ws-game-display/.test(source), 'game-session.js does not know of the display layers');
  const rules = read('rebirth-game.js');
  assert.ok(!/game-display|gd-no|ws-game-display/.test(rules), 'nor do the rules');
  // the rules play the same throws to the same places whatever is drawn: they never see it
  const a = createGame({ players: 2 }), b = createGame({ players: 2 });
  for (const face of [3, 1, 6, 2, 5, 4, 4, 2, 1, 3, 6, 6]) { throwDie(a, face); throwDie(b, face); }
  assert.deepEqual(a.players.map((p) => p.pos), b.players.map((p) => p.pos));
});

check('the page offers each layer once, names it, says where it acts, and has it in Polish', () => {
  const html = read('index.html');
  const pack = read('locales/pl.js');
  const keys = new Set(pack.split('\n').map((line) => /^\s*"((?:[^"\\]|\\.)*)":\s*"/.exec(line)?.[1]).filter(Boolean));
  const labels = { names: 'Field names', numbers: 'Field numbers', highlights: 'Highlights', guides: 'Route guides', links: 'Move links' };
  for (const layer of DISPLAY_LAYERS) {
    const buttons = [...html.matchAll(new RegExp('<button[^>]*data-display="' + layer + '"[^>]*>([^<]*)</button>', 'g'))];
    assert.equal(buttons.length, 1, layer + ' has one switch');
    assert.match(buttons[0][0], /aria-pressed="true"/, layer + ' starts on');
    assert.equal(buttons[0][1], labels[layer]);
    const title = /title="([^"]+)"/.exec(buttons[0][0])[1];
    assert.ok(keys.has(labels[layer]), 'Polish for ' + labels[layer]);
    assert.ok(keys.has(title), 'Polish for the title of ' + layer);
    const scope = DISPLAY_SCOPE[layer].length === 2 ? /on the board and in the world|, on the board and in the world/ : /in the world:/;
    assert.match(title, scope, layer + ' says where it acts');
  }
  assert.ok(keys.has('Game display'), 'Polish for the group');
  assert.match(html, /data-display="names"[\s\S]{0,2000}data-ui-lang="en"/, 'they sit with the other settings, before the interface language');
});

console.log(checks + ' checks passed.');
