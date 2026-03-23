import { EventEmitter } from 'events';

/**
 * Ty OS Command API
 * Bidirectional communication interface between Ty OS (operating system) and QUMUS/Trinity (autonomous agent)
 * Ty OS sends commands → QUMUS executes → QUMUS reports status back to Ty OS
 */

export interface TyOSCommand {
  id: string;
  timestamp: number;
  source: 'ty-os';
  commandType: 'update' | 'control' | 'query' | 'override' | 'schedule' | 'broadcast';
  target: 'rrb-radio' | 'hybridcast' | 'canryn' | 'sweet-miracles' | 'all' | 'qumus';
  action: string;
  params?: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  requiresApproval?: boolean;
  executionMode?: 'immediate' | 'scheduled' | 'queued';
}

export interface QUMUSResponse {
  id: string;
  commandId: string;
  timestamp: number;
  status: 'received' | 'processing' | 'executed' | 'failed' | 'queued';
  result?: any;
  error?: string;
  subsystemsAffected?: string[];
  decisionsLogged?: number;
  autonomyLevel?: number;
  nextUpdate?: number;
}

export interface EcosystemStatus {
  timestamp: number;
  qumusHealth: {
    isRunning: boolean;
    subsystems: number;
    policies: number;
    autonomyLevel: number;
    decisions24h: number;
  };
  subsystems: {
    'rrb-radio': { status: 'operational' | 'degraded' | 'offline'; health: number; listeners?: number };
    'hybridcast': { status: 'operational' | 'degraded' | 'offline'; health: number; channels?: number };
    'canryn': { status: 'operational' | 'degraded' | 'offline'; health: number };
    'sweet-miracles': { status: 'operational' | 'degraded' | 'offline'; health: number };
  };
  recentDecisions: Array<{
    policyId: string;
    decision: string;
    timestamp: number;
    impact: string;
  }>;
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: number;
  }>;
}

export class TyOSCommandAPI extends EventEmitter {
  private commandQueue: Map<string, TyOSCommand> = new Map();
  private responseBuffer: Map<string, QUMUSResponse> = new Map();
  private ecosystemStatus: EcosystemStatus | null = null;
  private commandHistory: TyOSCommand[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super();
    this.initializeAPI();
  }

  private initializeAPI() {
    console.log('[Ty OS Command API] Initialized - Ready to receive commands from Ty OS');
    this.emit('api:initialized', { timestamp: Date.now() });
  }

  /**
   * Ty OS sends a command to QUMUS
   */
  async receiveCommand(command: Omit<TyOSCommand, 'id' | 'timestamp' | 'source'>): Promise<string> {
    const fullCommand: TyOSCommand = {
      ...command,
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      source: 'ty-os',
    };

    // Store in queue
    this.commandQueue.set(fullCommand.id, fullCommand);
    this.commandHistory.push(fullCommand);

    // Trim history if too large
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }

    console.log(`[Ty OS] Command received: ${fullCommand.id}`, {
      commandType: fullCommand.commandType,
      target: fullCommand.target,
      action: fullCommand.action,
      priority: fullCommand.priority,
    });

    // Emit event for QUMUS to process
    this.emit('command:received', fullCommand);

    return fullCommand.id;
  }

  /**
   * QUMUS sends a response back to Ty OS
   */
  async sendResponse(response: QUMUSResponse): Promise<void> {
    this.responseBuffer.set(response.commandId, response);

    console.log(`[QUMUS Response] ${response.commandId}`, {
      status: response.status,
      subsystemsAffected: response.subsystemsAffected,
      autonomyLevel: response.autonomyLevel,
    });

    this.emit('response:sent', response);
  }

  /**
   * Ty OS queries current ecosystem status
   */
  async queryEcosystemStatus(): Promise<EcosystemStatus | null> {
    console.log('[Ty OS] Querying ecosystem status...');
    this.emit('status:queried', { timestamp: Date.now() });
    return this.ecosystemStatus;
  }

  /**
   * QUMUS updates ecosystem status for Ty OS
   */
  async updateEcosystemStatus(status: EcosystemStatus): Promise<void> {
    this.ecosystemStatus = status;
    console.log('[QUMUS] Ecosystem status updated', {
      qumusHealth: status.qumusHealth,
      subsystemsStatus: Object.entries(status.subsystems).map(([name, data]) => ({
        name,
        status: data.status,
        health: data.health,
      })),
    });

    this.emit('status:updated', status);
  }

  /**
   * Get command from queue
   */
  getCommand(commandId: string): TyOSCommand | undefined {
    return this.commandQueue.get(commandId);
  }

  /**
   * Get response for Ty OS
   */
  getResponse(commandId: string): QUMUSResponse | undefined {
    return this.responseBuffer.get(commandId);
  }

  /**
   * Get all pending commands
   */
  getPendingCommands(): TyOSCommand[] {
    return Array.from(this.commandQueue.values()).filter(
      (cmd) => !this.responseBuffer.has(cmd.id)
    );
  }

  /**
   * Get command history for audit trail
   */
  getCommandHistory(limit: number = 50): TyOSCommand[] {
    return this.commandHistory.slice(-limit);
  }

  /**
   * Clear processed command
   */
  clearCommand(commandId: string): void {
    this.commandQueue.delete(commandId);
  }

  /**
   * Ty OS sends real-time status update request
   */
  async subscribeToStatusUpdates(callback: (status: EcosystemStatus) => void): Promise<void> {
    this.on('status:updated', callback);
    console.log('[Ty OS] Subscribed to real-time status updates');
  }

  /**
   * Ty OS sends override command (human intervention)
   */
  async sendOverrideCommand(
    targetSystem: string,
    action: string,
    params?: Record<string, any>
  ): Promise<string> {
    const commandId = await this.receiveCommand({
      commandType: 'override',
      target: targetSystem as any,
      action,
      params,
      priority: 'critical',
      requiresApproval: false,
    });

    console.log('[Ty OS Override] Human intervention command sent', {
      commandId,
      targetSystem,
      action,
    });

    return commandId;
  }

  /**
   * Get API status
   */
  getAPIStatus() {
    return {
      isRunning: true,
      pendingCommands: this.commandQueue.size,
      responseBuffer: this.responseBuffer.size,
      commandHistorySize: this.commandHistory.length,
      lastEcosystemStatus: this.ecosystemStatus?.timestamp,
      uptime: Date.now(),
    };
  }
}

// Singleton instance
export const tyOSCommandAPI = new TyOSCommandAPI();
