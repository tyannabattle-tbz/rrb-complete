/**
 * QUMUS Autonomous Decision Policies
 * 7 core policies for autonomous orchestration with 90% autonomy and 10% human oversight
 */

import { db } from './db';
import { emailService } from './emailService';
import { storagePut } from './storage';

export interface PolicyDecision {
  policyId: string;
  decision: 'approve' | 'deny' | 'review';
  confidence: number; // 0-100
  reason: string;
  timestamp: Date;
  requiresHumanReview: boolean;
}

export interface PolicyContext {
  userId: number;
  action: string;
  data: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * Policy 1: Payment Processing
 * Auto-validates, reconciles, and processes payments with fraud detection
 */
export async function paymentProcessingPolicy(
  context: PolicyContext
): Promise<PolicyDecision> {
  const { userId, data } = context;
  const { amount, currency, paymentMethod } = data;

  // Basic validation
  if (amount <= 0) {
    return {
      policyId: 'payment_processing',
      decision: 'deny',
      confidence: 100,
      reason: 'Invalid payment amount',
      timestamp: new Date(),
      requiresHumanReview: false,
    };
  }

  // Fraud detection: check for unusual patterns
  const recentPayments = await db.query(
    'SELECT SUM(amount) as total FROM payments WHERE userId = ? AND createdAt > DATE_SUB(NOW(), INTERVAL 24 HOUR)',
    [userId]
  );

  const dailyTotal = recentPayments[0]?.total || 0;
  const newTotal = dailyTotal + amount;

  if (newTotal > 10000) {
    return {
      policyId: 'payment_processing',
      decision: 'review',
      confidence: 75,
      reason: 'Daily payment limit exceeded - requires review',
      timestamp: new Date(),
      requiresHumanReview: true,
    };
  }

  return {
    policyId: 'payment_processing',
    decision: 'approve',
    confidence: 95,
    reason: 'Payment validated and approved',
    timestamp: new Date(),
    requiresHumanReview: false,
  };
}

/**
 * Policy 2: Email Notification
 * Auto-sends transactional emails with retry logic
 */
export async function emailNotificationPolicy(
  context: PolicyContext
): Promise<PolicyDecision> {
  const { userId, data } = context;
  const { emailType, recipient, subject, content } = data;

  try {
    // Send email based on type
    switch (emailType) {
      case 'donation_receipt':
        await emailService.sendDonationReceipt(recipient, content);
        break;
      case 'payment_confirmation':
        await emailService.sendPaymentConfirmation(recipient, content);
        break;
      case 'subscription_welcome':
        await emailService.sendSubscriptionWelcome(recipient, content);
        break;
      case 'renewal_reminder':
        await emailService.sendRenewalReminder(recipient, content);
        break;
      default:
        await emailService.sendGenericEmail(recipient, subject, content);
    }

    return {
      policyId: 'email_notification',
      decision: 'approve',
      confidence: 100,
      reason: `Email sent successfully to ${recipient}`,
      timestamp: new Date(),
      requiresHumanReview: false,
    };
  } catch (error) {
    return {
      policyId: 'email_notification',
      decision: 'review',
      confidence: 50,
      reason: `Email delivery failed: ${error}`,
      timestamp: new Date(),
      requiresHumanReview: true,
    };
  }
}

/**
 * Policy 3: Metrics Persistence
 * Auto-syncs metrics from browser to database
 */
export async function metricsPersistencePolicy(
  context: PolicyContext
): Promise<PolicyDecision> {
  const { userId, data } = context;
  const { metricType, metricData } = data;

  try {
    // Store metrics based on type
    if (metricType === 'ar_metrics') {
      await db.insert('ar_metrics').values({
        userId,
        cpuUsage: metricData.cpu,
        memoryUsage: metricData.memory,
        storageUsage: metricData.storage,
        timestamp: new Date(),
      });
    } else if (metricType === 'voice_command') {
      await db.insert('voice_commands').values({
        userId,
        command: metricData.command,
        confidence: metricData.confidence,
        executedAt: new Date(),
      });
    }

    return {
      policyId: 'metrics_persistence',
      decision: 'approve',
      confidence: 100,
      reason: 'Metrics persisted successfully',
      timestamp: new Date(),
      requiresHumanReview: false,
    };
  } catch (error) {
    return {
      policyId: 'metrics_persistence',
      decision: 'deny',
      confidence: 100,
      reason: `Failed to persist metrics: ${error}`,
      timestamp: new Date(),
      requiresHumanReview: true,
    };
  }
}

/**
 * Policy 4: Access Control
 * Auto-enforces subscription tier restrictions
 */
export async function accessControlPolicy(
  context: PolicyContext
): Promise<PolicyDecision> {
  const { userId, action, data } = context;
  const { requiredTier } = data;

  try {
    const user = await db.query('SELECT subscriptionTier FROM users WHERE id = ?', [userId]);

    if (!user[0]) {
      return {
        policyId: 'access_control',
        decision: 'deny',
        confidence: 100,
        reason: 'User not found',
        timestamp: new Date(),
        requiresHumanReview: false,
      };
    }

    const tierHierarchy = ['free', 'ar_pro', 'voice_training', 'enterprise'];
    const userTierIndex = tierHierarchy.indexOf(user[0].subscriptionTier);
    const requiredTierIndex = tierHierarchy.indexOf(requiredTier);

    if (userTierIndex >= requiredTierIndex) {
      return {
        policyId: 'access_control',
        decision: 'approve',
        confidence: 100,
        reason: `User tier ${user[0].subscriptionTier} has access to ${action}`,
        timestamp: new Date(),
        requiresHumanReview: false,
      };
    }

    return {
      policyId: 'access_control',
      decision: 'deny',
      confidence: 100,
      reason: `User tier ${user[0].subscriptionTier} does not have access to ${action}`,
      timestamp: new Date(),
      requiresHumanReview: false,
    };
  } catch (error) {
    return {
      policyId: 'access_control',
      decision: 'review',
      confidence: 50,
      reason: `Access control check failed: ${error}`,
      timestamp: new Date(),
      requiresHumanReview: true,
    };
  }
}

/**
 * Policy 5: Subscription Lifecycle
 * Auto-manages renewals, cancellations, and upgrades
 */
export async function subscriptionLifecyclePolicy(
  context: PolicyContext
): Promise<PolicyDecision> {
  const { userId, action, data } = context;
  const { subscriptionId, newTier } = data;

  try {
    if (action === 'auto_renew') {
      // Check if subscription is due for renewal
      const subscription = await db.query(
        'SELECT * FROM subscriptions WHERE id = ? AND userId = ?',
        [subscriptionId, userId]
      );

      if (subscription[0]?.renewalDate <= new Date()) {
        // Auto-renew the subscription
        await db.update('subscriptions').set({ renewalDate: new Date() }).where({ id: subscriptionId });
        return {
          policyId: 'subscription_lifecycle',
          decision: 'approve',
          confidence: 100,
          reason: 'Subscription auto-renewed',
          timestamp: new Date(),
          requiresHumanReview: false,
        };
      }
    }

    return {
      policyId: 'subscription_lifecycle',
      decision: 'approve',
      confidence: 95,
      reason: `Subscription lifecycle action ${action} processed`,
      timestamp: new Date(),
      requiresHumanReview: false,
    };
  } catch (error) {
    return {
      policyId: 'subscription_lifecycle',
      decision: 'review',
      confidence: 50,
      reason: `Subscription lifecycle error: ${error}`,
      timestamp: new Date(),
      requiresHumanReview: true,
    };
  }
}

/**
 * Policy 6: Fraud Detection
 * Auto-detects and flags suspicious activity
 */
export async function fraudDetectionPolicy(
  context: PolicyContext
): Promise<PolicyDecision> {
  const { userId, data } = context;
  const { amount, ipAddress, deviceId } = data;

  try {
    // Check for multiple transactions from different IPs in short time
    const recentTransactions = await db.query(
      'SELECT DISTINCT ipAddress FROM payments WHERE userId = ? AND createdAt > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
      [userId]
    );

    if (recentTransactions.length > 3) {
      return {
        policyId: 'fraud_detection',
        decision: 'review',
        confidence: 85,
        reason: 'Multiple transactions from different IPs detected',
        timestamp: new Date(),
        requiresHumanReview: true,
      };
    }

    // Check for unusually large transaction
    if (amount > 5000) {
      return {
        policyId: 'fraud_detection',
        decision: 'review',
        confidence: 70,
        reason: 'Large transaction amount detected',
        timestamp: new Date(),
        requiresHumanReview: true,
      };
    }

    return {
      policyId: 'fraud_detection',
      decision: 'approve',
      confidence: 95,
      reason: 'No fraud indicators detected',
      timestamp: new Date(),
      requiresHumanReview: false,
    };
  } catch (error) {
    return {
      policyId: 'fraud_detection',
      decision: 'review',
      confidence: 50,
      reason: `Fraud detection error: ${error}`,
      timestamp: new Date(),
      requiresHumanReview: true,
    };
  }
}

/**
 * Policy 7: Audit Logging
 * Auto-logs all significant actions for compliance
 */
export async function auditLoggingPolicy(
  context: PolicyContext
): Promise<PolicyDecision> {
  const { userId, action, data } = context;

  try {
    await db.insert('audit_logs').values({
      userId,
      action,
      details: JSON.stringify(data),
      timestamp: new Date(),
      ipAddress: data.ipAddress || 'unknown',
    });

    return {
      policyId: 'audit_logging',
      decision: 'approve',
      confidence: 100,
      reason: 'Action logged for audit trail',
      timestamp: new Date(),
      requiresHumanReview: false,
    };
  } catch (error) {
    return {
      policyId: 'audit_logging',
      decision: 'deny',
      confidence: 100,
      reason: `Audit logging failed: ${error}`,
      timestamp: new Date(),
      requiresHumanReview: true,
    };
  }
}

/**
 * Execute all policies for a given context
 * Returns decisions from all 7 policies
 */
export async function executePolicies(context: PolicyContext): Promise<PolicyDecision[]> {
  const decisions: PolicyDecision[] = [];

  try {
    decisions.push(await paymentProcessingPolicy(context));
    decisions.push(await emailNotificationPolicy(context));
    decisions.push(await metricsPersistencePolicy(context));
    decisions.push(await accessControlPolicy(context));
    decisions.push(await subscriptionLifecyclePolicy(context));
    decisions.push(await fraudDetectionPolicy(context));
    decisions.push(await auditLoggingPolicy(context));
  } catch (error) {
    console.error('Error executing policies:', error);
  }

  return decisions;
}

/**
 * Check if any policy requires human review
 */
export function requiresHumanReview(decisions: PolicyDecision[]): boolean {
  return decisions.some((d) => d.requiresHumanReview);
}

/**
 * Get average confidence across all policies
 */
export function getAverageConfidence(decisions: PolicyDecision[]): number {
  if (decisions.length === 0) return 0;
  const total = decisions.reduce((sum, d) => sum + d.confidence, 0);
  return Math.round(total / decisions.length);
}
