import { useEffect, useRef, useCallback, useState } from "react";
import { useMessageQueue, type QueuedMessage } from "./useMessageQueue";

export interface EnhancedWebSocketOptions {
  sessionId: number;
  onStatusChange?: (status: string) => void;
  onMessage?: (role: string, content: string) => void;
  onToolExecution?: (toolName: string, status: string, result?: any, error?: string) => void;
  onError?: (error: string) => void;
  heartbeatInterval?: number;
  enableMessageQueue?: boolean;
  enabled?: boolean;
}

export function useEnhancedWebSocket(options: EnhancedWebSocketOptions) {
  const {
    sessionId,
    onStatusChange,
    onMessage,
    onToolExecution,
    onError,
    heartbeatInterval = 30000,
    enableMessageQueue = true,
    enabled = true,
  } = options;

  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<Date | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [queueSize, setQueueSize] = useState(0);
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;

  // Message queue for offline support
  const messageQueue = useMessageQueue({
    maxQueueSize: 100,
    maxRetries: 3,
    onQueueChanged: (queue) => {
      setQueueSize(queue.length);
      console.log(`[EnhancedWebSocket] Queue size: ${queue.length}`);
    },
  });

  // Send queued messages when connection is restored
  const processQueuedMessages = useCallback(async () => {
    if (!enableMessageQueue || messageQueue.getQueueSize() === 0) {
      return;
    }

    console.log(`[EnhancedWebSocket] Processing ${messageQueue.getQueueSize()} queued messages`);

    await messageQueue.processQueue(async (message) => {
      return new Promise<void>((resolve, reject) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(JSON.stringify(message.data));
            resolve();
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error("WebSocket not connected"));
        }
      });
    });
  }, [enableMessageQueue, messageQueue]);

  // Setup heartbeat
  const setupHeartbeat = useCallback(() => {
    // Clear existing heartbeat first
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current as any);
      heartbeatTimeoutRef.current = null;
    }

    heartbeatTimeoutRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: "ping" }));
          setLastHeartbeat(new Date());
          console.log("[EnhancedWebSocket] Heartbeat sent");
        } catch (error) {
          console.error("[EnhancedWebSocket] Heartbeat failed:", error);
        }
      }
    }, heartbeatInterval) as any;
  }, [heartbeatInterval]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Skip if disabled or invalid sessionId
    if (!enabled || sessionId <= 0) {
      console.log("[EnhancedWebSocket] Skipping connection: disabled or invalid sessionId");
      return;
    }

    // Guard against duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      console.log("[EnhancedWebSocket] Connection already in progress");
      return;
    }

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;

      console.log(`[EnhancedWebSocket] Attempting connection to ${wsUrl}...`);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[EnhancedWebSocket] Connected successfully");
        setIsConnected(true);
        setLastUpdate(new Date());
        setReconnectAttempts(0);

        // Clear existing heartbeat and setup new one
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current as any);
          heartbeatTimeoutRef.current = null;
        }

        // Subscribe to session updates
        ws.send(
          JSON.stringify({
            type: "subscribe",
            sessionId,
          })
        );

        // Setup heartbeat
        setupHeartbeat();

        // Process queued messages
        processQueuedMessages();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastUpdate(new Date());

          // Handle pong response
          if (data.type === "pong") {
            console.log("[EnhancedWebSocket] Pong received");
            return;
          }

          // Route to appropriate handler
          if (data.type === "status" && onStatusChange) {
            onStatusChange(data.data.status);
          } else if (data.type === "message" && onMessage) {
            onMessage(data.data.role, data.data.content);
          } else if (data.type === "tool_execution" && onToolExecution) {
            onToolExecution(data.data.toolName, data.data.status, data.data.result, data.data.error);
          } else if (data.type === "error" && onError) {
            onError(data.data.error);
          }
        } catch (error) {
          console.error("[EnhancedWebSocket] Failed to parse message:", error);
        }
      };

      ws.onerror = (event) => {
        const errorMessage =
          event instanceof Event
            ? `WebSocket error: ${ws.readyState === WebSocket.CLOSED ? "Connection closed" : "Unknown error"}`
            : `WebSocket error: ${String(event)}`;
        console.error("[EnhancedWebSocket] Error:", errorMessage, event);
        if (onError) {
          onError(errorMessage);
        }
      };

      ws.onclose = () => {
        console.log("[EnhancedWebSocket] Disconnected");
        
        // Only process if this is the current socket
        if (ws !== wsRef.current) {
          console.log("[EnhancedWebSocket] Ignoring close from stale socket");
          return;
        }

        setIsConnected(false);

        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current as any);
          heartbeatTimeoutRef.current = null;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          console.log(
            `[EnhancedWebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`
          );
          setReconnectAttempts((prev) => prev + 1);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else {
          console.error("[EnhancedWebSocket] Max reconnection attempts reached");
          if (onError) {
            onError("WebSocket connection failed after multiple attempts");
          }
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("[EnhancedWebSocket] Connection failed:", error);
      if (onError) {
        onError("Failed to establish WebSocket connection");
      }
    }
  }, [sessionId, enabled, onStatusChange, onMessage, onToolExecution, onError, setupHeartbeat, processQueuedMessages, reconnectAttempts]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current as any);
      heartbeatTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Send message
  const send = useCallback(
    (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        setLastUpdate(new Date());
      } else if (enableMessageQueue) {
        console.log("[EnhancedWebSocket] WebSocket not connected, queuing message");
        messageQueue.enqueue(message, "message");
      } else {
        console.error("[EnhancedWebSocket] WebSocket not connected and message queue disabled");
      }
    },
    [enableMessageQueue, messageQueue]
  );

  // Setup effect - connect on mount and when sessionId changes
  useEffect(() => {
    if (!enabled || sessionId <= 0) {
      disconnect();
      return;
    }

    setReconnectAttempts(0);
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, sessionId, enabled]);

  return {
    isConnected,
    lastUpdate,
    lastHeartbeat,
    send,
    disconnect,
    reconnectAttempts,
    messageQueue,
    queueSize,
  };
}
