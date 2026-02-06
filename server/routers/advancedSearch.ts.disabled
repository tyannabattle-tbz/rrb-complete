import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { agentSessions, messages, toolExecutions } from "../../drizzle/schema";
import { eq, like, and, gte, lte, desc } from "drizzle-orm";

export const advancedSearchRouter = router({
  // Search across sessions, messages, and tools
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        type: z.enum(["all", "sessions", "messages", "tools"]).default("all"),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const results: any = {
        sessions: [],
        messages: [],
        tools: [],
      };

      const conditions = [];
      if (input.startDate) {
        conditions.push(gte(agentSessions.createdAt, input.startDate));
      }
      if (input.endDate) {
        conditions.push(lte(agentSessions.createdAt, input.endDate));
      }

      try {
        // Search sessions
        if (input.type === "all" || input.type === "sessions") {
          const sessionResults = await db
            .select()
            .from(agentSessions)
            .where(
              and(
                eq(agentSessions.userId, ctx.user.id),
                like(agentSessions.sessionName, `%${input.query}%`),
                ...conditions
              )
            )
            .orderBy(desc(agentSessions.createdAt))
            .limit(input.limit);
          results.sessions = sessionResults;
        }

        // Search messages
        if (input.type === "all" || input.type === "messages") {
          const messageResults = await db
            .select()
            .from(messages)
            .where(like(messages.content, `%${input.query}%`))
            .orderBy(desc(messages.createdAt))
            .limit(input.limit);
          results.messages = messageResults;
        }

        // Search tools
        if (input.type === "all" || input.type === "tools") {
          const toolResults = await db
            .select()
            .from(toolExecutions)
            .where(like(toolExecutions.toolName, `%${input.query}%`))
            .orderBy(desc(toolExecutions.createdAt))
            .limit(input.limit);
          results.tools = toolResults;
        }

        return results;
      } catch (error) {
        console.error("[Search] Error searching:", error);
        throw new Error("Search failed");
      }
    }),

  // Get search suggestions based on user's recent queries
  getSuggestions: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().min(1).max(10).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // Get session names that match the query
        const sessionSuggestions = await db
          .select({ sessionName: agentSessions.sessionName })
          .from(agentSessions)
          .where(
            and(
              eq(agentSessions.userId, ctx.user.id),
              like(agentSessions.sessionName, `%${input.query}%`)
            )
          )
          .limit(input.limit);

        return sessionSuggestions.map((s) => s.sessionName);
      } catch (error) {
        console.error("[Search] Error getting suggestions:", error);
        return [];
      }
    }),

  // Save search filter preset
  saveFilterPreset: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        type: z.enum(["all", "sessions", "messages", "tools"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      // In a real app, you'd save this to the database
      // For now, we'll just return success
      return {
        success: true,
        presetId: Math.random().toString(36).substr(2, 9),
      };
    }),
});
