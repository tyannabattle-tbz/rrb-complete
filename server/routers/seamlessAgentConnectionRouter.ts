import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { seamlessAgentConnectionService } from '../services/seamlessAgentConnectionService';

export const seamlessAgentConnectionRouter = router({
  /**
   * Discover agents by capabilities
   */
  discoverAgents: publicProcedure
    .input(
      z.object({
        capabilities: z.array(z.string()),
        platforms: z.array(z.string()).optional(),
        minTrustScore: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      return await seamlessAgentConnectionService.discoverAgents(
        input.capabilities,
        input.platforms,
        input.minTrustScore
      );
    }),

  /**
   * Get agent profile
   */
  getAgentProfile: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      return await seamlessAgentConnectionService.getAgentProfile(input.agentId);
    }),

  /**
   * Initiate connection request
   */
  initiateConnectionRequest: protectedProcedure
    .input(
      z.object({
        targetAgentId: z.string(),
        purpose: z.string(),
        capabilities: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await seamlessAgentConnectionService.initiateConnectionRequest(
        ctx.user.id.toString(),
        input.targetAgentId,
        input.purpose,
        input.capabilities
      );
    }),

  /**
   * Accept connection request
   */
  acceptConnectionRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await seamlessAgentConnectionService.acceptConnectionRequest(input.requestId, ctx.user.id.toString());
    }),

  /**
   * Reject connection request
   */
  rejectConnectionRequest: protectedProcedure
    .input(
      z.object({
        requestId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await seamlessAgentConnectionService.rejectConnectionRequest(input.requestId, input.reason);
    }),

  /**
   * Send unified message
   */
  sendUnifiedMessage: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        targetAgentId: z.string(),
        messageType: z.enum(['request', 'response', 'notification', 'broadcast']),
        payload: z.record(z.any()),
        encrypt: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await seamlessAgentConnectionService.sendUnifiedMessage(
        input.channelId,
        ctx.user.id.toString(),
        input.targetAgentId,
        input.messageType,
        input.payload,
        input.encrypt
      );
    }),

  /**
   * Receive unified message
   */
  receiveUnifiedMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        sourceAgentId: z.string(),
        channelId: z.string(),
        messageType: z.enum(['request', 'response', 'notification', 'broadcast']),
        payload: z.record(z.any()),
        encrypted: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      return await seamlessAgentConnectionService.receiveUnifiedMessage({
        messageId: input.messageId,
        sourceAgentId: input.sourceAgentId,
        targetAgentId: '',
        channelId: input.channelId,
        messageType: input.messageType,
        payload: input.payload,
        encrypted: input.encrypted,
        timestamp: new Date(),
        status: 'sent',
      });
    }),

  /**
   * Acknowledge message delivery
   */
  acknowledgeMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ input }) => {
      return await seamlessAgentConnectionService.acknowledgeMessage(input.messageId);
    }),

  /**
   * Get active channels
   */
  getActiveChannels: protectedProcedure.query(async ({ ctx }) => {
    return await seamlessAgentConnectionService.getActiveChannels(ctx.user.id.toString());
  }),

  /**
   * Close secure channel
   */
  closeChannel: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .mutation(async ({ input }) => {
      return await seamlessAgentConnectionService.closeChannel(input.channelId);
    }),

  /**
   * Broadcast message to multiple agents
   */
  broadcastMessage: protectedProcedure
    .input(
      z.object({
        targetAgentIds: z.array(z.string()),
        messageType: z.string(),
        payload: z.record(z.any()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await seamlessAgentConnectionService.broadcastMessage(
        ctx.user.id.toString(),
        input.targetAgentIds,
        input.messageType,
        input.payload
      );
    }),

  /**
   * Get connection statistics
   */
  getConnectionStats: publicProcedure.query(async () => {
    return await seamlessAgentConnectionService.getConnectionStats();
  }),

  /**
   * Monitor connection health
   */
  monitorConnectionHealth: protectedProcedure
    .input(z.object({ channelId: z.string() }))
    .query(async ({ input }) => {
      return await seamlessAgentConnectionService.monitorConnectionHealth(input.channelId);
    }),

  /**
   * Establish cross-platform connection
   */
  establishCrossPlatformConnection: protectedProcedure
    .input(
      z.object({
        targetAgentId: z.string(),
        platforms: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await seamlessAgentConnectionService.establishCrossPlatformConnection(
        ctx.user.id.toString(),
        input.targetAgentId,
        input.platforms
      );
    }),

  /**
   * Sync agent state across platforms
   */
  syncAgentState: protectedProcedure
    .input(z.object({ platforms: z.array(z.string()) }))
    .mutation(async ({ input, ctx }) => {
      return await seamlessAgentConnectionService.syncAgentState(ctx.user.id.toString(), input.platforms);
    }),

  /**
   * Handle connection failure and recovery
   */
  handleConnectionFailure: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        error: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await seamlessAgentConnectionService.handleConnectionFailure(input.channelId, input.error);
    }),

  /**
   * Get connection recommendations
   */
  getConnectionRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return await seamlessAgentConnectionService.getConnectionRecommendations(ctx.user.id.toString());
  }),
});
