import assert from 'node:assert/strict';
import { createGame, throwDie, emptyTally } from '../rebirth-game.js';
import { makeSession, restoreSession, possibleThrows } from '../game-session.js';
import { MOVES, FACES, TRAP_QUOTA, TRAP_QUOTA_NOTE64 } from '../rebirth-board.js';
import { PLAYER_SKINS } from '../game-players.js';
const options = { players: 4, names: ['One', 'Two', 'Three', 'Four'],
  skins: ['teal', 'plum', 'terracotta', 'indigo'], colours: [3, 2, 1, 0] };
for (const quotas of [TRAP_QUOTA, TRAP_QUOTA_NOTE64]) {
  const game = createGame({ ...options, quotas });
  const session = makeSession(game);
  for (let i = 0; i < 180 && !(game.over && game.stupa !== null); i++) {
    const face = 1 + (i * 7 + Math.floor(i / 6)) % 6;
    session.pending = face;
    const recovered = restoreSession(JSON.stringify(session));
    throwDie(game, face);
    assert.deepEqual(recovered.game, game, 'reload during animation completes exactly the sampled die');
    session.rolls.push(face); session.pending = null;
    assert.deepEqual(restoreSession(JSON.stringify(session)).game, game, 'completed rolls replay identically');
    assert.deepEqual(restoreSession(JSON.stringify(recovered.session)).game, game, 'reloading the recovery does not double count');
  }
}
for (let square = 1; square <= 104; square++) {
  const game = createGame(); game.players[0].pos = square;
  if (square === 1 || square === 48) game.players[0].trap = emptyTally();
  if (square === 104) { game.over = true; game.winner = 0; }
  const before = JSON.stringify(game), preview = possibleThrows(game);
  assert.equal(JSON.stringify(game), before, 'preview must not mutate game');
  for (let face = 1; face <= 6; face++) {
    const expected = throwDie(JSON.parse(before), face);
    assert.equal(preview[face - 1].kind, expected.kind);
    assert.equal(preview[face - 1].target, expected.to ?? expected.square ?? null);
  }
}
// Walk an actual route into a trap, collect every quota, and resume after each face.
function routeTo(target) {
  const queue = [[24, []]], seen = new Set([24]);
  for (const [at, route] of queue) {
    if (at === target) return route;
    for (let i = 0; i < 6; i++) {
      const next = MOVES[at]?.[FACES[i]];
      if (next && !seen.has(next)) { seen.add(next); queue.push([next, [...route, i + 1]]); }
    }
  }
  throw new Error('No route');
}
for (const square of [1, 48]) {
  const game = createGame({players: 1}), session = makeSession(game);
  const rolls = [...routeTo(square), ...FACES.flatMap((f, i) => Array(TRAP_QUOTA[f]).fill(i + 1))];
  for (const face of rolls) { throwDie(game, face); session.rolls.push(face); assert.deepEqual(restoreSession(JSON.stringify(session)).game, game); }
  assert.equal(game.players[0].trap, null);
  assert.equal(game.players[0].pos, square === 1 ? 9 : 52);
}
for (const bad of ['not json', '{}', '{"version":2}', JSON.stringify({...makeSession(createGame()), pending: 9}),
  JSON.stringify({...makeSession(createGame()), rolls:[0]}), JSON.stringify({...makeSession(createGame()), names:[]})]) {
  assert.equal(restoreSession(bad), null, 'invalid saves are rejected');
}
assert.equal(PLAYER_SKINS.length, 6);
assert.equal(createGame({skins:['missing'], colours:[99]}).players[0].skin, PLAYER_SKINS[0].id);
console.log('PASS: session replay, pending roll recovery, both quotas, both trap exits, 624 previews, invalid saves and appearance defaults.');
