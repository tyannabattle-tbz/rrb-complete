import { describe, it, expect } from 'vitest';
import { OfflinePlaylistService } from '../services/offlinePlaylistService';

describe('Offline Playlist Service', () => {
  describe('Playlist Creation', () => {
    it('should create a new playlist', () => {
      const playlist = OfflinePlaylistService.createPlaylist(
        'user123',
        'My Favorite Podcasts',
        'Collection of my favorite podcast episodes'
      );

      expect(playlist.userId).toBe('user123');
      expect(playlist.name).toBe('My Favorite Podcasts');
      expect(playlist.description).toBe('Collection of my favorite podcast episodes');
      expect(playlist.items.length).toBe(0);
      expect(playlist.totalSize).toBe(0);
      expect(playlist.createdAt).toBeGreaterThan(0);
    });

    it('should generate unique playlist IDs', () => {
      const playlist1 = OfflinePlaylistService.createPlaylist('user123', 'Playlist 1');
      const playlist2 = OfflinePlaylistService.createPlaylist('user123', 'Playlist 2');

      expect(playlist1.id).not.toBe(playlist2.id);
    });
  });

  describe('Item Management', () => {
    it('should add item to playlist', () => {
      const playlist = OfflinePlaylistService.createPlaylist('user123', 'Test Playlist');
      const item = {
        id: 'item1',
        contentId: 'podcast123',
        contentType: 'podcast' as const,
        title: 'Episode 1',
        artist: 'John Doe',
        duration: 3600,
        fileSize: 50 * 1024 * 1024, // 50MB
        fileUrl: 'https://example.com/episode1.mp3',
        isDownloaded: false,
      };

      const updated = OfflinePlaylistService.addItemToPlaylist(playlist, item);

      expect(updated.items.length).toBe(1);
      expect(updated.totalSize).toBe(50 * 1024 * 1024);
      expect(updated.updatedAt).toBeGreaterThanOrEqual(playlist.updatedAt);
    });

    it('should remove item from playlist', () => {
      const playlist = OfflinePlaylistService.createPlaylist('user123', 'Test Playlist');
      const item = {
        id: 'item1',
        contentId: 'podcast123',
        contentType: 'podcast' as const,
        title: 'Episode 1',
        duration: 3600,
        fileSize: 50 * 1024 * 1024,
        fileUrl: 'https://example.com/episode1.mp3',
        isDownloaded: false,
      };

      const withItem = OfflinePlaylistService.addItemToPlaylist(playlist, item);
      const removed = OfflinePlaylistService.removeItemFromPlaylist(withItem, 'item1');

      expect(removed.items.length).toBe(0);
      expect(removed.totalSize).toBe(0);
    });

    it('should handle multiple items', () => {
      let playlist = OfflinePlaylistService.createPlaylist('user123', 'Test Playlist');

      for (let i = 0; i < 5; i++) {
        const item = {
          id: `item${i}`,
          contentId: `podcast${i}`,
          contentType: 'podcast' as const,
          title: `Episode ${i}`,
          duration: 3600,
          fileSize: 50 * 1024 * 1024,
          fileUrl: `https://example.com/episode${i}.mp3`,
          isDownloaded: false,
        };
        playlist = OfflinePlaylistService.addItemToPlaylist(playlist, item);
      }

      expect(playlist.items.length).toBe(5);
      expect(playlist.totalSize).toBe(5 * 50 * 1024 * 1024);
    });
  });

  describe('Size Calculation', () => {
    it('should calculate total size correctly', () => {
      const items = [
        {
          id: 'item1',
          contentId: 'podcast1',
          contentType: 'podcast' as const,
          title: 'Episode 1',
          duration: 3600,
          fileSize: 50 * 1024 * 1024,
          fileUrl: 'https://example.com/1.mp3',
          isDownloaded: false,
        },
        {
          id: 'item2',
          contentId: 'podcast2',
          contentType: 'podcast' as const,
          title: 'Episode 2',
          duration: 3600,
          fileSize: 75 * 1024 * 1024,
          fileUrl: 'https://example.com/2.mp3',
          isDownloaded: false,
        },
      ];

      const total = OfflinePlaylistService.calculateTotalSize(items);
      expect(total).toBe(125 * 1024 * 1024);
    });
  });

  describe('Download Job Management', () => {
    it('should create download job', () => {
      const job = OfflinePlaylistService.createDownloadJob('playlist123');

      expect(job.playlistId).toBe('playlist123');
      expect(job.status).toBe('pending');
      expect(job.totalItems).toBe(0);
      expect(job.completedItems).toBe(0);
    });

    it('should update job progress', () => {
      let job = OfflinePlaylistService.createDownloadJob('playlist123');
      job.totalItems = 10;

      job = OfflinePlaylistService.updateJobProgress(job, 5);
      expect(job.completedItems).toBe(5);
      expect(job.status).toBe('in_progress');

      job = OfflinePlaylistService.updateJobProgress(job, 10);
      expect(job.completedItems).toBe(10);
      expect(job.status).toBe('completed');
      expect(job.completedAt).toBeGreaterThan(0);
    });

    it('should mark job as failed', () => {
      let job = OfflinePlaylistService.createDownloadJob('playlist123');
      job = OfflinePlaylistService.markJobFailed(job, 'Network error');

      expect(job.status).toBe('failed');
      expect(job.error).toBe('Network error');
      expect(job.completedAt).toBeGreaterThan(0);
    });
  });

  describe('Download Time Estimation', () => {
    it('should estimate download time', () => {
      const size = 100 * 1024 * 1024; // 100MB
      const speed = 1024 * 1024; // 1 Mbps
      const seconds = OfflinePlaylistService.estimateDownloadTime(size, speed);

      expect(seconds).toBeGreaterThan(0);
      expect(seconds).toBeLessThan(200); // Should be around 100 seconds
    });

    it('should use default network speed', () => {
      const size = 50 * 1024 * 1024;
      const seconds = OfflinePlaylistService.estimateDownloadTime(size);

      expect(seconds).toBeGreaterThan(0);
    });
  });

  describe('Playlist Statistics', () => {
    it('should calculate playlist stats', () => {
      let playlist = OfflinePlaylistService.createPlaylist('user123', 'Test');

      for (let i = 0; i < 10; i++) {
        const item = {
          id: `item${i}`,
          contentId: `podcast${i}`,
          contentType: 'podcast' as const,
          title: `Episode ${i}`,
          duration: 3600,
          fileSize: 50 * 1024 * 1024,
          fileUrl: `https://example.com/${i}.mp3`,
          isDownloaded: i < 5, // First 5 downloaded
          downloadProgress: i >= 5 && i < 8 ? 50 : undefined,
        };
        playlist = OfflinePlaylistService.addItemToPlaylist(playlist, item);
      }

      const stats = OfflinePlaylistService.getPlaylistStats(playlist);

      expect(stats.totalItems).toBe(10);
      expect(stats.downloadedItems).toBe(5);
      expect(stats.downloadingItems).toBe(3);
      expect(stats.failedItems).toBe(2);
      expect(stats.downloadPercentage).toBe(50);
    });
  });

  describe('Playlist Merging', () => {
    it('should merge offline changes with server state', () => {
      const localPlaylist = OfflinePlaylistService.createPlaylist('user123', 'Local');
      const serverPlaylist = OfflinePlaylistService.createPlaylist('user123', 'Server');

      const localItem = {
        id: 'item1',
        contentId: 'podcast1',
        contentType: 'podcast' as const,
        title: 'Episode 1',
        duration: 3600,
        fileSize: 50 * 1024 * 1024,
        fileUrl: 'https://example.com/1.mp3',
        isDownloaded: true,
        downloadedAt: Date.now(),
      };

      const serverItem = {
        id: 'item2',
        contentId: 'podcast2',
        contentType: 'podcast' as const,
        title: 'Episode 2',
        duration: 3600,
        fileSize: 50 * 1024 * 1024,
        fileUrl: 'https://example.com/2.mp3',
        isDownloaded: false,
      };

      const localWithItem = OfflinePlaylistService.addItemToPlaylist(localPlaylist, localItem);
      const serverWithItem = OfflinePlaylistService.addItemToPlaylist(serverPlaylist, serverItem);

      const merged = OfflinePlaylistService.mergePlaylistChanges(localWithItem, serverWithItem);

      expect(merged.items.length).toBe(2);
      expect(merged.totalSize).toBe(100 * 1024 * 1024);
    });
  });

  describe('Cleanup Operations', () => {
    it('should clean up old items', () => {
      let playlist = OfflinePlaylistService.createPlaylist('user123', 'Test');

      const oldTime = Date.now() - 40 * 24 * 60 * 60 * 1000; // 40 days ago
      const newTime = Date.now() - 10 * 24 * 60 * 60 * 1000; // 10 days ago

      const oldItem = {
        id: 'old',
        contentId: 'podcast1',
        contentType: 'podcast' as const,
        title: 'Old Episode',
        duration: 3600,
        fileSize: 50 * 1024 * 1024,
        fileUrl: 'https://example.com/old.mp3',
        isDownloaded: true,
        downloadedAt: oldTime,
      };

      const newItem = {
        id: 'new',
        contentId: 'podcast2',
        contentType: 'podcast' as const,
        title: 'New Episode',
        duration: 3600,
        fileSize: 50 * 1024 * 1024,
        fileUrl: 'https://example.com/new.mp3',
        isDownloaded: true,
        downloadedAt: newTime,
      };

      playlist = OfflinePlaylistService.addItemToPlaylist(playlist, oldItem);
      playlist = OfflinePlaylistService.addItemToPlaylist(playlist, newItem);

      const cleaned = OfflinePlaylistService.cleanupOldItems(playlist, 30 * 24 * 60 * 60 * 1000);

      expect(cleaned.items.length).toBe(1);
      expect(cleaned.items[0].id).toBe('new');
    });
  });

  describe('Export/Import', () => {
    it('should export playlist to JSON', () => {
      let playlist = OfflinePlaylistService.createPlaylist('user123', 'Export Test');
      const item = {
        id: 'item1',
        contentId: 'podcast1',
        contentType: 'podcast' as const,
        title: 'Episode 1',
        artist: 'Artist Name',
        duration: 3600,
        fileSize: 50 * 1024 * 1024,
        fileUrl: 'https://example.com/1.mp3',
        isDownloaded: false,
      };
      playlist = OfflinePlaylistService.addItemToPlaylist(playlist, item);

      const exported = OfflinePlaylistService.exportPlaylist(playlist);
      const parsed = JSON.parse(exported);

      expect(parsed.name).toBe('Export Test');
      expect(parsed.items.length).toBe(1);
      expect(parsed.items[0].title).toBe('Episode 1');
    });

    it('should import playlist from JSON', () => {
      const data = JSON.stringify({
        name: 'Imported Playlist',
        description: 'Test import',
        items: [
          {
            title: 'Episode 1',
            artist: 'Artist',
            duration: 3600,
            contentId: 'podcast1',
            contentType: 'podcast',
          },
        ],
        exportedAt: Date.now(),
      });

      const imported = OfflinePlaylistService.importPlaylist('user123', data);

      expect(imported).toBeTruthy();
      expect(imported?.name).toBe('Imported Playlist');
      expect(imported?.userId).toBe('user123');
    });

    it('should handle invalid import data', () => {
      const invalid = 'not valid json';
      const imported = OfflinePlaylistService.importPlaylist('user123', invalid);

      expect(imported).toBeNull();
    });
  });

  describe('Storage Quota', () => {
    it('should check storage quota', async () => {
      const sufficient = await OfflinePlaylistService.checkStorageQuota(100 * 1024 * 1024);
      // Result depends on environment
      expect(typeof sufficient).toBe('boolean');
    });

    it('should get storage usage', async () => {
      const usage = await OfflinePlaylistService.getStorageUsage();
      // May return null in test environment
      if (usage) {
        expect(usage.usage).toBeGreaterThanOrEqual(0);
        expect(usage.quota).toBeGreaterThanOrEqual(0);
        expect(usage.percentage).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
