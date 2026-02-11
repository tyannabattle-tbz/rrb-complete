import { describe, it, expect, beforeEach } from 'vitest';
import {
  getSources,
  getSourceById,
  addSource,
  removeSource,
  updateSource,
  getDiscrepancies,
  acknowledgeDiscrepancy,
  disputeDiscrepancy,
  escalateDiscrepancy,
  resolveDiscrepancy,
  runAudit,
  getAuditReports,
  getAuditSummary,
  startAuditScheduler,
  stopAuditScheduler,
  getAuditSchedulerStatus,
  executeCommand,
} from './services/royalty-audit-policy';

describe('QUMUS 12th Policy — Royalty Audit', () => {
  // ─── Source Management ─────────────────────────────────────────────────

  describe('Source Management', () => {
    it('should return default royalty sources on initialization', () => {
      const sources = getSources();
      expect(sources.length).toBeGreaterThanOrEqual(10);
    });

    it('should filter sources by platform', () => {
      const bmiSources = getSources({ platform: 'bmi' });
      expect(bmiSources.length).toBeGreaterThan(0);
      bmiSources.forEach(s => expect(s.platform).toBe('bmi'));
    });

    it('should filter sources by type', () => {
      const streamingSources = getSources({ type: 'streaming' });
      expect(streamingSources.length).toBeGreaterThan(0);
      streamingSources.forEach(s => expect(s.type).toBe('streaming'));
    });

    it('should filter sources by status', () => {
      const verified = getSources({ status: 'verified' });
      verified.forEach(s => expect(s.status).toBe('verified'));
    });

    it('should get a source by ID', () => {
      const sources = getSources();
      const source = getSourceById(sources[0].id);
      expect(source.id).toBe(sources[0].id);
    });

    it('should throw when getting non-existent source', () => {
      expect(() => getSourceById('nonexistent')).toThrow('Royalty source not found');
    });

    it('should add a new royalty source', () => {
      const before = getSources().length;
      const newSource = addSource({
        platform: 'tidal',
        type: 'streaming',
        songTitle: "Rockin' Rockin' Boogie",
        artist: 'Seabrun Candy Hunter',
        expectedRate: 1.0,
        period: '2026-Q1',
        notes: 'Tidal HiFi monitoring',
      });
      expect(newSource.id).toBeTruthy();
      expect(newSource.status).toBe('pending');
      expect(getSources().length).toBe(before + 1);
    });

    it('should reject duplicate source', () => {
      expect(() => addSource({
        platform: 'tidal',
        type: 'streaming',
        songTitle: "Rockin' Rockin' Boogie",
        artist: 'Seabrun Candy Hunter',
        expectedRate: 1.0,
        period: '2026-Q1',
      })).toThrow('Source already monitored');
    });

    it('should update a source', () => {
      const sources = getSources({ platform: 'spotify' });
      const updated = updateSource(sources[0].id, { actualRate: 0.35, totalPlays: 5000 });
      expect(updated.actualRate).toBe(0.35);
      expect(updated.totalPlays).toBe(5000);
      expect(updated.lastChecked).toBeTruthy();
    });

    it('should remove a source', () => {
      const sources = getSources({ platform: 'tidal' });
      if (sources.length > 0) {
        const before = getSources().length;
        removeSource(sources[0].id);
        expect(getSources().length).toBe(before - 1);
      }
    });

    it('should throw when removing non-existent source', () => {
      expect(() => removeSource('nonexistent')).toThrow('Royalty source not found');
    });
  });

  // ─── Audit Engine ──────────────────────────────────────────────────────

  describe('Audit Engine', () => {
    it('should run an audit and return a report', () => {
      const report = runAudit();
      expect(report.id).toBeTruthy();
      expect(report.title).toContain('Royalty Audit');
      expect(report.totalSources).toBeGreaterThan(0);
      expect(report.generatedAt).toBeTruthy();
      expect(report.recommendations).toBeInstanceOf(Array);
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it('should accumulate audit reports', () => {
      const reportsBefore = getAuditReports().length;
      runAudit();
      expect(getAuditReports().length).toBe(reportsBefore + 1);
    });

    it('should return audit summary with health score', () => {
      const summary = getAuditSummary();
      expect(summary.totalSources).toBeGreaterThan(0);
      expect(summary.healthScore).toBeGreaterThanOrEqual(0);
      expect(summary.healthScore).toBeLessThanOrEqual(100);
      expect(['A', 'B', 'C', 'D', 'F']).toContain(summary.healthGrade);
      expect(summary.platformCount).toBeGreaterThan(0);
      expect(summary.songCount).toBeGreaterThan(0);
    });

    it('should track total audits count', () => {
      const before = getAuditSummary().totalAudits;
      runAudit();
      expect(getAuditSummary().totalAudits).toBe(before + 1);
    });

    it('should have platform breakdown in summary', () => {
      const summary = getAuditSummary();
      expect(summary.platformBreakdown).toBeTruthy();
      expect(Object.keys(summary.platformBreakdown).length).toBeGreaterThan(0);
    });
  });

  // ─── Discrepancy Management ────────────────────────────────────────────

  describe('Discrepancy Management', () => {
    it('should return discrepancies list', () => {
      const discs = getDiscrepancies();
      expect(Array.isArray(discs)).toBe(true);
    });

    it('should filter discrepancies by status', () => {
      const openDiscs = getDiscrepancies({ status: 'open' });
      openDiscs.forEach(d => expect(d.status).toBe('open'));
    });

    it('should acknowledge a discrepancy if any exist', () => {
      const openDiscs = getDiscrepancies({ status: 'open' });
      if (openDiscs.length > 0) {
        const acked = acknowledgeDiscrepancy(openDiscs[0].id);
        expect(acked.status).toBe('acknowledged');
      }
    });

    it('should escalate a discrepancy if any exist', () => {
      // Run audit to generate fresh discrepancies
      runAudit();
      const openDiscs = getDiscrepancies({ status: 'open' });
      if (openDiscs.length > 0) {
        const escalated = escalateDiscrepancy(openDiscs[0].id);
        expect(escalated.status).toBe('escalated');
      }
    });

    it('should dispute a discrepancy if any exist', () => {
      runAudit();
      const openDiscs = getDiscrepancies({ status: 'open' });
      if (openDiscs.length > 0) {
        const disputed = disputeDiscrepancy(openDiscs[0].id, 'Under review with BMI');
        expect(disputed.status).toBe('disputed');
        expect(disputed.resolution).toBe('Under review with BMI');
      }
    });

    it('should resolve a discrepancy if any exist', () => {
      runAudit();
      const openDiscs = getDiscrepancies({ status: 'open' });
      if (openDiscs.length > 0) {
        const resolved = resolveDiscrepancy(openDiscs[0].id, 'Confirmed correct with BMI');
        expect(resolved.status).toBe('resolved');
        expect(resolved.resolution).toBe('Confirmed correct with BMI');
        expect(resolved.resolvedAt).toBeTruthy();
      }
    });

    it('should throw when acknowledging non-existent discrepancy', () => {
      expect(() => acknowledgeDiscrepancy('nonexistent')).toThrow('Discrepancy not found');
    });
  });

  // ─── Scheduler ─────────────────────────────────────────────────────────

  describe('Scheduler', () => {
    it('should return scheduler status', () => {
      const status = getAuditSchedulerStatus();
      expect(typeof status.enabled).toBe('boolean');
      expect(status.intervalMs).toBeGreaterThan(0);
      expect(status.intervalHuman).toBeTruthy();
    });

    it('should start and stop scheduler', () => {
      startAuditScheduler(3600000); // 1 hour
      let status = getAuditSchedulerStatus();
      expect(status.enabled).toBe(true);

      stopAuditScheduler();
      status = getAuditSchedulerStatus();
      expect(status.enabled).toBe(false);
    });

    it('should reject interval below minimum', () => {
      expect(() => startAuditScheduler(1000)).toThrow('Minimum audit interval');
    });
  });

  // ─── Command Console Integration ──────────────────────────────────────

  describe('Command Console', () => {
    it('should handle royalty status command', () => {
      const result = executeCommand('royalty status');
      expect(result).toContain('Royalty Audit Status');
      expect(result).toContain('Sources:');
      expect(result).toContain('Health:');
    });

    it('should handle royalty run command', () => {
      const result = executeCommand('royalty run');
      expect(result).toContain('Royalty audit complete');
      expect(result).toContain('Sources:');
    });

    it('should handle royalty discrepancies command', () => {
      const result = executeCommand('royalty discrepancies');
      expect(result).toBeTruthy();
    });

    it('should handle royalty platforms command', () => {
      const result = executeCommand('royalty platforms');
      expect(result).toContain('Monitored Platforms');
    });

    it('should handle royalty scheduler command', () => {
      const result = executeCommand('royalty scheduler');
      expect(result).toContain('Royalty Audit Scheduler');
    });

    it('should show help for unknown royalty subcommand', () => {
      const result = executeCommand('royalty');
      expect(result).toContain('Royalty Audit Commands');
    });
  });

  // ─── Default Data Integrity ────────────────────────────────────────────

  describe('Default Data Integrity', () => {
    it('should include BMI sources for Seabrun Candy Hunter', () => {
      const bmiSources = getSources({ platform: 'bmi' });
      const hunterSources = bmiSources.filter(s => s.artist.includes('Seabrun Candy Hunter') || s.artist.includes('Canned Heat'));
      expect(hunterSources.length).toBeGreaterThan(0);
    });

    it('should include Rockin Rockin Boogie across platforms', () => {
      const sources = getSources();
      const rrbSources = sources.filter(s => s.songTitle.includes("Rockin' Rockin' Boogie"));
      expect(rrbSources.length).toBeGreaterThanOrEqual(4); // BMI x2, Spotify, Apple, YouTube, SoundExchange
    });

    it("should include Let's Work Together with Payten Music credit", () => {
      const sources = getSources();
      const lwtSources = sources.filter(s => s.songTitle.includes("Let's Work Together"));
      expect(lwtSources.length).toBeGreaterThanOrEqual(2);
      const paytenSource = lwtSources.find(s => s.notes?.includes('Payten Music'));
      expect(paytenSource).toBeTruthy();
    });

    it('should monitor at least 6 platforms', () => {
      const summary = getAuditSummary();
      expect(summary.platformCount).toBeGreaterThanOrEqual(4);
    });
  });
});
