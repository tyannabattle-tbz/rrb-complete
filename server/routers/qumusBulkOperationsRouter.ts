/**
 * QUMUS Bulk Operations tRPC Router
 * 
 * Provides procedures for:
 * - Loading pending decisions
 * - Bulk approve/reject operations
 * - Category-based operations
 * - Policy application
 * - Operation status tracking
 */

import { router, publicProcedure } from '@/server/_core/trpc';
import { qumusBulkOperations } from '@/server/services/qumus-bulk-operations';
import { z } from 'zod';

export const qumusBulkOperationsRouter = router({
  /**
   * Load all pending QUMUS decisions
   */
  getPendingDecisions: publicProcedure.query(async () => {
    const decisions = await qumusBulkOperations.loadPendingDecisions();
    return {
      total: decisions.length,
      decisions: decisions.slice(0, 50), // Return first 50 for preview
      summary: qumusBulkOperations.getSummary(),
    };
  }),

  /**
   * Approve all pending decisions
   */
  approveAll: publicProcedure.mutation(async () => {
    const operation = await qumusBulkOperations.approveAll();
    return {
      operationId: operation.id,
      status: operation.status,
      results: operation.results,
      duration: (operation.endTime || Date.now()) - operation.startTime,
    };
  }),

  /**
   * Reject all pending decisions
   */
  rejectAll: publicProcedure.mutation(async () => {
    const operation = await qumusBulkOperations.rejectAll();
    return {
      operationId: operation.id,
      status: operation.status,
      results: operation.results,
      duration: (operation.endTime || Date.now()) - operation.startTime,
    };
  }),

  /**
   * Approve decisions by category
   */
  approveByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .mutation(async ({ input }) => {
      const operation = await qumusBulkOperations.approveByCategory(input.category);
      return {
        operationId: operation.id,
        category: operation.category,
        status: operation.status,
        results: operation.results,
        duration: (operation.endTime || Date.now()) - operation.startTime,
      };
    }),

  /**
   * Apply policy to matching decisions
   */
  applyPolicy: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .mutation(async ({ input }) => {
      const operation = await qumusBulkOperations.applyPolicy(input.policyId);
      return {
        operationId: operation.id,
        policyId: operation.policyId,
        status: operation.status,
        results: operation.results,
        duration: (operation.endTime || Date.now()) - operation.startTime,
      };
    }),

  /**
   * Get operation status
   */
  getOperationStatus: publicProcedure
    .input(z.object({ operationId: z.string() }))
    .query(({ input }) => {
      const operation = qumusBulkOperations.getOperationStatus(input.operationId);
      if (!operation) {
        return { error: 'Operation not found' };
      }
      return {
        id: operation.id,
        type: operation.type,
        status: operation.status,
        progress: {
          processed: operation.processedItems,
          total: operation.totalItems,
          percentage: Math.round((operation.processedItems / operation.totalItems) * 100),
        },
        results: operation.results,
        duration: (operation.endTime || Date.now()) - operation.startTime,
      };
    }),

  /**
   * Get all active operations
   */
  getActiveOperations: publicProcedure.query(() => {
    const operations = qumusBulkOperations.getActiveOperations();
    return {
      total: operations.length,
      operations: operations.map(op => ({
        id: op.id,
        type: op.type,
        status: op.status,
        progress: {
          processed: op.processedItems,
          total: op.totalItems,
          percentage: Math.round((op.processedItems / op.totalItems) * 100),
        },
        results: op.results,
      })),
    };
  }),

  /**
   * Get summary of pending decisions
   */
  getSummary: publicProcedure.query(() => {
    return qumusBulkOperations.getSummary();
  }),
});
