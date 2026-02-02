/**
 * Video Recommendation Engine
 * Provides personalized video recommendations based on:
 * - Viewing history
 * - Similar content (style, duration, theme)
 * - Trending videos
 * - User preferences
 */

interface VideoMetadata {
  videoId: string;
  title: string;
  description: string;
  style: string;
  duration: number;
  resolution: string;
  createdAt: Date;
  viewCount: number;
  likeCount: number;
  userId: string;
}

interface UserViewHistory {
  videoId: string;
  viewedAt: Date;
  watchDuration: number; // seconds watched
  completed: boolean;
}

interface RecommendationScore {
  videoId: string;
  score: number;
  reason: string;
}

export class VideoRecommendationEngine {
  /**
   * Get personalized recommendations for a user
   */
  static getPersonalizedRecommendations(
    userId: string,
    viewHistory: UserViewHistory[],
    allVideos: VideoMetadata[],
    limit: number = 10
  ): VideoMetadata[] {
    const scores = this.calculateRecommendationScores(userId, viewHistory, allVideos);

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => allVideos.find((v) => v.videoId === s.videoId))
      .filter((v): v is VideoMetadata => v !== undefined);
  }

  /**
   * Calculate recommendation scores for all videos
   */
  private static calculateRecommendationScores(
    userId: string,
    viewHistory: UserViewHistory[],
    allVideos: VideoMetadata[]
  ): RecommendationScore[] {
    const watchedVideoIds = new Set(viewHistory.map((v) => v.videoId));
    const userPreferences = this.extractUserPreferences(viewHistory, allVideos);

    return allVideos
      .filter((v) => !watchedVideoIds.has(v.videoId))
      .map((video) => ({
        videoId: video.videoId,
        score: this.calculateVideoScore(video, userPreferences, viewHistory, allVideos),
        reason: this.getRecommendationReason(video, userPreferences),
      }));
  }

  /**
   * Extract user preferences from viewing history
   */
  private static extractUserPreferences(
    viewHistory: UserViewHistory[],
    allVideos: VideoMetadata[]
  ): Record<string, number> {
    const preferences: Record<string, number> = {
      avgDuration: 0,
      preferredStyle: "",
      engagementScore: 0,
    };

    if (viewHistory.length === 0) return preferences;

    // Calculate average duration watched
    const avgDuration =
      viewHistory.reduce((sum, v) => sum + v.watchDuration, 0) / viewHistory.length;
    preferences.avgDuration = avgDuration;

    // Find most watched style
    const styleFrequency: Record<string, number> = {};
    viewHistory.forEach((view) => {
      const video = allVideos.find((v) => v.videoId === view.videoId);
      if (video) {
        styleFrequency[video.style] = (styleFrequency[video.style] || 0) + 1;
      }
    });

    const preferredStyle = Object.entries(styleFrequency).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (preferredStyle) preferences.preferredStyle = preferredStyle;

    // Calculate engagement score (completion rate)
    const completionRate = viewHistory.filter((v) => v.completed).length / viewHistory.length;
    preferences.engagementScore = completionRate;

    return preferences;
  }

  /**
   * Calculate recommendation score for a single video
   */
  private static calculateVideoScore(
    video: VideoMetadata,
    userPreferences: Record<string, number>,
    viewHistory: UserViewHistory[],
    allVideos: VideoMetadata[]
  ): number {
    let score = 0;

    // 1. Style match (40% weight)
    if (userPreferences.preferredStyle === video.style) {
      score += 40;
    }

    // 2. Trending score (30% weight)
    const avgViews =
      allVideos.reduce((sum, v) => sum + v.viewCount, 0) / allVideos.length;
    const trendingScore = Math.min((video.viewCount / avgViews) * 30, 30);
    score += trendingScore;

    // 3. Quality score (20% weight)
    const avgLikes = allVideos.reduce((sum, v) => sum + v.likeCount, 0) / allVideos.length;
    const qualityScore = Math.min((video.likeCount / avgLikes) * 20, 20);
    score += qualityScore;

    // 4. Recency bonus (10% weight)
    const daysSinceCreated = (Date.now() - video.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(10 - daysSinceCreated * 0.1, 0);
    score += recencyScore;

    // 5. Diversity penalty (avoid similar videos to recently watched)
    const recentlyWatched = viewHistory.slice(-5);
    const similarCount = recentlyWatched.filter((v) => {
      const recentVideo = allVideos.find((av) => av.videoId === v.videoId);
      return recentVideo?.style === video.style;
    }).length;
    score -= similarCount * 5;

    return Math.max(score, 0);
  }

  /**
   * Get reason for recommendation
   */
  private static getRecommendationReason(
    video: VideoMetadata,
    userPreferences: Record<string, number>
  ): string {
    if (userPreferences.preferredStyle === video.style) {
      return `Based on your interest in ${video.style} videos`;
    }

    if (video.viewCount > 1000) {
      return "Trending now";
    }

    return "You might like this";
  }

  /**
   * Get trending videos
   */
  static getTrendingVideos(allVideos: VideoMetadata[], limit: number = 10): VideoMetadata[] {
    return allVideos
      .sort((a, b) => {
        // Sort by engagement (views + likes)
        const engagementA = a.viewCount + a.likeCount * 10;
        const engagementB = b.viewCount + b.likeCount * 10;
        return engagementB - engagementA;
      })
      .slice(0, limit);
  }

  /**
   * Get similar videos
   */
  static getSimilarVideos(
    videoId: string,
    allVideos: VideoMetadata[],
    limit: number = 5
  ): VideoMetadata[] {
    const targetVideo = allVideos.find((v) => v.videoId === videoId);
    if (!targetVideo) return [];

    return allVideos
      .filter((v) => v.videoId !== videoId)
      .sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Style match
        if (a.style === targetVideo.style) scoreA += 50;
        if (b.style === targetVideo.style) scoreB += 50;

        // Duration similarity (within 20%)
        const durationDiffA = Math.abs(a.duration - targetVideo.duration);
        const durationDiffB = Math.abs(b.duration - targetVideo.duration);
        scoreA += Math.max(30 - durationDiffA / 10, 0);
        scoreB += Math.max(30 - durationDiffB / 10, 0);

        // Resolution match
        if (a.resolution === targetVideo.resolution) scoreA += 20;
        if (b.resolution === targetVideo.resolution) scoreB += 20;

        return scoreB - scoreA;
      })
      .slice(0, limit);
  }
}
