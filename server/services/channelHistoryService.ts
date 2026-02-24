/**
 * Channel History Service
 * Tracks user's recently played channels for quick access
 */

export interface ChannelPlayRecord {
  channelId: string;
  channelName: string;
  playedAt: number;
  duration: number; // milliseconds
  genre: string;
}

class ChannelHistoryService {
  private userHistory: Map<string, ChannelPlayRecord[]> = new Map();
  private readonly maxHistoryPerUser = 10;

  /**
   * Record a channel play for a user
   */
  public recordPlay(userId: string, record: Omit<ChannelPlayRecord, 'playedAt'>) {
    if (!this.userHistory.has(userId)) {
      this.userHistory.set(userId, []);
    }

    const history = this.userHistory.get(userId)!;
    const playRecord: ChannelPlayRecord = {
      ...record,
      playedAt: Date.now(),
    };

    // Add to beginning of history
    history.unshift(playRecord);

    // Keep only recent history
    if (history.length > this.maxHistoryPerUser) {
      history.pop();
    }
  }

  /**
   * Get recently played channels for a user
   */
  public getRecentlyPlayed(userId: string, limit = 10): ChannelPlayRecord[] {
    const history = this.userHistory.get(userId) || [];
    return history.slice(0, limit);
  }

  /**
   * Get most frequently played channels for a user
   */
  public getMostPlayed(userId: string, limit = 5) {
    const history = this.userHistory.get(userId) || [];
    
    // Group by channel and count plays
    const channelCounts: Map<string, { record: ChannelPlayRecord; count: number }> = new Map();
    
    for (const record of history) {
      if (!channelCounts.has(record.channelId)) {
        channelCounts.set(record.channelId, { record, count: 0 });
      }
      const entry = channelCounts.get(record.channelId)!;
      entry.count++;
    }

    // Sort by count and return
    return Array.from(channelCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(entry => entry.record);
  }

  /**
   * Get favorite genres for a user based on play history
   */
  public getFavoriteGenres(userId: string, limit = 5) {
    const history = this.userHistory.get(userId) || [];
    
    // Count genre plays
    const genreCounts: Map<string, number> = new Map();
    
    for (const record of history) {
      const count = genreCounts.get(record.genre) || 0;
      genreCounts.set(record.genre, count + 1);
    }

    // Sort by count and return
    return Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([genre, count]) => ({ genre, count }));
  }

  /**
   * Get total listening time for a user
   */
  public getTotalListeningTime(userId: string): number {
    const history = this.userHistory.get(userId) || [];
    return history.reduce((total, record) => total + record.duration, 0);
  }

  /**
   * Clear history for a user
   */
  public clearHistory(userId: string) {
    this.userHistory.delete(userId);
  }

  /**
   * Get all history for a user
   */
  public getAllHistory(userId: string): ChannelPlayRecord[] {
    return this.userHistory.get(userId) || [];
  }

  /**
   * Export history for a user (for analytics)
   */
  public exportHistory(userId: string) {
    const history = this.userHistory.get(userId) || [];
    const genres = this.getFavoriteGenres(userId);
    const totalTime = this.getTotalListeningTime(userId);
    const mostPlayed = this.getMostPlayed(userId);

    return {
      userId,
      totalRecords: history.length,
      totalListeningTime: totalTime,
      favoriteGenres: genres,
      mostPlayedChannels: mostPlayed,
      history,
    };
  }
}

// Singleton instance
export const channelHistoryService = new ChannelHistoryService();
