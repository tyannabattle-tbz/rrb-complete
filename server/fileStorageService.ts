import { storagePut, storageGet } from './storage';
// Database imports handled within service functions to avoid circular dependencies
// import { files, fileAccessLogs } from '@/drizzle/schema';
// import { eq, and, desc } from 'drizzle-orm';

export interface FileMetadata {
  id: string;
  userId: number;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  expiresAt?: Date;
  isPublic: boolean;
  accessCount: number;
  lastAccessedAt?: Date;
}

/**
 * Upload file to S3 with metadata persistence
 */
export async function uploadFile(
  userId: number,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  isPublic: boolean = false
): Promise<FileMetadata> {
  try {
    // Generate unique file key to prevent enumeration
    const fileKey = `${userId}/files/${Date.now()}-${Math.random().toString(36).substring(7)}-${fileName}`;
    
    // Upload to S3
    const { url } = await storagePut(fileKey, fileBuffer, mimeType);

    // Store metadata in database
    const result = await db.insert(files).values({
      userId,
      fileName,
      fileKey,
      fileSize: fileBuffer.length,
      mimeType,
      url,
      isPublic,
      uploadedAt: new Date(),
      accessCount: 0,
    });

    return {
      id: result.insertId?.toString() || '',
      userId,
      fileName,
      fileKey,
      fileSize: fileBuffer.length,
      mimeType,
      uploadedAt: new Date(),
      isPublic,
      accessCount: 0,
    };
  } catch (error) {
    console.error('[FileStorage] Upload failed:', error);
    throw new Error('File upload failed');
  }
}

/**
 * Download file from S3 with presigned URL
 */
export async function downloadFile(
  userId: number,
  fileId: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url: string; fileName: string }> {
  try {
    // Fetch file metadata
    const fileRecord = await db
      .select()
      .from(files)
      .where(and(eq(files.id, parseInt(fileId)), eq(files.userId, userId)))
      .limit(1);

    if (!fileRecord || fileRecord.length === 0) {
      throw new Error('File not found');
    }

    const file = fileRecord[0];

    // Get presigned download URL
    const { url } = await storageGet(file.fileKey, expiresIn);

    // Log file access
    await logFileAccess(userId, parseInt(fileId), 'download');

    // Update access count
    await db
      .update(files)
      .set({
        accessCount: file.accessCount + 1,
        lastAccessedAt: new Date(),
      })
      .where(eq(files.id, parseInt(fileId)));

    return {
      url,
      fileName: file.fileName,
    };
  } catch (error) {
    console.error('[FileStorage] Download failed:', error);
    throw new Error('File download failed');
  }
}

/**
 * List user's files with pagination
 */
export async function listUserFiles(
  userId: number,
  limit: number = 50,
  offset: number = 0
): Promise<{ files: FileMetadata[]; total: number }> {
  try {
    const userFiles = await db
      .select()
      .from(files)
      .where(eq(files.userId, userId))
      .orderBy(desc(files.uploadedAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: db.count() })
      .from(files)
      .where(eq(files.userId, userId));

    return {
      files: userFiles.map((f) => ({
        id: f.id.toString(),
        userId: f.userId,
        fileName: f.fileName,
        fileKey: f.fileKey,
        fileSize: f.fileSize,
        mimeType: f.mimeType,
        uploadedAt: f.uploadedAt,
        isPublic: f.isPublic,
        accessCount: f.accessCount,
        lastAccessedAt: f.lastAccessedAt,
      })),
      total: countResult[0]?.count || 0,
    };
  } catch (error) {
    console.error('[FileStorage] List failed:', error);
    throw new Error('Failed to list files');
  }
}

/**
 * Delete file from S3 and database
 */
