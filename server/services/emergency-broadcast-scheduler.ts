/**
 * Emergency Broadcast Scheduler
 * 
 * Manages emergency broadcasts across all 7 RRB channels
 * - Priority override (interrupts regular programming)
 * - Multi-channel simultaneous broadcast
 * - Automatic scheduling and duration management
 * - Real-time listener notifications
 */

import { type ChannelId } from "./broadcast-scheduler";

export type EmergencyLevel = 'critical' | 'high' | 'medium' | 'low';
export type EmergencyType = 'weather' | 'health' | 'security' | 'infrastructure' | 'community' | 'general';

export interface EmergencyBroadcast {
  id: string;
  title: string;
  description: string;
  content: string;
  audioUrl?: string;
  level: EmergencyLevel;
  type: EmergencyType;
  channels: ChannelId[];           // Which channels to broadcast on
  startTime: number;               // Unix timestamp
  endTime: number;                 // Unix timestamp
  duration: number;                // Seconds
  priority: number;                // 1-100 (overrides regular content)
  isActive: boolean;
  status: 'scheduled' | 'broadcasting' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
  createdBy: string;               // User ID who created this
  notifyListeners: boolean;        // Send push notifications
  repeatOnChannels: boolean;       // Repeat until end time
  autoRepeatInterval?: number;     // Milliseconds between repeats
}

export interface EmergencyBroadcastHistory {
  broadcastId: string;
  channelId: ChannelId;
  startedAt: number;
  endedAt: number;
  listenersReached: number;
  status: 'completed' | 'interrupted' | 'failed';
}

export interface EmergencyAlert {
  id: string;
  broadcastId: string;
  channelId: ChannelId;
  message: string;
  sentAt: number;
  recipientCount: number;
  deliveredCount: number;
  failedCount: number;
}

/**
 * Emergency Broadcast Scheduler
 */
export class EmergencyBroadcastScheduler {
  private broadcasts: Map<string, EmergencyBroadcast> = new Map();
  private history: EmergencyBroadcastHistory[] = [];
  private alerts: Map<string, EmergencyAlert> = new Map();
  private activeBroadcasts: Set<string> = new Set();

  constructor() {
    this.startMonitoring();
  }

