/**
 * Task Execution Engine
 * Handles autonomous task queuing, execution, and monitoring
 */

import { getDb } from "../db";
import { autonomousTasks, taskSteps, taskExecutionLog, systemMetrics } from "../../drizzle/schema";
import { eq, desc, and, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export interface TaskInput {
  goal: string;
  priority?: number;
  steps?: string[];
  constraints?: string[];
  userId: number;
}

export interface TaskExecution {
  id: string;
  goal: string;
  status: "queued" | "executing" | "completed" | "failed" | "cancelled";
  progress: number;
  result?: any;
  error?: string;
}

class TaskExecutionEngine {
  private executingTasks = new Map<string, boolean>();
  private taskQueue: string[] = [];

  /**
   * Submit a new autonomous task
   */
  async submitTask(input: TaskInput): Promise<string> {
    const taskId = uuidv4();
    const now = new Date();

    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Create task record
      await db.insert(autonomousTasks).values({
        id: taskId,
        userId: input.userId,
        goal: input.goal,
        priority: input.priority || 5,
        status: "queued",
        steps: input.steps ? JSON.stringify(input.steps) : null,
        constraints: input.constraints ? JSON.stringify(input.constraints) : null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      // Create task steps if provided
      if (input.steps && input.steps.length > 0) {
        for (let i = 0; i < input.steps.length; i++) {
          await db.insert(taskSteps).values({
            id: `${taskId}-step-${i}`,
            taskId,
            stepNumber: i + 1,
            description: input.steps[i],
            status: "pending",
            createdAt: now.toISOString(),
          });
        }
      }

      // Log submission
      await db.insert(taskExecutionLog).values({
        taskId,
        eventType: "submitted",
        details: JSON.stringify({ goal: input.goal, priority: input.priority }),
        timestamp: now.toISOString(),
      });

      // Add to queue
      this.taskQueue.push(taskId);

      // Start processing
      this.processQueue();

      return taskId;
    } catch (error) {
      console.error("[TaskEngine] Error submitting task:", error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId: string): Promise<TaskExecution | null> {
    try {
      const db = await getDb();
      if (!db) return null;
      
      const task = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.id, taskId))
        .limit(1);

      if (!task || task.length === 0) return null;

      const t = task[0];
      const steps = await db
        .select()
        .from(taskSteps)
        .where(eq(taskSteps.taskId, taskId));

      const completedSteps = steps.filter((s) => s.status === "completed").length;
      const progress = steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

      return {
        id: t.id,
        goal: t.goal,
        status: t.status as any,
        progress,
        result: t.result ? JSON.parse(t.result as string) : undefined,
        error: t.error || undefined,
      };
    } catch (error) {
      console.error("[TaskEngine] Error getting task status:", error);
      return null;
    }
  }

  /**
   * Get active tasks count
   */
  async getActiveTaskCount(): Promise<number> {
    try {
      const db = await getDb();
      if (!db) return 0;
      
      const result = await db
        .select()
        .from(autonomousTasks)
        .where(
          and(
            eq(autonomousTasks.status, "executing"),
            eq(autonomousTasks.status, "queued")
          )
        );
      return result.length;
    } catch (error) {
      console.error("[TaskEngine] Error getting active task count:", error);
      return 0;
    }
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics() {
    try {
      const db = await getDb();
      if (!db) return { activeTaskCount: 0, queuedTaskCount: 0, successRate: 0, averageExecutionTime: 0, totalTasksProcessed: 0, failedTaskCount: 0 };
      
      const executing = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, "executing"));

      const queued = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, "queued"));

      const completed = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, "completed"));

      const failed = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, "failed"));

      const total = completed.length + failed.length;
      const successRate = total > 0 ? (completed.length / total) * 100 : 0;

      const avgExecutionTime =
        completed.length > 0
          ? completed.reduce((sum, t) => sum + (t.executionTime || 0), 0) / completed.length
          : 0;

      const metrics = {
        activeTaskCount: executing.length,
        queuedTaskCount: queued.length,
        successRate: Math.round(successRate * 100) / 100,
        averageExecutionTime: Math.round(avgExecutionTime),
        totalTasksProcessed: total,
        failedTaskCount: failed.length,
      };

      // Store metrics
      await db.insert(systemMetrics).values({
        timestamp: new Date().toISOString(),
        activeTaskCount: metrics.activeTaskCount,
        queuedTaskCount: metrics.queuedTaskCount,
        successRate: metrics.successRate,
        averageExecutionTime: metrics.averageExecutionTime,
        totalTasksProcessed: metrics.totalTasksProcessed,
        failedTaskCount: metrics.failedTaskCount,
      });

      return metrics;
    } catch (error) {
      console.error("[TaskEngine] Error getting system metrics:", error);
      return {
        activeTaskCount: 0,
        queuedTaskCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        totalTasksProcessed: 0,
        failedTaskCount: 0,
      };
    }
  }

  /**
   * Process task queue
   */
  private async processQueue() {
    while (this.taskQueue.length > 0) {
      const taskId = this.taskQueue.shift();
      if (!taskId) break;

      if (this.executingTasks.get(taskId)) continue;

      this.executingTasks.set(taskId, true);
      await this.executeTask(taskId);
      this.executingTasks.set(taskId, false);
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(taskId: string) {
    const startTime = Date.now();

    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");
      
      // Update task status to executing
      await db
        .update(autonomousTasks)
        .set({
          status: "executing",
          startedAt: new Date().toISOString(),
        })
        .where(eq(autonomousTasks.id, taskId));

      // Log execution start
      await db.insert(taskExecutionLog).values({
        taskId,
        eventType: "started",
        timestamp: new Date().toISOString(),
      });

      // Get task details
      const taskResult = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.id, taskId))
        .limit(1);

      if (!taskResult || taskResult.length === 0) {
        throw new Error("Task not found");
      }

      const task = taskResult[0];
      const steps = await db
        .select()
        .from(taskSteps)
        .where(eq(taskSteps.taskId, taskId));

      // Execute steps
      let result: any = { goal: task.goal };

      if (steps.length > 0) {
        for (const step of steps) {
          try {
            // Update step status
            await db
              .update(taskSteps)
              .set({ status: "executing", startedAt: new Date().toISOString() })
              .where(eq(taskSteps.id, step.id));

            // Simulate step execution
            const stepResult = await this.executeStep(step.description);

            // Update step with result
            await db
              .update(taskSteps)
              .set({
                status: "completed",
                result: JSON.stringify(stepResult),
                completedAt: new Date().toISOString(),
                executionTime: Date.now() - startTime,
              })
              .where(eq(taskSteps.id, step.id));

            // Log step completion
            await db.insert(taskExecutionLog).values({
              taskId,
              eventType: "step_completed",
              details: JSON.stringify({ stepNumber: step.stepNumber, result: stepResult }),
              timestamp: new Date().toISOString(),
            });

            result[`step_${step.stepNumber}`] = stepResult;
          } catch (error) {
            // Mark step as failed
            await db
              .update(taskSteps)
              .set({
                status: "failed",
                error: String(error),
                completedAt: new Date().toISOString(),
              })
              .where(eq(taskSteps.id, step.id));

            throw error;
          }
        }
      } else {
        // No steps, just execute the goal
        result = await this.executeStep(task.goal);
      }

      // Mark task as completed
      const executionTime = Date.now() - startTime;
      await db
        .update(autonomousTasks)
        .set({
          status: "completed",
          result: JSON.stringify(result),
          completedAt: new Date().toISOString(),
          executionTime,
        })
        .where(eq(autonomousTasks.id, taskId));

      // Log completion
      await db.insert(taskExecutionLog).values({
        taskId,
        eventType: "completed",
        details: JSON.stringify({ executionTime, result }),
        timestamp: new Date().toISOString(),
      });

      console.log(`[TaskEngine] Task ${taskId} completed in ${executionTime}ms`);
    } catch (error) {
      console.error(`[TaskEngine] Task ${taskId} failed:`, error);

      const executionTime = Date.now() - startTime;
      await db
        .update(autonomousTasks)
        .set({
          status: "failed",
          error: String(error),
          completedAt: new Date().toISOString(),
          executionTime,
        })
        .where(eq(autonomousTasks.id, taskId));

      // Log failure
      await db.insert(taskExecutionLog).values({
        taskId,
        eventType: "failed",
        details: JSON.stringify({ error: String(error) }),
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Execute a single step (placeholder implementation)
   */
  private async executeStep(description: string): Promise<any> {
    // Simulate step execution with delay
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1000));

    return {
      description,
      executed: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export const taskExecutionEngine = new TaskExecutionEngine();
