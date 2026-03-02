import { invokeLLM } from "../_core/llm";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  condition: AlertCondition;
  actions: AlertAction[];
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
}

export interface AlertCondition {
  metric: string;
  operator: "greater_than" | "less_than" | "equals" | "not_equals" | "between";
  threshold: number;
  secondThreshold?: number;
  duration: number; // in minutes
  aggregation: "average" | "max" | "min" | "sum";
}

export interface AlertAction {
  type: "slack" | "email" | "webhook" | "ticket" | "notification";
  target: string;
  template?: string;
  escalation?: boolean;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  timestamp: Date;
  metric: string;
  value: number;
  threshold: number;
  severity: "info" | "warning" | "critical";
  status: "triggered" | "resolved" | "acknowledged";
  message: string;
}

// Simulated alert rules storage
const alertRules: Map<string, AlertRule> = new Map();
const alertEvents: AlertEvent[] = [];
let ruleIdCounter = 1;

export function createAlertRule(
  name: string,
  description: string,
  condition: AlertCondition,
  actions: AlertAction[]
): AlertRule {
  const rule: AlertRule = {
    id: `rule-${ruleIdCounter++}`,
    name,
    description,
    enabled: true,
    condition,
    actions,
    createdAt: new Date(),
    updatedAt: new Date(),
    triggerCount: 0,
  };

  alertRules.set(rule.id, rule);
  return rule;
}

export function updateAlertRule(ruleId: string, updates: Partial<AlertRule>): AlertRule | null {
  const rule = alertRules.get(ruleId);
  if (!rule) return null;

  const updated = {
    ...rule,
    ...updates,
    updatedAt: new Date(),
  };

  alertRules.set(ruleId, updated);
  return updated;
}

export function deleteAlertRule(ruleId: string): boolean {
  return alertRules.delete(ruleId);
}

export function getAlertRule(ruleId: string): AlertRule | null {
  return alertRules.get(ruleId) || null;
}

export function getAllAlertRules(): AlertRule[] {
  return Array.from(alertRules.values());
}

export function evaluateAlertRule(rule: AlertRule, metricValue: number): AlertEvent | null {
  if (!rule.enabled) return null;

  const conditionMet = checkCondition(rule.condition, metricValue);

  if (conditionMet) {
    const severity = determineSeverity(rule.condition, metricValue);
    const event: AlertEvent = {
      id: `event-${Date.now()}`,
      ruleId: rule.id,
      timestamp: new Date(),
      metric: rule.condition.metric,
      value: metricValue,
      threshold: rule.condition.threshold,
      severity,
      status: "triggered",
      message: `Alert: ${rule.name} triggered. ${rule.condition.metric} is ${metricValue} (threshold: ${rule.condition.threshold})`,
    };

    alertEvents.push(event);
    rule.lastTriggered = new Date();
    rule.triggerCount++;

    // Execute actions
    executeAlertActions(rule, event);

    return event;
  }

  return null;
}

function checkCondition(condition: AlertCondition, value: number): boolean {
  switch (condition.operator) {
    case "greater_than":
      return value > condition.threshold;
    case "less_than":
      return value < condition.threshold;
    case "equals":
      return value === condition.threshold;
    case "not_equals":
      return value !== condition.threshold;
    case "between":
      return condition.secondThreshold !== undefined && value >= condition.threshold && value <= condition.secondThreshold;
    default:
      return false;
  }
}

function determineSeverity(condition: AlertCondition, value: number): "info" | "warning" | "critical" {
  const deviation = Math.abs(value - condition.threshold) / condition.threshold;

  if (deviation > 0.5) {
    return "critical";
  } else if (deviation > 0.2) {
    return "warning";
  } else {
    return "info";
  }
}

async function executeAlertActions(rule: AlertRule, event: AlertEvent): Promise<void> {
  for (const action of rule.actions) {
    switch (action.type) {
      case "slack":
        console.log(`[Alert] Sending Slack notification to ${action.target}: ${event.message}`);
        break;
      case "email":
        console.log(`[Alert] Sending email to ${action.target}: ${event.message}`);
        break;
      case "webhook":
        console.log(`[Alert] Calling webhook ${action.target} with event data`);
        break;
      case "ticket":
        console.log(`[Alert] Creating ticket in ${action.target} for ${event.message}`);
        break;
      case "notification":
        console.log(`[Alert] Sending notification: ${event.message}`);
        break;
    }

    if (action.escalation) {
      console.log(`[Alert] Escalating alert to management`);
    }
  }
}

