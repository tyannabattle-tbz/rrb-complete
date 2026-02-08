import { z } from 'zod';

export interface OfflinePlaylist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  items: OfflinePlaylistItem[];
  createdAt: number;
  updatedAt: number;
  totalSize: number; // in bytes
  isDownloading?: boolean;
  downloadProgress?: number; // 0-100
}

export interface OfflinePlaylistItem {
  id: string;
  contentId: string;
  contentType: 'podcast' | 'song' | 'audiobook';
  title: string;
  artist?: string;
  duration: number;
  fileSize: number;
  fileUrl: string;
  localPath?: string;
  downloadedAt?: number;
  isDownloaded: boolean;
  downloadProgress?: number; // 0-100
}

export interface OfflineSyncJob {
  id: string;
  playlistId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  error?: string;
}

export class OfflinePlaylistService {
  /**
   * Create a new offline playlist
   */
  static createPlaylist(
    userId: string,
    name: string,
    description?: string
  ): OfflinePlaylist {
    return {
      id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      name,
      description,
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      totalSize: 0,
    };
  }

  /**
   * Add item to offline playlist
   */
  static addItemToPlaylist(
    playlist: OfflinePlaylist,
    item: OfflinePlaylistItem
  ): OfflinePlaylist {
    return {
      ...playlist,
      items: [...playlist.items, item],
      totalSize: playlist.totalSize + item.fileSize,
      updatedAt: Date.now(),
    };
  }

  /**
   * Remove item from offline playlist
   */
  static removeItemFromPlaylist(
    playlist: OfflinePlaylist,
    itemId: string
  ): OfflinePlaylist {
    const item = playlist.items.find(i => i.id === itemId);
    if (!item) return playlist;

    return {
      ...playlist,
      items: playlist.items.filter(i => i.id !== itemId),
      totalSize: Math.max(0, playlist.totalSize - item.fileSize),
      updatedAt: Date.now(),
    };
  }

  /**
   * Calculate total download size
   */
  static calculateTotalSize(items: OfflinePlaylistItem[]): number {
    return items.reduce((total, item) => total + item.fileSize, 0);
  }

