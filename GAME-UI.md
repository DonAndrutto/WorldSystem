# Game UI stages 2–5

Built on main after the stage 1 camera and popup-navigation change (#26).

## Playing

- The first visit to Game opens a nine-step guided practice game with chosen legal throws. Dismiss it at any time; Game → Replay guided game starts it again. It never saves over the real game. Finishing the first practice opens traveler setup. Choose 1–4 players, names, one of twelve characters (male and female Bhutanese, Tibetan, Indian, Chinese, Thai and Western travelers), and independent player colours. Duplicate characters are allowed. Appearance does not change the rules.
- The selected artwork appears in setup, player tabs, board tokens and camera-facing 3D figures. If the world texture fails, coloured markers remain; entering Game again retries it.
- Board is the default for new visitors. Existing view and language preferences still apply. Board and World have visible labels.
- Destinations previews all six outcomes for the player holding the die, including dead faces and trap counts. Its entries open the corresponding descriptions.
- A throw highlights possible destinations alongside the die, holds the final result, then moves the traveler directly to the destination. It never counts intervening squares. The arrival card gives the short description, next player's throw, world focus and full entry.
- Quick, Instant and reduced-motion play use one fixed throw button above the bottom navigation. Result cards leave this target uncovered, and tapping it both replaces the result and advances the next turn. Quick ignores taps while a throw is in flight.
- The Game menu contains Replay guided game, New game, Move log, animation pace (Calm, Quick, Instant), a larger-square scrolling board, save status and rules. Skip animation finishes the already chosen result. Reduced-motion preference bypasses dice, movement and board-transition animation.
- Switching between the board and world plays a short, staggered assembly/disassembly of the board tiles. This is a presentation transition, not a morph of the physical world or a change to the board's mapping.
- Reaching Nirvana shows each player's throw and journey totals and Play again. The ceremonial stupa throw cannot change the winner.

## The phone pass

- The rail is three short rows in both arrangements: the die with the
  throw across the rest of the first, the view switch with Destinations and
  Game on the second, and the turn's own words on the third.
  Nothing below the rail belongs to the rail, so the grid keeps the rest of the
  height. Each row is written against `.bv-rail`, once, rather than three times
  over by each arrangement.
- Calm play uses the gold throw control in the rail. Quick and Instant use a
  blue fixed button with white text; the setup dialog retains its gold Start. It
  never prints past its own edge: a long player name is cut, not spilled.
- The turn line over the throw is dropped on a phone — the button carries the
  same name — and the middle arrangement drops the player row as well, which the
  model already gives in each player's own colour.
- A square's number is set in a corner of its own on a phone, on the page's
  paper rather than haloed by it, since the field painted behind it is bright
  and the number is what the die names.
- Destinations and the game menu fold out as sheets across the foot of the
  screen. At night they used to open off the top: night gives every card back
  its backdrop filter, the rail is a card, and a filtered element is where a
  fixed child is measured from.
- The game menu lists New game and Move log as rows rather than as chips set
  beside each other, and the log opens under them.

## The rest of the interface on a phone

- Both control menus open as a sheet the width of the control bar rather than
  hanging off one third of it. Speed lost Fast off the right edge of the screen
  and Language lost Polski; every row of every menu is now in view, and a row
  whose switch still will not fit drops it to a line of its own.
- Panels take 62% of the height rather than 54%: a panel is only open because
  something is being read in it, and the model behind it keeps a third of the
  screen. The entry's picture and the sheet's head come down to match.
- Recitation and Tour are one two-way switch at the head of the offering panels
  instead of two placards, and the tour's own three links sit three to a row.
- The maṇḍala's heap marks come down to 26px and hold their number alone; only
  the heap being recited, or the one just touched, says its name, so the plate
  under them can be seen. Every mark still carries its full name as its
  accessible label.
- `--line` and `--card` are defined for the page, not only for the printed
  board. Outside that one arrangement every rule naming them was dropped, which
  left the setup dialog's fieldsets with no edge, the list of destinations with
  no separators, and the dialog's sticky footer transparent with the form
  running under it.

## Orientation

Only the board asks for the phone upright. The model is better across a wide
screen than a tall one, and the notice used to cover the whole page: turning the
phone while looking at Meru took Meru away. Explorer, the maṇḍala and the
world's own arrangement of the game keep landscape; the board's notice offers
that arrangement rather than leaving the turn of the phone as the only answer.
The full-screen portrait lock is taken out for the board alone, and the
manifest still opens the installed app upright.

## Two arrangements, not three

Both — the board set beside the world it is a section through — is gone. It
asked for a screen wide enough to read a hundred and four named squares and a
turning model at once, and gave each of them the half the other did not want;
on a phone it gave them a third each and the rail the rest. Board and World are
what remain, each of them the whole screen, either one press or one key (`b`,
`w`) away, sharing one selection — so nothing Both did is lost, only the halves
it did it in. A remembered `ws-game-view` of `both` opens on the board. The
hidden swap control the `w` key was named for goes with it: the switch in the
rail says the same thing and is on the screen.

## The clouds

Drawn at about half their former weight, day and night, in the one place both
skies are painted (`sky-clouds.js`). They are the backdrop the world stands in
front of; at their old weight the spirals competed with it, and on the printed
board they competed with the hundred and four fields.

## Saving and interruption

`game-session.js` stores initial player choices, quota variant, committed dice and a pending die under `ws-game-session-v1`. Restore replays the rules engine; it never trusts arbitrary saved player positions. The pending die is written before animation starts. Reloading finishes that same result once. Skip, view changes, mode exit and page backgrounding finish pending presentation safely. Invalid saves are rejected and unavailable storage is reported in the Game menu. Saves are local to this browser/device.

## Validation

- `node tests/game-session.mjs`: replay/recovery, both quota variants and trap exits, all 624 destination previews, malformed saves and appearance defaults.
- `node tests/mandala-regression.mjs`: existing DOM/geometry suite plus appearance selection, shared atlas in 3D, safe player names, skip, navigation during movement, mode exit during a throw, state/save agreement, rapid layout switches and Instant pace.
- Existing rebirth, gestures, world-surfaces and offline suites remain applicable. Run `node scripts/build-sw.cjs` after served assets change.
- Browser checks cover desktop and a 390 × 844 phone viewport, character setup, arrival cards, world focus, resume, game menu and large-square view. These are desktop browser viewport checks, not physical-device testing.

## The camera follows the traveler

In the World arrangement the camera goes with whoever holds the die. Each throw
flies the eye to where the traveler lands, in the same three-quarter view a
visit to that square gets (the square and Meru together), and it flies there
while the token does, so the landing and the arrival are one movement. Entering
the game, switching to World, or a panel opening or closing frames the traveler
last followed rather than the whole ascent. A drag looks around freely; the next
throw picks the traveler up again. **Camera follows the traveler** in the Game
menu turns it off, returning to the whole-journey overview; it is on until then,
and the choice is kept (`ws-game-follow`). An explicit Show in world, and the
guided tour, frame their own stops as before.

## Destinations in three dimensions

The two arrangements show the squares in two idioms. The board keeps the
painted fields: the cell, the throw card and the head of the entry are
unchanged. In the world each square stands as a small model at its marker,
where its billboard used to hang (`square-models.js`). The field's outline
becomes part of the model: the ring, the disciples' ogee arch, the Mahāyāna
cloud, the four-pointed cartouche of the acts, or the flame arch of the bodies
of a Buddha stands behind the subject as an aureole, or lies flat as the ground
of a hell. What the board leaves inside its frames is built from the square's
description: the cauldron of the hot hells, the hungry ghost, the monk with
bowl and staff, the vase, crown, vajra and bell of the empowerments, the
central channel, the Buddha under the tree, the stupa of Nirvana.
[docs/SQUARE-MODELS.md](docs/SQUARE-MODELS.md) lists what each one shows.

- Eighty-three squares have a model. The twenty-one the world already builds
  keep the world's own geometry and have none: the four continents (the
  explorer's Aparagodānīya, with its cow, is the western continent of the
  game too), the Four Kings' terrace, the Thirty-three, Yāma, Tuṣita, the two
  highest desire heavens, the form-realm emblem, Śuddhāvāsa and the formless
  spheres — and the hells and the pretas' ground, which are now the world's
  own models and are shown in Explorer as in Game (below).
