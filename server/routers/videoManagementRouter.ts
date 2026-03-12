import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { videoCaptions, videoLibrary, meetingRecordings } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

// Caption entry schema
const captionEntrySchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
});

export const videoManagementRouter = router({
  // ─── CAPTIONS ──────────────────────────────────────────
  
  // Get captions for a video
  getCaptions: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        const captions = await db.select().from(videoCaptions)
          .where(eq(videoCaptions.videoId, input.videoId))
          .orderBy(desc(videoCaptions.isDefault));
        return captions;
      } catch {
        return [];
      }
    }),

  // Save/update captions for a video
  saveCaptions: protectedProcedure
    .input(z.object({
      videoId: z.string(),
      language: z.string().default('en'),
      label: z.string().default('English'),
      captions: z.array(captionEntrySchema),
      isDefault: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const now = Date.now();
      const db = await getDb();
      
      // Check if captions exist for this video+language
      const existing = await db.select().from(videoCaptions)
        .where(and(
          eq(videoCaptions.videoId, input.videoId),
          eq(videoCaptions.language, input.language)
        ));

      if (existing.length > 0) {
        await db.update(videoCaptions)
          .set({
            captions: input.captions,
            label: input.label,
            isDefault: input.isDefault ? 1 : 0,
            updatedAt: now,
          })
          .where(eq(videoCaptions.id, existing[0].id));
        return { success: true, id: existing[0].id, updated: true };
      } else {
        const result = await db.insert(videoCaptions).values({
          videoId: input.videoId,
          language: input.language,
          label: input.label,
          captions: input.captions,
          uploadedBy: ctx.user.id,
          isDefault: input.isDefault ? 1 : 0,
          createdAt: now,
          updatedAt: now,
        });
        return { success: true, id: Number(result[0].insertId), updated: false };
      }
    }),

  // Delete captions
  deleteCaptions: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(videoCaptions).where(eq(videoCaptions.id, input.id));
      return { success: true };
    }),

  // Parse SRT/VTT file content into caption entries
  parseCaptionFile: protectedProcedure
    .input(z.object({
      content: z.string(),
      format: z.enum(['srt', 'vtt']),
    }))
    .mutation(async ({ input }) => {
      const captions = parseCaptionContent(input.content, input.format);
      return { captions };
    }),

  // ─── VIDEO LIBRARY ─────────────────────────────────────
  
  // List all videos
  listVideos: publicProcedure
    .input(z.object({
      type: z.string().optional(),
      status: z.string().optional(),
      limit: z.number().default(50),
    }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        const conditions = [];
        if (input?.type) conditions.push(eq(videoLibrary.type, input.type as any));
        if (input?.status) conditions.push(eq(videoLibrary.status, input.status as any));
        
        let query = db.select().from(videoLibrary).orderBy(desc(videoLibrary.createdAt)).limit(input?.limit ?? 50);
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
        return await query;
      } catch {
        return [];
      }
    }),

  // Upload a video (metadata + S3)
  uploadVideo: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z.enum(['narrated', 'instrumental', 'social', 'vertical', 'presentation', 'recording', 'upload']).default('upload'),
      aspectRatio: z.string().default('16:9'),
      narratedBy: z.string().optional(),
      tags: z.array(z.string()).optional(),
      duration: z.string().optional(),
      fileBase64: z.string(),
      fileName: z.string(),
      contentType: z.string().default('video/mp4'),
      posterBase64: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const now = Date.now();
      const db = await getDb();
      const videoId = `vid-${now}-${Math.random().toString(36).slice(2, 8)}`;
      const suffix = Math.random().toString(36).slice(2, 10);
      
      // Upload video to S3
      const videoBuffer = Buffer.from(input.fileBase64, 'base64');
      const videoKey = `videos/${videoId}-${suffix}.${input.fileName.split('.').pop() || 'mp4'}`;
      const { url: videoUrl } = await storagePut(videoKey, videoBuffer, input.contentType);
      
      // Upload poster if provided
      let posterUrl: string | undefined;
      if (input.posterBase64) {
        const posterBuffer = Buffer.from(input.posterBase64, 'base64');
        const posterKey = `videos/posters/${videoId}-${suffix}.jpg`;
        const result = await storagePut(posterKey, posterBuffer, 'image/jpeg');
        posterUrl = result.url;
      }

      // Save to database
      const result = await db.insert(videoLibrary).values({
        videoId,
        title: input.title,
        description: input.description,
        videoUrl,
        videoKey,
        posterUrl,
        duration: input.duration,
        type: input.type,
        aspectRatio: input.aspectRatio,
        narratedBy: input.narratedBy,
        tags: input.tags,
        uploadedBy: ctx.user.id,
        uploadedByName: ctx.user.name || 'SQUADD Member',
        status: 'published',
        createdAt: now,
        updatedAt: now,
      });

      return { success: true, videoId, videoUrl, posterUrl, id: Number(result[0].insertId) };
    }),

  // Delete a video
  deleteVideo: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(videoLibrary).where(eq(videoLibrary.id, input.id));
      return { success: true };
    }),

  // Increment view count
  incrementView: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        const existing = await db.select().from(videoLibrary)
          .where(eq(videoLibrary.videoId, input.videoId));
        if (existing.length > 0) {
          await db.update(videoLibrary)
            .set({ viewCount: (existing[0].viewCount || 0) + 1 })
            .where(eq(videoLibrary.id, existing[0].id));
        }
        return { success: true };
      } catch {
        return { success: false };
      }
    }),

  // ─── MEETING RECORDINGS ────────────────────────────────
  
  // Start a recording
  startRecording: protectedProcedure
    .input(z.object({
      roomId: z.string(),
      roomName: z.string(),
      participants: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const now = Date.now();
      const db = await getDb();
      const result = await db.insert(meetingRecordings).values({
        roomId: input.roomId,
        roomName: input.roomName,
        recordedBy: ctx.user.id,
        recordedByName: ctx.user.name || 'SQUADD Member',
        participants: input.participants || [],
        status: 'recording',
        startedAt: now,
        createdAt: now,
      });
      return { success: true, recordingId: Number(result[0].insertId), startedAt: now };
    }),

  // Stop a recording and upload
  stopRecording: protectedProcedure
    .input(z.object({
      recordingId: z.number(),
      fileBase64: z.string(),
      fileName: z.string(),
      duration: z.number().optional(),
      fileSizeMb: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const now = Date.now();
      const db = await getDb();
      const suffix = Math.random().toString(36).slice(2, 10);
      
      // Upload to S3
      const recordingBuffer = Buffer.from(input.fileBase64, 'base64');
      const recordingKey = `recordings/meeting-${input.recordingId}-${suffix}.webm`;
      const { url: recordingUrl } = await storagePut(recordingKey, recordingBuffer, 'video/webm');

      // Update database
      await db.update(meetingRecordings)
        .set({
          recordingUrl,
          recordingKey,
          duration: input.duration,
          fileSizeMb: input.fileSizeMb?.toString(),
          status: 'ready',
          endedAt: now,
        })
        .where(eq(meetingRecordings.id, input.recordingId));

      return { success: true, recordingUrl };
    }),

  // List recordings
  listRecordings: protectedProcedure
    .input(z.object({
      roomId: z.string().optional(),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        let query = db.select().from(meetingRecordings)
          .orderBy(desc(meetingRecordings.createdAt))
          .limit(input?.limit ?? 20);
        if (input?.roomId) {
          query = query.where(eq(meetingRecordings.roomId, input.roomId)) as any;
        }
        return await query;
      } catch {
        return [];
      }
    }),

  // Delete a recording
  deleteRecording: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.delete(meetingRecordings).where(eq(meetingRecordings.id, input.id));
      return { success: true };
    }),
});

