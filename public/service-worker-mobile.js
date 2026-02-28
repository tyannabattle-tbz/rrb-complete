/**
 * Mobile Service Worker with ADA Accessibility
 * Handles offline functionality, caching, and accessibility features
 */

const CACHE_VERSION = 'v1-mobile-ada';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/styles/mobile.css',
  '/scripts/mobile.js',
  '/scripts/accessibility.js',
  '/scripts/voice-commands.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache:', err);
        // Continue even if some assets fail
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes(CACHE_VERSION)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle audio files
  if (request.destination === 'audio' || url.pathname.match(/\.(mp3|wav|ogg|m4a)$/i)) {
    event.respondWith(cacheAudio(request));
    return;
  }

  // Handle images
  if (request.destination === 'image' || url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    event.respondWith(cacheImage(request));
    return;
  }

  // Default: cache first for static assets
  event.respondWith(cacheFirst(request));
});

/**
 * Cache First Strategy
 * Try cache first, fall back to network
 */
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.add(request);
    }
    return response;
  } catch (error) {
    console.warn('[SW] Fetch failed:', error);
    return caches.match('/offline.html') || new Response('Offline - Please check your connection');
  }
}

/**
 * Network First Strategy
 * Try network first, fall back to cache
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Network request failed:', error);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return new Response('Offline - Data not available', { status: 503 });
  }
}

/**
 * Cache Audio Files
 * Prioritize offline availability for audio
 */
async function cacheAudio(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Audio fetch failed:', error);
    return new Response('Audio not available offline', { status: 503 });
  }
}

/**
 * Cache Images
 * Optimize for mobile with responsive images
 */
async function cacheImage(request) {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Image fetch failed:', error);
    // Return a placeholder image
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#999" font-size="12">Image unavailable</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

/**
 * Background Sync for offline queue
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncOfflineMessages());
  }

  if (event.tag === 'sync-audio') {
    event.waitUntil(syncAudioQueue());
  }
});

async function syncOfflineMessages() {
  try {
    const db = await openDatabase();
    const messages = await getOfflineMessages(db);

    for (const message of messages) {
      try {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message),
        });

        if (response.ok) {
          await deleteOfflineMessage(db, message.id);
        }
      } catch (error) {
        console.warn('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}

async function syncAudioQueue() {
  try {
    const db = await openDatabase();
    const queue = await getAudioQueue(db);

    for (const item of queue) {
      try {
        const response = await fetch('/api/audio/upload', {
          method: 'POST',
          body: item.blob,
        });

        if (response.ok) {
          await deleteAudioQueueItem(db, item.id);
        }
      } catch (error) {
        console.warn('[SW] Failed to upload audio:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Audio sync error:', error);
  }
}

/**
 * IndexedDB helpers
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('RRB-Offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('messages')) {
        db.createObjectStore('messages', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('audio')) {
        db.createObjectStore('audio', { keyPath: 'id' });
      }
    };
  });
}

async function getOfflineMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['messages'], 'readonly');
    const store = transaction.objectStore('messages');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deleteOfflineMessage(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['messages'], 'readwrite');
    const store = transaction.objectStore('messages');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

async function getAudioQueue(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audio'], 'readonly');
    const store = transaction.objectStore('audio');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

async function deleteAudioQueueItem(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['audio'], 'readwrite');
    const store = transaction.objectStore('audio');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Push notifications with accessibility
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: data.tag || 'notification',
    requireInteraction: data.priority === 'high',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
    // Accessibility
    lang: 'en-US',
    dir: 'auto',
  };

  event.waitUntil(self.registration.showNotification(data.title || 'RRB', options));
});

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
    );
  }
});

console.log('[SW] Mobile service worker loaded');
