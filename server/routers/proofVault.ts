/**
 * Proof Vault tRPC Router
 * Handles proof of ownership and verified documentation across registries
 */

import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as proofVaultDb from '../db.proofVault';

export const proofVaultRouter = router({
  /**
   * Create a new proof vault entry
   */
  create: protectedProcedure
    .input(
      z.object({
        category: z.enum(['discogs', 'usco', 'bmi_mlc', 'soundexchange']),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        documentUrl: z.string().url().optional(),
        registryId: z.string().optional(),
        metadata: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return proofVaultDb.createProofVaultEntry({
        userId: ctx.user.id,
        category: input.category,
        title: input.title,
        description: input.description,
        documentUrl: input.documentUrl,
        registryId: input.registryId,
        metadata: input.metadata,
        verificationStatus: 'pending',
      });
    }),

  /**
   * Get all proof vault entries for the current user
   */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return proofVaultDb.getProofVaultByUserId(ctx.user.id);
  }),

  /**
   * Get proof vault entries by category
   */
  getByCategory: protectedProcedure
    .input(z.enum(['discogs', 'usco', 'bmi_mlc', 'soundexchange']))
    .query(async ({ ctx, input }) => {
      return proofVaultDb.getProofVaultByCategory(ctx.user.id, input);
    }),

  /**
   * Search proof vault entries
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        category: z.enum(['discogs', 'usco', 'bmi_mlc', 'soundexchange']).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Simple client-side filtering since MySQL doesn't have full-text search configured
      const entries = await proofVaultDb.getProofVaultByUserId(ctx.user.id);
      return entries.filter(
        (entry) =>
          entry.title.toLowerCase().includes(input.query.toLowerCase()) &&
          (!input.category || entry.category === input.category)
      );
    }),

  /**
   * Get a specific proof vault entry
   */
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const entry = await proofVaultDb.getProofVaultById(input);
      if (!entry || entry.userId !== ctx.user.id) {
        throw new Error('Entry not found or access denied');
      }
      return entry;
    }),

  /**
   * Update a proof vault entry
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        documentUrl: z.string().url().optional(),
        verificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const entry = await proofVaultDb.getProofVaultById(input.id);
      if (!entry || entry.userId !== ctx.user.id) {
        throw new Error('Entry not found or access denied');
      }
      return proofVaultDb.updateProofVaultEntry(input.id, {
        title: input.title,
        description: input.description,
        documentUrl: input.documentUrl,
        verificationStatus: input.verificationStatus,
      });
    }),

  /**
   * Delete a proof vault entry
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const entry = await proofVaultDb.getProofVaultById(input);
      if (!entry || entry.userId !== ctx.user.id) {
        throw new Error('Entry not found or access denied');
      }
      return proofVaultDb.deleteProofVaultEntry(input);
    }),

  /**
   * Get verified proof vault entries
   */
  getVerified: protectedProcedure.query(async ({ ctx }) => {
    return proofVaultDb.getVerifiedProofVault(ctx.user.id);
  }),

  /**
   * Get proof vault statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    return proofVaultDb.getProofVaultStats(ctx.user.id);
  }),
});
