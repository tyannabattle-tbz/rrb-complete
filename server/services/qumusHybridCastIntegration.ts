/**
 * QUMUS HybridCast Integration Service
 * Provides resilient communication through HybridCast emergency broadcast system
 */

import { EventEmitter } from 'events';

export interface HybridCastMessage {
  id: string;
  channel: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  content: any;
  timestamp: number;
  sender: string;
  recipients: string[];
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  retries: number;
  maxRetries: number;
}

export interface HybridCastChannel {
  id: string;
  name: string;
  type: 'broadcast' | 'unicast' | 'multicast' | 'emergency';
  status: 'active' | 'inactive' | 'degraded';
  subscribers: Set<string>;
  messageQueue: HybridCastMessage[];
  bandwidth: number;
  latency: number;
}

class QUMUSHybridCastIntegration extends EventEmitter {
  private channels: Map<string, HybridCastChannel> = new Map();
  private messageLog: HybridCastMessage[] = [];
  private deliveryStats: {
    sent: number;
    delivered: number;
    failed: number;
    avgLatency: number;
  } = {
    sent: 0,
    delivered: 0,
    failed: 0,
    avgLatency: 0,
  };
  private fallbackChannels: string[] = [];
  private meshNetworkEnabled: boolean = true;

  constructor() {
    super();
    this.initializeChannels();
    this.startHealthMonitoring();
  }

  private initializeChannels() {
    const channelConfigs = [
      { id: 'qumus-primary', name: 'QUMUS Primary', type: 'broadcast' as const },
      { id: 'qumus-secondary', name: 'QUMUS Secondary', type: 'broadcast' as const },
      { id: 'qumus-emergency', name: 'QUMUS Emergency', type: 'emergency' as const },
      { id: 'qumus-mesh', name: 'QUMUS Mesh Network', type: 'multicast' as const },
      { id: 'qumus-sync', name: 'QUMUS Sync', type: 'unicast' as const },
      { id: 'rrb-radio', name: 'RRB Radio Integration', type: 'broadcast' as const },
      { id: 'canryn-control', name: 'Canryn Control', type: 'unicast' as const },
      { id: 'sweet-miracles', name: 'Sweet Miracles', type: 'broadcast' as const },
    ];

    channelConfigs.forEach((config) => {
      const channel: HybridCastChannel = {
        id: config.id,
        name: config.name,
        type: config.type,
        status: 'active',
        subscribers: new Set(),
        messageQueue: [],
        bandwidth: 100,
        latency: Math.random() * 50 + 10,
      };
      this.channels.set(config.id, channel);
    });

    this.fallbackChannels = ['qumus-secondary', 'qumus-emergency', 'qumus-mesh'];
    console.log('[HybridCast] Channels initialized:', Array.from(this.channels.keys()));
  }

  async sendMessage(
    channel: string,
    content: any,
    priority: 'critical' | 'high' | 'normal' | 'low' = 'normal',
    recipients: string[] = []
  ): Promise<HybridCastMessage> {
    const message: HybridCastMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      channel,
      priority,
      content,
      timestamp: Date.now(),
      sender: 'qumus',
      recipients,
      status: 'pending',
      retries: 0,
      maxRetries: 3,
    };

    const targetChannel = this.channels.get(channel);
    if (!targetChannel) {
      console.warn(`[HybridCast] Channel not found: ${channel}, using fallback`);
      return this.sendViaFallback(message);
    }

    if (targetChannel.status === 'active') {
      targetChannel.messageQueue.push(message);
      message.status = 'sent';
      this.deliveryStats.sent++;
      console.log(`[HybridCast] Message sent on ${channel}: ${message.id}`);
    } else {
      console.warn(`[HybridCast] Channel degraded: ${channel}, attempting fallback`);
      return this.sendViaFallback(message);
    }

    this.messageLog.push(message);
    this.emit('message-sent', message);

    // Simulate delivery
    setTimeout(() => {
      message.status = 'delivered';
      this.deliveryStats.delivered++;
      this.emit('message-delivered', message);
    }, Math.random() * 100 + 50);

