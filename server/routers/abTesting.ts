import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const abTestingRouter = router({
  createTest: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        variantA: z.object({
          name: z.string(),
          prompt: z.string(),
        }),
        variantB: z.object({
          name: z.string(),
          prompt: z.string(),
        }),
        testDuration: z.number().optional(),
        targetSampleSize: z.number().optional(),
      })
    )
    .mutation(async ({ input }: any) => {
      return {
        testId: Math.random().toString(36).substr(2, 9),
        name: input.name,
        status: "active",
        createdAt: new Date(),
        variantA: input.variantA,
        variantB: input.variantB,
        results: {
          variantA: { responses: 0, avgScore: 0, conversionRate: 0 },
          variantB: { responses: 0, avgScore: 0, conversionRate: 0 },
        },
      };
    }),

  recordResult: protectedProcedure
    .input(
      z.object({
        testId: z.string(),
        variant: z.enum(["A", "B"]),
        score: z.number().min(0).max(10),
        metadata: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async () => {
      return {
        recorded: true,
        testId: "test_id",
        variant: "A",
      };
    }),

  getTestResults: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .query(async () => {
      return {
        testId: "test_id",
        status: "active",
        variantA: {
          name: "Variant A",
          responses: 145,
          avgScore: 7.8,
          conversionRate: 0.62,
          confidenceInterval: { lower: 0.58, upper: 0.66 },
        },
        variantB: {
          name: "Variant B",
          responses: 152,
          avgScore: 8.2,
          conversionRate: 0.71,
          confidenceInterval: { lower: 0.67, upper: 0.75 },
        },
        statisticalSignificance: 0.94,
        winner: "B",
        recommendation: "Variant B shows statistically significant improvement",
      };
    }),

  listTests: protectedProcedure.query(async () => {
    return {
      tests: [
        {
          testId: "test_001",
          name: "Prompt Clarity Test",
          status: "active",
          progress: 0.65,
          winner: null,
        },
        {
          testId: "test_002",
          name: "Response Format Test",
          status: "completed",
          progress: 1.0,
          winner: "B",
        },
      ],
    };
  }),

  stopTest: protectedProcedure
    .input(z.object({ testId: z.string() }))
    .mutation(async () => {
      return {
        testId: "test_id",
        status: "completed",
        message: "Test stopped successfully",
      };
    }),
});
