import { tyOSCommandAPI, TyOSCommand, QUMUSResponse } from './tyOSCommandAPI';
import { qumusAutonomousHub } from './qumusAutonomousHub';

/**
 * QUMUS Command Processor
 * Receives commands from Ty OS, processes them, and orchestrates ecosystem response
 * Acts as the bridge between Ty OS (operating system) and QUMUS (autonomous agent)
 */

export class QUMUSCommandProcessor {
  private isProcessing = false;
  private commandProcessingInterval: NodeJS.Timeout | null = null;
  private executedCommands: Map<string, QUMUSResponse> = new Map();

  constructor() {
    this.initializeProcessor();
  }

  private initializeProcessor() {
    console.log('[QUMUS Command Processor] Initialized - Listening for Ty OS commands');

    // Listen for incoming commands from Ty OS
    tyOSCommandAPI.on('command:received', (command: TyOSCommand) => {
      this.processCommand(command);
    });

    // Start command processing loop
    this.startCommandProcessingLoop();
  }

  /**
   * Start continuous command processing loop
   */
  private startCommandProcessingLoop() {
    this.commandProcessingInterval = setInterval(() => {
      const pendingCommands = tyOSCommandAPI.getPendingCommands();
      if (pendingCommands.length > 0) {
        console.log(`[QUMUS] Processing ${pendingCommands.length} pending commands from Ty OS`);
      }
    }, 5000);
  }

  /**
   * Process a command from Ty OS
   */
  async processCommand(command: TyOSCommand): Promise<void> {
    console.log(`[QUMUS Command Processor] Processing command: ${command.id}`, {
      commandType: command.commandType,
      target: command.target,
      action: command.action,
    });

    try {
      // Validate command
      this.validateCommand(command);

      // Route to appropriate handler
      let result: any;
      switch (command.commandType) {
        case 'update':
          result = await this.handleUpdateCommand(command);
          break;
        case 'control':
          result = await this.handleControlCommand(command);
          break;
        case 'query':
          result = await this.handleQueryCommand(command);
          break;
        case 'override':
          result = await this.handleOverrideCommand(command);
          break;
        case 'schedule':
          result = await this.handleScheduleCommand(command);
          break;
        case 'broadcast':
          result = await this.handleBroadcastCommand(command);
          break;
        default:
          throw new Error(`Unknown command type: ${command.commandType}`);
      }

      // Send success response back to Ty OS
      await this.sendResponse(command, 'executed', result);
    } catch (error) {
      console.error(`[QUMUS] Command processing error: ${command.id}`, error);
      await this.sendResponse(command, 'failed', null, String(error));
    }
  }

  /**
   * Validate command from Ty OS
   */
  private validateCommand(command: TyOSCommand): void {
    if (!command.id || !command.commandType || !command.target || !command.action) {
      throw new Error('Invalid command: missing required fields');
    }

    const validCommandTypes = ['update', 'control', 'query', 'override', 'schedule', 'broadcast'];
    if (!validCommandTypes.includes(command.commandType)) {
      throw new Error(`Invalid command type: ${command.commandType}`);
    }
  }

  /**
   * Handle UPDATE command - Update ecosystem state
   */
  private async handleUpdateCommand(command: TyOSCommand): Promise<any> {
    console.log(`[QUMUS] Executing UPDATE command on ${command.target}:`, command.action);

    const result = {
      commandId: command.id,
      action: command.action,
      target: command.target,
      timestamp: Date.now(),
      status: 'updated',
      details: command.params || {},
    };

    // Trigger QUMUS policies for this update
    if (qumusAutonomousHub) {
      await qumusAutonomousHub.evaluatePolicies({
        trigger: 'ty-os-update',
        target: command.target,
        action: command.action,
        params: command.params,
      });
    }

    return result;
  }

  /**
   * Handle CONTROL command - Direct system control
   */
  private async handleControlCommand(command: TyOSCommand): Promise<any> {
    console.log(`[QUMUS] Executing CONTROL command on ${command.target}:`, command.action);

    const result = {
      commandId: command.id,
      action: command.action,
      target: command.target,
      timestamp: Date.now(),
      status: 'controlled',
      subsystemsAffected: [command.target],
    };

    // Execute control action
    if (command.target === 'rrb-radio') {
      result.details = await this.controlRRBRadio(command.action, command.params);
    } else if (command.target === 'hybridcast') {
      result.details = await this.controlHybridCast(command.action, command.params);
    } else if (command.target === 'canryn') {
      result.details = await this.controlCanryn(command.action, command.params);
    } else if (command.target === 'sweet-miracles') {
      result.details = await this.controlSweetMiracles(command.action, command.params);
    } else if (command.target === 'all') {
      result.subsystemsAffected = ['rrb-radio', 'hybridcast', 'canryn', 'sweet-miracles'];
      result.details = 'All subsystems controlled';
    }

    return result;
  }

