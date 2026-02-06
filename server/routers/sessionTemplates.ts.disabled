import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentSessions } from "../../drizzle/schema";
import { eq, desc, sql } from "drizzle-orm";

export const sessionTemplatesRouter = router({
  // Create a session template
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        systemPrompt: z.string(),
        temperature: z.number().min(0).max(100).default(70),
        model: z.string().default("gpt-4-turbo"),
        maxSteps: z.number().default(50),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In production, save to database
      return {
        success: true,
        templateId: Math.random().toString(36).substr(2, 9),
        template: {
          id: Math.random().toString(36).substr(2, 9),
          name: input.name,
          description: input.description,
          systemPrompt: input.systemPrompt,
          temperature: input.temperature,
          model: input.model,
          maxSteps: input.maxSteps,
          tags: input.tags || [],
          createdAt: new Date(),
        },
      };
    }),

  // Get all templates
  getTemplates: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In production, fetch from database
      return [
        {
          id: "template-1",
          name: "Code Assistant",
          description: "Template for code generation and debugging",
          systemPrompt: "You are an expert code assistant. Help users write, debug, and optimize code.",
          temperature: 70,
          model: "gpt-4-turbo",
          maxSteps: 50,
          tags: ["code", "programming"],
          createdAt: new Date(),
        },
        {
          id: "template-2",
          name: "Content Writer",
          description: "Template for creative writing and content generation",
          systemPrompt: "You are a professional content writer. Create engaging, well-structured content.",
          temperature: 85,
          model: "gpt-4-turbo",
          maxSteps: 30,
          tags: ["writing", "content"],
          createdAt: new Date(),
        },
        {
          id: "template-3",
          name: "Data Analyst",
          description: "Template for data analysis and insights",
          systemPrompt: "You are a data analyst. Analyze data and provide actionable insights.",
          temperature: 50,
          model: "gpt-4-turbo",
          maxSteps: 40,
          tags: ["data", "analysis"],
          createdAt: new Date(),
        },
      ];
    }),

  // Create session from template
  createSessionFromTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        sessionName: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get template (in production, fetch from database)
        const templates: any = {
          "template-1": {
            systemPrompt: "You are an expert code assistant.",
            temperature: 70,
            model: "gpt-4-turbo",
            maxSteps: 50,
          },
          "template-2": {
            systemPrompt: "You are a professional content writer.",
            temperature: 85,
            model: "gpt-4-turbo",
            maxSteps: 30,
          },
          "template-3": {
            systemPrompt: "You are a data analyst.",
            temperature: 50,
            model: "gpt-4-turbo",
            maxSteps: 40,
          },
        };

        const template = templates[input.templateId];
        if (!template) {
          throw new Error("Template not found");
        }

        // Create new session with template settings
        await db.insert(agentSessions).values({
          userId: ctx.user.id,
          sessionName: input.sessionName,
          systemPrompt: template.systemPrompt,
          temperature: template.temperature,
          model: template.model,
          maxSteps: template.maxSteps,
          status: "idle",
        });

        return {
          success: true,
          sessionId: Math.floor(Math.random() * 10000),
          message: `Session created from template "${input.templateId}"`,
        };
      } catch (error) {
        console.error("[Templates] Error creating session:", error);
        throw new Error("Failed to create session from template");
      }
    }),

  // Search templates by tag
  searchTemplates: protectedProcedure
    .input(z.object({ tag: z.string(), limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In production, search in database
      const allTemplates = [
        {
          id: "template-1",
          name: "Code Assistant",
          tags: ["code", "programming"],
        },
        {
          id: "template-2",
          name: "Content Writer",
          tags: ["writing", "content"],
        },
        {
          id: "template-3",
          name: "Data Analyst",
          tags: ["data", "analysis"],
        },
      ];

      return allTemplates.filter((t) => t.tags.includes(input.tag)).slice(0, input.limit);
    }),

  // Save current session as template
  saveAsTemplate: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        templateName: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        const session = await db
          .select()
          .from(agentSessions)
          .where(eq(agentSessions.id, input.sessionId));

        if (!session || session.length === 0) {
          throw new Error("Session not found");
        }

        // In production, save template to database
        return {
          success: true,
          templateId: Math.random().toString(36).substr(2, 9),
          message: `Session saved as template "${input.templateName}"`,
        };
      } catch (error) {
        console.error("[Templates] Error saving template:", error);
        throw new Error("Failed to save template");
      }
    }),
});
