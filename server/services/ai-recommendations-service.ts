/**
 * AI-Powered Recommendations Service
 * Machine learning-based video recommendations
 * A Canryn Production
 */

interface UserProfile {
  userId: string;
  watchHistory: string[];
  preferences: Map<string, number>;
  engagementScores: Map<string, number>;
}

interface RecommendationScore {
  videoId: string;
  score: number;
  reason: string;
}

const userProfiles = new Map<string, UserProfile>();

export const aiRecommendationsService = {
  // Initialize user profile
  initializeProfile(userId: string): UserProfile {
    if (!userProfiles.has(userId)) {
      userProfiles.set(userId, {
        userId,
        watchHistory: [],
        preferences: new Map(),
        engagementScores: new Map(),
      });
    }
    return userProfiles.get(userId)!;
  },

  // Track video watch
  trackWatch(userId: string, videoId: string, tags: string[], duration: number, watchedDuration: number): void {
    const profile = this.initializeProfile(userId);
    profile.watchHistory.push(videoId);

    // Update preferences based on tags
    tags.forEach(tag => {
      const current = profile.preferences.get(tag) || 0;
      profile.preferences.set(tag, current + 1);
    });

    // Calculate engagement score
    const engagementRatio = watchedDuration / duration;
    profile.engagementScores.set(videoId, engagementRatio);
  },

  // Track engagement (likes, comments, etc)
  trackEngagement(userId: string, videoId: string, engagementType: 'like' | 'comment' | 'share', tags: string[]): void {
    const profile = this.initializeProfile(userId);
    const weights = { like: 0.5, comment: 1.0, share: 1.5 };
    const weight = weights[engagementType];

    tags.forEach(tag => {
      const current = profile.preferences.get(tag) || 0;
      profile.preferences.set(tag, current + weight);
    });
  },

  // Get personalized recommendations
  getRecommendations(userId: string, allVideos: any[], limit: number = 10): RecommendationScore[] {
    const profile = this.initializeProfile(userId);

    if (profile.watchHistory.length === 0) {
      // Return trending videos for new users
      return allVideos
        .slice(0, limit)
        .map((v, i) => ({
          videoId: v.id,
          score: 100 - i * 5,
          reason: 'Trending',
        }));
    }

    const recommendations: RecommendationScore[] = [];

    allVideos.forEach(video => {
      // Skip already watched videos
      if (profile.watchHistory.includes(video.id)) return;

      let score = 0;
      let reason = '';

      // Tag-based scoring
      const tagMatches = (video.tags || []).filter((tag: string) =>
        profile.preferences.has(tag)
      );

      if (tagMatches.length > 0) {
        const tagScore = tagMatches.reduce((sum: number, tag: string) =>
          sum + (profile.preferences.get(tag) || 0), 0
        );
        score += tagScore * 10;
        reason = `Matches your interests in ${tagMatches.slice(0, 2).join(', ')}`;
      }

      // Popularity scoring
      if (video.views) {
        score += Math.log(video.views + 1) * 2;
      }

      // Engagement scoring
      if (video.likes && video.comments) {
        const engagementRate = (video.likes + video.comments) / (video.views || 1);
        score += engagementRate * 50;
      }

      // Recency bonus
      if (video.publishedAt) {
        const daysSincePublish = (Date.now() - video.publishedAt) / (1000 * 60 * 60 * 24);
        if (daysSincePublish < 7) score += 20;
        if (daysSincePublish < 30) score += 10;
      }

      if (score > 0) {
        recommendations.push({ videoId: video.id, score, reason });
      }
    });

    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Get trending recommendations
  getTrendingRecommendations(allVideos: any[], limit: number = 10): RecommendationScore[] {
    return allVideos
      .map(video => ({
        videoId: video.id,
        score: (video.views || 0) + (video.likes || 0) * 2 + (video.comments || 0) * 3,
        reason: 'Trending now',
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Get similar videos
  getSimilarVideos(videoId: string, allVideos: any[], limit: number = 5): RecommendationScore[] {
    const targetVideo = allVideos.find(v => v.id === videoId);
    if (!targetVideo) return [];

    const targetTags = new Set(targetVideo.tags || []);

    return allVideos
      .filter(v => v.id !== videoId)
      .map(video => {
        const commonTags = (video.tags || []).filter((tag: string) => targetTags.has(tag));
        const similarity = commonTags.length / Math.max(targetTags.size, 1);
        return {
          videoId: video.id,
          score: similarity * 100,
          reason: `Similar to ${targetVideo.title}`,
        };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  },

  // Collaborative filtering - find users with similar taste
  findSimilarUsers(userId: string, allUsers: UserProfile[], limit: number = 5) {
    const userProfile = userProfiles.get(userId);
    if (!userProfile) return [];

    const userPreferences = Array.from(userProfile.preferences.entries());

    return allUsers
      .filter(u => u.userId !== userId)
      .map(otherUser => {
        let similarity = 0;
        userPreferences.forEach(([tag, score]) => {
          const otherScore = otherUser.preferences.get(tag) || 0;
          similarity += Math.min(score, otherScore);
        });

        return { userId: otherUser.userId, similarity };
      })
      .filter(r => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  },

  // Get user profile
  getUserProfile(userId: string) {
    return userProfiles.get(userId) || null;
  },

  // Clear user history
  clearUserHistory(userId: string): void {
    const profile = userProfiles.get(userId);
    if (profile) {
      profile.watchHistory = [];
      profile.preferences.clear();
      profile.engagementScores.clear();
    }
  },
};
