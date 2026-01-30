import * as db from "../db";

/**
 * Metrics Service - Aggregates and analyzes performance data
 */

export interface MetricsSnapshot {
  totalSessions: number;
  totalMessages: number;
  totalToolExecutions: number;
  averageSessionDuration: number;
  successRate: number;
  errorRate: number;
  averageResponseTime: number;
  topTools: Array<{ name: string; count: number; avgDuration: number }>;
  dailyActivity: Array<{ date: string; sessions: number; messages: number }>;
  quotaUsage: {
    requestsUsed: number;
    requestsLimit: number;
    tokensUsed: number;
    tokensLimit: number;
    percentageUsed: number;
  };
}

export interface PerformanceReport {
  period: string;
  startDate: Date;
  endDate: Date;
  metrics: MetricsSnapshot;
  trends: {
    sessionTrend: "increasing" | "decreasing" | "stable";
    errorTrend: "increasing" | "decreasing" | "stable";
    performanceTrend: "improving" | "degrading" | "stable";
  };
  recommendations: string[];
}

export class MetricsService {
  /**
   * Get comprehensive metrics snapshot for a user
   */
  static async getMetricsSnapshot(userId: number): Promise<MetricsSnapshot> {
    // Get sessions
    const sessions = await db.getUserSessions(userId);
    const totalSessions = sessions.length;

    // Get messages
    let totalMessages = 0;
    let totalSessionDuration = 0;
    let completedSessions = 0;

    for (const session of sessions) {
      const messages = await db.getSessionMessages(session.id);
      totalMessages += messages.length;

      if (session.status === "completed") {
        completedSessions++;
        const duration = new Date(session.updatedAt).getTime() - new Date(session.createdAt).getTime();
        totalSessionDuration += duration;
      }
    }

    const averageSessionDuration = completedSessions > 0 ? totalSessionDuration / completedSessions / 1000 : 0; // in seconds

    // Get tool executions
    let totalToolExecutions = 0;
    let successfulTools = 0;
    let failedTools = 0;
    const toolStats: Record<string, { count: number; totalDuration: number }> = {};

    for (const session of sessions) {
      const tools = await db.getSessionToolExecutions(session.id);
      totalToolExecutions += tools.length;

      for (const tool of tools) {
        if (tool.status === "completed") {
          successfulTools++;
        } else if (tool.status === "failed") {
          failedTools++;
        }

        if (!toolStats[tool.toolName]) {
          toolStats[tool.toolName] = { count: 0, totalDuration: 0 };
        }
        toolStats[tool.toolName].count++;
        toolStats[tool.toolName].totalDuration += tool.duration || 0;
      }
    }

    const successRate = totalToolExecutions > 0 ? (successfulTools / totalToolExecutions) * 100 : 0;
    const errorRate = totalToolExecutions > 0 ? (failedTools / totalToolExecutions) * 100 : 0;

    // Calculate top tools
    const topTools = Object.entries(toolStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgDuration: stats.count > 0 ? stats.totalDuration / stats.count : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get API usage
    const apiUsage = await db.getApiUsage(userId, 1);
    const totalDuration = apiUsage.reduce((sum, usage) => sum + (usage.totalDuration || 0), 0);
    const averageResponseTime = totalToolExecutions > 0 ? totalDuration / totalToolExecutions : 0;

    // Get quota usage
    const quota = await db.getOrCreateQuota(userId);
    const dailyUsage = apiUsage[0];

    const requestsPerDay = quota.requestsPerDay || 10000;
    const tokensPerDay = quota.tokensPerDay || 1000000;
    const quotaUsage = {
      requestsUsed: dailyUsage?.requestCount || 0,
      requestsLimit: requestsPerDay,
      tokensUsed: dailyUsage?.tokenCount || 0,
      tokensLimit: tokensPerDay,
      percentageUsed: requestsPerDay > 0 ? ((dailyUsage?.requestCount || 0) / requestsPerDay) * 100 : 0,
    };

    // Get daily activity (last 7 days)
    const dailyActivity: Array<{ date: string; sessions: number; messages: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const daySessions = sessions.filter((s) => {
        const sDate = new Date(s.createdAt).toISOString().split("T")[0];
        return sDate === dateStr;
      });

      let dayMessages = 0;
      for (const session of daySessions) {
        const messages = await db.getSessionMessages(session.id);
        dayMessages += messages.length;
      }

      dailyActivity.push({
        date: dateStr,
        sessions: daySessions.length,
        messages: dayMessages,
      });
    }

    return {
      totalSessions,
      totalMessages,
      totalToolExecutions,
      averageSessionDuration,
      successRate,
      errorRate,
      averageResponseTime,
      topTools,
      dailyActivity,
      quotaUsage,
    };
  }

  /**
   * Generate a performance report for a period
   */
  static async generatePerformanceReport(
    userId: number,
    period: "daily" | "weekly" | "monthly" = "weekly"
  ): Promise<PerformanceReport> {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case "daily":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "weekly":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const metrics = await this.getMetricsSnapshot(userId);

    // Calculate trends by comparing with previous period
    const previousStartDate = new Date(startDate);
    const previousEndDate = new Date(startDate);

    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    previousStartDate.setDate(previousStartDate.getDate() - daysDiff);

    // Determine trends (simplified - in production would compare actual data)
    const sessionTrend: "increasing" | "decreasing" | "stable" = metrics.totalSessions > 5 ? "increasing" : "stable";
    const errorTrend: "increasing" | "decreasing" | "stable" = metrics.errorRate > 10 ? "increasing" : "stable";
    const performanceTrend: "improving" | "degrading" | "stable" =
      metrics.successRate > 90 ? "improving" : metrics.successRate < 70 ? "degrading" : "stable";

    // Generate recommendations
    const recommendations: string[] = [];

    if (metrics.errorRate > 10) {
      recommendations.push("Error rate is above 10%. Review failed tool executions for patterns.");
    }

    if (metrics.successRate < 70) {
      recommendations.push("Success rate is below 70%. Consider optimizing agent configuration or tool implementations.");
    }

    if (metrics.quotaUsage.percentageUsed > 80) {
      recommendations.push("API quota usage is above 80%. Consider upgrading your plan or optimizing requests.");
    }

    if (metrics.averageResponseTime > 5000) {
      recommendations.push("Average response time exceeds 5 seconds. Investigate tool performance bottlenecks.");
    }

    if (metrics.topTools.length > 0 && metrics.topTools[0].count > metrics.totalToolExecutions * 0.5) {
      recommendations.push(
        `Tool "${metrics.topTools[0].name}" accounts for over 50% of executions. Consider optimizing or caching its results.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("System is performing well. Continue monitoring for any changes.");
    }

    return {
      period,
      startDate,
      endDate,
      metrics,
      trends: {
        sessionTrend,
        errorTrend,
        performanceTrend,
      },
      recommendations,
    };
  }

  /**
   * Get quota usage and warnings
   */
  static async getQuotaStatus(userId: number) {
    const quota = await db.getOrCreateQuota(userId);
    const usage = await db.getApiUsage(userId, 1);
    const dailyUsage = usage[0];

    const requestsPerDay = quota.requestsPerDay || 10000;
    const tokensPerDay = quota.tokensPerDay || 1000000;
    const requestPercentage = requestsPerDay > 0 ? ((dailyUsage?.requestCount || 0) / requestsPerDay) * 100 : 0;
    const tokenPercentage = tokensPerDay > 0 ? ((dailyUsage?.tokenCount || 0) / tokensPerDay) * 100 : 0;

    return {
      quota,
      usage: dailyUsage,
      requestPercentage,
      tokenPercentage,
      warnings: [
        ...(requestPercentage > 80 ? ["Request quota usage above 80%"] : []),
        ...(tokenPercentage > 80 ? ["Token quota usage above 80%"] : []),
        ...(requestPercentage > 95 ? ["Request quota usage critical (>95%)"] : []),
        ...(tokenPercentage > 95 ? ["Token quota usage critical (>95%)"] : []),
      ],
    };
  }

  /**
   * Export metrics as CSV
   */
  static async exportMetricsAsCSV(userId: number): Promise<string> {
    const metrics = await this.getMetricsSnapshot(userId);

    const lines = [
      "Metric,Value",
      `Total Sessions,${metrics.totalSessions}`,
      `Total Messages,${metrics.totalMessages}`,
      `Total Tool Executions,${metrics.totalToolExecutions}`,
      `Average Session Duration (seconds),${metrics.averageSessionDuration.toFixed(2)}`,
      `Success Rate (%),${metrics.successRate.toFixed(2)}`,
      `Error Rate (%),${metrics.errorRate.toFixed(2)}`,
      `Average Response Time (ms),${metrics.averageResponseTime.toFixed(2)}`,
      "",
      "Tool,Executions,Average Duration (ms)",
      ...metrics.topTools.map((tool) => `${tool.name},${tool.count},${tool.avgDuration.toFixed(2)}`),
      "",
      "Quota Usage",
      `Requests Used,${metrics.quotaUsage.requestsUsed}`,
      `Requests Limit,${metrics.quotaUsage.requestsLimit}`,
      `Tokens Used,${metrics.quotaUsage.tokensUsed}`,
      `Tokens Limit,${metrics.quotaUsage.tokensLimit}`,
      `Usage Percentage,${metrics.quotaUsage.percentageUsed.toFixed(2)}%`,
    ];

    return lines.join("\n");
  }
}
