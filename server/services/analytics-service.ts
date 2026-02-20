/**
 * Analytics Service
 * Tracks user engagement metrics: watch time, chat participation, playlist creation
 * A Canryn Production
 */

export interface EngagementMetric {
  userId: string;
  videoId?: string;
  metricType: 'watch' | 'chat' | 'playlist' | 'like' | 'share';
  value: number;
  timestamp: Date;
}

export interface UserEngagementStats {
  userId: string;
  totalWatchTime: number; // in seconds
  chatMessagesCount: number;
  playlistsCreated: number;
  totalLikes: number;
  totalShares: number;
  lastActiveAt: Date;
  engagementScore: number; // 0-100
}

export interface VideoEngagementStats {
  videoId: string;
  title: string;
  views: number;
  avgWatchTime: number;
  chatMessages: number;
  likes: number;
  shares: number;
  engagementRate: number; // percentage
}

export interface PlatformStats {
  totalUsers: number;
  totalVideos: number;
  totalWatchTime: number;
  totalChatMessages: number;
  totalPlaylists: number;
  avgEngagementScore: number;
  topVideos: VideoEngagementStats[];
  topUsers: UserEngagementStats[];
}

// In-memory storage for metrics
const metrics = new Map<string, EngagementMetric[]>();
const userStats = new Map<string, UserEngagementStats>();
const videoStats = new Map<string, VideoEngagementStats>();

