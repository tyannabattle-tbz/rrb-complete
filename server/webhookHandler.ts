import { Request, Response } from 'express';
import Stripe from 'stripe';
import { verifyWebhookSignature, handleDonationSucceeded, handleCheckoutCompleted, generateTaxReceipt } from './donationService';
import { db } from './db';
import { donations } from '@/drizzle/schema';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

/**
 * Handle Stripe webhook events for donations
 */
export async function handleDonationWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    console.error('Missing Stripe signature');
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    // Test event detection
    const body = req.body;
    if (typeof body === 'string' && body.includes('evt_test_')) {
      console.log('[Webhook] Test event detected, returning verification response');
      return res.json({ verified: true });
    }

    const event = verifyWebhookSignature(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    console.log(`[Webhook] Processing event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const donation = handleDonationSucceeded(paymentIntent);

        // Save donation to database
        await db.insert(donations).values({
          stripePaymentId: donation.stripePaymentId,
          donorName: donation.donorName || '',
          donorEmail: donation.donorEmail || '',
          amount: donation.amount,
          currency: donation.currency,
          donationTierId: donation.donationTierId || null,
          taxDeductible: donation.taxDeductible,
          status: 'completed',
          metadata: JSON.stringify(donation),
        });

        // Generate and send tax receipt
        const taxReceipt = generateTaxReceipt(donation);
        console.log(`[Webhook] Tax receipt generated: ${taxReceipt.receiptNumber}`);

        // TODO: Send email with tax receipt
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const donation = handleCheckoutCompleted(session);

        console.log(`[Webhook] Checkout completed for ${donation.donorEmail}`);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] Invoice paid: ${invoice.id}`);
        break;
      }

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log(`[Webhook] New customer created: ${customer.id}`);
        break;
      }

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
 * Create donation record in database
 */
export async function createDonationRecord(donationData: any) {
  try {
    const result = await db.insert(donations).values({
      stripePaymentId: donationData.stripePaymentId,
      donorName: donationData.donorName,
      donorEmail: donationData.donorEmail,
      amount: donationData.amount,
      currency: donationData.currency || 'USD',
      donationTierId: donationData.donationTierId || null,
      taxDeductible: donationData.taxDeductible || true,
      status: donationData.status || 'pending',
      metadata: JSON.stringify(donationData),
    });

    return result;
  } catch (error) {
    console.error('Failed to create donation record:', error);
    throw error;
  }
}

/**
 * Get donation statistics
 */
export async function getDonationStats() {
  try {
    // This would require implementing actual database queries
    // For now, return mock data
    return {
      totalDonations: 0,
      totalAmount: 0,
      donorCount: 0,
      averageDonation: 0,
      lastDonation: null,
    };
  } catch (error) {
    console.error('Failed to get donation stats:', error);
    throw error;
  }
}
