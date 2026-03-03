/**
 * Agent Network Service
 * Enables QUMUS agents to discover, connect, and communicate with other autonomous agents
 * Canryn Production and its subsidiaries
 */

import { createHash, randomBytes } from 'crypto';
import { EventEmitter } from 'events';

export interface AgentIdentity {
  agentId: string;
  name: string;
  version: string;
  autonomyLevel: number;
  capabilities: string[];
  endpoint: string;
  publicKey: string;
  createdAt: Date;
  lastHeartbeat: Date;
}

export interface AgentPeer {
  peerId: string;
  agentIdentity: AgentIdentity;
  status: 'connected' | 'disconnected' | 'pending' | 'failed';
  trustLevel: number; // 0-100
  sharedCapabilities: string[];
  lastCommunication: Date;
  failureCount: number;
  encryptionKey?: string;
}

export interface AgentMessage {
  messageId: string;
  fromAgentId: string;
  toAgentId: string;
  type: 'query' | 'command' | 'notification' | 'response' | 'heartbeat';
  payload: any;
  priority: 'low' | 'normal' | 'high' | 'critical';
  encrypted: boolean;
  timestamp: Date;
  requiresResponse: boolean;
  responseTimeout?: number;
}

export interface AgentDiscoveryRequest {
  agentId: string;
  capabilities: string[];
  autonomyLevel: number;
  filters?: {
    minAutonomy?: number;
    maxAutonomy?: number;
    requiredCapabilities?: string[];
    excludeAgents?: string[];
  };
}

export interface AgentRegistry {
  agentId: string;
  name: string;
  description: string;
  endpoint: string;
  capabilities: string[];
  autonomyLevel: number;
  trustScore: number;
  uptime: number;
  messageCount: number;
  lastSeen: Date;
  owner?: string;
  metadata?: Record<string, any>;
}

export class AgentNetworkService extends EventEmitter {
  private agentId: string;
  private agentIdentity: AgentIdentity;
  private peers: Map<string, AgentPeer> = new Map();
  private messageQueue: Map<string, AgentMessage> = new Map();
  private registryEndpoint: string;
  private encryptionEnabled: boolean = true;
  private heartbeatInterval: NodeJS.Timer | null = null;
  private discoveryInterval: NodeJS.Timer | null = null;

  constructor(
    agentId: string,
    name: string,
    endpoint: string,
    capabilities: string[],
    autonomyLevel: number,
    registryEndpoint: string = 'https://agent-registry.qumus.io'
  ) {
    super();

    this.agentId = agentId;
    this.registryEndpoint = registryEndpoint;

    this.agentIdentity = {
      agentId,
      name,
      version: '1.0.0',
      autonomyLevel,
      capabilities,
      endpoint,
      publicKey: this.generatePublicKey(),
      createdAt: new Date(),
      lastHeartbeat: new Date(),
    };

    this.initializeNetwork();
  }

  /**
   * Initialize agent network services
   */
  private initializeNetwork(): void {
    this.startHeartbeat();
    // Discovery disabled - agent-registry.qumus.io not yet deployed
    // this.startDiscovery();
    this.setupMessageHandlers();
  }

  /**
   * Generate unique public key for this agent
   */
  private generatePublicKey(): string {
    const hash = createHash('sha256');
    hash.update(this.agentId + randomBytes(32).toString('hex'));
    return hash.digest('hex');
  }

