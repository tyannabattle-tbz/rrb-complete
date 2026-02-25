const CACHE_NAME = 'rrb-emergency-v1.0';
const CRITICAL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache app shell and critical assets for offline access
self.addEventListener('install', (event) => {
  console.log('[SW] Installing - caching critical assets for offline emergency access');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CRITICAL_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache:', err);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating - cleaning old caches');
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

// Fetch event - OFFLINE-FIRST strategy for emergency resilience
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome extensions
  if (event.request.url.startsWith('chrome-extension://')) return;

  const url = new URL(event.request.url);

  // API routes: Try network first, fallback to offline data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            // Cache successful API responses for offline use
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed - try cache, then return offline indicator
          return caches.match(event.request)
            .then((cached) => cached || new Response(
              JSON.stringify({ offline: true, message: 'Emergency mode - using cached data' }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            ));
        })
    );
    return;
  }

  // HTML navigation requests: OFFLINE-FIRST for emergency access
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      caches.match(event.request)
        .then((cached) => {
          if (cached) return cached;
          // Try network if not in cache
          return fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
              }
              return response;
            })
            .catch(() => {
              // Fallback to cached home page or emergency page
              return caches.match('/') || new Response(
                '<html><body><h1>Emergency Mode</h1><p>RRB Emergency Broadcast System - Offline</p></body></html>',
                { 
                  status: 200,
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            });
        })
    );
    return;
  }

  // Assets: CACHE-FIRST since hashed assets are immutable
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

  // Everything else: OFFLINE-FIRST with network fallback
  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request))
      .catch(() => {
        // Return offline indicator
        return new Response('Offline - Emergency mode active', { status: 503 });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-sos-alert') {
    event.waitUntil(syncSOSAlert());
  } else if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

async function syncSOSAlert() {
  try {
    const db = await openDB();
    const pendingSOS = await getPendingSOSAlerts(db);
    
    for (const alert of pendingSOS) {
      try {
        await fetch('/api/emergency/sos', {
          method: 'POST',
          body: JSON.stringify(alert),
          headers: { 'Content-Type': 'application/json' },
        });
        await removePendingSOS(db, alert.id);
        console.log('[SW] SOS alert synced successfully');
      } catch (error) {
        console.error('[SW] Failed to sync SOS alert:', error);
      }
    }
  } catch (error) {
    console.error('[SW] SOS sync failed:', error);
  }
}

async function syncOfflineActions() {
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
        console.error('[SW] Failed to sync action:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Offline sync failed:', error);
  }
}

// Push notification handling - Emergency Broadcast System
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  let data = { 
    title: 'RRB Emergency Alert', 
    body: 'Critical notification received', 
    level: 'critical',
    broadcast: true 
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  // Store emergency broadcast in IndexedDB for offline access
  if (data.broadcast) {
    storeEmergencyBroadcast(data);
  }

  const levelConfig = {
    low: { vibrate: [100], tag: 'rrb-low' },
    medium: { vibrate: [200, 100, 200], tag: 'rrb-medium' },
    high: { vibrate: [300, 100, 300, 100, 300], tag: 'rrb-high' },
    critical: { vibrate: [500, 200, 500, 200, 500, 200, 500], tag: 'rrb-critical' },
  };

  const config = levelConfig[data.level] || levelConfig.critical;

  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: config.vibrate,
    tag: config.tag,
    requireInteraction: data.level === 'critical' || data.level === 'high',
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    data: { url: data.url || '/', level: data.level, broadcast: data.broadcast },
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

// HybridCast Mesh Networking - Offline communication via WebBluetooth/WebUSB
self.addEventListener('message', (event) => {
  if (event.data.type === 'HYBRIDCAST_MESH_INIT') {
    console.log('[SW] HybridCast mesh networking initialized');
    event.ports[0].postMessage({ status: 'ready', meshEnabled: true });
  } else if (event.data.type === 'HYBRIDCAST_BROADCAST') {
    console.log('[SW] Broadcasting via HybridCast mesh:', event.data.message);
    // Store for mesh relay
    storeEmergencyBroadcast(event.data.message);
  }
});

// Helper functions for IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('rrb-emergency', 3);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending-actions')) {
        db.createObjectStore('pending-actions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pending-sos')) {
        db.createObjectStore('pending-sos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('emergency-broadcasts')) {
        db.createObjectStore('emergency-broadcasts', { keyPath: 'id' });
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

function getPendingSOSAlerts(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-sos'], 'readonly');
    const store = transaction.objectStore('pending-sos');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingSOS(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pending-sos'], 'readwrite');
    const store = transaction.objectStore('pending-sos');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

function storeEmergencyBroadcast(broadcast) {
  openDB().then((db) => {
    const transaction = db.transaction(['emergency-broadcasts'], 'readwrite');
    const store = transaction.objectStore('emergency-broadcasts');
    store.put({
      id: Date.now(),
      ...broadcast,
      timestamp: new Date().toISOString(),
    });
  }).catch((err) => {
    console.error('[SW] Failed to store emergency broadcast:', err);
  });
}

console.log('[SW] RRB Emergency Service Worker loaded - Offline-first mode active');
