/**
 * File Sharing and Download System for Qumus
 * Handles file sharing, downloading, and metadata management
 */

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  uploadedBy: string;
  url?: string;
  shareToken?: string;
  isPublic: boolean;
  downloads: number;
}

export interface FileShare {
  id: string;
  fileId: string;
  sharedWith: string[];
  sharedBy: string;
  sharedAt: Date;
  expiresAt?: Date;
  permissions: 'view' | 'download' | 'edit';
}

export class FileShareManager {
  private fileMetadata: Map<string, FileMetadata> = new Map();
  private fileShares: Map<string, FileShare> = new Map();

  /**
   * Register file metadata
   */
  registerFile(file: File, uploadedBy: string): FileMetadata {
    const metadata: FileMetadata = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      uploadedBy,
      isPublic: false,
      downloads: 0,
    };

    this.fileMetadata.set(metadata.id, metadata);
    return metadata;
  }

  /**
   * Share file with users
   */
  shareFile(
    fileId: string,
    sharedWith: string[],
    sharedBy: string,
    permissions: 'view' | 'download' | 'edit' = 'download',
    expiresAt?: Date
  ): FileShare {
    const share: FileShare = {
      id: `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileId,
      sharedWith,
      sharedBy,
      sharedAt: new Date(),
      expiresAt,
      permissions,
    };

    this.fileShares.set(share.id, share);
    return share;
  }

  /**
   * Get file download URL
   */
  getDownloadUrl(fileId: string): string {
    const metadata = this.fileMetadata.get(fileId);
    if (!metadata) {
      throw new Error('File not found');
    }

    // Increment download count
    metadata.downloads++;

    // Generate download URL (in production, this would be a signed URL from S3)
    return `/api/files/${fileId}/download`;
  }

  /**
   * Generate share link
   */
  generateShareLink(fileId: string, expiresIn: number = 7 * 24 * 60 * 60 * 1000): string {
    const metadata = this.fileMetadata.get(fileId);
    if (!metadata) {
      throw new Error('File not found');
    }

    const shareToken = Math.random().toString(36).substr(2, 32);
    metadata.shareToken = shareToken;
    metadata.isPublic = true;

    const expiresAt = new Date(Date.now() + expiresIn);
    return `/share/${shareToken}?expires=${expiresAt.getTime()}`;
  }

  /**
   * Get file metadata
   */
  getFileMetadata(fileId: string): FileMetadata | undefined {
    return this.fileMetadata.get(fileId);
  }

  /**
   * Get all files shared with user
   */
  getSharedFiles(userId: string): FileMetadata[] {
    const sharedFiles: FileMetadata[] = [];

    this.fileShares.forEach((share) => {
      if (share.sharedWith.includes(userId)) {
        const metadata = this.fileMetadata.get(share.fileId);
        if (metadata && (!share.expiresAt || share.expiresAt > new Date())) {
          sharedFiles.push(metadata);
        }
      }
    });

    return sharedFiles;
  }

  /**
   * Get file statistics
   */
  getFileStats(fileId: string) {
    const metadata = this.fileMetadata.get(fileId);
    if (!metadata) {
      throw new Error('File not found');
    }

    const shares = Array.from(this.fileShares.values()).filter(
      (s) => s.fileId === fileId
    );

    return {
      totalDownloads: metadata.downloads,
      totalShares: shares.length,
      sharedWith: shares.flatMap((s) => s.sharedWith),
      uploadedAt: metadata.uploadedAt,
      size: metadata.size,
      sizeFormatted: this.formatFileSize(metadata.size),
    };
  }

  /**
   * Format file size
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Revoke file share
   */
  revokeShare(shareId: string): boolean {
    return this.fileShares.delete(shareId);
  }

  /**
   * Delete file
   */
  deleteFile(fileId: string): boolean {
    // Delete all shares for this file
    this.fileShares.forEach((share, shareId) => {
      if (share.fileId === fileId) {
        this.fileShares.delete(shareId);
      }
    });

    return this.fileMetadata.delete(fileId);
  }

  /**
   * Get all files uploaded by user
   */
  getUserFiles(userId: string): FileMetadata[] {
    const userFiles: FileMetadata[] = [];

    this.fileMetadata.forEach((metadata) => {
      if (metadata.uploadedBy === userId) {
        userFiles.push(metadata);
      }
    });

    return userFiles;
  }
}

// Export singleton instance
export const fileShareManager = new FileShareManager();
