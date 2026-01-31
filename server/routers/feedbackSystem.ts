import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const feedbackSystemRouter = router({
  // Submit feedback
  submitFeedback: protectedProcedure
    .input(
      z.object({
        type: z.enum(["bug", "feature", "improvement", "other"]),
        title: z.string(),
        description: z.string(),
        email: z.string().email().optional(),
        attachments: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Thank you for your feedback!",
        feedbackId: Math.random().toString(36).substr(2, 9),
      };
    }),

  // Get feedback status
  getFeedbackStatus: protectedProcedure
    .input(z.object({ feedbackId: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        feedbackId: input.feedbackId,
        status: "received",
        createdAt: new Date(),
        message: "Your feedback has been received and will be reviewed soon.",
      };
    }),

  // Get user feedback history
  getFeedbackHistory: protectedProcedure.query(async ({ ctx }) => {
    return {
      feedback: [
        {
          id: "1",
          type: "feature",
          title: "Sample feedback",
          status: "received",
          createdAt: new Date(),
        },
      ],
    };
  }),

  // Rate feature
  rateFeature: protectedProcedure
    .input(
      z.object({
        featureName: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Thank you for rating!" };
    }),

  // Get feature ratings
  getFeatureRatings: protectedProcedure
    .input(z.object({ featureName: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        featureName: input.featureName,
        averageRating: 4.5,
        totalRatings: 42,
        distribution: {
          5: 25,
          4: 12,
          3: 3,
          2: 1,
          1: 1,
        },
      };
    }),
});
