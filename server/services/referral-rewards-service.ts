// Referral & Rewards Program Service
export interface ReferralUser {
  userId: string;
  referralCode: string;
  referredBy?: string;
  referrals: string[];
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: string[];
  totalRewards: number;
  joinedAt: Date;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  type: 'discount' | 'badge' | 'feature' | 'exclusive';
  value: string;
}

export interface Leaderboard {
  userId: string;
  rank: number;
  points: number;
  referrals: number;
  tier: string;
  badges: number;
}

const referralStore = new Map<string, ReferralUser>();
const rewardStore = new Map<string, Reward>();
const leaderboardCache: Leaderboard[] = [];

const rewards: Reward[] = [
  { id: 'r1', name: 'Bronze Badge', description: 'Your first badge', pointsRequired: 100, type: 'badge', value: 'bronze' },
  { id: 'r2', name: '10% Discount', description: 'Get 10% off premium', pointsRequired: 250, type: 'discount', value: '10' },
  { id: 'r3', name: 'Silver Badge', description: 'Mid-tier achievement', pointsRequired: 500, type: 'badge', value: 'silver' },
  { id: 'r4', name: 'Exclusive Content', description: 'Access premium content', pointsRequired: 1000, type: 'exclusive', value: 'premium' },
  { id: 'r5', name: 'Gold Badge', description: 'Top tier achievement', pointsRequired: 2000, type: 'badge', value: 'gold' },
];

export const referralRewardsService = {
  createReferralUser: (userId: string): ReferralUser => {
    const referralCode = `REF_${userId}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const user: ReferralUser = {
      userId,
      referralCode,
      referrals: [],
      points: 0,
      tier: 'bronze',
      badges: [],
      totalRewards: 0,
      joinedAt: new Date(),
    };
    referralStore.set(userId, user);
    return user;
  },

  getReferralUser: (userId: string): ReferralUser | undefined => {
    return referralStore.get(userId);
  },

  addReferral: (userId: string, referredUserId: string): { success: boolean; pointsAwarded: number } => {
    const user = referralStore.get(userId);
    if (!user) return { success: false, pointsAwarded: 0 };

    user.referrals.push(referredUserId);
    user.points += 50;
    user.totalRewards += 50;

    if (user.points >= 500 && user.tier === 'bronze') {
      user.tier = 'silver';
      user.badges.push('silver');
    }

    referralStore.set(userId, user);
    return { success: true, pointsAwarded: 50 };
  },

  addPoints: (userId: string, points: number, reason: string): { success: boolean; newTotal: number } => {
    const user = referralStore.get(userId);
    if (!user) return { success: false, newTotal: 0 };

    user.points += points;
    user.totalRewards += points;

    if (user.points >= 1000 && user.tier === 'silver') {
      user.tier = 'gold';
      user.badges.push('gold');
    }

    referralStore.set(userId, user);
    return { success: true, newTotal: user.points };
  },

  redeemReward: (userId: string, rewardId: string): { success: boolean; message: string } => {
    const user = referralStore.get(userId);
    const reward = rewards.find(r => r.id === rewardId);

    if (!user || !reward) return { success: false, message: 'Invalid user or reward' };
    if (user.points < reward.pointsRequired) {
      return { success: false, message: `Not enough points. Need ${reward.pointsRequired}, have ${user.points}` };
    }

    user.points -= reward.pointsRequired;
    if (!user.badges.includes(rewardId)) {
      user.badges.push(rewardId);
    }

    referralStore.set(userId, user);
    return { success: true, message: `Redeemed ${reward.name}!` };
  },

  getAvailableRewards: (userId: string): Reward[] => {
    const user = referralStore.get(userId);
    if (!user) return [];
    return rewards.filter(r => user.points >= r.pointsRequired);
  },

  getLeaderboard: (limit: number = 10): Leaderboard[] => {
    const leaderboard = Array.from(referralStore.values())
      .map((user, idx) => ({
        userId: user.userId,
        rank: idx + 1,
        points: user.points,
        referrals: user.referrals.length,
        tier: user.tier,
        badges: user.badges.length,
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, limit);

    return leaderboard;
  },

  getTierBenefits: (tier: 'bronze' | 'silver' | 'gold' | 'platinum') => {
    const benefits = {
      bronze: { multiplier: 1, features: ['Basic rewards'] },
      silver: { multiplier: 1.5, features: ['Enhanced rewards', 'Priority support'] },
      gold: { multiplier: 2, features: ['Premium rewards', 'VIP support', 'Exclusive content'] },
      platinum: { multiplier: 3, features: ['All features', 'Custom rewards', 'Lifetime benefits'] },
    };
    return benefits[tier];
  },

  getReferralStats: (userId: string) => {
    const user = referralStore.get(userId);
    if (!user) return null;

    return {
      totalReferrals: user.referrals.length,
      totalPoints: user.points,
      totalRewards: user.totalRewards,
      tier: user.tier,
      badges: user.badges.length,
      referralCode: user.referralCode,
      joinedAt: user.joinedAt,
    };
  },
};
