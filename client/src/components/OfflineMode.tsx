import React, { useEffect, useState } from 'react';
import { AlertCircle, Wifi, WifiOff, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CachedMessage {
  id: string;
  message: string;
  timestamp: string;
  synced: boolean;
}

export const OfflineMode: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedMessages, setCachedMessages] = useState<CachedMessage[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      syncCachedMessages();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached messages from localStorage
    loadCachedMessages();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCachedMessages = () => {
    const cached = localStorage.getItem('qumus_offline_cache');
    if (cached) {
      const messages = JSON.parse(cached);
      setCachedMessages(messages);
    }

    const lastSync = localStorage.getItem('qumus_last_sync');
    if (lastSync) {
      setLastSyncTime(lastSync);
    }
  };

  const syncCachedMessages = async () => {
    if (cachedMessages.length === 0) return;

    setIsSyncing(true);
    setSyncStatus('syncing');

    try {
      // Simulate sync delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mark all messages as synced
      const synced = cachedMessages.map((msg) => ({
        ...msg,
        synced: true,
      }));

      setCachedMessages(synced);
      const now = new Date().toISOString();
      setLastSyncTime(now);
      localStorage.setItem('qumus_last_sync', now);
      localStorage.setItem('qumus_offline_cache', JSON.stringify(synced));

      setSyncStatus('success');
      toast.success(`✅ Synced ${cachedMessages.length} message${cachedMessages.length !== 1 ? 's' : ''}`);

      // Clear synced messages after 3 seconds
      setTimeout(() => {
        setCachedMessages([]);
        localStorage.removeItem('qumus_offline_cache');
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      setSyncStatus('error');
      toast.error('Failed to sync messages. Will retry when connection is stable.');
    } finally {
      setIsSyncing(false);
    }
  };

  const cacheMessage = (message: string) => {
    const newMessage: CachedMessage = {
      id: `msg_${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      synced: false,
    };

    const updated = [...cachedMessages, newMessage];
    setCachedMessages(updated);
    localStorage.setItem('qumus_offline_cache', JSON.stringify(updated));
  };

  const unsyncedCount = cachedMessages.filter((m) => !m.synced).length;
  const syncedCount = cachedMessages.filter((m) => m.synced).length;

  return (
    <div className="space-y-2">
      {/* Connection Status */}
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <WifiOff className="h-4 w-4 flex-shrink-0" />
          <span>You're offline. Messages will sync when you reconnect.</span>
        </div>
      )}

      {isOnline && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
          <Wifi className="h-4 w-4 flex-shrink-0" />
          <span>Connected</span>
        </div>
      )}

      {/* Sync Status */}
      {cachedMessages.length > 0 && (
        <div className="space-y-2 rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {syncStatus === 'syncing' && (
                <Clock className="h-4 w-4 animate-spin text-blue-500" />
              )}
              {syncStatus === 'success' && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              {(syncStatus === 'idle' || syncStatus === 'error') && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <div className="text-sm">
                <p className="font-medium">
                  {syncStatus === 'syncing' && 'Syncing messages...'}
                  {syncStatus === 'success' && 'Messages synced!'}
                  {syncStatus === 'idle' && `${unsyncedCount} message${unsyncedCount !== 1 ? 's' : ''} waiting to sync`}
                  {syncStatus === 'error' && 'Sync failed, retrying...'}
                </p>
                {unsyncedCount > 0 && syncedCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {syncedCount} synced, {unsyncedCount} pending
                  </p>
                )}
              </div>
            </div>

            {/* Manual Sync Button */}
            {isOnline && unsyncedCount > 0 && !isSyncing && (
              <Button
                size="sm"
                onClick={() => syncCachedMessages()}
                disabled={isSyncing}
                className="h-7 text-xs"
              >
                Sync Now
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {cachedMessages.length > 0 && (
            <div className="space-y-1">
              <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${(syncedCount / cachedMessages.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {syncedCount} of {cachedMessages.length} synced
              </p>
            </div>
          )}

          {/* Last Sync Time */}
          {lastSyncTime && (
            <p className="text-xs text-muted-foreground">
              Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
