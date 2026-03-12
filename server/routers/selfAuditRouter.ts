/**
 * QUMUS Self-Audit Router
 * Exposes self-audit status, reports, and admin controls via tRPC
 */
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  getLastReport,
  getCorrectionHistory,
  getAuditStatus,
  setAuditEnabled,
  setAutoCorrectEnabled,
  triggerManualAudit,
} from "../services/qumusSelfAudit";

export const selfAuditRouter = router({
  // Get current audit status
  status: publicProcedure.query(() => {
    return getAuditStatus();
  }),

  // Get the last audit report
  lastReport: publicProcedure.query(() => {
    return getLastReport();
  }),

  // Get auto-correction history
  correctionHistory: publicProcedure.query(() => {
    return getCorrectionHistory();
  }),

  // Trigger a manual audit (admin only)
  triggerAudit: protectedProcedure.mutation(async () => {
    const report = await triggerManualAudit();
    return report;
  }),

  // Toggle audit enabled/disabled (admin only)
  setEnabled: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(({ input }) => {
      setAuditEnabled(input.enabled);
      return { success: true, enabled: input.enabled };
    }),

  // Toggle auto-correct enabled/disabled (admin only)
  setAutoCorrect: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(({ input }) => {
      setAutoCorrectEnabled(input.enabled);
      return { success: true, enabled: input.enabled };
    }),
});
