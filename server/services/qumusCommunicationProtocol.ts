/**
 * QUMUS Communication & Sync Protocol
 * Real-time synchronization and communication across all subsystems
 */

export interface SyncMessage {
  id: string;
  source: string;
  destination: string;
  type: 'state-sync' | 'command' | 'response' | 'heartbeat' | 'emergency';
  payload: Record<string, any>;
  timestamp: number;
  priority: 'critical' | 'high' | 'normal' | 'low';
  requiresAck: boolean;
  ackReceived: boolean;
  retries: number;
  maxRetries: number;
}

export interface SyncState {
  systemId: string;
  version: number;
  state: Record<string, any>;
  hash: string;
  timestamp: number;
  subsystemStates: Map<string, { version: number; hash: string; timestamp: number }>;
}

class QUMUSCommunicationProtocol {
  private messageQueue: SyncMessage[] = [];
  private messageLog: SyncMessage[] = [];
  private syncStates: Map<string, SyncState> = new Map();
  private ackWaiters: Map<string, { resolve: Function; timeout: NodeJS.Timer }> = new Map();
  private syncInterval: NodeJS.Timer | null = null;
  private communicationStats = {
    messagesSent: 0,
    messagesReceived: 0,
    acksReceived: 0,
    failedMessages: 0,
    avgLatency: 0,
    syncSuccessRate: 0,
  };

  constructor() {
    this.startCommunicationLoop();
    this.startSyncLoop();
  }

  async sendMessage(
    source: string,
    destination: string,
    type: SyncMessage['type'],
    payload: Record<string, any>,
    priority: SyncMessage['priority'] = 'normal',
    requiresAck: boolean = true
  ): Promise<SyncMessage> {
    const message: SyncMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      source,
      destination,
      type,
      payload,
      timestamp: Date.now(),
      priority,
      requiresAck,
      ackReceived: false,
      retries: 0,
      maxRetries: 3,
    };

    this.messageQueue.push(message);
    this.messageLog.push(message);
    this.communicationStats.messagesSent++;

    console.log(`[Communication] Message queued: ${source} -> ${destination} (${type})`);

