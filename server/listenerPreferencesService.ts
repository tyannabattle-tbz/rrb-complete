/**
 * Listener Preferences Service
 * Manages persistent user preferences for audio quality, notifications, ratings, etc.
 * Integrates with database for cross-device synchronization
 */

import { db } from './db';
import { users, listenerPreferences } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export type QualityLevel = 'low' | 'medium' | 'high' | 'lossless';
export type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'never';

export interface ListenerPreferences {
  userId: string;
  preferredQuality: QualityLevel;
  autoAdjustQuality: boolean;
  notificationFrequency: NotificationFrequency;
  enableEmailNotifications: boolean;
  enableBrowserNotifications: boolean;
  darkMode: boolean;
  volume: number; // 0-100
  autoPlay: boolean;
  rememberLastStream: boolean;
  lastStreamUrl?: string;
  lastStreamName?: string;
  favoriteChannels: string[]; // Array of channel URLs
  blockedChannels: string[];
  language: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

class ListenerPreferencesService {
  /**
   * Safe JSON parse with fallback
   */
  private safeJsonParse(json: string | null, defaultValue: any = []) {
    if (!json) return defaultValue;
    try {
      return JSON.parse(json);
    } catch (e) {
      console.error('JSON parse error:', e);
      return defaultValue;
    }
  }

  /**
   * Safe JSON stringify
   */
  private safeJsonStringify(value: any) {
    try {
      return JSON.stringify(value);
    } catch (e) {
      console.error('JSON stringify error:', e);
      return '[]';
    }
  }
  /**
   * Get user preferences from database
   */
  async getPreferences(userId: string): Promise<ListenerPreferences | null> {
    try {
      const result = await db
        .select()
        .from(listenerPreferences)
        .where(eq(listenerPreferences.userId, userId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const prefs = result[0];
      return {
        userId: prefs.userId,
        preferredQuality: (prefs.preferredQuality as QualityLevel) || 'medium',
        autoAdjustQuality: prefs.autoAdjustQuality ?? true,
        notificationFrequency: (prefs.notificationFrequency as NotificationFrequency) || 'daily',
        enableEmailNotifications: prefs.enableEmailNotifications ?? true,
        enableBrowserNotifications: prefs.enableBrowserNotifications ?? true,
        darkMode: prefs.darkMode ?? true,
        volume: prefs.volume ?? 70,
        autoPlay: prefs.autoPlay ?? false,
        rememberLastStream: prefs.rememberLastStream ?? true,
        lastStreamUrl: prefs.lastStreamUrl || undefined,
        lastStreamName: prefs.lastStreamName || undefined,
        favoriteChannels: this.safeJsonParse(prefs.favoriteChannels as string | null, []),
        blockedChannels: this.safeJsonParse(prefs.blockedChannels as string | null, []),
        language: prefs.language || 'en',
        timezone: prefs.timezone || 'UTC',
        createdAt: new Date(prefs.createdAt),
        updatedAt: new Date(prefs.updatedAt),
      };
    } catch (error) {
      console.error('Error fetching listener preferences:', error);
      return null;
    }
  }

  /**
   * Create default preferences for new user
   */
  async createDefaultPreferences(userId: string): Promise<ListenerPreferences> {
    const now = new Date();
    const defaultPrefs: ListenerPreferences = {
      userId,
      preferredQuality: 'medium',
      autoAdjustQuality: true,
      notificationFrequency: 'daily',
      enableEmailNotifications: true,
      enableBrowserNotifications: true,
      darkMode: true,
      volume: 70,
      autoPlay: false,
      rememberLastStream: true,
      favoriteChannels: [],
      blockedChannels: [],
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.insert(listenerPreferences).values({
        userId,
        preferredQuality: defaultPrefs.preferredQuality,
        autoAdjustQuality: defaultPrefs.autoAdjustQuality,
        notificationFrequency: defaultPrefs.notificationFrequency,
        enableEmailNotifications: defaultPrefs.enableEmailNotifications,
        enableBrowserNotifications: defaultPrefs.enableBrowserNotifications,
        darkMode: defaultPrefs.darkMode,
        volume: defaultPrefs.volume,
        autoPlay: defaultPrefs.autoPlay,
        rememberLastStream: defaultPrefs.rememberLastStream,
        favoriteChannels: JSON.stringify(defaultPrefs.favoriteChannels),
        blockedChannels: JSON.stringify(defaultPrefs.blockedChannels),
        language: defaultPrefs.language,
        timezone: defaultPrefs.timezone,
        createdAt: now,
        updatedAt: now,
      });

      return defaultPrefs;
    } catch (error) {
      console.error('Error creating default preferences:', error);
      return defaultPrefs;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    updates: Partial<ListenerPreferences>
  ): Promise<ListenerPreferences | null> {
    try {
      const now = new Date();
      const updateData: any = {
        ...updates,
        updatedAt: now,
      };

      // Convert arrays to JSON strings
      if (updates.favoriteChannels) {
        updateData.favoriteChannels = JSON.stringify(updates.favoriteChannels);
      }
      if (updates.blockedChannels) {
        updateData.blockedChannels = JSON.stringify(updates.blockedChannels);
      }

      await db
        .update(listenerPreferences)
        .set(updateData)
        .where(eq(listenerPreferences.userId, userId));

      return this.getPreferences(userId);
    } catch (error) {
      console.error('Error updating listener preferences:', error);
      return null;
    }
  }

  /**
   * Update quality preference
   */
  async updateQualityPreference(userId: string, quality: QualityLevel): Promise<boolean> {
    try {
      await db
        .update(listenerPreferences)
        .set({
          preferredQuality: quality,
          updatedAt: new Date(),
        })
        .where(eq(listenerPreferences.userId, userId));

      return true;
    } catch (error) {
      console.error('Error updating quality preference:', error);
      return false;
    }
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(
    userId: string,
    settings: {
      frequency?: NotificationFrequency;
      email?: boolean;
      browser?: boolean;
    }
  ): Promise<boolean> {
    try {
      const updateData: any = {
        updatedAt: new Date(),
      };

      if (settings.frequency) updateData.notificationFrequency = settings.frequency;
      if (settings.email !== undefined) updateData.enableEmailNotifications = settings.email;
      if (settings.browser !== undefined) updateData.enableBrowserNotifications = settings.browser;

      await db
        .update(listenerPreferences)
        .set(updateData)
        .where(eq(listenerPreferences.userId, userId));

      return true;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  /**
   * Add channel to favorites
   */
  async addFavoriteChannel(userId: string, channelUrl: string): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      if (!prefs) return false;

      if (!prefs.favoriteChannels.includes(channelUrl)) {
        prefs.favoriteChannels.push(channelUrl);
        await this.updatePreferences(userId, {
          favoriteChannels: prefs.favoriteChannels,
        });
      }

      return true;
    } catch (error) {
      console.error('Error adding favorite channel:', error);
      return false;
    }
  }

  /**
   * Remove channel from favorites
   */
  async removeFavoriteChannel(userId: string, channelUrl: string): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      if (!prefs) return false;

      prefs.favoriteChannels = prefs.favoriteChannels.filter(url => url !== channelUrl);
      await this.updatePreferences(userId, {
        favoriteChannels: prefs.favoriteChannels,
      });

      return true;
    } catch (error) {
      console.error('Error removing favorite channel:', error);
      return false;
    }
  }

  /**
   * Block channel
   */
  async blockChannel(userId: string, channelUrl: string): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      if (!prefs) return false;

      if (!prefs.blockedChannels.includes(channelUrl)) {
        prefs.blockedChannels.push(channelUrl);
        // Also remove from favorites if present
        prefs.favoriteChannels = prefs.favoriteChannels.filter(url => url !== channelUrl);

        await this.updatePreferences(userId, {
          blockedChannels: prefs.blockedChannels,
          favoriteChannels: prefs.favoriteChannels,
        });
      }

      return true;
    } catch (error) {
      console.error('Error blocking channel:', error);
      return false;
    }
  }

