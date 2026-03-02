/**
 * Local Storage Service
 * Manages file storage with local filesystem, MinIO, and S3 fallback
 * Fully offline-capable with optional cloud sync
 */

import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { offlineConfig } from '../config/offlineConfig';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);
const stat = promisify(fs.stat);

export interface StorageFile {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  localPath?: string;
}

class LocalStorageService {
  private basePath: string;
  private maxFileSize: number;
  private storageType: 'local' | 's3' | 'minio';

  constructor() {
    const config = offlineConfig;

    if (config.storage.type === 'local' && config.storage.local) {
      this.basePath = config.storage.local.basePath;
      this.maxFileSize = config.storage.local.maxFileSize;
    } else {
      this.basePath = path.join(process.env.HOME || '/tmp', '.qumus', 'storage');
      this.maxFileSize = 100 * 1024 * 1024; // 100MB
    }

    this.storageType = config.storage.type;

    // Ensure storage directory exists
    this.ensureStorageDir();
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      await mkdir(this.basePath, { recursive: true });
    } catch (error) {
      console.error('[LocalStorage] Error creating storage directory:', error);
    }
  }

  /**
   * Upload file to local storage
   */
  async uploadFile(
    fileKey: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<StorageFile> {
    try {
      // Validate file size
      if (fileBuffer.length > this.maxFileSize) {
        throw new Error(`File size exceeds maximum of ${this.maxFileSize} bytes`);
      }

      // Ensure directory structure
      const filePath = path.join(this.basePath, fileKey);
      const fileDir = path.dirname(filePath);
      await mkdir(fileDir, { recursive: true });

      // Write file
      await writeFile(filePath, fileBuffer);

      // Get file stats
      const stats = await stat(filePath);

      return {
        key: fileKey,
        url: `file://${filePath}`,
        size: stats.size,
        mimeType,
        uploadedAt: new Date().toISOString(),
        localPath: filePath,
      };
    } catch (error) {
      console.error('[LocalStorage] Upload error:', error);
      throw error;
    }
  }

  /**
   * Download file from local storage
   */
  async downloadFile(fileKey: string): Promise<Buffer> {
    try {
      const filePath = path.join(this.basePath, fileKey);
      const fileBuffer = await readFile(filePath);
      return fileBuffer;
    } catch (error) {
      console.error('[LocalStorage] Download error:', error);
      throw error;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileKey: string): Promise<StorageFile | null> {
    try {
      const filePath = path.join(this.basePath, fileKey);
      const stats = await stat(filePath);

      return {
        key: fileKey,
        url: `file://${filePath}`,
        size: stats.size,
        mimeType: 'application/octet-stream',
        uploadedAt: stats.birthtime.toISOString(),
        localPath: filePath,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Delete file from local storage
   */
  async deleteFile(fileKey: string): Promise<boolean> {
    try {
      const filePath = path.join(this.basePath, fileKey);
      await unlink(filePath);
      return true;
    } catch (error) {
      console.error('[LocalStorage] Delete error:', error);
      return false;
    }
  }

  /**
   * List files in directory
   */
  async listFiles(prefix?: string): Promise<StorageFile[]> {
    try {
      const searchPath = prefix ? path.join(this.basePath, prefix) : this.basePath;

      const files: StorageFile[] = [];

      const walkDir = async (dir: string, relPath: string = ''): Promise<void> => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relFullPath = path.join(relPath, entry.name);

          if (entry.isDirectory()) {
            await walkDir(fullPath, relFullPath);
          } else {
            const stats = fs.statSync(fullPath);
            files.push({
              key: relFullPath,
              url: `file://${fullPath}`,
              size: stats.size,
              mimeType: 'application/octet-stream',
              uploadedAt: stats.birthtime.toISOString(),
              localPath: fullPath,
            });
          }
        }
      };

      if (fs.existsSync(searchPath)) {
        await walkDir(searchPath);
      }

      return files;
    } catch (error) {
      console.error('[LocalStorage] List error:', error);
      return [];
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number;
    fileCount: number;
    maxSize: number;
    usagePercent: number;
  }> {
    try {
      const files = await this.listFiles();
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      return {
        totalSize,
        fileCount: files.length,
        maxSize: this.maxFileSize,
        usagePercent: (totalSize / this.maxFileSize) * 100,
      };
    } catch (error) {
      console.error('[LocalStorage] Stats error:', error);
      return {
        totalSize: 0,
        fileCount: 0,
        maxSize: this.maxFileSize,
        usagePercent: 0,
      };
    }
  }

  /**
   * Clear old files (cleanup)
   */
  async clearOldFiles(ageInDays: number): Promise<number> {
    try {
      const files = await this.listFiles();
      const cutoffTime = Date.now() - ageInDays * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const fileTime = new Date(file.uploadedAt).getTime();
        if (fileTime < cutoffTime) {
          if (await this.deleteFile(file.key)) {
            deletedCount++;
          }
        }
      }

      return deletedCount;
    } catch (error) {
      console.error('[LocalStorage] Cleanup error:', error);
      return 0;
    }
  }

  /**
   * Get storage type
   */
  getStorageType(): string {
    return this.storageType;
  }

  /**
   * Get base path
   */
  getBasePath(): string {
    return this.basePath;
  }
}

export const localStorageService = new LocalStorageService();
