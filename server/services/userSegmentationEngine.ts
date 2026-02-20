/**
 * User Segmentation Engine
 * Analyzes user behavior and creates actionable audience segments
 */

interface UserBehavior {
  userId: string;
  watchTime: number; // minutes
  engagementScore: number; // 0-100
  contentPreferences: string[];
  viewingFrequency: 'daily' | 'weekly' | 'monthly' | 'rare';
  avgSessionDuration: number; // minutes
  deviceType: 'mobile' | 'desktop' | 'tablet';
  lastActive: Date;
  subscriptionStatus: 'free' | 'premium' | 'vip';
  purchaseHistory: number; // total purchases
  referralCount: number;
}

interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: Record<string, any>;
  userCount: number;
  characteristics: string[];
  recommendedActions: string[];
  estimatedLTV: number; // Lifetime Value
}

interface BehavioralMetrics {
  totalUsers: number;
  avgWatchTime: number;
  avgEngagementScore: number;
  churnRate: number;
  retentionRate: number;
  conversionRate: number;
}

class UserSegmentationEngine {
  private userBehaviors: Map<string, UserBehavior> = new Map();
  private segments: Map<string, UserSegment> = new Map();
  private segmentMembership: Map<string, string[]> = new Map(); // userId -> segmentIds

  /**
   * Analyze user behavior and create segments
   */
  analyzeAndSegment(): UserSegment[] {
    const segments: UserSegment[] = [];

    // Create predefined segments
    segments.push(this.createHighValueSegment());
    segments.push(this.createEngagedViewersSegment());
    segments.push(this.createCasualViewersSegment());
    segments.push(this.createAtRiskSegment());
    segments.push(this.createNewUsersSegment());
    segments.push(this.createPremiumSubscribersSegment());
    segments.push(this.createMobileFirstSegment());
    segments.push(this.createSocialSharersSegment());

    // Store segments
    segments.forEach((segment) => {
      this.segments.set(segment.id, segment);
    });

    // Assign users to segments
    this.assignUsersToSegments(segments);

    return segments;
  }

