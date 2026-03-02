import { describe, it, expect, beforeEach, vi } from "vitest";
import { WebhookService, webhookEvents } from "./services/webhookService";
import crypto from "crypto";

describe("WebhookService", () => {
  describe("Signature Generation", () => {
    it("should generate consistent HMAC signatures", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";

      const sig1 = WebhookService.generateSignature(payload, secret);
      const sig2 = WebhookService.generateSignature(payload, secret);

      expect(sig1).toBe(sig2);
      expect(sig1).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
    });

    it("should produce different signatures for different payloads", () => {
      const secret = "test-secret";
      const sig1 = WebhookService.generateSignature("payload1", secret);
      const sig2 = WebhookService.generateSignature("payload2", secret);

      expect(sig1).not.toBe(sig2);
    });

    it("should verify valid signatures", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";
      const signature = WebhookService.generateSignature(payload, secret);

      const isValid = WebhookService.verifySignature(payload, signature, secret);
      expect(isValid).toBe(true);
    });

    it("should reject invalid signatures", () => {
      const payload = JSON.stringify({ test: "data" });
      const secret = "test-secret";
      const invalidSignature = "invalid-signature";

      expect(() => {
        WebhookService.verifySignature(payload, invalidSignature, secret);
      }).toThrow();
    });
  });

  describe("Webhook Event Builders", () => {
    it("should build session created event", () => {
      const event = webhookEvents.sessionCreated(1, "Test Session", 123);

      expect(event.type).toBe("session.created");
      expect(event.sessionId).toBe(1);
      expect(event.data.sessionName).toBe("Test Session");
      expect(event.data.userId).toBe(123);
      expect(event.data.timestamp).toBeDefined();
    });

    it("should build session completed event", () => {
      const event = webhookEvents.sessionCompleted(1, 123, 5000, 10, 5);

      expect(event.type).toBe("session.completed");
      expect(event.data.duration).toBe(5000);
      expect(event.data.messageCount).toBe(10);
      expect(event.data.toolCount).toBe(5);
    });

    it("should build tool executed event", () => {
      const event = webhookEvents.toolExecuted(1, 123, "web_search", "completed", 1234);

      expect(event.type).toBe("tool.executed");
      expect(event.data.toolName).toBe("web_search");
      expect(event.data.status).toBe("completed");
      expect(event.data.duration).toBe(1234);
    });

    it("should build agent error event", () => {
      const event = webhookEvents.agentError(1, 123, "Connection timeout", "network_error");

      expect(event.type).toBe("agent.error");
      expect(event.data.error).toBe("Connection timeout");
      expect(event.data.errorType).toBe("network_error");
    });
  });
});
