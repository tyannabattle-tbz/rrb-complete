import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

/**
 * Cross-Port WebSocket Manager
 * Enables real-time communication between Qumus (3000), RRB (3001), and HybridCast (3002)
 * Handles broadcasting, subscriptions, and offline sync
 */

export class CrossPortWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocket>> = new Map();
  private messageQueue: any[] = [];
  private isOffline: boolean = false;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('[WebSocket] Client connected');

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(message, ws);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error);
      });
    });
  }

  private handleMessage(message: any, ws: WebSocket) {
    const { type, channel, payload, source } = message;

    switch (type) {
      case 'subscribe':
        this.subscribe(channel, ws);
        break;

      case 'broadcast':
        this.broadcast(channel, payload, source);
        break;

      case 'command':
        this.handleCommand(payload, source);
        break;

      case 'status':
        this.handleStatusUpdate(payload, source);
        break;

      case 'offline_sync':
        this.handleOfflineSync(payload, source);
        break;

      default:
        console.warn('[WebSocket] Unknown message type:', type);
    }
  }

  /**
   * Subscribe to a channel
   */
  private subscribe(channel: string, ws: WebSocket) {
    if (!this.clients.has(channel)) {
      this.clients.set(channel, new Set());
    }
    this.clients.get(channel)!.add(ws);
    console.log(`[WebSocket] Client subscribed to ${channel}`);

    // Send subscription confirmation
    ws.send(
      JSON.stringify({
        type: 'subscribed',
        channel,
        timestamp: new Date().toISOString(),
      })
    );
  }

  /**
   * Broadcast message to all subscribers of a channel
   */
  private broadcast(channel: string, payload: any, source: string) {
    const subscribers = this.clients.get(channel);
    if (!subscribers) {
      console.warn(`[WebSocket] No subscribers for channel: ${channel}`);
      return;
    }

    const message = {
      type: 'broadcast',
      channel,
      payload,
      source,
      timestamp: new Date().toISOString(),
    };

    subscribers.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });

    // Queue for offline sync if needed
    if (this.isOffline) {
      this.messageQueue.push(message);
    }
  }

  /**
   * Handle cross-port commands
   */
  private handleCommand(payload: any, source: string) {
    const { target, command, data } = payload;
    console.log(`[WebSocket] Command from ${source}: ${command} -> ${target}`);

    // Route command to target system
    if (target === 'rrb') {
      this.sendToRRB(command, data);
    } else if (target === 'hybridcast') {
      this.sendToHybridCast(command, data);
    } else if (target === 'qumus') {
      this.sendToQumus(command, data);
    }

    // Broadcast command status
    this.broadcast('commands', { source, target, command, status: 'sent' }, 'qumus');
  }

  /**
   * Handle system status updates
   */
  private handleStatusUpdate(payload: any, source: string) {
    console.log(`[WebSocket] Status update from ${source}:`, payload);

    // Broadcast to all systems
    this.broadcast('system_status', { source, ...payload }, source);
  }

  /**
   * Handle offline sync
   */
  private handleOfflineSync(payload: any, source: string) {
    console.log(`[WebSocket] Offline sync from ${source}`);

    // Send queued messages to the reconnecting system
    const syncData = {
      type: 'offline_sync',
      messages: this.messageQueue,
      timestamp: new Date().toISOString(),
    };

    // Clear queue after sending
    this.messageQueue = [];

    this.broadcast('offline_sync', syncData, 'qumus');
  }

  /**
   * Send command to RRB (Port 3001)
   */
  private async sendToRRB(command: string, data: any) {
    try {
      const response = await fetch('http://localhost:3001/api/rrb/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, data }),
      });
      const result = await response.json();
      this.broadcast('rrb_response', result, 'rrb');
    } catch (error) {
      console.error('[WebSocket] Failed to send command to RRB:', error);
      this.broadcast('rrb_error', { error: 'Failed to reach RRB' }, 'qumus');
    }
  }

  /**
   * Send command to HybridCast (Port 3002)
   */
  private async sendToHybridCast(command: string, data: any) {
    try {
      const response = await fetch('http://localhost:3002/api/hybridcast/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, data }),
      });
      const result = await response.json();
      this.broadcast('hybridcast_response', result, 'hybridcast');
    } catch (error) {
      console.error('[WebSocket] Failed to send command to HybridCast:', error);
      this.broadcast('hybridcast_error', { error: 'Failed to reach HybridCast' }, 'qumus');
    }
  }

  /**
   * Send command to Qumus (Port 3000)
   */
  private async sendToQumus(command: string, data: any) {
    try {
      const response = await fetch('http://localhost:3000/api/qumus/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, data }),
      });
      const result = await response.json();
      this.broadcast('qumus_response', result, 'qumus');
    } catch (error) {
      console.error('[WebSocket] Failed to send command to Qumus:', error);
    }
  }

  /**
   * Remove client from all subscriptions
   */
  private removeClient(ws: WebSocket) {
    this.clients.forEach((subscribers) => {
      subscribers.delete(ws);
    });
  }

  /**
   * Set offline mode
   */
  public setOfflineMode(offline: boolean) {
    this.isOffline = offline;
    console.log(`[WebSocket] Offline mode: ${offline}`);

    if (!offline && this.messageQueue.length > 0) {
      console.log(`[WebSocket] Processing ${this.messageQueue.length} queued messages`);
      this.broadcast('offline_sync_complete', { messagesProcessed: this.messageQueue.length }, 'qumus');
    }
  }

  /**
   * Get system status
   */
  public async getSystemStatus() {
    try {
      const [qumusRes, rrbRes, hybridcastRes] = await Promise.allSettled([
        fetch('http://localhost:3000/api/qumus/status').then((r) => r.json()),
        fetch('http://localhost:3001/api/rrb/status').then((r) => r.json()),
        fetch('http://localhost:3002/api/hybridcast/status').then((r) => r.json()),
      ]);

      return {
        qumus: qumusRes.status === 'fulfilled' ? qumusRes.value : { status: 'offline' },
        rrb: rrbRes.status === 'fulfilled' ? rrbRes.value : { status: 'offline' },
        hybridcast: hybridcastRes.status === 'fulfilled' ? hybridcastRes.value : { status: 'offline' },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[WebSocket] Failed to get system status:', error);
      return { error: 'Failed to get system status' };
    }
  }

  /**
   * Broadcast system status to all clients
   */
  public async broadcastSystemStatus() {
    const status = await this.getSystemStatus();
    this.broadcast('system_status', status, 'qumus');
  }

  /**
   * Get message queue
   */
  public getMessageQueue() {
    return this.messageQueue;
  }

  /**
   * Clear message queue
   */
  public clearMessageQueue() {
    this.messageQueue = [];
  }
}

/**
 * Client-side WebSocket hook for React
 */
export function useWebSocket(channel: string) {
  const [data, setData] = React.useState<any>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const wsRef = React.useRef<WebSocket | null>(null);

  React.useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onopen = () => {
      console.log(`[WebSocket] Connected to ${channel}`);
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'subscribe', channel }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.channel === channel) {
          setData(message.payload);
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [channel]);

  const send = (payload: any) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({ type: 'broadcast', channel, payload }));
    }
  };

  return { data, isConnected, send };
}
