import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { WebhookMarketplaceService } from "../services/webhookMarketplaceService";
import { TRPCError } from "@trpc/server";

export const marketplaceRouter = router({
  /**
   * Get marketplace statistics
   */
  getStats: protectedProcedure.query(async () => {
    return WebhookMarketplaceService.getMarketplaceStats();
  }),

  /**
   * Get marketplace templates
   */
  getTemplates: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      return WebhookMarketplaceService.getTemplates(input);
    }),

  /**
   * Get template details
   */
  getTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      const template = await WebhookMarketplaceService.getTemplate(input.templateId);
      if (!template) throw new TRPCError({ code: "NOT_FOUND" });
      return template;
    }),

  /**
   * Install template
   */
  installTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        name: z.string(),
        config: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const installationId = await WebhookMarketplaceService.installTemplate(
        ctx.user.id,
        input.templateId,
        input.name,
        input.config
      );

      return { success: true, installationId };
    }),

  /**
   * Get user's installed templates
   */
  getInstallations: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return WebhookMarketplaceService.getUserInstallations(ctx.user.id);
  }),

  /**
   * Update installation
   */
  updateInstallation: protectedProcedure
    .input(
      z.object({
        installationId: z.number(),
        config: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await WebhookMarketplaceService.updateInstallation(ctx.user.id, input.installationId, input.config);

      return { success: true };
    }),

  /**
   * Delete installation
   */
  deleteInstallation: protectedProcedure
    .input(z.object({ installationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await WebhookMarketplaceService.deleteInstallation(ctx.user.id, input.installationId);

      return { success: true };
    }),

  /**
   * Rate template
   */
  rateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        rating: z.number().min(1).max(5),
        review: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await WebhookMarketplaceService.rateTemplate(ctx.user.id, input.templateId, input.rating, input.review);

      return { success: true };
    }),

  /**
   * Get template reviews
   */
  getReviews: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      return WebhookMarketplaceService.getTemplateReviews(input.templateId);
    }),

  /**
   * Get template statistics
   */
  getTemplateStats: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input }) => {
      return WebhookMarketplaceService.getTemplateStats(input.templateId);
    }),

  /**
   * Create custom template
   */
  createCustomTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        webhookUrl: z.string().url(),
        events: z.array(z.string()),
        configSchema: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const templateId = await WebhookMarketplaceService.createCustomTemplate(
        ctx.user.id,
        input.name,
        input.description,
        input.category,
        input.webhookUrl,
        input.events,
        input.configSchema
      );

      return { success: true, templateId };
    }),

  /**
   * Publish custom template
   */
  publishTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      await WebhookMarketplaceService.publishTemplate(ctx.user.id, input.templateId);

      return { success: true };
    }),
});
