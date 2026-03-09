import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const monetizationRouter = router({
  /**
   * Get creator earnings dashboard
   */
  getEarningsDashboard: protectedProcedure.query(async ({ ctx }) => {
    // Mock earnings data
    return {
      totalEarnings: 2450.75,
      monthlyEarnings: 385.25,
      pendingBalance: 125.5,
      availableBalance: 2325.25,
      lastPayoutDate: new Date(Date.now() - 86400000 * 30),
      nextPayoutDate: new Date(Date.now() + 86400000 * 5),
      payoutMethod: "bank_transfer",
      stats: {
        totalViews: 0,
        totalReactions: 8923,
        totalShares: 2341,
        averageViewDuration: 45, // seconds
        engagementRate: 7.1, // percentage
      },
    };
  }),

  /**
   * Get earnings by video
   */
  getVideoEarnings: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      // Mock video earnings
      const mockEarnings = [
        {
          videoId: "video-1",
          title: "Cinematic Sunset",
          views: 0,
          reactions: 3421,
          shares: 892,
          earnings: 892.34,
          createdAt: new Date(Date.now() - 86400000 * 30),
        },
        {
          videoId: "video-2",
          title: "Motion Graphics Showcase",
          views: 38120,
          reactions: 2891,
          shares: 654,
          earnings: 756.42,
          createdAt: new Date(Date.now() - 86400000 * 45),
        },
        {
          videoId: "video-3",
          title: "Urban Exploration",
          views: 28450,
          reactions: 1823,
          shares: 421,
          earnings: 567.89,
          createdAt: new Date(Date.now() - 86400000 * 60),
        },
      ];

      return {
        earnings: mockEarnings.slice(input.offset, input.offset + input.limit),
        total: mockEarnings.length,
        totalEarnings: mockEarnings.reduce((sum, e) => sum + e.earnings, 0),
      };
    }),

  /**
   * Get earnings history (monthly breakdown)
   */
  getEarningsHistory: protectedProcedure
    .input(
      z.object({
        months: z.number().default(12),
      })
    )
    .query(async ({ input }) => {
      // Mock monthly earnings
      const history = [];
      for (let i = input.months - 1; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        history.push({
          month: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          earnings: Math.floor(Math.random() * 500) + 100,
          views: Math.floor(Math.random() * 50000) + 10000,
          reactions: Math.floor(Math.random() * 5000) + 500,
        });
      }
      return history;
    }),

  /**
   * Get payout settings
   */
  getPayoutSettings: protectedProcedure.query(async ({ ctx }) => {
    return {
      payoutMethod: "bank_transfer",
      bankAccount: {
        accountHolder: "John Doe",
        accountNumber: "****1234",
        routingNumber: "****5678",
        bankName: "Example Bank",
      },
      minimumPayout: 100,
      payoutFrequency: "monthly",
      taxInfo: {
        taxId: "****5678",
        country: "US",
      },
    };
  }),

  /**
   * Update payout settings
   */
  updatePayoutSettings: protectedProcedure
    .input(
      z.object({
        payoutMethod: z.enum(["bank_transfer", "paypal", "stripe"]).optional(),
        payoutFrequency: z.enum(["weekly", "monthly", "quarterly"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, update in database
      return {
        success: true,
        settings: input,
      };
    }),

  /**
   * Get monetization eligibility
   */
  getMonetizationStatus: protectedProcedure.query(async ({ ctx }) => {
    return {
      isEligible: true,
      requirements: {
        minimumVideos: { required: 5, current: 12, met: true },
        minimumViews: { required: 1000, current: 0, met: true },
        accountAge: { required: 30, current: 120, met: true },
      },
      status: "active",
      joinedDate: new Date(Date.now() - 86400000 * 120),
    };
  }),

  /**
   * Request payout
   */
  requestPayout: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(100),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, create payout request in database
      return {
        success: true,
        payoutId: `payout-${Date.now()}`,
        amount: input.amount,
        status: "pending",
        estimatedDate: new Date(Date.now() + 86400000 * 5),
      };
    }),

  /**
   * Get payout history
   */
  getPayoutHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // Mock payout history
      const mockPayouts = [
        {
          payoutId: "payout-1",
          amount: 500,
          status: "completed",
          date: new Date(Date.now() - 86400000 * 30),
          method: "bank_transfer",
        },
        {
          payoutId: "payout-2",
          amount: 450,
          status: "completed",
          date: new Date(Date.now() - 86400000 * 60),
          method: "bank_transfer",
        },
        {
          payoutId: "payout-3",
          amount: 400,
          status: "completed",
          date: new Date(Date.now() - 86400000 * 90),
          method: "bank_transfer",
        },
      ];

      return {
        payouts: mockPayouts.slice(input.offset, input.offset + input.limit),
        total: mockPayouts.length,
        totalPaidOut: mockPayouts.reduce((sum, p) => sum + p.amount, 0),
      };
    }),

  /**
   * Get earnings per view rate
   */
  getEarningsRate: protectedProcedure.query(async ({ ctx }) => {
    return {
      ratePerView: 0.01, // $0.01 per view
      ratePerReaction: 0.05, // $0.05 per reaction
      ratePerShare: 0.1, // $0.10 per share
      ratePerMinuteWatched: 0.02, // $0.02 per minute watched
      lastUpdated: new Date(Date.now() - 86400000 * 7),
    };
  }),

  /**
   * Get revenue split breakdown
   */
  getRevenueSplit: protectedProcedure.query(async ({ ctx }) => {
    return {
      creatorShare: 70, // percentage
      platformShare: 20,
      partnerShare: 10,
      description: "Revenue is split between creators (70%), platform operations (20%), and partners (10%)",
    };
  }),
});
