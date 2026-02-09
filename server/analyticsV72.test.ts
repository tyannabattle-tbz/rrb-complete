import { describe, it, expect, beforeAll } from 'vitest';
import { getListenerAnalytics } from './services/listenerAnalyticsService';

describe('Listener Analytics v7.2 - Geographic, Recommendations, Revenue', () => {
  let analytics: ReturnType<typeof getListenerAnalytics>;

  beforeAll(() => {
    analytics = getListenerAnalytics();
  });

  // ===== Geographic Heatmap =====
  describe('Geographic Heatmap', () => {
    it('returns 20 US metro regions', () => {
      const regions = analytics.getRegionData();
      expect(regions.length).toBe(20);
    });

    it('each region has required fields', () => {
      const regions = analytics.getRegionData();
      for (const r of regions) {
        expect(r.id).toBeTruthy();
        expect(r.name).toBeTruthy();
        expect(r.state).toBeTruthy();
        expect(typeof r.lat).toBe('number');
        expect(typeof r.lng).toBe('number');
        expect(r.listeners).toBeGreaterThan(0);
        expect(r.peakListeners).toBeGreaterThanOrEqual(r.listeners);
        expect(r.engagement).toBeGreaterThanOrEqual(0);
        expect(r.engagement).toBeLessThanOrEqual(100);
        expect(r.topChannel).toBeTruthy();
        expect(r.avgSessionMin).toBeGreaterThan(0);
        expect(r.revenueUsd).toBeGreaterThan(0);
      }
    });

    it('includes major cities', () => {
      const regions = analytics.getRegionData();
      const names = regions.map(r => r.name);
      expect(names).toContain('New York City');
      expect(names).toContain('Los Angeles');
      expect(names).toContain('Chicago');
      expect(names).toContain('Atlanta');
    });

    it('aggregates regions by state correctly', () => {
      const states = analytics.getRegionsByState();
      expect(states.length).toBeGreaterThan(0);
      // States should be sorted by totalListeners descending
      for (let i = 1; i < states.length; i++) {
        expect(states[i - 1].totalListeners).toBeGreaterThanOrEqual(states[i].totalListeners);
      }
      // TX has 4 metro areas (Houston, San Antonio, Dallas, Austin)
      const tx = states.find(s => s.state === 'TX');
      expect(tx).toBeTruthy();
      expect(tx!.regions).toBe(4);
    });

    it('state listener totals match region sums', () => {
      const regions = analytics.getRegionData();
      const states = analytics.getRegionsByState();
      for (const st of states) {
        const regionSum = regions.filter(r => r.state === st.state).reduce((s, r) => s + r.listeners, 0);
        expect(st.totalListeners).toBe(regionSum);
      }
    });
  });

  // ===== Content Recommendations =====
  describe('Schedule Recommendations', () => {
    it('returns recommendations array', () => {
      const recs = analytics.getScheduleRecommendations();
      expect(Array.isArray(recs)).toBe(true);
      expect(recs.length).toBeGreaterThan(0);
    });

    it('each recommendation has required fields', () => {
      const recs = analytics.getScheduleRecommendations();
      for (const r of recs) {
        expect(r.channelId).toBeTruthy();
        expect(r.channelName).toBeTruthy();
        expect(r.suggestedSlot).toBeTruthy();
        expect(r.reason).toBeTruthy();
        expect(r.predictedLift).toBeGreaterThan(0);
        expect(r.confidence).toBeGreaterThanOrEqual(0);
        expect(r.confidence).toBeLessThanOrEqual(100);
        expect(r.basedOn).toBeTruthy();
      }
    });

    it('recommendations are sorted by confidence descending', () => {
      const recs = analytics.getScheduleRecommendations();
      for (let i = 1; i < recs.length; i++) {
        expect(recs[i - 1].confidence).toBeGreaterThanOrEqual(recs[i].confidence);
      }
    });
  });

  // ===== Revenue Analytics =====
  describe('Revenue Metrics', () => {
    it('returns revenue metrics object', () => {
      const rev = analytics.getRevenueMetrics();
      expect(rev).toBeTruthy();
      expect(typeof rev.totalRevenue).toBe('number');
      expect(rev.totalRevenue).toBeGreaterThan(0);
    });

    it('revenue breakdown adds up', () => {
      const rev = analytics.getRevenueMetrics();
      // Monthly recurring + one-time should approximately equal total
      const sum = rev.monthlyRecurring + rev.oneTimeDonations;
      expect(Math.abs(sum - rev.totalRevenue)).toBeLessThan(1); // Allow rounding
    });

    it('has revenue by channel data', () => {
      const rev = analytics.getRevenueMetrics();
      expect(rev.revenueByChannel.length).toBeGreaterThan(0);
      for (const ch of rev.revenueByChannel) {
        expect(ch.channelId).toBeTruthy();
        expect(ch.channelName).toBeTruthy();
        expect(ch.revenue).toBeGreaterThanOrEqual(0);
        expect(ch.listeners).toBeGreaterThanOrEqual(0);
        expect(typeof ch.rpl).toBe('number');
      }
      // Should be sorted by revenue descending
      for (let i = 1; i < rev.revenueByChannel.length; i++) {
        expect(rev.revenueByChannel[i - 1].revenue).toBeGreaterThanOrEqual(rev.revenueByChannel[i].revenue);
      }
    });

    it('has revenue by tier data', () => {
      const rev = analytics.getRevenueMetrics();
      expect(rev.revenueByTier.length).toBe(4);
      const tiers = rev.revenueByTier.map(t => t.tier);
      expect(tiers).toContain('Platinum');
      expect(tiers).toContain('Gold');
      expect(tiers).toContain('Silver');
      expect(tiers).toContain('Bronze');
    });

    it('has monthly trend data', () => {
      const rev = analytics.getRevenueMetrics();
      expect(rev.monthlyTrend.length).toBe(6);
      for (const m of rev.monthlyTrend) {
        expect(m.month).toBeTruthy();
        expect(m.revenue).toBeGreaterThan(0);
      }
    });

    it('top revenue channel matches highest in revenueByChannel', () => {
      const rev = analytics.getRevenueMetrics();
      expect(rev.topRevenueChannel).toBe(rev.revenueByChannel[0].channelName);
      expect(rev.topRevenueAmount).toBe(rev.revenueByChannel[0].revenue);
    });
  });
});
