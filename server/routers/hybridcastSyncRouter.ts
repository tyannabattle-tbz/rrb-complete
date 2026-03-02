import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

// Schema for broadcast data
const broadcastSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  channels: z.array(z.string()),
  timestamp: z.number(),
  deliveryStatus: z.enum(['pending', 'sent', 'delivered', 'failed']),
  viewerCount: z.number(),
  engagementRate: z.number(),
});

type Broadcast = z.infer<typeof broadcastSchema>;

// In-memory storage (replace with database in production)
const broadcasts: Broadcast[] = [];
const syncLog: Array<{
  id: string;
  timestamp: number;
  action: string;
  status: string;
}> = [];

export const hybridcastSyncRouter = router({
  // Get current HybridCast status
  getStatus: publicProcedure.query(async () => {
    return {
      isOnline: true,
      cachedItems: broadcasts.length,
      pendingSync: broadcasts.filter((b) => b.deliveryStatus === 'pending').length,
      latency: Math.floor(Math.random() * 50) + 10,
      uptime: 99.9,
      activeNodes: Math.floor(Math.random() * 20) + 8,
      lastSync: new Date().toISOString(),
      encryption: 'AES-256',
      protocol: 'HYBRID-BROADCAST-v1',
    };
  }),

  // Sync broadcast from HybridCast
  syncBroadcast: protectedProcedure
    .input(broadcastSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        // Add broadcast to local storage
        broadcasts.push(input);

        // Log sync action
        syncLog.push({
          id: input.id,
          timestamp: Date.now(),
          action: 'BROADCAST_SYNCED',
          status: 'success',
        });

        console.log(`[HybridCast Sync] Broadcast synced: ${input.id}`);

        return {
          success: true,
          broadcastId: input.id,
          syncedAt: new Date().toISOString(),
          totalBroadcasts: broadcasts.length,
        };
      } catch (error) {
        syncLog.push({
          id: input.id,
          timestamp: Date.now(),
          action: 'BROADCAST_SYNC_FAILED',
          status: 'error',
        });

        throw new Error(`Failed to sync broadcast: ${error}`);
      }
    }),

  // Get all synced broadcasts
  getBroadcasts: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      })
    )
    .query(async ({ input }) => {
      let filtered = broadcasts;

      if (input.severity) {
        filtered = filtered.filter((b) => b.severity === input.severity);
      }

      const total = filtered.length;
      const items = filtered
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(input.offset, input.offset + input.limit);

      return {
        items,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get broadcast by ID
  getBroadcast: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const broadcast = broadcasts.find((b) => b.id === input.id);

      if (!broadcast) {
        throw new Error(`Broadcast not found: ${input.id}`);
      }

      return broadcast;
    }),

  // Update broadcast delivery status
  updateDeliveryStatus: protectedProcedure
    .input(
      z.object({
        broadcastId: z.string(),
        status: z.enum(['pending', 'sent', 'delivered', 'failed']),
        viewerCount: z.number().optional(),
        engagementRate: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const broadcast = broadcasts.find((b) => b.id === input.broadcastId);

      if (!broadcast) {
        throw new Error(`Broadcast not found: ${input.broadcastId}`);
      }

      broadcast.deliveryStatus = input.status;
      if (input.viewerCount !== undefined) {
        broadcast.viewerCount = input.viewerCount;
      }
      if (input.engagementRate !== undefined) {
        broadcast.engagementRate = input.engagementRate;
      }

      syncLog.push({
        id: input.broadcastId,
        timestamp: Date.now(),
        action: 'STATUS_UPDATED',
        status: 'success',
      });

      return broadcast;
    }),

  // Get sync history
  getSyncHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const total = syncLog.length;
      const items = syncLog
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(input.offset, input.offset + input.limit);

      return {
        items,
        total,
        hasMore: input.offset + input.limit < total,
      };
    }),

  // Get broadcast analytics
  getAnalytics: protectedProcedure.query(async () => {
    const totalBroadcasts = broadcasts.length;
    const deliveredCount = broadcasts.filter(
      (b) => b.deliveryStatus === 'delivered'
    ).length;
    const failedCount = broadcasts.filter(
      (b) => b.deliveryStatus === 'failed'
    ).length;
    const avgViewers =
      broadcasts.length > 0
        ? broadcasts.reduce((sum, b) => sum + b.viewerCount, 0) /
          broadcasts.length
        : 0;
    const avgEngagement =
      broadcasts.length > 0
        ? broadcasts.reduce((sum, b) => sum + b.engagementRate, 0) /
          broadcasts.length
        : 0;

    const bySeverity = {
      low: broadcasts.filter((b) => b.severity === 'low').length,
      medium: broadcasts.filter((b) => b.severity === 'medium').length,
      high: broadcasts.filter((b) => b.severity === 'high').length,
      critical: broadcasts.filter((b) => b.severity === 'critical').length,
    };

    return {
      totalBroadcasts,
      deliveredCount,
      failedCount,
      deliveryRate: totalBroadcasts > 0 ? (deliveredCount / totalBroadcasts) * 100 : 0,
      avgViewers: Math.round(avgViewers),
      avgEngagement: Math.round(avgEngagement * 100) / 100,
      bySeverity,
      syncLogEntries: syncLog.length,
    };
  }),

  // Clear old broadcasts (maintenance)
  clearOldBroadcasts: protectedProcedure
    .input(z.object({ olderThanHours: z.number().default(24) }))
    .mutation(async ({ input, ctx }) => {
      const cutoffTime = Date.now() - input.olderThanHours * 60 * 60 * 1000;
      const beforeCount = broadcasts.length;

      const filtered = broadcasts.filter((b) => b.timestamp > cutoffTime);
      broadcasts.length = 0;
      broadcasts.push(...filtered);

      const removed = beforeCount - broadcasts.length;

      syncLog.push({
        id: 'cleanup',
        timestamp: Date.now(),
        action: 'CLEANUP_EXECUTED',
        status: `removed ${removed} old broadcasts`,
      });

      return {
        removed,
        remaining: broadcasts.length,
      };
    }),
});
