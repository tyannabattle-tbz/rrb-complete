/**
 * QUMUS Audit Trail Router
 * Provides comprehensive audit trail and compliance logging for autonomous decisions
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

// In-memory audit trail storage (will be replaced with database)
const auditTrailStore: any[] = [];
const complianceLogStore: any[] = [];

export const auditTrailRouter = router({
  /**
   * Log an audit trail entry for a decision
   */
  logDecision: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        action: z.enum(['created', 'approved', 'rejected', 'executed', 'escalated', 'modified']),
        previousState: z.record(z.any()).optional(),
        newState: z.record(z.any()).optional(),
        reason: z.string().optional(),
        complianceNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const auditEntry = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        decisionId: input.decisionId,
        action: input.action,
        userId: ctx.user?.id?.toString() || 'system',
        userEmail: ctx.user?.email || 'system@qumus.ai',
        userName: ctx.user?.name || 'System',
        previousState: input.previousState,
        newState: input.newState,
        reason: input.reason,
        complianceNotes: input.complianceNotes,
        ipAddress: ctx.req?.ip || 'unknown',
        userAgent: ctx.req?.headers?.['user-agent'] || 'unknown',
        timestamp: new Date(),
      };

      auditTrailStore.push(auditEntry);

      return {
        success: true,
        auditEntry,
      };
    }),

  /**
   * Get audit trail for a specific decision
   */
  getDecisionAuditTrail: publicProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const trail = auditTrailStore.filter((entry) => entry.decisionId === input.decisionId);
      return {
        decisionId: input.decisionId,
        entries: trail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        totalEntries: trail.length,
      };
    }),

  /**
   * Get all audit trail entries
   */
  getAllAuditTrail: publicProcedure
    .input(
      z.object({
        limit: z.number().default(100).optional(),
        offset: z.number().default(0).optional(),
        action: z.string().optional(),
        userId: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...auditTrailStore];

      if (input.action) {
        filtered = filtered.filter((entry) => entry.action === input.action);
      }

      if (input.userId) {
        filtered = filtered.filter((entry) => entry.userId === input.userId);
      }

      const sorted = filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const paginated = sorted.slice(input.offset, input.offset + (input.limit || 100));

      return {
        entries: paginated,
        total: sorted.length,
        limit: input.limit || 100,
        offset: input.offset || 0,
      };
    }),

  /**
   * Log compliance information for a decision
   */
  logCompliance: protectedProcedure
    .input(
      z.object({
        decisionId: z.string(),
        complianceStatus: z.enum(['compliant', 'warning', 'violation', 'pending_review']),
        regulatoryFramework: z.string().optional(),
        violationDetails: z.string().optional(),
        remediationRequired: z.boolean().optional(),
        remediationDeadline: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const complianceEntry = {
        id: `compliance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        decisionId: input.decisionId,
        complianceStatus: input.complianceStatus,
        regulatoryFramework: input.regulatoryFramework,
        violationDetails: input.violationDetails,
        remediationRequired: input.remediationRequired ? 1 : 0,
        remediationDeadline: input.remediationDeadline,
        reviewedBy: ctx.user?.id?.toString() || 'system',
        reviewedAt: new Date(),
        timestamp: new Date(),
      };

      complianceLogStore.push(complianceEntry);

      return {
        success: true,
        complianceEntry,
      };
    }),

  /**
   * Get compliance log for a decision
   */
  getComplianceLog: publicProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const log = complianceLogStore.filter((entry) => entry.decisionId === input.decisionId);
      return {
        decisionId: input.decisionId,
        entries: log.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
        totalEntries: log.length,
      };
    }),

  /**
   * Get compliance violations
   */
  getComplianceViolations: publicProcedure
    .input(
      z.object({
        limit: z.number().default(50).optional(),
        regulatoryFramework: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let violations = complianceLogStore.filter((entry) => entry.complianceStatus === 'violation');

      if (input.regulatoryFramework) {
        violations = violations.filter((entry) => entry.regulatoryFramework === input.regulatoryFramework);
      }

      const sorted = violations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      const paginated = sorted.slice(0, input.limit || 50);

      return {
        violations: paginated,
        total: sorted.length,
        limit: input.limit || 50,
      };
    }),

  /**
   * Get audit trail statistics
   */
  getAuditStatistics: publicProcedure.query(() => {
    const actionCounts: Record<string, number> = {};
    const userCounts: Record<string, number> = {};

    auditTrailStore.forEach((entry) => {
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
      userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
    });

    const complianceStatus: Record<string, number> = {};
    complianceLogStore.forEach((entry) => {
      complianceStatus[entry.complianceStatus] = (complianceStatus[entry.complianceStatus] || 0) + 1;
    });

    return {
      totalAuditEntries: auditTrailStore.length,
      totalComplianceEntries: complianceLogStore.length,
      actionBreakdown: actionCounts,
      userBreakdown: userCounts,
      complianceStatusBreakdown: complianceStatus,
      violationCount: complianceLogStore.filter((e) => e.complianceStatus === 'violation').length,
      warningCount: complianceLogStore.filter((e) => e.complianceStatus === 'warning').length,
      compliantCount: complianceLogStore.filter((e) => e.complianceStatus === 'compliant').length,
    };
  }),

  /**
   * Export audit trail as CSV
   */
  exportAuditTrail: protectedProcedure
    .input(
      z.object({
        format: z.enum(['csv', 'json']).default('csv'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(({ input }) => {
      let filtered = [...auditTrailStore];

      if (input.startDate) {
        const start = new Date(input.startDate);
        filtered = filtered.filter((entry) => new Date(entry.timestamp) >= start);
      }

      if (input.endDate) {
        const end = new Date(input.endDate);
        filtered = filtered.filter((entry) => new Date(entry.timestamp) <= end);
      }

      if (input.format === 'json') {
        return {
          format: 'json',
          data: filtered,
          count: filtered.length,
        };
      }

      // CSV format
      const headers = ['ID', 'Decision ID', 'Action', 'User', 'Email', 'Reason', 'Timestamp'];
      const rows = filtered.map((entry) => [
        entry.id,
        entry.decisionId,
        entry.action,
        entry.userName,
        entry.userEmail,
        entry.reason || '',
        entry.timestamp,
      ]);

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

      return {
        format: 'csv',
        data: csv,
        count: filtered.length,
      };
    }),
});
