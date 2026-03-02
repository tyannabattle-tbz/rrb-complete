import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

/**
 * Admin Dashboard Tables
 */
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

/**
 * Webhook Marketplace Tables
 */
export const webhookTemplates = mysqlTable("webhook_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(), // slack, discord, github, etc.
  icon: varchar("icon", { length: 255 }), // URL to icon
  webhookUrl: varchar("webhookUrl", { length: 2048 }).notNull(),
  events: text("events").notNull(), // JSON array
  configSchema: json("configSchema").$type<Record<string, any>>(), // JSON schema for config
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
  userId: int("userId").notNull(),
  templateId: int("templateId").notNull(),
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
  templateId: int("templateId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(), // 1-5
  review: text("review"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookMarketplaceReview = typeof webhookMarketplaceReviews.$inferSelect;
export type InsertWebhookMarketplaceReview = typeof webhookMarketplaceReviews.$inferInsert;

/**
 * Model Fine-Tuning Tables
 */
export const finetuningDatasets = mysqlTable("finetuning_datasets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  dataCount: int("dataCount").default(0),
  status: mysqlEnum("status", ["draft", "ready", "training", "completed", "failed"]).default("draft"),
  quality: mysqlEnum("quality", ["excellent", "good", "fair", "poor"]).default("good"),
  tags: text("tags"), // JSON array
  splitRatio: json("splitRatio").$type<{ train: number; validation: number; test: number }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinetuningDataset = typeof finetuningDatasets.$inferSelect;
export type InsertFinetuningDataset = typeof finetuningDatasets.$inferInsert;

export const finetuningJobs = mysqlTable("finetuning_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  datasetId: int("datasetId").notNull(),
  modelName: varchar("modelName", { length: 255 }).notNull(),
  baseModel: varchar("baseModel", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "training", "completed", "failed"]).default("pending"),
  progress: int("progress").default(0), // 0-100
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
  userId: int("userId").notNull(),
  jobId: int("jobId").notNull(),
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
  jobId: int("jobId").notNull(),
  modelId: int("modelId").notNull(),
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
  userId: int("userId").notNull(),
  baselineModelId: int("baselineModelId").notNull(),
  candidateModelId: int("candidateModelId").notNull(),
  testDataSize: int("testDataSize"),
  baselineMetrics: json("baselineMetrics").$type<Record<string, any>>().notNull(),
  candidateMetrics: json("candidateMetrics").$type<Record<string, any>>().notNull(),
  improvement: decimal("improvement", { precision: 5, scale: 2 }),
  recommendation: mysqlEnum("recommendation", ["use_baseline", "use_candidate", "inconclusive"]).default("inconclusive"),
  comparedAt: timestamp("comparedAt").defaultNow().notNull(),
});

export type ModelComparison = typeof modelComparisons.$inferSelect;
export type InsertModelComparison = typeof modelComparisons.$inferInsert;
