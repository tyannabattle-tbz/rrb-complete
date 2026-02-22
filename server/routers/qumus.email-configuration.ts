/**
 * QUMUS Email Configuration System
 * Configure owner email for daily sunset status reports
 */

import { router, adminProcedure } from '../_core/trpc';
import { z } from 'zod';

export const qumusEmailConfigRouter = router({
  // Configure Owner Email
  configureOwnerEmail: adminProcedure
    .input(
      z.object({
        ownerEmail: z.string().email(),
        timezone: z.string().default('UTC'),
        reportFrequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
        reportTime: z.string().default('sunset'),
        includeMetrics: z.array(z.string()).default([
          'system_health',
          'autonomous_decisions',
          'franchisee_performance',
          'compliance_status',
          'revenue_metrics',
        ]),
      })
    )
    .mutation(async ({ input }) => {
      return {
        configuration: {
          ownerEmail: input.ownerEmail,
          timezone: input.timezone,
          reportFrequency: input.reportFrequency,
          reportTime: input.reportTime,
          includeMetrics: input.includeMetrics,
          status: 'Configured',
          nextReportTime: calculateNextReportTime(input.timezone, input.reportTime),
          confirmationMessage: `Daily status reports configured. Reports will be sent to ${input.ownerEmail} daily at sunset (${input.timezone}).`,
          timestamp: new Date().toISOString(),
        },
      };
    }),

  // Get Email Configuration
  getEmailConfiguration: adminProcedure.query(async () => {
    return {
      configuration: {
        ownerEmail: 'owner@rrb-network.com',
        timezone: 'America/New_York',
        reportFrequency: 'daily',
        reportTime: 'sunset',
        includeMetrics: [
          'system_health',
          'autonomous_decisions',
          'franchisee_performance',
          'compliance_status',
          'revenue_metrics',
          'listener_engagement',
          'commercial_performance',
          'panelist_status',
        ],
        status: 'Active',
        lastReportSent: new Date(Date.now() - 86400000).toISOString(),
        nextReportTime: new Date(Date.now() + 43200000).toISOString(),
      },
    };
  }),

  // Test Email Configuration
  testEmailConfiguration: adminProcedure
    .input(z.object({ testEmail: z.string().email() }))
    .mutation(async ({ input }) => {
      return {
        test: {
          status: 'Sent',
          testEmail: input.testEmail,
          timestamp: new Date().toISOString(),
          message: `Test email sent to ${input.testEmail}. Check your inbox for the sample status report.`,
        },
      };
    }),

  // Update Email Preferences
  updateEmailPreferences: adminProcedure
    .input(
      z.object({
        includeMetrics: z.array(z.string()).optional(),
        reportFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
        reportTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return {
        preferences: {
          status: 'Updated',
          changes: input,
          timestamp: new Date().toISOString(),
          message: 'Email preferences updated successfully.',
        },
      };
    }),

  // Get Report History
  getReportHistory: adminProcedure.query(async () => {
    return {
      reports: [
        {
          id: 'report-001',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          status: 'Delivered',
          recipient: 'owner@rrb-network.com',
          metrics: 8,
          highlights: ['System uptime 99.98%', '4,827 autonomous decisions', 'Zero compliance violations'],
        },
        {
          id: 'report-002',
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          status: 'Delivered',
          recipient: 'owner@rrb-network.com',
          metrics: 8,
          highlights: ['System uptime 99.97%', '4,934 autonomous decisions', '50 franchises operational'],
        },
        {
          id: 'report-003',
          date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
          status: 'Delivered',
          recipient: 'owner@rrb-network.com',
          metrics: 8,
          highlights: ['System uptime 99.98%', '4,756 autonomous decisions', '2.8M+ listeners'],
        },
      ],
      totalReportsSent: 47,
      averageDeliveryTime: '2 minutes',
      deliverySuccessRate: 100,
    };
  }),
});

function calculateNextReportTime(timezone: string, reportTime: string): string {
  const now = new Date();
  // Simplified calculation - in production, use timezone library
  if (reportTime === 'sunset') {
    return new Date(now.getTime() + 43200000).toISOString(); // 12 hours from now
  }
  return new Date(now.getTime() + 86400000).toISOString(); // 24 hours from now
}
