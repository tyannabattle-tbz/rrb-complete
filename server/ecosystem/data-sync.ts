/**
 * Cross-Platform Data Synchronization
 * Keeps data consistent across all ecosystem services
 */

import { getEventBus, EcosystemEvent } from "./event-bus";

export interface SyncConfig {
  batchSize?: number;
  syncIntervalMs?: number;
  conflictResolution?: "last-write-wins" | "custom";
}

export interface SyncRecord {
  id: string;
  service: string;
  entityType: string;
  entityId: string;
  data: Record<string, any>;
  version: number;
  timestamp: number;
  hash: string;
}

export interface SyncConflict {
  recordId: string;
  service1: string;
  service2: string;
  data1: Record<string, any>;
  data2: Record<string, any>;
  timestamp: number;
}

/**
 * Data Synchronization Engine
 */
export class DataSyncEngine {
  private eventBus = getEventBus();
  private config: Required<SyncConfig>;
  private syncRecords: Map<string, SyncRecord> = new Map();
  private conflicts: SyncConflict[] = [];
  private syncQueue: SyncRecord[] = [];
  private isProcessing = false;

  constructor(config: SyncConfig = {}) {
    this.config = {
      batchSize: config.batchSize ?? 100,
      syncIntervalMs: config.syncIntervalMs ?? 5000,
      conflictResolution: config.conflictResolution ?? "last-write-wins",
    };

    this.initializeEventListeners();
    this.startSyncWorker();
  }

  /**
   * Initialize event listeners for data changes
   */
  private initializeEventListeners(): void {
    // Listen for content updates
    this.eventBus.subscribe("content.created", async (event) => {
      await this.handleContentChange(event, "create");
    });

    this.eventBus.subscribe("content.updated", async (event) => {
      await this.handleContentChange(event, "update");
    });

    this.eventBus.subscribe("content.deleted", async (event) => {
      await this.handleContentChange(event, "delete");
    });

    // Listen for user updates
    this.eventBus.subscribe("user.profile_updated", async (event) => {
      await this.handleUserChange(event);
    });

    // Listen for broadcast updates
    this.eventBus.subscribe("broadcast.scheduled", async (event) => {
      await this.handleBroadcastChange(event);
    });

    // Listen for analytics events
    this.eventBus.subscribe("analytics.metric_recorded", async (event) => {
      await this.handleAnalyticsChange(event);
    });
  }

  /**
   * Handle content changes
   */
  private async handleContentChange(
    event: EcosystemEvent,
    operation: "create" | "update" | "delete"
  ): Promise<void> {
    const record: SyncRecord = {
      id: `${event.source}:${event.data.contentId}`,
      service: event.source,
      entityType: "content",
      entityId: event.data.contentId,
      data: event.data,
      version: (event.data.version || 0) + 1,
      timestamp: event.timestamp,
      hash: this.hashData(event.data),
    };

    await this.queueSync(record);
  }

  /**
   * Handle user changes
   */
  private async handleUserChange(event: EcosystemEvent): Promise<void> {
    const record: SyncRecord = {
      id: `${event.source}:${event.data.userId}`,
      service: event.source,
      entityType: "user",
      entityId: event.data.userId,
      data: event.data,
      version: (event.data.version || 0) + 1,
      timestamp: event.timestamp,
      hash: this.hashData(event.data),
    };

    await this.queueSync(record);
  }

  /**
   * Handle broadcast changes
   */
  private async handleBroadcastChange(event: EcosystemEvent): Promise<void> {
    const record: SyncRecord = {
      id: `${event.source}:${event.data.broadcastId}`,
      service: event.source,
      entityType: "broadcast",
      entityId: event.data.broadcastId,
      data: event.data,
      version: (event.data.version || 0) + 1,
      timestamp: event.timestamp,
      hash: this.hashData(event.data),
    };

    await this.queueSync(record);
  }

  /**
   * Handle analytics changes
   */
  private async handleAnalyticsChange(event: EcosystemEvent): Promise<void> {
    const record: SyncRecord = {
      id: `${event.source}:${event.data.metricId}`,
      service: event.source,
      entityType: "metric",
      entityId: event.data.metricId,
      data: event.data,
      version: 1,
      timestamp: event.timestamp,
      hash: this.hashData(event.data),
    };

    await this.queueSync(record);
  }

