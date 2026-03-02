import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { batchQueues, batchJobs } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const batchRouter = router({
  // Get all queues for user
  getQueues: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const queues = await db
        .select()
        .from(batchQueues)
        .where(eq(batchQueues.userId, ctx.user.id));

      return queues.map((q) => ({
        id: q.id,
        name: q.name,
        totalJobs: q.totalJobs || 0,
        completedJobs: q.completedJobs || 0,
        failedJobs: q.failedJobs || 0,
        isPaused: q.isPaused || false,
        jobs: [],
      }));
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch queues",
      });
    }
  }),

  // Create new queue
  createQueue: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(batchQueues).values({
          userId: ctx.user.id,
          name: input.name,
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          isPaused: false,
        });

        return {
          id: result[0].insertId || 1,
          name: input.name,
          totalJobs: 0,
          completedJobs: 0,
          failedJobs: 0,
          isPaused: false,
          jobs: [],
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create queue",
        });
      }
    }),

  // Add job to queue
  addJob: protectedProcedure
    .input(
      z.object({
        queueId: z.number(),
        title: z.string(),
        priority: z.enum(["low", "medium", "high", "critical"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(batchJobs).values({
          queueId: input.queueId,
          userId: ctx.user.id,
          title: input.title,
          priority: input.priority,
          status: "pending",
          progress: 0,
          estimatedTime: 60,
          elapsedTime: 0,
          retryCount: 0,
          maxRetries: 3,
        });

        // Update queue job count
        const queue = await db
          .select()
          .from(batchQueues)
          .where(eq(batchQueues.id, input.queueId))
          .limit(1);

        if (queue.length > 0) {
          await db
            .update(batchQueues)
            .set({ totalJobs: (queue[0].totalJobs || 0) + 1 })
            .where(eq(batchQueues.id, input.queueId));
        }

        return {
          id: result[0].insertId || 1,
          title: input.title,
          status: "pending",
          priority: input.priority,
          progress: 0,
          estimatedTime: 60,
          elapsedTime: 0,
          createdAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add job",
        });
      }
    }),

  // Add bulk jobs
  addBulkJobs: protectedProcedure
    .input(z.object({ queueId: z.number(), count: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const jobs = [];
        for (let i = 0; i < input.count; i++) {
          jobs.push({
            queueId: input.queueId,
            userId: ctx.user.id,
            title: `Batch Job ${i + 1}`,
            priority: "medium" as const,
            status: "pending" as const,
            progress: 0,
            estimatedTime: 60,
            elapsedTime: 0,
            retryCount: 0,
            maxRetries: 3,
          });
        }

        await db.insert(batchJobs).values(jobs);

        // Update queue job count
        const queue = await db
          .select()
          .from(batchQueues)
          .where(eq(batchQueues.id, input.queueId))
          .limit(1);

        if (queue.length > 0) {
          await db
            .update(batchQueues)
            .set({ totalJobs: (queue[0].totalJobs || 0) + input.count })
            .where(eq(batchQueues.id, input.queueId));
        }

        return jobs.map((j, i) => ({
          id: i,
          title: j.title,
          status: j.status,
          priority: j.priority,
          progress: 0,
          estimatedTime: 60,
          elapsedTime: 0,
          createdAt: new Date(),
        }));
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add bulk jobs",
        });
      }
    }),

  // Pause queue
  pauseQueue: protectedProcedure
    .input(z.object({ queueId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(batchQueues)
          .set({ isPaused: true })
          .where(eq(batchQueues.id, input.queueId));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to pause queue",
        });
      }
    }),

  // Resume queue
  resumeQueue: protectedProcedure
    .input(z.object({ queueId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(batchQueues)
          .set({ isPaused: false })
          .where(eq(batchQueues.id, input.queueId));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to resume queue",
        });
      }
    }),

  // Cancel job
  cancelJob: protectedProcedure
    .input(z.string())
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db
          .update(batchJobs)
          .set({ status: "cancelled" })
          .where(eq(batchJobs.id, parseInt(input)));

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel job",
        });
      }
    }),
});
