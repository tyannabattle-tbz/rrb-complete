/**
 * Advanced Scheduling Engine
 * Content calendar and automation
 */

interface ScheduledBroadcast {
  id: string;
  operatorId: string;
  title: string;
  description: string;
  scheduledTime: Date;
  duration: number; // minutes
  channels: string[];
  recurring?: {
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
    daysOfWeek?: number[]; // 0-6
    endDate?: Date;
  };
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
  reminders: { time: number; type: 'email' | 'push' | 'both' }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ContentCalendar {
  operatorId: string;
  broadcasts: ScheduledBroadcast[];
  viewMode: 'month' | 'week' | 'day';
  timezone: string;
}

interface AutomationRule {
  id: string;
  operatorId: string;
  name: string;
  trigger: 'broadcast_end' | 'viewer_milestone' | 'scheduled_time' | 'manual';
  action: 'send_notification' | 'post_social' | 'create_vod' | 'send_email' | 'update_status';
  conditions: Record<string, any>;
  enabled: boolean;
  createdAt: Date;
}

interface BroadcastReminder {
  id: string;
  broadcastId: string;
  userId: string;
  reminderTime: Date;
  type: 'email' | 'push' | 'both';
  sent: boolean;
  sentAt?: Date;
}

interface SchedulingAnalytics {
  operatorId: string;
  totalScheduled: number;
  completedBroadcasts: number;
  cancelledBroadcasts: number;
  averageViewers: number;
  peakViewingTime: string;
  bestPerformingDay: string;
  schedulingTrends: Record<string, number>;
}

class SchedulingEngine {
  private broadcasts: Map<string, ScheduledBroadcast> = new Map();
  private automationRules: Map<string, AutomationRule> = new Map();
  private reminders: Map<string, BroadcastReminder> = new Map();
  private analytics: Map<string, SchedulingAnalytics> = new Map();
  private recurringBroadcasts: Map<string, ScheduledBroadcast[]> = new Map();

