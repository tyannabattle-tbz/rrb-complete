/**
 * Offline Data Sync with Conflict Resolution
 * Handles synchronization of data across Qumus, RRB, and HybridCast
 * when devices reconnect after offline periods
 */

import { db } from '../db';
import { invokeLLM } from '../_core/llm';

export interface SyncRecord {
  id: string;
  entityType: string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  data: Record<string, any>;
  timestamp: number;
  deviceId: string;
  synced: boolean;
  conflict?: boolean;
  resolution?: 'local' | 'remote' | 'merged';
}

export interface ConflictResolution {
  recordId: string;
  entityId: string;
  localVersion: Record<string, any>;
  remoteVersion: Record<string, any>;
  resolvedVersion: Record<string, any>;
  strategy: 'local' | 'remote' | 'merged' | 'manual';
  timestamp: number;
}

export class OfflineDataSync {
  private syncQueue: SyncRecord[] = [];
  private conflictQueue: ConflictResolution[] = [];
  private isSyncing = false;

  constructor() {
    this.loadQueues();
  }

  /**
   * Load queues from storage
   */
  private async loadQueues() {
    try {
      const records = await db.query.syncRecords.findMany({
        where: (t) => !t.synced,
      });

      this.syncQueue = records as SyncRecord[];

      const conflicts = await db.query.conflictResolutions.findMany();
      this.conflictQueue = conflicts as ConflictResolution[];

      console.log(`[Sync] Loaded ${this.syncQueue.length} pending records and ${this.conflictQueue.length} conflicts`);
    } catch (error) {
      console.error('[Sync] Failed to load queues:', error);
    }
  }

  /**
   * Queue a record for sync
   */
  async queueRecord(
    entityType: string,
    entityId: string,
    operation: 'create' | 'update' | 'delete',
    data: Record<string, any>,
    deviceId: string
  ): Promise<void> {
    try {
      const record: SyncRecord = {
        id: `${entityType}-${entityId}-${Date.now()}`,
        entityType,
        entityId,
        operation,
        data,
        timestamp: Date.now(),
        deviceId,
        synced: false,
      };

      this.syncQueue.push(record);

      // Save to database
      await db.insert(db.schema.syncRecords).values(record);

      console.log(`[Sync] Queued ${operation} for ${entityType}/${entityId}`);
    } catch (error) {
      console.error('[Sync] Failed to queue record:', error);
    }
  }

