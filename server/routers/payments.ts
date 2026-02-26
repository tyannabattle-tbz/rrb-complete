import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { executePolicies, PolicyContext, requiresHumanReview, getAverageConfidence } from '../qumusPolicies';
// Database and email service imports handled within procedures

export const paymentsRouter = router({
  /**
   * Process a payment with full policy evaluation
   */
  processPayment: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
        currency: z.string().default('USD'),
        paymentMethod: z.string(),
        description: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const policyContext: PolicyContext = {
        userId: ctx.user.id,
        action: 'process_payment',
        data: {
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          ipAddress: ctx.req?.ip || 'unknown',
        },
        metadata: input.metadata,
      };

      // Execute all 7 policies
      const decisions = await executePolicies(policyContext);
      const avgConfidence = getAverageConfidence(decisions);
      const needsReview = requiresHumanReview(decisions);

      // Log policy decisions
      await db.insert('policy_decisions').values({
        userId: ctx.user.id,
        action: 'process_payment',
        decisions: JSON.stringify(decisions),
        averageConfidence: avgConfidence,
        requiresHumanReview: needsReview,
        timestamp: new Date(),
      });

      // Check if all policies approve
      const allApproved = decisions.every((d) => d.decision === 'approve');

      if (!allApproved && !needsReview) {
        return {
          success: false,
          error: 'Payment rejected by policy evaluation',
          policyDecisions: decisions,
        };
      }

      if (needsReview) {
        // Create human review task
        await db.insert('human_review_queue').values({
          userId: ctx.user.id,
          type: 'payment_review',
          data: JSON.stringify({ amount: input.amount, decisions }),
          status: 'pending',
          createdAt: new Date(),
        });

        return {
          success: false,
          requiresReview: true,
          message: 'Payment requires human review',
          policyDecisions: decisions,
        };
      }

      // Process payment with Stripe
      try {
        const paymentIntent = await processStripePayment(input.amount, input.currency, {
          userId: ctx.user.id,
          description: input.description,
        });

        // Record payment
        const payment = await db.insert('payments').values({
          userId: ctx.user.id,
          amount: input.amount,
          currency: input.currency,
          paymentMethod: input.paymentMethod,
          stripePaymentIntentId: paymentIntent.id,
          status: 'succeeded',
          description: input.description,
          createdAt: new Date(),
        });

        // Send confirmation email
        await emailService.sendPaymentConfirmation(ctx.user.email, {
          amount: input.amount,
          currency: input.currency,
          description: input.description,
          transactionId: paymentIntent.id,
        });

        // Log audit trail
        await db.insert('audit_logs').values({
          userId: ctx.user.id,
          action: 'payment_processed',
          details: JSON.stringify({
            amount: input.amount,
            paymentIntentId: paymentIntent.id,
            policyConfidence: avgConfidence,
          }),
          timestamp: new Date(),
          ipAddress: ctx.req?.ip || 'unknown',
        });

        return {
          success: true,
          paymentId: payment.insertId,
          transactionId: paymentIntent.id,
          policyConfidence: avgConfidence,
        };
      } catch (error) {
        return {
          success: false,
          error: `Payment processing failed: ${error}`,
        };
      }
    }),

  /**
   * Create a subscription with policy evaluation
   */
  createSubscription: protectedProcedure
    .input(
      z.object({
        tier: z.enum(['free', 'ar_pro', 'voice_training', 'enterprise']),
        billingCycle: z.enum(['monthly', 'yearly']).default('monthly'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tierPricing = {
        free: 0,
        ar_pro: 99,
        voice_training: 49,
        enterprise: 299,
      };

      const amount = tierPricing[input.tier];

      const policyContext: PolicyContext = {
        userId: ctx.user.id,
        action: 'create_subscription',
        data: {
          tier: input.tier,
          amount,
          billingCycle: input.billingCycle,
          ipAddress: ctx.req?.ip || 'unknown',
        },
      };

      // Execute policies
      const decisions = await executePolicies(policyContext);
      const avgConfidence = getAverageConfidence(decisions);

      // Log decisions
      await db.insert('policy_decisions').values({
        userId: ctx.user.id,
        action: 'create_subscription',
        decisions: JSON.stringify(decisions),
        averageConfidence: avgConfidence,
        requiresHumanReview: requiresHumanReview(decisions),
        timestamp: new Date(),
      });

      if (amount > 0) {
        // Process payment for paid tiers
        try {
          const paymentIntent = await processStripePayment(amount, 'USD', {
            userId: ctx.user.id,
            description: `${input.tier} subscription (${input.billingCycle})`,
          });

          // Create subscription
          const subscription = await db.insert('subscriptions').values({
            userId: ctx.user.id,
            tier: input.tier,
            status: 'active',
            billingCycle: input.billingCycle,
            amount,
            stripeSubscriptionId: paymentIntent.id,
            startDate: new Date(),
            renewalDate: new Date(Date.now() + (input.billingCycle === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000),
            autoRenew: true,
            createdAt: new Date(),
          });

          // Send welcome email
          await emailService.sendSubscriptionWelcome(ctx.user.email, {
            tier: input.tier,
            amount,
            billingCycle: input.billingCycle,
          });

          return {
            success: true,
            subscriptionId: subscription.insertId,
            tier: input.tier,
            policyConfidence: avgConfidence,
          };
        } catch (error) {
          return {
            success: false,
            error: `Subscription creation failed: ${error}`,
          };
        }
      } else {
        // Free tier
        const subscription = await db.insert('subscriptions').values({
          userId: ctx.user.id,
          tier: 'free',
          status: 'active',
          billingCycle: 'monthly',
          amount: 0,
          startDate: new Date(),
          renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          autoRenew: true,
          createdAt: new Date(),
        });

        return {
          success: true,
          subscriptionId: subscription.insertId,
          tier: 'free',
          policyConfidence: avgConfidence,
        };
      }
    }),

  /**
   * Get payment history with policy context
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const payments = await db.query(
        'SELECT * FROM payments WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [ctx.user.id, input.limit, input.offset]
      );

      const total = await db.query('SELECT COUNT(*) as count FROM payments WHERE userId = ?', [ctx.user.id]);

      return {
        payments,
        total: total[0]?.count || 0,
      };
    }),

  /**
   * Get policy decisions for a user
   */
  getPolicyDecisions: protectedProcedure
    .input(
      z.object({
        action: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      let query = 'SELECT * FROM policy_decisions WHERE userId = ?';
      const params: any[] = [ctx.user.id];

      if (input.action) {
        query += ' AND action = ?';
        params.push(input.action);
      }

      query += ' ORDER BY timestamp DESC LIMIT ?';
      params.push(input.limit);

      const decisions = await db.query(query, params);

      return {
        decisions: decisions.map((d: any) => ({
          ...d,
          decisions: JSON.parse(d.decisions),
        })),
      };
    }),

  /**
   * Override a policy decision (admin only)
   */
  overridePolicyDecision: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        override: z.enum(['approve', 'deny']),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can override policy decisions');
      }

      // Log override
      await db.insert('policy_overrides').values({
        decisionId: input.decisionId,
        adminId: ctx.user.id,
        override: input.override,
        reason: input.reason,
        timestamp: new Date(),
      });

      return { success: true };
    }),
});

/**
 * Helper function to process Stripe payment
 */
async function processStripePayment(
  amount: number,
  currency: string,
  metadata: Record<string, any>
): Promise<any> {
  // This would integrate with Stripe API
  // For now, return a mock response
  return {
    id: `pi_${Date.now()}`,
    amount,
    currency,
    status: 'succeeded',
    metadata,
  };
}
