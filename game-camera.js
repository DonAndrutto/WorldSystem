/* Camera compositions for the game. Pure geometry: no DOM, renderer or game
 * mutation. Meru and the destination share the frame, regardless of the
 * direction from which the visitor last looked at the world. */
export function composeGameFocus(THREE, { anchor, meruBounds, summit, viewport, rect, fov }) {
  const below = anchor.y < 0;
  const high = anchor.y > summit * 1.35;
  const radial = Math.hypot(anchor.x, anchor.z);
  const profile = below ? 'below' : high ? 'heavens' : radial > summit ? 'surface' : 'meru';
  // A three-quarter angle from the destination's side separates its marker
  // from Meru. Central/high destinations keep the familiar south-east view.
  const azimuth = radial > summit * 0.35
    ? Math.atan2(anchor.x, anchor.z) + Math.PI / 3 : Math.atan2(1, 1.25);
  const elevation = { below: 0.10, surface: 0.60, meru: 0.46, heavens: 0.25 }[profile];
  const direction = new THREE.Vector3(Math.sin(azimuth), elevation, Math.cos(azimuth)).normalize();
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), direction).normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const markerRadius = summit * 0.20;
  const markerBounds = new THREE.Box3().setFromCenterAndSize(anchor,
    new THREE.Vector3(1, 1, 1).multiplyScalar(markerRadius * 2));
  const points = [];
  for (const box of [meruBounds, markerBounds]) {
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y])
      for (const z of [box.min.z, box.max.z]) points.push(new THREE.Vector3(x, y, z));
  }
  const bounds = new THREE.Box3().setFromPoints(points);
  const centre = bounds.getCenter(new THREE.Vector3());
  const half = Math.tan(fov * Math.PI / 360);
  const tanX = half * rect.w / viewport.h * 0.78;
  const tanY = half * rect.h / viewport.h * 0.78;
  let distance = summit * 3.4;
  // Include perspective depth, not just the two-dimensional extent. The
  // off-centre correction below uses the same camera basis as the fit.
  const offsetX = (rect.x - viewport.w / 2) * 2 / viewport.h * half;
  const offsetY = -(rect.y - viewport.h / 2) * 2 / viewport.h * half;
  for (const point of points) {
    const delta = point.clone().sub(centre);
    const z = delta.dot(direction);
    distance = Math.max(distance,
      z + Math.abs(delta.dot(right) + offsetX * z) / tanX,
      z + Math.abs(delta.dot(up) + offsetY * z) / tanY);
  }
  const target = centre.clone()
    .addScaledVector(right, -offsetX * distance)
    .addScaledVector(up, -offsetY * distance);
  return { position: target.clone().addScaledVector(direction, distance), target,
    direction, profile, below, points };
}

/* A shortest azimuth arc outside the mountain, rather than a chord through
 * it. The camera controls' target can interpolate independently. */
export function orbitFlightPoint(THREE, from, to, t, clearance) {
  if (t <= 0) return from.clone();
  if (t >= 1) return to.clone();
  const a = Math.atan2(from.x, from.z), b = Math.atan2(to.x, to.z);
  const turn = Math.atan2(Math.sin(b - a), Math.cos(b - a));
  const r0 = Math.hypot(from.x, from.z), r1 = Math.hypot(to.x, to.z);
  const lift = Math.sin(Math.PI * t);
  const radius = r0 + (r1 - r0) * t + lift * Math.max(0, clearance - Math.min(r0, r1));
  return new THREE.Vector3(Math.sin(a + turn * t) * radius,
    from.y + (to.y - from.y) * t + lift * clearance * 0.12,
    Math.cos(a + turn * t) * radius);
}
