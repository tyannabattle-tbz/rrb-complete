import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-01-28.clover' as any,
});

export const stripeCheckoutRouter = router({
  // Create checkout session for tier upgrade
  createCheckoutSession: protectedProcedure
    .input(z.object({
      tierId: z.string(),
      tierName: z.string(),
      price: z.number(),
      features: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const decisionId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${input.tierName} Tier`,
                  description: input.features.join(', '),
                },
                unit_amount: Math.round(input.price * 100),
                recurring: {
                  interval: 'month',
                  interval_count: 1,
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${ctx.req.headers.origin}/pricing?success=true`,
          cancel_url: `${ctx.req.headers.origin}/pricing?canceled=true`,
          customer_email: ctx.user?.email,
          client_reference_id: ctx.user?.id.toString(),
          metadata: {
            userId: ctx.user?.id.toString(),
            tierId: input.tierId,
            tierName: input.tierName,
            decisionId,
          },
        });

        console.log(`[Stripe] Checkout session created: ${session.id} for user ${ctx.user?.id} (Decision: ${decisionId})`);

        return {
          decisionId,
          sessionId: session.id,
          url: session.url,
          success: true,
        };
      } catch (error) {
        console.error(`[Stripe] Checkout creation failed for user ${ctx.user?.id}:`, error);
        throw new Error('Failed to create checkout session');
      }
    }),

  // Get subscription status
  getSubscriptionStatus: protectedProcedure
    .query(async ({ ctx }: any) => {
      const decisionId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      try {
        const customers = await stripe.customers.list({
          email: ctx.user?.email,
          limit: 1,
        });

        if (customers.data.length === 0) {
          return {
            decisionId,
            status: 'no_subscription',
            tier: 'free',
            active: false,
          };
        }

        const customer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length === 0) {
          return {
            decisionId,
            status: 'inactive',
            tier: 'free',
            active: false,
          };
        }

        const subscription = subscriptions.data[0];
        const tierName = subscription.metadata?.tierName || 'unknown';

        console.log(`[Stripe] Subscription status retrieved for user ${ctx.user?.id}: ${tierName} (Decision: ${decisionId})`);

        return {
          decisionId,
          status: 'active',
          tier: tierName,
          active: true,
          currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
        };
      } catch (error) {
        console.error(`[Stripe] Failed to get subscription status for user ${ctx.user?.id}:`, error);
        return {
          decisionId,
          status: 'error',
          tier: 'free',
          active: false,
        };
      }
    }),

  // Cancel subscription
  cancelSubscription: protectedProcedure
    .mutation(async ({ ctx }: any) => {
      const decisionId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      try {
        const customers = await stripe.customers.list({
          email: ctx.user?.email,
          limit: 1,
        });

        if (customers.data.length === 0) {
          return {
            decisionId,
            success: false,
            message: 'No customer found',
          };
        }

        const customer = customers.data[0];
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
          limit: 1,
        });

        if (subscriptions.data.length === 0) {
          return {
            decisionId,
            success: false,
            message: 'No active subscription',
          };
        }

        await stripe.subscriptions.update(subscriptions.data[0].id, {
          cancel_at_period_end: true,
        });

        console.log(`[Stripe] Subscription canceled for user ${ctx.user?.id} (Decision: ${decisionId})`);

        return {
          decisionId,
          success: true,
          message: 'Subscription canceled at period end',
        };
      } catch (error) {
        console.error(`[Stripe] Failed to cancel subscription for user ${ctx.user?.id}:`, error);
        throw new Error('Failed to cancel subscription');
      }
    }),

  // Update payment method
  updatePaymentMethod: protectedProcedure
    .input(z.object({
      paymentMethodId: z.string(),
    }))
    .mutation(async ({ ctx, input }: any) => {
      const decisionId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      try {
        const customers = await stripe.customers.list({
          email: ctx.user?.email,
          limit: 1,
        });

        if (customers.data.length === 0) {
          return {
            decisionId,
            success: false,
            message: 'No customer found',
          };
        }

        const customer = customers.data[0];
        await stripe.customers.update(customer.id, {
          invoice_settings: {
            default_payment_method: input.paymentMethodId,
          },
        });

        console.log(`[Stripe] Payment method updated for user ${ctx.user?.id} (Decision: ${decisionId})`);

        return {
          decisionId,
          success: true,
          message: 'Payment method updated',
        };
      } catch (error) {
        console.error(`[Stripe] Failed to update payment method for user ${ctx.user?.id}:`, error);
        throw new Error('Failed to update payment method');
      }
    }),

  // Get billing history
  getBillingHistory: protectedProcedure
    .query(async ({ ctx }: any) => {
      const decisionId = `decision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      try {
        const customers = await stripe.customers.list({
          email: ctx.user?.email,
          limit: 1,
        });

        if (customers.data.length === 0) {
          return {
            decisionId,
            invoices: [],
          };
        }

        const customer = customers.data[0];
        const invoices = await stripe.invoices.list({
          customer: customer.id,
          limit: 12,
        });

        const formattedInvoices = invoices.data.map(invoice => ({
          id: invoice.id,
          date: new Date(invoice.created * 1000),
          amount: invoice.amount_paid / 100,
          status: invoice.status,
          pdfUrl: invoice.hosted_invoice_url || '',
        }));

        console.log(`[Stripe] Billing history retrieved for user ${ctx.user?.id}: ${formattedInvoices.length} invoices (Decision: ${decisionId})`);

        return {
          decisionId,
          invoices: formattedInvoices,
        };
      } catch (error) {
        console.error(`[Stripe] Failed to get billing history for user ${ctx.user?.id}:`, error);
        return {
          decisionId,
          invoices: [],
        };
      }
    }),
});
