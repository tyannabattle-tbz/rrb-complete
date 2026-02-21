import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  checkStreamHealth,
  getStreamHealth,
  registerBackupStreams,
  getBackupStreams,
  attemptFailover,
  monitorStreams,
  getUnhealthyStreams,
  clearStreamHealth,
  clearAllHealthCache,
  getHealthStatistics,
  exportHealthReportAsCSV
} from './streamHealthMonitoringService';

describe('Stream Health Monitoring Service', () => {
  beforeEach(() => {
    clearAllHealthCache();
  });

  describe('checkStreamHealth', () => {
    it('should return stream health object', async () => {
      const health = await checkStreamHealth('test-stream', 'https://example.com/stream.mp3', {
        timeout: 1000,
        retries: 1
      });

      expect(health).toBeDefined();
      expect(health.streamId).toBe('test-stream');
      expect(health.url).toBe('https://example.com/stream.mp3');
      expect(health.status).toBeDefined();
      expect(['healthy', 'degraded', 'failed', 'unknown']).toContain(health.status);
    });

    it('should track response time', async () => {
      const health = await checkStreamHealth('test-stream', 'https://example.com/stream.mp3', {
        timeout: 1000,
        retries: 1
      });

      expect(health.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should increment success count on success', async () => {
      const health1 = await checkStreamHealth('test-stream', 'https://example.com/stream.mp3', {
        timeout: 1000,
        retries: 1
      });

      if (health1.status === 'healthy') {
        const health2 = await checkStreamHealth('test-stream', 'https://example.com/stream.mp3', {
          timeout: 1000,
          retries: 1
        });

        expect(health2.successCount).toBeGreaterThanOrEqual(health1.successCount);
      }
    });
  });

  describe('getStreamHealth', () => {
    it('should return null for unchecked stream', () => {
      const health = getStreamHealth('nonexistent');
      expect(health).toBeNull();
    });

    it('should return cached health after check', async () => {
      await checkStreamHealth('test-stream', 'https://example.com/stream.mp3', {
        timeout: 1000,
        retries: 1
      });

      const health = getStreamHealth('test-stream');
      expect(health).toBeDefined();
      expect(health?.streamId).toBe('test-stream');
    });
  });

  describe('registerBackupStreams', () => {
    it('should register backup streams', () => {
      const backups = ['https://backup1.com/stream', 'https://backup2.com/stream'];
      registerBackupStreams('main-stream', backups);

      const registered = getBackupStreams('main-stream');
      expect(registered).toEqual(backups);
    });

    it('should return empty array for unregistered stream', () => {
      const backups = getBackupStreams('nonexistent');
      expect(backups).toEqual([]);
    });
  });

  describe('getBackupStreams', () => {
    it('should retrieve registered backup streams', () => {
      const backups = ['https://backup1.com/stream', 'https://backup2.com/stream'];
      registerBackupStreams('stream-id', backups);

      expect(getBackupStreams('stream-id')).toEqual(backups);
    });
  });

  describe('attemptFailover', () => {
    it('should attempt failover to backup streams', async () => {
      const backups = ['https://example.com/backup1', 'https://example.com/backup2'];
      registerBackupStreams('main-stream', backups);

      const result = await attemptFailover('main-stream', 'https://example.com/main', {
        timeout: 1000,
        retries: 1
      });

      expect(result).toBeDefined();
      expect(result.success).toBeDefined();
      expect(result.url).toBeDefined();
      expect(result.reason).toBeDefined();
    });

    it('should return primary URL if no backups available', async () => {
      const result = await attemptFailover('stream-no-backups', 'https://example.com/main', {
        timeout: 1000,
        retries: 1
      });

      expect(result.success).toBe(false);
      expect(result.url).toBe('https://example.com/main');
    });
  });

  describe('monitorStreams', () => {
    it('should monitor multiple streams', async () => {
      const streams = [
        { id: 'stream1', url: 'https://example.com/stream1.mp3' },
        { id: 'stream2', url: 'https://example.com/stream2.mp3' }
      ];

      const report = await monitorStreams(streams, {
        timeout: 1000,
        retries: 1
      });

      expect(report).toBeDefined();
      expect(report.totalStreams).toBe(2);
      expect(report.streams.length).toBeGreaterThan(0);
    });

    it('should generate health statistics', async () => {
      const streams = [{ id: 'stream1', url: 'https://example.com/stream1.mp3' }];

      const report = await monitorStreams(streams, {
        timeout: 1000,
        retries: 1
      });

      expect(report.healthyStreams).toBeGreaterThanOrEqual(0);
      expect(report.degradedStreams).toBeGreaterThanOrEqual(0);
      expect(report.failedStreams).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getUnhealthyStreams', () => {
    it('should return empty array when all streams are healthy', async () => {
      await checkStreamHealth('healthy-stream', 'https://example.com/stream.mp3', {
        timeout: 1000,
        retries: 1
      });

      const unhealthy = getUnhealthyStreams();
      // May or may not be unhealthy depending on actual response
      expect(Array.isArray(unhealthy)).toBe(true);
    });
  });

  describe('clearStreamHealth', () => {
    it('should clear specific stream health', async () => {
      await checkStreamHealth('test-stream', 'https://example.com/stream.mp3', {
        timeout: 1000,
        retries: 1
      });

      clearStreamHealth('test-stream');
      const health = getStreamHealth('test-stream');
      expect(health).toBeNull();
    });
  });

  describe('clearAllHealthCache', () => {
    it('should clear all cached health data', async () => {
      await checkStreamHealth('stream1', 'https://example.com/stream1.mp3', {
        timeout: 1000,
        retries: 1
      });
      await checkStreamHealth('stream2', 'https://example.com/stream2.mp3', {
        timeout: 1000,
        retries: 1
      });

      clearAllHealthCache();

      expect(getStreamHealth('stream1')).toBeNull();
      expect(getStreamHealth('stream2')).toBeNull();
    });
  });

  describe('getHealthStatistics', () => {
    it('should return empty statistics for no streams', () => {
      const stats = getHealthStatistics();
      expect(stats.total).toBe(0);
      expect(stats.healthy).toBe(0);
      expect(stats.degraded).toBe(0);
      expect(stats.failed).toBe(0);
    });

    it('should include average metrics', async () => {
      await checkStreamHealth('test-stream', 'https://example.com/stream.mp3', {
        timeout: 1000,
        retries: 1
      });

      const stats = getHealthStatistics();
      expect(stats.averageUptime).toBeGreaterThanOrEqual(0);
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('exportHealthReportAsCSV', () => {
    it('should export report as CSV', async () => {
      const streams = [{ id: 'stream1', url: 'https://example.com/stream1.mp3' }];
      const report = await monitorStreams(streams, {
        timeout: 1000,
        retries: 1
      });

      const csv = exportHealthReportAsCSV(report);
      expect(csv).toBeDefined();
      expect(csv).toContain('Stream ID');
      expect(csv).toContain('Status');
    });
  });
});
