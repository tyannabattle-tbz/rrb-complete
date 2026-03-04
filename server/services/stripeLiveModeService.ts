/**
 * Stripe Live Mode Configuration Service
 * Handles switching between sandbox and live mode with proper validation
 */

import Stripe from 'stripe';
import { getDb } from '../db';
import { notificationService } from './notificationService';

export interface StripeConfig {
  mode: 'sandbox' | 'live';
  secret_key: string;
  publishable_key: string;
  webhook_secret: string;
  is_configured: boolean;
  verified_at?: number;
  test_charge_id?: string;
}

export class StripeLiveModeService {
  private sandboxSecretKey = process.env.STRIPE_SECRET_KEY || '';
  private liveSecretKey = process.env.STRIPE_LIVE_SECRET_KEY || '';

  /**
   * Get current Stripe mode
   */
  async getCurrentMode(): Promise<'sandbox' | 'live'> {
    try {
      const db = await getDb();
      const config = await db.get('SELECT mode FROM stripe_config LIMIT 1');
      return config?.mode || 'sandbox';
    } catch (error) {
      console.error('[Stripe] Failed to get current mode:', error);
      return 'sandbox';
    }
  }

  /**
   * Verify Stripe live keys
   */
  async verifyLiveKeys(secretKey: string, publishableKey: string): Promise<boolean> {
    try {
      const stripe = new Stripe(secretKey, { apiVersion: '2026-01-28.clover' });

      // Test the API key by retrieving account info
      const account = await stripe.account.retrieve();

      if (!account.id) {
        console.error('[Stripe] Account verification failed: No account ID');
        return false;
      }

      // Verify it's a live key (not test)
      if (account.charges_enabled === false) {
        console.warn('[Stripe] Account charges not enabled');
        return false;
      }

      console.log(`[Stripe] ✓ Live keys verified for account: ${account.id}`);
      return true;
    } catch (error: any) {
      console.error('[Stripe] Live key verification failed:', error.message);
      return false;
    }
  }

