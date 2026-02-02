/**
 * File Encryption System for Qumus
 * End-to-end encryption for secure file sharing
 */

export interface EncryptedFile {
  id: string;
  fileName: string;
  encryptedData: ArrayBuffer;
  iv: string; // Initialization vector
  salt: string;
  algorithm: string;
  encryptedAt: Date;
  encryptedBy: string;
}

export interface DecryptionKey {
  key: CryptoKey;
  algorithm: string;
}

export class FileEncryptionManager {
  private algorithm = {
    name: 'AES-GCM',
    length: 256,
  };

  private encryptedFiles: Map<string, EncryptedFile> = new Map();

  /**
   * Generate encryption key from password
   */
  async generateKeyFromPassword(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const key = await crypto.subtle.importKey(
      'raw',
      hashBuffer,
      this.algorithm,
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  }

  /**
   * Encrypt file
   */
  async encryptFile(
    file: File,
    password: string,
    userId: string
  ): Promise<EncryptedFile> {
    const key = await this.generateKeyFromPassword(password);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const fileData = await file.arrayBuffer();

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.algorithm.name,
        iv: new Uint8Array(iv),
      },
      key,
      fileData
    );

    const encryptedFile: EncryptedFile = {
      id: `enc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      encryptedData,
      iv: this.arrayBufferToBase64(iv),
      salt: this.generateSalt(),
      algorithm: this.algorithm.name,
      encryptedAt: new Date(),
      encryptedBy: userId,
    };

    this.encryptedFiles.set(encryptedFile.id, encryptedFile);
    return encryptedFile;
  }

  /**
   * Decrypt file
   */
  async decryptFile(
    encryptedFile: EncryptedFile,
    password: string
  ): Promise<Blob> {
    const key = await this.generateKeyFromPassword(password);
    const iv = this.base64ToArrayBuffer(encryptedFile.iv);

    try {
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: encryptedFile.algorithm,
          iv: new Uint8Array(iv),
        },
        key,
        encryptedFile.encryptedData
      );

      return new Blob([decryptedData], { type: 'application/octet-stream' });
    } catch (error) {
      throw new Error('Decryption failed: Invalid password or corrupted file');
    }
  }

  /**
   * Store encrypted file
   */
  storeEncryptedFile(encryptedFile: EncryptedFile): void {
    this.encryptedFiles.set(encryptedFile.id, encryptedFile);
  }

  /**
   * Get encrypted file
   */
  getEncryptedFile(fileId: string): EncryptedFile | undefined {
    return this.encryptedFiles.get(fileId);
  }

  /**
   * Delete encrypted file
   */
  deleteEncryptedFile(fileId: string): boolean {
    return this.encryptedFiles.delete(fileId);
  }

  /**
   * Get all encrypted files
   */
  getAllEncryptedFiles(): EncryptedFile[] {
    return Array.from(this.encryptedFiles.values());
  }

  /**
   * Helper: Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Helper: Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Helper: Generate salt
   */
  private generateSalt(): string {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return this.arrayBufferToBase64(salt);
  }
}

export const fileEncryptionManager = new FileEncryptionManager();
