/* What the game draws on top of its squares, one switch for each thing, and how
   the choice is kept. No DOM here: the page owns what each layer does, this owns
   what the layers are, where each one is drawn, and what is written down.

   Five layers, each independent of the others and of everything else:

     names       the name of a field — in a cell of the board, and in the label the
                 world sets beside the selected field. WHICH name (the interface's
                 language or the Tibetan) is the separate Names setting, `ws-tibetan`.
     numbers     the number of a field, in the same two places.
     highlights  what says "this one": the selected field's frame and the frames of
                 the fields its faces lead to on the board; in the world, the
                 selected field's standing forward, the gold of a visit and its ring.
     guides      the world's structural route guides: the thread along each strand of
                 the helix (the tantric and the sūtra routes) and the circle through
                 each ring and the crown. They are the figure, not the game.
     links       the world's possible-move links: a line from the selected field to
                 each field a throw from it could reach. They change with the selection.

   The traveller's history is not a layer: it is the trail of chips and the move
   log in the rail, which are text, not an overlay, and stay.

   A switch only ever changes what is drawn. The squares keep their accessible
   names (a hidden label is hidden visually, not removed), the players, whose turn
   it is and where each stands are always shown, and nothing here is written into
   a saved game: the choice has a key of its own (`ws-game-display`), kept as the
   list of layers that are OFF — so a layer added later is on for everyone, a saved
   choice of a layer since removed is ignored, and no key at all is the old
   behaviour, everything shown. */
export const DISPLAY_KEY = 'ws-game-display';
export const DISPLAY_LAYERS = Object.freeze(['names', 'numbers', 'highlights', 'guides', 'links']);
/* where each layer is drawn: the board, the world, or both */
export const DISPLAY_SCOPE = Object.freeze({
  names: Object.freeze(['board', 'world']),
  numbers: Object.freeze(['board', 'world']),
  highlights: Object.freeze(['board', 'world']),
  guides: Object.freeze(['world']),
  links: Object.freeze(['world'])
});
export const DISPLAY_DEFAULTS = Object.freeze(Object.fromEntries(DISPLAY_LAYERS.map((layer) => [layer, true])));

/* What was written, read leniently: anything that is not a list of layer names
   is no choice at all, and every layer not named is shown. */
export function parseDisplay(raw) {
  const state = { ...DISPLAY_DEFAULTS };
  let parsed = null;
  try { parsed = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return state; }
  const off = parsed && typeof parsed === 'object' && Array.isArray(parsed.off) ? parsed.off : [];
  for (const layer of off) if (DISPLAY_LAYERS.includes(layer)) state[layer] = false;
  return state;
}

/* Only the layers that are off are written, and nothing at all when all are on. */
export function serializeDisplay(state) {
  const off = DISPLAY_LAYERS.filter((layer) => state[layer] === false);
  return off.length ? JSON.stringify({ v: 1, off }) : null;
}

export function readDisplay(storage) {
  let raw = null;
  try { raw = storage.getItem(DISPLAY_KEY); } catch { /* storage unavailable: the defaults */ }
  return parseDisplay(raw);
}

export function writeDisplay(storage, state) {
  try {
    const text = serializeDisplay(state);
    if (text === null) storage.removeItem(DISPLAY_KEY); else storage.setItem(DISPLAY_KEY, text);
    return true;
  } catch { return false; }
}

/* The classes the page puts on <body>; the style sheets key off these alone. */
export const displayClasses = (state) => DISPLAY_LAYERS.filter((layer) => state[layer] === false).map((layer) => 'gd-no-' + layer);
