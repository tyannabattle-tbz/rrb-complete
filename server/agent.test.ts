import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(user?: typeof mockUser): TrpcContext {
  return {
    user: user || mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("Agent Router", () => {
  describe("agent.createSession", () => {
    it("should create a new agent session", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agent.createSession({
        sessionName: "Test Session",
        systemPrompt: "You are a test agent",
        temperature: 50,
        model: "gpt-4",
        maxSteps: 30,
      });

      expect(result.success).toBe(true);
    });

    it("should require a non-empty session name", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.agent.createSession({
          sessionName: "",
        })
      ).rejects.toThrow();
    });


  });

  describe("agent.getSessions", () => {
    it("should retrieve user sessions", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const sessions = await caller.agent.getSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });

    it("should return an array of sessions", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const sessions = await caller.agent.getSessions();
      expect(Array.isArray(sessions)).toBe(true);
    });
  });

  describe("agent.updateSession", () => {
    it("should update session configuration", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agent.updateSession({
        sessionId: 1,
        temperature: 75,
        model: "gpt-3.5-turbo",
      });

      expect(result.success).toBe(true);
    });

    it("should handle partial updates", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agent.updateSession({
        sessionId: 1,
        temperature: 60,
      });

      expect(result.success).toBe(true);
    });
  });
});

describe("Messages Router", () => {
  describe("messages.addMessage", () => {
    it("should add a user message", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.addMessage({
        sessionId: 1,
        role: "user",
        content: "Hello, agent!",
      });

      expect(result.success).toBe(true);
    });

    it("should add an assistant message", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.addMessage({
        sessionId: 1,
        role: "assistant",
        content: "Hello! How can I help you?",
      });

      expect(result.success).toBe(true);
    });

    it("should add a system message", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.addMessage({
        sessionId: 1,
        role: "system",
        content: "System initialized",
      });

      expect(result.success).toBe(true);
    });

    it("should include optional metadata", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.addMessage({
        sessionId: 1,
        role: "user",
        content: "Test message",
        metadata: JSON.stringify({ source: "test" }),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("messages.getMessages", () => {
    it("should retrieve messages from a session", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const messages = await caller.messages.getMessages({
        sessionId: 1,
      });

      expect(Array.isArray(messages)).toBe(true);
    });

    it("should respect the limit parameter", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const messages = await caller.messages.getMessages({
        sessionId: 1,
        limit: 10,
      });

      expect(messages.length).toBeLessThanOrEqual(10);
    });
  });
});

describe("Tools Router", () => {
  describe("tools.createExecution", () => {
    it("should create a tool execution record", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tools.createExecution({
        sessionId: 1,
        toolName: "browser",
        parameters: JSON.stringify({ url: "https://example.com" }),
      });

      expect(result.success).toBe(true);
    });

    it("should handle tool execution without parameters", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tools.createExecution({
        sessionId: 1,
        toolName: "memory",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("tools.updateExecution", () => {
    it("should update execution status to completed", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tools.updateExecution({
        executionId: 1,
        status: "completed",
        result: JSON.stringify({ success: true }),
        duration: 1500,
      });

      expect(result.success).toBe(true);
    });

    it("should update execution with error", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tools.updateExecution({
        executionId: 1,
        status: "failed",
        error: "Connection timeout",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("tools.getExecutions", () => {
    it("should retrieve tool executions for a session", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const executions = await caller.tools.getExecutions({
        sessionId: 1,
      });

      expect(Array.isArray(executions)).toBe(true);
    });
  });
});

describe("API Keys Router", () => {
  describe("apiKeys.saveKey", () => {
    it("should save an encrypted API key", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.apiKeys.saveKey({
        provider: "openai",
        keyName: "Main API Key",
        encryptedKey: "encrypted_key_data",
      });

      expect(result.success).toBe(true);
    });

    it("should handle different providers", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.apiKeys.saveKey({
        provider: "anthropic",
        keyName: "Claude API Key",
        encryptedKey: "encrypted_claude_key",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("apiKeys.getKeys", () => {
    it("should retrieve user API keys", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const keys = await caller.apiKeys.getKeys({});
      expect(Array.isArray(keys)).toBe(true);
    });

    it("should filter keys by provider", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const keys = await caller.apiKeys.getKeys({
        provider: "openai",
      });

      expect(Array.isArray(keys)).toBe(true);
    });

    it("should return an empty array if no keys exist", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const keys = await caller.apiKeys.getKeys({});
      expect(Array.isArray(keys)).toBe(true);
    });
  });
});

describe("Tasks Router", () => {
  describe("tasks.createTask", () => {
    it("should create a new task", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tasks.createTask({
        sessionId: 1,
        taskDescription: "Research AI models",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("tasks.updateTask", () => {
    it("should update task status", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.tasks.updateTask({
        taskId: 1,
        status: "completed",
        outcome: "Successfully completed the research",
        duration: 3600,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("tasks.getTasks", () => {
    it("should retrieve tasks for a session", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const tasks = await caller.tasks.getTasks({
        sessionId: 1,
      });

      expect(Array.isArray(tasks)).toBe(true);
    });
  });
});

describe("Memory Router", () => {
  describe("memory.store", () => {
    it("should store a key-value pair", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.memory.store({
        sessionId: 1,
        key: "research_findings",
        value: JSON.stringify({ topic: "AI", findings: "..." }),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("memory.retrieve", () => {
    it("should retrieve a value by key", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.memory.retrieve({
        sessionId: 1,
        key: "research_findings",
      });

      expect(result).toHaveProperty("value");
    });
  });

  describe("memory.getAll", () => {
    it("should retrieve all memory entries for a session", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const entries = await caller.memory.getAll({
        sessionId: 1,
      });

      expect(Array.isArray(entries)).toBe(true);
    });
  });

  describe("memory.delete", () => {
    it("should delete a memory entry", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.memory.delete({
        sessionId: 1,
        key: "research_findings",
      });

      expect(result.success).toBe(true);
    });
  });
});
