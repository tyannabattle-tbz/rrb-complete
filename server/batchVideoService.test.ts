import { describe, it, expect, beforeEach } from 'vitest';
import { BatchVideoService, VideoGenerationTask } from './_core/batchVideoService';

describe('BatchVideoService', () => {
  beforeEach(() => {
    // Reset service state before each test
    BatchVideoService.setConfig({
      maxConcurrentJobs: 5,
      maxTasksPerJob: 100,
      timeoutMs: 3600000,
      retryAttempts: 3,
      retryDelayMs: 5000,
    });
  });

  describe('createJob', () => {
    it('should create a new job', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'A beautiful sunset',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);

      expect(job).toBeDefined();
      expect(job.jobId).toBeDefined();
      expect(job.userId).toBe('user-123');
      expect(job.status).toBe('pending');
      expect(job.videos.length).toBe(1);
    });

    it('should throw error for empty tasks', () => {
      expect(() => {
        BatchVideoService.createJob('user-123', []);
      }).toThrow();
    });

    it('should throw error for too many tasks', () => {
      const tasks = Array(101)
        .fill(null)
        .map((_, i) => ({
          taskId: '',
          prompt: `Video ${i}`,
          duration: 10,
          style: 'cinematic',
          resolution: '1080p' as const,
          status: 'pending' as const,
          progress: 0,
        }));

      expect(() => {
        BatchVideoService.createJob('user-123', tasks);
      }).toThrow();
    });

    it('should assign unique task IDs', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
        {
          taskId: '',
          prompt: 'Video 2',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);

      expect(job.videos[0].taskId).not.toBe(job.videos[1].taskId);
    });
  });

  describe('getJob', () => {
    it('should retrieve a job by ID', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'A beautiful sunset',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const createdJob = BatchVideoService.createJob('user-123', tasks);
      const retrievedJob = BatchVideoService.getJob(createdJob.jobId);

      expect(retrievedJob).toBeDefined();
      expect(retrievedJob?.jobId).toBe(createdJob.jobId);
    });

    it('should return null for non-existent job', () => {
      const job = BatchVideoService.getJob('non-existent');
      expect(job).toBeNull();
    });
  });

  describe('listJobs', () => {
    it('should list all jobs for a user', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      BatchVideoService.createJob('user-123', tasks);
      BatchVideoService.createJob('user-123', tasks);

      const jobs = BatchVideoService.listJobs('user-123');
      expect(jobs.length).toBe(2);
    });

    it('should not list jobs from other users', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      BatchVideoService.createJob('user-123', tasks);
      BatchVideoService.createJob('user-456', tasks);

      const jobs = BatchVideoService.listJobs('user-123');
      expect(jobs.length).toBe(1);
      expect(jobs[0].userId).toBe('user-123');
    });
  });

  describe('startJob', () => {
    it('should start a pending job', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const started = BatchVideoService.startJob(job.jobId);

      expect(started.status).toBe('processing');
      expect(started.startedAt).toBeDefined();
    });

    it('should throw error for non-existent job', () => {
      expect(() => {
        BatchVideoService.startJob('non-existent');
      }).toThrow();
    });

    it('should throw error for already started job', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      BatchVideoService.startJob(job.jobId);

      expect(() => {
        BatchVideoService.startJob(job.jobId);
      }).toThrow();
    });
  });

  describe('updateTaskProgress', () => {
    it('should update task progress', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const taskId = job.videos[0].taskId;

      const updated = BatchVideoService.updateTaskProgress(job.jobId, taskId, 50);

      expect(updated.videos[0].progress).toBe(50);
      expect(updated.progress).toBe(50);
    });

    it('should clamp progress between 0 and 100', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const taskId = job.videos[0].taskId;

      const updated = BatchVideoService.updateTaskProgress(job.jobId, taskId, 150);
      expect(updated.videos[0].progress).toBe(100);
    });
  });

  describe('completeTask', () => {
    it('should complete a task', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const taskId = job.videos[0].taskId;

      const updated = BatchVideoService.completeTask(
        job.jobId,
        taskId,
        'https://example.com/video.mp4',
        5000
      );

      expect(updated.videos[0].status).toBe('completed');
      expect(updated.videos[0].outputUrl).toBe('https://example.com/video.mp4');
      expect(updated.videos[0].processingTime).toBe(5000);
    });

    it('should complete job when all tasks are done', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const taskId = job.videos[0].taskId;

      const updated = BatchVideoService.completeTask(
        job.jobId,
        taskId,
        'https://example.com/video.mp4',
        5000
      );

      expect(updated.status).toBe('completed');
      expect(updated.completedAt).toBeDefined();
    });
  });

  describe('failTask', () => {
    it('should fail a task', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const taskId = job.videos[0].taskId;

      const updated = BatchVideoService.failTask(job.jobId, taskId, 'Processing error');

      expect(updated.videos[0].status).toBe('failed');
      expect(updated.videos[0].errorMessage).toBe('Processing error');
    });
  });

  describe('cancelJob', () => {
    it('should cancel a pending job', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const cancelled = BatchVideoService.cancelJob(job.jobId);

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.completedAt).toBeDefined();
    });

    it('should throw error for completed job', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const taskId = job.videos[0].taskId;

      BatchVideoService.completeTask(job.jobId, taskId, 'https://example.com/video.mp4', 5000);

      expect(() => {
        BatchVideoService.cancelJob(job.jobId);
      }).toThrow();
    });
  });

  describe('getJobStats', () => {
    it('should return job statistics', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      BatchVideoService.createJob('user-123', tasks);

      const stats = BatchVideoService.getJobStats('user-123');

      expect(stats).toHaveProperty('totalJobs');
      expect(stats).toHaveProperty('pendingJobs');
      expect(stats).toHaveProperty('processingJobs');
      expect(stats).toHaveProperty('completedJobs');
      expect(stats).toHaveProperty('failedJobs');
      expect(stats).toHaveProperty('totalVideos');
      expect(stats.totalJobs).toBe(1);
      expect(stats.totalVideos).toBe(1);
    });
  });

  describe('getQueueStats', () => {
    it('should return queue statistics', () => {
      const stats = BatchVideoService.getQueueStats();

      expect(stats).toHaveProperty('totalJobs');
      expect(stats).toHaveProperty('processingJobs');
      expect(stats).toHaveProperty('pendingJobs');
      expect(stats).toHaveProperty('queueLength');
    });
  });

  describe('exportJob', () => {
    it('should export job as JSON', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const json = BatchVideoService.exportJob(job.jobId);

      expect(typeof json).toBe('string');
      const parsed = JSON.parse(json);
      expect(parsed.jobId).toBe(job.jobId);
    });
  });

  describe('importJob', () => {
    it('should import job from JSON', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const original = BatchVideoService.createJob('user-123', tasks);
      const json = BatchVideoService.exportJob(original.jobId);

      const imported = BatchVideoService.importJob(json, 'user-456');

      expect(imported.userId).toBe('user-456');
      expect(imported.videos.length).toBe(1);
    });

    it('should throw error for invalid JSON', () => {
      expect(() => {
        BatchVideoService.importJob('invalid json', 'user-123');
      }).toThrow();
    });
  });

  describe('retryFailedTasks', () => {
    it('should retry failed tasks', () => {
      const tasks: VideoGenerationTask[] = [
        {
          taskId: '',
          prompt: 'Video 1',
          duration: 10,
          style: 'cinematic',
          resolution: '1080p',
          status: 'pending',
          progress: 0,
        },
      ];

      const job = BatchVideoService.createJob('user-123', tasks);
      const taskId = job.videos[0].taskId;

      BatchVideoService.failTask(job.jobId, taskId, 'Error');
      const retried = BatchVideoService.retryFailedTasks(job.jobId);

      expect(retried.videos[0].status).toBe('pending');
      expect(retried.videos[0].errorMessage).toBeUndefined();
    });
  });
});
