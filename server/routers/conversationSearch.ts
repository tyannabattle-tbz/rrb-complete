import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const conversationSearchRouter = router({
  // Search messages in conversations
  searchMessages: protectedProcedure
    .input(
      z.object({
        query: z.string(),
        sessionId: z.number().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return {
        results: [
          {
            id: 1,
            sessionId: input.sessionId || 1,
            messageId: 1,
            content: input.query,
            role: "user",
            timestamp: new Date(),
            highlight: input.query,
          },
        ],
        total: 1,
      };
    }),

  // Get search suggestions
  getSearchSuggestions: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return {
        suggestions: [
          { text: input.query, count: 1 },
          { text: input.query + " results", count: 0 },
        ],
      };
    }),

  // Save search
  saveSearch: protectedProcedure
    .input(z.object({ query: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return { success: true, message: "Search saved" };
    }),

  // Get saved searches
  getSavedSearches: protectedProcedure.query(async ({ ctx }) => {
    return { searches: [] };
  }),
});
