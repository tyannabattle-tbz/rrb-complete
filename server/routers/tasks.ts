import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
// Database imports handled within procedures
import { executePolicies } from '../qumusPolicies';
import { uploadTaskArtifact, processTaskCompletion } from '../taskArtifactsService';
// Email service handled within procedures

export const tasksRouter = router({
  /**
   * Submit autonomous task
   */
  submitTask: protectedProcedure
    .input(
      z.object({
        goal: z.string().min(10).max(5000),
        priority: z.number().min(1).max(10),
        persona: z.enum(['analytical', 'creative', 'aggressive', 'conservative']).optional(),
        attachments: z.array(z.object({ fileKey: z.string(), fileName: z.string() })).optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Create task record
        const taskResult = await db.insert('tasks').values({
          userId: ctx.user.id,
          goal: input.goal,
          priority: input.priority,
          persona: input.persona || 'analytical',
          status: 'pending',
          createdAt: new Date(),
          metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        });

        const taskId = taskResult.insertId.toString();

        // Execute policies for task validation
        const policyDecisions = await executePolicies({
          action: 'submit_task',
          userId: ctx.user.id,
          taskId,
          goal: input.goal,
          priority: input.priority,
          timestamp: new Date(),
        });

        // Check if any policy requires human review
        const requiresReview = policyDecisions.some((d) => d.requiresHumanReview);

        if (requiresReview) {
          // Create human review task
          await db.insert('human_reviews').values({
            userId: ctx.user.id,
            type: 'task_submission',
            data: JSON.stringify({
              taskId,
              goal: input.goal,
              priority: input.priority,
              policyDecisions,
            }),
            status: 'pending',
            createdAt: new Date(),
          });

          // Update task status
          await db.query('UPDATE tasks SET status = ? WHERE id = ?', ['pending_review', taskId]);

          return {
            taskId,
            status: 'pending_review',
            message: 'Task submitted and awaiting human review',
            policyDecisions,
          };
        }

        // Check if all policies approved
        const allApproved = policyDecisions.every((d) => d.decision === 'approve');

        if (!allApproved) {
          // Update task status to denied
          await db.query('UPDATE tasks SET status = ? WHERE id = ?', ['denied', taskId]);

          return {
            taskId,
            status: 'denied',
            message: 'Task submission denied by policies',
            policyDecisions,
          };
        }

        // Update task status to queued
        await db.query('UPDATE tasks SET status = ? WHERE id = ?', ['queued', taskId]);

        // Send confirmation email
        await emailService.sendTaskSubmissionConfirmation(ctx.user.email, {
          taskId,
          goal: input.goal,
          priority: input.priority,
        });

        return {
          taskId,
          status: 'queued',
          message: 'Task submitted successfully and queued for execution',
          policyDecisions,
        };
      } catch (error) {
        console.error('Failed to submit task:', error);
        throw error;
      }
    }),

  /**
   * Execute task (autonomous)
   */
  executeTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get task
        const tasks = await db.query('SELECT * FROM tasks WHERE id = ? AND userId = ?', [
          input.taskId,
          ctx.user.id,
        ]);

        if (tasks.length === 0) {
          throw new Error('Task not found');
        }

        const task = tasks[0];

        if (task.status !== 'queued') {
          throw new Error(`Task cannot be executed in status: ${task.status}`);
        }

        // Update status to executing
        await db.query('UPDATE tasks SET status = ?, startedAt = NOW() WHERE id = ?', [
          'executing',
          input.taskId,
        ]);

        // Execute policies for task execution
        const policyDecisions = await executePolicies({
          action: 'execute_task',
          userId: ctx.user.id,
          taskId: input.taskId,
          goal: task.goal,
          timestamp: new Date(),
        });

        // Simulate task execution (in real scenario, this would call actual task logic)
        const taskOutput = {
          taskId: input.taskId,
          goal: task.goal,
          status: 'completed',
          result: `Task execution completed: ${task.goal}`,
          executedAt: new Date(),
          executionTime: Math.random() * 300, // seconds
          metrics: {
            cpuUsage: Math.random() * 100,
            memoryUsage: Math.random() * 100,
            storageUsed: Math.random() * 1000,
          },
        };

        // Upload task artifacts
        const artifacts = await processTaskCompletion(input.taskId, ctx.user.id, taskOutput);

        // Update task status to completed
        await db.query(
          'UPDATE tasks SET status = ?, completedAt = NOW(), result = ?, artifactCount = ? WHERE id = ?',
          ['completed', JSON.stringify(taskOutput), artifacts.length, input.taskId]
        );

        // Send completion email with artifact links
        await emailService.sendTaskCompletionNotification(ctx.user.email, {
          taskId: input.taskId,
          goal: task.goal,
          artifacts,
          executionTime: taskOutput.executionTime,
        });

        return {
          taskId: input.taskId,
          status: 'completed',
          result: taskOutput,
          artifacts,
          policyDecisions,
        };
      } catch (error) {
        console.error('Failed to execute task:', error);

        // Update task status to failed
        await db.query('UPDATE tasks SET status = ?, failedAt = NOW() WHERE id = ?', [
          'failed',
          input.taskId,
        ]);

        throw error;
      }
    }),

  /**
   * Get task status
   */
  getTaskStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const tasks = await db.query('SELECT * FROM tasks WHERE id = ? AND userId = ?', [
          input.taskId,
          ctx.user.id,
        ]);

        if (tasks.length === 0) {
          throw new Error('Task not found');
        }

        const task = tasks[0];

        return {
          id: task.id,
          goal: task.goal,
          status: task.status,
          priority: task.priority,
          persona: task.persona,
          createdAt: new Date(task.createdAt),
          startedAt: task.startedAt ? new Date(task.startedAt) : null,
          completedAt: task.completedAt ? new Date(task.completedAt) : null,
          result: task.result ? JSON.parse(task.result) : null,
          artifactCount: task.artifactCount || 0,
        };
      } catch (error) {
        console.error('Failed to get task status:', error);
        throw error;
      }
    }),

  /**
   * Get task history
   */
  getTaskHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['pending', 'queued', 'executing', 'completed', 'failed', 'denied']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        let query = 'SELECT * FROM tasks WHERE userId = ?';
        const params: any[] = [ctx.user.id];

        if (input.status) {
          query += ' AND status = ?';
          params.push(input.status);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(input.limit, input.offset);

        const tasks = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM tasks WHERE userId = ?';
        const countParams: any[] = [ctx.user.id];

        if (input.status) {
          countQuery += ' AND status = ?';
          countParams.push(input.status);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        return {
          tasks: tasks.map((t: any) => ({
            id: t.id,
            goal: t.goal,
            status: t.status,
            priority: t.priority,
            persona: t.persona,
            createdAt: new Date(t.createdAt),
            startedAt: t.startedAt ? new Date(t.startedAt) : null,
            completedAt: t.completedAt ? new Date(t.completedAt) : null,
            artifactCount: t.artifactCount || 0,
          })),
          total,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error('Failed to get task history:', error);
        throw error;
      }
    }),

  /**
   * Cancel task
   */
  cancelTask: protectedProcedure
    .input(z.object({ taskId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const tasks = await db.query('SELECT * FROM tasks WHERE id = ? AND userId = ?', [
          input.taskId,
          ctx.user.id,
        ]);

        if (tasks.length === 0) {
          throw new Error('Task not found');
        }

        const task = tasks[0];

        if (!['pending', 'queued'].includes(task.status)) {
          throw new Error(`Cannot cancel task in status: ${task.status}`);
        }

        // Update task status
        await db.query('UPDATE tasks SET status = ?, cancelledAt = NOW() WHERE id = ?', [
          'cancelled',
          input.taskId,
        ]);

        // Send cancellation email
        await emailService.sendTaskCancellationNotification(ctx.user.email, {
          taskId: input.taskId,
          goal: task.goal,
          reason: input.reason,
        });

        return { success: true, message: 'Task cancelled successfully' };
      } catch (error) {
        console.error('Failed to cancel task:', error);
        throw error;
      }
    }),

  /**
   * Get task metrics
   */
  getTaskMetrics: protectedProcedure.query(async ({ ctx }) => {
    try {
      const metrics = await db.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
          SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
          AVG(priority) as avgPriority
        FROM tasks
        WHERE userId = ?`,
        [ctx.user.id]
      );

      const result = metrics[0] || {};

      return {
        total: result.total || 0,
        completed: result.completed || 0,
        failed: result.failed || 0,
        queued: result.queued || 0,
        avgPriority: Math.round((result.avgPriority || 0) * 10) / 10,
        successRate: result.total > 0 ? Math.round(((result.completed || 0) / result.total) * 100) : 0,
      };
    } catch (error) {
      console.error('Failed to get task metrics:', error);
      throw error;
    }
  }),
});