  /**
   * Sync all pending records
   */
  async syncAll(): Promise<{
    synced: number;
    conflicts: number;
    failed: number;
  }> {
    if (this.isSyncing) {
      console.warn('[Sync] Sync already in progress');
      return { synced: 0, conflicts: 0, failed: 0 };
    }

    this.isSyncing = true;
    let synced = 0;
    let conflicts = 0;
    let failed = 0;

    try {
      console.log(`[Sync] Starting sync of ${this.syncQueue.length} records`);

      for (const record of this.syncQueue) {
        try {
          const result = await this.syncRecord(record);

          if (result.conflict) {
            conflicts++;
            this.conflictQueue.push(result.resolution!);
          } else if (result.synced) {
            synced++;
            // Mark as synced
            await db.update(db.schema.syncRecords).set({ synced: true }).where((t) => t.id === record.id);
          }
        } catch (error) {
          console.error(`[Sync] Failed to sync record ${record.id}:`, error);
          failed++;
        }
      }

      // Remove synced records from queue
      this.syncQueue = this.syncQueue.filter((r) => !r.synced);

      console.log(`[Sync] Sync complete: ${synced} synced, ${conflicts} conflicts, ${failed} failed`);

      return { synced, conflicts, failed };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single record
   */
  private async syncRecord(
    record: SyncRecord
  ): Promise<{
    synced: boolean;
    conflict: boolean;
    resolution?: ConflictResolution;
  }> {
    try {
      // Get current server version
      const serverVersion = await this.getServerVersion(record.entityType, record.entityId);

      if (!serverVersion) {
        // No conflict, apply the change
        await this.applyChange(record);
        return { synced: true, conflict: false };
      }

      // Check for conflicts
      const hasConflict = this.hasConflict(record.data, serverVersion);

      if (!hasConflict) {
        // No conflict, apply the change
        await this.applyChange(record);
        return { synced: true, conflict: false };
      }

      // Conflict detected, resolve it
      const resolution = await this.resolveConflict(record, serverVersion);

      return {
        synced: false,
        conflict: true,
        resolution,
      };
    } catch (error) {
      console.error('[Sync] Error syncing record:', error);
      throw error;
    }
  }

  /**
   * Get server version of an entity
   */
  private async getServerVersion(
    entityType: string,
    entityId: string
  ): Promise<Record<string, any> | null> {
    try {
      // This would query the actual entity from the database
      // Implementation depends on entity type
      switch (entityType) {
        case 'broadcast':
          return await db.query.broadcasts.findFirst({
            where: (t) => t.id === entityId,
          });
        case 'listener':
          return await db.query.listeners.findFirst({
            where: (t) => t.id === entityId,
          });
        case 'alert':
          return await db.query.emergencyAlerts.findFirst({
            where: (t) => t.id === entityId,
          });
        default:
          return null;
      }
    } catch (error) {
      console.error('[Sync] Failed to get server version:', error);
      return null;
    }
  }

  /**
   * Check if there's a conflict between local and remote versions
   */
  private hasConflict(localVersion: Record<string, any>, remoteVersion: Record<string, any>): boolean {
    // Simple conflict detection: check if critical fields differ
    const criticalFields = ['status', 'content', 'priority', 'timestamp'];

    for (const field of criticalFields) {
      if (localVersion[field] !== remoteVersion[field]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Resolve conflicts using LLM
   */
  private async resolveConflict(
    record: SyncRecord,
    serverVersion: Record<string, any>
  ): Promise<ConflictResolution> {
    try {
      // Use LLM to determine best resolution strategy
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are a conflict resolution engine for a distributed communication system.
            Analyze the local and remote versions of a record and determine the best resolution strategy.
            Consider: timestamp, data integrity, user intent, and system state.
            Respond with JSON: { "strategy": "local|remote|merged", "reasoning": "..." }`,
          },
          {
            role: 'user',
            content: `
            Entity Type: ${record.entityType}
            Operation: ${record.operation}
            
            Local Version (Device: ${record.deviceId}):
            ${JSON.stringify(record.data, null, 2)}
            
            Remote Version (Server):
            ${JSON.stringify(serverVersion, null, 2)}
            
            Local Timestamp: ${record.timestamp}
            Remote Timestamp: ${serverVersion.timestamp || 'unknown'}
            `,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'conflict_resolution',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                strategy: {
                  type: 'string',
                  enum: ['local', 'remote', 'merged'],
                },
                reasoning: {
                  type: 'string',
                },
              },
              required: ['strategy', 'reasoning'],
            },
          },
        },
      });

      const content = response.choices[0].message.content;
      const decision = JSON.parse(content);

      // Merge if needed
      let resolvedVersion = record.data;
      if (decision.strategy === 'remote') {
        resolvedVersion = serverVersion;
      } else if (decision.strategy === 'merged') {
        resolvedVersion = this.mergeVersions(record.data, serverVersion);
      }

      const resolution: ConflictResolution = {
        recordId: record.id,
        entityId: record.entityId,
        localVersion: record.data,
        remoteVersion: serverVersion,
        resolvedVersion,
        strategy: decision.strategy,
        timestamp: Date.now(),
      };

      // Save resolution
      await db.insert(db.schema.conflictResolutions).values(resolution);

      console.log(`[Sync] Conflict resolved for ${record.entityId} using ${decision.strategy} strategy`);

      return resolution;
    } catch (error) {
      console.error('[Sync] Failed to resolve conflict:', error);

      // Default to remote version on error
      return {
        recordId: record.id,
        entityId: record.entityId,
        localVersion: record.data,
        remoteVersion: serverVersion,
        resolvedVersion: serverVersion,
        strategy: 'remote',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Merge two versions intelligently
   */
  private mergeVersions(
    localVersion: Record<string, any>,
    remoteVersion: Record<string, any>
  ): Record<string, any> {
    const merged = { ...remoteVersion };

    // Merge non-conflicting fields
    for (const key in localVersion) {
      if (!(key in remoteVersion)) {
        merged[key] = localVersion[key];
      }
    }

    return merged;
  }

  /**
   * Apply a change to the database
   */
  private async applyChange(record: SyncRecord): Promise<void> {
    try {
      switch (record.operation) {
        case 'create':
          // Insert new record
          await this.insertEntity(record.entityType, record.data);
          break;

        case 'update':
          // Update existing record
          await this.updateEntity(record.entityType, record.entityId, record.data);
          break;

        case 'delete':
          // Delete record
          await this.deleteEntity(record.entityType, record.entityId);
          break;
      }

      console.log(`[Sync] Applied ${record.operation} for ${record.entityType}/${record.entityId}`);
    } catch (error) {
      console.error('[Sync] Failed to apply change:', error);
      throw error;
    }
  }

  /**
   * Insert entity
   */
  private async insertEntity(entityType: string, data: Record<string, any>): Promise<void> {
    switch (entityType) {
      case 'broadcast':
        await db.insert(db.schema.broadcasts).values(data);
        break;
      case 'listener':
        await db.insert(db.schema.listeners).values(data);
        break;
      case 'alert':
        await db.insert(db.schema.emergencyAlerts).values(data);
        break;
    }
  }

  /**
   * Update entity
   */
  private async updateEntity(
    entityType: string,
    entityId: string,
    data: Record<string, any>
  ): Promise<void> {
    switch (entityType) {
      case 'broadcast':
        await db.update(db.schema.broadcasts).set(data).where((t) => t.id === entityId);
        break;
      case 'listener':
        await db.update(db.schema.listeners).set(data).where((t) => t.id === entityId);
        break;
      case 'alert':
        await db.update(db.schema.emergencyAlerts).set(data).where((t) => t.id === entityId);
        break;
    }
  }

  /**
   * Delete entity
   */
  private async deleteEntity(entityType: string, entityId: string): Promise<void> {
    switch (entityType) {
      case 'broadcast':
        await db.delete(db.schema.broadcasts).where((t) => t.id === entityId);
        break;
      case 'listener':
        await db.delete(db.schema.listeners).where((t) => t.id === entityId);
        break;
      case 'alert':
        await db.delete(db.schema.emergencyAlerts).where((t) => t.id === entityId);
        break;
    }
  }

  /**
   * Get sync status
   */
  async getStatus(): Promise<{
    pendingRecords: number;
    conflicts: number;
    isSyncing: boolean;
    lastSync: number | null;
  }> {
    return {
      pendingRecords: this.syncQueue.length,
      conflicts: this.conflictQueue.length,
      isSyncing: this.isSyncing,
      lastSync: null, // Would track this separately
    };
  }

  /**
   * Clear resolved conflicts
   */
  async clearResolvedConflicts(): Promise<void> {
    try {
      await db.delete(db.schema.conflictResolutions).where((t) => t.strategy !== 'manual');
      this.conflictQueue = this.conflictQueue.filter((c) => c.strategy === 'manual');
      console.log('[Sync] Cleared resolved conflicts');
    } catch (error) {
      console.error('[Sync] Failed to clear conflicts:', error);
    }
  }
}

// Export singleton instance
export const offlineSync = new OfflineDataSync();
