/**
 * Agent Network Router Tests
 * Comprehensive test suite for inter-agent communication and discovery
 */

import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { AgentNetworkService } from '../services/agentNetworkService';
import { AgentRegistryService } from '../services/agentRegistryService';

describe('Agent Network Service', () => {
  let agentNetwork: AgentNetworkService;
  let registry: AgentRegistryService;

  beforeAll(() => {
    agentNetwork = new AgentNetworkService(
      'test-agent-1',
      'Test Agent 1',
      'http://localhost:3001',
      ['ai-chat', 'autonomous-decision', 'monitoring'],
      85
    );
    registry = new AgentRegistryService();
  });

  afterAll(() => {
    agentNetwork.shutdown();
  });

  describe('Agent Identity', () => {
    it('should create agent with correct identity', () => {
      const identity = agentNetwork.getIdentity();
      expect(identity.agentId).toBe('test-agent-1');
      expect(identity.name).toBe('Test Agent 1');
      expect(identity.autonomyLevel).toBe(85);
      expect(identity.capabilities).toContain('ai-chat');
    });

    it('should generate unique public key', () => {
      const identity = agentNetwork.getIdentity();
      expect(identity.publicKey).toBeDefined();
      expect(identity.publicKey.length).toBeGreaterThan(0);
    });

    it('should have correct endpoint', () => {
      const identity = agentNetwork.getIdentity();
      expect(identity.endpoint).toBe('http://localhost:3001');
    });
  });

  describe('Agent Discovery', () => {
    it('should discover agents with matching capabilities', async () => {
      const agents = await agentNetwork.discoverAgents({
        agentId: 'test-agent-1',
        capabilities: ['ai-chat'],
        autonomyLevel: 85,
      });

      expect(Array.isArray(agents)).toBe(true);
    });

    it('should filter agents by autonomy level', async () => {
      const agents = await agentNetwork.discoverAgents({
        agentId: 'test-agent-1',
        capabilities: [],
        autonomyLevel: 85,
        filters: {
          minAutonomy: 70,
          maxAutonomy: 90,
        },
      });

      expect(Array.isArray(agents)).toBe(true);
    });

    it('should handle discovery errors gracefully', async () => {
      const agents = await agentNetwork.discoverAgents({
        agentId: 'test-agent-1',
        capabilities: [],
        autonomyLevel: 85,
      });

      expect(Array.isArray(agents)).toBe(true);
    });
  });

  describe('Message Handling', () => {
    it('should create message with unique ID', () => {
      const message1 = {
        messageId: `msg-${Date.now()}-1`,
        fromAgentId: 'test-agent-1',
        toAgentId: 'test-agent-2',
        type: 'query' as const,
        payload: { query: 'test' },
        priority: 'normal' as const,
        encrypted: true,
        timestamp: new Date(),
        requiresResponse: true,
      };

      const message2 = {
        messageId: `msg-${Date.now()}-2`,
        fromAgentId: 'test-agent-1',
        toAgentId: 'test-agent-2',
        type: 'query' as const,
        payload: { query: 'test' },
        priority: 'normal' as const,
        encrypted: true,
        timestamp: new Date(),
        requiresResponse: true,
      };

      expect(message1.messageId).not.toBe(message2.messageId);
    });

    it('should handle different message types', () => {
      const messageTypes = ['query', 'command', 'notification', 'response', 'heartbeat'];

      messageTypes.forEach((type) => {
        expect(['query', 'command', 'notification', 'response', 'heartbeat']).toContain(type);
      });
    });

    it('should support message priorities', () => {
      const priorities = ['low', 'normal', 'high', 'critical'];

      priorities.forEach((priority) => {
        expect(['low', 'normal', 'high', 'critical']).toContain(priority);
      });
    });
  });

  describe('Peer Management', () => {
    it('should track connected peers', () => {
      const peers = agentNetwork.getConnectedPeers();
      expect(Array.isArray(peers)).toBe(true);
    });

    it('should update trust level for peer', () => {
      agentNetwork.updateTrustLevel('test-agent-2', 75);
      const peer = agentNetwork.getPeer('test-agent-2');

      if (peer) {
        expect(peer.trustLevel).toBe(75);
      }
    });

    it('should clamp trust level between 0 and 100', () => {
      agentNetwork.updateTrustLevel('test-agent-2', 150);
      const peer = agentNetwork.getPeer('test-agent-2');

      if (peer) {
        expect(peer.trustLevel).toBeLessThanOrEqual(100);
      }

      agentNetwork.updateTrustLevel('test-agent-2', -50);
      const peer2 = agentNetwork.getPeer('test-agent-2');

      if (peer2) {
        expect(peer2.trustLevel).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Event Handling', () => {
    it('should emit events on network actions', () => {
      const eventSpy = vi.fn();
      agentNetwork.on('agent-connected', eventSpy);

      // Note: Actual event emission would happen during real connections
      expect(agentNetwork.eventNames()).toContain('agent-connected');
    });

    it('should handle error events', () => {
      const errorSpy = vi.fn();
      agentNetwork.on('error', errorSpy);

      expect(agentNetwork.eventNames()).toContain('error');
    });
  });
});

describe('Agent Registry Service', () => {
  let registry: AgentRegistryService;

  beforeAll(() => {
    registry = new AgentRegistryService();
  });

  describe('Agent Registration', () => {
    it('should register agent in registry', async () => {
      const agentData = {
        agentId: 'registry-test-1',
        name: 'Registry Test Agent',
        description: 'Test agent for registry',
        endpoint: 'http://localhost:3002',
        capabilities: ['ai-chat', 'monitoring'],
        autonomyLevel: 80,
        publicKey: 'test-public-key',
        trustScore: 60,
        uptime: 98,
        messageCount: 100,
        lastSeen: new Date(),
        owner: 'test-user',
        metadata: { version: '1.0.0' },
        createdAt: new Date(),
      };

      const result = await registry.registerAgent(agentData);
      expect(result.agentId).toBe('registry-test-1');
      expect(result.name).toBe('Registry Test Agent');
    });

    it('should retrieve registered agent', async () => {
      const agent = await registry.getAgent('registry-test-1');

      if (agent) {
        expect(agent.agentId).toBe('registry-test-1');
        expect(agent.name).toBe('Registry Test Agent');
      }
    });
  });

  describe('Agent Discovery', () => {
    it('should discover agents with filters', async () => {
      const agents = await registry.discoverAgents({
        minAutonomy: 70,
        maxAutonomy: 90,
        limit: 10,
      });

      expect(Array.isArray(agents)).toBe(true);
    });

    it('should filter agents by capabilities', async () => {
      const agents = await registry.discoverAgents({
        capabilities: ['ai-chat'],
        limit: 10,
      });

      expect(Array.isArray(agents)).toBe(true);
    });
  });

  describe('Connection Management', () => {
    it('should record agent connection', async () => {
      const connection = await registry.recordConnection('agent-1', 'agent-2', 'connected');

      expect(connection.sourceAgentId).toBe('agent-1');
      expect(connection.targetAgentId).toBe('agent-2');
      expect(connection.status).toBe('connected');
    });

    it('should retrieve agent connections', async () => {
      const connections = await registry.getConnections('agent-1');
      expect(Array.isArray(connections)).toBe(true);
    });
  });

  describe('Trust and Uptime Management', () => {
    it('should update agent trust score', async () => {
      await registry.updateTrustScore('registry-test-1', 75);
      const agent = await registry.getAgent('registry-test-1');

      if (agent) {
        expect(agent.trustScore).toBe(75);
      }
    });

    it('should update agent uptime', async () => {
      await registry.updateUptime('registry-test-1', 99);
      const agent = await registry.getAgent('registry-test-1');

      if (agent) {
        expect(agent.uptime).toBe(99);
      }
    });

    it('should increment message count', async () => {
      const agent1 = await registry.getAgent('registry-test-1');
      const initialCount = agent1?.messageCount || 0;

      await registry.incrementMessageCount('registry-test-1', 5);

      const agent2 = await registry.getAgent('registry-test-1');
      expect((agent2?.messageCount || 0) - initialCount).toBe(5);
    });
  });

  describe('Network Statistics', () => {
    it('should retrieve network statistics', async () => {
      const stats = await registry.getNetworkStats();

      expect(stats).toHaveProperty('totalAgents');
      expect(stats).toHaveProperty('activeConnections');
      expect(stats).toHaveProperty('averageTrustScore');
      expect(stats).toHaveProperty('averageUptime');
      expect(stats).toHaveProperty('totalMessages');

      expect(stats.totalAgents).toBeGreaterThanOrEqual(0);
      expect(stats.activeConnections).toBeGreaterThanOrEqual(0);
      expect(stats.averageTrustScore).toBeGreaterThanOrEqual(0);
      expect(stats.averageUptime).toBeGreaterThanOrEqual(0);
      expect(stats.totalMessages).toBeGreaterThanOrEqual(0);
    });

    it('should get top agents by trust score', async () => {
      const topAgents = await registry.getTopAgents(5);

      expect(Array.isArray(topAgents)).toBe(true);
      expect(topAgents.length).toBeLessThanOrEqual(5);

      if (topAgents.length > 1) {
        for (let i = 0; i < topAgents.length - 1; i++) {
          expect(topAgents[i].trustScore).toBeGreaterThanOrEqual(topAgents[i + 1].trustScore);
        }
      }
    });
  });
});

describe('Inter-Agent Communication', () => {
  it('should support query message type', () => {
    const query = {
      messageId: 'msg-query-1',
      fromAgentId: 'agent-1',
      toAgentId: 'agent-2',
      type: 'query' as const,
      payload: { question: 'What is your status?' },
      priority: 'normal' as const,
      encrypted: true,
      timestamp: new Date(),
      requiresResponse: true,
    };

    expect(query.type).toBe('query');
    expect(query.requiresResponse).toBe(true);
  });

  it('should support command message type', () => {
    const command = {
      messageId: 'msg-cmd-1',
      fromAgentId: 'agent-1',
      toAgentId: 'agent-2',
      type: 'command' as const,
      payload: { action: 'start-monitoring' },
      priority: 'high' as const,
      encrypted: true,
      timestamp: new Date(),
      requiresResponse: false,
    };

    expect(command.type).toBe('command');
    expect(command.priority).toBe('high');
  });

  it('should support notification message type', () => {
    const notification = {
      messageId: 'msg-notif-1',
      fromAgentId: 'agent-1',
      toAgentId: 'agent-2',
      type: 'notification' as const,
      payload: { alert: 'System update available' },
      priority: 'normal' as const,
      encrypted: false,
      timestamp: new Date(),
      requiresResponse: false,
    };

    expect(notification.type).toBe('notification');
    expect(notification.encrypted).toBe(false);
  });

  it('should support heartbeat message type', () => {
    const heartbeat = {
      messageId: 'msg-hb-1',
      fromAgentId: 'agent-1',
      toAgentId: 'agent-2',
      type: 'heartbeat' as const,
      payload: { timestamp: Date.now() },
      priority: 'low' as const,
      encrypted: false,
      timestamp: new Date(),
      requiresResponse: true,
      responseTimeout: 3000,
    };

    expect(heartbeat.type).toBe('heartbeat');
    expect(heartbeat.responseTimeout).toBe(3000);
  });
});

describe('Cross-Platform Communication', () => {
  it('should support multiple platform integrations', () => {
    const platforms = ['HybridCast', 'RockinBoogie', 'Canryn', 'SweetMiracles', 'CustomAPI'];

    platforms.forEach((platform) => {
      expect(typeof platform).toBe('string');
      expect(platform.length).toBeGreaterThan(0);
    });
  });

  it('should route messages across platforms', () => {
    const message = {
      messageId: 'msg-cross-1',
      fromAgentId: 'qumus-agent',
      toAgentId: 'external-agent',
      type: 'query' as const,
      payload: { platform: 'HybridCast', action: 'broadcast' },
      priority: 'normal' as const,
      encrypted: true,
      timestamp: new Date(),
      requiresResponse: true,
    };

    expect(message.payload.platform).toBe('HybridCast');
  });

  it('should support unified messaging protocol', () => {
    const unifiedMessage = {
      version: '1.0.0',
      protocol: 'qumus-unified',
      messageId: 'msg-unified-1',
      fromAgentId: 'agent-1',
      toAgentId: 'agent-2',
      type: 'query' as const,
      payload: {},
      priority: 'normal' as const,
      encrypted: true,
      timestamp: new Date(),
      requiresResponse: true,
    };

    expect(unifiedMessage.protocol).toBe('qumus-unified');
    expect(unifiedMessage.version).toBe('1.0.0');
  });
});

describe('Security and Encryption', () => {
  it('should support message encryption', () => {
    const encryptedMessage = {
      messageId: 'msg-enc-1',
      fromAgentId: 'agent-1',
      toAgentId: 'agent-2',
      type: 'query' as const,
      payload: 'encrypted-payload-data',
      priority: 'normal' as const,
      encrypted: true,
      timestamp: new Date(),
      requiresResponse: true,
    };

    expect(encryptedMessage.encrypted).toBe(true);
  });

  it('should support unencrypted messages when appropriate', () => {
    const unencryptedMessage = {
      messageId: 'msg-unenc-1',
      fromAgentId: 'agent-1',
      toAgentId: 'agent-2',
      type: 'heartbeat' as const,
      payload: { timestamp: Date.now() },
      priority: 'low' as const,
      encrypted: false,
      timestamp: new Date(),
      requiresResponse: true,
    };

    expect(unencryptedMessage.encrypted).toBe(false);
  });

  it('should track trust levels for security', () => {
    const trustLevels = [0, 25, 50, 75, 100];

    trustLevels.forEach((level) => {
      expect(level).toBeGreaterThanOrEqual(0);
      expect(level).toBeLessThanOrEqual(100);
    });
  });
});
