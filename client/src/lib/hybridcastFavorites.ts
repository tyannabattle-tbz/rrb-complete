/**
 * HybridCast Favorites & Pinned Tabs Manager
 * Manages user's favorite tabs, pinned tabs, and custom groups
 */

export interface TabGroup {
  id: string;
  name: string;
  description: string;
  tabIds: string[];
  createdAt: number;
  updatedAt: number;
  color: string;
}

export interface FavoritesState {
  pinnedTabs: string[];
  favoriteGroups: TabGroup[];
  recentTabs: string[];
  lastUpdated: number;
}

const STORAGE_KEY = 'hybridcast-favorites';
const DEFAULT_STATE: FavoritesState = {
  pinnedTabs: [],
  favoriteGroups: [],
  recentTabs: [],
  lastUpdated: Date.now(),
};

class HybridCastFavoritesManager {
  private state: FavoritesState;

  constructor() {
    this.state = this.loadState();
  }

  /**
   * Load state from localStorage
   */
  private loadState(): FavoritesState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[HybridCast] Failed to load favorites:', error);
    }
    return { ...DEFAULT_STATE };
  }

  /**
   * Save state to localStorage
   */
  private saveState(): void {
    try {
      this.state.lastUpdated = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('[HybridCast] Failed to save favorites:', error);
    }
  }

  /**
   * Pin a tab
   */
  pinTab(tabId: string): void {
    if (!this.state.pinnedTabs.includes(tabId)) {
      this.state.pinnedTabs.push(tabId);
      this.saveState();
    }
  }

  /**
   * Unpin a tab
   */
  unpinTab(tabId: string): void {
    this.state.pinnedTabs = this.state.pinnedTabs.filter((id) => id !== tabId);
    this.saveState();
  }

  /**
   * Check if tab is pinned
   */
  isTabPinned(tabId: string): boolean {
    return this.state.pinnedTabs.includes(tabId);
  }

  /**
   * Get all pinned tabs
   */
  getPinnedTabs(): string[] {
    return [...this.state.pinnedTabs];
  }

  /**
   * Reorder pinned tabs
   */
  reorderPinnedTabs(tabIds: string[]): void {
    this.state.pinnedTabs = tabIds;
    this.saveState();
  }

  /**
   * Add tab to recent
   */
  addToRecent(tabId: string): void {
    // Remove if already exists
    this.state.recentTabs = this.state.recentTabs.filter((id) => id !== tabId);
    // Add to front
    this.state.recentTabs.unshift(tabId);
    // Keep only last 10
    this.state.recentTabs = this.state.recentTabs.slice(0, 10);
    this.saveState();
  }

  /**
   * Get recent tabs
   */
  getRecentTabs(): string[] {
    return [...this.state.recentTabs];
  }

  /**
   * Create a new tab group
   */
  createGroup(name: string, description: string, tabIds: string[], color: string = 'blue'): TabGroup {
    const group: TabGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      tabIds,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      color,
    };

    this.state.favoriteGroups.push(group);
    this.saveState();

    return group;
  }

  /**
   * Update a tab group
   */
  updateGroup(groupId: string, updates: Partial<Omit<TabGroup, 'id' | 'createdAt'>>): TabGroup | null {
    const group = this.state.favoriteGroups.find((g) => g.id === groupId);
    if (!group) return null;

    Object.assign(group, updates, { updatedAt: Date.now() });
    this.saveState();

    return group;
  }

  /**
   * Delete a tab group
   */
  deleteGroup(groupId: string): boolean {
    const initialLength = this.state.favoriteGroups.length;
    this.state.favoriteGroups = this.state.favoriteGroups.filter((g) => g.id !== groupId);

    if (this.state.favoriteGroups.length < initialLength) {
      this.saveState();
      return true;
    }

    return false;
  }

  /**
   * Get all tab groups
   */
  getGroups(): TabGroup[] {
    return [...this.state.favoriteGroups];
  }

  /**
   * Get a specific group
   */
  getGroup(groupId: string): TabGroup | null {
    return this.state.favoriteGroups.find((g) => g.id === groupId) || null;
  }

  /**
   * Add tab to group
   */
  addTabToGroup(groupId: string, tabId: string): boolean {
    const group = this.state.favoriteGroups.find((g) => g.id === groupId);
    if (!group) return false;

    if (!group.tabIds.includes(tabId)) {
      group.tabIds.push(tabId);
      group.updatedAt = Date.now();
      this.saveState();
    }

    return true;
  }

  /**
   * Remove tab from group
   */
  removeTabFromGroup(groupId: string, tabId: string): boolean {
    const group = this.state.favoriteGroups.find((g) => g.id === groupId);
    if (!group) return false;

    const initialLength = group.tabIds.length;
    group.tabIds = group.tabIds.filter((id) => id !== tabId);

    if (group.tabIds.length < initialLength) {
      group.updatedAt = Date.now();
      this.saveState();
      return true;
    }

    return false;
  }

  /**
   * Get all tabs in a group
   */
  getGroupTabs(groupId: string): string[] {
    const group = this.state.favoriteGroups.find((g) => g.id === groupId);
    return group ? [...group.tabIds] : [];
  }

  /**
   * Export favorites as JSON
   */
  export(): string {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Import favorites from JSON
   */
  import(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      if (imported.pinnedTabs && imported.favoriteGroups && imported.recentTabs) {
        this.state = imported;
        this.saveState();
        return true;
      }
    } catch (error) {
      console.error('[HybridCast] Failed to import favorites:', error);
    }
    return false;
  }

  /**
   * Clear all favorites
   */
  clearAll(): void {
    this.state = { ...DEFAULT_STATE };
    this.saveState();
  }

  /**
   * Get statistics
   */
  getStats(): {
    pinnedCount: number;
    groupCount: number;
    recentCount: number;
    totalTabsInGroups: number;
  } {
    return {
      pinnedCount: this.state.pinnedTabs.length,
      groupCount: this.state.favoriteGroups.length,
      recentCount: this.state.recentTabs.length,
      totalTabsInGroups: this.state.favoriteGroups.reduce((sum, g) => sum + g.tabIds.length, 0),
    };
  }
}

// Singleton instance
let instance: HybridCastFavoritesManager | null = null;

export function getHybridCastFavoritesManager(): HybridCastFavoritesManager {
  if (!instance) {
    instance = new HybridCastFavoritesManager();
  }
  return instance;
}

export default HybridCastFavoritesManager;
