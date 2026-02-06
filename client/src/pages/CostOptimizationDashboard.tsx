import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, AlertCircle, Zap, DollarSign, TrendingUp } from "lucide-react";

export default function CostOptimizationDashboard() {
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Fetch cost data
  const { data: costAnalysis } = trpc.analytics.analytics.costOptimization.getCostAnalysis.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const { data: costByTemplate } = trpc.analytics.analytics.costOptimization.getCostByTemplate.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const { data: recommendations } = trpc.analytics.analytics.costOptimization.getOptimizationRecommendations.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const { data: efficiency } = trpc.analytics.analytics.costOptimization.getResourceEfficiency.useQuery({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  const { data: forecast } = trpc.analytics.analytics.costOptimization.getCostForecast.useQuery({
    days: 7,
  });

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Cost Optimization Dashboard</h1>
          <p className="text-lg text-slate-600">Analyze spending patterns and optimize resource allocation</p>
        </div>

        {/* Date Range */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Cost</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${costAnalysis?.totalCost.toFixed(2) || "0.00"}
                  </p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Average Cost</p>
                  <p className="text-3xl font-bold text-slate-900">
                    ${costAnalysis?.averageCost.toFixed(2) || "0.00"}
                  </p>
                </div>
                <TrendingDown className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold text-slate-900">{costAnalysis?.totalJobs || 0}</p>
                </div>
                <Zap className="w-12 h-12 text-yellow-500 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Efficiency Score</p>
                  <p className="text-3xl font-bold text-slate-900">{efficiency?.efficiency.toFixed(0) || "0"}%</p>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resource Efficiency */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Resource Efficiency</CardTitle>
            <CardDescription>Current resource utilization metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-slate-600 mb-2">CPU Usage</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(efficiency?.avgCpuUsage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-lg font-semibold">{efficiency?.avgCpuUsage.toFixed(1) || "0"}%</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Memory Usage</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min(efficiency?.avgMemoryUsage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-lg font-semibold">{efficiency?.avgMemoryUsage.toFixed(1) || "0"}%</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-2">Storage Usage</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(efficiency?.avgStorageUsage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-lg font-semibold">{efficiency?.avgStorageUsage.toFixed(1) || "0"}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost by Template */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>Cost Breakdown by Template</CardTitle>
            <CardDescription>Total and average costs per template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {costByTemplate?.map((item: any) => (
                <div key={item.template} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{item.template}</p>
                    <p className="text-sm text-slate-600">{item.count} jobs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">${item.totalCost.toFixed(2)}</p>
                    <p className="text-sm text-slate-600">Avg: ${item.averageCost.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Optimization Recommendations */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Optimization Recommendations
            </CardTitle>
            <CardDescription>Actionable insights to reduce costs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec: any) => (
                  <div key={rec.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                      </div>
                      <Badge className={getImpactColor(rec.impact)}>
                        {rec.impact}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <span className="text-sm text-slate-600">Potential Savings:</span>
                      <span className="font-semibold text-green-600">
                        ${rec.savings.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-center py-4">No optimization opportunities identified</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 7-Day Forecast */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>7-Day Cost Forecast</CardTitle>
            <CardDescription>Projected daily costs based on historical data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {forecast?.map((day: any) => (
                <div key={day.date} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{new Date(day.date).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-600">Confidence: {day.confidence.toFixed(0)}%</p>
                  </div>
                  <p className="font-semibold text-slate-900">${day.forecastedCost.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