    return message;
  }

  private async sendViaFallback(message: HybridCastMessage): Promise<HybridCastMessage> {
    for (const fallbackChannel of this.fallbackChannels) {
      const channel = this.channels.get(fallbackChannel);
      if (channel && channel.status === 'active') {
        console.log(`[HybridCast] Routing via fallback: ${fallbackChannel}`);
        message.channel = fallbackChannel;
        channel.messageQueue.push(message);
        message.status = 'sent';
        this.deliveryStats.sent++;
        this.messageLog.push(message);
        this.emit('message-sent-fallback', message);
        return message;
      }
    }

    // All channels failed
    message.status = 'failed';
    this.deliveryStats.failed++;
    console.error('[HybridCast] All channels failed, message queued for retry');
    this.emit('message-failed', message);
    return message;
  }

  async broadcastToAllSubsystems(content: any, priority: 'critical' | 'high' | 'normal' = 'high') {
    const messages: HybridCastMessage[] = [];

    for (const [channelId, channel] of this.channels) {
      const message = await this.sendMessage(channelId, content, priority, Array.from(channel.subscribers));
      messages.push(message);
    }

    return messages;
  }

  subscribeToChannel(channelId: string, subscriberId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.subscribers.add(subscriberId);
      console.log(`[HybridCast] Subscriber added to ${channelId}: ${subscriberId}`);
      this.emit('subscriber-added', { channel: channelId, subscriber: subscriberId });
    }
  }

  unsubscribeFromChannel(channelId: string, subscriberId: string) {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.subscribers.delete(subscriberId);
      console.log(`[HybridCast] Subscriber removed from ${channelId}: ${subscriberId}`);
    }
  }

  async enableMeshNetworking() {
    this.meshNetworkEnabled = true;
    console.log('[HybridCast] Mesh networking enabled for offline resilience');

    // Create mesh network message
    const meshMessage = await this.sendMessage('qumus-mesh', {
      type: 'mesh-enable',
      timestamp: Date.now(),
      nodes: Array.from(this.channels.keys()),
    });

    return meshMessage;
  }

  async disableMeshNetworking() {
    this.meshNetworkEnabled = false;
    console.log('[HybridCast] Mesh networking disabled');
  }

  getChannelStatus(channelId?: string) {
    if (channelId) {
      const channel = this.channels.get(channelId);
      return channel ? { [channelId]: this.formatChannelStatus(channel) } : null;
    }

    const status: Record<string, any> = {};
    for (const [id, channel] of this.channels) {
      status[id] = this.formatChannelStatus(channel);
    }
    return status;
  }

  private formatChannelStatus(channel: HybridCastChannel) {
    return {
      name: channel.name,
      type: channel.type,
      status: channel.status,
      subscribers: channel.subscribers.size,
      queueLength: channel.messageQueue.length,
      bandwidth: channel.bandwidth,
      latency: channel.latency.toFixed(2) + 'ms',
    };
  }

  getDeliveryStats() {
    const totalMessages = this.deliveryStats.sent + this.deliveryStats.failed;
    const successRate = totalMessages > 0 ? (this.deliveryStats.delivered / totalMessages) * 100 : 0;

    return {
      sent: this.deliveryStats.sent,
      delivered: this.deliveryStats.delivered,
      failed: this.deliveryStats.failed,
      successRate: successRate.toFixed(2) + '%',
      avgLatency: this.deliveryStats.avgLatency.toFixed(2) + 'ms',
      meshNetworkEnabled: this.meshNetworkEnabled,
      totalChannels: this.channels.size,
      totalSubscribers: Array.from(this.channels.values()).reduce((sum, ch) => sum + ch.subscribers.size, 0),
    };
  }

  getMessageLog(limit: number = 100) {
    return this.messageLog.slice(-limit).reverse();
  }

  setChannelStatus(channelId: string, status: 'active' | 'inactive' | 'degraded') {
    const channel = this.channels.get(channelId);
    if (channel) {
      channel.status = status;
      console.log(`[HybridCast] Channel ${channelId} status set to ${status}`);
      this.emit('channel-status-changed', { channel: channelId, status });
    }
  }

  private startHealthMonitoring() {
    setInterval(() => {
      for (const [channelId, channel] of this.channels) {
        // Simulate occasional degradation
        if (Math.random() < 0.05) {
          channel.status = 'degraded';
          console.warn(`[HybridCast] Channel degraded: ${channelId}`);
          setTimeout(() => {
            channel.status = 'active';
          }, 5000);
        }

        // Update latency
        channel.latency = Math.random() * 100 + 10;
      }

      // Calculate average latency
      const totalLatency = Array.from(this.channels.values()).reduce((sum, ch) => sum + ch.latency, 0);
      this.deliveryStats.avgLatency = totalLatency / this.channels.size;
    }, 10000);
  }

  async emergencyBroadcast(content: any) {
    console.log('[HybridCast] EMERGENCY BROADCAST INITIATED');

    const emergencyChannel = this.channels.get('qumus-emergency');
    if (emergencyChannel) {
      emergencyChannel.status = 'active';
      const message = await this.sendMessage('qumus-emergency', content, 'critical', Array.from(emergencyChannel.subscribers));
      this.emit('emergency-broadcast', message);
      return message;
    }

    return null;
  }

  getSystemHealth() {
    const activeChannels = Array.from(this.channels.values()).filter((ch) => ch.status === 'active').length;
    const totalChannels = this.channels.size;
    const healthPercentage = (activeChannels / totalChannels) * 100;

    return {
      activeChannels,
      totalChannels,
      healthPercentage: healthPercentage.toFixed(2) + '%',
      meshNetworkEnabled: this.meshNetworkEnabled,
      deliverySuccessRate: this.deliveryStats.delivered > 0 
        ? ((this.deliveryStats.delivered / (this.deliveryStats.sent + this.deliveryStats.failed)) * 100).toFixed(2) + '%'
        : 'N/A',
      status: healthPercentage >= 80 ? 'healthy' : healthPercentage >= 50 ? 'degraded' : 'critical',
    };
  }
}

export const qumusHybridCastIntegration = new QUMUSHybridCastIntegration();
