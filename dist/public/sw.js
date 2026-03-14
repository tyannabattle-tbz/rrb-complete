// Force cache bust on every deployment
const CACHE_VERSION = 'v2-' + new Date().toISOString().split('T')[0];
const CACHE_NAME = `qumus-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
];

// Install event - cache essential assets only
self.addEventListener('install', (event) => {
  console.log('[QUMUS SW] Installing with cache:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[QUMUS SW] Caching essential assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Activate event - clean up ALL old caches immediately
self.addEventListener('activate', (event) => {
  console.log('[QUMUS SW] Activating with cache:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[QUMUS SW] Cleaning up old caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[QUMUS SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - NETWORK FIRST for everything
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

  // Skip API calls entirely - always go to network, no caching
  if (request.url.includes('/api/')) {
    return;
  }

  // NETWORK FIRST for all resources (HTML, JS, CSS, images)
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.ok) {
          // Cache the fresh response for offline fallback
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - serve from cache (offline mode)
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log('[SW] Serving from cache (offline):', request.url);
            return cached;
          }
          // For navigation requests, return cached index page
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

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
  const title = data.title || 'QUMUS Notification';
  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    actions: data.actions || [],
  };

  // Conference-specific notifications get special treatment
  if (data.type === 'conference_live') {
    options.tag = `conference-live-${data.conferenceId}`;
    options.requireInteraction = true;
    options.actions = [
      { action: 'join', title: 'Join Now' },
      { action: 'dismiss', title: 'Later' },
    ];
    options.data = { url: `/conference/room/${data.conferenceId}`, type: 'conference_live' };
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || '/';

  // Handle action buttons
  if (event.action === 'join' && data.url) {
    event.waitUntil(clients.openWindow(data.url));
    return;
  }
  if (event.action === 'dismiss') {
    return;
  }

  // Default click - open the target URL
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

console.log('[SW] Service Worker loaded - Network First Strategy');
