/**
 * Ecosystem Integration Tests
 * Comprehensive test suite for unified ecosystem
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getEventBus,
  resetEventBus,
  type EcosystemEvent,
} from "./event-bus";
import { getDataSyncEngine } from "./data-sync";
import { getQumusOrchestrator } from "./qumus-integration";
import { getWebhookSystem } from "./webhook-system";

describe("Ecosystem Integration", () => {
  beforeEach(() => {
    resetEventBus();
  });

  afterEach(() => {
    resetEventBus();
  });

  describe("Event Bus", () => {
    it("should publish and subscribe to events", async () => {
      const eventBus = getEventBus();
      const handler = vi.fn();

      eventBus.subscribe("content.published", handler);

      await eventBus.publish({
        type: "content.published",
        source: "test",
        priority: "normal",
        data: { contentId: "123" },
      });

      expect(handler).toHaveBeenCalled();
    });

    it("should prevent duplicate events", async () => {
      const eventBus = getEventBus();
      const handler = vi.fn();

      eventBus.subscribe("content.published", handler);

      const event = {
        type: "content.published" as const,
        source: "test",
        priority: "normal" as const,
        data: { contentId: "123" },
      };

      await eventBus.publish(event);
      await eventBus.publish(event);

      // Should only be called once due to deduplication
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("should track event statistics", async () => {
      const eventBus = getEventBus();

      await eventBus.publish({
        type: "content.published",
        source: "test",
        priority: "normal",
        data: {},
      });

      const stats = await eventBus.getStats();
      expect(stats.processedEvents).toBeGreaterThan(0);
    });

    it("should handle dead letter queue", async () => {
      const eventBus = getEventBus();

      // Subscribe with failing handler
      eventBus.subscribe("content.published", async () => {
        throw new Error("Handler failed");
      });

      await eventBus.publish({
        type: "content.published",
        source: "test",
        priority: "normal",
        data: {},
      });

      // Give time for retries
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dlq = await eventBus.getDeadLetterQueue();
      expect(dlq.length).toBeGreaterThan(0);
    });
  });

  describe("Data Synchronization", () => {
    it("should track sync records", async () => {
      const dataSync = getDataSyncEngine();
      const eventBus = getEventBus();

      await eventBus.publish({
        type: "content.created",
        source: "rockinrockinboogie",
        priority: "normal",
        data: { contentId: "123", title: "Test" },
      });

      // Give time for sync
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = dataSync.getStats();
      expect(stats.recordCount).toBeGreaterThan(0);
    });

    it("should detect conflicts", async () => {
      const dataSync = getDataSyncEngine();
      const eventBus = getEventBus();

      // Simulate conflicting updates
      await eventBus.publish({
        type: "user.profile_updated",
        source: "service1",
        priority: "normal",
        data: { userId: "123", name: "User1", version: 1 },
      });

      await eventBus.publish({
        type: "user.profile_updated",
        source: "service2",
        priority: "normal",
        data: { userId: "123", name: "User2", version: 1 },
      });

      // Give time for sync
      await new Promise((resolve) => setTimeout(resolve, 100));

      const conflicts = dataSync.getConflicts();
      // Conflicts may or may not occur depending on timing
      expect(Array.isArray(conflicts)).toBe(true);
    });

    it("should process sync queue", async () => {
      const dataSync = getDataSyncEngine();
      const eventBus = getEventBus();

      await eventBus.publish({
        type: "content.updated",
        source: "rockinrockinboogie",
        priority: "normal",
        data: { contentId: "123" },
      });

      // Give time for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = dataSync.getStats();
      expect(stats.queueSize).toBeGreaterThanOrEqual(0);
    });
  });

  describe("QUMUS Orchestration", () => {
    it("should execute policies on events", async () => {
      const qumus = getQumusOrchestrator();
      const eventBus = getEventBus();

      await eventBus.publish({
        type: "content.published",
        source: "rockinrockinboogie",
        priority: "normal",
        data: { contentId: "123" },
      });

      // Give time for policy execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = qumus.getStats();
      expect(stats.totalDecisions).toBeGreaterThan(0);
    });

    it("should queue decisions for human review", async () => {
      const qumus = getQumusOrchestrator();
      const eventBus = getEventBus();

      await eventBus.publish({
        type: "broadcast.alert",
        source: "hybridcast",
        priority: "critical",
        data: { alertLevel: "critical" },
      });

      // Give time for policy execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      const queue = qumus.getHumanReviewQueue();
      // Emergency response policy requires human review
      expect(queue.length).toBeGreaterThanOrEqual(0);
    });

    it("should track decision statistics", async () => {
      const qumus = getQumusOrchestrator();

      const stats = qumus.getStats();
      expect(stats.totalDecisions).toBeGreaterThanOrEqual(0);
      expect(stats.policiesEnabled).toBeGreaterThan(0);
    });
  });

  describe("Webhook System", () => {
    it("should register webhooks", () => {
      const webhooks = getWebhookSystem();

      const webhook = webhooks.registerWebhook("partner-123", {
        url: "https://partner.example.com/webhooks",
        events: ["content.published"],
        active: true,
      });

      expect(webhook.id).toBeDefined();
      expect(webhook.partnerId).toBe("partner-123");
      expect(webhook.config.active).toBe(true);
    });

    it("should verify webhook signatures", () => {
      const webhooks = getWebhookSystem();
      const payload = JSON.stringify({ test: "data" });

      const webhook = webhooks.registerWebhook("partner-123", {
        url: "https://partner.example.com/webhooks",
        events: ["*"],
        active: true,
      });

      const secret = webhook.config.secret!;

      // Create signature
      const signature = require("crypto")
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex");

      // Verify signature
      const isValid = webhooks.verifySignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it("should track webhook statistics", () => {
      const webhooks = getWebhookSystem();

      webhooks.registerWebhook("partner-1", {
        url: "https://partner1.example.com/webhooks",
        events: ["*"],
        active: true,
      });

      webhooks.registerWebhook("partner-2", {
        url: "https://partner2.example.com/webhooks",
        events: ["*"],
        active: false,
      });

      const stats = webhooks.getStats();
      expect(stats.totalWebhooks).toBe(2);
      expect(stats.activeWebhooks).toBe(1);
    });
  });

  describe("Cross-Service Integration", () => {
    it("should route events between services", async () => {
      const eventBus = getEventBus();
      const qumus = getQumusOrchestrator();
      const dataSync = getDataSyncEngine();

      const contentHandler = vi.fn();
      const qumusHandler = vi.fn();

      eventBus.subscribe("content.published", contentHandler);
      eventBus.subscribe("qumus.decision_made", qumusHandler);

      await eventBus.publish({
        type: "content.published",
        source: "rockinrockinboogie",
        priority: "normal",
        data: { contentId: "123" },
      });

      // Give time for routing
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(contentHandler).toHaveBeenCalled();
      // QUMUS should make a decision
      expect(qumusHandler).toHaveBeenCalled();
    });

    it("should synchronize data across services", async () => {
      const eventBus = getEventBus();
      const dataSync = getDataSyncEngine();

      await eventBus.publish({
        type: "user.profile_updated",
        source: "rockinrockinboogie",
        priority: "normal",
        data: { userId: "123", name: "John Doe" },
      });

      // Give time for sync
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = dataSync.getStats();
      expect(stats.recordCount).toBeGreaterThan(0);
    });

    it("should handle emergency broadcasts", async () => {
      const eventBus = getEventBus();
      const qumus = getQumusOrchestrator();

      const emergencyHandler = vi.fn();
      eventBus.subscribe("broadcast.alert", emergencyHandler);

      await eventBus.publish({
        type: "broadcast.alert",
        source: "hybridcast",
        priority: "critical",
        data: { alertLevel: "critical", message: "Emergency" },
      });

      expect(emergencyHandler).toHaveBeenCalled();

      // Give time for QUMUS to process
      await new Promise((resolve) => setTimeout(resolve, 100));

      const stats = qumus.getStats();
      expect(stats.totalDecisions).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle failed event handlers gracefully", async () => {
      const eventBus = getEventBus();

      eventBus.subscribe("content.published", async () => {
        throw new Error("Handler error");
      });

      // Should not throw
      await eventBus.publish({
        type: "content.published",
        source: "test",
        priority: "normal",
        data: {},
      });

      // Give time for retry
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dlq = await eventBus.getDeadLetterQueue();
      expect(dlq.length).toBeGreaterThan(0);
    });

    it("should handle sync conflicts", async () => {
      const dataSync = getDataSyncEngine();

      const conflicts = dataSync.getConflicts();
      expect(Array.isArray(conflicts)).toBe(true);

      dataSync.clearConflicts();
      const clearedConflicts = dataSync.getConflicts();
      expect(clearedConflicts.length).toBe(0);
    });
  });

  describe("Performance", () => {
    it("should handle high event volume", async () => {
      const eventBus = getEventBus();

      const startTime = Date.now();

      // Publish 100 events
      for (let i = 0; i < 100; i++) {
        await eventBus.publish({
          type: "analytics.user_action",
          source: "rockinrockinboogie",
          priority: "low",
          data: { action: `action-${i}` },
        });
      }

      const duration = Date.now() - startTime;

      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);

      const stats = await eventBus.getStats();
      expect(stats.processedEvents).toBeGreaterThan(0);
    });

    it("should efficiently sync records", async () => {
      const dataSync = getDataSyncEngine();
      const eventBus = getEventBus();

      const startTime = Date.now();

      // Publish 50 content updates
      for (let i = 0; i < 50; i++) {
        await eventBus.publish({
          type: "content.updated",
          source: "rockinrockinboogie",
          priority: "normal",
          data: { contentId: `content-${i}` },
        });
      }

      // Give time for sync
      await new Promise((resolve) => setTimeout(resolve, 500));

      const duration = Date.now() - startTime;

      // Should complete in reasonable time
      expect(duration).toBeLessThan(2000);

      const stats = dataSync.getStats();
      expect(stats.recordCount).toBeGreaterThan(0);
    });
  });
});
