import { getDb } from '../db';

/**
 * Content Recommendation Engine
 * Uses collaborative filtering and content-based filtering to recommend content
 */

export interface UserProfile {
  userId: string;
  listeningHistory: string[];
  favorites: string[];
  genres: Map<string, number>;
  artists: Map<string, number>;
  listenTime: number;
}

export interface ContentItem {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number;
  popularity: number;
  releaseDate: number;
}

export interface Recommendation {
  contentId: string;
  title: string;
  artist: string;
  score: number;
  reason: string;
  similarTo?: string;
}

export class ContentRecommendationService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private contentCatalog: Map<string, ContentItem> = new Map();
  private similarityCache: Map<string, number[]> = new Map();

  /**
   * Initialize user profile
   */
  async initializeUserProfile(userId: string): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      listeningHistory: [],
      favorites: [],
      genres: new Map(),
      artists: new Map(),
      listenTime: 0,
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Add content to catalog
   */
  async addContent(content: ContentItem): Promise<void> {
    this.contentCatalog.set(content.id, content);
  }

  /**
   * Record user listening activity
   */
  async recordListening(userId: string, contentId: string, duration: number): Promise<void> {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = await this.initializeUserProfile(userId);
    }

    const content = this.contentCatalog.get(contentId);
    if (!content) {
      return;
    }

    // Update listening history
    profile.listeningHistory.push(contentId);

    // Update genre preferences
    const genreCount = profile.genres.get(content.genre) || 0;
    profile.genres.set(content.genre, genreCount + 1);

    // Update artist preferences
    const artistCount = profile.artists.get(content.artist) || 0;
    profile.artists.set(content.artist, artistCount + 1);

    // Update total listen time
    profile.listenTime += duration;
  }

  /**
   * Add content to favorites
   */
  async addToFavorites(userId: string, contentId: string): Promise<boolean> {
    let profile = this.userProfiles.get(userId);
    if (!profile) {
      profile = await this.initializeUserProfile(userId);
    }

    if (!profile.favorites.includes(contentId)) {
      profile.favorites.push(contentId);
      return true;
    }

    return false;
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(userId: string, contentId: string): Promise<boolean> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return false;
    }

    const index = profile.favorites.indexOf(contentId);
    if (index > -1) {
      profile.favorites.splice(index, 1);
      return true;
    }

    return false;
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId: string, limit: number = 10): Promise<Recommendation[]> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return [];
    }

    const recommendations: Recommendation[] = [];
    const scoredContent = new Map<string, { score: number; reason: string; similarTo?: string }>();

    // Collaborative filtering: Find users with similar taste
    const similarUsers = this.findSimilarUsers(userId, 5);

    // Content-based filtering: Recommend based on user's preferences
    for (const [contentId, content] of this.contentCatalog) {
      // Skip already listened content
      if (profile.listeningHistory.includes(contentId) || profile.favorites.includes(contentId)) {
        continue;
      }

      let score = 0;
      let reason = '';
      let similarTo = '';

      // Genre-based scoring
      const genrePreference = profile.genres.get(content.genre) || 0;
      score += genrePreference * 2;

      // Artist-based scoring
      const artistPreference = profile.artists.get(content.artist) || 0;
      score += artistPreference * 3;

      // Popularity-based scoring
      score += content.popularity * 0.5;

      // Freshness bonus
      const daysSinceRelease = (Date.now() - content.releaseDate) / (1000 * 60 * 60 * 24);
      if (daysSinceRelease < 30) {
        score += 5; // Recent content bonus
        reason = 'New release in your favorite genre';
      }

      // Collaborative filtering bonus
      if (similarUsers.length > 0) {
        const similarUserListenings = similarUsers.filter((u) =>
          this.userProfiles.get(u)?.listeningHistory.includes(contentId)
        ).length;

        if (similarUserListenings > 0) {
          score += similarUserListenings * 2;
          reason = `Popular among users with similar taste`;
        }
      }

      // Find similar content in favorites
      for (const favoriteId of profile.favorites) {
        const similarity = this.calculateContentSimilarity(favoriteId, contentId);
        if (similarity > 0.7) {
          score += similarity * 5;
          similarTo = favoriteId;
          if (!reason) {
            reason = `Similar to your favorite`;
          }
        }
      }

      if (score > 0) {
        scoredContent.set(contentId, { score, reason, similarTo });
      }
    }

    // Sort by score and return top N
    const sorted = Array.from(scoredContent.entries())
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, limit);

    for (const [contentId, { score, reason, similarTo }] of sorted) {
      const content = this.contentCatalog.get(contentId)!;
      recommendations.push({
        contentId,
        title: content.title,
        artist: content.artist,
        score,
        reason,
        similarTo,
      });
    }

    return recommendations;
  }

  /**
   * Get trending content
   */
  async getTrendingContent(limit: number = 10): Promise<ContentItem[]> {
    const sorted = Array.from(this.contentCatalog.values())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return sorted;
  }

  /**
   * Get content by genre
   */
  async getContentByGenre(genre: string, limit: number = 10): Promise<ContentItem[]> {
    const filtered = Array.from(this.contentCatalog.values())
      .filter((c) => c.genre.toLowerCase() === genre.toLowerCase())
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit);

    return filtered;
  }

  /**
   * Get similar content
   */
  async getSimilarContent(contentId: string, limit: number = 5): Promise<ContentItem[]> {
    const content = this.contentCatalog.get(contentId);
    if (!content) {
      return [];
    }

    const similarities = new Map<string, number>();

    for (const [otherId, otherContent] of this.contentCatalog) {
      if (otherId === contentId) continue;

      const similarity = this.calculateContentSimilarity(contentId, otherId);
      if (similarity > 0) {
        similarities.set(otherId, similarity);
      }
    }

    const sorted = Array.from(similarities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => this.contentCatalog.get(id)!);

    return sorted;
  }

  /**
   * Calculate content similarity
   */
  private calculateContentSimilarity(contentId1: string, contentId2: string): number {
    const content1 = this.contentCatalog.get(contentId1);
    const content2 = this.contentCatalog.get(contentId2);

    if (!content1 || !content2) {
      return 0;
    }

    let similarity = 0;

    // Genre similarity
    if (content1.genre === content2.genre) {
      similarity += 0.4;
    }

    // Artist similarity
    if (content1.artist === content2.artist) {
      similarity += 0.3;
    }

    // Duration similarity (within 10%)
    const durationDiff = Math.abs(content1.duration - content2.duration);
    const avgDuration = (content1.duration + content2.duration) / 2;
    if (durationDiff / avgDuration < 0.1) {
      similarity += 0.2;
    }

    // Popularity similarity
    const popDiff = Math.abs(content1.popularity - content2.popularity);
    if (popDiff < 20) {
      similarity += 0.1;
    }

    return Math.min(similarity, 1);
  }

  /**
   * Find users with similar listening preferences
   */
  private findSimilarUsers(userId: string, limit: number = 5): string[] {
    const userProfile = this.userProfiles.get(userId);
    if (!userProfile) {
      return [];
    }

    const similarities = new Map<string, number>();

    for (const [otherId, otherProfile] of this.userProfiles) {
      if (otherId === userId) continue;

      let similarity = 0;

      // Genre overlap
      for (const [genre, count] of userProfile.genres) {
        if (otherProfile.genres.has(genre)) {
          similarity += Math.min(count, otherProfile.genres.get(genre)!) * 0.5;
        }
      }

      // Artist overlap
      for (const [artist, count] of userProfile.artists) {
        if (otherProfile.artists.has(artist)) {
          similarity += Math.min(count, otherProfile.artists.get(artist)!) * 0.3;
        }
      }

      // Listening history overlap
      const overlap = userProfile.listeningHistory.filter((c) =>
        otherProfile.listeningHistory.includes(c)
      ).length;
      similarity += overlap * 0.2;

      if (similarity > 0) {
        similarities.set(otherId, similarity);
      }
    }

    const sorted = Array.from(similarities.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    return sorted;
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  /**
   * Get recommendation statistics
   */
  async getRecommendationStats(userId: string): Promise<any> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return null;
    }

    return {
      userId,
      totalListenings: profile.listeningHistory.length,
      favoriteCount: profile.favorites.length,
      totalListenTime: profile.listenTime,
      topGenres: Array.from(profile.genres.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count })),
      topArtists: Array.from(profile.artists.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([artist, count]) => ({ artist, count })),
    };
  }
}

// Export singleton instance
export const contentRecommendationService = new ContentRecommendationService();
