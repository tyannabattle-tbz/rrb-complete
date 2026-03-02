import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// In-memory template store (replace with database in production)
const templates: Array<{
  id: string;
  name: string;
  description: string;
  category: string;
  jobConfig: {
    priority: "critical" | "high" | "medium" | "low";
    timeout: number;
    retries: number;
    parallelJobs: number;
  };
  videoSettings: {
    format: string;
    resolution: string;
    bitrate: string;
    fps: number;
  };
  processingSteps: Array<{
    step: number;
    name: string;
    type: string;
    config: Record<string, any>;
  }>;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}> = [
  {
    id: "template-1",
    name: "Quick Social Media Export",
    description: "Fast processing for social media platforms (Instagram, TikTok, YouTube Shorts)",
    category: "social-media",
    jobConfig: {
      priority: "high",
      timeout: 300,
      retries: 2,
      parallelJobs: 5,
    },
    videoSettings: {
      format: "mp4",
      resolution: "1080p",
      bitrate: "5000k",
      fps: 30,
    },
    processingSteps: [
      {
        step: 1,
        name: "Transcode",
        type: "video-transcode",
        config: { codec: "h264", preset: "fast" },
      },
      {
        step: 2,
        name: "Add Watermark",
        type: "watermark",
        config: { position: "bottom-right", opacity: 0.8 },
      },
    ],
    createdBy: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "template-2",
    name: "High-Quality Archive",
    description: "Maximum quality export for archival and professional use",
    category: "archive",
    jobConfig: {
      priority: "medium",
      timeout: 3600,
      retries: 3,
      parallelJobs: 2,
    },
    videoSettings: {
      format: "mov",
      resolution: "4K",
      bitrate: "50000k",
      fps: 60,
    },
    processingSteps: [
      {
        step: 1,
        name: "Transcode",
        type: "video-transcode",
        config: { codec: "prores", preset: "hq" },
      },
      {
        step: 2,
        name: "Color Correction",
        type: "color-correction",
        config: { lut: "cinema", saturation: 1.1 },
      },
      {
        step: 3,
        name: "Add Metadata",
        type: "metadata",
        config: { copyright: true, timestamps: true },
      },
    ],
    createdBy: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "template-3",
    name: "Streaming Optimization",
    description: "Optimized for streaming platforms with adaptive bitrate",
    category: "streaming",
    jobConfig: {
      priority: "high",
      timeout: 1800,
      retries: 2,
      parallelJobs: 3,
    },
    videoSettings: {
      format: "mp4",
      resolution: "1440p",
      bitrate: "8000k",
      fps: 24,
    },
    processingSteps: [
      {
        step: 1,
        name: "Adaptive Transcode",
        type: "adaptive-transcode",
        config: { bitrates: ["1000k", "2500k", "5000k", "8000k"] },
      },
      {
        step: 2,
        name: "Add Subtitles",
        type: "subtitles",
        config: { auto_generate: true, languages: ["en", "es", "fr"] },
      },
    ],
    createdBy: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

export const batchTemplatesRouter = router({
  // Get all templates
  listTemplates: protectedProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(({ input }) => {
      let filtered = templates;

      if (input?.category) {
        filtered = templates.filter((t) => t.category === input.category);
      }

      return filtered;
    }),

  // Get single template
  getTemplate: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .query(({ input }) => {
      const template = templates.find((t) => t.id === input.templateId);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }
      return template;
    }),

  // Create new template
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        jobConfig: z.object({
          priority: z.enum(["critical", "high", "medium", "low"]),
          timeout: z.number(),
          retries: z.number(),
          parallelJobs: z.number(),
        }),
        videoSettings: z.object({
          format: z.string(),
          resolution: z.string(),
          bitrate: z.string(),
          fps: z.number(),
        }),
        processingSteps: z.array(
          z.object({
            step: z.number(),
            name: z.string(),
            type: z.string(),
            config: z.record(z.string(), z.any()),
          })
        ),
      })
    )
    .mutation(({ input, ctx }) => {
      const newTemplate = {
        id: `template-${Date.now()}`,
        ...input,
        createdBy: ctx.user.id as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      templates.push(newTemplate);
      return newTemplate;
    }),

  // Update template
  updateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        jobConfig: z.object({
          priority: z.enum(["critical", "high", "medium", "low"]).optional(),
          timeout: z.number().optional(),
          retries: z.number().optional(),
          parallelJobs: z.number().optional(),
        }).optional(),
        videoSettings: z.object({
          format: z.string().optional(),
          resolution: z.string().optional(),
          bitrate: z.string().optional(),
          fps: z.number().optional(),
        }).optional(),
        processingSteps: z.array(
          z.object({
            step: z.number(),
            name: z.string(),
            type: z.string(),
            config: z.record(z.string(), z.any()),
          })
        ).optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      const template = templates.find((t) => t.id === input.templateId);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      if (input.name) template.name = input.name;
      if (input.description) template.description = input.description;
      if (input.jobConfig) template.jobConfig = { ...template.jobConfig, ...input.jobConfig };
      if (input.videoSettings) template.videoSettings = { ...template.videoSettings, ...input.videoSettings };
      if (input.processingSteps) template.processingSteps = input.processingSteps;
      template.updatedAt = new Date();

      return template;
    }),

  // Delete template
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.string() }))
    .mutation(({ input }) => {
      const index = templates.findIndex((t) => t.id === input.templateId);
      if (index === -1) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      templates.splice(index, 1);
      return { success: true };
    }),

  // Clone template
  cloneTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        newName: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      const original = templates.find((t) => t.id === input.templateId);
      if (!original) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      const cloned = {
        ...original,
        id: `template-${Date.now()}`,
        name: input.newName,
        createdBy: ctx.user.id as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      templates.push(cloned);
      return cloned;
    }),

  // Get template categories
  getCategories: protectedProcedure.query(({ ctx }) => {
    const categories = new Set(templates.map((t) => t.category));
    return Array.from(categories);
  }),

  // Get template statistics
  getStats: protectedProcedure.query(({ ctx }) => {
    return {
      totalTemplates: templates.length,
      byCategory: templates.reduce(
        (acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      recentlyUpdated: templates
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 5),
    };
  }),

  // Apply template to create batch job
  applyTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        jobName: z.string(),
        inputFiles: z.array(z.string()),
        queueId: z.number(),
      })
    )
    .mutation(({ input }) => {
      const template = templates.find((t) => t.id === input.templateId);
      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Template not found" });
      }

      // Return job configuration based on template
      return {
        jobId: `job-${Date.now()}`,
        name: input.jobName,
        templateId: input.templateId,
        queueId: input.queueId,
        inputFiles: input.inputFiles,
        config: {
          jobConfig: template.jobConfig,
          videoSettings: template.videoSettings,
          processingSteps: template.processingSteps,
        },
        createdAt: new Date(),
        status: "queued",
      };
    }),
});
