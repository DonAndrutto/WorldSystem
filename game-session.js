import { createGame, throwDie } from './rebirth-game.js';
import { TRAP_QUOTA, TRAP_QUOTA_NOTE64, FACES } from './rebirth-board.js';
export const SESSION_KEY = 'ws-game-session-v1';
// Persist the starting choices and the dice, then replay the actual rules.
// A pending die is durable before animation starts, so reload cannot reroll it.
export function makeSession(game) {
  return { version: 1, names: game.players.map(p => p.name), skins: game.players.map(p => p.skin),
    colours: game.players.map(p => p.colour), note64: game.quotas.six === TRAP_QUOTA_NOTE64.six,
    rolls: [], pending: null };
}
export function restoreSession(raw) {
  try {
    const s = JSON.parse(raw);
    if (s?.version !== 1 || !Array.isArray(s.names) || s.names.length < 1 || s.names.length > 4
      || !s.names.every(n => typeof n === 'string' && n.length <= 24)
      || !Array.isArray(s.rolls) || s.rolls.length > 100000
      || !s.rolls.every(validFace) || !(s.pending === null || validFace(s.pending))) return null;
    const game = createGame({ players: s.names.length, names: s.names, skins: s.skins, colours: s.colours,
      quotas: s.note64 ? TRAP_QUOTA_NOTE64 : TRAP_QUOTA });
    const rolls = s.pending === null ? s.rolls : [...s.rolls, s.pending];
    const events = [];
    for (const face of rolls) {
      if (game.over && game.stupa !== null) return null;
      events.push(throwDie(game, face));
    }
    return { game, session: { ...makeSession(game), rolls, pending: null }, events,
      recovered: s.pending !== null };
  } catch { return null; }
}
const validFace = f => Number.isInteger(f) && f >= 1 && f <= 6;
export function possibleThrows(game) {
  return FACES.map((face, i) => {
    const copy = { ...game, players: game.players.map(p => ({ ...p, history: [], trap: p.trap ? { ...p.trap } : null })) };
    const event = throwDie(copy, i + 1);
    return { face: i + 1, ...event, target: event.to ?? event.square ?? null,
      label: event.kind === 'stupa' ? (event.placed ? 'Place relics' : 'Victory stands')
        : event.kind === 'trap-progress' ? 'Count needed · throw again'
        : event.kind === 'trap-blocked' ? 'Already counted · pass'
        : event.kind === 'dead' ? 'Stay here · pass'
        : event.kind === 'trap-complete' ? 'Leave the trap' : '' };
  });
}
