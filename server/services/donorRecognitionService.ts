import { db } from '../db';
import { flowpayAuditLog } from '../../drizzle/schema';

export type BadgeType =
  | 'first_donation'
  | 'hundred_contributor'
  | 'thousand_contributor'
  | 'top_10_leaderboard'
  | 'top_5_leaderboard'
  | 'top_1_leaderboard'
  | 'grant_champion'
  | 'social_ambassador'
  | 'community_hero';

interface DonorBadge {
  id: string;
  userId: string;
  badgeType: BadgeType;
  earnedAt: Date;
  title: string;
  description: string;
  icon: string;
  shareableUrl: string;
}

interface DonorMilestone {
  userId: string;
  totalContributed: number;
  donationCount: number;
  badges: DonorBadge[];
  recognitionLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  leaderboardRank?: number;
}

interface AchievementCard {
  id: string;
  badgeId: string;
  userId: string;
  badgeType: BadgeType;
  title: string;
  description: string;
  imageUrl: string;
  shareText: string;
  twitterUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
}

/**
 * Donor Recognition Service
 * Manages milestone badges, achievement cards, and donor recognition
 */
export class DonorRecognitionService {
  private donorMilestones: Map<string, DonorMilestone> = new Map();
  private badges: Map<string, DonorBadge> = new Map();
  private achievementCards: Map<string, AchievementCard> = new Map();

  /**
   * Initialize donor recognition service
   */
  async initialize(): Promise<void> {
    console.log('[DonorRecognition] Initializing donor recognition service...');
    console.log('[DonorRecognition] Initialization complete. Donor recognition ready.');
  }

  /**
   * Award badge to donor
   */
  async awardBadge(
    userId: string,
    badgeType: BadgeType,
    metadata?: Record<string, any>
  ): Promise<DonorBadge> {
    const badgeId = `badge_${userId}_${badgeType}_${Date.now()}`;

    const badge: DonorBadge = {
      id: badgeId,
      userId,
      badgeType,
      earnedAt: new Date(),
      title: this.getBadgeTitle(badgeType),
      description: this.getBadgeDescription(badgeType),
      icon: this.getBadgeIcon(badgeType),
      shareableUrl: `https://flowpay.app/badges/${badgeId}`,
    };

    this.badges.set(badgeId, badge);

    // Update donor milestone
    await this.updateDonorMilestone(userId);

    // Log badge award
    await db.insert(flowpayAuditLog).values({
      event_type: 'badge_awarded',
      event_id: badgeId,
      details: JSON.stringify({
        userId,
        badgeType,
        title: badge.title,
        metadata,
      }),
      timestamp: new Date(),
    });

    console.log(`[DonorRecognition] Badge awarded: ${badgeType} to user ${userId}`);

    return badge;
  }

  /**
   * Check and award milestone badges
   */
  async checkAndAwardMilestones(userId: string, totalContributed: number): Promise<DonorBadge[]> {
    const awardedBadges: DonorBadge[] = [];

    // First donation
    if (totalContributed > 0) {
      const hasFirstDonation = this.badges
        .values()
        .some((b) => b.userId === userId && b.badgeType === 'first_donation');

      if (!hasFirstDonation) {
        const badge = await this.awardBadge(userId, 'first_donation', {
          amount: totalContributed,
        });
        awardedBadges.push(badge);
      }
    }

    // $100 contributor
    if (totalContributed >= 100) {
      const hasHundred = this.badges
        .values()
        .some((b) => b.userId === userId && b.badgeType === 'hundred_contributor');

      if (!hasHundred) {
        const badge = await this.awardBadge(userId, 'hundred_contributor', {
          amount: totalContributed,
        });
        awardedBadges.push(badge);
      }
    }

    // $1000 contributor
    if (totalContributed >= 1000) {
      const hasThousand = this.badges
        .values()
        .some((b) => b.userId === userId && b.badgeType === 'thousand_contributor');

      if (!hasThousand) {
        const badge = await this.awardBadge(userId, 'thousand_contributor', {
          amount: totalContributed,
        });
        awardedBadges.push(badge);
      }
    }

    return awardedBadges;
  }

  /**
   * Update donor milestone
   */
  private async updateDonorMilestone(userId: string): Promise<void> {
    const userBadges = Array.from(this.badges.values()).filter((b) => b.userId === userId);

    const milestone: DonorMilestone = {
      userId,
      totalContributed: 0, // Would be calculated from database in production
      donationCount: 0, // Would be calculated from database in production
      badges: userBadges,
      recognitionLevel: this.calculateRecognitionLevel(userBadges),
    };

    this.donorMilestones.set(userId, milestone);
  }

  /**
   * Calculate recognition level based on badges
   */
  private calculateRecognitionLevel(
    badges: DonorBadge[]
  ): 'bronze' | 'silver' | 'gold' | 'platinum' {
    if (badges.some((b) => b.badgeType === 'top_1_leaderboard')) return 'platinum';
    if (badges.some((b) => b.badgeType === 'top_5_leaderboard')) return 'gold';
    if (badges.some((b) => b.badgeType === 'top_10_leaderboard')) return 'silver';
    return 'bronze';
  }

