import { db } from '../db';

export interface HealthCheckRecord {
  timestamp: string;
  systemName: string;
  status: 'healthy' | 'warning' | 'critical';
  details: string;
}

export interface ErrorRecord {
  timestamp: string;
  message: string;
  type: string;
  stack?: string;
}

export class AnalyticsExportService {
  /**
   * Generate CSV export of health check history
   */
  static generateHealthCheckCSV(records: HealthCheckRecord[]): string {
    const headers = ['Timestamp', 'System', 'Status', 'Details'];
    const rows = records.map(r => [
      r.timestamp,
      r.systemName,
      r.status,
      `"${r.details.replace(/"/g, '""')}"`, // Escape quotes for CSV
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Generate CSV export of error logs
   */
  static generateErrorLogsCSV(records: ErrorRecord[]): string {
    const headers = ['Timestamp', 'Message', 'Type', 'Stack Trace'];
    const rows = records.map(r => [
      r.timestamp,
      `"${r.message.replace(/"/g, '""')}"`,
      r.type,
      `"${(r.stack || '').replace(/"/g, '""').substring(0, 500)}"`, // Truncate stack
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Generate JSON export with metadata
   */
  static generateHealthCheckJSON(records: HealthCheckRecord[]) {
    return {
      exportDate: new Date().toISOString(),
      totalRecords: records.length,
      healthyCount: records.filter(r => r.status === 'healthy').length,
      warningCount: records.filter(r => r.status === 'warning').length,
      criticalCount: records.filter(r => r.status === 'critical').length,
      records,
    };
  }

  /**
   * Generate JSON export of error logs with analysis
   */
  static generateErrorLogsJSON(records: ErrorRecord[]) {
    const errorsByType = records.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      exportDate: new Date().toISOString(),
      totalErrors: records.length,
      errorsByType,
      records,
    };
  }

  /**
   * Generate PDF-ready HTML for health check report
   */
  static generateHealthCheckHTML(records: HealthCheckRecord[]): string {
    const healthyCount = records.filter(r => r.status === 'healthy').length;
    const warningCount = records.filter(r => r.status === 'warning').length;
    const criticalCount = records.filter(r => r.status === 'critical').length;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Health Check Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .header { background: #333; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
    .stat-box { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-label { color: #666; font-size: 12px; }
    .stat-value { font-size: 28px; font-weight: bold; margin-top: 5px; }
    .healthy { color: #22c55e; }
    .warning { color: #eab308; }
    .critical { color: #ef4444; }
    table { width: 100%; border-collapse: collapse; background: white; margin-top: 20px; }
    th { background: #f0f0f0; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
    tr:hover { background: #f9f9f9; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Health Check Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="stats">
    <div class="stat-box">
      <div class="stat-label">Healthy Systems</div>
      <div class="stat-value healthy">${healthyCount}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Warnings</div>
      <div class="stat-value warning">${warningCount}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Critical Issues</div>
      <div class="stat-value critical">${criticalCount}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>System</th>
        <th>Status</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${records.map(r => `
        <tr>
          <td>${r.timestamp}</td>
          <td>${r.systemName}</td>
          <td><span class="${r.status}">${r.status.toUpperCase()}</span></td>
          <td>${r.details}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</body>
</html>
    `;
  }

  /**
   * Get health check trends over time
   */
  static analyzeHealthTrends(records: HealthCheckRecord[]) {
    const hourlyStats: Record<string, { healthy: number; warning: number; critical: number }> = {};

    records.forEach(r => {
      const hour = new Date(r.timestamp).toISOString().substring(0, 13);
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { healthy: 0, warning: 0, critical: 0 };
      }
      hourlyStats[hour][r.status]++;
    });

    return {
      hourlyStats,
      totalRecords: records.length,
      timeRange: {
        start: records[0]?.timestamp,
        end: records[records.length - 1]?.timestamp,
      },
    };
  }

  /**
   * Get error frequency analysis
   */
  static analyzeErrorFrequency(records: ErrorRecord[]) {
    const errorsByType: Record<string, number> = {};
    const errorsByHour: Record<string, number> = {};

    records.forEach(r => {
      errorsByType[r.type] = (errorsByType[r.type] || 0) + 1;
      const hour = new Date(r.timestamp).toISOString().substring(0, 13);
      errorsByHour[hour] = (errorsByHour[hour] || 0) + 1;
    });

    return {
      errorsByType,
      errorsByHour,
      topError: Object.entries(errorsByType).sort((a, b) => b[1] - a[1])[0],
      totalErrors: records.length,
    };
  }
}
