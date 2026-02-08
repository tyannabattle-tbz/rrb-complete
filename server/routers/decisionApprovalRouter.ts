/**
 * Decision Approval Workflow Router
 * Manages the approval process for autonomous decisions requiring human oversight
 */

import { router, protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';

// In-memory approval queue (will be replaced with database)
const approvalQueue: any[] = [];
const approvalHistory: any[] = [];

export const decisionApprovalRouter = router({
  /**
   * Get pending approvals for admin
   */
  getPendingApprovals: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50).optional(),
        offset: z.number().default(0).optional(),
        subsystem: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      })
    )
    .query(({ input }) => {
      let filtered = approvalQueue.filter((item) => item.status === 'pending');

      if (input.subsystem) {
        filtered = filtered.filter((item) => item.subsystem === input.subsystem);
      }

      if (input.priority) {
        filtered = filtered.filter((item) => item.priority === input.priority);
      }

      const sorted = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const paginated = sorted.slice(input.offset, input.offset + (input.limit || 50));

      return {
        approvals: paginated,
        total: filtered.length,
        pending: filtered.filter((item) => item.status === 'pending').length,
        approved: filtered.filter((item) => item.status === 'approved').length,
        rejected: filtered.filter((item) => item.status === 'rejected').length,
      };
    }),

  /**
   * Get approval details
   */
  getApprovalDetails: adminProcedure
    .input(z.object({ approvalId: z.string() }))
    .query(({ input }) => {
      const approval = approvalQueue.find((item) => item.id === input.approvalId);

      if (!approval) {
        throw new Error('Approval not found');
      }

      return {
        ...approval,
        history: approvalHistory.filter((h) => h.approvalId === input.approvalId),
      };
    }),

  /**
   * Approve a decision
   */
  approveDecision: adminProcedure
    .input(
      z.object({
        approvalId: z.string(),
        reason: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const approval = approvalQueue.find((item) => item.id === input.approvalId);

      if (!approval) {
        throw new Error('Approval not found');
      }

      if (approval.status !== 'pending') {
        throw new Error('Approval is no longer pending');
      }

      // Update approval status
      approval.status = 'approved';
      approval.approvedBy = ctx.user?.email;
      approval.approvedAt = new Date();
      approval.approvalReason = input.reason;
      approval.approvalNotes = input.notes;

      // Add to history
      approvalHistory.push({
        id: `history-${Date.now()}`,
        approvalId: input.approvalId,
        action: 'approved',
        approvedBy: ctx.user?.email,
        timestamp: new Date(),
        reason: input.reason,
        notes: input.notes,
      });

      console.log(`[ApprovalRouter] Decision approved: ${input.approvalId}`);

      return {
        success: true,
        approval,
      };
    }),

  /**
   * Reject a decision
   */
  rejectDecision: adminProcedure
    .input(
      z.object({
        approvalId: z.string(),
        reason: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const approval = approvalQueue.find((item) => item.id === input.approvalId);

      if (!approval) {
        throw new Error('Approval not found');
      }

      if (approval.status !== 'pending') {
        throw new Error('Approval is no longer pending');
      }

      // Update approval status
      approval.status = 'rejected';
      approval.rejectedBy = ctx.user?.email;
      approval.rejectedAt = new Date();
      approval.rejectionReason = input.reason;
      approval.rejectionNotes = input.notes;

      // Add to history
      approvalHistory.push({
        id: `history-${Date.now()}`,
        approvalId: input.approvalId,
        action: 'rejected',
        rejectedBy: ctx.user?.email,
        timestamp: new Date(),
        reason: input.reason,
        notes: input.notes,
      });

      console.log(`[ApprovalRouter] Decision rejected: ${input.approvalId}`);

      return {
        success: true,
        approval,
      };
    }),

  /**
   * Request additional information
   */
  requestMoreInfo: adminProcedure
    .input(
      z.object({
        approvalId: z.string(),
        question: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const approval = approvalQueue.find((item) => item.id === input.approvalId);

      if (!approval) {
        throw new Error('Approval not found');
      }

      // Add info request to history
      approvalHistory.push({
        id: `history-${Date.now()}`,
        approvalId: input.approvalId,
        action: 'info_requested',
        requestedBy: ctx.user?.email,
        timestamp: new Date(),
        question: input.question,
      });

      console.log(`[ApprovalRouter] Info requested for: ${input.approvalId}`);

      return {
        success: true,
        approval,
      };
    }),

  /**
   * Get approval statistics
   */
  getApprovalStats: adminProcedure.query(() => {
    const total = approvalQueue.length;
    const pending = approvalQueue.filter((item) => item.status === 'pending').length;
    const approved = approvalQueue.filter((item) => item.status === 'approved').length;
    const rejected = approvalQueue.filter((item) => item.status === 'rejected').length;

    // Calculate average approval time
    const completedApprovals = approvalQueue.filter(
      (item) => item.status === 'approved' || item.status === 'rejected'
    );

    const avgApprovalTime =
      completedApprovals.length > 0
        ? completedApprovals.reduce((sum, item) => {
            const createdTime = new Date(item.createdAt).getTime();
            const completedTime = item.approvedAt || item.rejectedAt;
            return sum + (new Date(completedTime).getTime() - createdTime);
          }, 0) / completedApprovals.length
        : 0;

    // Get breakdown by subsystem
    const subsystemBreakdown: Record<string, number> = {};
    approvalQueue.forEach((item) => {
      subsystemBreakdown[item.subsystem] = (subsystemBreakdown[item.subsystem] || 0) + 1;
    });

    // Get breakdown by priority
    const priorityBreakdown: Record<string, number> = {};
    approvalQueue.forEach((item) => {
      priorityBreakdown[item.priority] = (priorityBreakdown[item.priority] || 0) + 1;
    });

    return {
      total,
      pending,
      approved,
      rejected,
      approvalRate: total > 0 ? ((approved / total) * 100).toFixed(1) : '0',
      rejectionRate: total > 0 ? ((rejected / total) * 100).toFixed(1) : '0',
      avgApprovalTime: Math.round(avgApprovalTime / 1000), // Convert to seconds
      subsystemBreakdown,
      priorityBreakdown,
    };
  }),

  /**
   * Get approval history for a decision
   */
  getApprovalHistory: adminProcedure
    .input(z.object({ approvalId: z.string() }))
    .query(({ input }) => {
      const history = approvalHistory.filter((h) => h.approvalId === input.approvalId);

      return {
        history: history.sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
      };
    }),

  /**
   * Bulk approve decisions
   */
  bulkApproveDecisions: adminProcedure
    .input(
      z.object({
        approvalIds: z.array(z.string()),
        reason: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const results = {
        approved: 0,
        failed: 0,
        errors: [] as string[],
      };

      input.approvalIds.forEach((approvalId) => {
        try {
          const approval = approvalQueue.find((item) => item.id === approvalId);

          if (!approval) {
            results.errors.push(`Approval ${approvalId} not found`);
            results.failed++;
            return;
          }

          if (approval.status !== 'pending') {
            results.errors.push(`Approval ${approvalId} is no longer pending`);
            results.failed++;
            return;
          }

          approval.status = 'approved';
          approval.approvedBy = ctx.user?.email;
          approval.approvedAt = new Date();
          approval.approvalReason = input.reason;

          approvalHistory.push({
            id: `history-${Date.now()}`,
            approvalId: approvalId,
            action: 'approved',
            approvedBy: ctx.user?.email,
            timestamp: new Date(),
            reason: input.reason,
          });

          results.approved++;
        } catch (error) {
          results.errors.push(`Error approving ${approvalId}: ${error}`);
          results.failed++;
        }
      });

      console.log(`[ApprovalRouter] Bulk approved ${results.approved} decisions`);

      return results;
    }),
});
