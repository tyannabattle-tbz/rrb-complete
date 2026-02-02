import { db } from "../db";
import { backupMetadata } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { eq, lte } from "drizzle-orm";

export interface BackupConfig {
  frequency: "hourly" | "daily" | "weekly";
  retentionDays: number;
  includeVideos: boolean;
  includeMetadata: boolean;
  compressionLevel: number;
}

export interface BackupStatus {
  backupId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  dataSize: number;
  fileCount: number;
  storageUrl?: string;
  errorMessage?: string;
}

export class BackupService {
  private static readonly DEFAULT_CONFIG: BackupConfig = {
    frequency: "daily",
    retentionDays: 90,
    includeVideos: true,
    includeMetadata: true,
    compressionLevel: 6,
  };

  static async createBackup(
    userId: string,
    config: BackupConfig = this.DEFAULT_CONFIG
  ): Promise<BackupStatus> {
    const backupId = `backup_${userId}_${Date.now()}`;
    const status: BackupStatus = {
      backupId,
      status: "in_progress",
      startTime: new Date(),
      dataSize: 0,
      fileCount: 0,
    };

    try {
      // Create backup metadata entry
      await db.insert(backupMetadata).values({
        backupId,
        userId,
        status: "in_progress",
        createdAt: new Date(),
        config: JSON.stringify(config),
      });

      // Collect data to backup
      const backupData = await this.collectBackupData(userId, config);
      status.dataSize = backupData.size;
      status.fileCount = backupData.fileCount;

      // Upload to storage
      const storageKey = `backups/${userId}/${backupId}.tar.gz`;
      const { url } = await storagePut(
        storageKey,
        JSON.stringify(backupData),
        "application/gzip"
      );

      status.storageUrl = url;
      status.status = "completed";
      status.endTime = new Date();

      // Update backup metadata
      await db
        .update(backupMetadata)
        .set({
          status: "completed",
          storageUrl: url,
          dataSize: status.dataSize,
          fileCount: status.fileCount,
          completedAt: new Date(),
        })
        .where(eq(backupMetadata.backupId, backupId));

      return status;
    } catch (error) {
      status.status = "failed";
      status.endTime = new Date();
      status.errorMessage = error instanceof Error ? error.message : "Unknown error";

      await db
        .update(backupMetadata)
        .set({
          status: "failed",
          errorMessage: status.errorMessage,
          completedAt: new Date(),
        })
        .where(eq(backupMetadata.backupId, backupId));

      return status;
    }
  }

  private static async collectBackupData(
    userId: string,
    config: BackupConfig
  ): Promise<{ size: number; fileCount: number; data: any }> {
    const data: any = {
      userId,
      timestamp: new Date(),
      metadata: {},
      videos: [],
    };

    let totalSize = 0;
    let fileCount = 0;

    if (config.includeMetadata) {
      // Collect user metadata, projects, etc.
      data.metadata = {
        userId,
        backupDate: new Date(),
        // Add more metadata as needed
      };
      fileCount += 1;
      totalSize += JSON.stringify(data.metadata).length;
    }

    if (config.includeVideos) {
      // Collect video information
      // This would typically query video records from database
      fileCount += 1;
      totalSize += 1024 * 1024; // Estimate
    }

    return {
      size: totalSize,
      fileCount,
      data,
    };
  }

  static async restoreBackup(userId: string, backupId: string): Promise<boolean> {
    try {
      const backup = await db
        .select()
        .from(backupMetadata)
        .where(eq(backupMetadata.backupId, backupId));

      if (!backup.length || backup[0].userId !== userId) {
        throw new Error("Backup not found or unauthorized");
      }

      // Restore logic would go here
      // This is a placeholder for the actual restore implementation
      return true;
    } catch {
      return false;
    }
  }

  static async listBackups(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const backups = await db
        .select()
        .from(backupMetadata)
        .where(eq(backupMetadata.userId, userId))
        .limit(limit);

      return backups;
    } catch {
      return [];
    }
  }

  static async deleteOldBackups(userId: string, retentionDays: number): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 86400000);

      const oldBackups = await db
        .select()
        .from(backupMetadata)
        .where(
          eq(backupMetadata.userId, userId) && lte(backupMetadata.createdAt, cutoffDate)
        );

      // Delete from storage and database
      for (const backup of oldBackups) {
        // Delete from storage if URL exists
        // await storage.delete(backup.storageUrl);
      }

      // Delete from database
      await db
        .delete(backupMetadata)
        .where(
          eq(backupMetadata.userId, userId) && lte(backupMetadata.createdAt, cutoffDate)
        );

      return oldBackups.length;
    } catch {
      return 0;
    }
  }

  static scheduleBackup(userId: string, config: BackupConfig): void {
    const intervalMs = this.getIntervalMs(config.frequency);
    setInterval(() => {
      this.createBackup(userId, config).catch((err) => {
        console.error(`Backup failed for user ${userId}:`, err);
      });
    }, intervalMs);
  }

  private static getIntervalMs(frequency: string): number {
    switch (frequency) {
      case "hourly":
        return 3600000;
      case "daily":
        return 86400000;
      case "weekly":
        return 604800000;
      default:
        return 86400000;
    }
  }
}
