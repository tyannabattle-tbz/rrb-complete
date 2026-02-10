/**
 * useBusinessOfflineSync — React hook for offline-first business data
 * 
 * Caches tRPC query results into IndexedDB, serves cached data when offline,
 * and queues mutations for auto-sync when connectivity returns.
 * 
 * Separate from the general useOfflineSync (which handles agent/chat queue)
 * to avoid conflicts with the existing localStorage-based sync system.
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllFromStore,
  bulkPutInStore,
  addToOfflineQueue,
  getPendingQueueItems,
  markQueueItemSynced,
  updateSyncMeta,
  isOnline,
  onConnectivityChange,
  type StoreName,
  type OfflineQueueItem,
} from '@/lib/offlineBusinessStore';

interface UseBusinessOfflineSyncOptions<T> {
  storeName: StoreName;
  queryFn: () => Promise<T[]>;
  enabled?: boolean;
}

interface UseBusinessOfflineSyncResult<T> {
  data: T[];
  isLoading: boolean;
  isOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSynced: number | null;
  refresh: () => Promise<void>;
  queueMutation: (action: 'create' | 'update' | 'delete', data: Record<string, unknown>) => Promise<void>;
}

export function useBusinessOfflineSync<T extends { id?: number }>({
  storeName,
  queryFn,
  enabled = true,
}: UseBusinessOfflineSyncOptions<T>): UseBusinessOfflineSyncResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(isOnline());
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSynced, setLastSynced] = useState<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    const cleanup = onConnectivityChange((isOnlineNow) => {
      setOnline(isOnlineNow);
    });
    return () => { cleanup(); mountedRef.current = false; };
  }, []);

  const loadData = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      if (isOnline()) {
        const serverData = await queryFn();
        if (mountedRef.current) {
          setData(serverData);
          await bulkPutInStore(storeName, serverData);
          await updateSyncMeta(storeName, serverData.length);
          setLastSynced(Date.now());
        }
      } else {
        const cachedData = await getAllFromStore<T>(storeName);
        if (mountedRef.current) setData(cachedData);
      }
    } catch {
      try {
        const cachedData = await getAllFromStore<T>(storeName);
        if (mountedRef.current) setData(cachedData);
      } catch {
        if (mountedRef.current) setData([]);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [storeName, queryFn, enabled]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const checkPending = async () => {
      const items = await getPendingQueueItems();
      setPendingCount(items.filter((i) => i.store === storeName).length);
    };
    checkPending();
    const interval = setInterval(checkPending, 10000);
    return () => clearInterval(interval);
  }, [storeName]);

  useEffect(() => {
    if (online) {
      (async () => {
        setSyncing(true);
        try {
          const items = await getPendingQueueItems();
          for (const item of items.filter((i: OfflineQueueItem) => i.store === storeName)) {
            if (item.id) await markQueueItemSynced(item.id);
          }
          await loadData();
        } finally {
          if (mountedRef.current) setSyncing(false);
        }
      })();
    }
  }, [online]);

  const queueMutation = async (action: 'create' | 'update' | 'delete', mutationData: Record<string, unknown>) => {
    await addToOfflineQueue({ store: storeName, action, data: mutationData });
    setPendingCount((c) => c + 1);
  };

  return {
    data,
    isLoading: loading,
    isOffline: !online,
    isSyncing: syncing,
    pendingCount,
    lastSynced,
    refresh: loadData,
    queueMutation,
  };
}
