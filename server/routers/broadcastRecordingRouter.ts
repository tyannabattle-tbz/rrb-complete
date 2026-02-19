import { router, protectedProcedure, publicProcedure } from '../_core/trpc';
import { z } from 'zod';

// In-memory storage for recordings (in production, use database)
const recordings: Array<{
  id: string;
  title: string;
  date: Date;
  duration: number;
  views: number;
  thumbnail: string;
  channel: string;
  frequency: string;
  transcript?: string;
  url?: string;
  status: 'processing' | 'ready' | 'archived';
  broadcastId?: string;
}> = [
  {
    id: '1',
    title: 'Healing Frequencies Session - 432 Hz Deep Meditation',
    date: new Date('2026-02-19'),
    duration: 3600,
    views: 1247,
    thumbnail: '🎙️',
    channel: 'RRB Main',
    frequency: '432 Hz',
    transcript: 'Welcome to our healing frequencies session...',
    status: 'ready',
    url: 'https://example.com/vod/1.mp4',
  },
  {
    id: '2',
    title: "Sean's Music World - Live Performance",
    date: new Date('2026-02-18'),
    duration: 5400,
    views: 892,
    thumbnail: '🎵',
    channel: "Sean's Music World",
    frequency: '528 Hz',
    transcript: 'Tonight we bring you an incredible live performance...',
    status: 'ready',
    url: 'https://example.com/vod/2.mp4',
  },
  {
    id: '3',
    title: 'Poetry Station - Evening Readings',
    date: new Date('2026-02-17'),
    duration: 2700,
    views: 456,
    thumbnail: '📖',
    channel: 'Poetry Station',
    frequency: '639 Hz',
    transcript: 'Join us for an evening of beautiful poetry...',
    status: 'ready',
    url: 'https://example.com/vod/3.mp4',
  },
  {
    id: '4',
    title: 'Anna Promotion Co. - Artist Spotlight',
    date: new Date('2026-02-16'),
    duration: 4200,
    views: 678,
    thumbnail: '🎨',
    channel: 'Anna Promotion Co.',
    frequency: '741 Hz',
    transcript: 'This week we feature an amazing artist...',
    status: 'ready',
    url: 'https://example.com/vod/4.mp4',
  },
  {
    id: '5',
    title: 'Jaelon Enterprises - Business Hour',
    date: new Date('2026-02-15'),
    duration: 3300,
    views: 523,
    thumbnail: '💼',
    channel: 'Jaelon Enterprises',
    frequency: '852 Hz',
    transcript: 'Business insights and market analysis...',
    status: 'ready',
    url: 'https://example.com/vod/5.mp4',
  },
];

export const broadcastRecordingRouter = router({
  // Get all recordings
  getRecordings: publicProcedure.query(async () => {
    return {
      success: true,
      data: recordings,
    };
  }),

  // Get recording by ID
  getRecording: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const recording = recordings.find((r) => r.id === input.id);
      if (!recording) {
        return { success: false, error: 'Recording not found' };
      }
      return { success: true, data: recording };
    }),

  // Get recordings by channel
  getRecordingsByChannel: publicProcedure
    .input(z.object({ channel: z.string() }))
    .query(async ({ input }) => {
      const channelRecordings = recordings.filter((r) => r.channel === input.channel);
      return {
        success: true,
        data: channelRecordings,
      };
    }),

  // Get recordings by frequency
  getRecordingsByFrequency: publicProcedure
    .input(z.object({ frequency: z.string() }))
    .query(async ({ input }) => {
      const frequencyRecordings = recordings.filter((r) => r.frequency === input.frequency);
      return {
        success: true,
        data: frequencyRecordings,
      };
    }),

  // Create new recording
  createRecording: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        channel: z.string(),
        frequency: z.string(),
        duration: z.number(),
        broadcastId: z.string().optional(),
        transcript: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const newRecording = {
        id: Date.now().toString(),
        title: input.title,
        date: new Date(),
        duration: input.duration,
        views: 0,
        thumbnail: '🎙️',
        channel: input.channel,
        frequency: input.frequency,
        transcript: input.transcript,
        status: 'processing' as const,
        broadcastId: input.broadcastId,
        url: `https://example.com/vod/${Date.now()}.mp4`,
      };

      recordings.push(newRecording);

      return {
        success: true,
        data: newRecording,
      };
    }),

  // Update recording status
  updateRecordingStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.enum(['processing', 'ready', 'archived']) }))
    .mutation(async ({ input }) => {
      const recording = recordings.find((r) => r.id === input.id);
      if (!recording) {
        return { success: false, error: 'Recording not found' };
      }

      recording.status = input.status;
      return { success: true, data: recording };
    }),

  // Increment view count
  incrementViews: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const recording = recordings.find((r) => r.id === input.id);
      if (!recording) {
        return { success: false, error: 'Recording not found' };
      }

      recording.views += 1;
      return { success: true, data: { views: recording.views } };
    }),

  // Delete recording
  deleteRecording: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const index = recordings.findIndex((r) => r.id === input.id);
      if (index === -1) {
        return { success: false, error: 'Recording not found' };
      }

      recordings.splice(index, 1);
      return { success: true, message: 'Recording deleted' };
    }),

  // Search recordings
  searchRecordings: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const searchTerm = input.query.toLowerCase();
      const results = recordings.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm) ||
          r.channel.toLowerCase().includes(searchTerm) ||
          r.frequency.toLowerCase().includes(searchTerm)
      );

      return {
        success: true,
        data: results,
      };
    }),

  // Get popular recordings
  getPopularRecordings: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const popular = [...recordings]
        .sort((a, b) => b.views - a.views)
        .slice(0, input.limit);

      return {
        success: true,
        data: popular,
      };
    }),

  // Get recent recordings
  getRecentRecordings: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      const recent = [...recordings]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, input.limit);

      return {
        success: true,
        data: recent,
      };
    }),

  // Get recording statistics
  getStatistics: publicProcedure.query(async () => {
    const totalRecordings = recordings.length;
    const totalViews = recordings.reduce((sum, r) => sum + r.views, 0);
    const totalDuration = recordings.reduce((sum, r) => sum + r.duration, 0);
    const readyRecordings = recordings.filter((r) => r.status === 'ready').length;
    const processingRecordings = recordings.filter((r) => r.status === 'processing').length;

    return {
      success: true,
      data: {
        totalRecordings,
        totalViews,
        totalDuration,
        readyRecordings,
        processingRecordings,
        averageViews: totalRecordings > 0 ? Math.round(totalViews / totalRecordings) : 0,
      },
    };
  }),

  // Get recordings by date range
  getRecordingsByDateRange: publicProcedure
    .input(z.object({ startDate: z.date(), endDate: z.date() }))
    .query(async ({ input }) => {
      const results = recordings.filter(
        (r) => r.date >= input.startDate && r.date <= input.endDate
      );

      return {
        success: true,
        data: results,
      };
    }),

  // Archive old recordings
  archiveOldRecordings: protectedProcedure
    .input(z.object({ daysOld: z.number().int().min(1) }))
    .mutation(async ({ input }) => {
      const cutoffDate = new Date(Date.now() - input.daysOld * 24 * 60 * 60 * 1000);
      let archivedCount = 0;

      recordings.forEach((r) => {
        if (r.date < cutoffDate && r.status === 'ready') {
          r.status = 'archived';
          archivedCount += 1;
        }
      });

      return {
        success: true,
        data: { archivedCount },
      };
    }),
});
