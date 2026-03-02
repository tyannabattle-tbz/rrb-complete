import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { QumusKnowledgeBase } from '../_core/qumusKnowledgeBase';
import { invokeLLM } from '../_core/llm';

export const aiChatRouter = router({
  searchKnowledge: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      const results = QumusKnowledgeBase.search(input.query);
      return {
        results,
        count: results.length,
      };
    }),

  getSystemPrompt: publicProcedure.query(() => {
    return {
      systemPrompt: QumusKnowledgeBase.getSystemPrompt(),
    };
  }),

  chat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant', 'system']),
        content: z.string(),
      })),
      query: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get relevant knowledge context
        const context = input.query ? QumusKnowledgeBase.getContextForQuery(input.query) : '';

        // Build messages with system prompt and context
        const systemMessage = `${QumusKnowledgeBase.getSystemPrompt()}

${context ? `\n${context}` : ''}`;

        const messagesWithSystem = [
          { role: 'system' as const, content: systemMessage },
          ...input.messages,
        ];

        // Call LLM with Qumus context
        const response = await invokeLLM({
          messages: messagesWithSystem,
        });

        const assistantMessage = response.choices?.[0]?.message?.content || 'I could not generate a response.';

        return {
          success: true,
          message: assistantMessage,
          context: context ? context.split('\n').length : 0,
        };
      } catch (error) {
        return {
          success: false,
          message: 'Error processing your request. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  getKnowledgeBase: publicProcedure.query(() => {
    const entries = QumusKnowledgeBase.getAllEntries();
    const categories = Array.from(new Set(entries.map(e => e.category)));

    return {
      totalEntries: entries.length,
      categories,
      entries: entries.map(e => ({
        topic: e.topic,
        keywords: e.keywords,
      }))
    };
  }),

  getEntriesByCategory: publicProcedure
    .input(z.object({ category: z.string() }))
    .query(({ input }) => {
      const entries = QumusKnowledgeBase.getByCategory(input.category);
      return {
        category: input.category,
        count: entries.length,
        entries: entries.map(e => ({
          topic: e.topic,
          content: e.content,
          keywords: e.keywords,
        })),
      };
    }),
});
