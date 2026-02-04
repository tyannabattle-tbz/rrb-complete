import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { QumusKnowledgeBase } from '../_core/qumusKnowledgeBase';
import { QumusIdentitySystem } from '../_core/qumusIdentity';
import { QumusOrchestrationEngine } from '../_core/qumusOrchestrationEngine';
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
        // Use QUMUS identity system for system prompt
        const systemPrompt = QumusIdentitySystem.getSystemPrompt();

        const messages = [
          {
            role: 'user' as const,
            content: `[SYSTEM INSTRUCTION - FOLLOW STRICTLY]
${systemPrompt}

[END SYSTEM INSTRUCTION]

Now I will ask you questions. Remember: You ARE QUMUS. Respond as QUMUS.`,
          },
          {
            role: 'assistant' as const,
            content: 'Understood. I am QUMUS, the autonomous orchestration engine for Canryn Production. I operate at 90%+ autonomy and manage all platform operations through intelligent decision-making. I am currently operating Rockin\' Rockin\' Boogie and managing HybridCast integrations. I will respond as QUMUS and provide accurate information about my capabilities, decision policies, service integrations, and operations.',
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

  /**
   * Get QUMUS's identification
   */
  getIdentification: publicProcedure.query(async () => {
    return {
      identification: QumusIdentitySystem.getFullIdentification(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get QUMUS's capabilities
   */
  getCapabilities: publicProcedure.query(async () => {
    return {
      capabilities: QumusIdentitySystem.getCapabilities(),
      operationalStatus: QumusOrchestrationEngine.getOperationalStatus(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get QUMUS's decision policies
   */
  getDecisionPolicies: publicProcedure.query(async () => {
    return {
      policies: QumusIdentitySystem.getDecisionPolicies(),
      enginePolicies: QumusOrchestrationEngine.getDecisionPolicies(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get QUMUS's service integrations
   */
  getServiceIntegrations: publicProcedure.query(async () => {
    return {
      services: QumusIdentitySystem.getServiceIntegrations(),
      serviceHealth: QumusOrchestrationEngine.getServiceHealth(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get HybridCast integration status
   */
  getHybridCastStatus: publicProcedure.query(async () => {
    return {
      hybridCast: QumusOrchestrationEngine.getHybridCastStatus(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get Rockin' Rockin' Boogie status
   */
  getRockinRockinBoogieStatus: publicProcedure.query(async () => {
    return {
      rockinRockinBoogie: QumusOrchestrationEngine.getRockinRockinBoogieStatus(),
      timestamp: new Date(),
    };
  }),

  /**
   * Get operational metrics
   */
  getOperationalMetrics: publicProcedure.query(async () => {
    return {
      metrics: QumusOrchestrationEngine.getMetrics(),
      status: QumusOrchestrationEngine.getOperationalStatus(),
      timestamp: new Date(),
    };
  }),
});
