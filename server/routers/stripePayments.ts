import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

/**
 * Stripe Payment Integration Router
 * Handles donation processing, recurring subscriptions, and payment history
 */
export const stripePaymentsRouter = router({
  /**
   * Create a Stripe Checkout Session for one-time or recurring donations
   * Returns the checkout URL to redirect the user to Stripe's hosted checkout
   */
  createCheckoutSession: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(50, "Minimum donation is $0.50"), // Amount in cents
        currency: z.string().default("usd"),
        donorName: z.string(),
        donorEmail: z.string().email(),
        donorTier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
        campaignId: z.string().optional(),
        isRecurring: z.boolean().default(false),
        recurringInterval: z.enum(["month", "year"]).optional(),
        successUrl: z.string(),
        cancelUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
          {
            price_data: {
              currency: input.currency,
              product_data: {
                name: "Sweet Miracles Donation",
                description: `Supporting senior and elderly advocacy - ${input.campaignId || "General Fund"}`,
                metadata: {
                  campaign: input.campaignId || "general",
                  donorTier: input.donorTier || "bronze",
                },
              },
              unit_amount: input.amount,
              ...(input.isRecurring && input.recurringInterval && {
                recurring: {
                  interval: input.recurringInterval,
                  interval_count: 1,
                },
              }),
            },
            quantity: 1,
          },
        ];

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: input.isRecurring ? "subscription" : "payment",
          customer_email: input.donorEmail,
          client_reference_id: ctx.user.id.toString(),
          metadata: {
            user_id: ctx.user.id.toString(),
            customer_email: input.donorEmail,
            customer_name: input.donorName,
            campaign_id: input.campaignId || "general",
            donor_tier: input.donorTier || "bronze",
          },
          success_url: input.successUrl,
          cancel_url: input.cancelUrl,
          allow_promotion_codes: true,
        });

        return {
          sessionId: session.id,
          checkoutUrl: session.url,
          success: true,
        };
      } catch (error) {
        console.error("[Stripe] Checkout session creation failed:", error);
        throw new Error(
          `Failed to create checkout session: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Retrieve payment history for the current user
   * Returns list of completed donations with metadata
   */
  getPaymentHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Get all customers with matching email
        const customers = await stripe.customers.list({
          email: ctx.user.email || "",
          limit: 1,
        });

        if (!customers.data.length) {
          return {
            payments: [],
            total: 0,
            hasMore: false,
          };
        }

        const customerId = customers.data[0].id;

        // Get payment intents for this customer
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customerId,
          limit: input.limit,
          starting_after: input.offset > 0 ? undefined : undefined,
        });

        const payments = paymentIntents.data.map((intent: Stripe.PaymentIntent) => ({
          id: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: intent.status,
          created: new Date(intent.created * 1000),
          description: intent.description,
          metadata: intent.metadata,
        }));

        return {
          payments,
          total: paymentIntents.data.length,
          hasMore: paymentIntents.has_more,
        };
      } catch (error) {
        console.error("[Stripe] Failed to retrieve payment history:", error);
        throw new Error(
          `Failed to retrieve payment history: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Retrieve subscription details for recurring donors
   * Returns active subscriptions and their status
   */
  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Get customer by email
      const customers = await stripe.customers.list({
        email: ctx.user.email || "",
        limit: 1,
      });

      if (!customers.data.length) {
        return {
          subscriptions: [],
          total: 0,
        };
      }

      const customerId = customers.data[0].id;

      // Get subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
      });

      const subs = subscriptions.data.map((sub: Stripe.Subscription) => ({
        id: sub.id,
        status: sub.status,
        currentPeriodStart: new Date(((sub as any).current_period_start as number) * 1000),
        currentPeriodEnd: new Date(((sub as any).current_period_end as number) * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        metadata: sub.metadata,
        items: sub.items.data.map((item: Stripe.SubscriptionItem) => ({
          id: item.id,
          priceId: item.price.id,
          quantity: item.quantity,
        })),
      }));

      return {
        subscriptions: subs,
        total: subs.length,
      };
    } catch (error) {
      console.error("[Stripe] Failed to retrieve subscriptions:", error);
      throw new Error(
        `Failed to retrieve subscriptions: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }),

  /**
   * Cancel a recurring donation subscription
   * Allows donors to stop recurring payments
   */
  cancelSubscription: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const subscription = await stripe.subscriptions.update(
          input.subscriptionId,
          {
            cancel_at_period_end: true,
          }
        );

        return {
          success: true,
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          currentPeriodEnd: new Date(((subscription as any).current_period_end as number) * 1000),
        };
      } catch (error) {
        console.error("[Stripe] Failed to cancel subscription:", error);
        throw new Error(
          `Failed to cancel subscription: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Update subscription amount for recurring donations
   * Allows donors to increase or decrease their monthly contribution
   */
  updateSubscriptionAmount: protectedProcedure
    .input(
      z.object({
        subscriptionId: z.string(),
        newAmount: z.number().min(50, "Minimum donation is $0.50"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const subscription = await stripe.subscriptions.retrieve(
          input.subscriptionId
        );

        if (!subscription.items.data.length) {
          throw new Error("Subscription has no items");
        }

        const item = subscription.items.data[0];

        // Get the price object to understand the billing model
        const price = await stripe.prices.retrieve(item.price.id);

        // Create a new price with the updated amount
        const newPrice = await stripe.prices.create({
          currency: price.currency,
          unit_amount: input.newAmount,
          recurring: {
            interval: price.recurring?.interval || "month",
            interval_count: price.recurring?.interval_count || 1,
          },
          product: price.product as string,
        });

        // Update the subscription item
        const updatedSubscription = await stripe.subscriptions.update(
          input.subscriptionId,
          {
            items: [
              {
                id: item.id,
                price: newPrice.id,
              },
            ],
          }
        );

        return {
          success: true,
          subscriptionId: updatedSubscription.id,
          newAmount: input.newAmount,
          status: updatedSubscription.status,
        };
      } catch (error) {
        console.error("[Stripe] Failed to update subscription amount:", error);
        throw new Error(
          `Failed to update subscription: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Get donation statistics for a specific campaign
   * Returns aggregated donation data for fundraising tracking
   */
  getCampaignStats: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Search for payment intents with this campaign ID in metadata
        const paymentIntents = await stripe.paymentIntents.list({
          limit: 100,
        });

        const campaignPayments = paymentIntents.data.filter(
          (intent: Stripe.PaymentIntent) => intent.metadata?.campaign_id === input.campaignId
        );

        const totalAmount = campaignPayments.reduce(
          (sum: number, intent: Stripe.PaymentIntent) => sum + intent.amount,
          0
        );
        const successfulPayments = campaignPayments.filter(
          (intent: Stripe.PaymentIntent) => intent.status === "succeeded"
        );
        const donorCount = new Set(
          campaignPayments.map((intent: Stripe.PaymentIntent) => intent.customer)
        ).size;

        return {
          campaignId: input.campaignId,
          totalDonations: campaignPayments.length,
          successfulDonations: successfulPayments.length,
          totalAmount,
          averageDonation:
            successfulPayments.length > 0
              ? totalAmount / successfulPayments.length
              : 0,
          uniqueDonors: donorCount,
          conversionRate:
            campaignPayments.length > 0
              ? (successfulPayments.length / campaignPayments.length) * 100
              : 0,
        };
      } catch (error) {
        console.error("[Stripe] Failed to get campaign stats:", error);
        throw new Error(
          `Failed to get campaign stats: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),

  /**
   * Retrieve a specific payment receipt
   * Returns invoice/receipt details for tax documentation
   */
  getPaymentReceipt: protectedProcedure
    .input(
      z.object({
        paymentIntentId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(
          input.paymentIntentId
        );

        const charges = (paymentIntent as any).charges;
        if (!charges || !charges.data || !charges.data.length) {
          throw new Error("No charges found for this payment");
        }

        const charge = charges.data[0];

        return {
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          created: new Date(paymentIntent.created * 1000),
          description: paymentIntent.description,
          receiptUrl: charge.receipt_url,
          metadata: paymentIntent.metadata,
        };
      } catch (error) {
        console.error("[Stripe] Failed to get payment receipt:", error);
        throw new Error(
          `Failed to get payment receipt: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }),
});
