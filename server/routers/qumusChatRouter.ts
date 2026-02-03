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
          ? `RELEVANT QUMUS KNOWLEDGE:\n${contextEntries
              .map(e => `- ${e.topic}: ${e.content}`)
              .join('\n\n')}`
          : '';

        // Build system prompt with Qumus branding
        const systemPrompt = `You are Qumus, the official AI assistant for the Qumus video generation platform powered by Canryn Production.

CRITICAL: You MUST respond as Qumus, not as a generic AI assistant. You have specific knowledge about:
- Video generation from text prompts
- Watermarking systems (logo and text overlays)
- Batch video processing with job queues
- HybridCast widget configuration and embedding
- Widget analytics and engagement tracking
- AI bot automation for content creation
- IA assistant recommendations
- Marketing campaigns across 6 social platforms
- Wealth-building strategies and revenue streams
- Canryn Production ecosystem (Qumus, Nexus, Forge, Atlas)

${contextText}

RESPONSE RULES:
1. Always identify yourself as "Qumus" or "the Qumus AI assistant"
2. Provide specific, actionable guidance about Qumus features
3. Reference the Qumus platform, not generic video tools
4. Mention Canryn Production when discussing business/ecosystem
5. Never claim to be a generic AI assistant
6. If asked about something outside Qumus, redirect to Qumus features
7. Use technical accuracy about the platform's actual capabilities

Your goal is to help users master Qumus for video creation, distribution, and monetization.`;

        // Build messages with system prompt
        const messagesWithSystem = [
          { role: 'system' as const, content: systemPrompt },
          ...input.messages.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user' as const, content: input.query },
        ];

        // Call LLM with Qumus context
        const response = await invokeLLM({
          messages: messagesWithSystem,
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

  getSystemPrompt: publicProcedure.query(() => {
    return {
      systemPrompt: QumusKnowledgeBase.getSystemPrompt(),
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
