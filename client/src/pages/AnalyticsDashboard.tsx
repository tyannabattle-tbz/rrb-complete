import React, { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export function AnalyticsDashboard() {
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState(new Date());

  // Fetch analytics data
  const { data: summary } = trpc.analytics.analytics.getAnalyticsSummary.useQuery();
  const { data: trends } = trpc.analytics.analytics.getPerformanceTrends.useQuery({
    startDate,
    endDate,
  });
  const { data: toolStats } = trpc.analytics.analytics.getToolUsageStats.useQuery({ limit: 10 });

  // Transform data for charts
  const trendData = useMemo(() => {
    return (trends || []).map((t: any) => ({
      date: new Date(t.date).toLocaleDateString(),
      sessions: t.sessionCount || 0,
      avgDuration: Math.round((t.averageSessionDuration || 0) / 1000),
      successRate: parseFloat(t.averageSuccessRate?.toString() || "0"),
    }));
  }, [trends]);

  const toolData = useMemo(() => {
    return (toolStats || []).map((t: any) => ({
      name: t.toolName,
      executions: t.executionCount || 0,
      success: t.successCount || 0,
      failure: t.failureCount || 0,
    }));
  }, [toolStats]);

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500">Monitor your agent performance and usage metrics</p>
        </div>
        <Button onClick={() => {
          // Export functionality
          const data = JSON.stringify({ summary, trends, toolStats }, null, 2);
          const blob = new Blob([data], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `analytics-${new Date().toISOString()}.json`;
          a.click();
        }}>
          Export Data
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium">Start Date</label>
            <Input
              type="date"
              value={startDate.toISOString().split("T")[0]}
              onChange={(e) => setStartDate(new Date(e.target.value))}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">End Date</label>
            <Input
              type="date"
              value={endDate.toISOString().split("T")[0]}
              onChange={(e) => setEndDate(new Date(e.target.value))}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalSessions || 0}</div>
            <p className="text-xs text-gray-500">sessions in period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((summary?.avgDuration || 0) / 1000)}s</div>
            <p className="text-xs text-gray-500">per session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(summary?.avgSuccessRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-gray-500">average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tool Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalToolExecutions || 0}</div>
            <p className="text-xs text-gray-500">total</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
          <CardDescription>Session count and success rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="sessions" stroke="#3b82f6" name="Sessions" />
              <Line yAxisId="right" type="monotone" dataKey="successRate" stroke="#10b981" name="Success Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tool Usage Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tool Execution Count</CardTitle>
            <CardDescription>Total executions per tool</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={toolData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="executions" fill="#3b82f6" name="Total" />
                <Bar dataKey="success" fill="#10b981" name="Success" />
                <Bar dataKey="failure" fill="#ef4444" name="Failure" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate Distribution</CardTitle>
            <CardDescription>Successful vs failed executions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Successful", value: summary?.successfulExecutions || 0 },
                    { name: "Failed", value: (summary?.totalToolExecutions || 0) - (summary?.successfulExecutions || 0) },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Average Session Duration */}
      <Card>
        <CardHeader>
          <CardTitle>Session Duration Trends</CardTitle>
          <CardDescription>Average duration over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgDuration" fill="#f59e0b" name="Avg Duration (seconds)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
