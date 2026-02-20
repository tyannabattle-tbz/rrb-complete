/**
 * Notification Preferences Service
 * Manages user notification settings and preferences
 * A Canryn Production
 */

export type NotificationType = 'likes' | 'replies' | 'recommendations' | 'playlist_shares' | 'new_videos' | 'system';
export type NotificationChannel = 'push' | 'email' | 'in_app';
export type FrequencyLevel = 'instant' | 'daily' | 'weekly' | 'never';

export interface NotificationPreference {
  userId: string;
  notificationType: NotificationType;
  channels: {
    push: boolean;
    email: boolean;
    in_app: boolean;
  };
  frequency: FrequencyLevel;
  enabled: boolean;
}

export interface UserNotificationSettings {
  userId: string;
  preferences: NotificationPreference[];
  doNotDisturbStart?: string; // HH:MM format
  doNotDisturbEnd?: string;   // HH:MM format
  doNotDisturbEnabled: boolean;
  lastUpdatedAt: Date;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  actionUrl?: string;
}

// In-memory storage
const userSettings = new Map<string, UserNotificationSettings>();
const templates = new Map<string, NotificationTemplate>();

// Default templates
const defaultTemplates: NotificationTemplate[] = [
  {
    id: 'like-notification',
    type: 'likes',
    title: 'New Like',
    message: '{userName} liked your comment',
    icon: '❤️',
  },
  {
    id: 'reply-notification',
    type: 'replies',
    title: 'New Reply',
    message: '{userName} replied to your comment',
    icon: '💬',
  },
  {
    id: 'recommendation-notification',
    type: 'recommendations',
    title: 'Recommended for You',
    message: 'Check out "{videoTitle}" - we think you\'ll love it!',
    icon: '⭐',
  },
  {
    id: 'playlist-share-notification',
    type: 'playlist_shares',
    title: 'Playlist Shared',
    message: '{userName} shared a playlist with you',
    icon: '📋',
  },
  {
    id: 'new-video-notification',
    type: 'new_videos',
    title: 'New Video Available',
    message: 'New video from {channelName}: "{videoTitle}"',
    icon: '🎬',
  },
];

defaultTemplates.forEach(t => templates.set(t.id, t));

