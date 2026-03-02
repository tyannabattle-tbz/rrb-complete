import { describe, it, expect, beforeEach } from 'vitest';
import {
  BatchProcessingManager,
  JobPriority,
} from './batchProcessing';

describe('Batch Processing', () => {
  let manager: BatchProcessingManager;

  beforeEach(() => {
    manager = new BatchProcessingManager();
  });

  describe('Queue Management', () => {
    it('should create a new queue', () => {
      const queue = manager.createQueue('Test Queue', 'Test Description');

      expect(queue).toBeDefined();
      expect(queue.name).toBe('Test Queue');
      expect(queue.description).toBe('Test Description');
      expect(queue.totalJobs).toBe(0);
      expect(queue.isPaused).toBe(false);
    });

    it('should retrieve all queues', () => {
      manager.createQueue('Queue 1');
      manager.createQueue('Queue 2');

      const queues = manager.getAllQueues();
      expect(queues).toHaveLength(2);
    });

    it('should get queue by ID', () => {
      const created = manager.createQueue('Test Queue');
      const retrieved = manager.getQueue(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it('should pause and resume queue', () => {
      const queue = manager.createQueue('Test Queue');

      manager.pauseQueue(queue.id);
      let updated = manager.getQueue(queue.id);
      expect(updated?.isPaused).toBe(true);

      manager.resumeQueue(queue.id);
      updated = manager.getQueue(queue.id);
      expect(updated?.isPaused).toBe(false);
    });
  });

  describe('Job Management', () => {
    let queueId: string;

    beforeEach(() => {
      const queue = manager.createQueue('Test Queue');
      queueId = queue.id;
    });

    it('should add a job to queue', () => {
      const job = manager.addJob(
        queueId,
        'Test Job',
        { param: 'value' },
        'medium',
        60
      );

      expect(job).toBeDefined();
      expect(job?.title).toBe('Test Job');
      expect(job?.status).toBe('pending');
      expect(job?.priority).toBe('medium');
    });

    it('should add multiple jobs in bulk', () => {
      const jobs = manager.addBulkJobs(queueId, [
        { title: 'Job 1', parameters: { id: 1 } },
        { title: 'Job 2', parameters: { id: 2 } },
        { title: 'Job 3', parameters: { id: 3 } },
      ]);

      expect(jobs).toHaveLength(3);

      const queue = manager.getQueue(queueId);
      expect(queue?.totalJobs).toBe(3);
    });

    it('should get job by ID', () => {
      const created = manager.addJob(queueId, 'Test Job', {});
      const retrieved = manager.getJob(created?.id || '');

      expect(retrieved).toBeDefined();
      expect(retrieved?.title).toBe('Test Job');
    });

    it('should cancel a job', () => {
      const job = manager.addJob(queueId, 'Test Job', {});
      const success = manager.cancelJob(job?.id || '');

      expect(success).toBe(true);

      const cancelled = manager.getJob(job?.id || '');
      expect(cancelled?.status).toBe('cancelled');
    });

    it('should retry a failed job', () => {
      const job = manager.addJob(queueId, 'Test Job', {});
      if (!job) return;

      // Manually set to failed for testing
      job.status = 'failed';
      job.retryCount = 0;

      const success = manager.retryJob(job.id);
      expect(success).toBe(true);

      const retried = manager.getJob(job.id);
      expect(retried?.status).toBe('pending');
      expect(retried?.retryCount).toBe(1);
    });

    it('should not retry if max retries exceeded', () => {
      const job = manager.addJob(queueId, 'Test Job', {});
      if (!job) return;

      job.status = 'failed';
      job.retryCount = job.maxRetries;

      const success = manager.retryJob(job.id);
      expect(success).toBe(false);
    });
  });

  describe('Statistics', () => {
    let queueId: string;

    beforeEach(() => {
      const queue = manager.createQueue('Test Queue');
      queueId = queue.id;
    });

    it('should calculate queue statistics', () => {
      manager.addBulkJobs(queueId, [
        { title: 'Job 1', parameters: {} },
        { title: 'Job 2', parameters: {} },
        { title: 'Job 3', parameters: {} },
      ]);

      const stats = manager.getQueueStatistics(queueId);

      expect(stats).toBeDefined();
      expect(stats?.totalJobs).toBe(3);
      expect(stats?.pendingJobs).toBe(3);
      expect(stats?.completedJobs).toBe(0);
    });

    it('should calculate success rate', () => {
      const jobs = manager.addBulkJobs(queueId, [
        { title: 'Job 1', parameters: {} },
        { title: 'Job 2', parameters: {} },
      ]);

      // Simulate completed job
      if (jobs[0]) {
        jobs[0].status = 'completed';
      }

      const stats = manager.getQueueStatistics(queueId);
      expect(stats?.successRate).toBeGreaterThan(0);
    });

    it('should calculate estimated time remaining', () => {
      manager.addBulkJobs(queueId, [
        { title: 'Job 1', parameters: {}, estimatedTime: 60 },
        { title: 'Job 2', parameters: {}, estimatedTime: 120 },
      ]);

      const stats = manager.getQueueStatistics(queueId);
      expect(stats?.estimatedTimeRemaining).toBeGreaterThan(0);
    });
  });

  describe('Resource Allocation', () => {
    it('should get resource allocation', () => {
      const allocation = manager.getResourceAllocation();

      expect(allocation).toBeDefined();
      expect(allocation.maxConcurrentJobs).toBeGreaterThan(0);
    });

    it('should set resource allocation', () => {
      manager.setResourceAllocation({
        maxConcurrentJobs: 10,
        cpuUsage: 50,
      });

      const allocation = manager.getResourceAllocation();
      expect(allocation.maxConcurrentJobs).toBe(10);
      expect(allocation.cpuUsage).toBe(50);
    });
  });

  describe('Priority Sorting', () => {
    it('should sort jobs by priority', () => {
      const queue = manager.createQueue('Test Queue');

      manager.addJob(queue.id, 'Low Priority', {}, 'low', 60);
      manager.addJob(queue.id, 'Critical', {}, 'critical', 60);
      manager.addJob(queue.id, 'Medium', {}, 'medium', 60);
      manager.addJob(queue.id, 'High', {}, 'high', 60);

      const updated = manager.getQueue(queue.id);
      expect(updated?.jobs[0].priority).toBe('critical');
      expect(updated?.jobs[1].priority).toBe('high');
      expect(updated?.jobs[2].priority).toBe('medium');
      expect(updated?.jobs[3].priority).toBe('low');
    });
  });
});
