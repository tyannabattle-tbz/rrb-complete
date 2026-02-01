import React, { useEffect, useState } from 'react';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

export const OfflineMode: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedMessages, setCachedMessages] = useState<number>(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Sync cached messages when coming back online
      syncCachedMessages();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached message count from localStorage
    const cached = localStorage.getItem('qumus_cached_messages');
    if (cached) {
      setCachedMessages(parseInt(cached, 10));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncCachedMessages = () => {
    // Sync logic would go here
    localStorage.removeItem('qumus_cached_messages');
    setCachedMessages(0);
  };

  const cacheMessage = (message: string) => {
    const cached = JSON.parse(localStorage.getItem('qumus_offline_cache') || '[]');
    cached.push({
      message,
      timestamp: new Date().toISOString(),
      synced: false,
    });
    localStorage.setItem('qumus_offline_cache', JSON.stringify(cached));
    localStorage.setItem('qumus_cached_messages', String(cached.length));
    setCachedMessages(cached.length);
  };

  return (
    <div className="space-y-2">
      {!isOnline && (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
          <WifiOff className="h-4 w-4" />
          <span>You're offline. Messages will sync when you reconnect.</span>
        </div>
      )}

      {cachedMessages > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
          <AlertCircle className="h-4 w-4" />
          <span>{cachedMessages} message{cachedMessages !== 1 ? 's' : ''} waiting to sync</span>
        </div>
      )}

      {isOnline && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-200">
          <Wifi className="h-4 w-4" />
          <span>Connected</span>
        </div>
      )}
    </div>
  );
};
