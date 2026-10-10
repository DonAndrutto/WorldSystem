// Shared atlas metadata keeps setup, portraits, board pieces and billboards aligned.
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
export function paintPlayer(el, player) {
  const n = skinIndex(player.skin);
  el.classList.add('player-art');
  const {url, columns, rows, cell} = skinAtlas(n);
  el.style.setProperty('--skin-image', `url("${url}")`);
  el.style.setProperty('--skin-size', `${columns * 100}% ${rows * 100}%`);
  el.style.setProperty('--skin-x', (cell % columns) / (columns - 1) * 100 + '%');
  el.style.setProperty('--skin-y', rows > 1 ? Math.floor(cell / columns) / (rows - 1) * 100 + '%' : '0%');
  el.style.setProperty('--player-colour', PLAYER_PALETTE[player.colour] || PLAYER_PALETTE[player.i % 4]);
}
export function createPlayerArt(THREE, tokens, size, invalidate) {
  let state = 'idle', currentPlayers = []; 
  const maps = [], sprites = [];
  function sync(players) {
    currentPlayers = players;
    players.forEach((p, i) => {
      const token = tokens[i], colour = PLAYER_PALETTE[p.colour] || PLAYER_PALETTE[i];
      token.children.slice(0, 6).forEach(child => child.material?.color?.set(colour));
      if (sprites[i]) {
        sprites[i].material.map = maps[skinIndex(p.skin)];
        sprites[i].userData.square = p.pos;
      }
    });
  }
  function load(players) {
    sync(players);
    if (state === 'loading' || state === 'ready') return;
    state = 'loading';
    const loader = new THREE.TextureLoader();
    Promise.all([PLAYER_ATLAS, MONASTIC_ATLAS].map(url => loader.loadAsync(url))).then(textures => {
      textures.forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; });
      PLAYER_SKINS.forEach((skin, i) => {
        const {columns, rows, cell} = skinAtlas(i);
        const map = textures[i < 12 ? 0 : 1].clone();
        map.repeat.set(1 / columns, 1 / rows);
        map.offset.set((cell % columns) / columns, 1 - (Math.floor(cell / columns) + 1) / rows);
        map.needsUpdate = true;
        maps.push(map);
      });
      tokens.forEach((token, i) => {
        const material = new THREE.SpriteMaterial({ map: maps[0], transparent: true, alphaTest: .08, depthWrite: false, depthTest: false });
        const sprite = new THREE.Sprite(material);
        // Like the existing colour rings, game pieces remain legible over terrain.
        // This does not hide, clip or change the world beneath them.
        sprite.renderOrder = 10;
        sprite.scale.set(size * .15, size * .30, 1);
        sprite.position.y = size * .145;
        token.add(sprite);
        token.children[4].scale.setScalar(.7);
        token.userData.halo.scale.setScalar(.7);
        // Keep the colour ring and turn halo as redundant player identifiers.
        token.children.slice(0, 4).forEach(child => { child.visible = false; });
        sprites[i] = sprite;
      });
      state = 'ready'; sync(currentPlayers); invalidate();
    }).catch(() => { state = 'failed'; });
  }
  return { load, sync };
}
