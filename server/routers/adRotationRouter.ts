import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { adInventory } from "../../drizzle/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";

/**
 * Commercial/Ad Rotation System
 * 
 * QUMUS-managed ad rotation across all 50 RRB channels:
 * - Sponsor inventory management (CRUD)
 * - Weighted rotation algorithm (higher weight = more plays)
 * - Time-slot targeting (morning drive, afternoon, evening, overnight)
 * - Channel-specific targeting
 * - Budget tracking and cost-per-play
 * - Auto-rotation via QUMUS Content Scheduling policy
 * - PSA and community announcement support
 */

export const adRotationRouter = router({
  // ─── Get all ads with filtering ───────────────────────────
  getAds: publicProcedure
    .input(z.object({
      category: z.enum(['commercial', 'psa', 'promo', 'sponsor', 'community']).optional(),
      activeOnly: z.boolean().default(true),
      limit: z.number().min(1).max(100).default(50),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      const opts = input || { activeOnly: true, limit: 50 };
      
      let query = db.select().from(adInventory).orderBy(desc(adInventory.rotationWeight));
      
      if (opts.activeOnly) {
        query = query.where(eq(adInventory.active, true)) as typeof query;
      }
      if (opts.category) {
        query = query.where(eq(adInventory.category, opts.category)) as typeof query;
      }
      
      return await query.limit(opts.limit);
    }),

  // ─── Create a new ad/commercial ───────────────────────────
  createAd: protectedProcedure
    .input(z.object({
      sponsorName: z.string().min(1),
      campaignName: z.string().min(1),
      audioUrl: z.string().optional(),
      durationSeconds: z.number().min(5).max(120).default(30),
      category: z.enum(['commercial', 'psa', 'promo', 'sponsor', 'community']).default('commercial'),
      targetChannels: z.string().optional(),
      rotationWeight: z.number().min(1).max(10).default(1),
      maxPlaysPerHour: z.number().min(1).max(10).default(2),
      timeSlotStart: z.string().optional(),
      timeSlotEnd: z.string().optional(),
      budgetCents: z.number().optional(),
      costPerPlayCents: z.number().optional(),
      startDate: z.number().optional(),
      endDate: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      
      const [result] = await db.insert(adInventory).values({
        sponsorName: input.sponsorName,
        campaignName: input.campaignName,
        audioUrl: input.audioUrl || null,
        durationSeconds: input.durationSeconds,
        category: input.category,
        targetChannels: input.targetChannels || 'all',
        rotationWeight: input.rotationWeight,
        maxPlaysPerHour: input.maxPlaysPerHour,
        timeSlotStart: input.timeSlotStart || null,
        timeSlotEnd: input.timeSlotEnd || null,
        active: true,
        totalPlays: 0,
        budgetCents: input.budgetCents || null,
        costPerPlayCents: input.costPerPlayCents || null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        createdAt: now,
        updatedAt: now,
      });
      
      return { id: result.insertId, sponsorName: input.sponsorName, campaignName: input.campaignName };
    }),

  // ─── Update an ad ────────────────────────────────────────
  updateAd: protectedProcedure
    .input(z.object({
      id: z.number(),
      sponsorName: z.string().optional(),
      campaignName: z.string().optional(),
      audioUrl: z.string().optional(),
      durationSeconds: z.number().optional(),
      category: z.enum(['commercial', 'psa', 'promo', 'sponsor', 'community']).optional(),
      targetChannels: z.string().optional(),
      rotationWeight: z.number().min(1).max(10).optional(),
      maxPlaysPerHour: z.number().min(1).max(10).optional(),
      timeSlotStart: z.string().optional(),
      timeSlotEnd: z.string().optional(),
      active: z.boolean().optional(),
      budgetCents: z.number().optional(),
      costPerPlayCents: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const { id, ...updates } = input;
      
      await db.update(adInventory)
        .set({ ...updates, updatedAt: Date.now() } as any)
        .where(eq(adInventory.id, id));
      
      return { updated: true, id };
    }),

  // ─── Delete an ad ────────────────────────────────────────
  deleteAd: protectedProcedure
    .input(z.number())
    .mutation(async ({ input: id }) => {
      const db = await getDb();
      await db.delete(adInventory).where(eq(adInventory.id, id));
      return { deleted: true, id };
    }),

  // ─── QUMUS Auto-Rotation: Get next ad for a channel ──────
  getNextAd: publicProcedure
    .input(z.object({
      channelId: z.number(),
      channelName: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      const now = Date.now();
      const currentHour = new Date().getHours();
      const currentTimeStr = `${String(currentHour).padStart(2, '0')}:00`;
      
      // Get all active ads, weighted by rotation_weight
      const activeAds = await db.select().from(adInventory)
        .where(and(
          eq(adInventory.active, true),
          sql`(${adInventory.startDate} IS NULL OR ${adInventory.startDate} <= ${now})`,
          sql`(${adInventory.endDate} IS NULL OR ${adInventory.endDate} >= ${now})`,
        ))
        .orderBy(desc(adInventory.rotationWeight));
      
      if (activeAds.length === 0) return null;
      
      // Filter by channel targeting
      const channelAds = activeAds.filter(ad => {
        if (!ad.targetChannels || ad.targetChannels === 'all') return true;
        const targets = ad.targetChannels.split(',').map(t => t.trim());
        return targets.includes(String(input.channelId)) || targets.includes(input.channelName || '');
      });
      
      // Filter by time slot
      const timeFilteredAds = channelAds.filter(ad => {
        if (!ad.timeSlotStart || !ad.timeSlotEnd) return true;
        return currentTimeStr >= ad.timeSlotStart && currentTimeStr <= ad.timeSlotEnd;
      });
      
      const pool = timeFilteredAds.length > 0 ? timeFilteredAds : channelAds;
      if (pool.length === 0) return null;
      
      // Weighted random selection
      const totalWeight = pool.reduce((sum, ad) => sum + ad.rotationWeight, 0);
      let random = Math.random() * totalWeight;
      
      for (const ad of pool) {
        random -= ad.rotationWeight;
        if (random <= 0) {
          // Increment play count
          await db.update(adInventory)
            .set({ totalPlays: sql`${adInventory.totalPlays} + 1`, updatedAt: Date.now() })
            .where(eq(adInventory.id, ad.id));
          
          return ad;
        }
      }
      
      return pool[0]; // Fallback
    }),

  // ─── Get ad rotation stats ───────────────────────────────
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    
    const [totalAds] = await db.select({ count: count() }).from(adInventory);
    const [activeAds] = await db.select({ count: count() }).from(adInventory).where(eq(adInventory.active, true));
    const [totalPlays] = await db.select({ total: sql<number>`COALESCE(SUM(${adInventory.totalPlays}), 0)` }).from(adInventory);
    const [totalRevenue] = await db.select({
      total: sql<number>`COALESCE(SUM(${adInventory.totalPlays} * ${adInventory.costPerPlayCents}), 0)`,
    }).from(adInventory).where(sql`${adInventory.costPerPlayCents} IS NOT NULL`);
    
    // Get top sponsors by play count
    const topSponsors = await db.select({
      sponsorName: adInventory.sponsorName,
      totalPlays: sql<number>`SUM(${adInventory.totalPlays})`,
      campaignCount: count(),
    })
      .from(adInventory)
      .groupBy(adInventory.sponsorName)
      .orderBy(desc(sql`SUM(${adInventory.totalPlays})`))
      .limit(10);
    
    // Get category breakdown
    const categoryBreakdown = await db.select({
      category: adInventory.category,
      count: count(),
      totalPlays: sql<number>`SUM(${adInventory.totalPlays})`,
    })
      .from(adInventory)
      .groupBy(adInventory.category);
    
    return {
      totalAds: totalAds?.count || 0,
      activeAds: activeAds?.count || 0,
      totalPlays: totalPlays?.total || 0,
      estimatedRevenueCents: totalRevenue?.total || 0,
      topSponsors,
      categoryBreakdown,
    };
  }),

  // ─── Seed default ad inventory ───────────────────────────
  seedDefaults: protectedProcedure.mutation(async () => {
    const db = await getDb();
    const now = Date.now();
    
    const defaultAds = [
      { sponsorName: 'Canryn Production', campaignName: 'QUMUS Platform Launch', category: 'promo' as const, durationSeconds: 30, rotationWeight: 5, targetChannels: 'all', timeSlotStart: '06:00', timeSlotEnd: '22:00' },
      { sponsorName: 'Sweet Miracles Foundation', campaignName: 'Community Giving PSA', category: 'psa' as const, durationSeconds: 30, rotationWeight: 4, targetChannels: 'all', timeSlotStart: '08:00', timeSlotEnd: '20:00' },
      { sponsorName: 'RRB Radio Network', campaignName: '54 Channel Launch', category: 'promo' as const, durationSeconds: 15, rotationWeight: 3, targetChannels: 'all' },
      { sponsorName: 'HybridCast Emergency', campaignName: 'Emergency Preparedness PSA', category: 'psa' as const, durationSeconds: 30, rotationWeight: 3, targetChannels: 'all', timeSlotStart: '06:00', timeSlotEnd: '18:00' },
      { sponsorName: 'Solbones Game', campaignName: 'Sacred Math Dice Game', category: 'promo' as const, durationSeconds: 15, rotationWeight: 2, targetChannels: 'all', timeSlotStart: '16:00', timeSlotEnd: '23:00' },
      { sponsorName: 'Local Business Spotlight', campaignName: 'Support Black-Owned Businesses', category: 'community' as const, durationSeconds: 30, rotationWeight: 3, targetChannels: 'all' },
      { sponsorName: 'Selma Jubilee Committee', campaignName: '61st Bridge Crossing Jubilee', category: 'community' as const, durationSeconds: 30, rotationWeight: 4, targetChannels: 'all', timeSlotStart: '06:00', timeSlotEnd: '22:00' },
      { sponsorName: 'Meditation & Wellness', campaignName: 'Healing Frequencies Awareness', category: 'psa' as const, durationSeconds: 20, rotationWeight: 2, targetChannels: '5,6,7,8,9,10' },
    ];
    
    const results = [];
    for (const ad of defaultAds) {
      const [result] = await db.insert(adInventory).values({
        ...ad,
        audioUrl: null,
        maxPlaysPerHour: 2,
        timeSlotStart: ad.timeSlotStart || null,
        timeSlotEnd: ad.timeSlotEnd || null,
        active: true,
        totalPlays: 0,
        budgetCents: null,
        costPerPlayCents: null,
        startDate: null,
        endDate: null,
        createdAt: now,
        updatedAt: now,
      });
      results.push({ id: result.insertId, ...ad });
    }
    
    return { seeded: results.length, ads: results };
  }),
});
