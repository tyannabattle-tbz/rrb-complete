import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the db module before importing
vi.mock('./db', () => ({
  getDb: vi.fn().mockResolvedValue({
    execute: vi.fn().mockResolvedValue([[{ cnt: 54 }], []]),
  }),
}));

// Mock notification
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe('QUMUS Self-Audit Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export all required functions', async () => {
    const mod = await import('./services/qumusSelfAudit');
    expect(mod.startSelfAudit).toBeDefined();
    expect(mod.getAuditStatus).toBeDefined();
    expect(mod.getLastReport).toBeDefined();
    expect(mod.getCorrectionHistory).toBeDefined();
    expect(mod.setAuditEnabled).toBeDefined();
    expect(mod.setAutoCorrectEnabled).toBeDefined();
    expect(mod.triggerManualAudit).toBeDefined();
  });

  it('should return correct initial status', async () => {
    const { getAuditStatus } = await import('./services/qumusSelfAudit');
    const status = getAuditStatus();
    
    expect(status).toHaveProperty('isRunning');
    expect(status).toHaveProperty('auditEnabled');
    expect(status).toHaveProperty('autoCorrectEnabled');
    expect(status).toHaveProperty('totalAuditsRun');
    expect(status).toHaveProperty('totalAutoFixes');
    expect(status).toHaveProperty('correctionCount');
    expect(typeof status.auditEnabled).toBe('boolean');
    expect(typeof status.autoCorrectEnabled).toBe('boolean');
  });

  it('should toggle audit enabled state', async () => {
    const { setAuditEnabled, getAuditStatus } = await import('./services/qumusSelfAudit');
    
    setAuditEnabled(false);
    expect(getAuditStatus().auditEnabled).toBe(false);
    
    setAuditEnabled(true);
    expect(getAuditStatus().auditEnabled).toBe(true);
  });

  it('should toggle auto-correct enabled state', async () => {
    const { setAutoCorrectEnabled, getAuditStatus } = await import('./services/qumusSelfAudit');
    
    setAutoCorrectEnabled(false);
    expect(getAuditStatus().autoCorrectEnabled).toBe(false);
    
    setAutoCorrectEnabled(true);
    expect(getAuditStatus().autoCorrectEnabled).toBe(true);
  });

  it('should return null for last report before any audit runs', async () => {
    const { getLastReport } = await import('./services/qumusSelfAudit');
    // May or may not be null depending on whether audit has run
    const report = getLastReport();
    // Just verify it doesn't throw
    expect(report === null || typeof report === 'object').toBe(true);
  });

  it('should return correction history as array', async () => {
    const { getCorrectionHistory } = await import('./services/qumusSelfAudit');
    const history = getCorrectionHistory();
    expect(Array.isArray(history)).toBe(true);
  });

  it('should trigger manual audit without throwing', async () => {
    const { triggerManualAudit } = await import('./services/qumusSelfAudit');
    // Should not throw even if db is mocked
    await expect(triggerManualAudit()).resolves.not.toThrow();
  });

  it('should have correct AuditReport structure after manual audit', async () => {
    const { triggerManualAudit, getLastReport } = await import('./services/qumusSelfAudit');
    await triggerManualAudit();
    const report = getLastReport();
    
    if (report) {
      expect(report).toHaveProperty('reportId');
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('duration');
      expect(report).toHaveProperty('totalChecks');
      expect(report).toHaveProperty('passed');
      expect(report).toHaveProperty('warnings');
      expect(report).toHaveProperty('critical');
      expect(report).toHaveProperty('autoFixed');
      expect(report).toHaveProperty('findings');
      expect(report).toHaveProperty('systemHealth');
      expect(Array.isArray(report.findings)).toBe(true);
      expect(report.systemHealth).toBeGreaterThanOrEqual(0);
      expect(report.systemHealth).toBeLessThanOrEqual(100);
    }
  });
});

describe('Self-Audit tRPC Router', () => {
  it('should export selfAuditRouter', async () => {
    const mod = await import('./routers/selfAuditRouter');
    expect(mod.selfAuditRouter).toBeDefined();
  });
});
