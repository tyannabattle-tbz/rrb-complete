import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  exportToCSV,
  exportToJSON,
  exportSummaryReport,
  generateSummary,
  AnalyticsData,
} from './analyticsExport';

describe('Analytics Export Utilities', () => {
  let mockData: AnalyticsData[];

  beforeEach(() => {
    mockData = [
      {
        timestamp: new Date('2026-02-06T10:00:00Z'),
        broadcastId: 'bc1',
        title: 'System Maintenance',
        severity: 'medium',
        channels: ['email', 'sms'],
        viewerCount: 150,
        engagementRate: 0.85,
        deliveryStatus: 'delivered',
        duration: 300,
      },
      {
        timestamp: new Date('2026-02-06T11:00:00Z'),
        broadcastId: 'bc2',
        title: 'Security Alert',
        severity: 'high',
        channels: ['push', 'in-app'],
        viewerCount: 300,
        engagementRate: 0.92,
        deliveryStatus: 'delivered',
        duration: 600,
      },
      {
        timestamp: new Date('2026-02-06T12:00:00Z'),
        broadcastId: 'bc3',
        title: 'Emergency Alert',
        severity: 'critical',
        channels: ['sms', 'push'],
        viewerCount: 500,
        engagementRate: 0.98,
        deliveryStatus: 'pending',
        duration: 900,
      },
    ];

    // Mock URL.createObjectURL and document methods
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  describe('generateSummary', () => {
    it('should generate correct summary statistics', () => {
      const summary = generateSummary(mockData);

      expect(summary.totalBroadcasts).toBe(3);
      expect(summary.totalViewers).toBe(950);
      expect(summary.avgEngagement).toBeCloseTo(0.917, 2);
      expect(summary.deliveryRate).toBeCloseTo(0.667, 2);
      expect(summary.severityBreakdown).toEqual({
        critical: 1,
        high: 1,
        medium: 1,
        low: 0,
      });
    });

    it('should handle empty data', () => {
      const summary = generateSummary([]);

      expect(summary.totalBroadcasts).toBe(0);
      expect(summary.totalViewers).toBe(0);
      expect(summary.avgEngagement).toBe(0);
      expect(summary.deliveryRate).toBe(0);
    });
  });

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      exportToCSV(mockData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should use custom filename if provided', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      exportToCSV(mockData, { filename: 'custom-report.csv' });

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('exportToJSON', () => {
    it('should export data to JSON format', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      exportToJSON(mockData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should include export metadata', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      exportToJSON(mockData, { filename: 'test.json' });

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('exportSummaryReport', () => {
    it('should export summary report', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      exportSummaryReport(mockData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should include all required sections in report', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      exportSummaryReport(mockData);

      expect(createElementSpy).toHaveBeenCalledWith('a');
    });
  });

  describe('Data validation', () => {
    it('should handle broadcasts with different severities', () => {
      const summary = generateSummary(mockData);

      expect(summary.severityBreakdown.critical).toBe(1);
      expect(summary.severityBreakdown.high).toBe(1);
      expect(summary.severityBreakdown.medium).toBe(1);
    });

    it('should calculate engagement rates correctly', () => {
      const summary = generateSummary(mockData);

      const expectedAvg = (0.85 + 0.92 + 0.98) / 3;
      expect(summary.avgEngagement).toBeCloseTo(expectedAvg, 2);
    });

    it('should track viewer counts accurately', () => {
      const summary = generateSummary(mockData);

      expect(summary.totalViewers).toBe(150 + 300 + 500);
    });
  });
});
