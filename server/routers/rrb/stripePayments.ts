/**
 * Stripe Payment Router — DONATIONS ONLY
 * 
 * In Support of Legacy Recovery Efforts
 * Sweet Miracles Foundation 501(c)(3) / 508(c)
 * 
 * All payment flows are donation-based. No product/service purchases.
 * For studio services and production packages, contact Canryn Production directly.
 */

import { router, protectedProcedure, publicProcedure } from '../../_core/trpc';
import { z } from 'zod';
import { getDonationTiers, getTierById, isValidDonationAmount, getDonationPurposes, getOneTimeDonationAmounts } from '../../config/stripeProducts';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export const stripePaymentsRouter = router({
  /**
   * Create a checkout session for monthly recurring donations
   * In Support of Legacy Recovery Efforts
   */
  createMonthlyDonationSession: protectedProcedure
    .input(
      z.object({
        tierId: z.enum(['friend', 'supporter', 'champion', 'guardian', 'benefactor']),
        purpose: z.string().optional().default('legacy-recovery'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const tier = getTierById(input.tierId);
        if (!tier) {
          throw new Error(`Invalid donation tier: ${input.tierId}`);
        }

        let customerId = ctx.user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: {
              userId: ctx.user.id.toString(),
              donationType: 'recurring',
            },
          });
          customerId = customer.id;
        }

        const origin = ctx.req?.headers?.origin || process.env.VITE_APP_URL || 'http://localhost:3000';
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
          allow_promotion_codes: true,
          success_url: `${origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/sweet-miracles`,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: ctx.user.email || '',
            customer_name: ctx.user.name || '',
            type: 'donation_recurring',
            tierId: input.tierId,
            purpose: input.purpose,
            organization: 'Sweet Miracles Foundation 501(c)(3) / 508(c)',
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        throw new Error(
          `Failed to create donation session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  // Backward compatibility alias
  createMonthlyCheckoutSession: protectedProcedure
    .input(
      z.object({
        tierId: z.enum(['friend', 'supporter', 'champion', 'guardian', 'benefactor', 'bronze', 'silver', 'gold', 'platinum']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Map old tier names to new ones
      const tierMap: Record<string, string> = {
        bronze: 'friend', silver: 'supporter', gold: 'champion', platinum: 'guardian',
        friend: 'friend', supporter: 'supporter', champion: 'champion', guardian: 'guardian', benefactor: 'benefactor',
      };
      const mappedTier = tierMap[input.tierId] || 'friend';
      const tier = getTierById(mappedTier);
      if (!tier) throw new Error(`Invalid tier: ${input.tierId}`);

      let customerId = ctx.user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: ctx.user.email || undefined,
          name: ctx.user.name || undefined,
          metadata: { userId: ctx.user.id.toString() },
        });
        customerId = customer.id;
      }

      const origin = ctx.req?.headers?.origin || process.env.VITE_APP_URL || 'http://localhost:3000';
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{ price: tier.priceId, quantity: 1 }],
        mode: 'subscription',
        allow_promotion_codes: true,
        success_url: `${origin}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/sweet-miracles`,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email || '',
          customer_name: ctx.user.name || '',
          type: 'donation_recurring',
          tierId: mappedTier,
          organization: 'Sweet Miracles Foundation 501(c)(3) / 508(c)',
        },
      });

      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Create a checkout session for one-time donation
   * In Support of Legacy Recovery Efforts
   */
  createOneTimeDonationSession: publicProcedure
    .input(
      z.object({
        amount: z.number().min(50), // Minimum $0.50
        email: z.string().email(),
        name: z.string(),
        purpose: z.string().optional().default('general-fund'),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!isValidDonationAmount(input.amount)) {
          throw new Error('Donation amount must be at least $0.50');
        }

        const customer = await stripe.customers.create({
          email: input.email,
          name: input.name,
          metadata: { donationType: 'one_time' },
        });

        const purposeLabel = getDonationPurposes().find(p => p.id === input.purpose)?.name || 'Legacy Recovery';

        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `Sweet Miracles Foundation — ${purposeLabel}`,
                  description: `Donation in support of legacy recovery efforts. ${input.message ? `Donor message: ${input.message}` : ''}`.trim(),
                },
                unit_amount: input.amount,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          allow_promotion_codes: true,
          success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/sweet-miracles`,
          metadata: {
            donorName: input.name,
            donorEmail: input.email,
            type: 'donation_one_time',
            purpose: input.purpose,
            message: input.message || '',
            organization: 'Sweet Miracles Foundation 501(c)(3) / 508(c)',
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      } catch (error) {
        throw new Error(
          `Failed to create donation session: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  // Backward compatibility alias
  createOneTimeCheckoutSession: publicProcedure
    .input(
      z.object({
        amount: z.number().min(50),
        email: z.string().email(),
        name: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      if (!isValidDonationAmount(input.amount)) {
        throw new Error('Donation amount must be at least $0.50');
      }
      const customer = await stripe.customers.create({
        email: input.email,
        name: input.name,
      });
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Sweet Miracles Foundation — Legacy Recovery Donation',
              description: 'One-time donation in support of legacy recovery efforts.',
            },
            unit_amount: input.amount,
          },
          quantity: 1,
        }],
        mode: 'payment',
        allow_promotion_codes: true,
        success_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/sweet-miracles`,
        metadata: {
          donorName: input.name,
          donorEmail: input.email,
          type: 'donation_one_time',
          organization: 'Sweet Miracles Foundation 501(c)(3) / 508(c)',
        },
      });
      return { sessionId: session.id, url: session.url };
    }),

  /**
   * Get donation history for authenticated user
   */
  getDonationHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user.stripeCustomerId) return [];
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
   * Get user's active recurring donation subscriptions
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user.stripeSubscriptionId) return [];
      const subscription = await stripe.subscriptions.retrieve(ctx.user.stripeSubscriptionId);
      if (!subscription) return [];
      const item = subscription.items.data[0];
      const price = item.price;
      return [{
        id: subscription.id,
        status: subscription.status,
        amount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }];
    } catch (error) {
      throw new Error(
        `Failed to fetch subscriptions: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }),

  /**
   * Cancel a recurring donation
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (!ctx.user.stripeSubscriptionId) {
        throw new Error('No active recurring donation found');
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
        `Failed to cancel recurring donation: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }),

  /**
   * Update recurring donation tier
   */
  updateSubscriptionTier: protectedProcedure
    .input(z.object({ newTierId: z.enum(['friend', 'supporter', 'champion', 'guardian', 'benefactor']) }))
    .mutation(async ({ ctx, input }) => {
      try {
        if (!ctx.user.stripeSubscriptionId) {
          throw new Error('No active recurring donation found');
        }
        const newTier = getTierById(input.newTierId);
        if (!newTier) throw new Error(`Invalid tier: ${input.newTierId}`);

        const subscription = await stripe.subscriptions.retrieve(ctx.user.stripeSubscriptionId);
        const item = subscription.items.data[0];
        const updated = await stripe.subscriptions.update(ctx.user.stripeSubscriptionId, {
          items: [{ id: item.id, price: newTier.priceId }],
        });
        return { success: true, subscription: updated };
      } catch (error) {
        throw new Error(
          `Failed to update donation tier: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }),

  /**
   * Get available donation tiers and purposes
   */
  getDonationTiers: publicProcedure.query(() => {
    return getDonationTiers();
  }),

  getDonationPurposes: publicProcedure.query(() => {
    return getDonationPurposes();
  }),

  getOneTimeDonationAmounts: publicProcedure.query(() => {
    return getOneTimeDonationAmounts();
  }),

  /**
   * Get checkout session details (for success page)
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
