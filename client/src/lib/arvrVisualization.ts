/**
 * AR/VR Visualization Engine
 * Real-time 3D visualization of QUMUS decisions, agent status, and ecosystem metrics
 * Supports AR (mobile) and VR (headsets) modes
 */

export type VisualizationMode = 'ar' | 'vr' | '3d' | 'hologram';
export type EntityType = 'agent' | 'decision' | 'channel' | 'subsystem' | 'creator' | 'content' | 'wildlife';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Entity3D {
  id: string;
  type: EntityType;
  name: string;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  color: string;
  opacity: number;
  metadata: Record<string, any>;
  isActive: boolean;
  lastUpdate: number;
}

export interface Decision3D extends Entity3D {
  agent: string;
  action: string;
  confidence: number;
  impact: number;
  timestamp: number;
  trajectory?: Vector3[];
}

export interface Agent3D extends Entity3D {
  agent: 'valanna' | 'candy' | 'seraph' | 'qumus';
  status: 'active' | 'idle' | 'processing' | 'error';
  autonomyLevel: number;
  decisions: number;
  efficiency: number;
}

export interface Subsystem3D extends Entity3D {
  subsystem: string;
  health: number;
  uptime: number;
  connectedSystems: string[];
}

export interface Channel3D extends Entity3D {
  channel: string;
  listeners: number;
  content: string;
  frequency?: number;
}

export class ARVRVisualization {
  private mode: VisualizationMode = '3d';
  private entities: Map<string, Entity3D> = new Map();
  private decisions: Decision3D[] = [];
  private agents: Agent3D[] = [];
  private subsystems: Subsystem3D[] = [];
  private channels: Channel3D[] = [];
  private camera: Vector3 = { x: 0, y: 5, z: 10 };
  private isInitialized = false;

  constructor(mode: VisualizationMode = '3d') {
    this.mode = mode;
    this.initialize();
  }

  /**
   * Initialize visualization
   */
  private initialize() {
    console.log(`[AR/VR Visualization] Initializing in ${this.mode} mode`);

    // Create agent entities
    this.createAgentEntities();

    // Create subsystem entities
    this.createSubsystemEntities();

    // Create channel entities
    this.createChannelEntities();

    this.isInitialized = true;
    console.log('[AR/VR Visualization] Ready for visualization');
  }

  /**
   * Create agent 3D entities
   */
  private createAgentEntities() {
    const agents = [
      { name: 'Valanna', color: '#FF6B9D' },
      { name: 'Candy', color: '#00D4FF' },
      { name: 'Seraph', color: '#FFD700' },
      { name: 'QUMUS', color: '#00FF00' },
    ];

    agents.forEach((agent, index) => {
      const agent3D: Agent3D = {
        id: `agent_${agent.name.toLowerCase()}`,
        type: 'agent',
        name: agent.name,
        position: {
          x: Math.cos((index / agents.length) * Math.PI * 2) * 5,
          y: 2,
          z: Math.sin((index / agents.length) * Math.PI * 2) * 5,
        },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
        color: agent.color,
        opacity: 1,
        metadata: {},
        isActive: true,
        lastUpdate: Date.now(),
        agent: agent.name.toLowerCase() as any,
        status: 'active',
        autonomyLevel: 90,
        decisions: 0,
        efficiency: 95,
      };

      this.agents.push(agent3D);
      this.entities.set(agent3D.id, agent3D);
    });
  }

