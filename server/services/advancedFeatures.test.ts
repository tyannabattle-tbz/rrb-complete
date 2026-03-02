import { describe, it, expect, beforeEach } from 'vitest';
import { agentMarketplaceService } from './agentMarketplaceService';
import { realtimeCollaborationService } from './realtimeCollaborationService';
import { advancedAnalyticsService } from './advancedAnalyticsService';

describe('Agent Marketplace Service', () => {
  it('should list marketplace services', async () => {
    const services = await agentMarketplaceService.listServices({ limit: 10 });
    expect(Array.isArray(services)).toBe(true);
  });

  it('should register a service', async () => {
    const service = await agentMarketplaceService.registerService('agent-1', {
      name: 'Test Service',
      description: 'A test service',
      price: 100,
      currency: 'USD',
      capabilities: ['messaging', 'streaming'],
      responseTime: 200,
    });
    expect(service).toBeDefined();
  });

  it('should create a transaction', async () => {
    const transaction = await agentMarketplaceService.createTransaction(
      'buyer-agent',
      'seller-agent',
      'service-1',
      100,
      'USD',
      { orderId: 'order-123' }
    );
    expect(transaction.status).toBe('pending');
    expect(transaction.amount).toBe(100);
  });

  it('should complete a transaction', async () => {
    const transaction = await agentMarketplaceService.completeTransaction('txn-123');
    expect(transaction.status).toBe('completed');
  });

  it('should dispute a transaction', async () => {
    const transaction = await agentMarketplaceService.disputeTransaction(
      'txn-123',
      'Service not delivered',
      'buyer-agent'
    );
    expect(transaction.status).toBe('disputed');
  });

  it('should submit a service review', async () => {
    const review = await agentMarketplaceService.submitReview('service-1', 'buyer-agent', 5, 'Great service!');
    expect(review.rating).toBe(5);
    expect(review.comment).toBe('Great service!');
  });

  it('should get marketplace statistics', async () => {
    const stats = await agentMarketplaceService.getMarketplaceStats();
    expect(stats.totalServices).toBeGreaterThanOrEqual(0);
    expect(stats.averageRating).toBeGreaterThanOrEqual(0);
  });

  it('should get agent performance', async () => {
    const performance = await agentMarketplaceService.getAgentPerformance('agent-1');
    expect(performance.successRate).toBeGreaterThanOrEqual(0);
    expect(performance.averageRating).toBeGreaterThanOrEqual(0);
  });
});

describe('Real-Time Collaboration Service', () => {
  beforeEach(() => {
    // Clear sessions before each test
  });

  it('should create a listening session', async () => {
    const session = await realtimeCollaborationService.createListeningSession(
      'host-agent',
      'Test Session',
      'track-1'
    );
    expect(session.sessionId).toBeDefined();
    expect(session.hostAgentId).toBe('host-agent');
    expect(session.participants).toContain('host-agent');
  });

  it('should join a listening session', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session');
    const updated = await realtimeCollaborationService.joinListeningSession(session.sessionId, 'participant-1');
    expect(updated.participants).toContain('participant-1');
  });

  it('should leave a listening session', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session');
    await realtimeCollaborationService.joinListeningSession(session.sessionId, 'participant-1');
    const left = await realtimeCollaborationService.leaveListeningSession(session.sessionId, 'participant-1');
    expect(left).toBe(true);
  });

  it('should update playback position', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session');
    const updated = await realtimeCollaborationService.updatePlaybackPosition(
      session.sessionId,
      'host-agent',
      'track-2',
      5000
    );
    expect(updated.currentTrackId).toBe('track-2');
    expect(updated.playbackPosition).toBe(5000);
  });

  it('should control playback', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session');
    const playing = await realtimeCollaborationService.controlPlayback(session.sessionId, 'host-agent', 'play');
    expect(playing.isPlaying).toBe(true);

    const paused = await realtimeCollaborationService.controlPlayback(session.sessionId, 'host-agent', 'pause');
    expect(paused.isPlaying).toBe(false);
  });

  it('should skip to next track', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session', 'track-1');
    const skipped = await realtimeCollaborationService.skipTrack(session.sessionId, 'host-agent', 'track-3');
    expect(skipped.currentTrackId).toBe('track-3');
    expect(skipped.playbackPosition).toBe(0);
  });

  it('should get session details', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session');
    await realtimeCollaborationService.joinListeningSession(session.sessionId, 'participant-1');

    const details = await realtimeCollaborationService.getSessionDetails(session.sessionId);
    expect(details.session).toBeDefined();
    expect(details.participants.length).toBeGreaterThan(0);
    expect(details.activeParticipants).toBeGreaterThan(0);
  });

  it('should create shared playlist', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session');
    const playlist = await realtimeCollaborationService.createSharedPlaylist(
      session.sessionId,
      'host-agent',
      ['track-1', 'track-2', 'track-3']
    );
    expect(playlist.playlistId).toBeDefined();
    expect(playlist.tracks.length).toBe(3);
  });

  it('should broadcast message to session', async () => {
    const session = await realtimeCollaborationService.createListeningSession('host-agent', 'Test Session');
    const message = await realtimeCollaborationService.broadcastMessage(
      session.sessionId,
      'host-agent',
      'Hello everyone!',
      'chat'
    );
    expect(message.message).toBe('Hello everyone!');
    expect(message.type).toBe('chat');
  });

  it('should get collaboration statistics', async () => {
    const stats = await realtimeCollaborationService.getCollaborationStats();
    expect(stats.activeSessions).toBeGreaterThanOrEqual(0);
    expect(stats.totalParticipants).toBeGreaterThanOrEqual(0);
  });
});