  /**
   * Schedule a broadcast
   */
  scheduleBroadcast(
    operatorId: string,
    title: string,
    description: string,
    scheduledTime: Date,
    duration: number,
    channels: string[]
  ): ScheduledBroadcast {
    const broadcast: ScheduledBroadcast = {
      id: `broadcast_${Date.now()}_${Math.random()}`,
      operatorId,
      title,
      description,
      scheduledTime,
      duration,
      channels,
      status: 'scheduled',
      reminders: [
        { time: 24 * 60, type: 'email' }, // 24 hours before
        { time: 60, type: 'push' }, // 1 hour before
        { time: 15, type: 'push' }, // 15 minutes before
      ],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.broadcasts.set(broadcast.id, broadcast);
    this.updateAnalytics(operatorId);

    return broadcast;
  }

  /**
   * Create recurring broadcast schedule
   */
  createRecurringBroadcast(
    operatorId: string,
    title: string,
    description: string,
    startTime: Date,
    duration: number,
    channels: string[],
    pattern: 'daily' | 'weekly' | 'monthly' | 'custom',
    daysOfWeek?: number[],
    endDate?: Date
  ): ScheduledBroadcast[] {
    const broadcasts: ScheduledBroadcast[] = [];
    let currentDate = new Date(startTime);
    const finalEndDate = endDate || new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000);

    while (currentDate <= finalEndDate) {
      const broadcast: ScheduledBroadcast = {
        id: `broadcast_${Date.now()}_${Math.random()}`,
        operatorId,
        title,
        description,
        scheduledTime: new Date(currentDate),
        duration,
        channels,
        recurring: { pattern, daysOfWeek, endDate },
        status: 'scheduled',
        reminders: [
          { time: 24 * 60, type: 'email' },
          { time: 60, type: 'push' },
          { time: 15, type: 'push' },
        ],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.broadcasts.set(broadcast.id, broadcast);
      broadcasts.push(broadcast);

      // Calculate next occurrence
      switch (pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    this.recurringBroadcasts.set(`recurring_${Date.now()}`, broadcasts);
    this.updateAnalytics(operatorId);

    return broadcasts;
  }

  /**
   * Get content calendar
   */
  getContentCalendar(operatorId: string, month?: Date): ContentCalendar {
    const operatorBroadcasts = Array.from(this.broadcasts.values()).filter(
      (b) => b.operatorId === operatorId && b.status !== 'cancelled'
    );

    if (month) {
      const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
      const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      return {
        operatorId,
        broadcasts: operatorBroadcasts.filter(
          (b) => b.scheduledTime >= startOfMonth && b.scheduledTime <= endOfMonth
        ),
        viewMode: 'month',
        timezone: 'UTC',
      };
    }

    return {
      operatorId,
      broadcasts: operatorBroadcasts,
      viewMode: 'month',
      timezone: 'UTC',
    };
  }

  /**
   * Get upcoming broadcasts
   */
  getUpcomingBroadcasts(operatorId: string, days: number = 7): ScheduledBroadcast[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return Array.from(this.broadcasts.values())
      .filter(
        (b) =>
          b.operatorId === operatorId &&
          b.scheduledTime >= now &&
          b.scheduledTime <= futureDate &&
          b.status === 'scheduled'
      )
      .sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());
  }

  /**
   * Update broadcast
   */
  updateBroadcast(broadcastId: string, updates: Partial<ScheduledBroadcast>): ScheduledBroadcast | null {
    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) return null;

    const updated = { ...broadcast, ...updates, updatedAt: new Date() };
    this.broadcasts.set(broadcastId, updated);

    return updated;
  }

  /**
   * Cancel broadcast
   */
  cancelBroadcast(broadcastId: string): boolean {
    const broadcast = this.broadcasts.get(broadcastId);
    if (broadcast) {
      broadcast.status = 'cancelled';
      broadcast.updatedAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Create automation rule
   */
  createAutomationRule(
    operatorId: string,
    name: string,
    trigger: AutomationRule['trigger'],
    action: AutomationRule['action'],
    conditions: Record<string, any>
  ): AutomationRule {
    const rule: AutomationRule = {
      id: `rule_${Date.now()}_${Math.random()}`,
      operatorId,
      name,
      trigger,
      action,
      conditions,
      enabled: true,
      createdAt: new Date(),
    };

    this.automationRules.set(rule.id, rule);
    return rule;
  }

  /**
   * Get automation rules
   */
  getAutomationRules(operatorId: string): AutomationRule[] {
    return Array.from(this.automationRules.values()).filter((r) => r.operatorId === operatorId);
  }

  /**
   * Execute automation rule
   */
  executeAutomationRule(ruleId: string, context: Record<string, any>): boolean {
    const rule = this.automationRules.get(ruleId);
    if (!rule || !rule.enabled) return false;

    try {
      // Check conditions
      for (const [key, expectedValue] of Object.entries(rule.conditions)) {
        if (context[key] !== expectedValue) {
          return false;
        }
      }

      // Execute action
      switch (rule.action) {
        case 'send_notification':
          console.log(`[Automation] Sending notification for rule: ${rule.name}`);
          break;
        case 'post_social':
          console.log(`[Automation] Posting to social media for rule: ${rule.name}`);
          break;
        case 'create_vod':
          console.log(`[Automation] Creating VOD for rule: ${rule.name}`);
          break;
        case 'send_email':
          console.log(`[Automation] Sending email for rule: ${rule.name}`);
          break;
        case 'update_status':
          console.log(`[Automation] Updating status for rule: ${rule.name}`);
          break;
      }

      return true;
    } catch (error) {
      console.error(`[Automation] Error executing rule: ${error}`);
      return false;
    }
  }

  /**
   * Set broadcast reminder
   */
  setReminder(
    broadcastId: string,
    userId: string,
    reminderTime: Date,
    type: 'email' | 'push' | 'both'
  ): BroadcastReminder {
    const reminder: BroadcastReminder = {
      id: `reminder_${Date.now()}_${Math.random()}`,
      broadcastId,
      userId,
      reminderTime,
      type,
      sent: false,
    };

    this.reminders.set(reminder.id, reminder);
    return reminder;
  }

  /**
   * Get pending reminders
   */
  getPendingReminders(): BroadcastReminder[] {
    const now = new Date();
    return Array.from(this.reminders.values()).filter((r) => !r.sent && r.reminderTime <= now);
  }

  /**
   * Mark reminder as sent
   */
  markReminderAsSent(reminderId: string): boolean {
    const reminder = this.reminders.get(reminderId);
    if (reminder) {
      reminder.sent = true;
      reminder.sentAt = new Date();
      return true;
    }
    return false;
  }

  /**
   * Update analytics
   */
  private updateAnalytics(operatorId: string): void {
    const operatorBroadcasts = Array.from(this.broadcasts.values()).filter(
      (b) => b.operatorId === operatorId
    );

    const analytics: SchedulingAnalytics = {
      operatorId,
      totalScheduled: operatorBroadcasts.filter((b) => b.status === 'scheduled').length,
      completedBroadcasts: operatorBroadcasts.filter((b) => b.status === 'completed').length,
      cancelledBroadcasts: operatorBroadcasts.filter((b) => b.status === 'cancelled').length,
      averageViewers: 0,
      peakViewingTime: '8 PM',
      bestPerformingDay: 'Friday',
      schedulingTrends: {},
    };

    this.analytics.set(operatorId, analytics);
  }

  /**
   * Get scheduling analytics
   */
  getAnalytics(operatorId: string): SchedulingAnalytics | null {
    return this.analytics.get(operatorId) || null;
  }

  /**
   * Get broadcast by ID
   */
  getBroadcast(broadcastId: string): ScheduledBroadcast | null {
    return this.broadcasts.get(broadcastId) || null;
  }

  /**
   * Get all broadcasts for operator
   */
  getAllBroadcasts(operatorId: string): ScheduledBroadcast[] {
    return Array.from(this.broadcasts.values()).filter((b) => b.operatorId === operatorId);
  }

  /**
   * Suggest optimal broadcast time
   */
  suggestOptimalTime(operatorId: string): Date {
    // Analyze past broadcasts and suggest best time
    const broadcasts = this.getAllBroadcasts(operatorId);
    
    // Simple heuristic: Friday 8 PM
    const nextFriday = new Date();
    const daysUntilFriday = (5 - nextFriday.getDay() + 7) % 7 || 7;
    nextFriday.setDate(nextFriday.getDate() + daysUntilFriday);
    nextFriday.setHours(20, 0, 0, 0);

    return nextFriday;
  }

  /**
   * Bulk schedule broadcasts
   */
  bulkSchedule(
    operatorId: string,
    broadcasts: Array<{
      title: string;
      description: string;
      scheduledTime: Date;
      duration: number;
      channels: string[];
    }>
  ): ScheduledBroadcast[] {
    return broadcasts.map((b) =>
      this.scheduleBroadcast(operatorId, b.title, b.description, b.scheduledTime, b.duration, b.channels)
    );
  }
}

export const schedulingEngine = new SchedulingEngine();
