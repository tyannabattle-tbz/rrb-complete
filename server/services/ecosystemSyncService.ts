import { db } from '../db';
import { flowpayAuditLog } from '../../drizzle/schema';
import { notifyOwner } from '../_core/notification';

interface SyncOperation {
  id: string;
  source: string;
  target: string;
  dataType: string;
  recordCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

interface SyncMapping {
  id: string;
  source: string;
  target: string;
  fieldMappings: Record<string, string>;
  transformRules: Array<{
    field: string;
    rule: string;
    value?: any;
  }>;
  active: boolean;
}

interface SyncMetrics {
  totalOperations: number;
  successfulOperations: number;
  failedOperations: number;
  totalRecordsSynced: number;
  averageSyncTime: number;
  lastSyncTime: Date;
}

/**
 * Ecosystem Sync Service
 * Manages data synchronization across FlowPay, HybridCast, SQUADD, and Content Calendar
 */
export class EcosystemSyncService {
  private syncOperations: Map<string, SyncOperation> = new Map();
  private syncMappings: Map<string, SyncMapping> = new Map();
  private syncMetrics: SyncMetrics = {
    totalOperations: 0,
    successfulOperations: 0,
    failedOperations: 0,
    totalRecordsSynced: 0,
    averageSyncTime: 0,
    lastSyncTime: new Date(),
  };
  private syncLoop: NodeJS.Timer | null = null;
  private readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

  /**
   * Initialize ecosystem sync service
   */
  async initialize(): Promise<void> {
    console.log('[EcosystemSync] Initializing ecosystem sync service...');

    // Create default sync mappings
    this.createDefaultMappings();

    // Start sync loop
    this.startSyncLoop();

    console.log('[EcosystemSync] Initialization complete. Ecosystem sync ready.');
  }

  /**
   * Create default sync mappings
   */
  private createDefaultMappings(): void {
    // FlowPay → HybridCast mapping
    this.createSyncMapping('flowpay', 'hybridcast', {
      campaign_id: 'broadcast_id',
      campaign_title: 'title',
      campaign_goal: 'goal_amount',
      campaign_raised: 'current_amount',
      campaign_url: 'donation_link',
    });

    // FlowPay → SQUADD mapping
    this.createSyncMapping('flowpay', 'squadd', {
      campaign_id: 'campaign_id',
      campaign_title: 'campaign_name',
      campaign_goal: 'tip_goal',
      campaign_raised: 'tips_received',
      campaign_url: 'listener_link',
    });

    // FlowPay → Content Calendar mapping
    this.createSyncMapping('flowpay', 'content_calendar', {
      campaign_id: 'content_id',
      campaign_title: 'content_title',
      campaign_goal: 'monetization_goal',
      campaign_raised: 'revenue',
      campaign_url: 'content_link',
    });

    console.log('[EcosystemSync] Default sync mappings created');
  }

  /**
   * Create sync mapping
   */
  private createSyncMapping(
    source: string,
    target: string,
    fieldMappings: Record<string, string>
  ): SyncMapping {
    const mappingId = `map_${source}_${target}_${Date.now()}`;

    const mapping: SyncMapping = {
      id: mappingId,
      source,
      target,
      fieldMappings,
      transformRules: [],
      active: true,
    };

    this.syncMappings.set(mappingId, mapping);

    console.log(`[EcosystemSync] Sync mapping created: ${source} → ${target}`);

    return mapping;
  }

  /**
   * Start sync loop
   */
  private startSyncLoop(): void {
    this.syncLoop = setInterval(async () => {
      try {
        await this.executeSyncCycle();
      } catch (error) {
        console.error('[EcosystemSync] Error in sync loop:', error);
      }
    }, this.SYNC_INTERVAL);

    console.log('[EcosystemSync] Sync loop started (every 5 minutes)');
  }

  /**
   * Execute sync cycle
   */
  private async executeSyncCycle(): Promise<void> {
    console.log('[EcosystemSync] Starting sync cycle...');

    const activeMappings = Array.from(this.syncMappings.values()).filter((m) => m.active);

    for (const mapping of activeMappings) {
      await this.syncBetweenSystems(mapping.source, mapping.target);
    }

    this.syncMetrics.lastSyncTime = new Date();

    console.log('[EcosystemSync] Sync cycle completed');
  }

  /**
   * Sync data between two systems
   */
  private async syncBetweenSystems(source: string, target: string): Promise<void> {
    const operationId = `sync_${source}_${target}_${Date.now()}`;

    const operation: SyncOperation = {
      id: operationId,
      source,
      target,
      dataType: 'campaigns',
      recordCount: 0,
      status: 'pending',
      startedAt: new Date(),
    };

    this.syncOperations.set(operationId, operation);

    try {
      operation.status = 'syncing';

      // Simulate data fetching from source
      const sourceData = await this.fetchSourceData(source);
      operation.recordCount = sourceData.length;

      // Apply field mappings and transform rules
      const mapping = this.getSyncMappingBySystems(source, target);
      if (!mapping) throw new Error(`No mapping found for ${source} → ${target}`);

      const transformedData = this.transformData(sourceData, mapping);

      // Push to target system
      await this.pushToTargetSystem(target, transformedData);

      operation.status = 'completed';
      operation.completedAt = new Date();

      this.syncMetrics.successfulOperations++;
      this.syncMetrics.totalRecordsSynced += operation.recordCount;

      // Log successful sync
      await db.insert(flowpayAuditLog).values({
        event_type: 'ecosystem_sync_completed',
        event_id: operationId,
        details: JSON.stringify({
          source,
          target,
          recordCount: operation.recordCount,
        }),
        timestamp: new Date(),
      });

      console.log(
        `[EcosystemSync] Sync completed: ${source} → ${target} (${operation.recordCount} records)`
      );
    } catch (error) {
      operation.status = 'failed';
      operation.error = String(error);
      operation.completedAt = new Date();

      this.syncMetrics.failedOperations++;

      console.error(`[EcosystemSync] Sync failed: ${source} → ${target}`, error);

      await notifyOwner({
        title: `⚠️ Ecosystem Sync Failed: ${source} → ${target}`,
        content: `Error: ${String(error)}`,
      });
    }

    this.syncMetrics.totalOperations++;
  }

