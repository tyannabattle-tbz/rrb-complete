/**
 * Real-Time Leaderboard Service
 * Manages top donors, most-listened channels, and trending episodes
 */

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  value: number;
  category: 'donor' | 'channel' | 'episode';
  timestamp: Date;
  trend?: 'up' | 'down' | 'stable';
  percentageChange?: number;
}

export interface DonorEntry extends LeaderboardEntry {
  category: 'donor';
  totalDonations: number;
  donationCount: number;
  averageDonation: number;
}

export interface ChannelEntry extends LeaderboardEntry {
  category: 'channel';
  currentListeners: number;
  totalListeners: number;
  averageListenTime: number;
}

export interface EpisodeEntry extends LeaderboardEntry {
  category: 'episode';
  plays: number;
  averagePlayTime: number;
  podcast: string;
}

class RealtimeLeaderboardService {
  private topDonors: Map<string, DonorEntry> = new Map();
  private topChannels: Map<string, ChannelEntry> = new Map();
  private trendingEpisodes: Map<string, EpisodeEntry> = new Map();
  private previousDonorRankings: Map<string, number> = new Map();
  private previousChannelRankings: Map<string, number> = new Map();
  private previousEpisodeRankings: Map<string, number> = new Map();

  /**
   * Update donor leaderboard
   */
  updateDonorLeaderboard(
    donorId: string,
    donorName: string,
    totalDonations: number,
    donationCount: number
  ): DonorEntry {
    const previousRank = this.previousDonorRankings.get(donorId);
    const averageDonation = donationCount > 0 ? totalDonations / donationCount : 0;

    const entry: DonorEntry = {
      rank: 0, // Will be set during ranking
      id: donorId,
      name: donorName,
      value: totalDonations,
      category: 'donor',
      timestamp: new Date(),
      totalDonations,
      donationCount,
      averageDonation,
    };

    this.topDonors.set(donorId, entry);
    this.calculateTrend(entry, previousRank);

    return entry;
  }

  /**
   * Update channel leaderboard
   */
  updateChannelLeaderboard(
    channelId: string,
    channelName: string,
    currentListeners: number,
    totalListeners: number,
    averageListenTime: number
  ): ChannelEntry {
    const previousRank = this.previousChannelRankings.get(channelId);

    const entry: ChannelEntry = {
      rank: 0, // Will be set during ranking
      id: channelId,
      name: channelName,
      value: currentListeners,
      category: 'channel',
      timestamp: new Date(),
      currentListeners,
      totalListeners,
      averageListenTime,
    };

    this.topChannels.set(channelId, entry);
    this.calculateTrend(entry, previousRank);

    return entry;
  }

  /**
   * Update episode leaderboard
   */
  updateEpisodeLeaderboard(
    episodeId: string,
    episodeTitle: string,
    podcastName: string,
    plays: number,
    averagePlayTime: number
  ): EpisodeEntry {
    const previousRank = this.previousEpisodeRankings.get(episodeId);

    const entry: EpisodeEntry = {
      rank: 0, // Will be set during ranking
      id: episodeId,
      name: episodeTitle,
      value: plays,
      category: 'episode',
      timestamp: new Date(),
      plays,
      averagePlayTime,
      podcast: podcastName,
    };

    this.trendingEpisodes.set(episodeId, entry);
    this.calculateTrend(entry, previousRank);

    return entry;
  }

  /**
   * Calculate trend (up, down, stable)
   */
  private calculateTrend(entry: LeaderboardEntry, previousRank?: number): void {
    if (!previousRank) {
      entry.trend = 'stable';
      entry.percentageChange = 0;
      return;
    }

    const currentRank = Array.from(this.getLeaderboard(entry.category)).findIndex((e) => e.id === entry.id) + 1;

    if (currentRank < previousRank) {
      entry.trend = 'up';
      entry.percentageChange = ((previousRank - currentRank) / previousRank) * 100;
    } else if (currentRank > previousRank) {
      entry.trend = 'down';
      entry.percentageChange = ((currentRank - previousRank) / previousRank) * 100;
    } else {
      entry.trend = 'stable';
      entry.percentageChange = 0;
    }
  }

  /**
   * Get top donors
   */
  getTopDonors(limit: number = 10): DonorEntry[] {
    return Array.from(this.topDonors.values())
      .sort((a, b) => b.totalDonations - a.totalDonations)
      .slice(0, limit)
      .map((entry, index) => {
        entry.rank = index + 1;
        return entry;
      });
  }

  /**
   * Get top channels
   */
  getTopChannels(limit: number = 10): ChannelEntry[] {
    return Array.from(this.topChannels.values())
      .sort((a, b) => b.currentListeners - a.currentListeners)
      .slice(0, limit)
      .map((entry, index) => {
        entry.rank = index + 1;
        return entry;
      });
  }

