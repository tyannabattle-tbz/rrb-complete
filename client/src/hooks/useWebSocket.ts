import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './useAuth';

export interface WSMessage {
  type: 'policy_decision' | 'task_update' | 'metrics_update' | 'subscription_change' | 'error';
  data: any;
  timestamp: number;
  userId?: number;
}

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { autoConnect = true, reconnectAttempts = 5, reconnectDelay = 3000 } = options;
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user) return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/api/ws?userId=${user.id}&sessionId=${Date.now()}`;

      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        setError(null);
        reconnectCount.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);
          setLastMessage(message);
          console.log('[WebSocket] Message received:', message.type);
        } catch (error) {
          console.error('[WebSocket] Message parse error:', error);
        }
      };

      ws.current.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        setError('WebSocket error occurred');
      };

      ws.current.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);

        // Attempt reconnection
        if (reconnectCount.current < reconnectAttempts) {
          reconnectCount.current++;
          reconnectTimer.current = setTimeout(() => {
            console.log(`[WebSocket] Reconnecting (attempt ${reconnectCount.current}/${reconnectAttempts})`);
            connect();
          }, reconnectDelay);
        } else {
          setError('Failed to connect after multiple attempts');
        }
      };
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setError('Failed to establish WebSocket connection');
    }
  }, [user, reconnectAttempts, reconnectDelay]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    setIsConnected(false);
  }, []);

  // Send message through WebSocket
  const send = useCallback((message: Omit<WSMessage, 'timestamp'>) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ ...message, timestamp: Date.now() }));
    } else {
      console.warn('[WebSocket] Not connected, cannot send message');
    }
  }, []);

  // Send ping/heartbeat
  const ping = useCallback(() => {
    send({ type: 'subscription_change', data: { type: 'ping' } });
  }, [send]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, user, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    error,
    send,
    ping,
    connect,
    disconnect,
  };
}

/**
 * Hook for listening to specific message types
 */
export function useWebSocketListener(
  messageType: WSMessage['type'],
  callback: (data: any) => void
) {
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage && lastMessage.type === messageType) {
      callback(lastMessage.data);
    }
  }, [lastMessage, messageType, callback]);
}

/**
 * Hook for policy decision updates
 */
export function usePolicyDecisions(callback: (decision: any) => void) {
  useWebSocketListener('policy_decision', callback);
}

/**
 * Hook for task updates
 */
export function useTaskUpdates(callback: (update: any) => void) {
  useWebSocketListener('task_update', callback);
}

/**
 * Hook for metrics updates
 */
export function useMetricsUpdates(callback: (metrics: any) => void) {
  useWebSocketListener('metrics_update', callback);
}

/**
 * Hook for subscription changes
 */
export function useSubscriptionUpdates(callback: (subscription: any) => void) {
  useWebSocketListener('subscription_change', callback);
}
