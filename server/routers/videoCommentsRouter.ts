import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";

export const videoCommentsRouter = router({
  /**
   * Add a comment to a video
   */
  addComment: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        content: z.string().min(1).max(500),
        parentCommentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, save to database
      const comment = {
        commentId: `comment-${Date.now()}`,
        videoId: input.videoId,
        userId: ctx.user.id,
        username: ctx.user.name || "Anonymous",
        content: input.content,
        createdAt: new Date(),
        likes: 0,
        replies: [],
        parentCommentId: input.parentCommentId,
      };

      return comment;
    }),

  /**
   * Get comments for a video
   */
  getComments: publicProcedure
    .input(
      z.object({
        videoId: z.string(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      // In production, query from database
      const mockComments = [
        {
          commentId: "comment-1",
          videoId: input.videoId,
          userId: "user-1",
          username: "VideoFan",
          content: "Amazing video! Love the cinematic quality.",
          createdAt: new Date(Date.now() - 3600000),
          likes: 42,
          replies: 3,
          parentCommentId: undefined,
        },
        {
          commentId: "comment-2",
          videoId: input.videoId,
          userId: "user-2",
          username: "CreativeVibes",
          content: "The color grading is absolutely stunning!",
          createdAt: new Date(Date.now() - 7200000),
          likes: 28,
          replies: 1,
          parentCommentId: undefined,
        },
      ];

      return mockComments.slice(input.offset, input.offset + input.limit);
    }),

  /**
   * Like/unlike a comment
   */
  toggleCommentLike: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
        liked: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, update database
      return {
        success: true,
        commentId: input.commentId,
        liked: input.liked,
      };
    }),

  /**
   * Delete a comment (owner only)
   */
  deleteComment: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In production, verify ownership and delete from database
      return { success: true };
    }),

  /**
   * Add a reaction to a video
   */
  addReaction: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        reactionType: z.enum(["like", "love", "wow", "haha", "sad"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // In production, save to database
      return {
        success: true,
        videoId: input.videoId,
        reactionType: input.reactionType,
      };
    }),

  /**
   * Get reactions for a video
   */
  getReactions: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      // In production, query from database
      return {
        like: 1234,
        love: 567,
        wow: 234,
        haha: 89,
        sad: 12,
      };
    }),

  /**
   * Get user's reaction to a video
   */
  getUserReaction: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ ctx, input }) => {
      // In production, query from database
      return null; // No reaction yet
    }),

  /**
   * Remove a reaction
   */
  removeReaction: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In production, delete from database
      return { success: true };
    }),
});
