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
// VOICE COMMANDS, BATCH PROCESSING & STORYBOARDING TABLES
// ============================================================================

// Voice Commands
export const voiceCommands = mysqlTable("voice_commands", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => agentSessions.id, { onDelete: "cascade" }),
  transcript: text("transcript").notNull(),
  intent: varchar("intent", { length: 64 }).notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  parameters: json("parameters").$type<Record<string, any>>(),
  result: text("result"),
  status: mysqlEnum("status", ["pending", "executing", "completed", "failed"]).default("pending"),
  error: text("error"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  executedAt: timestamp("executedAt"),
});

export type VoiceCommand = typeof voiceCommands.$inferSelect;
export type InsertVoiceCommand = typeof voiceCommands.$inferInsert;

// Batch Queues
export const batchQueues = mysqlTable("batch_queues", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  totalJobs: int("totalJobs").default(0),
  completedJobs: int("completedJobs").default(0),
  failedJobs: int("failedJobs").default(0),
  isPaused: boolean("isPaused").default(false),
  status: mysqlEnum("status", ["idle", "processing", "paused", "completed"]).default("idle"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BatchQueue = typeof batchQueues.$inferSelect;
export type InsertBatchQueue = typeof batchQueues.$inferInsert;

// Batch Jobs
export const batchJobs = mysqlTable("batch_jobs", {
  id: int("id").autoincrement().primaryKey(),
  queueId: int("queueId").notNull().references(() => batchQueues.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled", "paused"]).default("pending"),
  priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium"),
  progress: int("progress").default(0),
  estimatedTime: int("estimatedTime").default(60), // seconds
  elapsedTime: int("elapsedTime").default(0), // seconds
  parameters: json("parameters").$type<Record<string, any>>(),
  result: json("result").$type<Record<string, any>>(),
  error: text("error"),
  retryCount: int("retryCount").default(0),
  maxRetries: int("maxRetries").default(3),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BatchJob = typeof batchJobs.$inferSelect;
export type InsertBatchJob = typeof batchJobs.$inferInsert;

// Storyboards
export const storyboards = mysqlTable("storyboards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  scriptContent: text("scriptContent").notNull(),
  totalDuration: int("totalDuration").default(0), // seconds
  genre: varchar("genre", { length: 64 }),
  targetAudience: varchar("targetAudience", { length: 255 }),
  productionStyle: varchar("productionStyle", { length: 255 }),
  colorPalette: json("colorPalette").$type<string[]>(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Storyboard = typeof storyboards.$inferSelect;
export type InsertStoryboard = typeof storyboards.$inferInsert;

// Scenes
export const scenes = mysqlTable("scenes", {
  id: int("id").autoincrement().primaryKey(),
  storyboardId: int("storyboardId").notNull().references(() => storyboards.id, { onDelete: "cascade" }),
  sceneNumber: int("sceneNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  location: varchar("location", { length: 255 }).notNull(),
  timeOfDay: varchar("timeOfDay", { length: 64 }),
  mood: varchar("mood", { length: 64 }),
  duration: int("duration").default(0), // seconds
  characters: json("characters").$type<string[]>(),
  props: json("props").$type<string[]>(),
  lighting: text("lighting"),
  soundDesign: text("soundDesign"),
  visualEffects: json("visualEffects").$type<string[]>(),
  imagePrompt: text("imagePrompt"),
  generatedImageUrl: varchar("generatedImageUrl", { length: 2048 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Scene = typeof scenes.$inferSelect;
export type InsertScene = typeof scenes.$inferInsert;

// Shots
export const shots = mysqlTable("shots", {
  id: int("id").autoincrement().primaryKey(),
  sceneId: int("sceneId").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  shotNumber: int("shotNumber").notNull(),
  description: text("description"),
  composition: varchar("composition", { length: 64 }), // wide, medium, close-up, extreme close-up
  angle: varchar("angle", { length: 64 }), // high, level, low, dutch
  movement: varchar("movement", { length: 64 }), // static, pan, tilt, dolly, crane
  duration: int("duration").default(0), // seconds
  dialogue: json("dialogue").$type<string[]>(),
  actions: json("actions").$type<string[]>(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Shot = typeof shots.$inferSelect;
export type InsertShot = typeof shots.$inferInsert;


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
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
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


// ============================================================================
// ADVANCED ANALYTICS & METRICS
// ============================================================================
export const sessionMetrics = mysqlTable("session_metrics", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  duration: int("duration").notNull(), // milliseconds
  messageCount: int("messageCount").default(0),
  toolExecutionCount: int("toolExecutionCount").default(0),
  successfulToolExecutions: int("successfulToolExecutions").default(0),
  failedToolExecutions: int("failedToolExecutions").default(0),
  successRate: decimal("successRate", { precision: 5, scale: 2 }).default("0"), // 0-100
  averageToolDuration: int("averageToolDuration"), // milliseconds
  totalTokensUsed: int("totalTokensUsed").default(0),
  costEstimate: decimal("costEstimate", { precision: 10, scale: 4 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SessionMetrics = typeof sessionMetrics.$inferSelect;
export type InsertSessionMetrics = typeof sessionMetrics.$inferInsert;

export const toolUsageStats = mysqlTable("tool_usage_stats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  toolName: varchar("toolName", { length: 255 }).notNull(),
  executionCount: int("executionCount").default(0),
  successCount: int("successCount").default(0),
  failureCount: int("failureCount").default(0),
  totalDuration: int("totalDuration").default(0), // milliseconds
  averageDuration: int("averageDuration"), // milliseconds
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ToolUsageStats = typeof toolUsageStats.$inferSelect;
export type InsertToolUsageStats = typeof toolUsageStats.$inferInsert;

export const performanceTrends = mysqlTable("performance_trends", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  sessionCount: int("sessionCount").default(0),
  averageSessionDuration: int("averageSessionDuration"), // milliseconds
  totalToolExecutions: int("totalToolExecutions").default(0),
  averageSuccessRate: decimal("averageSuccessRate", { precision: 5, scale: 2 }).default("0"),
  totalTokensUsed: int("totalTokensUsed").default(0),
  estimatedCost: decimal("estimatedCost", { precision: 10, scale: 4 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PerformanceTrend = typeof performanceTrends.$inferSelect;
export type InsertPerformanceTrend = typeof performanceTrends.$inferInsert;

// ============================================================================
// TEAM COLLABORATION
// ============================================================================
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["viewer", "editor", "admin"]).default("viewer"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export const sessionShares = mysqlTable("session_shares", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  sharedBy: int("sharedBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  sharedWith: int("sharedWith").notNull().references(() => users.id, { onDelete: "cascade" }),
  permission: mysqlEnum("permission", ["view", "edit", "admin"]).default("view"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SessionShare = typeof sessionShares.$inferSelect;
export type InsertSessionShare = typeof sessionShares.$inferInsert;

export const sessionAnnotations = mysqlTable("session_annotations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  messageId: int("messageId").references(() => messages.id, { onDelete: "cascade" }),
  comment: text("comment").notNull(),
  type: mysqlEnum("type", ["note", "flag", "question", "suggestion"]).default("note"),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SessionAnnotation = typeof sessionAnnotations.$inferSelect;
export type InsertSessionAnnotation = typeof sessionAnnotations.$inferInsert;

export const activityLogs = mysqlTable("activity_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => agentSessions.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 64 }).notNull(),
  resourceId: int("resourceId"),
  changes: json("changes").$type<Record<string, any>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = typeof activityLogs.$inferInsert;

// ============================================================================
// API RATE LIMITING & QUOTA MANAGEMENT
// ============================================================================
export const subscriptionTiers = mysqlTable("subscription_tiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthlyPrice", { precision: 10, scale: 2 }).notNull(),
  requestsPerMinute: int("requestsPerMinute").notNull(),
  requestsPerDay: int("requestsPerDay").notNull(),
  requestsPerMonth: int("requestsPerMonth").notNull(),
  maxConcurrentSessions: int("maxConcurrentSessions").notNull(),
  maxTokensPerRequest: int("maxTokensPerRequest").notNull(),
  features: json("features").$type<string[]>().notNull(),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SubscriptionTier = typeof subscriptionTiers.$inferSelect;
export type InsertSubscriptionTier = typeof subscriptionTiers.$inferInsert;

export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  tierId: int("tierId").notNull().references(() => subscriptionTiers.id),
  status: mysqlEnum("status", ["active", "inactive", "suspended", "cancelled"]).default("active"),
  billingCycleStart: timestamp("billingCycleStart").notNull(),
  billingCycleEnd: timestamp("billingCycleEnd").notNull(),
  autoRenew: boolean("autoRenew").default(true),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

export const usageQuotas = mysqlTable("usage_quotas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  billingCycleStart: timestamp("billingCycleStart").notNull(),
  billingCycleEnd: timestamp("billingCycleEnd").notNull(),
  requestsUsed: int("requestsUsed").default(0),
  requestsLimit: int("requestsLimit").notNull(),
  tokensUsed: int("tokensUsed").default(0),
  tokensLimit: int("tokensLimit").notNull(),
  sessionsCreated: int("sessionsCreated").default(0),
  sessionsLimit: int("sessionsLimit").notNull(),
  costAccrued: decimal("costAccrued", { precision: 10, scale: 4 }).default("0"),
  costLimit: decimal("costLimit", { precision: 10, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UsageQuota = typeof usageQuotas.$inferSelect;
export type InsertUsageQuota = typeof usageQuotas.$inferInsert;

export const rateLimitEvents = mysqlTable("rate_limit_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  limitType: mysqlEnum("limitType", ["requests_per_minute", "requests_per_day", "tokens_per_request", "concurrent_sessions"]).notNull(),
  limitValue: int("limitValue").notNull(),
  currentValue: int("currentValue").notNull(),
  action: mysqlEnum("action", ["allowed", "throttled", "blocked"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RateLimitEvent = typeof rateLimitEvents.$inferSelect;
export type InsertRateLimitEvent = typeof rateLimitEvents.$inferInsert;

export const quotaAlerts = mysqlTable("quota_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  quotaType: mysqlEnum("quotaType", ["requests", "tokens", "cost", "sessions"]).notNull(),
  threshold: int("threshold").notNull(), // percentage (0-100)
  isTriggered: boolean("isTriggered").default(false),
  lastTriggeredAt: timestamp("lastTriggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type QuotaAlert = typeof quotaAlerts.$inferSelect;
export type InsertQuotaAlert = typeof quotaAlerts.$inferInsert;


// ============================================================================
// ANOMALY DETECTION & AI INSIGHTS
// ============================================================================

export const anomalyBaselines = mysqlTable("anomaly_baselines", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricType: mysqlEnum("metricType", ["session_duration", "tool_executions", "success_rate", "token_usage", "cost", "error_rate"]).notNull(),
  baselineValue: decimal("baselineValue", { precision: 10, scale: 4 }).notNull(),
  standardDeviation: decimal("standardDeviation", { precision: 10, scale: 4 }).notNull(),
  minValue: decimal("minValue", { precision: 10, scale: 4 }),
  maxValue: decimal("maxValue", { precision: 10, scale: 4 }),
  sampleSize: int("sampleSize").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AnomalyBaseline = typeof anomalyBaselines.$inferSelect;
export type InsertAnomalyBaseline = typeof anomalyBaselines.$inferInsert;

export const detectedAnomalies = mysqlTable("detected_anomalies", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => agentSessions.id, { onDelete: "cascade" }),
  anomalyType: mysqlEnum("anomalyType", ["performance_degradation", "unusual_tool_usage", "high_error_rate", "cost_spike", "token_spike", "success_rate_drop"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  metricName: varchar("metricName", { length: 255 }).notNull(),
  expectedValue: decimal("expectedValue", { precision: 10, scale: 4 }),
  actualValue: decimal("actualValue", { precision: 10, scale: 4 }).notNull(),
  deviationPercentage: decimal("deviationPercentage", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  aiInsight: text("aiInsight"), // LLM-generated insight
  recommendedAction: text("recommendedAction"),
  isResolved: boolean("isResolved").default(false),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DetectedAnomaly = typeof detectedAnomalies.$inferSelect;
export type InsertDetectedAnomaly = typeof detectedAnomalies.$inferInsert;

export const anomalyPatterns = mysqlTable("anomaly_patterns", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  patternName: varchar("patternName", { length: 255 }).notNull(),
  patternDescription: text("patternDescription"),
  anomalyTypes: json("anomalyTypes").$type<string[]>().notNull(),
  frequency: mysqlEnum("frequency", ["rare", "occasional", "common", "frequent"]).default("occasional"),
  lastOccurrence: timestamp("lastOccurrence"),
  occurrenceCount: int("occurrenceCount").default(0),
  correlatedMetrics: json("correlatedMetrics").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AnomalyPattern = typeof anomalyPatterns.$inferSelect;
export type InsertAnomalyPattern = typeof anomalyPatterns.$inferInsert;

export const anomalyInsights = mysqlTable("anomaly_insights", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  anomalyId: int("anomalyId").notNull().references(() => detectedAnomalies.id, { onDelete: "cascade" }),
  insightType: mysqlEnum("insightType", ["root_cause", "trend", "prediction", "recommendation", "correlation"]).notNull(),
  content: text("content").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("0"), // 0-100
  actionItems: json("actionItems").$type<string[]>(),
  generatedBy: varchar("generatedBy", { length: 64 }).default("llm"), // llm, statistical, ml
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AnomalyInsight = typeof anomalyInsights.$inferSelect;
export type InsertAnomalyInsight = typeof anomalyInsights.$inferInsert;

export const anomalyHistory = mysqlTable("anomaly_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  anomalyId: int("anomalyId").notNull().references(() => detectedAnomalies.id, { onDelete: "cascade" }),
  action: mysqlEnum("action", ["detected", "acknowledged", "resolved", "dismissed", "escalated"]).notNull(),
  notes: text("notes"),
  performedBy: int("performedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AnomalyHistory = typeof anomalyHistory.$inferSelect;
export type InsertAnomalyHistory = typeof anomalyHistory.$inferInsert;

export const anomalyRules = mysqlTable("anomaly_rules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  ruleDescription: text("ruleDescription"),
  condition: text("condition").notNull(), // JSON condition
  threshold: decimal("threshold", { precision: 10, scale: 4 }).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  isActive: boolean("isActive").default(true),
  notifyOnTrigger: boolean("notifyOnTrigger").default(true),
  autoResolve: boolean("autoResolve").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AnomalyRule = typeof anomalyRules.$inferSelect;
export type InsertAnomalyRule = typeof anomalyRules.$inferInsert;


// Predictive Anomaly Alerts
export const predictiveAlerts = mysqlTable("predictive_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  metricType: varchar("metricType", { length: 64 }).notNull(),
  predictedValue: decimal("predictedValue", { precision: 10, scale: 4 }).notNull(),
  confidenceScore: decimal("confidenceScore", { precision: 5, scale: 2 }).notNull(), // 0-100
  predictedAt: timestamp("predictedAt").notNull(),
  expectedOccurrenceTime: timestamp("expectedOccurrenceTime").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  proactiveActions: json("proactiveActions").$type<string[]>(),
  triggered: boolean("triggered").default(false),
  triggeredAt: timestamp("triggeredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PredictiveAlert = typeof predictiveAlerts.$inferSelect;
export type InsertPredictiveAlert = typeof predictiveAlerts.$inferInsert;

// Anomaly Suppression Rules
export const suppressionRules = mysqlTable("suppression_rules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  ruleDescription: text("ruleDescription"),
  anomalyType: varchar("anomalyType", { length: 64 }).notNull(),
  condition: text("condition").notNull(), // JSON condition
  suppressionDuration: int("suppressionDuration"), // in minutes, null = permanent
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  isActive: boolean("isActive").default(true),
  suppressionCount: int("suppressionCount").default(0),
  lastSuppressionAt: timestamp("lastSuppressionAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SuppressionRule = typeof suppressionRules.$inferSelect;
export type InsertSuppressionRule = typeof suppressionRules.$inferInsert;

// Anomaly Reports
export const anomalyReports = mysqlTable("anomaly_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  reportName: varchar("reportName", { length: 255 }).notNull(),
  reportType: mysqlEnum("reportType", ["daily", "weekly", "monthly", "custom"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  totalAnomalies: int("totalAnomalies").default(0),
  criticalCount: int("criticalCount").default(0),
  highCount: int("highCount").default(0),
  resolvedCount: int("resolvedCount").default(0),
  trendAnalysis: json("trendAnalysis").$type<Record<string, any>>(),
  impactAssessment: json("impactAssessment").$type<Record<string, any>>(),
  recommendations: json("recommendations").$type<string[]>(),
  reportContent: text("reportContent"),
  format: mysqlEnum("format", ["pdf", "csv", "json", "html"]).default("pdf"),
  emailDelivery: json("emailDelivery").$type<{ recipients: string[]; sent: boolean; sentAt?: string }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AnomalyReport = typeof anomalyReports.$inferSelect;
export type InsertAnomalyReport = typeof anomalyReports.$inferInsert;

// Agent Infrastructure - Agent Registry
export const agentRegistry = mysqlTable("agent_registry", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentName: varchar("agentName", { length: 255 }).notNull(),
  agentType: mysqlEnum("agentType", ["reasoning", "execution", "monitoring", "coordination", "custom"]).notNull(),
  description: text("description"),
  version: varchar("version", { length: 64 }).default("1.0.0"),
  status: mysqlEnum("status", ["active", "inactive", "maintenance", "deprecated"]).default("active"),
  capabilities: json("capabilities").$type<string[]>(),
  configuration: json("configuration").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentRegistry = typeof agentRegistry.$inferSelect;
export type InsertAgentRegistry = typeof agentRegistry.$inferInsert;

// Agent State & Memory
export const agentMemory = mysqlTable("agent_memory", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  memoryType: mysqlEnum("memoryType", ["short_term", "long_term", "episodic", "semantic"]).notNull(),
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(), // JSON serialized
  importance: int("importance").default(5), // 1-10 scale
  accessCount: int("accessCount").default(0),
  lastAccessedAt: timestamp("lastAccessedAt"),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentMemory = typeof agentMemory.$inferSelect;
export type InsertAgentMemory = typeof agentMemory.$inferInsert;

// Agent Tools & Integrations
export const agentTools = mysqlTable("agent_tools", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  toolName: varchar("toolName", { length: 255 }).notNull(),
  toolType: mysqlEnum("toolType", ["api", "database", "file_system", "computation", "external_service"]).notNull(),
  description: text("description"),
  endpoint: varchar("endpoint", { length: 512 }),
  authentication: json("authentication").$type<Record<string, any>>(),
  parameters: json("parameters").$type<Record<string, any>>(),
  rateLimit: int("rateLimit"), // requests per minute
  timeout: int("timeout").default(30000), // milliseconds
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentTool = typeof agentTools.$inferSelect;
export type InsertAgentTool = typeof agentTools.$inferInsert;

// Agent Execution Logs
export const agentExecutionLogs = mysqlTable("agent_execution_logs", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  executionType: mysqlEnum("executionType", ["task", "tool_call", "reasoning_step", "decision_point"]).notNull(),
  input: text("input"), // JSON
  output: text("output"), // JSON
  status: mysqlEnum("status", ["pending", "running", "success", "failed", "timeout"]).notNull(),
  errorMessage: text("errorMessage"),
  executionTime: int("executionTime"), // milliseconds
  resourcesUsed: json("resourcesUsed").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentExecutionLog = typeof agentExecutionLogs.$inferSelect;
export type InsertAgentExecutionLog = typeof agentExecutionLogs.$inferInsert;

// Agent Reasoning Chains
export const reasoningChains = mysqlTable("reasoning_chains", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  chainType: mysqlEnum("chainType", ["chain_of_thought", "tree_of_thought", "graph_of_thought"]).notNull(),
  steps: json("steps").$type<Array<{ step: number; thought: string; action: string; result: string }>>(),
  finalConclusion: text("finalConclusion"),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).default("0"), // 0-100
  tokensUsed: int("tokensUsed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ReasoningChain = typeof reasoningChains.$inferSelect;
export type InsertReasoningChain = typeof reasoningChains.$inferInsert;

// Agent Collaboration
export const agentCollaboration = mysqlTable("agent_collaboration", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  initiatorAgentId: int("initiatorAgentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  collaboratorAgentId: int("collaboratorAgentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  collaborationType: mysqlEnum("collaborationType", ["sequential", "parallel", "hierarchical", "peer"]).notNull(),
  message: text("message"),
  response: text("response"),
  status: mysqlEnum("status", ["pending", "acknowledged", "completed", "failed"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentCollaboration = typeof agentCollaboration.$inferSelect;
export type InsertAgentCollaboration = typeof agentCollaboration.$inferInsert;

// Agent Performance Metrics
export const agentPerformanceMetrics = mysqlTable("agent_performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  taskSuccessRate: decimal("taskSuccessRate", { precision: 5, scale: 2 }).default("0"), // 0-100
  averageExecutionTime: int("averageExecutionTime").default(0), // milliseconds
  totalTasksCompleted: int("totalTasksCompleted").default(0),
  totalTasksFailed: int("totalTasksFailed").default(0),
  averageTokensPerTask: int("averageTokensPerTask").default(0),
  costPerTask: decimal("costPerTask", { precision: 10, scale: 4 }).default("0"),
  uptime: decimal("uptime", { precision: 5, scale: 2 }).default("100"), // 0-100
  lastHealthCheck: timestamp("lastHealthCheck"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentPerformanceMetrics = typeof agentPerformanceMetrics.$inferSelect;
export type InsertAgentPerformanceMetrics = typeof agentPerformanceMetrics.$inferInsert;


// Agent Marketplace
export const agentMarketplace = mysqlTable("agent_marketplace", {
  id: int("id").autoincrement().primaryKey(),
  agentName: varchar("agentName", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  tags: json("tags").$type<string[]>(),
  version: varchar("version", { length: 50 }).default("1.0.0"),
  author: varchar("author", { length: 255 }).notNull(),
  authorId: int("authorId").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentType: mysqlEnum("agentType", ["reasoning", "execution", "monitoring", "coordination", "custom"]).notNull(),
  capabilities: json("capabilities").$type<string[]>(),
  configuration: json("configuration").$type<Record<string, any>>(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  downloads: int("downloads").default(0),
  isPublished: boolean("isPublished").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentMarketplace = typeof agentMarketplace.$inferSelect;
export type InsertAgentMarketplace = typeof agentMarketplace.$inferInsert;

// Agent Reviews
export const agentReviews = mysqlTable("agent_reviews", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentMarketplace.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: int("rating").notNull(), // 1-5
  review: text("review"),
  helpful: int("helpful").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentReview = typeof agentReviews.$inferSelect;
export type InsertAgentReview = typeof agentReviews.$inferInsert;

// Agent Installations
export const agentInstallations = mysqlTable("agent_installations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  marketplaceAgentId: int("marketplaceAgentId").notNull().references(() => agentMarketplace.id, { onDelete: "cascade" }),
  localAgentId: int("localAgentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 50 }).notNull(),
  status: mysqlEnum("status", ["installed", "updating", "deprecated", "uninstalled"]).default("installed"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentInstallation = typeof agentInstallations.$inferSelect;
export type InsertAgentInstallation = typeof agentInstallations.$inferInsert;

// Multi-Agent Orchestration
export const orchestrationTasks = mysqlTable("orchestration_tasks", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  taskName: varchar("taskName", { length: 255 }).notNull(),
  description: text("description"),
  orchestrationType: mysqlEnum("orchestrationType", ["sequential", "parallel", "hierarchical", "swarm"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "paused"]).default("pending"),
  priority: int("priority").default(5), // 1-10
  assignedAgents: json("assignedAgents").$type<number[]>(),
  result: json("result").$type<Record<string, any>>(),
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrchestrationTask = typeof orchestrationTasks.$inferSelect;
export type InsertOrchestrationTask = typeof orchestrationTasks.$inferInsert;

// Agent Swarm Coordination
export const swarmCoordination = mysqlTable("swarm_coordination", {
  id: int("id").autoincrement().primaryKey(),
  orchestrationTaskId: int("orchestrationTaskId").notNull().references(() => orchestrationTasks.id, { onDelete: "cascade" }),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["leader", "worker", "monitor", "coordinator"]).notNull(),
  status: mysqlEnum("status", ["idle", "working", "waiting", "completed", "failed"]).default("idle"),
  taskAssignment: json("taskAssignment").$type<Record<string, any>>(),
  result: json("result").$type<Record<string, any>>(),
  startTime: timestamp("startTime"),
  endTime: timestamp("endTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SwarmCoordination = typeof swarmCoordination.$inferSelect;
export type InsertSwarmCoordination = typeof swarmCoordination.$inferInsert;

// Orchestration Results Aggregation
export const orchestrationResults = mysqlTable("orchestration_results", {
  id: int("id").autoincrement().primaryKey(),
  orchestrationTaskId: int("orchestrationTaskId").notNull().references(() => orchestrationTasks.id, { onDelete: "cascade" }),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  resultData: json("resultData").$type<Record<string, any>>(),
  executionTime: int("executionTime"), // milliseconds
  tokensUsed: int("tokensUsed").default(0),
  cost: decimal("cost", { precision: 10, scale: 4 }).default("0.0000"),
  status: mysqlEnum("status", ["success", "partial", "failed"]).notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type OrchestrationResult = typeof orchestrationResults.$inferSelect;
export type InsertOrchestrationResult = typeof orchestrationResults.$inferInsert;

// Orchestration Conflict Resolution
export const conflictResolution = mysqlTable("conflict_resolution", {
  id: int("id").autoincrement().primaryKey(),
  orchestrationTaskId: int("orchestrationTaskId").notNull().references(() => orchestrationTasks.id, { onDelete: "cascade" }),
  agentId1: int("agentId1").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  agentId2: int("agentId2").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  conflictType: varchar("conflictType", { length: 100 }).notNull(),
  resolution: mysqlEnum("resolution", ["agent1_priority", "agent2_priority", "merge", "retry", "escalate"]).notNull(),
  details: json("details").$type<Record<string, any>>(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ConflictResolution = typeof conflictResolution.$inferSelect;
export type InsertConflictResolution = typeof conflictResolution.$inferInsert;


// Agent Versioning
export const agentVersions = mysqlTable("agent_versions", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  version: varchar("version", { length: 50 }).notNull(),
  versionTag: varchar("versionTag", { length: 100 }),
  snapshot: json("snapshot").$type<Record<string, any>>(),
  configuration: json("configuration").$type<Record<string, any>>(),
  changes: json("changes").$type<string[]>(),
  createdBy: int("createdBy").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  isStable: boolean("isStable").default(false),
});
export type AgentVersion = typeof agentVersions.$inferSelect;
export type InsertAgentVersion = typeof agentVersions.$inferInsert;

// Agent Rollback History
export const agentRollbacks = mysqlTable("agent_rollbacks", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  fromVersion: varchar("fromVersion", { length: 50 }).notNull(),
  toVersion: varchar("toVersion", { length: 50 }).notNull(),
  reason: text("reason"),
  performedBy: int("performedBy").notNull().references(() => users.id),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentRollback = typeof agentRollbacks.$inferSelect;
export type InsertAgentRollback = typeof agentRollbacks.$inferInsert;

// Agent Performance Profiles
export const agentProfiles = mysqlTable("agent_profiles", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  executionTime: int("executionTime"), // milliseconds
  memoryUsage: int("memoryUsage"), // MB
  cpuUsage: decimal("cpuUsage", { precision: 5, scale: 2 }), // percentage
  tokensUsed: int("tokensUsed").default(0),
  cost: decimal("cost", { precision: 10, scale: 4 }),
  successRate: decimal("successRate", { precision: 5, scale: 2 }), // percentage
  errorCount: int("errorCount").default(0),
  totalExecutions: int("totalExecutions").default(1),
  bottlenecks: json("bottlenecks").$type<string[]>(),
  recommendations: json("recommendations").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentProfile = typeof agentProfiles.$inferSelect;
export type InsertAgentProfile = typeof agentProfiles.$inferInsert;

// Agent Certification
export const agentCertifications = mysqlTable("agent_certifications", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  certificationLevel: mysqlEnum("certificationLevel", ["bronze", "silver", "gold", "platinum"]).notNull(),
  securityScore: decimal("securityScore", { precision: 5, scale: 2 }).default("0.00"),
  performanceScore: decimal("performanceScore", { precision: 5, scale: 2 }).default("0.00"),
  reliabilityScore: decimal("reliabilityScore", { precision: 5, scale: 2 }).default("0.00"),
  trustScore: decimal("trustScore", { precision: 5, scale: 2 }).default("0.00"),
  certifiedAt: timestamp("certifiedAt"),
  expiresAt: timestamp("expiresAt"),
  status: mysqlEnum("status", ["pending", "certified", "suspended", "revoked"]).default("pending"),
  auditNotes: text("auditNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type AgentCertification = typeof agentCertifications.$inferSelect;
export type InsertAgentCertification = typeof agentCertifications.$inferInsert;

// Certification Audit Log
export const certificationAudits = mysqlTable("certification_audits", {
  id: int("id").autoincrement().primaryKey(),
  certificationId: int("certificationId").notNull().references(() => agentCertifications.id, { onDelete: "cascade" }),
  auditType: varchar("auditType", { length: 100 }).notNull(),
  findings: json("findings").$type<Record<string, any>>(),
  issues: json("issues").$type<string[]>(),
  recommendations: json("recommendations").$type<string[]>(),
  auditorId: int("auditorId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CertificationAudit = typeof certificationAudits.$inferSelect;
export type InsertCertificationAudit = typeof certificationAudits.$inferInsert;

// Security Scan Results
export const securityScans = mysqlTable("security_scans", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  scanType: varchar("scanType", { length: 100 }).notNull(),
  vulnerabilities: json("vulnerabilities").$type<Array<{ severity: string; description: string }>>(),
  riskScore: decimal("riskScore", { precision: 5, scale: 2 }),
  status: mysqlEnum("status", ["passed", "warning", "failed"]).notNull(),
  scanDate: timestamp("scanDate").defaultNow().notNull(),
  remediationDeadline: timestamp("remediationDeadline"),
});
export type SecurityScan = typeof securityScans.$inferSelect;
export type InsertSecurityScan = typeof securityScans.$inferInsert;

// Performance Benchmarks
export const performanceBenchmarks = mysqlTable("performance_benchmarks", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agentRegistry.id, { onDelete: "cascade" }),
  benchmarkName: varchar("benchmarkName", { length: 255 }).notNull(),
  testCases: json("testCases").$type<number>().default(0),
  passedTests: json("passedTests").$type<number>().default(0),
  failedTests: json("failedTests").$type<number>().default(0),
  averageResponseTime: int("averageResponseTime"),
  p95ResponseTime: int("p95ResponseTime"),
  p99ResponseTime: int("p99ResponseTime"),
  throughput: decimal("throughput", { precision: 10, scale: 2 }),
  benchmarkDate: timestamp("benchmarkDate").defaultNow().notNull(),
});
export type PerformanceBenchmark = typeof performanceBenchmarks.$inferSelect;
export type InsertPerformanceBenchmark = typeof performanceBenchmarks.$inferInsert;


// Admin Dashboard
export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 255 }).notNull(),
  targetType: varchar("targetType", { length: 100 }),
  targetId: int("targetId"),
  changes: json("changes").$type<Record<string, any>>(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;



// Cost Optimization
export const costAnalysis = mysqlTable("cost_analysis", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  analysisDate: timestamp("analysisDate").defaultNow().notNull(),
  totalCost: decimal("totalCost", { precision: 12, scale: 2 }),
  projectedCost: decimal("projectedCost", { precision: 12, scale: 2 }),
  savingsOpportunity: decimal("savingsOpportunity", { precision: 12, scale: 2 }),
  savingsPercentage: decimal("savingsPercentage", { precision: 5, scale: 2 }),
  recommendations: json("recommendations").$type<Array<{ action: string; savings: number }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CostAnalysis = typeof costAnalysis.$inferSelect;
export type InsertCostAnalysis = typeof costAnalysis.$inferInsert;

export const costOptimizations = mysqlTable("cost_optimizations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  optimizationType: varchar("optimizationType", { length: 100 }).notNull(),
  description: text("description"),
  estimatedSavings: decimal("estimatedSavings", { precision: 12, scale: 2 }),
  status: mysqlEnum("status", ["recommended", "applied", "completed", "rejected"]).default("recommended"),
  appliedAt: timestamp("appliedAt"),
  actualSavings: decimal("actualSavings", { precision: 12, scale: 2 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CostOptimization = typeof costOptimizations.$inferSelect;
export type InsertCostOptimization = typeof costOptimizations.$inferInsert;

// Integration Marketplace
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  integrationName: varchar("integrationName", { length: 255 }).notNull(),
  integrationKey: varchar("integrationKey", { length: 100 }).unique().notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 255 }),
  documentation: text("documentation"),
  status: mysqlEnum("status", ["active", "beta", "deprecated"]).default("active"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

export const userIntegrations = mysqlTable("user_integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  integrationId: int("integrationId").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  apiKey: varchar("apiKey", { length: 500 }),
  configuration: json("configuration").$type<Record<string, any>>(),
  webhookUrl: varchar("webhookUrl", { length: 500 }),
  isActive: boolean("isActive").default(true),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserIntegration = typeof userIntegrations.$inferSelect;
export type InsertUserIntegration = typeof userIntegrations.$inferInsert;

export const webhookEvents = mysqlTable("webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  userIntegrationId: int("userIntegrationId").notNull().references(() => userIntegrations.id, { onDelete: "cascade" }),
  eventType: varchar("eventType", { length: 100 }).notNull(),
  payload: json("payload").$type<Record<string, any>>(),
  status: mysqlEnum("status", ["pending", "delivered", "failed"]).default("pending"),
  retryCount: int("retryCount").default(0),
  lastError: text("lastError"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;




// Monitoring & Alerting
export const alertRules = mysqlTable("alert_rules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  ruleName: varchar("ruleName", { length: 255 }).notNull(),
  metricName: varchar("metricName", { length: 255 }).notNull(),
  threshold: decimal("threshold", { precision: 15, scale: 4 }),
  operator: mysqlEnum("operator", ["gt", "lt", "eq", "gte", "lte"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium"),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;

export const alerts = mysqlTable("alerts", {
  id: int("id").autoincrement().primaryKey(),
  alertRuleId: int("alertRuleId").notNull().references(() => alertRules.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["triggered", "acknowledged", "resolved"]).default("triggered"),
  value: decimal("value", { precision: 15, scale: 4 }),
  message: text("message"),
  acknowledgedAt: timestamp("acknowledgedAt"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = typeof alerts.$inferInsert;

// Multi-Tenancy
export const workspaces = mysqlTable("workspaces", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  workspaceName: varchar("workspaceName", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  plan: mysqlEnum("plan", ["free", "starter", "professional", "enterprise"]).default("free"),
  maxUsers: int("maxUsers").default(5),
  maxAgents: int("maxAgents").default(10),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = typeof workspaces.$inferInsert;

export const workspaceMembers = mysqlTable("workspace_members", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["owner", "admin", "member", "viewer"]).default("member"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type InsertWorkspaceMember = typeof workspaceMembers.$inferInsert;

// API Rate Limiting
export const rateLimitRules = mysqlTable("rate_limit_rules", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requestsPerMinute: int("requestsPerMinute").notNull(),
  requestsPerHour: int("requestsPerHour").notNull(),
  requestsPerDay: int("requestsPerDay").notNull(),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RateLimitRule = typeof rateLimitRules.$inferSelect;
export type InsertRateLimitRule = typeof rateLimitRules.$inferInsert;

export const rateLimitUsage = mysqlTable("rate_limit_usage", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  requestCount: int("requestCount").default(0),
  resetAt: timestamp("resetAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RateLimitUsage = typeof rateLimitUsage.$inferSelect;
export type InsertRateLimitUsage = typeof rateLimitUsage.$inferInsert;


// Saved Templates for Marketplace
export const savedTemplates = mysqlTable("saved_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  systemPrompt: text("systemPrompt"),
  temperature: int("temperature"),
  model: varchar("model", { length: 64 }),
  tags: text("tags"), // JSON array
  isPublic: boolean("isPublic").default(false),
  downloads: int("downloads").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type SavedTemplate = typeof savedTemplates.$inferSelect;
export type InsertSavedTemplate = typeof savedTemplates.$inferInsert;

// Analytics History for Persistence
export const analyticsHistory = mysqlTable("analytics_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  sessionId: int("sessionId").references(() => agentSessions.id, { onDelete: "cascade" }),
  tokensUsed: int("tokensUsed"),
  costUSD: decimal("costUSD", { precision: 10, scale: 4 }),
  modelUsed: varchar("modelUsed", { length: 64 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
export type AnalyticsRecord = typeof analyticsHistory.$inferSelect;
export type InsertAnalyticsRecord = typeof analyticsHistory.$inferInsert;

// User Collaborations for Real-Time Features
export const userCollaborations = mysqlTable("user_collaborations", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["viewer", "editor", "owner"]).default("viewer"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  lastActiveAt: timestamp("lastActiveAt").defaultNow().notNull(),
});
export type UserCollaboration = typeof userCollaborations.$inferSelect;
export type InsertUserCollaboration = typeof userCollaborations.$inferInsert;

// Premium Features & Stripe Integration
export const premiumFeatures = mysqlTable("premium_features", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  subscriptionId: varchar("subscriptionId", { length: 255 }),
  tier: mysqlEnum("tier", ["free", "pro", "enterprise"]).default("free"),
  tokensPerMonth: int("tokensPerMonth").default(100000),
  tokensUsedThisMonth: int("tokensUsedThisMonth").default(0),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PremiumFeature = typeof premiumFeatures.$inferSelect;
export type InsertPremiumFeature = typeof premiumFeatures.$inferInsert;

// Stripe Events Log
export const stripeEvents = mysqlTable("stripe_events", {
  id: int("id").autoincrement().primaryKey(),
  eventId: varchar("eventId", { length: 255 }).notNull().unique(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  userId: int("userId").references(() => users.id, { onDelete: "cascade" }),
  data: json("data"),
  processed: boolean("processed").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type StripeEvent = typeof stripeEvents.$inferSelect;
export type InsertStripeEvent = typeof stripeEvents.$inferInsert;

// Agents (for agent management and renaming)
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  systemPrompt: text("systemPrompt"),
  model: varchar("model", { length: 64 }).default("gpt-4-turbo"),
  temperature: int("temperature").default(70),
  isPublic: boolean("isPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Usage Quotas

// Collaboration Invites
export const collaborationInvites = mysqlTable("collaboration_invites", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  invitedBy: int("invitedBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  inviteCode: varchar("inviteCode", { length: 64 }).notNull().unique(),
  invitedEmail: varchar("invitedEmail", { length: 320 }),
  permission: mysqlEnum("permission", ["view", "edit", "admin"]).default("view"),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "expired"]).default("pending"),
  expiresAt: timestamp("expiresAt"),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CollaborationInvite = typeof collaborationInvites.$inferSelect;
export type InsertCollaborationInvite = typeof collaborationInvites.$inferInsert;

// Session Collaborators
export const sessionCollaborators = mysqlTable("session_collaborators", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  permission: mysqlEnum("permission", ["view", "edit", "admin"]).default("view"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type SessionCollaborator = typeof sessionCollaborators.$inferSelect;
export type InsertSessionCollaborator = typeof sessionCollaborators.$inferInsert;

// Cloned Sessions (track original and cloned relationship)
export const clonedSessions = mysqlTable("cloned_sessions", {
  id: int("id").autoincrement().primaryKey(),
  originalSessionId: int("originalSessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  clonedSessionId: int("clonedSessionId").notNull().references(() => agentSessions.id, { onDelete: "cascade" }),
  clonedBy: int("clonedBy").notNull().references(() => users.id, { onDelete: "cascade" }),
  clonedAt: timestamp("clonedAt").defaultNow().notNull(),
});

export type ClonedSession = typeof clonedSessions.$inferSelect;
export type InsertClonedSession = typeof clonedSessions.$inferInsert;


// ============================================================================
// QUMUS PLATFORM TABLES
// ============================================================================

// Rockin' Rockin' Boogie Content
export const rockinBoogieContent = mysqlTable("rockin_boogie_content", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["radio", "podcast", "audiobook"]).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "scheduled", "archived"]).default("active"),
  listeners: int("listeners").default(0),
  duration: varchar("duration", { length: 64 }), // e.g., "45 min", "8h 32m"
  schedule: varchar("schedule", { length: 255 }), // e.g., "Daily 6AM-10AM"
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0"),
  contentUrl: varchar("contentUrl", { length: 2048 }), // S3 URL or streaming URL
  thumbnailUrl: varchar("thumbnailUrl", { length: 2048 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RockinBoogieContent = typeof rockinBoogieContent.$inferSelect;
export type InsertRockinBoogieContent = typeof rockinBoogieContent.$inferInsert;

// Radio Stations (Canryn Production Infrastructure)
export const radioStations = mysqlTable("radio_stations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Rockin' Rockin' Boogie"
  operatorName: varchar("operatorName", { length: 255 }), // Canryn Production
  description: text("description"),
  status: mysqlEnum("status", ["active", "inactive", "maintenance"]).default("active"),
  totalListeners: int("totalListeners").default(0),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RadioStation = typeof radioStations.$inferSelect;
export type InsertRadioStation = typeof radioStations.$inferInsert;

// Radio Channels (Individual channels within radio stations)
export const radioChannels = mysqlTable("radio_channels", {
  id: int("id").autoincrement().primaryKey(),
  stationId: int("stationId").notNull().references(() => radioStations.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Morning Drive", "Tech Talk"
  frequency: varchar("frequency", { length: 64 }), // e.g., "101.5 FM"
  genre: varchar("genre", { length: 128 }), // e.g., "Music", "News", "Talk"
  status: mysqlEnum("status", ["active", "scheduled", "offline"]).default("active"),
  currentListeners: int("currentListeners").default(0),
  totalListeners: int("totalListeners").default(0),
  streamUrl: varchar("streamUrl", { length: 2048 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RadioChannel = typeof radioChannels.$inferSelect;
export type InsertRadioChannel = typeof radioChannels.$inferInsert;

// Emergency Alerts
export const emergencyAlerts = mysqlTable("emergency_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "medium", "low"]).notNull(),
  broadcastChannelIds: text("broadcastChannelIds"), // JSON array of radio channel IDs to broadcast through
  status: mysqlEnum("status", ["draft", "scheduled", "active", "completed"]).default("draft"),
  recipients: int("recipients").default(0),
  deliveryRate: decimal("deliveryRate", { precision: 5, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  scheduledFor: timestamp("scheduledFor"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = typeof emergencyAlerts.$inferInsert;

// HybridCast Broadcast Nodes
export const hybridCastNodes = mysqlTable("hybridcast_nodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  region: varchar("region", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["ready", "broadcasting", "offline"]).default("ready"),
  coverage: decimal("coverage", { precision: 5, scale: 2 }).default("0"),
  lastHealthCheck: timestamp("lastHealthCheck"),
  endpoint: varchar("endpoint", { length: 2048 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HybridCastNode = typeof hybridCastNodes.$inferSelect;
export type InsertHybridCastNode = typeof hybridCastNodes.$inferInsert;

// Analytics Metrics
export const analyticsMetrics = mysqlTable("analytics_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  period: varchar("period", { length: 64 }).notNull(), // e.g., "Mon", "Tue", "2026-02-03"
  qumusDecisions: int("qumusDecisions").default(0),
  hybridCastBroadcasts: int("hybridCastBroadcasts").default(0),
  rockinBoogieListeners: int("rockinBoogieListeners").default(0),
  avgEngagement: decimal("avgEngagement", { precision: 5, scale: 2 }).default("0"),
  systemUptime: decimal("systemUptime", { precision: 5, scale: 2 }).default("100"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnalyticsMetric = typeof analyticsMetrics.$inferSelect;
export type InsertAnalyticsMetric = typeof analyticsMetrics.$inferInsert;

// Policy Decisions
export const policyDecisions = mysqlTable("policy_decisions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  policy: varchar("policy", { length: 255 }).notNull(), // e.g., "Content Policy", "Security Policy"
  count: int("count").default(0),
  avgTime: int("avgTime").default(0), // milliseconds
  successRate: decimal("successRate", { precision: 5, scale: 2 }).default("0"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PolicyDecision = typeof policyDecisions.$inferSelect;
export type InsertPolicyDecision = typeof policyDecisions.$inferInsert;

// Content Listener History (for tracking engagement over time)
export const contentListenerHistory = mysqlTable("content_listener_history", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull().references(() => rockinBoogieContent.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  listenerCount: int("listenerCount").notNull(),
  engagementScore: decimal("engagementScore", { precision: 5, scale: 2 }).default("0"),
});

export type ContentListenerHistory = typeof contentListenerHistory.$inferSelect;
export type InsertContentListenerHistory = typeof contentListenerHistory.$inferInsert;

// Alert Broadcast Log (tracking HybridCast alerts broadcast through radio channels)
export const alertBroadcastLog = mysqlTable("alert_broadcast_log", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull().references(() => emergencyAlerts.id, { onDelete: "cascade" }),
  channelId: int("channelId").notNull().references(() => radioChannels.id),
  status: mysqlEnum("status", ["pending", "broadcasting", "delivered", "failed"]).default("pending"),
  listenersReached: int("listenersReached").default(0),
  interruptedRegularContent: boolean("interruptedRegularContent").default(false),
  error: text("error"),
  broadcastStartedAt: timestamp("broadcastStartedAt"),
  broadcastEndedAt: timestamp("broadcastEndedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertBroadcastLog = typeof alertBroadcastLog.$inferSelect;
export type InsertAlertBroadcastLog = typeof alertBroadcastLog.$inferInsert;

// Legacy Alert Delivery Log (kept for backward compatibility)
export const alertDeliveryLog = mysqlTable("alert_delivery_log", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull().references(() => emergencyAlerts.id, { onDelete: "cascade" }),
  nodeId: int("nodeId").references(() => hybridCastNodes.id),
  region: varchar("region", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "delivered", "failed"]).default("pending"),
  recipientsReached: int("recipientsReached").default(0),
  error: text("error"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertDeliveryLog = typeof alertDeliveryLog.$inferSelect;
export type InsertAlertDeliveryLog = typeof alertDeliveryLog.$inferInsert;


// Sweet Miracles Donations
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending"),
  donorTier: mysqlEnum("donorTier", ["bronze", "silver", "gold", "platinum"]).default("bronze"),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeInvoiceId: varchar("stripeInvoiceId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  campaignId: varchar("campaignId", { length: 255 }),
  message: text("message"),
  isRecurring: boolean("isRecurring").default(false),
  recurringFrequency: mysqlEnum("recurringFrequency", ["monthly", "quarterly", "annual"]),
  nextRecurringDate: timestamp("nextRecurringDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

// Add stripeCustomerId to users table
export const usersWithStripe = mysqlTable("users_stripe_mapping", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStripeMapping = typeof usersWithStripe.$inferSelect;
export type InsertUserStripeMapping = typeof usersWithStripe.$inferInsert;



// Platform Metrics History (for trend analysis)
export const platformMetricsHistory = mysqlTable("platform_metrics_history", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["sweetMiracles", "rockinBoogie", "hybridCast"]).notNull(),
  metric: varchar("metric", { length: 255 }).notNull(), // e.g., "donations", "listeners", "coverage"
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 64 }), // e.g., "USD", "count", "percent"
  metadata: text("metadata"), // JSON for additional context
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlatformMetricsHistory = typeof platformMetricsHistory.$inferSelect;
export type InsertPlatformMetricsHistory = typeof platformMetricsHistory.$inferInsert;

// Real-time Metrics Cache
export const realtimeMetricsCache = mysqlTable("realtime_metrics_cache", {
  id: int("id").autoincrement().primaryKey(),
  platform: mysqlEnum("platform", ["sweetMiracles", "rockinBoogie", "hybridCast"]).notNull(),
  metric: varchar("metric", { length: 255 }).notNull(),
  currentValue: decimal("currentValue", { precision: 15, scale: 2 }).notNull(),
  previousValue: decimal("previousValue", { precision: 15, scale: 2 }),
  changePercent: decimal("changePercent", { precision: 5, scale: 2 }),
  unit: varchar("unit", { length: 64 }),
  trend: mysqlEnum("trend", ["up", "down", "stable"]).default("stable"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RealtimeMetricsCache = typeof realtimeMetricsCache.$inferSelect;
export type InsertRealtimeMetricsCache = typeof realtimeMetricsCache.$inferInsert;


// ============================================================================
// WEBHOOK NOTIFICATIONS TABLES
// ============================================================================

export const webhookSubscriptions = mysqlTable("webhook_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: mysqlEnum("provider", ["slack", "discord", "email", "webhook", "pagerduty"]).notNull(),
  webhookUrl: varchar("webhookUrl", { length: 2048 }).notNull(),
  eventTypes: text("eventTypes").notNull(), // JSON array
  enabled: boolean("enabled").default(true),
  retryPolicy: text("retryPolicy"), // JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WebhookSubscription = typeof webhookSubscriptions.$inferSelect;
export type InsertWebhookSubscription = typeof webhookSubscriptions.$inferInsert;


// ============================================================================
// DASHBOARD CUSTOMIZATION TABLES
// ============================================================================

export const dashboardConfigurations = mysqlTable("dashboard_configurations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  dashboardType: varchar("dashboardType", { length: 64 }).notNull(), // admin, compliance, user, analyst
  layout: text("layout").notNull(), // JSON layout configuration
  theme: varchar("theme", { length: 64 }).default("light"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardConfiguration = typeof dashboardConfigurations.$inferSelect;
export type InsertDashboardConfiguration = typeof dashboardConfigurations.$inferInsert;

export const dashboardWidgets = mysqlTable("dashboard_widgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  dashboardType: varchar("dashboardType", { length: 64 }).notNull(),
  widgetType: varchar("widgetType", { length: 255 }).notNull(),
  position: text("position").notNull(), // JSON {x, y}
  size: text("size").notNull(), // JSON {width, height}
  config: text("config"), // JSON widget-specific config
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DashboardWidget = typeof dashboardWidgets.$inferSelect;
export type InsertDashboardWidget = typeof dashboardWidgets.$inferInsert;

export const decisionFeedback = mysqlTable("decision_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  decisionId: varchar("decisionId", { length: 255 }).notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: text("comment"),
  actionTaken: boolean("actionTaken").default(false),
  outcome: text("outcome"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DecisionFeedback = typeof decisionFeedback.$inferSelect;
export type InsertDecisionFeedback = typeof decisionFeedback.$inferInsert;

export const policyPerformanceMetrics = mysqlTable("policy_performance_metrics", {
  id: int("id").autoincrement().primaryKey(),
  policyName: varchar("policyName", { length: 255 }).notNull().unique(),
  totalDecisions: int("totalDecisions").default(0),
  acceptedDecisions: int("acceptedDecisions").default(0),
  rejectedDecisions: int("rejectedDecisions").default(0),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).default("0.00"),
  precision: decimal("precision", { precision: 5, scale: 2 }).default("0.00"),
  recall: decimal("recall", { precision: 5, scale: 2 }).default("0.00"),
  f1Score: decimal("f1Score", { precision: 5, scale: 2 }).default("0.00"),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
});

export type PolicyPerformanceMetrics = typeof policyPerformanceMetrics.$inferSelect;
export type InsertPolicyPerformanceMetrics = typeof policyPerformanceMetrics.$inferInsert;

export const rateLimitingTiers = mysqlTable("rate_limiting_tiers", {
  id: int("id").autoincrement().primaryKey(),
  tierName: varchar("tierName", { length: 64 }).notNull().unique(), // free, pro, enterprise
  requestsPerMinute: int("requestsPerMinute").notNull(),
  requestsPerMonth: int("requestsPerMonth").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  features: text("features"), // JSON array of features
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RateLimitingTier = typeof rateLimitingTiers.$inferSelect;
export type InsertRateLimitingTier = typeof rateLimitingTiers.$inferInsert;

