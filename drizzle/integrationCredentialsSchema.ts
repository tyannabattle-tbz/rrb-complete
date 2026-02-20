import { sqliteTable, text, integer, primaryKey, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

/**
 * Integration Credentials Schema
 * Tracks all third-party API keys, OAuth tokens, and login credentials
 * with automatic renewal reminders and update procedures
 */

export const integrationCredentials = sqliteTable(
  'integration_credentials',
  {
    id: text('id').primaryKey(),
    // Integration identifier
    integrationName: text('integration_name').notNull(), // e.g., "apple_podcasts", "youtube", "discord"
    integrationPhase: integer('integration_phase').notNull(), // 2-7 (Phase number)
    integrationCategory: text('integration_category').notNull(), // e.g., "podcast", "social_media", "radio_directory"

    // Credential storage
    credentialType: text('credential_type').notNull(), // "api_key", "oauth_token", "username_password", "bearer_token"
    credentialKey: text('credential_key').notNull(), // e.g., "YOUTUBE_API_KEY"
    credentialValue: text('credential_value').notNull(), // Encrypted value
    isEncrypted: integer('is_encrypted').default(1), // Boolean: 1 = encrypted, 0 = plain text

    // Login information
    loginUrl: text('login_url'), // URL to login page
    loginEmail: text('login_email'), // Email used for login
    loginUsername: text('login_username'), // Username if applicable
    accountId: text('account_id'), // Account/Station/Channel ID from platform

    // Renewal tracking
    renewalFrequency: text('renewal_frequency').notNull(), // "monthly", "quarterly", "semi_annual", "annual", "ongoing"
    renewalDate: integer('renewal_date'), // Unix timestamp of next renewal
    lastRenewedAt: integer('last_renewed_at'), // Unix timestamp of last renewal
    expiresAt: integer('expires_at'), // Unix timestamp when credential expires
    isExpired: integer('is_expired').default(0), // Boolean: 1 = expired, 0 = active

    // Update procedures
    updateProcedure: text('update_procedure'), // JSON: step-by-step update instructions
    updateFrequency: text('update_frequency'), // "daily", "weekly", "monthly", "quarterly"
    lastUpdatedAt: integer('last_updated_at'), // Unix timestamp of last update

    // Support information
    supportUrl: text('support_url'), // Support/Help page URL
    supportEmail: text('support_email'), // Support email
    supportPhone: text('support_phone'), // Support phone number
    documentationUrl: text('documentation_url'), // API/Integration documentation URL

    // Status and monitoring
    status: text('status').notNull().default('active'), // "active", "inactive", "expired", "revoked"
    isVerified: integer('is_verified').default(0), // Boolean: 1 = verified working, 0 = not tested
    lastVerifiedAt: integer('last_verified_at'), // Unix timestamp of last verification
    verificationError: text('verification_error'), // Error message if verification failed

    // Metadata
    notes: text('notes'), // Additional notes or special instructions
    tags: text('tags'), // JSON array of tags for organization
    priority: text('priority').default('medium'), // "low", "medium", "high", "critical"
    isBackup: integer('is_backup').default(0), // Boolean: 1 = backup credential, 0 = primary

    // Audit trail
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
    createdBy: text('created_by'),
    updatedBy: text('updated_by'),
  },
  (table) => ({
    integrationNameUnique: unique('integration_name_unique').on(table.integrationName, table.credentialKey),
  })
);

export const integrationCredentialLogs = sqliteTable(
  'integration_credential_logs',
  {
    id: text('id').primaryKey(),
    credentialId: text('credential_id')
      .notNull()
      .references(() => integrationCredentials.id, { onDelete: 'cascade' }),

    // Log entry
    action: text('action').notNull(), // "created", "updated", "renewed", "verified", "failed", "rotated"
    status: text('status').notNull(), // "success", "failed", "pending"
    message: text('message'), // Log message
    errorMessage: text('error_message'), // Error details if failed

    // Verification details
    verificationResult: text('verification_result'), // JSON: verification test results
    apiResponseCode: integer('api_response_code'), // HTTP response code
    apiResponseTime: integer('api_response_time'), // Response time in milliseconds

    // Metadata
    performedBy: text('performed_by'), // User or system that performed the action
    ipAddress: text('ip_address'), // IP address of the request
    userAgent: text('user_agent'), // User agent string

    // Timestamps
    createdAt: integer('created_at').notNull(),
  }
);

export const integrationRenewalSchedule = sqliteTable(
  'integration_renewal_schedule',
  {
    id: text('id').primaryKey(),
    credentialId: text('credential_id')
      .notNull()
      .references(() => integrationCredentials.id, { onDelete: 'cascade' }),

    // Renewal schedule
    renewalDate: integer('renewal_date').notNull(), // Unix timestamp
    renewalType: text('renewal_type').notNull(), // "automatic", "manual", "manual_with_reminder"
    reminderSentAt: integer('reminder_sent_at'), // When reminder was sent
    renewalCompletedAt: integer('renewal_completed_at'), // When renewal was completed
    status: text('status').notNull().default('pending'), // "pending", "in_progress", "completed", "failed"

    // Failure handling
    failureCount: integer('failure_count').default(0), // Number of failed renewal attempts
    lastFailureMessage: text('last_failure_message'), // Last error message
    nextRetryAt: integer('next_retry_at'), // Next retry timestamp

    // Metadata
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  }
);

export const integrationUpdateProcedures = sqliteTable(
  'integration_update_procedures',
  {
    id: text('id').primaryKey(),
    integrationName: text('integration_name').notNull().unique(), // e.g., "apple_podcasts"

    // Procedure details
    procedureTitle: text('procedure_title').notNull(),
    procedureDescription: text('procedure_description'),
    steps: text('steps').notNull(), // JSON array of update steps
    estimatedTime: integer('estimated_time'), // Estimated time in minutes
    difficulty: text('difficulty'), // "easy", "medium", "hard"

    // Verification
    verificationSteps: text('verification_steps'), // JSON array of verification steps
    successCriteria: text('success_criteria'), // What indicates successful update

    // Rollback
    rollbackSteps: text('rollback_steps'), // JSON array of rollback steps
    rollbackProcedure: text('rollback_procedure'), // Detailed rollback procedure

    // Documentation
    documentationUrl: text('documentation_url'),
    videoTutorialUrl: text('video_tutorial_url'),
    screenshotUrls: text('screenshot_urls'), // JSON array of screenshot URLs

    // Metadata
    lastUpdatedAt: integer('last_updated_at'),
    updatedBy: text('updated_by'),
    createdAt: integer('created_at').notNull(),
  }
);

export type IntegrationCredential = typeof integrationCredentials.$inferSelect;
export type IntegrationCredentialLog = typeof integrationCredentialLogs.$inferSelect;
export type IntegrationRenewalSchedule = typeof integrationRenewalSchedule.$inferSelect;
export type IntegrationUpdateProcedure = typeof integrationUpdateProcedures.$inferSelect;
