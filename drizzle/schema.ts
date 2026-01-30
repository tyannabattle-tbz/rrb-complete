import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Agent Sessions
export const agentSessions = mysqlTable("agent_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  sessionName: varchar("sessionName", { length: 255 }).notNull(),
  systemPrompt: text("systemPrompt"),
  temperature: int("temperature").default(70),
  model: varchar("model", { length: 64 }).default("gpt-4-turbo"),
  maxSteps: int("maxSteps").default(50),
  status: mysqlEnum("status", ["idle", "reasoning", "executing", "completed", "error"]).default("idle"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSession = typeof agentSessions.$inferInsert;

// Messages
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

// Tool Executions
export const toolExecutions = mysqlTable("tool_executions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  toolName: varchar("toolName", { length: 255 }).notNull(),
  parameters: text("parameters"),
  result: text("result"),
  error: text("error"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending"),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ToolExecution = typeof toolExecutions.$inferSelect;
export type InsertToolExecution = typeof toolExecutions.$inferInsert;

// API Keys (Encrypted)
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 64 }).notNull(),
  keyName: varchar("keyName", { length: 255 }).notNull(),
  encryptedKey: text("encryptedKey").notNull(),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

// Task History
export const taskHistory = mysqlTable("task_history", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  taskDescription: text("taskDescription").notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending"),
  outcome: text("outcome"),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type TaskHistory = typeof taskHistory.$inferSelect;
export type InsertTaskHistory = typeof taskHistory.$inferInsert;

// Memory Store (Key-Value pairs)
export const memoryStore = mysqlTable("memory_store", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemoryStore = typeof memoryStore.$inferSelect;
export type InsertMemoryStore = typeof memoryStore.$inferInsert;

// ============================================================================
// NEW ENTERPRISE FEATURES
// ============================================================================

// Email Configuration & Scheduled Reports
export const emailConfigs = mysqlTable("email_configs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: mysqlEnum("provider", ["sendgrid", "mailgun", "smtp"]).default("sendgrid"),
  apiKey: text("apiKey").notNull(), // Encrypted
  fromEmail: varchar("fromEmail", { length: 255 }).notNull(),
  fromName: varchar("fromName", { length: 255 }),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailConfig = typeof emailConfigs.$inferSelect;
export type InsertEmailConfig = typeof emailConfigs.$inferInsert;

// Scheduled Reports
export const scheduledReports = mysqlTable("scheduled_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  reportType: mysqlEnum("reportType", ["weekly", "monthly", "daily", "custom"]).default("weekly"),
  schedule: varchar("schedule", { length: 255 }).notNull(), // Cron expression
  recipients: text("recipients").notNull(), // JSON array of emails
  includeMetrics: json("includeMetrics").$type<string[]>(), // Array of metric types
  isActive: boolean("isActive").default(true),
  lastRun: timestamp("lastRun"),
  nextRun: timestamp("nextRun"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = typeof scheduledReports.$inferInsert;

// Report History
export const reportHistory = mysqlTable("report_history", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull().references(() => scheduledReports.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["pending", "generating", "sent", "failed"]).default("pending"),
  sentTo: text("sentTo"), // JSON array of recipients
  error: text("error"),
  generatedAt: timestamp("generatedAt"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReportHistory = typeof reportHistory.$inferSelect;
export type InsertReportHistory = typeof reportHistory.$inferInsert;

// Session Webhooks
export const webhookEndpoints = mysqlTable("webhook_endpoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: varchar("url", { length: 2048 }).notNull(),
  events: text("events").notNull(), // JSON array of event types
  secret: varchar("secret", { length: 255 }).notNull(), // HMAC secret
  isActive: boolean("isActive").default(true),
  retryCount: int("retryCount").default(3),
  lastTriggered: timestamp("lastTriggered"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookEndpoint = typeof webhookEndpoints.$inferSelect;
export type InsertWebhookEndpoint = typeof webhookEndpoints.$inferInsert;

// Webhook Event Log
export const webhookLogs = mysqlTable("webhook_logs", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhookId").notNull().references(() => webhookEndpoints.id, { onDelete: "cascade" }),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  payload: text("payload").notNull(), // JSON
  statusCode: int("statusCode"),
  response: text("response"),
  error: text("error"),
  retryCount: int("retryCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

// Performance Metrics
export const performanceMetrics = mysqlTable("performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => agentSessions.id, { onDelete: "cascade" }),
  metricType: varchar("metricType", { length: 64 }).notNull(), // e.g., "api_call", "tool_execution", "token_usage"
  value: decimal("value", { precision: 15, scale: 4 }).notNull(),
  unit: varchar("unit", { length: 32 }), // e.g., "ms", "tokens", "calls"
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

// API Usage & Rate Limiting
export const apiUsage = mysqlTable("api_usage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  requestCount: int("requestCount").default(0),
  tokenCount: int("tokenCount").default(0),
  errorCount: int("errorCount").default(0),
  totalDuration: int("totalDuration").default(0), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApiUsage = typeof apiUsage.$inferSelect;
export type InsertApiUsage = typeof apiUsage.$inferInsert;

// Rate Limit Quotas
export const quotas = mysqlTable("quotas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  requestsPerDay: int("requestsPerDay").default(10000),
  tokensPerDay: int("tokensPerDay").default(1000000),
  concurrentSessions: int("concurrentSessions").default(10),
  storageGB: decimal("storageGB", { precision: 10, scale: 2 }).default("100"),
  resetDate: timestamp("resetDate").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quota = typeof quotas.$inferSelect;
export type InsertQuota = typeof quotas.$inferInsert;

// Agent Plugins & Extensions
export const plugins = mysqlTable("plugins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["tool", "integration", "middleware", "custom"]).default("custom"),
  code: text("code").notNull(), // Plugin source code
  config: json("config").$type<Record<string, any>>(),
  isActive: boolean("isActive").default(true),
  version: varchar("version", { length: 32 }).default("1.0.0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plugin = typeof plugins.$inferSelect;
export type InsertPlugin = typeof plugins.$inferInsert;

// Model Fine-tuning & Training Data
export const trainingData = mysqlTable("training_data", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => agentSessions.id, { onDelete: "cascade" }),
  input: text("input").notNull(),
  output: text("output").notNull(),
  quality: mysqlEnum("quality", ["excellent", "good", "fair", "poor"]).default("good"),
  tags: text("tags"), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TrainingData = typeof trainingData.$inferSelect;
export type InsertTrainingData = typeof trainingData.$inferInsert;

// Agent Snapshots & Checkpoints
export const agentSnapshots = mysqlTable("agent_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  config: json("config").$type<Record<string, any>>().notNull(), // Full agent config snapshot
  memory: text("memory"), // Serialized memory state
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AgentSnapshot = typeof agentSnapshots.$inferSelect;
export type InsertAgentSnapshot = typeof agentSnapshots.$inferInsert;

// Integration Logs (for debugging external service calls)
export const integrationLogs = mysqlTable("integration_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  serviceName: varchar("serviceName", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["success", "failure", "pending"]).default("pending"),
  request: text("request"), // JSON
  response: text("response"), // JSON
  error: text("error"),
  duration: int("duration"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = typeof integrationLogs.$inferInsert;

// Feature Flags & Experiments
export const featureFlags = mysqlTable("feature_flags", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  flagName: varchar("flagName", { length: 255 }).notNull(),
  isEnabled: boolean("isEnabled").default(false),
  rolloutPercentage: int("rolloutPercentage").default(0),
  config: json("config").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureFlag = typeof featureFlags.$inferSelect;
export type InsertFeatureFlag = typeof featureFlags.$inferInsert;
