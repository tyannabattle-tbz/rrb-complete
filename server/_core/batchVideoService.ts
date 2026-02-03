/**
 * Batch Video Generation Service
 * Manages queuing, processing, and progress tracking for batch video generation
 */

export interface VideoGenerationJob {
  jobId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  videos: VideoGenerationTask[];
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  totalDuration: number; // milliseconds
  errorMessage?: string;
}

export interface VideoGenerationTask {
  taskId: string;
  prompt: string;
  duration: number;
  style: string;
  resolution: '720p' | '1080p' | '4k';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  outputUrl?: string;
  errorMessage?: string;
  processingTime?: number; // milliseconds
}

export interface BatchGenerationConfig {
  maxConcurrentJobs: number;
  maxTasksPerJob: number;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

export class BatchVideoService {
  private static readonly DEFAULT_CONFIG: BatchGenerationConfig = {
    maxConcurrentJobs: 5,
    maxTasksPerJob: 100,
    timeoutMs: 3600000, // 1 hour
    retryAttempts: 3,
    retryDelayMs: 5000,
  };

  private static jobs = new Map<string, VideoGenerationJob>();
  private static processingJobs = new Set<string>();
  private static config = this.DEFAULT_CONFIG;

  static createJob(userId: string, tasks: VideoGenerationTask[]): VideoGenerationJob {
    if (tasks.length === 0) {
      throw new Error('At least one video task is required');
    }

    if (tasks.length > this.config.maxTasksPerJob) {
      throw new Error(`Maximum ${this.config.maxTasksPerJob} tasks per job allowed`);
    }

    const jobId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const job: VideoGenerationJob = {
      jobId,
      userId,
      status: 'pending',
      progress: 0,
      videos: tasks.map((task, index) => ({
        ...task,
        taskId: `task-${index}-${Date.now()}`,
        status: 'pending',
        progress: 0,
      })),
      createdAt: new Date(),
      totalDuration: 0,
    };

    this.jobs.set(jobId, job);
    return job;
  }

  static getJob(jobId: string): VideoGenerationJob | null {
    return this.jobs.get(jobId) || null;
  }

