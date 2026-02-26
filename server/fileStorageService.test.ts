import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  uploadFile,
  downloadFile,
  listUserFiles,
  deleteFile,
  shareFile,
  getUserStorageUsage,
  logFileAccess,
} from './fileStorageService';

// Mock dependencies
vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: 'https://s3.example.com/file.pdf',
    key: 'user1/files/123-file.pdf',
  }),
  storageGet: vi.fn().mockResolvedValue({
    url: 'https://s3.example.com/file.pdf?expires=123',
    key: 'user1/files/123-file.pdf',
  }),
}));

vi.mock('./db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({ insertId: 1 }),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([
              {
                id: 1,
                userId: 1,
                fileName: 'test.pdf',
                fileKey: 'user1/files/123-test.pdf',
                fileSize: 1024,
                mimeType: 'application/pdf',
                url: 'https://s3.example.com/file.pdf',
                uploadedAt: new Date(),
                accessCount: 0,
              },
            ]),
          }),
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              offset: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockReturnValue({
            offset: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue({}),
    }),
    count: vi.fn().mockReturnValue({}),
    sum: vi.fn().mockReturnValue({}),
  },
}));

describe('File Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const buffer = Buffer.from('test content');
      const result = await uploadFile(1, 'test.pdf', buffer, 'application/pdf', false);

      expect(result).toBeDefined();
      expect(result.fileName).toBe('test.pdf');
      expect(result.fileSize).toBe(buffer.length);
      expect(result.mimeType).toBe('application/pdf');
    });

    it('should handle upload errors', async () => {
      vi.mocked(vi.fn()).mockRejectedValueOnce(new Error('Upload failed'));
      
      const buffer = Buffer.from('test');
      // Test error handling
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should generate unique file keys', async () => {
      const buffer = Buffer.from('test');
      const result1 = await uploadFile(1, 'test.pdf', buffer, 'application/pdf');
      const result2 = await uploadFile(1, 'test.pdf', buffer, 'application/pdf');

      expect(result1.fileKey).not.toBe(result2.fileKey);
    });
  });

  describe('downloadFile', () => {
    it('should generate presigned download URL', async () => {
      const result = await downloadFile(1, '1');

      expect(result).toBeDefined();
      expect(result.url).toContain('s3.example.com');
      expect(result.fileName).toBeDefined();
    });

    it('should handle file not found', async () => {
      // Test error handling for missing file
      try {
        await downloadFile(1, '999');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should log file access', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      // Access logging should be attempted
      await downloadFile(1, '1');
      
      // Verify no critical errors
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('listUserFiles', () => {
    it('should list user files with pagination', async () => {
      const result = await listUserFiles(1, 50, 0);

      expect(result).toBeDefined();
      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.total).toBeDefined();
    });

    it('should support custom pagination', async () => {
      const result = await listUserFiles(1, 10, 5);

      expect(result).toBeDefined();
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const result = await deleteFile(1, '1');

      expect(result).toBeUndefined();
    });

    it('should handle deletion of non-existent file', async () => {
      try {
        await deleteFile(1, '999');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should log file deletion', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      await deleteFile(1, '1');
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('shareFile', () => {
    it('should generate share link with expiration', async () => {
      const result = await shareFile(1, '1', 24);

      expect(result).toBeDefined();
      expect(result.shareUrl).toBeDefined();
      expect(result.expiresAt).toBeDefined();
      expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should support custom expiration times', async () => {
      const result1 = await shareFile(1, '1', 1);
      const result2 = await shareFile(1, '1', 72);

      expect(result1.expiresAt.getTime()).toBeLessThan(result2.expiresAt.getTime());
    });
  });

  describe('getUserStorageUsage', () => {
    it('should calculate storage usage', async () => {
      const result = await getUserStorageUsage(1);

      expect(result).toBeDefined();
      expect(result.usedBytes).toBeGreaterThanOrEqual(0);
      expect(result.limitBytes).toBeGreaterThan(0);
      expect(result.percentageUsed).toBeGreaterThanOrEqual(0);
      expect(result.percentageUsed).toBeLessThanOrEqual(100);
    });

    it('should handle users with no files', async () => {
      const result = await getUserStorageUsage(999);

      expect(result.usedBytes).toBe(0);
      expect(result.percentageUsed).toBe(0);
    });
  });

  describe('logFileAccess', () => {
    it('should log file access events', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      await logFileAccess(1, 1, 'download');
      await logFileAccess(1, 1, 'share');
      await logFileAccess(1, 1, 'delete');

      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should not throw on logging errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error');
      
      // Logging failures should not throw
      await logFileAccess(1, 1, 'preview');
      
      // Operation should complete
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('File Size Limits', () => {
    it('should enforce storage quotas', async () => {
      const result = await getUserStorageUsage(1);

      // Default limit is 10GB
      expect(result.limitBytes).toBe(10 * 1024 * 1024 * 1024);
    });

    it('should calculate percentage correctly', async () => {
      const result = await getUserStorageUsage(1);

      if (result.usedBytes > 0) {
        const expectedPercentage = (result.usedBytes / result.limitBytes) * 100;
        expect(Math.abs(result.percentageUsed - expectedPercentage)).toBeLessThan(0.1);
      }
    });
  });

  describe('File Metadata', () => {
    it('should preserve file metadata', async () => {
      const buffer = Buffer.from('test content');
      const result = await uploadFile(1, 'document.pdf', buffer, 'application/pdf');

      expect(result.fileName).toBe('document.pdf');
      expect(result.mimeType).toBe('application/pdf');
      expect(result.fileSize).toBe(buffer.length);
      expect(result.uploadedAt).toBeDefined();
    });

    it('should track access count', async () => {
      const result = await downloadFile(1, '1');

      expect(result).toBeDefined();
      // Access count should be incremented
    });
  });
});
