/**
 * Commercial MP3 Uploader & Integration Service
 * 
 * Handles uploading real commercial MP3 files and mapping them to commercial IDs
 * Supports batch uploads, validation, and CDN URL generation
 */

import { storagePut, storageGet } from '../storage';

export interface CommercialMP3 {
  commercialId: string;
  filename: string;
  s3Key: string;
  cdnUrl: string;
  duration: number;      // Seconds
  fileSize: number;      // Bytes
  bitrate: number;       // kbps
  uploadedAt: number;
  uploadedBy: string;
}

export interface CommercialMP3Batch {
  batchId: string;
  commercials: CommercialMP3[];
  totalSize: number;
  uploadedAt: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
}

/**
 * Commercial MP3 Uploader
 */
export class CommercialMP3Uploader {
  private uploadedCommercials: Map<string, CommercialMP3> = new Map();
  private batches: Map<string, CommercialMP3Batch> = new Map();

  /**
   * Upload a single commercial MP3
   */
  async uploadCommercial(
    commercialId: string,
    fileBuffer: Buffer,
    filename: string,
    metadata: {
      duration: number;
      bitrate: number;
      uploadedBy: string;
    }
  ): Promise<CommercialMP3> {
    try {
      // Validate file
      if (fileBuffer.length === 0) {
        throw new Error('File is empty');
      }

      if (fileBuffer.length > 50 * 1024 * 1024) {
        throw new Error('File exceeds 50MB limit');
      }

      // Generate S3 key with random suffix to prevent enumeration
      const randomSuffix = Math.random().toString(36).substr(2, 8);
      const s3Key = `commercials/${commercialId}/${filename}-${randomSuffix}.mp3`;

      // Upload to S3
      const { url: cdnUrl } = await storagePut(s3Key, fileBuffer, 'audio/mpeg');

      const commercial: CommercialMP3 = {
        commercialId,
        filename,
        s3Key,
        cdnUrl,
        duration: metadata.duration,
        fileSize: fileBuffer.length,
        bitrate: metadata.bitrate,
        uploadedAt: Date.now(),
        uploadedBy: metadata.uploadedBy,
      };

      this.uploadedCommercials.set(commercialId, commercial);
      console.log(`[CommercialMP3Uploader] Uploaded: ${commercialId} (${filename})`);

      return commercial;
    } catch (error) {
      console.error(`[CommercialMP3Uploader] Upload failed for ${commercialId}:`, error);
      throw error;
    }
  }

  /**
   * Upload batch of commercials
   */
  async uploadBatch(
    commercials: Array<{
      commercialId: string;
      fileBuffer: Buffer;
      filename: string;
      duration: number;
      bitrate: number;
    }>,
    uploadedBy: string
  ): Promise<CommercialMP3Batch> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const batch: CommercialMP3Batch = {
      batchId,
      commercials: [],
      totalSize: 0,
      uploadedAt: Date.now(),
      status: 'uploading',
    };

    this.batches.set(batchId, batch);

    try {
      for (const commercial of commercials) {
        const uploaded = await this.uploadCommercial(
          commercial.commercialId,
          commercial.fileBuffer,
          commercial.filename,
          {
            duration: commercial.duration,
            bitrate: commercial.bitrate,
            uploadedBy,
          }
        );

        batch.commercials.push(uploaded);
        batch.totalSize += uploaded.fileSize;
      }

      batch.status = 'completed';
      console.log(`[CommercialMP3Uploader] Batch completed: ${batchId} (${batch.commercials.length} files)`);

      return batch;
    } catch (error) {
      batch.status = 'failed';
      console.error(`[CommercialMP3Uploader] Batch failed: ${batchId}`, error);
      throw error;
    }
  }

  /**
   * Get commercial MP3 by ID
   */
  getCommercial(commercialId: string): CommercialMP3 | undefined {
    return this.uploadedCommercials.get(commercialId);
  }

  /**
   * Get all uploaded commercials
   */
  getAllCommercials(): CommercialMP3[] {
    return Array.from(this.uploadedCommercials.values());
  }

  /**
   * Get CDN URL for a commercial
   */
  getCDNUrl(commercialId: string): string | undefined {
    const commercial = this.uploadedCommercials.get(commercialId);
    return commercial?.cdnUrl;
  }

  /**
   * Get presigned URL for a commercial (for temporary access)
   */
  async getPresignedUrl(commercialId: string, expiresIn: number = 3600): Promise<string | undefined> {
    const commercial = this.uploadedCommercials.get(commercialId);
    if (!commercial) return undefined;

    try {
      const { url } = await storageGet(commercial.s3Key, expiresIn);
      return url;
    } catch (error) {
      console.error(`[CommercialMP3Uploader] Failed to get presigned URL:`, error);
      return undefined;
    }
  }

  /**
   * Delete a commercial
   */
  deleteCommercial(commercialId: string): boolean {
    return this.uploadedCommercials.delete(commercialId);
  }

  /**
   * Get batch by ID
   */
  getBatch(batchId: string): CommercialMP3Batch | undefined {
    return this.batches.get(batchId);
  }

  /**
   * Get all batches
   */
  getAllBatches(): CommercialMP3Batch[] {
    return Array.from(this.batches.values());
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const allCommercials = this.getAllCommercials();
    const totalSize = allCommercials.reduce((sum, c) => sum + c.fileSize, 0);
    const totalDuration = allCommercials.reduce((sum, c) => sum + c.duration, 0);
    const avgBitrate = allCommercials.length > 0
      ? Math.round(allCommercials.reduce((sum, c) => sum + c.bitrate, 0) / allCommercials.length)
      : 0;

    return {
      totalCommercials: allCommercials.length,
      totalSize,
      totalDuration,
      avgBitrate,
      totalBatches: this.batches.size,
      completedBatches: Array.from(this.batches.values()).filter(b => b.status === 'completed').length,
      failedBatches: Array.from(this.batches.values()).filter(b => b.status === 'failed').length,
    };
  }

  /**
   * Export all data
   */
  exportData() {
    return {
      commercials: Array.from(this.uploadedCommercials.values()),
      batches: Array.from(this.batches.values()),
      statistics: this.getStatistics(),
      exportedAt: Date.now(),
    };
  }
}

// Singleton instance
let uploaderInstance: CommercialMP3Uploader | null = null;

export function getCommercialMP3Uploader(): CommercialMP3Uploader {
  if (!uploaderInstance) {
    uploaderInstance = new CommercialMP3Uploader();
  }
  return uploaderInstance;
}
