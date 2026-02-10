const CACHE_NAME = 'rrb-v9.1';

// Only cache truly static assets - NOT index.html or API routes
const URLS_TO_CACHE = [
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache only truly static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up ALL old caches aggressively
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
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

// Fetch event - NETWORK FIRST for HTML and API, cache-first only for hashed assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = new URL(event.request.url);

  // NEVER intercept API routes - let them go directly to the server
  if (url.pathname.startsWith('/api/')) return;

  // NETWORK FIRST for HTML navigation requests (index.html, /)
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Only serve cached HTML as offline fallback
          return caches.match('/') || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // For hashed assets (/assets/index-XXXX.js), use cache-first since hash guarantees freshness
  if (url.pathname.startsWith('/assets/') && url.pathname.match(/\-[a-zA-Z0-9]{8}\./)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else - network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(
      (async () => {
        try {
          const db = await openDB();
          const pendingActions = await getPendingActions(db);
          
          for (const action of pendingActions) {
            try {
              await fetch(action.url, {
                method: action.method,
                body: JSON.stringify(action.data),
                headers: { 'Content-Type': 'application/json' },
              });
              await removePendingAction(db, action.id);
            } catch (error) {
              console.error('Failed to sync action:', error);
            }
          }
        } catch (error) {
          console.error('Sync failed:', error);
        }
      })()
    );
  }
});

// Push notification handling - Emergency Broadcast System
self.addEventListener('push', (event) => {
  let data = { title: 'RRB Alert', body: 'New notification', level: 'low' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const levelConfig = {
    low: { vibrate: [100] },
    medium: { vibrate: [200, 100, 200] },
    high: { vibrate: [300, 100, 300, 100, 300] },
    critical: { vibrate: [500, 200, 500, 200, 500, 200, 500] },
  };

  const config = levelConfig[data.level] || levelConfig.low;

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: config.vibrate,
    tag: `rrb-${data.level}-${Date.now()}`,
    requireInteraction: data.level === 'critical' || data.level === 'high',
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    data: { url: '/', level: data.level },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow(event.notification.data?.url || '/');
    })
  );
});

// Helper functions for IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rrb-offline', 2);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id' });
      }
    };
  });
}

function getPendingActions(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-actions'], 'readonly');
    const store = transaction.objectStore('pending-actions');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingAction(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-actions'], 'readwrite');
    const store = transaction.objectStore('pending-actions');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
