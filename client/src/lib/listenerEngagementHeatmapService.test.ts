import { describe, it, expect } from 'vitest';
import {
  generateChannelHeatmap,
  getHeatmapColor,
  formatHeatmapForVisualization,
  compareChannelHeatmaps,
  generateHeatmapRecommendations,
  exportHeatmapAsCSV
} from './listenerEngagementHeatmapService';

describe('Listener Engagement Heatmap Service', () => {
  const mockHistoricalData = [
    // Weekend peak (Saturday 19:00)
    { timestamp: new Date('2026-02-21T19:00:00').getTime(), listeners: 500 },
    { timestamp: new Date('2026-02-21T19:30:00').getTime(), listeners: 520 },
    { timestamp: new Date('2026-02-21T20:00:00').getTime(), listeners: 480 },
    // Weekday low (Tuesday 03:00)
    { timestamp: new Date('2026-02-17T03:00:00').getTime(), listeners: 50 },
    { timestamp: new Date('2026-02-17T03:30:00').getTime(), listeners: 45 },
    // Evening peak (Friday 20:00)
    { timestamp: new Date('2026-02-20T20:00:00').getTime(), listeners: 450 },
    { timestamp: new Date('2026-02-20T20:30:00').getTime(), listeners: 470 }
  ];

  describe('generateChannelHeatmap', () => {
    it('should generate heatmap with correct dimensions', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      expect(heatmap.data).toHaveLength(7 * 24); // 7 days × 24 hours
    });

    it('should identify peak day and hour', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      expect(heatmap.peakDay).toBeDefined();
      expect(heatmap.peakHour).toBeDefined();
      expect(heatmap.peakDay).toBeGreaterThanOrEqual(0);
      expect(heatmap.peakDay).toBeLessThan(7);
      expect(heatmap.peakHour).toBeGreaterThanOrEqual(0);
      expect(heatmap.peakHour).toBeLessThan(24);
    });

    it('should calculate average engagement', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      expect(heatmap.avgEngagement).toBeGreaterThanOrEqual(0);
      expect(heatmap.avgEngagement).toBeLessThanOrEqual(100);
    });

    it('should handle empty historical data', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', []);
      expect(heatmap.data).toHaveLength(7 * 24);
      expect(heatmap.avgEngagement).toBe(0);
    });

    it('should preserve channel metadata', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      expect(heatmap.channelId).toBe('ch-jazz');
      expect(heatmap.channelName).toBe('Jazz Radio');
    });
  });

  describe('getHeatmapColor', () => {
    it('should return gray for low engagement', () => {
      expect(getHeatmapColor(10)).toBe('#1f2937');
    });

    it('should return blue for low-medium engagement', () => {
      expect(getHeatmapColor(30)).toBe('#3b82f6');
    });

    it('should return green for medium engagement', () => {
      expect(getHeatmapColor(50)).toBe('#10b981');
    });

    it('should return amber for high engagement', () => {
      expect(getHeatmapColor(70)).toBe('#f59e0b');
    });

    it('should return red for very high engagement', () => {
      expect(getHeatmapColor(90)).toBe('#ef4444');
    });

    it('should handle boundary values', () => {
      expect(getHeatmapColor(0)).toBe('#1f2937');
      expect(getHeatmapColor(100)).toBe('#ef4444');
    });
  });

  describe('formatHeatmapForVisualization', () => {
    it('should format heatmap for UI display', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const formatted = formatHeatmapForVisualization(heatmap);

      expect(formatted.channel).toBe('Jazz Radio');
      expect(formatted.peakTime).toBeDefined();
      expect(formatted.avgEngagement).toBeDefined();
      expect(formatted.grid).toHaveLength(7);
    });

    it('should include day and hour labels', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const formatted = formatHeatmapForVisualization(heatmap);

      formatted.grid.forEach((dayRow, dayIndex) => {
        expect(dayRow).toHaveLength(24);
        dayRow.forEach((cell, hourIndex) => {
          expect(cell.day).toBeDefined();
          expect(cell.hour).toBeDefined();
          expect(cell.listeners).toBeGreaterThanOrEqual(0);
          expect(cell.engagement).toBeGreaterThanOrEqual(0);
          expect(cell.color).toBeDefined();
        });
      });
    });
  });

  describe('compareChannelHeatmaps', () => {
    it('should compare multiple channel heatmaps', () => {
      const heatmap1 = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const heatmap2 = generateChannelHeatmap('ch-classical', 'Classical Masters', mockHistoricalData);

      const comparison = compareChannelHeatmaps([heatmap1, heatmap2]);

      expect(comparison.channels).toHaveLength(2);
      expect(comparison.overallPeakDay).toBeDefined();
      expect(comparison.overallPeakHour).toBeDefined();
      expect(comparison.avgEngagementAcrossChannels).toBeGreaterThanOrEqual(0);
    });

    it('should identify most common peak day', () => {
      const heatmap1 = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const heatmap2 = generateChannelHeatmap('ch-classical', 'Classical Masters', mockHistoricalData);

      const comparison = compareChannelHeatmaps([heatmap1, heatmap2]);
      expect(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).toContain(comparison.overallPeakDay);
    });
  });

  describe('generateHeatmapRecommendations', () => {
    it('should generate recommendations', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const recommendations = generateHeatmapRecommendations(heatmap);

      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
    });

    it('should recommend scheduling at peak time', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const recommendations = generateHeatmapRecommendations(heatmap);

      expect(recommendations[0]).toContain('Schedule premium content');
    });

    it('should warn about low engagement', () => {
      const lowEngagementData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() + i * 3600000,
        listeners: 10
      }));

      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', lowEngagementData);
      const recommendations = generateHeatmapRecommendations(heatmap);

      const hasEngagementWarning = recommendations.some(r => r.includes('engagement'));
      expect(hasEngagementWarning).toBe(true);
    });

    it('should praise high engagement', () => {
      const highEngagementData = Array.from({ length: 100 }, (_, i) => ({
        timestamp: Date.now() + i * 3600000,
        listeners: 1000
      }));

      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', highEngagementData);
      const recommendations = generateHeatmapRecommendations(heatmap);

      const hasPraiseComment = recommendations.some(r => r.includes('Excellent'));
      expect(hasPraiseComment).toBe(true);
    });
  });

  describe('exportHeatmapAsCSV', () => {
    it('should export heatmap as CSV', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const csv = exportHeatmapAsCSV(heatmap);

      expect(csv).toContain('Channel: Jazz Radio');
      expect(csv).toContain('Day');
      expect(csv).toContain('Hour');
      expect(csv).toContain('Avg Listeners');
    });

    it('should include peak time in CSV', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const csv = exportHeatmapAsCSV(heatmap);

      expect(csv).toContain('Peak Time:');
    });

    it('should include engagement data', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const csv = exportHeatmapAsCSV(heatmap);

      expect(csv).toContain('Average Engagement:');
    });

    it('should format CSV properly', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', mockHistoricalData);
      const csv = exportHeatmapAsCSV(heatmap);

      const lines = csv.split('\n');
      expect(lines.length).toBeGreaterThan(10);
    });
  });

  describe('Heatmap data validation', () => {
    it('should handle single data point', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', [
        { timestamp: Date.now(), listeners: 100 }
      ]);
      expect(heatmap.data).toHaveLength(7 * 24);
    });

    it('should handle large listener counts', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', [
        { timestamp: Date.now(), listeners: 1000000 }
      ]);
      expect(heatmap.avgEngagement).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero listeners', () => {
      const heatmap = generateChannelHeatmap('ch-jazz', 'Jazz Radio', [
        { timestamp: Date.now(), listeners: 0 }
      ]);
      expect(heatmap.data).toHaveLength(7 * 24);
    });
  });
});
