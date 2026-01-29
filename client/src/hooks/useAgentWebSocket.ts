import { useEffect, useRef, useCallback, useState } from "react";

export interface AgentStatusUpdate {
  type: "status" | "message" | "tool_execution" | "error";
  sessionId: number;
  data: any;
  timestamp: string;
}

export interface UseAgentWebSocketOptions {
  sessionId: number;
  onStatusChange?: (status: string) => void;
  onMessage?: (role: string, content: string) => void;
  onToolExecution?: (toolName: string, status: string, result?: any, error?: string) => void;
  onError?: (error: string) => void;
}

export function useAgentWebSocket(options: UseAgentWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<AgentStatusUpdate | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);

        // Subscribe to session updates
        ws.send(JSON.stringify({
          type: "subscribe",
          sessionId: options.sessionId,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const update: AgentStatusUpdate = JSON.parse(event.data);
          setLastUpdate(update);

          // Route to appropriate handler
          if (update.type === "status" && options.onStatusChange) {
            options.onStatusChange(update.data.status);
          } else if (update.type === "message" && options.onMessage) {
            options.onMessage(update.data.role, update.data.content);
          } else if (update.type === "tool_execution" && options.onToolExecution) {
            options.onToolExecution(
              update.data.toolName,
              update.data.status,
              update.data.result,
              update.data.error
            );
          } else if (update.type === "error" && options.onError) {
            options.onError(update.data.error);
          }
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
        if (options.onError) {
          options.onError("WebSocket connection error");
        }
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
      if (options.onError) {
        options.onError("Failed to establish WebSocket connection");
      }
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const send = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const ping = useCallback(() => {
    send({ type: "ping" });
  }, [send]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, options.sessionId]);

  return {
    isConnected,
    lastUpdate,
    send,
    ping,
    disconnect,
  };
}
