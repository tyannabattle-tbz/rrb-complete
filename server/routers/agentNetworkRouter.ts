/**
 * Agent Network Router
 * tRPC endpoints for agent discovery, connection, and messaging
 * Canryn Production and its subsidiaries
 */

import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { z } from 'zod';
import { AgentNetworkService, AgentMessage, AgentDiscoveryRequest } from '../services/agentNetworkService';
import { AgentRegistryService } from '../services/agentRegistryService';

const agentNetworkService = new AgentNetworkService(
  process.env.QUMUS_AGENT_ID || 'qumus-default',
  process.env.QUMUS_AGENT_NAME || 'QUMUS Default Agent',
  process.env.QUMUS_AGENT_ENDPOINT || 'http://localhost:3000',
  ['ai-chat', 'autonomous-decision', 'monitoring', 'integration'],
  90
);

const agentRegistryService = new AgentRegistryService();

export const agentNetworkRouter = router({
  /**
   * Register this agent in the network
   */
  registerAgent: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        capabilities: z.array(z.string()),
        autonomyLevel: z.number().min(0).max(100),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const agentData = {
          agentId: process.env.QUMUS_AGENT_ID || 'qumus-default',
          name: input.name,
          description: input.description,
          endpoint: process.env.QUMUS_AGENT_ENDPOINT || 'http://localhost:3000',
          capabilities: input.capabilities,
          autonomyLevel: input.autonomyLevel,
          publicKey: agentNetworkService.getIdentity().publicKey,
          trustScore: 50,
          uptime: 100,
          messageCount: 0,
          lastSeen: new Date(),
          owner: ctx.user.id.toString(),
          metadata: input.metadata,
          createdAt: new Date(),
        };

        await agentRegistryService.registerAgent(agentData);
        await agentNetworkService.registerWithRegistry();

        return {
          success: true,
          agentId: agentData.agentId,
          message: 'Agent registered successfully',
        };
      } catch (error) {
        console.error('Error registering agent:', error);
        throw new Error('Failed to register agent');
      }
    }),

  /**
   * Discover agents in the network
   */
  discoverAgents: publicProcedure
    .input(
      z.object({
        capabilities: z.array(z.string()).optional(),
        minAutonomy: z.number().min(0).max(100).optional(),
        maxAutonomy: z.number().min(0).max(100).optional(),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const discoveryRequest: AgentDiscoveryRequest = {
          agentId: process.env.QUMUS_AGENT_ID || 'qumus-default',
          capabilities: input.capabilities || [],
          autonomyLevel: 90,
          filters: {
            minAutonomy: input.minAutonomy,
            maxAutonomy: input.maxAutonomy,
          },
        };

        const agents = await agentNetworkService.discoverAgents(discoveryRequest);
        return {
          success: true,
          agents,
          count: agents.length,
        };
      } catch (error) {
        console.error('Error discovering agents:', error);
        throw new Error('Failed to discover agents');
      }
    }),

  /**
   * Connect to another agent
   */
  connectToAgent: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const agentRegistry = await agentRegistryService.getAgent(input.agentId);

        if (!agentRegistry) {
          throw new Error('Agent not found in registry');
        }

        const peer = await agentNetworkService.connectToAgent(agentRegistry);

        if (!peer) {
          throw new Error('Failed to connect to agent');
        }

        await agentRegistryService.recordConnection(
          process.env.QUMUS_AGENT_ID || 'qumus-default',
          input.agentId,
          'connected'
        );

        return {
          success: true,
          peerId: peer.peerId,
          status: peer.status,
          trustLevel: peer.trustLevel,
          sharedCapabilities: peer.sharedCapabilities,
        };
      } catch (error) {
        console.error('Error connecting to agent:', error);
        throw new Error('Failed to connect to agent');
      }
    }),

  /**
   * Send message to another agent
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        toAgentId: z.string(),
        type: z.enum(['query', 'command', 'notification']),
        payload: z.record(z.any()),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal'),
        encrypted: z.boolean().default(true),
        requiresResponse: z.boolean().default(false),
        responseTimeout: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const message: AgentMessage = {
          messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fromAgentId: process.env.QUMUS_AGENT_ID || 'qumus-default',
          toAgentId: input.toAgentId,
          type: input.type,
          payload: input.payload,
          priority: input.priority,
          encrypted: input.encrypted,
          timestamp: new Date(),
          requiresResponse: input.requiresResponse,
          responseTimeout: input.responseTimeout,
        };

        const success = await agentNetworkService.sendMessage(message);

        if (!success) {
          throw new Error('Failed to send message');
        }

        await agentRegistryService.incrementMessageCount(process.env.QUMUS_AGENT_ID || 'qumus-default');

        return {
          success: true,
          messageId: message.messageId,
          status: 'sent',
        };
      } catch (error) {
        console.error('Error sending message:', error);
        throw new Error('Failed to send message');
      }
    }),

  /**
   * Get connected peers
   */
  getConnectedPeers: protectedProcedure.query(async () => {
    try {
      const peers = agentNetworkService.getConnectedPeers();

      return {
        success: true,
        peers: peers.map((p) => ({
          peerId: p.peerId,
          agentId: p.agentIdentity.agentId,
          agentName: p.agentIdentity.name,
          status: p.status,
          trustLevel: p.trustLevel,
          sharedCapabilities: p.sharedCapabilities,
          lastCommunication: p.lastCommunication,
        })),
        count: peers.length,
      };
    } catch (error) {
      console.error('Error getting connected peers:', error);
      throw new Error('Failed to get connected peers');
    }
  }),

  /**
   * Get agent network statistics
   */
  getNetworkStats: publicProcedure.query(async () => {
    try {
      const stats = await agentRegistryService.getNetworkStats();

      return {
        success: true,
        stats: {
          totalAgents: stats.totalAgents,
          activeConnections: stats.activeConnections,
          averageTrustScore: Math.round(stats.averageTrustScore * 100) / 100,
          averageUptime: Math.round(stats.averageUptime * 100) / 100,
          totalMessages: stats.totalMessages,
        },
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      throw new Error('Failed to get network statistics');
    }
  }),

  /**
   * Get top agents by trust score
   */
  getTopAgents: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const agents = await agentRegistryService.getTopAgents(input.limit);

        return {
          success: true,
          agents: agents.map((a) => ({
            agentId: a.agentId,
            name: a.name,
            description: a.description,
            capabilities: a.capabilities,
            autonomyLevel: a.autonomyLevel,
            trustScore: a.trustScore,
            uptime: a.uptime,
            messageCount: a.messageCount,
          })),
          count: agents.length,
        };
      } catch (error) {
        console.error('Error getting top agents:', error);
        throw new Error('Failed to get top agents');
      }
    }),

  /**
   * Get agent connections
   */
  getConnections: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const agentId = input.agentId || process.env.QUMUS_AGENT_ID || 'qumus-default';
        const connections = await agentRegistryService.getConnections(agentId);

        return {
          success: true,
          connections: connections.map((c) => ({
            connectionId: c.connectionId,
            sourceAgentId: c.sourceAgentId,
            targetAgentId: c.targetAgentId,
            status: c.status,
            trustLevel: c.trustLevel,
            messageCount: c.messageCount,
            lastCommunication: c.lastCommunication,
            encryptionEnabled: c.encryptionEnabled,
          })),
          count: connections.length,
        };
      } catch (error) {
        console.error('Error getting connections:', error);
        throw new Error('Failed to get connections');
      }
    }),

  /**
   * Disconnect from an agent
   */
  disconnectFromAgent: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await agentNetworkService.disconnectFromPeer(input.agentId);

        await agentRegistryService.recordConnection(
          process.env.QUMUS_AGENT_ID || 'qumus-default',
          input.agentId,
          'disconnected'
        );

        return {
          success: true,
          message: 'Disconnected from agent',
        };
      } catch (error) {
        console.error('Error disconnecting from agent:', error);
        throw new Error('Failed to disconnect from agent');
      }
    }),

  /**
   * Get agent identity
   */
  getAgentIdentity: publicProcedure.query(async () => {
    try {
      const identity = agentNetworkService.getIdentity();

      return {
        success: true,
        identity: {
          agentId: identity.agentId,
          name: identity.name,
          version: identity.version,
          autonomyLevel: identity.autonomyLevel,
          capabilities: identity.capabilities,
          endpoint: identity.endpoint,
          createdAt: identity.createdAt,
        },
      };
    } catch (error) {
      console.error('Error getting agent identity:', error);
      throw new Error('Failed to get agent identity');
    }
  }),

  /**
   * Update agent trust level
   */
  updateTrustLevel: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        trustLevel: z.number().min(0).max(100),
      })
    )
    .mutation(async ({ input }) => {
      try {
        agentNetworkService.updateTrustLevel(input.agentId, input.trustLevel);
        await agentRegistryService.updateTrustScore(input.agentId, input.trustLevel);

        return {
          success: true,
          message: 'Trust level updated',
        };
      } catch (error) {
        console.error('Error updating trust level:', error);
        throw new Error('Failed to update trust level');
      }
    }),
});
