// A once-per-theme painted sky: the existing canvas approach, with layered
// mineral colours, broad spiral ribbons and continuous cloud silhouettes.
export const DAY_SKY = [
  [0, '#285b96'], [0.24, '#438bc0'], [0.40, '#72b9d4'],
  [0.50, '#badfe5'], [0.60, '#8abed2'], [1, '#587ea8']
];

const DAY_PIGMENTS = [
  ['#f4f0e3', '#b5c9df', '#648ab7', '#fff7dc'],
  ['#eeeef2', '#c1bedc', '#8585b8', '#fff4dc'],
  ['#e0e9d5', '#9ac8b8', '#4f9d94', '#fbefd4'],
  ['#f5dfa8', '#dfac62', '#b9774d', '#fff0ce'],
  ['#f2dfdc', '#dfb3ba', '#bd7f92', '#fff0d9']
];
const NIGHT_PIGMENTS = [
  ['#43536c', '#637795', '#2d425e', '#8e9db4'],
  ['#454f6b', '#737b99', '#323d5b', '#959bb4'],
  ['#3c575e', '#5d7b80', '#294b54', '#879fa3'],
  ['#5b5658', '#857477', '#494455', '#a295a0'],
  ['#554d65', '#806b89', '#403b56', '#a094b0']
];

function cloudCanvas(makeCanvas, palette, kind) {
  const canvas = makeCanvas(); canvas.width = 400; canvas.height = 220;
  const c = canvas.getContext('2d');
  c.translate(220, 112); c.scale(96, 96);
  // Small silhouette variations avoid an identical repeating stamp.
  c.scale(kind === 1 ? 0.93 : 1, kind === 2 ? 0.88 : 1);
  const [body, band, core, rim] = palette;
  const silhouette = () => {
    c.beginPath(); c.moveTo(-2.0, 0.40);
    c.bezierCurveTo(-1.49, 0.23, -1.25, -0.05, -0.84, 0.10);
    c.bezierCurveTo(-1.05, -0.21, -0.78, -0.50, -0.48, -0.34);
    c.bezierCurveTo(-0.65, -0.75, -0.12, -0.91, 0.08, -0.52);
    c.bezierCurveTo(0.27, -0.93, 0.88, -0.76, 0.76, -0.33);
    c.bezierCurveTo(1.18, -0.51, 1.50, -0.10, 1.14, 0.17);
    c.bezierCurveTo(1.46, 0.39, 1.12, 0.78, 0.77, 0.59);
    c.bezierCurveTo(0.56, 0.94, 0.09, 0.75, 0.04, 0.48);
    c.bezierCurveTo(-0.23, 0.81, -0.64, 0.60, -0.62, 0.30);
    c.bezierCurveTo(-1.09, 0.25, -1.38, 0.55, -2.0, 0.40);
    c.closePath();
  };
  c.lineJoin = 'round'; c.lineCap = 'round';
  silhouette(); c.fillStyle = body; c.fill();
  c.save(); silhouette(); c.clip();

  // A broad coloured contour follows the silhouette, leaving an ivory lip.
  c.strokeStyle = band; c.lineWidth = 0.23; c.stroke();
  const curl = (x, y, radius, reverse = false) => {
    c.beginPath();
    for (let i = 0; i <= 72; i++) {
      const t = i / 72, angle = -0.35 + t * Math.PI * 2.15;
      const r = radius * (1 - t * 0.87);
      const px = x + Math.cos(angle) * r * (reverse ? -1 : 1);
      const py = y + Math.sin(angle) * r;
      if (i) c.lineTo(px, py); else c.moveTo(px, py);
    }
    c.strokeStyle = band; c.lineWidth = radius * 0.58; c.stroke();
    c.strokeStyle = core; c.lineWidth = radius * 0.22; c.stroke();
  };
  curl(0.43, 0.04, 0.47, kind === 1);
  curl(-0.24, -0.31, 0.31, true);
  curl(-0.30, 0.27, 0.26);
  c.beginPath(); c.moveTo(-1.85, 0.40);
  c.bezierCurveTo(-1.40, 0.35, -1.13, 0.04, -0.69, 0.22);
  c.strokeStyle = band; c.lineWidth = 0.13; c.stroke();
  c.strokeStyle = core; c.lineWidth = 0.035; c.stroke();
  c.restore();
  silhouette(); c.strokeStyle = rim; c.lineWidth = 0.036; c.stroke();
  return canvas;
}

export function paintClouds(ctx, width, height, dark, makeCanvas = () => document.createElement('canvas')) {
  const palettes = dark ? NIGHT_PIGMENTS : DAY_PIGMENTS;
  const motifs = new Map();
  let seed = 731;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  // Continue below the horizon for elevated and top-down mandala views.
  // Keep both poles clear to prevent equirectangular pinching.
  const courses = [
    [0.20, 0.066, 4, 0.40], [0.335, 0.084, 5, 0.52],
    [0.47, 0.095, 5, 0.62], [0.61, 0.086, 5, 0.56],
    [0.75, 0.066, 4, 0.42]
  ];
  ctx.save();
  courses.forEach(([v, scale, count, opacity], row) => {
    for (let i = 0; i < count; i++) {
      const x = ((i + 0.5 + row * 0.37 + (random() - 0.5) * 0.16) / count) * width;
      const y = (v + (random() - 0.5) * 0.050) * height;
      const size = scale * height;
      const variation = 0.62 + random() * 0.48;
      const pigment = (i + row * 3) % 5 === 0 ? 2 + (i + row) % 3 : (i + row) % 2;
      const kind = (i + row) % 3, key = pigment * 3 + kind;
      if (!motifs.has(key)) motifs.set(key, cloudCanvas(makeCanvas, palettes[pigment], kind));
      const motif = motifs.get(key), flip = random() > 0.5 ? -1 : 1;
      const naturalWidth = size * 400 / 96 / Math.max(0.72, Math.sin(v * Math.PI));
      const fit = Math.min(1, width / count * 0.80 / naturalWidth);
      const w = naturalWidth * fit * variation, h = size * 220 / 96 * fit * variation;
      ctx.globalAlpha = opacity * (dark ? 0.68 : 1);
      // Draw each copy once: no overlapping wrap passes at the seam.
      for (const offset of [-width, 0, width]) {
        ctx.save(); ctx.translate(x + offset, y); ctx.scale(flip, 1);
        ctx.drawImage(motif, -w / 2, -h / 2, w, h); ctx.restore();
      }
    }
  });
  ctx.restore();
}
