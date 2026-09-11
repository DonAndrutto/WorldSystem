// Run with `node scripts/build-icons.cjs` (development dependency: sharp).
// One source image supplies Safari, the manifest, and browser tab icons.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const source = path.join(root, 'assets/app-icon/world-system-master.webp');

async function main() {
  for (const [name, size] of [
    ['apple-touch-icon.png', 180], ['icon-192.png', 192],
    ['icon-512.png', 512], ['favicon-32.png', 32]
  ]) {
    await sharp(source).resize(size, size).removeAlpha()
      .png({ compressionLevel: 9 }).toFile(path.join(root, name));
  }

  // The subject reaches radius .464 in the source. At 82% scale it stays
  // within radius .381, inside Android's .40 safe circle. Extend the blue
  // edge pixels into the padding so there is no contrasting square border.
  const inset = await sharp(source).resize(420, 420).removeAlpha().png().toBuffer();
  await sharp(inset).extend({ top: 46, bottom: 46, left: 46, right: 46, extendWith: 'copy' })
    .png({ compressionLevel: 9 }).toFile(path.join(root, 'icon-maskable-512.png'));

  // Modern ICO containers support PNG frames; no platform-specific tool needed.
  const sizes = [16, 32, 48];
  const images = [];
  for (const size of sizes) images.push(await sharp(source).resize(size, size).png().toBuffer());
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, i) => {
    const entry = 6 + i * 16;
    header[entry] = header[entry + 1] = sizes[i];
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  await fs.writeFile(path.join(root, 'favicon.ico'), Buffer.concat([header, ...images]));
  console.log('Built opaque home-screen icons, a padded maskable icon, and 16/32/48px favicons.');
}

main().catch(error => { console.error(error); process.exitCode = 1; });
