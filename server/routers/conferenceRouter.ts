import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { sql } from "drizzle-orm";

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = 'rrb-';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const conferenceRouter = router({
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    const [totalRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences`);
    const [liveRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE status = 'live'`);
    const [scheduledRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE status = 'scheduled'`);
    const [completedRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE status = 'completed'`);
    const [recordingRows] = await db.execute(sql`SELECT COUNT(*) as count FROM conferences WHERE recording_status = 'available'`);
    return {
      total: (totalRows as any)[0]?.count || 0,
      live: (liveRows as any)[0]?.count || 0,
      scheduled: (scheduledRows as any)[0]?.count || 0,
      completed: (completedRows as any)[0]?.count || 0,
      recordings: (recordingRows as any)[0]?.count || 0,
    };
  }),

  getConferences: publicProcedure
    .input(z.object({
      status: z.enum(['scheduled', 'live', 'completed', 'cancelled', 'all']).optional().default('all'),
      limit: z.number().min(1).max(100).optional().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const status = input?.status || 'all';
      const limit = input?.limit || 20;
      const query = status === 'all'
        ? sql`SELECT * FROM conferences ORDER BY created_at DESC LIMIT ${limit}`
        : sql`SELECT * FROM conferences WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit}`;
      const [rows] = await db.execute(query);
      return rows as any[];
    }),

  getConference: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [rows] = await db.execute(sql`SELECT * FROM conferences WHERE id = ${input.id}`);
      const conferences = rows as any[];
      if (conferences.length === 0) return null;
      const [attendeeRows] = await db.execute(
        sql`SELECT * FROM conference_attendees WHERE conference_id = ${input.id} ORDER BY created_at ASC`
      );
      return { ...conferences[0], attendees: attendeeRows as any[] };
    }),

  // Calendar view - get conferences for a date range
  getCalendarEvents: publicProcedure
    .input(z.object({
      startDate: z.number(),
      endDate: z.number(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      const [rows] = await db.execute(sql`
        SELECT id, title, type as meeting_type, platform, host_name, room_code, 
               UNIX_TIMESTAMP(scheduled_at)*1000 as scheduled_at, 
               duration_minutes, status, actual_attendees, recording_status,
               UNIX_TIMESTAMP(created_at)*1000 as created_at
        FROM conferences 
        WHERE (scheduled_at BETWEEN ${startDate} AND ${endDate})
           OR (created_at BETWEEN ${startDate} AND ${endDate} AND scheduled_at IS NULL)
        ORDER BY COALESCE(scheduled_at, created_at) ASC
      `);
      return rows as any[];
    }),

  // Analytics - comprehensive conference metrics
  getAnalytics: publicProcedure.query(async () => {
    const db = await getDb();
    // Platform usage
    const [platformRows] = await db.execute(sql`
      SELECT platform, COUNT(*) as count, SUM(actual_attendees) as total_attendees, AVG(duration_minutes) as avg_duration
      FROM conferences GROUP BY platform ORDER BY count DESC
    `);
    // Meeting type breakdown
    const [typeRows] = await db.execute(sql`
      SELECT type, COUNT(*) as count FROM conferences GROUP BY type ORDER BY count DESC
    `);
    // Top hosts
    const [hostRows] = await db.execute(sql`
      SELECT host_name, COUNT(*) as conferences_hosted, SUM(actual_attendees) as total_attendees
      FROM conferences GROUP BY host_name ORDER BY conferences_hosted DESC LIMIT 10
    `);
    // Monthly trend (last 6 months)
    const [trendRows] = await db.execute(sql`
      SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count, SUM(actual_attendees) as attendees
      FROM conferences GROUP BY month ORDER BY month DESC LIMIT 6
    `);
    // Total stats
    const [totalStats] = await db.execute(sql`
      SELECT COUNT(*) as total_conferences, SUM(actual_attendees) as total_attendees, 
             AVG(duration_minutes) as avg_duration, SUM(duration_minutes) as total_minutes,
             COUNT(CASE WHEN recording_status = 'available' THEN 1 END) as total_recordings
      FROM conferences
    `);
    return {
      platforms: platformRows as any[],
      types: typeRows as any[],
      topHosts: hostRows as any[],
      monthlyTrend: trendRows as any[],
      totals: (totalStats as any[])[0] || {},
    };
  }),

  // Recordings archive
  getRecordings: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).optional().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const limit = input?.limit || 20;
      const [rows] = await db.execute(sql`
        SELECT id, title, type, platform, host_name, duration_minutes, actual_attendees, recording_url, recording_status, created_at
        FROM conferences WHERE recording_status = 'available' ORDER BY created_at DESC LIMIT ${limit}
      `);
      return rows as any[];
    }),

  createConference: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      meetingType: z.enum(['huddle', 'meeting', 'conference', 'webinar', 'broadcast', 'workshop']).default('meeting'),
      platform: z.enum(['rrb_builtin', 'zoom', 'google_meet', 'discord', 'skype', 'rrb_broadcast']).default('rrb_builtin'),
      scheduledAt: z.number().optional(),
      durationMinutes: z.number().min(5).max(480).default(60),
      maxAttendees: z.number().min(1).max(10000).default(100),
      password: z.string().optional(),
      closedCaptions: z.boolean().default(true),
      recording: z.boolean().default(true),
      source: z.string().optional(), // 'rrb', 'hybridcast', 'tbz-os', 'qumus'
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const now = Date.now();
      const roomCode = generateRoomCode();
      let externalUrl: string | null = null;
      if (input.platform === 'zoom') externalUrl = process.env.VITE_ZOOM_URL || 'https://zoom.us';
      else if (input.platform === 'google_meet') externalUrl = process.env.VITE_MEET_URL || 'https://meet.google.com';
      else if (input.platform === 'discord') externalUrl = process.env.VITE_DISCORD_URL || 'https://discord.gg';
      else if (input.platform === 'skype') externalUrl = process.env.VITE_SKYPE_URL || 'https://join.skype.com';
      const status = input.scheduledAt ? 'scheduled' : 'live';
      const recordingStatus = input.recording ? 'pending' : 'none';
      const platformValue = input.platform === 'rrb_builtin' ? 'jitsi' : input.platform === 'google_meet' ? 'meet' : input.platform === 'rrb_broadcast' ? 'rrb-live' : input.platform;
      const scheduledAtDate = input.scheduledAt ? new Date(input.scheduledAt) : null;
      await db.execute(sql`
        INSERT INTO conferences (title, description, type, platform, host_user_id, host_name, room_code, external_url, scheduled_at, duration_minutes, max_attendees, password, captions_enabled, recording_enabled, status, actual_attendees, recording_status, created_at, updated_at)
        VALUES (${input.title}, ${input.description || null}, ${input.meetingType}, ${platformValue}, ${ctx.user.id}, ${ctx.user.name}, ${roomCode}, ${externalUrl}, ${scheduledAtDate}, ${input.durationMinutes}, ${input.maxAttendees}, ${input.password || null}, ${input.closedCaptions}, ${input.recording}, ${status}, 0, ${recordingStatus}, NOW(), NOW())
      `);
      const [result] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
      const conferenceId = (result as any)[0]?.id;
      return { id: conferenceId, roomCode, status, platform: input.platform, externalUrl };
    }),

  // Save recording URL after conference ends
  saveRecording: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      recordingUrl: z.string(),
      recordingKey: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`
        UPDATE conferences SET recording_url = ${input.recordingUrl}, recording_key = ${input.recordingKey || null}, 
        recording_status = 'available', updated_at = NOW() WHERE id = ${input.conferenceId}
      `);
      return { success: true };
    }),

  joinConference: protectedProcedure
    .input(z.object({ conferenceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [existing] = await db.execute(
        sql`SELECT id FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`
      );
      if ((existing as any[]).length > 0) {
        await db.execute(sql`UPDATE conference_attendees SET joined_at = NOW() WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`);
      } else {
        await db.execute(sql`
          INSERT INTO conference_attendees (conference_id, user_id, user_name, rsvp_status, joined_at, created_at)
          VALUES (${input.conferenceId}, ${ctx.user.id}, ${ctx.user.name}, 'going', NOW(), NOW())
        `);
        await db.execute(sql`UPDATE conferences SET actual_attendees = actual_attendees + 1, updated_at = NOW() WHERE id = ${input.conferenceId}`);
      }
      return { success: true };
    }),

  rsvpConference: protectedProcedure
    .input(z.object({
      conferenceId: z.number(),
      status: z.enum(['going', 'maybe', 'declined']),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const [existing] = await db.execute(
        sql`SELECT id FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`
      );
      if ((existing as any[]).length > 0) {
        await db.execute(sql`UPDATE conference_attendees SET rsvp_status = ${input.status} WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`);
      } else {
        await db.execute(sql`
          INSERT INTO conference_attendees (conference_id, user_id, user_name, rsvp_status, created_at)
          VALUES (${input.conferenceId}, ${ctx.user.id}, ${ctx.user.name}, ${input.status}, NOW())
        `);
      }
      return { success: true };
    }),

  endConference: protectedProcedure
    .input(z.object({ id: z.number(), actualAttendees: z.number().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (input.actualAttendees !== undefined) {
        await db.execute(sql`UPDATE conferences SET status = 'completed', actual_attendees = ${input.actualAttendees}, updated_at = NOW() WHERE id = ${input.id}`);
      } else {
        await db.execute(sql`UPDATE conferences SET status = 'completed', updated_at = NOW() WHERE id = ${input.id}`);
      }
      return { success: true };
    }),

  deleteConference: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`DELETE FROM conference_attendees WHERE conference_id = ${input.id}`);
      await db.execute(sql`DELETE FROM conferences WHERE id = ${input.id}`);
      return { success: true };
    }),
});
