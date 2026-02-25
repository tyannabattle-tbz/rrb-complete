/**
 * Admin Decision Dashboard
 * 
 * Comprehensive admin interface for managing QUMUS decisions,
 * monitoring propagation status, and viewing compliance metrics.
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  Zap,
  Shield,
  BarChart3,
  XCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Decision {
  decisionId: string;
  policyId: string;
  userId: number;
  description: string;
  status: "pending" | "completed" | "failed" | "rolled_back";
  severity: "low" | "medium" | "high" | "critical";
  autonomyLevel: number;
  timestamp: Date;
  affectedPlatforms: string[];
}

interface PropagationStatus {
  decisionId: string;
  status: string;
  totalActions: number;
  completedActions: number;
  failedActions: number;
  successRate: number;
}

interface PolicyMetric {
  policyId: string;
  totalDecisions: number;
  successRate: number;
  avgAutonomy: number;
  lastTriggered: Date;
}

export default function AdminDecisionDashboard() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [propagationStatuses, setPropagationStatuses] = useState<Map<string, PropagationStatus>>(
    new Map()
  );
  const [policyMetrics, setPolicyMetrics] = useState<PolicyMetric[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [activeTab, setActiveTab] = useState("queue");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demo
  useEffect(() => {
    const mockDecisions: Decision[] = [
      {
        decisionId: "dec-001",
        policyId: "emergency_broadcast",
        userId: 1,
        description: "Emergency alert broadcast to all channels",
        status: "completed",
        severity: "critical",
        autonomyLevel: 95,
        timestamp: new Date(Date.now() - 5 * 60000),
        affectedPlatforms: ["emergency_alerts", "radio_stations", "content_manager"],
      },
      {
        decisionId: "dec-002",
        policyId: "content_scheduling",
        userId: 1,
        description: "Schedule morning drive show",
        status: "completed",
        severity: "medium",
        autonomyLevel: 85,
        timestamp: new Date(Date.now() - 15 * 60000),
        affectedPlatforms: ["content_manager", "analytics_reporting"],
      },
      {
        decisionId: "dec-003",
        policyId: "listener_engagement",
        userId: 1,
        description: "Optimize listener engagement metrics",
        status: "pending",
        severity: "low",
        autonomyLevel: 80,
        timestamp: new Date(Date.now() - 2 * 60000),
        affectedPlatforms: ["analytics_reporting"],
      },
      {
        decisionId: "dec-004",
        policyId: "compliance_enforcement",
        userId: 1,
        description: "Enforce compliance policy",
        status: "completed",
        severity: "high",
        autonomyLevel: 95,
        timestamp: new Date(Date.now() - 30 * 60000),
        affectedPlatforms: ["emergency_alerts", "content_manager"],
      },
    ];

    const mockPropagationStatuses = new Map<string, PropagationStatus>([
      [
        "dec-001",
        {
          decisionId: "dec-001",
          status: "completed",
          totalActions: 3,
          completedActions: 3,
          failedActions: 0,
          successRate: 100,
        },
      ],
      [
        "dec-002",
        {
          decisionId: "dec-002",
          status: "completed",
          totalActions: 2,
          completedActions: 2,
          failedActions: 0,
          successRate: 100,
        },
      ],
      [
        "dec-003",
        {
          decisionId: "dec-003",
          status: "in_progress",
          totalActions: 1,
          completedActions: 0,
          failedActions: 0,
          successRate: 0,
        },
      ],
    ]);

    const mockPolicyMetrics: PolicyMetric[] = [
      {
        policyId: "emergency_broadcast",
        totalDecisions: 12,
        successRate: 99.8,
        avgAutonomy: 95,
        lastTriggered: new Date(Date.now() - 5 * 60000),
      },
      {
        policyId: "content_scheduling",
        totalDecisions: 48,
        successRate: 98.5,
        avgAutonomy: 85,
        lastTriggered: new Date(Date.now() - 15 * 60000),
      },
      {
        policyId: "listener_engagement",
        totalDecisions: 156,
        successRate: 94.2,
        avgAutonomy: 80,
        lastTriggered: new Date(Date.now() - 2 * 60000),
      },
      {
        policyId: "compliance_enforcement",
        totalDecisions: 24,
        successRate: 99.5,
        avgAutonomy: 95,
        lastTriggered: new Date(Date.now() - 30 * 60000),
      },
    ];

    setDecisions(mockDecisions);
    setPropagationStatuses(mockPropagationStatuses);
    setPolicyMetrics(mockPolicyMetrics);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "rolled_back":
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const handleApproveDecision = (decisionId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setDecisions((prev) =>
        prev.map((d) => (d.decisionId === decisionId ? { ...d, status: "completed" as const } : d))
      );
      setIsLoading(false);
    }, 500);
  };

  const handleRejectDecision = (decisionId: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setDecisions((prev) =>
        prev.map((d) =>
          d.decisionId === decisionId ? { ...d, status: "rolled_back" as const } : d
        )
      );
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Admin Decision Dashboard</h1>
              <p className="text-slate-400">Manage QUMUS decisions and monitor system health</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">System Active</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Decisions</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {decisions.filter((d) => d.status === "pending").length}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {(
                      policyMetrics.reduce((sum, p) => sum + p.successRate, 0) /
                      policyMetrics.length
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avg Autonomy</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {(
                      policyMetrics.reduce((sum, p) => sum + p.avgAutonomy, 0) /
                      policyMetrics.length
                    ).toFixed(0)}
                    %
                  </p>
                </div>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Compliance</p>
                  <p className="text-3xl font-bold text-white mt-2">100%</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="queue">Decision Queue</TabsTrigger>
            <TabsTrigger value="propagation">Propagation Status</TabsTrigger>
            <TabsTrigger value="policies">Policy Metrics</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* Decision Queue Tab */}
          <TabsContent value="queue" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Active Decisions</CardTitle>
                <CardDescription>Manage pending and completed decisions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {decisions.map((decision) => (
                    <div
                      key={decision.decisionId}
                      className="p-4 bg-slate-700 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                      onClick={() => setSelectedDecision(decision)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(decision.status)}
                          <div>
                            <h3 className="text-white font-semibold">{decision.description}</h3>
                            <p className="text-slate-400 text-sm">{decision.decisionId}</p>
                          </div>
                        </div>
                        <Badge className={getSeverityColor(decision.severity)}>
                          {decision.severity.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-slate-400">Policy</p>
                          <p className="text-white font-medium">{decision.policyId}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Autonomy</p>
                          <p className="text-white font-medium">{decision.autonomyLevel}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Status</p>
                          <p className="text-white font-medium capitalize">{decision.status}</p>
                        </div>
                      </div>

                      {decision.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveDecision(decision.decisionId);
                            }}
                            disabled={isLoading}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-600 text-red-400 hover:bg-red-600/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRejectDecision(decision.decisionId);
                            }}
                            disabled={isLoading}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Propagation Status Tab */}
          <TabsContent value="propagation" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Propagation Status</CardTitle>
                <CardDescription>Monitor decision propagation across platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from(propagationStatuses.values()).map((status) => (
                    <div key={status.decisionId} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">{status.decisionId}</h3>
                        <Badge
                          className={
                            status.status === "completed"
                              ? "bg-green-600"
                              : "bg-yellow-600"
                          }
                        >
                          {status.status.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Propagation Progress</span>
                          <span className="text-white">
                            {status.completedActions}/{status.totalActions}
                          </span>
                        </div>
                        <div className="w-full bg-slate-600 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${(status.completedActions / status.totalActions) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Success Rate</span>
                          <span className="text-green-400 font-medium">
                            {status.successRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Policy Metrics Tab */}
          <TabsContent value="policies" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Policy Metrics</CardTitle>
                <CardDescription>Performance metrics for each decision policy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policyMetrics.map((metric) => (
                    <div key={metric.policyId} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold capitalize">
                          {metric.policyId.replace(/_/g, " ")}
                        </h3>
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Total Decisions</p>
                          <p className="text-white font-bold text-lg">{metric.totalDecisions}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Success Rate</p>
                          <p className="text-green-400 font-bold text-lg">
                            {metric.successRate.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Avg Autonomy</p>
                          <p className="text-blue-400 font-bold text-lg">{metric.avgAutonomy}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Compliance Tab */}
          <TabsContent value="compliance" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Compliance Status</CardTitle>
                <CardDescription>System compliance and audit trail</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      <div>
                        <h3 className="text-white font-semibold">All Systems Compliant</h3>
                        <p className="text-slate-400 text-sm">
                          100% compliance with all policies and regulations
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-700 rounded-lg">
                    <h3 className="text-white font-semibold mb-3">Recent Audit Events</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>Emergency broadcast compliance check</span>
                        <span className="text-green-400">✓ Passed</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Content scheduling policy enforcement</span>
                        <span className="text-green-400">✓ Passed</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Listener engagement optimization</span>
                        <span className="text-green-400">✓ Passed</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Compliance enforcement verification</span>
                        <span className="text-green-400">✓ Passed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
