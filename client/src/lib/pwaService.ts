/**
 * PWA Service - Handles offline-first functionality with Service Worker and IndexedDB
 */

export interface CachedItem {
  id: string;
  type: 'broadcast' | 'message' | 'file' | 'media';
  content: string;
  timestamp: number;
  size: number;
  status: 'cached' | 'pending' | 'synced';
}

class PWAService {
  private db: IDBDatabase | null = null;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private isOnline: boolean = navigator.onLine;

  /**
   * Initialize PWA Service
   */
  async initialize(): Promise<void> {
    try {
      // Initialize IndexedDB
      await this.initializeIndexedDB();

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(
          '/sw.js',
          { scope: '/' }
        );
        console.log('[PWA] Service Worker registered');
      }

      // Listen for online/offline events
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());

      console.log('[PWA] Service initialized');
    } catch (error) {
      console.error('[PWA] Initialization failed:', error);
    }
  }

  /**
   * Initialize IndexedDB
   */
  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('HybridCastDB', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[PWA] IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('broadcasts')) {
          db.createObjectStore('broadcasts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'id' });
        }

        console.log('[PWA] IndexedDB schema created');
      };
    });
  }

  /**
   * Cache an item
   */
  async cacheItem(item: CachedItem): Promise<void> {
    if (!this.db) return;

    const storeName = this.getStoreName(item.type);
    const transaction = this.db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(item);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log(`[PWA] Cached ${item.type}: ${item.id}`);
        resolve();
      };
    });
  }

  /**
   * Get cached item
   */
  async getCachedItem(id: string, type: CachedItem['type']): Promise<CachedItem | null> {
    if (!this.db) return null;

    const storeName = this.getStoreName(type);
    const transaction = this.db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  /**
   * Get all cached items
   */
  async getAllCachedItems(type?: CachedItem['type']): Promise<CachedItem[]> {
    if (!this.db) return [];

    const storeNames = type ? [this.getStoreName(type)] : ['broadcasts', 'messages', 'files'];
    const allItems: CachedItem[] = [];

    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      await new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          allItems.push(...(request.result || []));
          resolve(null);
        };
      });
    }

    return allItems;
  }

  /**
   * Clear cache
   */
  async clearCache(type?: CachedItem['type']): Promise<void> {
    if (!this.db) return;

    const storeNames = type ? [this.getStoreName(type)] : ['broadcasts', 'messages', 'files'];

    for (const storeName of storeNames) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          console.log(`[PWA] Cleared ${storeName}`);
          resolve(null);
        };
      });
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalItems: number;
    totalSize: number;
    byType: Record<string, number>;
  }> {
    const items = await this.getAllCachedItems();
    const stats = {
      totalItems: items.length,
      totalSize: items.reduce((sum, item) => sum + item.size, 0),
      byType: {
        broadcast: 0,
        message: 0,
        file: 0,
        media: 0,
      },
    };

    items.forEach((item) => {
      stats.byType[item.type]++;
    });

    return stats;
  }

  /**
   * Sync pending items
   */
  async syncPendingItems(): Promise<void> {
    if (!this.isOnline) {
      console.log('[PWA] Offline - skipping sync');
      return;
    }

    const items = await this.getAllCachedItems();
    const pendingItems = items.filter((item) => item.status === 'pending');

    console.log(`[PWA] Syncing ${pendingItems.length} pending items`);

    for (const item of pendingItems) {
      try {
        // Simulate sync - replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Update item status
        item.status = 'synced';
        await this.cacheItem(item);

        console.log(`[PWA] Synced: ${item.id}`);
      } catch (error) {
        console.error(`[PWA] Sync failed for ${item.id}:`, error);
      }
    }
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    console.log('[PWA] Online');
    this.syncPendingItems();
    window.dispatchEvent(new CustomEvent('pwa-online'));
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('[PWA] Offline');
    window.dispatchEvent(new CustomEvent('pwa-offline'));
  }

  /**
   * Get online status
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get store name for item type
   */
  private getStoreName(type: CachedItem['type']): string {
    const storeMap: Record<CachedItem['type'], string> = {
      broadcast: 'broadcasts',
      message: 'messages',
      file: 'files',
      media: 'cache',
    };
    return storeMap[type];
  }
}

// Export singleton instance
export const pwaService = new PWAService();

// Auto-initialize
if (typeof window !== 'undefined') {
  pwaService.initialize().catch(console.error);
}
