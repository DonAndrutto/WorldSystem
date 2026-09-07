/* Modern painted offering cards, not scans or 3D sculptures. See ARTWORK.md.
 * Three shared textures; UVs select cards without duplicating image memory. */
const atlas = name => new URL('./assets/offerings/' + name + '.webp', import.meta.url).href;
const royals = atlas('royal-atlas'), goddesses = atlas('goddess-atlas'), treasures = atlas('treasure-atlas');
const records = [
  ['treasure_mountain', treasures, 0, 'A craggy mountain of gold, silver, crystal and lapis'],
  ['treasure_tree', treasures, 1, 'A wish-fulfilling tree hung with jewels and silks'],
  ['treasure_cow', treasures, 2, 'A white cow with a jewelled collar'],
  ['treasure_harvest', treasures, 3, 'Ripe grain growing without cultivation'],
  ['emblem_wheel', royals, 0, 'A radiant golden royal wheel with an elaborate stand'],
  ['emblem_jewel', royals, 1, 'A blue wish-fulfilling jewel surrounded by coloured radiance'],
  ['emblem_queen', royals, 2, 'A queen in silk and jewels holding a lotus'],
  ['emblem_minister', royals, 3, 'A royal minister holding a treasure casket'],
  ['emblem_elephant', royals, 4, 'A white elephant with two tusks and a jewelled harness'],
  ['emblem_horse', royals, 5, 'A white horse with a flowing mane and brocade saddle cloth'],
  ['emblem_general', royals, 6, 'A commander in lamellar armour with sword and shield'],
  ['emblem_vase', royals, 7, 'A golden treasure vase with jewels and silk ribbons'],
  ['goddess_lasya', goddesses, 0, 'Graceful bearing, expressed through posture and empty hands'],
  ['goddess_mala', goddesses, 1, 'A garland offered in both hands'],
  ['goddess_gita', goddesses, 2, 'Song, expressed by a singing figure'],
  ['goddess_nritya', goddesses, 3, 'Dance, with a raised leg and expressive gestures'],
  ['goddess_pushpa', goddesses, 4, 'A bowl of fresh blossoms'],
  ['goddess_dhupa', goddesses, 5, 'An incense censer with rising smoke'],
  ['goddess_aloka', goddesses, 6, 'A golden butter lamp with a single flame'],
  ['goddess_gandha', goddesses, 7, 'Scented water offered in a conch shell'],
  ['sun', treasures, 4, 'A radiant red and gold solar disc'],
  ['moon', treasures, 5, 'A luminous white lunar disc'],
  ['mandala_parasol', treasures, 6, 'A white silk parasol with pearl festoons and a jewel finial'],
  ['mandala_banner', treasures, 7, 'A cylindrical victory standard with layered silks and streamers']
];
export const OFFERING_ART = new Map(records.map(([id, url, cell, attribute]) => [id, {url, cell, attribute}]));

export function createOfferingModels(THREE, palette, onStatus = () => {}) {
  const models = new Map(), sheets = new Map();
  for (const url of [royals, goddesses, treasures]) sheets.set(url, {state: 'idle', materials: []});
  const report = () => onStatus([...sheets.values()].map(s => s.state));
  // Defer loading until the first offering view. Retry only failed sheets.
  models.load = () => {
    sheets.forEach((sheet, url) => {
      if (sheet.state === 'loading' || sheet.state === 'ready') return;
      sheet.state = 'loading';
      new THREE.TextureLoader().load(url, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        sheet.materials.forEach(material => {
          material.map = texture;
          material.color.setHex(0xffffff);
          material.needsUpdate = true;
        });
        sheet.state = 'ready'; report();
      }, undefined, () => { sheet.state = 'failed'; report(); });
    });
    report();
  };
  OFFERING_ART.forEach((art, id) => {
    const group = new THREE.Group();
    group.name = 'offering_' + id;
    group.userData.attribute = art.attribute;
    group.userData.illustration = true;
    const card = new THREE.Group();
    card.rotation.x = -Math.PI / 2;
    group.add(card);
    const backing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 1, 0.012), palette.goldDeep);
    backing.name = id; backing.userData.offering = true;
    card.add(backing);
    const geometry = new THREE.PlaneGeometry(0.73, 0.98);
    const uv = geometry.getAttribute('uv');
    const col = art.cell % 4, row = Math.floor(art.cell / 4);
    const insetU = 0.5 / 1536, insetV = 0.5 / 1024;
    for (let i = 0; i < uv.count; i++) uv.setXY(i,
      col / 4 + insetU + uv.getX(i) * (1 / 4 - 2 * insetU),
      (1 - (row + 1) / 2) + insetV + uv.getY(i) * (1 / 2 - 2 * insetV));
    const material = new THREE.MeshBasicMaterial({color: 0x14212c, toneMapped: false});
    sheets.get(art.url).materials.push(material);
    const face = new THREE.Mesh(geometry, material);
    face.position.z = 0.007; face.name = id;
    face.userData.offering = true; face.userData.artwork = true;
    card.add(face);
    models.set(id, group);
  });
  return models;
}
