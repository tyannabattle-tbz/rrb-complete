import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

/**
 * Multi-Platform Streaming Router
 * Handles YouTube Live, Twitch, Facebook, and proprietary streaming
 */

export const multiPlatformStreamRouter = router({
  // Connect YouTube Live
  connectYouTube: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        accountId: z.string(),
        streamKey: z.string(),
        channelId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify operator ownership
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add credentials",
        });
      }

      // Check if YouTube credential already exists
      const existing = await db.query.operatorStreamingCredentials.findFirst({
        where: (operatorStreamingCredentials, { and, eq }) =>
          and(
            eq(operatorStreamingCredentials.operatorId, input.operatorId),
            eq(operatorStreamingCredentials.platform, "youtube")
          ),
      });

      if (existing) {
        // Update existing
        await db
          .update(operatorStreamingCredentials)
          .set({
            accountId: input.accountId,
            streamKey: input.streamKey,
            status: "connected",
            lastConnectedAt: new Date().toISOString(),
          })
          .where(eq(operatorStreamingCredentials.id, existing.id));
      } else {
        // Create new
        await db.insert(operatorStreamingCredentials).values({
          operatorId: input.operatorId,
          platform: "youtube",
          accountId: input.accountId,
          streamKey: input.streamKey,
          status: "connected",
          lastConnectedAt: new Date().toISOString(),
        });
      }

      return { success: true, platform: "youtube" };
    }),

  // Connect Twitch
  connectTwitch: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        accountId: z.string(),
        streamKey: z.string(),
        rtmpUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add credentials",
        });
      }

      const existing = await db.query.operatorStreamingCredentials.findFirst({
        where: (operatorStreamingCredentials, { and, eq }) =>
          and(
            eq(operatorStreamingCredentials.operatorId, input.operatorId),
            eq(operatorStreamingCredentials.platform, "twitch")
          ),
      });

      if (existing) {
        await db
          .update(operatorStreamingCredentials)
          .set({
            accountId: input.accountId,
            streamKey: input.streamKey,
            rtmpUrl: input.rtmpUrl,
            status: "connected",
            lastConnectedAt: new Date().toISOString(),
          })
          .where(eq(operatorStreamingCredentials.id, existing.id));
      } else {
        await db.insert(operatorStreamingCredentials).values({
          operatorId: input.operatorId,
          platform: "twitch",
          accountId: input.accountId,
          streamKey: input.streamKey,
          rtmpUrl: input.rtmpUrl,
          status: "connected",
          lastConnectedAt: new Date().toISOString(),
        });
      }

      return { success: true, platform: "twitch" };
    }),

  // Connect Facebook Live
  connectFacebook: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        accountId: z.string(),
        streamKey: z.string(),
        pageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to add credentials",
        });
      }

      const existing = await db.query.operatorStreamingCredentials.findFirst({
        where: (operatorStreamingCredentials, { and, eq }) =>
          and(
            eq(operatorStreamingCredentials.operatorId, input.operatorId),
            eq(operatorStreamingCredentials.platform, "facebook")
          ),
      });

      if (existing) {
        await db
          .update(operatorStreamingCredentials)
          .set({
            accountId: input.accountId,
            streamKey: input.streamKey,
            status: "connected",
            lastConnectedAt: new Date().toISOString(),
          })
          .where(eq(operatorStreamingCredentials.id, existing.id));
      } else {
        await db.insert(operatorStreamingCredentials).values({
          operatorId: input.operatorId,
          platform: "facebook",
          accountId: input.accountId,
          streamKey: input.streamKey,
          status: "connected",
          lastConnectedAt: new Date().toISOString(),
        });
      }

      return { success: true, platform: "facebook" };
    }),

  // Start simultaneous multi-platform broadcast
  startMultiPlatformBroadcast: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        broadcastId: z.number(),
        platforms: z.array(z.enum(["youtube", "twitch", "facebook"])),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to start broadcasts",
        });
      }

      const broadcast = await db.query.operatorBroadcasts.findFirst({
        where: (operatorBroadcasts, { eq }) =>
          eq(operatorBroadcasts.id, input.broadcastId),
      });

      if (!broadcast) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Broadcast not found",
        });
      }

      // Create streaming status for each platform
      for (const platform of input.platforms) {
        const credential = await db.query.operatorStreamingCredentials.findFirst({
          where: (operatorStreamingCredentials, { and, eq }) =>
            and(
              eq(operatorStreamingCredentials.operatorId, input.operatorId),
              eq(operatorStreamingCredentials.platform, platform)
            ),
        });

        if (!credential) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `${platform} credentials not configured`,
          });
        }

        // Create streaming status
        await db.insert(operatorStreamingStatus).values({
          broadcastId: input.broadcastId,
          platform: platform,
          status: "connecting",
        });
      }

      // Update broadcast status
      await db
        .update(operatorBroadcasts)
        .set({ status: "live" })
        .where(eq(operatorBroadcasts.id, input.broadcastId));

      return {
        success: true,
        broadcastId: input.broadcastId,
        platforms: input.platforms,
      };
    }),

  // Get streaming status for broadcast
  getStreamingStatus: protectedProcedure
    .input(z.object({ broadcastId: z.number() }))
    .query(async ({ input }) => {
      const status = await db.query.operatorStreamingStatus.findMany({
        where: (operatorStreamingStatus, { eq }) =>
          eq(operatorStreamingStatus.broadcastId, input.broadcastId),
      });

      return status;
    }),

  // Update streaming status
  updateStreamingStatus: protectedProcedure
    .input(
      z.object({
        statusId: z.number(),
        status: z.enum(["idle", "connecting", "streaming", "error", "ended"]),
        viewers: z.number().optional(),
        bitrate: z.number().optional(),
        fps: z.number().optional(),
        resolution: z.string().optional(),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .update(operatorStreamingStatus)
        .set({
          status: input.status,
          viewers: input.viewers,
          bitrate: input.bitrate,
          fps: input.fps,
          resolution: input.resolution,
          errorMessage: input.errorMessage,
          lastUpdatedAt: new Date().toISOString(),
        })
        .where(eq(operatorStreamingStatus.id, input.statusId));

      return { success: true };
    }),

  // End broadcast on all platforms
  endMultiPlatformBroadcast: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        broadcastId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to end broadcasts",
        });
      }

      // Update all streaming statuses to ended
      const statuses = await db.query.operatorStreamingStatus.findMany({
        where: (operatorStreamingStatus, { eq }) =>
          eq(operatorStreamingStatus.broadcastId, input.broadcastId),
      });

      for (const status of statuses) {
        await db
          .update(operatorStreamingStatus)
          .set({ status: "ended" })
          .where(eq(operatorStreamingStatus.id, status.id));
      }

      // Update broadcast status
      await db
        .update(operatorBroadcasts)
        .set({
          status: "ended",
          actualEndTime: new Date().toISOString(),
        })
        .where(eq(operatorBroadcasts.id, input.broadcastId));

      return { success: true };
    }),

  // Get platform-specific chat
  getPlatformChat: protectedProcedure
    .input(
      z.object({
        broadcastId: z.number(),
        platform: z.enum(["youtube", "twitch", "facebook"]),
      })
    )
    .query(async ({ input }) => {
      // In a real implementation, this would fetch chat from each platform's API
      // For now, return mock data
      return {
        platform: input.platform,
        messages: [],
        totalMessages: 0,
      };
    }),

  // Aggregate chat from all platforms
  getAggregatedChat: protectedProcedure
    .input(z.object({ broadcastId: z.number() }))
    .query(async ({ input }) => {
      const statuses = await db.query.operatorStreamingStatus.findMany({
        where: (operatorStreamingStatus, { eq }) =>
          eq(operatorStreamingStatus.broadcastId, input.broadcastId),
      });

      const platforms = statuses.map((s) => s.platform);
      const messages: any[] = [];

      // Fetch chat from each platform
      for (const platform of platforms) {
        // In a real implementation, fetch from platform API
        // For now, just aggregate structure
      }

      return {
        broadcastId: input.broadcastId,
        platforms,
        totalMessages: messages.length,
        messages,
      };
    }),

  // Get unified viewer count across platforms
  getUnifiedViewerCount: protectedProcedure
    .input(z.object({ broadcastId: z.number() }))
    .query(async ({ input }) => {
      const statuses = await db.query.operatorStreamingStatus.findMany({
        where: (operatorStreamingStatus, { eq }) =>
          eq(operatorStreamingStatus.broadcastId, input.broadcastId),
      });

      const totalViewers = statuses.reduce((sum, s) => sum + (s.viewers || 0), 0);
      const platformBreakdown = statuses.map((s) => ({
        platform: s.platform,
        viewers: s.viewers || 0,
      }));

      return {
        broadcastId: input.broadcastId,
        totalViewers,
        platformBreakdown,
      };
    }),

  // Disconnect platform
  disconnectPlatform: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        platform: z.enum(["youtube", "twitch", "facebook"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to disconnect platforms",
        });
      }

      const credential = await db.query.operatorStreamingCredentials.findFirst({
        where: (operatorStreamingCredentials, { and, eq }) =>
          and(
            eq(operatorStreamingCredentials.operatorId, input.operatorId),
            eq(operatorStreamingCredentials.platform, input.platform)
          ),
      });

      if (!credential) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Platform credential not found",
        });
      }

      // Delete credential
      await db
        .delete(operatorStreamingCredentials)
        .where(eq(operatorStreamingCredentials.id, credential.id));

      return { success: true, platform: input.platform };
    }),

  // Test platform connection
  testPlatformConnection: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        platform: z.enum(["youtube", "twitch", "facebook"]),
      })
    )
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to test connections",
        });
      }

      const credential = await db.query.operatorStreamingCredentials.findFirst({
        where: (operatorStreamingCredentials, { and, eq }) =>
          and(
            eq(operatorStreamingCredentials.operatorId, input.operatorId),
            eq(operatorStreamingCredentials.platform, input.platform)
          ),
      });

      if (!credential) {
        return { success: false, platform: input.platform, message: "Not configured" };
      }

      // In a real implementation, test the actual connection
      // For now, return mock success
      return {
        success: true,
        platform: input.platform,
        status: "connected",
        message: "Connection test successful",
      };
    }),
});
