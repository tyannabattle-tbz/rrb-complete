/**
 * Recurring Donation Service
 * Handles Stripe subscription setup for recurring donations
 */

import Stripe from 'stripe';
import { getDb } from '../db';
import { notificationService } from './notificationService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface RecurringDonation {
  id: string;
  donor_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  status: 'active' | 'paused' | 'cancelled';
  campaign_id?: string;
  created_at: number;
  next_billing_date?: number;
}

export class RecurringDonationService {
  /**
   * Create a recurring donation subscription
   */
  async createRecurringDonation(
    donorId: string,
    email: string,
    amount: number,
    interval: 'monthly' | 'yearly' = 'monthly',
    campaignId?: string
  ): Promise<RecurringDonation> {
    try {
      // Create or get Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          donor_id: donorId,
        },
      });

      // Create price for recurring donation
      const price = await stripe.prices.create({
        currency: 'usd',
        unit_amount: Math.round(amount * 100),
        recurring: {
          interval: interval === 'yearly' ? 'year' : 'month',
          interval_count: 1,
        },
        product_data: {
          name: `Sweet Miracles Recurring Donation - ${interval}`,
          description: `Support Sweet Miracles with a ${interval} donation of $${amount}`,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price: price.id,
          },
        ],
        metadata: {
          donor_id: donorId,
          campaign_id: campaignId || 'general',
        },
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
      });

      // Save to database
      const db = await getDb();
      const recurringDonation: RecurringDonation = {
        id: `recurring-${Date.now()}`,
        donor_id: donorId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        amount,
        currency: 'usd',
        interval,
        status: 'active',
        campaign_id: campaignId,
        created_at: Date.now(),
        next_billing_date: subscription.current_period_end * 1000,
      };

      await db.run(
        `INSERT INTO recurring_donations 
         (id, donor_id, stripe_subscription_id, stripe_customer_id, amount, currency, interval, status, campaign_id, created_at, next_billing_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recurringDonation.id,
          recurringDonation.donor_id,
          recurringDonation.stripe_subscription_id,
          recurringDonation.stripe_customer_id,
          recurringDonation.amount,
          recurringDonation.currency,
          recurringDonation.interval,
          recurringDonation.status,
          recurringDonation.campaign_id,
          recurringDonation.created_at,
          recurringDonation.next_billing_date,
        ]
      );

      // Send notification
      await notificationService.sendNotification(donorId, {
        type: 'system_alert',
        title: '💝 Recurring Donation Started',
        message: `Your ${interval} donation of $${amount} has been set up successfully`,
        severity: 'success',
        data: { amount, interval },
      });

      return recurringDonation;
    } catch (error) {
      console.error('Failed to create recurring donation:', error);
      throw error;
    }
  }

  /**
   * Pause a recurring donation
   */
  async pauseRecurringDonation(donationId: string): Promise<void> {
    try {
      const db = await getDb();
      const donation = await db.get(
        'SELECT * FROM recurring_donations WHERE id = ?',
        [donationId]
      );

      if (!donation) {
        throw new Error('Donation not found');
      }

      // Pause subscription
      await stripe.subscriptions.update(donation.stripe_subscription_id, {
        pause_collection: {
          behavior: 'mark_uncollectible',
        },
      });

      // Update database
      await db.run(
        'UPDATE recurring_donations SET status = ? WHERE id = ?',
        ['paused', donationId]
      );

      // Send notification
      await notificationService.sendNotification(donation.donor_id, {
        type: 'system_alert',
        title: '⏸️ Donation Paused',
        message: `Your recurring donation has been paused`,
        severity: 'info',
      });
    } catch (error) {
      console.error('Failed to pause recurring donation:', error);
      throw error;
    }
  }

  /**
   * Resume a paused recurring donation
   */
  async resumeRecurringDonation(donationId: string): Promise<void> {
    try {
      const db = await getDb();
      const donation = await db.get(
        'SELECT * FROM recurring_donations WHERE id = ?',
        [donationId]
      );

      if (!donation) {
        throw new Error('Donation not found');
      }

      // Resume subscription
      await stripe.subscriptions.update(donation.stripe_subscription_id, {
        pause_collection: undefined,
      });

      // Update database
      await db.run(
        'UPDATE recurring_donations SET status = ? WHERE id = ?',
        ['active', donationId]
      );

      // Send notification
      await notificationService.sendNotification(donation.donor_id, {
        type: 'system_alert',
        title: '▶️ Donation Resumed',
        message: `Your recurring donation has been resumed`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to resume recurring donation:', error);
      throw error;
    }
  }

  /**
   * Cancel a recurring donation
   */
  async cancelRecurringDonation(donationId: string): Promise<void> {
    try {
      const db = await getDb();
      const donation = await db.get(
        'SELECT * FROM recurring_donations WHERE id = ?',
        [donationId]
      );

      if (!donation) {
        throw new Error('Donation not found');
      }

      // Cancel subscription
      await stripe.subscriptions.del(donation.stripe_subscription_id);

      // Update database
      await db.run(
        'UPDATE recurring_donations SET status = ? WHERE id = ?',
        ['cancelled', donationId]
      );

      // Send notification
      await notificationService.sendNotification(donation.donor_id, {
        type: 'system_alert',
        title: '❌ Donation Cancelled',
        message: `Your recurring donation has been cancelled`,
        severity: 'info',
      });
    } catch (error) {
      console.error('Failed to cancel recurring donation:', error);
      throw error;
    }
  }

  /**
   * Update donation amount
   */
  async updateDonationAmount(donationId: string, newAmount: number): Promise<void> {
    try {
      const db = await getDb();
      const donation = await db.get(
        'SELECT * FROM recurring_donations WHERE id = ?',
        [donationId]
      );

      if (!donation) {
        throw new Error('Donation not found');
      }

      // Get subscription
      const subscription = await stripe.subscriptions.retrieve(
        donation.stripe_subscription_id
      );

      // Update subscription with new price
      const newPrice = await stripe.prices.create({
        currency: 'usd',
        unit_amount: Math.round(newAmount * 100),
        recurring: {
          interval: donation.interval === 'yearly' ? 'year' : 'month',
          interval_count: 1,
        },
        product_data: {
          name: `Sweet Miracles Recurring Donation - ${donation.interval}`,
        },
      });

      await stripe.subscriptions.update(donation.stripe_subscription_id, {
        items: [
          {
            id: subscription.items.data[0].id,
            price: newPrice.id,
          },
        ],
      });

      // Update database
      await db.run(
        'UPDATE recurring_donations SET amount = ? WHERE id = ?',
        [newAmount, donationId]
      );

      // Send notification
      await notificationService.sendNotification(donation.donor_id, {
        type: 'system_alert',
        title: '💰 Donation Amount Updated',
        message: `Your recurring donation amount has been updated to $${newAmount}`,
        severity: 'success',
      });
    } catch (error) {
      console.error('Failed to update donation amount:', error);
      throw error;
    }
  }

  /**
   * Get donor's recurring donations
   */
  async getDonorRecurringDonations(donorId: string): Promise<RecurringDonation[]> {
    try {
      const db = await getDb();
      const donations = await db.all(
        'SELECT * FROM recurring_donations WHERE donor_id = ? ORDER BY created_at DESC',
        [donorId]
      );

      return donations.map(d => ({
        id: d.id,
        donor_id: d.donor_id,
        stripe_subscription_id: d.stripe_subscription_id,
        stripe_customer_id: d.stripe_customer_id,
        amount: d.amount,
        currency: d.currency,
        interval: d.interval,
        status: d.status,
        campaign_id: d.campaign_id,
        created_at: d.created_at,
        next_billing_date: d.next_billing_date,
      }));
    } catch (error) {
      console.error('Failed to get recurring donations:', error);
      return [];
    }
  }

  /**
   * Get campaign recurring donation stats
   */
  async getCampaignRecurringStats(campaignId: string) {
    try {
      const db = await getDb();
      const stats = await db.get(
        `SELECT 
          COUNT(*) as total_donors,
          SUM(amount) as monthly_recurring,
          AVG(amount) as avg_donation,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_donors
         FROM recurring_donations 
         WHERE campaign_id = ?`,
        [campaignId]
      );

      return {
        total_donors: stats.total_donors || 0,
        monthly_recurring: (stats.monthly_recurring || 0) / 12, // Convert to monthly if yearly
        avg_donation: stats.avg_donation || 0,
        active_donors: stats.active_donors || 0,
      };
    } catch (error) {
      console.error('Failed to get campaign stats:', error);
      return {
        total_donors: 0,
        monthly_recurring: 0,
        avg_donation: 0,
        active_donors: 0,
      };
    }
  }
}

export const recurringDonationService = new RecurringDonationService();
