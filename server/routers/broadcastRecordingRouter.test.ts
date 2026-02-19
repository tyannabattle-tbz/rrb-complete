import { describe, it, expect, beforeEach } from 'vitest';
import { broadcastRecordingRouter } from './broadcastRecordingRouter';

describe('BroadcastRecordingRouter', () => {
  describe('getRecordings', () => {
    it('should return all recordings', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getRecordings();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe('getRecording', () => {
    it('should return a specific recording', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getRecording({ id: '1' });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('1');
      expect(result.data.title).toBeDefined();
    });

    it('should return error for non-existent recording', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getRecording({ id: 'non-existent' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Recording not found');
    });
  });

  describe('getRecordingsByChannel', () => {
    it('should filter recordings by channel', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getRecordingsByChannel({ channel: 'RRB Main' });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach((rec) => {
        expect(rec.channel).toBe('RRB Main');
      });
    });
  });

  describe('getRecordingsByFrequency', () => {
    it('should filter recordings by frequency', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getRecordingsByFrequency({ frequency: '432 Hz' });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach((rec) => {
        expect(rec.frequency).toBe('432 Hz');
      });
    });
  });

  describe('createRecording', () => {
    it('should create a new recording', async () => {
      const caller = broadcastRecordingRouter.createCaller({ user: { id: 'user-1' } } as any);
      const result = await caller.createRecording({
        title: 'Test Recording',
        channel: 'Test Channel',
        frequency: '528 Hz',
        duration: 3600,
        transcript: 'Test transcript',
      });

      expect(result.success).toBe(true);
      expect(result.data.title).toBe('Test Recording');
      expect(result.data.channel).toBe('Test Channel');
      expect(result.data.frequency).toBe('528 Hz');
      expect(result.data.status).toBe('processing');
    });
  });

  describe('updateRecordingStatus', () => {
    it('should update recording status', async () => {
      const caller = broadcastRecordingRouter.createCaller({ user: { id: 'user-1' } } as any);

      // Create a recording first
      const createResult = await caller.createRecording({
        title: 'Status Test',
        channel: 'Test',
        frequency: '432 Hz',
        duration: 1800,
      });

      const recordingId = createResult.data.id;

      // Update status
      const updateResult = await caller.updateRecordingStatus({
        id: recordingId,
        status: 'ready',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data.status).toBe('ready');
    });
  });

  describe('incrementViews', () => {
    it('should increment view count', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);

      // Get initial views
      const initial = await caller.getRecording({ id: '1' });
      const initialViews = initial.data.views;

      // Increment
      const result = await caller.incrementViews({ id: '1' });

      expect(result.success).toBe(true);
      expect(result.data.views).toBe(initialViews + 1);
    });
  });

  describe('deleteRecording', () => {
    it('should delete a recording', async () => {
      const caller = broadcastRecordingRouter.createCaller({ user: { id: 'user-1' } } as any);

      // Create a recording
      const createResult = await caller.createRecording({
        title: 'Delete Test',
        channel: 'Test',
        frequency: '432 Hz',
        duration: 1800,
      });

      const recordingId = createResult.data.id;

      // Delete it
      const deleteResult = await caller.deleteRecording({ id: recordingId });

      expect(deleteResult.success).toBe(true);

      // Verify it's deleted
      const getResult = await caller.getRecording({ id: recordingId });
      expect(getResult.success).toBe(false);
    });
  });

  describe('searchRecordings', () => {
    it('should search by title', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.searchRecordings({ query: 'Healing' });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      result.data.forEach((rec) => {
        expect(rec.title.toLowerCase()).toContain('healing');
      });
    });

    it('should search by channel', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.searchRecordings({ query: "Sean's" });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('getPopularRecordings', () => {
    it('should return popular recordings sorted by views', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getPopularRecordings({ limit: 5 });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);

      // Verify sorted by views (descending)
      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].views).toBeGreaterThanOrEqual(result.data[i + 1].views);
      }
    });
  });

  describe('getRecentRecordings', () => {
    it('should return recent recordings sorted by date', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getRecentRecordings({ limit: 5 });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(5);

      // Verify sorted by date (descending)
      for (let i = 0; i < result.data.length - 1; i++) {
        const date1 = new Date(result.data[i].date).getTime();
        const date2 = new Date(result.data[i + 1].date).getTime();
        expect(date1).toBeGreaterThanOrEqual(date2);
      }
    });
  });

  describe('getStatistics', () => {
    it('should return archive statistics', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);
      const result = await caller.getStatistics();

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('totalRecordings');
      expect(result.data).toHaveProperty('totalViews');
      expect(result.data).toHaveProperty('totalDuration');
      expect(result.data).toHaveProperty('readyRecordings');
      expect(result.data).toHaveProperty('processingRecordings');
      expect(result.data).toHaveProperty('averageViews');

      expect(typeof result.data.totalRecordings).toBe('number');
      expect(typeof result.data.totalViews).toBe('number');
      expect(typeof result.data.totalDuration).toBe('number');
    });
  });

  describe('getRecordingsByDateRange', () => {
    it('should filter recordings by date range', async () => {
      const caller = broadcastRecordingRouter.createCaller({} as any);

      const startDate = new Date('2026-02-01');
      const endDate = new Date('2026-02-28');

      const result = await caller.getRecordingsByDateRange({
        startDate,
        endDate,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);

      result.data.forEach((rec) => {
        const recDate = new Date(rec.date);
        expect(recDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(recDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });
  });

  describe('archiveOldRecordings', () => {
    it('should archive old recordings', async () => {
      const caller = broadcastRecordingRouter.createCaller({ user: { id: 'user-1' } } as any);

      const result = await caller.archiveOldRecordings({ daysOld: 1 });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('archivedCount');
      expect(typeof result.data.archivedCount).toBe('number');
    });
  });
});