  /**
   * Create subsystem 3D entities
   */
  private createSubsystemEntities() {
    const subsystems = [
      'Stream Engine',
      'Database',
      'Cache',
      'API Gateway',
      'Notifications',
      'Webhooks',
    ];

    subsystems.forEach((subsystem, index) => {
      const subsystem3D: Subsystem3D = {
        id: `subsystem_${subsystem.toLowerCase().replace(' ', '_')}`,
        type: 'subsystem',
        name: subsystem,
        position: {
          x: (index % 3) * 3 - 3,
          y: 0,
          z: Math.floor(index / 3) * 3,
        },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 0.8, y: 0.8, z: 0.8 },
        color: '#4A90E2',
        opacity: 0.8,
        metadata: {},
        isActive: true,
        lastUpdate: Date.now(),
        subsystem,
        health: 100,
        uptime: 99.9,
        connectedSystems: [],
      };

      this.subsystems.push(subsystem3D);
      this.entities.set(subsystem3D.id, subsystem3D);
    });
  }

  /**
   * Create channel 3D entities
   */
  private createChannelEntities() {
    const channels = [
      { name: 'RRB Radio', frequency: 432 },
      { name: 'QUMUS', frequency: 528 },
      { name: 'HybridCast', frequency: 639 },
      { name: 'Canryn', frequency: 741 },
      { name: 'Sweet Miracles', frequency: 852 },
    ];

    channels.forEach((channel, index) => {
      const channel3D: Channel3D = {
        id: `channel_${channel.name.toLowerCase().replace(' ', '_')}`,
        type: 'channel',
        name: channel.name,
        position: {
          x: Math.cos((index / channels.length) * Math.PI * 2) * 8,
          y: 3,
          z: Math.sin((index / channels.length) * Math.PI * 2) * 8,
        },
        rotation: { x: 0, y: (index / channels.length) * Math.PI * 2, z: 0 },
        scale: { x: 1.2, y: 1.2, z: 1.2 },
        color: '#7B68EE',
        opacity: 0.9,
        metadata: {},
        isActive: true,
        lastUpdate: Date.now(),
        channel: channel.name,
        listeners: Math.floor(Math.random() * 10000),
        content: 'Live',
        frequency: channel.frequency,
      };

      this.channels.push(channel3D);
      this.entities.set(channel3D.id, channel3D);
    });
  }

  /**
   * Add decision to visualization
   */
  addDecision(
    agent: string,
    action: string,
    confidence: number,
    impact: number,
  ): Decision3D {
    const decision: Decision3D = {
      id: `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'decision',
      name: action,
      position: { x: Math.random() * 10 - 5, y: Math.random() * 10, z: Math.random() * 10 - 5 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 0.5, y: 0.5, z: 0.5 },
      color: this.getAgentColor(agent),
      opacity: confidence / 100,
      metadata: {},
      isActive: true,
      lastUpdate: Date.now(),
      agent,
      action,
      confidence,
      impact,
      timestamp: Date.now(),
      trajectory: [],
    };

    this.decisions.push(decision);
    this.entities.set(decision.id, decision);

    // Animate decision
    this.animateDecision(decision);

    return decision;
  }

  /**
   * Animate decision trajectory
   */
  private animateDecision(decision: Decision3D) {
    const targetAgent = this.agents.find((a) => a.agent === decision.agent);
    if (!targetAgent) return;

    // Create trajectory from decision to agent
    const steps = 10;
    decision.trajectory = [];

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      decision.trajectory.push({
        x: decision.position.x + (targetAgent.position.x - decision.position.x) * t,
        y: decision.position.y + (targetAgent.position.y - decision.position.y) * t,
        z: decision.position.z + (targetAgent.position.z - decision.position.z) * t,
      });
    }
  }

  /**
   * Get agent color
   */
  private getAgentColor(agent: string): string {
    const colors: Record<string, string> = {
      valanna: '#FF6B9D',
      candy: '#00D4FF',
      seraph: '#FFD700',
      qumus: '#00FF00',
    };
    return colors[agent.toLowerCase()] || '#FFFFFF';
  }

  /**
   * Update agent status
   */
  updateAgentStatus(
    agent: string,
    status: 'active' | 'idle' | 'processing' | 'error',
    efficiency: number,
  ) {
    const agentEntity = this.agents.find((a) => a.agent === agent.toLowerCase() as any);
    if (agentEntity) {
      agentEntity.status = status;
      agentEntity.efficiency = efficiency;
      agentEntity.lastUpdate = Date.now();

      // Change color based on status
      if (status === 'error') {
        agentEntity.color = '#FF0000';
      } else if (status === 'processing') {
        agentEntity.color = '#FFA500';
      }
    }
  }

  /**
   * Update subsystem health
   */
  updateSubsystemHealth(subsystem: string, health: number) {
    const subsystemEntity = this.subsystems.find((s) => s.subsystem === subsystem);
    if (subsystemEntity) {
      subsystemEntity.health = health;
      subsystemEntity.lastUpdate = Date.now();

      // Change color based on health
      if (health < 50) {
        subsystemEntity.color = '#FF0000';
      } else if (health < 75) {
        subsystemEntity.color = '#FFA500';
      } else {
        subsystemEntity.color = '#4A90E2';
      }
    }
  }

  /**
   * Update channel listeners
   */
  updateChannelListeners(channel: string, listeners: number) {
    const channelEntity = this.channels.find((c) => c.channel === channel);
    if (channelEntity) {
      channelEntity.listeners = listeners;
      channelEntity.lastUpdate = Date.now();

      // Scale based on listener count
      const maxListeners = 100000;
      const scale = 1 + (listeners / maxListeners) * 0.5;
      channelEntity.scale = { x: scale, y: scale, z: scale };
    }
  }

  /**
   * Get visualization data
   */
  getVisualizationData() {
    return {
      mode: this.mode,
      camera: this.camera,
      entities: Array.from(this.entities.values()),
      agents: this.agents,
      subsystems: this.subsystems,
      channels: this.channels,
      decisions: this.decisions.slice(-50), // Last 50 decisions
      stats: {
        totalEntities: this.entities.size,
        activeAgents: this.agents.filter((a) => a.status === 'active').length,
        healthySubsystems: this.subsystems.filter((s) => s.health > 90).length,
        totalListeners: this.channels.reduce((sum, c) => sum + c.listeners, 0),
      },
    };
  }

  /**
   * Switch visualization mode
   */
  switchMode(mode: VisualizationMode) {
    this.mode = mode;
    console.log(`[AR/VR Visualization] Switched to ${mode} mode`);
  }

  /**
   * Get mode
   */
  getMode(): VisualizationMode {
    return this.mode;
  }

  /**
   * Clean old decisions
   */
  cleanOldDecisions(maxAge: number = 300000) {
    // Keep decisions younger than 5 minutes
    const now = Date.now();
    this.decisions = this.decisions.filter((d) => now - d.timestamp < maxAge);

    // Remove old entities
    this.decisions.forEach((d) => {
      if (now - d.lastUpdate > maxAge) {
        this.entities.delete(d.id);
      }
    });
  }
}

// Singleton instance
export const arvrVisualization = new ARVRVisualization('3d');
