import { mysqlTable, varchar, int, text, timestamp, mysqlEnum, json, decimal, boolean, primaryKey } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Multi-Operator Broadcasting Platform Schema
 * Enables independent operators/companies to manage channels with identical capabilities
 */

// ============================================================================
// Operator Management Tables
// ============================================================================

export const operators = mysqlTable("operators", {
  id: int().autoincrement().primaryKey().notNull(),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: varchar({ length: 255 }).notNull(),
  operatorName: varchar({ length: 255 }).notNull(),
  description: text(),
  logo: varchar({ length: 512 }), // S3 URL
  website: varchar({ length: 512 }),
  email: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  status: mysqlEnum(["active", "inactive", "suspended", "pending_verification"]).default("active"),
  verificationStatus: mysqlEnum(["unverified", "verified", "rejected"]).default("unverified"),
  tier: mysqlEnum(["free", "pro", "enterprise"]).default("free"),
  maxChannels: int().default(5),
  maxConcurrentBroadcasts: int().default(1),
  maxStorageGB: int().default(100),
  features: json(), // Array of enabled features
  metadata: json(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export type Operator = typeof operators.$inferSelect;
export type InsertOperator = typeof operators.$inferInsert;

export const operatorMembers = mysqlTable("operator_members", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  userId: int().notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum(["admin", "broadcaster", "moderator", "viewer"]).notNull(),
  permissions: json(), // Custom permissions per role
  joinedAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  invitedBy: int().references(() => users.id, { onDelete: "set null" }),
  invitedAt: timestamp({ mode: "string" }),
  status: mysqlEnum(["active", "inactive", "suspended"]).default("active"),
}, (table) => ({
  operatorUserUnique: primaryKey({ columns: [table.operatorId, table.userId] }),
}));

export type OperatorMember = typeof operatorMembers.$inferSelect;
export type InsertOperatorMember = typeof operatorMembers.$inferInsert;

export const operatorSettings = mysqlTable("operator_settings", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  settingKey: varchar({ length: 255 }).notNull(),
  settingValue: text(),
  category: varchar({ length: 64 }), // branding, streaming, monetization, etc.
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export type OperatorSetting = typeof operatorSettings.$inferSelect;
export type InsertOperatorSetting = typeof operatorSettings.$inferInsert;

export const operatorApiKeys = mysqlTable("operator_api_keys", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  keyName: varchar({ length: 255 }).notNull(),
  keyHash: varchar({ length: 512 }).notNull(), // Hashed for security
  lastUsedAt: timestamp({ mode: "string" }),
  expiresAt: timestamp({ mode: "string" }),
  status: mysqlEnum(["active", "revoked", "expired"]).default("active"),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export type OperatorApiKey = typeof operatorApiKeys.$inferSelect;
export type InsertOperatorApiKey = typeof operatorApiKeys.$inferInsert;

// ============================================================================
// Operator Channel Management
// ============================================================================

export const operatorChannels = mysqlTable("operator_channels", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  channelName: varchar({ length: 255 }).notNull(),
  slug: varchar({ length: 255 }).notNull(),
  description: text(),
  thumbnail: varchar({ length: 512 }), // S3 URL
  banner: varchar({ length: 512 }), // S3 URL
  category: varchar({ length: 128 }),
  status: mysqlEnum(["active", "inactive", "archived"]).default("active"),
  visibility: mysqlEnum(["public", "private", "unlisted"]).default("public"),
  totalSubscribers: int().default(0),
  totalViews: int().default(0),
  metadata: json(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export type OperatorChannel = typeof operatorChannels.$inferSelect;
export type InsertOperatorChannel = typeof operatorChannels.$inferInsert;

export const operatorBroadcasts = mysqlTable("operator_broadcasts", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  channelId: int().notNull().references(() => operatorChannels.id, { onDelete: "cascade" }),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  thumbnail: varchar({ length: 512 }), // S3 URL
  status: mysqlEnum(["scheduled", "live", "ended", "archived"]).default("scheduled"),
  broadcastType: mysqlEnum(["live", "premiere", "rerun", "vod"]).default("live"),
  startTime: timestamp({ mode: "string" }).notNull(),
  endTime: timestamp({ mode: "string" }),
  actualStartTime: timestamp({ mode: "string" }),
  actualEndTime: timestamp({ mode: "string" }),
  viewers: int().default(0),
  peakViewers: int().default(0),
  totalViews: int().default(0),
  duration: int(), // in seconds
  recordingUrl: varchar({ length: 512 }), // S3 URL for VOD
  metadata: json(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export type OperatorBroadcast = typeof operatorBroadcasts.$inferSelect;
export type InsertOperatorBroadcast = typeof operatorBroadcasts.$inferInsert;

// ============================================================================
// Multi-Platform Streaming Integration
// ============================================================================

export const operatorStreamingCredentials = mysqlTable("operator_streaming_credentials", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  platform: mysqlEnum(["youtube", "twitch", "facebook", "custom"]).notNull(),
  accountId: varchar({ length: 255 }).notNull(),
  streamKey: varchar({ length: 512 }).notNull(), // Encrypted
  rtmpUrl: varchar({ length: 512 }),
  status: mysqlEnum(["connected", "disconnected", "error"]).default("disconnected"),
  lastConnectedAt: timestamp({ mode: "string" }),
  errorMessage: text(),
  metadata: json(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export type OperatorStreamingCredential = typeof operatorStreamingCredentials.$inferSelect;
export type InsertOperatorStreamingCredential = typeof operatorStreamingCredentials.$inferInsert;

export const operatorStreamingStatus = mysqlTable("operator_streaming_status", {
  id: int().autoincrement().primaryKey().notNull(),
  broadcastId: int().notNull().references(() => operatorBroadcasts.id, { onDelete: "cascade" }),
  platform: mysqlEnum(["youtube", "twitch", "facebook", "custom"]).notNull(),
  status: mysqlEnum(["idle", "connecting", "streaming", "error", "ended"]).default("idle"),
  streamUrl: varchar({ length: 512 }),
  viewers: int().default(0),
  bitrate: int(), // kbps
  fps: int(),
  resolution: varchar({ length: 32 }), // 1080p, 720p, etc.
  errorMessage: text(),
  lastUpdatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export type OperatorStreamingStatus = typeof operatorStreamingStatus.$inferSelect;
export type InsertOperatorStreamingStatus = typeof operatorStreamingStatus.$inferInsert;

// ============================================================================
// Operator Analytics & Revenue
// ============================================================================

export const operatorAnalytics = mysqlTable("operator_analytics", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  broadcastId: int().references(() => operatorBroadcasts.id, { onDelete: "set null" }),
  date: timestamp({ mode: "string" }).notNull(),
  totalViewers: int().default(0),
  uniqueViewers: int().default(0),
  peakConcurrentViewers: int().default(0),
  averageWatchTime: int(), // in seconds
  engagementRate: decimal({ precision: 5, scale: 2 }).default("0"),
  chatMessages: int().default(0),
  likes: int().default(0),
  shares: int().default(0),
  metadata: json(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export type OperatorAnalytic = typeof operatorAnalytics.$inferSelect;
export type InsertOperatorAnalytic = typeof operatorAnalytics.$inferInsert;

export const operatorRevenue = mysqlTable("operator_revenue", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  revenueType: mysqlEnum(["subscriptions", "donations", "sponsorships", "ads", "merchandise"]).notNull(),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).default("USD"),
  broadcastId: int().references(() => operatorBroadcasts.id, { onDelete: "set null" }),
  transactionId: varchar({ length: 255 }),
  status: mysqlEnum(["pending", "completed", "failed", "refunded"]).default("pending"),
  metadata: json(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  processedAt: timestamp({ mode: "string" }),
});

export type OperatorRevenue = typeof operatorRevenue.$inferSelect;
export type InsertOperatorRevenue = typeof operatorRevenue.$inferInsert;

export const operatorPayouts = mysqlTable("operator_payouts", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  amount: decimal({ precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).default("USD"),
  periodStart: timestamp({ mode: "string" }).notNull(),
  periodEnd: timestamp({ mode: "string" }).notNull(),
  status: mysqlEnum(["pending", "processing", "completed", "failed"]).default("pending"),
  paymentMethod: varchar({ length: 64 }), // stripe, paypal, etc.
  transactionId: varchar({ length: 255 }),
  notes: text(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  processedAt: timestamp({ mode: "string" }),
});

export type OperatorPayout = typeof operatorPayouts.$inferSelect;
export type InsertOperatorPayout = typeof operatorPayouts.$inferInsert;

// ============================================================================
// Operator Audit & Compliance
// ============================================================================

export const operatorAuditLog = mysqlTable("operator_audit_log", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  userId: int().references(() => users.id, { onDelete: "set null" }),
  action: varchar({ length: 255 }).notNull(),
  resourceType: varchar({ length: 64 }),
  resourceId: varchar({ length: 255 }),
  changes: json(),
  ipAddress: varchar({ length: 45 }),
  userAgent: text(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export type OperatorAuditLog = typeof operatorAuditLog.$inferSelect;
export type InsertOperatorAuditLog = typeof operatorAuditLog.$inferInsert;

export const operatorCompliance = mysqlTable("operator_compliance", {
  id: int().autoincrement().primaryKey().notNull(),
  operatorId: int().notNull().references(() => operators.id, { onDelete: "cascade" }),
  complianceType: varchar({ length: 128 }).notNull(),
  status: mysqlEnum(["compliant", "warning", "violation"]).default("compliant"),
  details: text(),
  reviewedAt: timestamp({ mode: "string" }),
  reviewedBy: int().references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" }).defaultNow().onUpdateNow().notNull(),
});

export type OperatorCompliance = typeof operatorCompliance.$inferSelect;
export type InsertOperatorCompliance = typeof operatorCompliance.$inferInsert;
