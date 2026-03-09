import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { studioSessions, studioGuests, studioRecordings } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import crypto from "crypto";

function generateJoinCode(): string {
  return crypto.randomBytes(5).toString("hex").toUpperCase();
}

function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export const studioRouter = router({
  // ─── Session CRUD ──────────────────────────────────────
  createSession: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(500),
      description: z.string().optional(),
      sessionType: z.enum(["podcast", "live_show", "interview", "panel", "workshop", "convention_panel", "recording"]).default("podcast"),
      scheduledAt: z.number().optional(),
      maxGuests: z.number().min(1).max(50).default(8),
      isPublic: z.boolean().default(true),
      streamPlatforms: z.array(z.string()).optional(),
      recordingEnabled: z.boolean().default(true),
      tags: z.array(z.string()).optional(),
      conventionId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const now = Date.now();
      const joinCode = generateJoinCode();
      const db = await getDb();
      const [result] = await db.insert(studioSessions).values({
        title: input.title,
        description: input.description || null,
        hostUserId: ctx.user.id,
        sessionType: input.sessionType,
        status: input.scheduledAt ? "scheduled" : "draft",
        scheduledAt: input.scheduledAt || null,
        maxGuests: input.maxGuests,
        isPublic: input.isPublic,
        streamPlatforms: input.streamPlatforms || null,
        recordingEnabled: input.recordingEnabled,
        tags: input.tags || null,
        conventionId: input.conventionId || null,
        joinCode,
        viewerCount: 0,
        peakViewers: 0,
        createdAt: now,
        updatedAt: now,
      });
      // Auto-add the host as a guest with host role
      await db.insert(studioGuests).values({
        sessionId: result.insertId,
        userId: ctx.user.id,
        guestName: ctx.user.name || "Host",
        guestEmail: ctx.user.email || null,
        platform: "internal",
        role: "host",
        status: "connected",
        createdAt: now,
      });
      return { id: result.insertId, joinCode };
    }),

  getSessions: protectedProcedure
    .input(z.object({
      status: z.enum(["draft", "scheduled", "greenroom", "live", "recording", "ended", "archived"]).optional(),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      const conditions = [eq(studioSessions.hostUserId, ctx.user.id)];
      if (input?.status) conditions.push(eq(studioSessions.status, input.status));
      const sessions = await db.select().from(studioSessions)
        .where(and(...conditions))
        .orderBy(desc(studioSessions.createdAt))
        .limit(input?.limit || 20);
      return sessions;
    }),

  getSession: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      const [session] = await db.select().from(studioSessions).where(eq(studioSessions.id, input.id));
      if (!session) throw new Error("Session not found");
      const guests = await db.select().from(studioGuests).where(eq(studioGuests.sessionId, input.id));
      return { ...session, guests };
    }),

  updateSessionStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["draft", "scheduled", "greenroom", "live", "recording", "ended", "archived"]),
    }))
    .mutation(async ({ input }) => {
      const now = Date.now();
      const db = await getDb();
      const updates: Record<string, any> = { status: input.status, updatedAt: now };
      if (input.status === "live") updates.startedAt = now;
      if (input.status === "ended") updates.endedAt = now;
      await db.update(studioSessions).set(updates).where(eq(studioSessions.id, input.id));
      return { success: true };
    }),

  goLive: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const now = Date.now();
      const db = await getDb();
      await db.update(studioSessions).set({
        status: "live",
        startedAt: now,
        updatedAt: now,
      }).where(eq(studioSessions.id, input.sessionId));
      // Move all connected guests to on_air
      await db.update(studioGuests).set({ status: "on_air" })
        .where(and(
          eq(studioGuests.sessionId, input.sessionId),
          eq(studioGuests.status, "connected"),
        ));
      return { success: true, startedAt: now };
    }),

  endSession: protectedProcedure
    .input(z.object({ sessionId: z.number() }))
    .mutation(async ({ input }) => {
      const now = Date.now();
      const db = await getDb();
      await db.update(studioSessions).set({
        status: "ended",
        endedAt: now,
        updatedAt: now,
      }).where(eq(studioSessions.id, input.sessionId));
      // Disconnect all guests
      await db.update(studioGuests).set({ status: "disconnected", leftAt: now })
        .where(eq(studioGuests.sessionId, input.sessionId));
      return { success: true, endedAt: now };
    }),

  // ─── Guest Management ──────────────────────────────────
  inviteGuest: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      guestName: z.string().min(1),
      guestEmail: z.string().email().optional(),
      platform: z.enum(["internal", "youtube", "twitch", "zoom", "discord", "twitter_spaces", "custom"]).default("internal"),
      platformHandle: z.string().optional(),
      role: z.enum(["host", "co_host", "panelist", "guest", "moderator", "speaker", "attendee"]).default("guest"),
      bio: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const inviteToken = generateInviteToken();
      const now = Date.now();
      const [result] = await db.insert(studioGuests).values({
        sessionId: input.sessionId,
        guestName: input.guestName,
        guestEmail: input.guestEmail || null,
        platform: input.platform,
        platformHandle: input.platformHandle || null,
        role: input.role,
        status: "invited",
        inviteToken,
        bio: input.bio || null,
        createdAt: now,
      });
      return { id: result.insertId, inviteToken };
    }),

  getGuests: publicProcedure
    .input(z.object({ sessionId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      return db.select().from(studioGuests)
        .where(eq(studioGuests.sessionId, input.sessionId))
        .orderBy(studioGuests.speakingOrder);
    }),

  updateGuestStatus: protectedProcedure
    .input(z.object({
      guestId: z.number(),
      status: z.enum(["invited", "accepted", "declined", "waiting", "connected", "on_air", "muted", "disconnected"]),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const updates: Record<string, any> = { status: input.status };
      if (input.status === "connected" || input.status === "on_air") updates.joinedAt = Date.now();
      if (input.status === "disconnected") updates.leftAt = Date.now();
      if (input.status === "muted") updates.isMuted = true;
      if (input.status === "on_air") updates.isMuted = false;
      await db.update(studioGuests).set(updates).where(eq(studioGuests.id, input.guestId));
      return { success: true };
    }),

  admitGuest: protectedProcedure
    .input(z.object({ guestId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(studioGuests).set({
        status: "connected",
        joinedAt: Date.now(),
      }).where(eq(studioGuests.id, input.guestId));
      return { success: true };
    }),

  removeGuest: protectedProcedure
    .input(z.object({ guestId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(studioGuests).set({
        status: "disconnected",
        leftAt: Date.now(),
      }).where(eq(studioGuests.id, input.guestId));
      return { success: true };
    }),

  toggleMute: protectedProcedure
    .input(z.object({ guestId: z.number(), muted: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(studioGuests).set({
        isMuted: input.muted,
        status: input.muted ? "muted" : "on_air",
      }).where(eq(studioGuests.id, input.guestId));
      return { success: true };
    }),

  reorderGuests: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      guestOrder: z.array(z.object({ guestId: z.number(), order: z.number() })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      for (const item of input.guestOrder) {
        await db.update(studioGuests).set({ speakingOrder: item.order })
          .where(eq(studioGuests.id, item.guestId));
      }
      return { success: true };
    }),

  joinViaCode: publicProcedure
    .input(z.object({
      joinCode: z.string(),
      guestName: z.string().min(1),
      platform: z.enum(["internal", "youtube", "twitch", "zoom", "discord", "twitter_spaces", "custom"]).default("internal"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [session] = await db.select().from(studioSessions)
        .where(eq(studioSessions.joinCode, input.joinCode));
      if (!session) throw new Error("Invalid join code");
      if (session.status === "ended" || session.status === "archived") throw new Error("Session has ended");
      const now = Date.now();
      const [result] = await db.insert(studioGuests).values({
        sessionId: session.id,
        guestName: input.guestName,
        platform: input.platform,
        role: "guest",
        status: "waiting",
        createdAt: now,
      });
      return { guestId: result.insertId, sessionId: session.id, sessionTitle: session.title };
    }),

  // ─── Recordings ────────────────────────────────────────
  getRecordings: protectedProcedure
    .input(z.object({
      sessionId: z.number().optional(),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (input?.sessionId) {
        return db.select().from(studioRecordings)
          .where(eq(studioRecordings.sessionId, input.sessionId))
          .orderBy(desc(studioRecordings.createdAt))
          .limit(input.limit);
      }
      return db.select().from(studioRecordings)
        .orderBy(desc(studioRecordings.createdAt))
        .limit(input?.limit || 20);
    }),

  createRecording: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      title: z.string(),
      recordingUrl: z.string(),
      thumbnailUrl: z.string().optional(),
      durationSeconds: z.number().optional(),
      format: z.enum(["mp4", "mp3", "wav", "webm", "mkv"]).default("mp4"),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const [result] = await db.insert(studioRecordings).values({
        sessionId: input.sessionId,
        title: input.title,
        recordingUrl: input.recordingUrl,
        thumbnailUrl: input.thumbnailUrl || null,
        durationSeconds: input.durationSeconds || 0,
        format: input.format,
        tags: input.tags || null,
        isPublished: false,
        viewCount: 0,
        createdAt: Date.now(),
      });
      return { id: result.insertId };
    }),

  publishRecording: protectedProcedure
    .input(z.object({ recordingId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(studioRecordings).set({ isPublished: true })
        .where(eq(studioRecordings.id, input.recordingId));
      return { success: true };
    }),

  // ─── Studio Stats ─────────────────────────────────────
  getStudioStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    const [sessionStats] = await db.select({
      total: sql<number>`COUNT(*)`,
      live: sql<number>`SUM(CASE WHEN status = 'live' THEN 1 ELSE 0 END)`,
      scheduled: sql<number>`SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END)`,
      archived: sql<number>`SUM(CASE WHEN status IN ('ended', 'archived') THEN 1 ELSE 0 END)`,
      totalViewers: sql<number>`COALESCE(SUM(viewer_count), 0)`,
      peakViewers: sql<number>`COALESCE(MAX(peak_viewers), 0)`,
    }).from(studioSessions).where(eq(studioSessions.hostUserId, ctx.user.id));

    const [recordingStats] = await db.select({
      total: sql<number>`COUNT(*)`,
      published: sql<number>`SUM(CASE WHEN is_published = true THEN 1 ELSE 0 END)`,
      totalViews: sql<number>`COALESCE(SUM(view_count), 0)`,
    }).from(studioRecordings);

    return {
      sessions: sessionStats,
      recordings: recordingStats,
    };
  }),
});
