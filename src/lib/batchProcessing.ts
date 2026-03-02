/**
 * Advanced Batch Processing System for Qumus
 * Handles queue management, priority scheduling, and resource allocation
 */

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'paused' | 'cancelled';
export type JobPriority = 'low' | 'medium' | 'high' | 'critical';

export interface BatchJob {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  progress: number; // 0-100
  estimatedTime: number; // seconds
  elapsedTime: number; // seconds
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

export interface BatchQueue {
  id: string;
  name: string;
  description: string;
  jobs: BatchJob[];
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  isPaused: boolean;
}

export interface BatchStatistics {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pendingJobs: number;
  processingJobs: number;
  averageProcessingTime: number;
  successRate: number;
  estimatedTimeRemaining: number;
}

export interface ResourceAllocation {
  maxConcurrentJobs: number;
  cpuUsage: number; // 0-100
  memoryUsage: number; // 0-100
  diskUsage: number; // 0-100
  networkUsage: number; // 0-100
}

/**
 * Batch Processing Manager
 */
export class BatchProcessingManager {
  private queues: Map<string, BatchQueue> = new Map();
  private jobs: Map<string, BatchJob> = new Map();
  private activeJobs: Set<string> = new Set();
  private resourceAllocation: ResourceAllocation = {
    maxConcurrentJobs: 5,
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkUsage: 0,
  };
  private jobHandlers: Map<string, (job: BatchJob) => Promise<unknown>> =
    new Map();
  private onJobStatusChange: ((job: BatchJob) => void) | null = null;
  private onQueueStatusChange: ((queue: BatchQueue) => void) | null = null;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startProcessing();
  }

  /**
   * Create a new batch queue
   */
  createQueue(name: string, description: string = ''): BatchQueue {
    const queue: BatchQueue = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      jobs: [],
      totalJobs: 0,
      completedJobs: 0,
      failedJobs: 0,
      createdAt: new Date(),
      isPaused: false,
    };

