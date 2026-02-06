import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OfflineStatus {
  isOnline: boolean;
  cachedItems: number;
  lastSyncTime: Date | null;
  cacheSize: string;
}

export function HybridCastOfflineIndicator() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    cachedItems: 0,
    lastSyncTime: null,
    cacheSize: '0 MB',
  });

  useEffect(() => {
    // Check online status
    const handleOnline = () => setStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStatus(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check IndexedDB cache
    const checkCache = async () => {
      try {
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('hybridcast-cache', 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        const transaction = db.transaction('broadcasts', 'readonly');
        const store = transaction.objectStore('broadcasts');
        const countRequest = store.count();

        countRequest.onsuccess = () => {
          const count = countRequest.result;
          setStatus(prev => ({
            ...prev,
            cachedItems: count,
            lastSyncTime: new Date(),
            cacheSize: `${(count * 0.5).toFixed(1)} MB`,
          }));
        };
      } catch (error) {
        console.log('[HybridCast] Cache check skipped:', error);
      }
    };

    checkCache();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <Badge
        variant={status.isOnline ? 'default' : 'destructive'}
        className="flex items-center gap-1"
      >
        {status.isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </Badge>

      {/* Cache Status */}
      {status.cachedItems > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Database className="w-3 h-3" />
          <span>{status.cachedItems} cached</span>
        </Badge>
      )}

      {/* Last Sync Time */}
      {status.lastSyncTime && (
        <span className="text-xs text-slate-400">
          Synced {formatTime(status.lastSyncTime)}
        </span>
      )}
    </div>
  );
}