  /**
   * Check if storage quota is sufficient
   */
  static async checkStorageQuota(requiredSize: number): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.storage) {
      return true; // Assume sufficient if API not available
    }

    try {
      const estimate = await navigator.storage.estimate();
      return estimate.available ? estimate.available > requiredSize : false;
    } catch (error) {
      console.error('Error checking storage quota:', error);
      return false;
    }
  }

  /**
   * Get storage usage
   */
  static async getStorageUsage(): Promise<{ usage: number; quota: number; percentage: number } | null> {
    if (typeof navigator === 'undefined' || !navigator.storage) {
      return null;
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      return {
        usage,
        quota,
        percentage: quota > 0 ? (usage / quota) * 100 : 0,
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return null;
    }
  }

  /**
   * Create download job for playlist
   */
  static createDownloadJob(playlistId: string): OfflineSyncJob {
    return {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playlistId,
      status: 'pending',
      totalItems: 0,
      completedItems: 0,
      failedItems: 0,
    };
  }

  /**
   * Update download job progress
   */
  static updateJobProgress(
    job: OfflineSyncJob,
    completedItems: number,
    failedItems: number = 0
  ): OfflineSyncJob {
    return {
      ...job,
      completedItems,
      failedItems,
      status: completedItems + failedItems === job.totalItems ? 'completed' : 'in_progress',
      completedAt: completedItems + failedItems === job.totalItems ? Date.now() : undefined,
    };
  }

  /**
   * Mark job as failed
   */
  static markJobFailed(job: OfflineSyncJob, error: string): OfflineSyncJob {
    return {
      ...job,
      status: 'failed',
      error,
      completedAt: Date.now(),
    };
  }

  /**
   * Calculate download time estimate
   */
  static estimateDownloadTime(
    totalSize: number,
    networkSpeed: number = 1024 * 1024 // 1 Mbps default
  ): number {
    // Returns time in seconds
    return Math.ceil(totalSize / networkSpeed);
  }

  /**
   * Get playlist statistics
   */
  static getPlaylistStats(playlist: OfflinePlaylist) {
    const downloaded = playlist.items.filter(i => i.isDownloaded).length;
    const downloading = playlist.items.filter(i => i.downloadProgress && i.downloadProgress > 0 && i.downloadProgress < 100).length;
    const failed = playlist.items.filter(i => !i.isDownloaded && !i.downloadProgress).length;

    return {
      totalItems: playlist.items.length,
      downloadedItems: downloaded,
      downloadingItems: downloading,
      failedItems: failed,
      totalSize: playlist.totalSize,
      downloadedSize: playlist.items
        .filter(i => i.isDownloaded)
        .reduce((total, item) => total + item.fileSize, 0),
      downloadPercentage: playlist.items.length > 0
        ? Math.round((downloaded / playlist.items.length) * 100)
        : 0,
    };
  }

  /**
   * Sync offline playlist with server
   */
  static async syncPlaylist(
    playlist: OfflinePlaylist,
    lastSyncTime: number
  ): Promise<{
    newItems: OfflinePlaylistItem[];
    updatedItems: OfflinePlaylistItem[];
    removedItemIds: string[];
  }> {
    // This would typically fetch from server
    // For now, return structure
    return {
      newItems: [],
      updatedItems: [],
      removedItemIds: [],
    };
  }

  /**
   * Merge offline changes with server state
   */
  static mergePlaylistChanges(
    localPlaylist: OfflinePlaylist,
    serverPlaylist: OfflinePlaylist
  ): OfflinePlaylist {
    // Create a map of items by contentId for easier comparison
    const serverItemMap = new Map(
      serverPlaylist.items.map(item => [item.contentId, item])
    );

    // Merge items, preferring local downloaded items
    const mergedItems = serverPlaylist.items.map(serverItem => {
      const localItem = localPlaylist.items.find(
        i => i.contentId === serverItem.contentId
      );
      return localItem && localItem.isDownloaded ? localItem : serverItem;
    });

    // Add any local items not in server
    for (const localItem of localPlaylist.items) {
      if (!serverItemMap.has(localItem.contentId)) {
        mergedItems.push(localItem);
      }
    }

    return {
      ...serverPlaylist,
      items: mergedItems,
      totalSize: this.calculateTotalSize(mergedItems),
      updatedAt: Date.now(),
    };
  }

  /**
   * Clean up old downloaded items
   */
  static cleanupOldItems(
    playlist: OfflinePlaylist,
    maxAge: number = 30 * 24 * 60 * 60 * 1000 // 30 days
  ): OfflinePlaylist {
    const now = Date.now();
    const itemsToKeep = playlist.items.filter(item => {
      if (!item.downloadedAt) return true;
      return now - item.downloadedAt < maxAge;
    });

    return {
      ...playlist,
      items: itemsToKeep,
      totalSize: this.calculateTotalSize(itemsToKeep),
      updatedAt: Date.now(),
    };
  }

  /**
   * Export playlist to portable format
   */
  static exportPlaylist(playlist: OfflinePlaylist): string {
    return JSON.stringify({
      name: playlist.name,
      description: playlist.description,
      items: playlist.items.map(item => ({
        title: item.title,
        artist: item.artist,
        duration: item.duration,
        contentId: item.contentId,
        contentType: item.contentType,
      })),
      exportedAt: Date.now(),
    }, null, 2);
  }

  /**
   * Import playlist from portable format
   */
  static importPlaylist(
    userId: string,
    data: string
  ): OfflinePlaylist | null {
    try {
      const parsed = JSON.parse(data);
      const playlist = this.createPlaylist(userId, parsed.name, parsed.description);

      // Note: Items would need to be re-downloaded
      return playlist;
    } catch (error) {
      console.error('Error importing playlist:', error);
      return null;
    }
  }
}

export const OfflinePlaylistSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    contentId: z.string(),
    contentType: z.enum(['podcast', 'song', 'audiobook']),
    title: z.string(),
    artist: z.string().optional(),
    duration: z.number(),
    fileSize: z.number(),
    fileUrl: z.string().url(),
    localPath: z.string().optional(),
    downloadedAt: z.number().optional(),
    isDownloaded: z.boolean(),
    downloadProgress: z.number().optional(),
  })),
  createdAt: z.number(),
  updatedAt: z.number(),
  totalSize: z.number(),
  isDownloading: z.boolean().optional(),
  downloadProgress: z.number().optional(),
});

export type OfflinePlaylistType = z.infer<typeof OfflinePlaylistSchema>;
