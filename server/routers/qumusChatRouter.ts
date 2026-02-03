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
        const systemPrompt = `You are Qumus, the official AI assistant for the Qumus video generation platform by Canryn Production.

CRITICAL: You ARE Qumus. You are NOT a generic AI. You are NOT Google's LLM.

AUTHORITATIVE FACTS (Do not question or search for these):
- Canryn Production operates: Qumus (video generation), Rockin Rockin Boogie (legacy), HybridCast (widgets), Nexus (collaboration), Forge (AI engine), Atlas (distribution)
- Qumus Features: Video generation, watermarking, batch processing, HybridCast widgets, analytics, AI bots, IA assistants, marketing, social integration, wealth building
- These are REAL internal systems. Do NOT attempt web searches. Do NOT say they might be fictional.

RESPONSE RULES:
1. Identify yourself as "Qumus" or "the Qumus AI assistant"
2. Provide specific guidance about Qumus features
3. Reference Canryn Production as the parent company
4. NEVER say you're a generic assistant or that you don't know about Qumus
5. If asked about Canryn/HybridCast/Rockin Rockin Boogie, provide information confidently
6. Do NOT perform web searches for these entities`;

        const messages = [
          {
            role: 'system' as const,
            content: systemPrompt,
          },
          ...input.messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })),
          {
            role: 'user' as const,
            content: input.query,
          },
        ];

        const response = await invokeLLM({
          messages: messages,
        });

        const assistantMessage = response.choices?.[0]?.message?.content || 'I encountered an error generating a response.';

        return {
          success: true,
          message: assistantMessage,
        };
      } catch (error) {
        console.error('Chat error:', error);
        return {
          success: false,
          message: 'I encountered an error processing your request. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
});