- Everything is procedural, from one kit of parts; nothing is downloaded. The
  models are built the first time the game is opened, not when the page loads.
- Each model turns about its own vertical to face the camera, so its front is
  readable from anywhere in the orbit while it keeps its depth and lighting.
- Like the markers, a square nobody is on and nobody has asked about is drawn
  faint; the squares in play stand at full weight, and Nirvana always does.
- Tapping any part of a model opens that square's entry.
- Each model is merged into at most four meshes (matte, metal, glowing,
  translucent), with its colours in the vertices. The eighty-three come to
  about 1.06M triangles, the heaviest under 40k.

## One human body

Every person in the destinations — the Buddha, an arhat, a monk with his
bowl, a bodhisattva, a yogi, a being in the hells, a servant of Yama — is the
same body (`human-figure.js`), built as a sculptor would build it rather than
from beads: a head modelled as one surface, with the brow, the sockets, the
cheekbones, the nose, the lips and the chin raised from it, and the brows,
lashes and lips laid on it; a torso turned from anatomical sections — hips,
waist, ribs, chest, shoulders — with the breast, the shoulder blades and the
spine in it; arms and legs swept along their bones, the elbows and knees
placed by the bones' own lengths, so a hand is only where an arm can reach;
hands of a palm and five fingers, each bending at its three joints; feet with
their toes. The robe is part of the same surfaces: over the left shoulder,
its rolled edge across the breast and its folds following it, the right
shoulder bare; the lower robe covers the crossed legs or falls in folds to the
ankles.

