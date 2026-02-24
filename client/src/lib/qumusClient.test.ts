import { describe, it, expect, beforeEach, vi } from 'vitest';
import QumusClient from './qumusClient';

describe('QumusClient', () => {
  let client: QumusClient;
  const mockBaseUrl = 'http://localhost:3001';

  beforeEach(() => {
    client = new QumusClient(mockBaseUrl);
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('makeDecision', () => {
    it('should make a decision through Qumus API', async () => {
      const mockDecision = {
        id: 'dec-1',
        policyId: 'policy-1',
        timestamp: Date.now(),
        autonomous: true,
        action: 'Test action',
        metadata: {},
        result: 'success' as const,
        systemsAffected: ['rrb'],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision,
      });

      const result = await client.makeDecision('policy-1', 'Test action');

      expect(result).toEqual(mockDecision);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/decisions`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should throw error on failed decision', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(client.makeDecision('policy-1', 'Test')).rejects.toThrow(
        'Failed to make decision'
      );
    });
  });

  describe('getMetrics', () => {
    it('should fetch autonomy metrics', async () => {
      const mockMetrics = {
        totalDecisions: 100,
        autonomousDecisions: 90,
        humanOverrides: 10,
        autonomyPercentage: 90,
        policies: 12,
        enabledPolicies: 12,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMetrics,
      });

      const result = await client.getMetrics();

      expect(result).toEqual(mockMetrics);
      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/metrics`);
    });
  });

  describe('getPolicies', () => {
    it('should fetch all policies', async () => {
      const mockPolicies = [
        {
          id: 'policy-1',
          name: 'Content Scheduling',
          description: 'Test',
          autonomyLevel: 95,
          enabled: true,
          executionCount: 10,
          lastExecuted: Date.now(),
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolicies,
      });

      const result = await client.getPolicies();

      expect(result).toEqual(mockPolicies);
      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/policies`);
    });
  });

  describe('getPolicy', () => {
    it('should fetch specific policy', async () => {
      const mockPolicy = {
        id: 'policy-1',
        name: 'Content Scheduling',
        description: 'Test',
        autonomyLevel: 95,
        enabled: true,
        executionCount: 10,
        lastExecuted: Date.now(),
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockPolicy,
      });

      const result = await client.getPolicy('policy-1');

      expect(result).toEqual(mockPolicy);
      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/policies/policy-1`);
    });
  });

  describe('updatePolicyAutonomy', () => {
    it('should update policy autonomy level', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await client.updatePolicyAutonomy('policy-1', 85);

      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/policies/policy-1/autonomy`,
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ autonomyLevel: 85 }),
        })
      );
    });
  });

  describe('getDecisionHistory', () => {
    it('should fetch decision history', async () => {
      const mockDecisions = [
        {
          id: 'dec-1',
          policyId: 'policy-1',
          timestamp: Date.now(),
          autonomous: true,
          action: 'Test',
          metadata: {},
          result: 'success' as const,
          systemsAffected: ['rrb'],
        },
      ];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecisions,
      });

      const result = await client.getDecisionHistory(50);

      expect(result).toEqual(mockDecisions);
      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/api/decisions?limit=50`);
    });
  });

  describe('sync', () => {
    it('should sync with Qumus', async () => {
      const mockResponse = { success: true, system: 'rrb' };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.sync('rrb', { channelId: 'jazz' });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/sync`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ system: 'rrb', data: { channelId: 'jazz' } }),
        })
      );
    });
  });

  describe('sendWebhook', () => {
    it('should send webhook to Qumus', async () => {
      const mockResponse = { success: true };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.sendWebhook('rrb', 'stream_started', { channelId: 'jazz' });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/webhooks/rrb`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ event: 'stream_started', data: { channelId: 'jazz' } }),
        })
      );
    });
  });

  describe('override', () => {
    it('should override autonomous decision', async () => {
      const mockResponse = { success: true };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await client.override('dec-1', 'cancel_stream', 'Manual override');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/api/override`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            decisionId: 'dec-1',
            action: 'cancel_stream',
            reason: 'Manual override',
          }),
        })
      );
    });
  });

  describe('health', () => {
    it('should check Qumus health', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        autonomyLevel: 90,
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockHealth,
      });

      const result = await client.health();

      expect(result).toEqual(mockHealth);
      expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/health`);
    });
  });
});
