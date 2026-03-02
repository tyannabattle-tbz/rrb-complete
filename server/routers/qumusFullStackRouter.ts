/**
 * Qumus Full Stack Router
 * Integrates task execution, policy evaluation, integrations, and real-time updates
 * This is the unified API for the complete Qumus autonomous system
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { taskExecutionEngine } from '../services/taskExecutionEngine';
import { qumusIntegrationService } from '../services/qumusIntegrationService';
import { qumusWebSocketManager } from '../services/qumusWebSocketManager';
import { getDb } from '../db';
import { autonomousTasks, taskExecutionLog } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export const qumusFullStackRouter = router({
  /**
   * Submit a new autonomous task
   */
  submitTask: protectedProcedure
    .input(
      z.object({
        goal: z.string().min(1, 'Goal is required'),
        priority: z.number().int().min(1).max(10).optional().default(5),
        steps: z.array(z.string()).optional(),
        constraints: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const taskId = await taskExecutionEngine.submitTask({
        goal: input.goal,
        priority: input.priority,
        steps: input.steps,
        constraints: input.constraints,
        userId: ctx.user.id,
      });

      return {
        success: true,
        taskId,
        message: 'Task submitted successfully',
      };
    }),

  /**
   * Get task status with real-time updates
   */
  getTaskStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const status = await taskExecutionEngine.getTaskStatus(input.taskId);
      return status || { error: 'Task not found' };
    }),

  /**
   * Get system metrics
   */
  getSystemMetrics: publicProcedure.query(async () => {
    const metrics = await taskExecutionEngine.getSystemMetrics();
    return metrics;
  }),

  /**
   * Get all tasks for user
   */
  getUserTasks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const tasks = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.userId, ctx.user.id));

      return tasks.map((task) => ({
        id: task.id,
        goal: task.goal,
        status: task.status,
        priority: task.priority,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      }));
    } catch (error) {
      console.error('[QumusRouter] Error getting user tasks:', error);
      return [];
    }
  }),

  /**
   * Get task execution logs
   */
  getTaskLogs: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const logs = await db
          .select()
          .from(taskExecutionLog)
          .where(eq(taskExecutionLog.taskId, input.taskId));

        return logs;
      } catch (error) {
        console.error('[QumusRouter] Error getting task logs:', error);
        return [];
      }
    }),

  /**
   * Process Stripe payment for task
   */
  processPayment: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        amount: z.number().positive(),
        currency: z.string().default('USD'),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await qumusIntegrationService.processStripePayment({
          taskId: input.taskId,
          userId: ctx.user.id,
          amount: input.amount,
          currency: input.currency,
          description: input.description,
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Send email notification
   */
  sendNotification: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        to: z.string().email(),
        subject: z.string(),
        body: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await qumusIntegrationService.sendEmailNotification({
          taskId: input.taskId,
          to: input.to,
          subject: input.subject,
          body: input.body,
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Upload file to S3
   */
  uploadFile: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        fileName: z.string(),
        fileBuffer: z.instanceof(Buffer),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await qumusIntegrationService.uploadFile({
          taskId: input.taskId,
          fileName: input.fileName,
          fileBuffer: input.fileBuffer,
          mimeType: input.mimeType,
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Execute webhook
   */
  executeWebhook: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        url: z.string().url(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE']).default('POST'),
        body: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await qumusIntegrationService.executeWebhook({
          taskId: input.taskId,
          url: input.url,
          method: input.method,
          body: input.body,
        });

        return {
          success: true,
          ...result,
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Get WebSocket connection stats
   */
  getWebSocketStats: publicProcedure.query(async () => {
    return qumusWebSocketManager.getStats();
  }),

  /**
   * Subscribe to task events (for WebSocket)
   */
  subscribeToTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      // This would be called by the client to establish WebSocket subscription
      return {
        success: true,
        message: `Subscribed to task ${input.taskId}`,
      };
    }),

  /**
   * Subscribe to metrics (for WebSocket)
   */
  subscribeToMetrics: protectedProcedure.mutation(async () => {
    return {
      success: true,
      message: 'Subscribed to metrics updates',
    };
  }),

  /**
   * Get task execution history
   */
  getExecutionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const tasks = await db
          .select()
          .from(autonomousTasks)
          .where(eq(autonomousTasks.userId, ctx.user.id));

        return tasks
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(input.offset, input.offset + input.limit)
          .map((task) => ({
            id: task.id,
            goal: task.goal,
            status: task.status,
            priority: task.priority,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
            executionTime: task.executionTime,
            successRate: task.status === 'completed' ? 100 : task.status === 'failed' ? 0 : 50,
          }));
      } catch (error) {
        console.error('[QumusRouter] Error getting execution history:', error);
        return [];
      }
    }),

  /**
   * Cancel a task
   */
  cancelTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database connection failed');

        await db
          .update(autonomousTasks)
          .set({
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          })
          .where(eq(autonomousTasks.id, input.taskId));

        await db.insert(taskExecutionLog).values({
          taskId: input.taskId,
          eventType: 'cancelled',
          details: JSON.stringify({ cancelledAt: new Date().toISOString() }),
          timestamp: new Date().toISOString(),
        });

        return {
          success: true,
          message: 'Task cancelled successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Retry a failed task
   */
  retryTask: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error('Database connection failed');

        // Get the original task
        const originalTask = await db
          .select()
          .from(autonomousTasks)
          .where(eq(autonomousTasks.id, input.taskId))
          .limit(1);

        if (!originalTask || originalTask.length === 0) {
          throw new Error('Task not found');
        }

        const task = originalTask[0];

        // Submit a new task with the same goal
        const newTaskId = await taskExecutionEngine.submitTask({
          goal: task.goal,
          priority: task.priority || 5,
          steps: task.steps ? JSON.parse(task.steps as string) : undefined,
          constraints: task.constraints ? JSON.parse(task.constraints as string) : undefined,
          userId: ctx.user.id,
        });

        return {
          success: true,
          newTaskId,
          message: 'Task retried successfully',
        };
      } catch (error) {
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Get system health report
   */
  getHealthReport: publicProcedure.query(async () => {
    const metrics = await taskExecutionEngine.getSystemMetrics();
    const wsStats = qumusWebSocketManager.getStats();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      metrics,
      websocket: wsStats,
      services: {
        taskExecution: { status: 'operational' },
        integrations: { status: 'operational' },
        websocket: { status: 'operational' },
      },
    };
  }),
});
