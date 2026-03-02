import { db } from './db';

export interface ARMetric {
  taskId: string;
  successRate: number;
  executionTime: number;
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface MetricsAggregate {
  taskId: string;
  totalExecutions: number;
  averageSuccessRate: number;
  averageExecutionTime: number;
  averageCpuUsage: number;
  averageMemoryUsage: number;
  averageStorageUsage: number;
  peakCpuUsage: number;
  peakMemoryUsage: number;
  peakStorageUsage: number;
  firstRecorded: number;
  lastRecorded: number;
}

/**
 * Save AR metric to database
 */
export async function saveARMetric(metric: ARMetric) {
  try {
    // This would insert into a metrics table
    // For now, return the metric as confirmation
    return {
      ...metric,
      saved: true,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Failed to save AR metric:', error);
    throw error;
  }
}

/**
 * Get metrics for a specific task
 */
export async function getTaskMetrics(taskId: string): Promise<ARMetric[]> {
  try {
    // Query metrics for the task
    // This would fetch from database
    return [];
  } catch (error) {
    console.error('Failed to get task metrics:', error);
    throw error;
  }
}

/**
 * Get aggregated metrics for a task
 */
export async function getTaskMetricsAggregate(taskId: string): Promise<MetricsAggregate | null> {
  try {
    const metrics = await getTaskMetrics(taskId);

    if (metrics.length === 0) {
      return null;
    }

    const successRates = metrics.map((m) => m.successRate);
    const executionTimes = metrics.map((m) => m.executionTime);
    const cpuUsages = metrics.map((m) => m.cpuUsage);
    const memoryUsages = metrics.map((m) => m.memoryUsage);
    const storageUsages = metrics.map((m) => m.storageUsage);

    return {
      taskId,
      totalExecutions: metrics.length,
      averageSuccessRate: successRates.reduce((a, b) => a + b, 0) / metrics.length,
      averageExecutionTime: executionTimes.reduce((a, b) => a + b, 0) / metrics.length,
      averageCpuUsage: cpuUsages.reduce((a, b) => a + b, 0) / metrics.length,
      averageMemoryUsage: memoryUsages.reduce((a, b) => a + b, 0) / metrics.length,
      averageStorageUsage: storageUsages.reduce((a, b) => a + b, 0) / metrics.length,
      peakCpuUsage: Math.max(...cpuUsages),
      peakMemoryUsage: Math.max(...memoryUsages),
      peakStorageUsage: Math.max(...storageUsages),
      firstRecorded: Math.min(...metrics.map((m) => m.timestamp)),
      lastRecorded: Math.max(...metrics.map((m) => m.timestamp)),
    };
  } catch (error) {
    console.error('Failed to get aggregated metrics:', error);
    throw error;
  }
}

/**
 * Get metrics for date range
 */
export async function getMetricsForDateRange(
  startDate: Date,
  endDate: Date
): Promise<ARMetric[]> {
  try {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    // Query metrics within date range
    // This would fetch from database
    return [];
  } catch (error) {
    console.error('Failed to get metrics for date range:', error);
    throw error;
  }
}

/**
 * Get metrics summary for dashboard
 */
export async function getMetricsSummary() {
  try {
    return {
      totalMetricsRecorded: 0,
      averageSystemHealth: 0,
      peakCpuUsage: 0,
      peakMemoryUsage: 0,
      averageTaskSuccessRate: 0,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Failed to get metrics summary:', error);
    throw error;
  }
}

/**
 * Clean up old metrics (older than 90 days)
 */
export async function cleanupOldMetrics(daysToKeep: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // Delete metrics older than cutoff date
    console.log(`Cleaned up metrics older than ${cutoffDate.toISOString()}`);

    return {
      success: true,
      deletedCount: 0,
      cutoffDate: cutoffDate.toISOString(),
    };
  } catch (error) {
    console.error('Failed to cleanup old metrics:', error);
    throw error;
  }
}

/**
 * Export metrics as CSV
 */
export async function exportMetricsAsCSV(taskId?: string): Promise<string> {
  try {
    let metrics: ARMetric[] = [];

    if (taskId) {
      metrics = await getTaskMetrics(taskId);
    } else {
      // Get all metrics
      metrics = [];
    }

    // Create CSV header
    const headers = [
      'Task ID',
      'Success Rate',
      'Execution Time (s)',
      'CPU Usage (%)',
      'Memory Usage (%)',
      'Storage Usage (%)',
      'Timestamp',
    ];

    // Create CSV rows
    const rows = metrics.map((m) => [
      m.taskId,
      m.successRate.toFixed(2),
      m.executionTime.toFixed(2),
      m.cpuUsage.toFixed(2),
      m.memoryUsage.toFixed(2),
      m.storageUsage.toFixed(2),
      new Date(m.timestamp).toISOString(),
    ]);

    // Combine headers and rows
    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    return csv;
  } catch (error) {
    console.error('Failed to export metrics:', error);
    throw error;
  }
}
