import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { BatchVideoService, VideoGenerationTask } from '../_core/batchVideoService';

// Validation schemas
const videoTaskSchema = z.object({
  prompt: z.string().min(1),
  duration: z.number().min(1).max(300),
  style: z.string(),
  resolution: z.enum(['720p', '1080p', '4k']),
});

const batchConfigSchema = z.object({
  maxConcurrentJobs: z.number().min(1).max(20).optional(),
  maxTasksPerJob: z.number().min(1).max(1000).optional(),
  timeoutMs: z.number().min(60000).optional(),
  retryAttempts: z.number().min(0).max(10).optional(),
  retryDelayMs: z.number().min(1000).optional(),
});

export const batchVideoRouter = router({
  // Create a new batch job
  createJob: protectedProcedure
    .input(
      z.object({
        tasks: z.array(videoTaskSchema).min(1),
      })
    )
    .mutation(({ ctx, input }) => {
      const tasks: VideoGenerationTask[] = input.tasks.map((t, index) => ({
        ...t,
        taskId: `task-${index}-${Date.now()}`,
        status: 'pending' as const,
        progress: 0,
      }));

      return BatchVideoService.createJob(String(ctx.user.id), tasks);
    }),

  // Get job details
  getJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(({ input }) => {
      const job = BatchVideoService.getJob(input.jobId);
      if (!job) {
        throw new Error(`Job ${input.jobId} not found`);
      }
      return job;
    }),

  // List all jobs for user
  listJobs: protectedProcedure.query(({ ctx }) => {
    return BatchVideoService.listJobs(String(ctx.user.id));
  }),

  // Start job processing
  startJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(({ input }) => {
      return BatchVideoService.startJob(input.jobId);
    }),

  // Update task progress
  updateTaskProgress: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        taskId: z.string(),
        progress: z.number().min(0).max(100),
      })
    )
    .mutation(({ input }) => {
      return BatchVideoService.updateTaskProgress(input.jobId, input.taskId, Math.round(input.progress));
    }),

  // Complete a task
  completeTask: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        taskId: z.string(),
        outputUrl: z.string().url(),
        processingTime: z.number().min(0),
      })
    )
    .mutation(({ input }) => {
      return BatchVideoService.completeTask(
        input.jobId,
        input.taskId,
        input.outputUrl,
        input.processingTime
      );
    }),

  // Fail a task
  failTask: protectedProcedure
    .input(
      z.object({
        jobId: z.string(),
        taskId: z.string(),
        errorMessage: z.string(),
      })
    )
    .mutation(({ input }) => {
      return BatchVideoService.failTask(input.jobId, input.taskId, input.errorMessage);
    }),

  // Cancel a job
  cancelJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(({ input }) => {
      return BatchVideoService.cancelJob(input.jobId);
    }),

  // Get job statistics
  getJobStats: protectedProcedure.query(({ ctx }) => {
    return BatchVideoService.getJobStats(String(ctx.user.id));
  }),

  // Get queue statistics
  getQueueStats: protectedProcedure.query(() => {
    return BatchVideoService.getQueueStats();
  }),

  // Delete a job
  deleteJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(({ input }) => {
      const result = BatchVideoService.deleteJob(input.jobId);
      return { success: result };
    }),

  // Export job configuration
  exportJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(({ input }) => {
      return {
        json: BatchVideoService.exportJob(input.jobId),
        filename: `batch-job-${input.jobId}.json`,
      };
    }),

  // Import job configuration
  importJob: protectedProcedure
    .input(z.object({ jsonString: z.string() }))
    .mutation(({ ctx, input }) => {
      return BatchVideoService.importJob(input.jsonString, String(ctx.user.id));
    }),

  // Retry failed tasks
  retryFailedTasks: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(({ input }) => {
      return BatchVideoService.retryFailedTasks(input.jobId);
    }),

  // Get/Set batch configuration
  getConfig: protectedProcedure.query(() => {
    return BatchVideoService.getConfig();
  }),

  setConfig: protectedProcedure
    .input(batchConfigSchema)
    .mutation(({ input }) => {
      const config = input as any;
      BatchVideoService.setConfig(config);
      return BatchVideoService.getConfig();
    }),
});
