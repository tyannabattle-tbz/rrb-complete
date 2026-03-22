import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { rrbLegacyVaultService } from '../services/rrbLegacyVaultService';
import { rrbSurroundSoundService } from '../services/rrbSurroundSoundService';

export const architectureRestructuringRouter = router({
  // RRB Legacy Vault Procedures
  vault: router({
    addLegacyContent: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          date: z.date(),
          category: z.enum(['broadcast', 'podcast', 'interview', 'event', 'archive']),
          duration: z.number().optional(),
          archiveUrl: z.string().optional(),
          transcription: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        return rrbLegacyVaultService.addLegacyContent({
          id: `content-${Date.now()}`,
          title: input.title,
          description: input.description,
          date: input.date,
          category: input.category,
          duration: input.duration,
          archiveUrl: input.archiveUrl,
          transcription: input.transcription,
        });
      }),

    getAllContent: publicProcedure.query(() => {
      return rrbLegacyVaultService.getAllLegacyContent();
    }),

    getByCategory: publicProcedure
      .input(z.enum(['broadcast', 'podcast', 'interview', 'event', 'archive']))
      .query(({ input }) => {
        return rrbLegacyVaultService.getContentByCategory(input);
      }),

    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => {
        return rrbLegacyVaultService.searchLegacyContent(input.query);
      }),

    getMetrics: publicProcedure.query(() => {
      return rrbLegacyVaultService.getVaultMetrics();
    }),

    getSummary: publicProcedure.query(() => {
      return rrbLegacyVaultService.createLegacyContentSummary();
    }),

    getStatistics: publicProcedure.query(() => {
      return rrbLegacyVaultService.getStatistics();
    }),

    getFeaturedContent: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(({ input }) => {
        return rrbLegacyVaultService.getFeaturedContent(input.limit);
      }),

    getTyOSLink: publicProcedure
      .input(
        z.object({
          type: z.enum(['radio', 'podcast', 'video']),
          channel: z.string().optional(),
        })
      )
      .query(({ input }) => {
        return rrbLegacyVaultService.generateTyOSLink(input.type, input.channel);
      }),
  }),

  // RRB Surround Sound Production Layer
  surroundSound: router({
    startSession: protectedProcedure
      .input(
        z.object({
          contentType: z.enum(['radio', 'podcast', 'video']),
          contentId: z.string(),
          contentTitle: z.string(),
          audioFormat: z.enum(['5.1', '7.1', 'stereo', 'mono']).default('7.1'),
        })
      )
      .mutation(({ input }) => {
        return rrbSurroundSoundService.startSession(
          input.contentType,
          input.contentId,
          input.contentTitle,
          input.audioFormat
        );
      }),

    endSession: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return rrbSurroundSoundService.endSession(input.sessionId);
      }),

    getSession: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(({ input }) => {
        return rrbSurroundSoundService.getSession(input.sessionId);
      }),

    enableSpatialAudio: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return rrbSurroundSoundService.enableSpatialAudio(input.sessionId);
      }),

    disableSpatialAudio: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return rrbSurroundSoundService.disableSpatialAudio(input.sessionId);
      }),

    enableImmersiveMode: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return rrbSurroundSoundService.enableImmersiveMode(input.sessionId);
      }),

    disableImmersiveMode: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(({ input }) => {
        return rrbSurroundSoundService.disableImmersiveMode(input.sessionId);
      }),

    changeAudioFormat: protectedProcedure
      .input(
        z.object({
          sessionId: z.string(),
          format: z.enum(['5.1', '7.1', 'stereo', 'mono']),
        })
      )
      .mutation(({ input }) => {
        return rrbSurroundSoundService.changeAudioFormat(input.sessionId, input.format);
      }),

    getActiveSessions: publicProcedure.query(() => {
      return rrbSurroundSoundService.getAllActiveSessions();
    }),

    getStatistics: publicProcedure.query(() => {
      return rrbSurroundSoundService.getSessionStatistics();
    }),

    getVisualization: publicProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(({ input }) => {
        return rrbSurroundSoundService.createImmersiveVisualization(input.sessionId);
      }),

    addAudioMetadata: protectedProcedure
      .input(
        z.object({
          contentId: z.string(),
          title: z.string(),
          artist: z.string().optional(),
          duration: z.number(),
          bitrate: z.number(),
          sampleRate: z.number(),
          channels: z.number(),
          format: z.string(),
          production: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        rrbSurroundSoundService.addAudioMetadata(input.contentId, {
          title: input.title,
          artist: input.artist,
          duration: input.duration,
          bitrate: input.bitrate,
          sampleRate: input.sampleRate,
          channels: input.channels,
          format: input.format,
          production: input.production,
        });
        return { success: true };
      }),

    addProductionMetadata: protectedProcedure
      .input(
        z.object({
          contentId: z.string(),
          producer: z.string().optional(),
          engineer: z.string().optional(),
          studio: z.string().optional(),
          recordDate: z.date().optional(),
          releaseDate: z.date().optional(),
          credits: z.array(z.string()).optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        rrbSurroundSoundService.addProductionMetadata(input.contentId, {
          producer: input.producer,
          engineer: input.engineer,
          studio: input.studio,
          recordDate: input.recordDate,
          releaseDate: input.releaseDate,
          credits: input.credits,
          notes: input.notes,
        });
        return { success: true };
      }),

    getCompleteProduction: publicProcedure
      .input(z.object({ contentId: z.string() }))
      .query(({ input }) => {
        return rrbSurroundSoundService.getCompleteProduction(input.contentId);
      }),

    exportProductionSummary: publicProcedure
      .input(z.object({ contentId: z.string() }))
      .query(({ input }) => {
        return rrbSurroundSoundService.exportProductionSummary(input.contentId);
      }),
  }),

  // Navigation and Redirects
  navigation: router({
    getTyOSRadioUrl: publicProcedure.query(() => {
      return {
        url: 'https://tyos.manus.space/radio',
        label: 'Listen Live on Ty OS',
      };
    }),

    getHybridCastUrl: publicProcedure.query(() => {
      return {
        url: 'https://hybridcast.manus.space',
        label: 'HybridCast Emergency Broadcast',
      };
    }),

    getRRBLegacyUrl: publicProcedure.query(() => {
      return {
        url: 'https://rrb.manus.space',
        label: 'RRB Legacy Vault',
      };
    }),

    getQumusControlUrl: publicProcedure.query(() => {
      return {
        url: 'https://qumus.manus.space',
        label: 'QUMUS Control Center',
      };
    }),

    getArchitectureStatus: publicProcedure.query(() => {
      return {
        tyOS: {
          role: 'Single Streaming Source',
          status: 'Active',
          channels: 54,
          url: 'https://tyos.manus.space/radio',
        },
        qumus: {
          role: 'Backend Control & Orchestration',
          status: 'Active',
          policies: 20,
          autonomy: '90%',
          url: 'https://qumus.manus.space',
        },
        rrb: {
          role: 'Legacy Vault & Archive',
          status: 'Active',
          url: 'https://rrb.manus.space',
        },
        hybridCast: {
          role: 'Resilience & Emergency Broadcast',
          status: 'Active',
          url: 'https://hybridcast.manus.space',
        },
        rrbSurroundSound: {
          role: 'Final Production Layer',
          status: 'Active',
          features: ['Spatial Audio', 'Immersive Mode', '5.1/7.1 Surround'],
        },
      };
    }),
  }),
});
