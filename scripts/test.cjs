// All top-level Node suites. Browser suites have a separate browser runner.
const { readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const suites = readdirSync(path.join(root, 'tests')).filter(name =>
  name.endsWith('.mjs') && !name.startsWith('browser-') &&
  !['astrology-browser.mjs', 'audio-fakes.mjs'].includes(name));
// A stale release should fail quickly, before the geometry suites start.
suites.sort((a, b) => a === 'offline.mjs' ? -1 : b === 'offline.mjs' ? 1 : a.localeCompare(b));
for (const suite of suites) {
  console.log('\nRunning ' + suite);
  const result = spawnSync(process.execPath, [path.join('tests', suite)], {
    cwd: root, stdio: 'inherit', timeout: 300000
  });
  if (result.error || result.status !== 0) {
    console.error(result.error?.message || suite + ' failed');
    process.exit(result.status || 1);
  }
}
console.log('\nAll ' + suites.length + ' Node suites passed.');
