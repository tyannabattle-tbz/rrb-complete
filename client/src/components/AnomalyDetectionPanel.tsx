import React, { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, CheckCircle, Clock, Zap } from "lucide-react";

export function AnomalyDetectionPanel() {
  const [selectedAnomaly, setSelectedAnomaly] = useState<number | null>(null);
  const [showResolved, setShowResolved] = useState(false);

  // Fetch anomaly data
  const { data: summary } = trpc.infrastructure.anomalyDetection.getAnomalySummary.useQuery();
  const { data: anomalies } = trpc.infrastructure.anomalyDetection.getAnomalies.useQuery({
    limit: 20,
    resolved: showResolved ? true : false,
  });
  const { data: insights } = trpc.infrastructure.anomalyDetection.getAnomalyInsights.useQuery(
    { anomalyId: selectedAnomaly || 0 },
    { enabled: !!selectedAnomaly }
  );

  const resolveMutation = trpc.infrastructure.anomalyDetection.resolveAnomaly.useMutation();

  const handleResolve = async (anomalyId: number) => {
    try {
      await resolveMutation.mutateAsync({ anomalyId, notes: "Resolved by user" });
      alert("Anomaly resolved!");
    } catch (error) {
      alert("Failed to resolve anomaly");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case "performance_degradation":
        return <TrendingUp className="w-4 h-4" />;
      case "cost_spike":
        return <Zap className="w-4 h-4" />;
      case "high_error_rate":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{summary?.totalAnomalies || 0}</div>
            <p className="text-sm text-gray-500">Total Anomalies</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-red-600">{summary?.criticalCount || 0}</div>
            <p className="text-sm text-gray-500">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-orange-600">{summary?.highCount || 0}</div>
            <p className="text-sm text-gray-500">High Priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-600">{summary?.unresolvedCount || 0}</div>
            <p className="text-sm text-gray-500">Unresolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Detected Anomalies</CardTitle>
              <CardDescription>AI-powered anomaly detection and insights</CardDescription>
            </div>
            <Button
              variant={showResolved ? "default" : "outline"}
              onClick={() => setShowResolved(!showResolved)}
              size="sm"
            >
              {showResolved ? "Show Unresolved" : "Show Resolved"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {anomalies && anomalies.length > 0 ? (
              anomalies.map((anomaly: any, idx) => (
                <div
                  key={anomaly.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => setSelectedAnomaly(anomaly.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getAnomalyIcon(anomaly.anomalyType)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{anomaly.metricName}</h3>
                          <Badge className={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                          {anomaly.isResolved && (
                            <Badge variant="outline" className="bg-green-50">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{anomaly.description}</p>
                        <p className="text-xs text-gray-500">
                          Expected: {anomaly.expectedValue} | Actual: {anomaly.actualValue} | Deviation:{" "}
                          {parseFloat(anomaly.deviationPercentage).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    {!anomaly.isResolved && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(anomaly.id);
                        }}
                        size="sm"
                        variant="outline"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No anomalies detected</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      {selectedAnomaly && insights && insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight: any, idx) => (
              <div key={insight.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">{insight.insightType}</Badge>
                  <span className="text-sm text-gray-500">
                    Confidence: {parseFloat(insight.confidence).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-3">{insight.content}</p>
                {insight.actionItems && insight.actionItems.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2">Recommended Actions:</p>
                    <ul className="text-xs space-y-1">
                      {insight.actionItems.map((item: string, idx: number) => (
                        <li key={`item-${idx}`} className="flex items-start gap-2">
                          <span className="text-blue-600 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Anomaly Types Distribution */}
      {summary?.anomalyTypes && (
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(summary.anomalyTypes).map(([type, count]: [string, any]) => (
                <div key={type} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{type.replace(/_/g, " ")}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${(count / (summary.totalAnomalies || 1)) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
