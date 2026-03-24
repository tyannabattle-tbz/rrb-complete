import { notificationsService } from './notifications-service';

export interface AudienceMessage {
  id: string;
  userId: string;
  userName: string;
  performanceId: string;
  message: string;
  timestamp: number;
  likes: number;
  isModerated: boolean;
}

export interface SongVote {
  id: string;
  performanceId: string;
  songId: string;
  songName: string;
  votes: number;
  voters: Set<string>;
}

export interface EngagementReward {
  id: string;
  userId: string;
  performanceId: string;
  rewardType: 'points' | 'badge' | 'achievement';
  rewardValue: string | number;
  earnedAt: number;
}

export interface ListenerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number; // e.g., 100 performances watched
  requirementType: 'performances' | 'hours' | 'engagement' | 'donations';
}

class AudienceInteractionService {
  private messages: Map<string, AudienceMessage[]> = new Map();
  private votes: Map<string, SongVote[]> = new Map();
  private rewards: Map<string, EngagementReward[]> = new Map();
  private badges: Map<string, ListenerBadge[]> = new Map();
  private messageCallbacks: Set<(message: AudienceMessage) => void> = new Set();

  // Predefined badges
  private readonly BADGES: ListenerBadge[] = [
    {
      id: 'fan_100',
      name: '🎵 Fan',
      description: 'Watched 100 performances',
      icon: '🎵',
      requirement: 100,
      requirementType: 'performances',
    },
    {
      id: 'superfan_1000',
      name: '⭐ Superfan',
      description: 'Watched 1000 performances',
      icon: '⭐',
      requirement: 1000,
      requirementType: 'performances',
    },
    {
      id: 'supporter_100h',
      name: '💜 Supporter',
      description: 'Listened for 100 hours',
      icon: '💜',
      requirement: 100,
      requirementType: 'hours',
    },
    {
      id: 'contributor_1k',
      name: '🏆 Contributor',
      description: 'Earned 1000 engagement points',
      icon: '🏆',
      requirement: 1000,
      requirementType: 'engagement',
    },
    {
      id: 'donor_100',
      name: '❤️ Donor',
      description: 'Donated $100+',
      icon: '❤️',
      requirement: 100,
      requirementType: 'donations',
    },
  ];

  constructor() {
    this.initializeBadges();
  }

  /**
   * Send live chat message
   */
  async sendMessage(
    userId: string,
    userName: string,
    performanceId: string,
    message: string
  ): Promise<AudienceMessage> {
    // Basic moderation (check for spam, profanity, etc.)
    const isModerated = this.shouldModerate(message);

    const chatMessage: AudienceMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      performanceId,
      message: isModerated ? '[Message moderated]' : message,
      timestamp: Date.now(),
      likes: 0,
      isModerated,
    };

    if (!this.messages.has(performanceId)) {
      this.messages.set(performanceId, []);
    }
    this.messages.get(performanceId)!.push(chatMessage);

    // Emit to subscribers
    this.messageCallbacks.forEach(callback => {
      try {
        callback(chatMessage);
      } catch (err) {
        console.error('[Audience] Message callback error:', err);
      }
    });

    // Award engagement points
    await this.awardEngagementPoints(userId, performanceId, 5, 'message');

