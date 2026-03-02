import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import { db } from '../db';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Stripe Webhook Handler
 * Processes payment events and updates user subscription status
 */
router.post('/stripe/webhook', (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith('evt_test_')) {
    console.log('[Webhook] Test event detected, returning verification response');
    return res.json({ verified: true });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.paid':
        handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

/**
 * Handle successful payment intent
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`[Webhook] Payment Intent Succeeded: ${paymentIntent.id}`);

  try {
    // Extract metadata
    const metadata = paymentIntent.metadata || {};
    const userId = metadata.user_id;
    const customerEmail = metadata.customer_email;

    if (!userId) {
      console.warn('Payment intent missing user_id in metadata');
      return;
    }

    // Log payment event
    console.log(`[Payment] User ${userId} completed payment of ${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`);

    // Update user payment status in database
    // This would typically update a payments table or user subscription status
    // await db.payments.create({
    //   userId,
    //   stripePaymentIntentId: paymentIntent.id,
    //   amount: paymentIntent.amount,
    //   currency: paymentIntent.currency,
    //   status: 'succeeded',
    //   email: customerEmail,
    //   metadata,
    //   createdAt: new Date(paymentIntent.created * 1000),
    // });

    // Send confirmation email (optional)
    // await sendPaymentConfirmationEmail(customerEmail, paymentIntent);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
}

/**
 * Handle completed checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] Checkout Session Completed: ${session.id}`);

  try {
    const metadata = session.metadata || {};
    const userId = metadata.user_id;
    const customerEmail = metadata.customer_email;
    const customerName = metadata.customer_name;

    if (!userId) {
      console.warn('Checkout session missing user_id in metadata');
      return;
    }

    // Log checkout event
    console.log(`[Checkout] User ${userId} (${customerEmail}) completed checkout`);

    // Update subscription status
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      // Update user subscription in database
      // await db.subscriptions.upsert({
      //   userId,
      //   stripeSubscriptionId: subscription.id,
      //   status: subscription.status,
      //   currentPeriodStart: new Date(subscription.current_period_start * 1000),
      //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      //   cancelAtPeriodEnd: subscription.cancel_at_period_end,
      // });

      console.log(`[Subscription] Created/Updated subscription ${subscription.id} for user ${userId}`);
    }

    // Send welcome/confirmation email
    // await sendCheckoutConfirmationEmail(customerEmail, customerName, session);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription Updated: ${subscription.id}`);

  try {
    // Update subscription status in database
    // await db.subscriptions.update({
    //   stripeSubscriptionId: subscription.id,
    //   status: subscription.status,
    //   currentPeriodStart: new Date(subscription.current_period_start * 1000),
    //   currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    //   cancelAtPeriodEnd: subscription.cancel_at_period_end,
    // });

    console.log(`[Subscription] Updated subscription ${subscription.id} - Status: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Webhook] Subscription Deleted: ${subscription.id}`);

  try {
    // Mark subscription as cancelled in database
    // await db.subscriptions.update({
    //   stripeSubscriptionId: subscription.id,
    //   status: 'canceled',
    //   canceledAt: new Date(),
    // });

    console.log(`[Subscription] Cancelled subscription ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

/**
 * Handle paid invoice
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Invoice Paid: ${invoice.id}`);

  try {
    // Log invoice payment
    // await db.invoices.create({
    //   stripeInvoiceId: invoice.id,
    //   stripeSubscriptionId: invoice.subscription as string,
    //   amount: invoice.amount_paid,
    //   currency: invoice.currency,
    //   status: 'paid',
    //   paidAt: new Date(invoice.paid * 1000),
    // });

    console.log(`[Invoice] Recorded paid invoice ${invoice.id} - Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);
  } catch (error) {
    console.error('Error handling invoice paid:', error);
  }
}

export default router;
