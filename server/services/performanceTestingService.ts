import { invokeLLM } from "../_core/llm";

export interface PerformanceTest {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedDuration: number;
  thresholds: PerformanceThresholds;
  enabled: boolean;
  runInterval: number; // minutes
}

export interface TestStep {
  id: string;
  action: "navigate" | "click" | "input" | "wait" | "api_call";
  target: string;
  value?: string;
  expectedStatus?: number;
  timeout?: number;
}

export interface PerformanceThresholds {
  p95ResponseTime: number; // milliseconds
  p99ResponseTime: number;
  errorRate: number; // percentage
  successRate: number; // percentage
}

export interface TestResult {
  testId: string;
  timestamp: Date;
  duration: number;
  success: boolean;
  steps: StepResult[];
  metrics: PerformanceMetrics;
  errors: string[];
}

export interface StepResult {
  stepId: string;
  duration: number;
  success: boolean;
  status?: number;
  error?: string;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  errorCount: number;
  successCount: number;
  totalRequests: number;
}

export interface RegressionAlert {
  id: string;
  testId: string;
  severity: "warning" | "critical";
  metric: string;
  currentValue: number;
  threshold: number;
  deviation: number; // percentage
  timestamp: Date;
  resolved: boolean;
}

// Predefined synthetic user journeys
export const SYNTHETIC_JOURNEYS: PerformanceTest[] = [
  {
    id: "auth_flow",
    name: "Authentication Flow",
    description: "Test OAuth login and session creation",
    steps: [
      {
        id: "step_1",
        action: "navigate",
        target: "/",
        timeout: 5000,
      },
      {
        id: "step_2",
        action: "click",
        target: "[data-testid='login-button']",
        timeout: 2000,
      },
      {
        id: "step_3",
        action: "wait",
        target: "oauth_redirect",
        timeout: 10000,
      },
      {
        id: "step_4",
        action: "navigate",
        target: "/dashboard",
        timeout: 5000,
      },
    ],
    expectedDuration: 15000,
    thresholds: {
      p95ResponseTime: 2000,
      p99ResponseTime: 3000,
      errorRate: 1,
      successRate: 99,
    },
    enabled: true,
    runInterval: 5,
  },

  {
    id: "agent_session",
    name: "Agent Session Creation",
    description: "Test creating and interacting with agent session",
    steps: [
      {
        id: "step_1",
        action: "navigate",
        target: "/agent",
        timeout: 5000,
      },
      {
        id: "step_2",
        action: "api_call",
        target: "POST /api/trpc/agent.createSession",
        expectedStatus: 200,
        timeout: 5000,
      },
      {
        id: "step_3",
        action: "api_call",
        target: "POST /api/trpc/agent.sendMessage",
        value: '{"sessionId":"test","message":"Hello"}',
        expectedStatus: 200,
        timeout: 10000,
      },
      {
        id: "step_4",
        action: "api_call",
        target: "GET /api/trpc/agent.getSession",
        expectedStatus: 200,
        timeout: 3000,
      },
    ],
    expectedDuration: 20000,
    thresholds: {
      p95ResponseTime: 3000,
      p99ResponseTime: 5000,
      errorRate: 0.5,
      successRate: 99.5,
    },
    enabled: true,
    runInterval: 5,
  },

  {
    id: "dashboard_load",
    name: "Dashboard Loading",
    description: "Test admin dashboard performance",
    steps: [
      {
        id: "step_1",
        action: "navigate",
        target: "/admin",
        timeout: 5000,
      },
      {
        id: "step_2",
        action: "api_call",
        target: "GET /api/trpc/admin.getSystemMetrics",
        expectedStatus: 200,
        timeout: 3000,
      },
      {
        id: "step_3",
        action: "api_call",
        target: "GET /api/trpc/admin.getAuditLogs",
        expectedStatus: 200,
        timeout: 3000,
      },
      {
        id: "step_4",
        action: "api_call",
        target: "GET /api/trpc/admin.getAlerts",
        expectedStatus: 200,
        timeout: 2000,
      },
    ],
    expectedDuration: 10000,
    thresholds: {
      p95ResponseTime: 1500,
      p99ResponseTime: 2500,
      errorRate: 0.1,
      successRate: 99.9,
    },
    enabled: true,
    runInterval: 10,
  },

  {
    id: "search_filter",
    name: "Search and Filtering",
    description: "Test session search and filtering performance",
    steps: [
      {
        id: "step_1",
        action: "navigate",
        target: "/sessions",
        timeout: 5000,
      },
      {
        id: "step_2",
        action: "api_call",
        target: "POST /api/trpc/sessions.search",
        value: '{"query":"test","filters":{"status":"active"}}',
        expectedStatus: 200,
        timeout: 5000,
      },
      {
        id: "step_3",
        action: "api_call",
        target: "POST /api/trpc/sessions.filter",
        value: '{"dateRange":{"start":"2026-01-01","end":"2026-01-30"}}',
        expectedStatus: 200,
        timeout: 5000,
      },
    ],
    expectedDuration: 12000,
    thresholds: {
      p95ResponseTime: 2000,
      p99ResponseTime: 3500,
      errorRate: 0.5,
      successRate: 99.5,
    },
    enabled: true,
    runInterval: 10,
  },
];

