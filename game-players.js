// Shared atlas metadata keeps setup, portraits, board pieces and billboards aligned.
import { BY_N } from './rebirth-board.js';
import { createMoodFaces, moodOf } from './player-moods.js';
const LAY_CULTURES = ['Bhutanese', 'Tibetan', 'Indian', 'Chinese', 'Thai', 'Western'];
export const PLAYER_CULTURES = [...LAY_CULTURES, 'Monastic'];
export const PLAYER_SKINS = ['male', 'female'].flatMap(gender => LAY_CULTURES.map(culture => ({
  id: culture.toLowerCase() + '-' + gender, culture, gender,
  name: culture + ' · ' + (gender === 'male' ? 'Male' : 'Female')
}))).concat([
  { id: 'monastic-male', culture: 'Monastic', gender: 'male', role: 'Monk', name: 'Monk · Tibetan Vajrayana' },
  { id: 'monastic-female', culture: 'Monastic', gender: 'female', role: 'Nun', name: 'Nun · Tibetan Vajrayana' }
]);
const LEGACY_SKINS = { ochre: 'bhutanese-male', sage: 'tibetan-male', indigo: 'chinese-male',
  terracotta: 'bhutanese-female', plum: 'indian-female', teal: 'tibetan-female' };
// Preserve the gender of existing saves while migrating the original six skins.
export function normalizeSkin(id, player = 0) {
  return PLAYER_SKINS.find(s => s.id === id || s.id === LEGACY_SKINS[id])?.id
    || PLAYER_SKINS[[0, 6, 1, 7][player % 4]].id;
}
export const PLAYER_PALETTE = ['#bb6249', '#428b90', '#bc9236', '#8870b0'];
export const PLAYER_ATLAS = 'assets/rebirth/travelers.png';
export const MONASTIC_ATLAS = 'assets/rebirth/monastics.png';
export const skinAtlas = n => n < 12
  ? { url: PLAYER_ATLAS, columns: 6, rows: 2, cell: n }
  : { url: MONASTIC_ATLAS, columns: 2, rows: 1, cell: n - 12 };
export const skinIndex = skin => PLAYER_SKINS.findIndex(s => s.id === normalizeSkin(skin));
/* The faces in their moods (player-moods.js), shared by every portrait and
   every figure in the world. Nothing is loaded until a game asks for it. */
export const moodFaces = createMoodFaces(skinAtlas);
export const playerMood = (player) => (player && player.pos ? moodOf(BY_N.get(player.pos)) : null);

/* A portrait: the traveller's cell of the atlas, or, once a traveller is on
   the board and their face has been painted for the mood of the place, that
   face. `data-mood` lets the page draw the aura of the path round it. */
export function paintPlayer(el, player) {
  const n = skinIndex(player.skin);
  el.classList.add('player-art');
  const mood = playerMood(player);
  const face = mood && moodFaces.url(n, mood);
  if (mood) el.dataset.mood = mood; else delete el.dataset.mood;
  if (face) {
    el.style.setProperty('--skin-image', `url("${face}")`);
    el.style.setProperty('--skin-size', '100% 100%');
    el.style.setProperty('--skin-x', '0%');
    el.style.setProperty('--skin-y', '0%');
  } else {
    const {url, columns, rows, cell} = skinAtlas(n);
    el.style.setProperty('--skin-image', `url("${url}")`);
    el.style.setProperty('--skin-size', `${columns * 100}% ${rows * 100}%`);
    el.style.setProperty('--skin-x', (cell % columns) / (columns - 1) * 100 + '%');
    el.style.setProperty('--skin-y', rows > 1 ? Math.floor(cell / columns) / (rows - 1) * 100 + '%' : '0%');
  }
  el.style.setProperty('--player-colour', PLAYER_PALETTE[player.colour] || PLAYER_PALETTE[player.i % 4]);
}

