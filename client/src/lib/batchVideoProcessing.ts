/**
 * Batch Video Processing Engine
 * Handles simultaneous generation of multiple videos with different presets
 */

export interface BatchVideoJob {
  id: string;
  name: string;
  imageUrl: string;
  preset: string;
  duration: number;
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high' | '4k';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  outputUrl?: string;
  startTime?: number;
  endTime?: number;
}

export interface BatchProcessingConfig {
  maxConcurrentJobs?: number;
  retryAttempts?: number;
  timeoutMs?: number;
  onProgress?: (job: BatchVideoJob) => void;
  onComplete?: (job: BatchVideoJob) => void;
  onError?: (job: BatchVideoJob, error: Error) => void;
}

export class BatchVideoProcessor {
  private jobs: Map<string, BatchVideoJob> = new Map();
  private processingQueue: string[] = [];
  private activeJobs: Set<string> = new Set();
  private config: Required<BatchProcessingConfig>;

  constructor(config: BatchProcessingConfig = {}) {
    this.config = {
      maxConcurrentJobs: config.maxConcurrentJobs || 3,
      retryAttempts: config.retryAttempts || 3,
      timeoutMs: config.timeoutMs || 300000, // 5 minutes
      onProgress: config.onProgress || (() => {}),
      onComplete: config.onComplete || (() => {}),
      onError: config.onError || (() => {}),
    };
  }

  /**
   * Add a video job to the batch queue
   */
  addJob(job: Omit<BatchVideoJob, 'status' | 'progress'>): string {
    const jobId = job.id || `job-${Date.now()}-${Math.random()}`;
    const fullJob: BatchVideoJob = {
      ...job,
      id: jobId,
      status: 'pending',
      progress: 0,
    };

    this.jobs.set(jobId, fullJob);
    this.processingQueue.push(jobId);
    this.processNext();

    return jobId;
  }

  /**
   * Add multiple jobs at once
   */
  addBatch(jobs: Array<Omit<BatchVideoJob, 'status' | 'progress' | 'id'>>): string[] {
    return jobs.map((job) =>
      this.addJob({
        ...job,
        id: `job-${Date.now()}-${Math.random()}`,
      })
    );
  }

  /**
   * Process the next job in the queue
   */
  private async processNext(): Promise<void> {
    if (this.activeJobs.size >= this.config.maxConcurrentJobs) {
      return;
    }

    const jobId = this.processingQueue.shift();
    if (!jobId) return;

    const job = this.jobs.get(jobId);
    if (!job) return;

    this.activeJobs.add(jobId);
    job.status = 'processing';
    job.startTime = Date.now();

    try {
      await this.processJob(job);
      job.status = 'completed';
      job.endTime = Date.now();
      this.config.onComplete(job);
    } catch (error) {
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
      job.endTime = Date.now();
      this.config.onError(job, error instanceof Error ? error : new Error(String(error)));
    } finally {
      this.activeJobs.delete(jobId);
      this.config.onProgress(job);
      this.processNext();
    }
  }

  /**
   * Process a single video job
   */
  private async processJob(job: BatchVideoJob): Promise<void> {
    // Simulate video processing with progress updates
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      job.progress = ((i + 1) / steps) * 100;
      this.config.onProgress(job);
    }

    // Simulate output URL generation
    job.outputUrl = `blob:video-${job.id}-${Date.now()}`;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): BatchVideoJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs
   */
  getAllJobs(): BatchVideoJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: BatchVideoJob['status']): BatchVideoJob[] {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    job.status = 'failed';
    job.error = 'Cancelled by user';
    this.activeJobs.delete(jobId);
    this.processingQueue = this.processingQueue.filter((id) => id !== jobId);

    return true;
  }

  /**
   * Get batch statistics
   */
  getStats() {
    const jobs = this.getAllJobs();
    const completed = jobs.filter((j) => j.status === 'completed').length;
    const failed = jobs.filter((j) => j.status === 'failed').length;
    const processing = jobs.filter((j) => j.status === 'processing').length;
    const pending = jobs.filter((j) => j.status === 'pending').length;

    const totalDuration = jobs.reduce((sum, j) => {
      if (j.startTime && j.endTime) {
        return sum + (j.endTime - j.startTime);
      }
      return sum;
    }, 0);

    const averageProgress =
      jobs.length > 0 ? jobs.reduce((sum, j) => sum + j.progress, 0) / jobs.length : 0;

    return {
      total: jobs.length,
      completed,
      failed,
      processing,
      pending,
      totalDuration,
      averageProgress,
      successRate: jobs.length > 0 ? (completed / jobs.length) * 100 : 0,
    };
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    const jobIds = Array.from(this.jobs.keys());
    jobIds.forEach((id) => {
      const job = this.jobs.get(id);
      if (job && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(id);
      }
    });
  }

  /**
   * Clear all jobs
   */
  clearAll(): void {
    this.jobs.clear();
    this.processingQueue = [];
    this.activeJobs.clear();
  }
}

/**
 * Create a batch processor instance
 */
export function createBatchProcessor(config?: BatchProcessingConfig): BatchVideoProcessor {
  return new BatchVideoProcessor(config);
}

/**
 * Preset configurations for batch processing
 */
export const BATCH_PRESETS = {
  socialMedia: {
    name: 'Social Media Pack',
    description: 'Generate videos for Instagram, TikTok, YouTube Shorts',
    jobs: [
      { preset: 'cinematicDragon', format: 'mp4' as const, quality: 'high' as const, duration: 15 },
      { preset: 'magicalParticles', format: 'mp4' as const, quality: 'medium' as const, duration: 10 },
      { preset: 'epicPan', format: 'webm' as const, quality: 'high' as const, duration: 8 },
    ],
  },
  presentations: {
    name: 'Presentation Pack',
    description: 'Generate videos for business presentations',
    jobs: [
      { preset: 'fadeTransition', format: 'mp4' as const, quality: 'high' as const, duration: 10 },
      { preset: 'cinematicDragon', format: 'mp4' as const, quality: 'high' as const, duration: 12 },
    ],
  },
  marketing: {
    name: 'Marketing Pack',
    description: 'Generate videos for marketing campaigns',
    jobs: [
      { preset: 'cinematicDragon', format: 'mp4' as const, quality: '4k' as const, duration: 20 },
      { preset: 'magicalParticles', format: 'mp4' as const, quality: 'high' as const, duration: 15 },
      { preset: 'epicPan', format: 'mp4' as const, quality: 'high' as const, duration: 12 },
      { preset: 'fadeTransition', format: 'webm' as const, quality: 'high' as const, duration: 10 },
    ],
  },
  archive: {
    name: 'Archive Pack',
    description: 'Generate all formats and quality levels',
    jobs: [
      { preset: 'cinematicDragon', format: 'mp4' as const, quality: 'low' as const, duration: 8 },
      { preset: 'cinematicDragon', format: 'mp4' as const, quality: 'medium' as const, duration: 8 },
      { preset: 'cinematicDragon', format: 'mp4' as const, quality: 'high' as const, duration: 8 },
      { preset: 'cinematicDragon', format: 'mp4' as const, quality: '4k' as const, duration: 8 },
      { preset: 'cinematicDragon', format: 'webm' as const, quality: 'high' as const, duration: 8 },
      { preset: 'cinematicDragon', format: 'gif' as const, quality: 'medium' as const, duration: 8 },
    ],
  },
};
