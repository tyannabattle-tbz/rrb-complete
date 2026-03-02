# Enterprise Features Documentation

This document outlines the advanced enterprise-grade features added to the Manus Agent platform.

## Table of Contents

1. [Email Service Integration](#email-service-integration)
2. [Session Webhooks](#session-webhooks)
3. [Performance Metrics Dashboard](#performance-metrics-dashboard)
4. [Advanced Reporting System](#advanced-reporting-system)
5. [API Rate Limiting & Quotas](#api-rate-limiting--quotas)
6. [Plugin System](#plugin-system)
7. [Training Data Management](#training-data-management)
8. [Agent Snapshots](#agent-snapshots)
9. [Integration Logging](#integration-logging)
10. [Feature Flags](#feature-flags)

---

## Email Service Integration

### Overview

The email service provides multi-provider support for sending emails, including SendGrid, Mailgun, and SMTP.

### Configuration

**Setup Email Provider:**

```typescript
// Configure email provider
await trpc.reporting.configureEmail.mutate({
  provider: "sendgrid",
  apiKey: "your-sendgrid-api-key",
  fromEmail: "noreply@example.com",
  fromName: "Manus Agent",
});
```

### Supported Providers

- **SendGrid**: Enterprise-grade email delivery
- **Mailgun**: Flexible email API
- **SMTP**: Standard SMTP protocol

### Usage Example

```typescript
const emailService = new EmailService("sendgrid", {
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: "noreply@example.com",
  fromName: "Manus Agent",
});

await emailService.send({
  to: ["user@example.com"],
  subject: "Weekly Report",
  html: "<h1>Your Weekly Report</h1>",
  attachments: [
    {
      filename: "report.pdf",
      content: pdfBuffer,
      contentType: "application/pdf",
    },
  ],
});
```

---

## Session Webhooks

### Overview

Webhooks enable real-time integration with external systems by pushing session events to configured endpoints.

### Supported Events

- `session.created` - When a new session is created
- `session.started` - When a session begins execution
- `session.completed` - When a session completes successfully
- `session.failed` - When a session encounters an error
- `message.added` - When a new message is added to a session
- `tool.executed` - When a tool is executed
- `task.completed` - When a task completes
- `agent.error` - When an agent error occurs

### Setup

**Create a Webhook Endpoint:**

```typescript
const { id, secret } = await trpc.webhooks.create.mutate({
  url: "https://your-api.example.com/webhooks/agent",
  events: ["session.completed", "session.failed", "tool.executed"],
  retryCount: 3,
});

// Store the secret securely for signature verification
```

### Webhook Payload

Each webhook includes:

```typescript
{
  event: "session.completed",
  timestamp: 1704067200000,
  data: {
    sessionId: 1,
    userId: 123,
    duration: 5000,
    messageCount: 10,
    toolCount: 5,
    timestamp: 1704067200000
  },
  signature: "sha256-hmac-signature"
}
```

### Signature Verification

```typescript
import crypto from "crypto";

function verifyWebhook(payload: string, signature: string, secret: string) {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Webhook Management

```typescript
// List all webhooks
const webhooks = await trpc.webhooks.list.query();

// Update a webhook
await trpc.webhooks.update.mutate({
  webhookId: 1,
  url: "https://new-url.example.com/webhooks",
  events: ["session.completed"],
});

// Delete a webhook
await trpc.webhooks.delete.mutate({ webhookId: 1 });

// Get webhook logs for debugging
const logs = await trpc.webhooks.getLogs.query({
  webhookId: 1,
  limit: 50,
});

// Test a webhook
await trpc.webhooks.test.mutate({ webhookId: 1 });
```

---

## Performance Metrics Dashboard

### Overview

Real-time performance monitoring and analytics for agent sessions, tool execution, and resource usage.

### Metrics Snapshot

```typescript
const metrics = await trpc.metrics.getSnapshot.query();

// Returns:
{
  totalSessions: 150,
  totalMessages: 2500,
  totalToolExecutions: 800,
  averageSessionDuration: 45.2, // seconds
  successRate: 94.5, // percentage
  errorRate: 5.5, // percentage
  averageResponseTime: 1234, // milliseconds
  topTools: [
    { name: "web_search", count: 250, avgDuration: 1500 },
    { name: "calculator", count: 180, avgDuration: 800 }
  ],
  dailyActivity: [
    { date: "2026-01-23", sessions: 15, messages: 250 },
    { date: "2026-01-24", sessions: 18, messages: 290 }
  ],
  quotaUsage: {
    requestsUsed: 5000,
    requestsLimit: 10000,
    tokensUsed: 500000,
    tokensLimit: 1000000,
    percentageUsed: 50
  }
}
```

### Performance Reports

```typescript
// Generate weekly report
const report = await trpc.metrics.generateReport.query({
  period: "weekly", // "daily" | "weekly" | "monthly"
});

// Returns:
{
  period: "weekly",
  startDate: Date,
  endDate: Date,
  metrics: MetricsSnapshot,
  trends: {
    sessionTrend: "increasing",
    errorTrend: "stable",
    performanceTrend: "improving"
  },
  recommendations: [
    "Error rate is below 10%. Keep monitoring.",
    "Success rate is excellent at 94.5%."
  ]
}
```

### Quota Management

```typescript
// Get quota status
const status = await trpc.metrics.getQuotaStatus.query();

// Get quota details
const quota = await trpc.metrics.getQuota.query();

// Get API usage history
const usage = await trpc.metrics.getApiUsageHistory.query({
  days: 30,
});

// Export metrics as CSV
const { csv, filename } = await trpc.metrics.exportAsCSV.query();
```

### Recording Custom Metrics

```typescript
// Record a metric
await trpc.metrics.recordMetric.mutate({
  metricType: "api_call",
  value: 1234,
  unit: "ms",
  sessionId: 1,
  metadata: { provider: "openai", model: "gpt-4" },
});

// Record API usage
await trpc.metrics.recordApiUsage.mutate({
  requestCount: 10,
  tokenCount: 2500,
  errorCount: 1,
  totalDuration: 5000,
});
```

---

## Advanced Reporting System

### Overview

Automated report generation and delivery via email with customizable schedules and metrics.

### Create Scheduled Report

```typescript
const reportId = await trpc.reporting.createScheduledReport.mutate({
  name: "Weekly Performance Report",
  reportType: "weekly",
  schedule: "0 9 * * 1", // Cron: Monday at 9 AM
  recipients: ["team@example.com", "manager@example.com"],
  includeMetrics: [
    "sessionCount",
    "successRate",
    "topTools",
    "quotaUsage",
  ],
  description: "Weekly summary of agent performance metrics",
});
```

### Report Types

- **Daily**: `0 9 * * *` (Every day at 9 AM)
- **Weekly**: `0 9 * * 1` (Every Monday at 9 AM)
- **Monthly**: `0 9 1 * *` (First day of month at 9 AM)
- **Custom**: Any valid cron expression

### Report Management

```typescript
// List all scheduled reports
const reports = await trpc.reporting.listScheduledReports.query();

// Send report immediately
await trpc.reporting.sendReportNow.mutate({ reportId: 1 });

// Get report history
const history = await trpc.reporting.getReportHistory.query({
  reportId: 1,
});

// Delete a scheduled report
await trpc.reporting.deleteScheduledReport.mutate({ reportId: 1 });
```

### Email Configuration

```typescript
// Configure email for reports
await trpc.reporting.configureEmail.mutate({
  provider: "sendgrid",
  apiKey: process.env.SENDGRID_API_KEY,
  fromEmail: "reports@example.com",
  fromName: "Manus Reports",
});

// Get email configuration
const config = await trpc.reporting.getEmailConfig.query();
```

---

## API Rate Limiting & Quotas

### Overview

Per-user and per-workspace API quotas with automatic tracking and enforcement.

### Quota Structure

```typescript
{
  requestsPerDay: 10000,
  tokensPerDay: 1000000,
  concurrentSessions: 10,
  storageGB: 100,
  resetDate: Date
}
```

### Tracking API Usage

```typescript
// Automatically tracked for each API call
// Available via metrics dashboard

const usage = await trpc.metrics.getApiUsageHistory.query({
  days: 30,
});

// Returns daily usage breakdown
[
  {
    date: "2026-01-24",
    requestCount: 500,
    tokenCount: 50000,
    errorCount: 5,
    totalDuration: 25000,
  },
];
```

### Quota Warnings

The system automatically generates warnings when:

- Request usage exceeds 80% of daily limit
- Token usage exceeds 80% of daily limit
- Critical warnings at 95%+ usage

---

## Plugin System

### Overview

Extensible plugin architecture for custom tools, integrations, and middleware.

### Plugin Types

- **tool**: Custom tool for agent execution
- **integration**: External service integration
- **middleware**: Request/response processing
- **custom**: User-defined plugin

### Create Plugin

```typescript
const pluginId = await db.createPlugin(
  userId,
  "Custom Web Scraper",
  "tool",
  `
    export async function execute(params) {
      const url = params.url;
      const response = await fetch(url);
      return await response.text();
    }
  `,
  { timeout: 30000, retries: 3 }
);
```

### Plugin Management

```typescript
// Get active plugins
const plugins = await db.getActivePlugins(userId);

// Update plugin
// Delete plugin (mark as inactive)
```

---

## Training Data Management

### Overview

Collect and organize training data for model fine-tuning and improvement.

### Record Training Data

```typescript
await db.addTrainingData(
  userId,
  "What is the capital of France?",
  "The capital of France is Paris.",
  "excellent", // quality: "excellent" | "good" | "fair" | "poor"
  ["geography", "capitals"],
  sessionId
);
```

### Training Data Usage

Training data can be:

- Used for fine-tuning custom models
- Analyzed for pattern recognition
- Exported for external training
- Reviewed for quality improvement

---

## Agent Snapshots

### Overview

Create and restore agent configuration snapshots for versioning and rollback.

### Create Snapshot

```typescript
const snapshotId = await db.createSnapshot(
  userId,
  sessionId,
  "Pre-Production Checkpoint",
  {
    systemPrompt: "You are a helpful assistant...",
    temperature: 0.7,
    model: "gpt-4",
    maxSteps: 50,
  },
  serializedMemoryState,
  "Snapshot before deploying new system prompt"
);
```

### Snapshot Management

```typescript
// Get all snapshots for a session
const snapshots = await db.getSnapshots(sessionId);

// Restore from snapshot
// (Implementation depends on your restore logic)
```

---

## Integration Logging

### Overview

Comprehensive logging of all external service integrations for debugging and auditing.

### Log Integration Call

```typescript
await db.addIntegrationLog(
  userId,
  "openai_api",
  "create_completion",
  "success",
  JSON.stringify({ model: "gpt-4", messages: [...] }),
  JSON.stringify({ choices: [...] }),
  undefined,
  1234 // duration in ms
);
```

### Integration Log Structure

```typescript
{
  userId: number,
  serviceName: string,
  action: string,
  status: "success" | "failure" | "pending",
  request: string, // JSON
  response: string, // JSON
  error: string | null,
  duration: number, // milliseconds
  createdAt: Date
}
```

---

## Feature Flags

### Overview

Control feature availability and rollout percentage per user.

### Set Feature Flag

```typescript
await db.setFeatureFlag(
  userId,
  "advanced_analytics",
  true,
  100, // rollout percentage
  { theme: "dark" } // config
);
```

### Check Feature Flag

```typescript
const flag = await db.getFeatureFlag(userId, "advanced_analytics");

if (flag?.isEnabled) {
  // Enable feature
}
```

### Feature Flag Structure

```typescript
{
  flagName: string,
  isEnabled: boolean,
  rolloutPercentage: number, // 0-100
  config: Record<string, any>,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Database Schema

### New Tables

- `email_configs` - Email provider configuration
- `scheduled_reports` - Report schedules
- `report_history` - Report delivery history
- `webhook_endpoints` - Webhook subscriptions
- `webhook_logs` - Webhook delivery logs
- `performance_metrics` - Performance data points
- `api_usage` - Daily API usage tracking
- `quotas` - User quotas and limits
- `plugins` - Custom plugins
- `training_data` - Training data for fine-tuning
- `agent_snapshots` - Agent configuration snapshots
- `integration_logs` - External service logs
- `feature_flags` - Feature flag configuration

---

## Best Practices

### Security

1. **API Keys**: Always encrypt API keys at rest
2. **Webhook Secrets**: Use strong secrets and verify signatures
3. **Rate Limiting**: Enforce quotas to prevent abuse
4. **Audit Logging**: Log all integration activities

### Performance

1. **Batch Operations**: Group webhook deliveries
2. **Caching**: Cache frequently accessed metrics
3. **Async Processing**: Use background jobs for reports
4. **Pagination**: Limit result sets for large queries

### Reliability

1. **Retry Logic**: Implement exponential backoff for webhooks
2. **Fallbacks**: Have fallback mechanisms for external services
3. **Monitoring**: Track integration health continuously
4. **Alerts**: Set up alerts for quota warnings

---

## API Reference

### tRPC Procedures

#### Webhooks

- `webhooks.create` - Create webhook endpoint
- `webhooks.list` - List all webhooks
- `webhooks.update` - Update webhook
- `webhooks.delete` - Delete webhook
- `webhooks.getLogs` - Get webhook logs
- `webhooks.test` - Test webhook

#### Reporting

- `reporting.configureEmail` - Configure email provider
- `reporting.getEmailConfig` - Get email config
- `reporting.createScheduledReport` - Create scheduled report
- `reporting.listScheduledReports` - List reports
- `reporting.sendReportNow` - Send report immediately
- `reporting.getReportHistory` - Get report history
- `reporting.deleteScheduledReport` - Delete report

#### Metrics

- `metrics.getSnapshot` - Get metrics snapshot
- `metrics.generateReport` - Generate performance report
- `metrics.getQuotaStatus` - Get quota status
- `metrics.recordMetric` - Record custom metric
- `metrics.recordApiUsage` - Record API usage
- `metrics.exportAsCSV` - Export metrics as CSV
- `metrics.getApiUsageHistory` - Get usage history
- `metrics.getQuota` - Get quota details
- `metrics.updateQuota` - Update quota (admin only)

---

## Testing

All enterprise features include comprehensive test coverage:

- `webhooks.test.ts` - Webhook service tests
- `email.test.ts` - Email service tests
- `metrics.test.ts` - Metrics service tests

Run tests with:

```bash
pnpm test
```

---

## Support

For issues or questions about enterprise features:

1. Check the test files for usage examples
2. Review the service implementations in `server/services/`
3. Consult the tRPC router definitions in `server/routers/`
4. Contact support at support@manus.im
