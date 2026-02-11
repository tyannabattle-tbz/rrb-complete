import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const billingRouter = router({
  // Get subscription plans
  getSubscriptionPlans: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        plans: [
          {
            id: 'free',
            name: 'Free',
            price: 0,
            billing: 'monthly',
            features: ['10 projects', '5GB storage', 'Basic support'],
            limits: { projects: 10, storage: 5, videoMinutes: 10 },
          },
          {
            id: 'pro',
            name: 'Pro',
            price: 29,
            billing: 'monthly',
            features: ['Unlimited projects', '100GB storage', 'Priority support', 'Advanced analytics'],
            limits: { projects: -1, storage: 100, videoMinutes: 1000 },
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: 99,
            billing: 'monthly',
            features: ['Everything in Pro', 'Custom storage', 'Dedicated support', 'API access'],
            limits: { projects: -1, storage: 1000, videoMinutes: -1 },
          },
        ],
      };
    }),

  // Get current subscription
  getCurrentSubscription: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        subscription: {
          planId: 'pro',
          planName: 'Pro',
          status: 'active',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          price: 29,
          billing: 'monthly',
          autoRenew: true,
        },
      };
    }),

  // Upgrade subscription
  upgradeSubscription: protectedProcedure
    .input(z.object({
      planId: z.string(),
      paymentMethod: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        planId: input.planId,
        message: 'Subscription upgraded successfully',
        effectiveDate: new Date(),
      };
    }),

  // Get usage
  getUsage: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        usage: {
          projects: { used: 8, limit: -1, percentage: 0 },
          storage: { used: 45, limit: 100, percentage: 45 },
          videoMinutes: { used: 450, limit: 1000, percentage: 45 },
          apiCalls: { used: 25000, limit: 100000, percentage: 25 },
        },
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),

  // Get billing history
  getBillingHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      return {
        userId: ctx.user.id,
        invoices: [
          {
            id: 'inv-1',
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            amount: 29,
            status: 'paid',
            description: 'Pro Plan - Monthly',
            downloadUrl: null as string | null, // Invoices are fetched from Stripe when available
          },
          {
            id: 'inv-2',
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            amount: 29,
            status: 'paid',
            description: 'Pro Plan - Monthly',
            downloadUrl: null as string | null, // Invoices are fetched from Stripe when available
          },
        ],
        total: 2,
        limit: input.limit,
      };
    }),

  // Get payment methods
  getPaymentMethods: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        paymentMethods: [
          {
            id: 'pm-1',
            type: 'card',
            brand: 'Visa',
            last4: '4242',
            expiryMonth: 12,
            expiryYear: 2025,
            isDefault: true,
          },
        ],
      };
    }),

  // Add payment method
  addPaymentMethod: protectedProcedure
    .input(z.object({
      type: z.enum(['card', 'bank']),
      token: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const pmId = `pm-${Date.now()}`;
      return {
        success: true,
        userId: ctx.user.id,
        paymentMethodId: pmId,
        message: 'Payment method added successfully',
      };
    }),

  // Remove payment method
  removePaymentMethod: protectedProcedure
    .input(z.object({
      paymentMethodId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        paymentMethodId: input.paymentMethodId,
        message: 'Payment method removed',
      };
    }),

  // Get cost breakdown
  getCostBreakdown: protectedProcedure
    .input(z.object({
      month: z.number().min(1).max(12).optional(),
      year: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return {
        userId: ctx.user.id,
        breakdown: {
          subscriptionFee: 29,
          overageCharges: 0,
          discounts: 0,
          total: 29,
        },
        details: [
          { item: 'Pro Plan', cost: 29, quantity: 1 },
        ],
      };
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .input(z.object({
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        message: 'Subscription cancelled. Your Pro plan will end on the renewal date.',
        effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    }),

  // Get cost recommendations
  getCostRecommendations: protectedProcedure
    .input(z.object({}))
    .query(async ({ ctx }) => {
      return {
        userId: ctx.user.id,
        recommendations: [
          {
            type: 'downgrade',
            message: 'Your usage is below Pro plan limits. Consider Free plan.',
            savings: '$29/month',
          },
          {
            type: 'upgrade',
            message: 'You\'re approaching storage limits. Consider upgrading.',
            recommendation: 'Enterprise',
          },
        ],
      };
    }),

  // Get invoice
  getInvoice: protectedProcedure
    .input(z.object({
      invoiceId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return {
        userId: ctx.user.id,
        invoice: {
          id: input.invoiceId,
          date: new Date(),
          amount: 29,
          status: 'paid',
          items: [
            { description: 'Pro Plan - Monthly', quantity: 1, price: 29 },
          ],
          total: 29,
        },
      };
    }),
});
