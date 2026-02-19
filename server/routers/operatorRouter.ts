import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { db } from "../db";
import { TRPCError } from "@trpc/server";

export const operatorRouter = router({
  // Get current user's operator
  getMyOperator: protectedProcedure.query(async ({ ctx }) => {
    const operator = await db.query.operators.findFirst({
      where: (operators, { eq }) => eq(operators.userId, ctx.user.id),
    });
    return operator;
  }),

  // Get operator by ID
  getOperator: publicProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });
      return operator;
    }),

  // Create new operator
  createOperator: protectedProcedure
    .input(
      z.object({
        companyName: z.string().min(1).max(255),
        operatorName: z.string().min(1).max(255),
        description: z.string().optional(),
        email: z.string().email(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user already has an operator
      const existing = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.userId, ctx.user.id),
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already has an operator account",
        });
      }

      // Create operator
      const result = await db.insert(operators).values({
        userId: ctx.user.id,
        companyName: input.companyName,
        operatorName: input.operatorName,
        description: input.description,
        email: input.email,
        phone: input.phone,
        website: input.website,
        status: "active",
        tier: "free",
        maxChannels: 5,
        maxConcurrentBroadcasts: 1,
        maxStorageGB: 100,
      });

      return result;
    }),

  // Update operator
  updateOperator: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        companyName: z.string().optional(),
        operatorName: z.string().optional(),
        description: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        logo: z.string().url().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this operator",
        });
      }

      // Update operator
      await db
        .update(operators)
        .set({
          companyName: input.companyName,
          operatorName: input.operatorName,
          description: input.description,
          email: input.email,
          phone: input.phone,
          website: input.website,
          logo: input.logo,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(operators.id, input.operatorId));

      return { success: true };
    }),

  // Get operator members
  getMembers: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership or admin role
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view members",
        });
      }

      const members = await db.query.operatorMembers.findMany({
        where: (operatorMembers, { eq }) =>
          eq(operatorMembers.operatorId, input.operatorId),
      });

      return members;
    }),

  // Add member to operator
  addMember: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        userId: z.number(),
        role: z.enum(["admin", "broadcaster", "moderator", "viewer"]),
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
          message: "You don't have permission to add members",
        });
      }

      // Add member
      await db.insert(operatorMembers).values({
        operatorId: input.operatorId,
        userId: input.userId,
        role: input.role,
        invitedBy: ctx.user.id,
        invitedAt: new Date().toISOString(),
      });

      return { success: true };
    }),

  // Get operator channels
  getChannels: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Operator not found",
        });
      }

      const channels = await db.query.operatorChannels.findMany({
        where: (operatorChannels, { eq }) =>
          eq(operatorChannels.operatorId, input.operatorId),
      });

      return channels;
    }),

  // Create channel
  createChannel: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        channelName: z.string().min(1).max(255),
        slug: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.string().optional(),
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
          message: "You don't have permission to create channels",
        });
      }

      // Check channel limit
      const channelCount = await db.query.operatorChannels.findMany({
        where: (operatorChannels, { eq }) =>
          eq(operatorChannels.operatorId, input.operatorId),
      });

      if (channelCount.length >= operator.maxChannels) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Channel limit reached (${operator.maxChannels})`,
        });
      }

      // Create channel
      const result = await db.insert(operatorChannels).values({
        operatorId: input.operatorId,
        channelName: input.channelName,
        slug: input.slug,
        description: input.description,
        category: input.category,
        status: "active",
        visibility: "public",
      });

      return result;
    }),

  // Get broadcasts for operator
  getBroadcasts: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Operator not found",
        });
      }

      const broadcasts = await db.query.operatorBroadcasts.findMany({
        where: (operatorBroadcasts, { eq }) =>
          eq(operatorBroadcasts.operatorId, input.operatorId),
      });

      return broadcasts;
    }),

  // Create broadcast
  createBroadcast: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        channelId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        startTime: z.string(),
        broadcastType: z.enum(["live", "premiere", "rerun", "vod"]),
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
          message: "You don't have permission to create broadcasts",
        });
      }

      // Create broadcast
      const result = await db.insert(operatorBroadcasts).values({
        operatorId: input.operatorId,
        channelId: input.channelId,
        title: input.title,
        description: input.description,
        startTime: input.startTime,
        broadcastType: input.broadcastType,
        status: "scheduled",
      });

      return result;
    }),

  // Get operator analytics
  getAnalytics: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view analytics",
        });
      }

      const analytics = await db.query.operatorAnalytics.findMany({
        where: (operatorAnalytics, { eq }) =>
          eq(operatorAnalytics.operatorId, input.operatorId),
      });

      return analytics;
    }),

  // Get operator revenue
  getRevenue: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view revenue",
        });
      }

      const revenue = await db.query.operatorRevenue.findMany({
        where: (operatorRevenue, { eq }) =>
          eq(operatorRevenue.operatorId, input.operatorId),
      });

      return revenue;
    }),

  // Get streaming credentials
  getStreamingCredentials: protectedProcedure
    .input(z.object({ operatorId: z.number() }))
    .query(async ({ ctx, input }) => {
      const operator = await db.query.operators.findFirst({
        where: (operators, { eq }) => eq(operators.id, input.operatorId),
      });

      if (!operator || operator.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view credentials",
        });
      }

      const credentials = await db.query.operatorStreamingCredentials.findMany({
        where: (operatorStreamingCredentials, { eq }) =>
          eq(operatorStreamingCredentials.operatorId, input.operatorId),
      });

      return credentials;
    }),

  // Add streaming credential
  addStreamingCredential: protectedProcedure
    .input(
      z.object({
        operatorId: z.number(),
        platform: z.enum(["youtube", "twitch", "facebook", "custom"]),
        accountId: z.string(),
        streamKey: z.string(),
        rtmpUrl: z.string().optional(),
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

      const result = await db.insert(operatorStreamingCredentials).values({
        operatorId: input.operatorId,
        platform: input.platform,
        accountId: input.accountId,
        streamKey: input.streamKey,
        rtmpUrl: input.rtmpUrl,
        status: "disconnected",
      });

      return result;
    }),
});
