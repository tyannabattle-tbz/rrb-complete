import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";
import { qumusEngine } from "../qumus-orchestration";

const PLATFORM_RTMP_DEFAULTS: Record<string, string> = {
  youtube: 'rtmp://a.rtmp.youtube.com/live2',
  facebook: 'rtmps://live-api-s.facebook.com:443/rtmp/',
  instagram: 'rtmps://live-upload.instagram.com:443/rtmp/',
  twitter: 'rtmps://prod-ec-us-east-1.video.pscp.tv:443/x/',
  tiktok: 'rtmp://push.tiktok.com/live/',
  twitch: 'rtmp://live.twitch.tv/app/',
  linkedin: 'rtmps://prod-ec-us-east-1.video.pscp.tv:443/x/',
  custom: '',
};

const PLATFORM_INFO: Record<string, { name: string; icon: string; color: string; setupUrl: string }> = {
  youtube: { name: 'YouTube', icon: 'youtube', color: '#FF0000', setupUrl: 'https://studio.youtube.com/channel/UC/livestreaming' },
  facebook: { name: 'Facebook', icon: 'facebook', color: '#1877F2', setupUrl: 'https://www.facebook.com/live/producer' },
  instagram: { name: 'Instagram', icon: 'instagram', color: '#E4405F', setupUrl: 'https://www.instagram.com/' },
  twitter: { name: 'Twitter/X', icon: 'twitter', color: '#1DA1F2', setupUrl: 'https://studio.twitter.com/' },
  tiktok: { name: 'TikTok', icon: 'tiktok', color: '#000000', setupUrl: 'https://www.tiktok.com/studio' },
  twitch: { name: 'Twitch', icon: 'twitch', color: '#9146FF', setupUrl: 'https://dashboard.twitch.tv/stream-manager' },
  linkedin: { name: 'LinkedIn', icon: 'linkedin', color: '#0A66C2', setupUrl: 'https://www.linkedin.com/video/golive/' },
  custom: { name: 'Custom RTMP', icon: 'settings', color: '#6B7280', setupUrl: '' },
};

