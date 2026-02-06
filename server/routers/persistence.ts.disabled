import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { eq, and } from "drizzle-orm";
import { savedTemplates, analyticsHistory } from "../../drizzle/schema";

export const persistenceRouter = router({
  // Save a template
  saveTemplate: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      systemPrompt: z.string().optional(),
      temperature: z.number().optional(),
      model: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        const result = await database.insert(savedTemplates).values({
          name: input.name,
          description: input.description || null,
          systemPrompt: input.systemPrompt || null,
          temperature: input.temperature || null,
          model: input.model || null,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          isPublic: input.isPublic ? true : false,
          userId: ctx.user.id,
        });
        
        return { success: true, id: 1 };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get user's saved templates
  getUserTemplates: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        const templates = await (database as any).query.savedTemplates.findMany({
          where: eq(savedTemplates.userId, ctx.user.id),
          limit: input.limit,
          offset: input.offset,
        });
        
        return templates.map((t: any) => ({
          ...t,
          tags: t.tags ? JSON.parse(t.tags) : [],
        }));
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Delete a template
  deleteTemplate: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        await database.delete(savedTemplates).where(
          and(
            eq(savedTemplates.id, input.templateId),
            eq(savedTemplates.userId, ctx.user.id)
          )
        );
        
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Record analytics data
  recordAnalytics: protectedProcedure
    .input(z.object({
      sessionId: z.number().optional(),
      tokensUsed: z.number(),
      costUSD: z.number(),
      modelUsed: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        await database.insert(analyticsHistory).values({
          userId: ctx.user.id,
          sessionId: input.sessionId || null,
          tokensUsed: input.tokensUsed,
          costUSD: String(input.costUSD),
          modelUsed: input.modelUsed,
        });
        
        return { success: true };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get analytics history
  getAnalyticsHistory: protectedProcedure
    .input(z.object({
      limit: z.number().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        const history = await (database as any).query.analyticsHistory.findMany({
          where: eq(analyticsHistory.userId, ctx.user.id),
          limit: input.limit,
          offset: input.offset,
          orderBy: (fields: any) => [fields.timestamp],
        });
        
        return history;
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),

  // Get analytics summary
  getAnalyticsSummary: protectedProcedure
    .input(z.object({
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      try {
        const database = await getDb();
        if (!database) throw new Error("Database connection failed");
        const records = await (database as any).query.analyticsHistory.findMany({
          where: eq(analyticsHistory.userId, ctx.user.id),
        }) as any[];
        
        const totalTokens = records.reduce((sum: number, r: any) => sum + (r.tokensUsed || 0), 0);
        const totalCost = records.reduce((sum: number, r: any) => sum + (r.costUSD || 0), 0);
        const modelBreakdown = records.reduce((acc: any, r: any) => {
          const model = r.modelUsed || "unknown";
          acc[model] = (acc[model] || 0) + (r.tokensUsed || 0);
          return acc;
        }, {});
        
        return {
          totalTokens,
          totalCost,
          recordCount: records.length,
          modelBreakdown,
          averageTokensPerSession: records.length > 0 ? totalTokens / records.length : 0,
        };
      } catch (error) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: String(error) });
      }
    }),
});
