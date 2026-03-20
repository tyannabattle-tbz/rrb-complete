import { getDb } from '../db';
import { flowpayUsers, flowpayTransactions, flowpayPaymentPlans, flowpaySmartRoutes, flowpayPaymentLinks, flowpayAuditLog } from '../../drizzle/flowpay-schema';
import { eq, and, desc, gte, lt } from 'drizzle-orm';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-15.acacia' });

/**
 * FlowPay Service — Core Payment Operations
 * Stripe-first architecture: minimal local storage, all sensitive data in Stripe
 */

export class FlowpayService {
  /**
   * Initialize or get FlowPay user
   */
  static async initializeUser(userId: number, email: string, name?: string) {
    const db = await getDb();
    const existing = await db.query.flowpayUsers.findFirst({
      where: eq(flowpayUsers.userId, userId),
    });

    if (existing) return existing;

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: name || `User ${userId}`,
      metadata: { userId: userId.toString() },
    });

    // Store in local DB (minimal)
    const [user] = await db
      .insert(flowpayUsers)
      .values({
        userId,
        stripeCustomerId: customer.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .returning();

    return user;
  }

  /**
   * Send Money — Create payment intent
   */
  static async sendMoney(
    senderId: number,
    recipientId: number,
    amountCents: number,
    description?: string,
    metadata?: Record<string, any>
  ) {
    const db = await getDb();
    const sender = await db.query.flowpayUsers.findFirst({
      where: eq(flowpayUsers.userId, senderId),
    });
    if (!sender) throw new Error('Sender not found');

    const recipient = await db.query.flowpayUsers.findFirst({
      where: eq(flowpayUsers.userId, recipientId),
    });
    if (!recipient) throw new Error('Recipient not found');

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      customer: sender.stripeCustomerId,
      description: description || `Payment to user ${recipientId}`,
      metadata: {
        senderId: senderId.toString(),
        recipientId: recipientId.toString(),
        ...metadata,
      },
      automatic_payment_methods: { enabled: true },
    });

    // Record in local DB
    const [transaction] = await db
      .insert(flowpayTransactions)
      .values({
        senderId,
        recipientId,
        amount: amountCents,
        status: 'pending',
        stripePaymentIntentId: paymentIntent.id,
        description,
        metadata: JSON.stringify(metadata || {}),
        createdAt: Date.now(),
      })
      .returning();

    // Audit log
    await this.logAudit(senderId, 'send', 'transaction', transaction.id, {
      recipientId,
      amount: amountCents,
    });

    return {
      transaction,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Confirm Payment — Mark transaction as succeeded
   */
  static async confirmPayment(paymentIntentId: string) {
    const db = await getDb();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment intent status: ${paymentIntent.status}`);
    }

    // Update transaction
    const [updated] = await db
      .update(flowpayTransactions)
      .set({
        status: 'succeeded',
        completedAt: Date.now(),
      })
      .where(eq(flowpayTransactions.stripePaymentIntentId, paymentIntentId))
      .returning();

    if (updated) {
      await this.logAudit(updated.senderId, 'send', 'transaction', updated.id, {
        status: 'succeeded',
      });
    }

    return updated;
  }

  /**
   * Create Payment Plan — Recurring payments via Stripe Subscription
   */
  static async createPaymentPlan(
    senderId: number,
    recipientId: number,
    amountCents: number,
    frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'annual',
    totalInstallments?: number,
    description?: string,
    metadata?: Record<string, any>
  ) {
    const db = await getDb();
    const sender = await db.query.flowpayUsers.findFirst({
      where: eq(flowpayUsers.userId, senderId),
    });
    if (!sender) throw new Error('Sender not found');

    // Map frequency to Stripe interval
    const intervalMap: Record<string, 'week' | 'month' | 'year'> = {
      weekly: 'week',
      biweekly: 'week',
      monthly: 'month',
      quarterly: 'month',
      annual: 'year',
    };

    const intervalCount: Record<string, number> = {
      weekly: 1,
      biweekly: 2,
      monthly: 1,
      quarterly: 3,
      annual: 1,
    };

    // Create price (product + price)
    const product = await stripe.products.create({
      name: `Payment Plan: ${description || `User ${recipientId}`}`,
      metadata: { recipientId: recipientId.toString() },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: amountCents,
      currency: 'usd',
      recurring: {
        interval: intervalMap[frequency],
        interval_count: intervalCount[frequency],
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: sender.stripeCustomerId,
      items: [{ price: price.id }],
      metadata: {
        senderId: senderId.toString(),
        recipientId: recipientId.toString(),
        ...metadata,
      },
    });

    // Record in local DB
    const [plan] = await db
      .insert(flowpayPaymentPlans)
      .values({
        senderId,
        recipientId,
        amount: amountCents,
        frequency,
        totalInstallments,
        status: 'active',
        stripeSubscriptionId: subscription.id,
        nextChargeDate: subscription.current_period_end * 1000,
        description,
        metadata: JSON.stringify(metadata || {}),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
      .returning();

    await this.logAudit(senderId, 'plan_created', 'plan', plan.id, {
      recipientId,
      amount: amountCents,
      frequency,
    });

    return plan;
  }

  /**
   * Get Smart Route for User — QUMUS-optimized payment method
   */
  static async getSmartRoute(userId: number) {
    const db = await getDb();
    let route = await db.query.flowpaySmartRoutes.findFirst({
      where: eq(flowpaySmartRoutes.userId, userId),
    });

    if (!route) {
      // Create default route
      const [newRoute] = await db
        .insert(flowpaySmartRoutes)
        .values({
          userId,
          preferredMethod: 'stripe_card',
          lastUpdated: Date.now(),
        })
        .returning();
      route = newRoute;
    }

    return route;
  }

  /**
   * Update Smart Route — QUMUS learns from success/failure
   */
  static async updateSmartRoute(userId: number, success: boolean, processingTimeMs: number) {
    const db = await getDb();
    const route = await this.getSmartRoute(userId);

    const totalTx = route.totalTransactions + 1;
    const totalFailed = success ? route.totalFailed : route.totalFailed + 1;
    const successRate = (totalTx - totalFailed) / totalTx;

    const avgTime =
      route.avgProcessingTimeMs === 0
        ? processingTimeMs
        : (route.avgProcessingTimeMs * route.totalTransactions + processingTimeMs) / totalTx;

    await db
      .update(flowpaySmartRoutes)
      .set({
        successRate,
        avgProcessingTimeMs: Math.round(avgTime),
        totalTransactions: totalTx,
        totalFailed,
        lastUpdated: Date.now(),
      })
      .where(eq(flowpaySmartRoutes.userId, userId));
  }

  /**
   * Create Payment Link — Shareable on X, HybridCast, etc
   */
  static async createPaymentLink(
    senderId: number,
    amountCents: number,
    description?: string,
    expiresInHours?: number,
    source?: 'x' | 'hybridcast' | 'squadd' | 'content_calendar',
    metadata?: Record<string, any>
  ) {
    const db = await getDb();
    const linkId = Math.random().toString(36).substring(2, 10);

    const [link] = await db
      .insert(flowpayPaymentLinks)
      .values({
        linkId,
        senderId,
        amount: amountCents,
        description,
        expiresAt: expiresInHours ? Date.now() + expiresInHours * 3600000 : undefined,
        source,
        metadata: JSON.stringify(metadata || {}),
        createdAt: Date.now(),
      })
      .returning();

    return {
      ...link,
      url: `${process.env.VITE_APP_FRONTEND_URL || 'https://manusweb.sbs'}/flowpay/pay/${linkId}`,
    };
  }

  /**
   * Get Transaction History
   */
  static async getTransactionHistory(userId: number, limit = 50, offset = 0) {
    const db = await getDb();
    return db.query.flowpayTransactions.findMany({
      where: (tx: any) => ({
        [Symbol.for('or')]: [eq(tx.senderId, userId), eq(tx.recipientId, userId)],
      }),
      orderBy: desc(flowpayTransactions.createdAt),
      limit,
      offset,
    });
  }

  /**
   * Get Active Payment Plans
   */
  static async getActivePaymentPlans(userId: number) {
    const db = await getDb();
    return db.query.flowpayPaymentPlans.findMany({
      where: and(
        eq(flowpayPaymentPlans.senderId, userId),
        eq(flowpayPaymentPlans.status, 'active')
      ),
    });
  }

  /**
   * Process Scheduled Charges — Called by QUMUS scheduler
   */
  static async processScheduledCharges() {
    const db = await getDb();
    const now = Date.now();

    // Get all plans due for charging
    const duePlans = await db.query.flowpayPaymentPlans.findMany({
      where: and(
        eq(flowpayPaymentPlans.status, 'active'),
        gte(flowpayPaymentPlans.nextChargeDate, now),
        lt(flowpayPaymentPlans.nextChargeDate, now + 60000) // within 1 minute
      ),
    });

    for (const plan of duePlans) {
      try {
        // Stripe handles the actual charge via subscription
        // Just update our record
        await db
          .update(flowpayPaymentPlans)
          .set({
            completedInstallments: (plan.completedInstallments || 0) + 1,
            updatedAt: Date.now(),
          })
          .where(eq(flowpayPaymentPlans.id, plan.id));

        await this.logAudit(plan.senderId, 'plan_charged', 'plan', plan.id, {
          recipientId: plan.recipientId,
        });
      } catch (e) {
        console.error(`[FlowPay] Failed to process plan ${plan.id}:`, e);
      }
    }
  }

  /**
   * Audit Log
   */
  private static async logAudit(
    userId: number,
    action: string,
    entityType: string,
    entityId: number,
    details?: Record<string, any>
  ) {
    const db = await getDb();
    await db.insert(flowpayAuditLog).values({
      userId,
      action,
      entityType,
      entityId,
      details: JSON.stringify(details || {}),
      createdAt: Date.now(),
    });
  }
}
