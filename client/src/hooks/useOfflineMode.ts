import { useEffect, useState } from 'react';

interface CachedData {
  podcasts?: any[];
  episodes?: any[];
  streams?: any[];
  timestamp: number;
}

const OFFLINE_CACHE_KEY = 'manus-offline-cache';
const OFFLINE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function useOfflineMode() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [cachedData, setCachedData] = useState<CachedData | null>(null);
  const [isCacheValid, setIsCacheValid] = useState<boolean>(false);

  // Monitor online/offline status
  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      loadCachedData();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = () => {
    try {
      const cached = localStorage.getItem(OFFLINE_CACHE_KEY);
      if (!cached) {
        setIsCacheValid(false);
        return;
      }

      const data: CachedData = JSON.parse(cached);
      const age = Date.now() - data.timestamp;

      if (age > OFFLINE_CACHE_TTL) {
        localStorage.removeItem(OFFLINE_CACHE_KEY);
        setIsCacheValid(false);
        return;
      }

      setCachedData(data);
      setIsCacheValid(true);
    } catch (error) {
      console.error('Failed to load offline cache:', error);
      setIsCacheValid(false);
    }
  };

  const cacheData = (data: Partial<CachedData>) => {
    try {
      const existing = cachedData || { timestamp: Date.now() };
      const updated: CachedData = {
        ...existing,
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(updated));
      setCachedData(updated);
      setIsCacheValid(true);
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  };

  const clearCache = () => {
    try {
      localStorage.removeItem(OFFLINE_CACHE_KEY);
      setCachedData(null);
      setIsCacheValid(false);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  return {
    isOnline,
    cachedData,
    isCacheValid,
    cacheData,
    clearCache,
    canUseOfflineMode: !isOnline && isCacheValid,
  };
}
