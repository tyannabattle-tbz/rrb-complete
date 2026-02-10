/**
 * Stripe Payment Router
 * Handles all donation, subscription, and payment operations
 */

import { router, protectedProcedure, publicProcedure } from '../../_core/trpc';
import { z } from 'zod';
import { STRIPE_PRODUCTS, getDonationTiers, getTierById, isValidDonationAmount } from '../../config/stripeProducts';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const stripePaymentsRouter = router({
  /**
   * Create a checkout session for monthly donations
   */
  createMonthlyCheckoutSession: protectedProcedure
    .input(
      z.object({
        tierId: z.enum(['bronze', 'silver', 'gold', 'platinum']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tier = getTierById(input.tierId);
        if (!tier) {
          throw new Error(`Invalid tier: ${input.tierId}`);
        }

        // Create or get Stripe customer
        let customerId = ctx.user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              userId: ctx.user.id.toString(),
            },
          });
          customerId = customer.id;
          // Update user with Stripe customer ID
          // TODO: Update database with new customerId
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price: tier.priceId,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/sweet-miracles`,
          metadata: {
            userId: ctx.user.id.toString(),
            tierId: input.tierId,
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        throw new Error(
          `Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Create a checkout session for one-time donation
   */
  createOneTimeCheckoutSession: publicProcedure
    .input(
      z.object({
        amount: z.number().min(50), // Minimum $0.50
        email: z.string().email(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!isValidDonationAmount(input.amount)) {
          throw new Error('Donation amount must be at least $0.50');
        }

        // Create customer
        const customer = await stripe.customers.create({
          email: input.email,
          name: input.name,
        });

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Sweet Miracles - One-Time Donation',
                  description: 'Support the preservation of the Rockin\' Rockin\' Boogie legacy',
                },
                unit_amount: input.amount,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/sweet-miracles`,
          metadata: {
            donorName: input.name,
            donorEmail: input.email,
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        throw new Error(
          `Failed to create checkout session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get user's donation history
   */
  getDonationHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get customer from database
      if (!ctx.user.stripeCustomerId) {
        return [];
      }

      // Fetch invoices from Stripe
      const invoices = await stripe.invoices.list({
        customer: ctx.user.stripeCustomerId,
        limit: 50,
      });

      return invoices.data.map((invoice) => ({
        id: invoice.id,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        date: new Date(invoice.created * 1000),
        status: invoice.status,
        url: invoice.hosted_invoice_url,
      }));
    } catch (error) {
      throw new Error(
        `Failed to fetch donation history: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }),

  /**
   * Get user's active subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user.stripeSubscriptionId) {
        return [];
      }

      // Fetch subscription from Stripe
      const subscription = await stripe.subscriptions.retrieve(ctx.user.stripeSubscriptionId);

      if (!subscription) {
        return [];
      }

      const item = subscription.items.data[0];
      const price = item.price;

      return [
        {
          id: subscription.id,
          status: subscription.status,
          amount: price.unit_amount,
          currency: price.currency,
          interval: price.recurring?.interval,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        },
      ];
    } catch (error) {
      throw new Error(
        `Failed to fetch subscriptions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }),

  /**
   * Cancel a subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.user.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      const subscription = await stripe.subscriptions.update(ctx.user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      return {
        success: true,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      };
    } catch (error) {
      throw new Error(
        `Failed to cancel subscription: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }),

  /**
   * Update subscription tier
   */
  updateSubscriptionTier: protectedProcedure
    .input(z.object({ newTierId: z.enum(['bronze', 'silver', 'gold', 'platinum']) }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user.stripeSubscriptionId) {
          throw new Error('No active subscription found');
        }

        const newTier = getTierById(input.newTierId);
        if (!newTier) {
          throw new Error(`Invalid tier: ${input.newTierId}`);
        }

        const subscription = await stripe.subscriptions.retrieve(ctx.user.stripeSubscriptionId);
        const item = subscription.items.data[0];

        // Update subscription with new price
        const updated = await stripe.subscriptions.update(ctx.user.stripeSubscriptionId, {
          items: [
            {
              id: item.id,
              price: newTier.priceId,
            },
          ],
        });

        return {
          success: true,
          subscription: updated,
        };
      } catch (error) {
        throw new Error(
          `Failed to update subscription: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get available donation tiers
   */
  getDonationTiers: publicProcedure.query(() => {
    return getDonationTiers();
  }),

  /**
   * Create a checkout session for merchandise purchase
   */
  createMerchCheckoutSession: protectedProcedure
    .input(
      z.object({
        items: z.array(z.object({
          id: z.string(),
          name: z.string(),
          price: z.number().min(50), // cents
          quantity: z.number().min(1).max(10),
        })),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        let customerId = ctx.user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: { userId: ctx.user.id.toString() },
          });
          customerId = customer.id;
        }

        const lineItems = input.items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              description: `Rockin Rockin Boogie Merchandise - ${item.name}`,
            },
            unit_amount: item.price,
          },
          quantity: item.quantity,
        }));

        const origin = ctx.req?.headers?.origin || process.env.VITE_APP_URL || 'http://localhost:3000';
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          allow_promotion_codes: true,
          success_url: `${origin}/rrb/merchandise-shop?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/rrb/merchandise-shop?canceled=true`,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || '',
            customer_name: ctx.user.name || '',
            type: 'merchandise',
            items: JSON.stringify(input.items.map(i => i.id)),
          },
        });

        return { sessionId: session.id, url: session.url };
      } catch (error) {
        throw new Error(
          `Failed to create merch checkout: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get checkout session details
   */
  getCheckoutSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      try {
        const session = await stripe.checkout.sessions.retrieve(input.sessionId);

        return {
          id: session.id,
          status: session.payment_status,
          customerId: session.customer,
          amountTotal: session.amount_total,
          currency: session.currency,
          metadata: session.metadata,
        };
      } catch (error) {
        throw new Error(
          `Failed to fetch session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),
});