  /**
   * Create High-Value Users segment
   */
  private createHighValueSegment(): UserSegment {
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) => u.watchTime > 500 && u.purchaseHistory > 5 && u.engagementScore > 80
    );

    return {
      id: 'seg_high_value',
      name: 'High-Value Users',
      description: 'Power users with high engagement and spending',
      criteria: {
        watchTime: { min: 500 },
        purchaseHistory: { min: 5 },
        engagementScore: { min: 80 },
      },
      userCount: users.length,
      characteristics: [
        'Premium subscribers',
        'High engagement rate',
        'Frequent purchasers',
        'Content advocates',
        'Long session durations',
      ],
      recommendedActions: [
        'VIP tier benefits',
        'Exclusive content access',
        'Early feature access',
        'Personal recommendations',
        'Premium support',
      ],
      estimatedLTV: 2500,
    };
  }

  /**
   * Create Engaged Viewers segment
   */
  private createEngagedViewersSegment(): UserSegment {
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) =>
        u.engagementScore >= 60 &&
        u.engagementScore < 80 &&
        u.viewingFrequency === 'daily'
    );

    return {
      id: 'seg_engaged',
      name: 'Engaged Viewers',
      description: 'Regular users with consistent engagement',
      criteria: {
        engagementScore: { min: 60, max: 80 },
        viewingFrequency: 'daily',
      },
      userCount: users.length,
      characteristics: [
        'Daily active users',
        'Moderate engagement',
        'Consistent viewership',
        'Content sharers',
        'Community participants',
      ],
      recommendedActions: [
        'Personalized recommendations',
        'Content series',
        'Community features',
        'Gamification rewards',
        'Exclusive events',
      ],
      estimatedLTV: 800,
    };
  }

  /**
   * Create Casual Viewers segment
   */
  private createCasualViewersSegment(): UserSegment {
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) =>
        u.engagementScore < 60 &&
        (u.viewingFrequency === 'weekly' || u.viewingFrequency === 'monthly')
    );

    return {
      id: 'seg_casual',
      name: 'Casual Viewers',
      description: 'Occasional users with lower engagement',
      criteria: {
        engagementScore: { max: 60 },
        viewingFrequency: ['weekly', 'monthly'],
      },
      userCount: users.length,
      characteristics: [
        'Occasional viewers',
        'Lower engagement',
        'Browsing behavior',
        'Mobile-first',
        'Entertainment-focused',
      ],
      recommendedActions: [
        'Discovery recommendations',
        'Trending content',
        'Easy onboarding',
        'Mobile optimization',
        'Viral content promotion',
      ],
      estimatedLTV: 150,
    };
  }

  /**
   * Create At-Risk segment (churn risk)
   */
  private createAtRiskSegment(): UserSegment {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) =>
        u.lastActive < thirtyDaysAgo ||
        (u.watchTime > 0 && u.engagementScore < 30)
    );

    return {
      id: 'seg_at_risk',
      name: 'At-Risk Users',
      description: 'Users showing signs of churn',
      criteria: {
        lastActive: { before: thirtyDaysAgo },
        engagementScore: { max: 30 },
      },
      userCount: users.length,
      characteristics: [
        'Inactive recently',
        'Low engagement',
        'Declining watch time',
        'Subscription cancellation risk',
        'Need re-engagement',
      ],
      recommendedActions: [
        'Win-back campaigns',
        'Special offers',
        'Personalized content',
        'Feedback surveys',
        'Exclusive discounts',
      ],
      estimatedLTV: 50,
    };
  }

  /**
   * Create New Users segment
   */
  private createNewUsersSegment(): UserSegment {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) => u.lastActive > thirtyDaysAgo && u.watchTime < 100
    );

    return {
      id: 'seg_new_users',
      name: 'New Users',
      description: 'Recently joined users in onboarding phase',
      criteria: {
        watchTime: { max: 100 },
        joinDate: { after: thirtyDaysAgo },
      },
      userCount: users.length,
      characteristics: [
        'Recently joined',
        'Low watch time',
        'High growth potential',
        'Exploring platform',
        'Onboarding phase',
      ],
      recommendedActions: [
        'Guided tours',
        'Onboarding content',
        'Welcome bonuses',
        'Feature education',
        'Community introduction',
      ],
      estimatedLTV: 300,
    };
  }

  /**
   * Create Premium Subscribers segment
   */
  private createPremiumSubscribersSegment(): UserSegment {
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) => u.subscriptionStatus === 'premium' || u.subscriptionStatus === 'vip'
    );

    return {
      id: 'seg_premium',
      name: 'Premium Subscribers',
      description: 'Paying subscribers with premium access',
      criteria: {
        subscriptionStatus: ['premium', 'vip'],
      },
      userCount: users.length,
      characteristics: [
        'Paying customers',
        'Premium features access',
        'Ad-free experience',
        'Priority support',
        'Exclusive content',
      ],
      recommendedActions: [
        'Upsell VIP tier',
        'Premium content highlights',
        'Exclusive events',
        'Priority customer support',
        'Early feature access',
      ],
      estimatedLTV: 1200,
    };
  }

  /**
   * Create Mobile-First segment
   */
  private createMobileFirstSegment(): UserSegment {
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) => u.deviceType === 'mobile'
    );

    return {
      id: 'seg_mobile_first',
      name: 'Mobile-First Users',
      description: 'Users primarily accessing via mobile devices',
      criteria: {
        deviceType: 'mobile',
      },
      userCount: users.length,
      characteristics: [
        'Mobile primary device',
        'On-the-go viewing',
        'Short sessions',
        'App users',
        'Location-based',
      ],
      recommendedActions: [
        'Mobile app optimization',
        'Offline viewing',
        'Push notifications',
        'Mobile-exclusive content',
        'Quick-play features',
      ],
      estimatedLTV: 200,
    };
  }

  /**
   * Create Social Sharers segment
   */
  private createSocialSharersSegment(): UserSegment {
    const users = Array.from(this.userBehaviors.values()).filter(
      (u) => u.referralCount > 5
    );

    return {
      id: 'seg_social_sharers',
      name: 'Social Sharers',
      description: 'Users who actively share and refer content',
      criteria: {
        referralCount: { min: 5 },
      },
      userCount: users.length,
      characteristics: [
        'Content advocates',
        'Active sharers',
        'Community builders',
        'Influencers',
        'Viral content drivers',
      ],
      recommendedActions: [
        'Referral rewards',
        'Affiliate program',
        'Creator tools',
        'Exclusive sharing features',
        'Ambassador program',
      ],
      estimatedLTV: 600,
    };
  }

  /**
   * Assign users to segments
   */
  private assignUsersToSegments(segments: UserSegment[]): void {
    this.userBehaviors.forEach((behavior, userId) => {
      const userSegments: string[] = [];

      segments.forEach((segment) => {
        if (this.matchesSegmentCriteria(behavior, segment.criteria)) {
          userSegments.push(segment.id);
        }
      });

      this.segmentMembership.set(userId, userSegments);
    });
  }

  /**
   * Check if user matches segment criteria
   */
  private matchesSegmentCriteria(
    behavior: UserBehavior,
    criteria: Record<string, any>
  ): boolean {
    for (const [key, value] of Object.entries(criteria)) {
      switch (key) {
        case 'watchTime':
          if (value.min && behavior.watchTime < value.min) return false;
          if (value.max && behavior.watchTime > value.max) return false;
          break;
        case 'engagementScore':
          if (value.min && behavior.engagementScore < value.min) return false;
          if (value.max && behavior.engagementScore > value.max) return false;
          break;
        case 'purchaseHistory':
          if (value.min && behavior.purchaseHistory < value.min) return false;
          break;
        case 'viewingFrequency':
          if (Array.isArray(value)) {
            if (!value.includes(behavior.viewingFrequency)) return false;
          } else if (behavior.viewingFrequency !== value) {
            return false;
          }
          break;
        case 'subscriptionStatus':
          if (Array.isArray(value)) {
            if (!value.includes(behavior.subscriptionStatus)) return false;
          } else if (behavior.subscriptionStatus !== value) {
            return false;
          }
          break;
        case 'deviceType':
          if (behavior.deviceType !== value) return false;
          break;
        case 'referralCount':
          if (value.min && behavior.referralCount < value.min) return false;
          break;
      }
    }
    return true;
  }

  /**
   * Get user segments
   */
  getUserSegments(userId: string): UserSegment[] {
    const segmentIds = this.segmentMembership.get(userId) || [];
    return segmentIds
      .map((id) => this.segments.get(id))
      .filter((s): s is UserSegment => s !== undefined);
  }

  /**
   * Get all segments
   */
  getAllSegments(): UserSegment[] {
    return Array.from(this.segments.values());
  }

  /**
   * Get behavioral metrics
   */
  getBehavioralMetrics(): BehavioralMetrics {
    const users = Array.from(this.userBehaviors.values());
    if (users.length === 0) {
      return {
        totalUsers: 0,
        avgWatchTime: 0,
        avgEngagementScore: 0,
        churnRate: 0,
        retentionRate: 0,
        conversionRate: 0,
      };
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = users.filter((u) => u.lastActive > thirtyDaysAgo);
    const churnedUsers = users.filter((u) => u.lastActive <= thirtyDaysAgo);
    const convertedUsers = users.filter((u) => u.subscriptionStatus !== 'free');

    return {
      totalUsers: users.length,
      avgWatchTime: users.reduce((sum, u) => sum + u.watchTime, 0) / users.length,
      avgEngagementScore:
        users.reduce((sum, u) => sum + u.engagementScore, 0) / users.length,
      churnRate: (churnedUsers.length / users.length) * 100,
      retentionRate: (activeUsers.length / users.length) * 100,
      conversionRate: (convertedUsers.length / users.length) * 100,
    };
  }

  /**
   * Add user behavior
   */
  addUserBehavior(behavior: UserBehavior): void {
    this.userBehaviors.set(behavior.userId, behavior);
  }

  /**
   * Update user behavior
   */
  updateUserBehavior(userId: string, updates: Partial<UserBehavior>): void {
    const current = this.userBehaviors.get(userId);
    if (current) {
      this.userBehaviors.set(userId, { ...current, ...updates });
    }
  }

  /**
   * Get segment recommendations
   */
  getSegmentRecommendations(userId: string): string[] {
    const segments = this.getUserSegments(userId);
    const recommendations = new Set<string>();

    segments.forEach((segment) => {
      segment.recommendedActions.forEach((action) => {
        recommendations.add(action);
      });
    });

    return Array.from(recommendations);
  }
}

export const userSegmentationEngine = new UserSegmentationEngine();
