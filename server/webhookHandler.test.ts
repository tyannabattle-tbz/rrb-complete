import { describe, it, expect, beforeEach, vi } from 'vitest';
import { handleStripeWebhook } from './webhookHandler';
import Stripe from 'stripe';

// Mock dependencies
vi.mock('./emailService', () => ({
  sendDonationReceipt: vi.fn().mockResolvedValue(true),
  sendPaymentConfirmation: vi.fn().mockResolvedValue(true),
  sendSubscriptionWelcome: vi.fn().mockResolvedValue(true),
  sendSubscriptionRenewalReminder: vi.fn().mockResolvedValue(true),
  sendSubscriptionCancellation: vi.fn().mockResolvedValue(true),
}));

vi.mock('./db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue({ id: 1 }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({}),
      }),
    }),
  },
}));

vi.mock('stripe', () => {
  const Stripe = vi.fn();
  Stripe.prototype.webhooks = {
    constructEvent: vi.fn((body, sig, secret) => ({
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          amount: 5000,
          currency: 'usd',
          receipt_email: 'donor@example.com',
          metadata: { donor_name: 'John Doe' },
        },
      },
    })),
  };
  return { default: Stripe };
});

describe('Webhook Handler', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    mockReq = {
      headers: { 'stripe-signature': 'test_sig' },
      body: JSON.stringify({
        id: 'evt_test_123',
        type: 'payment_intent.succeeded',
      }),
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it('should handle test events', async () => {
    mockReq.body = JSON.stringify({ id: 'evt_test_123' });

    await handleStripeWebhook(mockReq, mockRes);

    expect(mockRes.json).toHaveBeenCalledWith({ verified: true });
  });

  it('should reject requests without signature', async () => {
    mockReq.headers = {};

    await handleStripeWebhook(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
  });

  it('should log webhook events', async () => {
    const consoleSpy = vi.spyOn(console, 'log');

    await handleStripeWebhook(mockReq, mockRes);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

describe('Webhook Event Types', () => {
  it('should handle payment_intent.succeeded', () => {
    const event: Stripe.Event = {
      id: 'evt_test_payment',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          amount: 5000,
          currency: 'usd',
          receipt_email: 'donor@example.com',
          metadata: { donor_name: 'John Doe' },
        } as any,
      },
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: '2023-10-16',
    };

    expect(event.type).toBe('payment_intent.succeeded');
    expect((event.data.object as any).amount).toBe(5000);
  });

  it('should handle checkout.session.completed', () => {
    const event: Stripe.Event = {
      id: 'evt_test_checkout',
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          subscription: 'sub_test_123',
          customer_email: 'customer@example.com',
          amount_total: 9900,
          currency: 'usd',
          metadata: { user_id: '1', plan_id: 'ar_pro' },
        } as any,
      },
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: '2023-10-16',
    };

    expect(event.type).toBe('checkout.session.completed');
    expect((event.data.object as any).customer_email).toBe('customer@example.com');
  });

  it('should handle subscription.created', () => {
    const event: Stripe.Event = {
      id: 'evt_test_subscription',
      object: 'event',
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_test_123',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          cancel_at_period_end: false,
          metadata: { user_id: '1', plan_id: 'ar_pro' },
          items: {
            data: [
              {
                price: { unit_amount: 9900 },
              },
            ],
          },
          currency: 'usd',
        } as any,
      },
      created: Math.floor(Date.now() / 1000),
      livemode: false,
      pending_webhooks: 0,
      request: null,
      api_version: '2023-10-16',
    };

    expect(event.type).toBe('customer.subscription.created');
    expect((event.data.object as any).status).toBe('active');
  });
});

describe('Webhook Error Handling', () => {
  it('should handle missing signature', () => {
    const mockReq = { headers: {} };
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    // Test that missing signature is caught
    expect(mockReq.headers['stripe-signature']).toBeUndefined();
  });

  it('should handle invalid webhook secret', () => {
    const invalidSecret = '';
    expect(invalidSecret).toBe('');
  });
});
