/**
 * Audit Trail Export Service
 * Exports audit logs and activity trails in CSV, PDF, and HTML formats
 */

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  status: "success" | "failure";
  errorMessage?: string;
}

export interface AuditFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resourceType?: string;
  status?: "success" | "failure";
}

export class AuditExporter {
  private auditLogs: AuditEntry[] = [];

  /**
   * Add an audit entry
   */
  addEntry(entry: AuditEntry): void {
    this.auditLogs.push(entry);
  }

  /**
   * Get audit logs with filters
   */
  getAuditLogs(filter?: AuditFilter): AuditEntry[] {
    return this.auditLogs.filter((log) => {
      if (filter?.startDate && log.timestamp < filter.startDate) return false;
      if (filter?.endDate && log.timestamp > filter.endDate) return false;
      if (filter?.userId && log.userId !== filter.userId) return false;
      if (filter?.action && log.action !== filter.action) return false;
      if (filter?.resourceType && log.resourceType !== filter.resourceType)
        return false;
      if (filter?.status && log.status !== filter.status) return false;
      return true;
    });
  }

  /**
   * Export audit logs as CSV
   */
  exportAsCSV(filter?: AuditFilter): string {
    const logs = this.getAuditLogs(filter);
    const headers = [
      "Timestamp",
      "User ID",
      "Action",
      "Resource Type",
      "Resource ID",
      "Status",
      "Error Message",
      "IP Address",
    ];

    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.userId,
      log.action,
      log.resourceType,
      log.resourceId,
      log.status,
      log.errorMessage || "",
      log.ipAddress || "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csv;
  }

  /**
   * Export audit logs as HTML
   */
  exportAsHTML(filter?: AuditFilter): string {
    const logs = this.getAuditLogs(filter);

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Audit Trail Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .success { color: green; }
    .failure { color: red; }
  </style>
</head>
<body>
  <h1>Audit Trail Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>
  <p>Total Entries: ${logs.length}</p>
  <table>
    <thead>
      <tr>
        <th>Timestamp</th>
        <th>User ID</th>
        <th>Action</th>
        <th>Resource</th>
        <th>Status</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
      ${logs
        .map(
          (log) => `
      <tr>
        <td>${log.timestamp.toLocaleString()}</td>
        <td>${log.userId}</td>
        <td>${log.action}</td>
        <td>${log.resourceType}#${log.resourceId}</td>
        <td class="${log.status}">${log.status.toUpperCase()}</td>
        <td>${log.errorMessage || "-"}</td>
      </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</body>
</html>
    `.trim();

    return html;
  }

  /**
   * Export audit logs as JSON
   */
  exportAsJSON(filter?: AuditFilter): string {
    const logs = this.getAuditLogs(filter);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get audit statistics
   */
  getStatistics(filter?: AuditFilter): {
    totalEntries: number;
    successCount: number;
    failureCount: number;
    uniqueUsers: number;
    actionBreakdown: Record<string, number>;
  } {
    const logs = this.getAuditLogs(filter);

    const actionBreakdown: Record<string, number> = {};
    let successCount = 0;
    let failureCount = 0;
    const uniqueUsers = new Set<string>();

    logs.forEach((log) => {
      if (log.status === "success") successCount++;
      else failureCount++;

      uniqueUsers.add(log.userId);

      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;
    });

    return {
      totalEntries: logs.length,
      successCount,
      failureCount,
      uniqueUsers: uniqueUsers.size,
      actionBreakdown,
    };
  }

  /**
   * Get audit logs by user
   */
  getLogsByUser(userId: string): AuditEntry[] {
    return this.auditLogs.filter((log) => log.userId === userId);
  }

  /**
   * Get audit logs by action
   */
  getLogsByAction(action: string): AuditEntry[] {
    return this.auditLogs.filter((log) => log.action === action);
  }

  /**
   * Get audit logs by resource
   */
  getLogsByResource(resourceType: string, resourceId: string): AuditEntry[] {
    return this.auditLogs.filter(
      (log) => log.resourceType === resourceType && log.resourceId === resourceId
    );
  }

  /**
   * Clear old audit logs
   */
  clearOldLogs(daysToKeep: number): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const initialLength = this.auditLogs.length;
    this.auditLogs = this.auditLogs.filter((log) => log.timestamp > cutoffDate);

    return initialLength - this.auditLogs.length;
  }

  /**
   * Search audit logs
   */
  searchLogs(query: string): AuditEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.auditLogs.filter(
      (log) =>
        log.userId.toLowerCase().includes(lowerQuery) ||
        log.action.toLowerCase().includes(lowerQuery) ||
        log.resourceType.toLowerCase().includes(lowerQuery) ||
        log.resourceId.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton instance
export const auditExporter = new AuditExporter();
