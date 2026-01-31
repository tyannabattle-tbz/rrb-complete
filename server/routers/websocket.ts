import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

// In-memory WebSocket connections store
const wsConnections = new Map<number, Set<string>>();
const sessionSubscribers = new Map<number, Set<string>>();

export const websocketRouter = router({
  // Subscribe to session updates
  subscribeToSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .subscription(async function* ({ ctx, input }) {
      if (!ctx.user) throw new Error("Unauthorized");

      const userId = ctx.user.id.toString();
      
      if (!sessionSubscribers.has(input.sessionId)) {
        sessionSubscribers.set(input.sessionId, new Set());
      }
      
      const subscribers = sessionSubscribers.get(input.sessionId)!;
      subscribers.add(userId);

      try {
        // Yield initial subscription confirmation
        yield {
          type: "subscribed",
          sessionId: input.sessionId,
          userId: userId,
          timestamp: new Date(),
        };

        // Keep subscription alive
        await new Promise(() => {
          // This will keep the subscription open
        });
      } finally {
        subscribers.delete(userId);
        if (subscribers.size === 0) {
          sessionSubscribers.delete(input.sessionId);
        }
      }
    }),

  // Broadcast message to session subscribers
  broadcastMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        messageType: z.enum(["message", "typing", "presence", "update"]),
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const subscribers = sessionSubscribers.get(input.sessionId);
      if (!subscribers || subscribers.size === 0) {
        return { success: true, broadcastCount: 0 };
      }

      // In production, use a real WebSocket server or message queue
      return {
        success: true,
        broadcastCount: subscribers.size,
        message: {
          type: input.messageType,
          sessionId: input.sessionId,
          userId: ctx.user.id,
          data: input.data,
          timestamp: new Date(),
        },
      };
    }),

  // Get active connections for a session
  getActiveConnections: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const subscribers = sessionSubscribers.get(input.sessionId);
      return {
        sessionId: input.sessionId,
        activeConnections: subscribers ? subscribers.size : 0,
        users: subscribers ? Array.from(subscribers) : [],
      };
    }),

  // Send real-time notification
  sendNotification: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        title: z.string(),
        message: z.string(),
        type: z.enum(["info", "success", "warning", "error"]).default("info"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return {
        success: true,
        notification: {
          id: Math.random().toString(36).substr(2, 9),
          sessionId: input.sessionId,
          title: input.title,
          message: input.message,
          type: input.type,
          createdAt: new Date(),
          createdBy: ctx.user.id,
        },
      };
    }),

  // Stream agent execution updates
  streamAgentUpdates: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .subscription(async function* ({ ctx, input }) {
      if (!ctx.user) throw new Error("Unauthorized");

      // Yield initial connection
      yield {
        type: "connected",
        sessionId: input.sessionId,
        timestamp: new Date(),
      };

      // Simulate streaming updates (in production, connect to actual agent)
      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        yield {
          type: "update",
          sessionId: input.sessionId,
          step: i + 1,
          status: "processing",
          data: {
            progress: ((i + 1) / 5) * 100,
            message: `Processing step ${i + 1}...`,
          },
          timestamp: new Date(),
        };
      }

      yield {
        type: "completed",
        sessionId: input.sessionId,
        timestamp: new Date(),
      };
    }),

  // Get message history stream
  getMessageStream: protectedProcedure
    .input(z.object({ sessionId: z.number(), limit: z.number().default(50) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      return {
        sessionId: input.sessionId,
        messages: [],
        hasMore: false,
        limit: input.limit,
      };
    }),
});
