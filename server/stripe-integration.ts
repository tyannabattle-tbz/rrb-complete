import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

if (!STRIPE_SECRET_KEY) {
  console.warn('[Stripe] Warning: STRIPE_SECRET_KEY not configured');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

/**
 * Tier pricing configuration
 */
export const TIER_PRICING = {
  free: {
    name: 'Free',
    price: 0,
    stripePriceId: null,
    features: ['Band Chat', 'Recording Archive', 'Setlist Generator'],
  },
  professional: {
    name: 'Professional',
    price: 4999, // $49.99 in cents
    stripePriceId: process.env.STRIPE_PRICE_PROFESSIONAL || 'price_professional',
    features: [
      'Everything in Free',
      'Sound DNA Engine',
      'AI Mastering',
      'Video Production',
      'Unlimited Storage',
    ],
  },
  advanced: {
    name: 'Advanced',
    price: 9999, // $99.99 in cents
    stripePriceId: process.env.STRIPE_PRICE_ADVANCED || 'price_advanced',
    features: [
      'Everything in Professional',
      'Holographic Capture',
      'Wellness Integration',
      '100% QUMUS Autonomous Control',
      'Priority Support',
    ],
  },
};

/**
 * Create a checkout session for tier upgrade
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  tier: 'professional' | 'advanced',
  successUrl: string,
  cancelUrl: string
) {
  try {
    const tierConfig = TIER_PRICING[tier];

    if (!tierConfig.stripePriceId) {
      throw new Error(`No Stripe price ID configured for tier: ${tier}`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        userId,
        tier,
        userEmail,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
    });

    console.log(`[Stripe] Checkout session created for user ${userId}, tier: ${tier}`);

    return {
      sessionId: session.id,
      url: session.url,
      success: true,
    };
  } catch (error) {
    console.error('[Stripe] Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Handle webhook events
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(
          `[Stripe] Checkout completed for user: ${session.client_reference_id}, tier: ${session.metadata?.tier}`
        );
        // TODO: Update user tier in database
        break;

      case 'customer.subscription.created':
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription created: ${subscription.id}`);
        // TODO: Update user subscription in database
        break;

      case 'customer.subscription.updated':
        const updatedSubscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription updated: ${updatedSubscription.id}`);
        // TODO: Update user subscription status
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log(`[Stripe] Subscription deleted: ${deletedSubscription.id}`);
        // TODO: Downgrade user to free tier
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Stripe] Invoice paid: ${invoice.id}`);
        // TODO: Log payment for accounting
        break;

      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('[Stripe] Error handling webhook:', error);
    throw error;
  }
}

/**
 * Get subscription details
 */
export async function getSubscriptionDetails(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('[Stripe] Error retrieving subscription:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.del(subscriptionId);
    console.log(`[Stripe] Subscription cancelled: ${subscriptionId}`);
    return subscription;
  } catch (error) {
    console.error('[Stripe] Error cancelling subscription:', error);
    throw error;
  }
}

/**
 * Get customer details
 */
export async function getCustomerDetails(customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('[Stripe] Error retrieving customer:', error);
    throw error;
  }
}

/**
 * Create a customer
 */
export async function createCustomer(email: string, name: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });
    console.log(`[Stripe] Customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    console.error('[Stripe] Error creating customer:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(body: string, signature: string): Stripe.Event | null {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
    return event;
  } catch (error) {
    console.error('[Stripe] Webhook signature verification failed:', error);
    return null;
  }
}

/**
 * Get tier upgrade URL
 */
export function getTierUpgradeUrl(tier: 'professional' | 'advanced'): string {
  return `/checkout?tier=${tier}`;
}
