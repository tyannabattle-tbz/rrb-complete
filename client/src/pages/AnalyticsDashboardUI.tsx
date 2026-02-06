import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, DollarSign, Zap, Activity } from "lucide-react";
import { useState } from "react";

export default function AnalyticsDashboardUI() {
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("month");

  const { data: overview, isLoading: overviewLoading } = trpc.admin.admin.analyticsDashboard.getDashboardOverview.useQuery({ timeRange: timeRange as "day" | "week" | "month" | "year" });
  const { data: tokenChart } = trpc.admin.admin.analyticsDashboard.getTokenUsageChart.useQuery({ timeRange: (timeRange === "day" ? "week" : timeRange) as "week" | "month" });
  const { data: costChart } = trpc.admin.admin.analyticsDashboard.getCostTrendChart.useQuery({ timeRange: (timeRange === "day" ? "week" : timeRange) as "week" | "month" });
  const { data: modelUsage } = trpc.admin.admin.analyticsDashboard.getModelUsageBreakdown.useQuery();
  const { data: sessionMetrics } = trpc.admin.admin.analyticsDashboard.getSessionMetrics.useQuery({ limit: 10 });
  const { data: topFeatures } = trpc.admin.admin.analyticsDashboard.getTopFeaturesUsed.useQuery();
  const { data: comparison } = trpc.admin.admin.analyticsDashboard.getUsageComparison.useQuery();
  const { data: recommendations } = trpc.admin.admin.analyticsDashboard.getRecommendations.useQuery();

  const exportMutation = trpc.admin.admin.analyticsDashboard.exportAnalyticsReport.useMutation();

  const handleExport = async (format: "csv" | "pdf" | "json") => {
    try {
      await exportMutation.mutateAsync({ format, timeRange: timeRange as "week" | "month" | "year" });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Usage Analytics</h1>
        <p className="text-muted-foreground">Track your token usage, costs, and performance metrics</p>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(["day", "week", "month", "year"] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Cards */}
      {overviewLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview?.totalSessions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active sessions: {overview?.activeSessions}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overview?.totalMessages || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Avg. per session: {overview?.averageSessionLength}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Total Tokens
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tokenChart?.totalTokens.toLocaleString() || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Avg. daily: {tokenChart?.averageDaily.toLocaleString()}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${costChart?.totalCost || "0.00"}</div>
                <p className="text-xs text-muted-foreground mt-1">Avg. daily: ${costChart?.averageDaily}</p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Comparison */}
          {comparison && (
            <Card>
              <CardHeader>
                <CardTitle>Usage Comparison</CardTitle>
                <CardDescription>Current period vs. previous period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Sessions", current: comparison.current.sessions, change: comparison.change.sessions },
                    { label: "Messages", current: comparison.current.messages, change: comparison.change.messages },
                    { label: "Tokens", current: comparison.current.tokens, change: comparison.change.tokens },
                    { label: "Cost", current: `$${comparison.current.cost}`, change: comparison.change.cost },
                  ].map((item) => (
                    <div key={item.label} className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-2xl font-bold mt-1">{item.current}</p>
                      <p className={`text-xs mt-1 flex items-center gap-1 ${item.change.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                        <TrendingUp className="w-3 h-3" />
                        {item.change.percentage}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Model Usage Breakdown */}
          {modelUsage && (
            <Card>
              <CardHeader>
                <CardTitle>Model Usage Breakdown</CardTitle>
                <CardDescription>Token usage by model</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {modelUsage.map((model: any) => (
                    <div key={model.model} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{model.model}</span>
                        <span className="text-sm text-muted-foreground">${model.cost}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${model.percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{model.usage} tokens</span>
                        <span>{model.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Features */}
          {topFeatures && (
            <Card>
              <CardHeader>
                <CardTitle>Top Features Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topFeatures.map((feature: any) => (
                    <div key={feature.feature} className="flex justify-between items-center">
                      <span>{feature.feature}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${feature.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">{feature.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {recommendations && (
            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
                <CardDescription>Ways to optimize your usage and reduce costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec: any) => (
                    <div key={rec.id} className="p-4 bg-muted rounded-lg border border-border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${rec.priority === "high" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Potential savings: {rec.savings}</span>
                        <span className="text-xs text-muted-foreground">Impact: {rec.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Export Report</CardTitle>
              <CardDescription>Download your analytics data in various formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {(["csv", "pdf", "json"] as const).map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    onClick={() => handleExport(format)}
                    disabled={exportMutation.isPending}
                  >
                    {exportMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Export as {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
