const CACHE_NAME = 'rrb-radio-v1';
const BUILD_VERSION = new Date().toISOString();
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  console.log('[SW] Installing service worker, build version:', BUILD_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('[SW] Cache addAll failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isHtml = event.request.headers.get('accept')?.includes('text/html');

  // For HTML files, network-first strategy with cache invalidation
  if (isHtml || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Check for new build version
          const buildVersion = response.headers.get('X-Build-Version');
          if (buildVersion && buildVersion !== BUILD_VERSION) {
            console.log('[SW] New build detected:', buildVersion);
            // Clear cache on new build
            caches.delete(CACHE_NAME).then(() => {
              // Notify all clients to reload
              self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                  client.postMessage({
                    type: 'CACHE_UPDATED',
                    buildVersion,
                  });
                });
              });
            });
          }

          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
  } else {
    // For other assets, cache-first strategy
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      }).catch(() => {
        return caches.match('/index.html');
      })
    );
  }
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