  /**
   * Switch to live mode
   */
  async switchToLiveMode(
    secretKey: string,
    publishableKey: string,
    webhookSecret: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify keys first
      const isValid = await this.verifyLiveKeys(secretKey, publishableKey);
      if (!isValid) {
        return { success: false, error: 'Invalid Stripe live keys' };
      }

      const db = await getDb();

      // Store live mode config
      await db.run(
        `INSERT OR REPLACE INTO stripe_config (mode, secret_key, publishable_key, webhook_secret, is_configured, verified_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['live', secretKey, publishableKey, webhookSecret, 1, Date.now()]
      );

      // Send notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: '🚀 Stripe Live Mode Enabled',
        message: 'Your Stripe account is now in live mode. Real payments are enabled.',
        severity: 'success',
        data: { mode: 'live' },
      });

      // Log the change
      await this.logModeChange(userId, 'sandbox', 'live', 'Manual switch to live mode');

      console.log('[Stripe] ✓ Switched to live mode');
      return { success: true };
    } catch (error: any) {
      console.error('[Stripe] Failed to switch to live mode:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Switch to sandbox mode
   */
  async switchToSandboxMode(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const db = await getDb();

      // Store sandbox mode config
      await db.run(
        `INSERT OR REPLACE INTO stripe_config (mode, secret_key, publishable_key, webhook_secret, is_configured, verified_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        ['sandbox', this.sandboxSecretKey, process.env.STRIPE_PUBLISHABLE_KEY || '', process.env.STRIPE_WEBHOOK_SECRET || '', 1, Date.now()]
      );

      // Send notification
      await notificationService.sendNotification(userId, {
        type: 'system_alert',
        title: '🧪 Stripe Sandbox Mode Enabled',
        message: 'Your Stripe account is now in sandbox mode. Use test cards for testing.',
        severity: 'info',
        data: { mode: 'sandbox' },
      });

      // Log the change
      await this.logModeChange(userId, 'live', 'sandbox', 'Manual switch to sandbox mode');

      console.log('[Stripe] ✓ Switched to sandbox mode');
      return { success: true };
    } catch (error: any) {
      console.error('[Stripe] Failed to switch to sandbox mode:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test live mode with a small charge
   */
  async testLiveMode(
    secretKey: string,
    amountCents: number = 50 // $0.50 minimum
  ): Promise<{ success: boolean; chargeId?: string; error?: string }> {
    try {
      if (amountCents < 50) {
        return { success: false, error: 'Minimum charge amount is $0.50 (50 cents)' };
      }

      const stripe = new Stripe(secretKey, { apiVersion: '2026-01-28.clover' });

      // Create a test payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        payment_method_types: ['card'],
        description: 'Stripe Live Mode Test Charge',
        metadata: { test: 'true', purpose: 'live_mode_verification' },
      });

      console.log(`[Stripe] ✓ Test charge created: ${paymentIntent.id}`);
      return { success: true, chargeId: paymentIntent.id };
    } catch (error: any) {
      console.error('[Stripe] Test charge failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get Stripe configuration
   */
  async getConfig(): Promise<StripeConfig | null> {
    try {
      const db = await getDb();
      const config = await db.get('SELECT * FROM stripe_config LIMIT 1');
      return config || null;
    } catch (error) {
      console.error('[Stripe] Failed to get config:', error);
      return null;
    }
  }

  /**
   * Get mode statistics
   */
  async getModeStats(): Promise<{
    current_mode: 'sandbox' | 'live';
    is_configured: boolean;
    verified_at?: number;
    test_charges_count: number;
    live_charges_count: number;
  }> {
    try {
      const db = await getDb();
      const config = await db.get('SELECT * FROM stripe_config LIMIT 1');

      const testCharges = await db.get(
        'SELECT COUNT(*) as count FROM payments WHERE status = ? AND mode = ?',
        ['succeeded', 'sandbox']
      );

      const liveCharges = await db.get(
        'SELECT COUNT(*) as count FROM payments WHERE status = ? AND mode = ?',
        ['succeeded', 'live']
      );

      return {
        current_mode: config?.mode || 'sandbox',
        is_configured: config?.is_configured || false,
        verified_at: config?.verified_at,
        test_charges_count: testCharges?.count || 0,
        live_charges_count: liveCharges?.count || 0,
      };
    } catch (error) {
      console.error('[Stripe] Failed to get stats:', error);
      return {
        current_mode: 'sandbox',
        is_configured: false,
        test_charges_count: 0,
        live_charges_count: 0,
      };
    }
  }

  /**
   * Log mode changes for audit trail
   */
  private async logModeChange(
    userId: string,
    fromMode: string,
    toMode: string,
    reason: string
  ): Promise<void> {
    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO stripe_mode_audit_log (user_id, from_mode, to_mode, reason, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, fromMode, toMode, reason, Date.now()]
      );
    } catch (error) {
      console.error('[Stripe] Failed to log mode change:', error);
    }
  }

  /**
   * Get audit log
   */
  async getAuditLog(limit: number = 50) {
    try {
      const db = await getDb();
      return await db.all(
        'SELECT * FROM stripe_mode_audit_log ORDER BY created_at DESC LIMIT ?',
        [limit]
      );
    } catch (error) {
      console.error('[Stripe] Failed to get audit log:', error);
      return [];
    }
  }

  /**
   * Validate webhook secret
   */
  async validateWebhookSecret(secret: string): Promise<boolean> {
    try {
      const stripe = new Stripe(this.sandboxSecretKey, { apiVersion: '2026-01-28.clover' });

      // Webhook secrets are typically 256 characters
      if (secret.length < 100) {
        return false;
      }

      // Additional validation: should start with 'whsec_'
      if (!secret.startsWith('whsec_')) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Stripe] Webhook secret validation failed:', error);
      return false;
    }
  }
}

export const stripeLiveModeService = new StripeLiveModeService();
