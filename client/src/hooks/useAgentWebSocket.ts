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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;
      
      console.log(`[WebSocket] Attempting connection to ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WebSocket] Connected successfully");
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;

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

      ws.onerror = (event) => {
        const errorMessage = event instanceof Event 
          ? `WebSocket error: ${ws.readyState === WebSocket.CLOSED ? "Connection closed" : "Unknown error"}`
          : `WebSocket error: ${String(event)}`;
        console.error("[WebSocket] Error:", errorMessage, event);
        if (options.onError) {
          options.onError(errorMessage);
        }
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          reconnectAttemptsRef.current += 1;
          
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("[WebSocket] Max reconnection attempts reached");
          if (options.onError) {
            options.onError("WebSocket connection failed after multiple attempts");
          }
        }
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
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
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
    reconnectAttemptsRef.current = 0;
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
    reconnectAttempts: reconnectAttemptsRef.current,
  };
}
