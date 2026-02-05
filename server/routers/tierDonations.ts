import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

function generateId(): string {
  return `donation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Tier Donations Router
 * Manages tiered donation system with QUMUS orchestration
 */

interface DonationTier {
  id: string;
  name: string;
  amount: number;
  benefits: string[];
  icon: string;
  stripePriceId?: string; // Stripe price ID
}

interface UserDonation {
  id: string;
  userId: string;
  tierId: string;
  tierName: string;
  amount: number;
  timestamp: number;
  decisionId: string;
  message?: string;
  isAnonymous: boolean;
}

const donationTiers: DonationTier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    amount: 5,
    icon: 'heart',
    benefits: ['Supporter badge', 'Early access', 'Monthly newsletter mention'],
    stripePriceId: process.env.STRIPE_DONATION_SUPPORTER_PRICE_ID,
  },
  {
    id: 'champion',
    name: 'Champion',
    amount: 25,
    icon: 'star',
    benefits: ['Champion badge', 'Exclusive podcast', 'Direct message with founder', 'Custom meditation'],
    stripePriceId: process.env.STRIPE_DONATION_CHAMPION_PRICE_ID,
  },
  {
    id: 'benefactor',
    name: 'Benefactor',
    amount: 100,
    icon: 'sparkles',
    benefits: ['Lifetime premium', 'Quarterly strategy calls', 'Feature naming rights', 'Annual recognition'],
    stripePriceId: process.env.STRIPE_DONATION_BENEFACTOR_PRICE_ID,
  },
];

let donations: UserDonation[] = [];

export const tierDonationsRouter = router({
  /**
   * Get all donation tiers
   */
  getTiers: publicProcedure.query(async () => {
    return donationTiers;
  }),

  /**
   * Create a donation with QUMUS decision tracking
   */
  createDonation: protectedProcedure
    .input(
      z.object({
        tierId: z.string(),
        message: z.string().optional(),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }: any) => {
      const decisionId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const tier = donationTiers.find(t => t.id === input.tierId);
      if (!tier) {
        throw new Error('Invalid donation tier');
      }

      const donation: UserDonation = {
        id: generateId(),
        userId: ctx.user.id,
        tierId: input.tierId,
        tierName: tier.name,
        amount: tier.amount,
        timestamp: Date.now(),
        decisionId,
        message: input.message,
        isAnonymous: input.isAnonymous,
      };

      donations.push(donation);

      console.log(`[Donations] New donation recorded`, {
        decisionId,
        userId: ctx.user.id,
        tier: tier.name,
        amount: tier.amount,
        timestamp: new Date(donation.timestamp).toISOString(),
      });

      return {
        success: true,
        donation,
        decisionId,
        message: `Thank you for your ${tier.name} donation of $${tier.amount}!`,
      };
    }),

  /**
   * Get user's donation history
   */
  getUserDonations: protectedProcedure.query(async ({ ctx }: any) => {
    return donations.filter(d => d.userId === ctx.user.id);
  }),

  /**
   * Get total donations amount
   */
  getTotalDonations: publicProcedure.query(async () => {
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    return {
      total,
      count: donations.length,
      averageDonation: donations.length > 0 ? total / donations.length : 0,
    };
  }),

  /**
   * Get top donors (anonymized)
   */
  getTopDonors: publicProcedure.query(async () => {
    const donorMap = new Map<string, { amount: number; count: number; tier: string }>();

    donations.forEach(d => {
      const key = d.isAnonymous ? 'Anonymous' : d.userId;
      const existing = donorMap.get(key) || { amount: 0, count: 0, tier: '' };
      donorMap.set(key, {
        amount: existing.amount + d.amount,
        count: existing.count + 1,
        tier: d.tierName,
      });
    });

    return Array.from(donorMap.entries())
      .map(([name, data]) => ({
        name,
        totalAmount: data.amount,
        donationCount: data.count,
        topTier: data.tier,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  }),

  /**
   * Get donation leaderboard
   */
  getDonationLeaderboard: publicProcedure.query(async () => {
    const leaderboard = donations
      .filter(d => !d.isAnonymous)
      .reduce((acc, d) => {
        const existing = acc.find(item => item.userId === d.userId);
        if (existing) {
          existing.totalAmount += d.amount;
          existing.donationCount += 1;
        } else {
          acc.push({
            userId: d.userId,
            totalAmount: d.amount,
            donationCount: 1,
            topTier: d.tierName,
          });
        }
        return acc;
      }, [] as any[]);

    return leaderboard.sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 20);
  }),

  /**
   * Get donation statistics
   */
  getDonationStats: publicProcedure.query(async () => {
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    const byTier = donationTiers.map(tier => ({
      tier: tier.name,
      count: donations.filter(d => d.tierId === tier.id).length,
      amount: donations
        .filter(d => d.tierId === tier.id)
        .reduce((sum, d) => sum + d.amount, 0),
    }));

    return {
      totalDonations: total,
      totalDonors: new Set(donations.map(d => d.userId)).size,
      averageDonation: donations.length > 0 ? total / donations.length : 0,
      byTier,
      recentDonations: donations.slice(-5).reverse(),
    };
  }),

  /**
   * Send thank you notification to donor
   */
  sendThankYouNotification: protectedProcedure
    .input(z.object({ donationId: z.string() }))
    .mutation(async ({ ctx, input }: any) => {
      const donation = donations.find(d => d.id === input.donationId && d.userId === ctx.user.id);
      if (!donation) {
        throw new Error('Donation not found');
      }

      console.log(`[Donations] Thank you notification sent`, {
        userId: ctx.user.id,
        tier: donation.tierName,
        amount: donation.amount,
      });

      return {
        success: true,
        message: `Thank you notification sent for your ${donation.tierName} donation!`,
      };
    }),
});
