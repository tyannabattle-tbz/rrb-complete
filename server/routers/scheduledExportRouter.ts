import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const scheduledExportRouter = router({
  // Create scheduled export job
  createSchedule: protectedProcedure
    .input(z.object({
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      time: z.string().regex(/^\d{2}:\d{2}$/), // HH:MM format
      format: z.enum(['json', 'csv', 'markdown']),
      destination: z.enum(['email', 'cloud', 'local']),
      retentionDays: z.number().min(1).max(365).default(30),
      includeMetadata: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const scheduleId = `schedule-${Date.now()}`;
      return {
        success: true,
        schedule: {
          id: scheduleId,
          userId: ctx.user.id,
          frequency: input.frequency,
          time: input.time,
          format: input.format,
          destination: input.destination,
          retentionDays: input.retentionDays,
          includeMetadata: input.includeMetadata,
          isActive: true,
          createdAt: new Date(),
          nextRun: calculateNextRun(input.frequency, input.time),
        },
      };
    }),

  // List all scheduled exports
  listSchedules: protectedProcedure.query(async ({ ctx }) => {
    return {
      schedules: [
        {
          id: 'schedule-1',
          userId: ctx.user.id,
          frequency: 'daily',
          time: '02:00',
          format: 'json',
          destination: 'cloud',
          retentionDays: 30,
          includeMetadata: true,
          isActive: true,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000),
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'active',
        },
      ],
    };
  }),

  // Update scheduled export
  updateSchedule: protectedProcedure
    .input(z.object({
      scheduleId: z.string(),
      frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
      time: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      format: z.enum(['json', 'csv', 'markdown']).optional(),
      destination: z.enum(['email', 'cloud', 'local']).optional(),
      retentionDays: z.number().min(1).max(365).optional(),
      isActive: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        schedule: {
          id: input.scheduleId,
          userId: ctx.user.id,
          frequency: input.frequency ?? 'daily',
          time: input.time ?? '02:00',
          format: input.format ?? 'json',
          destination: input.destination ?? 'cloud',
          retentionDays: input.retentionDays ?? 30,
          isActive: input.isActive ?? true,
          updatedAt: new Date(),
          nextRun: calculateNextRun(input.frequency ?? 'daily', input.time ?? '02:00'),
        },
      };
    }),

  // Delete scheduled export
  deleteSchedule: protectedProcedure
    .input(z.object({ scheduleId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: `Schedule ${input.scheduleId} deleted`,
        deletedAt: new Date(),
      };
    }),

  // Get export history
  getHistory: protectedProcedure
    .input(z.object({
      scheduleId: z.string().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      return {
        exports: [
          {
            id: 'export-1',
            scheduleId: input.scheduleId || 'schedule-1',
            userId: ctx.user.id,
            format: 'json',
            destination: 'cloud',
            fileSize: 2.4, // MB
            messageCount: 487,
            sessionCount: 12,
            status: 'completed',
            startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30 * 1000),
            downloadUrl: '/api/trpc/scheduledExport.getExportHistory',
          },
          {
            id: 'export-2',
            scheduleId: input.scheduleId || 'schedule-1',
            userId: ctx.user.id,
            format: 'json',
            destination: 'cloud',
            fileSize: 2.3,
            messageCount: 445,
            sessionCount: 11,
            status: 'completed',
            startedAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 26 * 60 * 60 * 1000 + 28 * 1000),
            downloadUrl: '/api/trpc/scheduledExport.getExportHistory',
          },
        ],
        total: 2,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Trigger manual export
  triggerManualExport: protectedProcedure
    .input(z.object({
      format: z.enum(['json', 'csv', 'markdown']),
      destination: z.enum(['email', 'cloud', 'local']),
      includeMetadata: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const exportId = `export-${Date.now()}`;
      return {
        success: true,
        export: {
          id: exportId,
          userId: ctx.user.id,
          format: input.format,
          destination: input.destination,
          includeMetadata: input.includeMetadata,
          status: 'processing',
          createdAt: new Date(),
          estimatedCompletionTime: 30, // seconds
        },
      };
    }),

  // Get export statistics
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      totalExports: 24,
      totalDataExported: 52.8, // MB
      averageExportSize: 2.2, // MB
      mostUsedFormat: 'json',
      mostUsedDestination: 'cloud',
      lastExportTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      nextScheduledExport: new Date(Date.now() + 22 * 60 * 60 * 1000),
      storageUsed: 52.8, // MB
      storageLimit: 1024, // MB
      retentionPolicy: {
        daysRetained: 30,
        autoDeleteEnabled: true,
        nextCleanupDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    };
  }),

  // Configure retention policy
  updateRetentionPolicy: protectedProcedure
    .input(z.object({
      daysRetained: z.number().min(1).max(365),
      autoDeleteEnabled: z.boolean(),
      notifyBeforeDelete: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        policy: {
          userId: ctx.user.id,
          daysRetained: input.daysRetained,
          autoDeleteEnabled: input.autoDeleteEnabled,
          notifyBeforeDelete: input.notifyBeforeDelete,
          updatedAt: new Date(),
        },
      };
    }),
});

// Helper function to calculate next run time
function calculateNextRun(frequency: string, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(hours, minutes, 0, 0);

  if (frequency === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (frequency === 'weekly') {
    if (next <= now) {
      next.setDate(next.getDate() + 7);
    }
  } else if (frequency === 'monthly') {
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  }

  return next;
}
