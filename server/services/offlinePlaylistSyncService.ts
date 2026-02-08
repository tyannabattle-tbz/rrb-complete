import { db, getDb } from '../db';
import { users, playlists, playlistTracks } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export interface OfflinePlaylistSyncJob {
  id: string;
  userId: string;
  playlistId: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  tracksDownloaded: number;
  totalTracks: number;
  lastSyncedAt: number;
  nextRetryAt?: number;
  error?: string;
}

export interface SyncQueueItem {
  id: string;
  userId: string;
  action: 'add' | 'remove' | 'update';
  playlistId: string;
  trackId?: string;
  timestamp: number;
}

export class OfflinePlaylistSyncService {
  private syncQueue: Map<string, SyncQueueItem[]> = new Map();
  private activeSyncs: Map<string, OfflinePlaylistSyncJob> = new Map();

  /**
   * Queue a sync action when offline
   */
  async queueSyncAction(
    userId: string,
    action: 'add' | 'remove' | 'update',
    playlistId: string,
    trackId?: string
  ): Promise<SyncQueueItem> {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      action,
      playlistId,
      trackId,
      timestamp: Date.now(),
    };

    if (!this.syncQueue.has(userId)) {
      this.syncQueue.set(userId, []);
    }

    this.syncQueue.get(userId)!.push(item);
    return item;
  }

  /**
   * Get pending sync actions for user
   */
  getPendingSyncActions(userId: string): SyncQueueItem[] {
    return this.syncQueue.get(userId) || [];
  }

  /**
   * Process queued sync actions when online
   */
  async processSyncQueue(userId: string): Promise<{ processed: number; failed: number }> {
    const queue = this.syncQueue.get(userId) || [];
    let processed = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        switch (item.action) {
          case 'add':
            // Add track to playlist
            await this.addTrackToPlaylist(userId, item.playlistId, item.trackId!);
            processed++;
            break;
          case 'remove':
            // Remove track from playlist
            await this.removeTrackFromPlaylist(userId, item.playlistId, item.trackId!);
            processed++;
            break;
          case 'update':
            // Update playlist metadata
            await this.updatePlaylistMetadata(userId, item.playlistId);
            processed++;
            break;
        }
      } catch (error) {
        console.error(`Failed to process sync action ${item.id}:`, error);
        failed++;
      }
    }

    // Clear processed queue
    if (processed > 0) {
      this.syncQueue.set(userId, queue.slice(processed));
    }

    return { processed, failed };
  }

  /**
   * Start offline playlist download
   */
  async startOfflinePlaylistDownload(
    userId: string,
    playlistId: string
  ): Promise<OfflinePlaylistSyncJob> {
    const job: OfflinePlaylistSyncJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      playlistId,
      status: 'pending',
      tracksDownloaded: 0,
      totalTracks: 0,
      lastSyncedAt: Date.now(),
    };

    this.activeSyncs.set(job.id, job);

    // Simulate async download
    this.simulatePlaylistDownload(job);

    return job;
  }

  /**
   * Get sync job status
   */
  getSyncJobStatus(jobId: string): OfflinePlaylistSyncJob | undefined {
    return this.activeSyncs.get(jobId);
  }

  /**
   * Cancel sync job
   */
  cancelSyncJob(jobId: string): boolean {
    return this.activeSyncs.delete(jobId);
  }

  /**
   * Get all active sync jobs for user
   */
  getActiveSyncJobs(userId: string): OfflinePlaylistSyncJob[] {
    return Array.from(this.activeSyncs.values()).filter(job => job.userId === userId);
  }

  /**
   * Get sync statistics for user
   */
  getSyncStatistics(userId: string) {
    const jobs = this.getActiveSyncJobs(userId);
    const queue = this.getPendingSyncActions(userId);

    return {
      activeSyncs: jobs.length,
      completedSyncs: jobs.filter(j => j.status === 'completed').length,
      failedSyncs: jobs.filter(j => j.status === 'failed').length,
      pendingActions: queue.length,
      totalTracksDownloaded: jobs.reduce((sum, j) => sum + j.tracksDownloaded, 0),
      lastSyncTime: Math.max(...jobs.map(j => j.lastSyncedAt), 0),
    };
  }

  /**
   * Clean up old sync jobs
   */
  cleanupOldSyncJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let removed = 0;

    for (const [jobId, job] of this.activeSyncs.entries()) {
      if (job.status === 'completed' && now - job.lastSyncedAt > maxAgeMs) {
        this.activeSyncs.delete(jobId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Simulate playlist download
   */
  private async simulatePlaylistDownload(job: OfflinePlaylistSyncJob) {
    try {
      job.status = 'syncing';
      job.totalTracks = Math.floor(Math.random() * 50) + 10;

      // Simulate downloading tracks
      for (let i = 0; i < job.totalTracks; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        job.tracksDownloaded++;
      }

      job.status = 'completed';
      job.lastSyncedAt = Date.now();
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.nextRetryAt = Date.now() + 5 * 60 * 1000; // Retry in 5 minutes
    }
  }

  /**
   * Add track to playlist
   */
  private async addTrackToPlaylist(userId: string, playlistId: string, trackId: string) {
    // Implementation would add track to playlist in database
    console.log(`Adding track ${trackId} to playlist ${playlistId} for user ${userId}`);
  }

  /**
   * Remove track from playlist
   */
  private async removeTrackFromPlaylist(userId: string, playlistId: string, trackId: string) {
    // Implementation would remove track from playlist in database
    console.log(`Removing track ${trackId} from playlist ${playlistId} for user ${userId}`);
  }

  /**
   * Update playlist metadata
   */
  private async updatePlaylistMetadata(userId: string, playlistId: string) {
    // Implementation would update playlist metadata in database
    console.log(`Updating playlist ${playlistId} metadata for user ${userId}`);
  }
}

export const offlinePlaylistSyncService = new OfflinePlaylistSyncService();
