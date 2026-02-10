/**
 * QUMUS Notification Service
 * Wires push notifications to critical autonomous events:
 * - Human review escalations
 * - Emergency broadcasts
 * - Agent health degradation
 * - Security/compliance alerts
 * - Campaign milestones
 */

import { sendPushToAll, notificationHistory } from '../routers/pushNotificationRouter';

export interface QumusNotificationEvent {
  type: 'human_review' | 'emergency' | 'agent_health' | 'security' | 'campaign' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  body: string;
  url?: string;
  metadata?: Record<string, any>;
}

// Notification rules: which events trigger push notifications
const NOTIFICATION_RULES: Record<string, { minSeverity: string; enabled: boolean }> = {
  human_review: { minSeverity: 'medium', enabled: true },
  emergency: { minSeverity: 'low', enabled: true },
  agent_health: { minSeverity: 'high', enabled: true },
  security: { minSeverity: 'medium', enabled: true },
  campaign: { minSeverity: 'low', enabled: true },
  system: { minSeverity: 'high', enabled: true },
};

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical'];

// In-memory notification queue
const notificationQueue: QumusNotificationEvent[] = [];
let isProcessing = false;
let totalNotificationsSent = 0;
let totalNotificationsFailed = 0;

function shouldNotify(event: QumusNotificationEvent): boolean {
  const rule = NOTIFICATION_RULES[event.type];
  if (!rule || !rule.enabled) return false;
  const eventLevel = SEVERITY_ORDER.indexOf(event.severity);
  const minLevel = SEVERITY_ORDER.indexOf(rule.minSeverity);
  return eventLevel >= minLevel;
}

async function processQueue(): Promise<void> {
  if (isProcessing || notificationQueue.length === 0) return;
  isProcessing = true;

  try {
    while (notificationQueue.length > 0) {
      const event = notificationQueue.shift()!;
      if (!shouldNotify(event)) continue;

      try {
        const result = await sendPushToAll({
          title: `[QUMUS] ${event.title}`,
          body: event.body,
          level: event.severity,
          url: event.url || getDefaultUrl(event.type),
        });

        // Log to notification history
        notificationHistory.unshift({
          id: `qumus-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          title: event.title,
          body: event.body,
          level: event.severity,
          sentAt: Date.now(),
          recipientCount: result.success + result.failed,
          successCount: result.success,
          failureCount: result.failed,
        });

        if (notificationHistory.length > 200) notificationHistory.splice(200);

        totalNotificationsSent += result.success;
        totalNotificationsFailed += result.failed;

        console.log(`[QUMUS Notifications] ${event.type}/${event.severity}: "${event.title}" → ${result.success} delivered`);
      } catch (err) {
        console.error(`[QUMUS Notifications] Failed to send: ${event.title}`, err);
        totalNotificationsFailed++;
      }

      // Small delay between notifications to avoid flooding
      await new Promise(r => setTimeout(r, 500));
    }
  } finally {
    isProcessing = false;
  }
}

function getDefaultUrl(type: string): string {
  switch (type) {
    case 'human_review': return '/rrb/qumus/human-review';
    case 'emergency': return '/rrb/broadcast/admin';
    case 'agent_health': return '/rrb/qumus/agent-network';
    case 'security': return '/rrb/qumus/monitoring';
    case 'campaign': return '/rrb/sweet-miracles/fundraising';
    case 'system': return '/rrb/qumus/admin';
    default: return '/rrb/qumus/admin';
  }
}

/**
 * Queue a notification event for push delivery
 */
export function queueNotification(event: QumusNotificationEvent): void {
  notificationQueue.push(event);
  // Process async
  setTimeout(() => processQueue(), 100);
}

/**
 * Send a notification immediately (bypasses queue)
 */
export async function sendImmediate(event: QumusNotificationEvent): Promise<{ success: number; failed: number }> {
  if (!shouldNotify(event)) return { success: 0, failed: 0 };

  const result = await sendPushToAll({
    title: `[QUMUS] ${event.title}`,
    body: event.body,
    level: event.severity,
    url: event.url || getDefaultUrl(event.type),
  });

  totalNotificationsSent += result.success;
  totalNotificationsFailed += result.failed;

  return { success: result.success, failed: result.failed };
}

/**
 * Get notification service stats
 */
export function getNotificationStats() {
  return {
    totalSent: totalNotificationsSent,
    totalFailed: totalNotificationsFailed,
    queueLength: notificationQueue.length,
    isProcessing,
    rules: Object.entries(NOTIFICATION_RULES).map(([type, rule]) => ({
      type,
      minSeverity: rule.minSeverity,
      enabled: rule.enabled,
    })),
    recentNotifications: notificationHistory.slice(0, 20),
  };
}

/**
 * Update notification rule
 */
export function updateNotificationRule(type: string, updates: { minSeverity?: string; enabled?: boolean }): boolean {
  const rule = NOTIFICATION_RULES[type];
  if (!rule) return false;
  if (updates.minSeverity) rule.minSeverity = updates.minSeverity;
  if (updates.enabled !== undefined) rule.enabled = updates.enabled;
  return true;
}

/**
 * Helper: Notify on human review escalation
 */
export function notifyHumanReviewEscalation(policyName: string, reason: string): void {
  queueNotification({
    type: 'human_review',
    severity: 'high',
    title: `Human Review Required: ${policyName}`,
    body: `Decision escalated for human review. Reason: ${reason}`,
    url: '/rrb/qumus/human-review',
  });
}

/**
 * Helper: Notify on emergency broadcast
 */
export function notifyEmergencyBroadcast(title: string, details: string): void {
  queueNotification({
    type: 'emergency',
    severity: 'critical',
    title: `Emergency Broadcast: ${title}`,
    body: details,
    url: '/rrb/broadcast/admin',
  });
}

/**
 * Helper: Notify on agent health degradation
 */
export function notifyAgentHealthDegraded(agentName: string, status: string): void {
  queueNotification({
    type: 'agent_health',
    severity: 'high',
    title: `Agent Health Alert: ${agentName}`,
    body: `Agent ${agentName} status changed to: ${status}`,
    url: '/rrb/qumus/agent-network',
  });
}

/**
 * Helper: Notify on security/compliance alert
 */
export function notifySecurityAlert(title: string, details: string): void {
  queueNotification({
    type: 'security',
    severity: 'critical',
    title: `Security Alert: ${title}`,
    body: details,
    url: '/rrb/qumus/monitoring',
  });
}

/**
 * Helper: Notify on campaign milestone
 */
export function notifyCampaignMilestone(campaignTitle: string, milestone: string): void {
  queueNotification({
    type: 'campaign',
    severity: 'low',
    title: `Campaign Milestone: ${campaignTitle}`,
    body: `Reached milestone: ${milestone}`,
    url: '/rrb/sweet-miracles/fundraising',
  });
}

console.log('[QUMUS Notifications] Service initialized with', Object.keys(NOTIFICATION_RULES).length, 'notification rules');
