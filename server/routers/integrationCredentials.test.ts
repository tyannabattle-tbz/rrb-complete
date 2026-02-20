import { describe, it, expect, beforeEach } from 'vitest';
import { integrationCredentialsRouter } from './integrationCredentialsRouter';

describe('Integration Credentials Router', () => {
  let caller: any;

  beforeEach(() => {
    caller = integrationCredentialsRouter.createCaller({
      user: { id: '1', name: 'Test Admin', role: 'admin' },
      req: {} as any,
      res: {} as any,
      db: {
        query: {
          integrationCredentials: {
            findMany: async () => [],
            findFirst: async () => null,
          },
          integrationRenewalSchedule: {
            findMany: async () => [],
          },
          integrationCredentialLogs: {
            findMany: async () => [],
          },
          integrationUpdateProcedures: {
            findMany: async () => [],
            findFirst: async () => null,
          },
        },
        insert: () => ({
          values: async () => ({}),
        }),
        update: () => ({
          set: () => ({
            where: async () => ({}),
          }),
        }),
      } as any,
    });
  });

  describe('getAllCredentials', () => {
    it('should return empty array when no credentials exist', async () => {
      const result = await caller.getAllCredentials();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should redact credential values in response', async () => {
      const mockCaller = integrationCredentialsRouter.createCaller({
        user: { id: '1', name: 'Test Admin', role: 'admin' },
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            integrationCredentials: {
              findMany: async () => [
                {
                  id: 'cred_1',
                  integrationName: 'youtube',
                  credentialValue: 'sk_test_secret_key_123',
                  integrationPhase: 3,
                },
              ],
            },
          },
        } as any,
      });

      const result = await mockCaller.getAllCredentials();

      expect(result.success).toBe(true);
      expect(result.data[0].credentialValue).toBe('***REDACTED***');
    });
  });

  describe('getCredentialsByPhase', () => {
    it('should return credentials for specified phase', async () => {
      const result = await caller.getCredentialsByPhase({ phase: 3 });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should validate phase number is between 2 and 7', async () => {
      try {
        await caller.getCredentialsByPhase({ phase: 1 });
        expect.fail('Should throw validation error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getRenewalSchedule', () => {
    it('should return renewal schedule ordered by date', async () => {
      const result = await caller.getRenewalSchedule();

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.upcomingRenewals).toBeDefined();
    });

    it('should identify upcoming renewals within 7 days', async () => {
      const now = Date.now();
      const mockCaller = integrationCredentialsRouter.createCaller({
        user: { id: '1', name: 'Test Admin', role: 'admin' },
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            integrationRenewalSchedule: {
              findMany: async () => [
                {
                  id: 'sched_1',
                  renewalDate: now + 3 * 24 * 60 * 60 * 1000, // 3 days from now
                  status: 'pending',
                },
                {
                  id: 'sched_2',
                  renewalDate: now + 15 * 24 * 60 * 60 * 1000, // 15 days from now
                  status: 'pending',
                },
              ],
            },
          },
        } as any,
      });

      const result = await mockCaller.getRenewalSchedule();

      expect(result.upcomingRenewals.length).toBe(1);
    });
  });

  describe('getCredentialLogs', () => {
    it('should return credential logs with pagination', async () => {
      const result = await caller.getCredentialLogs({
        limit: 50,
        offset: 0,
      });

      expect(result.success).toBe(true);
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeDefined();
    });

    it('should support filtering by credential ID', async () => {
      const result = await caller.getCredentialLogs({
        credentialId: 'cred_1',
        limit: 50,
        offset: 0,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getUpdateProcedure', () => {
    it('should return update procedure for integration', async () => {
      const mockCaller = integrationCredentialsRouter.createCaller({
        user: null,
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            integrationUpdateProcedures: {
              findFirst: async () => ({
                id: 'proc_1',
                integrationName: 'apple_podcasts',
                procedureTitle: 'Update Apple Podcasts',
                steps: JSON.stringify([
                  { step: 1, description: 'Log into Apple Podcasts Connect' },
                  { step: 2, description: 'Verify RSS feed' },
                ]),
                verificationSteps: JSON.stringify([
                  { step: 1, description: 'Check listener statistics' },
                ]),
                rollbackSteps: JSON.stringify([]),
                screenshotUrls: JSON.stringify([]),
              }),
            },
          },
        } as any,
      });

      const result = await mockCaller.getUpdateProcedure({
        integrationName: 'apple_podcasts',
      });

      expect(result.success).toBe(true);
      expect(result.data.procedureTitle).toBe('Update Apple Podcasts');
      expect(Array.isArray(result.data.steps)).toBe(true);
    });

    it('should return error if procedure not found', async () => {
      const result = await caller.getUpdateProcedure({
        integrationName: 'nonexistent',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('No update procedure found');
    });
  });

  describe('getCredentialStatusSummary', () => {
    it('should return status summary with counts by phase', async () => {
      const mockCaller = integrationCredentialsRouter.createCaller({
        user: { id: '1', name: 'Test Admin', role: 'admin' },
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            integrationCredentials: {
              findMany: async () => [
                {
                  id: 'cred_1',
                  integrationPhase: 2,
                  status: 'active',
                  isVerified: 1,
                },
                {
                  id: 'cred_2',
                  integrationPhase: 3,
                  status: 'active',
                  isVerified: 0,
                },
                {
                  id: 'cred_3',
                  integrationPhase: 3,
                  status: 'expired',
                  isVerified: 1,
                },
              ],
            },
          },
        } as any,
      });

      const result = await mockCaller.getCredentialStatusSummary();

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(3);
      expect(result.data.active).toBe(2);
      expect(result.data.expired).toBe(1);
      expect(result.data.verified).toBe(2);
      expect(result.data.byPhase.phase2).toBe(1);
      expect(result.data.byPhase.phase3).toBe(2);
    });
  });

  describe('getRenewalReminders', () => {
    it('should categorize credentials by renewal urgency', async () => {
      const now = Date.now();
      const mockCaller = integrationCredentialsRouter.createCaller({
        user: { id: '1', name: 'Test Admin', role: 'admin' },
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            integrationCredentials: {
              findMany: async () => [
                {
                  id: 'cred_1',
                  expiresAt: now + 3 * 24 * 60 * 60 * 1000, // 3 days - critical
                },
                {
                  id: 'cred_2',
                  expiresAt: now + 15 * 24 * 60 * 60 * 1000, // 15 days - warning
                },
                {
                  id: 'cred_3',
                  expiresAt: now - 1 * 24 * 60 * 60 * 1000, // 1 day ago - expired
                },
              ],
            },
          },
        } as any,
      });

      const result = await mockCaller.getRenewalReminders();

      expect(result.success).toBe(true);
      expect(result.data.critical.length).toBe(1);
      expect(result.data.warning.length).toBe(1);
      expect(result.data.expired.length).toBe(1);
    });
  });

  describe('exportCredentialsDocumentation', () => {
    it('should export documentation with redacted values', async () => {
      const mockCaller = integrationCredentialsRouter.createCaller({
        user: { id: '1', name: 'Test Admin', role: 'admin' },
        req: {} as any,
        res: {} as any,
        db: {
          query: {
            integrationCredentials: {
              findMany: async () => [
                {
                  id: 'cred_1',
                  integrationName: 'youtube',
                  credentialValue: 'secret_key_123',
                },
              ],
            },
            integrationUpdateProcedures: {
              findMany: async () => [],
            },
            integrationRenewalSchedule: {
              findMany: async () => [],
            },
          },
        } as any,
      });

      const result = await mockCaller.exportCredentialsDocumentation();

      expect(result.success).toBe(true);
      expect(result.data.credentials[0].credentialValue).toBe('***REDACTED***');
      expect(result.fileName).toContain('credentials-backup-');
    });
  });
});
