import { describe, it, expect } from 'vitest';
import {
  generateAnalyticsCSV,
  generatePDFHeader,
  generatePDFBody,
  generatePDFFooter,
  generatePDFContent,
  generateWeeklySummary,
  generateMonthlyTrend,
  type ChannelAnalytics
} from './analyticsExportService';

describe('Analytics Export Service', () => {
  const mockAnalytics: ChannelAnalytics[] = [
    {
      channelId: 'ch-jazz',
      channelName: 'Jazz Radio',
      date: new Date('2026-02-21'),
      avgListeners: 150,
      maxListeners: 500,
      minListeners: 50,
      totalSpikes: 3,
      peakHour: 19,
      topTrack: 'Kind of Blue',
      engagementRate: 75.5
    },
    {
      channelId: 'ch-classical',
      channelName: 'Classical Masters',
      date: new Date('2026-02-21'),
      avgListeners: 200,
      maxListeners: 600,
      minListeners: 80,
      totalSpikes: 2,
      peakHour: 20,
      topTrack: 'Moonlight Sonata',
      engagementRate: 82.3
    }
  ];

  describe('generateAnalyticsCSV', () => {
    it('should generate CSV with headers', () => {
      const csv = generateAnalyticsCSV(mockAnalytics);
      expect(csv).toContain('Channel Name');
      expect(csv).toContain('Date');
      expect(csv).toContain('Avg Listeners');
    });

    it('should include all analytics data', () => {
      const csv = generateAnalyticsCSV(mockAnalytics);
      expect(csv).toContain('Jazz Radio');
      expect(csv).toContain('Classical Masters');
      expect(csv).toContain('150');
      expect(csv).toContain('200');
    });

    it('should format engagement rate with two decimals', () => {
      const csv = generateAnalyticsCSV(mockAnalytics);
      expect(csv).toContain('75.50');
      expect(csv).toContain('82.30');
    });

    it('should handle single channel', () => {
      const csv = generateAnalyticsCSV([mockAnalytics[0]]);
      expect(csv).toContain('Jazz Radio');
      expect(csv).not.toContain('Classical Masters');
    });

    it('should escape quotes in channel names', () => {
      const analytics: ChannelAnalytics[] = [
        {
          ...mockAnalytics[0],
          channelName: 'Jazz "Live" Radio'
        }
      ];
      const csv = generateAnalyticsCSV(analytics);
      expect(csv).toContain('"Jazz \\"Live\\" Radio"');
    });
  });

  describe('generatePDFHeader', () => {
    it('should include report title', () => {
      const header = generatePDFHeader(new Date('2026-02-01'), new Date('2026-02-28'), 2);
      expect(header).toContain('LISTENER ANALYTICS REPORT');
    });

    it('should include date range', () => {
      const start = new Date('2026-02-01');
      const end = new Date('2026-02-28');
      const header = generatePDFHeader(start, end, 2);
      expect(header).toContain('2/1/2026');
      expect(header).toContain('2/28/2026');
    });

    it('should include channel count', () => {
      const header = generatePDFHeader(new Date('2026-02-01'), new Date('2026-02-28'), 5);
      expect(header).toContain('Channels: 5');
    });
  });

  describe('generatePDFBody', () => {
    it('should include channel names', () => {
      const body = generatePDFBody(mockAnalytics);
      expect(body).toContain('Jazz Radio');
      expect(body).toContain('Classical Masters');
    });

    it('should include listener statistics', () => {
      const body = generatePDFBody(mockAnalytics);
      expect(body).toContain('Average: 150 listeners');
      expect(body).toContain('Maximum: 500 listeners');
    });

    it('should include performance metrics', () => {
      const body = generatePDFBody(mockAnalytics);
      expect(body).toContain('Listener Spikes: 3');
      expect(body).toContain('Top Track: Kind of Blue');
    });

    it('should format engagement rate', () => {
      const body = generatePDFBody(mockAnalytics);
      expect(body).toContain('75.50%');
      expect(body).toContain('82.30%');
    });
  });

  describe('generatePDFFooter', () => {
    it('should include summary section', () => {
      const footer = generatePDFFooter(mockAnalytics);
      expect(footer).toContain('SUMMARY');
    });

    it('should calculate total channels', () => {
      const footer = generatePDFFooter(mockAnalytics);
      expect(footer).toContain('Total Channels Analyzed: 2');
    });

    it('should calculate total spikes', () => {
      const footer = generatePDFFooter(mockAnalytics);
      expect(footer).toContain('Total Listener Spikes: 5');
    });

    it('should calculate average engagement', () => {
      const footer = generatePDFFooter(mockAnalytics);
      const avgEngagement = ((75.5 + 82.3) / 2).toFixed(2);
      expect(footer).toContain(avgEngagement);
    });

    it('should find peak listeners', () => {
      const footer = generatePDFFooter(mockAnalytics);
      expect(footer).toContain('Peak Listeners Across All Channels: 600');
    });
  });

  describe('generatePDFContent', () => {
    it('should combine header, body, and footer', () => {
      const content = generatePDFContent(mockAnalytics, new Date('2026-02-01'), new Date('2026-02-28'));
      expect(content).toContain('LISTENER ANALYTICS REPORT');
      expect(content).toContain('Jazz Radio');
      expect(content).toContain('SUMMARY');
    });

    it('should have proper formatting', () => {
      const content = generatePDFContent(mockAnalytics, new Date('2026-02-01'), new Date('2026-02-28'));
      expect(content.split('\n').length).toBeGreaterThan(10);
    });
  });

  describe('generateWeeklySummary', () => {
    it('should calculate total listeners', () => {
      const summary = generateWeeklySummary(mockAnalytics);
      expect(summary.totalListeners).toBe(350); // 150 + 200
    });

    it('should calculate average listeners per channel', () => {
      const summary = generateWeeklySummary(mockAnalytics);
      expect(summary.avgListenersPerChannel).toBe(175); // 350 / 2
    });

    it('should identify top channel', () => {
      const summary = generateWeeklySummary(mockAnalytics);
      expect(summary.topChannel.channelName).toBe('Classical Masters');
      expect(summary.topChannel.maxListeners).toBe(600);
    });

    it('should sum total spikes', () => {
      const summary = generateWeeklySummary(mockAnalytics);
      expect(summary.totalSpikes).toBe(5); // 3 + 2
    });

    it('should calculate average engagement', () => {
      const summary = generateWeeklySummary(mockAnalytics);
      const expected = Math.round((75.5 + 82.3) / 2);
      expect(summary.avgEngagement).toBe(expected);
    });
  });

  describe('generateMonthlyTrend', () => {
    it('should generate trends for each week', () => {
      const week1 = [mockAnalytics[0]];
      const week2 = [{ ...mockAnalytics[0], avgListeners: 180 }];
      const week3 = [{ ...mockAnalytics[0], avgListeners: 220 }];
      const week4 = [{ ...mockAnalytics[0], avgListeners: 200 }];

      const trends = generateMonthlyTrend([week1, week2, week3, week4]);
      expect(trends).toHaveLength(4);
    });

    it('should detect upward trend', () => {
      const week1 = [{ ...mockAnalytics[0], avgListeners: 100 }];
      const week2 = [{ ...mockAnalytics[0], avgListeners: 150 }];

      const trends = generateMonthlyTrend([week1, week2]);
      expect(trends[1].trend).toBe('up');
    });

    it('should detect downward trend', () => {
      const week1 = [{ ...mockAnalytics[0], avgListeners: 200 }];
      const week2 = [{ ...mockAnalytics[0], avgListeners: 150 }];

      const trends = generateMonthlyTrend([week1, week2]);
      expect(trends[1].trend).toBe('down');
    });

    it('should detect stable trend', () => {
      const week1 = [{ ...mockAnalytics[0], avgListeners: 150 }];
      const week2 = [{ ...mockAnalytics[0], avgListeners: 155 }];

      const trends = generateMonthlyTrend([week1, week2]);
      expect(trends[1].trend).toBe('stable');
    });
  });

  describe('Data validation', () => {
    it('should handle empty analytics array', () => {
      const csv = generateAnalyticsCSV([]);
      expect(csv).toContain('Channel Name');
    });

    it('should handle single analytics entry', () => {
      const csv = generateAnalyticsCSV([mockAnalytics[0]]);
      expect(csv).toContain('Jazz Radio');
    });

    it('should preserve data precision', () => {
      const analytics: ChannelAnalytics[] = [
        {
          ...mockAnalytics[0],
          engagementRate: 99.999
        }
      ];
      const csv = generateAnalyticsCSV(analytics);
      expect(csv).toContain('100.00');
    });
  });
});
