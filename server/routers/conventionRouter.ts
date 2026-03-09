import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { conventions, conventionSessions, conventionAttendees, studioSessions } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const conventionRouter = router({
  // ─── Convention CRUD ───────────────────────────────────
  createConvention: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      startDate: z.number(),
      endDate: z.number(),
      timezone: z.string().default("America/New_York"),
      maxAttendees: z.number().min(1).default(500),
      isVirtual: z.boolean().default(true),
      isHybrid: z.boolean().default(false),
      venueInfo: z.string().optional(),
      registrationFee: z.string().default("0.00"),
      tags: z.array(z.string()).optional(),
      sponsors: z.array(z.object({
        name: z.string(),
        logo: z.string().optional(),
        tier: z.enum(["platinum", "gold", "silver", "bronze"]),
      })).optional(),
      socialLinks: z.object({
        twitter: z.string().optional(),
        discord: z.string().optional(),
        youtube: z.string().optional(),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      const now = Date.now();
      const [result] = await db.insert(conventions).values({
        title: input.title,
        subtitle: input.subtitle || null,
        description: input.description || null,
        hostUserId: ctx.user.id,
        status: "draft",
        startDate: input.startDate,
        endDate: input.endDate,
        timezone: input.timezone,
        maxAttendees: input.maxAttendees,
        currentAttendees: 0,
        isVirtual: input.isVirtual,
        isHybrid: input.isHybrid,
        venueInfo: input.venueInfo || null,
        registrationFee: input.registrationFee,
        tags: input.tags || null,
        sponsors: input.sponsors || null,
        socialLinks: input.socialLinks || null,
        createdAt: now,
        updatedAt: now,
      });
      return { id: result.insertId };
    }),

  getConventions: publicProcedure
    .input(z.object({
      status: z.enum(["draft", "announced", "registration_open", "active", "day_of", "ended", "archived"]).optional(),
      limit: z.number().min(1).max(50).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (input?.status) {
        return db.select().from(conventions)
          .where(eq(conventions.status, input.status))
          .orderBy(desc(conventions.startDate))
          .limit(input.limit);
      }
      return db.select().from(conventions)
        .orderBy(desc(conventions.startDate))
        .limit(input?.limit || 20);
    }),

  getConvention: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [convention] = await db.select().from(conventions).where(eq(conventions.id, input.id));
      if (!convention) throw new Error("Convention not found");
      const sessions = await db.select().from(conventionSessions)
        .where(eq(conventionSessions.conventionId, input.id))
        .orderBy(conventionSessions.startTime);
      const [attendeeStats] = await db.select({
        total: sql<number>`COUNT(*)`,
        confirmed: sql<number>`SUM(CASE WHEN registration_status = 'confirmed' THEN 1 ELSE 0 END)`,
        checkedIn: sql<number>`SUM(CASE WHEN registration_status = 'checked_in' THEN 1 ELSE 0 END)`,
        speakers: sql<number>`SUM(CASE WHEN role = 'speaker' THEN 1 ELSE 0 END)`,
        vips: sql<number>`SUM(CASE WHEN role = 'vip' THEN 1 ELSE 0 END)`,
      }).from(conventionAttendees).where(eq(conventionAttendees.conventionId, input.id));
      return { ...convention, sessions, attendeeStats };
    }),

  updateConventionStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "announced", "registration_open", "active", "day_of", "ended", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(conventions).set({
        status: input.status,
        updatedAt: Date.now(),
      }).where(eq(conventions.id, input.id));
      return { success: true };
    }),

  // ─── Convention Sessions ───────────────────────────────
  addSession: protectedProcedure
    .input(z.object({
      conventionId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      sessionType: z.enum(["keynote", "panel", "workshop", "breakout", "networking", "performance", "qa", "fireside_chat"]).default("panel"),
      track: z.string().optional(),
      room: z.string().optional(),
      startTime: z.number(),
      endTime: z.number(),
      maxParticipants: z.number().default(50),
      speakers: z.array(z.object({
        name: z.string(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
        platform: z.string().optional(),
      })).optional(),
      isRecorded: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      const [studioResult] = await db.insert(studioSessions).values({
        title: input.title,
        description: input.description || null,
        sessionType: "convention_panel",
        status: "scheduled",
        scheduledAt: input.startTime,
        maxGuests: input.maxParticipants,
        isPublic: true,
        recordingEnabled: input.isRecorded,
        conventionId: input.conventionId,
        joinCode: Math.random().toString(36).substring(2, 12).toUpperCase(),
        viewerCount: 0,
        peakViewers: 0,
        createdAt: now,
        updatedAt: now,
      });

      const [result] = await db.insert(conventionSessions).values({
        conventionId: input.conventionId,
        studioSessionId: studioResult.insertId,
        title: input.title,
        description: input.description || null,
        sessionType: input.sessionType,
        track: input.track || null,
        room: input.room || null,
        startTime: input.startTime,
        endTime: input.endTime,
        maxParticipants: input.maxParticipants,
        currentParticipants: 0,
        speakers: input.speakers || null,
        isRecorded: input.isRecorded,
        status: "scheduled",
        createdAt: now,
      });
      return { id: result.insertId, studioSessionId: studioResult.insertId };
    }),

  getConventionSessions: publicProcedure
    .input(z.object({
      conventionId: z.number(),
      track: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const conditions = [eq(conventionSessions.conventionId, input.conventionId)];
      if (input.track) conditions.push(eq(conventionSessions.track, input.track));
      return db.select().from(conventionSessions)
        .where(and(...conditions))
        .orderBy(conventionSessions.startTime);
    }),

  updateSessionStatus: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      status: z.enum(["scheduled", "live", "ended", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(conventionSessions).set({ status: input.status })
        .where(eq(conventionSessions.id, input.sessionId));
      return { success: true };
    }),

  // ─── Attendee Registration ─────────────────────────────
  registerAttendee: publicProcedure
    .input(z.object({
      conventionId: z.number(),
      name: z.string().min(1),
      email: z.string().email(),
      role: z.enum(["attendee", "speaker", "panelist", "moderator", "vip", "sponsor", "organizer"]).default("attendee"),
      ticketType: z.enum(["free", "general", "vip", "speaker", "sponsor"]).default("free"),
      platform: z.string().optional(),
      bio: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [convention] = await db.select().from(conventions).where(eq(conventions.id, input.conventionId));
      if (!convention) throw new Error("Convention not found");
      if (convention.currentAttendees >= convention.maxAttendees) throw new Error("Convention is at capacity");

      const now = Date.now();
      const [result] = await db.insert(conventionAttendees).values({
        conventionId: input.conventionId,
        name: input.name,
        email: input.email,
        role: input.role,
        ticketType: input.ticketType,
        registrationStatus: input.ticketType === "free" ? "confirmed" : "pending",
        platform: input.platform || null,
        bio: input.bio || null,
        createdAt: now,
      });

      await db.update(conventions).set({
        currentAttendees: sql`current_attendees + 1`,
        updatedAt: now,
      }).where(eq(conventions.id, input.conventionId));

      return { id: result.insertId, status: input.ticketType === "free" ? "confirmed" : "pending" };
    }),

  getAttendees: protectedProcedure
    .input(z.object({
      conventionId: z.number(),
      role: z.enum(["attendee", "speaker", "panelist", "moderator", "vip", "sponsor", "organizer"]).optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const conditions = [eq(conventionAttendees.conventionId, input.conventionId)];
      if (input.role) conditions.push(eq(conventionAttendees.role, input.role));
      return db.select().from(conventionAttendees)
        .where(and(...conditions))
        .orderBy(desc(conventionAttendees.createdAt));
    }),

  checkInAttendee: protectedProcedure
    .input(z.object({ attendeeId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(conventionAttendees).set({
        registrationStatus: "checked_in",
        checkedInAt: Date.now(),
      }).where(eq(conventionAttendees.id, input.attendeeId));
      return { success: true };
    }),

  // ─── Convention Stats ──────────────────────────────────
  getConventionStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [stats] = await db.select({
      total: sql<number>`COUNT(*)`,
      active: sql<number>`SUM(CASE WHEN status IN ('active', 'day_of') THEN 1 ELSE 0 END)`,
      upcoming: sql<number>`SUM(CASE WHEN status IN ('announced', 'registration_open') THEN 1 ELSE 0 END)`,
      past: sql<number>`SUM(CASE WHEN status IN ('ended', 'archived') THEN 1 ELSE 0 END)`,
      totalAttendees: sql<number>`COALESCE(SUM(current_attendees), 0)`,
    }).from(conventions).where(eq(conventions.hostUserId, ctx.user.id));
    return stats;
  }),

  // ─── Get Tracks for a Convention ───────────────────────
  getTracks: publicProcedure
    .input(z.object({ conventionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const sessions = await db.select({ track: conventionSessions.track })
        .from(conventionSessions)
        .where(eq(conventionSessions.conventionId, input.conventionId));
      const tracks = [...new Set(sessions.map(s => s.track).filter(Boolean))];
      return tracks;
    }),
});
