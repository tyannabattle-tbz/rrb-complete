// Email Digest Notifications Service
import { format, subDays } from 'date-fns';

export interface DigestPreferences {
  userId: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  enabled: boolean;
  lastSent?: Date;
  nextScheduled?: Date;
  categories: {
    newVideos: boolean;
    recommendations: boolean;
    communityHighlights: boolean;
    playlistUpdates: boolean;
    frequencyUpdates: boolean;
  };
}

export interface DigestContent {
  userId: string;
  period: { start: Date; end: Date };
  newVideos: Array<{ id: string; title: string; channel: string; views: number }>;
  recommendations: Array<{ id: string; title: string; reason: string }>;
  communityHighlights: Array<{ id: string; content: string; engagement: number }>;
  playlistUpdates: Array<{ id: string; name: string; newVideos: number }>;
  frequencyUpdates: Array<{ frequency: string; newContent: number }>;
  stats: {
    totalNewContent: number;
    totalEngagement: number;
    personalizedScore: number;
  };
}

const digestStore = new Map<string, DigestPreferences>();
const digestHistoryStore = new Map<string, DigestContent[]>();

export const emailDigestService = {
  getPreferences: (userId: string): DigestPreferences | undefined => {
    return digestStore.get(userId);
  },

  setPreferences: (userId: string, prefs: Partial<DigestPreferences>): DigestPreferences => {
    const existing = digestStore.get(userId) || {
      userId,
      frequency: 'weekly',
      enabled: true,
      categories: {
        newVideos: true,
        recommendations: true,
        communityHighlights: true,
        playlistUpdates: true,
        frequencyUpdates: true,
      },
    };
    const updated = { ...existing, ...prefs };
    digestStore.set(userId, updated);
    return updated;
  },

  generateDigest: (userId: string, preferences: DigestPreferences): DigestContent => {
    const now = new Date();
    const daysBack = preferences.frequency === 'daily' ? 1 : preferences.frequency === 'weekly' ? 7 : 14;
    const start = subDays(now, daysBack);

    const digest: DigestContent = {
      userId,
      period: { start, end: now },
      newVideos: [],
      recommendations: [],
      communityHighlights: [],
      playlistUpdates: [],
      frequencyUpdates: [],
      stats: {
        totalNewContent: 0,
        totalEngagement: 0,
        personalizedScore: 0,
      },
    };

    if (preferences.categories.newVideos) {
      digest.newVideos = [
        { id: 'v1', title: 'Morning Glory Gospel', channel: 'RRB Gospel Choir', views: 1250 },
        { id: 'v2', title: 'Healing Frequencies 432Hz', channel: 'QUMUS Wellness', views: 3420 },
      ];
    }

    if (preferences.categories.recommendations) {
      digest.recommendations = [
        { id: 'r1', title: 'Soul Revival', reason: 'Based on your love of gospel music' },
        { id: 'r2', title: 'Meditation Guide', reason: 'Trending in your community' },
      ];
    }

    digest.stats.totalNewContent = digest.newVideos.length + digest.recommendations.length;
    digest.stats.personalizedScore = Math.floor(Math.random() * 100);

    return digest;
  },

  sendDigest: async (userId: string, digest: DigestContent): Promise<{ success: boolean; messageId?: string }> => {
    try {
      const history = digestHistoryStore.get(userId) || [];
      history.push(digest);
      digestHistoryStore.set(userId, history);
      return {
        success: true,
        messageId: `msg_${Date.now()}`,
      };
    } catch (error) {
      return { success: false };
    }
  },

  getDigestHistory: (userId: string, limit: number = 10): DigestContent[] => {
    const history = digestHistoryStore.get(userId) || [];
    return history.slice(-limit);
  },

  scheduleNextDigest: (userId: string, preferences: DigestPreferences): Date => {
    const now = new Date();
    const frequencyDays = { daily: 1, weekly: 7, biweekly: 14, monthly: 30 };
    const nextDate = new Date(now.getTime() + frequencyDays[preferences.frequency] * 24 * 60 * 60 * 1000);
    return nextDate;
  },

  getDigestStats: (userId: string) => {
    const history = digestHistoryStore.get(userId) || [];
    return {
      totalSent: history.length,
      avgEngagement: history.length > 0 ? history.reduce((sum, d) => sum + d.stats.totalEngagement, 0) / history.length : 0,
      lastSent: history.length > 0 ? history[history.length - 1].period.end : null,
    };
  },
};
