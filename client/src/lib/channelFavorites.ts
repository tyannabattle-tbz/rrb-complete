/**
 * Channel Favorites Service
 * Manages user's favorite channels with localStorage persistence
 */

const FAVORITES_KEY = 'rrb_channel_favorites';
const MAX_FAVORITES = 20;

export interface FavoriteChannel {
  channelId: string;
  addedAt: number;
  label?: string;
}

/**
 * Get all favorite channels
 */
export function getFavorites(): FavoriteChannel[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as FavoriteChannel[];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

/**
 * Check if a channel is favorited
 */
export function isFavorited(channelId: string): boolean {
  return getFavorites().some(fav => fav.channelId === channelId);
}

/**
 * Add a channel to favorites
 */
export function addFavorite(channelId: string, label?: string): boolean {
  try {
    const favorites = getFavorites();
    
    // Check if already favorited
    if (favorites.some(fav => fav.channelId === channelId)) {
      return false;
    }

    // Check max limit
    if (favorites.length >= MAX_FAVORITES) {
      console.warn(`Maximum favorites (${MAX_FAVORITES}) reached`);
      return false;
    }

    favorites.push({
      channelId,
      addedAt: Date.now(),
      label,
    });

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error adding favorite:', error);
    return false;
  }
}

/**
 * Remove a channel from favorites
 */
export function removeFavorite(channelId: string): boolean {
  try {
    const favorites = getFavorites().filter(fav => fav.channelId !== channelId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error removing favorite:', error);
    return false;
  }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(channelId: string, label?: string): boolean {
  if (isFavorited(channelId)) {
    return removeFavorite(channelId);
  } else {
    return addFavorite(channelId, label);
  }
}

/**
 * Clear all favorites
 */
export function clearFavorites(): boolean {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites:', error);
    return false;
  }
}

/**
 * Get favorite count
 */
export function getFavoriteCount(): number {
  return getFavorites().length;
}

/**
 * Export favorites as JSON
 */
export function exportFavorites(): string {
  return JSON.stringify(getFavorites(), null, 2);
}

/**
 * Import favorites from JSON
 */
export function importFavorites(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as FavoriteChannel[];
    if (!Array.isArray(data)) return false;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error importing favorites:', error);
    return false;
  }
}
