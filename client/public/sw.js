// Use daily date-based cache name to force updates on each build
const CACHE_VERSION = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const CACHE_NAME = `rrb-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rrb-runtime-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[QUMUS SW] Installing with cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[QUMUS SW] Caching assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[QUMUS SW] Activating with cache:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[QUMUS SW] Found caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE && (cacheName.startsWith('rrb-') || cacheName.startsWith('qumus-') || cacheName.startsWith('hybridcast-'))) {
            console.log('[QUMUS SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Network first strategy for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then((c) => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request).then((cached) => {
            if (cached) {
              console.log('[SW] Serving from cache:', request.url);
              return cached;
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(request).then((response) => {
        if (!response.ok) {
          return response;
        }

        // Cache successful responses
        const cache = caches.open(RUNTIME_CACHE);
        cache.then((c) => c.put(request, response.clone()));

        return response;
      );
    })
  );
  event.waitUntil(self.clients.claim());
});;

// Background sync for pending items
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-broadcasts') {
    event.waitUntil(syncBroadcasts());
  }
});

async function syncBroadcasts() {
  console.log('[SW] Syncing broadcasts');
  try {
    const response = await fetch('/api/broadcasts/sync', {
      method: 'POST',
    });
    if (response.ok) {
      console.log('[SW] Broadcasts synced');
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'HybridCast Notification';
  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

console.log('[SW] Service Worker loaded');
