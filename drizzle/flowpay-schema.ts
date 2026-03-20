import { sqliteTable, text, integer, real, index, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

/**
 * FlowPay Schema — Autonomous Payment Platform
 * Stripe-first design: store only IDs and metadata, let Stripe handle sensitive data
 */

export const flowpayUsers = sqliteTable(
  'flowpay_users',
  {
    id: integer('id').primaryKey(),
    userId: integer('user_id').notNull().unique(),
    stripeCustomerId: text('stripe_customer_id').notNull().unique(),
    stripeConnectAccountId: text('stripe_connect_account_id'), // For payouts
    displayName: text('display_name'),
    preferredPaymentMethod: text('preferred_payment_method'), // 'card', 'bank', 'wallet'
    smartRoutingEnabled: integer('smart_routing_enabled', { mode: 'boolean' }).default(true),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    userIdIdx: index('flowpay_users_user_id_idx').on(table.userId),
    stripeCustomerIdx: index('flowpay_users_stripe_customer_idx').on(table.stripeCustomerId),
  })
);

export const flowpayTransactions = sqliteTable(
  'flowpay_transactions',
  {
    id: integer('id').primaryKey(),
    senderId: integer('sender_id').notNull(),
    recipientId: integer('recipient_id').notNull(),
    amount: real('amount').notNull(), // in cents (e.g., 1000 = $10.00)
    currency: text('currency').default('USD'),
    status: text('status').notNull(), // 'pending', 'succeeded', 'failed', 'refunded'
    stripePaymentIntentId: text('stripe_payment_intent_id').notNull().unique(),
    description: text('description'),
    metadata: text('metadata'), // JSON: {source: 'x', plan_id: 123, etc}
    failureReason: text('failure_reason'),
    createdAt: integer('created_at').notNull(),
    completedAt: integer('completed_at'),
  },
  (table) => ({
    senderIdx: index('flowpay_transactions_sender_idx').on(table.senderId),
    recipientIdx: index('flowpay_transactions_recipient_idx').on(table.recipientId),
    statusIdx: index('flowpay_transactions_status_idx').on(table.status),
    stripePaymentIntentIdx: index('flowpay_transactions_stripe_pi_idx').on(table.stripePaymentIntentId),
  })
);

export const flowpayPaymentPlans = sqliteTable(
  'flowpay_payment_plans',
  {
    id: integer('id').primaryKey(),
    senderId: integer('sender_id').notNull(),
    recipientId: integer('recipient_id').notNull(),
    amount: real('amount').notNull(), // per installment
    frequency: text('frequency').notNull(), // 'weekly', 'biweekly', 'monthly', 'quarterly', 'annual'
    totalInstallments: integer('total_installments'),
    completedInstallments: integer('completed_installments').default(0),
    status: text('status').notNull(), // 'active', 'paused', 'completed', 'cancelled'
    stripeSubscriptionId: text('stripe_subscription_id').notNull().unique(),
    nextChargeDate: integer('next_charge_date').notNull(),
    description: text('description'),
    metadata: text('metadata'), // JSON: {source: 'hybridcast', emergency_fund: true, etc}
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (table) => ({
    senderIdx: index('flowpay_plans_sender_idx').on(table.senderId),
    recipientIdx: index('flowpay_plans_recipient_idx').on(table.recipientId),
    statusIdx: index('flowpay_plans_status_idx').on(table.status),
    nextChargeDateIdx: index('flowpay_plans_next_charge_idx').on(table.nextChargeDate),
  })
);

export const flowpaySmartRoutes = sqliteTable(
  'flowpay_smart_routes',
  {
    id: integer('id').primaryKey(),
    userId: integer('user_id').notNull().unique(),
    preferredMethod: text('preferred_method').notNull(), // 'stripe_card', 'stripe_bank', 'wallet'
    successRate: real('success_rate').default(1.0), // 0-1 scale
    avgProcessingTimeMs: integer('avg_processing_time_ms').default(0),
    totalTransactions: integer('total_transactions').default(0),
    totalFailed: integer('total_failed').default(0),
    lastUpdated: integer('last_updated').notNull(),
  },
  (table) => ({
    userIdx: index('flowpay_routes_user_idx').on(table.userId),
  })
);

export const flowpayPaymentLinks = sqliteTable(
  'flowpay_payment_links',
  {
    id: integer('id').primaryKey(),
    linkId: text('link_id').notNull().unique(), // short slug for sharing
    senderId: integer('sender_id').notNull(),
    amount: real('amount').notNull(),
    description: text('description'),
    expiresAt: integer('expires_at'),
    maxUses: integer('max_uses'),
    currentUses: integer('current_uses').default(0),
    source: text('source'), // 'x', 'hybridcast', 'squadd', 'content_calendar'
    metadata: text('metadata'), // JSON: {tweet_id, broadcast_id, etc}
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    linkIdIdx: index('flowpay_links_link_id_idx').on(table.linkId),
    senderIdx: index('flowpay_links_sender_idx').on(table.senderId),
    sourceIdx: index('flowpay_links_source_idx').on(table.source),
  })
);

export const flowpayAuditLog = sqliteTable(
  'flowpay_audit_log',
  {
    id: integer('id').primaryKey(),
    userId: integer('user_id'),
    action: text('action').notNull(), // 'send', 'plan_created', 'plan_charged', 'refund', 'route_updated'
    entityType: text('entity_type'), // 'transaction', 'plan', 'link'
    entityId: integer('entity_id'),
    details: text('details'), // JSON
    createdAt: integer('created_at').notNull(),
  },
  (table) => ({
    userIdx: index('flowpay_audit_user_idx').on(table.userId),
    actionIdx: index('flowpay_audit_action_idx').on(table.action),
  })
);

// Relations
export const flowpayUsersRelations = relations(flowpayUsers, ({ many }) => ({
  sentTransactions: many(flowpayTransactions, { relationName: 'sender' }),
  receivedTransactions: many(flowpayTransactions, { relationName: 'recipient' }),
  sentPlans: many(flowpayPaymentPlans, { relationName: 'sender' }),
  receivedPlans: many(flowpayPaymentPlans, { relationName: 'recipient' }),
  paymentLinks: many(flowpayPaymentLinks),
  smartRoute: many(flowpaySmartRoutes),
}));

export const flowpayTransactionsRelations = relations(flowpayTransactions, ({ one }) => ({
  sender: one(flowpayUsers, {
    fields: [flowpayTransactions.senderId],
    references: [flowpayUsers.userId],
    relationName: 'sender',
  }),
  recipient: one(flowpayUsers, {
    fields: [flowpayTransactions.recipientId],
    references: [flowpayUsers.userId],
    relationName: 'recipient',
  }),
}));

export const flowpayPaymentPlansRelations = relations(flowpayPaymentPlans, ({ one }) => ({
  sender: one(flowpayUsers, {
    fields: [flowpayPaymentPlans.senderId],
    references: [flowpayUsers.userId],
    relationName: 'sender',
  }),
  recipient: one(flowpayUsers, {
    fields: [flowpayPaymentPlans.recipientId],
    references: [flowpayUsers.userId],
    relationName: 'recipient',
  }),
}));

export type FlowpayUser = typeof flowpayUsers.$inferSelect;
export type FlowpayTransaction = typeof flowpayTransactions.$inferSelect;
export type FlowpayPaymentPlan = typeof flowpayPaymentPlans.$inferSelect;
export type FlowpaySmartRoute = typeof flowpaySmartRoutes.$inferSelect;
export type FlowpayPaymentLink = typeof flowpayPaymentLinks.$inferSelect;
