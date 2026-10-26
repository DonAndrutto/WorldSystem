// Run with Node alone — no development dependencies.
// Checks the part of the page that has to be true before it is opened: that
// everything it asks for lives in this repository, that the pinned hashes
// still describe the vendored library, and that the worker's shelf is the one
// scripts/build-sw.cjs would write from the tree as it stands.
//
// It reads files. It does not run a browser, so it says nothing about whether
// the drawing renders — only about what an installed copy would have to hand.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const repo = process.env.WORLDSYSTEM_REPO || fileURLToPath(new URL('../', import.meta.url));
const at = file => path.join(repo, file);
const read = file => fs.readFileSync(at(file), 'utf8');
const sha384 = file => 'sha384-' + crypto.createHash('sha384')
  .update(fs.readFileSync(at(file))).digest('base64');

const html = read('index.html');
const checks = [];
const ok = note => checks.push(note);

/* ── the library is here, and is what the map says it is ───────────────── */
const map = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]);
for (const [specifier, url] of Object.entries(map.imports)) {
  assert.ok(url.startsWith('./vendor/'), specifier + ' still resolves off the repository: ' + url);
  assert.ok(fs.existsSync(at(url)), specifier + ' points at a file that is not here: ' + url);
}
for (const [url, declared] of Object.entries(map.integrity)) {
  const file = url.replace(/^\.\//, '');
  assert.ok(fs.existsSync(at(file)), 'nothing at ' + url + ' to hash');
  assert.equal(sha384(file), declared,
    url + ' no longer matches the hash pinned beside it — re-run node scripts/vendor-three.cjs');
}
// three.module.js reaches for its own core file; that one has to be here too.
assert.ok(fs.existsSync(at('vendor/three@0.184.0/build/three.core.js')),
  'three.module.js imports ./three.core.js, which is not vendored');
assert.ok(fs.existsSync(at('vendor/three@0.184.0/LICENSE')), 'three.js is vendored without its licence');
ok('three.js vendored, every pinned hash still true');

/* ── and neither is anything else asked of another origin ──────────────── */
const bare = html.replace(/<!--[\s\S]*?-->/g, '');
const subresources = [
  ...[...bare.matchAll(/<(?:script|link|img|source)\b[^>]*>/gi)]
    .flatMap(tag => [...tag[0].matchAll(/\b(?:src|href)\s*=\s*"([^"]*)"/gi)].map(m => m[1])),
  ...[...bare.matchAll(/url\(\s*['"]?([^'")]+)/gi)].map(m => m[1])
];
for (const url of subresources) {
  assert.ok(!/^(?:https?:)?\/\//.test(url), 'index.html still fetches ' + url + ' over the network');
}
assert.ok(!/fonts\.(googleapis|gstatic)\.com|unpkg\.com|cdn\.jsdelivr/.test(bare),
  'index.html still names a CDN outside a comment');
ok(subresources.length + ' subresources, all of them this repository\'s own');

/* ── the letters, and the ranges that hand the rest back to the stack ──── */
const fonts = read('assets/fonts/fonts.css');
const faces = [...fonts.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(m => m[1]);
assert.ok(faces.length >= 8, 'the font sheet has lost rules: ' + faces.length);
for (const face of faces) {
  const file = face.match(/url\(([^)]+)\)/)[1];
  assert.ok(fs.existsSync(at('assets/fonts/' + file)), 'fonts.css names ' + file + ', which is not here');
  assert.ok(/unicode-range:/.test(face), 'a rule without a unicode-range would swallow the Tibetan');
}
for (const family of ['EB Garamond', 'IBM Plex Mono']) {
  assert.ok(fonts.includes("font-family: '" + family + "'"), family + ' is not served from here');
  assert.ok(html.includes('"' + family + '"'), family + ' is served but never set');
}
// U+1E43 ṃ and the rest of the Sanskrit diacritics live in U+1E00–1E9F.
assert.ok(fonts.includes('U+1E00-1E9F'), 'the latin-ext cut, and with it the diacritics, is missing');
ok(faces.length + ' font rules over ' + new Set([...fonts.matchAll(/url\(([^)]+)\)/g)]
  .map(m => m[1])).size + ' files, all local');

/* ── the worker holds what the tree holds ──────────────────────────────── */
const { plan } = createRequire(import.meta.url)('../scripts/build-sw.cjs');
const written = await plan();
assert.equal(read('sw.js'), written.source,
  'sw.js is behind the tree — run node scripts/build-sw.cjs and commit it');

const worker = read('sw.js');
const shell = JSON.parse(worker.match(/const SHELL = (\[[\s\S]*?\]);/)[1]);
for (const file of shell) assert.ok(fs.existsSync(at(file)), 'the worker would cache ' + file + ', which is not here');
for (const needed of ['index.html', 'manifest.webmanifest', 'three-d-stage.js',
  'assets/fonts/fonts.css', 'assets/offerings/goddess-atlas.webp', 'assets/rebirth/squares-1.webp']) {
  assert.ok(shell.includes(needed), needed + ' is not among the files put by');
}
for (const url of Object.values(map.imports)) {
  assert.ok(shell.includes(url.replace(/^\.\//, '')), url + ' is imported but never cached');
}
for (const tag of bare.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)) {
  const href = tag[0].match(/href="([^"]+)"/)[1].replace(/^\.\//, '').split('?')[0];
  assert.ok(shell.includes(href), href + ' must be available on a first offline visit');
}
assert.ok(!shell.includes('sw.js'), 'the worker must not cache itself — that is how an update stops arriving');
assert.ok(!shell.some(file => file.startsWith('assets/Game of Liberation')),
  'the 28 MB of source paintings would be downloaded on every install');
assert.match(worker.match(/const VERSION = '([0-9a-f]+)';/)[1], /^[0-9a-f]{16}$/);
ok(shell.length + ' files put by under version ' + worker.match(/const VERSION = '([0-9a-f]+)';/)[1]);

/* ── the Polish pack, the game's sculptures, and a retry that is still answered
      from the shelf ───────────────────────────────────────────────────────── */
for (const needed of ['locales/pl.js', 'locales/pl-texts.js', 'game-display.js', 'seated-sculpture.js',
  'sculpture-robe-data.js', 'sculpture-anatomy-data.js']) {
  assert.ok(shell.includes(needed), needed + ' is not among the files put by: an installed copy would lose it');
}
// the study's full-resolution meshes are for the preview page and the export alone
for (const study of ['sculpture-robe-detail.js', 'sculpture-anatomy-detail.js']) {
  assert.ok(!shell.includes(study), study + ' would be downloaded on every install');
  for (const file of shell.filter(f => /\.(js|html)$/.test(f) && f !== 'sw.js')) {
    assert.ok(!new RegExp('(?:import\\s*\\(|from|import)\\s*[\'"`]\\./' + study.replace('.', '\\.')).test(read(file)), file + ' imports ' + study + ', which an installed copy does not hold');
  }
}
// what the loader asks for after the page — under the address of a retry, `?retry=n` — must
// be answered from the shelf with the query ignored, or an offline retry could never succeed
const sculptureSource = read('seated-sculpture.js');
const lazy = [...sculptureSource.matchAll(/\['\w+','\.\/([\w-]+\.js)','\w+'\]/g)].map(m => m[1]);
assert.deepEqual(lazy.sort(), ['sculpture-anatomy-data.js', 'sculpture-robe-data.js']);
for (const file of lazy) assert.ok(shell.includes(file), file + ' is loaded after the page and is not on the shelf');
assert.match(sculptureSource, /'\?retry='/, 'a retry asks under a new address');
assert.match(worker, /cache\.match\(event\.request, \{ ignoreSearch: true \}\)/, 'the shelf is read with the query ignored');
ok('the Polish pack and the game\'s sculptures are on the shelf, the study is not, and a retry address is served from it');

/* ── and the page both registers it and can be told about a newer one ──── */
assert.match(html, /navigator\.serviceWorker\.register\('sw\.js'/, 'the page never registers the worker');
assert.match(html, /class="swnote card"/, 'there is nothing to say a newer world is ready in');
assert.match(html, /\[data-act="update"\]/, 'the notice has no way to take the newer world');
assert.match(worker, /SKIP_WAITING/, 'the worker will not step forward when asked');
ok('the page registers the worker and can offer what it finds');

/* ── the manifest still describes something installable ────────────────── */
const manifest = JSON.parse(read('manifest.webmanifest'));
assert.equal(manifest.start_url, './');
assert.equal(manifest.scope, './');
assert.equal(manifest.display, 'standalone');
for (const icon of manifest.icons) {
  assert.ok(fs.existsSync(at(icon.src.split('?')[0])), icon.src + ' is named by the manifest but not here');
  assert.ok(shell.includes(icon.src.split('?')[0]), icon.src + ' is named by the manifest but not cached');
}
ok('the manifest installs to ./ with ' + manifest.icons.length + ' icons, all cached');

console.log('PASS: ' + checks.length + ' checks.');
for (const note of checks) console.log('  ok  ' + note);
console.log('Files only. Rendering, installation and actual offline behaviour are not tested here.');