export function calculateMetrics(responseTimes: number[]): PerformanceMetrics {
  if (responseTimes.length === 0) {
    return {
      avgResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      errorCount: 0,
      successCount: 0,
      totalRequests: 0,
    };
  }

  const sorted = [...responseTimes].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;

  const getPercentile = (arr: number[], p: number) => {
    const index = Math.ceil((p / 100) * arr.length) - 1;
    return arr[Math.max(0, index)];
  };

  return {
    avgResponseTime: avg,
    p95ResponseTime: getPercentile(sorted, 95),
    p99ResponseTime: getPercentile(sorted, 99),
    minResponseTime: sorted[0],
    maxResponseTime: sorted[sorted.length - 1],
    errorCount: 0,
    successCount: responseTimes.length,
    totalRequests: responseTimes.length,
  };
}

export function detectRegressions(
  current: PerformanceMetrics,
  baseline: PerformanceMetrics,
  thresholds: PerformanceThresholds
): RegressionAlert[] {
  const alerts: RegressionAlert[] = [];

  // Check p95 response time
  if (current.p95ResponseTime > thresholds.p95ResponseTime) {
    const deviation = ((current.p95ResponseTime - baseline.p95ResponseTime) / baseline.p95ResponseTime) * 100;
    if (deviation > 10) {
      alerts.push({
        id: `alert_p95_${Date.now()}`,
        testId: "unknown",
        severity: deviation > 30 ? "critical" : "warning",
        metric: "p95ResponseTime",
        currentValue: current.p95ResponseTime,
        threshold: thresholds.p95ResponseTime,
        deviation,
        timestamp: new Date(),
        resolved: false,
      });
    }
  }

  // Check p99 response time
  if (current.p99ResponseTime > thresholds.p99ResponseTime) {
    const deviation = ((current.p99ResponseTime - baseline.p99ResponseTime) / baseline.p99ResponseTime) * 100;
    if (deviation > 10) {
      alerts.push({
        id: `alert_p99_${Date.now()}`,
        testId: "unknown",
        severity: deviation > 30 ? "critical" : "warning",
        metric: "p99ResponseTime",
        currentValue: current.p99ResponseTime,
        threshold: thresholds.p99ResponseTime,
        deviation,
        timestamp: new Date(),
        resolved: false,
      });
    }
  }

  // Check error rate
  if (current.errorCount > 0) {
    const errorRate = (current.errorCount / current.totalRequests) * 100;
    if (errorRate > thresholds.errorRate) {
      alerts.push({
        id: `alert_error_${Date.now()}`,
        testId: "unknown",
        severity: errorRate > 5 ? "critical" : "warning",
        metric: "errorRate",
        currentValue: errorRate,
        threshold: thresholds.errorRate,
        deviation: errorRate - thresholds.errorRate,
        timestamp: new Date(),
        resolved: false,
      });
    }
  }

  return alerts;
}

export async function generateTestRecommendations(alerts: RegressionAlert[]): Promise<string | (Record<string, unknown> | string)[]> {
  if (alerts.length === 0) return "All performance metrics are within acceptable ranges.";

  const alertSummary = alerts
    .map((a) => `${a.metric}: ${a.currentValue.toFixed(2)} (threshold: ${a.threshold}, deviation: ${a.deviation.toFixed(1)}%)`)
    .join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: "You are a performance optimization expert. Analyze performance regression alerts and provide specific recommendations.",
      },
      {
        role: "user",
        content: `Analyze these performance regression alerts and provide 2-3 specific recommendations to fix them:\n\n${alertSummary}\n\nProvide actionable recommendations in 1-2 sentences each.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return content || "Unable to generate recommendations";
}
