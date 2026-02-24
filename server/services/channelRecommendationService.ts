/**
 * Channel Recommendation Service
 * Suggests similar channels based on genre and listening history
 */

import { RRB_RADIO_CHANNELS } from '@/lib/rrbRadioStations';
import { channelHistoryService } from './channelHistoryService';

export interface ChannelRecommendation {
  channelId: string;
  channelName: string;
  genre: string;
  description: string;
  similarity: number; // 0-1
  reason: string;
}

class ChannelRecommendationService {
  /**
   * Get recommendations based on currently playing channel
   */
  public getRecommendationsForChannel(
    currentChannelId: string,
    limit = 5
  ): ChannelRecommendation[] {
    const currentChannel = RRB_RADIO_CHANNELS.find(ch => ch.id === currentChannelId);
    if (!currentChannel) return [];

    const recommendations: ChannelRecommendation[] = [];

    // Find similar channels
    for (const channel of RRB_RADIO_CHANNELS) {
      if (channel.id === currentChannelId) continue;

      const similarity = this.calculateGenreSimilarity(currentChannel.genre, channel.genre);
      if (similarity > 0.3) {
        recommendations.push({
          channelId: channel.id,
          channelName: channel.name,
          genre: channel.genre,
          description: channel.description,
          similarity,
          reason: `Similar to ${currentChannel.genre}`,
        });
      }
    }

    // Sort by similarity and return top results
    return recommendations
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Get personalized recommendations for a user
   */
  public getPersonalizedRecommendations(
    userId: string,
    limit = 5
  ): ChannelRecommendation[] {
    const favoriteGenres = channelHistoryService.getFavoriteGenres(userId, 3);
    if (favoriteGenres.length === 0) {
      // Return trending channels if no history
      return this.getTrendingRecommendations(limit);
    }

    const recommendations: Map<string, ChannelRecommendation> = new Map();

    // Get recommendations for each favorite genre
    for (const { genre } of favoriteGenres) {
      const genreChannels = RRB_RADIO_CHANNELS.filter(ch => ch.genre === genre);
      
      for (const channel of genreChannels) {
        if (recommendations.has(channel.id)) continue;

        recommendations.set(channel.id, {
          channelId: channel.id,
          channelName: channel.name,
          genre: channel.genre,
          description: channel.description,
          similarity: 0.9,
          reason: `Your favorite genre: ${genre}`,
        });
      }
    }

    // Add cross-genre recommendations
    for (const { genre } of favoriteGenres) {
      for (const channel of RRB_RADIO_CHANNELS) {
        if (recommendations.has(channel.id)) continue;
        if (channel.genre === genre) continue;

        const similarity = this.calculateGenreSimilarity(genre, channel.genre);
        if (similarity > 0.4) {
          recommendations.set(channel.id, {
            channelId: channel.id,
            channelName: channel.name,
            genre: channel.genre,
            description: channel.description,
            similarity,
            reason: `Similar to ${genre}`,
          });
        }
      }
    }

    // Sort by similarity and return
    return Array.from(recommendations.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Get trending channel recommendations
   */
  public getTrendingRecommendations(limit = 5): ChannelRecommendation[] {
    // Sort by listener count and return top channels
    const sorted = [...RRB_RADIO_CHANNELS]
      .sort((a, b) => (b.listeners || 0) - (a.listeners || 0))
      .slice(0, limit);

    return sorted.map(channel => ({
      channelId: channel.id,
      channelName: channel.name,
      genre: channel.genre,
      description: channel.description,
      similarity: 0.8,
      reason: 'Currently trending',
    }));
  }

  /**
   * Calculate similarity between two genres (0-1)
   */
  private calculateGenreSimilarity(genre1: string, genre2: string): number {
    if (genre1 === genre2) return 1.0;

    // Define genre relationships
    const genreRelationships: Record<string, string[]> = {
      'Jazz': ['Blues', 'Soul', 'Funk'],
      'Blues': ['Jazz', 'Soul', 'Rock'],
      'Soul': ['Jazz', 'Blues', 'Funk', 'R&B'],
      'Funk': ['Soul', 'Jazz', 'Rock', 'Electronic'],
      'Rock': ['Blues', 'Rock & Roll', 'Alternative'],
      'Rock & Roll': ['Rock', 'Blues', 'Country'],
      'Hip-Hop': ['Electronic', 'Funk', 'Soul'],
      'Electronic': ['Funk', 'Hip-Hop', 'Ambient'],
      'Country': ['Rock & Roll', 'Folk', 'Americana'],
      'Folk': ['Country', 'Americana', 'Acoustic'],
      'Wellness': ['Meditation', 'Ambient', 'Healing'],
      'Meditation': ['Wellness', 'Ambient', 'Healing'],
      'Healing': ['Wellness', 'Meditation', 'Ambient'],
      'Ambient': ['Healing', 'Electronic', 'Meditation'],
    };

    const related = genreRelationships[genre1] || [];
    if (related.includes(genre2)) return 0.7;

    // Check reverse relationship
    const reverseRelated = genreRelationships[genre2] || [];
    if (reverseRelated.includes(genre1)) return 0.7;

    // Different categories but both music
    return 0.3;
  }

  /**
   * Get discovery recommendations (new genres for user)
   */
  public getDiscoveryRecommendations(userId: string, limit = 5): ChannelRecommendation[] {
    const favoriteGenres = channelHistoryService.getFavoriteGenres(userId, 3);
    const favoriteGenreNames = new Set(favoriteGenres.map(g => g.genre));

    const recommendations: ChannelRecommendation[] = [];

    // Find channels in genres the user hasn't explored
    for (const channel of RRB_RADIO_CHANNELS) {
      if (favoriteGenreNames.has(channel.genre)) continue;

      // Check if this genre is related to user's favorites
      let hasRelation = false;
      for (const favGenre of favoriteGenreNames) {
        const similarity = this.calculateGenreSimilarity(favGenre, channel.genre);
        if (similarity > 0.5) {
          hasRelation = true;
          break;
        }
      }

      if (hasRelation) {
        recommendations.push({
          channelId: channel.id,
          channelName: channel.name,
          genre: channel.genre,
          description: channel.description,
          similarity: 0.6,
          reason: `Explore new genre: ${channel.genre}`,
        });
      }
    }

    return recommendations.slice(0, limit);
  }
}

// Singleton instance
export const channelRecommendationService = new ChannelRecommendationService();