  /**
   * Queue record for synchronization
   */
  private async queueSync(record: SyncRecord): Promise<void> {
    const existingRecord = this.syncRecords.get(record.id);

    if (existingRecord) {
      // Check for conflicts
      if (existingRecord.hash !== record.hash && existingRecord.version === record.version) {
        this.conflicts.push({
          recordId: record.id,
          service1: existingRecord.service,
          service2: record.service,
          data1: existingRecord.data,
          data2: record.data,
          timestamp: Date.now(),
        });

        // Resolve conflict
        const resolved = await this.resolveConflict(existingRecord, record);
        this.syncRecords.set(record.id, resolved);
        this.syncQueue.push(resolved);
      } else if (record.version > existingRecord.version) {
        // Newer version, update
        this.syncRecords.set(record.id, record);
        this.syncQueue.push(record);
      }
    } else {
      // New record
      this.syncRecords.set(record.id, record);
      this.syncQueue.push(record);
    }
  }

  /**
   * Resolve data conflicts
   */
  private async resolveConflict(
    record1: SyncRecord,
    record2: SyncRecord
  ): Promise<SyncRecord> {
    if (this.config.conflictResolution === "last-write-wins") {
      return record2.timestamp > record1.timestamp ? record2 : record1;
    }

    // Default to last-write-wins
    return record2.timestamp > record1.timestamp ? record2 : record1;
  }

  /**
   * Start background sync worker
   */
  private startSyncWorker(): void {
    setInterval(async () => {
      if (!this.isProcessing && this.syncQueue.length > 0) {
        await this.processSyncQueue();
      }
    }, this.config.syncIntervalMs);
  }

  /**
   * Process sync queue in batches
   */
  private async processSyncQueue(): Promise<void> {
    this.isProcessing = true;

    try {
      while (this.syncQueue.length > 0) {
        const batch = this.syncQueue.splice(0, this.config.batchSize);
        await this.syncBatch(batch);
      }
    } catch (error) {
      console.error("Error processing sync queue:", error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Sync a batch of records
   */
  private async syncBatch(records: SyncRecord[]): Promise<void> {
    const eventBus = getEventBus();

    for (const record of records) {
      try {
        // Publish sync event
        await eventBus.publish({
          type: "integration.sync_started",
          source: "data-sync",
          priority: "normal",
          data: {
            recordId: record.id,
            entityType: record.entityType,
            service: record.service,
          },
        });

        // Simulate sync to other services
        await this.syncToServices(record);

        // Publish completion event
        await eventBus.publish({
          type: "integration.sync_completed",
          source: "data-sync",
          priority: "normal",
          data: {
            recordId: record.id,
            entityType: record.entityType,
            timestamp: Date.now(),
          },
        });
      } catch (error) {
        console.error(`Failed to sync record ${record.id}:`, error);

        // Publish failure event
        await eventBus.publish({
          type: "integration.sync_failed",
          source: "data-sync",
          priority: "high",
          data: {
            recordId: record.id,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }
    }
  }

  /**
   * Sync record to other services
   */
  private async syncToServices(record: SyncRecord): Promise<void> {
    const services = [
      "rockinrockinboogie",
      "qumus-orchestration",
      "hybridcast-broadcast",
      "entertainment-platform",
    ];

    for (const service of services) {
      if (service === record.service) continue; // Skip source service

      // Simulate API call to service
      await this.callServiceSync(service, record);
    }
  }

  /**
   * Call service sync endpoint
   */
  private async callServiceSync(service: string, record: SyncRecord): Promise<void> {
    // This would be replaced with actual HTTP calls in production
    console.log(`Syncing ${record.entityType} to ${service}`);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  /**
   * Get sync statistics
   */
  public getStats(): {
    recordCount: number;
    queueSize: number;
    conflictCount: number;
    isProcessing: boolean;
  } {
    return {
      recordCount: this.syncRecords.size,
      queueSize: this.syncQueue.length,
      conflictCount: this.conflicts.length,
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Get conflicts
   */
  public getConflicts(): SyncConflict[] {
    return this.conflicts;
  }

  /**
   * Clear conflicts
   */
  public clearConflicts(): void {
    this.conflicts = [];
  }

  /**
   * Get sync record
   */
  public getRecord(recordId: string): SyncRecord | undefined {
    return this.syncRecords.get(recordId);
  }

  /**
   * Force sync of specific record
   */
  public async forceSync(recordId: string): Promise<void> {
    const record = this.syncRecords.get(recordId);
    if (record) {
      this.syncQueue.push(record);
    }
  }

  /**
   * Hash data for change detection
   */
  private hashData(data: Record<string, any>): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(36);
  }
}

// Singleton instance
let dataSyncInstance: DataSyncEngine | null = null;

/**
 * Get or create data sync engine
 */
export function getDataSyncEngine(config?: SyncConfig): DataSyncEngine {
  if (!dataSyncInstance) {
    dataSyncInstance = new DataSyncEngine(config);
  }
  return dataSyncInstance;
}
