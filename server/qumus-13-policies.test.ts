import { describe, expect, it } from "vitest";
import { qumusEngine } from "./qumus-orchestration";

describe("QUMUS Orchestration Engine — 13 Policies", () => {
  describe("Policy Registry", () => {
    it("has exactly 13 policies registered", () => {
      const policies = qumusEngine.getPolicies();
      expect(policies.length).toBe(13);
    });

    it("includes all 8 core policies", () => {
      const policies = qumusEngine.getPolicies();
      const coreIds = [
        "policy_recommendation_engine",
        "policy_content_distribution",
        "policy_performance_alert",
        "policy_batch_processing",
        "policy_payment_processing",
        "policy_user_registration",
        "policy_analytics_aggregation",
        "policy_compliance_reporting",
      ];
      coreIds.forEach((id) => {
        const found = policies.find((p) => p.id === id);
        expect(found, `Missing core policy: ${id}`).toBeDefined();
      });
    });

    it("includes all 5 ecosystem policies", () => {
      const policies = qumusEngine.getPolicies();
      const ecosystemIds = [
        "policy_content_scheduling",
        "policy_broadcast_management",
        "policy_emergency_response",
        "policy_community_engagement",
        "policy_code_maintenance",
      ];
      ecosystemIds.forEach((id) => {
        const found = policies.find((p) => p.id === id);
        expect(found, `Missing ecosystem policy: ${id}`).toBeDefined();
      });
    });

    it("can retrieve individual policies by id", () => {
      const policy = qumusEngine.getPolicy("policy_content_scheduling");
      expect(policy).toBeDefined();
      expect(policy?.name).toBe("Content Scheduling");
      expect(policy?.autonomyLevel).toBe(90);
    });

    it("returns undefined for non-existent policy", () => {
      const policy = qumusEngine.getPolicy("policy_nonexistent");
      expect(policy).toBeUndefined();
    });
  });

  describe("Policy Autonomy Levels", () => {
    it("all policies have autonomy level between 70 and 100", () => {
      const policies = qumusEngine.getPolicies();
      policies.forEach((p) => {
        expect(p.autonomyLevel).toBeGreaterThanOrEqual(70);
        expect(p.autonomyLevel).toBeLessThanOrEqual(100);
      });
    });

    it("emergency response has lowest autonomy (requires human oversight)", () => {
      const emergency = qumusEngine.getPolicy("policy_emergency_response");
      const policies = qumusEngine.getPolicies();
      const minAutonomy = Math.min(...policies.map((p) => p.autonomyLevel));
      expect(emergency?.autonomyLevel).toBe(minAutonomy);
    });

    it("average autonomy is above 85% (90% QUMUS control target)", () => {
      const policies = qumusEngine.getPolicies();
      const avg =
        policies.reduce((sum, p) => sum + p.autonomyLevel, 0) /
        policies.length;
      expect(avg).toBeGreaterThan(85);
    });
  });

  describe("Decision Execution", () => {
    it("can make a decision and get a result", async () => {
      const result = await qumusEngine.makeDecision({
        policyId: "policy_content_scheduling",
        action: "schedule_rotation",
        inputData: { channel: "RRB-Main" },
        confidence: 92,
      });
      expect(result).toBeDefined();
      expect(result.policyId).toBe("policy_content_scheduling");
      expect(result.status).toBeDefined();
    });

    it("records decisions in history", async () => {
      await qumusEngine.makeDecision({
        policyId: "policy_broadcast_management",
        action: "monitor_streams",
        inputData: { channels: 7 },
        confidence: 90,
      });
      const history = qumusEngine.getDecisionHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it("rejects decisions for non-existent policies", async () => {
      await expect(
        qumusEngine.makeDecision({
          policyId: "policy_fake",
          action: "test",
          inputData: {},
          confidence: 50,
        })
      ).rejects.toThrow();
    });
  });

  describe("Ecosystem Policy Details", () => {
    it("content scheduling has broadcast-related triggers", () => {
      const policy = qumusEngine.getPolicy("policy_content_scheduling");
      expect(policy?.triggers).toContain("schedule_update");
      expect(policy?.triggers).toContain("airtime_rotation");
    });

    it("broadcast management monitors stream health", () => {
      const policy = qumusEngine.getPolicy("policy_broadcast_management");
      expect(policy?.triggers).toContain("stream_health_check");
      expect(policy?.triggers).toContain("channel_offline");
    });

    it("emergency response handles HybridCast activation", () => {
      const policy = qumusEngine.getPolicy("policy_emergency_response");
      expect(policy?.triggers).toContain("hybridcast_activation");
      expect(policy?.triggers).toContain("disaster_detected");
    });

    it("community engagement manages Sweet Miracles outreach", () => {
      const policy = qumusEngine.getPolicy("policy_community_engagement");
      expect(policy?.description).toContain("Sweet Miracles");
    });

    it("code maintenance monitors dependencies", () => {
      const policy = qumusEngine.getPolicy("policy_code_maintenance");
      expect(policy?.triggers).toContain("broken_link_detected");
      expect(policy?.triggers).toContain("dependency_vulnerability");
    });
  });

  describe("Metrics", () => {
    it("returns metrics object", () => {
      const metrics = qumusEngine.getMetrics();
      expect(metrics).toBeDefined();
    });
  });
});
