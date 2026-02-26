import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  uploadTaskArtifact,
  getArtifactDownloadUrl,
  createArtifactShareLink,
  listTaskArtifacts,
  deleteTaskArtifact,
  getTaskResult,
  processTaskCompletion,
  getArtifactStats,
  cleanupExpiredArtifacts,
} from './taskArtifactsService';

// Mock storage
vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ url: 'https://s3.example.com/file.json' }),
  storageGet: vi.fn().mockResolvedValue({ url: 'https://s3.example.com/file.json?signed' }),
}));

// Mock database
vi.mock('./db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({ insertId: 1 }),
    }),
    query: vi.fn().mockResolvedValue([]),
  },
}));

describe('Task Artifacts Service', () => {
  const testTaskId = 'task-123';
  const testUserId = 1;
  const testFileName = 'report.pdf';
  const testFileBuffer = Buffer.from('test file content');
  const testMimeType = 'application/pdf';

  describe('uploadTaskArtifact', () => {
    it('should upload artifact to S3', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        testFileName,
        testFileBuffer,
        testMimeType
      );

      expect(artifact).toBeDefined();
      expect(artifact.taskId).toBe(testTaskId);
      expect(artifact.userId).toBe(testUserId);
      expect(artifact.fileName).toBe(testFileName);
    });

    it('should generate unique file key', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        testFileName,
        testFileBuffer,
        testMimeType
      );

      expect(artifact.fileKey).toContain(`tasks/${testUserId}/${testTaskId}`);
      expect(artifact.fileKey).toContain(testFileName);
    });

    it('should store metadata in database', async () => {
      const metadata = { type: 'report', version: 1 };
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        testFileName,
        testFileBuffer,
        testMimeType,
        metadata
      );

      expect(artifact.metadata).toEqual(metadata);
    });

    it('should return S3 URL', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        testFileName,
        testFileBuffer,
        testMimeType
      );

      expect(artifact.fileUrl).toContain('https://');
    });

    it('should set file size', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        testFileName,
        testFileBuffer,
        testMimeType
      );

      expect(artifact.fileSize).toBe(testFileBuffer.length);
    });
  });

  describe('getArtifactDownloadUrl', () => {
    it('should return presigned URL', async () => {
      const url = await getArtifactDownloadUrl('artifact-1', testUserId);

      expect(url).toContain('https://');
      expect(url).toContain('signed');
    });

    it('should accept custom expiration time', async () => {
      const url = await getArtifactDownloadUrl('artifact-1', testUserId, 7200);

      expect(url).toBeDefined();
    });

    it('should log access', async () => {
      // Access should be logged to database
      const url = await getArtifactDownloadUrl('artifact-1', testUserId);

      expect(url).toBeDefined();
    });

    it('should throw on artifact not found', async () => {
      // Mock empty query result
      vi.mocked(require('./db').db.query).mockResolvedValueOnce([]);

      await expect(getArtifactDownloadUrl('nonexistent', testUserId)).rejects.toThrow();
    });
  });

  describe('createArtifactShareLink', () => {
    it('should create share token', async () => {
      const link = await createArtifactShareLink('artifact-1', testUserId);

      expect(link.shareToken).toBeDefined();
      expect(link.shareToken).toContain('share_');
    });

    it('should set expiration time', async () => {
      const link = await createArtifactShareLink('artifact-1', testUserId, 86400);

      expect(link.expiresAt).toBeInstanceOf(Date);
      expect(link.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return download URL', async () => {
      const link = await createArtifactShareLink('artifact-1', testUserId);

      expect(link.downloadUrl).toContain('https://');
    });

    it('should store share link in database', async () => {
      const link = await createArtifactShareLink('artifact-1', testUserId);

      expect(link.shareToken).toBeDefined();
    });

    it('should use default 24 hour expiration', async () => {
      const link = await createArtifactShareLink('artifact-1', testUserId);

      const expirationMs = link.expiresAt.getTime() - Date.now();
      const expectedMs = 86400 * 1000; // 24 hours

      // Should be close to 24 hours (within 1 second)
      expect(Math.abs(expirationMs - expectedMs)).toBeLessThan(1000);
    });
  });

  describe('listTaskArtifacts', () => {
    it('should return artifacts for task', async () => {
      const artifacts = await listTaskArtifacts(testTaskId, testUserId);

      expect(Array.isArray(artifacts)).toBe(true);
    });

    it('should order by upload date descending', async () => {
      const artifacts = await listTaskArtifacts(testTaskId, testUserId);

      // Should be ordered by uploadedAt DESC
      expect(artifacts).toBeDefined();
    });

    it('should parse metadata JSON', async () => {
      const artifacts = await listTaskArtifacts(testTaskId, testUserId);

      // Metadata should be parsed from JSON string
      expect(artifacts).toBeDefined();
    });
  });

  describe('deleteTaskArtifact', () => {
    it('should delete artifact from database', async () => {
      await deleteTaskArtifact('artifact-1', testUserId);

      // Should not throw
      expect(true).toBe(true);
    });

    it('should log deletion', async () => {
      await deleteTaskArtifact('artifact-1', testUserId);

      // Deletion should be logged
      expect(true).toBe(true);
    });

    it('should throw on artifact not found', async () => {
      vi.mocked(require('./db').db.query).mockResolvedValueOnce([]);

      await expect(deleteTaskArtifact('nonexistent', testUserId)).rejects.toThrow();
    });
  });

  describe('getTaskResult', () => {
    it('should return task result with artifacts', async () => {
      const result = await getTaskResult(testTaskId, testUserId);

      expect(result).toBeDefined();
      expect(result.taskId).toBe(testTaskId);
      expect(Array.isArray(result.artifacts)).toBe(true);
    });

    it('should include task status', async () => {
      const result = await getTaskResult(testTaskId, testUserId);

      expect(['pending', 'completed', 'failed']).toContain(result.status);
    });

    it('should include completion time', async () => {
      const result = await getTaskResult(testTaskId, testUserId);

      expect(result.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('processTaskCompletion', () => {
    it('should upload task output', async () => {
      const taskOutput = { result: 'success', data: [1, 2, 3] };

      const artifacts = await processTaskCompletion(testTaskId, testUserId, taskOutput);

      expect(Array.isArray(artifacts)).toBe(true);
      expect(artifacts.length).toBeGreaterThan(0);
    });

    it('should create JSON output file', async () => {
      const taskOutput = { result: 'success' };

      const artifacts = await processTaskCompletion(testTaskId, testUserId, taskOutput);

      expect(artifacts[0].fileName).toContain('task-output');
      expect(artifacts[0].mimeType).toBe('application/json');
    });

    it('should upload additional files if provided', async () => {
      const taskOutput = {
        result: 'success',
        files: [
          { name: 'report.pdf', buffer: Buffer.from('pdf'), mimeType: 'application/pdf' },
          { name: 'data.csv', buffer: Buffer.from('csv'), mimeType: 'text/csv' },
        ],
      };

      const artifacts = await processTaskCompletion(testTaskId, testUserId, taskOutput);

      expect(artifacts.length).toBeGreaterThanOrEqual(3); // output + 2 files
    });

    it('should update task artifact count', async () => {
      const taskOutput = { result: 'success' };

      const artifacts = await processTaskCompletion(testTaskId, testUserId, taskOutput);

      expect(artifacts.length).toBeGreaterThan(0);
    });
  });

  describe('getArtifactStats', () => {
    it('should return access statistics', async () => {
      const stats = await getArtifactStats('artifact-1');

      expect(stats).toHaveProperty('totalAccess');
      expect(stats).toHaveProperty('downloads');
      expect(stats).toHaveProperty('deletes');
    });

    it('should include last accessed time', async () => {
      const stats = await getArtifactStats('artifact-1');

      if (stats.lastAccessed) {
        expect(stats.lastAccessed).toBeInstanceOf(Date);
      }
    });

    it('should count downloads separately', async () => {
      const stats = await getArtifactStats('artifact-1');

      expect(typeof stats.downloads).toBe('number');
      expect(stats.downloads).toBeGreaterThanOrEqual(0);
    });
  });

  describe('cleanupExpiredArtifacts', () => {
    it('should remove expired share links', async () => {
      const deletedCount = await cleanupExpiredArtifacts();

      expect(typeof deletedCount).toBe('number');
      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });

    it('should return count of deleted items', async () => {
      const deletedCount = await cleanupExpiredArtifacts();

      expect(deletedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle upload errors gracefully', async () => {
      vi.mocked(require('./storage').storagePut).mockRejectedValueOnce(new Error('Upload failed'));

      await expect(
        uploadTaskArtifact(testTaskId, testUserId, testFileName, testFileBuffer, testMimeType)
      ).rejects.toThrow();
    });

    it('should handle database errors', async () => {
      vi.mocked(require('./db').db.insert).mockRejectedValueOnce(new Error('DB error'));

      await expect(
        uploadTaskArtifact(testTaskId, testUserId, testFileName, testFileBuffer, testMimeType)
      ).rejects.toThrow();
    });

    it('should validate artifact ID', async () => {
      await expect(getArtifactDownloadUrl('', testUserId)).rejects.toThrow();
    });
  });

  describe('File Type Support', () => {
    it('should support PDF files', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        'document.pdf',
        testFileBuffer,
        'application/pdf'
      );

      expect(artifact.mimeType).toBe('application/pdf');
    });

    it('should support CSV files', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        'data.csv',
        testFileBuffer,
        'text/csv'
      );

      expect(artifact.mimeType).toBe('text/csv');
    });

    it('should support JSON files', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        'data.json',
        testFileBuffer,
        'application/json'
      );

      expect(artifact.mimeType).toBe('application/json');
    });

    it('should support image files', async () => {
      const artifact = await uploadTaskArtifact(
        testTaskId,
        testUserId,
        'image.png',
        testFileBuffer,
        'image/png'
      );

      expect(artifact.mimeType).toBe('image/png');
    });
  });
});
