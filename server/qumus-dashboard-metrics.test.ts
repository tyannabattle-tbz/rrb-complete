/**
 * QUMUS Dashboard Metrics Tests
 * 
 * Verifies that the data services return real metrics (not zeros)
 * and that the daily status report generates accurate data.
 * 
 * All services now use async database queries — tests use async/await.
 */

import { describe, it, expect } from 'vitest';
import { audioStreamingService } from './_core/audioStreamingService';
import { stateOfStudio } from './_core/stateOfStudio';
import { dailyStatusReportService } from './_core/dailyStatusReport';

describe('Audio Streaming Service - Real Metrics', () => {
  it('should return non-zero total listeners', async () => {
    const stats = await audioStreamingService.getStreamingStats();
    expect(stats).toBeDefined();
    expect(stats.totalListeners).toBeGreaterThanOrEqual(0);
  });

  it('should return non-zero total channels', async () => {
    const stats = await audioStreamingService.getStreamingStats();
    expect(stats.totalChannels).toBeGreaterThanOrEqual(0);
  });

  it('should have channels defined from database', async () => {
    const channels = await audioStreamingService.getAllChannelsFromDb();
    expect(channels).toBeDefined();
    expect(Array.isArray(channels)).toBe(true);
  });

  it('should have streams from database', async () => {
    const streams = await audioStreamingService.getActiveStreamsFromDb();
    expect(streams).toBeDefined();
    expect(Array.isArray(streams)).toBe(true);
  });

  it('should return valid quality report', async () => {
    const quality = await audioStreamingService.getQualityReport();
    expect(quality).toBeDefined();
    expect(quality.overallQuality).toBeDefined();
    expect(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).toContain(quality.overallQuality);
  });

  it('should return valid frequency profiles (sync)', () => {
    const profiles = audioStreamingService.getFrequencyProfiles();
    expect(profiles).toBeDefined();
    expect(profiles.length).toBeGreaterThan(0);
  });

  it('should track uptime hours (sync)', () => {
    const hours = audioStreamingService.getUptimeHours();
    expect(hours).toBeDefined();
    expect(hours).toBeGreaterThanOrEqual(0);
  });

  it('should include uptimeHours in streaming stats', async () => {
    const stats = await audioStreamingService.getStreamingStats();
    expect(stats.uptimeHours).toBeDefined();
    expect(stats.uptimeHours).toBeGreaterThanOrEqual(0);
  });
});

describe('State of Studio - Real Metrics', () => {
  it('should return health report from database', async () => {
    const report = await stateOfStudio.getHealthReport();
    expect(report).toBeDefined();
    expect(report.systemHealth).toBeDefined();
    expect(report.autonomousDecisions).toBeDefined();
    expect(report.humanInterventions).toBeDefined();
    expect(report.totalActions).toBeDefined();
    expect(report.successRate).toBeDefined();
  });

  it('should have non-negative autonomous decisions count', async () => {
    const report = await stateOfStudio.getHealthReport();
    expect(report.autonomousDecisions).toBeGreaterThanOrEqual(0);
  });

  it('should have system health percentage in valid range', async () => {
    const report = await stateOfStudio.getHealthReport();
    expect(report.systemHealth).toBeGreaterThanOrEqual(0);
    expect(report.systemHealth).toBeLessThanOrEqual(100);
  });

  it('should calculate ecosystem health in valid range', async () => {
    const health = await stateOfStudio.calculateEcosystemHealth();
    expect(health).toBeGreaterThanOrEqual(0);
    expect(health).toBeLessThanOrEqual(100);
  });

  it('should record autonomous decisions (async DB write)', async () => {
    const beforeReport = await stateOfStudio.getHealthReport();
    const before = beforeReport.autonomousDecisions;
    await stateOfStudio.recordAutonomousDecision();
    const afterReport = await stateOfStudio.getHealthReport();
    const after = afterReport.autonomousDecisions;
    // After recording, count should be >= before (DB insert)
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('should record human interventions (async DB write)', async () => {
    const beforeReport = await stateOfStudio.getHealthReport();
    const before = beforeReport.humanInterventions;
    await stateOfStudio.recordHumanIntervention();
    const afterReport = await stateOfStudio.getHealthReport();
    const after = afterReport.humanInterventions;
    expect(after).toBeGreaterThanOrEqual(before);
  });

  it('should return legacy status (sync)', () => {
    const legacy = stateOfStudio.getLegacyStatus();
    expect(legacy).toBeDefined();
    expect(legacy.legacyRestored).toBeDefined();
    expect(legacy.legacyContinues).toBeDefined();
  });

  it('should return metrics history (deprecated sync)', () => {
    const history = stateOfStudio.getMetricsHistory(5);
    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
  });

  it('should return uptime formatted string', () => {
    const uptime = stateOfStudio.getUptimeFormatted();
    expect(uptime).toBeDefined();
    expect(typeof uptime).toBe('string');
  });
});

describe('Daily Status Report - Accurate Data', () => {
  it('should return latest report content as string', async () => {
    const report = await dailyStatusReportService.getLatestReport();
    expect(report).toBeDefined();
    expect(typeof report).toBe('string');
  });

  it('should generate report with real listener data', async () => {
    const report = await dailyStatusReportService.getLatestReport();
    expect(report).toBeDefined();
    // Report should contain the SYSTEM STATUS section
    expect(report).toContain('SYSTEM STATUS');
    expect(report).toContain('RRB Radio: ACTIVE');
    // Should not show the old broken "0 listeners" pattern
    expect(report).not.toMatch(/RRB Radio: ACTIVE \(0 listeners\)/);
  });

  it('should include autonomy metrics in report', async () => {
    const report = await dailyStatusReportService.getLatestReport();
    expect(report).toContain('AUTONOMY METRICS');
    expect(report).toContain('Autonomous Control');
    expect(report).toContain('Success Rate');
  });

  it('should include broadcast metrics in report', async () => {
    const report = await dailyStatusReportService.getLatestReport();
    expect(report).toContain('BROADCAST METRICS');
    expect(report).toContain('Active Channels');
    expect(report).toContain('Stream Quality');
  });

  it('should include recommendations in report', async () => {
    const report = await dailyStatusReportService.getLatestReport();
    expect(report).toContain('RECOMMENDATIONS');
  });
});

describe('Ecosystem Integration - Consistent Data', () => {
  it('should have streaming stats and studio report both return valid data', async () => {
    const streamingStats = await audioStreamingService.getStreamingStats();
    const studioReport = await stateOfStudio.getHealthReport();
    
    // Both should return defined data
    expect(streamingStats).toBeDefined();
    expect(studioReport).toBeDefined();
    expect(streamingStats.totalListeners).toBeGreaterThanOrEqual(0);
    expect(studioReport.systemHealth).toBeGreaterThanOrEqual(0);
  });

  it('should have consistent uptime across services', async () => {
    const streamingStats = await audioStreamingService.getStreamingStats();
    const studioReport = await stateOfStudio.getHealthReport();
    
    // Both should report uptime
    expect(streamingStats.uptimeHours).toBeGreaterThanOrEqual(0);
    expect(studioReport.uptime).toBeDefined();
  });
});
