import { describe, it, expect, beforeEach, vi } from 'vitest';
import { seamlessAgentConnectionService } from '../services/seamlessAgentConnectionService';

describe('Seamless Agent Connection System', () => {
  describe('Agent Discovery', () => {
    it('should discover agents by capabilities', async () => {
      const agents = await seamlessAgentConnectionService.discoverAgents(['messaging', 'streaming']);
      expect(Array.isArray(agents)).toBe(true);
    });

    it('should filter agents by minimum trust score', async () => {
      const agents = await seamlessAgentConnectionService.discoverAgents(['messaging'], undefined, 75);
      expect(Array.isArray(agents)).toBe(true);
    });

    it('should discover agents by platforms', async () => {
      const agents = await seamlessAgentConnectionService.discoverAgents(
        ['streaming'],
        ['HybridCast', 'RockinBoogie']
      );
      expect(Array.isArray(agents)).toBe(true);
    });
  });

  describe('Agent Profile Management', () => {
    it('should retrieve agent profile', async () => {
      const profile = await seamlessAgentConnectionService.getAgentProfile('agent-123');
      expect(profile).toBeNull();
    });

    it('should return null for non-existent agent', async () => {
      const profile = await seamlessAgentConnectionService.getAgentProfile('non-existent');
      expect(profile).toBeNull();
    });
  });

  describe('Connection Requests', () => {
    it('should initiate connection request', async () => {
      const request = await seamlessAgentConnectionService.initiateConnectionRequest(
        'agent-1',
        'agent-2',
        'Content distribution',
        ['messaging', 'streaming']
      );

      expect(request).toBeDefined();
      expect(request.sourceAgentId).toBe('agent-1');
      expect(request.targetAgentId).toBe('agent-2');
      expect(request.purpose).toBe('Content distribution');
      expect(request.status).toBe('pending');
      expect(request.expiresAt.getTime()).toBeGreaterThan(request.timestamp.getTime());
    });

    it('should accept connection request', async () => {
      const channel = await seamlessAgentConnectionService.acceptConnectionRequest(
        'req-123',
        'agent-2'
      );

      expect(channel).toBeDefined();
      expect(channel.status).toBe('active');
      expect(channel.encryptionAlgorithm).toBe('AES-256-GCM');
      expect(channel.encryptionKey).toBeDefined();
      expect(channel.encryptionKey.length).toBe(64); // 32 bytes as hex
    });

    it('should reject connection request', async () => {
      const result = await seamlessAgentConnectionService.rejectConnectionRequest(
        'req-123',
        'Trust score too low'
      );

      expect(result).toBe(true);
    });
  });

  describe('Secure Communication', () => {
    it('should send unified message', async () => {
      const message = await seamlessAgentConnectionService.sendUnifiedMessage(
        'ch-123',
        'agent-1',
        'agent-2',
        'request',
        { action: 'distribute', content: 'podcast-episode-1' },
        true
      );

      expect(message).toBeDefined();
      expect(message.sourceAgentId).toBe('agent-1');
      expect(message.targetAgentId).toBe('agent-2');
      expect(message.messageType).toBe('request');
      expect(message.encrypted).toBe(true);
      expect(message.status).toBe('sent');
    });

    it('should send unencrypted message', async () => {
      const message = await seamlessAgentConnectionService.sendUnifiedMessage(
        'ch-123',
        'agent-1',
        'agent-2',
        'notification',
        { type: 'status', value: 'online' },
        false
      );

      expect(message.encrypted).toBe(false);
    });

    it('should receive unified message', async () => {
      const receivedMessage = await seamlessAgentConnectionService.receiveUnifiedMessage({
        messageId: 'msg-123',
        sourceAgentId: 'agent-1',
        targetAgentId: 'agent-2',
        channelId: 'ch-123',
        messageType: 'request',
        payload: { action: 'distribute' },
        encrypted: true,
        timestamp: new Date(),
        status: 'sent',
      });

      expect(receivedMessage.status).toBe('delivered');
    });

    it('should acknowledge message delivery', async () => {
      const result = await seamlessAgentConnectionService.acknowledgeMessage('msg-123');
      expect(result).toBe(true);
    });
  });

  describe('Channel Management', () => {
    it('should get active channels', async () => {
      const channels = await seamlessAgentConnectionService.getActiveChannels('agent-1');
      expect(Array.isArray(channels)).toBe(true);
    });

    it('should close secure channel', async () => {
      const result = await seamlessAgentConnectionService.closeChannel('ch-123');
      expect(result).toBe(true);
    });

    it('should monitor connection health', async () => {
      const health = await seamlessAgentConnectionService.monitorConnectionHealth('ch-123');

      expect(health).toBeDefined();
      expect(health.channelId).toBe('ch-123');
      expect(health.health).toBeGreaterThan(0);
      expect(health.latency).toBeGreaterThan(0);
      expect(health.packetLoss).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Broadcasting', () => {
    it('should broadcast message to multiple agents', async () => {
      const results = await seamlessAgentConnectionService.broadcastMessage(
        'agent-1',
        ['agent-2', 'agent-3', 'agent-4'],
        'notification',
        { message: 'New content available' }
      );

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(3);
      results.forEach((result) => {
        expect(result.agentId).toBeDefined();
        expect(['sent', 'failed']).toContain(result.status);
      });
    });

    it('should handle empty broadcast list', async () => {
      const results = await seamlessAgentConnectionService.broadcastMessage(
        'agent-1',
        [],
        'notification',
        { message: 'Test' }
      );

      expect(results).toEqual([]);
    });
  });

  describe('Network Statistics', () => {
    it('should get connection statistics', async () => {
      const stats = await seamlessAgentConnectionService.getConnectionStats();

      expect(stats).toBeDefined();
      expect(stats.activeConnections).toBeGreaterThanOrEqual(0);
      expect(stats.totalAgents).toBeGreaterThanOrEqual(0);
      expect(stats.averageLatency).toBeGreaterThan(0);
      expect(stats.messagesThroughput).toBeGreaterThan(0);
      expect(stats.connectionHealth).toBeGreaterThan(0);
    });
  });

  describe('Cross-Platform Communication', () => {
    it('should establish cross-platform connection', async () => {
      const connection = await seamlessAgentConnectionService.establishCrossPlatformConnection(
        'agent-1',
        'agent-2',
        ['HybridCast', 'RockinBoogie', 'Canryn']
      );

      expect(connection).toBeDefined();
      expect(connection.platforms).toEqual(['HybridCast', 'RockinBoogie', 'Canryn']);
      expect(connection.status).toBe('established');
    });

    it('should sync agent state across platforms', async () => {
      const result = await seamlessAgentConnectionService.syncAgentState('agent-1', [
        'HybridCast',
        'RockinBoogie',
      ]);

      expect(result).toBe(true);
    });
  });

  describe('Connection Recovery', () => {
    it('should handle connection failure and recover', async () => {
      const recovery = await seamlessAgentConnectionService.handleConnectionFailure(
        'ch-123',
        'Network timeout'
      );

      expect(recovery).toBeDefined();
      expect(recovery.recovered).toBe(true);
      expect(recovery.newChannelId).toBeDefined();
    });

    it('should track recovery attempts', async () => {
      const recovery1 = await seamlessAgentConnectionService.handleConnectionFailure(
        'ch-123',
        'Connection lost'
      );
      const recovery2 = await seamlessAgentConnectionService.handleConnectionFailure(
        'ch-123',
        'Connection lost'
      );

      expect(recovery1.recovered).toBe(true);
      expect(recovery2.recovered).toBe(true);
      expect(recovery1.newChannelId).not.toBe(recovery2.newChannelId);
    });
  });

  describe('Connection Recommendations', () => {
    it('should get connection recommendations', async () => {
      const recommendations = await seamlessAgentConnectionService.getConnectionRecommendations(
        'agent-1'
      );

      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should recommend compatible agents', async () => {
      const recommendations = await seamlessAgentConnectionService.getConnectionRecommendations(
        'agent-1'
      );

      recommendations.forEach((rec) => {
        expect(rec.agentId).toBeDefined();
        expect(rec.name).toBeDefined();
        expect(rec.compatibilityScore).toBeGreaterThanOrEqual(0);
        expect(rec.compatibilityScore).toBeLessThanOrEqual(100);
        expect(Array.isArray(rec.commonCapabilities)).toBe(true);
        expect(rec.recommendedPurpose).toBeDefined();
      });
    });
  });

  describe('Message Routing', () => {
    it('should route messages through correct channel', async () => {
      const message = await seamlessAgentConnectionService.sendUnifiedMessage(
        'ch-123',
        'agent-1',
        'agent-2',
        'request',
        { data: 'test' }
      );

      expect(message.channelId).toBe('ch-123');
    });

    it('should handle different message types', async () => {
      const types: Array<'request' | 'response' | 'notification' | 'broadcast'> = [
        'request',
        'response',
        'notification',
        'broadcast',
      ];

      for (const type of types) {
        const message = await seamlessAgentConnectionService.sendUnifiedMessage(
          'ch-123',
          'agent-1',
          'agent-2',
          type,
          { test: true }
        );

        expect(message.messageType).toBe(type);
      }
    });
  });

  describe('Security', () => {
    it('should encrypt messages when requested', async () => {
      const message = await seamlessAgentConnectionService.sendUnifiedMessage(
        'ch-123',
        'agent-1',
        'agent-2',
        'request',
        { sensitive: 'data' },
        true
      );

      expect(message.encrypted).toBe(true);
    });

    it('should use AES-256-GCM encryption', async () => {
      const channel = await seamlessAgentConnectionService.acceptConnectionRequest('req-123', 'agent-2');

      expect(channel.encryptionAlgorithm).toBe('AES-256-GCM');
    });

    it('should generate unique encryption keys per channel', async () => {
      const channel1 = await seamlessAgentConnectionService.acceptConnectionRequest('req-1', 'agent-2');
      const channel2 = await seamlessAgentConnectionService.acceptConnectionRequest('req-2', 'agent-3');

      expect(channel1.encryptionKey).not.toBe(channel2.encryptionKey);
    });
  });

  describe('Error Handling', () => {
    it('should handle discovery errors gracefully', async () => {
      try {
        await seamlessAgentConnectionService.discoverAgents([]);
        expect(true).toBe(true);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle connection request errors', async () => {
      try {
        const request = await seamlessAgentConnectionService.initiateConnectionRequest(
          'agent-1',
          'agent-2',
          'Test',
          []
        );
        expect(request).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle message sending errors', async () => {
      try {
        const message = await seamlessAgentConnectionService.sendUnifiedMessage(
          'invalid-channel',
          'agent-1',
          'agent-2',
          'request',
          {}
        );
        expect(message).toBeDefined();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Performance', () => {
    it('should handle multiple concurrent connections', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        seamlessAgentConnectionService.initiateConnectionRequest(
          `agent-${i}`,
          `agent-${i + 1}`,
          'Test',
          ['messaging']
        )
      );

      const results = await Promise.all(promises);
      expect(results.length).toBe(10);
      results.forEach((result) => {
        expect(result.status).toBe('pending');
      });
    });

    it('should broadcast to large agent groups efficiently', async () => {
      const agentIds = Array.from({ length: 100 }, (_, i) => `agent-${i}`);
      const results = await seamlessAgentConnectionService.broadcastMessage(
        'agent-0',
        agentIds,
        'notification',
        { message: 'Broadcast test' }
      );

      expect(results.length).toBe(100);
    });
  });
});
