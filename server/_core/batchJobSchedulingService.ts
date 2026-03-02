/**
 * Batch Job Scheduling Service
 * Schedules video generation jobs for optimal processing times
 */

export interface ScheduledJob {
  jobId: string;
  videoId: string;
  prompt: string;
  scheduledTime: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  retries: number;
  maxRetries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface SchedulingConfig {
  peakHours: { start: number; end: number }; // 0-23
  offPeakDiscount: number; // 0-1 (e.g., 0.7 = 30% discount)
  maxConcurrentJobs: number;
  defaultRetries: number;
  autoScheduleOffPeak: boolean;
}

export class BatchJobSchedulingService {
  private jobs: Map<string, ScheduledJob> = new Map();
  private queue: ScheduledJob[] = [];
  private processingJobs: Set<string> = new Set();
  private config: SchedulingConfig = {
    peakHours: { start: 9, end: 17 },
    offPeakDiscount: 0.7,
    maxConcurrentJobs: 5,
    defaultRetries: 3,
    autoScheduleOffPeak: true,
  };

  /**
   * Set scheduling configuration
   */
  setConfig(config: Partial<SchedulingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Schedule a job
   */
  scheduleJob(
    videoId: string,
    prompt: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    scheduledTime?: Date
  ): ScheduledJob {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Auto-schedule for off-peak if enabled and no time specified
    let finalScheduledTime = scheduledTime;
    if (!finalScheduledTime && this.config.autoScheduleOffPeak) {
      finalScheduledTime = this.getNextOffPeakTime();
    } else if (!finalScheduledTime) {
      finalScheduledTime = new Date();
    }

    const job: ScheduledJob = {
      jobId,
      videoId,
      prompt,
      scheduledTime: finalScheduledTime,
      priority,
      status: 'scheduled',
      retries: 0,
      maxRetries: this.config.defaultRetries,
      createdAt: new Date(),
    };

    this.jobs.set(jobId, job);
    this.addToQueue(job);

    return job;
  }

  /**
   * Add job to processing queue
   */
  private addToQueue(job: ScheduledJob): void {
    this.queue.push(job);
    this.queue.sort((a, b) => {
      // Sort by priority, then scheduled time
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a.scheduledTime.getTime() - b.scheduledTime.getTime();
    });
  }

  /**
   * Get next job from queue
   */
  getNextJob(): ScheduledJob | undefined {
    if (this.processingJobs.size >= this.config.maxConcurrentJobs) {
      return undefined;
    }

    const now = new Date();
    const job = this.queue.find((j) => j.scheduledTime <= now && j.status === 'scheduled');

    if (job) {
      job.status = 'processing';
      job.startedAt = new Date();
      this.processingJobs.add(job.jobId);
      this.queue = this.queue.filter((j) => j.jobId !== job.jobId);
    }

    return job;
  }

  /**
   * Mark job as completed
   */
  completeJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.status = 'completed';
      job.completedAt = new Date();
      this.processingJobs.delete(jobId);
    }
  }

  /**
   * Mark job as failed
   */
  failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (job) {
      job.error = error;
      this.processingJobs.delete(jobId);

      if (job.retries < job.maxRetries) {
        job.retries++;
        job.status = 'scheduled';
        job.scheduledTime = new Date(Date.now() + Math.pow(2, job.retries) * 60000); // Exponential backoff
        this.addToQueue(job);
      } else {
        job.status = 'failed';
      }
    }
  }

  /**
   * Get next off-peak time
   */
  private getNextOffPeakTime(): Date {
    const now = new Date();
    const hour = now.getHours();
    const { start: peakStart, end: peakEnd } = this.config.peakHours;

    let nextTime = new Date(now);

    if (hour >= peakStart && hour < peakEnd) {
      // Currently in peak hours, schedule for end of peak
      nextTime.setHours(peakEnd, 0, 0, 0);
    } else if (hour < peakStart) {
      // Before peak hours, schedule for next off-peak (after peak)
      nextTime.setHours(peakEnd, 0, 0, 0);
    } else {
      // After peak hours, schedule for tomorrow's off-peak
      nextTime.setDate(nextTime.getDate() + 1);
      nextTime.setHours(peakEnd, 0, 0, 0);
    }

    return nextTime;
  }

  /**
   * Get job by ID
   */
  getJob(jobId: string): ScheduledJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): ScheduledJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: string): ScheduledJob[] {
    return Array.from(this.jobs.values()).filter((j) => j.status === status);
  }

  /**
   * Get queue status
   */
  getQueueStatus() {
    return {
      totalJobs: this.jobs.size,
      scheduled: this.getJobsByStatus('scheduled').length,
      processing: this.processingJobs.size,
      completed: this.getJobsByStatus('completed').length,
      failed: this.getJobsByStatus('failed').length,
      queueLength: this.queue.length,
      maxConcurrent: this.config.maxConcurrentJobs,
    };
  }

  /**
   * Calculate cost with off-peak discount
   */
  calculateCost(baseCost: number, scheduledTime: Date): number {
    const hour = scheduledTime.getHours();
    const { start: peakStart, end: peakEnd } = this.config.peakHours;

    if (hour >= peakStart && hour < peakEnd) {
      return baseCost;
    } else {
      return baseCost * this.config.offPeakDiscount;
    }
  }

  /**
   * Reschedule job
   */
  rescheduleJob(jobId: string, newTime: Date): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'scheduled') {
      return false;
    }

    job.scheduledTime = newTime;
    this.queue = this.queue.filter((j) => j.jobId !== jobId);
    this.addToQueue(job);

    return true;
  }

  /**
   * Cancel job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'processing' || job.status === 'completed') {
      return false;
    }

    this.jobs.delete(jobId);
    this.queue = this.queue.filter((j) => j.jobId !== jobId);

    return true;
  }

  /**
   * Get estimated wait time
   */
  getEstimatedWaitTime(jobId: string): number | null {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'scheduled') {
      return null;
    }

    const now = new Date();
    const waitMs = job.scheduledTime.getTime() - now.getTime();

    return Math.max(0, waitMs);
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    Array.from(this.jobs.entries()).forEach(([jobId, job]) => {
      if (job.status === 'completed' || job.status === 'failed') {
        this.jobs.delete(jobId);
      }
    });
  }
}

export const batchJobSchedulingService = new BatchJobSchedulingService();
