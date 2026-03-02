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
  const isConnectingRef = useRef(false);

  // Message queue for offline support
  const messageQueue = useMessageQueue({
    maxQueueSize: 100,
    maxRetries: 3,
    onQueueChanged: (queue) => {
      setQueueSize(queue.length);
    },
  });

  // Send queued messages when connection is restored
  const processQueuedMessages = useCallback(async () => {
    if (!enableMessageQueue || messageQueue.getQueueSize() === 0) {
      return;
    }

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
        } catch (error) {
          console.error("[EnhancedWebSocket] Heartbeat failed:", error);
        }
      }
    }, heartbeatInterval) as any;
  }, [heartbeatInterval]);

  // Disconnect
  const disconnect = useCallback(() => {
    isConnectingRef.current = false;
    
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

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Skip if disabled, invalid sessionId, or already connecting
    if (!enabled || sessionId <= 0 || isConnectingRef.current) {
      return;
    }

    // Guard against duplicate connections
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    isConnectingRef.current = true;

    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        isConnectingRef.current = false;
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
        isConnectingRef.current = false;
        const errorMessage = "WebSocket connection error";
        if (onError) {
          onError(errorMessage);
        }
      };

      ws.onclose = () => {
        isConnectingRef.current = false;
        
        // Only process if this is the current socket
        if (ws !== wsRef.current) {
          return;
        }

        setIsConnected(false);

        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current as any);
          heartbeatTimeoutRef.current = null;
        }

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts < maxReconnectAttempts && enabled) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          setReconnectAttempts((prev) => prev + 1);

          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      isConnectingRef.current = false;
      console.error("[EnhancedWebSocket] Connection failed:", error);
      if (onError) {
        onError("Failed to establish WebSocket connection");
      }
    }
  }, [sessionId, enabled, onStatusChange, onMessage, onToolExecution, onError, setupHeartbeat, processQueuedMessages, reconnectAttempts]);

  // Send message
  const send = useCallback(
    (message: any) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(message));
        setLastUpdate(new Date());
      } else if (enableMessageQueue) {
        messageQueue.enqueue(message, "message");
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
      // Don't disconnect on unmount if still enabled - just cleanup timers
      if (heartbeatTimeoutRef.current) {
        clearInterval(heartbeatTimeoutRef.current as any);
        heartbeatTimeoutRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [sessionId, enabled]); // Only depend on sessionId and enabled

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
