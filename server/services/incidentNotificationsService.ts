export interface NotificationChannel {
  id: string;
  type: "slack" | "email" | "pagerduty" | "webhook";
  config: Record<string, string>;
  enabled: boolean;
}

export interface EscalationPolicy {
  id: string;
  name: string;
  rules: EscalationRule[];
  enabled: boolean;
}

export interface EscalationRule {
  severity: "critical" | "high" | "medium" | "low";
  delayMinutes: number;
  channels: string[]; // channel IDs
  maxRetries: number;
}

export interface NotificationLog {
  id: string;
  incidentId: string;
  channelId: string;
  status: "sent" | "failed" | "pending";
  message: string;
  sentAt: Date;
  error?: string;
}

export class IncidentNotificationsService {
  private channels: Map<string, NotificationChannel> = new Map();
  private escalationPolicies: Map<string, EscalationPolicy> = new Map();
  private notificationLog: NotificationLog[] = [];

  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel);
  }

  addEscalationPolicy(policy: EscalationPolicy): void {
    this.escalationPolicies.set(policy.id, policy);
  }

  async sendIncidentNotification(
    incidentId: string,
    incidentTitle: string,
    severity: string,
    affectedServices: string[],
    policyId: string
  ): Promise<NotificationLog[]> {
    const policy = this.escalationPolicies.get(policyId);
    if (!policy || !policy.enabled) return [];

    const rule = policy.rules.find((r) => r.severity === severity);
    if (!rule) return [];

    const logs: NotificationLog[] = [];

    for (const channelId of rule.channels) {
      const channel = this.channels.get(channelId);
      if (!channel || !channel.enabled) continue;

      const message = this.formatMessage(incidentTitle, severity, affectedServices, channel.type);

      const log: NotificationLog = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        incidentId,
        channelId,
        status: "pending",
        message,
        sentAt: new Date(),
      };

      try {
        await this.sendToChannel(channel, message);
        log.status = "sent";
      } catch (error) {
        log.status = "failed";
        log.error = error instanceof Error ? error.message : "Unknown error";
      }

      this.notificationLog.push(log);
      logs.push(log);
    }

    return logs;
  }

  private async sendToChannel(channel: NotificationChannel, message: string): Promise<void> {
    switch (channel.type) {
      case "slack":
        await this.sendToSlack(channel, message);
        break;
      case "email":
        await this.sendEmail(channel, message);
        break;
      case "pagerduty":
        await this.sendToPagerDuty(channel, message);
        break;
      case "webhook":
        await this.sendToWebhook(channel, message);
        break;
    }
  }

  private async sendToSlack(channel: NotificationChannel, message: string): Promise<void> {
    const webhookUrl = channel.config.webhookUrl;
    if (!webhookUrl) throw new Error("Slack webhook URL not configured");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!response.ok) throw new Error(`Slack API error: ${response.status}`);
  }

  private async sendEmail(channel: NotificationChannel, message: string): Promise<void> {
    const recipients = channel.config.recipients?.split(",") || [];
    if (recipients.length === 0) throw new Error("No email recipients configured");

    // In production, use actual email service
    console.log(`[Email] Sending to ${recipients.join(", ")}: ${message}`);
  }

  private async sendToPagerDuty(channel: NotificationChannel, message: string): Promise<void> {
    const integrationKey = channel.config.integrationKey;
    if (!integrationKey) throw new Error("PagerDuty integration key not configured");

    const response = await fetch("https://events.pagerduty.com/v2/enqueue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        routing_key: integrationKey,
        event_action: "trigger",
        payload: {
          summary: message,
          severity: "critical",
          source: "Manus Agent",
        },
      }),
    });

    if (!response.ok) throw new Error(`PagerDuty API error: ${response.status}`);
  }

  private async sendToWebhook(channel: NotificationChannel, message: string): Promise<void> {
    const webhookUrl = channel.config.webhookUrl;
    if (!webhookUrl) throw new Error("Webhook URL not configured");

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ incident: message, timestamp: new Date().toISOString() }),
    });

    if (!response.ok) throw new Error(`Webhook error: ${response.status}`);
  }

  private formatMessage(
    title: string,
    severity: string,
    services: string[],
    channelType: string
  ): string {
    const baseMessage = `🚨 INCIDENT: ${title} (${severity.toUpperCase()})\nAffected Services: ${services.join(", ")}`;

    if (channelType === "slack") {
      return `\`\`\`${baseMessage}\`\`\``;
    }
    return baseMessage;
  }

  getNotificationLog(incidentId?: string): NotificationLog[] {
    if (incidentId) {
      return this.notificationLog.filter((log) => log.incidentId === incidentId);
    }
    return this.notificationLog;
  }

  getChannels(): NotificationChannel[] {
    return Array.from(this.channels.values());
  }

  getEscalationPolicies(): EscalationPolicy[] {
    return Array.from(this.escalationPolicies.values());
  }

  getNotificationStats(): {
    totalNotifications: number;
    sentCount: number;
    failedCount: number;
    successRate: number;
  } {
    const total = this.notificationLog.length;
    const sent = this.notificationLog.filter((log) => log.status === "sent").length;
    const failed = this.notificationLog.filter((log) => log.status === "failed").length;

    return {
      totalNotifications: total,
      sentCount: sent,
      failedCount: failed,
      successRate: total > 0 ? (sent / total) * 100 : 0,
    };
  }
}
