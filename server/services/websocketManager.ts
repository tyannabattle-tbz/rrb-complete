/**
 * WebSocket Manager
 * Handles real-time metric streaming to connected clients
 */

import { WebSocket, WebSocketServer } from 'ws';
import { getDb } from '../db';
import { systemMetrics, autonomousTasks } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export interface MetricUpdate {
  type: 'metrics' | 'task_update' | 'command_update';
  data: any;
  timestamp: number;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private metricsInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(server: any) {
    this.wss = new WebSocketServer({ server, path: '/api/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[WebSocket] Client connected');
      this.clients.add(ws);

      // Send initial metrics
      this.sendMetrics(ws);

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
        this.clients.delete(ws);
      });
    });

    // Start metrics broadcast every 5 seconds
    this.startMetricsBroadcast();
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(ws: WebSocket, message: any) {
    switch (message.type) {
      case 'subscribe':
        console.log('[WebSocket] Client subscribed to:', message.channel);
        ws.send(JSON.stringify({ type: 'subscribed', channel: message.channel }));
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      default:
        console.log('[WebSocket] Unknown message type:', message.type);
    }
  }

  /**
   * Start broadcasting metrics to all connected clients
   */
  private startMetricsBroadcast() {
    this.metricsInterval = setInterval(() => {
      this.broadcastMetrics();
    }, 5000); // Every 5 seconds
  }

  /**
   * Broadcast metrics to all connected clients
   */
  private async broadcastMetrics() {
    if (this.clients.size === 0) return;

    const metrics = await this.getSystemMetrics();
    const update: MetricUpdate = {
      type: 'metrics',
      data: metrics,
      timestamp: Date.now(),
    };

    const message = JSON.stringify(update);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Send metrics to a specific client
   */
  private async sendMetrics(ws: WebSocket) {
    const metrics = await this.getSystemMetrics();
    const update: MetricUpdate = {
      type: 'metrics',
      data: metrics,
      timestamp: Date.now(),
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(update));
    }
  }

  /**
   * Get current system metrics
   */
  private async getSystemMetrics() {
    const db = await getDb();
    if (!db) {
      return {
        activeTaskCount: 0,
        queuedTaskCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        totalTasksProcessed: 0,
        failedTaskCount: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        uptime: 0,
      };
    }

    try {
      // Get task metrics
      const activeTasks = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, 'executing'));

      const queuedTasks = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, 'queued'));

      const completedTasks = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, 'completed'));

      const failedTasks = await db
        .select()
        .from(autonomousTasks)
        .where(eq(autonomousTasks.status, 'failed'));

      const totalTasks = activeTasks.length + queuedTasks.length + completedTasks.length + failedTasks.length;
      const successRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

      // Calculate average execution time
      let averageExecutionTime = 0;
      if (completedTasks.length > 0) {
        const totalTime = completedTasks.reduce((sum, task) => {
          if (task.startedAt && task.completedAt) {
            const start = new Date(task.startedAt).getTime();
            const end = new Date(task.completedAt).getTime();
            return sum + (end - start);
          }
          return sum;
        }, 0);
        averageExecutionTime = Math.round(totalTime / completedTasks.length);
      }

      return {
        activeTaskCount: activeTasks.length,
        queuedTaskCount: queuedTasks.length,
        successRate: Math.round(successRate * 100) / 100,
        averageExecutionTime,
        totalTasksProcessed: completedTasks.length + failedTasks.length,
        failedTaskCount: failedTasks.length,
        cpuUsage: Math.random() * 100, // Placeholder - replace with actual CPU usage
        memoryUsage: Math.random() * 100, // Placeholder - replace with actual memory usage
        uptime: Math.floor(process.uptime()),
      };
    } catch (error) {
      console.error('[WebSocket] Error fetching metrics:', error);
      return {
        activeTaskCount: 0,
        queuedTaskCount: 0,
        successRate: 0,
        averageExecutionTime: 0,
        totalTasksProcessed: 0,
        failedTaskCount: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        uptime: 0,
      };
    }
  }

  /**
   * Broadcast task update to all clients
   */
  broadcastTaskUpdate(taskId: string, status: string, progress: number) {
    const update: MetricUpdate = {
      type: 'task_update',
      data: { taskId, status, progress },
      timestamp: Date.now(),
    };

    const message = JSON.stringify(update);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Broadcast command update to all clients
   */
  broadcastCommandUpdate(commandId: string, target: string, status: string) {
    const update: MetricUpdate = {
      type: 'command_update',
      data: { commandId, target, status },
      timestamp: Date.now(),
    };

    const message = JSON.stringify(update);
    this.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Cleanup
   */
  shutdown() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.clients.forEach((ws) => {
      ws.close();
    });

    if (this.wss) {
      this.wss.close();
    }
  }
}

export const websocketManager = new WebSocketManager();