    if (requiresAck) {
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Message acknowledgment timeout'));
          this.communicationStats.failedMessages++;
        }, 5000);

        this.ackWaiters.set(message.id, { resolve, timeout });
      });
    }

    return message;
  }

  async acknowledgeMessage(messageId: string): Promise<boolean> {
    const waiter = this.ackWaiters.get(messageId);
    if (waiter) {
      clearTimeout(waiter.timeout);
      waiter.resolve({ ackReceived: true });
      this.ackWaiters.delete(messageId);
      this.communicationStats.acksReceived++;
      return true;
    }
    return false;
  }

  private async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          await this.deliverMessage(message);
        } catch (error) {
          message.retries++;
          if (message.retries < message.maxRetries) {
            this.messageQueue.push(message);
          } else {
            this.communicationStats.failedMessages++;
            console.error(`[Communication] Message delivery failed: ${message.id}`);
          }
        }
      }
    }
  }

  private async deliverMessage(message: SyncMessage): Promise<void> {
    console.log(`[Communication] Delivering: ${message.source} -> ${message.destination}`);

    // Simulate network latency
    const latency = Math.random() * 100 + 10;
    await new Promise((resolve) => setTimeout(resolve, latency));

    this.communicationStats.avgLatency = (this.communicationStats.avgLatency + latency) / 2;

    if (message.requiresAck) {
      message.ackReceived = true;
      await this.acknowledgeMessage(message.id);
    }
  }

  private startCommunicationLoop() {
    setInterval(async () => {
      await this.processMessageQueue();
    }, 100);
  }

  private startSyncLoop() {
    this.syncInterval = setInterval(async () => {
      await this.synchronizeAllSystems();
    }, 30000); // Every 30 seconds
  }

  async synchronizeAllSystems(): Promise<Record<string, any>> {
    console.log('[Communication] Starting full system synchronization...');

    const syncResults: Record<string, any> = {};
    const systems = ['rrb-radio', 'hybridcast', 'canryn', 'sweet-miracles', 'admin'];

    for (const system of systems) {
      try {
        const syncState = await this.syncSystem(system);
        syncResults[system] = { status: 'synced', state: syncState };
      } catch (error) {
        syncResults[system] = { status: 'error', error: (error as Error).message };
      }
    }

    // Verify consistency
    const consistencyCheck = this.verifyConsistency(syncResults);
    syncResults.consistencyCheck = consistencyCheck;

    console.log('[Communication] Synchronization complete');
    return syncResults;
  }

  private async syncSystem(systemId: string): Promise<SyncState> {
    const currentState = this.syncStates.get(systemId) || {
      systemId,
      version: 0,
      state: {},
      hash: '',
      timestamp: Date.now(),
      subsystemStates: new Map(),
    };

    // Increment version
    currentState.version++;
    currentState.timestamp = Date.now();

    // Generate hash of state
    currentState.hash = this.generateHash(currentState.state);

    // Update subsystem states
    const systems = ['rrb-radio', 'hybridcast', 'canryn', 'sweet-miracles'];
    for (const sys of systems) {
      if (sys !== systemId) {
        const subsystemState = this.syncStates.get(sys);
        if (subsystemState) {
          currentState.subsystemStates.set(sys, {
            version: subsystemState.version,
            hash: subsystemState.hash,
            timestamp: subsystemState.timestamp,
          });
        }
      }
    }

    this.syncStates.set(systemId, currentState);

    // Send sync message
    await this.sendMessage('qumus-core', systemId, 'state-sync', {
      version: currentState.version,
      state: currentState.state,
      hash: currentState.hash,
    });

    return currentState;
  }

  private verifyConsistency(syncResults: Record<string, any>): Record<string, any> {
    const states = Object.values(syncResults)
      .filter((r: any) => r.status === 'synced')
      .map((r: any) => r.state);

    if (states.length === 0) {
      return { consistent: false, reason: 'No synced states' };
    }

    // Check if all states have same version
    const versions = states.map((s: any) => s.version);
    const allSameVersion = versions.every((v) => v === versions[0]);

    // Check if hashes match
    const hashes = states.map((s: any) => s.hash);
    const allSameHash = hashes.every((h) => h === hashes[0]);

    return {
      consistent: allSameVersion && allSameHash,
      allSameVersion,
      allSameHash,
      versions,
      hashes,
    };
  }

  private generateHash(obj: any): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  async broadcastMessage(
    source: string,
    type: SyncMessage['type'],
    payload: Record<string, any>,
    priority: SyncMessage['priority'] = 'normal'
  ): Promise<SyncMessage[]> {
    const systems = ['rrb-radio', 'hybridcast', 'canryn', 'sweet-miracles', 'admin'];
    const messages: SyncMessage[] = [];

    for (const system of systems) {
      if (system !== source) {
        const message = await this.sendMessage(source, system, type, payload, priority, false);
        messages.push(message);
      }
    }

    return messages;
  }

  async sendEmergencyBroadcast(message: string, severity: 'critical' | 'high' | 'medium'): Promise<SyncMessage> {
    console.log(`[Communication] EMERGENCY BROADCAST: ${message}`);

    return this.sendMessage('qumus-core', 'all', 'emergency', {
      message,
      severity,
      timestamp: Date.now(),
    });
  }

  getMessageLog(limit: number = 100): SyncMessage[] {
    return this.messageLog.slice(-limit).reverse();
  }

  getSyncState(systemId: string): SyncState | undefined {
    return this.syncStates.get(systemId);
  }

  getAllSyncStates(): Record<string, SyncState> {
    const result: Record<string, SyncState> = {};
    for (const [key, value] of this.syncStates) {
      result[key] = value;
    }
    return result;
  }

  getCommunicationStats() {
    const successRate = this.communicationStats.messagesSent > 0
      ? (((this.communicationStats.messagesSent - this.communicationStats.failedMessages) / this.communicationStats.messagesSent) * 100).toFixed(2) + '%'
      : 'N/A';

    return {
      messagesSent: this.communicationStats.messagesSent,
      messagesReceived: this.communicationStats.messagesReceived,
      acksReceived: this.communicationStats.acksReceived,
      failedMessages: this.communicationStats.failedMessages,
      successRate,
      avgLatency: this.communicationStats.avgLatency.toFixed(2) + 'ms',
      queueLength: this.messageQueue.length,
      logSize: this.messageLog.length,
    };
  }

  resetCommunicationStats() {
    this.communicationStats = {
      messagesSent: 0,
      messagesReceived: 0,
      acksReceived: 0,
      failedMessages: 0,
      avgLatency: 0,
      syncSuccessRate: 0,
    };
    console.log('[Communication] Stats reset');
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('[Communication] Sync stopped');
  }

  startSync() {
    if (!this.syncInterval) {
      this.syncInterval = setInterval(async () => {
        await this.synchronizeAllSystems();
      }, 30000);
    }
    console.log('[Communication] Sync started');
  }
}

export const qumusCommunicationProtocol = new QUMUSCommunicationProtocol();
