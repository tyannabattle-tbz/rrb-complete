import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { getDb } from '../db';
import { 
  customStations, 
  stationTemplates, 
  stationContentSources,
  stationPlaybackHistory,
  userStationPreferences,
  stationSharing,
  stationAnalytics
} from '../../drizzle/schema';
import { eq, and } from 'drizzle-orm';

const ContentTypeEnum = z.enum(['talk', 'music', 'news', 'meditation', 'healing', 'entertainment', 'educational', 'sports', 'comedy', 'mixed']);

export const customStationBuilderRouter = router({
  // Create a custom station
  createStation: protectedProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      contentTypes: z.array(ContentTypeEnum).min(1),
      icon: z.string().optional(),
      color: z.string().optional(),
      isPublic: z.boolean().default(false),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const result = await db.insert(customStations).values({
        userId: ctx.user.id.toString(),
        name: input.name,
        description: input.description,
        contentTypes: input.contentTypes,
        icon: input.icon,
        color: input.color,
        isPublic: input.isPublic,
      });

      return { success: true, stationId: result[0] };
    }),

  // Get user's custom stations
  getUserStations: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const stations = await db
        .select()
        .from(customStations)
        .where(eq(customStations.userId, ctx.user.id.toString()));

      return stations;
    }),

  // Get a specific station
  getStation: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const station = await db
        .select()
        .from(customStations)
        .where(eq(customStations.id, input.stationId));

      if (!station.length) throw new Error('Station not found');
      if (station[0].userId !== ctx.user.id.toString() && !station[0].isPublic) {
        throw new Error('Unauthorized');
      }

      return station[0];
    }),

  // Update station
  updateStation: protectedProcedure
    .input(z.object({
      stationId: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      contentTypes: z.array(ContentTypeEnum).optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      isPublic: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const { stationId, ...updateData } = input;

      await db
        .update(customStations)
        .set({ ...updateData, updatedAt: new Date() })
        .where(
          and(
            eq(customStations.id, stationId),
            eq(customStations.userId, ctx.user.id.toString())
          )
        );

      return { success: true };
    }),

  // Delete station
  deleteStation: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      await db
        .delete(customStations)
        .where(
          and(
            eq(customStations.id, input.stationId),
            eq(customStations.userId, ctx.user.id.toString())
          )
        );

      return { success: true };
    }),

  // Get station templates (predefined stations)
  getTemplates: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const templates = await db
        .select()
        .from(stationTemplates)
        .where(eq(stationTemplates.isActive, true));

      return templates;
    }),

  // Create station from template
  createFromTemplate: protectedProcedure
    .input(z.object({
      templateId: z.number(),
      customName: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const template = await db
        .select()
        .from(stationTemplates)
        .where(eq(stationTemplates.id, input.templateId));

      if (!template.length) throw new Error('Template not found');

      const t = template[0];
      const result = await db.insert(customStations).values({
        userId: ctx.user.id.toString(),
        name: input.customName || t.name,
        description: t.description,
        contentTypes: t.contentTypes as any,
        icon: t.icon,
        color: t.color,
      });

      return { success: true, stationId: result[0] };
    }),

  // Add content source to station
  addContentSource: protectedProcedure
    .input(z.object({
      stationId: z.number(),
      contentType: ContentTypeEnum,
      sourceUrl: z.string().url(),
      priority: z.number().optional().default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // Verify ownership
      const station = await db
        .select()
        .from(customStations)
        .where(eq(customStations.id, input.stationId));

      if (!station.length || station[0].userId !== ctx.user.id.toString()) {
        throw new Error('Unauthorized');
      }

      const result = await db.insert(stationContentSources).values({
        stationId: input.stationId,
        contentType: input.contentType,
        sourceUrl: input.sourceUrl,
        priority: input.priority,
      });

      return { success: true, sourceId: result[0] };
    }),

  // Get station content sources
  getContentSources: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const sources = await db
        .select()
        .from(stationContentSources)
        .where(eq(stationContentSources.stationId, input.stationId));

      return sources;
    }),

  // Update playback history (what's currently playing)
  updatePlayback: protectedProcedure
    .input(z.object({
      stationId: z.number(),
      contentType: ContentTypeEnum,
      title: z.string(),
      description: z.string().optional(),
      duration: z.number().optional(),
      listeners: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const result = await db.insert(stationPlaybackHistory).values({
        stationId: input.stationId,
        contentType: input.contentType,
        title: input.title,
        description: input.description,
        duration: input.duration,
        startTime: new Date(),
        listeners: input.listeners || 0,
      });

      return { success: true, playbackId: result[0] };
    }),

  // Get current playback
  getCurrentPlayback: publicProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const history = await db
        .select()
        .from(stationPlaybackHistory)
        .where(eq(stationPlaybackHistory.stationId, input.stationId));

      // Return the most recent playback
      if (history.length > 0) {
        return history[history.length - 1];
      }

      return null;
    }),

  // Add station to favorites
  toggleFavorite: protectedProcedure
    .input(z.object({
      stationId: z.number(),
      isFavorite: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const existing = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, ctx.user.id.toString()),
            eq(userStationPreferences.stationId, input.stationId)
          )
        );

      if (existing.length > 0) {
        await db
          .update(userStationPreferences)
          .set({ isFavorite: input.isFavorite })
          .where(eq(userStationPreferences.id, existing[0].id));
      } else {
        await db.insert(userStationPreferences).values({
          userId: ctx.user.id.toString(),
          stationId: input.stationId,
          isFavorite: input.isFavorite,
        });
      }

      return { success: true };
    }),

  // Get user's favorite stations
  getFavorites: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const favorites = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, ctx.user.id.toString()),
            eq(userStationPreferences.isFavorite, true)
          )
        );

      return favorites;
    }),

  // Share station with another user
  shareStation: protectedProcedure
    .input(z.object({
      stationId: z.number(),
      sharedWithUserId: z.string(),
      permission: z.enum(['view', 'edit', 'admin']).optional().default('view'),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      // Verify ownership
      const station = await db
        .select()
        .from(customStations)
        .where(eq(customStations.id, input.stationId));

      if (!station.length || station[0].userId !== ctx.user.id.toString()) {
        throw new Error('Unauthorized');
      }

      const result = await db.insert(stationSharing).values({
        stationId: input.stationId,
        ownerId: ctx.user.id.toString(),
        sharedWithUserId: input.sharedWithUserId,
        permission: input.permission,
      });

      return { success: true, sharingId: result[0] };
    }),

  // Get station analytics
  getAnalytics: protectedProcedure
    .input(z.object({
      stationId: z.number(),
      days: z.number().optional().default(7),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const analytics = await db
        .select()
        .from(stationAnalytics)
        .where(eq(stationAnalytics.stationId, input.stationId));

      return analytics;
    }),

  // Browse public stations
  browsePublicStations: publicProcedure
    .input(z.object({
      contentType: z.string().optional(),
      limit: z.number().optional().default(20),
      offset: z.number().optional().default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const stations = await db
        .select()
        .from(customStations)
        .where(eq(customStations.isPublic, true));

      // Filter by content type if provided
      let filtered = stations;
      if (input.contentType) {
        filtered = stations.filter((s) =>
          (s.contentTypes as string[]).includes(input.contentType!)
        );
      }

      // Apply pagination
      return filtered.slice(input.offset, input.offset + input.limit);
    }),

  // Get current playback for a station
  getCurrentPlayback: publicProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const history = await db
        .select()
        .from(stationPlaybackHistory)
        .where(eq(stationPlaybackHistory.stationId, input.stationId));

      if (history.length === 0) return null;
      return history[history.length - 1];
    }),

  // Validate content matches station type
  validateContent: publicProcedure
    .input(z.object({
      stationId: z.number(),
      contentType: ContentTypeEnum,
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const station = await db
        .select()
        .from(customStations)
        .where(eq(customStations.id, input.stationId));

      if (!station.length) {
        return { isValid: false, reason: 'Station not found' };
      }

      const stationContentTypes = station[0].contentTypes as string[];
      const isValid = stationContentTypes.includes(input.contentType) || 
                      stationContentTypes.includes('mixed');

      return {
        isValid,
        stationContentTypes,
        requestedType: input.contentType,
        reason: isValid ? 'Content type matches station' : 'Content type mismatch',
      };
    }),

  // Get all content sources for a station
  getContentSources: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const sources = await db
        .select()
        .from(stationContentSources)
        .where(eq(stationContentSources.stationId, input.stationId));

      return sources.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }),

  // Sync station content (ensure what's displayed matches what's playing)
  syncContent: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const playback = await db
        .select()
        .from(stationPlaybackHistory)
        .where(eq(stationPlaybackHistory.stationId, input.stationId));

      if (!playback.length) {
        return { synced: false, reason: 'No playback history' };
      }

      const latest = playback[playback.length - 1];
      const station = await db
        .select()
        .from(customStations)
        .where(eq(customStations.id, input.stationId));

      if (!station.length) {
        return { synced: false, reason: 'Station not found' };
      }

      const stationContentTypes = station[0].contentTypes as string[];
      const isValid = stationContentTypes.includes(latest.contentType) || 
                      stationContentTypes.includes('mixed');

      return {
        synced: true,
        isValid,
        currentPlayback: {
          title: latest.title,
          contentType: latest.contentType,
        },
        stationTypes: stationContentTypes,
        mismatch: !isValid,
      };
    }),

  // Get user listening stats
  getListeningStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const preferences = await db
      .select()
      .from(userStationPreferences)
      .where(eq(userStationPreferences.userId, ctx.user!.id));

    const totalListenTime = preferences.reduce(
      (sum, p) => sum + (p.totalListenTime || 0),
      0
    );
    const favoriteCount = preferences.filter((p) => p.isFavorite).length;
    const stationsListened = preferences.length;

    return {
      totalListenTime,
      favoriteCount,
      stationsListened,
      averageListenTimePerStation:
        stationsListened > 0 ? Math.round(totalListenTime / stationsListened) : 0,
    };
  }),

  // Get most listened stations
  getMostListenedStations: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const stations = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, ctx.user!.id));

      return stations
        .sort((a, b) => (b.totalListenTime || 0) - (a.totalListenTime || 0))
        .slice(0, input.limit);
    }),

  // Get recently listened stations
  getRecentlyListenedStations: protectedProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const stations = await db
        .select()
        .from(userStationPreferences)
        .where(eq(userStationPreferences.userId, ctx.user!.id));

      return stations
        .sort((a, b) => {
          const aTime = new Date(a.lastListenedAt || 0).getTime();
          const bTime = new Date(b.lastListenedAt || 0).getTime();
          return bTime - aTime;
        })
        .slice(0, input.limit);
    }),

  // Update last listened time
  updateLastListened: protectedProcedure
    .input(z.object({ stationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const existing = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, ctx.user!.id),
            eq(userStationPreferences.stationId, input.stationId)
          )
        );

      if (existing.length > 0) {
        await db
          .update(userStationPreferences)
          .set({
            lastListenedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userStationPreferences.userId, ctx.user!.id),
              eq(userStationPreferences.stationId, input.stationId)
            )
          );
      } else {
        await db.insert(userStationPreferences).values({
          userId: ctx.user!.id,
          stationId: input.stationId,
          isFavorite: 0,
          lastListenedAt: new Date(),
          totalListenTime: 0,
        });
      }

      return { success: true };
    }),

  // Add listen time
  addListenTime: protectedProcedure
    .input(z.object({ stationId: z.number(), seconds: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      const existing = await db
        .select()
        .from(userStationPreferences)
        .where(
          and(
            eq(userStationPreferences.userId, ctx.user!.id),
            eq(userStationPreferences.stationId, input.stationId)
          )
        );

      if (existing.length > 0) {
        const newTotalTime = (existing[0].totalListenTime || 0) + input.seconds;
        await db
          .update(userStationPreferences)
          .set({
            totalListenTime: newTotalTime,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(userStationPreferences.userId, ctx.user!.id),
              eq(userStationPreferences.stationId, input.stationId)
            )
          );
      } else {
        await db.insert(userStationPreferences).values({
          userId: ctx.user!.id,
          stationId: input.stationId,
          isFavorite: 0,
          totalListenTime: input.seconds,
        });
      }

      return { success: true };
    }),

  // Export preferences
  exportPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');

    const preferences = await db
      .select()
      .from(userStationPreferences)
      .where(eq(userStationPreferences.userId, ctx.user!.id));

    return {
      userId: ctx.user!.id,
      exportedAt: new Date(),
      preferences,
    };
  }),

  // Import preferences
  importPreferences: protectedProcedure
    .input(z.object({
      preferences: z.array(z.object({
        stationId: z.number(),
        isFavorite: z.boolean(),
        lastListenedAt: z.date().optional(),
        totalListenTime: z.number(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database connection failed');

      try {
        for (const pref of input.preferences) {
          await db.insert(userStationPreferences).values({
            userId: ctx.user!.id,
            stationId: pref.stationId,
            isFavorite: pref.isFavorite ? 1 : 0,
            lastListenedAt: pref.lastListenedAt,
            totalListenTime: pref.totalListenTime,
          });
        }

        return { success: true, imported: input.preferences.length };
      } catch (error) {
        console.error('Error importing preferences:', error);
        return { success: false, error: 'Failed to import preferences' };
      }
    }),
});
