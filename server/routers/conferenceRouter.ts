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
    return {
      total: (totalRows as any)[0]?.count || 0,
      live: (liveRows as any)[0]?.count || 0,
      scheduled: (scheduledRows as any)[0]?.count || 0,
    };
  }),

  getConferences: publicProcedure
    .input(z.object({
      status: z.enum(['scheduled', 'live', 'ended', 'cancelled', 'all']).optional().default('all'),
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
      await db.execute(sql`
        INSERT INTO conferences (title, description, meeting_type, platform, host_id, host_name, room_code, external_url, scheduled_at, duration_minutes, max_attendees, password, closed_captions, recording, status, attendee_count, created_at, updated_at)
        VALUES (${input.title}, ${input.description || null}, ${input.meetingType}, ${input.platform}, ${ctx.user.id}, ${ctx.user.name}, ${roomCode}, ${externalUrl}, ${input.scheduledAt || null}, ${input.durationMinutes}, ${input.maxAttendees}, ${input.password || null}, ${input.closedCaptions}, ${input.recording}, ${status}, 0, ${now}, ${now})
      `);
      const [result] = await db.execute(sql`SELECT LAST_INSERT_ID() as id`);
      const conferenceId = (result as any)[0]?.id;
      return { id: conferenceId, roomCode, status, platform: input.platform, externalUrl };
    }),

  joinConference: protectedProcedure
    .input(z.object({ conferenceId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const now = Date.now();
      const [existing] = await db.execute(
        sql`SELECT id FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`
      );
      if ((existing as any[]).length > 0) {
        await db.execute(sql`UPDATE conference_attendees SET joined_at = ${now} WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`);
      } else {
        await db.execute(sql`
          INSERT INTO conference_attendees (conference_id, user_id, user_name, rsvp_status, joined_at, created_at)
          VALUES (${input.conferenceId}, ${ctx.user.id}, ${ctx.user.name}, 'going', ${now}, ${now})
        `);
        await db.execute(sql`UPDATE conferences SET attendee_count = attendee_count + 1, updated_at = ${now} WHERE id = ${input.conferenceId}`);
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
      const now = Date.now();
      const [existing] = await db.execute(
        sql`SELECT id FROM conference_attendees WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`
      );
      if ((existing as any[]).length > 0) {
        await db.execute(sql`UPDATE conference_attendees SET rsvp_status = ${input.status} WHERE conference_id = ${input.conferenceId} AND user_id = ${ctx.user.id}`);
      } else {
        await db.execute(sql`
          INSERT INTO conference_attendees (conference_id, user_id, user_name, rsvp_status, created_at)
          VALUES (${input.conferenceId}, ${ctx.user.id}, ${ctx.user.name}, ${input.status}, ${now})
        `);
      }
      return { success: true };
    }),

  endConference: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      await db.execute(sql`UPDATE conferences SET status = 'ended', updated_at = ${now} WHERE id = ${input.id}`);
      return { success: true };
    }),

  deleteConference: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.execute(sql`DELETE FROM conferences WHERE id = ${input.id}`);
      return { success: true };
    }),
});
