import { tyOSStatusFeed } from './tyOSStatusFeed';
import { qumusCommandProcessor } from './qumusCommandProcessor';

/**
 * QUMUS Execution Engine
 * Orchestrates command execution across all ecosystem subsystems
 * Handles task queuing, parallel execution, error recovery, and rollback
 */

export interface ExecutionTask {
  id: string;
  commandId: string;
  target: string;
  action: string;
  params?: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled-back';
  startTime?: number;
  endTime?: number;
  result?: any;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface ExecutionPlan {
  id: string;
  commandId: string;
  tasks: ExecutionTask[];
  parallelizable: boolean;
  estimatedDuration: number;
  createdAt: number;
}

export class QUMUSExecutionEngine {
  private taskQueue: Map<string, ExecutionTask> = new Map();
  private executionPlans: Map<string, ExecutionPlan> = new Map();
  private executionHistory: ExecutionTask[] = [];
  private maxHistorySize = 1000;
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private concurrentExecutions = 0;
  private maxConcurrent = 5;

  constructor() {
    this.initializeEngine();
  }

  private initializeEngine() {
    console.log('[QUMUS Execution Engine] Initialized');
    this.startExecutionLoop();
  }

  /**
   * Start execution processing loop
   */
  private startExecutionLoop() {
    this.processingInterval = setInterval(() => {
      this.processTaskQueue();
    }, 1000);
  }

  /**
   * Create execution plan for a command
   */
  async createExecutionPlan(commandId: string, target: string, action: string, params?: any): Promise<ExecutionPlan> {
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine if tasks can be parallelized
    const tasks = this.generateExecutionTasks(commandId, target, action, params);
    const parallelizable = this.canParallelize(target);

    const plan: ExecutionPlan = {
      id: planId,
      commandId,
      tasks,
      parallelizable,
      estimatedDuration: this.estimateDuration(tasks),
      createdAt: Date.now(),
    };

    this.executionPlans.set(planId, plan);

    console.log(`[QUMUS Execution Engine] Plan created: ${planId}`, {
      tasks: tasks.length,
      parallelizable,
      estimatedDuration: plan.estimatedDuration,
    });

    return plan;
  }

  /**
   * Generate execution tasks from command
   */
  private generateExecutionTasks(
    commandId: string,
    target: string,
    action: string,
    params?: any
  ): ExecutionTask[] {
    const tasks: ExecutionTask[] = [];

    if (target === 'all') {
      // Create tasks for each subsystem
      const subsystems = ['rrb-radio', 'hybridcast', 'canryn', 'sweet-miracles'];
      subsystems.forEach((subsystem) => {
        tasks.push(this.createTask(commandId, subsystem, action, params));
      });
    } else {
      // Single target
      tasks.push(this.createTask(commandId, target, action, params));
    }

    return tasks;
  }

  /**
   * Create individual execution task
   */
  private createTask(
    commandId: string,
    target: string,
    action: string,
    params?: any
  ): ExecutionTask {
    return {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      commandId,
      target,
      action,
      params,
      priority: 'normal',
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
    };
  }

  /**
   * Check if target can be parallelized
   */
  private canParallelize(target: string): boolean {
    return target === 'all' || target === 'qumus';
  }

  /**
   * Estimate task duration
   */
  private estimateDuration(tasks: ExecutionTask[]): number {
    // Base duration per task (ms)
    const basePerTask = 500;
    return tasks.length * basePerTask;
  }

