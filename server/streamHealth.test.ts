import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test the stream health monitor's critical alert and leaderboard logic
describe('Stream Health Monitor - Critical Alerts & Leaderboard', () => {
  
  describe('Critical Alert Escalation', () => {
    it('should export getCriticalAlertStatus function', async () => {
      const mod = await import('./services/streamHealthMonitor');
      expect(typeof mod.getCriticalAlertStatus).toBe('function');
    });

    it('should return correct alert status structure', async () => {
      const mod = await import('./services/streamHealthMonitor');
      const status = mod.getCriticalAlertStatus();
      
      expect(status).toHaveProperty('lastAlertTime');
      expect(status).toHaveProperty('alertsThisHour');
      expect(status).toHaveProperty('maxAlertsPerHour');
      expect(status).toHaveProperty('cooldownMs');
      expect(status).toHaveProperty('nextAlertAvailableAt');
      
      // Verify defaults
      expect(status.maxAlertsPerHour).toBe(6);
      expect(status.cooldownMs).toBe(5 * 60 * 1000); // 5 minutes
      expect(status.alertsThisHour).toBeGreaterThanOrEqual(0);
    });

    it('should have correct rate limiting constants', async () => {
      const mod = await import('./services/streamHealthMonitor');
      const status = mod.getCriticalAlertStatus();
      
      // Max 6 alerts per hour
      expect(status.maxAlertsPerHour).toBe(6);
      // 5-minute cooldown
      expect(status.cooldownMs).toBe(300000);
    });
  });

  describe('Channel Performance Leaderboard', () => {
    it('should export getChannelLeaderboard function', async () => {
      const mod = await import('./services/streamHealthMonitor');
      expect(typeof mod.getChannelLeaderboard).toBe('function');
    });

    it('should return an array from getChannelLeaderboard', async () => {
      const mod = await import('./services/streamHealthMonitor');
      const leaderboard = mod.getChannelLeaderboard();
      
      expect(Array.isArray(leaderboard)).toBe(true);
    });

    it('should return entries with correct structure when data exists', async () => {
      const mod = await import('./services/streamHealthMonitor');
      const leaderboard = mod.getChannelLeaderboard();
      
      // If there are entries (from previous health checks), verify structure
      if (leaderboard.length > 0) {
        const entry = leaderboard[0];
        expect(entry).toHaveProperty('channelId');
        expect(entry).toHaveProperty('channelName');
        expect(entry).toHaveProperty('genre');
        expect(entry).toHaveProperty('totalChecks');
        expect(entry).toHaveProperty('healthyChecks');
        expect(entry).toHaveProperty('degradedChecks');
        expect(entry).toHaveProperty('downChecks');
        expect(entry).toHaveProperty('avgResponseTimeMs');
        expect(entry).toHaveProperty('uptimePercent');
        expect(entry).toHaveProperty('rank');
        
        // Rank should be 1 for first entry
        expect(entry.rank).toBe(1);
        
        // Uptime should be between 0 and 100
        expect(entry.uptimePercent).toBeGreaterThanOrEqual(0);
        expect(entry.uptimePercent).toBeLessThanOrEqual(100);
      }
    });

    it('should sort leaderboard by uptime descending', async () => {
      const mod = await import('./services/streamHealthMonitor');
      const leaderboard = mod.getChannelLeaderboard();
      
      if (leaderboard.length > 1) {
        for (let i = 1; i < leaderboard.length; i++) {
          // Higher uptime should come first
          expect(leaderboard[i - 1].uptimePercent).toBeGreaterThanOrEqual(leaderboard[i].uptimePercent);
          // Ranks should be sequential
          expect(leaderboard[i].rank).toBe(i + 1);
        }
      }
    });
  });

  describe('Existing Exports', () => {
    it('should export all required functions', async () => {
      const mod = await import('./services/streamHealthMonitor');
      
      expect(typeof mod.runHealthCheck).toBe('function');
      expect(typeof mod.getLatestReport).toBe('function');
      expect(typeof mod.getHealthHistory).toBe('function');
      expect(typeof mod.getMonitorStatus).toBe('function');
      expect(typeof mod.getOutageHistory).toBe('function');
      expect(typeof mod.getChannelLeaderboard).toBe('function');
      expect(typeof mod.getCriticalAlertStatus).toBe('function');
      expect(typeof mod.startStreamHealthMonitor).toBe('function');
      expect(typeof mod.stopStreamHealthMonitor).toBe('function');
    });
  });
});
