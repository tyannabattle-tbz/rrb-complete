import { describe, it, expect, beforeEach, vi } from "vitest";
import { customPoliciesRouter } from "./customPolicies";
import * as redis from "../_core/redis";

// Mock Redis functions
vi.mock("../_core/redis", () => ({
  storeDecision: vi.fn(),
  getAuditLogs: vi.fn(),
  storeAuditLog: vi.fn(),
}));

describe("customPoliciesRouter", () => {
  const mockCtx = {
    user: {
      id: 1,
      email: "test@example.com",
      name: "Test User",
      role: "admin" as const,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("moderateContent", () => {
    it("should flag content with restricted keywords", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.moderateContent({
        contentId: "content-123",
        contentType: "text",
        content: "This is spam content with abuse",
        userId: 1,
      });

      expect(result.isFlagged).toBe(true);
      expect(result.requiresReview).toBe(true);
      expect(result.decisionId).toBeDefined();
      expect(redis.storeDecision).toHaveBeenCalled();
    });

    it("should pass clean content", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.moderateContent({
        contentId: "content-456",
        contentType: "text",
        content: "This is clean and appropriate content",
        userId: 1,
      });

      expect(result.isFlagged).toBe(false);
      expect(result.requiresReview).toBe(false);
    });
  });

  describe("submitForApproval", () => {
    it("should require 3 approvals for critical priority", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.submitForApproval({
        requestId: "req-123",
        requestType: "budget",
        amount: 5000,
        description: "Budget request",
        priority: "critical",
      });

      expect(result.status).toBe("pending_approval");
      expect(result.requiredApprovals).toBe(3);
      expect(result.decisionId).toBeDefined();
    });

    it("should require 2 approvals for high priority with large amount", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.submitForApproval({
        requestId: "req-456",
        requestType: "deployment",
        amount: 15000,
        description: "Deployment request",
        priority: "high",
      });

      expect(result.requiredApprovals).toBe(3); // 2 for high + 1 for amount > 10000
    });

    it("should require 1 approval for low priority", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.submitForApproval({
        requestId: "req-789",
        requestType: "resource",
        amount: 1000,
        description: "Resource request",
        priority: "low",
      });

      expect(result.requiredApprovals).toBe(1);
    });
  });

  describe("allocateResource", () => {
    it("should allocate full amount when available", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.allocateResource({
        resourceType: "compute",
        requestedAmount: 100,
        priority: "medium",
        duration: 3600,
      });

      expect(result.allocatedAmount).toBe(100);
      expect(result.status).toBe("approved");
      expect(result.expiresAt).toBeDefined();
    });

    it("should allocate partial amount when insufficient resources", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.allocateResource({
        resourceType: "compute",
        requestedAmount: 2000,
        priority: "medium",
        duration: 3600,
      });

      expect(result.allocatedAmount).toBeLessThan(2000);
      expect(result.status).toBe("partial_approval");
    });

    it("should allocate more for high priority requests", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.allocateResource({
        resourceType: "storage",
        requestedAmount: 2000,
        priority: "high",
        duration: 3600,
      });

      expect(result.allocatedAmount).toBeGreaterThan(500);
    });
  });

  describe("checkRateLimit", () => {
    it("should return correct limit for free tier", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.checkRateLimit({
        endpoint: "/api/users",
        userId: 1,
        userTier: "free",
      });

      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(100);
      expect(result.resetAt).toBeDefined();
    });

    it("should return correct limit for pro tier", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.checkRateLimit({
        endpoint: "/api/users",
        userId: 1,
        userTier: "pro",
      });

      expect(result.limit).toBe(1000);
    });

    it("should return correct limit for enterprise tier", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.checkRateLimit({
        endpoint: "/api/users",
        userId: 1,
        userTier: "enterprise",
      });

      expect(result.limit).toBe(10000);
    });
  });

  describe("validateDeployment", () => {
    it("should approve production deployment with valid changelog", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.validateDeployment({
        deploymentId: "deploy-123",
        environment: "production",
        version: "1.0.0",
        changeLog: "This is a detailed changelog with more than 50 characters describing changes",
        requiredTests: ["unit", "integration"],
      });

      expect(result.approved).toBe(true);
      expect(result.validationErrors).toHaveLength(0);
    });

    it("should reject production deployment without changelog", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.validateDeployment({
        deploymentId: "deploy-456",
        environment: "production",
        version: "1.0.1",
        changeLog: "Short",
        requiredTests: ["unit"],
      });

      expect(result.approved).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
    });

    it("should approve staging deployment with minimal requirements", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.validateDeployment({
        deploymentId: "deploy-789",
        environment: "staging",
        version: "1.0.2",
        changeLog: "Test",
        requiredTests: [],
      });

      expect(result.approved).toBe(true);
    });
  });

  describe("getActivePolicies", () => {
    it("should return all active policies", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.getActivePolicies();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("description");
      expect(result[0]).toHaveProperty("enabled");
      expect(result[0]).toHaveProperty("priority");
    });

    it("should have content moderation policy", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.getActivePolicies();
      const contentModerationPolicy = result.find(
        (p) => p.name === "content-moderation-policy"
      );

      expect(contentModerationPolicy).toBeDefined();
      expect(contentModerationPolicy?.enabled).toBe(true);
    });
  });

  describe("createCustomPolicy", () => {
    it("should create custom policy with rules", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.createCustomPolicy({
        name: "custom-workflow-policy",
        description: "Custom workflow for specific use case",
        rules: [
          {
            condition: "user_role === 'admin'",
            action: "auto_approve",
            priority: 1,
          },
          {
            condition: "amount > 10000",
            action: "require_approval",
            priority: 2,
          },
        ],
        enabled: true,
      });

      expect(result.created).toBe(true);
      expect(result.name).toBe("custom-workflow-policy");
      expect(result.policyId).toBeDefined();
      expect(result.decisionId).toBeDefined();
      expect(redis.storeDecision).toHaveBeenCalled();
    });
  });

  describe("QUMUS Decision Tracking", () => {
    it("should store decision with unique ID", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      const result = await caller.moderateContent({
        contentId: "content-test",
        contentType: "text",
        content: "test content",
        userId: 1,
      });

      expect(result.decisionId).toMatch(/^decision-/);
      expect(redis.storeDecision).toHaveBeenCalledWith(
        expect.objectContaining({
          decisionId: result.decisionId,
          userId: mockCtx.user.id,
          policy: expect.any(String),
          action: expect.any(String),
          timestamp: expect.any(String),
          success: true,
        })
      );
    });

    it("should include policy name in decision", async () => {
      const caller = customPoliciesRouter.createCaller(mockCtx);

      await caller.submitForApproval({
        requestId: "req-qumus",
        requestType: "budget",
        amount: 5000,
        description: "Test",
        priority: "medium",
      });

      expect(redis.storeDecision).toHaveBeenCalledWith(
        expect.objectContaining({
          policy: "approval-workflow-policy",
        })
      );
    });
  });
});
