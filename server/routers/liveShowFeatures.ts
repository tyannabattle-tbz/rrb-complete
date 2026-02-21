import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { callInService } from '../services/callInService';
import { archiveService } from '../services/archiveService';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const liveShowFeaturesRouter = router({
  // ===== CALL-IN FEATURES =====

  // Create a call-in request
  createCallInRequest: publicProcedure
    .input(
      z.object({
        channelId: z.string(),
        showId: z.string(),
        callerName: z.string(),
        callerEmail: z.string().email(),
        topic: z.string(),
      })
    )
    .mutation(({ input }) => {
      const session = callInService.createCallInRequest(input);
      return session;
    }),

  // Get waiting calls for a show (DJ only)
  getWaitingCalls: protectedProcedure
    .input(z.object({ showId: z.string() }))
    .query(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return callInService.getWaitingCalls(input.showId);
    }),

  // Connect a caller (DJ only)
  connectCaller: protectedProcedure
    .input(z.object({ callId: z.string() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return callInService.connectCaller(input.callId);
    }),

  // End a call (DJ only)
  endCall: protectedProcedure
    .input(z.object({ callId: z.string(), recordingUrl: z.string().optional() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return callInService.endCall(input.callId, input.recordingUrl);
    }),

  // Get active calls for a show
  getActiveCalls: publicProcedure.input(z.object({ showId: z.string() })).query(({ input }) => {
    return callInService.getActiveCalls(input.showId);
  }),

  // Get call history for a show
  getCallHistory: publicProcedure.input(z.object({ showId: z.string() })).query(({ input }) => {
    return callInService.getCallHistory(input.showId);
  }),

  // Reject a call (DJ only)
  rejectCall: protectedProcedure
    .input(z.object({ callId: z.string() }))
    .mutation(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      return { success: callInService.rejectCall(input.callId) };
    }),

  // ===== ARCHIVE FEATURES =====

  // Get channel recordings
  getChannelRecordings: publicProcedure
    .input(z.object({ channelId: z.string(), limit: z.number().optional() }))
    .query(({ input }) => {
      return archiveService.getChannelRecordings(input.channelId, input.limit);
    }),

  // Get recording by ID
  getRecording: publicProcedure.input(z.object({ recordingId: z.string() })).query(({ input }) => {
    return archiveService.getRecording(input.recordingId);
  }),

  // Get all recordings
  getAllRecordings: publicProcedure.input(z.object({ limit: z.number().optional() })).query(({ input }) => {
    return archiveService.getAllRecordings(input.limit);
  }),

  // Search recordings
  searchRecordings: publicProcedure.input(z.object({ query: z.string() })).query(({ input }) => {
    return archiveService.searchRecordings(input.query);
  }),

  // Get trending shows
  getTrendingShows: publicProcedure.input(z.object({ limit: z.number().optional() })).query(({ input }) => {
    return archiveService.getTrendingShows(input.limit);
  }),

  // Get recent shows
  getRecentShows: publicProcedure.input(z.object({ limit: z.number().optional() })).query(({ input }) => {
    return archiveService.getRecentShows(input.limit);
  }),

  // Get archive statistics
  getArchiveStats: publicProcedure.input(z.object({ channelId: z.string() })).query(({ input }) => {
    return archiveService.getArchiveStats(input.channelId);
  }),

  // ===== DONATION FEATURES =====

  // Create donation for a show
  createShowDonation: publicProcedure
    .input(
      z.object({
        showId: z.string(),
        channelId: z.string(),
        amount: z.number().min(1),
        donorName: z.string(),
        donorEmail: z.string().email(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Create Stripe checkout session for donation
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Support Show: ${input.showId}`,
                  description: input.message || 'Support this live show',
                },
                unit_amount: Math.round(input.amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.VITE_APP_URL || 'https://rockinrockinboogie.com'}/rrb/donation-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_APP_URL || 'https://rockinrockinboogie.com'}/rrb/radio-station`,
          customer_email: input.donorEmail,
          metadata: {
            showId: input.showId,
            channelId: input.channelId,
            donorName: input.donorName,
            donorEmail: input.donorEmail,
            message: input.message || '',
          },
        });

        return {
          success: true,
          checkoutUrl: session.url,
          sessionId: session.id,
        };
      } catch (error) {
        console.error('Donation error:', error);
        return {
          success: false,
          error: 'Failed to create donation session',
        };
      }
    }),

  // Get donation history for show
  getShowDonations: protectedProcedure
    .input(z.object({ showId: z.string() }))
    .query(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      // This would fetch from database in production
      return {
        showId: input.showId,
        totalDonations: 0,
        donationCount: 0,
        donations: [],
      };
    }),

  // Get total donations for channel
  getChannelDonations: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Unauthorized: Admin access required');
      }
      // This would fetch from database in production
      return {
        channelId: input.channelId,
        totalDonations: 0,
        donationCount: 0,
      };
    }),
});
