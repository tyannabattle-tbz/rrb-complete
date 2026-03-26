/**
 * Unified Integration Router
 * Exposes all integration functions to frontend
 */

import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import {
  getListenerMetrics,
  getChannelMetrics,
  getRevenueMetrics,
  getEcosystemHealth,
  getUnifiedEcosystemMetrics,
  orchestrateBroadcast,
  getCrossSystemAnalytics,
  syncEcosystemData,
  executeAutonomousPolicy,
} from "../services/unifiedIntegrationLayer";

export const unifiedIntegrationRouter = router({
  /**
   * Get real-time listener metrics
   */
  getListenerMetrics: publicProcedure.query(async () => {
    return await getListenerMetrics();
  }),

  /**
   * Get channel metrics from RRB
   */
  getChannelMetrics: publicProcedure.query(async () => {
    return await getChannelMetrics();
  }),

  /**
   * Get revenue metrics from payments
   */
  getRevenueMetrics: publicProcedure.query(async () => {
    return await getRevenueMetrics();
  }),

  /**
   * Get health status of all 5 services
   */
  getEcosystemHealth: publicProcedure.query(async () => {
    return await getEcosystemHealth();
  }),

  /**
   * Get unified ecosystem metrics (all systems combined)
   */
  getUnifiedMetrics: publicProcedure.query(async () => {
    return await getUnifiedEcosystemMetrics();
  }),

  /**
   * Get cross-system analytics
   */
  getCrossSystemAnalytics: publicProcedure.query(async () => {
    return await getCrossSystemAnalytics();
  }),

  /**
   * Orchestrate a broadcast across multiple channels
   */
  orchestrateBroadcast: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        channels: z.array(z.string()),
        startTime: z.date(),
        endTime: z.date().optional(),
        isEmergency: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await orchestrateBroadcast(input);
    }),

  /**
   * Sync all ecosystem data
   */
  syncEcosystemData: protectedProcedure.mutation(async ({ ctx }) => {
    return await syncEcosystemData();
  }),

  /**
   * Execute autonomous policy
   */
  executePolicy: protectedProcedure
    .input(
      z.object({
        policyName: z.string(),
        decision: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await executeAutonomousPolicy(input.policyName, input.decision);
    }),

  /**
   * Get system status (health check)
   */
  getSystemStatus: publicProcedure.query(async () => {
    const health = await getEcosystemHealth();
    const metrics = await getUnifiedEcosystemMetrics();
    
    return {
      timestamp: new Date(),
      services: health,
      metrics,
      overallHealth: health.reduce((sum, s) => sum + s.healthPercentage, 0) / health.length,
      isOperational: health.every((s) => s.status === "online"),
    };
  }),
});
