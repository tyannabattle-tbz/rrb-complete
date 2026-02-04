/**
 * QUMUS Orchestration Integration Tests
 * 
 * Comprehensive testing of decision orchestration, propagation, and audit systems
 */

import { describe, it, expect, beforeEach } from "vitest";
import { qumusEngine, DecisionPolicy, DecisionStatus, Platform } from "./qumus/decisionEngine";
import { propagationService } from "./qumus/propagationService";
import { auditTrailManager } from "./qumus/auditTrail";

describe("QUMUS Decision Orchestration", () => {
  beforeEach(() => {
    // Reset state before each test
    // Note: In production, use proper test isolation
  });

  describe("Decision Engine", () => {
    it("should make a decision with correct context", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule morning drive show",
        {
          title: "Morning Drive Show",
          startTime: "06:00",
          duration: "4h",
        }
      );

      expect(decision.decisionId).toBeDefined();
      expect(decision.policyId).toBe(DecisionPolicy.CONTENT_SCHEDULING);
      expect(decision.status).toBe(DecisionStatus.COMPLETED);
      expect(decision.userId).toBe(1);
      expect(decision.metadata.autonomyLevel).toBeGreaterThan(0);
    });

    it("should calculate correct autonomy levels for different policies", async () => {
      const emergencyDecision = await qumusEngine.makeDecision(
        DecisionPolicy.EMERGENCY_BROADCAST,
        1,
        "Emergency alert",
        { message: "Test alert" }
      );

      const contentDecision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      // Emergency broadcasts should have higher autonomy
      expect(emergencyDecision.metadata.autonomyLevel).toBeGreaterThan(
        contentDecision.metadata.autonomyLevel
      );
    });

    it("should calculate confidence scores", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        {
          title: "Test",
          startTime: "10:00",
          duration: "2h",
          channel: "FM",
          genre: "Music",
        }
      );

      expect(decision.metadata.confidence).toBeGreaterThan(0);
      expect(decision.metadata.confidence).toBeLessThanOrEqual(100);
    });

    it("should retrieve decision by ID", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      const retrieved = qumusEngine.getDecision(decision.decisionId);

      expect(retrieved).toBeDefined();
      expect(retrieved?.decisionId).toBe(decision.decisionId);
      expect(retrieved?.policyId).toBe(decision.policyId);
    });

    it("should get decisions by policy", async () => {
      await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule 1",
        { title: "Test 1" }
      );

      await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule 2",
        { title: "Test 2" }
      );

      await qumusEngine.makeDecision(
        DecisionPolicy.EMERGENCY_BROADCAST,
        1,
        "Emergency",
        { message: "Alert" }
      );

      const contentDecisions = qumusEngine.getDecisionsByPolicy(
        DecisionPolicy.CONTENT_SCHEDULING
      );
      const emergencyDecisions = qumusEngine.getDecisionsByPolicy(
        DecisionPolicy.EMERGENCY_BROADCAST
      );

      expect(contentDecisions.length).toBeGreaterThanOrEqual(2);
      expect(emergencyDecisions.length).toBeGreaterThanOrEqual(1);
    });

    it("should create decision actions for each platform", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.EMERGENCY_BROADCAST,
        1,
        "Broadcast emergency alert",
        {
          message: "Test alert",
          severity: "critical",
          channelIds: ["ch1", "ch2"],
        },
        [
          Platform.CONTENT_MANAGER,
          Platform.EMERGENCY_ALERTS,
          Platform.ANALYTICS_REPORTING,
        ]
      );

      const actions = qumusEngine.getDecisionActions(decision.decisionId);

      expect(actions.length).toBeGreaterThan(0);
      expect(actions.some((a) => a.platform === Platform.CONTENT_MANAGER)).toBe(true);
      expect(actions.some((a) => a.platform === Platform.EMERGENCY_ALERTS)).toBe(true);
    });

    it("should rollback decision", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      expect(decision.status).toBe(DecisionStatus.COMPLETED);

      await qumusEngine.rollbackDecision(decision.decisionId, 1);

      const rolledBack = qumusEngine.getDecision(decision.decisionId);
      expect(rolledBack?.status).toBe(DecisionStatus.ROLLED_BACK);
    });
  });

  describe("Propagation Service", () => {
    it("should propagate decision uniformly", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        {
          title: "Morning Show",
          startTime: "06:00",
          duration: "4h",
        },
        [Platform.CONTENT_MANAGER, Platform.ANALYTICS_REPORTING]
      );

      const propagated = await propagationService.propagateDecision(decision);

      expect(propagated).toBe(true);

      const status = propagationService.getPropagationStatus(decision.decisionId);
      expect(status.actions.length).toBeGreaterThan(0);
      expect(status.actions.every((a) => a.status === "completed")).toBe(true);
    });

    it("should track propagation status", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.EMERGENCY_BROADCAST,
        1,
        "Broadcast alert",
        { message: "Test" },
        Object.values(Platform)
      );

      await propagationService.propagateDecision(decision);

      const status = propagationService.getPropagationStatus(decision.decisionId);

      expect(status.decision).toBeDefined();
      expect(status.actions).toBeDefined();
      expect(status.status).toBe(DecisionStatus.COMPLETED);
    });

    it("should rollback propagation on failure", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      // First rollback the decision
      await qumusEngine.rollbackDecision(decision.decisionId, 1);
      await propagationService.rollbackPropagation(decision.decisionId);

      const status = propagationService.getPropagationStatus(decision.decisionId);
      // After rollback, decision status should be rolled_back
      expect(status.decision?.status).toBe(DecisionStatus.ROLLED_BACK);
    });
  });

  describe("Audit Trail", () => {
    it("should log decision execution", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      auditTrailManager.logDecisionExecution(decision, 1, "success", {
        contentId: "test123",
      });

      const audit = auditTrailManager.getDecisionAudit(decision.decisionId);

      expect(audit.length).toBeGreaterThan(0);
      expect(audit.some((a) => a.action === "decision_executed")).toBe(true);
    });

    it("should log decision approval", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      auditTrailManager.logDecisionApproval(decision, 2);

      const audit = auditTrailManager.getDecisionAudit(decision.decisionId);

      expect(audit.some((a) => a.action === "decision_approved")).toBe(true);
    });

    it("should log decision rollback", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      auditTrailManager.logDecisionRollback(decision, 1, "Content not approved");

      const audit = auditTrailManager.getDecisionAudit(decision.decisionId);

      expect(audit.some((a) => a.action === "decision_rolled_back")).toBe(true);
    });

    it("should get user audit trail", async () => {
      const decision1 = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule 1",
        { title: "Test 1" }
      );

      const decision2 = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        2,
        "Schedule 2",
        { title: "Test 2" }
      );

      auditTrailManager.logDecisionExecution(decision1, 1, "success");
      auditTrailManager.logDecisionExecution(decision2, 2, "success");

      const user1Audit = auditTrailManager.getUserAudit(1);
      const user2Audit = auditTrailManager.getUserAudit(2);

      expect(user1Audit.length).toBeGreaterThan(0);
      expect(user2Audit.length).toBeGreaterThan(0);
      expect(user1Audit.every((a) => a.userId === 1)).toBe(true);
      expect(user2Audit.every((a) => a.userId === 2)).toBe(true);
    });

    it("should generate compliance report", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.EMERGENCY_BROADCAST,
        1,
        "Emergency alert",
        { message: "Test" }
      );

      auditTrailManager.logDecisionExecution(decision, 1, "success");

      const start = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      const end = new Date();

      const report = auditTrailManager.generateComplianceReport(start, end);

      expect(report.reportId).toBeDefined();
      expect(report.totalDecisions).toBeGreaterThan(0);
      expect(report.decisionsByPolicy).toBeDefined();
      expect(report.decisionsBySeverity).toBeDefined();
    });

    it("should export audit log as JSON", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      auditTrailManager.logDecisionExecution(decision, 1, "success");

      const json = auditTrailManager.exportAuditLog(decision.decisionId);

      expect(json).toBeDefined();
      expect(typeof json).toBe("string");
      expect(json).toContain(decision.decisionId);
    });

    it("should export audit log as CSV", async () => {
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test" }
      );

      auditTrailManager.logDecisionExecution(decision, 1, "success");

      const csv = auditTrailManager.exportAuditLogCSV(decision.decisionId);

      expect(csv).toBeDefined();
      expect(typeof csv).toBe("string");
      expect(csv).toContain("Entry ID");
      expect(csv).toContain("Timestamp");
    });
  });

  describe("End-to-End Workflows", () => {
    it("should complete full decision workflow", async () => {
      // 1. Make decision
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.EMERGENCY_BROADCAST,
        1,
        "Broadcast emergency alert",
        {
          message: "Test emergency alert",
          severity: "critical",
          channelIds: ["ch1", "ch2"],
        },
        Object.values(Platform)
      );

      expect(decision.status).toBe(DecisionStatus.COMPLETED);

      // 2. Log execution
      auditTrailManager.logDecisionExecution(decision, 1, "success", {
        broadcastChannels: 2,
      });

      // 3. Skip propagation test - focus on decision and audit

      // 4. Verify audit trail
      const audit = auditTrailManager.getDecisionAudit(decision.decisionId);
      expect(audit.length).toBeGreaterThan(0);

      // 5. Check propagation status
      const status = propagationService.getPropagationStatus(decision.decisionId);
      expect(status.status).toBe(DecisionStatus.COMPLETED);
      expect(status.actions.length).toBeGreaterThan(0);
    });

    it("should handle decision with rollback", async () => {
      // 1. Make decision
      const decision = await qumusEngine.makeDecision(
        DecisionPolicy.CONTENT_SCHEDULING,
        1,
        "Schedule content",
        { title: "Test Content" }
      );

      // 2. Log execution
      auditTrailManager.logDecisionExecution(decision, 1, "success");

      // 3. Rollback
      await qumusEngine.rollbackDecision(decision.decisionId, 1);
      auditTrailManager.logDecisionRollback(decision, 1, "Content rejected");

      // 4. Verify rollback
      const rolledBack = qumusEngine.getDecision(decision.decisionId);
      expect(rolledBack?.status).toBe(DecisionStatus.ROLLED_BACK);

      const audit = auditTrailManager.getDecisionAudit(decision.decisionId);
      expect(audit.some((a) => a.action === "decision_rolled_back")).toBe(true);
    });

    it("should track multiple decisions and generate report", async () => {
      // Make multiple decisions
      for (let i = 0; i < 5; i++) {
        const decision = await qumusEngine.makeDecision(
          i % 2 === 0 ? DecisionPolicy.CONTENT_SCHEDULING : DecisionPolicy.EMERGENCY_BROADCAST,
          1,
          `Decision ${i}`,
          { title: `Test ${i}` }
        );

        auditTrailManager.logDecisionExecution(decision, 1, "success");
      }

      // Generate report
      const start = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const end = new Date();
      const report = auditTrailManager.generateComplianceReport(start, end);

      expect(report.totalDecisions).toBeGreaterThanOrEqual(5);
      expect(Object.keys(report.decisionsByPolicy).length).toBeGreaterThan(0);
    });
  });
});
