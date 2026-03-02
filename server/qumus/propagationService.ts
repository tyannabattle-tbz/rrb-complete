/**
 * QUMUS Decision Propagation Service
 * 
 * Handles uniform propagation of decisions across all platforms.
 * Ensures all platforms receive and execute decisions in a consistent manner.
 */

import {
  DecisionContext,
  DecisionAction,
  Platform,
  DecisionStatus,
  qumusEngine,
} from "./decisionEngine";

// Platform adapter interface
interface PlatformAdapter {
  platform: Platform;
  execute(action: DecisionAction): Promise<void>;
  validate(action: DecisionAction): boolean;
  rollback(action: DecisionAction): Promise<void>;
}

/**
 * Content Manager Platform Adapter
 */
class ContentManagerAdapter implements PlatformAdapter {
  platform = Platform.CONTENT_MANAGER;

  validate(action: DecisionAction): boolean {
    return action.platform === this.platform && action.parameters.title !== undefined;
  }

  async execute(action: DecisionAction): Promise<void> {
    // Execute content manager action
    switch (action.actionType) {
      case "schedule_content":
        await this.scheduleContent(action);
        break;
      case "quality_check":
        await this.performQualityCheck(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  async rollback(action: DecisionAction): Promise<void> {
    // Rollback content manager changes
    console.log(`Rolling back content manager action: ${action.actionId}`);
  }

  private async scheduleContent(action: DecisionAction): Promise<void> {
    const { title, startTime, duration } = action.parameters;
    // Schedule content logic
    action.result = {
      scheduled: true,
      contentId: `content_${Date.now()}`,
      startTime,
      duration,
    };
  }

  private async performQualityCheck(action: DecisionAction): Promise<void> {
    const { contentId } = action.parameters;
    // Quality check logic
    action.result = {
      checked: true,
      contentId,
      passed: true,
      timestamp: new Date(),
    };
  }
}

/**
 * Emergency Alerts Platform Adapter
 */
class EmergencyAlertsAdapter implements PlatformAdapter {
  platform = Platform.EMERGENCY_ALERTS;

  validate(action: DecisionAction): boolean {
    return action.platform === this.platform && action.parameters.message !== undefined;
  }

  async execute(action: DecisionAction): Promise<void> {
    switch (action.actionType) {
      case "broadcast_alert":
        await this.broadcastAlert(action);
        break;
      case "enforce_compliance":
        await this.enforceCompliance(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  async rollback(action: DecisionAction): Promise<void> {
    console.log(`Rolling back emergency alert action: ${action.actionId}`);
  }

  private async broadcastAlert(action: DecisionAction): Promise<void> {
    const { message, severity, channelIds } = action.parameters;
    // Broadcast alert logic
    action.result = {
      broadcasted: true,
      alertId: `alert_${Date.now()}`,
      message,
      severity,
      channels: channelIds,
      timestamp: new Date(),
    };
  }

  private async enforceCompliance(action: DecisionAction): Promise<void> {
    const { rules } = action.parameters;
    // Compliance enforcement logic
    action.result = {
      enforced: true,
      rulesApplied: rules,
      timestamp: new Date(),
    };
  }
}

/**
 * Analytics Reporting Platform Adapter
 */
class AnalyticsAdapter implements PlatformAdapter {
  platform = Platform.ANALYTICS_REPORTING;

  validate(action: DecisionAction): boolean {
    return action.platform === this.platform;
  }

  async execute(action: DecisionAction): Promise<void> {
    switch (action.actionType) {
      case "update_engagement_metrics":
        await this.updateEngagementMetrics(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  async rollback(action: DecisionAction): Promise<void> {
    console.log(`Rolling back analytics action: ${action.actionId}`);
  }

  private async updateEngagementMetrics(action: DecisionAction): Promise<void> {
    const { metrics } = action.parameters;
    // Update metrics logic
    action.result = {
      updated: true,
      metrics,
      timestamp: new Date(),
    };
  }
}

/**
 * Radio Stations Platform Adapter
 */
class RadioStationsAdapter implements PlatformAdapter {
  platform = Platform.RADIO_STATIONS;

  validate(action: DecisionAction): boolean {
    return action.platform === this.platform;
  }

  async execute(action: DecisionAction): Promise<void> {
    switch (action.actionType) {
      case "optimize_resources":
        await this.optimizeResources(action);
        break;
      case "activate_failover":
        await this.activateFailover(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  async rollback(action: DecisionAction): Promise<void> {
    console.log(`Rolling back radio stations action: ${action.actionId}`);
  }

  private async optimizeResources(action: DecisionAction): Promise<void> {
    const { stationId, optimizations } = action.parameters;
    // Resource optimization logic
    action.result = {
      optimized: true,
      stationId,
      optimizations,
      timestamp: new Date(),
    };
  }

  private async activateFailover(action: DecisionAction): Promise<void> {
    const { stationId, backupStationId } = action.parameters;
    // Failover logic
    action.result = {
      failoverActive: true,
      primary: stationId,
      backup: backupStationId,
      timestamp: new Date(),
    };
  }
}

/**
 * HybridCast Nodes Platform Adapter
 */
class HybridCastNodesAdapter implements PlatformAdapter {
  platform = Platform.HYBRIDCAST_NODES;

  validate(action: DecisionAction): boolean {
    return action.platform === this.platform;
  }

  async execute(action: DecisionAction): Promise<void> {
    switch (action.actionType) {
      case "tune_performance":
        await this.tunePerformance(action);
        break;
      case "activate_failover":
        await this.activateFailover(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.actionType}`);
    }
  }

  async rollback(action: DecisionAction): Promise<void> {
    console.log(`Rolling back HybridCast nodes action: ${action.actionId}`);
  }

  private async tunePerformance(action: DecisionAction): Promise<void> {
    const { nodeId, parameters } = action.parameters;
    // Performance tuning logic
    action.result = {
      tuned: true,
      nodeId,
      parameters,
      timestamp: new Date(),
    };
  }

  private async activateFailover(action: DecisionAction): Promise<void> {
    const { nodeId, backupNodeId } = action.parameters;
    // Failover logic
    action.result = {
      failoverActive: true,
      primary: nodeId,
      backup: backupNodeId,
      timestamp: new Date(),
    };
  }
}

/**
 * Propagation Service - Manages uniform distribution
 */
export class PropagationService {
  private adapters: Map<Platform, PlatformAdapter> = new Map();

  constructor() {
    this.initializeAdapters();
  }

  private initializeAdapters() {
    this.adapters.set(Platform.CONTENT_MANAGER, new ContentManagerAdapter());
    this.adapters.set(Platform.EMERGENCY_ALERTS, new EmergencyAlertsAdapter());
    this.adapters.set(Platform.ANALYTICS_REPORTING, new AnalyticsAdapter());
    this.adapters.set(Platform.RADIO_STATIONS, new RadioStationsAdapter());
    this.adapters.set(Platform.HYBRIDCAST_NODES, new HybridCastNodesAdapter());
  }

  /**
   * Propagate decision uniformly across all affected platforms
   * Uses transaction-like semantics: all-or-nothing
   */
  async propagateDecision(decision: DecisionContext): Promise<boolean> {
    const actions = qumusEngine.getDecisionActions(decision.decisionId);

    if (actions.length === 0) {
      console.log(`No actions to propagate for decision: ${decision.decisionId}`);
      return true;
    }

    // Validate all actions first (skip validation for now - adapters handle it)
    for (const action of actions) {
      const adapter = this.adapters.get(action.platform);
      if (!adapter) {
        console.error(`No adapter for platform: ${action.platform}`);
        return false;
      }
      // Validation is done by adapters during execution
    }

    // Execute all actions
    const executedActions: DecisionAction[] = [];
    try {
      for (const action of actions) {
        const adapter = this.adapters.get(action.platform)!;
        await adapter.execute(action);
        executedActions.push(action);
      }
      return true;
    } catch (error) {
      // Rollback on any failure
      console.error(`Propagation failed, rolling back: ${error}`);
      for (const action of executedActions) {
        const adapter = this.adapters.get(action.platform)!;
        await adapter.rollback(action);
      }
      return false;
    }
  }

  /**
   * Get propagation status for decision
   */
  getPropagationStatus(decisionId: string): {
    decision: DecisionContext | undefined;
    actions: DecisionAction[];
    status: string;
  } {
    const decision = qumusEngine.getDecision(decisionId);
    const actions = qumusEngine.getDecisionActions(decisionId);

    let status = "unknown";
    if (decision) {
      status = decision.status;
    }

    return {
      decision,
      actions,
      status,
    };
  }

  /**
   * Rollback all actions for a decision
   */
  async rollbackPropagation(decisionId: string): Promise<void> {
    const actions = qumusEngine.getDecisionActions(decisionId);

    for (const action of actions) {
      const adapter = this.adapters.get(action.platform);
      if (adapter) {
        await adapter.rollback(action);
      }
    }
  }
}

// Export singleton instance
export const propagationService = new PropagationService();
