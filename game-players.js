// One atlas shared by setup, portraits, board pieces and world billboards.
export const PLAYER_CULTURES = ['Bhutanese', 'Tibetan', 'Indian', 'Chinese', 'Thai', 'Western'];
export const PLAYER_SKINS = ['male', 'female'].flatMap(gender => PLAYER_CULTURES.map(culture => ({
  id: culture.toLowerCase() + '-' + gender, culture, gender,
  name: culture + ' · ' + (gender === 'male' ? 'Male' : 'Female')
})));
const LEGACY_SKINS = { ochre: 'bhutanese-male', sage: 'tibetan-male', indigo: 'chinese-male',
  terracotta: 'bhutanese-female', plum: 'indian-female', teal: 'tibetan-female' };
// Preserve the gender of existing saves while migrating the original six skins.
export function normalizeSkin(id, player = 0) {
  return PLAYER_SKINS.find(s => s.id === id || s.id === LEGACY_SKINS[id])?.id
    || PLAYER_SKINS[[0, 6, 1, 7][player % 4]].id;
}
export const PLAYER_PALETTE = ['#bb6249', '#428b90', '#bc9236', '#8870b0'];
export const PLAYER_ATLAS = 'assets/rebirth/travelers.png';
export const skinIndex = skin => PLAYER_SKINS.findIndex(s => s.id === normalizeSkin(skin));
export function paintPlayer(el, player) {
  const n = skinIndex(player.skin);
  el.classList.add('player-art');
  el.style.setProperty('--skin-x', (n % 6) * 20 + '%');
  el.style.setProperty('--skin-y', Math.floor(n / 6) * 100 + '%');
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
    new THREE.TextureLoader().load(PLAYER_ATLAS, texture => {
      texture.colorSpace = THREE.SRGBColorSpace;
      for (let i = 0; i < 12; i++) {
        const map = texture.clone();
        map.repeat.set(1 / 6, 1 / 2);
        map.offset.set((i % 6) / 6, 1 / 2 - Math.floor(i / 6) / 2);
        map.needsUpdate = true;
        maps.push(map);
      }
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
    }, undefined, () => { state = 'failed'; });
  }
  return { load, sync };
}