  static listJobs(userId: string): VideoGenerationJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.userId === userId);
  }

  static startJob(jobId: string): VideoGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status !== 'pending') {
      throw new Error(`Job ${jobId} is already ${job.status}`);
    }

    if (this.processingJobs.size >= this.config.maxConcurrentJobs) {
      throw new Error('Maximum concurrent jobs reached');
    }

    job.status = 'processing';
    job.startedAt = new Date();
    this.processingJobs.add(jobId);

    return job;
  }

  static updateTaskProgress(jobId: string, taskId: string, progress: number): VideoGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const task = job.videos.find((t) => t.taskId === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found in job ${jobId}`);
    }

    task.progress = Math.min(100, Math.max(0, progress));

    // Update overall job progress
    const totalProgress = job.videos.reduce((sum, t) => sum + t.progress, 0) / job.videos.length;
    job.progress = Math.round(totalProgress);

    return job;
  }

  static completeTask(
    jobId: string,
    taskId: string,
    outputUrl: string,
    processingTime: number
  ): VideoGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const task = job.videos.find((t) => t.taskId === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found in job ${jobId}`);
    }

    task.status = 'completed';
    task.progress = 100;
    task.outputUrl = outputUrl;
    task.processingTime = processingTime;
    job.totalDuration += processingTime;

    // Check if all tasks are completed
    const allCompleted = job.videos.every((t) => t.status === 'completed' || t.status === 'failed');
    if (allCompleted) {
      this.completeJob(jobId);
    }

    return job;
  }

  static failTask(jobId: string, taskId: string, errorMessage: string): VideoGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const task = job.videos.find((t) => t.taskId === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found in job ${jobId}`);
    }

    task.status = 'failed';
    task.progress = 0;
    task.errorMessage = errorMessage;

    // Check if all tasks are completed
    const allCompleted = job.videos.every((t) => t.status === 'completed' || t.status === 'failed');
    if (allCompleted) {
      this.completeJob(jobId);
    }

    return job;
  }

  static completeJob(jobId: string): VideoGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const failedTasks = job.videos.filter((t) => t.status === 'failed');
    job.status = failedTasks.length > 0 ? 'failed' : 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    this.processingJobs.delete(jobId);

    if (failedTasks.length > 0) {
      job.errorMessage = `${failedTasks.length} task(s) failed`;
    }

    return job;
  }

  static cancelJob(jobId: string): VideoGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === 'completed' || job.status === 'failed') {
      throw new Error(`Cannot cancel a ${job.status} job`);
    }

    job.status = 'cancelled';
    job.completedAt = new Date();
    this.processingJobs.delete(jobId);

    return job;
  }

  static getJobStats(userId: string): {
    totalJobs: number;
    pendingJobs: number;
    processingJobs: number;
    completedJobs: number;
    failedJobs: number;
    totalVideos: number;
    averageProcessingTime: number;
  } {
    const userJobs = this.listJobs(userId);

    const stats = {
      totalJobs: userJobs.length,
      pendingJobs: userJobs.filter((j) => j.status === 'pending').length,
      processingJobs: userJobs.filter((j) => j.status === 'processing').length,
      completedJobs: userJobs.filter((j) => j.status === 'completed').length,
      failedJobs: userJobs.filter((j) => j.status === 'failed').length,
      totalVideos: userJobs.reduce((sum, j) => sum + j.videos.length, 0),
      averageProcessingTime: 0,
    };

    const completedJobs = userJobs.filter((j) => j.status === 'completed');
    if (completedJobs.length > 0) {
      stats.averageProcessingTime =
        completedJobs.reduce((sum, j) => sum + j.totalDuration, 0) / completedJobs.length;
    }

    return stats;
  }

  static deleteJob(jobId: string): boolean {
    if (this.processingJobs.has(jobId)) {
      throw new Error('Cannot delete a processing job');
    }

    return this.jobs.delete(jobId);
  }

  static getQueueStats(): {
    totalJobs: number;
    processingJobs: number;
    pendingJobs: number;
    queueLength: number;
  } {
    const allJobs = Array.from(this.jobs.values());

    return {
      totalJobs: allJobs.length,
      processingJobs: this.processingJobs.size,
      pendingJobs: allJobs.filter((j) => j.status === 'pending').length,
      queueLength: this.processingJobs.size + allJobs.filter((j) => j.status === 'pending').length,
    };
  }

  static setConfig(config: Partial<BatchGenerationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  static getConfig(): BatchGenerationConfig {
    return { ...this.config };
  }

  static exportJob(jobId: string): string {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    return JSON.stringify(job, null, 2);
  }

  static importJob(jsonString: string, userId: string): VideoGenerationJob {
    try {
      const jobData = JSON.parse(jsonString);
      const job: VideoGenerationJob = {
        ...jobData,
        jobId: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        status: 'pending',
        progress: 0,
        createdAt: new Date(),
        videos: jobData.videos.map((v: any, index: number) => ({
          ...v,
          taskId: `task-${index}-${Date.now()}`,
          status: 'pending',
          progress: 0,
        })),
      };

      this.jobs.set(job.jobId, job);
      return job;
    } catch (error) {
      throw new Error(`Failed to import job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static retryFailedTasks(jobId: string): VideoGenerationJob {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const failedTasks = job.videos.filter((t) => t.status === 'failed');
    failedTasks.forEach((task) => {
      task.status = 'pending';
      task.progress = 0;
      task.errorMessage = undefined;
      task.outputUrl = undefined;
      task.processingTime = undefined;
    });

    if (failedTasks.length > 0) {
      job.status = 'pending';
      job.progress = 0;
    }

    return job;
  }
}
