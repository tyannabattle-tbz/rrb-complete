/**
 * Credential Rotation Service
 * Manages automatic token refresh and credential rotation
 */

import { getDb } from '../db';
import { notificationService } from './notificationService';
import axios from 'axios';

export interface TokenRefreshRequest {
  platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok';
  refresh_token: string;
  client_id: string;
  client_secret: string;
}

export interface TokenRefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

export class CredentialRotationService {
  /**
   * Refresh Twitter OAuth token
   */
  async refreshTwitterToken(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await axios.post(
        'https://api.twitter.com/2/oauth2/token',
        {
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: process.env.TWITTER_CLIENT_ID,
        },
        {
          auth: {
            username: process.env.TWITTER_CLIENT_ID || '',
            password: process.env.TWITTER_CLIENT_SECRET || '',
          },
        }
      );

      return {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_in: response.data.expires_in,
        token_type: response.data.token_type,
      };
    } catch (error: any) {
      console.error('[Rotation] Twitter token refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Refresh Facebook token
   */
  async refreshFacebookToken(accessToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
        params: {
          grant_type: 'fb_exchange_token',
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          fb_exchange_token: accessToken,
        },
      });

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        token_type: 'Bearer',
      };
    } catch (error: any) {
      console.error('[Rotation] Facebook token refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Refresh Instagram token
   */
  async refreshInstagramToken(accessToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await axios.get('https://graph.instagram.com/refresh_access_token', {
        params: {
          grant_type: 'ig_refresh_token',
          access_token: accessToken,
        },
      });

      return {
        access_token: response.data.access_token,
        expires_in: response.data.expires_in,
        token_type: 'Bearer',
      };
    } catch (error: any) {
      console.error('[Rotation] Instagram token refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Refresh TikTok token
   */
  async refreshTikTokToken(refreshToken: string): Promise<TokenRefreshResponse> {
    try {
      const response = await axios.post(
        'https://open.tiktokapis.com/v1/oauth/token/',
        {
          client_key: process.env.TIKTOK_CLIENT_ID,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }
      );

      return {
        access_token: response.data.data.access_token,
        refresh_token: response.data.data.refresh_token,
        expires_in: response.data.data.expires_in,
        token_type: 'Bearer',
      };
    } catch (error: any) {
      console.error('[Rotation] TikTok token refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Rotate credential for a platform
   */
  async rotateCredential(
    credentialId: string,
    platform: 'twitter' | 'facebook' | 'instagram' | 'tiktok',
    refreshToken: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      let newTokenResponse: TokenRefreshResponse;

      // Refresh token based on platform
      switch (platform) {
        case 'twitter':
          newTokenResponse = await this.refreshTwitterToken(refreshToken);
          break;
        case 'facebook':
          newTokenResponse = await this.refreshFacebookToken(refreshToken);
          break;
        case 'instagram':
          newTokenResponse = await this.refreshInstagramToken(refreshToken);
          break;
        case 'tiktok':
          newTokenResponse = await this.refreshTikTokToken(refreshToken);
          break;
        default:
          return { success: false, error: 'Unknown platform' };
      }

      // Update credential in database
      const db = await getDb();
      const expiresAt = Date.now() + newTokenResponse.expires_in * 1000;

      await db.run(
        `UPDATE social_media_credentials 
         SET access_token = ?, refresh_token = ?, expires_at = ?, last_rotated_at = ?
         WHERE id = ?`,
        [
          newTokenResponse.access_token,
          newTokenResponse.refresh_token || refreshToken,
          expiresAt,
          Date.now(),
          credentialId,
        ]
      );

      // Send success notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: `✅ ${platform} Credentials Refreshed`,
        message: `Your ${platform} credentials have been automatically refreshed and are valid for ${Math.round(newTokenResponse.expires_in / 3600)} hours.`,
        severity: 'success',
        data: { platform, expires_at: expiresAt },
      });

      console.log(`[Rotation] ✓ Rotated credentials for ${platform}`);
      return { success: true };
    } catch (error: any) {
      console.error(`[Rotation] Failed to rotate ${platform} credentials:`, error.message);

      // Send error notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: `❌ ${platform} Credential Refresh Failed`,
        message: `Failed to refresh your ${platform} credentials. Please reconnect your account.`,
        severity: 'error',
        data: { platform, error: error.message },
      });

      return { success: false, error: error.message };
    }
  }

  /**
   * Check and rotate all expiring credentials
   */
  async rotateExpiringCredentials(): Promise<{ rotated: number; failed: number }> {
    try {
      const db = await getDb();
      const now = Date.now();
      const oneWeekFromNow = now + 7 * 24 * 60 * 60 * 1000;

      // Get credentials expiring within 7 days
      const expiringCredentials = await db.all(
        `SELECT * FROM social_media_credentials 
         WHERE expires_at BETWEEN ? AND ? AND is_active = 1 AND refresh_token IS NOT NULL`,
        [now, oneWeekFromNow]
      );

      let rotated = 0;
      let failed = 0;

      for (const credential of expiringCredentials) {
        try {
          const result = await this.rotateCredential(
            credential.id,
            credential.platform,
            credential.refresh_token,
            credential.user_id
          );

          if (result.success) {
            rotated++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`[Rotation] Error rotating credential ${credential.id}:`, error);
          failed++;
        }
      }

      console.log(`[Rotation] Rotation complete: ${rotated} rotated, ${failed} failed`);
      return { rotated, failed };
    } catch (error) {
      console.error('[Rotation] Error rotating expiring credentials:', error);
      return { rotated: 0, failed: 0 };
    }
  }

  /**
   * Get credential rotation history
   */
  async getRotationHistory(credentialId: string, limit: number = 10) {
    try {
      const db = await getDb();
      return await db.all(
        `SELECT * FROM credential_rotation_log 
         WHERE credential_id = ? 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [credentialId, limit]
      );
    } catch (error) {
      console.error('[Rotation] Failed to get rotation history:', error);
      return [];
    }
  }

  /**
   * Log rotation event
   */
  async logRotationEvent(
    credentialId: string,
    platform: string,
    status: 'success' | 'failed',
    error?: string
  ): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO credential_rotation_log (credential_id, platform, status, error, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [credentialId, platform, status, error || null, Date.now()]
      );
    } catch (error) {
      console.error('[Rotation] Failed to log rotation event:', error);
    }
  }

  /**
   * Get rotation statistics
   */
  async getRotationStats() {
    try {
      const db = await getDb();

      const stats = await db.get(
        `SELECT 
          COUNT(*) as total_rotations,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(DISTINCT platform) as platforms_rotated
         FROM credential_rotation_log`
      );

      return {
        total_rotations: stats?.total_rotations || 0,
        successful: stats?.successful || 0,
        failed: stats?.failed || 0,
        success_rate: stats?.total_rotations ? ((stats.successful / stats.total_rotations) * 100).toFixed(1) : 0,
        platforms_rotated: stats?.platforms_rotated || 0,
      };
    } catch (error) {
      console.error('[Rotation] Failed to get stats:', error);
      return {
        total_rotations: 0,
        successful: 0,
        failed: 0,
        success_rate: 0,
        platforms_rotated: 0,
      };
    }
  }

  /**
   * Validate credential before rotation
   */
  async validateCredential(
    platform: string,
    accessToken: string
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      switch (platform) {
        case 'twitter':
          await axios.get('https://api.twitter.com/2/users/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          break;

        case 'facebook':
          await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`);
          break;

        case 'instagram':
          await axios.get(`https://graph.instagram.com/me?access_token=${accessToken}`);
          break;

        case 'tiktok':
          await axios.get('https://open.tiktokapis.com/v1/user/info/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          break;

        default:
          return { valid: false, error: 'Unknown platform' };
      }

      return { valid: true };
    } catch (error: any) {
      console.error(`[Rotation] Credential validation failed for ${platform}:`, error.message);
      return { valid: false, error: error.message };
    }
  }
}

export const credentialRotationService = new CredentialRotationService();
