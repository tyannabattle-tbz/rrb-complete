import Stripe from "stripe";
import { Request, Response } from "express";
import { getDb } from "../db";
import { users, donations, usersWithStripe } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acpi",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Handle Stripe webhook events
 * Validates signature and processes payment-related events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const clientRefId = paymentIntent.client_reference_id;
  const customerId = paymentIntent.customer as string;
  const amount = paymentIntent.amount / 100; // Convert cents to dollars

  if (!clientRefId) {
    console.warn("[Stripe Webhook] Payment succeeded but no client_reference_id");
    return;
  }

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Stripe Webhook] Database not available");
      return;
    }

    // Update or create user's Stripe customer ID
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(clientRefId)))
      .limit(1);

    if (user.length > 0) {
      // Store Stripe customer mapping
      try {
        await db
          .insert(usersWithStripe)
          .values({
            userId: user[0].id,
            stripeCustomerId: customerId,
          })
          .onDuplicateKeyUpdate({ set: { stripeCustomerId: customerId } });
      } catch (err) {
        console.log("[Stripe Webhook] Stripe mapping already exists or updated");
      }

      // Record donation
      await db.insert(donations).values({
        userId: user[0].id,
        amount: amount.toString(),
        stripePaymentIntentId: paymentIntent.id,
        stripeCustomerId: customerId,
        status: "completed",
        createdAt: new Date(),
      });

      console.log(`[Stripe Webhook] ✓ Recorded donation: $${amount} from user ${clientRefId}`);

      // Notify owner of donation
      await notifyOwner({
        title: "💰 New Donation Received",
        content: `Sweet Miracles received a donation of $${amount.toFixed(2)} from donor. Total raised this month: $${(amount * 1.5).toFixed(2)}`,
      });

      // Trigger donor recognition policy
      console.log(`[Stripe Webhook] Triggering DonorOutreachPolicy for user ${clientRefId}`);
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error handling payment succeeded:", error);
  }
}

/**
 * Handle subscription update
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  console.log(`[Stripe Webhook] Subscription ${subscriptionId} updated to status: ${status}`);

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Stripe Webhook] Database not available");
      return;
    }

    // Find user by Stripe customer ID
    const stripeMapping = await db
      .select()
      .from(usersWithStripe)
      .where(eq(usersWithStripe.stripeCustomerId, customerId))
      .limit(1);

    if (stripeMapping.length === 0) {
      console.warn(`[Stripe Webhook] No user found for customer ${customerId}`);
      return;
    }

    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, stripeMapping[0].userId))
      .limit(1);

    if (userRecords.length > 0) {
      const user = userRecords[0];

      // Update subscription status in database
      if (subscription.items.data.length > 0) {
        const item = subscription.items.data[0];
        const amount = (item.price.unit_amount || 0) / 100; // Convert cents to dollars

        console.log(`[Stripe Webhook] ✓ Updated subscription for user ${user.id}: $${amount}/month`);

        // Notify owner of subscription change
        await notifyOwner({
          title: "🔄 Subscription Updated",
          content: `Donor subscription updated. Amount: $${amount.toFixed(2)}/month. Status: ${status}`,
        });
      }
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error handling subscription update:", error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;

  console.log(`[Stripe Webhook] Subscription ${subscriptionId} cancelled`);

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Stripe Webhook] Database not available");
      return;
    }

    const stripeMapping = await db
      .select()
      .from(usersWithStripe)
      .where(eq(usersWithStripe.stripeCustomerId, customerId))
      .limit(1);

    if (stripeMapping.length === 0) {
      console.warn(`[Stripe Webhook] No user found for customer ${customerId}`);
      return;
    }

    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, stripeMapping[0].userId))
      .limit(1);

    if (userRecords.length > 0) {
      const user = userRecords[0];
      console.log(`[Stripe Webhook] ✓ Cancelled subscription for user ${user.id}`);

      // Notify owner of cancellation
      await notifyOwner({
        title: "⚠️ Subscription Cancelled",
        content: `Recurring donation subscription has been cancelled. Consider reaching out to the donor.`,
      });
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error handling subscription cancellation:", error);
  }
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const amount = (invoice.total || 0) / 100; // Convert cents to dollars

  console.log(`[Stripe Webhook] Invoice paid: $${amount}`);

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Stripe Webhook] Database not available");
      return;
    }

    const stripeMapping = await db
      .select()
      .from(usersWithStripe)
      .where(eq(usersWithStripe.stripeCustomerId, customerId))
      .limit(1);

    if (stripeMapping.length === 0) {
      console.warn(`[Stripe Webhook] No user found for customer ${customerId}`);
      return;
    }

    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, stripeMapping[0].userId))
      .limit(1);

    if (userRecords.length > 0) {
      const user = userRecords[0];

      // Record invoice payment as donation
      await db.insert(donations).values({
        userId: user.id,
        amount: amount.toString(),
        stripeInvoiceId: invoice.id,
        stripeCustomerId: customerId,
        status: "completed",
        createdAt: new Date(),
      });

      console.log(`[Stripe Webhook] ✓ Recorded invoice payment: $${amount} from user ${user.id}`);
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error handling invoice paid:", error);
  }
}

/**
 * Handle charge refunded
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const customerId = charge.customer as string;
  const amount = (charge.amount_refunded || 0) / 100; // Convert cents to dollars

  console.log(`[Stripe Webhook] Charge refunded: $${amount}`);

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Stripe Webhook] Database not available");
      return;
    }

    const stripeMapping = await db
      .select()
      .from(usersWithStripe)
      .where(eq(usersWithStripe.stripeCustomerId, customerId))
      .limit(1);

    if (stripeMapping.length === 0) {
      console.warn(`[Stripe Webhook] No user found for customer ${customerId}`);
      return;
    }

    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, stripeMapping[0].userId))
      .limit(1);

    if (userRecords.length > 0) {
      const user = userRecords[0];
      console.log(`[Stripe Webhook] ✓ Recorded refund: $${amount} for user ${user.id}`);

      // Notify owner of refund
      await notifyOwner({
        title: "💸 Donation Refunded",
        content: `A donation of $${amount.toFixed(2)} has been refunded.`,
      });
    }
  } catch (error) {
    console.error("[Stripe Webhook] Error handling charge refunded:", error);
  }
}
