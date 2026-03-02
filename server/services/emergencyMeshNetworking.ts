/**
 * Emergency Mesh Networking Service
 * LoRa/Meshtastic support for HybridCast offline broadcasting
 * Enables communication when internet is down
 */

import { EventEmitter } from 'events';

export interface MeshNode {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  signal: number; // -120 to 0 dBm
  battery: number; // 0-100%
  lastSeen: number;
  role: 'router' | 'client' | 'repeater';
  distance?: number; // meters
}

export interface MeshMessage {
  id: string;
  from: string;
  to: string | 'broadcast';
  content: string;
  type: 'emergency' | 'broadcast' | 'alert' | 'status';
  priority: 'low' | 'normal' | 'high' | 'critical';
  timestamp: number;
  hopLimit: number;
  delivered: boolean;
  deliveredAt?: number;
}

export interface MeshRoute {
  destination: string;
  nextHop: string;
  hopCount: number;
  quality: number; // 0-100%
  lastUpdated: number;
}

export class EmergencyMeshNetworking extends EventEmitter {
  private nodes: Map<string, MeshNode> = new Map();
  private messages: Map<string, MeshMessage> = new Map();
  private routes: Map<string, MeshRoute> = new Map();
  private isConnected = false;
  private nodeId: string;
  private broadcastInterval: NodeJS.Timeout | null = null;

  constructor(nodeId: string) {
    super();
    this.nodeId = nodeId;
    this.initializeMesh();
  }

  /**
   * Initialize mesh network
   */
  private async initializeMesh() {
    try {
      // Try to connect to Meshtastic device
      const meshtastic = await this.connectToMeshtastic();

      if (meshtastic) {
        this.isConnected = true;
        this.startBroadcasting();
        console.log('[Mesh] Connected to Meshtastic device');
      } else {
        console.warn('[Mesh] Meshtastic device not found, running in simulation mode');
        this.startSimulation();
      }
    } catch (error) {
      console.error('[Mesh] Failed to initialize mesh:', error);
      this.startSimulation();
    }
  }

  /**
   * Connect to Meshtastic device
   */
  private async connectToMeshtastic(): Promise<any> {
    try {
      // This would use the Meshtastic.js library
      // For now, returning null to indicate simulation mode
      return null;
    } catch (error) {
      console.error('[Mesh] Meshtastic connection failed:', error);
      return null;
    }
  }

  /**
   * Start broadcasting mesh status
   */
  private startBroadcasting() {
    this.broadcastInterval = setInterval(() => {
      this.broadcastNodeStatus();
    }, 30000); // Every 30 seconds
  }

  /**
   * Broadcast node status to mesh
   */
  private broadcastNodeStatus() {
    const status: MeshMessage = {
      id: `status-${Date.now()}`,
      from: this.nodeId,
      to: 'broadcast',
      content: JSON.stringify({
        nodeId: this.nodeId,
        timestamp: Date.now(),
        nodesKnown: this.nodes.size,
        messagesQueued: this.messages.size,
      }),
      type: 'status',
      priority: 'normal',
      timestamp: Date.now(),
      hopLimit: 3,
      delivered: false,
    };

    this.sendMessage(status);
  }

  /**
   * Send message through mesh
   */
  async sendMessage(message: MeshMessage): Promise<boolean> {
    try {
      // Store message
      this.messages.set(message.id, message);

      // Route message
      if (message.to === 'broadcast') {
        // Broadcast to all nodes
        await this.broadcastMessage(message);
      } else {
        // Route to specific node
        await this.routeMessage(message);
      }

      console.log(`[Mesh] Message sent: ${message.id}`);
      return true;
    } catch (error) {
      console.error('[Mesh] Failed to send message:', error);
      return false;
    }
  }

  /**
   * Broadcast message to all nodes
   */
  private async broadcastMessage(message: MeshMessage): Promise<void> {
    // Send to all known nodes
    for (const [nodeId] of this.nodes) {
      const routedMessage = { ...message, to: nodeId };
      await this.routeMessage(routedMessage);
    }

    // Emit local event
    this.emit('message', message);
  }

  /**
   * Route message to specific node
   */
  private async routeMessage(message: MeshMessage): Promise<void> {
    // Find route to destination
    const route = this.findRoute(message.to);

    if (!route) {
      console.warn(`[Mesh] No route found to ${message.to}`);
      return;
    }

    // Decrement hop limit
    if (message.hopLimit <= 0) {
      console.warn(`[Mesh] Message ${message.id} exceeded hop limit`);
      return;
    }

    message.hopLimit--;

    // Send via next hop
    if (route.nextHop === this.nodeId) {
      // We are the next hop, deliver locally
      this.emit('message', message);
    } else {
      // Forward to next hop
      await this.forwardMessage(route.nextHop, message);
    }
  }

