import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';
import { notificationsService } from '../notifications-service';
import { collaborationService } from '../collaboration-service';
import { audienceInteractionService } from '../audience-interaction-service';

export const ecosystemRouter = router({
  // ============ NOTIFICATIONS ============
  notifications: router({
    /**
     * Get user notifications
     */
    getNotifications: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(({ ctx, input }) => {
        return notificationsService.getNotifications(ctx.user.id, input.limit);
      }),

    /**
     * Mark notification as read
     */
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.string() }))
      .mutation(({ ctx, input }) => {
        notificationsService.markAsRead(ctx.user.id, input.notificationId);
        return { success: true };
      }),

    /**
     * Send performance live notification
     */
    notifyPerformanceLive: protectedProcedure
      .input(
        z.object({
          performanceId: z.string(),
          performanceName: z.string(),
          bandMembers: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        await notificationsService.notifyPerformanceLive(
          input.performanceId,
          input.performanceName,
          input.bandMembers
        );
        return { success: true };
      }),
  }),

  // ============ COLLABORATION ============
  collaboration: router({
    /**
     * Create collaboration invitation
     */
    createInvitation: protectedProcedure
      .input(
        z.object({
          performanceId: z.string(),
          performanceName: z.string(),
          invitedUserId: z.string(),
          invitedEmail: z.string().email(),
          role: z.enum(['lead', 'backup', 'support', 'guest']),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await collaborationService.createInvitation(
          input.performanceId,
          input.performanceName,
          ctx.user.id,
          ctx.user.name || 'Unknown',
          input.invitedUserId,
          input.invitedEmail,
          input.role
        );
      }),

    /**
     * Accept collaboration invitation
     */
    acceptInvitation: protectedProcedure
      .input(z.object({ invitationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await collaborationService.acceptInvitation(input.invitationId, ctx.user.id);
      }),

    /**
     * Decline collaboration invitation
     */
    declineInvitation: protectedProcedure
      .input(z.object({ invitationId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        await collaborationService.declineInvitation(input.invitationId, ctx.user.id);
        return { success: true };
      }),

    /**
     * Get user invitations
     */
    getInvitations: protectedProcedure.query(({ ctx }) => {
      return collaborationService.getUserInvitations(ctx.user.id);
    }),

    /**
     * Get user permissions for performance
     */
    getPermissions: protectedProcedure
      .input(z.object({ performanceId: z.string() }))
      .query(({ ctx, input }) => {
        return collaborationService.getUserPermissions(ctx.user.id, input.performanceId);
      }),
  }),

  // ============ AUDIENCE INTERACTION ============
  audience: router({
    /**
     * Send chat message
     */
    sendMessage: protectedProcedure
      .input(
        z.object({
          performanceId: z.string(),
          message: z.string().min(1).max(500),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await audienceInteractionService.sendMessage(
          ctx.user.id,
          ctx.user.name || 'Anonymous',
          input.performanceId,
          input.message
        );
      }),

    /**
     * Get chat messages
     */
    getMessages: publicProcedure
      .input(
        z.object({
          performanceId: z.string(),
          limit: z.number().default(100),
        })
      )
      .query(({ input }) => {
        return audienceInteractionService.getMessages(input.performanceId, input.limit);
      }),

    /**
     * Like a message
     */
    likeMessage: protectedProcedure
      .input(
        z.object({
          performanceId: z.string(),
          messageId: z.string(),
        })
      )
      .mutation(({ input }) => {
        audienceInteractionService.likeMessage(input.performanceId, input.messageId);
        return { success: true };
      }),

    /**
     * Vote for a song
     */
    voteForSong: protectedProcedure
      .input(
        z.object({
          performanceId: z.string(),
          songId: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await audienceInteractionService.voteForSong(
          input.performanceId,
          input.songId,
          ctx.user.id
        );
        return { success: true };
      }),

    /**
     * Get song votes
     */
    getVotes: publicProcedure
      .input(z.object({ performanceId: z.string() }))
      .query(({ input }) => {
        return audienceInteractionService.getVotes(input.performanceId);
      }),

    /**
     * Get user engagement points
     */
    getUserPoints: protectedProcedure.query(({ ctx }) => {
      return { points: audienceInteractionService.getUserPoints(ctx.user.id) };
    }),

    /**
     * Get user badges
     */
    getUserBadges: protectedProcedure.query(({ ctx }) => {
      return audienceInteractionService.getUserBadges(ctx.user.id);
    }),

    /**
     * Get leaderboard
     */
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => {
        return audienceInteractionService.getLeaderboard(input.limit);
      }),
  }),
});
