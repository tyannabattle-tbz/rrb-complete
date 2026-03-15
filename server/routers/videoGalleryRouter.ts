import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import mysql from "mysql2/promise";

async function rawQuery(sql: string, params: any[] = []) {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as any[];
  } finally {
    await connection.end();
  }
}

export const videoGalleryRouter = router({
  /**
   * Get all videos with optional filtering and sorting
   */
  getVideos: publicProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        style: z.string().optional(),
        resolution: z.string().optional(),
        sortBy: z.enum(["newest", "popular", "trending"]).default("newest"),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        let sql = `SELECT * FROM video_library WHERE 1=1`;
        const params: any[] = [];
        if (input.style) { sql += ` AND style = ?`; params.push(input.style); }
        if (input.resolution) { sql += ` AND resolution = ?`; params.push(input.resolution); }
        if (input.search) { sql += ` AND (description LIKE ? OR title LIKE ?)`; params.push(`%${input.search}%`, `%${input.search}%`); }
        if (input.sortBy === "newest") sql += ` ORDER BY created_at DESC`;
        else if (input.sortBy === "popular") sql += ` ORDER BY view_count DESC`;
        sql += ` LIMIT ? OFFSET ?`;
        params.push(input.limit, input.offset);
        const rows = await rawQuery(sql, params);
        return rows.map((r: any) => ({
          videoId: r.video_id || r.id,
          userId: r.user_id,
          title: r.title || r.description || 'Untitled',
          description: r.description || '',
          duration: r.duration || 0,
          resolution: r.resolution || '1080p',
          style: r.style || 'cinematic',
          fps: r.fps || 24,
          aspectRatio: r.aspect_ratio || '16:9',
          url: r.url || r.file_url || '',
          thumbnail: r.thumbnail_url || '',
          isPublic: r.is_public !== false,
          viewCount: r.view_count || 0,
          createdAt: r.created_at || new Date(),
          updatedAt: r.updated_at || new Date(),
        }));
      } catch {
        // Table may not have expected columns — return empty
        return [];
      }
    }),

  /**
   * Get a single video by ID
   */
  getVideo: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      try {
        const rows = await rawQuery(
          `SELECT * FROM video_library WHERE video_id = ? OR id = ? LIMIT 1`,
          [input.videoId, input.videoId]
        );
        if (rows.length === 0) return null;
        const r = rows[0];
        return {
          videoId: r.video_id || r.id,
          userId: r.user_id,
          title: r.title || r.description || 'Untitled',
          description: r.description || '',
          duration: r.duration || 0,
          resolution: r.resolution || '1080p',
          style: r.style || 'cinematic',
          fps: r.fps || 24,
          aspectRatio: r.aspect_ratio || '16:9',
          url: r.url || r.file_url || '',
          thumbnail: r.thumbnail_url || '',
          isPublic: r.is_public !== false,
          viewCount: r.view_count || 0,
          createdAt: r.created_at || new Date(),
          updatedAt: r.updated_at || new Date(),
        };
      } catch {
        return null;
      }
    }),

  /**
   * Get videos created by a specific user
   */
  getUserVideos: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const rows = await rawQuery(
          `SELECT * FROM video_library WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [input.userId, input.limit, input.offset]
        );
        return rows;
      } catch {
        return [];
      }
    }),

  /**
   * Get videos by current user
   */
  getMyVideos: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const rows = await rawQuery(
          `SELECT * FROM video_library WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
          [ctx.user.id, input.limit, input.offset]
        );
        return rows;
      } catch {
        return [];
      }
    }),

  /**
   * Get available video styles
   */
  getStyles: publicProcedure.query(async () => {
    return ["cinematic", "animated", "motion-graphics", "action", "slow-motion", "retro", "documentary", "abstract"];
  }),

  /**
   * Get available resolutions
   */
  getResolutions: publicProcedure.query(async () => {
    return ["720p", "1080p", "4k"];
  }),

  /**
   * Delete a video (owner only)
   */
  deleteVideo: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        await rawQuery(
          `DELETE FROM video_library WHERE (video_id = ? OR id = ?) AND user_id = ?`,
          [input.videoId, input.videoId, ctx.user.id]
        );
        return { success: true };
      } catch {
        return { success: false };
      }
    }),

  /**
   * Update video metadata
   */
  updateVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const updates: string[] = [];
        const params: any[] = [];
        if (input.description !== undefined) { updates.push('description = ?'); params.push(input.description); }
        if (input.isPublic !== undefined) { updates.push('is_public = ?'); params.push(input.isPublic ? 1 : 0); }
        if (updates.length > 0) {
          params.push(input.videoId, input.videoId, ctx.user.id);
          await rawQuery(
            `UPDATE video_library SET ${updates.join(', ')}, updated_at = NOW() WHERE (video_id = ? OR id = ?) AND user_id = ?`,
            params
          );
        }
        return { success: true };
      } catch {
        return { success: false };
      }
    }),
});
