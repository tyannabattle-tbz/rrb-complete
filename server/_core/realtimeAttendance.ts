/**
 * Real-Time Attendance Updates Service
 * WebSocket integration for live panelist response tracking
 */

import { EventEmitter } from 'events';

export interface AttendanceUpdate {
  panelistId: string;
  panelistName: string;
  status: 'confirmed' | 'declined' | 'pending';
  timestamp: number;
  role: string;
  eventName: string;
}

export interface AttendanceMetrics {
  totalInvited: number;
  confirmed: number;
  declined: number;
  pending: number;
  confirmationRate: number;
  responseRate: number;
  lastUpdate: number;
}

/**
 * Real-time attendance tracker using EventEmitter
 * In production, this would use WebSocket or Server-Sent Events
 */
export class RealtimeAttendanceTracker extends EventEmitter {
  private attendanceMap = new Map<string, AttendanceUpdate>();
  private metricsCache: AttendanceMetrics | null = null;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.startMetricsCalculation();
  }

  /**
   * Record attendance update
   */
  recordUpdate(update: AttendanceUpdate): void {
    this.attendanceMap.set(update.panelistId, update);
    this.metricsCache = null; // Invalidate cache
    this.emit('attendance:updated', update);
    this.broadcastMetrics();
  }

  /**
   * Get current metrics
   */
  getMetrics(totalInvited: number): AttendanceMetrics {
    if (this.metricsCache) {
      return this.metricsCache;
    }

    const confirmed = Array.from(this.attendanceMap.values()).filter(
      (u) => u.status === 'confirmed'
    ).length;
    const declined = Array.from(this.attendanceMap.values()).filter(
      (u) => u.status === 'declined'
    ).length;
    const pending = totalInvited - confirmed - declined;

    const confirmationRate = totalInvited > 0 ? (confirmed / totalInvited) * 100 : 0;
    const responseRate = totalInvited > 0 ? ((confirmed + declined) / totalInvited) * 100 : 0;

    this.metricsCache = {
      totalInvited,
      confirmed,
      declined,
      pending,
      confirmationRate,
      responseRate,
      lastUpdate: Date.now(),
    };

    return this.metricsCache;
  }

  /**
   * Get attendance history
   */
  getHistory(): AttendanceUpdate[] {
    return Array.from(this.attendanceMap.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get real-time stream of updates
   */
  onUpdate(callback: (update: AttendanceUpdate) => void): () => void {
    this.on('attendance:updated', callback);
    return () => this.off('attendance:updated', callback);
  }

  /**
   * Broadcast metrics to all listeners
   */
  private broadcastMetrics(): void {
    this.emit('metrics:updated', this.metricsCache);
  }

  /**
   * Start periodic metrics calculation
   */
  private startMetricsCalculation(): void {
    this.updateInterval = setInterval(() => {
      if (this.attendanceMap.size > 0) {
        this.emit('metrics:recalculated', this.metricsCache);
      }
    }, 5000); // Every 5 seconds
  }

  /**
   * Stop tracking
   */
  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.removeAllListeners();
  }
}

/**
 * Global tracker instance
 */
export const globalAttendanceTracker = new RealtimeAttendanceTracker();

/**
 * WebSocket message types for real-time updates
 */
export interface WebSocketMessage {
  type: 'attendance:update' | 'metrics:request' | 'metrics:response' | 'history:request' | 'history:response';
  payload: any;
  timestamp: number;
}

/**
 * Create WebSocket message
 */
export function createWebSocketMessage(
  type: WebSocketMessage['type'],
  payload: any
): WebSocketMessage {
  return {
    type,
    payload,
    timestamp: Date.now(),
  };
}

/**
 * Handle WebSocket connection
 */
export function handleWebSocketConnection(
  send: (message: WebSocketMessage) => void,
  totalInvited: number
) {
  // Send initial metrics
  const metrics = globalAttendanceTracker.getMetrics(totalInvited);
  send(createWebSocketMessage('metrics:response', metrics));

  // Subscribe to updates
  const unsubscribe = globalAttendanceTracker.onUpdate((update) => {
    send(createWebSocketMessage('attendance:update', update));
  });

  // Subscribe to metrics updates
  globalAttendanceTracker.on('metrics:updated', (metrics) => {
    send(createWebSocketMessage('metrics:response', metrics));
  });

  // Return cleanup function
  return () => {
    unsubscribe();
    globalAttendanceTracker.removeAllListeners();
  };
}

/**
 * Simulate real-time updates for demo/testing
 */
export function simulateAttendanceUpdates(
  eventName: string,
  totalPanelists: number,
  intervalMs: number = 3000
): () => void {
  const panelists = Array.from({ length: totalPanelists }, (_, i) => ({
    id: `panelist-${i + 1}`,
    name: `Panelist ${i + 1}`,
    role: ['Moderator', 'Speaker', 'Panelist'][Math.floor(Math.random() * 3)],
  }));

  const interval = setInterval(() => {
    const randomPanelist = panelists[Math.floor(Math.random() * panelists.length)];
    const status = Math.random() > 0.2 ? 'confirmed' : 'declined';

    globalAttendanceTracker.recordUpdate({
      panelistId: randomPanelist.id,
      panelistName: randomPanelist.name,
      status: status as 'confirmed' | 'declined',
      timestamp: Date.now(),
      role: randomPanelist.role,
      eventName,
    });
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Get real-time dashboard data
 */
export interface DashboardData {
  eventName: string;
  metrics: AttendanceMetrics;
  recentUpdates: AttendanceUpdate[];
  confirmationTrend: Array<{ timestamp: number; confirmed: number }>;
}

export function getDashboardData(
  eventName: string,
  totalInvited: number,
  historyLimit: number = 10
): DashboardData {
  const metrics = globalAttendanceTracker.getMetrics(totalInvited);
  const recentUpdates = globalAttendanceTracker.getHistory().slice(0, historyLimit);

  // Calculate confirmation trend (last 5 updates)
  const confirmationTrend = recentUpdates
    .slice(0, 5)
    .reverse()
    .map((update, index) => ({
      timestamp: update.timestamp,
      confirmed: recentUpdates.filter((u) => u.status === 'confirmed').length,
    }));

  return {
    eventName,
    metrics,
    recentUpdates,
    confirmationTrend,
  };
}

/**
 * Export attendance data as JSON
 */
export function exportAttendanceData(eventName: string): string {
  const data = {
    event: eventName,
    exportedAt: new Date().toISOString(),
    attendanceHistory: globalAttendanceTracker.getHistory(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Reset tracker (for testing)
 */
export function resetTracker(): void {
  globalAttendanceTracker.stop();
  globalAttendanceTracker.removeAllListeners();
}
