import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

export interface WebSocketStatusProps {
  isConnected: boolean;
  reconnectAttempts?: number;
  maxReconnectAttempts?: number;
  lastUpdate?: Date;
  showLabel?: boolean;
  showDetails?: boolean;
}

export function WebSocketStatus({
  isConnected,
  reconnectAttempts = 0,
  maxReconnectAttempts = 5,
  lastUpdate,
  showLabel = true,
  showDetails = false,
}: WebSocketStatusProps) {
  const [displayStatus, setDisplayStatus] = useState<"connected" | "disconnected" | "reconnecting">(
    isConnected ? "connected" : "disconnected"
  );

  useEffect(() => {
    if (isConnected) {
      setDisplayStatus("connected");
    } else if (reconnectAttempts > 0 && reconnectAttempts < maxReconnectAttempts) {
      setDisplayStatus("reconnecting");
    } else {
      setDisplayStatus("disconnected");
    }
  }, [isConnected, reconnectAttempts, maxReconnectAttempts]);

  const getStatusColor = () => {
    switch (displayStatus) {
      case "connected":
        return "bg-green-100 text-green-800";
      case "reconnecting":
        return "bg-yellow-100 text-yellow-800";
      case "disconnected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = () => {
    switch (displayStatus) {
      case "connected":
        return <Wifi className="w-4 h-4" />;
      case "reconnecting":
        return <AlertCircle className="w-4 h-4 animate-pulse" />;
      case "disconnected":
        return <WifiOff className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (displayStatus) {
      case "connected":
        return "Connected";
      case "reconnecting":
        return `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`;
      case "disconnected":
        return "Disconnected";
      default:
        return "Unknown";
    }
  };

  const tooltipContent = () => {
    let content = `WebSocket Status: ${getStatusText()}`;
    if (lastUpdate) {
      content += `\nLast Update: ${lastUpdate.toLocaleTimeString()}`;
    }
    if (displayStatus === "reconnecting") {
      content += `\nAttempt ${reconnectAttempts} of ${maxReconnectAttempts}`;
    }
    return content;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor()} flex items-center gap-1.5 cursor-help px-2 py-1`}>
            {getStatusIcon()}
            {showLabel && <span className="text-xs font-medium">{getStatusText()}</span>}
          </Badge>
          {showDetails && displayStatus === "reconnecting" && (
            <span className="text-xs text-gray-600">
              Attempt {reconnectAttempts}/{maxReconnectAttempts}
            </span>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs whitespace-pre-wrap max-w-xs">
        {tooltipContent()}
      </TooltipContent>
    </Tooltip>
  );
}
