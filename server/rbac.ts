/**
 * Role-Based Access Control (RBAC) System
 * Manages user roles, permissions, and audit logging
 */

export type UserRole = 'admin' | 'coordinator' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: number;
  lastLogin?: number;
  active: boolean;
}

export interface Permission {
  action: string;
  description: string;
  roles: UserRole[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  status: 'success' | 'failure';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class RBACManager {
  private permissions: Map<string, Permission> = new Map();
  private auditLog: AuditLogEntry[] = [];
  private maxAuditLogSize = 100000;

  constructor() {
    this.initializePermissions();
  }

  private initializePermissions() {
    const permissionsList: Permission[] = [
      // Broadcast Management
      {
        action: 'create_broadcast',
        description: 'Create new broadcasts',
        roles: ['admin', 'coordinator'],
      },
      {
        action: 'edit_broadcast',
        description: 'Edit existing broadcasts',
        roles: ['admin', 'coordinator'],
      },
      {
        action: 'delete_broadcast',
        description: 'Delete broadcasts',
        roles: ['admin'],
      },
      {
        action: 'send_broadcast',
        description: 'Send broadcasts immediately',
        roles: ['admin', 'coordinator'],
      },
      {
        action: 'schedule_broadcast',
        description: 'Schedule broadcasts for future delivery',
        roles: ['admin', 'coordinator'],
      },
      {
        action: 'cancel_broadcast',
        description: 'Cancel scheduled broadcasts',
        roles: ['admin', 'coordinator'],
      },

      // Alert Management
      {
        action: 'send_alert',
        description: 'Send emergency alerts',
        roles: ['admin', 'coordinator'],
      },
      {
        action: 'view_alerts',
        description: 'View alert history',
        roles: ['admin', 'coordinator', 'viewer'],
      },

      // Analytics & Reporting
      {
        action: 'view_analytics',
        description: 'View broadcast analytics',
        roles: ['admin', 'coordinator', 'viewer'],
      },
      {
        action: 'export_analytics',
        description: 'Export analytics data',
        roles: ['admin', 'coordinator'],
      },
      {
        action: 'view_audit_log',
        description: 'View audit logs',
        roles: ['admin'],
      },

      // User Management
      {
        action: 'create_user',
        description: 'Create new users',
        roles: ['admin'],
      },
      {
        action: 'edit_user',
        description: 'Edit user details and roles',
        roles: ['admin'],
      },
      {
        action: 'delete_user',
        description: 'Delete users',
        roles: ['admin'],
      },
      {
        action: 'view_users',
        description: 'View user list',
        roles: ['admin'],
      },

      // Network Management
      {
        action: 'view_mesh_network',
        description: 'View mesh network status',
        roles: ['admin', 'coordinator', 'viewer'],
      },
      {
        action: 'manage_mesh_nodes',
        description: 'Manage mesh network nodes',
        roles: ['admin'],
      },
      {
        action: 'view_network_metrics',
        description: 'View network metrics and health',
        roles: ['admin', 'coordinator', 'viewer'],
      },

      // System Administration
      {
        action: 'manage_settings',
        description: 'Manage system settings',
        roles: ['admin'],
      },
      {
        action: 'view_system_logs',
        description: 'View system logs',
        roles: ['admin'],
      },
    ];

    permissionsList.forEach((perm) => {
      this.permissions.set(perm.action, perm);
    });
  }

  /**
   * Check if user has permission for an action
   */
  hasPermission(userRole: UserRole, action: string): boolean {
    const permission = this.permissions.get(action);
    if (!permission) {
      console.warn(`[RBAC] Unknown permission: ${action}`);
      return false;
    }
    return permission.roles.includes(userRole);
  }

  /**
   * Check if user has any of the given permissions
   */
  hasAnyPermission(userRole: UserRole, actions: string[]): boolean {
    return actions.some((action) => this.hasPermission(userRole, action));
  }

  /**
   * Check if user has all of the given permissions
   */
  hasAllPermissions(userRole: UserRole, actions: string[]): boolean {
    return actions.every((action) => this.hasPermission(userRole, action));
  }

  /**
   * Get all permissions for a role
   */
  getPermissionsForRole(role: UserRole): Permission[] {
    return Array.from(this.permissions.values()).filter((perm) => perm.roles.includes(role));
  }

  /**
   * Log an action to audit log
   */
  logAction(
    userId: string,
    userEmail: string,
    action: string,
    resource: string,
    status: 'success' | 'failure',
    details: Record<string, any> = {},
    resourceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): AuditLogEntry {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId,
      userEmail,
      action,
      resource,
      resourceId,
      status,
      details,
      ipAddress,
      userAgent,
    };

    this.auditLog.push(entry);

    // Maintain max size
    if (this.auditLog.length > this.maxAuditLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxAuditLogSize);
    }

    console.log(`[RBAC Audit] ${userEmail} - ${action} on ${resource} - ${status}`);

    return entry;
  }

