const CACHE_NAME = 'demo-request-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/admin.html',
  '/css/styles.css',
  '/css/admin.css',
  '/js/app.js',
  '/js/admin.js',
  '/manifest.json',
  '/locales/en.json',
  '/locales/es.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell and locales...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch(err => {
      console.warn('[Service Worker Install Warning] Asset caching failed (running in offline mode will still fall back gracefully):', err);
    })
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  // Only intercept requests for documents or files, ignore API routes to avoid caching requests database
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Cache dynamic assets that are fetched on-the-fly (e.g. static Google Fonts)
        if (response && response.status === 200 && event.request.method === 'GET') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback: serve index.html if offline
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
