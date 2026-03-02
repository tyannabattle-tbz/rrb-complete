import * as db from "../db";

type SystemMetric = any;
type SystemAlert = any;

/**
 * Admin Dashboard Service - System management and monitoring
 */

export interface DashboardStats {
  activeUsers: number;
  totalSessions: number;
  totalRequests: number;
  totalTokens: number;
  averageResponseTime: number;
  errorRate: number;
  systemHealth: "healthy" | "warning" | "critical";
  alerts: SystemAlert[];
}

export interface SystemHealth {
  cpu: number;
  memory: number;
  storage: number;
  database: boolean;
  api: boolean;
  status: "healthy" | "warning" | "critical";
}

export class AdminService {
  /**
   * Get dashboard statistics
   */
  static async getDashboardStats(): Promise<DashboardStats> {
    const latestMetric = await db.getLatestSystemMetric();
    const alerts = await db.getActiveSystemAlerts();

    const errorRate = latestMetric?.errorRate ? parseFloat(latestMetric.errorRate.toString()) : 0;
    const avgResponseTime = latestMetric?.averageResponseTime ? parseFloat(latestMetric.averageResponseTime.toString()) : 0;

    let systemHealth: "healthy" | "warning" | "critical" = "healthy";
    if (errorRate > 10 || avgResponseTime > 5000) {
      systemHealth = "warning";
    }
    if (errorRate > 20 || avgResponseTime > 10000) {
      systemHealth = "critical";
    }

    return {
      activeUsers: latestMetric?.activeUsers || 0,
      totalSessions: latestMetric?.totalSessions || 0,
      totalRequests: latestMetric?.totalRequests || 0,
      totalTokens: latestMetric?.totalTokens || 0,
      averageResponseTime: avgResponseTime,
      errorRate,
      systemHealth,
      alerts,
    };
  }

  /**
   * Get system health status
   */
  static async getSystemHealth(): Promise<SystemHealth> {
    const latestMetric = await db.getLatestSystemMetric();

    const cpu = latestMetric?.cpuUsage ? parseFloat(latestMetric.cpuUsage.toString()) : 0;
    const memory = latestMetric?.memoryUsage ? parseFloat(latestMetric.memoryUsage.toString()) : 0;
    const storage = latestMetric?.storageUsage ? parseFloat(latestMetric.storageUsage.toString()) : 0;

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (cpu > 80 || memory > 80 || storage > 85) {
      status = "warning";
    }
    if (cpu > 95 || memory > 95 || storage > 95) {
      status = "critical";
    }

    return {
      cpu,
      memory,
      storage,
      database: true, // Would check actual database connection
      api: true, // Would check actual API health
      status,
    };
  }

  /**
   * Record system metrics
   */
  static async recordMetrics(metrics: Partial<SystemMetric>): Promise<void> {
    await db.recordSystemMetric(metrics);
  }

  /**
   * Get metrics history for charting
   */
  static async getMetricsHistory(hours: number = 24): Promise<SystemMetric[]> {
    return db.getSystemMetricsHistory(hours);
  }

  /**
   * Create system alert
   */
  static async createAlert(
    severity: "critical" | "warning" | "info",
    title: string,
    description?: string
  ): Promise<number> {
    return db.createSystemAlert(severity, title, description);
  }

  /**
   * Get all alerts
   */
  static async getAlerts(status?: "active" | "acknowledged" | "resolved"): Promise<SystemAlert[]> {
    return db.getSystemAlerts(status);
  }

  /**
   * Acknowledge alert
   */
  static async acknowledgeAlert(alertId: number, userId: number): Promise<void> {
    await db.acknowledgeSystemAlert(alertId, userId);
  }

  /**
   * Resolve alert
   */
  static async resolveAlert(alertId: number): Promise<void> {
    await db.resolveSystemAlert(alertId);
  }

  /**
   * Get audit logs
   */
  static async getAuditLogs(
    filters?: {
      userId?: number;
      action?: string;
      resource?: string;
      status?: "success" | "failure";
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    return db.getAuditLogs(filters);
  }

  /**
   * Record audit log
   */
  static async recordAuditLog(
    userId: number | undefined,
    action: string,
    resource: string,
    resourceId?: string,
    changes?: Record<string, any>,
    status: "success" | "failure" = "success"
  ): Promise<void> {
    await db.createAuditLog({
      userId,
      action,
      resource,
      resourceId,
      changes,
      status,
    });
  }

  /**
   * Get user management data
   */
  static async getUserManagementData() {
    return {
      totalUsers: await db.getTotalUserCount(),
      activeUsers: await db.getActiveUserCount(),
      newUsersThisMonth: await db.getNewUsersThisMonth(),
      topUsers: await db.getTopUsersByActivity(),
    };
  }

  /**
   * Get API usage statistics
   */
  static async getApiUsageStats() {
    return {
      totalRequests: await db.getTotalApiRequests(),
      totalTokens: await db.getTotalTokensUsed(),
      requestsPerMinute: await db.getRequestsPerMinute(),
      topEndpoints: await db.getTopApiEndpoints(),
      errorRate: await db.getApiErrorRate(),
    };
  }

  /**
   * Export system report
   */
  static async exportSystemReport(format: "pdf" | "csv" = "pdf") {
    const stats = await this.getDashboardStats();
    const health = await this.getSystemHealth();
    const auditLogs = await this.getAuditLogs();

    const report = {
      generatedAt: new Date().toISOString(),
      stats,
      health,
      auditLogsCount: auditLogs.length,
      period: "24 hours",
    };

    if (format === "csv") {
      return this.convertToCSV(report);
    }
    return JSON.stringify(report, null, 2);
  }

  private static convertToCSV(report: any): string {
    const lines = [
      "System Report",
      `Generated: ${report.generatedAt}`,
      "",
      "Dashboard Statistics",
      `Active Users,${report.stats.activeUsers}`,
      `Total Sessions,${report.stats.totalSessions}`,
      `Total Requests,${report.stats.totalRequests}`,
      `Average Response Time,${report.stats.averageResponseTime}ms`,
      `Error Rate,${report.stats.errorRate}%`,
      "",
      "System Health",
      `CPU Usage,${report.health.cpu}%`,
      `Memory Usage,${report.health.memory}%`,
      `Storage Usage,${report.health.storage}%`,
      `Status,${report.health.status}`,
    ];

    return lines.join("\n");
  }
}
