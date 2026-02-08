import Stripe from 'stripe';
import crypto from 'crypto';

export interface PaymentConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'processing' | 'requires_payment_method';
  clientSecret: string;
  metadata: Record<string, string>;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  customerId: string;
  amount: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  paidAt?: number;
  dueDate?: number;
}

export class StripePaymentService {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(config: PaymentConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: '2023-10-16',
    });
    this.webhookSecret = config.webhookSecret;
  }

  /**
   * Create a payment intent for broadcast monetization
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata?: Record<string, string>
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata: {
          ...metadata,
          createdAt: new Date().toISOString(),
        },
      });

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status as any,
        clientSecret: paymentIntent.client_secret || '',
        metadata: paymentIntent.metadata || {},
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(
        paymentIntentId,
        {
          payment_method: paymentMethodId,
        }
      );

      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: paymentIntent.status as any,
        clientSecret: paymentIntent.client_secret || '',
        metadata: paymentIntent.metadata || {},
      };
    } catch (error) {
      console.error('Failed to confirm payment intent:', error);
      throw error;
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(
    email: string,
    metadata?: Record<string, string>
  ): Promise<string> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        metadata,
      });
      return customer.id;
    } catch (error) {
      console.error('Failed to create customer:', error);
      throw error;
    }
  }

  /**
   * Create a subscription
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    metadata?: Record<string, string>
  ): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        metadata,
      });

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        priceId,
        status: subscription.status as any,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Failed to create subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.del(subscriptionId);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        priceId: (subscription.items.data[0]?.price.id as string) || '',
        status: subscription.status as any,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await this.stripe.subscriptions.retrieve(
        subscriptionId
      );

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        priceId: (subscription.items.data[0]?.price.id as string) || '',
        status: subscription.status as any,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    } catch (error) {
      console.error('Failed to get subscription:', error);
      throw error;
    }
  }

  /**
   * Create an invoice
   */
  async createInvoice(
    customerId: string,
    amount: number,
    description?: string
  ): Promise<Invoice> {
    try {
      const invoice = await this.stripe.invoices.create({
        customer: customerId,
        collection_method: 'send_invoice',
        days_until_due: 30,
      });

      // Add invoice item
      await this.stripe.invoiceItems.create({
        customer: customerId,
        invoice: invoice.id,
        amount: Math.round(amount * 100),
        currency: 'usd',
        description,
      });

      // Finalize invoice
      const finalizedInvoice = await this.stripe.invoices.finalizeInvoice(
        invoice.id
      );

      return {
        id: finalizedInvoice.id,
        customerId: finalizedInvoice.customer as string,
        amount: finalizedInvoice.amount_due / 100,
        status: finalizedInvoice.status as any,
        dueDate: finalizedInvoice.due_date || undefined,
      };
    } catch (error) {
      console.error('Failed to create invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice details
   */
  async getInvoice(invoiceId: string): Promise<Invoice> {
    try {
      const invoice = await this.stripe.invoices.retrieve(invoiceId);

      return {
        id: invoice.id,
        customerId: invoice.customer as string,
        amount: invoice.amount_due / 100,
        status: invoice.status as any,
        paidAt: invoice.paid_at || undefined,
        dueDate: invoice.due_date || undefined,
      };
    } catch (error) {
      console.error('Failed to get invoice:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    body: string,
    signature: string
  ): Record<string, any> | null {
    try {
      const event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.webhookSecret
      );
      return event;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return null;
    }
  }

  /**
   * Handle webhook event
   */
  async handleWebhookEvent(event: any): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaid(event.data.object);
        break;
      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    // Implement your business logic here
    // e.g., update broadcast status, send confirmation email, etc.
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    console.log(`Payment failed: ${paymentIntent.id}`);
    // Implement your business logic here
    // e.g., notify user, retry payment, etc.
  }

  /**
   * Handle subscription update
   */
  private async handleSubscriptionUpdated(subscription: any): Promise<void> {
    console.log(`Subscription updated: ${subscription.id}`);
    // Implement your business logic here
  }

  /**
   * Handle subscription deletion
   */
  private async handleSubscriptionDeleted(subscription: any): Promise<void> {
    console.log(`Subscription deleted: ${subscription.id}`);
    // Implement your business logic here
  }

  /**
   * Handle invoice paid
   */
  private async handleInvoicePaid(invoice: any): Promise<void> {
    console.log(`Invoice paid: ${invoice.id}`);
    // Implement your business logic here
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<{
    isConfigured: boolean;
    hasSecretKey: boolean;
    hasWebhookSecret: boolean;
  }> {
    return {
      isConfigured: !!this.stripe,
      hasSecretKey: true,
      hasWebhookSecret: !!this.webhookSecret,
    };
  }
}

// Singleton instance
let stripeService: StripePaymentService | null = null;

export function getStripeService(): StripePaymentService {
  if (!stripeService) {
    const config: PaymentConfig = {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    };
    stripeService = new StripePaymentService(config);
  }
  return stripeService;
}

export function initializeStripe(config: PaymentConfig): StripePaymentService {
  stripeService = new StripePaymentService(config);
  return stripeService;
}
