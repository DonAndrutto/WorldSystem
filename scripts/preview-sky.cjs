// Development only: render the real sky-painting code without a browser/GPU.
// Requires @napi-rs/canvas and sharp. Preview images are not loaded by the app.
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const assert = require('node:assert/strict');
const { createCanvas } = require('@napi-rs/canvas');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');

async function main() {
  const { DAY_SKY, paintClouds } = await import(pathToFileURL(path.join(root, 'sky-clouds.js')));
  const document = { createElement: () => createCanvas(1, 1) };
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const source = html.slice(html.indexOf('const cloudTex ='), html.indexOf('const waterNormalMap'));
  const canvasTex = (w, h, draw) => {
    const canvas = createCanvas(w, h); draw(canvas.getContext('2d'), w, h); return canvas;
  };
  const render = new Function('canvasTex', 'document', 'DAY_SKY', 'paintClouds', source + ';return cloudTex;')
    (canvasTex, document, DAY_SKY, paintClouds);
  const brightness = [];
  fs.mkdirSync(path.join(root, 'assets/sky'), { recursive: true });
  for (const dark of [false, true]) {
    const canvas = render(dark);
    const pixels = canvas.getContext('2d').getImageData(0, 0, 2048, 1024).data;
    let sum = 0, seam = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      sum += pixels[i] + pixels[i + 1] + pixels[i + 2]; assert.equal(pixels[i + 3], 255);
    }
    for (let y = 0; y < 1024; y++) for (let k = 0; k < 3; k++) {
      seam += Math.abs(pixels[y * 2048 * 4 + k] - pixels[(y * 2048 + 2047) * 4 + k]);
    }
    assert.ok(seam / 3072 < 4, 'No conspicuous horizontal wrap seam');
    brightness.push(sum / (2048 * 1024 * 3));
    await sharp(canvas.toBuffer('image/png')).resize(1536, 768).webp({ quality: 88 })
      .toFile(path.join(root, 'assets/sky', `${dark ? 'night' : 'day'}-preview.webp`));
  }
  assert.ok(brightness[0] > brightness[1] * 2, 'Day/night separation');
  assert.ok(render(false).toBuffer('image/png').equals(render(false).toBuffer('image/png')), 'Stable cloud placement');
  console.log('PASS: real Canvas painting, opaque sky, theme separation, stable placement and wrap seam.');
  console.log('Wrote day/night texture previews. This does not test live WebGL or browser layout.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
