/**
 * RRB Ecosystem Grants Router
 * Powered by the automated Grant Discovery Engine
 * Provides real-time grant discovery, matching, and application tracking
 * Covers: nonprofit grants, production studio grants, business startup grants, maintenance grants
 */
import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  getDiscoveredGrants,
  getGrantsByCategory,
  getGrantsByStatus,
  updateGrantStatus,
  getDiscoveryStats,
  getGrantCategories,
  forceDiscoveryScan,
  type DiscoveredGrant,
} from "../services/grant-discovery-engine";

export const sweetMiraclesGrantsRouter = router({
  // Get all discovered grants (sorted by match score)
  list: protectedProcedure.query(async () => {
    return getDiscoveredGrants();
  }),

  // Get grant by ID
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const grants = getDiscoveredGrants();
      return grants.find(g => g.id === input.id) || null;
    }),

  // Search grants by criteria
  search: protectedProcedure
    .input(z.object({
      keyword: z.string().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      category: z.string().optional(),
      sourceType: z.string().optional(),
      status: z.string().optional(),
      minMatchScore: z.number().optional(),
      beneficiary: z.enum(['all', 'sweet-miracles', 'canryn-production']).optional(),
    }))
    .query(async ({ input }) => {
      let results = getDiscoveredGrants();
      if (input.keyword) {
        const kw = input.keyword.toLowerCase();
        results = results.filter(g =>
          g.title.toLowerCase().includes(kw) ||
          g.description.toLowerCase().includes(kw) ||
          g.organization.toLowerCase().includes(kw)
        );
      }
      if (input.minAmount) results = results.filter(g => g.amount >= input.minAmount!);
      if (input.maxAmount) results = results.filter(g => g.amount <= input.maxAmount!);
      if (input.category) results = results.filter(g => g.category === input.category);
      if (input.sourceType) results = results.filter(g => g.sourceType === input.sourceType);
      if (input.status) results = results.filter(g => g.status === input.status);
      if (input.minMatchScore) results = results.filter(g => g.matchScore >= input.minMatchScore!);
      if (input.beneficiary === 'sweet-miracles') {
        results = results.filter(g => !['Production Studio & Equipment', 'Business Startup & Entrepreneurship'].includes(g.category));
      } else if (input.beneficiary === 'canryn-production') {
        results = results.filter(g => ['Production Studio & Equipment', 'Business Startup & Entrepreneurship', 'Maintenance & Operations', 'Community Broadcasting & Media', 'Technology & Digital Access', 'Generational Wealth Building'].includes(g.category));
      }
      return results;
    }),

  // Get high-match grants (score > 0.7)
  getHighMatches: protectedProcedure.query(async () => {
    return getDiscoveredGrants()
      .filter(g => g.matchScore >= 0.7 && (g.status === 'discovered' || g.status === 'researching'))
      .slice(0, 20)
      .map(g => ({
        grantId: g.id,
        title: g.title,
        organization: g.organization,
        amount: g.amount,
        deadline: g.deadline,
        matchScore: g.matchScore,
        matchReason: g.matchReasons[0] || 'Mission alignment',
        matchReasons: g.matchReasons,
        category: g.category,
        status: g.status,
      }));
  }),

  // Update grant status in the pipeline
  trackApplication: protectedProcedure
    .input(z.object({
      grantId: z.number(),
      status: z.enum(['discovered', 'researching', 'applying', 'submitted', 'awarded', 'denied', 'expired']),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const updated = updateGrantStatus(input.grantId, input.status, input.notes);
      return updated ? { success: true, grant: updated } : { success: false, error: 'Grant not found' };
    }),

  // Get grant discovery statistics
  getStats: protectedProcedure.query(async () => {
    return getDiscoveryStats();
  }),

  // Get grants by category
  getByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return getGrantsByCategory(input.category);
    }),

  // Get grants by pipeline status
  getByStatus: protectedProcedure
    .input(z.object({ status: z.string() }))
    .query(async ({ input }) => {
      return getGrantsByStatus(input.status as DiscoveredGrant['status']);
    }),

  // Get grant categories with counts
  getCategories: protectedProcedure.query(async () => {
    return getGrantCategories();
  }),

  // Get AI-powered recommendations
  getRecommendations: protectedProcedure.query(async () => {
    const topGrants = getDiscoveredGrants()
      .filter(g => g.matchScore >= 0.6 && g.status === 'discovered')
      .slice(0, 10);
    return topGrants.map(g => ({
      grantId: g.id,
      title: g.title,
      organization: g.organization,
      amount: g.amount,
      matchScore: g.matchScore,
      recommendation: g.matchScore >= 0.85
        ? `Highly recommended — ${g.matchReasons[0]}`
        : g.matchScore >= 0.7
        ? `Strong match — ${g.matchReasons[0]}`
        : `Worth investigating — ${g.matchReasons[0]}`,
      nextSteps: [
        'Review grant requirements and eligibility',
        'Prepare organizational documents (501(c)(3) / 508(c) letter, annual report)',
        `Submit application before ${g.deadline}`,
      ],
      category: g.category,
      deadline: g.deadline,
    }));
  }),

  // Get application pipeline summary
  getPipeline: protectedProcedure.query(async () => {
    const stats = getDiscoveryStats();
    return {
      pipeline: stats.grantsInPipeline,
      totalFundingDiscovered: stats.totalFundingDiscovered,
      totalFundingAwarded: stats.totalFundingAwarded,
      engineStatus: stats.isRunning ? 'scanning' : 'idle',
      lastScan: stats.lastScanTime,
      nextScan: stats.nextScanAt,
    };
  }),

  // Force a new discovery scan
  forceScan: protectedProcedure.mutation(async () => {
    const newGrants = await forceDiscoveryScan();
    return {
      success: true,
      newGrantsFound: newGrants.length,
      grants: newGrants.slice(0, 5),
    };
  }),

  // Get application timeline for a specific grant
  getApplicationTimeline: protectedProcedure
    .input(z.object({ grantId: z.number() }))
    .query(async ({ input }) => {
      const grant = getDiscoveredGrants().find(g => g.id === input.grantId);
      if (!grant) return [];
      const timeline = [
        { date: grant.discoveredAt.toISOString().split('T')[0], event: 'Grant discovered by QUMUS', status: 'completed' as const },
      ];
      if (grant.status !== 'discovered') {
        timeline.push({ date: grant.lastUpdated.toISOString().split('T')[0], event: 'Research initiated', status: 'completed' as const });
      }
      if (['applying', 'submitted', 'awarded', 'denied'].includes(grant.status)) {
        timeline.push({ date: grant.lastUpdated.toISOString().split('T')[0], event: 'Application started', status: 'completed' as const });
      }
      if (['submitted', 'awarded', 'denied'].includes(grant.status)) {
        timeline.push({ date: grant.lastUpdated.toISOString().split('T')[0], event: 'Application submitted', status: 'completed' as const });
      }
      timeline.push({ date: grant.deadline, event: 'Application deadline', status: 'upcoming' as const });
      const reviewDate = new Date(new Date(grant.deadline).getTime() + 30 * 86400000);
      timeline.push({ date: reviewDate.toISOString().split('T')[0], event: 'Review period (estimated)', status: 'upcoming' as const });
      const awardDate = new Date(new Date(grant.deadline).getTime() + 60 * 86400000);
      timeline.push({ date: awardDate.toISOString().split('T')[0], event: 'Award notification (estimated)', status: 'upcoming' as const });
      return timeline;
    }),

  // Delete grant from tracking
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      updateGrantStatus(input.id, 'expired', 'Removed from tracking');
      return { grantId: input.id, deleted: true };
    }),
});
