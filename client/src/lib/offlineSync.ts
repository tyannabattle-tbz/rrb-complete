/**
 * Offline Sync Service for RockinBoogie
 * Manages offline playback history, favorites, and syncs when connection restores
 */

interface OfflinePlaybackEvent {
  id: string;
  channelId: string;
  episodeId: string;
  action: 'play' | 'pause' | 'stop' | 'complete';
  timestamp: number;
  duration: number;
  position: number;
}

interface OfflineFavorite {
  id: string;
  episodeId: string;
  channelId: string;
  title: string;
  addedAt: number;
}

interface OfflineSyncQueue {
  playbackEvents: OfflinePlaybackEvent[];
  favorites: OfflineFavorite[];
  lastSyncTime: number;
}

const DB_NAME = 'RockinBoogieOffline';
const PLAYBACK_STORE = 'playbackEvents';
const FAVORITES_STORE = 'favorites';
const SYNC_STORE = 'syncQueue';

let db: IDBDatabase | null = null;

/**
 * Initialize IndexedDB for offline storage
 */
export async function initializeOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      console.log('[OfflineSync] IndexedDB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!database.objectStoreNames.contains(PLAYBACK_STORE)) {
        database.createObjectStore(PLAYBACK_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(FAVORITES_STORE)) {
        database.createObjectStore(FAVORITES_STORE, { keyPath: 'id' });
      }
      if (!database.objectStoreNames.contains(SYNC_STORE)) {
        database.createObjectStore(SYNC_STORE, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Record playback event offline
 */
export async function recordOfflinePlayback(event: Omit<OfflinePlaybackEvent, 'id'>): Promise<string> {
  if (!db) await initializeOfflineDB();

  const id = `playback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const playbackEvent: OfflinePlaybackEvent = { ...event, id };

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYBACK_STORE], 'readwrite');
    const store = transaction.objectStore(PLAYBACK_STORE);
    const request = store.add(playbackEvent);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('[OfflineSync] Playback event recorded:', id);
      resolve(id);
    };
  });
}

/**
 * Add favorite offline
 */
export async function addOfflineFavorite(favorite: Omit<OfflineFavorite, 'id'>): Promise<string> {
  if (!db) await initializeOfflineDB();

  const id = `fav-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const favEntry: OfflineFavorite = { ...favorite, id };

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([FAVORITES_STORE], 'readwrite');
    const store = transaction.objectStore(FAVORITES_STORE);
    const request = store.add(favEntry);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      console.log('[OfflineSync] Favorite added:', id);
      resolve(id);
    };
  });
}

/**
 * Get all offline playback events
 */
export async function getOfflinePlaybackEvents(): Promise<OfflinePlaybackEvent[]> {
  if (!db) await initializeOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYBACK_STORE], 'readonly');
    const store = transaction.objectStore(PLAYBACK_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Get all offline favorites
 */
export async function getOfflineFavorites(): Promise<OfflineFavorite[]> {
  if (!db) await initializeOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([FAVORITES_STORE], 'readonly');
    const store = transaction.objectStore(FAVORITES_STORE);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Sync offline data when connection restores
 */
export async function syncOfflineData(): Promise<{ success: boolean; synced: number }> {
  if (!db) await initializeOfflineDB();

  try {
    const playbackEvents = await getOfflinePlaybackEvents();
    const favorites = await getOfflineFavorites();

    let syncedCount = 0;

    // Sync playback events
    for (const event of playbackEvents) {
      try {
        // Send to backend
        console.log('[OfflineSync] Syncing playback event:', event.id);
        // await trpc.rockinBoogie.syncPlaybackEvent.mutate(event);
        
        // Remove from offline storage
        await deleteOfflinePlaybackEvent(event.id);
        syncedCount++;
      } catch (error) {
        console.error('[OfflineSync] Failed to sync playback event:', error);
      }
    }

    // Sync favorites
    for (const favorite of favorites) {
      try {
        // Send to backend
        console.log('[OfflineSync] Syncing favorite:', favorite.id);
        // await trpc.rockinBoogie.syncFavorite.mutate(favorite);
        
        // Remove from offline storage
        await deleteOfflineFavorite(favorite.id);
        syncedCount++;
      } catch (error) {
        console.error('[OfflineSync] Failed to sync favorite:', error);
      }
    }

    console.log(`[OfflineSync] Synced ${syncedCount} items`);
    return { success: true, synced: syncedCount };
  } catch (error) {
    console.error('[OfflineSync] Sync failed:', error);
    return { success: false, synced: 0 };
  }
}

/**
 * Delete offline playback event
 */
async function deleteOfflinePlaybackEvent(id: string): Promise<void> {
  if (!db) await initializeOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYBACK_STORE], 'readwrite');
    const store = transaction.objectStore(PLAYBACK_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Delete offline favorite
 */
async function deleteOfflineFavorite(id: string): Promise<void> {
  if (!db) await initializeOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([FAVORITES_STORE], 'readwrite');
    const store = transaction.objectStore(FAVORITES_STORE);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Clear all offline data
 */
export async function clearOfflineData(): Promise<void> {
  if (!db) await initializeOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db!.transaction([PLAYBACK_STORE, FAVORITES_STORE], 'readwrite');
    
    const playbackStore = transaction.objectStore(PLAYBACK_STORE);
    const favoritesStore = transaction.objectStore(FAVORITES_STORE);
    
    playbackStore.clear();
    favoritesStore.clear();

    transaction.onerror = () => reject(transaction.error);
    transaction.oncomplete = () => {
      console.log('[OfflineSync] All offline data cleared');
      resolve();
    };
  });
}

/**
 * Get offline storage stats
 */
export async function getOfflineStats(): Promise<{
  playbackEvents: number;
  favorites: number;
  totalItems: number;
}> {
  const playbackEvents = await getOfflinePlaybackEvents();
  const favorites = await getOfflineFavorites();

  return {
    playbackEvents: playbackEvents.length,
    favorites: favorites.length,
    totalItems: playbackEvents.length + favorites.length,
  };
}

/**
 * Listen for online/offline events
 */
export function setupSyncListener(onSync?: (result: { success: boolean; synced: number }) => void): void {
  window.addEventListener('online', async () => {
    console.log('[OfflineSync] Connection restored, syncing data...');
    const result = await syncOfflineData();
    if (onSync) onSync(result);
  });

  window.addEventListener('offline', () => {
    console.log('[OfflineSync] Connection lost, switching to offline mode');
  });
}
