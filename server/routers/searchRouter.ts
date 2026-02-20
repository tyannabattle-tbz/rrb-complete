import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { advancedSearchService } from '../services/advanced-search-service';
import { z } from 'zod';

export const searchRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string(),
      dateRange: z.object({ start: z.date(), end: z.date() }).optional(),
      duration: z.object({ min: z.number(), max: z.number() }).optional(),
      channel: z.string().optional(),
      engagementLevel: z.enum(['low', 'medium', 'high']).optional(),
      contentType: z.enum(['video', 'podcast', 'audio', 'all']).optional(),
      sortBy: z.enum(['relevance', 'date', 'engagement', 'views']).optional(),
    }))
    .query(({ input }) => {
      return advancedSearchService.search(input.query, input);
    }),

  autocomplete: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      return advancedSearchService.getAutocompleteSuggestions(input);
    }),

  getFilterOptions: publicProcedure.query(() => {
    return advancedSearchService.getFilterOptions();
  }),

  getStats: publicProcedure
    .input(z.array(z.object({
      id: z.string(),
      title: z.string(),
      type: z.enum(['video', 'podcast', 'audio']),
      channel: z.string(),
      duration: z.number(),
      views: z.number(),
      likes: z.number(),
      comments: z.number(),
      uploadedAt: z.date(),
      description: z.string(),
    })))
    .query(({ input }) => {
      return advancedSearchService.getSearchStats(input);
    }),
});
