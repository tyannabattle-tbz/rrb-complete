/**
 * Ecosystem Cross-Port tRPC Router
 * Exposes cross-port communication as tRPC procedures
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { EcosystemCrossPortService } from '../services/ecosystemCrossPortService';

export const ecosystemCrossPortRouter = router({
  // Get ecosystem status
  getStatus: publicProcedure.query(async () => {
    return EcosystemCrossPortService.getEcosystemStatus();
  }),

  // Send message between ports
  sendMessage: protectedProcedure
    .input(
      z.object({
        from: z.number(),
        to: z.number(),
        action: z.string(),
        payload: z.record(z.any()),
        priority: z.enum(['critical', 'high', 'normal', 'low']).default('normal'),
      })
    )
    .mutation(async ({ input }) => {
      return await EcosystemCrossPortService.sendMessage({
        from: input.from,
        to: input.to,
        action: input.action,
        payload: input.payload,
        timestamp: new Date(),
        priority: input.priority,
      });
    }),

  // Broadcast to all ports
  broadcastToAll: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        payload: z.record(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const successCount = await EcosystemCrossPortService.broadcastToAll(
        input.action,
        input.payload
      );
      return { successCount, totalPorts: 4 };
    }),

  // Sync with QUMUS
  syncWithQUMUS: protectedProcedure.mutation(async () => {
    return await EcosystemCrossPortService.syncWithQUMUS();
  }),

  // Activate studio broadcast
  activateStudioBroadcast: protectedProcedure
    .input(z.object({ studioSessionId: z.string() }))
    .mutation(async ({ input }) => {
      return await EcosystemCrossPortService.activateStudioBroadcast(input.studioSessionId);
    }),

  // Get message queue
  getMessageQueue: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return EcosystemCrossPortService.getMessageQueue(input.limit);
    }),

  // Clear message queue
  clearMessageQueue: protectedProcedure.mutation(async () => {
    EcosystemCrossPortService.clearMessageQueue();
    return { success: true };
  }),
});
