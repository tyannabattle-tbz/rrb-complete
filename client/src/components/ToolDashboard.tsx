import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ToolExecution {
  id: number;
  toolName: string;
  status: "pending" | "running" | "completed" | "failed" | null;
  parameters?: string | null;
  result?: string | null;
  error?: string | null;
  duration?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ToolDashboardProps {
  executions: ToolExecution[];
  isLoading?: boolean;
}

export default function ToolDashboard({
  executions,
  isLoading,
}: ToolDashboardProps) {
  const activeTools = executions.filter((e) => e.status === "running");
  const completedTools = executions.filter((e) => e.status === "completed");
  const failedTools = executions.filter((e) => e.status === "failed");

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case "running":
        return <Loader2 size={16} className="animate-spin text-info" />;
      case "completed":
        return <CheckCircle size={16} className="text-success" />;
      case "failed":
        return <AlertCircle size={16} className="text-error" />;
      case "pending":
        return <Clock size={16} className="text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "running":
        return <Badge className="bg-info/10 text-info">Running</Badge>;
      case "completed":
        return <Badge className="bg-success/10 text-success">Completed</Badge>;
      case "failed":
        return <Badge className="bg-error/10 text-error">Failed</Badge>;
      case "pending":
        return <Badge className="bg-warning/10 text-warning">Pending</Badge>;
      default:
        return null;
    }
  };

  const ToolCard = ({ execution }: { execution: ToolExecution }) => (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(execution.status)}
          <h3 className="font-medium text-foreground">{execution.toolName}</h3>
        </div>
        {getStatusBadge(execution.status)}
      </div>

      {execution.parameters && (
        <div className="mb-3 p-2 bg-muted/20 rounded text-xs font-mono text-muted-foreground overflow-auto max-h-20">
          <p className="font-semibold mb-1">Parameters:</p>
          <pre>{JSON.stringify(JSON.parse(execution.parameters || ""), null, 2)}</pre>
        </div>
      )}

      {execution.result && (
        <div className="mb-3 p-2 bg-success/5 rounded text-xs font-mono text-success overflow-auto max-h-20">
          <p className="font-semibold mb-1">Result:</p>
          <pre>{JSON.stringify(JSON.parse(execution.result || ""), null, 2)}</pre>
        </div>
      )}

      {execution.error && (
        <div className="mb-3 p-2 bg-error/5 rounded text-xs font-mono text-error overflow-auto max-h-20">
          <p className="font-semibold mb-1">Error:</p>
          <pre>{execution.error}</pre>
        </div>
      )}

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{execution.createdAt.toLocaleTimeString()}</span>
        {execution.duration && (
          <span>{(execution.duration / 1000).toFixed(2)}s</span>
        )}
      </div>
    </Card>
  );

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Tool Execution Monitor</h2>

      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="active" className="relative">
            Active
            {activeTools.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-info text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeTools.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed
            {completedTools.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-success text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {completedTools.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="failed">
            Failed
            {failedTools.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {failedTools.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-y-auto scrollbar-elegant">
          <TabsContent value="active" className="space-y-3">
            {activeTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active tools
              </div>
            ) : (
              activeTools.map((execution) => (
                <ToolCard key={execution.id} execution={execution} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed tools
              </div>
            ) : (
              completedTools.map((execution) => (
                <ToolCard key={execution.id} execution={execution} />
              ))
            )}
          </TabsContent>

          <TabsContent value="failed" className="space-y-3">
            {failedTools.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No failed tools
              </div>
            ) : (
              failedTools.map((execution) => (
                <ToolCard key={execution.id} execution={execution} />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-3">
            {executions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tool executions yet
              </div>
            ) : (
              executions.map((execution) => (
                <ToolCard key={execution.id} execution={execution} />
              ))
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