export const socialStreamRouter = router({
  // ─── Destination Management ───────────────────────
  getDestinations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT * FROM stream_destinations WHERE user_id = ${ctx.user.id} ORDER BY platform ASC
    `);
    return (rows as any[]).map((d: any) => ({
      ...d,
      platformInfo: PLATFORM_INFO[d.platform] || PLATFORM_INFO.custom,
      defaultRtmpUrl: PLATFORM_RTMP_DEFAULTS[d.platform] || '',
    }));
  }),

  addDestination: protectedProcedure.input(z.object({
    platform: z.enum(['youtube', 'facebook', 'instagram', 'twitter', 'tiktok', 'twitch', 'linkedin', 'custom']),
    label: z.string().min(1).max(255),
    rtmpUrl: z.string().optional(),
    streamKey: z.string().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    const rtmpUrl = input.rtmpUrl || PLATFORM_RTMP_DEFAULTS[input.platform] || '';
    await db.execute(sql`
      INSERT INTO stream_destinations (user_id, platform, label, rtmp_url, stream_key, is_enabled)
      VALUES (${ctx.user.id}, ${input.platform}, ${input.label}, ${rtmpUrl}, ${input.streamKey || ''}, 1)
    `);
    await qumusEngine.logDecision({
      policyId: 'conference_scheduling',
      action: 'stream_destination_added',
      confidence: 0.9,
      reasoning: `Stream destination added: ${input.platform} - ${input.label} by ${ctx.user.name}`,
      metadata: { platform: input.platform, label: input.label },
    });
    return { success: true, platform: input.platform };
  }),

  updateDestination: protectedProcedure.input(z.object({
    id: z.number(),
    label: z.string().optional(),
    rtmpUrl: z.string().optional(),
    streamKey: z.string().optional(),
    isEnabled: z.boolean().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    const sets: string[] = [];
    if (input.label !== undefined) sets.push(`label = '${input.label.replace(/'/g, "''")}'`);
    if (input.rtmpUrl !== undefined) sets.push(`rtmp_url = '${input.rtmpUrl.replace(/'/g, "''")}'`);
    if (input.streamKey !== undefined) sets.push(`stream_key = '${input.streamKey.replace(/'/g, "''")}'`);
    if (input.isEnabled !== undefined) sets.push(`is_enabled = ${input.isEnabled ? 1 : 0}`);
    if (sets.length === 0) return { success: false, message: 'No updates provided' };
    await db.execute(sql.raw(`UPDATE stream_destinations SET ${sets.join(', ')} WHERE id = ${input.id} AND user_id = ${ctx.user.id}`));
    return { success: true };
  }),

  removeDestination: protectedProcedure.input(z.object({
    id: z.number(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    await db.execute(sql`DELETE FROM stream_destinations WHERE id = ${input.id} AND user_id = ${ctx.user.id}`);
    return { success: true };
  }),

  // ─── Platform Info ───────────────────────
  getPlatformInfo: publicProcedure.query(() => {
    return Object.entries(PLATFORM_INFO).map(([key, info]) => ({
      id: key,
      ...info,
      defaultRtmpUrl: PLATFORM_RTMP_DEFAULTS[key] || '',
    }));
  }),

  // ─── Go Live / Stream Session Management ───────────────────────
  goLive: protectedProcedure.input(z.object({
    conferenceId: z.number().optional(),
    title: z.string().min(1),
    destinationIds: z.array(z.number()).min(1),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    const [destRows] = await db.execute(sql`
      SELECT * FROM stream_destinations WHERE id IN (${sql.raw(input.destinationIds.join(','))}) AND user_id = ${ctx.user.id}
    `);
    const destinations = destRows as any[];
    if (destinations.length === 0) throw new Error('No valid destinations selected');
    const platformNames = destinations.map((d: any) => d.platform);

    await db.execute(sql`
      INSERT INTO stream_sessions (conference_id, title, started_by, status, platforms)
      VALUES (${input.conferenceId || null}, ${input.title}, ${ctx.user.id}, 'live', ${JSON.stringify(platformNames)})
    `);

    await db.execute(sql`
      UPDATE stream_destinations SET last_used_at = NOW() WHERE id IN (${sql.raw(input.destinationIds.join(','))})
    `);

    if (input.conferenceId) {
      const streamKey = `rrb-social-${input.conferenceId}-${Date.now()}`;
      await db.execute(sql`
        UPDATE conferences SET 
          restream_active = 1, restream_key = ${streamKey},
          restream_started_at = NOW(), restream_platforms = ${JSON.stringify(platformNames)}
        WHERE id = ${input.conferenceId}
      `);
    }

    await qumusEngine.logDecision({
      policyId: 'conference_scheduling',
      action: 'social_stream_started',
      confidence: 0.95,
      reasoning: `Social stream started: "${input.title}" to ${platformNames.join(', ')} by ${ctx.user.name}`,
      metadata: { conferenceId: input.conferenceId, platforms: platformNames, title: input.title },
    });

    return {
      success: true,
      platforms: destinations.map((d: any) => ({
        platform: d.platform, label: d.label,
        rtmpUrl: d.rtmp_url, streamKey: d.stream_key,
        info: PLATFORM_INFO[d.platform] || PLATFORM_INFO.custom,
      })),
      message: `Now streaming to ${platformNames.length} platform${platformNames.length > 1 ? 's' : ''}: ${platformNames.join(', ')}`,
      instructions: 'Use the RTMP URLs and stream keys shown below in your streaming software (OBS, Streamlabs, etc.) or Restream Studio to broadcast to all platforms simultaneously.',
    };
  }),

  stopStream: protectedProcedure.input(z.object({
    sessionId: z.number().optional(),
    conferenceId: z.number().optional(),
  })).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (input.sessionId) {
      await db.execute(sql`UPDATE stream_sessions SET status = 'ended', ended_at = NOW() WHERE id = ${input.sessionId} AND started_by = ${ctx.user.id}`);
    } else {
      await db.execute(sql`UPDATE stream_sessions SET status = 'ended', ended_at = NOW() WHERE started_by = ${ctx.user.id} AND status = 'live' ORDER BY id DESC LIMIT 1`);
    }
    if (input.conferenceId) {
      await db.execute(sql`UPDATE conferences SET restream_active = 0, restream_ended_at = NOW() WHERE id = ${input.conferenceId}`);
    }
    return { success: true, message: 'Stream ended' };
  }),

  // ─── Stream History ───────────────────────
  getStreamHistory: protectedProcedure.input(z.object({
    limit: z.number().min(1).max(50).optional().default(20),
  }).optional()).query(async ({ ctx, input }) => {
    const db = await getDb();
    const limit = input?.limit || 20;
    const [rows] = await db.execute(sql`
      SELECT ss.*, c.title as conference_title, c.room_code
      FROM stream_sessions ss
      LEFT JOIN conferences c ON ss.conference_id = c.id
      WHERE ss.started_by = ${ctx.user.id}
      ORDER BY ss.started_at DESC LIMIT ${limit}
    `);
    return (rows as any[]).map((s: any) => ({
      ...s,
      platforms: s.platforms ? JSON.parse(s.platforms) : [],
      duration: s.ended_at ? Math.round((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000) : null,
    }));
  }),

  getActiveStream: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [rows] = await db.execute(sql`
      SELECT ss.*, c.title as conference_title, c.room_code
      FROM stream_sessions ss
      LEFT JOIN conferences c ON ss.conference_id = c.id
      WHERE ss.started_by = ${ctx.user.id} AND ss.status = 'live'
      ORDER BY ss.started_at DESC LIMIT 1
    `);
    const session = (rows as any[])[0];
    if (!session) return null;
    return {
      ...session,
      platforms: session.platforms ? JSON.parse(session.platforms) : [],
      duration: Math.round((Date.now() - new Date(session.started_at).getTime()) / 1000),
    };
  }),

  // ─── Streaming Stats ───────────────────────
  getStreamStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as count FROM stream_sessions WHERE started_by = ${ctx.user.id}`);
    const [liveRows] = await db.execute(sql`SELECT COUNT(*) as count FROM stream_sessions WHERE started_by = ${ctx.user.id} AND status = 'live'`);
    const [destRows] = await db.execute(sql`SELECT COUNT(*) as count FROM stream_destinations WHERE user_id = ${ctx.user.id}`);
    const [totalMinRows] = await db.execute(sql`
      SELECT COALESCE(SUM(TIMESTAMPDIFF(MINUTE, started_at, COALESCE(ended_at, NOW()))), 0) as minutes 
      FROM stream_sessions WHERE started_by = ${ctx.user.id}
    `);
    return {
      totalStreams: (totalRows as any)[0]?.count || 0,
      liveNow: (liveRows as any)[0]?.count || 0,
      destinations: (destRows as any)[0]?.count || 0,
      totalMinutes: (totalMinRows as any)[0]?.minutes || 0,
    };
  }),
});