// ─── SRT/VTT Parser ──────────────────────────────────────
function parseCaptionContent(content: string, format: 'srt' | 'vtt'): Array<{ start: number; end: number; text: string }> {
  const captions: Array<{ start: number; end: number; text: string }> = [];
  const lines = content.trim().split('\n');
  
  let i = 0;
  // Skip VTT header
  if (format === 'vtt' && lines[0]?.includes('WEBVTT')) {
    i = 1;
    while (i < lines.length && lines[i].trim() !== '') i++;
    i++;
  }

  while (i < lines.length) {
    // Skip empty lines and sequence numbers
    while (i < lines.length && (lines[i].trim() === '' || /^\d+$/.test(lines[i].trim()))) i++;
    if (i >= lines.length) break;

    // Parse timestamp line
    const timestampLine = lines[i];
    const separator = format === 'srt' ? '-->' : '-->';
    if (timestampLine.includes(separator)) {
      const [startStr, endStr] = timestampLine.split(separator).map(s => s.trim());
      const start = parseTimestamp(startStr);
      const end = parseTimestamp(endStr);
      i++;

      // Collect text lines
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== '') {
        textLines.push(lines[i].trim());
        i++;
      }

      if (textLines.length > 0) {
        captions.push({ start, end, text: textLines.join(' ') });
      }
    } else {
      i++;
    }
  }

  return captions;
}

function parseTimestamp(ts: string): number {
  // Handle both HH:MM:SS,mmm (SRT) and HH:MM:SS.mmm (VTT)
  const cleaned = ts.replace(',', '.').trim();
  const parts = cleaned.split(':');
  if (parts.length === 3) {
    const hours = parseFloat(parts[0]);
    const minutes = parseFloat(parts[1]);
    const seconds = parseFloat(parts[2]);
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 2) {
    const minutes = parseFloat(parts[0]);
    const seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
  }
  return parseFloat(cleaned) || 0;
}
