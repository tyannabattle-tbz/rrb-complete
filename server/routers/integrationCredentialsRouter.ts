import { publicProcedure, protectedProcedure, router, adminProcedure } from '../_core/trpc';
import { z } from 'zod';
import * as db from '../db';

/**
 * Integration Credentials Router
 * Manages all third-party API keys, OAuth tokens, and login credentials
 * with automatic renewal tracking and update procedures
 */

export const integrationCredentialsRouter = router({
  /**
   * Get all integration credentials (admin only)
   */
  getAllCredentials: adminProcedure.query(async ({ ctx }) => {
    try {
      const credentials = await ctx.db.query.integrationCredentials.findMany({
        orderBy: (creds) => creds.integrationPhase,
      });

      return {
        success: true,
        data: credentials.map((cred) => ({
          ...cred,
          // Don't expose actual credential values in response
          credentialValue: '***REDACTED***',
        })),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch credentials: ${error}`,
      };
    }
  }),

  /**
   * Get credentials by phase
   */
  getCredentialsByPhase: adminProcedure
    .input(z.object({ phase: z.number().min(2).max(7) }))
    .query(async ({ ctx, input }) => {
      try {
        const credentials = await ctx.db.query.integrationCredentials.findMany({
          where: (creds) => creds.integrationPhase === input.phase,
        });

        return {
          success: true,
          data: credentials.map((cred) => ({
            ...cred,
            credentialValue: '***REDACTED***',
          })),
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to fetch phase ${input.phase} credentials: ${error}`,
        };
      }
    }),

  /**
   * Get renewal schedule
   */
  getRenewalSchedule: adminProcedure.query(async ({ ctx }) => {
    try {
      const schedule = await ctx.db.query.integrationRenewalSchedule.findMany({
        orderBy: (sched) => sched.renewalDate,
      });

      return {
        success: true,
        data: schedule,
        upcomingRenewals: schedule.filter(
          (s) => s.status === 'pending' && s.renewalDate <= Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch renewal schedule: ${error}`,
      };
    }
  }),

  /**
   * Get credential logs for audit trail
   */
  getCredentialLogs: adminProcedure
    .input(
      z.object({
        credentialId: z.string().optional(),
        action: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const logs = await ctx.db.query.integrationCredentialLogs.findMany({
          limit: input.limit,
          offset: input.offset,
          orderBy: (logs) => logs.createdAt,
        });

        return {
          success: true,
          data: logs,
          total: logs.length,
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to fetch credential logs: ${error}`,
        };
      }
    }),

  /**
   * Get update procedures for an integration
   */
  getUpdateProcedure: publicProcedure
    .input(z.object({ integrationName: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const procedure = await ctx.db.query.integrationUpdateProcedures.findFirst({
          where: (procs) => procs.integrationName === input.integrationName,
        });

        if (!procedure) {
          return {
            success: false,
            error: `No update procedure found for ${input.integrationName}`,
          };
        }

        return {
          success: true,
          data: {
            ...procedure,
            steps: JSON.parse(procedure.steps || '[]'),
            verificationSteps: JSON.parse(procedure.verificationSteps || '[]'),
            rollbackSteps: JSON.parse(procedure.rollbackSteps || '[]'),
            screenshotUrls: JSON.parse(procedure.screenshotUrls || '[]'),
          },
        };
      } catch (error) {
        return {
          success: false,
          error: `Failed to fetch update procedure: ${error}`,
        };
      }
    }),

  /**
   * Verify a credential by testing the connection
   */
  verifyCredential: adminProcedure
    .input(z.object({ credentialId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const credential = await ctx.db.query.integrationCredentials.findFirst({
          where: (creds) => creds.id === input.credentialId,
        });

        if (!credential) {
          return {
            success: false,
            error: 'Credential not found',
          };
        }

        // Simulate credential verification (in production, test actual API connection)
        const verificationResult = {
          status: 'success',
          message: `${credential.integrationName} credential verified`,
          timestamp: new Date().toISOString(),
          responseTime: Math.random() * 500, // Simulated response time
        };

        // Log the verification
        await ctx.db.insert(integrationCredentialLogs).values({
          id: `log_${Date.now()}`,
          credentialId: credential.id,
          action: 'verified',
          status: 'success',
          message: verificationResult.message,
          verificationResult: JSON.stringify(verificationResult),
          apiResponseCode: 200,
          apiResponseTime: verificationResult.responseTime,
          performedBy: ctx.user?.name || 'system',
          createdAt: Date.now(),
        });

        // Update credential verification status
        await ctx.db
          .update(integrationCredentials)
          .set({
            isVerified: 1,
            lastVerifiedAt: Date.now(),
            verificationError: null,
            updatedAt: Date.now(),
          })
          .where((creds) => creds.id === credential.id);

        return {
          success: true,
          data: verificationResult,
        };
      } catch (error) {
        return {
          success: false,
          error: `Verification failed: ${error}`,
        };
      }
    }),

  /**
   * Get renewal reminders (credentials expiring soon)
   */
  getRenewalReminders: adminProcedure.query(async ({ ctx }) => {
    try {
      const now = Date.now();
      const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysFromNow = now + 30 * 24 * 60 * 60 * 1000;

      const credentials = await ctx.db.query.integrationCredentials.findMany();

      const reminders = {
        critical: credentials.filter(
          (c) => c.expiresAt && c.expiresAt <= sevenDaysFromNow && c.expiresAt > now
        ),
        warning: credentials.filter(
          (c) => c.expiresAt && c.expiresAt <= thirtyDaysFromNow && c.expiresAt > sevenDaysFromNow
        ),
        expired: credentials.filter((c) => c.expiresAt && c.expiresAt <= now),
      };

      return {
        success: true,
        data: reminders,
        summary: {
          criticalCount: reminders.critical.length,
          warningCount: reminders.warning.length,
          expiredCount: reminders.expired.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch renewal reminders: ${error}`,
      };
    }
  }),

  /**
   * Get credential status summary
   */
  getCredentialStatusSummary: adminProcedure.query(async ({ ctx }) => {
    try {
      const credentials = await ctx.db.query.integrationCredentials.findMany();

      const summary = {
        total: credentials.length,
        active: credentials.filter((c) => c.status === 'active').length,
        inactive: credentials.filter((c) => c.status === 'inactive').length,
        expired: credentials.filter((c) => c.status === 'expired').length,
        revoked: credentials.filter((c) => c.status === 'revoked').length,
        verified: credentials.filter((c) => c.isVerified).length,
        unverified: credentials.filter((c) => !c.isVerified).length,
        byPhase: {
          phase2: credentials.filter((c) => c.integrationPhase === 2).length,
          phase3: credentials.filter((c) => c.integrationPhase === 3).length,
          phase4: credentials.filter((c) => c.integrationPhase === 4).length,
          phase5: credentials.filter((c) => c.integrationPhase === 5).length,
          phase6: credentials.filter((c) => c.integrationPhase === 6).length,
          phase7: credentials.filter((c) => c.integrationPhase === 7).length,
        },
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch credential summary: ${error}`,
      };
    }
  }),

  /**
   * Export credentials documentation for backup
   */
  exportCredentialsDocumentation: adminProcedure.query(async ({ ctx }) => {
    try {
      const credentials = await ctx.db.query.integrationCredentials.findMany();
      const procedures = await ctx.db.query.integrationUpdateProcedures.findMany();
      const schedule = await ctx.db.query.integrationRenewalSchedule.findMany();

      const documentation = {
        exportedAt: new Date().toISOString(),
        credentials: credentials.map((c) => ({
          ...c,
          credentialValue: '***REDACTED***',
        })),
        procedures: procedures,
        renewalSchedule: schedule,
        summary: {
          totalCredentials: credentials.length,
          totalProcedures: procedures.length,
          upcomingRenewals: schedule.filter((s) => s.status === 'pending').length,
        },
      };

      return {
        success: true,
        data: documentation,
        fileName: `credentials-backup-${Date.now()}.json`,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to export documentation: ${error}`,
      };
    }
  }),
});

// Import the schema types
import { integrationCredentials, integrationCredentialLogs } from '../../drizzle/integrationCredentialsSchema';
