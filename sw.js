/* ── the world, kept ───────────────────────────────────────────────────────
   The page is a drawing with no server behind it: one HTML file, a handful of
   modules, three.js vendored beside them, two typefaces and the painted
   sheets. All of it fits in a cache, so this worker takes the whole thing on
   the first visit and afterwards the network is only ever asked whether there
   is a newer world — never for the one already on the shelf.

   Versioning. Everything below the marker is written by
   `node scripts/build-sw.cjs`: VERSION is a digest of this file's own logic
   together with the contents of every file in SHELL, so it moves when, and
   only when, something the installed app holds has actually changed. The cache
   is named after it, which makes each version a separate shelf: the running
   app keeps reading the old one until the new one is complete, and a half
   finished download can never be mistaken for a world.

   Updating. A new worker installs its shelf in the background and then waits.
   It does not push itself in front of a page that is already running, because
   that page is holding modules and textures from the old version in memory and
   would end up half in each. The page is told instead, and offers a reload;
   taking it sends SKIP_WAITING back here. Declining costs nothing — the next
   launch from a cold start gets the new version anyway, which for a
   home-screen app is usually the same evening.

   Sweeping. Activation deletes every world-system cache that is not the
   current shelf or the runtime one, so old versions do not accumulate. */

/* ── written by scripts/build-sw.cjs — do not edit below ─────────────── */
const VERSION = '49f5f234429f57bb';
const SHELL = [
  "apple-touch-icon.png",
  "assets/fonts/eb-garamond-400-italic-latin-ext.woff2",
  "assets/fonts/eb-garamond-400-italic-latin.woff2",
  "assets/fonts/eb-garamond-400-normal-latin-ext.woff2",
  "assets/fonts/eb-garamond-400-normal-latin.woff2",
  "assets/fonts/fonts.css",
  "assets/fonts/ibm-plex-mono-400-normal-latin-ext.woff2",
  "assets/fonts/ibm-plex-mono-400-normal-latin.woff2",
  "assets/fonts/ibm-plex-mono-500-normal-latin-ext.woff2",
  "assets/fonts/ibm-plex-mono-500-normal-latin.woff2",
  "assets/offerings/goddess-atlas.webp",
  "assets/offerings/royal-atlas.webp",
  "assets/offerings/treasure-atlas.webp",
  "assets/rebirth/liberation.webp",
  "assets/rebirth/squares-1.webp",
  "assets/rebirth/squares-2.webp",
  "assets/rebirth/squares-3.webp",
  "assets/rebirth/squares-4.webp",
  "assets/rebirth/travelers.png",
  "continent-models.js",
  "favicon-32.png",
  "favicon.ico",
  "game-camera.js",
  "game-players.js",
  "game-session.js",
  "game-ui.css",
  "icon-192.png",
  "icon-512.png",
  "icon-maskable-512.png",
  "index.html",
  "mandala-offerings.js",
  "mandala-tour.js",
  "manifest.webmanifest",
  "rebirth-board.js",
  "rebirth-game.js",
  "rebirth-icons.js",
  "rebirth-notes.js",
  "rebirth-sound.js",
  "sky-clouds.js",
  "summit-detail.js",
  "three-d-stage.js",
  "vendor/three@0.184.0/build/three.core.js",
  "vendor/three@0.184.0/build/three.module.js",
  "vendor/three@0.184.0/examples/jsm/controls/OrbitControls.js",
  "viewport-gestures.js",
  "world-surfaces.js"
];
/* ── end of the written part ─────────────────────────────────────────── */

const CACHE = 'world-system-' + VERSION;
const RUNTIME = 'world-system-runtime';
const INDEX = 'index.html';

// Six at a time: enough to fill a connection, few enough that a phone on a
// thin signal is not asked to hold forty sockets open at once.
async function precache(cache, urls, width = 6) {
  const queue = urls.slice();
  const take = async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      // `reload` goes past the browser's own HTTP cache: a file we are about
      // to promise is part of this version has to be fetched, not remembered.
      const response = await fetch(url, { cache: 'reload', credentials: 'same-origin' });
      if (!response.ok) throw new Error(url + ' — ' + response.status + ' ' + response.statusText);
      await cache.put(url, response);
    }
  };
  await Promise.all(Array.from({ length: Math.min(width, urls.length) }, take));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Any failure rejects the install, and the old version stays in charge:
    // a shelf with a hole in it is worse than yesterday's complete one.
    await precache(cache, SHELL);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('world-system-') && name !== CACHE && name !== RUNTIME) {
        await caches.delete(name);
      }
    }
    // The first install has no controller; claiming means this very visit is
    // already covered, so going offline and reloading works straight away.
    await self.clients.claim();
  })());
});

// Navigation is always answered from the shelf. There are no routes here —
// every URL under the scope is this one page — and the freshness question is
// answered on the side, by the browser checking this file on each navigation.
async function page(request) {
  const cache = await caches.open(CACHE);
  const held = await cache.match(INDEX);
  if (held) return held;
  try {
    return await fetch(request);
  } catch (err) {
    return new Response(
      '<!DOCTYPE html><meta charset="utf-8"><title>The World System</title>'
      + '<body style="font:16px/1.6 Georgia,serif;margin:12vh auto;max-width:34em;padding:0 1.5em">'
      + '<p>The world has not been put by yet. Open this page once with a network,'
      + ' and it will be here without one.</p>',
      { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }
}

// Everything in SHELL is immutable for this version, so it is read straight
// off the shelf. `ignoreSearch` is what lets the page keep asking for
// `icon-192.png?v=2` and the like and still be answered.
async function asset(event) {
  const cache = await caches.open(CACHE);
  const held = await cache.match(event.request, { ignoreSearch: true });
  if (held) return held;

  // Anything else of ours — a file added after this version was built — is
  // served from last time while a fresh copy is fetched behind the page.
  const runtime = await caches.open(RUNTIME);
  const stored = await runtime.match(event.request, { ignoreSearch: true });
  const fresh = fetch(event.request).then(response => {
    if (response.ok && response.type === 'basic') runtime.put(event.request, response.clone());
    return response;
  });
  if (!stored) return fresh;
  event.waitUntil(fresh.catch(() => {}));
  return stored;
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  // Nothing of this page's lives on another origin any more; if something one
  // day does, it is that origin's business, not the shelf's.
  if (new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(request.mode === 'navigate' ? page(request) : asset(event));
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'VERSION' && event.ports && event.ports[0]) {
    event.ports[0].postMessage({ version: VERSION, files: SHELL.length });
  }
});