// a soft gold light with faint rays, for the aura of the path
function auraTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 256;
  const g = canvas.getContext('2d');
  if (!g) return null;
  g.translate(64, 120);
  g.scale(1, 1.9);
  const light = g.createRadialGradient(0, 0, 0, 0, 0, 62);
  light.addColorStop(0, 'rgba(255,246,214,0.95)');
  light.addColorStop(0.45, 'rgba(255,222,140,0.55)');
  light.addColorStop(1, 'rgba(255,205,110,0)');
  g.fillStyle = light;
  g.beginPath(); g.arc(0, 0, 62, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(255,232,160,0.5)';
  for (let i = 0; i < 24; i += 1) {
    const a = i / 24 * Math.PI * 2;
    g.lineWidth = i % 2 ? 1 : 2;
    g.beginPath(); g.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); g.lineTo(Math.cos(a) * 60, Math.sin(a) * 60); g.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/* The travellers standing in the world: each a picture that turns to the eye,
   painted in the mood of the square they stand on, with the aura of the path
   behind them while they are on it. `onFaces` is told when the faces have
   come, so that the portraits on the page can take them up too. */
export function createPlayerArt(THREE, tokens, size, invalidate, onFaces = () => {}) {
  let state = 'idle', currentPlayers = [], aura = null;
  const maps = [], sprites = [], auras = [], textures = new Map();
  // the face in its mood, or, where it cannot be painted, the atlas's own cell
  function texture(n, mood) {
    const key = n + ':' + mood;
    if (textures.has(key)) return textures.get(key);
    const canvas = moodFaces.canvas(n, mood);
    if (!canvas) return maps[n] || null;
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    textures.set(key, map);
    return map;
  }
  function sync(players) {
    currentPlayers = players;
    players.forEach((p, i) => {
      const token = tokens[i], colour = PLAYER_PALETTE[p.colour] || PLAYER_PALETTE[i];
      token.children.slice(0, 6).forEach(child => child.material?.color?.set(colour));
      if (!sprites[i]) return;
      const mood = playerMood(p) || 'neutral';
      const map = texture(skinIndex(p.skin), mood);
      if (map && sprites[i].material.map !== map) { sprites[i].material.map = map; sprites[i].material.needsUpdate = true; }
      sprites[i].userData.square = p.pos;
      auras[i].visible = mood === 'serene';
    });
  }
  function load(players) {
    sync(players);
    if (state === 'loading' || state === 'ready') return;
    state = 'loading';
    const loader = new THREE.TextureLoader();
    Promise.all([PLAYER_ATLAS, MONASTIC_ATLAS].map(url => loader.loadAsync(url))).then(atlases => {
      atlases.forEach((atlas, i) => {
        atlas.colorSpace = THREE.SRGBColorSpace;
        moodFaces.adopt([PLAYER_ATLAS, MONASTIC_ATLAS][i], atlas.image);
      });
      PLAYER_SKINS.forEach((skin, i) => {
        const {columns, rows, cell} = skinAtlas(i);
        const map = atlases[i < 12 ? 0 : 1].clone();
        map.repeat.set(1 / columns, 1 / rows);
        map.offset.set((cell % columns) / columns, 1 - (Math.floor(cell / columns) + 1) / rows);
        map.needsUpdate = true;
        maps.push(map);
      });
      aura = auraTexture(THREE);
      tokens.forEach((token, i) => {
        const material = new THREE.SpriteMaterial({ map: maps[0], transparent: true, alphaTest: .08, depthWrite: false, depthTest: false });
        const sprite = new THREE.Sprite(material);
        // Like the existing colour rings, game pieces remain legible over terrain.
        // This does not hide, clip or change the world beneath them.
        sprite.renderOrder = 10;
        // About the height of the square's own model, so the traveller stands
        // beside the destination at its own scale rather than towering over it.
        sprite.scale.set(size * .075, size * .15, 1);
        sprite.position.y = FIGURE_LIFT * size;
        // the aura of the path, behind the figure
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: aura, transparent: true, depthWrite: false, depthTest: false }));
        glow.renderOrder = 9;
        glow.scale.set(size * .16, size * .24, 1);
        glow.visible = false;
        token.add(glow, sprite);
        token.children[4].scale.setScalar(.7);
        token.userData.halo.scale.setScalar(.7);
        // Keep the colour ring and turn halo as redundant player identifiers.
        token.children.slice(0, 4).forEach(child => { child.visible = false; });
        sprites[i] = sprite;
        auras[i] = glow;
      });
      state = 'ready'; sync(currentPlayers); invalidate(); onFaces();
    }).catch(() => { state = 'failed'; });
  }
  /* A traveller steps aside of the square's model, to the viewer's right,
     so that the figure and the place it has come to are seen together.
     `aside(square)` says how far, in the world's units: nothing where the
     square has no model to stand clear of. */
  const right = new THREE.Vector3(), inverse = new THREE.Matrix4();
  function stand(camera, aside) {
    sprites.forEach((sprite, i) => {
      if (!sprite || !tokens[i].visible) return;
      const step = aside(sprite.userData.square) || 0;
      right.setFromMatrixColumn(camera.matrixWorld, 0).setY(0);
      if (!step || right.lengthSq() < 1e-9) sprite.position.set(0, FIGURE_LIFT * size, 0);
      else {
        right.normalize();
        inverse.copy(tokens[i].parent.matrixWorld).invert();
        right.transformDirection(inverse);
        sprite.position.set(right.x * step, FIGURE_LIFT * size, right.z * step);
      }
      // the aura stands behind the figure, its middle at the figure's heart
      auras[i].position.copy(sprite.position).y += size * .012;
    });
  }
  return { load, sync, stand, figure: (i) => sprites[i] || null };
}
const FIGURE_LIFT = .0725;
