/**
 * Cross-Platform Communication Service
 * Unified messaging protocol for HybridCast, RockinBoogie, Canryn, SweetMiracles
 * Canryn Production and its subsidiaries
 */

import { invokeLLM } from '../_core/llm';

export interface CrossPlatformMessage {
  messageId: string;
  sourceAgent: string;
  targetPlatforms: string[];
  content: string;
  contentType: 'text' | 'audio' | 'video' | 'broadcast' | 'notification';
  priority: 'low' | 'normal' | 'high' | 'critical';
  metadata: Record<string, any>;
  timestamp: Date;
  encryption: {
    enabled: boolean;
    algorithm: string;
  };
}

export interface PlatformAdapter {
  name: string;
  endpoint: string;
  capabilities: string[];
  isAvailable: boolean;
  lastHealthCheck: Date;
  messageQueue: CrossPlatformMessage[];
}

export interface MessageRoute {
  sourceAgent: string;
  targetPlatforms: string[];
  messageId: string;
  status: 'pending' | 'routing' | 'delivered' | 'failed';
  attempts: number;
  lastAttempt: Date;
  error?: string;
}

export class CrossPlatformCommunicationService {
  private platformAdapters: Map<string, PlatformAdapter> = new Map();
  private messageRoutes: Map<string, MessageRoute> = new Map();
  private messageQueue: CrossPlatformMessage[] = [];

  constructor() {
    this.initializePlatforms();
    this.startHealthChecks();
    this.startMessageProcessor();
  }

  /**
   * Initialize platform adapters
   */
  private initializePlatforms(): void {
    const platforms = [
      {
        name: 'HybridCast',
        endpoint: process.env.HYBRIDCAST_ENDPOINT || 'https://hybridcast.manus.io/api',
        capabilities: ['emergency-broadcast', 'mesh-networking', 'offline-support', 'real-time-streaming'],
      },
      {
        name: 'RockinBoogie',
        endpoint: process.env.ROCKINBOOGIE_ENDPOINT || 'https://rockinboogie.manus.io/api',
        capabilities: ['audio-streaming', 'podcast-management', 'radio-stations', 'playlist-sync'],
      },
      {
        name: 'Canryn',
        endpoint: process.env.CANRYN_ENDPOINT || 'https://canryn.manus.io/api',
        capabilities: ['enterprise-management', 'policy-enforcement', 'compliance-tracking', 'audit-logging'],
      },
      {
        name: 'SweetMiracles',
        endpoint: process.env.SWEETMIRACLES_ENDPOINT || 'https://sweetmiracles.manus.io/api',
        capabilities: ['community-engagement', 'wellness-tracking', 'social-features', 'accessibility'],
      },
    ];

    platforms.forEach((platform) => {
      this.platformAdapters.set(platform.name, {
        name: platform.name,
        endpoint: platform.endpoint,
        capabilities: platform.capabilities,
        isAvailable: true,
        lastHealthCheck: new Date(),
        messageQueue: [],
      });
    });
  }

  /**
   * Send message across platforms
   */
  async sendCrossPlatformMessage(message: CrossPlatformMessage): Promise<{
    messageId: string;
    routedTo: string[];
    status: string;
  }> {
    try {
      const messageId = message.messageId || this.generateMessageId();
      const routedPlatforms: string[] = [];

      // Validate message
      this.validateMessage(message);

      // Route to specified platforms
      for (const platform of message.targetPlatforms) {
        const adapter = this.platformAdapters.get(platform);
        if (!adapter) {
          console.warn(`Platform ${platform} not found`);
          continue;
        }

        if (!adapter.isAvailable) {
          console.warn(`Platform ${platform} is not available, queueing message`);
          adapter.messageQueue.push(message);
          continue;
        }

        try {
          await this.routeMessageToPlatform(message, adapter);
          routedPlatforms.push(platform);

          // Record route
          this.messageRoutes.set(messageId, {
            sourceAgent: message.sourceAgent,
            targetPlatforms: message.targetPlatforms,
            messageId,
            status: 'delivered',
            attempts: 1,
            lastAttempt: new Date(),
          });
        } catch (error) {
          console.error(`Failed to route message to ${platform}:`, error);
          adapter.messageQueue.push(message);
        }
      }

      return {
        messageId,
        routedTo: routedPlatforms,
        status: routedPlatforms.length > 0 ? 'success' : 'queued',
      };
    } catch (error) {
      console.error('Error sending cross-platform message:', error);
      throw error;
    }
  }

  /**
   * Route message to specific platform
   */
  private async routeMessageToPlatform(
    message: CrossPlatformMessage,
    adapter: PlatformAdapter
  ): Promise<void> {
    try {
      // Translate message for platform
      const translatedMessage = await this.translateMessage(message, adapter.name);

      // Send to platform
      const response = await fetch(`${adapter.endpoint}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CROSS_PLATFORM_API_KEY}`,
          'X-Message-ID': message.messageId,
          'X-Source-Agent': message.sourceAgent,
        },
        body: JSON.stringify(translatedMessage),
      });

      if (!response.ok) {
        throw new Error(`Platform API returned ${response.status}`);
      }

