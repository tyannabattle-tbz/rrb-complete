import { useState, useEffect } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePerformanceMetrics } from "@/hooks/useAdvancedFeatures";

interface Bottleneck {
  id: number;
  type: string;
  resource: string;
  severity: "low" | "medium" | "high" | "critical";
  occurrences: number;
  recommendation: string;
}

interface Optimization {
  id: number;
  type: string;
  description: string;
  estimatedImprovement: number;
  applied: boolean;
}

export function PerformanceOptimizationDashboard() {
  const { metrics, loading, error, loadMetrics, getAverageResponseTime, getErrorRate } =
    usePerformanceMetrics();
  const [bottlenecks, setBottlenecks] = useState<Bottleneck[]>([]);
  const [optimizations, setOptimizations] = useState<Optimization[]>([]);
  const [timeRange, setTimeRange] = useState<"1h" | "24h" | "7d">("24h");

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const avgResponseTime = getAverageResponseTime();
  const errorRate = getErrorRate();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Performance Optimization</h2>
        <div className="flex gap-2">
          {["1h", "24h", "7d"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range as "1h" | "24h" | "7d")}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-blue-600" />
            <div>
              <div className="text-sm text-muted-foreground">Avg Response Time</div>
              <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <div className="text-sm text-muted-foreground">Error Rate</div>
              <div className="text-2xl font-bold">{errorRate.toFixed(2)}%</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <div className="text-sm text-muted-foreground">Bottlenecks Found</div>
              <div className="text-2xl font-bold">{bottlenecks.length}</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            <div>
              <div className="text-sm text-muted-foreground">Optimizations Applied</div>
              <div className="text-2xl font-bold">{optimizations.filter((o) => o.applied).length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Status */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-lg">Performance Status</h3>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Response Time</span>
              <span className="text-sm text-muted-foreground">
                {avgResponseTime > 1000 ? "Needs Optimization" : "Good"}
              </span>
            </div>
            <Progress
              value={Math.min((avgResponseTime / 2000) * 100, 100)}
              className="h-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Error Rate</span>
              <span className="text-sm text-muted-foreground">
                {errorRate > 5 ? "High" : "Acceptable"}
              </span>
            </div>
            <Progress value={Math.min(errorRate * 10, 100)} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Bottlenecks */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Detected Bottlenecks</h3>

        {bottlenecks.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">No bottlenecks detected</div>
          </Card>
        ) : (
          <div className="space-y-2">
            {bottlenecks.map((bottleneck) => (
              <Card key={bottleneck.id} className={`p-4 border-2 ${getSeverityColor(bottleneck.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{bottleneck.type}</div>
                    <div className="text-sm text-muted-foreground">{bottleneck.resource}</div>
                    <div className="text-sm mt-2">{bottleneck.recommendation}</div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{bottleneck.occurrences} occurrences</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Optimizations */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Recommended Optimizations</h3>

        {optimizations.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-muted-foreground">No optimizations recommended</div>
          </Card>
        ) : (
          <div className="space-y-2">
            {optimizations.map((optimization) => (
              <Card key={optimization.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{optimization.type}</div>
                    <div className="text-sm text-muted-foreground">{optimization.description}</div>
                    <div className="text-sm mt-2">
                      Estimated Improvement:{" "}
                      <span className="font-semibold text-green-600">
                        +{optimization.estimatedImprovement}%
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={optimization.applied ? "secondary" : "default"}
                    size="sm"
                    disabled={optimization.applied}
                  >
                    {optimization.applied ? "Applied" : "Apply"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
