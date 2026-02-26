import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Activity,
  Calendar,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AnalyticsData {
  sessionId: number;
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  toolUsage: Record<string, number>;
  executionTimeline: Array<{
    timestamp: Date;
    duration: number;
    status: "success" | "failed";
  }>;
  toolPerformance: Array<{
    name: string;
    avgTime: number;
    executions: number;
    successRate: number;
  }>;
  ecosystemMetrics?: {
    rrb: { commands: number; successRate: number };
    hybridcast: { commands: number; successRate: number };
    canryn: { commands: number; successRate: number };
    sweetMiracles: { commands: number; successRate: number };
  };
  systemHealth?: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkBandwidth: number;
  };
}

interface AnalyticsDashboardProps {
  sessionId: number;
  data?: AnalyticsData;
}

export default function AnalyticsDashboard({
  sessionId,
  data,
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d" | "30d">("24h");
  const [selectedMetric, setSelectedMetric] = useState<"execution" | "tools">(
    "execution"
  );

  // Mock analytics data - replace with real data from API
  const mockData: AnalyticsData = data || {
    sessionId,
    totalExecutions: 142,
    successRate: 94.4,
    averageExecutionTime: 2.34,
    toolUsage: {
      "Web Search": 45,
      "File Operations": 38,
      "Database Query": 32,
      "API Call": 27,
    },
    ecosystemMetrics: {
      rrb: { commands: 1234, successRate: 98.5 },
      hybridcast: { commands: 856, successRate: 99.2 },
      canryn: { commands: 567, successRate: 97.8 },
      sweetMiracles: { commands: 432, successRate: 99.5 },
    },
    systemHealth: {
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 73,
      networkBandwidth: 38,
    },
    executionTimeline: [
      { timestamp: new Date(Date.now() - 3600000), duration: 1.2, status: "success" },
      { timestamp: new Date(Date.now() - 3000000), duration: 2.8, status: "success" },
      { timestamp: new Date(Date.now() - 2400000), duration: 1.5, status: "failed" },
      { timestamp: new Date(Date.now() - 1800000), duration: 3.1, status: "success" },
      { timestamp: new Date(Date.now() - 1200000), duration: 2.0, status: "success" },
      { timestamp: new Date(Date.now() - 600000), duration: 2.5, status: "success" },
    ],
    toolPerformance: [
      { name: "Web Search", avgTime: 1.8, executions: 45, successRate: 96 },
      { name: "File Operations", avgTime: 0.9, executions: 38, successRate: 92 },
      { name: "Database Query", avgTime: 2.3, executions: 32, successRate: 94 },
      { name: "API Call", avgTime: 1.5, executions: 27, successRate: 93 },
    ],
  };

  // Process data for charts
  const executionChartData = useMemo(() => {
    return mockData.executionTimeline.map((item, idx) => ({
      name: `Exec ${idx + 1}`,
      duration: item.duration,
      status: item.status,
    }));
  }, [mockData.executionTimeline]);

  const toolUsageData = useMemo(() => {
    return Object.entries(mockData.toolUsage).map(([name, count]) => ({
      name,
      value: count,
    }));
  }, [mockData.toolUsage]);

  const toolPerformanceData = useMemo(() => {
    return mockData.toolPerformance.map((tool) => ({
      name: tool.name,
      avgTime: parseFloat(tool.avgTime.toFixed(2)),
      executions: tool.executions,
    }));
  }, [mockData.toolPerformance]);

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
  ];

  const failedExecutions = mockData.executionTimeline.filter(
    (e) => e.status === "failed"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Session {sessionId} Performance Metrics
          </p>
        </div>

        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Executions</p>
              <p className="text-2xl font-bold">{mockData.totalExecutions}</p>
            </div>
            <Activity size={24} className="text-blue-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold">{mockData.successRate}%</p>
            </div>
            <CheckCircle size={24} className="text-green-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Execution Time</p>
              <p className="text-2xl font-bold">{mockData.averageExecutionTime}s</p>
            </div>
            <Clock size={24} className="text-orange-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold">{failedExecutions}</p>
            </div>
            <AlertCircle size={24} className="text-red-500 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Execution Timeline */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Execution Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Tool Usage Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap size={20} />
            Tool Usage Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={toolUsageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {toolUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Tool Performance Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tool Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={toolPerformanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" label={{ value: "Avg Time (s)", angle: -90, position: "insideLeft" }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: "Executions", angle: 90, position: "insideRight" }}
            />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="avgTime" fill="#3b82f6" name="Avg Time (s)" />
            <Bar yAxisId="right" dataKey="executions" fill="#10b981" name="Executions" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Ecosystem Metrics */}
      {mockData.ecosystemMetrics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Ecosystem Performance</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(mockData.ecosystemMetrics).map(([ecosystem, metrics]) => (
              <div key={ecosystem} className="p-3 bg-muted/30 rounded-lg">
                <p className="font-medium capitalize text-sm">{ecosystem}</p>
                <p className="text-2xl font-bold mt-2">{metrics.commands}</p>
                <p className="text-xs text-muted-foreground">commands</p>
                <Badge className="mt-2" variant={metrics.successRate >= 98 ? "default" : "secondary"}>
                  {metrics.successRate}% success
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* System Health */}
      {mockData.systemHealth && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            {Object.entries(mockData.systemHealth).map(([metric, value]) => (
              <div key={metric}>
                <div className="flex justify-between mb-1">
                  <p className="text-sm capitalize">{metric.replace(/([A-Z])/g, ' $1').trim()}</p>
                  <p className="text-sm font-semibold">{value}%</p>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tool Performance Details */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tool Performance Details</h3>
        <div className="space-y-3">
          {mockData.toolPerformance.map((tool, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{tool.name}</p>
                <p className="text-xs text-muted-foreground">
                  {tool.executions} executions
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold">{tool.avgTime}s</p>
                  <p className="text-xs text-muted-foreground">avg time</p>
                </div>

                <Badge
                  variant={tool.successRate >= 95 ? "default" : "secondary"}
                  className="whitespace-nowrap"
                >
                  {tool.successRate}% success
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Export Options */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline">Export as CSV</Button>
        <Button variant="outline">Export as PDF</Button>
        <Button>Share Report</Button>
      </div>
    </div>
  );
}
