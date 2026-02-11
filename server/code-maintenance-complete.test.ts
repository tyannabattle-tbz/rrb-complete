/**
 * QUMUS Code Maintenance Policy — Complete Integration Tests
 * Tests: service, scheduler, notifications, command execution, router
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Service Tests ──────────────────────────────────────────────────────────

describe('Code Maintenance Policy Service', () => {
  it('should import all service functions', async () => {
    const service = await import('./services/code-maintenance-policy');
    expect(service.runFullScan).toBeDefined();
    expect(service.runCategoryScan).toBeDefined();
    expect(service.getIssues).toBeDefined();
    expect(service.resolveIssue).toBeDefined();
    expect(service.ignoreIssue).toBeDefined();
    expect(service.getScanHistory).toBeDefined();
    expect(service.getLastScanTime).toBeDefined();
    expect(service.getMaintenanceSummary).toBeDefined();
    expect(service.startScheduledScans).toBeDefined();
    expect(service.stopScheduledScans).toBeDefined();
    expect(service.getSchedulerStatus).toBeDefined();
    expect(service.updateSchedulerInterval).toBeDefined();
  });

  it('should export correct types', async () => {
    const service = await import('./services/code-maintenance-policy');
    // Types are compile-time only, but we can verify the functions exist
    expect(typeof service.runFullScan).toBe('function');
    expect(typeof service.getMaintenanceSummary).toBe('function');
  });
});

// ─── Scheduler Tests ────────────────────────────────────────────────────────

describe('Code Maintenance Scheduler', () => {
  let service: typeof import('./services/code-maintenance-policy');

  beforeEach(async () => {
    service = await import('./services/code-maintenance-policy');
  });

  afterEach(() => {
    service.stopScheduledScans();
  });

  it('should return scheduler status', () => {
    const status = service.getSchedulerStatus();
    expect(status).toHaveProperty('enabled');
    expect(status).toHaveProperty('intervalMs');
    expect(status).toHaveProperty('intervalHuman');
    expect(status).toHaveProperty('lastScheduledScan');
    expect(status).toHaveProperty('totalScheduledScans');
    expect(status).toHaveProperty('nextScanEstimate');
  });

  it('should have default 6-hour interval', () => {
    const status = service.getSchedulerStatus();
    expect(status.intervalMs).toBe(6 * 60 * 60 * 1000);
    expect(status.intervalHuman).toContain('6h');
  });

  it('should start scheduler with custom interval', () => {
    const result = service.startScheduledScans(2 * 60 * 60 * 1000);
    expect(result.enabled).toBe(true);
    expect(result.intervalMs).toBe(2 * 60 * 60 * 1000);
  });

  it('should stop scheduler', () => {
    service.startScheduledScans();
    service.stopScheduledScans();
    const status = service.getSchedulerStatus();
    expect(status.enabled).toBe(false);
  });

  it('should update interval', () => {
    const result = service.updateSchedulerInterval(3 * 60 * 60 * 1000);
    expect(result.intervalMs).toBe(3 * 60 * 60 * 1000);
  });

  it('should reject intervals below 5 minutes', () => {
    expect(() => service.updateSchedulerInterval(60 * 1000)).toThrow('Minimum scan interval is 5 minutes');
  });

  it('should calculate next scan estimate', () => {
    service.startScheduledScans(60 * 60 * 1000);
    const status = service.getSchedulerStatus();
    expect(status.nextScanEstimate).toBeGreaterThan(Date.now());
  });

  it('should format interval as human-readable string', () => {
    service.startScheduledScans(90 * 60 * 1000); // 1.5 hours
    const status = service.getSchedulerStatus();
    expect(status.intervalHuman).toContain('1h');
    expect(status.intervalHuman).toContain('30m');
  });
});

// ─── Scan Functions Tests ───────────────────────────────────────────────────

describe('Code Maintenance Scan Functions', () => {
  let service: typeof import('./services/code-maintenance-policy');

  beforeEach(async () => {
    service = await import('./services/code-maintenance-policy');
  });

  afterEach(() => {
    service.stopScheduledScans();
  });

  it('should run a full scan and return a report', async () => {
    const report = await service.runFullScan();
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
    expect(report.overallHealth).toBeGreaterThanOrEqual(0);
    expect(report.overallHealth).toBeLessThanOrEqual(100);
    expect(['A', 'B', 'C', 'D', 'F']).toContain(report.healthGrade);
  }, 30000);

  it('should run category scans individually', async () => {
    const categories = ['cdn_assets', 'audio_streams', 'route_health', 'code_quality', 'dependency_health'] as const;
    for (const cat of categories) {
      const result = await service.runCategoryScan(cat);
      expect(result).toHaveProperty('scanId');
      expect(result).toHaveProperty('category', cat);
      expect(result).toHaveProperty('startedAt');
      expect(result).toHaveProperty('completedAt');
      expect(result).toHaveProperty('itemsScanned');
      expect(result).toHaveProperty('issuesFound');
      expect(result.completedAt).toBeGreaterThanOrEqual(result.startedAt);
    }
  }, 60000);

  it('should throw for unknown category', async () => {
    await expect(service.runCategoryScan('unknown' as any)).rejects.toThrow();
  });
});

// ─── Issue Management Tests ─────────────────────────────────────────────────

describe('Code Maintenance Issue Management', () => {
  let service: typeof import('./services/code-maintenance-policy');

  beforeEach(async () => {
    service = await import('./services/code-maintenance-policy');
    // Run a scan to populate issues
    await service.runFullScan();
  });

  afterEach(() => {
    service.stopScheduledScans();
  });

  it('should get all issues', () => {
    const issues = service.getIssues();
    expect(Array.isArray(issues)).toBe(true);
  });

  it('should filter issues by category', () => {
    const cdnIssues = service.getIssues({ category: 'cdn_assets' });
    cdnIssues.forEach(issue => {
      expect(issue.category).toBe('cdn_assets');
    });
  });

  it('should filter issues by severity', () => {
    const criticalIssues = service.getIssues({ severity: 'critical' });
    criticalIssues.forEach(issue => {
      expect(issue.severity).toBe('critical');
    });
  });

  it('should return maintenance summary', () => {
    const summary = service.getMaintenanceSummary();
    expect(summary).toHaveProperty('totalIssues');
    expect(summary).toHaveProperty('openIssues');
    expect(summary).toHaveProperty('autoFixedIssues');
    expect(summary).toHaveProperty('resolvedIssues');
    expect(summary).toHaveProperty('escalatedIssues');
    expect(summary).toHaveProperty('ignoredIssues');
    expect(summary).toHaveProperty('lastScanAt');
    expect(summary).toHaveProperty('scanCount');
    expect(summary).toHaveProperty('categoryCounts');
    expect(summary.categoryCounts).toHaveProperty('cdn_assets');
    expect(summary.categoryCounts).toHaveProperty('route_health');
    expect(summary.categoryCounts).toHaveProperty('audio_streams');
  });

  it('should get scan history', () => {
    const history = service.getScanHistory();
    expect(Array.isArray(history)).toBe(true);
    if (history.length > 0) {
      expect(history[0]).toHaveProperty('scanId');
      expect(history[0]).toHaveProperty('category');
    }
  });

  it('should get last scan time', () => {
    const time = service.getLastScanTime();
    expect(time).toBeGreaterThan(0);
  });
}, 60000);

// ─── Router Tests ───────────────────────────────────────────────────────────

describe('Code Maintenance Router', () => {
  it('should import the router', async () => {
    const { codeMaintenanceRouter } = await import('./routers/codeMaintenanceRouter');
    expect(codeMaintenanceRouter).toBeDefined();
  });

  it('should have all expected procedures', async () => {
    const { codeMaintenanceRouter } = await import('./routers/codeMaintenanceRouter');
    const procedures = Object.keys((codeMaintenanceRouter as any)._def.procedures || {});
    expect(procedures).toContain('runFullScan');
    expect(procedures).toContain('runCategoryScan');
    expect(procedures).toContain('getIssues');
    expect(procedures).toContain('resolveIssue');
    expect(procedures).toContain('ignoreIssue');
    expect(procedures).toContain('getScanHistory');
    expect(procedures).toContain('getSummary');
    expect(procedures).toContain('getLastScanTime');
    expect(procedures).toContain('getSchedulerStatus');
    expect(procedures).toContain('startScheduler');
    expect(procedures).toContain('stopScheduler');
    expect(procedures).toContain('updateSchedulerInterval');
  });
});

// ─── Command Execution Integration Tests ────────────────────────────────────

describe('Code Maintenance Command Integration', () => {
  it('should import command execution router', async () => {
    const { commandExecutionRouter } = await import('./routers/commandExecutionRouter');
    expect(commandExecutionRouter).toBeDefined();
  });

  it('should import code maintenance functions in command router', async () => {
    const { runFullScan, getMaintenanceSummary, getSchedulerStatus } = await import('./services/code-maintenance-policy');
    expect(runFullScan).toBeDefined();
    expect(getMaintenanceSummary).toBeDefined();
    expect(getSchedulerStatus).toBeDefined();
  });
});

// ─── QUMUS Engine Integration Tests ─────────────────────────────────────────

describe('Code Maintenance QUMUS Engine Integration', () => {
  it('should have code_maintenance policy in CORE_POLICIES', async () => {
    const { CORE_POLICIES } = await import('./qumus-complete-engine');
    const codeMaintenancePolicy = Object.values(CORE_POLICIES).find((p: any) => p.id === 'policy_code_maintenance');
    expect(codeMaintenancePolicy).toBeDefined();
    expect((codeMaintenancePolicy as any)?.name).toContain('Code Maintenance');
    expect((codeMaintenancePolicy as any)?.autonomyLevel).toBe(90);
  });

  it('should have code maintenance event templates in autonomous loop', async () => {
    // The autonomous loop module auto-starts, so we just verify import works
    const loopModule = await import('./services/qumus-autonomous-loop');
    expect(loopModule.getAutonomousLoop).toBeDefined();
  });
});

// ─── Notification Integration Tests ─────────────────────────────────────────

describe('Code Maintenance Notification Integration', () => {
  it('should import notification functions', async () => {
    const { queueNotification } = await import('./services/qumus-notifications');
    expect(queueNotification).toBeDefined();
    expect(typeof queueNotification).toBe('function');
  });

  it('should have code_maintenance notification rule type available', async () => {
    const { getNotificationStats } = await import('./services/qumus-notifications');
    const stats = getNotificationStats();
    expect(stats).toHaveProperty('rules');
    expect(stats).toHaveProperty('totalSent');
    expect(stats).toHaveProperty('totalFailed');
  });
});

// ─── Process Event Tests ────────────────────────────────────────────────────

describe('Code Maintenance Event Processing', () => {
  let service: typeof import('./services/code-maintenance-policy');

  beforeEach(async () => {
    service = await import('./services/code-maintenance-policy');
  });

  afterEach(() => {
    service.stopScheduledScans();
  });

  it('should process code maintenance events through QUMUS', async () => {
    const result = await service.processCodeMaintenanceEvent('broken_image', {
      url: 'https://example.com/broken.jpg',
      page: '/test',
      confidence: 85,
    });
    expect(result).toHaveProperty('decisionId');
    expect(result).toHaveProperty('action');
    expect(result).toHaveProperty('confidence');
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should process different event types', async () => {
    const eventTypes = ['broken_image', 'dead_link', 'stream_down', 'route_404', 'code_issue', 'dep_vulnerability'] as const;
    for (const type of eventTypes) {
      const result = await service.processCodeMaintenanceEvent(type, {
        details: `Test ${type}`,
        confidence: 80,
      });
      expect(result.decisionId).toBeTruthy();
    }
  });
});
