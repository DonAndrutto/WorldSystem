// Run with `node scripts/vendor-astronomy-engine.cjs` (needs npm and tar on the path).
// Re-fetches the Jyotiṣa calculator's engine, astronomy-engine (MIT), from the
// npm registry and lays its ES-module build into vendor/. The version and hash
// are read from the import map in index.html, the one place the pin is
// written; a mismatch stops the copy rather than quietly vendoring something
// else. npm itself checks the tarball against the registry's integrity.
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const sha384 = (data) => 'sha384-' + crypto.createHash('sha384').update(data).digest('base64');

async function main() {
  const html = await fs.readFile(path.join(root, 'index.html'), 'utf8');
  const map = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
  const url = Object.keys(map.integrity).find((u) => /^\.\/vendor\/astronomy-engine@[^/]+\/astronomy\.js$/.test(u));
  if (!url) throw new Error('the import map pins no vendor/astronomy-engine@<version>/astronomy.js');
  const version = url.match(/@([^/]+)\//)[1];
  const work = await fs.mkdtemp(path.join(os.tmpdir(), 'vendor-astronomy-'));
  try {
    const tarball = execFileSync('npm', ['pack', 'astronomy-engine@' + version, '--pack-destination', work, '--silent'],
      { encoding: 'utf8' }).trim().split('\n').pop();
    execFileSync('tar', ['-xzf', path.join(work, tarball), '-C', work]);
    const pkg = JSON.parse(await fs.readFile(path.join(work, 'package', 'package.json'), 'utf8'));
    if (pkg.license !== 'MIT') throw new Error('astronomy-engine ' + version + ' declares ' + pkg.license + ', not MIT — nothing written');
    const data = await fs.readFile(path.join(work, 'package', 'esm', 'astronomy.js'));
    if (sha384(data) !== map.integrity[url]) throw new Error('esm/astronomy.js does not match the hash pinned in index.html — nothing written');
    await fs.writeFile(path.join(root, url), data);
    console.log('verified ' + url.slice(2) + ' (astronomy-engine ' + version + ', MIT)');
  } finally {
    await fs.rm(work, { recursive: true, force: true });
  }
}
main().catch((error) => { console.error(error.message || error); process.exitCode = 1; });