  /**
   * Execute tasks from queue
   */
  private async processTaskQueue() {
    if (this.isProcessing || this.concurrentExecutions >= this.maxConcurrent) {
      return;
    }

    this.isProcessing = true;

    try {
      const pendingTasks = Array.from(this.taskQueue.values()).filter((t) => t.status === 'pending');

      for (const task of pendingTasks) {
        if (this.concurrentExecutions >= this.maxConcurrent) {
          break;
        }

        this.concurrentExecutions++;
        this.executeTask(task).finally(() => {
          this.concurrentExecutions--;
        });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: ExecutionTask): Promise<void> {
    task.status = 'running';
    task.startTime = Date.now();

    console.log(`[QUMUS Execution] Starting task: ${task.id}`, {
      target: task.target,
      action: task.action,
    });

    try {
      // Simulate task execution
      const result = await this.executeSubsystemAction(task.target, task.action, task.params);

      task.result = result;
      task.status = 'completed';
      task.endTime = Date.now();

      console.log(`[QUMUS Execution] Task completed: ${task.id}`, {
        duration: task.endTime - (task.startTime || 0),
        result,
      });

      // Log to status feed
      await tyOSStatusFeed.logDecision(
        `execution_${task.target}`,
        `Executed ${task.action} on ${task.target}`,
        `Task ${task.id} completed successfully`,
        { result }
      );
    } catch (error) {
      task.error = String(error);
      task.retryCount++;

      if (task.retryCount < task.maxRetries) {
        task.status = 'pending';
        console.log(`[QUMUS Execution] Task retry ${task.retryCount}/${task.maxRetries}: ${task.id}`);
      } else {
        task.status = 'failed';
        task.endTime = Date.now();

        console.error(`[QUMUS Execution] Task failed: ${task.id}`, error);

        // Log alert to status feed
        await tyOSStatusFeed.logAlert('warning', `Task ${task.id} failed after ${task.maxRetries} retries`, 'qumus-execution', {
          taskId: task.id,
          error: String(error),
        });
      }
    }

    this.executionHistory.push(task);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  /**
   * Execute action on subsystem
   */
  private async executeSubsystemAction(target: string, action: string, params?: any): Promise<any> {
    // Simulate subsystem execution with realistic delay
    const delay = 100 + Math.random() * 400;
    await new Promise((resolve) => setTimeout(resolve, delay));

    return {
      subsystem: target,
      action,
      status: 'executed',
      timestamp: Date.now(),
      params,
    };
  }

  /**
   * Queue task for execution
   */
  async queueTask(task: ExecutionTask): Promise<void> {
    this.taskQueue.set(task.id, task);
    console.log(`[QUMUS Execution Engine] Task queued: ${task.id}`);
  }

  /**
   * Queue multiple tasks from execution plan
   */
  async queueExecutionPlan(planId: string): Promise<void> {
    const plan = this.executionPlans.get(planId);
    if (!plan) {
      throw new Error(`Execution plan not found: ${planId}`);
    }

    for (const task of plan.tasks) {
      await this.queueTask(task);
    }

    console.log(`[QUMUS Execution Engine] Execution plan queued: ${planId}`, {
      tasks: plan.tasks.length,
    });
  }

  /**
   * Get task status
   */
  getTaskStatus(taskId: string): ExecutionTask | undefined {
    return this.taskQueue.get(taskId);
  }

  /**
   * Get execution plan status
   */
  getExecutionPlanStatus(planId: string): ExecutionPlan | undefined {
    return this.executionPlans.get(planId);
  }

  /**
   * Get pending tasks
   */
  getPendingTasks(): ExecutionTask[] {
    return Array.from(this.taskQueue.values()).filter((t) => t.status === 'pending');
  }

  /**
   * Get running tasks
   */
  getRunningTasks(): ExecutionTask[] {
    return Array.from(this.taskQueue.values()).filter((t) => t.status === 'running');
  }

  /**
   * Get completed tasks
   */
  getCompletedTasks(limit: number = 50): ExecutionTask[] {
    return this.executionHistory.filter((t) => t.status === 'completed').slice(-limit);
  }

  /**
   * Get failed tasks
   */
  getFailedTasks(limit: number = 50): ExecutionTask[] {
    return this.executionHistory.filter((t) => t.status === 'failed').slice(-limit);
  }

  /**
   * Rollback execution
   */
  async rollbackExecution(planId: string): Promise<void> {
    const plan = this.executionPlans.get(planId);
    if (!plan) {
      throw new Error(`Execution plan not found: ${planId}`);
    }

    console.log(`[QUMUS Execution Engine] Rolling back execution plan: ${planId}`);

    for (const task of plan.tasks) {
      if (task.status === 'completed') {
        task.status = 'rolled-back';
        task.endTime = Date.now();

        console.log(`[QUMUS Execution] Task rolled back: ${task.id}`);

        // Log rollback to status feed
        await tyOSStatusFeed.logAlert('info', `Task ${task.id} rolled back`, 'qumus-execution', {
          taskId: task.id,
          planId,
        });
      }
    }
  }

  /**
   * Get execution engine status
   */
  getEngineStatus() {
    return {
      isProcessing: this.isProcessing,
      concurrentExecutions: this.concurrentExecutions,
      maxConcurrent: this.maxConcurrent,
      queuedTasks: this.taskQueue.size,
      executionPlans: this.executionPlans.size,
      historySize: this.executionHistory.length,
    };
  }

  /**
   * Stop execution engine
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    console.log('[QUMUS Execution Engine] Stopped');
  }
}

// Singleton instance
export const qumusExecutionEngine = new QUMUSExecutionEngine();
