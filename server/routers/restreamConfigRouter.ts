import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { router } from "../_core/trpc";
import { getDb } from "../db";
import { systemConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { createRestreamRoom, getRestreamRooms } from "../services/restreamService";

export const restreamConfigRouter = router({
  // Get the Restream studio URL (public — any component can read it)
  getRestreamUrl: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { url: "", isConfigured: false };
    const rows = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.configKey, "restream_studio_url"));
    return {
      url: rows[0]?.configValue || "",
      isConfigured: !!(rows[0]?.configValue),
    };
  }),

  // Get any system config by key (public)
  getConfig: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { key: input.key, value: "", description: "" };
      const rows = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, input.key));
      return {
        key: input.key,
        value: rows[0]?.configValue || "",
        description: rows[0]?.description || "",
      };
    }),

  // Get all system configs (admin only)
  getAllConfigs: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(systemConfig);
    return rows.map((r) => ({
      id: r.id,
      key: r.configKey,
      value: r.configValue,
      description: r.description,
      updatedAt: r.updatedAt,
      updatedBy: r.updatedBy,
    }));
  }),

  // Set a system config value (admin only)
  setConfig: protectedProcedure
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const existing = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, input.key));

      if (existing.length > 0) {
        await db
          .update(systemConfig)
          .set({
            configValue: input.value,
            updatedAt: Date.now(),
            updatedBy: ctx.user?.name || ctx.user?.openId || "admin",
          })
          .where(eq(systemConfig.configKey, input.key));
      } else {
        await db.insert(systemConfig).values({
          configKey: input.key,
          configValue: input.value,
          updatedAt: Date.now(),
          updatedBy: ctx.user?.name || ctx.user?.openId || "admin",
        });
      }

      return { success: true, key: input.key };
    }),

  // Create a new Restream room (admin only)
  createRoom: protectedProcedure
    .input(z.object({
      title: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const room = await createRestreamRoom({
        title: input.title,
        description: input.description,
        createdBy: ctx.user?.name || ctx.user?.openId || 'admin',
      });
      return room;
    }),

  // Get all Restream rooms
  getRooms: protectedProcedure.query(async () => {
    return getRestreamRooms();
  }),

  // Set Restream URL specifically (admin only)
  setRestreamUrl: protectedProcedure
    .input(z.object({ url: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const existing = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, "restream_studio_url"));

      if (existing.length > 0) {
        await db
          .update(systemConfig)
          .set({
            configValue: input.url,
            updatedAt: Date.now(),
            updatedBy: ctx.user?.name || ctx.user?.openId || "admin",
          })
          .where(eq(systemConfig.configKey, "restream_studio_url"));
      } else {
        await db.insert(systemConfig).values({
          configKey: "restream_studio_url",
          configValue: input.url,
          description:
            "Restream studio URL — paste your Restream room link here and all live/studio buttons will use it",
          updatedAt: Date.now(),
          updatedBy: ctx.user?.name || ctx.user?.openId || "admin",
        });
      }

      return { success: true, url: input.url };
    }),
});
