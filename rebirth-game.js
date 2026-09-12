// The rules of the 1977 English board, as a self-contained engine.
//
// The die names a destination, it does not count spaces. A face with no listed
// move is dead: the player stays and passes. Squares 1 and 48 are counter traps
// — throw one 1, two 2s, and so on through six 6s, continuing in the same turn
// while a result is still needed. Completing the checklist leaves for 9 and 52.
// Victory is declared on arrival at 104; the stupa throw that follows is a
// ceremony and cannot change the winner.
//
// Each player keeps the whole arc they travelled, which is the one thing the
// board records that a position cannot: the fall to a hell and the climb out of
// it are the same square twice, and only the trail tells them apart.

import { MOVES, SPECIAL, START, VICTORY, TRAP_QUOTA, FACES } from './rebirth-board.js';

export function createGame(options = {}) {
  const count = Math.max(1, Math.min(4, options.players || 2));
  return {
    quotas: options.quotas || TRAP_QUOTA,
    turn: 0,
    // Whose trail is on show. Reading another player's arc must never hand them
    // the die, so this is kept apart from turn and never written by a throw.
    viewing: 0,
    over: false,
    winner: null,
    stupa: null,
    players: Array.from({ length: count }, (_, i) => ({
      i, pos: START, trap: null, history: []
    }))
  };
}

// Look at a player without giving them the turn.
export function view(game, i) {
  if (i >= 0 && i < game.players.length) game.viewing = i;
  return game.viewing;
}

export const emptyTally = () => ({ one: 0, two: 0, three: 0, four: 0, five: 0, six: 0 });

export function outstanding(trap, quotas) {
  return FACES.reduce((total, f) => total + Math.max(0, quotas[f] - trap[f]), 0);
}

export function destination(square, face) {
  const row = MOVES[square];
  return (row && row[face]) || null;
}

export function isTrap(square) {
  const s = SPECIAL[square];
  return !!(s && s.kind === 'tally');
}

// Advance the game by one throw. Returns an event describing what happened;
// the caller decides how to narrate it.
export function throwDie(game, face) {
  const key = typeof face === 'number' ? FACES[face - 1] : face;
  const player = game.players[game.turn];

  if (game.over) {
    game.stupa = key === 'one' || key === 'two';
    return { kind: 'stupa', player: player.i, face: key, placed: game.stupa };
  }

  if (player.trap) {
    const quotas = game.quotas;
    const need = player.trap[key] < quotas[key];
    if (!need) {
      pass(game);
      return { kind: 'trap-blocked', player: player.i, face: key, square: player.pos };
    }
    player.trap[key] += 1;
    const left = outstanding(player.trap, quotas);
    if (left > 0) {
      return { kind: 'trap-progress', player: player.i, face: key, square: player.pos, left };
    }
    const exit = SPECIAL[player.pos].exit_to;
    const from = player.pos;
    player.trap = null;
    player.pos = exit;
    record(player, key, from, exit);
    pass(game);
    return { kind: 'trap-complete', player: player.i, face: key, from, to: exit };
  }

  const to = destination(player.pos, key);
  if (!to) {
    const square = player.pos;
    pass(game);
    return { kind: 'dead', player: player.i, face: key, square };
  }

  const from = player.pos;
  player.pos = to;
  record(player, key, from, to);

  if (to === VICTORY) {
    game.over = true;
    game.winner = player.i;
    game.stupa = null;
    return { kind: 'victory', player: player.i, face: key, from, to };
  }
  if (isTrap(to)) {
    player.trap = emptyTally();
    pass(game);
    return { kind: 'trapped', player: player.i, face: key, from, to };
  }
  pass(game);
  return { kind: 'move', player: player.i, face: key, from, to };
}

function pass(game) {
  game.turn = (game.turn + 1) % game.players.length;
  game.viewing = game.turn;
}

function record(player, face, from, to) {
  player.history.push({ face, from, to });
}

// Follow one face from a square for n throws, ignoring traps and other players.
// Used to check the routes the Rules of Play claim.
export function followFace(face, throws, from = START) {
  const path = [from];
  let pos = from;
  for (let i = 0; i < throws; i += 1) {
    const to = destination(pos, face);
    if (!to) break;
    pos = to;
    path.push(pos);
  }
  return path;
}
