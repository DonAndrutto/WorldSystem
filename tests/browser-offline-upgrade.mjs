// Real service worker/cache/update UI in Chromium, without WebGL. The minimal
// page uses the production updater verbatim and the real game-session module.
// Two synthetic releases exercise lifecycle behaviour; this is not device QA.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { createGame } from '../rebirth-game.js';
import { makeSession, restoreSession, SESSION_KEY } from '../game-session.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await fs.readFile(path.join(root, 'index.html'), 'utf8');
const updaters = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(match => match[1]).filter(code => code.includes('navigator.serviceWorker.register'));
assert.equal(updaters.length, 1, 'exercise the production update UI');
const worker = await fs.readFile(path.join(root, 'sw.js'), 'utf8');
const currentVersion = worker.match(/const VERSION = '([^']+)'/)[1];
const previousVersion = 'previous-' + currentVersion;
const failedVersion = 'failed-' + currentVersion;
const harness = `<!doctype html><meta charset="utf-8"><title>Offline upgrade fixture</title>
  <div class="swnote" hidden><button data-act="update">Reload to update</button></div>
  <script>${updaters[0]}</script>
  <script type="module">
    import { restoreSession } from './game-session.js';
    window.restoreSavedGame = restoreSession;
    window.testReady = true;
  </script>`;
let release = 'previous';
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.webp': 'image/webp', '.png': 'image/png' };
const server = http.createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, name);
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    if (release === 'failed' && name === 'app-chrome.css') { res.writeHead(503).end('simulated interrupted release'); return; }
    let body = name === 'index.html' ? harness : await fs.readFile(file);
    if (name === 'sw.js' && release !== 'current') body = worker.replace(
      "const VERSION = '" + currentVersion + "'",
      "const VERSION = '" + (release === 'previous' ? previousVersion : failedVersion) + "'");
    if (name === 'app-chrome.css') body = String(body) + '\n/* release: ' + release + ' */';
    res.writeHead(200, { 'Content-Type': mime[path.extname(name)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true,
    executablePath: process.env.WORLDSYSTEM_CHROMIUM || undefined });
  console.log('Browser: Chromium ' + browser.version());
  const context = await browser.newContext({ serviceWorkers: 'allow' });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const url = 'http://127.0.0.1:' + server.address().port + '/';
  await page.goto(url);
  await page.waitForFunction(() => window.testReady && navigator.serviceWorker.controller);
  assert.equal(await page.locator('.swnote').isVisible(), false, 'first install does not ask to reload');
  const heldCSS = () => page.evaluate(async () => (await fetch('app-chrome.css')).text());
  assert.match(await heldCSS(), /release: previous/);
  const session = { ...makeSession(createGame({ players: 2, names: ['Andrzej', 'Tara'] })), rolls: [1, 3], pending: 2 };
  const saved = { [SESSION_KEY]: JSON.stringify(session), 'ws-language': 'pl',
    'ws-night': '1', 'ws-game-display': '["names"]', 'ws-motion': '0' };
  await page.evaluate(saved => { for (const [key, value] of Object.entries(saved)) localStorage.setItem(key, value); }, saved);
  const readSaved = () => page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const version = () => page.evaluate(() => new Promise((resolve, reject) => {
    const channel = new MessageChannel();
    const timer = setTimeout(() => { channel.port1.close(); reject(new Error('Worker version timed out')); }, 10000);
    channel.port1.onmessage = event => { clearTimeout(timer); channel.port1.close(); resolve(event.data.version); };
    navigator.serviceWorker.controller.postMessage({ type: 'VERSION' }, [channel.port2]);
  }));

  release = 'failed';
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.getRegistration();
    let timer;
    const redundant = new Promise((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Failed install did not settle')), 60000);
      reg.addEventListener('updatefound', () => {
        const next = reg.installing;
        next.addEventListener('statechange', () => { if (next.state === 'redundant') resolve(); });
      }, { once: true });
    });
    try { await reg.update(); await redundant; }
    finally { clearTimeout(timer); }
  });
  assert.equal(await version(), previousVersion, 'failed install keeps the working controller');
  assert.match(await heldCSS(), /release: previous/);
  assert.equal(await page.locator('.swnote').isVisible(), false);
  assert.deepEqual(await readSaved(), saved);
  console.log('PASS: failed update preserves the previous release and saved state');

  release = 'current';
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
  await page.locator('.swnote').waitFor({ state: 'visible' });
  assert.equal(await version(), previousVersion, 'update waits for the reader');
  assert.match(await heldCSS(), /release: previous/, 'ignoring the offer keeps old assets');
  assert.deepEqual(await readSaved(), saved);
  await Promise.all([page.waitForEvent('load'), page.locator('[data-act="update"]').click()]);
  await page.waitForFunction(() => window.testReady);
  assert.equal(await version(), currentVersion);
  assert.match(await heldCSS(), /release: current/);
  assert.deepEqual(await readSaved(), saved, 'upgrade preserves all saved values');
  const restored = await page.evaluate(key => window.restoreSavedGame(localStorage.getItem(key)), SESSION_KEY);
  assert.deepEqual(restored, restoreSession(saved[SESSION_KEY]), 'pending die restores through the actual game rules');
  assert.equal(restored.recovered, true);
  assert.deepEqual(await page.evaluate(() => caches.keys()), ['world-system-' + currentVersion], 'obsolete and failed release caches are removed');
  console.log('PASS: accepted update serves new assets and preserves game, pending die and preferences');

  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => window.testReady);
  assert.deepEqual(await readSaved(), saved);
  assert.equal(await version(), currentVersion);
  assert.match(await heldCSS(), /release: current/);
  const statuses = await page.evaluate(async () => Promise.all([
    'locales/pl.js', 'locales/pl-texts.js', 'assets/offerings/goddess-atlas.webp',
    'assets/rebirth/squares-1.webp', 'sculpture-robe-data.js?retry=1'
  ].map(async file => (await fetch(file)).status)));
  assert.ok(statuses.every(status => status === 200), 'Polish, paintings and lazy sculptures remain available offline');
  assert.deepEqual(errors, [], 'no uncaught page errors');
  console.log('PASS: offline reload retains updated assets, language and saved game');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
