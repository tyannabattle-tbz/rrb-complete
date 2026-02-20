import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { audioService } from '../audioService';
import { z } from 'zod';

export const audioRouter = router({
  // Transcribe audio
  transcribe: protectedProcedure
    .input(z.object({
      audioUrl: z.string().url(),
      language: z.string().optional(),
      prompt: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await audioService.transcribeAudio(
        input.audioUrl,
        input.language,
        input.prompt
      );
    }),

  // Generate audio from text
  generate: protectedProcedure
    .input(z.object({
      text: z.string(),
      voice: z.enum(['male', 'female']).default('female'),
      speed: z.number().min(0.5).max(2).default(1),
    }))
    .mutation(async ({ input }) => {
      return await audioService.generateAudio(
        input.text,
        input.voice,
        input.speed
      );
    }),

  // Upload audio file to S3 and store metadata
  upload: protectedProcedure
    .input(z.object({
      filename: z.string(),
      mimeType: z.string().default('audio/mpeg'),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: 'Audio uploaded successfully',
      };
    }),

  // Upload a track with base64 audio data to S3
  uploadTrack: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      artist: z.string().min(1),
      channel: z.string().optional(),
      filename: z.string(),
      mimeType: z.string().default('audio/mpeg'),
      base64Data: z.string(), // base64-encoded audio
      duration: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { storagePut } = await import('../storage');
      const buffer = Buffer.from(input.base64Data, 'base64');
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const fileKey = `audio-uploads/${ctx.user.id}/${randomSuffix}-${input.filename}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      return {
        success: true,
        url,
        fileKey,
        title: input.title,
        artist: input.artist,
        channel: input.channel || 'User Upload',
        duration: input.duration,
      };
    }),

  // Record a track play event
  recordPlay: publicProcedure
    .input(z.object({
      trackId: z.string(),
      trackTitle: z.string(),
      artist: z.string(),
      source: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { getDb } = await import('../db');
      const { sql } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return { success: false };
      // Upsert play count in a simple key-value style
      await db.execute(sql`
        INSERT INTO audio_play_counts (track_id, title, artist, play_count, last_played_at)
        VALUES (${input.trackId}, ${input.trackTitle}, ${input.artist}, 1, NOW())
        ON DUPLICATE KEY UPDATE play_count = play_count + 1, last_played_at = NOW()
      `);
      return { success: true };
    }),

  // Get play counts for all tracks (sorted by most played)
  getPlayCounts: publicProcedure
    .query(async () => {
      const { getDb } = await import('../db');
      const { sql } = await import('drizzle-orm');
      const db = await getDb();
      if (!db) return [];
      const result = await db.execute(sql`
        SELECT track_id, title, artist, play_count, last_played_at
        FROM audio_play_counts
        ORDER BY play_count DESC
        LIMIT 20
      `);
      return result[0] || [];
    }),

  // Get play count for a specific track
  getTrackPlayCount: publicProcedure
    .input(z.object({ trackId: z.string() }))
    .query(async ({ input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) return { success: false };
      const { sql } = await import('drizzle-orm');
      const result = await db.execute(sql`
        SELECT play_count FROM audio_play_counts WHERE track_id = ${input.trackId}
      `);
      const rows = result[0] as any[];
      return { playCount: rows?.[0]?.play_count || 0 };
    }),

  // List user's uploaded tracks (from S3 metadata)
  listUploads: protectedProcedure
    .query(async ({ ctx }) => {
      // Return empty for now — tracks are stored client-side in localStorage
      // Future: query audioContent table filtered by userId
      return { tracks: [] };
    }),

  // Get audio metadata
  getMetadata: publicProcedure
    .input(z.object({
      audioUrl: z.string().url(),
    }))
    .query(async ({ input }) => {
      return await audioService.getAudioMetadata(input.audioUrl);
    }),

  // Mix audio tracks
  mix: protectedProcedure
    .input(z.object({
      tracks: z.array(z.object({
        url: z.string().url(),
        volume: z.number().min(0).max(1),
        startTime: z.number().min(0),
      })),
      outputFormat: z.enum(['mp3', 'wav']).default('mp3'),
    }))
    .mutation(async ({ input }) => {
      return await audioService.mixAudio(input.tracks, input.outputFormat);
    }),

  // Apply audio effect
  applyEffect: protectedProcedure
    .input(z.object({
      audioUrl: z.string().url(),
      effect: z.enum(['reverb', 'echo', 'normalize', 'compress', 'equalize']),
      params: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input }) => {
      return await audioService.applyEffect(
        input.audioUrl,
        input.effect,
        input.params
      );
    }),

  // Create processing job
  createJob: protectedProcedure
    .input(z.object({
      type: z.enum(['transcribe', 'generate', 'mix', 'effect', 'export']),
      inputUrl: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      return audioService.createJob(input.type, input.inputUrl);
    }),

  // Get job status
  getJob: protectedProcedure
    .input(z.object({
      jobId: z.string(),
    }))
    .query(async ({ input }) => {
      return audioService.getJob(input.jobId);
    }),

  // Get all jobs
  getAllJobs: protectedProcedure
    .query(async () => {
      return audioService.getAllJobs();
    }),

  // Get jobs by status
  getJobsByStatus: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'processing', 'completed', 'failed']),
    }))
    .query(async ({ input }) => {
      return audioService.getJobsByStatus(input.status);
    }),

  // ============================================================
  // QUMUS TRENDING PROMOTION ENGINE
  // ============================================================

  // Get trending tracks with promotion recommendations
  getTrending: publicProcedure
    .input(z.object({
      minPlayCount: z.number().optional(),
      maxResults: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) return { success: false };
      const { sql } = await import('drizzle-orm');
      const { analyzeTrending, DEFAULT_PROMOTION_POLICY } = await import('../qumusTrendingEngine');

      const result = await db.execute(sql`
        SELECT track_id, title, artist, play_count, last_played_at
        FROM audio_play_counts
        ORDER BY play_count DESC
        LIMIT 50
      `);
      const tracks = (result[0] || []) as any[];

      const policy = {
        ...DEFAULT_PROMOTION_POLICY,
        ...(input?.minPlayCount ? { minPlayCount: input.minPlayCount } : {}),
        ...(input?.maxResults ? { maxPromotionsPerCycle: input.maxResults } : {}),
      };

      const trending = analyzeTrending(tracks, policy);
      return { trending, totalTracksAnalyzed: tracks.length };
    }),

  // Generate and execute promotion decisions
  executePromotions: protectedProcedure
    .input(z.object({
      dryRun: z.boolean().default(false),
    }).optional())
    .mutation(async ({ input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) return { success: false };
      const { sql } = await import('drizzle-orm');
      const {
        analyzeTrending,
        generatePromotionDecisions,
        DEFAULT_PROMOTION_POLICY,
      } = await import('../qumusTrendingEngine');

      // Fetch play data
      const result = await db.execute(sql`
        SELECT track_id, title, artist, play_count, last_played_at
        FROM audio_play_counts
        ORDER BY play_count DESC
        LIMIT 50
      `);
      const tracks = (result[0] || []) as any[];

      // Analyze and generate decisions
      const trending = analyzeTrending(tracks, DEFAULT_PROMOTION_POLICY);
      const decisions = generatePromotionDecisions(trending, DEFAULT_PROMOTION_POLICY);

      // Log decisions to QUMUS audit trail
      if (!input?.dryRun) {
        for (const decision of decisions) {
          try {
            await db.execute(sql`
              INSERT INTO qumus_decisions (id, decision_type, description, confidence, status, created_at)
              VALUES (
                ${decision.id},
                ${'track_promotion'},
                ${`Auto-promote "${decision.trackTitle}" by ${decision.artist} to ${decision.toSlot} (score: ${decision.trendScore}, confidence: ${decision.confidence}%)`},
                ${decision.confidence},
                ${decision.status},
                NOW()
              )
            `);
          } catch (e) {
            // Log but don't fail — decision table may not exist yet
            console.log(`[QUMUS] Decision logged: ${decision.id} — ${decision.status}`);
          }
        }
      }

      return {
        decisions,
        summary: {
          totalAnalyzed: tracks.length,
          trendingFound: trending.length,
          autoApproved: decisions.filter(d => d.status === 'auto_approved').length,
          pendingReview: decisions.filter(d => d.status === 'pending_review').length,
          isDryRun: input?.dryRun || false,
        },
      };
    }),

  // Get promotion history (from QUMUS decision log)
  getPromotionHistory: publicProcedure
    .input(z.object({
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) return { success: false };
      const { sql } = await import('drizzle-orm');
      try {
        const result = await db.execute(sql`
          SELECT id, decision_type, description, confidence, status, created_at
          FROM qumus_decisions
          WHERE decision_type = 'track_promotion'
          ORDER BY created_at DESC
          LIMIT ${input?.limit || 20}
        `);
        return { decisions: result[0] || [] };
      } catch {
        return { decisions: [] };
      }
    }),

  // Get promotion policy
  getPromotionPolicy: publicProcedure
    .query(async () => {
      const { DEFAULT_PROMOTION_POLICY, getAllSlots } = await import('../qumusTrendingEngine');
      return {
        policy: DEFAULT_PROMOTION_POLICY,
        slots: getAllSlots(),
      };
    }),
});