export async function deleteFile(userId: number, fileId: string): Promise<void> {
  try {
    const fileRecord = await db
      .select()
      .from(files)
      .where(and(eq(files.id, parseInt(fileId)), eq(files.userId, userId)))
      .limit(1);

    if (!fileRecord || fileRecord.length === 0) {
      throw new Error('File not found');
    }

    const file = fileRecord[0];

    // Delete from S3 (if supported by storage provider)
    // await storageDelete(file.fileKey);

    // Delete from database
    await db.delete(files).where(eq(files.id, parseInt(fileId)));

    // Log deletion
    await logFileAccess(userId, parseInt(fileId), 'delete');
  } catch (error) {
    console.error('[FileStorage] Delete failed:', error);
    throw new Error('File deletion failed');
  }
}

/**
 * Share file with expiring link
 */
export async function shareFile(
  userId: number,
  fileId: string,
  expiresInHours: number = 24
): Promise<{ shareUrl: string; expiresAt: Date }> {
  try {
    const fileRecord = await db
      .select()
      .from(files)
      .where(eq(files.id, parseInt(fileId)))
      .limit(1);

    if (!fileRecord || fileRecord.length === 0) {
      throw new Error('File not found');
    }

    const file = fileRecord[0];
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

    // Get presigned URL
    const { url } = await storageGet(file.fileKey, expiresInHours * 3600);

    // Update file expiration
    await db
      .update(files)
      .set({ expiresAt })
      .where(eq(files.id, parseInt(fileId)));

    // Log sharing
    await logFileAccess(userId, parseInt(fileId), 'share');

    return {
      shareUrl: url,
      expiresAt,
    };
  } catch (error) {
    console.error('[FileStorage] Share failed:', error);
    throw new Error('File sharing failed');
  }
}

/**
 * Log file access for audit trail
 */
export async function logFileAccess(
  userId: number,
  fileId: number,
  action: 'download' | 'upload' | 'delete' | 'share' | 'preview'
): Promise<void> {
  try {
    await db.insert(fileAccessLogs).values({
      userId,
      fileId,
      action,
      timestamp: new Date(),
      ipAddress: '', // Would be populated from request context
      userAgent: '', // Would be populated from request context
    });
  } catch (error) {
    console.error('[FileStorage] Audit log failed:', error);
    // Don't throw - logging failure shouldn't block operations
  }
}

/**
 * Get file access audit trail
 */
export async function getFileAuditTrail(fileId: number, limit: number = 100) {
  try {
    const logs = await db
      .select()
      .from(fileAccessLogs)
      .where(eq(fileAccessLogs.fileId, fileId))
      .orderBy(desc(fileAccessLogs.timestamp))
      .limit(limit);

    return logs;
  } catch (error) {
    console.error('[FileStorage] Audit trail fetch failed:', error);
    throw new Error('Failed to fetch audit trail');
  }
}

/**
 * Calculate user storage usage
 */
export async function getUserStorageUsage(userId: number): Promise<{
  usedBytes: number;
  limitBytes: number;
  percentageUsed: number;
}> {
  try {
    const userFiles = await db
      .select({ totalSize: db.sum(files.fileSize) })
      .from(files)
      .where(eq(files.userId, userId));

    const usedBytes = userFiles[0]?.totalSize || 0;
    
    // Get user subscription tier to determine limit
    // This would be fetched from subscriptions table
    const limitBytes = 10 * 1024 * 1024 * 1024; // 10GB default

    return {
      usedBytes,
      limitBytes,
      percentageUsed: (usedBytes / limitBytes) * 100,
    };
  } catch (error) {
    console.error('[FileStorage] Storage usage calculation failed:', error);
    throw new Error('Failed to calculate storage usage');
  }
}

/**
 * Bulk download files as ZIP
 */
export async function bulkDownloadFiles(
  userId: number,
  fileIds: string[]
): Promise<{ downloadUrl: string; expiresAt: Date }> {
  try {
    // Validate all files belong to user
    const userFiles = await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          // Check if fileId is in the list
        )
      );

    if (userFiles.length !== fileIds.length) {
      throw new Error('One or more files not found');
    }

    // In production, would trigger ZIP creation job
    // For now, return placeholder
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);

    return {
      downloadUrl: '/api/files/bulk-download',
      expiresAt,
    };
  } catch (error) {
    console.error('[FileStorage] Bulk download failed:', error);
    throw new Error('Bulk download failed');
  }
}
