import { describe, it, expect, beforeEach, vi } from "vitest";
import { SendGridProvider, MailgunProvider, EmailService, reportEmailTemplates } from "./services/emailService";

describe("EmailService", () => {
  describe("SendGrid Provider", () => {
    it("should initialize with correct parameters", () => {
      const provider = new SendGridProvider("test-key", "from@example.com", "Test");
      expect(provider).toBeDefined();
    });

    it("should generate correct email payload", async () => {
      const provider = new SendGridProvider("test-key", "from@example.com", "Test");

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 202,
        text: vi.fn().mockResolvedValue(""),
      });

      const result = await provider.send({
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
    });
  });

  describe("Email Service Factory", () => {
    it("should create SendGrid provider", () => {
      const service = new EmailService("sendgrid", {
        apiKey: "test-key",
        fromEmail: "from@example.com",
      });

      expect(service).toBeDefined();
    });

    it("should create Mailgun provider", () => {
      const service = new EmailService("mailgun", {
        apiKey: "test-key",
        domain: "example.com",
        fromEmail: "from@example.com",
      });

      expect(service).toBeDefined();
    });

    it("should throw for unknown provider", () => {
      expect(() => {
        new EmailService("unknown" as any, {});
      }).toThrow();
    });
  });

  describe("Report Email Templates", () => {
    it("should generate weekly report HTML", () => {
      const html = reportEmailTemplates.weeklyReport({
        userName: "John Doe",
        sessionCount: 10,
        toolExecutions: 50,
        averageSessionDuration: 300,
        topTools: [
          { name: "web_search", count: 20 },
          { name: "calculator", count: 15 },
        ],
        period: "2026-01-22 to 2026-01-29",
      });

      expect(html).toContain("Weekly Agent Report");
      expect(html).toContain("John Doe");
      expect(html).toContain("10");
      expect(html).toContain("50");
      expect(html).toContain("web_search");
    });

    it("should generate monthly report HTML", () => {
      const html = reportEmailTemplates.monthlyReport({
        userName: "Jane Doe",
        totalSessions: 100,
        totalToolExecutions: 500,
        successRate: 95,
        averageResponseTime: 1500,
        topTools: [{ name: "api_call", count: 250 }],
        period: "January 2026",
      });

      expect(html).toContain("Monthly Agent Report");
      expect(html).toContain("Jane Doe");
      expect(html).toContain("100");
      expect(html).toContain("95%");
      expect(html).toContain("api_call");
    });

    it("should include proper HTML structure", () => {
      const html = reportEmailTemplates.weeklyReport({
        userName: "Test",
        sessionCount: 5,
        toolExecutions: 20,
        averageSessionDuration: 200,
        topTools: [],
        period: "test",
      });

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("<html>");
      expect(html).toContain("</html>");
      expect(html).toContain("<style>");
      expect(html).toContain("</style>");
    });
  });

  describe("Email Sending", () => {
    it("should handle multiple recipients", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 202,
        text: vi.fn().mockResolvedValue(""),
      });

      const provider = new SendGridProvider("test-key", "from@example.com");

      const result = await provider.send({
        to: ["user1@example.com", "user2@example.com"],
        subject: "Test",
        html: "<p>Test</p>",
      });

      expect(result.success).toBe(true);
    });

    it("should handle attachments", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 202,
        text: vi.fn().mockResolvedValue(""),
      });

      const provider = new SendGridProvider("test-key", "from@example.com");

      const result = await provider.send({
        to: "recipient@example.com",
        subject: "Test",
        html: "<p>Test</p>",
        attachments: [
          {
            filename: "test.txt",
            content: "test content",
            contentType: "text/plain",
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it("should handle send errors", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue("Invalid request"),
      });

      const provider = new SendGridProvider("test-key", "from@example.com");

      await expect(
        provider.send({
          to: "recipient@example.com",
          subject: "Test",
          html: "<p>Test</p>",
        })
      ).rejects.toThrow();
    });
  });
});
