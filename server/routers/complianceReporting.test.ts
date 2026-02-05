import { describe, it, expect, vi, beforeEach } from "vitest";
import { complianceReportingRouter } from "./complianceReporting";
import * as redis from "../_core/redis";

// Mock Redis functions
vi.mock("../_core/redis", () => ({
  getAuditLogs: vi.fn(),
  storeDecision: vi.fn(),
}));

describe("complianceReportingRouter", () => {
  const mockCtx = {
    user: { id: 1, role: "admin" as const },
    req: { headers: {} },
  };

  const mockAuditLogs = [
    {
      decisionId: "decision-1",
      policy: "content-moderation-policy",
      action: "moderate_content",
      userId: 1,
      timestamp: new Date(Date.now() - 1000000).toISOString(),
      success: true,
      reason: "Content passed moderation",
    },
    {
      decisionId: "decision-2",
      policy: "approval-workflow-policy",
      action: "submit_for_approval",
      userId: 1,
      timestamp: new Date(Date.now() - 500000).toISOString(),
      success: false,
      reason: "Insufficient approvals",
    },
    {
      decisionId: "decision-3",
      policy: "content-moderation-policy",
      action: "moderate_content",
      userId: 2,
      timestamp: new Date(Date.now() - 100000).toISOString(),
      success: true,
      reason: "Content passed moderation",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateComplianceReport", () => {
    it("should generate compliance report for date range", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const startDate = new Date(Date.now() - 2000000).toISOString();
      const endDate = new Date().toISOString();

      const result = await caller.generateComplianceReport({
        startDate,
        endDate,
        includeViolations: true,
        format: "json",
      });

      expect(result).toBeDefined();
      expect(result.reportId).toBeDefined();
      expect(result.format).toBe("json");
      expect(result.summary).toBeDefined();
      expect(result.summary.totalDecisions).toBe(3);
      expect(result.summary.violations).toBe(1);
      expect(result.summary.complianceRate).toBe(66.67);
    });

    it("should generate CSV formatted report", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const startDate = new Date(Date.now() - 2000000).toISOString();
      const endDate = new Date().toISOString();

      const result = await caller.generateComplianceReport({
        startDate,
        endDate,
        includeViolations: true,
        format: "csv",
      });

      expect(result.format).toBe("csv");
      expect(result.report).toContain("Report ID");
      expect(result.report).toContain("content-moderation-policy");
    });

    it("should generate HTML formatted report", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const startDate = new Date(Date.now() - 2000000).toISOString();
      const endDate = new Date().toISOString();

      const result = await caller.generateComplianceReport({
        startDate,
        endDate,
        includeViolations: true,
        format: "html",
      });

      expect(result.format).toBe("html");
      expect(result.report).toContain("<html>");
      expect(result.report).toContain("Compliance Report");
    });

    it("should store decision with QUMUS tracking", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const startDate = new Date(Date.now() - 2000000).toISOString();
      const endDate = new Date().toISOString();

      await caller.generateComplianceReport({
        startDate,
        endDate,
        includeViolations: true,
        format: "json",
      });

      expect(redis.storeDecision).toHaveBeenCalled();
      const decision = vi.mocked(redis.storeDecision).mock.calls[0][0];
      expect(decision.policy).toBe("compliance-reporting-policy");
      expect(decision.action).toBe("generate_compliance_report");
      expect(decision.success).toBe(true);
    });
  });

  describe("generateViolationReport", () => {
    it("should generate violation report", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.generateViolationReport({
        severity: "all",
        limit: 100,
      });

      expect(result).toBeDefined();
      expect(result.totalViolations).toBe(1);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0].policy).toBe("approval-workflow-policy");
      expect(result.violations[0].reason).toBe("Insufficient approvals");
    });

    it("should filter violations by policy", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.generateViolationReport({
        policyName: "approval-workflow-policy",
        severity: "all",
        limit: 100,
      });

      expect(result.totalViolations).toBe(1);
      expect(result.violations[0].policy).toBe("approval-workflow-policy");
    });

    it("should respect limit parameter", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.generateViolationReport({
        severity: "all",
        limit: 1,
      });

      expect(result.violations.length).toBeLessThanOrEqual(1);
    });
  });

  describe("exportAuditTrail", () => {
    it("should export audit trail in CSV format", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.exportAuditTrail({
        format: "csv",
        limit: 1000,
      });

      expect(result.format).toBe("csv");
      expect(result.recordCount).toBe(3);
      expect(result.data).toContain("Decision ID");
      expect(result.data).toContain("decision-1");
    });

    it("should export audit trail in JSON format", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.exportAuditTrail({
        format: "json",
        limit: 1000,
      });

      expect(result.format).toBe("json");
      const data = JSON.parse(result.data);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(3);
    });

    it("should filter export by policy", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.exportAuditTrail({
        format: "csv",
        limit: 1000,
        policyFilter: "content-moderation-policy",
      });

      expect(result.data).toContain("content-moderation-policy");
    });

    it("should store decision with export metadata", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      await caller.exportAuditTrail({
        format: "csv",
        limit: 1000,
      });

      expect(redis.storeDecision).toHaveBeenCalled();
      const decision = vi.mocked(redis.storeDecision).mock.calls[0][0];
      expect(decision.action).toBe("export_audit_trail");
      expect(decision.state.format).toBe("csv");
    });
  });

  describe("getComplianceMetrics", () => {
    it("should calculate compliance metrics", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.getComplianceMetrics({
        days: 30,
      });

      expect(result).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.totalDecisions).toBe(3);
      expect(result.summary.successfulDecisions).toBe(2);
      expect(result.summary.failedDecisions).toBe(1);
      expect(result.summary.complianceRate).toBe(66.67);
    });

    it("should calculate metrics per policy", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.getComplianceMetrics({
        days: 30,
      });

      expect(result.policies).toBeDefined();
      expect(result.policies.length).toBeGreaterThan(0);

      const contentPolicy = result.policies.find(
        (p: any) => p.name === "content-moderation-policy"
      );
      expect(contentPolicy).toBeDefined();
      expect(contentPolicy.total).toBe(2);
      expect(contentPolicy.successful).toBe(2);
      expect(contentPolicy.failed).toBe(0);
    });

    it("should calculate trend", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const result = await caller.getComplianceMetrics({
        days: 30,
      });

      expect(result.trend).toBeDefined();
      expect(["improving", "declining", "stable", "insufficient_data"]).toContain(
        result.trend
      );
    });
  });

  describe("QUMUS Decision Tracking", () => {
    it("should include decision ID in all responses", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const startDate = new Date(Date.now() - 2000000).toISOString();
      const endDate = new Date().toISOString();

      const result = await caller.generateComplianceReport({
        startDate,
        endDate,
        includeViolations: true,
        format: "json",
      });

      expect(result.decisionId).toBeDefined();
      expect(result.decisionId).toMatch(/^decision-/);
    });

    it("should track compliance report generation", async () => {
      vi.mocked(redis.getAuditLogs).mockResolvedValue(mockAuditLogs);
      vi.mocked(redis.storeDecision).mockResolvedValue(undefined);

      const caller = complianceReportingRouter.createCaller(mockCtx);

      const startDate = new Date(Date.now() - 2000000).toISOString();
      const endDate = new Date().toISOString();

      await caller.generateComplianceReport({
        startDate,
        endDate,
        includeViolations: true,
        format: "json",
      });

      const decision = vi.mocked(redis.storeDecision).mock.calls[0][0];
      expect(decision.policy).toBe("compliance-reporting-policy");
      expect(decision.userId).toBe(mockCtx.user.id);
      expect(decision.timestamp).toBeDefined();
    });
  });
});
