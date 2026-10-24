// Run with Node. The moods of the travellers' faces and the finale's
// timeline: pure functions only, no DOM, no WebGL.
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const moods = await import(pathToFileURL(repo + '/player-moods.js'));
const board = await import(pathToFileURL(repo + '/rebirth-board.js'));
const players = await import(pathToFileURL(repo + '/game-players.js'));
const finale = await import(pathToFileURL(repo + '/nirvana-finale.js'));

let checks = 0;
const check = (name, fn) => { fn(); checks += 1; console.log('  ok  ' + name); };
const mood = (n) => moods.moodOf(board.BY_N.get(n));

check('the place says the mood', () => {
  for (const n of [1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]) assert.equal(mood(n), 'weary', 'lower realm ' + n);
  for (const n of [17, 18, 19, 20, 21, 22, 23, 24, 26, 62, 65]) assert.equal(mood(n), 'neutral', 'worldly ' + n);
  for (const n of [27, 28, 29, 30, 31, 32, 35, 36, 37]) assert.equal(mood(n), 'joyful', 'heaven ' + n);
  // every stage of the path, the bhūmis, the sacred lands, the fields and Buddhahood
  for (const n of [25, 33, 38, 40, 52, 59, 66, 70, 71, 77, 84, 91, 94, 101, 104]) assert.equal(mood(n), 'serene', 'path ' + n);
  for (const s of board.SQUARES) assert.ok(moods.MOODS.includes(moods.moodOf(s)));
  assert.equal(moods.moodOf(null), 'neutral');
});

check('a traveller is painted in the mood of their square, and a portrait in setup in none', () => {
  assert.equal(players.playerMood({ skin: 'tibetan-male', pos: 3 }), 'weary');
  assert.equal(players.playerMood({ skin: 'tibetan-male', pos: 30 }), 'joyful');
  assert.equal(players.playerMood({ skin: 'tibetan-male', i: 0 }), null);
});

check('every traveller has a face, its features where a face has them', () => {
  assert.equal(moods.FACES.length, players.PLAYER_SKINS.length);
  for (const f of moods.FACES) {
    const d = Math.hypot(f.er[0] - f.el[0], f.er[1] - f.el[1]);
    assert.ok(d > 12 && d < 26, 'eyes apart: ' + d);
    assert.ok(f.el[0] < f.er[0] && Math.abs(f.el[1] - f.er[1]) < 3, 'eyes level');
    assert.ok(f.m[1] - f.el[1] > 0.8 * d && f.m[1] - f.el[1] < 1.3 * d, 'the mouth below the eyes');
    assert.ok(f.m[0] > f.el[0] - 6 && f.m[0] < f.er[0] + 6, 'the mouth under the eyes');
    assert.ok(f.mw > 4 && f.mw < 10);
  }
});

check('each mood moves the face the way it says', () => {
  const face = moods.FACES[0];
  const below = (p) => p.c[1] > face.m[1] - 3;
  const weary = moods.moodPlan(face, 'weary');
  const mouth = weary.pins.filter(below);
  assert.ok(mouth.length && mouth.every((p) => p.d[1] > 0), 'the corners of a weary mouth fall');
  assert.ok(weary.pins.some((p) => p.c[1] < face.el[1] - 4 && p.d[1] < 0), 'its brows rise in the middle');
  assert.ok(weary.tone.saturate < 1, 'and its colour is drained');
  const joyful = moods.moodPlan(face, 'joyful');
  assert.ok(joyful.pins.filter((p) => below(p) && Math.abs(p.c[0] - face.m[0]) > 3).every((p) => p.d[1] < 0), 'a joyful smile rises');
  assert.ok(joyful.tone.saturate > 1);
  const serene = moods.moodPlan(face, 'serene');
  assert.ok(serene.pins.some((p) => Math.abs(p.c[1] - face.el[1]) < 3 && p.d[1] > 1), 'serene eyes are lowered');
  assert.equal(moods.moodPlan(face, 'neutral').tone, null, 'neutral keeps the painting\'s colour');
});

check('a face is repainted only within its reach, and the same way every time', () => {
  const width = 256, height = 512, data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4;
    data[i] = (x * 7 + y * 3) % 256; data[i + 1] = (x * 3 + y * 11) % 256; data[i + 2] = (x + y) % 256;
    data[i + 3] = x > 20 && x < 236 ? 255 : 0;
  }
  const face = moods.FACES[3], box = moods.faceBox(face);
  const before = new Uint8ClampedArray(data);
  moods.paintMood({ data, width, height }, { face, mood: 'neutral' });
  let changed = 0;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * 4;
    if (data[i] === before[i] && data[i + 1] === before[i + 1] && data[i + 2] === before[i + 2]) continue;
    changed += 1;
    assert.ok(x >= box.x0 - 1 && x <= box.x1 + 1 && y >= box.y0 - 1 && y <= box.y1 + 1, 'outside the face at ' + x + ',' + y);
  }
  assert.ok(changed > 20, 'the mouth moved: ' + changed);
  const again = new Uint8ClampedArray(before);
  moods.paintMood({ data: again, width, height }, { face, mood: 'neutral' });
  assert.deepEqual(again, data);
  // a mood with a tone colours the figure, and leaves the clear background clear
  const toned = new Uint8ClampedArray(before);
  moods.paintMood({ data: toned, width, height }, { face, mood: 'weary' });
  assert.equal(toned[(300 * width + 5) * 4], before[(300 * width + 5) * 4]);
  assert.notEqual(toned[(300 * width + 100) * 4 + 2], before[(300 * width + 100) * 4 + 2]);
});

check('the finale climbs, blazes and settles in order', () => {
  const at = finale.finaleState;
  assert.equal(at(0).climb, 0);
  assert.equal(at(finale.FINALE.climb[1]).climb, 1);
  assert.equal(at(1).bloom, 0, 'the stupa waits for the light to reach it');
  assert.equal(at(finale.FINALE.bloom + 2).bloom, 1);
  assert.ok(at(finale.FINALE.crown[0] - 0.01).crown === 0 && at(finale.FINALE.crown[1]).crown === 1);
  assert.ok(at(8).flowers > 0.99, 'the flowers fall');
  assert.equal(at(finale.FINALE.end).flowers, 0, 'and stop');
  assert.equal(at(finale.FINALE.end).trails, 0, 'the trails are put away');
  assert.ok(at(finale.FINALE.end).glow > 0.3 && at(finale.FINALE.end).glow < 0.4, 'a quiet glow stays');
  assert.ok(at(finale.FINALE.end).done && !at(10).done);
  for (const ring of at(finale.FINALE.end).rings) assert.equal(ring, 1, 'every ring has spread');
});

console.log('\n' + checks + ' checks passed.');
