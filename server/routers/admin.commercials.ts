/**
 * Radio Commercial Management Router
 * Manage and schedule radio commercials for broadcasts
 */

import { router, adminProcedure } from '../_core/trpc';
import { z } from 'zod';

/**
 * Commercial schema
 */
export const commercialSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  duration: z.enum(['15s', '30s', '60s']),
  audioUrl: z.string(),
  scriptText: z.string(),
  voiceType: z.enum(['male', 'female', 'neutral']),
  targetAudience: z.string().optional(),
  callToAction: z.string(),
  status: z.enum(['draft', 'approved', 'active', 'archived']).default('draft'),
  createdAt: z.date().optional(),
});

/**
 * Commercial schedule schema
 */
export const commercialScheduleSchema = z.object({
  id: z.string().optional(),
  commercialId: z.string(),
  channelId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  frequency: z.enum(['hourly', 'every-2h', 'every-4h', 'daily', 'custom']),
  timeslots: z.array(z.object({
    startTime: z.string(), // HH:MM format
    endTime: z.string(),
  })).optional(),
  maxPlays: z.number().optional(),
  priority: z.number().default(1),
  status: z.enum(['scheduled', 'active', 'paused', 'completed']).default('scheduled'),
});

export const adminCommercialsRouter = router({
  /**
   * Create commercial
   */
  createCommercial: adminProcedure
    .input(commercialSchema)
    .mutation(async ({ input, ctx }) => {
      const commercialId = `commercial-${Date.now()}`;

      return {
        id: commercialId,
        ...input,
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get all commercials
   */
  getCommercials: adminProcedure
    .input(z.object({
      status: z.enum(['draft', 'approved', 'active', 'archived']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return [
        {
          id: 'commercial-1',
          title: 'UN WCS 30-Second Spot',
          duration: '30s',
          voiceType: 'female',
          status: 'approved',
          plays: 1250,
          createdAt: new Date(),
        },
        {
          id: 'commercial-2',
          title: 'UN WCS 60-Second Extended',
          duration: '60s',
          voiceType: 'male',
          status: 'active',
          plays: 890,
          createdAt: new Date(),
        },
        {
          id: 'commercial-3',
          title: 'UN WCS 15-Second Spot',
          duration: '15s',
          voiceType: 'female',
          status: 'approved',
          plays: 2100,
          createdAt: new Date(),
        },
      ];
    }),

  /**
   * Get commercial details
   */
  getCommercialDetails: adminProcedure
    .input(z.object({ commercialId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return {
        id: input.commercialId,
        title: 'UN WCS 30-Second Spot',
        description: 'Professional commercial for UN World Conservation Summit',
        duration: '30s',
        audioUrl: '/audio/unwcs-commercial-30s.wav',
        scriptText: 'Join us for a groundbreaking conversation on water, climate, and sustainability...',
        voiceType: 'female',
        targetAudience: 'Environmental professionals, scientists, policymakers',
        callToAction: 'Register now at our website',
        status: 'approved',
        plays: 1250,
        impressions: 45000,
        createdAt: new Date(),
      };
    }),

  /**
   * Update commercial
   */
  updateCommercial: adminProcedure
    .input(z.object({
      commercialId: z.string(),
      data: commercialSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        id: input.commercialId,
        ...input.data,
        updatedAt: new Date(),
      };
    }),

  /**
   * Delete commercial
   */
  deleteCommercial: adminProcedure
    .input(z.object({ commercialId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        commercialId: input.commercialId,
        deleted: true,
        deletedAt: new Date(),
      };
    }),

  /**
   * Schedule commercial
   */
  scheduleCommercial: adminProcedure
    .input(commercialScheduleSchema)
    .mutation(async ({ input, ctx }) => {
      const scheduleId = `schedule-${Date.now()}`;

      return {
        id: scheduleId,
        ...input,
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get commercial schedules
   */
  getCommercialSchedules: adminProcedure
    .input(z.object({
      channelId: z.string().optional(),
      status: z.enum(['scheduled', 'active', 'paused', 'completed']).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return [
        {
          id: 'schedule-1',
          commercialId: 'commercial-1',
          commercialTitle: 'UN WCS 30-Second Spot',
          channelId: 'channel-1',
          channelName: 'RRB Radio',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          frequency: 'every-2h',
          status: 'active',
          playsToday: 12,
          totalPlays: 1250,
        },
      ];
    }),

  /**
   * Get schedule details
   */
  getScheduleDetails: adminProcedure
    .input(z.object({ scheduleId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock data
      return {
        id: input.scheduleId,
        commercialId: 'commercial-1',
        commercialTitle: 'UN WCS 30-Second Spot',
        channelId: 'channel-1',
        channelName: 'RRB Radio',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        frequency: 'every-2h',
        timeslots: [
          { startTime: '06:00', endTime: '09:00' },
          { startTime: '12:00', endTime: '15:00' },
          { startTime: '18:00', endTime: '21:00' },
        ],
        maxPlays: 5000,
        priority: 1,
        status: 'active',
        statistics: {
          totalPlays: 1250,
          playsToday: 12,
          averageListeners: 450,
          engagementRate: 8.5,
        },
      };
    }),

  /**
   * Update schedule
   */
  updateSchedule: adminProcedure
    .input(z.object({
      scheduleId: z.string(),
      data: commercialScheduleSchema.partial(),
    }))
    .mutation(async ({ input, ctx }) => {
      return {
        id: input.scheduleId,
        ...input.data,
        updatedAt: new Date(),
      };
    }),

  /**
   * Pause schedule
   */
  pauseSchedule: adminProcedure
    .input(z.object({ scheduleId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        scheduleId: input.scheduleId,
        status: 'paused',
        pausedAt: new Date(),
      };
    }),

  /**
   * Resume schedule
   */
  resumeSchedule: adminProcedure
    .input(z.object({ scheduleId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return {
        scheduleId: input.scheduleId,
        status: 'active',
        resumedAt: new Date(),
      };
    }),

  /**
   * Get commercial statistics
   */
  getCommercialStats: adminProcedure
    .input(z.object({ commercialId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Mock statistics
      return {
        commercialId: input.commercialId,
        title: 'UN WCS 30-Second Spot',
        totalPlays: 1250,
        playsToday: 12,
        averageListeners: 450,
        peakHour: '12:00-13:00',
        engagementRate: 8.5,
        clickThroughRate: 3.2,
        conversionRate: 1.8,
        topChannels: [
          { channelId: 'channel-1', channelName: 'RRB Radio', plays: 650 },
          { channelId: 'channel-2', channelName: 'Community Radio', plays: 400 },
          { channelId: 'channel-3', channelName: 'Streaming Network', plays: 200 },
        ],
      };
    }),

  /**
   * Get broadcast schedule
   */
  getBroadcastSchedule: adminProcedure
    .input(z.object({
      channelId: z.string(),
      date: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Mock schedule
      return {
        channelId: input.channelId,
        date: input.date || new Date(),
        commercials: [
          {
            time: '06:00',
            commercialId: 'commercial-1',
            title: 'UN WCS 30-Second Spot',
            duration: '30s',
          },
          {
            time: '08:00',
            commercialId: 'commercial-3',
            title: 'UN WCS 15-Second Spot',
            duration: '15s',
          },
          {
            time: '12:00',
            commercialId: 'commercial-2',
            title: 'UN WCS 60-Second Extended',
            duration: '60s',
          },
        ],
      };
    }),

  /**
   * Export commercial schedule
   */
  exportSchedule: adminProcedure
    .input(z.object({
      scheduleId: z.string(),
      format: z.enum(['csv', 'json', 'ical']),
    }))
    .query(async ({ input, ctx }) => {
      return {
        scheduleId: input.scheduleId,
        format: input.format,
        url: `/exports/schedule-${input.scheduleId}.${input.format}`,
        generatedAt: new Date(),
      };
    }),

  /**
   * Duplicate commercial
   */
  duplicateCommercial: adminProcedure
    .input(z.object({
      commercialId: z.string(),
      newTitle: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const newId = `commercial-${Date.now()}`;

      return {
        id: newId,
        title: input.newTitle,
        duplicatedFrom: input.commercialId,
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get commercial templates
   */
  getCommercialTemplates: adminProcedure.query(async ({ ctx }) => {
    return [
      {
        id: 'template-1',
        name: 'Event Announcement',
        duration: '30s',
        description: 'Standard event announcement template',
      },
      {
        id: 'template-2',
        name: 'Call to Action',
        duration: '15s',
        description: 'Quick call-to-action spot',
      },
      {
        id: 'template-3',
        name: 'Extended Promotion',
        duration: '60s',
        description: 'Detailed event promotion',
      },
    ];
  }),

  /**
   * Create commercial from template
   */
  createFromTemplate: adminProcedure
    .input(z.object({
      templateId: z.string(),
      title: z.string(),
      scriptText: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const commercialId = `commercial-${Date.now()}`;

      return {
        id: commercialId,
        title: input.title,
        scriptText: input.scriptText,
        templateId: input.templateId,
        status: 'draft',
        createdAt: new Date(),
        createdBy: ctx.user.id,
      };
    }),

  /**
   * Get commercial performance report
   */
  getPerformanceReport: adminProcedure
    .input(z.object({
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input, ctx }) => {
      // Mock report
      return {
        period: {
          startDate: input.startDate,
          endDate: input.endDate,
        },
        totalCommercials: 3,
        totalPlays: 4340,
        averageEngagement: 7.2,
        topPerformer: {
          commercialId: 'commercial-3',
          title: 'UN WCS 15-Second Spot',
          plays: 2100,
          engagement: 9.1,
        },
        channelPerformance: [
          { channelName: 'RRB Radio', plays: 2500, engagement: 8.5 },
          { channelName: 'Community Radio', plays: 1200, engagement: 6.8 },
          { channelName: 'Streaming Network', plays: 640, engagement: 5.2 },
        ],
      };
    }),
});

export default adminCommercialsRouter;
