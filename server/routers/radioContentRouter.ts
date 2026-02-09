import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { musicTracks, audioContent, musicPlaylists, broadcastSchedules, streamingStatus } from "../../drizzle/schema";
import { eq, desc, asc } from "drizzle-orm";

export const radioContentRouter = router({
  // Get all music tracks for the radio player
  getTracks: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      const tracks = await db.select().from(musicTracks).orderBy(asc(musicTracks.id));
      return tracks.map(t => ({
        id: t.trackId,
        title: t.title,
        artist: t.artist,
        url: t.fileUrl,
        duration: t.duration,
        description: t.album || t.genre || '',
        genre: t.genre,
        coverArt: t.coverArtUrl,
      }));
    } catch (e) {
      console.warn("[RadioContent] Failed to fetch tracks:", e);
      return [];
    }
  }),

  // Get all audio content (podcasts, meditation, radio, etc.)
  getAudioContent: publicProcedure
    .input(z.object({
      contentType: z.enum(['meditation', 'podcast', 'radio', 'music', 'audiobook', 'other']).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      try {
        let query = db.select().from(audioContent);
        if (input?.contentType) {
          query = query.where(eq(audioContent.contentType, input.contentType)) as any;
        }
        const content = await query.orderBy(desc(audioContent.plays));
        return content.map(c => ({
          id: c.contentId,
          title: c.title,
          description: c.description,
          type: c.contentType,
          category: c.category,
          duration: c.duration,
          url: c.audioUrl,
          coverArt: c.coverArtUrl,
          artist: c.artist,
          album: c.album,
          plays: c.plays,
          favorites: c.favorites,
          rating: c.rating,
        }));
      } catch (e) {
        console.warn("[RadioContent] Failed to fetch audio content:", e);
        return [];
      }
    }),

  // Get playlists
  getPlaylists: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      const playlists = await db.select().from(musicPlaylists).orderBy(asc(musicPlaylists.id));
      return playlists.map(p => ({
        id: p.playlistId,
        name: p.name,
        description: p.description,
        trackCount: p.trackCount,
        totalDuration: p.totalDuration,
        isPublic: p.isPublic,
      }));
    } catch (e) {
      console.warn("[RadioContent] Failed to fetch playlists:", e);
      return [];
    }
  }),

  // Get broadcast schedule
  getSchedule: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      const schedules = await db.select().from(broadcastSchedules).orderBy(asc(broadcastSchedules.id));
      return schedules;
    } catch (e) {
      console.warn("[RadioContent] Failed to fetch schedules:", e);
      return [];
    }
  }),

  // Get streaming status for all channels
  getStreamingStatus: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    try {
      const status = await db.select().from(streamingStatus).orderBy(asc(streamingStatus.id));
      return status.map(s => ({
        id: s.channelId,
        channelName: s.channelName,
        isLive: s.isLive,
        currentListeners: s.currentListeners,
        peakListeners: s.peakListeners,
        streamUrl: s.streamUrl,
        quality: s.quality,
        bitrate: s.bitrate,
      }));
    } catch (e) {
      console.warn("[RadioContent] Failed to fetch streaming status:", e);
      return [];
    }
  }),

  // Increment play count for a track
  recordPlay: publicProcedure
    .input(z.object({ contentId: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) return { success: false };
      try {
        await db.update(audioContent)
          .set({ plays: audioContent.plays })
          .where(eq(audioContent.contentId, input.contentId));
        return { success: true };
      } catch (e) {
        return { success: false };
      }
    }),
});
