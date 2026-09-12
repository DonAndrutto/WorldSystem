import { REBIRTH_RULES, getRebirthOutcome } from './rebirth-data.js';

export const SAVE_VERSION = 1;
const trap = square => square === 1 || square === 48;
const copy = state => JSON.parse(JSON.stringify(state));
const dieCheck = die => { if (!Number.isInteger(die) || die < 1 || die > 6) throw new RangeError('Choose a die result from 1 to 6.'); };
const record = (state, event) => { state.last = event; state.history.push(event); state.history = state.history.slice(-80); return state; };

/** Seating order is retained; starter is selected by preliminary lowest rolls. */
export function createGame(names = ['Traveller'], starter = 0) {
  if (!Array.isArray(names) || !names.length || names.length > 12 || names.some(n => typeof n !== 'string' || !n.trim() || n.trim().length > 40)) throw new TypeError('Use 1–12 names of up to 40 characters.');
  if (!Number.isInteger(starter) || starter < 0 || starter >= names.length) throw new RangeError('Invalid starting player.');
  return {version: SAVE_VERSION, profile: REBIRTH_RULES.profile, players: names.map((name, i) => ({id:i, name:name.trim(), square:24, counters:null})), active:starter, turn:1, phase:'awaiting_roll', winner:null, last:null, history:[], ceremony:null};
}

/** Resolve exactly one roll. Explicit nextPlayer keeps its result on screen. */
export function rollGame(state, die) {
  dieCheck(die);
  if (state.phase !== 'awaiting_roll') return state;
  const next = copy(state), player = next.players[next.active], from = player.square;
  const outcome = getRebirthOutcome(from, die);
  let kind = outcome.action;
  if (trap(from)) {
    if (player.counters[die - 1] >= die) { kind = 'unneeded'; next.phase = 'turn_complete'; }
    else {
      player.counters[die - 1]++;
      kind = 'counted';
      if (player.counters.every((n, i) => n === i + 1)) {
        player.square = outcome.to; player.counters = null; kind = 'escaped'; next.phase = 'turn_complete';
      }
    }
  } else {
    player.square = outcome.to;
    player.counters = trap(player.square) ? [0,0,0,0,0,0] : null;
    next.phase = 'turn_complete';
  }
  if (player.square === 104) { next.winner = next.active; next.phase = 'won'; kind = 'won'; }
  return record(next, {player:next.active, turn:next.turn, die, from, to:player.square, kind});
}

export function nextPlayer(state) {
  if (state.phase !== 'turn_complete') return state;
  return {...state, active:(state.active + 1) % state.players.length, turn:state.turn + 1, phase:'awaiting_roll'};
}

/** The ceremony never changes the competitive winner. */
export function rollCeremony(state, die) {
  dieCheck(die);
  if (state.phase !== 'won' || state.ceremony?.inStupa) return state;
  return {...state, ceremony:{die, inStupa:die <= 2}};
}

export function rollDie(cryptoSource = globalThis.crypto) {
  if (!cryptoSource?.getRandomValues) throw new Error('Secure dice are unavailable in this browser.');
  const data = new Uint32Array(1), limit = 0x100000000 - (0x100000000 % 6);
  do { cryptoSource.getRandomValues(data); } while (data[0] >= limit);
  return data[0] % 6 + 1;
}

export function chooseStarter(count, die = rollDie) {
  if (!Number.isInteger(count) || count < 1 || count > 12) throw new RangeError('Invalid player count.');
  if (count === 1) return {starter:0, rounds:[]};
  let candidates = Array.from({length:count}, (_, i) => i), rounds = [];
  for (let round = 0; candidates.length > 1; round++) {
    // A broken caller-provided random source must not freeze the interface.
    if (round >= 128) throw new Error('Starting rolls kept tying. Please try again.');
    const rolls = candidates.map(player => { const result = die(); dieCheck(result); return {player, die:result}; });
    rounds.push(rolls);
    const low = Math.min(...rolls.map(r => r.die)); candidates = rolls.filter(r => r.die === low).map(r => r.player);
  }
  return {starter:candidates[0], rounds};
}

/** Fail closed on stale/corrupt saves; callers show recovery rather than crashing. */
export function restoreGame(value) {
  try {
    const s = typeof value === 'string' ? JSON.parse(value) : copy(value);
    if (s.version !== SAVE_VERSION || s.profile !== REBIRTH_RULES.profile || !Array.isArray(s.players) || !s.players.length || s.players.length > 12) return null;
    if (!Number.isInteger(s.active) || s.active < 0 || s.active >= s.players.length || !Number.isSafeInteger(s.turn) || s.turn < 1 || !['awaiting_roll','turn_complete','won'].includes(s.phase)) return null;
    for (const [i,p] of s.players.entries()) {
      if (p.id !== i || typeof p.name !== 'string' || !p.name.trim() || p.name.length > 40 || !Number.isInteger(p.square) || p.square < 1 || p.square > 104) return null;
      if (trap(p.square)) {
        if (!Array.isArray(p.counters) || p.counters.length !== 6 || p.counters.some((n,j) => !Number.isInteger(n) || n < 0 || n > j+1) || p.counters.every((n,j) => n === j+1)) return null;
      } else if (p.counters !== null) return null;
    }
    if (s.phase === 'won') {
      if (s.winner !== s.active || s.players[s.winner]?.square !== 104 || s.players.filter(p=>p.square===104).length!==1) return null;
    } else if (s.winner !== null || s.players.some(p => p.square === 104)) return null;
    if (!Array.isArray(s.history) || s.history.length > 80) return null;
    const validEvent = e => e && Number.isInteger(e.player) && e.player >= 0 && e.player < s.players.length && Number.isSafeInteger(e.turn) && e.turn >= 1 && e.turn <= s.turn && Number.isInteger(e.die) && e.die >= 1 && e.die <= 6 && Number.isInteger(e.from) && e.from >= 1 && e.from <= 104 && Number.isInteger(e.to) && e.to >= 1 && e.to <= 104 && ['move','stay','counted','unneeded','escaped','won'].includes(e.kind);
    if (s.history.some(e => !validEvent(e)) || (s.last !== null && !validEvent(s.last))) return null;
    if (s.ceremony !== null && (s.phase !== 'won' || !Number.isInteger(s.ceremony.die) || s.ceremony.die < 1 || s.ceremony.die > 6 || s.ceremony.inStupa !== (s.ceremony.die <= 2))) return null;
    // Return only known fields; UI never trusts arbitrary saved markup or methods.
    return {version:SAVE_VERSION, profile:REBIRTH_RULES.profile, players:s.players.map(p => ({id:p.id,name:p.name.trim(),square:p.square,counters:p.counters})), active:s.active,turn:s.turn,phase:s.phase,winner:s.winner,last:s.last,history:s.history,ceremony:s.ceremony};
  } catch { return null; }
}
