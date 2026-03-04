import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import CallInSystemService from '../services/callInSystem';

export const callInRouter = router({
  // Submit a call request
  submitCallRequest: publicProcedure
    .input(
      z.object({
        stationId: z.number(),
        callerId: z.string(),
        callerName: z.string(),
        callerEmail: z.string().email(),
        topic: z.string(),
        question: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const result = await CallInSystemService.submitCallRequest({
        stationId: input.stationId,
        callerId: input.callerId,
        callerName: input.callerName,
        callerEmail: input.callerEmail,
        topic: input.topic,
        question: input.question,
        timestamp: new Date(),
        status: 'pending',
      });

      return result;
    }),

  // Get call queue
  getCallQueue: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const queue = CallInSystemService.getCallQueue(input.stationId);
      return queue;
    }),

  // Get next call
  getNextCall: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .mutation(async ({ input }) => {
      const call = CallInSystemService.getNextCall(input.stationId);
      return call;
    }),

  // Get active call
  getActiveCall: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const call = CallInSystemService.getActiveCall(input.stationId);
      return call;
    }),

  // End current call
  endCall: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .mutation(async ({ input }) => {
      const result = CallInSystemService.endCall(input.stationId);
      return { success: result };
    }),

  // Get call screening suggestions
  getCallScreeningSuggestions: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        topic: z.string(),
      })
    )
    .query(async ({ input }) => {
      const suggestions = await CallInSystemService.getCallScreeningSuggestions(
        input.stationId,
        input.topic
      );

      return suggestions;
    }),

  // Get call statistics
  getCallStatistics: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const stats = CallInSystemService.getCallStatistics(input.stationId);
      return stats;
    }),

  // Get call history
  getCallHistory: protectedProcedure
    .input(
      z.object({
        stationId: z.number(),
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      const history = CallInSystemService.getCallHistory(input.stationId, input.limit);
      return history;
    }),

  // Initialize call-in system
  initializeCallInSystem: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .mutation(async ({ input }) => {
      const result = CallInSystemService.initializeCallInSystem(input.stationId);
      return { success: result };
    }),

  // Get mobile game status
  getMobileGameStatus: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const status = CallInSystemService.getMobileGameStatus(input.stationId);
      return status;
    }),

  // Get caller feedback
  getCallerFeedback: protectedProcedure
    .input(z.object({ callId: z.number() }))
    .query(async ({ input }) => {
      const feedback = await CallInSystemService.getCallerFeedback(input.callId);
      return feedback;
    }),
});

export default callInRouter;
