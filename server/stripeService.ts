import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
});

export interface CheckoutSessionParams {
  userId: string;
  userEmail: string;
  userName: string;
  productName: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  promoCode?: string;
}

/**
 * Create a Stripe checkout session for premium features
 */
export async function createCheckoutSession(params: CheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: params.priceId, quantity: 1 }],
      mode: 'payment',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.userEmail,
      client_reference_id: params.userId,
      metadata: {
        userId: params.userId,
        userEmail: params.userEmail,
        userName: params.userName,
        productName: params.productName,
      },
      allow_promotion_codes: true,
    });
    return session;
  } catch (error) {
    console.error('[Stripe] Checkout failed:', error);
    throw error;
  }
}

/**
 * Handle payment_intent.succeeded webhook
 */
export async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('[Stripe] Payment succeeded:', paymentIntent.id);
  return {
    stripePaymentId: paymentIntent.id,
    amount: paymentIntent.amount,
    status: 'succeeded',
    timestamp: new Date(),
  };
}

/**
 * Handle checkout.session.completed webhook
 */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('[Stripe] Checkout completed:', session.id);
  return {
    stripeSessionId: session.id,
    userId: session.client_reference_id,
    status: 'completed',
    timestamp: new Date(),
  };
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(body: Buffer, signature: string) {
  try {
    return stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (error) {
    console.error('[Stripe] Webhook verification failed:', error);
    return null;
  }
}
