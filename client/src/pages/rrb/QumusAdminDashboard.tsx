import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Activity, TrendingUp } from "lucide-react";

/**
 * QUMUS Admin Dashboard Template
 * Customize policies and metrics for your platform
 */
export default function QumusAdminDashboard() {
  const [autonomyLevel, setAutonomyLevel] = useState(90);

  // TODO: Replace with actual policies from your platform
  const policies = [
    {
      id: "policy_1",
      name: "Policy Name",
      autonomy: 95,
      status: "active",
      decisions: 1247,
      successRate: 99.2,
      lastDecision: "2 minutes ago",
    },
    // Add more policies...
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground">QUMUS Admin Dashboard</h1>
          <p className="text-foreground/60 mt-2">
            Autonomous Orchestration Engine - Real-time Monitoring & Control
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">
                System Autonomy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{autonomyLevel}%</div>
              <p className="text-xs text-foreground/60 mt-2">Average across all policies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Active Policies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{policies.length}/{policies.length}</div>
              <p className="text-xs text-foreground/60 mt-2">All policies operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Total Decisions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {policies.reduce((sum, p) => sum + p.decisions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-foreground/60 mt-2">Last 24 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-foreground/70">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">
                {(policies.reduce((sum, p) => sum + p.successRate, 0) / policies.length).toFixed(1)}%
              </div>
              <p className="text-xs text-foreground/60 mt-2">Average success rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Policies</TabsTrigger>
            <TabsTrigger value="decisions">Recent Decisions</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Policies Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Decision Policies Status</CardTitle>
                <CardDescription>
                  {policies.length} autonomous policies operating at 90%+ autonomy
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-foreground">{policy.name}</h4>
                          <Badge variant="outline">{policy.autonomy}% autonomy</Badge>
                          <Badge variant="secondary" className="bg-green-500/10 text-green-600">
                            {policy.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-foreground/60">
                          <div>Decisions: {policy.decisions.toLocaleString()}</div>
                          <div>Success Rate: {policy.successRate}%</div>
                          <div>Last Decision: {policy.lastDecision}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                        <Button variant="outline" size="sm">
                          View Logs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {policies.map((policy) => (
                    <div key={policy.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-foreground">
                          {policy.name}
                        </label>
                        <span className="text-sm font-semibold text-accent">
                          {policy.autonomy}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        defaultValue={policy.autonomy}
                        className="w-full"
                      />
                    </div>
                  ))}
                  <Button className="w-full mt-4">Save Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Policy Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-foreground/60">
                    TODO: Add charts and visualizations for policy performance metrics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
