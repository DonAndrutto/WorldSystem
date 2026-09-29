// Run with `node scripts/vendor-panchangam.cjs` (Node 18+, no dependencies).
// Re-fetches the Jyotiṣa calculator's engine, the browser build of
// jsr:@fusionstrings/panchangam, into vendor/, and checks it against the
// hashes pinned in the import map in index.html — the one place the pin is
// written. A mismatch stops the copy rather than quietly vendoring something
// else. The licence notices beside it (NOTICE.md, LICENSE-AGPL-3.0.txt) are
// kept by hand.
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..');
const FILES = ['lib/browser/panchangam.js', 'lib/browser/panchangam.internal.js', 'lib/browser/panchangam.d.ts'];
const sha384 = (data) => 'sha384-' + crypto.createHash('sha384').update(data).digest('base64');

async function main() {
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const map = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
  const pins = Object.entries(map.integrity).filter(([url]) => url.includes('/vendor/panchangam@'));
  if (!pins.length) throw new Error('the import map pins no vendor/panchangam@<version>');
  const dir = pins[0][0].match(/^\.\/(vendor\/panchangam@([^/]+))\//);
  const [, rel, version] = dir;
  await fs.mkdir(path.join(root, rel), { recursive: true });
  for (const file of FILES) {
    const url = 'https://jsr.io/@fusionstrings/panchangam/' + version + '/' + file;
    const response = await fetch(url);
    if (!response.ok) throw new Error(url + ' — ' + response.status);
    const data = Buffer.from(await response.arrayBuffer());
    const name = path.basename(file);
    const want = map.integrity['./' + rel + '/' + name];
    if (want && sha384(data) !== want) throw new Error(name + ' from JSR does not match the pinned hash — nothing written');
    await fs.writeFile(path.join(root, rel, name), data);
    console.log((want ? 'verified ' : 'fetched  ') + rel + '/' + name);
  }
}
main().catch((error) => { console.error(error.message || error); process.exitCode = 1; });
