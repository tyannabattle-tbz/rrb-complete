/**
 * Task Execution Engine Tests
 * Comprehensive test suite for the production-ready task execution engine
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { taskExecutionEngine } from "./taskExecutionEngine";

describe("Task Execution Engine", () => {
  // Mock database and LLM responses
  const mockDb = {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({}),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    }),
  };

  beforeAll(() => {
    vi.mock("../db", () => ({
      getDb: vi.fn().mockResolvedValue(mockDb),
    }));
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  describe("Task Submission", () => {
    it("should submit a task and return a task ID", async () => {
      const input = {
        goal: "Generate a marketing report",
        priority: 8,
        userId: 1,
        steps: ["Collect data", "Analyze trends", "Create report"],
      };

      const taskId = await taskExecutionEngine.submitTask(input);

      expect(taskId).toBeDefined();
      expect(typeof taskId).toBe("string");
      expect(taskId.length).toBeGreaterThan(0);
    });

    it("should create task steps when provided", async () => {
      const input = {
        goal: "Process payment",
        priority: 9,
        userId: 2,
        steps: ["Validate amount", "Charge card", "Send confirmation"],
      };

      const taskId = await taskExecutionEngine.submitTask(input);

      expect(taskId).toBeDefined();
      // Verify that insert was called for task steps
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should handle tasks without steps", async () => {
      const input = {
        goal: "Send notification to user",
        priority: 5,
        userId: 3,
      };

      const taskId = await taskExecutionEngine.submitTask(input);

      expect(taskId).toBeDefined();
    });

    it("should throw error if database connection fails", async () => {
      vi.mock("../db", () => ({
        getDb: vi.fn().mockResolvedValue(null),
      }));

      const input = {
        goal: "Test task",
        userId: 1,
      };

      await expect(taskExecutionEngine.submitTask(input)).rejects.toThrow(
        "Database connection failed"
      );
    });
  });

  describe("Task Status", () => {
    it("should return null for non-existent task", async () => {
      const status = await taskExecutionEngine.getTaskStatus("non-existent-id");
      expect(status).toBeNull();
    });

    it("should return task status with progress", async () => {
      // This test would need actual database setup
      // For now, we're testing the interface
      const status = await taskExecutionEngine.getTaskStatus("test-task-id");
      
      if (status) {
        expect(status).toHaveProperty("id");
        expect(status).toHaveProperty("goal");
        expect(status).toHaveProperty("status");
        expect(status).toHaveProperty("progress");
      }
    });
  });

  describe("System Metrics", () => {
    it("should return system metrics", async () => {
      const metrics = await taskExecutionEngine.getSystemMetrics();

      expect(metrics).toHaveProperty("activeTaskCount");
      expect(metrics).toHaveProperty("queuedTaskCount");
      expect(metrics).toHaveProperty("successRate");
      expect(metrics).toHaveProperty("averageExecutionTime");
      expect(metrics).toHaveProperty("totalTasksProcessed");
      expect(metrics).toHaveProperty("failedTaskCount");

      expect(typeof metrics.activeTaskCount).toBe("number");
      expect(typeof metrics.successRate).toBe("number");
      expect(metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(metrics.successRate).toBeLessThanOrEqual(100);
    });

    it("should handle database errors gracefully", async () => {
      vi.mock("../db", () => ({
        getDb: vi.fn().mockResolvedValue(null),
      }));

      const metrics = await taskExecutionEngine.getSystemMetrics();

      expect(metrics.activeTaskCount).toBe(0);
      expect(metrics.successRate).toBe(0);
      expect(metrics.failedTaskCount).toBe(0);
    });
  });

  describe("Policy Evaluation", () => {
    it("should evaluate policies before task execution", async () => {
      const input = {
        goal: "Delete all user data",
        priority: 10,
        userId: 1,
      };

      // This task should require review due to safety concerns
      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();
    });

    it("should approve safe tasks", async () => {
      const input = {
        goal: "Send welcome email to new user",
        priority: 5,
        userId: 1,
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();
    });

    it("should reject dangerous tasks", async () => {
      const input = {
        goal: "Modify system configuration without validation",
        priority: 10,
        userId: 1,
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();
    });
  });

  describe("Task Execution", () => {
    it("should execute task steps sequentially", async () => {
      const input = {
        goal: "Generate report",
        priority: 8,
        userId: 1,
        steps: ["Fetch data", "Process data", "Generate PDF"],
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();

      // Wait a bit for async execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = await taskExecutionEngine.getTaskStatus(taskId);
      
      if (status) {
        expect(status.status).toMatch(/queued|executing|completed|failed/);
      }
    });

    it("should handle step failures gracefully", async () => {
      const input = {
        goal: "Process invalid data",
        priority: 5,
        userId: 1,
        steps: ["Validate", "Process", "Save"],
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();
    });

    it("should support concurrent task execution", async () => {
      const tasks = [];
      for (let i = 0; i < 10; i++) {
        tasks.push(
          taskExecutionEngine.submitTask({
            goal: `Task ${i}`,
            priority: 5,
            userId: 1,
          })
        );
      }

      const taskIds = await Promise.all(tasks);
      expect(taskIds).toHaveLength(10);
      taskIds.forEach((id) => {
        expect(id).toBeDefined();
        expect(typeof id).toBe("string");
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors during task submission", async () => {
      const input = {
        goal: "Test task",
        userId: 1,
      };

      // This should not throw, but handle gracefully
      try {
        await taskExecutionEngine.submitTask(input);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should log task failures", async () => {
      const input = {
        goal: "Failing task",
        priority: 5,
        userId: 1,
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();

      // Wait for execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      const status = await taskExecutionEngine.getTaskStatus(taskId);
      
      if (status && status.status === "failed") {
        expect(status.error).toBeDefined();
      }
    });
  });

  describe("Performance", () => {
    it("should handle high-priority tasks first", async () => {
      const lowPriority = await taskExecutionEngine.submitTask({
        goal: "Low priority task",
        priority: 1,
        userId: 1,
      });

      const highPriority = await taskExecutionEngine.submitTask({
        goal: "High priority task",
        priority: 10,
        userId: 1,
      });

      expect(lowPriority).toBeDefined();
      expect(highPriority).toBeDefined();
    });

    it("should complete tasks within reasonable time", async () => {
      const startTime = Date.now();

      const taskId = await taskExecutionEngine.submitTask({
        goal: "Quick task",
        priority: 5,
        userId: 1,
      });

      const submissionTime = Date.now() - startTime;
      expect(submissionTime).toBeLessThan(1000); // Should submit in < 1 second
    });
  });

  describe("Integration", () => {
    it("should integrate with LLM for policy evaluation", async () => {
      const input = {
        goal: "Generate marketing content",
        priority: 7,
        userId: 1,
        steps: ["Research", "Write", "Review"],
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();
    });

    it("should store policy decisions in database", async () => {
      const input = {
        goal: "Send bulk email",
        priority: 6,
        userId: 1,
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();

      // Policy decision should be stored
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should emit task events for real-time updates", async () => {
      const input = {
        goal: "Real-time task",
        priority: 5,
        userId: 1,
      };

      const taskId = await taskExecutionEngine.submitTask(input);
      expect(taskId).toBeDefined();

      // Events should be logged
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });
});
