import { router, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';

interface BroadcastSession {
  id: string;
  title: string;
  description: string;
  broadcasterName: string;
  startTime: Date;
  endTime?: Date;
  viewers: number;
  duration: number;
  quality: string;
  bitrate: string;
  status: 'live' | 'ended' | 'scheduled';
  streamUrl: string;
  recordingUrl?: string;
  location?: { lat: number; lng: number; name: string };
}

interface ViewerSession {
  id: string;
  broadcastId: string;
  viewerName: string;
  joinTime: Date;
  leaveTime?: Date;
  watchDuration: number;
  location?: string;
}

// In-memory storage for broadcasts and viewers
const ACTIVE_BROADCASTS = new Map<string, BroadcastSession>();
const BROADCAST_HISTORY: BroadcastSession[] = [];
const VIEWER_SESSIONS = new Map<string, ViewerSession[]>();

export const hybridcastRouter = router({
  // Start a new broadcast
  startBroadcast: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        quality: z.enum(['480p', '720p', '1080p', '4K']).default('1080p'),
        bitrate: z.string().default('5 Mbps'),
        location: z
          .object({
            lat: z.number(),
            lng: z.number(),
            name: z.string(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const broadcastId = `broadcast-${Date.now()}`;
      const broadcast: BroadcastSession = {
        id: broadcastId,
        title: input.title,
        description: input.description || '',
        broadcasterName: ctx.user?.name || 'Anonymous',
        startTime: new Date(),
        viewers: 0,
        duration: 0,
        quality: input.quality,
        bitrate: input.bitrate,
        status: 'live',
        streamUrl: `https://stream.qumus.app/${broadcastId}`,
        location: input.location,
      };

      ACTIVE_BROADCASTS.set(broadcastId, broadcast);
      VIEWER_SESSIONS.set(broadcastId, []);

      return {
        success: true,
        broadcastId,
        streamUrl: broadcast.streamUrl,
        message: 'Broadcast started successfully',
      };
    }),

  // Stop a broadcast
  stopBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .mutation(async ({ input }) => {
      const broadcast = ACTIVE_BROADCASTS.get(input.broadcastId);
      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }

      broadcast.status = 'ended';
      broadcast.endTime = new Date();
      broadcast.duration = Math.floor(
        (broadcast.endTime.getTime() - broadcast.startTime.getTime()) / 1000
      );

      // Move to history
      BROADCAST_HISTORY.push(broadcast);
      ACTIVE_BROADCASTS.delete(input.broadcastId);

      // Generate recording URL
      const recordingUrl = `https://vod.qumus.app/${input.broadcastId}/recording.mp4`;

      return {
        success: true,
        recordingUrl,
        duration: broadcast.duration,
        finalViewerCount: broadcast.viewers,
        message: 'Broadcast ended successfully',
      };
    }),

  // Get active broadcasts
  getActiveBroadcasts: protectedProcedure.query(async () => {
    const broadcasts = Array.from(ACTIVE_BROADCASTS.values());
    return {
      success: true,
      data: broadcasts,
      count: broadcasts.length,
    };
  }),

  // Get broadcast details
  getBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .query(async ({ input }) => {
      const broadcast =
        ACTIVE_BROADCASTS.get(input.broadcastId) ||
        BROADCAST_HISTORY.find((b) => b.id === input.broadcastId);

      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }

      const viewers = VIEWER_SESSIONS.get(input.broadcastId) || [];

      return {
        success: true,
        data: {
          ...broadcast,
          totalViewers: viewers.length,
          averageWatchTime: viewers.length > 0
            ? Math.round(
                viewers.reduce((sum, v) => sum + v.watchDuration, 0) /
                  viewers.length
              )
            : 0,
        },
      };
    }),

  // Join a broadcast (viewer)
  joinBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const broadcast = ACTIVE_BROADCASTS.get(input.broadcastId);
      if (!broadcast) {
        return { success: false, error: 'Broadcast not found or ended' };
      }

      const viewerId = `viewer-${Date.now()}`;
      const viewerSession: ViewerSession = {
        id: viewerId,
        broadcastId: input.broadcastId,
        viewerName: ctx.user?.name || 'Anonymous Viewer',
        joinTime: new Date(),
        watchDuration: 0,
      };

      const viewers = VIEWER_SESSIONS.get(input.broadcastId) || [];
      viewers.push(viewerSession);
      VIEWER_SESSIONS.set(input.broadcastId, viewers);

      // Increment viewer count
      broadcast.viewers = viewers.length;

      return {
        success: true,
        viewerId,
        broadcast: {
          title: broadcast.title,
          broadcaster: broadcast.broadcasterName,
          viewers: broadcast.viewers,
          quality: broadcast.quality,
          streamUrl: broadcast.streamUrl,
        },
      };
    }),

  // Leave a broadcast
  leaveBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.string(), viewerId: z.string() }))
    .mutation(async ({ input }) => {
      const viewers = VIEWER_SESSIONS.get(input.broadcastId) || [];
      const viewerIndex = viewers.findIndex((v) => v.id === input.viewerId);

      if (viewerIndex === -1) {
        return { success: false, error: 'Viewer session not found' };
      }

      const viewer = viewers[viewerIndex];
      viewer.leaveTime = new Date();
      viewer.watchDuration = Math.floor(
        (viewer.leaveTime.getTime() - viewer.joinTime.getTime()) / 1000
      );

      const broadcast = ACTIVE_BROADCASTS.get(input.broadcastId);
      if (broadcast) {
        broadcast.viewers = Math.max(0, broadcast.viewers - 1);
      }

      return {
        success: true,
        watchDuration: viewer.watchDuration,
      };
    }),

  // Get broadcast viewers
  getBroadcastViewers: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .query(async ({ input }) => {
      const viewers = VIEWER_SESSIONS.get(input.broadcastId) || [];
      return {
        success: true,
        data: viewers,
        totalViewers: viewers.length,
        activeViewers: viewers.filter((v) => !v.leaveTime).length,
      };
    }),

  // Update broadcast settings
  updateBroadcastSettings: protectedProcedure
    .input(
      z.object({
        broadcastId: z.string(),
        quality: z.enum(['480p', '720p', '1080p', '4K']).optional(),
        bitrate: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const broadcast = ACTIVE_BROADCASTS.get(input.broadcastId);
      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }

      if (input.quality) broadcast.quality = input.quality;
      if (input.bitrate) broadcast.bitrate = input.bitrate;
      if (input.title) broadcast.title = input.title;
      if (input.description) broadcast.description = input.description;

      return { success: true, message: 'Broadcast settings updated' };
    }),

  // Get broadcast analytics
  getBroadcastAnalytics: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .query(async ({ input }) => {
      const broadcast =
        ACTIVE_BROADCASTS.get(input.broadcastId) ||
        BROADCAST_HISTORY.find((b) => b.id === input.broadcastId);

      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }

      const viewers = VIEWER_SESSIONS.get(input.broadcastId) || [];
      const activeViewers = viewers.filter((v) => !v.leaveTime).length;
      const totalWatchTime = viewers.reduce((sum, v) => sum + v.watchDuration, 0);
      const averageWatchTime = viewers.length > 0 ? totalWatchTime / viewers.length : 0;
      const peakViewers = broadcast.viewers;

      return {
        success: true,
        data: {
          broadcastId: broadcast.id,
          title: broadcast.title,
          broadcaster: broadcast.broadcasterName,
          startTime: broadcast.startTime,
          endTime: broadcast.endTime,
          duration: broadcast.duration,
          status: broadcast.status,
          totalViewers: viewers.length,
          activeViewers,
          peakViewers,
          totalWatchTime,
          averageWatchTime: Math.round(averageWatchTime),
          quality: broadcast.quality,
          bitrate: broadcast.bitrate,
          location: broadcast.location,
        },
      };
    }),

  // Get broadcast history
  getBroadcastHistory: protectedProcedure.query(async () => {
    return {
      success: true,
      data: BROADCAST_HISTORY.sort(
        (a, b) => b.startTime.getTime() - a.startTime.getTime()
      ),
      count: BROADCAST_HISTORY.length,
    };
  }),

  // Record broadcast
  recordBroadcast: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .mutation(async ({ input }) => {
      const broadcast = ACTIVE_BROADCASTS.get(input.broadcastId);
      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }

      const recordingId = `recording-${Date.now()}`;
      const recordingUrl = `https://vod.qumus.app/${recordingId}/broadcast.mp4`;

      return {
        success: true,
        recordingId,
        recordingUrl,
        message: 'Broadcast recording started',
      };
    }),

  // Get stream metrics
  getStreamMetrics: protectedProcedure
    .input(z.object({ broadcastId: z.string() }))
    .query(async ({ input }) => {
      const broadcast = ACTIVE_BROADCASTS.get(input.broadcastId);
      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }

      return {
        success: true,
        data: {
          broadcastId: broadcast.id,
          viewers: broadcast.viewers,
          duration: broadcast.duration,
          quality: broadcast.quality,
          bitrate: broadcast.bitrate,
          streamHealth: 'excellent',
          latency: '2.5s',
          bandwidth: '8.5 Mbps',
          frameRate: '60 fps',
          resolution: broadcast.quality,
        },
      };
    }),
});
