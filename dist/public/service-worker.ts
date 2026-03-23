/**
 * Service Worker for PWA Auto-Update and Background Sync
 * Handles offline functionality, cache management, and automatic updates
 */

const CACHE_NAME = 'manus-agent-v1';
const RUNTIME_CACHE = 'manus-runtime-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install event - cache assets
self.addEventListener('install', (event: ExtendedInstallEvent) => {
  console.log('[SW] Installing service worker');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );

  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendedActivateEvent) => {
  console.log('[SW] Activating service worker');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Claim all clients
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event: ExtendedFetchEvent) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip API calls - handle separately
  if (request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Cache first for static assets
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Network first for HTML and dynamic content
  event.respondWith(networkFirstStrategy(request));
});

// Background sync event - sync data when back online
self.addEventListener('sync', (event: ExtendedSyncEvent) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// Message event - handle messages from clients
self.addEventListener('message', (event: ExtendedMessageEvent) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'CHECK_UPDATE') {
    checkForUpdates();
  }
});

/**
 * Cache-first strategy for static assets
 */
async function cacheFirstStrategy(request: Request): Promise<Response> {
  const cached = await caches.match(request);

  if (cached) {
    console.log('[SW] Serving from cache:', request.url);
    return cached;
  }

  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Offline - resource not available', { status: 503 });
  }
}

/**
 * Network-first strategy for dynamic content
 */
async function networkFirstStrategy(request: Request): Promise<Response> {
  try {
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);

    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    return new Response('Offline - please check your connection', { status: 503 });
  }
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url: string): boolean {
  return /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/.test(url);
}

/**
 * Sync data when back online
 */
async function syncData(): Promise<void> {
  console.log('[SW] Syncing data with server');

  try {
    // Get all clients
    const clients = await self.clients.matchAll();

    // Notify all clients to sync
    for (const client of clients) {
      client.postMessage({
        type: 'SYNC_DATA',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

/**
 * Check for app updates
 */
async function checkForUpdates(): Promise<void> {
  console.log('[SW] Checking for updates');

  try {
    const response = await fetch('/version.json');
    const data = await response.json();

    // Get all clients
    const clients = await self.clients.matchAll();

    // Notify clients of update
    for (const client of clients) {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        version: data.version,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('[SW] Update check failed:', error);
  }
}

// Type definitions
interface ExtendedInstallEvent extends ExtendedEvent {
  waitUntil(promise: Promise<any>): void;
}

interface ExtendedActivateEvent extends ExtendedEvent {
  waitUntil(promise: Promise<any>): void;
}

interface ExtendedFetchEvent extends ExtendedEvent {
  request: Request;
  respondWith(promise: Promise<Response>): void;
}

interface ExtendedSyncEvent extends ExtendedEvent {
  tag: string;
  waitUntil(promise: Promise<any>): void;
}

interface ExtendedMessageEvent extends ExtendedEvent {
  data: any;
  source: any;
}

interface ExtendedEvent {
  type: string;
}

declare const self: ServiceWorkerGlobalScope;
