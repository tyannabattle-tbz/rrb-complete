import { useEffect, useRef, useState, useCallback } from "react";

export interface WebSocketMessage {
  type: "notification" | "version_update" | "filter_update" | "heartbeat";
  data: any;
  timestamp: number;
}

export interface UseWebSocketSyncOptions {
  userId: number;
  sessionId?: number;
  channels?: string[];
  onNotification?: (notification: any) => void;
  onVersionUpdate?: (update: any) => void;
  onFilterUpdate?: (filter: any) => void;
}

export function useWebSocketSync(options: UseWebSocketSyncOptions) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

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
        setReconnectAttempts(0);

        // Subscribe to channels
        ws.send(
          JSON.stringify({
            type: "subscribe",
            userId: options.userId,
            sessionId: options.sessionId,
            channels: options.channels || ["notification", "version_update", "filter_update"],
          })
        );

        // Start heartbeat
        heartbeatIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "heartbeat" }));
          }
        }, 30000) as unknown as NodeJS.Timeout;
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);

          switch (message.type) {
            case "notification":
              options.onNotification?.(message.data);
              break;
            case "version_update":
              options.onVersionUpdate?.(message.data);
              break;
            case "filter_update":
              options.onFilterUpdate?.(message.data);
              break;
          }
        } catch (error) {
          console.error("[WebSocket] Failed to parse message:", error);
        }
      };

      ws.onclose = () => {
        console.log("[WebSocket] Disconnected");
        setIsConnected(false);
        if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);

        // Attempt reconnection with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1);
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error("[WebSocket] Error:", error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[WebSocket] Connection failed:", error);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
  }, []);

  const send = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    reconnectAttempts,
    send,
    disconnect,
  };
}
