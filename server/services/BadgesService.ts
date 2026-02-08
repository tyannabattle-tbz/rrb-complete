import { db } from '../db';
import { badges, userBadges } from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export type BadgeType = 
  | 'early_listener'
  | 'super_fan'
  | 'top_commenter'
  | 'playlist_creator'
  | 'social_butterfly'
  | 'content_creator'
  | 'milestone_100'
  | 'milestone_1000'
  | 'trending_artist'
  | 'community_helper';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: BadgeType;
  requirement: number;
  category: 'engagement' | 'achievement' | 'milestone' | 'special';
}

export class BadgesService {
  private badgeDefinitions: Map<BadgeType, BadgeDefinition> = new Map([
    [
      'early_listener',
      {
        id: 'badge_early_listener',
        name: 'Early Listener',
        description: 'Listened to content within first week of release',
        icon: '🎵',
        type: 'early_listener',
        requirement: 5,
        category: 'engagement',
      },
    ],
    [
      'super_fan',
      {
        id: 'badge_super_fan',
        name: 'Super Fan',
        description: 'Liked 100+ songs',
        icon: '❤️',
        type: 'super_fan',
        requirement: 100,
        category: 'engagement',
      },
    ],
    [
      'top_commenter',
      {
        id: 'badge_top_commenter',
        name: 'Top Commenter',
        description: 'Posted 50+ comments',
        icon: '💬',
        type: 'top_commenter',
        requirement: 50,
        category: 'engagement',
      },
    ],
    [
      'playlist_creator',
      {
        id: 'badge_playlist_creator',
        name: 'Playlist Creator',
        description: 'Created and shared 10+ playlists',
        icon: '🎼',
        type: 'playlist_creator',
        requirement: 10,
        category: 'achievement',
      },
    ],
    [
      'social_butterfly',
      {
        id: 'badge_social_butterfly',
        name: 'Social Butterfly',
        description: 'Following 100+ users',
        icon: '🦋',
        type: 'social_butterfly',
        requirement: 100,
        category: 'engagement',
      },
    ],
    [
      'content_creator',
      {
        id: 'badge_content_creator',
        name: 'Content Creator',
        description: 'Published content with 1000+ plays',
        icon: '🎬',
        type: 'content_creator',
        requirement: 1000,
        category: 'achievement',
      },
    ],
    [
      'milestone_100',
      {
        id: 'badge_milestone_100',
        name: '100 Plays',
        description: 'Reached 100 total plays',
        icon: '🔢',
        type: 'milestone_100',
        requirement: 100,
        category: 'milestone',
      },
    ],
    [
      'milestone_1000',
      {
        id: 'badge_milestone_1000',
        name: '1000 Plays',
        description: 'Reached 1000 total plays',
        icon: '🏆',
        type: 'milestone_1000',
        requirement: 1000,
        category: 'milestone',
      },
    ],
    [
      'trending_artist',
      {
        id: 'badge_trending_artist',
        name: 'Trending Artist',
        description: 'Content in top 10 trending',
        icon: '🔥',
        type: 'trending_artist',
        requirement: 1,
        category: 'special',
      },
    ],
    [
      'community_helper',
      {
        id: 'badge_community_helper',
        name: 'Community Helper',
        description: 'Received 50+ helpful votes',
        icon: '🤝',
        type: 'community_helper',
        requirement: 50,
        category: 'special',
      },
    ],
  ]);

  /**
   * Get badge definition
   */
  getBadgeDefinition(type: BadgeType): BadgeDefinition | undefined {
    return this.badgeDefinitions.get(type);
  }

  /**
   * Get all badge definitions
   */
  getAllBadges(): BadgeDefinition[] {
    return Array.from(this.badgeDefinitions.values());
  }

