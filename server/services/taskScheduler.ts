import { getDb } from '../db';
import { v4 as uuid } from 'uuid';
import { taskExecutionEngine } from './taskExecutionEngine';
import { notificationService } from './notificationService';

export interface ScheduledTask {
  id: string;
  userId: string;
  goal: string;
  priority: number;
  cronExpression: string;
  enabled: boolean;
  lastExecutedAt?: number;
  nextExecutionAt: number;
  executionCount: number;
  failureCount: number;
  createdAt: number;
  updatedAt: number;
}

class TaskScheduler {
  private schedules: Map<string, NodeJS.Timeout> = new Map();
  private tasks: Map<string, ScheduledTask> = new Map();

  /**
   * Initialize scheduler - load all scheduled tasks from database
   */
  async initialize(): Promise<void> {
    try {
      const db = await getDb();
      const rows = await db.all(
        `SELECT * FROM scheduled_tasks WHERE enabled = 1`
      );

      for (const row of rows) {
        const task: ScheduledTask = {
          id: row.id,
          userId: row.user_id,
          goal: row.goal,
          priority: row.priority,
          cronExpression: row.cron_expression,
          enabled: row.enabled === 1,
          lastExecutedAt: row.last_executed_at,
          nextExecutionAt: row.next_execution_at,
          executionCount: row.execution_count,
          failureCount: row.failure_count,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        };

        this.tasks.set(task.id, task);
        this.scheduleTask(task);
      }

      console.log(`[TaskScheduler] Loaded ${rows.length} scheduled tasks`);
    } catch (error) {
      console.error('Failed to initialize task scheduler:', error);
    }
  }

