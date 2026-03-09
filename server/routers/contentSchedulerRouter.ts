import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { contentSchedule, adInventory, socialMediaPosts } from "../../drizzle/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

// ─── Default 24/7 Schedule Template ─────────────────────
// QUMUS auto-populates all 50 channels with rotating content
const DEFAULT_SCHEDULE_TEMPLATE = [
  // ── RRB Main (Channel 1) ──
  { channelId: 1, channelName: 'RRB Main', showName: 'Morning Motivation Mix', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '06:00', endTime: '09:00', description: 'Wake up with positive energy — curated soul, R&B, and uplifting tracks', host: 'Valanna AI' },
  { channelId: 1, channelName: 'RRB Main', showName: 'Top of the Sol', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '09:00', endTime: '12:00', description: 'Mid-morning groove — the best of Solfeggio-tuned music', host: 'Valanna AI' },
  { channelId: 1, channelName: 'RRB Main', showName: 'Afternoon Groove', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '12:00', endTime: '15:00', description: 'Smooth afternoon vibes — jazz, soul, and contemporary R&B', host: 'QUMUS Auto' },
  { channelId: 1, channelName: 'RRB Main', showName: 'Drive Time Soul', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '15:00', endTime: '18:00', description: 'Rush hour companion — upbeat soul and funk classics', host: 'Valanna AI' },
  { channelId: 1, channelName: 'RRB Main', showName: 'Evening Unwind', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '18:00', endTime: '21:00', description: 'Wind down with smooth jazz and mellow R&B', host: 'QUMUS Auto' },
  { channelId: 1, channelName: 'RRB Main', showName: 'Late Night Boogie', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '21:00', endTime: '00:00', description: 'Late night grooves — deep cuts and rare tracks', host: 'Valanna AI' },
  { channelId: 1, channelName: 'RRB Main', showName: 'Midnight Meditation', showType: 'healing' as const, dayOfWeek: 'daily' as const, startTime: '00:00', endTime: '06:00', description: '432 Hz overnight healing — ambient and frequency-tuned content', host: 'QUMUS Auto' },

  // ── Soul & R&B Classics (Channel 2) ──
  { channelId: 2, channelName: 'Soul & R&B Classics', showName: 'Classic Soul Hour', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '06:00', endTime: '12:00', description: 'Timeless Motown, Stax, and classic soul', host: 'QUMUS Auto' },
  { channelId: 2, channelName: 'Soul & R&B Classics', showName: 'Motown Memories', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '12:00', endTime: '18:00', description: 'The Supremes, Temptations, Stevie Wonder, and more', host: 'QUMUS Auto' },
  { channelId: 2, channelName: 'Soul & R&B Classics', showName: 'R&B After Dark', showType: 'music' as const, dayOfWeek: 'daily' as const, startTime: '18:00', endTime: '06:00', description: 'Slow jams and late-night R&B classics', host: 'QUMUS Auto' },

  // ── Gospel & Worship (Channel 11) ──
  { channelId: 11, channelName: 'Gospel Hour', showName: 'Morning Praise', showType: 'gospel' as const, dayOfWeek: 'daily' as const, startTime: '06:00', endTime: '10:00', description: 'Start the day with praise and worship', host: 'QUMUS Auto' },
  { channelId: 11, channelName: 'Gospel Hour', showName: 'Sunday Service Broadcast', showType: 'gospel' as const, dayOfWeek: 'sunday' as const, startTime: '10:00', endTime: '13:00', description: 'Live church service broadcast — multiple congregations', host: 'Valanna AI' },
  { channelId: 11, channelName: 'Gospel Hour', showName: 'Evening Devotion', showType: 'gospel' as const, dayOfWeek: 'daily' as const, startTime: '18:00', endTime: '21:00', description: 'Evening worship and devotional music', host: 'QUMUS Auto' },

  // ── Candy's Corner (Channel 42) ──
  { channelId: 42, channelName: "Candy's Corner", showName: "Candy's Corner Live", showType: 'talk' as const, dayOfWeek: 'daily' as const, startTime: '20:00', endTime: '22:00', description: 'Live call-in show with Candy AI — real talk, real stories, real family', host: 'Candy AI' },
  { channelId: 42, channelName: "Candy's Corner", showName: 'The Seabrun Sessions', showType: 'talk' as const, dayOfWeek: 'wednesday' as const, startTime: '20:00', endTime: '22:00', description: 'Deep dive into the Candy Hunter investigation — evidence review and community discussion', host: 'Candy AI' },

  // ── Healing Frequencies (Channel 21) ──
  { channelId: 21, channelName: '432 Hz Harmony', showName: '432 Hz Continuous', showType: 'healing' as const, dayOfWeek: 'daily' as const, startTime: '00:00', endTime: '23:59', description: '24/7 432 Hz universal harmony — the cosmic frequency', host: 'QUMUS Auto' },

  // ── Solfeggio Meditation (Channel 22) ──
  { channelId: 22, channelName: 'Solfeggio Meditation', showName: 'Morning Frequency Rotation', showType: 'healing' as const, dayOfWeek: 'daily' as const, startTime: '06:00', endTime: '12:00', description: 'Rotating Solfeggio frequencies — 174 Hz through 963 Hz', host: 'QUMUS Auto' },
  { channelId: 22, channelName: 'Solfeggio Meditation', showName: '528 Hz Miracle Tone', showType: 'healing' as const, dayOfWeek: 'daily' as const, startTime: '12:00', endTime: '18:00', description: 'DNA repair and transformation frequency', host: 'QUMUS Auto' },
  { channelId: 22, channelName: 'Solfeggio Meditation', showName: '963 Hz Divine Consciousness', showType: 'healing' as const, dayOfWeek: 'daily' as const, startTime: '18:00', endTime: '06:00', description: 'Pineal gland activation — divine consciousness overnight', host: 'QUMUS Auto' },

  // ── Community Voice (Channel 31) ──
  { channelId: 31, channelName: 'Community Voice', showName: 'Community Roundtable', showType: 'talk' as const, dayOfWeek: 'daily' as const, startTime: '10:00', endTime: '12:00', description: 'Local community discussions and announcements', host: 'QUMUS Auto' },
  { channelId: 31, channelName: 'Community Voice', showName: 'SQUADD Goals Report', showType: 'talk' as const, dayOfWeek: 'friday' as const, startTime: '14:00', endTime: '16:00', description: 'Weekly SQUADD Goals progress and community impact report', host: 'Valanna AI' },

  // ── News & Current Events (Channel 35) ──
  { channelId: 35, channelName: 'RRB News Desk', showName: 'Morning News Brief', showType: 'news' as const, dayOfWeek: 'daily' as const, startTime: '07:00', endTime: '08:00', description: 'Top stories and community news', host: 'Seraph AI' },
  { channelId: 35, channelName: 'RRB News Desk', showName: 'Evening News Wrap', showType: 'news' as const, dayOfWeek: 'daily' as const, startTime: '17:00', endTime: '18:00', description: 'End of day news summary and analysis', host: 'Seraph AI' },

  // ── Emergency Broadcast (Channel 44) ──
  { channelId: 44, channelName: 'Emergency Broadcast', showName: 'HybridCast Standby', showType: 'emergency' as const, dayOfWeek: 'daily' as const, startTime: '00:00', endTime: '23:59', description: 'Emergency broadcast system — activates on HybridCast alert. QUMUS monitors 24/7.', host: 'QUMUS Auto' },

  // ── Podcast Studio (Channel 43) ──
  { channelId: 43, channelName: 'Podcast Studio', showName: 'The RRB Podcast', showType: 'podcast' as const, dayOfWeek: 'monday' as const, startTime: '10:00', endTime: '11:00', description: 'Weekly podcast — interviews, stories, and community highlights', host: 'Valanna AI' },
  { channelId: 43, channelName: 'Podcast Studio', showName: 'Legacy Conversations', showType: 'podcast' as const, dayOfWeek: 'thursday' as const, startTime: '10:00', endTime: '11:00', description: 'Deep conversations about legacy, family, and building something that lasts', host: 'Candy AI' },

  // ── Commercial Breaks (rotated across all channels) ──
  { channelId: 0, channelName: 'All Channels', showName: 'Sweet Miracles PSA', showType: 'commercial' as const, dayOfWeek: 'daily' as const, startTime: '08:00', endTime: '08:05', description: 'Sweet Miracles 501(c)/508 donation awareness — healing through community', host: 'QUMUS Auto' },
  { channelId: 0, channelName: 'All Channels', showName: 'Canryn Production Spot', showType: 'commercial' as const, dayOfWeek: 'daily' as const, startTime: '14:00', endTime: '14:05', description: 'Canryn Production and subsidiaries — building the future', host: 'QUMUS Auto' },
  { channelId: 0, channelName: 'All Channels', showName: 'HybridCast Awareness', showType: 'commercial' as const, dayOfWeek: 'daily' as const, startTime: '20:00', endTime: '20:05', description: 'HybridCast emergency broadcast system — be prepared', host: 'QUMUS Auto' },

  // ── Live Events (Channel 41) ──
  { channelId: 41, channelName: 'Live Events', showName: 'Selma Jubilee Coverage', showType: 'live_event' as const, dayOfWeek: 'saturday' as const, startTime: '10:00', endTime: '18:00', description: '61st Selma Bridge Crossing Jubilee — GRITS & GREENS live coverage', host: 'Valanna AI' },
  { channelId: 41, channelName: 'Live Events', showName: 'Bridge Crossing Broadcast', showType: 'live_event' as const, dayOfWeek: 'sunday' as const, startTime: '14:00', endTime: '18:00', description: 'Live broadcast of the commemorative Bridge Crossing', host: 'Valanna AI' },
];

