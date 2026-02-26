import { router, protectedProcedure, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
// Database imports handled within procedures

export const adminPoliciesRouter = router({
  /**
   * Get all policy decisions with optional filtering
   */
  getPolicyDecisions: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        policyId: z.string().optional(),
        decision: z.enum(['approve', 'deny', 'review']).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = 'SELECT * FROM policy_decisions WHERE 1=1';
        const params: any[] = [];

        if (input.policyId) {
          query += ' AND policyId = ?';
          params.push(input.policyId);
        }

        if (input.decision) {
          query += ' AND decision = ?';
          params.push(input.decision);
        }

        if (input.startDate) {
          query += ' AND timestamp >= ?';
          params.push(input.startDate);
        }

        if (input.endDate) {
          query += ' AND timestamp <= ?';
          params.push(input.endDate);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(input.limit, input.offset);

        const decisions = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM policy_decisions WHERE 1=1';
        const countParams: any[] = [];

        if (input.policyId) {
          countQuery += ' AND policyId = ?';
          countParams.push(input.policyId);
        }

        if (input.decision) {
          countQuery += ' AND decision = ?';
          countParams.push(input.decision);
        }

        if (input.startDate) {
          countQuery += ' AND timestamp >= ?';
          countParams.push(input.startDate);
        }

        if (input.endDate) {
          countQuery += ' AND timestamp <= ?';
          countParams.push(input.endDate);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        return {
          decisions: decisions.map((d: any) => ({
            id: d.id,
            policyId: d.policyId,
            decision: d.decision,
            confidence: d.confidence,
            timestamp: new Date(d.timestamp),
            action: d.action,
            requiresHumanReview: Boolean(d.requiresHumanReview),
            reason: d.reason,
            userId: d.userId,
          })),
          total,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error('Failed to get policy decisions:', error);
        throw error;
      }
    }),

  /**
   * Get human review queue
   */
  getHumanReviewQueue: adminProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        status: z.enum(['pending', 'approved', 'denied']).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = 'SELECT * FROM human_reviews WHERE 1=1';
        const params: any[] = [];

        if (input.status) {
          query += ' AND status = ?';
          params.push(input.status);
        }

        query += ' ORDER BY createdAt DESC LIMIT ? OFFSET ?';
        params.push(input.limit, input.offset);

        const reviews = await db.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM human_reviews WHERE 1=1';
        const countParams: any[] = [];

        if (input.status) {
          countQuery += ' AND status = ?';
          countParams.push(input.status);
        }

        const countResult = await db.query(countQuery, countParams);
        const total = countResult[0]?.total || 0;

        return {
          reviews: reviews.map((r: any) => ({
            id: r.id,
            userId: r.userId,
            type: r.type,
            data: JSON.parse(r.data || '{}'),
            status: r.status,
            createdAt: new Date(r.createdAt),
            reviewedAt: r.reviewedAt ? new Date(r.reviewedAt) : null,
            reviewedBy: r.reviewedBy,
          })),
          total,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        console.error('Failed to get human review queue:', error);
        throw error;
      }
    }),

  /**
   * Get policy statistics
   */
  getPolicyStats: adminProcedure.query(async () => {
    try {
      const stats = await db.query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN decision = 'approve' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN decision = 'deny' THEN 1 ELSE 0 END) as denied,
          SUM(CASE WHEN decision = 'review' THEN 1 ELSE 0 END) as review,
          AVG(confidence) as avgConfidence,
          SUM(CASE WHEN requiresHumanReview = 1 THEN 1 ELSE 0 END) as requiresReview
        FROM policy_decisions
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
      );

      const result = stats[0] || {};

      return {
        total: result.total || 0,
        approved: result.approved || 0,
        denied: result.denied || 0,
        review: result.review || 0,
        avgConfidence: Math.round((result.avgConfidence || 0) * 100) / 100,
        requiresReview: result.requiresReview || 0,
      };
    } catch (error) {
      console.error('Failed to get policy stats:', error);
      throw error;
    }
  }),

  /**
   * Get confidence trends (24 hour)
   */
  getConfidenceTrends: adminProcedure.query(async () => {
    try {
      const trends = await db.query(
        `SELECT 
          DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
          AVG(confidence) as confidence,
          COUNT(*) as count
        FROM policy_decisions
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
        GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
        ORDER BY hour ASC`
      );

      return trends.map((t: any) => ({
        time: t.hour,
        confidence: Math.round(t.confidence * 100) / 100,
        count: t.count,
      }));
    } catch (error) {
      console.error('Failed to get confidence trends:', error);
      throw error;
    }
  }),

  /**
   * Approve human review
   */
  approveReview: adminProcedure
    .input(
      z.object({
        reviewId: z.string(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await db.query(
          'UPDATE human_reviews SET status = ?, reviewedAt = NOW(), reviewedBy = ? WHERE id = ?',
          ['approved', ctx.user.id, input.reviewId]
        );

        // Log action
        await db.insert('admin_actions').values({
          adminId: ctx.user.id,
          action: 'approve_review',
          targetId: input.reviewId,
          notes: input.notes || null,
          timestamp: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error('Failed to approve review:', error);
        throw error;
      }
    }),

  /**
   * Deny human review
   */
  denyReview: adminProcedure
    .input(
      z.object({
        reviewId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await db.query(
          'UPDATE human_reviews SET status = ?, reviewedAt = NOW(), reviewedBy = ?, denialReason = ? WHERE id = ?',
          ['denied', ctx.user.id, input.reason, input.reviewId]
        );

        // Log action
        await db.insert('admin_actions').values({
          adminId: ctx.user.id,
          action: 'deny_review',
          targetId: input.reviewId,
          notes: input.reason,
          timestamp: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error('Failed to deny review:', error);
        throw error;
      }
    }),

  /**
   * Override policy decision
   */
  overridePolicyDecision: adminProcedure
    .input(
      z.object({
        decisionId: z.string(),
        override: z.enum(['approve', 'deny']),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get original decision
        const decisions = await db.query('SELECT * FROM policy_decisions WHERE id = ?', [
          input.decisionId,
        ]);

        if (decisions.length === 0) {
          throw new Error('Decision not found');
        }

        const decision = decisions[0];

        // Create override record
        await db.insert('policy_overrides').values({
          decisionId: input.decisionId,
          originalDecision: decision.decision,
          overrideDecision: input.override,
          adminId: ctx.user.id,
          reason: input.reason,
          timestamp: new Date(),
        });

        // Update decision
        await db.query('UPDATE policy_decisions SET decision = ?, overridden = 1 WHERE id = ?', [
          input.override,
          input.decisionId,
        ]);

        // Log action
        await db.insert('admin_actions').values({
          adminId: ctx.user.id,
          action: 'override_decision',
          targetId: input.decisionId,
          notes: `Overridden from ${decision.decision} to ${input.override}: ${input.reason}`,
          timestamp: new Date(),
        });

        return { success: true };
      } catch (error) {
        console.error('Failed to override decision:', error);
        throw error;
      }
    }),

  /**
   * Get policy audit trail
   */
  getAuditTrail: adminProcedure
    .input(
      z.object({
        limit: z.number().default(100),
        offset: z.number().default(0),
        adminId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let query = 'SELECT * FROM admin_actions WHERE 1=1';
        const params: any[] = [];

        if (input.adminId) {
          query += ' AND adminId = ?';
          params.push(input.adminId);
        }

        query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
        params.push(input.limit, input.offset);

        const actions = await db.query(query, params);

        return actions.map((a: any) => ({
          id: a.id,
          adminId: a.adminId,
          action: a.action,
          targetId: a.targetId,
          notes: a.notes,
          timestamp: new Date(a.timestamp),
        }));
      } catch (error) {
        console.error('Failed to get audit trail:', error);
        throw error;
      }
    }),

  /**
   * Get policy performance metrics
   */
  getPolicyMetrics: adminProcedure.query(async () => {
    try {
      const metrics = await db.query(
        `SELECT 
          policyId,
          COUNT(*) as total,
          SUM(CASE WHEN decision = 'approve' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN decision = 'deny' THEN 1 ELSE 0 END) as denied,
          AVG(confidence) as avgConfidence,
          MIN(confidence) as minConfidence,
          MAX(confidence) as maxConfidence
        FROM policy_decisions
        WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY policyId
        ORDER BY total DESC`
      );

      return metrics.map((m: any) => ({
        policyId: m.policyId,
        total: m.total,
        approved: m.approved,
        denied: m.denied,
        avgConfidence: Math.round(m.avgConfidence * 100) / 100,
        minConfidence: Math.round(m.minConfidence * 100) / 100,
        maxConfidence: Math.round(m.maxConfidence * 100) / 100,
        approvalRate: m.total > 0 ? Math.round((m.approved / m.total) * 100) : 0,
      }));
    } catch (error) {
      console.error('Failed to get policy metrics:', error);
      throw error;
    }
  }),
});