  /**
   * Fetch data from source system
   */
  private async fetchSourceData(source: string): Promise<any[]> {
    // Simulated data fetch - in production, would query actual systems
    switch (source) {
      case 'flowpay':
        return [
          {
            campaign_id: 'camp_001',
            campaign_title: 'Emergency Fund',
            campaign_goal: 50000,
            campaign_raised: 48500,
            campaign_url: 'https://flowpay.app/campaigns/camp_001',
          },
          {
            campaign_id: 'camp_002',
            campaign_title: 'Community Support',
            campaign_goal: 25000,
            campaign_raised: 22000,
            campaign_url: 'https://flowpay.app/campaigns/camp_002',
          },
        ];
      case 'hybridcast':
      case 'squadd':
      case 'content_calendar':
        return [];
      default:
        return [];
    }
  }

  /**
   * Transform data according to mapping
   */
  private transformData(data: any[], mapping: SyncMapping): any[] {
    return data.map((record) => {
      const transformed: Record<string, any> = {};

      for (const [sourceField, targetField] of Object.entries(mapping.fieldMappings)) {
        if (record[sourceField] !== undefined) {
          transformed[targetField] = record[sourceField];
        }
      }

      // Apply transform rules
      for (const rule of mapping.transformRules) {
        if (rule.rule === 'multiply') {
          transformed[rule.field] = (transformed[rule.field] || 0) * (rule.value || 1);
        } else if (rule.rule === 'add') {
          transformed[rule.field] = (transformed[rule.field] || 0) + (rule.value || 0);
        }
      }

      return transformed;
    });
  }

  /**
   * Push data to target system
   */
  private async pushToTargetSystem(target: string, data: any[]): Promise<void> {
    // Simulated push - in production, would call actual system APIs
    console.log(`[EcosystemSync] Pushing ${data.length} records to ${target}`);

    for (const record of data) {
      console.log(`[EcosystemSync] Synced record to ${target}:`, record);
    }
  }

  /**
   * Get sync mapping by systems
   */
  private getSyncMappingBySystems(source: string, target: string): SyncMapping | undefined {
    return Array.from(this.syncMappings.values()).find(
      (m) => m.source === source && m.target === target && m.active
    );
  }

  /**
   * Get sync operation
   */
  getSyncOperation(operationId: string): SyncOperation | undefined {
    return this.syncOperations.get(operationId);
  }

  /**
   * Get all sync operations
   */
  getAllSyncOperations(): SyncOperation[] {
    return Array.from(this.syncOperations.values());
  }

  /**
   * Get recent sync operations
   */
  getRecentSyncOperations(limit: number = 10): SyncOperation[] {
    return Array.from(this.syncOperations.values())
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get sync metrics
   */
  getSyncMetrics(): SyncMetrics {
    return {
      ...this.syncMetrics,
      averageSyncTime:
        this.syncMetrics.totalOperations > 0
          ? Math.round(this.syncMetrics.totalRecordsSynced / this.syncMetrics.totalOperations)
          : 0,
    };
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isRunning: boolean;
    activeMappings: number;
    pendingOperations: number;
    failedOperations: number;
    lastSyncTime: Date;
  } {
    const activeMappings = Array.from(this.syncMappings.values()).filter((m) => m.active).length;
    const pendingOperations = Array.from(this.syncOperations.values()).filter(
      (o) => o.status === 'pending' || o.status === 'syncing'
    ).length;
    const failedOperations = Array.from(this.syncOperations.values()).filter(
      (o) => o.status === 'failed'
    ).length;

    return {
      isRunning: this.syncLoop !== null,
      activeMappings,
      pendingOperations,
      failedOperations,
      lastSyncTime: this.syncMetrics.lastSyncTime,
    };
  }

  /**
   * Manually trigger sync
   */
  async triggerManualSync(source: string, target: string): Promise<SyncOperation> {
    const operationId = `sync_manual_${source}_${target}_${Date.now()}`;

    const operation: SyncOperation = {
      id: operationId,
      source,
      target,
      dataType: 'campaigns',
      recordCount: 0,
      status: 'pending',
      startedAt: new Date(),
    };

    this.syncOperations.set(operationId, operation);

    // Execute sync in background
    this.syncBetweenSystems(source, target).catch((error) => {
      console.error('[EcosystemSync] Manual sync error:', error);
    });

    return operation;
  }

  /**
   * Shutdown ecosystem sync service
   */
  shutdown(): void {
    if (this.syncLoop) {
      clearInterval(this.syncLoop);
      console.log('[EcosystemSync] Shutdown complete');
    }
  }
}

// Export singleton instance
export const ecosystemSyncService = new EcosystemSyncService();
