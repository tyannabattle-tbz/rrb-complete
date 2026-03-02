import { describe, it, expect, beforeEach } from 'vitest';
import { hybridcastRouter } from './hybridcastRouter';

describe('HybridCast Router', () => {
  describe('startBroadcast', () => {
    it('should start a new broadcast', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Test Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.startBroadcast({
        title: 'Test Stream',
        description: 'Testing HybridCast',
        quality: '1080p',
        bitrate: '5 Mbps',
      });

      expect(result.success).toBe(true);
      expect(result.broadcastId).toBeDefined();
      expect(result.streamUrl).toBeDefined();
      expect(result.streamUrl).toContain('stream.qumus.app');
    });

    it('should start broadcast with location', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Test Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.startBroadcast({
        title: 'NYC Stream',
        location: { lat: 40.7128, lng: -74.006, name: 'New York' },
      });

      expect(result.success).toBe(true);
      expect(result.broadcastId).toBeDefined();
    });
  });

  describe('stopBroadcast', () => {
    it('should stop an active broadcast', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Test Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast first
      const startResult = await caller.startBroadcast({
        title: 'Test Stream',
      });

      // Stop broadcast
      const stopResult = await caller.stopBroadcast({
        broadcastId: startResult.broadcastId,
      });

      expect(stopResult.success).toBe(true);
      expect(stopResult.recordingUrl).toBeDefined();
      expect(stopResult.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return error for non-existent broadcast', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Test Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.stopBroadcast({
        broadcastId: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getActiveBroadcasts', () => {
    it('should return list of active broadcasts', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Test Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start a broadcast
      await caller.startBroadcast({ title: 'Active Stream' });

      // Get active broadcasts
      const result = await caller.getActiveBroadcasts();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });
  });

  describe('joinBroadcast', () => {
    it('should allow viewer to join broadcast', async () => {
      const broadcaster = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const viewer = hybridcastRouter.createCaller({
        user: { id: '2', name: 'Viewer', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await broadcaster.startBroadcast({
        title: 'Test Stream',
      });

      // Join broadcast
      const joinResult = await viewer.joinBroadcast({
        broadcastId: startResult.broadcastId,
      });

      expect(joinResult.success).toBe(true);
      expect(joinResult.viewerId).toBeDefined();
      expect(joinResult.broadcast.viewers).toBeGreaterThan(0);
    });

    it('should return error when joining non-existent broadcast', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Viewer', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.joinBroadcast({
        broadcastId: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('leaveBroadcast', () => {
    it('should allow viewer to leave broadcast', async () => {
      const broadcaster = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const viewer = hybridcastRouter.createCaller({
        user: { id: '2', name: 'Viewer', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await broadcaster.startBroadcast({
        title: 'Test Stream',
      });

      // Join broadcast
      const joinResult = await viewer.joinBroadcast({
        broadcastId: startResult.broadcastId,
      });

      // Leave broadcast
      const leaveResult = await viewer.leaveBroadcast({
        broadcastId: startResult.broadcastId,
        viewerId: joinResult.viewerId,
      });

      expect(leaveResult.success).toBe(true);
      expect(leaveResult.watchDuration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getBroadcastAnalytics', () => {
    it('should return broadcast analytics', async () => {
      const broadcaster = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await broadcaster.startBroadcast({
        title: 'Analytics Test',
      });

      // Get analytics
      const result = await broadcaster.getBroadcastAnalytics({
        broadcastId: startResult.broadcastId,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('title');
      expect(result.data).toHaveProperty('broadcaster');
      expect(result.data).toHaveProperty('totalViewers');
      expect(result.data).toHaveProperty('averageWatchTime');
    });

    it('should track viewer metrics correctly', async () => {
      const broadcaster = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const viewer = hybridcastRouter.createCaller({
        user: { id: '2', name: 'Viewer', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await broadcaster.startBroadcast({
        title: 'Metrics Test',
      });

      // Join broadcast
      const joinResult = await viewer.joinBroadcast({
        broadcastId: startResult.broadcastId,
      });

      // Get analytics
      const analyticsResult = await broadcaster.getBroadcastAnalytics({
        broadcastId: startResult.broadcastId,
      });

      expect(analyticsResult.data.totalViewers).toBe(1);
      expect(analyticsResult.data.activeViewers).toBe(1);
    });
  });

  describe('getStreamMetrics', () => {
    it('should return stream metrics', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await caller.startBroadcast({
        title: 'Metrics Test',
        quality: '1080p',
        bitrate: '8 Mbps',
      });

      // Get metrics
      const result = await caller.getStreamMetrics({
        broadcastId: startResult.broadcastId,
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('viewers');
      expect(result.data).toHaveProperty('quality');
      expect(result.data).toHaveProperty('bitrate');
      expect(result.data).toHaveProperty('streamHealth');
      expect(result.data.quality).toBe('1080p');
    });
  });

  describe('updateBroadcastSettings', () => {
    it('should update broadcast settings', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await caller.startBroadcast({
        title: 'Original Title',
        quality: '720p',
      });

      // Update settings
      const result = await caller.updateBroadcastSettings({
        broadcastId: startResult.broadcastId,
        title: 'Updated Title',
        quality: '1080p',
      });

      expect(result.success).toBe(true);

      // Verify update
      const broadcast = await caller.getBroadcast({
        broadcastId: startResult.broadcastId,
      });

      expect(broadcast.data.title).toBe('Updated Title');
      expect(broadcast.data.quality).toBe('1080p');
    });
  });

  describe('getBroadcastHistory', () => {
    it('should return broadcast history', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const result = await caller.getBroadcastHistory();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.count).toBeGreaterThanOrEqual(0);
    });
  });

  describe('recordBroadcast', () => {
    it('should start recording a broadcast', async () => {
      const caller = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await caller.startBroadcast({
        title: 'Recording Test',
      });

      // Start recording
      const result = await caller.recordBroadcast({
        broadcastId: startResult.broadcastId,
      });

      expect(result.success).toBe(true);
      expect(result.recordingId).toBeDefined();
      expect(result.recordingUrl).toBeDefined();
      expect(result.recordingUrl).toContain('vod.qumus.app');
    });
  });

  describe('getBroadcastViewers', () => {
    it('should return list of broadcast viewers', async () => {
      const broadcaster = hybridcastRouter.createCaller({
        user: { id: '1', name: 'Broadcaster', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      const viewer = hybridcastRouter.createCaller({
        user: { id: '2', name: 'Viewer', role: 'user' as const },
        req: {} as any,
        res: {} as any,
      });

      // Start broadcast
      const startResult = await broadcaster.startBroadcast({
        title: 'Viewers Test',
      });

      // Join broadcast
      await viewer.joinBroadcast({
        broadcastId: startResult.broadcastId,
      });

      // Get viewers
      const result = await broadcaster.getBroadcastViewers({
        broadcastId: startResult.broadcastId,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.totalViewers).toBe(1);
      expect(result.activeViewers).toBe(1);
    });
  });
});
