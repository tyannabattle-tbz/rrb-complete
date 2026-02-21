/**
 * Channel Favorites Service
 * Manages favorite channels with localStorage persistence
 */

const FAVORITES_KEY = 'rrb-favorite-channels';

class FavoritesService {
  private favorites: Set<string> = new Set();
  private listeners: Set<(favorites: Set<string>) => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load favorites from localStorage
   */
  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        this.favorites = new Set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load favorites from storage:', error);
      this.favorites = new Set();
    }
  }

  /**
   * Save favorites to localStorage
   */
  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(this.favorites)));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save favorites to storage:', error);
    }
  }

  /**
   * Add a channel to favorites
   */
  addFavorite(channelId: string) {
    if (!this.favorites.has(channelId)) {
      this.favorites.add(channelId);
      this.saveToStorage();
    }
  }

  /**
   * Remove a channel from favorites
   */
  removeFavorite(channelId: string) {
    if (this.favorites.has(channelId)) {
      this.favorites.delete(channelId);
      this.saveToStorage();
    }
  }

  /**
   * Toggle favorite status for a channel
   */
  toggleFavorite(channelId: string) {
    if (this.favorites.has(channelId)) {
      this.removeFavorite(channelId);
    } else {
      this.addFavorite(channelId);
    }
  }

  /**
   * Check if a channel is favorited
   */
  isFavorite(channelId: string): boolean {
    return this.favorites.has(channelId);
  }

  /**
   * Get all favorite channel IDs
   */
  getFavorites(): string[] {
    return Array.from(this.favorites);
  }

  /**
   * Get count of favorites
   */
  getFavoriteCount(): number {
    return this.favorites.size;
  }

  /**
   * Clear all favorites
   */
  clearFavorites() {
    this.favorites.clear();
    this.saveToStorage();
  }

  /**
   * Subscribe to favorite changes
   */
  subscribe(callback: (favorites: Set<string>) => void) {
    this.listeners.add(callback);
    // Immediately call with current state
    callback(new Set(this.favorites));
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all subscribers of changes
   */
  private notifyListeners() {
    this.listeners.forEach(callback => {
      callback(new Set(this.favorites));
    });
  }
}

// Export singleton instance
export const favoritesService = new FavoritesService();
