import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

const onboardingSchema = z.object({
  platformName: z.string().min(1, 'Platform name is required'),
  email: z.string().email('Valid email required'),
  platform: z.enum(['squadd', 'solbones', 'other']),
  rtmpUrl: z.string().url('Valid RTMP URL required'),
  streamKey: z.string().min(1, 'Stream key is required'),
  moderators: z.array(z.string().email()).default([]),
  logoUrl: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Valid hex color required'),
});

export const broadcasterOnboardingRouter = router({
  completeOnboarding: protectedProcedure
    .input(onboardingSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Store onboarding data
        const onboardingData = {
          userId: ctx.user.id,
          ...input,
          completedAt: new Date(),
        };

        // In a real app, this would be saved to database
        console.log('Broadcaster onboarding completed:', onboardingData);

        return {
          success: true,
          message: 'Broadcaster onboarding completed successfully',
          platformId: `${input.platform}-${ctx.user.id}`,
        };
      } catch (error) {
        throw new Error('Failed to complete onboarding');
      }
    }),

  getStatus: protectedProcedure.query(async ({ ctx }) => {
    // Check if user has completed onboarding
    return {
      isCompleted: false,
      platform: null,
      completedAt: null,
    };
  }),

  getConfig: protectedProcedure
    .input(z.enum(['squadd', 'solbones', 'other']))
    .query(({ input }) => {
      const configs = {
        squadd: {
          name: 'SQUADD Broadcast',
          description: 'Sisters Questing Unapologetically After Divine Destiny',
          primaryColor: '#EF4444',
          features: ['live-streaming', 'chat', 'polls', 'donations', 'recording'],
        },
        solbones: {
          name: 'Solbones Podcast',
          description: 'Sacred Math Dice Game & Podcast Platform',
          primaryColor: '#8B5CF6',
          features: ['podcast-hosting', 'episode-management', 'rss-feeds', 'frequency-tuner'],
        },
        other: {
          name: 'Custom Platform',
          description: 'Create your own broadcast platform',
          primaryColor: '#3B82F6',
          features: ['live-streaming', 'chat', 'recording'],
        },
      };

      return configs[input];
    }),
});
