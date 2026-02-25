/**
 * Proof Vault Schema
 * Stores verified documentation and proof of ownership across multiple registries
 */

import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, index } from 'drizzle-orm/mysql-core';

export const proofVault = mysqlTable(
  'proof_vault',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId').notNull(),
    category: mysqlEnum('category', [
      'discogs',
      'usco',
      'bmi_mlc',
      'soundexchange',
    ]).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    documentUrl: varchar('documentUrl', { length: 2048 }),
    verificationStatus: mysqlEnum('verificationStatus', [
      'pending',
      'verified',
      'rejected',
    ])
      .default('pending')
      .notNull(),
    registryId: varchar('registryId', { length: 255 }),
    metadata: text('metadata'), // JSON string for category-specific data
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('proof_vault_user_id_idx').on(table.userId),
    categoryIdx: index('proof_vault_category_idx').on(table.category),
    statusIdx: index('proof_vault_status_idx').on(table.verificationStatus),
  })
);

export type ProofVault = typeof proofVault.$inferSelect;
export type InsertProofVault = typeof proofVault.$inferInsert;

/**
 * Category-specific metadata types
 */
export interface DiscogsMetadata {
  artistName: string;
  releaseTitle: string;
  catalogNumber: string;
  releaseYear: number;
}

export interface USCOMetadata {
  workTitle: string;
  registrationNumber: string;
  claimantName: string;
  registrationDate: string;
}

export interface BMIMLCMetadata {
  workTitle: string;
  affiliationNumber: string;
  performerName: string;
  iswcCode?: string;
}

export interface SoundExchangeMetadata {
  soundRecordingTitle: string;
  isrcCode: string;
  labelName: string;
  releaseDate: string;
}