  /**
   * Create a new emergency broadcast
   */
  createBroadcast(
    title: string,
    description: string,
    content: string,
    options: {
      level: EmergencyLevel;
      type: EmergencyType;
      channels: ChannelId[];
      duration: number;           // Seconds
      audioUrl?: string;
      createdBy: string;
      notifyListeners?: boolean;
      repeatOnChannels?: boolean;
      autoRepeatInterval?: number;
    }
  ): EmergencyBroadcast {
    const now = Date.now();
    const broadcast: EmergencyBroadcast = {
      id: `emergency_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
      title,
      description,
      content,
      audioUrl: options.audioUrl,
      level: options.level,
      type: options.type,
      channels: options.channels,
      startTime: now,
      endTime: now + options.duration * 1000,
      duration: options.duration,
      priority: this.getPriorityFromLevel(options.level),
      isActive: true,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
      createdBy: options.createdBy,
      notifyListeners: options.notifyListeners ?? true,
      repeatOnChannels: options.repeatOnChannels ?? true,
      autoRepeatInterval: options.autoRepeatInterval,
    };

    this.broadcasts.set(broadcast.id, broadcast);
    console.log(`[EmergencyBroadcastScheduler] Created emergency broadcast: ${broadcast.id} (${options.level})`);

    return broadcast;
  }

  /**
   * Start broadcasting an emergency alert
   */
  startBroadcast(broadcastId: string): boolean {
    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) {
      console.error(`[EmergencyBroadcastScheduler] Broadcast not found: ${broadcastId}`);
      return false;
    }

    broadcast.status = 'broadcasting';
    broadcast.startTime = Date.now();
    broadcast.updatedAt = Date.now();
    this.activeBroadcasts.add(broadcastId);

    // Send alerts to all channels
    for (const channelId of broadcast.channels) {
      this.sendAlert(broadcastId, channelId, broadcast.title);
    }

    console.log(`[EmergencyBroadcastScheduler] Started broadcasting: ${broadcastId}`);
    return true;
  }

  /**
   * Stop an emergency broadcast
   */
  stopBroadcast(broadcastId: string): boolean {
    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) {
      console.error(`[EmergencyBroadcastScheduler] Broadcast not found: ${broadcastId}`);
      return false;
    }

    broadcast.status = 'completed';
    broadcast.endTime = Date.now();
    broadcast.updatedAt = Date.now();
    this.activeBroadcasts.delete(broadcastId);

    console.log(`[EmergencyBroadcastScheduler] Stopped broadcasting: ${broadcastId}`);
    return true;
  }

  /**
   * Cancel an emergency broadcast
   */
  cancelBroadcast(broadcastId: string): boolean {
    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) {
      console.error(`[EmergencyBroadcastScheduler] Broadcast not found: ${broadcastId}`);
      return false;
    }

    broadcast.status = 'cancelled';
    broadcast.isActive = false;
    broadcast.updatedAt = Date.now();
    this.activeBroadcasts.delete(broadcastId);

    console.log(`[EmergencyBroadcastScheduler] Cancelled broadcast: ${broadcastId}`);
    return true;
  }

  /**
   * Get active broadcasts
   */
  getActiveBroadcasts(): EmergencyBroadcast[] {
    return Array.from(this.activeBroadcasts)
      .map(id => this.broadcasts.get(id))
      .filter((b): b is EmergencyBroadcast => b !== undefined);
  }

  /**
   * Get broadcasts for a channel
   */
  getBroadcastsForChannel(channelId: ChannelId): EmergencyBroadcast[] {
    return Array.from(this.broadcasts.values()).filter(b =>
      b.channels.includes(channelId) && b.isActive
    );
  }

  /**
   * Get current broadcast for a channel
   */
  getCurrentBroadcast(channelId: ChannelId): EmergencyBroadcast | undefined {
    const now = Date.now();
    return Array.from(this.broadcasts.values()).find(b =>
      b.channels.includes(channelId) &&
      b.status === 'broadcasting' &&
      b.startTime <= now &&
      b.endTime > now
    );
  }

  /**
   * Get broadcast by ID
   */
  getBroadcast(broadcastId: string): EmergencyBroadcast | undefined {
    return this.broadcasts.get(broadcastId);
  }

  /**
   * Get all broadcasts
   */
  getAllBroadcasts(): EmergencyBroadcast[] {
    return Array.from(this.broadcasts.values());
  }

  /**
   * Send alert for a broadcast on a channel
   */
  private sendAlert(broadcastId: string, channelId: ChannelId, message: string) {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const alert: EmergencyAlert = {
      id: alertId,
      broadcastId,
      channelId,
      message,
      sentAt: Date.now(),
      recipientCount: 0,
      deliveredCount: 0,
      failedCount: 0,
    };

    this.alerts.set(alertId, alert);
    console.log(`[EmergencyBroadcastScheduler] Sent alert: ${alertId} on channel ${channelId}`);
  }

  /**
   * Get alerts for a broadcast
   */
  getAlertsForBroadcast(broadcastId: string): EmergencyAlert[] {
    return Array.from(this.alerts.values()).filter(a => a.broadcastId === broadcastId);
  }

  /**
   * Record broadcast history
   */
  recordHistory(
    broadcastId: string,
    channelId: ChannelId,
    listenersReached: number,
    status: 'completed' | 'interrupted' | 'failed'
  ) {
    const broadcast = this.broadcasts.get(broadcastId);
    if (!broadcast) return;

    this.history.push({
      broadcastId,
      channelId,
      startedAt: broadcast.startTime,
      endedAt: Date.now(),
      listenersReached,
      status,
    });
  }

  /**
   * Get broadcast history
   */
  getHistory(broadcastId?: string): EmergencyBroadcastHistory[] {
    if (broadcastId) {
      return this.history.filter(h => h.broadcastId === broadcastId);
    }
    return this.history;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const total = this.broadcasts.size;
    const active = this.activeBroadcasts.size;
    const completed = Array.from(this.broadcasts.values()).filter(b => b.status === 'completed').length;
    const cancelled = Array.from(this.broadcasts.values()).filter(b => b.status === 'cancelled').length;

    const byCriticalityLevel = {
      critical: Array.from(this.broadcasts.values()).filter(b => b.level === 'critical').length,
      high: Array.from(this.broadcasts.values()).filter(b => b.level === 'high').length,
      medium: Array.from(this.broadcasts.values()).filter(b => b.level === 'medium').length,
      low: Array.from(this.broadcasts.values()).filter(b => b.level === 'low').length,
    };

    const totalListenersReached = this.history.reduce((sum, h) => sum + h.listenersReached, 0);

    return {
      total,
      active,
      completed,
      cancelled,
      byCriticalityLevel,
      totalListenersReached,
      totalAlerts: this.alerts.size,
      historyRecords: this.history.length,
    };
  }

  /**
   * Start monitoring for broadcasts that need to be activated
   */
  private startMonitoring() {
    setInterval(() => {
      const now = Date.now();

      for (const [broadcastId, broadcast] of this.broadcasts.entries()) {
        // Auto-start scheduled broadcasts
        if (
          broadcast.status === 'scheduled' &&
          broadcast.startTime <= now &&
          broadcast.endTime > now
        ) {
          this.startBroadcast(broadcastId);
        }

        // Auto-stop completed broadcasts
        if (
          broadcast.status === 'broadcasting' &&
          broadcast.endTime <= now
        ) {
          this.stopBroadcast(broadcastId);
        }

        // Handle auto-repeat
        if (
          broadcast.status === 'broadcasting' &&
          broadcast.repeatOnChannels &&
          broadcast.autoRepeatInterval
        ) {
          const timeSinceStart = now - broadcast.startTime;
          if (timeSinceStart > 0 && timeSinceStart % broadcast.autoRepeatInterval === 0) {
            for (const channelId of broadcast.channels) {
              this.sendAlert(broadcastId, channelId, broadcast.title);
            }
          }
        }
      }
    }, 1000); // Check every second
  }

  /**
   * Get priority from emergency level
   */
  private getPriorityFromLevel(level: EmergencyLevel): number {
    switch (level) {
      case 'critical':
        return 100;
      case 'high':
        return 75;
      case 'medium':
        return 50;
      case 'low':
        return 25;
      default:
        return 50;
    }
  }

  /**
   * Export all data
   */
  exportData() {
    return {
      broadcasts: Array.from(this.broadcasts.values()),
      history: this.history,
      alerts: Array.from(this.alerts.values()),
      statistics: this.getStatistics(),
      exportedAt: Date.now(),
    };
  }
}

// Singleton instance
let schedulerInstance: EmergencyBroadcastScheduler | null = null;

export function getEmergencyBroadcastScheduler(): EmergencyBroadcastScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new EmergencyBroadcastScheduler();
  }
  return schedulerInstance;
}