    return chatMessage;
  }

  /**
   * Subscribe to live chat messages
   */
  subscribeToMessages(callback: (message: AudienceMessage) => void): () => void {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  /**
   * Get performance chat messages
   */
  getMessages(performanceId: string, limit: number = 100): AudienceMessage[] {
    const messages = this.messages.get(performanceId) || [];
    return messages.slice(-limit);
  }

  /**
   * Like a message
   */
  likeMessage(performanceId: string, messageId: string): void {
    const messages = this.messages.get(performanceId);
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        message.likes++;
      }
    }
  }

  /**
   * Create song vote
   */
  async createVote(performanceId: string, songId: string, songName: string): Promise<SongVote> {
    if (!this.votes.has(performanceId)) {
      this.votes.set(performanceId, []);
    }

    let vote = this.votes.get(performanceId)!.find(v => v.songId === songId);
    if (!vote) {
      vote = {
        id: `vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        performanceId,
        songId,
        songName,
        votes: 0,
        voters: new Set(),
      };
      this.votes.get(performanceId)!.push(vote);
    }

    return vote;
  }

  /**
   * Vote for a song
   */
  async voteForSong(performanceId: string, songId: string, userId: string): Promise<void> {
    if (!this.votes.has(performanceId)) {
      this.votes.set(performanceId, []);
    }

    let vote = this.votes.get(performanceId)!.find(v => v.songId === songId);
    if (!vote) {
      throw new Error('Vote not found');
    }

    if (!vote.voters.has(userId)) {
      vote.votes++;
      vote.voters.add(userId);

      // Award engagement points
      await this.awardEngagementPoints(userId, performanceId, 10, 'vote');
    }
  }

  /**
   * Get performance votes
   */
  getVotes(performanceId: string): SongVote[] {
    return (this.votes.get(performanceId) || []).sort((a, b) => b.votes - a.votes);
  }

  /**
   * Award engagement points
   */
  async awardEngagementPoints(
    userId: string,
    performanceId: string,
    points: number,
    action: string
  ): Promise<void> {
    const reward: EngagementReward = {
      id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      performanceId,
      rewardType: 'points',
      rewardValue: points,
      earnedAt: Date.now(),
    };

    if (!this.rewards.has(userId)) {
      this.rewards.set(userId, []);
    }
    this.rewards.get(userId)!.push(reward);

    // Notify user
    await notificationsService.notifyEngagementReward(userId, 'points', points);

    // Check for badge achievements
    await this.checkBadgeAchievements(userId);
  }

  /**
   * Get user engagement points
   */
  getUserPoints(userId: string): number {
    const userRewards = this.rewards.get(userId) || [];
    return userRewards
      .filter(r => r.rewardType === 'points')
      .reduce((sum, r) => sum + (typeof r.rewardValue === 'number' ? r.rewardValue : 0), 0);
  }

  /**
   * Get user badges
   */
  getUserBadges(userId: string): ListenerBadge[] {
    return this.badges.get(userId) || [];
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badgeId: string): Promise<ListenerBadge | null> {
    const badge = this.BADGES.find(b => b.id === badgeId);
    if (!badge) {
      return null;
    }

    if (!this.badges.has(userId)) {
      this.badges.set(userId, []);
    }

    const userBadges = this.badges.get(userId)!;
    if (!userBadges.find(b => b.id === badgeId)) {
      userBadges.push(badge);

      // Notify user
      await notificationsService.sendNotification({
        type: 'engagement_reward',
        userId,
        title: `🏅 Badge Earned: ${badge.name}`,
        message: badge.description,
        data: { badgeId, badgeName: badge.name },
        timestamp: Date.now(),
      });
    }

    return badge;
  }

  /**
   * Check for badge achievements
   */
  private async checkBadgeAchievements(userId: string): Promise<void> {
    const points = this.getUserPoints(userId);
    const currentBadges = this.getUserBadges(userId);

    // Check engagement badge
    if (points >= 1000 && !currentBadges.find(b => b.id === 'contributor_1k')) {
      await this.awardBadge(userId, 'contributor_1k');
    }
  }

  /**
   * Initialize badges
   */
  private initializeBadges(): void {
    // Badges are predefined in BADGES constant
  }

  /**
   * Moderation check
   */
  private shouldModerate(message: string): boolean {
    // Simple moderation rules
    const spamPatterns = [
      /(.)\1{9,}/g, // Repeated characters
      /https?:\/\//g, // URLs
      /[A-Z]{5,}/g, // ALL CAPS
    ];

    return spamPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Get leaderboard
   */
  getLeaderboard(limit: number = 10): Array<{ userId: string; points: number }> {
    const leaderboard = Array.from(this.rewards.entries())
      .map(([userId, rewards]) => ({
        userId,
        points: rewards
          .filter(r => r.rewardType === 'points')
          .reduce((sum, r) => sum + (typeof r.rewardValue === 'number' ? r.rewardValue : 0), 0),
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return leaderboard;
  }
}

export const audienceInteractionService = new AudienceInteractionService();
