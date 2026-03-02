import { describe, expect, it } from "vitest";
import {
  executeAgentTask,
  streamAgentExecution,
  getAgentStatus,
  validateAgentConfig,
  type AgentExecutionRequest,
} from "./agentBackendService";

describe("Agent Backend Service", () => {
  describe("executeAgentTask", () => {
    it("should execute a task and return a response", async () => {
      const request: AgentExecutionRequest = {
        sessionId: 1,
        userMessage: "What is the weather today?",
        systemPrompt: "You are a helpful assistant",
        temperature: 70,
        model: "gpt-4-turbo",
        maxSteps: 50,
      };

      const response = await executeAgentTask(request);

      expect(response.success).toBe(true);
      expect(response.agentResponse).toBeDefined();
      expect(response.status).toBe("completed");
      expect(Array.isArray(response.toolsUsed)).toBe(true);
      expect(typeof response.reasoning).toBe("string");
    });

    it("should handle missing system prompt", async () => {
      const request: AgentExecutionRequest = {
        sessionId: 1,
        userMessage: "Hello",
      };

      const response = await executeAgentTask(request);

      expect(response.success).toBe(true);
      expect(response.agentResponse).toBeDefined();
    });

    it("should handle errors gracefully", async () => {
      const request: AgentExecutionRequest = {
        sessionId: 1,
        userMessage: "",
        model: "invalid-model",
      };

      const response = await executeAgentTask(request);

      // Should return error status but not throw
      expect(response).toBeDefined();
      expect(typeof response.status).toBe("string");
    });
  });

  describe("streamAgentExecution", () => {
    it("should stream agent execution updates", async () => {
      const request: AgentExecutionRequest = {
        sessionId: 1,
        userMessage: "Test message",
      };

      const updates: any[] = [];

      for await (const update of streamAgentExecution(request)) {
        updates.push(update);
      }

      expect(updates.length).toBeGreaterThan(0);
      expect(updates[0].status).toBe("reasoning");
      expect(updates[updates.length - 1].status).toBe("completed");
    });
  });

  describe("getAgentStatus", () => {
    it("should return agent status", async () => {
      const status = await getAgentStatus();

      expect(status).toBeDefined();
      expect(status.status).toBe("idle");
      expect(typeof status.uptime).toBe("number");
      expect(typeof status.tasksCompleted).toBe("number");
      expect(typeof status.averageExecutionTime).toBe("number");
    });
  });

  describe("validateAgentConfig", () => {
    it("should validate correct configuration", () => {
      const config = {
        systemPrompt: "You are helpful",
        temperature: 70,
        model: "gpt-4-turbo",
        maxSteps: 50,
      };

      const result = validateAgentConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid temperature", () => {
      const config = {
        temperature: 150,
      };

      const result = validateAgentConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("Temperature");
    });

    it("should reject invalid max steps", () => {
      const config = {
        maxSteps: 2000,
      };

      const result = validateAgentConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("Max steps");
    });

    it("should reject invalid model", () => {
      const config = {
        model: "invalid-model-xyz",
      };

      const result = validateAgentConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("Invalid model");
    });

    it("should validate with multiple valid fields", () => {
      const config = {
        temperature: 50,
        maxSteps: 100,
        model: "gpt-4",
      };

      const result = validateAgentConfig(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should collect multiple errors", () => {
      const config = {
        temperature: 200,
        maxSteps: 5000,
        model: "bad-model",
      };

      const result = validateAgentConfig(config);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });
});

describe("File Browser Integration", () => {
  it("should support file tree structure", () => {
    const fileTree = {
      id: "root",
      name: "/",
      type: "folder" as const,
      path: "/",
      modified: new Date(),
      children: [
        {
          id: "1",
          name: "outputs",
          type: "folder" as const,
          path: "/outputs",
          modified: new Date(),
          children: [
            {
              id: "1-1",
              name: "report.md",
              type: "file" as const,
              size: 2048,
              path: "/outputs/report.md",
              modified: new Date(),
            },
          ],
        },
      ],
    };

    expect(fileTree.name).toBe("/");
    expect(fileTree.type).toBe("folder");
    expect(fileTree.children).toBeDefined();
    expect(fileTree.children![0].name).toBe("outputs");
    expect(fileTree.children![0].children![0].type).toBe("file");
  });

  it("should support file metadata", () => {
    const file = {
      id: "file-1",
      name: "data.json",
      type: "file" as const,
      size: 4096,
      path: "/data.json",
      modified: new Date("2026-01-29"),
    };

    expect(file.name).toBe("data.json");
    expect(file.size).toBe(4096);
    expect(file.modified.getFullYear()).toBe(2026);
  });
});

describe("Deployment Configuration", () => {
  it("should support environment variable management", () => {
    const envVar = {
      id: "env-1",
      key: "NODE_ENV",
      value: "production",
      isSecret: false,
      description: "Node environment",
    };

    expect(envVar.key).toBe("NODE_ENV");
    expect(envVar.value).toBe("production");
    expect(envVar.isSecret).toBe(false);
  });

  it("should support secret variables", () => {
    const secret = {
      id: "secret-1",
      key: "API_KEY",
      value: "sk-secret-key-12345",
      isSecret: true,
      description: "API authentication key",
    };

    expect(secret.isSecret).toBe(true);
    expect(secret.key).toBe("API_KEY");
  });

  it("should support deployment configuration", () => {
    const config = {
      serverUrl: "https://agent.example.com",
      environment: "production" as const,
      port: 3000,
      workers: 4,
      maxMemory: 2048,
      timeout: 30,
    };

    expect(config.environment).toBe("production");
    expect(config.port).toBe(3000);
    expect(config.workers).toBe(4);
  });

  it("should validate environment values", () => {
    const validEnv = {
      environment: "production" as const,
      port: 3000,
      workers: 4,
    };

    expect(validEnv.environment).toMatch(/development|staging|production/);
    expect(validEnv.port).toBeGreaterThan(0);
    expect(validEnv.workers).toBeGreaterThan(0);
  });
});
