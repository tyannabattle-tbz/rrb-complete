/**
 * QUMUS Subsystem Registry & Discovery Service
 * Maintains registry of all connected subsystems and enables auto-discovery
 */

export interface SubsystemCapability {
  name: string;
  description: string;
  parameters: Record<string, any>;
  responseSchema: Record<string, any>;
}

export interface RegisteredSubsystem {
  id: string;
  name: string;
  type: 'radio' | 'broadcast' | 'production' | 'nonprofit' | 'admin' | 'monitoring' | 'storage' | 'analytics';
  version: string;
  status: 'online' | 'offline' | 'degraded' | 'maintenance';
  capabilities: Map<string, SubsystemCapability>;
  endpoint: string;
  lastHeartbeat: number;
  healthScore: number;
  metadata: Record<string, any>;
}

class QUMUSSubsystemRegistry {
  private registry: Map<string, RegisteredSubsystem> = new Map();
  private discoveryLog: Array<{ timestamp: number; subsystem: string; event: string }> = [];
  private healthCheckInterval: NodeJS.Timer | null = null;

  constructor() {
    this.initializeDefaultSubsystems();
    this.startHealthChecking();
  }

  private initializeDefaultSubsystems() {
    // RRB Radio
    this.registerSubsystem({
      id: 'rrb-radio',
      name: 'RRB Radio',
      type: 'radio',
      version: '1.0.0',
      status: 'online',
      endpoint: 'https://rrb.manus.space/api',
      healthScore: 100,
      capabilities: new Map([
        [
          'broadcast',
          {
            name: 'Broadcast Control',
            description: 'Control radio broadcasts',
            parameters: { channel: 'string', action: 'string' },
            responseSchema: { success: 'boolean', message: 'string' },
          },
        ],
        [
          'channel-list',
          {
            name: 'Get Channels',
            description: 'List all available channels',
            parameters: {},
            responseSchema: { channels: 'array' },
          },
        ],
        [
          'listener-stats',
          {
            name: 'Listener Statistics',
            description: 'Get real-time listener statistics',
            parameters: { channel: 'string' },
            responseSchema: { listeners: 'number', uptime: 'number' },
          },
        ],
      ]),
      metadata: { channels: 54, listeners: 3847, uptime: '99.8%' },
    });

    // QUMUS Control Center
    this.registerSubsystem({
      id: 'qumus-control',
      name: 'QUMUS Control Center',
      type: 'admin',
      version: '2.0.0',
      status: 'online',
      endpoint: 'https://qumus.manus.space/api',
      healthScore: 100,
      capabilities: new Map([
        [
          'policy-management',
          {
            name: 'Policy Management',
            description: 'Manage QUMUS policies',
            parameters: { action: 'string', policy: 'object' },
            responseSchema: { success: 'boolean' },
          },
        ],
        [
          'system-status',
          {
            name: 'System Status',
            description: 'Get system status',
            parameters: {},
            responseSchema: { status: 'object' },
          },
        ],
      ]),
      metadata: { policies: 20, autonomy: '90%', subsystems: 20 },
    });

    // HybridCast
    this.registerSubsystem({
      id: 'hybridcast',
      name: 'HybridCast Emergency Broadcast',
      type: 'broadcast',
      version: '1.5.0',
      status: 'online',
      endpoint: 'https://hybridcast.manus.space/api',
      healthScore: 98,
      capabilities: new Map([
        [
          'emergency-broadcast',
          {
            name: 'Emergency Broadcast',
            description: 'Send emergency broadcasts',
            parameters: { message: 'string', priority: 'string' },
            responseSchema: { broadcastId: 'string', status: 'string' },
          },
        ],
        [
          'mesh-network',
          {
            name: 'Mesh Network',
            description: 'Manage mesh network',
            parameters: { action: 'string' },
            responseSchema: { nodes: 'array' },
          },
        ],
      ]),
      metadata: { regions: 12, uptime: '98.5%', meshNodes: 45 },
    });

    // Canryn Production
    this.registerSubsystem({
      id: 'canryn',
      name: 'Canryn Production',
      type: 'production',
      version: '1.2.0',
      status: 'online',
      endpoint: 'https://canryn.manus.space/api',
      healthScore: 99,
      capabilities: new Map([
        [
          'project-management',
          {
            name: 'Project Management',
            description: 'Manage production projects',
            parameters: { projectId: 'string', action: 'string' },
            responseSchema: { success: 'boolean', project: 'object' },
          },
        ],
        [
          'studio-control',
          {
            name: 'Studio Control',
            description: 'Control studio operations',
            parameters: { studioId: 'string', command: 'string' },
            responseSchema: { status: 'string' },
          },
        ],
      ]),
      metadata: { projects: 15, studios: 3, team: 12 },
    });

    // Sweet Miracles
    this.registerSubsystem({
      id: 'sweet-miracles',
      name: 'Sweet Miracles Nonprofit',
      type: 'nonprofit',
      version: '1.0.0',
      status: 'online',
      endpoint: 'https://sweetmiracles.manus.space/api',
      healthScore: 97,
      capabilities: new Map([
        [
          'donation-tracking',
          {
            name: 'Donation Tracking',
            description: 'Track donations',
            parameters: { donationId: 'string' },
            responseSchema: { donation: 'object', status: 'string' },
          },
        ],
        [
          'impact-reporting',
          {
            name: 'Impact Reporting',
            description: 'Generate impact reports',
            parameters: { period: 'string' },
            responseSchema: { report: 'object' },
          },
        ],
      ]),
      metadata: { donations: 1250, impact: '$125000', beneficiaries: 450 },
    });

    // Analytics Engine
    this.registerSubsystem({
      id: 'analytics-engine',
      name: 'Analytics Engine',
      type: 'analytics',
      version: '1.3.0',
      status: 'online',
      endpoint: 'https://analytics.manus.space/api',
      healthScore: 99,
      capabilities: new Map([
        [
          'generate-report',
          {
            name: 'Generate Report',
            description: 'Generate analytics reports',
            parameters: { type: 'string', period: 'string' },
            responseSchema: { report: 'object', timestamp: 'number' },
          },
        ],
        [
          'real-time-metrics',
          {
            name: 'Real-time Metrics',
            description: 'Get real-time metrics',
            parameters: { metric: 'string' },
            responseSchema: { value: 'number', timestamp: 'number' },
          },
        ],
      ]),
      metadata: { reports: 250, metrics: 500, uptime: '99.9%' },
    });

    console.log('[Registry] Default subsystems registered');
  }

