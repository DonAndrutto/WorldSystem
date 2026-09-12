// Run with Node. Data and rules only; no DOM, no WebGL.
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const board = await import(pathToFileURL(repo + '/rebirth-board.js'));
const game = await import(pathToFileURL(repo + '/rebirth-game.js'));
const { SQUARES, MOVES, SPECIAL, START, VICTORY, FACES, TRAP_QUOTA, TRAP_QUOTA_NOTE64 } = board;

let checks = 0;
const check = (name, fn) => { fn(); checks += 1; console.log('  ok  ' + name); };

check('104 squares, numbered 1 to 104 without gaps', () => {
  assert.equal(SQUARES.length, 104);
  assert.deepEqual(SQUARES.map(s => s.n), Array.from({ length: 104 }, (_, i) => i + 1));
});

check('the board is 13 rows of 8, square 1 bottom right', () => {
  for (const s of SQUARES) {
    assert.equal(s.row, Math.floor((s.n - 1) / 8), 'row of ' + s.n);
    assert.equal(s.col, (s.n - 1) % 8, 'column of ' + s.n);
  }
  const one = SQUARES[0];
  assert.equal(one.row, 0); assert.equal(one.col, 0);
  assert.equal(SQUARES[103].row, 12); assert.equal(SQUARES[103].col, 7);
});

check('every square carries a name and a band', () => {
  for (const s of SQUARES) {
    assert.ok(s.name && s.name.trim().length, 'name of ' + s.n);
    assert.ok(board.BAND_COLOUR[s.band], 'band of ' + s.n);
  }
});

check('all 624 square/face combinations resolve', () => {
  let moves = 0, dead = 0, special = 0;
  for (let n = 1; n <= 104; n += 1) {
    for (const f of FACES) {
      if (SPECIAL[n]) { special += 1; continue; }
      if (game.destination(n, f)) moves += 1; else dead += 1;
    }
  }
  assert.equal(moves + dead + special, 624);
  assert.equal(special, 18, 'three special squares, six faces each');
  assert.equal(moves, 392);
  assert.equal(dead, 214);
});

check('every destination is a real square', () => {
  for (const [from, row] of Object.entries(MOVES)) {
    for (const [face, to] of Object.entries(row)) {
      assert.ok(FACES.includes(face), 'face ' + face + ' at ' + from);
      assert.ok(to >= 1 && to <= 104, from + '/' + face + ' leads to ' + to);
    }
  }
});

check('the two traps exit where the book says', () => {
  assert.equal(SPECIAL[1].kind, 'tally'); assert.equal(SPECIAL[1].exit_to, 9);
  assert.equal(SPECIAL[48].kind, 'tally'); assert.equal(SPECIAL[48].exit_to, 52);
  assert.equal(SPECIAL[104].kind, 'terminal');
});

check('both trap quota readings total 21 throws', () => {
  const sum = q => FACES.reduce((t, f) => t + q[f], 0);
  assert.equal(sum(TRAP_QUOTA), 21);
  assert.equal(sum(TRAP_QUOTA_NOTE64), 21);
  assert.notDeepEqual(TRAP_QUOTA, TRAP_QUOTA_NOTE64);
});

check('every square is reachable from the start', () => {
  const seen = new Set([START]);
  const stack = [START];
  while (stack.length) {
    const n = stack.pop();
    for (const f of FACES) {
      const to = game.destination(n, f);
      if (to && !seen.has(to)) { seen.add(to); stack.push(to); }
    }
    if (SPECIAL[n] && SPECIAL[n].exit_to && !seen.has(SPECIAL[n].exit_to)) {
      seen.add(SPECIAL[n].exit_to); stack.push(SPECIAL[n].exit_to);
    }
  }
  assert.equal(seen.size, 104);
});

check('the printed ten-twos route reaches Dharma Body', () => {
  const path = game.followFace('two', 10);
  assert.deepEqual(path, [24, 17, 25, 33, 42, 50, 66, 75, 83, 91, 93]);
});

check('the printed ten-ones route falls one throw short, as recorded', () => {
  const ten = game.followFace('one', 10);
  assert.equal(ten[ten.length - 1], 94);
  const eleven = game.followFace('one', 11);
  assert.equal(eleven[eleven.length - 1], 93);
});

check('a dead face leaves the player where they were', () => {
  const g = game.createGame({ players: 2 });
  g.players[0].pos = 16;                       // Rudra lists only a two
  const ev = game.throwDie(g, 'one');
  assert.equal(ev.kind, 'dead');
  assert.equal(g.players[0].pos, 16);
  assert.equal(g.turn, 1, 'the die passes');
});

check('a trap keeps its counts across turns and exits on completion', () => {
  const g = game.createGame({ players: 1 });
  g.players[0].pos = 1;
  g.players[0].trap = game.emptyTally();
  assert.equal(game.throwDie(g, 'one').kind, 'trap-progress');
  assert.equal(game.throwDie(g, 'one').kind, 'trap-blocked', 'quota of one is filled');
  assert.equal(g.players[0].trap.one, 1, 'counts are kept, not reset');
  for (const [face, n] of Object.entries(TRAP_QUOTA)) {
    for (let i = g.players[0].trap[face]; i < n; i += 1) game.throwDie(g, face);
  }
  assert.equal(g.players[0].trap, null);
  assert.equal(g.players[0].pos, 9, 'Vajra Hell lets out at Yama');
});

check('victory is declared on arrival and the stupa cannot undo it', () => {
  const g = game.createGame({ players: 2 });
  g.players[0].pos = 103;
  const win = game.throwDie(g, 'one');
  assert.equal(win.kind, 'victory');
  assert.equal(g.winner, 0);
  const rite = game.throwDie(g, 'five');
  assert.equal(rite.kind, 'stupa');
  assert.equal(rite.placed, false);
  assert.equal(g.winner, 0, 'the winner does not change');
});

// Whether an anchor really binds to geometry needs the built scene, so that
// check lives in tests/mandala-regression.mjs; here only the shape of the data.
check('anchored squares name entries the world system already draws', () => {
  const anchored = SQUARES.filter(s => s.anchor);
  assert.equal(anchored.length, 21);
  for (const s of anchored) {
    assert.match(s.anchor, /^[a-z0-9_]+$/);
    assert.equal(s.band, 'anchored', 'square ' + s.n + ' is anchored');
  }
  const loose = SQUARES.filter(s => !s.anchor);
  assert.equal(loose.length, 83);
  for (const s of loose) assert.notEqual(s.band, 'anchored', 'square ' + s.n + ' has nothing to anchor to');
});

check('seam positions are finite and distinct', () => {
  const ctx = { RIM: 1.5, FLOOR: -0.2, SUMMIT: 0.68 };
  const seen = new Set();
  for (const s of SQUARES.filter(x => !x.anchor)) {
    const p = board.seamPosition(s, ctx);
    for (const v of [p.x, p.y, p.z]) assert.ok(Number.isFinite(v), 'finite for ' + s.n);
    const key = [p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4)].join();
    assert.ok(!seen.has(key), 'square ' + s.n + ' overlaps another');
    seen.add(key);
  }
});

console.log('\n' + checks + ' checks passed.');
