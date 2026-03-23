/**
 * Production Ecosystem Router
 * Integrates all professional media production services into unified tRPC interface
 * Handles video, audio, transcoding, QA, and distribution workflows
 */

import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { professionalVideoProductionService } from '../services/professionalVideoProductionService';
import { professionalAudioProductionService } from '../services/professionalAudioProductionService';
import { automatedProductionPipelineService } from '../services/automatedProductionPipelineService';

export const productionEcosystemRouter = router({
  // Video Production Procedures
  video: router({
    createProject: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          format: z.enum(['4K', '8K', '1080p', '720p']),
          frameRate: z.enum([24, 25, 30, 50, 60]),
          codec: z.enum(['h264', 'h265', 'prores', 'dnxhd', 'cineform']),
          colorSpace: z.enum(['rec709', 'rec2020', 'dci_p3', 'aces']),
          hdrMode: z.enum(['none', 'hdr10', 'dolby_vision', 'hlg']),
        })
      )
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.createProject(
          input.name,
          input.format,
          input.frameRate as any,
          input.codec,
          input.colorSpace,
          input.hdrMode
        );
      }),

    uploadClip: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          filename: z.string(),
          duration: z.number(),
          format: z.string(),
          resolution: z.string(),
          frameRate: z.number(),
          codec: z.string(),
          fileSize: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.uploadClip(
          input.projectId,
          input.filename,
          input.duration,
          input.format,
          input.resolution,
          input.frameRate,
          input.codec,
          input.fileSize
        );
      }),

    applyColorGrading: protectedProcedure
      .input(
        z.object({
          clipId: z.string(),
          profile: z.object({
            name: z.string().optional(),
            lut: z.string().optional(),
            brightness: z.number().optional(),
            contrast: z.number().optional(),
            saturation: z.number().optional(),
            temperature: z.number().optional(),
            tint: z.number().optional(),
            highlights: z.number().optional(),
            shadows: z.number().optional(),
            midtones: z.number().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.applyColorGrading(input.clipId, input.profile);
      }),

    addEffect: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          effectType: z.enum(['transition', 'filter', 'overlay', 'text', 'audio']),
          duration: z.number(),
          parameters: z.record(z.any()),
        })
      )
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.addEffect(
          input.projectId,
          input.effectType,
          input.duration,
          input.parameters
        );
      }),

    runQualityAssurance: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.runQualityAssurance(input.projectId);
      }),

    detectScenes: protectedProcedure
      .input(z.object({ clipId: z.string() }))
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.detectScenes(input.clipId);
      }),

    generateAutoEdit: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.generateAutoEdit(input.projectId);
      }),

    exportProject: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          exportFormat: z.enum(['mp4', 'prores', 'dnxhd', 'dcp']),
          resolution: z.enum(['4K', '1080p', '720p']),
        })
      )
      .mutation(async ({ input }) => {
        return professionalVideoProductionService.exportProject(
          input.projectId,
          input.exportFormat,
          input.resolution
        );
      }),

    getProject: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return professionalVideoProductionService.getProject(input.projectId);
      }),

    getProjectClips: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return professionalVideoProductionService.getProjectClips(input.projectId);
      }),
  }),

  // Audio Production Procedures
  audio: router({
    createProject: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          sampleRate: z.enum([44100, 48000, 96000, 192000]),
          bitDepth: z.enum([16, 24, 32]),
          channels: z.enum(['mono', 'stereo', '5.1', '7.1', 'atmos']),
          format: z.enum(['wav', 'aiff', 'flac', 'dolby_atmos']),
        })
      )
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.createProject(
          input.name,
          input.sampleRate as any,
          input.bitDepth as any,
          input.channels,
          input.format
        );
      }),

    addTrack: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          name: z.string(),
          type: z.enum(['voice', 'music', 'sfx', 'ambience', 'dialogue']),
          duration: z.number(),
          sampleRate: z.number(),
          bitDepth: z.number(),
          channels: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.addTrack(
          input.projectId,
          input.name,
          input.type,
          input.duration,
          input.sampleRate,
          input.bitDepth,
          input.channels
        );
      }),

    adjustTrackLevel: protectedProcedure
      .input(
        z.object({
          trackId: z.string(),
          volume: z.number(),
          pan: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.adjustTrackLevel(input.trackId, input.volume, input.pan);
      }),

    applyMasteringProfile: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          profile: z.object({
            name: z.string().optional(),
            targetLoudness: z.number().optional(),
            peakLevel: z.number().optional(),
            truePeak: z.number().optional(),
            loudnessRange: z.number().optional(),
            equalization: z.record(z.number()).optional(),
            compression: z.object({
              ratio: z.number().optional(),
              threshold: z.number().optional(),
              attack: z.number().optional(),
              release: z.number().optional(),
            }).optional(),
            limiting: z.object({
              threshold: z.number().optional(),
              release: z.number().optional(),
            }).optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.applyMasteringProfile(input.projectId, input.profile);
      }),

    recordVoiceOver: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          talent: z.string(),
          script: z.string(),
          language: z.string(),
          recordingQuality: z.enum(['broadcast', 'podcast', 'web']),
        })
      )
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.recordVoiceOver(
          input.projectId,
          input.talent,
          input.script,
          input.language,
          input.recordingQuality
        );
      }),

    processVoiceOver: protectedProcedure
      .input(z.object({ sessionId: z.string() }))
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.processVoiceOver(input.sessionId);
      }),

    analyzeAudio: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.analyzeAudio(input.projectId);
      }),

    createSurroundMix: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          surroundFormat: z.enum(['5.1', '7.1', 'atmos']),
        })
      )
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.createSurroundMix(input.projectId, input.surroundFormat);
      }),

    exportAudio: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          exportFormat: z.enum(['wav', 'aiff', 'flac', 'mp3', 'aac']),
          sampleRate: z.number(),
          bitDepth: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return professionalAudioProductionService.exportAudio(
          input.projectId,
          input.exportFormat,
          input.sampleRate,
          input.bitDepth
        );
      }),

    getProject: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return professionalAudioProductionService.getProject(input.projectId);
      }),

    getProjectTracks: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ input }) => {
        return professionalAudioProductionService.getProjectTracks(input.projectId);
      }),
  }),

  // Production Pipeline Procedures
  pipeline: router({
    createTranscodingJob: protectedProcedure
      .input(
        z.object({
          sourceFile: z.string(),
          targetFormat: z.string(),
          targetResolution: z.string(),
          targetCodec: z.string(),
          bitrate: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.createTranscodingJob(
          input.sourceFile,
          input.targetFormat,
          input.targetResolution,
          input.targetCodec,
          input.bitrate
        );
      }),

    createQAJob: protectedProcedure
      .input(z.object({ sourceFile: z.string() }))
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.createQAJob(input.sourceFile);
      }),

    generateMetadata: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          duration: z.number(),
          format: z.string(),
          resolution: z.string(),
          frameRate: z.number(),
          codec: z.string(),
          language: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.generateMetadataPackage(
          input.title,
          input.description,
          input.duration,
          input.format,
          input.resolution,
          input.frameRate,
          input.codec,
          input.language
        );
      }),

    checkPlatformCompliance: protectedProcedure
      .input(
        z.object({
          sourceFile: z.string(),
          platform: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.checkPlatformCompliance(input.sourceFile, input.platform);
      }),

    addWatermark: protectedProcedure
      .input(
        z.object({
          sourceFile: z.string(),
          watermarkText: z.string(),
          position: z.enum(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']),
        })
      )
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.addWatermark(
          input.sourceFile,
          input.watermarkText,
          input.position
        );
      }),

    applyDRM: protectedProcedure
      .input(
        z.object({
          sourceFile: z.string(),
          drmType: z.enum(['widevine', 'playready', 'fairplay']),
        })
      )
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.applyDRM(input.sourceFile, input.drmType);
      }),

    archiveWithBlockchain: protectedProcedure
      .input(
        z.object({
          sourceFile: z.string(),
          metadata: z.record(z.any()),
        })
      )
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.archiveWithBlockchain(input.sourceFile, input.metadata);
      }),

    getTranscodingStatus: protectedProcedure
      .input(z.object({ jobId: z.string() }))
      .query(async ({ input }) => {
        return automatedProductionPipelineService.getTranscodingStatus(input.jobId);
      }),

    getQAStatus: protectedProcedure
      .input(z.object({ jobId: z.string() }))
      .query(async ({ input }) => {
        return automatedProductionPipelineService.getQAStatus(input.jobId);
      }),

    batchProcess: protectedProcedure
      .input(
        z.object({
          files: z.array(
            z.object({
              sourceFile: z.string(),
              targetFormat: z.string(),
              targetResolution: z.string(),
            })
          ),
          options: z.object({
            qaEnabled: z.boolean(),
            complianceCheck: z.boolean(),
            platform: z.string().optional(),
          }),
        })
      )
      .mutation(async ({ input }) => {
        return automatedProductionPipelineService.batchProcess(input.files, input.options);
      }),
  }),
});
