/* Architectural detail for the Thirty-three's summit. These are illustrative
   additions to the existing drawing, not measured reconstructions. Repeated
   pieces are baked into one mesh per material and selectable entry: a garden
   or a carved storey therefore costs a few draw calls, not hundreds. No new
   textures, animation, or materials are needed. */
export function createSummitDetail(THREE, {
  materials: M, y, yv, summit, cityTop, cityHalf: CITY, hallHalf: HALL,
  parkRadius: PARK, flaredRoof
}) {
  const root = new THREE.Group();
  root.name = 'summit_detail';
  const bins = new Map();
  const transform = new THREE.Object3D(), point = new THREE.Vector3();
  const normal = new THREE.Vector3(), normals = new THREE.Matrix3();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const shaft = new THREE.CylinderGeometry(0.72, 1, 1, 8);
  const orb = new THREE.SphereGeometry(1, 10, 6);
  const jewel = new THREE.OctahedronGeometry(1);
  const temporary = [box, shaft, orb, jewel];
  function bake(geometry, material, name, matrix) {
    if (!bins.has(name)) bins.set(name, new Map());
    const entries = bins.get(name);
    if (!entries.has(material)) entries.set(material, { positions: [], normals: [], indices: [] });
    const out = entries.get(material), offset = out.positions.length / 3;
    const p = geometry.attributes.position, n = geometry.attributes.normal;
    normals.getNormalMatrix(matrix);
    for (let i = 0; i < p.count; i++) {
      point.fromBufferAttribute(p, i).applyMatrix4(matrix);
      normal.fromBufferAttribute(n, i).applyNormalMatrix(normals);
      out.positions.push(point.x, point.y, point.z);
      out.normals.push(normal.x, normal.y, normal.z);
    }
    const indices = geometry.index;
    for (let i = 0; i < (indices ? indices.count : p.count); i++) {
      out.indices.push(offset + (indices ? indices.getX(i) : i));
    }
  }
  function put(geometry, material, name, x, h, z, sx, sy, sz, angle = 0) {
    transform.position.set(x, h, z);
    transform.scale.set(sx, sy, sz);
    transform.rotation.set(0, angle, 0);
    transform.updateMatrix();
    bake(geometry, material, name, transform.matrix);
  }
  // Place a piece in a cardinal side's frame; +z always faces outwards.
  function side(geometry, material, name, angle, x, h, z, sx, sy, sz) {
    put(geometry, material, name,
      x * Math.cos(angle) + z * Math.sin(angle), h,
      -x * Math.sin(angle) + z * Math.cos(angle), sx, sy, sz, angle);
  }
  function beam(material, name, from, to, thickness) {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    transform.position.copy(a).add(b).multiplyScalar(0.5);
    transform.scale.set(thickness, a.distanceTo(b), thickness);
    transform.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.sub(a).normalize());
    transform.updateMatrix();
    bake(box, material, name, transform.matrix);
  }
  function roof(half, rise, material, x, h, z, name, options) {
    const model = flaredRoof(half, rise, material, { ...options, across: 3, up: 3 });
    model.position.set(x, h, z);
    model.updateMatrixWorld(true);
    model.traverse(o => {
      if (!o.isMesh) return;
      bake(o.geometry, o.material, name, o.matrixWorld);
      o.geometry.dispose();
    });
  }

  const cityName = 'sudarshana_city';
  const wallTop = cityTop + yv(2600), gateHalf = CITY * 0.24;
  for (let s = 0; s < 4; s++) {
    const angle = s * Math.PI / 2;
    // Stepped coping, recessed wall panels and pearl merlons leave the
    // original four gate openings clear right down to the paving.
    for (const sign of [-1, 1]) {
      const middle = sign * CITY * 0.62, length = CITY * 0.76;
      side(box, M.gold, cityName, angle, middle, wallTop, CITY,
        length, yv(420), y(1950));
      side(box, M.indigo, cityName, angle, middle, cityTop + yv(1120), CITY + y(770),
        length * 0.91, yv(860), y(180));
      for (let i = 0; i < 6; i++) {
        const x = sign * CITY * (0.31 + i * 0.116);
        side(box, M.gold, cityName, angle, x, cityTop + yv(1120), CITY + y(910),
          y(420), yv(1120), y(250));
        side(box, M.pearl, cityName, angle, x, wallTop + yv(510), CITY,
          y(1600), yv(700), y(1500));
        side(jewel, M.gold, cityName, angle, x, wallTop + yv(940), CITY,
          y(540), yv(270), y(540));
      }
    }
    // Paired gate piers and an open lintel support a small lifted roof.
    for (const sign of [-1, 1]) {
      side(box, M.pearl, cityName, angle, sign * gateHalf, cityTop + yv(1880), CITY,
        y(2100), yv(3760), y(2700));
      side(box, M.gold, cityName, angle, sign * gateHalf, cityTop + yv(3700), CITY,
        y(3000), yv(500), y(3500));
    }
    side(box, M.indigo, cityName, angle, 0, cityTop + yv(3840), CITY,
      gateHalf * 2.35, yv(740), y(4000));
    roof(gateHalf * 1.27, yv(1450), M.celadon,
      Math.sin(angle) * CITY, cityTop + yv(4210), Math.cos(angle) * CITY,
      cityName, { crest: 0.40, lift: 0.30, reach: 0.12 });
    side(jewel, M.gold, cityName, angle, 0, cityTop + yv(6000), CITY,
      y(850), yv(470), y(850));

    // A ceremonial flight meets each opening and reaches the palace plinth.
    const stepRun = y(850), outer = HALL * 1.16 + stepRun * 3;
    for (let i = 0; i < 4; i++) {
      side(box, M.pearl, 'vaijayanta_tier_1', angle, 0,
        cityTop + yv(210 * (i + 1)), outer - stepRun * i,
        HALL * 0.54, yv(420 * (i + 1)), stepRun * 1.08);
      side(box, M.gold, 'vaijayanta_tier_1', angle, 0,
        cityTop + yv(420 * (i + 1)) + yv(35), outer - stepRun * i + stepRun * 0.45,
        HALL * 0.54, yv(70), y(180));
    }
    // The gardens are lower than the city terrace. A second, outward flight
    // bridges that level change instead of leaving the entrance suspended.
    const gardenFloor = summit + yv(3500), entryRise = (cityTop - gardenFloor) / 4;
    for (let i = 0; i < 4; i++) {
      side(box, M.pearl, cityName, angle, 0, gardenFloor + entryRise * (i + 1) / 2,
        CITY + y(300) + stepRun * (3 - i), HALL * 0.44, entryRise * (i + 1), stepRun * 1.08);
    }
    // Low parapets flank the open colonnade; all four central bays remain open.
    for (const sign of [-1, 1]) {
      side(box, M.gold, 'vaijayanta_tier_1', angle, sign * HALL * 0.67,
        cityTop + yv(3100), HALL * 0.96, HALL * 0.55, yv(190), y(420));
      for (let i = 0; i < 5; i++) {
        const x = sign * HALL * (0.41 + i * 0.13);
        side(shaft, M.pearl, 'vaijayanta_tier_1', angle, x, cityTop + yv(2520), HALL * 0.96,
          y(300), yv(1050), y(300));
        side(jewel, M.gold, 'vaijayanta_tier_1', angle, x, cityTop + yv(3240), HALL * 0.96,
          y(380), yv(140), y(380));
      }
    }
  }
  // Small square corner pavilions keep the city legible as architecture in
  // silhouette, without competing with Vaijayanta's three principal roofs.
  for (const x of [-CITY, CITY]) for (const z of [-CITY, CITY]) {
    put(box, M.pearl, cityName, x, cityTop + yv(1850), z,
      y(4600), yv(3700), y(4600));
    put(box, M.indigo, cityName, x, cityTop + yv(3690), z,
      y(5000), yv(420), y(5000));
    roof(y(3300), yv(1500), M.cinnabar, x, cityTop + yv(3920), z,
      cityName, { crest: 0.32, lift: 0.32 });
    put(jewel, M.gold, cityName, x, cityTop + yv(5730), z,
      y(600), yv(370), y(600));
  }

  // Deep window reveals, mullions, sills and friezes follow the original
  // stepping-in storeys. Their dark centres read even when the gold is lit.
  for (const level of [
    { name: 'vaijayanta_tier_2', start: 8900, height: 3400, half: 0.62, width: 0.16, count: 5 },
    { name: 'vaijayanta_tier_3', start: 14500, height: 2600, half: 0.52, width: 0.15, count: 3 }
  ]) {
    const bottom = cityTop + yv(level.start), high = yv(level.height);
    const half = HALL * level.half, windowW = HALL * level.width;
    for (let s = 0; s < 4; s++) {
      const angle = s * Math.PI / 2;
      for (const offset of [0.12, 0.86]) {
        side(box, M.gold, level.name, angle, 0, bottom + high * offset, half + y(100),
          half * 1.98, yv(180), y(370));
      }
      for (let i = 0; i < level.count; i++) {
        const x = (i - (level.count - 1) / 2) * windowW * 1.28;
        const center = bottom + high * 0.49, z = half - HALL * 0.01 + y(150), windowH = high * 0.54;
        side(box, M.indigo, level.name, angle, x, center, z,
          windowW, windowH, y(320));
        for (const sign of [-1, 1]) {
          side(box, M.pearl, level.name, angle, x + sign * windowW * 0.49, center, z + y(210),
            y(260), windowH + yv(160), y(330));
          side(box, M.gold, level.name, angle, x, center + sign * windowH * 0.51, z + y(210),
            windowW + y(400), yv(150), y(430));
        }
        for (const fraction of [-0.2, 0.2]) {
          side(box, M.gold, level.name, angle, x + windowW * fraction, center, z + y(230),
            y(150), windowH, y(250));
          side(box, M.gold, level.name, angle, x, center + windowH * fraction, z + y(230),
            windowW, yv(65), y(250));
        }
        side(jewel, M.cinnabar, level.name, angle, x, bottom + high * 0.89, half + y(380),
          y(430), yv(190), y(190));
      }
    }
  }

  // Gilt tile ribs and eave borders lie on the exact piecewise roof surface
  // used by flaredRoof. Sampling its original nine-by-five grid avoids the
  // ribs disappearing into a curved surface between its vertices.
  const roofLevels = [
    { name: 'vaijayanta_tier_1', half: 1.10, start: 6300, rise: 2600, crest: 0.52, lift: 0.22, reach: 0.10, hollow: 1.6 },
    { name: 'vaijayanta_tier_2', half: 0.86, start: 12300, rise: 2200, crest: 0.46, lift: 0.26, reach: 0.13, hollow: 1.6 },
    { name: 'vaijayanta_tier_3', half: 0.92, start: 17100, rise: 3000, crest: 0.40, lift: 0.52, reach: 0.24, hollow: 1.85 }
  ];
  for (const level of roofLevels) {
    const half = HALL * level.half, rise = yv(level.rise), base = cityTop + yv(level.start);
    const sample = (side, across, up) => {
      const horn = Math.abs(across) ** 4 * (1 - up);
      const width = (half + (half * level.crest - half) * up) * (1 + level.reach * horn);
      const x = across * width, z = width, angle = side * Math.PI / 2;
      return [x * Math.cos(angle) + z * Math.sin(angle),
        base + rise * up ** level.hollow + rise * level.lift * horn + yv(34),
        -x * Math.sin(angle) + z * Math.cos(angle)];
    };
    for (let s = 0; s < 4; s++) for (let c = 0; c < 9; c++) {
      const across = c / 9 * 2 - 1;
      for (let u = 0; u < 5; u++) {
        beam(M.gold, level.name, sample(s, across, u / 5), sample(s, across, (u + 1) / 5), y(140));
      }
      beam(M.gold, level.name, sample(s, across, 0), sample(s, (c + 1) / 9 * 2 - 1, 0), y(310));
    }
    // Four tiny eave pendants hang clear of the body beneath the lifted corners.
    for (let s = 0; s < 4; s++) {
      const [x, h, z] = sample(s, -1, 0);
      put(shaft, M.gold, level.name, x, h - yv(400), z, y(100), yv(700), y(100));
      put(jewel, M.gold, level.name, x, h - yv(840), z, y(420), yv(260), y(420));
    }
  }

  const gardenName = 'nandana', lawnTop = summit + yv(3500);
  const gardenAt = CITY + PARK * 1.15;
  const pondRim = new THREE.TorusGeometry(PARK * 0.45, y(270), 5, 24);
  const lilyPad = new THREE.CylinderGeometry(1, 1, 1, 12);
  pondRim.rotateX(Math.PI / 2);
  temporary.push(pondRim, lilyPad);
  for (let s = 0; s < 4; s++) {
    const angle = s * Math.PI / 2;
    side(pondRim, M.pearl, gardenName, angle, 0, lawnTop + yv(170), gardenAt, 1, 1, 1);
    // The paths approach the pool from the city; planting occupies the outer
    // arc, so the gate's line of sight remains open through each garden.
    side(box, M.pearl, gardenName, angle, 0, lawnTop + yv(50), gardenAt - PARK * 0.72,
      PARK * 0.21, yv(90), PARK * 0.48);
    for (let i = 0; i < 6; i++) {
      const t = -1.50 + i * 0.60, px = Math.sin(t) * PARK * 0.76;
      const pz = gardenAt + Math.cos(t) * PARK * 0.76;
      const height = yv(2000 + (i % 3) * 230), crown = y(1600 + (i % 2) * 250);
      side(shaft, M.wood, gardenName, angle, px, lawnTop + height * 0.45, pz,
        y(230), height * 0.90, y(230));
      for (const [dx, dh, dz, scale] of [[0, 1.14, 0, 1], [-0.6, 0.93, 0.17, 0.74], [0.6, 0.97, 0.10, 0.77], [0, 0.98, -0.50, 0.72]]) {
        side(orb, i % 2 ? M.foliage : M.foliageLit, gardenName, angle,
          px + dx * crown, lawnTop + height * dh, pz + dz * crown,
          crown * scale, crown * scale * 0.92, crown * scale);
      }
      side(jewel, M.gold, gardenName, angle, px, lawnTop + height * 1.16 + crown, pz,
        y(270), yv(130), y(270));
    }
    // Four evenly spaced lily groups sit just above each existing water face.
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      const x = Math.cos(a) * PARK * 0.25, z = gardenAt + Math.sin(a) * PARK * 0.25;
      side(lilyPad, M.foliageLit, gardenName, angle, x, lawnTop + yv(195), z,
        y(800), yv(45), y(650));
      for (let petal = 0; petal < 6; petal++) {
        const p = petal * Math.PI / 3;
        side(jewel, M.pearl, gardenName, angle,
          x + Math.sin(p) * y(310), lawnTop + yv(295), z + Math.cos(p) * y(310),
          y(300), yv(95), y(300));
      }
      side(jewel, M.gold, gardenName, angle, x, lawnTop + yv(360), z,
        y(240), yv(120), y(240));
    }
  }

  bins.forEach((entries, name) => entries.forEach((data, material) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3));
    geometry.setIndex(data.indices);
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    root.add(mesh);
  }));
  temporary.forEach(geometry => geometry.dispose());
  return root;
}