describe('Advanced Analytics Service', () => {
  it('should get user engagement metrics', async () => {
    const metrics = await advancedAnalyticsService.getUserEngagementMetrics('user-1');
    expect(metrics.userId).toBe('user-1');
    expect(metrics.engagementScore).toBeGreaterThanOrEqual(0);
  });

  it('should get content performance metrics', async () => {
    const metrics = await advancedAnalyticsService.getContentPerformanceMetrics('content-1');
    expect(metrics.contentId).toBe('content-1');
    expect(metrics.plays).toBeGreaterThanOrEqual(0);
  });

  it('should get network performance metrics', async () => {
    const metrics = await advancedAnalyticsService.getNetworkPerformanceMetrics();
    expect(metrics.networkHealth).toBeGreaterThanOrEqual(0);
    expect(metrics.uptime).toBeGreaterThanOrEqual(0);
  });

  it('should get autonomy metrics', async () => {
    const metrics = await advancedAnalyticsService.getAutonomyMetrics();
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThan(0);
    metrics.forEach((m) => {
      expect(m.autonomyLevel).toBeGreaterThanOrEqual(0);
      expect(m.successRate).toBeGreaterThanOrEqual(0);
    });
  });

  it('should get revenue metrics', async () => {
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-02-08');
    const metrics = await advancedAnalyticsService.getRevenueMetrics(startDate, endDate);
    expect(Array.isArray(metrics)).toBe(true);
    expect(metrics.length).toBeGreaterThan(0);
  });

  it('should get user engagement trends', async () => {
    const trends = await advancedAnalyticsService.getUserEngagementTrends(7);
    expect(Array.isArray(trends)).toBe(true);
    expect(trends.length).toBe(7);
  });

  it('should get content performance trends', async () => {
    const trends = await advancedAnalyticsService.getContentPerformanceTrends('content-1', 7);
    expect(Array.isArray(trends)).toBe(true);
    expect(trends.length).toBe(7);
  });

  it('should get network health trends', async () => {
    const trends = await advancedAnalyticsService.getNetworkHealthTrends(24);
    expect(Array.isArray(trends)).toBe(true);
    expect(trends.length).toBe(24);
  });

  it('should get top performers', async () => {
    const performers = await advancedAnalyticsService.getTopPerformers('engagement', 5);
    expect(Array.isArray(performers)).toBe(true);
    expect(performers.length).toBeLessThanOrEqual(5);
  });

  it('should get anomalies and alerts', async () => {
    const alerts = await advancedAnalyticsService.getAnomaliesAndAlerts();
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should generate analytics report', async () => {
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-02-08');
    const report = await advancedAnalyticsService.generateAnalyticsReport('weekly', startDate, endDate);
    expect(report.reportId).toBeDefined();
    expect(report.type).toBe('weekly');
    expect(report.summary).toBeDefined();
  });

  it('should get dashboard overview', async () => {
    const overview = await advancedAnalyticsService.getDashboardOverview();
    expect(overview.activeUsers).toBeGreaterThanOrEqual(0);
    expect(overview.networkHealth).toBeGreaterThanOrEqual(0);
    expect(overview.autonomyStatus).toBeDefined();
  });

  it('should export analytics data', async () => {
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-02-08');
    const exported = await advancedAnalyticsService.exportAnalyticsData('json', 'engagement', startDate, endDate);
    expect(exported.fileUrl).toBeDefined();
    expect(exported.fileName).toBeDefined();
    expect(exported.format).toBe('json');
  });
});
