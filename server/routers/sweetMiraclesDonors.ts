import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const sweetMiraclesDonorsRouter = router({
  // Create new donor
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
        phone: z.string().optional(),
        donorTier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { donorTier, ...rest } = input;
      return {
        donorId: 1,
        ...rest,
        donationHistory: [],
        totalDonated: 0,
        donorTier: input.donorTier || "bronze",
        status: "active",
        createdAt: new Date(),
      };
    }),

  // Get all donors
  list: protectedProcedure.query(async ({ ctx }) => {
    return [
      {
        donorId: 1,
        name: "John Donor",
        email: "john@example.com",
        phone: "+1-555-0001",
        donationHistory: [
          { amount: 500, date: "2026-01-15", campaign: "Emergency Relief" },
          { amount: 250, date: "2026-02-01", campaign: "Wellness Program" },
        ],
        totalDonated: 750,
        donorTier: "gold",
        status: "active",
        createdAt: new Date("2025-01-01"),
      },
      {
        donorId: 2,
        name: "Jane Supporter",
        email: "jane@example.com",
        phone: "+1-555-0002",
        donationHistory: [
          { amount: 1000, date: "2026-01-20", campaign: "Major Initiative" },
        ],
        totalDonated: 1000,
        donorTier: "platinum",
        status: "active",
        createdAt: new Date("2025-06-01"),
      },
    ];
  }),

  // Get donor by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      return {
        donorId: input.id,
        name: "John Donor",
        email: "john@example.com",
        phone: "+1-555-0001",
        donationHistory: [
          { amount: 500, date: "2026-01-15", campaign: "Emergency Relief" },
        ],
        totalDonated: 750,
        donorTier: "gold",
        status: "active",
        createdAt: new Date(),
      };
    }),

  // Record donation
  recordDonation: protectedProcedure
    .input(
      z.object({
        donorId: z.number(),
        amount: z.number().positive(),
        campaign: z.string(),
        paymentMethod: z.enum(["credit_card", "bank_transfer", "check", "crypto"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        donationId: 1,
        donorId: input.donorId,
        amount: input.amount,
        campaign: input.campaign,
        paymentMethod: input.paymentMethod,
        status: "completed",
        transactionId: `TXN-${Date.now()}`,
        processedAt: new Date(),
      };
    }),

  // Get donor statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return {
      totalDonors: 156,
      activeDonors: 142,
      totalRaised: 125750,
      averageDonation: 805,
      topDonor: { name: "Jane Supporter", amount: 5000 },
      donorsByTier: {
        bronze: 45,
        silver: 52,
        gold: 38,
        platinum: 21,
      },
      monthlyTrend: [
        { month: "Jan", amount: 15000 },
        { month: "Feb", amount: 18500 },
      ],
    };
  }),

  // Get donors by tier
  getByTier: protectedProcedure
    .input(z.object({ tier: z.enum(["bronze", "silver", "gold", "platinum"]) }))
    .query(async ({ input, ctx }) => {
      return [
        {
          donorId: 1,
          name: "Donor Name",
          email: "donor@example.com",
          totalDonated: 1000,
          donorTier: input.tier,
          status: "active",
          createdAt: new Date(),
        },
      ];
    }),

  // Update donor information
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        donorTier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;
      return { id, ...rest, updated: true };
    }),

  // Send donor communication
  sendCommunication: protectedProcedure
    .input(
      z.object({
        donorId: z.number(),
        type: z.enum(["thank_you", "update", "campaign", "survey"]),
        subject: z.string(),
        message: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return {
        communicationId: 1,
        donorId: input.donorId,
        type: input.type,
        subject: input.subject,
        sentAt: new Date(),
        status: "sent",
      };
    }),

  // Get donation history
  getDonationHistory: protectedProcedure
    .input(z.object({ donorId: z.number() }))
    .query(async ({ input, ctx }) => {
      return [
        {
          donationId: 1,
          amount: 500,
          date: "2026-01-15",
          campaign: "Emergency Relief",
          paymentMethod: "credit_card",
          status: "completed",
        },
        {
          donationId: 2,
          amount: 250,
          date: "2026-02-01",
          campaign: "Wellness Program",
          paymentMethod: "bank_transfer",
          status: "completed",
        },
      ];
    }),

  // Delete donor
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      return { donorId: input.id, deleted: true };
    }),
});
