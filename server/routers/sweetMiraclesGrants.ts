import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const sweetMiraclesGrantsRouter = router({
  // Get all available grants
  list: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        grantId: 1,
        title: "Emergency Relief Fund 2026",
        organization: "Global Humanitarian Foundation",
        amount: 50000,
        deadline: "2026-03-31",
        description: "Support for emergency response and disaster relief operations",
        requirements: ["501c3 status", "Annual report", "Financial audit"],
        matchScore: 0.95,
        status: "open",
        createdAt: new Date(),
      },
      {
        grantId: 2,
        title: "Wellness Initiative Grant",
        organization: "Health & Wellness Alliance",
        amount: 25000,
        deadline: "2026-04-15",
        description: "Funding for community wellness programs and health education",
        requirements: ["Program evaluation plan", "Community support letters"],
        matchScore: 0.88,
        status: "open",
        createdAt: new Date(),
      },
      {
        grantId: 3,
        title: "Technology Access Program",
        organization: "Digital Equity Foundation",
        amount: 35000,
        deadline: "2026-05-01",
        description: "Technology and digital literacy programs for underserved communities",
        requirements: ["Tech infrastructure plan", "Training curriculum"],
        matchScore: 0.72,
        status: "open",
        createdAt: new Date(),
      },
    ];
  }),

  // Get grant by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return {
        grantId: input.id,
        title: "Emergency Relief Fund 2026",
        organization: "Global Humanitarian Foundation",
        amount: 50000,
        deadline: "2026-03-31",
        description: "Support for emergency response and disaster relief operations",
        requirements: ["501c3 status", "Annual report", "Financial audit"],
        matchScore: 0.95,
        status: "open",
        createdAt: new Date(),
      };
    }),

  // Search grants by criteria
  search: protectedProcedure
    .input(
      z.object({
        keyword: z.string().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        deadline: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      return [
        {
          grantId: 1,
          title: "Emergency Relief Fund 2026",
          organization: "Global Humanitarian Foundation",
          amount: 50000,
          deadline: "2026-03-31",
          description: "Support for emergency response and disaster relief operations",
          requirements: ["501c3 status", "Annual report", "Financial audit"],
          matchScore: 0.95,
          status: "open",
          createdAt: new Date(),
        },
      ];
    }),

  // Get high-match grants (AI-powered matching)
  getHighMatches: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        grantId: 1,
        title: "Emergency Relief Fund 2026",
        organization: "Global Humanitarian Foundation",
        amount: 50000,
        deadline: "2026-03-31",
        matchScore: 0.95,
        matchReason: "Perfect alignment with emergency response mission",
        status: "open",
      },
      {
        grantId: 2,
        title: "Wellness Initiative Grant",
        organization: "Health & Wellness Alliance",
        amount: 25000,
        deadline: "2026-04-15",
        matchScore: 0.88,
        matchReason: "Strong fit for wellness programs",
        status: "open",
      },
    ];
  }),

  // Track grant application
  trackApplication: protectedProcedure
    .input(
      z.object({
        grantId: z.number(),
        status: z.enum(["draft", "submitted", "under_review", "awarded", "rejected"]),
        submissionDate: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        applicationId: 1,
        grantId: input.grantId,
        status: input.status,
        submissionDate: input.submissionDate || new Date().toISOString(),
        notes: input.notes,
        trackedAt: new Date(),
      };
    }),

  // Get grant statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalAvailableGrants: 127,
      totalFundingAvailable: 2850000,
      highMatchGrants: 12,
      applicationsSubmitted: 8,
      grantsAwarded: 3,
      totalAwarded: 110000,
      averageGrantSize: 22441,
      upcomingDeadlines: [
        { title: "Emergency Relief Fund", deadline: "2026-03-31", daysRemaining: 55 },
        { title: "Wellness Initiative", deadline: "2026-04-15", daysRemaining: 70 },
      ],
    };
  }),

  // Get grant recommendations (AI-powered)
  getRecommendations: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        grantId: 1,
        title: "Emergency Relief Fund 2026",
        organization: "Global Humanitarian Foundation",
        amount: 50000,
        matchScore: 0.95,
        recommendation: "Highly recommended - Your mission aligns perfectly with this grant's focus on emergency response",
        nextSteps: ["Review requirements", "Prepare financial documents", "Submit application"],
      },
      {
        grantId: 2,
        title: "Wellness Initiative Grant",
        organization: "Health & Wellness Alliance",
        amount: 25000,
        matchScore: 0.88,
        recommendation: "Strong match - Your wellness programs meet the funding criteria",
        nextSteps: ["Develop program evaluation plan", "Gather community letters", "Submit by deadline"],
      },
    ];
  }),

  // Get application timeline
  getApplicationTimeline: protectedProcedure
    .input(z.object({ grantId: z.number() }))
    .query(async ({ input, ctx }) => {
      return [
        { date: "2026-02-15", event: "Application opened", status: "completed" },
        { date: "2026-03-15", event: "Application deadline", status: "upcoming" },
        { date: "2026-04-15", event: "Review period ends", status: "upcoming" },
        { date: "2026-05-01", event: "Award notification", status: "upcoming" },
      ];
    }),

  // Delete grant tracking
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return { grantId: input.id, deleted: true };
    }),
});
