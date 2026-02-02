/**
 * File Preview System for Qumus
 * Generates thumbnails and previews for various file types
 */

export interface FilePreview {
  fileId: string;
  fileName: string;
  fileType: string;
  previewUrl: string;
  previewType: 'image' | 'document' | 'audio' | 'video' | 'text' | 'unknown';
  size: number;
  generatedAt: Date;
}

export class FilePreviewGenerator {
  private previews: Map<string, FilePreview> = new Map();
  private maxPreviewSize = 5 * 1024 * 1024; // 5MB

  /**
   * Generate preview for file
   */
  async generatePreview(file: File, fileId: string): Promise<FilePreview> {
    let previewType: FilePreview['previewType'] = 'unknown';
    let previewUrl = '';

    if (file.type.startsWith('image/')) {
      previewType = 'image';
      previewUrl = await this.generateImagePreview(file);
    } else if (file.type.startsWith('video/')) {
      previewType = 'video';
      previewUrl = await this.generateVideoPreview(file);
    } else if (file.type.startsWith('audio/')) {
      previewType = 'audio';
      previewUrl = this.generateAudioPreview(file);
    } else if (file.type === 'application/pdf' || file.type.includes('document')) {
      previewType = 'document';
      previewUrl = this.generateDocumentPreview(file);
    } else if (file.type.startsWith('text/')) {
      previewType = 'text';
      previewUrl = await this.generateTextPreview(file);
    }

    const preview: FilePreview = {
      fileId,
      fileName: file.name,
      fileType: file.type,
      previewUrl,
      previewType,
      size: file.size,
      generatedAt: new Date(),
    };

    this.previews.set(fileId, preview);
    return preview;
  }

  /**
   * Generate image preview (thumbnail)
   */
  private async generateImagePreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxWidth = 200;
          const maxHeight = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
          }

          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  /**
   * Generate video preview (first frame)
   */
  private async generateVideoPreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      video.src = URL.createObjectURL(file);
      video.currentTime = 0;
    });
  }

  /**
   * Generate audio preview (waveform visualization)
   */
  private generateAudioPreview(file: File): string {
    // Return a placeholder for audio files
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect fill='%23f0f0f0' width='200' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666'%3E🎵 Audio%3C/text%3E%3C/svg%3E`;
  }

  /**
   * Generate document preview (icon)
   */
  private generateDocumentPreview(file: File): string {
    const icon = file.type === 'application/pdf' ? '📄' : '📋';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='100'%3E%3Crect fill='%23f0f0f0' width='200' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='32'%3E${icon}%3C/text%3E%3C/svg%3E`;
  }

  /**
   * Generate text preview
   */
  private async generateTextPreview(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = (e.target?.result as string).substring(0, 100);
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, 200, 100);
          ctx.fillStyle = '#333';
          ctx.font = '12px monospace';
          ctx.fillText(text, 10, 20);
        }
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      reader.readAsText(file);
    });
  }

  /**
   * Get preview for file
   */
  getPreview(fileId: string): FilePreview | undefined {
    return this.previews.get(fileId);
  }

  /**
   * Get all previews
   */
  getAllPreviews(): FilePreview[] {
    return Array.from(this.previews.values());
  }

  /**
   * Clear preview cache
   */
  clearPreview(fileId: string): boolean {
    return this.previews.delete(fileId);
  }

  /**
   * Clear all previews
   */
  clearAllPreviews(): void {
    this.previews.clear();
  }
}

export const filePreviewGenerator = new FilePreviewGenerator();
