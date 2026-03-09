import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  radioStations,
  radioChannels,
  emergencyAlerts,
  alertBroadcastLog,
  rockinBoogieContent,
} from "../../drizzle/schema";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

export const seedDataRouter = router({
  generateDemoData: protectedProcedure
    .input(
      z.object({
        includeAlerts: z.boolean().optional().default(true),
        includeContent: z.boolean().optional().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await requireDb();

      // Create main radio station
      const stationResult = await db.insert(radioStations).values({
        userId: ctx.user.id,
        name: "Rockin' Rockin' Boogie",
        operatorName: "Canryn Production",
        description: "Premier radio station powered by Canryn Production infrastructure",
        status: "active",
        totalListeners: 85920,
        metadata: {
          founded: "2024",
          region: "Global",
          format: "Music & Talk",
        },
      });

      const stationId = (stationResult as any).insertId || 1;

      // Create radio channels
      const channels = [
        {
          stationId,
          name: "Morning Drive Show",
          frequency: "101.5 FM",
          genre: "Pop/Rock",
          status: "active" as const,
          currentListeners: 0,
          totalListeners: 45000,
          streamUrl: "https://stream.rockinboogie.com/morning-drive",
        },
        {
          stationId,
          name: "Tech Talk Daily",
          frequency: "102.3 FM",
          genre: "News/Talk",
          status: "active" as const,
          currentListeners: 0,
          totalListeners: 28000,
          streamUrl: "https://stream.rockinboogie.com/tech-talk",
        },
        {
          stationId,
          name: "Evening Jazz Sessions",
          frequency: "103.1 FM",
          genre: "Jazz",
          status: "active" as const,
          currentListeners: 0,
          totalListeners: 12920,
          streamUrl: "https://stream.rockinboogie.com/jazz",
        },
      ];

      const channelIds: number[] = [];
      for (const channel of channels) {
        const result = await db.insert(radioChannels).values(channel);
        channelIds.push((result as any).insertId || channelIds.length + 1);
      }

      let alertIds: number[] = [];

      if (input.includeAlerts) {
        // Create sample emergency alerts
        const alerts = [
          {
            userId: ctx.user.id,
            title: "Severe Weather Alert",
            message: "Severe thunderstorm warning in effect for the next 2 hours",
            severity: "high" as const,
            broadcastChannelIds: JSON.stringify(channelIds),
            status: "completed" as const,
            recipients: 45000,
            deliveryRate: "99.7",
            scheduledFor: new Date(Date.now() - 3600000),
          },
          {
            userId: ctx.user.id,
            title: "Traffic Advisory",
            message: "Major accident on Highway 101. Use alternate routes.",
            severity: "medium" as const,
            broadcastChannelIds: JSON.stringify([channelIds[0]]),
            status: "completed" as const,
            recipients: 0,
            deliveryRate: "98.5",
            scheduledFor: new Date(Date.now() - 1800000),
          },
          {
            userId: ctx.user.id,
            title: "Public Safety Notice",
            message: "Missing person alert: John Smith, age 67. Last seen downtown.",
            severity: "high" as const,
            broadcastChannelIds: JSON.stringify(channelIds),
            status: "completed" as const,
            recipients: 45000,
            deliveryRate: "99.2",
            scheduledFor: new Date(Date.now() - 900000),
          },
        ];

        for (const alert of alerts) {
          const result = await db.insert(emergencyAlerts).values(alert);
          alertIds.push((result as any).insertId || alertIds.length + 1);
        }

        // Create broadcast logs
        for (let i = 0; i < alertIds.length; i++) {
          const alertId = alertIds[i];
          const broadcastChannels = i === 1 ? [channelIds[0]] : channelIds;

          for (const channelId of broadcastChannels) {
            await db.insert(alertBroadcastLog).values({
              alertId,
              channelId,
              status: "delivered" as const,
              listenersReached: Math.floor(Math.random() * 45000) + 5000,
              interruptedRegularContent: true,
              broadcastStartedAt: new Date(Date.now() - 3600000 - i * 1800000),
              broadcastEndedAt: new Date(Date.now() - 3540000 - i * 1800000),
            });
          }
        }
      }

      if (input.includeContent) {
        // Create sample content
        const content = [
          {
            userId: ctx.user.id,
            title: "The Great Gatsby",
            type: "audiobook" as const,
            duration: "9h 32m",
            listeners: 234,
            rating: "4.8",
            status: "active" as const,
            description: "Classic American novel narrated by Jake Gyllenhaal",
            metadata: {
              author: "F. Scott Fitzgerald",
              narrator: "Jake Gyllenhaal",
              year: 2013,
            },
          },
          {
            userId: ctx.user.id,
            title: "Morning Drive Show",
            type: "radio" as const,
            duration: "3h",
            listeners: 0,
            rating: "4.6",
            status: "active" as const,
            schedule: "Daily 6AM-9AM",
            description: "Music and talk radio show",
            metadata: {
              hosts: ["Alex Chen", "Sarah Martinez"],
              format: "Music & Talk",
            },
          },
          {
            userId: ctx.user.id,
            title: "Tech Talk Daily",
            type: "podcast" as const,
            duration: "1h",
            listeners: 0,
            rating: "4.7",
            status: "active" as const,
            schedule: "Daily 2PM",
            description: "Daily tech news and interviews",
            metadata: {
              host: "Dr. Michael Wong",
              topics: ["AI", "Blockchain", "Cloud Computing"],
            },
          },
        ];

        for (const item of content) {
          await db.insert(rockinBoogieContent).values(item);
        }
      }

      return {
        success: true,
        stationId,
        channelsCreated: channelIds.length,
        alertsCreated: alertIds.length,
        contentCreated: input.includeContent ? 3 : 0,
        message: "Demo data generated successfully",
      };
    }),

  clearDemoData: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await requireDb();

    // Delete all user's data
    await db.delete(alertBroadcastLog);
    await db.delete(emergencyAlerts);
    await db.delete(rockinBoogieContent);
    await db.delete(radioChannels);
    await db.delete(radioStations);

    return {
      success: true,
      message: "All demo data cleared",
    };
  }),

  getDataStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await requireDb();

    const stations = await db.select().from(radioStations);
    const channels = await db.select().from(radioChannels);
    const alerts = await db.select().from(emergencyAlerts);
    const broadcasts = await db.select().from(alertBroadcastLog);
    const content = await db.select().from(rockinBoogieContent);

    return {
      stations: stations.length,
      channels: channels.length,
      alerts: alerts.length,
      broadcasts: broadcasts.length,
      content: content.length,
      hasData: stations.length > 0,
    };
  }),
});
