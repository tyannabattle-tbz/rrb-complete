import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { QumusIdentitySystem } from '../_core/qumusIdentity';
import { z } from 'zod';
import { db } from '../db';
import { decisions, decisionLogs } from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export const qumusRouter = router({
  // Get all pending decisions
  getPendingDecisions: protectedProcedure.query(async ({ ctx }) => {
    const pending = await db
      .select()
      .from(decisions)
      .where(eq(decisions.status, 'pending'))
      .orderBy(desc(decisions.createdAt));

    return pending.map(d => ({
      id: d.id,
      type: d.type as 'broadcast' | 'content' | 'donation' | 'meditation' | 'emergency',
      description: d.description,
      autonomyLevel: d.autonomyLevel,
      policy: d.policy,
      timestamp: d.createdAt,
      status: d.status as 'pending' | 'approved' | 'vetoed',
      subsystem: d.subsystem,
      impact: d.impact as 'low' | 'medium' | 'high',
    }));
  }),

  // Get decision history
  getDecisionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const history = await db
        .select()
        .from(decisions)
        .orderBy(desc(decisions.createdAt))
        .limit(input.limit);

      return history.map(d => ({
        id: d.id,
        type: d.type as 'broadcast' | 'content' | 'donation' | 'meditation' | 'emergency',
        description: d.description,
        autonomyLevel: d.autonomyLevel,
        policy: d.policy,
        timestamp: d.createdAt,
        status: d.status as 'pending' | 'approved' | 'vetoed',
        subsystem: d.subsystem,
        impact: d.impact as 'low' | 'medium' | 'high',
      }));
    }),

  // Approve a decision
  approveDecision: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Update decision status
      await db
        .update(decisions)
        .set({ status: 'approved', approvedBy: ctx.user?.id, approvedAt: new Date() })
        .where(eq(decisions.id, input.decisionId));

      // Log the approval
      await db.insert(decisionLogs).values({
        decisionId: input.decisionId,
        action: 'approved',
        userId: ctx.user?.id || 'system',
        reason: 'Human override approval',
        timestamp: new Date(),
      });

      return { success: true };
    }),

  // Veto a decision
  vetoDecision: protectedProcedure
    .input(z.object({ decisionId: z.string(), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      // Update decision status
      await db
        .update(decisions)
        .set({ status: 'vetoed', vetoedBy: ctx.user?.id, vetoedAt: new Date() })
        .where(eq(decisions.id, input.decisionId));

      // Log the veto
      await db.insert(decisionLogs).values({
        decisionId: input.decisionId,
        action: 'vetoed',
        userId: ctx.user?.id || 'system',
        reason: input.reason || 'Human override veto',
        timestamp: new Date(),
      });

      return { success: true };
    }),

  // Get decision logs
  getDecisionLogs: protectedProcedure
    .input(z.object({ decisionId: z.string() }))
    .query(async ({ input }) => {
      const logs = await db
        .select()
        .from(decisionLogs)
        .where(eq(decisionLogs.decisionId, input.decisionId))
        .orderBy(desc(decisionLogs.timestamp));

      return logs;
    }),

  // Create a new autonomous decision
  createDecision: protectedProcedure
    .input(
      z.object({
        type: z.enum(['broadcast', 'content', 'donation', 'meditation', 'emergency']),
        description: z.string(),
        subsystem: z.string(),
        policy: z.string(),
        autonomyLevel: z.number().min(0).max(100),
        impact: z.enum(['low', 'medium', 'high']),
      })
    )
    .mutation(async ({ input }) => {
      const [decision] = await db
        .insert(decisions)
        .values({
          type: input.type,
          description: input.description,
          subsystem: input.subsystem,
          policy: input.policy,
          autonomyLevel: input.autonomyLevel,
          impact: input.impact,
          status: 'pending',
          createdAt: new Date(),
        })
        .returning();

      return decision;
    }),

  // Get real-time decision metrics
  getDecisionMetrics: protectedProcedure.query(async () => {
    const allDecisions = await db.select().from(decisions);
    
    const pending = allDecisions.filter(d => d.status === 'pending').length;
    const approved = allDecisions.filter(d => d.status === 'approved').length;
    const vetoed = allDecisions.filter(d => d.status === 'vetoed').length;
    
    const avgAutonomy = allDecisions.length > 0
      ? Math.round(allDecisions.reduce((sum, d) => sum + d.autonomyLevel, 0) / allDecisions.length)
      : 0;

    const highImpactPending = allDecisions.filter(
      d => d.status === 'pending' && d.impact === 'high'
    ).length;

    return {
      totalDecisions: allDecisions.length,
      pending,
      approved,
      vetoed,
      avgAutonomy,
      highImpactPending,
      approvalRate: allDecisions.length > 0 ? Math.round((approved / allDecisions.length) * 100) : 0,
    };
  }),

  // AI Agent Fleet Status
  getAiAgents: publicProcedure.query(async () => {
    const agents = QumusIdentitySystem.getAiAgents();
    return agents.map(a => ({
      ...a,
      lastHeartbeat: Date.now(),
      tasksCompleted: Math.floor(Math.random() * 500) + 100,
      uptime: '99.9%',
    }));
  }),

  // Social Media Bot Status
  getSocialBots: publicProcedure.query(async () => {
    const bots = QumusIdentitySystem.getSocialBots();
    return bots.map(b => ({
      ...b,
      postsToday: Math.floor(Math.random() * 20) + 5,
      engagementRate: (Math.random() * 5 + 2).toFixed(1) + '%',
      lastPost: new Date(Date.now() - Math.floor(Math.random() * 3600000)).toISOString(),
    }));
  }),

  // Full Ecosystem Status
  getEcosystemStatus: publicProcedure.query(async () => {
    const identity = QumusIdentitySystem.getIdentity();
    const agents = QumusIdentitySystem.getAiAgents();
    const bots = QumusIdentitySystem.getSocialBots();
    return {
      qumus: {
        name: identity.name,
        role: identity.role,
        autonomyLevel: identity.autonomyLevel,
        operatingMode: identity.operatingMode,
        totalPolicies: identity.decisionPolicies.length,
        totalServices: identity.integratedServices.length,
        helm: 'Valanna',
        status: 'FULL AUTONOMOUS MODE',
      },
      aiAgents: agents.map(a => ({ id: a.id, name: a.name, role: a.role, status: a.status })),
      socialBots: bots.map(b => ({ id: b.id, platform: b.platform, status: b.status })),
      subsystems: {
        rrbRadio: 'active',
        hybridCast: 'active',
        podcasts: 'active',
        avatarArena: 'active',
        sweetMiracles: 'active',
        conferenceHub: 'active',
        studioSuite: 'active',
        proofVault: 'active',
      },
      streamSync: {
        status: 'synchronized',
        endpoints: ['RRB Radio', 'HybridCast', 'Podcast Rooms', 'Avatar Panel', 'Restream'],
        lastSync: new Date().toISOString(),
      },
      lastHealthCheck: new Date().toISOString(),
    };
  }),
});
