/**
 * Emergency Broadcast Service
 * Handles crisis communication, emergency alerts, and offline-first broadcasting
 * Part of HybridCast integration for "A Voice for the Voiceless" platform
 */

export interface EmergencyBroadcast {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'health' | 'safety' | 'resource' | 'community' | 'weather' | 'other';
  createdAt: Date;
  expiresAt?: Date;
  authorId: number;
  status: 'draft' | 'published' | 'archived';
  recipientGroups: string[]; // ['everyone', 'vulnerable', 'volunteers', etc.]
  channels: ('sms' | 'push' | 'email' | 'broadcast' | 'mesh')[];
  attachments?: string[]; // URLs to resources
  metadata?: Record<string, any>;
}

export interface CrisisAlert {
  id: string;
  type: 'natural_disaster' | 'health_emergency' | 'security_threat' | 'resource_shortage' | 'community_support';
  location?: string;
  affectedPopulation?: number;
  resources?: string[];
  supportNeeded?: string[];
  status: 'active' | 'resolved' | 'monitoring';
  createdAt: Date;
  updatedAt: Date;
}

export interface WellnessCheckIn {
  id: string;
  userId: number;
  status: 'ok' | 'needs_help' | 'critical';
  location?: string;
  message?: string;
  timestamp: Date;
  respondedAt?: Date;
  responderNotes?: string;
}

export interface MeshNetworkNode {
  id: string;
  deviceId: string;
  location?: { lat: number; lng: number };
  status: 'online' | 'offline' | 'unreachable';
  signalStrength: number; // 0-100
  lastSeen: Date;
  capabilities: ('text' | 'voice' | 'data' | 'relay')[];
  metadata?: Record<string, any>;
}

/**
 * Emergency Broadcast Service
 */
