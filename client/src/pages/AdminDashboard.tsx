import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Activity, Users, Zap, TrendingUp, Download } from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [refreshInterval, setRefreshInterval] = useState(30000);

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== "admin") {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = trpc.admin.admin.admin.getDashboardStats.useQuery(undefined, {
    refetchInterval: refreshInterval,
  });

  // Fetch system health
  const { data: health, isLoading: healthLoading } = trpc.admin.admin.admin.getSystemHealth.useQuery(undefined, {
    refetchInterval: refreshInterval,
  });

  // Fetch alerts
  const { data: alerts, refetch: refetchAlerts } = trpc.admin.admin.admin.getAlerts.useQuery({ status: "active" });

  // Mutations
  const acknowledgeAlertMutation = trpc.admin.admin.admin.acknowledgeAlert.useMutation({
    onSuccess: () => refetchAlerts(),
  });

  const resolveAlertMutation = trpc.admin.admin.admin.resolveAlert.useMutation({
    onSuccess: () => refetchAlerts(),
  });

  const { mutateAsync: exportReport, isPending: isExporting } = trpc.admin.admin.admin.exportReport.useMutation();

  const handleExportReport = async (format: "pdf" | "csv") => {
    const result = await exportReport({ format });
    // In a real app, this would trigger a download
    console.log("Report exported:", result.filename);
  };

  if (!isAuthenticated || !user || user.role !== "admin") {
    return null;
  }

  if (statsLoading || healthLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getHealthBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">System monitoring and management</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportReport("csv")}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExportReport("pdf")}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getHealthBadge(health?.status || "unknown")}>
              {health?.status || "Unknown"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CPU Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.cpu.toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(health?.cpu || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Memory Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.memory.toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-purple-600 h-2 rounded-full"
                style={{ width: `${Math.min(health?.memory || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health?.storage.toFixed(1)}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${Math.min(health?.storage || 0, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeUsers || 0}</div>
            <p className="text-sm text-gray-600 mt-2">
              Total Sessions: {stats?.totalSessions || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              API Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalRequests || 0}</div>
            <p className="text-sm text-gray-600 mt-2">
              Tokens Used: {stats?.totalTokens || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.averageResponseTime.toFixed(0)}ms</div>
            <p className="text-sm text-gray-600 mt-2">
              Avg Response Time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stats?.errorRate! > 5 ? "text-red-600" : "text-green-600"}`}>
              {stats?.errorRate.toFixed(2)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">
              System Health: {stats?.systemHealth}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts && alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Active Alerts ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 bg-white rounded border border-red-200">
                  <div className="flex-1">
                    <div className="font-semibold text-red-900">{alert.title}</div>
                    {alert.description && (
                      <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {alert.severity}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => acknowledgeAlertMutation.mutate({ alertId: alert.id })}
                      disabled={acknowledgeAlertMutation.isPending}
                    >
                      Acknowledge
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resolveAlertMutation.mutate({ alertId: alert.id })}
                      disabled={resolveAlertMutation.isPending}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Auto-refresh interval:</label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value={10000}>10 seconds</option>
              <option value={30000}>30 seconds</option>
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
