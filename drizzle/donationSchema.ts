/**
 * Donation Tiers Schema
 * Manages donation tiers and donor tracking
 */

import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, decimal, index } from 'drizzle-orm/mysql-core';

export const donationTiers = mysqlTable('donation_tiers', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(), // Supporter, Champion, Benefactor
  description: text('description'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(), // $5, $25, $100
  currency: varchar('currency', { length: 3 }).default('USD').notNull(),
  benefits: text('benefits'), // JSON array of benefits
  stripeProductId: varchar('stripeProductId', { length: 255 }),
  stripePriceId: varchar('stripePriceId', { length: 255 }),
  isActive: int('isActive').default(1),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type DonationTier = typeof donationTiers.$inferSelect;
export type InsertDonationTier = typeof donationTiers.$inferInsert;

export const donations = mysqlTable(
  'donations',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId').notNull(),
    tierId: int('tierId').notNull(),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 3 }).default('USD').notNull(),
    stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),
    stripeCustomerId: varchar('stripeCustomerId', { length: 255 }),
    status: mysqlEnum('status', [
      'pending',
      'completed',
      'failed',
      'refunded',
    ])
      .default('pending')
      .notNull(),
    isRecurring: int('isRecurring').default(0),
    stripeSubscriptionId: varchar('stripeSubscriptionId', { length: 255 }),
    nextBillingDate: timestamp('nextBillingDate'),
    donorName: varchar('donorName', { length: 255 }),
    donorEmail: varchar('donorEmail', { length: 320 }),
    message: text('message'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('donations_user_id_idx').on(table.userId),
    statusIdx: index('donations_status_idx').on(table.status),
    stripePaymentIntentIdx: index('donations_stripe_payment_intent_idx').on(
      table.stripePaymentIntentId
    ),
  })
);

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;
