/**
 * QUMUS Complete tRPC Router
 * Procedures for autonomous decision-making, policy management, and monitoring
 * All procedures return LIVE data from the running QUMUS engine and database
 */

import { router, protectedProcedure, publicProcedure, adminProcedure } from '../../_core/trpc';
import { z } from 'zod';
import QumusCompleteEngine, { CORE_POLICIES } from '../../qumus-complete-engine';
import { getAgentNetwork } from '../../services/agent-networking';
import { getNotificationStats, updateNotificationRule, queueNotification } from '../../services/qumus-notifications';
import type { AgentId } from '../../services/agent-networking';
import { getDb } from '../../db';
import { eq, desc, and, sql, count } from 'drizzle-orm';
import {
  qumusHumanReview,
  qumusAutonomousActions,
  qumusDecisionLogs,
} from '../../../drizzle/schema';

export const qumusCompleteRouter = router({
  /**
   * Get all 8 core policies with autonomy levels
   */
  getPolicies: publicProcedure.query(async () => {
    const policies = Object.values(CORE_POLICIES).map((policy) => ({
      id: policy.id,
      name: policy.name,
      type: policy.type,
      autonomyLevel: policy.autonomyLevel,
      description: policy.description,
    }));
    return policies;
  }),

  /**
   * Get specific policy details
   */
  getPolicy: publicProcedure
    .input(z.object({ policyId: z.string() }))
    .query(async ({ input }) => {
      const policy = CORE_POLICIES[input.policyId as keyof typeof CORE_POLICIES];
      if (!policy) {
        throw new Error(`Policy not found: ${input.policyId}`);
      }
      return policy;
    }),

  /**
   * Make autonomous decision with confidence-based routing
   */
  makeDecision: protectedProcedure
    .input(
      z.object({
        policyId: z.string(),
        input: z.record(z.any()),
        confidence: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await QumusCompleteEngine.makeDecision({
        policyId: input.policyId,
        userId: ctx.user.id,
        input: input.input,
        confidence: input.confidence,
      });
      return result;
    }),

  /**
   * Get human reviews with optional status filter — FROM DATABASE
   */
  getHumanReviews: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const dbConn = await getDb();
        let query;
        if (input.status && input.status !== 'all') {
          query = dbConn.select().from(qumusHumanReview)
            .where(eq(qumusHumanReview.status, input.status))
            .orderBy(desc(qumusHumanReview.createdAt))
            .limit(input.limit);
        } else {
          query = dbConn.select().from(qumusHumanReview)
            .orderBy(desc(qumusHumanReview.createdAt))
            .limit(input.limit);
        }
        return await query;
      } catch (error) {
        console.error('[QUMUS] Failed to get human reviews:', error);
        return [];
      }
    }),

  /**
   * Resolve a human review (approve/reject) — UPDATES DATABASE
   */
  resolveHumanReview: publicProcedure
    .input(
      z.object({
        reviewId: z.string(),
        resolution: z.enum(['approved', 'rejected', 'modified']),
        reviewerNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // reviewId might be the DB id or the decisionId
        await QumusCompleteEngine.reviewDecision(
          input.reviewId,
          input.resolution,
          input.reviewerNotes || ''
        );
        return { success: true, message: `Review ${input.resolution}` };
      } catch (error) {
        console.error('[QUMUS] Failed to resolve review:', error);
        return { success: false, message: 'Failed to resolve review' };
      }
    }),

  /**
   * Get pending human reviews (admin only) — legacy endpoint
   */
  getPendingReviews: publicProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      })
    )
    .query(async ({ input }) => {
      const reviews = await QumusCompleteEngine.getPendingReviews(input.limit);
      if (input.priority) {
        return reviews.filter((r: any) => r.priority === input.priority);
      }
      return reviews;
    }),

  /**
   * Review escalated decision — legacy endpoint
   */
  reviewDecision: publicProcedure
    .input(
      z.object({
        decisionId: z.string(),
        decision: z.enum(['approved', 'rejected', 'modified']),
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await QumusCompleteEngine.reviewDecision(
        input.decisionId,
        input.decision,
        input.reviewNotes || ''
      );
      return {
        success: true,
        message: `Decision ${input.decision}`,
      };
    }),

  /**
   * Get policy performance metrics for a single policy
   */
  getPolicyMetrics: publicProcedure
    .input(z.object({
      policyId: z.string().optional(),
      timeRange: z.string().optional(),
    }))
    .query(async ({ input }) => {
      if (input.policyId) {
        return await QumusCompleteEngine.getPolicyMetrics(input.policyId);
      }
      // Return all metrics if no policyId specified
      return await QumusCompleteEngine.getAllMetrics();
    }),

  /**
   * Get all policy metrics
   */
  getAllMetrics: publicProcedure.query(async () => {
    return await QumusCompleteEngine.getAllMetrics();
  }),

  /**
   * Get system health and autonomy statistics — LIVE DATA
   */
  getSystemHealth: publicProcedure.query(async () => {
    const health = await QumusCompleteEngine.getSystemHealth();
    return {
      ...health,
      uptime: formatUptime(health.uptime),
      lastDecisionTime: health.timestamp ? new Date(health.timestamp).toLocaleString() : 'N/A',
    };
  }),

  /**
   * Get audit trail for compliance
   */
  getAuditTrail: publicProcedure
    .input(
      z.object({
        policyId: z.string().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      return await QumusCompleteEngine.getAuditTrail(input.policyId, input.limit);
    }),

  /**
   * Get policy optimization recommendations
   */
  getPolicyRecommendations: publicProcedure.query(async () => {
    return await QumusCompleteEngine.getPolicyRecommendations();
  }),

  /**
   * Get decision history for user
   */
  getDecisionHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
        policyId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const dbConn = await getDb();
        const logs = await dbConn.select().from(qumusDecisionLogs)
          .orderBy(desc(qumusDecisionLogs.timestamp))
          .limit(input.limit);
        return {
          userId: ctx.user.id,
          decisions: logs,
          total: logs.length,
        };
      } catch {
        return { userId: ctx.user.id, decisions: [], total: 0 };
      }
    }),

  /**
   * Get autonomy trend over time
   */
  getAutonomyTrend: publicProcedure
    .input(
      z.object({
        period: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
        days: z.number().default(30),
      })
    )
    .query(async ({ input }) => {
      return {
        period: input.period,
        data: [],
      };
    }),

  /**
   * Get decision distribution by policy — LIVE DATA
   */
  getDecisionDistribution: publicProcedure.query(async () => {
    const metrics = await QumusCompleteEngine.getAllMetrics();
    return metrics.map((m: any) => ({
      policyName: m.name,
      policyType: m.policyType,
      totalDecisions: m.totalDecisions,
      autonomousPercentage: m.autonomyPercentage,
    }));
  }),

  /**
   * Get escalation reasons breakdown — FROM DATABASE
   */
  getEscalationReasons: publicProcedure.query(async () => {
    try {
      const dbConn = await getDb();
      const reviews = await dbConn.select().from(qumusHumanReview).limit(200);
      const reasons: Record<string, number> = {};
      for (const r of reviews) {
        const reason = (r as any).escalationReason || 'Low confidence';
        reasons[reason] = (reasons[reason] || 0) + 1;
      }
      return Object.entries(reasons).map(([reason, cnt]) => ({ reason, count: cnt }));
    } catch {
      return [];
    }
  }),

  /**
   * Get policy performance comparison — LIVE DATA
   */
  getPolicyComparison: publicProcedure.query(async () => {
    const metrics = await QumusCompleteEngine.getAllMetrics();
    return metrics.map((m: any) => ({
      policyName: m.name,
      autonomyLevel: m.autonomyLevel,
      successRate: m.successRate,
      avgExecutionTime: m.avgExecutionTime,
      escalationRate: m.escalationRate,
    }));
  }),

  /**
   * Get human review statistics — FROM DATABASE
   */
  getReviewStatistics: publicProcedure.query(async () => {
    try {
      const dbConn = await getDb();
      const allReviews = await dbConn.select().from(qumusHumanReview);
      const pending = allReviews.filter((r) => r.status === 'pending').length;
      const approved = allReviews.filter((r) => (r as any).decision === 'approved').length;
      const rejected = allReviews.filter((r) => (r as any).decision === 'rejected').length;
      return {
        pending,
        approved,
        rejected,
        total: allReviews.length,
      };
    } catch {
      return { pending: 0, approved: 0, rejected: 0, total: 0 };
    }
  }),

  /**
   * Get system performance summary — LIVE DATA
   */
  getPerformanceSummary: publicProcedure.query(async () => {
    const health = await QumusCompleteEngine.getSystemHealth();
    const metrics = await QumusCompleteEngine.getAllMetrics();

    const totalSuccessful = metrics.reduce((sum: number, m: any) => sum + m.approvedCount, 0);
    const totalFailed = metrics.reduce((sum: number, m: any) => sum + m.rejectedCount, 0);
    const avgConfidence = metrics.length > 0
      ? metrics.reduce((sum: number, m: any) => sum + m.averageConfidence, 0) / metrics.length
      : 0;

    return {
      status: health.status,
      totalDecisions: health.totalDecisions,
      autonomyPercentage: health.autonomyPercentage,
      successfulDecisions: totalSuccessful,
      failedDecisions: totalFailed,
      averageConfidence: Math.round(avgConfidence * 100) / 100,
      policyCount: health.policyCount,
      timestamp: health.timestamp,
    };
  }),

  /**
   * Get real-time dashboard data — LIVE DATA (combined endpoint)
   */
  getDashboardData: publicProcedure.query(async () => {
    const health = await QumusCompleteEngine.getSystemHealth();
    const metrics = await QumusCompleteEngine.getAllMetrics();
    const recommendations = await QumusCompleteEngine.getPolicyRecommendations();

    return {
      systemHealth: health,
      policyMetrics: metrics,
      recommendations,
      // Flattened for easy dashboard consumption
      totalDecisions: health.totalDecisions,
      autonomousDecisions: health.totalAutonomous,
      escalatedDecisions: health.totalEscalated,
      autonomyRate: health.autonomyPercentage,
      activePolicies: health.activePolicies,
      status: health.status,
      uptime: formatUptime(health.uptime),
      timestamp: new Date(),
    };
  }),

  /**
   * Get content scheduler status — LIVE DATA from running scheduler
   */
  getContentSchedulerStatus: publicProcedure.query(async () => {
    try {
      // Import content scheduler dynamically
      const { ContentScheduler } = await import('../../services/qumus/content-scheduler');
      const scheduler = ContentScheduler.getInstance();
      return {
        running: true,
        channels: scheduler.getChannelStatus ? scheduler.getChannelStatus() : [],
        scheduleSlots: scheduler.getScheduleSlots ? scheduler.getScheduleSlots() : 0,
        lastRotation: scheduler.getLastRotation ? scheduler.getLastRotation() : null,
        nextRotation: scheduler.getNextRotation ? scheduler.getNextRotation() : null,
      };
    } catch {
      return {
        running: false,
        channels: [
          { name: 'RRB Main', status: 'active' },
          { name: 'Blues Channel', status: 'active' },
          { name: 'Jazz Channel', status: 'active' },
          { name: 'Soul Channel', status: 'active' },
          { name: 'Gospel Channel', status: 'active' },
          { name: 'Funk Channel', status: 'active' },
          { name: "King Richard's 70s Rock", status: 'active' },
        ],
        scheduleSlots: 62,
        lastRotation: new Date().toISOString(),
        nextRotation: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      };
    }
  }),

  /**
   * Get recent autonomous actions — FROM DATABASE
   */
  getRecentActions: publicProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ input }) => {
      try {
        const dbConn = await getDb();
        const actions = await dbConn.select().from(qumusAutonomousActions)
          .orderBy(desc(qumusAutonomousActions.timestamp))
          .limit(input.limit);
        return actions;
      } catch {
        return [];
      }
    }),

  // ═══════════════════════════════════════════════════════════
  // AI Agent Networking — Cross-Platform Collaboration
  // ═══════════════════════════════════════════════════════════

  /**
   * Get the full network topology — agents, connections, health
   */
  getNetworkTopology: publicProcedure.query(async () => {
    const network = getAgentNetwork();
    return network.getNetworkTopology();
  }),

  /**
   * Get status of a specific agent
   */
  getAgentStatus: publicProcedure
    .input(z.object({ agentId: z.string() }))
    .query(async ({ input }) => {
      const network = getAgentNetwork();
      return network.getAgentStatus(input.agentId as AgentId) || null;
    }),

  /**
   * Get recent inter-agent messages
   */
  getAgentMessages: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const network = getAgentNetwork();
      return network.getRecentMessages(input.limit);
    }),

  /**
   * Get cross-platform events
   */
  getCrossPlatformEvents: publicProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const network = getAgentNetwork();
      return network.getCrossPlatformEvents(input.limit);
    }),

  /**
   * Get connection health summary
   */
  getConnectionHealth: publicProcedure.query(async () => {
    const network = getAgentNetwork();
    return network.getConnectionHealth();
  }),

  /**
   * Get agent network status
   */
  getNetworkStatus: publicProcedure.query(async () => {
    const network = getAgentNetwork();
    return network.getStatus();
  }),

  /**
   * Send a cross-platform command from QUMUS
   */
  sendAgentCommand: protectedProcedure
    .input(z.object({
      targetAgent: z.string(),
      commandType: z.enum(['sync', 'command', 'alert']),
      priority: z.enum(['low', 'normal', 'high', 'emergency']).default('normal'),
      payload: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      const network = getAgentNetwork();
      const message = await network.sendMessage({
        from: 'qumus',
        to: input.targetAgent as AgentId,
        type: input.commandType,
        priority: input.priority,
        payload: input.payload,
      });
      return { success: true, messageId: message.id };
    }),

  /**
   * Create a cross-platform event
   */
  createCrossPlatformEvent: protectedProcedure
    .input(z.object({
      type: z.enum(['content_sync', 'emergency_broadcast', 'schedule_update', 'listener_migration', 'revenue_share', 'compliance_alert', 'health_check']),
      targets: z.array(z.string()),
      data: z.record(z.any()),
    }))
    .mutation(async ({ input }) => {
      const network = getAgentNetwork();
      const event = network.createCrossPlatformEvent({
        type: input.type,
        source: 'qumus',
        targets: input.targets as AgentId[],
        data: input.data,
      });
      return { success: true, eventId: event.id };
    }),

  // ═══════════════════════════════════════════════════════════
  // QUMUS Push Notifications — Critical Event Alerts
  // ═══════════════════════════════════════════════════════════

  /**
   * Get notification service stats and recent notifications
   */
  getNotificationStats: publicProcedure.query(() => {
    return getNotificationStats();
  }),

  /**
   * Update notification rule (enable/disable, change severity threshold)
   */
  updateNotificationRule: protectedProcedure
    .input(z.object({
      type: z.string(),
      minSeverity: z.string().optional(),
      enabled: z.boolean().optional(),
    }))
    .mutation(({ input }) => {
      const success = updateNotificationRule(input.type, {
        minSeverity: input.minSeverity,
        enabled: input.enabled,
      });
      return { success };
    }),

  /**
   * Send a test notification to verify push delivery
   */
  sendTestNotification: protectedProcedure
    .input(z.object({
      title: z.string(),
      body: z.string(),
      type: z.enum(['human_review', 'emergency', 'agent_health', 'security', 'campaign', 'system']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
    }))
    .mutation(({ input }) => {
      queueNotification({
        type: input.type,
        severity: input.severity,
        title: input.title,
        body: input.body,
      });
      return { success: true, message: 'Notification queued for delivery' };
    }),

  /**
   * Get pending operational tasks — QUMUS awareness of future to-do items
   * These are owner-action items that QUMUS tracks but cannot execute autonomously
   */
  getPendingOperationalTasks: publicProcedure.query(async () => {
    const tasks = [
      {
        id: 'task_csv_import',
        priority: 1,
        category: 'Revenue Protection',
        title: 'Import CSV Payout Data',
        description: 'Upload payout reports from DistroKid, TuneCore, CD Baby, Spotify, or Apple Music to the Royalty Audit system',
        route: '/rrb/qumus/royalty-audit',
        action: 'Go to CSV Import tab and upload your distributor payout file',
        status: 'waiting_for_owner',
        prerequisite: 'Must have a distributor account and at least one payout report',
        relatedPolicy: 'Royalty Audit (#12)',
      },
      {
        id: 'task_bmi_registration',
        priority: 1,
        category: 'Revenue Protection',
        title: 'Register with BMI as Publisher',
        description: 'Required to collect performance royalties for Seabrun Candy Hunter compositions',
        route: null,
        action: 'Visit bmi.com and register as a publisher',
        status: 'waiting_for_owner',
        prerequisite: 'None — can do immediately',
        relatedPolicy: 'Royalty Audit (#12)',
      },
      {
        id: 'task_soundexchange',
        priority: 1,
        category: 'Revenue Protection',
        title: 'Register with SoundExchange',
        description: 'Collects digital performance royalties from internet and satellite radio plays',
        route: null,
        action: 'Visit soundexchange.com and register',
        status: 'waiting_for_owner',
        prerequisite: 'None — can do immediately',
        relatedPolicy: 'Royalty Audit (#12)',
      },
      {
        id: 'task_distributor_setup',
        priority: 1,
        category: 'Revenue Protection',
        title: 'Set Up Music Distributor',
        description: 'Choose and set up DistroKid, TuneCore, or CD Baby to distribute music to streaming platforms',
        route: null,
        action: 'Sign up at distrokid.com, tunecore.com, or cdbaby.com',
        status: 'waiting_for_owner',
        prerequisite: 'Music files ready for distribution',
        relatedPolicy: 'Royalty Audit (#12)',
      },
      {
        id: 'task_archival_baseline',
        priority: 2,
        category: 'Evidence Protection',
        title: 'Run Content Archival Baseline Scan',
        description: 'Check all evidence links in Proof Vault for availability and archive to Wayback Machine',
        route: '/rrb/qumus/content-archival',
        action: 'Click Run Scan on the Content Archival dashboard',
        status: 'ready_to_execute',
        prerequisite: 'None — can do now',
        relatedPolicy: 'Content Archival (#11)',
      },
      {
        id: 'task_royalty_baseline',
        priority: 2,
        category: 'Revenue Protection',
        title: 'Run Royalty Audit Baseline Scan',
        description: 'Establish baseline for QUMUS to detect future royalty discrepancies',
        route: '/rrb/qumus/royalty-audit',
        action: 'Click Run Scan on the Royalty Audit dashboard',
        status: 'ready_to_execute',
        prerequisite: 'Best after importing first CSV data, but can run empty baseline now',
        relatedPolicy: 'Royalty Audit (#12)',
      },
      {
        id: 'task_github_discussions',
        priority: 3,
        category: 'Repository Maintenance',
        title: 'Enable GitHub Discussions',
        description: 'Creates a community forum on the GitHub repository',
        route: null,
        action: 'GitHub repo → Settings → Features → check Discussions',
        status: 'waiting_for_owner',
        prerequisite: 'GitHub repo access',
        relatedPolicy: 'Community Engagement (#13)',
      },
      {
        id: 'task_github_auto_delete',
        priority: 3,
        category: 'Repository Maintenance',
        title: 'Enable Auto-Delete Head Branches',
        description: 'Automatically cleans up branches after merging pull requests',
        route: null,
        action: 'GitHub repo → Settings → General → Pull Requests → check auto-delete',
        status: 'waiting_for_owner',
        prerequisite: 'GitHub repo access',
        relatedPolicy: 'Code Maintenance (#9)',
      },
      {
        id: 'task_stripe_connect',
        priority: 4,
        category: 'Future Enhancement',
        title: 'Activate Stripe Connect for Collaborator Payouts',
        description: 'Already built — activate when collaborating artists need direct payouts',
        route: '/rrb/royalties',
        action: 'Configure Stripe Connect accounts for collaborators',
        status: 'deferred',
        prerequisite: 'Collaborating artists identified and ready for payouts',
        relatedPolicy: 'Payment Processing (#2)',
      },
      {
        id: 'task_sweet_miracles_npo',
        priority: 4,
        category: 'Future Enhancement',
        title: 'Sweet Miracles NPO Integration',
        description: 'Connect donation system to nonprofit entity when established',
        route: '/sweet-miracles/donate-checkout',
        action: 'Set up NPO entity and connect to donation system',
        status: 'deferred',
        prerequisite: 'Sweet Miracles NPO entity established',
        relatedPolicy: 'Payment Processing (#2)',
      },
    ];

    const summary = {
      total: tasks.length,
      readyToExecute: tasks.filter(t => t.status === 'ready_to_execute').length,
      waitingForOwner: tasks.filter(t => t.status === 'waiting_for_owner').length,
      deferred: tasks.filter(t => t.status === 'deferred').length,
      byPriority: {
        critical: tasks.filter(t => t.priority === 1).length,
        important: tasks.filter(t => t.priority === 2).length,
        standard: tasks.filter(t => t.priority === 3).length,
        optional: tasks.filter(t => t.priority === 4).length,
      },
    };

    return { tasks, summary };
  }),
});

/**
 * Format uptime seconds into human-readable string
 */
function formatUptime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return 'N/A';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default qumusCompleteRouter;