export const notificationPreferencesService = {
  /**
   * Initialize default preferences for a user
   */
  initializeUserPreferences(userId: string): UserNotificationSettings {
    const existing = userSettings.get(userId);
    if (existing) return existing;

    const preferences: NotificationPreference[] = [
      {
        userId,
        notificationType: 'likes',
        channels: { push: true, email: false, in_app: true },
        frequency: 'instant',
        enabled: true,
      },
      {
        userId,
        notificationType: 'replies',
        channels: { push: true, email: false, in_app: true },
        frequency: 'instant',
        enabled: true,
      },
      {
        userId,
        notificationType: 'recommendations',
        channels: { push: false, email: true, in_app: true },
        frequency: 'daily',
        enabled: true,
      },
      {
        userId,
        notificationType: 'playlist_shares',
        channels: { push: true, email: false, in_app: true },
        frequency: 'instant',
        enabled: true,
      },
      {
        userId,
        notificationType: 'new_videos',
        channels: { push: false, email: true, in_app: true },
        frequency: 'daily',
        enabled: true,
      },
      {
        userId,
        notificationType: 'system',
        channels: { push: true, email: true, in_app: true },
        frequency: 'instant',
        enabled: true,
      },
    ];

    const settings: UserNotificationSettings = {
      userId,
      preferences,
      doNotDisturbEnabled: false,
      lastUpdatedAt: new Date(),
    };

    userSettings.set(userId, settings);
    return settings;
  },

  /**
   * Get user notification settings
   */
  getUserSettings(userId: string): UserNotificationSettings {
    let settings = userSettings.get(userId);
    if (!settings) {
      settings = this.initializeUserPreferences(userId);
    }
    return settings;
  },

  /**
   * Update notification preference
   */
  updatePreference(
    userId: string,
    notificationType: NotificationType,
    updates: Partial<NotificationPreference>
  ): NotificationPreference | null {
    const settings = this.getUserSettings(userId);
    const preference = settings.preferences.find(p => p.notificationType === notificationType);

    if (!preference) return null;

    Object.assign(preference, updates);
    settings.lastUpdatedAt = new Date();

    return preference;
  },

  /**
   * Update channel preferences
   */
  updateChannels(
    userId: string,
    notificationType: NotificationType,
    channels: { push?: boolean; email?: boolean; in_app?: boolean }
  ): NotificationPreference | null {
    const settings = this.getUserSettings(userId);
    const preference = settings.preferences.find(p => p.notificationType === notificationType);

    if (!preference) return null;

    Object.assign(preference.channels, channels);
    settings.lastUpdatedAt = new Date();

    return preference;
  },

  /**
   * Update frequency level
   */
  updateFrequency(
    userId: string,
    notificationType: NotificationType,
    frequency: FrequencyLevel
  ): NotificationPreference | null {
    return this.updatePreference(userId, notificationType, { frequency });
  },

  /**
   * Toggle notification type
   */
  toggleNotificationType(
    userId: string,
    notificationType: NotificationType,
    enabled: boolean
  ): NotificationPreference | null {
    return this.updatePreference(userId, notificationType, { enabled });
  },

  /**
   * Set do-not-disturb hours
   */
  setDoNotDisturb(
    userId: string,
    startTime: string,
    endTime: string,
    enabled: boolean
  ): UserNotificationSettings | null {
    const settings = userSettings.get(userId);
    if (!settings) return null;

    settings.doNotDisturbStart = startTime;
    settings.doNotDisturbEnd = endTime;
    settings.doNotDisturbEnabled = enabled;
    settings.lastUpdatedAt = new Date();

    return settings;
  },

  /**
   * Check if user is in do-not-disturb period
   */
  isInDoNotDisturb(userId: string): boolean {
    const settings = this.getUserSettings(userId);
    if (!settings.doNotDisturbEnabled || !settings.doNotDisturbStart || !settings.doNotDisturbEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return currentTime >= settings.doNotDisturbStart && currentTime <= settings.doNotDisturbEnd;
  },

  /**
   * Check if notification should be sent
   */
  shouldSendNotification(
    userId: string,
    notificationType: NotificationType,
    channel: NotificationChannel
  ): boolean {
    const settings = this.getUserSettings(userId);
    const preference = settings.preferences.find(p => p.notificationType === notificationType);

    if (!preference || !preference.enabled) return false;
    if (!preference.channels[channel]) return false;
    if (this.isInDoNotDisturb(userId) && channel === 'push') return false;

    return true;
  },

  /**
   * Get notification template
   */
  getTemplate(templateId: string): NotificationTemplate | null {
    return templates.get(templateId) || null;
  },

  /**
   * Get template by type
   */
  getTemplateByType(type: NotificationType): NotificationTemplate | null {
    const template = Array.from(templates.values()).find(t => t.type === type);
    return template || null;
  },

  /**
   * Add custom template
   */
  addTemplate(template: NotificationTemplate): void {
    templates.set(template.id, template);
  },

  /**
   * Get all templates
   */
  getAllTemplates(): NotificationTemplate[] {
    return Array.from(templates.values());
  },

  /**
   * Export user preferences
   */
  exportPreferences(userId: string): string {
    const settings = this.getUserSettings(userId);
    return JSON.stringify(settings, null, 2);
  },

  /**
   * Import user preferences
   */
  importPreferences(userId: string, jsonData: string): UserNotificationSettings | null {
    try {
      const imported = JSON.parse(jsonData) as UserNotificationSettings;
      imported.userId = userId;
      imported.lastUpdatedAt = new Date();
      userSettings.set(userId, imported);
      return imported;
    } catch {
      return null;
    }
  },

  /**
   * Get all user settings (admin)
   */
  getAllUserSettings(): UserNotificationSettings[] {
    return Array.from(userSettings.values());
  },

  /**
   * Clear all preferences (for testing)
   */
  clearAll(): void {
    userSettings.clear();
  },
};
