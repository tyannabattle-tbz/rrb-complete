/**
 * Agent Registry Service
 * Central registry for agent discovery and management
 * Canryn Production and its subsidiaries
 */

import { getDb } from '../db';
import { agents, agentConnections } from '../../drizzle/schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';

export interface RegisteredAgent {
  agentId: string;
  name: string;
  description: string;
  endpoint: string;
  capabilities: string[];
  autonomyLevel: number;
  publicKey: string;
  trustScore: number;
  uptime: number;
  messageCount: number;
  lastSeen: Date;
  owner?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AgentConnectionRecord {
  connectionId: string;
  sourceAgentId: string;
  targetAgentId: string;
  status: 'connected' | 'disconnected' | 'pending' | 'failed';
  trustLevel: number;
  messageCount: number;
  lastCommunication: Date;
  encryptionEnabled: boolean;
  createdAt: Date;
}

export class AgentRegistryService {
  /**
   * Register agent in central registry
   */
  async registerAgent(agentData: RegisteredAgent): Promise<RegisteredAgent> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      const existingAgent = await db
        .select()
        .from(agents)
        .where(eq(agents.agentId, agentData.agentId))
        .limit(1);

      if (existingAgent.length > 0) {
        // Update existing agent
        await db
          .update(agents)
          .set({
            name: agentData.name,
            description: agentData.description,
            endpoint: agentData.endpoint,
            capabilities: JSON.stringify(agentData.capabilities),
            autonomyLevel: agentData.autonomyLevel,
            publicKey: agentData.publicKey,
            trustScore: agentData.trustScore,
            lastSeen: new Date(),
            metadata: agentData.metadata ? JSON.stringify(agentData.metadata) : null,
          })
          .where(eq(agents.agentId, agentData.agentId));
      } else {
        // Create new agent
        await db.insert(agents).values({
          agentId: agentData.agentId,
          name: agentData.name,
          description: agentData.description,
          endpoint: agentData.endpoint,
          capabilities: JSON.stringify(agentData.capabilities),
          autonomyLevel: agentData.autonomyLevel,
          publicKey: agentData.publicKey,
          trustScore: agentData.trustScore,
          uptime: 100,
          messageCount: 0,
          lastSeen: new Date(),
          owner: agentData.owner,
          metadata: agentData.metadata ? JSON.stringify(agentData.metadata) : null,
          createdAt: new Date(),
        });
      }

