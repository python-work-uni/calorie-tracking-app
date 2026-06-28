/**
 * CaloFlow Service Worker — sw.js
 *
 * Strategy: Cache-First for all application shell assets.
 * The app is a single-file SPA (index.html), so the shell is minimal.
 *
 * Cache Versioning:
 *   Bumping CACHE_NAME triggers the activate phase to delete old caches,
 *   ensuring users always receive the freshest shell after a SW update.
 *
 * Lifecycle:
 *   1. install  -> Pre-cache all listed shell assets and skip waiting immediately.
 *   2. activate -> Delete any stale caches that do not match CACHE_NAME.
 *   3. fetch    -> Serve from cache if available; fall back to network and cache
 *                  the response for next time.
 */

const CACHE_NAME = 'caloflow-shell-v1';

/**
 * APP_SHELL: The list of assets forming the "application shell".
 * Because CaloFlow is a single HTML file with all CSS/JS inlined,
 * only the root index.html is needed here.
 */
const APP_SHELL = [
  './',            // Alias for index.html via directory request
  './index.html',  // Explicit document request
];

// --- INSTALL ------------------------------------------------------------------
// Pre-cache all app shell resources so the app works fully offline.
self.addEventListener('install', (event) => {
  console.log('[SW] Install: Pre-caching application shell...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => {
        // Skip waiting so this SW activates immediately without waiting for
        // the previous SW to finish controlling existing clients.
        return self.skipWaiting();
      })
  );
});

// --- ACTIVATE -----------------------------------------------------------------
// Delete any caches that belong to an older version of this SW.
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate: Cleaning up stale caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((staleName) => {
            console.log('[SW] Deleting stale cache:', staleName);
            return caches.delete(staleName);
          })
      );
    }).then(() => {
      // Take immediate control of all open clients so they benefit from this
      // SW without needing a page reload.
      return self.clients.claim();
    })
  );
});

// --- FETCH --------------------------------------------------------------------
// Cache-First strategy:
//   1. Cache HIT  -> return instantly (instant offline load).
//   2. Cache MISS -> fetch from network, cache a clone, return the response.
//   3. Offline    -> for navigation requests fall back to cached index.html.
//
// Non-GET requests and non-http(s) requests pass through unchanged.
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests -- safe and idempotent for caching.
  if (event.request.method !== 'GET') return;

  // Ignore non-http(s) schemes (e.g., chrome-extension://)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Cache HIT -- return immediately without touching the network.
      if (cachedResponse) {
        return cachedResponse;
      }

      // Cache MISS -- fetch from network.
      return fetch(event.request)
        .then((networkResponse) => {
          // Only cache valid, non-opaque (CORS-safe) responses.
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type !== 'opaque'
          ) {
            // Clone the response: one copy goes to cache, one to the browser.
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline and resource not cached.
          // For page navigation requests, return the cached index.html shell
          // so the SPA still loads when fully offline.
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          // For other resource types fail silently.
        });
    })
  );
});
