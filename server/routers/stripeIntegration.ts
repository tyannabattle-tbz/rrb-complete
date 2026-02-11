/**
 * Stripe Integration Router — DONATIONS ONLY
 * 
 * All payment processing is limited to donations in support of
 * Sweet Miracles Foundation legacy recovery efforts.
 * 
 * For studio services, production packages, and advertising pricing,
 * contact Canryn Production directly.
 */
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const stripeIntegrationRouter = router({
  // Get donation info — public endpoint
  getDonationInfo: publicProcedure
    .query(async () => {
      return {
        acceptingDonations: true,
        organization: 'Sweet Miracles Foundation',
        taxStatus: '501(c)(3) / 508(c) Nonprofit',
        mission: 'Voice for the Voiceless — Legacy Recovery & Community Empowerment',
        donationUrl: '/donate',
        contactForServices: {
          message: 'For studio services, production packages, and advertising pricing, contact Canryn Production directly.',
          email: 'contact@canrynproduction.com',
          phone: 'Contact through website',
        },
      };
    }),

  // Get subscription status — returns community member status
  getSubscriptionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return {
        tier: "community",
        description: "Community Member — All platform features are available",
        donationStatus: "Donations support Sweet Miracles Foundation legacy recovery",
        renewalDate: null,
        status: "active",
        note: "This platform is supported by donations. For studio services and production packages, contact Canryn Production.",
      };
    }),

  // Get pricing info — community access is free, services contact Canryn
  getPricingPlans: publicProcedure
    .query(async () => {
      return {
        plans: [
          {
            id: "community",
            name: "Community Access",
            price: 0,
            description: "Full platform access — supported by donations",
            features: [
              "Full access to all platform features",
              "RRB Radio streaming",
              "HybridCast emergency broadcasting",
              "Solbones dice game",
              "Meditation & healing frequencies",
              "Community features",
            ],
          },
        ],
        donationNote: "Support the mission by donating to Sweet Miracles Foundation",
        servicesNote: "For studio services, production packages, and advertising, contact Canryn Production for pricing",
      };
    }),

  // Get donation/invoice history
  getInvoiceHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      return {
        invoices: [],
        note: "Donation receipts are provided via email through Stripe. For questions, contact Sweet Miracles Foundation.",
      };
    }),
});
