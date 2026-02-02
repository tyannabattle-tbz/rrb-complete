/**
 * Real-Time WebSocket Sync System
 * Synchronizes data across all connected devices in real-time
 */

export interface WebSocketMessage {
  id: string;
  type: WebSocketMessageType;
  payload: Record<string, unknown>;
  timestamp: Date;
  sender: string;
}

export type WebSocketMessageType =
  | 'sync_request'
  | 'sync_response'
  | 'data_update'
  | 'project_update'
  | 'user_action'
  | 'notification'
  | 'heartbeat'
  | 'error'
  | 'disconnect';

export interface SyncData {
  id: string;
  type: string;
  data: Record<string, unknown>;
  version: number;
  timestamp: Date;
}

export interface WebSocketConnection {
  id: string;
  clientId: string;
  deviceType: string;
  isConnected: boolean;
  lastHeartbeat: Date;
  messageCount: number;
}

export class WebSocketSync {
  private ws: WebSocket | null = null;
  private connections: Map<string, WebSocketConnection> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private syncData: Map<string, SyncData> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;

  /**
   * Connect to WebSocket server
   */
  connect(url: string, clientId: string, deviceType: string): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected to server');
          this.reconnectAttempts = 0;

          // Register connection
          this.registerConnection(clientId, deviceType);
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          this.emit('error', { error: error.toString() });
          resolve(false);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected from server');
          this.emit('disconnect', {});
          this.attemptReconnect(url, clientId, deviceType);
        };
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        resolve(false);
      }
    });
  }

  /**
   * Register connection
   */
  private registerConnection(clientId: string, deviceType: string): void {
    const connection: WebSocketConnection = {
      id: `conn-${Date.now()}`,
      clientId,
      deviceType,
      isConnected: true,
      lastHeartbeat: new Date(),
      messageCount: 0,
    };

    this.connections.set(connection.id, connection);

    // Send registration message
    this.send('sync_request', {
      action: 'register',
      clientId,
      deviceType,
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  /**
   * Start heartbeat
   */
  private startHeartbeat(): void {
    setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send('heartbeat', {
          timestamp: new Date().toISOString(),
        });
      }
    }, 30000);
  }

  /**
   * Send message
   */
  send(type: WebSocketMessageType, payload: Record<string, unknown>): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Queue message if not connected
      this.messageQueue.push({
        id: `msg-${Date.now()}`,
        type,
        payload,
        timestamp: new Date(),
        sender: 'client',
      });
      return false;
    }

    const message: WebSocketMessage = {
      id: `msg-${Date.now()}`,
      type,
      payload,
      timestamp: new Date(),
      sender: 'client',
    };

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('[WebSocket] Send failed:', error);
      return false;
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data);
      message.timestamp = new Date(message.timestamp);

      // Update connection heartbeat
      const connections = Array.from(this.connections.values());
      if (connections.length > 0) {
        connections[0].lastHeartbeat = new Date();
        connections[0].messageCount++;
      }

      // Handle message by type
      switch (message.type) {
        case 'sync_response':
          this.handleSyncResponse(message);
          break;
        case 'data_update':
          this.handleDataUpdate(message);
          break;
        case 'notification':
          this.emit('notification', message.payload);
          break;
        case 'error':
          this.emit('error', message.payload);
          break;
        default:
          this.emit(message.type, message.payload);
      }
    } catch (error) {
      console.error('[WebSocket] Message parse failed:', error);
    }
  }

  /**
   * Handle sync response
   */
  private handleSyncResponse(message: WebSocketMessage): void {
    const { dataId, data, version } = message.payload;

    if (dataId && data) {
      const syncData: SyncData = {
        id: dataId as string,
        type: 'unknown',
        data: data as Record<string, unknown>,
        version: (version as number) || 1,
        timestamp: new Date(),
      };

      this.syncData.set(dataId as string, syncData);
      this.emit('data_sync', syncData);
    }
  }

  /**
   * Handle data update
   */
  private handleDataUpdate(message: WebSocketMessage): void {
    const { dataId, updates } = message.payload;

    if (dataId) {
      const existing = this.syncData.get(dataId as string);
      if (existing) {
        existing.data = { ...existing.data, ...(updates as Record<string, unknown>) };
        existing.version++;
        existing.timestamp = new Date();
        this.emit('data_update', existing);
      }
    }
  }

  /**
   * Attempt reconnect
   */
  private attemptReconnect(url: string, clientId: string, deviceType: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      this.emit('reconnect_failed', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect(url, clientId, deviceType);
    }, delay);
  }

  /**
   * Sync data
   */
  syncDataToServer(dataId: string, data: Record<string, unknown>): boolean {
    return this.send('data_update', {
      dataId,
      updates: data,
    });
  }

  /**
   * Request data sync
   */
  requestDataSync(dataId: string): boolean {
    return this.send('sync_request', {
      action: 'get_data',
      dataId,
    });
  }

  /**
   * Broadcast to all connections
   */
  broadcast(type: WebSocketMessageType, payload: Record<string, unknown>): boolean {
    return this.send(type, {
      ...payload,
      broadcast: true,
    });
  }

  /**
   * Get sync data
   */
  getSyncData(dataId: string): SyncData | undefined {
    return this.syncData.get(dataId);
  }

  /**
   * Get all sync data
   */
  getAllSyncData(): SyncData[] {
    return Array.from(this.syncData.values());
  }

  /**
   * Get connections
   */
  getConnections(): WebSocketConnection[] {
    return Array.from(this.connections.values());
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Is connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Flush message queue
   */
  flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message.type, message.payload);
      }
    }
  }

  /**
   * Add listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Remove listener
   */
  off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  /**
   * Emit event
   */
  private emit(event: string, data: unknown): void {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[WebSocket] Listener error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connections.clear();
    this.syncData.clear();
    this.messageQueue = [];
  }

  /**
   * Get statistics
   */
  getStatistics(): {
    isConnected: boolean;
    connectionCount: number;
    syncDataCount: number;
    queuedMessages: number;
    reconnectAttempts: number;
  } {
    return {
      isConnected: this.isConnected(),
      connectionCount: this.connections.size,
      syncDataCount: this.syncData.size,
      queuedMessages: this.messageQueue.length,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

export const websocketSync = new WebSocketSync();