  /**
   * Create a new scheduled task
   */
  async createScheduledTask(
    userId: string,
    goal: string,
    priority: number,
    cronExpression: string
  ): Promise<ScheduledTask> {
    const task: ScheduledTask = {
      id: uuid(),
      userId,
      goal,
      priority,
      cronExpression,
      enabled: true,
      nextExecutionAt: this.calculateNextExecution(cronExpression),
      executionCount: 0,
      failureCount: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO scheduled_tasks (id, user_id, goal, priority, cron_expression, enabled, next_execution_at, execution_count, failure_count, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          task.id,
          task.userId,
          task.goal,
          task.priority,
          task.cronExpression,
          task.enabled ? 1 : 0,
          task.nextExecutionAt,
          task.executionCount,
          task.failureCount,
          task.createdAt,
          task.updatedAt,
        ]
      );

      this.tasks.set(task.id, task);
      this.scheduleTask(task);

      return task;
    } catch (error) {
      console.error('Failed to create scheduled task:', error);
      throw error;
    }
  }

  /**
   * Update scheduled task
   */
  async updateScheduledTask(
    taskId: string,
    updates: Partial<ScheduledTask>
  ): Promise<ScheduledTask | null> {
    const task = this.tasks.get(taskId);
    if (!task) return null;

    const updated: ScheduledTask = {
      ...task,
      ...updates,
      updatedAt: Date.now(),
    };

    try {
      const db = await getDb();
      await db.run(
        `UPDATE scheduled_tasks SET goal = ?, priority = ?, cron_expression = ?, enabled = ?, next_execution_at = ?, updated_at = ?
         WHERE id = ?`,
        [
          updated.goal,
          updated.priority,
          updated.cronExpression,
          updated.enabled ? 1 : 0,
          updated.nextExecutionAt,
          updated.updatedAt,
          taskId,
        ]
      );

      this.tasks.set(taskId, updated);

      // Reschedule if enabled
      if (updated.enabled) {
        this.scheduleTask(updated);
      } else {
        this.unscheduleTask(taskId);
      }

      return updated;
    } catch (error) {
      console.error('Failed to update scheduled task:', error);
      return null;
    }
  }

  /**
   * Delete scheduled task
   */
  async deleteScheduledTask(taskId: string): Promise<boolean> {
    try {
      const db = await getDb();
      await db.run(
        `DELETE FROM scheduled_tasks WHERE id = ?`,
        [taskId]
      );

      this.tasks.delete(taskId);
      this.unscheduleTask(taskId);

      return true;
    } catch (error) {
      console.error('Failed to delete scheduled task:', error);
      return false;
    }
  }

  /**
   * Get scheduled tasks for user
   */
  async getScheduledTasks(userId: string): Promise<ScheduledTask[]> {
    try {
      const db = await getDb();
      const rows = await db.all(
        `SELECT * FROM scheduled_tasks WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );

      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        goal: row.goal,
        priority: row.priority,
        cronExpression: row.cron_expression,
        enabled: row.enabled === 1,
        lastExecutedAt: row.last_executed_at,
        nextExecutionAt: row.next_execution_at,
        executionCount: row.execution_count,
        failureCount: row.failure_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Failed to fetch scheduled tasks:', error);
      return [];
    }
  }

  /**
   * Schedule a task for execution
   */
  private scheduleTask(task: ScheduledTask): void {
    // Unschedule existing
    this.unscheduleTask(task.id);

    const now = Date.now();
    const nextExecution = task.nextExecutionAt;
    const delay = Math.max(0, nextExecution - now);

    const timeout = setTimeout(async () => {
      await this.executeScheduledTask(task);
    }, delay);

    this.schedules.set(task.id, timeout);
  }

  /**
   * Unschedule a task
   */
  private unscheduleTask(taskId: string): void {
    const timeout = this.schedules.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.schedules.delete(taskId);
    }
  }

  /**
   * Execute a scheduled task
   */
  private async executeScheduledTask(task: ScheduledTask): Promise<void> {
    try {
      console.log(`[TaskScheduler] Executing scheduled task: ${task.id}`);

      // Execute the task
      const result = await taskExecutionEngine.submitTask(
        task.userId,
        task.goal,
        task.priority
      );

      // Update execution stats
      const db = await getDb();
      await db.run(
        `UPDATE scheduled_tasks SET last_executed_at = ?, execution_count = execution_count + 1, next_execution_at = ? WHERE id = ?`,
        [Date.now(), this.calculateNextExecution(task.cronExpression), task.id]
      );

      // Send notification
      await notificationService.sendNotification(task.userId, {
        type: 'task_completed',
        title: 'Scheduled Task Executed',
        message: `Scheduled task "${task.goal}" executed successfully`,
        severity: 'success',
        data: { taskId: task.id, scheduledTaskId: result.id },
      });

      // Reschedule
      const updated = { ...task, nextExecutionAt: this.calculateNextExecution(task.cronExpression) };
      this.scheduleTask(updated);
    } catch (error) {
      console.error(`[TaskScheduler] Failed to execute scheduled task ${task.id}:`, error);

      // Update failure stats
      try {
        const db = await getDb();
        await db.run(
          `UPDATE scheduled_tasks SET failure_count = failure_count + 1, next_execution_at = ? WHERE id = ?`,
          [this.calculateNextExecution(task.cronExpression), task.id]
        );
      } catch (dbError) {
        console.error('Failed to update failure count:', dbError);
      }

      // Send failure notification
      await notificationService.notifyTaskFailed(
        task.userId,
        task.id,
        task.goal,
        error instanceof Error ? error.message : 'Unknown error'
      );

      // Reschedule
      const updated = { ...task, nextExecutionAt: this.calculateNextExecution(task.cronExpression) };
      this.scheduleTask(updated);
    }
  }

  /**
   * Calculate next execution time based on cron expression
   * Simplified cron parser - supports: every 5 minutes, daily at midnight, etc.
   */
  private calculateNextExecution(cronExpression: string): number {
    const now = new Date();
    const parts = cronExpression.split(' ');

    // Simple cron parsing
    if (parts[0] === '*/5' && parts[1] === '*') {
      // Every 5 minutes
      return Date.now() + 5 * 60 * 1000;
    } else if (parts[0] === '0' && parts[1] === '0') {
      // Daily at midnight
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow.getTime();
    } else if (parts[0] === '0' && parts[1] === '*/1') {
      // Every hour
      return Date.now() + 60 * 60 * 1000;
    }

    // Default: 1 hour from now
    return Date.now() + 60 * 60 * 1000;
  }
}

export const taskScheduler = new TaskScheduler();
