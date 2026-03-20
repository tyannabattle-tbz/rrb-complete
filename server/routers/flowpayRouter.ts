import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { FlowpayService } from '../services/flowpayService';
import { FlowpayPolicies } from '../qumus/flowpayPolicies';

export const flowpayRouter = router({
  /**
   * Initialize FlowPay for user
   */
  initialize: protectedProcedure
    .input(z.object({ name: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = await FlowpayService.initializeUser(ctx.user.id, ctx.user.email, input.name);
      return user;
    }),

  /**
   * Send Money
   */
  sendMoney: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        amountCents: z.number().positive(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check fraud
      const fraudCheck = await FlowpayPolicies.policyFraudDetection(
        ctx.user.id,
        input.recipientId,
        input.amountCents,
        input.metadata
      );

      if (fraudCheck.isFraudulent) {
        throw new Error(`Transaction blocked: fraud risk score ${fraudCheck.riskScore}`);
      }

      // Get smart route
      const routeDecision = await FlowpayPolicies.policySmartPaymentRouting(
        ctx.user.id,
        input.amountCents
      );

      // Send money
      const result = await FlowpayService.sendMoney(
        ctx.user.id,
        input.recipientId,
        input.amountCents,
        input.description,
        {
          ...input.metadata,
          recommendedMethod: routeDecision.recommendedMethod,
          confidence: routeDecision.confidence,
        }
      );

      return result;
    }),

  /**
   * Confirm Payment (after Stripe client-side confirmation)
   */
  confirmPayment: protectedProcedure
    .input(z.object({ paymentIntentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const transaction = await FlowpayService.confirmPayment(input.paymentIntentId);

      // Update smart route with success
      if (transaction) {
        await FlowpayService.updateSmartRoute(ctx.user.id, true, 2000); // Assume 2s processing
      }

      return transaction;
    }),

  /**
   * Create Payment Plan
   */
  createPaymentPlan: protectedProcedure
    .input(
      z.object({
        recipientId: z.number(),
        amountCents: z.number().positive(),
        frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'annual']),
        totalInstallments: z.number().optional(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get optimization recommendation
      const optimization = await FlowpayPolicies.policyPaymentPlanOptimization(
        ctx.user.id,
        input.amountCents * (input.totalInstallments || 12)
      );

      const plan = await FlowpayService.createPaymentPlan(
        ctx.user.id,
        input.recipientId,
        input.amountCents,
        input.frequency,
        input.totalInstallments,
        input.description,
        {
          ...input.metadata,
          optimization,
        }
      );

      return plan;
    }),

  /**
   * Get Smart Route
   */
  getSmartRoute: protectedProcedure.query(async ({ ctx }) => {
    return FlowpayService.getSmartRoute(ctx.user.id);
  }),

  /**
   * Get Transaction History
   */
  getTransactionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      return FlowpayService.getTransactionHistory(ctx.user.id, input.limit, input.offset);
    }),

  /**
   * Get Active Payment Plans
   */
  getActivePaymentPlans: protectedProcedure.query(async ({ ctx }) => {
    return FlowpayService.getActivePaymentPlans(ctx.user.id);
  }),

  /**
   * Create Payment Link (for sharing on social)
   */
  createPaymentLink: protectedProcedure
    .input(
      z.object({
        amountCents: z.number().positive(),
        description: z.string().optional(),
        expiresInHours: z.number().optional(),
        source: z.enum(['x', 'hybridcast', 'squadd', 'content_calendar']).optional(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Optimize for social platform
      if (input.source) {
        const socialOptimization = await FlowpayPolicies.policySocialMoneyTransfer(
          ctx.user.id,
          input.amountCents,
          input.source,
          input.metadata
        );

        return socialOptimization.link;
      }

      return FlowpayService.createPaymentLink(
        ctx.user.id,
        input.amountCents,
        input.description,
        input.expiresInHours,
        input.source,
        input.metadata
      );
    }),

  /**
   * Public: Process Payment Link
   */
  processPaymentLink: publicProcedure
    .input(
      z.object({
        linkId: z.string(),
        payerEmail: z.string().email(),
        payerName: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Lookup link and return payment details
      // In production, this would fetch from DB and prepare Stripe checkout
      return {
        linkId: input.linkId,
        status: 'ready',
        message: 'Link is valid, proceed to payment',
      };
    }),

  /**
   * QUMUS: Process Scheduled Charges
   */
  processScheduledCharges: protectedProcedure.mutation(async ({ ctx }) => {
    // Only allow QUMUS system to call this
    if (ctx.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }

    const result = await FlowpayPolicies.policyScheduledChargeProcessing();
    return result;
  }),

  /**
   * HybridCast: Create Incident Report
   */
  createHybridCastIncident: protectedProcedure
    .input(
      z.object({
        broadcastId: z.string(),
        broadcastTitle: z.string(),
        region: z.string(),
        coordinates: z.object({ lat: z.number(), lng: z.number() }),
        description: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { createIncidentReport } = await import('../services/hybridcastMonitoringIntegration');
      return createIncidentReport(
        input.broadcastId,
        input.broadcastTitle,
        input.region,
        input.coordinates,
        input.description
      );
    }),

  /**
   * HybridCast: Link Donation to Incident
   */
  linkDonationToIncident: protectedProcedure
    .input(
      z.object({
        incidentId: z.string(),
        donationAmount: z.number().positive(),
        donorName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { linkDonationToIncident } = await import('../services/hybridcastMonitoringIntegration');
      return linkDonationToIncident(input.incidentId, input.donationAmount, input.donorName);
    }),

  /**
   * HybridCast: Get Incident Statistics
   */
  getIncidentStats: publicProcedure
    .input(z.object({ region: z.string() }))
    .query(async ({ input }) => {
      const { getIncidentStats } = await import('../services/hybridcastMonitoringIntegration');
      return getIncidentStats(input.region);
    }),

  /**
   * HybridCast: Allocate Resources from Donations
   */
  allocateResourcesFromDonations: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        region: z.string(),
        resourceType: z.enum(['medical', 'food', 'water', 'shelter', 'communication']),
        donationAmount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { allocateResourcesFromDonations } = await import('../services/hybridcastMonitoringIntegration');
      return allocateResourcesFromDonations(
        input.campaignId,
        input.region,
        input.resourceType,
        input.donationAmount
      );
    }),

  /**
   * Get Dashboard Stats
   */
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    const transactions = await FlowpayService.getTransactionHistory(ctx.user.id, 100);
    const plans = await FlowpayService.getActivePaymentPlans(ctx.user.id);
    const route = await FlowpayService.getSmartRoute(ctx.user.id);

    const totalSent = transactions
      .filter((tx) => tx.senderId === ctx.user.id && tx.status === 'succeeded')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalReceived = transactions
      .filter((tx) => tx.recipientId === ctx.user.id && tx.status === 'succeeded')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const activePlans = plans.filter((p) => p.status === 'active').length;

    return {
      totalSent,
      totalReceived,
      activePlans,
      recentTransactions: transactions.slice(0, 10),
      smartRoute: route,
    };
  }),
});