A pose is a set of joints, and the same body takes any of them: seated in the
vajra posture with the gestures of meditation, touching the earth, teaching,
protection, giving, the hands on the knees or joined at the heart; standing,
with a bowl, a staff or a raised hand; kneeling, huddled, writhing, reaching,
fighting, thrown down, fallen. The figure is built at three levels of
detail: fine for the figure a destination is about (a seated figure is about
13k triangles, what the old figure cost), coarser for a smaller one, and plain
for the crowds of the hells.

## The realms beneath Jambudvīpa

The eight hot hells, the eight cold hells, the Vajra Hell and the pretas'
ground each carry a model of what happens there, standing on its own floor in
the world and seen in every mode: the beings of Sañjīva cutting one another
down and revived by a cool wind; the black lines of Kālasūtra and the saw;
the beast-headed mountains and the mortar of Saṃghāta; the doorless iron
house of Raurava and the house within a house of Mahāraurava; the stakes of
Tapana; the trident, the iron sheet and the cauldron of Pratāpana; Avīci's
house of fire; the blisters, the chattering, the cries and the splitting
flesh of the cold hells; the pretas searching dry ground before the wall of
Yama's city. The Vajra Hell is the lowest, beneath Avīci, on a floor of night
with black fire, the vajra standing as the walls of its prison; square 1
stands on it. The squares that name a hell or the pretas stand on that
realm's floor, and their travellers stand beside its model.
- `node tests/square-models.mjs` checks that every unbuilt square has a model,
  that each stays within its unit, that neighbours on the spiral cannot touch
  however they are turned, the triangle and draw-call budgets, and the facing
  and fading.

## Character artwork

`assets/rebirth/travelers.png` is one transparent 6-column × 2-row sprite atlas generated with the built-in image-generation tool. It is contemporary game illustration, not an image from the historical board. The same atlas is cropped by CSS and Three.js texture coordinates; the final generated image was copied with its alpha channel intact. An image-tool background-extraction pass followed the initial generation.

The 3D figures are 0.15 × SUMMIT tall (previously 0.30, and before that 0.63): about the height of a destination's model, so a traveller stands beside the place they have come to rather than in front of it. Each figure steps aside of its square's model, to the viewer's right, every frame; the name chip follows the figure. Existing saved character IDs migrate to the new roster while preserving gender, colours and the dice journal.

Focus here and the explorer's Zoom in share one close-up: the place's own angle (see `closeUpDirection` in `game-camera.js`) and a fit that gives the model about half the free canvas. The visited model is lit from within with the frames' gold and ringed on its floor. Guided underground visits use a nearly level side view between the hells instead of clipping half the terrain. Tests check all 104 destinations at three viewport sizes for unchanged terrain materials/visibility, and raycast every underground sightline to ensure the intact layers do not obscure the destination.

See [TRAVELER-ART-PROMPTS.md](TRAVELER-ART-PROMPTS.md) for both final prompts and atlas details.
