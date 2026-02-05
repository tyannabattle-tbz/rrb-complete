import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getAuditLogs, storeDecision } from "../_core/redis";
import { generateId } from "../_core/utils";

/**
 * Compliance Reporting Router
 * Generates compliance reports from decision audit trails
 */

interface ComplianceReport {
  reportId: string;
  generatedAt: string;
  generatedBy: number;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: {
    totalDecisions: number;
    totalPolicies: number;
    complianceRate: number;
    violations: number;
  };
  policies: Array<{
    name: string;
    decisions: number;
    violations: number;
    complianceRate: number;
  }>;
  decisions: Array<{
    decisionId: string;
    policy: string;
    action: string;
    userId: number;
    timestamp: string;
    success: boolean;
    reason: string;
  }>;
}

export const complianceReportingRouter = router({
  /**
   * Generate compliance report for a date range
   */
  generateComplianceReport: adminProcedure
    .input(
      z.object({
        startDate: z.string(),
        endDate: z.string(),
        includeViolations: z.boolean().default(true),
        format: z.enum(["json", "csv", "html"]).default("json"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = generateId("decision");

      try {
        const reportId = generateId("report");
        const auditLogs = await getAuditLogs(10000);

        // Filter logs by date range
        const startTime = new Date(input.startDate).getTime();
        const endTime = new Date(input.endDate).getTime();

        const filteredLogs = auditLogs.filter((log: any) => {
          const logTime = new Date(log.timestamp).getTime();
          return logTime >= startTime && logTime <= endTime;
        });

        // Calculate statistics
        const totalDecisions = filteredLogs.length;
        const violations = filteredLogs.filter((log: any) => !log.success).length;
        const complianceRate =
          totalDecisions > 0 ? ((totalDecisions - violations) / totalDecisions) * 100 : 100;

        // Group by policy
        const policyStats: Record<string, any> = {};
        filteredLogs.forEach((log: any) => {
          if (!policyStats[log.policy]) {
            policyStats[log.policy] = {
              name: log.policy,
              decisions: 0,
              violations: 0,
            };
          }
          policyStats[log.policy].decisions++;
          if (!log.success) {
            policyStats[log.policy].violations++;
          }
        });

        // Calculate policy compliance rates
        const policies = Object.values(policyStats).map((policy: any) => ({
          name: policy.name,
          decisions: policy.decisions,
          violations: policy.violations,
          complianceRate:
            policy.decisions > 0
              ? ((policy.decisions - policy.violations) / policy.decisions) * 100
              : 100,
        }));

        // Build report
        const report: ComplianceReport = {
          reportId,
          generatedAt: new Date().toISOString(),
          generatedBy: ctx.user.id,
          period: {
            startDate: input.startDate,
            endDate: input.endDate,
          },
          summary: {
            totalDecisions,
            totalPolicies: policies.length,
            complianceRate: Math.round(complianceRate * 100) / 100,
            violations,
          },
          policies: policies as any,
          decisions: filteredLogs.map((log: any) => ({
            decisionId: log.decisionId,
            policy: log.policy,
            action: log.action,
            userId: log.userId,
            timestamp: log.timestamp,
            success: log.success,
            reason: log.reason || "N/A",
          })),
        };

        // Format report
        let formattedReport: string;
        if (input.format === "csv") {
          formattedReport = generateCSVReport(report);
        } else if (input.format === "html") {
          formattedReport = generateHTMLReport(report);
        } else {
          formattedReport = JSON.stringify(report, null, 2);
        }

        const decision = {
          decisionId,
          userId: ctx.user.id,
          policy: "compliance-reporting-policy",
          action: "generate_compliance_report",
          reason: `Generated compliance report for ${input.startDate} to ${input.endDate}`,
          state: {
            reportId,
            format: input.format,
            totalDecisions,
            complianceRate,
            violations,
          },
          timestamp: new Date().toISOString(),
          success: true,
        };

        await storeDecision(decision);
        console.log(
          `[QUMUS Decision] ${decisionId} - Compliance report generated: ${reportId}`
        );

        return {
          decisionId,
          reportId,
          format: input.format,
          report: formattedReport,
          summary: report.summary,
          generatedAt: report.generatedAt,
        };
      } catch (error) {
        console.error("[Compliance Reporting] Failed to generate report:", error);
        throw error;
      }
    }),

  /**
   * Generate policy violation report
   */
  generateViolationReport: adminProcedure
    .input(
      z.object({
        policyName: z.string().optional(),
        severity: z.enum(["all", "high", "critical"]).default("all"),
        limit: z.number().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const auditLogs = await getAuditLogs(10000);

        // Filter violations
        let violations = auditLogs.filter((log: any) => !log.success);

        if (input.policyName) {
          violations = violations.filter((log: any) => log.policy === input.policyName);
        }

        // Sort by timestamp descending
        violations.sort(
          (a: any, b: any) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Limit results
        violations = violations.slice(0, input.limit);

        return {
          totalViolations: violations.length,
          violations: violations.map((v: any) => ({
            decisionId: v.decisionId,
            policy: v.policy,
            action: v.action,
            userId: v.userId,
            timestamp: v.timestamp,
            reason: v.reason,
            severity: v.severity || "medium",
          })),
        };
      } catch (error) {
        console.error("[Compliance Reporting] Failed to generate violation report:", error);
        throw error;
      }
    }),

  /**
   * Generate audit trail export
   */
  exportAuditTrail: protectedProcedure
    .input(
      z.object({
        format: z.enum(["csv", "json", "html"]).default("csv"),
        limit: z.number().default(1000),
        policyFilter: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const decisionId = generateId("decision");

      try {
        let auditLogs = await getAuditLogs(input.limit);

        if (input.policyFilter) {
          auditLogs = auditLogs.filter((log: any) => log.policy === input.policyFilter);
        }

        let exportData: string;
        if (input.format === "csv") {
          exportData = generateAuditCSV(auditLogs);
        } else if (input.format === "html") {
          exportData = generateAuditHTML(auditLogs);
        } else {
          exportData = JSON.stringify(auditLogs, null, 2);
        }

        const decision = {
          decisionId,
          userId: ctx.user.id,
          policy: "compliance-reporting-policy",
          action: "export_audit_trail",
          reason: `Exported audit trail in ${input.format} format`,
          state: {
            format: input.format,
            recordCount: auditLogs.length,
            policyFilter: input.policyFilter,
          },
          timestamp: new Date().toISOString(),
          success: true,
        };

        await storeDecision(decision);

        return {
          decisionId,
          format: input.format,
          recordCount: auditLogs.length,
          data: exportData,
          exportedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error("[Compliance Reporting] Failed to export audit trail:", error);
        throw error;
      }
    }),

  /**
   * Get compliance metrics
   */
  getComplianceMetrics: protectedProcedure
    .input(
      z.object({
        days: z.number().default(30),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const auditLogs = await getAuditLogs(10000);

        // Filter logs from last N days
        const cutoffTime = Date.now() - input.days * 24 * 60 * 60 * 1000;
        const recentLogs = auditLogs.filter(
          (log: any) => new Date(log.timestamp).getTime() >= cutoffTime
        );

        const totalDecisions = recentLogs.length;
        const successfulDecisions = recentLogs.filter((log: any) => log.success).length;
        const failedDecisions = totalDecisions - successfulDecisions;
        const complianceRate =
          totalDecisions > 0 ? (successfulDecisions / totalDecisions) * 100 : 100;

        // Group by policy
        const policyMetrics: Record<string, any> = {};
        recentLogs.forEach((log: any) => {
          if (!policyMetrics[log.policy]) {
            policyMetrics[log.policy] = {
              total: 0,
              successful: 0,
              failed: 0,
            };
          }
          policyMetrics[log.policy].total++;
          if (log.success) {
            policyMetrics[log.policy].successful++;
          } else {
            policyMetrics[log.policy].failed++;
          }
        });

        // Calculate metrics per policy
        const policies = Object.entries(policyMetrics).map(([name, stats]: any) => ({
          name,
          total: stats.total,
          successful: stats.successful,
          failed: stats.failed,
          complianceRate: (stats.successful / stats.total) * 100,
        }));

        return {
          period: {
            days: input.days,
            startDate: new Date(cutoffTime).toISOString(),
            endDate: new Date().toISOString(),
          },
          summary: {
            totalDecisions,
            successfulDecisions,
            failedDecisions,
            complianceRate: Math.round(complianceRate * 100) / 100,
          },
          policies,
          trend: calculateTrend(recentLogs),
        };
      } catch (error) {
        console.error("[Compliance Reporting] Failed to get metrics:", error);
        throw error;
      }
    }),
});

/**
 * Helper functions
 */

function generateCSVReport(report: ComplianceReport): string {
  const headers = [
    "Report ID",
    "Generated At",
    "Total Decisions",
    "Violations",
    "Compliance Rate",
  ];

  const rows = [
    [
      report.reportId,
      report.generatedAt,
      report.summary.totalDecisions,
      report.summary.violations,
      `${report.summary.complianceRate}%`,
    ],
  ];

  // Add policy details
  rows.push(["", "", "", "", ""]);
  rows.push(["Policy", "Decisions", "Violations", "Compliance Rate", ""]);

  report.policies.forEach((policy) => {
    rows.push([
      policy.name,
      policy.decisions.toString(),
      policy.violations.toString(),
      `${policy.complianceRate}%`,
      "",
    ]);
  });

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

function generateHTMLReport(report: ComplianceReport): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Compliance Report - ${report.reportId}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .summary { background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <h1>Compliance Report</h1>
  <p>Report ID: ${report.reportId}</p>
  <p>Generated: ${report.generatedAt}</p>
  <p>Period: ${report.period.startDate} to ${report.period.endDate}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Decisions: ${report.summary.totalDecisions}</p>
    <p>Violations: ${report.summary.violations}</p>
    <p>Compliance Rate: ${report.summary.complianceRate}%</p>
  </div>
  
  <h2>Policy Breakdown</h2>
  <table>
    <tr>
      <th>Policy</th>
      <th>Decisions</th>
      <th>Violations</th>
      <th>Compliance Rate</th>
    </tr>
    ${report.policies
      .map(
        (p) => `
    <tr>
      <td>${p.name}</td>
      <td>${p.decisions}</td>
      <td>${p.violations}</td>
      <td>${p.complianceRate}%</td>
    </tr>
    `
      )
      .join("")}
  </table>
</body>
</html>
  `;
}

function generateAuditCSV(logs: any[]): string {
  const headers = ["Decision ID", "Policy", "Action", "User ID", "Timestamp", "Success", "Reason"];
  const rows = logs.map((log) => [
    log.decisionId,
    log.policy,
    log.action,
    log.userId,
    log.timestamp,
    log.success ? "Yes" : "No",
    log.reason || "N/A",
  ]);

  return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

function generateAuditHTML(logs: any[]): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Audit Trail Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #2196F3; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Audit Trail</h1>
  <p>Exported: ${new Date().toISOString()}</p>
  <table>
    <tr>
      <th>Decision ID</th>
      <th>Policy</th>
      <th>Action</th>
      <th>User ID</th>
      <th>Timestamp</th>
      <th>Success</th>
      <th>Reason</th>
    </tr>
    ${logs
      .map(
        (log) => `
    <tr>
      <td>${log.decisionId}</td>
      <td>${log.policy}</td>
      <td>${log.action}</td>
      <td>${log.userId}</td>
      <td>${log.timestamp}</td>
      <td>${log.success ? "✓" : "✗"}</td>
      <td>${log.reason || "N/A"}</td>
    </tr>
    `
      )
      .join("")}
  </table>
</body>
</html>
  `;
}

function calculateTrend(logs: any[]): string {
  if (logs.length < 2) return "insufficient_data";

  const recent = logs.slice(0, Math.floor(logs.length / 2));
  const older = logs.slice(Math.floor(logs.length / 2));

  const recentRate = recent.filter((l: any) => l.success).length / recent.length;
  const olderRate = older.filter((l: any) => l.success).length / older.length;

  if (recentRate > olderRate) return "improving";
  if (recentRate < olderRate) return "declining";
  return "stable";
}
