import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

// Mock data for broadcasts
const BROADCASTS = [
  {
    id: '1',
    title: 'Tech Conference 2026 - Opening Keynote',
    broadcaster: 'Tech Summit',
    viewers: 5234,
    duration: '1:00:00',
    status: 'archived' as const,
    quality: '4K',
    uploadedAt: '2026-02-04',
  },
  {
    id: '2',
    title: 'Live Coding Session - Building Accessible Apps',
    broadcaster: 'Dev Academy',
    viewers: 3421,
    duration: '2:00:00',
    status: 'archived' as const,
    quality: '1080p',
    uploadedAt: '2026-02-05',
  },
  {
    id: '3',
    title: 'Business Networking Event - London',
    broadcaster: 'Business Network',
    viewers: 2156,
    duration: '1:30:00',
    status: 'archived' as const,
    quality: '720p',
    uploadedAt: '2026-02-03',
  },
];

const CHAT_ROOMS = [
  {
    id: 'ny',
    location: 'New York',
    members: 12,
    messages: 234,
    flaggedMessages: 2,
    status: 'active' as const,
  },
  {
    id: 'london',
    location: 'London',
    members: 8,
    messages: 156,
    flaggedMessages: 1,
    status: 'active' as const,
  },
  {
    id: 'tokyo',
    location: 'Tokyo',
    members: 15,
    messages: 412,
    flaggedMessages: 5,
    status: 'active' as const,
  },
];

const FLAGGED_CONTENT = [
  {
    id: '1',
    type: 'message' as const,
    content: 'Inappropriate language in New York chat',
    reporter: 'Alice Johnson',
    reason: 'Profanity',
    status: 'pending' as const,
    flaggedAt: '2026-02-06 10:30',
  },
  {
    id: '2',
    type: 'user' as const,
    content: 'User spamming links',
    reporter: 'Bob Smith',
    reason: 'Spam',
    status: 'reviewed' as const,
    flaggedAt: '2026-02-05 14:15',
  },
];

export const broadcastRouter = router({
  // Get all broadcasts
  getBroadcasts: protectedProcedure.query(async () => {
    return {
      success: true,
      data: BROADCASTS,
    };
  }),

  // Get broadcast details
  getBroadcast: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const broadcast = BROADCASTS.find((b) => b.id === input.id);
      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }
      return { success: true, data: broadcast };
    }),

  // Delete broadcast
  deleteBroadcast: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const index = BROADCASTS.findIndex((b) => b.id === input.id);
      if (index === -1) {
        return { success: false, error: 'Broadcast not found' };
      }
      BROADCASTS.splice(index, 1);
      return { success: true, message: 'Broadcast deleted' };
    }),

  // Get chat rooms
  getChatRooms: protectedProcedure.query(async () => {
    return {
      success: true,
      data: CHAT_ROOMS,
    };
  }),

  // Get chat room details
  getChatRoom: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const room = CHAT_ROOMS.find((r) => r.id === input.id);
      if (!room) {
        return { success: false, error: 'Chat room not found' };
      }
      return { success: true, data: room };
    }),

  // Get flagged content
  getFlaggedContent: protectedProcedure.query(async () => {
    return {
      success: true,
      data: FLAGGED_CONTENT,
    };
  }),

  // Resolve flagged content
  resolveFlaggedContent: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const content = FLAGGED_CONTENT.find((c) => c.id === input.id);
      if (!content) {
        return { success: false, error: 'Flagged content not found' };
      }
      content.status = 'resolved';
      return { success: true, message: 'Content resolved' };
    }),

  // Get broadcast analytics
  getBroadcastAnalytics: protectedProcedure.query(async () => {
    return {
      success: true,
      data: {
        totalBroadcasts: BROADCASTS.length,
        totalViewers: BROADCASTS.reduce((sum, b) => sum + b.viewers, 0),
        averageViewers: Math.round(
          BROADCASTS.reduce((sum, b) => sum + b.viewers, 0) / BROADCASTS.length
        ),
        topBroadcast: BROADCASTS.reduce((prev, current) =>
          prev.viewers > current.viewers ? prev : current
        ),
      },
    };
  }),

  // Get moderation stats
  getModerationStats: protectedProcedure.query(async () => {
    const pending = FLAGGED_CONTENT.filter((c) => c.status === 'pending').length;
    const reviewed = FLAGGED_CONTENT.filter((c) => c.status === 'reviewed').length;
    const resolved = FLAGGED_CONTENT.filter((c) => c.status === 'resolved').length;

    return {
      success: true,
      data: {
        totalFlagged: FLAGGED_CONTENT.length,
        pending,
        reviewed,
        resolved,
        pendingPercentage: Math.round((pending / FLAGGED_CONTENT.length) * 100),
      },
    };
  }),

  // Get chat room analytics
  getChatRoomAnalytics: protectedProcedure.query(async () => {
    const totalMembers = CHAT_ROOMS.reduce((sum, r) => sum + r.members, 0);
    const totalMessages = CHAT_ROOMS.reduce((sum, r) => sum + r.messages, 0);
    const totalFlagged = CHAT_ROOMS.reduce((sum, r) => sum + r.flaggedMessages, 0);

    return {
      success: true,
      data: {
        totalRooms: CHAT_ROOMS.length,
        totalMembers,
        totalMessages,
        totalFlagged,
        averageMembersPerRoom: Math.round(totalMembers / CHAT_ROOMS.length),
        averageMessagesPerRoom: Math.round(totalMessages / CHAT_ROOMS.length),
      },
    };
  }),
});
