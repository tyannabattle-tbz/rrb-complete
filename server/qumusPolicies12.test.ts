import { describe, expect, it } from "vitest";
import {
  POLICY_REGISTRY,
  getPolicyStatus,
  executePolicies,
  requiresHumanReview,
  getAverageConfidence,
  contentSchedulingPolicy,
  broadcastManagementPolicy,
  emergencyResponsePolicy,
  communityEngagementPolicy,
  codeMaintenancePolicy,
} from "./qumusPolicies";

describe("QUMUS Policy Registry — 12 Policies", () => {
  it("has exactly 12 policies in POLICY_REGISTRY", () => {
    expect(POLICY_REGISTRY.length).toBe(12);
  });

  it("has 7 core policies and 5 ecosystem policies", () => {
    const core = POLICY_REGISTRY.filter((p) => p.category === "core");
    const ecosystem = POLICY_REGISTRY.filter((p) => p.category === "ecosystem");
    expect(core.length).toBe(7);
    expect(ecosystem.length).toBe(5);
  });

  it("all policies have required fields", () => {
    POLICY_REGISTRY.forEach((p) => {
      expect(p.id).toBeTruthy();
      expect(p.name).toBeTruthy();
      expect(p.category).toMatch(/^(core|ecosystem)$/);
      expect(p.description).toBeTruthy();
      expect(p.autonomyLevel).toBeGreaterThanOrEqual(70);
      expect(p.autonomyLevel).toBeLessThanOrEqual(100);
    });
  });

  it("all policy IDs are unique", () => {
    const ids = POLICY_REGISTRY.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getPolicyStatus()", () => {
  it("returns correct counts", () => {
    const status = getPolicyStatus();
    expect(status.totalPolicies).toBe(12);
    expect(status.coreCount).toBe(7);
    expect(status.ecosystemCount).toBe(5);
    expect(status.registry).toBe(POLICY_REGISTRY);
  });
});

describe("Ecosystem Policy Functions", () => {
  const ctx = { userId: 1, action: "test", data: {} };

  it("contentSchedulingPolicy returns valid decision", async () => {
    const d = await contentSchedulingPolicy(ctx);
    expect(d.policyName).toBe("Content Scheduling");
    expect(d.confidence).toBeGreaterThan(80);
  });

  it("broadcastManagementPolicy returns valid decision", async () => {
    const d = await broadcastManagementPolicy(ctx);
    expect(d.policyName).toBe("Broadcast Management");
    expect(d.confidence).toBeGreaterThan(80);
  });

  it("emergencyResponsePolicy requires human review", async () => {
    const d = await emergencyResponsePolicy(ctx);
    expect(d.policyName).toBe("Emergency Response");
    expect(d.requiresHumanReview).toBe(true);
  });

  it("communityEngagementPolicy returns valid decision", async () => {
    const d = await communityEngagementPolicy(ctx);
    expect(d.policyName).toBe("Community Engagement");
    expect(d.confidence).toBeGreaterThan(80);
  });

  it("codeMaintenancePolicy returns valid decision", async () => {
    const d = await codeMaintenancePolicy(ctx);
    expect(d.policyName).toBe("Code Maintenance");
    expect(d.confidence).toBeGreaterThan(80);
  });
});

describe("executePolicies()", () => {
  it("returns an array of decisions (may be empty without DB)", async () => {
    const decisions = await executePolicies({ userId: 1, action: "test", data: {} });
    expect(Array.isArray(decisions)).toBe(true);
  });
});

describe("Utility Functions", () => {
  it("requiresHumanReview detects review flags", () => {
    expect(requiresHumanReview([{ policyName: "test", action: "a", confidence: 90, requiresHumanReview: true, details: "" }])).toBe(true);
    expect(requiresHumanReview([{ policyName: "test", action: "a", confidence: 90, requiresHumanReview: false, details: "" }])).toBe(false);
  });

  it("getAverageConfidence calculates correctly", () => {
    const decisions = [
      { policyName: "a", action: "x", confidence: 80, requiresHumanReview: false, details: "" },
      { policyName: "b", action: "y", confidence: 100, requiresHumanReview: false, details: "" },
    ];
    expect(getAverageConfidence(decisions)).toBe(90);
  });

  it("getAverageConfidence returns 0 for empty array", () => {
    expect(getAverageConfidence([])).toBe(0);
  });
});
