import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { referralRewardsService } from '../services/referral-rewards-service';
import { z } from 'zod';

export const referralRouter = router({
  createUser: protectedProcedure.mutation(({ ctx }) => {
    return referralRewardsService.createReferralUser(ctx.user.id.toString());
  }),

  getUser: protectedProcedure.query(({ ctx }) => {
    return referralRewardsService.getReferralUser(ctx.user.id.toString());
  }),

  addReferral: protectedProcedure
    .input(z.object({ referredUserId: z.string() }))
    .mutation(({ ctx, input }) => {
      return referralRewardsService.addReferral(ctx.user.id.toString(), input.referredUserId);
    }),

  addPoints: protectedProcedure
    .input(z.object({ points: z.number(), reason: z.string() }))
    .mutation(({ ctx, input }) => {
      return referralRewardsService.addPoints(ctx.user.id.toString(), input.points, input.reason);
    }),

  redeemReward: protectedProcedure
    .input(z.object({ rewardId: z.string() }))
    .mutation(({ ctx, input }) => {
      return referralRewardsService.redeemReward(ctx.user.id.toString(), input.rewardId);
    }),

  getAvailableRewards: protectedProcedure.query(({ ctx }) => {
    return referralRewardsService.getAvailableRewards(ctx.user.id.toString());
  }),

  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(({ input }) => {
      return referralRewardsService.getLeaderboard(input.limit);
    }),

  getTierBenefits: publicProcedure
    .input(z.enum(['bronze', 'silver', 'gold', 'platinum']))
    .query(({ input }) => {
      return referralRewardsService.getTierBenefits(input);
    }),

  getStats: protectedProcedure.query(({ ctx }) => {
    return referralRewardsService.getReferralStats(ctx.user.id.toString());
  }),
});