  /**
   * Create shareable achievement card
   */
  async createAchievementCard(badgeId: string): Promise<AchievementCard> {
    const badge = this.badges.get(badgeId);
    if (!badge) throw new Error(`Badge not found: ${badgeId}`);

    const cardId = `card_${badgeId}_${Date.now()}`;

    const achievementCard: AchievementCard = {
      id: cardId,
      badgeId,
      userId: badge.userId,
      badgeType: badge.badgeType,
      title: badge.title,
      description: badge.description,
      imageUrl: `https://flowpay.app/badges/${badge.badgeType}.png`,
      shareText: this.getShareText(badge.badgeType),
      twitterUrl: this.getTwitterShareUrl(badge, cardId),
      linkedinUrl: this.getLinkedInShareUrl(badge, cardId),
      facebookUrl: this.getFacebookShareUrl(badge, cardId),
    };

    this.achievementCards.set(cardId, achievementCard);

    console.log(`[DonorRecognition] Achievement card created: ${cardId}`);

    return achievementCard;
  }

  /**
   * Get badge title
   */
  private getBadgeTitle(badgeType: BadgeType): string {
    const titles: Record<BadgeType, string> = {
      first_donation: '🎉 First Donor',
      hundred_contributor: '💯 $100 Contributor',
      thousand_contributor: '🏆 $1K Contributor',
      top_10_leaderboard: '⭐ Top 10 Supporter',
      top_5_leaderboard: '🌟 Top 5 Supporter',
      top_1_leaderboard: '👑 #1 Supporter',
      grant_champion: '🎯 Grant Champion',
      social_ambassador: '📱 Social Ambassador',
      community_hero: '🦸 Community Hero',
    };
    return titles[badgeType];
  }

  /**
   * Get badge description
   */
  private getBadgeDescription(badgeType: BadgeType): string {
    const descriptions: Record<BadgeType, string> = {
      first_donation: 'Made your first donation to the community',
      hundred_contributor: 'Contributed $100 or more',
      thousand_contributor: 'Contributed $1,000 or more',
      top_10_leaderboard: 'Ranked in the top 10 supporters',
      top_5_leaderboard: 'Ranked in the top 5 supporters',
      top_1_leaderboard: 'The #1 supporter in the community',
      grant_champion: 'Helped secure multiple grants',
      social_ambassador: 'Shared campaigns across social media',
      community_hero: 'Exceptional contribution to the community',
    };
    return descriptions[badgeType];
  }

  /**
   * Get badge icon
   */
  private getBadgeIcon(badgeType: BadgeType): string {
    const icons: Record<BadgeType, string> = {
      first_donation: '🎉',
      hundred_contributor: '💯',
      thousand_contributor: '🏆',
      top_10_leaderboard: '⭐',
      top_5_leaderboard: '🌟',
      top_1_leaderboard: '👑',
      grant_champion: '🎯',
      social_ambassador: '📱',
      community_hero: '🦸',
    };
    return icons[badgeType];
  }

  /**
   * Get share text for badge
   */
  private getShareText(badgeType: BadgeType): string {
    const texts: Record<BadgeType, string> = {
      first_donation: "I just made my first donation! 🎉 Join me in supporting the community.",
      hundred_contributor: "I've contributed $100+ to amazing causes! 💯 Be part of the movement.",
      thousand_contributor: "I'm a $1K+ contributor! 🏆 Help us reach our goals.",
      top_10_leaderboard: "I'm in the top 10 supporters! ⭐ Your support matters.",
      top_5_leaderboard: "I'm a top 5 supporter! 🌟 Together we're making a difference.",
      top_1_leaderboard: "I'm the #1 supporter! 👑 Thank you for this honor.",
      grant_champion: "I've helped secure multiple grants! 🎯 Funding our future.",
      social_ambassador: "I'm spreading the word! 📱 Help amplify our message.",
      community_hero: "I'm a community hero! 🦸 Making real impact together.",
    };
    return texts[badgeType];
  }

  /**
   * Get Twitter share URL
   */
  private getTwitterShareUrl(badge: DonorBadge, cardId: string): string {
    const text = encodeURIComponent(this.getShareText(badge.badgeType));
    const url = `https://flowpay.app/badges/${cardId}`;
    return `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
  }

  /**
   * Get LinkedIn share URL
   */
  private getLinkedInShareUrl(badge: DonorBadge, cardId: string): string {
    const url = `https://flowpay.app/badges/${cardId}`;
    return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  }

  /**
   * Get Facebook share URL
   */
  private getFacebookShareUrl(badge: DonorBadge, cardId: string): string {
    const url = `https://flowpay.app/badges/${cardId}`;
    return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  }

  /**
   * Get donor milestone
   */
  getDonorMilestone(userId: string): DonorMilestone | undefined {
    return this.donorMilestones.get(userId);
  }

  /**
   * Get all badges for donor
   */
  getDonorBadges(userId: string): DonorBadge[] {
    return Array.from(this.badges.values()).filter((b) => b.userId === userId);
  }

  /**
   * Get achievement card
   */
  getAchievementCard(cardId: string): AchievementCard | undefined {
    return this.achievementCards.get(cardId);
  }

  /**
   * Get all achievement cards for donor
   */
  getDonorAchievementCards(userId: string): AchievementCard[] {
    return Array.from(this.achievementCards.values()).filter((c) => c.userId === userId);
  }

  /**
   * Get leaderboard with badges
   */
  getLeaderboardWithBadges(limit: number = 10): Array<DonorMilestone & { rank: number }> {
    return Array.from(this.donorMilestones.values())
      .sort((a, b) => b.totalContributed - a.totalContributed)
      .slice(0, limit)
      .map((milestone, index) => ({
        ...milestone,
        rank: index + 1,
      }));
  }

  /**
   * Shutdown donor recognition service
   */
  shutdown(): void {
    console.log('[DonorRecognition] Shutdown complete');
  }
}

// Export singleton instance
export const donorRecognitionService = new DonorRecognitionService();