      return agentData;
    } catch (error) {
      console.error('Error registering agent:', error);
      throw error;
    }
  }

  /**
   * Discover agents matching criteria
   */
  async discoverAgents(filters: {
    capabilities?: string[];
    minAutonomy?: number;
    maxAutonomy?: number;
    excludeAgents?: string[];
    limit?: number;
  }): Promise<RegisteredAgent[]> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      let query = db.select().from(agents);

      // Filter by autonomy level
      if (filters.minAutonomy !== undefined) {
        query = query.where(gte(agents.autonomyLevel, filters.minAutonomy));
      }
      if (filters.maxAutonomy !== undefined) {
        query = query.where(lte(agents.autonomyLevel, filters.maxAutonomy));
      }

      // Exclude specific agents
      if (filters.excludeAgents && filters.excludeAgents.length > 0) {
        // Note: This would need proper implementation with NOT IN
      }

      const results = await query.limit(filters.limit || 50);

      // Filter by capabilities if provided
      let filtered = results;
      if (filters.capabilities && filters.capabilities.length > 0) {
        filtered = results.filter((agent) => {
          const agentCaps = JSON.parse(agent.capabilities || '[]');
          return filters.capabilities!.some((cap) => agentCaps.includes(cap));
        });
      }

      return filtered.map((agent) => ({
        agentId: agent.agentId,
        name: agent.name,
        description: agent.description || '',
        endpoint: agent.endpoint,
        capabilities: JSON.parse(agent.capabilities || '[]'),
        autonomyLevel: agent.autonomyLevel,
        publicKey: agent.publicKey,
        trustScore: agent.trustScore,
        uptime: agent.uptime,
        messageCount: agent.messageCount,
        lastSeen: agent.lastSeen,
        owner: agent.owner || undefined,
        metadata: agent.metadata ? JSON.parse(agent.metadata) : undefined,
        createdAt: agent.createdAt,
      }));
    } catch (error) {
      console.error('Error discovering agents:', error);
      throw error;
    }
  }

  /**
   * Get agent by ID
   */
  async getAgent(agentId: string): Promise<RegisteredAgent | null> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      const result = await db
        .select()
        .from(agents)
        .where(eq(agents.agentId, agentId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const agent = result[0];
      return {
        agentId: agent.agentId,
        name: agent.name,
        description: agent.description || '',
        endpoint: agent.endpoint,
        capabilities: JSON.parse(agent.capabilities || '[]'),
        autonomyLevel: agent.autonomyLevel,
        publicKey: agent.publicKey,
        trustScore: agent.trustScore,
        uptime: agent.uptime,
        messageCount: agent.messageCount,
        lastSeen: agent.lastSeen,
        owner: agent.owner || undefined,
        metadata: agent.metadata ? JSON.parse(agent.metadata) : undefined,
        createdAt: agent.createdAt,
      };
    } catch (error) {
      console.error('Error getting agent:', error);
      throw error;
    }
  }

  /**
   * Record agent connection
   */
  async recordConnection(
    sourceAgentId: string,
    targetAgentId: string,
    status: 'connected' | 'disconnected' | 'pending' | 'failed'
  ): Promise<AgentConnectionRecord> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      const connectionId = `${sourceAgentId}-${targetAgentId}`;
      const now = new Date();

      const existingConnection = await db
        .select()
        .from(agentConnections)
        .where(
          and(
            eq(agentConnections.sourceAgentId, sourceAgentId),
            eq(agentConnections.targetAgentId, targetAgentId)
          )
        )
        .limit(1);

      if (existingConnection.length > 0) {
        await db
          .update(agentConnections)
          .set({
            status,
            lastCommunication: now,
          })
          .where(
            and(
              eq(agentConnections.sourceAgentId, sourceAgentId),
              eq(agentConnections.targetAgentId, targetAgentId)
            )
          );
      } else {
        await db.insert(agentConnections).values({
          connectionId,
          sourceAgentId,
          targetAgentId,
          status,
          trustLevel: 50,
          messageCount: 0,
          encryptionEnabled: true,
          lastCommunication: now,
          createdAt: now,
        });
      }

      return {
        connectionId,
        sourceAgentId,
        targetAgentId,
        status,
        trustLevel: 50,
        messageCount: 0,
        lastCommunication: now,
        encryptionEnabled: true,
        createdAt: now,
      };
    } catch (error) {
      console.error('Error recording connection:', error);
      throw error;
    }
  }

  /**
   * Get agent connections
   */
  async getConnections(agentId: string): Promise<AgentConnectionRecord[]> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      const results = await db
        .select()
        .from(agentConnections)
        .where(eq(agentConnections.sourceAgentId, agentId));

      return results.map((conn) => ({
        connectionId: conn.connectionId,
        sourceAgentId: conn.sourceAgentId,
        targetAgentId: conn.targetAgentId,
        status: conn.status as 'connected' | 'disconnected' | 'pending' | 'failed',
        trustLevel: conn.trustLevel,
        messageCount: conn.messageCount,
        lastCommunication: conn.lastCommunication,
        encryptionEnabled: conn.encryptionEnabled,
        createdAt: conn.createdAt,
      }));
    } catch (error) {
      console.error('Error getting connections:', error);
      throw error;
    }
  }

  /**
   * Update agent trust score
   */
  async updateTrustScore(agentId: string, trustScore: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      await db
        .update(agents)
        .set({
          trustScore: Math.max(0, Math.min(100, trustScore)),
        })
        .where(eq(agents.agentId, agentId));
    } catch (error) {
      console.error('Error updating trust score:', error);
      throw error;
    }
  }

  /**
   * Update agent uptime
   */
  async updateUptime(agentId: string, uptime: number): Promise<void> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      await db
        .update(agents)
        .set({
          uptime: Math.max(0, Math.min(100, uptime)),
          lastSeen: new Date(),
        })
        .where(eq(agents.agentId, agentId));
    } catch (error) {
      console.error('Error updating uptime:', error);
      throw error;
    }
  }

  /**
   * Increment message count
   */
  async incrementMessageCount(agentId: string, count: number = 1): Promise<void> {
    try {
      const agent = await this.getAgent(agentId);
      if (agent) {
        await db
          .update(agents)
          .set({
            messageCount: agent.messageCount + count,
          })
          .where(eq(agents.agentId, agentId));
      }
    } catch (error) {
      console.error('Error incrementing message count:', error);
      throw error;
    }
  }

  /**
   * Get top agents by trust score
   */
  async getTopAgents(limit: number = 10): Promise<RegisteredAgent[]> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      const results = await db
        .select()
        .from(agents)
        .orderBy(agents.trustScore)
        .limit(limit);

      return results.map((agent) => ({
        agentId: agent.agentId,
        name: agent.name,
        description: agent.description || '',
        endpoint: agent.endpoint,
        capabilities: JSON.parse(agent.capabilities || '[]'),
        autonomyLevel: agent.autonomyLevel,
        publicKey: agent.publicKey,
        trustScore: agent.trustScore,
        uptime: agent.uptime,
        messageCount: agent.messageCount,
        lastSeen: agent.lastSeen,
        owner: agent.owner || undefined,
        metadata: agent.metadata ? JSON.parse(agent.metadata) : undefined,
        createdAt: agent.createdAt,
      }));
    } catch (error) {
      console.error('Error getting top agents:', error);
      throw error;
    }
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<{
    totalAgents: number;
    activeConnections: number;
    averageTrustScore: number;
    averageUptime: number;
    totalMessages: number;
  }> {
    try {
      const db = await getDb();
      if (!db) throw new Error('Database not initialized');
      
      const allAgents = await db.select().from(agents);
      const allConnections = await db.select().from(agentConnections);

      const activeConnections = allConnections.filter((c) => c.status === 'connected').length;
      const averageTrustScore =
        allAgents.length > 0
          ? allAgents.reduce((sum, a) => sum + a.trustScore, 0) / allAgents.length
          : 0;
      const averageUptime =
        allAgents.length > 0
          ? allAgents.reduce((sum, a) => sum + a.uptime, 0) / allAgents.length
          : 0;
      const totalMessages = allAgents.reduce((sum, a) => sum + a.messageCount, 0);

      return {
        totalAgents: allAgents.length,
        activeConnections,
        averageTrustScore,
        averageUptime,
        totalMessages,
      };
    } catch (error) {
      console.error('Error getting network stats:', error);
      throw error;
    }
  }
}
