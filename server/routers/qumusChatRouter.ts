import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { QumusIdentitySystem } from '../_core/qumusIdentity';
import { CandyIdentitySystem } from '../_core/candyIdentity';
import { SeraphIdentitySystem } from '../_core/seraphIdentity';
import { QumusOrchestrationEngine } from '../_core/qumusOrchestrationEngine';
import { invokeLLM } from '../_core/llm';
import { realTtsService } from '../_core/realTtsService';

// Voice mapping for each persona (server-side Forge TTS)
const PERSONA_VOICES: Record<string, string> = {
  valanna: 'nova',
  candy: 'echo',
  seraph: 'onyx',
};

export const qumusChatRouter = router({
  chat: publicProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })),
      query: z.string(),
      persona: z.enum(['valanna', 'candy', 'seraph']).default('valanna'),
    }))
    .mutation(async ({ input }) => {
      try {
        // Use the selected persona's identity system for system prompt
        const systemPrompt = input.persona === 'candy' 
          ? CandyIdentitySystem.getSystemPrompt() 
          : input.persona === 'seraph'
          ? SeraphIdentitySystem.getSystemPrompt()
          : QumusIdentitySystem.getSystemPrompt();

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

        // Generate TTS audio for the response
        let audioUrl: string | null = null;
        try {
          // Truncate for TTS — max 500 chars to keep audio reasonable
          const ttsText = assistantMessage.length > 500 
            ? assistantMessage.slice(0, 500) + '...' 
            : assistantMessage;
          const voice = PERSONA_VOICES[input.persona] || 'nova';
          const ttsResult = await realTtsService.generateSpeech({
            text: ttsText,
            voice,
            speed: 1.0,
          });
          if (ttsResult.success && ttsResult.audioUrl) {
            audioUrl = ttsResult.audioUrl;
          }
        } catch (ttsErr) {
          console.warn(`[QUMUS Chat] TTS generation failed for ${input.persona}:`, ttsErr);
          // Non-fatal — chat still works without audio
        }

        return {
          success: true,
          message: assistantMessage,
          audioUrl,
          persona: input.persona,
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
