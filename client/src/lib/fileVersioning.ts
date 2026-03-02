/**
 * File Versioning System for Qumus
 * Track file versions and maintain version history
 */

export interface FileVersion {
  versionId: string;
  fileId: string;
  fileName: string;
  versionNumber: number;
  uploadedAt: Date;
  uploadedBy: string;
  size: number;
  changes: string;
  isLatest: boolean;
  url?: string;
}

export class FileVersionManager {
  private fileVersions: Map<string, FileVersion[]> = new Map();
  private maxVersionsPerFile = 50;

  /**
   * Create new file version
   */
  createVersion(
    fileId: string,
    fileName: string,
    uploadedBy: string,
    size: number,
    changes: string
  ): FileVersion {
    const versions = this.fileVersions.get(fileId) || [];
    const versionNumber = versions.length + 1;

    // Mark previous latest as not latest
    versions.forEach((v) => {
      v.isLatest = false;
    });

    const newVersion: FileVersion = {
      versionId: `v-${fileId}-${versionNumber}`,
      fileId,
      fileName,
      versionNumber,
      uploadedAt: new Date(),
      uploadedBy,
      size,
      changes,
      isLatest: true,
    };

    versions.push(newVersion);

    // Keep only max versions
    if (versions.length > this.maxVersionsPerFile) {
      versions.shift();
    }

    this.fileVersions.set(fileId, versions);
    return newVersion;
  }

  /**
   * Get all versions of a file
   */
  getVersions(fileId: string): FileVersion[] {
    return this.fileVersions.get(fileId) || [];
  }

  /**
   * Get specific version
   */
  getVersion(fileId: string, versionNumber: number): FileVersion | undefined {
    const versions = this.fileVersions.get(fileId);
    if (!versions) return undefined;
    return versions.find((v) => v.versionNumber === versionNumber);
  }

  /**
   * Get latest version
   */
  getLatestVersion(fileId: string): FileVersion | undefined {
    const versions = this.fileVersions.get(fileId);
    if (!versions) return undefined;
    return versions.find((v) => v.isLatest);
  }

  /**
   * Restore to specific version
   */
  restoreVersion(fileId: string, versionNumber: number): FileVersion | undefined {
    const versions = this.fileVersions.get(fileId);
    if (!versions) return undefined;

    const targetVersion = versions.find((v) => v.versionNumber === versionNumber);
    if (!targetVersion) return undefined;

    // Create new version based on old version
    const newVersion = this.createVersion(
      fileId,
      targetVersion.fileName,
      'system',
      targetVersion.size,
      `Restored from version ${versionNumber}`
    );

    return newVersion;
  }

  /**
   * Delete specific version
   */
  deleteVersion(fileId: string, versionNumber: number): boolean {
    const versions = this.fileVersions.get(fileId);
    if (!versions) return false;

    const index = versions.findIndex((v) => v.versionNumber === versionNumber);
    if (index === -1) return false;

    versions.splice(index, 1);
    return true;
  }

  /**
   * Get version history
   */
  getVersionHistory(fileId: string): FileVersion[] {
    const versions = this.fileVersions.get(fileId) || [];
    return versions.sort((a, b) => b.versionNumber - a.versionNumber);
  }

  /**
   * Compare two versions
   */
  compareVersions(
    fileId: string,
    version1: number,
    version2: number
  ): { version1: FileVersion; version2: FileVersion; diff: string } | undefined {
    const v1 = this.getVersion(fileId, version1);
    const v2 = this.getVersion(fileId, version2);

    if (!v1 || !v2) return undefined;

    const diff = `Comparing version ${version1} (${v1.uploadedAt.toLocaleDateString()}) with version ${version2} (${v2.uploadedAt.toLocaleDateString()}). Changes: ${v2.changes}`;

    return { version1: v1, version2: v2, diff };
  }

  /**
   * Get version statistics
   */
  getVersionStats(fileId: string) {
    const versions = this.fileVersions.get(fileId) || [];

    return {
      totalVersions: versions.length,
      latestVersion: this.getLatestVersion(fileId),
      oldestVersion: versions[0],
      totalSize: versions.reduce((sum, v) => sum + v.size, 0),
      averageSize: versions.length > 0 ? Math.round(versions.reduce((sum, v) => sum + v.size, 0) / versions.length) : 0,
      createdBy: versions.map((v) => v.uploadedBy),
      dateRange: {
        from: versions[0]?.uploadedAt,
        to: versions[versions.length - 1]?.uploadedAt,
      },
    };
  }

  /**
   * Clean up old versions (keep only recent N versions)
   */
  cleanupOldVersions(fileId: string, keepCount: number = 10): number {
    const versions = this.fileVersions.get(fileId);
    if (!versions || versions.length <= keepCount) return 0;

    const removed = versions.length - keepCount;
    const newVersions = versions.slice(-keepCount);
    this.fileVersions.set(fileId, newVersions);

    return removed;
  }

  /**
   * Export version history as JSON
   */
  exportVersionHistory(fileId: string): string {
    const versions = this.getVersionHistory(fileId);
    return JSON.stringify(versions, null, 2);
  }

  /**
   * Get all files with versions
   */
  getAllFilesWithVersions(): Map<string, FileVersion[]> {
    return new Map(this.fileVersions);
  }
}

export const fileVersionManager = new FileVersionManager();
