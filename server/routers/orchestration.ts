import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { orchestrationTasks, swarmCoordination, orchestrationResults, conflictResolution, agentRegistry } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const orchestrationRouter = router({
  // Create orchestration task
  createTask: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        taskName: z.string(),
        description: z.string().optional(),
        orchestrationType: z.enum(["sequential", "parallel", "hierarchical", "swarm"]),
        agentIds: z.array(z.number()),
        priority: z.number().min(1).max(10).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(orchestrationTasks).values({
        sessionId: input.sessionId,
        taskName: input.taskName,
        description: input.description,
        orchestrationType: input.orchestrationType as any,
        assignedAgents: input.agentIds,
        priority: input.priority || 5,
        status: "pending" as any,
      } as any);

      return { success: true };
    }),

  // Get orchestration tasks
  getTasks: protectedProcedure
    .input(z.object({ sessionId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const tasks = await db
        .select()
        .from(orchestrationTasks)
        .where(eq(orchestrationTasks.sessionId, input.sessionId))
        .orderBy(desc(orchestrationTasks.createdAt))
        .limit(input.limit);

      return tasks;
    }),

  // Start orchestration task
  startTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.update(orchestrationTasks).set({ status: "running" as any, startTime: new Date() }).where(eq(orchestrationTasks.id, input.taskId));

      return { success: true };
    }),

  // Complete orchestration task
  completeTask: protectedProcedure
    .input(z.object({ taskId: z.number(), result: z.record(z.any()).optional() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(orchestrationTasks)
        .set({ status: "completed" as any, endTime: new Date(), result: input.result })
        .where(eq(orchestrationTasks.id, input.taskId));

      return { success: true };
    }),

  // Assign agent to swarm
  assignAgentToSwarm: protectedProcedure
    .input(
      z.object({
        orchestrationTaskId: z.number(),
        agentId: z.number(),
        role: z.enum(["leader", "worker", "monitor", "coordinator"]),
        taskAssignment: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(swarmCoordination).values({
        orchestrationTaskId: input.orchestrationTaskId,
        agentId: input.agentId,
        role: input.role as any,
        taskAssignment: input.taskAssignment || {},
        status: "idle" as any,
      } as any);

      return { success: true };
    }),

  // Get swarm coordination status
  getSwarmStatus: protectedProcedure
    .input(z.object({ orchestrationTaskId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const swarmMembers = await db
        .select()
        .from(swarmCoordination)
        .where(eq(swarmCoordination.orchestrationTaskId, input.orchestrationTaskId));

      return swarmMembers;
    }),

  // Record agent result
  recordResult: protectedProcedure
    .input(
      z.object({
        orchestrationTaskId: z.number(),
        agentId: z.number(),
        resultData: z.record(z.any()),
        executionTime: z.number().optional(),
        tokensUsed: z.number().optional(),
        cost: z.number().optional(),
        status: z.enum(["success", "partial", "failed"]),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(orchestrationResults).values({
        orchestrationTaskId: input.orchestrationTaskId,
        agentId: input.agentId,
        resultData: input.resultData,
        executionTime: input.executionTime,
        tokensUsed: input.tokensUsed || 0,
        cost: input.cost?.toString() as any,
        status: input.status as any,
        errorMessage: input.errorMessage,
      } as any);

      return { success: true };
    }),

  // Get aggregated results
  getAggregatedResults: protectedProcedure
    .input(z.object({ orchestrationTaskId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const results = await db
        .select()
        .from(orchestrationResults)
        .where(eq(orchestrationResults.orchestrationTaskId, input.orchestrationTaskId));

      const totalCost = results.reduce((sum: number, r: any) => sum + parseFloat(r.cost?.toString() || "0"), 0);
      const totalTokens = results.reduce((sum: number, r: any) => sum + (r.tokensUsed || 0), 0);
      const successCount = results.filter((r: any) => r.status === "success").length;

      return {
        results,
        summary: {
          totalCost,
          totalTokens,
          successCount,
          totalCount: results.length,
          successRate: (successCount / results.length) * 100,
        },
      };
    }),

  // Record conflict resolution
  recordConflict: protectedProcedure
    .input(
      z.object({
        orchestrationTaskId: z.number(),
        agentId1: z.number(),
        agentId2: z.number(),
        conflictType: z.string(),
        resolution: z.enum(["agent1_priority", "agent2_priority", "merge", "retry", "escalate"]),
        details: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(conflictResolution).values({
        orchestrationTaskId: input.orchestrationTaskId,
        agentId1: input.agentId1,
        agentId2: input.agentId2,
        conflictType: input.conflictType,
        resolution: input.resolution as any,
        details: input.details || {},
        resolvedAt: new Date(),
      } as any);

      return { success: true };
    }),

  // Get orchestration analytics
  getAnalytics: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const tasks = await db.select().from(orchestrationTasks).where(eq(orchestrationTasks.sessionId, input.sessionId));

      const completedTasks = tasks.filter((t: any) => t.status === "completed");
      const failedTasks = tasks.filter((t: any) => t.status === "failed");

      const totalExecutionTime = completedTasks.reduce((sum: number, t: any) => {
        if (t.startTime && t.endTime) {
          return sum + (new Date(t.endTime).getTime() - new Date(t.startTime).getTime());
        }
        return sum;
      }, 0);

      return {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        failedTasks: failedTasks.length,
        successRate: (completedTasks.length / tasks.length) * 100,
        averageExecutionTime: completedTasks.length > 0 ? totalExecutionTime / completedTasks.length : 0,
      };
    }),
});
