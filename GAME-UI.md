# Game UI stages 2–5

Built on main after the stage 1 camera and popup-navigation change (#26).

## Playing

- The first visit to Game opens traveler setup. Choose 1–4 players, names, one of twelve characters (male and female Bhutanese, Tibetan, Indian, Chinese, Thai and Western travelers), and independent player colours. Duplicate characters are allowed. Appearance does not change the rules.
- The selected artwork appears in setup, player tabs, board tokens and camera-facing 3D figures. If the world texture fails, coloured markers remain; entering Game again retries it.
- Board is the default for new visitors. Existing view and language preferences still apply. Board, Both and World now have visible labels.
- Destinations previews all six outcomes for the player holding the die, including dead faces and trap counts. Its entries open the corresponding descriptions.
- A throw highlights possible destinations alongside the die, holds the final result, then moves the traveler directly to the destination. It never counts intervening squares. The arrival card gives the short description, next player's throw, world focus and full entry.
- The Game menu contains New game, Move log, animation pace (Calm, Quick, Instant), a larger-square scrolling board, save status and rules. Skip animation finishes the already chosen result. Reduced-motion preference bypasses dice, movement and board-transition animation.
- Switching between the board and world plays a short, staggered assembly/disassembly of the board tiles. This is a presentation transition, not a morph of the physical world or a change to the board's mapping.
- Reaching Nirvana shows each player's throw and journey totals and Play again. The ceremonial stupa throw cannot change the winner.

## Saving and interruption

`game-session.js` stores initial player choices, quota variant, committed dice and a pending die under `ws-game-session-v1`. Restore replays the rules engine; it never trusts arbitrary saved player positions. The pending die is written before animation starts. Reloading finishes that same result once. Skip, view changes, mode exit and page backgrounding finish pending presentation safely. Invalid saves are rejected and unavailable storage is reported in the Game menu. Saves are local to this browser/device.

## Validation

- `node tests/game-session.mjs`: replay/recovery, both quota variants and trap exits, all 624 destination previews, malformed saves and appearance defaults.
- `node tests/mandala-regression.mjs`: existing DOM/geometry suite plus appearance selection, shared atlas in 3D, safe player names, skip, navigation during movement, mode exit during a throw, state/save agreement, rapid layout switches and Instant pace.
- Existing rebirth, gestures, world-surfaces and offline suites remain applicable. Run `node scripts/build-sw.cjs` after served assets change.
- Browser checks cover desktop and a 390 × 844 phone viewport, character setup, arrival cards, world focus, resume, game menu and large-square view. These are desktop browser viewport checks, not physical-device testing.

## Character artwork

`assets/rebirth/travelers.png` is one transparent 6-column × 2-row sprite atlas generated with the built-in image-generation tool. It is contemporary game illustration, not an image from the historical board. The same atlas is cropped by CSS and Three.js texture coordinates; the final generated image was copied with its alpha channel intact. An image-tool background-extraction pass followed the initial generation.

The 3D figures are 0.30 × SUMMIT tall (previously 0.63), a 52% reduction. Existing saved character IDs migrate to the new roster while preserving gender, colours and the dice journal.

Guided underground visits now use a low side view instead of clipping half the terrain. Tests check all 104 destinations at three viewport sizes for unchanged terrain materials/visibility, and raycast every underground sightline to ensure the intact layers do not obscure the destination.

See [TRAVELER-ART-PROMPTS.md](TRAVELER-ART-PROMPTS.md) for both final prompts and atlas details.
