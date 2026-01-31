import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  agentRegistry,
  agentMemory,
  agentTools,
  agentExecutionLogs,
  reasoningChains,
  agentCollaboration,
  agentPerformanceMetrics,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

export const agentInfrastructureRouter = router({
  // Register new agent
  registerAgent: protectedProcedure
    .input(
      z.object({
        agentName: z.string(),
        agentType: z.enum(["reasoning", "execution", "monitoring", "coordination", "custom"]),
        description: z.string().optional(),
        capabilities: z.array(z.string()).optional(),
        configuration: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const db_instance = await getDb();
      if (db_instance) {
        await db_instance.insert(agentRegistry).values({
          userId: ctx.user.id,
          agentName: input.agentName,
          agentType: input.agentType as any,
          description: input.description,
          capabilities: input.capabilities || [],
          configuration: input.configuration || {},
        } as any);
      }

      return { success: true, message: "Agent registered successfully" };
    }),

  // Get registered agents
  getAgents: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Unauthorized");
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const agents = await db.select().from(agentRegistry).where(eq(agentRegistry.userId, ctx.user.id));

    return agents;
  }),

  // Store agent memory
  storeMemory: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        sessionId: z.number(),
        memoryType: z.enum(["short_term", "long_term", "episodic", "semantic"]),
        key: z.string(),
        value: z.string(),
        importance: z.number().min(1).max(10).optional(),
        expiresAt: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const db_instance = await getDb();
      if (db_instance) {
        await db_instance.insert(agentMemory).values({
          agentId: input.agentId,
          sessionId: input.sessionId,
          memoryType: input.memoryType as any,
          key: input.key,
          value: input.value,
          importance: input.importance || 5,
          expiresAt: input.expiresAt,
        } as any);
      }

      return { success: true };
    }),

  // Retrieve agent memory
  getMemory: protectedProcedure
    .input(z.object({ agentId: z.number(), sessionId: z.number(), memoryType: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const memories = await db
        .select()
        .from(agentMemory)
        .where(
          input.memoryType
            ? and(eq(agentMemory.agentId, input.agentId), eq(agentMemory.sessionId, input.sessionId), eq(agentMemory.memoryType, input.memoryType as any))
            : and(eq(agentMemory.agentId, input.agentId), eq(agentMemory.sessionId, input.sessionId))
        )
        .orderBy(desc(agentMemory.importance));

      return memories;
    }),

  // Register agent tool
  registerTool: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        toolName: z.string(),
        toolType: z.enum(["api", "database", "file_system", "computation", "external_service"]),
        description: z.string().optional(),
        endpoint: z.string().optional(),
        parameters: z.record(z.string(), z.any()).optional(),
        rateLimit: z.number().optional(),
        timeout: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(agentTools).values({
        agentId: input.agentId,
        toolName: input.toolName,
        toolType: input.toolType as any,
        description: input.description,
        endpoint: input.endpoint,
        parameters: input.parameters || {},
        rateLimit: input.rateLimit,
        timeout: input.timeout || 30000,
      } as any);

      return { success: true };
    }),

  // Log agent execution
  logExecution: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        sessionId: z.number(),
        executionType: z.enum(["task", "tool_call", "reasoning_step", "decision_point"]),
        input: z.string(),
        output: z.string(),
        status: z.enum(["pending", "running", "success", "failed", "timeout"]),
        errorMessage: z.string().optional(),
        executionTime: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(agentExecutionLogs).values({
        agentId: input.agentId,
        sessionId: input.sessionId,
        executionType: input.executionType as any,
        input: input.input,
        output: input.output,
        status: input.status as any,
        errorMessage: input.errorMessage,
        executionTime: input.executionTime,
      } as any);

      return { success: true };
    }),

  // Store reasoning chain
  storeReasoningChain: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        sessionId: z.number(),
        chainType: z.enum(["chain_of_thought", "tree_of_thought", "graph_of_thought"]),
        steps: z.array(
          z.object({
            step: z.number(),
            thought: z.string(),
            action: z.string(),
            result: z.string(),
          })
        ),
        finalConclusion: z.string(),
        confidence: z.number().min(0).max(100),
        tokensUsed: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(reasoningChains).values({
        agentId: input.agentId,
        sessionId: input.sessionId,
        chainType: input.chainType as any,
        steps: input.steps as any,
        finalConclusion: input.finalConclusion,
        confidence: input.confidence.toString() as any,
        tokensUsed: input.tokensUsed || 0,
      } as any);

      return { success: true };
    }),

  // Record agent collaboration
  recordCollaboration: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        initiatorAgentId: z.number(),
        collaboratorAgentId: z.number(),
        collaborationType: z.enum(["sequential", "parallel", "hierarchical", "peer"]),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(agentCollaboration).values({
        sessionId: input.sessionId,
        initiatorAgentId: input.initiatorAgentId,
        collaboratorAgentId: input.collaboratorAgentId,
        collaborationType: input.collaborationType as any,
        message: input.message,
        status: "pending",
      } as any);

      return { success: true };
    }),

  // Update agent performance metrics
  updatePerformanceMetrics: protectedProcedure
    .input(
      z.object({
        agentId: z.number(),
        taskSuccessRate: z.number().optional(),
        averageExecutionTime: z.number().optional(),
        totalTasksCompleted: z.number().optional(),
        totalTasksFailed: z.number().optional(),
        uptime: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const existing = await db.select().from(agentPerformanceMetrics).where(eq(agentPerformanceMetrics.agentId, input.agentId)).limit(1);

      const updates: any = {};
      if (input.taskSuccessRate !== undefined) updates.taskSuccessRate = input.taskSuccessRate.toString();
      if (input.averageExecutionTime !== undefined) updates.averageExecutionTime = input.averageExecutionTime;
      if (input.totalTasksCompleted !== undefined) updates.totalTasksCompleted = input.totalTasksCompleted;
      if (input.totalTasksFailed !== undefined) updates.totalTasksFailed = input.totalTasksFailed;
      if (input.uptime !== undefined) updates.uptime = input.uptime.toString();

      if (existing.length > 0) {
        await db.update(agentPerformanceMetrics).set(updates).where(eq(agentPerformanceMetrics.agentId, input.agentId));
      } else {
        await db.insert(agentPerformanceMetrics).values({
          agentId: input.agentId,
          ...updates,
        } as any);
      }

      return { success: true };
    }),

  // Get agent performance metrics
  getPerformanceMetrics: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const metrics = await db.select().from(agentPerformanceMetrics).where(eq(agentPerformanceMetrics.agentId, input.agentId)).limit(1);

      return metrics[0] || null;
    }),

  // Get execution history
  getExecutionHistory: protectedProcedure
    .input(z.object({ agentId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const logs = await db
        .select()
        .from(agentExecutionLogs)
        .where(eq(agentExecutionLogs.agentId, input.agentId))
        .orderBy(desc(agentExecutionLogs.createdAt))
        .limit(input.limit);

      return logs;
    }),

  // Get agent health status
  getHealthStatus: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const metrics = await db.select().from(agentPerformanceMetrics).where(eq(agentPerformanceMetrics.agentId, input.agentId)).limit(1);

      if (!metrics[0]) return { status: "unknown", uptime: 0, lastCheck: null };

      const metric = metrics[0];
      const uptime = parseFloat(metric.uptime?.toString() || "0");
      const status = uptime > 95 ? "healthy" : uptime > 80 ? "degraded" : "unhealthy";

      return {
        status,
        uptime,
        lastCheck: metric.lastHealthCheck,
        successRate: parseFloat(metric.taskSuccessRate?.toString() || "0"),
        avgExecutionTime: metric.averageExecutionTime,
      };
    }),
});
