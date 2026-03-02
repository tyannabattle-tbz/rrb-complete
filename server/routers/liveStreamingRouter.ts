import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const liveStreamingRouter = {
  // Start a live stream
  startStream: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(1000).optional(),
        isPublic: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const streamId = `stream-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const rtcToken = `token-${Math.random().toString(36).substr(2, 20)}`;

      return {
        streamId,
        rtcToken,
        title: input.title,
        description: input.description,
        isPublic: input.isPublic,
        createdAt: new Date(),
        viewerCount: 0,
        status: "live",
      };
    }),

  // End a live stream
  endStream: protectedProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        streamId: input.streamId,
        status: "ended",
        endedAt: new Date(),
      };
    }),

  // Get active streams
  getActiveStreams: publicProcedure.query(async () => {
    return [
      {
        streamId: "stream-1",
        title: "Live Creative Session",
        creatorName: "Alex Creator",
        viewerCount: 234,
        thumbnail: "/videos/thumbnail-1.jpg",
        isLive: true,
      },
      {
        streamId: "stream-2",
        title: "Video Editing Tutorial",
        creatorName: "Pro Editor",
        viewerCount: 156,
        thumbnail: "/videos/thumbnail-2.jpg",
        isLive: true,
      },
    ];
  }),

  // Send chat message during stream
  sendStreamChat: protectedProcedure
    .input(
      z.object({
        streamId: z.string(),
        message: z.string().min(1).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        messageId: `msg-${Date.now()}`,
        streamId: input.streamId,
        userId: ctx.user.id,
        userName: ctx.user.name,
        message: input.message,
        timestamp: new Date(),
      };
    }),

  // Get stream chat history
  getStreamChat: publicProcedure
    .input(z.object({ streamId: z.string(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      return [
        {
          messageId: "msg-1",
          userName: "User1",
          message: "Great stream!",
          timestamp: new Date(Date.now() - 60000),
        },
        {
          messageId: "msg-2",
          userName: "User2",
          message: "Love the content",
          timestamp: new Date(Date.now() - 30000),
        },
      ];
    }),

  // Join stream as viewer
  joinStream: publicProcedure
    .input(z.object({ streamId: z.string() }))
    .mutation(async ({ input }) => {
      return {
        streamId: input.streamId,
        viewerId: `viewer-${Date.now()}`,
        joined: true,
      };
    }),

  // Get stream details
  getStreamDetails: publicProcedure
    .input(z.object({ streamId: z.string() }))
    .query(async ({ input }) => {
      return {
        streamId: input.streamId,
        title: "Live Creative Session",
        description: "Join us for an exciting creative session",
        creatorName: "Alex Creator",
        creatorAvatar: "/avatars/creator-1.jpg",
        viewerCount: 234,
        startedAt: new Date(Date.now() - 3600000),
        isLive: true,
        rtcUrl: "wss://rtc.example.com/stream",
      };
    }),
};
