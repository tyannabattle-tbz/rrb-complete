/**
 * Review & Rating Router
 * Handles user reviews, ratings, and community feedback
 */

import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import * as dbHelpers from "../db-helpers";
import { TRPCError } from "@trpc/server";

export const reviewRouter = router({
  // Create a new review
  createReview: protectedProcedure
    .input(z.object({
      rating: z.number().min(1).max(5),
      title: z.string().min(5).max(255),
      content: z.string().min(10),
      category: z.enum([
        "content_quality",
        "user_experience",
        "platform_features",
        "customer_support",
        "general",
      ]).default("general"),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const result = await dbHelpers.createReview(
        ctx.user.id,
        input.rating,
        input.title,
        input.content,
        input.category
      );

      return { success: true, reviewId: result.insertId };
    }),

  // Get all approved reviews
  getReviews: publicProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
      category: z.string().optional(),
      sortBy: z.enum(["recent", "helpful", "rating"]).default("recent"),
    }))
    .query(async ({ input }) => {
      if (input.category) {
        return dbHelpers.getReviewsByCategory(input.category, input.limit);
      }
      return dbHelpers.getReviews(input.limit, input.offset);
    }),

  // Get single review with responses
  getReview: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      const review = await dbHelpers.getReviewById(input);
      if (review.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const responses = await dbHelpers.getReviewResponses(input);
      const helpfulness = await dbHelpers.getReviewHelpfulnessStats(input);

      return {
        ...review[0],
        responses,
        helpfulness,
      };
    }),

  // Mark review as helpful/not helpful
  markHelpful: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
      isHelpful: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await dbHelpers.recordReviewHelpfulness(
        input.reviewId,
        ctx.user.id,
        input.isHelpful
      );

      return { success: true };
    }),

  // Add response to review (admin/owner only)
  addResponse: protectedProcedure
    .input(z.object({
      reviewId: z.number(),
      response: z.string().min(10),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Check if user is admin or review owner
      const review = await dbHelpers.getReviewById(input.reviewId);
      if (review.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      if (review[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await dbHelpers.addReviewResponse(
        input.reviewId,
        ctx.user.id,
        input.response
      );

      return { success: true };
    }),

  // Get average rating and review count
  getStats: publicProcedure.query(async () => {
    return dbHelpers.getAverageRating();
  }),

  // Get reviews by category with stats
  getByCategory: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      return dbHelpers.getReviewsByCategory(input, 20);
    }),

  // Get user's own reviews
  getMyReviews: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    // This would need a helper function to get reviews by userId
    // For now, return empty array
    return [];
  }),
});

export type ReviewRouter = typeof reviewRouter;
