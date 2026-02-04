/**
 * QUMUS Audit Trail System
 * 
 * Comprehensive logging and traceability for all decisions.
 * Provides compliance reporting and decision replay capabilities.
 */

import { DecisionContext, DecisionLogEntry, DecisionStatus } from "./decisionEngine";

export interface AuditEntry {
  entryId: string;
  timestamp: Date;
  decisionId: string;
  userId: number;
  action: string;
  platform: string;
  details: Record<string, any>;
  status: "success" | "failure";
  ipAddress?: string;
  userAgent?: string;
}

export interface ComplianceReport {
  reportId: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  totalDecisions: number;
  decisionsByPolicy: Record<string, number>;
  decisionsBySeverity: Record<string, number>;
  failureRate: number;
  averageExecutionTime: number;
  criticalDecisions: DecisionContext[];
  auditTrail: AuditEntry[];
}

/**
 * Audit Trail Manager
 */
export class AuditTrailManager {
  private auditLog: AuditEntry[] = [];
  private decisionHistory: Map<string, DecisionContext[]> = new Map();

  /**
   * Log an audit entry
   */
  logEntry(entry: Omit<AuditEntry, "entryId">): AuditEntry {
    const auditEntry: AuditEntry = {
      ...entry,
      entryId: this.generateId("audit"),
    };
    this.auditLog.push(auditEntry);
    return auditEntry;
  }

  /**
   * Log decision execution
   */
  logDecisionExecution(
    decision: DecisionContext,
    userId: number,
    status: "success" | "failure",
    details: Record<string, any> = {}
  ): AuditEntry {
    return this.logEntry({
      timestamp: new Date(),
      decisionId: decision.decisionId,
      userId,
      action: "decision_executed",
      platform: decision.affectedPlatforms.join(","),
      details: {
        policy: decision.policyId,
        severity: decision.severity,
        reason: decision.reason,
        ...details,
      },
      status,
    });
  }

  /**
   * Log decision approval
   */
  logDecisionApproval(decision: DecisionContext, userId: number): AuditEntry {
    return this.logEntry({
      timestamp: new Date(),
      decisionId: decision.decisionId,
      userId,
      action: "decision_approved",
      platform: decision.affectedPlatforms.join(","),
      details: {
        policy: decision.policyId,
        severity: decision.severity,
      },
      status: "success",
    });
  }

  /**
   * Log decision rollback
   */
  logDecisionRollback(decision: DecisionContext, userId: number, reason: string): AuditEntry {
    return this.logEntry({
      timestamp: new Date(),
      decisionId: decision.decisionId,
      userId,
      action: "decision_rolled_back",
      platform: decision.affectedPlatforms.join(","),
      details: {
        policy: decision.policyId,
        reason,
      },
      status: "success",
    });
  }

  /**
   * Get audit entries for a decision
   */
  getDecisionAudit(decisionId: string): AuditEntry[] {
    return this.auditLog.filter((entry) => entry.decisionId === decisionId);
  }

  /**
   * Get audit entries for a user
   */
  getUserAudit(userId: number): AuditEntry[] {
    return this.auditLog.filter((entry) => entry.userId === userId);
  }

  /**
   * Get audit entries for a platform
   */
  getPlatformAudit(platform: string): AuditEntry[] {
    return this.auditLog.filter((entry) => entry.platform.includes(platform));
  }

  /**
   * Get audit entries in time range
   */
  getAuditByTimeRange(start: Date, end: Date): AuditEntry[] {
    return this.auditLog.filter((entry) => entry.timestamp >= start && entry.timestamp <= end);
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(start: Date, end: Date): ComplianceReport {
    const entries = this.getAuditByTimeRange(start, end);
    const decisions = new Map<string, DecisionContext>();

    // Aggregate decisions
    for (const entry of entries) {
      if (entry.action === "decision_executed") {
        const policy = entry.details.policy;
        if (!decisions.has(entry.decisionId)) {
          decisions.set(entry.decisionId, {
            decisionId: entry.decisionId,
            policyId: policy,
            severity: entry.details.severity,
            status: DecisionStatus.COMPLETED,
            timestamp: entry.timestamp,
            userId: entry.userId,
            reason: entry.details.reason,
            affectedPlatforms: [],
            payload: {},
            metadata: {
              autonomyLevel: 0,
              confidence: 0,
              alternatives: [],
              tags: [],
            },
          });
        }
      }
    }

    // Calculate statistics
    const decisionsByPolicy: Record<string, number> = {};
    const decisionsBySeverity: Record<string, number> = {};
    let successCount = 0;
    let failureCount = 0;

    const decisionsArray = Array.from(decisions.values());
    for (const decision of decisionsArray) {
      decisionsByPolicy[decision.policyId] = (decisionsByPolicy[decision.policyId] || 0) + 1;
      decisionsBySeverity[decision.severity] = (decisionsBySeverity[decision.severity] || 0) + 1;
    }

    for (const entry of entries) {
      if (entry.action === "decision_executed") {
        if (entry.status === "success") successCount++;
        else failureCount++;
      }
    }

    const totalDecisions = successCount + failureCount;
    const failureRate = totalDecisions > 0 ? (failureCount / totalDecisions) * 100 : 0;

    // Get critical decisions
    const criticalDecisions = Array.from(decisions.values()).filter((d) => d.severity === "critical");

    return {
      reportId: this.generateId("report"),
      generatedAt: new Date(),
      period: { start, end },
      totalDecisions,
      decisionsByPolicy,
      decisionsBySeverity,
      failureRate,
      averageExecutionTime: 0, // Would calculate from timestamps
      criticalDecisions,
      auditTrail: entries,
    };
  }

  /**
   * Replay decision execution for debugging
   */
  replayDecision(decisionId: string): AuditEntry[] {
    const audit = this.getDecisionAudit(decisionId);
    console.log(`\n=== Decision Replay: ${decisionId} ===`);

    for (const entry of audit) {
      console.log(`[${entry.timestamp.toISOString()}] ${entry.action}`);
      console.log(`  Status: ${entry.status}`);
      console.log(`  Details:`, entry.details);
    }

    console.log(`=== End Replay ===\n`);
    return audit;
  }

  /**
   * Export audit log as JSON
   */
  exportAuditLog(decisionId?: string): string {
    const entries = decisionId ? this.getDecisionAudit(decisionId) : this.auditLog;
    return JSON.stringify(entries, null, 2);
  }

  /**
   * Export audit log as CSV
   */
  exportAuditLogCSV(decisionId?: string): string {
    const entries = decisionId ? this.getDecisionAudit(decisionId) : this.auditLog;

    const headers = ["Entry ID", "Timestamp", "Decision ID", "User ID", "Action", "Platform", "Status"];
    const rows = entries.map((entry) => [
      entry.entryId,
      entry.timestamp.toISOString(),
      entry.decisionId,
      entry.userId.toString(),
      entry.action,
      entry.platform,
      entry.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    return csv;
  }

  /**
   * Clear audit log (use with caution)
   */
  clearAuditLog(beforeDate?: Date): number {
    const initialLength = this.auditLog.length;

    if (beforeDate) {
      this.auditLog = this.auditLog.filter((entry) => entry.timestamp >= beforeDate);
    } else {
      this.auditLog = [];
    }

    return initialLength - this.auditLog.length;
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const auditTrailManager = new AuditTrailManager();
