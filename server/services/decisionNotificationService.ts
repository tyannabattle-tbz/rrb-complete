/**
 * Decision Notification Service
 * Sends real-time push notifications for pending QUMUS decisions
 * Integrates with push notification system for instant admin alerts
 */

import { sendPushNotification } from './pushNotificationService';
import { db } from '../db';

export interface DecisionNotification {
  decisionId: string;
  policyName: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  affectedUsers: number;
  confidence: number;
  recommendedAction: string;
}

export class DecisionNotificationService {
  /**
   * Send notification for pending decision
   */
  static async notifyPendingDecision(notification: DecisionNotification): Promise<boolean> {
    try {
      const title = `${notification.impact.toUpperCase()} - ${notification.policyName}`;
      const message = `Decision requires review. ${notification.affectedUsers} users affected. Confidence: ${(notification.confidence * 100).toFixed(0)}%`;

      // Send push notification to all admins
      const result = await sendPushNotification({
        title,
        message,
        icon: this.getIconForImpact(notification.impact),
        badge: '/badge.png',
        tag: `decision_${notification.decisionId}`,
        requireInteraction: notification.impact === 'critical',
        actions: [
          {
            action: 'approve',
            title: 'Approve',
            icon: '/icons/approve.png',
          },
          {
            action: 'reject',
            title: 'Reject',
            icon: '/icons/reject.png',
          },
        ],
        data: {
          decisionId: notification.decisionId,
          policyName: notification.policyName,
          impact: notification.impact,
          affectedUsers: notification.affectedUsers,
          confidence: notification.confidence,
          recommendedAction: notification.recommendedAction,
          url: '/admin/decisions',
        },
      });

      console.log(`[Decision Notification] Sent for decision ${notification.decisionId}`);
      return result;
    } catch (error) {
      console.error('[Decision Notification] Failed to send notification:', error);
      return false;
    }
  }

  /**
   * Send notification for decision approval
   */
  static async notifyDecisionApproved(
    decisionId: string,
    policyName: string,
    impact: string,
    approvedBy: string
  ): Promise<boolean> {
    try {
      const result = await sendPushNotification({
        title: `✓ Decision Approved`,
        message: `${policyName} has been approved by ${approvedBy}`,
        icon: '/icons/success.png',
        badge: '/badge.png',
        tag: `decision_approved_${decisionId}`,
        data: {
          decisionId,
          status: 'approved',
          approvedBy,
          url: '/admin/decisions',
        },
      });

      console.log(`[Decision Notification] Approval sent for decision ${decisionId}`);
      return result;
    } catch (error) {
      console.error('[Decision Notification] Failed to send approval notification:', error);
      return false;
    }
  }

  /**
   * Send notification for decision rejection
   */
  static async notifyDecisionRejected(
    decisionId: string,
    policyName: string,
    rejectedBy: string,
    reason: string
  ): Promise<boolean> {
    try {
      const result = await sendPushNotification({
        title: `✗ Decision Rejected`,
        message: `${policyName} has been rejected by ${rejectedBy}. Reason: ${reason}`,
        icon: '/icons/rejected.png',
        badge: '/badge.png',
        tag: `decision_rejected_${decisionId}`,
        data: {
          decisionId,
          status: 'rejected',
          rejectedBy,
          reason,
          url: '/admin/decisions',
        },
      });

      console.log(`[Decision Notification] Rejection sent for decision ${decisionId}`);
      return result;
    } catch (error) {
      console.error('[Decision Notification] Failed to send rejection notification:', error);
      return false;
    }
  }

  /**
   * Send critical alert notification
   */
  static async sendCriticalAlert(
    title: string,
    message: string,
    affectedSystems: string[]
  ): Promise<boolean> {
    try {
      const result = await sendPushNotification({
        title: `🚨 CRITICAL ALERT: ${title}`,
        message,
        icon: '/icons/critical.png',
        badge: '/badge.png',
        tag: `critical_${Date.now()}`,
        requireInteraction: true,
        actions: [
          {
            action: 'review',
            title: 'Review Now',
            icon: '/icons/review.png',
          },
        ],
        data: {
          type: 'critical_alert',
          affectedSystems,
          url: '/admin/decisions',
        },
      });

      console.log(`[Decision Notification] Critical alert sent: ${title}`);
      return result;
    } catch (error) {
      console.error('[Decision Notification] Failed to send critical alert:', error);
      return false;
    }
  }

  /**
   * Get icon based on impact level
   */
  private static getIconForImpact(impact: string): string {
    switch (impact) {
      case 'critical':
        return '/icons/critical.png';
      case 'high':
        return '/icons/high.png';
      case 'medium':
        return '/icons/medium.png';
      case 'low':
        return '/icons/low.png';
      default:
        return '/icons/notification.png';
    }
  }

  /**
   * Batch notify multiple decisions
   */
  static async notifyMultipleDecisions(notifications: DecisionNotification[]): Promise<number> {
    let successCount = 0;

    for (const notification of notifications) {
      const result = await this.notifyPendingDecision(notification);
      if (result) successCount++;
    }

    console.log(`[Decision Notification] Batch sent ${successCount}/${notifications.length} notifications`);
    return successCount;
  }

  /**
   * Send escalation notification for overdue decisions
   */
  static async notifyEscalation(
    decisionId: string,
    policyName: string,
    hoursOverdue: number
  ): Promise<boolean> {
    try {
      const result = await sendPushNotification({
        title: `⏰ Decision Overdue`,
        message: `${policyName} has been pending for ${hoursOverdue} hours and requires immediate attention`,
        icon: '/icons/overdue.png',
        badge: '/badge.png',
        tag: `escalation_${decisionId}`,
        requireInteraction: true,
        actions: [
          {
            action: 'view',
            title: 'View Decision',
            icon: '/icons/view.png',
          },
        ],
        data: {
          decisionId,
          type: 'escalation',
          hoursOverdue,
          url: '/admin/decisions',
        },
      });

      console.log(`[Decision Notification] Escalation sent for decision ${decisionId}`);
      return result;
    } catch (error) {
      console.error('[Decision Notification] Failed to send escalation notification:', error);
      return false;
    }
  }
}

export default DecisionNotificationService;
