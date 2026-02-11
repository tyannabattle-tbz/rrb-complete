import { z } from 'zod';
import { protectedProcedure, publicProcedure, router } from '../_core/trpc';
import {
  getMembers,
  getMember,
  recordEvent,
  getEvents,
  getChannelMetrics,
  generateReport,
  getEngagementSummary,
  startEngagementScheduler,
  stopEngagementScheduler,
  getSchedulerStatus,
} from '../services/community-engagement-policy';

export const communityEngagementRouter = router({
  getMembers: publicProcedure
    .input(z.object({
      tier: z.enum(['new', 'active', 'engaged', 'champion', 'ambassador']).optional(),
      channel: z.enum(['radio', 'podcast', 'forum', 'donation', 'solbones', 'meditation', 'social', 'hybridcast', 'merchandise']).optional(),
    }).optional())
    .query(({ input }) => getMembers(input ?? undefined)),

  getMember: publicProcedure
    .input(z.object({ memberId: z.string() }))
    .query(({ input }) => getMember(input.memberId)),

  recordEvent: protectedProcedure
    .input(z.object({
      memberId: z.string(),
      channel: z.enum(['radio', 'podcast', 'forum', 'donation', 'solbones', 'meditation', 'social', 'hybridcast', 'merchandise']),
      action: z.string(),
      timestamp: z.number().optional(),
      value: z.number().optional(),
      metadata: z.record(z.string()).optional(),
    }))
    .mutation(({ input }) => recordEvent({
      memberId: input.memberId,
      channel: input.channel,
      action: input.action,
      timestamp: input.timestamp || Date.now(),
      value: input.value || 1,
      metadata: input.metadata,
    })),

  getEvents: publicProcedure
    .input(z.object({
      channel: z.enum(['radio', 'podcast', 'forum', 'donation', 'solbones', 'meditation', 'social', 'hybridcast', 'merchandise']).optional(),
      memberId: z.string().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(({ input }) => getEvents(input ?? undefined)),

  getChannelMetrics: publicProcedure
    .query(() => getChannelMetrics()),

  generateReport: protectedProcedure
    .mutation(() => generateReport()),

  getSummary: publicProcedure
    .query(() => getEngagementSummary()),

  startScheduler: protectedProcedure
    .input(z.object({ intervalMs: z.number().optional() }).optional())
    .mutation(({ input }) => {
      startEngagementScheduler(input?.intervalMs);
      return { success: true };
    }),

  stopScheduler: protectedProcedure
    .mutation(() => {
      stopEngagementScheduler();
      return { success: true };
    }),

  getSchedulerStatus: publicProcedure
    .query(() => getSchedulerStatus()),
});
