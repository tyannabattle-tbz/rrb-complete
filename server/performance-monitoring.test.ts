/**
 * Performance Monitoring Policy — QUMUS 10th Policy Tests
 * Tests for the service, scheduler, QUMUS engine integration, and command console
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ===== Service Tests =====
describe('Performance Monitoring Policy Service', () => {
  it('should export all required functions', async () => {
    const service = await import('./services/performance-monitoring-policy');
    expect(typeof service.takeSnapshot).toBe('function');
    expect(typeof service.collectCategoryMetric).toBe('function');
    expect(typeof service.getAlerts).toBe('function');
    expect(typeof service.acknowledgeAlert).toBe('function');
    expect(typeof service.resolveAlert).toBe('function');
    expect(typeof service.getSnapshots).toBe('function');
    expect(typeof service.getLastSnapshotTime).toBe('function');
    expect(typeof service.getPerformanceSummary).toBe('function');
    expect(typeof service.startMonitoring).toBe('function');
    expect(typeof service.stopMonitoring).toBe('function');
    expect(typeof service.getMonitoringStatus).toBe('function');
    expect(typeof service.updateMonitoringInterval).toBe('function');
    expect(typeof service.processPerformanceEvent).toBe('function');
  });

  it('should take a performance snapshot with all required fields', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    expect(snapshot).toBeDefined();
    expect(snapshot).toHaveProperty('snapshotId');
    expect(snapshot).toHaveProperty('generatedAt');
    expect(snapshot).toHaveProperty('overallScore');
    expect(snapshot).toHaveProperty('grade');
    expect(snapshot).toHaveProperty('metrics');
    expect(snapshot).toHaveProperty('recommendations');
  });

  it('should return metrics array with api_latency category', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    const apiMetric = snapshot.metrics.find(m => m.category === 'api_latency');
    expect(apiMetric).toBeDefined();
    expect(typeof apiMetric!.value).toBe('number');
    expect(apiMetric!.value).toBeGreaterThanOrEqual(0);
  });

  it('should return metrics array with memory_usage category', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    const memMetric = snapshot.metrics.find(m => m.category === 'memory_usage');
    expect(memMetric).toBeDefined();
    expect(typeof memMetric!.value).toBe('number');
    expect(memMetric!.value).toBeGreaterThanOrEqual(0);
  });

  it('should return metrics array with stream_health category', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    const streamMetric = snapshot.metrics.find(m => m.category === 'stream_health');
    expect(streamMetric).toBeDefined();
    expect(typeof streamMetric!.value).toBe('number');
  });

  it('should return all 6 metric categories', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    const categories = snapshot.metrics.map(m => m.category);
    expect(categories).toContain('page_load');
    expect(categories).toContain('api_latency');
    expect(categories).toContain('memory_usage');
    expect(categories).toContain('stream_health');
    expect(categories).toContain('error_rate');
    expect(categories).toContain('uptime');
  });

  it('should calculate an overall score between 0-100', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    expect(snapshot.overallScore).toBeGreaterThanOrEqual(0);
    expect(snapshot.overallScore).toBeLessThanOrEqual(100);
  });

  it('should assign a valid letter grade', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    expect(['A', 'B', 'C', 'D', 'F']).toContain(snapshot.grade);
  });

  it('should return recommendations as an array', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    const snapshot = await takeSnapshot();
    
    expect(Array.isArray(snapshot.recommendations)).toBe(true);
  });
});

describe('Performance Monitoring Scheduler', () => {
  it('should return monitoring status with correct fields', async () => {
    const { getMonitoringStatus, stopMonitoring } = await import('./services/performance-monitoring-policy');
    stopMonitoring(); // ensure clean state
    const status = getMonitoringStatus();
    
    expect(status).toHaveProperty('enabled');
    expect(status).toHaveProperty('intervalMs');
    expect(status).toHaveProperty('intervalHuman');
    expect(status).toHaveProperty('totalChecks');
    expect(typeof status.enabled).toBe('boolean');
    expect(typeof status.intervalMs).toBe('number');
  });

  it('should start and stop monitoring', async () => {
    const { startMonitoring, stopMonitoring, getMonitoringStatus } = await import('./services/performance-monitoring-policy');
    
    const started = startMonitoring(300000); // 5 min
    expect(started.enabled).toBe(true);
    
    stopMonitoring();
    const stopped = getMonitoringStatus();
    expect(stopped.enabled).toBe(false);
  });

  it('should update monitoring interval', async () => {
    const { startMonitoring, updateMonitoringInterval, stopMonitoring } = await import('./services/performance-monitoring-policy');
    
    startMonitoring(300000);
    const updated = updateMonitoringInterval(600000); // 10 min
    expect(updated.intervalMs).toBe(600000);
    
    stopMonitoring();
  });

  it('should reject intervals below 1 minute', async () => {
    const { updateMonitoringInterval } = await import('./services/performance-monitoring-policy');
    
    expect(() => updateMonitoringInterval(30000)).toThrow();
  });
});

describe('Performance Monitoring Summary', () => {
  it('should return a valid summary with correct fields', async () => {
    const { getPerformanceSummary } = await import('./services/performance-monitoring-policy');
    const summary = getPerformanceSummary();
    
    expect(summary).toHaveProperty('totalSnapshots');
    expect(summary).toHaveProperty('activeAlerts');
    expect(summary).toHaveProperty('lastSnapshotAt');
    expect(typeof summary.totalSnapshots).toBe('number');
    expect(typeof summary.activeAlerts).toBe('number');
  });
});

describe('Performance Monitoring Alerts', () => {
  it('should return alerts array', async () => {
    const { getAlerts } = await import('./services/performance-monitoring-policy');
    const alerts = getAlerts();
    
    expect(Array.isArray(alerts)).toBe(true);
  });

  it('should filter alerts by category', async () => {
    const { getAlerts } = await import('./services/performance-monitoring-policy');
    const alerts = getAlerts({ category: 'api_latency' });
    
    expect(Array.isArray(alerts)).toBe(true);
    alerts.forEach(alert => {
      expect(alert.category).toBe('api_latency');
    });
  });
});

// ===== QUMUS Engine Integration =====
describe('QUMUS Engine — 10th Policy Integration', () => {
  it('should include PERFORMANCE_MONITORING in CORE_POLICIES', async () => {
    const { CORE_POLICIES } = await import('./qumus-complete-engine');
    expect(CORE_POLICIES).toHaveProperty('PERFORMANCE_MONITORING');
    
    const policy = CORE_POLICIES.PERFORMANCE_MONITORING;
    expect(policy.name).toBe('Performance Monitoring');
    expect(policy.autonomyLevel).toBe(92);
    expect(policy.id).toBe('policy_performance_monitoring');
  });

  it('should have 10 total QUMUS policies', async () => {
    const { CORE_POLICIES } = await import('./qumus-complete-engine');
    const policyCount = Object.keys(CORE_POLICIES).length;
    expect(policyCount).toBe(10);
  });

  it('should list all 10 policies by key', async () => {
    const { CORE_POLICIES } = await import('./qumus-complete-engine');
    const expectedPolicies = [
      'RECOMMENDATION_ENGINE',
      'PAYMENT_PROCESSING',
      'CONTENT_MODERATION',
      'USER_REGISTRATION',
      'SUBSCRIPTION_MANAGEMENT',
      'PERFORMANCE_ALERT',
      'ANALYTICS_AGGREGATION',
      'COMPLIANCE_REPORTING',
      'CODE_MAINTENANCE',
      'PERFORMANCE_MONITORING',
    ];
    expectedPolicies.forEach(policy => {
      expect(CORE_POLICIES).toHaveProperty(policy);
    });
  });
});

// ===== Snapshot Store =====
describe('Performance Monitoring Snapshot Store', () => {
  it('should store snapshots after taking them', async () => {
    const { takeSnapshot, getSnapshots } = await import('./services/performance-monitoring-policy');
    await takeSnapshot();
    const snapshots = getSnapshots();
    
    expect(snapshots.length).toBeGreaterThan(0);
    const latest = snapshots[snapshots.length - 1];
    expect(latest).toHaveProperty('overallScore');
    expect(latest).toHaveProperty('grade');
  });

  it('should track last snapshot time', async () => {
    const { takeSnapshot, getLastSnapshotTime } = await import('./services/performance-monitoring-policy');
    const before = Date.now();
    await takeSnapshot();
    const lastTime = getLastSnapshotTime();
    
    expect(lastTime).toBeGreaterThanOrEqual(before - 1000);
    expect(lastTime).toBeLessThanOrEqual(Date.now() + 1000);
  });
});

// ===== Command Console Integration =====
describe('Command Console — Performance Monitoring Commands', () => {
  it('should be importable as takeSnapshot alias for runPerformanceBenchmark', async () => {
    const { takeSnapshot } = await import('./services/performance-monitoring-policy');
    expect(typeof takeSnapshot).toBe('function');
    
    const result = await takeSnapshot();
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('overallScore');
    expect(result).toHaveProperty('metrics');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('snapshotId');
  });
});
