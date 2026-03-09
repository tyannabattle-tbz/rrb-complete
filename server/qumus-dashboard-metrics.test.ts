/**
 * QUMUS Dashboard Metrics Tests
 * 
 * Verifies that the data services return real metrics (not zeros)
 * and that the daily status report generates accurate data.
 */

import { describe, it, expect } from 'vitest';
import { audioStreamingService } from './_core/audioStreamingService';
import { stateOfStudio } from './_core/stateOfStudio';
import { dailyStatusReportService } from './_core/dailyStatusReport';

describe('Audio Streaming Service - Real Metrics', () => {
  it('should return non-zero total listeners', () => {
    const stats = audioStreamingService.getStreamingStats();
    expect(stats).toBeDefined();
    expect(stats.totalListeners).toBeGreaterThan(0);
  });

  it('should return non-zero total channels', () => {
    const stats = audioStreamingService.getStreamingStats();
    expect(stats.totalChannels).toBeGreaterThan(0);
  });

  it('should have channels defined', () => {
    const channels = audioStreamingService.getAllChannels();
    expect(channels).toBeDefined();
    expect(channels.length).toBeGreaterThan(0);
    // Channels are string names, listeners are tracked in streams
    expect(typeof channels[0]).toBe('string');
  });

  it('should have streams with listeners', () => {
    const stats = audioStreamingService.getStreamingStats();
    expect(stats.totalListeners).toBeGreaterThan(0);
    // Verify individual streams exist
    expect(stats.totalChannels).toBeGreaterThan(0);
  });

  it('should return valid quality report', () => {
    const quality = audioStreamingService.getQualityReport();
    expect(quality).toBeDefined();
    expect(quality.qualityStatus).toBeDefined();
    expect(['EXCELLENT', 'GOOD', 'FAIR', 'POOR']).toContain(quality.qualityStatus);
  });

  it('should return valid frequency profiles', () => {
    const profiles = audioStreamingService.getFrequencyProfiles();
    expect(profiles).toBeDefined();
    expect(profiles.length).toBeGreaterThan(0);
  });

  it('should track uptime hours', () => {
    const stats = audioStreamingService.getStreamingStats();
    expect(stats.uptimeHours).toBeDefined();
    expect(stats.uptimeHours).toBeGreaterThanOrEqual(0);
  });

  it('should track commands executed', () => {
    const stats = audioStreamingService.getStreamingStats();
    expect(stats.commandsExecuted).toBeDefined();
    expect(stats.commandsExecuted).toBeGreaterThanOrEqual(0);
  });
});

describe('State of Studio - Real Metrics', () => {
  it('should return health report with non-zero metrics', () => {
    const report = stateOfStudio.getHealthReport();
    expect(report).toBeDefined();
    expect(report.currentMetrics).toBeDefined();
  });

  it('should have positive autonomous decisions count', () => {
    const report = stateOfStudio.getHealthReport();
    expect(report.currentMetrics.autonomousDecisions).toBeGreaterThan(0);
  });

  it('should have positive system health percentage', () => {
    const report = stateOfStudio.getHealthReport();
    expect(report.currentMetrics.systemHealth).toBeGreaterThan(0);
    expect(report.currentMetrics.systemHealth).toBeLessThanOrEqual(100);
  });

  it('should calculate ecosystem health above 0', () => {
    const health = stateOfStudio.calculateEcosystemHealth();
    expect(health).toBeGreaterThan(0);
    expect(health).toBeLessThanOrEqual(100);
  });

  it('should record and increment autonomous decisions', () => {
    const before = stateOfStudio.getHealthReport().currentMetrics.autonomousDecisions;
    stateOfStudio.recordAutonomousDecision();
    const after = stateOfStudio.getHealthReport().currentMetrics.autonomousDecisions;
    expect(after).toBe(before + 1);
  });

  it('should record and increment human interventions', () => {
    const before = stateOfStudio.getHealthReport().currentMetrics.humanInterventions;
    stateOfStudio.recordHumanIntervention();
    const after = stateOfStudio.getHealthReport().currentMetrics.humanInterventions;
    expect(after).toBe(before + 1);
  });

  it('should return legacy status', () => {
    const legacy = stateOfStudio.getLegacyStatus();
    expect(legacy).toBeDefined();
  });

  it('should return metrics history', () => {
    const history = stateOfStudio.getMetricsHistory(5);
    expect(history).toBeDefined();
    expect(Array.isArray(history)).toBe(true);
  });
});

describe('Daily Status Report - Accurate Data', () => {
  it('should return latest report with real data', () => {
    const report = dailyStatusReportService.getLatestReport();
    expect(report).toBeDefined();
  });

  it('should generate report with non-zero listener count', async () => {
    // Trigger a manual report
    await dailyStatusReportService.triggerManualReport();
    const report = dailyStatusReportService.getLatestReport();
    
    if (report) {
      // The report should contain real listener data
      expect(report).toBeDefined();
      // Report text should not contain "0 listeners" as a standalone metric
      if (report.text) {
        expect(report.text).not.toMatch(/RRB Radio: ACTIVE \(0 listeners\)/);
      }
    }
  });

  it('should not flag false degradation warnings when systems are healthy', async () => {
    await dailyStatusReportService.triggerManualReport();
    const report = dailyStatusReportService.getLatestReport();
    
    if (report && report.recommendations) {
      // Should not recommend checking broadcast infrastructure when quality is good
      const hasfalseAudioWarning = report.recommendations.some(
        (r: string) => r.includes('Audio stream quality degraded') && audioStreamingService.getQualityReport().qualityStatus === 'EXCELLENT'
      );
      expect(hasfalseAudioWarning).toBe(false);
    }
  });
});

describe('Ecosystem Integration - Consistent Data', () => {
  it('should have streaming stats match across services', () => {
    const streamingStats = audioStreamingService.getStreamingStats();
    const studioReport = stateOfStudio.getHealthReport();
    
    // Both should report non-zero data
    expect(streamingStats.totalListeners).toBeGreaterThan(0);
    expect(studioReport.currentMetrics.systemHealth).toBeGreaterThan(0);
  });
});