export const analyticsService = {
  /**
   * Track an engagement metric
   */
  trackMetric(metric: EngagementMetric): void {
    const key = `${metric.userId}-${metric.metricType}`;
    if (!metrics.has(key)) {
      metrics.set(key, []);
    }
    metrics.get(key)!.push(metric);

    // Update user stats
    this.updateUserStats(metric.userId);
    if (metric.videoId) {
      this.updateVideoStats(metric.videoId);
    }
  },

  /**
   * Update user engagement statistics
   */
  updateUserStats(userId: string): void {
    const userMetrics = Array.from(metrics.values())
      .flat()
      .filter(m => m.userId === userId);

    const stats: UserEngagementStats = {
      userId,
      totalWatchTime: userMetrics
        .filter(m => m.metricType === 'watch')
        .reduce((sum, m) => sum + m.value, 0),
      chatMessagesCount: userMetrics
        .filter(m => m.metricType === 'chat')
        .length,
      playlistsCreated: userMetrics
        .filter(m => m.metricType === 'playlist')
        .length,
      totalLikes: userMetrics
        .filter(m => m.metricType === 'like')
        .reduce((sum, m) => sum + m.value, 0),
      totalShares: userMetrics
        .filter(m => m.metricType === 'share')
        .reduce((sum, m) => sum + m.value, 0),
      lastActiveAt: userMetrics.length > 0 
        ? new Date(Math.max(...userMetrics.map(m => m.timestamp.getTime())))
        : new Date(),
      engagementScore: this.calculateEngagementScore(userMetrics),
    };

    userStats.set(userId, stats);
  },

  /**
   * Update video engagement statistics
   */
  updateVideoStats(videoId: string): void {
    const videoMetrics = Array.from(metrics.values())
      .flat()
      .filter(m => m.videoId === videoId);

    const views = videoMetrics.filter(m => m.metricType === 'watch').length;
    const avgWatchTime = views > 0
      ? videoMetrics
          .filter(m => m.metricType === 'watch')
          .reduce((sum, m) => sum + m.value, 0) / views
      : 0;

    const stats: VideoEngagementStats = {
      videoId,
      title: `Video ${videoId}`,
      views,
      avgWatchTime,
      chatMessages: videoMetrics.filter(m => m.metricType === 'chat').length,
      likes: videoMetrics.filter(m => m.metricType === 'like').reduce((sum, m) => sum + m.value, 0),
      shares: videoMetrics.filter(m => m.metricType === 'share').reduce((sum, m) => sum + m.value, 0),
      engagementRate: views > 0 ? (videoMetrics.length / (views * 10)) * 100 : 0,
    };

    videoStats.set(videoId, stats);
  },

  /**
   * Calculate engagement score (0-100)
   */
  calculateEngagementScore(userMetrics: EngagementMetric[]): number {
    if (userMetrics.length === 0) return 0;

    const weights = {
      watch: 1,
      chat: 2,
      playlist: 3,
      like: 1.5,
      share: 2.5,
    };

    let score = 0;
    userMetrics.forEach(m => {
      score += (weights[m.metricType as keyof typeof weights] || 1) * m.value;
    });

    // Normalize to 0-100
    return Math.min(100, Math.round((score / userMetrics.length) * 10));
  },

  /**
   * Get user engagement statistics
   */
  getUserStats(userId: string): UserEngagementStats | null {
    return userStats.get(userId) || null;
  },

  /**
   * Get video engagement statistics
   */
  getVideoStats(videoId: string): VideoEngagementStats | null {
    return videoStats.get(videoId) || null;
  },

  /**
   * Get platform-wide statistics
   */
  getPlatformStats(): PlatformStats {
    const allMetrics = Array.from(metrics.values()).flat();
    const uniqueUsers = new Set(allMetrics.map(m => m.userId)).size;
    const uniqueVideos = new Set(allMetrics.map(m => m.videoId).filter(Boolean)).size;

    const topVideos = Array.from(videoStats.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    const topUsers = Array.from(userStats.values())
      .sort((a, b) => b.engagementScore - a.engagementScore)
      .slice(0, 10);

    return {
      totalUsers: uniqueUsers,
      totalVideos: uniqueVideos,
      totalWatchTime: allMetrics
        .filter(m => m.metricType === 'watch')
        .reduce((sum, m) => sum + m.value, 0),
      totalChatMessages: allMetrics.filter(m => m.metricType === 'chat').length,
      totalPlaylists: allMetrics.filter(m => m.metricType === 'playlist').length,
      avgEngagementScore: Array.from(userStats.values()).length > 0
        ? Math.round(
            Array.from(userStats.values()).reduce((sum, s) => sum + s.engagementScore, 0) /
            userStats.size
          )
        : 0,
      topVideos,
      topUsers,
    };
  },

  /**
   * Get user metrics over time period
   */
  getUserMetricsInRange(userId: string, startDate: Date, endDate: Date): EngagementMetric[] {
    const userMetrics = Array.from(metrics.values())
      .flat()
      .filter(m => m.userId === userId);

    return userMetrics.filter(
      m => m.timestamp >= startDate && m.timestamp <= endDate
    );
  },

  /**
   * Get video metrics over time period
   */
  getVideoMetricsInRange(videoId: string, startDate: Date, endDate: Date): EngagementMetric[] {
    const videoMetrics = Array.from(metrics.values())
      .flat()
      .filter(m => m.videoId === videoId);

    return videoMetrics.filter(
      m => m.timestamp >= startDate && m.timestamp <= endDate
    );
  },

  /**
   * Export analytics data
   */
  exportAnalytics(format: 'json' | 'csv' = 'json'): string {
    const platformStats = this.getPlatformStats();
    
    if (format === 'json') {
      return JSON.stringify(platformStats, null, 2);
    }

    // CSV format
    let csv = 'Metric,Value\n';
    csv += `Total Users,${platformStats.totalUsers}\n`;
    csv += `Total Videos,${platformStats.totalVideos}\n`;
    csv += `Total Watch Time (seconds),${platformStats.totalWatchTime}\n`;
    csv += `Total Chat Messages,${platformStats.totalChatMessages}\n`;
    csv += `Total Playlists,${platformStats.totalPlaylists}\n`;
    csv += `Average Engagement Score,${platformStats.avgEngagementScore}\n`;

    return csv;
  },

  /**
   * Clear all analytics data (for testing)
   */
  clearAll(): void {
    metrics.clear();
    userStats.clear();
    videoStats.clear();
  },
};
