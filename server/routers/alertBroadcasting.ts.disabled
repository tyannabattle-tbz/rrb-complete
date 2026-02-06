import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { emergencyAlerts, alertBroadcastLog, radioChannels } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export const alertBroadcastingRouter = router({
  // Broadcast HybridCast alert through radio channels
  broadcastAlertThroughRadio: protectedProcedure
    .input(
      z.object({
        alertId: z.number(),
        channelIds: z.array(z.number()),
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();

      // Update alert with broadcast channel IDs
      await db
        .update(emergencyAlerts)
        .set({
          broadcastChannelIds: JSON.stringify(input.channelIds),
          status: "active",
        })
        .where(eq(emergencyAlerts.id, input.alertId));

      // Create broadcast log entries for each channel
      const broadcasts = input.channelIds.map((channelId) => ({
        alertId: input.alertId,
        channelId,
        status: "broadcasting" as const,
        listenersReached: 0,
        interruptedRegularContent: true,
        broadcastStartedAt: new Date(),
      }));

      for (const broadcast of broadcasts) {
        await db.insert(alertBroadcastLog).values(broadcast);
      }

      return {
        success: true,
        broadcastsCreated: broadcasts.length,
        channelIds: input.channelIds,
      };
    }),

  // Get alert broadcast status
  getAlertBroadcastStatus: protectedProcedure
    .input(z.object({ alertId: z.number() }))
    .query(async ({ input }) => {
      const db = await requireDb();

      const alert = await db
        .select()
        .from(emergencyAlerts)
        .where(eq(emergencyAlerts.id, input.alertId))
        .then((rows: any[]) => rows[0]);

      if (!alert) return null;

      const broadcasts = await db
        .select()
        .from(alertBroadcastLog)
        .where(eq(alertBroadcastLog.alertId, input.alertId));

      return {
        alert,
        broadcasts,
        totalChannels: broadcasts.length,
        deliveredChannels: broadcasts.filter((b: any) => b.status === "delivered").length,
        failedChannels: broadcasts.filter((b: any) => b.status === "failed").length,
      };
    }),

  // Update broadcast status for a channel
  updateBroadcastStatus: protectedProcedure
    .input(
      z.object({
        broadcastLogId: z.number(),
        status: z.enum(["pending", "broadcasting", "delivered", "failed"]),
        listenersReached: z.number().optional(),
        error: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await requireDb();

      const updateData: any = {
        status: input.status,
      };

      if (input.listenersReached !== undefined) {
        updateData.listenersReached = input.listenersReached;
      }

      if (input.error) {
        updateData.error = input.error;
      }

      if (input.status === "delivered" || input.status === "failed") {
        updateData.broadcastEndedAt = new Date();
      }

      return await db
        .update(alertBroadcastLog)
        .set(updateData)
        .where(eq(alertBroadcastLog.id, input.broadcastLogId));
    }),

  // Get radio channels available for alert broadcast
  getAvailableChannelsForBroadcast: protectedProcedure
    .input(z.object({ stationId: z.number().optional() }))
    .query(async ({ input }) => {
      const db = await requireDb();

      if (input.stationId) {
        return await db
          .select()
          .from(radioChannels)
          .where(eq(radioChannels.stationId, input.stationId));
      }

      return await db.select().from(radioChannels);
    }),

  // Get broadcast metrics for analytics
  getBroadcastMetrics: protectedProcedure
    .input(
      z.object({
        alertId: z.number().optional(),
        period: z.enum(["day", "week", "month"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await requireDb();

      let broadcasts: any[] = [];

      if (input.alertId) {
        broadcasts = await db
          .select()
          .from(alertBroadcastLog)
          .where(eq(alertBroadcastLog.alertId, input.alertId));
      } else {
        broadcasts = await db.select().from(alertBroadcastLog);
      }

      return {
        totalBroadcasts: broadcasts.length,
        successfulBroadcasts: broadcasts.filter((b: any) => b.status === "delivered").length,
        failedBroadcasts: broadcasts.filter((b: any) => b.status === "failed").length,
        totalListenersReached: broadcasts.reduce((sum: number, b: any) => sum + (b.listenersReached || 0), 0),
        avgListenersPerBroadcast:
          broadcasts.length > 0
            ? Math.round(
                broadcasts.reduce((sum: number, b: any) => sum + (b.listenersReached || 0), 0) /
                  broadcasts.length
              )
            : 0,
      };
    }),
});