  /**
   * Get audit log entries with filtering
   */
  getAuditLog(options: {
    limit?: number;
    offset?: number;
    userId?: string;
    action?: string;
    resource?: string;
    status?: 'success' | 'failure';
    startTime?: number;
    endTime?: number;
  } = {}): AuditLogEntry[] {
    let filtered = [...this.auditLog];

    if (options.userId) {
      filtered = filtered.filter((entry) => entry.userId === options.userId);
    }

    if (options.action) {
      filtered = filtered.filter((entry) => entry.action === options.action);
    }

    if (options.resource) {
      filtered = filtered.filter((entry) => entry.resource === options.resource);
    }

    if (options.status) {
      filtered = filtered.filter((entry) => entry.status === options.status);
    }

    if (options.startTime) {
      filtered = filtered.filter((entry) => entry.timestamp >= options.startTime!);
    }

    if (options.endTime) {
      filtered = filtered.filter((entry) => entry.timestamp <= options.endTime!);
    }

    const offset = options.offset || 0;
    const limit = options.limit || 100;

    return filtered.slice(offset, offset + limit);
  }

  /**
   * Get audit log statistics
   */
  getAuditStats(timeRange: number = 24 * 60 * 60 * 1000): {
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    actionsByType: Record<string, number>;
    actionsByUser: Record<string, number>;
  } {
    const now = Date.now();
    const startTime = now - timeRange;

    const filtered = this.auditLog.filter((entry) => entry.timestamp >= startTime);

    const stats = {
      totalActions: filtered.length,
      successfulActions: filtered.filter((e) => e.status === 'success').length,
      failedActions: filtered.filter((e) => e.status === 'failure').length,
      actionsByType: {} as Record<string, number>,
      actionsByUser: {} as Record<string, number>,
    };

    filtered.forEach((entry) => {
      stats.actionsByType[entry.action] = (stats.actionsByType[entry.action] || 0) + 1;
      stats.actionsByUser[entry.userEmail] = (stats.actionsByUser[entry.userEmail] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear old audit logs
   */
  clearOldLogs(olderThan: number = 30 * 24 * 60 * 60 * 1000): number {
    const cutoffTime = Date.now() - olderThan;
    const initialLength = this.auditLog.length;

    this.auditLog = this.auditLog.filter((entry) => entry.timestamp > cutoffTime);

    const removed = initialLength - this.auditLog.length;
    console.log(`[RBAC] Cleared ${removed} old audit log entries`);

    return removed;
  }

  /**
   * Export audit log as JSON
   */
  exportAuditLog(options: {
    limit?: number;
    userId?: string;
    action?: string;
    startTime?: number;
    endTime?: number;
  } = {}): string {
    const entries = this.getAuditLog(options);
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Export audit log as CSV
   */
  exportAuditLogCSV(options: {
    limit?: number;
    userId?: string;
    action?: string;
    startTime?: number;
    endTime?: number;
  } = {}): string {
    const entries = this.getAuditLog(options);

    const headers = ['Timestamp', 'User Email', 'Action', 'Resource', 'Status', 'Details'];
    const rows = entries.map((entry) => [
      new Date(entry.timestamp).toISOString(),
      entry.userEmail,
      entry.action,
      entry.resource,
      entry.status,
      JSON.stringify(entry.details),
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

    return csv;
  }
}

// Singleton instance
let rbacInstance: RBACManager | null = null;

export function getRBACManager(): RBACManager {
  if (!rbacInstance) {
    rbacInstance = new RBACManager();
  }
  return rbacInstance;
}

export default RBACManager;