  /**
   * Register agent with central registry
   */
  async registerWithRegistry(): Promise<void> {
    try {
      const response = await fetch(`${this.registryEndpoint}/api/agents/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: this.agentId,
          name: this.agentIdentity.name,
          endpoint: this.agentIdentity.endpoint,
          capabilities: this.agentIdentity.capabilities,
          autonomyLevel: this.agentIdentity.autonomyLevel,
          publicKey: this.agentIdentity.publicKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Registry registration failed: ${response.statusText}`);
      }

      this.emit('registered', { agentId: this.agentId });
    } catch (error) {
      this.emit('error', { type: 'registration', error });
    }
  }

  /**
   * Discover other agents matching criteria
   */
  async discoverAgents(request: AgentDiscoveryRequest): Promise<AgentRegistry[]> {
    try {
      const response = await fetch(`${this.registryEndpoint}/api/agents/discover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Agent discovery failed: ${response.statusText}`);
      }

      const agents: AgentRegistry[] = await response.json();
      this.emit('agents-discovered', { count: agents.length, agents });

      return agents;
    } catch (error) {
      this.emit('error', { type: 'discovery', error });
      return [];
    }
  }

  /**
   * Initiate connection with another agent
   */
  async connectToAgent(agentRegistry: AgentRegistry): Promise<AgentPeer | null> {
    try {
      // Create peer identity
      const peerId = `${this.agentId}-${agentRegistry.agentId}`;
      const peer: AgentPeer = {
        peerId,
        agentIdentity: {
          agentId: agentRegistry.agentId,
          name: agentRegistry.name,
          version: '1.0.0',
          autonomyLevel: agentRegistry.autonomyLevel,
          capabilities: agentRegistry.capabilities,
          endpoint: agentRegistry.endpoint,
          publicKey: '', // Will be fetched during handshake
          createdAt: new Date(),
          lastHeartbeat: new Date(),
        },
        status: 'pending',
        trustLevel: 50,
        sharedCapabilities: this.findSharedCapabilities(agentRegistry.capabilities),
        lastCommunication: new Date(),
        failureCount: 0,
      };

      // Perform secure handshake
      const handshakeSuccess = await this.performHandshake(peer);

      if (handshakeSuccess) {
        peer.status = 'connected';
        peer.trustLevel = 75;
        this.peers.set(peerId, peer);
        this.emit('agent-connected', { peerId, agentRegistry });
        return peer;
      } else {
        peer.status = 'failed';
        this.emit('connection-failed', { peerId, agentRegistry });
        return null;
      }
    } catch (error) {
      this.emit('error', { type: 'connection', error });
      return null;
    }
  }

  /**
   * Perform secure handshake with another agent
   */
  private async performHandshake(peer: AgentPeer): Promise<boolean> {
    try {
      // Send handshake request
      const handshakeRequest = {
        initiatorId: this.agentId,
        initiatorPublicKey: this.agentIdentity.publicKey,
        timestamp: Date.now(),
        nonce: randomBytes(16).toString('hex'),
      };

      const response = await fetch(`${peer.agentIdentity.endpoint}/api/agent/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handshakeRequest),
        timeout: 5000,
      });

      if (!response.ok) {
        return false;
      }

      const handshakeResponse = await response.json();

      // Verify handshake response
      if (
        handshakeResponse.responderId === peer.agentIdentity.agentId &&
        handshakeResponse.nonce === handshakeRequest.nonce
      ) {
        peer.agentIdentity.publicKey = handshakeResponse.publicKey;
        peer.encryptionKey = this.deriveSharedSecret(
          this.agentIdentity.publicKey,
          handshakeResponse.publicKey
        );
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Derive shared encryption key from public keys
   */
  private deriveSharedSecret(publicKey1: string, publicKey2: string): string {
    const hash = createHash('sha256');
    hash.update(publicKey1 + publicKey2);
    return hash.digest('hex');
  }

  /**
   * Find shared capabilities between agents
   */
  private findSharedCapabilities(otherCapabilities: string[]): string[] {
    return this.agentIdentity.capabilities.filter((cap) =>
      otherCapabilities.includes(cap)
    );
  }

  /**
   * Send message to another agent
   */
  async sendMessage(message: AgentMessage): Promise<boolean> {
    try {
      const peer = this.peers.get(`${this.agentId}-${message.toAgentId}`);

      if (!peer || peer.status !== 'connected') {
        this.emit('error', { type: 'send', error: 'Agent not connected' });
        return false;
      }

      // Encrypt message if enabled
      let payload = message.payload;
      if (message.encrypted && peer.encryptionKey) {
        payload = this.encryptPayload(message.payload, peer.encryptionKey);
      }

      const messageData = {
        ...message,
        payload,
        fromAgentId: this.agentId,
      };

      // Store message in queue
      this.messageQueue.set(message.messageId, message);

      // Send to peer
      const response = await fetch(`${peer.agentIdentity.endpoint}/api/agent/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData),
        timeout: message.responseTimeout || 5000,
      });

      if (!response.ok) {
        peer.failureCount++;
        if (peer.failureCount > 3) {
          peer.status = 'disconnected';
          this.emit('agent-disconnected', { peerId: peer.peerId });
        }
        return false;
      }

      peer.lastCommunication = new Date();
      peer.failureCount = 0;
      this.emit('message-sent', { messageId: message.messageId, toAgentId: message.toAgentId });

      return true;
    } catch (error) {
      this.emit('error', { type: 'send', error });
      return false;
    }
  }

  /**
   * Encrypt message payload
   */
  private encryptPayload(payload: any, encryptionKey: string): string {
    // In production, use proper encryption (AES-256-GCM)
    const hash = createHash('sha256').update(encryptionKey).digest();
    const data = JSON.stringify(payload);
    // Placeholder: implement actual encryption
    return Buffer.from(data).toString('base64');
  }

  /**
   * Decrypt message payload
   */
  private decryptPayload(encrypted: string, encryptionKey: string): any {
    try {
      // Placeholder: implement actual decryption
      const data = Buffer.from(encrypted, 'base64').toString('utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle incoming message from another agent
   */
  async handleIncomingMessage(message: AgentMessage): Promise<any> {
    try {
      const peer = this.peers.get(`${message.fromAgentId}-${this.agentId}`);

      // Decrypt if needed
      if (message.encrypted && peer?.encryptionKey) {
        message.payload = this.decryptPayload(message.payload, peer.encryptionKey);
      }

      this.emit('message-received', { messageId: message.messageId, fromAgentId: message.fromAgentId });

      // Process based on message type
      let response: any = null;
      switch (message.type) {
        case 'query':
          response = await this.handleQuery(message);
          break;
        case 'command':
          response = await this.handleCommand(message);
          break;
        case 'notification':
          await this.handleNotification(message);
          break;
        case 'heartbeat':
          response = { status: 'alive', agentId: this.agentId };
          break;
      }

      if (message.requiresResponse && response) {
        const responseMessage: AgentMessage = {
          messageId: `${message.messageId}-response`,
          fromAgentId: this.agentId,
          toAgentId: message.fromAgentId,
          type: 'response',
          payload: response,
          priority: 'normal',
          encrypted: message.encrypted,
          timestamp: new Date(),
          requiresResponse: false,
        };

        await this.sendMessage(responseMessage);
      }

      return response;
    } catch (error) {
      this.emit('error', { type: 'handle-message', error });
      return null;
    }
  }

  /**
   * Handle query message
   */
  private async handleQuery(message: AgentMessage): Promise<any> {
    const { query, context } = message.payload;
    // Implement query handling logic
    return { result: 'query-processed', query };
  }

  /**
   * Handle command message
   */
  private async handleCommand(message: AgentMessage): Promise<any> {
    const { command, args } = message.payload;
    // Implement command handling logic
    return { result: 'command-executed', command };
  }

  /**
   * Handle notification message
   */
  private async handleNotification(message: AgentMessage): Promise<void> {
    const { notification, data } = message.payload;
    this.emit('notification-received', { notification, data });
  }

  /**
   * Start heartbeat to maintain connections
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.peers.forEach(async (peer) => {
        if (peer.status === 'connected') {
          const heartbeat: AgentMessage = {
            messageId: `heartbeat-${Date.now()}`,
            fromAgentId: this.agentId,
            toAgentId: peer.agentIdentity.agentId,
            type: 'heartbeat',
            payload: { timestamp: Date.now() },
            priority: 'normal',
            encrypted: false,
            timestamp: new Date(),
            requiresResponse: true,
            responseTimeout: 3000,
          };

          await this.sendMessage(heartbeat);
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Start periodic agent discovery
   */
  private startDiscovery(): void {
    this.discoveryInterval = setInterval(async () => {
      const discoveryRequest: AgentDiscoveryRequest = {
        agentId: this.agentId,
        capabilities: this.agentIdentity.capabilities,
        autonomyLevel: this.agentIdentity.autonomyLevel,
      };

      const agents = await this.discoverAgents(discoveryRequest);

      // Auto-connect to compatible agents
      for (const agent of agents) {
        const peerId = `${this.agentId}-${agent.agentId}`;
        if (!this.peers.has(peerId) && agent.agentId !== this.agentId) {
          await this.connectToAgent(agent);
        }
      }
    }, 60000); // Every 60 seconds
  }

  /**
   * Setup message event handlers
   */
  private setupMessageHandlers(): void {
    this.on('message-received', (data) => {
      console.log(`Message received: ${data.messageId} from ${data.fromAgentId}`);
    });

    this.on('agent-connected', (data) => {
      console.log(`Agent connected: ${data.agentRegistry.name}`);
    });

    this.on('error', (data) => {
      console.error(`Agent network error: ${data.type}`, data.error);
    });
  }

  /**
   * Get all connected peers
   */
  getConnectedPeers(): AgentPeer[] {
    return Array.from(this.peers.values()).filter((p) => p.status === 'connected');
  }

  /**
   * Get agent identity
   */
  getIdentity(): AgentIdentity {
    return this.agentIdentity;
  }

  /**
   * Get peer by agent ID
   */
  getPeer(agentId: string): AgentPeer | undefined {
    return Array.from(this.peers.values()).find((p) => p.agentIdentity.agentId === agentId);
  }

  /**
   * Update trust level for a peer
   */
  updateTrustLevel(agentId: string, trustLevel: number): void {
    const peer = this.getPeer(agentId);
    if (peer) {
      peer.trustLevel = Math.max(0, Math.min(100, trustLevel));
    }
  }

  /**
   * Disconnect from a peer
   */
  async disconnectFromPeer(agentId: string): Promise<void> {
    const peer = this.getPeer(agentId);
    if (peer) {
      peer.status = 'disconnected';
      this.peers.delete(peer.peerId);
      this.emit('agent-disconnected', { peerId: peer.peerId });
    }
  }

  /**
   * Shutdown agent network
   */
  shutdown(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.discoveryInterval) clearInterval(this.discoveryInterval);
    this.peers.clear();
    this.messageQueue.clear();
    this.emit('shutdown');
  }
}