      console.log(`Message routed to ${adapter.name}`);
    } catch (error) {
      console.error(`Error routing to ${adapter.name}:`, error);
      throw error;
    }
  }

  /**
   * Translate message for specific platform
   */
  private async translateMessage(message: CrossPlatformMessage, platform: string): Promise<any> {
    const platformFormats: Record<string, any> = {
      HybridCast: {
        type: 'broadcast',
        content: message.content,
        priority: message.priority,
        encryption: message.encryption,
        metadata: {
          ...message.metadata,
          platform: 'HybridCast',
          meshEnabled: true,
          offlineSupport: true,
        },
      },
      RockinBoogie: {
        type: 'audio-stream',
        content: message.content,
        contentType: message.contentType,
        metadata: {
          ...message.metadata,
          platform: 'RockinBoogie',
          streamingEnabled: true,
          playlistSync: true,
        },
      },
      Canryn: {
        type: 'enterprise-message',
        content: message.content,
        priority: message.priority,
        metadata: {
          ...message.metadata,
          platform: 'Canryn',
          complianceTracking: true,
          auditLogging: true,
        },
      },
      SweetMiracles: {
        type: 'community-message',
        content: message.content,
        contentType: message.contentType,
        metadata: {
          ...message.metadata,
          platform: 'SweetMiracles',
          communityEngagement: true,
          accessibilityEnabled: true,
        },
      },
    };

    return platformFormats[platform] || message;
  }

  /**
   * Get platform status
   */
  async getPlatformStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    for (const [name, adapter] of this.platformAdapters.entries()) {
      status[name] = {
        isAvailable: adapter.isAvailable,
        lastHealthCheck: adapter.lastHealthCheck,
        capabilities: adapter.capabilities,
        queuedMessages: adapter.messageQueue.length,
        endpoint: adapter.endpoint,
      };
    }

    return status;
  }

  /**
   * Get message routing status
   */
  getMessageRoutingStatus(messageId: string): MessageRoute | null {
    return this.messageRoutes.get(messageId) || null;
  }

  /**
   * Start health checks for all platforms
   */
  private startHealthChecks(): void {
    setInterval(async () => {
      for (const [name, adapter] of this.platformAdapters.entries()) {
        try {
          const response = await fetch(`${adapter.endpoint}/health`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.CROSS_PLATFORM_API_KEY}`,
            },
          });

          adapter.isAvailable = response.ok;
          adapter.lastHealthCheck = new Date();

          if (adapter.isAvailable && adapter.messageQueue.length > 0) {
            console.log(`Platform ${name} is back online, processing queued messages`);
            await this.processQueuedMessages(adapter);
          }
        } catch (error) {
          adapter.isAvailable = false;
          adapter.lastHealthCheck = new Date();
          console.warn(`Health check failed for ${name}:`, error);
        }
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Process queued messages when platform comes online
   */
  private async processQueuedMessages(adapter: PlatformAdapter): Promise<void> {
    while (adapter.messageQueue.length > 0) {
      const message = adapter.messageQueue.shift();
      if (message) {
        try {
          await this.routeMessageToPlatform(message, adapter);
        } catch (error) {
          console.error(`Error processing queued message:`, error);
          adapter.messageQueue.unshift(message); // Re-queue if failed
          break;
        }
      }
    }
  }

  /**
   * Start message processor
   */
  private startMessageProcessor(): void {
    setInterval(async () => {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          try {
            await this.sendCrossPlatformMessage(message);
          } catch (error) {
            console.error('Error processing message from queue:', error);
            this.messageQueue.unshift(message); // Re-queue if failed
          }
        }
      }
    }, 5000); // Process every 5 seconds
  }

  /**
   * Validate message
   */
  private validateMessage(message: CrossPlatformMessage): void {
    if (!message.messageId) {
      throw new Error('Message ID is required');
    }
    if (!message.sourceAgent) {
      throw new Error('Source agent is required');
    }
    if (!message.targetPlatforms || message.targetPlatforms.length === 0) {
      throw new Error('Target platforms are required');
    }
    if (!message.content) {
      throw new Error('Message content is required');
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get network statistics
   */
  async getNetworkStatistics(): Promise<{
    totalMessages: number;
    deliveredMessages: number;
    failedMessages: number;
    queuedMessages: number;
    platformStatuses: Record<string, any>;
    averageLatency: number;
  }> {
    let totalMessages = 0;
    let deliveredMessages = 0;
    let failedMessages = 0;
    let queuedMessages = 0;

    for (const route of this.messageRoutes.values()) {
      totalMessages++;
      if (route.status === 'delivered') {
        deliveredMessages++;
      } else if (route.status === 'failed') {
        failedMessages++;
      }
    }

    for (const adapter of this.platformAdapters.values()) {
      queuedMessages += adapter.messageQueue.length;
    }

    const platformStatuses = await this.getPlatformStatus();

    return {
      totalMessages,
      deliveredMessages,
      failedMessages,
      queuedMessages,
      platformStatuses,
      averageLatency: 45, // Placeholder - calculate from actual metrics
    };
  }
}

// Export singleton instance
export const crossPlatformService = new CrossPlatformCommunicationService();
