import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Zap, CheckCircle, AlertCircle, Clock } from "lucide-react";

export type AgentStatus = "idle" | "reasoning" | "executing" | "completed" | "error";

interface AgentStatusIndicatorProps {
  status: AgentStatus;
  lastUpdate?: Date;
  messageCount?: number;
  toolExecutions?: number;
}

export default function AgentStatusIndicator({
  status,
  lastUpdate,
  messageCount = 0,
  toolExecutions = 0,
}: AgentStatusIndicatorProps) {
  const [displayTime, setDisplayTime] = useState<string>("");

  useEffect(() => {
    if (!lastUpdate) return;

    const updateTime = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdate.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        setDisplayTime(`${hours}h ago`);
      } else if (minutes > 0) {
        setDisplayTime(`${minutes}m ago`);
      } else if (seconds > 0) {
        setDisplayTime(`${seconds}s ago`);
      } else {
        setDisplayTime("Just now");
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  const getStatusConfig = (status: AgentStatus) => {
    switch (status) {
      case "idle":
        return {
          icon: <CheckCircle size={20} className="text-success" />,
          label: "Idle",
          color: "bg-success/10 border-success/20",
          textColor: "text-success",
          description: "Agent is ready",
        };
      case "reasoning":
        return {
          icon: <Loader2 size={20} className="animate-spin text-info" />,
          label: "Reasoning",
          color: "bg-info/10 border-info/20",
          textColor: "text-info",
          description: "Agent is thinking...",
        };
      case "executing":
        return {
          icon: <Zap size={20} className="text-warning animate-pulse" />,
          label: "Executing",
          color: "bg-warning/10 border-warning/20",
          textColor: "text-warning",
          description: "Agent is executing tools...",
        };
      case "completed":
        return {
          icon: <CheckCircle size={20} className="text-success" />,
          label: "Completed",
          color: "bg-success/10 border-success/20",
          textColor: "text-success",
          description: "Task completed",
        };
      case "error":
        return {
          icon: <AlertCircle size={20} className="text-error" />,
          label: "Error",
          color: "bg-error/10 border-error/20",
          textColor: "text-error",
          description: "An error occurred",
        };
      default:
        return {
          icon: <Clock size={20} className="text-muted-foreground" />,
          label: "Unknown",
          color: "bg-muted/10 border-muted/20",
          textColor: "text-muted-foreground",
          description: "Unknown status",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Card className={`p-4 border ${config.color}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {config.icon}
          <div>
            <p className={`font-semibold ${config.textColor}`}>{config.label}</p>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Status Details */}
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="bg-background/50 p-2 rounded">
          <p className="text-xs text-muted-foreground">Messages</p>
          <p className="font-semibold">{messageCount}</p>
        </div>
        <div className="bg-background/50 p-2 rounded">
          <p className="text-xs text-muted-foreground">Tools Used</p>
          <p className="font-semibold">{toolExecutions}</p>
        </div>
        <div className="bg-background/50 p-2 rounded">
          <p className="text-xs text-muted-foreground">Last Update</p>
          <p className="font-semibold text-xs">{displayTime || "N/A"}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mt-3">
        <Badge className={config.textColor + " bg-transparent border"}>{config.label}</Badge>
      </div>
    </Card>
  );
}
