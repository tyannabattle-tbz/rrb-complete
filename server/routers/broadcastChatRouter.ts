import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

// In-memory storage for chat messages (in production, use database)
const chatMessages: Array<{
  id: string;
  broadcastId: string;
  user: string;
  message: string;
  timestamp: Date;
  avatar: string;
}> = [
  {
    id: '1',
    broadcastId: 'live-1',
    user: 'StreamHost',
    message: '🎙️ Welcome to the live broadcast! Feel free to join the conversation.',
    timestamp: new Date(Date.now() - 5 * 60000),
    avatar: '🎙️',
  },
  {
    id: '2',
    broadcastId: 'live-1',
    user: 'Listener_42',
    message: 'Great energy today! Love the frequency tuning feature.',
    timestamp: new Date(Date.now() - 3 * 60000),
    avatar: '👤',
  },
  {
    id: '3',
    broadcastId: 'live-1',
    user: 'MusicLover',
    message: '432 Hz is my favorite! The healing frequency is amazing.',
    timestamp: new Date(Date.now() - 1 * 60000),
    avatar: '🎵',
  },
];

// Track active viewers per broadcast
const viewerCounts: Record<string, number> = {
  'live-1': 127,
};

export const broadcastChatRouter = router({
  // Get all messages for a broadcast
  getMessages: publicProcedure
    .input(z.object({ broadcastId: z.string() }))
    .query(async ({ input }) => {
      const messages = chatMessages.filter((msg) => msg.broadcastId === input.broadcastId);
      return {
        success: true,
        data: messages,
      };
    }),

  // Send a message to broadcast chat
  sendMessage: protectedProcedure
    .input(
      z.object({
        broadcastId: z.string(),
        user: z.string(),
        message: z.string().min(1).max(500),
        avatar: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newMessage = {
        id: Date.now().toString(),
        broadcastId: input.broadcastId,
        user: input.user,
        message: input.message,
        timestamp: new Date(),
        avatar: input.avatar || '👤',
      };

      chatMessages.push(newMessage);

      // Keep only last 100 messages per broadcast to save memory
      const broadcastMessages = chatMessages.filter((msg) => msg.broadcastId === input.broadcastId);
      if (broadcastMessages.length > 100) {
        const oldestIndex = chatMessages.findIndex(
          (msg) => msg.id === broadcastMessages[0].id
        );
        if (oldestIndex !== -1) {
          chatMessages.splice(oldestIndex, 1);
        }
      }

      return {
        success: true,
        data: newMessage,
      };
    }),

  // Delete a message
  deleteMessage: protectedProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const index = chatMessages.findIndex((msg) => msg.id === input.messageId);
      if (index === -1) {
        return { success: false, error: 'Message not found' };
      }

      chatMessages.splice(index, 1);
      return { success: true, message: 'Message deleted' };
    }),

  // Get viewer count for a broadcast
  getViewerCount: publicProcedure
    .input(z.object({ broadcastId: z.string() }))
    .query(async ({ input }) => {
      const count = viewerCounts[input.broadcastId] || 0;
      return {
        success: true,
        data: { broadcastId: input.broadcastId, viewers: count },
      };
    }),

  // Update viewer count (called by broadcast page)
  updateViewerCount: publicProcedure
    .input(z.object({ broadcastId: z.string(), delta: z.number().int() }))
    .mutation(async ({ input }) => {
      if (!viewerCounts[input.broadcastId]) {
        viewerCounts[input.broadcastId] = 0;
      }

      viewerCounts[input.broadcastId] = Math.max(0, viewerCounts[input.broadcastId] + input.delta);

      return {
        success: true,
        data: { viewers: viewerCounts[input.broadcastId] },
      };
    }),

  // Get chat statistics for a broadcast
  getChatStats: publicProcedure
    .input(z.object({ broadcastId: z.string() }))
    .query(async ({ input }) => {
      const messages = chatMessages.filter((msg) => msg.broadcastId === input.broadcastId);
      const uniqueUsers = new Set(messages.map((msg) => msg.user)).size;

      return {
        success: true,
        data: {
          totalMessages: messages.length,
          uniqueUsers,
          viewers: viewerCounts[input.broadcastId] || 0,
          messageRate: messages.length > 0 ? (messages.length / (Date.now() - messages[0].timestamp.getTime())) * 60000 : 0,
        },
      };
    }),

  // Clear all messages for a broadcast (admin only)
  clearMessages: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const initialLength = chatMessages.length;
      const filtered = chatMessages.filter((msg) => msg.broadcastId !== input.broadcastId);
      chatMessages.length = 0;
      chatMessages.push(...filtered);

      return {
        success: true,
        data: { clearedCount: initialLength - chatMessages.length },
      };
    }),

  // Get recent messages (for pagination)
  getRecentMessages: publicProcedure
    .input(z.object({ broadcastId: z.string(), limit: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ input }) => {
      const messages = chatMessages
        .filter((msg) => msg.broadcastId === input.broadcastId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, input.limit)
        .reverse();

      return {
        success: true,
        data: messages,
      };
    }),

  // Search messages
  searchMessages: publicProcedure
    .input(z.object({ broadcastId: z.string(), query: z.string().min(1) }))
    .query(async ({ input }) => {
      const searchTerm = input.query.toLowerCase();
      const results = chatMessages.filter(
        (msg) =>
          msg.broadcastId === input.broadcastId &&
          (msg.message.toLowerCase().includes(searchTerm) || msg.user.toLowerCase().includes(searchTerm))
      );

      return {
        success: true,
        data: results,
      };
    }),

  // Get active broadcasts
  getActiveBroadcasts: publicProcedure.query(async () => {
    const broadcasts = Object.keys(viewerCounts).map((broadcastId) => ({
      broadcastId,
      viewers: viewerCounts[broadcastId],
      messageCount: chatMessages.filter((msg) => msg.broadcastId === broadcastId).length,
    }));

    return {
      success: true,
      data: broadcasts,
    };
  }),
});
