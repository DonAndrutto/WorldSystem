// Procedural terrain and water for the existing world diagram. All detail is
// static, deterministic, and local; orbiting light supplies the changing glints.
const TAU = Math.PI * 2;
const clamp = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));
const smooth = (v) => { const t = clamp(v); return t * t * (3 - 2 * t); };

function periodicNoise(turn, cells, seed) {
  const x = ((turn % 1 + 1) % 1) * cells;
  const i = Math.floor(x), f = smooth(x - i);
  const sample = (n) => {
    const s = Math.sin((n % cells) * 127.1 + seed * 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  return sample(i) * (1 - f) + sample(i + 1) * f;
}

// Weld only the normals at the duplicated closing column. Position and colour
// already match exactly, and the UVs remain separate for normal-map wrapping.
function closeNormals(geometry, columns, rows) {
  geometry.computeVertexNormals();
  const n = geometry.attributes.normal;
  for (let row = 0; row < rows; row++) {
    const first = row * columns, last = first + columns - 1;
    const x = n.getX(first) + n.getX(last);
    const y = n.getY(first) + n.getY(last);
    const z = n.getZ(first) + n.getZ(last);
    const length = Math.hypot(x, y, z) || 1;
    n.setXYZ(first, x / length, y / length, z / length);
    n.setXYZ(last, x / length, y / length, z / length);
  }
}

export function createGoldenRangeGeometry(THREE, { inner, outer, top, seat, peaks }) {
  const segments = peaks * 14, columns = segments + 1;
  const steps = [0, 0.035, 0.12, 0.23, 0.35, 0.43, 0.49, 0.56, 0.67, 0.79, 0.90, 0.965, 1];
  const positions = [], colours = [], uvs = [], indices = [];
  const low = new THREE.Color(0x936022), middle = new THREE.Color(0xc59643);
  const high = new THREE.Color(0xf1d68d), colour = new THREE.Color();
  const width = outer - inner;
  for (let row = 0; row < steps.length; row++) {
    const u = steps[row];
    for (let column = 0; column <= segments; column++) {
      // Use zero at the closing column, rather than atan2 or fractional
      // harmonics, so every range closes without a discontinuity.
      const turn = column === segments ? 0 : column / segments;
      const a = turn * TAU;
      const broad = periodicNoise(turn, peaks, peaks);
      const fine = periodicNoise(turn, peaks * 3, peaks + 7);
      const crestHeight = 0.75 + broad * 0.18 + fine * 0.07;
      const crest = 0.46 + periodicNoise(turn, 7, peaks + 2) * 0.075;
      const radial = u <= 0.49 ? u / 0.49 * crest
        : crest + (u - 0.49) / 0.51 * (1 - crest);
      // Width-relative offsets cannot push the narrow outer ranges into a sea.
      const fold = Math.sin(a * peaks * 2 + u * 5 + broad) * 0.014 * Math.sin(Math.PI * u);
      const radius = inner + width * clamp(radial + fold);
      const slope = u <= 0.49 ? u / 0.49 : (1 - u) / 0.51;
      const gully = Math.pow(0.5 + 0.5 * Math.sin(a * peaks * 2 + u * 6 + broad * 2), 5);
      let height = top * crestHeight * Math.pow(slope, 1.45)
        * (1 - gully * 0.28 * Math.sin(Math.PI * slope)) - 0.004;
      if (row === 0 || row === steps.length - 1) height = seat;
      else if (row === 1 || row === steps.length - 2) height = -0.012;
      positions.push(Math.sin(a) * radius, height, Math.cos(a) * radius);
      uvs.push(column / segments, u);

      const elevation = clamp(height / top);
      const warmth = clamp(elevation * 0.88 + 0.12 - gully * 0.07 + fine * 0.035);
      if (warmth < 0.48) colour.lerpColors(low, middle, warmth / 0.48);
      else colour.lerpColors(middle, high, (warmth - 0.48) / 0.52);
      colours.push(colour.r, colour.g, colour.b);
    }
  }
  for (let row = 0; row < steps.length - 1; row++) {
    for (let column = 0; column < segments; column++) {
      const a = row * columns + column, b = a + columns;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colours, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  closeNormals(geometry, columns, steps.length);
  geometry.computeBoundingSphere();
  return geometry;
}

export function createWaterNormalMap(THREE) {
  const size = 128, data = new Uint8Array(size * size * 4);
  // Integer spatial frequencies tile continuously in both directions.
  const height = (u, v) => Math.sin(TAU * (3 * u + 2 * v) + 0.45 * Math.sin(TAU * (u - v))) * 0.55
    + Math.sin(TAU * (7 * u - 4 * v) + 0.3 * Math.sin(TAU * (2 * u + v))) * 0.28
    + Math.sin(TAU * (13 * u + 9 * v)) * 0.12;
  const d = 1 / size;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const u = x / size, v = y / size;
    const nx = (height(u - d, v) - height(u + d, v)) * 1.3;
    const ny = (height(u, v - d) - height(u, v + d)) * 1.3;
    const length = Math.hypot(nx, ny, 1), offset = (y * size + x) * 4;
    data[offset] = Math.round((nx / length * 0.5 + 0.5) * 255);
    data[offset + 1] = Math.round((ny / length * 0.5 + 0.5) * 255);
    data[offset + 2] = Math.round((1 / length * 0.5 + 0.5) * 255);
    data[offset + 3] = 255;
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.name = 'water_ripples';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.generateMipmaps = true;
  texture.needsUpdate = true;
  return texture;
}

export function createWaterMaterial(THREE, { name, normalMap, salt = false }) {
  return Object.assign(new THREE.MeshPhysicalMaterial({
    color: 0xffffff, vertexColors: true, metalness: 0, roughness: salt ? 0.26 : 0.20,
    transparent: true, opacity: salt ? 0.94 : 0.88,
    depthWrite: false, side: THREE.DoubleSide, forceSinglePass: true,
    normalMap, normalScale: new THREE.Vector2(salt ? 0.48 : 0.3, salt ? 0.48 : 0.3),
    ior: 1.333, clearcoat: 0.35, clearcoatRoughness: 0.22, specularIntensity: 0.85
  }), { name });
}

export function createWaterGeometry(THREE, { inner, outer, amplitude, rings, shores, salt = false }) {
  const segments = 320;
  const geometry = new THREE.RingGeometry(inner, outer, segments, rings);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.attributes.position, uv = geometry.attributes.uv;
  const colours = new Float32Array(position.count * 3);
  const deep = new THREE.Color(salt ? 0x103e62 : 0x287e89);
  const shallow = new THREE.Color(salt ? 0x58a8ae : 0x85cec4);
  const colour = new THREE.Color();
  for (let row = 0; row <= rings; row++) for (let column = 0; column <= segments; column++) {
    const i = row * (segments + 1) + column;
    // Copy the first column's XY coordinates to close the floating-point seam.
    const first = row * (segments + 1);
    const x = position.getX(column === segments ? first : i);
    const z = position.getZ(column === segments ? first : i);
    const radius = Math.hypot(x, z);
    let shoreDistance = Math.min(Math.abs(radius - inner), Math.abs(outer - radius));
    for (const [start, end] of shores) {
      const distance = radius < start ? start - radius : radius > end ? radius - end : 0;
      shoreDistance = Math.min(shoreDistance, distance);
    }
    const shoal = Math.exp(-shoreDistance / (salt ? 0.055 : 0.018));
    const waves = Math.sin(x * 74 + z * 32) * 0.5
      + Math.sin(-x * 41 + z * 68 + 0.8) * 0.3
      + Math.sin(x * 118 - z * 57 + Math.sin(z * 23)) * 0.2;
    position.setXYZ(i, x, amplitude * waves * smooth(shoreDistance / 0.012), z);
    // World-space UVs keep wave detail the same size across both bodies of water.
    uv.setXY(i, x * 5, -z * 5);
    colour.lerpColors(deep, shallow, clamp(shoal * 0.86 + waves * 0.035));
    colours[i * 3] = colour.r; colours[i * 3 + 1] = colour.g; colours[i * 3 + 2] = colour.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  closeNormals(geometry, segments + 1, rings + 1);
  return geometry;
}
