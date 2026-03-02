import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import * as db from "../db";
import { TRPCError } from "@trpc/server";

export const finetuningRouter = router({
  /**
   * Create a fine-tuning dataset
   */
  createDataset: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const datasetId = await db.createFinetuningDataset(ctx.user.id, input.name, input.description);

      return { success: true, datasetId };
    }),

  /**
   * Get user's datasets
   */
  getDatasets: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db.getUserFinetuningDatasets(ctx.user.id);
  }),

  /**
   * Get dataset details
   */
  getDataset: protectedProcedure
    .input(z.object({ datasetId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dataset = await db.getFinetuningDataset(input.datasetId);
      if (!dataset || dataset.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return dataset;
    }),

  /**
   * Update dataset
   */
  updateDataset: protectedProcedure
    .input(
      z.object({
        datasetId: z.number(),
        dataCount: z.number().optional(),
        status: z.enum(["draft", "ready", "training", "completed", "failed"]).optional(),
        quality: z.enum(["excellent", "good", "fair", "poor"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dataset = await db.getFinetuningDataset(input.datasetId);
      if (!dataset || dataset.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.updateFinetuningDataset(input.datasetId, {
        dataCount: input.dataCount,
        status: input.status,
        quality: input.quality,
      });

      return { success: true };
    }),

  /**
   * Create fine-tuning job
   */
  createJob: protectedProcedure
    .input(
      z.object({
        datasetId: z.number(),
        modelName: z.string(),
        baseModel: z.string(),
        epochs: z.number().min(1).max(100).optional(),
        batchSize: z.number().min(1).max(256).optional(),
        learningRate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const dataset = await db.getFinetuningDataset(input.datasetId);
      if (!dataset || dataset.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const jobId = await db.createFinetuningJob(
        ctx.user.id,
        input.datasetId,
        input.modelName,
        input.baseModel,
        input.epochs || 3,
        input.batchSize || 32,
        input.learningRate || "0.0001"
      );

      return { success: true, jobId };
    }),

  /**
   * Get user's jobs
   */
  getJobs: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db.getUserFinetuningJobs(ctx.user.id);
  }),

  /**
   * Get job details
   */
  getJob: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const job = await db.getFinetuningJob(input.jobId);
      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return job;
    }),

  /**
   * Get user's models
   */
  getModels: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db.getUserFinetuningModels(ctx.user.id);
  }),

  /**
   * Get model details
   */
  getModel: protectedProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const model = await db.getFinetuningModel(input.modelId);
      if (!model || model.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return model;
    }),

  /**
   * Get model evaluations
   */
  getEvaluations: protectedProcedure
    .input(z.object({ modelId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const model = await db.getFinetuningModel(input.modelId);
      if (!model || model.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      return db.getModelEvaluations(input.modelId);
    }),

  /**
   * Compare models
   */
  compareModels: protectedProcedure
    .input(
      z.object({
        baselineModelId: z.number(),
        candidateModelId: z.number(),
        baselineMetrics: z.record(z.string(), z.any()),
        candidateMetrics: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const baselineModel = await db.getFinetuningModel(input.baselineModelId);
      const candidateModel = await db.getFinetuningModel(input.candidateModelId);

      if (!baselineModel || baselineModel.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (!candidateModel || candidateModel.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const comparisonId = await db.createModelComparison(
        ctx.user.id,
        input.baselineModelId,
        input.candidateModelId,
        input.baselineMetrics,
        input.candidateMetrics
      );

      return { success: true, comparisonId };
    }),

  /**
   * Get model comparisons
   */
  getComparisons: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    return db.getModelComparisons(ctx.user.id);
  }),

  /**
   * Update job progress
   */
  updateJobProgress: protectedProcedure
    .input(
      z.object({
        jobId: z.number(),
        progress: z.number().min(0).max(100),
        status: z.enum(["pending", "training", "completed", "failed"]).optional(),
        metrics: z.record(z.string(), z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const job = await db.getFinetuningJob(input.jobId);
      if (!job || job.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.updateFinetuningJob(input.jobId, {
        progress: input.progress,
        status: input.status,
        metrics: input.metrics,
      });

      return { success: true };
    }),
});
