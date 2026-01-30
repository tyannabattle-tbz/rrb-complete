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


// ============================================================================
// ADMIN DASHBOARD TABLES
// ============================================================================

export const systemMetrics = mysqlTable("system_metrics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  activeUsers: int("activeUsers").default(0),
  totalSessions: int("totalSessions").default(0),
  totalRequests: int("totalRequests").default(0),
  totalTokens: int("totalTokens").default(0),
  averageResponseTime: decimal("averageResponseTime", { precision: 10, scale: 2 }).default("0"),
  errorRate: decimal("errorRate", { precision: 5, scale: 2 }).default("0"),
  cpuUsage: decimal("cpuUsage", { precision: 5, scale: 2 }).default("0"),
  memoryUsage: decimal("memoryUsage", { precision: 5, scale: 2 }).default("0"),
  storageUsage: decimal("storageUsage", { precision: 10, scale: 2 }).default("0"),
});

export type SystemMetric = typeof systemMetrics.$inferSelect;
export type InsertSystemMetric = typeof systemMetrics.$inferInsert;

export const systemAlerts = mysqlTable("system_alerts", {
  id: int("id").autoincrement().primaryKey(),
  severity: mysqlEnum("severity", ["critical", "warning", "info"]).default("info"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "acknowledged", "resolved"]).default("active"),
  acknowledgedBy: int("acknowledgedBy"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertSystemAlert = typeof systemAlerts.$inferInsert;

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(),
  resource: varchar("resource", { length: 255 }).notNull(),
  resourceId: varchar("resourceId", { length: 255 }),
  changes: json("changes").$type<Record<string, any>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["success", "failure"]).default("success"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================================================
// WEBHOOK MARKETPLACE TABLES
// ============================================================================

export const webhookTemplates = mysqlTable("webhook_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  webhookUrl: varchar("webhookUrl", { length: 2048 }).notNull(),
  events: text("events").notNull(),
  configSchema: json("configSchema").$type<Record<string, any>>(),
  documentation: text("documentation"),
  isPublic: boolean("isPublic").default(true),
  downloads: int("downloads").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviews: int("reviews").default(0),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookTemplate = typeof webhookTemplates.$inferSelect;
export type InsertWebhookTemplate = typeof webhookTemplates.$inferInsert;

export const webhookInstallations = mysqlTable("webhook_installations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  templateId: int("templateId").notNull().references(() => webhookTemplates.id),
  name: varchar("name", { length: 255 }).notNull(),
  config: json("config").$type<Record<string, any>>().notNull(),
  isActive: boolean("isActive").default(true),
  lastTriggered: timestamp("lastTriggered"),
  successCount: int("successCount").default(0),
  failureCount: int("failureCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookInstallation = typeof webhookInstallations.$inferSelect;
export type InsertWebhookInstallation = typeof webhookInstallations.$inferInsert;

export const webhookMarketplaceReviews = mysqlTable("webhook_marketplace_reviews", {
  id: int("id").autoincrement().primaryKey(),
  templateId: int("templateId").notNull().references(() => webhookTemplates.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: int("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookMarketplaceReview = typeof webhookMarketplaceReviews.$inferSelect;
export type InsertWebhookMarketplaceReview = typeof webhookMarketplaceReviews.$inferInsert;

// ============================================================================
// MODEL FINE-TUNING TABLES
// ============================================================================

export const finetuningDatasets = mysqlTable("finetuning_datasets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dataCount: int("dataCount").default(0),
  status: mysqlEnum("status", ["draft", "ready", "training", "completed", "failed"]).default("draft"),
  quality: mysqlEnum("quality", ["excellent", "good", "fair", "poor"]).default("good"),
  tags: text("tags"),
  splitRatio: json("splitRatio").$type<{ train: number; validation: number; test: number }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinetuningDataset = typeof finetuningDatasets.$inferSelect;
export type InsertFinetuningDataset = typeof finetuningDatasets.$inferInsert;

export const finetuningJobs = mysqlTable("finetuning_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  datasetId: int("datasetId").notNull().references(() => finetuningDatasets.id, { onDelete: "cascade" }),
  modelName: varchar("modelName", { length: 255 }).notNull(),
  baseModel: varchar("baseModel", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "training", "completed", "failed"]).default("pending"),
  progress: int("progress").default(0),
  epochs: int("epochs").default(3),
  batchSize: int("batchSize").default(32),
  learningRate: decimal("learningRate", { precision: 10, scale: 6 }).default("0.0001"),
  trainingStartedAt: timestamp("trainingStartedAt"),
  trainingCompletedAt: timestamp("trainingCompletedAt"),
  metrics: json("metrics").$type<Record<string, any>>(),
  error: text("error"),
  modelPath: varchar("modelPath", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FinetuningJob = typeof finetuningJobs.$inferSelect;
export type InsertFinetuningJob = typeof finetuningJobs.$inferInsert;

export const finetuningModels = mysqlTable("finetuning_models", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  jobId: int("jobId").notNull().references(() => finetuningJobs.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  baseModel: varchar("baseModel", { length: 255 }).notNull(),
  version: varchar("version", { length: 32 }).default("1.0.0"),
  status: mysqlEnum("status", ["active", "archived", "deprecated"]).default("active"),
  accuracy: decimal("accuracy", { precision: 5, scale: 4 }),
  precision: decimal("precision", { precision: 5, scale: 4 }),
  recall: decimal("recall", { precision: 5, scale: 4 }),
  f1Score: decimal("f1Score", { precision: 5, scale: 4 }),
  modelPath: varchar("modelPath", { length: 2048 }).notNull(),
  usageCount: int("usageCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinetuningModel = typeof finetuningModels.$inferSelect;
export type InsertFinetuningModel = typeof finetuningModels.$inferInsert;

export const finetuningEvaluations = mysqlTable("finetuning_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  jobId: int("jobId").notNull().references(() => finetuningJobs.id, { onDelete: "cascade" }),
  modelId: int("modelId").notNull().references(() => finetuningModels.id, { onDelete: "cascade" }),
  testDataSize: int("testDataSize"),
  accuracy: decimal("accuracy", { precision: 5, scale: 4 }).notNull(),
  precision: decimal("precision", { precision: 5, scale: 4 }).notNull(),
  recall: decimal("recall", { precision: 5, scale: 4 }).notNull(),
  f1Score: decimal("f1Score", { precision: 5, scale: 4 }).notNull(),
  confusionMatrix: json("confusionMatrix").$type<number[][]>(),
  classReport: json("classReport").$type<Record<string, any>>(),
  evaluatedAt: timestamp("evaluatedAt").defaultNow().notNull(),
});

export type FinetuningEvaluation = typeof finetuningEvaluations.$inferSelect;
export type InsertFinetuningEvaluation = typeof finetuningEvaluations.$inferInsert;

export const modelComparisons = mysqlTable("model_comparisons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  baselineModelId: int("baselineModelId").notNull().references(() => finetuningModels.id),
  candidateModelId: int("candidateModelId").notNull().references(() => finetuningModels.id),
  testDataSize: int("testDataSize"),
  baselineMetrics: json("baselineMetrics").$type<Record<string, any>>().notNull(),
  candidateMetrics: json("candidateMetrics").$type<Record<string, any>>().notNull(),
  improvement: decimal("improvement", { precision: 5, scale: 2 }),
  recommendation: mysqlEnum("recommendation", ["use_baseline", "use_candidate", "inconclusive"]).default("inconclusive"),
  comparedAt: timestamp("comparedAt").defaultNow().notNull(),
});

export type ModelComparison = typeof modelComparisons.$inferSelect;
export type InsertModelComparison = typeof modelComparisons.$inferInsert;


// ============================================================================
// SESSION AUTO-SAVE & VERSION HISTORY
// ============================================================================

export const sessionVersions = mysqlTable("session_versions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  versionNumber: int("versionNumber").notNull(),
  snapshot: json("snapshot").$type<Record<string, any>>().notNull(), // Full session state
  messageCount: int("messageCount").default(0),
  toolExecutionCount: int("toolExecutionCount").default(0),
  taskCount: int("taskCount").default(0),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull().references(() => users.id),
});

export type SessionVersion = typeof sessionVersions.$inferSelect;
export type InsertSessionVersion = typeof sessionVersions.$inferInsert;

export const autoSaveSettings = mysqlTable("auto_save_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  autoSaveEnabled: boolean("autoSaveEnabled").default(true),
  autoSaveInterval: int("autoSaveInterval").default(60000), // milliseconds
  maxVersions: int("maxVersions").default(50),
  retentionDays: int("retentionDays").default(30),
  lastAutoSave: timestamp("lastAutoSave"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoSaveSetting = typeof autoSaveSettings.$inferSelect;
export type InsertAutoSaveSetting = typeof autoSaveSettings.$inferInsert;

// ============================================================================
// ADVANCED FILTERING
// ============================================================================

export const filterPresets = mysqlTable("filter_presets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  filterConfig: json("filterConfig").$type<Record<string, any>>().notNull(), // Filter criteria
  isPublic: boolean("isPublic").default(false),
  usageCount: int("usageCount").default(0),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FilterPreset = typeof filterPresets.$inferSelect;
export type InsertFilterPreset = typeof filterPresets.$inferInsert;

export const filterHistory = mysqlTable("filter_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  filterConfig: json("filterConfig").$type<Record<string, any>>().notNull(),
  resultCount: int("resultCount").default(0),
  executionTime: int("executionTime"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FilterHistory = typeof filterHistory.$inferSelect;
export type InsertFilterHistory = typeof filterHistory.$inferInsert;

// ============================================================================
// REAL-TIME NOTIFICATIONS & WEBSOCKET
// ============================================================================

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => agentSessions.id, { onDelete: "cascade" }),
  type: mysqlEnum("type", ["message", "tool_execution", "task_completion", "error", "warning", "info"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  isRead: boolean("isRead").default(false),
  actionUrl: varchar("actionUrl", { length: 2048 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  readAt: timestamp("readAt"),
  archivedAt: timestamp("archivedAt"),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  enablePushNotifications: boolean("enablePushNotifications").default(true),
  enableSoundNotifications: boolean("enableSoundNotifications").default(true),
  enableEmailNotifications: boolean("enableEmailNotifications").default(false),
  soundVolume: int("soundVolume").default(70), // 0-100
  notificationTypes: json("notificationTypes").$type<string[]>(),
  escalationEnabled: boolean("escalationEnabled").default(true),
  escalationDelay: int("escalationDelay").default(300000), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

export const escalationPolicies = mysqlTable("escalation_policies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggers: json("triggers").$type<Record<string, any>>().notNull(), // Escalation triggers
  actions: json("actions").$type<Record<string, any>>().notNull(), // Actions to take
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EscalationPolicy = typeof escalationPolicies.$inferSelect;
export type InsertEscalationPolicy = typeof escalationPolicies.$inferInsert;

export const notificationEvents = mysqlTable("notification_events", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notificationId").notNull().references(() => notifications.id, { onDelete: "cascade" }),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  channel: mysqlEnum("channel", ["push", "email", "sound", "webhook"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed", "delivered"]).default("pending"),
  error: text("error"),
  sentAt: timestamp("sentAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificationEvent = typeof notificationEvents.$inferSelect;
export type InsertNotificationEvent = typeof notificationEvents.$inferInsert;
