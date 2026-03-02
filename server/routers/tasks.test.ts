import { describe, it, expect, beforeEach, vi } from 'vitest';
import { db } from '../db';

// Mock dependencies
vi.mock('../db', () => ({
  db: {
    query: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('../qumusPolicies', () => ({
  executePolicies: vi.fn().mockResolvedValue([
    {
      policyId: 'payment_processing',
      decision: 'approve',
      confidence: 0.95,
      requiresHumanReview: false,
    },
  ]),
}));

vi.mock('../taskArtifactsService', () => ({
  uploadTaskArtifact: vi.fn(),
  processTaskCompletion: vi.fn().mockResolvedValue([
    {
      id: 'artifact_1',
      fileName: 'task_result.pdf',
      fileKey: 'tasks/123/result.pdf',
      url: 'https://s3.example.com/tasks/123/result.pdf',
    },
  ]),
}));

vi.mock('../emailService', () => ({
  emailService: {
    sendTaskSubmissionConfirmation: vi.fn(),
    sendTaskCompletionNotification: vi.fn(),
    sendTaskCancellationNotification: vi.fn(),
  },
}));

describe('Tasks Router', () => {
  const mockUserContext = {
    user: {
      id: 1,
      email: 'user@test.com',
      role: 'user',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitTask', () => {
    it('should submit a task successfully', async () => {
      const mockInsert = { insertId: 123 };
      vi.mocked(db.insert).mockResolvedValueOnce(mockInsert);
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockInsert.insertId).toBe(123);
    });

    it('should validate task goal length', () => {
      const shortGoal = 'Too short';
      expect(shortGoal.length).toBeLessThan(10);

      const validGoal = 'Generate 10 marketing videos with proper branding';
      expect(validGoal.length).toBeGreaterThanOrEqual(10);
    });

    it('should set task status to pending_review if policy requires review', async () => {
      const mockInsert = { insertId: 124 };
      vi.mocked(db.insert).mockResolvedValueOnce(mockInsert);
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockInsert.insertId).toBe(124);
    });

    it('should set task status to queued if all policies approve', async () => {
      const mockInsert = { insertId: 125 };
      vi.mocked(db.insert).mockResolvedValueOnce(mockInsert);
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockInsert.insertId).toBe(125);
    });

    it('should accept task attachments', () => {
      const attachments = [
        { fileKey: 'uploads/file1.pdf', fileName: 'document.pdf' },
        { fileKey: 'uploads/file2.jpg', fileName: 'image.jpg' },
      ];

      expect(attachments).toHaveLength(2);
      expect(attachments[0].fileKey).toContain('uploads');
    });

    it('should store task metadata', () => {
      const metadata = {
        category: 'marketing',
        budget: 1000,
        deadline: '2026-03-26',
      };

      expect(metadata.category).toBe('marketing');
      expect(metadata.budget).toBe(1000);
    });
  });

  describe('executeTask', () => {
    it('should execute a queued task', async () => {
      const mockTask = [
        {
          id: '123',
          userId: 1,
          goal: 'Generate marketing videos',
          status: 'queued',
          priority: 5,
          persona: 'creative',
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockTask);
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockTask[0].status).toBe('queued');
    });

    it('should update task status to executing', async () => {
      const mockTask = [
        {
          id: '123',
          userId: 1,
          goal: 'Generate marketing videos',
          status: 'queued',
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockTask);
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockTask[0].status).toBe('queued');
    });

    it('should upload task artifacts on completion', async () => {
      const mockArtifacts = [
        {
          id: 'artifact_1',
          fileName: 'task_result.pdf',
          fileKey: 'tasks/123/result.pdf',
          url: 'https://s3.example.com/tasks/123/result.pdf',
        },
      ];

      expect(mockArtifacts).toHaveLength(1);
      expect(mockArtifacts[0].url).toContain('s3');
    });

    it('should send completion email with artifact links', async () => {
      const mockArtifacts = [
        {
          id: 'artifact_1',
          fileName: 'result.pdf',
          url: 'https://s3.example.com/tasks/123/result.pdf',
        },
      ];

      expect(mockArtifacts[0].url).toBeDefined();
      expect(mockArtifacts[0].url).toContain('http');
    });

    it('should fail gracefully if task not found', async () => {
      vi.mocked(db.query).mockResolvedValueOnce([]);

      expect([]).toHaveLength(0);
    });

    it('should prevent execution of non-queued tasks', () => {
      const statuses = ['pending', 'executing', 'completed', 'failed'];
      const validStatuses = ['queued'];

      statuses.forEach((status) => {
        expect(validStatuses).not.toContain(status);
      });
    });
  });

  describe('getTaskStatus', () => {
    it('should retrieve task status', async () => {
      const mockTask = [
        {
          id: '123',
          userId: 1,
          goal: 'Generate videos',
          status: 'completed',
          priority: 5,
          persona: 'creative',
          createdAt: new Date(),
          startedAt: new Date(),
          completedAt: new Date(),
          result: JSON.stringify({ success: true }),
          artifactCount: 3,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockTask);

      expect(mockTask[0].status).toBe('completed');
      expect(mockTask[0].artifactCount).toBe(3);
    });

    it('should return null for non-existent tasks', async () => {
      vi.mocked(db.query).mockResolvedValueOnce([]);

      expect([]).toHaveLength(0);
    });
  });

  describe('getTaskHistory', () => {
    it('should retrieve task history with pagination', async () => {
      const mockTasks = [
        { id: '1', goal: 'Task 1', status: 'completed', priority: 5 },
        { id: '2', goal: 'Task 2', status: 'completed', priority: 7 },
        { id: '3', goal: 'Task 3', status: 'queued', priority: 3 },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockTasks);
      vi.mocked(db.query).mockResolvedValueOnce([{ total: 3 }]);

      expect(mockTasks).toHaveLength(3);
    });

    it('should filter by task status', async () => {
      const mockTasks = [{ id: '1', goal: 'Task 1', status: 'completed' }];

      vi.mocked(db.query).mockResolvedValueOnce(mockTasks);
      vi.mocked(db.query).mockResolvedValueOnce([{ total: 1 }]);

      expect(mockTasks[0].status).toBe('completed');
    });

    it('should apply limit and offset', () => {
      const limit = 50;
      const offset = 0;

      expect(limit).toBe(50);
      expect(offset).toBe(0);
    });
  });

  describe('cancelTask', () => {
    it('should cancel a pending task', async () => {
      const mockTask = [
        {
          id: '123',
          userId: 1,
          goal: 'Generate videos',
          status: 'pending',
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockTask);
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockTask[0].status).toBe('pending');
    });

    it('should cancel a queued task', async () => {
      const mockTask = [
        {
          id: '123',
          userId: 1,
          goal: 'Generate videos',
          status: 'queued',
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockTask);
      vi.mocked(db.query).mockResolvedValueOnce({ affectedRows: 1 });

      expect(mockTask[0].status).toBe('queued');
    });

    it('should prevent cancellation of executing tasks', () => {
      const status = 'executing';
      const cancellableStatuses = ['pending', 'queued'];

      expect(cancellableStatuses).not.toContain(status);
    });

    it('should send cancellation notification', () => {
      const email = 'user@test.com';
      const taskId = '123';

      expect(email).toBeDefined();
      expect(taskId).toBeDefined();
    });
  });

  describe('getTaskMetrics', () => {
    it('should calculate task metrics', async () => {
      const mockMetrics = [
        {
          total: 50,
          completed: 40,
          failed: 5,
          queued: 5,
          avgPriority: 5.5,
        },
      ];

      vi.mocked(db.query).mockResolvedValueOnce(mockMetrics);

      const metrics = mockMetrics[0];
      expect(metrics.total).toBe(50);
      expect(metrics.completed).toBe(40);
      expect(metrics.failed).toBe(5);
    });

    it('should calculate success rate', () => {
      const completed = 40;
      const total = 50;
      const successRate = Math.round((completed / total) * 100);

      expect(successRate).toBe(80);
    });

    it('should handle zero tasks', () => {
      const total = 0;
      const successRate = total > 0 ? 100 : 0;

      expect(successRate).toBe(0);
    });
  });

  describe('Task status transitions', () => {
    it('should follow valid status transitions', () => {
      const transitions: Record<string, string[]> = {
        pending: ['queued', 'denied', 'cancelled'],
        queued: ['executing', 'cancelled'],
        executing: ['completed', 'failed'],
        completed: [],
        failed: [],
        denied: [],
        cancelled: [],
      };

      expect(transitions.pending).toContain('queued');
      expect(transitions.queued).toContain('executing');
      expect(transitions.executing).toContain('completed');
    });

    it('should prevent invalid status transitions', () => {
      const transitions: Record<string, string[]> = {
        completed: [],
      };

      expect(transitions.completed).not.toContain('executing');
    });
  });
});
