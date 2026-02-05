import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface RealtimeUpdate {
  type: 'policy-decision' | 'metrics-update' | 'compliance-alert' | 'subscription-change';
  decisionId: string;
  userId: string;
  timestamp: number;
  data: Record<string, any>;
}

export function useWebSocket(userId?: string) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [updates, setUpdates] = useState<RealtimeUpdate[]>([]);

  useEffect(() => {
    const socketUrl = process.env.VITE_FRONTEND_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setIsConnected(true);

      // Authenticate if userId provided
      if (userId) {
        newSocket.emit('authenticate', userId);
      }

      // Subscribe to all update types
      newSocket.emit('subscribe-metrics');
      newSocket.emit('subscribe-compliance');
      newSocket.emit('subscribe-policies');
    });

    newSocket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
      setIsConnected(false);
    });

    newSocket.on('policy-decision', (update: RealtimeUpdate) => {
      console.log('[WebSocket] Policy decision received:', update);
      setUpdates(prev => [update, ...prev].slice(0, 100)); // Keep last 100 updates
    });

    newSocket.on('metrics-update', (update: RealtimeUpdate) => {
      console.log('[WebSocket] Metrics update received:', update);
      setUpdates(prev => [update, ...prev].slice(0, 100));
    });

    newSocket.on('compliance-alert', (update: RealtimeUpdate) => {
      console.log('[WebSocket] Compliance alert received:', update);
      setUpdates(prev => [update, ...prev].slice(0, 100));
    });

    newSocket.on('subscription-change', (update: RealtimeUpdate) => {
      console.log('[WebSocket] Subscription change received:', update);
      setUpdates(prev => [update, ...prev].slice(0, 100));
    });

    newSocket.on('error', (error: any) => {
      console.error('[WebSocket] Error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const subscribe = useCallback((channel: 'metrics' | 'compliance' | 'policies') => {
    if (socket) {
      socket.emit(`subscribe-${channel}`);
    }
  }, [socket]);

  const unsubscribe = useCallback((channel: 'metrics' | 'compliance' | 'policies') => {
    if (socket) {
      socket.emit(`unsubscribe-${channel}`);
    }
  }, [socket]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    socket,
    isConnected,
    updates,
    subscribe,
    unsubscribe,
    clearUpdates,
  };
}
