/* Short presentation routes. Their full entries carry the source references;
 * the captions here are looking prompts, not a second catalogue. */
export const PRESENTATION_TOURS = {
  explore: [
    { id: 'about', title: 'A world around Meru', overview: true,
      copy: 'Begin with the whole world system. The mountain, concentric seas and continents form its centre; the heavens rise above. Distances and heights are adapted for visibility.' },
    { id: 'meru_core', direction: [1, 0.55, 1.25],
      copy: 'Look at Meru’s four faces. Each faces a continent and has its own precious substance and colour. The terraces lead upward to the summit.' },
    { id: 'meru_summit_platform', direction: [1, 1.1, 1.25],
      copy: 'The summit is the home of the Thirty-three. Look for the city and the palace: the model gives these small features extra room so they can be studied.' },
    { id: 'range_yugandhara', title: 'The seven golden ranges', direction: [0.2, 2.8, 1],
      copy: 'Seven golden ranges alternate with fresh-water seas. Their dimensions decrease outward. This high angle reveals their nested arrangement around Meru.' },
    { id: 'continent_jambudvipa', direction: [0.25, 1.5, 1],
      copy: 'Jambudvīpa, the southern continent, is the human world familiar to this account. Compare its shape with the other continents when you return to the overview.' },
    { id: 'sun', direction: [1, 0.65, 1.25],
      copy: 'The sun and moon travel around Meru. Their size and the lighting are illustrative; the entry explains the dimensions and the account of day and night.' },
    { id: 'heaven_tushita', direction: [1, 0.5, 1.25],
      copy: 'The heavens stand above the summit in successive groups. Their spacing is schematic: opening an entry gives the measures and lifespans described in the sources.' },
    { id: 'about_scale', title: 'Read the model with its sources', overview: true,
      copy: 'Return to the whole. The drawing is a study aid with deliberate changes of scale. Open the entry to see those adaptations, then explore any part at your own pace.' }
  ],
  game: [
    { id: 'about_rebirth', title: 'A journey through 104 squares', overview: true,
      copy: 'The game places rebirths and stages of realization across the world system. This tour visits a few landmarks without rolling the die or changing any player’s progress.' },
    { id: 'rebirth_sq_24',
      copy: 'Every player begins on the Heavenly Highway. A throw names a destination from the current square; it does not count a number of steps along the board.' },
    { id: 'rebirth_sq_1',
      copy: 'The lower realms belong to the same journey as the heavens. Their display positions beneath the world are schematic, chosen to make the locations visible.' },
    { id: 'rebirth_sq_28',
      copy: 'Here the game meets the summit of Meru. The three-dimensional palace stands for the same destination that has a painted field on the board.' },
    { id: 'rebirth_sq_32',
      copy: 'A higher rebirth is still within the round of existence. The board’s routes distinguish worldly destinations from paths of realization.' },
    { id: 'rebirth_sq_64',
      copy: 'Some squares have special rules. Open this square’s entry for its conditions; the game’s rules explain the counter and how a player can leave.' },
    { id: 'rebirth_sq_104',
      copy: 'Nirvana is the destination at the top of the journey. End the tour to return to your previous board arrangement and continue the game from the same position.' }
  ],
  wheel: [
    { id: 'wl_wheel', overview: true,
      copy: 'Read the wheel from its centre outward: three poisons, actions and their results, six realms, and twelve links. The figure holding it represents impermanence.' },
    { id: 'wl_hub',
      copy: 'The bird, snake and pig at the hub stand for attachment, aversion and ignorance. Their circular arrangement shows how they sustain one another.' },
    { id: 'wl_karma_white',
      copy: 'Beings rise along the light half of the ring. This is the painter’s account of virtuous action and its results.' },
    { id: 'wl_karma_black',
      copy: 'On the dark half, beings fall. Read the two halves together as the results of action, between the poisons at the hub and the realms outside.' },
    { id: 'wl_realm_gods',
      copy: 'The gods enjoy a fortunate rebirth, yet remain inside the wheel. Look at the richness of their surroundings and their place beside the asuras.' },
    { id: 'wl_realm_asuras',
      copy: 'The asuras contend with the gods. The scenes of conflict distinguish this realm from the pleasures immediately above it.' },
    { id: 'wl_realm_humans',
      copy: 'Human life appears in ordinary work, settlements and religious practice. The relief brings the teaching into a recognizable human landscape.' },
    { id: 'wl_realm_animals',
      copy: 'Animals occupy land and water. Their realm is one of the six kinds of birth shown within the wheel.' },
    { id: 'wl_realm_pretas',
      copy: 'The hungry ghosts are pictured through hunger, thirst and frustrated attempts to find relief. Open the entry to examine the individual scenes.' },
    { id: 'wl_realm_hells',
      copy: 'The lower part of the wheel shows the hell realms. Its separate scenes depict forms of suffering and the consequences of harmful action.' },
    { id: 'wl_nidanas',
      copy: 'Twelve scenes run around the rim. They picture dependent arising, from ignorance through birth to aging and death. Each scene has its own entry.' },
    { id: 'wl_yama_head',
      copy: 'The Lord of Death holds the entire wheel. Even the highest worldly rebirth remains subject to change and impermanence.' },
    { id: 'wl_beyond_buddha',
      copy: 'Outside the wheel a buddha points the way beyond it. The teaching offers a way out of the cycle shown in the picture.' }
  ]
};

/* Timed playback is separate from rendering and from the recitation timer.
 * A stopped or hidden presentation never catches up by skipping slides. */
export function createPresentationPlayer({ clock = globalThis, onVisit = () => {}, onState = () => {} } = {}) {
  let mode = null, length = 0, index = 0, playing = false, seconds = 12, timer = null;
  const state = () => ({ active: mode !== null, mode, length, index, playing, seconds });
  const clear = () => { if (timer !== null) clock.clearTimeout(timer); timer = null; };
  const emit = () => onState(state());
  const schedule = () => {
    clear();
    if (!playing || mode === null) return;
    timer = clock.setTimeout(() => {
      timer = null;
      if (!playing || mode === null) return;
      if (index >= length - 1) { playing = false; emit(); return; }
      index++;
      onVisit(state());
      if (index === length - 1) playing = false;
      emit(); schedule();
    }, seconds * 1000);
  };
  const pause = () => { clear(); playing = false; emit(); };
  const go = (next, autoplay = false) => {
    if (mode === null) return;
    clear(); playing = autoplay;
    index = Math.max(0, Math.min(length - 1, Number.isFinite(next) ? Math.floor(next) : 0));
    onVisit(state()); emit(); schedule();
  };
  return {
    state, pause, go,
    start(nextMode, count, at = 0) {
      clear(); mode = nextMode; length = Math.max(1, count); go(at);
    },
    stop() { clear(); mode = null; playing = false; emit(); },
    play() {
      if (mode === null) return;
      if (index === length - 1) index = 0;
      playing = true; onVisit(state()); emit(); schedule();
    },
    toggle() { if (playing) pause(); else this.play(); },
    restart() { go(0); },
    setSeconds(value) {
      if (![8, 12, 20].includes(Number(value))) return;
      seconds = Number(value); emit(); schedule();
    }
  };
}