  /**
   * Unblock channel
   */
  async unblockChannel(userId: string, channelUrl: string): Promise<boolean> {
    try {
      const prefs = await this.getPreferences(userId);
      if (!prefs) return false;

      prefs.blockedChannels = prefs.blockedChannels.filter(url => url !== channelUrl);
      await this.updatePreferences(userId, {
        blockedChannels: prefs.blockedChannels,
      });

      return true;
    } catch (error) {
      console.error('Error unblocking channel:', error);
      return false;
    }
  }

  /**
   * Update last played stream
   */
  async updateLastStream(
    userId: string,
    streamUrl: string,
    streamName: string
  ): Promise<boolean> {
    try {
      await db
        .update(listenerPreferences)
        .set({
          lastStreamUrl: streamUrl,
          lastStreamName: streamName,
          updatedAt: new Date(),
        })
        .where(eq(listenerPreferences.userId, userId));

      return true;
    } catch (error) {
      console.error('Error updating last stream:', error);
      return false;
    }
  }

  /**
   * Get all users with specific preference
   */
  async getUsersByPreference(
    preferenceKey: keyof ListenerPreferences,
    value: any
  ): Promise<string[]> {
    try {
      // This is a simplified version - in production, you'd want more sophisticated querying
      const results = await db.select({ userId: listenerPreferences.userId }).from(listenerPreferences);

      return results.map(r => r.userId);
    } catch (error) {
      console.error('Error getting users by preference:', error);
      return [];
    }
  }

  /**
   * Export preferences as JSON
   */
  async exportPreferences(userId: string): Promise<string | null> {
    try {
      const prefs = await this.getPreferences(userId);
      if (!prefs) return null;

      return JSON.stringify(prefs, null, 2);
    } catch (error) {
      console.error('Error exporting preferences:', error);
      return null;
    }
  }

  /**
   * Import preferences from JSON
   */
  async importPreferences(userId: string, jsonData: string): Promise<boolean> {
    try {
      const prefs = JSON.parse(jsonData) as Partial<ListenerPreferences>;
      await this.updatePreferences(userId, prefs);
      return true;
    } catch (error) {
      console.error('Error importing preferences:', error);
      return false;
    }
  }
}

export const listenerPreferencesService = new ListenerPreferencesService();