  /**
   * Forward message to next hop
   */
  private async forwardMessage(nextHop: string, message: MeshMessage): Promise<void> {
    // This would send the message to the next hop node
    // Implementation depends on the mesh protocol
    console.log(`[Mesh] Forwarding message to ${nextHop}`);
  }

  /**
   * Find route to destination
   */
  private findRoute(destination: string): MeshRoute | null {
    // Check if we have a direct route
    if (this.nodes.has(destination)) {
      return {
        destination,
        nextHop: destination,
        hopCount: 1,
        quality: 100,
        lastUpdated: Date.now(),
      };
    }

    // Check routing table
    const route = this.routes.get(destination);
    if (route && Date.now() - route.lastUpdated < 60000) {
      // Route is fresh (less than 1 minute old)
      return route;
    }

    return null;
  }

  /**
   * Add node to mesh
   */
  addNode(node: MeshNode): void {
    this.nodes.set(node.id, node);
    this.emit('nodeDiscovered', node);
    console.log(`[Mesh] Node discovered: ${node.id}`);
  }

  /**
   * Update node status
   */
  updateNode(nodeId: string, updates: Partial<MeshNode>): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      Object.assign(node, updates);
      this.emit('nodeUpdated', node);
    }
  }

  /**
   * Get all nodes
   */
  getNodes(): MeshNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get node by ID
   */
  getNode(nodeId: string): MeshNode | undefined {
    return this.nodes.get(nodeId);
  }

  /**
   * Send emergency broadcast
   */
  async sendEmergencyBroadcast(content: string, priority: 'high' | 'critical' = 'critical'): Promise<boolean> {
    const message: MeshMessage = {
      id: `emergency-${Date.now()}`,
      from: this.nodeId,
      to: 'broadcast',
      content,
      type: 'emergency',
      priority,
      timestamp: Date.now(),
      hopLimit: 5, // Higher hop limit for emergencies
      delivered: false,
    };

    return this.sendMessage(message);
  }

  /**
   * Send alert
   */
  async sendAlert(content: string, targetNode?: string): Promise<boolean> {
    const message: MeshMessage = {
      id: `alert-${Date.now()}`,
      from: this.nodeId,
      to: targetNode || 'broadcast',
      content,
      type: 'alert',
      priority: 'high',
      timestamp: Date.now(),
      hopLimit: 3,
      delivered: false,
    };

    return this.sendMessage(message);
  }

  /**
   * Get mesh statistics
   */
  getStats(): {
    nodeCount: number;
    messageCount: number;
    routeCount: number;
    isConnected: boolean;
    avgSignal: number;
    avgBattery: number;
  } {
    const nodes = Array.from(this.nodes.values());
    const avgSignal = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.signal, 0) / nodes.length : 0;
    const avgBattery = nodes.length > 0 ? nodes.reduce((sum, n) => sum + n.battery, 0) / nodes.length : 0;

    return {
      nodeCount: this.nodes.size,
      messageCount: this.messages.size,
      routeCount: this.routes.size,
      isConnected: this.isConnected,
      avgSignal,
      avgBattery,
    };
  }

  /**
   * Start simulation mode (for testing without hardware)
   */
  private startSimulation() {
    console.log('[Mesh] Starting simulation mode');

    // Simulate nodes
    const simulatedNodes: MeshNode[] = [
      {
        id: 'node-1',
        name: 'Base Station',
        position: { lat: 40.7128, lng: -74.006 },
        signal: -85,
        battery: 95,
        lastSeen: Date.now(),
        role: 'router',
      },
      {
        id: 'node-2',
        name: 'Mobile Unit 1',
        position: { lat: 40.758, lng: -73.9855 },
        signal: -95,
        battery: 75,
        lastSeen: Date.now(),
        role: 'client',
      },
      {
        id: 'node-3',
        name: 'Mobile Unit 2',
        position: { lat: 40.7489, lng: -73.968 },
        signal: -90,
        battery: 60,
        lastSeen: Date.now(),
        role: 'client',
      },
    ];

    simulatedNodes.forEach((node) => this.addNode(node));

    // Simulate periodic updates
    setInterval(() => {
      this.nodes.forEach((node) => {
        // Simulate signal fluctuation
        node.signal += Math.random() * 10 - 5;
        node.signal = Math.max(-120, Math.min(0, node.signal));

        // Simulate battery drain
        node.battery -= Math.random() * 0.1;
        node.battery = Math.max(0, node.battery);

        this.emit('nodeUpdated', node);
      });
    }, 10000);
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
    }
    this.removeAllListeners();
  }
}

// Export singleton instance
export const meshNetwork = new EmergencyMeshNetworking('hybridcast-main');
