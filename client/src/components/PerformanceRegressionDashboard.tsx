import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Play, Pause } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TestJourney {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  runInterval: number;
  lastRun?: Date;
  status: "passing" | "warning" | "critical";
  passRate: number;
  avgResponseTime: number;
}

interface Alert {
  id: string;
  severity: "warning" | "critical";
  metric: string;
  currentValue: number;
  threshold: number;
  deviation: number;
}

export function PerformanceRegressionDashboard() {
  const [tests, setTests] = useState<TestJourney[]>([
    {
      id: "auth_flow",
      name: "Authentication Flow",
      description: "OAuth login and session creation",
      enabled: true,
      runInterval: 5,
      status: "passing",
      passRate: 99.8,
      avgResponseTime: 1200,
    },
    {
      id: "agent_session",
      name: "Agent Session Creation",
      description: "Create and interact with agent session",
      enabled: true,
      runInterval: 5,
      status: "passing",
      passRate: 99.5,
      avgResponseTime: 1800,
    },
    {
      id: "dashboard_load",
      name: "Dashboard Loading",
      description: "Admin dashboard performance",
      enabled: true,
      runInterval: 10,
      status: "passing",
      passRate: 99.9,
      avgResponseTime: 950,
    },
    {
      id: "search_filter",
      name: "Search and Filtering",
      description: "Session search and filtering",
      enabled: true,
      runInterval: 10,
      status: "warning",
      passRate: 98.5,
      avgResponseTime: 2100,
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "alert_1",
      severity: "warning",
      metric: "p95ResponseTime",
      currentValue: 2100,
      threshold: 2000,
      deviation: 5.2,
    },
  ]);

  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "passing":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passing":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const handleRunTest = (testId: string) => {
    console.log(`Running test: ${testId}`);
    // In production, call the tRPC endpoint
  };

  const handleToggleTest = (testId: string) => {
    setTests(
      tests.map((t) => (t.id === testId ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const passingTests = tests.filter((t) => t.status === "passing").length;
  const warningTests = tests.filter((t) => t.status === "warning").length;
  const criticalTests = tests.filter((t) => t.status === "critical").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Regression Testing</h2>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm text-muted-foreground">Passing Tests</div>
              <div className="text-2xl font-bold">{passingTests}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <div className="text-sm text-muted-foreground">Warnings</div>
              <div className="text-2xl font-bold">{warningTests}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-sm text-muted-foreground">Critical</div>
              <div className="text-2xl font-bold">{criticalTests}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-muted-foreground">Avg Pass Rate</div>
              <div className="text-2xl font-bold">
                {(tests.reduce((sum, t) => sum + t.passRate, 0) / tests.length).toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card className="p-6 space-y-4 border-red-200 bg-red-50">
          <h3 className="font-semibold text-lg text-red-900">Active Alerts</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between bg-white p-3 rounded border border-red-200">
                <div>
                  <div className="font-medium text-red-900">{alert.metric}</div>
                  <div className="text-sm text-red-700">
                    Current: {alert.currentValue.toFixed(0)}ms | Threshold: {alert.threshold}ms | Deviation: {alert.deviation.toFixed(1)}%
                  </div>
                </div>
                <Badge variant="destructive">{alert.severity}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Test Journeys */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Synthetic Test Journeys</h3>

        <div className="grid gap-3">
          {tests.map((test) => (
            <Card
              key={test.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedTest === test.id ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => setSelectedTest(test.id)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(test.status)}
                    <div>
                      <div className="font-medium">{test.name}</div>
                      <div className="text-sm text-muted-foreground">{test.description}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRunTest(test.id);
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleTest(test.id);
                      }}
                    >
                      {test.enabled ? (
                        <>
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Pass Rate</div>
                    <div className="flex items-center gap-2">
                      <Progress value={test.passRate} className="flex-1" />
                      <span className="text-sm font-medium">{test.passRate.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Avg Response Time</div>
                    <div className="text-sm font-medium">{test.avgResponseTime}ms</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Runs every {test.runInterval} minutes</span>
                  <span>Status: {test.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Test Details */}
      {selectedTest && (
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Test Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Last Run</div>
              <div className="font-medium">2 minutes ago</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Runs</div>
              <div className="font-medium">1,234</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Success Rate (24h)</div>
              <div className="font-medium">99.8%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Duration</div>
              <div className="font-medium">1.2s</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
