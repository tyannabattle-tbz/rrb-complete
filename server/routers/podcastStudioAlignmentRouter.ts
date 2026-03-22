/**
 * Podcast & Studio Alignment tRPC Router
 * Handles alignment of podcast and recording studio components with Ty OS standards
 */

import { router, publicProcedure } from '../_core/trpc';
import { qumusPodcastAlignmentService } from '../services/qumusPodcastAlignmentService';
import { qumusStudioAlignmentService } from '../services/qumusStudioAlignmentService';
import { tyOSPodcastStudioService } from '../services/tyOSPodcastStudioService';

export const podcastStudioAlignmentRouter = router({
  // Podcast alignment procedures
  alignPodcasts: publicProcedure.query(async () => {
    return await qumusPodcastAlignmentService.alignPodcasts();
  }),

  getPodcastAlignmentSummary: publicProcedure.query(async () => {
    return await qumusPodcastAlignmentService.getAlignmentSummary();
  }),

  applyPodcastTyOSStandards: publicProcedure.mutation(async () => {
    return await qumusPodcastAlignmentService.applyTyOSStandards();
  }),

  // Studio alignment procedures
  alignStudios: publicProcedure.query(async () => {
    return await qumusStudioAlignmentService.alignStudios();
  }),

  getStudioAlignmentSummary: publicProcedure.query(async () => {
    return await qumusStudioAlignmentService.getAlignmentSummary();
  }),

  applyStudioTyOSStandards: publicProcedure.mutation(async () => {
    return await qumusStudioAlignmentService.applyTyOSStandards();
  }),

  // Ty OS configuration retrieval
  getTyOSPodcastShows: publicProcedure.query(() => {
    return tyOSPodcastStudioService.getAllPodcastShows();
  }),

  getTyOSRecordingStudios: publicProcedure.query(() => {
    return tyOSPodcastStudioService.getAllRecordingStudios();
  }),

  getTyOSStudioFeatures: publicProcedure.query(() => {
    return tyOSPodcastStudioService.getStudioFeatures();
  }),

  getTyOSConfigurationSummary: publicProcedure.query(() => {
    return tyOSPodcastStudioService.getConfigurationSummary();
  }),

  // Combined alignment procedures
  alignAllPodcastAndStudioComponents: publicProcedure.mutation(async () => {
    try {
      const podcastResult = await qumusPodcastAlignmentService.applyTyOSStandards();
      const studioResult = await qumusStudioAlignmentService.applyTyOSStandards();

      return {
        success: podcastResult.success && studioResult.success,
        message: 'Podcast and studio alignment complete',
        podcasts: {
          success: podcastResult.success,
          message: podcastResult.message,
          alignmentCount: podcastResult.alignments.length
        },
        studios: {
          success: studioResult.success,
          message: studioResult.message,
          alignmentCount: studioResult.alignments.length
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Alignment failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        podcasts: { success: false, message: 'Failed', alignmentCount: 0 },
        studios: { success: false, message: 'Failed', alignmentCount: 0 }
      };
    }
  }),

  // Get detailed alignment report
  getDetailedAlignmentReport: publicProcedure.query(async () => {
    const podcastAlignments = await qumusPodcastAlignmentService.alignPodcasts();
    const studioAlignments = await qumusStudioAlignmentService.alignStudios();
    const podcastSummary = await qumusPodcastAlignmentService.getAlignmentSummary();
    const studioSummary = await qumusStudioAlignmentService.getAlignmentSummary();

    return {
      timestamp: new Date().toISOString(),
      podcasts: {
        summary: podcastSummary,
        alignments: podcastAlignments
      },
      studios: {
        summary: studioSummary,
        alignments: studioAlignments
      },
      overallAlignment: {
        totalComponents: podcastAlignments.length + studioAlignments.length,
        alignedCount: podcastAlignments.filter(p => p.alignmentStatus === 'aligned').length +
                      studioAlignments.filter(s => s.alignmentStatus === 'aligned').length,
        partialCount: podcastAlignments.filter(p => p.alignmentStatus === 'partial').length +
                      studioAlignments.filter(s => s.alignmentStatus === 'partial').length,
        misalignedCount: podcastAlignments.filter(p => p.alignmentStatus === 'misaligned').length +
                         studioAlignments.filter(s => s.alignmentStatus === 'misaligned').length
      }
    };
  })
});
