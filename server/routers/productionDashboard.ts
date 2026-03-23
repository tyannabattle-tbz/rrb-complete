/**
 * Production Dashboard Router
 * Handles all production studio dashboard operations including project management,
 * transcoding queue, QA results, and live monitoring
 */

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { productionDashboardService } from "../services/productionDashboardService";
import { z } from "zod";

export const productionDashboardRouter = router({
  /**
   * Get all active projects
   */
  getActiveProjects: publicProcedure.query(async () => {
    return await productionDashboardService.getActiveProjects();
  }),

  /**
   * Get transcoding queue with progress
   */
  getTranscodingQueue: publicProcedure.query(async () => {
    return await productionDashboardService.getTranscodingQueue();
  }),

  /**
   * Get production metrics
   */
  getProductionMetrics: publicProcedure.query(async () => {
    return await productionDashboardService.getProductionMetrics();
  }),

  /**
   * Get project timeline
   */
  getProjectTimeline: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await productionDashboardService.getProjectTimeline(input.projectId);
    }),

  /**
   * Get team activity
   */
  getTeamActivity: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await productionDashboardService.getTeamActivity(input.projectId);
    }),

  /**
   * Get budget tracking
   */
  getBudgetTracking: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await productionDashboardService.getBudgetTracking(input.projectId);
    }),

  /**
   * Get QA results
   */
  getQAResults: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      return await productionDashboardService.getQAResults(input.projectId);
    }),

  /**
   * Get live project monitoring metrics
   */
  getLiveProjectMonitoring: publicProcedure.query(async () => {
    return await productionDashboardService.getLiveProjectMonitoring();
  }),

  /**
   * Create new project
   */
  createProject: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        format: z.string(),
        budget: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      return await productionDashboardService.createProject(input.name, input.format, input.budget);
    }),

  /**
   * Update project status
   */
  updateProjectStatus: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        status: z.enum(["pre-production", "production", "post-production", "completed"]),
      })
    )
    .mutation(async ({ input }) => {
      return await productionDashboardService.updateProjectStatus(input.projectId, input.status);
    }),

  /**
   * Add team member to project
   */
  addTeamMember: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
        role: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      return await productionDashboardService.addTeamMember(input.projectId, input.userId, input.role);
    }),
});