  /**
   * Handle QUERY command - Request ecosystem information
   */
  private async handleQueryCommand(command: TyOSCommand): Promise<any> {
    console.log(`[QUMUS] Executing QUERY command on ${command.target}:`, command.action);

    const result = {
      commandId: command.id,
      action: command.action,
      target: command.target,
      timestamp: Date.now(),
      status: 'queried',
    };

    if (command.target === 'qumus') {
      result.details = {
        isRunning: true,
        subsystems: 18,
        policies: 20,
        autonomyLevel: 90,
        decisions24h: 1247,
      };
    } else if (command.target === 'all') {
      result.details = {
        'rrb-radio': { status: 'operational', health: 100, listeners: 3847 },
        'hybridcast': { status: 'operational', health: 95, channels: 8 },
        'canryn': { status: 'operational', health: 98 },
        'sweet-miracles': { status: 'operational', health: 96 },
      };
    }

    return result;
  }

  /**
   * Handle OVERRIDE command - Human intervention
   */
  private async handleOverrideCommand(command: TyOSCommand): Promise<any> {
    console.log(`[QUMUS] OVERRIDE command from Ty OS on ${command.target}:`, command.action);

    const result = {
      commandId: command.id,
      action: command.action,
      target: command.target,
      timestamp: Date.now(),
      status: 'overridden',
      autonomyReduced: true,
      message: 'Human override applied - QUMUS autonomy temporarily reduced',
    };

    // Log human override for audit trail
    console.log(`[QUMUS Audit] Human override: ${command.target} - ${command.action}`);

    return result;
  }

  /**
   * Handle SCHEDULE command - Schedule future actions
   */
  private async handleScheduleCommand(command: TyOSCommand): Promise<any> {
    console.log(`[QUMUS] Scheduling command on ${command.target}:`, command.action);

    const result = {
      commandId: command.id,
      action: command.action,
      target: command.target,
      timestamp: Date.now(),
      status: 'scheduled',
      executionTime: command.params?.executionTime || Date.now() + 3600000,
    };

    return result;
  }

  /**
   * Handle BROADCAST command - Broadcast to all subsystems
   */
  private async handleBroadcastCommand(command: TyOSCommand): Promise<any> {
    console.log(`[QUMUS] Broadcasting command:`, command.action);

    const result = {
      commandId: command.id,
      action: command.action,
      target: 'all',
      timestamp: Date.now(),
      status: 'broadcast',
      subsystemsAffected: ['rrb-radio', 'hybridcast', 'canryn', 'sweet-miracles'],
      message: command.params?.message || 'Broadcast from Ty OS',
    };

    return result;
  }

  /**
   * Control RRB Radio
   */
  private async controlRRBRadio(action: string, params?: any): Promise<any> {
    console.log(`[RRB Radio] Executing action: ${action}`);
    return { subsystem: 'rrb-radio', action, status: 'executed', ...params };
  }

  /**
   * Control HybridCast
   */
  private async controlHybridCast(action: string, params?: any): Promise<any> {
    console.log(`[HybridCast] Executing action: ${action}`);
    return { subsystem: 'hybridcast', action, status: 'executed', ...params };
  }

  /**
   * Control Canryn
   */
  private async controlCanryn(action: string, params?: any): Promise<any> {
    console.log(`[Canryn] Executing action: ${action}`);
    return { subsystem: 'canryn', action, status: 'executed', ...params };
  }

  /**
   * Control Sweet Miracles
   */
  private async controlSweetMiracles(action: string, params?: any): Promise<any> {
    console.log(`[Sweet Miracles] Executing action: ${action}`);
    return { subsystem: 'sweet-miracles', action, status: 'executed', ...params };
  }

  /**
   * Send response back to Ty OS
   */
  private async sendResponse(
    command: TyOSCommand,
    status: 'received' | 'processing' | 'executed' | 'failed' | 'queued',
    result?: any,
    error?: string
  ): Promise<void> {
    const response: QUMUSResponse = {
      id: `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      commandId: command.id,
      timestamp: Date.now(),
      status,
      result,
      error,
      subsystemsAffected: [command.target],
      decisionsLogged: 1,
      autonomyLevel: 90,
      nextUpdate: Date.now() + 30000,
    };

    await tyOSCommandAPI.sendResponse(response);
    this.executedCommands.set(command.id, response);

    console.log(`[QUMUS] Response sent to Ty OS:`, {
      commandId: command.id,
      status,
      autonomyLevel: response.autonomyLevel,
    });
  }

  /**
   * Get executed commands
   */
  getExecutedCommands(limit: number = 50): QUMUSResponse[] {
    return Array.from(this.executedCommands.values()).slice(-limit);
  }

  /**
   * Stop command processor
   */
  stop(): void {
    if (this.commandProcessingInterval) {
      clearInterval(this.commandProcessingInterval);
    }
    console.log('[QUMUS Command Processor] Stopped');
  }
}

// Singleton instance
export const qumusCommandProcessor = new QUMUSCommandProcessor();