export const contentSchedulerRouter = router({
  // Get full schedule (optionally filtered by channel or day)
  getSchedule: publicProcedure
    .input(z.object({
      channelId: z.number().optional(),
      dayOfWeek: z.string().optional(),
      showType: z.string().optional(),
      activeOnly: z.boolean().optional().default(true),
    }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        let query = db.select().from(contentSchedule);
        const conditions = [];
        if (input?.channelId) conditions.push(eq(contentSchedule.channelId, input.channelId));
        if (input?.dayOfWeek) conditions.push(eq(contentSchedule.dayOfWeek, input.dayOfWeek as any));
        if (input?.showType) conditions.push(eq(contentSchedule.showType, input.showType as any));
        if (input?.activeOnly !== false) conditions.push(eq(contentSchedule.isActive, true));
        
        if (conditions.length > 0) {
          return await query.where(and(...conditions)).orderBy(asc(contentSchedule.startTime));
        }
        return await query.orderBy(asc(contentSchedule.channelId), asc(contentSchedule.startTime));
      } catch {
        return [];
      }
    }),

  // Get today's schedule (what's on now across all channels)
  getTodaySchedule: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[new Date().getDay()];
      
      const results = await db.select().from(contentSchedule)
        .where(and(
          eq(contentSchedule.isActive, true),
          sql`(${contentSchedule.dayOfWeek} = ${today} OR ${contentSchedule.dayOfWeek} = 'daily')`
        ))
        .orderBy(asc(contentSchedule.startTime));
      return results;
    } catch {
      return [];
    }
  }),

  // Get what's playing now (current time slot across all channels)
  getNowPlaying: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[now.getDay()];
      
      const results = await db.select().from(contentSchedule)
        .where(and(
          eq(contentSchedule.isActive, true),
          sql`(${contentSchedule.dayOfWeek} = ${today} OR ${contentSchedule.dayOfWeek} = 'daily')`,
          sql`${contentSchedule.startTime} <= ${currentTime}`,
          sql`${contentSchedule.endTime} > ${currentTime}`
        ))
        .orderBy(asc(contentSchedule.channelId));
      return results;
    } catch {
      return [];
    }
  }),

  // Seed the default 24/7 schedule (admin only)
  seedDefaultSchedule: protectedProcedure.mutation(async () => {
    try {
      const db = await getDb();
      // Clear existing schedule
      await db.delete(contentSchedule);
      
      // Insert all default schedule entries
      for (const entry of DEFAULT_SCHEDULE_TEMPLATE) {
        await db.insert(contentSchedule).values({
          channelId: entry.channelId,
          channelName: entry.channelName,
          showName: entry.showName,
          showType: entry.showType,
          dayOfWeek: entry.dayOfWeek,
          startTime: entry.startTime,
          endTime: entry.endTime,
          description: entry.description || null,
          host: entry.host || null,
          isRecurring: true,
          isActive: true,
          priority: 5,
          qumusManaged: true,
        });
      }
      
      return { success: true, count: DEFAULT_SCHEDULE_TEMPLATE.length, message: `Seeded ${DEFAULT_SCHEDULE_TEMPLATE.length} schedule entries across all channels` };
    } catch (e: any) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
    }
  }),

  // Add a schedule entry (admin)
  addEntry: protectedProcedure
    .input(z.object({
      channelId: z.number(),
      channelName: z.string(),
      showName: z.string(),
      showType: z.enum(['music', 'talk', 'podcast', 'commercial', 'healing', 'live_event', 'news', 'gospel', 'emergency']),
      dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'daily']),
      startTime: z.string(),
      endTime: z.string(),
      description: z.string().optional(),
      host: z.string().optional(),
      priority: z.number().optional().default(5),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        await db.insert(contentSchedule).values({
          ...input,
          description: input.description || null,
          host: input.host || null,
          isRecurring: true,
          isActive: true,
          qumusManaged: true,
        });
        return { success: true };
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // Update a schedule entry
  updateEntry: protectedProcedure
    .input(z.object({
      id: z.number(),
      showName: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      description: z.string().optional(),
      host: z.string().optional(),
      isActive: z.boolean().optional(),
      priority: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        const { id, ...updates } = input;
        await db.update(contentSchedule).set(updates).where(eq(contentSchedule.id, id));
        return { success: true };
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // Delete a schedule entry
  deleteEntry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        await db.delete(contentSchedule).where(eq(contentSchedule.id, input.id));
        return { success: true };
      } catch (e: any) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: e.message });
      }
    }),

  // Get now playing with integrated ad rotation
  getNowPlayingWithAds: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const currentHour = `${String(now.getHours()).padStart(2, '0')}:00`;
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const today = days[now.getDay()];
      
      // Get current programming
      const programming = await db.select().from(contentSchedule)
        .where(and(
          eq(contentSchedule.isActive, true),
          sql`(${contentSchedule.dayOfWeek} = ${today} OR ${contentSchedule.dayOfWeek} = 'daily')`,
          sql`${contentSchedule.startTime} <= ${currentTime}`,
          sql`${contentSchedule.endTime} > ${currentTime}`
        ))
        .orderBy(asc(contentSchedule.channelId));
      
      // Get active ads for current time slot
      const activeAds = await db.select().from(adInventory)
        .where(and(
          eq(adInventory.active, true),
          sql`(${adInventory.timeSlotStart} IS NULL OR ${adInventory.timeSlotStart} <= ${currentHour})`,
          sql`(${adInventory.timeSlotEnd} IS NULL OR ${adInventory.timeSlotEnd} >= ${currentHour})`,
        ))
        .orderBy(desc(adInventory.rotationWeight))
        .limit(5);
      
      // Find commercial slots in current programming
      const commercialSlots = programming.filter(p => p.showType === 'commercial');
      const regularProgramming = programming.filter(p => p.showType !== 'commercial');
      
      return {
        programming: regularProgramming,
        commercialSlots: commercialSlots.map(slot => ({
          ...slot,
          scheduledAds: activeAds.filter(ad => {
            if (!ad.targetChannels || ad.targetChannels === 'all') return true;
            return ad.targetChannels.split(',').map(t => t.trim()).includes(String(slot.channelId));
          }).slice(0, 2),
        })),
        adPool: activeAds.map(ad => ({
          id: ad.id,
          sponsor: ad.sponsorName,
          campaign: ad.campaignName,
          duration: ad.durationSeconds,
          weight: ad.rotationWeight,
          category: ad.category,
        })),
        timestamp: now.toISOString(),
      };
    } catch {
      return { programming: [], commercialSlots: [], adPool: [], timestamp: new Date().toISOString() };
    }
  }),

  // Get schedule stats
  getStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      const all = await db.select().from(contentSchedule);
      const active = all.filter(s => s.isActive);
      const byType: Record<string, number> = {};
      const byChannel: Record<string, number> = {};
      
      for (const entry of active) {
        byType[entry.showType] = (byType[entry.showType] || 0) + 1;
        byChannel[entry.channelName] = (byChannel[entry.channelName] || 0) + 1;
      }
      
      return {
        totalEntries: all.length,
        activeEntries: active.length,
        uniqueChannels: Object.keys(byChannel).length,
        byType,
        byChannel,
        qumusManaged: active.filter(s => s.qumusManaged).length,
        hosts: [...new Set(active.map(s => s.host).filter(Boolean))],
      };
    } catch {
      return { totalEntries: 0, activeEntries: 0, uniqueChannels: 0, byType: {}, byChannel: {}, qumusManaged: 0, hosts: [] };
    }
  }),

  // ─── Social Media Scheduled Posts ─────────────────────
  getSocialMediaPosts: publicProcedure
    .input(z.object({
      platform: z.enum(['twitter', 'instagram', 'discord', 'facebook', 'tiktok', 'youtube']).optional(),
      status: z.enum(['draft', 'scheduled', 'published', 'failed', 'cancelled']).optional(),
      campaign: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        const conditions: any[] = [];
        if (input?.platform) conditions.push(eq(socialMediaPosts.platform, input.platform));
        if (input?.status) conditions.push(eq(socialMediaPosts.status, input.status));
        if (input?.campaign) conditions.push(eq(socialMediaPosts.campaign, input.campaign));
        
        let query = db.select().from(socialMediaPosts);
        if (conditions.length > 0) {
          return await query.where(and(...conditions)).orderBy(asc(socialMediaPosts.scheduledAt));
        }
        return await query.orderBy(asc(socialMediaPosts.scheduledAt));
      } catch {
        return [];
      }
    }),

  getSocialMediaStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      const all = await db.select().from(socialMediaPosts);
      const byPlatform: Record<string, number> = {};
      const byStatus: Record<string, number> = {};
      for (const post of all) {
        byPlatform[post.platform] = (byPlatform[post.platform] || 0) + 1;
        byStatus[post.status] = (byStatus[post.status] || 0) + 1;
      }
      return {
        totalPosts: all.length,
        byPlatform,
        byStatus,
        nextScheduled: all.filter(p => p.status === 'scheduled').sort((a, b) => a.scheduledAt - b.scheduledAt)[0] || null,
      };
    } catch {
      return { totalPosts: 0, byPlatform: {}, byStatus: {}, nextScheduled: null };
    }
  }),

  updateSocialMediaPostStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['draft', 'scheduled', 'published', 'failed', 'cancelled']),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      await db.update(socialMediaPosts)
        .set({ status: input.status, updatedAt: Date.now(), publishedAt: input.status === 'published' ? Date.now() : undefined })
        .where(eq(socialMediaPosts.id, input.id));
      return { success: true };
    }),

  triggerSocialMediaPublish: protectedProcedure
    .mutation(async () => {
      const { checkAndPublishScheduledPosts } = await import('../socialMediaPublisher');
      const results = await checkAndPublishScheduledPosts();
      return { success: true, postsProcessed: results.length, results };
    }),
});
