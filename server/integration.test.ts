import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext; clearedCookies: any[] } {
  const clearedCookies: any[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: any) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

describe("Agent Integration Tests", () => {
  describe("Session Management", () => {
    it("should create a new agent session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.agent.createSession({
        sessionName: "Integration Test Session",
        systemPrompt: "You are a test assistant",
        temperature: 70,
        model: "gpt-4-turbo",
        maxSteps: 50,
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("should retrieve all sessions for a user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a session first
      await caller.agent.createSession({
        sessionName: "Test Session 1",
      });

      // Get all sessions
      const sessions = await caller.agent.getSessions();

      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0]).toHaveProperty("id");
      expect(sessions[0]).toHaveProperty("sessionName");
    });

    it("should update session configuration", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create a session
      const createResult = await caller.agent.createSession({
        sessionName: "Config Test Session",
      });

      if (!createResult.id) throw new Error("Failed to create session");

      // Update configuration
      const updateResult = await caller.agent.updateSession({
        sessionId: createResult.id,
        systemPrompt: "Updated system prompt",
        temperature: 80,
        model: "gpt-4",
        maxSteps: 100,
      });

      expect(updateResult.success).toBe(true);

      // Verify update
      const session = await caller.agent.getSession({
        sessionId: createResult.id,
      });

      expect(session?.systemPrompt).toBe("Updated system prompt");
      expect(session?.temperature).toBe(80);
    });
  });

  describe("Message Management", () => {
    let sessionId: number;

    beforeEach(async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.agent.createSession({
        sessionName: "Message Test Session",
      });
      if (!result.id) throw new Error("Failed to create session");
      sessionId = result.id;
    });

    it("should add a message to a session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.messages.addMessage({
        sessionId,
        role: "user",
        content: "Hello, agent!",
      });

      expect(result.success).toBe(true);
    });

    it("should retrieve messages for a session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Add some messages
      await caller.messages.addMessage({
        sessionId,
        role: "user",
        content: "First message",
      });

      await caller.messages.addMessage({
        sessionId,
        role: "assistant",
        content: "First response",
      });

      // Retrieve messages
      const messages = await caller.messages.getMessages({
        sessionId,
      });

      expect(Array.isArray(messages)).toBe(true);
      expect(messages.length).toBeGreaterThanOrEqual(2);
      expect(messages.some((m) => m.role === "user")).toBe(true);
      expect(messages.some((m) => m.role === "assistant")).toBe(true);
    });
  });

  describe("Tool Execution Tracking", () => {
    let sessionId: number;

    beforeEach(async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.agent.createSession({
        sessionName: "Tool Test Session",
      });
      if (!result.id) throw new Error("Failed to create session");
      sessionId = result.id;
    });

    it("should retrieve tool executions for a session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Retrieve executions
      const executions = await caller.tools.getExecutions({
        sessionId,
      });

      expect(Array.isArray(executions)).toBe(true);
    });
  });

  describe("Memory Management", () => {
    let sessionId: number;

    beforeEach(async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.agent.createSession({
        sessionName: "Memory Test Session",
      });
      if (!result.id) throw new Error("Failed to create session");
      sessionId = result.id;
    });

    it("should store memory entries", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.memory.store({
        sessionId,
        key: "user_preference",
        value: "dark_mode",
      });

      expect(result.success).toBe(true);
    });

    it("should retrieve all memory entries", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Store multiple entries
      await caller.memory.store({
        sessionId,
        key: "key1",
        value: "value1",
      });

      await caller.memory.store({
        sessionId,
        key: "key2",
        value: "value2",
      });

      // Retrieve all
      const entries = await caller.memory.getAll({
        sessionId,
      });

      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThanOrEqual(2);
    });

    it("should delete memory entries", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Store an entry
      await caller.memory.store({
        sessionId,
        key: "to_delete",
        value: "value",
      });

      // Delete it
      const deleteResult = await caller.memory.delete({
        sessionId,
        key: "to_delete",
      });

      expect(deleteResult.success).toBe(true);
    });
  });

  describe("Task History", () => {
    let sessionId: number;

    beforeEach(async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.agent.createSession({
        sessionName: "Task Test Session",
      });
      if (!result.id) throw new Error("Failed to create session");
      sessionId = result.id;
    });

    it("should retrieve tasks for a session", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Retrieve tasks
      const tasks = await caller.tasks.getTasks({
        sessionId,
      });

      expect(Array.isArray(tasks)).toBe(true);
    });
  });

  describe("API Key Management", () => {
    it("should have API key router", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Verify API key router exists
      expect(caller.apiKeys).toBeDefined();
    });
  });
});
