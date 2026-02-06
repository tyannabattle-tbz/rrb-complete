/**
 * HybridCast IndexedDB Caching Service
 * Provides offline-first caching for broadcasts, metadata, and analytics
 */

interface CachedBroadcast {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  viewers: number;
  duration: number;
  quality: string;
  metadata: Record<string, unknown>;
}

interface CacheStats {
  totalItems: number;
  totalSize: number;
  oldestItem: number;
  newestItem: number;
}

class HybridCastCacheService {
  private dbName = 'hybridcast-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create broadcasts store
        if (!db.objectStoreNames.contains('broadcasts')) {
          const broadcastStore = db.createObjectStore('broadcasts', { keyPath: 'id' });
          broadcastStore.createIndex('timestamp', 'timestamp', { unique: false });
          broadcastStore.createIndex('viewers', 'viewers', { unique: false });
        }

        // Create metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }

        // Create sync log store
        if (!db.objectStoreNames.contains('syncLog')) {
          const syncStore = db.createObjectStore('syncLog', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async cacheBroadcast(broadcast: CachedBroadcast): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('broadcasts', 'readwrite');
      const store = transaction.objectStore('broadcasts');
      const request = store.put(broadcast);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getBroadcast(id: string): Promise<CachedBroadcast | undefined> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('broadcasts', 'readonly');
      const store = transaction.objectStore('broadcasts');
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllBroadcasts(): Promise<CachedBroadcast[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('broadcasts', 'readonly');
      const store = transaction.objectStore('broadcasts');
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getBroadcastsSince(timestamp: number): Promise<CachedBroadcast[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('broadcasts', 'readonly');
      const store = transaction.objectStore('broadcasts');
      const index = store.index('timestamp');
      const range = IDBKeyRange.lowerBound(timestamp, false);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteBroadcast(id: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('broadcasts', 'readwrite');
      const store = transaction.objectStore('broadcasts');
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearOldBroadcasts(maxAge: number): Promise<number> {
    if (!this.db) await this.init();

    const cutoffTime = Date.now() - maxAge;
    const broadcasts = await this.getBroadcastsSince(0);
    let deletedCount = 0;

    for (const broadcast of broadcasts) {
      if (broadcast.timestamp < cutoffTime) {
        await this.deleteBroadcast(broadcast.id);
        deletedCount++;
      }
    }

    return deletedCount;
  }

  async setMetadata(key: string, value: unknown): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('metadata', 'readwrite');
      const store = transaction.objectStore('metadata');
      const request = store.put({ key, value, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getMetadata(key: string): Promise<unknown> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('metadata', 'readonly');
      const store = transaction.objectStore('metadata');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value);
    });
  }

  async logSync(action: string, status: 'success' | 'failed', details?: Record<string, unknown>): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('syncLog', 'readwrite');
      const store = transaction.objectStore('syncLog');
      const request = store.add({
        action,
        status,
        details,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSyncLog(limit: number = 50): Promise<unknown[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('syncLog', 'readonly');
      const store = transaction.objectStore('syncLog');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const results: unknown[] = [];
      let count = 0;

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && count < limit) {
          results.push(cursor.value);
          count++;
          cursor.continue();
        } else {
          resolve(results);
        }
      };
    });
  }

  async getStats(): Promise<CacheStats> {
    if (!this.db) await this.init();

    const broadcasts = await this.getAllBroadcasts();
    const timestamps = broadcasts.map(b => b.timestamp);

    return {
      totalItems: broadcasts.length,
      totalSize: broadcasts.reduce((sum, b) => sum + JSON.stringify(b).length, 0),
      oldestItem: Math.min(...timestamps, Infinity),
      newestItem: Math.max(...timestamps, 0),
    };
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['broadcasts', 'metadata', 'syncLog'], 'readwrite');
      
      transaction.objectStore('broadcasts').clear();
      transaction.objectStore('metadata').clear();
      transaction.objectStore('syncLog').clear();

      transaction.onerror = () => reject(transaction.error);
      transaction.oncomplete = () => resolve();
    });
  }
}

export const hybridcastCache = new HybridCastCacheService();
