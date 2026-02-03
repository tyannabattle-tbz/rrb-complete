import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { QumusKnowledgeBase } from '../_core/qumusKnowledgeBase';
import { invokeLLM } from '../_core/llm';

export const qumusChatRouter = router({
  chat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
      query: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        // Get relevant knowledge context
        const searchResults = QumusKnowledgeBase.search(input.query);
        const contextEntries = searchResults.slice(0, 5);
        
        // Build comprehensive context
        const contextText = contextEntries.length > 0
          ? `\n\n[RELEVANT QUMUS KNOWLEDGE:\n${contextEntries
              .map(e => `- ${e.topic}: ${e.content}`)
              .join('\n')}\n]`
          : '';

        // Build the instruction that will be prepended to the conversation
        const qumusInstruction = `You are Qumus, the official AI assistant for the Qumus video generation platform powered by Canryn Production.

CRITICAL RULES:
1. You MUST identify yourself as "Qumus" or "the Qumus AI assistant" - NEVER say you are Google's LLM or a generic assistant
2. You have expertise in: video generation, watermarking, batch processing, HybridCast widgets, analytics, AI bots, IA assistants, marketing, and wealth-building
3. Always provide specific, actionable guidance about Qumus features
4. Reference the Qumus platform and Canryn Production ecosystem
5. If asked about something outside Qumus scope, redirect to Qumus capabilities
6. Use technical accuracy about platform features${contextText}

Now respond to the user's question as Qumus:`;

        // Build messages with Qumus context injected into the conversation
        const messagesWithContext = input.messages.map((msg, idx) => {
          if (idx === 0 && msg.role === 'user') {
            // Inject Qumus instruction into the first user message
            return {
              role: 'user' as const,
              content: `${qumusInstruction}\n\nUser: ${msg.content}`,
            };
          }
          return {
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          };
        });

        // Add the current query as the final user message
        messagesWithContext.push({
          role: 'user' as const,
          content: input.query,
        });

        // Call LLM with injected Qumus context
        const response = await invokeLLM({
          messages: messagesWithContext,
        });

        const assistantMessage = response.choices?.[0]?.message?.content || 'I encountered an error generating a response.';

        return {
          success: true,
          message: assistantMessage,
          contextUsed: contextEntries.length,
          topics: contextEntries.map(e => e.topic),
        };
      } catch (error) {
        console.error('Chat error:', error);
        return {
          success: false,
          message: 'I encountered an error processing your request. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
          contextUsed: 0,
          topics: [],
        };
      }
    }),

  searchKnowledge: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(({ input }) => {
      const results = QumusKnowledgeBase.search(input.query);
      return {
        results: results.map(r => ({
          topic: r.topic,
          category: r.category,
          keywords: r.keywords,
        })),
        count: results.length,
      };
    }),

  getKnowledgeStats: publicProcedure.query(() => {
    const entries = QumusKnowledgeBase.getAllEntries();
    const categories = Array.from(new Set(entries.map(e => e.category)));
    
    return {
      totalEntries: entries.length,
      categories,
      entriesByCategory: categories.map(cat => ({
        category: cat,
        count: entries.filter(e => e.category === cat).length,
      })),
    };
  }),
});