    this.queues.set(queue.id, queue);
    return queue;
  }

  /**
   * Add a job to a queue
   */
  addJob(
    queueId: string,
    title: string,
    parameters: Record<string, unknown>,
    priority: JobPriority = 'medium',
    estimatedTime: number = 60
  ): BatchJob | null {
    const queue = this.queues.get(queueId);
    if (!queue) return null;

    const job: BatchJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title,
      description: `Batch job: ${title}`,
      status: 'pending',
      priority,
      progress: 0,
      estimatedTime,
      elapsedTime: 0,
      createdAt: new Date(),
      parameters,
      retryCount: 0,
      maxRetries: 3,
    };

    queue.jobs.push(job);
    queue.totalJobs++;
    this.jobs.set(job.id, job);

    // Sort by priority
    this.sortQueueByPriority(queue);

    this.notifyQueueStatusChange(queue);
    return job;
  }

  /**
   * Add multiple jobs to a queue
   */
  addBulkJobs(
    queueId: string,
    jobsData: Array<{
      title: string;
      parameters: Record<string, unknown>;
      priority?: JobPriority;
      estimatedTime?: number;
    }>
  ): BatchJob[] {
    const addedJobs: BatchJob[] = [];

    for (const jobData of jobsData) {
      const job = this.addJob(
        queueId,
        jobData.title,
        jobData.parameters,
        jobData.priority || 'medium',
        jobData.estimatedTime || 60
      );

      if (job) {
        addedJobs.push(job);
      }
    }

    return addedJobs;
  }

  /**
   * Register a job handler
   */
  registerJobHandler(
    jobType: string,
    handler: (job: BatchJob) => Promise<unknown>
  ) {
    this.jobHandlers.set(jobType, handler);
  }

  /**
   * Start processing queue
   */
  startQueue(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue) return false;

    queue.isPaused = false;
    queue.startedAt = new Date();
    this.notifyQueueStatusChange(queue);
    return true;
  }

  /**
   * Pause queue
   */
  pauseQueue(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue) return false;

    queue.isPaused = true;
    this.notifyQueueStatusChange(queue);
    return true;
  }

  /**
   * Resume queue
   */
  resumeQueue(queueId: string): boolean {
    const queue = this.queues.get(queueId);
    if (!queue) return false;

    queue.isPaused = false;
    this.notifyQueueStatusChange(queue);
    return true;
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'processing') {
      this.activeJobs.delete(jobId);
    }

    job.status = 'cancelled';
    this.notifyJobStatusChange(job);

    // Update queue stats
    const queue = this.findQueueByJobId(jobId);
    if (queue) {
      this.notifyQueueStatusChange(queue);
    }

    return true;
  }

  /**
   * Retry a failed job
   */
  retryJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'failed') return false;

    if (job.retryCount < job.maxRetries) {
      job.status = 'pending';
      job.retryCount++;
      job.progress = 0;
      job.error = undefined;
      this.notifyJobStatusChange(job);
      return true;
    }

    return false;
  }

  /**
   * Get queue statistics
   */
  getQueueStatistics(queueId: string): BatchStatistics | null {
    const queue = this.queues.get(queueId);
    if (!queue) return null;

    const pendingJobs = queue.jobs.filter((j) => j.status === 'pending').length;
    const processingJobs = queue.jobs.filter(
      (j) => j.status === 'processing'
    ).length;
    const completedJobs = queue.jobs.filter(
      (j) => j.status === 'completed'
    ).length;
    const failedJobs = queue.jobs.filter((j) => j.status === 'failed').length;

    const totalTime = queue.jobs.reduce((sum, job) => sum + job.estimatedTime, 0);
    const estimatedTimeRemaining = queue.jobs
      .filter((j) => j.status === 'pending' || j.status === 'processing')
      .reduce((sum, job) => sum + (job.estimatedTime - job.elapsedTime), 0);

    const successRate =
      queue.totalJobs > 0
        ? (completedJobs / (completedJobs + failedJobs)) * 100
        : 0;

    const avgProcessingTime =
      completedJobs > 0
        ? queue.jobs
            .filter((j) => j.status === 'completed')
            .reduce((sum, job) => sum + job.elapsedTime, 0) / completedJobs
        : 0;

    return {
      totalJobs: queue.totalJobs,
      completedJobs,
      failedJobs,
      pendingJobs,
      processingJobs,
      averageProcessingTime: avgProcessingTime,
      successRate,
      estimatedTimeRemaining,
    };
  }

  /**
   * Get all queues
   */
  getAllQueues(): BatchQueue[] {
    return Array.from(this.queues.values());
  }

  /**
   * Get queue by ID
   */
  getQueue(queueId: string): BatchQueue | null {
    return this.queues.get(queueId) || null;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): BatchJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Subscribe to job status changes
   */
  onJobStatusChangeListener(callback: (job: BatchJob) => void) {
    this.onJobStatusChange = callback;
  }

  /**
   * Subscribe to queue status changes
   */
  onQueueStatusChangeListener(callback: (queue: BatchQueue) => void) {
    this.onQueueStatusChange = callback;
  }

  /**
   * Get resource allocation
   */
  getResourceAllocation(): ResourceAllocation {
    return { ...this.resourceAllocation };
  }

  /**
   * Set resource allocation
   */
  setResourceAllocation(allocation: Partial<ResourceAllocation>) {
    this.resourceAllocation = { ...this.resourceAllocation, ...allocation };
  }

  /**
   * Start processing jobs
   */
  private startProcessing() {
    this.processingInterval = setInterval(() => {
      this.processNextJobs();
    }, 1000); // Check every second
  }

  /**
   * Process next jobs from queues
   */
  private async processNextJobs() {
    const availableSlots =
      this.resourceAllocation.maxConcurrentJobs - this.activeJobs.size;

    if (availableSlots <= 0) return;

    // Get next pending jobs from all queues
    const pendingJobs: BatchJob[] = [];

    for (const queue of this.queues.values()) {
      if (queue.isPaused) continue;

      const queuePendingJobs = queue.jobs
        .filter((j) => j.status === 'pending')
        .sort((a, b) => {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (
            priorityOrder[a.priority] - priorityOrder[b.priority] ||
            a.createdAt.getTime() - b.createdAt.getTime()
          );
        });

      pendingJobs.push(...queuePendingJobs);
    }

    // Process up to available slots
    for (let i = 0; i < Math.min(availableSlots, pendingJobs.length); i++) {
      const job = pendingJobs[i];
      await this.executeJob(job);
    }

    // Update job elapsed times
    for (const jobId of this.activeJobs) {
      const job = this.jobs.get(jobId);
      if (job && job.startedAt) {
        job.elapsedTime = Math.floor(
          (Date.now() - job.startedAt.getTime()) / 1000
        );
        this.notifyJobStatusChange(job);
      }
    }
  }

  /**
   * Execute a job
   */
  private async executeJob(job: BatchJob) {
    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 0;
    this.activeJobs.add(job.id);
    this.notifyJobStatusChange(job);

    try {
      // Simulate job processing with progress updates
      const totalSteps = 10;
      for (let step = 0; step < totalSteps; step++) {
        job.progress = ((step + 1) / totalSteps) * 100;
        this.notifyJobStatusChange(job);

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;

      // Update queue stats
      const queue = this.findQueueByJobId(job.id);
      if (queue) {
        queue.completedJobs++;
      }
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';

      // Update queue stats
      const queue = this.findQueueByJobId(job.id);
      if (queue) {
        queue.failedJobs++;
      }
    } finally {
      this.activeJobs.delete(job.id);
      this.notifyJobStatusChange(job);

      const queue = this.findQueueByJobId(job.id);
      if (queue) {
        this.notifyQueueStatusChange(queue);
      }
    }
  }

  /**
   * Find queue by job ID
   */
  private findQueueByJobId(jobId: string): BatchQueue | null {
    for (const queue of this.queues.values()) {
      if (queue.jobs.some((j) => j.id === jobId)) {
        return queue;
      }
    }
    return null;
  }

  /**
   * Sort queue by priority
   */
  private sortQueueByPriority(queue: BatchQueue) {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    queue.jobs.sort((a, b) => {
      if (a.status !== 'pending' || b.status !== 'pending') {
        return 0; // Don't sort non-pending jobs
      }
      return (
        priorityOrder[a.priority] - priorityOrder[b.priority] ||
        a.createdAt.getTime() - b.createdAt.getTime()
      );
    });
  }

  private notifyJobStatusChange(job: BatchJob) {
    if (this.onJobStatusChange) {
      this.onJobStatusChange(job);
    }
  }

  private notifyQueueStatusChange(queue: BatchQueue) {
    if (this.onQueueStatusChange) {
      this.onQueueStatusChange(queue);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
  }
}

// Export singleton instance
export const batchProcessingManager = new BatchProcessingManager();
