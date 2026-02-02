import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const voiceFeedbackRouter = router({
  // Play audio cue for voice command recognition
  playRecognitionCue: publicProcedure
    .input(z.object({
      type: z.enum(['success', 'error', 'processing', 'listening']),
      volume: z.number().min(0).max(1).default(0.7),
    }))
    .mutation(async ({ input }) => {
      const audioUrls: Record<string, string> = {
        success: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
        error: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
        processing: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
        listening: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
      };

      return {
        success: true,
        audioUrl: audioUrls[input.type],
        volume: input.volume,
        type: input.type,
        timestamp: new Date(),
      };
    }),

  // Trigger haptic feedback on device
  triggerHapticFeedback: publicProcedure
    .input(z.object({
      pattern: z.enum(['tap', 'double-tap', 'pulse', 'success', 'error']),
      intensity: z.number().min(0).max(1).default(0.5),
      duration: z.number().min(10).max(1000).default(100),
    }))
    .mutation(async ({ input }) => {
      // Haptic patterns in milliseconds
      const patterns: Record<string, number[]> = {
        tap: [input.duration],
        'double-tap': [input.duration, 50, input.duration],
        pulse: [input.duration, 100, input.duration, 100, input.duration],
        success: [100, 50, 100, 50, 100],
        error: [200, 100, 200],
      };

      return {
        success: true,
        pattern: input.pattern,
        timing: patterns[input.pattern],
        intensity: input.intensity,
        duration: input.duration,
        timestamp: new Date(),
      };
    }),

  // Get voice feedback preferences
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    return {
      audioEnabled: true,
      hapticEnabled: true,
      audioVolume: 0.7,
      hapticIntensity: 0.5,
      feedbackDelay: 100, // milliseconds
      userId: ctx.user.id,
    };
  }),

  // Update voice feedback preferences
  updatePreferences: protectedProcedure
    .input(z.object({
      audioEnabled: z.boolean().optional(),
      hapticEnabled: z.boolean().optional(),
      audioVolume: z.number().min(0).max(1).optional(),
      hapticIntensity: z.number().min(0).max(1).optional(),
      feedbackDelay: z.number().min(0).max(1000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // In a real app, this would update user preferences in the database
      return {
        success: true,
        preferences: {
          audioEnabled: input.audioEnabled ?? true,
          hapticEnabled: input.hapticEnabled ?? true,
          audioVolume: input.audioVolume ?? 0.7,
          hapticIntensity: input.hapticIntensity ?? 0.5,
          feedbackDelay: input.feedbackDelay ?? 100,
          userId: ctx.user.id,
          updatedAt: new Date(),
        },
      };
    }),

  // Log voice feedback event for analytics
  logFeedbackEvent: protectedProcedure
    .input(z.object({
      eventType: z.enum(['recognition', 'execution', 'error', 'completion']),
      feedbackType: z.enum(['audio', 'haptic', 'both', 'none']),
      commandType: z.string(),
      success: z.boolean(),
      duration: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        event: {
          id: `event-${Date.now()}`,
          userId: ctx.user.id,
          eventType: input.eventType,
          feedbackType: input.feedbackType,
          commandType: input.commandType,
          success: input.success,
          duration: input.duration,
          timestamp: new Date(),
        },
      };
    }),

  // Get voice feedback analytics
  getAnalytics: protectedProcedure
    .input(z.object({
      timeRange: z.enum(['1h', '24h', '7d', '30d']).default('24h'),
    }))
    .query(async ({ ctx, input }) => {
      return {
        timeRange: input.timeRange,
        totalEvents: 156,
        recognitionSuccess: 0.94,
        averageFeedbackLatency: 87, // milliseconds
        preferredFeedbackType: 'both',
        userPreferences: {
          audioEnabled: true,
          hapticEnabled: true,
          audioVolume: 0.7,
          hapticIntensity: 0.5,
        },
        topCommands: [
          { command: 'generate', count: 45, successRate: 0.96 },
          { command: 'export', count: 32, successRate: 0.91 },
          { command: 'analyze', count: 28, successRate: 0.89 },
        ],
      };
    }),
});
