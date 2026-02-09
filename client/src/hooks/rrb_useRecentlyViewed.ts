import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export interface RecentlyViewedItem {
  label: string;
  href: string;
  timestamp: number;
}

const STORAGE_KEY = 'recently_viewed_pages';
const MAX_ITEMS = 5;

export function useRecentlyViewed(allPages?: Array<{ label: string; href: string }>) {
  const [location] = useLocation();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setRecentlyViewed(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recently viewed pages', e);
      }
    }
  }, []);

  // Track current page
  useEffect(() => {
    if (!allPages) return;
    const currentPage = allPages.find((p) => p.href === location);
    if (!currentPage) return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((item) => item.href !== currentPage.href);

      // Add to front with current timestamp
      const updated = [
        {
          label: currentPage.label,
          href: currentPage.href,
          timestamp: Date.now(),
        },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

      return updated;
    });
  }, [location, allPages]);

  return recentlyViewed;
}
