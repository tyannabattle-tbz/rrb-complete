import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, TrendingUp, Zap, DollarSign, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function UsageDashboard() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  // Mock data for charts
  const dailyUsageData = [
    { date: "Jan 1", tokens: 45000, cost: 2.25 },
    { date: "Jan 2", tokens: 52000, cost: 2.60 },
    { date: "Jan 3", tokens: 38000, cost: 1.90 },
    { date: "Jan 4", tokens: 61000, cost: 3.05 },
    { date: "Jan 5", tokens: 55000, cost: 2.75 },
    { date: "Jan 6", tokens: 48000, cost: 2.40 },
    { date: "Jan 7", tokens: 67000, cost: 3.35 },
  ];

  const modelUsageData = [
    { name: "GPT-4 Turbo", value: 450000, percentage: 45 },
    { name: "GPT-4", value: 300000, percentage: 30 },
    { name: "GPT-3.5", value: 200000, percentage: 20 },
    { name: "Claude", value: 50000, percentage: 5 },
  ];

  const costBreakdown = [
    { name: "API Calls", value: 65 },
    { name: "Storage", value: 20 },
    { name: "Premium Features", value: 15 },
  ];

  const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"];

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTokens = dailyUsageData.reduce((sum, day) => sum + day.tokens, 0);
    const totalCost = dailyUsageData.reduce((sum, day) => sum + day.cost, 0);
    const avgDaily = Math.round(totalTokens / dailyUsageData.length);
    const maxDaily = Math.max(...dailyUsageData.map((d) => d.tokens));

    return { totalTokens, totalCost, avgDaily, maxDaily };
  }, []);

  const exportData = () => {
    const csv = [
      ["Date", "Tokens", "Cost (USD)"],
      ...dailyUsageData.map((d) => [d.date, d.tokens, d.cost.toFixed(2)]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usage-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Usage Analytics</h1>
        <Button onClick={exportData} variant="outline" size="sm" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {(["7d", "30d", "90d"] as const).map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeRange(range)}
          >
            {range === "7d" ? "Last 7 Days" : range === "30d" ? "Last 30 Days" : "Last 90 Days"}
          </Button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tokens</p>
              <p className="text-3xl font-bold">{(stats.totalTokens / 1000).toFixed(0)}K</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-3xl font-bold">${stats.totalCost.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-3xl font-bold">{(stats.avgDaily / 1000).toFixed(0)}K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Peak Usage</p>
              <p className="text-3xl font-bold">{(stats.maxDaily / 1000).toFixed(0)}K</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Trend */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Daily Token Usage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Cost Trend */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Daily Cost</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cost" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Model Usage Distribution */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Model Usage Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={modelUsageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {modelUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Cost Breakdown */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Cost Breakdown</h2>
          <div className="space-y-3">
            {costBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm">{item.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold w-12 text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Model Comparison Table */}
      <Card className="p-6">
        <h2 className="font-semibold mb-4">Model Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Model</th>
                <th className="text-right py-2 px-2">Tokens Used</th>
                <th className="text-right py-2 px-2">Percentage</th>
                <th className="text-right py-2 px-2">Avg Cost/1K</th>
              </tr>
            </thead>
            <tbody>
              {modelUsageData.map((model) => (
                <tr key={model.name} className="border-b hover:bg-muted/50">
                  <td className="py-2 px-2">{model.name}</td>
                  <td className="text-right py-2 px-2">{(model.value / 1000).toFixed(0)}K</td>
                  <td className="text-right py-2 px-2">
                    <Badge variant="outline">{model.percentage}%</Badge>
                  </td>
                  <td className="text-right py-2 px-2">
                    ${(Math.random() * 0.05 + 0.01).toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
