/**
 * QUMUS Orchestration tRPC Router
 * 
 * Exposes decision orchestration, propagation, and audit trail functionality
 * through tRPC procedures for frontend consumption.
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { qumusEngine, DecisionPolicy, Platform } from "../qumus/decisionEngine";
import { propagationService } from "../qumus/propagationService";
import { auditTrailManager } from "../qumus/auditTrail";

export const qumusOrchestrationRouter = router({
  /**
   * Make a new QUMUS decision
   * Propagates uniformly across all specified platforms
   */
  makeDecision: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        reason: z.string().min(10),
        payload: z.record(z.string(), z.any()),
        affectedPlatforms: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const decision = await qumusEngine.makeDecision(
          input.policyId as any as DecisionPolicy,
          ctx.user.id,
          input.reason,
          input.payload,
          input.affectedPlatforms ? (input.affectedPlatforms as Platform[]) : undefined
        );

        // Log the decision
        auditTrailManager.logDecisionExecution(decision, ctx.user.id, "success", {
          policyId: input.policyId,
          reason: input.reason,
        });

        // Propagate decision uniformly
        const propagated = await propagationService.propagateDecision(decision);

        return {
          success: true,
          decisionId: decision.decisionId,
          status: decision.status,
          severity: decision.severity,
          autonomyLevel: decision.metadata.autonomyLevel,
          confidence: decision.metadata.confidence,
          propagated,
          timestamp: decision.timestamp,
        };
      } catch (error) {
        auditTrailManager.logEntry({
          timestamp: new Date(),
          decisionId: "",
          userId: ctx.user.id,
          action: "decision_failed",
          platform: input.affectedPlatforms?.join(",") || "unknown",
          details: {
            policy: input.policyId,
            error: error instanceof Error ? error.message : String(error),
          },
          status: "failure",
        });

        throw error;
      }
    }),

  /**
   * Get decision details
   */
  getDecision: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const decision = qumusEngine.getDecision(input.decisionId);

      if (!decision) {
        return null;
      }

      return {
        decisionId: decision.decisionId,
        policyId: decision.policyId,
        status: decision.status,
        severity: decision.severity,
        timestamp: decision.timestamp,
        reason: decision.reason,
        affectedPlatforms: decision.affectedPlatforms,
        autonomyLevel: decision.metadata.autonomyLevel,
        confidence: decision.metadata.confidence,
        tags: decision.metadata.tags,
      };
    }),

  /**
   * Get decision actions (propagated changes)
   */
  getDecisionActions: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const actions = qumusEngine.getDecisionActions(input.decisionId);

      return actions.map((action) => ({
        actionId: action.actionId,
        platform: action.platform,
        actionType: action.actionType,
        status: action.status,
        result: action.result,
        timestamp: action.timestamp,
      }));
    }),

  /**
   * Get propagation status
   */
  getPropagationStatus: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const status = propagationService.getPropagationStatus(input.decisionId);

      return {
        decisionId: status.decision?.decisionId,
        status: status.status,
        actions: status.actions.map((a) => ({
          actionId: a.actionId,
          platform: a.platform,
          status: a.status,
        })),
      };
    }),

  /**
   * Rollback a decision
   */
  rollbackDecision: protectedProcedure
    .input(z.object({ decisionId: z.string(), reason: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const decision = qumusEngine.getDecision(input.decisionId);

      if (!decision) {
        throw new Error(`Decision not found: ${input.decisionId}`);
      }

      await qumusEngine.rollbackDecision(input.decisionId, ctx.user.id);
      await propagationService.rollbackPropagation(input.decisionId);
      auditTrailManager.logDecisionRollback(decision, ctx.user.id, input.reason);

      return {
        success: true,
        decisionId: input.decisionId,
        status: "rolled_back",
      };
    }),

  /**
   * Get decisions by policy
   */
  getDecisionsByPolicy: protectedProcedure
    .input(z.object({ policyId: z.string() }))
    .query(({ input }) => {
      const decisions = qumusEngine.getDecisionsByPolicy(input.policyId as DecisionPolicy);

      return decisions.map((d) => ({
        decisionId: d.decisionId,
        status: d.status,
        severity: d.severity,
        timestamp: d.timestamp,
        autonomyLevel: d.metadata.autonomyLevel,
      }));
    }),

  /**
   * Get audit trail for decision
   */
  getAuditTrail: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const audit = auditTrailManager.getDecisionAudit(input.decisionId);

      return audit.map((entry) => ({
        entryId: entry.entryId,
        timestamp: entry.timestamp,
        action: entry.action,
        status: entry.status,
        details: entry.details,
      }));
    }),

  /**
   * Get user's audit trail
   */
  getUserAuditTrail: protectedProcedure.query(({ ctx }) => {
    const audit = auditTrailManager.getUserAudit(ctx.user.id);

    return audit.map((entry) => ({
      entryId: entry.entryId,
      timestamp: entry.timestamp,
      decisionId: entry.decisionId,
      action: entry.action,
      status: entry.status,
    }));
  }),

  /**
   * Generate compliance report
   */
  generateComplianceReport: protectedProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .query(({ input }) => {
      const report = auditTrailManager.generateComplianceReport(input.startDate, input.endDate);

      return {
        reportId: report.reportId,
        generatedAt: report.generatedAt,
        period: {
          start: report.period.start,
          end: report.period.end,
        },
        totalDecisions: report.totalDecisions,
        decisionsByPolicy: report.decisionsByPolicy,
        decisionsBySeverity: report.decisionsBySeverity,
        failureRate: report.failureRate,
        criticalDecisions: report.criticalDecisions.length,
      };
    }),

  /**
   * Replay decision execution for debugging
   */
  replayDecision: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(({ input }) => {
      const audit = auditTrailManager.replayDecision(input.decisionId);

      return audit.map((entry) => ({
        timestamp: entry.timestamp,
        action: entry.action,
        status: entry.status,
        details: entry.details,
      }));
    }),

  /**
   * Export audit log as JSON
   */
  exportAuditLogJSON: protectedProcedure
    .input(z.object({ decisionId: z.string().optional() }))
    .query(({ input }) => {
      const json = auditTrailManager.exportAuditLog(input.decisionId);
      return { data: json, format: "json" };
    }),

  /**
   * Export audit log as CSV
   */
  exportAuditLogCSV: protectedProcedure
    .input(z.object({ decisionId: z.string().optional() }))
    .query(({ input }) => {
      const csv = auditTrailManager.exportAuditLogCSV(input.decisionId);
      return { data: csv, format: "csv" };
    }),

  /**
   * Get decision statistics
   */
  getDecisionStatistics: protectedProcedure.query(() => {
    const policies = Object.values(DecisionPolicy);
    const stats: Record<string, any> = {};

    for (const policy of policies) {
      const decisions = qumusEngine.getDecisionsByPolicy(policy as DecisionPolicy);
      stats[policy] = {
        total: decisions.length,
        completed: decisions.filter((d) => d.status === "completed").length,
        failed: decisions.filter((d) => d.status === "failed").length,
        avgAutonomy: decisions.length > 0 ? decisions.reduce((sum, d) => sum + d.metadata.autonomyLevel, 0) / decisions.length : 0,
      };
    }

    return stats;
  }),
});
