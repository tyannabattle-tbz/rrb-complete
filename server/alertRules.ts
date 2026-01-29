/**
 * Custom Alerts & Notification Rules Service
 * Manages alert rules and triggers notifications based on conditions
 */

export type AlertCondition = "greater_than" | "less_than" | "equals" | "contains";
export type AlertMetric = "execution_time" | "tool_failures" | "message_count" | "error_rate";

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  metric: AlertMetric;
  condition: AlertCondition;
  threshold: number;
  notifyUsers: string[];
  notifyEmail?: boolean;
  notifySlack?: boolean;
  createdAt: Date;
  createdBy: string;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  timestamp: Date;
  metric: AlertMetric;
  value: number;
  message: string;
  sessionId?: string;
}

export class AlertRuleManager {
  private rules: Map<string, AlertRule> = new Map();
  private events: AlertEvent[] = [];
  private readonly MAX_EVENTS = 10000;

  /**
   * Create a new alert rule
   */
  createRule(
    name: string,
    metric: AlertMetric,
    condition: AlertCondition,
    threshold: number,
    notifyUsers: string[],
    userId: string
  ): AlertRule {
    const rule: AlertRule = {
      id: `rule-${Date.now()}`,
      name,
      enabled: true,
      metric,
      condition,
      threshold,
      notifyUsers,
      createdAt: new Date(),
      createdBy: userId,
      triggerCount: 0,
    };

    this.rules.set(rule.id, rule);
    return rule;
  }

  /**
   * Update an alert rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): AlertRule | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    const updated = { ...rule, ...updates };
    this.rules.set(ruleId, updated);
    return updated;
  }

  /**
   * Delete an alert rule
   */
  deleteRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Get all alert rules
   */
  getAllRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get enabled alert rules
   */
  getEnabledRules(): AlertRule[] {
    return Array.from(this.rules.values()).filter((r) => r.enabled);
  }

  /**
   * Check if a metric triggers any rules
   */
  checkMetric(
    metric: AlertMetric,
    value: number,
    sessionId?: string
  ): AlertEvent[] {
    const triggeredEvents: AlertEvent[] = [];
    const enabledRules = this.getEnabledRules().filter((r) => r.metric === metric);

    for (const rule of enabledRules) {
      if (this.evaluateCondition(value, rule.condition, rule.threshold)) {
        const event: AlertEvent = {
          id: `event-${Date.now()}`,
          ruleId: rule.id,
          timestamp: new Date(),
          metric,
          value,
          message: `Alert: ${rule.name} - ${metric} is ${value}`,
          sessionId,
        };

        this.events.push(event);
        triggeredEvents.push(event);

        // Update rule
        rule.lastTriggered = new Date();
        rule.triggerCount++;

        // Maintain max events
        if (this.events.length > this.MAX_EVENTS) {
          this.events.shift();
        }
      }
    }

    return triggeredEvents;
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(
    value: number,
    condition: AlertCondition,
    threshold: number
  ): boolean {
    switch (condition) {
      case "greater_than":
        return value > threshold;
      case "less_than":
        return value < threshold;
      case "equals":
        return value === threshold;
      case "contains":
        return String(value).includes(String(threshold));
      default:
        return false;
    }
  }

  /**
   * Get alert events
   */
  getEvents(ruleId?: string, limit = 100): AlertEvent[] {
    let events = this.events;
    if (ruleId) {
      events = events.filter((e) => e.ruleId === ruleId);
    }
    return events.slice(-limit);
  }

  /**
   * Get alert statistics
   */
  getStatistics(): {
    totalRules: number;
    enabledRules: number;
    totalEvents: number;
    topTriggeredRules: Array<{ ruleId: string; ruleName: string; count: number }>;
  } {
    const allRules = Array.from(this.rules.values());
    const enabledRules = allRules.filter((r) => r.enabled);

    const topTriggered = allRules
      .sort((a, b) => b.triggerCount - a.triggerCount)
      .slice(0, 5)
      .map((r) => ({
        ruleId: r.id,
        ruleName: r.name,
        count: r.triggerCount,
      }));

    return {
      totalRules: allRules.length,
      enabledRules: enabledRules.length,
      totalEvents: this.events.length,
      topTriggeredRules: topTriggered,
    };
  }

  /**
   * Clear old events
   */
  clearOldEvents(hoursToKeep: number): number {
    const cutoffTime = Date.now() - hoursToKeep * 60 * 60 * 1000;
    const initialLength = this.events.length;

    this.events = this.events.filter((e) => e.timestamp.getTime() > cutoffTime);

    return initialLength - this.events.length;
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): AlertRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Toggle rule enabled status
   */
  toggleRule(ruleId: string): AlertRule | null {
    const rule = this.rules.get(ruleId);
    if (!rule) return null;

    rule.enabled = !rule.enabled;
    return rule;
  }

  /**
   * Get rules for a specific user
   */
  getRulesForUser(userId: string): AlertRule[] {
    return Array.from(this.rules.values()).filter((r) =>
      r.notifyUsers.includes(userId)
    );
  }

  /**
   * Get events for a specific session
   */
  getEventsForSession(sessionId: string): AlertEvent[] {
    return this.events.filter((e) => e.sessionId === sessionId);
  }

  /**
   * Export rules as JSON
   */
  exportRules(): string {
    return JSON.stringify(Array.from(this.rules.values()), null, 2);
  }

  /**
   * Import rules from JSON
   */
  importRules(json: string): number {
    try {
      const rules = JSON.parse(json) as AlertRule[];
      let imported = 0;

      for (const rule of rules) {
        this.rules.set(rule.id, rule);
        imported++;
      }

      return imported;
    } catch {
      return 0;
    }
  }
}

// Export singleton instance
export const alertRuleManager = new AlertRuleManager();
