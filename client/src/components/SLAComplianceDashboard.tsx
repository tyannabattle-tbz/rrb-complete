import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function SLAComplianceDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month">("month");

  const { data: slos } = trpc.infrastructurePlatform.getAllSLOs.useQuery();
  const { data: violations } = trpc.infrastructurePlatform.getAllViolations.useQuery({ limit: 100 });
  const { data: compliance } = trpc.infrastructurePlatform.getSLACompliancePercentage.useQuery();
  const { data: recommendations } = trpc.infrastructurePlatform.generateSLARecommendations.useQuery();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "met":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "at_risk":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "violated":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      met: "default",
      at_risk: "secondary",
      violated: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getPeriodDates = () => {
    const end = new Date();
    const start = new Date();
    switch (selectedPeriod) {
      case "today":
        start.setHours(0, 0, 0, 0);
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
    }
    return { start, end };
  };

  const { data: report } = trpc.infrastructurePlatform.generateSLAReport.useQuery(
    { startDate: getPeriodDates().start, endDate: getPeriodDates().end },
    { enabled: !!slos }
  );

  const resolveViolationMutation = trpc.infrastructurePlatform.resolveViolation.useMutation();

  return (
    <div className="space-y-6">
      {/* Overall Compliance */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle>Overall SLA Compliance</CardTitle>
          <CardDescription>Current compliance percentage across all SLOs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-4xl font-bold">{compliance?.toFixed(2) || 0}%</div>
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{compliance?.toFixed(0) || 0}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Period Selection */}
      <div className="flex gap-2">
        {(["today", "week", "month"] as const).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            onClick={() => setSelectedPeriod(period)}
            className="capitalize"
          >
            {period}
          </Button>
        ))}
      </div>

      {/* SLO Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report?.slos?.map((slo: any) => (
          <Card key={slo.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{slo.name}</CardTitle>
                {getStatusIcon(slo.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium">{slo.target.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Actual</span>
                  <span className="font-medium">{slo.actual.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Violations</span>
                  <span className="font-medium text-red-600">{slo.violations}</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    slo.actual >= slo.target ? "bg-green-500" : slo.actual >= slo.target - 5 ? "bg-yellow-500" : "bg-red-500"
                  }`}
                  style={{ width: `${Math.min(slo.actual, 100)}%` }}
                />
              </div>
              {getStatusBadge(slo.status)}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Violations */}
      <Card>
        <CardHeader>
          <CardTitle>Active Violations</CardTitle>
          <CardDescription>SLO violations that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {violations?.filter((v: any) => !v.resolved).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active violations</div>
            ) : (
              violations
                ?.filter((v: any) => !v.resolved)
                .map((violation: any) => (
                  <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{violation.sloName}</p>
                      <p className="text-xs text-muted-foreground">{violation.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(violation.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={violation.severity === "critical" ? "destructive" : "secondary"}>{violation.severity}</Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolveViolationMutation.mutate({ violationId: violation.id })}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
          <CardDescription>Suggestions to improve SLA compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{recommendations}</p>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Summary */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.overallCompliance.toFixed(2)}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">MTTR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.mttr.toFixed(1)}min</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">MTTD</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.mttd.toFixed(1)}min</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
