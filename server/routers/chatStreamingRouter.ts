import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { invokeLLM } from '../_core/llm';
import { QumusIdentitySystem } from '../_core/qumusIdentity';

export const chatStreamingRouter = router({
  /**
   * Stream chat responses in real-time using SSE
   */
  streamChat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
      query: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Use QUMUS identity system for system prompt
        const systemPrompt = QumusIdentitySystem.getSystemPrompt();

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

        // Call LLM with streaming support
        const response = await invokeLLM({
          messages: messages,
          stream: true,
        });

        // Return streaming response
        return {
          success: true,
          stream: response,
        };
      } catch (error) {
        console.error('Chat streaming error:', error);
        return {
          success: false,
          message: 'Failed to stream response. Please try again.',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  /**
   * Get streaming status
   */
  getStreamStatus: publicProcedure.query(async () => {
    return {
      streaming: false,
      active: 0,
      timestamp: new Date(),
    };
  }),
});
