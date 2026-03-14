const CACHE_NAME = 'qumus-v2.0.0';
const URLS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  // Force immediate activation - don't wait for old SW to finish
  self.skipWaiting();
});

// Activate event - clean up ALL old caches immediately
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
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - NETWORK FIRST for app code, cache fallback for offline only
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip API calls - always go to network
  if (event.request.url.includes('/api/')) {
    return;
  }

  // NETWORK FIRST strategy for all app resources (HTML, JS, CSS)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Got a good network response - cache it for offline use
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed - try cache as fallback (offline mode)
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // For navigation requests, return the cached index page
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return new Response('Offline', { status: 503 });
        });
      })
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

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification from Qumus',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'qumus-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('Qumus', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (let client of clientList) {
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

// Helper functions for IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('qumus-offline', 1);
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
