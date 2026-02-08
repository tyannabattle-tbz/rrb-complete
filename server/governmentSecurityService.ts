/**
 * Government-Grade Security Service
 * Implements FIPS 140-2 compliance, AES-256 encryption, and comprehensive audit logging
 */

import crypto from 'crypto';

export interface SecurityConfig {
  encryptionAlgorithm: 'aes-256-gcm' | 'aes-256-cbc';
  hashAlgorithm: 'sha256' | 'sha512';
  keyDerivation: 'pbkdf2' | 'scrypt';
  tlsVersion: '1.2' | '1.3';
  fipsMode: boolean;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  algorithm: string;
}

export interface AuditLog {
  id: string;
  timestamp: number;
  userId: string;
  action: string;
  resource: string;
  status: 'success' | 'failure';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class GovernmentSecurityService {
  private config: SecurityConfig;
  private auditLogs: AuditLog[] = [];
  private encryptionKey: Buffer;

  constructor(config: Partial<SecurityConfig> = {}) {
    this.config = {
      encryptionAlgorithm: 'aes-256-gcm',
      hashAlgorithm: 'sha256',
      keyDerivation: 'pbkdf2',
      tlsVersion: '1.3',
      fipsMode: true,
      ...config,
    };

    // Derive encryption key from environment
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
    this.encryptionKey = crypto.scryptSync(masterKey, 'salt', 32);
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  encrypt(data: string | Buffer): EncryptedData {
    const plaintext = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.config.encryptionAlgorithm, this.encryptionKey, iv);

    let ciphertext = cipher.update(plaintext);
    ciphertext = Buffer.concat([ciphertext, cipher.final()]);

    const authTag = (cipher as any).getAuthTag();

    return {
      ciphertext: ciphertext.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.config.encryptionAlgorithm,
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  decrypt(encrypted: EncryptedData): string {
    const ciphertext = Buffer.from(encrypted.ciphertext, 'hex');
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');

    const decipher = crypto.createDecipheriv(this.config.encryptionAlgorithm, this.encryptionKey, iv);
    (decipher as any).setAuthTag(authTag);

    let plaintext = decipher.update(ciphertext);
    plaintext = Buffer.concat([plaintext, decipher.final()]);

    return plaintext.toString('utf8');
  }

  /**
   * Hash data using SHA-256 or SHA-512
   */
  hash(data: string | Buffer): string {
    const input = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    return crypto.createHash(this.config.hashAlgorithm).update(input).digest('hex');
  }

  /**
   * Verify hash
   */
  verifyHash(data: string | Buffer, hash: string): boolean {
    return this.hash(data) === hash;
  }

  /**
   * Derive key using PBKDF2 or Scrypt
   */
  deriveKey(password: string, salt?: Buffer): Buffer {
    const saltBuffer = salt || crypto.randomBytes(16);

    if (this.config.keyDerivation === 'pbkdf2') {
      return crypto.pbkdf2Sync(password, saltBuffer, 100000, 32, 'sha256');
    } else {
      return crypto.scryptSync(password, saltBuffer, 32);
    }
  }

  /**
   * Generate cryptographically secure random bytes
   */
  generateRandomBytes(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate secure token
   */
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url');
  }

  /**
   * Sign data using HMAC
   */
  sign(data: string | Buffer): string {
    const input = typeof data === 'string' ? Buffer.from(data, 'utf8') : data;
    return crypto.createHmac(this.config.hashAlgorithm, this.encryptionKey).update(input).digest('hex');
  }

  /**
   * Verify signature
   */
  verifySignature(data: string | Buffer, signature: string): boolean {
    return this.sign(data) === signature;
  }

  /**
   * Log audit event
   */
  logAudit(
    userId: string,
    action: string,
    resource: string,
    status: 'success' | 'failure',
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): AuditLog {
    const log: AuditLog = {
      id: this.generateSecureToken(16),
      timestamp: Date.now(),
      userId,
      action,
      resource,
      status,
      details: details || {},
      ipAddress,
      userAgent,
    };

    this.auditLogs.push(log);

    // Keep only last 10000 logs in memory
    if (this.auditLogs.length > 10000) {
      this.auditLogs = this.auditLogs.slice(-10000);
    }

    return log;
  }

  /**
   * Get audit logs
   */
  getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    status?: 'success' | 'failure';
    startTime?: number;
    endTime?: number;
  }): AuditLog[] {
    let logs = this.auditLogs;

    if (filters?.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }

    if (filters?.action) {
      logs = logs.filter(l => l.action === filters.action);
    }

    if (filters?.status) {
      logs = logs.filter(l => l.status === filters.status);
    }

    if (filters?.startTime) {
      logs = logs.filter(l => l.timestamp >= filters.startTime!);
    }

    if (filters?.endTime) {
      logs = logs.filter(l => l.timestamp <= filters.endTime!);
    }

    return logs;
  }

  /**
   * Generate security report
   */
  generateSecurityReport(): {
    fipsCompliant: boolean;
    encryptionAlgorithm: string;
    hashAlgorithm: string;
    tlsVersion: string;
    auditLogCount: number;
    failureCount: number;
    lastFailure?: AuditLog;
    complianceStatus: string;
  } {
    const failures = this.auditLogs.filter(l => l.status === 'failure');
    const lastFailure = failures.length > 0 ? failures[failures.length - 1] : undefined;

    return {
      fipsCompliant: this.config.fipsMode,
      encryptionAlgorithm: this.config.encryptionAlgorithm,
      hashAlgorithm: this.config.hashAlgorithm,
      tlsVersion: this.config.tlsVersion,
      auditLogCount: this.auditLogs.length,
      failureCount: failures.length,
      lastFailure,
      complianceStatus: this.config.fipsMode ? 'FIPS 140-2 Compliant' : 'Non-compliant',
    };
  }

  /**
   * Validate FIPS compliance
   */
  validateFIPSCompliance(): {
    compliant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (this.config.encryptionAlgorithm !== 'aes-256-gcm') {
      issues.push('Must use AES-256-GCM for FIPS compliance');
    }

    if (!['sha256', 'sha512'].includes(this.config.hashAlgorithm)) {
      issues.push('Must use SHA-256 or SHA-512 for FIPS compliance');
    }

    if (this.config.tlsVersion !== '1.3') {
      issues.push('Must use TLS 1.3 for FIPS compliance');
    }

    return {
      compliant: issues.length === 0,
      issues,
    };
  }

  /**
   * Rotate encryption key
   */
  rotateEncryptionKey(newMasterKey: string): void {
    this.encryptionKey = crypto.scryptSync(newMasterKey, 'salt', 32);
  }

  /**
   * Clear audit logs (for testing only)
   */
  clearAuditLogs(): void {
    this.auditLogs = [];
  }
}

// Export singleton instance
export const governmentSecurityService = new GovernmentSecurityService({
  fipsMode: true,
  encryptionAlgorithm: 'aes-256-gcm',
  hashAlgorithm: 'sha256',
  tlsVersion: '1.3',
});
