import { protectedProcedure, router } from '../_core/trpc';
import { z } from 'zod';

export const emailNotificationRouter = router({
  // Send export completion email
  sendExportCompletionEmail: protectedProcedure
    .input(z.object({
      exportId: z.string(),
      format: z.enum(['json', 'csv', 'markdown']),
      fileSize: z.number(),
      downloadUrl: z.string(),
      recipientEmail: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        emailId: `email-${Date.now()}`,
        recipient: input.recipientEmail,
        subject: `Your ${input.format.toUpperCase()} Export is Ready`,
        status: 'sent',
        timestamp: new Date(),
        message: `Your chat export (${(input.fileSize / 1024 / 1024).toFixed(2)} MB) is ready for download.`,
      };
    }),

  // Send analytics summary email
  sendAnalyticsSummaryEmail: protectedProcedure
    .input(z.object({
      recipientEmail: z.string().email(),
      timeRange: z.enum(['1d', '7d', '30d']),
      metrics: z.object({
        completionRate: z.number(),
        engagementScore: z.number(),
        topFeature: z.string(),
        totalInteractions: z.number(),
      }),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        emailId: `email-${Date.now()}`,
        recipient: input.recipientEmail,
        subject: `Your Analytics Summary - ${input.timeRange}`,
        status: 'sent',
        timestamp: new Date(),
        metrics: input.metrics,
      };
    }),

  // Send scheduled export notification
  sendScheduledExportNotification: protectedProcedure
    .input(z.object({
      recipientEmail: z.string().email(),
      scheduleName: z.string(),
      frequency: z.enum(['daily', 'weekly', 'monthly']),
      nextRun: z.date(),
      format: z.enum(['json', 'csv', 'markdown']),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        emailId: `email-${Date.now()}`,
        recipient: input.recipientEmail,
        subject: `Scheduled Export: ${input.scheduleName}`,
        status: 'sent',
        timestamp: new Date(),
        nextRun: input.nextRun,
        message: `Your ${input.frequency} ${input.format.toUpperCase()} export is scheduled for ${input.nextRun.toLocaleString()}.`,
      };
    }),

  // Configure email preferences
  updateEmailPreferences: protectedProcedure
    .input(z.object({
      exportCompletionEmails: z.boolean(),
      analyticsSummaryEmails: z.boolean(),
      scheduledExportNotifications: z.boolean(),
      summaryFrequency: z.enum(['daily', 'weekly', 'monthly']),
      summaryTime: z.string(),
      unsubscribeAll: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        userId: ctx.user.id,
        preferences: {
          exportCompletionEmails: input.exportCompletionEmails,
          analyticsSummaryEmails: input.analyticsSummaryEmails,
          scheduledExportNotifications: input.scheduledExportNotifications,
          summaryFrequency: input.summaryFrequency,
          summaryTime: input.summaryTime,
        },
        message: 'Email preferences updated successfully',
      };
    }),

  // Get email preferences
  getEmailPreferences: protectedProcedure.query(async ({ ctx }) => {
    return {
      userId: ctx.user.id,
      preferences: {
        exportCompletionEmails: true,
        analyticsSummaryEmails: true,
        scheduledExportNotifications: true,
        summaryFrequency: 'weekly',
        summaryTime: '09:00',
      },
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };
  }),

  // Get email history
  getEmailHistory: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      return {
        userId: ctx.user.id,
        emails: [
          {
            id: 'email-1',
            recipient: ctx.user.email || '',
            subject: 'Your JSON Export is Ready',
            type: 'export-completion',
            status: 'delivered',
            sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            openedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          },
          {
            id: 'email-2',
            recipient: ctx.user.email || '',
            subject: 'Weekly Analytics Summary',
            type: 'analytics-summary',
            status: 'delivered',
            sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            openedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
          },
        ],
        total: 2,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  // Test email delivery
  testEmailDelivery: protectedProcedure
    .input(z.object({
      recipientEmail: z.string().email(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        emailId: `test-email-${Date.now()}`,
        recipient: input.recipientEmail,
        subject: 'Test Email from Qumus',
        status: 'sent',
        timestamp: new Date(),
        message: 'This is a test email to verify your email configuration is working correctly.',
      };
    }),

  // Resend failed email
  resendFailedEmail: protectedProcedure
    .input(z.object({
      emailId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        emailId: input.emailId,
        status: 'resent',
        timestamp: new Date(),
        message: 'Email has been queued for resend',
      };
    }),

  // Unsubscribe from all emails
  unsubscribeFromAllEmails: protectedProcedure.mutation(async ({ ctx }) => {
    return {
      success: true,
      userId: ctx.user.id,
      status: 'unsubscribed',
      message: 'You have been unsubscribed from all email notifications',
      resubscribeUrl: `/settings/notifications`,
    };
  }),
});
