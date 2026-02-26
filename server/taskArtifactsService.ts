import { storagePut, storageGet } from './storage';
import { db } from './db';

export interface TaskArtifact {
  id: string;
  taskId: string;
  userId: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: Date;
  expiresAt?: Date;
  isPublic: boolean;
  metadata?: Record<string, any>;
}

export interface TaskResult {
  taskId: string;
  status: 'pending' | 'completed' | 'failed';
  artifacts: TaskArtifact[];
  summary: string;
  completedAt: Date;
}

/**
 * Upload task result artifact to S3
 */
export async function uploadTaskArtifact(
  taskId: string,
  userId: string,
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string,
  metadata?: Record<string, any>
): Promise<TaskArtifact> {
  try {
    // Generate unique file key
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(7);
    const fileKey = `tasks/${userId}/${taskId}/${timestamp}-${randomSuffix}-${fileName}`;

    // Upload to S3
    const { url } = await storagePut(fileKey, fileBuffer, mimeType);

    // Store metadata in database
    const artifact = await db.insert('task_artifacts').values({
      taskId,
      userId,
      fileName,
      fileKey,
      fileUrl: url,
      fileSize: fileBuffer.length,
      mimeType,
      uploadedAt: new Date(),
      isPublic: false,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    return {
      id: artifact.insertId.toString(),
      taskId,
      userId,
      fileName,
      fileKey,
      fileUrl: url,
      fileSize: fileBuffer.length,
      mimeType,
      uploadedAt: new Date(),
      isPublic: false,
      metadata,
    };
  } catch (error) {
    console.error('Failed to upload task artifact:', error);
    throw error;
  }
}

/**
 * Get presigned URL for artifact download
 */
export async function getArtifactDownloadUrl(
  artifactId: string,
  userId: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    // Get artifact from database
    const artifacts = await db.query('SELECT * FROM task_artifacts WHERE id = ? AND userId = ?', [
      artifactId,
      userId,
    ]);

    if (artifacts.length === 0) {
      throw new Error('Artifact not found');
    }

    const artifact = artifacts[0];

    // Get presigned URL
    const { url } = await storageGet(artifact.fileKey, expiresIn);

    // Log access
    await db.insert('artifact_access_logs').values({
      artifactId,
      userId,
      action: 'download',
      timestamp: new Date(),
      ipAddress: 'unknown',
    });

    return url;
  } catch (error) {
    console.error('Failed to get artifact download URL:', error);
    throw error;
  }
}

/**
 * Share artifact with expiring link
 */
export async function createArtifactShareLink(
  artifactId: string,
  userId: string,
  expiresIn: number = 86400 // 24 hours default
): Promise<{ shareToken: string; expiresAt: Date; downloadUrl: string }> {
  try {
    const shareToken = `share_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store share link in database
    await db.insert('artifact_share_links').values({
      artifactId,
      userId,
      shareToken,
      expiresAt,
      createdAt: new Date(),
    });

    // Get artifact for download URL
    const artifacts = await db.query('SELECT fileKey FROM task_artifacts WHERE id = ?', [artifactId]);

    if (artifacts.length === 0) {
      throw new Error('Artifact not found');
    }

    const { url } = await storageGet(artifacts[0].fileKey, expiresIn);

    return {
      shareToken,
      expiresAt,
      downloadUrl: url,
    };
  } catch (error) {
    console.error('Failed to create artifact share link:', error);
    throw error;
  }
}

/**
 * List task artifacts
 */
export async function listTaskArtifacts(taskId: string, userId: string): Promise<TaskArtifact[]> {
  try {
    const artifacts = await db.query(
      'SELECT * FROM task_artifacts WHERE taskId = ? AND userId = ? ORDER BY uploadedAt DESC',
      [taskId, userId]
    );

    return artifacts.map((a: any) => ({
      id: a.id,
      taskId: a.taskId,
      userId: a.userId,
      fileName: a.fileName,
      fileKey: a.fileKey,
      fileUrl: a.fileUrl,
      fileSize: a.fileSize,
      mimeType: a.mimeType,
      uploadedAt: new Date(a.uploadedAt),
      isPublic: a.isPublic,
      metadata: a.metadata ? JSON.parse(a.metadata) : undefined,
    }));
  } catch (error) {
    console.error('Failed to list task artifacts:', error);
    throw error;
  }
}

/**
 * Delete task artifact
 */
export async function deleteTaskArtifact(artifactId: string, userId: string): Promise<void> {
  try {
    // Get artifact
    const artifacts = await db.query('SELECT * FROM task_artifacts WHERE id = ? AND userId = ?', [
      artifactId,
      userId,
    ]);

    if (artifacts.length === 0) {
      throw new Error('Artifact not found');
    }

    const artifact = artifacts[0];

    // Delete from S3 (optional - depends on S3 setup)
    // await s3.deleteObject({ Bucket, Key: artifact.fileKey }).promise();

    // Delete from database
    await db.query('DELETE FROM task_artifacts WHERE id = ?', [artifactId]);

    // Log deletion
    await db.insert('artifact_access_logs').values({
      artifactId,
      userId,
      action: 'delete',
      timestamp: new Date(),
      ipAddress: 'unknown',
    });
  } catch (error) {
    console.error('Failed to delete task artifact:', error);
    throw error;
  }
}

/**
 * Get task result with artifacts
 */
export async function getTaskResult(taskId: string, userId: string): Promise<TaskResult> {
  try {
    // Get task
    const tasks = await db.query('SELECT * FROM tasks WHERE id = ? AND userId = ?', [taskId, userId]);

    if (tasks.length === 0) {
      throw new Error('Task not found');
    }

    const task = tasks[0];

    // Get artifacts
    const artifacts = await listTaskArtifacts(taskId, userId);

    return {
      taskId,
      status: task.status,
      artifacts,
      summary: task.summary || '',
      completedAt: new Date(task.completedAt),
    };
  } catch (error) {
    console.error('Failed to get task result:', error);
    throw error;
  }
}

/**
 * Auto-upload task output on completion
 */
export async function processTaskCompletion(
  taskId: string,
  userId: string,
  taskOutput: any
): Promise<TaskArtifact[]> {
  try {
    const uploadedArtifacts: TaskArtifact[] = [];

    // Convert task output to JSON and upload
    const outputBuffer = Buffer.from(JSON.stringify(taskOutput, null, 2));
    const artifact = await uploadTaskArtifact(
      taskId,
      userId,
      `task-output-${taskId}.json`,
      outputBuffer,
      'application/json',
      { type: 'task_output', taskId }
    );

    uploadedArtifacts.push(artifact);

    // If output contains file data, upload those too
    if (taskOutput.files && Array.isArray(taskOutput.files)) {
      for (const file of taskOutput.files) {
        if (file.buffer && file.name) {
          const fileArtifact = await uploadTaskArtifact(
            taskId,
            userId,
            file.name,
            file.buffer,
            file.mimeType || 'application/octet-stream',
            { type: 'task_file', originalName: file.name }
          );

          uploadedArtifacts.push(fileArtifact);
        }
      }
    }

    // Update task with artifact information
    await db.query('UPDATE tasks SET artifactCount = ?, completedAt = ? WHERE id = ?', [
      uploadedArtifacts.length,
      new Date(),
      taskId,
    ]);

    return uploadedArtifacts;
  } catch (error) {
    console.error('Failed to process task completion:', error);
    throw error;
  }
}

/**
 * Get artifact access statistics
 */
export async function getArtifactStats(artifactId: string): Promise<{
  totalAccess: number;
  downloads: number;
  deletes: number;
  lastAccessed?: Date;
}> {
  try {
    const stats = await db.query(
      `SELECT 
        COUNT(*) as totalAccess,
        SUM(CASE WHEN action = 'download' THEN 1 ELSE 0 END) as downloads,
        SUM(CASE WHEN action = 'delete' THEN 1 ELSE 0 END) as deletes,
        MAX(timestamp) as lastAccessed
      FROM artifact_access_logs 
      WHERE artifactId = ?`,
      [artifactId]
    );

    const result = stats[0] || {};
    return {
      totalAccess: result.totalAccess || 0,
      downloads: result.downloads || 0,
      deletes: result.deletes || 0,
      lastAccessed: result.lastAccessed ? new Date(result.lastAccessed) : undefined,
    };
  } catch (error) {
    console.error('Failed to get artifact stats:', error);
    throw error;
  }
}

/**
 * Cleanup expired artifacts
 */
export async function cleanupExpiredArtifacts(): Promise<number> {
  try {
    // Get expired share links
    const expiredLinks = await db.query(
      'SELECT DISTINCT artifactId FROM artifact_share_links WHERE expiresAt < NOW()'
    );

    let deletedCount = 0;

    for (const link of expiredLinks) {
      // Delete share link
      await db.query('DELETE FROM artifact_share_links WHERE artifactId = ? AND expiresAt < NOW()', [
        link.artifactId,
      ]);

      deletedCount++;
    }

    return deletedCount;
  } catch (error) {
    console.error('Failed to cleanup expired artifacts:', error);
    throw error;
  }
}
