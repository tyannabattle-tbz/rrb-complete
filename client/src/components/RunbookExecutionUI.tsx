import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Play, Clock, CheckCircle, XCircle, Loader } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface RunbookExecution {
  id: string;
  taskId: string;
  status: "pending" | "running" | "success" | "failed";
  startTime: Date;
  endTime?: Date;
  duration?: number;
  output?: string;
  error?: string;
}

export function RunbookExecutionUI() {
  const [selectedRunbook, setSelectedRunbook] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, string>>({});
  const [executions, setExecutions] = useState<RunbookExecution[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const { data: runbooks } = trpc.infrastructurePlatform.getAllRunbooks.useQuery();
  const { data: executionHistory } = trpc.infrastructurePlatform.getAllExecutions.useQuery({ limit: 50 });
  const { data: stats } = trpc.infrastructurePlatform.getExecutionStatistics.useQuery();

  const executeRunbookMutation = trpc.infrastructurePlatform.executeRunbook.useMutation({
    onSuccess: (result) => {
      setIsExecuting(false);
      const execution: RunbookExecution = {
        id: result.id || `exec-${Date.now()}`,
        taskId: selectedRunbook || "",
        status: result.status as any,
        startTime: new Date(result.startTime || Date.now()),
        endTime: result.endTime ? new Date(result.endTime) : undefined,
        duration: result.duration,
        output: result.output,
        error: result.error,
      };
      setExecutions([execution, ...executions]);
    },
  });

  const handleExecute = async () => {
    if (!selectedRunbook) return;
    setIsExecuting(true);
    await executeRunbookMutation.mutateAsync({
      taskId: selectedRunbook,
      params,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: "default",
      failed: "destructive",
      running: "secondary",
      pending: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Execution Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalExecutions || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.successRate?.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageDuration?.toFixed(1) || 0}s</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failedExecutions || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Runbook Execution */}
      <Card>
        <CardHeader>
          <CardTitle>Execute Runbook</CardTitle>
          <CardDescription>Select and execute a runbook with custom parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Runbook</label>
            <select
              value={selectedRunbook || ""}
              onChange={(e) => {
                setSelectedRunbook(e.target.value);
                setParams({});
              }}
              className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Choose a runbook...</option>
              {runbooks?.map((rb: any) => (
                <option key={rb.id} value={rb.id}>
                  {rb.name} - {rb.description}
                </option>
              ))}
            </select>
          </div>

          {selectedRunbook && runbooks && (
            <>
              {runbooks
                .find((rb: any) => rb.id === selectedRunbook)
                ?.requiredParams?.map((param: string) => (
                  <div key={param}>
                    <label className="text-sm font-medium">{param}</label>
                    <Input
                      value={params[param] || ""}
                      onChange={(e) => setParams({ ...params, [param]: e.target.value })}
                      placeholder={`Enter ${param}`}
                      className="mt-1"
                    />
                  </div>
                ))}

              <Button onClick={handleExecute} disabled={isExecuting} className="w-full">
                {isExecuting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Execute Runbook
                  </>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Execution History</CardTitle>
          <CardDescription>Recent runbook executions and their results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {executions.length === 0 && executionHistory?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No executions yet</div>
            ) : (
              [...executions, ...(executionHistory || [])].slice(0, 20).map((exec: any) => (
                <div key={exec.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(exec.status)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{exec.taskName || exec.taskId}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(exec.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {exec.duration && <span className="text-xs text-muted-foreground">{exec.duration}s</span>}
                    {getStatusBadge(exec.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Runbook Library */}
      <Card>
        <CardHeader>
          <CardTitle>Runbook Library</CardTitle>
          <CardDescription>Available runbooks and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {runbooks?.map((rb: any) => (
              <div key={rb.id} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{rb.name}</h4>
                    <p className="text-sm text-muted-foreground">{rb.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{rb.language}</Badge>
                      <Badge variant="outline">Timeout: {rb.timeout}s</Badge>
                      <Badge variant="outline">Retries: {rb.retryCount}</Badge>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedRunbook(rb.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Execute
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
