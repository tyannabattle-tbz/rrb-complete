/**
 * WebRTC Call-In Router
 * 
 * tRPC procedures for managing live radio call-in sessions.
 * Handles call initiation, queue management, and WebRTC signaling.
 * 
 * A Canryn Production
 */
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import {
  initiateCall,
  acceptCall,
  endCall,
  getCallQueue,
  getCallSession,
  updateAudioQuality,
  addTranscript,
  getChannelCallStats,
} from '../services/webrtc-call-in';

export const webrtcCallInRouter = router({
  /**
   * Initiate a new call
   */
  initiateCall: publicProcedure
    .input(
      z.object({
        callerId: z.string(),
        callerName: z.string().min(1),
        channelId: z.string(),
        topic: z.string().optional(),
      })
    )
    .mutation(({ input }) => {
      const session = initiateCall(
        input.callerId,
        input.callerName,
        input.channelId,
        input.topic
      );

      return {
        success: true,
        sessionId: session.id,
        status: session.status,
        message: 'Call initiated successfully',
      };
    }),

  /**
   * Accept a pending call
   */
  acceptCall: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }) => {
      const session = acceptCall(input.sessionId);

      if (!session) {
        throw new Error('Call session not found');
      }

      return {
        success: true,
        status: session.status,
        message: 'Call accepted',
      };
    }),

  /**
   * End an active call
   */
  endCall: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(({ input }) => {
      const session = endCall(input.sessionId);

      if (!session) {
        throw new Error('Call session not found');
      }

      return {
        success: true,
        duration: session.duration,
        message: 'Call ended',
      };
    }),

  /**
   * Get call queue for a channel
   */
  getCallQueue: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input }) => {
      const queue = getCallQueue(input.channelId);

      return queue || {
        channelId: input.channelId,
        waitingCalls: [],
        activeCalls: [],
        totalWaiting: 0,
        totalActive: 0,
        averageWaitTime: 0,
      };
    }),

  /**
   * Get call session details
   */
  getCallSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(({ input }) => {
      return getCallSession(input.sessionId);
    }),

  /**
   * Update audio quality
   */
  updateAudioQuality: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        quality: z.enum(['low', 'medium', 'high']),
      })
    )
    .mutation(({ input }) => {
      const session = updateAudioQuality(input.sessionId, input.quality);

      if (!session) {
        throw new Error('Call session not found');
      }

      return {
        success: true,
        quality: session.audioQuality,
        message: 'Audio quality updated',
      };
    }),

  /**
   * Add transcript to call
   */
  addTranscript: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        transcript: z.string(),
      })
    )
    .mutation(({ input }) => {
      const session = addTranscript(input.sessionId, input.transcript);

      if (!session) {
        throw new Error('Call session not found');
      }

      return {
        success: true,
        message: 'Transcript added',
      };
    }),

  /**
   * Get channel call statistics
   */
  getChannelCallStats: publicProcedure
    .input(z.object({ channelId: z.string() }))
    .query(({ input }) => {
      return getChannelCallStats(input.channelId);
    }),
});
