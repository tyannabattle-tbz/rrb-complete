import { invokeLLM } from "../_core/llm";

export interface DeploymentEnvironment {
  id: string;
  name: "blue" | "green";
  version: string;
  status: "active" | "inactive" | "deploying" | "rollback";
  createdAt: Date;
  deployedAt?: Date;
  healthChecksPassed: number;
  totalHealthChecks: number;
  errorRate: number;
  avgResponseTime: number;
  requestsPerSecond: number;
}

export interface DeploymentSwitch {
  id: string;
  fromEnvironment: "blue" | "green";
  toEnvironment: "blue" | "green";
  timestamp: Date;
  reason: string;
  success: boolean;
  rollbackReason?: string;
}

export interface HealthCheckResult {
  endpoint: string;
  status: "healthy" | "unhealthy" | "degraded";
  responseTime: number;
  errorMessage?: string;
  timestamp: Date;
}

// Simulated deployment environments
let blueEnv: DeploymentEnvironment = {
  id: "blue-1",
  name: "blue",
  version: "1.0.0",
  status: "active",
  createdAt: new Date(),
  deployedAt: new Date(),
  healthChecksPassed: 98,
  totalHealthChecks: 100,
  errorRate: 0.2,
  avgResponseTime: 1200,
  requestsPerSecond: 5000,
};

let greenEnv: DeploymentEnvironment = {
  id: "green-1",
  name: "green",
  version: "1.1.0",
  status: "inactive",
  createdAt: new Date(),
  healthChecksPassed: 0,
  totalHealthChecks: 0,
  errorRate: 0,
  avgResponseTime: 0,
  requestsPerSecond: 0,
};

let deploymentHistory: DeploymentSwitch[] = [];

export async function deployToGreenEnvironment(version: string): Promise<DeploymentEnvironment> {
  greenEnv = {
    ...greenEnv,
    version,
    status: "deploying",
    createdAt: new Date(),
  };

  // Simulate deployment process
  await new Promise((resolve) => setTimeout(resolve, 2000));

  greenEnv.status = "inactive";
  greenEnv.deployedAt = new Date();

  return greenEnv;
}

export async function runHealthChecks(environment: "blue" | "green"): Promise<HealthCheckResult[]> {
  const env = environment === "blue" ? blueEnv : greenEnv;
  const endpoints = [
    "/api/health",
    "/api/trpc/auth.me",
    "/api/trpc/agent.getSessions",
    "/api/trpc/admin.getSystemHealth",
    "/api/trpc/performanceTesting.getDashboardSummary",
  ];

  const results: HealthCheckResult[] = [];

  for (const endpoint of endpoints) {
    const responseTime = Math.random() * 2000;
    const isHealthy = Math.random() > 0.05; // 95% success rate

    results.push({
      endpoint,
      status: isHealthy ? "healthy" : "unhealthy",
      responseTime,
      errorMessage: isHealthy ? undefined : "Connection timeout",
      timestamp: new Date(),
    });
  }

  // Update environment metrics
  const healthyChecks = results.filter((r) => r.status === "healthy").length;
  if (environment === "blue") {
    blueEnv.healthChecksPassed = healthyChecks;
    blueEnv.totalHealthChecks = results.length;
    blueEnv.avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  } else {
    greenEnv.healthChecksPassed = healthyChecks;
    greenEnv.totalHealthChecks = results.length;
    greenEnv.avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  }

  return results;
}

export async function switchTraffic(
  fromEnv: "blue" | "green",
  toEnv: "blue" | "green"
): Promise<DeploymentSwitch> {
  const switchRecord: DeploymentSwitch = {
    id: `switch-${Date.now()}`,
    fromEnvironment: fromEnv,
    toEnvironment: toEnv,
    timestamp: new Date(),
    reason: `Switching traffic from ${fromEnv} to ${toEnv}`,
    success: true,
  };

  // Update environment statuses
  if (fromEnv === "blue") {
    blueEnv.status = "inactive";
  } else {
    greenEnv.status = "inactive";
  }

  if (toEnv === "blue") {
    blueEnv.status = "active";
  } else {
    greenEnv.status = "active";
  }

  deploymentHistory.push(switchRecord);
  return switchRecord;
}

export async function rollbackDeployment(reason: string): Promise<DeploymentSwitch> {
  const activeEnv = blueEnv.status === "active" ? "blue" : "green";
  const inactiveEnv = activeEnv === "blue" ? "green" : "blue";

  const rollbackRecord: DeploymentSwitch = {
    id: `rollback-${Date.now()}`,
    fromEnvironment: activeEnv as "blue" | "green",
    toEnvironment: inactiveEnv as "blue" | "green",
    timestamp: new Date(),
    reason: `Automatic rollback: ${reason}`,
    success: true,
    rollbackReason: reason,
  };

  // Perform rollback
  await switchTraffic(activeEnv as "blue" | "green", inactiveEnv as "blue" | "green");

  deploymentHistory.push(rollbackRecord);
  return rollbackRecord;
}

export async function getDeploymentStatus(): Promise<{
  activeEnvironment: DeploymentEnvironment;
  inactiveEnvironment: DeploymentEnvironment;
  lastSwitch?: DeploymentSwitch;
  switchHistory: DeploymentSwitch[];
}> {
  const activeEnv = blueEnv.status === "active" ? blueEnv : greenEnv;
  const inactiveEnv = blueEnv.status === "active" ? greenEnv : blueEnv;

  return {
    activeEnvironment: activeEnv,
    inactiveEnvironment: inactiveEnv,
    lastSwitch: deploymentHistory[deploymentHistory.length - 1],
    switchHistory: deploymentHistory.slice(-10),
  };
}

export async function generateDeploymentRecommendations(
  blueMetrics: DeploymentEnvironment,
  greenMetrics: DeploymentEnvironment
): Promise<string> {
  const comparison = {
    blueErrorRate: blueMetrics.errorRate,
    greenErrorRate: greenMetrics.errorRate,
    blueResponseTime: blueMetrics.avgResponseTime,
    greenResponseTime: greenMetrics.avgResponseTime,
    blueHealthScore: (blueMetrics.healthChecksPassed / blueMetrics.totalHealthChecks) * 100,
    greenHealthScore: (greenMetrics.healthChecksPassed / greenMetrics.totalHealthChecks) * 100,
  };

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are a deployment strategy expert. Analyze deployment metrics and provide recommendations for blue-green deployment decisions.",
      },
      {
        role: "user",
        content: `Analyze these deployment metrics and provide a recommendation on whether to switch traffic from blue to green:\n\n${JSON.stringify(comparison, null, 2)}\n\nProvide a concise recommendation in 1-2 sentences.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "Unable to generate recommendations";
}

export async function monitorDeploymentHealth(
  environment: "blue" | "green",
  interval: number = 30000
): Promise<void> {
  // Run health checks at specified interval
  setInterval(async () => {
    const results = await runHealthChecks(environment);
    const healthyCount = results.filter((r) => r.status === "healthy").length;
    const healthPercentage = (healthyCount / results.length) * 100;

    // Trigger rollback if health drops below 80%
    if (healthPercentage < 80 && environment !== (blueEnv.status === "active" ? "blue" : "green")) {
      console.log(`[BlueGreen] Health check failed for ${environment}: ${healthPercentage.toFixed(1)}%`);
      await rollbackDeployment(`Health check failed: ${healthPercentage.toFixed(1)}% healthy`);
    }
  }, interval);
}
