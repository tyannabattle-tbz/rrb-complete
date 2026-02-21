import { describe, it, expect, beforeEach } from 'vitest';
import { useAnalyticsStore, generateMockAnalytics } from './analyticsService';

describe('Analytics Service', () => {
  beforeEach(() => {
    // Reset store before each test
    useAnalyticsStore.setState({
      analytics: {},
      historicalData: [],
      selectedChannelId: null,
    });
  });

  describe('generateMockAnalytics', () => {
    it('should generate mock analytics with correct structure', () => {
      const analytics = generateMockAnalytics('channel-1', 'Test Channel');
      
      expect(analytics.channelId).toBe('channel-1');
      expect(analytics.channelName).toBe('Test Channel');
      expect(analytics.totalListeners).toBeGreaterThan(0);
      expect(analytics.peakListeners).toBeGreaterThan(0);
      expect(analytics.averageListeners).toBeGreaterThan(0);
      expect(analytics.peakHour).toBeGreaterThanOrEqual(0);
      expect(analytics.peakHour).toBeLessThan(24);
      expect(analytics.listenerDemographics.countries).toBeDefined();
      expect(analytics.listenerDemographics.devices).toBeDefined();
      expect(analytics.listenerDemographics.browsers).toBeDefined();
      expect(analytics.topTracks).toHaveLength(3);
      expect(analytics.trendingMetrics).toBeDefined();
    });
  });

  describe('Analytics Store', () => {
    it('should update channel analytics', () => {
      const store = useAnalyticsStore.getState();
      const mockData = generateMockAnalytics('channel-1', 'Test Channel');
      
      store.updateChannelAnalytics('channel-1', mockData);
      
      const analytics = store.getChannelAnalytics('channel-1');
      expect(analytics).toBeDefined();
      expect(analytics?.channelId).toBe('channel-1');
      expect(analytics?.channelName).toBe('Test Channel');
    });

    it('should get channel analytics', () => {
      const store = useAnalyticsStore.getState();
      const mockData = generateMockAnalytics('channel-1', 'Test Channel');
      
      store.updateChannelAnalytics('channel-1', mockData);
      
      const analytics = store.getChannelAnalytics('channel-1');
      expect(analytics).not.toBeNull();
      expect(analytics?.totalListeners).toBeGreaterThan(0);
    });

    it('should return null for non-existent channel', () => {
      const store = useAnalyticsStore.getState();
      const analytics = store.getChannelAnalytics('non-existent');
      expect(analytics).toBeNull();
    });

    it('should add historical data point', () => {
      const store = useAnalyticsStore.getState();
      
      store.addHistoricalDataPoint({
        timestamp: Date.now(),
        listeners: 100,
        channelId: 'channel-1',
      });
      
      expect(store.historicalData).toHaveLength(1);
      expect(store.historicalData[0].listeners).toBe(100);
    });

    it('should get channel history', () => {
      const store = useAnalyticsStore.getState();
      const now = Date.now();
      
      store.addHistoricalDataPoint({
        timestamp: now - 3600000, // 1 hour ago
        listeners: 100,
        channelId: 'channel-1',
      });
      store.addHistoricalDataPoint({
        timestamp: now,
        listeners: 150,
        channelId: 'channel-1',
      });
      
      const history = store.getChannelHistory('channel-1', 24);
      expect(history).toHaveLength(2);
    });

    it('should select channel', () => {
      const store = useAnalyticsStore.getState();
      
      store.selectChannel('channel-1');
      expect(store.selectedChannelId).toBe('channel-1');
      
      store.selectChannel('channel-2');
      expect(store.selectedChannelId).toBe('channel-2');
    });

    it('should get all analytics', () => {
      const store = useAnalyticsStore.getState();
      const mockData1 = generateMockAnalytics('channel-1', 'Test Channel 1');
      const mockData2 = generateMockAnalytics('channel-2', 'Test Channel 2');
      
      store.updateChannelAnalytics('channel-1', mockData1);
      store.updateChannelAnalytics('channel-2', mockData2);
      
      const allAnalytics = store.getAllAnalytics();
      expect(allAnalytics).toHaveLength(2);
    });

    it('should get top channels', () => {
      const store = useAnalyticsStore.getState();
      const mockData1 = generateMockAnalytics('channel-1', 'Test Channel 1');
      const mockData2 = generateMockAnalytics('channel-2', 'Test Channel 2');
      
      store.updateChannelAnalytics('channel-1', { ...mockData1, totalListeners: 1000 });
      store.updateChannelAnalytics('channel-2', { ...mockData2, totalListeners: 500 });
      
      const topChannels = store.getTopChannels(1);
      expect(topChannels).toHaveLength(1);
      expect(topChannels[0].totalListeners).toBe(1000);
    });

    it('should calculate growth rate', () => {
      const store = useAnalyticsStore.getState();
      const now = Date.now();
      
      store.addHistoricalDataPoint({
        timestamp: now - 3600000,
        listeners: 100,
        channelId: 'channel-1',
      });
      store.addHistoricalDataPoint({
        timestamp: now,
        listeners: 200,
        channelId: 'channel-1',
      });
      
      const growthRate = store.calculateGrowthRate('channel-1');
      expect(growthRate).toBe(100); // 100% growth
    });

    it('should handle growth rate with insufficient data', () => {
      const store = useAnalyticsStore.getState();
      const growthRate = store.calculateGrowthRate('channel-1');
      expect(growthRate).toBe(0);
    });
  });
});
