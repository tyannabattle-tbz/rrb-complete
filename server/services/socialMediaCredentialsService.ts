/**
 * Social Media Credentials Management Service
 * Handles secure storage and retrieval of social media API credentials
 */

import { getDb } from '../db';
import { notificationService } from './notificationService';
import crypto from 'crypto';

export interface SocialMediaCredential {
  id: string;
  user_id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok';
  access_token: string;
  access_token_secret?: string;
  refresh_token?: string;
  expires_at?: number;
  account_name: string;
  account_id: string;
  is_active: boolean;
  created_at: number;
  last_used_at?: number;
}

export class SocialMediaCredentialsService {
  private encryptionKey = process.env.SOCIAL_MEDIA_ENCRYPTION_KEY || 'default-key-change-in-production';

  /**
   * Encrypt sensitive data
   */
  private encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32)), iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('[Credentials] Encryption failed:', error);
      throw error;
    }
  }

  /**
   * Decrypt sensitive data
   */
  private decrypt(encryptedData: string): string {
    try {
      const [ivHex, encrypted] = encryptedData.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey.padEnd(32)), iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('[Credentials] Decryption failed:', error);
      throw error;
    }
  }

  /**
   * Add social media credentials
   */
  async addCredentials(
    userId: string,
    platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok',
    accessToken: string,
    accountName: string,
    accountId: string,
    accessTokenSecret?: string,
    refreshToken?: string,
    expiresAt?: number
  ): Promise<SocialMediaCredential> {
    try {
      const db = await getDb();
      const credential: SocialMediaCredential = {
        id: `cred-${platform}-${Date.now()}`,
        user_id: userId,
        platform,
        access_token: this.encrypt(accessToken),
        access_token_secret: accessTokenSecret ? this.encrypt(accessTokenSecret) : undefined,
        refresh_token: refreshToken ? this.encrypt(refreshToken) : undefined,
        expires_at: expiresAt,
        account_name: accountName,
        account_id: accountId,
        is_active: true,
        created_at: Date.now(),
      };

      await db.run(
        `INSERT INTO social_media_credentials 
         (id, user_id, platform, access_token, access_token_secret, refresh_token, expires_at, account_name, account_id, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          credential.id,
          credential.user_id,
          credential.platform,
          credential.access_token,
          credential.access_token_secret,
          credential.refresh_token,
          credential.expires_at,
          credential.account_name,
          credential.account_id,
          credential.is_active ? 1 : 0,
          credential.created_at,
        ]
      );

      // Send notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: `✅ ${platform} Connected`,
        message: `Successfully connected to ${platform} account: ${accountName}`,
        severity: 'success',
        data: { platform, accountName },
      });

      console.log(`[Credentials] Added credentials for ${platform} account: ${accountName}`);
      return credential;
    } catch (error) {
      console.error('[Credentials] Failed to add credentials:', error);
      throw error;
    }
  }

  /**
   * Get credentials for a platform
   */
  async getCredentials(
    userId: string,
    platform: string
  ): Promise<SocialMediaCredential | null> {
    try {
      const db = await getDb();
      const credential = await db.get(
        'SELECT * FROM social_media_credentials WHERE user_id = ? AND platform = ? AND is_active = 1',
        [userId, platform]
      );

      if (!credential) {
        return null;
      }

      // Decrypt sensitive fields
      return {
        ...credential,
        access_token: this.decrypt(credential.access_token),
        access_token_secret: credential.access_token_secret ? this.decrypt(credential.access_token_secret) : undefined,
        refresh_token: credential.refresh_token ? this.decrypt(credential.refresh_token) : undefined,
      };
    } catch (error) {
      console.error('[Credentials] Failed to get credentials:', error);
      return null;
    }
  }

  /**
   * Get all credentials for a user
   */
  async getUserCredentials(userId: string): Promise<SocialMediaCredential[]> {
    try {
      const db = await getDb();
      const credentials = await db.all(
        'SELECT * FROM social_media_credentials WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      return credentials.map(cred => ({
        ...cred,
        access_token: this.decrypt(cred.access_token),
        access_token_secret: cred.access_token_secret ? this.decrypt(cred.access_token_secret) : undefined,
        refresh_token: cred.refresh_token ? this.decrypt(cred.refresh_token) : undefined,
      }));
    } catch (error) {
      console.error('[Credentials] Failed to get user credentials:', error);
      return [];
    }
  }

  /**
   * Update credentials
   */
  async updateCredentials(
    credentialId: string,
    accessToken?: string,
    refreshToken?: string,
    expiresAt?: number
  ): Promise<void> {
    try {
      const db = await getDb();
      const updates: string[] = [];
      const values: any[] = [];

      if (accessToken) {
        updates.push('access_token = ?');
        values.push(this.encrypt(accessToken));
      }

      if (refreshToken) {
        updates.push('refresh_token = ?');
        values.push(this.encrypt(refreshToken));
      }

      if (expiresAt) {
        updates.push('expires_at = ?');
        values.push(expiresAt);
      }

      if (updates.length === 0) return;

      values.push(credentialId);
      await db.run(
        `UPDATE social_media_credentials SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      console.log(`[Credentials] Updated credentials: ${credentialId}`);
    } catch (error) {
      console.error('[Credentials] Failed to update credentials:', error);
      throw error;
    }
  }

  /**
   * Revoke credentials
   */
  async revokeCredentials(credentialId: string, userId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE social_media_credentials SET is_active = 0 WHERE id = ?',
        [credentialId]
      );

      const credential = await db.get(
        'SELECT platform, account_name FROM social_media_credentials WHERE id = ?',
        [credentialId]
      );

      // Send notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: `🔓 ${credential.platform} Disconnected`,
        message: `Revoked access to ${credential.platform} account: ${credential.account_name}`,
        severity: 'info',
        data: { platform: credential.platform },
      });

      console.log(`[Credentials] Revoked credentials: ${credentialId}`);
    } catch (error) {
      console.error('[Credentials] Failed to revoke credentials:', error);
      throw error;
    }
  }

  /**
   * Check if credentials are expired
   */
  async checkExpiration(credentialId: string): Promise<boolean> {
    try {
      const db = await getDb();
      const credential = await db.get(
        'SELECT expires_at FROM social_media_credentials WHERE id = ?',
        [credentialId]
      );

      if (!credential || !credential.expires_at) {
        return false;
      }

      const isExpired = credential.expires_at < Date.now();
      if (isExpired) {
        await this.revokeCredentials(credentialId, credential.user_id);
      }

      return isExpired;
    } catch (error) {
      console.error('[Credentials] Failed to check expiration:', error);
      return false;
    }
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(credentialId: string): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        'UPDATE social_media_credentials SET last_used_at = ? WHERE id = ?',
        [Date.now(), credentialId]
      );
    } catch (error) {
      console.error('[Credentials] Failed to update last used:', error);
    }
  }

  /**
   * Get credential statistics
   */
  async getCredentialStats(userId: string) {
    try {
      const db = await getDb();
      const stats = await db.get(
        `SELECT 
          COUNT(*) as total_credentials,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_credentials,
          COUNT(DISTINCT platform) as platforms_connected
         FROM social_media_credentials 
         WHERE user_id = ?`,
        [userId]
      );

      return {
        total_credentials: stats.total_credentials || 0,
        active_credentials: stats.active_credentials || 0,
        platforms_connected: stats.platforms_connected || 0,
      };
    } catch (error) {
      console.error('[Credentials] Failed to get stats:', error);
      return {
        total_credentials: 0,
        active_credentials: 0,
        platforms_connected: 0,
      };
    }
  }
}

export const socialMediaCredentialsService = new SocialMediaCredentialsService();