  /**
   * Award badge to user
   */
  async awardBadge(userId: string, badgeType: BadgeType) {
    const badgeDef = this.getBadgeDefinition(badgeType);
    if (!badgeDef) {
      throw new Error(`Badge type ${badgeType} not found`);
    }

    // Check if user already has badge
    const existing = await db.query.userBadges.findFirst({
      where: and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeType, badgeType)
      ),
    });

    if (existing) {
      return existing; // Already awarded
    }

    const badge = await db.insert(userBadges).values({
      id: `ubadge_${Date.now()}`,
      userId,
      badgeType,
      awardedAt: new Date(),
    }).returning();

    return badge[0];
  }

  /**
   * Get user badges
   */
  async getUserBadges(userId: string) {
    const userBadgeRecords = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
    });

    return userBadgeRecords.map((ub) => ({
      ...ub,
      definition: this.getBadgeDefinition(ub.badgeType as BadgeType),
    }));
  }

  /**
   * Check and award achievements based on user activity
   */
  async checkAndAwardAchievements(
    userId: string,
    activityType: string,
    value: number
  ) {
    const awardedBadges: BadgeType[] = [];

    switch (activityType) {
      case 'likes':
        if (value >= 100) {
          await this.awardBadge(userId, 'super_fan');
          awardedBadges.push('super_fan');
        }
        break;

      case 'comments':
        if (value >= 50) {
          await this.awardBadge(userId, 'top_commenter');
          awardedBadges.push('top_commenter');
        }
        break;

      case 'playlists':
        if (value >= 10) {
          await this.awardBadge(userId, 'playlist_creator');
          awardedBadges.push('playlist_creator');
        }
        break;

      case 'followers':
        if (value >= 100) {
          await this.awardBadge(userId, 'social_butterfly');
          awardedBadges.push('social_butterfly');
        }
        break;

      case 'plays':
        if (value >= 100) {
          await this.awardBadge(userId, 'milestone_100');
          awardedBadges.push('milestone_100');
        }
        if (value >= 1000) {
          await this.awardBadge(userId, 'milestone_1000');
          awardedBadges.push('milestone_1000');
        }
        if (value >= 1000) {
          await this.awardBadge(userId, 'content_creator');
          awardedBadges.push('content_creator');
        }
        break;
    }

    return awardedBadges;
  }

  /**
   * Get user badge count
   */
  async getUserBadgeCount(userId: string): Promise<number> {
    const userBadgeRecords = await db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
    });
    return userBadgeRecords.length;
  }

  /**
   * Get leaderboard by badge count
   */
  async getBadgeLeaderboard(limit = 10) {
    const allUsers = await db.query.userBadges.findMany({
      limit: limit * 10, // Get more to aggregate
    });

    const userBadgeCounts = new Map<string, number>();
    for (const badge of allUsers) {
      userBadgeCounts.set(
        badge.userId,
        (userBadgeCounts.get(badge.userId) || 0) + 1
      );
    }

    return Array.from(userBadgeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([userId, count]) => ({ userId, badgeCount: count }));
  }

  /**
   * Get badges by category
   */
  getBadgesByCategory(category: 'engagement' | 'achievement' | 'milestone' | 'special') {
    return Array.from(this.badgeDefinitions.values()).filter(
      (badge) => badge.category === category
    );
  }

  /**
   * Get user progress towards badges
   */
  async getUserBadgeProgress(userId: string, activityMetrics: Record<string, number>) {
    const userBadges = await this.getUserBadges(userId);
    const awardedBadgeTypes = new Set(userBadges.map((b) => b.badgeType));

    const progress = Array.from(this.badgeDefinitions.values())
      .filter((badge) => !awardedBadgeTypes.has(badge.type))
      .map((badge) => {
        let currentValue = 0;

        switch (badge.type) {
          case 'super_fan':
            currentValue = activityMetrics.likes || 0;
            break;
          case 'top_commenter':
            currentValue = activityMetrics.comments || 0;
            break;
          case 'playlist_creator':
            currentValue = activityMetrics.playlists || 0;
            break;
          case 'social_butterfly':
            currentValue = activityMetrics.followers || 0;
            break;
          case 'milestone_100':
          case 'milestone_1000':
          case 'content_creator':
            currentValue = activityMetrics.plays || 0;
            break;
        }

        const percentage = Math.min(
          100,
          Math.round((currentValue / badge.requirement) * 100)
        );

        return {
          badge,
          currentValue,
          requirement: badge.requirement,
          percentage,
          isUnlocked: percentage >= 100,
        };
      });

    return progress.sort((a, b) => b.percentage - a.percentage);
  }
}

export const badgesService = new BadgesService();
