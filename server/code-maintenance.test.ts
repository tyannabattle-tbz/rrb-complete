import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch for CDN/stream health checks
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
import {
  runFullScan,
  runCategoryScan,
  getIssues,
  resolveIssue,
  ignoreIssue,
  getScanHistory,
  getLastScanTime,
  getMaintenanceSummary,
} from './services/code-maintenance-policy';

describe('QUMUS Code Maintenance Policy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: all fetches succeed
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
  });

  describe('runFullScan', () => {
    it('should return a complete report with all scan categories', async () => {
      const report = await runFullScan();

      expect(report).toHaveProperty('reportId');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('overallHealth');
      expect(report).toHaveProperty('healthGrade');
      expect(report).toHaveProperty('scanResults');
      expect(report).toHaveProperty('totalIssues');
      expect(report).toHaveProperty('criticalIssues');
      expect(report).toHaveProperty('autoFixedCount');
      expect(report).toHaveProperty('escalatedCount');
      expect(report).toHaveProperty('recommendations');
    });

    it('should scan all 5 categories', async () => {
      const report = await runFullScan();
      const categories = report.scanResults.map((r: any) => r.category);

      expect(categories).toContain('cdn_assets');
      expect(categories).toContain('audio_streams');
      expect(categories).toContain('route_health');
      expect(categories).toContain('code_quality');
      expect(categories).toContain('dependency_health');
    });

    it('should calculate health grade A when all assets are healthy', async () => {
      const report = await runFullScan();

      // When all fetches succeed, health should be high
      expect(report.overallHealth).toBeGreaterThanOrEqual(80);
      expect(['A', 'B']).toContain(report.healthGrade);
    });

    it('should detect broken CDN assets', async () => {
      // Make CDN fetches return 404
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('manuscdn.com')) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.resolve({ ok: true, status: 200 });
      });

      const report = await runFullScan();
      const cdnResult = report.scanResults.find((r: any) => r.category === 'cdn_assets');

      expect(cdnResult).toBeDefined();
      expect(cdnResult!.issuesFound).toBeGreaterThan(0);
      expect(cdnResult!.issues[0].severity).toBe('critical');
    });

    it('should detect unreachable audio streams', async () => {
      // Make audio stream fetches fail
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && (url.includes('laut.fm') || url.includes('somafm.com'))) {
          return Promise.reject(new Error('Connection timeout'));
        }
        return Promise.resolve({ ok: true, status: 200 });
      });

      const report = await runFullScan();
      const audioResult = report.scanResults.find((r: any) => r.category === 'audio_streams');

      expect(audioResult).toBeDefined();
      expect(audioResult!.issuesFound).toBeGreaterThan(0);
    });

    it('should include recommendations', async () => {
      const report = await runFullScan();
      expect(report.recommendations).toBeDefined();
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should update last scan time', async () => {
      const before = Date.now();
      await runFullScan();
      const lastScan = getLastScanTime();

      expect(lastScan).toBeGreaterThanOrEqual(before);
    });
  });

  describe('runCategoryScan', () => {
    it('should scan CDN assets individually', async () => {
      const result = await runCategoryScan('cdn_assets');

      expect(result.category).toBe('cdn_assets');
      expect(result.itemsScanned).toBeGreaterThan(0);
      expect(result).toHaveProperty('scanId');
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('completedAt');
    });

    it('should scan audio streams individually', async () => {
      const result = await runCategoryScan('audio_streams');

      expect(result.category).toBe('audio_streams');
      expect(result.itemsScanned).toBeGreaterThan(0);
    });

    it('should scan route health individually', async () => {
      const result = await runCategoryScan('route_health');

      expect(result.category).toBe('route_health');
      expect(result.itemsScanned).toBeGreaterThan(0);
    });

    it('should scan code quality individually', async () => {
      const result = await runCategoryScan('code_quality');

      expect(result.category).toBe('code_quality');
    });

    it('should scan dependency health individually', async () => {
      const result = await runCategoryScan('dependency_health');

      expect(result.category).toBe('dependency_health');
    });

    it('should throw for unknown category', async () => {
      await expect(runCategoryScan('nonexistent' as any)).rejects.toThrow('Unknown scan category');
    });
  });

  describe('Issue Management', () => {
    beforeEach(async () => {
      // Run a scan to populate issues
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('manuscdn.com')) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.resolve({ ok: true, status: 200 });
      });
      await runFullScan();
    });

    it('should return all issues', () => {
      const issues = getIssues();
      expect(Array.isArray(issues)).toBe(true);
    });

    it('should filter issues by category', () => {
      const cdnIssues = getIssues({ category: 'cdn_assets' });
      cdnIssues.forEach(issue => {
        expect(issue.category).toBe('cdn_assets');
      });
    });

    it('should filter issues by severity', () => {
      const criticalIssues = getIssues({ severity: 'critical' });
      criticalIssues.forEach(issue => {
        expect(issue.severity).toBe('critical');
      });
    });

    it('should filter issues by status', () => {
      const openIssues = getIssues({ status: 'open' });
      openIssues.forEach(issue => {
        expect(issue.status).toBe('open');
      });
    });

    it('should resolve an issue', () => {
      const issues = getIssues({ status: 'open' });
      if (issues.length > 0) {
        const resolved = resolveIssue(issues[0].id);
        expect(resolved).not.toBeNull();
        expect(resolved!.status).toBe('resolved');
        expect(resolved!.resolvedBy).toBe('human');
        expect(resolved!.resolvedAt).toBeDefined();
      }
    });

    it('should ignore an issue', () => {
      const issues = getIssues({ status: 'open' });
      if (issues.length > 0) {
        const ignored = ignoreIssue(issues[0].id);
        expect(ignored).not.toBeNull();
        expect(ignored!.status).toBe('ignored');
        expect(ignored!.resolvedAt).toBeDefined();
      }
    });

    it('should return null for non-existent issue resolve', () => {
      const result = resolveIssue('nonexistent_id');
      expect(result).toBeNull();
    });

    it('should return null for non-existent issue ignore', () => {
      const result = ignoreIssue('nonexistent_id');
      expect(result).toBeNull();
    });
  });

  describe('Scan History', () => {
    it('should return scan history', async () => {
      await runFullScan();
      const history = getScanHistory();

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      await runFullScan();
      await runFullScan();
      const history = getScanHistory(3);

      expect(history.length).toBeLessThanOrEqual(3);
    });

    it('should return most recent scans first', async () => {
      await runFullScan();
      const history = getScanHistory();

      if (history.length >= 2) {
        expect(history[0].startedAt).toBeGreaterThanOrEqual(history[1].startedAt);
      }
    });
  });

  describe('Maintenance Summary', () => {
    it('should return summary statistics', async () => {
      await runFullScan();
      const summary = getMaintenanceSummary();

      expect(summary).toHaveProperty('totalIssues');
      expect(summary).toHaveProperty('openIssues');
      expect(summary).toHaveProperty('autoFixedIssues');
      expect(summary).toHaveProperty('resolvedIssues');
      expect(summary).toHaveProperty('escalatedIssues');
      expect(summary).toHaveProperty('ignoredIssues');
      expect(summary).toHaveProperty('lastScanAt');
      expect(summary).toHaveProperty('scanCount');
      expect(summary).toHaveProperty('categoryCounts');
    });

    it('should have category counts for all categories', async () => {
      await runFullScan();
      const summary = getMaintenanceSummary();

      expect(summary.categoryCounts).toHaveProperty('cdn_assets');
      expect(summary.categoryCounts).toHaveProperty('route_health');
      expect(summary.categoryCounts).toHaveProperty('audio_streams');
      expect(summary.categoryCounts).toHaveProperty('dead_links');
      expect(summary.categoryCounts).toHaveProperty('code_quality');
      expect(summary.categoryCounts).toHaveProperty('dependency_health');
    });

    it('should track scan count', async () => {
      const before = getMaintenanceSummary().scanCount;
      await runFullScan();
      const after = getMaintenanceSummary().scanCount;

      expect(after).toBeGreaterThan(before);
    });
  });

  describe('CDN Asset Validation', () => {
    it('should check all known CDN assets', async () => {
      const result = await runCategoryScan('cdn_assets');
      // We have 4 known CDN assets
      expect(result.itemsScanned).toBe(4);
    });

    it('should report 404 as critical severity', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });
      const result = await runCategoryScan('cdn_assets');

      const criticalIssues = result.issues.filter(i => i.severity === 'critical');
      expect(criticalIssues.length).toBeGreaterThan(0);
    });

    it('should report non-404 errors as high severity', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });
      const result = await runCategoryScan('cdn_assets');

      const highIssues = result.issues.filter(i => i.severity === 'high');
      expect(highIssues.length).toBeGreaterThan(0);
    });

    it('should handle fetch timeouts gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('AbortError: signal timed out'));
      const result = await runCategoryScan('cdn_assets');

      expect(result.issuesFound).toBeGreaterThan(0);
      result.issues.forEach(issue => {
        expect(issue.description).toContain('AbortError');
      });
    });
  });

  describe('Audio Stream Health', () => {
    it('should check all known audio streams', async () => {
      const result = await runCategoryScan('audio_streams');
      // We have 7 known audio streams
      expect(result.itemsScanned).toBe(7);
    });

    it('should report 4xx/5xx streams as issues', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 503 });
      const result = await runCategoryScan('audio_streams');

      expect(result.issuesFound).toBe(7); // All streams should be flagged
    });

    it('should handle network errors for streams', async () => {
      mockFetch.mockRejectedValue(new Error('ECONNREFUSED'));
      const result = await runCategoryScan('audio_streams');

      expect(result.issuesFound).toBe(7);
      result.issues.forEach(issue => {
        expect(issue.severity).toBe('medium'); // Network errors are medium for streams
      });
    });
  });

  describe('Route Health', () => {
    it('should check critical routes', async () => {
      const result = await runCategoryScan('route_health');
      expect(result.itemsScanned).toBeGreaterThan(10); // We have 25+ critical routes
    });
  });

  describe('Health Score Calculation', () => {
    it('should score 100 when no issues exist', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      const report = await runFullScan();

      // With all healthy assets, score should be near 100
      // (code_quality may have auto-fixed issues which don't reduce score)
      expect(report.overallHealth).toBeGreaterThanOrEqual(90);
    });

    it('should reduce score for critical issues', async () => {
      // First scan with all healthy
      mockFetch.mockResolvedValue({ ok: true, status: 200 });
      const healthyReport = await runFullScan();

      // Then scan with broken CDN
      mockFetch.mockImplementation((url: string) => {
        if (typeof url === 'string' && url.includes('manuscdn.com')) {
          return Promise.resolve({ ok: false, status: 404 });
        }
        return Promise.resolve({ ok: true, status: 200 });
      });
      const brokenReport = await runFullScan();

      expect(brokenReport.overallHealth).toBeLessThan(healthyReport.overallHealth);
    });
  });
});
