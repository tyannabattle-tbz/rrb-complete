/**
 * Automated Backup Service
 * Manages automatic session snapshots with retention policies
 */

export interface BackupPolicy {
  enabled: boolean;
  intervalMinutes: number;
  retentionDays: number;
  maxBackupsPerSession: number;
  autoDeleteOldBackups: boolean;
}

export interface SessionBackup {
  id: string;
  sessionId: number;
  createdAt: Date;
  createdBy: string;
  size: number;
  label?: string;
  isManual: boolean;
  expiresAt: Date;
  data: {
    messages: unknown[];
    config: Record<string, unknown>;
    memory: Record<string, unknown>;
    toolExecutions: unknown[];
    status: string;
  };
}

export class BackupManager {
  private backups: Map<number, SessionBackup[]> = new Map();
  private defaultPolicy: BackupPolicy = {
    enabled: true,
    intervalMinutes: 30,
    retentionDays: 30,
    maxBackupsPerSession: 100,
    autoDeleteOldBackups: true,
  };
  private policies: Map<number, BackupPolicy> = new Map();

  /**
   * Initialize backup policy for a session
   */
  initializePolicy(sessionId: number, policy?: Partial<BackupPolicy>): BackupPolicy {
    const finalPolicy = { ...this.defaultPolicy, ...policy };
    this.policies.set(sessionId, finalPolicy);
    this.backups.set(sessionId, []);
    return finalPolicy;
  }

  /**
   * Create a backup of a session
   */
  createBackup(
    sessionId: number,
    data: SessionBackup["data"],
    userId: string,
    isManual = false,
    label?: string
  ): SessionBackup | null {
    const policy = this.policies.get(sessionId) || this.defaultPolicy;

    if (!policy.enabled && !isManual) {
      return null;
    }

    const backup: SessionBackup = {
      id: `backup-${sessionId}-${Date.now()}`,
      sessionId,
      createdAt: new Date(),
      createdBy: userId,
      size: JSON.stringify(data).length,
      label,
      isManual,
      expiresAt: new Date(
        Date.now() + policy.retentionDays * 24 * 60 * 60 * 1000
      ),
      data,
    };

    let sessionBackups = this.backups.get(sessionId);
    if (!sessionBackups) {
      sessionBackups = [];
      this.backups.set(sessionId, sessionBackups);
    }

    sessionBackups.push(backup);

    // Enforce max backups limit
    if (policy.autoDeleteOldBackups && sessionBackups.length > policy.maxBackupsPerSession) {
      sessionBackups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      sessionBackups.splice(policy.maxBackupsPerSession);
    }

    return backup;
  }

  /**
   * Restore a session from a backup
   */
  restoreFromBackup(backupId: string): SessionBackup["data"] | null {
    let foundData: SessionBackup["data"] | null = null;
    this.backups.forEach((backups: SessionBackup[]) => {
      const backup = backups.find((b: SessionBackup) => b.id === backupId);
      if (backup) {
        foundData = backup.data;
      }
    });
    return foundData;
  }

  /**
   * Get all backups for a session
   */
  getBackups(sessionId: number): SessionBackup[] {
    return this.backups.get(sessionId) || [];
  }

  /**
   * Get backups within a date range
   */
  getBackupsByDateRange(
    sessionId: number,
    startDate: Date,
    endDate: Date
  ): SessionBackup[] {
    const backups = this.backups.get(sessionId) || [];
    return backups.filter(
      (b) => b.createdAt >= startDate && b.createdAt <= endDate
    );
  }

  /**
   * Delete a specific backup
   */
  deleteBackup(backupId: string): boolean {
    let deleted = false;
    this.backups.forEach((backups: SessionBackup[]) => {
      const index = backups.findIndex((b: SessionBackup) => b.id === backupId);
      if (index !== -1) {
        backups.splice(index, 1);
        deleted = true;
      }
    });
    return deleted;
  }

  /**
   * Delete all backups for a session
   */
  deleteAllBackups(sessionId: number): number {
    const backups = this.backups.get(sessionId);
    if (!backups) {
      return 0;
    }

    const count = backups.length;
    const emptyArray: SessionBackup[] = [];
    this.backups.set(sessionId, emptyArray);
    return count;
  }

  /**
   * Clean up expired backups
   */
  cleanupExpiredBackups(): number {
    let deletedCount = 0;

    this.backups.forEach((backups: SessionBackup[]) => {
      const now = new Date();
      const initialLength = backups.length;

      const filtered = backups.filter((b: SessionBackup) => b.expiresAt > now);
      const sessionId = backups[0]?.sessionId || 0;
      this.backups.set(sessionId, filtered);

      deletedCount += initialLength - filtered.length;
    });

    return deletedCount;
  }

  /**
   * Get backup statistics for a session
   */
  getBackupStats(sessionId: number): {
    totalBackups: number;
    totalSize: number;
    oldestBackup: Date | null;
    newestBackup: Date | null;
    averageSize: number;
  } | null {
    const backups = this.backups.get(sessionId);
    if (!backups || backups.length === 0) {
      return null;
    }

    const totalSize = backups.reduce((sum: number, b: SessionBackup) => sum + b.size, 0);
    const dates = backups.map((b: SessionBackup) => b.createdAt);

    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: new Date(Math.min(...dates.map((d) => d.getTime()))),
      newestBackup: new Date(Math.max(...dates.map((d) => d.getTime()))),
      averageSize: totalSize / backups.length,
    };
  }

  /**
   * Update backup policy
   */
  updatePolicy(sessionId: number, policy: Partial<BackupPolicy>): BackupPolicy {
    const currentPolicy = this.policies.get(sessionId) || this.defaultPolicy;
    const updatedPolicy = { ...currentPolicy, ...policy };
    this.policies.set(sessionId, updatedPolicy);
    return updatedPolicy;
  }

  /**
   * Get backup policy for a session
   */
  getPolicy(sessionId: number): BackupPolicy {
    return this.policies.get(sessionId) || this.defaultPolicy;
  }

  /**
   * Label a backup
   */
  labelBackup(backupId: string, label: string): boolean {
    let found = false;
    this.backups.forEach((backups: SessionBackup[]) => {
      const backup = backups.find((b: SessionBackup) => b.id === backupId);
      if (backup) {
        backup.label = label;
        found = true;
      }
    });
    return found;
  }

  /**
   * Get backup by ID
   */
  getBackupById(backupId: string): SessionBackup | null {
    let foundBackup: SessionBackup | null = null;
    this.backups.forEach((backups: SessionBackup[]) => {
      const backup = backups.find((b: SessionBackup) => b.id === backupId);
      if (backup) {
        foundBackup = backup;
      }
    });
    return foundBackup;
  }
}

// Export singleton instance
export const backupManager = new BackupManager();