export class EmergencyBroadcastService {
  /**
   * Create an emergency broadcast
   */
  static createBroadcast(data: Omit<EmergencyBroadcast, 'id' | 'createdAt'>): EmergencyBroadcast {
    return {
      ...data,
      id: `broadcast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };
  }

  /**
   * Publish a broadcast to all channels
   */
  static async publishBroadcast(broadcast: EmergencyBroadcast): Promise<{
    success: boolean;
    channelsNotified: string[];
    failedChannels: string[];
  }> {
    const channelsNotified: string[] = [];
    const failedChannels: string[] = [];

    for (const channel of broadcast.channels) {
      try {
        switch (channel) {
          case 'sms':
            // TODO: Send SMS via Twilio
            await this.sendSMS(broadcast);
            channelsNotified.push('sms');
            break;

          case 'push':
            // TODO: Send push notifications
            await this.sendPushNotifications(broadcast);
            channelsNotified.push('push');
            break;

          case 'email':
            // TODO: Send emails
            await this.sendEmails(broadcast);
            channelsNotified.push('email');
            break;

          case 'broadcast':
            // TODO: Broadcast via web/app
            await this.broadcastToWeb(broadcast);
            channelsNotified.push('broadcast');
            break;

          case 'mesh':
            // TODO: Send via mesh network
            await this.broadcastToMesh(broadcast);
            channelsNotified.push('mesh');
            break;
        }
      } catch (error) {
        console.error(`Failed to send via ${channel}:`, error);
        failedChannels.push(channel);
      }
    }

    return { success: failedChannels.length === 0, channelsNotified, failedChannels };
  }

  /**
   * Create a crisis alert
   */
  static createCrisisAlert(data: Omit<CrisisAlert, 'id' | 'createdAt' | 'updatedAt'>): CrisisAlert {
    const now = new Date();
    return {
      ...data,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Record a wellness check-in
   */
  static recordWellnessCheckIn(
    userId: number,
    status: 'ok' | 'needs_help' | 'critical',
    message?: string,
    location?: { lat: number; lng: number }
  ): WellnessCheckIn {
    return {
      id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      status,
      message,
      location,
      timestamp: new Date(),
    };
  }

  /**
   * Get wellness status summary
   */
  static getWellnessSummary(checkIns: WellnessCheckIn[]): {
    total: number;
    ok: number;
    needsHelp: number;
    critical: number;
    percentage: { ok: number; needsHelp: number; critical: number };
  } {
    const summary = {
      total: checkIns.length,
      ok: checkIns.filter((c) => c.status === 'ok').length,
      needsHelp: checkIns.filter((c) => c.status === 'needs_help').length,
      critical: checkIns.filter((c) => c.status === 'critical').length,
      percentage: { ok: 0, needsHelp: 0, critical: 0 },
    };

    if (summary.total > 0) {
      summary.percentage.ok = Math.round((summary.ok / summary.total) * 100);
      summary.percentage.needsHelp = Math.round((summary.needsHelp / summary.total) * 100);
      summary.percentage.critical = Math.round((summary.critical / summary.total) * 100);
    }

    return summary;
  }

  /**
   * Register a mesh network node
   */
  static registerMeshNode(
    deviceId: string,
    capabilities: ('text' | 'voice' | 'data' | 'relay')[] = ['text']
  ): MeshNetworkNode {
    return {
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      deviceId,
      status: 'online',
      signalStrength: 100,
      lastSeen: new Date(),
      capabilities,
    };
  }

  /**
   * Update mesh node status
   */
  static updateMeshNodeStatus(
    node: MeshNetworkNode,
    status: 'online' | 'offline' | 'unreachable',
    signalStrength?: number
  ): MeshNetworkNode {
    return {
      ...node,
      status,
      signalStrength: signalStrength ?? node.signalStrength,
      lastSeen: new Date(),
    };
  }

  /**
   * Get mesh network topology
   */
  static getMeshTopology(nodes: MeshNetworkNode[]): {
    totalNodes: number;
    onlineNodes: number;
    offlineNodes: number;
    averageSignalStrength: number;
    capabilities: Set<string>;
  } {
    const onlineNodes = nodes.filter((n) => n.status === 'online');
    const capabilities = new Set<string>();

    nodes.forEach((n) => {
      n.capabilities.forEach((c) => capabilities.add(c));
    });

    const avgSignal =
      onlineNodes.length > 0
        ? Math.round(onlineNodes.reduce((sum, n) => sum + n.signalStrength, 0) / onlineNodes.length)
        : 0;

    return {
      totalNodes: nodes.length,
      onlineNodes: onlineNodes.length,
      offlineNodes: nodes.length - onlineNodes.length,
      averageSignalStrength: avgSignal,
      capabilities,
    };
  }

  // Private helper methods

  private static async sendSMS(broadcast: EmergencyBroadcast): Promise<void> {
    // TODO: Implement Twilio SMS sending
    console.log(`[SMS] Sending broadcast: ${broadcast.title}`);
  }

  private static async sendPushNotifications(broadcast: EmergencyBroadcast): Promise<void> {
    // TODO: Implement push notification sending
    console.log(`[Push] Sending broadcast: ${broadcast.title}`);
  }

  private static async sendEmails(broadcast: EmergencyBroadcast): Promise<void> {
    // TODO: Implement email sending
    console.log(`[Email] Sending broadcast: ${broadcast.title}`);
  }

  private static async broadcastToWeb(broadcast: EmergencyBroadcast): Promise<void> {
    // TODO: Implement web broadcast
    console.log(`[Web] Broadcasting: ${broadcast.title}`);
  }

  private static async broadcastToMesh(broadcast: EmergencyBroadcast): Promise<void> {
    // TODO: Implement mesh network broadcasting
    console.log(`[Mesh] Broadcasting: ${broadcast.title}`);
  }
}

/**
 * Severity levels and their meanings
 */
export const SEVERITY_LEVELS = {
  low: { label: 'Low', color: '#4CAF50', icon: 'info' },
  medium: { label: 'Medium', color: '#FF9800', icon: 'warning' },
  high: { label: 'High', color: '#F44336', icon: 'alert' },
  critical: { label: 'Critical', color: '#8B0000', icon: 'emergency' },
};

/**
 * Alert categories
 */
export const ALERT_CATEGORIES = {
  health: { label: 'Health Emergency', icon: 'medical' },
  safety: { label: 'Safety Alert', icon: 'security' },
  resource: { label: 'Resource Alert', icon: 'resources' },
  community: { label: 'Community Support', icon: 'community' },
  weather: { label: 'Weather Alert', icon: 'weather' },
  other: { label: 'Other', icon: 'info' },
};
