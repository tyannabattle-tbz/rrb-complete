import { tyOSStatusFeed } from './tyOSStatusFeed';

/**
 * QUMUS Hierarchy Notifier
 * Broadcasts ecosystem structure and hierarchy to external systems
 * Enables other systems to understand the organizational architecture
 */

export interface HierarchyNode {
  id: string;
  name: string;
  type: 'organization' | 'subsystem' | 'service' | 'component' | 'channel';
  parent?: string;
  children: string[];
  capabilities: string[];
  status: 'operational' | 'degraded' | 'offline';
  metadata?: any;
}

export interface EcosystemStructure {
  id: string;
  name: string;
  version: string;
  timestamp: number;
  root: HierarchyNode;
  allNodes: Map<string, HierarchyNode>;
  relationships: Array<{ from: string; to: string; type: string }>;
}

export interface NotificationPayload {
  type: 'hierarchy_update' | 'status_change' | 'capability_change' | 'relationship_change';
  timestamp: number;
  source: string;
  data: any;
  recipients: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export class QUMUSHierarchyNotifier {
  private hierarchyStructure: EcosystemStructure | null = null;
  private notificationQueue: NotificationPayload[] = [];
  private externalSystems: Map<string, any> = new Map();
  private notificationInterval: NodeJS.Timeout | null = null;
  private maxQueueSize = 1000;

  constructor() {
    this.initializeHierarchy();
  }

  /**
   * Initialize ecosystem hierarchy
   */
  private initializeHierarchy() {
    console.log('[QUMUS Hierarchy Notifier] Initializing ecosystem structure...');

    // Create root node
    const rootNode: HierarchyNode = {
      id: 'ecosystem_root',
      name: 'Rockin Rockin Boogie Ecosystem',
      type: 'organization',
      children: ['qumus_brain', 'rrb_radio', 'hybridcast', 'canryn', 'sweet_miracles'],
      capabilities: ['orchestration', 'broadcasting', 'content_distribution', 'fundraising'],
      status: 'operational',
      metadata: {
        founded: 2024,
        owner: 'Canryn Production',
        mission: 'Autonomous ecosystem for content distribution and community support',
      },
    };

    // Create subsystem nodes
    const qumusBrain: HierarchyNode = {
      id: 'qumus_brain',
      name: 'QUMUS Control Center',
      type: 'subsystem',
      parent: 'ecosystem_root',
      children: ['qumus_hub', 'qumus_scheduler', 'qumus_learning', 'qumus_executor'],
      capabilities: ['autonomous_control', 'decision_making', 'policy_execution', 'system_monitoring'],
      status: 'operational',
      metadata: {
        autonomyLevel: '90%',
        policies: 20,
        subsystemsManaged: 18,
      },
    };

    const rrbRadio: HierarchyNode = {
      id: 'rrb_radio',
      name: 'RRB Radio',
      type: 'subsystem',
      parent: 'ecosystem_root',
      children: Array.from({ length: 54 }, (_, i) => `rrb_channel_${i + 1}`),
      capabilities: ['broadcasting', 'streaming', 'scheduling', 'metadata_management'],
      status: 'operational',
      metadata: {
        channels: 54,
        listeners: 3847,
        frequency: '432 Hz',
        uptime: '100%',
      },
    };

    const hybridCast: HierarchyNode = {
      id: 'hybridcast',
      name: 'HybridCast Emergency Broadcast',
      type: 'subsystem',
      parent: 'ecosystem_root',
      children: ['hybridcast_primary', 'hybridcast_mesh', 'hybridcast_emergency'],
      capabilities: ['emergency_broadcast', 'mesh_networking', 'offline_mode', 'signal_relay'],
      status: 'operational',
      metadata: {
        channels: 8,
        meshNodes: 50,
        coverage: 'global',
      },
    };

    const canryn: HierarchyNode = {
      id: 'canryn',
      name: 'Canryn Production',
      type: 'subsystem',
      parent: 'ecosystem_root',
      children: ['canryn_little_c', 'canryn_seans_music', 'canryn_annas', 'canryn_jaelon'],
      capabilities: ['content_creation', 'production', 'distribution', 'analytics'],
      status: 'operational',
      metadata: {
        subsidiaries: 4,
        contentTypes: ['podcast', 'music', 'video', 'commercial'],
      },
    };

    const sweetMiracles: HierarchyNode = {
      id: 'sweet_miracles',
      name: 'Sweet Miracles',
      type: 'subsystem',
      parent: 'ecosystem_root',
      children: ['sweet_miracles_fundraising', 'sweet_miracles_wellness', 'sweet_miracles_community'],
      capabilities: ['fundraising', 'donations', 'wellness_check', 'community_support'],
      status: 'operational',
      metadata: {
        classification: ['501c', '508'],
        focus: 'community_support',
      },
    };

    // Create channel nodes for RRB
    const rrbChannels: HierarchyNode[] = Array.from({ length: 54 }, (_, i) => ({
      id: `rrb_channel_${i + 1}`,
      name: `RRB Channel ${i + 1}`,
      type: 'channel',
      parent: 'rrb_radio',
      children: [],
      capabilities: ['broadcast', 'stream', 'metadata'],
      status: 'operational',
    }));

    // Build structure
    const allNodes = new Map<string, HierarchyNode>();
    allNodes.set(rootNode.id, rootNode);
    allNodes.set(qumusBrain.id, qumusBrain);
    allNodes.set(rrbRadio.id, rrbRadio);
    allNodes.set(hybridCast.id, hybridCast);
    allNodes.set(canryn.id, canryn);
    allNodes.set(sweetMiracles.id, sweetMiracles);

    rrbChannels.forEach((channel) => {
      allNodes.set(channel.id, channel);
    });

    // Create relationships
    const relationships = [
      { from: 'qumus_brain', to: 'rrb_radio', type: 'controls' },
      { from: 'qumus_brain', to: 'hybridcast', type: 'controls' },
      { from: 'qumus_brain', to: 'canryn', type: 'controls' },
      { from: 'qumus_brain', to: 'sweet_miracles', type: 'controls' },
      { from: 'rrb_radio', to: 'canryn', type: 'distributes_to' },
      { from: 'hybridcast', to: 'rrb_radio', type: 'integrates_with' },
      { from: 'canryn', to: 'sweet_miracles', type: 'supports' },
    ];

    this.hierarchyStructure = {
      id: 'ecosystem_structure_001',
      name: 'RRB Ecosystem Hierarchy',
      version: '1.0.0',
      timestamp: Date.now(),
      root: rootNode,
      allNodes,
      relationships,
    };

    console.log('[QUMUS Hierarchy Notifier] Ecosystem structure initialized with', allNodes.size, 'nodes');

    // Start notification loop
    this.startNotificationLoop();
  }

  /**
   * Start notification loop
   */
  private startNotificationLoop() {
    this.notificationInterval = setInterval(() => {
      this.broadcastNotifications();
    }, 60000); // Broadcast every minute
  }

  /**
   * Register external system
   */
  registerExternalSystem(systemId: string, config: { name: string; endpoint: string; capabilities: string[] }): void {
    this.externalSystems.set(systemId, {
      ...config,
      registeredAt: Date.now(),
      lastNotified: 0,
      notificationCount: 0,
    });

    console.log(`[QUMUS Hierarchy Notifier] External system registered: ${systemId}`);

    // Send initial hierarchy notification
    this.notifySystem(systemId, {
      type: 'hierarchy_update',
      timestamp: Date.now(),
      source: 'qumus_hierarchy_notifier',
      data: this.getHierarchyForExport(),
      recipients: [systemId],
      priority: 'high',
    });
  }

  /**
   * Notify a specific system
   */
  notifySystem(systemId: string, payload: Omit<NotificationPayload, 'recipients'>): void {
    const notification: NotificationPayload = {
      ...payload,
      recipients: [systemId],
    };

    this.notificationQueue.push(notification);

    if (this.notificationQueue.length > this.maxQueueSize) {
      this.notificationQueue.shift();
    }

    console.log(`[QUMUS Hierarchy Notifier] Notification queued for ${systemId}: ${payload.type}`);
  }

  /**
   * Broadcast notifications to all registered systems
   */
  private async broadcastNotifications(): Promise<void> {
    if (this.notificationQueue.length === 0) return;

    console.log(`[QUMUS Hierarchy Notifier] Broadcasting ${this.notificationQueue.length} notifications...`);

    for (const notification of this.notificationQueue) {
      for (const recipientId of notification.recipients) {
        const system = this.externalSystems.get(recipientId);
        if (system) {
          await this.deliverNotification(recipientId, notification, system);
        }
      }
    }

    this.notificationQueue = [];
  }

  /**
   * Deliver notification to external system
   */
  private async deliverNotification(systemId: string, notification: NotificationPayload, system: any): Promise<void> {
    try {
      // Simulate delivery
      console.log(`[QUMUS] Delivering ${notification.type} to ${systemId}`);

      system.lastNotified = Date.now();
      system.notificationCount++;

      await tyOSStatusFeed.logDecision(
        'hierarchy_notification',
        `Notified ${systemId}`,
        `Sent ${notification.type} with ${Object.keys(notification.data).length} data items`,
        { systemId, type: notification.type }
      );
    } catch (error) {
      console.error(`[QUMUS] Failed to notify ${systemId}:`, error);
    }
  }

  /**
   * Get hierarchy for export
   */
  getHierarchyForExport() {
    if (!this.hierarchyStructure) return null;

    return {
      id: this.hierarchyStructure.id,
      name: this.hierarchyStructure.name,
      version: this.hierarchyStructure.version,
      timestamp: this.hierarchyStructure.timestamp,
      root: this.serializeNode(this.hierarchyStructure.root),
      relationships: this.hierarchyStructure.relationships,
      summary: {
        totalNodes: this.hierarchyStructure.allNodes.size,
        subsystems: Array.from(this.hierarchyStructure.allNodes.values()).filter((n) => n.type === 'subsystem').length,
        channels: Array.from(this.hierarchyStructure.allNodes.values()).filter((n) => n.type === 'channel').length,
      },
    };
  }

  /**
   * Serialize node for transmission
   */
  private serializeNode(node: HierarchyNode): any {
    return {
      id: node.id,
      name: node.name,
      type: node.type,
      status: node.status,
      capabilities: node.capabilities,
      childCount: node.children.length,
      metadata: node.metadata,
    };
  }

  /**
   * Notify all systems of hierarchy change
   */
  async notifyHierarchyChange(change: any): Promise<void> {
    const notification: NotificationPayload = {
      type: 'hierarchy_update',
      timestamp: Date.now(),
      source: 'qumus_hierarchy_notifier',
      data: { change, hierarchy: this.getHierarchyForExport() },
      recipients: Array.from(this.externalSystems.keys()),
      priority: 'high',
    };

    this.notificationQueue.push(notification);
    console.log(`[QUMUS Hierarchy Notifier] Hierarchy change notification queued for ${this.externalSystems.size} systems`);
  }

  /**
   * Get registered external systems
   */
  getRegisteredSystems(): any[] {
    return Array.from(this.externalSystems.values());
  }

  /**
   * Get hierarchy structure
   */
  getHierarchyStructure(): EcosystemStructure | null {
    return this.hierarchyStructure;
  }

  /**
   * Get notification statistics
   */
  getNotificationStats() {
    return {
      registeredSystems: this.externalSystems.size,
      queuedNotifications: this.notificationQueue.length,
      totalNotificationsSent: Array.from(this.externalSystems.values()).reduce((sum, s) => sum + s.notificationCount, 0),
      systems: Array.from(this.externalSystems.entries()).map(([id, system]) => ({
        id,
        name: system.name,
        lastNotified: system.lastNotified,
        notificationCount: system.notificationCount,
      })),
    };
  }

  /**
   * Stop notifier
   */
  stop(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
    console.log('[QUMUS Hierarchy Notifier] Stopped');
  }
}

// Singleton instance
export const qumusHierarchyNotifier = new QUMUSHierarchyNotifier();
