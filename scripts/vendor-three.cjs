// Run with `node scripts/vendor-three.cjs` (needs npm and tar on the path).
// Re-fetches the pinned three.js from the npm registry and lays the three
// files the page imports into vendor/, so the drawing carries its own library
// and asks the network for nothing.
//
// The version and the hashes are not kept here: they are read out of the
// import map in index.html, which is the one place the pin is written. The
// tarball npm serves is the same bytes unpkg serves, so the hashes in that map
// are still upstream's, and this script is what proves it — a mismatch stops
// the copy rather than quietly vendoring something else.
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');

// Where each file lands under vendor/, and where it lives inside the tarball.
const FILES = [
  ['build/three.module.js', 'build/three.module.js'],
  ['build/three.core.js', 'build/three.core.js'],
  ['examples/jsm/controls/OrbitControls.js', 'examples/jsm/controls/OrbitControls.js'],
  ['LICENSE', 'LICENSE']
];

const sha384 = data => 'sha384-' + crypto.createHash('sha384').update(data).digest('base64');

async function pinned() {
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const block = html.match(/<script type="importmap">([\s\S]*?)<\/script>/);
  if (!block) throw new Error('no import map in index.html');
  const map = JSON.parse(block[1]);
  const dir = Object.keys(map.integrity).map(url => url.match(/^\.\/(vendor\/three@[^/]+)\//))
    .find(Boolean);
  if (!dir) throw new Error('the import map no longer points at vendor/three@<version>');
  return { dir: dir[1], version: dir[1].split('@')[1], integrity: map.integrity };
}

async function main() {
  const { dir, version, integrity } = await pinned();
  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'vendor-three-'));
  try {
    const tarball = execFileSync('npm',
      ['pack', 'three@' + version, '--pack-destination', work, '--silent'],
      { encoding: 'utf8' }).trim().split('\n').pop();
    execFileSync('tar', ['-xzf', path.join(work, tarball), '-C', work]);

    const target = path.join(root, dir);
    await fs.rm(target, { recursive: true, force: true });
    for (const [to, from] of FILES) {
      const data = await fs.readFile(path.join(work, 'package', from));
      const declared = integrity['./' + dir + '/' + to];
      if (declared && declared !== sha384(data)) {
        throw new Error(to + ' does not match the hash pinned in index.html:\n'
          + '  index.html: ' + declared + '\n  three@' + version + ': ' + sha384(data));
      }
      await fs.mkdir(path.join(target, path.dirname(to)), { recursive: true });
      await fs.writeFile(path.join(target, to), data);
      console.log((declared ? 'verified ' : 'copied   ') + dir + '/' + to);
    }
  } finally {
    await fs.rm(work, { recursive: true, force: true });
  }
  console.log('three.js ' + version + ' vendored; every hash in the import map checked.');
  console.log('Re-run `node scripts/build-sw.cjs` so the service worker caches them.');
}

main().catch(error => { console.error(error.message || error); process.exitCode = 1; });
