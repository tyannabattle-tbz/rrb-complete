import { Request, Response } from 'express';
import Stripe from 'stripe';
import { sendDonationReceipt, sendPaymentConfirmation, sendSubscriptionWelcome, sendSubscriptionRenewalReminder, sendSubscriptionCancellation } from './emailService';
import { db } from './db';
import { donations, payments, subscriptions } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    console.error('[Webhook] Missing Stripe signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    // Test event detection
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (body.includes('evt_test_')) {
      console.log('[Webhook] Test event detected, returning verification response');
      return res.json({ verified: true });
    }

    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    console.log(`[Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.upcoming':
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }

    // Return success response
    res.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error('[Webhook] Error processing event:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Handle payment_intent.succeeded - for one-time donations
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
  console.log(`[Webhook] Payment succeeded: ${paymentIntent.id}`);

  const metadata = paymentIntent.metadata || {};
  const donorEmail = paymentIntent.receipt_email || metadata.email;
  const donorName = metadata.donor_name;
  const amount = paymentIntent.amount;
  const currency = (paymentIntent.currency || 'usd').toUpperCase();

  if (!donorEmail) {
    console.warn('[Webhook] No email found for payment intent');
    return;
  }

  // Save donation to database
  const broadcastHours = (amount / 100) / 2.5; // $2.50 per hour
  await db.insert(donations).values({
    donorName,
    donorEmail,
    amount,
    currency: currency as any,
    stripePaymentIntentId: paymentIntent.id,
    status: 'succeeded',
    broadcastHoursFunded: broadcastHours,
    receiptSent: 1,
    metadata: { ...metadata, payment_method: paymentIntent.payment_method },
  });

  // Send donation receipt
  const receiptSent = await sendDonationReceipt({
    donorName,
    donorEmail,
    amount,
    currency,
    broadcastHoursFunded: broadcastHours,
    transactionId: paymentIntent.id,
    date: new Date().toLocaleDateString(),
  });

  if (receiptSent) {
    console.log(`[Webhook] Donation receipt sent to ${donorEmail}`);
  }
}

/**
 * Handle checkout.session.completed - for subscriptions
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  console.log(`[Webhook] Checkout session completed: ${session.id}`);

  const metadata = session.metadata || {};
  const userId = parseInt(metadata.user_id || '0');
  const customerEmail = session.customer_email || metadata.customer_email;
  const customerName = metadata.customer_name;
  const planId = metadata.plan_id;
  const amount = session.amount_total || 0;
  const currency = (session.currency || 'usd').toUpperCase();

  if (!userId || !session.subscription) {
    console.warn('[Webhook] Missing user_id or subscription for checkout session');
    return;
  }

  // Save payment to database
  await db.insert(payments).values({
    userId,
    stripePaymentIntentId: session.id,
    amount,
    currency: currency as any,
    status: 'succeeded',
    productName: planId || 'Subscription',
    metadata: { ...metadata, checkout_session: session.id },
  });

  // Send payment confirmation
  if (customerEmail) {
    const confirmationSent = await sendPaymentConfirmation({
      customerEmail,
      customerName,
      productName: planId || 'Subscription',
      amount,
      currency,
      transactionId: session.id,
      date: new Date().toLocaleDateString(),
    });

    if (confirmationSent) {
      console.log(`[Webhook] Payment confirmation sent to ${customerEmail}`);
    }
  }
}

/**
 * Handle customer.subscription.created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
  console.log(`[Webhook] Subscription created: ${subscription.id}`);

  const userId = parseInt(subscription.metadata?.user_id || '0');
  const planId = subscription.metadata?.plan_id || 'unknown';
  const customerEmail = subscription.metadata?.customer_email;

  if (!userId) {
    console.warn('[Webhook] Missing user_id for subscription');
    return;
  }

  // Save subscription to database
  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  await db.insert(subscriptions).values({
    userId,
    stripeSubscriptionId: subscription.id,
    plan: planId as any,
    status: 'active',
    currentPeriodStart: currentPeriodStart.toISOString(),
    currentPeriodEnd: currentPeriodEnd.toISOString(),
    cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
  });

  // Send welcome email
  if (customerEmail) {
    const welcomeSent = await sendSubscriptionWelcome({
      customerEmail,
      customerName: subscription.metadata?.customer_name,
      productName: planId,
      amount: subscription.items.data[0]?.price.unit_amount || 0,
      currency: (subscription.currency || 'usd').toUpperCase(),
      transactionId: subscription.id,
      date: new Date().toLocaleDateString(),
    });

    if (welcomeSent) {
      console.log(`[Webhook] Welcome email sent to ${customerEmail}`);
    }
  }
}

/**
 * Handle customer.subscription.updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
  console.log(`[Webhook] Subscription updated: ${subscription.id}`);

  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);

  // Update subscription in database
  await db
    .update(subscriptions)
    .set({
      status: subscription.status as any,
      currentPeriodStart: currentPeriodStart.toISOString(),
      currentPeriodEnd: currentPeriodEnd.toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ? 1 : 0,
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
}

/**
 * Handle customer.subscription.deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
  console.log(`[Webhook] Subscription deleted: ${subscription.id}`);

  const customerEmail = subscription.metadata?.customer_email;

  // Update subscription status in database
  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date().toISOString(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));

  // Send cancellation email
  if (customerEmail) {
    const cancellationSent = await sendSubscriptionCancellation({
      customerEmail,
      customerName: subscription.metadata?.customer_name,
      productName: subscription.metadata?.plan_id || 'Subscription',
      amount: subscription.items.data[0]?.price.unit_amount || 0,
      currency: (subscription.currency || 'usd').toUpperCase(),
      transactionId: subscription.id,
      date: new Date().toLocaleDateString(),
    });

    if (cancellationSent) {
      console.log(`[Webhook] Cancellation email sent to ${customerEmail}`);
    }
  }
}

/**
 * Handle invoice.payment_succeeded
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
  console.log(`[Webhook] Invoice payment succeeded: ${invoice.id}`);

  // Update payment status in database
  await db
    .update(payments)
    .set({ status: 'succeeded' })
    .where(eq(payments.stripePaymentIntentId, invoice.id));
}

/**
 * Handle invoice.upcoming - send renewal reminder
 */
async function handleInvoiceUpcoming(invoice: Stripe.Invoice): Promise<void> {
  console.log(`[Webhook] Invoice upcoming: ${invoice.id}`);

  const customerEmail = invoice.customer_email;
  const subscriptionId = invoice.subscription as string;

  if (!customerEmail || !subscriptionId) {
    console.warn('[Webhook] Missing email or subscription for upcoming invoice');
    return;
  }

  // Fetch subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const planId = subscription.metadata?.plan_id || 'Subscription';
  const amount = invoice.total || 0;
  const currency = (invoice.currency || 'usd').toUpperCase();

  // Send renewal reminder
  const reminderSent = await sendSubscriptionRenewalReminder({
    customerEmail,
    customerName: subscription.metadata?.customer_name,
    productName: planId,
    amount,
    currency,
    transactionId: invoice.id,
    date: new Date().toLocaleDateString(),
  });

  if (reminderSent) {
    console.log(`[Webhook] Renewal reminder sent to ${customerEmail}`);
  }
}
