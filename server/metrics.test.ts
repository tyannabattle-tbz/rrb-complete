import { describe, it, expect, beforeEach, vi } from "vitest";
import { MetricsService } from "./services/metricsService";
import * as db from "./db";

// Mock the db module
vi.mock("./db", () => ({
  getUserSessions: vi.fn(),
  getSessionMessages: vi.fn(),
  getSessionToolExecutions: vi.fn(),
  getApiUsage: vi.fn(),
  getOrCreateQuota: vi.fn(),
}));

describe("MetricsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Metrics Snapshot", () => {
    it("should calculate metrics correctly", async () => {
      // Mock data
      const mockSessions = [
        {
          id: 1,
          userId: 123,
          sessionName: "Test 1",
          status: "completed",
          createdAt: new Date(Date.now() - 10000),
          updatedAt: new Date(),
        },
      ];

      const mockMessages = [{ id: 1, content: "test" }];
      const mockTools = [
        {
          id: 1,
          toolName: "web_search",
          status: "completed",
          duration: 1000,
        },
      ];

      (db.getUserSessions as any).mockResolvedValue(mockSessions);
      (db.getSessionMessages as any).mockResolvedValue(mockMessages);
      (db.getSessionToolExecutions as any).mockResolvedValue(mockTools);
      (db.getApiUsage as any).mockResolvedValue([
        { requestCount: 5, tokenCount: 100, totalDuration: 5000 },
      ]);
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });

      const snapshot = await MetricsService.getMetricsSnapshot(123);

      expect(snapshot.totalSessions).toBe(1);
      expect(snapshot.totalMessages).toBe(1);
      expect(snapshot.totalToolExecutions).toBe(1);
      expect(snapshot.successRate).toBe(100);
      expect(snapshot.errorRate).toBe(0);
      expect(snapshot.topTools).toHaveLength(1);
      expect(snapshot.topTools[0].name).toBe("web_search");
    });

    it("should handle empty sessions", async () => {
      (db.getUserSessions as any).mockResolvedValue([]);
      (db.getApiUsage as any).mockResolvedValue([]);
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });

      const snapshot = await MetricsService.getMetricsSnapshot(123);

      expect(snapshot.totalSessions).toBe(0);
      expect(snapshot.totalMessages).toBe(0);
      expect(snapshot.totalToolExecutions).toBe(0);
      expect(snapshot.successRate).toBe(0);
    });
  });

  describe("Performance Report", () => {
    it("should generate weekly report", async () => {
      (db.getUserSessions as any).mockResolvedValue([]);
      (db.getApiUsage as any).mockResolvedValue([]);
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });

      const report = await MetricsService.generatePerformanceReport(123, "weekly");

      expect(report.period).toBe("weekly");
      expect(report.startDate).toBeDefined();
      expect(report.endDate).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.recommendations).toBeDefined();
      expect(report.recommendations.length).toBeGreaterThan(0);
    });

    it("should generate daily report", async () => {
      (db.getUserSessions as any).mockResolvedValue([]);
      (db.getApiUsage as any).mockResolvedValue([]);
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });

      const report = await MetricsService.generatePerformanceReport(123, "daily");

      expect(report.period).toBe("daily");
    });

    it("should generate monthly report", async () => {
      (db.getUserSessions as any).mockResolvedValue([]);
      (db.getApiUsage as any).mockResolvedValue([]);
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });

      const report = await MetricsService.generatePerformanceReport(123, "monthly");

      expect(report.period).toBe("monthly");
    });
  });

  describe("Quota Status", () => {
    it("should calculate quota usage percentage", async () => {
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });
      (db.getApiUsage as any).mockResolvedValue([
        { requestCount: 5000, tokenCount: 500000 },
      ]);

      const status = await MetricsService.getQuotaStatus(123);

      expect(status.requestPercentage).toBe(50);
      expect(status.tokenPercentage).toBe(50);
      expect(status.warnings).toHaveLength(0);
    });

    it("should warn when quota usage is high", async () => {
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });
      (db.getApiUsage as any).mockResolvedValue([
        { requestCount: 8500, tokenCount: 900000 },
      ]);

      const status = await MetricsService.getQuotaStatus(123);

      expect(status.requestPercentage).toBe(85);
      expect(status.warnings.length).toBeGreaterThan(0);
    });
  });

  describe("CSV Export", () => {
    it("should export metrics as CSV", async () => {
      (db.getUserSessions as any).mockResolvedValue([]);
      (db.getApiUsage as any).mockResolvedValue([]);
      (db.getOrCreateQuota as any).mockResolvedValue({
        requestsPerDay: 10000,
        tokensPerDay: 1000000,
      });

      const csv = await MetricsService.exportMetricsAsCSV(123);

      expect(csv).toContain("Metric,Value");
      expect(csv).toContain("Total Sessions");
      expect(csv).toContain("Success Rate");
      expect(csv).toContain("Quota Usage");
    });
  });
});
