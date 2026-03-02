import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface DonationTier {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  taxDeductible: boolean;
  impact: string;
}

export interface DonationSession {
  sessionId: string;
  donorEmail: string;
  donorName: string;
  amount: number;
  currency: string;
  taxDeductible: boolean;
  timestamp: number;
}

// Standard donation tiers for 501(c)(3) nonprofit
export const DONATION_TIERS: DonationTier[] = [
  {
    id: 'tier_supporter',
    name: 'Supporter',
    amount: 2500,
    currency: 'USD',
    description: 'Support our mission with a $25 donation',
    taxDeductible: true,
    impact: 'Provides 1 hour of broadcast time',
  },
  {
    id: 'tier_advocate',
    name: 'Advocate',
    amount: 5000,
    currency: 'USD',
    description: 'Become an Advocate with a $50 donation',
    taxDeductible: true,
    impact: 'Provides 5 hours of broadcast time',
  },
  {
    id: 'tier_champion',
    name: 'Champion',
    amount: 10000,
    currency: 'USD',
    description: 'Champion our cause with a $100 donation',
    taxDeductible: true,
    impact: 'Provides 20 hours of broadcast time',
  },
  {
    id: 'tier_visionary',
    name: 'Visionary',
    amount: 25000,
    currency: 'USD',
    description: 'Be a Visionary with a $250 donation',
    taxDeductible: true,
    impact: 'Provides 100 hours of broadcast time + recognition',
  },
];

/**
 * Create a donation checkout session
 */
export async function createDonationCheckout(params: {
  donorEmail: string;
  donorName: string;
  amount: number;
  tierId?: string;
  successUrl: string;
  cancelUrl: string;
  origin: string;
}) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to QUMUS 501(c)(3)',
              description: 'Tax-deductible donation supporting our mission',
              metadata: {
                donationTierId: params.tierId || 'custom',
                nonprofit: 'true',
              },
            },
            unit_amount: params.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: params.donorEmail,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        donorName: params.donorName,
        donorEmail: params.donorEmail,
        donationTierId: params.tierId || 'custom',
        nonprofit: 'true',
        taxDeductible: 'true',
      },
      allow_promotion_codes: true,
    });

    return {
      sessionId: session.id,
      url: session.url,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Donation checkout creation failed:', error);
    throw error;
  }
}

/**
 * Handle successful donation payment
 */
export function handleDonationSucceeded(paymentIntent: any) {
  return {
    stripePaymentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    donorEmail: paymentIntent.metadata?.donorEmail,
    donorName: paymentIntent.metadata?.donorName,
    donationTierId: paymentIntent.metadata?.donationTierId,
    taxDeductible: paymentIntent.metadata?.taxDeductible === 'true',
    status: 'succeeded',
    timestamp: Date.now(),
  };
}

/**
 * Handle checkout session completion
 */
export function handleCheckoutCompleted(session: any) {
  return {
    stripeSessionId: session.id,
    stripeCustomerId: session.customer,
    donorEmail: session.customer_email || session.metadata?.donorEmail,
    donorName: session.metadata?.donorName,
    donationTierId: session.metadata?.donationTierId,
    taxDeductible: session.metadata?.taxDeductible === 'true',
    status: 'completed',
    timestamp: Date.now(),
  };
}

/**
 * Generate tax receipt for donation
 */
export function generateTaxReceipt(donation: any) {
  const taxReceiptNumber = `TR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const amount = (donation.amount / 100).toFixed(2);

  return {
    receiptNumber: taxReceiptNumber,
    donorName: donation.donorName,
    donorEmail: donation.donorEmail,
    donationAmount: amount,
    donationCurrency: donation.currency || 'USD',
    donationDate: new Date().toLocaleDateString(),
    taxDeductible: true,
    taxStatement: `This donation of $${amount} is tax-deductible. Our EIN is 12-3456789. No goods or services were provided in exchange for this contribution.`,
    nonprofit: 'QUMUS 501(c)(3)',
    timestamp: Date.now(),
  };
}

/**
 * Get donation impact message
 */
export function getDonationImpact(amount: number): string {
  if (amount >= 25000) {
    return 'Your generous donation provides 100+ hours of broadcast time and helps us reach thousands in our community.';
  } else if (amount >= 10000) {
    return 'Your donation provides 20+ hours of broadcast time and strengthens our community impact.';
  } else if (amount >= 5000) {
    return 'Your donation provides 5+ hours of broadcast time and supports our mission.';
  } else if (amount >= 2500) {
    return 'Your donation provides 1+ hour of broadcast time and helps us continue our work.';
  }
  return 'Thank you for your generous donation to support our mission.';
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: Buffer,
  signature: string,
  secret: string
): any {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw error;
  }
}
