/**
 * Stripe Payment Integration Service
 * Handles creator royalty payouts, donations, and financial transactions
 * Integrated with Creator Marketplace for automated revenue distribution
 */

import Stripe from 'stripe';

export interface PaymentAccount {
  creatorId: string;
  stripeAccountId: string;
  email: string;
  status: 'active' | 'pending' | 'restricted' | 'closed';
  balance: number;
  pendingBalance: number;
  lastPayout?: number;
}

export interface Payout {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'cancelled';
  stripePayoutId?: string;
  createdAt: number;
  arrivedAt?: number;
  failureReason?: string;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorEmail: string;
  message?: string;
  purpose: 'legacy_recovery' | 'general_support' | 'content_creation';
  status: 'pending' | 'succeeded' | 'failed';
  stripeChargeId?: string;
  createdAt: number;
}

export class StripePaymentIntegration {
  private stripe: Stripe;
  private paymentAccounts: Map<string, PaymentAccount> = new Map();
  private payouts: Payout[] = [];
  private donations: Donation[] = [];
  private platformFeePercentage = 15; // 15% platform fee
  private minimumPayout = 5; // $5 minimum payout

  constructor(apiKey: string) {
    this.stripe = new Stripe(apiKey, {
      apiVersion: '2023-10-16',
    });
    console.log('[Stripe Integration] Initialized with API key');
  }

