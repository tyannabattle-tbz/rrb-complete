/**
 * QUMUS Autonomous Agent Tests
 * 
 * Comprehensive test suite for autonomous agent capabilities
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { AutonomousAgent } from "./autonomousAgent";
import { getToolRegistry } from "./toolRegistry";
import { getMemorySystem } from "./memorySystem";
import { getPlanningEngine } from "./planningEngine";
import { getEcosystemController } from "./ecosystemController";

describe("QUMUS Autonomous Agent", () => {
  let agent: AutonomousAgent;

  beforeEach(() => {
    agent = new AutonomousAgent("test-agent", "Test QUMUS Agent");
  });

  describe("Agent Initialization", () => {
    it("should initialize with correct properties", () => {
      const status = agent.getStatus();
      expect(status.name).toBe("Test QUMUS Agent");
      expect(status.isRunning).toBe(false);
      expect(status.queueLength).toBe(0);
    });

    it("should have empty memory on initialization", () => {
      const memory = agent.getMemory();
      expect(memory.facts).toBe(0);
      expect(memory.experiences).toBe(0);
    });
  });

  describe("Tool Registration", () => {
    it("should register tools", () => {
      const testTool = async () => "test result";
      agent.registerTool("test_tool", testTool);

      const status = agent.getStatus();
      expect(status.toolCount).toBe(1);
    });

    it("should register multiple tools", () => {
      agent.registerTool("tool1", async () => "result1");
      agent.registerTool("tool2", async () => "result2");
      agent.registerTool("tool3", async () => "result3");

      const status = agent.getStatus();
      expect(status.toolCount).toBe(3);
    });
  });

  describe("Policy Registration", () => {
    it("should register policies", () => {
      const testPolicy = async () => ({ success: true });
      agent.registerPolicy("test_policy", testPolicy);

      const status = agent.getStatus();
      expect(status.policyCount).toBe(1);
    });

    it("should register multiple policies", () => {
      agent.registerPolicy("policy1", async () => ({}));
      agent.registerPolicy("policy2", async () => ({}));

      const status = agent.getStatus();
      expect(status.policyCount).toBe(2);
    });
  });

  describe("Task Submission", () => {
    it("should submit a task", async () => {
      const taskId = await agent.submitTask("Test goal", ["step1", "step2"]);
      expect(taskId).toBeDefined();
      expect(taskId).toMatch(/^task-/);
    });

    it("should queue multiple tasks", async () => {
      const id1 = await agent.submitTask("Goal 1", ["step1"]);
      const id2 = await agent.submitTask("Goal 2", ["step2"]);

      expect(id1).not.toBe(id2);
    });
  });

  describe("Memory Management", () => {
    it("should clear memory", () => {
      agent.clearMemory();
      const memory = agent.getMemory();

      expect(memory.facts).toBe(0);
      expect(memory.experiences).toBe(0);
    });
  });
});

describe("Tool Registry", () => {
  let registry = getToolRegistry();

  beforeEach(() => {
    registry = getToolRegistry();
  });

  describe("Tool Registration", () => {
    it("should have default tools", () => {
      const count = registry.getToolCount();
      expect(count).toBeGreaterThan(0);
    });

    it("should list tools by category", () => {
      const fileTools = registry.listToolsByCategory("file");
      expect(fileTools.length).toBeGreaterThan(0);
    });

    it("should find tools", () => {
      const tool = registry.getTool("read_file");
      expect(tool).toBeDefined();
      expect(tool?.name).toBe("read_file");
    });
  });

  describe("Tool Execution", () => {
    it("should call a tool", async () => {
      const result = await registry.callTool("get_system_info", {});
      expect(result).toBeDefined();
      expect(result.platform).toBeDefined();
    });

    it("should handle tool errors", async () => {
      try {
        await registry.callTool("nonexistent_tool", {});
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(String(error)).toContain("Tool not found");
      }
    });
  });
});

describe("Memory System", () => {
  let memory = getMemorySystem();

  beforeEach(() => {
    memory = getMemorySystem();
    memory.clearAll();
  });

  describe("Fact Storage", () => {
    it("should store facts", () => {
      memory.storeFact("test_key", { value: "test" });
      const fact = memory.retrieveFact("test_key");

      expect(fact).toBeDefined();
      expect(fact?.value).toEqual({ value: "test" });
    });

    it("should store facts with confidence", () => {
      memory.storeFact("confident_fact", "value", 0.95);
      const fact = memory.retrieveFact("confident_fact");

      expect(fact?.confidence).toBe(0.95);
    });

    it("should search facts", () => {
      memory.storeFact("user_name", "Alice");
      memory.storeFact("user_email", "alice@example.com");

      const results = memory.searchFacts("user_");
      expect(results.length).toBe(2);
    });
  });

  describe("Experience Storage", () => {
    it("should store experiences", () => {
      const exp = memory.storeExperience(
        "task1",
        "test_action",
        { result: "success" },
        "success",
        ["learning1"]
      );

      expect(exp.id).toBeDefined();
      expect(exp.outcome).toBe("success");
    });

    it("should track success rate", () => {
      memory.storeExperience("task1", "action1", {}, "success");
      memory.storeExperience("task2", "action2", {}, "success");
      memory.storeExperience("task3", "action3", {}, "failure");

      const rate = memory.getSuccessRate();
      expect(rate).toBeCloseTo(0.667, 2);
    });

    it("should retrieve learnings", () => {
      memory.storeExperience("task1", "action1", {}, "success", [
        "learning1",
        "learning2",
      ]);
      memory.storeExperience("task2", "action2", {}, "success", ["learning3"]);

      const learnings = memory.getLearnings();
      expect(learnings.length).toBe(3);
    });
  });

  describe("Context Management", () => {
    it("should set and get context", () => {
      memory.setContext("current_task", "task123");
      const context = memory.getContext("current_task");

      expect(context).toBe("task123");
    });

    it("should handle context expiration", () => {
      memory.setContext("temp_context", "value", 100); // 100ms expiration
      expect(memory.getContext("temp_context")).toBe("value");

      // Wait for expiration
      setTimeout(() => {
        memory.clearExpiredContext();
        expect(memory.getContext("temp_context")).toBeUndefined();
      }, 150);
    });
  });

  describe("Memory Statistics", () => {
    it("should report statistics", () => {
      memory.storeFact("fact1", "value1");
      memory.storeFact("fact2", "value2");
      memory.setContext("ctx1", "value1");

      const stats = memory.getStats();
      expect(stats.factCount).toBe(2);
      expect(stats.contextSize).toBe(1);
    });
  });
});

describe("Planning Engine", () => {
  let planning = getPlanningEngine();

  beforeEach(() => {
    planning = getPlanningEngine();
  });

  describe("Goal Management", () => {
    it("should add goals", () => {
      const goal = planning.addGoal("Test goal", 5, ["constraint1"]);
      expect(goal.id).toBeDefined();
      expect(goal.description).toBe("Test goal");
    });

    it("should set goal priority", () => {
      const goal = planning.addGoal("High priority", 10);
      expect(goal.priority).toBe(10);
    });
  });

  describe("Plan Generation", () => {
    it("should generate plans", () => {
      const goal = planning.addGoal("Analyze data", 5);
      const plan = planning.generatePlan(goal.id);

      expect(plan.id).toBeDefined();
      expect(plan.steps.length).toBeGreaterThan(0);
    });

    it("should generate steps for different goal types", () => {
      const analyzeGoal = planning.addGoal("Analyze something", 5);
      const analyzePlan = planning.generatePlan(analyzeGoal.id);

      const createGoal = planning.addGoal("Create something", 5);
      const createPlan = planning.generatePlan(createGoal.id);

      expect(analyzePlan.steps.length).toBeGreaterThan(0);
      expect(createPlan.steps.length).toBeGreaterThan(0);
    });
  });

  describe("Plan Execution", () => {
    it("should execute plans", async () => {
      const goal = planning.addGoal("Test execution", 5);
      const plan = planning.generatePlan(goal.id);

      const result = await planning.executePlan(plan.id);
      expect(result.success).toBe(true);
    });
  });

  describe("Planning Statistics", () => {
    it("should report statistics", () => {
      planning.addGoal("Goal 1", 5);
      planning.addGoal("Goal 2", 5);

      const stats = planning.getStats();
      expect(stats.goalCount).toBeGreaterThanOrEqual(2);
    });
  });
});

describe("Ecosystem Controller", () => {
  let ecosystem = getEcosystemController();

  beforeEach(() => {
    ecosystem = getEcosystemController();
  });

  describe("RRB Commands", () => {
    it("should send RRB commands", async () => {
      const cmdId = await ecosystem.commandRRB("schedule_broadcast", {
        title: "Test Broadcast",
      });

      expect(cmdId).toBeDefined();
      expect(cmdId).toMatch(/^cmd-rrb-/);
    });

    it("should track command status", async () => {
      const cmdId = await ecosystem.commandRRB("start_stream", {
        streamName: "test",
      });

      const status = ecosystem.getCommandStatus(cmdId);
      expect(status).toBeDefined();
      expect(status?.status).toBe("completed");
    });
  });

  describe("HybridCast Commands", () => {
    it("should send HybridCast commands", async () => {
      const cmdId = await ecosystem.commandHybridCast("send_broadcast", {
        message: "Test",
      });

      expect(cmdId).toBeDefined();
      expect(cmdId).toMatch(/^cmd-hc-/);
    });
  });

  describe("Canryn Commands", () => {
    it("should send Canryn commands", async () => {
      const cmdId = await ecosystem.commandCanryn("create_project", {
        name: "Test Project",
      });

      expect(cmdId).toBeDefined();
      expect(cmdId).toMatch(/^cmd-canryn-/);
    });
  });

  describe("Sweet Miracles Commands", () => {
    it("should send Sweet Miracles commands", async () => {
      const cmdId = await ecosystem.commandSweetMiracles("process_donation", {
        amount: 100,
      });

      expect(cmdId).toBeDefined();
      expect(cmdId).toMatch(/^cmd-sm-/);
    });
  });

  describe("Ecosystem Statistics", () => {
    it("should report ecosystem statistics", async () => {
      await ecosystem.commandRRB("schedule_broadcast", {});
      await ecosystem.commandHybridCast("send_broadcast", {});

      const stats = ecosystem.getStats();
      expect(stats.totalCommands).toBeGreaterThan(0);
      expect(stats.completedCommands).toBeGreaterThan(0);
    });
  });
});