  registerSubsystem(subsystem: Omit<RegisteredSubsystem, 'lastHeartbeat'>) {
    const registered: RegisteredSubsystem = {
      ...subsystem,
      lastHeartbeat: Date.now(),
    };

    this.registry.set(subsystem.id, registered);
    this.logDiscovery(subsystem.id, 'registered');
    console.log(`[Registry] Subsystem registered: ${subsystem.name} (${subsystem.id})`);
  }

  unregisterSubsystem(subsystemId: string) {
    this.registry.delete(subsystemId);
    this.logDiscovery(subsystemId, 'unregistered');
    console.log(`[Registry] Subsystem unregistered: ${subsystemId}`);
  }

  getSubsystem(subsystemId: string): RegisteredSubsystem | undefined {
    return this.registry.get(subsystemId);
  }

  getAllSubsystems(): RegisteredSubsystem[] {
    return Array.from(this.registry.values());
  }

  getSubsystemsByType(type: RegisteredSubsystem['type']): RegisteredSubsystem[] {
    return Array.from(this.registry.values()).filter((s) => s.type === type);
  }

  getOnlineSubsystems(): RegisteredSubsystem[] {
    return Array.from(this.registry.values()).filter((s) => s.status === 'online');
  }

  updateSubsystemStatus(subsystemId: string, status: RegisteredSubsystem['status']) {
    const subsystem = this.registry.get(subsystemId);
    if (subsystem) {
      subsystem.status = status;
      subsystem.lastHeartbeat = Date.now();
      this.logDiscovery(subsystemId, `status-changed-to-${status}`);
      console.log(`[Registry] Subsystem ${subsystemId} status updated to ${status}`);
    }
  }

  updateSubsystemHealth(subsystemId: string, healthScore: number) {
    const subsystem = this.registry.get(subsystemId);
    if (subsystem) {
      subsystem.healthScore = Math.max(0, Math.min(100, healthScore));
      subsystem.lastHeartbeat = Date.now();
    }
  }

  recordHeartbeat(subsystemId: string) {
    const subsystem = this.registry.get(subsystemId);
    if (subsystem) {
      subsystem.lastHeartbeat = Date.now();
      if (subsystem.status === 'offline') {
        subsystem.status = 'online';
        this.logDiscovery(subsystemId, 'came-online');
      }
    }
  }

  getSubsystemCapabilities(subsystemId: string): Map<string, SubsystemCapability> | undefined {
    const subsystem = this.registry.get(subsystemId);
    return subsystem?.capabilities;
  }

  addCapability(subsystemId: string, capabilityName: string, capability: SubsystemCapability) {
    const subsystem = this.registry.get(subsystemId);
    if (subsystem) {
      subsystem.capabilities.set(capabilityName, capability);
      console.log(`[Registry] Capability added to ${subsystemId}: ${capabilityName}`);
    }
  }

  removeCapability(subsystemId: string, capabilityName: string) {
    const subsystem = this.registry.get(subsystemId);
    if (subsystem) {
      subsystem.capabilities.delete(capabilityName);
    }
  }

  getRegistryStatus() {
    const subsystems = Array.from(this.registry.values());
    const onlineCount = subsystems.filter((s) => s.status === 'online').length;
    const avgHealth = subsystems.reduce((sum, s) => sum + s.healthScore, 0) / subsystems.length;

    return {
      totalSubsystems: subsystems.length,
      onlineSubsystems: onlineCount,
      offlineSubsystems: subsystems.filter((s) => s.status === 'offline').length,
      degradedSubsystems: subsystems.filter((s) => s.status === 'degraded').length,
      averageHealth: avgHealth.toFixed(2) + '%',
      subsystems: subsystems.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        status: s.status,
        health: s.healthScore,
        capabilities: s.capabilities.size,
      })),
    };
  }

  private logDiscovery(subsystemId: string, event: string) {
    this.discoveryLog.push({
      timestamp: Date.now(),
      subsystem: subsystemId,
      event,
    });

    if (this.discoveryLog.length > 1000) {
      this.discoveryLog.shift();
    }
  }

  getDiscoveryLog(limit: number = 50) {
    return this.discoveryLog.slice(-limit).reverse();
  }

  private startHealthChecking() {
    this.healthCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 1 minute

      for (const [id, subsystem] of this.registry) {
        if (now - subsystem.lastHeartbeat > timeout && subsystem.status === 'online') {
          subsystem.status = 'offline';
          this.logDiscovery(id, 'went-offline');
          console.warn(`[Registry] Subsystem went offline: ${id}`);
        }
      }
    }, 10000);
  }

  stopHealthChecking() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  discoverNewSubsystems(): RegisteredSubsystem[] {
    // In production, this would scan network or use service discovery
    console.log('[Registry] Scanning for new subsystems...');
    return this.getOnlineSubsystems();
  }
}

export const qumusSubsystemRegistry = new QUMUSSubsystemRegistry();