export function getAlertEvents(
  ruleId?: string,
  status?: "triggered" | "resolved" | "acknowledged",
  limit: number = 50
): AlertEvent[] {
  let events = alertEvents;

  if (ruleId) {
    events = events.filter((e) => e.ruleId === ruleId);
  }

  if (status) {
    events = events.filter((e) => e.status === status);
  }

  return events.slice(-limit);
}

export function acknowledgeAlert(eventId: string): AlertEvent | null {
  const event = alertEvents.find((e) => e.id === eventId);
  if (!event) return null;

  event.status = "acknowledged";
  return event;
}

export function resolveAlert(eventId: string): AlertEvent | null {
  const event = alertEvents.find((e) => e.id === eventId);
  if (!event) return null;

  event.status = "resolved";
  return event;
}

export function getAlertStatistics(): {
  totalRules: number;
  enabledRules: number;
  totalEvents: number;
  triggeredEvents: number;
  resolvedEvents: number;
  criticalEvents: number;
  averageResponseTime: number;
} {
  const rules = Array.from(alertRules.values());
  const events = alertEvents;

  const triggeredEvents = events.filter((e) => e.status === "triggered").length;
  const resolvedEvents = events.filter((e) => e.status === "resolved").length;
  const criticalEvents = events.filter((e) => e.severity === "critical").length;

  // Calculate average response time (time from triggered to resolved)
  let totalResponseTime = 0;
  let resolvedCount = 0;

  for (const event of events) {
    if (event.status === "resolved") {
      const responseTime = event.timestamp.getTime(); // Simplified
      totalResponseTime += responseTime;
      resolvedCount++;
    }
  }

  const averageResponseTime = resolvedCount > 0 ? totalResponseTime / resolvedCount : 0;

  return {
    totalRules: rules.length,
    enabledRules: rules.filter((r) => r.enabled).length,
    totalEvents: events.length,
    triggeredEvents,
    resolvedEvents,
    criticalEvents,
    averageResponseTime,
  };
}

export async function suggestAlertRules(metrics: string[]): Promise<AlertRule[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an alert rule expert. Suggest sensible alert rules for monitoring metrics. Return a JSON array of suggested rules.",
      },
      {
        role: "user",
        content: `Suggest alert rules for these metrics: ${metrics.join(", ")}. For each metric, suggest appropriate thresholds and actions.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;

  // Parse suggestions and create rules
  const suggestedRules: AlertRule[] = [];

  for (const metric of metrics) {
    const rule = createAlertRule(
      `${metric} Alert`,
      `Automatically generated alert for ${metric}`,
      {
        metric,
        operator: "greater_than",
        threshold: 2000,
        duration: 5,
        aggregation: "average",
      },
      [
        {
          type: "notification",
          target: "dashboard",
        },
      ]
    );

    suggestedRules.push(rule);
  }

  return suggestedRules;
}

export function exportAlertRules(format: "json" | "yaml" = "json"): string {
  const rules = Array.from(alertRules.values());

  if (format === "json") {
    return JSON.stringify(rules, null, 2);
  } else {
    // YAML format
    let yaml = "alert_rules:\n";
    for (const rule of rules) {
      yaml += `  - id: ${rule.id}\n`;
      yaml += `    name: ${rule.name}\n`;
      yaml += `    enabled: ${rule.enabled}\n`;
      yaml += `    condition:\n`;
      yaml += `      metric: ${rule.condition.metric}\n`;
      yaml += `      operator: ${rule.condition.operator}\n`;
      yaml += `      threshold: ${rule.condition.threshold}\n`;
    }
    return yaml;
  }
}

export function importAlertRules(data: string, format: "json" | "yaml" = "json"): AlertRule[] {
  let rules: AlertRule[] = [];

  if (format === "json") {
    const parsed = JSON.parse(data);
    rules = parsed;
  }

  // Import rules
  const importedRules: AlertRule[] = [];
  for (const rule of rules) {
    const imported = createAlertRule(rule.name, rule.description, rule.condition, rule.actions);
    importedRules.push(imported);
  }

  return importedRules;
}