  /**
   * Create connected account for creator
   */
  async createConnectedAccount(
    creatorId: string,
    email: string,
    name: string,
  ): Promise<PaymentAccount> {
    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        email,
        business_profile: {
          name: `${name} - RRB Creator`,
          url: 'https://rrb.manus.space',
        },
        capabilities: {
          transfers: { requested: true },
        },
      });

      const paymentAccount: PaymentAccount = {
        creatorId,
        stripeAccountId: account.id,
        email,
        status: 'pending',
        balance: 0,
        pendingBalance: 0,
      };

      this.paymentAccounts.set(creatorId, paymentAccount);
      console.log(`[Stripe Integration] Connected account created for ${name}`);

      return paymentAccount;
    } catch (error) {
      console.error('[Stripe Integration] Failed to create connected account:', error);
      throw error;
    }
  }

  /**
   * Get account link for onboarding
   */
  async getAccountLink(creatorId: string, refreshUrl: string, returnUrl: string): Promise<string> {
    const account = this.paymentAccounts.get(creatorId);
    if (!account) {
      throw new Error('Payment account not found');
    }

    try {
      const link = await this.stripe.accountLinks.create({
        account: account.stripeAccountId,
        type: 'account_onboarding',
        refresh_url: refreshUrl,
        return_url: returnUrl,
      });

      return link.url;
    } catch (error) {
      console.error('[Stripe Integration] Failed to get account link:', error);
      throw error;
    }
  }

  /**
   * Add funds to creator balance
   */
  addFundsToBalance(creatorId: string, amount: number, source: string): void {
    const account = this.paymentAccounts.get(creatorId);
    if (!account) return;

    account.pendingBalance += amount;
    console.log(`[Stripe Integration] Added $${amount} to ${creatorId} pending balance (source: ${source})`);
  }

  /**
   * Process payout for creator
   */
  async processPayout(creatorId: string, amount?: number): Promise<Payout> {
    const account = this.paymentAccounts.get(creatorId);
    if (!account) {
      throw new Error('Payment account not found');
    }

    const payoutAmount = amount || account.pendingBalance;

    if (payoutAmount < this.minimumPayout) {
      throw new Error(`Payout amount must be at least $${this.minimumPayout}`);
    }

    if (account.status !== 'active') {
      throw new Error('Account not active for payouts');
    }

    try {
      // Convert dollars to cents for Stripe
      const amountInCents = Math.round(payoutAmount * 100);

      const payout = await this.stripe.payouts.create(
        {
          amount: amountInCents,
          currency: 'usd',
          method: 'instant',
        },
        {
          stripeAccount: account.stripeAccountId,
        },
      );

      const payoutRecord: Payout = {
        id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        creatorId,
        amount: payoutAmount,
        currency: 'usd',
        status: 'pending',
        stripePayoutId: payout.id,
        createdAt: Date.now(),
      };

      this.payouts.push(payoutRecord);
      account.pendingBalance -= payoutAmount;
      account.balance += payoutAmount;
      account.lastPayout = Date.now();

      console.log(`[Stripe Integration] Payout processed: $${payoutAmount} for ${creatorId}`);

      return payoutRecord;
    } catch (error) {
      console.error('[Stripe Integration] Failed to process payout:', error);
      throw error;
    }
  }

  /**
   * Create donation charge
   */
  async createDonation(
    amount: number,
    donorEmail: string,
    purpose: 'legacy_recovery' | 'general_support' | 'content_creation',
    message?: string,
  ): Promise<Donation> {
    try {
      // Note: In production, use Stripe Payment Intent or Checkout Session
      // This is a simplified version for demonstration

      const donation: Donation = {
        id: `donation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency: 'usd',
        donorEmail,
        message,
        purpose,
        status: 'pending',
        createdAt: Date.now(),
      };

      this.donations.push(donation);
      console.log(`[Stripe Integration] Donation created: $${amount} for ${purpose}`);

      return donation;
    } catch (error) {
      console.error('[Stripe Integration] Failed to create donation:', error);
      throw error;
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(creatorId: string): Promise<{ available: number; pending: number }> {
    const account = this.paymentAccounts.get(creatorId);
    if (!account) {
      throw new Error('Payment account not found');
    }

    try {
      const balance = await this.stripe.balance.retrieve({
        stripeAccount: account.stripeAccountId,
      });

      return {
        available: (balance.available[0]?.amount || 0) / 100,
        pending: (balance.pending[0]?.amount || 0) / 100,
      };
    } catch (error) {
      console.error('[Stripe Integration] Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Get payout history
   */
  getPayoutHistory(creatorId: string, limit: number = 50): Payout[] {
    return this.payouts.filter((p) => p.creatorId === creatorId).slice(-limit);
  }

  /**
   * Get donation history
   */
  getDonationHistory(limit: number = 100): Donation[] {
    return this.donations.slice(-limit);
  }

  /**
   * Get payment statistics
   */
  getPaymentStats() {
    const totalPayouts = this.payouts.reduce((sum, p) => sum + p.amount, 0);
    const totalDonations = this.donations.reduce((sum, d) => sum + d.amount, 0);
    const successfulPayouts = this.payouts.filter((p) => p.status === 'paid').length;
    const successfulDonations = this.donations.filter((d) => d.status === 'succeeded').length;

    return {
      totalPayouts,
      totalDonations,
      totalCreators: this.paymentAccounts.size,
      successfulPayouts,
      successfulDonations,
      platformEarnings: totalPayouts * (this.platformFeePercentage / 100),
      creatorEarnings: totalPayouts * ((100 - this.platformFeePercentage) / 100),
    };
  }

  /**
   * Get payment account
   */
  getPaymentAccount(creatorId: string): PaymentAccount | undefined {
    return this.paymentAccounts.get(creatorId);
  }

  /**
   * Get all payment accounts
   */
  getAllPaymentAccounts(): PaymentAccount[] {
    return Array.from(this.paymentAccounts.values());
  }

  /**
   * Update account status
   */
  updateAccountStatus(
    creatorId: string,
    status: 'active' | 'pending' | 'restricted' | 'closed',
  ): void {
    const account = this.paymentAccounts.get(creatorId);
    if (account) {
      account.status = status;
      console.log(`[Stripe Integration] Account status updated for ${creatorId}: ${status}`);
    }
  }
}

// Singleton instance (requires STRIPE_SECRET_KEY env var)
const apiKey = process.env.STRIPE_SECRET_KEY;
if (!apiKey) {
  console.warn('[Stripe Integration] STRIPE_SECRET_KEY not configured');
}
export const stripePaymentIntegration = apiKey ? new StripePaymentIntegration(apiKey) : null;
