import { boolean, date, decimal, int, json, mysqlEnum, mysqlTable, text, time, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  currentTier: mysqlEnum("current_tier", ["free", "pro", "premium"]).default("free").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscription_status", ["active", "inactive", "cancelled", "past_due"]).default("inactive"),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Contact submissions table
export const contactSubmissions = mysqlTable("contact_submissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

// Testimonials table for approved visitor stories
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }),
  story: text("story").notNull(),
  isApproved: mysqlEnum("isApproved", ["pending", "approved", "rejected"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// Newsletter subscribers table
export const newsletterSubscribers = mysqlTable("newsletter_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  subscribed: boolean("subscribed").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type InsertNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;

// Featured testimonials table
export const featuredTestimonials = mysqlTable("featured_testimonials", {
  id: int("id").autoincrement().primaryKey(),
  testimonialId: int("testimonial_id").notNull(),
  featured: boolean("featured").default(false).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeaturedTestimonial = typeof featuredTestimonials.$inferSelect;
export type InsertFeaturedTestimonial = typeof featuredTestimonials.$inferInsert;

// Donation milestones table
export const donationMilestones = mysqlTable("donation_milestones", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetAmount: int("target_amount").notNull(),
  currentAmount: int("current_amount").default(0).notNull(),
  status: mysqlEnum("status", ["active", "completed", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DonationMilestone = typeof donationMilestones.$inferSelect;
export type InsertDonationMilestone = typeof donationMilestones.$inferInsert;

// Personal announcements table
export const personalAnnouncements = mysqlTable("personal_announcements", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  date: varchar("date", { length: 50 }).notNull(),
  excerpt: text("excerpt").notNull(),
  fullText: text("full_text").notNull(),
  category: varchar("category", { length: 100 }).default("Personal").notNull(),
  audioUrl: varchar("audio_url", { length: 500 }),
  duration: varchar("duration", { length: 20 }),
  isPublished: boolean("is_published").default(true).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PersonalAnnouncement = typeof personalAnnouncements.$inferSelect;
export type InsertPersonalAnnouncement = typeof personalAnnouncements.$inferInsert;


// Community forum posts table
export const forumPosts = mysqlTable("forum_posts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  likes: int("likes").default(0).notNull(),
  replies: int("replies").default(0).notNull(),
  isApproved: boolean("is_approved").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

// Community leaderboard (aggregated stats)
export const communityLeaderboard = mysqlTable("community_leaderboard", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  username: varchar("username", { length: 255 }).notNull(),
  postsCount: int("posts_count").default(0).notNull(),
  likesReceived: int("likes_received").default(0).notNull(),
  repliesCount: int("replies_count").default(0).notNull(),
  totalScore: int("total_score").default(0).notNull(),
  rank: int("rank").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityLeaderboardEntry = typeof communityLeaderboard.$inferSelect;
export type InsertCommunityLeaderboardEntry = typeof communityLeaderboard.$inferInsert;

// Video testimonials table
export const videoTestimonials = mysqlTable("video_testimonials", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  contributor: varchar("contributor", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // concert-memory, fan-story, family-connection, musical-impact
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
  description: text("description"),
  duration: varchar("duration", { length: 20 }), // e.g., "4:32"
  views: int("views").default(0).notNull(),
  likes: int("likes").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoTestimonial = typeof videoTestimonials.$inferSelect;
export type InsertVideoTestimonial = typeof videoTestimonials.$inferInsert;

// Newsletter emails tracking table
export const newsletterEmails = mysqlTable("newsletter_emails", {
  id: int("id").autoincrement().primaryKey(),
  subscriberId: int("subscriber_id").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  openedAt: timestamp("opened_at"),
  clickCount: int("click_count").default(0).notNull(),
  status: mysqlEnum("status", ["sent", "opened", "clicked", "bounced"]).default("sent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterEmail = typeof newsletterEmails.$inferSelect;
export type InsertNewsletterEmail = typeof newsletterEmails.$inferInsert;

// Newsletter templates table
export const newsletterTemplates = mysqlTable("newsletter_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  content: text("content").notNull(),
  type: mysqlEnum("type", ["welcome", "monthly", "announcement", "custom"]).default("custom").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsletterTemplate = typeof newsletterTemplates.$inferSelect;
export type InsertNewsletterTemplate = typeof newsletterTemplates.$inferInsert;


// Grants database table
export const grants = mysqlTable("grants", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  fundingType: mysqlEnum("funding_type", [
    "arts_music",
    "documentary",
    "heritage_cultural",
    "music_industry",
    "crowdfunding",
    "other"
  ]).notNull(),
  organization: varchar("organization", { length: 255 }).notNull(),
  description: text("description"),
  fundingAmount: int("funding_amount"),
  deadline: timestamp("deadline").notNull(),
  eligibilityCriteria: text("eligibility_criteria"),
  applicationUrl: varchar("application_url", { length: 500 }),
  apiSource: varchar("api_source", { length: 100 }),
  externalId: varchar("external_id", { length: 255 }),
  isEligible: boolean("is_eligible").default(false).notNull(),
  matchScore: int("match_score").default(0).notNull(),
  status: mysqlEnum("status", ["active", "archived", "closed"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Grant = typeof grants.$inferSelect;
export type InsertGrant = typeof grants.$inferInsert;

// Grant applications table
export const grantApplications = mysqlTable("grant_applications", {
  id: int("id").autoincrement().primaryKey(),
  grantId: int("grant_id").notNull(),
  status: mysqlEnum("status", [
    "draft",
    "pending_review",
    "approved",
    "submitted",
    "accepted",
    "rejected",
    "withdrawn"
  ]).default("draft").notNull(),
  applicationTitle: varchar("application_title", { length: 255 }).notNull(),
  projectDescription: text("project_description").notNull(),
  budget: int("budget"),
  timeline: text("timeline"),
  objectives: text("objectives"),
  draftContent: text("draft_content"),
  submittedAt: timestamp("submitted_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewerNotes: text("reviewer_notes"),
  resultDate: timestamp("result_date"),
  resultAmount: int("result_amount"),
  resultNotes: text("result_notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrantApplication = typeof grantApplications.$inferSelect;
export type InsertGrantApplication = typeof grantApplications.$inferInsert;

// Funding received tracking table
export const fundingReceived = mysqlTable("funding_received", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("application_id"),
  grantId: int("grant_id"),
  fundingSource: varchar("funding_source", { length: 255 }).notNull(),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  receivedDate: timestamp("received_date").notNull(),
  description: text("description"),
  documentUrl: varchar("document_url", { length: 500 }),
  category: mysqlEnum("category", [
    "grant",
    "donation",
    "sponsorship",
    "crowdfunding",
    "other"
  ]).notNull(),
  status: mysqlEnum("status", [
    "pending",
    "received",
    "processed",
    "allocated"
  ]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingReceived = typeof fundingReceived.$inferSelect;
export type InsertFundingReceived = typeof fundingReceived.$inferInsert;

// Grant templates for quick application generation
export const grantTemplates = mysqlTable("grant_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  fundingType: mysqlEnum("funding_type", [
    "arts_music",
    "documentary",
    "heritage_cultural",
    "music_industry",
    "crowdfunding",
    "other"
  ]).notNull(),
  description: text("description"),
  templateContent: text("template_content").notNull(),
  fields: text("fields").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GrantTemplate = typeof grantTemplates.$inferSelect;
export type InsertGrantTemplate = typeof grantTemplates.$inferInsert;

// Application drafts and versions
export const applicationDrafts = mysqlTable("application_drafts", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("application_id").notNull(),
  version: int("version").default(1).notNull(),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  generatedBy: varchar("generated_by", { length: 100 }).default("system").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationDraft = typeof applicationDrafts.$inferSelect;
export type InsertApplicationDraft = typeof applicationDrafts.$inferInsert;

// Funding goals and tracking
export const fundingGoals = mysqlTable("funding_goals", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetAmount: int("target_amount").notNull(),
  currentAmount: int("current_amount").default(0).notNull(),
  deadline: timestamp("deadline"),
  purpose: varchar("purpose", { length: 255 }),
  status: mysqlEnum("status", ["active", "completed", "paused", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FundingGoal = typeof fundingGoals.$inferSelect;
export type InsertFundingGoal = typeof fundingGoals.$inferInsert;


// Notifications table for all notification types
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id"),
  type: mysqlEnum("type", ["toast", "modal", "banner", "center", "email", "sms", "push", "in_app"]).notNull(),
  channel: mysqlEnum("channel", ["ui", "email", "sms", "push"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }).default("info"),
  actionUrl: varchar("action_url", { length: 500 }),
  actionLabel: varchar("action_label", { length: 100 }),
  isRead: boolean("is_read").default(false).notNull(),
  isDismissed: boolean("is_dismissed").default(false).notNull(),
  expiresAt: timestamp("expires_at"),
  priority: mysqlEnum("priority", ["low", "normal", "high", "critical"]).default("normal").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Notification preferences per user
export const notificationPreferences = mysqlTable("notification_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  smsNotifications: boolean("sms_notifications").default(false).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  inAppNotifications: boolean("in_app_notifications").default(true).notNull(),
  grantDeadlineAlerts: boolean("grant_deadline_alerts").default(true).notNull(),
  fundingMilestoneAlerts: boolean("funding_milestone_alerts").default(true).notNull(),
  campaignUpdates: boolean("campaign_updates").default(true).notNull(),
  merchandiseUpdates: boolean("merchandise_updates").default(false).notNull(),
  weeklyDigest: boolean("weekly_digest").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

// Notification templates for reusable notification messages
export const notificationTemplates = mysqlTable("notification_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["grant_deadline", "funding_milestone", "campaign_update", "merchandise", "system", "custom"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  messageTemplate: text("message_template").notNull(),
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 50 }).default("info"),
  actionUrl: varchar("action_url", { length: 500 }),
  actionLabel: varchar("action_label", { length: 100 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;

// Notification delivery logs for tracking
export const notificationLogs = mysqlTable("notification_logs", {
  id: int("id").autoincrement().primaryKey(),
  notificationId: int("notification_id").notNull(),
  userId: int("user_id"),
  channel: mysqlEnum("channel", ["ui", "email", "sms", "push"]).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "delivered", "failed", "bounced"]).default("pending").notNull(),
  recipient: varchar("recipient", { length: 255 }),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NotificationLog = typeof notificationLogs.$inferSelect;
export type InsertNotificationLog = typeof notificationLogs.$inferInsert;


// Song requests table for Radio Station feature
export const songRequests = mysqlTable("song_requests", {
  id: int("id").autoincrement().primaryKey(),
  songTitle: varchar("song_title", { length: 255 }).notNull(),
  artistName: varchar("artist_name", { length: 255 }),
  requesterName: varchar("requester_name", { length: 255 }).notNull(),
  requesterEmail: varchar("requester_email", { length: 320 }),
  message: text("message"),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "played", "rejected"]).default("pending").notNull(),
  playedAt: timestamp("played_at"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SongRequest = typeof songRequests.$inferSelect;
export type InsertSongRequest = typeof songRequests.$inferInsert;


// ============================================================================
// EMERGENCY COMMUNICATION SYSTEM (Sweet Miracles)
// ============================================================================

// Emergency contacts registry
export const emergencyContacts = mysqlTable("emergency_contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  relationship: varchar("relationship", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  organization: varchar("organization", { length: 255 }),
  isPrimary: boolean("is_primary").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmergencyContact = typeof emergencyContacts.$inferSelect;
export type InsertEmergencyContact = typeof emergencyContacts.$inferInsert;

// Emergency messages (text & voice)
export const emergencyMessages = mysqlTable("emergency_messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("sender_id").notNull(),
  recipientId: int("recipient_id"),
  messageType: mysqlEnum("message_type", ["text", "voice", "alert"]).notNull(),
  content: text("content"),
  voiceUrl: varchar("voice_url", { length: 500 }),
  voiceDuration: int("voice_duration"),
  isEncrypted: boolean("is_encrypted").default(true).notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  priority: mysqlEnum("priority", ["normal", "urgent", "critical"]).default("normal").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

export type EmergencyMessage = typeof emergencyMessages.$inferSelect;
export type InsertEmergencyMessage = typeof emergencyMessages.$inferInsert;

// Emergency alerts & broadcasts
export const emergencyAlerts = mysqlTable("emergency_alerts", {
  id: int("id").autoincrement().primaryKey(),
  initiatorId: int("initiator_id").notNull(),
  alertType: mysqlEnum("alert_type", ["medical", "safety", "missing_person", "weather", "evacuation", "other"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("high").notNull(),
  location: varchar("location", { length: 255 }),
  recipientGroups: varchar("recipient_groups", { length: 500 }),
  status: mysqlEnum("status", ["active", "resolved", "archived"]).default("active").notNull(),
  resolvedAt: timestamp("resolved_at"),
  resolvedNotes: text("resolved_notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmergencyAlert = typeof emergencyAlerts.$inferSelect;
export type InsertEmergencyAlert = typeof emergencyAlerts.$inferInsert;

// Emergency preferences per user
export const emergencyPreferences = mysqlTable("emergency_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  displayName: varchar("display_name", { length: 255 }),
  organization: mysqlEnum("organization", ["family", "sweet_miracles", "both"]).default("both").notNull(),
  textNotifications: boolean("text_notifications").default(true).notNull(),
  voiceNotifications: boolean("voice_notifications").default(true).notNull(),
  pushNotifications: boolean("push_notifications").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  allowBroadcasts: boolean("allow_broadcasts").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmergencyPreference = typeof emergencyPreferences.$inferSelect;
export type InsertEmergencyPreference = typeof emergencyPreferences.$inferInsert;


// Emergency message templates
export const messageTemplates = mysqlTable("message_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["medical", "location", "urgent_meeting", "check_in", "custom"]).default("custom").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;

// Emergency broadcasts
export const emergencyBroadcasts = mysqlTable("emergency_broadcasts", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("sender_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  priority: mysqlEnum("priority", ["normal", "urgent", "critical"]).default("normal").notNull(),
  recipientGroups: varchar("recipient_groups", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["draft", "sent", "archived"]).default("draft").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmergencyBroadcast = typeof emergencyBroadcasts.$inferSelect;
export type InsertEmergencyBroadcast = typeof emergencyBroadcasts.$inferInsert;

// Broadcast read receipts
export const broadcastReadReceipts = mysqlTable("broadcast_read_receipts", {
  id: int("id").autoincrement().primaryKey(),
  broadcastId: int("broadcast_id").notNull(),
  recipientId: int("recipient_id").notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BroadcastReadReceipt = typeof broadcastReadReceipts.$inferSelect;
export type InsertBroadcastReadReceipt = typeof broadcastReadReceipts.$inferInsert;


// Emergency contact groups
export const contactGroups = mysqlTable("contact_groups", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 7 }).default("#3b82f6").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactGroup = typeof contactGroups.$inferSelect;
export type InsertContactGroup = typeof contactGroups.$inferInsert;

// Group members junction table
export const groupMembers = mysqlTable("group_members", {
  id: int("id").autoincrement().primaryKey(),
  groupId: int("group_id").notNull(),
  contactId: int("contact_id").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = typeof groupMembers.$inferInsert;

// Broadcast security settings
export const broadcastSecuritySettings = mysqlTable("broadcast_security_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  requirePinForCritical: boolean("require_pin_for_critical").default(false).notNull(),
  pinHash: varchar("pin_hash", { length: 255 }),
  requireBiometric: boolean("require_biometric").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BroadcastSecuritySetting = typeof broadcastSecuritySettings.$inferSelect;
export type InsertBroadcastSecuritySetting = typeof broadcastSecuritySettings.$inferInsert;

// Emergency alert rules
export const alertRules = mysqlTable("alert_rules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["location_based", "time_based", "inactivity"]).notNull(),
  triggerCondition: text("trigger_condition").notNull(),
  recipients: varchar("recipients", { length: 500 }).notNull(),
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = typeof alertRules.$inferInsert;

// Alert history
export const alertHistory = mysqlTable("alert_history", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: int("rule_id").notNull(),
  triggeredAt: timestamp("triggered_at").defaultNow().notNull(),
  status: mysqlEnum("status", ["sent", "pending", "failed"]).default("sent").notNull(),
  recipientsNotified: int("recipients_notified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AlertHistoryRecord = typeof alertHistory.$inferSelect;
export type InsertAlertHistoryRecord = typeof alertHistory.$inferInsert;


// Encryption keys
export const encryptionKeys = mysqlTable("encryption_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  publicKey: text("public_key").notNull(),
  privateKeyHash: varchar("private_key_hash", { length: 255 }).notNull(),
  keyVersion: int("key_version").default(1).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  rotatedAt: timestamp("rotatedAt"),
});

export type EncryptionKey = typeof encryptionKeys.$inferSelect;
export type InsertEncryptionKey = typeof encryptionKeys.$inferInsert;

// Device sessions for multi-device sync
export const deviceSessions = mysqlTable("device_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  deviceName: varchar("device_name", { length: 255 }).notNull(),
  deviceType: mysqlEnum("device_type", ["mobile", "tablet", "desktop"]).notNull(),
  lastSyncAt: timestamp("last_sync_at").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DeviceSession = typeof deviceSessions.$inferSelect;
export type InsertDeviceSession = typeof deviceSessions.$inferInsert;

// Sync metadata
export const syncMetadata = mysqlTable("sync_metadata", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  deviceId: varchar("device_id", { length: 255 }).notNull(),
  entityType: mysqlEnum("entity_type", ["preferences", "contacts", "alerts", "messages"]).notNull(),
  lastSyncTimestamp: varchar("last_sync_timestamp", { length: 255 }).notNull(),
  syncStatus: mysqlEnum("sync_status", ["synced", "pending", "failed"]).default("synced").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SyncMetadata = typeof syncMetadata.$inferSelect;
export type InsertSyncMetadata = typeof syncMetadata.$inferInsert;

// Message delivery and response tracking
export const messageDeliveryStatus = mysqlTable("message_delivery_status", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull(),
  recipientId: int("recipient_id").notNull(),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  respondedAt: timestamp("responded_at"),
  responseTime: int("response_time"),
  status: mysqlEnum("status", ["pending", "delivered", "read", "responded"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageDeliveryStatus = typeof messageDeliveryStatus.$inferSelect;
export type InsertMessageDeliveryStatus = typeof messageDeliveryStatus.$inferInsert;

// Response analytics
export const responseAnalytics = mysqlTable("response_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  totalMessagesSent: int("total_messages_sent").default(0).notNull(),
  totalMessagesDelivered: int("total_messages_delivered").default(0).notNull(),
  totalMessagesRead: int("total_messages_read").default(0).notNull(),
  averageResponseTime: int("average_response_time").default(0),
  fastestResponseTime: int("fastest_response_time").default(0),
  slowestResponseTime: int("slowest_response_time").default(0),
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
});

export type ResponseAnalytic = typeof responseAnalytics.$inferSelect;
export type InsertResponseAnalytic = typeof responseAnalytics.$inferInsert;

export const relations = {
  // Emergency messaging relations
  emergencyContacts: {
    user: {
      fields: [emergencyContacts.userId],
      references: [users.id],
    },
  },
  encryptionKeys: {
    user: {
      fields: [encryptionKeys.userId],
      references: [users.id],
    },
  },
  deviceSessions: {
    user: {
      fields: [deviceSessions.userId],
      references: [users.id],
    },
  },
};


// Push notification subscriptions
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  endpoint: text("endpoint").notNull(),
  auth: varchar("auth", { length: 255 }).notNull(),
  p256dh: varchar("p256dh", { length: 255 }).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

// Emergency backup codes
export const backupCodes = mysqlTable("backup_codes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  code: varchar("code", { length: 255 }).notNull(),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
});

export type BackupCode = typeof backupCodes.$inferSelect;
export type InsertBackupCode = typeof backupCodes.$inferInsert;

// SOS alerts
export const sosAlerts = mysqlTable("sos_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  status: mysqlEnum("status", ["active", "resolved", "cancelled"]).default("active").notNull(),
  broadcastedTo: int("broadcasted_to").default(0).notNull(),
  respondedBy: int("responded_by").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export type SOSAlert = typeof sosAlerts.$inferSelect;
export type InsertSOSAlert = typeof sosAlerts.$inferInsert;


// Video calls
export const videoCalls = mysqlTable("video_calls", {
  id: int("id").autoincrement().primaryKey(),
  initiatorId: int("initiator_id").notNull(),
  callType: mysqlEnum("call_type", ["one-on-one", "group"]).notNull(),
  status: mysqlEnum("status", ["pending", "active", "ended"]).default("pending").notNull(),
  recordingUrl: text("recording_url"),
  recordingDuration: int("recording_duration"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoCall = typeof videoCalls.$inferSelect;
export type InsertVideoCall = typeof videoCalls.$inferInsert;

// Call participants
export const callParticipants = mysqlTable("call_participants", {
  id: int("id").autoincrement().primaryKey(),
  callId: int("call_id").notNull(),
  userId: int("user_id").notNull(),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CallParticipant = typeof callParticipants.$inferSelect;
export type InsertCallParticipant = typeof callParticipants.$inferInsert;

// Medical profiles
export const medicalProfiles = mysqlTable("medical_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  bloodType: varchar("blood_type", { length: 10 }),
  allergies: text("allergies"),
  medications: text("medications"),
  medicalConditions: text("medical_conditions"),
  emergencyProcedures: text("emergency_procedures"),
  doctorName: varchar("doctor_name", { length: 255 }),
  doctorPhone: varchar("doctor_phone", { length: 20 }),
  hospitalPreference: varchar("hospital_preference", { length: 255 }),
  insuranceProvider: varchar("insurance_provider", { length: 255 }),
  insurancePolicyNumber: varchar("insurance_policy_number", { length: 255 }),
  isPublic: boolean("is_public").default(false).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MedicalProfile = typeof medicalProfiles.$inferSelect;
export type InsertMedicalProfile = typeof medicalProfiles.$inferInsert;

// Incident reports
export const incidentReports = mysqlTable("incident_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  incidentType: varchar("incident_type", { length: 100 }),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  contactsNotified: int("contacts_notified").default(0).notNull(),
  contactsResponded: int("contacts_responded").default(0).notNull(),
  mediaUrls: text("media_urls"),
  status: mysqlEnum("status", ["open", "resolved", "archived"]).default("open").notNull(),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IncidentReport = typeof incidentReports.$inferSelect;
export type InsertIncidentReport = typeof incidentReports.$inferInsert;

// Regular messaging conversations
export const conversations = mysqlTable("conversations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }),
  type: mysqlEnum("type", ["one-on-one", "group"]).notNull(),
  createdBy: int("created_by").notNull(),
  lastMessageAt: timestamp("last_message_at"),
  isArchived: boolean("is_archived").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = typeof conversations.$inferInsert;

// Conversation members
export const conversationMembers = mysqlTable("conversation_members", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversation_id").notNull(),
  userId: int("user_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  lastReadAt: timestamp("last_read_at"),
  isMuted: boolean("is_muted").default(false).notNull(),
});

export type ConversationMember = typeof conversationMembers.$inferSelect;
export type InsertConversationMember = typeof conversationMembers.$inferInsert;

// Regular messages
export const regularMessages = mysqlTable("regular_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversation_id").notNull(),
  senderId: int("sender_id").notNull(),
  content: text("content").notNull(),
  isEdited: boolean("is_edited").default(false).notNull(),
  editedAt: timestamp("edited_at"),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RegularMessage = typeof regularMessages.$inferSelect;
export type InsertRegularMessage = typeof regularMessages.$inferInsert;

// Message attachments
export const messageAttachments = mysqlTable("message_attachments", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull(),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  fileSize: int("file_size"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type InsertMessageAttachment = typeof messageAttachments.$inferInsert;

// Message read receipts
export const messageReadReceipts = mysqlTable("message_read_receipts", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("message_id").notNull(),
  userId: int("user_id").notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

export type MessageReadReceipt = typeof messageReadReceipts.$inferSelect;
export type InsertMessageReadReceipt = typeof messageReadReceipts.$inferInsert;

// Typing indicators (temporary, not persisted long-term)
export const typingIndicators = mysqlTable("typing_indicators", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversation_id").notNull(),
  userId: int("user_id").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TypingIndicator = typeof typingIndicators.$inferSelect;
export type InsertTypingIndicator = typeof typingIndicators.$inferInsert;


// ============================================================================
// EMERGENCY SPEED-DIAL SYSTEM
// ============================================================================

// Speed-dial contacts (quick-access emergency contacts)
export const speedDialContacts = mysqlTable("speed_dial_contacts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  contactId: int("contact_id").notNull(),
  position: int("position").notNull(), // 1-5 for quick access order
  label: varchar("label", { length: 100 }), // Custom label like "Mom", "911", etc.
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SpeedDialContact = typeof speedDialContacts.$inferSelect;
export type InsertSpeedDialContact = typeof speedDialContacts.$inferInsert;

// ============================================================================
// EMERGENCY DRILL SCHEDULER
// ============================================================================

// Emergency drill schedules
export const emergencyDrills = mysqlTable("emergency_drills", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  frequency: mysqlEnum("frequency", ["weekly", "biweekly", "monthly", "quarterly", "once"]).default("monthly").notNull(),
  dayOfWeek: int("day_of_week"), // 0-6 for weekly, null for monthly
  dayOfMonth: int("day_of_month"), // 1-31 for monthly, null for weekly
  timeOfDay: varchar("time_of_day", { length: 5 }), // HH:MM format
  recipientGroups: varchar("recipient_groups", { length: 500 }), // JSON array of group IDs
  testMessage: text("test_message").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  nextRunAt: timestamp("next_run_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmergencyDrill = typeof emergencyDrills.$inferSelect;
export type InsertEmergencyDrill = typeof emergencyDrills.$inferInsert;

// Drill execution history
export const drillExecutions = mysqlTable("drill_executions", {
  id: int("id").autoincrement().primaryKey(),
  drillId: int("drill_id").notNull(),
  executedAt: timestamp("executed_at").defaultNow().notNull(),
  status: mysqlEnum("status", ["success", "partial", "failed"]).default("success").notNull(),
  recipientsSent: int("recipients_sent").default(0).notNull(),
  recipientsResponded: int("recipients_responded").default(0).notNull(),
  averageResponseTime: int("average_response_time"), // in seconds
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DrillExecution = typeof drillExecutions.$inferSelect;
export type InsertDrillExecution = typeof drillExecutions.$inferInsert;

// Drill response tracking
export const drillResponses = mysqlTable("drill_responses", {
  id: int("id").autoincrement().primaryKey(),
  drillExecutionId: int("drill_execution_id").notNull(),
  recipientId: int("recipient_id").notNull(),
  respondedAt: timestamp("responded_at"),
  responseTime: int("response_time"), // in seconds
  confirmed: boolean("confirmed").default(false).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DrillResponse = typeof drillResponses.$inferSelect;
export type InsertDrillResponse = typeof drillResponses.$inferInsert;

// ============================================================================
// EMERGENCY RESPONSE DASHBOARD
// ============================================================================

// Emergency response metrics
export const emergencyMetrics = mysqlTable("emergency_metrics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique(),
  totalAlertsTriggered: int("total_alerts_triggered").default(0).notNull(),
  totalAlertsResolved: int("total_alerts_resolved").default(0).notNull(),
  averageResolutionTime: int("average_resolution_time"), // in minutes
  totalContactsNotified: int("total_contacts_notified").default(0).notNull(),
  averageResponseRate: int("average_response_rate").default(0).notNull(), // percentage
  lastAlertAt: timestamp("last_alert_at"),
  lastResolvedAt: timestamp("last_resolved_at"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmergencyMetric = typeof emergencyMetrics.$inferSelect;
export type InsertEmergencyMetric = typeof emergencyMetrics.$inferInsert;

// Active emergency incidents
export const activeIncidents = mysqlTable("active_incidents", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alert_id").notNull(),
  userId: int("user_id").notNull(),
  status: mysqlEnum("status", ["active", "acknowledged", "in_progress", "resolved"]).default("active").notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("high").notNull(),
  location: varchar("location", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  contactsNotified: int("contacts_notified").default(0).notNull(),
  contactsResponded: int("contacts_responded").default(0).notNull(),
  estimatedResolutionTime: int("estimated_resolution_time"), // in minutes
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export type ActiveIncident = typeof activeIncidents.$inferSelect;
export type InsertActiveIncident = typeof activeIncidents.$inferInsert;

// Incident response timeline
export const incidentTimeline = mysqlTable("incident_timeline", {
  id: int("id").autoincrement().primaryKey(),
  incidentId: int("incident_id").notNull(),
  eventType: mysqlEnum("event_type", ["created", "acknowledged", "contact_notified", "contact_responded", "status_updated", "resolved"]).notNull(),
  actorId: int("actor_id"),
  description: text("description"),
  metadata: text("metadata"), // JSON for additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type IncidentTimelineEvent = typeof incidentTimeline.$inferSelect;
export type InsertIncidentTimelineEvent = typeof incidentTimeline.$inferInsert;


// Carousel images table for storing S3 image references
export const carouselImages = mysqlTable("carousel_images", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  s3Key: varchar("s3_key", { length: 512 }).notNull().unique(),
  imageUrl: text("image_url").notNull(),
  fileSize: int("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type", { length: 50 }).notNull(),
  order: int("order").notNull(),
  uploadedBy: int("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CarouselImage = typeof carouselImages.$inferSelect;
export type InsertCarouselImage = typeof carouselImages.$inferInsert;



// Audiobook and Literary Works Tables
export const audiobooks = mysqlTable("audiobooks", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  description: text("description"),
  coverImage: varchar("cover_image", { length: 500 }),
  publicationDate: timestamp("publication_date"),
  narrator: varchar("narrator", { length: 255 }),
  duration: int("duration"), // in seconds
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Audiobook = typeof audiobooks.$inferSelect;
export type InsertAudiobook = typeof audiobooks.$inferInsert;

export const audiobookChapters = mysqlTable("audiobook_chapters", {
  id: int("id").autoincrement().primaryKey(),
  audiobookId: int("audiobook_id").notNull().references(() => audiobooks.id, { onDelete: "cascade" }),
  chapterNumber: int("chapter_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: varchar("audio_url", { length: 500 }).notNull(),
  duration: int("duration").notNull(), // in seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AudiobookChapter = typeof audiobookChapters.$inferSelect;
export type InsertAudiobookChapter = typeof audiobookChapters.$inferInsert;

export const audiobookIntroClips = mysqlTable("audiobook_intro_clips", {
  id: int("id").autoincrement().primaryKey(),
  audiobookId: int("audiobook_id").notNull().references(() => audiobooks.id, { onDelete: "cascade" }),
  clipUrl: varchar("clip_url", { length: 500 }).notNull(),
  duration: int("duration").notNull(), // in seconds
  narrator: varchar("narrator", { length: 255 }),
  description: text("description"),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AudiobookIntroClip = typeof audiobookIntroClips.$inferSelect;
export type InsertAudiobookIntroClip = typeof audiobookIntroClips.$inferInsert;

export const literaryWorks = mysqlTable("literary_works", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }).notNull(),
  type: varchar("type", { length: 100 }).notNull(), // book, essay, article, poem, etc
  description: text("description"),
  coverImage: varchar("cover_image", { length: 500 }),
  publicationDate: timestamp("publication_date"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  content: text("content"), // for full text storage or reference
  externalUrl: varchar("external_url", { length: 500 }), // link to external source
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LiteraryWork = typeof literaryWorks.$inferSelect;
export type InsertLiteraryWork = typeof literaryWorks.$inferInsert;

export const bookLibrary = mysqlTable("book_library", {
  id: int("id").autoincrement().primaryKey(),
  literaryWorkId: int("literary_work_id").notNull().references(() => literaryWorks.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 100 }).notNull(), // fiction, non-fiction, poetry, essays, etc
  tags: text("tags"), // comma-separated tags
  featured: boolean("featured").default(false).notNull(),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BookLibraryEntry = typeof bookLibrary.$inferSelect;
export type InsertBookLibraryEntry = typeof bookLibrary.$inferInsert;

export const audiobookProgress = mysqlTable("audiobook_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  audiobookId: int("audiobook_id").notNull().references(() => audiobooks.id, { onDelete: "cascade" }),
  currentChapter: int("current_chapter").default(1).notNull(),
  currentPosition: int("current_position").default(0).notNull(), // in seconds
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedAt: timestamp("completed_at"),
  lastListenedAt: timestamp("last_listened_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AudiobookProgress = typeof audiobookProgress.$inferSelect;
export type InsertAudiobookProgress = typeof audiobookProgress.$inferInsert;

export const bookmarkings = mysqlTable("bookmarkings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  audiobookId: int("audiobook_id").notNull().references(() => audiobooks.id, { onDelete: "cascade" }),
  chapterId: int("chapter_id").notNull().references(() => audiobookChapters.id, { onDelete: "cascade" }),
  timestamp: int("timestamp").notNull(), // in seconds
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Bookmarking = typeof bookmarkings.$inferSelect;
export type InsertBookmarking = typeof bookmarkings.$inferInsert;


// User subscriptions history table
export const userSubscriptions = mysqlTable("user_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tier: mysqlEnum("tier", ["free", "pro", "premium"]).notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  status: mysqlEnum("status", ["active", "cancelled", "expired", "failed"]).default("active").notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"),
  renewalDate: timestamp("renewal_date"),
  amount: int("amount"), // in cents
  currency: varchar("currency", { length: 3 }).default("USD"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

// Pricing tiers configuration table
export const pricingTiers = mysqlTable("pricing_tiers", {
  id: int("id").autoincrement().primaryKey(),
  tier: mysqlEnum("tier", ["free", "pro", "premium"]).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // in cents
  billingCycle: mysqlEnum("billing_cycle", ["monthly", "yearly"]).default("monthly"),
  stripePriceId: varchar("stripe_price_id", { length: 255 }),
  features: text("features"), // JSON array of features
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PricingTier = typeof pricingTiers.$inferSelect;
export type InsertPricingTier = typeof pricingTiers.$inferInsert;

// Radio SOS Messages table - stores messages triggered by SOS events to be broadcast on radio
export const radioMessages = mysqlTable("radio_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  messageType: mysqlEnum("message_type", ["sos", "alert", "announcement", "emergency"]).default("sos").notNull(),
  priority: mysqlEnum("priority", ["low", "normal", "high", "critical"]).default("high").notNull(),
  location: varchar("location", { length: 500 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  stoppedAt: timestamp("stopped_at"),
  duration: int("duration"), // in seconds, null means indefinite
  repeatInterval: int("repeat_interval"), // in seconds, null means no repeat
  audioUrl: varchar("audio_url", { length: 500 }), // optional audio file for the message
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RadioMessage = typeof radioMessages.$inferSelect;
export type InsertRadioMessage = typeof radioMessages.$inferInsert;

// Radio Message History table - tracks when messages were displayed/broadcast
export const radioMessageHistory = mysqlTable("radio_message_history", {
  id: int("id").autoincrement().primaryKey(),
  radioMessageId: int("radio_message_id").notNull().references(() => radioMessages.id, { onDelete: "cascade" }),
  displayedAt: timestamp("displayed_at").defaultNow().notNull(),
  displayDuration: int("display_duration"), // in seconds
  viewCount: int("view_count").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RadioMessageHistory = typeof radioMessageHistory.$inferSelect;
export type InsertRadioMessageHistory = typeof radioMessageHistory.$inferInsert;



// Emergency Check-in History table - tracks when user sends "I'm Okay" status
export const emergencyCheckIns = mysqlTable("emergency_check_ins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["ok", "emergency"]).default("ok").notNull(),
  message: text("message"), // Optional message from user
  contactsNotified: int("contacts_notified").default(0).notNull(), // Number of contacts notified
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmergencyCheckIn = typeof emergencyCheckIns.$inferSelect;
export type InsertEmergencyCheckIn = typeof emergencyCheckIns.$inferInsert;


// ============================================================================
// PHASE 2: PAYMENT SYSTEMS & SUBSCRIPTIONS
// ============================================================================

// Checkout Sessions table - tracks Stripe checkout sessions
export const checkoutSessions = mysqlTable("checkout_sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSessionId: varchar("stripe_session_id", { length: 255 }).notNull().unique(),
  serviceType: mysqlEnum("service_type", ["legacy", "safety", "production"]).notNull(),
  pricingTier: mysqlEnum("pricing_tier", ["starter", "professional", "enterprise"]).notNull(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "expired"]).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  completedAt: timestamp("completed_at"),
});

export type CheckoutSession = typeof checkoutSessions.$inferSelect;
export type InsertCheckoutSession = typeof checkoutSessions.$inferInsert;

// Subscriptions table - tracks active subscriptions for each service
export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  serviceType: mysqlEnum("service_type", ["legacy", "safety", "production"]).notNull(),
  pricingTier: mysqlEnum("pricing_tier", ["starter", "professional", "enterprise"]).notNull(),
  status: mysqlEnum("status", ["active", "past_due", "canceled", "unpaid", "incomplete"]).notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Invoices table - tracks all invoices for subscriptions
export const invoices = mysqlTable("invoices", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: varchar("subscription_id", { length: 255 }).references(() => subscriptions.id, { onDelete: "set null" }),
  stripeInvoiceId: varchar("stripe_invoice_id", { length: 255 }).notNull().unique(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  status: mysqlEnum("status", ["draft", "open", "paid", "void", "uncollectible"]).notNull(),
  paidAt: timestamp("paid_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Analytics Events table - tracks user actions for analytics
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").references(() => users.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  serviceType: varchar("service_type", { length: 50 }),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// Service Usage table - tracks usage metrics for each subscription
export const serviceUsage = mysqlTable("service_usage", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: varchar("subscription_id", { length: 255 }).notNull().references(() => subscriptions.id, { onDelete: "cascade" }),
  serviceType: mysqlEnum("service_type", ["legacy", "safety", "production"]).notNull(),
  
  // Legacy Preservation metrics
  itemsUploaded: int("items_uploaded").default(0).notNull(),
  itemsProcessed: int("items_processed").default(0).notNull(),
  itemsVerified: int("items_verified").default(0).notNull(),
  storageUsedGB: int("storage_used_gb").default(0).notNull(),
  
  // Emergency Safety metrics
  emergencyContactsAdded: int("emergency_contacts_added").default(0).notNull(),
  checkInsPerformed: int("check_ins_performed").default(0).notNull(),
  alertsSent: int("alerts_sent").default(0).notNull(),
  alertsSuccessful: int("alerts_successful").default(0).notNull(),
  
  // Documentary Production metrics
  projectsCreated: int("projects_created").default(0).notNull(),
  hoursFilmed: int("hours_filmed").default(0).notNull(),
  filesUploaded: int("files_uploaded").default(0).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ServiceUsage = typeof serviceUsage.$inferSelect;
export type InsertServiceUsage = typeof serviceUsage.$inferInsert;


// ============================================================================
// PHASE 2: PLAYLIST MANAGEMENT, RECOMMENDATIONS & TRANSCRIPT SEARCH
// ============================================================================

// Playlists table - user-created collections of episodes
export const playlists = mysqlTable("playlists", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  coverImageUrl: varchar("cover_image_url", { length: 500 }),
  episodeCount: int("episode_count").default(0).notNull(),
  followers: int("followers").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = typeof playlists.$inferInsert;

// Playlist episodes junction table - many-to-many relationship
export const playlistEpisodes = mysqlTable("playlist_episodes", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  episodeId: varchar("episode_id", { length: 255 }).notNull(),
  episodeTitle: varchar("episode_title", { length: 255 }).notNull(),
  episodeUrl: varchar("episode_url", { length: 500 }),
  duration: int("duration"), // in seconds
  addedAt: timestamp("added_at").defaultNow().notNull(),
  order: int("order").default(0).notNull(),
});

export type PlaylistEpisode = typeof playlistEpisodes.$inferSelect;
export type InsertPlaylistEpisode = typeof playlistEpisodes.$inferInsert;

// Listening history table - tracks all play events
export const listeningHistory = mysqlTable("listening_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  episodeId: varchar("episode_id", { length: 255 }).notNull(),
  episodeTitle: varchar("episode_title", { length: 255 }).notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
  duration: int("duration"), // in seconds
  playedSeconds: int("played_seconds").default(0).notNull(), // how far they listened
  completionPercentage: int("completion_percentage").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  deviceType: varchar("device_type", { length: 50 }), // mobile, desktop, tablet
  sessionId: varchar("session_id", { length: 255 }), // group plays in same session
});

export type ListeningHistory = typeof listeningHistory.$inferSelect;
export type InsertListeningHistory = typeof listeningHistory.$inferInsert;

// User preferences table - personalization settings
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  preferredCategories: text("preferred_categories"), // JSON array of category IDs
  autoPlayNextEpisode: boolean("auto_play_next_episode").default(true).notNull(),
  playbackSpeed: varchar("playback_speed", { length: 10 }).default("1.0").notNull(),
  downloadQuality: mysqlEnum("download_quality", ["low", "medium", "high"]).default("high").notNull(),
  showExplicitContent: boolean("show_explicit_content").default(true).notNull(),
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).default("auto").notNull(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

// Playlist tracks table - tracks in playlists
export const playlistTracks = mysqlTable("playlist_tracks", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  trackId: int("track_id").notNull().references(() => uploadHistory.id, { onDelete: "cascade" }),
  position: int("position").default(0).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type InsertPlaylistTrack = typeof playlistTracks.$inferInsert;

// Playlist collaborators table - for shared playlists
export const playlistCollaborators = mysqlTable("playlist_collaborators", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: mysqlEnum("role", ["owner", "editor", "viewer"]).default("viewer").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  addedBy: int("added_by").references(() => users.id, { onDelete: "set null" }),
});

export type PlaylistCollaborator = typeof playlistCollaborators.$inferSelect;
export type InsertPlaylistCollaborator = typeof playlistCollaborators.$inferInsert;

// Playlist comments table - for collaboration discussion
export const playlistComments = mysqlTable("playlist_comments", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentCommentId: int("parent_comment_id").references(() => playlistComments.id, { onDelete: "cascade" }),
  likes: int("likes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PlaylistComment = typeof playlistComments.$inferSelect;
export type InsertPlaylistComment = typeof playlistComments.$inferInsert;

// Playlist followers table - for following public playlists
export const playlistFollowers = mysqlTable("playlist_followers", {
  id: int("id").autoincrement().primaryKey(),
  playlistId: int("playlist_id").notNull().references(() => playlists.id, { onDelete: "cascade" }),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  followedAt: timestamp("followed_at").defaultNow().notNull(),
});

export type PlaylistFollower = typeof playlistFollowers.$inferSelect;
export type InsertPlaylistFollower = typeof playlistFollowers.$inferInsert;

// Search history table - for tracking user searches
export const searchHistory = mysqlTable("search_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  query: varchar("query", { length: 255 }).notNull(),
  resultCount: int("result_count").default(0).notNull(),
  resultClicked: boolean("result_clicked").default(false).notNull(),
  clickedResultId: varchar("clicked_result_id", { length: 255 }),
  searchedAt: timestamp("searched_at").defaultNow().notNull(),
});

export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;

// Saved searches table - for bookmarking searches
export const savedSearches = mysqlTable("saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  query: varchar("query", { length: 255 }).notNull(),
  filters: text("filters"), // JSON object with search filters
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

// Curated collections table - for admin-curated content
export const curatedCollections = mysqlTable("curated_collections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(),
  coverImageUrl: varchar("cover_image_url", { length: 500 }),
  curatorId: int("curator_id").references(() => users.id, { onDelete: "set null" }),
  episodeCount: int("episode_count").default(0).notNull(),
  views: int("views").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CuratedCollection = typeof curatedCollections.$inferSelect;
export type InsertCuratedCollection = typeof curatedCollections.$inferInsert;

// Collection episodes table - episodes in curated collections
export const collectionEpisodes = mysqlTable("collection_episodes", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collection_id").notNull().references(() => curatedCollections.id, { onDelete: "cascade" }),
  episodeId: varchar("episode_id", { length: 255 }).notNull(),
  episodeTitle: varchar("episode_title", { length: 255 }).notNull(),
  order: int("order").default(0).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type CollectionEpisode = typeof collectionEpisodes.$inferSelect;
export type InsertCollectionEpisode = typeof collectionEpisodes.$inferInsert;

// Trending categories table - for tracking trending topics
export const trendingCategories = mysqlTable("trending_categories", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull().unique(),
  searchCount: int("search_count").default(0).notNull(),
  playCount: int("play_count").default(0).notNull(),
  trendScore: int("trend_score").default(0).notNull(),
  trend: mysqlEnum("trend", ["up", "down", "stable"]).default("stable").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type TrendingCategory = typeof trendingCategories.$inferSelect;
export type InsertTrendingCategory = typeof trendingCategories.$inferInsert;

// Recommendation history table - for tracking recommendations shown
export const recommendationHistory = mysqlTable("recommendation_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  recommendedEpisodeId: varchar("recommended_episode_id", { length: 255 }).notNull(),
  recommendationType: mysqlEnum("recommendation_type", ["personalized", "trending", "similar", "popular", "seasonal"]).notNull(),
  compatibilityScore: int("compatibility_score").default(0).notNull(),
  wasClicked: boolean("was_clicked").default(false).notNull(),
  wasPlayed: boolean("was_played").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RecommendationHistory = typeof recommendationHistory.$inferSelect;
export type InsertRecommendationHistory = typeof recommendationHistory.$inferInsert;


// ============================================================================
// PHASE 3: MEDITATION PLATFORM
// ============================================================================

export const meditations = mysqlTable("meditations", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // guided, ambient, techniques, music
  instructor: varchar("instructor", { length: 255 }),
  duration: int("duration").notNull(), // in seconds
  difficulty: varchar("difficulty", { length: 50 }).default("beginner"), // beginner, intermediate, advanced
  language: varchar("language", { length: 50 }).default("en"),
  audioUrl: varchar("audio_url", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
  tags: json("tags").$type<string[]>(),
  benefits: json("benefits").$type<string[]>(),
  focusAreas: json("focus_areas").$type<string[]>(), // stress, sleep, anxiety, focus, energy, etc.
  playCount: int("play_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  ratingCount: int("rating_count").default(0),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const meditationSeries = mysqlTable("meditation_series", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  instructor: varchar("instructor", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  totalEpisodes: int("total_episodes").default(0),
  difficulty: varchar("difficulty", { length: 50 }).default("beginner"),
  estimatedDuration: int("estimated_duration"), // total duration in seconds
  focusAreas: json("focus_areas").$type<string[]>(),
  playCount: int("play_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const meditationSeriesEpisodes = mysqlTable("meditation_series_episodes", {
  id: int("id").autoincrement().primaryKey(),
  seriesId: int("series_id").notNull().references(() => meditationSeries.id),
  meditationId: int("meditation_id").notNull().references(() => meditations.id),
  episodeNumber: int("episode_number").notNull(),
  orderIndex: int("order_index").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meditationTechniques = mysqlTable("meditation_techniques", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  steps: json("steps").$type<string[]>(),
  duration: int("duration"), // in seconds
  difficulty: varchar("difficulty", { length: 50 }).default("beginner"),
  benefits: json("benefits").$type<string[]>(),
  focusAreas: json("focus_areas").$type<string[]>(),
  imageUrl: varchar("image_url", { length: 500 }),
  videoUrl: varchar("video_url", { length: 500 }),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const ambientMusic = mysqlTable("ambient_music", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  artist: varchar("artist", { length: 255 }),
  category: varchar("category", { length: 100 }).notNull(), // nature, rain, ocean, forest, etc.
  audioUrl: varchar("audio_url", { length: 500 }).notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  duration: int("duration"), // in seconds
  focusAreas: json("focus_areas").$type<string[]>(),
  playCount: int("play_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  isLoopable: boolean("is_loopable").default(true),
  isPublished: boolean("is_published").default(false),
  isFeatured: boolean("is_featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const meditationProgress = mysqlTable("meditation_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  meditationId: int("meditation_id").notNull().references(() => meditations.id),
  completionPercentage: int("completion_percentage").default(0),
  isCompleted: boolean("is_completed").default(false),
  totalTimeSpent: int("total_time_spent").default(0), // in seconds
  sessionCount: int("session_count").default(0),
  lastPlayedAt: timestamp("last_played_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const meditationSessions = mysqlTable("meditation_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  meditationId: int("meditation_id").notNull().references(() => meditations.id),
  duration: int("duration").notNull(), // in seconds
  completionPercentage: int("completion_percentage").default(0),
  isCompleted: boolean("is_completed").default(false),
  notes: text("notes"),
  mood: varchar("mood", { length: 50 }), // calm, energized, focused, etc.
  deviceType: varchar("device_type", { length: 50 }), // mobile, desktop, tablet
  sessionDate: date("session_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meditationFavorites = mysqlTable("meditation_favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  meditationId: int("meditation_id").notNull().references(() => meditations.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const meditationStreaks = mysqlTable("meditation_streaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  currentStreak: int("current_streak").default(0),
  longestStreak: int("longest_streak").default(0),
  lastSessionDate: date("last_session_date"),
  totalSessions: int("total_sessions").default(0),
  totalMinutes: int("total_minutes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const meditationReminders = mysqlTable("meditation_reminders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  meditationId: int("meditation_id").references(() => meditations.id),
  reminderTime: time("reminder_time").notNull(),
  daysOfWeek: json("days_of_week").$type<number[]>(), // 0-6 for Sunday-Saturday
  isActive: boolean("is_active").default(true),
  reminderType: varchar("reminder_type", { length: 50 }).default("daily"), // daily, weekly, custom
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const meditationInstructors = mysqlTable("meditation_instructors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  bio: text("bio"),
  imageUrl: varchar("image_url", { length: 500 }),
  specialization: json("specialization").$type<string[]>(),
  experience: varchar("experience", { length: 255 }),
  meditationCount: int("meditation_count").default(0),
  followerCount: int("follower_count").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const meditationReviews = mysqlTable("meditation_reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  meditationId: int("meditation_id").notNull().references(() => meditations.id),
  rating: int("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  content: text("content"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  helpfulCount: int("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});


// Phase 4: User Profile, Email Verification & Settings Tables

export const emailVerifications = mysqlTable('emailVerifications', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  email: varchar('email', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  tokenExpiresAt: timestamp('tokenExpiresAt').notNull(),
  isVerified: boolean('isVerified').default(false),
  verifiedAt: timestamp('verifiedAt'),
  attemptCount: int('attemptCount').default(0),
  lastAttemptAt: timestamp('lastAttemptAt'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});

export const userSettings = mysqlTable('userSettings', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().unique().references(() => users.id),
  
  // Notification Preferences
  emailNotifications: boolean('emailNotifications').default(true),
  pushNotifications: boolean('pushNotifications').default(true),
  smsNotifications: boolean('smsNotifications').default(false),
  meditationReminders: boolean('meditationReminders').default(true),
  newContentAlerts: boolean('newContentAlerts').default(true),
  weeklyDigest: boolean('weeklyDigest').default(true),
  monthlyReport: boolean('monthlyReport').default(true),
  
  // Privacy Settings
  profileVisibility: varchar('profileVisibility', { length: 50 }).default('private'),
  showListeningHistory: boolean('showListeningHistory').default(false),
  allowDataSharing: boolean('allowDataSharing').default(false),
  allowAnalytics: boolean('allowAnalytics').default(true),
  allowMarketing: boolean('allowMarketing').default(false),
  
  // Security Settings
  twoFactorEnabled: boolean('twoFactorEnabled').default(false),
  twoFactorMethod: varchar('twoFactorMethod', { length: 50 }),
  passwordChangedAt: timestamp('passwordChangedAt'),
  loginAlerts: boolean('loginAlerts').default(true),
  sessionTimeout: int('sessionTimeout').default(3600),
  
  // Theme & Preferences
  theme: varchar('theme', { length: 50 }).default('auto'),
  language: varchar('language', { length: 10 }).default('en'),
  timezone: varchar('timezone', { length: 100 }).default('UTC'),
  
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});

export const userSessions = mysqlTable('userSessions', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  sessionToken: varchar('sessionToken', { length: 255 }).notNull().unique(),
  deviceName: varchar('deviceName', { length: 255 }),
  deviceType: varchar('deviceType', { length: 50 }),
  ipAddress: varchar('ipAddress', { length: 45 }),
  userAgent: text('userAgent'),
  isActive: boolean('isActive').default(true),
  lastActivityAt: timestamp('lastActivityAt').defaultNow(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const auditLog = mysqlTable('auditLog', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }),
  resourceId: int('resourceId'),
  details: json('details'),
  ipAddress: varchar('ipAddress', { length: 45 }),
  userAgent: text('userAgent'),
  status: varchar('status', { length: 50 }).default('success'),
  severity: varchar('severity', { length: 50 }).default('info'),
  createdAt: timestamp('createdAt').defaultNow(),
});

export const userProfiles = mysqlTable('userProfiles', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().unique().references(() => users.id),
  bio: text('bio'),
  profilePictureUrl: varchar('profilePictureUrl', { length: 500 }),
  profilePictureKey: varchar('profilePictureKey', { length: 255 }),
  phoneNumber: varchar('phoneNumber', { length: 20 }),
  location: varchar('location', { length: 255 }),
  website: varchar('website', { length: 500 }),
  socialLinks: json('socialLinks'),
  birthDate: date('birthDate'),
  gender: varchar('gender', { length: 50 }),
  
  // Profile Completion
  completionPercentage: int('completionPercentage').default(0),
  lastCompletedStep: varchar('lastCompletedStep', { length: 100 }),
  
  // Preferences
  favoriteCategories: json('favoriteCategories'),
  meditationLevel: varchar('meditationLevel', { length: 50 }),
  
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});

export const twoFactorSecrets = mysqlTable('twoFactorSecrets', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().unique().references(() => users.id),
  secret: varchar('secret', { length: 255 }).notNull(),
  backupCodes: json('backupCodes'),
  isVerified: boolean('isVerified').default(false),
  verifiedAt: timestamp('verifiedAt'),
  createdAt: timestamp('createdAt').defaultNow(),
});

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = typeof emailVerifications.$inferInsert;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export type TwoFactorSecret = typeof twoFactorSecrets.$inferSelect;
export type InsertTwoFactorSecret = typeof twoFactorSecrets.$inferInsert;



// Phase 8: Push Notifications table
export const pushNotifications = mysqlTable('push_notifications', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  icon: varchar('icon', { length: 255 }),
  badge: varchar('badge', { length: 255 }),
  tag: varchar('tag', { length: 100 }),
  data: json('data'),
  read: boolean('read').default(false),
  timestamp: timestamp('timestamp').defaultNow(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export type PushNotification = typeof pushNotifications.$inferSelect;
export type InsertPushNotification = typeof pushNotifications.$inferInsert;



// Phase 8: User Favorites table
export const userFavorites = mysqlTable('user_favorites', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  bundleId: varchar('bundle_id', { length: 255 }).notNull(),
  bundleTitle: varchar('bundle_title', { length: 255 }).notNull(),
  bundleType: varchar('bundle_type', { length: 50 }).notNull(), // 'session', 'meditation', etc.
  addedAt: timestamp('addedAt').defaultNow(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export type UserFavorite = typeof userFavorites.$inferSelect;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;

// Phase 8: User Playlists table
export const userPlaylists = mysqlTable('user_playlists', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false),
  thumbnail: varchar('thumbnail', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});

export type UserPlaylist = typeof userPlaylists.$inferSelect;
export type InsertUserPlaylist = typeof userPlaylists.$inferInsert;

// Phase 8: Playlist Items table
export const playlistItems = mysqlTable('playlist_items', {
  id: int('id').autoincrement().primaryKey(),
  playlistId: int('playlist_id').notNull().references(() => userPlaylists.id),
  bundleId: varchar('bundle_id', { length: 255 }).notNull(),
  bundleTitle: varchar('bundle_title', { length: 255 }).notNull(),
  order: int('order').notNull(),
  addedAt: timestamp('addedAt').defaultNow(),
});

export type PlaylistItem = typeof playlistItems.$inferSelect;
export type InsertPlaylistItem = typeof playlistItems.$inferInsert;

// Phase 8: User Play History table
export const userPlayHistory = mysqlTable('user_play_history', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  bundleId: varchar('bundle_id', { length: 255 }).notNull(),
  bundleTitle: varchar('bundle_title', { length: 255 }).notNull(),
  duration: int('duration').notNull(), // in seconds
  completionRate: int('completion_rate').default(0), // 0-100%
  playedAt: timestamp('playedAt').defaultNow(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export type UserPlayHistory = typeof userPlayHistory.$inferSelect;
export type InsertUserPlayHistory = typeof userPlayHistory.$inferInsert;

// Phase 8: Share Analytics table
export const shareAnalytics = mysqlTable('share_analytics', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id),
  bundleId: varchar('bundle_id', { length: 255 }).notNull(),
  bundleTitle: varchar('bundle_title', { length: 255 }).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(), // 'twitter', 'facebook', 'linkedin', 'whatsapp'
  shareUrl: varchar('shareUrl', { length: 500 }).notNull(),
  clicks: int('clicks').default(0),
  conversions: int('conversions').default(0),
  sharedAt: timestamp('sharedAt').defaultNow(),
  createdAt: timestamp('createdAt').defaultNow(),
});

export type ShareAnalytic = typeof shareAnalytics.$inferSelect;
export type InsertShareAnalytic = typeof shareAnalytics.$inferInsert;

// Phase 8: Referral Tracking table
export const referralTracking = mysqlTable('referral_tracking', {
  id: int('id').autoincrement().primaryKey(),
  referrerId: int('referrer_id').notNull().references(() => users.id),
  referredUserId: int('referred_user_id').references(() => users.id),
  referralCode: varchar('referral_code', { length: 50 }).notNull().unique(),
  bundleId: varchar('bundle_id', { length: 255 }).notNull(),
  clicks: int('clicks').default(0),
  conversions: int('conversions').default(0),
  rewardAmount: decimal('reward_amount', { precision: 10, scale: 2 }).default('0'),
  rewardClaimed: boolean('reward_claimed').default(false),
  claimedAt: timestamp('claimedAt'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow(),
});

export type ReferralTracking = typeof referralTracking.$inferSelect;
export type InsertReferralTracking = typeof referralTracking.$inferInsert;




// Phase 79: Upload History table for tracking audio file uploads
export const uploadHistory = mysqlTable('upload_history', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  filename: varchar('filename', { length: 255 }).notNull(),
  originalFilename: varchar('original_filename', { length: 255 }).notNull(),
  fileSize: int('file_size').notNull(), // in bytes
  fileSizeMB: decimal('file_size_mb', { precision: 10, scale: 2 }).notNull(), // in MB
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  s3Key: varchar('s3_key', { length: 500 }).notNull(),
  s3Url: varchar('s3_url', { length: 1000 }).notNull(),
  
  // Audio metadata
  duration: int('duration'), // in seconds
  bpm: int('bpm'), // beats per minute
  key: varchar('key', { length: 10 }), // musical key (e.g., 'C Major', 'A Minor')
  bitrate: int('bitrate'), // in kbps
  sampleRate: int('sample_rate'), // in Hz
  channels: int('channels'), // 1 for mono, 2 for stereo
  
  // Upload metadata
  uploadStatus: mysqlEnum('upload_status', ['pending', 'uploading', 'completed', 'failed', 'cancelled']).default('pending').notNull(),
  uploadProgress: int('upload_progress').default(0), // 0-100%
  uploadError: text('upload_error'), // error message if upload failed
  
  // Metadata extraction
  metadataStatus: mysqlEnum('metadata_status', ['pending', 'processing', 'completed', 'failed']).default('pending').notNull(),
  metadataError: text('metadata_error'), // error message if extraction failed
  
  // Timestamps
  uploadedAt: timestamp('uploadedAt').defaultNow().notNull(),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type UploadHistory = typeof uploadHistory.$inferSelect;
export type InsertUploadHistory = typeof uploadHistory.$inferInsert;

// Phase 79: Upload Queue table for batch upload management
export const uploadQueue = mysqlTable('upload_queue', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  uploadHistoryId: int('upload_history_id').references(() => uploadHistory.id, { onDelete: 'set null' }),
  
  filename: varchar('filename', { length: 255 }).notNull(),
  fileSize: int('file_size').notNull(), // in bytes
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  
  // Queue status
  queueStatus: mysqlEnum('queue_status', ['queued', 'processing', 'completed', 'failed', 'cancelled']).default('queued').notNull(),
  priority: int('priority').default(0), // higher = higher priority
  retryCount: int('retry_count').default(0),
  maxRetries: int('max_retries').default(3),
  
  // Progress tracking
  progress: int('progress').default(0), // 0-100%
  error: text('error'), // error message
  
  // Timestamps
  queuedAt: timestamp('queuedAt').defaultNow().notNull(),
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type UploadQueue = typeof uploadQueue.$inferSelect;
export type InsertUploadQueue = typeof uploadQueue.$inferInsert;


// Phase 82: Playlists table
export type InsertAudioMetadata = typeof audioMetadata.$inferInsert;


// Phase 94: QUMUS Autonomous Brain - Decision Policies Table
export const qumusDecisionPolicies = mysqlTable('qumus_decision_policies', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  autonomyLevel: int('autonomy_level').notNull(), // 0-100%
  trigger: varchar('trigger', { length: 255 }).notNull(),
  action: text('action').notNull(),
  enabled: boolean('enabled').default(true),
  config: json('config'), // JSON config for policy-specific settings
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type QumusDecisionPolicy = typeof qumusDecisionPolicies.$inferSelect;
export type InsertQumusDecisionPolicy = typeof qumusDecisionPolicies.$inferInsert;

// Phase 94: QUMUS Audit Logs Table
export const qumusAuditLogs = mysqlTable('qumus_audit_logs', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  decisionType: varchar('decision_type', { length: 100 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 255 }).notNull(),
  result: varchar('result', { length: 50 }).notNull(), // 'approved', 'rejected', 'escalated'
  metadata: json('metadata'), // Additional context
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type QumusAuditLog = typeof qumusAuditLogs.$inferSelect;
export type InsertQumusAuditLog = typeof qumusAuditLogs.$inferInsert;

// Phase 94: QUMUS Webhook Events Table
export const qumusWebhookEvents = mysqlTable('qumus_webhook_events', {
  id: int('id').autoincrement().primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  service: varchar('service', { length: 100 }).notNull(), // 'stripe', 'email', 'sms', etc.
  payload: json('payload').notNull(),
  status: varchar('status', { length: 50 }).notNull(), // 'pending', 'processed', 'failed'
  retryCount: int('retry_count').default(0),
  maxRetries: int('max_retries').default(3),
  error: text('error'),
  processedAt: timestamp('processedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type QumusWebhookEvent = typeof qumusWebhookEvents.$inferSelect;
export type InsertQumusWebhookEvent = typeof qumusWebhookEvents.$inferInsert;

// Phase 94: User Recommendations Table
export const userRecommendations = mysqlTable('user_recommendations', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: varchar('content_id', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 50 }).notNull(), // 'meditation', 'podcast', 'radio', etc.
  contentTitle: varchar('content_title', { length: 500 }).notNull(),
  algorithm: varchar('algorithm', { length: 100 }).notNull(), // 'collaborative', 'content-based', 'trending'
  score: decimal('score', { precision: 5, scale: 2 }).notNull(), // 0-100 confidence score
  clicked: boolean('clicked').default(false),
  completed: boolean('completed').default(false),
  rating: int('rating'), // 1-5 user rating
  clickedAt: timestamp('clickedAt'),
  completedAt: timestamp('completedAt'),
  ratedAt: timestamp('ratedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  expiresAt: timestamp('expiresAt'), // When recommendation expires
});

export type UserRecommendation = typeof userRecommendations.$inferSelect;
export type InsertUserRecommendation = typeof userRecommendations.$inferInsert;

// Phase 94: Analytics Aggregation Table
export const analyticsAggregation = mysqlTable('analytics_aggregation', {
  id: int('id').autoincrement().primaryKey(),
  aggregationType: varchar('aggregation_type', { length: 100 }).notNull(), // 'hourly', 'daily', 'weekly'
  metric: varchar('metric', { length: 100 }).notNull(), // 'page_views', 'meditation_plays', 'donations', etc.
  value: int('value').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  period: varchar('period', { length: 50 }).notNull(), // 'hour', 'day', 'week'
  metadata: json('metadata'), // Additional context
});

export type AnalyticsAggregation = typeof analyticsAggregation.$inferSelect;
export type InsertAnalyticsAggregation = typeof analyticsAggregation.$inferInsert;

// Phase 94: QUMUS Policy Performance Table
export const qumusPolicyPerformance = mysqlTable('qumus_policy_performance', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  totalDecisions: int('total_decisions').default(0),
  approvedCount: int('approved_count').default(0),
  rejectedCount: int('rejected_count').default(0),
  escalatedCount: int('escalated_count').default(0),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }).default('0'), // 0-100%
  averageProcessingTime: int('average_processing_time').default(0), // in milliseconds
  lastUpdated: timestamp('lastUpdated').defaultNow().onUpdateNow().notNull(),
});

export type QumusPolicyPerformance = typeof qumusPolicyPerformance.$inferSelect;
export type InsertQumusPolicyPerformance = typeof qumusPolicyPerformance.$inferInsert;

// Phase: QUMUS Autonomous Brain - Decision Policies Table


// QUMUS Complete: 8 Core Decision Policies Table
export const qumusCorePolicies = mysqlTable('qumus_core_policies', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  policyType: mysqlEnum('policy_type', [
    'recommendation_engine',
    'payment_processing',
    'content_moderation',
    'user_registration',
    'subscription_management',
    'performance_alert',
    'analytics_aggregation',
    'compliance_reporting'
  ]).notNull(),
  autonomyLevel: int('autonomy_level').notNull(), // 75-98%
  confidenceThreshold: int('confidence_threshold').default(80).notNull(), // 0-100
  enabled: boolean('enabled').default(true).notNull(),
  priority: int('priority').default(0).notNull(),
  conditions: json('conditions'), // Policy conditions
  actions: json('actions'), // Policy actions
  escalationRules: json('escalation_rules'), // When to escalate
  metadata: json('metadata'), // Custom config
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type QumusCorePolicy = typeof qumusCorePolicies.$inferSelect;
export type InsertQumusCorePolicy = typeof qumusCorePolicies.$inferInsert;

// QUMUS Complete: Autonomous Actions Table
export const qumusAutonomousActions = mysqlTable('qumus_autonomous_actions', {
  id: int('id').autoincrement().primaryKey(),
  decisionId: varchar('decision_id', { length: 255 }).notNull().unique(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  actionType: varchar('action_type', { length: 100 }).notNull(),
  input: json('input').notNull(),
  output: json('output'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(), // 0-100
  autonomousFlag: boolean('autonomous_flag').default(true).notNull(), // true = autonomous, false = escalated
  status: mysqlEnum('status', ['pending', 'executing', 'completed', 'failed', 'escalated']).default('pending').notNull(),
  result: varchar('result', { length: 50 }), // 'success', 'failure', 'escalated'
  errorMessage: text('error_message'),
  executionTime: int('execution_time'), // milliseconds
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type QumusAutonomousAction = typeof qumusAutonomousActions.$inferSelect;
export type InsertQumusAutonomousAction = typeof qumusAutonomousActions.$inferInsert;

// QUMUS Complete: Human Review Queue Table
export const qumusHumanReview = mysqlTable('qumus_human_review', {
  id: int('id').autoincrement().primaryKey(),
  decisionId: varchar('decision_id', { length: 255 }).notNull().unique(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  escalationReason: varchar('escalation_reason', { length: 255 }).notNull(), // 'low_confidence', 'anomaly', 'sensitive_data', 'high_risk', 'policy_threshold'
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'critical']).default('medium').notNull(),
  input: json('input').notNull(),
  recommendedAction: json('recommended_action'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }),
  reviewedBy: int('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  decision: mysqlEnum('decision', ['approved', 'rejected', 'modified']),
  reviewNotes: text('review_notes'),
  reviewedAt: timestamp('reviewed_at'),
  status: mysqlEnum('status', ['pending', 'in_review', 'completed']).default('pending').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type QumusHumanReview = typeof qumusHumanReview.$inferSelect;
export type InsertQumusHumanReview = typeof qumusHumanReview.$inferInsert;

// QUMUS Complete: Decision Logs Table (Audit Trail)
export const qumusDecisionLogs = mysqlTable('qumus_decision_logs', {
  id: int('id').autoincrement().primaryKey(),
  decisionId: varchar('decision_id', { length: 255 }).notNull().unique(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  policyType: varchar('policy_type', { length: 100 }).notNull(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  decisionType: varchar('decision_type', { length: 100 }).notNull(),
  input: json('input').notNull(),
  output: json('output'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(),
  autonomousFlag: boolean('autonomous_flag').notNull(),
  result: varchar('result', { length: 50 }).notNull(), // 'approved', 'rejected', 'escalated'
  executionTime: int('execution_time'), // milliseconds
  metadata: json('metadata'), // Additional context
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type QumusDecisionLog = typeof qumusDecisionLogs.$inferSelect;
export type InsertQumusDecisionLog = typeof qumusDecisionLogs.$inferInsert;

// QUMUS Complete: Metrics & Performance Table
export const qumusMetrics = mysqlTable('qumus_metrics', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  policyType: varchar('policy_type', { length: 100 }).notNull(),
  totalDecisions: int('total_decisions').default(0).notNull(),
  autonomousCount: int('autonomous_count').default(0).notNull(),
  escalatedCount: int('escalated_count').default(0).notNull(),
  approvedCount: int('approved_count').default(0).notNull(),
  rejectedCount: int('rejected_count').default(0).notNull(),
  autonomyPercentage: decimal('autonomy_percentage', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  averageConfidence: decimal('average_confidence', { precision: 5, scale: 2 }).default('0').notNull(),
  successRate: decimal('success_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  failureRate: decimal('failure_rate', { precision: 5, scale: 2 }).default('0').notNull(),
  avgExecutionTime: int('avg_execution_time').default(0).notNull(), // milliseconds
  escalationRate: decimal('escalation_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  period: varchar('period', { length: 50 }).notNull(), // 'hourly', 'daily', 'weekly', 'monthly'
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type QumusMetrics = typeof qumusMetrics.$inferSelect;
export type InsertQumusMetrics = typeof qumusMetrics.$inferInsert;

// QUMUS Complete: Policy Recommendations Table
export const qumusPolicyRecommendations = mysqlTable('qumus_policy_recommendations', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 100 }).notNull(),
  policyType: varchar('policy_type', { length: 100 }).notNull(),
  recommendationType: varchar('recommendation_type', { length: 100 }).notNull(), // 'threshold_adjustment', 'escalation_rule', 'policy_optimization'
  currentValue: varchar('current_value', { length: 255 }),
  recommendedValue: varchar('recommended_value', { length: 255 }).notNull(),
  reason: text('reason').notNull(),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(),
  impact: varchar('impact', { length: 50 }).notNull(), // 'high', 'medium', 'low'
  implemented: boolean('implemented').default(false).notNull(),
  implementedAt: timestamp('implemented_at'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type QumusPolicyRecommendation = typeof qumusPolicyRecommendations.$inferSelect;
export type InsertQumusPolicyRecommendation = typeof qumusPolicyRecommendations.$inferInsert;


// ============================================================================
// QUMUS BROADCAST ORCHESTRATION TABLES
// ============================================================================

// Broadcast Management: Broadcast Schedules
export const broadcastSchedules = mysqlTable('broadcast_schedules', {
  id: int('id').autoincrement().primaryKey(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  scheduledStartTime: timestamp('scheduled_start_time').notNull(),
  scheduledEndTime: timestamp('scheduled_end_time').notNull(),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  status: mysqlEnum('status', ['scheduled', 'live', 'completed', 'cancelled', 'paused']).default('scheduled').notNull(),
  broadcastType: mysqlEnum('broadcast_type', ['live', 'prerecorded', 'streaming', 'podcast', 'radio', 'video']).notNull(),
  channels: json('channels').notNull(), // ['youtube', 'twitch', 'facebook', 'instagram', 'website']
  createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
  autonomousScheduling: boolean('autonomous_scheduling').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type BroadcastSchedule = typeof broadcastSchedules.$inferSelect;
export type InsertBroadcastSchedule = typeof broadcastSchedules.$inferInsert;

// Music Management: Tracks and Playlists
export const musicTracks = mysqlTable('music_tracks', {
  id: int('id').autoincrement().primaryKey(),
  trackId: varchar('track_id', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  artist: varchar('artist', { length: 255 }).notNull(),
  album: varchar('album', { length: 255 }),
  duration: int('duration').notNull(), // seconds
  genre: varchar('genre', { length: 100 }),
  releaseDate: date('release_date'),
  fileUrl: varchar('file_url', { length: 500 }).notNull(),
  coverArtUrl: varchar('cover_art_url', { length: 500 }),
  isrc: varchar('isrc', { length: 50 }), // International Standard Recording Code
  rights: varchar('rights', { length: 255 }), // Rights holder info
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type MusicTrack = typeof musicTracks.$inferSelect;
export type InsertMusicTrack = typeof musicTracks.$inferInsert;

// Music Management: Playlists
export const musicPlaylists = mysqlTable('music_playlists', {
  id: int('id').autoincrement().primaryKey(),
  playlistId: varchar('playlist_id', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  createdBy: int('created_by').references(() => users.id, { onDelete: 'set null' }),
  isPublic: boolean('is_public').default(false).notNull(),
  trackCount: int('track_count').default(0).notNull(),
  totalDuration: int('total_duration').default(0).notNull(), // seconds
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type MusicPlaylist = typeof musicPlaylists.$inferSelect;
export type InsertMusicPlaylist = typeof musicPlaylists.$inferInsert;



// Commercial Management: Commercial Breaks
export const commercialBreaks = mysqlTable('commercial_breaks', {
  id: int('id').autoincrement().primaryKey(),
  breakId: varchar('break_id', { length: 255 }).notNull().unique(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  scheduledTime: timestamp('scheduled_time').notNull(),
  duration: int('duration').notNull(), // seconds
  commercialCount: int('commercial_count').default(0).notNull(),
  totalValue: decimal('total_value', { precision: 10, scale: 2 }).default('0').notNull(),
  status: mysqlEnum('status', ['scheduled', 'running', 'completed', 'skipped']).default('scheduled').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type CommercialBreak = typeof commercialBreaks.$inferSelect;
export type InsertCommercialBreak = typeof commercialBreaks.$inferInsert;

// Commercial Management: Commercials
export const commercials = mysqlTable('commercials', {
  id: int('id').autoincrement().primaryKey(),
  commercialId: varchar('commercial_id', { length: 255 }).notNull().unique(),
  advertiser: varchar('advertiser', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  duration: int('duration').notNull(), // seconds
  videoUrl: varchar('video_url', { length: 500 }).notNull(),
  thumbnailUrl: varchar('thumbnail_url', { length: 500 }),
  rate: decimal('rate', { precision: 10, scale: 2 }).notNull(), // Cost per broadcast
  category: varchar('category', { length: 100 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Commercial = typeof commercials.$inferSelect;
export type InsertCommercial = typeof commercials.$inferInsert;

// Broadcast Analytics: Viewer Metrics
export const viewerMetrics = mysqlTable('viewer_metrics', {
  id: int('id').autoincrement().primaryKey(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  viewerCount: int('viewer_count').default(0).notNull(),
  peakViewers: int('peak_viewers').default(0).notNull(),
  averageViewDuration: int('average_view_duration').default(0).notNull(), // seconds
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  likeCount: int('like_count').default(0).notNull(),
  commentCount: int('comment_count').default(0).notNull(),
  shareCount: int('share_count').default(0).notNull(),
  bounceRate: decimal('bounce_rate', { precision: 5, scale: 2 }).default('0').notNull(), // 0-100%
  geolocation: json('geolocation'), // {country, region, city, coordinates}
  deviceTypes: json('device_types'), // {mobile, desktop, tablet, tv}
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ViewerMetric = typeof viewerMetrics.$inferSelect;
export type InsertViewerMetric = typeof viewerMetrics.$inferInsert;

// Content Generation: AI Generated Content
export const generatedContent = mysqlTable('generated_content', {
  id: int('id').autoincrement().primaryKey(),
  contentId: varchar('content_id', { length: 255 }).notNull().unique(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  contentType: mysqlEnum('content_type', ['script', 'description', 'thumbnail', 'title', 'hashtags', 'summary']).notNull(),
  generatedBy: varchar('generated_by', { length: 100 }).notNull(), // 'gpt-4', 'claude', 'llama', etc.
  prompt: text('prompt').notNull(),
  content: text('content').notNull(),
  confidence: decimal('confidence', { precision: 5, scale: 2 }).notNull(), // 0-100
  approved: boolean('approved').default(false).notNull(),
  approvedBy: int('approved_by').references(() => users.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = typeof generatedContent.$inferInsert;

// Streaming Status: Multi-Platform Distribution
export const streamingStatus = mysqlTable('streaming_status', {
  id: int('id').autoincrement().primaryKey(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  platform: mysqlEnum('platform', ['youtube', 'twitch', 'facebook', 'instagram', 'website', 'radio', 'podcast']).notNull(),
  status: mysqlEnum('status', ['offline', 'live', 'error', 'paused']).default('offline').notNull(),
  streamUrl: varchar('stream_url', { length: 500 }),
  bitrate: int('bitrate'), // kbps
  resolution: varchar('resolution', { length: 50 }), // 1080p, 720p, etc.
  frameRate: int('frame_rate'), // fps
  latency: int('latency'), // milliseconds
  errorMessage: text('error_message'),
  lastUpdated: timestamp('last_updated').defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type StreamingStatus = typeof streamingStatus.$inferSelect;
export type InsertStreamingStatus = typeof streamingStatus.$inferInsert;

// Broadcast Chat Interface: Commands and Interactions
export const broadcastChatCommands = mysqlTable('broadcast_chat_commands', {
  id: int('id').autoincrement().primaryKey(),
  commandId: varchar('command_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  command: text('command').notNull(), // Natural language command
  commandType: varchar('command_type', { length: 100 }).notNull(), // 'schedule', 'play', 'pause', 'skip', 'insert_commercial'
  parameters: json('parameters'), // Parsed command parameters
  executedBy: varchar('executed_by', { length: 100 }).notNull(), // 'ai_assistant', 'human_operator'
  status: mysqlEnum('status', ['pending', 'executing', 'completed', 'failed']).default('pending').notNull(),
  result: json('result'), // Command execution result
  errorMessage: text('error_message'),
  executionTime: int('execution_time'), // milliseconds
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export type BroadcastChatCommand = typeof broadcastChatCommands.$inferSelect;
export type InsertBroadcastChatCommand = typeof broadcastChatCommands.$inferInsert;

// Compliance and Audit: Broadcast Audit Log
export const broadcastAuditLog = mysqlTable('broadcast_audit_log', {
  id: int('id').autoincrement().primaryKey(),
  auditId: varchar('audit_id', { length: 255 }).notNull().unique(),
  broadcastId: varchar('broadcast_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(), // 'started', 'paused', 'resumed', 'ended', 'commercial_inserted', 'content_changed'
  performedBy: int('performed_by').references(() => users.id, { onDelete: 'set null' }),
  details: json('details'), // Additional context
  complianceStatus: mysqlEnum('compliance_status', ['compliant', 'warning', 'violation']).default('compliant').notNull(),
  complianceNotes: text('compliance_notes'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type BroadcastAuditLog = typeof broadcastAuditLog.$inferSelect;
export type InsertBroadcastAuditLog = typeof broadcastAuditLog.$inferInsert;

// Government-Grade Security: Encryption Keys and Certificates
export const securityCertificates = mysqlTable('security_certificates', {
  id: int('id').autoincrement().primaryKey(),
  certId: varchar('cert_id', { length: 255 }).notNull().unique(),
  broadcastId: varchar('broadcast_id', { length: 255 }),
  certificateType: mysqlEnum('certificate_type', ['ssl', 'encryption', 'signing', 'authentication']).notNull(),
  issuedBy: varchar('issued_by', { length: 255 }).notNull(),
  issuedAt: timestamp('issued_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  fingerprint: varchar('fingerprint', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type SecurityCertificate = typeof securityCertificates.$inferSelect;
export type InsertSecurityCertificate = typeof securityCertificates.$inferInsert;

// Broadcast Policies: QUMUS Broadcast Policies
export const broadcastPolicies = mysqlTable('broadcast_policies', {
  id: int('id').autoincrement().primaryKey(),
  policyId: varchar('policy_id', { length: 255 }).notNull().unique(),
  policyName: varchar('policy_name', { length: 255 }).notNull(),
  description: text('description'),
  policyType: mysqlEnum('policy_type', ['scheduling', 'content_generation', 'streaming', 'commercial', 'compliance', 'security']).notNull(),
  autonomyLevel: int('autonomy_level').default(85).notNull(), // 0-100%
  confidenceThreshold: int('confidence_threshold').default(80).notNull(), // 0-100%
  escalationThreshold: int('escalation_threshold').default(70).notNull(), // 0-100%
  config: json('config'), // Policy-specific configuration
  enabled: boolean('enabled').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type BroadcastPolicy = typeof broadcastPolicies.$inferSelect;
export type InsertBroadcastPolicy = typeof broadcastPolicies.$inferInsert;


// ============================================
// Entertainment Platform Orchestration Tables
// ============================================

// Media Studio - Video/Podcast Production
export const mediaProjects = mysqlTable('media_projects', {
  id: int('id').autoincrement().primaryKey(),
  projectId: varchar('project_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  projectType: mysqlEnum('project_type', ['video', 'podcast', 'live_stream', 'shorts', 'music', 'other']).notNull(),
  status: mysqlEnum('status', ['draft', 'recording', 'editing', 'published', 'archived']).default('draft').notNull(),
  duration: int('duration'), // in seconds
  thumbnailUrl: varchar('thumbnail_url', { length: 512 }),
  videoUrl: varchar('video_url', { length: 512 }),
  audioUrl: varchar('audio_url', { length: 512 }),
  views: int('views').default(0).notNull(),
  likes: int('likes').default(0).notNull(),
  shares: int('shares').default(0).notNull(),
  comments: int('comments').default(0).notNull(),
  engagementRate: decimal('engagement_rate', { precision: 5, scale: 2 }).default(0),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  publishedAt: timestamp('published_at'),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type MediaProject = typeof mediaProjects.$inferSelect;
export type InsertMediaProject = typeof mediaProjects.$inferInsert;

// Media Distribution - Multi-platform publishing
export const mediaDistribution = mysqlTable('media_distribution', {
  id: int('id').autoincrement().primaryKey(),
  distributionId: varchar('distribution_id', { length: 255 }).notNull().unique(),
  projectId: varchar('project_id', { length: 255 }).notNull().references(() => mediaProjects.projectId),
  platform: mysqlEnum('platform', ['youtube', 'spotify', 'tiktok', 'instagram', 'facebook', 'twitter', 'linkedin', 'podcast_host', 'direct']).notNull(),
  platformUrl: varchar('platform_url', { length: 512 }),
  status: mysqlEnum('status', ['pending', 'published', 'failed', 'scheduled']).default('pending').notNull(),
  platformViews: int('platform_views').default(0),
  platformEngagement: int('platform_engagement').default(0),
  platformRevenue: decimal('platform_revenue', { precision: 10, scale: 2 }).default(0),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type MediaDistribution = typeof mediaDistribution.$inferSelect;
export type InsertMediaDistribution = typeof mediaDistribution.$inferInsert;

// Audio Streaming - Meditation, Podcasts, Radio
export const audioContent = mysqlTable('audio_content', {
  id: int('id').autoincrement().primaryKey(),
  contentId: varchar('content_id', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  contentType: mysqlEnum('content_type', ['meditation', 'podcast', 'radio', 'music', 'audiobook', 'other']).notNull(),
  category: varchar('category', { length: 100 }),
  duration: int('duration').notNull(), // in seconds
  audioUrl: varchar('audio_url', { length: 512 }).notNull(),
  coverArtUrl: varchar('cover_art_url', { length: 512 }),
  artist: varchar('artist', { length: 255 }),
  album: varchar('album', { length: 255 }),
  plays: int('plays').default(0).notNull(),
  favorites: int('favorites').default(0).notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }).default(0),
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type AudioContent = typeof audioContent.$inferSelect;
export type InsertAudioContent = typeof audioContent.$inferInsert;

// Audio Playback History - Track user listening
export const audioPlaybackHistory = mysqlTable('audio_playback_history', {
  id: int('id').autoincrement().primaryKey(),
  historyId: varchar('history_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: varchar('content_id', { length: 255 }).notNull().references(() => audioContent.contentId),
  playCount: int('play_count').default(1).notNull(),
  totalListeningTime: int('total_listening_time').default(0).notNull(), // in seconds
  lastPlayedAt: timestamp('last_played_at'),
  isFavorited: boolean('is_favorited').default(false).notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type AudioPlaybackHistory = typeof audioPlaybackHistory.$inferSelect;
export type InsertAudioPlaybackHistory = typeof audioPlaybackHistory.$inferInsert;

// AI Recommendations - Personalized content suggestions
export const aiRecommendations = mysqlTable('ai_recommendations', {
  id: int('id').autoincrement().primaryKey(),
  recommendationId: varchar('recommendation_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  contentId: varchar('content_id', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  recommendationType: mysqlEnum('recommendation_type', ['personalized', 'trending', 'similar', 'new_release', 'based_on_history']).notNull(),
  relevanceScore: decimal('relevance_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  confidenceScore: decimal('confidence_score', { precision: 5, scale: 2 }).notNull(), // 0-100
  reason: text('reason'), // Why this was recommended
  clicked: boolean('clicked').default(false).notNull(),
  engaged: boolean('engaged').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;

// Monetization - Revenue tracking
export const monetizationEvents = mysqlTable('monetization_events', {
  id: int('id').autoincrement().primaryKey(),
  eventId: varchar('event_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'set null' }),
  contentId: varchar('content_id', { length: 255 }),
  projectId: varchar('project_id', { length: 255 }),
  eventType: mysqlEnum('event_type', ['ad_impression', 'ad_click', 'subscription', 'donation', 'merchandise', 'sponsorship', 'affiliate']).notNull(),
  platform: varchar('platform', { length: 100 }),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  metadata: json('metadata'), // Additional event details
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type MonetizationEvent = typeof monetizationEvents.$inferSelect;
export type InsertMonetizationEvent = typeof monetizationEvents.$inferInsert;

// Entertainment Metrics - Real-time dashboard data
export const entertainmentMetrics = mysqlTable('entertainment_metrics', {
  id: int('id').autoincrement().primaryKey(),
  metricsId: varchar('metrics_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').references(() => users.id, { onDelete: 'cascade' }),
  period: mysqlEnum('period', ['daily', 'weekly', 'monthly', 'yearly']).notNull(),
  totalViews: int('total_views').default(0).notNull(),
  totalEngagement: int('total_engagement').default(0).notNull(),
  totalRevenue: decimal('total_revenue', { precision: 15, scale: 2 }).default(0).notNull(),
  averageDuration: decimal('average_duration', { precision: 10, scale: 2 }).default(0).notNull(),
  growthRate: decimal('growth_rate', { precision: 5, scale: 2 }).default(0).notNull(),
  activeProjects: int('active_projects').default(0).notNull(),
  topContent: json('top_content'), // Array of top performing content
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type EntertainmentMetrics = typeof entertainmentMetrics.$inferSelect;
export type InsertEntertainmentMetrics = typeof entertainmentMetrics.$inferInsert;

// Entertainment Playlists - User-created collections
export const entertainmentPlaylists = mysqlTable('entertainment_playlists', {
  id: int('id').autoincrement().primaryKey(),
  playlistId: varchar('playlist_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  isPublic: boolean('is_public').default(false).notNull(),
  coverArtUrl: varchar('cover_art_url', { length: 512 }),
  itemCount: int('item_count').default(0).notNull(),
  plays: int('plays').default(0).notNull(),
  followers: int('followers').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type EntertainmentPlaylist = typeof entertainmentPlaylists.$inferSelect;
export type InsertEntertainmentPlaylist = typeof entertainmentPlaylists.$inferInsert;

// Entertainment Playlist Items - Content in playlists
export const entertainmentPlaylistItems = mysqlTable('entertainment_playlist_items', {
  id: int('id').autoincrement().primaryKey(),
  itemId: varchar('item_id', { length: 255 }).notNull().unique(),
  playlistId: varchar('playlist_id', { length: 255 }).notNull().references(() => entertainmentPlaylists.playlistId, { onDelete: 'cascade' }),
  contentId: varchar('content_id', { length: 255 }).notNull(),
  contentType: varchar('content_type', { length: 100 }).notNull(),
  position: int('position').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
});
export type EntertainmentPlaylistItem = typeof entertainmentPlaylistItems.$inferSelect;
export type InsertEntertainmentPlaylistItem = typeof entertainmentPlaylistItems.$inferInsert;

// Gaming Platform - Tournaments and leaderboards
export const gamingTournaments = mysqlTable('gaming_tournaments', {
  id: int('id').autoincrement().primaryKey(),
  tournamentId: varchar('tournament_id', { length: 255 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  gameType: varchar('game_type', { length: 100 }).notNull(),
  status: mysqlEnum('status', ['upcoming', 'active', 'completed', 'cancelled']).default('upcoming').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  maxParticipants: int('max_participants'),
  currentParticipants: int('current_participants').default(0).notNull(),
  prizePool: decimal('prize_pool', { precision: 15, scale: 2 }).default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type GamingTournament = typeof gamingTournaments.$inferSelect;
export type InsertGamingTournament = typeof gamingTournaments.$inferInsert;

// Gaming Leaderboard - Player rankings
export const gamingLeaderboard = mysqlTable('gaming_leaderboard', {
  id: int('id').autoincrement().primaryKey(),
  leaderboardId: varchar('leaderboard_id', { length: 255 }).notNull().unique(),
  tournamentId: varchar('tournament_id', { length: 255 }).notNull().references(() => gamingTournaments.tournamentId),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rank: int('rank').notNull(),
  score: int('score').notNull(),
  wins: int('wins').default(0).notNull(),
  losses: int('losses').default(0).notNull(),
  winRate: decimal('win_rate', { precision: 5, scale: 2 }).default(0).notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type GamingLeaderboard = typeof gamingLeaderboard.$inferSelect;
export type InsertGamingLeaderboard = typeof gamingLeaderboard.$inferInsert;

// Client Portal - Approval workflows
export const clientPortalSubmissions = mysqlTable('client_portal_submissions', {
  id: int('id').autoincrement().primaryKey(),
  submissionId: varchar('submission_id', { length: 255 }).notNull().unique(),
  clientId: int('client_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  submissionType: mysqlEnum('submission_type', ['content', 'feedback', 'request', 'report', 'other']).notNull(),
  status: mysqlEnum('status', ['pending', 'under_review', 'approved', 'rejected', 'revision_requested']).default('pending').notNull(),
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'urgent']).default('medium').notNull(),
  attachmentUrl: varchar('attachment_url', { length: 512 }),
  reviewerNotes: text('reviewer_notes'),
  reviewedBy: int('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type ClientPortalSubmission = typeof clientPortalSubmissions.$inferSelect;
export type InsertClientPortalSubmission = typeof clientPortalSubmissions.$inferInsert;

// Entertainment User Preferences - Personalization settings
export const entertainmentUserPreferences = mysqlTable('entertainment_user_preferences', {
  id: int('id').autoincrement().primaryKey(),
  preferencesId: varchar('preferences_id', { length: 255 }).notNull().unique(),
  userId: int('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  preferredContentTypes: json('preferred_content_types'), // Array of content types
  preferredGenres: json('preferred_genres'), // Array of genres
  recommendationFrequency: mysqlEnum('recommendation_frequency', ['daily', 'weekly', 'monthly', 'never']).default('weekly').notNull(),
  notificationsEnabled: boolean('notifications_enabled').default(true).notNull(),
  autoPlayEnabled: boolean('auto_play_enabled').default(true).notNull(),
  qualityPreference: mysqlEnum('quality_preference', ['low', 'medium', 'high', 'auto']).default('auto').notNull(),
  languagePreference: varchar('language_preference', { length: 10 }).default('en').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type EntertainmentUserPreferences = typeof entertainmentUserPreferences.$inferSelect;
export type InsertEntertainmentUserPreferences = typeof entertainmentUserPreferences.$inferInsert;
