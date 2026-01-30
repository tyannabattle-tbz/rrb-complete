import * as crypto from "crypto";

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  status: "success" | "failure";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  hash: string; // For immutability verification
  previousHash?: string; // Link to previous entry
}

export interface ComplianceReport {
  period: {
    start: Date;
    end: Date;
  };
  totalEntries: number;
  entriesByAction: Record<string, number>;
  entriesByUser: Record<string, number>;
  entriesByResource: Record<string, number>;
  failureRate: number;
  suspiciousActivities: AuditEntry[];
  summary: string;
}

export class ComplianceAuditService {
  private auditLog: AuditEntry[] = [];
  private lastHash: string = "";

  recordAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    changes: { before: Record<string, any>; after: Record<string, any> },
    status: "success" | "failure" = "success",
    metadata?: Record<string, any>
  ): AuditEntry {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      userId,
      action,
      resource,
      resourceId,
      changes,
      status,
      metadata,
      hash: "",
      previousHash: this.lastHash,
    };

    // Generate immutable hash
    entry.hash = this.generateHash(entry);
    this.lastHash = entry.hash;

    this.auditLog.push(entry);
    return entry;
  }

  private generateHash(entry: Partial<AuditEntry>): string {
    const data = JSON.stringify({
      timestamp: entry.timestamp?.toISOString(),
      userId: entry.userId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      changes: entry.changes,
      status: entry.status,
      previousHash: entry.previousHash,
    });

    return crypto.createHash("sha256").update(data).digest("hex");
  }

  verifyIntegrity(): boolean {
    let previousHash = "";
    for (const entry of this.auditLog) {
      const expectedHash = this.generateHash({ ...entry, previousHash });
      if (entry.hash !== expectedHash) {
        return false;
      }
      previousHash = entry.hash;
    }
    return true;
  }

  searchAuditLog(filters: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
    status?: "success" | "failure";
  }): AuditEntry[] {
    return this.auditLog.filter((entry) => {
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.action && entry.action !== filters.action) return false;
      if (filters.resource && entry.resource !== filters.resource) return false;
      if (filters.status && entry.status !== filters.status) return false;
      if (filters.startDate && entry.timestamp < filters.startDate) return false;
      if (filters.endDate && entry.timestamp > filters.endDate) return false;
      return true;
    });
  }

  generateComplianceReport(startDate: Date, endDate: Date): ComplianceReport {
    const entries = this.searchAuditLog({ startDate, endDate });

    const entriesByAction: Record<string, number> = {};
    const entriesByUser: Record<string, number> = {};
    const entriesByResource: Record<string, number> = {};
    let failures = 0;

    entries.forEach((entry) => {
      entriesByAction[entry.action] = (entriesByAction[entry.action] || 0) + 1;
      entriesByUser[entry.userId] = (entriesByUser[entry.userId] || 0) + 1;
      entriesByResource[entry.resource] = (entriesByResource[entry.resource] || 0) + 1;
      if (entry.status === "failure") failures++;
    });

    const suspiciousActivities = entries.filter((entry) => {
      // Flag suspicious patterns
      return (
        entry.status === "failure" || // Failed actions
        entry.action === "delete" || // Deletions
        entry.action === "modify_permissions" || // Permission changes
        (entry.metadata?.ipAddress && this.isUnusualIP(entry.metadata.ipAddress))
      );
    });

    const failureRate = entries.length > 0 ? (failures / entries.length) * 100 : 0;

    return {
      period: { start: startDate, end: endDate },
      totalEntries: entries.length,
      entriesByAction,
      entriesByUser,
      entriesByResource,
      failureRate,
      suspiciousActivities,
      summary: `Audit report for period ${startDate.toISOString()} to ${endDate.toISOString()}. Total entries: ${entries.length}, Failures: ${failures}, Suspicious activities: ${suspiciousActivities.length}`,
    };
  }

  private isUnusualIP(ip: string): boolean {
    // Simple check for unusual IP patterns
    return ip.startsWith("0.") || ip.startsWith("255.");
  }

  exportAuditLog(format: "json" | "csv", filters?: any): string {
    const entries = filters ? this.searchAuditLog(filters) : this.auditLog;

    if (format === "json") {
      return JSON.stringify(entries, null, 2);
    }

    // CSV format
    const headers = [
      "ID",
      "Timestamp",
      "User ID",
      "Action",
      "Resource",
      "Resource ID",
      "Status",
      "Hash",
    ];
    const rows = entries.map((entry) => [
      entry.id,
      entry.timestamp.toISOString(),
      entry.userId,
      entry.action,
      entry.resource,
      entry.resourceId,
      entry.status,
      entry.hash,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    return csv;
  }

  getAuditStats(): {
    totalEntries: number;
    uniqueUsers: number;
    uniqueActions: number;
    failureRate: number;
    lastEntry?: AuditEntry;
  } {
    const uniqueUsers = new Set(this.auditLog.map((e) => e.userId)).size;
    const uniqueActions = new Set(this.auditLog.map((e) => e.action)).size;
    const failures = this.auditLog.filter((e) => e.status === "failure").length;
    const failureRate = this.auditLog.length > 0 ? (failures / this.auditLog.length) * 100 : 0;

    return {
      totalEntries: this.auditLog.length,
      uniqueUsers,
      uniqueActions,
      failureRate,
      lastEntry: this.auditLog[this.auditLog.length - 1],
    };
  }
}
