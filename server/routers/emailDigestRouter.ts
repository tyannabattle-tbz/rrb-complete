import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { emailDigestService } from '../services/email-digest-service';
import { z } from 'zod';

export const emailDigestRouter = router({
  getPreferences: protectedProcedure.query(({ ctx }) => {
    return emailDigestService.getPreferences(ctx.user.id.toString());
  }),

  setPreferences: protectedProcedure
    .input(z.object({
      frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
      enabled: z.boolean(),
      categories: z.object({
        newVideos: z.boolean(),
        recommendations: z.boolean(),
        communityHighlights: z.boolean(),
        playlistUpdates: z.boolean(),
        frequencyUpdates: z.boolean(),
      }),
    }))
    .mutation(({ ctx, input }) => {
      return emailDigestService.setPreferences(ctx.user.id.toString(), input);
    }),

  generateDigest: protectedProcedure.query(({ ctx }) => {
    const prefs = emailDigestService.getPreferences(ctx.user.id.toString());
    if (!prefs) return null;
    return emailDigestService.generateDigest(ctx.user.id.toString(), prefs);
  }),

  sendDigest: protectedProcedure.mutation(({ ctx }) => {
    const prefs = emailDigestService.getPreferences(ctx.user.id.toString());
    if (!prefs) return { success: false };
    const digest = emailDigestService.generateDigest(ctx.user.id.toString(), prefs);
    return emailDigestService.sendDigest(ctx.user.id.toString(), digest);
  }),

  getHistory: protectedProcedure.query(({ ctx }) => {
    return emailDigestService.getDigestHistory(ctx.user.id.toString());
  }),

  getStats: protectedProcedure.query(({ ctx }) => {
    return emailDigestService.getDigestStats(ctx.user.id.toString());
  }),
});