  /**
   * Get trending episodes
   */
  getTrendingEpisodes(limit: number = 10): EpisodeEntry[] {
    return Array.from(this.trendingEpisodes.values())
      .sort((a, b) => b.plays - a.plays)
      .slice(0, limit)
      .map((entry, index) => {
        entry.rank = index + 1;
        return entry;
      });
  }

  /**
   * Get leaderboard by category
   */
  getLeaderboard(category: 'donor' | 'channel' | 'episode', limit: number = 10): LeaderboardEntry[] {
    switch (category) {
      case 'donor':
        return this.getTopDonors(limit);
      case 'channel':
        return this.getTopChannels(limit);
      case 'episode':
        return this.getTrendingEpisodes(limit);
      default:
        return [];
    }
  }

  /**
   * Get donor rank
   */
  getDonorRank(donorId: string): number | null {
    const topDonors = this.getTopDonors(1000);
    const entry = topDonors.find((d) => d.id === donorId);
    return entry ? entry.rank : null;
  }

  /**
   * Get channel rank
   */
  getChannelRank(channelId: string): number | null {
    const topChannels = this.getTopChannels(1000);
    const entry = topChannels.find((c) => c.id === channelId);
    return entry ? entry.rank : null;
  }

  /**
   * Get episode rank
   */
  getEpisodeRank(episodeId: string): number | null {
    const trendingEpisodes = this.getTrendingEpisodes(1000);
    const entry = trendingEpisodes.find((e) => e.id === episodeId);
    return entry ? entry.rank : null;
  }

  /**
   * Get complete leaderboard
   */
  getCompleteLeaderboard(limit: number = 10): {
    topDonors: DonorEntry[];
    topChannels: ChannelEntry[];
    trendingEpisodes: EpisodeEntry[];
  } {
    return {
      topDonors: this.getTopDonors(limit),
      topChannels: this.getTopChannels(limit),
      trendingEpisodes: this.getTrendingEpisodes(limit),
    };
  }

  /**
   * Get leaderboard statistics
   */
  getLeaderboardStatistics(): {
    totalDonors: number;
    totalChannels: number;
    totalEpisodes: number;
    topDonor: DonorEntry | null;
    topChannel: ChannelEntry | null;
    topEpisode: EpisodeEntry | null;
  } {
    const topDonors = this.getTopDonors(1);
    const topChannels = this.getTopChannels(1);
    const trendingEpisodes = this.getTrendingEpisodes(1);

    return {
      totalDonors: this.topDonors.size,
      totalChannels: this.topChannels.size,
      totalEpisodes: this.trendingEpisodes.size,
      topDonor: topDonors.length > 0 ? topDonors[0] : null,
      topChannel: topChannels.length > 0 ? topChannels[0] : null,
      topEpisode: trendingEpisodes.length > 0 ? trendingEpisodes[0] : null,
    };
  }

  /**
   * Get donor comparison
   */
  compareDonors(donorId1: string, donorId2: string): {
    donor1: DonorEntry | null;
    donor2: DonorEntry | null;
    difference: number;
    leader: string;
  } {
    const donor1 = this.topDonors.get(donorId1) || null;
    const donor2 = this.topDonors.get(donorId2) || null;

    const diff = (donor1?.totalDonations || 0) - (donor2?.totalDonations || 0);
    const leader = diff > 0 ? donorId1 : diff < 0 ? donorId2 : 'tie';

    return {
      donor1,
      donor2,
      difference: Math.abs(diff),
      leader,
    };
  }

  /**
   * Get channel comparison
   */
  compareChannels(channelId1: string, channelId2: string): {
    channel1: ChannelEntry | null;
    channel2: ChannelEntry | null;
    difference: number;
    leader: string;
  } {
    const channel1 = this.topChannels.get(channelId1) || null;
    const channel2 = this.topChannels.get(channelId2) || null;

    const diff = (channel1?.currentListeners || 0) - (channel2?.currentListeners || 0);
    const leader = diff > 0 ? channelId1 : diff < 0 ? channelId2 : 'tie';

    return {
      channel1,
      channel2,
      difference: Math.abs(diff),
      leader,
    };
  }

  /**
   * Update rankings (call periodically to recalculate trends)
   */
  updateRankings(): void {
    // Store previous rankings
    this.getTopDonors(1000).forEach((d) => {
      this.previousDonorRankings.set(d.id, d.rank);
    });

    this.getTopChannels(1000).forEach((c) => {
      this.previousChannelRankings.set(c.id, c.rank);
    });

    this.getTrendingEpisodes(1000).forEach((e) => {
      this.previousEpisodeRankings.set(e.id, e.rank);
    });
  }
}

export const realtimeLeaderboardService = new RealtimeLeaderboardService();
