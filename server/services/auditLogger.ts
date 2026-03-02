import { getDb } from '../db';
import { v4 as uuid } from 'uuid';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, { before: any; after: any }>;
  status: 'success' | 'failure';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
}

class AuditLogger {
  /**
   * Log an action for audit trail
   */
  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    options?: {
      changes?: Record<string, { before: any; after: any }>;
      status?: 'success' | 'failure';
      errorMessage?: string;
      ipAddress?: string;
      userAgent?: string;
    }
  ): Promise<AuditLog> {
    const log: AuditLog = {
      id: uuid(),
      userId,
      action,
      resource,
      resourceId,
      changes: options?.changes,
      status: options?.status || 'success',
      errorMessage: options?.errorMessage,
      ipAddress: options?.ipAddress,
      userAgent: options?.userAgent,
      timestamp: Date.now(),
    };

    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO audit_logs (id, user_id, action, resource, resource_id, changes, status, error_message, ip_address, user_agent, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          log.id,
          log.userId,
          log.action,
          log.resource,
          log.resourceId,
          log.changes ? JSON.stringify(log.changes) : null,
          log.status,
          log.errorMessage,
          log.ipAddress,
          log.userAgent,
          log.timestamp,
        ]
      );
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }

    return log;
  }

  /**
   * Get audit logs for user
   */
  async getAuditLogs(
    userId: string,
    options?: {
      action?: string;
      resource?: string;
      startDate?: number;
      endDate?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<AuditLog[]> {
    try {
      const db = await getDb();
      let query = `SELECT * FROM audit_logs WHERE user_id = ?`;
      const params: any[] = [userId];

      if (options?.action) {
        query += ` AND action = ?`;
        params.push(options.action);
      }

      if (options?.resource) {
        query += ` AND resource = ?`;
        params.push(options.resource);
      }

      if (options?.startDate) {
        query += ` AND timestamp >= ?`;
        params.push(options.startDate);
      }

      if (options?.endDate) {
        query += ` AND timestamp <= ?`;
        params.push(options.endDate);
      }

      query += ` ORDER BY timestamp DESC`;

      if (options?.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);
      }

      if (options?.offset) {
        query += ` OFFSET ?`;
        params.push(options.offset);
      }

      const rows = await db.all(query, params);

      return rows.map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        action: row.action,
        resource: row.resource,
        resourceId: row.resource_id,
        changes: row.changes ? JSON.parse(row.changes) : undefined,
        status: row.status,
        errorMessage: row.error_message,
        ipAddress: row.ip_address,
        userAgent: row.user_agent,
        timestamp: row.timestamp,
      }));
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(userId: string, timeRange: number = 24 * 60 * 60 * 1000): Promise<{
    totalActions: number;
    successCount: number;
    failureCount: number;
    actionsByType: Record<string, number>;
    resourcesByType: Record<string, number>;
  }> {
    try {
      const db = await getDb();
      const startTime = Date.now() - timeRange;

      const rows = await db.all(
        `SELECT action, resource, status FROM audit_logs WHERE user_id = ? AND timestamp >= ?`,
        [userId, startTime]
      );

      const stats = {
        totalActions: rows.length,
        successCount: rows.filter((r: any) => r.status === 'success').length,
        failureCount: rows.filter((r: any) => r.status === 'failure').length,
        actionsByType: {} as Record<string, number>,
        resourcesByType: {} as Record<string, number>,
      };

      for (const row of rows) {
        stats.actionsByType[row.action] = (stats.actionsByType[row.action] || 0) + 1;
        stats.resourcesByType[row.resource] = (stats.resourcesByType[row.resource] || 0) + 1;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get audit statistics:', error);
      return {
        totalActions: 0,
        successCount: 0,
        failureCount: 0,
        actionsByType: {},
        resourcesByType: {},
      };
    }
  }

  /**
   * Export audit logs as CSV
   */
  async exportAuditLogs(userId: string, startDate: number, endDate: number): Promise<string> {
    try {
      const logs = await this.getAuditLogs(userId, {
        startDate,
        endDate,
        limit: 10000,
      });

      const headers = ['ID', 'Action', 'Resource', 'Resource ID', 'Status', 'Timestamp', 'IP Address', 'User Agent'];
      const rows = logs.map(log => [
        log.id,
        log.action,
        log.resource,
        log.resourceId,
        log.status,
        new Date(log.timestamp).toISOString(),
        log.ipAddress || '',
        log.userAgent || '',
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      return '';
    }
  }

  /**
   * Log task execution
   */
  async logTaskExecution(
    userId: string,
    taskId: string,
    goal: string,
    status: 'success' | 'failure',
    executionTime: number,
    error?: string
  ): Promise<void> {
    await this.logAction(userId, 'task_execution', 'task', taskId, {
      status,
      errorMessage: error,
      changes: {
        goal: { before: null, after: goal },
        executionTime: { before: null, after: executionTime },
      },
    });
  }

  /**
   * Log command execution
   */
  async logCommandExecution(
    userId: string,
    commandId: string,
    ecosystem: string,
    command: string,
    status: 'success' | 'failure',
    error?: string
  ): Promise<void> {
    await this.logAction(userId, 'command_execution', 'command', commandId, {
      status,
      errorMessage: error,
      changes: {
        ecosystem: { before: null, after: ecosystem },
        command: { before: null, after: command },
      },
    });
  }

  /**
   * Log configuration change
   */
  async logConfigChange(
    userId: string,
    configId: string,
    changes: Record<string, { before: any; after: any }>
  ): Promise<void> {
    await this.logAction(userId, 'config_change', 'configuration', configId, {
      changes,
    });
  }

  /**
   * Log user action
   */
  async logUserAction(
    userId: string,
    action: 'login' | 'logout' | 'password_change' | 'profile_update',
    status: 'success' | 'failure' = 'success',
    error?: string
  ): Promise<void> {
    await this.logAction(userId, action, 'user', userId, {
      status,
      errorMessage: error,
    });
  }
}

export const auditLogger = new AuditLogger();
