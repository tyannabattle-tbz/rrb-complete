import { describe, it, expect } from "vitest";
import { CORE_POLICIES, QumusCompleteEngine } from "./qumus-complete-engine";

describe("QUMUS Autonomous Event Loop & Policies", () => {
  describe("CORE_POLICIES", () => {
    it("should define exactly 8 core policies", () => {
      const policyKeys = Object.keys(CORE_POLICIES);
      expect(policyKeys).toHaveLength(8);
    });

    it("should include all required policy types", () => {
      const policyTypes = Object.values(CORE_POLICIES).map(p => p.type);
      expect(policyTypes).toContain("recommendation_engine");
      expect(policyTypes).toContain("payment_processing");
      expect(policyTypes).toContain("content_moderation");
      expect(policyTypes).toContain("user_registration");
      expect(policyTypes).toContain("subscription_management");
      expect(policyTypes).toContain("performance_alert");
      expect(policyTypes).toContain("analytics_aggregation");
      expect(policyTypes).toContain("compliance_reporting");
    });

    it("should have autonomy levels between 85% and 98% (tuned for 90% target)", () => {
      for (const [_key, policy] of Object.entries(CORE_POLICIES)) {
        expect(policy.autonomyLevel).toBeGreaterThanOrEqual(85);
        expect(policy.autonomyLevel).toBeLessThanOrEqual(98);
      }
    });

    it("should have unique policy IDs", () => {
      const ids = Object.values(CORE_POLICIES).map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("each policy should have id, name, type, autonomyLevel, and description", () => {
      for (const [_key, policy] of Object.entries(CORE_POLICIES)) {
        expect(policy.id).toBeTruthy();
        expect(policy.name).toBeTruthy();
        expect(policy.type).toBeTruthy();
        expect(typeof policy.autonomyLevel).toBe("number");
        expect(policy.description).toBeTruthy();
      }
    });
  });

  describe("QumusCompleteEngine.calculateConfidence", () => {
    it("should return base score of 70 for empty input (mature engine)", () => {
      const score = QumusCompleteEngine.calculateConfidence({
        policyId: "RECOMMENDATION_ENGINE",
        input: {},
      });
      expect(score).toBe(70);
    });

    it("should increase confidence with more input keys", () => {
      const score1 = QumusCompleteEngine.calculateConfidence({
        policyId: "RECOMMENDATION_ENGINE",
        input: { key1: "val" },
      });
      const score2 = QumusCompleteEngine.calculateConfidence({
        policyId: "RECOMMENDATION_ENGINE",
        input: { key1: "val", key2: "val", key3: "val", key4: "val" },
      });
      expect(score2).toBeGreaterThan(score1);
    });

    it("should increase confidence when userId is provided", () => {
      const scoreWithout = QumusCompleteEngine.calculateConfidence({
        policyId: "RECOMMENDATION_ENGINE",
        input: { key1: "val" },
      });
      const scoreWith = QumusCompleteEngine.calculateConfidence({
        policyId: "RECOMMENDATION_ENGINE",
        userId: 1,
        input: { key1: "val" },
      });
      expect(scoreWith).toBeGreaterThan(scoreWithout);
    });

    it("should cap confidence at 100", () => {
      const score = QumusCompleteEngine.calculateConfidence({
        policyId: "RECOMMENDATION_ENGINE",
        userId: 1,
        input: { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, timestamp: Date.now() },
      });
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe("QumusCompleteEngine.makeDecision", () => {
    it("should approve high-confidence decisions for high-autonomy policies", async () => {
      const result = await QumusCompleteEngine.makeDecision({
        policyId: "policy_recommendation_engine",
        userId: 1,
        input: { genre: "soul", userId: 1, timestamp: Date.now(), a: 1, b: 2, c: 3 },
        confidence: 95,
      });
      expect(result.result).toBe("approved");
      expect(result.autonomousFlag).toBe(true);
      expect(result.decisionId).toMatch(/^decision_/);
      expect(result.confidence).toBe(95);
    });

    it("should escalate low-confidence decisions", async () => {
      const result = await QumusCompleteEngine.makeDecision({
        policyId: "policy_payment_processing",
        input: { amount: 5000 },
        confidence: 30,
      });
      expect(result.result).toBe("escalated");
      expect(result.autonomousFlag).toBe(false);
      expect(result.message).toContain("escalated");
    });

    it("should approve high-confidence decisions for content moderation (now 85% autonomy)", async () => {
      // Content Moderation has autonomyLevel 85 (>= 80 threshold) after tuning
      const result = await QumusCompleteEngine.makeDecision({
        policyId: "policy_content_moderation",
        input: { content: "test", userId: 1, a: 1, b: 2, c: 3, d: 4 },
        confidence: 90,
      });
      expect(result.result).toBe("approved");
      expect(result.autonomousFlag).toBe(true);
    });

    it("should throw error for unknown policy", async () => {
      await expect(
        QumusCompleteEngine.makeDecision({
          policyId: "nonexistent_policy",
          input: {},
        })
      ).rejects.toThrow("Policy not found");
    });

    it("should look up policies by both key name and ID", async () => {
      // By key name
      const result1 = await QumusCompleteEngine.makeDecision({
        policyId: "RECOMMENDATION_ENGINE",
        input: { test: true },
        confidence: 95,
      });
      expect(result1.decisionId).toBeTruthy();

      // By policy ID
      const result2 = await QumusCompleteEngine.makeDecision({
        policyId: "policy_recommendation_engine",
        input: { test: true },
        confidence: 95,
      });
      expect(result2.decisionId).toBeTruthy();
    });
  });

  describe("QumusCompleteEngine.getSystemHealth", () => {
    it("should return system health with all required fields", async () => {
      const health = await QumusCompleteEngine.getSystemHealth();
      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("uptime");
      expect(health).toHaveProperty("activePolicies");
      expect(health.activePolicies).toBe(8);
      expect(["healthy", "degraded", "critical"]).toContain(health.status);
    });
  });

  describe("QumusCompleteEngine.getAllMetrics", () => {
    it("should return metrics for all 8 policies", async () => {
      const metrics = await QumusCompleteEngine.getAllMetrics();
      expect(metrics.length).toBe(8);
      for (const metric of metrics) {
        expect(metric).toHaveProperty("policyId");
        expect(metric).toHaveProperty("name");
        expect(metric).toHaveProperty("totalDecisions");
        expect(metric).toHaveProperty("autonomyPercentage");
        expect(typeof metric.autonomyPercentage).toBe("number");
      }
    });
  });

  describe("QumusCompleteEngine.getPolicyRecommendations", () => {
    it("should return an array of recommendations", async () => {
      const recs = await QumusCompleteEngine.getPolicyRecommendations();
      expect(Array.isArray(recs)).toBe(true);
      for (const rec of recs) {
        expect(rec).toHaveProperty("policyId");
        expect(rec).toHaveProperty("type");
        expect(rec).toHaveProperty("recommendation");
      }
    });
  });

  describe("QumusCompleteEngine.getAuditTrail", () => {
    it("should return an array of audit entries", async () => {
      const trail = await QumusCompleteEngine.getAuditTrail();
      expect(Array.isArray(trail)).toBe(true);
    });
  });
});
