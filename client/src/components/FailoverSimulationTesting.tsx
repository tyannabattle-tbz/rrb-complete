import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, CheckCircle, XCircle, Loader, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface SimulationResult {
  id: string;
  timestamp: Date;
  fromRegion: string;
  toRegion: string;
  status: "success" | "partial" | "failed";
  duration: number;
  dataLoss: number;
  affectedSessions: number;
  notes?: string;
}

export function FailoverSimulationTesting() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  const { data: regions } = trpc.infrastructurePlatform.getAllRegions.useQuery();
  const { data: failoverEvents } = trpc.infrastructurePlatform.getAllFailoverEvents.useQuery({ limit: 50 });
  const { data: stats } = trpc.infrastructurePlatform.getFailoverStatistics.useQuery();
  const { data: recommendations } = trpc.infrastructurePlatform.generateFailoverRecommendations.useQuery();

  const triggerFailoverMutation = trpc.infrastructurePlatform.triggerFailover.useMutation({
    onSuccess: (result) => {
      setIsSimulating(false);
      if (result) {
        const simulation: SimulationResult = {
          id: result.id,
          timestamp: new Date(result.timestamp),
          fromRegion: result.fromRegion,
          toRegion: result.toRegion,
          status: result.status as any,
          duration: result.duration,
          dataLoss: result.dataLoss,
          affectedSessions: result.affectedSessions,
          notes: result.reason,
        };
        setSimulationResults([simulation, ...simulationResults]);
      }
    },
  });

  const handleSimulateFailover = async () => {
    if (!selectedRegion) return;
    setIsSimulating(true);
    await triggerFailoverMutation.mutateAsync({
      fromRegionId: selectedRegion,
      reason: "simulation",
      description: "Failover simulation test",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "partial":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: "default",
      failed: "destructive",
      partial: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 border-green-300";
      case "degraded":
        return "bg-yellow-100 border-yellow-300";
      case "unhealthy":
        return "bg-red-100 border-red-300";
      default:
        return "bg-gray-100 border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Failover Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Failovers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFailovers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalFailovers ? (((stats.successfulFailovers || 0) / stats.totalFailovers) * 100).toFixed(1) : 0}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Failover Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageFailoverTime?.toFixed(1) || 0}s</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Data Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageDataLoss?.toFixed(1) || 0}s</div>
          </CardContent>
        </Card>
      </div>

      {/* Region Status */}
      <Card>
        <CardHeader>
          <CardTitle>Region Status</CardTitle>
          <CardDescription>Current health and configuration of all regions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regions?.map((region: any) => (
              <div key={region.id} className={`p-4 border-2 rounded-lg ${getHealthColor(region.healthStatus)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    <div>
                      <h4 className="font-medium">{region.name}</h4>
                      <p className="text-xs text-muted-foreground">{region.location}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {region.isPrimary && <Badge>Primary</Badge>}
                    {region.isActive && <Badge variant="outline">Active</Badge>}
                  </div>
                </div>
                <div className="space-y-1 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="font-medium">{region.latency?.toFixed(1) || 0}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Error Rate</span>
                    <span className="font-medium">{region.errorRate?.toFixed(2) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="font-medium">{region.capacity?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Traffic</span>
                    <span className="font-medium">{region.trafficPercentage || 0}%</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => setSelectedRegion(region.id)}
                  disabled={!region.isActive}
                >
                  Simulate Failover
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Control */}
      {selectedRegion && (
        <Card className="border-blue-500 border-2">
          <CardHeader>
            <CardTitle>Failover Simulation</CardTitle>
            <CardDescription>
              Simulate failover from {regions?.find((r: any) => r.id === selectedRegion)?.name} to test recovery procedures
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                This will simulate a failover from the selected region. No actual traffic will be rerouted. The simulation will test recovery procedures and measure failover metrics.
              </p>
            </div>
            <Button onClick={handleSimulateFailover} disabled={isSimulating} className="w-full" size="lg">
              {isSimulating ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Simulating Failover...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Failover Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Simulation Results */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Results</CardTitle>
          <CardDescription>Recent failover simulations and their outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {simulationResults.length === 0 && failoverEvents?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No simulations yet</div>
            ) : (
              [...simulationResults, ...(failoverEvents || [])].slice(0, 20).map((result: any) => (
                <div key={result.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {result.fromRegion} → {result.toRegion}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </p>
                      {result.notes && <p className="text-xs text-muted-foreground mt-1">{result.notes}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-xs text-muted-foreground">
                      <div>Duration: {result.duration}s</div>
                      <div>Data Loss: {result.dataLoss}s</div>
                      <div>Sessions: {result.affectedSessions}</div>
                    </div>
                    {getStatusBadge(result.status)}
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
          <CardTitle>Failover Recommendations</CardTitle>
          <CardDescription>AI-powered suggestions to improve failover resilience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="text-sm whitespace-pre-wrap text-muted-foreground">{recommendations}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
