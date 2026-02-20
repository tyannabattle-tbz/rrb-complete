/**
 * Video Chat tRPC Router
 * Real-time comment procedures
 * A Canryn Production
 */
import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { videoChatService } from '../services/video-chat-service';

export const videoChatRouter = router({
  // Get all messages for a video
  getMessages: publicProcedure
    .input(z.object({ videoId: z.string(), limit: z.number().default(50) }))
    .query(({ input }) => {
      return videoChatService.getMessages(input.videoId, input.limit);
    }),

  // Add a new message
  addMessage: publicProcedure
    .input(z.object({
      videoId: z.string(),
      userId: z.string(),
      userName: z.string(),
      userAvatar: z.string().optional(),
      content: z.string().min(1).max(500),
    }))
    .mutation(({ input }) => {
      return videoChatService.addMessage(input.videoId, {
        userId: input.userId,
        userName: input.userName,
        userAvatar: input.userAvatar,
        content: input.content,
        videoId: input.videoId,
      });
    }),

  // Like a message
  likeMessage: publicProcedure
    .input(z.object({ videoId: z.string(), messageId: z.string() }))
    .mutation(({ input }) => {
      return videoChatService.likeMessage(input.videoId, input.messageId);
    }),

  // Reply to a message
  replyToMessage: publicProcedure
    .input(z.object({
      videoId: z.string(),
      messageId: z.string(),
      userId: z.string(),
      userName: z.string(),
      content: z.string().min(1).max(500),
    }))
    .mutation(({ input }) => {
      return videoChatService.replyToMessage(input.videoId, input.messageId, {
        userId: input.userId,
        userName: input.userName,
        content: input.content,
        videoId: input.videoId,
      });
    }),

  // Get active users
  getActiveUsers: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(({ input }) => {
      return videoChatService.getActiveUsers(input.videoId);
    }),

  // Update active users
  updateActiveUsers: publicProcedure
    .input(z.object({ videoId: z.string(), count: z.number() }))
    .mutation(({ input }) => {
      videoChatService.updateActiveUsers(input.videoId, input.count);
      return { success: true };
    }),

  // Delete message
  deleteMessage: publicProcedure
    .input(z.object({ videoId: z.string(), messageId: z.string() }))
    .mutation(({ input }) => {
      const success = videoChatService.deleteMessage(input.videoId, input.messageId);
      return { success };
    }),

  // Search messages
  searchMessages: publicProcedure
    .input(z.object({ videoId: z.string(), query: z.string() }))
    .query(({ input }) => {
      return videoChatService.searchMessages(input.videoId, input.query);
    }),

  // Get statistics
  getStatistics: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(({ input }) => {
      return videoChatService.getStatistics(input.videoId);
    }),
});
