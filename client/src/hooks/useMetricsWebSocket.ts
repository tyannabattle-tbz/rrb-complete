import { useEffect, useState, useCallback } from 'react';

export interface SystemMetrics {
  activeTaskCount: number;
  queuedTaskCount: number;
  successRate: number;
  averageExecutionTime: number;
  totalTasksProcessed: number;
  failedTaskCount: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: number;
}

export interface TaskUpdate {
  taskId: string;
  status: string;
  progress: number;
}

export interface CommandUpdate {
  commandId: string;
  target: string;
  status: string;
}

export function useMetricsWebSocket() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [taskUpdates, setTaskUpdates] = useState<Map<string, TaskUpdate>>(new Map());
  const [commandUpdates, setCommandUpdates] = useState<Map<string, CommandUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Determine WebSocket URL based on current location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/api/ws`;

    console.log('[useMetricsWebSocket] Connecting to:', wsUrl);

    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('[useMetricsWebSocket] Connected');
          setIsConnected(true);
          setError(null);

          // Send subscription message
          ws?.send(JSON.stringify({ type: 'subscribe', channel: 'metrics' }));
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);

            switch (message.type) {
              case 'metrics':
                setMetrics(message.data);
                break;
              case 'task_update':
                setTaskUpdates((prev) => {
                  const updated = new Map(prev);
                  updated.set(message.data.taskId, message.data);
                  return updated;
                });
                break;
              case 'command_update':
                setCommandUpdates((prev) => {
                  const updated = new Map(prev);
                  updated.set(message.data.commandId, message.data);
                  return updated;
                });
                break;
            }
          } catch (error) {
            console.error('[useMetricsWebSocket] Failed to parse message:', error);
          }
        };

        ws.onerror = (event) => {
          console.error('[useMetricsWebSocket] WebSocket error:', event);
          setError('WebSocket connection error');
          setIsConnected(false);
        };

        ws.onclose = () => {
          console.log('[useMetricsWebSocket] Disconnected');
          setIsConnected(false);

          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(() => {
            console.log('[useMetricsWebSocket] Attempting to reconnect...');
            connect();
          }, 3000);
        };
      } catch (error) {
        console.error('[useMetricsWebSocket] Connection error:', error);
        setError(String(error));
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const getTaskUpdate = useCallback((taskId: string) => {
    return taskUpdates.get(taskId);
  }, [taskUpdates]);

  const getCommandUpdate = useCallback((commandId: string) => {
    return commandUpdates.get(commandId);
  }, [commandUpdates]);

  return {
    metrics,
    taskUpdates,
    commandUpdates,
    isConnected,
    error,
    getTaskUpdate,
    getCommandUpdate,
  };
}
