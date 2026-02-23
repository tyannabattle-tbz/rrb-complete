import { useState, useEffect } from 'react';

export interface PodcastData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  audioUrl: string;
  duration: number;
  publishedAt: string;
}

export function useOfflinePodcasts() {
  const [podcasts, setPodcasts] = useState<PodcastData[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cachedPodcasts, setCachedPodcasts] = useState<PodcastData[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache podcasts to localStorage
  const cachePodcasts = (data: PodcastData[]) => {
    try {
      localStorage.setItem(
        'cached_podcasts',
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
      setCachedPodcasts(data);
    } catch (error) {
      console.error('Failed to cache podcasts:', error);
    }
  };

  // Retrieve cached podcasts
  const getCachedPodcasts = (): PodcastData[] => {
    try {
      const cached = localStorage.getItem('cached_podcasts');
      if (cached) {
        const { data } = JSON.parse(cached);
        return data;
      }
    } catch (error) {
      console.error('Failed to retrieve cached podcasts:', error);
    }
    return [];
  };

  // Load cached podcasts on mount
  useEffect(() => {
    const cached = getCachedPodcasts();
    if (cached.length > 0) {
      setCachedPodcasts(cached);
    }
  }, []);

  // Get podcasts (online or cached)
  const getPodcasts = (): PodcastData[] => {
    return isOnline ? podcasts : cachedPodcasts;
  };

  // Clear cache
  const clearCache = () => {
    try {
      localStorage.removeItem('cached_podcasts');
      setCachedPodcasts([]);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  return {
    podcasts: getPodcasts(),
    isOnline,
    cachedPodcasts,
    cachePodcasts,
    getCachedPodcasts,
    clearCache,
  };
}
