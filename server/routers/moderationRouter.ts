/**
 * Moderation tRPC Router
 * Content review and user reports
 * A Canryn Production
 */
import { z } from 'zod';
import { publicProcedure, adminProcedure, router } from '../_core/trpc';
import { moderationService } from '../services/moderation-service';

export const moderationRouter = router({
  // Flag content for review
  flagContent: publicProcedure
    .input(z.object({
      contentType: z.enum(['comment', 'message', 'video', 'playlist']),
      contentId: z.string(),
      userId: z.string(),
      userName: z.string(),
      content: z.string(),
      reason: z.enum(['spam', 'harassment', 'hate_speech', 'misinformation', 'adult_content', 'other']),
      reportedBy: z.string(),
    }))
    .mutation(({ input }) => {
      return moderationService.flagContent(
        input.contentType,
        input.contentId,
        input.userId,
        input.userName,
        input.content,
        input.reason,
        input.reportedBy
      );
    }),

  // Get moderation queue (admin only)
  getModerationQueue: adminProcedure
    .query(() => {
      return moderationService.getModerationQueue();
    }),

  // Review flagged content (admin only)
  reviewContent: adminProcedure
    .input(z.object({
      flagId: z.string(),
      status: z.enum(['approved', 'rejected']),
      reviewedBy: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return moderationService.reviewContent(input.flagId, input.status, input.reviewedBy, input.notes);
    }),

  // Bulk review (admin only)
  bulkReview: adminProcedure
    .input(z.object({
      flagIds: z.array(z.string()),
      status: z.enum(['approved', 'rejected']),
      reviewedBy: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(({ input }) => {
      return moderationService.bulkReview(input.flagIds, input.status, input.reviewedBy, input.notes);
    }),

  // Report a user
  reportUser: publicProcedure
    .input(z.object({
      reportedUserId: z.string(),
      reportedUserName: z.string(),
      reportedBy: z.string(),
      reason: z.enum(['spam', 'harassment', 'hate_speech', 'misinformation', 'adult_content', 'other']),
      description: z.string(),
      evidence: z.array(z.string()).optional(),
    }))
    .mutation(({ input }) => {
      return moderationService.reportUser(
        input.reportedUserId,
        input.reportedUserName,
        input.reportedBy,
        input.reason,
        input.description,
        input.evidence
      );
    }),

  // Get user reports (admin only)
  getUserReports: adminProcedure
    .input(z.object({ status: z.enum(['pending', 'approved', 'rejected', 'appealed']).optional() }))
    .query(({ input }) => {
      return moderationService.getUserReports(input.status);
    }),

  // Resolve report (admin only)
  resolveReport: adminProcedure
    .input(z.object({
      reportId: z.string(),
      action: z.string(),
      resolvedBy: z.string(),
    }))
    .mutation(({ input }) => {
      return moderationService.resolveReport(input.reportId, input.action, input.resolvedBy);
    }),

  // Appeal moderation decision
  appealDecision: publicProcedure
    .input(z.object({ flagId: z.string() }))
    .mutation(({ input }) => {
      const success = moderationService.appealDecision(input.flagId);
      return { success };
    }),

  // Get appeal queue (admin only)
  getAppealQueue: adminProcedure
    .query(() => {
      return moderationService.getAppealQueue();
    }),

  // Get moderation statistics (admin only)
  getStats: adminProcedure
    .query(() => {
      return moderationService.getStats();
    }),

  // Get flagged content by user
  getFlaggedByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ input }) => {
      return moderationService.getFlaggedByUser(input.userId);
    }),
});
